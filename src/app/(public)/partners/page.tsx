import { listPublicPartners } from '@/lib/db/sitePartners'
import PartnersPageClient from './PartnersPageClient'

export const dynamic = 'force-dynamic'

export default async function PartnersPage() {
  const localPartners = await listPublicPartners()
  return <PartnersPageClient localPartners={localPartners} />
}
