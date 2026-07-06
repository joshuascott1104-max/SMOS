import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PageHeader, Card, CardHeading, EmptyState, Badge } from "@/components/ui"
import { formatDate, labelize } from "@/lib/format"

const SECTION_LABELS: Record<string, string> = {
  previous_actions: "Previous actions",
  kpi_exceptions: "KPI exceptions",
  top10_review: "Top 10 review",
  coaching_notes: "Coaching notes",
  previous_objectives: "Previous objectives",
  performance: "Performance",
  development: "Development",
  manager_feedback: "Manager feedback",
  rep_feedback: "Rep feedback",
  general: "General",
}

export default async function MeetingDetailPage({ params }: { params: Promise<{ meetingId: string }> }) {
  const { meetingId } = await params
  const supabase = await createClient()

  const [{ data: meeting }, { data: notes }, { data: actions }] = await Promise.all([
    supabase.from("meetings").select("*, reps:rep_id(id, full_name), depots:depot_id(name)").eq("id", meetingId).single(),
    supabase.from("meeting_notes").select("*").eq("meeting_id", meetingId).order("created_at"),
    supabase.from("actions").select("*").eq("linked_meeting_id", meetingId).order("due_date"),
  ])

  if (!meeting) notFound()

  return (
    <div>
      <PageHeader
        title={`${labelize(meeting.meeting_type)} — ${formatDate(meeting.meeting_date)}`}
        subtitle={meeting.reps ? `Rep: ${meeting.reps.full_name}` : meeting.depots ? `Depot: ${meeting.depots.name}` : "Team-wide"}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeading>Summary</CardHeading>
          <p className="text-sm text-zinc-700">{meeting.summary || "No summary recorded."}</p>
        </Card>

        <Card>
          <CardHeading count={actions?.length ?? 0}>Actions from this meeting</CardHeading>
          {!actions || actions.length === 0 ? (
            <EmptyState>No actions were created in this meeting.</EmptyState>
          ) : (
            <ul className="divide-y divide-zinc-100 text-sm">
              {actions.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2">
                  <span className="text-zinc-900">{a.title}</span>
                  <Badge value={a.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeading count={notes?.length ?? 0}>Meeting notes</CardHeading>
          {!notes || notes.length === 0 ? (
            <EmptyState>No notes recorded.</EmptyState>
          ) : (
            <div className="space-y-3">
              {notes.map((n) => (
                <div key={n.id}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {SECTION_LABELS[n.section] ?? labelize(n.section)}
                  </p>
                  <p className="text-sm text-zinc-700">{n.note}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {meeting.reps && (
        <div className="mt-6">
          <Link href={`/reps/${meeting.reps.id}`} className="text-sm font-medium text-zinc-900 hover:underline">
            ← Back to {meeting.reps.full_name}&apos;s workspace
          </Link>
        </div>
      )}
    </div>
  )
}
