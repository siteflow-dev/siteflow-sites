import type { SiteFlowClientConfig } from '@/types'

const config: SiteFlowClientConfig = {
  slug:         'divas-hair',
  clientId:     'divas-hair',
  businessName: 'Divas Hair',
  tagline:      'Toda mulher merece se sentir diva',
  segment:      'salao-beleza',
  template:     'divas-hair',
  contact: {
    whatsapp:  '5511900000000',
    email:     'contato@divashair.com.br',
    address:   'Em breve na Avenida Cupece, Zona Sul',
    city:      'Sao Paulo',
    state:     'SP',
    instagram: '@divashair',
  },
  hours: {
    mon: { open: '09:00', close: '20:00' },
    tue: { open: '09:00', close: '20:00' },
    wed: { open: '09:00', close: '20:00' },
    thu: { open: '09:00', close: '20:00' },
    fri: { open: '09:00', close: '20:00' },
    sat: { open: '09:00', close: '20:00' },
    sun: { open: '09:00', close: '16:00' },
  },
  design: {
    styleVariant: 'dark-elegant',
    primaryColor: '#6B21A8',
    accentColor:  '#D4AF8A',
    scheme:       'dark',
    borderRadius: '16px',
    displayFont:  'Playfair Display',
    bodyFont:     'DM Sans',
  },
  sections: {
    hero: true, about: true, services: true, team: true,
    booking: true, panel: true, gallery: true,
    testimonials: true, contact: true, footer: true,
  },
  features: {
    booking: true, bookingConfirm: 'manual',
    professionalPanel: true, gallery: true,
    whatsappFloat: true, seoLocalBusiness: true,
    googleAnalytics: false, showPrices: false,
  },
  seo: {
    title:       'Divas Hair | Salao de Beleza Inclusivo | Zona Sul SP',
    description: 'Salao de beleza inclusivo na Zona Sul de Sao Paulo. Coloracao, corte, tratamentos para todos os cabelos. Agende online.',
    city:        'Sao Paulo',
    region:      'Zona Sul',
  },
  sanity: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset:   'divas-hair',
  },
}

export default config
