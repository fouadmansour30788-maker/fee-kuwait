// ── Green Key Evidence Matrix 2026-2031 ─────────────────────────────
// Per-criterion evidence to upload before the audit, the audit method, whether
// upload is required, and accepted formats. Source: official "Green Key Evidence
// Matrix" (all imperative criteria). Surfaced on the criteria board so the
// establishment knows exactly what to attach for each indicator.

export type UploadRequirement = 'Yes' | 'Voluntary' | 'Conditional' | 'No'

export interface GKEvidence {
  method: string
  upload: string
  required: UploadRequirement
  format: string
}

export const GK_EVIDENCE: Record<string, GKEvidence> = {
  "1.11": {
    "method": "Document review + sampling",
    "upload": "1. Evidence of staff awareness and training on accessibility procedures;\r\n2. availability of information about accessibility on the website.\r\n3. Where the establishment provides access for people with cognitive disabilities needs or hearing impairments, an accessibility plan outlining how these needs are addressed is presented.",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "1.14": {
    "method": "Document review (+ visual inspection, if applicable)",
    "upload": "1. written confirmation that it has read, understood and follows animal welfare practices based on ABTA’s latest guidelines and in conformity with national animal welfare laws OR the written Standard Operating Procedure (SOP) for the maintenance of and care for the animals including a checklist based on the Five Domains); \r\n2. records of annual veterinary assessments confirming the animals’ health and well-being",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "1.2": {
    "method": "Document review",
    "upload": "Sustainability targets document (and supporting evidence, if applicable).",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "1.20": {
    "method": "Document review +  Interview",
    "upload": "Documents, or presentations, or screenshots or exports from digital platforms outlining:\r\n1. which topics were covered; \r\n2. participating department(s);\r\n3. the date of provision. \r\n\r\nEstablishments with fewer than 5 staff members: no documents, only interview.",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "1.21": {
    "method": "Document review + Interview",
    "upload": "Document detailing:\r\n1. which training topics were covered; \r\n2. which departments received training (specifying the role of specific staff members, if the training is not provided to the full department); \r\n3. the date(s) of provision and training duration (one day, monthly etc.);\r\n4. the format of training (internal/external, online, etc.).\r\n\r\nIn specific circumstances, for first-time applicants: a written draft of the training plan and commits to follow it within the first certification period (24 months).",
    "required": "Yes",
    "format": "PDF/XLS/DOC"
  },
  "1.3": {
    "method": "Document review",
    "upload": "Action plan (and supporting evidence, if applicable).",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "1.5": {
    "method": "Document review",
    "upload": "Signed declaration",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "1.6": {
    "method": "Document review + Interview",
    "upload": "1. written grievance and whistleblower procedure\r\n2. confirmation of an anonymous or confidential reporting channel, such as a link to an external whistleblower platform or documentation of an equivalent third-party mechanism",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "1.7": {
    "method": "Document review",
    "upload": "1. written health and safety policies \r\n2. emergency plans",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "1.8": {
    "method": "Document review",
    "upload": "a. establishments with more than 50 employees: supporting evidence of at least 2 active cooperations (e.g. meeting minutes, activity reports, co-developed materials) and documented interaction, as applicable.\r\nb. establishments with less than 50 employees: supporting evidence of at least 1 cooperation (e.g. meeting minutes, activity reports, co-developed materials) and documented interaction, as applicable.\r\nc. first-time applicants: cooperation contracts/agreements and planned actions.",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "1.9": {
    "method": "Document review (+ if applicable interview)",
    "upload": "1. Overview of the assessment identifying Indigenous Peoples, cultural assets, and heritage sites \r\n2.Justified explanation (if the assessment shows that none are present)\r\n\r\nDepending on the outcome of the mapping:\r\na) examples of guest-facing materials\r\nb) evidence of consultation with Indigenous people e.g. to demonstrate how the essence of traditional rituals, dance or ceremonies is preserved\r\nc) site maps, zoning conformity documentation, and agreements (FPIC) with Indigenous people \r\nd) in cases of re-design of community spaces or biodiversity-related initiatives: documentation of any biodiversity-related or community-based initiatives (e.g. design plans, project descriptions) that show the integration of traditional ecological knowledge and inclusive planning processes; and/or, where relevant, confirmation that public-facing services (e.g. medical facilities, shops) are accessible to Indigenous people.",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "2.5": {
    "method": "Document review",
    "upload": "",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "3.1": {
    "method": "Document review + Sampling",
    "upload": "Monthly data entered in platform table (source documents such as bills not uploaded unless specifically requested).\r\n\r\nIn specific circumstances (read explanatory note), the establishment presents the estimated data and the methodology of estimation, where monthly data are not accessible.",
    "required": "Yes",
    "format": "Structured digital table / Excel import"
  },
  "3.15": {
    "method": "Document review + visual inspection",
    "upload": "a) If the establishment is connected to a sewage system: licence, written confirmation from the relevant authority or other proof of connection (e.g. utility invoices, service contracts, third-party verification).\r\n\r\nb) If the establishment uses an on-site system: evidence of legal authorisation and effective operation, such as a valid installation/operating permit, licence or written confirmation from the relevant authority, and maintenance records. If such a licence is not delivered by any authority, the establishment submits recent water quality test results (e.g. BOD, pH, turbidity) demonstrating that the system treats wastewater effectively and in accordance with national or international discharge or reuse standards.",
    "required": "Yes",
    "format": "PDF/DOC/photo/link as applicable"
  },
  "3.16": {
    "method": "Document review + visual inspection",
    "upload": "Re-applicants: records or invoices for grease trap cleanings from the full last 2 calendar years \r\n\r\nFirst-time applicants: present records or invoices from the last full calendar year",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "3.2": {
    "method": "Document review + sampling",
    "upload": "1. Written SOP for checking water outlets according to the above frequency;\r\n2. if leaking water outlets have been observed, the establishment presents the incident log and corrective actions after observing the leaks.",
    "required": "Yes",
    "format": "PDF/DOC/XLS"
  },
  "3.3": {
    "method": "Document review + sampling",
    "upload": "Overview of self checks of shower water flow (80% of total number for new applicants, 50% re-applicants).",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "3.4": {
    "method": "Document review + sampling",
    "upload": "Overview of self checks of handwashing taps water flow (80% of total number for new applicants, 50% re-applicants).",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "3.6": {
    "method": "Document review",
    "upload": "Invoices",
    "required": "Yes",
    "format": "PDF/photo"
  },
  "3.7": {
    "method": "Document review",
    "upload": "1. List of appliances purchased within the past 24 months (for re-applicants) or within the past 6 months (for first-time applicants); \r\n2. corresponding water consumption specifications (e.g. technical specifications, efficiency ratings/labels or supplier data showing litres per cycle or per kg linen).",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "4.1": {
    "method": "Document review + sampling",
    "upload": "Monthly data entered in platform table (source documents such as bills not uploaded unless specifically requested).\r\n\r\nIn specific circumstances (read explanatory note), the establishment presents the estimated data and the methodology of estimation, where monthly data are not accessible.",
    "required": "Yes",
    "format": "Structured digital table / Excel import"
  },
  "4.13": {
    "method": "Document review",
    "upload": "1. Maintenance protocol or written Standard Operating Procedure (SOP) describing the systems, check frequency, responsible personnel, and repair timeframe; \r\n2. reports or checklists from the last 12 months (internal or external).",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "4.14": {
    "method": "Document review + sampling",
    "upload": "Document indicating estimated number of installed light bulbs and the type (e.g. LED, CFL), or invoices, demonstrating conformity with the 80% threshold.",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "4.16": {
    "method": "Document review",
    "upload": "1. A list or invoices of electronic devices purchased within the 24 months (for re-applicants) or 6 months (for first-time applicants), including purchase date, brand/model, location (e.g. room number or block); and \r\n2. A technical specification sheets or energy labels showing daily energy consumption in kWh/day, or classification in a recognised national energy label scheme. \r\n\r\nWhere no energy label is available: the establishment presents a short market comparison of a minimum of 3 comparable products, showing that the selected model has lower or equal energy consumption than other comparable products available at the time of purchase.",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "4.17": {
    "method": "Document review (+ sampling if needed)",
    "upload": "1. A list of mini bar units purchased within the past 24 months (for re-applicants) or 6 months (for first-time applicants), including purchase date, brand/model, location (e.g. room number or block); \r\n2. technical specification sheets or energy labels showing daily energy consumption in kwh/day, or classification in a recognised national energy label scheme. \r\n\r\nWhere no energy label is available: a short market comparison of a minimum of 3 comparable products, showing that the selected model has lower or equal energy consumption than other comparable products available at the time of purchase.",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "4.19": {
    "method": "Document review",
    "upload": "Documentation (e.g. technical datasheets, purchase records, system specifications) confirming that all refrigeration, heating, cooling, and ventilation equipment purchased within the last 24 months (for re-applicants) or 6 months (for first-time applicants) conform with the requirements listed above.",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "4.2": {
    "method": "Document review + sampling",
    "upload": "SOP document for setting and managing temperature.\r\n\r\nWhere local standards or climatic adaptations apply: supporting documentation is provided.",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "4.27": {
    "method": "Document review",
    "upload": "Annual calculation results entered in platform table",
    "required": "Yes",
    "format": "Structured digital table / Excel import"
  },
  "4.3": {
    "method": "Document review + sampling",
    "upload": "SOP for managing energy use in guest and meeting rooms empty for short periods.",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "5.11": {
    "method": "Document review + sampling",
    "upload": "Standard Operating Procedure (SOP) clearly indicating which guest rooms are equipped with vanity kits and other single-use guest amenities, and which are not.",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "5.4": {
    "method": "Document review + visual inspection",
    "upload": "1. A list of hazardous chemicals and waste that is typically generated in the establishment \r\n\r\nand, depending how hazardous waste is transported, one of the following: \r\n\r\na) if transported by public authorities or private licensed companies: a contract or confirmation of cooperation with licensed collectors \r\nb) if transported by the establishment: a document showing the address and the type of dropping point (e.g. collective collection point, recycling centre etc.) or permits for self-transport of hazardous chemicals and waste\r\nc) if treatement of hazardous chemicals and waste are not regulation by national environmental legislation: a Standard Operating Procedure (SOP)  showing that the transportation of the hazardous chemicals and waste to the nearest approved reception facility is done safely",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "5.6": {
    "method": "Document review + visual inspection",
    "upload": "Monthly data entered in platform table (source documents such as bills not uploaded unless specifically requested).\r\n\r\nIn specific circumstances (read explanatory note), the establishment presents the estimated data and the methodology of estimation, where monthly data are not accessible.",
    "required": "Yes",
    "format": "Structured digital table / Excel import"
  },
  "6.1": {
    "method": "Document review",
    "upload": "Dated Sustainable Procurement Policy formally approved by management;",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.12": {
    "method": "Document review + sampling",
    "upload": "A list of a minimum of 5 or 10 (depending on the establishment’s category) F&B products that are certified or locally produced, covering at least 5 or 10 product categories, with indication of any certifications, eco-labels or other evidence confirming that the listed products are organic, eco-labelled, fair-trade labelled and/or locally produced. \r\n\r\nWhere applicable: the establishment presents justification for sourcing from specific local producers when beyond the 100 km limit",
    "required": "Yes",
    "format": "Structured digital table / Excel import"
  },
  "6.13": {
    "method": "Visual inspection",
    "upload": "A list identifying the species of fish seafood and meat used for menu items.",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.15": {
    "method": "Document review",
    "upload": "HH, CHP, CC, R, A: food waste reduction plan\r\n\r\nHH, CHP, SA, CC, R, A: supporting evidence of implemented actions",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.2": {
    "method": "Document review",
    "upload": "a) Information about third-party operated shops and businesses within its premises\r\n\r\nb) if services or facilities that are managed and owned by the same entity as the applicant establishment or operated under a contract (whereby management of the applicant establishment retains control of the service): the establishment presents the lease agreements containing a commitment to follow Green Key standards",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.23": {
    "method": "Document review + sampling",
    "upload": "List or invoices showing:\r\n1. the total quantity (in volume or weight) of chemical cleaning products used for routine cleaning in the past 24 or 6 months (depending on certification year); \r\n2. the products with an internationally or nationally recognised eco-label (and which one), to demonstrate conformity with the 75% threshold.",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.24": {
    "method": "Document review",
    "upload": "Standard Operating Procedure (SOP) or integrated cleaning/hygiene procedures, identifying which disinfection substances are used, where, and for what purpose.",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.3": {
    "method": "Document review + sampling",
    "upload": "List or invoices showing:\r\n1.  the total number of units of printing paper, envelopes and printed paper-based materials produced or ordered in the past 24 or 6 months (depending on certification year)\r\n2. the material that holds an internationally or nationally recognised eco-label (and which one)",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.4": {
    "method": "Document review + visual inspection",
    "upload": "Action plan describing the selected paper-reduction initiatives.",
    "required": "Yes",
    "format": "PDF/DOC/XLS"
  },
  "7.11": {
    "method": "Document review + sampling",
    "upload": "1. Standard Operating Procedure (SOP) for supporting the local biodiversity; \r\n2. record of the biodiversity interventions and evidence of bi-annual review (for re-applicants). \r\n\r\nIf an external company carries out maintenance: the contractor’s written policy on local biodiversity protection on the establishment’s grounds is presented.",
    "required": "Yes",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "7.3": {
    "method": "Document review + visual inspection",
    "upload": "Smoking policy for staff.",
    "required": "Yes",
    "format": "PDF/DOC/photo/link as applicable"
  },
  "1.1000000000000001": {
    "method": "Interview",
    "upload": "No upload required.\r\nName, surname and role of the Green Key Establishment Representative can be indicated in the comments.",
    "required": "Voluntary",
    "format": ""
  },
  "1.15": {
    "method": "Document review + Interview",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "1.16": {
    "method": "Document review + Visual inspection + Interview",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "1.17": {
    "method": "Document review + Visual inspection + Interview",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "1.18": {
    "method": "Document review + Visual inspection + Sampling/cross-check",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "1.19": {
    "method": "Document review + Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "1.22": {
    "method": "Interview",
    "upload": "No upload required.\r\n(policy/SOP provided under 6.2)",
    "required": "Voluntary",
    "format": ""
  },
  "1.23": {
    "method": "Document review + visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": ""
  },
  "1.24": {
    "method": "Document review + Visual inspection + Interview",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "1.4": {
    "method": "Document review + Interview + Sampling",
    "upload": "No upload required. The auditor reviews documentation on site.",
    "required": "Voluntary",
    "format": ""
  },
  "2.10": {
    "method": "Document review",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "2.11": {
    "method": "Document review + Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "2.4": {
    "method": "Interview",
    "upload": "",
    "required": "Voluntary",
    "format": ""
  },
  "2.6": {
    "method": "Document review",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "2.7": {
    "method": "Document review",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "2.8": {
    "method": "Document review",
    "upload": "",
    "required": "Voluntary",
    "format": ""
  },
  "2.9": {
    "method": "Document review",
    "upload": "",
    "required": "Voluntary",
    "format": ""
  },
  "3.10": {
    "method": "Document review + Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "3.11": {
    "method": "Document review + Visual inspection + Sampling/cross-check",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "3.12": {
    "method": "Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "3.13": {
    "method": "Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "3.14": {
    "method": "Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "3.17": {
    "method": "Document review + Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "3.5": {
    "method": "Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": ""
  },
  "3.8": {
    "method": "Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "3.9": {
    "method": "Document review",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "4.10": {
    "method": "Document review",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "4.11": {
    "method": "Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "4.15": {
    "method": "Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": ""
  },
  "4.18": {
    "method": "Document review + sampling",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS"
  },
  "4.21": {
    "method": "Document review",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "4.22": {
    "method": "Document review",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "4.23": {
    "method": "Document review + Visual inspection + Sampling/cross-check",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "4.24": {
    "method": "Document review + Visual inspection + Sampling/cross-check",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "4.25": {
    "method": "Document review + Visual inspection + Sampling/cross-check",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "4.26": {
    "method": "Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "4.28": {
    "method": "Document review",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "4.29": {
    "method": "Document review",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "4.4": {
    "method": "Document review + Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "4.5": {
    "method": "Document review + Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "4.6": {
    "method": "Document review",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "4.7": {
    "method": "Document review",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "4.8": {
    "method": "Document review + Visual inspection + Sampling/cross-check",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "4.9": {
    "method": "Document review",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "5.1": {
    "method": "Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "5.12": {
    "method": "Document review",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "5.13": {
    "method": "Document review + Visual inspection + Sampling/cross-check",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "5.3": {
    "method": "Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": ""
  },
  "5.5": {
    "method": "Sampling",
    "upload": "",
    "required": "Voluntary",
    "format": ""
  },
  "5.7": {
    "method": "Document review + Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "5.8": {
    "method": "Sampling",
    "upload": "",
    "required": "Voluntary",
    "format": ""
  },
  "5.9": {
    "method": "Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": ""
  },
  "6.10": {
    "method": "Document review + Visual inspection + Interview",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.11": {
    "method": "Document review",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.14": {
    "method": "Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": ""
  },
  "6.17": {
    "method": "Document review + Visual inspection + Sampling/cross-check",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.18": {
    "method": "Document review + Visual inspection + Sampling/cross-check",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.19": {
    "method": "Document review + Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.20": {
    "method": "Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.21": {
    "method": "Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": ""
  },
  "6.26": {
    "method": "Visual inspection + Sampling/cross-check",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.27": {
    "method": "Visual inspection + Sampling/cross-check",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.28": {
    "method": "Document review + Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.29": {
    "method": "Visual inspection + Sampling/cross-check",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.30": {
    "method": "Document review + Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.31": {
    "method": "Document review + Visual inspection + Sampling/cross-check",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.6": {
    "method": "Document review + Visual inspection + Sampling/cross-check",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.7": {
    "method": "Document review",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.8": {
    "method": "Document review + Visual inspection + Sampling/cross-check",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.9": {
    "method": "Document review",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "7.1": {
    "method": "Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": ""
  },
  "7.12": {
    "method": "Document review",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "7.13": {
    "method": "Document review",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "7.14": {
    "method": "Document review + Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "7.4": {
    "method": "Document review",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "7.5": {
    "method": "Document review",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "7.6": {
    "method": "Document review + Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "7.7": {
    "method": "Document review + Visual inspection",
    "upload": "",
    "required": "Voluntary",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "1.10": {
    "method": "Document review",
    "upload": "1.Written policy (stand-alone document or within CSR/Code of Business Conduct, if available)\r\n2. evidence of at least 1 implemented action from the below:\r\na) proof of DEI training completion and action taken; \r\nb) proof of promotion and support of the completion of basic education level amongst staff; \r\nc) recruitment or HR records showing fair process mechanisms e.g. anonymised screening templates, partnerships with local groups, (if chosen as 1 action);\r\nd) training and career development records (e.g. training calendars, participation records, or mentorship programme reports) to demonstrate that all employees have equal access to training, advancement and feedback (if chosen as 1 action); or \r\ne) number of promotions or role progression of staff due to implemented career development programme.",
    "required": "Conditional",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "1.12": {
    "method": "Document review + sampling",
    "upload": "If cultural heritage, historical and archaeological artefacts are displayed:\r\ndocumentation showing legal provenance and explaining how the display contributes to education or conservation awareness.",
    "required": "Conditional",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "1.13": {
    "method": "Document review (+ visual inspection, if applicable)",
    "upload": "where animal-related activities are offered, promoted or facilitated:\r\n1. a written statement, Standard Operating Procedure (SOP) or policy confirming that no entertainment, excursions, or activities that involve the exploitation of animals are offered, promoted or facilitated; \r\n2. the in-house entertainment plan for the guests (if applicable).",
    "required": "Conditional",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "2.1": {
    "method": "Document review",
    "upload": "First-time applicants: written draft of the standard information with indication of the proposed location for future display of the certificate and information.",
    "required": "Conditional",
    "format": "PDF/DOC//photo/link as applicable"
  },
  "2.2": {
    "method": "Document review",
    "upload": "First-time applicants:  a written draft of the website information.\r\n\r\nRe-applying establishments: information about Green Key on the website of the establishment.",
    "required": "Conditional",
    "format": "URL/screenshot/PDF"
  },
  "2.3": {
    "method": "Document review",
    "upload": "Policy/procedure/plan/records/photos/screenshots/agreements as applicable",
    "required": "Conditional",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "4.12": {
    "method": "Document review + visual inspection",
    "upload": "If manual systems are used: written procedures for controlling ventilation, heating, and cooling, shared with the relevant staff.",
    "required": "Conditional",
    "format": "PDF/DOC/photo/link as applicable"
  },
  "4.20": {
    "method": "Document review",
    "upload": "Refrigerant logs or reports showing the type and amount of any refrigerants refilled in the previous year. \r\n\r\nIf no refills occurre: official proof confirming inspection and conformity.",
    "required": "Conditional",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "5.10": {
    "method": "Sampling",
    "upload": "If semi-reusable bulk containers in larger sizes are used: the establishment provides evidence that the bulk containers are recycled, and the written SOP of the housekeeping include information that bottles can only be thrown out once completely empty; \r\n \r\nIf applicable: proof of conformity with national regulations.",
    "required": "Conditional",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "5.2": {
    "method": "Document review + visual inspection",
    "upload": "Depending on the type of waste handling arrangement (public entity, private entity or on-site): \r\na) public entity: an invoice or a contract from the past 24 months (for re-applicants) or 6 months (for first-time applicants), showing that the separated waste categories are collected and transported separately \r\nb) private entity: an invoice, and either a contract confirming that the waste categories are collected and transported separately for further handling, or a written confirmation from the private waste handling entity that the waste is collected and managed in accordance with environmental and health standards from the past 24 months (for re-applicants) or 6 months (for first-time applicants) \r\nc) treatement on.site by the establishment: risk assessment confirming that there are no adverse environmental or health impacts, and documentation showing that the waste is recycled or processed appropriately (e.g. Standard Operating Procedure (SOP) , composting procedures)",
    "required": "Conditional",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.16": {
    "method": "Visual inspection (+ document review if N/A)",
    "upload": "If N/A: \r\n1. legal exemption or water analysis;\r\n2. proof that the classification of the establishment demands that additional complimentary water is offered in the guest rooms (e.g. extract from classification checklist in combination with prove of classification approval).",
    "required": "Conditional",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.22": {
    "method": "Document review",
    "upload": "First-time applicants: draft of the text already during the application process.",
    "required": "Conditional",
    "format": "PDF/DOC/photo/link as applicable"
  },
  "6.25": {
    "method": "Sampling (+document review in specific case)",
    "upload": "If the establishment uses non-chlorine-bleached paper due to lack of eco-label availability: documented evidence of market unavailability.",
    "required": "Conditional",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "6.5": {
    "method": "Document review + sampling",
    "upload": "If the establishment has a valid textile rental or service contract in place before the introduction of this criterion: the contract with the textile rental service, its starting date and validity period.",
    "required": "Conditional",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "7.10": {
    "method": "Document review + sampling",
    "upload": "Where implementation cannot be fully verified through visual or photographic evidence alone, a short description or confirmation of how practices are implemented is included.\r\n\r\nIf an external company carries out maintenance, the contractor’s written policy on the maintenance of green areas on the establishment’s grounds is presented.",
    "required": "Conditional",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "7.2": {
    "method": "Visual inspection (+ document review if N/A)",
    "upload": "In countries where this is not feasible due to legislative or cultural requirements: t\r\n1. documentation (e.g. an overview or room inventory) showing that all meeting rooms and at least 75% of guest rooms are non-smoking; \r\n2. evidence of a plan for progressing towards 100% smoke-free guest rooms.",
    "required": "Conditional",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "7.8": {
    "method": "Document review + sampling",
    "upload": "Integrated Pest Management (IPM) approach or equivalent system, confirming agrochemical products are only applied due to clear necessity, as a last resort when no organic or natural alternatives are available\r\n\r\nIf agrochemicals are used: records of application, including the product name, purpose, dosage and frequency,\r\n\r\nIf an external company carries out maintenance: the contractor’s written policy on agrochemical uses in the establishment’s grounds.",
    "required": "Conditional",
    "format": "PDF/DOC/XLS/photo/link as applicable"
  },
  "7.9": {
    "method": "Document review",
    "upload": "If an external company carries out maintenance:\r\nthe contractor’s written policy on equipment/machinery uses on the establishment’s grounds following the above guidelines is presented",
    "required": "Conditional",
    "format": "PDF/DOC/photo/link as applicable"
  }
} as Record<string, GKEvidence>

export const UPLOAD_REQ_META: Record<UploadRequirement, { label: string; color: string; bg: string }> = {
  Yes:         { label: 'Required',    color: '#B91C1C', bg: '#FEE2E2' },
  Conditional: { label: 'If applicable', color: '#B45309', bg: '#FEF3C7' },
  Voluntary:   { label: 'Voluntary',   color: '#1D4ED8', bg: '#EFF6FF' },
  No:          { label: '',            color: '#64748B', bg: '#F1F5F9' },
}
