import { KeyRound, School, Building2, Users } from 'lucide-react'
import { listRegistrations, MEMBER_STATUS_META } from '@/lib/db/members'
import GreenKeyCell from '@/components/members/GreenKeyCell'

export const dynamic = 'force-dynamic'

export default async function CbRegistrationsPage() {
  const members = await listRegistrations()
  const active = members.filter((m) => m.status === 'active')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Registrations</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{active.length} approved · assign a Green Key number to each.</p>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm" style={{ background: '#FEF9EC', border: '1px solid #FDE68A', color: '#854D0E' }}>
        <KeyRound className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>Generate a unique Green Key number for each approved registration. Numbers are shared with the operator.</p>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {['Name', 'Kind', 'Governorate', 'Status', 'Green Key #'].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider" style={{ color: '#94A3B8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: '#F8FAFC' }}>
            {members.map((m) => {
              const st = MEMBER_STATUS_META[m.status ?? ''] ?? { label: m.status ?? '—', color: '#64748B', bg: '#F1F5F9' }
              const Icon = m.kind === 'School' ? School : Building2
              return (
                <tr key={`${m.kind}-${m.id}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F1F5F9' }}>
                        <Icon className="w-4 h-4" style={{ color: '#64748B' }} />
                      </div>
                      <p className="font-semibold" style={{ color: '#1E293B' }}>{m.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: '#334155' }}>{m.kind}</td>
                  <td className="px-5 py-3.5" style={{ color: '#334155' }}>{m.governorate ?? '—'}</td>
                  <td className="px-5 py-3.5"><span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: st.bg, color: st.color }}>{st.label}</span></td>
                  <td className="px-5 py-3.5"><GreenKeyCell kind={m.kind} id={m.id} number={m.green_key_number} status={m.status} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {members.length === 0 && (
          <div className="py-16 text-center" style={{ color: '#94A3B8' }}>
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium" style={{ color: '#475569' }}>No registrations yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
