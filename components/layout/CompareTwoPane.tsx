import type { ReactNode } from "react"

export default function CompareTwoPane({
  leftTitle,
  rightTitle,
  left,
  right,
}: {
  leftTitle: string
  rightTitle: string
  left: ReactNode
  right: ReactNode
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section aria-label={leftTitle}>
        <h2 className="font-heading text-xl mb-2 text-gray-900">{leftTitle}</h2>
        {left}
      </section>
      <section aria-label={rightTitle}>
        <h2 className="font-heading text-xl mb-2 text-gray-900">{rightTitle}</h2>
        {right}
      </section>
    </div>
  )
}
