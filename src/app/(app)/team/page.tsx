import Link from "next/link"
import { listRepsWithSummary } from "@/lib/data/reps"
import { PageHeader, Card, Badge } from "@/components/ui"
import { formatCurrency, formatDate } from "@/lib/format"

export default async function TeamPage() {
  const reps = await listRepsWithSummary()

  return (
    <div>
      <PageHeader title="Team" subtitle="All reps across every depot." />

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3">Rep</th>
              <th className="px-4 py-3">Depot</th>
              <th className="px-4 py-3">Monthly target</th>
              <th className="px-4 py-3">Forecast</th>
              <th className="px-4 py-3">KPI score</th>
              <th className="px-4 py-3">Open actions</th>
              <th className="px-4 py-3">Last 1-to-1</th>
              <th className="px-4 py-3">Next 1-to-1</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {reps.map((rep) => (
              <tr key={rep.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  <Link href={`/reps/${rep.id}`} className="hover:underline">
                    {rep.full_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-600">{rep.depotName}</td>
                <td className="px-4 py-3 text-zinc-600">{formatCurrency(rep.monthly_target)}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {rep.forecastValue !== null ? formatCurrency(rep.forecastValue) : "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600">{rep.kpiScore ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-600">{rep.openActionCount}</td>
                <td className="px-4 py-3 text-zinc-600">{formatDate(rep.lastReviewDate)}</td>
                <td className="px-4 py-3 text-zinc-600">{formatDate(rep.nextReviewDate)}</td>
                <td className="px-4 py-3">
                  <Badge value={rep.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
