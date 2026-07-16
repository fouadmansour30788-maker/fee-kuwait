import { SURVEILLANCE_STATUS_META } from '@/lib/db/surveillance'
import type { SurveillanceActivity } from '@/lib/db/surveillance'

// One timeline node for a surveillance activity. Server component; role-specific
// actions are passed in as children.
export default function SurveillanceCard({
  activity, titles, subtitle, children,
}: {
  activity: SurveillanceActivity
  titles: Record<string, string>
  subtitle?: string
  children?: React.ReactNode
}) {
  const meta = SURVEILLANCE_STATUS_META[activity.status]
  const date = new Date(activity.requestedAt).toLocaleDateString('en-GB')
  return (
    <div className="relative pl-8">
      <div className="absolute left-0 top-2 w-3.5 h-3.5 rounded-full" style={{ background: meta.color, boxShadow: '0 0 0 3px #fff' }} />
      <div className="absolute left-[6px] top-6 -bottom-2 w-px" style={{ background: '#E2E8F0' }} />
      <div className="rounded-2xl border p-4 mb-5" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold" style={{ color: '#0F2318' }}>Surveillance · {activity.period}</h3>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
          {subtitle && <span className="text-xs ml-auto" style={{ color: '#94A3B8' }}>{subtitle}</span>}
        </div>
        <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>Requested {date}</p>

        {activity.requestNote && (
          <div className="mt-3 rounded-xl px-3 py-2 text-sm" style={{ background: '#FEF9EC', border: '1px solid #FDE68A', color: '#854D0E' }}>
            <span className="text-[11px] font-semibold block mb-0.5">Operator request</span>{activity.requestNote}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {activity.criteria.map((ref) => (
            <span key={ref} className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg" style={{ background: '#F1F5F9', color: '#475569' }}>
              <span className="font-mono font-semibold" style={{ color: '#40916C' }}>{ref}</span>
              <span className="max-w-[220px] truncate">{titles[ref] ?? ''}</span>
            </span>
          ))}
        </div>

        {children && <div className="mt-4">{children}</div>}

        {activity.decisionNote && (
          <div className="mt-3 rounded-xl px-3 py-2 text-sm" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#334155' }}>
            <span className="text-[11px] font-semibold block mb-0.5" style={{ color: '#64748B' }}>Certification Body decision</span>{activity.decisionNote}
          </div>
        )}
      </div>
    </div>
  )
}
