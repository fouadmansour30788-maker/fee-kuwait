'use client'

import { useState, useTransition } from 'react'
import { Check, X, Lock, ShieldCheck, Info } from 'lucide-react'
import { setRolePermission } from '@/lib/actions/permissions'
import {
  CAPABILITIES, STAFF_ROLE_ORDER, STAFF_ROLE_LABEL,
  resolveCan, permKey, type StaffRole,
} from '@/lib/permissions'

// Group capabilities by area, preserving definition order.
const AREAS = CAPABILITIES.reduce<{ area: string; caps: typeof CAPABILITIES }[]>((acc, cap) => {
  const last = acc[acc.length - 1]
  if (last && last.area === cap.area) last.caps.push(cap)
  else acc.push({ area: cap.area, caps: [cap] })
  return acc
}, [])

export default function RolePermissionsMatrix({ overrides: initial }: { overrides: Record<string, boolean> }) {
  const [overrides, setOverrides] = useState<Record<string, boolean>>(initial)
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [, start] = useTransition()

  function toggle(role: StaffRole, capId: string, current: boolean) {
    const key = permKey(role, capId)
    setError('')
    setPendingKey(key)
    const next = !current
    setOverrides((o) => ({ ...o, [key]: next }))
    start(async () => {
      const res = await setRolePermission(role, capId, next)
      if (res.error) {
        setError(res.error)
        setOverrides((o) => { const c = { ...o }; delete c[key]; return c }) // roll back to server default
      }
      setPendingKey(null)
    })
  }

  return (
    <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
      <div className="px-5 py-4 border-b flex items-center gap-2.5" style={{ borderColor: '#E2E8F0' }}>
        <ShieldCheck className="w-5 h-5" style={{ color: '#40916C' }} />
        <div>
          <h2 className="font-bold text-base" style={{ color: '#0F172A' }}>Role permissions</h2>
          <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>What each back-office role is allowed to do. Toggle the editable cells; locked cells are fixed by role.</p>
        </div>
      </div>

      {error && (
        <div className="mx-5 mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm" style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}>
          <Info className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: '#94A3B8' }}>Capability</th>
              {STAFF_ROLE_ORDER.map((r) => (
                <th key={r} className="px-3 py-3 font-semibold text-xs text-center" style={{ color: '#475569' }}>
                  {STAFF_ROLE_LABEL[r]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AREAS.map(({ area, caps }) => (
              <FragmentArea key={area} area={area} caps={caps} overrides={overrides} pendingKey={pendingKey} onToggle={toggle} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3.5 border-t flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs" style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
        <span className="inline-flex items-center gap-1.5"><span className="w-4 h-4 rounded-md inline-flex items-center justify-center" style={{ background: '#DCFCE7' }}><Check className="w-3 h-3" style={{ color: '#16A34A' }} /></span> Allowed</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-4 h-4 rounded-md inline-flex items-center justify-center" style={{ background: '#F1F5F9' }}><X className="w-3 h-3" style={{ color: '#94A3B8' }} /></span> Not allowed</span>
        <span className="inline-flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Fixed by role</span>
        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" style={{ color: '#40916C' }} /> Super Admin always has every capability</span>
      </div>
    </div>
  )
}

function FragmentArea({
  area, caps, overrides, pendingKey, onToggle,
}: {
  area: string
  caps: typeof CAPABILITIES
  overrides: Record<string, boolean>
  pendingKey: string | null
  onToggle: (role: StaffRole, capId: string, current: boolean) => void
}) {
  return (
    <>
      <tr>
        <td colSpan={STAFF_ROLE_ORDER.length + 1} className="px-5 pt-4 pb-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: '#94A3B8' }}>
          {area}
        </td>
      </tr>
      {caps.map((cap) => (
        <tr key={cap.id} className="border-t" style={{ borderColor: '#F1F5F9' }}>
          <td className="px-5 py-3">
            <p className="font-semibold" style={{ color: '#1E293B' }}>{cap.label}</p>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{cap.description}</p>
          </td>
          {STAFF_ROLE_ORDER.map((role) => {
            const allowed = resolveCan(role, cap.id, overrides)
            const editable = cap.grantable && role !== 'super_admin'
            const key = permKey(role, cap.id)
            const pending = pendingKey === key
            return (
              <td key={role} className="px-3 py-3 text-center">
                {editable ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => onToggle(role, cap.id, allowed)}
                    aria-pressed={allowed}
                    className="w-7 h-7 rounded-md inline-flex items-center justify-center transition-colors disabled:opacity-50"
                    style={{ background: allowed ? '#DCFCE7' : '#F1F5F9' }}
                    title={allowed ? 'Allowed — click to revoke' : 'Not allowed — click to grant'}
                  >
                    {allowed ? <Check className="w-4 h-4" style={{ color: '#16A34A' }} /> : <X className="w-4 h-4" style={{ color: '#94A3B8' }} />}
                  </button>
                ) : (
                  <span
                    className="w-7 h-7 rounded-md inline-flex items-center justify-center"
                    style={{ background: allowed ? '#ECFDF5' : 'transparent' }}
                    title={role === 'super_admin' ? 'Super Admin always has this' : 'Fixed by role'}
                  >
                    {allowed
                      ? <Check className="w-4 h-4" style={{ color: '#40916C' }} />
                      : <Lock className="w-3.5 h-3.5" style={{ color: '#CBD5E1' }} />}
                  </span>
                )}
              </td>
            )
          })}
        </tr>
      ))}
    </>
  )
}
