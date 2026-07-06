"use client"

import { useEffect, useState, useTransition } from "react"
import { upsertKpi, getKpiEntry } from "@/lib/mutations/kpis"
import { Button } from "@/components/ui"
import { startOfWeek } from "@/lib/format"

const BLANK = {
  calls: 0,
  appointments: 0,
  quotes: 0,
  wins: 0,
  revenueWon: 0,
  forecastValue: 0,
  qualifiedOpportunities: 0,
  discoveryMeetings: 0,
  proposalsIssued: 0,
  managerNotes: "",
}

export function KpiForm({ reps }: { reps: { id: string; full_name: string }[] }) {
  const [pending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isExisting, setIsExisting] = useState(false)
  const [repId, setRepId] = useState(reps[0]?.id ?? "")
  const [weekCommencing, setWeekCommencing] = useState(startOfWeek())
  const [fields, setFields] = useState(BLANK)

  useEffect(() => {
    if (!repId || !weekCommencing) return
    let cancelled = false
    setLoading(true)
    setSaved(false)
    getKpiEntry(repId, weekCommencing).then((existing) => {
      if (cancelled) return
      if (existing) {
        setFields({
          calls: existing.calls,
          appointments: existing.appointments,
          quotes: existing.quotes,
          wins: existing.wins,
          revenueWon: Number(existing.revenue_won),
          forecastValue: Number(existing.forecast_value),
          qualifiedOpportunities: existing.qualified_opportunities,
          discoveryMeetings: existing.discovery_meetings,
          proposalsIssued: existing.proposals_issued,
          managerNotes: existing.manager_notes ?? "",
        })
        setIsExisting(true)
      } else {
        setFields(BLANK)
        setIsExisting(false)
      }
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [repId, weekCommencing])

  function setField<K extends keyof typeof BLANK>(key: K, value: (typeof BLANK)[K]) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs font-medium text-zinc-600">Rep</label>
        <select
          value={repId}
          onChange={(e) => setRepId(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
        >
          {reps.map((r) => (
            <option key={r.id} value={r.id}>
              {r.full_name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600">Week commencing</label>
        <input
          type="date"
          value={weekCommencing}
          onChange={(e) => setWeekCommencing(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
        />
      </div>

      {loading ? (
        <p className="text-xs text-zinc-400">Loading this week…</p>
      ) : isExisting ? (
        <p className="text-xs text-amber-600">This week already has an entry — editing will update it.</p>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <NumberField label="Calls" value={fields.calls} onChange={(v) => setField("calls", v)} />
        <NumberField label="Appointments" value={fields.appointments} onChange={(v) => setField("appointments", v)} />
        <NumberField label="Quotes" value={fields.quotes} onChange={(v) => setField("quotes", v)} />
        <NumberField label="Wins" value={fields.wins} onChange={(v) => setField("wins", v)} />
        <NumberField label="Revenue won (£)" value={fields.revenueWon} onChange={(v) => setField("revenueWon", v)} />
        <NumberField label="Forecast (£)" value={fields.forecastValue} onChange={(v) => setField("forecastValue", v)} />
        <NumberField
          label="Qualified opportunities (target 20/wk)"
          value={fields.qualifiedOpportunities}
          onChange={(v) => setField("qualifiedOpportunities", v)}
        />
        <NumberField
          label="Discovery meetings (target 8/wk)"
          value={fields.discoveryMeetings}
          onChange={(v) => setField("discoveryMeetings", v)}
        />
        <NumberField
          label="Proposals issued (target 6/wk)"
          value={fields.proposalsIssued}
          onChange={(v) => setField("proposalsIssued", v)}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600">Manager notes</label>
        <textarea
          value={fields.managerNotes}
          onChange={(e) => setField("managerNotes", e.target.value)}
          rows={2}
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
        />
      </div>
      <Button
        disabled={pending || loading || !repId}
        onClick={() =>
          startTransition(async () => {
            await upsertKpi({ repId, weekCommencing, ...fields })
            setSaved(true)
            setIsExisting(true)
          })
        }
      >
        {pending ? "Saving…" : isExisting ? "Update KPI snapshot" : "Save KPI snapshot"}
      </Button>
      {saved && !pending && <span className="ml-2 text-sm text-emerald-600">Saved.</span>}
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <label className="block text-xs text-zinc-600">{label}</label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
      />
    </div>
  )
}
