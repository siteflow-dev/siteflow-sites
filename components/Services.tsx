'use client'

import type { Service, FeaturesConfig } from '@/types'

interface ServicesProps {
  services: Service[]
  features: FeaturesConfig
}

export function Services({ services, features }: ServicesProps) {
  return (
    <section id="servicos" style={{
      padding: 'var(--section-py) var(--page-padding-x)',
      background: 'var(--bg-soft)',
    }}>
      <div className="sf-container">
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{
            fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: 'var(--accent)',
            marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          }}>
            <span style={{ width: '24px', height: '1px', background: 'var(--accent)', display: 'inline-block' }} />
            O que fazemos
            <span style={{ width: '24px', height: '1px', background: 'var(--accent)', display: 'inline-block' }} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-h1)',
            fontWeight: 700, color: 'var(--text-base)', lineHeight: 1.15,
          }}>
            Nossos <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>serviços</span>
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
          gap: 'var(--grid-gap)',
        }}>
          {services.filter(s => s.active).map(service => (
            <div key={service.id} className="reveal" style={{
              background: 'var(--bg-base)',
              borderRadius: 'var(--radius)',
              padding: 'clamp(1.25rem, 3vw, 2rem)',
              border: '1px solid var(--border-color)',
              position: 'relative', overflow: 'hidden',
              transition: 'var(--transition)', cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
              (e.currentTarget.querySelector('.svc-bar') as HTMLElement).style.opacity = '1'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = '';
              (e.currentTarget.querySelector('.svc-bar') as HTMLElement).style.opacity = '0'
            }}>
              {/* Top bar */}
              <div className="svc-bar" style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                background: 'linear-gradient(90deg, var(--primary-light), var(--rose))',
                opacity: 0, transition: 'var(--transition)',
              }} />

              <span style={{ fontSize: '2.25rem', marginBottom: '1rem', display: 'block' }}>
                {service.emoji}
              </span>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '1.25rem',
                fontWeight: 700, color: 'var(--text-base)', marginBottom: '0.5rem',
              }}>
                {service.name}
              </div>
              <div style={{
                color: 'var(--text-muted)', fontSize: '0.9rem',
                lineHeight: 1.6, marginBottom: '1.25rem',
              }}>
                {service.description}
              </div>

              {service.items && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {service.items.map((item, i) => (
                    <li key={i} style={{
                      fontSize: '0.85rem', color: 'var(--text-muted)',
                      padding: '0.3rem 0',
                      borderBottom: i < service.items!.length - 1 ? '1px solid var(--border-color)' : 'none',
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                    }}>
                      <span style={{
                        width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--primary-light), var(--rose))',
                      }} />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {features.showPrices && service.priceFrom && (
                <div style={{
                  marginTop: '1rem', fontSize: '0.9rem',
                  color: 'var(--primary)', fontWeight: 600,
                }}>
                  A partir de R$ {service.priceFrom.toFixed(2).replace('.', ',')}
                </div>
              )}

              {features.booking && (
                <button onClick={() => document.getElementById('agendamento')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{
                    marginTop: '1.25rem',
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    color: 'var(--primary-light)', fontSize: '0.85rem', fontWeight: 500,
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'var(--transition)', fontFamily: 'var(--font-body)',
                    minHeight: 'var(--touch-target)',
                  }}>
                  Agendar →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
