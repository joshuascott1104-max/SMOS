import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PageHeader, Card, CardHeading, EmptyState, Badge } from "@/components/ui"
import { formatDate } from "@/lib/format"

export default async function OneToOneDetailPage({ params }: { params: Promise<{ reviewId: string }> }) {
  const { reviewId } = await params
  const supabase = await createClient()

  const { data: review } = await supabase
    .from("one_to_one_reviews")
    .select("*, reps:rep_id(id, full_name)")
    .eq("id", reviewId)
    .single()

  if (!review) notFound()

  const { data: objectives } = await supabase
    .from("objectives")
    .select("*")
    .eq("review_id", reviewId)
    .order("created_at")

  return (
    <div>
      <PageHeader
        title={`1-to-1 — ${review.reps?.full_name}`}
        subtitle={`${formatDate(review.review_date)} · Rating ${review.overall_rating ?? "—"}/5`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeading>Performance summary</CardHeading>
          <p className="text-sm text-zinc-700">{review.performance_summary}</p>
        </Card>
        <Card>
          <CardHeading>Strengths</CardHeading>
          <p className="text-sm text-zinc-700">{review.strengths}</p>
        </Card>
        <Card>
          <CardHeading>Development areas</CardHeading>
          <p className="text-sm text-zinc-700">{review.development_areas}</p>
        </Card>
        <Card>
          <CardHeading>Manager feedback</CardHeading>
          <p className="text-sm text-zinc-700">{review.manager_feedback}</p>
        </Card>
        <Card>
          <CardHeading>Rep feedback</CardHeading>
          <p className="text-sm text-zinc-700">{review.rep_feedback}</p>
        </Card>
        <Card>
          <CardHeading count={objectives?.length ?? 0}>Objectives set</CardHeading>
          {!objectives || objectives.length === 0 ? (
            <EmptyState>No objectives set in this review.</EmptyState>
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
      </div>

      <div className="mt-6">
        <p className="text-sm text-zinc-500">Next review: {formatDate(review.next_review_date)}</p>
        {review.reps && (
          <Link href={`/reps/${review.reps.id}`} className="text-sm font-medium text-zinc-900 hover:underline">
            ← Back to {review.reps.full_name}&apos;s workspace
          </Link>
        )}
      </div>
    </div>
  )
}
