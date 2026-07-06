import { createClient } from "@/lib/supabase/server"
import { PageHeader, Card, CardHeading, EmptyState, Badge } from "@/components/ui"
import { formatCurrency, formatDate } from "@/lib/format"
import { ForecastForm } from "./form"

export default async function ForecastPage() {
  const supabase = await createClient()

  const [{ data: reps }, { data: depots }, { data: forecasts }] = await Promise.all([
    supabase.from("reps").select("id, full_name").eq("status", "active").order("full_name"),
    supabase.from("depots").select("id, name").order("name"),
    supabase
      .from("forecasts")
      .select("*, reps:rep_id(full_name), depots:depot_id(name)")
      .order("month", { ascending: false })
      .limit(40),
  ])

  const totals = (forecasts ?? []).reduce(
    (acc, f) => {
      acc.target += Number(f.target)
      acc.forecast += Number(f.forecast_value)
      acc.weighted += Number(f.weighted_forecast)
      return acc
    },
    { target: 0, forecast: 0, weighted: 0 }
  )

  return (
    <div>
      <PageHeader title="Forecast" subtitle="Target vs forecast by rep and depot." />

      <div className="mb-6 grid grid-cols-3 gap-4">
        <Card>
          <p className="text-xs uppercase text-zinc-500">Total target</p>
          <p className="text-xl font-semibold text-zinc-900">{formatCurrency(totals.target)}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-zinc-500">Total forecast</p>
          <p className="text-xl font-semibold text-zinc-900">{formatCurrency(totals.forecast)}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-zinc-500">Weighted forecast</p>
          <p className="text-xl font-semibold text-zinc-900">{formatCurrency(totals.weighted)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-x-auto p-0">
          <CardHeading>By rep / depot</CardHeading>
          {!forecasts || forecasts.length === 0 ? (
            <div className="px-5 pb-5">
              <EmptyState>No forecasts recorded yet.</EmptyState>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <th className="px-4 py-2">Rep / Depot</th>
                  <th className="px-4 py-2">Month</th>
                  <th className="px-4 py-2">Target</th>
                  <th className="px-4 py-2">Forecast</th>
                  <th className="px-4 py-2">Weighted</th>
                  <th className="px-4 py-2">Gap</th>
                  <th className="px-4 py-2">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map((f) => (
                  <tr key={f.id} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-2 font-medium text-zinc-900">{f.reps?.full_name ?? f.depots?.name}</td>
                    <td className="px-4 py-2 text-zinc-600">{formatDate(f.month)}</td>
                    <td className="px-4 py-2 text-zinc-600">{formatCurrency(f.target)}</td>
                    <td className="px-4 py-2 text-zinc-600">{formatCurrency(f.forecast_value)}</td>
                    <td className="px-4 py-2 text-zinc-600">{formatCurrency(f.weighted_forecast)}</td>
                    <td className={`px-4 py-2 ${Number(f.gap_to_target) > 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {formatCurrency(f.gap_to_target)}
                    </td>
                    <td className="px-4 py-2">{f.confidence && <Badge value={f.confidence} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <CardHeading>Add forecast</CardHeading>
          <ForecastForm reps={reps ?? []} depots={depots ?? []} />
        </Card>
      </div>
    </div>
  )
}
