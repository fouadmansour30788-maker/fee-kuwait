'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { InvoiceStatus } from '@/lib/invoices'

const STATUSES: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue', 'cancelled']

async function requireOperator() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' as const }
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!me || !['admin', 'super_admin'].includes(me.role)) return { error: 'Not allowed' as const }
  return { ok: true as const, userId: user.id }
}

function invoiceNumber(): string {
  const rand = crypto.randomUUID().replace(/[^a-z0-9]/gi, '').slice(0, 5).toUpperCase()
  return `INV-${new Date().getFullYear()}-${rand}`
}

// Operator raises an invoice against an application.
export async function createInvoice(input: {
  applicationId: string
  amount: number
  description?: string
  dueAt?: string | null
}): Promise<{ ok?: true; error?: string }> {
  const gate = await requireOperator()
  if (gate.error) return { error: gate.error }
  const amount = Number(input.amount)
  if (!Number.isFinite(amount) || amount < 0) return { error: 'Enter a valid amount.' }

  const supabase = createClient()
  const { data: app } = await supabase.from('applications').select('applicant_id, programme').eq('id', input.applicationId).single()
  if (!app) return { error: 'Application not found.' }

  const { error } = await supabase.from('invoices').insert({
    invoice_number: invoiceNumber(),
    application_id: input.applicationId,
    applicant_id: app.applicant_id,
    programme: app.programme,
    description: input.description?.trim() || null,
    amount,
    currency: 'KWD',
    status: 'draft',
    due_at: input.dueAt || null,
    created_by: gate.userId,
  })
  if (error) return { error: error.message }

  revalidatePath(`/applications/${input.applicationId}`)
  revalidatePath('/invoices')
  return { ok: true }
}

// Operator changes an invoice status. Marking 'paid' stamps paid_at.
export async function setInvoiceStatus(id: string, status: string): Promise<{ ok?: true; error?: string }> {
  if (!STATUSES.includes(status as InvoiceStatus)) return { error: 'Invalid status' }
  const gate = await requireOperator()
  if (gate.error) return { error: gate.error }

  const supabase = createClient()
  const { error } = await supabase.from('invoices').update({
    status,
    paid_at: status === 'paid' ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/invoices')
  revalidatePath('/applications')
  return { ok: true }
}

export async function deleteInvoice(id: string): Promise<{ ok?: true; error?: string }> {
  const gate = await requireOperator()
  if (gate.error) return { error: gate.error }
  const supabase = createClient()
  const { error } = await supabase.from('invoices').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/invoices')
  return { ok: true }
}
