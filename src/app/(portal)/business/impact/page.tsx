import { Leaf } from 'lucide-react'
import SavingsEstimator from '@/components/resources/SavingsEstimator'

export const metadata = { title: 'Sustainability impact estimator' }

export default function ImpactPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0F2318' }}>Impact estimator</h1>
        <p className="text-sm mt-0.5" style={{ color: '#5B7568' }}>Estimate the water, energy, waste and CO₂ your Green Key practices save each year.</p>
      </div>

      <div className="rounded-2xl border bg-white p-6" style={{ borderColor: '#D4E7DA' }}>
        <SavingsEstimator />
      </div>

      <div className="flex items-start gap-2 rounded-xl p-4 text-xs" style={{ background: '#F0FDF4', color: '#3F6212' }}>
        <Leaf className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>These are indicative estimates using standard conversion factors (grid ~0.45 kg CO₂/kWh, water ~0.003 kg/L, recycling ~0.5 kg/kg). Adjust the inputs to match your own consumption for a closer figure — great for annual sustainability reporting.</p>
      </div>
    </div>
  )
}
