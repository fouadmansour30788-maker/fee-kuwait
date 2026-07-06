import { notFound } from 'next/navigation'
import { getArticleBySlug } from '@/lib/db/news'
import ArticleView from './ArticleView'

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug)
  if (!article || article.status !== 'published') notFound()
  return <ArticleView article={article} />
}
