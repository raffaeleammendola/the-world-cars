-- Tabella configurazione sito (modificabile da admin, sincronizzata su tutti i dispositivi)
CREATE TABLE IF NOT EXISTS configurazione (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  nome_azienda TEXT,
  indirizzo TEXT,
  telefono TEXT,
  telefono_emergenza TEXT,
  whatsapp TEXT,
  email TEXT,
  logo_icona TEXT,
  logo_immagine TEXT,
  telegram_bot_token TEXT,
  telegram_chat_id TEXT,
  password_hash TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE configurazione DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE configurazione TO anon, authenticated, service_role;

-- Inserisci la riga di configurazione iniziale (valori di default)
INSERT INTO configurazione (
  id, nome_azienda, indirizzo, telefono, telefono_emergenza,
  whatsapp, email, logo_icona, telegram_bot_token, telegram_chat_id, password_hash
) VALUES (
  1,
  'The World Cars Elettrauto - Meccanico - Soccorso Stradale',
  'Corso Resina, 314/D, 80056 Ercolano NA',
  '+39 081 7776655',
  '+39 333 9988776',
  '393339988776',
  'info@theworldcars.it',
  '🏎️',
  '8743722064:AAEH5j4pZCfnXaG5KswNXaakA66-tiH5HXU',
  '573990897',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
) ON CONFLICT (id) DO NOTHING;
