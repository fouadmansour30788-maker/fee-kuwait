import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `You are the official AI assistant for FEE Kuwait (Foundation for Environmental Education Kuwait). You are bilingual — always respond in the same language the user writes in (Arabic or English).

You know everything about:
- FEE Kuwait's 6 programmes: Eco-Schools, Blue Flag, Green Key, LEAF (Learning about Forests), YRE (Young Reporters for the Environment), and Eco-Campus
- Certification criteria and requirements for each programme
- How to apply (registration on the portal, steps to follow)
- Benefits of each certification
- FEE Kuwait's mission, history, and connection to FEE International
- Kuwaiti schools and businesses eligible to apply
- General environmental education topics

Guidelines:
- Keep responses concise and helpful (2-4 sentences unless more detail is needed)
- Always encourage users to apply or explore programmes
- For specific application status or account questions, ask them to log into their portal
- For urgent issues, direct them to WhatsApp: +965-XXXX-XXXX or email info@feekuwait.org
- Never make up specific facts about individual certified schools/businesses
- Be warm, professional, and environmentally enthusiastic`

export async function POST(req: NextRequest) {
  try {
    const { message, lang, history } = await req.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(history || []).slice(-8).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 400,
      temperature: 0.7,
    })

    const reply = completion.choices[0]?.message?.content ?? (
      lang === 'ar'
        ? 'عذراً، لم أتمكن من الإجابة. يرجى المحاولة مرة أخرى.'
        : 'Sorry, I could not generate a response. Please try again.'
    )

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
