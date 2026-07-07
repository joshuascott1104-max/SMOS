// Weekly Top 10 bulk import — Sales Managers/Admins receive each BDM's
// weekly Top 10 as a spreadsheet and bulk-import it, rather than each BDM
// entering opportunities into SMOS one by one. This module is the pure
// (no I/O) parsing/validation layer shared by the server-side import action.

import { startOfWeek } from "@/lib/format"

export const TOP10_TEMPLATE_HEADERS = [
  "Week commencing",
  "BDM name",
  "Prospect name",
  "Current provider",
  "Estimated monthly revenue",
  "Estimated monthly GP",
  "Probability %",
  "Stage",
  "Last action",
  "Next action",
  "Next action date",
  "Manager notes",
] as const

export const TOP10_TEMPLATE_SAMPLE_ROW = [
  startOfWeek(),
  "Josh Scott",
  "Acme Logistics Ltd",
  "DHL",
  "8000",
  "1200",
  "60",
  "Appointment Booked",
  "Sent proposal pack",
  "Follow-up call to confirm pricing",
  "",
  "Strong interest — competitor contract renewal due next month",
]

type CanonicalField =
  | "weekCommencing"
  | "bdmName"
  | "prospectName"
  | "currentProvider"
  | "estimatedMonthlyRevenue"
  | "estimatedMonthlyGp"
  | "probability"
  | "stage"
  | "lastAction"
  | "nextAction"
  | "nextActionDate"
  | "managerNotes"

const CANONICAL_HEADER: Record<CanonicalField, (typeof TOP10_TEMPLATE_HEADERS)[number]> = {
  weekCommencing: "Week commencing",
  bdmName: "BDM name",
  prospectName: "Prospect name",
  currentProvider: "Current provider",
  estimatedMonthlyRevenue: "Estimated monthly revenue",
  estimatedMonthlyGp: "Estimated monthly GP",
  probability: "Probability %",
  stage: "Stage",
  lastAction: "Last action",
  nextAction: "Next action",
  nextActionDate: "Next action date",
  managerNotes: "Manager notes",
}

const HEADER_ALIASES: Record<CanonicalField, string[]> = {
  weekCommencing: ["week commencing", "week", "wc"],
  bdmName: ["bdm name", "bdm", "rep name", "rep", "sales rep", "salesperson"],
  prospectName: ["prospect name", "prospect", "company name", "company", "account"],
  currentProvider: ["current provider", "provider", "current supplier", "incumbent"],
  estimatedMonthlyRevenue: ["estimated monthly revenue", "monthly revenue", "revenue", "est monthly revenue"],
  estimatedMonthlyGp: ["estimated monthly gp", "monthly gp", "gp", "est monthly gp", "estimated gp"],
  probability: ["probability %", "probability", "probability%", "prob %", "prob"],
  stage: ["stage"],
  lastAction: ["last action", "last activity"],
  nextAction: ["next action", "next step"],
  nextActionDate: ["next action date", "next action due", "next step date"],
  managerNotes: ["manager notes", "notes", "manager note"],
}

const STAGE_ALIASES: Record<string, string> = {
  "data received": "data_received",
  "data_received": "data_received",
  quoted: "quoted",
  trial: "trial",
  "appointment booked": "appointment_booked",
  "appointment_booked": "appointment_booked",
  negotiation: "negotiation",
  "closed won": "closed_won",
  "closed_won": "closed_won",
  won: "closed_won",
  "closed lost": "closed_lost",
  "closed_lost": "closed_lost",
  lost: "closed_lost",
}

export function normalizeHeaderKey(header: string): string {
  return header.trim().toLowerCase().replace(/[^a-z0-9%]+/g, " ").trim()
}

export function findMissingHeaders(headers: string[]): string[] {
  const normalized = headers.map(normalizeHeaderKey)
  const missing: string[] = []
  for (const [field, aliases] of Object.entries(HEADER_ALIASES) as [CanonicalField, string[]][]) {
    const found = aliases.some((alias) => normalized.includes(alias))
    if (!found) missing.push(CANONICAL_HEADER[field])
  }
  return missing
}

function resolveField(raw: Record<string, string>, field: CanonicalField): string {
  const aliases = HEADER_ALIASES[field]
  for (const [rawKey, value] of Object.entries(raw)) {
    if (aliases.includes(normalizeHeaderKey(rawKey))) return (value ?? "").trim()
  }
  return ""
}

export function normalizeStage(input: string): string | null {
  const key = input.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ")
  return STAGE_ALIASES[key] ?? null
}

export function parseFlexibleNumber(input: string): number | null {
  const cleaned = input.replace(/[£$,%\s]/g, "")
  if (cleaned === "") return null
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : null
}

export function parseFlexibleDate(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed)
  if (iso) return trimmed.slice(0, 10)

  const uk = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(trimmed)
  if (uk) {
    const [, d, m, y] = uk
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
  }

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)

  return null
}

