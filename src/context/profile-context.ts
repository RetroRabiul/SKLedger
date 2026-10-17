import { createContext } from 'react'
import type { PlanDef } from '../config/plans'
import type { PlanId, UserProfile, UserSettings } from '../types'
import type { UsageCounts } from '../services/profile'
import type { SettingsUpdates } from '../services/userSettings'

export type LimitResource = 'clients' | 'projects' | 'exports' | 'imports'
export type PlanFeature = keyof PlanDef['features']

export interface LimitResult {
  canAdd: boolean
  current: number
  limit: number
}

export interface ProfileContextValue {
  profile: UserProfile | null
  settings: UserSettings | null
  usage: UsageCounts
  loading: boolean
  isAdmin: boolean
  plan: PlanId
  planDef: PlanDef
  currency: string
  brandName: string
  can: (feature: PlanFeature) => boolean
  checkLimit: (resource: LimitResource) => LimitResult
  refresh: () => Promise<void>
  consume: (resource: 'exports' | 'imports') => Promise<boolean>
  savePreference: (updates: SettingsUpdates) => Promise<void>
}

export const ProfileContext = createContext<ProfileContextValue | undefined>(undefined)
