import HeroSection from "@/components/home/HeroSection"
import SearchSection from "@/components/home/SearchSection"
import ExploreTools from "@/components/home/ExploreTools"
import CredibilitySection from "@/components/home/CredibilitySection"
import GapHeatmap from "@/components/home/GapHeatmap"
import DataCoverage from "@/components/home/DataCoverage"
import CrossSpeciesPanel from "@/components/home/CrossSpeciesPanel"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Reordered sections according to spec:
          1. HERO (streamlined with 3 stats)
          2. ASK ARIA (moved to position #2, prominent bg-sky-50)
          3. MORE WAYS TO EXPLORE (3 compact cards)
          4. BEYOND TRADITIONAL SEARCH (simplified text block)
          5. KNOWLEDGE GAP MATRIX (moved up)
          6. Removed TargetAudience (Built for Mission Success) section
      */}
      <HeroSection />
      <SearchSection />
      <ExploreTools />
      <CredibilitySection />
      <GapHeatmap />
      <DataCoverage />
      <CrossSpeciesPanel />
    </div>
  )
}
