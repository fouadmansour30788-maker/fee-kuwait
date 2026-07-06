import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ArticleForm from '../ArticleForm'

export default function NewArticlePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <Link href="/content" className="inline-flex items-center gap-1.5 text-sm font-medium mb-3" style={{ color: '#64748B' }}>
          <ArrowLeft className="w-4 h-4" /> Content
        </Link>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>New article</h1>
      </div>
      <ArticleForm article={null} />
    </div>
  )
}
