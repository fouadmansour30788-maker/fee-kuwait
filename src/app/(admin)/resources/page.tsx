import Link from 'next/link'
import { LayoutDashboard, FileCheck, ClipboardList, Users, Award, FileBarChart, Newspaper, UserCog, BookOpen, Mail, ChevronRight } from 'lucide-react'
import CriteriaReference from '@/components/resources/CriteriaReference'
import MessageTemplates from '@/components/resources/MessageTemplates'
import BrandCard from '@/components/resources/BrandCard'

const LINKS = [
  { href: '/dashboard', label: 'Operations dashboard', desc: 'Live figures, trends & recommendations', Icon: LayoutDashboard, color: '#2563EB' },
  { href: '/applications', label: 'Applications', desc: 'Review and progress applications', Icon: FileCheck, color: '#0891B2' },
  { href: '/tracker', label: 'Tracker', desc: 'Every application with establishment + auditor', Icon: ClipboardList, color: '#7C3AED' },
  { href: '/members', label: 'Members', desc: 'Approve and manage registrations', Icon: Users, color: '#059669' },
  { href: '/certificates', label: 'Certificates', desc: 'Issued certificates & expiry', Icon: Award, color: '#C8A951' },
  { href: '/reports', label: 'Reports', desc: 'Analysis, breakdowns & CSV export', Icon: FileBarChart, color: '#2563EB' },
  { href: '/content', label: 'Content', desc: 'News & public site content', Icon: Newspaper, color: '#0891B2' },
  { href: '/staff', label: 'Team', desc: 'Roles & access', Icon: UserCog, color: '#7C3AED' },
]

export default function OperatorResourcesPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Resources &amp; tools</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Shortcuts, the criteria reference, brand assets and ready-to-send message templates.</p>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="bg-white rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${l.color}14` }}>
                <l.Icon className="w-4.5 h-4.5" style={{ color: l.color }} />
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: '#CBD5E1' }} />
            </div>
            <p className="text-sm font-bold" style={{ color: '#0F172A' }}>{l.label}</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>{l.desc}</p>
          </Link>
        ))}
      </div>

      <BrandCard note="Logos, brand guidelines and programme templates on SharePoint — sign in to open." />

      {/* Criteria reference */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4" style={{ color: '#1B4332' }} />
          <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Criteria reference</h2>
        </div>
        <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>Green Key &amp; Blue Flag indicators with descriptions and imperative/guideline tags.</p>
        <CriteriaReference />
      </div>

      {/* Message templates */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center gap-2 mb-1">
          <Mail className="w-4 h-4" style={{ color: '#2563EB' }} />
          <h2 className="text-base font-bold" style={{ color: '#0F172A' }}>Message templates</h2>
        </div>
        <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>Copy-ready notifications for common workflow steps.</p>
        <MessageTemplates />
      </div>
    </div>
  )
}
