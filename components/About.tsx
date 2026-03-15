'use client'

import type { BusinessInfo } from '@/types'

interface AboutProps {
  business: BusinessInfo
}

export function About({ business }: AboutProps) {
  return (
    <section id="filosofia" style={{
      padding: 'var(--section-py) var(--page-padding-x)',
      background: 'var(--bg-darker)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(107,33,168,0.12) 0%, transparent 70%)',
      }} />

      <div className="sf-container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="sf-filo-grid reveal">
          {/* Text */}
          <div>
            <div style={{
              fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: 'var(--accent)',
              marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span style={{ width: '24px', height: '1px', background: 'var(--accent)', display: 'inline-block' }} />
              Nossa essência
            </div>

            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-h1)',
              fontWeight: 700, color: 'var(--text-on-dark)',
              lineHeight: 1.15, marginBottom: '1.5rem',
            }}>
              Beleza que <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>pertence</span> a todas
            </h2>

            {business.about.map((paragraph, i) => (
              <p key={i} style={{
                color: 'var(--text-on-dark-soft)',
                fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)',
                lineHeight: 1.8, marginBottom: '1.25rem', fontWeight: 300,
              }}>
                {paragraph}
              </p>
            ))}
          </div>

          {/* Pillars */}
          <div className="sf-pillars-grid">
            {business.pillars.map((pillar, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(212,175,138,0.15)',
                borderRadius: 'var(--radius)',
                padding: '1.5rem',
                transition: 'var(--transition)',
                cursor: 'default',
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(107,33,168,0.5), rgba(199,125,186,0.3))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem', marginBottom: '0.75rem',
                }}>
                  {pillar.icon}
                </div>
                <div style={{ fontWeight: 500, color: 'var(--text-on-dark)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                  {pillar.title}
                </div>
                <div style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                  {pillar.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
