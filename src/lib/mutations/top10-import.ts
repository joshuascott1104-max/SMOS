"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireCurrentUser } from "@/lib/auth"
import { parseSpreadsheetFile } from "@/lib/top10-import-parse"
import { validateTop10Rows, findMissingHeaders, type Top10ValidatedRow } from "@/lib/top10-import"

function assertCanBulkImportTop10(role: string) {
  if (role !== "sales_manager" && role !== "admin") {
    throw new Error("Only Sales Managers and Admins can bulk import the Weekly Top 10.")
  }
}

export type ValidateTop10Result = {
  rows: Top10ValidatedRow[]
  missingHeaders: string[]
}

export async function validateTop10File(formData: FormData): Promise<ValidateTop10Result> {
  const user = await requireCurrentUser()
  assertCanBulkImportTop10(user.role)

  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file was uploaded.")
  }

  const { headers, rows: rawRows } = await parseSpreadsheetFile(file)

  const missingHeaders = findMissingHeaders(headers)
  if (missingHeaders.length > 0) {
    return { rows: [], missingHeaders }
  }

  if (rawRows.length === 0) {
    throw new Error("The file has no data rows.")
  }

  const supabase = await createClient()
  const { data: reps } = await supabase.from("reps").select("id, full_name, status")

  const repIds = (reps ?? []).map((r) => r.id)
  const { data: manualActives } = await supabase
    .from("strategic_opportunities")
    .select("rep_id")
    .in("rep_id", repIds)
    .eq("status", "active")
    .is("week_commencing", null)

  const existingManualActiveCounts: Record<string, number> = {}
  for (const row of manualActives ?? []) {
    existingManualActiveCounts[row.rep_id] = (existingManualActiveCounts[row.rep_id] ?? 0) + 1
  }

  const rows = validateTop10Rows(rawRows, reps ?? [], existingManualActiveCounts)

  return { rows, missingHeaders: [] }
}

export type ConfirmTop10Result = {
  inserted: number
  updated: number
  archived: number
}

export async function confirmTop10Import(rows: Top10ValidatedRow[]): Promise<ConfirmTop10Result> {
  const user = await requireCurrentUser()
  assertCanBulkImportTop10(user.role)

  if (rows.length === 0) throw new Error("No rows to import.")
  if (rows.some((r) => r.errors.length > 0)) {
    throw new Error("Cannot import while validation errors remain — fix the file and re-upload.")
  }

  const supabase = await createClient()

  const repIds = [...new Set(rows.map((r) => r.repId!))]
  const { data: repsData, error: repsError } = await supabase
    .from("reps")
    .select("id, depot_id")
    .in("id", repIds)
  if (repsError) throw new Error(repsError.message)

  const depotByRep = new Map((repsData ?? []).map((r) => [r.id, r.depot_id]))

  const weeksByRep = new Map<string, Set<string>>()
  for (const row of rows) {
    const set = weeksByRep.get(row.repId!) ?? new Set<string>()
    set.add(row.weekCommencing!)
    weeksByRep.set(row.repId!, set)
  }

  let archived = 0
  for (const [repId, weeks] of weeksByRep) {
    const { data: staleRows, error: staleError } = await supabase
      .from("strategic_opportunities")
      .select("id, week_commencing")
      .eq("rep_id", repId)
      .eq("status", "active")
      .not("week_commencing", "is", null)
    if (staleError) throw new Error(staleError.message)

    const toArchive = (staleRows ?? []).filter((r) => !weeks.has(r.week_commencing!))
    if (toArchive.length > 0) {
      const { error } = await supabase
        .from("strategic_opportunities")
        .update({ status: "archived" })
        .in(
          "id",
          toArchive.map((r) => r.id)
        )
      if (error) throw new Error(error.message)
      archived += toArchive.length
    }
  }

  const submissionIdByRepWeek = new Map<string, string>()
  for (const [repId, weeks] of weeksByRep) {
    for (const week of weeks) {
      const { data: existingSub } = await supabase
        .from("weekly_submissions")
        .select("id")
        .eq("rep_id", repId)
        .eq("week_commencing", week)
        .maybeSingle()

      let submissionId = existingSub?.id ?? null
      if (!submissionId) {
        const { data: newSub, error } = await supabase
          .from("weekly_submissions")
          .insert({ rep_id: repId, manager_id: user.id, week_commencing: week })
          .select("id")
          .single()
        if (error) throw new Error(error.message)
        submissionId = newSub.id
      }
      submissionIdByRepWeek.set(`${repId}|${week}`, submissionId)
    }
  }

  let inserted = 0
  let updated = 0
  for (const row of rows) {
    const depotId = depotByRep.get(row.repId!)
    if (!depotId) throw new Error(`Could not resolve depot for BDM "${row.bdmNameInput}"`)

    const submissionId = submissionIdByRepWeek.get(`${row.repId}|${row.weekCommencing}`) ?? null
    const companyName = row.companyName.trim()

    const { data: existing, error: existingError } = await supabase
      .from("strategic_opportunities")
      .select("id")
      .eq("rep_id", row.repId!)
      .eq("week_commencing", row.weekCommencing!)
      .ilike("company_name", companyName)
      .maybeSingle()
    if (existingError) throw new Error(existingError.message)

    const payload = {
      submission_id: submissionId,
      company_name: companyName,
      rep_id: row.repId!,
      depot_id: depotId,
      estimated_monthly_revenue: row.estimatedMonthlyRevenue!,
      estimated_monthly_gp: row.estimatedMonthlyGp,
      stage: row.stage!,
      probability: row.probability!,
      current_provider: row.currentProvider,
      last_action: row.lastAction,
      next_action: row.nextAction,
      next_action_date: row.nextActionDate,
      manager_notes: row.managerNotes,
      week_commencing: row.weekCommencing!,
      status: "active",
      last_reviewed: new Date().toISOString().slice(0, 10),
    }

    if (existing) {
      const { error } = await supabase.from("strategic_opportunities").update(payload).eq("id", existing.id)
      if (error) throw new Error(`Row ${row.rowNumber} (${row.companyName}): ${error.message}`)
      updated++
    } else {
      const { error } = await supabase.from("strategic_opportunities").insert(payload)
      if (error) throw new Error(`Row ${row.rowNumber} (${row.companyName}): ${error.message}`)
      inserted++
    }
  }

  revalidatePath("/opportunities")
  revalidatePath("/today")
  revalidatePath("/commercial-health")
  revalidatePath("/one-to-ones/new")
  for (const repId of repIds) {
    revalidatePath(`/reps/${repId}`)
    revalidatePath(`/reps/${repId}/scorecard`)
    revalidatePath(`/reps/${repId}/weekly-submission`)
  }

  return { inserted, updated, archived }
}
