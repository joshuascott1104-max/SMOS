"use client"

import { useRef, useState, useTransition } from "react"
import { validateTop10File, confirmTop10Import, type ConfirmTop10Result } from "@/lib/mutations/top10-import"
import type { Top10ValidatedRow } from "@/lib/top10-import"
import { Button } from "@/components/ui"
import { formatCurrency, formatDate } from "@/lib/format"

export function Top10ImportForm() {
  const [pending, startTransition] = useTransition()
  const [fileName, setFileName] = useState<string | null>(null)
  const [rows, setRows] = useState<Top10ValidatedRow[] | null>(null)
  const [missingHeaders, setMissingHeaders] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ConfirmTop10Result | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const errorRows = rows?.filter((r) => r.errors.length > 0) ?? []
  const okRows = rows?.filter((r) => r.errors.length === 0) ?? []

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setResult(null)
    setError(null)
    setMissingHeaders([])

    const formData = new FormData()
    formData.append("file", file)

    startTransition(async () => {
      try {
        const res = await validateTop10File(formData)
        setRows(res.rows)
        setMissingHeaders(res.missingHeaders)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not read file")
        setRows(null)
      }
    })
  }

  function handleConfirm() {
    if (!rows) return
    startTransition(async () => {
      setError(null)
      try {
        const res = await confirmTop10Import(rows)
        setResult(res)
        setRows(null)
        setFileName(null)
        if (inputRef.current) inputRef.current.value = ""
      } catch (e) {
        setError(e instanceof Error ? e.message : "Import failed")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <a
          href="/top10-import-template.csv"
          download
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Download CSV template
        </a>
        <label className="cursor-pointer rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800">
          {fileName ?? "Choose file (CSV or XLSX)"}
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
        {pending && <span className="text-sm text-zinc-500">Working…</span>}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {missingHeaders.length > 0 && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">Missing required column(s) — check the file against the template:</p>
          <ul className="list-disc pl-5">
            {missingHeaders.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      )}

      {result && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          Imported {result.inserted} new opportunit{result.inserted === 1 ? "y" : "ies"}, updated {result.updated}{" "}
          existing, and archived {result.archived} superseded from previous weeks.
        </div>
      )}

      {rows && rows.length > 0 && (
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-zinc-600">
              {rows.length} row{rows.length === 1 ? "" : "s"} parsed &middot; {errorRows.length} with errors &middot;{" "}
              {okRows.length} ready to import
            </p>
            <Button disabled={pending || errorRows.length > 0} onClick={handleConfirm}>
              Confirm import
            </Button>
          </div>
          {errorRows.length > 0 && (
            <p className="mb-3 text-sm text-red-600">Fix the errors below and re-upload before you can import.</p>
          )}
          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <th className="px-3 py-2">Row</th>
                  <th className="px-3 py-2">Week</th>
                  <th className="px-3 py-2">BDM</th>
                  <th className="px-3 py-2">Prospect</th>
                  <th className="px-3 py-2">Revenue</th>
                  <th className="px-3 py-2">GP</th>
                  <th className="px-3 py-2">Prob.</th>
                  <th className="px-3 py-2">Stage</th>
                  <th className="px-3 py-2">Next action</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.rowNumber}
                    className={`border-b border-zinc-100 last:border-0 ${row.errors.length > 0 ? "bg-red-50" : ""}`}
                  >
                    <td className="px-3 py-2 text-zinc-500">{row.rowNumber}</td>
                    <td className="px-3 py-2 text-zinc-600">
                      {row.weekCommencing ? formatDate(row.weekCommencing) : row.weekCommencingRaw || "—"}
                    </td>
                    <td className="px-3 py-2 text-zinc-600">{row.bdmNameInput}</td>
                    <td className="px-3 py-2 font-medium text-zinc-900">{row.companyName}</td>
                    <td className="px-3 py-2 text-zinc-600">
                      {row.estimatedMonthlyRevenue != null ? formatCurrency(row.estimatedMonthlyRevenue) : "—"}
                    </td>
                    <td className="px-3 py-2 text-zinc-600">
                      {row.estimatedMonthlyGp != null ? formatCurrency(row.estimatedMonthlyGp) : "—"}
                    </td>
                    <td className="px-3 py-2 text-zinc-600">{row.probability != null ? `${row.probability}%` : "—"}</td>
                    <td className="px-3 py-2 text-zinc-600">{row.stage ?? row.stageRaw ?? "—"}</td>
                    <td className="px-3 py-2 text-zinc-600">{row.nextAction ?? "—"}</td>
                    <td className="px-3 py-2">
                      {row.errors.length === 0 ? (
                        <span className="font-medium text-emerald-600">OK</span>
                      ) : (
                        <ul className="space-y-0.5 text-xs text-red-600">
                          {row.errors.map((e, i) => (
                            <li key={i}>{e}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
