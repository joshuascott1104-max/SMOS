"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireCurrentUser } from "@/lib/auth"

export type MondayMeetingInput = {
  repId: string | null
  depotId: string | null
  meetingDate: string
  previousActionsNote: string
  kpiExceptionsNote: string
  top10Note: string
  coachingNote: string
  summary: string
  newActions: {
    title: string
    ownerType: "rep" | "manager"
    ownerId: string
    dueDate: string
    priority: "low" | "medium" | "high"
  }[]
}

export async function createMondayMeeting(input: MondayMeetingInput) {
  const user = await requireCurrentUser()
  const supabase = await createClient()

  const { data: meeting, error } = await supabase
    .from("meetings")
    .insert({
      meeting_type: "monday_meeting",
      rep_id: input.repId,
      depot_id: input.depotId,
      manager_id: user.id,
      meeting_date: input.meetingDate,
      status: "completed",
      summary: input.summary,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  const sections: { section: string; note: string }[] = [
    { section: "previous_actions", note: input.previousActionsNote },
    { section: "kpi_exceptions", note: input.kpiExceptionsNote },
    { section: "top10_review", note: input.top10Note },
    { section: "coaching_notes", note: input.coachingNote },
  ].filter((s) => s.note.trim().length > 0)

  if (sections.length > 0) {
    const { error: notesError } = await supabase.from("meeting_notes").insert(
      sections.map((s) => ({
        meeting_id: meeting.id,
        section: s.section,
        note: s.note,
        created_by: user.id,
      }))
    )
    if (notesError) throw new Error(notesError.message)
  }

  if (input.newActions.length > 0) {
    const { error: actionsError } = await supabase.from("actions").insert(
      input.newActions.map((a) => ({
        title: a.title,
        owner_type: a.ownerType,
        owner_id: a.ownerId,
        created_by: user.id,
        linked_rep_id: input.repId,
        linked_meeting_id: meeting.id,
        due_date: a.dueDate,
        priority: a.priority,
      }))
    )
    if (actionsError) throw new Error(actionsError.message)
  }

  revalidatePath("/today")
  revalidatePath("/meetings")
  revalidatePath("/actions")
  if (input.repId) revalidatePath(`/reps/${input.repId}`)

  return meeting.id as string
}
