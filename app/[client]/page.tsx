import { notFound } from 'next/navigation'
import { getClientConfig } from '@/lib/getClientConfig'
import { getClientContent } from '@/lib/getClientContent'
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

interface ClientPageProps {
  params: { client: string }
}

export default async function ClientPage({ params }: ClientPageProps) {
  const config = await getClientConfig(params.client)
  if (!config) notFound()

  const content = await getClientContent(params.client)

  return (
    <>
      <Navbar config={config} />

      {config.sections.hero && (
        <Hero config={config} business={content.business} />
      )}

      {config.sections.about && (
        <About business={content.business} />
      )}

      {config.sections.services && (
        <Services services={content.services} features={config.features} />
      )}

      {config.sections.team && (
        <Team team={content.team} />
      )}

      {config.sections.booking && (
        <section id="agendamento" style={{
          padding: 'var(--section-py) var(--page-padding-x)',
          background: 'var(--bg-base)',
        }}>
          <div className="sf-container" style={{ maxWidth: '860px' }}>
            <div className="reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{
                fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.15em',
                textTransform: 'uppercase', color: 'var(--accent)',
                marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}>
                <span style={{ width: '24px', height: '1px', background: 'var(--accent)', display: 'inline-block' }} />
                Reserva online
                <span style={{ width: '24px', height: '1px', background: 'var(--accent)', display: 'inline-block' }} />
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)',
                fontWeight: 700, color: 'var(--text-base)', lineHeight: 1.15,
              }}>
                Agende seu <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>horário</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', fontSize: '0.95rem' }}>
                Em 5 passos simples. Confirmação pela profissional em até 30 min.
              </p>
            </div>

            <BookingFlow
              clientId={config.clientId}
              whatsapp={config.contact.whatsapp}
              services={content.services}
            />
          </div>
        </section>
      )}

      {config.sections.gallery && content.gallery.length > 0 && (
        <Gallery items={content.gallery} />
      )}

      {config.sections.testimonials && content.testimonials.length > 0 && (
        <Testimonials testimonials={content.testimonials} />
      )}

      {config.sections.contact && (
        <Contact config={config} />
      )}

      {config.features.whatsappFloat && (
        <FAB
          whatsapp={config.contact.whatsapp}
          bookingEnabled={config.features.booking}
        />
      )}
    </>
  )
}
