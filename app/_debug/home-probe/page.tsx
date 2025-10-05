export default function HomeProbe() {
  return (
    <section className="mx-auto max-w-2xl p-6">
      <h1 className="text-xl font-bold">Home Probe</h1>
      <p className="text-gray-700">
        If this renders but "/" does not, there is an issue specifically in the real homepage or its imports.
      </p>
      <ul className="mt-4 list-disc pl-5 text-sm text-gray-700 space-y-1">
        <li>Root "/" renders app/page.tsx (Design System Showcase)</li>
        <li>Actual homepage is at app/(site)/page.tsx (Space Biology Knowledge Engine)</li>
        <li>Try visiting /(site) route to see the actual app homepage</li>
        <li>Check if heavy imports (3D graphs, charts, data components) are causing issues</li>
      </ul>
    </section>
  )
}
