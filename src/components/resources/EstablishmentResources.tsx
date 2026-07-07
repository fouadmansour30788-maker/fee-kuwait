import type { LucideIcon } from 'lucide-react'
import { Calculator, ClipboardCheck, Leaf } from 'lucide-react'
import RequirementCalculator from './RequirementCalculator'
import ReadinessSelfCheck from './ReadinessSelfCheck'
import SavingsEstimator from './SavingsEstimator'
import BrandCard from './BrandCard'

function Section({ Icon, color, title, subtitle, children }: { Icon: LucideIcon; color: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" style={{ color }} />
        <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>{title}</h2>
      </div>
      <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>{subtitle}</p>
      {children}
    </div>
  )
}

export default function EstablishmentResources() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0F2318' }}>Resources &amp; tools</h1>
        <p className="text-sm mt-0.5" style={{ color: '#5B7568' }}>Interactive tools to help you prepare, plus FEE brand assets and guides.</p>
      </div>

      <Section Icon={Calculator} color="#2563EB" title="Requirement calculator" subtitle="How many imperative and guideline criteria you need to meet, by programme and certificate age.">
        <RequirementCalculator />
      </Section>

      <Section Icon={ClipboardCheck} color="#7C3AED" title="Readiness self-check" subtitle="Estimate how ready you are across the key areas — this isn't the official assessment.">
        <ReadinessSelfCheck />
      </Section>

      <Section Icon={Leaf} color="#059669" title="Savings estimators" subtitle="Quick water, energy and waste calculators to size the impact of efficiency measures.">
        <SavingsEstimator />
      </Section>

      <BrandCard />
    </div>
  )
}
