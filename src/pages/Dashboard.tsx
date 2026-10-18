import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Briefcase, ChevronLeft, ChevronRight, Clock, DollarSign, Lock, TrendingUp, Users } from 'lucide-react'
import { getClients } from '../services/clients'
import { getProjects } from '../services/projects'
import { getAllPayments } from '../services/payments'
import type { Client, Payment, Project } from '../types'
import { useI18n } from '../hooks/useI18n'
import { useProfile } from '../hooks/useProfile'
import { formatCurrency } from '../utils/format'
import { describeTimeLeft, getUrgency } from '../lib/deadlineNotifications'

interface ChartPoint {
  label: string
  amount: number
}

function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diff = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - diff)
  return d
}

function paidFor(project: Project, payments: Payment[]): number {
  const extra = payments
    .filter((p) => p.project_id === project.id)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)
  return Number(project.advance_payment || 0) + extra
}

export default function Dashboard() {
  const { t, lang } = useI18n()
  const { can, currency, profile } = useProfile()
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<'month' | 'week'>('month')
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    let mounted = true
    Promise.all([getClients(), getProjects(), getAllPayments()])
      .then(([c, p, pay]) => {
        if (!mounted) return
        setClients(c)
        setProjects(p)
        setPayments(pay)
      })
      .catch((error) => console.error(error))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const stats = useMemo(() => {
    const totalReceived = projects.reduce((sum, p) => sum + paidFor(p, payments), 0)
    const totalSale = projects.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    const pending = Math.max(0, totalSale - totalReceived)
    const active = projects.filter(
      (p) => p.status === 'active' || p.status === 'in_progress'
    )

    const now = new Date()
    const monthly = payments
      .filter((p) => {
        const d = new Date(p.payment_date)
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      })
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)

    const months: ChartPoint[] = []
    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i - offset, 1)
      const label = new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-GB', {
        month: 'short',
      }).format(date)
      const amount = payments
        .filter((p) => {
          const d = new Date(p.payment_date)
          return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth()
        })
        .reduce((sum, p) => sum + Number(p.amount || 0), 0)
      months.push({ label, amount })
    }

    const weekStart = startOfWeek(now)
    const weeks: ChartPoint[] = []
    for (let i = 7; i >= 0; i -= 1) {
      const start = new Date(weekStart)
      start.setDate(start.getDate() - (i + offset) * 7)
      const end = new Date(start)
      end.setDate(end.getDate() + 7)
      const label = new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-GB', {
        day: 'numeric',
        month: 'short',
      }).format(start)
      const amount = payments
        .filter((p) => {
          const d = new Date(p.payment_date)
          return d >= start && d < end
        })
        .reduce((sum, p) => sum + Number(p.amount || 0), 0)
      weeks.push({ label, amount })
    }

    const upcoming = active
      .filter((p) => p.due_date)
      .map((p) => ({
        project: p,
        hoursLeft: (new Date(`${p.due_date}T23:59`).getTime() - Date.now()) / 3_600_000,
      }))
      .filter((item) => item.hoursLeft > 0)
      .sort((a, b) => a.hoursLeft - b.hoursLeft)
      .slice(0, 5)

    return { totalReceived, pending, active, monthly, months, weeks, upcoming }
  }, [projects, payments, lang, offset])

  const cards = [
    { label: t('dashboard.monthlyRevenue'), value: formatCurrency(stats.monthly, currency, lang), icon: DollarSign },
    { label: t('dashboard.pending'), value: formatCurrency(stats.pending, currency, lang), icon: TrendingUp },
    { label: t('dashboard.activeProjects'), value: String(stats.active.length), icon: Briefcase },
    { label: t('dashboard.totalClients'), value: String(clients.length), icon: Users },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">
          {t('dashboard.welcome')}, {profile?.full_name || profile?.email}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <h3 className="mt-1 text-2xl font-bold">{loading ? '—' : card.value}</h3>
              </div>
              <card.icon className="h-7 w-7 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">{t('dashboard.revenueChart')}</h3>
            {can('analytics') && (
              <div className="flex items-center gap-2">
                <div className="flex rounded-md border p-0.5 text-xs font-medium">
                  {(['month', 'week'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setRange(option)
                        setOffset(0)
                      }}
                      className={`rounded px-3 py-1 transition-colors ${
                        range === option
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {t(`dashboard.${option}`)}
                    </button>
                  ))}
                </div>
                <div className="flex items-center rounded-md border">
                  <button
                    type="button"
                    title={t('common.previous')}
                    onClick={() => setOffset((o) => o + 1)}
                    className="rounded-l-md p-1.5 text-muted-foreground hover:bg-accent"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title={t('common.next')}
                    onClick={() => setOffset((o) => Math.max(0, o - 1))}
                    disabled={offset === 0}
                    className="rounded-r-md border-l p-1.5 text-muted-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
          {can('analytics') ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={range === 'week' ? stats.weeks : stats.months}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} width={60} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                    }}
                    formatter={(value) => formatCurrency(Number(value ?? 0), currency, lang)}
                  />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-center">
              <Lock className="h-6 w-6 text-muted-foreground" />
              <p className="max-w-xs text-sm text-muted-foreground">
                {t('dashboard.analyticsLocked')}
              </p>
              <Link
                to="/upgrade"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                {t('common.upgradeNow')}
              </Link>
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Clock className="h-4 w-4" />
            {t('dashboard.upcomingDeadlines')}
          </h3>
          {loading ? (
            <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
          ) : stats.upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('notify.none')}</p>
          ) : (
            <ul className="space-y-3">
              {stats.upcoming.map(({ project, hoursLeft }) => (
                <li key={project.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium">{project.title}</span>
                  <span className={urgencyClass(getUrgency(hoursLeft))}>
                    {describeTimeLeft(hoursLeft, lang === 'bn')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">{t('dashboard.activeProjectsTitle')}</h3>
          {stats.active.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('dashboard.noActive')}</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {stats.active.slice(0, 6).map((p) => (
                <li key={p.id} className="flex justify-between gap-3">
                  <span className="truncate">{p.title}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(p.amount, currency, lang)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">{t('dashboard.recentProjects')}</h3>
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('dashboard.noRecent')}</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {projects.slice(0, 6).map((p) => (
                <li key={p.id} className="flex justify-between gap-3">
                  <span className="truncate">{p.title}</span>
                  <span className="text-muted-foreground">{p.clients?.name ?? '—'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {t('common.welcome')}, {profile?.email}
      </p>
    </div>
  )
}

function urgencyClass(urgency: string): string {
  switch (urgency) {
    case 'overdue':
      return 'rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-500'
    case 'urgent':
      return 'rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-600'
    case 'soon':
      return 'rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600'
    default:
      return 'rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground'
  }
}
