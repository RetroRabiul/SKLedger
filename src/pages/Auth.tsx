import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../hooks/useI18n'
import { signInWithGoogle } from '../services/auth'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Briefcase } from 'lucide-react'

export default function Auth() {
  const { user, loading } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">{t('common.loading')}</div>
    )
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-8 shadow">
        <div className="text-center">
          <div className="mb-3 flex justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </span>
          </div>
          <h1 className="text-2xl font-bold">{t('auth.title')}</h1>
          <p className="mt-1 text-muted-foreground">{t('auth.subtitle')}</p>
        </div>
        <button
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 font-medium text-primary-foreground hover:opacity-90"
        >
          {t('auth.google')}
        </button>
      </div>
    </div>
  )
}
