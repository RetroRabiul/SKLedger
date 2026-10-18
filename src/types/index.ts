export type PlanId = 'free' | 'pro' | 'business'
export type LanguageId = 'en' | 'bn'
export type ThemeId = 'purple' | 'indigo' | 'blue' | 'emerald' | 'rose' | 'amber'
export type ThemeMode = 'light' | 'dark' | 'system'

export interface ServiceItem {
  id: string
  name: string
  completed: boolean
}

export interface Client {
  id: string
  user_id: string
  name: string
  email?: string | null
  phone?: string | null
  company?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export type ProjectStatus =
  | 'active'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'on_hold'

export interface Project {
  id: string
  user_id: string
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
  created_at: string
  updated_at: string
  /** Joined relation when fetching with `clients(name)`. */
  clients?: { name: string } | null
}

export type PaymentMethod =
  | 'bKash'
  | 'Nagad'
  | 'Rocket'
  | 'Bank Transfer'
  | 'Card'
  | 'Cash'
  | 'Other'

export interface Payment {
  id: string
  user_id: string
  project_id: string
  amount: number
  method: PaymentMethod
  payment_date: string
  notes?: string | null
  created_at: string
}

export interface UserProfile {
  id: string
  email?: string | null
  full_name?: string | null
  avatar_url?: string | null
  role: 'user' | 'admin'
  plan: PlanId
  plan_expires_at?: string | null
  exports_used: number
  imports_used: number
  created_at: string
  updated_at: string
}

export type SubscriptionStatus = 'pending' | 'approved' | 'rejected'

export interface Subscription {
  id: string
  user_id: string
  plan: 'pro' | 'business'
  amount: number
  currency: string
  method?: string | null
  transaction_id?: string | null
  proof_url?: string | null
  status: 'pending' | 'approved' | 'rejected'
  note?: string | null
  reviewed_by?: string | null
  reviewed_at?: string | null
  created_at: string
}

export interface UserSettings {
  id: string
  theme: ThemeId
  language: LanguageId
  currency: string
  brand_name?: string | null
  logo_url?: string | null
  updated_at?: string
}

export interface PaymentChannel {
  id: string
  label: string
  value: string
}

export interface AppSettings {
  id: number
  payment_methods: PaymentChannel[]
  payment_note?: string | null
  updated_at?: string
}

export type PlanPrices = Record<PlanId, number>

export interface Announcement {
  id: string
  title: string
  body: string
  created_by?: string | null
  created_at: string
}

export interface AdminUserRow extends UserProfile {
  revenue: number
}
