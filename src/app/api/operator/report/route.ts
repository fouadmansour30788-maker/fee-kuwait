import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib'
import { createClient } from '@/lib/supabase/server'
import { operatorStats, PROGRAMME_LABEL, statusMeta, STATUS_META } from '@/lib/db/applications'
import { listCertificates } from '@/lib/db/certificates'
import { CERTIFIED_STATUSES, NOT_APPROVED_STATUSES, CB_STATUSES, AUDIT_STATUSES } from '@/lib/workflow'

export const dynamic = 'force-dynamic'

const GREEN = rgb(0.106, 0.263, 0.196)
const MID = rgb(0.25, 0.57, 0.42)
const INK = rgb(0.06, 0.09, 0.06)
const GREY = rgb(0.45, 0.5, 0.56)

const CERTIFIED = [...CERTIFIED_STATUSES, 'approved']
const IN_PROGRESS = ['new', 'under_review', 'documents_pending', 'pending_eligibility', 'in_progress', ...CB_STATUSES, ...AUDIT_STATUSES,
  'pre_audit_rectification_required', 'pre_audit_rectification_open', 'ready_for_auditor',
  'post_audit_rectification_required', 'post_audit_corrective_open', 'further_corrective_required',
  'cb_clarification_operator', 'cb_clarification_auditor', 'cb_clarification_establishment']

export async function GET(_req: NextRequest) {
  // Staff only.
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!me || !['admin', 'super_admin'].includes(me.role)) return new NextResponse('Forbidden', { status: 403 })

  const [{ apps, members }, certs] = await Promise.all([operatorStats(), listCertificates()])
  const total = apps.length
  const certified = apps.filter((a) => CERTIFIED.includes(a.status)).length
  const inProgress = apps.filter((a) => IN_PROGRESS.includes(a.status)).length
  const notApproved = apps.filter((a) => NOT_APPROVED_STATUSES.includes(a.status)).length
  const decided = certified + notApproved
  const certRate = decided ? Math.round((certified / decided) * 100) : 0

  const submittedById = new Map(apps.map((a) => [a.id, a.submitted_at]))
  const durations = certs.map((c) => {
    const sub = submittedById.get(c.application_id)
    if (!sub || !c.issued_at) return null
    return (new Date(c.issued_at).getTime() - new Date(sub).getTime()) / 86_400_000
  }).filter((d): d is number => d !== null && d >= 0)
  const avgDays = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null

  const byProgramme = Object.keys(PROGRAMME_LABEL).map((k) => ({
    label: PROGRAMME_LABEL[k], apps: apps.filter((a) => a.programme === k).length, certs: certs.filter((c) => c.programme === k).length,
  })).filter((p) => p.apps > 0)
  const byStatus = Object.keys(STATUS_META).map((st) => ({ label: statusMeta(st).label, count: apps.filter((a) => a.status === st).length }))
    .filter((r) => r.count > 0).sort((a, b) => b.count - a.count).slice(0, 8)

  // ── Draw ──
  const doc = await PDFDocument.create()
  const page = doc.addPage([595.28, 841.89])
  const { width: W, height: H } = page.getSize()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const M = 40
  let y = H

  // Header band
  page.drawRectangle({ x: 0, y: H - 90, width: W, height: 90, color: GREEN })
  page.drawText('FEE Kuwait', { x: M, y: H - 42, size: 20, font: bold, color: rgb(1, 1, 1) })
  page.drawText('Operations report', { x: M, y: H - 64, size: 12, font, color: rgb(0.85, 0.95, 0.89) })
  const today = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  page.drawText(today, { x: W - M - font.widthOfTextAtSize(today, 10), y: H - 64, size: 10, font, color: rgb(0.85, 0.95, 0.89) })
  y = H - 120

  // KPI grid
  const kpis: [string, string][] = [
    ['Total applications', String(total)],
    ['Certification rate', `${certRate}%`],
    ['Certificates issued', String(certs.length)],
    ['Members', String(members)],
    ['In progress', String(inProgress)],
    ['Avg. days to certify', avgDays === null ? '—' : String(avgDays)],
  ]
  const cols = 3, gap = 12, cardW = (W - M * 2 - gap * (cols - 1)) / cols, cardH = 66
  kpis.forEach((k, idx) => {
    const cxi = M + (idx % cols) * (cardW + gap)
    const cyi = y - Math.floor(idx / cols) * (cardH + gap)
    page.drawRectangle({ x: cxi, y: cyi - cardH, width: cardW, height: cardH, borderColor: rgb(0.89, 0.91, 0.94), borderWidth: 1, color: rgb(0.98, 0.99, 0.99) })
    page.drawText(k[1], { x: cxi + 14, y: cyi - 34, size: 22, font: bold, color: INK })
    page.drawText(k[0], { x: cxi + 14, y: cyi - 52, size: 9, font, color: GREY })
  })
  y -= cardH * 2 + gap + 34

  const section = (title: string) => { page.drawText(title, { x: M, y, size: 12, font: bold, color: GREEN }); y -= 8; page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.7, color: rgb(0.89, 0.91, 0.94) }); y -= 18 }
  const row = (left: string, right: string, f: PDFFont = font) => { page.drawText(left, { x: M, y, size: 10, font: f, color: INK }); page.drawText(right, { x: W - M - f.widthOfTextAtSize(right, 10), y, size: 10, font: f, color: INK }); y -= 18 }

  // Outcomes
  section('Outcomes')
  row('Certified', String(certified)); row('In progress', String(inProgress)); row('Not approved', String(notApproved))
  y -= 10

  // By programme
  section('By programme')
  page.drawText('Programme', { x: M, y, size: 9, font: bold, color: GREY })
  page.drawText('Applications', { x: W - M - 150, y, size: 9, font: bold, color: GREY })
  page.drawText('Certificates', { x: W - M - font.widthOfTextAtSize('Certificates', 9), y, size: 9, font: bold, color: GREY }); y -= 16
  for (const p of byProgramme) {
    page.drawText(p.label, { x: M, y, size: 10, font, color: INK })
    page.drawText(String(p.apps), { x: W - M - 150, y, size: 10, font, color: INK })
    page.drawText(String(p.certs), { x: W - M - font.widthOfTextAtSize(String(p.certs), 10), y, size: 10, font, color: MID }); y -= 17
  }
  y -= 10

  // Top statuses
  section('Applications by status (top 8)')
  for (const r of byStatus) row(r.label, String(r.count))

  page.drawText('Generated by the FEE Kuwait certification platform', { x: M, y: 30, size: 8, font, color: GREY })

  const bytes = await doc.save()
  const stamp = new Date().toISOString().slice(0, 10)
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="FEE-Kuwait-Operations-Report-${stamp}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
