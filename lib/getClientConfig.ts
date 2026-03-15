import type { SiteFlowClientConfig } from '@/types'

export const VALID_CLIENTS = ['divas-hair'] as const
export type ClientSlug = typeof VALID_CLIENTS[number]

export function isValidClient(slug: string): slug is ClientSlug {
  return VALID_CLIENTS.includes(slug as ClientSlug)
}

// Mapa estático — Next.js consegue analisar imports em build time
const configLoaders: Record<ClientSlug, () => Promise<{ default: SiteFlowClientConfig }>> = {
  'divas-hair': () => import('@/clients/divas-hair/config'),
}

export async function getClientConfig(slug: string): Promise<SiteFlowClientConfig | null> {
  if (!isValidClient(slug)) return null
  try {
    const mod = await configLoaders[slug]()
    return mod.default
  } catch (error) {
    console.error(`[SiteFlow] Erro ao carregar config "${slug}":`, error)
    return null
  }
}

export function getAllClientSlugs(): Array<{ client: string }> {
  return VALID_CLIENTS.map(slug => ({ client: slug }))
}
