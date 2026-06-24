'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Search, Mail, Phone, Shield, Star, Users, ChevronDown } from 'lucide-react'

type Role = 'all' | 'admin' | 'assessor' | 'coordinator'

const STAFF = [
  {
    id: 1,
    name: 'Fatima Al-Rashid',
    role: 'admin',
    title: 'Programme Director',
    programmes: ['All'],
    email: 'fatima@feekuwait.org.kw',
    phone: '+965 2241 1000',
    since: '2019',
    avatar: 'FA',
    color: '#7C3AED',
    bg: '#EDE9FE',
  },
  {
    id: 2,
    name: 'Ahmad Mansour',
    role: 'assessor',
    title: 'Senior Assessor',
    programmes: ['Eco-Schools', 'LEAF'],
    email: 'ahmad@feekuwait.org.kw',
    phone: '+965 2241 1001',
    since: '2020',
    avatar: 'AM',
    color: '#7B8266',
    bg: '#E8ECE1',
  },
  {
    id: 3,
    name: 'Sara Al-Mutairi',
    role: 'coordinator',
    title: 'Programme Coordinator',
    programmes: ['Blue Flag', 'Green Key'],
    email: 'sara@feekuwait.org.kw',
    phone: '+965 2241 1002',
    since: '2021',
    avatar: 'SM',
    color: '#2563EB',
    bg: '#DBEAFE',
  },
  {
    id: 4,
    name: 'Khalid Al-Hamdan',
    role: 'assessor',
    title: 'Field Assessor',
    programmes: ['Eco-Schools'],
    email: 'khalid@feekuwait.org.kw',
    phone: '+965 2241 1003',
    since: '2021',
    avatar: 'KH',
    color: '#7B8266',
    bg: '#E8ECE1',
  },
  {
    id: 5,
    name: 'Noura Al-Sabah',
    role: 'admin',
    title: 'Operations Manager',
    programmes: ['All'],
    email: 'noura@feekuwait.org.kw',
    phone: '+965 2241 1004',
    since: '2020',
    avatar: 'NS',
    color: '#7C3AED',
    bg: '#EDE9FE',
  },
  {
    id: 6,
    name: 'Omar Al-Fahad',
    role: 'coordinator',
    title: 'YRE Coordinator',
    programmes: ['YRE', 'Eco-Campus'],
    email: 'omar@feekuwait.org.kw',
    phone: '+965 2241 1005',
    since: '2023',
    avatar: 'OF',
    color: '#2563EB',
    bg: '#DBEAFE',
  },
  {
    id: 7,
    name: 'Layla Al-Anzi',
    role: 'assessor',
    title: 'Environmental Assessor',
    programmes: ['Green Key', 'Blue Flag'],
    email: 'layla@feekuwait.org.kw',
    phone: '+965 2241 1006',
    since: '2022',
    avatar: 'LA',
    color: '#7B8266',
    bg: '#E8ECE1',
  },
  {
    id: 8,
    name: 'Yousef Al-Kandari',
    role: 'coordinator',
    title: 'Outreach Coordinator',
    programmes: ['Eco-Schools', 'YRE'],
    email: 'yousef@feekuwait.org.kw',
    phone: '+965 2241 1007',
    since: '2024',
    avatar: 'YK',
    color: '#2563EB',
    bg: '#DBEAFE',
  },
]

const ROLE_CONFIG = {
  admin:       { label: 'Admin',       color: '#7C3AED', bg: '#EDE9FE', Icon: Shield },
  assessor:    { label: 'Assessor',    color: '#7B8266', bg: '#E8ECE1', Icon: Star   },
  coordinator: { label: 'Coordinator', color: '#2563EB', bg: '#DBEAFE', Icon: Users  },
}

export default function StaffPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role>('all')

  const filtered = STAFF.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.title.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || s.role === roleFilter
    return matchSearch && matchRole
  })

  const counts = {
    all:         STAFF.length,
    admin:       STAFF.filter(s => s.role === 'admin').length,
    assessor:    STAFF.filter(s => s.role === 'assessor').length,
    coordinator: STAFF.filter(s => s.role === 'coordinator').length,
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Staff</h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{STAFF.length} team members</p>
          </div>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #182019, #7B8266)' }}
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        </div>
      </motion.div>

      {/* Role KPI cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="grid grid-cols-3 gap-4"
      >
        {(['admin', 'assessor', 'coordinator'] as const).map(role => {
          const cfg = ROLE_CONFIG[role]
          return (
            <div key={role} className="bg-warmwhite rounded-2xl p-5 border" style={{ borderColor: '#E2E8F0' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: cfg.bg }}>
                  <cfg.Icon className="w-4 h-4" style={{ color: cfg.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#0F172A' }}>{counts[role]}</p>
                  <p className="text-xs capitalize" style={{ color: '#64748B' }}>{cfg.label}s</p>
                </div>
              </div>
            </div>
          )
        })}
      </motion.div>

      {/* Filters + search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
        className="flex flex-wrap gap-3 items-center"
      >
        <div className="flex gap-2">
          {(['all', 'admin', 'assessor', 'coordinator'] as Role[]).map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className="px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all capitalize"
              style={roleFilter === r
                ? { background: '#1E293B', color: '#fff' }
                : { background: '#fff', color: '#64748B', border: '1px solid #E2E8F0' }}
            >
              {r === 'all' ? `All (${counts.all})` : `${ROLE_CONFIG[r].label}s (${counts[r]})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-warmwhite ml-auto" style={{ border: '1px solid #E2E8F0', minWidth: 220 }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search staff…"
            className="bg-transparent text-sm outline-none w-full"
            style={{ color: '#1E293B' }}
          />
        </div>
      </motion.div>

      {/* Staff grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.12 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((member, i) => {
            const roleCfg = ROLE_CONFIG[member.role as keyof typeof ROLE_CONFIG]
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="bg-warmwhite rounded-2xl border p-5 hover:shadow-md transition-shadow"
                style={{ borderColor: '#E2E8F0' }}
              >
                <div className="flex items-start gap-3 mb-4">
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
                    style={{ background: member.bg, color: member.color }}
                  >
                    {member.avatar}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm leading-snug" style={{ color: '#1E293B' }}>{member.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{member.title}</p>
                  </div>

                  {/* Role badge */}
                  <div
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold flex-shrink-0"
                    style={{ background: roleCfg.bg, color: roleCfg.color }}
                  >
                    <roleCfg.Icon className="w-2.5 h-2.5" />
                    {roleCfg.label}
                  </div>
                </div>

                {/* Programmes */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {member.programmes.map(p => (
                    <span
                      key={p}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{ background: '#F1F5F9', color: '#475569' }}
                    >
                      {p}
                    </span>
                  ))}
                </div>

                {/* Contact */}
                <div className="space-y-1.5 text-xs" style={{ color: '#64748B' }}>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#94A3B8' }} />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#94A3B8' }} />
                    {member.phone}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: '#F1F5F9' }}>
                  <span className="text-[11px]" style={{ color: '#94A3B8' }}>Member since {member.since}</span>
                  <button
                    className="text-[11px] font-semibold px-3 py-1 rounded-lg transition-colors hover:bg-slate-100"
                    style={{ color: '#475569' }}
                  >
                    Edit
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center bg-warmwhite rounded-2xl border" style={{ borderColor: '#E2E8F0', color: '#94A3B8' }}>
            <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No staff members found</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
