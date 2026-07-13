import Link from 'next/link'
import { ClipboardCheck, CheckCircle2, AlertTriangle, Clock, ArrowRight } from 'lucide-react'
import { ESTABLISHMENT_CATEGORIES } from '@/lib/data/greenKeyCriteria'

const catLabel = (c: string | null) => (c ? (ESTABLISHMENT_CATEGORIES.find((x) => x.code === c)?.label ?? c) : '')

// Shows the pre-screening status on the application page and links to the form.
export default function PreScreeningBanner({
  href, status, mainCategory, subCategories, ineligibleReason, reviewNote,
}: {
  href: string
  status: 'draft' | 'submitted' | 'eligible' | 'rejected' | null
  mainCategory: string | null
  subCategories?: string[]
  ineligibleReason?: string | null
  reviewNote?: string | null
}) {
  const styles = {
    none:      { bg: '#FEF9EC', bd: '#FDE68A', fg: '#854D0E', Icon: ClipboardCheck },
    draft:     { bg: '#FEF9EC', bd: '#FDE68A', fg: '#854D0E', Icon: ClipboardCheck },
    submitted: { bg: '#EFF6FF', bd: '#BFDBFE', fg: '#1D4ED8', Icon: Clock },
    eligible:  { bg: '#ECFDF3', bd: '#A7F3D0', fg: '#047857', Icon: CheckCircle2 },
    rejected:  { bg: '#FEF2F2', bd: '#FECACA', fg: '#991B1B', Icon: AlertTriangle },
  }
  const key = status ?? 'none'
  const s = styles[key]
  const subs = (subCategories ?? []).map((c) => catLabel(c)).filter(Boolean)

  const text = {
    none: 'Complete the mandatory pre-screening survey to confirm eligibility and your Green Key category.',
    draft: 'Your pre-screening is in progress. Complete and submit it for the National Operator to confirm eligibility.',
    submitted: 'Pre-screening submitted — awaiting the National Operator’s eligibility review.',
    eligible: `Eligible · Main category: ${catLabel(mainCategory)}${subs.length ? ` (+ ${subs.join(', ')})` : ''}. The criteria below are filtered to your category.`,
    rejected: `Not eligible${ineligibleReason ? ` — ${ineligibleReason}` : ''}. You may request a re-assessment by the Certification Body.`,
  }[key]

  return (
    <div className="rounded-2xl border px-4 py-3" style={{ background: s.bg, borderColor: s.bd }}>
      <div className="flex items-start gap-2 text-sm" style={{ color: s.fg }}>
        <s.Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p style={{ fontWeight: 600 }}>Pre-screening</p>
          <p className="mt-0.5">{text}</p>
          {reviewNote && <p className="mt-1 text-xs">Note from the National Operator: {reviewNote}</p>}
        </div>
        <Link href={href} className="inline-flex items-center gap-1 text-xs font-semibold whitespace-nowrap px-3 py-1.5 rounded-lg" style={{ background: '#fff', color: s.fg, border: `1px solid ${s.bd}` }}>
          {status === 'eligible' || status === 'submitted' ? 'View' : 'Open'} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
