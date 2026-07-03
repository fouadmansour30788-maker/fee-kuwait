'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Filter, Clock, CheckCircle2, XCircle, AlertCircle,
  School, Waves, KeyRound, Leaf, Newspaper, GraduationCap,
  Eye, Download, ChevronDown,
} from 'lucide-react'

type Status = 'all' | 'pending' | 'review' | 'approved' | 'rejected'

const APPLICATIONS = [
  { id: 'KW-2026-00201', name: 'Al-Noor Primary School',         type: 'School',   programme: 'Eco-Schools', status: 'pending',  date: '2026-05-23', governorate: 'Hawalli',    Icon: School         },
  { id: 'KW-2026-00200', name: 'Pearl Beach Resort',             type: 'Business', programme: 'Blue Flag',   status: 'review',   date: '2026-05-22', governorate: 'Ahmadi',    Icon: Waves          },
  { id: 'KW-2026-00199', name: 'Hilton Kuwait Resort',           type: 'Business', programme: 'Green Key',   status: 'approved', date: '2026-05-21', governorate: 'Capital',   Icon: KeyRound       },
  { id: 'KW-2026-00198', name: 'Rumaithiya Secondary School',    type: 'School',   programme: 'Eco-Schools', status: 'pending',  date: '2026-05-20', governorate: 'Hawalli',   Icon: School         },
  { id: 'KW-2026-00197', name: 'Gulf Science University',        type: 'School',   programme: 'Eco-Campus',  status: 'review',   date: '2026-05-19', governorate: 'Salmiya',   Icon: GraduationCap  },
  { id: 'KW-2026-00196', name: 'Young Reporters Kuwait',         type: 'School',   programme: 'YRE',         status: 'approved', date: '2026-05-18', governorate: 'Capital',   Icon: Newspaper      },
  { id: 'KW-2026-00195', name: 'Sabah Al-Ahmad School',          type: 'School',   programme: 'LEAF',        status: 'rejected', date: '2026-05-17', governorate: 'Jahra',     Icon: Leaf           },
  { id: 'KW-2026-00194', name: 'Marina Bay Hotel',               type: 'Business', programme: 'Blue Flag',   status: 'pending',  date: '2026-05-16', governorate: 'Ahmadi',    Icon: Waves          },
  { id: 'KW-2026-00193', name: 'Kuwait Model School',            type: 'School',   programme: 'Eco-Schools', status: 'approved', date: '2026-05-15', governorate: 'Farwaniya', Icon: School         },
  { id: 'KW-2026-00192', name: 'Seasons Hotel',                  type: 'Business', programme: 'Green Key',   status: 'review',   date: '2026-05-14', governorate: 'Capital',   Icon: KeyRound       },
]

const STATUS_CONFIG = {
  pending:  { label: 'Pending',   color: '#D97706', bg: '#FEF3C7', Icon: Clock         },
  review:   { label: 'In Review', color: '#2563EB', bg: '#DBEAFE', Icon: AlertCircle   },
  approved: { label: 'Approved',  color: '#059669', bg: '#D1FAE5', Icon: CheckCircle2  },
  rejected: { label: 'Rejected',  color: '#DC2626', bg: '#FEE2E2', Icon: XCircle       },
}

export default function ApplicationsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Status>('all')

  const filtered = APPLICATIONS.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.id.includes(search)
    const matchStatus = statusFilter === 'all' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  const counts = {
    all: APPLICATIONS.length,
    pending:  APPLICATIONS.filter(a => a.status === 'pending').length,
    review:   APPLICATIONS.filter(a => a.status === 'review').length,
    approved: APPLICATIONS.filter(a => a.status === 'approved').length,
    rejected: APPLICATIONS.filter(a => a.status === 'rejected').length,
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Applications</h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{APPLICATIONS.length} total applications</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </motion.div>

      {/* Status tabs */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'review', 'approved', 'rejected'] as Status[]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all"
              style={statusFilter === s
                ? { background: '#1E293B', color: '#fff' }
                : { background: '#fff', color: '#64748B', border: '1px solid #E2E8F0' }}
            >
              {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: statusFilter === s ? 'rgba(255,255,255,0.15)' : '#F1F5F9' }}>
                {counts[s]}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Search + filter */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }} className="flex gap-3">
        <div className="flex items-center gap-2.5 flex-1 max-w-sm px-3.5 py-2.5 rounded-xl bg-white" style={{ border: '1px solid #E2E8F0' }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or ID…"
            className="bg-transparent text-sm outline-none w-full"
            style={{ color: '#1E293B' }}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white" style={{ border: '1px solid #E2E8F0', color: '#64748B' }}>
          <Filter className="w-4 h-4" />
          Filter
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.14 }}>
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider" style={{ color: '#94A3B8' }}>Application</th>
                <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider hidden md:table-cell" style={{ color: '#94A3B8' }}>Programme</th>
                <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider hidden lg:table-cell" style={{ color: '#94A3B8' }}>Governorate</th>
                <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider hidden lg:table-cell" style={{ color: '#94A3B8' }}>Date</th>
                <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider" style={{ color: '#94A3B8' }}>Status</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#F8FAFC' }}>
              {filtered.map(app => {
                const cfg = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG]
                const StatusIcon = cfg.Icon
                const ProgIcon = app.Icon
                return (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F1F5F9' }}>
                          <ProgIcon className="w-4 h-4" style={{ color: '#64748B' }} />
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: '#1E293B' }}>{app.name}</p>
                          <p className="text-xs" style={{ color: '#94A3B8' }}>{app.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell" style={{ color: '#334155' }}>{app.programme}</td>
                    <td className="px-4 py-3.5 hidden lg:table-cell" style={{ color: '#334155' }}>{app.governorate}</td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-xs" style={{ color: '#94A3B8' }}>{app.date}</td>
                    <td className="px-4 py-3.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: cfg.bg }}>
                        <StatusIcon className="w-3 h-3" style={{ color: cfg.color }} />
                        <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" style={{ color: '#64748B' }}>
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center" style={{ color: '#94A3B8' }}>
              <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No applications found</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
