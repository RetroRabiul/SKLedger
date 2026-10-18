import { supabase } from '../lib/supabase'
import type { LanguageId, ThemeId, UserSettings } from '../types'

export interface SettingsUpdates {
  theme?: ThemeId
  language?: LanguageId
  currency?: string
  brand_name?: string | null
  logo_url?: string | null
}

export async function uploadLogo(file: File): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const ext = file.name.split('.').pop() || 'png'
  const path = `${user.id}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('brand-assets').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from('brand-assets').getPublicUrl(path)
  return data.publicUrl
}

export async function getSettings(): Promise<UserSettings | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function saveSettings(updates: SettingsUpdates): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('user_settings')
    .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() }, { onConflict: 'id' })
  if (error) throw error
}
