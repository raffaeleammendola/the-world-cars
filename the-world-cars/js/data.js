/* ==========================================================================
   THE WORLD CARS - Data Models & Default Configuration (v2.3)
   Updated: Exact Location & Company Heading (Corso Resina, 314/D, Ercolano NA)
   ========================================================================== */

const initialCars = [
  {
    id: "car-101",
    brand: "Porsche",
    model: "911 Carrera S",
    category: "Sportive",
    gearbox: "Automatico",
    fuel: "Benzina V6 Turbo",
    seats: 4,
    luggage: "2 Valigie",
    priceDaily: 250,
    priceWeekly: 1400,
    available: true,
    image: "./assets/images/car_porsche_911.jpg",
    description: "Prestazioni da brivido, eleganza e sound inconfondibile. Ideale per weekend esclusivi ed eventi."
  },
  {
    id: "car-102",
    brand: "BMW",
    model: "M5 Competition",
    category: "Berline",
    gearbox: "Automatico",
    fuel: "Benzina V8 Twin-Turbo",
    seats: 5,
    luggage: "3 Valigie",
    priceDaily: 220,
    priceWeekly: 1250,
    available: true,
    image: "./assets/images/car_bmw_m5.jpg",
    description: "La berlina ad altissime prestazioni per eccellenza. 625 CV di pura tecnologia con trazione xDrive."
  },
  {
    id: "car-103",
    brand: "Mercedes-AMG",
    model: "G 63 V8",
    category: "SUV",
    gearbox: "Automatico",
    fuel: "Benzina V8 Biturbo",
    seats: 5,
    luggage: "4 Valigie",
    priceDaily: 300,
    priceWeekly: 1800,
    available: true,
    image: "./assets/images/car_mercedes_amg.jpg",
    description: "Presenza scenica inimitabile, lusso di altissimo livello e prestazioni off-road imbattibili."
  },
  {
    id: "car-104",
    brand: "Audi",
    model: "RS6 Avant",
    category: "Berline",
    gearbox: "Automatico",
    fuel: "Benzina V8 Mild-Hybrid",
    seats: 5,
    luggage: "4 Valigie",
    priceDaily: 240,
    priceWeekly: 1350,
    available: true,
    image: "./assets/images/car_audi_rs6.jpg",
    description: "La station wagon più potente ed aggressiva al mondo. Spazio eccezionale e prestazioni da supercar."
  }
];

const initialOfficinaServices = [
  {
    id: "off-1",
    icon: "🔧",
    title: "Tagliando Completo & Filtri",
    description: "Sostituzione olio motore, filtri aria/olio/carburante/abitacolo e controllo 30 punti di sicurezza.",
    time: "2-3 Ore",
    price: "da €140"
  },
  {
    id: "off-2",
    icon: "💻",
    title: "Diagnosi Elettronica 3D & Elettrauto",
    description: "Scansione completa centraline, azzeramento spie, diagnosi guasti elettrici ed aggiornamento software.",
    time: "1 Ora",
    price: "da €40"
  },
  {
    id: "off-3",
    icon: "🛑",
    title: "Impianto Frenante & Dischi",
    description: "Sostituzione pastiglie, dischi freno ventilati, spurgo liquido freni e controllo sensori ABS.",
    time: "2 Ore",
    price: "da €90"
  },
  {
    id: "off-4",
    icon: "⚙️",
    title: "Frizione e Cambio",
    description: "Sostituzione kit frizione, volante bimassa, revisione cambio manuale ed automatico.",
    time: "1 Giorno",
    price: "da €350"
  },
  {
    id: "off-5",
    icon: "🔄",
    title: "Cinghia di Distribuzione",
    description: "Sostituzione kit distribuzione, pompa dell'acqua e cinghia dei servizi con ricambi originali.",
    time: "4-5 Ore",
    price: "da €280"
  },
  {
    id: "off-6",
    icon: "🛞",
    title: "Assetto Ruote & Pneumatici",
    description: "Convergenza 3D ad alta precisione, equilibratura digitale e sostituzione pneumatici invernali/estivi.",
    time: "1 Ora",
    price: "da €50"
  }
];

const initialAssistenzaServices = [
  {
    id: "ast-1",
    icon: "🚨",
    title: "Soccorso Stradale In Avaria",
    description: "Invio immediato carroattrezzi per recupero veicolo in panne in città ed autostrada H24.",
    time: "30 Minuti"
  },
  {
    id: "ast-2",
    icon: "⚡",
    title: "Avviamento Batteria Scarica",
    description: "Intervento rapido sul posto con booster professionale per riavvio immediato del motore.",
    time: "20 Minuti"
  },
  {
    id: "ast-3",
    icon: "🛞",
    title: "Sostituzione Gomma Forata",
    description: "Montaggio ruota di scorta o riparazione foratura sul posto per farti ripartire subito.",
    time: "25 Minuti"
  },
  {
    id: "ast-4",
    icon: "🔑",
    title: "Sblocco Serrature & Chiavi",
    description: "Apertura porta veicolo senza danni in caso di chiavi smarrite o chiuse all'interno.",
    time: "30 Minuti"
  }
];

const initialReviews = [
  {
    id: "rev-1",
    name: "Marco Ferraro",
    car: "Noleggio Porsche 911",
    rating: 5,
    comment: "Esperienza indimenticabile! Vettura in condizioni da vetrina, consegna puntuale ed assistenza impeccabile."
  },
  {
    id: "rev-2",
    name: "Giuseppe Esposito",
    car: "Intervento Officina Tagliando",
    rating: 5,
    comment: "Meccanici estremamente trasparenti e qualificati. Tagliando eseguito in poche ore con ricambi certificati."
  },
  {
    id: "rev-3",
    name: "Roberto De Luca",
    car: "Assistenza Stradale H24",
    rating: 5,
    comment: "Carroattrezzi arrivato in meno di 25 minuti di notte. Efficienza e cortesia impagabili!"
  }
];

const initialSiteConfig = {
  companyName: "The World Cars Elettrauto - Meccanico - Soccorso Stradale",
  address: "Corso Resina, 314/D, 80056 Ercolano NA",
  phone: "+39 081 7776655",
  emergencyPhone: "+39 333 9988776",
  whatsappNumber: "393339988776",
  email: "info@theworldcars.it",
  supabaseUrl: "https://fhmaymnnpwhykxnjrxcv.supabase.co",
  supabaseKey: "sb_publishable_9vbpBotMN8SbWkLf9A97cQ_7gv6BvhN",
  telegramBotToken: "8743722064:AAEH5j4pZCfnXaG5KswNXaakA66-tiH5HXU",
  telegramChatId: "573990897",
  adminPasswordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", // Default: admin123
  logoIcon: "🏎️",
  logoImageUrl: ""
};
