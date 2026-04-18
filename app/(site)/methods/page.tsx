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

      {/* DATA FOUNDATION */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">DATA FOUNDATION</h2>
        <div className="bg-gray-50 rounded-xl p-8">
          <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-relaxed">
            <li className="font-normal">
              572 peer-reviewed publications from NASA spaceflight studies aggregated from OSDR, PSI, GeneLab, Task Book, and PubMed Central
            </li>
            <li className="font-normal">
              245 OSDR dataset cross-references linking publications to related experimental data
            </li>
            <li className="font-normal">156 GeneLab datasets with genomic and transcriptomic profiles</li>
            <li className="font-normal">87 Task Book entries linked to related research activity</li>
            <li className="font-normal">
              Full-text XML articles parsed from open repositories where available
            </li>
          </ul>
        </div>
      </section>

      {/* EVIDENCE PROCESSING PIPELINE */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">EVIDENCE PROCESSING PIPELINE</h2>
        <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
          <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-relaxed">
            <li className="font-normal">
              Section-level parsing using IMRaD structure (Introduction, Methods, Results, Discussion)
            </li>
            <li className="font-normal">
              2,165 section-level evidence spans extracted and tagged by section type
            </li>
            <li className="font-normal">
              Section-aware retrieval where Results sections are prioritised for factual claims
            </li>
            <li className="font-normal">
              Semantic embeddings generated for evidence spans to support similarity search
            </li>
            <li className="font-normal">
              Structured claim extraction from scientific text
            </li>
            <li className="font-normal">
              Discussion-section mining to identify explicit research gaps
            </li>
          </ul>
        </div>
      </section>

      {/* KNOWLEDGE GRAPH CONSTRUCTION */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">KNOWLEDGE GRAPH CONSTRUCTION</h2>
        <div className="bg-gray-50 rounded-xl p-8">
          <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-relaxed">
            <li className="font-normal">
              1,092 structured claims extracted from the corpus
            </li>
            <li className="font-normal">
              28,864 evidence relations mapped across the literature
            </li>
            <li className="font-normal">
              Support and contradiction links used to surface consensus and contested findings
            </li>
            <li className="font-normal">
              Graph views help users explore relationships across topics, organisms, and mission contexts
            </li>
          </ul>
        </div>
      </section>

      {/* AUTOMATED GAP IDENTIFICATION */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">AUTOMATED GAP IDENTIFICATION</h2>
        <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
          <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-relaxed">
            <li className="font-normal">
              173 research gaps identified from Discussion sections and corpus coverage analysis
            </li>
            <li className="font-normal">
              Gaps classified by topic and organism type
            </li>
            <li className="font-normal">
              Priority and severity signals used to highlight mission-relevant unknowns
            </li>
            <li className="font-normal">
              Mission-specific views surface gaps relevant to Lunar, Mars, and ISS scenarios
            </li>
          </ul>
        </div>
      </section>

      {/* QUALITY ASSURANCE & VALIDATION */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">QUALITY ASSURANCE & VALIDATION</h2>
        <div className="bg-gray-50 rounded-xl p-8">
          <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-relaxed">
            <li className="font-normal">
              Section classification manually validated on a sample set
            </li>
            <li className="font-normal">
              Claim extraction reviewed with biology SME input
            </li>
            <li className="font-normal">
              Gap outputs spot-checked against known NASA literature patterns
            </li>
            <li className="font-normal">
              Traceable citations link findings back to source publications
            </li>
            <li className="font-normal">
              Confidence scoring combines study count, section quality, recency, and source signals
            </li>
          </ul>
        </div>
      </section>

      {/* MISSION APPLICATIONS */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">MISSION APPLICATIONS</h2>
        <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
          <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-relaxed">
            <li className="font-normal">
              Mission-specific filtering supports evidence retrieval for Lunar, Mars, and ISS scenarios
            </li>
            <li className="font-normal">
              Risk assessment support by surfacing known hazards, evidence gaps, and contradictions
            </li>
            <li className="font-normal">
              Countermeasure evaluation through evidence synthesis across multiple studies
            </li>
            <li className="font-normal">
              Topic views support exploration of bone, immune, radiation, muscle, and cardiovascular effects
            </li>
          </ul>
        </div>
      </section>

      {/* Open Science */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Open Science</h2>
        <p className="text-base text-gray-800">
          This project follows open science principles. The methodology is documented, and future work includes expanding the corpus, improving reproducibility, and releasing more of the processing workflow.
        </p>
      </section>
    </div>
  )
}
