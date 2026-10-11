import { FileText, ExternalLink, Download, FolderOpen } from 'lucide-react'
import { RESOURCE_PROGRAMMES, RESOURCE_CATEGORIES, RESOURCE_CATEGORY_COLOR, programmeLabel, type ResourceItem } from '@/lib/resources'

// Category of a resource; anything outside the list (incl. older categories) is 'Other'.
const catOf = (r: ResourceItem) => (r.category && (RESOURCE_CATEGORIES as readonly string[]).includes(r.category) ? r.category : 'Other')
const progColor = (id: string | null) => RESOURCE_PROGRAMMES.find((p) => p.id === id)?.color ?? '#1B4332'

// Member view: the published programme resources the National Operator added,
// as a board — one column per document category, a card per resource.
export default function ProgrammeResources({ resources }: { resources: ResourceItem[] }) {
  const published = resources.filter((r) => r.published)
  const columns = [...RESOURCE_CATEGORIES, 'Other']
    .map((c) => ({ category: c, items: published.filter((r) => catOf(r) === c) }))
    .filter((c) => c.items.length)

  return (
    <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
      <div className="flex items-center gap-2 mb-1">
        <FolderOpen className="w-5 h-5" style={{ color: '#40916C' }} />
        <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Programme resources</h2>
      </div>
      <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>Guides, toolkits, templates and links shared by the National Operator, by category.</p>

      {columns.length === 0 ? (
        <p className="text-sm py-6 text-center" style={{ color: '#94A3B8' }}>No resources have been shared yet.</p>
      ) : (
        <div className="overflow-x-auto -mx-6 px-6 pb-2">
          <div className="flex gap-4 items-start" style={{ minWidth: 'min-content' }}>
            {columns.map((col) => {
              const color = RESOURCE_CATEGORY_COLOR[col.category] ?? RESOURCE_CATEGORY_COLOR.Other
              return (
                <div key={col.category} className="w-72 flex-shrink-0 rounded-2xl" style={{ background: '#F8FAFC' }}>
                  <div className="px-4 py-3 rounded-t-2xl flex items-center gap-2" style={{ background: color }}>
                    <span className="text-sm font-bold flex-1" style={{ color: '#1E293B' }}>{col.category}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/70" style={{ color: '#334155' }}>{col.items.length}</span>
                  </div>
                  <div className="p-3 flex flex-col gap-3">
                    {col.items.map((r) => (
                      <a key={r.id} href={`/api/resources/${r.id}`} target="_blank" rel="noopener"
                        className="block bg-white rounded-xl overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md"
                        style={{ border: '1px solid #E2E8F0', borderTop: `5px solid ${color}` }}>
                        <div className="px-4 pt-3">
                          <p className="text-sm font-bold leading-snug" style={{ color: '#0F172A' }}>{r.title_en}</p>
                          {r.title_ar && <p className="text-xs mt-0.5" dir="rtl" style={{ color: '#475569' }}>{r.title_ar}</p>}
                        </div>
                        {r.cover_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.cover_url} alt="" className="w-full h-36 object-cover mt-3" />
                        )}
                        <div className="px-4 py-3 space-y-2">
                          {r.description_en && <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>{r.description_en}</p>}
                          <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ background: `${progColor(r.programme)}18`, color: progColor(r.programme) }}>
                            {programmeLabel(r.programme)}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F1F5F9' }}>
                              {r.path ? <FileText className="w-3.5 h-3.5" style={{ color: '#475569' }} /> : <ExternalLink className="w-3.5 h-3.5" style={{ color: '#475569' }} />}
                            </span>
                            <span className="text-[11px] flex-1" style={{ color: '#94A3B8' }}>
                              {[r.language === 'both' ? 'EN & AR' : r.language.toUpperCase(), r.file_type && r.file_type !== 'link' ? r.file_type : r.path ? null : 'Link'].filter(Boolean).join(' · ')}
                            </span>
                            {r.path ? <Download className="w-4 h-4" style={{ color: '#94A3B8' }} /> : <ExternalLink className="w-4 h-4" style={{ color: '#94A3B8' }} />}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
