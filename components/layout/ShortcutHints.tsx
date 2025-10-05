export default function ShortcutHints() {
  return (
    <div className="text-xs text-gray-700 flex items-center gap-4">
      <span>
        <kbd className="px-1 py-0.5 rounded border">/</kbd> Focus search
      </span>
      <span>
        <kbd className="px-1 py-0.5 rounded border">Esc</kbd> Close
      </span>
    </div>
  )
}
