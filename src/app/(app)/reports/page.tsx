import { getReportsData } from "@/lib/data/reports"
import { PageHeader, Card, CardHeading, EmptyState, Badge } from "@/components/ui"
import { formatCurrency, formatDate, isOverdue } from "@/lib/format"

export default async function ReportsPage() {
  const { reps, depots, kpisThisMonth, kpisThisWeek, opportunities, forecasts, actions, reviews, objectives, submissions, weekStart } =
    await getReportsData()

  // 1. Weekly Manager Report
  const weeklyRevenue = kpisThisWeek.reduce((sum, k) => sum + Number(k.revenue_won), 0)
  const weeklyWins = kpisThisWeek.reduce((sum, k) => sum + k.wins, 0)
  const submissionsReviewed = submissions.filter((s) => s.manager_reviewed).length

  // 2. Monthly Rep Report
  const revenueByRep = new Map<string, number>()
  for (const k of kpisThisMonth) {
    revenueByRep.set(k.rep_id, (revenueByRep.get(k.rep_id) ?? 0) + Number(k.revenue_won))
  }

  // 3. Depot Report
  const depotStats = depots.map((d) => {
    const depotReps = reps.filter((r) => r.depot_id === d.id)
    const depotRepIds = new Set(depotReps.map((r) => r.id))
    const revenue = kpisThisMonth
      .filter((k) => depotRepIds.has(k.rep_id))
      .reduce((sum, k) => sum + Number(k.revenue_won), 0)
    const target = depotReps.reduce((sum, r) => sum + Number(r.monthly_target), 0)
    const activeOpps = opportunities.filter((o) => o.depot_id === d.id).length
    return { depot: d, repCount: depotReps.length, revenue, target, activeOpps }
  })

  // 4. Strategic Opportunity Report
  const totalWeighted = opportunities.reduce((sum, o) => sum + Number(o.weighted_value ?? 0), 0)
  const supportNeeded = opportunities.filter((o) => o.support_required).length

  // 5. Forecast Report
  const forecastTotals = forecasts.reduce(
    (acc, f) => {
      acc.target += Number(f.target)
      acc.forecast += Number(f.forecast_value)
      return acc
    },
    { target: 0, forecast: 0 }
  )

  // 6. Action Completion Report
  const completed = actions.filter((a) => a.status === "completed").length
  const open = actions.filter((a) => a.status === "open").length
  const overdue = actions.filter((a) => isOverdue(a.due_date, a.status)).length
  const replanned = actions.filter((a) => a.status === "replanned").length
  const cancelled = actions.filter((a) => a.status === "cancelled").length
  const completionRate = actions.length > 0 ? Math.round((completed / actions.length) * 100) : 0

  // 7. 1-to-1 Completion Report
  const activeObjectives = objectives.filter((o) => o.status !== "completed").length
  const reviewsByRep = new Map<string, number>()
  for (const r of reviews) {
    reviewsByRep.set(r.rep_id, (reviewsByRep.get(r.rep_id) ?? 0) + 1)
  }
  const repsWithNoReview = reps.filter((r) => !reviewsByRep.has(r.id))

  return (
    <div>
      <PageHeader title="Reports" subtitle="The seven V1 management reports." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeading>1. Weekly Manager Report</CardHeading>
          <p className="text-xs text-zinc-500">Week commencing {formatDate(weekStart)}</p>
          <dl className="mt-2 grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-zinc-500">Revenue won this week</dt>
            <dd className="text-right font-medium text-zinc-900">{formatCurrency(weeklyRevenue)}</dd>
            <dt className="text-zinc-500">Wins this week</dt>
            <dd className="text-right font-medium text-zinc-900">{weeklyWins}</dd>
            <dt className="text-zinc-500">Top 10 submissions</dt>
            <dd className="text-right font-medium text-zinc-900">{submissions.length}</dd>
            <dt className="text-zinc-500">Submissions reviewed</dt>
            <dd className="text-right font-medium text-zinc-900">{submissionsReviewed}</dd>
          </dl>
        </Card>

        <Card>
          <CardHeading>2. Monthly Rep Report</CardHeading>
          {reps.length === 0 ? (
            <EmptyState>No reps yet.</EmptyState>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-zinc-500">
                  <th className="py-1">Rep</th>
                  <th className="py-1">Target</th>
                  <th className="py-1">Revenue MTD</th>
                </tr>
              </thead>
              <tbody>
                {reps.map((r) => (
                  <tr key={r.id} className="border-t border-zinc-100">
                    <td className="py-1 font-medium text-zinc-900">{r.full_name}</td>
                    <td className="py-1 text-zinc-600">{formatCurrency(r.monthly_target)}</td>
                    <td className="py-1 text-zinc-600">{formatCurrency(revenueByRep.get(r.id) ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <CardHeading>3. Depot Report</CardHeading>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-zinc-500">
                <th className="py-1">Depot</th>
                <th className="py-1">Reps</th>
                <th className="py-1">Target</th>
                <th className="py-1">Revenue MTD</th>
                <th className="py-1">Active opps</th>
              </tr>
            </thead>
            <tbody>
              {depotStats.map((d) => (
                <tr key={d.depot.id} className="border-t border-zinc-100">
                  <td className="py-1 font-medium text-zinc-900">{d.depot.name}</td>
                  <td className="py-1 text-zinc-600">{d.repCount}</td>
                  <td className="py-1 text-zinc-600">{formatCurrency(d.target)}</td>
                  <td className="py-1 text-zinc-600">{formatCurrency(d.revenue)}</td>
                  <td className="py-1 text-zinc-600">{d.activeOpps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeading>4. Strategic Opportunity Report</CardHeading>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-zinc-500">Active opportunities</dt>
            <dd className="text-right font-medium text-zinc-900">{opportunities.length}</dd>
            <dt className="text-zinc-500">Total weighted value</dt>
            <dd className="text-right font-medium text-zinc-900">{formatCurrency(totalWeighted)}</dd>
            <dt className="text-zinc-500">Needing support</dt>
            <dd className="text-right font-medium text-zinc-900">{supportNeeded}</dd>
          </dl>
        </Card>

        <Card>
          <CardHeading>5. Forecast Report</CardHeading>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-zinc-500">Total target (this month)</dt>
            <dd className="text-right font-medium text-zinc-900">{formatCurrency(forecastTotals.target)}</dd>
            <dt className="text-zinc-500">Total forecast</dt>
            <dd className="text-right font-medium text-zinc-900">{formatCurrency(forecastTotals.forecast)}</dd>
            <dt className="text-zinc-500">Gap to target</dt>
            <dd className={`text-right font-medium ${forecastTotals.forecast < forecastTotals.target ? "text-red-600" : "text-emerald-600"}`}>
              {formatCurrency(forecastTotals.target - forecastTotals.forecast)}
            </dd>
          </dl>
        </Card>

        <Card>
          <CardHeading>6. Action Completion Report</CardHeading>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-zinc-500">Completion rate</dt>
            <dd className="text-right font-medium text-zinc-900">{completionRate}%</dd>
            <dt className="text-zinc-500">Open</dt>
            <dd className="text-right font-medium text-zinc-900">{open}</dd>
            <dt className="text-zinc-500">Overdue</dt>
            <dd className="text-right font-medium text-red-600">{overdue}</dd>
            <dt className="text-zinc-500">Completed</dt>
            <dd className="text-right font-medium text-zinc-900">{completed}</dd>
            <dt className="text-zinc-500">Replanned</dt>
            <dd className="text-right font-medium text-zinc-900">{replanned}</dd>
            <dt className="text-zinc-500">Cancelled</dt>
            <dd className="text-right font-medium text-zinc-900">{cancelled}</dd>
          </dl>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeading>7. 1-to-1 Completion Report</CardHeading>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-zinc-500">Total 1-to-1s recorded</dt>
            <dd className="text-right font-medium text-zinc-900">{reviews.length}</dd>
            <dt className="text-zinc-500">Active objectives across team</dt>
            <dd className="text-right font-medium text-zinc-900">{activeObjectives}</dd>
          </dl>
          {repsWithNoReview.length > 0 && (
            <div className="mt-3 border-t border-zinc-100 pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Never reviewed</p>
              <div className="flex flex-wrap gap-2">
                {repsWithNoReview.map((r) => (
                  <Badge key={r.id} value="overdue" label={r.full_name} />
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
