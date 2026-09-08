'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { assignCb } from '@/app/(admin)/applications/[id]/actions'
import type { AuditorUser } from '@/lib/db/audit'

const SCOPE_LABEL: Record<string, string> = {
  hospitality: 'Hospitality',
  educational: 'Educational',
  both: 'Hospitality & Educational',
}

export default function AssignCb({ applicationId, bodies, currentId, entityType }: {
  applicationId: string
  bodies: AuditorUser[]
  currentId: string | null
  entityType?: string | null
}) {
  const [pending, start] = useTransition()
  const router = useRouter()

  // Which scope suits this application? Hospitality establishments vs educational
  // institutions (schools/universities). Used only to flag the recommended CB.
  const wantedScope = entityType === 'business' ? 'hospitality' : entityType ? 'educational' : null
  const recommendedId = wantedScope
    ? bodies.find((b) => b.cb_scope === wantedScope || b.cb_scope === 'both')?.id ?? null
    : null

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value
    start(async () => { await assignCb(applicationId, id); router.refresh() })
  }

  return (
    <div>
      <select defaultValue={currentId ?? ''} onChange={onChange} disabled={pending}
        className="w-full text-sm px-3 py-2.5 rounded-xl outline-none bg-white disabled:opacity-60" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }}>
        <option value="">— Unassigned —</option>
        {bodies.map((b) => {
          const scope = b.cb_scope ? SCOPE_LABEL[b.cb_scope] : null
          const rec = b.id === recommendedId ? ' — recommended' : ''
          return (
            <option key={b.id} value={b.id}>
              {(b.name_en || b.email) + (scope ? ` · ${scope}` : '') + rec}
            </option>
          )
        })}
      </select>
      {recommendedId && currentId !== recommendedId && (
        <p className="text-[11px] mt-1.5" style={{ color: '#64748B' }}>
          Recommended: {(() => { const b = bodies.find((x) => x.id === recommendedId); return b?.name_en || b?.email })()} for {wantedScope === 'hospitality' ? 'hospitality establishments' : 'educational institutions'}.
        </p>
      )}
    </div>
  )
}
