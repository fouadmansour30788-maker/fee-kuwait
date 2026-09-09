'use server'

import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import { revalidatePath } from 'next/cache'

const SUBJECT_LABEL: Record<string, string> = {
  'eco-schools': 'Eco-Schools', 'blue-flag': 'Blue Flag', 'green-key': 'Green Key',
  yre: 'Young Reporters for the Environment', 'eco-campus': 'Eco-Campus',
  general: 'General Enquiry', media: 'Media & Press',
}

// Public: a visitor submits the contact form. Saves to the back-office inbox and
// (best-effort) forwards a copy to the FEE Kuwait inbox address if email is set up.
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

  // Best-effort email forward — never blocks the submission.
  const to = process.env.CONTACT_INBOX_EMAIL || 'info@feebureaukw.org'
  const subjectLabel = subject ? (SUBJECT_LABEL[subject] ?? subject) : 'General'
  sendEmail({
    to,
    subject: `New contact message — ${subjectLabel}`,
    html: `<p style="margin:0 0 12px;color:#334155;">You have a new message from the website contact form.</p>
      <table style="font-size:14px;color:#334155;border-collapse:collapse;">
        <tr><td style="padding:4px 12px 4px 0;color:#94A3B8;">Name</td><td>${name ?? '—'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#94A3B8;">Email</td><td>${email}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#94A3B8;">Subject</td><td>${subjectLabel}</td></tr>
      </table>
      <p style="margin:14px 0 0;white-space:pre-wrap;color:#0F172A;">${message.replace(/</g, '&lt;')}</p>`,
  }).catch(() => {})

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
