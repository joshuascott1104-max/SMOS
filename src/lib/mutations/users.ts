"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function inviteUser(input: {
  email: string
  password: string
  fullName: string
  role: "sales_manager" | "regional_sales_manager" | "sales_director" | "admin"
  depotId: string | null
  managerId: string | null
}) {
  const supabase = await createClient()

  const { error } = await supabase.rpc("admin_create_user", {
    p_email: input.email,
    p_password: input.password,
    p_full_name: input.fullName,
    p_role: input.role,
    p_depot_id: input.depotId ?? undefined,
    p_manager_id: input.managerId ?? undefined,
  })

  if (error) throw new Error(error.message)
  revalidatePath("/settings")
}

export async function updateUserStatus(userId: string, status: "active" | "inactive") {
  const supabase = await createClient()
  const { error } = await supabase.from("users").update({ status }).eq("id", userId)
  if (error) throw new Error(error.message)
  revalidatePath("/settings")
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const supabase = await createClient()
  const { error } = await supabase.rpc("admin_set_user_password", {
    p_user_id: userId,
    p_new_password: newPassword,
  })
  if (error) throw new Error(error.message)
}
