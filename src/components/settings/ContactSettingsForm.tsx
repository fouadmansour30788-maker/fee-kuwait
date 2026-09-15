'use client'

import { useState, useTransition } from 'react'
import { Save, Loader2, Check, AlertCircle, Phone } from 'lucide-react'
import { saveSiteSettings } from '@/lib/actions/siteContent'
import type { SiteSettings } from '@/lib/db/siteSettings'

const field = { border: '1px solid #E2E8F0', color: '#1E293B' } as const

function Field({ label, name, defaultValue, dir, placeholder }: { label: string; name: string; defaultValue?: string | null; dir?: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold mb-1" style={{ color: '#475569' }}>{label}</label>
      <input name={name} defaultValue={defaultValue ?? ''} dir={dir} placeholder={placeholder}
        className="w-full text-sm px-3 py-2 rounded-lg outline-none" style={field} />
    </div>
  )
}

export default function ContactSettingsForm({ settings }: { settings: SiteSettings }) {
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null)

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMsg(null)
    const fd = new FormData(e.currentTarget)
    start(async () => { const r = await saveSiteSettings(fd); setMsg(r.error ? { text: r.error } : { ok: true, text: 'Contact info saved.' }) })
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border p-6 space-y-4" style={{ borderColor: '#E2E8F0' }}>
      <div className="flex items-center gap-2">
        <Phone className="w-4 h-4" style={{ color: '#40916C' }} />
        <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Contact information</h2>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Email" name="contact_email" defaultValue={settings.contact_email} />
        <Field label="Phone" name="contact_phone" defaultValue={settings.contact_phone} />
        <Field label="Contact person" name="contact_person" defaultValue={settings.contact_person} />
        <Field label="WhatsApp number (digits only)" name="whatsapp" defaultValue={settings.whatsapp} placeholder="96564449334" />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Address (English)" name="address_en" defaultValue={settings.address_en} />
        <Field label="العنوان (Arabic)" name="address_ar" defaultValue={settings.address_ar} dir="rtl" />
        <Field label="Office hours (English)" name="hours_en" defaultValue={settings.hours_en} />
        <Field label="ساعات العمل (Arabic)" name="hours_ar" defaultValue={settings.hours_ar} dir="rtl" />
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <Field label="Instagram URL" name="instagram" defaultValue={settings.instagram} />
        <Field label="X (Twitter) URL" name="x_url" defaultValue={settings.x_url} />
        <Field label="LinkedIn URL" name="linkedin" defaultValue={settings.linkedin} />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save contact info
        </button>
        {msg && <span className="flex items-center gap-1.5 text-sm" style={{ color: msg.ok ? '#047857' : '#DC2626' }}>{msg.ok ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} {msg.text}</span>}
      </div>
    </form>
  )
}
