import { notFound } from 'next/navigation'
import { getClientConfig } from '@/lib/getClientConfig'
import { getClientContent } from '@/lib/getClientContent'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { About } from '@/components/About'
import { Services } from '@/components/Services'
import { Team } from '@/components/Team'
import { BookingFlow } from '@/components/BookingFlow'
import { Gallery } from '@/components/Gallery'
import { Testimonials } from '@/components/Testimonials'
import { Contact } from '@/components/Contact'
import { FAB } from '@/components/FAB'

interface ClientPageProps { params: { client: string } }

export default async function ClientPage({ params }: ClientPageProps) {
  const config = await getClientConfig(params.client)
  if (!config) notFound()
  const content = await getClientContent(params.client)

  return (
    <>
      <ErrorBoundary name="Navbar"><Navbar config={config} /></ErrorBoundary>
      {config.sections.hero && <ErrorBoundary name="Hero"><Hero config={config} business={content.business} /></ErrorBoundary>}
      {config.sections.about && <ErrorBoundary name="About"><About business={content.business} /></ErrorBoundary>}
      {config.sections.services && <ErrorBoundary name="Services"><Services services={content.services} features={config.features} /></ErrorBoundary>}
      {config.sections.team && <ErrorBoundary name="Team"><Team team={content.team} /></ErrorBoundary>}
      {config.sections.booking && (
        <section id="agendamento" style={{ padding: 'var(--section-py) var(--page-padding-x)', background: 'var(--bg-base)' }}>
          <div className="sf-container" style={{ maxWidth: '860px' }}>
            <div className="reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', fontWeight: 700, color: 'var(--text-base)', lineHeight: 1.15 }}>
                Agende seu <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>horário</span>
              </h2>
            </div>
            <ErrorBoundary name="BookingFlow">
              <BookingFlow clientId={config.clientId} whatsapp={config.contact.whatsapp} services={content.services} />
            </ErrorBoundary>
          </div>
        </section>
      )}
      {config.sections.gallery && content.gallery.length > 0 && <ErrorBoundary name="Gallery"><Gallery items={content.gallery} /></ErrorBoundary>}
      {config.sections.testimonials && content.testimonials.length > 0 && <ErrorBoundary name="Testimonials"><Testimonials testimonials={content.testimonials} /></ErrorBoundary>}
      {config.sections.contact && <ErrorBoundary name="Contact"><Contact config={config} /></ErrorBoundary>}
      {config.features.whatsappFloat && <ErrorBoundary name="FAB"><FAB whatsapp={config.contact.whatsapp} bookingEnabled={config.features.booking} /></ErrorBoundary>}
    </>
  )
}
