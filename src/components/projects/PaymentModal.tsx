import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Modal from '../ui/Modal'
import { createPayment, deletePayment, getPayments } from '../../services/payments'
import type { Payment, PaymentMethod, Project } from '../../types'
import { useI18n } from '../../hooks/useI18n'
import { useProfile } from '../../hooks/useProfile'
import { formatCurrency, formatDate, todayInput } from '../../utils/format'

interface Props {
  open: boolean
  onClose: () => void
  project: Project | null
  onChanged: () => void
}

const METHODS: PaymentMethod[] = ['bKash', 'Nagad', 'Rocket', 'Bank Transfer', 'Cash', 'Card', 'Other']

export default function PaymentModal({ open, onClose, project, onChanged }: Props) {
  const { t, lang } = useI18n()
  const { currency } = useProfile()
  const [payments, setPayments] = useState<Payment[]>([])
  const [amount, setAmount] = useState('0')
  const [method, setMethod] = useState<PaymentMethod>('bKash')
  const [date, setDate] = useState(todayInput())
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    if (!project) return
    getPayments(project.id)
      .then(setPayments)
      .catch((error) => console.error(error))
  }

  useEffect(() => {
    if (open && project) {
      setAmount('0')
      setMethod('bKash')
      setDate(todayInput())
      setNotes('')
      load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, project])

  const handleAdd = async () => {
    if (!project) return
    setSaving(true)
    try {
      await createPayment({
        project_id: project.id,
        amount: Number(amount) || 0,
        method,
        payment_date: date,
        notes: notes.trim() || null,
      })
      toast.success(t('toast.paymentAdded'))
      setAmount('0')
      setNotes('')
      load()
      onChanged()
    } catch (error) {
      toast.error((error as Error).message ?? t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('payments.deleteConfirm'))) return
    try {
      await deletePayment(id)
      toast.success(t('toast.paymentDeleted'))
      load()
      onChanged()
    } catch (error) {
      toast.error((error as Error).message ?? t('common.error'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${t('payments.title')} — ${project?.title ?? ''}`}
      footer={
        <button onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">
          {t('common.close')}
        </button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              {t('payments.amount')}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              {t('payments.method')}
            </span>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              {t('payments.date')}
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              {t('common.notes')}
            </span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>
        <button
          onClick={handleAdd}
          disabled={saving}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {t('payments.add')}
        </button>

        <div className="space-y-2 border-t pt-3">
          {payments.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">{t('payments.none')}</p>
          ) : (
            payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <span className="text-muted-foreground">{formatDate(p.payment_date, lang)}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{p.method}</span>
                <span className="ml-auto font-medium">
                  {formatCurrency(p.amount, currency, lang)}
                </span>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  )
}
