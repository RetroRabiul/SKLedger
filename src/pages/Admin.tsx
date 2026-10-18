import { useEffect, useMemo, useState } from 'react'
import { Check, ExternalLink, Plus, Trash2, Users, Wallet, Clock, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  adminSetPlan,
  listSubscriptions,
  listUsers,
  reviewSubscription,
  type AdminSubscriptionRow,
} from '../services/admin'
import { getAppSettings, savePaymentDetails } from '../services/appSettings'
import { PLAN_ORDER } from '../config/plans'
import type { AdminUserRow, PaymentChannel, PlanId } from '../types'
import { getProofUrl } from '../services/subscriptions'
import { useI18n } from '../hooks/useI18n'
import { useProfile } from '../hooks/useProfile'
import { formatCurrency, formatDate } from '../utils/format'

const DURATIONS = [30, 90, 180, 365, 0]

export default function Admin() {
  const { t, lang } = useI18n()
  const { currency, refresh } = useProfile()
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [subs, setSubs] = useState<AdminSubscriptionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [methods, setMethods] = useState<PaymentChannel[]>([])
  const [note, setNote] = useState('')
  const [savingPayment, setSavingPayment] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, { plan: PlanId; days: number }>>({})

  const load = () => {
    setLoading(true)
    Promise.all([listUsers(), listSubscriptions(), getAppSettings()])
      .then(([u, s, app]) => {
        setUsers(u)
        setSubs(s)
        setMethods(app?.payment_methods ?? [])
        setNote(app?.payment_note ?? '')
      })
      .catch((error) => toast.error((error as Error).message ?? t('common.error')))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stats = useMemo(() => {
    const approved = subs.filter((s) => s.status === 'approved')
    const revenue = approved.reduce((sum, s) => sum + Number(s.amount || 0), 0)
    const pending = subs.filter((s) => s.status === 'pending')
    const paidUsers = new Set(approved.map((s) => s.user_id)).size
    return { revenue, pending, paidUsers }
  }, [subs])

  const handlePlanChange = async (userId: string, plan: PlanId, days: number) => {
    try {
      await adminSetPlan(userId, plan, days)
      toast.success(t('toast.planUpdated'))
      setDrafts((prev) => {
        const next = { ...prev }
        delete next[userId]
        return next
      })
      load()
    } catch (error) {
      toast.error((error as Error).message ?? t('common.error'))
    }
  }

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await reviewSubscription(id, status)
      toast.success(t('toast.planUpdated'))
      load()
      void refresh()
    } catch (error) {
      toast.error((error as Error).message ?? t('common.error'))
    }
  }

  const handleOpenProof = async (reference: string) => {
    try {
      const url = await getProofUrl(reference)
      window.open(url, '_blank', 'noopener')
    } catch (error) {
      toast.error((error as Error).message ?? t('common.error'))
    }
  }

  const addMethod = () =>
    setMethods((prev) => [...prev, { id: crypto.randomUUID(), label: '', value: '' }])

  const updateMethod = (id: string, key: 'label' | 'value', value: string) =>
    setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, [key]: value } : m)))

  const removeMethod = (id: string) =>
    setMethods((prev) => prev.filter((m) => m.id !== id))

  const handleSavePayment = async () => {
    setSavingPayment(true)
    try {
      const cleaned = methods.filter((m) => m.label.trim() || m.value.trim())
      await savePaymentDetails(cleaned, note.trim() || null)
      toast.success(t('toast.saved'))
      load()
    } catch (error) {
      toast.error((error as Error).message ?? t('common.error'))
    } finally {
      setSavingPayment(false)
    }
  }

  const cards = [
    { label: t('admin.totalUsers'), value: String(users.length), icon: Users },
    { label: t('admin.paidUsers'), value: String(stats.paidUsers), icon: Wallet },
    { label: t('admin.revenue'), value: formatCurrency(stats.revenue, currency, lang), icon: Wallet },
    { label: t('admin.pendingRequests'), value: String(stats.pending.length), icon: Clock },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.title')}</h1>
        <p className="text-muted-foreground">{t('admin.subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-1 text-2xl font-bold">{loading ? '—' : card.value}</p>
              </div>
              <card.icon className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>

      {/* Upgrade requests */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t('admin.requests')}</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : stats.pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('admin.noRequests')}</p>
        ) : (
          <div className="space-y-3">
            {stats.pending.map((s) => (
              <div key={s.id} className="rounded-lg border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{s.profiles?.email ?? s.user_id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('admin.requestedPlan')}: {t(`plan.${s.plan}`)} ·{' '}
                      {formatCurrency(s.amount, s.currency, lang)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('admin.method')}: {s.method ?? '—'} · {t('admin.txnId')}:{' '}
                      {s.transaction_id ?? '—'}
                    </p>
                    {s.proof_url && (
                      <button
                        onClick={() => handleOpenProof(s.proof_url as string)}
                        className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {t('admin.viewProof')}
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReview(s.id, 'approved')}
                      className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
                    >
                      <Check className="h-3.5 w-3.5" />
                      {t('admin.approve')}
                    </button>
                    <button
                      onClick={() => handleReview(s.id, 'rejected')}
                      className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs hover:bg-accent"
                    >
                      <X className="h-3.5 w-3.5" />
                      {t('admin.reject')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Payment details shown on the upgrade page */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t('admin.paymentDetails')}</h2>
        <div className="space-y-4 rounded-lg border bg-card p-5">
          <p className="text-xs text-muted-foreground">{t('admin.paymentDetailsHint')}</p>

          <div className="space-y-2">
            {methods.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center gap-2">
                <input
                  value={m.label}
                  onChange={(e) => updateMethod(m.id, 'label', e.target.value)}
                  placeholder={t('admin.methodLabel')}
                  className="w-40 rounded-md border bg-background px-3 py-2 text-sm"
                />
                <input
                  value={m.value}
                  onChange={(e) => updateMethod(m.id, 'value', e.target.value)}
                  placeholder={t('admin.methodValue')}
                  className="min-w-[12rem] flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                />
                <button
                  onClick={() => removeMethod(m.id)}
                  className="rounded-md border p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label={t('common.delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addMethod}
              className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
            >
              <Plus className="h-4 w-4" />
              {t('admin.addMethod')}
            </button>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              {t('admin.paymentNote')}
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder={t('admin.paymentNotePlaceholder')}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </label>

          <button
            onClick={() => void handleSavePayment()}
            disabled={savingPayment}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {t('common.save')}
          </button>
        </div>
      </section>

      {/* Users */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t('admin.usersTitle')}</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2">{t('admin.user')}</th>
                <th className="px-4 py-2">{t('admin.role')}</th>
                <th className="px-4 py-2">{t('admin.plan')}</th>
                <th className="px-4 py-2">{t('admin.revenue')}</th>
                <th className="px-4 py-2">{t('admin.joined')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const draft = drafts[u.id] ?? { plan: u.plan, days: 30 }
                return (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-2">
                    <p className="font-medium">{u.full_name ?? u.email}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="px-4 py-2">
                    {u.role === 'admin' ? (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                        {t('admin.adminBadge')}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">user</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <select
                        value={draft.plan}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [u.id]: { ...draft, plan: e.target.value as PlanId },
                          }))
                        }
                        className="rounded-md border bg-background px-2 py-1 text-xs"
                      >
                        {PLAN_ORDER.map((p) => (
                          <option key={p} value={p}>
                            {t(`plan.${p}`)}
                          </option>
                        ))}
                      </select>
                      {draft.plan !== 'free' && (
                        <select
                          value={draft.days}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [u.id]: { ...draft, days: Number(e.target.value) },
                            }))
                          }
                          className="rounded-md border bg-background px-2 py-1 text-xs"
                        >
                          {DURATIONS.map((d) => (
                            <option key={d} value={d}>
                              {d === 0 ? t('admin.dLifetime') : t('admin.dDays', { n: d })}
                            </option>
                          ))}
                        </select>
                      )}
                      <button
                        onClick={() => void handlePlanChange(u.id, draft.plan, draft.days)}
                        className="rounded-md border px-2 py-1 text-xs hover:bg-accent"
                      >
                        {t('admin.apply')}
                      </button>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {t('admin.expires')}:{' '}
                      {u.plan === 'free'
                        ? '—'
                        : u.plan_expires_at
                          ? formatDate(u.plan_expires_at, lang)
                          : t('admin.noExpiry')}
                    </p>
                  </td>
                  <td className="px-4 py-2">{formatCurrency(u.revenue, currency, lang)}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">
                    {formatDate(u.created_at, lang)}
                  </td>
                </tr>
                )
              })}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                    {t('admin.noUsers')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
