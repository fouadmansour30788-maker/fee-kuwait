'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setUserRole } from '@/lib/actions/staff'
import { ROLES, ROLE_LABEL } from '@/lib/roles'

export default function RoleSelect({ userId, role, disabled }: { userId: string; role: string; disabled?: boolean }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value
    setError('')
    start(async () => {
      const res = await setUserRole(userId, next)
      if (res.error) setError(res.error)
      else router.refresh()
    })
  }

  return (
    <div>
      <select defaultValue={role} onChange={onChange} disabled={disabled || pending}
        className="text-sm px-2.5 py-1.5 rounded-lg outline-none bg-white disabled:opacity-60"
        style={{ border: '1px solid #E2E8F0', color: '#1E293B' }}>
        {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
      </select>
      {error && <p className="text-[11px] mt-1" style={{ color: '#E53E3E' }}>{error}</p>}
    </div>
  )
}
