import { createHmac } from 'crypto'

// Tamper-evident authenticity code for a certificate. It is an HMAC over the
// certificate's canonical fields keyed by a server secret, so a forged or altered
// certificate (e.g. a changed establishment name or date) cannot reproduce the
// code — while the live verification page, reading the true record from the
// database, always shows the correct one. Displayed as two 4-char groups.
//
// Set CERT_SIGNING_SECRET in the environment. If it's absent we fall back to a
// build constant so the feature still renders in dev — set the real secret in
// production for genuine tamper resistance.
const SECRET = process.env.CERT_SIGNING_SECRET || 'fee-kuwait-dev-signing-secret'

export interface CertAuthFields {
  number: string
  holder: string | null
  issuedAt: string
  expiresAt: string | null
}

export function certAuthCode(f: CertAuthFields): string {
  const canonical = [f.number, (f.holder ?? '').trim().toLowerCase(), f.issuedAt, f.expiresAt ?? ''].join('|')
  const hex = createHmac('sha256', SECRET).update(canonical).digest('hex').toUpperCase()
  // Base32-ish from hex → 8 readable chars, grouped 4-4.
  const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
  let code = ''
  for (let i = 0; i < 8; i++) code += alphabet[parseInt(hex.slice(i * 2, i * 2 + 2), 16) % 32]
  return `${code.slice(0, 4)}-${code.slice(4)}`
}
