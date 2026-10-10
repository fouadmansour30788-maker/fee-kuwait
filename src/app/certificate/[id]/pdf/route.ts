import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage } from 'pdf-lib'
import { getCertificate } from '@/lib/db/certificates'
import { siteUrl, qrDataUrl } from '@/lib/qr'
import { certAuthCode } from '@/lib/certAuth'
import { ES_OPERATOR_LINES, esValidity } from '../EcoSchoolsCertificate'
import type { CertificateDetail } from '@/lib/db/certificates'

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

// Standard PDF fonts only cover Latin text — drop anything they can't encode
// (e.g. Arabic) instead of failing the whole download.
function encodable(f: PDFFont, t: string): string {
  try { f.encodeText(t); return t } catch { return t.replace(/[^\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D]/g, '').trim() }
}

const pdfResponse = (bytes: Uint8Array, filename: string) => new NextResponse(Buffer.from(bytes), {
  headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${filename}"`, 'Cache-Control': 'no-store' },
})

// Eco-Schools "Green Flag Accredited" — the official A4 landscape artwork with
// the school name, validity dates and National Operator in the template's spots
// (same proportions as the on-screen certificate in EcoSchoolsCertificate.tsx).
async function ecoSchoolsPdf(cert: CertificateDetail, origin: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([841.89, 595.28]) // A4 landscape
  const { width: W, height: H } = page.getSize()
  const top = (frac: number) => H * (1 - frac)  // template measures from the top
  const ink = rgb(0.11, 0.12, 0.114)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)

  const bg = await fetchImage(doc, `${origin}/cert/es-green-flag.jpg`, 'jpg')
  if (bg) page.drawImage(bg, { x: 0, y: 0, width: W, height: H })

  // School name — centred on the line under the header; wraps upwards, shrinks if long.
  const name = encodable(bold, (cert.holder ?? '—').toUpperCase())
  const maxW = W * 0.724
  let size = W * 0.025
  let lines = wrap(name, bold, size, maxW)
  while (lines.length > 2 && size > 12) { size -= 1; lines = wrap(name, bold, size, maxW) }
  let y = top(0.376)
  for (const line of [...lines].reverse()) {
    page.drawText(line, { x: W * 0.501 - bold.widthOfTextAtSize(line, size) / 2, y, size, font: bold, color: ink })
    y += size * 1.15
  }

  // Dates — under "Valid for:"
  const dates = esValidity(cert.issued_at, cert.expires_at)
  const dSize = W * 0.017
  page.drawText(dates, { x: W / 2 - font.widthOfTextAtSize(dates, dSize) / 2, y: top(0.606) - dSize * 0.9, size: dSize, font, color: ink })

  // National Operator — right-aligned under the right signature line
  const oSize = W * 0.0162
  ES_OPERATOR_LINES.forEach((l, i) => {
    page.drawText(l, { x: W * 0.946 - font.widthOfTextAtSize(l, oSize), y: top(0.772) - oSize * 0.9 - i * oSize * 1.45, size: oSize, font, color: ink })
  })

  // Verify QR + certificate number (top-right, under the header)
  const qrSize = W * 0.074
  const qrX = W * (1 - 0.026) - qrSize
  const qrTop = top(0.24)
  try {
    const qr = await doc.embedPng(await qrDataUrl(`${siteUrl()}/verify/${encodeURIComponent(cert.certificate_number)}`))
    page.drawImage(qr, { x: qrX, y: qrTop - qrSize, width: qrSize, height: qrSize })
  } catch { /* QR is a convenience — the certificate is still valid without it */ }
  const muted = rgb(0.39, 0.45, 0.55)
  const small = W * 0.0062
  const caption = ['Scan to verify', cert.certificate_number]
  caption.forEach((t, i) => {
    page.drawText(t, { x: qrX + qrSize / 2 - font.widthOfTextAtSize(t, small) / 2, y: qrTop - qrSize - small * 1.4 * (i + 1), size: small, font, color: muted })
  })
  return doc.save()
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const cert = await getCertificate(params.id)
  if (!cert) return new NextResponse('Not found', { status: 404 })

  if (cert.programme === 'eco-schools') {
    const bytes = await ecoSchoolsPdf(cert, req.nextUrl.origin)
    return pdfResponse(bytes, `EcoSchools-GreenFlag-Certificate-${cert.certificate_number.replace(/[^\w-]/g, '_')}.pdf`)
  }

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
