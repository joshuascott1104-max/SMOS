import Link from "next/link"
import { notFound } from "next/navigation"
import { getRepWorkspace } from "@/lib/data/reps"
import { getRepCommercialHealth, currentMonth } from "@/lib/data/commercial-health"
import { requireCurrentUser } from "@/lib/auth"
import { PageHeader, Card, CardHeading, EmptyState, Badge, LinkButton } from "@/components/ui"
import { formatCurrency, formatDate, labelize, isDueSoon } from "@/lib/format"
import { ScoreRing } from "@/components/score-ring"
import { RatingBadge } from "@/components/rating-badge"
import { AddManagerNoteForm } from "./manager-note-form"
import { AddActionForm } from "./add-action-form"
import { AddOpportunityForm } from "./add-opportunity-form"
import { OpportunityRow } from "./opportunity-row"

export default async function RepWorkspacePage({ params }: { params: Promise<{ repId: string }> }) {
  const { repId } = await params
  const user = await requireCurrentUser()
  const [{ rep, opportunities, actions, kpis, meetings, reviews, objectives, latestSubmission }, health] =
    await Promise.all([getRepWorkspace(repId), getRepCommercialHealth(repId, currentMonth())])

  if (!rep) notFound()

  const openActions = actions.filter((a) => a.status === "open")
  const latestKpi = kpis[0]
  const activeOpportunities = opportunities.filter((o) => o.status === "active")
  const pipelineValue = activeOpportunities.reduce((sum, o) => sum + Number(o.weighted_value ?? 0), 0)
  const pipelineCoverage = rep.monthly_target > 0 ? pipelineValue / rep.monthly_target : 0

  return (
    <div>
      <PageHeader
        title={rep.full_name}
        subtitle={`${rep.depots?.name ?? "—"} · Target ${formatCurrency(rep.monthly_target)}/month`}
        actions={
          <>
            <LinkButton href={`/meetings/monday/new?repId=${repId}`}>Start Monday Meeting</LinkButton>
            <LinkButton href={`/one-to-ones/new?repId=${repId}`} variant="secondary">
              Start 1-to-1
            </LinkButton>
            <LinkButton href={`/reps/${repId}/weekly-submission`} variant="secondary">
              Update Top 10
            </LinkButton>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeading>Today&apos;s focus</CardHeading>
            {openActions.length === 0 && activeOpportunities.filter((o) => o.support_required).length === 0 ? (
              <EmptyState>Nothing urgent for {rep.full_name} right now.</EmptyState>
            ) : (
              <ul className="space-y-2 text-sm">
                {openActions
                  .filter((a) => isDueSoon(a.due_date))
                  .map((a) => (
                    <li key={a.id} className="flex items-center justify-between">
                      <span className="text-zinc-900">{a.title}</span>
                      <span className="text-xs text-zinc-500">due {formatDate(a.due_date)}</span>
                    </li>
                  ))}
                {activeOpportunities
                  .filter((o) => o.support_required)
                  .map((o) => (
                    <li key={o.id} className="flex items-center justify-between">
                      <span className="text-zinc-900">Support needed: {o.company_name}</span>
                      <Badge value="high" label="Support" />
                    </li>
                  ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeading count={activeOpportunities.length}>Current Top 10</CardHeading>
            <p className={`-mt-2 mb-3 text-xs font-medium ${pipelineCoverage < 3 ? "text-red-600" : "text-emerald-600"}`}>
              Pipeline coverage {pipelineCoverage.toFixed(1)}× monthly target (minimum 3×)
            </p>
            {activeOpportunities.length === 0 ? (
              <EmptyState>No active strategic opportunities yet.</EmptyState>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    <th className="py-2 pr-2">Company</th>
                    <th className="py-2 pr-2">Value</th>
                    <th className="py-2 pr-2">Stage</th>
                    <th className="py-2 pr-2">Prob.</th>
                    <th className="py-2 pr-2">Weighted</th>
                    <th className="py-2 pr-2">Support</th>
                    <th className="py-2 pr-2" />
                  </tr>
                </thead>
                <tbody>
                  {activeOpportunities.map((o) => (
                    <OpportunityRow key={o.id} opportunity={o} repId={repId} />
                  ))}
                </tbody>
              </table>
            )}
            <div className="mt-4 border-t border-zinc-100 pt-4">
              <AddOpportunityForm repId={repId} depotId={rep.depot_id} activeCount={activeOpportunities.length} />
            </div>
          </Card>

          <Card>
            <CardHeading count={openActions.length}>Open actions</CardHeading>
            {openActions.length === 0 ? (
              <EmptyState>No open actions for {rep.full_name}.</EmptyState>
            ) : (
              <ul className="divide-y divide-zinc-100 text-sm">
                {openActions.map((a) => (
                  <li key={a.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-zinc-900">{a.title}</p>
                      <p className="text-xs text-zinc-500">due {formatDate(a.due_date)}</p>
                    </div>
                    <Badge value={a.priority} />
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 border-t border-zinc-100 pt-4">
              <AddActionForm repId={repId} managerId={user.id} />
            </div>
          </Card>

          <Card>
            <CardHeading count={meetings.length}>Meeting timeline</CardHeading>
            {meetings.length === 0 ? (
              <EmptyState>No meetings recorded yet.</EmptyState>
            ) : (
              <ul className="space-y-3 text-sm">
                {meetings.map((m) => (
                  <li key={m.id}>
                    <Link href={`/meetings/${m.id}`} className="font-medium text-zinc-900 hover:underline">
                      {labelize(m.meeting_type)} · {formatDate(m.meeting_date)}
                    </Link>
                    {m.summary && <p className="text-xs text-zinc-500">{m.summary}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {health && (
            <Card className="flex items-center gap-4">
              <ScoreRing score={health.score.totalPoints} rating={health.score.rating} size={88} />
              <div>
                <p className="text-xs uppercase text-zinc-500">Commercial Health</p>
                <RatingBadge rating={health.score.rating} size="sm" />
                <Link
                  href={`/reps/${repId}/scorecard`}
                  className="mt-2 block text-sm font-medium text-zinc-900 hover:underline"
                >
                  Full scorecard →
                </Link>
              </div>
            </Card>
          )}

          <Card>
            <CardHeading>KPI summary</CardHeading>
            {!latestKpi ? (
              <EmptyState>No KPI snapshot yet.</EmptyState>
            ) : (
              <dl className="grid grid-cols-2 gap-y-2 text-sm">
                <dt className="text-zinc-500">Calls</dt>
                <dd className="text-right font-medium text-zinc-900">{latestKpi.calls}</dd>
                <dt className="text-zinc-500">Appointments</dt>
                <dd className="text-right font-medium text-zinc-900">{latestKpi.appointments}</dd>
                <dt className="text-zinc-500">Quotes</dt>
                <dd className="text-right font-medium text-zinc-900">{latestKpi.quotes}</dd>
                <dt className="text-zinc-500">Wins</dt>
                <dd className="text-right font-medium text-zinc-900">{latestKpi.wins}</dd>
                <dt className="text-zinc-500">Revenue won</dt>
                <dd className="text-right font-medium text-zinc-900">{formatCurrency(latestKpi.revenue_won)}</dd>
                <dt className="text-zinc-500">Performance score</dt>
                <dd className="text-right font-medium text-zinc-900">{latestKpi.performance_score ?? "—"}</dd>
              </dl>
            )}
          </Card>

          {latestSubmission && (
            <Card>
              <CardHeading>Latest Friday submission</CardHeading>
              <p className="text-xs text-zinc-500">Week of {formatDate(latestSubmission.week_commencing)}</p>
              <div className="mt-2 space-y-2 text-sm">
                <p><span className="font-medium text-zinc-900">Win: </span>{latestSubmission.biggest_win}</p>
                <p><span className="font-medium text-zinc-900">Challenge: </span>{latestSubmission.biggest_challenge}</p>
                <p><span className="font-medium text-zinc-900">Support: </span>{latestSubmission.support_needed}</p>
              </div>
            </Card>
          )}

          <Card>
            <CardHeading count={objectives.length}>Objectives</CardHeading>
            {objectives.length === 0 ? (
              <EmptyState>No objectives set.</EmptyState>
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
            <CardHeading count={reviews.length}>1-to-1 history</CardHeading>
            {reviews.length === 0 ? (
              <EmptyState>No 1-to-1s recorded yet.</EmptyState>
            ) : (
              <ul className="space-y-2 text-sm">
                {reviews.map((r) => (
                  <li key={r.id}>
                    <p className="font-medium text-zinc-900">{formatDate(r.review_date)}</p>
                    <p className="text-xs text-zinc-500">{r.performance_summary}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeading>Manager notes</CardHeading>
            <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-700">
              {rep.notes || "No notes yet."}
            </pre>
            <div className="mt-4 border-t border-zinc-100 pt-4">
              <AddManagerNoteForm repId={repId} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
