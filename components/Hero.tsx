import type { SiteFlowClientConfig, BusinessInfo } from '@/types'

interface HeroProps {
  config: SiteFlowClientConfig
  business: BusinessInfo
}

export function Hero({ config, business }: HeroProps) {
  return (
    <section id="hero" style={{
      minHeight: '100svh',
      background: 'var(--bg-dark)',
      position: 'relative',
      display: 'flex', alignItems: 'center',
      overflow: 'hidden',
      paddingTop: 'var(--nav-height)',
    }}>
      {/* Background gradients */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 80% 60% at 70% 50%, rgba(107,33,168,0.35) 0%, transparent 60%),
          radial-gradient(ellipse 50% 80% at 10% 80%, rgba(199,125,186,0.2) 0%, transparent 50%),
          radial-gradient(ellipse 40% 40% at 90% 10%, rgba(212,175,138,0.15) 0%, transparent 50%)
        `,
      }} />

      {/* Pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'repeating-linear-gradient(45deg, rgba(212,175,138,1) 0px, rgba(212,175,138,1) 1px, transparent 1px, transparent 40px)',
      }} />

      <div className="sf-container" style={{
        position: 'relative', zIndex: 2,
        padding: '4rem var(--page-padding-x)',
      }}>
        <div className="sf-hero-content">
          {/* Text side */}
          <div>
            <div className="fade-in" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(212,175,138,0.15)',
              border: '1px solid rgba(212,175,138,0.3)',
              color: 'var(--accent)',
              fontSize: '0.75rem', fontWeight: 500,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)',
              marginBottom: '1.5rem',
            }}>
              ✦ {config.seo.region} · {config.seo.city}
            </div>

            <h1 className="fade-in fade-in-delay-1" style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--hero-title-size)',
              fontWeight: 900,
              color: 'var(--text-on-dark)',
              lineHeight: 1.0,
              letterSpacing: '-0.03em',
              marginBottom: '1.5rem',
            }}>
              {business.headline.split(' ').map((word, i) => {
                if (word === 'sentir') return <span key={i} style={{ color: 'var(--accent)', fontStyle: 'italic' }}>{word} </span>
                if (word === 'diva') return <span key={i} style={{ WebkitTextStroke: '1.5px var(--rose)', color: 'transparent' }}>{word}</span>
                return word + ' '
              })}
            </h1>

            <p className="fade-in fade-in-delay-2" style={{
              color: 'var(--text-on-dark-soft)',
              fontSize: 'clamp(1rem, 2vw, 1.1rem)',
              fontWeight: 300, lineHeight: 1.7,
              marginBottom: '2.5rem',
              maxWidth: '460px',
            }}>
              {business.subheadline}
            </p>

            <div className="fade-in fade-in-delay-3" style={{
              display: 'flex', gap: '1rem', flexWrap: 'wrap',
            }}>
              <a href="#agendamento" style={{
                background: 'linear-gradient(135deg, var(--primary-light), var(--rose))',
                color: 'white',
                padding: '0.875rem 2rem', borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '1rem',
                border: 'none', cursor: 'pointer',
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                boxShadow: 'var(--shadow-button)',
                transition: 'var(--transition)',
                minHeight: 'var(--btn-height)',
              }}>
                ✦ {config.features.booking ? 'Agendar horário' : 'Falar no WhatsApp'}
              </a>
              <a href="#servicos" style={{
                background: 'transparent', color: 'var(--text-on-dark)',
                padding: '0.875rem 2rem', borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '1rem',
                border: '1px solid rgba(255,255,255,0.25)',
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                transition: 'var(--transition)',
                minHeight: 'var(--btn-height)',
              }}>
                Ver serviços →
              </a>
            </div>

            {/* Stats */}
            {business.stats.length > 0 && (
              <div className="fade-in fade-in-delay-4" style={{
                display: 'flex', gap: '2.5rem', marginTop: '3rem',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                flexWrap: 'wrap',
              }}>
                {business.stats.map((stat, i) => (
                  <div key={i}>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.75rem', fontWeight: 700,
                      color: 'var(--accent)',
                    }}>{stat.value}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-on-dark-muted)', marginTop: '0.2rem' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visual side — hidden on mobile via CSS */}
          <div className="sf-hero-visual">
            <div style={{
              width: '380px', height: '380px', borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(107,33,168,0.4), rgba(199,125,186,0.3))',
              border: '1px solid rgba(212,175,138,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <div style={{
                width: '300px', height: '300px', borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(147,51,234,0.5), rgba(199,125,186,0.4))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontSize: '5rem', fontWeight: 900,
                color: 'var(--accent)',
                textShadow: '0 0 60px rgba(212,175,138,0.5)',
              }}>✦</div>

              {/* Float cards */}
              <div className="float-1" style={{
                position: 'absolute', top: '10%', right: '-5%',
                background: 'rgba(13,13,13,0.85)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(212,175,138,0.25)',
                borderRadius: 'var(--radius)', padding: '0.875rem 1.25rem',
                fontSize: '0.8rem', color: 'var(--text-on-dark)',
              }}>
                <div style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.7rem', marginBottom: '0.25rem' }}>Próximo horário</div>
                <div style={{ fontWeight: 500, color: 'var(--accent)' }}>Hoje, 14h30</div>
              </div>

              <div className="float-2" style={{
                position: 'absolute', bottom: '15%', left: '-8%',
                background: 'rgba(13,13,13,0.85)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(212,175,138,0.25)',
                borderRadius: 'var(--radius)', padding: '0.875rem 1.25rem',
                fontSize: '0.8rem', color: 'var(--text-on-dark)',
              }}>
                <div style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.7rem', marginBottom: '0.25rem' }}>Avaliação</div>
                <div style={{ fontWeight: 500, color: 'var(--accent)' }}>⭐ 5.0 · 128 avaliações</div>
              </div>

              <div className="float-3" style={{
                position: 'absolute', top: '50%', right: '-12%',
                background: 'rgba(13,13,13,0.85)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(212,175,138,0.25)',
                borderRadius: 'var(--radius)', padding: '0.875rem 1.25rem',
                fontSize: '0.8rem', color: 'var(--text-on-dark)',
              }}>
                <div style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.7rem', marginBottom: '0.25rem' }}>Status</div>
                <div style={{ fontWeight: 500, color: 'var(--accent)' }}>✓ Aberto agora</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
