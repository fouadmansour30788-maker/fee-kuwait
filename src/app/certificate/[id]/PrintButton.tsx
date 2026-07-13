'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
      style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
      <Printer className="w-4 h-4" /> Download / Print
    </button>
  )
}
