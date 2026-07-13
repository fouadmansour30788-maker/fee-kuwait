// ── Green Key Pre-screening Assessment (Stage 1) ────────────────────
// Eligibility survey + main-category assignment + scope/sub-category and filter
// triggers, from the official "Pre-screening Assessment Form / Integration
// Requirements 2026". Determines whether an establishment may apply, its Green
// Key category, and which criteria apply (dynamic criteria display).

import type { EstablishmentCategory } from './greenKeyCriteria'

export type PSAnswers = Record<string, string | string[] | boolean>

// The additional services an establishment can offer (drive sub-categories).
export const PS_SERVICES: { value: string; label: string }[] = [
  { value: 'accommodation', label: 'Accommodation facilities' },
  { value: 'fnb',           label: 'F&B facilities (restaurant / café)' },
  { value: 'conference',    label: 'Conference facilities (auditoriums, meeting rooms)' },
  { value: 'exhibition',    label: 'Exhibition spaces' },
  { value: 'attraction',    label: 'Attraction (museum, visitor/interpretation centre)' },
]

// Maps a service to the Green Key category whose criteria it pulls in.
const SERVICE_CATEGORY: Record<string, EstablishmentCategory> = {
  accommodation: 'HH', // hotels/hostels (or SA when ≤20 rooms/40 beds)
  fnb: 'R',
  conference: 'CC',
  attraction: 'A',
}

export interface PSResult {
  eligible: boolean | null            // null = not yet determined
  ineligibleReason: string | null
  needsOperationalData: boolean       // <3 months operating → must supply 3 months data
  mainCategory: EstablishmentCategory | null
  subCategories: EstablishmentCategory[]
  flags: {
    hasGreenArea: boolean
    lawnOver4000: boolean
    under50Employees: boolean
    externalFnbCore: boolean
  }
  auditorAccessNote: string | null    // logistics note for the CB (auditor qualification)
}

// The questionnaire, in order. `showIf` gates visibility on prior answers.
export type PSField = 'text' | 'email' | 'country' | 'yesno' | 'multiservice' | 'checkbox'
export interface PSQuestion {
  id: string
  section: string
  text: string
  field: PSField
  help?: string
  showIf?: (a: PSAnswers) => boolean
}

const yes = (a: PSAnswers, id: string) => a[id] === 'yes'
const no = (a: PSAnswers, id: string) => a[id] === 'no'

export const PS_SECTIONS = ['General information', 'Eligibility', 'Main category', 'Scope & sub-categories', 'Operational filters', 'Declarations'] as const

