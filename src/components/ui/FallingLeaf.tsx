'use client'

import { useScroll, useTransform, motion } from 'framer-motion'

function RealisticLeaf() {
  return (
    <svg
      viewBox="0 0 56 96"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.35))' }}
    >
      <defs>
        {/* Main body gradient: dark forest → mid green → lighter tip */}
        <linearGradient id="flBodyGrad" x1="0.2" y1="1" x2="0.8" y2="0">
          <stop offset="0%"  stopColor="#182019" />
          <stop offset="38%" stopColor="#2C3A2D" />
          <stop offset="72%" stopColor="#7B8266" />
          <stop offset="100%" stopColor="#8B9B88" />
        </linearGradient>

        {/* Shine: semi-transparent white highlight on the left lobe */}
        <linearGradient id="flShineGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Darker underside tint on right edge */}
        <linearGradient id="flEdgeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"  stopColor="#182019" stopOpacity="0" />
          <stop offset="100%" stopColor="#182019" stopOpacity="0.18" />
        </linearGradient>

        <clipPath id="flClip">
          <path d="M28 92 C22 80, 3 64, 3 41 C3 17, 13 2, 28 2 C43 2, 53 17, 53 41 C53 64, 34 80, 28 92Z" />
        </clipPath>
      </defs>

      {/* ── Main leaf body ── */}
      <path
        d="M28 92 C22 80, 3 64, 3 41 C3 17, 13 2, 28 2 C43 2, 53 17, 53 41 C53 64, 34 80, 28 92Z"
        fill="url(#flBodyGrad)"
      />

      {/* ── Edge darkening (gives volume) ── */}
      <path
        d="M28 92 C22 80, 3 64, 3 41 C3 17, 13 2, 28 2 C43 2, 53 17, 53 41 C53 64, 34 80, 28 92Z"
        fill="url(#flEdgeGrad)"
      />

      {/* ── Shine highlight (left upper lobe) ── */}
      <path
        d="M28 92 C22 80, 3 64, 3 41 C3 17, 13 2, 28 2 C34 2, 37 8, 33 18 C29 28, 24 44, 28 92Z"
        fill="url(#flShineGrad)"
        clipPath="url(#flClip)"
      />

      {/* ── Veins ── */}
      {/* Center midrib */}
      <path d="M28 90 Q28 55 28 4" stroke="#2C3A2D" strokeWidth="0.9" fill="none" opacity="0.65" strokeLinecap="round"/>

      {/* Left lateral veins */}
      <path d="M28 76 Q19 68 11 62" stroke="#2C3A2D" strokeWidth="0.55" fill="none" opacity="0.55" strokeLinecap="round"/>
      <path d="M28 63 Q17 55 8  49" stroke="#2C3A2D" strokeWidth="0.55" fill="none" opacity="0.55" strokeLinecap="round"/>
      <path d="M28 50 Q19 42 11 37" stroke="#2C3A2D" strokeWidth="0.55" fill="none" opacity="0.55" strokeLinecap="round"/>
      <path d="M28 37 Q21 30 14 25" stroke="#2C3A2D" strokeWidth="0.5"  fill="none" opacity="0.5"  strokeLinecap="round"/>
      <path d="M28 25 Q23 19 17 14" stroke="#2C3A2D" strokeWidth="0.45" fill="none" opacity="0.45" strokeLinecap="round"/>
      <path d="M28 14 Q25  9 21  6" stroke="#2C3A2D" strokeWidth="0.38" fill="none" opacity="0.38" strokeLinecap="round"/>

      {/* Right lateral veins */}
      <path d="M28 76 Q37 68 45 62" stroke="#2C3A2D" strokeWidth="0.55" fill="none" opacity="0.55" strokeLinecap="round"/>
      <path d="M28 63 Q39 55 48 49" stroke="#2C3A2D" strokeWidth="0.55" fill="none" opacity="0.55" strokeLinecap="round"/>
      <path d="M28 50 Q37 42 45 37" stroke="#2C3A2D" strokeWidth="0.55" fill="none" opacity="0.55" strokeLinecap="round"/>
      <path d="M28 37 Q35 30 42 25" stroke="#2C3A2D" strokeWidth="0.5"  fill="none" opacity="0.5"  strokeLinecap="round"/>
      <path d="M28 25 Q33 19 39 14" stroke="#2C3A2D" strokeWidth="0.45" fill="none" opacity="0.45" strokeLinecap="round"/>
      <path d="M28 14 Q31  9 35  6" stroke="#2C3A2D" strokeWidth="0.38" fill="none" opacity="0.38" strokeLinecap="round"/>

      {/* ── Stem ── */}
      <path d="M28 92 Q27 95 27 96" stroke="#2C3A2D" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

export default function FallingLeaf() {
  const { scrollYProgress } = useScroll()

  // Falls 60 vh as you scroll from top to bottom of page
  const y = useTransform(scrollYProgress, [0, 1], ['0vh', '62vh'])

  // Wind sway — realistic irregular drift left/right
  const x = useTransform(
    scrollYProgress,
    [0, 0.10, 0.24, 0.38, 0.52, 0.66, 0.80, 0.92, 1],
    [0, 72, -48, 96, -18, 78, -42, 60, 10]
  )

  // Tumble: 2.5 full rotations through the full scroll
  const rotate = useTransform(scrollYProgress, [0, 1], [8, 908])

  // Fades in quickly, stays opaque, fades near the very bottom
  const opacity = useTransform(scrollYProgress, [0, 0.03, 0.86, 1], [0, 0.95, 0.95, 0])

  // Subtle size breath
  const scale = useTransform(scrollYProgress, [0, 0.45, 1], [1, 1.06, 0.9])

  return (
    <motion.div
      className="fixed pointer-events-none z-20"
      style={{
        top: '22vh',
        right: '19%',
        width: '48px',
        height: '82px',
        x,
        y,
        rotate,
        opacity,
        scale,
      }}
    >
      {/* Independent micro-sway for natural wind feel */}
      <motion.div
        className="w-full h-full"
        animate={{
          rotate: [-6, 5, -4, 9, -5, 3, -6],
          y:      [-2, 2, -1, 3, -2, 1, -2],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <RealisticLeaf />
      </motion.div>
    </motion.div>
  )
}
