'use client'

import { useState, useTransition } from 'react'
import { MessageSquareQuote, Save, Loader2, Check, AlertCircle, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { saveTestimonials } from '@/lib/actions/siteContent'
import type { Testimonial } from '@/lib/testimonials'

const field = { border: '1px solid #E2E8F0', color: '#1E293B' } as const
const inp = 'w-full text-sm px-3 py-2 rounded-lg outline-none'

const BLANK: Testimonial = { quote_en: '', quote_ar: '', name_en: '', name_ar: '', role_en: '', role_ar: '', initials: '', programme: '', color: '#40916C' }

export default function TestimonialsManager({ testimonials }: { testimonials: Testimonial[] }) {
  const [items, setItems] = useState<Testimonial[]>(testimonials)
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null)

  const set = (i: number, p: Partial<Testimonial>) => setItems((s) => s.map((x, idx) => (idx === i ? { ...x, ...p } : x)))
  const move = (i: number, d: -1 | 1) => setItems((s) => { const j = i + d; if (j < 0 || j >= s.length) return s; const n = [...s]; [n[i], n[j]] = [n[j], n[i]]; return n })

  function save() {
    setMsg(null)
    start(async () => { const r = await saveTestimonials(items); setMsg(r.error ? { text: r.error } : { ok: true, text: 'Testimonials saved.' }) })
  }
  const L = (t: string) => <label className="block text-[11px] font-semibold mb-1" style={{ color: '#475569' }}>{t}</label>

  return (
    <div className="bg-white rounded-2xl border p-6 space-y-4" style={{ borderColor: '#E2E8F0' }}>
      <div className="flex items-center gap-2">
        <MessageSquareQuote className="w-4 h-4" style={{ color: '#40916C' }} />
        <h2 className="text-base font-bold flex-1" style={{ color: '#0F172A' }}>Testimonials (Voices From Our Community)</h2>
        <button onClick={() => setItems((s) => [...s, { ...BLANK }])} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: '#F1F5F9', color: '#334155' }}><Plus className="w-3.5 h-3.5" /> Add</button>
        <button onClick={save} disabled={pending} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
          {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
        </button>
      </div>

      <div className="space-y-4">
        {items.map((t, i) => (
          <div key={i} className="rounded-xl p-4 space-y-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold" style={{ color: '#64748B' }}>#{i + 1}</span>
              <div className="flex-1" />
              <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: '#64748B' }}><ChevronUp className="w-4 h-4" /></button>
              <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: '#64748B' }}><ChevronDown className="w-4 h-4" /></button>
              <button onClick={() => setItems((s) => s.filter((_, idx) => idx !== i))} className="p-1.5 rounded-lg" style={{ color: '#DC2626' }}><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>{L('Quote (English)')}<textarea value={t.quote_en} onChange={(e) => set(i, { quote_en: e.target.value })} rows={3} className={`${inp} resize-y`} style={field} /></div>
              <div>{L('الاقتباس (Arabic)')}<textarea value={t.quote_ar} onChange={(e) => set(i, { quote_ar: e.target.value })} rows={3} dir="rtl" className={`${inp} resize-y`} style={field} /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>{L('Name (English)')}<input value={t.name_en} onChange={(e) => set(i, { name_en: e.target.value })} className={inp} style={field} /></div>
              <div>{L('الاسم (Arabic)')}<input value={t.name_ar} onChange={(e) => set(i, { name_ar: e.target.value })} dir="rtl" className={inp} style={field} /></div>
              <div>{L('Role (English)')}<input value={t.role_en} onChange={(e) => set(i, { role_en: e.target.value })} className={inp} style={field} /></div>
              <div>{L('الدور (Arabic)')}<input value={t.role_ar} onChange={(e) => set(i, { role_ar: e.target.value })} dir="rtl" className={inp} style={field} /></div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>{L('Programme label')}<input value={t.programme} onChange={(e) => set(i, { programme: e.target.value })} placeholder="e.g. Green Key" className={inp} style={field} /></div>
              <div>{L('Initials')}<input value={t.initials} onChange={(e) => set(i, { initials: e.target.value })} placeholder="e.g. SR" className={inp} style={field} /></div>
              <div>{L('Colour')}<input type="color" value={t.color} onChange={(e) => set(i, { color: e.target.value })} className="w-full h-9 px-1 py-1 rounded-lg outline-none" style={field} /></div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-center py-6" style={{ color: '#94A3B8' }}>No testimonials — add one above.</p>}
      </div>

      {msg && <p className="flex items-center gap-1.5 text-sm" style={{ color: msg.ok ? '#047857' : '#DC2626' }}>{msg.ok ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} {msg.text}</p>}
    </div>
  )
}
