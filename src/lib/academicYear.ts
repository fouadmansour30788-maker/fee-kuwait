// Eco-Schools academic years (September–June). Client-safe: pure helpers.
// Stored as '2025-2026'; shown as '2025–2026'.

const KUWAIT_OFFSET_MS = 3 * 60 * 60 * 1000 // UTC+3, no DST

export function academicYearOf(date: string | Date = new Date()): string {
  const d = new Date(new Date(date).getTime() + KUWAIT_OFFSET_MS)
  const y = d.getUTCFullYear()
  return d.getUTCMonth() >= 8 ? `${y}-${y + 1}` : `${y - 1}-${y}`
}

export function nextAcademicYear(year: string): string {
  const start = parseInt(year.slice(0, 4), 10)
  return `${start + 1}-${start + 2}`
}

export const formatAcademicYear = (year: string) => year.replace('-', '–')
// Short form for tags, e.g. '2025–26'.
export const shortAcademicYear = (year: string) => `${year.slice(0, 4)}–${year.slice(-2)}`
