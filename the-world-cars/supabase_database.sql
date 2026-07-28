-- ==============================================================================
-- THE WORLD CARS - DATABASE RELAZIONALE COMPLETO (v3.1)
-- Tutte le tabelle sono collegate tra loro tramite Foreign Keys
-- ==============================================================================

-- PULIZIA TOTALE
DROP TABLE IF EXISTS richieste CASCADE;
DROP TABLE IF EXISTS servizi_officina CASCADE;
DROP TABLE IF EXISTS servizi_assistenza CASCADE;
DROP TABLE IF EXISTS clienti CASCADE;
DROP TABLE IF EXISTS auto CASCADE;

-- ==========================================
-- TABELLA CLIENTI (entità centrale)
-- ==========================================
CREATE TABLE clienti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABELLA AUTO (flotta veicoli)
-- ==========================================
CREATE TABLE auto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_locale TEXT UNIQUE NOT NULL,
  marca TEXT NOT NULL,
  modello TEXT NOT NULL,
  categoria TEXT NOT NULL,
  cambio TEXT NOT NULL,
  carburante TEXT NOT NULL,
  posti INTEGER DEFAULT 5,
  bagagli TEXT,
  immagine TEXT NOT NULL,
  prezzo_giorno NUMERIC(10,2) NOT NULL,
  prezzo_settimana NUMERIC(10,2) NOT NULL,
  disponibile BOOLEAN DEFAULT TRUE,
  descrizione TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABELLA SERVIZI OFFICINA
-- ==========================================
CREATE TABLE servizi_officina (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_locale TEXT UNIQUE NOT NULL,
  icona TEXT NOT NULL,
  titolo TEXT NOT NULL,
  descrizione TEXT NOT NULL,
  tempo_stimato TEXT NOT NULL,
  prezzo TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABELLA SERVIZI ASSISTENZA STRADALE
-- ==========================================
CREATE TABLE servizi_assistenza (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_locale TEXT UNIQUE NOT NULL,
  icona TEXT NOT NULL,
  titolo TEXT NOT NULL,
  descrizione TEXT NOT NULL,
  tempo_stimato TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABELLA RICHIESTE (centro di tutte le relazioni)
--   → FK verso clienti (chi ha fatto la richiesta)
--   → FK verso auto (quale auto noleggiata, solo per noleggi)
--   → FK verso servizi_officina (quale servizio officina, solo per officina)
--   → FK verso servizi_assistenza (quale servizio soccorso, solo per soccorso)
-- ==========================================
CREATE TABLE richieste (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_locale TEXT UNIQUE NOT NULL,
  tipo TEXT NOT NULL,

  -- FK → Cliente
  cliente_id UUID REFERENCES clienti(id) ON DELETE SET NULL,
  nome_cliente TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT,

  -- FK → Auto (solo per tipo = 'Noleggio')
  auto_id UUID REFERENCES auto(id) ON DELETE SET NULL,

  -- FK → Servizio Officina (solo per tipo = 'Officina')
  servizio_officina_id UUID REFERENCES servizi_officina(id) ON DELETE SET NULL,

  -- FK → Servizio Assistenza (solo per tipo = 'Soccorso Stradale')
  servizio_assistenza_id UUID REFERENCES servizi_assistenza(id) ON DELETE SET NULL,

  nome_servizio TEXT,
  data_inizio TEXT,
  data_fine TEXT,
  prezzo_stimato NUMERIC(10,2),
  posizione_gps TEXT,
  messaggio TEXT,
  stato TEXT DEFAULT 'Nuova',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per velocizzare le query
CREATE INDEX idx_richieste_stato ON richieste(stato);
CREATE INDEX idx_richieste_tipo ON richieste(tipo);
CREATE INDEX idx_richieste_cliente ON richieste(cliente_id);
CREATE INDEX idx_richieste_auto ON richieste(auto_id);

-- ==========================================
-- SICUREZZA: Disabilita RLS e concedi permessi completi
-- ==========================================
ALTER TABLE clienti DISABLE ROW LEVEL SECURITY;
ALTER TABLE auto DISABLE ROW LEVEL SECURITY;
ALTER TABLE servizi_officina DISABLE ROW LEVEL SECURITY;
ALTER TABLE servizi_assistenza DISABLE ROW LEVEL SECURITY;
ALTER TABLE richieste DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE clienti TO anon, authenticated, service_role;
GRANT ALL ON TABLE auto TO anon, authenticated, service_role;
GRANT ALL ON TABLE servizi_officina TO anon, authenticated, service_role;
GRANT ALL ON TABLE servizi_assistenza TO anon, authenticated, service_role;
GRANT ALL ON TABLE richieste TO anon, authenticated, service_role;

-- FATTO! Tutte le tabelle sono relazionate correttamente.
