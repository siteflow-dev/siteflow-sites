import type { Service, Professional, Testimonial, GalleryItem, BusinessInfo } from '@/types'

export interface ClientContent {
  services:     Service[]
  team:         Professional[]
  testimonials: Testimonial[]
  gallery:      GalleryItem[]
  business:     BusinessInfo
}

// Mapa estático de imports de conteúdo
const contentLoaders = {
  'divas-hair': {
    services:     () => import('@/clients/divas-hair/content/services.json'),
    team:         () => import('@/clients/divas-hair/content/team.json'),
    testimonials: () => import('@/clients/divas-hair/content/testimonials.json'),
    gallery:      () => import('@/clients/divas-hair/content/gallery.json'),
    business:     () => import('@/clients/divas-hair/content/business.json'),
  }
} as const

export async function getClientContent(slug: string): Promise<ClientContent> {
  const loaders = contentLoaders[slug as keyof typeof contentLoaders]
  if (!loaders) throw new Error(`[SiteFlow] Cliente "${slug}" não encontrado`)

  const [services, team, testimonials, gallery, business] = await Promise.all([
    loaders.services().then(m => m.default),
    loaders.team().then(m => m.default),
    loaders.testimonials().then(m => m.default),
    loaders.gallery().then(m => m.default),
    loaders.business().then(m => m.default),
  ])

  return { services, team, testimonials, gallery, business } as ClientContent
}
