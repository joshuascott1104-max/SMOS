import { createClient } from "@/lib/supabase/server"
import { PageHeader, Card, CardHeading, EmptyState } from "@/components/ui"
import { formatCurrency, formatDate } from "@/lib/format"
import { KpiForm } from "./form"

export default async function KpisPage() {
  const supabase = await createClient()

  const [{ data: reps }, { data: kpis }] = await Promise.all([
    supabase
      .from("reps")
      .select(
        "id, full_name, qualified_opportunities_weekly_target, discovery_meetings_weekly_target, proposals_issued_weekly_target"
      )
      .eq("status", "active")
      .order("full_name"),
    supabase
      .from("kpis")
      .select("*, reps:rep_id(full_name)")
      .order("week_commencing", { ascending: false })
      .limit(30),
  ])

  return (
    <div>
      <PageHeader title="KPI Snapshots" subtitle="Weekly activity and performance by rep." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-x-auto p-0">
          <CardHeading>Recent weeks</CardHeading>
          {!kpis || kpis.length === 0 ? (
            <div className="px-5 pb-5">
              <EmptyState>No KPI snapshots recorded yet.</EmptyState>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <th className="px-4 py-2">Rep</th>
                  <th className="px-4 py-2">Week</th>
                  <th className="px-4 py-2">Calls</th>
                  <th className="px-4 py-2">Appts</th>
                  <th className="px-4 py-2">Quotes</th>
                  <th className="px-4 py-2">Wins</th>
                  <th className="px-4 py-2">Revenue</th>
                  <th className="px-4 py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {kpis.map((k) => (
                  <tr key={k.id} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-2 font-medium text-zinc-900">{k.reps?.full_name}</td>
                    <td className="px-4 py-2 text-zinc-600">{formatDate(k.week_commencing)}</td>
                    <td className="px-4 py-2 text-zinc-600">{k.calls}</td>
                    <td className="px-4 py-2 text-zinc-600">{k.appointments}</td>
                    <td className="px-4 py-2 text-zinc-600">{k.quotes}</td>
                    <td className="px-4 py-2 text-zinc-600">{k.wins}</td>
                    <td className="px-4 py-2 text-zinc-600">{formatCurrency(k.revenue_won)}</td>
                    <td className="px-4 py-2 text-zinc-600">{k.performance_score ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <CardHeading>Log weekly KPIs</CardHeading>
          <KpiForm reps={reps ?? []} />
        </Card>
      </div>
    </div>
  )
}
