'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Gavel, FileSearch, FileCheck2, CheckCircle2, ArrowRight, CalendarClock } from 'lucide-react'
import {
  AUDIT_APPLICATIONS, AUDIT_STATUS_META, CONFORMITY_META, CURRENT_CB,
  CB_PRE_AUDIT, CB_FINAL, DECIDED,
} from '@/lib/data/audits'

export default function CbDashboard() {
  const mine = AUDIT_APPLICATIONS.filter(a => a.cbId === CURRENT_CB.id)
  const preAudit = mine.filter(a => CB_PRE_AUDIT.includes(a.status)).sort((a, b) => a.deadline.localeCompare(b.deadline))
  const finalQueue = mine.filter(a => CB_FINAL.includes(a.status)).sort((a, b) => a.deadline.localeCompare(b.deadline))
  const decided = mine.filter(a => DECIDED.includes(a.status))

  const stats = [
    { label: 'Pre-audit reviews', value: preAudit.length,   Icon: FileSearch,   color: '#0891B2' },
    { label: 'Final judgements',  value: finalQueue.length,  Icon: FileCheck2,   color: '#D97706' },
    { label: 'Decisions made',    value: decided.length,     Icon: CheckCircle2, color: '#059669' },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Certification Body</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
          Review submissions from the National Operator, assign auditors, and issue certification decisions.
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

      {/* Pre-audit review queue */}
      <div>
        <h2 className="text-base font-bold mb-1" style={{ color: '#0F172A' }}>Submitted for review</h2>
        <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>Review the National Operator&apos;s checklist. Request changes, or assign an auditor to proceed.</p>
        <div className="space-y-3">
          {preAudit.map(app => {
            const meta = AUDIT_STATUS_META[app.status]
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
                <div className="hidden md:flex items-center gap-1.5 text-xs" style={{ color: '#64748B' }}>
                  <CalendarClock className="w-3.5 h-3.5" /> {app.submittedToCbAt ? `Submitted ${app.submittedToCbAt.slice(0, 10)}` : app.deadline}
                </div>
                <ArrowRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-1" style={{ color: '#94A3B8' }} />
              </Link>
            )
          })}
          {preAudit.length === 0 && (
            <div className="bg-white rounded-2xl border p-8 text-center" style={{ borderColor: '#E2E8F0', color: '#94A3B8' }}>
              <FileSearch className="w-7 h-7 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No new submissions to review.</p>
            </div>
          )}
        </div>
      </div>

      {/* Final judgement queue */}
      <div>
        <h2 className="text-base font-bold mb-1" style={{ color: '#0F172A' }}>Awaiting final judgement</h2>
        <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>The audit is complete. Review the auditor&apos;s findings and record the certification decision.</p>
        <div className="space-y-3">
          {finalQueue.map(app => {
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
                <ArrowRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-1" style={{ color: '#94A3B8' }} />
              </Link>
            )
          })}
          {finalQueue.length === 0 && (
            <div className="bg-white rounded-2xl border p-8 text-center" style={{ borderColor: '#E2E8F0', color: '#94A3B8' }}>
              <CheckCircle2 className="w-7 h-7 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No completed audits awaiting a decision.</p>
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
