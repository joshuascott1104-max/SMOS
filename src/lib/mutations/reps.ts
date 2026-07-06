"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireCurrentUser } from "@/lib/auth"

export async function addManagerNote(repId: string, note: string) {
  const user = await requireCurrentUser()
  const supabase = await createClient()

  const { data: rep, error: fetchError } = await supabase
    .from("reps")
    .select("notes")
    .eq("id", repId)
    .single()
  if (fetchError) throw new Error(fetchError.message)

  const timestamp = new Date().toISOString().slice(0, 16).replace("T", " ")
  const entry = `[${timestamp} — ${user.full_name}] ${note}`
  const updatedNotes = rep.notes ? `${rep.notes}\n\n${entry}` : entry

  const { error } = await supabase.from("reps").update({ notes: updatedNotes }).eq("id", repId)
  if (error) throw new Error(error.message)
  revalidatePath(`/reps/${repId}`)
}

export async function createRep(input: {
  fullName: string
  depotId: string
  startDate: string | null
  monthlyTarget: number
  newCustomerTarget: number
}) {
  const user = await requireCurrentUser()
  const supabase = await createClient()

  const { error } = await supabase.from("reps").insert({
    full_name: input.fullName,
    depot_id: input.depotId,
    manager_id: user.id,
    start_date: input.startDate,
    monthly_target: input.monthlyTarget,
    new_customer_target: input.newCustomerTarget,
  })

  if (error) throw new Error(error.message)
  revalidatePath("/team")
  revalidatePath("/settings")
}

export async function updateRepTargets(repId: string, monthlyTarget: number, newCustomerTarget: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("reps")
    .update({ monthly_target: monthlyTarget, new_customer_target: newCustomerTarget })
    .eq("id", repId)
  if (error) throw new Error(error.message)
  revalidatePath("/team")
  revalidatePath("/settings")
  revalidatePath(`/reps/${repId}`)
  revalidatePath(`/reps/${repId}/scorecard`)
}

export async function updateRepStatus(repId: string, status: "active" | "inactive") {
  const supabase = await createClient()
  const { error } = await supabase.from("reps").update({ status }).eq("id", repId)
  if (error) throw new Error(error.message)
  revalidatePath("/team")
  revalidatePath("/settings")
  revalidatePath(`/reps/${repId}`)
}
