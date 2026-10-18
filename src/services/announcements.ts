import { supabase } from '../lib/supabase'
import type { Announcement } from '../types'

export async function listAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createAnnouncement(title: string, body: string): Promise<Announcement> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('announcements')
    .insert([{ title, body, created_by: user?.id ?? null }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const { error } = await supabase.from('announcements').delete().eq('id', id)
  if (error) throw error
}
