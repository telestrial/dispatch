import { AuthFlow } from './components/auth/AuthFlow'
import { Home } from './components/Home'
import { Navbar } from './components/Navbar'
import { Toasts } from './components/Toast'
import { useAuthStore } from './stores/auth'

export default function App() {
  const step = useAuthStore((s) => s.step)

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
