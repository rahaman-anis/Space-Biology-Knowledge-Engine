export default function TargetAudience() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-4 text-center">
            Built for Mission Success
          </h2>

          <p className="text-base md:text-lg text-gray-700 mb-8 text-center leading-relaxed">
            For NASA mission planners, space biology researchers, and research managers
            <br className="hidden sm:block" />
            planning Artemis lunar missions and Mars exploration.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-xl flex-shrink-0 mt-0.5">✓</span>
              <span className="text-gray-700">Section-aware search (prioritizes Results over abstracts)</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-xl flex-shrink-0 mt-0.5">✓</span>
              <span className="text-gray-700">Sub-2-second queries across 572 full-text papers</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-xl flex-shrink-0 mt-0.5">✓</span>
              <span className="text-gray-700">Automated gap identification (173 mission-critical unknowns)</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-xl flex-shrink-0 mt-0.5">✓</span>
              <span className="text-gray-700">Confidence scoring on every finding</span>
            </div>
            <div className="flex items-start gap-3 sm:col-span-2">
              <span className="text-green-600 text-xl flex-shrink-0 mt-0.5">✓</span>
              <span className="text-gray-700">Full NASA data integration (OSDR, GeneLab, Task Book)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
