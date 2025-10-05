export type Check = { id: string; label: string; ok: boolean | null; note?: string }

export default function Checklist({ title, items }: { title: string; items: Check[] }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="font-heading text-h2 text-gray-900 mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.id} className="flex items-start gap-2">
            <span
              aria-hidden
              className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full ${
                i.ok === true ? "bg-success-600" : i.ok === false ? "bg-danger-600" : "bg-gray-300"
              }`}
            >
              <span className="text-white text-caption">{i.ok === true ? "✓" : i.ok === false ? "!" : "…"}</span>
            </span>
            <div>
              <div className="text-body text-gray-900">{i.label}</div>
              {i.note && <div className="text-caption text-gray-700">{i.note}</div>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
