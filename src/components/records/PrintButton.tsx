'use client'

import { Printer } from 'lucide-react'

// Triggers the browser print dialog (Save as PDF). The records page carries
// print-isolation CSS so only the dossier prints.
export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="no-print inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
      style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
      <Printer className="w-4 h-4" /> Print / Save as PDF
    </button>
  )
}
