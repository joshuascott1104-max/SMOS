"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireCurrentUser } from "@/lib/auth"
import type { ReviewScoreInputs } from "@/lib/review-scoring"

export type OneToOneInput = {
  repId: string
  reviewDate: string
  periodCovered: string
  performanceSummary: string
  strengths: string
  developmentAreas: string
  managerFeedback: string
  repFeedback: string
  overallRating: number | null
  nextReviewDate: string | null
  supportRequired: string
  recognitionAchieved: string
  reviewScores: ReviewScoreInputs
  reviewScoreNotes: string
  objectiveUpdates: { id: string; status: string; progressNotes: string }[]
  newObjectives: { objective: string; successMeasure: string; dueDate: string | null }[]
  newActions: {
    title: string
    ownerType: "rep" | "manager"
    ownerId: string
    dueDate: string
    priority: "low" | "medium" | "high"
  }[]
}

export async function createOneToOne(input: OneToOneInput) {
  const user = await requireCurrentUser()
  const supabase = await createClient()

  for (const update of input.objectiveUpdates) {
    const { error } = await supabase
      .from("objectives")
      .update({ status: update.status, progress_notes: update.progressNotes })
      .eq("id", update.id)
    if (error) throw new Error(error.message)
  }

  const reviewMonth = `${input.reviewDate.slice(0, 7)}-01`
  const { data: commercialScore } = await supabase
    .from("commercial_scores")
    .select("id")
    .eq("rep_id", input.repId)
    .eq("month", reviewMonth)
    .maybeSingle()

  const { data: review, error } = await supabase
    .from("one_to_one_reviews")
    .insert({
      rep_id: input.repId,
      manager_id: user.id,
      review_date: input.reviewDate,
      period_covered: input.periodCovered,
      performance_summary: input.performanceSummary,
      strengths: input.strengths,
      development_areas: input.developmentAreas,
      manager_feedback: input.managerFeedback,
      rep_feedback: input.repFeedback,
      overall_rating: input.overallRating,
      next_review_date: input.nextReviewDate,
      support_required: input.supportRequired,
      recognition_achieved: input.recognitionAchieved,
      commercial_score_id: commercialScore?.id ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  const { error: scoreError } = await supabase.from("review_scores").insert({
    review_id: review.id,
    rep_id: input.repId,
    manager_id: user.id,
    performance_score: input.reviewScores.performance,
    pipeline_quality_score: input.reviewScores.pipeline_quality,
    crm_discipline_score: input.reviewScores.crm_discipline,
    follow_up_quality_score: input.reviewScores.follow_up_quality,
    accountability_score: input.reviewScores.accountability,
    agreed_actions_score: input.reviewScores.agreed_actions_completed,
    notes: input.reviewScoreNotes || null,
  })
  if (scoreError) throw new Error(scoreError.message)

  if (input.newObjectives.length > 0) {
    const { error: objError } = await supabase.from("objectives").insert(
      input.newObjectives.map((o) => ({
        review_id: review.id,
        rep_id: input.repId,
        objective: o.objective,
        success_measure: o.successMeasure,
        due_date: o.dueDate,
      }))
    )
    if (objError) throw new Error(objError.message)
  }

  const { error: meetingError } = await supabase.from("meetings").insert({
    meeting_type: "one_to_one",
    rep_id: input.repId,
    manager_id: user.id,
    meeting_date: input.reviewDate,
    status: "completed",
    summary: input.performanceSummary,
  })
  if (meetingError) throw new Error(meetingError.message)

  if (input.newActions.length > 0) {
    const { error: actionsError } = await supabase.from("actions").insert(
      input.newActions.map((a) => ({
        title: a.title,
        owner_type: a.ownerType,
        owner_id: a.ownerId,
        created_by: user.id,
        linked_rep_id: input.repId,
        due_date: a.dueDate,
        priority: a.priority,
      }))
    )
    if (actionsError) throw new Error(actionsError.message)
  }

  revalidatePath(`/reps/${input.repId}`)
  revalidatePath(`/reps/${input.repId}/scorecard`)
  revalidatePath("/today")
  revalidatePath("/actions")

  return review.id as string
}
