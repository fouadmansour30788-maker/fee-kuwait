import EstablishmentResources from '@/components/resources/EstablishmentResources'
import { myProgrammeResources } from '@/lib/db/memberResources'

export const dynamic = 'force-dynamic'

export default async function BusinessResourcesPage() {
  return <EstablishmentResources resources={await myProgrammeResources('business')} />
}
