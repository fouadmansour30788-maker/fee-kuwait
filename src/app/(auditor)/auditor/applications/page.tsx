'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, ArrowRight, CalendarClock, FileText } from 'lucide-react'
import {
  AUDIT_APPLICATIONS, AUDIT_STATUS_META, CURRENT_AUDITOR, type AuditStatus,
} from '@/lib/data/audits'

type Filter = 'all' | 'assigned' | 'in_review' | 'audit_submitted' | 'closed'
const CLOSED: AuditStatus[] = ['cb_review', 'certified', 'certified_rectification', 'not_certified']
const TAB_LABEL: Record<Filter, string> = {
  all: 'All', assigned: 'Assigned', in_review: 'Audit in Progress',
  audit_submitted: 'Report Submitted', closed: 'With CB / Closed',
}

export default function AuditorApplications() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const mine = AUDIT_APPLICATIONS.filter(a => a.auditorId === CURRENT_AUDITOR.id)

  const counts: Record<Filter, number> = {
    all: mine.length,
    assigned: mine.filter(a => a.status === 'assigned').length,
    in_review: mine.filter(a => a.status === 'in_review').length,
    audit_submitted: mine.filter(a => a.status === 'audit_submitted').length,
    closed: mine.filter(a => CLOSED.includes(a.status)).length,
  }

  const filtered = mine.filter(a => {
    const matchSearch = a.entity.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filter === 'all' || (filter === 'closed' ? CLOSED.includes(a.status) : a.status === filter)
    return matchSearch && matchStatus
  })

  const tabs: Filter[] = ['all', 'assigned', 'in_review', 'audit_submitted', 'closed']

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Assigned Applications</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{mine.length} applications assigned to you</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all"
            style={filter === s ? { background: '#1B4332', color: '#fff' } : { background: '#fff', color: '#64748B', border: '1px solid #E2E8F0' }}
          >
            {TAB_LABEL[s]}
            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: filter === s ? 'rgba(255,255,255,0.15)' : '#F1F5F9' }}>
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2.5 max-w-sm px-3.5 py-2.5 rounded-xl bg-white" style={{ border: '1px solid #E2E8F0' }}>
        <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or ID…"
          className="bg-transparent text-sm outline-none w-full" style={{ color: '#1E293B' }}
        />
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((app, i) => {
          const meta = AUDIT_STATUS_META[app.status]
          const pendingDocs = app.documents.filter(d => d.status === 'pending').length
          return (
            <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.04 }}>
              <Link
                href={`/auditor/applications/${app.id}`}
                className="group flex items-center gap-4 bg-white rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: '#E2E8F0' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <p className="font-semibold truncate" style={{ color: '#1E293B' }}>{app.entity}</p>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{app.id} · {app.type} · {app.programme} · {app.governorate}</p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs" style={{ color: '#64748B' }}>
                  <FileText className="w-3.5 h-3.5" /> {app.documents.length} docs
                  {pendingDocs > 0 && <span className="font-semibold" style={{ color: '#D97706' }}>· {pendingDocs} pending</span>}
                </div>
                <div className="hidden md:flex items-center gap-1.5 text-xs" style={{ color: '#64748B' }}>
                  <CalendarClock className="w-3.5 h-3.5" /> {app.deadline}
                </div>
                <ArrowRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-1" style={{ color: '#94A3B8' }} />
              </Link>
            </motion.div>
          )
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border p-12 text-center" style={{ borderColor: '#E2E8F0', color: '#94A3B8' }}>
            <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No applications match.</p>
          </div>
        )}
      </div>
    </div>
  )
}
