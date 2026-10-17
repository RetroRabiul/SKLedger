import type { LanguageId } from '../types'

export function formatCurrency(
  amount: number,
  currency = 'BDT',
  lang: LanguageId = 'en'
): string {
  const locale = lang === 'bn' ? 'bn-BD' : 'en-US'
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  } catch {
    return `${currency} ${Math.round(amount || 0)}`
  }
}

export function formatNumber(value: number, lang: LanguageId = 'en'): string {
  try {
    return new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-US').format(value || 0)
  } catch {
    return String(value || 0)
  }
}

export function formatDate(value?: string | null, lang: LanguageId = 'en'): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function todayInput(): string {
  return new Date().toISOString().slice(0, 10)
}
