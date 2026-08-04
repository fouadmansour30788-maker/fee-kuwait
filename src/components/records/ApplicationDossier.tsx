import { getApplication, PROGRAMME_LABEL, statusMeta, CB_DECISION_LABEL } from '@/lib/db/applications'
import { listApplicationDocuments, AUDIT_REPORT_REF } from '@/lib/db/documents'
import { listCriterionAssessments } from '@/lib/db/assessments'
import { listAudits } from '@/lib/db/audits'
import { listSurveillance } from '@/lib/db/surveillance'
import { getPreScreening, preScreeningApproved } from '@/lib/db/preScreening'
import { criteriaForProgramme, applicableCriteria } from '@/lib/criteria'
import { createClient } from '@/lib/supabase/server'
import { AUDIT_TYPE_META } from '@/lib/audit-types'

const EST = { complete: 'Complete', in_progress: 'In Progress', na: 'N/A Req.' } as Record<string, string>
const OP = { pass: 'Ready', no_pass: 'Needs Action', na: 'N/A Confirmed', pending: '—' } as Record<string, string>
const AU = { pass: 'Conforming', no_pass: 'Non-Conforming', na: 'Not Applicable', pending: '—' } as Record<string, string>
const fmt = (s: string | null | undefined) => (s ? new Date(s).toLocaleDateString('en-GB') : '—')

