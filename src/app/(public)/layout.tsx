import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ChatWidget from '@/components/chat/ChatWidget'
import SmoothScrollProvider from '@/components/ui/SmoothScrollProvider'
import ScrollProgressBar from '@/components/ui/ScrollProgressBar'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <ScrollProgressBar />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <ChatWidget />
    </SmoothScrollProvider>
  )
}
