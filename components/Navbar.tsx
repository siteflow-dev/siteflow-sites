'use client'

import { useState, useEffect } from 'react'
import type { SiteFlowClientConfig } from '@/types'

interface NavbarProps { config: SiteFlowClientConfig }

export function Navbar({ config }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    config.sections.services     && { href: '#servicos',  label: 'Serviços' },
    config.sections.team         && { href: '#equipe',    label: 'Equipe' },
    config.sections.gallery      && { href: '#galeria',   label: 'Galeria' },
    config.features.professionalPanel && { href: '#painel', label: 'Painel' },
    config.sections.contact      && { href: '#contato',   label: 'Contato' },
  ].filter(Boolean) as { href: string; label: string }[]

  return (
    <>
      <style>{`
        .sf-nav { position:fixed;top:0;left:0;right:0;z-index:1000;backdrop-filter:blur(20px);border-bottom:1px solid rgba(212,175,138,0.2);padding:0 var(--page-padding-x);height:var(--nav-height);display:flex;align-items:center;justify-content:space-between;transition:background 0.3s; }
        .sf-nav-logo { font-family:var(--font-display);font-size:1.6rem;font-weight:900;color:var(--text-on-dark);letter-spacing:-0.02em;text-decoration:none; }
        .sf-nav-logo span { color:var(--accent); }
        .sf-nav-links { display:flex;gap:2rem;align-items:center;list-style:none;margin:0;padding:0; }
        .sf-nav-link { color:rgba(255,255,255,0.75);text-decoration:none;font-size:0.875rem;font-weight:400;letter-spacing:0.02em;transition:color 0.3s; }
        .sf-nav-link:hover { color:var(--accent); }
        .sf-nav-cta { background:linear-gradient(135deg,var(--primary-light),var(--rose));color:white;padding:0.5rem 1.25rem;border-radius:var(--radius-full);font-weight:500;font-size:0.875rem;text-decoration:none;transition:all 0.3s;display:inline-block;min-height:44px;line-height:2; }
        .sf-nav-cta:hover { transform:translateY(-1px);box-shadow:0 4px 16px rgba(147,51,234,0.4); }
        .sf-hamburger { display:none;flex-direction:column;gap:5px;cursor:pointer;background:none;border:none;padding:4px;-webkit-tap-highlight-color:transparent; }
        .sf-hamburger span { width:24px;height:2px;background:var(--text-on-dark);border-radius:2px;display:block;transition:all 0.3s; }
        .sf-mobile-menu { position:fixed;top:var(--nav-height);left:0;right:0;background:var(--bg-dark);border-bottom:1px solid rgba(212,175,138,0.2);padding:1.5rem var(--page-padding-x) 2rem;display:flex;flex-direction:column;gap:1.25rem;z-index:999; }
        .sf-mobile-link { color:rgba(255,255,255,0.75);text-decoration:none;font-size:1rem; }
        .sf-mobile-cta { background:linear-gradient(135deg,var(--primary-light),var(--rose));color:white;padding:0.75rem 1.25rem;border-radius:var(--radius-full);font-weight:500;text-decoration:none;text-align:center; }
        @media (max-width:767px) { .sf-nav-links{display:none!important} .sf-hamburger{display:flex!important} }
      `}</style>

      <nav className="sf-nav" style={{ background: scrolled ? 'rgba(13,13,13,0.97)' : 'rgba(13,13,13,0.92)' }}>
        <a href="#hero" className="sf-nav-logo">
          {config.businessName.split(' ')[0]}{' '}
          <span>{config.businessName.split(' ').slice(1).join(' ')}</span>
        </a>

        <ul className="sf-nav-links">
          {links.map(link => (
            <li key={link.href}>
              <a href={link.href} className="sf-nav-link">{link.label}</a>
            </li>
          ))}
          {config.features.booking && (
            <li><a href="#agendamento" className="sf-nav-cta">Agendar agora</a></li>
          )}
        </ul>

        <button onClick={() => setOpen(!open)} aria-label="Menu" className="sf-hamburger">
          {[0,1,2].map(i => (
            <span key={i} style={{
              transform: open
                ? i===0 ? 'rotate(45deg) translate(5px,5px)' : i===2 ? 'rotate(-45deg) translate(5px,-5px)' : 'scaleX(0)'
                : 'none',
            }} />
          ))}
        </button>
      </nav>

      {open && (
        <div className="sf-mobile-menu">
          {links.map(link => (
            <a key={link.href} href={link.href} className="sf-mobile-link" onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          {config.features.booking && (
            <a href="#agendamento" className="sf-mobile-cta" onClick={() => setOpen(false)}>
              Agendar agora
            </a>
          )}
        </div>
      )}
    </>
  )
}
