'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Ban, RotateCcw } from 'lucide-react'
import { setMemberStatus } from '@/lib/actions/members'

export default function MemberActions({ kind, id, status }: { kind: 'School' | 'Establishment'; id: string; status: string | null }) {
  const [pending, start] = useTransition()
  const router = useRouter()
  const go = (s: string) => start(async () => { await setMemberStatus(kind, id, s); router.refresh() })

  const btn = 'inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg disabled:opacity-50'

  if (status === 'active') {
    return (
      <button onClick={() => go('suspended')} disabled={pending} className={btn} style={{ background: '#FEF2F2', color: '#B91C1C' }}>
        <Ban className="w-3 h-3" /> Suspend
      </button>
    )
  }
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={() => go('active')} disabled={pending} className={btn} style={{ background: '#ECFDF3', color: '#047857' }}>
        {status === 'pending' ? <Check className="w-3 h-3" /> : <RotateCcw className="w-3 h-3" />} {status === 'pending' ? 'Approve' : 'Reactivate'}
      </button>
      {status === 'pending' && (
        <button onClick={() => go('inactive')} disabled={pending} className={btn} style={{ background: '#F1F5F9', color: '#64748B' }}>
          Reject
        </button>
      )}
    </div>
  )
}
