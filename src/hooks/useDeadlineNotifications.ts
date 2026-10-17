import { useEffect } from 'react'
import { toast } from 'sonner'
import { getProjects } from '../services/projects'
import { checkDeadlineAlerts, describeTimeLeft, loadNotifySettings } from '../lib/deadlineNotifications'
import { useProfile } from './useProfile'
import { useI18n } from './useI18n'

const CHECK_INTERVAL_MS = 5 * 60 * 1000

export function useDeadlineNotifications() {
  const { can, profile } = useProfile()
  const { lang } = useI18n()
  const isBn = lang === 'bn'
  const notificationsEnabled = can('notifications')
  const profileId = profile?.id

  useEffect(() => {
    if (!profileId || !notificationsEnabled) return
    let cancelled = false

    const run = async () => {
      const settings = loadNotifySettings()
      if (!settings.enabled) return
      try {
        const projects = await getProjects()
        if (cancelled) return
        const alerts = checkDeadlineAlerts(projects, settings)
        for (const alert of alerts) {
          const title = isBn ? 'ডেডলাইন ঘনিয়ে আসছে' : 'Deadline approaching'
          const body = `${alert.project.title} — ${describeTimeLeft(alert.hoursLeft, isBn)}`
          toast.warning(title, { description: body })
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification(title, { body })
          }
        }
      } catch (error) {
        console.error(error)
      }
    }

    void run()
    const interval = window.setInterval(() => void run(), CHECK_INTERVAL_MS)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [profileId, notificationsEnabled, isBn])
}
