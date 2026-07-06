import { STATUS_COLORS, type RatingBand } from "@/lib/scoring"

const TRACK_COLOR = "#e1e0d9"

export function ScoreRing({
  score,
  rating,
  size = 140,
}: {
  score: number
  rating: RatingBand
  size?: number
}) {
  const strokeWidth = size * 0.11
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, score))
  const dashOffset = circumference * (1 - clamped / 100)
  const fillColor = STATUS_COLORS[rating.statusColor]

  return (
    <div className="inline-flex flex-col items-center" role="img" aria-label={`Commercial Health Score ${score} out of 100, rated ${rating.label}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={TRACK_COLOR}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="46%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-zinc-900"
          style={{ fontSize: size * 0.26, fontWeight: 600 }}
        >
          {Math.round(clamped)}
        </text>
        <text
          x="50%"
          y="64%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-zinc-500"
          style={{ fontSize: size * 0.1 }}
        >
          / 100
        </text>
      </svg>
    </div>
  )
}
