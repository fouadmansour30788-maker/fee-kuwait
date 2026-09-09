'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, MailOpen, Trash2, Reply, Loader2 } from 'lucide-react'
import { setContactMessageRead, deleteContactMessage } from '@/lib/actions/contact'
import type { ContactMessage } from '@/lib/db/contactMessages'

const SUBJECT_LABEL: Record<string, string> = {
  'eco-schools': 'Eco-Schools', 'blue-flag': 'Blue Flag', 'green-key': 'Green Key',
  yre: 'Young Reporters for the Environment', 'eco-campus': 'Eco-Campus',
  general: 'General Enquiry', media: 'Media & Press',
}

export default function ContactMessageItem({ m }: { m: ContactMessage }) {
  const [pending, start] = useTransition()
  const [open, setOpen] = useState(!m.read)
  const router = useRouter()

  const toggleRead = () => start(async () => { await setContactMessageRead(m.id, !m.read); router.refresh() })
  const remove = () => {
    if (!window.confirm('Delete this message?')) return
    start(async () => { await deleteContactMessage(m.id); router.refresh() })
  }
  const openThread = () => {
    if (!open && !m.read) start(async () => { await setContactMessageRead(m.id, true); router.refresh() })
    setOpen((o) => !o)
  }

  const subjectLabel = m.subject ? (SUBJECT_LABEL[m.subject] ?? m.subject) : 'General'
  const when = new Date(m.created_at).toLocaleString('en-GB', { timeZone: 'Asia/Kuwait', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const mailto = `mailto:${m.email ?? ''}?subject=${encodeURIComponent(`Re: ${subjectLabel} — FEE Kuwait`)}`

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: m.read ? '#E2E8F0' : '#C8E6D0', background: m.read ? '#fff' : '#F4FBF7' }}>
      <button type="button" onClick={openThread} className="w-full flex items-center gap-3 px-5 py-3.5 text-left">
        {m.read ? <MailOpen className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} /> : <Mail className="w-4 h-4 flex-shrink-0" style={{ color: '#40916C' }} />}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm ${m.read ? 'font-medium' : 'font-bold'}`} style={{ color: '#0F172A' }}>{m.name || m.email || 'Anonymous'}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#EDF7F1', color: '#40916C' }}>{subjectLabel}</span>
            {!m.read && <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: '#DCFCE7', color: '#166534' }}>New</span>}
          </div>
          {!open && <p className="text-xs truncate mt-0.5" style={{ color: '#94A3B8' }}>{m.message}</p>}
        </div>
        <span className="text-xs flex-shrink-0" style={{ color: '#94A3B8' }}>{when}</span>
      </button>

      {open && (
        <div className="px-5 pb-4 pt-1 border-t" style={{ borderColor: '#F1F5F9' }}>
          <p className="text-sm whitespace-pre-wrap leading-relaxed mb-3" style={{ color: '#334155' }}>{m.message}</p>
          <div className="flex flex-wrap items-center gap-2">
            {m.email && (
              <a href={mailto} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
                <Reply className="w-3.5 h-3.5" /> Reply by email
              </a>
            )}
            <button onClick={toggleRead} disabled={pending} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-60" style={{ background: '#F1F5F9', color: '#334155' }}>
              {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : m.read ? <Mail className="w-3.5 h-3.5" /> : <MailOpen className="w-3.5 h-3.5" />}
              Mark {m.read ? 'unread' : 'read'}
            </button>
            <button onClick={remove} disabled={pending} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-60" style={{ background: '#FEF2F2', color: '#B91C1C' }}>
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
            <span className="text-xs" style={{ color: '#94A3B8' }}>{m.email}</span>
          </div>
        </div>
      )}
    </div>
  )
}
