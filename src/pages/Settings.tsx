import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Download, Moon, Palette, Sun, Upload, Monitor } from 'lucide-react'
import { toast } from 'sonner'
import { THEMES } from '../config/themes'
import { useThemeStore } from '../stores/themeStore'
import { useI18n } from '../hooks/useI18n'
import { useProfile } from '../hooks/useProfile'
import { getClients, createClient } from '../services/clients'
import { getProjects, createProject } from '../services/projects'
import { getAllPayments, createPayment } from '../services/payments'
import {
  buildBackup,
  clientsCsv,
  downloadFile,
  parseBackup,
  projectsCsv,
} from '../utils/exportImport'
import {
  DEFAULT_NOTIFY_SETTINGS,
  formatHoursBefore,
  loadNotifySettings,
  parseHoursBefore,
  saveNotifySettings,
  type NotifySettings,
} from '../lib/deadlineNotifications'
import type { ThemeMode } from '../types'

export default function Settings() {
  const { t, lang, setLang } = useI18n()
  const { mode, accent, setMode, setAccent } = useThemeStore()
  const {
    settings,
    planDef,
    checkLimit,
    can,
    consume,
    savePreference,
    refresh,
  } = useProfile()

  const [brandName, setBrandName] = useState(settings?.brand_name ?? 'SKLedger')
  const [currency, setCurrency] = useState(settings?.currency ?? 'BDT')
  const [notify, setNotify] = useState<NotifySettings>(DEFAULT_NOTIFY_SETTINGS)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setBrandName(settings?.brand_name ?? 'SKLedger')
    setCurrency(settings?.currency ?? 'BDT')
  }, [settings])

  useEffect(() => {
    setNotify(loadNotifySettings())
  }, [])

  const exportState = checkLimit('exports')
  const importState = checkLimit('imports')

  const persist = async (updates: Parameters<typeof savePreference>[0]) => {
    try {
      await savePreference(updates)
      toast.success(t('toast.settingsSaved'))
    } catch (error) {
      toast.error((error as Error).message ?? t('common.error'))
    }
  }

  const handleExportCsv = async () => {
    if (!exportState.canAdd) {
      toast.error(t('settings.exportBlocked'))
      return
    }
    setBusy(true)
    try {
      const ok = await consume('exports')
      if (!ok) {
        toast.error(t('settings.exportBlocked'))
        return
      }
      const [clients, projects] = await Promise.all([getClients(), getProjects()])
      downloadFile('skledger-clients.csv', clientsCsv(clients), 'text/csv')
      downloadFile('skledger-projects.csv', projectsCsv(projects), 'text/csv')
      toast.success(t('toast.exported'))
    } catch (error) {
      toast.error((error as Error).message ?? t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  const handleExportJson = async () => {
    if (!exportState.canAdd) {
      toast.error(t('settings.exportBlocked'))
      return
    }
    setBusy(true)
    try {
      const ok = await consume('exports')
      if (!ok) {
        toast.error(t('settings.exportBlocked'))
        return
      }
      const [clients, projects, payments] = await Promise.all([
        getClients(),
        getProjects(),
        getAllPayments(),
      ])
      downloadFile('skledger-backup.json', buildBackup(clients, projects, payments), 'application/json')
      toast.success(t('toast.exported'))
    } catch (error) {
      toast.error((error as Error).message ?? t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  const handleImport = async (file: File) => {
    if (!importState.canAdd) {
      toast.error(t('settings.importBlocked'))
      return
    }
    setBusy(true)
    try {
      const backup = parseBackup(await file.text())
      const ok = await consume('imports')
      if (!ok) {
        toast.error(t('settings.importBlocked'))
        return
      }

      const clientNameById = new Map<string, string>()
      const newClientIdByName = new Map<string, string>()
      for (const client of backup.clients) {
        const created = await createClient({
          name: client.name,
          email: client.email ?? null,
          phone: client.phone ?? null,
          company: client.company ?? null,
          notes: client.notes ?? null,
        })
        clientNameById.set(client.id, client.name)
        newClientIdByName.set(client.name, created.id)
      }

      const newProjectIdByTitle = new Map<string, string>()
      for (const project of backup.projects) {
        const clientName = project.client_id ? clientNameById.get(project.client_id) : undefined
        const created = await createProject({
          client_id: clientName ? (newClientIdByName.get(clientName) ?? null) : null,
          title: project.title,
          category: project.category ?? null,
          amount: Number(project.amount) || 0,
          advance_payment: Number(project.advance_payment) || 0,
          currency: project.currency ?? currency,
          status: project.status ?? 'active',
          start_date: project.start_date ?? null,
          due_date: project.due_date ?? null,
          services: project.services ?? [],
          notes: project.notes ?? null,
          description: project.description ?? null,
        })
        newProjectIdByTitle.set(project.title, created.id)
      }

      for (const payment of backup.payments) {
        const projectId = newProjectIdByTitle.get(
          backup.projects.find((p) => p.id === payment.project_id)?.title ?? ''
        )
        if (!projectId) continue
        await createPayment({
          project_id: projectId,
          amount: Number(payment.amount) || 0,
          method: payment.method ?? 'Cash',
          payment_date: payment.payment_date ?? new Date().toISOString().slice(0, 10),
          notes: payment.notes ?? null,
        })
      }

      toast.success(t('toast.imported'))
      await refresh()
    } catch (error) {
      toast.error((error as Error).message ?? t('common.error'))
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleNotifyToggle = async (enabled: boolean) => {
    if (enabled && 'Notification' in window && Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast.error(t('notify.permissionDenied'))
        return
      }
    }
    const next = { ...notify, enabled }
    setNotify(next)
    saveNotifySettings(next)
  }

  const handleHours = (raw: string) => {
    const next = { ...notify, hoursBefore: parseHoursBefore(raw) }
    setNotify(next)
    saveNotifySettings(next)
  }

  const sendTest = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('SKLedger', { body: t('notify.test') })
    } else {
      toast.error(t('notify.permissionDenied'))
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      {/* Appearance */}
      <section className="space-y-4 rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold">{t('settings.appearance')}</h2>

        <div>
          <p className="mb-2 text-sm font-medium">{t('settings.mode')}</p>
          <div className="flex gap-2">
            {(
              [
                ['light', Sun, t('settings.light')],
                ['dark', Moon, t('settings.dark')],
                ['system', Monitor, t('settings.system')],
              ] as [ThemeMode, typeof Sun, string][]
            ).map(([value, Icon, label]) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm ${
                  mode === value ? 'border-primary text-primary' : 'hover:bg-accent'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Palette className="h-4 w-4" />
            {t('settings.accent')}
          </p>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  setAccent(theme.id)
                  void persist({ theme: theme.id })
                }}
                className={`h-9 w-9 rounded-full border-2 ${
                  accent === theme.id ? 'border-foreground' : 'border-transparent'
                }`}
                style={{ backgroundColor: theme.swatch }}
                title={theme.name}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="space-y-4 rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold">{t('settings.prefs')}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              {t('settings.language')}
            </span>
            <select
              value={lang}
              onChange={(e) => {
                const value = e.target.value as 'en' | 'bn'
                setLang(value)
                void persist({ language: value })
              }}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="en">English</option>
              <option value="bn">বাংলা</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              {t('settings.currency')}
            </span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {['BDT', 'USD', 'EUR', 'GBP', 'INR'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              {t('settings.brandName')}
            </span>
            <input
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>
        <button
          onClick={() => void persist({ brand_name: brandName, currency })}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {t('common.save')}
        </button>
      </section>

      {/* Notifications */}
      <section className="space-y-4 rounded-lg border bg-card p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Bell className="h-4 w-4" />
          {t('notify.title')}
        </h2>
        {can('notifications') ? (
          <>
            <p className="text-sm text-muted-foreground">{t('notify.subtitle')}</p>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={notify.enabled}
                onChange={(e) => void handleNotifyToggle(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm">{t('notify.enable')}</span>
            </label>
            {notify.enabled && (
              <div className="space-y-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-muted-foreground">
                    {t('notify.hoursBefore')}
                  </span>
                  <input
                    defaultValue={formatHoursBefore(notify.hoursBefore)}
                    onChange={(e) => handleHours(e.target.value)}
                    className="w-40 rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </label>
                <p className="text-xs text-muted-foreground">{t('notify.hoursHint')}</p>
                <button
                  onClick={sendTest}
                  className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs hover:bg-accent"
                >
                  <Bell className="h-3.5 w-3.5" />
                  {t('notify.test')}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            {t('notify.locked')}{' '}
            <Link to="/upgrade" className="text-primary hover:underline">
              {t('common.upgradeNow')}
            </Link>
          </div>
        )}
      </section>

      {/* Data management */}
      <section className="space-y-4 rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold">{t('settings.data')}</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportCsv}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {t('settings.exportCsv')}
          </button>
          <button
            onClick={handleExportJson}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {t('settings.exportJson')}
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {t('settings.importJson')}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleImport(file)
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {t('settings.exportLimit', {
            remaining: Math.max(0, exportState.limit - exportState.current),
            limit: exportState.limit,
          })}
          {' · '}
          {t('settings.importLimit', {
            remaining: Math.max(0, importState.limit - importState.current),
            limit: importState.limit,
          })}
        </p>
      </section>

      {/* Subscription */}
      <section className="space-y-4 rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold">{t('settings.subscription')}</h2>
        <div className="flex items-center justify-between rounded-md border p-4">
          <div>
            <p className="font-medium">
              {t('settings.currentPlan')}: {t(`plan.${planDef.id}`)}
            </p>
            <p className="text-xs text-muted-foreground">
              {planDef.limits.clients} {t('plan.clients')} · {planDef.limits.projects}{' '}
              {t('plan.projects')} · {planDef.limits.exports} {t('plan.exports')}
            </p>
          </div>
          <Link
            to="/upgrade"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            {t('settings.managePlan')}
          </Link>
        </div>
      </section>
    </div>
  )
}
