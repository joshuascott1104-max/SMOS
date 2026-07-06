import { createClient } from "@/lib/supabase/server"
import { requireCurrentUser } from "@/lib/auth"
import { getMondayMeetingContext } from "@/lib/data/monday-meeting"
import { PageHeader, Card, CardHeading, EmptyState, Badge } from "@/components/ui"
import { formatCurrency, formatDate } from "@/lib/format"
import { MondayMeetingForm } from "./form"

export default async function NewMondayMeetingPage({
  searchParams,
}: {
  searchParams: Promise<{ repId?: string }>
}) {
  const { repId } = await searchParams
  const user = await requireCurrentUser()
  const supabase = await createClient()

  const [{ data: rep }, { previousActions, kpiExceptions, opportunities }, { data: reps }] = await Promise.all([
    repId ? supabase.from("reps").select("*, depots(id, name)").eq("id", repId).single() : Promise.resolve({ data: null }),
    getMondayMeetingContext(repId ?? null),
    supabase.from("reps").select("id, full_name").eq("status", "active").order("full_name"),
  ])

  return (
    <div>
      <PageHeader
        title="Monday Meeting"
        subtitle={rep ? `Scoped to ${rep.full_name} · ${rep.depots?.name}` : "Team-wide review"}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeading count={previousActions.length}>1. Previous actions</CardHeading>
          {previousActions.length === 0 ? (
            <EmptyState>No prior actions to review.</EmptyState>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
              {previousActions.map((a) => (
                <li key={a.id} className="flex items-center justify-between">
                  <span className="text-zinc-900">
                    {a.title} {a.reps ? `(${a.reps.full_name})` : ""}
                  </span>
                  <Badge value={a.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeading count={kpiExceptions.length}>2. KPI exceptions</CardHeading>
          {kpiExceptions.length === 0 ? (
            <EmptyState>No KPI exceptions this week.</EmptyState>
          ) : (
            <ul className="space-y-2 text-sm">
              {kpiExceptions.map((k) => (
                <li key={k.id} className="flex items-center justify-between">
                  <span className="text-zinc-900">{k.reps?.full_name}</span>
                  <span className="text-xs text-zinc-500">
                    {k.wins} wins · {formatCurrency(k.revenue_won)} vs {formatCurrency(k.forecast_value)} forecast
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeading count={opportunities.length}>3. Top 10 opportunities</CardHeading>
          {opportunities.length === 0 ? (
            <EmptyState>No active opportunities to review.</EmptyState>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <th className="py-2 pr-2">Company</th>
                  <th className="py-2 pr-2">Rep</th>
                  <th className="py-2 pr-2">Value</th>
                  <th className="py-2 pr-2">Stage</th>
                  <th className="py-2 pr-2">Close</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((o) => (
                  <tr key={o.id} className="border-b border-zinc-100 last:border-0">
                    <td className="py-2 pr-2 font-medium text-zinc-900">{o.company_name}</td>
                    <td className="py-2 pr-2 text-zinc-600">{o.reps?.full_name}</td>
                    <td className="py-2 pr-2 text-zinc-600">{formatCurrency(o.estimated_monthly_revenue)}</td>
                    <td className="py-2 pr-2">
                      <Badge value={o.stage} />
                    </td>
                    <td className="py-2 pr-2 text-zinc-600">{formatDate(o.expected_close_month)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <MondayMeetingForm
          repId={repId ?? null}
          depotId={rep?.depot_id ?? null}
          managerId={user.id}
          reps={reps ?? []}
        />
      </div>
    </div>
  )
}
