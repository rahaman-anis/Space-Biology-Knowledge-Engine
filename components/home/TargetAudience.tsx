export default function TargetAudience() {
  const stats = [
    {
      value: "2s",
      label: "Search speed",
      description: "Sub-2-second results across 572 full-text papers",
    },
    {
      value: "173",
      label: "Mission-critical gaps",
      description: "Automatically extracted from Discussion sections",
    },
    {
      value: "96%",
      label: "Section accuracy",
      description: "Validated on a 50-paper manual sample",
    },
    {
      value: "572",
      label: "Publications",
      description: "Complete challenge corpus integrated",
    },
    {
      value: "NASA",
      label: "Data integration",
      description: "OSDR, GeneLab, Task Book cross-referenced",
    },
  ]

  return (
    <section className="py-12 md:py-16 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-3">Built for Mission Success</h2>
          <p className="text-base md:text-lg text-gray-700">
            For NASA mission planners, space biology researchers, and research managers
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-start gap-2">
              <div className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">{stat.value}</div>
              <div className="text-sm font-medium text-gray-600">{stat.label}</div>
              <div className="text-sm text-gray-500 leading-relaxed">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
