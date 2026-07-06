"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createMondayMeeting } from "@/lib/mutations/meetings"
import { Card, CardHeading, Button } from "@/components/ui"

type NewAction = {
  title: string
  ownerType: "rep" | "manager"
  ownerId: string
  dueDate: string
  priority: "low" | "medium" | "high"
}

export function MondayMeetingForm({
  repId,
  depotId,
  managerId,
  reps,
}: {
  repId: string | null
  depotId: string | null
  managerId: string
  reps: { id: string; full_name: string }[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [previousActionsNote, setPreviousActionsNote] = useState("")
  const [kpiExceptionsNote, setKpiExceptionsNote] = useState("")
  const [top10Note, setTop10Note] = useState("")
  const [coachingNote, setCoachingNote] = useState("")
  const [summary, setSummary] = useState("")
  const [newActions, setNewActions] = useState<NewAction[]>([])

  function addActionRow() {
    setNewActions((prev) => [
      ...prev,
      {
        title: "",
        ownerType: repId ? "rep" : "manager",
        ownerId: repId ?? managerId,
        dueDate: new Date().toISOString().slice(0, 10),
        priority: "medium",
      },
    ])
  }

  function updateActionRow(index: number, patch: Partial<NewAction>) {
    setNewActions((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)))
  }

  function removeActionRow(index: number) {
    setNewActions((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeading>4. Coaching notes</CardHeading>
        <textarea
          value={coachingNote}
          onChange={(e) => setCoachingNote(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
          placeholder="Coaching observations from this meeting…"
        />
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-zinc-600">Previous actions note</label>
            <textarea
              value={previousActionsNote}
              onChange={(e) => setPreviousActionsNote(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600">KPI exceptions note</label>
            <textarea
              value={kpiExceptionsNote}
              onChange={(e) => setKpiExceptionsNote(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600">Top 10 note</label>
            <textarea
              value={top10Note}
              onChange={(e) => setTop10Note(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeading count={newActions.length}>5. New actions</CardHeading>
        <div className="space-y-2">
          {newActions.map((a, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 rounded-md border border-zinc-200 p-2">
              <input
                value={a.title}
                onChange={(e) => updateActionRow(i, { title: e.target.value })}
                placeholder="Action title"
                className="col-span-4 rounded-md border border-zinc-300 px-2 py-1 text-sm"
              />
              <select
                value={a.ownerType}
                onChange={(e) => {
                  const ownerType = e.target.value as "rep" | "manager"
                  updateActionRow(i, { ownerType, ownerId: ownerType === "manager" ? managerId : repId ?? "" })
                }}
                className="col-span-2 rounded-md border border-zinc-300 px-2 py-1 text-sm"
              >
                <option value="rep">Rep</option>
                <option value="manager">Manager</option>
              </select>
              {a.ownerType === "rep" && (
                <select
                  value={a.ownerId}
                  onChange={(e) => updateActionRow(i, { ownerId: e.target.value })}
                  className="col-span-3 rounded-md border border-zinc-300 px-2 py-1 text-sm"
                >
                  <option value="">Select rep…</option>
                  {reps.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.full_name}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="date"
                value={a.dueDate}
                onChange={(e) => updateActionRow(i, { dueDate: e.target.value })}
                className="col-span-2 rounded-md border border-zinc-300 px-2 py-1 text-sm"
              />
              <select
                value={a.priority}
                onChange={(e) => updateActionRow(i, { priority: e.target.value as NewAction["priority"] })}
                className="col-span-1 rounded-md border border-zinc-300 px-2 py-1 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Med</option>
                <option value="high">High</option>
              </select>
              <button
                type="button"
                onClick={() => removeActionRow(i)}
                className="col-span-12 text-left text-xs text-red-600 hover:underline md:col-span-12"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <Button variant="secondary" onClick={addActionRow}>
            + Add action
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeading>6. Meeting summary</CardHeading>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
          placeholder="Summarise the outcomes of this meeting…"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-3">
          <Button
            disabled={pending || !summary.trim()}
            onClick={() =>
              startTransition(async () => {
                setError(null)
                try {
                  const meetingId = await createMondayMeeting({
                    repId,
                    depotId,
                    meetingDate: new Date().toISOString().slice(0, 10),
                    previousActionsNote,
                    kpiExceptionsNote,
                    top10Note,
                    coachingNote,
                    summary,
                    newActions: newActions.filter((a) => a.title.trim() && a.ownerId),
                  })
                  router.push(`/meetings/${meetingId}`)
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Could not save meeting")
                }
              })
            }
          >
            {pending ? "Saving…" : "Save meeting summary"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
