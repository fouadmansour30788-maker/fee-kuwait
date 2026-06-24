'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Leaf, Loader2 } from 'lucide-react'
import { useLang } from '@/context/LangContext'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const WELCOME: Record<string, string> = {
  en: "Hello! I'm the FEE Kuwait assistant. How can I help you today? I can answer questions about our 6 environmental programmes, certification requirements, and how to apply.",
  ar: 'مرحباً! أنا مساعد FEE الكويت. كيف يمكنني مساعدتك اليوم؟ يمكنني الإجابة على أسئلتك حول برامجنا البيئية الستة ومتطلبات الاعتماد وكيفية التقديم.',
}

export default function ChatWidget() {
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WELCOME[lang] },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Update welcome message on lang change
  useEffect(() => {
    setMessages([{ role: 'assistant', content: WELCOME[lang] }])
  }, [lang])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, lang, history: messages }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: lang === 'ar'
          ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
          : 'Sorry, something went wrong. Please try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-brand shadow-green-xl text-white flex items-center justify-center hover:bg-emerald transition-colors"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X className="w-6 h-6" /></motion.div>
            : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageCircle className="w-6 h-6" /></motion.div>
          }
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-h-[600px] bg-warmwhite rounded-3xl shadow-green-xl border border-mint flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-forest px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">FEE Kuwait Assistant</div>
                <div className="text-light/60 text-xs">Bilingual · Always available</div>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-light animate-pulse" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-brand text-white rounded-br-sm'
                        : 'bg-pale text-charcoal rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-pale px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-brand animate-spin" />
                    <span className="text-xs text-gray">{lang === 'ar' ? 'يكتب...' : 'Typing...'}</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-greengray flex items-center gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder={lang === 'ar' ? 'اكتب سؤالك...' : 'Ask a question...'}
                className="flex-1 input !py-2 !text-sm"
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center hover:bg-emerald transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
