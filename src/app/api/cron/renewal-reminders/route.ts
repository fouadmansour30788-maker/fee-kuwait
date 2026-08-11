import { NextRequest, NextResponse } from 'next/server'
import { runRenewalReminders } from '@/lib/actions/renewals'

// Daily re-certification sweep. Vercel Cron calls this with
// `Authorization: Bearer <CRON_SECRET>`; we reject anything else so the endpoint
// can't be triggered by the public. Configure the schedule in vercel.json and set
// CRON_SECRET in the Vercel project env.
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await runRenewalReminders()
  return NextResponse.json({ ok: true, ...result })
}
