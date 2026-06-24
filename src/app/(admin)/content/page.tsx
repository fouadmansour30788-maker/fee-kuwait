'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, Eye, Image, FileText, Globe, Calendar, Tag } from 'lucide-react'

type Tab = 'news' | 'pages' | 'media'

const NEWS_ITEMS = [
  { id: 1, title: 'FEE Kuwait Certifies 50 New Schools in 2026', programme: 'Eco-Schools', status: 'published', date: '2026-05-20', author: 'Admin' },
  { id: 2, title: 'Blue Flag Beaches in Kuwait Expand to 18 Sites', programme: 'Blue Flag',   status: 'published', date: '2026-05-15', author: 'Admin' },
  { id: 3, title: 'Green Key Launches New Criteria for 2026–2027', programme: 'Green Key',   status: 'draft',     date: '2026-05-12', author: 'Admin' },
  { id: 4, title: 'YRE Competition Winners Announced',             programme: 'YRE',         status: 'published', date: '2026-05-08', author: 'Admin' },
  { id: 5, title: 'FEE Kuwait Annual Conference 2026 Recap',       programme: 'All',         status: 'scheduled', date: '2026-05-25', author: 'Admin' },
  { id: 6, title: 'LEAF Programme Expands to 28 Schools',          programme: 'LEAF',        status: 'draft',     date: '2026-05-05', author: 'Admin' },
]

const STATIC_PAGES = [
  { id: 1, title: 'About FEE Kuwait',     path: '/about',    status: 'published', updated: '2026-04-10' },
  { id: 2, title: 'Contact Us',           path: '/contact',  status: 'published', updated: '2026-03-22' },
  { id: 3, title: 'Privacy Policy',       path: '/privacy',  status: 'published', updated: '2026-01-15' },
  { id: 4, title: 'Terms of Service',     path: '/terms',    status: 'published', updated: '2026-01-15' },
  { id: 5, title: 'Partners Page',        path: '/partners', status: 'published', updated: '2026-04-28' },
]

const STATUS_STYLES = {
  published:  { label: 'Published',  color: '#7B8266', bg: '#E8ECE1' },
  draft:      { label: 'Draft',      color: '#64748B', bg: '#F1F5F9' },
  scheduled:  { label: 'Scheduled',  color: '#7C3AED', bg: '#EDE9FE' },
}

export default function ContentPage() {
  const [tab, setTab] = useState<Tab>('news')
  const [search, setSearch] = useState('')

  const filteredNews = NEWS_ITEMS.filter(n => n.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Content</h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Manage news, pages, and media</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #182019, #7B8266)' }}>
            <Plus className="w-4 h-4" />
            New Article
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: '#F1F5F9' }}>
          {([
            { key: 'news',  label: 'News Articles', Icon: FileText },
            { key: 'pages', label: 'Static Pages',  Icon: Globe    },
            { key: 'media', label: 'Media Library', Icon: Image    },
          ] as { key: Tab; label: string; Icon: React.ElementType }[]).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={tab === key
                ? { background: '#fff', color: '#0F172A', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                : { color: '#64748B' }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {tab === 'news' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
          <div className="flex items-center gap-2.5 max-w-sm px-3.5 py-2.5 rounded-xl bg-warmwhite" style={{ border: '1px solid #E2E8F0' }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles…" className="bg-transparent text-sm outline-none w-full" style={{ color: '#1E293B' }} />
          </div>

          <div className="bg-warmwhite rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {['Title', 'Programme', 'Status', 'Date', 'Author', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider" style={{ color: '#94A3B8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#F8FAFC' }}>
                {filteredNews.map(article => {
                  const s = STATUS_STYLES[article.status as keyof typeof STATUS_STYLES]
                  return (
                    <tr key={article.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium line-clamp-1" style={{ color: '#1E293B' }}>{article.title}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#F1F5F9', color: '#475569' }}>{article.programme}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: '#94A3B8' }}>{article.date}</td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: '#64748B' }}>{article.author}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" style={{ color: '#64748B' }}><Eye className="w-3.5 h-3.5" /></button>
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" style={{ color: '#64748B' }}><Edit2 className="w-3.5 h-3.5" /></button>
                          <button className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" style={{ color: '#EF4444' }}><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {tab === 'pages' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="bg-warmwhite rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {['Page Title', 'URL Path', 'Status', 'Last Updated', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider" style={{ color: '#94A3B8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#F8FAFC' }}>
                {STATIC_PAGES.map(page => {
                  const s = STATUS_STYLES[page.status as keyof typeof STATUS_STYLES]
                  return (
                    <tr key={page.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium" style={{ color: '#1E293B' }}>{page.title}</td>
                      <td className="px-5 py-3.5 font-mono text-xs" style={{ color: '#64748B' }}>{page.path}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: '#94A3B8' }}>{page.updated}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" style={{ color: '#64748B' }}><Edit2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {tab === 'media' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="border-2 border-dashed rounded-2xl p-16 text-center" style={{ borderColor: '#CBD5E1' }}>
            <Image className="w-10 h-10 mx-auto mb-4" style={{ color: '#94A3B8' }} />
            <p className="text-sm font-medium mb-1" style={{ color: '#475569' }}>Drop files here or click to upload</p>
            <p className="text-xs" style={{ color: '#94A3B8' }}>PNG, JPG, WebP, SVG up to 10MB</p>
            <button className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: '#1E293B', color: '#fff' }}>
              <Plus className="w-4 h-4" />
              Upload Files
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
