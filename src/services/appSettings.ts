import { supabase } from '../lib/supabase'
import type { AppSettings, PaymentChannel } from '../types'

export async function getAppSettings(): Promise<AppSettings | null> {
  const { data, error } = await supabase.from('app_settings').select('*').eq('id', 1).maybeSingle()
  if (error) throw error
  return data
}

export async function savePaymentDetails(
  payment_methods: PaymentChannel[],
  payment_note: string | null,
): Promise<void> {
  const { error } = await supabase
    .from('app_settings')
    .upsert(
      { id: 1, payment_methods, payment_note, updated_at: new Date().toISOString() },
      { onConflict: 'id' },
    )
  if (error) throw error
}
