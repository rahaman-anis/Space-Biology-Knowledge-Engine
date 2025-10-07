export default function CredibilitySection() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-4">Beyond Traditional Search</h2>
          <p className="text-base md:text-lg text-gray-700 mb-10 leading-relaxed">
            Unlike PubMed or Google Scholar: Section-aware search, confidence scoring, automated gap identification,
            sub-2-second queries across full-text papers
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="text-4xl mb-3">🚀</div>
              <p className="text-sm md:text-base text-gray-700 font-medium leading-relaxed">
                Complete integration of NASA space biology repositories
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="text-4xl mb-3">🎯</div>
              <p className="text-sm md:text-base text-gray-700 font-medium leading-relaxed">
                96% accuracy on section classification (validated)
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="text-4xl mb-3">⚡</div>
              <p className="text-sm md:text-base text-gray-700 font-medium leading-relaxed">
                Sub-2-second search performance
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="text-4xl mb-3">🔬</div>
              <p className="text-sm md:text-base text-gray-700 font-medium leading-relaxed">
                Reviewed by space biology experts
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
