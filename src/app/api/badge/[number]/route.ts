import { NextRequest, NextResponse } from 'next/server'
import { getPublicCertificate } from '@/lib/db/certificates'

export const dynamic = 'force-dynamic'

// Embeddable SVG "Green Key Certified" badge for a certificate number. Sites
// embed it as <a href="…/verify/NUMBER"><img src="…/api/badge/NUMBER"></a>.
// Green when valid, muted grey when not, so it always reflects live status.
export async function GET(_req: NextRequest, { params }: { params: { number: string } }) {
  const number = decodeURIComponent(params.number)
  const cert = await getPublicCertificate(number)
  const valid = !!cert?.valid
  const year = cert?.expiresAt ? new Date(cert.expiresAt).getFullYear() : ''

  const green = '#00A95D', blue = '#009FE3', ink = '#0F2318', muted = '#94A3B8'
  const accent = valid ? green : muted
  const statusText = valid ? 'CERTIFIED' : 'NOT VALID'

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="220" viewBox="0 0 200 220" role="img" aria-label="Green Key ${statusText}">
  <defs><style>text{font-family:'Lato','Segoe UI',system-ui,Arial,sans-serif}</style></defs>
  <rect x="1" y="1" width="198" height="218" rx="16" fill="#ffffff" stroke="${accent}" stroke-width="2"/>
  <!-- Green Key mark -->
  <rect x="70" y="20" width="60" height="60" rx="6" fill="${valid ? blue : '#CBD5E1'}"/>
  <g fill="${valid ? green : '#94A3B8'}">
    <circle cx="88" cy="42" r="11" fill="none" stroke="${valid ? green : '#94A3B8'}" stroke-width="7"/>
    <rect x="92" y="46" width="34" height="7"/>
    <rect x="116" y="46" width="7" height="14"/>
    <rect x="105" y="46" width="6" height="11"/>
  </g>
  <text x="100" y="103" text-anchor="middle" font-size="19" font-weight="900" fill="${accent}">Green Key</text>
  <text x="100" y="127" text-anchor="middle" font-size="14" font-weight="700" letter-spacing="1.5" fill="${ink}">${statusText}</text>
  ${year ? `<text x="100" y="163" text-anchor="middle" font-size="34" font-weight="900" fill="${accent}">${year}</text>` : ''}
  <text x="100" y="196" text-anchor="middle" font-size="9" fill="${muted}">FEE Kuwait · verify online</text>
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
