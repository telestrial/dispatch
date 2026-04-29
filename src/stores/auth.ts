import type { Sdk } from '@siafoundation/sia-storage'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SubscriptionRef } from '../core/types'
import { APP_KEY } from '../lib/constants'

export type AuthStep =
  | 'loading'
  | 'connect'
  | 'approve'
  | 'recovery'
  | 'connected'

export type OwnedChannel = {
  channelID: string
  channelURL: string
  name: string
  createdAt: string
}

type AuthState = {
  sdk: Sdk | null
  storedKeyHex: string | null
  indexerURL: string
  step: AuthStep
  error: string | null
  approvalURL: string | null
  myChannels: OwnedChannel[]
  subscriptions: SubscriptionRef[]
  setSdk: (sdk: Sdk) => void
  setStep: (step: AuthStep) => void
  setError: (error: string | null) => void
  setStoredKeyHex: (hex: string) => void
  setIndexerURL: (url: string) => void
  setApprovalURL: (url: string | null) => void
  addMyChannel: (channel: OwnedChannel) => void
  addSubscription: (sub: SubscriptionRef) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      sdk: null,
      storedKeyHex: null,
      indexerURL: '',
      step: 'loading',
      error: null,
      approvalURL: null,
      myChannels: [],
      subscriptions: [],
      setSdk: (sdk) => set({ sdk, step: 'connected', error: null }),
      setStep: (step) => set({ step, error: null }),
      setError: (error) => set({ error }),
      setStoredKeyHex: (hex) => set({ storedKeyHex: hex }),
      setIndexerURL: (url) => set({ indexerURL: url }),
      setApprovalURL: (url) => set({ approvalURL: url }),
      addMyChannel: (channel) =>
        set((s) => ({ myChannels: [...s.myChannels, channel] })),
      addSubscription: (sub) =>
        set((s) =>
          s.subscriptions.some((x) => x.channelURL === sub.channelURL)
            ? s
            : { subscriptions: [...s.subscriptions, sub] },
        ),
      reset: () =>
        set({
          sdk: null,
          storedKeyHex: null,
          step: 'loading',
          error: null,
          approvalURL: null,
          myChannels: [],
          subscriptions: [],
        }),
    }),
    {
      name: `sia-auth-${APP_KEY.slice(0, 16)}`,
      partialize: (state) => ({
        storedKeyHex: state.storedKeyHex,
        indexerURL: state.indexerURL,
        myChannels: state.myChannels,
        subscriptions: state.subscriptions,
      }),
    },
  ),
)
