import Link from "next/link"

export function Footer() {
  return (
    <footer className="col-span-full border-t border-neutral-700/50 bg-deep-blue-900/50 px-4 py-6 md:px-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-400">
        <p>NASA LifeLens &copy; {new Date().getFullYear()} &middot; Astrobiology Knowledge Synthesis</p>
        <nav aria-label="Footer navigation">
          <Link
            href="/methods"
            className="text-neon-yellow hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
          >
            Methods & Transparency
          </Link>
        </nav>
      </div>
    </footer>
  )
}
