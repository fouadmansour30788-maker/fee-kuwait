import { listPublicPartners } from '@/lib/db/sitePartners'
import { getPublicGkGroups } from '@/lib/db/gkPartners'
import PartnersPageClient from './PartnersPageClient'

export const dynamic = 'force-dynamic'

export default async function PartnersPage() {
  const [localPartners, gkGroups] = await Promise.all([listPublicPartners(), getPublicGkGroups()])
  return <PartnersPageClient localPartners={localPartners} gkGroups={gkGroups} />
}
