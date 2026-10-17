import type { Client, Payment, Project } from '../types'

export function downloadFile(filename: string, content: string, mime = 'text/plain'): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  const text = String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push(headers.map((h) => csvCell(row[h])).join(','))
  }
  return lines.join('\r\n')
}

export function clientsCsv(clients: Client[]): string {
  return toCsv(
    clients.map((c) => ({
      name: c.name,
      email: c.email ?? '',
      phone: c.phone ?? '',
      company: c.company ?? '',
      notes: c.notes ?? '',
      created_at: c.created_at,
    }))
  )
}

export function projectsCsv(projects: Project[]): string {
  return toCsv(
    projects.map((p) => ({
      title: p.title,
      client: p.clients?.name ?? '',
      category: p.category ?? '',
      status: p.status,
      amount: p.amount,
      advance_payment: p.advance_payment,
      currency: p.currency,
      start_date: p.start_date ?? '',
      due_date: p.due_date ?? '',
      notes: p.notes ?? '',
      created_at: p.created_at,
    }))
  )
}

export interface Backup {
  version: 1
  exported_at: string
  clients: Client[]
  projects: Project[]
  payments: Payment[]
}

export function buildBackup(clients: Client[], projects: Project[], payments: Payment[]): string {
  const backup: Backup = {
    version: 1,
    exported_at: new Date().toISOString(),
    clients,
    projects,
    payments,
  }
  return JSON.stringify(backup, null, 2)
}

export function parseBackup(text: string): Backup {
  const parsed = JSON.parse(text) as Partial<Backup>
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid backup file')
  }
  return {
    version: 1,
    exported_at: parsed.exported_at ?? new Date().toISOString(),
    clients: Array.isArray(parsed.clients) ? parsed.clients : [],
    projects: Array.isArray(parsed.projects) ? parsed.projects : [],
    payments: Array.isArray(parsed.payments) ? parsed.payments : [],
  }
}
