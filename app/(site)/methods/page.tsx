import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Methods & Data Coverage | NASA LifeLens",
  description: "How we process, validate and present space biology evidence",
}

export default function MethodsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
      <header>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Methods & Data Coverage</h1>
        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl">
          How we process, validate and present space biology evidence
        </p>
      </header>

      {/* Data Sources */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Data Sources</h2>
        <p className="text-base text-gray-800 mb-6">
          We aggregate peer-reviewed publications from NASA repositories including the Open Science Data Repository
          (OSDR), Physical Sciences Informatics (PSI), GeneLab, and PubMed Central.
        </p>

        <div className="bg-gray-50 rounded-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Current Coverage</h3>
          <ul className="space-y-3 bullet-list">
            <li className="text-base text-gray-900">
              <strong>572 peer-reviewed publications</strong> from NASA spaceflight studies
            </li>
            <li className="text-base text-gray-900">
              <strong>245 OSDR dataset cross-references</strong> linking publications to raw experimental data
            </li>
            <li className="text-base text-gray-900">
              <strong>156 GeneLab datasets</strong> with genomic and transcriptomic profiles
            </li>
            <li className="text-base text-gray-900">
              <strong>87 Task Book entries</strong> tracking ongoing research projects
            </li>
          </ul>
        </div>
      </section>

      {/* Evidence Processing */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Evidence Processing</h2>
        <p className="text-base text-gray-800 mb-6">
          Full-text XML articles are parsed into section-level spans using IMRaD structure (Introduction, Methods,
          Results, Discussion). This enables section-aware retrieval where Results sections are prioritized for factual
          claims.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Section Tagging</h3>
            <p className="text-base text-gray-800">
              2,165 evidence spans extracted and tagged: Abstract (702), Results (386), Methods (385), Discussion (276),
              Introduction (218), Conclusion (198)
            </p>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Knowledge Graph</h3>
            <p className="text-base text-gray-800">
              28,864 evidence relations (supports/contradicts) extracted using natural language processing to map
              agreement and disagreement across studies
            </p>
          </div>
        </div>
      </section>

      {/* Quality Assurance */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Quality Assurance</h2>
        <p className="text-base text-gray-800 mb-6">
          All evidence undergoes automated validation and structured extraction. We track source reliability, citation
          context, and contradiction detection to provide confidence scores for each finding.
        </p>

        <ul className="space-y-3 bg-gray-50 rounded-xl p-8 bullet-list">
          <li className="text-base text-gray-900">
            Automated section classification with manual validation for edge cases
          </li>
          <li className="text-base text-gray-900">
            Citation tracking across the corpus to identify consensus and outliers
          </li>
          <li className="text-base text-gray-900">
            Contradiction detection flags conflicting findings for expert review
          </li>
        </ul>
      </section>

      {/* Open Science */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Open Science</h2>
        <p className="text-base text-gray-800">
          This project follows open science principles. Our methodology is fully documented, and we plan to release
          processed datasets and analysis code under open licenses to enable reproducibility and community
          contributions.
        </p>
      </section>
    </div>
  )
}
