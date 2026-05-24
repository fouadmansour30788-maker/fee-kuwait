'use client'

import { motion } from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { TrendingUp, Award, School, Building2 } from 'lucide-react'

/* ── Data ───────────────────────────────────────────────── */

const MONTHLY = [
  { month: 'Jan', Applications: 8,  Certifications: 5,  Renewals: 3 },
  { month: 'Feb', Applications: 12, Certifications: 9,  Renewals: 5 },
  { month: 'Mar', Applications: 15, Certifications: 11, Renewals: 7 },
  { month: 'Apr', Applications: 10, Certifications: 8,  Renewals: 4 },
  { month: 'May', Applications: 18, Certifications: 14, Renewals: 9 },
]

const PROGRAMME_PIE = [
  { name: 'Eco-Schools', value: 142, color: '#52B788' },
  { name: 'Green Key',   value: 34,  color: '#C8A951' },
  { name: 'LEAF',        value: 28,  color: '#40916C' },
  { name: 'YRE',         value: 19,  color: '#7C3AED' },
  { name: 'Blue Flag',   value: 18,  color: '#3B9ECC' },
  { name: 'Eco-Campus',  value: 7,   color: '#1B4332' },
]

const GOV_DATA = [
  { name: 'Hawalli',           Certified: 62, Pending: 5 },
  { name: 'Capital',           Certified: 48, Pending: 8 },
  { name: 'Ahmadi',            Certified: 38, Pending: 3 },
  { name: 'Farwaniya',         Certified: 35, Pending: 6 },
  { name: 'Salmiya',           Certified: 29, Pending: 2 },
  { name: 'Jahra',             Certified: 24, Pending: 4 },
  { name: 'Mubarak Al-Kabeer', Certified: 12, Pending: 1 },
]

const YEARLY = [
  { year: '2019', Schools: 12,  Businesses: 5  },
  { year: '2020', Schools: 24,  Businesses: 12 },
  { year: '2021', Schools: 38,  Businesses: 22 },
  { year: '2022', Schools: 67,  Businesses: 41 },
  { year: '2023', Schools: 112, Businesses: 68 },
  { year: '2024', Schools: 145, Businesses: 89 },
  { year: '2025', Schools: 160, Businesses: 96 },
]

/* ── Custom tooltip ─────────────────────────────────────── */

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border rounded-xl px-3 py-2.5 shadow-lg text-xs" style={{ borderColor: '#E2E8F0' }}>
      <p className="font-bold mb-1.5" style={{ color: '#0F172A' }}>{label}</p>
      {payload.map(entry => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span style={{ color: '#64748B' }}>{entry.name}:</span>
          <span className="font-semibold" style={{ color: '#1E293B' }}>{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

function PieLabel({ cx, cy, midAngle, outerRadius, name, percent }: { cx: number; cy: number; midAngle: number; outerRadius: number; name: string; percent: number }) {
  if (percent < 0.05) return null
  const rad = Math.PI / 180
  const x = cx + (outerRadius + 22) * Math.cos(-midAngle * rad)
  const y = cy + (outerRadius + 22) * Math.sin(-midAngle * rad)
  return (
    <text x={x} y={y} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" style={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }}>
      {name} {(percent * 100).toFixed(0)}%
    </text>
  )
}

/* ── Page ───────────────────────────────────────────────── */

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Analytics</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Interactive dashboards · Jan–May 2026</p>
      </motion.div>

      {/* KPI row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Certified',  value: '248', delta: '+42 YTD',      color: '#059669', bg: '#D1FAE5', Icon: Award      },
          { label: 'Schools',          value: '160', delta: '+18 this year', color: '#3B82F6', bg: '#DBEAFE', Icon: School     },
          { label: 'Businesses',       value: '88',  delta: '+7 this year',  color: '#D97706', bg: '#FEF3C7', Icon: Building2  },
          { label: 'Active Regions',   value: '7',   delta: 'All Kuwait',    color: '#7C3AED', bg: '#EDE9FE', Icon: TrendingUp },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 + i * 0.05 }}
            className="bg-white rounded-2xl p-5 border"
            style={{ borderColor: '#E2E8F0' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                <kpi.Icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
              <span className="text-[11px] font-semibold" style={{ color: kpi.color }}>{kpi.delta}</span>
            </div>
            <p className="text-3xl font-bold" style={{ color: '#0F172A' }}>{kpi.value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{kpi.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Monthly activity */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.18 }}>
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <h2 className="font-bold text-sm mb-6" style={{ color: '#0F172A' }}>Monthly Activity — Jan to May 2026</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={MONTHLY} margin={{ top: 4, right: 16, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 16 }} />
              <Line type="monotone" dataKey="Applications"   stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4, fill: '#3B82F6' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Certifications" stroke="#52B788" strokeWidth={2.5} dot={{ r: 4, fill: '#52B788' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Renewals"       stroke="#C8A951" strokeWidth={2.5} dot={{ r: 4, fill: '#C8A951' }} activeDot={{ r: 6 }} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Pie + Bar row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.24 }}
        className="grid lg:grid-cols-2 gap-6"
      >
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <h2 className="font-bold text-sm mb-6" style={{ color: '#0F172A' }}>Certified Sites by Programme</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={PROGRAMME_PIE}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={PieLabel as never}
              >
                {PROGRAMME_PIE.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
            {PROGRAMME_PIE.map(p => (
              <div key={p.name} className="flex items-center gap-1.5 text-xs" style={{ color: '#64748B' }}>
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: p.color }} />
                {p.name}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <h2 className="font-bold text-sm mb-6" style={{ color: '#0F172A' }}>Certified Sites by Governorate</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={GOV_DATA} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={110} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="Certified" fill="#52B788" radius={[0, 4, 4, 0]} barSize={10} />
              <Bar dataKey="Pending"   fill="#FDE68A" radius={[0, 4, 4, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Year-over-year growth */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.30 }}>
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
          <h2 className="font-bold text-sm mb-6" style={{ color: '#0F172A' }}>Cumulative Growth 2019 – 2025</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={YEARLY} margin={{ top: 4, right: 16, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="gradSchools" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#52B788" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#52B788" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradBiz" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.20} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 16 }} />
              <Area type="monotone" dataKey="Schools"    stroke="#52B788" strokeWidth={2.5} fill="url(#gradSchools)" dot={false} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="Businesses" stroke="#3B82F6" strokeWidth={2.5} fill="url(#gradBiz)"     dot={false} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}
