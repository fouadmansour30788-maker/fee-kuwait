import { Clock } from 'lucide-react'
import { TIMELINE_TONE, type TimelineEvent } from '@/lib/db/timeline'

const fmt = (at: string | null) => {
  if (!at) return '—'
  const d = new Date(at)
  return d.toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait', day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' + d.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kuwait', hour: '2-digit', minute: '2-digit' })
}

// The establishment's journey & history as a vertical, table-like timeline
// (date · event · detail). Oldest at the top.
export default function JourneyTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="py-10 text-center" style={{ color: '#94A3B8' }}>
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm font-medium" style={{ color: '#475569' }}>No history yet</p>
      </div>
    )
  }
  return (
    <ol className="relative">
      {events.map((e, i) => {
        const t = TIMELINE_TONE[e.tone]
        const last = i === events.length - 1
        return (
          <li key={e.id} className="flex gap-3">
            {/* Rail */}
            <div className="flex flex-col items-center flex-shrink-0">
              <span className="w-3 h-3 rounded-full mt-1.5" style={{ background: t.color, boxShadow: `0 0 0 3px ${t.bg}` }} />
              {!last && <span className="w-px flex-1 my-1" style={{ background: '#E2E8F0' }} />}
            </div>
            {/* Content */}
            <div className={`min-w-0 flex-1 ${last ? '' : 'pb-4'}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: t.bg, color: t.color }}>{t.label}</span>
                <span className="text-sm font-semibold" style={{ color: '#1E293B' }}>{e.title}</span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{fmt(e.at)}{e.actor ? ` · ${e.actor}` : ''}</p>
              {e.detail && <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{e.detail}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
