import { Save } from 'lucide-react'
import { saveArticle } from '@/lib/actions/news'
import type { Article } from '@/lib/db/news'

const PROGRAMMES = ['', 'eco-schools', 'blue-flag', 'green-key', 'leaf', 'yre', 'eco-campus']

function Field({ label, name, value, placeholder }: { label: string; name: string; value?: string | null; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>{label}</label>
      <input name={name} defaultValue={value ?? ''} placeholder={placeholder}
        className="w-full text-sm px-3 py-2.5 rounded-xl outline-none" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} />
    </div>
  )
}
function Area({ label, name, value, rows = 3, dir }: { label: string; name: string; value?: string | null; rows?: number; dir?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>{label}</label>
      <textarea name={name} defaultValue={value ?? ''} rows={rows} dir={dir}
        className="w-full text-sm px-3 py-2.5 rounded-xl outline-none resize-y" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }} />
    </div>
  )
}

export default function ArticleForm({ article }: { article: Article | null }) {
  return (
    <form action={saveArticle} className="space-y-5">
      {article && <input type="hidden" name="id" value={article.id} />}

      <div className="bg-white rounded-2xl border p-6 space-y-4" style={{ borderColor: '#E2E8F0' }}>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Title (English)" name="title_en" value={article?.title_en} placeholder="Headline" />
          <Field label="العنوان (Arabic)" name="title_ar" value={article?.title_ar} placeholder="العنوان" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Area label="Excerpt (English)" name="excerpt_en" value={article?.excerpt_en} rows={2} />
          <Area label="المقتطف (Arabic)" name="excerpt_ar" value={article?.excerpt_ar} rows={2} dir="rtl" />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Cover image URL" name="image_url" value={article?.image_url} placeholder="https://…" />
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>Programme</label>
            <select name="programme" defaultValue={article?.programme ?? ''} className="w-full text-sm px-3 py-2.5 rounded-xl outline-none bg-white" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }}>
              {PROGRAMMES.map((p) => <option key={p} value={p}>{p || '— none —'}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>Status</label>
            <select name="status" defaultValue={article?.status ?? 'draft'} className="w-full text-sm px-3 py-2.5 rounded-xl outline-none bg-white" style={{ border: '1px solid #E2E8F0', color: '#1E293B' }}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>
        <Area label="Body (English)" name="body_en" value={article?.body_en} rows={8} />
        <Area label="النص (Arabic)" name="body_ar" value={article?.body_ar} rows={8} dir="rtl" />
      </div>

      <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
        <Save className="w-4 h-4" /> Save
      </button>
    </form>
  )
}
