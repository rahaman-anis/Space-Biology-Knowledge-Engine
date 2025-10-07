import HeroSection from "@/components/home/HeroSection"
import TargetAudience from "@/components/home/TargetAudience"
import SearchSection from "@/components/home/SearchSection"
import ExploreTools from "@/components/home/ExploreTools"
import CredibilitySection from "@/components/home/CredibilitySection"
import UserJourney from "@/components/home/UserJourney"
import GapHeatmap from "@/components/home/GapHeatmap"
import DataCoverage from "@/components/home/DataCoverage"
import CrossSpeciesPanel from "@/components/home/CrossSpeciesPanel"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <TargetAudience />
      <SearchSection />
      <ExploreTools />
      <CredibilitySection />
      <UserJourney />
      <GapHeatmap />
      <DataCoverage />
      <CrossSpeciesPanel />
    </div>
  )
}
