/* ==========================================================================
   THE WORLD CARS - Initial Production Data Model
   ========================================================================== */

const initialCars = [
  {
    id: "car-1",
    brand: "BMW",
    model: "Serie 5 M-Sport",
    category: "Berline",
    gearbox: "Automatico",
    fuel: "Diesel Hybrid",
    seats: 5,
    luggage: "3 Valigie",
    priceDaily: 120,
    priceWeekly: 700,
    available: true,
    image: "assets/images/car_bmw_m5.jpg",
    description: "Eleganza executive e prestazioni sportive eccezionali. Pacchetto M-Sport, fari Laser, interni in pelle Nappa e guida assistita."
  },
  {
    id: "car-2",
    brand: "Mercedes-Benz",
    model: "AMG GT Coupe",
    category: "Sportive",
    gearbox: "Automatico 9G",
    fuel: "Benzina V8",
    seats: 2,
    luggage: "2 Valigie",
    priceDaily: 350,
    priceWeekly: 2100,
    available: true,
    image: "assets/images/car_mercedes_amg.jpg",
    description: "Supercar pura. Motore V8 Biturbo, scarico sportivo valvolato, assetto regolabile per un'esperienza indimenticabile."
  },
  {
    id: "car-3",
    brand: "Audi",
    model: "RS6 Avant Performance",
    category: "Sportive",
    gearbox: "Automatico",
    fuel: "Benzina V8",
    seats: 5,
    luggage: "4 Valigie",
    priceDaily: 290,
    priceWeekly: 1850,
    available: true,
    image: "assets/images/car_audi_rs6.jpg",
    description: "La station wagon sportiva per eccellenza. 600 CV, trazione integrale quattro, freni carboceramici e comfort totale."
  },
  {
    id: "car-4",
    brand: "Porsche",
    model: "911 Carrera 4S",
    category: "Sportive",
    gearbox: "PDK 8 Rapporti",
    fuel: "Benzina",
    seats: 4,
    luggage: "2 Valigie",
    priceDaily: 380,
    priceWeekly: 2400,
    available: true,
    image: "assets/images/car_porsche_911.jpg",
    description: "Il mito della sportività tedesca. Trazione integrale dinamica, pacchetto Sport Chrono e prestazioni d'elite."
  },
  {
    id: "car-5",
    brand: "Fiat",
    model: "500 Dolcevita Hybrid",
    category: "City Car",
    gearbox: "Manuale",
    fuel: "Ibrida",
    seats: 4,
    luggage: "1 Valigia",
    priceDaily: 45,
    priceWeekly: 260,
    available: true,
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80",
    description: "Perfetta per muoversi in città. Consumi ridotti, tecnologia ibrida, cabriolet e stile italiano inconfondibile."
  },
  {
    id: "car-6",
    brand: "Jeep",
    model: "Wrangler Rubicon 4xe",
    category: "SUV",
    gearbox: "Automatico",
    fuel: "Plug-in Hybrid",
    seats: 5,
    luggage: "3 Valigie",
    priceDaily: 160,
    priceWeekly: 980,
    available: true,
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    description: "L'icona dell'off-road ibrida plug-in. Tetto apribile, trazione 4x4 avanzata e massima versatilità su ogni terreno."
  }
];

