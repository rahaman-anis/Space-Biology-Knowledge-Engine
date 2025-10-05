export default function ChatMessageUser({ text, time }: { text: string; time?: string }) {
  return (
    <article aria-label="User message" className="max-w-[820px]">
      <div className="bg-white border-l-4 border-primary-600 rounded-lg shadow-sm p-4">
        <p className="text-sm text-gray-900">{text}</p>
      </div>
      {time && <p className="mt-1 text-xs text-gray-600">{time}</p>}
    </article>
  )
}
