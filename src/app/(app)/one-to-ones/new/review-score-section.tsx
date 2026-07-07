"use client"

import { computeReviewScore, suggestedReviewCoachingFocus, type ReviewScoreInputs } from "@/lib/review-scoring"
import { Card, CardHeading, EmptyState } from "@/components/ui"
import { ScoreRing } from "@/components/score-ring"
import { RatingBadge } from "@/components/rating-badge"
import { CategoryMeter } from "@/components/category-meter"

export function ReviewScoringSection({
  scores,
  onScoresChange,
  notes,
  onNotesChange,
}: {
  scores: ReviewScoreInputs
  onScoresChange: (scores: ReviewScoreInputs) => void
  notes: string
  onNotesChange: (notes: string) => void
}) {
  const result = computeReviewScore(scores)
  const focus = suggestedReviewCoachingFocus(result.categories)

  return (
    <Card>
      <CardHeading>3. Review scoring</CardHeading>
      <p className="mb-4 text-xs text-zinc-500">
        A coaching tool for this 1-to-1 — not a commission or league-table score. Score each area 1 (poor) to 5
        (excellent) based on this review period.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col items-center justify-center gap-2 lg:col-span-1">
          <ScoreRing score={(result.totalScore / 30) * 100} rating={result.rating} size={100} />
          <p className="text-sm font-medium text-zinc-900">{result.totalScore} / 30</p>
          <RatingBadge rating={result.rating} size="sm" />
        </div>

        <div className="space-y-3 lg:col-span-2">
          {result.categories.map((c) => (
            <div key={c.key} className="grid grid-cols-12 items-center gap-2">
              <label className="col-span-6 text-sm text-zinc-700 sm:col-span-7">{c.label}</label>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={scores[c.key]}
                onChange={(e) => onScoresChange({ ...scores, [c.key]: Number(e.target.value) })}
                className="col-span-4 sm:col-span-4"
              />
              <span className="col-span-2 text-right text-sm font-semibold text-zinc-900 sm:col-span-1">
                {scores[c.key]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 border-t border-zinc-100 pt-4 lg:grid-cols-2">
        <div className="space-y-3">
          {result.categories.map((c) => (
            <CategoryMeter key={c.key} category={c} />
          ))}
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Suggested coaching focus</p>
          {focus.length === 0 ? (
            <EmptyState>No weak areas (score 2 or below) this review.</EmptyState>
          ) : (
            <ul className="list-disc space-y-1 pl-4 text-sm text-zinc-700">
              {focus.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
          <label className="mt-3 block text-xs font-medium text-zinc-600">Scoring notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
            placeholder="Rationale for these scores, context for next review…"
          />
        </div>
      </div>
    </Card>
  )
}
