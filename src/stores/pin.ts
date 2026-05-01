import type { Sdk } from '@siafoundation/sia-storage'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  type AccountSnapshot,
  fetchAccountSnapshot,
  pinItemBytes,
  unpinItemBytes,
} from '../core/pin'
import type { ItemType } from '../core/types'
import { APP_KEY } from '../lib/constants'

export type PinnedItemRef = {
  itemURL: string
  objectID: string
  channelID: string
  channelHandle: string
  channelName: string
  type: ItemType
  title: string
  mimeType: string
  byteSize: number
  pinnedAt: string
}

export type PinInput = Omit<PinnedItemRef, 'objectID' | 'pinnedAt'>

type PinState = {
  pinned: PinnedItemRef[]
  account: AccountSnapshot | null
  pinning: Set<string>
  pin: (sdk: Sdk, input: PinInput) => Promise<void>
  unpin: (sdk: Sdk, itemURL: string) => Promise<void>
  refreshAccount: (sdk: Sdk) => Promise<void>
  isPinned: (itemURL: string) => boolean
  isPinning: (itemURL: string) => boolean
  reset: () => void
}

export const usePinStore = create<PinState>()(
  persist(
    (set, get) => ({
      pinned: [],
      account: null,
      pinning: new Set<string>(),
      pin: async (sdk, input) => {
        if (get().pinned.some((p) => p.itemURL === input.itemURL)) return
        const pinning = new Set(get().pinning)
        pinning.add(input.itemURL)
        set({ pinning })
        try {
          const { objectID } = await pinItemBytes(sdk, input.itemURL)
          const ref: PinnedItemRef = {
            ...input,
            objectID,
            pinnedAt: new Date().toISOString(),
          }
          const next = new Set(get().pinning)
          next.delete(input.itemURL)
          set((s) => ({ pinned: [...s.pinned, ref], pinning: next }))
          fetchAccountSnapshot(sdk)
            .then((account) => set({ account }))
            .catch(() => {})
        } catch (e) {
          const next = new Set(get().pinning)
          next.delete(input.itemURL)
          set({ pinning: next })
          throw e
        }
      },
      unpin: async (sdk, itemURL) => {
        const ref = get().pinned.find((p) => p.itemURL === itemURL)
        if (!ref) return
        const pinning = new Set(get().pinning)
        pinning.add(itemURL)
        set({ pinning })
        try {
          await unpinItemBytes(sdk, ref.objectID)
          const next = new Set(get().pinning)
          next.delete(itemURL)
          set((s) => ({
            pinned: s.pinned.filter((p) => p.itemURL !== itemURL),
            pinning: next,
          }))
          fetchAccountSnapshot(sdk)
            .then((account) => set({ account }))
            .catch(() => {})
        } catch (e) {
          const next = new Set(get().pinning)
          next.delete(itemURL)
          set({ pinning: next })
          throw e
        }
      },
      refreshAccount: async (sdk) => {
        try {
          const account = await fetchAccountSnapshot(sdk)
          set({ account })
        } catch {
          // best-effort
        }
      },
      isPinned: (itemURL) => get().pinned.some((p) => p.itemURL === itemURL),
      isPinning: (itemURL) => get().pinning.has(itemURL),
      reset: () =>
        set({ pinned: [], account: null, pinning: new Set<string>() }),
    }),
    {
      name: `sia-pins-${APP_KEY.slice(0, 16)}`,
      partialize: (state) => ({ pinned: state.pinned }),
    },
  ),
)
