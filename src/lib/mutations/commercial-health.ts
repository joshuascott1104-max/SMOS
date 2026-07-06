"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireCurrentUser } from "@/lib/auth"

export async function upsertCommercialScore(input: {
  repId: string
  month: string
  newCustomersWon: number
  gateProgressionPct: number
  followUpCompliancePct: number
  crmDisciplinePct: number
  managerNotes: string
}) {
  const user = await requireCurrentUser()
  const supabase = await createClient()

  const { error } = await supabase.from("commercial_scores").upsert(
    {
      rep_id: input.repId,
      manager_id: user.id,
      month: input.month,
      new_customers_won: input.newCustomersWon,
      gate_progression_pct: input.gateProgressionPct,
      follow_up_compliance_pct: input.followUpCompliancePct,
      crm_discipline_pct: input.crmDisciplinePct,
      manager_notes: input.managerNotes,
    },
    { onConflict: "rep_id,month" }
  )

  if (error) throw new Error(error.message)
  revalidatePath(`/reps/${input.repId}/scorecard`)
  revalidatePath(`/reps/${input.repId}`)
  revalidatePath("/commercial-health")
}
