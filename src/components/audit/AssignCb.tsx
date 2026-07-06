'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { assignCb } from '@/app/(admin)/applications/[id]/actions'
import type { AuditorUser } from '@/lib/db/audit'

export default function AssignCb({ applicationId, bodies, currentId }: {
  applicationId: string
  bodies: AuditorUser[]
  currentId: string | null
}) {
  const [pending, start] = useTransition()
  const router = useRouter()

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value
    start(async () => { await assignCb(applicationId, id); router.refresh() })
  }

  return (
    <select defaultValue={currentId ?? ''} onChange={onChange} disabled={pending}
      className="w-full text-sm px-3 py-2.5 rounded-xl outline-none bg-white disabled:opacity-60" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }}>
      <option value="">— Unassigned —</option>
      {bodies.map((b) => <option key={b.id} value={b.id}>{b.name_en || b.email}</option>)}
    </select>
  )
}
