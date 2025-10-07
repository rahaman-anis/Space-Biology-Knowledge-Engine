import Link from "next/link"

type Tool = {
  icon: string
  title: string
  description: string
  caption: string
  href: string
  ctaLabel: string
}

const TOOLS: Tool[] = [
  {
    icon: "🤖",
    title: "Ask ARIA",
    description: "AI-powered answers with source citations",
    caption: "Get evidence in seconds, not weeks",
    href: "/aria",
    ctaLabel: "Try ARIA →",
  },
  {
    icon: "📊",
    title: "Explore Topics",
    description: "Browse evidence by biological system",
    caption: "6 topics • 572 studies • Maturity ratings",
    href: "/evidence",
    ctaLabel: "Browse Topics →",
  },
  {
    icon: "🔍",
    title: "Identify Gaps",
    description: "Find mission-critical unknowns",
    caption: "173 gaps prioritized by mission risk",
    href: "/gaps",
    ctaLabel: "View Gaps →",
  },
  {
    icon: "🕸️",
    title: "Map Evidence",
    description: "Visualize 28,864 evidence relations",
    caption: "See consensus, controversy, and connections",
    href: "/graph",
    ctaLabel: "Explore Graph →",
  },
]

export default function ExploreTools() {
  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-3 text-center">
          Explore Our Tools
        </h2>
        <p className="text-lg md:text-xl text-gray-600 mb-10 text-center">
          Four ways to navigate NASA's space biology evidence
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {TOOLS.map((tool, i) => (
            <Link
              key={i}
              href={tool.href}
              className="group bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              aria-label={`${tool.title}: ${tool.description}`}
            >
              <div className="text-5xl mb-4">{tool.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{tool.title}</h3>
              <p className="text-gray-700 mb-3 leading-relaxed">{tool.description}</p>
              <p className="text-sm text-gray-500 mb-4 italic">{tool.caption}</p>
              <button className="inline-flex items-center justify-center w-full px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors min-h-[44px]">
                {tool.ctaLabel}
              </button>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
