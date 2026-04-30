import { useEffect } from 'react'
import { AuthFlow } from './components/auth/AuthFlow'
import { Home } from './components/Home'
import { Navbar } from './components/Navbar'
import { Toasts } from './components/Toast'
import { resumeSession } from './core/atproto'
import { useJetstream } from './lib/useJetstream'
import { useAuthStore } from './stores/auth'

export default function App() {
  const step = useAuthStore((s) => s.step)

  useJetstream()

  useEffect(() => {
    const { atprotoSession, atprotoAgent, setATProtoSession } =
      useAuthStore.getState()
    if (!atprotoSession || atprotoAgent) return

    let cancelled = false
    resumeSession(atprotoSession)
      .then((agent) => {
        if (cancelled) return
        setATProtoSession(agent.session ?? atprotoSession, agent)
      })
      .catch((e) => {
        console.warn('Failed to resume ATProto session:', e)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col">
        {step === 'connected' ? <Home /> : <AuthFlow />}
      </div>
      <Toasts />
    </div>
  )
}
