// Cloud-storage share links (Google Drive, OneDrive, SharePoint, Dropbox) open a
// viewer page, not the image itself, so they can't be used directly in <img>.
// Client-safe helpers to recognise them and build direct-download candidates.

export type ShareSource = 'Google Drive' | 'OneDrive' | 'SharePoint' | 'Dropbox'

export function shareSource(url: string): ShareSource | null {
  let host = ''
  try { host = new URL(url.trim()).hostname.toLowerCase() } catch { return null }
  if (host.endsWith('drive.google.com') || host.endsWith('docs.google.com')) return 'Google Drive'
  if (host === '1drv.ms' || host.endsWith('onedrive.live.com')) return 'OneDrive'
  if (host.endsWith('sharepoint.com')) return 'SharePoint'
  if (host.endsWith('dropbox.com')) return 'Dropbox'
  return null
}

// Direct-download URLs to try, best first.
export function directDownloadCandidates(url: string): string[] {
  const src = shareSource(url)
  const u = url.trim()
  if (src === 'Google Drive') {
    const id = u.match(/\/file\/d\/([^/?#]+)/)?.[1] ?? u.match(/[?&]id=([^&#]+)/)?.[1]
    return id ? [`https://drive.google.com/uc?export=download&id=${id}`, `https://lh3.googleusercontent.com/d/${id}`] : []
  }
  if (src === 'OneDrive') {
    // OneDrive "shares" API: u! + base64url(link) → the file content.
    const b64 = (typeof btoa === 'function' ? btoa(u) : Buffer.from(u).toString('base64')).replace(/=+$/, '').replace(/\//g, '_').replace(/\+/g, '-')
    return [`https://api.onedrive.com/v1.0/shares/u!${b64}/root/content`]
  }
  if (src === 'SharePoint') return [u.includes('?') ? `${u}&download=1` : `${u}?download=1`]
  if (src === 'Dropbox') {
    if (/[?&]dl=0/.test(u)) return [u.replace(/([?&])dl=0/, '$1raw=1')]
    return [/[?&](raw|dl)=/.test(u) ? u : `${u}${u.includes('?') ? '&' : '?'}raw=1`]
  }
  return []
}
