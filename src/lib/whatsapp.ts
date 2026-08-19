// Lightweight WhatsApp sender via the Meta Cloud API. Dormant by design: with no
// WHATSAPP_TOKEN / WHATSAPP_PHONE_ID configured it is a no-op, so wiring it in
// everywhere is safe. Non-throwing — a failed alert must never break its action.
//
// Production note: business-initiated WhatsApp messages must use a pre-approved
// message *template*. Set WHATSAPP_TEMPLATE to send a template (recommended);
// otherwise a plain text body is attempted (delivers only inside a 24-hour
// customer-service window). Numbers are normalised to E.164, defaulting to
// Kuwait (+965) for local 8-digit numbers.

export function normalisePhone(raw: string | null | undefined): string | null {
  if (!raw) return null
  let d = raw.replace(/[^\d+]/g, '')
  if (d.startsWith('+')) d = d.slice(1)
  d = d.replace(/\D/g, '')
  if (!d) return null
  if (d.length === 8) d = `965${d}`            // local Kuwait number
  if (d.startsWith('00')) d = d.slice(2)
  return d
}

export async function sendWhatsApp({ to, body }: { to: string | null | undefined; body: string }): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_ID
  const num = normalisePhone(to)
  if (!token || !phoneId || !num) return false

  const template = process.env.WHATSAPP_TEMPLATE
  const payload = template
    ? { messaging_product: 'whatsapp', to: num, type: 'template', template: { name: template, language: { code: 'en' }, components: [{ type: 'body', parameters: [{ type: 'text', text: body.slice(0, 600) }] }] } }
    : { messaging_product: 'whatsapp', to: num, type: 'text', text: { body: body.slice(0, 1000) } }

  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) { console.error('[whatsapp] send failed', res.status, await res.text().catch(() => '')); return false }
    return true
  } catch (err) {
    console.error('[whatsapp] send error', err)
    return false
  }
}
