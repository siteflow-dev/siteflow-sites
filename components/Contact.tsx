'use client'

import type { SiteFlowClientConfig } from '@/types'

interface ContactProps {
  config: SiteFlowClientConfig
}

export function Contact({ config }: ContactProps) {
  const { contact, hours } = config

  return (
    <>
      <section id="contato" style={{
        padding: 'var(--section-py-sm) var(--page-padding-x)',
        background: 'var(--bg-dark)',
        borderTop: '1px solid rgba(212,175,138,0.1)',
      }}>
        <div className="sf-container">
          <div className="sf-contato-grid reveal">
            {/* Info */}
            <div>
              <div style={{
                fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.15em',
                textTransform: 'uppercase', color: 'var(--accent)',
                marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span style={{ width: '24px', height: '1px', background: 'var(--accent)', display: 'inline-block' }} />
                Fale conosco
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-h1)',
                fontWeight: 700, color: 'var(--text-on-dark)',
                lineHeight: 1.15, marginBottom: '1.25rem',
              }}>
                Venha nos <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>visitar</span>
              </h2>
              <p style={{
                color: 'var(--text-on-dark-soft)', fontSize: '1rem',
                lineHeight: 1.8, marginBottom: '2rem', fontWeight: 300,
              }}>
                Estamos chegando à {contact.city}. Enquanto isso, agende pelo site ou fale com a gente pelo WhatsApp.
              </p>

              {/* Info items */}
              {[
                { icon: '📍', label: 'Endereço', val: contact.address || 'Em breve' },
                { icon: '⏰', label: 'Horário', val: 'Seg–Sáb: 9h às 20h · Dom: 9h às 16h' },
                contact.whatsapp && { icon: '📞', label: 'WhatsApp', val: `(${contact.whatsapp.substring(2,4)}) ${contact.whatsapp.substring(4,5)} ${contact.whatsapp.substring(5,9)}-${contact.whatsapp.substring(9)}` },
                contact.email && { icon: '📧', label: 'E-mail', val: contact.email },
              ].filter(Boolean).map((item: any, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem',
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: 'rgba(107,33,168,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', flexShrink: 0,
                    border: '1px solid rgba(147,51,234,0.2)',
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-on-dark-muted)' }}>{item.label}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-on-dark)' }}>{item.val}</div>
                  </div>
                </div>
              ))}

              {/* WhatsApp CTA */}
              <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                background: '#25D366', color: 'white',
                padding: '0.875rem 1.75rem', borderRadius: 'var(--radius-full)',
                textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem',
                marginTop: '1.5rem',
                boxShadow: '0 4px 16px rgba(37,211,102,0.3)',
                transition: 'var(--transition)',
                minHeight: 'var(--btn-height)',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Falar pelo WhatsApp
              </a>

              {/* Social links */}
              {(contact.instagram || contact.tiktok || contact.facebook) && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                  {contact.instagram && (
                    <a href={`https://instagram.com/${contact.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                      style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', textDecoration: 'none', transition: 'var(--transition)',
                        minHeight: 'var(--touch-target)', minWidth: '44px',
                      }}
                      title="Instagram">📸</a>
                  )}
                </div>
              )}
            </div>

            {/* Contact form */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(212,175,138,0.12)',
              borderRadius: '20px', padding: '2rem',
            }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '1.15rem',
                fontWeight: 700, color: 'var(--text-on-dark)', marginBottom: '1.5rem',
              }}>
                Envie uma mensagem
              </div>

              {[
                { label: 'Seu nome', type: 'text', placeholder: 'Como posso te chamar?' },
                { label: 'WhatsApp', type: 'tel', placeholder: '(11) 9 0000-0000' },
                { label: 'Assunto', type: 'text', placeholder: 'Dúvida, parceria, etc.' },
              ].map((field, i) => (
                <div key={i} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-on-dark-muted)', marginBottom: '0.4rem' }}>
                    {field.label}
                  </label>
                  <input type={field.type} placeholder={field.placeholder} style={{
                    width: '100%', minHeight: 'var(--input-height)',
                    padding: '0.75rem 1rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-body)', fontSize: '1rem',
                    color: 'white', background: 'rgba(255,255,255,0.06)',
                    outline: 'none', transition: 'var(--transition)',
                  }} />
                </div>
              ))}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-on-dark-muted)', marginBottom: '0.4rem' }}>
                  Mensagem
                </label>
                <textarea placeholder="Escreva sua mensagem..." style={{
                  width: '100%', minHeight: '100px',
                  padding: '0.75rem 1rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-body)', fontSize: '1rem',
                  color: 'white', background: 'rgba(255,255,255,0.06)',
                  outline: 'none', resize: 'vertical', transition: 'var(--transition)',
                }} />
              </div>

              <button style={{
                width: '100%', minHeight: 'var(--btn-height)',
                background: 'linear-gradient(135deg, var(--primary-light), var(--rose))',
                color: 'white', border: 'none',
                borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 500,
                cursor: 'pointer', transition: 'var(--transition)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                Enviar mensagem
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer style={{
        background: 'var(--bg-darker)',
        padding: '1.5rem var(--page-padding-x)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
        fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)',
      }}>
        <p>© {new Date().getFullYear()} {config.businessName} · Todos os direitos reservados ·{' '}
          <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Política de Privacidade</a>
          {' '}· Desenvolvido com 💜 pelo SiteFlow
        </p>
      </footer>
    </>
  )
}
