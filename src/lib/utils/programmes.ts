import { Programme, ProgrammeInfo } from '@/types'

export const PROGRAMMES: ProgrammeInfo[] = [
  {
    id: 'eco-schools',
    name_en: 'Eco-Schools',
    name_ar: 'المدارس البيئية',
    color: '#52B788',
    icon: 'School',
    logo: '/programmes/eco-schools.webp',
    logoWhite: '/programmes/eco-schools-white.webp',
    description_en: 'Empowering schools to become centres of environmental action and education.',
    description_ar: 'تمكين المدارس لتصبح مراكز للعمل والتعليم البيئي.',
  },
  {
    id: 'blue-flag',
    name_en: 'Blue Flag',
    name_ar: 'العلم الأزرق',
    color: '#006994',
    icon: 'Waves',
    logo: '/programmes/blue-flag.webp',
    logoWhite: '/programmes/blue-flag-white.webp',
    description_en: 'Certifying the world\'s finest beaches, marinas, and sustainable boating operators.',
    description_ar: 'شهادة لأفضل الشواطئ والمراسي ومشغلي القوارب المستدامة.',
  },
  {
    id: 'green-key',
    name_en: 'Green Key',
    name_ar: 'المفتاح الأخضر',
    color: '#C8A951',
    icon: 'KeyRound',
    logo: '/programmes/green-key.webp',
    logoWhite: '/programmes/green-key-white.webp',
    description_en: 'The leading standard for excellence in responsible operation for tourism.',
    description_ar: 'المعيار الرائد للتميز في التشغيل المسؤول في قطاع السياحة.',
  },
  {
    id: 'leaf',
    name_en: 'LEAF',
    name_ar: 'ورقة الشجر',
    color: '#1B4332',
    icon: 'Leaf',
    logo: '/programmes/leaf.webp',
    logoWhite: '/programmes/leaf-white.webp',
    description_en: 'Learning about Forests and their relationship with our environment.',
    description_ar: 'التعلم عن الغابات وعلاقتها ببيئتنا.',
  },
  {
    id: 'yre',
    name_en: 'Young Reporters for the Environment',
    name_ar: 'المراسلون الشباب للبيئة',
    color: '#74C69D',
    icon: 'Newspaper',
    logo: '/programmes/yre.webp',
    logoWhite: '/programmes/yre-white.webp',
    description_en: 'Training young people in journalism to report on environmental issues.',
    description_ar: 'تدريب الشباب على الصحافة للتغطية القضايا البيئية.',
  },
  {
    id: 'eco-campus',
    name_en: 'Eco-Campus',
    name_ar: 'الحرم البيئي',
    color: '#40916C',
    icon: 'GraduationCap',
    logo: '/programmes/eco-campus.webp',
    logoWhite: '/programmes/eco-campus-white.webp',
    description_en: 'Recognising universities and colleges as leaders in environmental sustainability.',
    description_ar: 'تكريم الجامعات والكليات كرواد في الاستدامة البيئية.',
  },
]

export function getProgramme(id: Programme): ProgrammeInfo | undefined {
  return PROGRAMMES.find(p => p.id === id)
}

export function getProgrammeColor(id: Programme): string {
  return getProgramme(id)?.color ?? '#40916C'
}
