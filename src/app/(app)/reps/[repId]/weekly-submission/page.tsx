import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { startOfWeek, formatDate, formatCurrency } from "@/lib/format"
import { PageHeader, Card, CardHeading, EmptyState, Badge } from "@/components/ui"
import { SubmissionForm } from "./submission-form"
import { ReviewForm } from "./review-form"

export default async function WeeklySubmissionPage({
  params,
  searchParams,
}: {
  params: Promise<{ repId: string }>
  searchParams: Promise<{ id?: string }>
}) {
  const { repId } = await params
  const { id } = await searchParams
  const supabase = await createClient()

  const { data: rep } = await supabase.from("reps").select("*, depots(name)").eq("id", repId).single()
  if (!rep) notFound()

  const submissionQuery = supabase.from("weekly_submissions").select("*").eq("rep_id", repId)
  const { data: submission } = id
    ? await submissionQuery.eq("id", id).maybeSingle()
    : await submissionQuery.eq("week_commencing", startOfWeek()).maybeSingle()

  const weekCommencing = submission?.week_commencing ?? startOfWeek()
  const { data: top10 } = await supabase
    .from("strategic_opportunities")
    .select("*")
    .eq("rep_id", repId)
    .eq("week_commencing", weekCommencing)
    .order("weighted_value", { ascending: false })

  return (
    <div>
      <PageHeader
        title={`Weekly Submission — ${rep.full_name}`}
        subtitle={`${rep.depots?.name ?? "—"} · Week commencing ${formatDate(submission?.week_commencing ?? startOfWeek())}`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeading>Friday input</CardHeading>
          <SubmissionForm
            repId={repId}
            weekCommencing={submission?.week_commencing ?? startOfWeek()}
            initial={{
              biggestWin: submission?.biggest_win ?? "",
              biggestChallenge: submission?.biggest_challenge ?? "",
              supportNeeded: submission?.support_needed ?? "",
            }}
          />
        </Card>

        {submission && (
          <Card>
            <CardHeading>Manager review</CardHeading>
            <ReviewForm
              submissionId={submission.id}
              repId={repId}
              reviewed={submission.manager_reviewed}
              initialNotes={submission.manager_notes ?? ""}
            />
          </Card>
        )}

        <Card className="lg:col-span-2">
          <CardHeading count={top10?.length ?? 0}>This week&apos;s Top 10</CardHeading>
          {!top10 || top10.length === 0 ? (
            <EmptyState>No Top 10 opportunities imported or added for this week yet.</EmptyState>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <th className="py-2 pr-2">Company</th>
                  <th className="py-2 pr-2">Provider</th>
                  <th className="py-2 pr-2">Value</th>
                  <th className="py-2 pr-2">Stage</th>
                  <th className="py-2 pr-2">Prob.</th>
                  <th className="py-2 pr-2">Next action</th>
                </tr>
              </thead>
              <tbody>
                {top10.map((o) => (
                  <tr key={o.id} className="border-b border-zinc-100 last:border-0">
                    <td className="py-2 pr-2 font-medium text-zinc-900">{o.company_name}</td>
                    <td className="py-2 pr-2 text-zinc-600">{o.current_provider ?? "—"}</td>
                    <td className="py-2 pr-2 text-zinc-600">{formatCurrency(o.estimated_monthly_revenue)}</td>
                    <td className="py-2 pr-2">
                      <Badge value={o.stage} />
                    </td>
                    <td className="py-2 pr-2 text-zinc-600">{o.probability}%</td>
                    <td className="py-2 pr-2 text-zinc-600">{o.next_action ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  )
}
