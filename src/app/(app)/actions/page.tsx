import Link from "next/link"
import { listActions, type ActionView } from "@/lib/data/actions"
import { PageHeader, Card, Badge, EmptyState } from "@/components/ui"
import { formatDate, labelize, isOverdue } from "@/lib/format"
import { ActionControls } from "@/components/action-controls"

const VIEWS: { key: ActionView; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "due_today", label: "Due today" },
  { key: "due_this_week", label: "Due this week" },
  { key: "overdue", label: "Overdue" },
  { key: "completed", label: "Completed" },
  { key: "replanned", label: "Replanned" },
  { key: "cancelled", label: "Cancelled" },
]

export default async function ActionsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view: rawView } = await searchParams
  const view = (VIEWS.some((v) => v.key === rawView) ? rawView : "open") as ActionView

  const actions = await listActions(view)

  return (
    <div>
      <PageHeader title="Action Centre" subtitle="Everything that needs following up." />

      <div className="mb-4 flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <Link
            key={v.key}
            href={`/actions?view=${v.key}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              view === v.key ? "bg-zinc-900 text-white" : "bg-white text-zinc-600 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50"
            }`}
          >
            {v.label}
          </Link>
        ))}
      </div>

      {actions.length === 0 ? (
        <Card>
          <EmptyState>Nothing in this view.</EmptyState>
        </Card>
      ) : (
        <div className="space-y-3">
          {actions.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-zinc-900">{a.title}</p>
                  {a.description && <p className="mt-1 text-sm text-zinc-600">{a.description}</p>}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                    <span>Owner: {labelize(a.owner_type)}</span>
                    {a.reps && (
                      <Link href={`/reps/${a.reps.id}`} className="hover:underline">
                        Rep: {a.reps.full_name}
                      </Link>
                    )}
                    {a.opportunities && <span>Opportunity: {a.opportunities.company_name}</span>}
                    {a.meetings && <span>From: {labelize(a.meetings.meeting_type)} ({formatDate(a.meetings.meeting_date)})</span>}
                    <span>Due: {formatDate(a.due_date)}</span>
                  </div>
                  {a.status === "completed" && a.outcome && (
                    <p className="mt-2 text-sm text-emerald-700">Outcome: {a.outcome}</p>
                  )}
                  {a.status === "replanned" && a.replanned_reason && (
                    <p className="mt-2 text-sm text-amber-700">Replanned: {a.replanned_reason}</p>
                  )}
                  {a.status === "cancelled" && a.cancelled_reason && (
                    <p className="mt-2 text-sm text-red-700">Cancelled: {a.cancelled_reason}</p>
                  )}
                </div>
                <div className="flex flex-none flex-col items-end gap-2">
                  <Badge value={a.priority} />
                  <Badge value={isOverdue(a.due_date, a.status) ? "overdue" : a.status} />
                </div>
              </div>
              {a.status === "open" && (
                <div className="mt-3 border-t border-zinc-100 pt-3">
                  <ActionControls actionId={a.id} dueDate={a.due_date} />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
