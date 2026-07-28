/* ==========================================================================
   THE WORLD CARS - Central Production Store & Relational Cloud Sync Engine (v2.2)
   Features: Date Range Collision Detection, Car Auto-Status Toggle & Email Dispatcher
   ========================================================================== */

class AppStore {
  constructor() {
    this.cars = this.loadFromStorage('twc_cars', initialCars);
    this.officinaServices = this.loadFromStorage('twc_officina', initialOfficinaServices);
    this.assistenzaServices = this.loadFromStorage('twc_assistenza', initialAssistenzaServices);
    this.reviews = this.loadFromStorage('twc_reviews', initialReviews);
    this.requests = this.loadFromStorage('twc_requests', []);
    this.siteConfig = this.loadFromStorage('twc_config', initialSiteConfig);
  }

  loadFromStorage(key, defaultValue) {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      console.warn(`Error loading ${key} from storage:`, e);
      return defaultValue;
    }
  }

  saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
    }
  }

  // --- Web Crypto SHA-256 Hashing ---
  async hashPassword(plainText) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async verifyAdminPassword(plainTextPassword) {
    const hashedInput = await this.hashPassword(plainTextPassword.trim());
    const targetHash = this.siteConfig.adminPasswordHash || "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";
    
    if (hashedInput === targetHash) {
      const sessionToken = {
        authenticated: true,
        expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes session expiry
      };
      sessionStorage.setItem('twc_admin_session', JSON.stringify(sessionToken));
      return true;
    }
    return false;
  }

  isAdminAuthenticated() {
    try {
      const sessionData = sessionStorage.getItem('twc_admin_session');
      if (!sessionData) return false;
      const session = JSON.parse(sessionData);
      if (session.authenticated && session.expiresAt > Date.now()) {
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  refreshAdminSession() {
    if (this.isAdminAuthenticated()) {
      const sessionToken = {
        authenticated: true,
        expiresAt: Date.now() + (15 * 60 * 1000)
      };
      sessionStorage.setItem('twc_admin_session', JSON.stringify(sessionToken));
    }
  }

  logoutAdmin() {
    sessionStorage.removeItem('twc_admin_session');
  }

  // --- Check Car Availability for Date Range ---
  isCarAvailableForDates(carId, startDateStr, endDateStr) {
    if (!startDateStr || !endDateStr) return true;

    const car = this.cars.find(c => c.id === carId);
    if (!car) return true;

    const carTitle = `${car.brand} ${car.model}`.toLowerCase();
    const userStart = new Date(startDateStr);
    const userEnd = new Date(endDateStr);

    // Look for confirmed bookings overlapping dates
    const collision = this.requests.find(r => {
      if (r.type !== 'Noleggio') return false;
      const matchCar = (r.carId === carId) || (r.serviceName && r.serviceName.toLowerCase() === carTitle);
      const isConfirmed = r.status === 'Confermata' || r.status === 'Approvato' || r.status === 'In Corso';

      if (matchCar && isConfirmed && r.startDate && r.endDate) {
        const reqStart = new Date(r.startDate);
        const reqEnd = new Date(r.endDate);
        // Overlap condition: reqStart <= userEnd AND reqEnd >= userStart
        return (reqStart <= userEnd && reqEnd >= userStart);
      }
      return false;
    });

    return !collision; // Returns true if free, false if occupied
  }

  // --- Email Notification Dispatcher ---
  async sendEmailNotification(payload) {
    try {
      fetch('/api/email-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(e => console.log("Email serverless notice:", e));
    } catch (e) {
      console.log("Email dispatch fallback:", e);
    }
  }

  // --- Telegram Notification Dispatcher ---
  async sendTelegramNotification(payload) {
    let tgText = `🏎️ *Nuova richiesta THE WORLD CARS*\n\n`;
    tgText += `📋 *Servizio:* ${payload.type || 'Richiesta Generale'}\n`;
    tgText += `👤 *Nome cliente:* ${payload.clientName || 'N/D'}\n`;
    tgText += `📞 *Telefono:* ${payload.phone || 'N/D'}\n`;
    tgText += `✉️ *Email:* ${payload.email || 'Non specificata'}\n`;

    if (payload.serviceName) tgText += `🚗 *Auto / Intervento:* ${payload.serviceName}\n`;
    if (payload.startDate) tgText += `📅 *Data:* ${payload.startDate} ${payload.endDate ? 'fino a ' + payload.endDate : ''}\n`;
    if (payload.totalPrice) tgText += `💰 *Prezzo Stimato:* € ${payload.totalPrice}\n`;
    if (payload.location) tgText += `📍 *Posizione GPS:* ${payload.location}\n`;
    if (payload.notes) tgText += `📝 *Messaggio / Note:* ${payload.notes}\n`;

    tgText += `\n⚙️ _Gestisci la richiesta dal Pannello Amministratore._`;

    // 1. Vercel Serverless Endpoint
    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData.success) {
          console.log("✅ Serverless Telegram notification dispatched!");
          return { success: true };
        }
      }
    } catch (err) {
      console.log("Serverless endpoint unavailable on local server, using direct fallback.");
    }

    // 2. Direct Telegram API Fallback
    const token = this.siteConfig.telegramBotToken || "8743722064:AAEH5j4pZCfnXaG5KswNXaakA66-tiH5HXU";
    const chatId = this.siteConfig.telegramChatId || "573990897";

    if (token && chatId) {
      try {
        const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
        const directRes = await fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: tgText,
            parse_mode: 'Markdown'
          })
        });

        const directData = await directRes.json();
        if (directData.ok) {
          console.log("✅ Direct Telegram notification dispatched!");
          return { success: true };
        }
      } catch (err) {
        console.error("❌ Telegram Direct Network Error:", err);
      }
    }

    return { success: false, reason: "Impossibile inviare notifica Telegram" };
  }

  // --- Relational Supabase Sync ---
  async syncSupabaseRelational(table, payload) {
    const supabaseUrl = window.SUPABASE_URL || this.siteConfig.supabaseUrl;
    const supabaseKey = window.SUPABASE_ANON_KEY || this.siteConfig.supabaseKey;

    if (!supabaseUrl || !supabaseKey) return null;

    try {
      const endpoint = `${supabaseUrl}/rest/v1/${table}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data[0] : data;
      }
    } catch (e) {
      console.warn("Supabase Sync warning:", e);
    }
    return null;
  }

  // --- Create Request ---
  async createRequest(reqData) {
    const newReq = {
      id: "req-" + Date.now().toString().slice(-6),
      createdAt: new Date().toLocaleString('it-IT'),
      status: "Nuova",
      ...reqData
    };

    this.requests.unshift(newReq);
    this.saveToStorage('twc_requests', this.requests);

    const nameParts = (reqData.clientName || 'Cliente Anonimo').trim().split(' ');
    const nome = nameParts[0] || 'Cliente';
    const cognome = nameParts.slice(1).join(' ') || 'Cliente';

    const clienteRecord = await this.syncSupabaseRelational('clienti', {
      nome: nome,
      cognome: cognome,
      telefono: reqData.phone,
      email: reqData.email || null
    });

    const clienteId = clienteRecord ? clienteRecord.id : null;

    await this.syncSupabaseRelational('richieste', {
      cliente_id: clienteId,
      tipo_servizio: reqData.type,
      nome_cliente: reqData.clientName,
      telefono: reqData.phone,
      email: reqData.email || null,
      messaggio: reqData.notes || reqData.serviceName || null,
      stato_richiesta: 'Nuova'
    });

    if (reqData.type === 'Noleggio') {
      const selectedCar = this.cars.find(c => (c.brand + ' ' + c.model) === reqData.serviceName);
      await this.syncSupabaseRelational('noleggi', {
        cliente_id: clienteId,
        auto_id: selectedCar ? selectedCar.id : null,
        data_inizio: reqData.startDate,
        data_fine: reqData.endDate,
        prezzo_stimato: reqData.totalPrice || 0,
        stato_noleggio: 'In Attesa',
        note_noleggio: reqData.notes || null
      });
    } else if (reqData.type === 'Officina') {
      await this.syncSupabaseRelational('officina', {
        cliente_id: clienteId,
        descrizione_intervento: reqData.serviceName,
        data_appuntamento: reqData.startDate || new Date().toISOString().split('T')[0],
        note_tecniche: `Veicolo: ${reqData.vehicle || 'N/D'} | Note: ${reqData.notes || 'Nessuna'}`,
        stato: 'In Attesa'
      });
    } else if (reqData.type === 'Assistenza H24') {
      await this.syncSupabaseRelational('assistenza', {
        cliente_id: clienteId,
        nome_contatto: reqData.clientName,
        telefono: reqData.phone,
        posizione_gps: reqData.location || 'Non specificata',
        problema_segnalato: reqData.serviceName || 'Soccorso Stradale',
        stato: 'Urgente'
      });
    }

    // Trigger Notifications (Telegram & Email)
    await this.sendTelegramNotification(newReq);
    this.sendEmailNotification(newReq);

    return newReq;
  }

  updateRequestStatus(id, newStatus) {
    if (!this.isAdminAuthenticated()) return false;
    const req = this.requests.find(r => r.id === id);
    if (req) {
      req.status = newStatus;
      this.saveToStorage('twc_requests', this.requests);

      // Auto update car availability status if booking is 'Confermata'
      if (req.type === 'Noleggio' && req.serviceName) {
        const car = this.cars.find(c => (c.brand + ' ' + c.model) === req.serviceName || c.id === req.carId);
        if (car) {
          if (newStatus === 'Confermata') {
            car.available = false;
          } else if (['Completata', 'Annullata', 'Nuova'].includes(newStatus)) {
            // Check if car has any other active confirmed bookings
            const hasOtherActive = this.requests.some(other => 
              other.id !== id && 
              other.type === 'Noleggio' && 
              (other.serviceName === req.serviceName || other.carId === car.id) && 
              other.status === 'Confermata'
            );
            if (!hasOtherActive) {
              car.available = true;
            }
          }
          this.saveToStorage('twc_cars', this.cars);
        }
      }

      return true;
    }
    return false;
  }

  deleteRequest(id) {
    if (!this.isAdminAuthenticated()) return false;
    this.requests = this.requests.filter(r => r.id !== id);
    this.saveToStorage('twc_requests', this.requests);
    return true;
  }

  // --- Cars CRUD ---
  addCar(carData) {
    if (!this.isAdminAuthenticated()) return false;
    const newCar = {
      id: "car-" + Date.now().toString().slice(-6),
      available: true,
      ...carData
    };
    this.cars.push(newCar);
    this.saveToStorage('twc_cars', this.cars);

    this.syncSupabaseRelational('auto', {
      marca: carData.brand,
      modello: carData.model,
      categoria: carData.category,
      gearbox: carData.gearbox,
      fuel: carData.fuel,
      seats: carData.seats,
      luggage: carData.luggage,
      immagini: carData.image,
      prezzo_giorno: carData.priceDaily,
      prezzo_settimana: carData.priceWeekly,
      disponibilita: true,
      stato_veicolo: 'Disponibile'
    });

    return newCar;
  }

  updateCar(id, updatedData) {
    if (!this.isAdminAuthenticated()) return false;
    const index = this.cars.findIndex(c => c.id === id);
    if (index !== -1) {
      this.cars[index] = { ...this.cars[index], ...updatedData };
      this.saveToStorage('twc_cars', this.cars);
      return true;
    }
    return false;
  }

  toggleCarAvailability(id) {
    if (!this.isAdminAuthenticated()) return false;
    const car = this.cars.find(c => c.id === id);
    if (car) {
      car.available = !car.available;
      this.saveToStorage('twc_cars', this.cars);
      return car.available;
    }
    return false;
  }

  deleteCar(id) {
    if (!this.isAdminAuthenticated()) return false;
    this.cars = this.cars.filter(c => c.id !== id);
    this.saveToStorage('twc_cars', this.cars);
    return true;
  }

  // --- Site Config ---
  async updateConfig(newConfig) {
    if (!this.isAdminAuthenticated()) return false;
    this.siteConfig = { ...this.siteConfig, ...newConfig };
    this.saveToStorage('twc_config', this.siteConfig);
    return true;
  }
}

const store = new AppStore();
