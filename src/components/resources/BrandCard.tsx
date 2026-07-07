import { FolderOpen, ExternalLink } from 'lucide-react'
import { FEE_RESOURCES_URL } from '@/lib/resources'

export default function BrandCard({ note }: { note?: string }) {
  return (
    <a href={FEE_RESOURCES_URL} target="_blank" rel="noopener"
      className="flex items-center gap-4 rounded-2xl border p-5 transition-shadow hover:shadow-md" style={{ borderColor: '#E2E8F0', background: '#fff' }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ECFDF3' }}>
        <FolderOpen className="w-5 h-5" style={{ color: '#1B4332' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold" style={{ color: '#0F172A' }}>FEE brand &amp; resources</p>
        <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{note ?? 'Logos, brand guidelines, templates and programme guides on SharePoint — sign in to open.'}</p>
      </div>
      <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: '#94A3B8' }} />
    </a>
  )
}
