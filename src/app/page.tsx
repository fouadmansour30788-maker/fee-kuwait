import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ChatWidget from '@/components/chat/ChatWidget'
import DemoBanner from '@/components/ui/DemoBanner'
import HeroSection from '@/components/sections/HeroSection'
import ImpactCounters from '@/components/sections/ImpactCounters'
import ProgrammeCards from '@/components/sections/ProgrammeCards'
import HowItWorks from '@/components/sections/HowItWorks'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import NewsSection from '@/components/sections/NewsSection'
import CtaSection from '@/components/sections/CtaSection'
import PartnersStrip from '@/components/sections/PartnersStrip'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FEE Kuwait — Foundation for Environmental Education',
  description: 'The national operator of FEE International in Kuwait — running Eco-Schools, Blue Flag, Green Key, LEAF, YRE, and Eco-Campus programmes.',
}

export default function HomePage() {
  return (
    <>
      {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && <DemoBanner />}
      <Navbar />
      <main>
        <HeroSection />
        <ImpactCounters />
        <ProgrammeCards />
        <HowItWorks />
        <TestimonialsSection />
        <NewsSection />
        <CtaSection />
        <PartnersStrip />
      </main>
      <Footer />
      <ChatWidget />
    </>
  )
}
