-- ════════════════════════════════════════════════════════════════════════
-- SiteFlow — Migration 002: Completar Schema para Painel do Salão
-- Versão: 0.0.2 | Marco 2026
--
-- O que esta migration adiciona:
--   1. Horários de funcionamento por dia da semana (editável pelo painel)
--   2. Campos completos de preço nos serviços
--   3. Relacionamento profissional ↔ serviço (quem atende o quê)
--   4. Bloqueios de agenda (folgas, feriados, férias)
--   5. Campos de auditoria (updated_at, updated_by) em serviços e profissionais
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. HORÁRIOS DE FUNCIONAMENTO ────────────────────────────────────────────
-- Cada cliente define seus horários por dia da semana.
-- O painel do salão pode editar esses horários sem precisar de dev.
-- Substituem os horários hardcoded no config.ts a longo prazo.

CREATE TABLE IF NOT EXISTS business_hours (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id   TEXT NOT NULL,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  -- 0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado
  open_time   TIME,
  close_time  TIME,
  is_closed   BOOLEAN DEFAULT false NOT NULL,
  -- is_closed = true: dia sem atendimento (ex: domingo fechado)
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  CONSTRAINT business_hours_unique UNIQUE (client_id, day_of_week)
);

COMMENT ON TABLE business_hours IS
  'Horários de funcionamento por dia da semana. Editável pelo painel do salão.
   Sobrescreve os horários do config.ts quando presente.';

-- ── 2. CAMPOS DE PREÇO COMPLETOS NOS SERVIÇOS ───────────────────────────────
-- Adicionar campos que faltavam na migration 001

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS price_to        DECIMAL(10,2),
  -- price_from já existe (migration 001)
  -- price_to: preço máximo da faixa (ex: R$80 a R$200)

  ADD COLUMN IF NOT EXISTS price_label     TEXT,
  -- Texto customizado exibido no site
  -- Ex: "A partir de R$ 80", "Sob consulta", "R$ 80 a R$ 200"
  -- Se null, o sistema gera automaticamente a partir de price_from

  ADD COLUMN IF NOT EXISTS show_price      BOOLEAN DEFAULT false NOT NULL,
  -- Controle individual por serviço (sobrescreve a feature flag global)

  ADD COLUMN IF NOT EXISTS duration_max_min INTEGER,
  -- Duração máxima (para serviços com faixa, ex: 60 a 120 min)

  ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Trigger para atualizar updated_at automaticamente em serviços
CREATE OR REPLACE FUNCTION update_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_services_updated_at();

-- ── 3. CAMPOS DE AUDITORIA NOS PROFISSIONAIS ────────────────────────────────

ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS bio            TEXT,
  -- Descrição da profissional exibida no site

  ADD COLUMN IF NOT EXISTS photo_url      TEXT,
  -- URL da foto (Supabase Storage futuramente)

  ADD COLUMN IF NOT EXISTS sort_order     INTEGER DEFAULT 0 NOT NULL,
  -- Ordem de exibição no site (editável pelo painel)

  ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Trigger para atualizar updated_at automaticamente em profissionais
CREATE OR REPLACE FUNCTION update_professionals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER professionals_updated_at
  BEFORE UPDATE ON professionals
  FOR EACH ROW
  EXECUTE FUNCTION update_professionals_updated_at();

-- ── 4. RELACIONAMENTO PROFISSIONAL ↔ SERVIÇO ────────────────────────────────
-- Define quais serviços cada profissional atende.
-- Se não houver registros para uma profissional, ela aparece para todos os serviços.
-- O painel do salão pode configurar isso.

CREATE TABLE IF NOT EXISTS professional_services (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id       TEXT NOT NULL,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  service_id      UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  -- Configurações específicas por profissional + serviço:
  custom_duration_min  INTEGER,
  -- null = usa a duração padrão do serviço
  -- valor = duração personalizada para esta profissional
  custom_price_from    DECIMAL(10,2),
  -- null = usa o preço padrão do serviço
  active          BOOLEAN DEFAULT true NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT prof_service_unique UNIQUE (professional_id, service_id)
);

COMMENT ON TABLE professional_services IS
  'Relacionamento entre profissionais e serviços que atendem.
   Permite configurar durações e preços diferentes por profissional.
   Se vazio para uma profissional, ela aparece para todos os serviços.';

-- ── 5. BLOQUEIOS DE AGENDA ───────────────────────────────────────────────────
-- O salão pode bloquear dias específicos para folgas, feriados, férias.
-- Aparece como indisponível no calendário de agendamento.

