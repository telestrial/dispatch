import type { Sdk } from '@siafoundation/sia-storage'
import { create } from 'zustand'
import {
  buildHomeFeed,
  type FeedEntry,
  type FeedFetchError,
} from '../core/feed'
import type { SubscriptionRef } from '../core/types'

type FeedState = {
  entries: FeedEntry[]
  errors: FeedFetchError[]
  loading: boolean
  lastRefreshedAt: string | null
  refresh: (sdk: Sdk, subscriptions: SubscriptionRef[]) => Promise<void>
  reset: () => void
}

export const useFeedStore = create<FeedState>()((set) => ({
  entries: [],
  errors: [],
  loading: false,
  lastRefreshedAt: null,
  refresh: async (sdk, subscriptions) => {
    set({ loading: true })
    const result = await buildHomeFeed(sdk, subscriptions)
    set({
      entries: result.entries,
      errors: result.errors,
      lastRefreshedAt: new Date().toISOString(),
      loading: false,
    })
  },
  reset: () =>
    set({
      entries: [],
      errors: [],
      loading: false,
      lastRefreshedAt: null,
    }),
}))
