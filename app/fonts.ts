import { Fira_Sans, Overpass } from "next/font/google"

/**
 * NASA LifeLens Brand Fonts
 *
 * Heading: Fira Sans (weights: 700, 900)
 * Body: Overpass (weights: 400, 600, 700)
 */

export const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-fira-sans",
  display: "swap",
})

export const overpass = Overpass({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-overpass",
  display: "swap",
})
