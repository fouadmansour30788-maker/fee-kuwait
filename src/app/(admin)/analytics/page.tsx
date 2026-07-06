import { redirect } from 'next/navigation'

// Analytics has been merged into the Operations dashboard.
export default function AnalyticsPage() {
  redirect('/dashboard')
}
