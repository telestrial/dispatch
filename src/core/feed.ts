import type { Sdk } from '@siafoundation/sia-storage'
import { fetchChannel } from './sia'
import type { ItemRef, SubscriptionRef } from './types'

export type FeedEntry = {
  item: ItemRef
  channel: { url: string; name: string }
}

export type FeedFetchError = {
  channelURL: string
  label?: string
  error: string
}

export type FeedFetchResult = {
  entries: FeedEntry[]
  errors: FeedFetchError[]
}

export async function buildHomeFeed(
  sdk: Sdk,
  subscriptions: SubscriptionRef[],
): Promise<FeedFetchResult> {
  const settled = await Promise.allSettled(
    subscriptions.map((sub) => fetchChannel(sdk, sub.channelURL)),
  )

  const entries: FeedEntry[] = []
  const errors: FeedFetchError[] = []

  for (let i = 0; i < settled.length; i++) {
    const result = settled[i]
    const sub = subscriptions[i]
    if (result.status === 'fulfilled') {
      const channel = result.value
      for (const item of channel.items) {
        entries.push({
          item,
          channel: { url: sub.channelURL, name: channel.name },
        })
      }
    } else {
      errors.push({
        channelURL: sub.channelURL,
        label: sub.label,
        error:
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason),
      })
    }
  }

  entries.sort((a, b) =>
    a.item.publishedAt < b.item.publishedAt
      ? 1
      : a.item.publishedAt > b.item.publishedAt
        ? -1
        : 0,
  )

  return { entries, errors }
}
