import "server-only"
import { createClient } from "@/lib/supabase/server"
import { computeCommercialHealthScore, type CommercialHealthScore } from "@/lib/scoring"

const REP_TARGET_COLUMNS =
  "id, full_name, monthly_target, new_customer_target, qualified_opportunities_weekly_target, discovery_meetings_weekly_target, proposals_issued_weekly_target"

export function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
}

function monthRange(month: string) {
  const start = new Date(month)
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 1)
  return { start: month, end: end.toISOString().slice(0, 10) }
}

export type RepCommercialHealth = {
  repId: string
  repName: string
  month: string
  score: CommercialHealthScore
  weeksLogged: number
  targets: {
    monthlyTarget: number
    newCustomerTarget: number
    qualifiedOpportunitiesWeeklyTarget: number
    discoveryMeetingsWeeklyTarget: number
    proposalsIssuedWeeklyTarget: number
  }
  manualEntry: {
    id: string | null
    newCustomersWon: number
    gateProgressionPct: number
    followUpCompliancePct: number
    crmDisciplinePct: number
    managerNotes: string
  }
}

type RepTargetRow = {
  id: string
  full_name: string
  monthly_target: number
  new_customer_target: number
  qualified_opportunities_weekly_target: number
  discovery_meetings_weekly_target: number
  proposals_issued_weekly_target: number
}

async function computeForRep(rep: RepTargetRow, month: string): Promise<RepCommercialHealth> {
  const supabase = await createClient()
  const { start, end } = monthRange(month)

  const [{ data: kpis }, { data: scoreRow }] = await Promise.all([
    supabase
      .from("kpis")
      .select("revenue_won, qualified_opportunities, discovery_meetings, proposals_issued")
      .eq("rep_id", rep.id)
      .gte("week_commencing", start)
      .lt("week_commencing", end),
    supabase.from("commercial_scores").select("*").eq("rep_id", rep.id).eq("month", month).maybeSingle(),
  ])

  const weeksLogged = kpis?.length ?? 0
  const totals = (kpis ?? []).reduce(
    (acc, k) => {
      acc.revenue += Number(k.revenue_won)
      acc.qualifiedOpportunities += k.qualified_opportunities
      acc.discoveryMeetings += k.discovery_meetings
      acc.proposalsIssued += k.proposals_issued
      return acc
    },
    { revenue: 0, qualifiedOpportunities: 0, discoveryMeetings: 0, proposalsIssued: 0 }
  )

  const score = computeCommercialHealthScore({
    monthlyRevenueTarget: Number(rep.monthly_target),
    revenueWonThisMonth: totals.revenue,
    newCustomerTarget: rep.new_customer_target,
    newCustomersWon: scoreRow?.new_customers_won ?? 0,
    qualifiedOpportunitiesWeeklyTarget: rep.qualified_opportunities_weekly_target,
    qualifiedOpportunitiesActual: totals.qualifiedOpportunities,
    discoveryMeetingsWeeklyTarget: rep.discovery_meetings_weekly_target,
    discoveryMeetingsActual: totals.discoveryMeetings,
    proposalsIssuedWeeklyTarget: rep.proposals_issued_weekly_target,
    proposalsIssuedActual: totals.proposalsIssued,
    weeksLogged,
    gateProgressionPct: scoreRow?.gate_progression_pct ?? 0,
    followUpCompliancePct: scoreRow?.follow_up_compliance_pct ?? 0,
    crmDisciplinePct: scoreRow?.crm_discipline_pct ?? 0,
  })

  return {
    repId: rep.id,
    repName: rep.full_name,
    month,
    score,
    weeksLogged,
    targets: {
      monthlyTarget: Number(rep.monthly_target),
      newCustomerTarget: rep.new_customer_target,
      qualifiedOpportunitiesWeeklyTarget: rep.qualified_opportunities_weekly_target,
      discoveryMeetingsWeeklyTarget: rep.discovery_meetings_weekly_target,
      proposalsIssuedWeeklyTarget: rep.proposals_issued_weekly_target,
    },
    manualEntry: {
      id: scoreRow?.id ?? null,
      newCustomersWon: scoreRow?.new_customers_won ?? 0,
      gateProgressionPct: scoreRow?.gate_progression_pct ?? 0,
      followUpCompliancePct: scoreRow?.follow_up_compliance_pct ?? 0,
      crmDisciplinePct: scoreRow?.crm_discipline_pct ?? 0,
      managerNotes: scoreRow?.manager_notes ?? "",
    },
  }
}

export async function getRepCommercialHealth(repId: string, month: string): Promise<RepCommercialHealth | null> {
  const supabase = await createClient()
  const { data: rep } = await supabase.from("reps").select(REP_TARGET_COLUMNS).eq("id", repId).single()

  if (!rep) return null
  return computeForRep(rep, month)
}

export async function getTeamCommercialHealth(month: string): Promise<RepCommercialHealth[]> {
  const supabase = await createClient()
  const { data: reps } = await supabase.from("reps").select(REP_TARGET_COLUMNS).eq("status", "active").order("full_name")

  if (!reps || reps.length === 0) return []

  return Promise.all(reps.map((rep) => computeForRep(rep, month)))
}
