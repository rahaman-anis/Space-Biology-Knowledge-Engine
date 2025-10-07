import Link from "next/link"

type Tool = {
  icon: string
  title: string
  description: string
  href: string
}

const TOOLS: Tool[] = [
  {
    icon: "📊",
    title: "Browse Topics",
    description: "View by biological system",
    href: "/evidence",
  },
  {
    icon: "🔍",
    title: "Find Gaps",
    description: "173 mission-critical unknowns",
    href: "/gaps",
  },
  {
    icon: "🕸️",
    title: "Map Evidence",
    description: "28,864 evidence relations",
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
              className="group rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 flex items-center gap-4"
              aria-label={`${tool.title}: ${tool.description}`}
            >
              <div className="text-3xl flex-shrink-0">{tool.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">{tool.title}</h3>
                <p className="text-sm md:text-base text-gray-600">{tool.description}</p>
              </div>
              <div className="text-gray-400 group-hover:text-gray-600 transition-colors">→</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
