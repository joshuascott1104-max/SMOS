import "server-only"
import { createClient } from "@/lib/supabase/server"
import { startOfWeek } from "@/lib/format"

export async function getTodayDashboard() {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)
  const weekEnd = new Date()
  weekEnd.setDate(weekEnd.getDate() + 7)
  const weekEndStr = weekEnd.toISOString().slice(0, 10)
  const weekStart = startOfWeek()

  const [
    { data: overdueActions },
    { data: dueThisWeekActions },
    { data: upcomingMeetings },
    { data: pendingSubmissions },
    { data: supportOpportunities },
    { data: forecasts },
  ] = await Promise.all([
    supabase
      .from("actions")
      .select("*, reps:linked_rep_id(full_name)")
      .eq("status", "open")
      .lt("due_date", today)
      .order("due_date"),
    supabase
      .from("actions")
      .select("*, reps:linked_rep_id(full_name)")
      .eq("status", "open")
      .gte("due_date", today)
      .lte("due_date", weekEndStr)
      .order("due_date"),
    supabase
      .from("meetings")
      .select("*, reps:rep_id(full_name)")
      .in("status", ["scheduled", "in_progress"])
      .order("meeting_date")
      .limit(10),
    supabase
      .from("weekly_submissions")
      .select("*, reps:rep_id(full_name)")
      .eq("manager_reviewed", false)
      .order("week_commencing", { ascending: false }),
    supabase
      .from("strategic_opportunities")
      .select("*, reps:rep_id(full_name), depots:depot_id(name)")
      .eq("status", "active")
      .eq("support_required", true)
      .order("estimated_monthly_revenue", { ascending: false }),
    supabase
      .from("forecasts")
      .select("*")
      .gte("month", `${new Date().toISOString().slice(0, 7)}-01`),
  ])

  const forecastTotals = (forecasts ?? []).reduce(
    (acc, f) => {
      acc.target += Number(f.target)
      acc.forecast += Number(f.forecast_value)
      acc.weighted += Number(f.weighted_forecast)
      return acc
    },
    { target: 0, forecast: 0, weighted: 0 }
  )

  return {
    overdueActions: overdueActions ?? [],
    dueThisWeekActions: dueThisWeekActions ?? [],
    upcomingMeetings: upcomingMeetings ?? [],
    pendingSubmissions: pendingSubmissions ?? [],
    supportOpportunities: supportOpportunities ?? [],
    forecastTotals,
    weekStart,
  }
}
