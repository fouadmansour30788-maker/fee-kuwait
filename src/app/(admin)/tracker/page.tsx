import { listTracker } from '@/lib/db/tracker'
import { STATUS_META, PROGRAMME_LABEL, CB_DECISION_LABEL } from '@/lib/db/applications'
import TrackerClient from './TrackerClient'

export default async function TrackerPage() {
  const rows = await listTracker()
  return <TrackerClient rows={rows} statusMeta={STATUS_META} programmeLabel={PROGRAMME_LABEL} cbDecisionLabel={CB_DECISION_LABEL} />
}
