import { STATUS_COLORS, type RatingBand } from "@/lib/scoring"

const ICON_PATH: Record<RatingBand["statusColor"], string> = {
  good: "M9 12.75 11.25 15 15 9.75", // check
  warning: "M12 8.25v4.5m0 3h.008", // exclamation
  serious: "M12 8.25v4.5m0 3h.008",
  critical: "M9.75 9.75l4.5 4.5m0-4.5-4.5 4.5", // x
}

export function RatingBadge({ rating, size = "md" }: { rating: RatingBand; size?: "sm" | "md" }) {
  const color = STATUS_COLORS[rating.statusColor]
  const dims = size === "sm" ? "h-4 w-4" : "h-5 w-5"
  const textSize = size === "sm" ? "text-xs" : "text-sm"

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${textSize}`}
      style={{ backgroundColor: `${color}1a`, color }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={dims}>
        <circle cx="12" cy="12" r="9" />
        <path d={ICON_PATH[rating.statusColor]} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {rating.label}
    </span>
  )
}
