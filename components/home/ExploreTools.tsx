import Link from "next/link"

type Tool = {
  icon: string
  title: string
  line1: string
  line2: string
  buttonText: string
  href: string
}

const TOOLS: Tool[] = [
  {
    icon: "📊",
    title: "Browse Topics",
    line1: "Research maturity by biological system",
    line2: "See which areas are mission-ready vs. need more study",
    buttonText: "Browse Topics",
    href: "/evidence",
  },
  {
    icon: "🔍",
    title: "Find Gaps",
    line1: 'Systematic extraction of "future research needed" from 572 papers',
    line2: "Research unknowns ranked by mission impact and priority",
    buttonText: "View All Gaps",
    href: "/gaps",
  },
  {
    icon: "🕸️",
    title: "Map Evidence",
    line1: "Visualise which studies support vs. contradict each other",
    line2: "28,864 evidence relations show consensus and controversy patterns",
    buttonText: "Explore Graph",
    href: "/graph",
  },
]

export default function ExploreTools() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-8 text-center">
          More Ways to Explore Evidence
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {TOOLS.map((tool, i) => (
            <Link
              key={i}
              href={tool.href}
              className="group rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 flex flex-col gap-3"
              aria-label={`${tool.title}: ${tool.line1}`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl flex-shrink-0">{tool.icon}</div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900">{tool.title}</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm md:text-base text-gray-700">{tool.line1}</p>
                <p className="text-sm md:text-base text-gray-600">{tool.line2}</p>
              </div>
              <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm md:text-base mt-auto group-hover:gap-3 transition-all">
                {tool.buttonText} <span className="text-lg">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
