import type { PlanId } from '../types'

export interface PlanFeatures {
  invoices: boolean
  analytics: boolean
  notifications: boolean
  checklistPresets: boolean
  bengali: boolean
}

export interface PlanDef {
  id: PlanId
  name: string
  priceBdt: number
  priceUsd: number
  limits: {
    clients: number
    projects: number
    exports: number
    imports: number
  }
  features: {
    invoices: boolean
    analytics: boolean
    notifications: boolean
    checklistPresets: boolean
    bengali: boolean
  }
}

export const PLANS: Record<PlanId, PlanDef> = {
  free: {
    id: 'free',
    name: 'Free',
    priceBdt: 0,
    priceUsd: 0,
    limits: { clients: 5, projects: 10, exports: 0, imports: 0 },
    features: {
      invoices: true,
      analytics: false,
      notifications: false,
      checklistPresets: false,
      bengali: true,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceBdt: 500,
    priceUsd: 5,
    limits: { clients: 100, projects: 500, exports: 10, imports: 10 },
    features: {
      invoices: true,
      analytics: true,
      notifications: true,
      checklistPresets: true,
      bengali: true,
    },
  },
  business: {
    id: 'business',
    name: 'Business',
    priceBdt: 1500,
    priceUsd: 15,
    limits: { clients: 1000, projects: 5000, exports: 100, imports: 100 },
    features: {
      invoices: true,
      analytics: true,
      notifications: true,
      checklistPresets: true,
      bengali: true,
    },
  },
}

export const PLAN_ORDER: PlanId[] = ['free', 'pro', 'business']

export type Plan = PlanId
