import { myApplications, myEntity } from '@/lib/db/establishment'
import { listResources } from '@/lib/db/resources'
import { DEFAULT_PROGRAMMES, type ResourceItem } from '@/lib/resources'

// Resources for the signed-in school / establishment: its institution type's
// programmes plus any it has applied to, and the all-programme resources.
export async function myProgrammeResources(kind: 'school' | 'business'): Promise<ResourceItem[]> {
  const [apps, ent] = await Promise.all([myApplications(), myEntity()])
  const programmes = Array.from(new Set([...DEFAULT_PROGRAMMES[ent?.entityType ?? kind], ...apps.map((a) => a.programme)]))
  return listResources(programmes)
}
