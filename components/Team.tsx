'use client'
import type { Professional } from '@/types'

interface TeamProps { team: Professional[] }

export function Team({ team }: TeamProps) {
  return (
    <section id="equipe" style={{ padding: 'var(--section-py) var(--page-padding-x)', background: 'var(--bg-dark)', position: 'relative' }}>
      <style>{`
        .sf-team-card { transition: transform 0.3s ease, background 0.3s ease, border-color 0.3s ease; }
        .sf-team-card:hover { transform: translateY(-4px); background: rgba(107,33,168,0.15) !important; border-color: rgba(199,125,186,0.4) !important; }
      `}</style>
      <div className="sf-container">
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span style={{ width: '24px', height: '1px', background: 'var(--accent)', display: 'inline-block' }} />
            Nossa equipe
            <span style={{ width: '24px', height: '1px', background: 'var(--accent)', display: 'inline-block' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', fontWeight: 700, color: 'var(--text-on-dark)', lineHeight: 1.15 }}>
            As <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>profissionais</span> por trás da magia
          </h2>
        </div>
        <div className="sf-team-grid reveal">
          {team.filter(p => p.active).map(member => (
            <div key={member.id} className="sf-team-card" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,138,0.15)', borderRadius: 'var(--radius)', padding: '2rem', textAlign: 'center' }}>
              {member.photoUrl ? (
                <img src={member.photoUrl} alt={member.name} style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1rem', objectFit: 'cover', border: '2px solid rgba(212,175,138,0.3)' }} />
              ) : (
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent)', background: 'linear-gradient(135deg, rgba(107,33,168,0.5), rgba(199,125,186,0.4))', border: '2px solid rgba(212,175,138,0.3)' }}>
                  {member.initials}
                </div>
              )}
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-on-dark)', marginBottom: '0.25rem' }}>{member.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent)', marginBottom: '0.75rem' }}>{member.role}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
                {member.specialties.map((spec, i) => (
                  <span key={i} style={{ background: 'rgba(107,33,168,0.25)', border: '1px solid rgba(147,51,234,0.3)', color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>{spec}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
