// Green Key International partner logos, grouped by category. Sourced from the
// official "Green Key Partners" deck. Logos are rendered as an image-only wall
// (the source provides no partner names), so each entry is just an asset path.

export interface GkPartnerGroup {
  id: string
  title_en: string
  title_ar: string
  logos: string[]
}

const base = '/partners/gk'

export const GK_PARTNER_GROUPS: GkPartnerGroup[] = [
  {
    id: 'hotels',
    title_en: 'Hotel Chains & Tour Operators',
    title_ar: 'سلاسل الفنادق ومشغلو الرحلات',
    logos: [
      'image5.png', 'image6.png', 'image7.png', 'image8.png', 'image9.png', 'image10.jpeg',
      'image11.png', 'image12.png', 'image13.png', 'image15.jpeg', 'image16.png', 'image17.jpeg',
      'image18.png', 'image19.png',
    ].map((f) => `${base}/${f}`),
  },
  {
    id: 'corporate',
    title_en: 'Corporate Partners',
    title_ar: 'الشركاء من الشركات',
    logos: [
      'image20.png', 'image21.png', 'image22.png', 'image23.png', 'image24.jpeg', 'image25.jpeg', 'image26.png',
    ].map((f) => `${base}/${f}`),
  },
  {
    id: 'ota',
    title_en: 'OTAs & Web Partners',
    title_ar: 'وكالات السفر الإلكترونية وشركاء الويب',
    logos: [
      'image27.jpeg', 'image28.png', 'image29.png', 'image30.png', 'image31.png', 'image32.jpeg',
      'image33.png', 'image34.png', 'image35.png', 'image36.jpeg', 'image37.png', 'image38.png',
      'image39.png', 'image40.png', 'image41.png', 'image42.png', 'image43.png', 'image44.png',
      'image45.png', 'image46.png', 'image47.png', 'image48.png', 'image49.png', 'image50.png',
      'image51.png', 'image52.png', 'image53.png', 'image54.png', 'image55.png',
    ].map((f) => `${base}/${f}`),
  },
  {
    id: 'ngo',
    title_en: 'NGOs & Institutional Partners',
    title_ar: 'المنظمات غير الحكومية والشركاء المؤسسيون',
    logos: [
      'image56.png', 'image57.png', 'image58.png', 'image59.jpeg', 'image60.png', 'image61.png', 'image62.png', 'image63.png',
    ].map((f) => `${base}/${f}`),
  },
]
