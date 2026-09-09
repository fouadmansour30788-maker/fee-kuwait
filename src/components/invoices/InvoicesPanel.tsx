'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Receipt, Plus, Loader2, AlertCircle, Trash2 } from 'lucide-react'
import { createInvoice, setInvoiceStatus, deleteInvoice } from '@/lib/actions/invoices'
import { INVOICE_STATUS_META, formatMoney, isOverdue, type Invoice, type InvoiceStatus } from '@/lib/invoices'

const NEXT_STATUS: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue', 'cancelled']

export default function InvoicesPanel({ applicationId, invoices }: { applicationId: string; invoices: Invoice[] }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [due, setDue] = useState('')
  const router = useRouter()

  const run = (fn: () => Promise<{ error?: string }>) => { setError(''); start(async () => { const r = await fn(); if (r.error) setError(r.error); else router.refresh() }) }

  function add(e: React.FormEvent) {
    e.preventDefault()
    run(async () => {
      const r = await createInvoice({ applicationId, amount: Number(amount), description: desc, dueAt: due || null })
      if (!r.error) { setAmount(''); setDesc(''); setDue(''); setOpen(false) }
      return r
    })
  }

  const total = invoices.filter((i) => i.status !== 'cancelled').reduce((s, i) => s + Number(i.amount), 0)
  const paid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0)

  const field = { border: '1px solid #E2E8F0', color: '#1E293B' } as const

  return (
    <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
      <div className="flex items-center gap-2 mb-1">
        <Receipt className="w-4 h-4" style={{ color: '#40916C' }} />
        <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Fees &amp; invoices</h2>
        <div className="flex-1" />
        <button onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
          <Plus className="w-3.5 h-3.5" /> New invoice
        </button>
      </div>
      <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>
        Billed {formatMoney(total)} · paid {formatMoney(paid)}{total > paid ? ` · outstanding ${formatMoney(total - paid)}` : ''}
      </p>

      {open && (
        <form onSubmit={add} className="grid sm:grid-cols-4 gap-3 items-end rounded-xl p-4 mb-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <div>
            <label className="block text-[11px] font-semibold mb-1" style={{ color: '#475569' }}>Amount (KWD)</label>
            <input type="number" step="0.001" min="0" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.000" className="w-full text-sm px-3 py-2 rounded-lg outline-none" style={field} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold mb-1" style={{ color: '#475569' }}>Description</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. Green Key certification fee 2026" className="w-full text-sm px-3 py-2 rounded-lg outline-none" style={field} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-1" style={{ color: '#475569' }}>Due date</label>
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg outline-none" style={field} />
          </div>
          <div className="sm:col-span-4">
            <button type="submit" disabled={pending} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
              {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create invoice
            </button>
          </div>
        </form>
      )}

      {error && <p className="flex items-center gap-1.5 text-sm mb-3" style={{ color: '#DC2626' }}><AlertCircle className="w-4 h-4" /> {error}</p>}

      {invoices.length > 0 ? (
        <div className="space-y-2">
          {invoices.map((inv) => {
            const overdue = isOverdue(inv)
            const meta = overdue ? INVOICE_STATUS_META.overdue : INVOICE_STATUS_META[inv.status]
            return (
              <div key={inv.id} className="flex flex-wrap items-center gap-3 rounded-xl border p-3" style={{ borderColor: '#E2E8F0' }}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold" style={{ color: '#334155' }}>{inv.invoice_number}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                  </div>
                  {inv.description && <p className="text-xs mt-0.5 truncate" style={{ color: '#64748B' }}>{inv.description}</p>}
                  {inv.due_at && <p className="text-[11px] mt-0.5" style={{ color: overdue ? '#B91C1C' : '#94A3B8' }}>Due {new Date(inv.due_at).toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait' })}</p>}
                </div>
                <span className="font-bold text-sm" style={{ color: '#0F172A' }}>{formatMoney(inv.amount, inv.currency)}</span>
                <select value={inv.status} onChange={(e) => run(() => setInvoiceStatus(inv.id, e.target.value))} disabled={pending}
                  className="text-xs px-2.5 py-1.5 rounded-lg outline-none bg-white disabled:opacity-60" style={field}>
                  {NEXT_STATUS.map((s) => <option key={s} value={s}>{INVOICE_STATUS_META[s].label}</option>)}
                </select>
                <button onClick={() => { if (window.confirm('Delete this invoice?')) run(() => deleteInvoice(inv.id)) }} disabled={pending} className="p-1.5 rounded-lg" style={{ color: '#DC2626' }} title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-xs" style={{ color: '#94A3B8' }}>No invoices for this application yet.</p>
      )}
    </div>
  )
}
