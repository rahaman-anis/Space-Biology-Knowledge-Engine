import type { AssistantPayload } from "@/types/chat"
import type { EvidenceRow } from "@/components/table/EvidenceTable"

export const demoAssistant: AssistantPayload = {
  summary:
    "Significant evidence shows bone density loss in microgravity, particularly in weight-bearing bones on long-duration missions.",
  confidence: "High",
  consensus: "Strong",
  coverageCount: 23,
  confidenceInterval: [0.73, 0.89],
  freshnessText: "3 days ago",
  evidence: [
    {
      id: "e1",
      section: "Results",
      text: "Bone mineral density decreased ~1.5%/month in astronauts on ISS missions > 6 months.",
      year: 2024,
      citations: [
        { ntrsId: "20240156", title: "Bone Density Changes in Microgravity", year: 2024, section: "Results" },
      ],
    },
    {
      id: "e2",
      section: "Discussion",
      text: "Recovery may take 2–3× mission duration post-flight with standard countermeasures.",
      year: 2023,
      citations: [
        { pmcid: "PMC9876543", title: "Long-duration ISS Recovery Profiles", year: 2023, section: "Discussion" },
      ],
    },
    {
      id: "e3",
      section: "Methods",
      text: "DXA and QCT were the primary measurement modalities across studies.",
      year: 2022,
      method: "in-vivo",
      citations: [{ pmcid: "PMC1234567", title: "Modalities and Protocols", year: 2022, section: "Methods" }],
    },
  ],
  sources: [
    { ntrsId: "20240156", title: "Bone Density Changes in Microgravity", year: 2024, section: "Results" },
    { pmcid: "PMC9876543", title: "Long-duration ISS Recovery Profiles", year: 2023, section: "Discussion" },
  ],
  gapsCount: 3,
}

export const demoSources: EvidenceRow[] = [
  {
    id: "s1",
    sourceId: "NTRS-20240156",
    section: "Results",
    confidence: "High",
    date: "2024-03-15",
    title: "Bone Density Changes in Microgravity",
  },
  {
    id: "s2",
    sourceId: "PMC9876543",
    section: "Discussion",
    confidence: "Medium",
    date: "2023-11-22",
    title: "Long-duration ISS Recovery Profiles",
  },
]
