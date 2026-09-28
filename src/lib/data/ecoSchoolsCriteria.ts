// ── Eco-Schools: the Seven Steps ────────────────────────────────────
// The FEE Eco-Schools methodology. A school must implement all seven steps to be
// awarded the Green Flag, so every step is Imperative (I). Each step's
// description sets out the expected implementation and the audit evidence.

export interface ESCriterion { id: string; title: string; title_ar: string; note: string; type: 'I' }

export const ES_AREA = 'Eco-Schools Seven Steps'

export const ES_CRITERIA: ESCriterion[] = [
  {
    id: '1', title: 'Form an Eco-Committee', title_ar: 'تشكيل اللجنة البيئية', type: 'I',
    note: 'Expectations for implementation\nThe school forms an Eco-Committee that drives the programme. Students make up the majority of members and lead its work, alongside representatives of teachers, non-teaching staff, school management and parents; the wider community (e.g. local authority, partners) may also be involved. The committee meets regularly, keeps minutes of its meetings, and shares decisions with the whole school.\n\nAudit evidence\nMember list showing student majority and representation of the school community; minutes of committee meetings; evidence the minutes/decisions are displayed or shared.',
  },
  {
    id: '2', title: 'Carry out an Environmental Review', title_ar: 'إجراء المراجعة البيئية', type: 'I',
    note: 'Expectations for implementation\nThe Eco-Committee, with students actively involved, carries out an environmental review of the school to assess its current environmental performance across the Eco-Schools themes (e.g. water, energy, waste, biodiversity, school grounds). The review identifies strengths and the priority areas for improvement, and its results are shared with the school community.\n\nAudit evidence\nCompleted environmental review (checklist/audit) with findings; evidence of student involvement; record that the results were communicated.',
  },
  {
    id: '3', title: 'Create an Action Plan', title_ar: 'وضع خطة العمل', type: 'I',
    note: 'Expectations for implementation\nBased on the environmental review, the Eco-Committee draws up an action plan for the chosen themes. The plan sets clear, measurable targets and lists the actions, who is responsible, the timeline, and how progress will be monitored. The plan is displayed and known across the school.\n\nAudit evidence\nWritten action plan with targets, actions, responsibilities, deadlines and monitoring methods; evidence it is displayed (e.g. Eco-board).',
  },
  {
    id: '4', title: 'Monitor and Evaluate', title_ar: 'الرصد والتقييم', type: 'I',
    note: 'Expectations for implementation\nProgress against the action plan targets is measured and recorded regularly, with students involved in collecting the data. Results are evaluated so the school can see what has worked and adjust its actions, and outcomes are shared.\n\nAudit evidence\nMonitoring records (e.g. meter readings, waste weights, surveys) and charts/graphs of progress against targets; evaluation notes and any resulting changes to the plan.',
  },
  {
    id: '5', title: 'Link to the Curriculum', title_ar: 'الربط بالمنهج الدراسي', type: 'I',
    note: 'Expectations for implementation\nEco-Schools themes and activities are integrated into teaching and learning across different subjects and year groups, so environmental learning is part of everyday classroom work rather than an extra-curricular activity only.\n\nAudit evidence\nLesson plans, schemes of work or projects showing environmental content across subjects and grades; samples of student work.',
  },
  {
    id: '6', title: 'Inform and Involve', title_ar: 'الإعلام والإشراك', type: 'I',
    note: 'Expectations for implementation\nThe school informs and involves the whole school and the wider community in its Eco-Schools work — for example through an Eco-board, assemblies, newsletters, the school website/social media, events and community campaigns — so that everyone knows about and can take part in the activities.\n\nAudit evidence\nPhotos of the Eco-board and events; newsletters, website/social media posts, press or community activities; evidence of parent/community participation.',
  },
  {
    id: '7', title: 'Produce an Eco-Code', title_ar: 'صياغة الميثاق البيئي', type: 'I',
    note: 'Expectations for implementation\nStudents create an Eco-Code — a short, memorable statement (e.g. a mission statement, poem or song) that expresses the school\'s commitment to the environment and reflects its action plan. The Eco-Code is agreed by the school community and displayed prominently around the school.\n\nAudit evidence\nThe Eco-Code itself; evidence it was created by students; photos of it displayed around the school.',
  },
]
