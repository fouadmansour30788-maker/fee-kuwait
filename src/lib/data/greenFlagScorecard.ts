// ── "Is your school Green Flag ready?" — Eco-Schools scorecard ──────
// Source: FEE / Eco-Schools "Is your school Green Flag ready? (Alignment)"
// questionnaire. Seven sections (one per Seven Steps step), 1000 points in total;
// over 800 means the school is ready to be assessed for the Green Flag.
// The National Operator fills it in once every step is Ready (the "final exam").
// Client-safe: no server imports.

export type ScoreQKind = 'choice' | 'number' | 'text' | 'date' | 'upload' | 'gender' | 'agerange' | 'themes'

export interface ScoreOption { pts: number; text: string; earlyYears?: boolean }
export interface ScoreQuestion {
  id: string
  n: number
  text: string
  kind: ScoreQKind
  hint?: string
  options?: ScoreOption[]
  link?: boolean   // choice question that also takes an optional link
}
export interface ScoreSection { id: string; step: string; title: string; max: number; questions: ScoreQuestion[] }

export const GREEN_FLAG_PASS = 800
export const GREEN_FLAG_MAX = 1000

const o = (pts: number, text: string, earlyYears = false): ScoreOption => ({ pts, text, ...(earlyYears ? { earlyYears } : {}) })