export const PS_QUESTIONS: PSQuestion[] = [
  // General information
  { id: 'contact_name',  section: 'General information', text: 'Name of the contact person', field: 'text' },
  { id: 'contact_email', section: 'General information', text: 'Contact email', field: 'email' },
  { id: 'est_name',      section: 'General information', text: 'Name of your establishment', field: 'text' },
  { id: 'country',       section: 'General information', text: 'Country', field: 'country' },
  { id: 'privacy',       section: 'General information', text: 'I have read and accept the privacy policy', field: 'checkbox' },

  // Eligibility
  { id: 'q_fixed',    section: 'Eligibility', text: 'Is your establishment located in one fixed, permanent location (a permanent physical site, not mobile)? It may include multiple buildings within the same location.', field: 'yesno' },
  { id: 'q_public',   section: 'Eligibility', text: 'Is your establishment open to the general public (accessible to all guests, not restricted to a specific group, membership or clientele)?', field: 'yesno', showIf: (a) => yes(a, 'q_fixed') },
  { id: 'q_construction', section: 'Eligibility', text: 'Is your establishment under major construction/renovation work (significant increase in built area, change of land use, or structural modifications requiring closure)?', field: 'yesno', showIf: (a) => yes(a, 'q_public') },
  { id: 'q_temporary', section: 'Eligibility', text: 'Does your establishment operate on a temporary or one-off basis (e.g. pop-ups, events, short-term activities), rather than a recurring seasonal or permanent business?', field: 'yesno', showIf: (a) => yes(a, 'q_public') && no(a, 'q_construction') },
  { id: 'q_seasonal', section: 'Eligibility', text: 'Does your establishment operate on a seasonal basis (open only during certain periods of the year)?', field: 'yesno', showIf: (a) => no(a, 'q_temporary') },
  { id: 'q_open_audit', section: 'Eligibility', text: 'Will your establishment be open and fully operational at the time of the audit?', field: 'yesno', showIf: (a) => yes(a, 'q_seasonal') },
  { id: 'q_excluded', section: 'Eligibility', text: 'Does your establishment include activities/facilities outside the scope of Green Key (e.g. indoor wine/alcohol/food production, beach or marina facilities)?', field: 'yesno', showIf: (a) => no(a, 'q_temporary') && (no(a, 'q_seasonal') || yes(a, 'q_open_audit')) },
  { id: 'q_excluded_half', section: 'Eligibility', text: 'Do these excluded activities/facilities represent 50% or more of your establishment’s total operations?', field: 'yesno', showIf: (a) => yes(a, 'q_excluded') },
  { id: 'q_access', section: 'Eligibility', text: 'Is your establishment in an area where auditor access may be logistically challenging (limited transport, long travel times, difficult roads, or no nearby towns/infrastructure)?', field: 'yesno', help: 'Used by the Certification Body to determine auditor needs.', showIf: (a) => yes(a, 'q_excluded') ? no(a, 'q_excluded_half') : a.q_excluded === 'no' },
  { id: 'q_3months', section: 'Eligibility', text: 'Has your establishment been in operation for at least 3 months?', field: 'yesno', help: 'If "No", you must be able to provide at least 3 months of operational data.', showIf: (a) => a.q_access === 'yes' || a.q_access === 'no' },

  // Main category
  { id: 'q_accommodation', section: 'Main category', text: 'Is your main activity accommodation services (registered hotel/hostel or small accommodation, or the majority of revenue/space is accommodation)?', field: 'yesno', showIf: (a) => a.q_3months === 'yes' || a.q_3months === 'no' },
  { id: 'q_rooms', section: 'Main category', text: 'Does your establishment have more than 20 rooms or 40 beds?', field: 'yesno', showIf: (a) => yes(a, 'q_accommodation') },
  { id: 'q_campsite', section: 'Main category', text: 'Is your main activity campsite / holiday park services?', field: 'yesno', showIf: (a) => no(a, 'q_accommodation') },
  { id: 'q_conference', section: 'Main category', text: 'Is your main activity conference centre services?', field: 'yesno', showIf: (a) => no(a, 'q_accommodation') && no(a, 'q_campsite') },
  { id: 'q_restaurant', section: 'Main category', text: 'Is your main activity restaurant or café?', field: 'yesno', showIf: (a) => no(a, 'q_accommodation') && no(a, 'q_campsite') && no(a, 'q_conference') },
  { id: 'q_tables', section: 'Main category', text: 'Does your establishment have a minimum of 4 tables or 8 seats for guests?', field: 'yesno', showIf: (a) => yes(a, 'q_restaurant') },
  { id: 'q_attraction', section: 'Main category', text: 'Is your main activity attractions (museum, visitor/interpretation centre, etc.)?', field: 'yesno', showIf: (a) => no(a, 'q_accommodation') && no(a, 'q_campsite') && no(a, 'q_conference') && no(a, 'q_restaurant') },

  // Scope & sub-categories
  { id: 'q_services', section: 'Scope & sub-categories', text: 'Which additional services does your establishment offer that are managed by your establishment? (Select all that apply.)', field: 'multiservice', help: 'Only services not already part of your main category pull in extra criteria.', showIf: (a) => !!mainCategoryOf(a) },
  { id: 'q_ext_fnb', section: 'Scope & sub-categories', text: 'Do you have an externally managed F&B service that forms a core part of your offer (e.g. breakfast, half-board in an externally managed restaurant)?', field: 'yesno', showIf: (a) => !!mainCategoryOf(a) },

  // Operational filters
  { id: 'q_green', section: 'Operational filters', text: 'Does your establishment have gardens, lawns, flowerbeds, landscaped grounds, vegetated roofs, plant pots or any other maintained outdoor/indoor vegetation?', field: 'yesno', help: 'If "No", the biodiversity/green-area criteria (7.8, 7.9, 7.10, 7.12, 7.14) do not apply.', showIf: (a) => !!mainCategoryOf(a) },
  { id: 'q_lawn', section: 'Operational filters', text: 'Is your lawn / green area larger than 4,000 m²?', field: 'yesno', help: 'Determines whether criterion 7.9 (garden equipment) is imperative or guideline.', showIf: (a) => yes(a, 'q_green') },
  { id: 'q_under50', section: 'Operational filters', text: 'Do you have fewer than 50 employees?', field: 'yesno', help: 'If "Yes", criterion 1.6 becomes guideline for all, and 1.10 becomes guideline for HH/CHP/CC/A.', showIf: (a) => !!mainCategoryOf(a) },

  // Declarations
  { id: 'q_no_conflict', section: 'Declarations', text: 'I confirm my establishment is NOT: in an area affected by violence/conflict; significantly impacted by a disease; subject to a commercial embargo; or involved in known criminal legal proceedings.', field: 'checkbox', showIf: (a) => !!mainCategoryOf(a) },
  { id: 'q_accurate', section: 'Declarations', text: 'I confirm that the information provided is accurate and complete to the best of my knowledge, and understand that inaccurate/incomplete information may result in an unsuccessful application.', field: 'checkbox', showIf: (a) => !!mainCategoryOf(a) },
]

