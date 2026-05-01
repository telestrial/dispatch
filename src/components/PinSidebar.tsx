import { HardDrive } from 'lucide-react'
import { usePinStore } from '../stores/pin'

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`
}

export function PinSidebar() {
  const account = usePinStore((s) => s.account)
  const pinnedCount = usePinStore((s) => s.pinned.length)

  const pct =
    account && account.maxPinnedData > 0
      ? Math.min(100, (account.pinnedData / account.maxPinnedData) * 100)
      : 0

  return (
    <aside className="w-full xl:w-64 shrink-0 border border-neutral-200 rounded-lg bg-white p-3 space-y-4">
      <section className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <HardDrive
            className="size-3.5 text-neutral-500"
            aria-hidden="true"
          />
          <h2 className="text-xs font-semibold tracking-wide uppercase text-neutral-500">
            Your storage
          </h2>
        </div>
        <div className="px-1 space-y-2">
          <div
            className="h-1.5 rounded-full bg-neutral-100 overflow-hidden"
            title={
              account
                ? `${formatBytes(account.pinnedSize)} encoded on the network`
                : undefined
            }
          >
            <div
              className="h-full bg-green-600 transition-[width] duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          {account ? (
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-neutral-900 font-medium">
                {formatBytes(account.pinnedData)}
              </span>
              <span className="text-neutral-500">
                of {formatBytes(account.maxPinnedData)}
              </span>
            </div>
          ) : (
            <p className="text-xs text-neutral-500">Loading…</p>
          )}
          <p className="text-xs text-neutral-500">
            {pinnedCount === 0
              ? 'Nothing pinned yet'
              : `${pinnedCount} pinned`}
          </p>
        </div>
      </section>
    </aside>
  )
}
