Build a full-stack immersive web platform for FEE Kuwait (Foundation for Environmental Education - Kuwait), the national operator of FEE International in Kuwait. This is an environmental education and certification organization running 6 programmes: Eco-Schools, Blue Flag, Green Key, LEAF (Learning about Ecosystems and Forests), Young Reporters for the Environment (YRE), and Eco-Campus.
________________________________________
TECH STACK
•	Framework: Next.js 14 (App Router)
•	Styling: Tailwind CSS
•	Animations: Framer Motion + Three.js
•	Database & Auth: Supabase
•	Maps: Mapbox GL JS
•	Email: Resend
•	AI Chatbot: OpenAI API (GPT-4)
•	Payments: MyFatoorah
•	WhatsApp: Twilio WhatsApp API
•	Hosting-ready: Vercel
•	Language: Full bilingual Arabic (RTL) + English toggle on every page
________________________________________
DESIGN DIRECTION
Color Palette
Primary — Greens (dominant, used everywhere):
•	Deep Forest Green: #1B4332
•	Rich Emerald: #2D6A4F
•	Main Brand Green: #40916C
•	Medium Green: #52B788
•	Light Green: #74C69D
•	Soft Mint: #B7E4C7
•	Near White Green: #D8F3DC
Accent — Blue (minimal, only for ocean/sky/water context):
•	Use ONLY on: Blue Flag programme page, ocean visuals, water-related stats, sky photography
•	Arabian Gulf Blue: #006994 — sparingly
•	Sky Blue: #90E0EF — sparingly
•	Never use blue for buttons, navigation, cards, or UI elements
Supporting Neutrals:
•	Warm White: #F9FAF7
•	Soft Cream: #F1F5F0
•	Light Gray-Green: #E8F0E9
•	Dark Charcoal: #1C1F1D (text)
•	Medium Gray: #4A5568 (secondary text)
Special Accents (used sparingly for highlights):
•	Desert Gold: #C8A951 (Kuwaiti identity, awards, certification badges)
•	Warm Sand: #E8D5A3 (background accents)
________________________________________
Typography
•	Arabic: Noto Kufi Arabic or Cairo (Google Fonts) — bold, clean, modern
•	English: Inter or Plus Jakarta Sans — clean, professional
•	Headings: Deep Forest Green #1B4332 or white on dark backgrounds
•	Body: Charcoal #1C1F1D
•	Links: Brand Green #40916C with hover to Emerald #2D6A4F
________________________________________
UI Style
•	Glassmorphism cards: rgba(255,255,255,0.15) with backdrop-filter: blur(12px) and border: 1px solid rgba(255,255,255,0.2) — always on green backgrounds
•	Buttons: 
o	Primary: solid #40916C background, white text, hover darkens to #2D6A4F
o	Secondary: transparent with #40916C border and text, hover fills green
o	Danger/Reject: red only in admin context
o	No blue buttons anywhere
•	Cards: white or #F1F5F0 background, subtle #B7E4C7 border, soft green shadow rgba(64,145,108,0.1)
•	Navigation: Deep Forest Green #1B4332 background, white text, green underline on active
•	Footer: Dark #1B4332 with mint green #74C69D accents
•	Section backgrounds: alternate between #F9FAF7, #D8F3DC, and white for rhythm
•	Dividers: soft #B7E4C7 lines
________________________________________
Animations & Immersive Elements
•	Three.js hero: Floating green particle field with subtle organic movement — like leaves or nature particles drifting. No blue ocean animation on homepage (reserve ocean animation ONLY for Blue Flag programme page)
•	Scroll animations: Elements fade and slide up in green-tinted reveals
•	Programme cards: Hover lifts card with green glow box-shadow: 0 8px 32px rgba(64,145,108,0.25)
•	Impact counters: Numbers count up in brand green #40916C
•	Map pins: Green pins by default, blue ONLY for Blue Flag sites
•	Progress bars: Gradient from #52B788 to #1B4332
•	Loading spinners: Green rotating leaf or circle
•	Certification badge glow: Pulsing green aura animation on earned badges
________________________________________
Programme-Specific Color Accents
(Each programme has its own accent WITHIN the green-dominant palette)
Programme	Accent Color	Usage
Eco-Schools	#52B788 Medium Green	Cards, icons, badges
LEAF	#1B4332 Deep Forest	Dark earthy tone
YRE	#74C69D Light Green	Energetic, youth-friendly
Eco-Campus	#40916C Brand Green	Professional
Green Key	#C8A951 Desert Gold	Premium, hospitality
Blue Flag	#006994 Gulf Blue	ONLY programme allowed blue
________________________________________
Photography & Visual Direction
•	Hero images: lush greenery, nature, Kuwaiti landscapes, green schoolyards, forests
•	Avoid predominantly blue images on non-Blue Flag pages
•	Overlay green-tinted gradients rgba(27,67,50,0.6) on hero photos
•	Icons: outline style, green filled, from Lucide or Heroicons
•	Illustrations: flat, nature-themed, green palette
________________________________________
Dark Mode
•	Background: #0D1F17 (very dark green, not black)
•	Cards: #1B4332
•	Text: #D8F3DC
•	Borders: #2D6A4F
•	Keeps full green identity in dark mode — never goes grey or blue
________________________________________
SECTION 1 — PUBLIC WEBSITE
1.1 Homepage
•	Full-screen immersive hero with Three.js animated globe/ocean, headline in Arabic and English, CTA buttons (Join as School / Join as Business / Learn More)
•	Animated live impact counter section: Schools Certified, Businesses Certified, Students Reached, Countries Connected (animated count-up on scroll)
•	6 Programme cards with hover animations, icons, short descriptions, and "Learn More" links
•	Interactive Mapbox map of Kuwait showing all certified sites (schools, beaches, hotels) with coloured pins per programme, clickable popups
•	Latest News section (3 cards, bilingual)
•	Partners & Sponsors logo strip with scroll animation
•	Footer with links, social media, WhatsApp button, Arabic/English
1.2 About Page
•	FEE Kuwait mission, vision, values
•	Timeline of FEE history (1981 to present) with scroll animation
•	Team section with photo cards
•	Connection to FEE International
•	Alignment with Kuwait Vision 2035 and national sustainability goals
•	Downloadable annual reports
1.3 Programme Pages (one per programme, same template)
Each of the 6 programmes (Eco-Schools, Blue Flag, Green Key, LEAF, YRE, Eco-Campus) gets its own page with:
•	Immersive hero image/video background
•	What is this programme
•	Why it matters in Kuwait
•	Step-by-step certification journey (animated stepper)
•	Benefits of joining
•	Eligibility criteria
•	Success stories / case studies (card grid)
•	FAQ accordion
•	Apply Now button (links to portal)
1.4 News & Media Page
•	Blog grid (Arabic + English articles)
•	Press release section
•	Photo gallery with lightbox
•	Video gallery
•	Events calendar with upcoming events
1.5 Impact Dashboard Page (public)
•	Real-time animated stats: certified schools, businesses, students reached, trees planted, beaches cleaned, CO2 saved
•	Charts (bar, pie, line) showing growth over years
•	Interactive map showing all certified sites
•	Programme-by-programme breakdown
1.6 Partners Page
•	Government partners section
•	Corporate sponsors section
•	Institutional partners
•	Become a Partner CTA with contact form
1.7 Contact Page
•	Bilingual contact form
•	WhatsApp direct button
•	Google Maps embed of Kuwait office
•	Social media links
•	FAQ section
________________________________________
SECTION 2 — AUTHENTICATION SYSTEM
•	Supabase Auth with email/password + Google OAuth
•	Role-based access: School User / Business User / FEE Kuwait Admin / Super Admin
•	Registration flow: user selects role (school or business), fills profile, selects programme to apply for
•	Email verification on signup (automated via Resend)
•	Password reset flow
•	Protected routes based on role
________________________________________
SECTION 3 — SCHOOL MEMBER PORTAL
(For Eco-Schools, LEAF, YRE, Eco-Campus participants)
Dashboard
•	Welcome banner with school name and programme
•	Certification progress bar (% complete)
•	Current step highlighted with next action required
•	Upcoming deadlines
•	Recent notifications
•	Quick links: Submit Report, Upload Document, View Resources, Contact FEE Kuwait
Application Flow (multi-step form)
•	Step 1: School profile (name, type, governorate, number of students, principal contact)
•	Step 2: Programme selection
•	Step 3: Eligibility self-check
•	Step 4: Document upload (school license, contact letter)
•	Step 5: Review & submit
•	Auto-save between steps
•	Progress indicator
Certification Journey Tracker
•	Visual 7-step checklist (FEE Eco-Schools model)
•	Each step: description, required actions, document uploads, status (not started / in progress / submitted / approved)
•	Completion unlocks next step
•	Green Flag countdown when all steps approved
Action Plan Builder
•	School creates annual environmental action plan
•	Add goals, activities, responsible persons, timeline
•	Submit for FEE Kuwait review
•	Track completion of each activity
Document Vault
•	Upload and manage all submitted documents
•	View review status per document
•	Download approved certificates
•	Version history
Resource Library
•	Download curriculum guides, activity sheets, toolkits
•	Filtered by programme and language
•	Arabic and English versions
Student Activity Log
•	Log environmental activities done by students
•	Upload photos/videos as evidence
•	Activity counter toward certification
YRE Submissions (for YRE schools)
•	Students submit articles, photos, videos
•	Category selection (pollution, biodiversity, climate, etc.)
•	Submission status tracking
•	Winners notified automatically
Notifications Centre
•	All automated messages in one place
•	Mark as read
•	Filter by type
________________________________________
SECTION 4 — BUSINESS MEMBER PORTAL
(For Green Key, Blue Flag participants)
Dashboard
•	Property name, programme, certification status badge
•	Criteria completion percentage
•	Expiry date countdown
•	Recent activity
•	Quick links
Application Flow (multi-step form)
•	Step 1: Property profile (name, type, location on map, star rating, contact)
•	Step 2: Programme selection (Green Key or Blue Flag)
•	Step 3: Self-assessment questionnaire (scored automatically)
•	Step 4: Document upload (trade license, photos, environmental policy)
•	Step 5: Review & submit
Criteria Checklist
•	Full Green Key / Blue Flag criteria list
•	Each criterion: description, required evidence, upload button, status
•	Auto-calculate % complete
•	Flag mandatory vs optional criteria
Certification Status
•	Current certification level and badge
•	Expiry date with renewal CTA
•	Download certificate PDF (auto-generated)
•	Download official logos and marketing materials
•	Embed code for digital badge on their own website
Inspection Scheduling
•	View scheduled inspection dates
•	Confirm or request reschedule
•	Upload pre-inspection checklist
________________________________________
SECTION 5 — ADMIN DASHBOARD
(For FEE Kuwait staff)
Overview Dashboard
•	KPI cards: total members, pending applications, certifications issued this year, renewals due
•	Charts: applications over time, by programme, by governorate
•	Recent activity feed
•	Alerts: overdue reviews, expiring certifications, failed payments
Applications Pipeline (Kanban)
•	Columns: New / Under Review / Documents Pending / Site Visit Scheduled / Approved / Rejected
•	Drag and drop between columns
•	Each card shows: applicant name, programme, date submitted, assigned staff
•	Click card to open full application detail
Application Review Panel
•	Full application details
•	Document viewer (PDF, images inline)
•	Approve / Request Changes / Reject buttons with comments
•	Auto-notification sent to applicant on action
•	Internal notes between staff
•	Audit trail of all actions
Member Management
•	Full searchable, filterable table of all members
•	Filter by: programme, status, governorate, certification expiry
•	Bulk actions: send reminder, export CSV
•	Click member to view full profile and history
Certificate Generator
•	Select approved member
•	Auto-populate certificate template with name, programme, date, expiry
•	Preview certificate
•	Generate PDF and auto-send to member
•	Log certificate issuance
Reporting Module
•	Generate reports: monthly summary, annual impact, by programme, by region
•	Export as PDF or Excel
•	Auto-scheduled monthly report sent to director by email
•	FEE International submission report template
Content Management
•	Edit homepage stats and impact numbers
•	Add/edit/delete news articles (bilingual)
•	Manage events calendar
•	Update map pins (certified sites)
•	Manage resource library files
Staff Management
•	Add/remove staff accounts
•	Assign roles and permissions
•	Activity log per staff member
________________________________________
SECTION 6 — AUTOMATION ENGINE
Email Automation (via Resend)
Build automated email workflows triggered by events:
•	Welcome email → on registration (bilingual, branded template)
•	Application received → on submission
•	Status update → on every pipeline stage change
•	Document requested → when admin requests missing docs
•	Approved → with certificate attached as PDF
•	Rejected → with reason and reapplication instructions
•	Renewal reminder → 90, 60, 30, 7 days before expiry
•	Inactivity nudge → if no login in 30 days
•	Milestone celebration → on each certification step completed
•	Monthly newsletter → auto-compiled from latest news
WhatsApp Automation (via Twilio)
•	Application status updates via WhatsApp
•	Renewal reminders via WhatsApp
•	Welcome message on registration
•	Inspection reminder 24 hours before
Internal Automation
•	New application → auto-assign to staff + create task + set 5-day review deadline
•	Application idle 7 days → alert assigned staff
•	Certification approved → auto-generate certificate + update map + send email + issue digital badge
•	Certification expired → auto-remove from public map + notify member
•	Payment received → auto-issue receipt + update membership status
•	Monthly → auto-generate and email impact report to director
Social Media Drafts
•	On certification approval → auto-draft congratulations post for Instagram/LinkedIn (pending staff approval)
________________________________________
SECTION 7 — AI CHATBOT
•	Embedded on all public pages and inside member portal
•	Powered by OpenAI GPT-4 API
•	Bilingual: detects Arabic or English and responds accordingly
•	Knows all about: FEE Kuwait programmes, certification criteria, application process, eligibility, contact info
•	Can guide users to: apply, find a resource, contact staff, learn about a programme
•	Inside portal: answers questions about their specific application status and next steps
•	Fallback: "I'll connect you with our team" → triggers WhatsApp or email to staff
•	Chat history saved per session
•	Admin can update chatbot knowledge base from dashboard
________________________________________
SECTION 8 — INTERACTIVE MAP
•	Mapbox GL JS
•	Kuwait map centered, showing all governorates
•	Coloured pins: green (Eco-Schools), blue (Blue Flag), gold (Green Key), brown (LEAF)
•	Clicking pin: popup with name, programme, certification year, photo
•	Filter by programme buttons
•	Search by name
•	Auto-updated when admin certifies a new member
•	Public-facing on homepage and impact page
________________________________________
SECTION 9 — YOUTH SECTION
•	Dedicated colourful, energetic design
•	YRE article and photo submission portal
•	Student environmental pledge wall (public, shows pledges made)
•	Gamification: badges earned per activity completed
•	Leaderboard: top schools by activities completed
•	Fun environmental quizzes
•	Countdown to next YRE competition deadline
________________________________________
SECTION 10 — DEMO MODE
Build a full demo mode that:
•	Populates all dashboards with realistic fake data (Kuwaiti school names, hotel names, beach names)
•	Simulates automation flows visually (show notification being sent, certificate being generated)
•	Allows clicking through entire user journey without real backend
•	Has a "Demo Mode" banner visible at top
•	Includes demo accounts: demo_school@feekuwait.org / demo_business@feekuwait.org / demo_admin@feekuwait.org
•	All map pins pre-populated with fictional certified sites across Kuwait governorates
________________________________________
DATABASE SCHEMA (Supabase)
Create full schema including tables for:
•	users (id, email, role, name, phone, created_at)
•	schools (id, user_id, name, type, governorate, students_count, principal, status)
•	businesses (id, user_id, name, type, location, stars, status)
•	applications (id, applicant_id, programme, status, assigned_to, submitted_at, updated_at)
•	documents (id, application_id, name, url, status, reviewed_at)
•	certifications (id, applicant_id, programme, issued_at, expires_at, certificate_url, active)
•	notifications (id, user_id, type, message, read, created_at)
•	news (id, title_en, title_ar, body_en, body_ar, published_at, image_url)
•	events (id, title_en, title_ar, date, location, description_en, description_ar)
•	map_pins (id, name, programme, lat, lng, certified_at, photo_url, active)
•	resources (id, title, programme, language, file_url, created_at)
•	chat_logs (id, user_id, session_id, message, role, created_at)
•	automation_logs (id, trigger, recipient, channel, status, sent_at)
________________________________________
ADDITIONAL REQUIREMENTS
•	Every page fully responsive (mobile, tablet, desktop)
•	Arabic RTL layout switches correctly on toggle
•	All forms validated client and server side
•	Loading states and skeleton screens everywhere
•	Error boundaries and graceful error handling
•	Toast notifications for all user actions
•	SEO optimized (meta tags, OG images, sitemap)
•	Environment variables for all API keys
•	README with full setup instructions
•	Seed file with demo data for all tables
•	Deploy-ready for Vercel
________________________________________
Start by scaffolding the full Next.js project structure, installing all dependencies, setting up Supabase schema, then build section by section starting with the immersive public homepage.

