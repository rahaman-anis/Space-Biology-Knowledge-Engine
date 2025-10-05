import { PageLayout } from "@/components/layout/PageLayout"
import { AriaSearch } from "@/components/aria/AriaSearch"
import ChatThread from "@/components/chat/ChatThread"

export default function AriaPage() {
  return (
    <PageLayout
      title="Ask ARIA"
      subtitle="Section-aware Q&A with evidence citations and contradiction detection"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Ask ARIA" }]}
    >
      <AriaSearch />

      {/* Chat Thread */}
      <div className="mt-12">
        <ChatThread />
      </div>
    </PageLayout>
  )
}
