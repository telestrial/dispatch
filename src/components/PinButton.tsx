import { useToastStore } from '../stores/toast'
import { type PinInput, usePinStore } from '../stores/pin'
import { useAuthStore } from '../stores/auth'

export function PinButton({ input }: { input: PinInput }) {
  const sdk = useAuthStore((s) => s.sdk)
  const isPinned = usePinStore((s) => s.isPinned(input.itemURL))
  const isPinning = usePinStore((s) => s.isPinning(input.itemURL))
  const pin = usePinStore((s) => s.pin)
  const unpin = usePinStore((s) => s.unpin)
  const addToast = useToastStore((s) => s.addToast)

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!sdk || isPinning) return
    try {
      if (isPinned) {
        await unpin(sdk, input.itemURL)
        addToast('Unpinned')
      } else {
        await pin(sdk, input)
        addToast('Pinned to your storage')
      }
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Pin failed')
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPinning || !sdk}
      title={isPinned ? 'Unpin from your storage' : 'Pin to your storage'}
      aria-pressed={isPinned}
      className={`p-1 transition-colors disabled:opacity-50 ${
        isPinned
          ? 'text-green-600 hover:text-green-700'
          : 'text-neutral-400 hover:text-neutral-700'
      }`}
    >
      {isPinning ? (
        <span className="block w-3.5 h-3.5">
          <span className="block size-3.5 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
        </span>
      ) : (
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill={isPinned ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 17v5" />
          <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
        </svg>
      )}
    </button>
  )
}

