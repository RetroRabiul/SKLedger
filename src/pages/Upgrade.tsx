import { useEffect, useState } from 'react'
import { Check, Clock, Sparkles, Upload } from 'lucide-react'
import { toast } from 'sonner'
import Modal from '../components/ui/Modal'
import { PLANS } from '../config/plans'
import { getMySubscriptions, requestUpgrade, uploadProof } from '../services/subscriptions'
import type { PlanId, Subscription } from '../types'
import { useI18n } from '../hooks/useI18n'
import { useProfile } from '../hooks/useProfile'
import { formatCurrency, formatDate } from '../utils/format'

const METHODS = ['bKash', 'Nagad', 'Rocket', 'Bank Transfer']

export default function Upgrade() {
  const { t, lang } = useI18n()
  const { plan, profile } = useProfile()

  const [subs, setSubs] = useState<Subscription[]>([])
  const [target, setTarget] = useState<PlanId | null>(null)
  const [method, setMethod] = useState(METHODS[0])
  const [txnId, setTxnId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    getMySubscriptions()
      .then(setSubs)
      .catch((error) => console.error(error))
  }

  useEffect(() => {
    load()
  }, [])

  const pending = subs.find((s) => s.status === 'pending')

  const handleSubmit = async () => {
    if (!target) return
    setSubmitting(true)
    try {
      let proofUrl: string | null = null
      if (file) proofUrl = await uploadProof(file)
      await requestUpgrade({
        plan: target as 'pro' | 'business',
        amount: PLANS[target].priceBdt,
        currency: 'BDT',
        method,
        transaction_id: txnId.trim(),
        proof_url: proofUrl,
      })
      toast.success(t('upgrade.submitted'))
      setTarget(null)
      setTxnId('')
      setFile(null)
      load()
    } catch (error) {
      toast.error((error as Error).message ?? t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('upgrade.title')}</h1>
        <p className="text-muted-foreground">{t('upgrade.subtitle')}</p>
      </div>

      {pending && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700">
          <Clock className="h-4 w-4" />
          {t('upgrade.pendingNotice')}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {(['free', 'pro', 'business'] as PlanId[]).map((id) => {
          const def = PLANS[id]
          const isCurrent = plan === id
          return (
            <div
              key={id}
              className={`flex flex-col rounded-xl border p-6 ${
                isCurrent ? 'border-primary ring-1 ring-primary' : 'bg-card'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t(`plan.${id}`)}</h3>
                {isCurrent && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    {t('upgrade.currentPlan')}
                  </span>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold">
                ৳{def.priceBdt}
                <span className="text-sm font-normal text-muted-foreground">{t('plan.perMonth')}</span>
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
                <li>
                  {def.limits.clients} {t('plan.clients')} · {def.limits.projects} {t('plan.projects')}
                </li>
                <li>
                  {def.limits.exports} {t('plan.exports')}
                </li>
                {def.features.analytics && (
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-primary" />
                    {t('plan.feature.analytics')}
                  </li>
                )}
                {def.features.notifications && (
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-primary" />
                    {t('plan.feature.notifications')}
                  </li>
                )}
              </ul>
              {id !== 'free' && !isCurrent && (
                <button
                  onClick={() => setTarget(id)}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  <Sparkles className="h-4 w-4" />
                  {t('upgrade.choosePlan')}
                </button>
              )}
              {isCurrent && id !== 'business' && (
                <button
                  onClick={() => setTarget(id === 'free' ? 'pro' : 'business')}
                  className="mt-6 rounded-md border px-4 py-2 text-sm hover:bg-accent"
                >
                  {t('common.upgradeNow')}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <section className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">{t('upgrade.myPayments')}</h2>
        {subs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {subs.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 last:border-0">
                <span className="font-medium">{t(`plan.${s.plan}`)}</span>                <span className="text-muted-foreground">{s.method}</span>
                <span>{formatCurrency(s.amount, s.currency, lang)}</span>
                <span className="text-muted-foreground">{formatDate(s.created_at, lang)}</span>
                <span className={statusClass(s.status)}>{t(`status.${s.status}`)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-muted-foreground">{profile?.email}</p>
      </section>

      <Modal
        open={!!target}
        onClose={() => setTarget(null)}
        title={target ? `${t('upgrade.choosePlan')} — ${t(`plan.${target}`)}` : ''}
        footer={
          <>
            <button
              onClick={() => setTarget(null)}
              className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {t('upgrade.submit')}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          {target && (
            <p className="text-sm text-muted-foreground">
              {t('common.amount')}: <strong>৳{PLANS[target].priceBdt}</strong>
            </p>
          )}
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              {t('upgrade.method')}
            </span>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              {t('upgrade.txnId')}
            </span>
            <input
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              {t('upgrade.proof')}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-primary-foreground"
            />
          </label>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Upload className="h-3.5 w-3.5" />
            {t('upgrade.subtitle')}
          </p>
        </div>
      </Modal>
    </div>
  )
}

function statusClass(status: string): string {
  if (status === 'approved')
    return 'rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600'
  if (status === 'rejected')
    return 'rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-500'
  return 'rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-600'
}
