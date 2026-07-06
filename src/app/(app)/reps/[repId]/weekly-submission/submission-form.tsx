"use client"

import { useState, useTransition } from "react"
import { upsertWeeklySubmission } from "@/lib/mutations/weekly-submissions"
import { Button } from "@/components/ui"

export function SubmissionForm({
  repId,
  weekCommencing,
  initial,
}: {
  repId: string
  weekCommencing: string
  initial: { biggestWin: string; biggestChallenge: string; supportNeeded: string }
}) {
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [biggestWin, setBiggestWin] = useState(initial.biggestWin)
  const [biggestChallenge, setBiggestChallenge] = useState(initial.biggestChallenge)
  const [supportNeeded, setSupportNeeded] = useState(initial.supportNeeded)

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-zinc-600">Biggest win</label>
        <textarea
          value={biggestWin}
          onChange={(e) => setBiggestWin(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600">Biggest challenge</label>
        <textarea
          value={biggestChallenge}
          onChange={(e) => setBiggestChallenge(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600">Support needed</label>
        <textarea
          value={supportNeeded}
          onChange={(e) => setSupportNeeded(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
        />
      </div>
      <Button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await upsertWeeklySubmission({ repId, weekCommencing, biggestWin, biggestChallenge, supportNeeded })
            setSaved(true)
          })
        }
      >
        {pending ? "Saving…" : "Save submission"}
      </Button>
      {saved && !pending && <span className="ml-2 text-sm text-emerald-600">Saved.</span>}
    </div>
  )
}
