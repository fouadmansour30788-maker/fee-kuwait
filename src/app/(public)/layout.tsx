import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ChatWidget from '@/components/chat/ChatWidget'
import DemoBanner from '@/components/ui/DemoBanner'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && <DemoBanner />}
      <Navbar />
      <main>{children}</main>
      <Footer />
      <ChatWidget />
    </>
  )
}
