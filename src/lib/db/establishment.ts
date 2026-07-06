import { createClient } from '@/lib/supabase/server'

export interface MyApp {
  id: string
  programme: string
  status: string
  submitted_at: string
  review_deadline: string | null
}

export interface MyEntity { entityType: 'school' | 'business'; entityId: string; name: string }

// The signed-in user's school or establishment record (RLS: owner sees own).
export async function myEntity(): Promise<MyEntity | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: biz } = await supabase.from('businesses').select('id, name_en').eq('user_id', user.id).maybeSingle()
  if (biz) return { entityType: 'business', entityId: biz.id, name: biz.name_en }
  const { data: sch } = await supabase.from('schools').select('id, name_en').eq('user_id', user.id).maybeSingle()
  if (sch) return { entityType: 'school', entityId: sch.id, name: sch.name_en }
  return null
}

// The signed-in applicant's own applications (RLS filters to applicant_id = them).
export async function myApplications(): Promise<MyApp[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('applications')
    .select('id, programme, status, submitted_at, review_deadline')
    .order('submitted_at', { ascending: false })
  if (error) { console.error('myApplications:', error.message); return [] }
  return (data ?? []) as MyApp[]
}
