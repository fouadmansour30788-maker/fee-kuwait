import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ChatWidget from '@/components/chat/ChatWidget'
import SmoothScrollProvider from '@/components/ui/SmoothScrollProvider'
import ScrollProgressBar from '@/components/ui/ScrollProgressBar'
import { getSiteSettings } from '@/lib/db/siteSettings'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  return (
    <SmoothScrollProvider>
      <ScrollProgressBar />
      <Navbar />
      <main>{children}</main>
      <Footer settings={settings} />
      <ChatWidget />
    </SmoothScrollProvider>
  )
}
