"use client"

import { useState, useTransition } from "react"
import { createDepot } from "@/lib/mutations/depots"
import { Button } from "@/components/ui"
import type { Tables } from "@/types/database"

export function CreateDepotForm({ users }: { users: Tables<"users">[] }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [name, setName] = useState("")
  const [region, setRegion] = useState("")
  const [managerId, setManagerId] = useState("")

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Add depot
      </Button>
    )
  }

  return (
    <div className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Depot name" className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm" />
      <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Region" className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm" />
      <select value={managerId} onChange={(e) => setManagerId(e.target.value)} className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm">
        <option value="">No manager</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.full_name}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <Button
          disabled={pending || !name.trim() || !region.trim()}
          onClick={() =>
            startTransition(async () => {
              await createDepot({ name, region, managerId: managerId || null })
              setOpen(false)
              setName("")
              setRegion("")
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
