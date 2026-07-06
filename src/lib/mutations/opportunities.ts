"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export type OpportunityInput = {
  companyName: string
  repId: string
  depotId: string
  estimatedMonthlyRevenue: number
  stage: string
  probability: number
  expectedCloseMonth: string | null
  nextAction: string
  supportRequired: boolean
  supportReason: string | null
  managerNotes: string | null
}

function revalidateOpportunitySurfaces(repId: string) {
  revalidatePath("/opportunities")
  revalidatePath("/today")
  revalidatePath(`/reps/${repId}`)
}

export async function createOpportunity(input: OpportunityInput) {
  const supabase = await createClient()

  const { error } = await supabase.from("strategic_opportunities").insert({
    company_name: input.companyName,
    rep_id: input.repId,
    depot_id: input.depotId,
    estimated_monthly_revenue: input.estimatedMonthlyRevenue,
    stage: input.stage,
    probability: input.probability,
    expected_close_month: input.expectedCloseMonth,
    next_action: input.nextAction,
    support_required: input.supportRequired,
    support_reason: input.supportRequired ? input.supportReason : null,
    manager_notes: input.managerNotes,
    last_reviewed: new Date().toISOString().slice(0, 10),
  })

  if (error) throw new Error(error.message)
  revalidateOpportunitySurfaces(input.repId)
}

export async function updateOpportunity(id: string, repId: string, input: Partial<OpportunityInput>) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("strategic_opportunities")
    .update({
      company_name: input.companyName,
      estimated_monthly_revenue: input.estimatedMonthlyRevenue,
      stage: input.stage,
      probability: input.probability,
      expected_close_month: input.expectedCloseMonth,
      next_action: input.nextAction,
      support_required: input.supportRequired,
      support_reason: input.supportRequired ? input.supportReason : null,
      manager_notes: input.managerNotes,
      last_reviewed: new Date().toISOString().slice(0, 10),
    })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidateOpportunitySurfaces(repId)
}

export async function setOpportunityStatus(id: string, repId: string, status: "won" | "lost" | "archived" | "active") {
  const supabase = await createClient()
  const { error } = await supabase.from("strategic_opportunities").update({ status }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidateOpportunitySurfaces(repId)
}
