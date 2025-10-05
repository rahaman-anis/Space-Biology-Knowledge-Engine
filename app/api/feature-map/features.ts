export type FeatureFieldMap = {
  feature: string
  route: string
  tables: Array<{
    table: string
    fields: string[]
    required?: string[]
    niceToHave?: string[]
  }>
}

export const FEATURE_MAP: FeatureFieldMap[] = [
  {
    feature: "Ask ARIA (AI chat)",
    route: "/aria",
    tables: [
      {
        table: "passages",
        fields: ["pmcid", "section", "snippet", "score"],
        required: ["pmcid", "snippet"],
      },
    ],
  },
  {
    feature: "Global Search",
    route: "/search",
    tables: [
      { table: "passages", fields: ["pmcid", "section", "snippet", "score"] },
      { table: "docs", fields: ["pmcid", "title", "year"] },
    ],
  },
  {
    feature: "Map Evidence",
    route: "/evidence/[topic]",
    tables: [
      {
        table: "claims",
        fields: ["doc_id", "pmcid", "section", "text", "confidence", "published_date"],
        required: ["pmcid", "section", "text"],
      },
    ],
  },
  {
    feature: "Knowledge Graph",
    route: "/graph",
    tables: [{ table: "mechanisms", fields: ["source_id", "target_id", "relation", "confidence"] }],
  },
  {
    feature: "Identify Gaps",
    route: "/gaps",
    tables: [{ table: "gaps", fields: ["topic", "description", "evidence_count", "last_updated"] }],
  },
]
