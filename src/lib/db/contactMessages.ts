import { createClient } from '@/lib/supabase/server'

export interface ContactMessage {
  id: string
  name: string | null
  email: string | null
  subject: string | null
  message: string
  read: boolean
  created_at: string
}

// Staff: all contact-form submissions, newest first.
export async function listContactMessages(): Promise<ContactMessage[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('contact_messages')
    .select('id, name, email, subject, message, read, created_at')
    .order('created_at', { ascending: false })
  if (error) { console.error('listContactMessages:', error.message); return [] }
  return (data ?? []) as ContactMessage[]
}
