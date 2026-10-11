import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'
import { supabase } from '../lib/supabase'

export const NATIVE_REDIRECT_URL = 'com.skledger.app://login-callback'

export async function signInWithGoogle() {
  const isNative = Capacitor.isNativePlatform()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: isNative ? NATIVE_REDIRECT_URL : window.location.origin,
      skipBrowserRedirect: isNative,
    },
  })
  if (error) throw error
  if (isNative && data?.url) {
    await Browser.open({ url: data.url })
  }
}

export async function handleOAuthRedirect(url: string) {
  if (!url.startsWith(NATIVE_REDIRECT_URL)) return false
  const code = new URL(url).searchParams.get('code')
  if (!code) return false
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  await Browser.close()
  if (error) throw error
  return true
}
