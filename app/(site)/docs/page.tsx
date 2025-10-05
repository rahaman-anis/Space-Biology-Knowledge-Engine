import Link from "next/link"

export const metadata = { title: "Documentation" }

export default function DocsIndex() {
  return (
    <main id="main" className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      <h1 className="font-heading text-h1 text-gray-900">Documentation</h1>
      <p className="text-body text-gray-700">Developer & operator guides.</p>
      <ul className="list-disc ml-6 text-body text-gray-800 space-y-2">
        <li>
          <Link
            href="/docs/styleguide"
            className="text-primary-600 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            Design tokens & styleguide
          </Link>
        </li>
        <li>
          <Link
            href="/docs/api"
            className="text-primary-600 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            API routes & payloads
          </Link>
        </li>
        <li>
          <Link
            href="/docs/runbook"
            className="text-primary-600 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            Operations runbook
          </Link>
        </li>
      </ul>
    </main>
  )
}
