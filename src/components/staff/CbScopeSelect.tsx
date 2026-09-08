'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setCbScope } from '@/lib/actions/staff'

const SCOPES = [
  { value: '', label: '— Scope not set —' },
  { value: 'hospitality', label: 'Hospitality (establishments)' },
  { value: 'educational', label: 'Educational institutions' },
  { value: 'both', label: 'Both' },
]

export default function CbScopeSelect({ userId, scope }: { userId: string; scope: string | null }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value
    setError('')
    start(async () => {
      const res = await setCbScope(userId, next)
      if (res.error) setError(res.error)
      else router.refresh()
    })
  }

  return (
    <div>
      <select defaultValue={scope ?? ''} onChange={onChange} disabled={pending}
        className="text-xs px-2.5 py-1.5 rounded-lg outline-none bg-white disabled:opacity-60"
        style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} title="Certification Body scope">
        {SCOPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      {error && <p className="text-[11px] mt-1" style={{ color: '#E53E3E' }}>{error}</p>}
    </div>
  )
}
