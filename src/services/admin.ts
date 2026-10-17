import { supabase } from '../lib/supabase'
import type { AdminUserRow, PlanId, Subscription } from '../types'

export async function listUsers(): Promise<AdminUserRow[]> {
  const [profilesRes, clientsRes, projectsRes, subsRes] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('clients').select('user_id'),
    supabase.from('projects').select('user_id'),
    supabase.from('subscriptions').select('user_id, amount, status'),
  ])
  if (profilesRes.error) throw profilesRes.error
  if (clientsRes.error) throw clientsRes.error
  if (projectsRes.error) throw projectsRes.error
  if (subsRes.error) throw subsRes.error

  const clientCounts = new Map<string, number>()
  for (const row of clientsRes.data ?? []) {
    clientCounts.set(row.user_id, (clientCounts.get(row.user_id) ?? 0) + 1)
  }
  const projectCounts = new Map<string, number>()
  for (const row of projectsRes.data ?? []) {
    projectCounts.set(row.user_id, (projectCounts.get(row.user_id) ?? 0) + 1)
  }
  const revenue = new Map<string, number>()
  for (const row of subsRes.data ?? []) {
    if (row.status !== 'approved') continue
    revenue.set(row.user_id, (revenue.get(row.user_id) ?? 0) + Number(row.amount || 0))
  }

  return (profilesRes.data ?? []).map((p) => ({
    ...p,
    client_count: clientCounts.get(p.id) ?? 0,
    project_count: projectCounts.get(p.id) ?? 0,
    revenue: revenue.get(p.id) ?? 0,
  })) as AdminUserRow[]
}

export interface AdminSubscriptionRow extends Subscription {
  profiles?: { email: string | null; full_name: string | null } | null
}

export async function listSubscriptions(): Promise<AdminSubscriptionRow[]> {
  const [subsRes, profilesRes] = await Promise.all([
    supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, email, full_name'),
  ])
  if (subsRes.error) throw subsRes.error
  if (profilesRes.error) throw profilesRes.error

  const byId = new Map<string, { email: string | null; full_name: string | null }>()
  for (const p of profilesRes.data ?? []) {
    byId.set(p.id, { email: p.email, full_name: p.full_name })
  }

  return (subsRes.data ?? []).map((s) => ({
    ...s,
    profiles: byId.get(s.user_id) ?? null,
  })) as AdminSubscriptionRow[]
}

export async function adminSetPlan(userId: string, plan: PlanId): Promise<void> {
  const { error } = await supabase.rpc('admin_set_plan', { p_user: userId, p_plan: plan })
  if (error) throw error
}

export async function reviewSubscription(id: string, status: 'approved' | 'rejected'): Promise<void> {
  const { error } = await supabase.rpc('review_subscription', {
    p_subscription_id: id,
    p_status: status,
  })
  if (error) throw error
}
