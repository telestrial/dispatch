import { useState } from 'react'
import { publishItem } from '../core/channels'
import { type OwnedChannel, useAuthStore } from '../stores/auth'

export function ComposeNote({
  channel,
  onPublished,
}: {
  channel: OwnedChannel
  onPublished: (itemURL: string, title: string) => void
}) {
  const sdk = useAuthStore((s) => s.sdk)
  const agent = useAuthStore((s) => s.atprotoAgent)

  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sdk) return
    if (!agent || !agent.session) {
      setError('Bluesky session not active. Cancel and try again to sign in.')
      return
    }
    const trimmedBody = body.trim()
    if (!trimmedBody) return
    setSubmitting(true)
    setError(null)
    try {
      const result = await publishItem(
        sdk,
        agent,
        { channelID: channel.channelID, channelKey: channel.channelKey },
        {
          type: 'text',
          title: '',
          summary: trimmedBody,
          mimeType: 'text/markdown',
          bytes: new TextEncoder().encode(trimmedBody),
        },
      )
      onPublished(result.itemRef.itemURL, result.itemRef.title)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to publish')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-neutral-500 text-sm">
        A short note. Renders inline in the feed. Markdown is supported.
      </p>

      <label className="block space-y-1">
        <span className="text-xs font-medium text-neutral-700 uppercase tracking-wider">
          Body
        </span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={submitting}
          required
          rows={5}
          placeholder="Whatever's on your mind."
          className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-green-600 disabled:bg-neutral-50 disabled:text-neutral-500 font-mono"
        />
      </label>

      {error && <p className="text-red-600 text-sm wrap-break-word">{error}</p>}

      {submitting && (
        <p className="text-neutral-500 text-xs">
          Uploading item to Sia. ~20 seconds — every object pays a full slab of
          erasure-coded redundancy.
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !body.trim()}
        className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-neutral-200 disabled:text-neutral-400 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {submitting ? 'Publishing…' : 'Publish'}
      </button>
    </form>
  )
}
