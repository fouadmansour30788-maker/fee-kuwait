import { criteriaForProgramme } from '@/lib/criteria'

type Result = 'pending' | 'pass' | 'no_pass'

// Read-only audit-results summary (used by the operator and the applicant).
// Renders nothing until at least one criterion has been graded.
export default function AuditResults({ programme, assessments }: { programme: string; assessments: Record<string, Result> }) {
  const criteria = criteriaForProgramme(programme)
  const graded = criteria.filter((c) => (assessments[c.ref] ?? 'pending') !== 'pending').length
  if (criteria.length === 0 || graded === 0) return null

  const passed = criteria.filter((c) => assessments[c.ref] === 'pass').length
  const noPass = criteria.filter((c) => assessments[c.ref] === 'no_pass')

  return (
    <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Audit results</h2>
        <span className="text-xs font-semibold" style={{ color: '#64748B' }}>{passed}/{criteria.length} passed · {graded} assessed</span>
      </div>
      {noPass.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold" style={{ color: '#B91C1C' }}>{noPass.length} item(s) to address:</p>
          {noPass.map((c) => (
            <div key={c.ref} className="flex items-center gap-2.5 rounded-lg border p-2.5" style={{ borderColor: '#FECACA', background: '#FEF6F6' }}>
              <span className="text-xs font-mono font-semibold flex-shrink-0" style={{ color: '#B91C1C' }}>{c.ref}</span>
              <p className="text-sm" style={{ color: '#334155' }}>{c.title}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm" style={{ color: '#059669' }}>All assessed criteria passed.</p>
      )}
    </div>
  )
}
