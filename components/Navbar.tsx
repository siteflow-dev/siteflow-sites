'use client'

import { useState, useEffect } from 'react'
import type { SiteFlowClientConfig } from '@/types'

interface NavbarProps {
  config: SiteFlowClientConfig
}

export function Navbar({ config }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    config.sections.services     && { href: '#servicos',     label: 'Serviços' },
    config.sections.team         && { href: '#equipe',       label: 'Equipe' },
    config.sections.gallery      && { href: '#galeria',      label: 'Galeria' },
    config.features.professionalPanel && { href: '#painel', label: 'Painel' },
    config.sections.contact      && { href: '#contato',      label: 'Contato' },
  ].filter(Boolean) as { href: string; label: string }[]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(13,13,13,0.97)' : 'rgba(13,13,13,0.92)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(212,175,138,0.2)',
      padding: '0 var(--page-padding-x)',
      height: 'var(--nav-height)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      transition: 'background 0.3s ease',
    }}>
      {/* Logo */}
      <a href="#hero" style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.6rem', fontWeight: 900,
        color: 'var(--text-on-dark)',
        letterSpacing: '-0.02em', textDecoration: 'none',
      }}>
        {config.businessName.split(' ')[0]}{' '}
        <span style={{ color: 'var(--accent)' }}>
          {config.businessName.split(' ').slice(1).join(' ')}
        </span>
      </a>

      {/* Desktop links */}
      <ul style={{
        display: 'flex', gap: '2rem', alignItems: 'center',
        listStyle: 'none', margin: 0, padding: 0,
      }} className="sf-hide-mobile">
        {links.map(link => (
          <li key={link.href}>
            <a href={link.href} style={{
              color: 'rgba(255,255,255,0.75)',
              textDecoration: 'none', fontSize: '0.875rem',
              fontWeight: 400, letterSpacing: '0.02em',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}>
              {link.label}
            </a>
          </li>
        ))}
        {config.features.booking && (
          <li>
            <a href="#agendamento" style={{
              background: 'linear-gradient(135deg, var(--primary-light), var(--rose))',
              color: 'white', padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: 500, fontSize: '0.875rem',
              textDecoration: 'none', transition: 'var(--transition)',
              display: 'inline-block',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(147,51,234,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
              Agendar agora
            </a>
          </li>
        )}
      </ul>

      {/* Hamburger */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Menu"
        style={{
          display: 'none', flexDirection: 'column', gap: '5px',
          cursor: 'pointer', background: 'none', border: 'none', padding: '4px',
          WebkitTapHighlightColor: 'transparent',
        }}
        className="sf-hamburger">
        {[0,1,2].map(i => (
          <span key={i} style={{
            width: '24px', height: '2px',
            background: 'var(--text-on-dark)',
            borderRadius: '2px', display: 'block',
            transition: 'var(--transition)',
            transform: open
              ? i === 0 ? 'rotate(45deg) translate(5px, 5px)'
              : i === 2 ? 'rotate(-45deg) translate(5px, -5px)'
              : 'scaleX(0)'
              : 'none',
          }} />
        ))}
      </button>

      {/* Mobile menu */}
      {open && (
        <div style={{
          position: 'fixed', top: 'var(--nav-height)', left: 0, right: 0,
          background: 'var(--bg-dark)',
          borderBottom: '1px solid rgba(212,175,138,0.2)',
          padding: '1.5rem var(--page-padding-x) 2rem',
          display: 'flex', flexDirection: 'column', gap: '1.25rem',
          zIndex: 999,
        }}>
          {links.map(link => (
            <a key={link.href} href={link.href}
              onClick={() => setOpen(false)}
              style={{
                color: 'rgba(255,255,255,0.75)',
                textDecoration: 'none', fontSize: '1rem',
              }}>
              {link.label}
            </a>
          ))}
          {config.features.booking && (
            <a href="#agendamento" onClick={() => setOpen(false)} style={{
              background: 'linear-gradient(135deg, var(--primary-light), var(--rose))',
              color: 'white', padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: 500, textDecoration: 'none',
              textAlign: 'center',
            }}>
              Agendar agora
            </a>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 767px) {
          .sf-hamburger { display: flex !important; }
        }
        @media (min-width: 768px) {
          .sf-hide-mobile { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
