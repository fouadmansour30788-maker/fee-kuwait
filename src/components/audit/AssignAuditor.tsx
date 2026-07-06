'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { assignAuditor } from '@/app/(admin)/applications/[id]/actions'
import type { AuditorUser } from '@/lib/db/audit'

export default function AssignAuditor({ applicationId, auditors, currentId }: {
  applicationId: string
  auditors: AuditorUser[]
  currentId: string | null
}) {
  const [pending, start] = useTransition()
  const router = useRouter()

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value
    start(async () => { await assignAuditor(applicationId, id); router.refresh() })
  }

  return (
    <select defaultValue={currentId ?? ''} onChange={onChange} disabled={pending}
      className="w-full text-sm px-3 py-2.5 rounded-xl outline-none bg-white disabled:opacity-60" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }}>
      <option value="">— Unassigned —</option>
      {auditors.map((a) => <option key={a.id} value={a.id}>{a.name_en || a.email}</option>)}
    </select>
  )
}
