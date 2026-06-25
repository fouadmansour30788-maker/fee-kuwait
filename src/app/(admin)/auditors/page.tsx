'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Mail, Plus, UserCheck, Circle, Gavel } from 'lucide-react'
import {
  AUDITORS, CERT_BODIES, AUDIT_APPLICATIONS, AUDIT_STATUS_META, auditorById, type AuditStatus,
} from '@/lib/data/audits'

const DECIDED: AuditStatus[] = ['certified', 'certified_rectification', 'not_certified']

export default function AdminAuditorsPage() {
  // demo: assignment state keyed by application id
  const [assignments, setAssignments] = useState<Record<string, string | null>>(
    Object.fromEntries(AUDIT_APPLICATIONS.map(a => [a.id, a.auditorId]))
  )
  const [cbAssignments, setCbAssignments] = useState<Record<string, string | null>>(
    Object.fromEntries(AUDIT_APPLICATIONS.map(a => [a.id, a.cbId]))
  )

  const workload = (auditorId: string) =>
    Object.entries(assignments).filter(([id, aid]) =>
      aid === auditorId && !DECIDED.includes(AUDIT_APPLICATIONS.find(a => a.id === id)?.status as AuditStatus)
    ).length

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Auditors & Certification Body</h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Assign an independent auditor and the Certification Body to each application (separation of duties).</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
            <Plus className="w-4 h-4" /> Invite auditor
          </button>
        </div>
      </motion.div>

      {/* Roster */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {AUDITORS.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 + i * 0.05 }}
            className="bg-white rounded-2xl border p-5" style={{ borderColor: '#E2E8F0' }}
          >
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
            <div className="flex flex-wrap gap-1.5 mb-3">
              {a.specialties.map(s => (
                <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#ECFDF3', color: '#1B4332' }}>{s}</span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium pt-3 border-t" style={{ color: '#475569', borderColor: '#F1F5F9' }}>
              <UserCheck className="w-3.5 h-3.5" style={{ color: '#40916C' }} />
              {workload(a.id)} active assignment{workload(a.id) === 1 ? '' : 's'}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Assignment table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}>
        <h2 className="text-base font-bold mb-3" style={{ color: '#0F172A' }}>Application assignments</h2>
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider" style={{ color: '#94A3B8' }}>Application</th>
                <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider hidden md:table-cell" style={{ color: '#94A3B8' }}>Programme</th>
                <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider" style={{ color: '#94A3B8' }}>Status</th>
                <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider" style={{ color: '#94A3B8' }}>Assigned auditor</th>
                <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider" style={{ color: '#94A3B8' }}>Certification Body</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#F8FAFC' }}>
              {AUDIT_APPLICATIONS.map(app => {
                const meta = AUDIT_STATUS_META[app.status as AuditStatus]
                const current = assignments[app.id]
                return (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold" style={{ color: '#1E293B' }}>{app.entity}</p>
                      <p className="text-xs" style={{ color: '#94A3B8' }}>{app.id} · {app.governorate}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell" style={{ color: '#334155' }}>{app.programme}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: current ? '#40916C' : '#CBD5E1' }} />
                        <select
                          value={current ?? ''}
                          onChange={e => setAssignments(prev => ({ ...prev, [app.id]: e.target.value || null }))}
                          className="text-sm rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
                          style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: current ? '#1E293B' : '#94A3B8' }}
                        >
                          <option value="">Unassigned</option>
                          {AUDITORS.filter(a => a.active).map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                        {current && <span className="hidden xl:inline text-xs" style={{ color: '#94A3B8' }}>{auditorById(current)?.specialties.join(', ')}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Gavel className="w-4 h-4 flex-shrink-0" style={{ color: cbAssignments[app.id] ? '#D97706' : '#CBD5E1' }} />
                        <select
                          value={cbAssignments[app.id] ?? ''}
                          onChange={e => setCbAssignments(prev => ({ ...prev, [app.id]: e.target.value || null }))}
                          className="text-sm rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
                          style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: cbAssignments[app.id] ? '#1E293B' : '#94A3B8' }}
                        >
                          <option value="">Unassigned</option>
                          {CERT_BODIES.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
