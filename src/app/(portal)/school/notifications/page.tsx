'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, CheckCircle2, AlertCircle, Info, Calendar, Trash2, CheckCheck } from 'lucide-react'
import { useLang } from '@/context/LangContext'

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'action',
    Icon: AlertCircle,
    color: '#C8A951',
    title_en: 'Document Required',
    title_ar: 'مستند مطلوب',
    body_en: 'Please upload the Eco-Committee member list to proceed with your application review.',
    body_ar: 'يرجى رفع قائمة أعضاء اللجنة البيئية للمتابعة في مراجعة طلبك.',
    date: '2026-05-22',
    read: false,
  },
  {
    id: 2,
    type: 'info',
    Icon: CheckCircle2,
    color: '#40916C',
    title_en: 'Application Received',
    title_ar: 'تم استلام الطلب',
    body_en: 'Your registration application has been successfully received. Application ID: KW-2026-00142.',
    body_ar: 'تم استلام طلب تسجيلك بنجاح. رقم الطلب: KW-2026-00142.',
    date: '2026-05-20',
    read: false,
  },
  {
    id: 3,
    type: 'event',
    Icon: Calendar,
    color: '#006994',
    title_en: 'Webinar: Eco-Schools Best Practices',
    title_ar: 'ندوة: أفضل ممارسات المدارس البيئية',
    body_en: 'Join us on June 5th (World Environment Day) for an online session on Green Flag success stories from Kuwait schools.',
    body_ar: 'انضم إلينا في 5 يونيو (يوم البيئة العالمي) لجلسة عبر الإنترنت حول قصص النجاح للعلم الأخضر في مدارس الكويت.',
    date: '2026-05-18',
    read: true,
  },
  {
    id: 4,
    type: 'info',
    Icon: Info,
    color: '#52B788',
    title_en: 'New Resource Available',
    title_ar: 'مورد جديد متاح',
    body_en: 'The updated Environmental Review Template (v2) is now available in your Resources library.',
    body_ar: 'نموذج المراجعة البيئية المحدث (الإصدار 2) متاح الآن في مكتبة مواردك.',
    date: '2026-05-15',
    read: true,
  },
  {
    id: 5,
    type: 'action',
    Icon: AlertCircle,
    color: '#C8A951',
    title_en: 'Complete Your Profile',
    title_ar: 'أكمل ملفك الشخصي',
    body_en: 'Your school profile is 70% complete. Add your school logo and description to improve your application.',
    body_ar: 'ملف مدرستك مكتمل بنسبة 70%. أضف شعار المدرسة ووصفها لتحسين طلبك.',
    date: '2026-05-12',
    read: true,
  },
  {
    id: 6,
    type: 'info',
    Icon: CheckCircle2,
    color: '#40916C',
    title_en: 'Documents Verified',
    title_ar: 'تم التحقق من المستندات',
    body_en: 'Your submitted documents have passed the initial verification check.',
    body_ar: 'اجتازت مستنداتك المقدمة فحص التحقق الأولي.',
    date: '2026-05-22',
    read: false,
  },
]

const TYPE_LABEL = {
  action: { en: 'Action Required', ar: 'إجراء مطلوب' },
  info: { en: 'Update', ar: 'تحديث' },
  event: { en: 'Event', ar: 'فعالية' },
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
      {children}
    </motion.div>
  )
}

export default function NotificationsPage() {
  const { lang } = useLang()
  const [notifications, setNotifications] = useState(NOTIFICATIONS)

  const unread = notifications.filter(n => !n.read).length

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  const markRead = (id: number) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  const dismiss = (id: number) => setNotifications(prev => prev.filter(n => n.id !== id))

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-forest">{lang === 'ar' ? 'الإشعارات' : 'Notifications'}</h1>
            {unread > 0 && (
              <p className="text-sm mt-1" style={{ color: '#7A9080' }}>
                {lang === 'ar' ? `${unread} إشعارات غير مقروءة` : `${unread} unread`}
              </p>
            )}
          </div>
          {unread > 0 && (
            <button onClick={markAllRead}
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-forest"
              style={{ color: '#52B788' }}>
              <CheckCheck className="w-4 h-4" />
              {lang === 'ar' ? 'تعيين الكل كمقروء' : 'Mark all read'}
            </button>
          )}
        </div>
      </FadeIn>

      {/* Filter tabs */}
      <FadeIn delay={0.04}>
        <div className="flex gap-2">
          {[
            { label_en: 'All', label_ar: 'الكل', count: notifications.length },
            { label_en: 'Unread', label_ar: 'غير مقروء', count: unread },
          ].map(tab => (
            <button key={tab.label_en}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: '#F4F9F5', color: '#7A9080' }}>
              {lang === 'ar' ? tab.label_ar : tab.label_en}
              {tab.count > 0 && (
                <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center"
                  style={{ background: '#40916C', color: '#fff' }}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </FadeIn>

      {notifications.length === 0 ? (
        <FadeIn delay={0.1}>
          <div className="bg-white rounded-3xl border border-[#C8E6D0] p-12 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#EDF7F1' }}>
              <Bell className="w-7 h-7" style={{ color: '#74C69D' }} />
            </div>
            <p className="text-sm font-semibold text-forest">{lang === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}</p>
            <p className="text-xs text-center" style={{ color: '#7A9080' }}>
              {lang === 'ar' ? 'ستظهر تحديثاتك هنا' : "You're all caught up — updates will appear here"}
            </p>
          </div>
        </FadeIn>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif, i) => {
            const Icon = notif.Icon
            const typeLabel = TYPE_LABEL[notif.type as keyof typeof TYPE_LABEL]
            return (
              <FadeIn key={notif.id} delay={0.06 + i * 0.04}>
                <div
                  className="bg-white rounded-2xl border p-4 flex items-start gap-4 transition-all"
                  style={{ borderColor: !notif.read ? `${notif.color}40` : '#C8E6D0' }}
                  onClick={() => markRead(notif.id)}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${notif.color}14`, border: `1px solid ${notif.color}28` }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: notif.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-bold text-forest">{lang === 'ar' ? notif.title_ar : notif.title_en}</p>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: notif.color }} />
                      )}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: '#7A9080' }}>
                      {lang === 'ar' ? notif.body_ar : notif.body_en}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded"
                        style={{ background: `${notif.color}14`, color: notif.color }}>
                        {lang === 'ar' ? typeLabel.ar : typeLabel.en}
                      </span>
                      <span className="text-[11px]" style={{ color: '#A8BFB0' }}>{notif.date}</span>
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); dismiss(notif.id) }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#F4F9F5] transition-colors flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5" style={{ color: '#C8E6D0' }} />
                  </button>
                </div>
              </FadeIn>
            )
          })}
        </div>
      )}
    </div>
  )
}
