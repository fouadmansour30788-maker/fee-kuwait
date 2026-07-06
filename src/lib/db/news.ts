import { createClient } from '@/lib/supabase/server'

export interface Article {
  id: string
  slug: string
  title_en: string
  title_ar: string | null
  excerpt_en: string | null
  excerpt_ar: string | null
  body_en: string | null
  body_ar: string | null
  image_url: string | null
  programme: string | null
  status: string
  published_at: string | null
  updated_at: string
}

const COLS = 'id, slug, title_en, title_ar, excerpt_en, excerpt_ar, body_en, body_ar, image_url, programme, status, published_at, updated_at'

// Operator: every article (staff RLS).
export async function listAllNews(): Promise<Article[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('news_articles').select(COLS).order('updated_at', { ascending: false })
  if (error) { console.error('listAllNews:', error.message); return [] }
  return (data ?? []) as Article[]
}

// Public: published articles only (works for anonymous visitors via RLS).
export async function listPublishedNews(): Promise<Article[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('news_articles').select(COLS).eq('status', 'published').order('published_at', { ascending: false })
  if (error) { console.error('listPublishedNews:', error.message); return [] }
  return (data ?? []) as Article[]
}

export async function getArticle(id: string): Promise<Article | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from('news_articles').select(COLS).eq('id', id).single()
  if (error) { console.error('getArticle:', error.message); return null }
  return data as Article
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from('news_articles').select(COLS).eq('slug', slug).single()
  if (error) return null
  return data as Article
}

export const NEWS_STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label: 'Draft',     color: '#64748B', bg: '#F1F5F9' },
  published: { label: 'Published', color: '#059669', bg: '#D1FAE5' },
  scheduled: { label: 'Scheduled', color: '#7C3AED', bg: '#EDE9FE' },
}
