'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import type { Service, Professional } from '@/types'

// ─── TIPOS ──────────────────────────────────────────────────────────────────

interface BookingState {
  step: number
  clientName: string
  clientPhone: string
  service: Service | null
  professional: { id: string; name: string; initials: string; role: string } | null
  date: string | null
  time: string | null
}

interface BookingFlowProps {
  clientId: string
  whatsapp: string
  services: Service[]
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const MONTHS_SHORT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
const DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const SLOT_INTERVAL = 30 // minutos

function generateSlots(open = '08:00', close = '19:00'): string[] {
  const slots: string[] = []
  const [oh, om] = open.split(':').map(Number)
  const [ch, cm] = close.split(':').map(Number)
  for (let t = oh * 60 + om; t < ch * 60 + cm; t += SLOT_INTERVAL) {
    slots.push(`${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`)
  }
  return slots
}

function formatDateLabel(ds: string): string {
  const today = new Date(); today.setHours(0,0,0,0)
  const d = new Date(ds + 'T12:00:00')
  if (d.toDateString() === today.toDateString()) return 'Hoje'
  const tom = new Date(today); tom.setDate(tom.getDate()+1)
  if (d.toDateString() === tom.toDateString()) return 'Amanhã'
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`
}

// ─── ESTILOS BASE ────────────────────────────────────────────────────────────

const S = {
  panel: {
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    padding: 'clamp(1.5rem, 4vw, 2.5rem)',
    boxShadow: 'var(--shadow-card)',
  } as React.CSSProperties,

  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.25rem', fontWeight: 700,
    color: 'var(--text-base)', marginBottom: '1.75rem',
  } as React.CSSProperties,

  btnPrimary: {
    background: 'linear-gradient(135deg, var(--primary-light), var(--rose))',
    color: 'white', border: 'none',
    padding: '0.75rem 2rem', borderRadius: 'var(--radius-full)',
    fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.3s ease',
    boxShadow: '0 2px 12px rgba(147,51,234,0.3)',
    flex: 1, maxWidth: '240px',
    minHeight: '48px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  } as React.CSSProperties,

  btnBack: {
    background: 'none', border: '1px solid var(--border-color)',
    padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)',
    fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-base)',
    cursor: 'pointer', transition: 'all 0.3s ease',
    minHeight: '48px',
  } as React.CSSProperties,

  input: {
    width: '100%', minHeight: '48px',
    padding: '0.75rem 1rem',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-body)', fontSize: '1rem',
    color: 'var(--text-base)', background: 'white',
    outline: 'none', transition: 'all 0.3s ease',
    WebkitAppearance: 'none' as any,
  } as React.CSSProperties,
}

// ─── STEP INDICATOR ─────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  const steps = ['Dados', 'Serviço', 'Profissional', 'Horário', 'Confirmar']
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem' }}>
      {steps.map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', flex: '1', maxWidth: '100px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: i < step ? 'var(--primary-dark)' : i === step
                ? 'linear-gradient(135deg, var(--primary-light), var(--rose))'
                : 'var(--border-color)',
              color: i <= step ? 'white' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 600,
              boxShadow: i === step ? '0 0 0 4px rgba(147,51,234,0.15)' : 'none',
              border: i < step ? 'none' : i === step ? 'none' : '2px solid var(--border-color)',
              transition: 'all 0.3s ease',
            }}>
              {i < step ? '✓' : i + 1}
            </div>
            <span style={{
              fontSize: '0.65rem',
              color: i === step ? 'var(--primary-light)' : 'var(--text-muted)',
              fontWeight: i === step ? 600 : 400,
              textAlign: 'center',
              display: typeof window !== 'undefined' && window.innerWidth < 480 ? 'none' : 'block',
            }}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              height: '2px', width: 'clamp(20px, 5vw, 60px)',
              background: i < step ? 'var(--primary-dark)' : 'var(--border-color)',
              marginBottom: typeof window !== 'undefined' && window.innerWidth < 480 ? 0 : '20px',
              transition: 'background 0.3s ease', flexShrink: 0,
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── STEP 0: DADOS DO CLIENTE ────────────────────────────────────────────────

function StepDados({ state, onChange, onNext }: {
  state: BookingState
  onChange: (k: keyof BookingState, v: string) => void
  onNext: (name?: string, phone?: string) => void
}) {
  const handleSocial = (name: string, phone: string) => {
    onNext(name, phone)
  }

  return (
    <div>
      <div style={S.title}>Seus dados para agendamento</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { icon: <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>, label: 'Continuar com Google', onClick: () => handleSocial('Maria Fernanda', '(11) 9 8888-0001'), bg: 'white', border: 'var(--border-color)', color: 'var(--text-base)' },
          { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>, label: 'Continuar com WhatsApp', onClick: () => handleSocial('Cliente Demo', '(11) 9 8888-0002'), bg: '#25D366', border: '#25D366', color: 'white' },
        ].map((btn, i) => (
          <button key={i} onClick={btn.onClick} style={{
            display: 'flex', alignItems: 'center', gap: '0.875rem',
            padding: '0.875rem 1.25rem', borderRadius: 'var(--radius-sm)',
            border: `1px solid ${btn.border}`, background: btn.bg,
            cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.9rem',
            fontWeight: 500, color: btn.color, transition: 'all 0.3s ease',
            width: '100%', minHeight: '48px',
            WebkitTapHighlightColor: 'transparent',
          }}>
            {btn.icon} {btn.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.25rem 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        ou preencha seus dados
        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
      </div>

      {[
        { label: 'Nome completo', key: 'clientName' as const, type: 'text', placeholder: 'Seu nome' },
        { label: 'WhatsApp', key: 'clientPhone' as const, type: 'tel', placeholder: '(11) 9 0000-0000' },
      ].map(field => (
        <div key={field.key} style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            {field.label}
          </label>
          <input
            type={field.type}
            placeholder={field.placeholder}
            value={state[field.key] as string}
            onChange={e => onChange(field.key, e.target.value)}
            style={S.input}
            onFocus={e => e.target.style.borderColor = 'var(--primary-light)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          />
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
        <button onClick={() => onNext()} style={S.btnPrimary}>Continuar →</button>
      </div>
    </div>
  )
}

// ─── STEP 1: SERVIÇO ─────────────────────────────────────────────────────────

function StepServico({ services, selected, onSelect, onBack, onNext }: {
  services: Service[]
  selected: Service | null
  onSelect: (s: Service) => void
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div>
      <div style={S.title}>Qual serviço você deseja?</div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 100%), 1fr))',
        gap: '0.75rem', marginBottom: '1.25rem',
      }}>
        {services.filter(s => s.active).map(svc => (
          <div key={svc.id} onClick={() => onSelect(svc)} style={{
            border: `2px solid ${selected?.id === svc.id ? 'var(--primary-light)' : 'var(--border-color)'}`,
            background: selected?.id === svc.id ? 'var(--primary-xlight)' : 'white',
            borderRadius: 'var(--radius-sm)', padding: '1rem',
            cursor: 'pointer', transition: 'all 0.3s ease',
            WebkitTapHighlightColor: 'transparent',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{svc.emoji}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-base)' }}>{svc.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary-light)', marginTop: '0.2rem' }}>⏱ {svc.durationLabel}</div>
          </div>
        ))}
      </div>

      {selected && (
        <div style={{ background: 'var(--bg-soft)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
          <strong>{selected.emoji} {selected.name}</strong>
          <div style={{ color: 'var(--text-muted)', marginTop: '0.3rem', fontSize: '0.8rem' }}>
            Duração: {selected.durationLabel} · {selected.description}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.75rem', gap: '1rem' }}>
        <button onClick={onBack} style={S.btnBack}>← Voltar</button>
        <button onClick={onNext} disabled={!selected} style={{ ...S.btnPrimary, opacity: selected ? 1 : 0.5, cursor: selected ? 'pointer' : 'not-allowed' }}>
          Continuar →
        </button>
      </div>
    </div>
  )
}

// ─── STEP 2: PROFISSIONAL ────────────────────────────────────────────────────

function StepProfissional({ professionals, selected, onSelect, onBack, onNext }: {
  professionals: Array<{ id: string; name: string; initials: string; role: string; specialties: string[] }>
  selected: BookingState['professional']
  onSelect: (p: BookingState['professional']) => void
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div>
      <div style={S.title}>Escolha a profissional</div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(140px, 100%), 1fr))',
        gap: '0.75rem', marginBottom: '1.25rem',
      }}>
        {professionals.map(prof => (
          <div key={prof.id} onClick={() => onSelect(prof)} style={{
            border: `2px solid ${selected?.id === prof.id ? 'var(--primary-light)' : 'var(--border-color)'}`,
            background: selected?.id === prof.id ? 'var(--primary-xlight)' : 'white',
            borderRadius: 'var(--radius-sm)', padding: '1rem',
            cursor: 'pointer', transition: 'all 0.3s ease',
            textAlign: 'center',
            WebkitTapHighlightColor: 'transparent',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-light), var(--rose))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem',
              color: 'white', margin: '0 auto 0.5rem',
            }}>
              {prof.initials}
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-base)' }}>{prof.name.split(' ')[0]}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{prof.role}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.75rem', gap: '1rem' }}>
        <button onClick={onBack} style={S.btnBack}>← Voltar</button>
        <button onClick={onNext} disabled={!selected} style={{ ...S.btnPrimary, opacity: selected ? 1 : 0.5, cursor: selected ? 'pointer' : 'not-allowed' }}>
          Continuar →
        </button>
      </div>
    </div>
  )
}

// ─── STEP 3: HORÁRIO ─────────────────────────────────────────────────────────

function StepHorario({ clientId, professional, selectedDate, selectedTime, onSelectDate, onSelectTime, onBack, onNext }: {
  clientId: string
  professional: BookingState['professional']
  selectedDate: string | null
  selectedTime: string | null
  onSelectDate: (d: string) => void
  onSelectTime: (t: string) => void
  onBack: () => void
  onNext: () => void
}) {
  const today = new Date(); today.setHours(0,0,0,0)
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [occupied, setOccupied] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const fetchOccupied = useCallback(async (date: string, profId: string) => {
    setLoadingSlots(true)
    try {
      const sb = getSupabaseClient()
      const { data } = await sb
        .from('appointments')
        .select('time')
        .eq('client_id', clientId)
        .eq('professional_id', profId)
        .eq('date', date)
        .in('status', ['pending', 'confirmed'])
      setOccupied((data || []).map((r: any) => r.time.substring(0, 5)))
    } catch {
      setOccupied([])
    } finally {
      setLoadingSlots(false)
    }
  }, [clientId])

  useEffect(() => {
    if (selectedDate && professional) {
      fetchOccupied(selectedDate, professional.id)
    }
  }, [selectedDate, professional, fetchOccupied])

  const changeMonth = (dir: number) => {
    let m = calMonth + dir
    let y = calYear
    if (m > 11) { m = 0; y++ }
    if (m < 0) { m = 11; y-- }
    setCalMonth(m); setCalYear(y)
  }

  const first = new Date(calYear, calMonth, 1).getDay()
  const total = new Date(calYear, calMonth + 1, 0).getDate()
  const slots = generateSlots()

  const handleDateClick = (ds: string) => {
    onSelectDate(ds)
    onSelectTime('')
  }

  return (
    <div>
      <div style={S.title}>Escolha a data e horário</div>

      {/* Calendar header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button onClick={() => changeMonth(-1)} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.9rem', minHeight: '44px' }}>‹</button>
        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{MONTHS[calMonth]} {calYear}</span>
        <button onClick={() => changeMonth(1)} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.9rem', minHeight: '44px' }}>›</button>
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '1.5rem' }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, padding: '0.25rem 0' }}>{d}</div>
        ))}
        {Array.from({ length: first }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: total }).map((_, i) => {
          const d = i + 1
          const date = new Date(calYear, calMonth, d)
          const isPast = date < today
          const isSun = date.getDay() === 0
          const isToday = date.toDateString() === today.toDateString()
          const ds = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
          const isSel = selectedDate === ds
          const disabled = isPast || isSun

          return (
            <div key={d} onClick={() => !disabled && handleDateClick(ds)} style={{
              textAlign: 'center', padding: '0.5rem 0.25rem',
              fontSize: '0.85rem', borderRadius: '6px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              background: isSel ? 'var(--primary-light)' : 'transparent',
              color: isSel ? 'white' : disabled ? 'var(--cinza-mid, #E8DFF0)' : isToday ? 'var(--primary)' : 'var(--text-base)',
              fontWeight: isSel ? 600 : isToday ? 700 : 400,
              WebkitTapHighlightColor: 'transparent',
            }}>
              {d}
            </div>
          )
        })}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-base)', marginBottom: '0.75rem' }}>
            {loadingSlots ? 'Carregando horários...' : 'Horários disponíveis'}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
            gap: '0.5rem', marginBottom: '1.5rem',
          }}>
            {slots.map(t => {
              const isOcc = occupied.includes(t)
              const isSel = selectedTime === t
              return (
                <div key={t} onClick={() => !isOcc && onSelectTime(t)} style={{
                  textAlign: 'center', padding: '0.6rem 0.5rem',
                  border: `1px solid ${isSel ? 'var(--primary-light)' : isOcc ? 'var(--border-color)' : 'var(--border-color)'}`,
                  borderRadius: '6px', fontSize: '0.8rem',
                  cursor: isOcc ? 'not-allowed' : 'pointer',
                  background: isSel ? 'var(--primary-light)' : isOcc ? 'var(--bg-soft)' : 'white',
                  color: isSel ? 'white' : isOcc ? 'var(--text-muted)' : 'var(--text-base)',
                  fontWeight: isSel ? 600 : 400,
                  textDecoration: isOcc ? 'line-through' : 'none',
                  transition: 'all 0.2s ease',
                  minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  WebkitTapHighlightColor: 'transparent',
                }}>
                  {t}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.75rem', gap: '1rem' }}>
        <button onClick={onBack} style={S.btnBack}>← Voltar</button>
        <button onClick={onNext} disabled={!selectedDate || !selectedTime} style={{ ...S.btnPrimary, opacity: selectedDate && selectedTime ? 1 : 0.5, cursor: selectedDate && selectedTime ? 'pointer' : 'not-allowed' }}>
          Continuar →
        </button>
      </div>
    </div>
  )
}

// ─── STEP 4: CONFIRMAÇÃO ─────────────────────────────────────────────────────

function StepConfirmacao({ state, onBack, onSubmit, submitting }: {
  state: BookingState
  onBack: () => void
  onSubmit: () => void
  submitting: boolean
}) {
  const dateStr = state.date
    ? new Date(state.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''

  const rows = [
    { label: 'Nome', val: state.clientName },
    { label: 'WhatsApp', val: state.clientPhone },
    { label: 'Serviço', val: `${state.service?.emoji} ${state.service?.name}` },
    { label: 'Duração', val: state.service?.durationLabel },
    { label: 'Profissional', val: state.professional?.name },
    { label: 'Data', val: dateStr },
    { label: 'Horário', val: state.time },
  ]

  return (
    <div>
      <div style={S.title}>Confirme seu agendamento</div>

      <div style={{ background: 'var(--bg-soft)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', marginBottom: '1.5rem' }}>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.5rem 0', fontSize: '0.875rem',
            borderBottom: i < rows.length - 1 ? '1px solid var(--border-color)' : 'none',
          }}>
            <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
            <span style={{ fontWeight: 500, color: 'var(--text-base)' }}>{r.val}</span>
          </div>
        ))}
      </div>

      <div style={{
        background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.2)',
        borderRadius: 'var(--radius-sm)', padding: '1rem',
        fontSize: '0.82rem', color: '#92400E', lineHeight: 1.6, marginBottom: '1.25rem',
      }}>
        ⏳ Após o envio, sua profissional receberá uma notificação e <strong>confirmará o agendamento</strong> em até 30 minutos. Você receberá confirmação via WhatsApp.
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.75rem', gap: '1rem' }}>
        <button onClick={onBack} style={S.btnBack} disabled={submitting}>← Voltar</button>
        <button onClick={onSubmit} disabled={submitting} style={{ ...S.btnPrimary, opacity: submitting ? 0.7 : 1 }}>
          {submitting ? 'Enviando...' : 'Enviar agendamento ✓'}
        </button>
      </div>
    </div>
  )
}

// ─── STEP 5: SUCESSO ─────────────────────────────────────────────────────────

function StepSucesso({ state, whatsapp, onReset }: {
  state: BookingState
  whatsapp: string
  onReset: () => void
}) {
  const dateStr = state.date
    ? new Date(state.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''

  const waMessage = encodeURIComponent(
    `Olá! Acabei de agendar pelo site:\n\n` +
    `📅 ${dateStr} às ${state.time}\n` +
    `💇 ${state.service?.name}\n` +
    `👩 ${state.professional?.name}\n\n` +
    `Aguardo confirmação! 😊`
  )

  return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
        border: '2px solid rgba(34,197,94,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2.5rem', margin: '0 auto 1.5rem',
      }}>✓</div>

      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-base)', marginBottom: '0.75rem' }}>
        Agendamento enviado!
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '400px', margin: '0 auto 1.5rem' }}>
        Sua solicitação foi enviada para <strong>{state.professional?.name}</strong>. Você receberá a confirmação em breve.
      </p>

      {/* Resumo */}
      <div style={{ background: 'var(--bg-soft)', borderRadius: 'var(--radius-sm)', padding: '1rem', maxWidth: '320px', margin: '0 auto 1.5rem', fontSize: '0.875rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ color: 'var(--text-muted)' }}>Serviço</span>
          <span style={{ fontWeight: 500 }}>{state.service?.emoji} {state.service?.name}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ color: 'var(--text-muted)' }}>Data e hora</span>
          <span style={{ fontWeight: 500 }}>{dateStr} às {state.time}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0' }}>
          <span style={{ color: 'var(--text-muted)' }}>Profissional</span>
          <span style={{ fontWeight: 500 }}>{state.professional?.name}</span>
        </div>
      </div>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(234,179,8,0.1)', color: '#854D0E', border: '1px solid rgba(234,179,8,0.3)', marginBottom: '2rem' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#CA8A04' }} />
        Aguardando confirmação da profissional
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
        <a href={`https://wa.me/${whatsapp}?text=${waMessage}`} target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: '#25D366', color: 'white', padding: '0.75rem 1.5rem',
          borderRadius: 'var(--radius-full)', textDecoration: 'none',
          fontSize: '0.9rem', fontWeight: 500, minHeight: '48px',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Confirmar pelo WhatsApp
        </a>

        <button onClick={onReset} style={{
          background: 'linear-gradient(135deg, var(--primary-light), var(--rose))',
          color: 'white', border: 'none', padding: '0.75rem 2rem',
          borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-body)',
          fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', minHeight: '48px',
        }}>
          Fazer novo agendamento
        </button>
      </div>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────

export function BookingFlow({ clientId, whatsapp, services }: BookingFlowProps) {
  const [state, setState] = useState<BookingState>({
    step: 0, clientName: '', clientPhone: '',
    service: null, professional: null, date: null, time: null,
  })
  const [professionals, setProfessionals] = useState<Array<{ id: string; name: string; initials: string; role: string; specialties: string[] }>>([])
  const [dbServices, setDbServices] = useState<Array<{ id: string; slug: string }>>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar profissionais do Supabase
  useEffect(() => {
    async function fetchProfessionals() {
      try {
        const sb = getSupabaseClient()
        const { data } = await sb
          .from('professionals')
          .select('id, name, initials, role, specialties')
          .eq('client_id', clientId)
          .eq('active', true)
          .eq('accepts_booking', true)
        if (data && data.length > 0) {
          setProfessionals(data)
        }
      } catch {
        // fallback silencioso
      }
    }
    fetchProfessionals()

    async function fetchServices() {
      try {
        const sb = getSupabaseClient()
        const { data } = await sb
          .from('services')
          .select('id, slug')
          .eq('client_id', clientId)
          .eq('active', true)
        if (data && data.length > 0) setDbServices(data)
      } catch { /* fallback silencioso */ }
    }
    fetchServices()
  }, [clientId])

  const update = (k: keyof BookingState, v: any) => setState(prev => ({ ...prev, [k]: v }))

  const goNext = (overrideName?: string, overridePhone?: string) => {
    const name = overrideName ?? state.clientName
    const phone = overridePhone ?? state.clientPhone
    if (state.step === 0 && (!name.trim() || !phone.trim())) {
      setError('Preencha seu nome e WhatsApp para continuar'); return
    }
    setError(null)
    setState(prev => ({ ...prev, step: prev.step + 1, clientName: name, clientPhone: phone }))
    document.getElementById('agendamento')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const goBack = () => {
    setError(null)
    setState(prev => ({ ...prev, step: prev.step - 1 }))
    document.getElementById('agendamento')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const submit = async () => {
    if (!state.service || !state.professional || !state.date || !state.time) return
    setSubmitting(true)
    setError(null)
    try {
      const sb = getSupabaseClient()
      const { error: err } = await sb.from('appointments').insert({
        client_id:       clientId,
        client_name:     state.clientName,
        client_phone:    state.clientPhone,
        service_id:      dbServices.find(s => s.slug === state.service?.slug || s.slug === state.service?.id)?.id ?? state.service.id,
        professional_id: state.professional.id,
        date:            state.date,
        time:            state.time + ':00',
        status:          'pending',
        source:          'website',
      })
      if (err) throw new Error(err.message)
      setState(prev => ({ ...prev, step: 5 }))
    } catch (e: any) {
      setError('Erro ao enviar agendamento. Tente novamente ou fale pelo WhatsApp.')
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setState({ step: 0, clientName: '', clientPhone: '', service: null, professional: null, date: null, time: null })
    setError(null)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {state.step < 5 && <StepIndicator step={state.step} />}

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#991B1B', marginBottom: '1rem' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={S.panel}>
        {state.step === 0 && <StepDados state={state} onChange={update} onNext={goNext} />}
        {state.step === 1 && <StepServico services={services} selected={state.service} onSelect={s => update('service', s)} onBack={goBack} onNext={goNext} />}
        {state.step === 2 && <StepProfissional professionals={professionals} selected={state.professional} onSelect={p => update('professional', p)} onBack={goBack} onNext={goNext} />}
        {state.step === 3 && <StepHorario clientId={clientId} professional={state.professional} selectedDate={state.date} selectedTime={state.time} onSelectDate={d => update('date', d)} onSelectTime={t => update('time', t)} onBack={goBack} onNext={goNext} />}
        {state.step === 4 && <StepConfirmacao state={state} onBack={goBack} onSubmit={submit} submitting={submitting} />}
        {state.step === 5 && <StepSucesso state={state} whatsapp={whatsapp} onReset={reset} />}
      </div>
    </div>
  )
}