// The main category implied by the answers so far (null until determined).
export function mainCategoryOf(a: PSAnswers): EstablishmentCategory | null {
  if (yes(a, 'q_accommodation')) return a.q_rooms === 'yes' ? 'HH' : a.q_rooms === 'no' ? 'SA' : null
  if (yes(a, 'q_campsite')) return 'CHP'
  if (yes(a, 'q_conference')) return 'CC'
  if (yes(a, 'q_restaurant')) return a.q_tables === 'yes' ? 'R' : null
  if (yes(a, 'q_attraction')) return 'A'
  return null
}

// Full evaluation of a set of answers.
export function evaluatePreScreening(a: PSAnswers): PSResult {
  const flags = {
    hasGreenArea: a.q_green === 'yes',
    lawnOver4000: a.q_lawn === 'yes',
    under50Employees: a.q_under50 === 'yes',
    externalFnbCore: a.q_ext_fnb === 'yes',
  }
  const base: PSResult = { eligible: null, ineligibleReason: null, needsOperationalData: a.q_3months === 'no', mainCategory: null, subCategories: [], flags, auditorAccessNote: a.q_access === 'yes' ? 'Auditor access may be logistically challenging — CB to assess auditor needs.' : null }

  // Eligibility gates
  if (no(a, 'q_fixed')) return { ...base, eligible: false, ineligibleReason: 'Not a fixed, permanent location.' }
  if (no(a, 'q_public')) return { ...base, eligible: false, ineligibleReason: 'Not open to the general public.' }
  if (yes(a, 'q_construction')) return { ...base, eligible: false, ineligibleReason: 'Under major construction/renovation.' }
  if (yes(a, 'q_temporary')) return { ...base, eligible: false, ineligibleReason: 'Operates on a temporary or one-off basis.' }
  if (yes(a, 'q_seasonal') && no(a, 'q_open_audit')) return { ...base, eligible: false, ineligibleReason: 'Not open and operational at the time of the audit.' }
  if (yes(a, 'q_excluded') && yes(a, 'q_excluded_half')) return { ...base, eligible: false, ineligibleReason: 'Excluded activities represent 50% or more of operations.' }

  const main = mainCategoryOf(a)
  // Sub-categories from additional managed services + external core F&B.
  const services = Array.isArray(a.q_services) ? a.q_services : []
  const subs = new Set<EstablishmentCategory>()
  for (const s of services) { const cat = SERVICE_CATEGORY[s]; if (cat && cat !== main) subs.add(cat) }
  if (flags.externalFnbCore && main !== 'R') subs.add('R')

  // Eligible once the eligibility gates pass and a main category is determined.
  const eligible = main ? true : (a.q_attraction === 'no' ? false : null)
  const reason = main ? null : (a.q_attraction === 'no' ? 'Main activity does not match a Green Key category.' : null)
  return { ...base, eligible, ineligibleReason: reason, mainCategory: main, subCategories: Array.from(subs) }
}

// Whether every question that should be answered has an answer (for submission).
export function isPreScreeningComplete(a: PSAnswers): boolean {
  for (const q of PS_QUESTIONS) {
    if (q.showIf && !q.showIf(a)) continue
    const v = a[q.id]
    if (q.field === 'checkbox') { if (v !== true) return false; continue }
    if (q.field === 'multiservice') continue // optional
    if (v === undefined || v === '' || v === null) return false
  }
  return isPreScreeningTerminal(a)
}

// The questionnaire reaches a terminal state when it is either ineligible or a
// main category has been determined (so declarations are answerable).
export function isPreScreeningTerminal(a: PSAnswers): boolean {
  const r = evaluatePreScreening(a)
  return r.eligible === false || !!r.mainCategory
}
