import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { supabase } from '../lib/supabase'
import { AuthContext } from './auth-context'
import { handleOAuthRedirect } from '../services/auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const listener = App.addListener('appUrlOpen', ({ url }) => {
      handleOAuthRedirect(url).catch((error) => console.error(error))
    })

    return () => {
      listener.then((handle) => handle.remove())
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, loading, signOut: () => supabase.auth.signOut() }}
    >
      {children}
    </AuthContext.Provider>
  )
}
