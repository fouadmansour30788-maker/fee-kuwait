'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Search, Download, RefreshCw, AlertTriangle, CheckCircle2, School, Waves, KeyRound, Leaf, Newspaper, GraduationCap } from 'lucide-react'

const CERTS = [
  { id: 'CERT-2025-0142', name: 'Kuwait Model School',       programme: 'Eco-Schools', issued: '2025-09-01', expires: '2026-08-31', status: 'active',  Icon: School,       color: '#8B9B88' },
  { id: 'CERT-2025-0141', name: 'Pearl Beach Resort',        programme: 'Blue Flag',   issued: '2025-06-15', expires: '2026-06-14', status: 'active',  Icon: Waves,        color: '#90E0EF' },
  { id: 'CERT-2025-0140', name: 'Hilton Kuwait Resort',      programme: 'Green Key',   issued: '2025-04-10', expires: '2026-04-09', status: 'active',  Icon: KeyRound,     color: '#C8A951' },
  { id: 'CERT-2025-0139', name: 'Al-Sabah Model School',     programme: 'Eco-Schools', issued: '2024-09-05', expires: '2025-09-04', status: 'expiring', Icon: School,      color: '#8B9B88' },
  { id: 'CERT-2025-0138', name: 'Gulf Science University',   programme: 'Eco-Campus',  issued: '2025-01-20', expires: '2026-01-19', status: 'active',  Icon: GraduationCap,color: '#8B9B88' },
  { id: 'CERT-2024-0137', name: 'Young Reporters Group',     programme: 'YRE',         issued: '2024-10-01', expires: '2025-09-30', status: 'expired', Icon: Newspaper,    color: '#A8DADC' },
  { id: 'CERT-2025-0136', name: 'Rumaithiya Secondary',      programme: 'LEAF',        issued: '2025-03-15', expires: '2026-03-14', status: 'active',  Icon: Leaf,         color: '#A9B6A4' },
  { id: 'CERT-2025-0135', name: 'Salmiya Park School',       programme: 'Eco-Schools', issued: '2025-09-01', expires: '2026-08-31', status: 'active',  Icon: School,       color: '#8B9B88' },
]

const STATUS_CONFIG = {
  active:   { label: 'Active',   color: '#7B8266', bg: '#E8ECE1', Icon: CheckCircle2  },
  expiring: { label: 'Expiring', color: '#D97706', bg: '#FEF3C7', Icon: AlertTriangle },
  expired:  { label: 'Expired',  color: '#DC2626', bg: '#FEE2E2', Icon: AlertTriangle },
}

export default function CertificatesPage() {
  const [search, setSearch] = useState('')

  const filtered = CERTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.id.includes(search)
  )

  const counts = {
    active: CERTS.filter(c => c.status === 'active').length,
    expiring: CERTS.filter(c => c.status === 'expiring').length,
    expired: CERTS.filter(c => c.status === 'expired').length,
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Certificates</h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{CERTS.length} certificates on record</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #182019, #7B8266)' }}>
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </motion.div>

      {/* Summary cards */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }} className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active', count: counts.active, color: '#7B8266', bg: '#E8ECE1', Icon: CheckCircle2 },
          { label: 'Expiring Soon', count: counts.expiring, color: '#D97706', bg: '#FEF3C7', Icon: AlertTriangle },
          { label: 'Expired', count: counts.expired, color: '#DC2626', bg: '#FEE2E2', Icon: AlertTriangle },
        ].map(s => (
          <div key={s.label} className="bg-warmwhite rounded-2xl p-5 border" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                <s.Icon className="w-4.5 h-4.5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: '#0F172A' }}>{s.count}</p>
                <p className="text-xs" style={{ color: '#64748B' }}>{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
        <div className="flex items-center gap-2.5 max-w-sm px-3.5 py-2.5 rounded-xl bg-warmwhite" style={{ border: '1px solid #E2E8F0' }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search certificates…"
            className="bg-transparent text-sm outline-none w-full"
            style={{ color: '#1E293B' }}
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.14 }}>
        <div className="bg-warmwhite rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {['Institution', 'Certificate ID', 'Programme', 'Issued', 'Expires', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider" style={{ color: '#94A3B8' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#F8FAFC' }}>
              {filtered.map(cert => {
                const cfg = STATUS_CONFIG[cert.status as keyof typeof STATUS_CONFIG]
                const StatusIcon = cfg.Icon
                const ProgIcon = cert.Icon
                return (
                  <tr key={cert.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${cert.color}14` }}>
                          <ProgIcon className="w-4 h-4" style={{ color: cert.color }} />
                        </div>
                        <span className="font-semibold" style={{ color: '#1E293B' }}>{cert.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs" style={{ color: '#64748B' }}>{cert.id}</td>
                    <td className="px-5 py-3.5" style={{ color: '#334155' }}>{cert.programme}</td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: '#94A3B8' }}>{cert.issued}</td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: '#94A3B8' }}>{cert.expires}</td>
                    <td className="px-5 py-3.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: cfg.bg }}>
                        <StatusIcon className="w-3 h-3" style={{ color: cfg.color }} />
                        <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" style={{ color: '#64748B' }} title="Download">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        {cert.status !== 'active' && (
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" style={{ color: '#64748B' }} title="Renew">
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        )}
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