export const GREEN_FLAG_SECTIONS: ScoreSection[] = [
  {
    id: 'committee', step: '1', title: 'Eco-Committee', max: 150,
    questions: [
      { id: 'ec1', n: 1, kind: 'upload', text: 'Please upload a document to introduce your Eco-Committee, including roles, ages, and any other details which you would like to share (Word/PDF/PNG/GIF). MANDATORY' },
      { id: 'ec2', n: 2, kind: 'number', text: 'How many members are on your Eco-Committee?' },
      { id: 'ec3', n: 3, kind: 'choice', text: 'How was your Eco-Committee selected?', options: [
        o(20, 'The Eco-Committee is elected/self-nominated'),
        o(20, 'All learners are included in Eco-Schools discussions.', true),
        o(15, 'The Eco-Committee is assigned by the staff'),
        o(5, 'The Eco-Committee membership is not consistent.'),
        o(0, 'There is no Eco-Committee'),
      ] },
      { id: 'ec4', n: 4, kind: 'choice', text: 'Which of the following best describes the current level of student engagement in your Eco-Committee?', options: [
        o(16, 'The Eco-Committee is a popular initiative that students are eager to join and take the lead in.'),
        o(16, 'We have a set time where we focus on Eco-Schools topics, and young learners are encouraged to share their ideas/feelings', true),
        o(12, 'Students are active participants, and the Eco-Committee functions well when initiated and supported by an educator.'),
        o(5, 'It is challenging to motivate students to participate in the Eco-Committee.'),
        o(0, 'Students rarely participate'),
      ] },
      { id: 'ec5', n: 5, kind: 'choice', text: 'What proportion of your Eco-Committee is made up of students?', options: [
        o(20, 'Over 50%'), o(18, '40–50%'), o(5, 'Less than 30%'), o(0, 'Less than 10%'),
      ] },
      { id: 'ec6', n: 6, kind: 'gender', text: 'What is the number of students by gender?' },
      { id: 'ec7', n: 7, kind: 'agerange', text: 'Please indicate the age range of your Eco-Committee members.' },
      { id: 'ec8', n: 8, kind: 'choice', text: 'Does your Eco-Committee represent learners across the age groups?', options: [
        o(16, 'Every year group is represented in our Eco-Committee'),
        o(16, 'All our learners are of similar age.', true),
        o(12, 'A spread of age groups is represented.'),
        o(5, 'The Eco-Committee members are mostly of a similar age.'),
        o(0, 'Only staff is represented'),
      ] },
      { id: 'ec9', n: 9, kind: 'choice', text: 'How often does your Eco-Committee meet?', options: [
        o(18, 'At least 6 meetings in the school year'),
        o(15, 'Between 3 and 6 meetings in a school year'),
        o(7, 'Fewer than 3 meetings (1 per term) in a school year'),
        o(0, 'Maximum once per year'),
      ] },
      { id: 'ec10', n: 10, kind: 'choice', text: 'How many of the meetings are recorded?', hint: 'Recording of meetings can happen for example through note taking, record keeping, etc.', options: [
        o(14, 'All meetings and key decisions are recorded, and notes are carefully kept'),
        o(10, 'At least 50% of the meetings are recorded'),
        o(5, 'Less than half of the meetings are recorded'),
        o(0, 'None of the meetings are recorded, but we intend to start doing so'),
      ] },
      { id: 'ec11', n: 11, kind: 'choice', text: 'Do learners lead the Eco-Committee meetings?', options: [
        o(18, 'Learners organise and lead all meetings.'),
        o(18, 'We encourage learners to share their ideas and feelings about our Eco-Schools programme wherever possible', true),
        o(16, 'Learners actively participate and have an equal voice in the discussions'),
        o(7, 'Learners participate in the discussions when encouraged'),
        o(0, 'Learners are not encouraged to participate in the discussion'),
      ] },
      { id: 'ec12', n: 12, kind: 'choice', text: 'Are the names of your Eco-Committee shared with all school staff and students?', options: [
        o(10, 'Yes, with staff, students and wider community beyond the school'),
        o(5, 'Yes, within the school staff only'),
        o(0, 'No'),
      ] },
      { id: 'ec13', n: 13, kind: 'choice', text: 'Does your Eco-Committee involve any individuals from outside of the school (e.g. family members, members of the community, local leaders)?', options: [
        o(18, 'Yes, some parents and community members'),
        o(12, 'Yes, some parents are aware but not involved'),
        o(5, 'No, but we have reached out'),
        o(0, 'We have not yet considered involving any individuals from outside the school'),
      ] },
      { id: 'ec14', n: 14, kind: 'text', text: 'Would you like to provide any other useful information to support your Eco-Schools Green Flag application related to your Eco-Committee?' },
    ],
  },
  {
    id: 'audit', step: '2', title: 'Sustainability Audit', max: 130,
    questions: [
      { id: 'sa1', n: 1, kind: 'upload', text: 'Please upload an updated copy of your school’s Sustainability Audit (Word/PDF/PNG/GIF). MANDATORY' },
      { id: 'sa2', n: 2, kind: 'choice', text: 'Does your Sustainability Audit include baselines, measurement indicators and targets?', options: [
        o(20, 'Indicators and targets are set for all areas'),
        o(16, 'Indicators and targets are set for over half of the areas'),
        o(7, 'Indicators and targets are set for less than half of the areas'),
        o(0, 'No indicators or targets are set yet, but we are working on it'),
      ] },
      { id: 'sa3', n: 3, kind: 'date', text: 'When was your Sustainability Audit last updated?' },
      { id: 'sa4', n: 4, kind: 'choice', text: 'How often is the audit updated?', options: [
        o(20, 'On an ongoing basis'), o(18, 'At least once a year'), o(7, 'Less than once a year'), o(0, 'It has not yet been updated'),
      ] },
      { id: 'sa5', n: 5, kind: 'choice', text: 'Please indicate the degree of student leadership in the audit.', options: [
        o(30, 'Students take charge of the audit process'),
        o(30, 'We try to engage learners where possible in the audit activities', true),
        o(22, 'Students are involved in tasks related to the audit'),
        o(5, 'Students are barely involved in the audit'),
        o(0, 'Students are not yet involved in the audit.'),
      ] },
      { id: 'sa6', n: 6, kind: 'choice', text: 'How well is your sustainability audit integrated into curriculum work?', options: [
        o(20, 'The audit is well distributed across several curriculum areas and age groups, and clear connections are made between the curriculum content and the sustainability audit'),
        o(18, 'At least two areas of the audit are done as part of curriculum work in more than one year group'),
        o(10, 'At least one area of the audit is done as part of curriculum work'),
        o(0, 'No part of the audit has yet been included in the curriculum.'),
      ] },
      { id: 'sa7', n: 7, kind: 'choice', text: 'What opportunities have been found for reflection and feedback during the process of carrying out the sustainability audit?', options: [
        o(20, 'Dedicated time was allocated for reflection during all points of the sustainability audit, and findings were shared with the whole school.'),
        o(15, 'The audit findings were discussed at the end of the review between those involved and shared with the Eco-Committee.'),
        o(5, 'The audit findings were recorded in the template but not discussed or shared.'),
        o(0, 'No time has been allocated for reflection and feedback on the sustainability audit'),
      ] },
      { id: 'sa8', n: 8, kind: 'choice', text: 'Does your Sustainability Audit include assessment of attitudes and behaviour?', options: [
        o(20, 'Attitudes and/or behaviour changes are carefully recorded (e.g. through surveys) as part of our audit'),
        o(16, 'Some attempts have been made to monitor and record changes in attitude and behaviour'),
        o(7, 'Attitude and behaviour changes are observed but not yet monitored or recorded.'),
        o(0, 'There has been no assessment or observation of attitude and behaviour change'),
      ] },
    ],
  },
  {
    id: 'curriculum', step: '3', title: 'Activate the Curriculum', max: 150,
    questions: [
      { id: 'cu1', n: 1, kind: 'upload', text: 'Please upload a list of all curriculum areas which have adopted activities or themes related to the Eco-Schools Action Plan (Word/PDF/PNG/GIF). MANDATORY' },
      { id: 'cu2', n: 2, kind: 'choice', text: 'How well are the themes from your Action Plan integrated into your school’s curriculum?', options: [
        o(20, 'Priority Eco-Schools themes are integrated at all grade levels and across subjects'),
        o(16, 'Priority Eco-Schools themes are integrated to some extent across subjects'),
        o(7, 'Eco-Schools themes appear already in existing curricula (e.g. science and geography), but are not expanded in others (e.g. creative subjects)'),
        o(0, 'The themes from the Action Plan are not integrated into the school’s curriculum yet, but we are working on it'),
      ] },
      { id: 'cu3', n: 3, kind: 'choice', text: 'Are community members being involved in your Eco-Schools curriculum learning to support local/traditional/indigenous knowledge transfer and build green skills?', options: [
        o(30, 'Community members are being actively involved regularly in the curriculum learning by contributing with local knowledge/skills'),
        o(25, 'Community members have contributed knowledge/skills on more than one occasion'),
        o(10, 'Local/traditional/indigenous culture is included in some curriculum areas without the active involvement of the community members'),
        o(0, 'No focus on local/traditional/indigenous culture is included in the curriculum learning on Eco-Schools themes.'),
      ] },
      { id: 'cu4', n: 4, kind: 'choice', text: 'How many school staff have received training or peer-to-peer learning in Education for Sustainable Development (ESD) or Climate Change Education (CCE)?', options: [
        o(20, 'More than 50% of teachers have received ESD/CCE training'),
        o(18, 'Less than half of our teachers have received ESD/CCE training'),
        o(7, 'We have not received formal training but are learning from others and trying our best'),
        o(0, 'We have not yet started to implement ESD/CCE trainings for teachers'),
      ] },
      { id: 'cu5', n: 5, kind: 'choice', text: 'To what degree are active learning pedagogies (e.g. project-based learning) promoted?', options: [
        o(40, 'Project-based learning and other active pedagogies are widely used to explore themes'),
        o(30, 'Teachers have started to integrate project-based learning and other active pedagogies to explore themes.'),
        o(15, 'Themes are mostly explored using traditional teaching methods, but teachers are being trained to use active learning pedagogies'),
        o(0, 'Teachers are only using traditional teaching methods'),
      ] },
      { id: 'cu6', n: 6, kind: 'choice', text: 'Are sustainable practices embedded in school events/meetings/trips?', options: [
        o(20, 'Sustainability rules and practices are established for all school trips or events.'),
        o(15, 'Some effort has been made to green school trips or events'),
        o(5, 'We are starting to discuss ways in which sustainable practices can be included in school trips or events'),
        o(0, 'We have not yet attempted to green our school trips or events.'),
      ] },
      { id: 'cu7', n: 7, kind: 'choice', text: 'Has the school increased the amount of time spent learning outdoors?', options: [
        o(20, 'Outdoor learning has been incorporated into at least three new curriculum subjects as part of our Eco-Schools programme.'),
        o(15, 'Teachers are trying to incorporate outdoor learning, and some increase is happening.'),
        o(5, 'Teachers are being trained to include outdoor learning, but we have not yet incorporated the practices'),
        o(0, 'Outdoor learning is not encouraged or supported at our school'),
      ] },
    ],
  },
  {
    id: 'action', step: '4', title: 'Action Plan', max: 200,
    questions: [
      { id: 'ap1', n: 1, kind: 'upload', text: 'Please upload a copy of your school’s Action Plan (Word/PDF/PNG/GIF). MANDATORY' },
      { id: 'ap2', n: 2, kind: 'choice', text: 'Do the actions in your Action Plan have targets which are specific, measurable, achievable, relevant, timebound, educational and responsive (SMARTER)?', options: [
        o(30, 'All actions have SMARTER targets.'),
        o(25, 'At least half the actions have SMARTER targets.'),
        o(10, 'Some of the actions have targets, and we will try to make them SMARTER.'),
        o(0, 'No actions have SMARTER targets'),
      ] },
      { id: 'ap3', n: 3, kind: 'choice', text: 'Does your Action Plan include actions related to social, and cultural elements of sustainability?', options: [
        o(30, 'All Action Plan themes consider social and cultural elements of sustainability.'),
        o(20, 'At least 1 Action Plan theme considers social and cultural elements of sustainability'),
        o(5, 'Social and cultural elements are addressed at our school, but not included in the Eco-Schools programme.'),
        o(0, 'Social or cultural elements of sustainability have not yet been considered.'),
      ] },
      { id: 'ap4', n: 4, kind: 'choice', text: 'What is the level of student leadership in your Action Plan?', options: [
        o(30, 'Students are responsible for, or actively involved in, over half of the activities.'),
        o(25, 'We try to engage learners where possible', true),
        o(20, 'Students are responsible for, or actively involved in, up to half of the activities.'),
        o(5, 'Students are involved in one or two of the activities of the Action Plan'),
        o(0, 'We have not yet managed to get students to engage in the activities'),
      ] },
      { id: 'ap5', n: 5, kind: 'choice', text: 'Is your Action Plan publicly available?', options: [
        o(20, 'On at least 3 different platforms'),
        o(15, 'In one or two different places'),
        o(5, 'The Action Plan is not shared beyond the Eco-Committee, but we have some ideas'),
        o(0, 'The Action Plan is not shared'),
      ] },
      { id: 'ap6', n: 6, kind: 'choice', text: 'To what extent were the actions in your Action Plan decided collaboratively?', options: [
        o(30, 'The actions were designed in a collaborative process with learners, informed by curriculum enquiry and/or involving community members.'),
        o(30, 'Actions were discussed and agreed upon by all', true),
        o(20, 'The actions were designed by the Eco-Committee with some involvement from other teachers/classes.'),
        o(7, 'The actions were decided by the school staff and/or the Eco-Committee'),
        o(0, 'The actions were decided by the school leadership'),
      ] },
      { id: 'ap7', n: 7, kind: 'choice', text: 'How often is your Action Plan updated?', options: [
        o(20, 'The Action Plan is updated on an ongoing basis'),
        o(15, 'The Action Plan is updated at least once per year'),
        o(5, 'The Action Plan is updated less than once per year'),
        o(0, 'The Action Plan has not yet been updated'),
      ] },
      { id: 'ap8', n: 8, kind: 'choice', text: 'Is the whole school involved in your Eco-Schools actions?', options: [
        o(20, 'The whole school community is involved in our Eco-Schools actions'),
        o(18, 'The Eco-Schools committee, staff and several classes are involved in the Eco-Schools actions.'),
        o(5, 'The Eco-Schools programme has not yet been acknowledged beyond the Eco-Committee'),
        o(0, 'Only school staff are involved in Eco-Schools actions.'),
      ] },
      { id: 'ap9', n: 9, kind: 'themes', text: 'What themes have your Eco-Committee picked to work on for your Eco-Schools Green Flag Application?' },
      { id: 'ap10', n: 10, kind: 'choice', text: 'To what extent have the cross-cutting themes of Climate Change; Health & Wellbeing; Global Citizenship & Environmental Justice; and Inclusion & Equality been addressed?', options: [
        o(20, 'Actions and targets related to all four cross-cutting themes are included in our action plan.'),
        o(16, 'Actions and targets related to more than one of the cross-cutting themes are included in the action plan.'),
        o(5, 'Actions and targets related to one of the cross-cutting themes are included in the action plan.'),
        o(0, 'None of the cross-cutting themes have been specifically included yet.'),
      ] },
    ],
  },
  {
    id: 'impact', step: '5', title: 'Measuring Impact', max: 105,
    questions: [
      { id: 'mi1', n: 1, kind: 'upload', text: 'Please upload evidence of Measuring Impact (e.g. progress charts, records, metrics, tables, before and after, survey results, etc.), clearly linked to your Sustainability Audit metrics (Word/PDF/PNG/GIF). MANDATORY' },
      { id: 'mi2', n: 2, kind: 'choice', text: 'Are learners involved in measuring impact of your Eco-Schools actions?', options: [
        o(25, 'Students or specific classes undertake measuring impact in collaboration with teaching staff and/or the school management.'),
        o(25, 'Measuring impact is continuously carried out, and we try to engage learners where possible', true),
        o(21, 'Staff and management undertake measuring impact with help from students'),
        o(5, 'Only staff and management undertake measuring impact'),
        o(0, 'There is no measuring impact taking place yet, but we are working on it.'),
      ] },
      { id: 'mi3', n: 3, kind: 'number', text: 'How many students are involved in measuring impact of your Eco-Schools actions?' },
      { id: 'mi4', n: 4, kind: 'choice', text: 'Is the school measuring other metrics related to education quality and wellbeing, such as learner attendance, staff absence, enrollment, behaviour, learner attainment, etc.?', options: [
        o(20, 'The school has recorded and analysed key metrics related to education and wellbeing, and has noticed some change.'),
        o(18, 'The school has observed improvement in well-being and education quality through Eco-School, but has not linked it to measuring impact.'),
        o(7, 'The school is working on including metrics related to education quality and well-being in measuring impact.'),
        o(0, 'The school has not yet considered education quality or well-being as part of measuring impact.'),
      ] },
      { id: 'mi5', n: 5, kind: 'choice', text: 'Is positive progress being made on your Eco-Schools actions?', options: [
        o(20, 'Continuous progress is being made and tracked in all targets'),
        o(18, 'Some progress is being made in several of the targets'),
        o(5, 'Progress is limited or stalled.'),
        o(0, 'The school does not yet have insights into the Eco-Schools action progress'),
      ] },
      { id: 'mi6', n: 6, kind: 'choice', link: true, text: 'Are the measuring impact findings displayed and communicated to the school and community members?', hint: 'Provide a website link if available', options: [
        o(20, 'The latest progress or results are publicised on notice boards, newsletters and/or website/social media'),
        o(18, 'Progress and results are shared during school assemblies'),
        o(5, 'Progress and results are only shared within the Eco-Committee'),
        o(0, 'Progress or results are not yet successfully publicised'),
      ] },
      { id: 'mi7', n: 7, kind: 'choice', text: 'Please indicate whether assessments capture the progress on attitude and behaviour change.', options: [
        o(20, 'Effort is made to monitor the progress of attitude and behaviour change (e.g. through surveys).'),
        o(18, 'Attitude and behaviour change is clearly observed and we are actively working on setting up a measuring impact system.'),
        o(5, 'Change has been observed, but the school has not yet considered measuring impact, attitude and behaviour change'),
        o(0, 'No change has been observed.'),
      ] },
    ],
  },
  {
    id: 'inform', step: '6', title: 'Informing & Involving', max: 165,
    questions: [
      { id: 'ii1', n: 1, kind: 'upload', text: 'Please upload evidence of how you informed and involved the whole school community — for example, through articles, social media posts, posters, newsletters, assemblies, or events (Word/PDF/PNG/GIF). MANDATORY' },
      { id: 'ii2', n: 2, kind: 'choice', text: 'Does the whole school actively participate in Eco-Schools’ actions, events and activities?', options: [
        o(25, 'More than 50% of the student population, as well as wider community members, participate'),
        o(20, 'More than 20% of the student population participates, and some wider community members'),
        o(5, 'Only the Eco-Committee participates.'),
        o(0, 'Only the school staff participates'),
      ] },
      { id: 'ii3', n: 3, kind: 'choice', link: true, text: 'Is the whole school and wider community aware of your Eco-Schools programme?', hint: 'Provide links if possible', options: [
        o(20, 'News about our Eco-Schools programme is communicated both inside and outside of school (e.g. on a dedicated noticeboard, during whole-school assemblies, website and/or social media, news press).'),
        o(18, 'News about our Eco-Schools programme is communicated inside the school (e.g. on a dedicated noticeboard, during whole-school assemblies).'),
        o(5, 'Information regarding the Eco-School programme is only shared within the Eco-Committee, but efforts are being made to communicate beyond'),
        o(0, 'No news about Eco-Schools is communicated.'),
      ] },
      { id: 'ii4', n: 4, kind: 'choice', text: 'Has your school created sufficient links with the wider community through its Eco-Schools programme?', options: [
        o(35, 'Community members/parents have often contributed knowledge and skills in Eco-Schools projects and learning'),
        o(28, 'Community members/parents have participated in Eco-Schools projects on at least one occasion'),
        o(7, 'We have actively tried to involve community members in the Eco-School Programme'),
        o(0, 'No community members have yet been involved'),
      ] },
      { id: 'ii5', n: 5, kind: 'choice', text: 'Does your school share its work with other Eco-Schools through the national or global Eco-Schools network?', options: [
        o(20, 'The school has participated in twinning, sharing and/or collaborations with other Eco-Schools.'),
        o(16, 'We have learned from the projects shared by other Eco-Schools'),
        o(7, 'We have made active efforts to connect our work to the Eco-School network'),
        o(0, 'We have not yet considered connecting our work to the Eco-Schools network'),
      ] },
      { id: 'ii6', n: 6, kind: 'choice', text: 'Has the school participated in or led any campaigns or projects in the local community?', options: [
        o(35, 'The school has led some local projects and campaigns with involvement from the local community.'),
        o(28, 'The school has actively participated in at least one local project or campaign.'),
        o(7, 'Our Eco-Schools actions have yet to reach beyond the school gates, but we are working on it.'),
        o(0, 'Our school has not yet considered participating, or leading any project outside the school area.'),
      ] },
      { id: 'ii7', n: 7, kind: 'choice', text: 'Are your Eco-Schools actions being replicated in homes/wider community?', options: [
        o(30, 'We have collected significant evidence that Eco-Schools projects and behaviours are being replicated at home.'),
        o(22, 'We believe that Eco-Schools projects and behaviours are being replicated at home, and we are setting up a system to collect evidence.'),
        o(7, 'We believe that behaviours are being replicated at home, but the school has not yet considered ways to collect evidence.'),
        o(0, 'We do not believe any replication is happening at home as yet.'),
      ] },
    ],
  },
  {
    id: 'ecocode', step: '7', title: 'Eco-Code', max: 100,
    questions: [
      { id: 'co1', n: 1, kind: 'upload', text: 'Please upload your school’s Eco-Code (Word/PDF/PNG/GIF). MANDATORY' },
      { id: 'co2', n: 2, kind: 'choice', text: 'Does your Eco Code reflect your sustainability values and culture as well as your priority Eco-Schools themes?', options: [
        o(20, 'The Eco Code reflects the values the school aspires to and is a statement of the school culture. It reflects priority themes.'),
        o(15, 'The Eco-Code reflects priority themes.'),
        o(5, 'It is not clearly related to the school values or priority themes.'),
        o(0, 'The Eco-Code is still being designed'),
      ] },
      { id: 'co3', n: 3, kind: 'choice', text: 'Has your Eco-Code been adopted into your official school governance?', options: [
        o(20, 'The Eco-Code has been formally recognised by the Head Teacher as a core policy of the school'),
        o(18, 'The Eco-Code has been informally recognised by the Head Teacher, and efforts are being made to include it in the official school governance'),
        o(10, 'The Head Teacher is aware of our Eco-Code'),
        o(0, 'The Eco-Code is not yet recognised at the school leadership level.'),
      ] },
      { id: 'co4', n: 4, kind: 'choice', text: 'Is your Eco Code prominently displayed?', options: [
        o(20, 'Eco-Code is displayed on the school noticeboard, in several classrooms, website, social media, etc.'),
        o(16, 'The Eco-Code is displayed on the school noticeboard and website'),
        o(5, 'The Eco-Code is displayed on the school noticeboard'),
        o(0, 'The Eco-Code is not displayed.'),
      ] },
      { id: 'co5', n: 5, kind: 'choice', text: 'Was the whole school involved in the writing of your Eco Code?', options: [
        o(20, 'All year groups, school management, teaching staff, and wider community (e.g. parents) were involved.'),
        o(16, 'The whole student body was invited to contribute.'),
        o(7, 'The Eco-Committee wrote the Eco-Code.'),
        o(0, 'The Eco-Code was written by school staff.'),
      ] },
      { id: 'co6', n: 6, kind: 'choice', text: 'How many learners are aware of the Eco-Code?', options: [
        o(20, 'Every learner knows the Eco-Code'),
        o(16, 'Learners involved in the Eco-Schools projects know the code'),
        o(5, 'There is not much awareness of our Eco-Code beyond the Eco-Committee.'),
        o(0, 'Only the ones designing the Eco-Code are aware of it'),
      ] },
    ],
  },
]

// One answer per question: the chosen option index, plus any typed value(s).
export interface ScoreAnswer { choice?: number; value?: string; link?: string; values?: Record<string, string> }
export type ScoreAnswers = Record<string, ScoreAnswer>

export function sectionScore(sec: ScoreSection, answers: ScoreAnswers): number {
  return sec.questions.reduce((sum, q) => {
    const c = answers[q.id]?.choice
    return q.kind === 'choice' && c != null && q.options?.[c] ? sum + q.options[c].pts : sum
  }, 0)
}
export function totalScore(answers: ScoreAnswers): number {
  return GREEN_FLAG_SECTIONS.reduce((s, sec) => s + sectionScore(sec, answers), 0)
}
// Every scored (choice) question answered?
export function scorecardComplete(answers: ScoreAnswers): boolean {
  return GREEN_FLAG_SECTIONS.every((sec) => sec.questions.every((q) => q.kind !== 'choice' || answers[q.id]?.choice != null))
}
