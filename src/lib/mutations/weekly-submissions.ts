"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireCurrentUser } from "@/lib/auth"

export async function upsertWeeklySubmission(input: {
  repId: string
  weekCommencing: string
  biggestWin: string
  biggestChallenge: string
  supportNeeded: string
}) {
  const user = await requireCurrentUser()
  const supabase = await createClient()

  const { error } = await supabase
    .from("weekly_submissions")
    .upsert(
      {
        rep_id: input.repId,
        manager_id: user.id,
        week_commencing: input.weekCommencing,
        submitted_date: new Date().toISOString().slice(0, 10),
        biggest_win: input.biggestWin,
        biggest_challenge: input.biggestChallenge,
        support_needed: input.supportNeeded,
      },
      { onConflict: "rep_id,week_commencing" }
    )

  if (error) throw new Error(error.message)
  revalidatePath(`/reps/${input.repId}`)
  revalidatePath("/today")
}

export async function markSubmissionReviewed(submissionId: string, repId: string, managerNotes: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("weekly_submissions")
    .update({ manager_reviewed: true, manager_notes: managerNotes })
    .eq("id", submissionId)

  if (error) throw new Error(error.message)
  revalidatePath(`/reps/${repId}`)
  revalidatePath("/today")
}
