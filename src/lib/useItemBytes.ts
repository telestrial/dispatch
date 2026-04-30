import { useEffect, useState } from 'react'
import { downloadItemBytes } from '../core/channels'
import { useAuthStore } from '../stores/auth'

export function useItemBytes(itemURL: string) {
  const sdk = useAuthStore((s) => s.sdk)
  const [bytes, setBytes] = useState<Uint8Array | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sdk) return
    let cancelled = false
    setBytes(null)
    setError(null)
    downloadItemBytes(sdk, itemURL)
      .then((b) => {
        if (cancelled) return
        setBytes(b)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load')
      })
    return () => {
      cancelled = true
    }
  }, [sdk, itemURL])

  return { bytes, error }
}

export function useItemBlobURL(itemURL: string, mimeType: string) {
  const { bytes, error } = useItemBytes(itemURL)
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!bytes) return
    const blob = new Blob([bytes as BlobPart], { type: mimeType })
    const blobURL = URL.createObjectURL(blob)
    setUrl(blobURL)
    return () => {
      URL.revokeObjectURL(blobURL)
    }
  }, [bytes, mimeType])

  return { url, error }
}
