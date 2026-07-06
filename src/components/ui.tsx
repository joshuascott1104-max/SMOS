import Link from "next/link"
import type { ReactNode } from "react"
import { labelize } from "@/lib/format"

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-none items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-zinc-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function CardHeading({ children, count }: { children: ReactNode; count?: number }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{children}</h2>
      {count !== undefined && (
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
          {count}
        </span>
      )}
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="py-4 text-sm text-zinc-400">{children}</p>
}

const BADGE_COLORS: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  open: "bg-blue-50 text-blue-700 ring-blue-600/20",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  won: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  closed_won: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  lost: "bg-red-50 text-red-700 ring-red-600/20",
  closed_lost: "bg-red-50 text-red-700 ring-red-600/20",
  cancelled: "bg-zinc-100 text-zinc-600 ring-zinc-500/20",
  archived: "bg-zinc-100 text-zinc-600 ring-zinc-500/20",
  replanned: "bg-amber-50 text-amber-700 ring-amber-600/20",
  inactive: "bg-zinc-100 text-zinc-600 ring-zinc-500/20",
  scheduled: "bg-zinc-100 text-zinc-600 ring-zinc-500/20",
  in_progress: "bg-blue-50 text-blue-700 ring-blue-600/20",
  overdue: "bg-red-50 text-red-700 ring-red-600/20",
  high: "bg-red-50 text-red-700 ring-red-600/20",
  medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
  low: "bg-zinc-100 text-zinc-600 ring-zinc-500/20",
  on_track: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  at_risk: "bg-amber-50 text-amber-700 ring-amber-600/20",
  not_started: "bg-zinc-100 text-zinc-600 ring-zinc-500/20",
}

export function Badge({ value, label }: { value: string; label?: string }) {
  const colorClass = BADGE_COLORS[value] ?? "bg-zinc-100 text-zinc-600 ring-zinc-500/20"
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${colorClass}`}
    >
      {label ?? labelize(value)}
    </span>
  )
}

export function StatTile({ label, value, href }: { label: string; value: string | number; href?: string }) {
  const content = (
    <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900">{value}</p>
    </div>
  )
  if (href) {
    return (
      <Link href={href} className="block transition-shadow hover:shadow-md">
        {content}
      </Link>
    )
  }
  return content
}

export function Button({
  children,
  variant = "primary",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  const styles = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-800",
    secondary: "bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50",
    danger: "bg-red-600 text-white hover:bg-red-500",
  }[variant]

  return (
    <button
      {...rest}
      className={`rounded-md px-3 py-2 text-sm font-medium disabled:opacity-50 ${styles} ${rest.className ?? ""}`}
    >
      {children}
    </button>
  )
}

export function LinkButton({
  href,
  children,
  variant = "primary",
}: {
  href: string
  children: ReactNode
  variant?: "primary" | "secondary"
}) {
  const styles = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-800",
    secondary: "bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50",
  }[variant]

  return (
    <Link href={href} className={`rounded-md px-3 py-2 text-sm font-medium ${styles}`}>
      {children}
    </Link>
  )
}
