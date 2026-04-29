import { useState } from 'react'
import { useAuthStore } from '../stores/auth'
import { CopyButton } from './CopyButton'
import { CreateChannel } from './CreateChannel'
import { SubscribeToChannel } from './SubscribeToChannel'

type View =
  | { kind: 'idle' }
  | { kind: 'creating' }
  | { kind: 'created'; channelUrl: string; name: string }
  | { kind: 'subscribing' }

export function Home() {
  const [view, setView] = useState<View>({ kind: 'idle' })
  const subscriptions = useAuthStore((s) => s.subscriptions)

  if (view.kind === 'creating') {
    return (
      <CreateChannel
        onCancel={() => setView({ kind: 'idle' })}
        onCreated={(channelUrl, name) =>
          setView({ kind: 'created', channelUrl, name })
        }
      />
    )
  }

  if (view.kind === 'created') {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-neutral-900">
              Channel created
            </h1>
            <p className="text-neutral-500 text-sm">
              Share this URL so others can subscribe to{' '}
              <span className="text-neutral-900">{view.name}</span>.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-left">
            <code className="flex-1 text-[11px] font-mono text-neutral-700 wrap-break-word">
              {view.channelUrl}
            </code>
            <CopyButton value={view.channelUrl} label="Channel URL copied" />
          </div>
          <button
            type="button"
            onClick={() => setView({ kind: 'idle' })}
            className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-sm font-medium rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  if (view.kind === 'subscribing') {
    return (
      <SubscribeToChannel
        onCancel={() => setView({ kind: 'idle' })}
        onSubscribed={() => setView({ kind: 'idle' })}
      />
    )
  }

  const ctas = (
    <div className="flex flex-col sm:flex-row gap-2 sm:justify-center">
      <button
        type="button"
        onClick={() => setView({ kind: 'subscribing' })}
        className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        Subscribe to a channel
      </button>
      <button
        type="button"
        onClick={() => setView({ kind: 'creating' })}
        className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-sm font-medium rounded-lg transition-colors"
      >
        Create a channel
      </button>
    </div>
  )

  if (subscriptions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-neutral-900">
              Your feed is empty
            </h1>
            <p className="text-neutral-600 text-sm">
              Subscribe to a channel, or create one of your own.
            </p>
          </div>
          {ctas}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Following {subscriptions.length} channel
            {subscriptions.length === 1 ? '' : 's'}
          </h2>
          <ul className="divide-y divide-neutral-200/80">
            {subscriptions.map((sub) => (
              <li
                key={sub.channelUrl}
                className="py-2 text-sm text-neutral-900"
              >
                {sub.label || sub.channelUrl}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-neutral-500 text-sm">
          No items yet from your subscriptions.
        </p>

        {ctas}
      </div>
    </div>
  )
}
