"use client"

import { useState, useTransition } from "react"
import { upsertCommercialScore } from "@/lib/mutations/commercial-health"
import { Button } from "@/components/ui"

export function ManualScoreForm({
  repId,
  month,
  initial,
}: {
  repId: string
  month: string
  initial: {
    newCustomersWon: number
    gateProgressionPct: number
    followUpCompliancePct: number
    crmDisciplinePct: number
    managerNotes: string
  }
}) {
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [newCustomersWon, setNewCustomersWon] = useState(initial.newCustomersWon)
  const [gateProgressionPct, setGateProgressionPct] = useState(initial.gateProgressionPct)
  const [followUpCompliancePct, setFollowUpCompliancePct] = useState(initial.followUpCompliancePct)
  const [crmDisciplinePct, setCrmDisciplinePct] = useState(initial.crmDisciplinePct)
  const [managerNotes, setManagerNotes] = useState(initial.managerNotes)

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <div>
        <label className="block text-xs font-medium text-zinc-600">New customers won</label>
        <input
          type="number"
          min={0}
          value={newCustomersWon}
          onChange={(e) => setNewCustomersWon(Number(e.target.value))}
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600">Gate progression %</label>
        <input
          type="number"
          min={0}
          max={100}
          value={gateProgressionPct}
          onChange={(e) => setGateProgressionPct(Number(e.target.value))}
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600">Follow-up compliance %</label>
        <input
          type="number"
          min={0}
          max={100}
          value={followUpCompliancePct}
          onChange={(e) => setFollowUpCompliancePct(Number(e.target.value))}
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600">CRM discipline %</label>
        <input
          type="number"
          min={0}
          max={100}
          value={crmDisciplinePct}
          onChange={(e) => setCrmDisciplinePct(Number(e.target.value))}
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
        />
      </div>
      <div className="md:col-span-4">
        <label className="block text-xs font-medium text-zinc-600">Manager notes</label>
        <textarea
          value={managerNotes}
          onChange={(e) => setManagerNotes(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
        />
      </div>
      <div className="md:col-span-4">
        <Button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await upsertCommercialScore({
                repId,
                month,
                newCustomersWon,
                gateProgressionPct,
                followUpCompliancePct,
                crmDisciplinePct,
                managerNotes,
              })
              setSaved(true)
            })
          }
        >
          {pending ? "Saving…" : "Save this month's inputs"}
        </Button>
        {saved && !pending && <span className="ml-2 text-sm text-emerald-600">Saved.</span>}
      </div>
    </div>
  )
}
