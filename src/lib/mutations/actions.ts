"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireCurrentUser } from "@/lib/auth"

function revalidateActionSurfaces() {
  revalidatePath("/today")
  revalidatePath("/actions")
  revalidatePath("/team")
  revalidatePath("/reps", "layout")
}

export async function completeAction(actionId: string, outcome: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("actions")
    .update({ status: "completed", outcome, completed_date: new Date().toISOString().slice(0, 10) })
    .eq("id", actionId)

  if (error) throw error
  revalidateActionSurfaces()
}

export async function cancelAction(actionId: string, reason: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("actions")
    .update({ status: "cancelled", cancelled_reason: reason })
    .eq("id", actionId)

  if (error) throw error
  revalidateActionSurfaces()
}

export async function replanAction(actionId: string, reason: string, newDueDate: string) {
  const user = await requireCurrentUser()
  const supabase = await createClient()

  const { data: original, error: fetchError } = await supabase
    .from("actions")
    .select("*")
    .eq("id", actionId)
    .single()

  if (fetchError) throw fetchError

  const { error: updateError } = await supabase
    .from("actions")
    .update({ status: "replanned", replanned_reason: reason })
    .eq("id", actionId)

  if (updateError) throw updateError

  const { error: insertError } = await supabase.from("actions").insert({
    title: original.title,
    description: original.description,
    owner_type: original.owner_type,
    owner_id: original.owner_id,
    created_by: user.id,
    linked_rep_id: original.linked_rep_id,
    linked_opportunity_id: original.linked_opportunity_id,
    linked_meeting_id: original.linked_meeting_id,
    due_date: newDueDate,
    priority: original.priority,
  })

  if (insertError) throw insertError
  revalidateActionSurfaces()
}

export async function createAction(input: {
  title: string
  description?: string
  ownerType: "rep" | "manager"
  ownerId: string
  linkedRepId?: string | null
  linkedOpportunityId?: string | null
  linkedMeetingId?: string | null
  dueDate: string
  priority: "low" | "medium" | "high"
}) {
  const user = await requireCurrentUser()
  const supabase = await createClient()

  const { error } = await supabase.from("actions").insert({
    title: input.title,
    description: input.description || null,
    owner_type: input.ownerType,
    owner_id: input.ownerId,
    created_by: user.id,
    linked_rep_id: input.linkedRepId ?? null,
    linked_opportunity_id: input.linkedOpportunityId ?? null,
    linked_meeting_id: input.linkedMeetingId ?? null,
    due_date: input.dueDate,
    priority: input.priority,
  })

  if (error) throw error
  revalidateActionSurfaces()
}
