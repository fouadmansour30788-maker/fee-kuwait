// BeCause API client (server-only).
//
// Implements the "Framework Answers Import" workflow for exporting certification
// consumption data (electricity, water, waste …) as companies' framework answers.
// Docs: https://docs.because.eco/workflows/framework-answers-import
//
// Auth: the raw API key in the `Authorization` header (NOT a Bearer token).
// Keys are set in Vercel env — never in code or the repo:
//   BECAUSE_API_KEY   – required
//   BECAUSE_API_BASE  – optional; defaults to https://api.because.eco

const BASE = (process.env.BECAUSE_API_BASE || 'https://api.because.eco').replace(/\/+$/, '')

export class BecauseError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'BecauseError'
    this.status = status
  }
}

export function becauseConfigured(): boolean {
  return !!process.env.BECAUSE_API_KEY
}

async function becauseFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const key = process.env.BECAUSE_API_KEY
  if (!key) throw new BecauseError('BECAUSE_API_KEY is not set. Add it in the Vercel project environment variables.')
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { Authorization: key, 'Content-Type': 'application/json', Accept: 'application/json', ...(init?.headers || {}) },
      cache: 'no-store',
    })
  } catch (e) {
    throw new BecauseError(`Could not reach BeCause (${BASE}${path}): ${(e as Error).message}`)
  }
  const raw = await res.text()
  let body: unknown = null
  try { body = raw ? JSON.parse(raw) : null } catch { body = raw }
  if (!res.ok) {
    const detail = typeof body === 'string' ? body : JSON.stringify(body)
    throw new BecauseError(`BeCause ${res.status} on ${path}: ${detail || res.statusText}`, res.status)
  }
  return body as T
}

// ── Discovery ─────────────────────────────────────────────────────────

export interface Framework { id: string; title?: string; name?: string }
export interface Group { id: string; name: string }
export interface CustomProperty {
  id: string
  name: string
  type?: string
  isIdentifier?: boolean
  isOwnedByInvokingCompany?: boolean
  ownerName?: string
}
export interface UnitType { id: string; name: string; symbol?: string }

// GET /api/v1/frameworks — frameworks this API key's profile can read.
export const listFrameworks = () => becauseFetch<Framework[]>('/api/v1/frameworks')

// GET /api/v1/frameworks/{id} — full structure (topics → subtopics → clusters →
// questions → data points). The data point ids feed the upsert endpoint.
export const getFrameworkStructure = (frameworkId: string) =>
  becauseFetch<unknown>(`/api/v1/frameworks/${encodeURIComponent(frameworkId)}`)

// GET /api/v1/groups — groups the profile directly owns (import container).
export const listGroups = () => becauseFetch<Group[]>('/api/v1/groups')

// GET /api/v1/custom-properties — custom properties the profile can write; those
// with isIdentifier can be used as external identifiers (e.g. a Green Key ID).
export const listCustomProperties = () => becauseFetch<CustomProperty[]>('/api/v1/custom-properties')

// GET /api/v1/unit-types — shared unit catalogue (same for every caller).
export const listUnitTypes = () => becauseFetch<UnitType[]>('/api/v1/unit-types')

// Best-effort flatten of a framework structure into a flat list of data points.
// The nested shape is not fully specified in the docs, so we walk the tree and
// collect any object that carries an id plus a label-ish field.
export interface FlatDataPoint { id: string; label: string; valueType?: string; unitTypeIds?: string[]; path: string }
export function flattenDataPoints(structure: unknown): FlatDataPoint[] {
  const out: FlatDataPoint[] = []
  const seen = new Set<string>()
  const labelOf = (o: Record<string, unknown>): string | undefined => {
    for (const k of ['label', 'name', 'title', 'text', 'questionText']) {
      const v = o[k]
      if (typeof v === 'string' && v.trim()) return v.trim()
    }
    return undefined
  }
  const walk = (node: unknown, path: string) => {
    if (Array.isArray(node)) { node.forEach((n, i) => walk(n, `${path}[${i}]`)) ; return }
    if (!node || typeof node !== 'object') return
    const o = node as Record<string, unknown>
    // A data point: has an id and looks like a leaf answerable field.
    const id = typeof o.id === 'string' ? o.id : (typeof o.dataPointId === 'string' ? o.dataPointId : undefined)
    const isDataPoint = !!id && ('valueType' in o || 'answerType' in o || 'unitTypeIds' in o || 'unitTypes' in o || /dataPoint/i.test(path))
    if (id && isDataPoint && !seen.has(id)) {
      seen.add(id)
      const unitTypeIds = Array.isArray(o.unitTypeIds) ? (o.unitTypeIds as unknown[]).map(String)
        : Array.isArray(o.unitTypes) ? (o.unitTypes as unknown[]).map((u) => String((u as Record<string, unknown>)?.id ?? u)) : undefined
      out.push({
        id,
        label: labelOf(o) ?? '(unlabelled)',
        valueType: typeof o.valueType === 'string' ? o.valueType : (typeof o.answerType === 'string' ? o.answerType : undefined),
        unitTypeIds,
        path,
      })
    }
    for (const [k, v] of Object.entries(o)) if (v && typeof v === 'object') walk(v, path ? `${path}.${k}` : k)
  }
  walk(structure, '')
  return out
}

// ── Import (bulk upsert) ──────────────────────────────────────────────

export type PeriodType = 'Yearly' | 'Monthly'
export type AnswerValue =
  | { text: string }
  | { number: number }
  | { boolean: boolean }
  | { dateIso: string }
  | { dateRangeFromDateIso: string; dateRangeToDateIso: string }
  | { list: string[] }

export interface AnswerEntry { dataPointId: string; answer: AnswerValue; unitId?: string }
export interface PeriodEntry { periodType: PeriodType; year: number; month?: string; answers: AnswerEntry[] }
export interface CompanyEntry {
  identifiedBy: { companyId: string } | { customProperty: { customPropertyId: string; value: string } }
  periods: PeriodEntry[]
}
export interface UpsertPayload { frameworkId?: string; companies: CompanyEntry[] }

export interface UpsertAccepted { correlationId: string }

// POST /api/v2/bulk/framework-answers/upsert — idempotent bulk import.
export function upsertFrameworkAnswers(payload: UpsertPayload) {
  return becauseFetch<UpsertAccepted>('/api/v2/bulk/framework-answers/upsert', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export type BulkTaskStatus = 'Pending' | 'Scheduled' | 'InProgress' | 'Success' | 'PartialSuccess' | 'Error' | 'Cancelled'
export interface BulkRowError {
  companyId: string | null
  identifiedByValue: string | null
  dataPointId: string
  periodType: string
  year: number
  month?: string
  reason: string
  message: string
}
export interface BulkTask {
  correlationId: string
  status: BulkTaskStatus
  requestType?: string
  error?: { generalErrorMessages?: string[]; rowErrors?: BulkRowError[] }
}

// GET /api/v2/bulk/tasks/{correlationId} — poll import progress/outcome.
export const getBulkTask = (correlationId: string) =>
  becauseFetch<BulkTask>(`/api/v2/bulk/tasks/${encodeURIComponent(correlationId)}`)

const TERMINAL: BulkTaskStatus[] = ['Success', 'PartialSuccess', 'Error', 'Cancelled']
export const isTerminal = (s: BulkTaskStatus) => TERMINAL.includes(s)
