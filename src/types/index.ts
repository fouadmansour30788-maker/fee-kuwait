export type Role = 'school' | 'business' | 'admin' | 'super_admin'
export type Programme = 'eco-schools' | 'blue-flag' | 'green-key' | 'leaf' | 'yre' | 'eco-campus'
export type Language = 'en' | 'ar'
export type ApplicationStatus = 'new' | 'under_review' | 'documents_pending' | 'site_visit_scheduled' | 'approved' | 'rejected'
export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'requested'
export type StepStatus = 'not_started' | 'in_progress' | 'submitted' | 'approved' | 'rejected'

export interface User {
  id: string
  email: string
  role: Role
  name_en?: string
  name_ar?: string
  phone?: string
  avatar_url?: string
  preferred_language: Language
  demo?: boolean
  created_at: string
}

export interface School {
  id: string
  user_id: string
  name_en: string
  name_ar?: string
  type?: 'public' | 'private' | 'international'
  governorate?: string
  address?: string
  students_count?: number
  principal_name?: string
  principal_email?: string
  principal_phone?: string
  status: 'pending' | 'active' | 'suspended' | 'inactive'
  created_at: string
}

export interface Business {
  id: string
  user_id: string
  name_en: string
  name_ar?: string
  type?: 'hotel' | 'restaurant' | 'beach' | 'marina' | 'other'
  governorate?: string
  address?: string
  lat?: number
  lng?: number
  stars?: number
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  status: 'pending' | 'active' | 'suspended' | 'inactive'
  created_at: string
}

export interface Application {
  id: string
  applicant_id: string
  entity_id?: string
  entity_type?: 'school' | 'business'
  programme: Programme
  status: ApplicationStatus
  assigned_to?: string
  review_notes?: string
  rejection_reason?: string
  submitted_at: string
  updated_at: string
  review_deadline?: string
}

export interface Document {
  id: string
  application_id: string
  uploader_id: string
  name: string
  file_url: string
  file_type?: string
  file_size?: number
  status: DocumentStatus
  review_notes?: string
  reviewed_at?: string
  version: number
  created_at: string
}

export interface Certification {
  id: string
  applicant_id: string
  application_id?: string
  programme: Programme
  level?: string
  issued_at: string
  expires_at: string
  certificate_url?: string
  badge_url?: string
  active: boolean
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title_en?: string
  title_ar?: string
  message_en?: string
  message_ar?: string
  action_url?: string
  read: boolean
  created_at: string
}

export interface NewsArticle {
  id: string
  title_en: string
  title_ar?: string
  slug: string
  excerpt_en?: string
  excerpt_ar?: string
  body_en?: string
  body_ar?: string
  image_url?: string
  category?: string
  programme?: Programme
  published: boolean
  published_at?: string
  created_at: string
}

export interface MapPin {
  id: string
  name_en: string
  name_ar?: string
  programme: Programme
  type?: string
  governorate?: string
  lat: number
  lng: number
  certified_at?: string
  photo_url?: string
  description_en?: string
  description_ar?: string
  active: boolean
}

export interface ImpactStats {
  id: string
  year: number
  schools_certified: number
  businesses_certified: number
  students_reached: number
  trees_planted: number
  beaches_cleaned: number
  co2_saved_kg: number
  countries_connected: number
}

export interface Partner {
  id: string
  name_en: string
  name_ar?: string
  type: 'government' | 'corporate' | 'institutional'
  logo_url?: string
  website_url?: string
  sort_order: number
  active: boolean
}

export interface ProgrammeInfo {
  id: Programme
  name_en: string
  name_ar: string
  color: string
  icon: string
  description_en: string
  description_ar: string
}
