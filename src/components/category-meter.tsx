import type { CategoryScore } from "@/lib/scoring"
import { formatCurrency } from "@/lib/format"

const TRACK = "#b7d3f6"
const FILL = "#2a78d6"
const WEAK_THRESHOLD = 70

function formatActual(c: CategoryScore): string {
  if (c.unit === "£") return formatCurrency(c.actual)
  if (c.unit === "%") return `${Math.round(c.actual)}%`
  if (c.unit === "/wk") return `${c.actual}`
  return `${c.actual}`
}

function formatTarget(c: CategoryScore): string {
  if (c.unit === "£") return formatCurrency(c.target)
  if (c.unit === "%") return `${Math.round(c.target)}%`
  if (c.unit === "/wk") return `${c.target}`
  return `${c.target}`
}

export function CategoryMeter({ category }: { category: CategoryScore }) {
  const isWeak = category.achievementPct < WEAK_THRESHOLD

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium text-zinc-900">{category.label}</p>
        <p className="text-xs text-zinc-500">
          {category.points.toFixed(1)} / {category.maxPoints} pts
        </p>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: TRACK }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${category.achievementPct}%`, backgroundColor: isWeak ? "#d03b3b" : FILL }}
        />
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        {formatActual(category)} of {formatTarget(category)} target &middot; {Math.round(category.achievementPct)}% achieved
      </p>
    </div>
  )
}
