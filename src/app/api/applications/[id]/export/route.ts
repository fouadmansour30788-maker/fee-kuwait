import { createClient } from '@/lib/supabase/server'
import { getApplication, PROGRAMME_LABEL, statusMeta } from '@/lib/db/applications'
import { listCriterionAssessments } from '@/lib/db/assessments'
import { listApplicationDocuments } from '@/lib/db/documents'
import { getPreScreening, preScreeningApproved } from '@/lib/db/preScreening'
import { criteriaForProgramme, applicableCriteria } from '@/lib/criteria'

const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const STATUS: Record<string, string> = { in_progress: 'In progress', complete: 'Complete', na: 'N/A' }
const RESULT: Record<string, string> = { pending: 'Pending', pass: 'Conforming', no_pass: 'Non-conforming', na: 'N/A' }
const CB_PRE: Record<string, string> = { pending: 'Pending', approved_audit: 'Approved for audit', clarification: 'Request clarification', rectification: 'Request rectification' }
const CB_FINAL: Record<string, string> = { pending: 'Pending', conforming: 'Conforming', non_conforming: 'Non-conforming', req_clarification: 'Request clarification', req_rectification: 'Request rectification' }

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Not signed in', { status: 401 })
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!me || !['admin', 'super_admin', 'certification_body', 'auditor'].includes(me.role)) return new Response('Not allowed', { status: 403 })

  const app = await getApplication(params.id)
  if (!app) return new Response('Not found', { status: 404 })

  const [assessments, docs, ps] = await Promise.all([
    listCriterionAssessments(params.id), listApplicationDocuments(params.id), getPreScreening(params.id),
  ])
  const criteria = app.programme === 'green-key' && preScreeningApproved(ps) && ps ? applicableCriteria(ps) : criteriaForProgramme(app.programme)

  // Group documents by criterion reference.
  const docsByRef = new Map<string, typeof docs>()
  for (const d of docs) {
    const k = d.criterion_ref ?? '—'
    if (!docsByRef.has(k)) docsByRef.set(k, [])
    docsByRef.get(k)!.push(d)
  }
  const docCell = (ref: string) => {
    const list = docsByRef.get(ref) ?? []
    if (list.length === 0) return ''
    return list.map((d) => (d.url ? `<a href="${esc(d.url)}">${esc(d.name)}</a>` : esc(d.name))).join('<br/>')
  }

  const applicant = app.applicant?.name_en || app.applicant?.email || '—'
  const s = statusMeta(app.status)
  const today = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait' })

  const headers = ['Section', 'Criterion', 'Type', 'Requirement', 'Est. Progress', 'Operator Readiness', 'CB Pre-Audit', 'Auditor Conformity', 'CB Final Review', 'Auditor remark', 'Attached documents']

  const rows = criteria.map((c) => {
    const a = assessments[c.ref]
    return `<tr>
      <td>${esc(c.area)}</td>
      <td>${esc(c.ref)} — ${esc(c.title)}</td>
      <td>${esc(c.type ?? '')}</td>
      <td>${esc(c.description ?? '')}</td>
      <td>${esc(a?.applicantStatus ? (STATUS[a.applicantStatus] ?? a.applicantStatus) : 'Not started')}</td>
      <td>${esc(RESULT[a?.internal ?? 'pending'])}</td>
      <td>${esc(CB_PRE[a?.cbPre ?? 'pending'])}</td>
      <td>${esc(RESULT[a?.external ?? 'pending'])}</td>
      <td>${esc(CB_FINAL[a?.cbFinal ?? 'pending'])}</td>
      <td>${esc(a?.note ?? '')}</td>
      <td>${docCell(c.ref)}</td>
    </tr>`
  }).join('')

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"/><style>
  table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px; }
  th, td { border: 1px solid #94A3B8; padding: 4px 6px; vertical-align: top; text-align: left; }
  th { background: #1B4332; color: #fff; }
  .meta td { border: none; padding: 2px 6px; }
  h2 { font-family: Arial, sans-serif; }
</style></head>
<body>
  <h2>FEE Kuwait — ${esc(PROGRAMME_LABEL[app.programme] ?? app.programme)} criteria board</h2>
  <table class="meta">
    <tr><td><b>Applicant</b></td><td>${esc(applicant)}</td></tr>
    <tr><td><b>Programme</b></td><td>${esc(PROGRAMME_LABEL[app.programme] ?? app.programme)}</td></tr>
    <tr><td><b>Status</b></td><td>${esc(s.label)}</td></tr>
    <tr><td><b>Green Key №</b></td><td>${esc(app.green_key_number ?? '—')}</td></tr>
    <tr><td><b>Exported</b></td><td>${esc(today)}</td></tr>
  </table>
  <br/>
  <table>
    <thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="font-family:Arial;font-size:10px;color:#64748B;">Document links are time-limited; open the file soon after export to download attachments.</p>
</body></html>`

  const safeName = `${(PROGRAMME_LABEL[app.programme] ?? app.programme)}-${applicant}`.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 60)
  return new Response(html, {
    headers: {
      'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
      'Content-Disposition': `attachment; filename="${safeName || 'criteria-board'}.xls"`,
    },
  })
}
