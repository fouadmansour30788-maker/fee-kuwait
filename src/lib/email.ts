// Lightweight Resend wrapper. Uses the REST API directly (no SDK dependency).
// Non-throwing by design: a failed notification must never break the action that
// triggered it. Requires RESEND_API_KEY in the environment; EMAIL_FROM is optional
// (defaults to Resend's shared sandbox sender, which only delivers to the account
// owner until a domain is verified — set EMAIL_FROM once your domain is live).

type SendArgs = { to: string; subject: string; html: string }

export async function sendEmail({ to, subject, html }: SendArgs): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key || !to) return false
  const from = process.env.EMAIL_FROM || 'FEE Kuwait <onboarding@resend.dev>'

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html }),
    })
    if (!res.ok) {
      console.error('[email] send failed', res.status, await res.text().catch(() => ''))
      return false
    }
    return true
  } catch (err) {
    console.error('[email] send error', err)
    return false
  }
}

// Shared branded wrapper so every notification looks consistent.
function shell(title: string, body: string): string {
  return `
  <div style="margin:0;padding:24px;background:#F1F5F9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E2E8F0;">
      <div style="background:linear-gradient(135deg,#1B4332,#40916C);padding:20px 28px;">
        <span style="color:#ffffff;font-size:16px;font-weight:700;letter-spacing:.2px;">FEE Kuwait</span>
      </div>
      <div style="padding:28px;">
        <h1 style="margin:0 0 12px;font-size:18px;color:#0F172A;">${title}</h1>
        ${body}
      </div>
      <div style="padding:16px 28px;background:#F8FAFC;border-top:1px solid #EEF2F6;">
        <span style="font-size:12px;color:#94A3B8;">Foundation for Environmental Education — Kuwait</span>
      </div>
    </div>
  </div>`
}

// Compose the applicant-facing status-change email. Returns null when the status
// isn't one the applicant should be notified about.
export function applicationStatusEmail(opts: {
  programme: string
  status: string
  rejectionReason?: string | null
  certificateNumber?: string | null
  portalUrl?: string
}): { subject: string; html: string } | null {
  const { programme, status, rejectionReason, certificateNumber, portalUrl } = opts
  const cta = portalUrl
    ? `<div style="margin-top:20px;"><a href="${portalUrl}" style="display:inline-block;background:#1B4332;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 20px;border-radius:10px;">Open your portal</a></div>`
    : ''
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://fee-kuwait.vercel.app').replace(/\/$/, '')
  const certBtn = certificateNumber
    ? `<div style="margin-top:12px;"><a href="${base}/verify/${encodeURIComponent(certificateNumber)}" style="display:inline-block;background:#C8A951;color:#2A2410;text-decoration:none;font-size:14px;font-weight:700;padding:10px 20px;border-radius:10px;">Verify your certificate</a></div>`
    : ''

  if (status === 'approved') {
    return {
      subject: `Your ${programme} application has been approved 🎉`,
      html: shell(
        `${programme} — Approved`,
        `<p style="margin:0 0 12px;font-size:14px;color:#334155;line-height:1.6;">Congratulations! Your <strong>${programme}</strong> application has been approved.</p>
         ${certificateNumber ? `<p style="margin:0 0 12px;font-size:14px;color:#334155;line-height:1.6;">Your certificate <strong>${certificateNumber}</strong> is now available.</p>` : ''}
         ${certBtn}
         ${cta}`,
      ),
    }
  }
  if (status === 'rejected') {
    return {
      subject: `Update on your ${programme} application`,
      html: shell(
        `${programme} — Not approved`,
        `<p style="margin:0 0 12px;font-size:14px;color:#334155;line-height:1.6;">Your <strong>${programme}</strong> application was not approved at this time.</p>
         ${rejectionReason ? `<div style="margin:0 0 12px;padding:12px 14px;background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;font-size:14px;color:#991B1B;"><strong>Reason:</strong> ${rejectionReason}</div>` : ''}
         <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">You're welcome to address the points raised and re-apply.</p>
         ${cta}`,
      ),
    }
  }
  if (status === 'documents_pending') {
    return {
      subject: `Action needed on your ${programme} application`,
      html: shell(
        `${programme} — More documents needed`,
        `<p style="margin:0 0 12px;font-size:14px;color:#334155;line-height:1.6;">Your reviewer needs additional supporting documents for your <strong>${programme}</strong> application. Please sign in and upload the requested evidence.</p>
         ${cta}`,
      ),
    }
  }
  if (status === 'certified' || status === 'certified_rectification') {
    const rectified = status === 'certified_rectification'
    return {
      subject: `Certification decision: your ${programme} application`,
      html: shell(
        `${programme} — ${rectified ? 'Certified (subject to rectification)' : 'Certified'} 🎉`,
        `<p style="margin:0 0 12px;font-size:14px;color:#334155;line-height:1.6;">The Certification Body has <strong>certified</strong> your <strong>${programme}</strong> application${rectified ? ', subject to rectifying the points noted below' : ''}.</p>
         ${rejectionReason ? `<div style="margin:0 0 12px;padding:12px 14px;background:#FEF9EC;border:1px solid #FDE68A;border-radius:10px;font-size:14px;color:#854D0E;"><strong>Note from the Certification Body:</strong> ${rejectionReason}</div>` : ''}
         ${certificateNumber ? `<p style="margin:0 0 12px;font-size:14px;color:#334155;line-height:1.6;">Your certificate <strong>${certificateNumber}</strong> is now available.</p>` : ''}
         ${certBtn}
         ${cta}`,
      ),
    }
  }
  if (status === 'not_certified') {
    return {
      subject: `Certification decision: your ${programme} application`,
      html: shell(
        `${programme} — Not certified`,
        `<p style="margin:0 0 12px;font-size:14px;color:#334155;line-height:1.6;">After review, the Certification Body did <strong>not</strong> certify your <strong>${programme}</strong> application at this time.</p>
         ${rejectionReason ? `<div style="margin:0 0 12px;padding:12px 14px;background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;font-size:14px;color:#991B1B;"><strong>Reason:</strong> ${rejectionReason}</div>` : ''}
         <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">You're welcome to address the points raised and re-apply.</p>
         ${cta}`,
      ),
    }
  }
  if (status === 'under_review' || status === 'audit' || status === 'cb_review') {
    const label = status === 'audit' ? 'is now under audit'
      : status === 'cb_review' ? 'is now with the Certification Body' : 'is being reviewed'
    return {
      subject: `Your ${programme} application ${label}`,
      html: shell(
        `${programme} — In progress`,
        `<p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">Your <strong>${programme}</strong> application ${label}. We'll let you know as soon as there's an update.</p>
         ${cta}`,
      ),
    }
  }
  return null
}
