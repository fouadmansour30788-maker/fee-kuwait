'use client'

import { useState } from 'react'
import { X, FlaskConical } from 'lucide-react'

export default function DemoBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="fixed top-0 inset-x-0 z-[100] bg-gold text-charcoal text-sm font-medium py-2 px-4 flex items-center justify-center gap-3">
      <FlaskConical className="w-4 h-4 shrink-0" />
      <span>
        <strong>Demo Mode</strong> — You&apos;re viewing FEE Kuwait with sample data.{' '}
        <span className="opacity-70">demo_school@feekuwait.org · demo_business@feekuwait.org · demo_admin@feekuwait.org</span>
      </span>
      <button onClick={() => setDismissed(true)} className="ml-auto shrink-0 hover:opacity-70 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
