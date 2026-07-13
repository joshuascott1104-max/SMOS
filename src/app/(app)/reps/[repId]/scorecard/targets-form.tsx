"use client"

import { useState, useTransition } from "react"
import { updateRepTargets } from "@/lib/mutations/reps"
import { Button } from "@/components/ui"

export function TargetsForm({
  repId,
  initial,
}: {
  repId: string
  initial: {
    monthlyTarget: number
    newCustomerTarget: number
    qualifiedOpportunitiesWeeklyTarget: number
    discoveryMeetingsWeeklyTarget: number
    proposalsIssuedWeeklyTarget: number
  }
}) {
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [monthlyTarget, setMonthlyTarget] = useState(initial.monthlyTarget)
  const [newCustomerTarget, setNewCustomerTarget] = useState(initial.newCustomerTarget)
  const [qualifiedOpportunitiesWeeklyTarget, setQualifiedOpportunitiesWeeklyTarget] = useState(
    initial.qualifiedOpportunitiesWeeklyTarget
  )
  const [discoveryMeetingsWeeklyTarget, setDiscoveryMeetingsWeeklyTarget] = useState(
    initial.discoveryMeetingsWeeklyTarget
  )
  const [proposalsIssuedWeeklyTarget, setProposalsIssuedWeeklyTarget] = useState(
    initial.proposalsIssuedWeeklyTarget
  )

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
      <div>
        <label className="block text-xs font-medium text-zinc-600">Monthly revenue target (£)</label>
        <input
          type="number"
          min={0}
          value={monthlyTarget}
          onChange={(e) => setMonthlyTarget(Number(e.target.value))}
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600">New customer target (/month)</label>
        <input
          type="number"
          min={0}
          value={newCustomerTarget}
          onChange={(e) => setNewCustomerTarget(Number(e.target.value))}
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600">Qualified opportunities (/wk)</label>
        <input
          type="number"
          min={0}
          value={qualifiedOpportunitiesWeeklyTarget}
          onChange={(e) => setQualifiedOpportunitiesWeeklyTarget(Number(e.target.value))}
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600">Discovery meetings (/wk)</label>
        <input
          type="number"
          min={0}
          value={discoveryMeetingsWeeklyTarget}
          onChange={(e) => setDiscoveryMeetingsWeeklyTarget(Number(e.target.value))}
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600">Proposals issued (/wk)</label>
        <input
          type="number"
          min={0}
          value={proposalsIssuedWeeklyTarget}
          onChange={(e) => setProposalsIssuedWeeklyTarget(Number(e.target.value))}
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
        />
      </div>
      <div className="md:col-span-5">
        <Button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              setError(null)
              try {
                await updateRepTargets(repId, {
                  monthlyTarget,
                  newCustomerTarget,
                  qualifiedOpportunitiesWeeklyTarget,
                  discoveryMeetingsWeeklyTarget,
                  proposalsIssuedWeeklyTarget,
                })
                setSaved(true)
              } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to save targets")
              }
            })
          }
        >
          {pending ? "Saving…" : "Save targets"}
        </Button>
        {saved && !pending && !error && <span className="ml-2 text-sm text-emerald-600">Saved.</span>}
        {error && <span className="ml-2 text-sm text-red-600">{error}</span>}
      </div>
    </div>
  )
}
