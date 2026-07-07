import "server-only"
import { createClient } from "@/lib/supabase/server"
import type { ReviewScoreInputs } from "@/lib/review-scoring"

export type ReviewScoreRecord = {
  id: string
  reviewId: string
  reviewDate: string
  totalScore: number
  categories: ReviewScoreInputs
  notes: string | null
}

export async function getReviewScoreForReview(reviewId: string): Promise<ReviewScoreRecord | null> {
  const supabase = await createClient()
  const { data } = await supabase.from("review_scores").select("*").eq("review_id", reviewId).maybeSingle()
  if (!data) return null

  return {
    id: data.id,
    reviewId: data.review_id,
    reviewDate: "",
    totalScore: data.total_score ?? 0,
    notes: data.notes,
    categories: {
      performance: data.performance_score,
      pipeline_quality: data.pipeline_quality_score,
      crm_discipline: data.crm_discipline_score,
      follow_up_quality: data.follow_up_quality_score,
      accountability: data.accountability_score,
      agreed_actions_completed: data.agreed_actions_score,
    },
  }
}

export async function getRepReviewScoreHistory(repId: string, limit = 2): Promise<ReviewScoreRecord[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("review_scores")
    .select("*, one_to_one_reviews:review_id(review_date)")
    .eq("rep_id", repId)

  const rows = (data ?? []).filter((r) => r.one_to_one_reviews !== null)

  rows.sort(
    (a, b) => new Date(b.one_to_one_reviews!.review_date).getTime() - new Date(a.one_to_one_reviews!.review_date).getTime()
  )

  return rows.slice(0, limit).map((r) => ({
    id: r.id,
    reviewId: r.review_id,
    reviewDate: r.one_to_one_reviews!.review_date,
    totalScore: r.total_score ?? 0,
    notes: r.notes,
    categories: {
      performance: r.performance_score,
      pipeline_quality: r.pipeline_quality_score,
      crm_discipline: r.crm_discipline_score,
      follow_up_quality: r.follow_up_quality_score,
      accountability: r.accountability_score,
      agreed_actions_completed: r.agreed_actions_score,
    },
  }))
}
