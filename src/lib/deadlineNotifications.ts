import type { Project } from '../types'

export interface NotifySettings {
  enabled: boolean
  hoursBefore: number[]
}

export interface UpcomingDeadline {
  project: Project
  hoursLeft: number
}

export interface DeadlineAlert {
  project: Project
  hoursLeft: number
  threshold: number
}

const SETTINGS_KEY = 'skledger_notify_settings_v1'
const FIRED_KEY = 'skledger_notify_fired_v1'

export const DEFAULT_NOTIFY_SETTINGS: NotifySettings = {
  enabled: false,
  hoursBefore: [24, 3, 1],
}

export function parseHoursBefore(raw: string): number[] {
  return Array.from(
    new Set(
      raw
        .split(/[,\s]+/)
        .map((part) => Number.parseFloat(part))
        .filter((n) => Number.isFinite(n) && n > 0)
    )
  ).sort((a, b) => b - a)
}

export function formatHoursBefore(hours: number[]): string {
  return hours.join(', ')
}

export function loadNotifySettings(): NotifySettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_NOTIFY_SETTINGS
    const parsed = JSON.parse(raw) as Partial<NotifySettings>
    const hours = Array.isArray(parsed?.hoursBefore)
      ? parsed.hoursBefore
          .filter((n): n is number => typeof n === 'number' && n > 0)
          .sort((a, b) => b - a)
      : DEFAULT_NOTIFY_SETTINGS.hoursBefore
    return {
      enabled: Boolean(parsed?.enabled),
      hoursBefore: hours.length ? hours : DEFAULT_NOTIFY_SETTINGS.hoursBefore,
    }
  } catch {
    return DEFAULT_NOTIFY_SETTINGS
  }
}

export function saveNotifySettings(settings: NotifySettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    /* storage unavailable */
  }
}

/** Parse a due date into a local timestamp. Date-only values mean end of day. */
export function parseDueDate(value?: string | null): number | null {
  if (!value) return null
  const hasTime = value.includes('T')
  const normalized = hasTime ? value : `${value}T23:59`
  const ms = new Date(normalized).getTime()
  return Number.isNaN(ms) ? null : ms
}

export function getHoursLeft(project: Project, now = Date.now()): number | null {
  const due = parseDueDate(project.due_date)
  if (due === null) return null
  return (due - now) / 3_600_000
}

export function getUpcomingDeadlines(
  projects: Project[],
  settings: NotifySettings,
  now = Date.now()
): UpcomingDeadline[] {
  if (!settings.hoursBefore.length) return []
  const maxHours = Math.max(...settings.hoursBefore)
  return projects
    .filter((p) => p.status !== 'completed' && p.status !== 'cancelled')
    .map((project) => ({ project, hoursLeft: getHoursLeft(project, now) }))
    .filter(
      (item): item is UpcomingDeadline =>
        item.hoursLeft !== null && item.hoursLeft > 0 && item.hoursLeft <= maxHours
    )
    .sort((a, b) => a.hoursLeft - b.hoursLeft)
}

function loadFired(): Record<string, number> {
  try {
    const raw = localStorage.getItem(FIRED_KEY)
    return raw ? (JSON.parse(raw) as Record<string, number>) : {}
  } catch {
    return {}
  }
}

function saveFired(fired: Record<string, number>): void {
  try {
    localStorage.setItem(FIRED_KEY, JSON.stringify(fired))
  } catch {
    /* storage unavailable */
  }
}

export function checkDeadlineAlerts(
  projects: Project[],
  settings: NotifySettings,
  now = Date.now()
): DeadlineAlert[] {
  if (!settings.enabled || !settings.hoursBefore.length) return []
  const fired = loadFired()
  const alerts: DeadlineAlert[] = []

  for (const project of projects) {
    if (project.status === 'completed' || project.status === 'cancelled') continue
    const hoursLeft = getHoursLeft(project, now)
    if (hoursLeft === null || hoursLeft <= 0) continue
    for (const threshold of settings.hoursBefore) {
      if (hoursLeft <= threshold && !fired[`${project.id}|${project.due_date}|${threshold}`]) {
        fired[`${project.id}|${project.due_date}|${threshold}`] = now
        alerts.push({ project, hoursLeft, threshold })
      }
    }
  }

  if (alerts.length) saveFired(fired)
  return alerts
}

export type Urgency = 'overdue' | 'urgent' | 'soon' | 'normal'

export function getUrgency(hoursLeft: number): Urgency {
  if (hoursLeft <= 0) return 'overdue'
  if (hoursLeft <= 6) return 'urgent'
  if (hoursLeft <= 24) return 'soon'
  return 'normal'
}

export function describeTimeLeft(hoursLeft: number, isBn = false): string {
  const totalMinutes = Math.round(Math.abs(hoursLeft) * 60)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60

  const parts: string[] = []
  if (days > 0) parts.push(isBn ? `${days} দিন` : `${days}d`)
  if (hours > 0) parts.push(isBn ? `${hours} ঘণ্টা` : `${hours}h`)
  if (days === 0) parts.push(isBn ? `${minutes} মিনিট` : `${minutes}m`)

  const amount = parts.join(' ')
  if (hoursLeft <= 0) {
    return isBn ? `${amount} আগে শেষ` : `Overdue by ${amount}`
  }
  return isBn ? `আর ${amount} বাকি` : `${amount} left`
}
