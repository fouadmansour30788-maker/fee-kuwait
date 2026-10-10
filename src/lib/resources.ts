// Client-safe resource constants.

// FEE Kuwait branding / resources folder (SharePoint — opens when signed in).
export const FEE_RESOURCES_URL =
  'https://netorgft15665321-my.sharepoint.com/personal/info_feebureaukw_org/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Finfo%5Ffeebureaukw%5Forg%2FDocuments%2FFEE%20branding%202026'

// Programmes that have a structured criteria checklist (used by the tools).
export const CRITERIA_PROGRAMMES = [
  { key: 'green-key', label: 'Green Key' },
  { key: 'blue-flag', label: 'Blue Flag' },
]

// ── Programme resources managed by the National Operator ──

export const RESOURCE_PROGRAMMES = [
  { id: 'green-key', label: 'Green Key', color: '#2D9A5A' },
  { id: 'eco-schools', label: 'Eco-Schools', color: '#52B788' },
  { id: 'blue-flag', label: 'Blue Flag', color: '#006994' },
  { id: 'leaf', label: 'LEAF', color: '#1B4332' },
  { id: 'yre', label: 'Young Reporters (YRE)', color: '#74C69D' },
  { id: 'eco-campus', label: 'Eco-Campus', color: '#40916C' },
] as const

export const RESOURCE_CATEGORIES = ['Guide', 'Toolkit', 'Template', 'Activity sheet', 'Presentation', 'Video', 'Policy', 'Other'] as const

export const programmeLabel = (id: string | null) => (id ? RESOURCE_PROGRAMMES.find((p) => p.id === id)?.label ?? id : 'All programmes')

export interface ResourceItem {
  id: string
  title_en: string
  title_ar: string | null
  description_en: string | null
  description_ar: string | null
  programme: string | null      // null = every programme
  language: 'en' | 'ar' | 'both'
  category: string | null
  file_url: string | null       // external link
  path: string | null           // uploaded file (private bucket)
  file_type: string | null
  file_size: number | null
  downloads: number
  published: boolean
  created_at: string
}

// Which programmes' resources a member sees by default, by institution type.
export const DEFAULT_PROGRAMMES: Record<'school' | 'business', string[]> = {
  school: ['eco-schools', 'leaf', 'yre', 'eco-campus'],
  business: ['green-key', 'blue-flag'],
}
