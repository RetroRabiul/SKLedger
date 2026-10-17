import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { PLANS } from '../config/plans'
import type { PlanId, UserProfile, UserSettings } from '../types'
import { getProfile, getUsage, type UsageCounts } from '../services/profile'
import { getSettings, saveSettings, type SettingsUpdates } from '../services/userSettings'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../hooks/useI18n'
import { useThemeStore } from '../stores/themeStore'
import {
  ProfileContext,
  type LimitResource,
  type LimitResult,
  type PlanFeature,
} from './profile-context'

const EMPTY_USAGE: UsageCounts = { clients: 0, projects: 0 }

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { setLang } = useI18n()
  const setAccent = useThemeStore((s) => s.setAccent)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [usage, setUsage] = useState<UsageCounts>(EMPTY_USAGE)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setSettings(null)
      setUsage(EMPTY_USAGE)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [p, u, s] = await Promise.all([getProfile(), getUsage(), getSettings()])
      setProfile(p)
      setUsage(u)
      setSettings(s)
      if (s?.language) setLang(s.language)
      if (s?.theme) setAccent(s.theme)
    } catch (error) {
      console.error('Failed to load profile', error)
    } finally {
      setLoading(false)
    }
  }, [user, setLang, setAccent])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const plan: PlanId = profile?.plan ?? 'free'
  const planDef = PLANS[plan]

  const can = useCallback((feature: PlanFeature) => planDef.features[feature], [planDef])

  const checkLimit = useCallback(
    (resource: LimitResource): LimitResult => {
      const limit = planDef.limits[resource]
      const current =
        resource === 'clients'
          ? usage.clients
          : resource === 'projects'
            ? usage.projects
            : resource === 'exports'
              ? (profile?.exports_used ?? 0)
              : (profile?.imports_used ?? 0)
      return { canAdd: current < limit, current, limit }
    },
    [planDef, usage, profile]
  )

  const consume = useCallback(
    async (resource: 'exports' | 'imports'): Promise<boolean> => {
      if (!profile) return false
      const limit = planDef.limits[resource]
      const column = resource === 'exports' ? 'exports_used' : 'imports_used'
      const used = profile[column] ?? 0
      if (used >= limit) return false

      const { error } = await supabase
        .from('profiles')
        .update({ [column]: used + 1 })
        .eq('id', profile.id)
      if (error) throw error
      setProfile({ ...profile, [column]: used + 1 })
      return true
    },
    [profile, planDef]
  )

  const savePreference = useCallback(
    async (updates: SettingsUpdates) => {
      if (!user) return
      await saveSettings(updates)
      if (updates.language) setLang(updates.language)
      if (updates.theme) setAccent(updates.theme)
      setSettings((prev) => ({
        id: user.id,
        theme: updates.theme ?? prev?.theme ?? 'purple',
        language: updates.language ?? prev?.language ?? 'en',
        currency: updates.currency ?? prev?.currency ?? 'BDT',
        brand_name: updates.brand_name ?? prev?.brand_name ?? 'SKLedger',
      }))
    },
    [user, setLang, setAccent]
  )

  const value = useMemo(
    () => ({
      profile,
      settings,
      usage,
      loading,
      isAdmin: profile?.role === 'admin',
      plan,
      planDef,
      currency: settings?.currency ?? 'BDT',
      brandName: settings?.brand_name ?? 'SKLedger',
      can,
      checkLimit,
      refresh,
      consume,
      savePreference,
    }),
    [profile, settings, usage, loading, plan, planDef, can, checkLimit, refresh, consume, savePreference]
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}
