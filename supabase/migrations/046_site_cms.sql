-- FEE Kuwait — editable site content (contact info + Kuwait partners)
-- Additive migration — safe to run on the existing database (no reset).
--
-- Lets the National Operator edit the public contact details and the Kuwait
-- partner cards from the back office (no code). Public reads are open; only
-- staff may change. Seeded with the values currently hard-coded in the site.

-- ── Site settings (single row) ────────────────────────────────────────
create table if not exists public.site_settings (
  id             text primary key default 'default',
  contact_email  text,
  contact_phone  text,
  contact_person text,
  whatsapp       text,
  address_en     text,
  address_ar     text,
  hours_en       text,
  hours_ar       text,
  instagram      text,
  x_url          text,
  linkedin       text,
  updated_at     timestamptz not null default now()
);
alter table public.site_settings enable row level security;
create policy "Public read site settings" on public.site_settings for select using (true);
create policy "Staff manage site settings" on public.site_settings
  for all using (public.is_staff()) with check (public.is_staff());

insert into public.site_settings (id, contact_email, contact_phone, contact_person, whatsapp, address_en, address_ar, hours_en, hours_ar)
values ('default', 'info@feebureaukw.org', '+965 64449334', 'Mona El Rez', '96564449334',
  'First Mall, 3rd Floor, Office 11, Salem Al Mubarak Street, Salmiya, Kuwait',
  'المجمع الأول، الطابق الثالث، مكتب 11، شارع سالم المبارك، السالمية، الكويت',
  'Sun to Thu: 8:00 AM to 4:00 PM', 'الأحد إلى الخميس: 8:00 ص إلى 4:00 م')
on conflict (id) do nothing;

-- ── Partners (Kuwait local) ───────────────────────────────────────────
create table if not exists public.partners (
  id         uuid default uuid_generate_v4() primary key,
  name_en    text not null,
  name_ar    text,
  type       text not null default 'government' check (type in ('government', 'corporate', 'institutional')),
  logo_url   text,
  initials   text,
  color      text default '#40916C',
  desc_en    text,
  desc_ar    text,
  website    text,
  sort_order int not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.partners enable row level security;
create policy "Public read active partners" on public.partners for select using (active or public.is_staff());
create policy "Staff manage partners" on public.partners
  for all using (public.is_staff()) with check (public.is_staff());

create index if not exists partners_order_idx on public.partners (active, sort_order);

insert into public.partners (name_en, name_ar, type, logo_url, initials, color, desc_en, desc_ar, website, sort_order)
values
  ('Kuwait Environment Public Authority', 'الهيئة العامة للبيئة', 'government', 'https://upload.wikimedia.org/wikipedia/ar/thumb/6/6d/EPA_Kuwait_Logo.svg/200px-EPA_Kuwait_Logo.svg.png', 'KEPA', '#40916C', 'The national environmental authority of Kuwait — our primary government partner overseeing environmental policy.', 'الهيئة البيئية الوطنية في الكويت — شريكنا الحكومي الرئيسي المشرف على السياسة البيئية.', 'https://www.epa.org.kw', 1),
  ('Ministry of Education', 'وزارة التربية', 'government', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Seal_of_Kuwait.svg/200px-Seal_of_Kuwait.svg.png', 'MoE', '#40916C', 'Supporting the rollout of Eco-Schools across Kuwait''s public school network.', 'دعم انتشار برنامج المدارس البيئية عبر شبكة المدارس الحكومية في الكويت.', 'https://www.moe.edu.kw', 2),
  ('Kuwait Municipality', 'بلدية الكويت', 'government', '', 'KM', '#40916C', 'Partnering on Blue Flag beach certifications and urban environmental initiatives.', 'شراكة في اعتمادات شواطئ العلم الأزرق والمبادرات البيئية الحضرية.', 'https://www.baladia.gov.kw', 3),
  ('Kuwait Oil Company', 'شركة نفط الكويت', 'corporate', 'https://logo.clearbit.com/kockw.com', 'KOC', '#C8A951', 'Corporate sponsor supporting environmental education and community sustainability programmes.', 'راعٍ مؤسسي يدعم التعليم البيئي وبرامج الاستدامة المجتمعية.', 'https://www.kockw.com', 4),
  ('National Bank of Kuwait', 'بنك الكويت الوطني', 'corporate', 'https://logo.clearbit.com/nbk.com', 'NBK', '#006994', 'Funding Green Key certification for hospitality partners and youth environmental programmes.', 'تمويل اعتماد المفتاح الأخضر لشركاء الضيافة وبرامج الشباب البيئية.', 'https://www.nbk.com', 5),
  ('Gulf Bank', 'بنك الخليج', 'corporate', 'https://logo.clearbit.com/gulfbank.com.kw', 'GB', '#C8A951', 'Supporting YRE national competitions and youth environmental journalism.', 'دعم مسابقات المراسلين الشباب للبيئة على المستوى الوطني.', 'https://www.gulfbank.com.kw', 6),
  ('Kuwait University', 'جامعة الكويت', 'institutional', 'https://logo.clearbit.com/ku.edu.kw', 'KU', '#006994', 'Academic partner for Eco-Campus research and sustainability curriculum development.', 'شريك أكاديمي لأبحاث الحرم البيئي وتطوير مناهج الاستدامة.', 'https://www.ku.edu.kw', 7),
  ('FEE International', 'FEE الدولية', 'institutional', 'https://logo.clearbit.com/fee.global', 'FEE', '#40916C', 'Our international governing body — the Foundation for Environmental Education, operating in 100+ countries.', 'هيئتنا الدولية — مؤسسة التعليم البيئي، العاملة في أكثر من 100 دولة.', 'https://www.fee.global', 8);
