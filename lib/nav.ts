export type NavItem = {
  label: string
  href: string
  match?: "exact" | "startsWith"
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", match: "exact" },
  { label: "Ask ARIA", href: "/aria", match: "startsWith" },
  { label: "Explore Topics", href: "/evidence", match: "startsWith" },
  { label: "Identify Gaps", href: "/gaps", match: "startsWith" },
  { label: "Map Evidence", href: "/graph", match: "startsWith" },
  { label: "Methods", href: "/methods", match: "startsWith" },
]

export function isActive(pathname: string, item: NavItem): boolean {
  if (item.match === "exact") {
    return pathname === item.href
  }
  // Default to startsWith
  return pathname.startsWith(item.href) && (item.href === "/" ? pathname === "/" : true)
}
