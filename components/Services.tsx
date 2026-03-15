'use client'
import type { Service, FeaturesConfig } from '@/types'

interface ServicesProps { services: Service[]; features: FeaturesConfig }

export function Services({ services, features }: ServicesProps) {
  return (
    <section id="servicos" style={{ padding: 'var(--section-py) var(--page-padding-x)', background: 'var(--bg-soft)' }}>
      <style>{`
        .sf-svc-card { transition: transform 0.3s ease, box-shadow 0.3s ease; cursor: pointer; }
        .sf-svc-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-soft); }
        .sf-svc-card .svc-bar { opacity: 0; transition: opacity 0.3s ease; }
        .sf-svc-card:hover .svc-bar { opacity: 1; }
        .sf-svc-agendar { color: var(--primary-light); font-size: 0.85rem; font-weight: 500; background: none; border: none; cursor: pointer; padding: 0; transition: color 0.3s; font-family: var(--font-body); min-height: var(--touch-target); display: inline-flex; align-items: center; }
        .sf-svc-agendar:hover { color: var(--rose); }
      `}</style>
      <div className="sf-container">
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span style={{ width: '24px', height: '1px', background: 'var(--accent)', display: 'inline-block' }} />
            O que fazemos
            <span style={{ width: '24px', height: '1px', background: 'var(--accent)', display: 'inline-block' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', fontWeight: 700, color: 'var(--text-base)', lineHeight: 1.15 }}>
            Nossos <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>serviços</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: 'var(--grid-gap)' }}>
          {services.filter(s => s.active).map(service => (
            <div key={service.id} className="sf-svc-card reveal" style={{ background: 'var(--bg-base)', borderRadius: 'var(--radius)', padding: 'clamp(1.25rem,3vw,2rem)', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
              <div className="svc-bar" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--primary-light), var(--rose))' }} />
              <span style={{ fontSize: '2.25rem', marginBottom: '1rem', display: 'block' }}>{service.emoji}</span>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-base)', marginBottom: '0.5rem' }}>{service.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>{service.description}</div>
              {service.items && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {service.items.map((item, i) => (
                    <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '0.3rem 0', borderBottom: i < service.items!.length - 1 ? '1px solid var(--border-color)' : 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, var(--primary-light), var(--rose))' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {features.showPrices && service.priceFrom && (
                <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>
                  A partir de R$ {service.priceFrom.toFixed(2).replace('.', ',')}
                </div>
              )}
              {features.booking && (
                <button className="sf-svc-agendar" onClick={() => document.getElementById('agendamento')?.scrollIntoView({ behavior: 'smooth' })} style={{ marginTop: '1.25rem' }}>
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
