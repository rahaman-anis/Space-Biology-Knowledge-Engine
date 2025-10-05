# Design Tokens

## Colour
- Primary: `primary-600` (#0042A6), hover `primary-700` (#07173F)
- Accent: `nasa-neon-yellow` (#EAFE07), errors `rocket-red` (#E43700)
- Neutrals: grey 50/200/700/900
- **Contrast:** AA (≥ 4.5:1), large text ≥ 3:1

## Typography
- Headings: Fira Sans 700/900
- Body: Overpass 400/600/700
- Sizes: h1 20/28, h2 16/24, h3 14/20, body 14/20, caption 12/16
- Monospace helper: `.mono` for IDs (PMCID/NTRS/OSDR)

## Spacing
- 4px scale: 4, 8, 12, 16, 24, 32, 48, 64

## Components (canonical)
- `Badge`, `Chip`, `Button`, `Card`, `Skeleton`, `MethodsPopover`
- Evidence Table: compact/comfortable densities; sticky header; sort affordances
- Chat: structured answer (summary → evidence → metadata → provenance)

## Accessibility
- 2px focus ring `primary-300`
- Focus traps: menus/popovers/dialogs
- Reduced-motion support
