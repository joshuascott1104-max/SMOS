"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireCurrentUser } from "@/lib/auth"
import type { Tables } from "@/types/database"

export async function getKpiEntry(repId: string, weekCommencing: string): Promise<Tables<"kpis"> | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("kpis")
    .select("*")
    .eq("rep_id", repId)
    .eq("week_commencing", weekCommencing)
    .maybeSingle()
  return data
}

export async function upsertKpi(input: {
  repId: string
  weekCommencing: string
  calls: number
  appointments: number
  quotes: number
  wins: number
  revenueWon: number
  forecastValue: number
  qualifiedOpportunities: number
  discoveryMeetings: number
  proposalsIssued: number
  managerNotes: string
}) {
  const user = await requireCurrentUser()
  const supabase = await createClient()

  const conversionRate = input.calls > 0 ? Number(((input.wins / input.calls) * 100).toFixed(2)) : 0
  const activityScore = input.calls * 1 + input.appointments * 3 + input.quotes * 2
  const performanceScore = activityScore + input.wins * 10

  const { error } = await supabase.from("kpis").upsert(
    {
      rep_id: input.repId,
      manager_id: user.id,
      week_commencing: input.weekCommencing,
      calls: input.calls,
      appointments: input.appointments,
      quotes: input.quotes,
      wins: input.wins,
      revenue_won: input.revenueWon,
      forecast_value: input.forecastValue,
      qualified_opportunities: input.qualifiedOpportunities,
      discovery_meetings: input.discoveryMeetings,
      proposals_issued: input.proposalsIssued,
      conversion_rate: conversionRate,
      activity_score: activityScore,
      performance_score: performanceScore,
      manager_notes: input.managerNotes,
    },
    { onConflict: "rep_id,week_commencing" }
  )

  if (error) throw new Error(error.message)
  revalidatePath(`/reps/${input.repId}`)
  revalidatePath("/team")
  revalidatePath("/kpis")
  revalidatePath("/commercial-health")
  revalidatePath(`/reps/${input.repId}/scorecard`)
}
