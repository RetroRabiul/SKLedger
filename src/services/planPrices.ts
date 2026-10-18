import { supabase } from '../lib/supabase'
import { PLANS, PLAN_ORDER } from '../config/plans'
import type { PlanId, PlanPriceInfo, PlanPrices } from '../types'

export function defaultPlanPrices(): PlanPrices {
  return PLAN_ORDER.reduce((acc, id) => {
    acc[id] = PLANS[id].priceBdt
    return acc
  }, {} as PlanPrices)
}

export async function getPlanPrices(): Promise<PlanPrices> {
  return (await getPlanPriceInfo()).current
}

export async function getPlanPriceInfo(): Promise<PlanPriceInfo> {
  const current = defaultPlanPrices()
  const previous = defaultPlanPrices()
  const { data, error } = await supabase
    .from('plan_prices')
    .select('plan, price_bdt, previous_price_bdt')
  if (error) throw error
  for (const row of data ?? []) {
    if (row.plan in current) {
      current[row.plan as PlanId] = Number(row.price_bdt)
      previous[row.plan as PlanId] = Number(row.previous_price_bdt)
    }
  }
  return { current, previous }
}

export async function savePlanPrices(prices: PlanPrices): Promise<void> {
  const rows = PLAN_ORDER.map((plan) => ({
    plan,
    price_bdt: Math.max(0, Math.round(prices[plan])),
    updated_at: new Date().toISOString(),
  }))
  const { error } = await supabase.from('plan_prices').upsert(rows, { onConflict: 'plan' })
  if (error) throw error
}
