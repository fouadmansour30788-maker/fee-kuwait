import { Inbox as InboxIcon } from 'lucide-react'
import { listContactMessages } from '@/lib/db/contactMessages'
import ContactMessageItem from '@/components/inbox/ContactMessageItem'

export const dynamic = 'force-dynamic'

export default async function InboxPage() {
  const messages = await listContactMessages()
  const unread = messages.filter((m) => !m.read).length

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#0F172A' }}>
          <InboxIcon className="w-6 h-6" style={{ color: '#40916C' }} /> Inbox
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
          Messages from the website contact form.{unread > 0 ? ` ${unread} unread.` : ''}
        </p>
      </div>

      {messages.length > 0 ? (
        <div className="space-y-2.5">
          {messages.map((m) => <ContactMessageItem key={m.id} m={m} />)}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border py-14 text-center" style={{ borderColor: '#E2E8F0', color: '#94A3B8' }}>
          <InboxIcon className="w-9 h-9 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium" style={{ color: '#475569' }}>No messages yet</p>
          <p className="text-xs mt-0.5">Submissions from the public contact form will appear here.</p>
        </div>
      )}
    </div>
  )
}
