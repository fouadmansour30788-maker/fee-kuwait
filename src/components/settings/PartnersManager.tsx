'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Handshake, Plus, Save, Loader2, Trash2, ChevronUp, ChevronDown, Pencil, X, Check, AlertCircle, EyeOff } from 'lucide-react'
import { savePartner, deletePartner, reorderPartner } from '@/lib/actions/siteContent'
import type { DbPartner } from '@/lib/db/sitePartners'

const field = { border: '1px solid #E2E8F0', color: '#1E293B' } as const
const TYPES = [{ v: 'government', l: 'Government' }, { v: 'corporate', l: 'Corporate' }, { v: 'institutional', l: 'Institutional' }]
const TYPE_LABEL: Record<string, string> = { government: 'Government', corporate: 'Corporate', institutional: 'Institutional' }

function PartnerForm({ partner, onDone }: { partner?: DbPartner; onDone: () => void }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    start(async () => { const r = await savePartner(fd); if (r.error) setError(r.error); else { router.refresh(); onDone() } })
  }

  const l = (t: string) => <label className="block text-[11px] font-semibold mb-1" style={{ color: '#475569' }}>{t}</label>
  return (
    <form onSubmit={submit} className="rounded-xl p-4 space-y-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
      {partner && <input type="hidden" name="id" value={partner.id} />}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>{l('Name (English)')}<input name="name_en" defaultValue={partner?.name_en ?? ''} required className="w-full text-sm px-3 py-2 rounded-lg outline-none" style={field} /></div>
        <div>{l('الاسم (Arabic)')}<input name="name_ar" defaultValue={partner?.name_ar ?? ''} dir="rtl" className="w-full text-sm px-3 py-2 rounded-lg outline-none" style={field} /></div>
      </div>
      <div className="grid sm:grid-cols-4 gap-3">
        <div>{l('Type')}<select name="type" defaultValue={partner?.type ?? 'government'} className="w-full text-sm px-3 py-2 rounded-lg outline-none bg-white" style={field}>{TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}</select></div>
        <div>{l('Initials')}<input name="initials" defaultValue={partner?.initials ?? ''} placeholder="e.g. KEPA" className="w-full text-sm px-3 py-2 rounded-lg outline-none" style={field} /></div>
        <div>{l('Colour')}<input name="color" type="color" defaultValue={partner?.color ?? '#40916C'} className="w-full h-9 px-1 py-1 rounded-lg outline-none" style={field} /></div>
        <div className="flex items-end pb-1"><label className="inline-flex items-center gap-2 text-xs font-semibold" style={{ color: '#475569' }}><input type="checkbox" name="active" defaultChecked={partner ? partner.active : true} /> Visible</label></div>
      </div>
      <div>{l('Logo URL (optional — falls back to initials)')}<input name="logo_url" defaultValue={partner?.logo_url ?? ''} placeholder="https://…" className="w-full text-sm px-3 py-2 rounded-lg outline-none" style={field} /></div>
      <div>{l('Website')}<input name="website" defaultValue={partner?.website ?? ''} placeholder="https://…" className="w-full text-sm px-3 py-2 rounded-lg outline-none" style={field} /></div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>{l('Description (English)')}<textarea name="desc_en" defaultValue={partner?.desc_en ?? ''} rows={2} className="w-full text-sm px-3 py-2 rounded-lg outline-none resize-y" style={field} /></div>
        <div>{l('الوصف (Arabic)')}<textarea name="desc_ar" defaultValue={partner?.desc_ar ?? ''} rows={2} dir="rtl" className="w-full text-sm px-3 py-2 rounded-lg outline-none resize-y" style={field} /></div>
      </div>
      <input type="hidden" name="sort_order" value={partner?.sort_order ?? 999} />
      {error && <p className="flex items-center gap-1.5 text-xs" style={{ color: '#DC2626' }}><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}
      <div className="flex items-center gap-2">
        <button type="submit" disabled={pending} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {partner ? 'Save' : 'Add partner'}
        </button>
        <button type="button" onClick={onDone} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold" style={{ background: '#F1F5F9', color: '#475569' }}><X className="w-4 h-4" /> Cancel</button>
      </div>
    </form>
  )
}

export default function PartnersManager({ partners }: { partners: DbPartner[] }) {
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const router = useRouter()
  const act = (fn: () => Promise<{ error?: string }>) => start(async () => { await fn(); router.refresh() })

  return (
    <div className="bg-white rounded-2xl border p-6 space-y-4" style={{ borderColor: '#E2E8F0' }}>
      <div className="flex items-center gap-2">
        <Handshake className="w-4 h-4" style={{ color: '#40916C' }} />
        <h2 className="text-base font-bold flex-1" style={{ color: '#0F172A' }}>Kuwait partners</h2>
        {!adding && <button onClick={() => { setAdding(true); setEditing(null) }} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}><Plus className="w-3.5 h-3.5" /> Add partner</button>}
      </div>
      <p className="text-xs" style={{ color: '#94A3B8' }}>These appear on the public Partners page and homepage strip. (The Green Key &amp; FEE global logo walls are managed separately.)</p>

      {adding && <PartnerForm onDone={() => setAdding(false)} />}

      <div className="space-y-2">
        {partners.map((p, i) => (
          <div key={p.id}>
            <div className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: '#E2E8F0', opacity: p.active ? 1 : 0.6 }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-white overflow-hidden" style={{ border: `1px solid ${p.color ?? '#40916C'}30` }}>
                {p.logo_url ? (/* eslint-disable-next-line @next/next/no-img-element */ <img src={p.logo_url} alt="" className="w-7 h-7 object-contain" />) : <span className="text-[10px] font-bold" style={{ color: p.color ?? '#40916C' }}>{p.initials}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate" style={{ color: '#1E293B' }}>{p.name_en} {!p.active && <span className="text-[10px] font-semibold ml-1" style={{ color: '#94A3B8' }}><EyeOff className="w-3 h-3 inline" /> hidden</span>}</p>
                <p className="text-xs" style={{ color: '#94A3B8' }}>{TYPE_LABEL[p.type] ?? p.type}</p>
              </div>
              <div className="flex items-center gap-1">
                <button disabled={pending || i === 0} onClick={() => act(() => reorderPartner(p.id, 'up'))} className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: '#64748B' }} title="Move up"><ChevronUp className="w-4 h-4" /></button>
                <button disabled={pending || i === partners.length - 1} onClick={() => act(() => reorderPartner(p.id, 'down'))} className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: '#64748B' }} title="Move down"><ChevronDown className="w-4 h-4" /></button>
                <button onClick={() => { setEditing(editing === p.id ? null : p.id); setAdding(false) }} className="p-1.5 rounded-lg" style={{ color: '#40916C' }} title="Edit"><Pencil className="w-4 h-4" /></button>
                <button disabled={pending} onClick={() => { if (window.confirm(`Delete ${p.name_en}?`)) act(() => deletePartner(p.id)) }} className="p-1.5 rounded-lg" style={{ color: '#DC2626' }} title="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            {editing === p.id && <div className="mt-2"><PartnerForm partner={p} onDone={() => setEditing(null)} /></div>}
          </div>
        ))}
        {partners.length === 0 && <p className="text-xs text-center py-6" style={{ color: '#94A3B8' }}>No partners yet — add one above.</p>}
      </div>
    </div>
  )
}
