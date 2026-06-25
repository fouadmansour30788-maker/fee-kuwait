// ── Green Key Criteria 2026-2031 ────────────────────────────────────
// Structured index of the official Green Key criteria. Each criterion is
// marked Imperative (I) or Guideline (G) and lists the establishment
// categories it applies to. For criteria that are imperative for some
// categories and guideline for others (I/G), `imperativeFor` lists the
// categories that must treat it as imperative.
//
// Source: "Green Key Criteria and Explanatory Notes, 1 Oct 2026 - 31 Dec 2031".
// This is a representative, structured dataset covering all 7 sections at
// criterion level (number, statement, I/G, categories). Full explanatory
// notes per criterion can be added to `note` as needed.

export type EstablishmentCategory = 'HH' | 'CHP' | 'SA' | 'CC' | 'R' | 'A'
export type CriterionType = 'I' | 'G' | 'I/G'

export const ESTABLISHMENT_CATEGORIES: { code: EstablishmentCategory; label: string; short: string }[] = [
  { code: 'HH',  label: 'Hotels & Hostels',          short: 'Hotel/Hostel' },
  { code: 'CHP', label: 'Campsites & Holiday Parks',  short: 'Campsite' },
  { code: 'SA',  label: 'Small Accommodations',       short: 'Small Accom.' },
  { code: 'CC',  label: 'Conference Centres',         short: 'Conf. Centre' },
  { code: 'R',   label: 'Restaurants / Cafés',        short: 'Restaurant' },
  { code: 'A',   label: 'Attractions',                short: 'Attraction' },
]

const ALL: EstablishmentCategory[] = ['HH', 'CHP', 'SA', 'CC', 'R', 'A']

export interface GKSection {
  n: number
  title: string
  subsections: string[]
}

export const GK_SECTIONS: GKSection[] = [
  { n: 1, title: 'Sustainable Management',        subsections: ['Environmental Strategy & Management Involvement', 'Corporate Social Responsibility', 'Team Engagement'] },
  { n: 2, title: 'Guest Awareness & Involvement', subsections: ['Guest Involvement', 'Responsible Tourism'] },
  { n: 3, title: 'Water',                         subsections: ['Water Management', 'Water Pollution'] },
  { n: 4, title: 'Energy & Carbon',               subsections: ['Energy Management', 'HVAC, Equipment & Lights', 'Greenhouse Gas'] },
  { n: 5, title: 'Waste',                         subsections: ['Waste Management', 'Waste Reduction'] },
  { n: 6, title: 'Procurement',                   subsections: ['Administration / Other Procurement', 'Food & Beverage', 'Washing & Cleaning'] },
  { n: 7, title: 'Living Environment',            subsections: ['Indoor Environment', 'Biodiversity Protection'] },
]

export interface Criterion {
  id: string
  section: number
  subsection: string
  title: string
  type: CriterionType
  categories: EstablishmentCategory[]
  imperativeFor?: EstablishmentCategory[]
  note?: string
}

// Certification-period requirement: 100% of imperative criteria always,
// plus an increasing % of applicable guideline criteria.
export const GUIDELINE_CYCLE = [
  { period: 'First',               years: '1-2',   imperative: 100, guideline: 0 },
  { period: 'Second',              years: '3-4',   imperative: 100, guideline: 10 },
  { period: 'Third',               years: '5-6',   imperative: 100, guideline: 20 },
  { period: 'Fourth',              years: '7-8',   imperative: 100, guideline: 30 },
  { period: 'Fifth',               years: '9-10',  imperative: 100, guideline: 40 },
  { period: 'Sixth & thereafter',  years: '11-12+', imperative: 100, guideline: 50 },
]

