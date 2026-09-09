'use client'

import { useState, useTransition } from 'react'
import { Settings, Save, Upload, Loader2, AlertCircle, Check, Search } from 'lucide-react'
import { saveBecauseConfig, importConsumption, checkImportTask } from '@/lib/actions/because'

type FieldMap = Record<string, { dataPointId?: string; unitId?: string }>
interface Config { framework_id: string | null; group_id: string | null; gk_property_id: string | null; field_map: FieldMap }

const FIELDS: { key: string; label: string }[] = [
  { key: 'electricity', label: 'Electricity' },
  { key: 'water', label: 'Water' },
  { key: 'waste', label: 'Waste' },
]

const inputCls = 'w-full text-sm px-3 py-2 rounded-lg outline-none font-mono'
const inputStyle = { border: '1px solid #E2E8F0', color: '#1E293B' } as const

export default function BecauseImporter({ config }: { config: Config }) {
  // ── Config state ──
  const [frameworkId, setFrameworkId] = useState(config.framework_id ?? '')
  const [groupId, setGroupId] = useState(config.group_id ?? '')
  const [gkProp, setGkProp] = useState(config.gk_property_id ?? '')
  const [fieldMap, setFieldMap] = useState<FieldMap>(config.field_map ?? {})
  const [cfgPending, cfgStart] = useTransition()
  const [cfgMsg, setCfgMsg] = useState<{ ok?: boolean; text: string } | null>(null)

  const setField = (k: string, which: 'dataPointId' | 'unitId', v: string) =>
    setFieldMap((m) => ({ ...m, [k]: { ...m[k], [which]: v } }))

  function saveConfig() {
    setCfgMsg(null)
    cfgStart(async () => {
      const r = await saveBecauseConfig({ frameworkId, groupId, gkPropertyId: gkProp, fieldMap })
      setCfgMsg(r.error ? { text: r.error } : { ok: true, text: 'Configuration saved.' })
    })
  }

  // ── Import state ──
  const [gk, setGk] = useState('')
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [elec, setElec] = useState('')
  const [water, setWater] = useState('')
  const [waste, setWaste] = useState('')
  const [impPending, impStart] = useTransition()
  const [impMsg, setImpMsg] = useState<{ ok?: boolean; text: string } | null>(null)
  const [correlationId, setCorrelationId] = useState('')
  const [task, setTask] = useState<unknown>(null)
  const [taskPending, taskStart] = useTransition()

  function runImport() {
    setImpMsg(null); setTask(null); setCorrelationId('')
    impStart(async () => {
      const r = await importConsumption({
        greenKeyNumber: gk, year: Number(year), month: Number(month),
        electricity: elec === '' ? null : Number(elec),
        water: water === '' ? null : Number(water),
        waste: waste === '' ? null : Number(waste),
      })
      if ('error' in r) setImpMsg({ text: r.error })
      else { setCorrelationId(r.data.correlationId); setImpMsg({ ok: true, text: `Submitted. Correlation id: ${r.data.correlationId}` }) }
    })
  }
  function pollTask() {
    taskStart(async () => { const r = await checkImportTask(correlationId); setTask('error' in r ? { error: r.error } : r.data) })
  }

  return (
    <div className="space-y-5">
      {/* Configuration */}
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <div className="px-5 py-3.5 border-b flex items-center gap-2.5" style={{ borderColor: '#E2E8F0' }}>
          <Settings className="w-4 h-4" style={{ color: '#40916C' }} />
          <h2 className="font-bold text-sm flex-1" style={{ color: '#0F172A' }}>Import configuration</h2>
          <button onClick={saveConfig} disabled={cfgPending} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
            {cfgPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs" style={{ color: '#94A3B8' }}>Paste the IDs you copied from the Discover panels above.</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div><label className="block text-[11px] font-semibold mb-1" style={{ color: '#475569' }}>Framework id</label><input value={frameworkId} onChange={(e) => setFrameworkId(e.target.value)} className={inputCls} style={inputStyle} /></div>
            <div><label className="block text-[11px] font-semibold mb-1" style={{ color: '#475569' }}>Group id</label><input value={groupId} onChange={(e) => setGroupId(e.target.value)} className={inputCls} style={inputStyle} /></div>
            <div><label className="block text-[11px] font-semibold mb-1" style={{ color: '#475569' }}>GK-ID custom property id</label><input value={gkProp} onChange={(e) => setGkProp(e.target.value)} className={inputCls} style={inputStyle} /></div>
          </div>
          <div className="rounded-xl p-3 space-y-2.5" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#64748B' }}>Consumption fields → data-point &amp; unit ids</p>
            {FIELDS.map((f) => (
              <div key={f.key} className="grid grid-cols-[90px_1fr_1fr] gap-2 items-center">
                <span className="text-xs font-semibold" style={{ color: '#334155' }}>{f.label}</span>
                <input value={fieldMap[f.key]?.dataPointId ?? ''} onChange={(e) => setField(f.key, 'dataPointId', e.target.value)} placeholder="data-point id" className={inputCls} style={inputStyle} />
                <input value={fieldMap[f.key]?.unitId ?? ''} onChange={(e) => setField(f.key, 'unitId', e.target.value)} placeholder="unit id (optional)" className={inputCls} style={inputStyle} />
              </div>
            ))}
          </div>
          {cfgMsg && <p className="flex items-center gap-1.5 text-xs" style={{ color: cfgMsg.ok ? '#047857' : '#DC2626' }}>{cfgMsg.ok ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />} {cfgMsg.text}</p>}
        </div>
      </div>

      {/* Test import */}
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <div className="px-5 py-3.5 border-b flex items-center gap-2.5" style={{ borderColor: '#E2E8F0' }}>
          <Upload className="w-4 h-4" style={{ color: '#40916C' }} />
          <h2 className="font-bold text-sm flex-1" style={{ color: '#0F172A' }}>Import a monthly reading</h2>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs" style={{ color: '#94A3B8' }}>Identifies the establishment by its Green Key number via the GK-ID custom property, then upserts the month&apos;s electricity/water/waste as framework answers.</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div><label className="block text-[11px] font-semibold mb-1" style={{ color: '#475569' }}>Green Key number</label><input value={gk} onChange={(e) => setGk(e.target.value)} className={inputCls} style={inputStyle} /></div>
            <div><label className="block text-[11px] font-semibold mb-1" style={{ color: '#475569' }}>Year</label><input type="number" value={year} onChange={(e) => setYear(e.target.value)} className={inputCls} style={inputStyle} /></div>
            <div><label className="block text-[11px] font-semibold mb-1" style={{ color: '#475569' }}>Month (1–12)</label><input type="number" min="1" max="12" value={month} onChange={(e) => setMonth(e.target.value)} className={inputCls} style={inputStyle} /></div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div><label className="block text-[11px] font-semibold mb-1" style={{ color: '#475569' }}>Electricity</label><input type="number" value={elec} onChange={(e) => setElec(e.target.value)} className={inputCls} style={inputStyle} /></div>
            <div><label className="block text-[11px] font-semibold mb-1" style={{ color: '#475569' }}>Water</label><input type="number" value={water} onChange={(e) => setWater(e.target.value)} className={inputCls} style={inputStyle} /></div>
            <div><label className="block text-[11px] font-semibold mb-1" style={{ color: '#475569' }}>Waste</label><input type="number" value={waste} onChange={(e) => setWaste(e.target.value)} className={inputCls} style={inputStyle} /></div>
          </div>
          <button onClick={runImport} disabled={impPending} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
            {impPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Send to BeCause
          </button>
          {impMsg && <p className="flex items-center gap-1.5 text-xs break-all" style={{ color: impMsg.ok ? '#047857' : '#DC2626' }}>{impMsg.ok ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />} {impMsg.text}</p>}

          {correlationId && (
            <div className="pt-3 border-t" style={{ borderColor: '#F1F5F9' }}>
              <button onClick={pollTask} disabled={taskPending} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-60" style={{ background: '#F1F5F9', color: '#334155' }}>
                {taskPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />} Check import status
              </button>
              {task != null && <pre className="text-[11px] mt-2 p-3 rounded-lg overflow-x-auto max-h-72" style={{ background: '#0F172A', color: '#E2E8F0' }}>{JSON.stringify(task, null, 2)}</pre>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
