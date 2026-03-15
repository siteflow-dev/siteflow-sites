'use client'

import type { GalleryItem } from '@/types'

interface GalleryProps {
  items: GalleryItem[]
}

export function Gallery({ items }: GalleryProps) {
  return (
    <section id="galeria" style={{
      padding: 'var(--section-py) var(--page-padding-x)',
      background: 'var(--bg-soft)',
    }}>
      <div className="sf-container">
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: 'var(--accent)',
            marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          }}>
            <span style={{ width: '24px', height: '1px', background: 'var(--accent)', display: 'inline-block' }} />
            Transformações
            <span style={{ width: '24px', height: '1px', background: 'var(--accent)', display: 'inline-block' }} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-h1)',
            fontWeight: 700, color: 'var(--text-base)', lineHeight: 1.15,
          }}>
            Cada mulher, <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>única</span>
          </h2>
        </div>

        {/* Grid desktop com spans / mobile simples */}
        <div className="reveal" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
        }}>
          {items.map((item, i) => (
            <div key={item.id} style={{
              borderRadius: 'var(--radius)', overflow: 'hidden',
              position: 'relative', cursor: 'pointer',
              transition: 'var(--transition)',
              gridRow: i === 0 ? 'span 2' : 'span 1',
              gridColumn: i === 3 ? 'span 2' : 'span 1',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.02)';
              (e.currentTarget.querySelector('.gal-overlay') as HTMLElement).style.opacity = '1'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = '';
              (e.currentTarget.querySelector('.gal-overlay') as HTMLElement).style.opacity = '0'
            }}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.label} style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  minHeight: i === 0 ? '320px' : '150px',
                }} />
              ) : (
                <div style={{
                  width: '100%',
                  minHeight: i === 0 ? '320px' : i === 3 ? '150px' : '150px',
                  background: item.placeholderGradient || 'var(--bg-mid)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: '0.5rem',
                }}>
                  <div style={{ fontSize: '2.5rem', opacity: 0.8 }}>
                    {i === 0 ? '✨' : i === 1 ? '🎨' : i === 2 ? '💅' : i === 3 ? '💆‍♀️' : '💍'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                    {item.label}
                  </div>
                </div>
              )}

              <div className="gal-overlay" style={{
                position: 'absolute', inset: 0,
                background: 'rgba(13,13,13,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'var(--transition)',
                fontSize: '0.85rem', color: 'white', fontWeight: 500,
              }}>
                {item.caption || `Ver ${item.category.toLowerCase()}`}
              </div>
            </div>
          ))}
        </div>

        <style>{`
          @media (max-width: 600px) {
            #galeria .reveal > div { grid-template-columns: repeat(2, 1fr) !important; }
            #galeria .reveal > div > div { grid-row: span 1 !important; grid-column: span 1 !important; }
            #galeria .reveal > div > div:first-child { grid-column: span 2 !important; }
          }
        `}</style>
      </div>
    </section>
  )
}
