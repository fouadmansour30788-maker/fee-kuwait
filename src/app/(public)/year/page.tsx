import { redirect } from 'next/navigation'

// /year → the current year's review.
export default function YearIndex() {
  redirect(`/year/${new Date().getFullYear()}`)
}
