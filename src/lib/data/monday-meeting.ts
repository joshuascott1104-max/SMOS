import "server-only"
import { createClient } from "@/lib/supabase/server"

export async function getMondayMeetingContext(repId: string | null) {
  const supabase = await createClient()

  const actionsQuery = supabase
    .from("actions")
    .select("*, reps:linked_rep_id(full_name)")
    .in("status", ["open", "completed", "replanned"])
    .order("due_date", { ascending: false })
    .limit(20)
  const previousActions = repId
    ? await actionsQuery.eq("linked_rep_id", repId)
    : await actionsQuery

  const kpiQuery = supabase.from("kpis").select("*, reps:rep_id(full_name)").order("week_commencing", { ascending: false })
  const { data: kpis } = repId ? await kpiQuery.eq("rep_id", repId).limit(1) : await kpiQuery.limit(50)

  const latestKpiByRep = new Map<string, NonNullable<typeof kpis>[number]>()
  for (const k of kpis ?? []) {
    if (!latestKpiByRep.has(k.rep_id)) latestKpiByRep.set(k.rep_id, k)
  }
  const kpiExceptions = [...latestKpiByRep.values()].filter(
    (k) => k.wins === 0 || Number(k.revenue_won) < Number(k.forecast_value)
  )

  const oppQuery = supabase
    .from("strategic_opportunities")
    .select("*, reps:rep_id(full_name)")
    .eq("status", "active")
    .order("weighted_value", { ascending: false })
  const { data: opportunities } = repId ? await oppQuery.eq("rep_id", repId).limit(10) : await oppQuery.limit(10)

  return {
    previousActions: previousActions.data ?? [],
    kpiExceptions,
    opportunities: opportunities ?? [],
  }
}
