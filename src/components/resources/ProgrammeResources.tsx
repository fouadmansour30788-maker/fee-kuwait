import { FileText, ExternalLink, Download, FolderOpen } from 'lucide-react'
import { RESOURCE_PROGRAMMES, RESOURCE_CATEGORIES, programmeLabel, type ResourceItem } from '@/lib/resources'

// Category order for the list; uncategorised items fall under 'Other'.
const catOf = (r: ResourceItem) => (r.category && (RESOURCE_CATEGORIES as readonly string[]).includes(r.category) ? r.category : 'Other')
const byCategory = (items: ResourceItem[]) => RESOURCE_CATEGORIES.map((c) => ({ category: c, items: items.filter((r) => catOf(r) === c) })).filter((c) => c.items.length)

// Member view: the published programme resources the National Operator added,
// grouped by programme (all-programme resources first).
export default function ProgrammeResources({ resources }: { resources: ResourceItem[] }) {
  const groups = [
    { id: null as string | null, label: 'For all programmes', color: '#1B4332' },
    ...RESOURCE_PROGRAMMES.map((p) => ({ id: p.id as string | null, label: p.label, color: p.color })),
  ].map((g) => ({ ...g, items: resources.filter((r) => r.published && r.programme === g.id) })).filter((g) => g.items.length)

  return (
    <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
      <div className="flex items-center gap-2 mb-1">
        <FolderOpen className="w-5 h-5" style={{ color: '#40916C' }} />
        <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Programme resources</h2>
      </div>
      <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>Guides, toolkits, templates and links shared by the National Operator.</p>

      {groups.length === 0 ? (
        <p className="text-sm py-6 text-center" style={{ color: '#94A3B8' }}>No resources have been shared yet.</p>
      ) : (
        <div className="space-y-5">
          {groups.map((g) => (
            <div key={g.id ?? 'all'}>
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: g.color }}>{g.label}</p>
              {byCategory(g.items).map((cat) => (
                <div key={cat.category} className="mb-3 last:mb-0">
                  <p className="text-[11px] font-semibold mb-1.5" style={{ color: '#64748B' }}>{cat.category}{cat.items.length > 1 ? ` · ${cat.items.length}` : ''}</p>
                  <div className="flex flex-col gap-2">
                    {cat.items.map((r) => (
                      <a key={r.id} href={`/api/resources/${r.id}`} target="_blank" rel="noopener"
                        className="flex items-start gap-3 rounded-xl border px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-sm" style={{ borderColor: '#E2E8F0' }}>
                        <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${g.color}14` }}>
                          {r.path ? <FileText className="w-4 h-4" style={{ color: g.color }} /> : <ExternalLink className="w-4 h-4" style={{ color: g.color }} />}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-semibold" style={{ color: '#0F172A' }}>{r.title_en}</span>
                          {r.title_ar && <span className="block text-xs" dir="rtl" style={{ color: '#475569' }}>{r.title_ar}</span>}
                          {r.description_en && <span className="block text-xs mt-0.5" style={{ color: '#64748B' }}>{r.description_en}</span>}
                          <span className="block text-[11px] mt-1" style={{ color: '#94A3B8' }}>
                            {[r.language === 'both' ? 'EN & AR' : r.language.toUpperCase(), r.file_type && r.file_type !== 'link' ? r.file_type : r.path ? null : 'Link'].filter(Boolean).join(' · ') || programmeLabel(r.programme)}
                          </span>
                        </span>
                        {r.path ? <Download className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#94A3B8' }} /> : <ExternalLink className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#94A3B8' }} />}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
