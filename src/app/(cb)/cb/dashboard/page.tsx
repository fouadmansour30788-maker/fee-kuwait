'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Gavel, FileCheck2, CheckCircle2, ArrowRight, CalendarClock } from 'lucide-react'
import {
  AUDIT_APPLICATIONS, AUDIT_STATUS_META, CONFORMITY_META, CURRENT_CB, type AuditStatus,
} from '@/lib/data/audits'

const QUEUE: AuditStatus[] = ['audit_submitted', 'cb_review']
const DECIDED: AuditStatus[] = ['certified', 'certified_rectification', 'not_certified']

export default function CbDashboard() {
  const mine = AUDIT_APPLICATIONS.filter(a => a.cbId === CURRENT_CB.id)
  const queue = mine.filter(a => QUEUE.includes(a.status)).sort((a, b) => a.deadline.localeCompare(b.deadline))
  const decided = mine.filter(a => DECIDED.includes(a.status))

  const stats = [
    { label: 'Awaiting Review', value: queue.length, Icon: FileCheck2, color: '#D97706' },
    { label: 'Decisions Made',  value: decided.length, Icon: CheckCircle2, color: '#059669' },
    { label: 'Total Assigned',  value: mine.length, Icon: Gavel, color: '#C8A951' },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Certification Reviews</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
          Review submitted audit reports and record certification decisions. {queue.length} awaiting your review.
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

      {/* Review queue */}
      <div>
        <h2 className="text-base font-bold mb-3" style={{ color: '#0F172A' }}>Awaiting certification decision</h2>
        <div className="space-y-3">
          {queue.map(app => {
            const meta = AUDIT_STATUS_META[app.status]
            const cm = CONFORMITY_META[app.conformity]
            return (
              <Link key={app.id} href={`/cb/applications/${app.id}`}
                className="group flex items-center gap-4 bg-white rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: '#E2E8F0' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <p className="font-semibold truncate" style={{ color: '#1E293B' }}>{app.entity}</p>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{app.id} · {app.programme} · {app.mainCategory}</p>
                </div>
                <span className="hidden sm:inline text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: cm.bg, color: cm.color }}>{cm.label} · {app.conformityPct}%</span>
                <div className="hidden md:flex items-center gap-1.5 text-xs" style={{ color: '#64748B' }}>
                  <CalendarClock className="w-3.5 h-3.5" /> {app.deadline}
                </div>
                <ArrowRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-1" style={{ color: '#94A3B8' }} />
              </Link>
            )
          })}
          {queue.length === 0 && (
            <div className="bg-white rounded-2xl border p-12 text-center" style={{ borderColor: '#E2E8F0', color: '#94A3B8' }}>
              <CheckCircle2 className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No audit reports awaiting a decision.</p>
            </div>
          )}
        </div>
      </div>

      {/* Decided */}
      {decided.length > 0 && (
        <div>
          <h2 className="text-base font-bold mb-3" style={{ color: '#0F172A' }}>Recent decisions</h2>
          <div className="space-y-3">
            {decided.map(app => {
              const meta = AUDIT_STATUS_META[app.status]
              return (
                <Link key={app.id} href={`/cb/applications/${app.id}`}
                  className="group flex items-center gap-4 bg-white rounded-2xl border p-4 transition-all hover:shadow-md" style={{ borderColor: '#E2E8F0' }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: '#1E293B' }}>{app.entity}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{app.id} · {app.programme}</p>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                  <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
