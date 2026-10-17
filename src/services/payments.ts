import { supabase } from '../lib/supabase'
import type { Payment, PaymentMethod } from '../types'

export interface NewPayment {
  project_id: string
  amount: number
  method: PaymentMethod
  payment_date: string
  notes?: string | null
}

export async function getPayments(projectId?: string): Promise<Payment[]> {
  let query = supabase.from('project_payments').select('*').order('payment_date', { ascending: false })
  if (projectId) query = query.eq('project_id', projectId)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getAllPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('project_payments')
    .select('*')
    .order('payment_date', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createPayment(payment: NewPayment): Promise<Payment> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('project_payments')
    .insert([{ ...payment, user_id: user.id }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePayment(id: string): Promise<void> {
  const { error } = await supabase.from('project_payments').delete().eq('id', id)
  if (error) throw error
}
