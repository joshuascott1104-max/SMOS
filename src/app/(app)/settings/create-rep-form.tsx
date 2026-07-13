"use client"

import { useState, useTransition } from "react"
import { createRep } from "@/lib/mutations/reps"
import { Button } from "@/components/ui"

export function CreateRepForm({ depots }: { depots: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [fullName, setFullName] = useState("")
  const [depotId, setDepotId] = useState(depots[0]?.id ?? "")
  const [startDate, setStartDate] = useState("")
  const [monthlyTarget, setMonthlyTarget] = useState(0)
  const [newCustomerTarget, setNewCustomerTarget] = useState(2)
  const [qualifiedOpportunitiesWeeklyTarget, setQualifiedOpportunitiesWeeklyTarget] = useState(20)
  const [discoveryMeetingsWeeklyTarget, setDiscoveryMeetingsWeeklyTarget] = useState(8)
  const [proposalsIssuedWeeklyTarget, setProposalsIssuedWeeklyTarget] = useState(6)

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Add rep
      </Button>
    )
  }

  return (
    <div className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-3">
      <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm" />
      <select value={depotId} onChange={(e) => setDepotId(e.target.value)} className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm">
        {depots.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-zinc-600">Start date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-zinc-600">Monthly target (£)</label>
          <input type="number" min={0} value={monthlyTarget} onChange={(e) => setMonthlyTarget(Number(e.target.value))} className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-zinc-600">New customer target (/month)</label>
          <input type="number" min={0} value={newCustomerTarget} onChange={(e) => setNewCustomerTarget(Number(e.target.value))} className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-zinc-600">Qualified opps (/wk)</label>
          <input
            type="number"
            min={0}
            value={qualifiedOpportunitiesWeeklyTarget}
            onChange={(e) => setQualifiedOpportunitiesWeeklyTarget(Number(e.target.value))}
            className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-600">Discovery meetings (/wk)</label>
          <input
            type="number"
            min={0}
            value={discoveryMeetingsWeeklyTarget}
            onChange={(e) => setDiscoveryMeetingsWeeklyTarget(Number(e.target.value))}
            className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-600">Proposals issued (/wk)</label>
          <input
            type="number"
            min={0}
            value={proposalsIssuedWeeklyTarget}
            onChange={(e) => setProposalsIssuedWeeklyTarget(Number(e.target.value))}
            className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          disabled={pending || !fullName.trim() || !depotId}
          onClick={() =>
            startTransition(async () => {
              await createRep({
                fullName,
                depotId,
                startDate: startDate || null,
                monthlyTarget,
                newCustomerTarget,
                qualifiedOpportunitiesWeeklyTarget,
                discoveryMeetingsWeeklyTarget,
                proposalsIssuedWeeklyTarget,
              })
              setOpen(false)
              setFullName("")
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
