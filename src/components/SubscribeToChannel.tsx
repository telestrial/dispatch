import { useState } from 'react'
import { fetchChannel } from '../core/sia'
import { useAuthStore } from '../stores/auth'

export function SubscribeToChannel({
  onCancel,
  onSubscribed,
}: {
  onCancel: () => void
  onSubscribed: (channelName: string) => void
}) {
  const sdk = useAuthStore((s) => s.sdk)
  const subscriptions = useAuthStore((s) => s.subscriptions)
  const addSubscription = useAuthStore((s) => s.addSubscription)

  const [url, setUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sdk) return
    const trimmed = url.trim()
    if (!trimmed) return
    if (subscriptions.some((s) => s.channelUrl === trimmed)) {
      setError("You're already subscribed to this channel.")
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const channel = await fetchChannel(sdk, trimmed)
      addSubscription({
        channelUrl: trimmed,
        addedAt: new Date().toISOString(),
        label: channel.name,
      })
      onSubscribed(channel.name)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch channel')
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto space-y-5 p-6"
    >
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-neutral-900">
          Subscribe to a channel
        </h1>
        <p className="text-neutral-500 text-sm">
          Paste a channel's share URL. We'll fetch its metadata and add it to
          your feed.
        </p>
      </div>

      <label className="block space-y-1">
        <span className="text-xs font-medium text-neutral-700 uppercase tracking-wider">
          Share URL
        </span>
        <textarea
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={submitting}
          required
          rows={3}
          placeholder="sia://..."
          className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-[11px] font-mono text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-green-600 disabled:bg-neutral-50 disabled:text-neutral-500"
        />
      </label>

      {error && (
        <p className="text-red-600 text-sm wrap-break-word">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || !url.trim()}
          className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-neutral-200 disabled:text-neutral-400 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {submitting ? 'Subscribing…' : 'Subscribe'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
