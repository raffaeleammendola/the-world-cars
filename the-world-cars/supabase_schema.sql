-- ==========================================================================
-- THE WORLD CARS - Complete Supabase Cloud Database Schema (PostgreSQL)
-- Includes: 6 Normalized Tables, RLS Policies, Indexes, and Initial Seed Data
-- ==========================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELLA: CLIENTI
CREATE TABLE IF NOT EXISTS public.clienti (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    cognome VARCHAR(100) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    data_registrazione TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELLA: RICHIESTE (Generali, Noleggio, Officina, Assistenza)
CREATE TABLE IF NOT EXISTS public.richieste (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_servizio VARCHAR(50) NOT NULL, -- Noleggio, Officina, Assistenza H24, Contatto
    cliente VARCHAR(200) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    messaggio TEXT,
    data_richiesta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stato_richiesta VARCHAR(30) DEFAULT 'Nuova' -- Nuova, Confermata, Completata, Annullata
);

-- 3. TABELLA: AUTO (Flotta Noleggio)
CREATE TABLE IF NOT EXISTS public.auto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    marca VARCHAR(100) NOT NULL,
    modello VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL, -- Sportive, SUV, Berline, City Car
    gearbox VARCHAR(50) DEFAULT 'Automatico',
    fuel VARCHAR(50) DEFAULT 'Benzina',
    seats INT DEFAULT 5,
    luggage VARCHAR(50) DEFAULT '2 Valigie',
    immagini TEXT NOT NULL,
    prezzo_giorno NUMERIC(10, 2) NOT NULL,
    prezzo_settimana NUMERIC(10, 2) NOT NULL,
    disponibilita BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELLA: NOLEGGI (Prenotazioni Specifiche Flotta)
CREATE TABLE IF NOT EXISTS public.noleggi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auto_id UUID REFERENCES public.auto(id) ON DELETE SET NULL,
    auto_selezionata VARCHAR(150) NOT NULL,
    cliente VARCHAR(200) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    data_inizio DATE NOT NULL,
    data_fine DATE NOT NULL,
    prezzo_stimato NUMERIC(10, 2) NOT NULL,
    stato VARCHAR(30) DEFAULT 'In Attesa', -- In Attesa, Approvato, In Corso, Concluso, Annullato
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELLA: OFFICINA (Appuntamenti Manutenzione & Riparazioni)
CREATE TABLE IF NOT EXISTS public.officina (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente VARCHAR(200) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    veicolo VARCHAR(150) NOT NULL,
    servizio_richiesto VARCHAR(100) NOT NULL,
    data_appuntamento DATE NOT NULL,
    note TEXT,
    stato VARCHAR(30) DEFAULT 'In Attesa', -- In Attesa, In Lavorazione, Pronta, Consegnata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELLA: ASSISTENZA (Interventi Soccorso Stradale H24)
CREATE TABLE IF NOT EXISTS public.assistenza (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente VARCHAR(200) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    posizione_gps TEXT NOT NULL,
    problema VARCHAR(100) NOT NULL,
    stato VARCHAR(30) DEFAULT 'Urgente', -- Urgente, In Carico, Risolto, Annullato
    data_richiesta TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================================

ALTER TABLE public.clienti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.richieste ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noleggi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officina ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistenza ENABLE ROW LEVEL SECURITY;

-- Allow Public READ access to Cars Catalog
CREATE POLICY "Allow public read access to auto" ON public.auto FOR SELECT USING (true);

-- Allow Public INSERT for client form submissions
CREATE POLICY "Allow public insert to richieste" ON public.richieste FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to noleggi" ON public.noleggi FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to officina" ON public.officina FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to assistenza" ON public.assistenza FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to clienti" ON public.clienti FOR INSERT WITH CHECK (true);

-- Full CRUD Policy for Service Role (Admin Dashboard)
CREATE POLICY "Allow full access for authenticated service role" ON public.richieste USING (auth.role() = 'service_role');
CREATE POLICY "Allow full access to auto for service role" ON public.auto USING (auth.role() = 'service_role');

-- ==========================================================================
-- SEED INITIAL DATA (Auto Flotta)
-- ==========================================================================

INSERT INTO public.auto (marca, modello, categoria, gearbox, fuel, seats, luggage, immagini, prezzo_giorno, prezzo_settimana, disponibilita) VALUES
('BMW', 'Serie 5 M-Sport', 'Berline', 'Automatico', 'Diesel Hybrid', 5, '3 Valigie', 'assets/images/car_bmw_m5.jpg', 120.00, 700.00, true),
('Mercedes-Benz', 'AMG GT Coupe', 'Sportive', 'Automatico 9G', 'Benzina V8', 2, '2 Valigie', 'assets/images/car_mercedes_amg.jpg', 350.00, 2100.00, true),
('Audi', 'RS6 Avant Performance', 'Sportive', 'Automatico', 'Benzina V8', 5, '4 Valigie', 'assets/images/car_audi_rs6.jpg', 290.00, 1850.00, true),
('Porsche', '911 Carrera 4S', 'Sportive', 'PDK 8 Rapporti', 'Benzina', 4, '2 Valigie', 'assets/images/car_porsche_911.jpg', 380.00, 2400.00, true),
('Fiat', '500 Dolcevita Hybrid', 'City Car', 'Manuale', 'Ibrida', 4, '1 Valigia', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80', 45.00, 260.00, true),
('Jeep', 'Wrangler Rubicon 4xe', 'SUV', 'Automatico', 'Plug-in Hybrid', 5, '3 Valigie', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', 160.00, 980.00, true);
