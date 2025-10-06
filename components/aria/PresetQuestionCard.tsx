"use client"

interface Props {
  emoji: string
  question: string
  subtitle: string
  fullQuestion: string
  borderColor: "bone" | "immune" | "muscle"
  onSelect: (question: string) => void
}

export function PresetQuestionCard({ emoji, question, subtitle, fullQuestion, borderColor, onSelect }: Props) {
  const borderClass = `aria-preset-border-${borderColor}`

  return (
    <button
      onClick={() => onSelect(fullQuestion)}
      className={`aria-preset-card-hover ${borderClass} aria-preset-border bg-white rounded-xl p-5 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary`}
      data-testid="aria-preset-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-4xl flex-shrink-0">{emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold text-gray-900 mb-1">{question}</p>
            <p className="text-base text-gray-600">{subtitle}</p>
          </div>
        </div>
        <span className="text-blue-600 font-medium text-sm whitespace-nowrap self-center">Click to ask →</span>
      </div>
    </button>
  )
}