const initialOfficinaServices = [
  {
    id: "off-1",
    title: "Tagliando Completo",
    icon: "🔧",
    description: "Controllo dettagliato di oltre 40 punti sicurezza, cambio filtri originali e lubrificanti sintetici ad alte prestazioni.",
    time: "2 Ore",
    price: "da 140 €"
  },
  {
    id: "off-2",
    title: "Diagnosi Elettronica",
    icon: "💻",
    description: "Scansione avanzata con diagnosi ufficiale multimarca per azzeramento spie, verifica centraline ed calibrazione sensori ADAS.",
    time: "45 Minuti",
    price: "40 €"
  },
  {
    id: "off-3",
    title: "Impianto Frenante & Dischi",
    icon: "🛑",
    description: "Sostituzione pastiglie e dischi freno, rettifica, controllo liquido freni e spurgo con ricambi certificati.",
    time: "1.5 Ore",
    price: "da 90 €"
  },
  {
    id: "off-4",
    title: "Frizione e Cambio",
    icon: "⚙️",
    description: "Riparazione e sostituzione kit frizione, volano bimassa, cambio olio trasmissione automatica e manuale.",
    time: "1 Giorno",
    price: "da 280 €"
  },
  {
    id: "off-5",
    title: "Cinghia di Distribuzione",
    icon: "🔄",
    description: "Sostituzione kit distribuzione, pompa dell'acqua e cinghia servizi per prevenire gravi danni al motore.",
    time: "4-6 Ore",
    price: "da 290 €"
  },
  {
    id: "off-6",
    title: "Cambio Olio & Filtri",
    icon: "🛢️",
    description: "Sostituzione olio motore con gradazione specifica consigliata dal costruttore e filtro olio ad alta efficienza.",
    time: "30 Minuti",
    price: "da 65 €"
  },
  {
    id: "off-7",
    title: "Assetto e Convergenza",
    icon: "🎯",
    description: "Calibrazione geometrica 3D delle ruote per una guida precisa, sicurezza e usura uniforme dei pneumatici.",
    time: "45 Minuti",
    price: "45 €"
  },
  {
    id: "off-8",
    title: "Sospensioni ed Ammortizzatori",
    icon: "🏗️",
    description: "Verifica e sostituzione ammortizzatori, trapezi, silentblock e bracci oscillanti per il massimo comfort.",
    time: "3 Ore",
    price: "da 180 €"
  },
  {
    id: "off-9",
    title: "Pneumatici & Equilibratura",
    icon: "🏎️",
    description: "Vendita, montaggio ed equilibratura pneumatici estivi, invernali e 4 stagioni delle migliori marche.",
    time: "45 Minuti",
    price: "da 50 € / gomma"
  }
];

const initialAssistenzaServices = [
  {
    id: "ast-1",
    title: "Soccorso Stradale H24",
    icon: "🚨",
    description: "Intervento tempestivo entro 30 minuti dalla chiamata su strade urbane, extraurbane ed autostrade."
  },
  {
    id: "ast-2",
    title: "Traino Veicolo",
    icon: "🚛",
    description: "Trasporto sicuro del veicolo in avaria o incidentato presso la nostra officina o la destinazione desiderata."
  },
  {
    id: "ast-3",
    title: "Batteria Scarica",
    icon: "⚡",
    description: "Riavvio sul posto con booster professionale o sostituzione immediata della batteria in caso di esaurimento."
  },
  {
    id: "ast-4",
    title: "Cambio Gomma Rapido",
    icon: "🛞",
    description: "Sostituzione del pneumatico forato con ruotino di scorta o riparazione provvisoria sul posto per ripartire subito."
  },
  {
    id: "ast-5",
    title: "Recupero Veicolo Fuoristrada",
    icon: "🏗️",
    description: "Recupero di autovetture finite fuori strada, in fossi o bloccate in condizioni difficili mediante autogru."
  },
  {
    id: "ast-6",
    title: "Avviamento d'Emergenza",
    icon: "🔑",
    description: "Supporto per sblocco immobilizer, chiave rimasta all'interno dell'auto o problemi elettrici improvvisi."
  }
];

const initialReviews = [
  {
    name: "Marco Valenti",
    car: "Noleggio BMW Serie 5",
    rating: 5,
    comment: "Ho noleggiato la Serie 5 per un viaggio d'affari. Auto impeccabile, pulizia perfetta e servizio professionale. Tornerò sicuramente!",
    date: "12 Luglio 2026"
  },
  {
    name: "Elena Rossini",
    car: "Assistenza Stradale H24",
    rating: 5,
    comment: "Restare in panne di notte in autostrada è stato spaventoso, ma il loro carroattrezzi è arrived in soli 20 minuti! Cordiali e velocissimi.",
    date: "04 Luglio 2026"
  },
  {
    name: "Giuseppe Moretti",
    car: "Tagliando & Freni Officina",
    rating: 5,
    comment: "Officina all'avanguardia. Hanno diagnosticato e risolto un problema alla frizione con trasparenza assoluta nei prezzi.",
    date: "28 Giugno 2026"
  }
];

const initialSiteConfig = {
  companyName: "THE WORLD CARS",
  phone: "+39 02 8877665",
  emergencyPhone: "+39 333 9988776",
  whatsappNumber: "393339988776",
  email: "info@theworldcars.it",
  address: "Via dell'Automobile 42, 20121 Milano (MI)",
  // Live Supabase Credentials
  supabaseUrl: "https://fhmaymnnpwhykxnjrxcv.supabase.co",
  supabaseKey: "sb_publishable_9vbpBotMN8SbWkLf9A97cQ_7gv6BvhN",
  // Live Telegram Credentials
  telegramBotToken: "8743722064:AAEH5j4pZCfnXaG5KswNXaakA66-tiH5HXU",
  telegramChatId: "573990897",
  // Default SHA-256 Hash for password 'admin123'
  adminPasswordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9"
};
