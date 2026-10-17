import { supabase } from '../lib/supabase'
import type { Client, Project, UserProfile } from '../types'

export async function getProfile(): Promise<UserProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()
  if (error) throw error

  // Row may not exist until the DB trigger has run; fall back to a safe default.
  if (!data) {
    return {
      id: user.id,
      email: user.email,
      full_name: (user.user_metadata?.full_name as string) ?? null,
      plan: 'free',
      role: 'user',
      exports_used: 0,
      imports_used: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as UserProfile
  }
  return data as UserProfile
}

export async function updateProfile(updates: {
  full_name?: string | null
}): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
  if (error) throw error
}

export async function incrementUsage(
  field: 'exports_used' | 'imports_used'
): Promise<number> {
  const profile = await getProfile()
  const current = profile?.[field] ?? 0
  const next = current + 1
  const { error } = await supabase
    .from('profiles')
    .update({ [field]: next })
    .eq('id', (await supabase.auth.getUser()).data.user?.id ?? '')
  if (error) throw error
  return next
}

export interface UsageCounts {
  clients: number
  projects: number
}

export async function getUsage(): Promise<UsageCounts> {
  const [clients, projects] = await Promise.all([
    supabase.from('clients').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
  ])
  if (clients.error) throw clients.error
  if (projects.error) throw projects.error
  return { clients: clients.count ?? 0, projects: projects.count ?? 0 }
}

export type { Client, Project }
