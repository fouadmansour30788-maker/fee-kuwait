// Darken a #rrggbb colour by `amount` (0–1) — used for readable text/fills on
// light step colours (e.g. yellow) where white text would lack contrast.
export function darken(hex: string, amount = 0.3): string {
  const n = parseInt(hex.slice(1), 16)
  const ch = (shift: number) => Math.round(((n >> shift) & 255) * (1 - amount)).toString(16).padStart(2, '0')
  return `#${ch(16)}${ch(8)}${ch(0)}`
}
