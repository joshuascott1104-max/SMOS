"use client"

import { useState, useTransition } from "react"
import { completeAction, cancelAction, replanAction } from "@/lib/mutations/actions"
import { Button } from "@/components/ui"

type Mode = null | "complete" | "cancel" | "replan"

export function ActionControls({ actionId, dueDate }: { actionId: string; dueDate: string }) {
  const [mode, setMode] = useState<Mode>(null)
  const [pending, startTransition] = useTransition()
  const [text, setText] = useState("")
  const [newDueDate, setNewDueDate] = useState(dueDate)

  if (mode === null) {
    return (
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => setMode("complete")}>
          Complete
        </Button>
        <Button variant="secondary" onClick={() => setMode("replan")}>
          Replan
        </Button>
        <Button variant="danger" onClick={() => setMode("cancel")}>
          Cancel
        </Button>
      </div>
    )
  }

  const reset = () => {
    setMode(null)
    setText("")
  }

  const label = mode === "complete" ? "Outcome" : mode === "cancel" ? "Cancellation reason" : "Replan reason"

  return (
    <div className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-3">
      <label className="block text-xs font-medium text-zinc-600">{label}</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
        required
      />
      {mode === "replan" && (
        <div>
          <label className="block text-xs font-medium text-zinc-600">New due date</label>
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
          />
        </div>
      )}
      <div className="flex gap-2">
        <Button
          disabled={pending || !text}
          onClick={() =>
            startTransition(async () => {
              if (mode === "complete") await completeAction(actionId, text)
              if (mode === "cancel") await cancelAction(actionId, text)
              if (mode === "replan") await replanAction(actionId, text, newDueDate)
              reset()
            })
          }
        >
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button variant="secondary" onClick={reset}>
          Back
        </Button>
      </div>
    </div>
  )
}