// A print-friendly dossier of an application's final records: summary, criteria
// results, audit report(s), surveillance, certification decision and version
// history. Rendered on the operator and CB records routes for PDF export.
export default async function ApplicationDossier({ id }: { id: string }) {
  const app = await getApplication(id)
  if (!app) return <p>Application not found.</p>
  const [docs, assessments, audits, surveillance, ps] = await Promise.all([
    listApplicationDocuments(id), listCriterionAssessments(id), listAudits(id), listSurveillance(id), getPreScreening(id),
  ])
  const criteria = app.programme === 'green-key' && preScreeningApproved(ps) && ps ? applicableCriteria(ps) : criteriaForProgramme(app.programme)
  const reports = docs.filter((d) => d.criterion_ref === AUDIT_REPORT_REF)
  const s = statusMeta(app.status)

  const { data: versions } = await createClient()
    .from('application_versions').select('label, status, created_at').eq('application_id', id).order('created_at', { ascending: true })

  const H = ({ children }: { children: React.ReactNode }) => <h2 style={{ fontSize: 15, fontWeight: 700, margin: '18px 0 8px', color: '#0F172A', borderBottom: '1px solid #E2E8F0', paddingBottom: 4 }}>{children}</h2>
  const cell: React.CSSProperties = { border: '1px solid #E2E8F0', padding: '4px 6px', fontSize: 11, textAlign: 'left', verticalAlign: 'top' }

  return (
    <div id="dossier" style={{ maxWidth: 820, margin: '0 auto', color: '#1E293B', fontSize: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1B4332' }}>Green Key — Certification Records</h1>
          <p style={{ color: '#64748B', fontSize: 12 }}>{PROGRAMME_LABEL[app.programme] ?? app.programme} · Generated {new Date().toLocaleString('en-GB')}</p>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: s.bg, color: s.color }}>{s.label}</span>
      </div>

      <H>Establishment</H>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>
        <tr><td style={cell}><strong>Applicant</strong></td><td style={cell}>{app.applicant?.name_en || app.applicant?.email || '—'}</td>
          <td style={cell}><strong>Email</strong></td><td style={cell}>{app.applicant?.email ?? '—'}</td></tr>
        <tr><td style={cell}><strong>Category</strong></td><td style={cell}>{ps?.mainCategory ?? '—'}{ps?.subCategories?.length ? ` (+${ps.subCategories.join(', ')})` : ''}</td>
          <td style={cell}><strong>Submitted</strong></td><td style={cell}>{fmt(app.submitted_at)}</td></tr>
      </tbody></table>

      <H>Criteria assessment ({criteria.length})</H>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>{['No.', 'Criterion', 'Type', 'Est. Progress', 'Operator', 'Auditor'].map((h) => <th key={h} style={{ ...cell, background: '#F8FAFC', fontWeight: 700 }}>{h}</th>)}</tr></thead>
        <tbody>
          {criteria.map((c) => {
            const a = assessments[c.ref]
            return (
              <tr key={c.ref}>
                <td style={cell}>{c.ref}</td>
                <td style={cell}>{c.title}</td>
                <td style={cell}>{c.type ?? ''}</td>
                <td style={cell}>{a?.applicantStatus ? EST[a.applicantStatus] : '—'}</td>
                <td style={cell}>{a ? (OP[a.internal] ?? '—') : '—'}</td>
                <td style={cell}>{a ? (AU[a.external] ?? '—') : '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <H>Audit(s)</H>
      {audits.length === 0 ? <p style={{ fontSize: 11, color: '#94A3B8' }}>No audits recorded.</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Type', 'Period', 'Auditor', 'Date'].map((h) => <th key={h} style={{ ...cell, background: '#F8FAFC', fontWeight: 700 }}>{h}</th>)}</tr></thead>
          <tbody>{audits.map((au) => <tr key={au.id}><td style={cell}>{AUDIT_TYPE_META[au.type]?.label ?? au.type}</td><td style={cell}>{au.period}</td><td style={cell}>{au.auditorName ?? '—'}</td><td style={cell}>{fmt(au.createdAt)}</td></tr>)}</tbody>
        </table>
      )}
      {reports.length > 0 && <p style={{ fontSize: 11, marginTop: 6 }}><strong>Audit report(s):</strong> {reports.map((r) => r.name).join(', ')}</p>}

      <H>Surveillance activities</H>
      {surveillance.length === 0 ? <p style={{ fontSize: 11, color: '#94A3B8' }}>None.</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Period', 'Criteria', 'Status', 'Requested', 'Decided'].map((h) => <th key={h} style={{ ...cell, background: '#F8FAFC', fontWeight: 700 }}>{h}</th>)}</tr></thead>
          <tbody>{surveillance.map((sv) => <tr key={sv.id}><td style={cell}>{sv.period}</td><td style={cell}>{sv.criteria.join(', ')}</td><td style={cell}>{sv.status}</td><td style={cell}>{fmt(sv.requestedAt)}</td><td style={cell}>{fmt(sv.decidedAt)}</td></tr>)}</tbody>
        </table>
      )}

      <H>Certification decision</H>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>
        <tr><td style={cell}><strong>Decision</strong></td><td style={cell}>{app.cb_decision ? (CB_DECISION_LABEL[app.cb_decision] ?? app.cb_decision) : '—'}</td></tr>
        <tr><td style={cell}><strong>CB note</strong></td><td style={cell}>{app.cb_note ?? '—'}</td></tr>
      </tbody></table>

      <H>Version history</H>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>{['Snapshot', 'Status', 'Date'].map((h) => <th key={h} style={{ ...cell, background: '#F8FAFC', fontWeight: 700 }}>{h}</th>)}</tr></thead>
        <tbody>{(versions ?? []).length === 0 ? <tr><td style={cell} colSpan={3}>No frozen versions yet.</td></tr> : (versions ?? []).map((v, i) => <tr key={i}><td style={cell}>{v.label}</td><td style={cell}>{statusMeta(v.status ?? '').label}</td><td style={cell}>{new Date(v.created_at).toLocaleString('en-GB')}</td></tr>)}</tbody>
      </table>

      <p style={{ fontSize: 10, color: '#94A3B8', marginTop: 24, borderTop: '1px solid #E2E8F0', paddingTop: 8 }}>
        This record is retained per the Green Key Certification Process Manual (last two certification cycles). Generated by the FEE Kuwait certification platform.
      </p>
    </div>
  )
}
