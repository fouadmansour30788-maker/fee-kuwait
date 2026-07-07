'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

const TEMPLATES = [
  { title: 'Registration approved', body: 'Dear {name},\n\nYour registration with FEE Kuwait has been approved. You can now sign in and start your application for the programme(s) you selected.\n\nKind regards,\nFEE Kuwait — National Operator' },
  { title: 'Documents needed', body: 'Dear {name},\n\nWhile reviewing your application we found that some supporting evidence is missing. Please sign in and upload the requested documents for the flagged indicators so we can proceed.\n\nKind regards,\nFEE Kuwait' },
  { title: 'Audit scheduled', body: 'Dear {name},\n\nAn independent auditor has been assigned to your application. They will review your evidence and may arrange a site visit. We will notify you once the audit is complete.\n\nKind regards,\nFEE Kuwait' },
  { title: 'Certified', body: 'Dear {name},\n\nCongratulations! The Certification Body has certified your {programme} application. Your certificate is now available in your portal. Please follow the brand guidelines when displaying the award.\n\nKind regards,\nFEE Kuwait' },
  { title: 'Non-conformity — revision', body: 'Dear {name},\n\nThe audit identified {n} non-conforming criteria. You have until {date} to address them. Please update your evidence and comments for the flagged indicators; we will re-open the application for revision.\n\nKind regards,\nFEE Kuwait' },
]

export default function MessageTemplates() {
  const [copied, setCopied] = useState<number | null>(null)
  async function copy(i: number, text: string) {
    try { await navigator.clipboard.writeText(text); setCopied(i); setTimeout(() => setCopied(null), 1500) } catch { /* ignore */ }
  }
  return (
    <div className="space-y-3">
      {TEMPLATES.map((t, i) => (
        <div key={t.title} className="rounded-xl border p-4" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-sm font-bold" style={{ color: '#0F172A' }}>{t.title}</h3>
            <button onClick={() => copy(i, t.body)} className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: copied === i ? '#ECFDF3' : '#F1F5F9', color: copied === i ? '#047857' : '#475569' }}>
              {copied === i ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
            </button>
          </div>
          <pre className="text-xs whitespace-pre-wrap font-sans" style={{ color: '#475569' }}>{t.body}</pre>
        </div>
      ))}
      <p className="text-[11px]" style={{ color: '#94A3B8' }}>Replace {'{name}'}, {'{programme}'}, {'{n}'}, {'{date}'} placeholders before sending.</p>
    </div>
  )
}
