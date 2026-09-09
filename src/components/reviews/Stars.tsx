import { Star } from 'lucide-react'

// Read-only star rating display (supports halves via fill width).
export default function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i))
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className="absolute inset-0" style={{ width: size, height: size, color: '#E2E8F0' }} fill="#E2E8F0" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star style={{ width: size, height: size, color: '#F59E0B' }} fill="#F59E0B" />
            </span>
          </span>
        )
      })}
    </span>
  )
}
