// Review Scoring System — used during Sales Manager 1-to-1s (and informed by
// Friday Top 10 reviews) to score a rep's coaching-relevant behaviours for
// that specific review. This sits alongside the Commercial Health Score
// (src/lib/scoring.ts) and does not replace it: the Commercial Health Score
// measures commercial results and pipeline discipline from logged KPI data;
// this measures the manager's qualitative read of the rep during a review.
//
// This is a coaching tool, not a commission or league-table score.

import type { RatingBand } from "@/lib/scoring"

export type ReviewCategoryKey =
  | "performance"
  | "pipeline_quality"
  | "crm_discipline"
  | "follow_up_quality"
  | "accountability"
  | "agreed_actions_completed"

export const REVIEW_CATEGORY_KEYS: ReviewCategoryKey[] = [
  "performance",
  "pipeline_quality",
  "crm_discipline",
  "follow_up_quality",
  "accountability",
  "agreed_actions_completed",
]

export const REVIEW_CATEGORY_LABELS: Record<ReviewCategoryKey, string> = {
  performance: "Performance",
  pipeline_quality: "Pipeline Quality",
  crm_discipline: "CRM Discipline",
  follow_up_quality: "Follow-up Quality",
  accountability: "Accountability / Attitude",
  agreed_actions_completed: "Agreed Actions Completed",
}

export type ReviewCategoryScore = {
  key: ReviewCategoryKey
  label: string
  actual: number
  target: number
  unit: string
  achievementPct: number
  points: number
  maxPoints: number
}

export type ReviewScoreInputs = Record<ReviewCategoryKey, number>

export type ReviewScoreResult = {
  categories: ReviewCategoryScore[]
  totalScore: number
  rating: RatingBand
}

function clampScore(value: number): number {
  return Math.min(5, Math.max(1, Math.round(value)))
}

export function ratingForReviewScore(totalScore: number): RatingBand {
  if (totalScore >= 27) return { key: "elite", label: "Excellent", statusColor: "good" }
  if (totalScore >= 23) return { key: "strong", label: "Strong", statusColor: "good" }
  if (totalScore >= 18) return { key: "on_track", label: "On Track", statusColor: "warning" }
  if (totalScore >= 13) return { key: "needs_support", label: "Needs Support", statusColor: "serious" }
  return { key: "immediate_coaching", label: "Immediate Coaching Required", statusColor: "critical" }
}

export function computeReviewScore(inputs: ReviewScoreInputs): ReviewScoreResult {
  const categories: ReviewCategoryScore[] = REVIEW_CATEGORY_KEYS.map((key) => {
    const actual = clampScore(inputs[key])
    return {
      key,
      label: REVIEW_CATEGORY_LABELS[key],
      actual,
      target: 5,
      unit: "",
      achievementPct: (actual / 5) * 100,
      points: actual,
      maxPoints: 5,
    }
  })

  const totalScore = categories.reduce((sum, c) => sum + c.points, 0)

  return { categories, totalScore, rating: ratingForReviewScore(totalScore) }
}

const COACHING_FOCUS: Record<ReviewCategoryKey, string> = {
  performance: "Performance is the weakest area this review — agree specific, measurable targets for next month.",
  pipeline_quality: "Pipeline quality needs attention — review whether opportunities are properly qualified before they're added to the Top 10.",
  crm_discipline: "CRM discipline is weak — records should be accurate, current and updated promptly per the Commercial Standards.",
  follow_up_quality: "Follow-up quality needs work — every opportunity must have a clear, timely next action.",
  accountability: "Accountability/attitude is a concern — discuss ownership of results and responsiveness to feedback directly.",
  agreed_actions_completed: "Agreed actions from previous reviews aren't being completed — revisit what's blocking follow-through.",
}

const WEAK_SCORE_THRESHOLD = 2

export function weakReviewCategories(categories: ReviewCategoryScore[]): ReviewCategoryScore[] {
  return categories.filter((c) => c.actual <= WEAK_SCORE_THRESHOLD)
}

export function suggestedReviewCoachingFocus(categories: ReviewCategoryScore[], limit = 2): string[] {
  return [...categories]
    .filter((c) => c.actual <= WEAK_SCORE_THRESHOLD)
    .sort((a, b) => a.actual - b.actual)
    .slice(0, limit)
    .map((c) => COACHING_FOCUS[c.key])
}

export type ReviewScoreTrend = "improving" | "flat" | "declining" | "not_enough_data"

export function trendBetween(latestTotal: number | null, previousTotal: number | null): ReviewScoreTrend {
  if (latestTotal === null || previousTotal === null) return "not_enough_data"
  if (latestTotal > previousTotal) return "improving"
  if (latestTotal < previousTotal) return "declining"
  return "flat"
}
