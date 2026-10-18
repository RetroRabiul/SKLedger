import { supabase } from '../lib/supabase'
import { PLANS, PLAN_ORDER } from '../config/plans'
import type { PlanId, PlanPrices } from '../types'

export function defaultPlanPrices(): PlanPrices {
  return PLAN_ORDER.reduce((acc, id) => {
    acc[id] = PLANS[id].priceBdt
    return acc
  }, {} as PlanPrices)
}

export async function getPlanPrices(): Promise<PlanPrices> {
  const prices = defaultPlanPrices()
  const { data, error } = await supabase.from('plan_prices').select('plan, price_bdt')
  if (error) throw error
  for (const row of data ?? []) {
    if (row.plan in prices) prices[row.plan as PlanId] = Number(row.price_bdt)
  }
  return prices
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
