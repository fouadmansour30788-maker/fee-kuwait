'use client'

import { useState } from 'react'
import { Copy, Check, Share2 } from 'lucide-react'

// Establishment-facing "show off your certificate" block: a live badge preview,
// copy-paste embed snippet, and one-tap social sharing.
export default function ShareBadge({ number, name, verifyUrl, badgeUrl }: {
  number: string; name: string; verifyUrl: string; badgeUrl: string
}) {
  const [copied, setCopied] = useState(false)
  const embed = `<a href="${verifyUrl}" target="_blank" rel="noopener">\n  <img src="${badgeUrl}" alt="Green Key Certified" width="160" height="176">\n</a>`
  const shareText = `${name} is Green Key certified for sustainable tourism 🌿`

  const copy = async () => {
    try { await navigator.clipboard.writeText(embed); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* ignore */ }
  }

  const links = [
    { label: 'X', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(verifyUrl)}` },
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}` },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(verifyUrl)}` },
    { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${verifyUrl}`)}` },
  ]

  return (
    <div className="mt-6 bg-white rounded-3xl shadow-2xl overflow-hidden">
      <div className="px-6 py-4 flex items-center gap-2 border-b" style={{ borderColor: '#F1F5F9' }}>
        <Share2 className="w-4 h-4" style={{ color: '#40916C' }} />
        <h2 className="text-sm font-bold" style={{ color: '#0F172A' }}>Share your certification</h2>
      </div>
      <div className="p-6 flex flex-col sm:flex-row gap-6">
        {/* Badge preview */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={badgeUrl} alt="Green Key Certified badge" width={140} height={154} style={{ display: 'block' }} />
        </div>
        {/* Embed + social */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>Embed this badge on your website</p>
          <div className="relative">
            <pre className="text-[11px] leading-relaxed rounded-xl p-3 overflow-x-auto" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#334155' }}>{embed}</pre>
            <button onClick={copy} className="absolute top-2 right-2 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg" style={{ background: copied ? '#ECFDF3' : '#fff', color: copied ? '#047857' : '#475569', border: '1px solid #E2E8F0' }}>
              {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
            </button>
          </div>
          <p className="text-xs font-semibold mt-4 mb-2" style={{ color: '#475569' }}>Share the news</p>
          <div className="flex flex-wrap gap-2">
            {links.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: '#F1F5F9', color: '#334155' }}>{l.label}</a>
            ))}
          </div>
          <p className="text-[11px] mt-3" style={{ color: '#94A3B8' }}>The badge always shows live status — it turns grey automatically if the certificate lapses.</p>
        </div>
      </div>
    </div>
  )
}
