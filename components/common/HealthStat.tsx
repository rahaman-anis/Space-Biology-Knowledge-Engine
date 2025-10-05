export default function HealthStat({
  label,
  value,
}: {
  label: string
  value?: string | number | boolean | null
}) {
  const v = value === true ? "OK" : value === false ? "FAIL" : (value ?? "—")
  const cls = value === true ? "text-success-600" : value === false ? "text-danger-600" : "text-gray-900"

  return (
    <div className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2">
      <span className="text-body text-gray-700">{label}</span>
      <span className={`text-body font-semibold ${cls}`}>{String(v)}</span>
    </div>
  )
}
