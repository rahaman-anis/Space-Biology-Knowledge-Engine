import HeroSection from "@/components/home/HeroSection"
import SearchSection from "@/components/home/SearchSection"
import MissionScenarios from "@/components/home/MissionScenarios"
import GapHeatmap from "@/components/home/GapHeatmap"
import DataCoverage from "@/components/home/DataCoverage"
import ExampleQuery from "@/components/home/ExampleQuery"
import CrossSpeciesPanel from "@/components/home/CrossSpeciesPanel"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <SearchSection />
      <MissionScenarios />
      <GapHeatmap />
      <DataCoverage />
      <ExampleQuery />
      <CrossSpeciesPanel />
    </div>
  )
}
