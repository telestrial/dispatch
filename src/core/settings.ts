import { PinnedObject, type Sdk } from '@siafoundation/sia-storage'
import type { OwnedChannel } from '../stores/auth'
import type { SubscriptionRef } from './types'

export const SETTINGS_VERSION = 1
export const SETTINGS_METADATA_KIND = 'pin:settings'

export type DispatchSettings = {
  version: typeof SETTINGS_VERSION
  myChannels: OwnedChannel[]
  subscriptions: SubscriptionRef[]
  updatedAt: string
}

type SettingsMetadata = {
  kind: typeof SETTINGS_METADATA_KIND
  version: typeof SETTINGS_VERSION
  updatedAt: string
}

export type LoadedSettings = {
  settings: DispatchSettings
  objectID: string
}

const PAGE_LIMIT = 200

// Walks the indexer's object events looking for the most-recently-updated
// object whose metadata is tagged as our settings record. Returns the parsed
// settings + that object's ID (so future saves can delete the prior one).
// Returns null if no settings object exists in this account's scope.
export async function loadSettings(sdk: Sdk): Promise<LoadedSettings | null> {
  let cursor: unknown
  // Hard cap: ~5 pages of events. For accounts with very large object
  // histories we'd want richer pagination, but settings is typically near
  // the top by recency since it's rewritten on every channel/sub change.
  for (let page = 0; page < 5; page++) {
    // biome-ignore lint/suspicious/noExplicitAny: SDK cursor type isn't exported
    const events = await sdk.objectEvents(cursor as any, PAGE_LIMIT)
    if (events.length === 0) return null

    // Iterate newest-to-oldest within the page. Stop at the first match.
    for (const ev of events) {
      if (ev.deleted || !ev.object) continue
      const metaBytes = ev.object.metadata()
      if (metaBytes.length === 0) continue
      let meta: SettingsMetadata
      try {
        meta = JSON.parse(new TextDecoder().decode(metaBytes))
      } catch {
        continue
      }
      if (meta.kind !== SETTINGS_METADATA_KIND) continue

      const handle = await sdk.object(ev.id)
      const stream = sdk.download(handle)
      const blob = await new Response(stream).blob()
      const text = await blob.text()
      const settings = JSON.parse(text) as DispatchSettings
      if (settings.version !== SETTINGS_VERSION) continue
      return { settings, objectID: ev.id }
    }

    if (events.length < PAGE_LIMIT) return null
    // biome-ignore lint/suspicious/noExplicitAny: events carry an opaque cursor
    cursor = (events[events.length - 1] as any).cursor ?? undefined
    if (!cursor) return null
  }
  return null
}

// Uploads a fresh settings object, tags its metadata, pins it, and (best-effort)
// deletes the prior one. Returns the new object ID for the caller to track.
export async function saveSettings(
  sdk: Sdk,
  settings: DispatchSettings,
  previousObjectID: string | null,
): Promise<string> {
  const json = JSON.stringify(settings)
  const bytes = new TextEncoder().encode(json)
  const obj = await sdk.upload(
    new PinnedObject(),
    new Blob([bytes as BlobPart]).stream(),
  )
  const meta: SettingsMetadata = {
    kind: SETTINGS_METADATA_KIND,
    version: SETTINGS_VERSION,
    updatedAt: settings.updatedAt,
  }
  obj.updateMetadata(new TextEncoder().encode(JSON.stringify(meta)))
  await sdk.pinObject(obj)
  await sdk.updateObjectMetadata(obj)
  const newID = obj.id()

  if (previousObjectID && previousObjectID !== newID) {
    sdk.deleteObject(previousObjectID).catch((e) => {
      console.warn('Failed to delete previous settings object:', e)
    })
  }
  return newID
}
