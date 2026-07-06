'use client'

import { motion } from 'framer-motion'
import { useLang } from '@/context/LangContext'

export default function NewsHero() {
  const { lang } = useLang()
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #0F2318 0%, #1B4332 100%)' }} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[350px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, #52B788 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>
      <div className="container-fee relative z-10 text-center max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase mb-7"
            style={{ border: '1px solid rgba(82,183,136,0.3)', color: 'rgba(116,198,157,0.85)', background: 'rgba(82,183,136,0.08)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#74C69D] animate-pulse" />
            {lang === 'ar' ? 'مركز الإعلام' : 'Media Centre'}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-5">
            {lang === 'ar'
              ? <>أحدث الأخبار<br /><span style={{ color: '#74C69D' }}>والتقارير</span></>
              : <>News &amp;<br /><span style={{ color: '#74C69D' }}>Stories</span></>}
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {lang === 'ar'
              ? 'آخر المستجدات والقصص من مجتمعنا من صانعي التغيير البيئي في الكويت.'
              : 'The latest updates and stories from our community of environmental changemakers across Kuwait.'}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
