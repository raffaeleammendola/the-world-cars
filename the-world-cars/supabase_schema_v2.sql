-- ==========================================================================
-- THE WORLD CARS - Schema Relazionale Normalizzato PostgreSQL (v2.0)
-- Architettura professionale per Noleggio Auto, Officina Meccanica & Soccorso H24
-- ==========================================================================

-- Abilita estensione UUID se non presente
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------------
-- 1. TABELLA: CLIENTI (Anagrafica Unificata Centralizzata)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clienti (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    cognome VARCHAR(100) NOT NULL,
    telefono VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(150),
    codice_fiscale_piva VARCHAR(50),
    indirizzo TEXT,
    citta VARCHAR(100),
    cap VARCHAR(10),
    note_cliente TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici di performance per ricerche rapide cliente
CREATE INDEX IF NOT EXISTS idx_clienti_telefono ON public.clienti(telefono);
CREATE INDEX IF NOT EXISTS idx_clienti_email ON public.clienti(email);

-- --------------------------------------------------------------------------
-- 2. TABELLA: AUTO (Flotta Aziendale Noleggio)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.auto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    targa VARCHAR(20) UNIQUE,
    marca VARCHAR(100) NOT NULL,
    modello VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL, -- Sportive, SUV, Berline, City Car
    gearbox VARCHAR(50) DEFAULT 'Automatico',
    fuel VARCHAR(50) DEFAULT 'Benzina',
    seats INT DEFAULT 5,
    luggage VARCHAR(50) DEFAULT '2 Valigie',
    immagini TEXT NOT NULL,
    prezzo_giorno NUMERIC(10, 2) NOT NULL CHECK (prezzo_giorno > 0),
    prezzo_settimana NUMERIC(10, 2) NOT NULL CHECK (prezzo_settimana > 0),
    stato_veicolo VARCHAR(30) DEFAULT 'Disponibile', -- Disponibile, Noleggiato, In Manutenzione, Fuori Servizio
    disponibilita BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auto_categoria ON public.auto(categoria);
CREATE INDEX IF NOT EXISTS idx_auto_disponibilita ON public.auto(disponibilita);

-- --------------------------------------------------------------------------
-- 3. TABELLA: VEICOLI_CLIENTI (Parco Auto dei Clienti dell'Officina)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.veicoli_clienti (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES public.clienti(id) ON DELETE CASCADE,
    targa VARCHAR(20) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    modello VARCHAR(100) NOT NULL,
    anno INT,
    telaio_vin VARCHAR(50),
    chilometraggio INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_veicoli_clienti_cliente ON public.veicoli_clienti(cliente_id);
CREATE INDEX IF NOT EXISTS idx_veicoli_clienti_targa ON public.veicoli_clienti(targa);

-- --------------------------------------------------------------------------
-- 4. TABELLA: NOLEGGI (Prenotazioni e Contratti di Noleggio)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.noleggi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES public.clienti(id) ON DELETE RESTRICT,
    auto_id UUID NOT NULL REFERENCES public.auto(id) ON DELETE RESTRICT,
    data_inizio DATE NOT NULL,
    data_fine DATE NOT NULL CHECK (data_fine >= data_inizio),
    giorni_totali INT GENERATED ALWAYS AS (data_fine - data_inizio + 1) STORED,
    prezzo_stimato NUMERIC(10, 2) NOT NULL,
    cauzione NUMERIC(10, 2) DEFAULT 0.00,
    stato_noleggio VARCHAR(30) DEFAULT 'In Attesa', -- In Attesa, Approvato, In Corso, Concluso, Annullato
    note_noleggio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_noleggi_cliente ON public.noleggi(cliente_id);
CREATE INDEX IF NOT EXISTS idx_noleggi_auto ON public.noleggi(auto_id);
CREATE INDEX IF NOT EXISTS idx_noleggi_date ON public.noleggi(data_inizio, data_fine);

-- --------------------------------------------------------------------------
-- 5. TABELLA: CATOLOGO_SERVIZI_OFFICINA
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.servizi_officina (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titolo VARCHAR(150) NOT NULL,
    icona VARCHAR(20) DEFAULT '🔧',
    descrizione TEXT,
    tempo_stimato VARCHAR(50),
    prezzo_base VARCHAR(50),
    attivo BOOLEAN DEFAULT TRUE
);

-- --------------------------------------------------------------------------
-- 6. TABELLA: OFFICINA (Prenotazioni Interventi e Schede Lavoro)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.officina (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES public.clienti(id) ON DELETE RESTRICT,
    veicolo_cliente_id UUID REFERENCES public.veicoli_clienti(id) ON DELETE SET NULL,
    servizio_id UUID REFERENCES public.servizi_officina(id) ON DELETE SET NULL,
    descrizione_intervento VARCHAR(200) NOT NULL,
    data_appuntamento DATE NOT NULL,
    km_attuali INT,
    stato VARCHAR(30) DEFAULT 'In Attesa', -- In Attesa, Accettata, In Lavorazione, Pronta, Consegnata, Annullata
    note_tecniche TEXT,
    costo_preventivo NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_officina_cliente ON public.officina(cliente_id);
CREATE INDEX IF NOT EXISTS idx_officina_appuntamento ON public.officina(data_appuntamento);

-- --------------------------------------------------------------------------
-- 7. TABELLA: STORICO_INTERVENTI (Registro Storico Manutenzioni Veicoli)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.storico_interventi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    officina_id UUID REFERENCES public.officina(id) ON DELETE SET NULL,
    veicolo_cliente_id UUID NOT NULL REFERENCES public.veicoli_clienti(id) ON DELETE CASCADE,
    data_esecuzione DATE NOT NULL DEFAULT CURRENT_DATE,
    km_registrati INT,
    dettaglio_lavori TEXT NOT NULL,
    ricambi_sostituiti TEXT,
    costo_finale NUMERIC(10, 2) NOT NULL,
    garanzia_mesi INT DEFAULT 12,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_storico_veicolo ON public.storico_interventi(veicolo_cliente_id);

-- --------------------------------------------------------------------------
-- 8. TABELLA: ASSISTENZA (Soccorso Stradale H24)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assistenza (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES public.clienti(id) ON DELETE SET NULL,
    nome_contatto VARCHAR(150) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    posizione_gps TEXT NOT NULL,
    problema_segnalato VARCHAR(150) NOT NULL,
    operatore_assegnato VARCHAR(100),
    stato VARCHAR(30) DEFAULT 'Urgente', -- Urgente, Carroattrezzi Inviato, In Corso, Risolto, Annullato
    data_richiesta TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assistenza_stato ON public.assistenza(stato);

-- --------------------------------------------------------------------------
-- 9. TABELLA: RICHIESTE (Tabella Registro Inbound Lead Web)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.richieste (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES public.clienti(id) ON DELETE SET NULL,
    tipo_servizio VARCHAR(50) NOT NULL, -- Noleggio, Officina, Assistenza H24, Contatto
    nome_cliente VARCHAR(150) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    messaggio TEXT,
    stato_richiesta VARCHAR(30) DEFAULT 'Nuova', -- Nuova, Confermata, Completata, Annullata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================================

ALTER TABLE public.clienti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veicoli_clienti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noleggi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servizi_officina ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officina ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storico_interventi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistenza ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.richieste ENABLE ROW LEVEL SECURITY;

-- Accesso in LETTURA Pubblica per Catalogo Auto e Servizi
CREATE POLICY "Public Read Auto" ON public.auto FOR SELECT USING (true);
CREATE POLICY "Public Read Servizi" ON public.servizi_officina FOR SELECT USING (true);

-- Accesso in INSERIMENTO Pubblico dai Form del Sito
CREATE POLICY "Public Insert Clienti" ON public.clienti FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Richieste" ON public.richieste FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Noleggi" ON public.noleggi FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Officina" ON public.officina FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Assistenza" ON public.assistenza FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Veicoli" ON public.veicoli_clienti FOR INSERT WITH CHECK (true);

-- Accesso Completo CRUD per Ruoli Autenticati (Pannello Admin)
CREATE POLICY "Admin Full Access Clienti" ON public.clienti USING (auth.role() = 'service_role');
CREATE POLICY "Admin Full Access Auto" ON public.auto USING (auth.role() = 'service_role');
CREATE POLICY "Admin Full Access Noleggi" ON public.noleggi USING (auth.role() = 'service_role');
CREATE POLICY "Admin Full Access Officina" ON public.officina USING (auth.role() = 'service_role');
CREATE POLICY "Admin Full Access Assistenza" ON public.assistenza USING (auth.role() = 'service_role');
CREATE POLICY "Admin Full Access Richieste" ON public.richieste USING (auth.role() = 'service_role');

-- ==========================================================================
-- SEED INITIAL DATA (Dati Iniziali Flotta, Servizi e Test)
-- ==========================================================================

-- Inserimento Flotta Auto
INSERT INTO public.auto (targa, marca, modello, categoria, gearbox, fuel, seats, luggage, immagini, prezzo_giorno, prezzo_settimana, disponibilita) VALUES
('GK123XX', 'BMW', 'Serie 5 M-Sport', 'Berline', 'Automatico', 'Diesel Hybrid', 5, '3 Valigie', 'assets/images/car_bmw_m5.jpg', 120.00, 700.00, true),
('FX999YY', 'Mercedes-Benz', 'AMG GT Coupe', 'Sportive', 'Automatico 9G', 'Benzina V8', 2, '2 Valigie', 'assets/images/car_mercedes_amg.jpg', 350.00, 2100.00, true),
('GB456ZZ', 'Audi', 'RS6 Avant Performance', 'Sportive', 'Automatico', 'Benzina V8', 5, '4 Valigie', 'assets/images/car_audi_rs6.jpg', 290.00, 1850.00, true),
('PO911AB', 'Porsche', '911 Carrera 4S', 'Sportive', 'PDK 8 Rapporti', 'Benzina', 4, '2 Valigie', 'assets/images/car_porsche_911.jpg', 380.00, 2400.00, true),
('FT500HY', 'Fiat', '500 Dolcevita Hybrid', 'City Car', 'Manuale', 'Ibrida', 4, '1 Valigia', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80', 45.00, 260.00, true),
('JP4444X', 'Jeep', 'Wrangler Rubicon 4xe', 'SUV', 'Automatico', 'Plug-in Hybrid', 5, '3 Valigie', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', 160.00, 980.00, true)
ON CONFLICT (targa) DO NOTHING;

-- Inserimento Catalogo Servizi Officina
INSERT INTO public.servizi_officina (titolo, icona, descrizione, tempo_stimato, prezzo_base) VALUES
('Tagliando Completo', '🔧', 'Controllo dettagliato di oltre 40 punti sicurezza, cambio filtri originali e lubrificanti ad alte prestazioni.', '2 Ore', 'da 140 €'),
('Diagnosi Elettronica', '💻', 'Scansione avanzata multimarca per azzeramento spie, verifica centraline e sensori ADAS.', '45 Minuti', '40 €'),
('Impianto Frenante & Dischi', '🛑', 'Sostituzione pastiglie e dischi freno, controllo liquido freni e spurgo con ricambi certificati.', '1.5 Ore', 'da 90 €'),
('Frizione e Cambio', '⚙️', 'Riparazione e sostituzione kit frizione, volano bimassa, cambio olio trasmissione automatica.', '1 Giorno', 'da 280 €'),
('Cinghia di Distribuzione', '🔄', 'Sostituzione kit distribuzione, pompa dell''acqua e cinghia servizi.', '4-6 Ore', 'da 290 €'),
('Cambio Olio & Filtri', '🛢️', 'Sostituzione olio motore con gradazione specifica consigliata dal costruttore e filtro olio.', '30 Minuti', 'da 65 €'),
('Assetto e Convergenza', '🎯', 'Calibrazione geometrica 3D delle ruote per una guida precisa ed usura uniforme.', '45 Minuti', '45 €'),
('Sospensioni ed Ammortizzatori', '🏗️', 'Verifica e sostituzione ammortizzatori, trapezi e silentblock.', '3 Ore', 'da 180 €'),
('Pneumatici & Equilibratura', '🏎️', 'Vendita, montaggio ed equilibratura pneumatici estivi, invernali e 4 stagioni.', '45 Minuti', 'da 50 € / gomma');

-- Inserimento Cliente di Esempio e Veicolo
INSERT INTO public.clienti (id, nome, cognome, telefono, email, citta) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Roberto', 'Ferrari', '+393471122334', 'roberto.ferrari@example.com', 'Milano')
ON CONFLICT (telefono) DO NOTHING;

INSERT INTO public.veicoli_clienti (cliente_id, targa, marca, modello, anno, chilometraggio) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'EF888AB', 'Audi', 'A4 Avant 2.0 TDI', 2021, 65000)
ON CONFLICT DO NOTHING;
