import { createClient } from '@/lib/supabase/server'
import { DEFAULT_TESTIMONIALS, type Testimonial } from '@/lib/testimonials'

export type { Testimonial } from '@/lib/testimonials'
export { DEFAULT_TESTIMONIALS } from '@/lib/testimonials'

export async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = createClient()
  const { data } = await supabase.from('site_settings').select('testimonials').eq('id', 'default').maybeSingle()
  const raw = data?.testimonials
  return Array.isArray(raw) && raw.length ? (raw as Testimonial[]) : DEFAULT_TESTIMONIALS
}
