"use client"

interface Props {
  variant: "ask" | "search"
  title: string
  subtitle: string
  body: string
  features?: string[]
}

export function ExplanationBox({ variant, title, subtitle, body, features }: Props) {
  const gradientClass = variant === "ask" ? "aria-explanation-ask" : "aria-explanation-search"

  return (
    <div className={`${gradientClass} rounded-xl p-6 space-y-3`} data-testid="aria-explanation">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        <p className="text-lg font-medium text-gray-800 mt-1">{subtitle}</p>
      </div>
      <p className="text-base text-gray-900 leading-relaxed">{body}</p>
      {features && features.length > 0 && (
        <ul className="space-y-1.5 text-sm text-gray-900">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-green-600 font-bold flex-shrink-0">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
