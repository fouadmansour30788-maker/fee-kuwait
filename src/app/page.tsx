import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ChatWidget from '@/components/chat/ChatWidget'
import FallingLeaf from '@/components/ui/FallingLeaf'
import SmoothScrollProvider from '@/components/ui/SmoothScrollProvider'
import ScrollProgressBar from '@/components/ui/ScrollProgressBar'
import HeroSection from '@/components/sections/HeroSection'
import ImpactCounters from '@/components/sections/ImpactCounters'
import ProgrammeCards from '@/components/sections/ProgrammeCards'
import HowItWorks from '@/components/sections/HowItWorks'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import NewsSection from '@/components/sections/NewsSection'
import CtaSection from '@/components/sections/CtaSection'
import PartnersStrip from '@/components/sections/PartnersStrip'
import { listPublishedNews } from '@/lib/db/news'
import { getSiteSettings } from '@/lib/db/siteSettings'
import { listPublicPartners } from '@/lib/db/sitePartners'
import { getTestimonials } from '@/lib/db/testimonials'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FEE Kuwait — Foundation for Environmental Education',
  description: 'The national operator of FEE International in Kuwait — running Eco-Schools, Blue Flag, Green Key, LEAF, YRE, and Eco-Campus programmes.',
}

export default async function HomePage() {
  const [news, settings, localPartners, testimonials] = await Promise.all([
    listPublishedNews().then((n) => n.slice(0, 3)), getSiteSettings(), listPublicPartners(), getTestimonials(),
  ])
  return (
    <SmoothScrollProvider>
      <ScrollProgressBar />
      <Navbar />
      <FallingLeaf />
      <main>
        <HeroSection />
        <ImpactCounters />
        <ProgrammeCards />
        <HowItWorks />
        <TestimonialsSection testimonials={testimonials} />
        <NewsSection articles={news} />
        <CtaSection />
        <PartnersStrip localPartners={localPartners} />
      </main>
      <Footer settings={settings} />
      <ChatWidget />
    </SmoothScrollProvider>
  )
}
