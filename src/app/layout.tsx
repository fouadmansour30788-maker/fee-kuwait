import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Cairo } from 'next/font/google'
import { cookies } from 'next/headers'
import './globals.css'
import Providers from '@/components/ui/Providers'
import type { Lang } from '@/i18n'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | Eco Flow Portal',
    default: 'Eco Flow Portal — Foundation for Environmental Education',
  },
  description:
    'Eco Flow Portal is the certification platform for the Foundation for Environmental Education programmes in Kuwait: Eco-Schools, Blue Flag, Green Key, LEAF, YRE, and Eco-Campus.',
  keywords: ['Eco Flow Portal', 'Eco Flow Portal', 'environmental education', 'Eco-Schools', 'Blue Flag', 'Green Key', 'sustainability', 'Kuwait'],
  openGraph: {
    title: 'Eco Flow Portal — Building a Sustainable Future',
    description: 'International environmental certification programmes in Kuwait.',
    url: 'https://feekuwait.org',
    siteName: 'Eco Flow Portal',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Eco Flow Portal' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eco Flow Portal',
    description: 'Environmental excellence in Kuwait.',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = (cookies().get('lang')?.value === 'ar' ? 'ar' : 'en') as Lang
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  return (
    <html lang={lang} dir={dir} className={`${jakarta.variable} ${cairo.variable}`}>
      <body className="antialiased" style={lang === 'ar' ? { fontFamily: 'var(--font-cairo)' } : undefined}>
        <Providers initialLang={lang}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
