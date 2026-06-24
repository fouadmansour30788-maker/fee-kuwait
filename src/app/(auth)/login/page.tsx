'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, School, Building2 } from 'lucide-react'
import { useLang } from '@/context/LangContext'

function LoginForm() {
  const { lang } = useLang()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') ?? ''

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError(lang === 'ar' ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور.' : 'Please enter your email and password.')
      return
    }

    setLoading(true)
    await new Promise(r => setTimeout(r, 1400)) // demo delay

    // Demo: route based on email prefix
    const dest = redirectTo || (email.includes('school') ? '/school/dashboard' : '/business/dashboard')
    router.push(dest)
  }

  return (
    <div className="w-full max-w-md mx-auto pt-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl font-bold text-white mb-2.5 tracking-tight">
          {lang === 'ar' ? 'مرحباً بعودتك' : 'Welcome back'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)' }} className="text-sm">
          {lang === 'ar'
            ? 'سجّل دخولك للوصول إلى لوحة التحكم الخاصة بك.'
            : 'Sign in to access your FEE Kuwait portal.'}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}
      >
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl p-8 md:p-10 space-y-5"
          style={{ background: 'rgba(255,255,255,0.97)', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}
        >
          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl text-sm" style={{ background: '#FFF5F5', border: '1px solid #FED7D7', color: '#E53E3E' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Email */}
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

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-forest">
                {lang === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <Link
                href="/reset-password"
                className="text-xs font-medium transition-colors"
                style={{ color: '#7B8266' }}
              >
                {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7A9080' }} />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input pl-10 pr-10"
                placeholder={lang === 'ar' ? 'كلمة المرور' : 'Your password'}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
                style={{ color: '#7A9080' }}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-70 hover:-translate-y-0.5 mt-2"
            style={{ background: 'linear-gradient(135deg, #7B8266, #8B9B88)', boxShadow: '0 4px 16px rgba(123,130,102,0.4)' }}
          >
            {loading ? (
              <>
                <motion.div
                  className="w-4 h-4 rounded-full border-2 border-white border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                />
                {lang === 'ar' ? 'جاري تسجيل الدخول...' : 'Signing in...'}
              </>
            ) : (
              <>
                {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px" style={{ background: '#E8ECE1' }} />
            <span className="text-xs font-medium" style={{ color: '#7A9080' }}>
              {lang === 'ar' ? 'أو' : 'or'}
            </span>
            <div className="flex-1 h-px" style={{ background: '#E8ECE1' }} />
          </div>

          {/* Quick-access for demo */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { type: 'school', Icon: School, color: '#8B9B88', en: 'School Portal', ar: 'بوابة المدرسة', href: '/school/dashboard' },
              { type: 'business', Icon: Building2, color: '#C8A951', en: 'Business Portal', ar: 'بوابة المنشأة', href: '/business/dashboard' },
            ].map(({ type, Icon, color, en, ar, href }) => (
              <Link
                key={type}
                href={href}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 group"
                style={{ background: `${color}0D`, border: `1px solid ${color}25`, color: '#4A544C' }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
                <span className="text-xs">{lang === 'ar' ? ar : en}</span>
              </Link>
            ))}
          </div>
        </form>

        {/* Register link */}
        <p className="text-center mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {lang === 'ar' ? 'ليس لديك حساب؟ ' : "Don't have an account? "}
          <Link href="/register" className="font-semibold transition-colors" style={{ color: '#A9B6A4' }}>
            {lang === 'ar' ? 'سجّل الآن' : 'Register now'}
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
