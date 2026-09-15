// Client-safe site settings type + defaults (no server imports).

export interface SiteSettings {
  contact_email: string
  contact_phone: string
  contact_person: string
  whatsapp: string
  address_en: string
  address_ar: string
  hours_en: string
  hours_ar: string
  instagram: string | null
  x_url: string | null
  linkedin: string | null
}

// Defaults mirror the values that were hard-coded before the CMS — used until
// the operator saves, and as a fallback if the table/row is missing.
export const DEFAULT_SETTINGS: SiteSettings = {
  contact_email: 'info@feebureaukw.org',
  contact_phone: '+965 64449334',
  contact_person: 'Mona El Rez',
  whatsapp: '96564449334',
  address_en: 'First Mall, 3rd Floor, Office 11, Salem Al Mubarak Street, Salmiya, Kuwait',
  address_ar: 'المجمع الأول، الطابق الثالث، مكتب 11، شارع سالم المبارك، السالمية، الكويت',
  hours_en: 'Sun to Thu: 8:00 AM to 4:00 PM',
  hours_ar: 'الأحد إلى الخميس: 8:00 ص إلى 4:00 م',
  instagram: null, x_url: null, linkedin: null,
}
