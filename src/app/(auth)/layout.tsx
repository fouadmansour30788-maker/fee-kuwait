import Link from 'next/link'
import { Leaf } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #0A1F14 0%, #0F2B1C 50%, #0A1810 100%)' }}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-[0.18]"
          style={{ background: 'radial-gradient(circle, #40916C 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full opacity-[0.12]"
          style={{ background: 'radial-gradient(circle, #52B788 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #B7E4C7 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
      </div>

      {/* Minimal header */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #40916C, #52B788)' }}>
            <Leaf className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">FEE Kuwait</span>
        </Link>
        <Link href="/login" className="text-sm font-medium transition-colors hover:text-white"
          style={{ color: 'rgba(255,255,255,0.55)' }}>
          Already registered? <span className="text-[#74C69D] font-semibold">Sign in</span>
        </Link>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 flex items-start justify-center px-4 pb-16 pt-4">
        {children}
      </main>
    </div>
  )
}
