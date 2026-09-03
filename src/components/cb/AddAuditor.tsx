'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, AlertCircle, CheckCircle2, Copy, Check } from 'lucide-react'
import { cbCreateAuditor } from '@/lib/actions/cbAuditors'

export default function AddAuditor() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const [done, setDone] = useState<{ email: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setDone(null)
    start(async () => {
      const res = await cbCreateAuditor({ email, name })
      if (res.error) setError(res.error)
      else {
        setDone({ email: email.trim().toLowerCase(), password: res.tempPassword ?? '' })
        setName(''); setEmail('')
        router.refresh()
      }
    })
  }

  async function copy() {
    if (!done) return
    try { await navigator.clipboard.writeText(`Email: ${done.email}\nTemporary password: ${done.password}`); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* ignore */ }
  }

  const field = { border: '1px solid #E2E8F0', color: '#1E293B' } as const

  return (
    <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
      <div className="flex items-center gap-2 mb-1">
        <UserPlus className="w-4 h-4" style={{ color: '#C8A951' }} />
        <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Add an auditor</h2>
      </div>
      <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>Creates an auditor sign-in account directly. You&apos;ll get a temporary password to share — they can change it after first login.</p>

      <form onSubmit={submit} className="grid sm:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-[11px] font-semibold mb-1" style={{ color: '#475569' }}>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full text-sm px-3 py-2.5 rounded-xl outline-none" style={field} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold mb-1" style={{ color: '#475569' }}>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@org.com" className="w-full text-sm px-3 py-2.5 rounded-xl outline-none" style={field} />
        </div>
        <button type="submit" disabled={pending}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #B8860B, #C8A951)' }}>
          <UserPlus className="w-4 h-4" /> {pending ? 'Adding…' : 'Add auditor'}
        </button>
      </form>

      {error && <p className="flex items-center gap-1.5 text-sm mt-3" style={{ color: '#E53E3E' }}><AlertCircle className="w-4 h-4" /> {error}</p>}

      {done && (
        <div className="mt-4 rounded-xl p-4" style={{ background: '#ECFDF3', border: '1px solid #A7F3D0' }}>
          <p className="flex items-center gap-1.5 text-sm font-semibold mb-2" style={{ color: '#047857' }}><CheckCircle2 className="w-4 h-4" /> Auditor added</p>
          <p className="text-sm" style={{ color: '#065F46' }}>Share these sign-in details:</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <code className="text-sm px-2.5 py-1 rounded-lg" style={{ background: '#fff', border: '1px solid #A7F3D0', color: '#065F46' }}>{done.email}</code>
            <code className="text-sm px-2.5 py-1 rounded-lg" style={{ background: '#fff', border: '1px solid #A7F3D0', color: '#065F46' }}>{done.password}</code>
            <button onClick={copy} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg" style={{ background: '#fff', border: '1px solid #A7F3D0', color: '#047857' }}>
              {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
