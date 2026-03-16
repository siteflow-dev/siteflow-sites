import { notFound } from 'next/navigation'
import { getClientConfig } from '@/lib/getClientConfig'
import { ProfessionalPanel } from '@/components/ProfessionalPanel'

interface PainelPageProps { params: { client: string } }

export default async function PainelPage({ params }: PainelPageProps) {
  const config = await getClientConfig(params.client)
  if (!config) notFound()
  if (!config.features.professionalPanel) notFound()

  return (
    <ProfessionalPanel
      clientId={config.clientId}
      slug={config.slug}
    />
  )
}
