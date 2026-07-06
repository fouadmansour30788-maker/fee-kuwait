import { listPublishedNews } from '@/lib/db/news'
import NewsHero from './NewsHero'
import NewsList from './NewsList'

export default async function NewsPage() {
  const articles = await listPublishedNews()
  return (
    <>
      <NewsHero />
      <NewsList articles={articles} />
    </>
  )
}
