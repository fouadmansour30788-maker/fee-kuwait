import { Receipt } from 'lucide-react'
import { INVOICE_STATUS_META, formatMoney, isOverdue, type Invoice } from '@/lib/invoices'

// Read-only invoices list for the establishment's own view of an application.
export default function InvoicesReadonly({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) return null
  const outstanding = invoices.filter((i) => i.status !== 'paid' && i.status !== 'cancelled').reduce((s, i) => s + Number(i.amount), 0)

  return (
    <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
      <div className="flex items-center gap-2 mb-1">
        <Receipt className="w-4 h-4" style={{ color: '#40916C' }} />
        <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Fees &amp; invoices</h2>
      </div>
      <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>
        {outstanding > 0 ? `Outstanding balance: ${formatMoney(outstanding)}` : 'All invoices settled.'}
      </p>
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
            </div>
          )
        })}
      </div>
    </div>
  )
}
