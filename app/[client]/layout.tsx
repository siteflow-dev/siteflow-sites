import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getClientConfig, getAllClientSlugs } from '@/lib/getClientConfig'

interface ClientLayoutProps {
  children: React.ReactNode
  params: { client: string }
}

export async function generateStaticParams() {
  return getAllClientSlugs()
}

export async function generateMetadata(
  { params }: { params: { client: string } }
): Promise<Metadata> {
  const config = await getClientConfig(params.client)
  if (!config) return { title: 'SiteFlow' }
  return {
    title:       config.seo.title,
    description: config.seo.description,
    keywords:    config.seo.keywords?.join(', '),
  }
}

export default async function ClientLayout({ children, params }: ClientLayoutProps) {
  const config = await getClientConfig(params.client)
  if (!config) notFound()

  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap`

  const cssVars = `
    :root {
      --primary: ${config.design.primaryColor};
      --accent:  ${config.design.accentColor};
      --radius:  ${config.design.borderRadius};
    }
  `

  const schemaOrg = config.features.seoLocalBusiness ? JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: config.businessName,
    description: config.seo.description,
    telephone: `+${config.contact.whatsapp}`,
  }) : null

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={googleFontsUrl} rel="stylesheet" />
      <style>{cssVars}</style>
      {schemaOrg && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaOrg }}
        />
      )}
      {children}
    </>
  )
}
