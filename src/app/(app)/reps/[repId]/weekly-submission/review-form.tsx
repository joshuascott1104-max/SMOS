"use client"

import { useState, useTransition } from "react"
import { markSubmissionReviewed } from "@/lib/mutations/weekly-submissions"
import { Button, Badge } from "@/components/ui"

export function ReviewForm({
  submissionId,
  repId,
  reviewed,
  initialNotes,
}: {
  submissionId: string
  repId: string
  reviewed: boolean
  initialNotes: string
}) {
  const [pending, startTransition] = useTransition()
  const [notes, setNotes] = useState(initialNotes)
  const [isReviewed, setIsReviewed] = useState(reviewed)

  return (
    <div className="space-y-3">
      <Badge value={isReviewed ? "active" : "open"} label={isReviewed ? "Reviewed" : "Awaiting review"} />
      <div>
        <label className="block text-xs font-medium text-zinc-600">Manager notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
        />
      </div>
      <Button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await markSubmissionReviewed(submissionId, repId, notes)
            setIsReviewed(true)
          })
        }
      >
        {pending ? "Saving…" : "Mark reviewed"}
      </Button>
    </div>
  )
}
