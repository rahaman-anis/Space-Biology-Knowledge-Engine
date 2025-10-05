import { dsSubgraph } from "@/lib/datasources"
import { GraphCanvasClient } from "./GraphCanvasClient"

export const revalidate = 60

export default async function SubgraphPage({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id)
  const data = await dsSubgraph(id)
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-heading text-3xl text-white mb-4">Knowledge Subgraph</h1>
      <div className="bg-white rounded-xl shadow p-4">
        <GraphCanvasClient data={data} />
      </div>
    </section>
  )
}
