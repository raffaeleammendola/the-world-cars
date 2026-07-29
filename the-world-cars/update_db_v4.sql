-- ==============================================================================
-- THE WORLD CARS - AGGIORNAMENTO DATABASE (v4)
-- Aggiunta Categorie Dinamiche, Aria Condizionata, Cavalli e Foto Multiple
-- ==============================================================================

-- 1. Aggiunta colonna categorie_auto nella configurazione
ALTER TABLE configurazione ADD COLUMN IF NOT EXISTS categorie_auto TEXT DEFAULT 'Sportive, SUV, Berline, City Car, Scooter, Furgoni';

-- 2. Aggiunta nuovi campi auto (aria condizionata, cavalli e immagini aggiuntive)
ALTER TABLE auto ADD COLUMN IF NOT EXISTS aria_condizionata BOOLEAN DEFAULT FALSE;
ALTER TABLE auto ADD COLUMN IF NOT EXISTS cavalli TEXT;
ALTER TABLE auto ADD COLUMN IF NOT EXISTS immagine2 TEXT;
ALTER TABLE auto ADD COLUMN IF NOT EXISTS immagine3 TEXT;

-- (Fine aggiornamento)
