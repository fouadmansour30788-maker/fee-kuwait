'use client'

import { useState } from 'react'
import { Building2, ChevronDown } from 'lucide-react'

// Collapsible per-establishment group for the surveillance lists. Collapsed by
// default — clicking the header reveals the establishment's activities.
export default function EstablishmentGroup({
  name, count, pending, pendingLabel, defaultOpen = false, children,
}: {
  name: string
  count: number
  pending: number
  pendingLabel: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-2.5 px-4 py-3.5 text-left transition-colors hover:bg-slate-50"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#EDF7F1' }}>
          <Building2 className="w-4 h-4" style={{ color: '#40916C' }} />
        </div>
        <span className="font-bold text-base" style={{ color: '#0F172A' }}>{name}</span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#F1F5F9', color: '#475569' }}>
          {count} {count === 1 ? 'activity' : 'activities'}
        </span>
        {pending > 0 && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#854D0E' }}>
            {pending} {pendingLabel}
          </span>
        )}
        <ChevronDown className="w-4 h-4 ml-auto flex-shrink-0 transition-transform duration-200"
          style={{ color: '#94A3B8', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: '#F1F5F9' }}>
          {children}
        </div>
      )}
    </div>
  )
}
