import { redirect } from 'next/navigation'
import { Settings as SettingsIcon } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth-server'
import { getSiteSettings } from '@/lib/db/siteSettings'
import { listAllPartners } from '@/lib/db/sitePartners'
import ContactSettingsForm from '@/components/settings/ContactSettingsForm'
import PartnersManager from '@/components/settings/PartnersManager'

export const dynamic = 'force-dynamic'

export default async function SiteSettingsPage() {
  const me = await getCurrentUser()
  if (!me || !['admin', 'super_admin'].includes(me.role)) redirect('/dashboard')

  const [settings, partners] = await Promise.all([getSiteSettings(), listAllPartners()])

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#0F172A' }}>
          <SettingsIcon className="w-6 h-6" style={{ color: '#40916C' }} /> Site content
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Edit the public contact details and partner cards — changes go live immediately, no code needed.</p>
      </div>

      <ContactSettingsForm settings={settings} />
      <PartnersManager partners={partners} />
    </div>
  )
}
