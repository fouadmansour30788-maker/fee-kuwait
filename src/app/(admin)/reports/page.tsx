'use client'

import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Download, School, Waves, KeyRound, Leaf, Newspaper, GraduationCap } from 'lucide-react'

const MONTHLY_DATA = [
  { month: 'Jan', applications: 8,  certifications: 5  },
  { month: 'Feb', applications: 12, certifications: 9  },
  { month: 'Mar', applications: 15, certifications: 11 },
  { month: 'Apr', applications: 10, certifications: 8  },
  { month: 'May', applications: 18, certifications: 14 },
]

const PROGRAMME_DATA = [
  { name: 'Eco-Schools', certified: 142, pending: 8,  growth: '+12%', Icon: School,       color: '#52B788' },
  { name: 'Blue Flag',   certified: 18,  pending: 2,  growth: '+6%',  Icon: Waves,        color: '#90E0EF' },
  { name: 'Green Key',   certified: 34,  pending: 3,  growth: '+9%',  Icon: KeyRound,     color: '#C8A951' },
  { name: 'LEAF',        certified: 28,  pending: 2,  growth: '+14%', Icon: Leaf,         color: '#74C69D' },
  { name: 'YRE',         certified: 19,  pending: 1,  growth: '+5%',  Icon: Newspaper,    color: '#A8DADC' },
  { name: 'Eco-Campus',  certified: 7,   pending: 1,  growth: '+40%', Icon: GraduationCap, color: '#52B788' },
]

const GOVERNORATE_DATA = [
  { name: 'Hawalli',    count: 62 },
  { name: 'Capital',    count: 48 },
  { name: 'Ahmadi',     count: 38 },
  { name: 'Farwaniya',  count: 35 },
  { name: 'Salmiya',    count: 29 },
  { name: 'Jahra',      count: 24 },
  { name: 'Mubarak Al-Kabeer', count: 12 },
]

const maxGov = Math.max(...GOVERNORATE_DATA.map(g => g.count))
const maxMonth = Math.max(...MONTHLY_DATA.map(m => m.applications))

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
      {children}
    </motion.div>
  )
}

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Reports & Analytics</h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Programme performance · Jan–May 2026</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </FadeIn>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Certified', value: '248',  delta: '+42 YTD',   color: '#059669', bg: '#D1FAE5' },
          { label: 'Renewal Rate',    value: '94%',  delta: '+2% vs 2025', color: '#3B82F6', bg: '#DBEAFE' },
          { label: 'Avg Review Days', value: '8.4',  delta: '-1.2 days',  color: '#7C3AED', bg: '#EDE9FE' },
          { label: 'Active Regions',  value: '7',    delta: 'All Kuwait',  color: '#F59E0B', bg: '#FEF3C7' },
        ].map((s, i) => (
          <FadeIn key={s.label} delay={i * 0.06}>
            <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: '#E2E8F0' }}>
              <p className="text-3xl font-bold mb-1" style={{ color: '#0F172A' }}>{s.value}</p>
              <p className="text-xs font-medium" style={{ color: '#64748B' }}>{s.label}</p>
              <p className="text-[11px] mt-1 font-medium" style={{ color: s.color }}>{s.delta}</p>
            </div>
          </FadeIn>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly bar chart */}
        <FadeIn delay={0.24}>
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-4 h-4" style={{ color: '#40916C' }} />
              <h2 className="font-bold text-sm" style={{ color: '#0F172A' }}>Monthly Activity</h2>
            </div>
            <div className="flex items-end gap-3 h-40">
              {MONTHLY_DATA.map(m => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-1 items-end" style={{ height: '7rem' }}>
                    <div
                      className="flex-1 rounded-t-lg transition-all duration-700"
                      style={{ height: `${(m.applications / maxMonth) * 100}%`, background: '#BFDBFE' }}
                    />
                    <div
                      className="flex-1 rounded-t-lg transition-all duration-700"
                      style={{ height: `${(m.certifications / maxMonth) * 100}%`, background: '#40916C' }}
                    />
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: '#94A3B8' }}>{m.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-200" /><span className="text-xs" style={{ color: '#64748B' }}>Applications</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ background: '#40916C' }} /><span className="text-xs" style={{ color: '#64748B' }}>Certified</span></div>
            </div>
          </div>
        </FadeIn>

        {/* By governorate */}
        <FadeIn delay={0.30}>
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4" style={{ color: '#40916C' }} />
              <h2 className="font-bold text-sm" style={{ color: '#0F172A' }}>By Governorate</h2>
            </div>
            <div className="space-y-3">
              {GOVERNORATE_DATA.map(g => (
                <div key={g.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: '#334155' }}>{g.name}</span>
                    <span className="font-bold" style={{ color: '#0F172A' }}>{g.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(g.count / maxGov) * 100}%`, background: 'linear-gradient(90deg, #40916C, #74C69D)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Per-programme table */}
      <FadeIn delay={0.36}>
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: '#F1F5F9' }}>
            <h2 className="font-bold text-sm" style={{ color: '#0F172A' }}>Programme Performance</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {['Programme', 'Certified', 'Pending', 'YTD Growth'].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: '#94A3B8' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#F8FAFC' }}>
              {PROGRAMME_DATA.map(p => {
                const Icon = p.Icon
                return (
                  <tr key={p.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${p.color}18` }}>
                          <Icon className="w-3.5 h-3.5" style={{ color: p.color }} />
                        </div>
                        <span className="font-medium" style={{ color: '#1E293B' }}>{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-bold" style={{ color: '#0F172A' }}>{p.certified}</td>
                    <td className="px-5 py-3.5" style={{ color: '#64748B' }}>{p.pending}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#D1FAE5', color: '#059669' }}>{p.growth}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </FadeIn>
    </div>
  )
}
