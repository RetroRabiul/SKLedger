import { supabase } from '../lib/supabase'
import { Project } from '../types'

export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*, clients(name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('projects')
    .insert([{ ...project, user_id: user.id }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProject(id: string, updates: Partial<Project>) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}