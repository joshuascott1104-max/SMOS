"use client"

import { useRef, useState, useTransition } from "react"
import { addManagerNote } from "@/lib/mutations/reps"
import { Button } from "@/components/ui"

export function AddManagerNoteForm({ repId }: { repId: string }) {
  const [pending, startTransition] = useTransition()
  const [note, setNote] = useState("")
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form
      ref={formRef}
      action={() =>
        startTransition(async () => {
          if (!note.trim()) return
          await addManagerNote(repId, note)
          setNote("")
        })
      }
      className="space-y-2"
    >
      <label className="block text-xs font-medium text-zinc-600">Add manager note</label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
        placeholder="Coaching observation, context for next 1-to-1…"
      />
      <Button disabled={pending || !note.trim()}>{pending ? "Saving…" : "Add note"}</Button>
    </form>
  )
}
