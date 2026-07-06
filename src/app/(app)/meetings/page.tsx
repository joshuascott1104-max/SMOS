import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { PageHeader, Card, Badge, EmptyState, LinkButton } from "@/components/ui"
import { formatDate, labelize } from "@/lib/format"

export default async function MeetingsPage() {
  const supabase = await createClient()
  const { data: meetings } = await supabase
    .from("meetings")
    .select("*, reps:rep_id(id, full_name), depots:depot_id(name)")
    .order("meeting_date", { ascending: false })
    .limit(50)

  return (
    <div>
      <PageHeader
        title="Meetings"
        subtitle="Monday meetings and 1-to-1s."
        actions={
          <>
            <LinkButton href="/meetings/monday/new">Start Monday Meeting</LinkButton>
            <LinkButton href="/one-to-ones/new" variant="secondary">
              Start 1-to-1
            </LinkButton>
          </>
        }
      />

      <Card className="p-0">
        {!meetings || meetings.length === 0 ? (
          <EmptyState>No meetings recorded yet.</EmptyState>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {meetings.map((m) => (
              <li key={m.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <Link href={`/meetings/${m.id}`} className="font-medium text-zinc-900 hover:underline">
                    {labelize(m.meeting_type)} {m.reps ? `· ${m.reps.full_name}` : m.depots ? `· ${m.depots.name}` : ""}
                  </Link>
                  <p className="text-xs text-zinc-500">{formatDate(m.meeting_date)}</p>
                </div>
                <Badge value={m.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
