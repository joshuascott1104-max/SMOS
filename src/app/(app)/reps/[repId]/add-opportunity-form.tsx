"use client"

import { useState, useTransition } from "react"
import { createOpportunity } from "@/lib/mutations/opportunities"
import { Button } from "@/components/ui"

const STAGES = ["data_received", "quoted", "trial", "appointment_booked", "negotiation", "closed_won", "closed_lost"]

export function AddOpportunityForm({
  repId,
  depotId,
  activeCount,
}: {
  repId: string
  depotId: string
  activeCount: number
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState("")
  const [revenue, setRevenue] = useState(0)
  const [stage, setStage] = useState("data_received")
  const [probability, setProbability] = useState(50)
  const [expectedCloseMonth, setExpectedCloseMonth] = useState("")
  const [nextAction, setNextAction] = useState("")
  const [supportRequired, setSupportRequired] = useState(false)
  const [supportReason, setSupportReason] = useState("")

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)} disabled={activeCount >= 10}>
        {activeCount >= 10 ? "Top 10 full" : "Add opportunity"}
      </Button>
    )
  }

  return (
    <div className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-3">
      <input
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        placeholder="Company name"
        className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-zinc-600">Est. monthly revenue (£)</label>
          <input
            type="number"
            min={0}
            value={revenue}
            onChange={(e) => setRevenue(Number(e.target.value))}
            className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-600">Probability (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={probability}
            onChange={(e) => setProbability(Number(e.target.value))}
            className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-600">Stage</label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-zinc-600">Expected close month</label>
          <input
            type="month"
            value={expectedCloseMonth}
            onChange={(e) => setExpectedCloseMonth(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-zinc-600">Next action</label>
        <input
          value={nextAction}
          onChange={(e) => setNextAction(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
        />
      </div>
      <label className="flex items-center gap-2 text-xs text-zinc-600">
        <input type="checkbox" checked={supportRequired} onChange={(e) => setSupportRequired(e.target.checked)} />
        Support required
      </label>
      {supportRequired && (
        <input
          value={supportReason}
          onChange={(e) => setSupportReason(e.target.value)}
          placeholder="Why is support needed?"
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <Button
          disabled={pending || !companyName.trim() || (supportRequired && !supportReason.trim())}
          onClick={() =>
            startTransition(async () => {
              setError(null)
              try {
                await createOpportunity({
                  companyName,
                  repId,
                  depotId,
                  estimatedMonthlyRevenue: revenue,
                  stage,
                  probability,
                  expectedCloseMonth: expectedCloseMonth ? `${expectedCloseMonth}-01` : null,
                  nextAction,
                  supportRequired,
                  supportReason: supportRequired ? supportReason : null,
                  managerNotes: null,
                })
                setOpen(false)
                setCompanyName("")
              } catch (e) {
                setError(e instanceof Error ? e.message : "Could not save opportunity")
              }
            })
          }
        >
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button variant="secondary" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
