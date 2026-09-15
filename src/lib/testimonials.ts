// Client-safe testimonial type + defaults (no server imports).

export interface Testimonial {
  quote_en: string
  quote_ar: string
  name_en: string
  name_ar: string
  role_en: string
  role_ar: string
  initials: string
  programme: string
  color: string
}

// Defaults mirror the homepage "Voices From Our Community" section.
export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    quote_en: 'Joining Eco-Schools transformed how our students see their responsibility toward the environment. We are incredibly proud of our Green Flag.',
    quote_ar: 'انضمامنا لبرنامج المدارس البيئية غيّر نظرة طلابنا تجاه مسؤوليتهم البيئية. نحن فخورون جداً بعلمنا الأخضر.',
    name_en: 'Sarah Al-Rashidi', name_ar: 'سارة الرشيدي',
    role_en: 'Principal, Al-Sabah Model School', role_ar: 'مديرة مدرسة الصباح النموذجية',
    initials: 'SR', programme: 'Eco-Schools', color: '#52B788',
  },
  {
    quote_en: 'Blue Flag certification put us on the international map. Guests now choose us specifically because of our demonstrated environmental commitment.',
    quote_ar: 'وضعتنا شهادة العلم الأزرق على الخريطة الدولية. يختارنا الضيوف الآن تحديداً بسبب التزامنا البيئي المُثبَت.',
    name_en: 'Faisal Al-Mutairi', name_ar: 'فيصل المطيري',
    role_en: 'Director, Marina Waves Resort', role_ar: 'مدير منتجع مارينا ويفز',
    initials: 'FM', programme: 'Blue Flag', color: '#90E0EF',
  },
  {
    quote_en: 'Eco-Campus gave our sustainability work global recognition and attracted international partnerships we never imagined possible.',
    quote_ar: 'منح الحرم البيئي عملنا في الاستدامة اعترافاً عالمياً وجذب شراكات دولية لم نتخيلها.',
    name_en: 'Dr. Noura Al-Ahmad', name_ar: 'د. نورة الأحمد',
    role_en: 'Sustainability Lead, Gulf University', role_ar: 'رئيسة الاستدامة، جامعة الخليج',
    initials: 'NA', programme: 'Eco-Campus', color: '#74C69D',
  },
]
