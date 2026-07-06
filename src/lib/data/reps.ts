import "server-only"
import { createClient } from "@/lib/supabase/server"

export async function listRepsWithSummary() {
  const supabase = await createClient()

  const { data: reps, error } = await supabase
    .from("reps")
    .select("*, depots(id, name)")
    .order("full_name")

  if (error) throw error

  const repIds = reps.map((r) => r.id)

  const [{ data: openActions }, { data: latestKpis }, { data: latestForecasts }, { data: lastReviews }] =
    await Promise.all([
      supabase.from("actions").select("id, linked_rep_id, status").in("linked_rep_id", repIds).eq("status", "open"),
      supabase
        .from("kpis")
        .select("rep_id, week_commencing, performance_score")
        .in("rep_id", repIds)
        .order("week_commencing", { ascending: false }),
      supabase
        .from("forecasts")
        .select("rep_id, month, forecast_value")
        .in("rep_id", repIds)
        .order("month", { ascending: false }),
      supabase
        .from("one_to_one_reviews")
        .select("rep_id, review_date, next_review_date")
        .in("rep_id", repIds)
        .order("review_date", { ascending: false }),
    ])

  const openActionCountByRep = new Map<string, number>()
  for (const a of openActions ?? []) {
    if (!a.linked_rep_id) continue
    openActionCountByRep.set(a.linked_rep_id, (openActionCountByRep.get(a.linked_rep_id) ?? 0) + 1)
  }

  const latestKpiByRep = new Map<string, NonNullable<typeof latestKpis>[number]>()
  for (const k of latestKpis ?? []) {
    if (!latestKpiByRep.has(k.rep_id)) latestKpiByRep.set(k.rep_id, k)
  }

  const latestForecastByRep = new Map<string, NonNullable<typeof latestForecasts>[number]>()
  for (const f of latestForecasts ?? []) {
    if (!f.rep_id) continue
    if (!latestForecastByRep.has(f.rep_id)) latestForecastByRep.set(f.rep_id, f)
  }

  const lastReviewByRep = new Map<string, NonNullable<typeof lastReviews>[number]>()
  for (const r of lastReviews ?? []) {
    if (!lastReviewByRep.has(r.rep_id)) lastReviewByRep.set(r.rep_id, r)
  }

  return reps.map((rep) => ({
    ...rep,
    depotName: rep.depots?.name ?? "—",
    openActionCount: openActionCountByRep.get(rep.id) ?? 0,
    kpiScore: latestKpiByRep.get(rep.id)?.performance_score ?? null,
    forecastValue: latestForecastByRep.get(rep.id)?.forecast_value ?? null,
    lastReviewDate: lastReviewByRep.get(rep.id)?.review_date ?? null,
    nextReviewDate: lastReviewByRep.get(rep.id)?.next_review_date ?? null,
  }))
}

export async function getRepWorkspace(repId: string) {
  const supabase = await createClient()

  const [
    { data: rep },
    { data: opportunities },
    { data: actions },
    { data: kpis },
    { data: meetings },
    { data: reviews },
    { data: objectives },
    { data: submissions },
  ] = await Promise.all([
    supabase.from("reps").select("*, depots(id, name)").eq("id", repId).single(),
    supabase
      .from("strategic_opportunities")
      .select("*")
      .eq("rep_id", repId)
      .order("weighted_value", { ascending: false }),
    supabase.from("actions").select("*").eq("linked_rep_id", repId).order("due_date"),
    supabase.from("kpis").select("*").eq("rep_id", repId).order("week_commencing", { ascending: false }),
    supabase
      .from("meetings")
      .select("*")
      .eq("rep_id", repId)
      .order("meeting_date", { ascending: false }),
    supabase
      .from("one_to_one_reviews")
      .select("*")
      .eq("rep_id", repId)
      .order("review_date", { ascending: false }),
    supabase.from("objectives").select("*").eq("rep_id", repId).order("created_at", { ascending: false }),
    supabase
      .from("weekly_submissions")
      .select("*")
      .eq("rep_id", repId)
      .order("week_commencing", { ascending: false })
      .limit(1),
  ])

  return {
    rep,
    opportunities: opportunities ?? [],
    actions: actions ?? [],
    kpis: kpis ?? [],
    meetings: meetings ?? [],
    reviews: reviews ?? [],
    objectives: objectives ?? [],
    latestSubmission: submissions?.[0] ?? null,
  }
}
