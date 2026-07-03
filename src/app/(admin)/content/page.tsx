'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Search, Edit2, Trash2, Eye, Image as ImageIcon, FileText, Globe,
  ArrowLeft, Save, Bold, Italic, Heading, List, Link2, X, CheckCircle2, Upload, Calendar,
} from 'lucide-react'

type Tab = 'news' | 'pages' | 'media'
type Status = 'published' | 'draft' | 'scheduled'
const PROGRAMMES = ['All', 'Eco-Schools', 'Blue Flag', 'Green Key', 'LEAF', 'YRE', 'Eco-Campus']

interface Article { id: string; title: string; programme: string; status: Status; date: string; author: string; excerpt: string; body: string; image: string }
interface Page { id: string; title: string; path: string; status: Status; updated: string; body: string }
interface MediaItem { id: string; name: string; url: string }

const STATUS_STYLES: Record<Status, { label: string; color: string; bg: string }> = {
  published: { label: 'Published', color: '#059669', bg: '#D1FAE5' },
  draft:     { label: 'Draft',     color: '#64748B', bg: '#F1F5F9' },
  scheduled: { label: 'Scheduled', color: '#7C3AED', bg: '#EDE9FE' },
}

const SEED_ARTICLES: Article[] = [
  { id: 'a1', title: 'FEE Kuwait Certifies 50 New Schools in 2026', programme: 'Eco-Schools', status: 'published', date: '2026-05-20', author: 'Mostafa Kanjo',
    excerpt: 'Fifty schools earned their Green Flag this year, the largest single cohort in the programme’s history in Kuwait.',
    body: '## A record year for Eco-Schools\n\nFifty schools across all six governorates completed the seven-step Eco-Schools methodology and earned their **Green Flag** in 2026.\n\nThe cohort logged more than 400 student-led actions across water, energy and waste. Highlights included:\n\n- A **30% water reduction** at Al-Noor Primary\n- Rooftop solar pilots at three secondary schools\n- A joint Young Reporters campaign on single-use plastics\n\nRegistration for the 2027 cycle opens in September.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=480&fit=crop&auto=format' },
  { id: 'a2', title: 'Blue Flag Beaches in Kuwait Expand to 18 Sites', programme: 'Blue Flag', status: 'published', date: '2026-05-15', author: 'Mostafa Kanjo',
    excerpt: 'Three new beaches met the Blue Flag water-quality and safety standard this season.',
    body: '## Kuwait’s coastline goes greener\n\nThree new beaches achieved **Blue Flag** status for the 2026 season, bringing the national total to 18.\n\nEach site passed independent water-quality sampling and safety audits.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=480&fit=crop&auto=format' },
  { id: 'a3', title: 'Green Key Launches New Criteria for 2026–2031', programme: 'Green Key', status: 'draft', date: '2026-05-12', author: 'Mostafa Kanjo',
    excerpt: 'The new criteria period introduces stronger imperative requirements on energy and biodiversity.',
    body: '## New Green Key criteria\n\nThe **2026–2031** criteria period is now in effect for hospitality establishments.\n\nKey changes:\n\n- New imperative criteria on **greenhouse-gas accounting**\n- Expanded **biodiversity protection** section\n- Progressive guideline targets each certification period',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c242fb5b?w=800&h=480&fit=crop&auto=format' },
  { id: 'a4', title: 'YRE Competition Winners Announced', programme: 'YRE', status: 'scheduled', date: '2026-06-01', author: 'Mostafa Kanjo',
    excerpt: 'The national Young Reporters for the Environment winners advance to the international round.',
    body: '## Young Reporters shine\n\nThis year’s national **YRE** winners will represent Kuwait in the international competition.',
    image: 'https://images.unsplash.com/photo-1503428593586-e225b39bddfe?w=800&h=480&fit=crop&auto=format' },
]

const SEED_PAGES: Page[] = [
  { id: 'p1', title: 'About FEE Kuwait', path: '/about', status: 'published', updated: '2026-04-10',
    body: '# About FEE Kuwait\n\nFEE Kuwait is the national operator for the Foundation for Environmental Education programmes in Kuwait.\n\nWe deliver **Eco-Schools**, **Blue Flag**, **Green Key**, **LEAF**, **YRE** and **Eco-Campus** certifications nationwide.' },
  { id: 'p2', title: 'Contact Us', path: '/contact', status: 'published', updated: '2026-03-22',
    body: '# Contact Us\n\nFirst Mall, 3rd Floor, Office 11, Salem Al Mubarak Street, Salmiya.\n\n- Phone: +965 64449334\n- Email: info@feebureaukw.org\n- Contact: Mostafa Kanjo' },
  { id: 'p3', title: 'Privacy Policy', path: '/privacy', status: 'published', updated: '2026-01-15',
    body: '# Privacy Policy\n\nThis policy explains how FEE Kuwait handles personal data submitted through the portal.' },
]

const SEED_MEDIA: MediaItem[] = [
  { id: 'm1', name: 'award-ceremony.jpg', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=260&fit=crop&auto=format' },
  { id: 'm2', name: 'blue-flag-beach.jpg', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=260&fit=crop&auto=format' },
  { id: 'm3', name: 'green-key-hotel.jpg', url: 'https://images.unsplash.com/photo-1551882547-ff40c242fb5b?w=400&h=260&fit=crop&auto=format' },
  { id: 'm4', name: 'campus.jpg', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=260&fit=crop&auto=format' },
]

// Minimal, safe markdown → HTML for the live preview.
function renderMarkdown(src: string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const inline = (s: string) => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#40916C;text-decoration:underline">$1</a>')
  const out: string[] = []
  let inList = false
  const closeList = () => { if (inList) { out.push('</ul>'); inList = false } }
  for (const raw of src.split('\n')) {
    const line = raw.trimEnd()
    if (/^##\s+/.test(line)) { closeList(); out.push(`<h2 style="font-size:1.2rem;font-weight:700;margin:1rem 0 .4rem;color:#0F172A">${inline(line.replace(/^##\s+/, ''))}</h2>`) }
    else if (/^#\s+/.test(line)) { closeList(); out.push(`<h1 style="font-size:1.55rem;font-weight:800;margin:1rem 0 .5rem;color:#0F172A">${inline(line.replace(/^#\s+/, ''))}</h1>`) }
    else if (/^-\s+/.test(line)) { if (!inList) { out.push('<ul style="margin:.4rem 0 .4rem 1.2rem;list-style:disc">'); inList = true } out.push(`<li style="margin:.15rem 0;color:#334155">${inline(line.replace(/^-\s+/, ''))}</li>`) }
    else if (line === '') { closeList() }
    else { closeList(); out.push(`<p style="margin:.5rem 0;line-height:1.7;color:#334155">${inline(line)}</p>`) }
  }
  closeList()
  return out.join('')
}

const today = () => new Date().toISOString().slice(0, 10)

export default function ContentPage() {
  const [tab, setTab] = useState<Tab>('news')
  const [search, setSearch] = useState('')
  const [articles, setArticles] = useState<Article[]>(SEED_ARTICLES)
  const [pages, setPages] = useState<Page[]>(SEED_PAGES)
  const [media, setMedia] = useState<MediaItem[]>(SEED_MEDIA)

  // Editor state
  const [editArticle, setEditArticle] = useState<Article | null>(null)
  const [editPage, setEditPage] = useState<Page | null>(null)
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  const filteredNews = articles.filter(n => n.title.toLowerCase().includes(search.toLowerCase()))

  function newArticle() {
    setEditArticle({ id: `a${Date.now()}`, title: '', programme: 'All', status: 'draft', date: today(), author: 'Mostafa Kanjo', excerpt: '', body: '', image: '' })
    setDirty(false); setSaved(false)
  }
  function newPage() {
    setEditPage({ id: `p${Date.now()}`, title: '', path: '/', status: 'draft', updated: today(), body: '' })
    setDirty(false); setSaved(false)
  }
  function saveArticle() {
    if (!editArticle) return
    setArticles(prev => prev.some(a => a.id === editArticle.id) ? prev.map(a => a.id === editArticle.id ? editArticle : a) : [editArticle, ...prev])
    setDirty(false); setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }
  function savePage() {
    if (!editPage) return
    const p = { ...editPage, updated: today() }
    setPages(prev => prev.some(x => x.id === p.id) ? prev.map(x => x.id === p.id ? p : x) : [p, ...prev])
    setEditPage(p); setDirty(false); setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  // Formatting toolbar acts on the body textarea of whichever doc is open.
  function surround(before: string, after = before) {
    const ta = bodyRef.current
    if (!ta) return
    const { selectionStart: s, selectionEnd: e, value } = ta
    const sel = value.slice(s, e) || 'text'
    const next = value.slice(0, s) + before + sel + after + value.slice(e)
    applyBody(next)
    requestAnimationFrame(() => { ta.focus(); ta.selectionStart = s + before.length; ta.selectionEnd = s + before.length + sel.length })
  }
  function prefixLine(prefix: string) {
    const ta = bodyRef.current
    if (!ta) return
    const { selectionStart: s, value } = ta
    const lineStart = value.lastIndexOf('\n', s - 1) + 1
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart)
    applyBody(next)
    requestAnimationFrame(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = s + prefix.length })
  }
  function applyBody(body: string) {
    setDirty(true)
    if (editArticle) setEditArticle({ ...editArticle, body })
    else if (editPage) setEditPage({ ...editPage, body })
  }

  /* ─────────────────────────── EDITOR VIEW ─────────────────────────── */
  if (editArticle || editPage) {
    const isArticle = !!editArticle
    const title = isArticle ? editArticle!.title : editPage!.title
    const body = isArticle ? editArticle!.body : editPage!.body
    const status = isArticle ? editArticle!.status : editPage!.status
    const save = isArticle ? saveArticle : savePage
    const close = () => { setEditArticle(null); setEditPage(null); setDirty(false); setSaved(false) }

    const setStatus = (st: Status) => { setDirty(true); if (isArticle) setEditArticle({ ...editArticle!, status: st }); else setEditPage({ ...editPage!, status: st }) }
    const setTitle = (t: string) => { setDirty(true); if (isArticle) setEditArticle({ ...editArticle!, title: t }); else setEditPage({ ...editPage!, title: t }) }

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button onClick={close} className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: '#64748B' }}>
            <ArrowLeft className="w-4 h-4" /> Back to content
          </button>
          <div className="flex items-center gap-2.5">
            {dirty && <span className="text-xs font-medium" style={{ color: '#B45309' }}>Unsaved changes</span>}
            {saved && <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: '#059669' }}><CheckCircle2 className="w-3.5 h-3.5" /> Saved</span>}
            <select value={status} onChange={e => setStatus(e.target.value as Status)}
              className="text-sm px-3 py-2 rounded-xl bg-white outline-none" style={{ border: '1px solid #E2E8F0', color: '#475569' }}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
            <button onClick={save} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Form */}
          <div className="bg-white rounded-2xl border p-6 space-y-4" style={{ borderColor: '#E2E8F0' }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#94A3B8' }}>{isArticle ? 'Article' : 'Page'} editor</p>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter a title…"
                className="w-full text-sm px-3 py-2.5 rounded-xl outline-none" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} />
            </div>

            {isArticle ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>Programme</label>
                  <select value={editArticle!.programme} onChange={e => { setDirty(true); setEditArticle({ ...editArticle!, programme: e.target.value }) }}
                    className="w-full text-sm px-3 py-2.5 rounded-xl outline-none bg-white" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }}>
                    {PROGRAMMES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>Date</label>
                  <input type="date" value={editArticle!.date} onChange={e => { setDirty(true); setEditArticle({ ...editArticle!, date: e.target.value }) }}
                    className="w-full text-sm px-3 py-2.5 rounded-xl outline-none" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>URL path</label>
                <input value={editPage!.path} onChange={e => { setDirty(true); setEditPage({ ...editPage!, path: e.target.value }) }} placeholder="/about"
                  className="w-full text-sm px-3 py-2.5 rounded-xl outline-none font-mono" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} />
              </div>
            )}

            {isArticle && (
              <>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>Cover image URL</label>
                  <input value={editArticle!.image} onChange={e => { setDirty(true); setEditArticle({ ...editArticle!, image: e.target.value }) }} placeholder="https://…"
                    className="w-full text-sm px-3 py-2.5 rounded-xl outline-none" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>Excerpt</label>
                  <textarea value={editArticle!.excerpt} onChange={e => { setDirty(true); setEditArticle({ ...editArticle!, excerpt: e.target.value }) }} rows={2}
                    placeholder="Short summary shown on cards…"
                    className="w-full text-sm px-3 py-2.5 rounded-xl outline-none resize-none" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>Body</label>
              {/* Formatting toolbar */}
              <div className="flex items-center gap-1 mb-2 p-1 rounded-lg w-fit" style={{ background: '#F1F5F9' }}>
                {[
                  { Icon: Heading, fn: () => prefixLine('## '), t: 'Heading' },
                  { Icon: Bold, fn: () => surround('**'), t: 'Bold' },
                  { Icon: Italic, fn: () => surround('*'), t: 'Italic' },
                  { Icon: List, fn: () => prefixLine('- '), t: 'List' },
                  { Icon: Link2, fn: () => surround('[', '](https://)'), t: 'Link' },
                ].map(({ Icon, fn, t }) => (
                  <button key={t} onClick={fn} title={t} className="p-1.5 rounded-md hover:bg-white transition-colors" style={{ color: '#475569' }}>
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
              <textarea ref={bodyRef} value={body} onChange={e => applyBody(e.target.value)} rows={14}
                placeholder="Write your content… Use the toolbar or Markdown (## heading, **bold**, - list)."
                className="w-full text-sm px-3 py-2.5 rounded-xl outline-none resize-y font-mono leading-relaxed" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} />
              <p className="text-[11px] mt-1.5" style={{ color: '#94A3B8' }}>Supports Markdown: <code>## Heading</code>, <code>**bold**</code>, <code>*italic*</code>, <code>- list</code>, <code>[link](url)</code>.</p>
            </div>
          </div>

          {/* Live preview */}
          <div className="lg:sticky lg:top-6 self-start w-full">
            <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: '#94A3B8' }}>
              <Eye className="w-3.5 h-3.5" /> Live preview
            </div>
            <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
              {isArticle && editArticle!.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={editArticle!.image} alt="" className="w-full h-52 object-cover" />
              )}
              <div className="p-6">
                {isArticle && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#ECFDF3', color: '#1B4332' }}>{editArticle!.programme}</span>
                )}
                <h1 className="text-2xl font-bold mt-3" style={{ color: '#0F172A' }}>{title || 'Untitled'}</h1>
                {isArticle && (
                  <p className="flex items-center gap-1.5 text-xs mt-2" style={{ color: '#94A3B8' }}>
                    <Calendar className="w-3.5 h-3.5" /> {editArticle!.date} · {editArticle!.author}
                  </p>
                )}
                {isArticle && editArticle!.excerpt && (
                  <p className="text-sm mt-3 font-medium" style={{ color: '#475569' }}>{editArticle!.excerpt}</p>
                )}
                {!isArticle && <p className="text-xs font-mono mt-1" style={{ color: '#94A3B8' }}>{editPage!.path}</p>}
                <div className="mt-4" dangerouslySetInnerHTML={{ __html: renderMarkdown(body || '_Nothing yet — start writing._') }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ─────────────────────────── LIST VIEW ─────────────────────────── */
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Content</h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Create and manage news, pages and media — no developer needed.</p>
          </div>
          {tab === 'news' && (
            <button onClick={newArticle} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
              <Plus className="w-4 h-4" /> New Article
            </button>
          )}
          {tab === 'pages' && (
            <button onClick={newPage} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
              <Plus className="w-4 h-4" /> New Page
            </button>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: '#F1F5F9' }}>
        {([
          { key: 'news', label: 'News Articles', Icon: FileText },
          { key: 'pages', label: 'Static Pages', Icon: Globe },
          { key: 'media', label: 'Media Library', Icon: ImageIcon },
        ] as { key: Tab; label: string; Icon: React.ElementType }[]).map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={tab === key ? { background: '#fff', color: '#0F172A', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' } : { color: '#64748B' }}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab === 'news' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
          <div className="flex items-center gap-2.5 max-w-sm px-3.5 py-2.5 rounded-xl bg-white" style={{ border: '1px solid #E2E8F0' }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles…" className="bg-transparent text-sm outline-none w-full" style={{ color: '#1E293B' }} />
          </div>
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
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
                  const s = STATUS_STYLES[article.status]
                  return (
                    <tr key={article.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5"><p className="font-medium line-clamp-1" style={{ color: '#1E293B' }}>{article.title}</p></td>
                      <td className="px-5 py-3.5"><span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#F1F5F9', color: '#475569' }}>{article.programme}</span></td>
                      <td className="px-5 py-3.5"><span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: s.bg, color: s.color }}>{s.label}</span></td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: '#94A3B8' }}>{article.date}</td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: '#64748B' }}>{article.author}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => { setEditArticle(article); setDirty(false); setSaved(false) }} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" style={{ color: '#64748B' }} title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setArticles(prev => prev.filter(a => a.id !== article.id))} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" style={{ color: '#EF4444' }} title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredNews.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: '#94A3B8' }}>No articles. Click “New Article” to create one.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {tab === 'pages' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {['Page Title', 'URL Path', 'Status', 'Last Updated', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider" style={{ color: '#94A3B8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#F8FAFC' }}>
                {pages.map(page => {
                  const s = STATUS_STYLES[page.status]
                  return (
                    <tr key={page.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium" style={{ color: '#1E293B' }}>{page.title}</td>
                      <td className="px-5 py-3.5 font-mono text-xs" style={{ color: '#64748B' }}>{page.path}</td>
                      <td className="px-5 py-3.5"><span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: s.bg, color: s.color }}>{s.label}</span></td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: '#94A3B8' }}>{page.updated}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => { setEditPage(page); setDirty(false); setSaved(false) }} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" style={{ color: '#64748B' }} title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setPages(prev => prev.filter(p => p.id !== page.id))} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" style={{ color: '#EF4444' }} title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
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
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map(m => (
              <div key={m.id} className="group relative rounded-xl overflow-hidden border" style={{ borderColor: '#E2E8F0' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.name} className="w-full h-32 object-cover" />
                <div className="p-2 flex items-center justify-between gap-2">
                  <span className="text-xs truncate" style={{ color: '#475569' }}>{m.name}</span>
                  <button onClick={() => setMedia(prev => prev.filter(x => x.id !== m.id))} className="p-1 rounded hover:bg-red-50" style={{ color: '#EF4444' }} title="Remove"><X className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-2 border-dashed rounded-2xl p-10 text-center" style={{ borderColor: '#CBD5E1' }}>
            <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: '#94A3B8' }} />
            <p className="text-sm font-medium mb-3" style={{ color: '#475569' }}>Add an image by URL (demo)</p>
            <AddMedia onAdd={(url, name) => setMedia(prev => [{ id: `m${Date.now()}`, url, name }, ...prev])} />
          </div>
        </motion.div>
      )}
    </div>
  )
}

function AddMedia({ onAdd }: { onAdd: (url: string, name: string) => void }) {
  const [url, setUrl] = useState('')
  return (
    <div className="flex items-center gap-2 max-w-md mx-auto">
      <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…/image.jpg"
        className="flex-1 text-sm px-3 py-2 rounded-xl outline-none bg-white" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} />
      <button onClick={() => { if (url.trim()) { onAdd(url.trim(), url.split('/').pop() || 'image'); setUrl('') } }}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#1E293B' }}>
        <Plus className="w-4 h-4" /> Add
      </button>
    </div>
  )
}
