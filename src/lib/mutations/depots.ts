"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function createDepot(input: { name: string; region: string; managerId: string | null }) {
  const supabase = await createClient()
  const { error } = await supabase.from("depots").insert({
    name: input.name,
    region: input.region,
    manager_id: input.managerId,
  })
  if (error) throw new Error(error.message)
  revalidatePath("/settings")
}
