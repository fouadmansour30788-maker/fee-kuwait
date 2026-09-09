// FEE global corporate & institutional partners, with logos sourced from
// fee.global (/corporate-partners and /institutional-partners) and hosted locally.

import type { GkPartnerGroup } from './greenKeyPartners'

const base = '/partners/fee'
const p = (logo: string, name: string) => ({ name, logo: `${base}/${logo}` })

export const FEE_PARTNER_GROUPS: GkPartnerGroup[] = [
  {
    id: 'fee-corporate',
    title_en: 'FEE Corporate Partners',
    title_ar: 'شركاء FEE من الشركات',
    partners: [
      p('ppg.png', 'PPG'),
      p('mars-wrigley.png', 'Mars Wrigley Foundation'),
      p('synopsys.png', 'Synopsys'),
      p('podio.png', 'Podio'),
    ],
  },
  {
    id: 'fee-institutional',
    title_en: 'FEE Institutional Partners',
    title_ar: 'شركاء FEE المؤسسيون',
    partners: [
      p('chta.png', 'Caribbean Hotel & Tourism Association'),
      p('earth-charter.jpeg', 'The Earth Charter'),
      p('enat.gif', 'European Network for Accessible Tourism (ENAT)'),
      p('gadrrres.jpg', 'GADRRRES'),
      p('gerics.jpg', 'Climate Service Center Germany (GERICS)'),
      p('helvellyn.png', 'The Helvellyn Foundation'),
      p('heg.png', 'Higher Education For Good Foundation'),
      p('iclei.png', 'ICLEI – Local Governments for Sustainability'),
      p('oce.png', 'The Office for Climate Education (OCE)'),
      p('pti.png', "Prince's Trust International"),
      p('rainforest.jpg', 'Rainforest Partnership'),
      p('sow-my-dream.png', 'Sow my Dream'),
      p('wsha.png', 'World Sustainable Hospitality Alliance'),
      p('un-decade.png', 'UN Decade on Ecosystem Restoration'),
      p('un-tourism.png', 'World Tourism Organization (UN Tourism)'),
      p('uwi.png', 'University of the West Indies — Faculty of Social Sciences'),
      p('wca.png', 'World Cetacean Alliance'),
    ],
  },
]
