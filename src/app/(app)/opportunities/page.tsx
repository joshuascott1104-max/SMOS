import Link from "next/link"
import { listOpportunities, type OpportunityView } from "@/lib/data/opportunities"
import { PageHeader, Card, Badge, EmptyState } from "@/components/ui"
import { formatCurrency, formatDate } from "@/lib/format"

const VIEWS: { key: OpportunityView; label: string }[] = [
  { key: "by_depot", label: "By depot" },
  { key: "by_rep", label: "By rep" },
  { key: "highest_value", label: "Highest value" },
  { key: "highest_probability", label: "Highest probability" },
  { key: "support_required", label: "Support required" },
  { key: "closing_this_month", label: "Closing this month" },
]

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const { view: rawView } = await searchParams
  const view = (VIEWS.some((v) => v.key === rawView) ? rawView : "highest_value") as OpportunityView

  const opportunities = await listOpportunities(view)

  return (
    <div>
      <PageHeader
        title="Strategic Opportunities"
        subtitle="The management layer's Top 10 view — not the full CRM pipeline."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <Link
            key={v.key}
            href={`/opportunities?view=${v.key}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              view === v.key ? "bg-zinc-900 text-white" : "bg-white text-zinc-600 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50"
            }`}
          >
            {v.label}
          </Link>
        ))}
      </div>

      <Card className="overflow-x-auto p-0">
        {opportunities.length === 0 ? (
          <EmptyState>No opportunities match this view.</EmptyState>
        ) : (
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Rep</th>
                <th className="px-4 py-3">Depot</th>
                <th className="px-4 py-3">Est. monthly rev.</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Prob.</th>
                <th className="px-4 py-3">Weighted</th>
                <th className="px-4 py-3">Expected close</th>
                <th className="px-4 py-3">Next action</th>
                <th className="px-4 py-3">Support</th>
                <th className="px-4 py-3">Last reviewed</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {opportunities.map((o) => (
                <tr key={o.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium text-zinc-900">{o.company_name}</td>
                  <td className="px-4 py-3">
                    <Link href={`/reps/${o.rep_id}`} className="text-zinc-600 hover:underline">
                      {o.reps?.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{o.depots?.name}</td>
                  <td className="px-4 py-3 text-zinc-600">{formatCurrency(o.estimated_monthly_revenue)}</td>
                  <td className="px-4 py-3">
                    <Badge value={o.stage} />
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{o.probability}%</td>
                  <td className="px-4 py-3 text-zinc-600">{formatCurrency(o.weighted_value)}</td>
                  <td className="px-4 py-3 text-zinc-600">{formatDate(o.expected_close_month)}</td>
                  <td className="px-4 py-3 text-zinc-600">{o.next_action}</td>
                  <td className="px-4 py-3">
                    {o.support_required ? <Badge value="high" label="Required" /> : "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{formatDate(o.last_reviewed)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/reps/${o.rep_id}`} className="text-zinc-900 hover:underline">
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
