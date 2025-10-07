export default function UserJourney() {
  return (
    <section className="py-12 md:py-16 bg-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-8 text-center">
          New to LifeLens? Start Here:
        </h2>

        <div className="space-y-4">
          <div className="flex items-start gap-4 bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <p className="text-gray-900 font-medium">Try ARIA above with example query</p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <p className="text-gray-900 font-medium">Browse Topics to explore biological systems</p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <p className="text-gray-900 font-medium">Check Gaps to see mission unknowns</p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <p className="text-gray-900 font-medium">Map Evidence to visualize study connections</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
