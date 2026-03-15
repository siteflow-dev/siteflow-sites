'use client'

import { useEffect } from 'react'

interface FABProps {
  whatsapp: string
  bookingEnabled: boolean
}

export function FAB({ bookingEnabled }: FABProps) {
  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  if (!bookingEnabled) return null

  return (
    <a href="#agendamento" style={{
      position: 'fixed', bottom: 'clamp(1.5rem, 3vw, 2rem)', right: 'clamp(1.5rem, 3vw, 2rem)',
      zIndex: 999,
      background: 'linear-gradient(135deg, var(--primary-light), var(--rose))',
      color: 'white', border: 'none', borderRadius: 'var(--radius-full)',
      padding: '0.875rem 1.5rem',
      fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 500,
      cursor: 'pointer', boxShadow: '0 4px 24px rgba(147,51,234,0.45)',
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      transition: 'var(--transition)', textDecoration: 'none',
      WebkitTapHighlightColor: 'transparent',
      minHeight: 'var(--btn-height)',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(147,51,234,0.55)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = ''
      e.currentTarget.style.boxShadow = '0 4px 24px rgba(147,51,234,0.45)'
    }}>
      ✦ Agendar agora
    </a>
  )
}
