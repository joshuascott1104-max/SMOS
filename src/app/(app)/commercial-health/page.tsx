import Link from "next/link"
import { getTeamCommercialHealth, currentMonth } from "@/lib/data/commercial-health"
import { PageHeader, Card, EmptyState } from "@/components/ui"
import { RatingBadge } from "@/components/rating-badge"
import { STATUS_COLORS } from "@/lib/scoring"

function shiftMonth(month: string, delta: number): string {
  const d = new Date(month)
  d.setMonth(d.getMonth() + delta)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
}

function formatMonthLabel(month: string): string {
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(new Date(month))
}

export default async function CommercialHealthPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month: rawMonth } = await searchParams
  const month = rawMonth ?? currentMonth()

  const team = await getTeamCommercialHealth(month)
  const teamAverage =
    team.length > 0 ? Math.round((team.reduce((sum, r) => sum + r.score.totalPoints, 0) / team.length) * 10) / 10 : 0

  return (
    <div>
      <PageHeader
        title="Commercial Health"
        subtitle="Module 4 — coaching and commercial discipline across the team. Not a league table or commission structure."
        actions={
          <div className="flex items-center gap-2 text-sm">
            <Link href={`/commercial-health?month=${shiftMonth(month, -1)}`} className="rounded-md border border-zinc-300 px-2 py-1 hover:bg-zinc-50">
              ← Prev
            </Link>
            <span className="font-medium text-zinc-700">{formatMonthLabel(month)}</span>
            <Link href={`/commercial-health?month=${shiftMonth(month, 1)}`} className="rounded-md border border-zinc-300 px-2 py-1 hover:bg-zinc-50">
              Next →
            </Link>
          </div>
        }
      />

      <div className="mb-6 flex items-center gap-4">
        <Card className="flex items-center gap-4">
          <div className="text-sm">
            <p className="text-xs uppercase text-zinc-500">Team average</p>
            <p className="text-2xl font-semibold text-zinc-900">{teamAverage} / 100</p>
          </div>
        </Card>
      </div>

      <Card className="overflow-x-auto p-0">
        {team.length === 0 ? (
          <div className="p-5">
            <EmptyState>No active reps to score.</EmptyState>
          </div>
        ) : (
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3">Rep</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Revenue</th>
                <th className="px-4 py-3">Pipeline</th>
                <th className="px-4 py-3">Delivery</th>
                <th className="px-4 py-3">Standards</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {team.map((r) => {
                const byGroup = (group: string) =>
                  r.score.categories.filter((c) => c.group === group).reduce((sum, c) => sum + c.points, 0)
                return (
                  <tr key={r.repId} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      <Link href={`/reps/${r.repId}/scorecard?month=${month}`} className="hover:underline">
                        {r.repName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex h-8 min-w-[2.5rem] items-center justify-center rounded-md px-2 text-sm font-semibold"
                        style={{
                          backgroundColor: `${STATUS_COLORS[r.score.rating.statusColor]}1a`,
                          color: STATUS_COLORS[r.score.rating.statusColor],
                        }}
                      >
                        {Math.round(r.score.totalPoints)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <RatingBadge rating={r.score.rating} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{byGroup("Commercial Results").toFixed(1)}/40</td>
                    <td className="px-4 py-3 text-zinc-600">{byGroup("Pipeline Development").toFixed(1)}/35</td>
                    <td className="px-4 py-3 text-zinc-600">{byGroup("Commercial Delivery").toFixed(1)}/15</td>
                    <td className="px-4 py-3 text-zinc-600">{byGroup("Professional Standards").toFixed(1)}/10</td>
                    <td className="px-4 py-3">
                      <Link href={`/reps/${r.repId}/scorecard?month=${month}`} className="text-zinc-900 hover:underline">
                        Scorecard →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
