"use client"

interface Props {
  value: number // 0..1
  label?: string
}

export function ProgressBar({ value, label = "Relevance" }: Props) {
  const percentage = Math.round(value * 100)
  const barWidth = `${percentage}%`

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}:</span>
        <span className="font-bold text-primary">{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: barWidth }} />
      </div>
    </div>
  )
}