export const GK_CRITERIA: Criterion[] = [
  // ── 1. SUSTAINABLE MANAGEMENT ───────────────────────────────────
  { id: '1.1',  section: 1, subsection: 'Environmental Strategy & Management Involvement', title: 'Management is involved and appoints a Green Key Establishment Representative from the staff.', type: 'I', categories: ALL, note: 'A named representative (plus substitute) coordinates all sustainability efforts; verified by interview.' },
  { id: '1.2',  section: 1, subsection: 'Environmental Strategy & Management Involvement', title: 'The establishment formulates strategic sustainability targets.', type: 'I', categories: ALL, note: 'Min. 2 targets (4 if >50 employees) across ≥2 areas, up to 6 years out, grounded in baseline data.' },
  { id: '1.3',  section: 1, subsection: 'Environmental Strategy & Management Involvement', title: 'The establishment formulates an action plan aligned with its strategic targets.', type: 'I', categories: ALL, note: 'Covers the 24-month cycle; measurable actions linked to ≥1 strategic target, with owners and timelines.' },
  { id: '1.4',  section: 1, subsection: 'Corporate Social Responsibility', title: 'Fair labour practices: written contracts, equal pay for equal work, living wage.', type: 'I', categories: ALL, note: 'Applies to subcontracted/outsourced on-site staff too; auditor samples 3 contracts vs payroll.' },
  { id: '1.5',  section: 1, subsection: 'Corporate Social Responsibility', title: 'No child labour; protection of minors in employment.', type: 'I', categories: ALL, note: 'No employment under 14; ILO 138/182 and UNCRC where national law is weaker.' },
  { id: '1.6',  section: 1, subsection: 'Corporate Social Responsibility', title: 'Accessible, non-retaliatory grievance and whistleblower mechanisms.', type: 'I', categories: ['HH', 'CHP', 'CC', 'R', 'A'], note: 'Applies to establishments with >50 employees; ≥1 confidential channel.' },
  { id: '1.7',  section: 1, subsection: 'Corporate Social Responsibility', title: 'Procedures ensure a safe and healthy working environment.', type: 'I', categories: ALL },
  { id: '1.8',  section: 1, subsection: 'Corporate Social Responsibility', title: 'Active cooperation with external stakeholders on environmental/social community initiatives.', type: 'I', categories: ALL, note: 'Min. 1 active two-way cooperation (2 if >50 employees).' },
  { id: '1.9',  section: 1, subsection: 'Corporate Social Responsibility', title: 'Demonstrates respect for Indigenous Peoples in operations and representations.', type: 'I', categories: ALL, note: 'N/A if no Indigenous Peoples within 100 km radius.' },
  { id: '1.10', section: 1, subsection: 'Corporate Social Responsibility', title: 'Procedures for equitable recruitment or equitable development.', type: 'I/G', categories: ALL, imperativeFor: ['HH', 'CHP', 'CC', 'A'], note: 'Imperative for >50 employees; equal-opportunity policy + ≥1 action.' },
  { id: '1.11', section: 1, subsection: 'Corporate Social Responsibility', title: 'Access for people with additional needs - min. 1 defined accessibility category.', type: 'I/G', categories: ALL, imperativeFor: ['HH', 'CC', 'A'] },
  { id: '1.12', section: 1, subsection: 'Corporate Social Responsibility', title: 'Plants, animals and historical/archaeological artefacts sold/displayed only per international law.', type: 'I', categories: ALL, note: 'No trade/display of IUCN-threatened species.' },
  { id: '1.13', section: 1, subsection: 'Corporate Social Responsibility', title: 'No entertainment, excursions or activities involving exploitation or suffering of animals.', type: 'I', categories: ALL },
  { id: '1.14', section: 1, subsection: 'Corporate Social Responsibility', title: 'Animal welfare guidelines followed when animals are kept on premises.', type: 'I', categories: ALL, note: 'ABTA Five Domains Model; annual veterinary assessment.' },
  { id: '1.15', section: 1, subsection: 'Corporate Social Responsibility', title: 'Develops and implements a Code of Business Conduct.', type: 'G', categories: ALL },
  { id: '1.16', section: 1, subsection: 'Corporate Social Responsibility', title: 'Actively promotes the physical and mental wellbeing of employees.', type: 'G', categories: ['HH', 'CHP', 'CC', 'R', 'A'] },
  { id: '1.17', section: 1, subsection: 'Corporate Social Responsibility', title: 'Traineeships / flexible employment for long-term unemployed or limited-employability people.', type: 'G', categories: ALL },
  { id: '1.18', section: 1, subsection: 'Corporate Social Responsibility', title: 'Access for people with additional needs - min. 2 defined accessibility categories.', type: 'G', categories: ALL },
  { id: '1.19', section: 1, subsection: 'Corporate Social Responsibility', title: 'Local micro/small entrepreneurs can sell sustainable, locally-rooted products.', type: 'G', categories: ALL },
  { id: '1.20', section: 1, subsection: 'Team Engagement', title: 'Management briefs staff at least 2 times per year on sustainability initiatives.', type: 'I', categories: ALL, note: '1x/year for seasonal or ≤5 staff.' },
  { id: '1.21', section: 1, subsection: 'Team Engagement', title: 'Annual sustainability training is provided to staff.', type: 'I', categories: ALL, note: 'Progressive; HH/CHP also provide ≥1 role-specific training/year.' },
  { id: '1.22', section: 1, subsection: 'Team Engagement', title: 'Housekeeping knows and implements towel/sheet change procedures.', type: 'I', categories: ['HH', 'CHP', 'SA'] },
  { id: '1.23', section: 1, subsection: 'Team Engagement', title: 'Informative and educational material displayed in staff areas to promote responsible behaviour.', type: 'I', categories: ['HH', 'CHP', 'CC', 'R', 'A'] },
  { id: '1.24', section: 1, subsection: 'Team Engagement', title: 'Staff can evaluate the establishment’s environmental and social performance annually.', type: 'G', categories: ['HH', 'CHP', 'CC', 'R', 'A'] },

  // ── 2. GUEST AWARENESS & INVOLVEMENT ────────────────────────────
  { id: '2.1',  section: 2, subsection: 'Guest Involvement', title: 'Green Key certificate and programme information displayed in a highly visible area.', type: 'I', categories: ALL },
  { id: '2.2',  section: 2, subsection: 'Guest Involvement', title: 'Information about Green Key is available on the establishment’s website.', type: 'I', categories: ALL },
  { id: '2.3',  section: 2, subsection: 'Guest Involvement', title: 'Guests kept informed about sustainability initiatives and actively encouraged to participate.', type: 'I', categories: ALL },
  { id: '2.4',  section: 2, subsection: 'Guest Involvement', title: 'Guest-facing staff can inform guests about Green Key and current sustainability initiatives.', type: 'I', categories: ALL },
  { id: '2.5',  section: 2, subsection: 'Guest Involvement', title: 'Informs and encourages guests to use sustainable transportation alternatives.', type: 'I', categories: ALL },
  { id: '2.6',  section: 2, subsection: 'Guest Involvement', title: 'Guests can evaluate the establishment’s sustainability performance.', type: 'G', categories: ['HH', 'CHP', 'CC', 'R', 'A'] },
  { id: '2.7',  section: 2, subsection: 'Guest Involvement', title: 'Actively communicates sustainability practices and engages with Green Key on digital media.', type: 'G', categories: ALL },
  { id: '2.8',  section: 2, subsection: 'Responsible Tourism', title: 'Information about nearby parks, beaches and ecologically sensitive areas available to guests.', type: 'I/G', categories: ['HH', 'CHP', 'SA', 'A', 'CC', 'R'], imperativeFor: ['HH', 'CHP', 'SA', 'A'] },
  { id: '2.9',  section: 2, subsection: 'Responsible Tourism', title: 'Information promoting responsible tourist behaviour in the destination provided to guests.', type: 'I/G', categories: ['HH', 'CHP', 'SA', 'A', 'CC', 'R'], imperativeFor: ['HH', 'CHP', 'SA', 'A'] },
  { id: '2.10', section: 2, subsection: 'Responsible Tourism', title: 'Provides and promotes ≥4 awareness-raising activities for guests per certification period.', type: 'G', categories: ALL },
  { id: '2.11', section: 2, subsection: 'Responsible Tourism', title: 'Offers or facilitates access to non-motorised transportation rental for guests.', type: 'G', categories: ['HH', 'CHP', 'SA', 'CC', 'A'] },

  // ── 3. WATER ────────────────────────────────────────────────────
  { id: '3.1',  section: 3, subsection: 'Water Management', title: 'Total water consumption recorded at least once a month.', type: 'I', categories: ALL },
  { id: '3.2',  section: 3, subsection: 'Water Management', title: 'Water outlets actively monitored and leaks promptly repaired.', type: 'I', categories: ALL },
  { id: '3.3',  section: 3, subsection: 'Water Management', title: 'Water flow in ≥80% of showers does not exceed 9 L/min.', type: 'I', categories: ['HH', 'CHP', 'SA'] },
  { id: '3.4',  section: 3, subsection: 'Water Management', title: 'Water flow in ≥80% of handwashing taps does not exceed 8 L/min.', type: 'I', categories: ALL },
  { id: '3.5',  section: 3, subsection: 'Water Management', title: 'Urinals have sensors, water-saving devices, or are water-free.', type: 'I', categories: ALL },
  { id: '3.6',  section: 3, subsection: 'Water Management', title: 'Newly purchased toilets have dual flush (max 3/6 L) or max 4.5 L sensor flush.', type: 'I', categories: ALL },
  { id: '3.7',  section: 3, subsection: 'Water Management', title: 'Newly purchased dishwashers and laundry machines are water efficient.', type: 'I', categories: ALL },
  { id: '3.8',  section: 3, subsection: 'Water Management', title: 'Separate water meters installed in high-consumption areas.', type: 'G', categories: ALL },
  { id: '3.9',  section: 3, subsection: 'Water Management', title: 'A water risk assessment carried out within the past 6 years.', type: 'G', categories: ['HH', 'CHP', 'CC', 'A'] },
  { id: '3.10', section: 3, subsection: 'Water Management', title: 'Rainwater and/or AC condensate collected and used for suitable purposes.', type: 'G', categories: ALL },
  { id: '3.11', section: 3, subsection: 'Water Management', title: 'Water flow in all handwashing taps is maximum 5 L/min.', type: 'G', categories: ALL },
  { id: '3.12', section: 3, subsection: 'Water Management', title: 'All public handwashing taps equipped with automatic water cut-off.', type: 'G', categories: ['HH', 'CHP', 'CC', 'R', 'A'] },
  { id: '3.13', section: 3, subsection: 'Water Management', title: 'No bathtubs, jacuzzi/spa or private pools in guest rooms and suites.', type: 'G', categories: ['HH', 'SA', 'CHP'] },
  { id: '3.14', section: 3, subsection: 'Water Management', title: 'Major outdoor water-using systems have evaporation-reduction measures.', type: 'G', categories: ['HH', 'CHP', 'SA', 'A'] },
  { id: '3.15', section: 3, subsection: 'Water Pollution', title: 'All wastewater is treated.', type: 'I', categories: ALL },
  { id: '3.16', section: 3, subsection: 'Water Pollution', title: 'At least 1 grease trap installed in professional/commercial kitchens.', type: 'I', categories: ALL },
  { id: '3.17', section: 3, subsection: 'Water Pollution', title: 'Reuses treated wastewater from on-site or authorised external systems.', type: 'G', categories: ALL },

  // ── 4. ENERGY & CARBON ──────────────────────────────────────────
  { id: '4.1',  section: 4, subsection: 'Energy Management', title: 'Energy use by source recorded at least once a month.', type: 'I', categories: ALL },
  { id: '4.2',  section: 4, subsection: 'Energy Management', title: 'Sets a standard temperature for cooling and heating.', type: 'I', categories: ALL, note: 'Generally ≤22 °C cooling / heating threshold within comfort ranges.' },
  { id: '4.3',  section: 4, subsection: 'Energy Management', title: 'Automatic/manual procedure to turn off lights & appliances in unoccupied rooms.', type: 'I', categories: ['HH', 'CHP', 'CC'] },
  { id: '4.4',  section: 4, subsection: 'Energy Management', title: 'Produces/purchases ≥50% of heating & cooling energy from renewable sources.', type: 'G', categories: ALL },
  { id: '4.5',  section: 4, subsection: 'Energy Management', title: 'Produces/purchases all heating & cooling energy from renewable sources.', type: 'G', categories: ALL },
  { id: '4.6',  section: 4, subsection: 'Energy Management', title: 'Produces/purchases ≥50% renewable and/or eco-labelled electricity.', type: 'G', categories: ALL },
  { id: '4.7',  section: 4, subsection: 'Energy Management', title: 'Produces/purchases only renewable and/or eco-labelled electricity.', type: 'G', categories: ALL },
  { id: '4.8',  section: 4, subsection: 'Energy Management', title: '75% of windows energy efficient above national/local regulation.', type: 'G', categories: ALL },
  { id: '4.9',  section: 4, subsection: 'Energy Management', title: 'An external energy audit conducted at least once every 6 years.', type: 'G', categories: ALL },
  { id: '4.10', section: 4, subsection: 'Energy Management', title: 'At least 1 sustainable insulation measure implemented.', type: 'G', categories: ALL },
  { id: '4.11', section: 4, subsection: 'Energy Management', title: 'Separate meters installed at strategically important places for energy monitoring.', type: 'G', categories: ['HH', 'CHP', 'CC', 'R', 'A'] },
  { id: '4.12', section: 4, subsection: 'HVAC, Equipment & Lights', title: 'Control systems in place for ventilation, comfort heating and cooling.', type: 'I', categories: ALL },
  { id: '4.13', section: 4, subsection: 'HVAC, Equipment & Lights', title: 'Ventilation, heating and cooling systems checked and maintained at least yearly.', type: 'I', categories: ALL },
  { id: '4.14', section: 4, subsection: 'HVAC, Equipment & Lights', title: 'At least 80% of all light bulbs are LED or equal/superior efficiency.', type: 'I', categories: ALL },
  { id: '4.15', section: 4, subsection: 'HVAC, Equipment & Lights', title: 'Outdoor lighting minimised and/or has automatic turn-off sensors.', type: 'I', categories: ALL },
  { id: '4.16', section: 4, subsection: 'HVAC, Equipment & Lights', title: 'Newly purchased electronic devices rated energy efficient.', type: 'I/G', categories: ALL, imperativeFor: ['HH', 'CHP', 'SA'] },
  { id: '4.17', section: 4, subsection: 'HVAC, Equipment & Lights', title: 'Newly purchased mini bars ≤0.6 kWh/day or rated energy efficient.', type: 'I', categories: ['HH'] },
  { id: '4.18', section: 4, subsection: 'HVAC, Equipment & Lights', title: 'Refrigeration and thermal equipment regularly maintained.', type: 'I', categories: ALL },
  { id: '4.19', section: 4, subsection: 'HVAC, Equipment & Lights', title: 'Newly purchased refrigeration/HVAC uses refrigerants free of HCFCs/CFCs.', type: 'I', categories: ALL },
  { id: '4.20', section: 4, subsection: 'HVAC, Equipment & Lights', title: 'Annual leak check for refrigerant systems; refrigerant refills recorded.', type: 'I', categories: ['HH', 'CHP', 'CC', 'R', 'A'] },
  { id: '4.21', section: 4, subsection: 'HVAC, Equipment & Lights', title: 'A heat or cooling recovery system is installed.', type: 'G', categories: ALL },
  { id: '4.22', section: 4, subsection: 'HVAC, Equipment & Lights', title: 'Ventilation, heating and/or cooling is demand controlled.', type: 'G', categories: ALL },
  { id: '4.23', section: 4, subsection: 'HVAC, Equipment & Lights', title: 'HVAC automatically switches off in rooms when windows/doors are open.', type: 'G', categories: ['HH', 'CC', 'R'] },
  { id: '4.24', section: 4, subsection: 'HVAC, Equipment & Lights', title: 'Lighting in public and staff areas has motion detectors, timers or reduction.', type: 'G', categories: ALL },
  { id: '4.25', section: 4, subsection: 'HVAC, Equipment & Lights', title: 'Mini bars / mini refrigerators absent in ≥90% of guest rooms.', type: 'G', categories: ['HH'] },
  { id: '4.26', section: 4, subsection: 'HVAC, Equipment & Lights', title: 'Offers access to charge electric vehicles.', type: 'G', categories: ALL },
  { id: '4.27', section: 4, subsection: 'Greenhouse Gas', title: 'Calculates Scope 1 & 2 GHG emissions (GHG Protocol-aligned).', type: 'I/G', categories: ALL, imperativeFor: ['HH', 'CHP', 'CC', 'A'] },
  { id: '4.28', section: 4, subsection: 'Greenhouse Gas', title: 'Calculates and reports Scope 3 GHG emissions (GHG Protocol-aligned).', type: 'G', categories: ['HH', 'CHP', 'CC', 'A'] },
  { id: '4.29', section: 4, subsection: 'Greenhouse Gas', title: 'Sets and annually reviews a concrete carbon-footprint reduction target.', type: 'G', categories: ALL },

  // ── 5. WASTE ────────────────────────────────────────────────────
  { id: '5.1',  section: 5, subsection: 'Waste Management', title: 'Waste separated per legislation and into ≥3 recyclable categories; staff instructed.', type: 'I', categories: ALL },
  { id: '5.2',  section: 5, subsection: 'Waste Management', title: 'All separated waste categories handled individually after collection.', type: 'I', categories: ALL },
  { id: '5.3',  section: 5, subsection: 'Waste Management', title: 'Guests offered practical means to separate waste into ≥3 categories.', type: 'I', categories: ['HH', 'CHP', 'SA', 'CC', 'A'] },
  { id: '5.4',  section: 5, subsection: 'Waste Management', title: 'Hazardous chemicals and waste managed, stored and transported safely.', type: 'I', categories: ALL },
  { id: '5.5',  section: 5, subsection: 'Waste Management', title: 'A waste bin available close to every toilet.', type: 'I', categories: ALL },
  { id: '5.6',  section: 5, subsection: 'Waste Management', title: 'Records total, residual/mixed and food waste.', type: 'I/G', categories: ALL, imperativeFor: ['HH', 'CHP', 'CC', 'R', 'A'] },
  { id: '5.7',  section: 5, subsection: 'Waste Management', title: 'Organic waste composted or used for other purposes.', type: 'G', categories: ALL },
  { id: '5.8',  section: 5, subsection: 'Waste Reduction', title: 'No single-use food-service items used for in-house F&B services.', type: 'I', categories: ALL },
  { id: '5.9',  section: 5, subsection: 'Waste Reduction', title: 'No more than 5 types of F&B products in individually packaged single servings.', type: 'I', categories: ALL },
  { id: '5.10', section: 5, subsection: 'Waste Reduction', title: 'Soap, shampoo, conditioner and shower gel provided in dispensers.', type: 'I', categories: ALL },
  { id: '5.11', section: 5, subsection: 'Waste Reduction', title: 'Vanity kits and single-use amenities available in max 50% of guest rooms.', type: 'I', categories: ['HH', 'CHP', 'SA'] },
  { id: '5.12', section: 5, subsection: 'Waste Reduction', title: 'For take-away F&B, guests can bring their own or use returnable containers.', type: 'G', categories: ALL },
  { id: '5.13', section: 5, subsection: 'Waste Reduction', title: 'Bed/bathroom linen not disposable and not delivered in plastic.', type: 'G', categories: ['HH', 'CHP', 'SA'] },

  // ── 6. PROCUREMENT ──────────────────────────────────────────────
  { id: '6.1',  section: 6, subsection: 'Administration / Other Procurement', title: 'Implements and follows a Sustainable Procurement Policy.', type: 'I', categories: ALL },
  { id: '6.2',  section: 6, subsection: 'Administration / Other Procurement', title: 'Informs third-party shops/businesses on-site about sustainability and Green Key.', type: 'I', categories: ALL },
  { id: '6.3',  section: 6, subsection: 'Administration / Other Procurement', title: '≥75% of newly purchased printing paper / paper-based materials eco-labelled.', type: 'I', categories: ALL },
  { id: '6.4',  section: 6, subsection: 'Administration / Other Procurement', title: 'Takes ≥2 initiatives to reduce paper use at front desk, offices and rooms.', type: 'I', categories: ['HH', 'CHP', 'SA', 'CC', 'A'] },
  { id: '6.5',  section: 6, subsection: 'Administration / Other Procurement', title: '≥1 product category of newly purchased/rented textiles is socially/environmentally certified.', type: 'I/G', categories: ['HH', 'CHP', 'SA', 'CC', 'R'], imperativeFor: ['HH'] },
  { id: '6.6',  section: 6, subsection: 'Administration / Other Procurement', title: 'At least 50% of suppliers are eco-certified.', type: 'G', categories: ALL },
  { id: '6.7',  section: 6, subsection: 'Administration / Other Procurement', title: 'Outsourced laundry within 100 km or eco-certified.', type: 'G', categories: ALL },
  { id: '6.8',  section: 6, subsection: 'Administration / Other Procurement', title: '≥75% of owned/rented vehicles are electric or cargo-bikes.', type: 'G', categories: ALL },
  { id: '6.9',  section: 6, subsection: 'Administration / Other Procurement', title: 'Actively promotes sustainable, health-conscious commuting for staff.', type: 'G', categories: ALL },
  { id: '6.10', section: 6, subsection: 'Administration / Other Procurement', title: 'Takes initiatives to reduce the environmental impact of IT systems.', type: 'G', categories: ALL },
  { id: '6.11', section: 6, subsection: 'Administration / Other Procurement', title: 'Furniture, fixtures and supplies refurbished, upcycled or donated.', type: 'G', categories: ALL },
  { id: '6.12', section: 6, subsection: 'Food & Beverage', title: 'Purchases & promotes organic / eco-labelled / fair-trade / local F&B categories.', type: 'I', categories: ALL, note: '≥5 qualifying products (10 for restaurants) across ≥5 categories.' },
  { id: '6.13', section: 6, subsection: 'Food & Beverage', title: 'Does not purchase fish, seafood or meat from threatened/protected species.', type: 'I', categories: ALL },
  { id: '6.14', section: 6, subsection: 'Food & Beverage', title: '≥1 vegetarian starter, 1 vegetarian main and a vegan option, clearly indicated.', type: 'I', categories: ALL },
  { id: '6.15', section: 6, subsection: 'Food & Beverage', title: 'Takes initiatives to reduce the level of food waste.', type: 'I', categories: ALL },
  { id: '6.16', section: 6, subsection: 'Food & Beverage', title: 'Where water quality is adequate, tap water is offered to guests.', type: 'I', categories: ALL },
  { id: '6.17', section: 6, subsection: 'Food & Beverage', title: '≥10% of all F&B products organic / eco-labelled / fair-trade / local.', type: 'G', categories: ALL },
  { id: '6.18', section: 6, subsection: 'Food & Beverage', title: '≥25% of all F&B products organic / eco-labelled / fair-trade / local.', type: 'G', categories: ALL },
  { id: '6.19', section: 6, subsection: 'Food & Beverage', title: '≥30% vegetarian dishes, or ≥1 vegetarian/vegan day per week.', type: 'G', categories: ALL },
  { id: '6.20', section: 6, subsection: 'Food & Beverage', title: 'Offers at least 1 vegan starter, 1 vegan main and 1 vegan dessert.', type: 'G', categories: ALL },
  { id: '6.21', section: 6, subsection: 'Washing & Cleaning', title: 'Bed linen and towels not changed daily by default; procedures displayed.', type: 'I', categories: ['HH', 'CHP', 'SA'] },
  { id: '6.22', section: 6, subsection: 'Washing & Cleaning', title: 'Guests can forego housekeeping or select partial cleaning.', type: 'I', categories: ['HH', 'SA'] },
  { id: '6.23', section: 6, subsection: 'Washing & Cleaning', title: '≥75% of routine chemical cleaning products carry a recognised eco-label.', type: 'I', categories: ALL },
  { id: '6.24', section: 6, subsection: 'Washing & Cleaning', title: 'Disinfection substances restricted to clear hygiene/health-critical risk.', type: 'I', categories: ALL },
  { id: '6.25', section: 6, subsection: 'Washing & Cleaning', title: 'All tissue paper products are eco-labelled.', type: 'I', categories: ALL },
  { id: '6.26', section: 6, subsection: 'Washing & Cleaning', title: 'All dishwashing detergents and rinsing agents carry a recognised eco-label.', type: 'G', categories: ALL },
  { id: '6.27', section: 6, subsection: 'Washing & Cleaning', title: 'All laundry detergents carry a recognised eco-label.', type: 'G', categories: ALL },
  { id: '6.28', section: 6, subsection: 'Washing & Cleaning', title: 'Concentrated cleaning products and a safe dilution system used for routine cleaning.', type: 'G', categories: ALL },
  { id: '6.29', section: 6, subsection: 'Washing & Cleaning', title: 'All cosmetic products carry a recognised eco-label.', type: 'G', categories: ALL },
  { id: '6.30', section: 6, subsection: 'Washing & Cleaning', title: 'Reduced-chemical or chemical-free cleaning methods used.', type: 'G', categories: ['HH', 'CHP', 'SA', 'CC', 'R', 'A'] },
  { id: '6.31', section: 6, subsection: 'Washing & Cleaning', title: 'Only fragrance- and perfume-free products used in washing/cleaning/room care.', type: 'G', categories: ALL },

  // ── 7. LIVING ENVIRONMENT ───────────────────────────────────────
  { id: '7.1',  section: 7, subsection: 'Indoor Environment', title: 'Indoor restaurants non-smoking; other public areas non-smoking or clearly separated.', type: 'I', categories: ALL },
  { id: '7.2',  section: 7, subsection: 'Indoor Environment', title: 'All meeting and guest rooms are non-smoking.', type: 'I', categories: ['HH', 'CHP', 'SA', 'CC', 'A'] },
  { id: '7.3',  section: 7, subsection: 'Indoor Environment', title: 'Personnel policy concerning smoking during working hours.', type: 'I', categories: ALL },
  { id: '7.4',  section: 7, subsection: 'Indoor Environment', title: 'Indoor air quality monitored at least yearly in ≥2 parts of the establishment.', type: 'G', categories: ALL },
  { id: '7.5',  section: 7, subsection: 'Indoor Environment', title: 'Authentic local culture incorporated in operations or refurbishments/construction.', type: 'G', categories: ALL },
  { id: '7.6',  section: 7, subsection: 'Indoor Environment', title: 'Environmental & biodiversity impacts assessed before new development/major works.', type: 'G', categories: ALL },
  { id: '7.7',  section: 7, subsection: 'Indoor Environment', title: 'Sustainable materials used for refurbishments/construction in the past 24 months.', type: 'G', categories: ALL },
  { id: '7.8',  section: 7, subsection: 'Biodiversity Protection', title: 'Use of agrochemical products minimised and strictly controlled (IPM).', type: 'I', categories: ALL },
  { id: '7.9',  section: 7, subsection: 'Biodiversity Protection', title: 'Newly purchased garden maintenance equipment is electric or manual.', type: 'I', categories: ALL, note: 'Imperative for ≤4,000 m² lawn; guideline for larger areas.' },
  { id: '7.10', section: 7, subsection: 'Biodiversity Protection', title: 'Green-area maintenance follows the principles of ecological management.', type: 'I', categories: ALL },
  { id: '7.11', section: 7, subsection: 'Biodiversity Protection', title: 'Takes initiatives to protect and support local biodiversity on/around premises.', type: 'I', categories: ALL },
  { id: '7.12', section: 7, subsection: 'Biodiversity Protection', title: 'Assesses biodiversity and nature-related risks and opportunities on-site.', type: 'G', categories: ['HH', 'CHP', 'SA', 'CC', 'A'] },
  { id: '7.13', section: 7, subsection: 'Biodiversity Protection', title: 'Monitors biodiversity-supporting habitats and species on/around premises.', type: 'G', categories: ALL },
  { id: '7.14', section: 7, subsection: 'Biodiversity Protection', title: 'Takes ≥1 green-area initiative to promote sustainable food practices.', type: 'G', categories: ALL },
]

// ── Helpers ─────────────────────────────────────────────────────────
export function isImperativeFor(c: Criterion, cat: EstablishmentCategory): boolean {
  if (c.type === 'I') return true
  if (c.type === 'G') return false
  return !!c.imperativeFor?.includes(cat)
}

export function criteriaForCategory(cat: EstablishmentCategory): Criterion[] {
  return GK_CRITERIA.filter(c => c.categories.includes(cat))
}

export function countsForCategory(cat: EstablishmentCategory) {
  const applicable = criteriaForCategory(cat)
  const imperative = applicable.filter(c => isImperativeFor(c, cat)).length
  const guideline = applicable.length - imperative
  return { total: applicable.length, imperative, guideline }
}
