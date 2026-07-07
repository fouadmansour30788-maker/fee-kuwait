import { Users, School, Building2 } from 'lucide-react'
import { listMembers, MEMBER_STATUS_META } from '@/lib/db/members'
import MemberActions from '@/components/members/MemberActions'

export default async function MembersPage() {
  const members = await listMembers()
  const schools = members.filter((m) => m.kind === 'School').length
  const establishments = members.length - schools

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Members</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
          {members.length} registered · {schools} schools · {establishments} establishments
        </p>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {['Name', 'Kind', 'Type', 'Governorate', 'Status', 'Actions'].map((h) => (
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
                  <td className="px-5 py-3.5 capitalize" style={{ color: '#334155' }}>{m.type ?? '—'}</td>
                  <td className="px-5 py-3.5" style={{ color: '#334155' }}>{m.governorate ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <MemberActions kind={m.kind} id={m.id} status={m.status} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {members.length === 0 && (
          <div className="py-16 text-center" style={{ color: '#94A3B8' }}>
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium" style={{ color: '#475569' }}>No members yet</p>
            <p className="text-xs mt-1">Schools and establishments appear here once they register.</p>
          </div>
        )}
      </div>
    </div>
  )
}
