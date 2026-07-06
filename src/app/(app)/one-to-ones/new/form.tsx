"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createOneToOne } from "@/lib/mutations/one-to-ones"
import { Card, CardHeading, Button } from "@/components/ui"
import type { Tables } from "@/types/database"

type NewAction = {
  title: string
  ownerType: "rep" | "manager"
  ownerId: string
  dueDate: string
  priority: "low" | "medium" | "high"
}

type NewObjective = { objective: string; successMeasure: string; dueDate: string }

export function OneToOneForm({
  repId,
  managerId,
  reps,
  existingObjectives,
}: {
  repId: string
  managerId: string
  reps: { id: string; full_name: string }[]
  existingObjectives: Tables<"objectives">[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [performanceSummary, setPerformanceSummary] = useState("")
  const [strengths, setStrengths] = useState("")
  const [developmentAreas, setDevelopmentAreas] = useState("")
  const [managerFeedback, setManagerFeedback] = useState("")
  const [repFeedback, setRepFeedback] = useState("")
  const [overallRating, setOverallRating] = useState(3)
  const [nextReviewDate, setNextReviewDate] = useState("")
  const [supportRequired, setSupportRequired] = useState("")
  const [recognitionAchieved, setRecognitionAchieved] = useState("")

  const [objectiveStatuses, setObjectiveStatuses] = useState<Record<string, { status: string; notes: string }>>(
    Object.fromEntries(existingObjectives.map((o) => [o.id, { status: o.status, notes: o.progress_notes ?? "" }]))
  )
  const [newObjectives, setNewObjectives] = useState<NewObjective[]>([])
  const [newActions, setNewActions] = useState<NewAction[]>([])

  const activeExistingCount = Object.values(objectiveStatuses).filter((o) => o.status !== "completed").length
  const totalActiveObjectives = activeExistingCount + newObjectives.length
  const atObjectiveLimit = totalActiveObjectives >= 3

  return (
    <div className="space-y-6">
      <Card>
        <CardHeading>3. Development discussion</CardHeading>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-zinc-600">Performance summary</label>
            <textarea
              value={performanceSummary}
              onChange={(e) => setPerformanceSummary(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600">Strengths</label>
            <textarea
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-zinc-600">Development areas</label>
            <textarea
              value={developmentAreas}
              onChange={(e) => setDevelopmentAreas(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
          </div>
        </div>

        {existingObjectives.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-zinc-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Update objective progress</p>
            {existingObjectives.map((o) => (
              <div key={o.id} className="grid grid-cols-12 gap-2">
                <span className="col-span-4 text-sm text-zinc-900">{o.objective}</span>
                <select
                  value={objectiveStatuses[o.id].status}
                  onChange={(e) =>
                    setObjectiveStatuses((prev) => ({ ...prev, [o.id]: { ...prev[o.id], status: e.target.value } }))
                  }
                  className="col-span-2 rounded-md border border-zinc-300 px-2 py-1 text-sm"
                >
                  <option value="not_started">Not started</option>
                  <option value="on_track">On track</option>
                  <option value="at_risk">At risk</option>
                  <option value="completed">Completed</option>
                </select>
                <input
                  value={objectiveStatuses[o.id].notes}
                  onChange={(e) =>
                    setObjectiveStatuses((prev) => ({ ...prev, [o.id]: { ...prev[o.id], notes: e.target.value } }))
                  }
                  placeholder="Progress notes"
                  className="col-span-6 rounded-md border border-zinc-300 px-2 py-1 text-sm"
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeading>4. Manager &amp; rep feedback</CardHeading>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-zinc-600">Manager feedback</label>
            <textarea
              value={managerFeedback}
              onChange={(e) => setManagerFeedback(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600">Rep feedback</label>
            <textarea
              value={repFeedback}
              onChange={(e) => setRepFeedback(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
          </div>
        </div>
        <div className="mt-3 flex gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-600">Overall rating (1-5)</label>
            <input
              type="number"
              min={1}
              max={5}
              value={overallRating}
              onChange={(e) => setOverallRating(Number(e.target.value))}
              className="w-20 rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600">Next review date</label>
            <input
              type="date"
              value={nextReviewDate}
              onChange={(e) => setNextReviewDate(e.target.value)}
              className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-zinc-600">Support required</label>
            <textarea
              value={supportRequired}
              onChange={(e) => setSupportRequired(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
              placeholder="What support does the rep need from their manager or the business?"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600">Recognition achieved</label>
            <textarea
              value={recognitionAchieved}
              onChange={(e) => setRecognitionAchieved(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
              placeholder="Standards or milestones worth recognising this month"
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeading count={totalActiveObjectives}>5. New objectives (max 3 active)</CardHeading>
        <div className="space-y-2">
          {newObjectives.map((o, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input
                value={o.objective}
                onChange={(e) =>
                  setNewObjectives((prev) => prev.map((x, idx) => (idx === i ? { ...x, objective: e.target.value } : x)))
                }
                placeholder="Objective"
                className="col-span-5 rounded-md border border-zinc-300 px-2 py-1 text-sm"
              />
              <input
                value={o.successMeasure}
                onChange={(e) =>
                  setNewObjectives((prev) =>
                    prev.map((x, idx) => (idx === i ? { ...x, successMeasure: e.target.value } : x))
                  )
                }
                placeholder="Success measure"
                className="col-span-4 rounded-md border border-zinc-300 px-2 py-1 text-sm"
              />
              <input
                type="date"
                value={o.dueDate}
                onChange={(e) =>
                  setNewObjectives((prev) => prev.map((x, idx) => (idx === i ? { ...x, dueDate: e.target.value } : x)))
                }
                className="col-span-2 rounded-md border border-zinc-300 px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={() => setNewObjectives((prev) => prev.filter((_, idx) => idx !== i))}
                className="col-span-1 text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <Button
            variant="secondary"
            disabled={atObjectiveLimit}
            onClick={() =>
              setNewObjectives((prev) => [...prev, { objective: "", successMeasure: "", dueDate: "" }])
            }
          >
            {atObjectiveLimit ? "3 active objectives reached" : "+ Add objective"}
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeading count={newActions.length}>6. Create actions</CardHeading>
        <div className="space-y-2">
          {newActions.map((a, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input
                value={a.title}
                onChange={(e) =>
                  setNewActions((prev) => prev.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))
                }
                placeholder="Action title"
                className="col-span-5 rounded-md border border-zinc-300 px-2 py-1 text-sm"
              />
              <select
                value={a.ownerType}
                onChange={(e) => {
                  const ownerType = e.target.value as "rep" | "manager"
                  setNewActions((prev) =>
                    prev.map((x, idx) =>
                      idx === i ? { ...x, ownerType, ownerId: ownerType === "manager" ? managerId : repId } : x
                    )
                  )
                }}
                className="col-span-2 rounded-md border border-zinc-300 px-2 py-1 text-sm"
              >
                <option value="rep">Rep</option>
                <option value="manager">Manager</option>
              </select>
              <input
                type="date"
                value={a.dueDate}
                onChange={(e) =>
                  setNewActions((prev) => prev.map((x, idx) => (idx === i ? { ...x, dueDate: e.target.value } : x)))
                }
                className="col-span-2 rounded-md border border-zinc-300 px-2 py-1 text-sm"
              />
              <select
                value={a.priority}
                onChange={(e) =>
                  setNewActions((prev) =>
                    prev.map((x, idx) => (idx === i ? { ...x, priority: e.target.value as NewAction["priority"] } : x))
                  )
                }
                className="col-span-2 rounded-md border border-zinc-300 px-2 py-1 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Med</option>
                <option value="high">High</option>
              </select>
              <button
                type="button"
                onClick={() => setNewActions((prev) => prev.filter((_, idx) => idx !== i))}
                className="col-span-1 text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <Button
            variant="secondary"
            onClick={() =>
              setNewActions((prev) => [
                ...prev,
                { title: "", ownerType: "rep", ownerId: repId, dueDate: new Date().toISOString().slice(0, 10), priority: "medium" },
              ])
            }
          >
            + Add action
          </Button>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-4 border-t border-zinc-100 pt-4">
          <Button
            disabled={pending || !performanceSummary.trim()}
            onClick={() =>
              startTransition(async () => {
                setError(null)
                try {
                  const reviewId = await createOneToOne({
                    repId,
                    reviewDate: new Date().toISOString().slice(0, 10),
                    periodCovered: "",
                    performanceSummary,
                    strengths,
                    developmentAreas,
                    managerFeedback,
                    repFeedback,
                    overallRating,
                    nextReviewDate: nextReviewDate || null,
                    supportRequired,
                    recognitionAchieved,
                    objectiveUpdates: Object.entries(objectiveStatuses).map(([id, v]) => ({
                      id,
                      status: v.status,
                      progressNotes: v.notes,
                    })),
                    newObjectives: newObjectives
                      .filter((o) => o.objective.trim())
                      .map((o) => ({ objective: o.objective, successMeasure: o.successMeasure, dueDate: o.dueDate || null })),
                    newActions: newActions.filter((a) => a.title.trim() && a.ownerId),
                  })
                  router.push(`/one-to-ones/${reviewId}`)
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Could not save 1-to-1")
                }
              })
            }
          >
            {pending ? "Saving…" : "Save 1-to-1 review"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
