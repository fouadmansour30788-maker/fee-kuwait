import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { getArticle } from '@/lib/db/news'
import { deleteArticle } from '@/lib/actions/news'
import ArticleForm from '../ArticleForm'

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id)
  if (!article) notFound()

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link href="/content" className="inline-flex items-center gap-1.5 text-sm font-medium mb-3" style={{ color: '#64748B' }}>
            <ArrowLeft className="w-4 h-4" /> Content
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Edit article</h1>
        </div>
        <form action={deleteArticle.bind(null, article.id)}>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}>
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </form>
      </div>
      <ArticleForm article={article} />
    </div>
  )
}
