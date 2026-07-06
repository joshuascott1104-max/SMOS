"use client"

import { useState, useTransition } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui"

export function ChangePasswordForm() {
  const [pending, startTransition] = useTransition()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs font-medium text-zinc-600">New password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
          autoComplete="new-password"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600">Confirm new password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
          autoComplete="new-password"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">Password updated.</p>}

      <Button
        disabled={pending || newPassword.length < 6 || newPassword !== confirmPassword}
        onClick={() =>
          startTransition(async () => {
            setError(null)
            setSuccess(false)
            const supabase = createClient()
            const { error } = await supabase.auth.updateUser({ password: newPassword })
            if (error) {
              setError(error.message)
            } else {
              setSuccess(true)
              setNewPassword("")
              setConfirmPassword("")
            }
          })
        }
      >
        {pending ? "Updating…" : "Update password"}
      </Button>
      {newPassword && newPassword.length < 6 && (
        <p className="text-xs text-zinc-400">Password must be at least 6 characters.</p>
      )}
      {newPassword && confirmPassword && newPassword !== confirmPassword && (
        <p className="text-xs text-red-500">Passwords don&apos;t match.</p>
      )}
    </div>
  )
}
