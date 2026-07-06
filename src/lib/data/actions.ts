import "server-only"
import { createClient } from "@/lib/supabase/server"

export type ActionView = "open" | "due_today" | "due_this_week" | "overdue" | "completed" | "replanned" | "cancelled"

export async function listActions(view: ActionView = "open") {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)
  const weekEnd = new Date()
  weekEnd.setDate(weekEnd.getDate() + 7)
  const weekEndStr = weekEnd.toISOString().slice(0, 10)

  let query = supabase
    .from("actions")
    .select(
      "*, reps:linked_rep_id(id, full_name), opportunities:linked_opportunity_id(id, company_name), meetings:linked_meeting_id(id, meeting_type, meeting_date)"
    )

  switch (view) {
    case "due_today":
      query = query.eq("status", "open").eq("due_date", today)
      break
    case "due_this_week":
      query = query.eq("status", "open").gte("due_date", today).lte("due_date", weekEndStr)
      break
    case "overdue":
      query = query.eq("status", "open").lt("due_date", today)
      break
    case "completed":
      query = query.eq("status", "completed")
      break
    case "replanned":
      query = query.eq("status", "replanned")
      break
    case "cancelled":
      query = query.eq("status", "cancelled")
      break
    default:
      query = query.eq("status", "open")
  }

  const { data, error } = await query.order("due_date")
  if (error) throw error
  return data ?? []
}
