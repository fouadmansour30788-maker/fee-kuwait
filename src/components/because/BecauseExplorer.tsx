'use client'

import { useState, useTransition } from 'react'
import { Loader2, Copy, Check, AlertCircle, Search, Boxes, Ruler, Tag, ListTree } from 'lucide-react'
import {
  discoverFrameworks, discoverGroups, discoverCustomProperties, discoverUnitTypes,
  discoverFrameworkStructure, checkImportTask,
} from '@/lib/actions/because'
import { flattenDataPoints, type FlatDataPoint } from '@/lib/because/client'

type Row = Record<string, unknown>

function CopyId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={async () => { try { await navigator.clipboard.writeText(id); setCopied(true); setTimeout(() => setCopied(false), 1200) } catch { /* ignore */ } }}
      className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-md" style={{ background: '#F1F5F9', color: '#334155' }} title="Copy id">
      {id} {copied ? <Check className="w-3 h-3" style={{ color: '#16A34A' }} /> : <Copy className="w-3 h-3" style={{ color: '#94A3B8' }} />}
    </button>
  )
}

function Panel({ title, icon: Icon, children, onRun, busy }: { title: string; icon: React.ElementType; children?: React.ReactNode; onRun: () => void; busy: boolean }) {
  return (
    <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
      <div className="px-5 py-3.5 border-b flex items-center gap-2.5" style={{ borderColor: '#E2E8F0' }}>
        <Icon className="w-4 h-4" style={{ color: '#40916C' }} />
        <h2 className="font-bold text-sm flex-1" style={{ color: '#0F172A' }}>{title}</h2>
        <button onClick={onRun} disabled={busy}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />} Discover
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function ErrorLine({ text }: { text: string }) {
  return <p className="flex items-start gap-1.5 text-xs" style={{ color: '#DC2626' }}><AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> {text}</p>
}

function IdTable({ rows, columns }: { rows: Row[]; columns: { key: string; label: string; id?: boolean; badge?: boolean }[] }) {
  if (rows.length === 0) return <p className="text-xs" style={{ color: '#94A3B8' }}>No rows returned.</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
            {columns.map((c) => <th key={c.key} className="text-left px-3 py-2 font-semibold text-[11px] uppercase tracking-wider" style={{ color: '#94A3B8' }}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t" style={{ borderColor: '#F1F5F9' }}>
              {columns.map((c) => {
                const v = r[c.key]
                return (
                  <td key={c.key} className="px-3 py-2 align-top" style={{ color: '#334155' }}>
                    {v == null ? <span style={{ color: '#CBD5E1' }}>—</span>
                      : c.id ? <CopyId id={String(v)} />
                      : c.badge ? <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded" style={{ background: v ? '#DCFCE7' : '#F1F5F9', color: v ? '#166534' : '#64748B' }}>{String(v)}</span>
                      : String(v)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// The list endpoints may return a bare array or wrap it in an envelope
// ({data|items|results|value|content|frameworks|groups|…: [...]}). Pull the first
// array we can find so the tables render regardless of shape.
function pickRows(data: unknown): Row[] {
  if (Array.isArray(data)) return data as Row[]
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>
    for (const k of ['data', 'items', 'results', 'value', 'content', 'records', 'frameworks', 'groups', 'customProperties', 'unitTypes']) {
      if (Array.isArray(o[k])) return o[k] as Row[]
    }
    for (const v of Object.values(o)) if (Array.isArray(v)) return v as Row[]
  }
  return []
}

function RawResponse({ raw }: { raw: unknown }) {
  return (
    <details className="mt-3">
      <summary className="text-xs font-semibold cursor-pointer" style={{ color: '#64748B' }}>Raw response</summary>
      <pre className="text-[11px] mt-2 p-3 rounded-lg overflow-x-auto max-h-80" style={{ background: '#0F172A', color: '#E2E8F0' }}>{JSON.stringify(raw, null, 2)}</pre>
    </details>
  )
}

export default function BecauseExplorer({ configured, baseUrl }: { configured: boolean; baseUrl: string }) {
  const [pending, start] = useTransition()
  const [active, setActive] = useState<string | null>(null)
  const [fw, setFw] = useState<{ rows?: Row[]; raw?: unknown; error?: string }>()
  const [groups, setGroups] = useState<{ rows?: Row[]; raw?: unknown; error?: string }>()
  const [props, setProps] = useState<{ rows?: Row[]; raw?: unknown; error?: string }>()
  const [units, setUnits] = useState<{ rows?: Row[]; raw?: unknown; error?: string }>()
  const [fid, setFid] = useState('')
  const [struct, setStruct] = useState<{ points?: FlatDataPoint[]; raw?: unknown; error?: string }>()
  const [cid, setCid] = useState('')
  const [task, setTask] = useState<{ raw?: unknown; error?: string }>()

  function go(key: string, fn: () => void) { setActive(key); start(fn) }
  const busy = (key: string) => pending && active === key

  if (!configured) {
    return (
      <div className="rounded-2xl border p-6" style={{ background: '#FFF7ED', borderColor: '#FED7AA' }}>
        <p className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#9A3412' }}>
          <AlertCircle className="w-4 h-4" /> BeCause API key not set
        </p>
        <p className="text-sm mt-1.5" style={{ color: '#9A3412' }}>
          Add <code className="px-1.5 py-0.5 rounded" style={{ background: '#FFEDD5' }}>BECAUSE_API_KEY</code> (and optionally
          <code className="px-1.5 py-0.5 rounded ml-1" style={{ background: '#FFEDD5' }}>BECAUSE_API_BASE</code>) to the Vercel project
          environment variables and redeploy. Then reload this page to discover the framework, group, unit and custom-property IDs.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-xs" style={{ color: '#94A3B8' }}>
        Requests go to <code className="px-1.5 py-0.5 rounded" style={{ background: '#F1F5F9', color: '#475569' }}>{baseUrl}</code>.
        If a panel says “No rows returned”, open <span className="font-semibold">Raw response</span> to see exactly what BeCause sent —
        an empty list means the API key&apos;s profile has no frameworks assigned yet; set <code className="px-1 rounded" style={{ background: '#F1F5F9', color: '#475569' }}>BECAUSE_API_BASE</code> in Vercel if the host above is wrong.
      </p>

      {/* Frameworks — find the Green Key consumption framework */}
      <Panel title="Frameworks — find the GK consumption framework" icon={Boxes}
        busy={busy('fw')} onRun={() => go('fw', async () => { const r = await discoverFrameworks(); setFw('error' in r ? { error: r.error } : { rows: pickRows(r.data), raw: r.data }) })}>
        {fw?.error && <ErrorLine text={fw.error} />}
        {fw?.rows && <IdTable rows={fw.rows} columns={[{ key: 'id', label: 'Framework ID', id: true }, { key: 'title', label: 'Title' }, { key: 'name', label: 'Name' }]} />}
        {fw?.rows && fw.rows.length > 0 && <p className="text-xs mt-3" style={{ color: '#94A3B8' }}>Copy the Green Key consumption framework&apos;s ID, then paste it below to fetch its data-point IDs.</p>}
        {fw?.raw !== undefined && <RawResponse raw={fw.raw} />}
      </Panel>

      {/* Framework structure — data point IDs */}
      <Panel title="Framework structure — consumption data-point IDs" icon={ListTree}
        busy={busy('struct')} onRun={() => go('struct', async () => {
          const r = await discoverFrameworkStructure(fid)
          if ('error' in r) setStruct({ error: r.error })
          else setStruct({ points: flattenDataPoints(r.data), raw: r.data })
        })}>
        <div className="flex gap-2 mb-3">
          <input value={fid} onChange={(e) => setFid(e.target.value)} placeholder="Framework ID"
            className="flex-1 text-sm px-3 py-2 rounded-lg outline-none font-mono" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} />
        </div>
        {struct?.error && <ErrorLine text={struct.error} />}
        {struct?.points && (
          <>
            <IdTable rows={struct.points as unknown as Row[]} columns={[
              { key: 'id', label: 'Data-point ID', id: true },
              { key: 'label', label: 'Field' },
              { key: 'valueType', label: 'Value type' },
            ]} />
            <details className="mt-3">
              <summary className="text-xs font-semibold cursor-pointer" style={{ color: '#64748B' }}>Raw structure JSON</summary>
              <pre className="text-[11px] mt-2 p-3 rounded-lg overflow-x-auto max-h-96" style={{ background: '#0F172A', color: '#E2E8F0' }}>{JSON.stringify(struct.raw, null, 2)}</pre>
            </details>
          </>
        )}
      </Panel>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Groups */}
        <Panel title="Groups — group ID" icon={Boxes}
          busy={busy('groups')} onRun={() => go('groups', async () => { const r = await discoverGroups(); setGroups('error' in r ? { error: r.error } : { rows: pickRows(r.data), raw: r.data }) })}>
          {groups?.error && <ErrorLine text={groups.error} />}
          {groups?.rows && <IdTable rows={groups.rows} columns={[{ key: 'id', label: 'Group ID', id: true }, { key: 'name', label: 'Name' }]} />}
          {groups?.raw !== undefined && <RawResponse raw={groups.raw} />}
        </Panel>

        {/* Custom properties — GK ID identifier */}
        <Panel title="Custom properties — GK ID identifier" icon={Tag}
          busy={busy('props')} onRun={() => go('props', async () => { const r = await discoverCustomProperties(); setProps('error' in r ? { error: r.error } : { rows: pickRows(r.data), raw: r.data }) })}>
          {props?.error && <ErrorLine text={props.error} />}
          {props?.rows && <IdTable rows={props.rows} columns={[
            { key: 'id', label: 'Property ID', id: true },
            { key: 'name', label: 'Name' },
            { key: 'isIdentifier', label: 'Identifier', badge: true },
          ]} />}
          {props?.raw !== undefined && <RawResponse raw={props.raw} />}
        </Panel>
      </div>

      {/* Unit types */}
      <Panel title="Unit types — unit IDs (kWh, m³, kg …)" icon={Ruler}
        busy={busy('units')} onRun={() => go('units', async () => { const r = await discoverUnitTypes(); setUnits('error' in r ? { error: r.error } : { rows: pickRows(r.data), raw: r.data }) })}>
        {units?.error && <ErrorLine text={units.error} />}
        {units?.rows && <IdTable rows={units.rows} columns={[{ key: 'id', label: 'Unit ID', id: true }, { key: 'name', label: 'Name' }, { key: 'symbol', label: 'Symbol' }]} />}
        {units?.raw !== undefined && <RawResponse raw={units.raw} />}
      </Panel>

      {/* Import task status */}
      <Panel title="Check an import task" icon={Search}
        busy={busy('task')} onRun={() => go('task', async () => { const r = await checkImportTask(cid); setTask('error' in r ? { error: r.error } : { raw: r.data }) })}>
        <div className="flex gap-2 mb-3">
          <input value={cid} onChange={(e) => setCid(e.target.value)} placeholder="correlationId from an upsert"
            className="flex-1 text-sm px-3 py-2 rounded-lg outline-none font-mono" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} />
        </div>
        {task?.error && <ErrorLine text={task.error} />}
        {task?.raw != null && <pre className="text-[11px] p-3 rounded-lg overflow-x-auto max-h-96" style={{ background: '#0F172A', color: '#E2E8F0' }}>{JSON.stringify(task.raw, null, 2)}</pre>}
      </Panel>
    </div>
  )
}
