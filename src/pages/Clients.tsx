import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'
import Modal from '../components/ui/Modal'
import {
  createClient as createClientRow,
  deleteClient,
  getClients,
  updateClient,
} from '../services/clients'
import type { Client } from '../types'
import { useI18n } from '../hooks/useI18n'
import { useProfile } from '../hooks/useProfile'

type FormState = {
  name: string
  email: string
  phone: string
  company: string
  notes: string
}

const EMPTY_FORM: FormState = { name: '', email: '', phone: '', company: '', notes: '' }

export default function Clients() {
  const { t } = useI18n()
  const { checkLimit, refresh } = useProfile()
  const limit = checkLimit('clients')

  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getClients()
      .then(setClients)
      .catch((error) => toast.error(error.message ?? t('common.error')))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return clients
    return clients.filter((c) =>
      [c.name, c.email, c.phone, c.company].some((v) => v?.toLowerCase().includes(q))
    )
  }, [clients, search])

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (client: Client) => {
    setEditing(client)
    setForm({
      name: client.name,
      email: client.email ?? '',
      phone: client.phone ?? '',
      company: client.company ?? '',
      notes: client.notes ?? '',
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error(t('clients.nameRequired'))
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        company: form.company.trim() || null,
        notes: form.notes.trim() || null,
      }
      if (editing) {
        await updateClient(editing.id, payload)
        toast.success(t('toast.clientUpdated'))
      } else {
        await createClientRow(payload)
        toast.success(t('toast.clientAdded'))
      }
      setModalOpen(false)
      load()
      void refresh()
    } catch (error) {
      toast.error((error as Error).message ?? t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (client: Client) => {
    if (!window.confirm(t('clients.deleteConfirm'))) return
    try {
      await deleteClient(client.id)
      toast.success(t('toast.clientDeleted'))
      load()
      void refresh()
    } catch (error) {
      toast.error((error as Error).message ?? t('common.error'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('clients.title')}</h1>
          <p className="text-muted-foreground">{t('clients.subtitle')}</p>
        </div>
        {limit.canAdd ? (
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {t('clients.add')}
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
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search')}
            className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {limit.current} {t('common.of')} {limit.limit} {t('clients.usage')}
        </p>
      </div>

      {!limit.canAdd && (
        <div className="rounded-xl border border-primary/40 bg-primary/5 p-3 text-sm">
          <span className="font-medium">{t('clients.limitTitle')}. </span>
          {t('clients.limitBody', { limit: limit.limit })}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : filtered.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">{t('clients.empty')}</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">{t('common.name')}</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">{t('common.company')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr key={client.id} className="border-t transition-colors hover:bg-accent/40">
                  <td className="px-4 py-3">
                    <div className="font-medium">{client.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {[client.email, client.phone].filter(Boolean).join(' · ')}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {client.company ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(client)}
                      className="mr-1 rounded-md p-1.5 text-muted-foreground hover:bg-accent"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? t('clients.edit') : t('clients.new')}
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
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
          <Field label={t('common.name')} required>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('common.email')}>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </Field>
            <Field label={t('common.phone')}>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </Field>
          </div>
          <Field label={t('common.company')}>
            <input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </Field>
          <Field label={t('common.notes')}>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </Field>
        </div>
      </Modal>
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  )
}
