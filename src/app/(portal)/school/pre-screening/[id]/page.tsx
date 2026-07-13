import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ClipboardCheck } from 'lucide-react'
import { getApplication, PROGRAMME_LABEL } from '@/lib/db/applications'
import { getPreScreening } from '@/lib/db/preScreening'
import PreScreeningForm from '@/components/prescreening/PreScreeningForm'

export default async function SchoolPreScreening({ params }: { params: { id: string } }) {
  const app = await getApplication(params.id)
  if (!app) notFound()
  const ps = await getPreScreening(params.id)
  const locked = !!ps && ps.status !== 'draft'

  return (
    <div className="space-y-5">
      <div>
        <Link href={`/school/application/${params.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium mb-4" style={{ color: '#5B7568' }}>
          <ArrowLeft className="w-4 h-4" /> Back to application
        </Link>
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#D4E7DA' }}>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" style={{ color: '#40916C' }} />
            <h1 className="text-xl font-bold" style={{ color: '#0F2318' }}>Pre-screening — {PROGRAMME_LABEL[app.programme] ?? app.programme}</h1>
          </div>
          <p className="text-sm mt-1" style={{ color: '#5B7568' }}>
            A mandatory eligibility survey. Your answers determine whether you can apply, your Green Key category, and which criteria apply. The National Operator confirms the result.
          </p>
        </div>
      </div>

      <PreScreeningForm applicationId={params.id} initialAnswers={ps?.answers ?? {}} locked={locked} homeHref={`/school/application/${params.id}`} />
    </div>
  )
}
