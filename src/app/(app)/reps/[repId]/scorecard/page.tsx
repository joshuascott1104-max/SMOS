import Link from "next/link"
import { notFound } from "next/navigation"
import { getRepCommercialHealth, currentMonth } from "@/lib/data/commercial-health"
import { suggestedCoachingFocus, weakCategories } from "@/lib/scoring"
import { getRepReviewScoreHistory } from "@/lib/data/review-scores"
import { ratingForReviewScore, trendBetween } from "@/lib/review-scoring"
import { PageHeader, Card, CardHeading, EmptyState } from "@/components/ui"
import { ScoreRing } from "@/components/score-ring"
import { RatingBadge } from "@/components/rating-badge"
import { CategoryMeter } from "@/components/category-meter"
import { formatDate } from "@/lib/format"
import { ManualScoreForm } from "./manual-score-form"
import { TargetsForm } from "./targets-form"

const TREND_LABEL: Record<string, string> = {
  improving: "Improving",
  flat: "Flat",
  declining: "Declining",
  not_enough_data: "Not enough data yet",
}

function shiftMonth(month: string, delta: number): string {
  const d = new Date(month)
  d.setMonth(d.getMonth() + delta)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
}

function formatMonthLabel(month: string): string {
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(new Date(month))
}

const GROUPS = ["Commercial Results", "Pipeline Development", "Commercial Delivery", "Professional Standards"] as const

export default async function RepScorecardPage({
  params,
  searchParams,
}: {
  params: Promise<{ repId: string }>
  searchParams: Promise<{ month?: string }>
}) {
  const { repId } = await params
  const { month: rawMonth } = await searchParams
  const month = rawMonth ?? currentMonth()

  const [health, reviewHistory] = await Promise.all([
    getRepCommercialHealth(repId, month),
    getRepReviewScoreHistory(repId, 2),
  ])
  if (!health) notFound()

  const { score } = health
  const weak = weakCategories(score.categories)
  const focus = suggestedCoachingFocus(score.categories)

  const [latestReview, previousReview] = reviewHistory
  const trend = trendBetween(latestReview?.totalScore ?? null, previousReview?.totalScore ?? null)

  return (
    <div>
      <PageHeader
        title={`Commercial Health Score — ${health.repName}`}
        subtitle="Coaching and commercial discipline, not a league table or commission structure."
        actions={
          <div className="flex items-center gap-2 text-sm">
            <Link href={`/reps/${repId}/scorecard?month=${shiftMonth(month, -1)}`} className="rounded-md border border-zinc-300 px-2 py-1 hover:bg-zinc-50">
              ← Prev
            </Link>
            <span className="font-medium text-zinc-700">{formatMonthLabel(month)}</span>
            <Link href={`/reps/${repId}/scorecard?month=${shiftMonth(month, 1)}`} className="rounded-md border border-zinc-300 px-2 py-1 hover:bg-zinc-50">
              Next →
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center gap-3 lg:col-span-1">
          <ScoreRing score={score.totalPoints} rating={score.rating} />
          <RatingBadge rating={score.rating} />
          <p className="text-center text-xs text-zinc-500">
            {health.weeksLogged} week{health.weeksLogged === 1 ? "" : "s"} of KPI data logged this month
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeading count={weak.length}>Weak areas &amp; coaching focus</CardHeading>
          {weak.length === 0 ? (
            <EmptyState>No categories below 70% achievement this month.</EmptyState>
          ) : (
            <ul className="mb-3 space-y-1 text-sm">
              {weak.map((c) => (
                <li key={c.key} className="flex items-center justify-between">
                  <span className="text-zinc-900">{c.label}</span>
                  <span className="text-red-600">{Math.round(c.achievementPct)}% of target</span>
                </li>
              ))}
            </ul>
          )}
          {focus.length > 0 && (
            <div className="border-t border-zinc-100 pt-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Suggested focus</p>
              <ul className="list-disc space-y-1 pl-4 text-sm text-zinc-700">
                {focus.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-3">
          <CardHeading>1-to-1 review score (coaching tool, separate from Commercial Health)</CardHeading>
          {!latestReview ? (
            <EmptyState>No 1-to-1 review scores recorded yet.</EmptyState>
          ) : (
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex flex-none flex-col items-center gap-1">
                <RatingBadge rating={ratingForReviewScore(latestReview.totalScore)} size="sm" />
                <p className="text-lg font-semibold text-zinc-900">{latestReview.totalScore} / 30</p>
                <p className="text-xs text-zinc-500">Latest — {formatDate(latestReview.reviewDate)}</p>
              </div>
              {previousReview && (
                <div className="flex flex-none flex-col items-center gap-1">
                  <RatingBadge rating={ratingForReviewScore(previousReview.totalScore)} size="sm" />
                  <p className="text-lg font-semibold text-zinc-500">{previousReview.totalScore} / 30</p>
                  <p className="text-xs text-zinc-500">Previous — {formatDate(previousReview.reviewDate)}</p>
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">Trend</p>
                <p className="text-sm font-medium text-zinc-900">{TREND_LABEL[trend]}</p>
                <Link
                  href={`/one-to-ones/${latestReview.reviewId}`}
                  className="mt-1 block text-sm font-medium text-zinc-900 hover:underline"
                >
                  View full review →
                </Link>
              </div>
            </div>
          )}
        </Card>

        {GROUPS.map((group) => {
          const groupCategories = score.categories.filter((c) => c.group === group)
          const groupPoints = groupCategories.reduce((sum, c) => sum + c.points, 0)
          const groupMax = groupCategories.reduce((sum, c) => sum + c.maxPoints, 0)
          return (
            <Card key={group}>
              <CardHeading>
                {group} ({groupPoints.toFixed(1)}/{groupMax})
              </CardHeading>
              <div className="space-y-4">
                {groupCategories.map((c) => (
                  <CategoryMeter key={c.key} category={c} />
                ))}
              </div>
            </Card>
          )
        })}

        <Card className="lg:col-span-3">
          <CardHeading>Targets</CardHeading>
          <p className="mb-3 text-xs text-zinc-500">
            Every target scored above is set per rep and editable here — nothing is shared or hardcoded across the team.
          </p>
          <TargetsForm repId={repId} initial={health.targets} />
        </Card>

        <Card className="lg:col-span-3">
          <CardHeading>Monthly manual inputs</CardHeading>
          <p className="mb-3 text-xs text-zinc-500">
            New Customers Won, Commercial Gate Progression, Follow-up Compliance and CRM Discipline are entered by
            the manager once a month.
          </p>
          <ManualScoreForm repId={repId} month={month} initial={health.manualEntry} />
        </Card>
      </div>
    </div>
  )
}
