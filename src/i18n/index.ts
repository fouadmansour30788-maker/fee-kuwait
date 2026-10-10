export type Lang = 'en' | 'ar'

export const translations = {
  en: {
    nav: {
      home: 'Home',
      about: 'About',
      programmes: 'Programmes',
      news: 'News & Media',
      impact: 'Impact',
      youth: 'Youth',
      partners: 'Partners',
      contact: 'Contact',
      portal: 'My Portal',
      login: 'Login',
      register: 'Register',
    },
    hero: {
      tagline: 'Environmental Excellence in Kuwait',
      headline: 'Building a Sustainable Future for Kuwait',
      subheadline: 'FEE Kuwait runs 6 international environmental programmes — certifying schools, businesses, and beaches committed to a greener tomorrow.',
      cta_school: 'Join as a School',
      cta_business: 'Join as a Hospitality Establishment',
      cta_learn: 'Explore Programmes',
    },
    stats: {
      schools: 'Schools Certified',
      businesses: 'Businesses Certified',
      students: 'Students Reached',
      countries: 'Countries Connected',
    },
    programmes: {
      title: 'Our 6 Programmes',
      subtitle: 'International environmental education and certification — tailored for Kuwait.',
      learn_more: 'Learn More',
    },
    map: {
      title: 'Certified Sites Across Kuwait',
      subtitle: 'Every pin represents a commitment to environmental excellence.',
      filter_all: 'All Sites',
    },
    news: {
      title: 'Latest News',
      subtitle: 'Stories from our community of environmental changemakers.',
      read_more: 'Read More',
      view_all: 'View All News',
    },
    partners: {
      title: 'Our Partners & Sponsors',
      subtitle: 'Together, building a greener Kuwait.',
    },
    footer: {
      tagline: 'The national operator of FEE International in Kuwait.',
      rights: '© 2024 FEE Kuwait. All rights reserved.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
    },
    common: {
      loading: 'Loading...',
      error: 'Something went wrong. Please try again.',
      save: 'Save',
      cancel: 'Cancel',
      submit: 'Submit',
      back: 'Back',
      next: 'Next',
      close: 'Close',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      download: 'Download',
      upload: 'Upload',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      approve: 'Approve',
      reject: 'Reject',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    },
  },
  ar: {
    nav: {
      home: 'الرئيسية',
      about: 'من نحن',
      programmes: 'البرامج',
      news: 'الأخبار والإعلام',
      impact: 'الأثر',
      youth: 'الشباب',
      partners: 'الشركاء',
      contact: 'اتصل بنا',
      portal: 'بوابتي',
      login: 'تسجيل الدخول',
      register: 'التسجيل',
    },
    hero: {
      tagline: 'التميز البيئي في الكويت',
      headline: 'نبني مستقبلاً مستداماً للكويت',
      subheadline: 'تدير FEE الكويت 6 برامج بيئية دولية — تعتمد المدارس والشركات والشواطئ الملتزمة بغدٍ أكثر خضرة.',
      cta_school: 'انضم كمدرسة',
      cta_business: 'انضم كمنشأة ضيافة',
      cta_learn: 'استكشف البرامج',
    },
    stats: {
      schools: 'مدرسة معتمدة',
      businesses: 'منشأة معتمدة',
      students: 'طالب وصلنا إليهم',
      countries: 'دولة متصلة',
    },
    programmes: {
      title: 'برامجنا الستة',
      subtitle: 'التعليم والاعتماد البيئي الدولي — مصمم للكويت.',
      learn_more: 'اعرف المزيد',
    },
    map: {
      title: 'المواقع المعتمدة في الكويت',
      subtitle: 'كل دبوس يمثل التزاماً بالتميز البيئي.',
      filter_all: 'جميع المواقع',
    },
    news: {
      title: 'آخر الأخبار',
      subtitle: 'قصص من مجتمعنا من صانعي التغيير البيئي.',
      read_more: 'اقرأ المزيد',
      view_all: 'عرض جميع الأخبار',
    },
    partners: {
      title: 'شركاؤنا ورعاتنا',
      subtitle: 'معاً، نبني كويتاً أكثر خضرة.',
    },
    footer: {
      tagline: 'المشغل الوطني لـ FEE الدولية في الكويت.',
      rights: '© 2024 FEE الكويت. جميع الحقوق محفوظة.',
      privacy: 'سياسة الخصوصية',
      terms: 'شروط الخدمة',
    },
    common: {
      loading: 'جاري التحميل...',
      error: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
      save: 'حفظ',
      cancel: 'إلغاء',
      submit: 'إرسال',
      back: 'رجوع',
      next: 'التالي',
      close: 'إغلاق',
      search: 'بحث',
      filter: 'تصفية',
      export: 'تصدير',
      download: 'تنزيل',
      upload: 'رفع',
      delete: 'حذف',
      edit: 'تعديل',
      view: 'عرض',
      approve: 'موافقة',
      reject: 'رفض',
      pending: 'قيد الانتظار',
      approved: 'موافق عليه',
      rejected: 'مرفوض',
    },
  },
}

export function t(lang: Lang, path: string): string {
  const keys = path.split('.')
  let result: unknown = translations[lang]
  for (const key of keys) {
    result = (result as Record<string, unknown>)?.[key]
  }
  return (typeof result === 'string' ? result : null) ?? path
}
