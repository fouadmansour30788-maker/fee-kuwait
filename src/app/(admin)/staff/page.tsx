import { UserCog, Info } from 'lucide-react'
import { listUsers } from '@/lib/db/staff'
import { ROLE_LABEL } from '@/lib/roles'
import { getCurrentUser } from '@/lib/auth-server'
import RoleSelect from '@/components/staff/RoleSelect'
import AddTeamMember from '@/components/staff/AddTeamMember'

export default async function StaffPage() {
  const [users, me] = await Promise.all([listUsers(), getCurrentUser()])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Team &amp; Roles</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{users.length} users · assign roles (auditor, certification body, operator…)</p>
      </div>

      <AddTeamMember />

      <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF' }}>
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>Add members above, or change anyone&apos;s role below. Role changes take effect on the person&apos;s next sign-in.</p>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {['User', 'Current role', 'Set role', 'Joined'].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider" style={{ color: '#94A3B8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: '#F8FAFC' }}>
            {users.map((u) => {
              const isMe = me?.id === u.id
              return (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
                        {(u.name_en || u.email || '?').slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold" style={{ color: '#1E293B' }}>{u.name_en || '—'}{isMe && <span className="ml-1.5 text-[10px] font-semibold" style={{ color: '#40916C' }}>(you)</span>}</p>
                        <p className="text-xs" style={{ color: '#94A3B8' }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: '#334155' }}>{ROLE_LABEL[u.role] ?? u.role}</td>
                  <td className="px-5 py-3.5"><RoleSelect userId={u.id} role={u.role} disabled={isMe} /></td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: '#94A3B8' }}>{new Date(u.created_at).toLocaleDateString('en-GB')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="py-16 text-center" style={{ color: '#94A3B8' }}>
            <UserCog className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium" style={{ color: '#475569' }}>No users yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
