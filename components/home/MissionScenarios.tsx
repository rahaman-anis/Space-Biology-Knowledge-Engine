type Item = {
  title: string
  emoji: string
  subtitle: string
  description: string
  cta: { label: string; href: string }
  gradient: string
}

const SCENARIOS: Item[] = [
  {
    title: "Lunar Stay (14-28 days)",
    emoji: "🌕",
    subtitle: "Radiation • Dust exposure • Partial gravity effects",
    description:
      "Limited partial-gravity analogs in current evidence base. Short-duration missions have gaps in long-term health data.",
    cta: { label: "Assess Readiness →", href: "/aria?q=lunar%20stay%20risks" },
    gradient: "from-blue-400 to-blue-600",
  },
  {
    title: "Mars Transit (6-9 months)",
    emoji: "🔴",
    subtitle: "Bone loss • Muscle atrophy • Radiation exposure",
    description:
      "Strong ISS baseline for similar mission durations. Deep space radiation differs from LEO environment.",
    cta: { label: "Assess Readiness →", href: "/aria?q=mars%20transit%20risks" },
    gradient: "from-red-500 to-orange-600",
  },
  {
    title: "ISS Operations (6+ months)",
    emoji: "🛰️",
    subtitle: "572 studies • 2,165 evidence spans • High confidence",
    description: "Comprehensive evidence base from long-duration missions. Strongest foundation for extrapolation.",
    cta: { label: "Compare Scenarios →", href: "/aria?q=compare%20iss%20vs%20mars" },
    gradient: "from-cyan-400 to-blue-500",
  },
]

export default function MissionScenarios() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4 text-center">Mission Scenarios</h2>
        <p className="text-xl text-gray-600 mb-12 text-center">
          Assess evidence readiness for different mission profiles
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {SCENARIOS.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div
                className={`w-32 h-32 mx-auto mb-6 bg-gradient-to-br ${s.gradient} rounded-3xl flex items-center justify-center shadow-xl`}
              >
                <span className="text-6xl">{s.emoji}</span>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">{s.title}</h3>

              <p className="text-base font-semibold text-gray-900 mb-6 text-center">{s.subtitle}</p>

              <p className="text-base text-gray-700 mb-8 leading-relaxed">{s.description}</p>

              <a href={s.cta.href}>
                <button className="w-full py-4 bg-[#0042A6] hover:bg-[#07173F] text-white font-bold rounded-xl transition-colors text-lg">
                  {s.cta.label}
                </button>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
