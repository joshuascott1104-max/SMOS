"use client"

import { useState, useTransition } from "react"
import { updateOpportunity, setOpportunityStatus } from "@/lib/mutations/opportunities"
import { Badge, Button } from "@/components/ui"
import { formatCurrency, formatDate } from "@/lib/format"
import type { Tables } from "@/types/database"

const STAGES = ["data_received", "quoted", "trial", "appointment_booked", "negotiation", "closed_won", "closed_lost"]

export function OpportunityRow({ opportunity, repId }: { opportunity: Tables<"strategic_opportunities">; repId: string }) {
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [companyName, setCompanyName] = useState(opportunity.company_name)
  const [revenue, setRevenue] = useState(opportunity.estimated_monthly_revenue)
  const [gp, setGp] = useState(opportunity.estimated_monthly_gp ?? 0)
  const [stage, setStage] = useState(opportunity.stage)
  const [probability, setProbability] = useState(opportunity.probability)
  const [expectedCloseMonth, setExpectedCloseMonth] = useState(opportunity.expected_close_month?.slice(0, 7) ?? "")
  const [currentProvider, setCurrentProvider] = useState(opportunity.current_provider ?? "")
  const [lastAction, setLastAction] = useState(opportunity.last_action ?? "")
  const [nextAction, setNextAction] = useState(opportunity.next_action ?? "")
  const [nextActionDate, setNextActionDate] = useState(opportunity.next_action_date ?? "")
  const [supportRequired, setSupportRequired] = useState(opportunity.support_required)
  const [supportReason, setSupportReason] = useState(opportunity.support_reason ?? "")

  if (!editing) {
    return (
      <tr className="border-b border-zinc-100 last:border-0">
        <td className="py-2 pr-2 font-medium text-zinc-900">
          {opportunity.company_name}
          {opportunity.week_commencing && (
            <p className="text-xs font-normal text-zinc-400">Week of {formatDate(opportunity.week_commencing)}</p>
          )}
        </td>
        <td className="py-2 pr-2">{formatCurrency(opportunity.estimated_monthly_revenue)}</td>
        <td className="py-2 pr-2">
          <Badge value={opportunity.stage} />
        </td>
        <td className="py-2 pr-2">{opportunity.probability}%</td>
        <td className="py-2 pr-2">{formatCurrency(opportunity.weighted_value)}</td>
        <td className="py-2 pr-2">{opportunity.support_required ? <Badge value="high" label="Yes" /> : "—"}</td>
        <td className="py-2 pr-2 text-right">
          <button onClick={() => setEditing(true)} className="text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:underline">
            Edit
          </button>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-zinc-100 last:border-0 bg-zinc-50">
      <td colSpan={7} className="py-3">
        <div className="space-y-2 rounded-md border border-zinc-200 bg-white p-3">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company name"
              className="col-span-2 rounded-md border border-zinc-300 px-2 py-1 text-sm md:col-span-1"
            />
            <input
              value={currentProvider}
              onChange={(e) => setCurrentProvider(e.target.value)}
              placeholder="Current provider"
              className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
            <input
              type="number"
              min={0}
              value={revenue}
              onChange={(e) => setRevenue(Number(e.target.value))}
              placeholder="Est. monthly revenue"
              className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
            <input
              type="number"
              min={0}
              value={gp}
              onChange={(e) => setGp(Number(e.target.value))}
              placeholder="Est. monthly GP"
              className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
            <select value={stage} onChange={(e) => setStage(e.target.value)} className="rounded-md border border-zinc-300 px-2 py-1 text-sm">
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              max={100}
              value={probability}
              onChange={(e) => setProbability(Number(e.target.value))}
              placeholder="Probability %"
              className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
            <input
              type="month"
              value={expectedCloseMonth}
              onChange={(e) => setExpectedCloseMonth(e.target.value)}
              className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
            <input
              type="date"
              value={nextActionDate}
              onChange={(e) => setNextActionDate(e.target.value)}
              className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
            <input
              value={lastAction}
              onChange={(e) => setLastAction(e.target.value)}
              placeholder="Last action"
              className="col-span-2 rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
            <input
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="Next action"
              className="col-span-2 rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-zinc-600">
            <input type="checkbox" checked={supportRequired} onChange={(e) => setSupportRequired(e.target.checked)} />
            Support required
          </label>
          {supportRequired && (
            <input
              value={supportReason}
              onChange={(e) => setSupportReason(e.target.value)}
              placeholder="Why is support needed?"
              className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-wrap gap-2">
            <Button
              disabled={pending || !companyName.trim() || (supportRequired && !supportReason.trim())}
              onClick={() =>
                startTransition(async () => {
                  setError(null)
                  try {
                    await updateOpportunity(opportunity.id, repId, {
                      companyName,
                      estimatedMonthlyRevenue: revenue,
                      estimatedMonthlyGp: gp,
                      stage,
                      probability,
                      expectedCloseMonth: expectedCloseMonth ? `${expectedCloseMonth}-01` : null,
                      currentProvider: currentProvider || null,
                      lastAction: lastAction || null,
                      nextAction,
                      nextActionDate: nextActionDate || null,
                      supportRequired,
                      supportReason: supportRequired ? supportReason : null,
                    })
                    setEditing(false)
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Could not save changes")
                  }
                })
              }
            >
              {pending ? "Saving…" : "Save changes"}
            </Button>
            <Button variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() => startTransition(() => setOpportunityStatus(opportunity.id, repId, "won"))}
            >
              Mark won
            </Button>
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() => startTransition(() => setOpportunityStatus(opportunity.id, repId, "lost"))}
            >
              Mark lost
            </Button>
            <Button
              variant="danger"
              disabled={pending}
              onClick={() => startTransition(() => setOpportunityStatus(opportunity.id, repId, "archived"))}
            >
              Archive
            </Button>
          </div>
          <p className="text-xs text-zinc-400">Last reviewed {formatDate(opportunity.last_reviewed)}</p>
        </div>
      </td>
    </tr>
  )
}
