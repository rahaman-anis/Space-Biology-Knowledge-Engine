export default function ExampleQuery() {
  const q = "What evidence exists for bone loss countermeasures?"
  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 to-nasa-electric-blue">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-heading font-bold text-white mb-6">Try an Example</h2>

        <p className="text-2xl text-white/90 mb-4">{q}</p>

        <p className="text-xl text-white/80 mb-8">
          See how ARIA provides section-aware answers with citations, confidence levels and gap identification.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <a href={`/aria?q=${encodeURIComponent(q)}`}>
            <button className="px-8 py-4 bg-white text-primary-600 font-bold text-xl rounded-xl hover:bg-gray-100 transition-colors">
              Run this query →
            </button>
          </a>
          <a href="/aria">
            <button className="px-8 py-4 bg-white/20 backdrop-blur border-2 border-white text-white font-bold text-xl rounded-xl hover:bg-white/30 transition-colors">
              Ask your own question
            </button>
          </a>
        </div>
      </div>
    </section>
  )
}
