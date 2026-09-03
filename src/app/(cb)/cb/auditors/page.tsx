import { redirect } from 'next/navigation'
import { Users, Inbox } from 'lucide-react'
import { listAuditorsForCb } from '@/lib/db/audit'
import { can } from '@/lib/permissions-server'
import AddAuditor from '@/components/cb/AddAuditor'

export const dynamic = 'force-dynamic'

export default async function CbAuditorsPage() {
  if (!(await can('create_auditor'))) redirect('/cb/dashboard')
  const auditors = await listAuditorsForCb()

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#0F172A' }}>
          <Users className="w-6 h-6" style={{ color: '#C8A951' }} /> Auditors
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Create auditor accounts and see who is available to be assigned to audits.</p>
      </div>

      <AddAuditor />

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: '#E2E8F0' }}>
          <h2 className="font-bold text-sm" style={{ color: '#0F172A' }}>Auditors</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#FEF9EC', color: '#854D0E' }}>{auditors.length}</span>
        </div>
        {auditors.length > 0 ? (
          <ul className="divide-y" style={{ borderColor: '#F1F5F9' }}>
            {auditors.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #B8860B, #C8A951)' }}>
                  {(a.name_en || a.email || '?').slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm" style={{ color: '#1E293B' }}>{a.name_en || '—'}</p>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>{a.email}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-14 text-center" style={{ color: '#94A3B8' }}>
            <Inbox className="w-9 h-9 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium" style={{ color: '#475569' }}>No auditors yet</p>
            <p className="text-xs mt-0.5">Add one above to make them available for audit assignment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
