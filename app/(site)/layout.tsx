import type React from "react"
import SkipLink from "@/components/common/SkipLink"
import GlobalNav from "@/components/layout/GlobalNav"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <GlobalNav />
      <main id="main">{children}</main>
    </>
  )
}
