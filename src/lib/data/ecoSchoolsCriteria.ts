// ── Eco-Schools: the Seven Steps ────────────────────────────────────
// Source: FEE "Eco-Schools" presentation — "A Seven-Step Change Framework for
// Continuous Improvement" (p.10) and the step slides (pp.11–18). A school must
// implement all seven steps for the Green Flag, so every step is Imperative (I).

export interface ESCriterion { id: string; title: string; title_ar: string; note: string; type: 'I' }

export const ES_AREA = 'Eco-Schools Seven Steps'

export const ES_CRITERIA: ESCriterion[] = [
  {
    id: '1', title: 'Form an Eco Committee', title_ar: 'تشكيل اللجنة البيئية', type: 'I',
    note: 'Eco-School Committee for Leadership — representative of the school community. It directs and facilitates the sustainability of the whole institution and develops future sustainability leaders.\n\nThe Eco-Schools Committee is the driving force behind the Eco-Schools process and represents the ideas of the whole school.\n• We recommend having a diverse Eco Committee: Students / Teachers / The Principal / Non-Teaching Staff / Parents / Members of the Board of Management / interested and relevant members of the wider community\n• The majority of the Committee members should be students and meetings/activities should be student-led\n• The Eco Committee meets regularly to discuss environmental, educational, and social actions for the school\n• The Eco Committee ensures that the entire school receives regular updates and is involved in different projects',
  },
  {
    id: '2', title: 'Carry out a Sustainability Audit', title_ar: 'إجراء التدقيق البيئي (المراجعة البيئية)', type: 'I',
    note: 'Environmental Review to Identify Issues — understanding the biophysical environment, auditing its level of sustainability and identifying the need for improvements.\n\nThis helps the school to identify its current environmental & educational impact and highlights areas for improvement.\n• The aim is to investigate the environmental, educational, and social issues in your school/community, e.g. through surveys, interviews, observations, measurements\n• Make sure that the wider school community works as closely as possible with the Eco Committee to carry out the Review. It is essential that as many pupils as possible participate in this process\n• The results of your Sustainability Audit will inform your Action Plan\n\nFor the purpose of the Environmental Audit there are 13 main Themes — main themes: Biodiversity & Nature, Water & Sanitation, Energy, Transport, Food, Marine & Coast, Litter, School Grounds, Waste; cross-cutting themes: Climate Change, Health & Wellbeing, Global Citizenship & Culture, Equality & Equity.',
  },
  {
    id: '3', title: 'Link to the Curriculum', title_ar: 'الربط بالمنهج الدراسي', type: 'I',
    note: 'Curriculum Linkages to Align with Curriculum Standards — sustainability embedded in curriculum standards, subjects, and non-formal spaces and contexts.\n\nEco-Schools activities are linked to the curriculum, ensuring Eco-Schools is truly integrated within the school community.\n• Embedding the action plan and the main themes within the existing curriculum helps ensure that educational objectives are met (and not only environmental objectives)\n• Pupils should gain an understanding of how real-life environmental and social issues are dealt with in real-life settings',
  },
  {
    id: '4', title: 'Make an Action Plan', title_ar: 'وضع خطة العمل', type: 'I',
    note: 'Action Plan to Address Sustainability Issues Through ESD — prioritising plausible actions, setting specific and achievable targets with completion dates and responsibilities.\n\nResults from the environmental review are used to design the Action Plan, forming the core of student action.\n• As a new Eco-School, we recommend focusing on max. 3 themes at a time\n• Create an Action Plan to resolve or improve the identified problems. The plan should include: the necessary tasks, the people responsible and time frame for actions in order to achieve your goals/targets\n• Make your Action Plan SMART (specific, measurable, attainable, realistic and timely)',
  },
  {
    id: '5', title: 'Monitor & Evaluate', title_ar: 'التنفيذ والرصد والتقييم', type: 'I',
    note: 'Implementation, Monitoring & Evaluation — implement the change, check progress towards set targets, and make amendments where and when necessary.\n\nThis is carried out to find out if the targets set by the action plan are being achieved.\n• Results of monitoring should be regularly updated and displayed for the whole school to see\n• The monitoring methods that you use will depend on the targets and measurement criteria decided on in your Action Plan for the topics you wish to look at and the age and ability of the pupils and other individuals who carry it out\n• Evaluation follows on from monitoring. Evaluating the success of your activities will allow you to make changes to your Action Plan if required',
  },
  {
    id: '6', title: 'Inform & Involve', title_ar: 'الإعلام والإشراك', type: 'I',
    note: 'Informing and Involving for Participation — publicity and awareness raising to keep the school stakeholders and wider community involved and informed.\n\nThis means getting everyone on board! Actions are not solely confined to the school community, but are encouraged to engage community members and parents, for example.\n• It is essential that the whole school is involved in, and the wider community aware of, the school\'s positive actions\n• Ideas for communication and PR: school assemblies, school notice boards, school newsletters and websites, school plays, dramas and fashion shows based on environmental and social issues, letters to businesses and corporations, local and national press, radio and television',
  },
  {
    id: '7', title: 'Produce an Eco Code', title_ar: 'صياغة الميثاق البيئي', type: 'I',
    note: 'Eco Code of Values — the Eco Code is a statement of values and demonstrates the internalization of a sustainability culture in the whole institution.\n\nStudents collaborate to devise a statement that represents the school\'s commitment to the environment.\n• It should be memorable and familiar to everyone in the school\n• The format is flexible, it can be a song, drawing, model, poem, etc.\n• The Eco-Code should list the main objectives of your Action Plan\n• It is crucial that pupils play a key role in the development of the Eco Code, as this will give them a greater sense of responsibility towards the values the Eco Code represents\n• The Eco Code should be prominently displayed throughout the school',
  },
]

