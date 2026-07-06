"use client"

import { useState, useTransition } from "react"
import { createAction } from "@/lib/mutations/actions"
import { Button } from "@/components/ui"

export function AddActionForm({ repId, managerId }: { repId: string; managerId: string }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [title, setTitle] = useState("")
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [assignTo, setAssignTo] = useState<"rep" | "manager">("rep")

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Add action
      </Button>
    )
  }

  return (
    <div className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Action title"
        className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
      />
      <div className="flex gap-2">
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as typeof priority)}
          className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          value={assignTo}
          onChange={(e) => setAssignTo(e.target.value as typeof assignTo)}
          className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
        >
          <option value="rep">Owner: Rep</option>
          <option value="manager">Owner: Manager</option>
        </select>
      </div>
      <div className="flex gap-2">
        <Button
          disabled={pending || !title.trim()}
          onClick={() =>
            startTransition(async () => {
              await createAction({
                title,
                ownerType: assignTo,
                ownerId: assignTo === "rep" ? repId : managerId,
                linkedRepId: repId,
                dueDate,
                priority,
              })
              setTitle("")
              setOpen(false)
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
