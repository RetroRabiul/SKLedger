export type Client = {
  id: string
  user_id: string
  name: string
  email?: string
  phone?: string
  company?: string
  notes?: string
  created_at: string
  updated_at: string
}

export type Project = {
  id: string
  user_id: string
  client_id: string
  title: string
  description?: string
  amount: number
  advance_payment: number
  currency: string
  status: 'active' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'
  start_date?: string
  end_date?: string
  due_date?: string
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export type Payment = {
  id: string
  user_id: string
  project_id: string
  amount: number
  payment_date: string
  notes?: string
  created_at: string
}

export type UserProfile = {
  id: string
  user_id: string
  plan: 'free' | 'pro' | 'business'
  usage: {
    clients: number
    projects: number
    exports: number
    imports: number
  }
  created_at: string
  updated_at: string
}