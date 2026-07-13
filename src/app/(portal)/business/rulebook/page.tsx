import { redirect } from 'next/navigation'

// The rulebook has been retired — criteria descriptions now live inside the
// application's criteria board.
export default function RulebookPage() {
  redirect('/business/application')
}
