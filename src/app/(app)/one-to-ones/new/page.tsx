import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { requireCurrentUser } from "@/lib/auth"
import { getRepCommercialHealth, currentMonth } from "@/lib/data/commercial-health"
import { PageHeader, Card, CardHeading, EmptyState, Badge } from "@/components/ui"
import { formatCurrency, formatDate } from "@/lib/format"
import { ScoreRing } from "@/components/score-ring"
import { RatingBadge } from "@/components/rating-badge"
import { OneToOneForm } from "./form"

export default async function NewOneToOnePage({ searchParams }: { searchParams: Promise<{ repId?: string }> }) {
  const { repId } = await searchParams
  const user = await requireCurrentUser()
  const supabase = await createClient()

  const { data: reps } = await supabase.from("reps").select("id, full_name").eq("status", "active").order("full_name")

  if (!repId) {
    return (
      <div>
        <PageHeader title="Start a 1-to-1" subtitle="Choose which rep this review is for." />
        <Card>
          <ul className="divide-y divide-zinc-100">
            {(reps ?? []).map((r) => (
              <li key={r.id} className="py-2">
                <a href={`/one-to-ones/new?repId=${r.id}`} className="text-sm font-medium text-zinc-900 hover:underline">
                  {r.full_name}
                </a>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    )
  }

  const [{ data: rep }, { data: objectives }, { data: kpis }, health] = await Promise.all([
    supabase.from("reps").select("*, depots(name)").eq("id", repId).single(),
    supabase.from("objectives").select("*").eq("rep_id", repId).neq("status", "completed").order("created_at"),
    supabase.from("kpis").select("*").eq("rep_id", repId).order("week_commencing", { ascending: false }).limit(6),
    getRepCommercialHealth(repId, currentMonth()),
  ])

  if (!rep) notFound()

  return (
    <div>
      <PageHeader title={`1-to-1 — ${rep.full_name}`} subtitle={rep.depots?.name ?? "—"} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {health && (
          <Card className="flex items-center gap-4 lg:col-span-2">
            <ScoreRing score={health.score.totalPoints} rating={health.score.rating} size={88} />
            <div>
              <p className="text-xs uppercase text-zinc-500">This month&apos;s Commercial Health Score</p>
              <RatingBadge rating={health.score.rating} size="sm" />
              <Link href={`/reps/${repId}/scorecard`} className="mt-2 block text-sm font-medium text-zinc-900 hover:underline">
                Full breakdown →
              </Link>
            </div>
          </Card>
        )}

        <Card>
          <CardHeading count={objectives?.length ?? 0}>1. Previous objectives</CardHeading>
          {!objectives || objectives.length === 0 ? (
            <EmptyState>No active objectives to review.</EmptyState>
          ) : (
            <ul className="space-y-2 text-sm">
              {objectives.map((o) => (
                <li key={o.id} className="flex items-center justify-between">
                  <span className="text-zinc-900">{o.objective}</span>
                  <Badge value={o.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeading count={kpis?.length ?? 0}>2. Performance trend</CardHeading>
          {!kpis || kpis.length === 0 ? (
            <EmptyState>No KPI history yet.</EmptyState>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-zinc-500">
                  <th className="py-1 pr-2">Week</th>
                  <th className="py-1 pr-2">Calls</th>
                  <th className="py-1 pr-2">Wins</th>
                  <th className="py-1 pr-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {kpis.map((k) => (
                  <tr key={k.id}>
                    <td className="py-1 pr-2 text-zinc-600">{formatDate(k.week_commencing)}</td>
                    <td className="py-1 pr-2 text-zinc-600">{k.calls}</td>
                    <td className="py-1 pr-2 text-zinc-600">{k.wins}</td>
                    <td className="py-1 pr-2 text-zinc-600">{formatCurrency(k.revenue_won)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <OneToOneForm repId={repId} managerId={user.id} existingObjectives={objectives ?? []} />
      </div>
    </div>
  )
}
