import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage } from 'pdf-lib'
import { getCertificate } from '@/lib/db/certificates'
import { siteUrl } from '@/lib/qr'
import { certAuthCode } from '@/lib/certAuth'

export const dynamic = 'force-dynamic'

const GREEN = rgb(0, 0.663, 0.365)
const INK = rgb(0.102, 0.137, 0.094)
const GRvALUE = rgb(0.29, 0.33, 0.39)
const fmtIssued = (d: string) => new Date(d).toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait', day: '2-digit', month: 'long', year: 'numeric' })
const validMonth = (d: string | null) => (d ? new Date(d).toLocaleDateString('en-GB', { timeZone: 'Asia/Kuwait', month: 'long' }).toUpperCase() : '—')
const validYear = (d: string | null) => (d ? String(new Date(d).getFullYear()) : '')

const DESCRIPTION = 'The Green Key certificate is a leading standard for excellence in the field of environmental responsibility and sustainable operation within the tourism industry. This prestigious certificate represents a commitment by businesses that their establishment adheres to the strict criteria set by the Foundation for Environmental Education and highlights the establishments’ efforts to develop a sustainable and responsible business.'

async function fetchImage(doc: PDFDocument, url: string, kind: 'png' | 'jpg'): Promise<PDFImage | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buf = new Uint8Array(await res.arrayBuffer())
    return kind === 'png' ? await doc.embedPng(buf) : await doc.embedJpg(buf)
  } catch { return null }
}

// Word-wrap a paragraph to a max width, returning lines.
function wrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (font.widthOfTextAtSize(test, size) > maxW && line) { lines.push(line); line = w }
    else line = test
  }
  if (line) lines.push(line)
  return lines
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const cert = await getCertificate(params.id)
  if (!cert) return new NextResponse('Not found', { status: 404 })

  const doc = await PDFDocument.create()
  const page = doc.addPage([595.28, 841.89]) // A4 portrait
  const { width: W, height: H } = page.getSize()
  const cx = W / 2

  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique)
  const boldItalic = await doc.embedFont(StandardFonts.HelveticaBoldOblique)

  const base = siteUrl()
  const [fee, gk, academics] = await Promise.all([
    fetchImage(doc, `${base}/cert/gk-image2.jpeg`, 'jpg'),
    fetchImage(doc, `${base}/cert/gk-image1.png`, 'png'),
    fetchImage(doc, `${base}/cert/academics-logo.png`, 'png'),
  ])

  const center = (text: string, y: number, f: PDFFont, size: number, color = INK) =>
    page.drawText(text, { x: cx - f.widthOfTextAtSize(text, size) / 2, y, size, font: f, color })

  const M = 34
  // Green frame
  page.drawRectangle({ x: M / 2, y: M / 2, width: W - M, height: H - M, borderColor: GREEN, borderWidth: 1 })

  // FEE logo top-left + ID line
  if (fee) { const w = 40, h = w * (fee.height / fee.width); page.drawImage(fee, { x: M, y: H - M - h, width: w, height: h }) }
  center(`ID number ${cert.certificate_number}. Certificate issued ${fmtIssued(cert.issued_at)}.`, H - M - 16, font, 10, GRvALUE)

  // Green Key logo centred
  let y = H - M - 40
  if (gk) { const w = 120, h = w * (gk.height / gk.width); page.drawImage(gk, { x: cx - w / 2, y: y - h, width: w, height: h }); y -= h + 24 }
  else y -= 40

  center('CERTIFIED ESTABLISHMENT', y, font, 30, GREEN); y -= 40
  center(cert.holder ?? '—', y, boldItalic, 24); y -= 26
  const address = [cert.address, cert.governorate].filter(Boolean).join(', ') || '—'
  center(address, y, italic, 17, GRvALUE); y -= 42

  center(`VALID UNTIL THE END OF ${validMonth(cert.expires_at)}`, y, font, 17, GREEN); y -= 44
  center(validYear(cert.expires_at), y, font, 46, GREEN); y -= 44

  // Description (wrapped, centred)
  for (const line of wrap(DESCRIPTION, font, 11, W - 150)) { center(line, y, font, 11, GRvALUE); y -= 16 }

  // Bottom operator block
  const bottomY = M + 74
  if (academics) { const w = 110, h = w * (academics.height / academics.width); page.drawImage(academics, { x: M + 6, y: bottomY - h + 20, width: w, height: h }) }
  const opX = M + 6 + 122
  page.drawText('National Green Key Operator', { x: opX, y: bottomY + 10, size: 10, font, color: GRvALUE })
  page.drawText('Kuwait', { x: opX, y: bottomY - 4, size: 10, font, color: GRvALUE })

  // Signature (right)
  const sigRight = W - M - 6
  const sigW = 170
  page.drawLine({ start: { x: sigRight - sigW, y: bottomY + 26 }, end: { x: sigRight, y: bottomY + 26 }, thickness: 0.7, color: rgb(0.63, 0.68, 0.75) })
  const rt = (t: string, yy: number, f: PDFFont, s: number) => page.drawText(t, { x: sigRight - f.widthOfTextAtSize(t, s), y: yy, size: s, font: f, color: INK })
  rt('Signature', bottomY + 14, bold, 10)
  rt('academics', bottomY, bold, 10)
  rt('National Green Key operator', bottomY - 14, bold, 10)

  // Footer + authenticity code
  center('www.greenkey.global', M + 22, font, 11, GRvALUE)
  const authCode = certAuthCode({ number: cert.certificate_number, holder: cert.holder, issuedAt: cert.issued_at, expiresAt: cert.expires_at })
  const authText = `Authenticity code ${authCode}`
  page.drawText(authText, { x: W - M - 6 - font.widthOfTextAtSize(authText, 8), y: M + 8, size: 8, font, color: rgb(0.58, 0.64, 0.72) })

  const bytes = await doc.save()
  const safe = cert.certificate_number.replace(/[^\w-]/g, '_')
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="GreenKey-Certificate-${safe}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
