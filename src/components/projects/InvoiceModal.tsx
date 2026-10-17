import { Printer } from 'lucide-react'
import Modal from '../ui/Modal'
import type { Payment, Project } from '../../types'
import { useI18n } from '../../hooks/useI18n'
import { useProfile } from '../../hooks/useProfile'
import { formatCurrency, formatDate } from '../../utils/format'

interface Props {
  open: boolean
  onClose: () => void
  project: Project | null
  payments: Payment[]
}

export default function InvoiceModal({ open, onClose, project, payments }: Props) {
  const { t, lang } = useI18n()
  const { currency, brandName } = useProfile()

  if (!project) return null

  const extra = payments
    .filter((p) => p.project_id === project.id)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const paid = Number(project.advance_payment || 0) + extra
  const balance = Math.max(0, Number(project.amount || 0) - paid)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('invoice.title')}
      wide
      footer={
        <>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Printer className="h-4 w-4" />
            {t('invoice.print')}
          </button>
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">
            {t('common.close')}
          </button>
        </>
      }
    >
      <div className="invoice-print-area space-y-6 text-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">{brandName}</h2>
            <p className="text-muted-foreground">SKLedger</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{t('invoice.title')}</p>
            <p className="text-muted-foreground">
              {t('invoice.date')}: {formatDate(project.created_at, lang)}
            </p>
            {project.due_date && (
              <p className="text-muted-foreground">
                {t('invoice.dueDate')}: {formatDate(project.due_date, lang)}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase text-muted-foreground">{t('invoice.to')}</p>
            <p className="font-medium">{project.clients?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">{t('common.status')}</p>
            <p className="font-medium">{t(`status.${project.status}`)}</p>
          </div>
        </div>

        <table className="w-full border-t">
          <thead>
            <tr className="text-left text-xs uppercase text-muted-foreground">
              <th className="py-2">{t('projects.titleLabel')}</th>
              <th className="py-2 text-right">{t('common.amount')}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="py-2">{project.title}</td>
              <td className="py-2 text-right">{formatCurrency(project.amount, currency, lang)}</td>
            </tr>
          </tbody>
        </table>

        <div className="ml-auto max-w-xs space-y-1 border-t pt-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('invoice.subtotal')}</span>
            <span>{formatCurrency(project.amount, currency, lang)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('invoice.paid')}</span>
            <span>{formatCurrency(paid, currency, lang)}</span>
          </div>
          <div className="flex justify-between border-t pt-1 font-semibold">
            <span>{t('invoice.due')}</span>
            <span>{formatCurrency(balance, currency, lang)}</span>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">{t('invoice.thankYou')}</p>
      </div>
    </Modal>
  )
}
