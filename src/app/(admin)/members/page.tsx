'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, School, Building2, GraduationCap, MapPin, Users, Phone, Mail, ExternalLink } from 'lucide-react'

type TypeFilter = 'all' | 'school' | 'business' | 'university'

const MEMBERS = [
  { id: 1, name: 'Kuwait Model School',         type: 'school',     programme: 'Eco-Schools', students: 820,  contact: 'ahmed@kwschool.edu.kw', phone: '+965 2234 5678', governorate: 'Hawalli',    since: '2021' },
  { id: 2, name: 'Al-Sabah Model School',        type: 'school',     programme: 'Eco-Schools', students: 950,  contact: 'info@sabah.edu.kw',      phone: '+965 2245 6789', governorate: 'Capital',    since: '2020' },
  { id: 3, name: 'Rumaithiya Secondary School',  type: 'school',     programme: 'LEAF',        students: 640,  contact: 'admin@rum.edu.kw',        phone: '+965 2256 7890', governorate: 'Hawalli',    since: '2023' },
  { id: 4, name: 'Pearl Beach Resort',           type: 'business',   programme: 'Blue Flag',   students: 0,    contact: 'gm@pearlbeach.kw',        phone: '+965 2267 8901', governorate: 'Ahmadi',     since: '2022' },
  { id: 5, name: 'Hilton Kuwait Resort',         type: 'business',   programme: 'Green Key',   students: 0,    contact: 'eco@hilton.kw',            phone: '+965 2278 9012', governorate: 'Capital',    since: '2021' },
  { id: 6, name: 'Gulf Science University',      type: 'university', programme: 'Eco-Campus',  students: 8400, contact: 'sustainability@gsu.edu.kw', phone: '+965 2289 0123', governorate: 'Salmiya',    since: '2024' },
  { id: 7, name: 'Marina Bay Hotel',             type: 'business',   programme: 'Blue Flag',   students: 0,    contact: 'manager@marina.kw',        phone: '+965 2290 1234', governorate: 'Ahmadi',     since: '2023' },
  { id: 8, name: 'Salmiya Park School',          type: 'school',     programme: 'Eco-Schools', students: 710,  contact: 'info@salmiya.edu.kw',      phone: '+965 2201 2345', governorate: 'Hawalli',    since: '2022' },
  { id: 9, name: 'Young Reporters Kuwait',       type: 'school',     programme: 'YRE',         students: 280,  contact: 'yre@kwjournalism.kw',       phone: '+965 2212 3456', governorate: 'Capital',    since: '2023' },
]

const TYPE_ICONS = { school: School, business: Building2, university: GraduationCap }
const TYPE_COLORS = { school: '#8B9B88', business: '#C8A951', university: '#3B82F6' }
const TYPE_BG = { school: '#E8ECE1', business: '#FEF3C7', university: '#DBEAFE' }

export default function MembersPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')

  const filtered = MEMBERS.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.governorate.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || m.type === typeFilter
    return matchSearch && matchType
  })

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Members</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{MEMBERS.length} registered member institutions</p>
      </motion.div>

      {/* Type filter */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }} className="flex gap-2 flex-wrap">
        {(['all', 'school', 'business', 'university'] as TypeFilter[]).map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className="px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all capitalize"
            style={typeFilter === t
              ? { background: '#1E293B', color: '#fff' }
              : { background: '#fff', color: '#64748B', border: '1px solid #E2E8F0' }}
          >
            {t === 'all' ? `All (${MEMBERS.length})` : `${t.charAt(0).toUpperCase() + t.slice(1)}s (${MEMBERS.filter(m => m.type === t).length})`}
          </button>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }}>
        <div className="flex items-center gap-2.5 max-w-sm px-3.5 py-2.5 rounded-xl bg-warmwhite" style={{ border: '1px solid #E2E8F0' }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members…" className="bg-transparent text-sm outline-none w-full" style={{ color: '#1E293B' }} />
        </div>
      </motion.div>

      {/* Cards grid */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.12 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(member => {
            const Icon = TYPE_ICONS[member.type as keyof typeof TYPE_ICONS]
            const color = TYPE_COLORS[member.type as keyof typeof TYPE_COLORS]
            const bg = TYPE_BG[member.type as keyof typeof TYPE_BG]
            return (
              <div key={member.id} className="bg-warmwhite rounded-2xl border p-5 hover:shadow-md transition-shadow" style={{ borderColor: '#E2E8F0' }}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm leading-snug" style={{ color: '#1E293B' }}>{member.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{member.programme} · Since {member.since}</p>
                  </div>
                  <button className="p-1 rounded-lg hover:bg-slate-100" style={{ color: '#94A3B8' }}>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs" style={{ color: '#64748B' }}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    {member.governorate}
                  </div>
                  {member.students > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 flex-shrink-0" />
                      {member.students.toLocaleString()} students
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{member.contact}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    {member.phone}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center bg-warmwhite rounded-2xl border" style={{ borderColor: '#E2E8F0', color: '#94A3B8' }}>
            <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No members found</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
