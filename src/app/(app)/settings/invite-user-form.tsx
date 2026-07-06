"use client"

import { useState, useTransition } from "react"
import { inviteUser } from "@/lib/mutations/users"
import { Button } from "@/components/ui"
import type { Tables } from "@/types/database"

function generatePassword() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().replace(/-/g, "").slice(0, 16)
    : Math.random().toString(36).slice(2, 18)
}

export function InviteUserForm({
  depots,
  users,
}: {
  depots: { id: string; name: string }[]
  users: Tables<"users">[]
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ email: string; password: string } | null>(null)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState(generatePassword)
  const [role, setRole] = useState<"sales_manager" | "regional_sales_manager" | "sales_director" | "admin">(
    "sales_manager"
  )
  const [depotId, setDepotId] = useState("")
  const [managerId, setManagerId] = useState("")

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Invite user
      </Button>
    )
  }

  return (
    <div className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-3">
      <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm" />
      <div>
        <label className="block text-xs text-zinc-600">Temporary password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm font-mono" />
      </div>
      <select value={role} onChange={(e) => setRole(e.target.value as typeof role)} className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm">
        <option value="sales_manager">Sales Manager</option>
        <option value="regional_sales_manager">Regional Sales Manager</option>
        <option value="sales_director">Sales Director</option>
        <option value="admin">Admin</option>
      </select>
      <select value={depotId} onChange={(e) => setDepotId(e.target.value)} className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm">
        <option value="">No depot</option>
        {depots.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
      <select value={managerId} onChange={(e) => setManagerId(e.target.value)} className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm">
        <option value="">No manager</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.full_name}
          </option>
        ))}
      </select>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && (
        <p className="rounded-md bg-emerald-50 p-2 text-xs text-emerald-700">
          Created {result.email}. Temporary password: <span className="font-mono">{result.password}</span>
        </p>
      )}

      <div className="flex gap-2">
        <Button
          disabled={pending || !fullName.trim() || !email.trim() || !password.trim()}
          onClick={() =>
            startTransition(async () => {
              setError(null)
              setResult(null)
              try {
                await inviteUser({
                  email,
                  password,
                  fullName,
                  role,
                  depotId: depotId || null,
                  managerId: managerId || null,
                })
                setResult({ email, password })
                setFullName("")
                setEmail("")
                setPassword(generatePassword())
              } catch (e) {
                setError(e instanceof Error ? e.message : "Could not create user")
              }
            })
          }
        >
          {pending ? "Creating…" : "Create user"}
        </Button>
        <Button variant="secondary" onClick={() => setOpen(false)}>
          Close
        </Button>
      </div>
    </div>
  )
}
