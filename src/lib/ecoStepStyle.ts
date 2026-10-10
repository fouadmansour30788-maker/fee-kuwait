import { Users, Search, BookOpen, ClipboardList, LineChart, Megaphone, ScrollText, type LucideIcon } from 'lucide-react'

// The Eco-Schools Seven Steps, each with its own icon + colour (palette of the
// "How to apply for your certification" wheel). Client-safe.
export const STEP_STYLE: Record<string, { Icon: LucideIcon; color: string }> = {
  '1': { Icon: Users, color: '#E2A92B' },          // Eco-Committee — yellow
  '2': { Icon: Search, color: '#E08A2E' },         // Sustainability Audit — orange
  '3': { Icon: BookOpen, color: '#CF6A2C' },       // Curriculum — burnt orange
  '4': { Icon: ClipboardList, color: '#B4566A' },  // Action Plan — rose
  '5': { Icon: LineChart, color: '#6E5C8E' },      // Monitor & Evaluate — purple
  '6': { Icon: Megaphone, color: '#3F86C6' },      // Inform & Involve — blue
  '7': { Icon: ScrollText, color: '#4E9A5B' },     // Eco-Code — green
}
