import fs from "node:fs/promises"

export const metadata = { title: "Operations Runbook" }

export default async function RunbookPage() {
  const md = await fs.readFile(process.cwd() + "/docs/OPERATIONS.md", "utf8").catch(() => "Missing OPERATIONS.md")
  return (
    <main id="main" className="prose max-w-3xl mx-auto px-4 py-8">
      <article dangerouslySetInnerHTML={{ __html: md.replace(/\n/g, "<br/>") }} />
    </main>
  )
}
