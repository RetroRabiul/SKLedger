import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bell, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { listAnnouncements } from '../../services/announcements'
import { getProjects } from '../../services/projects'
import {
  getUpcomingDeadlines,
  loadNotifySettings,
  parseDueDate,
  type UpcomingDeadline,
} from '../../lib/deadlineNotifications'
import { useI18n } from '../../hooks/useI18n'
import { useProfile } from '../../hooks/useProfile'
import { formatDate } from '../../utils/format'
import type { Announcement } from '../../types'

const READ_KEY = 'skledger_notif_read_v1'
const SEEN_KEY = 'skledger_notif_seen_v1'
const POLL_MS = 5 * 60 * 1000

function readStore(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStore(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage unavailable */
  }
}

export default function NotificationBell() {
  const { t, lang } = useI18n()
  const { can } = useProfile()
  const [open, setOpen] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [deadlines, setDeadlines] = useState<UpcomingDeadline[]>([])
  const [lastRead, setLastRead] = useState<string | null>(() => readStore(READ_KEY))

  const canNotify = can('notifications')

  const reload = useCallback(async () => {
    try {
      const list = await listAnnouncements()
      setAnnouncements(list)

      // Toast + system notification for announcements published since last seen.
      const seen = readStore(SEEN_KEY)
      const fresh = seen ? list.filter((a) => a.created_at > seen) : []
      for (const a of fresh.reverse()) {
        toast.info(a.title, { description: a.body })
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(a.title, { body: a.body })
        }
      }
      if (list.length && (!seen || list[0].created_at > seen)) {
        writeStore(SEEN_KEY, list[0].created_at)
      }
    } catch (error) {
      console.error(error)
    }

    if (canNotify) {
      try {
        const settings = loadNotifySettings()
        if (settings.enabled) {
          const projects = await getProjects()
          setDeadlines(getUpcomingDeadlines(projects, settings))
        } else {
          setDeadlines([])
        }
      } catch (error) {
        console.error(error)
      }
    }
  }, [canNotify])

  useEffect(() => {
    void reload()
    const interval = window.setInterval(() => void reload(), POLL_MS)
    return () => window.clearInterval(interval)
  }, [reload])

  const unreadAnnouncements = useMemo(() => {
    if (!lastRead) return announcements.length
    return announcements.filter((a) => a.created_at > lastRead).length
  }, [announcements, lastRead])

  const badge = unreadAnnouncements + (canNotify ? deadlines.length : 0)

  const hasContent = announcements.length > 0 || (canNotify && deadlines.length > 0)

  const openPanel = () => {
    const next = !open
    if (next) {
      const now = new Date().toISOString()
      writeStore(READ_KEY, now)
      setLastRead(now)
    }
    setOpen(next)
  }

  return (
    <div className="relative">
      <button
        onClick={openPanel}
        aria-label={t('notif.title')}
        className="relative rounded-md border p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        {badge > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border bg-card shadow-xl">
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <Bell className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">{t('notif.title')}</p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {!hasContent ? (
                <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                  <Bell className="h-6 w-6 text-muted-foreground/60" />
                  <p className="text-sm text-muted-foreground">{t('notif.empty')}</p>
                </div>
              ) : (
                <>
                  {announcements.length > 0 && (
                    <div className="border-b">
                      <p className="px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t('notif.announcements')}
                      </p>
                      <ul className="divide-y">
                        {announcements.map((a) => (
                          <li key={a.id} className="px-4 py-3 transition-colors hover:bg-accent/40">
                            <p className="text-sm font-medium">{a.title}</p>
                            {a.body && (
                              <p className="mt-0.5 whitespace-pre-line text-xs text-muted-foreground">
                                {a.body}
                              </p>
                            )}
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {formatDate(a.created_at, lang)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {canNotify && deadlines.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t('notif.deadlines')}
                      </p>
                      <ul className="divide-y">
                        {deadlines.map(({ project, hoursLeft }) => {
                          const due = parseDueDate(project.due_date)
                          return (
                            <li
                              key={project.id}
                              className="flex items-start gap-2 px-4 py-3 transition-colors hover:bg-accent/40"
                            >
                              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                              <div>
                                <p className="text-sm font-medium">{project.title}</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {t('notif.dueIn', { time: describeHours(hoursLeft, lang) })}
                                  {due ? ` · ${formatDate(new Date(due).toISOString(), lang)}` : ''}
                                </p>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function describeHours(hoursLeft: number, lang: string): string {
  const isBn = lang === 'bn'
  const totalMinutes = Math.round(hoursLeft * 60)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  const parts: string[] = []
  if (days > 0) parts.push(isBn ? `${days} দিন` : `${days}d`)
  if (hours > 0) parts.push(isBn ? `${hours} ঘণ্টা` : `${hours}h`)
  if (days === 0) parts.push(isBn ? `${minutes} মিনিট` : `${minutes}m`)
  return parts.join(' ')
}
