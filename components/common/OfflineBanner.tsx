"use client"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"

export default function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-warning-600 text-white text-caption px-3 py-2 text-center"
    >
      You're offline. Results shown may be cached; some actions are disabled.
    </div>
  )
}
