import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Modal from '../ui/Modal'
import { PROJECT_CATEGORIES, SERVICE_PRESETS } from '../../config/services'
import { createProject, updateProject, type ProjectInput } from '../../services/projects'
import type { Client, Project, ProjectStatus, ServiceItem } from '../../types'
import { useI18n } from '../../hooks/useI18n'
import { useProfile } from '../../hooks/useProfile'
import { todayInput } from '../../utils/format'

interface Props {
  open: boolean
  onClose: () => void
  project: Project | null
  clients: Client[]
  onSaved: () => void
}

const emptyService = (): ServiceItem => ({
  id: crypto.randomUUID(),
  name: '',
  completed: false,
})

const STATUSES: ProjectStatus[] = ['active', 'in_progress', 'completed', 'on_hold', 'cancelled']

export default function ProjectFormModal({ open, onClose, project, clients, onSaved }: Props) {
  const { t, lang } = useI18n()
  const { can, currency } = useProfile()

  const [title, setTitle] = useState('')
  const [clientId, setClientId] = useState('')
  const [category, setCategory] = useState(PROJECT_CATEGORIES[0])
  const [amount, setAmount] = useState('0')
  const [advance, setAdvance] = useState('0')
  const [status, setStatus] = useState<ProjectStatus>('active')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [services, setServices] = useState<ServiceItem[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (project) {
      setTitle(project.title)
      setClientId(project.client_id ?? '')
      setCategory(project.category ?? PROJECT_CATEGORIES[0])
      setAmount(String(project.amount ?? 0))
      setAdvance(String(project.advance_payment ?? 0))
      setStatus(project.status)
      setStartDate(project.start_date ?? '')
      setDueDate(project.due_date ?? '')
      setNotes(project.notes ?? '')
      setServices(project.services ?? [])
    } else {
      setTitle('')
      setClientId('')
      setCategory(PROJECT_CATEGORIES[0])
      setAmount('0')
      setAdvance('0')
      setStatus('active')
      setStartDate(todayInput())
      setDueDate('')
      setNotes('')
      setServices([])
    }
  }, [open, project])

  const applyPreset = (presetId: string) => {
    const preset = SERVICE_PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    setServices(
      preset.items.map((item) => ({
        id: crypto.randomUUID(),
        name: item[lang],
        completed: false,
      }))
    )
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error(t('projects.titleRequired'))
      return
    }
    setSaving(true)
    try {
      const payload: ProjectInput = {
        client_id: clientId || null,
        title: title.trim(),
        category,
        amount: Number(amount) || 0,
        advance_payment: Number(advance) || 0,
        currency,
        status,
        start_date: startDate || null,
        due_date: dueDate || null,
        services: services.filter((s) => s.name.trim()).map((s) => ({ ...s, name: s.name.trim() })),
        notes: notes.trim() || null,
      }
      if (project) {
        await updateProject(project.id, payload)
        toast.success(t('toast.projectUpdated'))
      } else {
        await createProject(payload)
        toast.success(t('toast.projectAdded'))
      }
      onSaved()
      onClose()
    } catch (error) {
      toast.error((error as Error).message ?? t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={project ? t('projects.edit') : t('projects.new')}
      wide
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {t('common.save')}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">
            {t('projects.titleLabel')} <span className="text-red-500">*</span>
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              {t('projects.selectClient')}
            </span>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">{t('projects.noClient')}</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              {t('common.category')}
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {PROJECT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              {t('projects.amount')}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              {t('projects.advance')}
            </span>
            <input
              type="number"
              value={advance}
              onChange={(e) => setAdvance(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              {t('common.status')}
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`status.${s}`)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              {t('common.startDate')}
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              {t('common.dueDate')}
            </span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="rounded-lg border p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{t('projects.services')}</span>
            {can('checklistPresets') ? (
              <select
                value=""
                onChange={(e) => applyPreset(e.target.value)}
                className="rounded-md border bg-background px-2 py-1 text-xs"
              >
                <option value="">{t('projects.applyPreset')}</option>
                {SERVICE_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label[lang]}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-muted-foreground">{t('projects.presetLocked')}</span>
            )}
          </div>

          <div className="space-y-2">
            {services.map((service, index) => (
              <div key={service.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={service.completed}
                  onChange={(e) =>
                    setServices((prev) =>
                      prev.map((s, i) => (i === index ? { ...s, completed: e.target.checked } : s))
                    )
                  }
                  className="h-4 w-4"
                />
                <input
                  value={service.name}
                  onChange={(e) =>
                    setServices((prev) =>
                      prev.map((s, i) => (i === index ? { ...s, name: e.target.value } : s))
                    )
                  }
                  placeholder={t('projects.servicePlaceholder')}
                  className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm"
                />
                <button
                  onClick={() => setServices((prev) => prev.filter((_, i) => i !== index))}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setServices((prev) => [...prev, emptyService()])}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              {t('projects.addService')}
            </button>
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">
            {t('common.notes')}
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>
      </div>
    </Modal>
  )
}
