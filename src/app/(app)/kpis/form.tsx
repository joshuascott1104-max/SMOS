"use client"

import { useState, useTransition } from "react"
import { upsertKpi } from "@/lib/mutations/kpis"
import { Button } from "@/components/ui"
import { startOfWeek } from "@/lib/format"

export function KpiForm({ reps }: { reps: { id: string; full_name: string }[] }) {
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [repId, setRepId] = useState(reps[0]?.id ?? "")
  const [weekCommencing, setWeekCommencing] = useState(startOfWeek())
  const [calls, setCalls] = useState(0)
  const [appointments, setAppointments] = useState(0)
  const [quotes, setQuotes] = useState(0)
  const [wins, setWins] = useState(0)
  const [revenueWon, setRevenueWon] = useState(0)
  const [forecastValue, setForecastValue] = useState(0)
  const [managerNotes, setManagerNotes] = useState("")

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
      <div className="grid grid-cols-2 gap-2">
        <NumberField label="Calls" value={calls} onChange={setCalls} />
        <NumberField label="Appointments" value={appointments} onChange={setAppointments} />
        <NumberField label="Quotes" value={quotes} onChange={setQuotes} />
        <NumberField label="Wins" value={wins} onChange={setWins} />
        <NumberField label="Revenue won (£)" value={revenueWon} onChange={setRevenueWon} />
        <NumberField label="Forecast (£)" value={forecastValue} onChange={setForecastValue} />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600">Manager notes</label>
        <textarea
          value={managerNotes}
          onChange={(e) => setManagerNotes(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
        />
      </div>
      <Button
        disabled={pending || !repId}
        onClick={() =>
          startTransition(async () => {
            await upsertKpi({
              repId,
              weekCommencing,
              calls,
              appointments,
              quotes,
              wins,
              revenueWon,
              forecastValue,
              managerNotes,
            })
            setSaved(true)
          })
        }
      >
        {pending ? "Saving…" : "Save KPI snapshot"}
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
