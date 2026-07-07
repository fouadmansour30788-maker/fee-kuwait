'use client'

import { useState } from 'react'
import { criteriaForProgramme } from '@/lib/criteria'
import { CRITERIA_PROGRAMMES } from '@/lib/resources'
import CompliancePanel from '@/components/audit/CompliancePanel'

// Standalone requirement calculator: pick a programme + certification period and
// see how many imperative + guideline criteria are required (the rulebook calc).
export default function RequirementCalculator() {
  const [programme, setProgramme] = useState('green-key')
  const criteria = criteriaForProgramme(programme)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-xs font-semibold" style={{ color: '#475569' }}>Programme</label>
        <select value={programme} onChange={(e) => setProgramme(e.target.value)} className="text-sm px-3 py-1.5 rounded-lg bg-white outline-none" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }}>
          {CRITERIA_PROGRAMMES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
      </div>
      {criteria.length > 0
        ? <CompliancePanel criteria={criteria} assessments={{}} />
        : <p className="text-sm" style={{ color: '#94A3B8' }}>No structured criteria for this programme yet.</p>}
    </div>
  )
}
