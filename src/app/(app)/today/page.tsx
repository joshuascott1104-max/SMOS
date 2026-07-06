import Link from "next/link"
import { getTodayDashboard } from "@/lib/data/today"
import { PageHeader, Card, CardHeading, EmptyState, Badge, StatTile, LinkButton } from "@/components/ui"
import { formatCurrency, formatDate, labelize } from "@/lib/format"

export default async function TodayPage() {
  const {
    overdueActions,
    dueThisWeekActions,
    upcomingMeetings,
    pendingSubmissions,
    supportOpportunities,
    forecastTotals,
  } = await getTodayDashboard()

  return (
    <div>
      <PageHeader
        title="Today"
        subtitle="Your command centre — what needs attention right now."
        actions={
          <>
            <LinkButton href="/meetings/monday/new">Start Monday Meeting</LinkButton>
            <LinkButton href="/one-to-ones/new" variant="secondary">
              Start 1-to-1
            </LinkButton>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Overdue actions" value={overdueActions.length} href="/actions?view=overdue" />
        <StatTile label="Due this week" value={dueThisWeekActions.length} href="/actions?view=due_this_week" />
        <StatTile label="Top 10 to review" value={pendingSubmissions.length} />
        <StatTile label="Need support" value={supportOpportunities.length} href="/opportunities?view=support_required" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeading count={overdueActions.length}>Overdue actions</CardHeading>
          {overdueActions.length === 0 ? (
            <EmptyState>Nothing overdue. Nice work.</EmptyState>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {overdueActions.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium text-zinc-900">{a.title}</p>
                    <p className="text-xs text-zinc-500">
                      {a.reps?.full_name ?? "Manager"} · due {formatDate(a.due_date)}
                    </p>
                  </div>
                  <Badge value={a.priority} />
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3">
            <Link href="/actions?view=overdue" className="text-sm font-medium text-zinc-900 hover:underline">
              Go to Action Centre →
            </Link>
          </div>
        </Card>

        <Card>
          <CardHeading count={dueThisWeekActions.length}>Actions due this week</CardHeading>
          {dueThisWeekActions.length === 0 ? (
            <EmptyState>No actions due in the next 7 days.</EmptyState>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {dueThisWeekActions.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium text-zinc-900">{a.title}</p>
                    <p className="text-xs text-zinc-500">
                      {a.reps?.full_name ?? "Manager"} · due {formatDate(a.due_date)}
                    </p>
                  </div>
                  <Badge value={a.priority} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeading count={pendingSubmissions.length}>Top 10 submissions awaiting review</CardHeading>
          {pendingSubmissions.length === 0 ? (
            <EmptyState>All caught up on weekly submissions.</EmptyState>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {pendingSubmissions.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium text-zinc-900">{s.reps?.full_name}</p>
                    <p className="text-xs text-zinc-500">Week commencing {formatDate(s.week_commencing)}</p>
                  </div>
                  <Link href={`/reps/${s.rep_id}/weekly-submission?id=${s.id}`} className="text-sm font-medium text-zinc-900 hover:underline">
                    Review →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeading count={supportOpportunities.length}>Opportunities needing support</CardHeading>
          {supportOpportunities.length === 0 ? (
            <EmptyState>No opportunities are flagged for support.</EmptyState>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {supportOpportunities.map((o) => (
                <li key={o.id} className="py-2 text-sm">
                  <p className="font-medium text-zinc-900">
                    {o.company_name} · {formatCurrency(o.estimated_monthly_revenue)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {o.reps?.full_name} · {o.depots?.name} · {o.support_reason}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeading count={upcomingMeetings.length}>Meetings due</CardHeading>
          {upcomingMeetings.length === 0 ? (
            <EmptyState>No meetings scheduled.</EmptyState>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {upcomingMeetings.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium text-zinc-900">
                      {labelize(m.meeting_type)} {m.reps ? `· ${m.reps.full_name}` : ""}
                    </p>
                    <p className="text-xs text-zinc-500">{formatDate(m.meeting_date)}</p>
                  </div>
                  <Badge value={m.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeading>Forecast summary (this month)</CardHeading>
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div>
              <p className="text-xs text-zinc-500">Target</p>
              <p className="text-lg font-semibold text-zinc-900">{formatCurrency(forecastTotals.target)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Forecast</p>
              <p className="text-lg font-semibold text-zinc-900">{formatCurrency(forecastTotals.forecast)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Weighted</p>
              <p className="text-lg font-semibold text-zinc-900">{formatCurrency(forecastTotals.weighted)}</p>
            </div>
          </div>
          <div className="mt-3">
            <Link href="/forecast" className="text-sm font-medium text-zinc-900 hover:underline">
              View forecast →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
