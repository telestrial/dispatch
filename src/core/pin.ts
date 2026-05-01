import type { Sdk } from '@siafoundation/sia-storage'

export type AccountSnapshot = {
  pinnedData: number
  pinnedSize: number
  maxPinnedData: number
  remainingStorage: number
  fetchedAt: string
}

export async function pinItemBytes(
  sdk: Sdk,
  itemURL: string,
): Promise<{ objectID: string }> {
  const handle = await sdk.sharedObject(itemURL)
  await sdk.pinObject(handle)
  return { objectID: handle.id() }
}

export async function unpinItemBytes(
  sdk: Sdk,
  objectID: string,
): Promise<void> {
  await sdk.deleteObject(objectID)
}

export async function fetchAccountSnapshot(sdk: Sdk): Promise<AccountSnapshot> {
  const a = await sdk.account()
  return {
    pinnedData: a.pinnedData,
    pinnedSize: a.pinnedSize,
    maxPinnedData: a.maxPinnedData,
    remainingStorage: a.remainingStorage,
    fetchedAt: new Date().toISOString(),
  }
}