CREATE TABLE IF NOT EXISTS blocked_dates (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id       TEXT NOT NULL,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  -- null = bloqueia para TODOS os profissionais (ex: feriado do salão)
  -- uuid = bloqueia apenas para aquela profissional (ex: folga da Ana)
  date            DATE NOT NULL,
  reason          TEXT,
  -- Motivo interno: "Feriado", "Férias", "Folga", "Evento", etc.
  all_day         BOOLEAN DEFAULT true NOT NULL,
  block_from      TIME,
  -- null se all_day = true
  block_until     TIME,
  -- null se all_day = true
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

COMMENT ON TABLE blocked_dates IS
  'Bloqueios de agenda por data.
   professional_id null = bloqueia o salão inteiro (feriado).
   professional_id preenchido = bloqueia apenas aquela profissional (folga).';

-- ── 6. RLS NAS NOVAS TABELAS ────────────────────────────────────────────────

ALTER TABLE business_hours       ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates        ENABLE ROW LEVEL SECURITY;

-- Leitura pública (site precisa para exibir horários e disponibilidade)
CREATE POLICY "business_hours_public_read" ON business_hours
  FOR SELECT USING (true);

CREATE POLICY "prof_services_public_read" ON professional_services
  FOR SELECT USING (true);

CREATE POLICY "blocked_dates_public_read" ON blocked_dates
  FOR SELECT USING (true);

-- Escrita: apenas profissional autenticada do mesmo cliente
CREATE POLICY "business_hours_auth_write" ON business_hours
  FOR ALL USING (
    auth.role() = 'service_role'
    OR client_id = (auth.jwt() ->> 'client_id')
  );

CREATE POLICY "prof_services_auth_write" ON professional_services
  FOR ALL USING (
    auth.role() = 'service_role'
    OR client_id = (auth.jwt() ->> 'client_id')
  );

CREATE POLICY "blocked_dates_auth_write" ON blocked_dates
  FOR ALL USING (
    auth.role() = 'service_role'
    OR client_id = (auth.jwt() ->> 'client_id')
  );

-- Políticas de escrita para serviços e profissionais (atualizações pelo painel)
CREATE POLICY "services_auth_update" ON services
  FOR UPDATE USING (
    auth.role() = 'service_role'
    OR client_id = (auth.jwt() ->> 'client_id')
  );

CREATE POLICY "professionals_auth_update" ON professionals
  FOR UPDATE USING (
    auth.role() = 'service_role'
    OR client_id = (auth.jwt() ->> 'client_id')
  );

-- ── 7. ÍNDICES DE PERFORMANCE ────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_business_hours_client
  ON business_hours(client_id, day_of_week);

CREATE INDEX IF NOT EXISTS idx_prof_services_professional
  ON professional_services(professional_id, active);

CREATE INDEX IF NOT EXISTS idx_prof_services_service
  ON professional_services(service_id, active);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_client_date
  ON blocked_dates(client_id, date);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_professional
  ON blocked_dates(professional_id, date);

-- ── 8. SEED: HORÁRIOS INICIAIS DO DIVAS HAIR ────────────────────────────────
-- Popula os horários de funcionamento a partir dos dados do config.ts

INSERT INTO business_hours (client_id, day_of_week, open_time, close_time, is_closed) VALUES
  ('divas-hair', 0, '09:00', '16:00', false),  -- Domingo
  ('divas-hair', 1, '09:00', '20:00', false),  -- Segunda
  ('divas-hair', 2, '09:00', '20:00', false),  -- Terça
  ('divas-hair', 3, '09:00', '20:00', false),  -- Quarta
  ('divas-hair', 4, '09:00', '20:00', false),  -- Quinta
  ('divas-hair', 5, '09:00', '20:00', false),  -- Sexta
  ('divas-hair', 6, '09:00', '20:00', false)   -- Sábado
ON CONFLICT (client_id, day_of_week) DO NOTHING;

-- Seed: relacionamento profissional ↔ serviço para o Divas Hair
-- (define quem atende o quê — baseado nas especialidades do team.json)
DO $$
DECLARE
  v_ana_id        UUID;
  v_patricia_id   UUID;
  v_juliana_id    UUID;
  v_corte_id      UUID;
  v_color_id      UUID;
  v_trat_id       UUID;
  v_manicure_id   UUID;
  v_sobrancelha_id UUID;
  v_make_id       UUID;
  v_depil_id      UUID;
  v_gel_id        UUID;
BEGIN
  SELECT id INTO v_ana_id       FROM professionals WHERE client_id='divas-hair' AND slug='ana-lima';
  SELECT id INTO v_patricia_id  FROM professionals WHERE client_id='divas-hair' AND slug='patricia-santos';
  SELECT id INTO v_juliana_id   FROM professionals WHERE client_id='divas-hair' AND slug='juliana-costa';
  SELECT id INTO v_corte_id     FROM services WHERE client_id='divas-hair' AND slug='corte-escova';
  SELECT id INTO v_color_id     FROM services WHERE client_id='divas-hair' AND slug='coloracao-mechas';
  SELECT id INTO v_trat_id      FROM services WHERE client_id='divas-hair' AND slug='tratamentos';
  SELECT id INTO v_manicure_id  FROM services WHERE client_id='divas-hair' AND slug='manicure-pedicure';
  SELECT id INTO v_sobrancelha_id FROM services WHERE client_id='divas-hair' AND slug='sobrancelha-cilios';
  SELECT id INTO v_make_id      FROM services WHERE client_id='divas-hair' AND slug='maquiagem-noivas';
  SELECT id INTO v_depil_id     FROM services WHERE client_id='divas-hair' AND slug='depilacao';
  SELECT id INTO v_gel_id       FROM services WHERE client_id='divas-hair' AND slug='unhas-gel';

  -- Ana Lima: especialista em cabelos
  INSERT INTO professional_services (client_id, professional_id, service_id) VALUES
    ('divas-hair', v_ana_id, v_corte_id),
    ('divas-hair', v_ana_id, v_color_id),
    ('divas-hair', v_ana_id, v_trat_id)
  ON CONFLICT (professional_id, service_id) DO NOTHING;

  -- Patrícia Santos: unhas e manicure
  INSERT INTO professional_services (client_id, professional_id, service_id) VALUES
    ('divas-hair', v_patricia_id, v_manicure_id),
    ('divas-hair', v_patricia_id, v_gel_id)
  ON CONFLICT (professional_id, service_id) DO NOTHING;

  -- Juliana Costa: make e estética
  INSERT INTO professional_services (client_id, professional_id, service_id) VALUES
    ('divas-hair', v_juliana_id, v_sobrancelha_id),
    ('divas-hair', v_juliana_id, v_make_id),
    ('divas-hair', v_juliana_id, v_depil_id),
    ('divas-hair', v_juliana_id, v_corte_id)
  ON CONFLICT (professional_id, service_id) DO NOTHING;

END $$;
