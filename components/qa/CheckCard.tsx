import type React from "react"
export type QaStatus = "pass" | "fail" | "warn" | "skip"

export default function CheckCard({
  title,
  status,
  note,
  children,
}: {
  title: string
  status: QaStatus
  note?: string
  children?: React.ReactNode
}) {
  const colour =
    status === "pass"
      ? "bg-success-600"
      : status === "fail"
        ? "bg-danger-600"
        : status === "warn"
          ? "bg-warning-600"
          : "bg-gray-400"
  const label = status === "pass" ? "PASS" : status === "fail" ? "FAIL" : status === "warn" ? "WARN" : "SKIP"
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3 mb-2">
        <span
          className={`inline-flex h-6 w-14 items-center justify-center rounded ${colour} text-white text-caption font-semibold`}
        >
          {label}
        </span>
        <h3 className="font-heading text-h3 text-gray-900">{title}</h3>
      </div>
      {note && <p className="text-caption text-gray-700 mb-2">{note}</p>}
      {children}
    </div>
  )
}
