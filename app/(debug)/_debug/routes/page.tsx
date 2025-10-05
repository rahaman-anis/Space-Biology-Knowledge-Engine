import fs from "node:fs"
import path from "node:path"

export const dynamic = "force-dynamic"

const check = (p: string) => fs.existsSync(path.join(process.cwd(), "app", p))

export default function RoutesDebug() {
  const probes = [
    { url: "/", file: "(site)/page.tsx" },
    { url: "/aria", file: "(site)/aria/page.tsx" },
    { url: "/evidence", file: "(site)/evidence/page.tsx" },
    { url: "/gaps", file: "(site)/gaps/page.tsx" },
    { url: "/graph", file: "(site)/graph/page.tsx" },
    { url: "/methods", file: "(site)/methods/page.tsx" },
    { url: "/catalog", file: "(site)/catalog/page.tsx" },
  ].map((r) => ({ ...r, exists: check(r.file) }))

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, sans-serif" }}>
      <h1>Route Ownership Probe</h1>
      <ul>
        {probes.map((p) => (
          <li key={p.url}>
            <code>{p.url}</code> → <code>app/{p.file}</code> {p.exists ? "✅" : "❌"}
          </li>
        ))}
      </ul>
      <hr style={{ margin: "20px 0" }} />
      <p style={{ fontSize: 14, color: "#666" }}>
        All routes should show ✅. If any show ❌, check for duplicate pages or missing files.
      </p>
    </div>
  )
}
