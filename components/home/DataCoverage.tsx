export default function DataCoverage() {
  const items = [
    { label: "Publications", value: "572", icon: "📚" },
    { label: "OSDR Links", value: "245", icon: "🧬" },
    { label: "Claims Extracted", value: "1,092", icon: "📊" },
    { label: "GeneLab Datasets", value: "156", icon: "🔬" },
    { label: "Evidence Relations", value: "28,864", icon: "🔗" },
    { label: "Research Gaps", value: "173", icon: "❓" },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-heading font-bold text-gray-900 mb-12 text-center">Evidence Corpus</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((it, i) => (
            <div key={i} className="text-center p-8 bg-gray-50 rounded-2xl">
              <div className="text-6xl mb-4">{it.icon}</div>
              <div className="text-5xl font-black text-gray-900 mb-2">{it.value}</div>
              <div className="text-lg text-gray-600">{it.label}</div>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-600 mt-8 text-base">
          Last updated: 2 days ago • Corpus version: 2025.10.04 •{" "}
          <a href="/methods" className="text-[#0042A6] hover:underline font-semibold">
            Methods & Coverage →
          </a>
        </p>
      </div>
    </section>
  )
}
