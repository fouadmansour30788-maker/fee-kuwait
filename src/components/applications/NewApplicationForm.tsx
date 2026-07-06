'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Waves, GraduationCap, School, Leaf, Newspaper, Send, AlertCircle, type LucideIcon } from 'lucide-react'
import { createApplication } from '@/lib/actions/applications'

const PROGRAMME_META: Record<string, { label: string; Icon: LucideIcon; color: string }> = {
  'green-key':  { label: 'Green Key',  Icon: KeyRound, color: '#C8A951' },
  'blue-flag':  { label: 'Blue Flag',  Icon: Waves, color: '#0891B2' },
  'eco-campus': { label: 'Eco-Campus', Icon: GraduationCap, color: '#52B788' },
  'eco-schools':{ label: 'Eco-Schools', Icon: School, color: '#52B788' },
  'leaf':       { label: 'LEAF', Icon: Leaf, color: '#74C69D' },
  'yre':        { label: 'YRE', Icon: Newspaper, color: '#A8DADC' },
}

export default function NewApplicationForm({ programmes }: { programmes: string[] }) {
  const [programme, setProgramme] = useState(programmes[0])
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  const router = useRouter()

  function submit() {
    setError('')
    start(async () => {
      const res = await createApplication(programme)
      if (res.error) setError(res.error)
      else router.refresh()
    })
  }

  return (
    <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#D4E7DA' }}>
      <h2 className="text-base font-bold mb-1" style={{ color: '#0F2318' }}>Start a new application</h2>
      <p className="text-xs mb-4" style={{ color: '#5B7568' }}>Choose the programme you want to apply for.</p>
      <div className="grid sm:grid-cols-3 gap-2.5 mb-4">
        {programmes.map((id) => {
          const p = PROGRAMME_META[id]
          if (!p) return null
          const active = programme === id
          return (
            <button key={id} onClick={() => setProgramme(id)}
              className="flex items-center gap-2 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all"
              style={active ? { background: p.color, color: '#fff' } : { background: '#F4F9F5', color: '#3D4A42', border: '1px solid #D4E7DA' }}>
              <p.Icon className="w-4 h-4" /> {p.label}
            </button>
          )
        })}
      </div>
      {error && (
        <div className="flex items-center gap-2 p-3 mb-3 rounded-xl text-sm" style={{ background: '#FFF5F5', border: '1px solid #FED7D7', color: '#E53E3E' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}
      <button onClick={submit} disabled={pending}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
        <Send className="w-4 h-4" /> {pending ? 'Submitting…' : 'Submit application'}
      </button>
    </div>
  )
}
