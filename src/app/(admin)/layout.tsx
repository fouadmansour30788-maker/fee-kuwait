import type { Metadata } from 'next'
import Shell from './Shell'

// Platform area — branded "Eco Flow Portal" (the public website stays "FEE Kuwait").
export const metadata: Metadata = { title: { template: '%s | Eco Flow Portal', default: 'Eco Flow Portal' } }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>
}
