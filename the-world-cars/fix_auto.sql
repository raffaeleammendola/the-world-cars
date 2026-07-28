-- RISOLUZIONE PROBLEMA AUTO 
-- Elimina la vecchia tabella auto (con colonne errate)
DROP TABLE IF EXISTS auto CASCADE;

-- Crea la nuova tabella corretta
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

-- Disabilita RLS per l'accesso API
ALTER TABLE auto DISABLE ROW LEVEL SECURITY;
