"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function SignOutButton() {
  const router = useRouter()

  return (
    <button
      onClick={async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
      }}
      className="text-sm text-zinc-500 hover:text-zinc-900"
    >
      Sign out
    </button>
  )
}
