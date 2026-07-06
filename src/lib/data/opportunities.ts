import "server-only"
import { createClient } from "@/lib/supabase/server"

export type OpportunityView =
  | "by_depot"
  | "by_rep"
  | "highest_value"
  | "highest_probability"
  | "support_required"
  | "closing_this_month"

export async function listOpportunities(view: OpportunityView = "highest_value") {
  const supabase = await createClient()

  let query = supabase
    .from("strategic_opportunities")
    .select("*, reps:rep_id(id, full_name), depots:depot_id(id, name)")
    .eq("status", "active")

  if (view === "support_required") {
    query = query.eq("support_required", true)
  }

  if (view === "closing_this_month") {
    const now = new Date()
    const monthStart = `${now.toISOString().slice(0, 7)}-01`
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 10)
    query = query.gte("expected_close_month", monthStart).lt("expected_close_month", nextMonth)
  }

  const { data, error } = await query
  if (error) throw error

  const rows = data ?? []

  switch (view) {
    case "by_depot":
      return [...rows].sort((a, b) => (a.depots?.name ?? "").localeCompare(b.depots?.name ?? ""))
    case "by_rep":
      return [...rows].sort((a, b) => (a.reps?.full_name ?? "").localeCompare(b.reps?.full_name ?? ""))
    case "highest_probability":
      return [...rows].sort((a, b) => b.probability - a.probability)
    default:
      return [...rows].sort((a, b) => Number(b.weighted_value ?? 0) - Number(a.weighted_value ?? 0))
  }
}
