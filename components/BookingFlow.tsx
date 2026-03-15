'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import type { Service } from '@/types'

// ─── TIPOS ───────────────────────────────────────────────────────────────────

interface BookingState {
  step: number
  clientName: string
  clientPhone: string
  services: Service[]
  professionalId: string
  professionalName: string
  date: string
  time: string
}

interface Professional {
  id: string
  name: string
  initials: string
  role: string
}

interface BookingFlowProps {
  clientId: string
  whatsapp: string
  services: Service[]
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function maskPhone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}

function generateSlots(): string[] {
  const slots: string[] = []
  for (let t = 8*60; t < 19*60; t += 30) {
    slots.push(`${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`)
  }
  return slots
}

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAYS_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

const INIT: BookingState = {
  step: 0, clientName: '', clientPhone: '',
  services: [], professionalId: '', professionalName: '',
  date: '', time: '',
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────

export function BookingFlow({ clientId, whatsapp, services }: BookingFlowProps) {
  const [state, setState] = useState<BookingState>(INIT)
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [occupied, setOccupied] = useState<string[]>([])
  const [dbServices, setDbServices] = useState<Array<{id: string; slug: string}>>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [calYear, setCalYear] = useState(() => new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth())

  // Buscar profissionais
  useEffect(() => {
    getSupabaseClient()
      .from('professionals')
      .select('id, name, initials, role')
      .eq('client_id', clientId)
      .eq('active', true)
      .eq('accepts_booking', true)
      .then(({ data }) => { if (data) setProfessionals(data) })
  }, [clientId])

  // Buscar serviços do banco (para UUID correto)
  useEffect(() => {
    getSupabaseClient()
      .from('services')
      .select('id, slug')
      .eq('client_id', clientId)
      .eq('active', true)
      .then(({ data }) => { if (data) setDbServices(data) })
  }, [clientId])

  // Buscar horários ocupados
  const fetchOccupied = useCallback(async (date: string, profId: string) => {
    if (!date || !profId) return
    const { data } = await getSupabaseClient()
      .from('appointments')
      .select('time')
      .eq('client_id', clientId)
      .eq('professional_id', profId)
      .eq('date', date)
      .in('status', ['pending', 'confirmed'])
    setOccupied((data || []).map((r: any) => r.time.substring(0, 5)))
  }, [clientId])

  useEffect(() => {
    if (state.date && state.professionalId) {
      fetchOccupied(state.date, state.professionalId)
    }
  }, [state.date, state.professionalId, fetchOccupied])

  // ── Handlers ──────────────────────────────────────────────────────────────

  function set<K extends keyof BookingState>(k: K, v: BookingState[K]) {
    setState(prev => ({ ...prev, [k]: v }))
  }

  function next() {
    if (state.step === 0 && (!state.clientName.trim() || !state.clientPhone.trim())) {
      setError('Preencha seu nome e WhatsApp para continuar')
      return
    }
    if (state.step === 1 && state.services.length === 0) {
      setError('Selecione ao menos um serviço')
      return
    }
    setError('')
    setState(prev => ({ ...prev, step: prev.step + 1 }))
    document.getElementById('agendamento')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function back() {
    setError('')
    setState(prev => ({ ...prev, step: prev.step - 1 }))
    document.getElementById('agendamento')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function toggleService(svc: Service) {
    const exists = state.services.some(s => s.id === svc.id)
    set('services', exists ? state.services.filter(s => s.id !== svc.id) : [...state.services, svc])
  }

  function selectProfessional(p: Professional) {
    setState(prev => ({ ...prev, professionalId: p.id, professionalName: p.name }))
  }

  function selectDate(d: string) {
    setState(prev => ({ ...prev, date: d, time: '' }))
  }

  function changeMonth(dir: number) {
    let m = calMonth + dir, y = calYear
    if (m > 11) { m = 0; y++ }
    if (m < 0) { m = 11; y-- }
    setCalMonth(m); setCalYear(y)
  }

  async function submit() {
    if (!state.services.length || !state.professionalId || !state.date || !state.time) return
    setSubmitting(true)
    setError('')
    try {
      const svcId = dbServices.find(s =>
        s.slug === state.services[0]?.slug || s.slug === state.services[0]?.id
      )?.id ?? state.services[0]?.id
      const { error: err } = await getSupabaseClient().from('appointments').insert({
        client_id: clientId,
        client_name: state.clientName,
        client_phone: state.clientPhone,
        service_id: svcId,
        professional_id: state.professionalId,
        date: state.date,
        time: state.time + ':00',
        status: 'pending',
        source: 'website',
        notes: state.services.map(s => s.name).join(' + '),
      })
      if (err) throw new Error(err.message)
      setState(prev => ({ ...prev, step: 5 }))
    } catch {
      setError('Erro ao enviar. Tente novamente ou fale pelo WhatsApp.')
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setState(INIT)
    setError('')
  }

  // ── Dados para confirmação ─────────────────────────────────────────────────

  const today = new Date(); today.setHours(0,0,0,0)
  const firstDay = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const slots = generateSlots()
  const dateLabel = state.date
    ? new Date(state.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''

  // ── Steps ─────────────────────────────────────────────────────────────────

  const STEPS = ['Dados', 'Serviço', 'Profissional', 'Horário', 'Confirmar']

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>

      {/* Step indicator */}
      {state.step < 5 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem' }}>
          {STEPS.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: i < state.step ? '#4C1D95' : i === state.step ? 'linear-gradient(135deg, #7C3AED, #C77DBE)' : '#E8DFF0',
                  color: i <= state.step ? 'white' : '#6B7280',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: 600,
                  boxShadow: i === state.step ? '0 0 0 4px rgba(147,51,234,0.15)' : 'none',
                }}>
                  {i < state.step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.65rem', color: i === state.step ? '#7C3AED' : '#6B7280', fontWeight: i === state.step ? 600 : 400 }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ height: '2px', width: 'clamp(16px,4vw,48px)', background: i < state.step ? '#4C1D95' : '#E8DFF0', marginBottom: '20px', flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#991B1B', marginBottom: '1rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Panel */}
      <div style={{ background: 'white', border: '1px solid #E8DFF0', borderRadius: '20px', padding: 'clamp(1.5rem,4vw,2.5rem)', boxShadow: '0 4px 24px rgba(107,33,168,0.08)' }}>

        {/* STEP 0: DADOS */}
        {state.step === 0 && (
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: '#0D0D0D', marginBottom: '1.75rem' }}>
              Seus dados para agendamento
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#6B7280', marginBottom: '0.4rem' }}>Nome completo</label>
              <input
                type="text"
                placeholder="Seu nome"
                value={state.clientName}
                onChange={e => { set('clientName', e.target.value) }}
                style={{ width: '100%', minHeight: '48px', padding: '0.75rem 1rem', border: '1px solid #E8DFF0', borderRadius: '8px', fontFamily: 'var(--font-body)', fontSize: '1rem', color: '#0D0D0D', background: 'white', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#6B7280', marginBottom: '0.4rem' }}>WhatsApp</label>
              <input
                type="tel"
                placeholder="(11) 9 0000-0000"
                value={state.clientPhone}
                onChange={e => { set('clientPhone', maskPhone(e.target.value)) }}
                style={{ width: '100%', minHeight: '48px', padding: '0.75rem 1rem', border: '1px solid #E8DFF0', borderRadius: '8px', fontFamily: 'var(--font-body)', fontSize: '1rem', color: '#0D0D0D', background: 'white', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
              <button onClick={next} style={{ background: 'linear-gradient(135deg,#7C3AED,#C77DBE)', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '999px', fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', minHeight: '48px' }}>
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: SERVIÇOS */}
        {state.step === 1 && (
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: '#0D0D0D', marginBottom: '1.75rem' }}>
              Qual serviço você deseja?
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(160px,100%),1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {services.filter(s => s.active).map(svc => {
                const selected = state.services.some(s => s.id === svc.id)
                return (
                  <div key={svc.id} onClick={() => { toggleService(svc) }} style={{ border: `2px solid ${selected ? '#7C3AED' : '#E8DFF0'}`, background: selected ? '#F3E8FF' : 'white', borderRadius: '8px', padding: '1rem', cursor: 'pointer' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{svc.emoji}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0D0D0D' }}>{svc.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#7C3AED', marginTop: '0.2rem' }}>⏱ {svc.durationLabel}</div>
                  </div>
                )
              })}
            </div>
            {state.services.length > 0 && (
              <div style={{ background: '#F3E8FF', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 600, color: '#6B21A8', marginBottom: '0.4rem' }}>{state.services.length} serviço{state.services.length > 1 ? 's' : ''} selecionado{state.services.length > 1 ? 's' : ''}</div>
                {state.services.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0', fontSize: '0.8rem' }}>
                    <span>{s.emoji} {s.name}</span>
                    <span style={{ color: '#6B7280' }}>{s.durationLabel}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #E8DFF0', marginTop: '0.5rem', paddingTop: '0.5rem', fontSize: '0.8rem', color: '#6B21A8', fontWeight: 600 }}>
                  Total: {state.services.reduce((a, s) => a + s.durationMin, 0)} min
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1.75rem' }}>
              <button onClick={back} style={{ background: 'none', border: '1px solid #E8DFF0', padding: '0.75rem 1.5rem', borderRadius: '999px', fontFamily: 'var(--font-body)', fontSize: '0.9rem', cursor: 'pointer', minHeight: '48px' }}>← Voltar</button>
              <button onClick={next} disabled={state.services.length === 0} style={{ background: 'linear-gradient(135deg,#7C3AED,#C77DBE)', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '999px', fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 500, cursor: state.services.length > 0 ? 'pointer' : 'not-allowed', opacity: state.services.length > 0 ? 1 : 0.5, minHeight: '48px' }}>
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PROFISSIONAL */}
        {state.step === 2 && (
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: '#0D0D0D', marginBottom: '1.75rem' }}>
              Escolha a profissional
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(140px,100%),1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {professionals.map(prof => {
                const selected = state.professionalId === prof.id
                return (
                  <div key={prof.id} onClick={() => { selectProfessional(prof) }} style={{ border: `2px solid ${selected ? '#7C3AED' : '#E8DFF0'}`, background: selected ? '#F3E8FF' : 'white', borderRadius: '8px', padding: '1rem', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#C77DBE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'white', margin: '0 auto 0.5rem' }}>
                      {prof.initials}
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0D0D0D' }}>{prof.name.split(' ')[0]}</div>
                    <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>{prof.role}</div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1.75rem' }}>
              <button onClick={back} style={{ background: 'none', border: '1px solid #E8DFF0', padding: '0.75rem 1.5rem', borderRadius: '999px', fontFamily: 'var(--font-body)', fontSize: '0.9rem', cursor: 'pointer', minHeight: '48px' }}>← Voltar</button>
              <button onClick={next} disabled={!state.professionalId} style={{ background: 'linear-gradient(135deg,#7C3AED,#C77DBE)', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '999px', fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 500, cursor: state.professionalId ? 'pointer' : 'not-allowed', opacity: state.professionalId ? 1 : 0.5, minHeight: '48px' }}>
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: HORÁRIO */}
        {state.step === 3 && (
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: '#0D0D0D', marginBottom: '1.75rem' }}>
              Escolha a data e horário
            </div>
            {/* Calendar header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <button onClick={() => { changeMonth(-1) }} style={{ background: 'none', border: '1px solid #E8DFF0', borderRadius: '6px', padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.9rem', minHeight: '44px' }}>‹</button>
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{MONTHS[calMonth]} {calYear}</span>
              <button onClick={() => { changeMonth(1) }} style={{ background: 'none', border: '1px solid #E8DFF0', borderRadius: '6px', padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.9rem', minHeight: '44px' }}>›</button>
            </div>
            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', marginBottom: '1.5rem' }}>
              {DAYS_SHORT.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', color: '#6B7280', fontWeight: 500, padding: '0.25rem 0' }}>{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1
                const date = new Date(calYear, calMonth, d)
                const isPast = date < today
                const isSun = date.getDay() === 0
                const isToday = date.toDateString() === today.toDateString()
                const ds = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
                const isSel = state.date === ds
                const disabled = isPast || isSun
                return (
                  <div key={d} onClick={() => { if (!disabled) { selectDate(ds) } }} style={{ textAlign: 'center', padding: '0.5rem 0.25rem', fontSize: '0.85rem', borderRadius: '6px', cursor: disabled ? 'not-allowed' : 'pointer', background: isSel ? '#7C3AED' : 'transparent', color: isSel ? 'white' : disabled ? '#D1C4E9' : isToday ? '#7C3AED' : '#0D0D0D', fontWeight: isSel ? 600 : isToday ? 700 : 400 }}>
                    {d}
                  </div>
                )
              })}
            </div>
            {/* Time slots */}
            {state.date && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0D0D0D', marginBottom: '0.75rem' }}>Horários disponíveis</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(70px,1fr))', gap: '0.5rem' }}>
                  {slots.map(t => {
                    const isOcc = occupied.includes(t)
                    const isSel = state.time === t
                    return (
                      <div key={t} onClick={() => { if (!isOcc) { set('time', t) } }} style={{ textAlign: 'center', padding: '0.6rem 0.5rem', border: `1px solid ${isSel ? '#7C3AED' : '#E8DFF0'}`, borderRadius: '6px', fontSize: '0.8rem', cursor: isOcc ? 'not-allowed' : 'pointer', background: isSel ? '#7C3AED' : isOcc ? '#F5F3FF' : 'white', color: isSel ? 'white' : isOcc ? '#D1C4E9' : '#0D0D0D', fontWeight: isSel ? 600 : 400, textDecoration: isOcc ? 'line-through' : 'none', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {t}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1.75rem' }}>
              <button onClick={back} style={{ background: 'none', border: '1px solid #E8DFF0', padding: '0.75rem 1.5rem', borderRadius: '999px', fontFamily: 'var(--font-body)', fontSize: '0.9rem', cursor: 'pointer', minHeight: '48px' }}>← Voltar</button>
              <button onClick={next} disabled={!state.date || !state.time} style={{ background: 'linear-gradient(135deg,#7C3AED,#C77DBE)', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '999px', fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 500, cursor: state.date && state.time ? 'pointer' : 'not-allowed', opacity: state.date && state.time ? 1 : 0.5, minHeight: '48px' }}>
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CONFIRMAÇÃO */}
        {state.step === 4 && (
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: '#0D0D0D', marginBottom: '1.75rem' }}>
              Confirme seu agendamento
            </div>
            <div style={{ background: '#F9FAFB', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Nome', val: state.clientName },
                { label: 'WhatsApp', val: state.clientPhone },
                { label: 'Serviço(s)', val: state.services.map(s => `${s.emoji} ${s.name}`).join(' + ') },
                { label: 'Duração', val: `${state.services.reduce((a,s) => a+s.durationMin,0)} min` },
                { label: 'Profissional', val: state.professionalName },
                { label: 'Data', val: dateLabel },
                { label: 'Horário', val: state.time },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', fontSize: '0.875rem', borderBottom: i < 6 ? '1px solid #E8DFF0' : 'none' }}>
                  <span style={{ color: '#6B7280' }}>{row.label}</span>
                  <span style={{ fontWeight: 500, color: '#0D0D0D', textAlign: 'right', maxWidth: '60%' }}>{row.val}</span>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: '8px', padding: '1rem', fontSize: '0.82rem', color: '#92400E', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              ⏳ Após o envio, sua profissional confirmará em até 30 minutos via WhatsApp.
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1.75rem' }}>
              <button onClick={back} disabled={submitting} style={{ background: 'none', border: '1px solid #E8DFF0', padding: '0.75rem 1.5rem', borderRadius: '999px', fontFamily: 'var(--font-body)', fontSize: '0.9rem', cursor: 'pointer', minHeight: '48px' }}>← Voltar</button>
              <button onClick={submit} disabled={submitting} style={{ background: 'linear-gradient(135deg,#7C3AED,#C77DBE)', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '999px', fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', opacity: submitting ? 0.7 : 1, minHeight: '48px' }}>
                {submitting ? 'Enviando...' : 'Enviar agendamento ✓'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: SUCESSO */}
        {state.step === 5 && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 1.5rem' }}>✓</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#0D0D0D', marginBottom: '0.75rem' }}>Agendamento enviado!</h3>
            <p style={{ color: '#6B7280', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              Sua solicitação foi enviada para <strong>{state.professionalName}</strong>. Você receberá confirmação em breve.
            </p>
            <div style={{ background: '#F9FAFB', borderRadius: '8px', padding: '1rem', maxWidth: '320px', margin: '0 auto 1.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #E8DFF0' }}>
                <span style={{ color: '#6B7280' }}>Serviço</span>
                <span style={{ fontWeight: 500 }}>{state.services.map(s => s.name).join(' + ')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #E8DFF0' }}>
                <span style={{ color: '#6B7280' }}>Data e hora</span>
                <span style={{ fontWeight: 500 }}>{dateLabel} às {state.time}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0' }}>
                <span style={{ color: '#6B7280' }}>Profissional</span>
                <span style={{ fontWeight: 500 }}>{state.professionalName}</span>
              </div>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(234,179,8,0.1)', color: '#854D0E', border: '1px solid rgba(234,179,8,0.3)', marginBottom: '2rem' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#CA8A04' }} />
              Aguardando confirmação da profissional
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
              <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Olá! Agendei pelo site:\n📅 ${dateLabel} às ${state.time}\n💇 ${state.services.map(s=>s.name).join(' + ')}\n👩 ${state.professionalName}`)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#25D366', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '999px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, minHeight: '48px' }}>
                📱 Confirmar pelo WhatsApp
              </a>
              <button onClick={reset} style={{ background: 'linear-gradient(135deg,#7C3AED,#C77DBE)', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '999px', fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', minHeight: '48px' }}>
                Fazer novo agendamento
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
