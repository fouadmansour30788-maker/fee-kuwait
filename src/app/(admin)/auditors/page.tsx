'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ClipboardCheck, Send, Clock3, Award, ArrowRight, RotateCcw, Circle, Mail, ShieldCheck,
} from 'lucide-react'
import {
  AUDITORS, AUDIT_APPLICATIONS, AUDIT_STATUS_META, auditorById, cbById,
  NO_OPEN, CB_PRE_AUDIT, CB_FINAL, DECIDED, type AuditStatus,
} from '@/lib/data/audits'

const IN_PROGRESS: AuditStatus[] = [...CB_PRE_AUDIT, 'audit', ...CB_FINAL]

export default function NoReviewsPage() {
  const needsReview = AUDIT_APPLICATIONS.filter(a => NO_OPEN.includes(a.status))
  const inProgress  = AUDIT_APPLICATIONS.filter(a => IN_PROGRESS.includes(a.status))
  const decided     = AUDIT_APPLICATIONS.filter(a => DECIDED.includes(a.status))

  const stats = [
    { label: 'To review & submit', value: needsReview.length, Icon: ClipboardCheck, color: '#0891B2' },
    { label: 'With CB / auditor',  value: inProgress.length,   Icon: Clock3,        color: '#D97706' },
    { label: 'Certified / decided', value: decided.length,     Icon: Award,         color: '#059669' },
  ]

  const Row = ({ app, cta }: { app: typeof AUDIT_APPLICATIONS[number]; cta?: string }) => {
    const meta = AUDIT_STATUS_META[app.status]
    const cb = cbById(app.cbId)
    const auditor = auditorById(app.auditorId)
    const stage = CB_PRE_AUDIT.includes(app.status) ? `At CB · ${cb?.name ?? 'Certification Body'}`
      : app.status === 'audit' ? `Auditing · ${auditor?.name ?? 'Auditor'}`
        : CB_FINAL.includes(app.status) ? `Final judgement · ${cb?.name ?? 'Certification Body'}`
          : DECIDED.includes(app.status) ? 'Closed'
            : 'With you'
    return (
      <Link href={`/auditors/${app.id}`}
        className="group flex items-center gap-4 bg-white rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <p className="font-semibold truncate" style={{ color: '#1E293B' }}>{app.entity}</p>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{app.id} · {app.programme} · {stage}</p>
        </div>
        {cta && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: '#ECFEFF', color: '#0E7490' }}>
            {app.status === 'changes_requested' ? <RotateCcw className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />} {cta}
          </span>
        )}
        <ArrowRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-1" style={{ color: '#94A3B8' }} />
      </Link>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Certification Reviews</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
          Review each establishment&apos;s criteria checklist, then submit it to the Certification Body. The CB assigns an auditor and issues the final decision.
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

      {/* Needs review */}
      <div>
        <h2 className="text-base font-bold mb-1" style={{ color: '#0F172A' }}>Awaiting your review</h2>
        <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>Complete the checklist with the establishment, then submit to the Certification Body.</p>
        <div className="space-y-3">
          {needsReview.map(app => <Row key={app.id} app={app} cta={app.status === 'changes_requested' ? 'Resubmit' : 'Submit to CB'} />)}
          {needsReview.length === 0 && (
            <div className="bg-white rounded-2xl border p-8 text-center" style={{ borderColor: '#E2E8F0', color: '#94A3B8' }}>
              <ClipboardCheck className="w-7 h-7 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">Nothing awaiting review.</p>
            </div>
          )}
        </div>
      </div>

      {/* In progress */}
      {inProgress.length > 0 && (
        <div>
          <h2 className="text-base font-bold mb-3" style={{ color: '#0F172A' }}>In progress (CB &amp; auditor)</h2>
          <div className="space-y-3">{inProgress.map(app => <Row key={app.id} app={app} />)}</div>
        </div>
      )}

      {/* Decided */}
      {decided.length > 0 && (
        <div>
          <h2 className="text-base font-bold mb-3" style={{ color: '#0F172A' }}>Decided</h2>
          <div className="space-y-3">{decided.map(app => <Row key={app.id} app={app} />)}</div>
        </div>
      )}

      {/* Auditor & CB roster (reference only) */}
      <div>
        <h2 className="text-base font-bold mb-1" style={{ color: '#0F172A' }}>Independent auditors</h2>
        <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>Auditors are assigned by the Certification Body, not the National Operator (separation of duties).</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AUDITORS.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 + i * 0.05 }}
              className="bg-white rounded-2xl border p-5" style={{ borderColor: '#E2E8F0' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
                  {a.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: '#1E293B' }}>{a.name}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: a.active ? '#059669' : '#94A3B8' }}>
                    <Circle className="w-2 h-2" style={{ fill: a.active ? '#059669' : '#CBD5E1', stroke: 'none' }} />
                    {a.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <p className="flex items-center gap-1.5 text-xs mb-3 truncate" style={{ color: '#64748B' }}>
                <Mail className="w-3.5 h-3.5 flex-shrink-0" /> {a.email}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {a.specialties.map(s => (
                  <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#ECFDF3', color: '#1B4332' }}>{s}</span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium pt-3 mt-3 border-t" style={{ color: '#475569', borderColor: '#F1F5F9' }}>
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#40916C' }} />
                {AUDIT_APPLICATIONS.filter(app => app.auditorId === a.id && !DECIDED.includes(app.status)).length} active audit(s)
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
