-- ==============================================================================
-- THE WORLD CARS - SUPABASE CLOUD DATABASE SETUP
-- Copia e incolla tutto questo codice nel pannello "SQL Editor" di Supabase
-- e clicca su "RUN" (Esegui) per creare il database in 1 secondo!
-- ==============================================================================

-- 1. Elimina tabelle esistenti se ci sono già (per sicurezza)
DROP TABLE IF EXISTS richieste CASCADE;
DROP TABLE IF EXISTS noleggi CASCADE;
DROP TABLE IF EXISTS officina CASCADE;
-- Manteniamo le auto se esistono, se no le creiamo

-- 2. Creazione della Tabella Auto
CREATE TABLE IF NOT EXISTS auto (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 3. Creazione della Tabella Richieste (Generale)
CREATE TABLE IF NOT EXISTS richieste (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 4. Creazione della Tabella Servizi Officina
CREATE TABLE IF NOT EXISTS servizi_officina (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_locale TEXT UNIQUE,
  titolo TEXT NOT NULL,
  descrizione TEXT NOT NULL,
  icona TEXT NOT NULL,
  tempo TEXT NOT NULL,
  prezzo TEXT NOT NULL
);

-- 5. Creazione della Tabella Servizi Assistenza
CREATE TABLE IF NOT EXISTS servizi_assistenza (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_locale TEXT UNIQUE,
  titolo TEXT NOT NULL,
  descrizione TEXT NOT NULL,
  icona TEXT NOT NULL,
  tempo TEXT NOT NULL
);

-- 6. Disabilitare RLS (Row Level Security) per permettere l'accesso dal sito front-end
ALTER TABLE auto DISABLE ROW LEVEL SECURITY;
ALTER TABLE richieste DISABLE ROW LEVEL SECURITY;
ALTER TABLE servizi_officina DISABLE ROW LEVEL SECURITY;
ALTER TABLE servizi_assistenza DISABLE ROW LEVEL SECURITY;

-- FATTO! Il tuo database ora è collegato e pronto a sincronizzarsi con tutti i dispositivi.
