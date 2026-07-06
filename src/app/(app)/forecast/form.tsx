"use client"

import { useState, useTransition } from "react"
import { upsertForecast } from "@/lib/mutations/forecasts"
import { Button } from "@/components/ui"

export function ForecastForm({
  reps,
  depots,
}: {
  reps: { id: string; full_name: string }[]
  depots: { id: string; name: string }[]
}) {
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [scope, setScope] = useState<"rep" | "depot">("rep")
  const [repId, setRepId] = useState(reps[0]?.id ?? "")
  const [depotId, setDepotId] = useState(depots[0]?.id ?? "")
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [target, setTarget] = useState(0)
  const [forecastValue, setForecastValue] = useState(0)
  const [weightedForecast, setWeightedForecast] = useState(0)
  const [confidence, setConfidence] = useState<"low" | "medium" | "high">("medium")
  const [managerNotes, setManagerNotes] = useState("")

  return (
    <div className="space-y-2">
      <div className="flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => setScope("rep")}
          className={`rounded-full px-2 py-1 ${scope === "rep" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"}`}
        >
          By rep
        </button>
        <button
          type="button"
          onClick={() => setScope("depot")}
          className={`rounded-full px-2 py-1 ${scope === "depot" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"}`}
        >
          By depot
        </button>
      </div>

      {scope === "rep" ? (
        <select value={repId} onChange={(e) => setRepId(e.target.value)} className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm">
          {reps.map((r) => (
            <option key={r.id} value={r.id}>
              {r.full_name}
            </option>
          ))}
        </select>
      ) : (
        <select value={depotId} onChange={(e) => setDepotId(e.target.value)} className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm">
          {depots.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      )}

      <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm" />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-zinc-600">Target (£)</label>
          <input type="number" min={0} value={target} onChange={(e) => setTarget(Number(e.target.value))} className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-zinc-600">Forecast (£)</label>
          <input type="number" min={0} value={forecastValue} onChange={(e) => setForecastValue(Number(e.target.value))} className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-zinc-600">Weighted (£)</label>
          <input type="number" min={0} value={weightedForecast} onChange={(e) => setWeightedForecast(Number(e.target.value))} className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-zinc-600">Confidence</label>
          <select value={confidence} onChange={(e) => setConfidence(e.target.value as typeof confidence)} className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <textarea
        value={managerNotes}
        onChange={(e) => setManagerNotes(e.target.value)}
        rows={2}
        placeholder="Manager notes"
        className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
      />

      <Button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await upsertForecast({
              repId: scope === "rep" ? repId : null,
              depotId: scope === "depot" ? depotId : null,
              month: `${month}-01`,
              target,
              forecastValue,
              weightedForecast,
              confidence,
              managerNotes,
            })
            setSaved(true)
          })
        }
      >
        {pending ? "Saving…" : "Save forecast"}
      </Button>
      {saved && !pending && <span className="ml-2 text-sm text-emerald-600">Saved.</span>}
    </div>
  )
}
