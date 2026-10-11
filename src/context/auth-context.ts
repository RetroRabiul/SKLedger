import { createContext } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type AuthContextValue = {
  user: User | null
  loading: boolean
  signOut: () => ReturnType<typeof supabase.auth.signOut>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