// ── The 13 Eco-Schools themes (FEE presentation p.13) ───────────────
// Part of Step 2: the school selects the themes it is working on.
export interface ESTheme { en: string; ar: string; kind: 'main' | 'cross'; icon: string }
// Official Eco-Schools theme icons (from the FEE Eco-Schools presentation), in /public/eco-themes.
export const ES_THEMES: ESTheme[] = [
  { en: 'Biodiversity & Nature', ar: 'التنوع البيولوجي والطبيعة', kind: 'main', icon: '/eco-themes/biodiversity.png' },
  { en: 'Water & Sanitation', ar: 'المياه والصرف الصحي', kind: 'main', icon: '/eco-themes/water.png' },
  { en: 'Energy', ar: 'الطاقة', kind: 'main', icon: '/eco-themes/energy.png' },
  { en: 'Transport', ar: 'النقل', kind: 'main', icon: '/eco-themes/transport.png' },
  { en: 'Food', ar: 'الغذاء', kind: 'main', icon: '/eco-themes/food.png' },
  { en: 'Marine & Coast', ar: 'البحار والسواحل', kind: 'main', icon: '/eco-themes/marine.png' },
  { en: 'Litter', ar: 'النفايات المتناثرة', kind: 'main', icon: '/eco-themes/litter.png' },
  { en: 'School Grounds', ar: 'ساحات المدرسة', kind: 'main', icon: '/eco-themes/grounds.png' },
  { en: 'Waste', ar: 'النفايات', kind: 'main', icon: '/eco-themes/waste.png' },
  { en: 'Climate Change', ar: 'تغيّر المناخ', kind: 'cross', icon: '/eco-themes/climate.png' },
  { en: 'Health & Wellbeing', ar: 'الصحة والرفاهية', kind: 'cross', icon: '/eco-themes/health.png' },
  { en: 'Global Citizenship & Culture', ar: 'المواطنة العالمية والثقافة', kind: 'cross', icon: '/eco-themes/citizenship.png' },
  { en: 'Equality & Equity', ar: 'المساواة والإنصاف', kind: 'cross', icon: '/eco-themes/equality.png' },
]

// The step whose row carries the theme selection.
export const ES_THEMES_STEP = '2'

// Map older theme labels (registration form before Oct 2026) onto the 13 names.
const LEGACY_THEME: Record<string, string> = {
  'Water': 'Water & Sanitation', 'Marine and Coast': 'Marine & Coast', 'Global Citizenship': 'Global Citizenship & Culture',
}
export function normalizeThemes(list: unknown): string[] {
  if (!Array.isArray(list)) return []
  const valid = new Set(ES_THEMES.map((t) => t.en))
  return Array.from(new Set(list.map((t) => LEGACY_THEME[String(t)] ?? String(t)).filter((t) => valid.has(t))))
}

// ── Phased workflow ─────────────────────────────────────────────────
// The school starts with Steps 1–2. Steps 3–7 stay minimised and locked until
// the National Operator approves Steps 1–2 (each needs an attachment, and at
// least ES_MIN_THEMES themes must be selected on Step 2).
export const ES_GATE_STEPS = ['1', '2']
export const ES_LOCKED_STEPS = ['3', '4', '5', '6', '7']
export const ES_MIN_THEMES = 2
