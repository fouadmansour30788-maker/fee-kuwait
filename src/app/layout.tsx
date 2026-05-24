import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Cairo } from 'next/font/google'
import './globals.css'
import Providers from '@/components/ui/Providers'

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
    template: '%s | FEE Kuwait',
    default: 'FEE Kuwait — Foundation for Environmental Education',
  },
  description:
    'FEE Kuwait is the national operator of FEE International in Kuwait, running 6 environmental education and certification programmes: Eco-Schools, Blue Flag, Green Key, LEAF, YRE, and Eco-Campus.',
  keywords: ['FEE Kuwait', 'environmental education', 'Eco-Schools', 'Blue Flag', 'Green Key', 'sustainability', 'Kuwait'],
  openGraph: {
    title: 'FEE Kuwait — Building a Sustainable Future',
    description: 'International environmental certification programmes in Kuwait.',
    url: 'https://feekuwait.org',
    siteName: 'FEE Kuwait',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'FEE Kuwait' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FEE Kuwait',
    description: 'Environmental excellence in Kuwait.',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${cairo.variable}`}>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
