import type React from "react"
import type { Metadata } from "next"
import { Fira_Sans, Overpass } from "next/font/google"
import "./globals.css"

const firaSans = Fira_Sans({
  weight: ["400", "600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-fira-sans",
})

const overpass = Overpass({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-overpass",
})

export const metadata: Metadata = {
  title: "LifeLens: Space Biology Evidence Synthesis Engine",
  description:
    "AI-powered search across 572 space biology papers. Get evidence-backed answers, identify research gaps, and visualize study relations for mission planning.",
  generator: "v0.app",
  metadataBase: new URL("https://www.spacebioengine.study"),
  openGraph: {
    title: "LifeLens: Space Biology Knowledge Engine",
    description: "AI-powered evidence synthesis across 572 NASA space biology papers for mission planning",
    url: "https://www.spacebioengine.study",
    type: "website",
    images: ["/og-image.jpg"],
  },
  icons: { icon: "/favicon.ico" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
    : undefined

  return (
    <html lang="en" className={`${firaSans.variable} ${overpass.variable}`}>
      <head>
        {supabaseHost && <link rel="preconnect" href={`https://${supabaseHost}`} crossOrigin="" />}
        <link rel="preconnect" href="https://api.groq.com" crossOrigin="" />
      </head>
      <body className="antialiased overflow-x-hidden max-w-full">{children}</body>
    </html>
  )
}
