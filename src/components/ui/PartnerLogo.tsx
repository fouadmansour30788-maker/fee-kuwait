'use client'

import { useState } from 'react'

interface PartnerLogoProps {
  src: string
  name: string
  initials: string
  color: string
  className?: string
}

export default function PartnerLogo({ src, name, initials, color, className = '' }: PartnerLogoProps) {
  const [failed, setFailed] = useState(false)

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center font-bold text-sm rounded-xl ${className}`}
        style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}
        title={name}
      >
        {initials}
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      className={`object-contain ${className}`}
      onError={() => setFailed(true)}
    />
  )
}
