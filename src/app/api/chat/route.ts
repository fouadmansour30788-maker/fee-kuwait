import { NextRequest, NextResponse } from 'next/server'

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

const SYSTEM_PROMPT = `You are the official AI assistant for FEE Kuwait (Foundation for Environmental Education Kuwait). You are bilingual — always respond in the same language the user writes in (Arabic or English).

You know everything about:
- FEE Kuwait's 6 programmes: Eco-Schools, Blue Flag, Green Key, LEAF (Learning about Forests), YRE (Young Reporters for the Environment), and Eco-Campus
- Certification criteria and requirements for each programme (imperative vs guideline criteria; 100% of imperative criteria are always required, plus a growing share of guideline criteria based on how long the certificate has been held: 0% in years 1-2, then +10% each two-year period up to 50%)
- The application workflow on the portal: register → operator approves the registration → apply for a programme → complete the criteria board (self-assessment + evidence per criterion, per year) → operator reviews and submits to the Certification Body → auditor is assigned and audits → auditor submits results + a final report → the CB records the decision → certificate is issued. If there are 1-5 non-conformities the establishment gets 15 days to fix them; 6 or more gives 3 months.
- Benefits of each certification
- FEE Kuwait's mission, history, and connection to FEE International
- Kuwaiti schools and businesses eligible to apply
- General environmental education topics

Guidelines:
- Keep responses concise and helpful (2-4 sentences unless more detail is needed)
- Always encourage users to apply or explore programmes
- For specific application status or account questions, ask them to log into their portal
- For urgent issues, direct them to WhatsApp: +965 64449334 or email info@feebureaukw.org (contact person: Mostafa Kanjo)
- Never make up specific facts about individual certified schools/businesses
- Be warm, professional, and environmentally enthusiastic`

interface HistoryItem { role: string; content: string }

export async function POST(req: NextRequest) {
  try {
    const { message, lang, history } = await req.json()
    if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    const key = process.env.GEMINI_API_KEY
    if (!key) {
      console.error('Chat API: GEMINI_API_KEY not set')
      return NextResponse.json({ error: 'Assistant is not configured' }, { status: 503 })
    }

    // Map prior turns to Gemini's format (assistant -> model), keep the last 8.
    const mapped = ((history as HistoryItem[] | undefined) ?? []).slice(-8).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))
    // Gemini requires the conversation to start with a 'user' turn (the widget's
    // first message is the assistant welcome) — drop any leading model turns.
    while (mapped.length && mapped[0].role === 'model') mapped.shift()
    const contents = [...mapped, { role: 'user', parts: [{ text: message }] }]

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
        }),
      },
    )

    if (!res.ok) {
      console.error('Gemini API error:', res.status, await res.text().catch(() => ''))
      return NextResponse.json({ error: 'Assistant is temporarily unavailable' }, { status: 502 })
    }

    const data = await res.json()
    const reply = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join('').trim()
      || (lang === 'ar' ? 'عذراً، لم أتمكن من الإجابة. يرجى المحاولة مرة أخرى.' : 'Sorry, I could not generate a response. Please try again.')

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
