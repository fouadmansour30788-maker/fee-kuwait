import { notFound } from 'next/navigation'
import { getYearInReview } from '@/lib/db/yearReview'
import YearStory from '@/components/year/YearStory'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { year: string } }) {
  const y = params.year
  return {
    title: `FEE Kuwait ${y} — Year in Review`,
    description: `A year of environmental certification in Kuwait with the Foundation for Environmental Education: new Green Key and programme certifications, milestones and reach across ${y}.`,
  }
}

export default async function YearInReviewPage({ params }: { params: { year: string } }) {
  const year = parseInt(params.year, 10)
  if (!Number.isInteger(year) || year < 2015 || year > 2100) notFound()
  const data = await getYearInReview(year)
  return <YearStory data={data} />
}
