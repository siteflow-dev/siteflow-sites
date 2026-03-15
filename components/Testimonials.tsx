'use client'

import type { Testimonial } from '@/types'

interface TestimonialsProps {
  testimonials: Testimonial[]
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  return (
    <section id="depoimentos" style={{
      padding: 'var(--section-py-sm) var(--page-padding-x)',
      background: 'var(--bg-darker)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(107,33,168,0.1) 0%, transparent 70%)',
      }} />

      <div className="sf-container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: 'var(--accent)',
            marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          }}>
            <span style={{ width: '24px', height: '1px', background: 'var(--accent)', display: 'inline-block' }} />
            O que dizem
            <span style={{ width: '24px', height: '1px', background: 'var(--accent)', display: 'inline-block' }} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-h1)',
            fontWeight: 700, color: 'var(--text-on-dark)', lineHeight: 1.15,
          }}>
            Quem passou por aqui, <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>voltou</span>
          </h2>
        </div>

        <div className="sf-dep-grid reveal">
          {testimonials.map(dep => (
            <div key={dep.id} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(212,175,138,0.12)',
              borderRadius: 'var(--radius)', padding: '1.75rem',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(107,33,168,0.12)'
              e.currentTarget.style.borderColor = 'rgba(199,125,186,0.3)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.borderColor = 'rgba(212,175,138,0.12)'
            }}>
              <div style={{ color: 'var(--accent)', fontSize: '0.875rem', marginBottom: '1rem', letterSpacing: '2px' }}>
                {'★'.repeat(dep.stars)}
              </div>
              <p style={{
                color: 'var(--text-on-dark-soft)', fontSize: '0.9rem',
                lineHeight: 1.7, marginBottom: '1.25rem', fontStyle: 'italic',
              }}>
                "{dep.text}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary-light), var(--rose))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700, color: 'white',
                  flexShrink: 0,
                }}>
                  {dep.authorName.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-on-dark)' }}>
                    {dep.authorName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-on-dark-muted)' }}>
                    {dep.serviceName}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
