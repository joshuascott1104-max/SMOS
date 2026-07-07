import "server-only"
import ExcelJS from "exceljs"

export type ParsedSpreadsheet = {
  headers: string[]
  rows: Record<string, string>[]
}

export async function parseSpreadsheetFile(file: File): Promise<ParsedSpreadsheet> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const name = file.name.toLowerCase()

  if (name.endsWith(".csv") || file.type === "text/csv") {
    return parseCsvBuffer(buffer.toString("utf-8"))
  }

  return parseXlsxBuffer(buffer)
}

async function parseXlsxBuffer(buffer: Buffer): Promise<ParsedSpreadsheet> {
  const workbook = new ExcelJS.Workbook()
  // @types/node 20.19.x has two internally-inconsistent Buffer declarations;
  // this is a real Node Buffer at runtime and exceljs accepts it fine.
  // @ts-expect-error — Buffer<ArrayBufferLike> vs Buffer type-level mismatch only, see above.
  await workbook.xlsx.load(buffer)
  const sheet = workbook.worksheets[0]
  if (!sheet) return { headers: [], rows: [] }

  let headers: string[] = []
  const rows: Record<string, string>[] = []

  sheet.eachRow((row, rowNumber) => {
    const cells = row.values as ExcelJS.CellValue[]
    const values = cells.slice(1).map(cellToString)

    if (rowNumber === 1) {
      headers = values.map((v) => v.trim())
      return
    }

    if (values.every((v) => v.trim() === "")) return

    const obj: Record<string, string> = {}
    headers.forEach((h, i) => {
      obj[h] = (values[i] ?? "").trim()
    })
    rows.push(obj)
  })

  return { headers, rows }
}

function cellToString(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return ""
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === "object") {
    if ("text" in value && typeof value.text === "string") return value.text
    if ("result" in value && value.result !== undefined) return String(value.result)
    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text).join("")
    }
    return ""
  }
  return String(value)
}

function parseCsvBuffer(text: string): ParsedSpreadsheet {
  const table = parseCsvRows(text)
  if (table.length === 0) return { headers: [], rows: [] }

  const headers = table[0].map((h) => h.trim())
  const rows = table
    .slice(1)
    .filter((r) => r.some((cell) => cell.trim() !== ""))
    .map((r) => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? "").trim()])))

  return { headers, rows }
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false
  let i = 0
  const len = text.length

  while (i < len) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += char
      i++
      continue
    }

    if (char === '"') {
      inQuotes = true
      i++
      continue
    }
    if (char === ",") {
      row.push(field)
      field = ""
      i++
      continue
    }
    if (char === "\r") {
      i++
      continue
    }
    if (char === "\n") {
      row.push(field)
      rows.push(row)
      row = []
      field = ""
      i++
      continue
    }
    field += char
    i++
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ""))
}
