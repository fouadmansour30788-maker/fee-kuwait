'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

// Counts a figure like '9,000+', '5,274' or '100+' up from 0 when it scrolls
// into view, keeping its thousands separators and any prefix/suffix.
export default function CountUp({ value, duration = 1.6, className, style }: { value: string; duration?: number; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduce = useReducedMotion()
  const m = value.match(/^(\D*)([\d,]+(?:\.\d+)?)(.*)$/)
  const target = m ? parseFloat(m[2].replace(/,/g, '')) : NaN
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView || Number.isNaN(target)) return
    if (reduce) { setN(target); return }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / (duration * 1000))
      setN(target * (1 - Math.pow(1 - p, 3))) // ease-out cubic
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, duration, reduce])

  if (!m || Number.isNaN(target)) return <span className={className} style={style}>{value}</span>
  const shown = m[2].includes(',') ? Math.round(n).toLocaleString('en-US') : String(Math.round(n))
  return <span ref={ref} className={className} style={style}>{m[1]}{shown}{m[3]}</span>
}
