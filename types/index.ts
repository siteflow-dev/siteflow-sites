// SiteFlow Types — standalone (sem dependência do monorepo)

export interface SiteFlowClientConfig {
  slug: string
  clientId: string
  businessName: string
  tagline: string
  segment: string
  template: string
  contact: ContactConfig
  hours: WeeklyHours
  design: DesignConfig
  sections: SectionsConfig
  features: FeaturesConfig
  seo: SeoConfig
  sanity: SanityConfig
}

export interface ContactConfig {
  whatsapp: string
  email?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  googleMapsUrl?: string
  instagram?: string
  tiktok?: string
  facebook?: string
}

export interface DayHours {
  open: string
  close: string
  closed?: boolean
}

export interface WeeklyHours {
  mon: DayHours
  tue: DayHours
  wed: DayHours
  thu: DayHours
  fri: DayHours
  sat: DayHours
  sun: DayHours
}

export interface DesignConfig {
  styleVariant: string
  primaryColor: string
  accentColor: string
  scheme: 'dark' | 'light' | 'mixed'
  borderRadius: string
  displayFont: string
  bodyFont: string
}

export interface SectionsConfig {
  hero: boolean
  about: boolean
  services: boolean
  team: boolean
  booking: boolean
  panel: boolean
  gallery: boolean
  testimonials: boolean
  contact: boolean
  footer: boolean
}

export interface FeaturesConfig {
  booking: boolean
  bookingConfirm: 'manual' | 'automatic'
  professionalPanel: boolean
  gallery: boolean
  whatsappFloat: boolean
  seoLocalBusiness: boolean
  googleAnalytics: boolean
  googleAnalyticsId?: string
  showPrices?: boolean
  loyaltyProgram?: boolean
}

export interface SeoConfig {
  title: string
  description: string
  city?: string
  region?: string
  keywords?: string[]
}

export interface SanityConfig {
  projectId: string
  dataset: string
}

export interface Service {
  id: string
  slug: string
  name: string
  emoji: string
  durationMin: number
  durationLabel: string
  description: string
  priceFrom?: number
  items?: string[]
  active: boolean
  sortOrder: number
}

export interface Professional {
  id: string
  slug: string
  name: string
  initials: string
  role: string
  specialties: string[]
  bio?: string
  photoUrl?: string
  acceptsBooking: boolean
  active: boolean
}

export interface Testimonial {
  id: string
  authorName: string
  serviceName: string
  text: string
  stars: 1 | 2 | 3 | 4 | 5
  photoUrl?: string
  isReal: boolean
}

export interface GalleryItem {
  id: string
  category: string
  imageUrl?: string
  placeholderGradient?: string
  label: string
  caption?: string
}

export interface BusinessInfo {
  headline: string
  subheadline: string
  about: string[]
  stats: Array<{ value: string; label: string; isReal: boolean }>
  pillars: Array<{ icon: string; title: string; description: string }>
}
