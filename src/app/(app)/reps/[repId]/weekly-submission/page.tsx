import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { startOfWeek, formatDate } from "@/lib/format"
import { PageHeader, Card, CardHeading } from "@/components/ui"
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
      </div>
    </div>
  )
}
