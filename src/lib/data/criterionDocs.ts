// ── Demo data for multi-year, append-only criterion documents ───────────────
// Mirrors the schema in migration 004 (criterion_documents): documents are keyed
// by criterion + cycle year, are add-only, and lock once the application is
// submitted/certified. This is client-side demo data; real persistence uses the
// append-only Supabase table.

export interface DemoDoc {
  id: string
  criterionRef: string
  year: number
  name: string
  type: string
  size: string
  uploadedBy: string
  uploadedAt: string
}

// A representative slice of Green Key criteria that require evidence each cycle.
export const DOC_CRITERIA: { ref: string; title: string }[] = [
  { ref: '1.1', title: 'Green Key Establishment Representative appointed' },
  { ref: '1.2', title: 'Strategic sustainability targets formulated' },
  { ref: '1.3', title: 'Annual action plan aligned with targets' },
  { ref: '3.1', title: 'Total water consumption recorded monthly' },
  { ref: '4.1', title: 'Energy use by source recorded monthly' },
  { ref: '5.1', title: 'Waste separated into 3+ recyclable categories' },
]

// Certification cycle years. New years are added as the establishment re-submits.
export const DOC_YEARS: number[] = [2026, 2027, 2028]

const ESTAB = 'Hilton Kuwait Resort'

// Seeded so several criteria already show more than one year of evidence.
export const INITIAL_DOCS: DemoDoc[] = [
  { id: 'D-001', criterionRef: '1.1', year: 2026, name: 'Representative Appointment Letter.pdf', type: 'PDF',  size: '220 KB', uploadedBy: ESTAB, uploadedAt: '2026-02-14' },
  { id: 'D-002', criterionRef: '1.2', year: 2026, name: 'Sustainability Targets 2026.pdf',       type: 'PDF',  size: '480 KB', uploadedBy: ESTAB, uploadedAt: '2026-02-20' },
  { id: 'D-003', criterionRef: '1.3', year: 2026, name: 'Action Plan 2026.xlsx',                 type: 'XLSX', size: '96 KB',  uploadedBy: ESTAB, uploadedAt: '2026-02-20' },
  { id: 'D-004', criterionRef: '3.1', year: 2026, name: 'Water Consumption Log 2026.xlsx',       type: 'XLSX', size: '150 KB', uploadedBy: ESTAB, uploadedAt: '2026-03-01' },
  { id: 'D-005', criterionRef: '3.1', year: 2026, name: 'Water Utility Bills 2026.pdf',          type: 'PDF',  size: '1.2 MB', uploadedBy: ESTAB, uploadedAt: '2026-03-01' },
  { id: 'D-006', criterionRef: '4.1', year: 2026, name: 'Energy Consumption Log 2026.xlsx',      type: 'XLSX', size: '180 KB', uploadedBy: ESTAB, uploadedAt: '2026-03-04' },
  { id: 'D-007', criterionRef: '5.1', year: 2026, name: 'Waste Sorting Photos 2026.zip',         type: 'ZIP',  size: '8.4 MB', uploadedBy: ESTAB, uploadedAt: '2026-03-06' },
  // 2027 re-submission cycle (updated reports under the same criteria)
  { id: 'D-008', criterionRef: '3.1', year: 2027, name: 'Water Consumption Log 2027.xlsx',       type: 'XLSX', size: '162 KB', uploadedBy: ESTAB, uploadedAt: '2027-01-18' },
  { id: 'D-009', criterionRef: '4.1', year: 2027, name: 'Energy Consumption Log 2027.xlsx',      type: 'XLSX', size: '190 KB', uploadedBy: ESTAB, uploadedAt: '2027-01-18' },
  { id: 'D-010', criterionRef: '1.3', year: 2027, name: 'Action Plan 2027 (updated).xlsx',       type: 'XLSX', size: '104 KB', uploadedBy: ESTAB, uploadedAt: '2027-01-22' },
]

export const CURRENT_ESTABLISHMENT = ESTAB
