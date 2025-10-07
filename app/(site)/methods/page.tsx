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
          <ul className="space-y-3 bullet-list">
            <li className="text-base text-gray-900">
              <strong>572 peer-reviewed publications</strong> from NASA spaceflight studies aggregated from OSDR, PSI,
              GeneLab, and PubMed Central
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
            <li className="text-base text-gray-900">
              Full-text XML articles parsed from NASA repositories and open science databases
            </li>
            <li className="text-base text-gray-900">
              Metadata extraction includes authors, publication dates, funding sources, and experimental conditions
            </li>
          </ul>
        </div>
      </section>

      {/* EVIDENCE PROCESSING PIPELINE */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">EVIDENCE PROCESSING PIPELINE</h2>
        <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
          <ul className="space-y-3 bullet-list">
            <li className="text-base text-gray-900">
              <strong>Section-level parsing</strong> using IMRaD structure (Introduction, Methods, Results, Discussion)
            </li>
            <li className="text-base text-gray-900">
              <strong>2,165 evidence spans</strong> extracted and tagged: Abstract (702), Results (386), Methods (385),
              Discussion (276), Introduction (218), Conclusion (198)
            </li>
            <li className="text-base text-gray-900">
              <strong>Section-aware retrieval</strong> where Results sections are prioritized for factual claims
            </li>
            <li className="text-base text-gray-900">
              Semantic embeddings generated for each evidence span to enable similarity search
            </li>
            <li className="text-base text-gray-900">
              Entity extraction identifies biological systems, experimental conditions, and measured outcomes
            </li>
            <li className="text-base text-gray-900">
              Automated classification of evidence type (observational, experimental, review, meta-analysis)
            </li>
          </ul>
        </div>
      </section>

      {/* KNOWLEDGE GRAPH CONSTRUCTION */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">KNOWLEDGE GRAPH CONSTRUCTION</h2>
        <div className="bg-gray-50 rounded-xl p-8">
          <ul className="space-y-3 bullet-list">
            <li className="text-base text-gray-900">
              <strong>28,864 evidence relations</strong> (supports/contradicts) extracted using natural language
              processing
            </li>
            <li className="text-base text-gray-900">
              <strong>Graph structure</strong> maps agreement and disagreement across studies
            </li>
            <li className="text-base text-gray-900">
              Node types include publications, biological systems, experimental conditions, and findings
            </li>
            <li className="text-base text-gray-900">
              Edge types capture relationships: supports, contradicts, extends, replicates, reviews
            </li>
            <li className="text-base text-gray-900">
              Citation network analysis identifies influential studies and research clusters
            </li>
            <li className="text-base text-gray-900">Temporal tracking shows how consensus evolves over time</li>
          </ul>
        </div>
      </section>

      {/* AUTOMATED GAP IDENTIFICATION */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">AUTOMATED GAP IDENTIFICATION</h2>
        <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
          <ul className="space-y-3 bullet-list">
            <li className="text-base text-gray-900">
              <strong>Coverage analysis</strong> identifies under-studied biological systems and experimental conditions
            </li>
            <li className="text-base text-gray-900">
              <strong>Contradiction detection</strong> flags conflicting findings that require resolution
            </li>
            <li className="text-base text-gray-900">
              <strong>Mission-critical gaps</strong> prioritized based on relevance to lunar, Mars, and ISS operations
            </li>
            <li className="text-base text-gray-900">
              Statistical power analysis identifies areas where more replication is needed
            </li>
            <li className="text-base text-gray-900">Temporal gap analysis shows where recent research is lacking</li>
            <li className="text-base text-gray-900">
              Cross-system gap detection identifies biological interactions that remain unexplored
            </li>
          </ul>
        </div>
      </section>

      {/* QUALITY ASSURANCE & VALIDATION */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">QUALITY ASSURANCE & VALIDATION</h2>
        <div className="bg-gray-50 rounded-xl p-8">
          <ul className="space-y-3 bullet-list">
            <li className="text-base text-gray-900">
              <strong>Automated section classification</strong> with manual validation for edge cases
            </li>
            <li className="text-base text-gray-900">
              <strong>Citation tracking</strong> across the corpus to identify consensus and outliers
            </li>
            <li className="text-base text-gray-900">
              <strong>Contradiction detection</strong> flags conflicting findings for expert review
            </li>
            <li className="text-base text-gray-900">
              Source reliability scoring based on journal impact factor, citation count, and peer review status
            </li>
            <li className="text-base text-gray-900">
              Confidence scores assigned to each finding based on evidence strength and replication
            </li>
            <li className="text-base text-gray-900">
              Regular audits of extraction accuracy and relation classification performance
            </li>
          </ul>
        </div>
      </section>

      {/* MISSION APPLICATIONS */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">MISSION APPLICATIONS</h2>
        <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
          <ul className="space-y-3 bullet-list">
            <li className="text-base text-gray-900">
              <strong>Mission-specific filtering</strong> enables targeted evidence retrieval for lunar, Mars, and ISS
              scenarios
            </li>
            <li className="text-base text-gray-900">
              <strong>Risk assessment support</strong> by identifying known hazards and mitigation strategies
            </li>
            <li className="text-base text-gray-900">
              <strong>Countermeasure evaluation</strong> through evidence synthesis across multiple studies
            </li>
            <li className="text-base text-gray-900">
              Timeline-aware recommendations based on mission phase (pre-flight, in-flight, post-flight)
            </li>
            <li className="text-base text-gray-900">
              Integration with NASA mission planning tools and decision support systems
            </li>
            <li className="text-base text-gray-900">
              Automated briefing generation for mission planners and flight surgeons
            </li>
          </ul>
        </div>
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
