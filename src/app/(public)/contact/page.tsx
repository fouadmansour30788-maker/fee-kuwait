'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react'
import { useLang } from '@/context/LangContext'

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }}>
      {children}
    </motion.div>
  )
}

const CONTACT_INFO = [
  {
    icon: Mail,
    label_en: 'Email',
    label_ar: 'البريد الإلكتروني',
    value: 'info@feekuwait.org',
    color: '#52B788',
  },
  {
    icon: Phone,
    label_en: 'Phone',
    label_ar: 'الهاتف',
    value: '+965 2XXX XXXX',
    color: '#006994',
  },
  {
    icon: MapPin,
    label_en: 'Address',
    label_ar: 'العنوان',
    value_en: 'Kuwait City, State of Kuwait',
    value_ar: 'مدينة الكويت، دولة الكويت',
    color: '#C8A951',
  },
  {
    icon: Clock,
    label_en: 'Office Hours',
    label_ar: 'ساعات العمل',
    value_en: 'Sun–Thu: 8:00 AM – 4:00 PM',
    value_ar: 'الأحد–الخميس: 8:00 ص – 4:00 م',
    color: '#40916C',
  },
]

export default function ContactPage() {
  const { lang } = useLang()
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Demo: just show success state
    setSent(true)
  }

  return (
    <>
      {/* Hero */}
      <section className="section-forest py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(82,183,136,0.15),transparent_55%)] pointer-events-none" />
        <div className="container-fee relative z-10 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand/35 text-light text-[11px] font-semibold tracking-widest uppercase mb-7">
              <Mail className="w-3 h-3" />
              {lang === 'ar' ? 'تواصل معنا' : 'Get in Touch'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-5">
              {lang === 'ar'
                ? <><span className="text-light">نحن هنا</span><br />لمساعدتك</>
                : <>We&apos;re Here<br /><span className="text-light">to Help</span></>}
            </h1>
            <p className="text-white/55 text-lg leading-relaxed">
              {lang === 'ar'
                ? 'هل لديك سؤال حول برامجنا؟ هل تريد بدء رحلتك نحو الاعتماد البيئي؟ تواصل معنا.'
                : 'Have a question about our programmes? Want to start your certification journey? Reach out to our team.'}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-white py-20">
        <div className="container-fee">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* Contact Info */}
            <FadeIn>
              <h2 className="text-2xl font-bold text-forest mb-8">
                {lang === 'ar' ? 'معلومات التواصل' : 'Contact Information'}
              </h2>
              <div className="space-y-5 mb-10">
                {CONTACT_INFO.map((item, i) => {
                  const Icon = item.icon
                  const displayValue = 'value_en' in item
                    ? (lang === 'ar' ? item.value_ar : item.value_en)
                    : item.value
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray uppercase tracking-wider mb-0.5">
                          {lang === 'ar' ? item.label_ar : item.label_en}
                        </p>
                        <p className="text-charcoal text-sm font-medium">{displayValue}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* FAQ shortcuts */}
              <div className="card p-6">
                <h3 className="font-bold text-forest text-sm mb-4">
                  {lang === 'ar' ? 'أسئلة شائعة' : 'Quick FAQs'}
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      q_en: 'How long does certification take?',
                      q_ar: 'كم تستغرق عملية الاعتماد؟',
                      a_en: 'Typically 3–6 months depending on the programme.',
                      a_ar: 'عادةً من 3 إلى 6 أشهر حسب البرنامج.',
                    },
                    {
                      q_en: 'Is there a registration fee?',
                      q_ar: 'هل هناك رسوم تسجيل؟',
                      a_en: 'Yes — fees vary by programme and institution type.',
                      a_ar: 'نعم — تتفاوت الرسوم حسب البرنامج ونوع المؤسسة.',
                    },
                    {
                      q_en: 'How often is certification renewed?',
                      q_ar: 'كم مرة يتم تجديد الاعتماد؟',
                      a_en: 'Most certifications are renewed annually.',
                      a_ar: 'تُجدَّد معظم الشهادات سنوياً.',
                    },
                  ].map((faq, i) => (
                    <div key={i} className="border-b border-mint pb-3 last:border-0 last:pb-0">
                      <p className="text-charcoal text-sm font-semibold mb-1">{lang === 'ar' ? faq.q_ar : faq.q_en}</p>
                      <p className="text-gray text-xs leading-relaxed">{lang === 'ar' ? faq.a_ar : faq.a_en}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Contact Form */}
            <FadeIn delay={0.15}>
              {sent ? (
                <div className="card p-12 flex flex-col items-center justify-center text-center h-full">
                  <CheckCircle2 className="w-16 h-16 text-brand mb-6" />
                  <h3 className="text-2xl font-bold text-forest mb-3">
                    {lang === 'ar' ? 'تم إرسال رسالتك!' : 'Message Sent!'}
                  </h3>
                  <p className="text-gray text-sm leading-relaxed max-w-xs">
                    {lang === 'ar'
                      ? 'شكراً لتواصلك معنا. سيرد فريقنا خلال يوم عمل واحد.'
                      : 'Thank you for reaching out. Our team will respond within one business day.'}
                  </p>
                </div>
              ) : (
                <div className="card p-8">
                  <h2 className="text-2xl font-bold text-forest mb-6">
                    {lang === 'ar' ? 'أرسل رسالة' : 'Send a Message'}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">{lang === 'ar' ? 'الاسم' : 'Name'}</label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="input"
                          placeholder={lang === 'ar' ? 'اسمك الكامل' : 'Your full name'}
                        />
                      </div>
                      <div>
                        <label className="label">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="input"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label">{lang === 'ar' ? 'الموضوع' : 'Subject'}</label>
                      <select
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="input"
                        required
                      >
                        <option value="">{lang === 'ar' ? 'اختر موضوعاً' : 'Select a subject'}</option>
                        <option value="eco-schools">{lang === 'ar' ? 'المدارس البيئية' : 'Eco-Schools'}</option>
                        <option value="blue-flag">{lang === 'ar' ? 'العلم الأزرق' : 'Blue Flag'}</option>
                        <option value="green-key">{lang === 'ar' ? 'المفتاح الأخضر' : 'Green Key'}</option>
                        <option value="yre">{lang === 'ar' ? 'المراسلون الشباب للبيئة' : 'Young Reporters for the Environment'}</option>
                        <option value="eco-campus">{lang === 'ar' ? 'الحرم البيئي' : 'Eco-Campus'}</option>
                        <option value="general">{lang === 'ar' ? 'استفسار عام' : 'General Enquiry'}</option>
                        <option value="media">{lang === 'ar' ? 'الإعلام والصحافة' : 'Media & Press'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">{lang === 'ar' ? 'رسالتك' : 'Message'}</label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="input resize-none"
                        placeholder={lang === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                      />
                    </div>
                    <button type="submit" className="btn-primary w-full justify-center">
                      <Send className="w-4 h-4" />
                      {lang === 'ar' ? 'إرسال الرسالة' : 'Send Message'}
                    </button>
                  </form>
                </div>
              )}
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  )
}
