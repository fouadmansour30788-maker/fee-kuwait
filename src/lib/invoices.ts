// Client-safe invoice types & helpers (no server imports).

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export interface Invoice {
  id: string
  invoice_number: string
  application_id: string | null
  applicant_id: string | null
  programme: string | null
  description: string | null
  amount: number
  currency: string
  status: InvoiceStatus
  issued_at: string
  due_at: string | null
  paid_at: string | null
  created_at: string
}

export interface InvoiceRow extends Invoice {
  applicant_name: string | null
  applicant_email: string | null
}

export const INVOICE_STATUS_META: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  draft:     { label: 'Draft',     color: '#64748B', bg: '#F1F5F9' },
  sent:      { label: 'Sent',      color: '#1D4ED8', bg: '#DBEAFE' },
  paid:      { label: 'Paid',      color: '#047857', bg: '#DCFCE7' },
  overdue:   { label: 'Overdue',   color: '#B91C1C', bg: '#FEE2E2' },
  cancelled: { label: 'Cancelled', color: '#92400E', bg: '#FEF3C7' },
}

// KWD (and other Gulf currencies) use 3 decimal places (fils).
export function formatMoney(amount: number, currency = 'KWD'): string {
  const decimals = currency === 'KWD' || currency === 'BHD' || currency === 'OMR' ? 3 : 2
  return `${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} ${currency}`
}

// An invoice is effectively overdue if it's sent, past its due date, and unpaid.
export function isOverdue(inv: { status: InvoiceStatus; due_at: string | null }): boolean {
  return inv.status === 'sent' && !!inv.due_at && new Date(inv.due_at).getTime() < Date.now()
}
