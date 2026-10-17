import { supabase } from '../lib/supabase'
import type { Project, ProjectStatus, ServiceItem } from '../types'

export interface ProjectInput {
  client_id: string | null
  title: string
  description?: string | null
  category?: string | null
  amount: number
  advance_payment: number
  currency: string
  status: ProjectStatus
  start_date?: string | null
  due_date?: string | null
  completed_at?: string | null
  services: ServiceItem[]
  notes?: string | null
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*, clients(name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Project[]
}

export async function createProject(project: ProjectInput): Promise<Project> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('projects')
    .insert([{ ...project, user_id: user.id }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProject(id: string, updates: Partial<ProjectInput>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}
