'use client'

import { useState } from 'react'
import { Droplets, Zap, Trash2, Leaf, TreePine, Car } from 'lucide-react'

function NumberField({ label, value, onChange, suffix }: { label: string; value: string; onChange: (v: string) => void; suffix?: string }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold mb-1" style={{ color: '#475569' }}>{label}</span>
      <div className="flex items-center gap-1.5">
        <input type="number" min="0" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm px-3 py-2 rounded-lg outline-none" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} />
        {suffix && <span className="text-xs flex-shrink-0" style={{ color: '#94A3B8' }}>{suffix}</span>}
      </div>
    </label>
  )
}
const n = (s: string) => (Number.isFinite(+s) ? +s : 0)
const fmt = (x: number) => Math.round(x).toLocaleString('en-GB')

export default function SavingsEstimator() {
  // Water
  const [guests, setGuests] = useState('10000')
  const [lpg, setLpg] = useState('300')
  const [wRed, setWRed] = useState('15')
  const waterSaved = n(guests) * n(lpg) * (n(wRed) / 100) // litres/yr
  // Energy
  const [kwh, setKwh] = useState('20000')
  const [eRed, setERed] = useState('12')
  const kwhSaved = n(kwh) * 12 * (n(eRed) / 100)
  const co2 = kwhSaved * 0.45 // kg CO2 (grid factor)
  // Waste
  const [wasteKg, setWasteKg] = useState('2000')
  const [divert, setDivert] = useState('40')
  const diverted = n(wasteKg) * 12 * (n(divert) / 100)

  const cards = [
    {
      Icon: Droplets, color: '#0891B2', title: 'Water',
      inputs: (
        <>
          <NumberField label="Guests / year" value={guests} onChange={setGuests} />
          <NumberField label="Litres per guest" value={lpg} onChange={setLpg} suffix="L" />
          <NumberField label="Target reduction" value={wRed} onChange={setWRed} suffix="%" />
        </>
      ),
      result: `${fmt(waterSaved)} L`, resultLabel: 'saved per year',
    },
    {
      Icon: Zap, color: '#D97706', title: 'Energy',
      inputs: (
        <>
          <NumberField label="Electricity / month" value={kwh} onChange={setKwh} suffix="kWh" />
          <NumberField label="Target reduction" value={eRed} onChange={setERed} suffix="%" />
        </>
      ),
      result: `${fmt(kwhSaved)} kWh`, resultLabel: `saved / yr · ${fmt(co2)} kg CO₂ avoided`,
    },
    {
      Icon: Trash2, color: '#059669', title: 'Waste',
      inputs: (
        <>
          <NumberField label="Waste / month" value={wasteKg} onChange={setWasteKg} suffix="kg" />
          <NumberField label="Diversion (recycled)" value={divert} onChange={setDivert} suffix="%" />
        </>
      ),
      result: `${fmt(diverted)} kg`, resultLabel: 'diverted from landfill / yr',
    },
  ]

  // Total annual CO₂ avoided across all three streams (rough factors: grid 0.45
  // kg/kWh, water pumping/heating ~0.003 kg/L, recycling benefit ~0.5 kg/kg).
  const totalCo2 = co2 + waterSaved * 0.003 + diverted * 0.5
  const trees = totalCo2 / 21      // one mature tree absorbs ~21 kg CO₂/yr
  const cars = totalCo2 / 4600     // avg car emits ~4.6 t CO₂/yr

  return (
    <div className="space-y-4">
      {/* Impact headline */}
      <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Leaf className="w-4 h-4" style={{ color: '#B7E4C7' }} />
          <span className="text-xs font-semibold" style={{ color: '#D8F3DC' }}>Estimated annual impact</span>
        </div>
        <p className="text-3xl font-bold">{fmt(totalCo2)} kg CO₂ <span className="text-lg font-semibold" style={{ color: '#D8F3DC' }}>avoided / year</span></p>
        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm" style={{ color: '#D8F3DC' }}>
          <span className="inline-flex items-center gap-1.5"><TreePine className="w-4 h-4" /> ≈ {fmt(trees)} trees planted</span>
          <span className="inline-flex items-center gap-1.5"><Car className="w-4 h-4" /> ≈ {cars.toFixed(1)} cars off the road</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
      {cards.map((c) => (
        <div key={c.title} className="rounded-xl border p-4" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${c.color}14` }}>
              <c.Icon className="w-4 h-4" style={{ color: c.color }} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: '#0F172A' }}>{c.title}</h3>
          </div>
          <div className="space-y-2.5">{c.inputs}</div>
          <div className="mt-3 pt-3 border-t" style={{ borderColor: '#F1F5F9' }}>
            <p className="text-xl font-bold" style={{ color: c.color }}>{c.result}</p>
            <p className="text-[11px]" style={{ color: '#94A3B8' }}>{c.resultLabel}</p>
          </div>
        </div>
      ))}
      </div>
    </div>
  )
}
