import { getImpactSettings } from '@/lib/db/impactSettings'
import ImpactPageClient from './ImpactPageClient'

export const dynamic = 'force-dynamic'

export default async function ImpactPage() {
  const impact = await getImpactSettings()
  return <ImpactPageClient impact={impact} />
}
