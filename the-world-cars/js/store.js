/* ==========================================================================
   THE WORLD CARS - Cloud Store Engine v3.0
   Database Relazionale Supabase con FK (clienti → richieste ← auto)
   ========================================================================== */

class AppStore {
  constructor() {
    this.cars = this.loadFromStorage('twc_cars', initialCars);
    this.officinaServices = this.loadFromStorage('twc_officina', initialOfficinaServices);
    this.assistenzaServices = this.loadFromStorage('twc_assistenza', initialAssistenzaServices);
    this.reviews = this.loadFromStorage('twc_reviews', initialReviews);
    this.requests = this.loadFromStorage('twc_requests', []);
    this.siteConfig = this.loadFromStorage('twc_config', initialSiteConfig);
    this.cloudSynced = false;
  }

  // ── LocalStorage helpers ──────────────────────────────────────────────
  loadFromStorage(key, defaultValue) {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) { return defaultValue; }
  }
  saveToStorage(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.error(e); }
  }

  // ── Supabase helpers (GET / POST / PATCH / DELETE) ────────────────────
  _headers() {
    const key = window.SUPABASE_ANON_KEY || this.siteConfig.supabaseKey;
    return { 'Content-Type': 'application/json', 'apikey': key, 'Authorization': `Bearer ${key}` };
  }
  _url() { return window.SUPABASE_URL || this.siteConfig.supabaseUrl; }
  _configured() { return !!(this._url() && (window.SUPABASE_ANON_KEY || this.siteConfig.supabaseKey)); }

  async _get(table, query = '') {
    if (!this._configured()) return null;
    const res = await fetch(`${this._url()}/rest/v1/${table}${query}`, { headers: this._headers() });
    return res.ok ? res.json() : null;
  }
  async _post(table, payload) {
    if (!this._configured()) return null;
    const res = await fetch(`${this._url()}/rest/v1/${table}`, {
      method: 'POST', headers: { ...this._headers(), 'Prefer': 'return=representation' },
      body: JSON.stringify(payload)
    });
    if (res.ok) { const d = await res.json(); return Array.isArray(d) ? d[0] : d; }
    const err = await res.text();
    console.error(`Supabase POST ${table}:`, err);
    alert(`❌ Errore salvataggio Cloud (${table}): ${err.substring(0, 120)}`);
    return null;
  }
  async _patch(table, filter, payload) {
    if (!this._configured()) return;
    await fetch(`${this._url()}/rest/v1/${table}?${filter}`, {
      method: 'PATCH', headers: this._headers(), body: JSON.stringify(payload)
    });
  }
  async _delete(table, filter) {
    if (!this._configured()) return;
    await fetch(`${this._url()}/rest/v1/${table}?${filter}`, {
      method: 'DELETE', headers: this._headers()
    });
  }

  // =====================================================================
  //  CLOUD SYNC — Scarica tutto da Supabase all'avvio
  // =====================================================================
  async initCloudSync() {
    if (!this._configured()) { console.log("Supabase non configurato."); return false; }
    try {
      console.log("☁️ Sync da Supabase...");

      // ── AUTO ──
      const dbCars = await this._get('auto', '?order=created_at.asc');
      if (dbCars) {
        this.cars = dbCars.map(c => ({
          id: c.id_locale,
          uuid: c.id,
          brand: c.marca,
          model: c.modello,
          category: c.categoria,
          gearbox: c.cambio,
          fuel: c.carburante,
          seats: c.posti,
          luggage: c.bagagli,
          image: c.immagine,
          priceDaily: c.prezzo_giorno,
          priceWeekly: c.prezzo_settimana,
          available: c.disponibile,
          description: c.descrizione
        }));
        this.saveToStorage('twc_cars', this.cars);
      }

      // ── RICHIESTE ──
      const dbReqs = await this._get('richieste', '?order=created_at.desc');
      if (dbReqs) {
        this.requests = dbReqs.map(r => ({
          id: r.id_locale,
          uuid: r.id,
          createdAt: new Date(r.created_at).toLocaleString('it-IT'),
          type: r.tipo,
          clientName: r.nome_cliente,
          phone: r.telefono,
          email: r.email,
          notes: r.messaggio,
          serviceName: r.nome_servizio,
          autoUuid: r.auto_id,
          startDate: r.data_inizio,
          endDate: r.data_fine,
          totalPrice: r.prezzo_stimato,
          location: r.posizione_gps,
          status: r.stato
        }));
        this.saveToStorage('twc_requests', this.requests);
      }

      // ── SERVIZI OFFICINA ──
      const dbOff = await this._get('servizi_officina');
      if (dbOff) {
        this.officinaServices = dbOff.map(s => ({
          id: s.id_locale, uuid: s.id,
          icon: s.icona, title: s.titolo, description: s.descrizione,
          time: s.tempo_stimato, price: s.prezzo
        }));
        this.saveToStorage('twc_officina', this.officinaServices);
      }

      // ── SERVIZI ASSISTENZA ──
      const dbAss = await this._get('servizi_assistenza');
      if (dbAss) {
        this.assistenzaServices = dbAss.map(s => ({
          id: s.id_locale, uuid: s.id,
          icon: s.icona, title: s.titolo, description: s.descrizione,
          time: s.tempo_stimato
        }));
        this.saveToStorage('twc_assistenza', this.assistenzaServices);
      }

      this.cloudSynced = true;
      console.log("✅ Sync Cloud completata!");
      return true;
    } catch (e) {
      console.error("Errore sync Cloud:", e);
      return false;
    }
  }

  // =====================================================================
  //  AUTH — SHA-256 password + sessione 15 min
  // =====================================================================
  async hashPassword(plainText) {
    const data = new TextEncoder().encode(plainText);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  async verifyAdminPassword(pw) {
    const hash = await this.hashPassword(pw.trim());
    const target = this.siteConfig.adminPasswordHash || "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";
    if (hash === target) {
      sessionStorage.setItem('twc_admin_session', JSON.stringify({ authenticated: true, expiresAt: Date.now() + 15*60*1000 }));
      return true;
    }
    return false;
  }
  isAdminAuthenticated() {
    try {
      const s = JSON.parse(sessionStorage.getItem('twc_admin_session'));
      return s && s.authenticated && s.expiresAt > Date.now();
    } catch { return false; }
  }
  refreshAdminSession() {
    if (this.isAdminAuthenticated())
      sessionStorage.setItem('twc_admin_session', JSON.stringify({ authenticated: true, expiresAt: Date.now() + 15*60*1000 }));
  }
  logoutAdmin() { sessionStorage.removeItem('twc_admin_session'); }

  // =====================================================================
  //  CAR AVAILABILITY — basata sulle richieste confermate
  // =====================================================================
  isCarAvailableForDates(carId, startDateStr, endDateStr) {
    if (!startDateStr || !endDateStr) return true;
    const car = this.cars.find(c => c.id === carId);
    if (!car) return true;
    const carTitle = `${car.brand} ${car.model}`.toLowerCase();
    const uStart = new Date(startDateStr), uEnd = new Date(endDateStr);
    return !this.requests.find(r => {
      if (r.type !== 'Noleggio') return false;
      const match = (r.carId === carId) || (r.serviceName && r.serviceName.toLowerCase() === carTitle);
      const active = ['Confermata','Approvato','In Corso'].includes(r.status);
      if (match && active && r.startDate && r.endDate) {
        return new Date(r.startDate) <= uEnd && new Date(r.endDate) >= uStart;
      }
      return false;
    });
  }
  isCarOccupiedToday(carId) {
    const t = new Date().toISOString().split('T')[0];
    return !this.isCarAvailableForDates(carId, t, t);
  }

  // =====================================================================
  //  NOTIFICATIONS — Telegram + Email (FormSubmit)
  // =====================================================================
  async sendEmailNotification(payload) {
    const targetEmail = this.siteConfig.email || 'info@theworldcars.it';
    try {
      await fetch('/api/email-notify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail, clientEmail: payload.email || payload.clientEmail, ...payload })
      });
    } catch (e) { console.log("Email fallback:", e); }
  }

  async sendTelegramNotification(payload) {
    let t = `🏎️ *Nuova richiesta THE WORLD CARS*\n\n`;
    t += `📋 *Servizio:* ${payload.type || 'Generale'}\n`;
    t += `👤 *Cliente:* ${payload.clientName || 'N/D'}\n`;
    t += `📞 *Tel:* ${payload.phone || 'N/D'}\n`;
    t += `✉️ *Email:* ${payload.email || '-'}\n`;
    if (payload.serviceName) t += `🚗 *Dettaglio:* ${payload.serviceName}\n`;
    if (payload.startDate) t += `📅 *Date:* ${payload.startDate}${payload.endDate ? ' ➜ '+payload.endDate : ''}\n`;
    if (payload.totalPrice) t += `💰 *Prezzo:* €${payload.totalPrice}\n`;
    if (payload.location) t += `📍 *GPS:* ${payload.location}\n`;
    if (payload.notes) t += `📝 *Note:* ${payload.notes}\n`;
    t += `\n⚙️ _Gestisci dal Pannello Admin_`;

    // Prova serverless, poi fallback diretto
    try {
      const r = await fetch('/api/notify', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      if (r.ok) { const d = await r.json(); if (d.success) return { success: true }; }
    } catch {}

    const token = this.siteConfig.telegramBotToken || "8743722064:AAEH5j4pZCfnXaG5KswNXaakA66-tiH5HXU";
    const chatId = this.siteConfig.telegramChatId || "573990897";
    if (token && chatId) {
      try {
        const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: t, parse_mode: 'Markdown' })
        });
        const d = await r.json();
        if (d.ok) return { success: true };
      } catch (e) { console.error("Telegram error:", e); }
    }
    return { success: false };
  }

  // =====================================================================
  //  RICHIESTE CRUD — con relazione FK verso clienti e auto
  // =====================================================================
  async createRequest(reqData) {
    const newReq = {
      id: "req-" + Date.now().toString().slice(-6),
      createdAt: new Date().toLocaleString('it-IT'),
      status: "Nuova",
      ...reqData
    };
    this.requests.unshift(newReq);
    this.saveToStorage('twc_requests', this.requests);

    // 1. Crea o trova il cliente nel DB relazionale
    let clienteId = null;
    if (this._configured()) {
      const existing = await this._get('clienti', `?telefono=eq.${encodeURIComponent(reqData.phone)}&limit=1`);
      if (existing && existing.length > 0) {
        clienteId = existing[0].id;
      } else {
        const newClient = await this._post('clienti', {
          nome: reqData.clientName, telefono: reqData.phone, email: reqData.email || null
        });
        if (newClient) clienteId = newClient.id;
      }
    }

    // 2. Trova l'UUID dell'auto se è un noleggio
    let autoId = null;
    if (reqData.type === 'Noleggio' && reqData.carId) {
      const car = this.cars.find(c => c.id === reqData.carId);
      if (car && car.uuid) autoId = car.uuid;
    }

    // 3. Trova l'UUID del servizio officina se è una richiesta officina
    let servizioOfficinaId = null;
    if (reqData.type === 'Officina' && reqData.serviceId) {
      const svc = this.officinaServices.find(s => s.id === reqData.serviceId);
      if (svc && svc.uuid) servizioOfficinaId = svc.uuid;
    }

    // 4. Trova l'UUID del servizio assistenza se è un soccorso stradale
    let servizioAssistenzaId = null;
    if ((reqData.type === 'Soccorso Stradale' || reqData.type === 'Assistenza') && reqData.serviceId) {
      const svc = this.assistenzaServices.find(s => s.id === reqData.serviceId);
      if (svc && svc.uuid) servizioAssistenzaId = svc.uuid;
    }

    // 5. Inserisci la richiesta relazionata con TUTTE le FK
    await this._post('richieste', {
      id_locale: newReq.id,
      tipo: reqData.type,
      cliente_id: clienteId,
      nome_cliente: reqData.clientName,
      telefono: reqData.phone,
      email: reqData.email || null,
      auto_id: autoId,
      servizio_officina_id: servizioOfficinaId,
      servizio_assistenza_id: servizioAssistenzaId,
      nome_servizio: reqData.serviceName || null,
      data_inizio: reqData.startDate || null,
      data_fine: reqData.endDate || null,
      prezzo_stimato: reqData.totalPrice || null,
      posizione_gps: reqData.location || null,
      messaggio: reqData.notes || null,
      stato: 'Nuova'
    });

    // 4. Notifiche multi-canale
    await this.sendTelegramNotification(newReq);
    this.sendEmailNotification(newReq);
    return newReq;
  }

  updateRequestStatus(id, newStatus) {
    if (!this.isAdminAuthenticated()) return false;
    const req = this.requests.find(r => r.id === id);
    if (!req) return false;

    req.status = newStatus;
    this.saveToStorage('twc_requests', this.requests);
    this._patch('richieste', `id_locale=eq.${id}`, { stato: newStatus });

    // Aggiorna disponibilità auto se è un noleggio
    if (req.type === 'Noleggio' && req.serviceName) {
      const car = this.cars.find(c => (c.brand+' '+c.model) === req.serviceName || c.id === req.carId);
      if (car) {
        if (newStatus === 'Confermata') {
          car.available = false;
        } else if (['Completata','Annullata','Nuova'].includes(newStatus)) {
          const otherActive = this.requests.some(o =>
            o.id !== id && o.type === 'Noleggio' &&
            (o.serviceName === req.serviceName || o.carId === car.id) &&
            o.status === 'Confermata'
          );
          if (!otherActive) car.available = true;
        }
        this.saveToStorage('twc_cars', this.cars);
        this._patch('auto', `id_locale=eq.${car.id}`, { disponibile: car.available });
      }
    }

    if (newStatus === 'Confermata') {
      this.sendEmailNotification({
        isConfirmation: true, clientName: req.clientName, clientEmail: req.email,
        phone: req.phone, type: req.type, serviceName: req.serviceName,
        startDate: req.startDate, endDate: req.endDate
      });
    }
    return true;
  }

  deleteRequest(id) {
    if (!this.isAdminAuthenticated()) return false;
    this.requests = this.requests.filter(r => r.id !== id);
    this.saveToStorage('twc_requests', this.requests);
    this._delete('richieste', `id_locale=eq.${id}`);
    return true;
  }

  // =====================================================================
  //  AUTO CRUD
  // =====================================================================
  addCar(carData) {
    if (!this.isAdminAuthenticated()) return false;
    const newCar = { id: "car-" + Date.now().toString().slice(-6), available: true, ...carData };
    this.cars.push(newCar);
    this.saveToStorage('twc_cars', this.cars);

    this._post('auto', {
      id_locale: newCar.id, marca: carData.brand, modello: carData.model,
      categoria: carData.category, cambio: carData.gearbox, carburante: carData.fuel,
      posti: carData.seats, bagagli: carData.luggage, immagine: carData.image,
      prezzo_giorno: carData.priceDaily, prezzo_settimana: carData.priceWeekly,
      disponibile: true, descrizione: carData.description || null
    }).then(result => {
      if (result) { newCar.uuid = result.id; this.saveToStorage('twc_cars', this.cars); }
    });
    return newCar;
  }

  updateCar(id, data) {
    if (!this.isAdminAuthenticated()) return false;
    const i = this.cars.findIndex(c => c.id === id);
    if (i === -1) return false;
    this.cars[i] = { ...this.cars[i], ...data };
    this.saveToStorage('twc_cars', this.cars);
    this._patch('auto', `id_locale=eq.${id}`, {
      marca: data.brand, modello: data.model, categoria: data.category,
      cambio: data.gearbox, carburante: data.fuel, posti: data.seats,
      bagagli: data.luggage, immagine: data.image,
      prezzo_giorno: data.priceDaily, prezzo_settimana: data.priceWeekly,
      descrizione: data.description
    });
    return true;
  }

  toggleCarAvailability(id) {
    if (!this.isAdminAuthenticated()) return false;
    const car = this.cars.find(c => c.id === id);
    if (!car) return false;
    car.available = !car.available;
    this.saveToStorage('twc_cars', this.cars);
    this._patch('auto', `id_locale=eq.${id}`, { disponibile: car.available });
    return car.available;
  }

  deleteCar(id) {
    if (!this.isAdminAuthenticated()) return false;
    this.cars = this.cars.filter(c => c.id !== id);
    this.saveToStorage('twc_cars', this.cars);
    this._delete('auto', `id_locale=eq.${id}`);
    return true;
  }

  // =====================================================================
  //  SERVIZI OFFICINA CRUD
  // =====================================================================
  addOfficinaService(d) {
    if (!this.isAdminAuthenticated()) return false;
    const s = { id: "off-" + Date.now().toString().slice(-6), ...d };
    this.officinaServices.push(s);
    this.saveToStorage('twc_officina', this.officinaServices);
    this._post('servizi_officina', {
      id_locale: s.id, icona: d.icon, titolo: d.title,
      descrizione: d.description, tempo_stimato: d.time, prezzo: d.price
    });
    return s;
  }
  updateOfficinaService(id, d) {
    if (!this.isAdminAuthenticated()) return false;
    const i = this.officinaServices.findIndex(s => s.id === id);
    if (i === -1) return false;
    this.officinaServices[i] = { ...this.officinaServices[i], ...d };
    this.saveToStorage('twc_officina', this.officinaServices);
    this._patch('servizi_officina', `id_locale=eq.${id}`, {
      icona: d.icon, titolo: d.title, descrizione: d.description,
      tempo_stimato: d.time, prezzo: d.price
    });
    return true;
  }
  deleteOfficinaService(id) {
    if (!this.isAdminAuthenticated()) return false;
    this.officinaServices = this.officinaServices.filter(s => s.id !== id);
    this.saveToStorage('twc_officina', this.officinaServices);
    this._delete('servizi_officina', `id_locale=eq.${id}`);
    return true;
  }

  // =====================================================================
  //  SERVIZI ASSISTENZA CRUD
  // =====================================================================
  addAssistenzaService(d) {
    if (!this.isAdminAuthenticated()) return false;
    const s = { id: "ast-" + Date.now().toString().slice(-6), ...d };
    this.assistenzaServices.push(s);
    this.saveToStorage('twc_assistenza', this.assistenzaServices);
    this._post('servizi_assistenza', {
      id_locale: s.id, icona: d.icon, titolo: d.title,
      descrizione: d.description, tempo_stimato: d.time
    });
    return s;
  }
  updateAssistenzaService(id, d) {
    if (!this.isAdminAuthenticated()) return false;
    const i = this.assistenzaServices.findIndex(s => s.id === id);
    if (i === -1) return false;
    this.assistenzaServices[i] = { ...this.assistenzaServices[i], ...d };
    this.saveToStorage('twc_assistenza', this.assistenzaServices);
    this._patch('servizi_assistenza', `id_locale=eq.${id}`, {
      icona: d.icon, titolo: d.title, descrizione: d.description,
      tempo_stimato: d.time
    });
    return true;
  }
  deleteAssistenzaService(id) {
    if (!this.isAdminAuthenticated()) return false;
    this.assistenzaServices = this.assistenzaServices.filter(s => s.id !== id);
    this.saveToStorage('twc_assistenza', this.assistenzaServices);
    this._delete('servizi_assistenza', `id_locale=eq.${id}`);
    return true;
  }

  // =====================================================================
  //  CONFIG
  // =====================================================================
  async updateConfig(newConfig) {
    if (!this.isAdminAuthenticated()) return false;
    this.siteConfig = { ...this.siteConfig, ...newConfig };
    this.saveToStorage('twc_config', this.siteConfig);
    return true;
  }
}

const store = new AppStore();
