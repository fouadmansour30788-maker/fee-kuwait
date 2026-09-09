'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Public: a visitor submits the contact form. Saves to the back-office inbox
// (the operator reads it under /inbox — no email forwarding).
export async function submitContactMessage(input: {
  name: string; email: string; subject: string; message: string
}): Promise<{ ok?: true; error?: string }> {
  const name = input.name?.trim() || null
  const email = input.email?.trim().toLowerCase() || ''
  const subject = input.subject?.trim() || null
  const message = input.message?.trim() || ''
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: 'Please enter a valid email address.' }
  if (!message) return { error: 'Please write a message.' }
  if (message.length > 5000) return { error: 'Message is too long.' }

  const supabase = createClient()
  const { error } = await supabase.from('contact_messages').insert({ name, email, subject, message })
  if (error) return { error: 'Could not send your message. Please try again.' }

  revalidatePath('/inbox')
  return { ok: true }
}

// Staff: mark a message read/unread.
export async function setContactMessageRead(id: string, read: boolean): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { error } = await supabase.from('contact_messages').update({ read }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/inbox')
  return { ok: true }
}

// Staff: delete a message.
export async function deleteContactMessage(id: string): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }
  const { error } = await supabase.from('contact_messages').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/inbox')
  return { ok: true }
}
