'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Globe2, Plus, Save, Loader2, Trash2, ChevronUp, ChevronDown, Pencil, X, AlertCircle, EyeOff, Download } from 'lucide-react'
import { saveGkPartner, deleteGkPartner, reorderGkPartner, importGkDefaults } from '@/lib/actions/siteContent'
import type { GkPartnerGroup } from '@/lib/db/gkPartners'

const field = { border: '1px solid #E2E8F0', color: '#1E293B' } as const

function ItemForm({ groupId, item, onDone }: { groupId: string; item?: { id: string; name: string; logo: string; active?: boolean }; onDone: () => void }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    start(async () => { const r = await saveGkPartner(fd); if (r.error) setError(r.error); else { router.refresh(); onDone() } })
  }
  const l = (t: string) => <label className="block text-[11px] font-semibold mb-1" style={{ color: '#475569' }}>{t}</label>

  return (
    <form onSubmit={submit} className="rounded-xl p-4 space-y-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
      {item && <input type="hidden" name="id" value={item.id} />}
      <input type="hidden" name="group_id" value={groupId} />
      <div className="grid sm:grid-cols-2 gap-3">
        <div>{l('Caption (name — optional)')}<input name="name" defaultValue={item?.name ?? ''} placeholder="e.g. Accor" className="w-full text-sm px-3 py-2 rounded-lg outline-none" style={field} /></div>
        <div className="flex items-end pb-1"><label className="inline-flex items-center gap-2 text-xs font-semibold" style={{ color: '#475569' }}><input type="checkbox" name="active" defaultChecked={item ? item.active !== false : true} /> Visible</label></div>
      </div>
      <div>
        {l('Logo image (upload — PNG/JPG/SVG, ≤ 3 MB)')}
        <div className="flex items-center gap-3">
          {item?.logo && (/* eslint-disable-next-line @next/next/no-img-element */
            <img src={item.logo} alt="" className="w-10 h-10 object-contain rounded-lg bg-white flex-shrink-0" style={{ border: '1px solid #E2E8F0' }} />
          )}
          <input name="logo_file" type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="w-full text-sm" style={{ color: '#475569' }} />
        </div>
      </div>
      <div>{l('…or Logo URL')}<input name="logo_url" defaultValue={item?.logo ?? ''} placeholder="https://… or /partners/gk/…" className="w-full text-sm px-3 py-2 rounded-lg outline-none" style={field} /></div>
      {error && <p className="flex items-center gap-1.5 text-xs" style={{ color: '#DC2626' }}><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}
      <div className="flex items-center gap-2">
        <button type="submit" disabled={pending} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {item ? 'Save' : 'Add logo'}
        </button>
        <button type="button" onClick={onDone} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold" style={{ background: '#F1F5F9', color: '#475569' }}><X className="w-4 h-4" /> Cancel</button>
      </div>
    </form>
  )
}

export default function GkPartnersManager({ seeded, groups }: { seeded: boolean; groups: GkPartnerGroup[] }) {
  const [adding, setAdding] = useState<string | null>(null) // group id being added to
  const [editing, setEditing] = useState<string | null>(null) // item id being edited
  const [pending, start] = useTransition()
  const router = useRouter()
  const act = (fn: () => Promise<{ error?: string }>) => start(async () => { await fn(); router.refresh() })

  return (
    <div className="bg-white rounded-2xl border p-6 space-y-4" style={{ borderColor: '#E2E8F0' }}>
      <div className="flex items-center gap-2">
        <Globe2 className="w-4 h-4" style={{ color: '#40916C' }} />
        <h2 className="text-base font-bold flex-1" style={{ color: '#0F172A' }}>Green Key International logo wall</h2>
      </div>
      <p className="text-xs" style={{ color: '#94A3B8' }}>The global partner logos shown on the public Partners page, grouped by category.</p>

      {!seeded ? (
        <div className="rounded-xl p-5 text-center space-y-3" style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1' }}>
          <p className="text-sm" style={{ color: '#475569' }}>This wall currently shows the built-in logo set. Import it to start editing (add, remove, rename, reorder, hide logos).</p>
          <button disabled={pending} onClick={() => act(importGkDefaults)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Import current logos
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.id}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider flex-1" style={{ color: '#3D4A42' }}>{group.title_en} <span className="text-[10px] font-semibold ml-1" style={{ color: '#94A3B8' }}>{group.partners.length}</span></h3>
                {adding !== group.id && <button onClick={() => { setAdding(group.id); setEditing(null) }} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: '#F1F5F9', color: '#334155' }}><Plus className="w-3.5 h-3.5" /> Add</button>}
              </div>
              {adding === group.id && <div className="mb-3"><ItemForm groupId={group.id} onDone={() => setAdding(null)} /></div>}
              <div className="grid sm:grid-cols-2 gap-2">
                {group.partners.map((pt, i) => (
                  <div key={pt.id}>
                    <div className="flex items-center gap-3 rounded-xl border p-2.5" style={{ borderColor: '#E2E8F0', opacity: pt.active === false ? 0.55 : 1 }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-white overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={pt.logo} alt="" className="w-7 h-7 object-contain" />
                      </div>
                      <p className="text-sm font-medium truncate flex-1" style={{ color: '#1E293B' }}>{pt.name || <span style={{ color: '#94A3B8' }}>(no caption)</span>}{pt.active === false && <span className="text-[10px] font-semibold ml-1" style={{ color: '#94A3B8' }}><EyeOff className="w-3 h-3 inline" /></span>}</p>
                      <div className="flex items-center gap-0.5">
                        <button disabled={pending || i === 0} onClick={() => act(() => reorderGkPartner(pt.id!, 'up'))} className="p-1 rounded-lg disabled:opacity-30" style={{ color: '#64748B' }}><ChevronUp className="w-4 h-4" /></button>
                        <button disabled={pending || i === group.partners.length - 1} onClick={() => act(() => reorderGkPartner(pt.id!, 'down'))} className="p-1 rounded-lg disabled:opacity-30" style={{ color: '#64748B' }}><ChevronDown className="w-4 h-4" /></button>
                        <button onClick={() => { setEditing(editing === pt.id ? null : pt.id!); setAdding(null) }} className="p-1 rounded-lg" style={{ color: '#40916C' }}><Pencil className="w-4 h-4" /></button>
                        <button disabled={pending} onClick={() => { if (window.confirm(`Delete ${pt.name || 'this logo'}?`)) act(() => deleteGkPartner(pt.id!)) }} className="p-1 rounded-lg" style={{ color: '#DC2626' }}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    {editing === pt.id && <div className="mt-2 sm:col-span-2"><ItemForm groupId={group.id} item={{ id: pt.id!, name: pt.name, logo: pt.logo, active: pt.active }} onDone={() => setEditing(null)} /></div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
