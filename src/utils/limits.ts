import { PLANS, type Plan } from '../config/plans'
import type { UserProfile } from '../types'

type Resource = 'clients' | 'projects' | 'exports' | 'imports'

export const checkLimit = (profile: UserProfile | null | undefined, resource: Resource) => {
  const plan: Plan = (profile?.plan as Plan) || 'free'
  const current = profile?.usage?.[resource] ?? 0
  const limit = PLANS[plan].limits[resource]
  return { canAdd: current < limit, current, limit }
}
