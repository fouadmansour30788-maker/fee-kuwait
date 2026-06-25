'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ClipboardCheck, Clock, FileCheck2, CheckCircle2, ArrowRight, CalendarClock } from 'lucide-react'
import {
  AUDIT_APPLICATIONS, AUDIT_STATUS_META, CURRENT_AUDITOR, type AuditStatus,
} from '@/lib/data/audits'

const CLOSED: AuditStatus[] = ['cb_review', 'certified', 'certified_rectification', 'not_certified']

export default function AuditorDashboard() {
  const mine = AUDIT_APPLICATIONS.filter(a => a.auditorId === CURRENT_AUDITOR.id)

  const count = (s: AuditStatus) => mine.filter(a => a.status === s).length
  const stats = [
    { label: 'Newly Assigned',   value: count('assigned'),        Icon: ClipboardCheck, color: '#7C3AED' },
    { label: 'Audit in Progress',value: count('in_review'),       Icon: Clock,          color: '#2563EB' },
    { label: 'Report Submitted', value: count('audit_submitted'), Icon: FileCheck2,     color: '#0891B2' },
    { label: 'With CB / Closed', value: mine.filter(a => CLOSED.includes(a.status)).length, Icon: CheckCircle2, color: '#059669' },
  ]

  // active = still needs the auditor's work, soonest deadline first
  const active = [...mine]
    .filter(a => a.status === 'assigned' || a.status === 'in_review')
    .sort((a, b) => a.deadline.localeCompare(b.deadline))

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>
          Welcome back, {CURRENT_AUDITOR.name.split(' ')[0]}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
          You have {active.length} application{active.length === 1 ? '' : 's'} awaiting your review.
        </p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 + i * 0.05 }}
            className="bg-white rounded-2xl border p-5" style={{ borderColor: '#E2E8F0' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}14` }}>
              <s.Icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <p className="text-3xl font-bold tracking-tight" style={{ color: '#0F172A' }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Active queue */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Your review queue</h2>
          <Link href="/auditor/applications" className="text-sm font-semibold inline-flex items-center gap-1" style={{ color: '#40916C' }}>
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {active.map(app => {
            const meta = AUDIT_STATUS_META[app.status]
            const pendingDocs = app.documents.filter(d => d.status === 'pending').length
            return (
              <Link
                key={app.id}
                href={`/auditor/applications/${app.id}`}
                className="group flex items-center gap-4 bg-white rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: '#E2E8F0' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <p className="font-semibold truncate" style={{ color: '#1E293B' }}>{app.entity}</p>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                    {app.id} · {app.programme} · {app.governorate}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium" style={{ color: pendingDocs ? '#D97706' : '#94A3B8' }}>
                  {pendingDocs} doc{pendingDocs === 1 ? '' : 's'} pending
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
              <p className="text-sm font-medium">All caught up — no pending reviews.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
