import Link from 'next/link'
import { BarChart3, TrendingUp, Info, Inbox } from 'lucide-react'
import { getBenchmark } from '@/lib/db/benchmark'

export const dynamic = 'force-dynamic'

const GREEN = '#40916C'
const PEER = '#94A3B8'

export default async function BenchmarkingPage() {
  const b = await getBenchmark()

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0F2318' }}>Benchmarking</h1>
        <p className="text-sm mt-0.5" style={{ color: '#5B7568' }}>How your Green Key progress compares to other establishments — anonymously.</p>
      </div>

      {!b ? (
        <div className="text-center py-16 rounded-2xl border bg-white" style={{ borderColor: '#D4E7DA' }}>
          <Inbox className="w-9 h-9 mx-auto mb-2 opacity-30" style={{ color: '#40916C' }} />
          <p className="text-sm font-medium" style={{ color: '#475569' }}>No Green Key application yet</p>
          <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Start your application and complete criteria to unlock benchmarking.</p>
          <Link href="/business/application" className="inline-block mt-4 text-sm font-semibold" style={{ color: GREEN }}>Go to application →</Link>
        </div>
      ) : b.peerCount === 0 ? (
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: '#D4E7DA' }}>
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 mt-0.5" style={{ color: '#2563EB' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#0F2318' }}>You’re the first — no peers to compare yet</p>
              <p className="text-xs mt-1" style={{ color: '#5B7568' }}>Your per-area completion is shown below. As more establishments join, you’ll see how you stack up.</p>
            </div>
          </div>
          <div className="mt-5"><AreaBars areas={b.areas} showPeer={false} /></div>
        </div>
      ) : (
        <>
          {/* Headline */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-2xl p-5 text-white sm:col-span-1" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
              <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4" style={{ color: '#B7E4C7' }} /><span className="text-xs font-semibold" style={{ color: '#D8F3DC' }}>Your percentile</span></div>
              <p className="text-4xl font-bold">Top {Math.max(1, 100 - b.percentile)}%</p>
              <p className="text-xs mt-1" style={{ color: '#D8F3DC' }}>among {b.peerCount} peer establishment{b.peerCount === 1 ? '' : 's'}</p>
            </div>
            <div className="rounded-2xl border bg-white p-5 flex flex-col justify-center" style={{ borderColor: '#D4E7DA' }}>
              <p className="text-xs font-semibold" style={{ color: '#94A3B8' }}>Your overall completion</p>
              <p className="text-3xl font-bold" style={{ color: GREEN }}>{b.overallMine}%</p>
            </div>
            <div className="rounded-2xl border bg-white p-5 flex flex-col justify-center" style={{ borderColor: '#D4E7DA' }}>
              <p className="text-xs font-semibold" style={{ color: '#94A3B8' }}>Peer average</p>
              <p className="text-3xl font-bold" style={{ color: PEER }}>{b.overallPeerAvg}%</p>
            </div>
          </div>

          {/* Per-area comparison */}
          <div className="rounded-2xl border bg-white p-6" style={{ borderColor: '#D4E7DA' }}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" style={{ color: GREEN }} />
                <h2 className="font-bold text-sm" style={{ color: '#0F2318' }}>By Green Key area — you vs peer average</h2>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#475569' }}><span className="w-2.5 h-2.5 rounded-full" style={{ background: GREEN }} /> You</span>
                <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#475569' }}><span className="w-2.5 h-2.5 rounded-full" style={{ background: PEER }} /> Peers</span>
              </div>
            </div>
            <AreaBars areas={b.areas} showPeer />
          </div>

          {/* Narrative */}
          <div className="rounded-2xl border bg-white p-6" style={{ borderColor: '#D4E7DA' }}>
            <h2 className="font-bold text-sm mb-3" style={{ color: '#0F2318' }}>What this tells you</h2>
            <BenchmarkNarrative areas={b.areas} />
          </div>
        </>
      )}
    </div>
  )
}

function AreaBars({ areas, showPeer }: { areas: { n: number; title: string; mine: number; peerAvg: number }[]; showPeer: boolean }) {
  return (
    <div className="space-y-4">
      {areas.map((a) => (
        <div key={a.n}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold" style={{ color: '#334155' }}>{a.n}. {a.title}</span>
            <span className="text-xs font-bold" style={{ color: '#0F2318' }}>{a.mine}%{showPeer && <span className="font-normal" style={{ color: '#94A3B8' }}> · peers {a.peerAvg}%</span>}</span>
          </div>
          <div className="relative h-3 rounded-full bg-slate-100 overflow-hidden">
            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${a.mine}%`, background: '#40916C' }} />
            {showPeer && <div className="absolute inset-y-0 w-0.5" style={{ left: `${a.peerAvg}%`, background: '#475569' }} title={`Peer average ${a.peerAvg}%`} />}
          </div>
        </div>
      ))}
    </div>
  )
}

function BenchmarkNarrative({ areas }: { areas: { n: number; title: string; mine: number; peerAvg: number }[] }) {
  const ahead = areas.filter((a) => a.mine > a.peerAvg).sort((a, b) => (b.mine - b.peerAvg) - (a.mine - a.peerAvg))
  const behind = areas.filter((a) => a.mine < a.peerAvg).sort((a, b) => (b.peerAvg - b.mine) - (a.peerAvg - a.mine))
  return (
    <div className="grid md:grid-cols-2 gap-3 text-sm">
      <div className="rounded-xl p-3.5" style={{ background: '#ECFDF3' }}>
        <p className="font-semibold mb-1" style={{ color: '#047857' }}>Where you lead</p>
        {ahead.length ? <p style={{ color: '#475569' }}>Strongest vs peers in <strong>{ahead[0].title}</strong> (+{ahead[0].mine - ahead[0].peerAvg} pts){ahead[1] ? ` and ${ahead[1].title}` : ''}.</p> : <p style={{ color: '#94A3B8' }}>Keep completing criteria to pull ahead.</p>}
      </div>
      <div className="rounded-xl p-3.5" style={{ background: '#FEF9EC' }}>
        <p className="font-semibold mb-1" style={{ color: '#B45309' }}>Where to focus</p>
        {behind.length ? <p style={{ color: '#475569' }}>Most room to improve in <strong>{behind[0].title}</strong> ({behind[0].peerAvg - behind[0].mine} pts behind peers){behind[1] ? ` and ${behind[1].title}` : ''}.</p> : <p style={{ color: '#94A3B8' }}>You match or beat peers in every area — excellent.</p>}
      </div>
    </div>
  )
}
