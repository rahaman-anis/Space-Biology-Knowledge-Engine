import type { ExportItem } from "@/types/citation"

export function toRIS(items: ExportItem[]): string {
  const lines: string[] = []
  for (const it of items) {
    lines.push("TY  - JOUR")
    ;(it.authors ?? []).forEach((a) => lines.push(`AU  - ${a}`))
    if (it.title) lines.push(`TI  - ${it.title}`)
    if (it.journal) lines.push(`JO  - ${it.journal}`)
    if (it.year) lines.push(`PY  - ${it.year}`)
    if (it.pmcid) lines.push(`ID  - PMCID ${it.pmcid}`)
    if (it.ntrsId) lines.push(`ID  - NTRS ${it.ntrsId}`)
    if (it.osdrId) lines.push(`ID  - OSDR ${it.osdrId}`)
    if (it.section) lines.push(`N1  - Section ${it.section}`)
    lines.push("ER  - ")
  }
  return lines.join("\n")
}

export function downloadRIS(items: ExportItem[], filename = "citations.ris") {
  const blob = new Blob([toRIS(items)], { type: "application/x-research-info-systems;charset=utf-8" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}
