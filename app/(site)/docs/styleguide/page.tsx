import fs from "node:fs/promises"

export const metadata = { title: "Styleguide" }

export default async function StyleguidePage() {
  const md = await fs.readFile(process.cwd() + "/docs/DESIGN_TOKENS.md", "utf8").catch(() => "Missing DESIGN_TOKENS.md")
  return (
    <main id="main" className="prose max-w-3xl mx-auto px-4 py-8">
      <article dangerouslySetInnerHTML={{ __html: md.replace(/\n/g, "<br/>") }} />
    </main>
  )
}
