// Module 4 of the Walkers Commercial Operating System — Commercial Performance
// & Health Score. Every KPI scores as (achievement % capped at 100) × weighting;
// the eight weighted categories sum to a score out of 100.

export type CategoryKey =
  | "revenue"
  | "new_customers"
  | "qualified_opportunities"
  | "discovery_meetings"
  | "proposals_issued"
  | "gate_progression"
  | "follow_up_compliance"
  | "crm_discipline"

export type CategoryScore = {
  key: CategoryKey
  label: string
  group: "Commercial Results" | "Pipeline Development" | "Commercial Delivery" | "Professional Standards"
  actual: number
  target: number
  unit: string
  achievementPct: number
  points: number
  maxPoints: number
}

export type RatingBand = {
  key: "elite" | "outstanding" | "strong" | "on_track" | "needs_support" | "immediate_coaching"
  label: string
  statusColor: "good" | "warning" | "serious" | "critical"
}

export const CATEGORY_WEIGHTS: Record<CategoryKey, number> = {
  revenue: 25,
  new_customers: 15,
  qualified_opportunities: 20,
  discovery_meetings: 15,
  proposals_issued: 10,
  gate_progression: 5,
  follow_up_compliance: 5,
  crm_discipline: 5,
}

export const STATUS_COLORS = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
} as const

export function achievementPct(actual: number, target: number): number {
  if (target <= 0) return actual > 0 ? 100 : 0
  return Math.min(100, Math.max(0, (actual / target) * 100))
}

function scoreCategory(
  key: CategoryKey,
  label: string,
  group: CategoryScore["group"],
  actual: number,
  target: number,
  unit: string
): CategoryScore {
  const pct = achievementPct(actual, target)
  const maxPoints = CATEGORY_WEIGHTS[key]
  return {
    key,
    label,
    group,
    actual,
    target,
    unit,
    achievementPct: Math.round(pct * 10) / 10,
    points: Math.round(((pct / 100) * maxPoints) * 10) / 10,
    maxPoints,
  }
}

export function ratingForScore(score: number): RatingBand {
  if (score >= 95) return { key: "elite", label: "Elite", statusColor: "good" }
  if (score >= 90) return { key: "outstanding", label: "Outstanding", statusColor: "good" }
  if (score >= 80) return { key: "strong", label: "Strong", statusColor: "good" }
  if (score >= 70) return { key: "on_track", label: "On Track", statusColor: "warning" }
  if (score >= 60) return { key: "needs_support", label: "Needs Support", statusColor: "serious" }
  return { key: "immediate_coaching", label: "Immediate Coaching Required", statusColor: "critical" }
}

export type CommercialHealthInputs = {
  monthlyRevenueTarget: number
  revenueWonThisMonth: number
  newCustomerTarget: number
  newCustomersWon: number
  qualifiedOpportunitiesWeeklyTarget: number
  qualifiedOpportunitiesActual: number
  discoveryMeetingsWeeklyTarget: number
  discoveryMeetingsActual: number
  proposalsIssuedWeeklyTarget: number
  proposalsIssuedActual: number
  weeksLogged: number
  gateProgressionPct: number
  followUpCompliancePct: number
  crmDisciplinePct: number
}

export type CommercialHealthScore = {
  categories: CategoryScore[]
  totalPoints: number
  rating: RatingBand
}

export function computeCommercialHealthScore(inputs: CommercialHealthInputs): CommercialHealthScore {
  const weeks = Math.max(1, inputs.weeksLogged)

  const categories: CategoryScore[] = [
    scoreCategory(
      "revenue",
      "Revenue vs Monthly Target",
      "Commercial Results",
      inputs.revenueWonThisMonth,
      inputs.monthlyRevenueTarget,
      "£"
    ),
    scoreCategory(
      "new_customers",
      "New Customers Won",
      "Commercial Results",
      inputs.newCustomersWon,
      inputs.newCustomerTarget,
      ""
    ),
    scoreCategory(
      "qualified_opportunities",
      "Qualified Opportunities",
      "Pipeline Development",
      inputs.qualifiedOpportunitiesActual,
      inputs.qualifiedOpportunitiesWeeklyTarget * weeks,
      "/wk"
    ),
    scoreCategory(
      "discovery_meetings",
      "Discovery Meetings",
      "Pipeline Development",
      inputs.discoveryMeetingsActual,
      inputs.discoveryMeetingsWeeklyTarget * weeks,
      "/wk"
    ),
    scoreCategory(
      "proposals_issued",
      "Proposals Issued",
      "Commercial Delivery",
      inputs.proposalsIssuedActual,
      inputs.proposalsIssuedWeeklyTarget * weeks,
      "/wk"
    ),
    scoreCategory(
      "gate_progression",
      "Commercial Gate Progression",
      "Commercial Delivery",
      inputs.gateProgressionPct,
      100,
      "%"
    ),
    scoreCategory(
      "follow_up_compliance",
      "Follow-up Compliance",
      "Professional Standards",
      inputs.followUpCompliancePct,
      100,
      "%"
    ),
    scoreCategory("crm_discipline", "CRM Discipline", "Professional Standards", inputs.crmDisciplinePct, 100, "%"),
  ]

  const totalPoints = Math.round(categories.reduce((sum, c) => sum + c.points, 0) * 10) / 10

  return { categories, totalPoints, rating: ratingForScore(totalPoints) }
}

const COACHING_FOCUS: Record<CategoryKey, string> = {
  revenue: "Revenue is behind target — review the Top 10 for opportunities that can be accelerated this month.",
  new_customers: "New customer wins are behind target — prioritise closing qualified opportunities in the pipeline.",
  qualified_opportunities:
    "Qualified Opportunities are behind the weekly target — increase prospecting activity to rebuild the pipeline.",
  discovery_meetings: "Discovery Meetings are behind target — book more first-contact meetings, face-to-face or Teams.",
  proposals_issued: "Proposals Issued are behind target — convert qualified opportunities into proposals faster.",
  gate_progression: "Opportunities are not progressing through the Commercial Gates cleanly — review next actions on the Top 10.",
  follow_up_compliance: "Follow-up compliance is weak — ensure every opportunity has a next action per the Walkers Follow-up Standard.",
  crm_discipline: "CRM records are stale or incomplete — review and update opportunity records this week.",
}

export function suggestedCoachingFocus(categories: CategoryScore[], limit = 2): string[] {
  return [...categories]
    .filter((c) => c.achievementPct < 70)
    .sort((a, b) => a.achievementPct - b.achievementPct)
    .slice(0, limit)
    .map((c) => COACHING_FOCUS[c.key])
}

export function weakCategories(categories: CategoryScore[]): CategoryScore[] {
  return categories.filter((c) => c.achievementPct < 70)
}
