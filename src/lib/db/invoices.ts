import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { paymentSummary, type Invoice, type InvoiceRow, type PaymentSummary } from '@/lib/invoices'

export type { Invoice, InvoiceRow, InvoiceStatus } from '@/lib/invoices'
export type { PaymentSummary } from '@/lib/invoices'
export { INVOICE_STATUS_META, formatMoney, isOverdue, paymentSummary, PAYMENT_GATED_ACTIONS } from '@/lib/invoices'

// Payment position for one application, read with the service role so the CB
// (which can't see invoices through RLS) gets the same answer as the operator.
export async function getPaymentSummary(applicationId: string): Promise<PaymentSummary> {
  const { data } = await createAdminClient().from('invoices').select('status, amount, currency').eq('application_id', applicationId)
  return paymentSummary((data ?? []) as Pick<Invoice, 'status' | 'amount' | 'currency'>[])
}

const COLS = 'id, invoice_number, application_id, applicant_id, programme, description, amount, currency, status, issued_at, due_at, paid_at, created_at'

// Invoices for one application (staff; the applicant reads only their own via RLS).
export async function listInvoicesForApplication(applicationId: string): Promise<Invoice[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('invoices').select(COLS).eq('application_id', applicationId).order('issued_at', { ascending: false })
  if (error) { console.error('listInvoicesForApplication:', error.message); return [] }
  return (data ?? []) as Invoice[]
}

// The signed-in applicant's own invoices (RLS returns only theirs).
export async function myInvoices(): Promise<Invoice[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('invoices').select(COLS).order('issued_at', { ascending: false })
  if (error) { console.error('myInvoices:', error.message); return [] }
  return (data ?? []) as Invoice[]
}

// All invoices with applicant name/email (operator tracking page).
export async function listAllInvoices(): Promise<InvoiceRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('invoices')
    .select(`${COLS}, applicant:users!applicant_id(name_en, email)`)
    .order('issued_at', { ascending: false })
  if (error) { console.error('listAllInvoices:', error.message); return [] }
  return (data ?? []).map((r) => {
    const rec = r as Record<string, unknown>
    const applicant = Array.isArray(rec.applicant) ? rec.applicant[0] : rec.applicant
    const a = applicant as { name_en?: string; email?: string } | undefined
    return { ...(rec as unknown as Invoice), applicant_name: a?.name_en ?? null, applicant_email: a?.email ?? null }
  })
}
