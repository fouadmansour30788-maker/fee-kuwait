import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ApplicationDossier from '@/components/records/ApplicationDossier'
import PrintButton from '@/components/records/PrintButton'

export const dynamic = 'force-dynamic'

export default async function CbRecordsPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-4">
      <style>{`@media print { body * { visibility: hidden !important; } #dossier, #dossier * { visibility: visible !important; } #dossier { position: absolute; left: 0; top: 0; width: 100%; } .no-print { display: none !important; } }`}</style>
      <div className="no-print flex items-center justify-between">
        <Link href={`/cb/applications/${params.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: '#64748B' }}>
          <ArrowLeft className="w-4 h-4" /> Back to application
        </Link>
        <PrintButton />
      </div>
      <div className="bg-white rounded-2xl border p-8" style={{ borderColor: '#E2E8F0' }}>
        <ApplicationDossier id={params.id} />
      </div>
    </div>
  )
}
