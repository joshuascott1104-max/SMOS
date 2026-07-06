"use client"

import { useState, useTransition } from "react"
import { resetUserPassword, updateUserStatus } from "@/lib/mutations/users"
import { Button } from "@/components/ui"

export function UserRowActions({ userId, status }: { userId: string; status: string }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  return (
    <div className="text-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={() =>
            startTransition(async () => {
              await updateUserStatus(userId, status === "active" ? "inactive" : "active")
            })
          }
          disabled={pending}
          className="font-medium text-zinc-600 hover:text-zinc-900 hover:underline"
        >
          {status === "active" ? "Deactivate" : "Activate"}
        </button>
        <button onClick={() => setOpen((o) => !o)} className="font-medium text-zinc-600 hover:text-zinc-900 hover:underline">
          Reset password
        </button>
        {success && <span className="text-emerald-600">Reset.</span>}
      </div>

      {open && (
        <div className="mt-2 flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-2">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
          />
          <Button
            disabled={pending || newPassword.length < 6}
            onClick={() =>
              startTransition(async () => {
                setError(null)
                try {
                  await resetUserPassword(userId, newPassword)
                  setSuccess(true)
                  setNewPassword("")
                  setOpen(false)
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Could not reset password")
                }
              })
            }
          >
            Save
          </Button>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      )}
      {error && <p className="mt-1 text-red-600">{error}</p>}
    </div>
  )
}
