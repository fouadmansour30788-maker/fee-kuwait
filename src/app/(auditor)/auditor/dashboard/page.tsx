'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ClipboardCheck, Clock, FileCheck2, CheckCircle2, ArrowRight, CalendarClock } from 'lucide-react'
import {
  AUDIT_APPLICATIONS, AUDIT_STATUS_META, CURRENT_AUDITOR, DECIDED,
} from '@/lib/data/audits'

export default function AuditorDashboard() {
  const mine = AUDIT_APPLICATIONS.filter(a => a.auditorId === CURRENT_AUDITOR.id)

  const stats = [
    { label: 'Assigned Audits', value: mine.filter(a => a.status === 'audit').length,    Icon: ClipboardCheck, color: '#0891B2' },
    { label: 'Awaiting CB',     value: mine.filter(a => a.status === 'cb_final').length,  Icon: FileCheck2,     color: '#B45309' },
    { label: 'Decided',         value: mine.filter(a => DECIDED.includes(a.status)).length, Icon: CheckCircle2, color: '#059669' },
  ]

  // Auditor acts only on applications the CB has assigned to them (status 'audit')
  const active = [...mine].filter(a => a.status === 'audit').sort((a, b) => a.deadline.localeCompare(b.deadline))

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Welcome back, {CURRENT_AUDITOR.name.split(' ')[0]}</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
          {active.length} audit{active.length === 1 ? '' : 's'} assigned to you by the Certification Body.
        </p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 + i * 0.05 }}
            className="bg-white rounded-2xl border p-5" style={{ borderColor: '#E2E8F0' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}14` }}>
              <s.Icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <p className="text-3xl font-bold tracking-tight" style={{ color: '#0F172A' }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Your audit queue</h2>
          <Link href="/auditor/applications" className="text-sm font-semibold inline-flex items-center gap-1" style={{ color: '#40916C' }}>
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="space-y-3">
          {active.map(app => {
            const meta = AUDIT_STATUS_META[app.status]
            return (
              <Link key={app.id} href={`/auditor/applications/${app.id}`}
                className="group flex items-center gap-4 bg-white rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: '#E2E8F0' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <p className="font-semibold truncate" style={{ color: '#1E293B' }}>{app.entity}</p>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{app.id} · {app.programme} · {app.governorate}</p>
                </div>
                <div className="hidden md:flex items-center gap-1.5 text-xs" style={{ color: '#64748B' }}>
                  <CalendarClock className="w-3.5 h-3.5" /> Due {app.deadline}
                </div>
                <ArrowRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-1" style={{ color: '#94A3B8' }} />
              </Link>
            )
          })}
          {active.length === 0 && (
            <div className="bg-white rounded-2xl border p-12 text-center" style={{ borderColor: '#E2E8F0', color: '#94A3B8' }}>
              <CheckCircle2 className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No audits assigned right now.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
