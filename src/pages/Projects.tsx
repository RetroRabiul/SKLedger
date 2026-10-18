import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Pencil, Plus, Search, Trash2, Wallet, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import ProjectFormModal from '../components/projects/ProjectFormModal'
import PaymentModal from '../components/projects/PaymentModal'
import InvoiceModal from '../components/projects/InvoiceModal'
import { deleteProject, getProjects, updateProject } from '../services/projects'
import { getAllPayments } from '../services/payments'
import { getClients } from '../services/clients'
import type { Client, Payment, Project, ProjectStatus } from '../types'
import { useI18n } from '../hooks/useI18n'
import { useProfile } from '../hooks/useProfile'
import { formatCurrency } from '../utils/format'
import { describeTimeLeft, getUrgency } from '../lib/deadlineNotifications'

const STATUS_TABS: (ProjectStatus | 'all')[] = [
  'all',
  'active',
  'in_progress',
  'completed',
  'on_hold',
  'cancelled',
]

export default function Projects() {
  const { t, lang } = useI18n()
  const { checkLimit, currency, refresh } = useProfile()
  const limit = checkLimit('projects')

  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<ProjectStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [payFor, setPayFor] = useState<Project | null>(null)
  const [invoiceFor, setInvoiceFor] = useState<Project | null>(null)

  const load = () => {
    setLoading(true)
    Promise.all([getProjects(), getClients(), getAllPayments()])
      .then(([p, c, pay]) => {
        setProjects(p)
        setClients(c)
        setPayments(pay)
      })
      .catch((error) => toast.error((error as Error).message ?? t('common.error')))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openNew = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleDelete = async (project: Project) => {
    if (!window.confirm(t('projects.deleteConfirm'))) return
    try {
      await deleteProject(project.id)
      toast.success(t('toast.projectDeleted'))
      load()
      void refresh()
    } catch (error) {
      toast.error((error as Error).message ?? t('common.error'))
    }
  }

  const handleComplete = async (project: Project) => {
    try {
      await updateProject(project.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      toast.success(t('toast.projectUpdated'))
      load()
    } catch (error) {
      toast.error((error as Error).message ?? t('common.error'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('projects.title')}</h1>
          <p className="text-muted-foreground">{t('projects.subtitle')}</p>
        </div>
        {limit.canAdd ? (
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {t('projects.add')}
          </button>
        ) : (
          <Link
            to="/upgrade"
            className="inline-flex items-center gap-2 rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-accent"
          >
            {t('common.upgradeNow')}
          </Link>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                tab === s ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent'
              }`}
            >
              {s === 'all' ? t('common.all') : t(`status.${s}`)}
            </button>
          ))}
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <p className="text-xs text-muted-foreground">
            {limit.current} {t('common.of')} {limit.limit} {t('projects.usage')}
          </p>
          <div className="relative w-full sm:w-auto">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('common.search')}
              className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm sm:w-48"
            />
          </div>
        </div>
      </div>

      {!limit.canAdd && (
        <div className="rounded-xl border border-primary/40 bg-primary/5 p-3 text-sm">
          <span className="font-medium">{t('projects.limitTitle')}. </span>
          {t('projects.limitBody', { limit: limit.limit })}
        </div>
      )}

      {loading ? (
        <p className="p-6 text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground shadow-sm">
          {t('projects.empty')}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects
            .filter((p) => (tab === 'all' ? true : p.status === tab))
            .filter((p) => {
              const q = search.trim().toLowerCase()
              return (
                !q ||
                [p.title, p.clients?.name, p.category].some((v) => v?.toLowerCase().includes(q))
              )
            })
            .map((p) => {
              const paid = payments
                .filter((x) => x.project_id === p.id)
                .reduce((s, x) => s + Number(x.amount || 0), 0) + Number(p.advance_payment || 0)
              const balance = Math.max(0, Number(p.amount || 0) - paid)
              const hoursLeft = p.due_date
                ? (new Date(`${p.due_date}T23:59`).getTime() - Date.now()) / 3_600_000
                : null
              return (
                <div key={p.id} className="flex flex-col rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{p.title}</h3>
                      <p className="text-xs text-muted-foreground">{p.clients?.name ?? '—'}</p>
                    </div>
                    <span className={statusClass(p.status)}>{t(`status.${p.status}`)}</span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">{t('projects.amount')}</span>
                    <span className="text-right font-medium">
                      {formatCurrency(p.amount, currency, lang)}
                    </span>
                    <span className="text-muted-foreground">{t('invoice.paid')}</span>
                    <span className="text-right">{formatCurrency(paid, currency, lang)}</span>
                    <span className="text-muted-foreground">{t('projects.balance')}</span>
                    <span className="text-right font-medium">{formatCurrency(balance, currency, lang)}</span>
                  </div>

                  {p.due_date && hoursLeft !== null && (
                    <p className="mt-2 text-xs">
                      <span className="text-muted-foreground">{t('common.dueDate')}: </span>
                      <span className={urgencyText(getUrgency(hoursLeft))}>
                        {describeTimeLeft(hoursLeft, lang === 'bn')}
                      </span>
                    </p>
                  )}

                  {p.services.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {p.services.filter((s) => s.completed).length}/{p.services.length}{' '}
                      {t('projects.services')}
                    </div>
                  )}

                  <div className="mt-auto flex flex-wrap gap-1 pt-3">
                    <button
                      onClick={() => setPayFor(p)}
                      className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs hover:bg-accent"
                    >
                      <Wallet className="h-3.5 w-3.5" />
                      {t('payments.title')}
                    </button>
                    <button
                      onClick={() => setInvoiceFor(p)}
                      className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs hover:bg-accent"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {t('projects.viewInvoice')}
                    </button>
                    {p.status !== 'completed' && (
                      <button
                        onClick={() => handleComplete(p)}
                        className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs hover:bg-accent"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t('projects.markComplete')}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditing(p)
                        setFormOpen(true)
                      }}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
        </div>
      )}

      <ProjectFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        project={editing}
        clients={clients}
        onSaved={() => {
          load()
          void refresh()
        }}
      />
      <PaymentModal
        open={!!payFor}
        onClose={() => setPayFor(null)}
        project={payFor}
        onChanged={load}
      />
      <InvoiceModal
        open={!!invoiceFor}
        onClose={() => setInvoiceFor(null)}
        project={invoiceFor}
        payments={payments}
      />
    </div>
  )
}

function statusClass(status: ProjectStatus): string {
  const map: Record<ProjectStatus, string> = {
    active: 'rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-500',
    in_progress: 'rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-600',
    completed: 'rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600',
    cancelled: 'rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-500',
    on_hold: 'rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground',
  }
  return map[status]
}

function urgencyText(urgency: string): string {
  switch (urgency) {
    case 'overdue':
      return 'font-semibold text-red-500'
    case 'urgent':
      return 'font-semibold text-amber-600'
    case 'soon':
      return 'font-medium text-amber-600'
    default:
      return 'text-muted-foreground'
  }
}
