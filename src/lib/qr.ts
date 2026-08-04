import QRCode from 'qrcode'

// The public base URL for absolute links printed on certificates / QR codes.
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://fee-kuwait.vercel.app').replace(/\/$/, '')
}

// Server-side QR generation as a data URI to embed in an <img> (works in print/PDF).
export async function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { margin: 1, width: 260, color: { dark: '#1B4332', light: '#ffffff' } })
}
