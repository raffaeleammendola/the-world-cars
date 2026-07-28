-- ==============================================================================
-- THE WORLD CARS - SUPABASE FULL RESET & INSTALLATION SCRIPT
-- ==============================================================================

-- 1. Eliminiamo tutte le tabelle esistenti per fare una pulizia profonda
DROP TABLE IF EXISTS auto CASCADE;
DROP TABLE IF EXISTS richieste CASCADE;
DROP TABLE IF EXISTS servizi_officina CASCADE;
DROP TABLE IF EXISTS servizi_assistenza CASCADE;

-- 2. Creazione Tabella AUTO
CREATE TABLE auto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_locale TEXT UNIQUE,
  marca TEXT NOT NULL,
  modello TEXT NOT NULL,
  categoria TEXT NOT NULL,
  gearbox TEXT NOT NULL,
  fuel TEXT NOT NULL,
  seats INTEGER,
  luggage TEXT,
  immagini TEXT NOT NULL,
  prezzo_giorno NUMERIC NOT NULL,
  prezzo_settimana NUMERIC NOT NULL,
  disponibilita BOOLEAN DEFAULT TRUE,
  descrizione TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Creazione Tabella RICHIESTE
CREATE TABLE richieste (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_locale TEXT UNIQUE,
  tipo_servizio TEXT NOT NULL,
  nome_cliente TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT,
  messaggio TEXT,
  veicolo_servizio TEXT,
  data_inizio TEXT,
  data_fine TEXT,
  prezzo_stimato NUMERIC,
  posizione_gps TEXT,
  stato_richiesta TEXT DEFAULT 'Nuova',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Creazione Tabella SERVIZI OFFICINA
CREATE TABLE servizi_officina (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_locale TEXT UNIQUE,
  titolo TEXT NOT NULL,
  descrizione TEXT NOT NULL,
  icona TEXT NOT NULL,
  tempo TEXT NOT NULL,
  prezzo TEXT NOT NULL
);

-- 5. Creazione Tabella SERVIZI ASSISTENZA
CREATE TABLE servizi_assistenza (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_locale TEXT UNIQUE,
  titolo TEXT NOT NULL,
  descrizione TEXT NOT NULL,
  icona TEXT NOT NULL,
  tempo TEXT NOT NULL
);

-- ==============================================================================
-- RISOLUZIONE PROBLEMA PERMESSI "Row-Level Security" ED "Errore 42501"
-- ==============================================================================

-- Disabilitiamo esplicitamente le regole di sicurezza (RLS) su tutte le tabelle
ALTER TABLE auto DISABLE ROW LEVEL SECURITY;
ALTER TABLE richieste DISABLE ROW LEVEL SECURITY;
ALTER TABLE servizi_officina DISABLE ROW LEVEL SECURITY;
ALTER TABLE servizi_assistenza DISABLE ROW LEVEL SECURITY;

-- Assegniamo TUTTI i permessi (Lettura, Scrittura, Modifica, Eliminazione)
-- al ruolo "anon" (Quello utilizzato dal tuo sito tramite la Supabase Key)
GRANT ALL ON TABLE auto TO anon, authenticated, service_role;
GRANT ALL ON TABLE richieste TO anon, authenticated, service_role;
GRANT ALL ON TABLE servizi_officina TO anon, authenticated, service_role;
GRANT ALL ON TABLE servizi_assistenza TO anon, authenticated, service_role;

-- FATTO! Il Database è perfettamente pulito, configurato e senza blocchi.
