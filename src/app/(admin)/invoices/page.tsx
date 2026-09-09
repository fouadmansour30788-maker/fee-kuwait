import Link from 'next/link'
import { Receipt, Inbox } from 'lucide-react'
import { listAllInvoices, INVOICE_STATUS_META, formatMoney, isOverdue } from '@/lib/db/invoices'
import { PROGRAMME_LABEL } from '@/lib/db/applications'

export const dynamic = 'force-dynamic'

export default async function InvoicesPage() {
  const invoices = await listAllInvoices()

  const active = invoices.filter((i) => i.status !== 'cancelled')
  const billed = active.reduce((s, i) => s + Number(i.amount), 0)
  const paid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0)
  const outstanding = billed - paid
  const overdueCount = invoices.filter((i) => isOverdue(i)).length

  const kpis = [
    { label: 'Billed', value: formatMoney(billed), color: '#0F172A' },
    { label: 'Paid', value: formatMoney(paid), color: '#047857' },
    { label: 'Outstanding', value: formatMoney(outstanding), color: '#B45309' },
    { label: 'Overdue', value: String(overdueCount), color: overdueCount ? '#B91C1C' : '#64748B' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#0F172A' }}>
          <Receipt className="w-6 h-6" style={{ color: '#40916C' }} /> Invoices
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Programme fees raised against applications. Manage each invoice from its application page.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border p-5" style={{ borderColor: '#E2E8F0' }}>
            <p className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{k.label}</p>
          </div>
        ))}
      </div>

      {invoices.length > 0 ? (
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {['Invoice', 'Applicant', 'Programme', 'Amount', 'Status', 'Issued', 'Due'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: '#94A3B8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#F1F5F9' }}>
                {invoices.map((inv) => {
                  const overdue = isOverdue(inv)
                  const meta = overdue ? INVOICE_STATUS_META.overdue : INVOICE_STATUS_META[inv.status]
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        {inv.application_id
                          ? <Link href={`/applications/${inv.application_id}`} className="font-mono text-xs font-semibold" style={{ color: '#40916C' }}>{inv.invoice_number}</Link>
                          : <span className="font-mono text-xs font-semibold" style={{ color: '#334155' }}>{inv.invoice_number}</span>}
                        {inv.description && <p className="text-[11px] mt-0.5 truncate max-w-[220px]" style={{ color: '#94A3B8' }}>{inv.description}</p>}
                      </td>
                      <td className="px-5 py-3" style={{ color: '#334155' }}>{inv.applicant_name || inv.applicant_email || '—'}</td>
                      <td className="px-5 py-3" style={{ color: '#334155' }}>{inv.programme ? (PROGRAMME_LABEL[inv.programme] ?? inv.programme) : '—'}</td>
                      <td className="px-5 py-3 font-semibold" style={{ color: '#0F172A' }}>{formatMoney(inv.amount, inv.currency)}</td>
                      <td className="px-5 py-3"><span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span></td>
                      <td className="px-5 py-3 text-xs" style={{ color: '#94A3B8' }}>{new Date(inv.issued_at).toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait' })}</td>
                      <td className="px-5 py-3 text-xs" style={{ color: overdue ? '#B91C1C' : '#94A3B8' }}>{inv.due_at ? new Date(inv.due_at).toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait' }) : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border py-16 text-center" style={{ borderColor: '#E2E8F0', color: '#94A3B8' }}>
          <Inbox className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium" style={{ color: '#475569' }}>No invoices yet</p>
          <p className="text-xs mt-1">Raise an invoice from any application&apos;s page.</p>
        </div>
      )}
    </div>
  )
}
