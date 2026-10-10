'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalendarRange, Lock, Unlock, Loader2, ChevronRight, AlertCircle, ArrowRight } from 'lucide-react'
import { openNextAcademicYear } from '@/lib/actions/academicYears'
import { formatAcademicYear, nextAcademicYear } from '@/lib/academicYear'

interface Year { id: string; academicYear: string; statusLabel: string; closedAt: string | null }

// Operator: the school's Eco-Schools academic years (one application each), and
// the action that closes the current year and opens the next one.
export default function AcademicYearsPanel({ applicationId, years, linkBase }: {
  applicationId: string
  years: Year[]          // newest first
  linkBase: string       // e.g. '/applications/'
}) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  const router = useRouter()
  const latest = years[0]
  const canOpen = !!latest && latest.id === applicationId && !latest.closedAt
  const next = latest ? nextAcademicYear(latest.academicYear) : ''

  function open() {
    setError('')
    start(async () => {
      const r = await openNextAcademicYear(applicationId)
      if (r.error) { setError(r.error); setConfirming(false) }
      else if (r.id) router.push(`${linkBase}${r.id}`)
    })
  }

  return (
    <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
      <div className="flex items-center gap-2 mb-1">
        <CalendarRange className="w-5 h-5" style={{ color: '#40916C' }} />
        <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Academic years</h2>
      </div>
      <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>Each Eco-Schools application covers one academic year. Closed years stay visible but are read-only for the school.</p>

      <div className="space-y-2">
        {years.map((y) => {
          const here = y.id === applicationId
          return (
            <Link key={y.id} href={`${linkBase}${y.id}`}
              className="flex items-center gap-3 rounded-xl border px-4 py-2.5 transition-colors hover:bg-slate-50"
              style={{ borderColor: here ? '#52B788' : '#E2E8F0', background: here ? '#F1FAF3' : undefined }}>
              {y.closedAt ? <Lock className="w-4 h-4" style={{ color: '#94A3B8' }} /> : <Unlock className="w-4 h-4" style={{ color: '#40916C' }} />}
              <span className="text-sm font-bold" style={{ color: y.closedAt ? '#64748B' : '#14342A' }}>{formatAcademicYear(y.academicYear)}</span>
              <span className="text-xs" style={{ color: '#94A3B8' }}>{y.closedAt ? `Closed ${new Date(y.closedAt).toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait' })}` : 'Current year'} · {y.statusLabel}</span>
              {here && <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#D8F3DC', color: '#1B4332' }}>Viewing</span>}
              {!here && <ChevronRight className="w-4 h-4 ml-auto" style={{ color: '#94A3B8' }} />}
            </Link>
          )
        })}
      </div>

      {canOpen && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: '#F1F5F9' }}>
          {!confirming ? (
            <button onClick={() => setConfirming(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
              Close {formatAcademicYear(latest.academicYear)} &amp; open {formatAcademicYear(next)} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="rounded-xl px-4 py-3 space-y-2.5" style={{ background: '#FEF9EC', border: '1px solid #FDE68A' }}>
              <p className="text-sm" style={{ color: '#854D0E' }}>
                <strong>{formatAcademicYear(latest.academicYear)}</strong> will be locked (read-only for the school) and a new application for <strong>{formatAcademicYear(next)}</strong> opens with all seven steps fresh — new themes, Steps 1–2 approval again and new Green Flag questions. The school is notified.
              </p>
              <div className="flex items-center gap-2">
                <button onClick={open} disabled={pending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: '#1B4332' }}>
                  {pending && <Loader2 className="w-4 h-4 animate-spin" />} Yes, open {formatAcademicYear(next)}
                </button>
                <button onClick={() => setConfirming(false)} disabled={pending} className="px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: '#F1F5F9', color: '#334155' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
      {error && <p className="flex items-center gap-1.5 text-xs mt-3" style={{ color: '#DC2626' }}><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}
    </div>
  )
}
