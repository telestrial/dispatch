export const CHANNEL_METADATA_VERSION = 1
export const SUBSCRIPTIONS_VERSION = 1

export type ItemType = 'text' | 'image' | 'audio' | 'video'

export type ItemRef = {
  id: string
  itemURL: string
  type: ItemType
  title: string
  summary?: string
  publishedAt: string
  mimeType: string
  byteSize: number
  durationMs?: number
}

export type ChannelMetadata = {
  version: typeof CHANNEL_METADATA_VERSION
  name: string
  description: string
  authorPubkey: string
  createdAt: string
  coverArtItemURL?: string
  language?: string
  items: ItemRef[]
}

export type SubscriptionRef = {
  channelURL: string
  addedAt: string
  label?: string
}

export type Subscriptions = {
  version: typeof SUBSCRIPTIONS_VERSION
  subscribed: SubscriptionRef[]
}
