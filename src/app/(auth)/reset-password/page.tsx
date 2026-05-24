'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import { useLang } from '@/context/LangContext'

export default function ResetPasswordPage() {
  const { lang } = useLang()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email) {
      setError(lang === 'ar' ? 'يرجى إدخال بريدك الإلكتروني.' : 'Please enter your email address.')
      return
    }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      setError(lang === 'ar' ? 'بريد إلكتروني غير صالح.' : 'Please enter a valid email address.')
      return
    }

    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="w-full max-w-md mx-auto pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl font-bold text-white mb-2.5 tracking-tight">
          {lang === 'ar' ? 'استعادة كلمة المرور' : 'Reset Password'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)' }} className="text-sm">
          {lang === 'ar'
            ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.'
            : "Enter your email and we'll send you a reset link."}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}
      >
        <div
          className="rounded-3xl p-8 md:p-10"
          style={{ background: 'rgba(255,255,255,0.97)', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}
        >
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="text-center py-4"
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'rgba(82,183,136,0.12)', border: '2px solid rgba(82,183,136,0.35)' }}
                >
                  <CheckCircle2 className="w-10 h-10" style={{ color: '#52B788' }} />
                </div>
                <h2 className="text-xl font-bold text-forest mb-2">
                  {lang === 'ar' ? 'تحقق من بريدك!' : 'Check your inbox!'}
                </h2>
                <p className="text-sm leading-relaxed mb-6" style={{ color: '#5A6672' }}>
                  {lang === 'ar'
                    ? `أرسلنا رابط إعادة تعيين كلمة المرور إلى ${email}. قد يستغرق وصوله بضع دقائق.`
                    : `We sent a password reset link to ${email}. It may take a few minutes to arrive.`}
                </p>
                <p className="text-xs" style={{ color: '#7A9080' }}>
                  {lang === 'ar' ? 'لم تستلم الرسالة؟ ' : "Didn't receive it? "}
                  <button
                    onClick={() => setSent(false)}
                    className="font-semibold transition-colors"
                    style={{ color: '#40916C' }}
                  >
                    {lang === 'ar' ? 'أعد المحاولة' : 'Try again'}
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {error && (
                  <div className="flex items-center gap-2.5 p-3.5 rounded-xl text-sm" style={{ background: '#FFF5F5', border: '1px solid #FED7D7', color: '#E53E3E' }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-forest mb-1.5">
                    {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7A9080' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input pl-10"
                      placeholder="you@institution.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-70 hover:-translate-y-0.5 mt-1"
                  style={{ background: 'linear-gradient(135deg, #40916C, #52B788)', boxShadow: '0 4px 16px rgba(64,145,108,0.4)' }}
                >
                  {loading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 rounded-full border-2 border-white border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                      />
                      {lang === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      {lang === 'ar' ? 'أرسل رابط الاستعادة' : 'Send Reset Link'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-semibold transition-colors"
            style={{ color: '#74C69D' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'العودة إلى تسجيل الدخول' : 'Back to sign in'}
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
