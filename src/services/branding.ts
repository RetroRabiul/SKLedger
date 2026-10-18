import { supabase } from '../lib/supabase'
import type { AppBranding } from '../types'

export const DEFAULT_BRANDING: AppBranding = { brand_name: 'SKLedger', logo_url: null }

export async function getBranding(): Promise<AppBranding> {
  const { data, error } = await supabase
    .from('app_branding')
    .select('brand_name, logo_url')
    .eq('id', 1)
    .maybeSingle()
  if (error) throw error
  return {
    brand_name: data?.brand_name?.trim() || DEFAULT_BRANDING.brand_name,
    logo_url: data?.logo_url ?? null,
  }
}

export async function saveBranding(brandName: string, logoUrl: string | null): Promise<void> {
  const { error } = await supabase
    .from('app_branding')
    .upsert(
      {
        id: 1,
        brand_name: brandName.trim() || DEFAULT_BRANDING.brand_name,
        logo_url: logoUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
  if (error) throw error
}
