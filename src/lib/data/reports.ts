import "server-only"
import { createClient } from "@/lib/supabase/server"
import { startOfWeek } from "@/lib/format"

export async function getReportsData() {
  const supabase = await createClient()
  const monthStart = `${new Date().toISOString().slice(0, 7)}-01`
  const weekStart = startOfWeek()

  const [
    { data: reps },
    { data: depots },
    { data: kpisThisMonth },
    { data: opportunities },
    { data: forecasts },
    { data: actions },
    { data: reviews },
    { data: objectives },
    { data: submissions },
  ] = await Promise.all([
    supabase.from("reps").select("*"),
    supabase.from("depots").select("*"),
    supabase.from("kpis").select("*, reps:rep_id(full_name, depot_id)").gte("week_commencing", monthStart),
    supabase.from("strategic_opportunities").select("*, reps:rep_id(full_name), depots:depot_id(name)").eq("status", "active"),
    supabase.from("forecasts").select("*, reps:rep_id(full_name), depots:depot_id(name)").gte("month", monthStart),
    supabase.from("actions").select("*"),
    supabase.from("one_to_one_reviews").select("*, reps:rep_id(full_name)"),
    supabase.from("objectives").select("*"),
    supabase.from("weekly_submissions").select("*").eq("week_commencing", weekStart),
  ])

  const kpisThisWeek = (kpisThisMonth ?? []).filter((k) => k.week_commencing === weekStart)

  return {
    reps: reps ?? [],
    depots: depots ?? [],
    kpisThisMonth: kpisThisMonth ?? [],
    kpisThisWeek,
    opportunities: opportunities ?? [],
    forecasts: forecasts ?? [],
    actions: actions ?? [],
    reviews: reviews ?? [],
    objectives: objectives ?? [],
    submissions: submissions ?? [],
    weekStart,
    monthStart,
  }
}
