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
              572 peer-reviewed publications from NASA spaceflight studies aggregated from OSDR, PSI, GeneLab, and
              PubMed Central
            </li>
            <li className="font-normal">
              245 OSDR dataset cross-references linking publications to raw experimental data
            </li>
            <li className="font-normal">156 GeneLab datasets with genomic and transcriptomic profiles</li>
            <li className="font-normal">87 Task Book entries tracking ongoing research projects</li>
            <li className="font-normal">
              Full-text XML articles parsed from NASA repositories and open science databases
            </li>
            <li className="font-normal">
              Metadata extraction includes authors, publication dates, funding sources, and experimental conditions
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
              2,165 evidence spans extracted and tagged: Abstract (702), Results (386), Methods (385), Discussion (276),
              Introduction (218), Conclusion (198)
            </li>
            <li className="font-normal">
              Section-aware retrieval where Results sections are prioritized for factual claims
            </li>
            <li className="font-normal">
              Semantic embeddings generated for each evidence span to enable similarity search
            </li>
            <li className="font-normal">
              Entity extraction identifies biological systems, experimental conditions, and measured outcomes
            </li>
            <li className="font-normal">
              Automated classification of evidence type (observational, experimental, review, meta-analysis)
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
              28,864 evidence relations (supports/contradicts) extracted using natural language processing
            </li>
            <li className="font-normal">Graph structure maps agreement and disagreement across studies</li>
            <li className="font-normal">
              Node types include publications, biological systems, experimental conditions, and findings
            </li>
            <li className="font-normal">
              Edge types capture relationships: supports, contradicts, extends, replicates, reviews
            </li>
            <li className="font-normal">
              Citation network analysis identifies influential studies and research clusters
            </li>
            <li className="font-normal">Temporal tracking shows how consensus evolves over time</li>
          </ul>
        </div>
      </section>

      {/* AUTOMATED GAP IDENTIFICATION */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">AUTOMATED GAP IDENTIFICATION</h2>
        <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
          <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-relaxed">
            <li className="font-normal">
              Coverage analysis identifies under-studied biological systems and experimental conditions
            </li>
            <li className="font-normal">Contradiction detection flags conflicting findings that require resolution</li>
            <li className="font-normal">
              Mission-critical gaps prioritized based on relevance to lunar, Mars, and ISS operations
            </li>
            <li className="font-normal">
              Statistical power analysis identifies areas where more replication is needed
            </li>
            <li className="font-normal">Temporal gap analysis shows where recent research is lacking</li>
            <li className="font-normal">
              Cross-system gap detection identifies biological interactions that remain unexplored
            </li>
          </ul>
        </div>
      </section>

      {/* QUALITY ASSURANCE & VALIDATION */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">QUALITY ASSURANCE & VALIDATION</h2>
        <div className="bg-gray-50 rounded-xl p-8">
          <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-relaxed">
            <li className="font-normal">Automated section classification with manual validation for edge cases</li>
            <li className="font-normal">Citation tracking across the corpus to identify consensus and outliers</li>
            <li className="font-normal">Contradiction detection flags conflicting findings for expert review</li>
            <li className="font-normal">
              Source reliability scoring based on journal impact factor, citation count, and peer review status
            </li>
            <li className="font-normal">
              Confidence scores assigned to each finding based on evidence strength and replication
            </li>
            <li className="font-normal">
              Regular audits of extraction accuracy and relation classification performance
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
              Mission-specific filtering enables targeted evidence retrieval for lunar, Mars, and ISS scenarios
            </li>
            <li className="font-normal">
              Risk assessment support by identifying known hazards and mitigation strategies
            </li>
            <li className="font-normal">
              Countermeasure evaluation through evidence synthesis across multiple studies
            </li>
            <li className="font-normal">
              Timeline-aware recommendations based on mission phase (pre-flight, in-flight, post-flight)
            </li>
            <li className="font-normal">Integration with NASA mission planning tools and decision support systems</li>
            <li className="font-normal">Automated briefing generation for mission planners and flight surgeons</li>
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
