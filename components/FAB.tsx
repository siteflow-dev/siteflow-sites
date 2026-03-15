'use client'
import { useEffect } from 'react'

interface FABProps { whatsapp: string; bookingEnabled: boolean }

export function FAB({ bookingEnabled }: FABProps) {
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
    <>
      <style>{`
        .sf-fab { position:fixed;bottom:clamp(1.5rem,3vw,2rem);right:clamp(1.5rem,3vw,2rem);z-index:999;background:linear-gradient(135deg,var(--primary-light),var(--rose));color:white;border:none;border-radius:var(--radius-full);padding:0.875rem 1.5rem;font-family:var(--font-body);font-size:0.875rem;font-weight:500;cursor:pointer;box-shadow:0 4px 24px rgba(147,51,234,0.45);display:flex;align-items:center;gap:0.5rem;transition:all 0.3s;text-decoration:none;-webkit-tap-highlight-color:transparent;min-height:var(--btn-height); }
        .sf-fab:hover { transform:translateY(-3px) scale(1.02);box-shadow:0 8px 32px rgba(147,51,234,0.55); }
      `}</style>
      <a href="#agendamento" className="sf-fab">✦ Agendar agora</a>
    </>
  )
}
