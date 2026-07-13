'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { removeTeamMember } from '@/lib/actions/staff'

export default function RemoveMember({ userId, name, disabled }: { userId: string; name: string; disabled?: boolean }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()
  if (disabled) return null

  function go() {
    if (typeof window !== 'undefined' && !window.confirm(`Remove ${name}? Their account will be permanently deleted.`)) return
    setError('')
    start(async () => { const r = await removeTeamMember(userId); if (r.error) setError(r.error); else router.refresh() })
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <button onClick={go} disabled={pending} title="Remove member" className="p-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50" style={{ color: '#DC2626' }}>
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
      {error && <span className="text-[11px]" style={{ color: '#E53E3E' }}>{error}</span>}
    </span>
  )
}
