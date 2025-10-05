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
  title: "Space Biology Knowledge Engine",
  description: "Evidence-driven decision support for Moon/Mars missions",
    generator: 'v0.app'
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
      <body className="antialiased">{children}</body>
    </html>
  )
}
