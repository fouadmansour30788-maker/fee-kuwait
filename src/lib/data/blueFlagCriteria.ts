// ── Blue Flag Criteria ──────────────────────────────────────────────
// Structured index of the Blue Flag criteria for Beaches, Marinas and
// Sustainable Boating Tourism Operators. Each criterion is marked Imperative
// (I) or Guideline (G) and lists the categories it applies to, with a short
// explanatory description (`note`).
//
// Representative, structured dataset covering the four Blue Flag areas.

export type BFCategory = 'B' | 'M' | 'BT';
export type BFType = 'I' | 'G';

export const BF_CATEGORIES: { code: BFCategory; label: string; label_ar: string }[] = [
  { code: 'B',  label: 'Beaches',           label_ar: 'الشواطئ' },
  { code: 'M',  label: 'Marinas',           label_ar: 'المراسي' },
  { code: 'BT', label: 'Boating Tourism',   label_ar: 'سياحة القوارب' },
];

const ALL: BFCategory[] = ['B', 'M', 'BT'];

export interface BFSection { n: number; title: string; title_ar: string }
export const BF_SECTIONS: BFSection[] = [
  { n: 1, title: 'Environmental Education & Information', title_ar: 'التثقيف والمعلومات البيئية' },
  { n: 2, title: 'Water Quality',                        title_ar: 'جودة المياه' },
  { n: 3, title: 'Environmental Management',             title_ar: 'الإدارة البيئية' },
  { n: 4, title: 'Safety & Services',                    title_ar: 'السلامة والخدمات' },
];

export interface BFCriterion {
  id: string;
  section: number;
  title: string;
  type: BFType;
  categories: BFCategory[];
  note: string;
}

