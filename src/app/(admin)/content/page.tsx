import Link from 'next/link'
import { Plus, Edit2, Trash2, Inbox, Newspaper } from 'lucide-react'
import { listAllNews, NEWS_STATUS_META } from '@/lib/db/news'
import { deleteArticle } from '@/lib/actions/news'

export default async function ContentPage() {
  const articles = await listAllNews()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Content</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{articles.length} news {articles.length === 1 ? 'article' : 'articles'}</p>
        </div>
        <Link href="/content/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #1B4332, #40916C)' }}>
          <Plus className="w-4 h-4" /> New article
        </Link>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {['Title', 'Programme', 'Status', 'Updated', ''].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider" style={{ color: '#94A3B8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: '#F8FAFC' }}>
            {articles.map((a) => {
              const st = NEWS_STATUS_META[a.status] ?? { label: a.status, color: '#64748B', bg: '#F1F5F9' }
              return (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5"><Link href={`/content/${a.id}`} className="font-medium line-clamp-1" style={{ color: '#1E293B' }}>{a.title_en}</Link></td>
                  <td className="px-5 py-3.5"><span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize" style={{ background: '#F1F5F9', color: '#475569' }}>{a.programme || '—'}</span></td>
                  <td className="px-5 py-3.5"><span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: st.bg, color: st.color }}>{st.label}</span></td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: '#94A3B8' }}>{new Date(a.updated_at).toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait' })}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/content/${a.id}`} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" style={{ color: '#64748B' }} title="Edit"><Edit2 className="w-3.5 h-3.5" /></Link>
                      <form action={deleteArticle.bind(null, a.id)}>
                        <button className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" style={{ color: '#EF4444' }} title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      </form>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {articles.length === 0 && (
          <div className="py-16 text-center" style={{ color: '#94A3B8' }}>
            <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium" style={{ color: '#475569' }}>No articles yet</p>
            <p className="text-xs mt-1">Click “New article” to publish your first story.</p>
          </div>
        )}
      </div>
    </div>
  )
}
