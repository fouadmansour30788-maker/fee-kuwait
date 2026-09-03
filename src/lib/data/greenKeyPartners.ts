// Green Key International partner logos, grouped by category. Sourced from the
// official "Green Key Partners" deck. Each logo is mapped to its partner name by
// its position on the source slide (verified against the deck), so captions and
// alt text are correct. One logo (the multicolour tree in OTAs & Web) could not
// be confidently identified and is left without a caption.

export interface GkPartner {
  name: string
  logo: string
}
export interface GkPartnerGroup {
  id: string
  title_en: string
  title_ar: string
  partners: GkPartner[]
}

const base = '/partners/gk'
const p = (logo: string, name = ''): GkPartner => ({ name, logo: `${base}/${logo}` })

export const GK_PARTNER_GROUPS: GkPartnerGroup[] = [
  {
    id: 'hotels',
    title_en: 'Hotel Chains & Tour Operators',
    title_ar: 'سلاسل الفنادق ومشغلو الرحلات',
    partners: [
      p('image9.png', 'Accor'),
      p('image15.jpeg', 'BWH Hotels'),
      p('image5.png', 'Radisson Hotel Group'),
      p('image16.png', 'Four Seasons'),
      p('image12.png', 'Motel One'),
      p('image6.png', 'NH Hotel Group'),
      p('image19.png', 'Choice Hotels'),
      p('image10.jpeg', 'IHG Hotels & Resorts'),
      p('image17.jpeg', 'Hyatt'),
      p('image7.png', 'Historic Hotels of Europe'),
      p('image11.png', 'Ennismore'),
      p('image18.png', 'Corendon'),
      p('image8.png', 'Aurinko'),
      p('image13.png', 'Jet2holidays'),
    ],
  },
  {
    id: 'corporate',
    title_en: 'Corporate Partners',
    title_ar: 'الشركاء من الشركات',
    partners: [
      p('image20.png', 'Green Care Professional'),
      p('image24.jpeg', 'Ecolab'),
      p('image22.png', 'Control Union'),
      p('image23.png', 'Divello'),
      p('image21.png', 'Beirholm'),
      p('image25.jpeg', 'Diversey'),
      p('image26.png', 'SGS'),
    ],
  },
  {
    id: 'ota',
    title_en: 'OTAs & Web Partners',
    title_ar: 'وكالات السفر الإلكترونية وشركاء الويب',
    partners: [
      p('image30.png', 'Expedia'),
      p('image31.png', 'Booking.com'),
      p('image35.png', 'Susty'),
      p('image37.png', 'travganic'),
      p('image49.png'),
      p('image36.jpeg', 'ehotel'),
      p('image45.png', 'eventplanner'),
      p('image47.png', 'TROOP'),
      p('image33.png', 'Select Green Hotels'),
      p('image48.png', 'FairWeg'),
      p('image42.png', 'HRS'),
      p('image41.png', 'bookdifferent'),
      p('image39.png', 'TiCATi'),
      p('image53.png', 'TripDoodler'),
      p('image44.png', 'The Green Wall'),
      p('image46.png', 'Apollo'),
      p('image32.jpeg', 'ECO TRANS'),
      p('image52.png', 'Meeting Select'),
      p('image54.png', 'The Greenshot'),
      p('image55.png', 'Eco Hotels.com'),
      p('image51.png', 'hubli'),
      p('image38.png', 'hotelbeds'),
      p('image43.png', 'Ecobnb'),
      p('image50.png', 'Global Hotel Alliance'),
      p('image40.png', 'glooby'),
      p('image29.png', 'Bidroom'),
      p('image27.jpeg', 'ethik&trips'),
      p('image28.png', 'SQUAKE'),
      p('image34.png', 'Travalyst'),
    ],
  },
  {
    id: 'ngo',
    title_en: 'NGOs & Institutional Partners',
    title_ar: 'المنظمات غير الحكومية والشركاء المؤسسيون',
    partners: [
      p('image62.png', 'UN Tourism'),
      p('image56.png', 'University of Surrey'),
      p('image63.png', 'Tourism Sustainability Certifications Alliance (TSC)'),
      p('image59.jpeg', 'UN Decade on Ecosystem Restoration'),
      p('image61.png', 'World Sustainable Hospitality Alliance'),
      p('image57.png', 'EKOenergy'),
      p('image58.png', 'Caribbean Hotel & Tourism Association'),
      p('image60.png', 'The University of the West Indies'),
    ],
  },
]