export const BF_CRITERIA: BFCriterion[] = [
  // ── 1. ENVIRONMENTAL EDUCATION & INFORMATION ────────────────────
  { id: '1.1', section: 1, type: 'I', categories: ALL, title: 'Information about the Blue Flag programme is displayed.',
    note: 'The Blue Flag, its award criteria and the programme’s purpose are shown to users on a visible, well-maintained board.' },
  { id: '1.2', section: 1, type: 'I', categories: ['B', 'M'], title: 'Information about local ecosystems and sensitive natural areas is displayed.',
    note: 'Users are informed about nearby habitats, protected areas and the wildlife that may be encountered, with responsible-behaviour guidance.' },
  { id: '1.3', section: 1, type: 'I', categories: ALL, title: 'Environmental behaviour code and relevant laws are displayed.',
    note: 'A code of conduct and the by-laws governing use of the site (e.g. dogs, camping, driving, waste) are posted where users can read them.' },
  { id: '1.4', section: 1, type: 'I', categories: ['B', 'M'], title: 'Current water-quality information is displayed.',
    note: 'The latest bathing/marina water sampling results are posted in a way users can understand, with the sampling schedule.' },
  { id: '1.5', section: 1, type: 'G', categories: ALL, title: 'At least five environmental education activities are offered.',
    note: 'Guided nature walks, clean-up events, workshops or exhibitions raise awareness among users and the local community each season.' },
  { id: '1.6', section: 1, type: 'I', categories: ['BT'], title: 'Passengers receive an environmental briefing.',
    note: 'Before or during the trip, passengers are informed about responsible wildlife watching, waste and the sensitive areas visited.' },

  // ── 2. WATER QUALITY ────────────────────────────────────────────
  { id: '2.1', section: 2, type: 'I', categories: ['B', 'M'], title: 'Compliance with water-quality sampling requirements.',
    note: 'Water is sampled at the required frequency and locations during the season, following the standard methodology.' },
  { id: '2.2', section: 2, type: 'I', categories: ['B'], title: 'Bathing water meets “excellent” quality standards.',
    note: 'Microbiological results (E. coli and intestinal enterococci) meet the excellent thresholds of the applicable bathing-water directive.' },
  { id: '2.3', section: 2, type: 'I', categories: ['B', 'M'], title: 'No industrial, waste-water or sewage discharges affect the area.',
    note: 'There are no discharges that could impact the site; any nearby outfalls are managed so they do not affect water quality.' },
  { id: '2.4', section: 2, type: 'G', categories: ['B'], title: 'Monitoring for algae and marine debris accumulation.',
    note: 'The site monitors for algal blooms and floating material and manages them so they do not create a nuisance or hazard.' },
  { id: '2.5', section: 2, type: 'I', categories: ['M'], title: 'Marina has adequate facilities to prevent water pollution.',
    note: 'Bilge water, waste water and fuel/oil are handled so that no pollutants enter the water within or around the marina.' },

  // ── 3. ENVIRONMENTAL MANAGEMENT ─────────────────────────────────
  { id: '3.1', section: 3, type: 'I', categories: ALL, title: 'An environmental management committee is established.',
    note: 'A named committee is responsible for environmental management, monitoring and documentation of the site’s Blue Flag compliance.' },
  { id: '3.2', section: 3, type: 'I', categories: ALL, title: 'An environmental management system / policy is in place.',
    note: 'A written policy and procedures cover water, waste, energy and sensitive-area management, reviewed regularly.' },
  { id: '3.3', section: 3, type: 'I', categories: ['B'], title: 'The beach is clean and sand/foreshore is well maintained.',
    note: 'Cleaning is carried out appropriately and frequently enough to keep the beach free of litter without harming the ecosystem.' },
  { id: '3.4', section: 3, type: 'I', categories: ALL, title: 'Adequate, well-maintained waste bins are provided.',
    note: 'Sufficient bins are available, regularly emptied and kept in good condition to prevent overflow and wind-blown litter.' },
  { id: '3.5', section: 3, type: 'I', categories: ALL, title: 'Facilities for separation of recyclable waste are available.',
    note: 'Users can separate recyclable materials (e.g. plastic, glass, paper) which are then collected and recycled.' },
  { id: '3.6', section: 3, type: 'I', categories: ['B', 'M'], title: 'Adequate and clean sanitary facilities are provided.',
    note: 'Toilets are available, clearly signed, kept clean, and have controlled sewage disposal that does not affect water quality.' },
  { id: '3.7', section: 3, type: 'G', categories: ALL, title: 'Sustainable transport to the site is promoted.',
    note: 'Users are encouraged to reach the site by walking, cycling or public transport, with supporting information and facilities.' },
  { id: '3.8', section: 3, type: 'I', categories: ['B'], title: 'Access to the beach is managed to protect dunes and vegetation.',
    note: 'Marked pathways and boardwalks channel access to prevent trampling of dunes, vegetation and nesting areas.' },
  { id: '3.9', section: 3, type: 'G', categories: ['M', 'BT'], title: 'Environmentally friendly products and antifouling are encouraged.',
    note: 'The operator promotes low-impact cleaning products and antifouling practices that reduce release of harmful substances.' },
  { id: '3.10', section: 3, type: 'I', categories: ['M'], title: 'Hazardous waste is collected and disposed of correctly.',
    note: 'Waste oil, batteries, paints and other hazardous materials are collected separately and disposed of through authorised channels.' },

  // ── 4. SAFETY & SERVICES ────────────────────────────────────────
  { id: '4.1', section: 4, type: 'I', categories: ['B'], title: 'An adequate number of lifeguards and/or safety equipment is provided.',
    note: 'Trained lifeguards are on duty, or approved rescue equipment is available and clearly marked where lifeguards are not required.' },
  { id: '4.2', section: 4, type: 'I', categories: ALL, title: 'First-aid equipment is available.',
    note: 'Appropriate, accessible and clearly signed first-aid equipment is available on site during operating hours.' },
  { id: '4.3', section: 4, type: 'I', categories: ALL, title: 'Emergency plans and means to cope with pollution risks are in place.',
    note: 'Documented procedures cover accidents, emergencies and pollution incidents, with responsibilities and contacts defined.' },
  { id: '4.4', section: 4, type: 'I', categories: ['B'], title: 'Safe access and demarcated zones for different users.',
    note: 'Safe access is provided and swimming, boating and other activities are separated to avoid conflict and hazards.' },
  { id: '4.5', section: 4, type: 'I', categories: ['B', 'M'], title: 'Accessibility for people with disabilities.',
    note: 'At least one access point and facility (e.g. ramp, accessible toilet) is provided for people with reduced mobility.' },
  { id: '4.6', section: 4, type: 'G', categories: ['M', 'BT'], title: 'A safety briefing and equipment check are carried out.',
    note: 'Life jackets and safety equipment are provided and checked, and passengers are briefed on their use before departure.' },
  { id: '4.7', section: 4, type: 'I', categories: ['M'], title: 'Marina has clearly marked emergency and rescue equipment.',
    note: 'Lifebuoys, ladders, fire-fighting and emergency equipment are available, well maintained and clearly located along the berths.' },
];

// ── Helpers ─────────────────────────────────────────────────────────
export function bfIsImperative(c: BFCriterion): boolean {
  return c.type === 'I';
}
export function bfCriteriaForCategory(cat: BFCategory): BFCriterion[] {
  return BF_CRITERIA.filter((c) => c.categories.includes(cat));
}
