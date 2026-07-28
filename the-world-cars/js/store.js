/* ==========================================================================
   THE WORLD CARS - Central Production Store & Relational Cloud Sync Engine (v2.6)
   Features: Real-Time Cross-Device Sync (Supabase), Dual Email Dispatcher
   ========================================================================== */

class AppStore {
  constructor() {
    this.cars = this.loadFromStorage('twc_cars', initialCars);
    this.officinaServices = this.loadFromStorage('twc_officina', initialOfficinaServices);
    this.assistenzaServices = this.loadFromStorage('twc_assistenza', initialAssistenzaServices);
    this.reviews = this.loadFromStorage('twc_reviews', initialReviews);
    this.requests = this.loadFromStorage('twc_requests', []);
    this.siteConfig = this.loadFromStorage('twc_config', initialSiteConfig);
    
    // Attempt Cloud Sync on load
    this.cloudSynced = false;
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

  // --- Real-Time Cloud Sync (Cross-Device) ---
  async initCloudSync() {
    const supabaseUrl = window.SUPABASE_URL || this.siteConfig.supabaseUrl;
    const supabaseKey = window.SUPABASE_ANON_KEY || this.siteConfig.supabaseKey;

    if (!supabaseUrl || !supabaseKey) {
      console.log("Supabase non configurato, uso solo memoria locale.");
      return false;
    }

    try {
      console.log("Sincronizzazione dati da Supabase Cloud...");
      
      // Fetch Auto
      const resCars = await fetch(`${supabaseUrl}/rest/v1/auto`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }});
      if (resCars.ok) {
        const dbCars = await resCars.json();
        if (dbCars && dbCars.length > 0) {
          this.cars = dbCars.map(c => ({
            id: c.id_locale || c.id,
            brand: c.marca,
            model: c.modello,
            category: c.categoria,
            gearbox: c.gearbox,
            fuel: c.fuel,
            seats: c.seats,
            luggage: c.luggage,
            image: c.immagini,
            priceDaily: c.prezzo_giorno,
            priceWeekly: c.prezzo_settimana,
            available: c.disponibilita,
            description: c.descrizione
          }));
          this.saveToStorage('twc_cars', this.cars);
        }
      }

      // Fetch Richieste
      const resReqs = await fetch(`${supabaseUrl}/rest/v1/richieste?order=created_at.desc`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }});
      if (resReqs.ok) {
        const dbReqs = await resReqs.json();
        if (dbReqs && dbReqs.length > 0) {
          this.requests = dbReqs.map(r => ({
            id: r.id_locale || r.id,
            createdAt: new Date(r.created_at).toLocaleString('it-IT'),
            type: r.tipo_servizio,
            clientName: r.nome_cliente,
            phone: r.telefono,
            email: r.email,
            notes: r.messaggio,
            serviceName: r.veicolo_servizio,
            startDate: r.data_inizio,
            endDate: r.data_fine,
            totalPrice: r.prezzo_stimato,
            location: r.posizione_gps,
            status: r.stato_richiesta
          }));
          this.saveToStorage('twc_requests', this.requests);
        }
      }

      // Fetch Servizi Officina
      const resOff = await fetch(`${supabaseUrl}/rest/v1/servizi_officina`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }});
      if (resOff.ok) {
        const dbOff = await resOff.json();
        if (dbOff && dbOff.length > 0) {
          this.officinaServices = dbOff.map(s => ({
            id: s.id_locale || s.id,
            title: s.titolo,
            description: s.descrizione,
            icon: s.icona,
            time: s.tempo,
            price: s.prezzo
          }));
          this.saveToStorage('twc_officina', this.officinaServices);
        }
      }

      // Fetch Servizi Assistenza
      const resAss = await fetch(`${supabaseUrl}/rest/v1/servizi_assistenza`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }});
      if (resAss.ok) {
        const dbAss = await resAss.json();
        if (dbAss && dbAss.length > 0) {
          this.assistenzaServices = dbAss.map(s => ({
            id: s.id_locale || s.id,
            title: s.titolo,
            description: s.descrizione,
            icon: s.icona,
            time: s.tempo
          }));
          this.saveToStorage('twc_assistenza', this.assistenzaServices);
        }
      }

      this.cloudSynced = true;
      console.log("✅ Sincronizzazione Cloud completata con successo!");
      return true;

    } catch (e) {
      console.error("Errore Sincronizzazione Cloud Supabase (le tabelle esistono?):", e);
      return false;
    }
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
  
  async updateSupabaseRelational(table, id_locale, payload) {
    const supabaseUrl = window.SUPABASE_URL || this.siteConfig.supabaseUrl;
    const supabaseKey = window.SUPABASE_ANON_KEY || this.siteConfig.supabaseKey;
    if (!supabaseUrl || !supabaseKey) return null;

    try {
      const endpoint = `${supabaseUrl}/rest/v1/${table}?id_locale=eq.${id_locale}`;
      await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn("Supabase Update warning:", e);
    }
  }

  async deleteSupabaseRelational(table, id_locale) {
    const supabaseUrl = window.SUPABASE_URL || this.siteConfig.supabaseUrl;
    const supabaseKey = window.SUPABASE_ANON_KEY || this.siteConfig.supabaseKey;
    if (!supabaseUrl || !supabaseKey) return null;

    try {
      const endpoint = `${supabaseUrl}/rest/v1/${table}?id_locale=eq.${id_locale}`;
      await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
    } catch (e) {
      console.warn("Supabase Delete warning:", e);
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
        expiresAt: Date.now() + (15 * 60 * 1000)
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

    const collision = this.requests.find(r => {
      if (r.type !== 'Noleggio') return false;
      const matchCar = (r.carId === carId) || (r.serviceName && r.serviceName.toLowerCase() === carTitle);
      const isConfirmed = r.status === 'Confermata' || r.status === 'Approvato' || r.status === 'In Corso';

      if (matchCar && isConfirmed && r.startDate && r.endDate) {
        const reqStart = new Date(r.startDate);
        const reqEnd = new Date(r.endDate);
        return (reqStart <= userEnd && reqEnd >= userStart);
      }
      return false;
    });

    return !collision;
  }

  isCarOccupiedToday(carId) {
    const todayStr = new Date().toISOString().split('T')[0];
    return !this.isCarAvailableForDates(carId, todayStr, todayStr);
  }

  // --- Email Notification Dispatcher ---
  async sendEmailNotification(payload) {
    const targetEmail = this.siteConfig.email || 'info@theworldcars.it';
    const emailPayload = {
      targetEmail: targetEmail,
      clientEmail: payload.email || payload.clientEmail || null,
      ...payload
    };

    console.log(`📧 Dispatching Email to Owner (${targetEmail}) & Client (${payload.email || 'N/D'})...`);

    try {
      const res = await fetch('/api/email-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      });
      if (res.ok) {
        console.log("✅ Serverless Email notification dispatched!");
      }
    } catch (e) {
      console.log("Email dispatch local fallback notice:", e);
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

    // 1. Serverless Endpoint
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

  // --- Create Request & Dispatch Across ALL CHANNELS ---
  async createRequest(reqData) {
    const newReq = {
      id: "req-" + Date.now().toString().slice(-6),
      createdAt: new Date().toLocaleString('it-IT'),
      status: "Nuova",
      ...reqData
    };

    this.requests.unshift(newReq);
    this.saveToStorage('twc_requests', this.requests);

    await this.syncSupabaseRelational('richieste', {
      id_locale: newReq.id,
      tipo_servizio: reqData.type,
      nome_cliente: reqData.clientName,
      telefono: reqData.phone,
      email: reqData.email || null,
      messaggio: reqData.notes || null,
      veicolo_servizio: reqData.serviceName || null,
      data_inizio: reqData.startDate || null,
      data_fine: reqData.endDate || null,
      prezzo_stimato: reqData.totalPrice || null,
      posizione_gps: reqData.location || null,
      stato_richiesta: 'Nuova'
    });

    // Trigger Multi-Channel Notifications (Telegram + Owner Gmail + Client Email)
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
      
      this.updateSupabaseRelational('richieste', id, { stato_richiesta: newStatus });

      if (req.type === 'Noleggio' && req.serviceName) {
        const car = this.cars.find(c => (c.brand + ' ' + c.model) === req.serviceName || c.id === req.carId);
        if (car) {
          if (newStatus === 'Confermata') {
            car.available = false;
          } else if (['Completata', 'Annullata', 'Nuova'].includes(newStatus)) {
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
          this.updateSupabaseRelational('auto', car.id, { disponibilita: car.available });
        }
      }

      // If status changed to 'Confermata', trigger Email Confirmation to Client as well
      if (newStatus === 'Confermata') {
        this.sendEmailNotification({
          isConfirmation: true,
          clientName: req.clientName,
          clientEmail: req.email,
          phone: req.phone,
          type: req.type,
          serviceName: req.serviceName,
          startDate: req.startDate,
          endDate: req.endDate
        });
      }

      return true;
    }
    return false;
  }

  deleteRequest(id) {
    if (!this.isAdminAuthenticated()) return false;
    this.requests = this.requests.filter(r => r.id !== id);
    this.saveToStorage('twc_requests', this.requests);
    this.deleteSupabaseRelational('richieste', id);
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
      id_locale: newCar.id,
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
      descrizione: carData.description || null
    });

    return newCar;
  }

  updateCar(id, updatedData) {
    if (!this.isAdminAuthenticated()) return false;
    const index = this.cars.findIndex(c => c.id === id);
    if (index !== -1) {
      this.cars[index] = { ...this.cars[index], ...updatedData };
      this.saveToStorage('twc_cars', this.cars);
      
      this.updateSupabaseRelational('auto', id, {
        marca: updatedData.brand,
        modello: updatedData.model,
        categoria: updatedData.category,
        gearbox: updatedData.gearbox,
        fuel: updatedData.fuel,
        seats: updatedData.seats,
        luggage: updatedData.luggage,
        immagini: updatedData.image,
        prezzo_giorno: updatedData.priceDaily,
        prezzo_settimana: updatedData.priceWeekly,
        descrizione: updatedData.description
      });
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
      this.updateSupabaseRelational('auto', id, { disponibilita: car.available });
      return car.available;
    }
    return false;
  }

  deleteCar(id) {
    if (!this.isAdminAuthenticated()) return false;
    this.cars = this.cars.filter(c => c.id !== id);
    this.saveToStorage('twc_cars', this.cars);
    this.deleteSupabaseRelational('auto', id);
    return true;
  }

  // --- Officina Services CRUD ---
  addOfficinaService(serviceData) {
    if (!this.isAdminAuthenticated()) return false;
    const newSvc = {
      id: "off-" + Date.now().toString().slice(-6),
      ...serviceData
    };
    this.officinaServices.push(newSvc);
    this.saveToStorage('twc_officina', this.officinaServices);
    
    this.syncSupabaseRelational('servizi_officina', {
      id_locale: newSvc.id,
      titolo: serviceData.title,
      descrizione: serviceData.description,
      icona: serviceData.icon,
      tempo: serviceData.time,
      prezzo: serviceData.price
    });
    return newSvc;
  }

  updateOfficinaService(id, updatedData) {
    if (!this.isAdminAuthenticated()) return false;
    const idx = this.officinaServices.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.officinaServices[idx] = { ...this.officinaServices[idx], ...updatedData };
      this.saveToStorage('twc_officina', this.officinaServices);
      
      this.updateSupabaseRelational('servizi_officina', id, {
        titolo: updatedData.title,
        descrizione: updatedData.description,
        icona: updatedData.icon,
        tempo: updatedData.time,
        prezzo: updatedData.price
      });
      return true;
    }
    return false;
  }

  deleteOfficinaService(id) {
    if (!this.isAdminAuthenticated()) return false;
    this.officinaServices = this.officinaServices.filter(s => s.id !== id);
    this.saveToStorage('twc_officina', this.officinaServices);
    this.deleteSupabaseRelational('servizi_officina', id);
    return true;
  }

  // --- Assistenza Stradale Services CRUD ---
  addAssistenzaService(serviceData) {
    if (!this.isAdminAuthenticated()) return false;
    const newSvc = {
      id: "ast-" + Date.now().toString().slice(-6),
      ...serviceData
    };
    this.assistenzaServices.push(newSvc);
    this.saveToStorage('twc_assistenza', this.assistenzaServices);
    
    this.syncSupabaseRelational('servizi_assistenza', {
      id_locale: newSvc.id,
      titolo: serviceData.title,
      descrizione: serviceData.description,
      icona: serviceData.icon,
      tempo: serviceData.time
    });
    return newSvc;
  }

  updateAssistenzaService(id, updatedData) {
    if (!this.isAdminAuthenticated()) return false;
    const idx = this.assistenzaServices.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.assistenzaServices[idx] = { ...this.assistenzaServices[idx], ...updatedData };
      this.saveToStorage('twc_assistenza', this.assistenzaServices);
      
      this.updateSupabaseRelational('servizi_assistenza', id, {
        titolo: updatedData.title,
        descrizione: updatedData.description,
        icona: updatedData.icon,
        tempo: updatedData.time
      });
      return true;
    }
    return false;
  }

  deleteAssistenzaService(id) {
    if (!this.isAdminAuthenticated()) return false;
    this.assistenzaServices = this.assistenzaServices.filter(s => s.id !== id);
    this.saveToStorage('twc_assistenza', this.assistenzaServices);
    this.deleteSupabaseRelational('servizi_assistenza', id);
    return true;
  }

  // --- Site Config & Logo Binding ---
  async updateConfig(newConfig) {
    if (!this.isAdminAuthenticated()) return false;
    this.siteConfig = { ...this.siteConfig, ...newConfig };
    this.saveToStorage('twc_config', this.siteConfig);
    return true;
  }
}

const store = new AppStore();
