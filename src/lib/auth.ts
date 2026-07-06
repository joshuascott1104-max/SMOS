import "server-only"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database"

export type CurrentUser = Tables<"users">

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) return null

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("auth_user_id", authUser.id)
    .single()

  return profile
}

export async function requireCurrentUser(): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  return user
}