export type Top10ValidatedRow = {
  rowNumber: number
  weekCommencing: string | null
  weekCommencingRaw: string
  repId: string | null
  bdmNameInput: string
  companyName: string
  currentProvider: string | null
  estimatedMonthlyRevenue: number | null
  estimatedMonthlyGp: number | null
  probability: number | null
  stage: string | null
  stageRaw: string
  lastAction: string | null
  nextAction: string | null
  nextActionDate: string | null
  managerNotes: string | null
  errors: string[]
}

export type RepLookup = { id: string; full_name: string; status: string }

export function validateTop10Rows(
  rawRows: Record<string, string>[],
  reps: RepLookup[],
  existingManualActiveCounts: Record<string, number> = {}
): Top10ValidatedRow[] {
  const rows: Top10ValidatedRow[] = rawRows.map((raw, idx) => {
    const errors: string[] = []

    const weekRaw = resolveField(raw, "weekCommencing")
    const weekParsed = weekRaw ? parseFlexibleDate(weekRaw) : null
    const weekCommencing = weekParsed ? startOfWeek(new Date(weekParsed)) : null
    if (!weekRaw) errors.push("Week commencing is required")
    else if (!weekParsed) errors.push(`Could not parse date "${weekRaw}"`)

    const bdmNameInput = resolveField(raw, "bdmName")
    let repId: string | null = null
    if (!bdmNameInput) {
      errors.push("BDM name is required")
    } else {
      const match = reps.find((r) => r.full_name.trim().toLowerCase() === bdmNameInput.toLowerCase())
      if (!match) errors.push(`Unknown BDM "${bdmNameInput}" — name must match a rep exactly`)
      else if (match.status !== "active") errors.push(`Rep "${match.full_name}" is inactive`)
      else repId = match.id
    }

    const companyName = resolveField(raw, "prospectName")
    if (!companyName) errors.push("Prospect name is required")

    const revenueRaw = resolveField(raw, "estimatedMonthlyRevenue")
    const estimatedMonthlyRevenue = revenueRaw ? parseFlexibleNumber(revenueRaw) : null
    if (!revenueRaw) errors.push("Estimated monthly revenue is required")
    else if (estimatedMonthlyRevenue === null || estimatedMonthlyRevenue < 0)
      errors.push(`Invalid estimated monthly revenue "${revenueRaw}"`)

    const gpRaw = resolveField(raw, "estimatedMonthlyGp")
    const estimatedMonthlyGp = gpRaw ? parseFlexibleNumber(gpRaw) : null
    if (gpRaw && (estimatedMonthlyGp === null || estimatedMonthlyGp < 0))
      errors.push(`Invalid estimated monthly GP "${gpRaw}"`)

    const probRaw = resolveField(raw, "probability")
    const probability = probRaw ? parseFlexibleNumber(probRaw) : null
    if (!probRaw) errors.push("Probability % is required")
    else if (probability === null || probability < 0 || probability > 100)
      errors.push(`Probability must be 0-100, got "${probRaw}"`)

    const stageRaw = resolveField(raw, "stage")
    const stage = stageRaw ? normalizeStage(stageRaw) : null
    if (!stageRaw) errors.push("Stage is required")
    else if (!stage)
      errors.push(`Unrecognized stage "${stageRaw}" (expected e.g. Data Received, Quoted, Trial, Appointment Booked, Negotiation, Closed Won, Closed Lost)`)

    const nextActionDateRaw = resolveField(raw, "nextActionDate")
    const nextActionDate = nextActionDateRaw ? parseFlexibleDate(nextActionDateRaw) : null
    if (nextActionDateRaw && !nextActionDate) errors.push(`Could not parse next action date "${nextActionDateRaw}"`)

    return {
      rowNumber: idx + 2,
      weekCommencing,
      weekCommencingRaw: weekRaw,
      repId,
      bdmNameInput,
      companyName,
      currentProvider: resolveField(raw, "currentProvider") || null,
      estimatedMonthlyRevenue,
      estimatedMonthlyGp,
      probability,
      stage,
      stageRaw,
      lastAction: resolveField(raw, "lastAction") || null,
      nextAction: resolveField(raw, "nextAction") || null,
      nextActionDate,
      managerNotes: resolveField(raw, "managerNotes") || null,
      errors,
    }
  })

  const seen = new Map<string, number>()
  for (const row of rows) {
    if (!row.repId || !row.companyName || !row.weekCommencing) continue
    const key = `${row.repId}|${row.companyName.trim().toLowerCase()}|${row.weekCommencing}`
    const firstRow = seen.get(key)
    if (firstRow === undefined) {
      seen.set(key, row.rowNumber)
    } else {
      row.errors.push(`Duplicate of row ${firstRow} (same BDM + Prospect + Week commencing)`)
    }
  }

  const activeCountByRep = new Map<string, number>()
  for (const row of rows) {
    if (!row.repId || row.errors.length > 0) continue
    const baseline = activeCountByRep.get(row.repId) ?? existingManualActiveCounts[row.repId] ?? 0
    const newCount = baseline + 1
    activeCountByRep.set(row.repId, newCount)
    if (newCount > 10) {
      row.errors.push(
        "Importing this row would exceed the 10 active opportunity Top 10 limit for this BDM (including any manually-added opportunities already active)"
      )
    }
  }

  return rows
}
