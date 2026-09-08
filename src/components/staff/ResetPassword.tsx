'use client'

import { useState, useTransition } from 'react'
import { KeyRound, Loader2, Copy, Check, X } from 'lucide-react'
import { resetUserPassword } from '@/lib/actions/staff'

export default function ResetPassword({ userId, name }: { userId: string; name: string }) {
  const [pending, start] = useTransition()
  const [result, setResult] = useState<{ password?: string; error?: string } | null>(null)
  const [copied, setCopied] = useState(false)

  function reset() {
    if (!window.confirm(`Reset the password for ${name}? A new temporary password will be generated.`)) return
    setResult(null)
    start(async () => {
      const res = await resetUserPassword(userId)
      setResult(res.error ? { error: res.error } : { password: res.tempPassword })
    })
  }

  async function copy() {
    if (!result?.password) return
    try { await navigator.clipboard.writeText(result.password); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* ignore */ }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button onClick={reset} disabled={pending} title="Reset password"
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg disabled:opacity-60"
        style={{ background: '#F1F5F9', color: '#334155' }}>
        {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />} Reset password
      </button>

      {result?.password && (
        <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg" style={{ background: '#ECFDF3', border: '1px solid #A7F3D0', color: '#065F46' }}>
          <code>{result.password}</code>
          <button onClick={copy} title="Copy" className="inline-flex items-center" style={{ color: '#047857' }}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => setResult(null)} title="Dismiss" style={{ color: '#94A3B8' }}><X className="w-3.5 h-3.5" /></button>
        </span>
      )}
      {result?.error && <span className="text-xs" style={{ color: '#DC2626' }}>{result.error}</span>}
    </div>
  )
}
