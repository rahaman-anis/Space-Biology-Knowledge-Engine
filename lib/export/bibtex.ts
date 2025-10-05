import type { ExportItem } from "@/types/citation"

function keyOf(it: ExportItem) {
  const base = it.pmcid
    ? `pmc${it.pmcid}`
    : it.ntrsId
      ? `ntrs${it.ntrsId}`
      : it.osdrId
        ? `osdr${it.osdrId}`
        : `item${it.id}`
  return base.replace(/[^a-zA-Z0-9]/g, "")
}

export function toBibTeX(items: ExportItem[]): string {
  return items
    .map((it) => {
      const key = keyOf(it)
      const fields = [
        ["title", it.title],
        ["year", it.year?.toString()],
        ["journal", it.journal],
        ["author", it.authors?.join(" and ")],
        ["pmcid", it.pmcid],
        ["ntrs", it.ntrsId],
        ["osdr", it.osdrId],
        ["note", it.section ? `[${it.section}]` : undefined],
      ].filter(([, v]) => v != null && String(v).trim().length > 0)

      const body = fields.map(([k, v]) => `  ${k} = {${String(v)}}`).join(",\n")
      return `@article{${key},\n${body}\n}`
    })
    .join("\n\n")
}

export function downloadBibTeX(items: ExportItem[], filename = "citations.bib") {
  const blob = new Blob([toBibTeX(items)], { type: "text/plain;charset=utf-8" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}
