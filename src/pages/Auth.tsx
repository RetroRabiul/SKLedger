import { useAuth } from '../hooks/useAuth'
import { signInWithGoogle } from '../services/auth'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function Auth() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading || user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 border rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold">SKLedger</h1>
          <p className="text-muted-foreground">Sign in to track your freelance revenue</p>
        </div>
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-md hover:bg-accent"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
}