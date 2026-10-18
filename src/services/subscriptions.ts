import { supabase } from '../lib/supabase'
import type { Subscription } from '../types'

export interface NewSubscription {
  plan: 'pro' | 'business'
  amount: number
  currency: string
  method: string
  transaction_id: string
  proof_url?: string | null
}

export async function uploadProof(file: File): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const ext = file.name.split('.').pop() || 'png'
  const path = `${user.id}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('payment-proofs').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  return path
}

/** Resolve a stored proof reference to a viewable URL (signed for private paths). */
/** Resolve a stored proof reference to a viewable URL (signed for private paths). */
export async function getProofUrl(reference: string): Promise<string> {
  let path = reference
  if (/^https?:\/\//i.test(reference)) {
    const marker = '/payment-proofs/'
    const idx = reference.indexOf(marker)
    if (idx === -1) return reference
    path = reference.slice(idx + marker.length).split('?')[0]
  }
  const { data, error } = await supabase.storage
    .from('payment-proofs')
    .createSignedUrl(decodeURIComponent(path), 3600)
  if (error) throw error
  return data.signedUrl
}

export async function requestUpgrade(payload: NewSubscription): Promise<Subscription> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('subscriptions')
    .insert([{ ...payload, user_id: user.id, status: 'pending' }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getMySubscriptions(): Promise<Subscription[]> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
