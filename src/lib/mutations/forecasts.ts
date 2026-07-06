"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function upsertForecast(input: {
  repId: string | null
  depotId: string | null
  month: string
  target: number
  forecastValue: number
  weightedForecast: number
  confidence: "low" | "medium" | "high"
  managerNotes: string
}) {
  const supabase = await createClient()

  const { error } = await supabase.from("forecasts").insert({
    rep_id: input.repId,
    depot_id: input.depotId,
    month: input.month,
    target: input.target,
    forecast_value: input.forecastValue,
    weighted_forecast: input.weightedForecast,
    confidence: input.confidence,
    manager_notes: input.managerNotes,
  })

  if (error) throw new Error(error.message)
  revalidatePath("/forecast")
  revalidatePath("/today")
  if (input.repId) revalidatePath(`/reps/${input.repId}`)
}
