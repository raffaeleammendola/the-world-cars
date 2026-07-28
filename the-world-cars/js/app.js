/* ==========================================================================
   THE WORLD CARS - Main UI Engine (v2.5)
   Features: Dynamic Fleet Counter, Security CSP & Multi-Channel Dispatcher
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  initNavigation();
  // Attendi il download dei dati reali dal Cloud Supabase (inclusa la configurazione admin)
  await store.initCloudSync();
  
  // Applica la configurazione (numeri WhatsApp, conteggio auto, ecc.) SOLO DOPO averla scaricata dal cloud
  applySiteConfigToUI();
  
  renderCarsGrid();
  renderOfficinaGrid();
  renderAssistenzaGrid();
  renderReviewsGrid();
  initModals();
  initForms();
  initKeyboardShortcut();
  
  // Gestione chiusura Modali tramite Swipe/Back button (uso hash)
  window.addEventListener('hashchange', () => {
    if (location.hash !== '#modal') {
      document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
      document.body.style.overflow = 'auto';
    }
  });
});

// Funzione globale per formattare date YYYY-MM-DD in DD/MM/YYYY
window.formatDateIT = function(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateStr;
};

// Toast notification helper
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : '🚨'}</span>
    <div>${message}</div>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// Navigation & Mobile Drawer
function initNavigation() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }
}

// Secret Keyboard Shortcut (Ctrl + Shift + A) for Admin Login
function initKeyboardShortcut() {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      if (typeof openAdminModal === 'function') openAdminModal();
    }
  });
}

// Dynamic Site Configuration & Dynamic Fleet Counter Binder
window.applySiteConfigToUI = function() {
  const config = store.siteConfig;
  const waNum = config.whatsappNumber || "393339988776";

  const floatBtn = document.getElementById('whatsapp-float-btn');
  if (floatBtn) {
    const text = encodeURIComponent("Ciao THE WORLD CARS! Desidero informazioni sui vostri servizi.");
    floatBtn.href = `https://wa.me/${waNum}?text=${text}`;
  }

  document.querySelectorAll('.ui-phone').forEach(el => el.textContent = config.phone);
  document.querySelectorAll('.ui-emergency-phone').forEach(el => el.textContent = config.emergencyPhone);
  document.querySelectorAll('.ui-email').forEach(el => el.textContent = config.email);
  document.querySelectorAll('.ui-address').forEach(el => {
    el.innerHTML = `<strong>${config.companyName || 'The World Cars'}</strong><br>${config.address || 'Corso Resina, 314/D, 80056 Ercolano NA'}`;
  });

  // Dynamic Fleet Counter in Hero
  const heroFleetCount = document.getElementById('hero-cars-count');
  if (heroFleetCount) {
    heroFleetCount.textContent = store.cars ? store.cars.length : 0;
  }

  document.querySelectorAll('.brand-icon').forEach(el => {
    if (config.logoImageUrl && config.logoImageUrl.trim() !== '') {
      el.innerHTML = `<img src="${config.logoImageUrl}" alt="Logo" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
      el.textContent = config.logoIcon || '🏎️';
    }
  });

  // Dynamic Categories rendering
  const cats = (config.carCategories || "Sportive, SUV, Berline, City Car, Scooter, Furgoni").split(',').map(c => c.trim()).filter(c => c);
  
  // Update Home Filters
  const filtersContainer = document.getElementById('filters-container');
  if (filtersContainer) {
    let html = `<button class="filter-btn active" onclick="filterCategory('all', this)">Tutte le Vetture</button>`;
    cats.forEach(c => {
      html += `<button class="filter-btn" onclick="filterCategory('${c}', this)">${c}</button>`;
    });
    filtersContainer.innerHTML = html;
  }

  // Update Admin Add/Edit Car Dropdown
  const addCarSelect = document.getElementById('addcar-category-select');
  if (addCarSelect) {
    addCarSelect.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
  }
  const editCarSelect = document.getElementById('editcar-category-select');
  if (editCarSelect) {
    editCarSelect.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
  }
};

// Render Cars Fleet Grid with Occupied Today Status
let selectedCategory = 'all';
let searchQuery = '';

window.renderCarsGrid = function() {
  const container = document.getElementById('cars-grid-container');
  
  // Update Hero Fleet Count dynamically
  const heroFleetCount = document.getElementById('hero-cars-count');
  if (heroFleetCount) {
    heroFleetCount.textContent = store.cars ? store.cars.length : 0;
  }

  if (!container) return;

  const filtered = store.cars.filter(car => {
    const matchCategory = selectedCategory === 'all' || car.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch = car.brand.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        car.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <p style="font-size: 1.2rem;">Nessun veicolo trovato per i filtri selezionati.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(car => {
    const isOccupiedToday = store.isCarOccupiedToday(car.id) || !car.available;
    return `
      <div class="glass-card car-card">
        <div class="car-image-box">
          <img src="${car.image}" alt="${car.brand} ${car.model}" loading="lazy">
          <div class="badge-availability ${isOccupiedToday ? 'badge-rented' : 'badge-available'}">
            ${isOccupiedToday ? '● Occupata Oggi' : '● Disponibile'}
          </div>
        </div>
        <div class="car-details">
          <div class="car-header">
            <span class="car-brand">${car.brand}</span>
            <h3 class="car-model">${car.model}</h3>
          </div>
          <div class="car-specs-grid">
            <div class="spec-item">⚙️ ${car.gearbox}</div>
            <div class="spec-item">⛽ ${car.fuel}</div>
            <div class="spec-item">👥 ${car.seats} Posti</div>
            ${car.ac ? '<div class="spec-item">❄️ AC</div>' : ''}
            ${car.cv ? `<div class="spec-item">🐎 ${car.cv} CV</div>` : ''}
          </div>
          <div class="car-pricing">
            <div class="price-daily">
              <span>€${car.priceDaily}</span> /giorno
            </div>
            <div class="price-weekly">
              €${car.priceWeekly} /settimana
            </div>
          </div>
          <button class="btn btn-primary" style="width: 100%;" onclick="openCarModal('${car.id}')">
            Prenota Ora ➔
          </button>
        </div>
      </div>
    `;
  }).join('');
};

window.filterCategory = function(cat, btn) {
  selectedCategory = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderCarsGrid();
};

window.handleCarSearch = function(val) {
  searchQuery = val;
  renderCarsGrid();
};

// Open Car Modal with Red Date Collision Lock
window.openCarModal = function(carId) {
  const car = store.cars.find(c => c.id === carId);
  if (!car) return;

  const modal = document.getElementById('car-modal');
  const modalContent = document.getElementById('car-modal-content');

  const images = [car.image, car.image2, car.image3].filter(img => img && img.trim() !== '');
  let imagesHTML = `<img src="${car.image}" alt="${car.brand} ${car.model}" style="width: 100%; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">`;
  
  if (images.length > 1) {
    imagesHTML = `
      <div class="car-carousel-container" id="car-carousel-${car.id}">
        <div class="car-carousel-track" id="carousel-track-${car.id}">
          ${images.map(img => `<img src="${img}" alt="${car.brand} ${car.model}">`).join('')}
        </div>
        <button type="button" class="car-carousel-btn prev" onclick="moveCarousel('${car.id}', -1)">❮</button>
        <button type="button" class="car-carousel-btn next" onclick="moveCarousel('${car.id}', 1)">❯</button>
        <div class="car-carousel-dots">
          ${images.map((_, i) => `<div class="car-carousel-dot ${i === 0 ? 'active' : ''}" id="dot-${car.id}-${i}" onclick="goToCarousel('${car.id}', ${i})"></div>`).join('')}
        </div>
      </div>
    `;
    
    // Inizializza lo stato in JS direttamente, non tramite tag <script> in innerHTML (che viene bloccato dal DOM)
    window.carCarousels = window.carCarousels || {};
    window.carCarousels[car.id] = { current: 0, total: images.length };
  }

  modalContent.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
      <div>
        ${imagesHTML}
        <h2 class="heading-md" style="margin-top: 1rem;">${car.brand} ${car.model}</h2>
        <p style="color: var(--accent-cyan); font-weight: 700; margin-bottom: 0.5rem;">${car.category}</p>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1.5rem;">${car.description || 'Veicolo sanificato ed in perfette condizioni meccaniche.'}</p>
        
        <div class="car-specs-grid" style="font-size: 0.95rem;">
          <div class="spec-item">⚙️ Cambio: <strong>${car.gearbox}</strong></div>
          <div class="spec-item">⛽ Motore: <strong>${car.fuel}</strong></div>
          <div class="spec-item">👥 Posti: <strong>${car.seats}</strong></div>
          <div class="spec-item">🧳 Bagagli: <strong>${car.luggage}</strong></div>
          ${car.ac ? '<div class="spec-item">❄️ AC: <strong>Sì</strong></div>' : ''}
          ${car.cv ? `<div class="spec-item">🐎 CV: <strong>${car.cv}</strong></div>` : ''}
        </div>

        <div style="background: rgba(0,102,255,0.1); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glow); margin-top: 1rem;">
          <p style="font-size: 0.9rem; color: var(--text-secondary);">Tariffa giornaliera: <strong style="color: var(--accent-cyan);">€${car.priceDaily}</strong></p>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">Tariffa settimanale: <strong style="color: var(--accent-cyan);">€${car.priceWeekly}</strong></p>
        </div>
      </div>

      <div>
        <h3 class="heading-sm" style="margin-bottom: 1rem;">Richiesta Noleggio</h3>
        <form id="car-booking-form">
          <input type="text" name="website_hp" style="display:none" tabindex="-1" autocomplete="off">

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Data Inizio *</label>
              <input type="date" class="form-control" name="startDate" id="modal-start-date" required>
            </div>
            <div class="form-group">
              <label class="form-label">Data Fine *</label>
              <input type="date" class="form-control" name="endDate" id="modal-end-date" required>
            </div>
          </div>

          <!-- Red Date Collision Alert Banner -->
          <div id="booking-collision-alert" style="display: none; padding: 1rem; background: rgba(239,68,68,0.2); border: 2px solid #EF4444; border-radius: var(--radius-md); margin-bottom: 1rem; font-size: 0.9rem; color: #FFD1D1; font-weight: 700;">
            🔴 AUTO OCCUPATA NELLE DATE SELEZIONATE!<br>
            <span style="font-size: 0.8rem; font-weight: 400; color: #FFF;">Questa vettura è già stata confermata per un altro cliente in questo periodo. Scegli altre date.</span>
          </div>

          <div id="booking-cost-calc" style="display: none; padding: 0.75rem; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: var(--radius-sm); margin-bottom: 1rem; font-size: 0.9rem; color: #10B981;">
            Preventivo Stimato (<span id="calc-days">0</span> giorni): <strong style="font-size: 1.1rem; color: #FFF;" id="calc-price">€0</strong>
          </div>

          <div class="form-group">
            <label class="form-label">Nome e Cognome *</label>
            <input type="text" class="form-control" name="clientName" id="modal-client-name" placeholder="Es. Mario Rossi" required>
          </div>

          <div class="form-group">
            <label class="form-label">Telefono / WhatsApp *</label>
            <input type="tel" class="form-control" name="phone" id="modal-client-phone" placeholder="Es. +39 333 1234567" required>
          </div>

          <div class="form-group">
            <label class="form-label">Email (Facoltativa)</label>
            <input type="email" class="form-control" name="email" placeholder="mario@example.com">
          </div>

          <div class="form-group">
            <label class="form-label">Messaggio / Note</label>
            <textarea class="form-control" name="notes" id="modal-client-notes" placeholder="Orario di ritiro, esigenze particolari..."></textarea>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.8rem; margin-top: 1.5rem;">
            <button type="submit" id="btn-submit-booking" class="btn btn-primary" style="width: 100%;">
              Conferma Prenotazione
            </button>
            <button type="button" id="btn-submit-wa" class="btn btn-whatsapp" style="width: 100%;" onclick="sendCarWhatsAppEnhanced('${car.brand} ${car.model}', ${car.priceDaily}, ${car.priceWeekly})">
              Prenota su WhatsApp
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  const startDateInput = document.getElementById('modal-start-date');
  const endDateInput = document.getElementById('modal-end-date');
  const costBox = document.getElementById('booking-cost-calc');
  const alertBox = document.getElementById('booking-collision-alert');
  const submitBtn = document.getElementById('btn-submit-booking');
  const waBtn = document.getElementById('btn-submit-wa');
  const calcDaysSpan = document.getElementById('calc-days');
  const calcPriceSpan = document.getElementById('calc-price');

  const today = new Date().toISOString().split('T')[0];
  startDateInput.min = today;
  endDateInput.min = today;

  function validateAndCalculate() {
    if (!startDateInput.value || !endDateInput.value) {
      costBox.style.display = 'none';
      alertBox.style.display = 'none';
      submitBtn.disabled = false;
      waBtn.disabled = false;
      startDateInput.style.borderColor = 'var(--border-glass)';
      endDateInput.style.borderColor = 'var(--border-glass)';
      return;
    }

    if (endDateInput.value < startDateInput.value) {
      endDateInput.value = startDateInput.value;
      showToast("La data di fine è stata adeguata alla data di inizio.", "emergency");
    }

    // Real-Time Collision Check against confirmed bookings
    const isFree = store.isCarAvailableForDates(car.id, startDateInput.value, endDateInput.value);

    if (!isFree) {
      alertBox.style.display = 'block';
      costBox.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.4';
      waBtn.disabled = true;
      waBtn.style.opacity = '0.4';
      startDateInput.style.borderColor = '#EF4444';
      startDateInput.style.background = 'rgba(239,68,68,0.1)';
      endDateInput.style.borderColor = '#EF4444';
      endDateInput.style.background = 'rgba(239,68,68,0.1)';
      return;
    } else {
      alertBox.style.display = 'none';
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      waBtn.disabled = false;
      waBtn.style.opacity = '1';
      startDateInput.style.borderColor = 'var(--border-glass)';
      startDateInput.style.background = 'rgba(255,255,255,0.05)';
      endDateInput.style.borderColor = 'var(--border-glass)';
      endDateInput.style.background = 'rgba(255,255,255,0.05)';
    }

    const d1 = new Date(startDateInput.value);
    const d2 = new Date(endDateInput.value);
    const diffTime = d2 - d1;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (days > 0) {
      let total = 0;
      if (days >= 7) {
        total = (Math.floor(days / 7) * car.priceWeekly) + ((days % 7) * car.priceDaily);
      } else {
        total = days * car.priceDaily;
      }
      calcDaysSpan.textContent = days;
      calcPriceSpan.textContent = `€ ${total}`;
      costBox.style.display = 'block';
    } else {
      costBox.style.display = 'none';
    }
  }

  startDateInput.addEventListener('change', validateAndCalculate);
  endDateInput.addEventListener('change', validateAndCalculate);

  // Form Submit Handler
  const form = document.getElementById('car-booking-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    if (formData.get('website_hp')) return;

    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate');

    if (!store.isCarAvailableForDates(car.id, startDate, endDate)) {
      showToast("Vettura già occupata nelle date selezionate!", "emergency");
      return;
    }

    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    const days = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
    let estimatedTotal = days >= 7 ? Math.floor(days/7)*car.priceWeekly + (days%7)*car.priceDaily : days * car.priceDaily;

    const reqObj = {
      type: "Noleggio",
      carId: car.id,
      serviceName: `${car.brand} ${car.model}`,
      clientName: formData.get('clientName'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      startDate: startDate,
      endDate: endDate,
      totalPrice: estimatedTotal,
      notes: formData.get('notes')
    };

    // Apri WhatsApp PRIMA dell'await (il browser blocca window.open dopo operazioni async)
    const waNum = store.siteConfig.whatsappNumber || "393339988776";
    const waMsg = `🏎️ *NUOVA PRENOTAZIONE NOLEGGIO*\n\n👤 ${reqObj.clientName}\n📞 ${reqObj.phone}\n🚗 ${reqObj.serviceName}\n📅 ${reqObj.startDate} ➜ ${reqObj.endDate}\n💰 €${reqObj.totalPrice}\n${reqObj.notes ? '📝 ' + reqObj.notes : ''}`;
    window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`, '_blank');

    await store.createRequest(reqObj);
    showToast("Prenotazione inviata con successo!");
    closeModal('car-modal');
  });

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  location.hash = 'modal';
};

// WhatsApp Rental Deep Link Builder with Dynamic Email Trigger
window.sendCarWhatsAppEnhanced = function(carTitle, priceDaily, priceWeekly) {
  const startDate = document.getElementById('modal-start-date')?.value || "Da definire";
  const endDate = document.getElementById('modal-end-date')?.value || "Da definire";
  const clientName = document.getElementById('modal-client-name')?.value || "Cliente";
  const notes = document.getElementById('modal-client-notes')?.value || "";
  const phone = document.getElementById('modal-client-phone')?.value || "";
  const waNum = store.siteConfig.whatsappNumber || "393339988776";

  let msg = `🏎️ *RICHIESTA NOLEGGIO THE WORLD CARS*\n\n`;
  msg += `👤 *Nome:* ${clientName}\n`;
  msg += `📞 *Telefono:* ${phone}\n`;
  msg += `🚗 *Vettura:* ${carTitle}\n`;
  msg += `📅 *Periodo:* dal ${startDate} al ${endDate}\n`;
  if (notes) msg += `📝 *Note:* ${notes}\n`;
  msg += `\nDesidero ricevere conferma della disponibilità.`;

  store.createRequest({
    type: 'Noleggio (via WhatsApp)',
    clientName,
    phone,
    serviceName: carTitle,
    startDate,
    endDate,
    notes
  });

  window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
};

// Render Officina Services
window.renderOfficinaGrid = function() {
  const container = document.getElementById('officina-grid-container');
  if (!container) return;

  container.innerHTML = store.officinaServices.map(s => `
    <div class="glass-card service-card">
      <div class="service-icon-box">${s.icon}</div>
      <h3>${s.title}</h3>
      <p>${s.description}</p>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; font-size: 0.85rem; color: var(--text-muted);">
        <span>⏱️ Tempo: ${s.time}</span>
        <span style="color: var(--accent-cyan); font-weight: 700;">${s.price}</span>
      </div>
      <button class="btn btn-secondary" style="width: 100%; border-color: var(--accent-blue);" onclick="openOfficinaModal('${s.title}')">
        Prenota Intervento
      </button>
    </div>
  `).join('');
};

window.openOfficinaModal = function(serviceTitle = '') {
  const modal = document.getElementById('officina-modal');
  const serviceSelect = document.getElementById('officina-service-select');
  if (serviceSelect && serviceTitle) {
    serviceSelect.value = serviceTitle;
  }
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  location.hash = 'modal';
};

// Render Assistenza Stradale H24
window.renderAssistenzaGrid = function() {
  const container = document.getElementById('assistenza-grid-container');
  if (!container) return;

  container.innerHTML = store.assistenzaServices.map(s => `
    <div class="glass-card service-card" style="border-top: 3px solid var(--status-rented); cursor: pointer;" onclick="scrollToEmergencyForm('${s.title}')">
      <div class="service-icon-box" style="background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.4); color: #EF4444;">${s.icon}</div>
      <h3>${s.title}</h3>
      <p>${s.description}</p>
      <div style="margin-top: 1rem; color: #EF4444; font-size: 0.85rem; font-weight: bold; text-align: center;">
        👇 Compila il modulo in basso per richiedere
      </div>
    </div>
  `).join('');
};

window.scrollToEmergencyForm = function(serviceTitle) {
  const emergencyForm = document.getElementById('emergency-form');
  if (emergencyForm) {
    emergencyForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const select = emergencyForm.querySelector('select[name="serviceType"]');
    if (select && serviceTitle) {
      select.value = serviceTitle;
    }
    showToast("Compila il modulo per richiedere: " + serviceTitle);
  }
};

// Multi-Channel Emergency Roadside Dispatcher (Triggers WhatsApp + Telegram + Gmail + Form Scroll)
window.requestEmergencyWhatsAppEnhanced = function(serviceName = 'Soccorso Generico Immediato') {
  const emergencyForm = document.getElementById('emergency-form');
  
  if (emergencyForm) {
    emergencyForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const select = emergencyForm.querySelector('select[name="serviceType"]');
    if (select && serviceName) select.value = serviceName;
  }

  const waNum = store.siteConfig.whatsappNumber || "393339988776";
  const msg = `🚨 *RICHIESTA ASSISTENZA STRADALE H24 URGENTE*\n\nServizio: ${serviceName}\nRichiedo intervento immediato sul posto!`;

  store.createRequest({
    type: "Assistenza H24 (via WhatsApp)",
    serviceName: serviceName,
    clientName: "Cliente Emergenza",
    phone: "WhatsApp Contact",
    notes: "Intervento urgente richiesto via WhatsApp"
  });

  window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
};

// Render Reviews Grid
function renderReviewsGrid() {
  const container = document.getElementById('reviews-grid-container');
  if (!container) return;

  container.innerHTML = store.reviews.map(r => `
    <div class="glass-card" style="padding: 1.75rem;">
      <div style="color: #F59E0B; font-size: 1.1rem; margin-bottom: 0.5rem;">
        ${'★'.repeat(r.rating)}
      </div>
      <p style="color: var(--text-secondary); font-size: 0.95rem; font-style: italic; margin-bottom: 1.25rem;">
        "${r.comment}"
      </p>
      <div>
        <strong style="font-family: var(--font-heading); color: var(--text-main); font-size: 1rem;">${r.name}</strong>
        <p style="font-size: 0.8rem; color: var(--accent-cyan);">${r.car}</p>
      </div>
    </div>
  `).join('');
}

// Modal Helpers
function initModals() {
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-backdrop');
      if (modal && modal.classList.contains('active')) {
        closeModal(modal.id);
      }
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop && backdrop.classList.contains('active')) {
        closeModal(backdrop.id);
      }
    });
  });
}

window.closeModal = function(modalId) {
  if (location.hash === '#modal') {
    history.back(); // Togliendo l'hash, triggera hashchange che chiude tutto
  } else {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
};

// Forms Initializer
function initForms() {
  const officinaForm = document.getElementById('officina-booking-form');
  if (officinaForm) {
    officinaForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(officinaForm);
      if (formData.get('website_hp')) return;

      const reqObj = {
        type: "Officina",
        serviceName: formData.get('serviceName'),
        clientName: formData.get('clientName'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        startDate: formData.get('date'),
        vehicle: formData.get('vehicle'),
        notes: formData.get('notes')
      };

      // WhatsApp PRIMA dell'await (anti-popup-block)
      const waNum = store.siteConfig.whatsappNumber || "393339988776";
      const waMsg = `🔧 *NUOVA PRENOTAZIONE OFFICINA*\n\n👤 ${reqObj.clientName}\n📞 ${reqObj.phone}\n🛠️ ${reqObj.serviceName}\n📅 ${reqObj.startDate || 'Da definire'}\n${reqObj.notes ? '📝 ' + reqObj.notes : ''}`;
      window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`, '_blank');

      await store.createRequest(reqObj);
      showToast("Prenotazione Officina inviata con successo!");
      closeModal('officina-modal');
      officinaForm.reset();
    });
  }

  const emergencyForm = document.getElementById('emergency-form');
  if (emergencyForm) {
    emergencyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(emergencyForm);
      if (formData.get('website_hp')) return;

      const reqObj = {
        type: "Assistenza H24",
        serviceName: formData.get('serviceType'),
        clientName: formData.get('clientName'),
        phone: formData.get('phone'),
        location: formData.get('location')
      };

      // WhatsApp PRIMA dell'await (anti-popup-block)
      const waNum = store.siteConfig.whatsappNumber || "393339988776";
      const msg = `🚨 *RICHIESTA SOCCORSO STRADALE H24*\n\n👤 Nome: ${formData.get('clientName')}\n📞 Tel: ${formData.get('phone')}\n📍 GPS/Posizione: ${formData.get('location')}\n🛠️ Problema: ${formData.get('serviceType')}\n\nSalve, ho questo problema..`;
      window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');

      await store.createRequest(reqObj);
      showToast("Segnalazione urgente inviata!", "emergency");
      emergencyForm.reset();
    });
  }

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      if (formData.get('website_hp')) return;

      const reqObj = {
        type: "Contatto",
        clientName: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        notes: formData.get('message')
      };

      // WhatsApp PRIMA dell'await (anti-popup-block)
      const waNum = store.siteConfig.whatsappNumber || "393339988776";
      const waMsg = `📩 *NUOVO MESSAGGIO CONTATTO*\n\n👤 ${reqObj.clientName}\n📞 ${reqObj.phone}\n✉️ ${reqObj.email || 'N/D'}\n📝 ${reqObj.notes || ''}`;
      window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`, '_blank');

      await store.createRequest(reqObj);
      showToast("Messaggio inviato con successo!");
      contactForm.reset();
    });
  }
}

// --- CAROUSEL LOGIC ---
window.moveCarousel = function(carId, dir) {
  const carousel = window.carCarousels[carId];
  if (!carousel) return;
  carousel.current += dir;
  if (carousel.current >= carousel.total) carousel.current = 0;
  if (carousel.current < 0) carousel.current = carousel.total - 1;
  goToCarousel(carId, carousel.current);
};

window.goToCarousel = function(carId, index) {
  const carousel = window.carCarousels[carId];
  if (!carousel) return;
  carousel.current = index;
  const track = document.getElementById('carousel-track-' + carId);
  if (track) track.style.transform = 'translateX(-' + (index * 100) + '%)';
  for (let i = 0; i < carousel.total; i++) {
    const dot = document.getElementById('dot-' + carId + '-' + i);
    if (dot) {
      if (i === index) dot.classList.add('active');
      else dot.classList.remove('active');
    }
  }
};
