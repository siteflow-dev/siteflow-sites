'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase'

// ─── TIPOS ───────────────────────────────────────────────────────────────────

interface Appointment {
  id: string
  client_name: string
  client_phone: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes: string | null
  services?: { name: string; emoji: string } | null
}

interface ProfessionalPanelProps {
  clientId: string
  slug: string
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatDate(ds: string): string {
  const d = new Date(ds + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

function tomorrow(): string {
  const d = new Date(); d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente', confirmed: 'Confirmado',
  cancelled: 'Cancelado', completed: 'Concluído',
}

const STATUS_COLOR: Record<string, { bg: string; color: string; border: string }> = {
  pending:   { bg: '#FEF9C3', color: '#854D0E', border: '#CA8A04' },
  confirmed: { bg: '#DCFCE7', color: '#14532D', border: '#16A34A' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B', border: '#DC2626' },
  completed: { bg: '#EDE9FE', color: '#4C1D95', border: '#7C3AED' },
}

// ─── TELA DE LOGIN ────────────────────────────────────────────────────────────

function LoginScreen({ onLogin, clientId }: { onLogin: (name: string) => void; clientId: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Preencha e-mail e senha')
      return
    }
    setLoading(true)
    setError('')
    try {
      const sb = getSupabaseClient()
      const { data, error: err } = await sb.auth.signInWithPassword({ email, password })
      if (err) throw new Error(err.message)

      // Verificar se a profissional pertence a este cliente
      const { data: session } = await sb
        .from('professional_sessions')
        .select('professionals(name)')
        .eq('auth_user_id', data.user?.id)
        .eq('client_id', clientId)
        .eq('active', true)
        .single()

      if (!session) throw new Error('Acesso não autorizado para este salão')

      const name = (session.professionals as any)?.name || 'Profissional'
      onLogin(name)
    } catch (e: any) {
      setError(e.message === 'Invalid login credentials'
        ? 'E-mail ou senha incorretos'
        : e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-darker)', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: 'var(--text-on-dark)', marginBottom: '0.5rem' }}>
            Divas <span style={{ color: 'var(--accent)' }}>Painel</span>
          </div>
          <p style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.9rem' }}>
            Acesso exclusivo para profissionais
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,138,0.15)', borderRadius: '20px', padding: '2rem' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#FCA5A5', marginBottom: '1.25rem' }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-on-dark-muted)', marginBottom: '0.4rem' }}>E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value) }}
              style={{ width: '100%', minHeight: '48px', padding: '0.75rem 1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'white', background: 'rgba(255,255,255,0.07)', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-on-dark-muted)', marginBottom: '0.4rem' }}>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value) }}
              onKeyDown={e => { if (e.key === 'Enter') { handleLogin() } }}
              style={{ width: '100%', minHeight: '48px', padding: '0.75rem 1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'white', background: 'rgba(255,255,255,0.07)', outline: 'none' }}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', minHeight: '48px', background: 'linear-gradient(135deg,#7C3AED,#C77DBE)', color: 'white', border: 'none', borderRadius: '999px', fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Entrando...' : 'Entrar no painel'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CARD DE AGENDAMENTO ─────────────────────────────────────────────────────

function AppointmentCard({ appt, onUpdate }: { appt: Appointment; onUpdate: (id: string, status: string) => void }) {
  const st = STATUS_COLOR[appt.status] || STATUS_COLOR.pending
  const isPast = appt.date < today()

  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,138,0.12)', borderRadius: '12px', padding: '1.25rem', transition: 'border-color 0.3s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem', gap: '0.5rem' }}>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-on-dark)', fontSize: '0.95rem' }}>{appt.client_name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-on-dark-muted)', marginTop: '0.15rem' }}>
            📅 {formatDate(appt.date)} · {appt.time.substring(0,5)}
          </div>
        </div>
        <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '999px', flexShrink: 0 }}>
          {STATUS_LABEL[appt.status]}
        </span>
      </div>

      {appt.notes && (
        <div style={{ fontSize: '0.82rem', color: 'var(--accent)', marginBottom: '0.75rem' }}>
          ✦ {appt.notes}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <a
          href={`https://wa.me/${appt.client_phone.replace(/\D/g,'')}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '0.75rem', color: '#4ADE80', textDecoration: 'none' }}
        >
          📞 {appt.client_phone}
        </a>

        {!isPast && appt.status === 'pending' && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => { onUpdate(appt.id, 'confirmed') }}
              style={{ background: '#16A34A', color: 'white', border: 'none', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', minHeight: '32px' }}
            >
              ✓ Confirmar
            </button>
            <button
              onClick={() => { onUpdate(appt.id, 'cancelled') }}
              style={{ background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', minHeight: '32px' }}
            >
              ✗ Recusar
            </button>
          </div>
        )}

        {!isPast && appt.status === 'confirmed' && (
          <button
            onClick={() => { onUpdate(appt.id, 'completed') }}
            style={{ background: 'rgba(124,58,237,0.2)', color: '#C4B5FD', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', minHeight: '32px' }}
          >
            ✓ Concluir
          </button>
        )}
      </div>
    </div>
  )
}

// ─── DASHBOARD PRINCIPAL ─────────────────────────────────────────────────────

function Dashboard({ clientId, professionalName, onLogout }: { clientId: string; professionalName: string; onLogout: () => void }) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filter, setFilter] = useState<'hoje' | 'amanha' | 'todos' | 'pendentes'>('hoje')
  const [loading, setLoading] = useState(true)
  const [newCount, setNewCount] = useState(0)

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const sb = getSupabaseClient()
      const { data: user } = await sb.auth.getUser()
      if (!user.user) return

      const { data: session } = await sb
        .from('professional_sessions')
        .select('professional_id')
        .eq('auth_user_id', user.user.id)
        .eq('client_id', clientId)
        .eq('active', true)
        .single()

      if (!session) return

      let query = sb
        .from('appointments')
        .select('id, client_name, client_phone, date, time, status, notes, services(name, emoji)')
        .eq('client_id', clientId)
        .eq('professional_id', session.professional_id)
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (filter === 'hoje') query = query.eq('date', today())
      else if (filter === 'amanha') query = query.eq('date', tomorrow())
      else if (filter === 'pendentes') query = query.eq('status', 'pending')

      const { data } = await query
      setAppointments((data || []) as unknown as Appointment[])
    } finally {
      setLoading(false)
    }
  }, [clientId, filter])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  // Realtime
  useEffect(() => {
    const sb = getSupabaseClient()
    const channel = sb
      .channel('appointments-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `client_id=eq.${clientId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setNewCount(n => n + 1)
        }
        fetchAppointments()
      })
      .subscribe()

    return () => { sb.removeChannel(channel) }
  }, [clientId, fetchAppointments])

  async function updateStatus(id: string, status: string) {
    await getSupabaseClient()
      .from('appointments')
      .update({ status })
      .eq('id', id)
    fetchAppointments()
  }

  const todayCount = appointments.filter(a => a.date === today()).length
  const pendingCount = appointments.filter(a => a.status === 'pending').length
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length

  const FILTERS = [
    { key: 'hoje', label: 'Hoje' },
    { key: 'amanha', label: 'Amanhã' },
    { key: 'pendentes', label: 'Pendentes' },
    { key: 'todos', label: 'Todos' },
  ] as const

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: 'var(--text-on-dark)' }}>

      {/* Header */}
      <div style={{ background: 'rgba(13,13,13,0.95)', borderBottom: '1px solid rgba(212,175,138,0.15)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-on-dark)' }}>
            Olá, {professionalName.split(' ')[0]} ✦
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-on-dark-muted)' }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {newCount > 0 && (
            <div style={{ background: '#7C3AED', color: 'white', borderRadius: '999px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 600 }}>
              +{newCount} novo{newCount > 1 ? 's' : ''}
            </div>
          )}
          <button onClick={onLogout} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', borderRadius: '8px', padding: '0.4rem 0.875rem', fontSize: '0.8rem', cursor: 'pointer', minHeight: '36px' }}>
            Sair
          </button>
        </div>
      </div>

      <div style={{ padding: '1.5rem', maxWidth: '680px', margin: '0 auto' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Hoje', val: todayCount, color: '#D4AF8A' },
            { label: 'Pendentes', val: pendingCount, color: '#FBBF24' },
            { label: 'Confirmados', val: confirmedCount, color: '#4ADE80' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,138,0.12)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: s.color }}>{s.val}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-on-dark-muted)', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Realtime indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.75rem', color: 'var(--text-on-dark-muted)' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 6px #4ADE80' }} />
          Atualização em tempo real ativa
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setNewCount(0) }}
              style={{ background: filter === f.key ? 'linear-gradient(135deg,#7C3AED,#C77DBE)' : 'rgba(255,255,255,0.05)', color: filter === f.key ? 'white' : 'var(--text-on-dark-muted)', border: filter === f.key ? 'none' : '1px solid rgba(255,255,255,0.1)', borderRadius: '999px', padding: '0.4rem 1rem', fontSize: '0.82rem', fontWeight: filter === f.key ? 600 : 400, cursor: 'pointer', minHeight: '36px' }}
            >
              {f.label}
              {f.key === 'pendentes' && pendingCount > 0 && (
                <span style={{ marginLeft: '0.4rem', background: '#FBBF24', color: '#78350F', borderRadius: '999px', padding: '0 0.35rem', fontSize: '0.7rem', fontWeight: 700 }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Lista de agendamentos */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-on-dark-muted)', fontSize: '0.9rem' }}>
            Carregando...
          </div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-on-dark-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📅</div>
            <div style={{ fontSize: '0.9rem' }}>
              {filter === 'hoje' ? 'Nenhum agendamento para hoje' : filter === 'amanha' ? 'Nenhum agendamento para amanhã' : filter === 'pendentes' ? 'Nenhum agendamento pendente' : 'Nenhum agendamento encontrado'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {appointments.map(appt => (
              <AppointmentCard key={appt.id} appt={appt} onUpdate={updateStatus} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────

export function ProfessionalPanel({ clientId, slug }: ProfessionalPanelProps) {
  const [professionalName, setProfessionalName] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  // Verificar sessão existente
  useEffect(() => {
    async function checkSession() {
      try {
        const sb = getSupabaseClient()
        const { data: { user } } = await sb.auth.getUser()
        if (!user) { setChecking(false); return }

        const { data } = await sb
          .from('professional_sessions')
          .select('professionals(name)')
          .eq('auth_user_id', user.id)
          .eq('client_id', clientId)
          .eq('active', true)
          .single()

        if (data) {
          setProfessionalName((data.professionals as any)?.name || 'Profissional')
        }
      } finally {
        setChecking(false)
      }
    }
    checkSession()
  }, [clientId])

  async function handleLogout() {
    await getSupabaseClient().auth.signOut()
    setProfessionalName(null)
  }

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-darker)' }}>
        <div style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.9rem' }}>Verificando sessão...</div>
      </div>
    )
  }

  if (!professionalName) {
    return <LoginScreen onLogin={setProfessionalName} clientId={clientId} />
  }

  return <Dashboard clientId={clientId} professionalName={professionalName} onLogout={handleLogout} />
}
