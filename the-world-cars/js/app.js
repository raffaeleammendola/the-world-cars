/* ==========================================================================
   THE WORLD CARS - Main Application UI Logic & Interactive Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  renderCarsGrid();
  renderOfficinaGrid();
  renderAssistenzaGrid();
  renderReviewsGrid();
  initModals();
  initForms();
  updateWhatsAppLinks();
});

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
  }, 4000);
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

// Update WhatsApp Floating Action Link
function updateWhatsAppLinks() {
  const waNum = store.siteConfig.whatsappNumber;
  const floatBtn = document.getElementById('whatsapp-float-btn');
  if (floatBtn) {
    const text = encodeURIComponent("Ciao THE WORLD CARS! Desidero ricevere informazioni sui vostri servizi di noleggio, officina ed assistenza.");
    floatBtn.href = `https://wa.me/${waNum}?text=${text}`;
  }
}

// Render Cars Fleet Grid
let selectedCategory = 'all';
let searchQuery = '';

function renderCarsGrid() {
  const container = document.getElementById('cars-grid-container');
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

  container.innerHTML = filtered.map(car => `
    <div class="glass-card car-card">
      <div class="car-image-box">
        <img src="${car.image}" alt="${car.brand} ${car.model}" loading="lazy">
        <div class="badge-availability ${car.available ? 'badge-available' : 'badge-rented'}">
          ${car.available ? '● Disponibile' : '● Occupata'}
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
          <div class="spec-item">🧳 ${car.luggage}</div>
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
  `).join('');
}

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

// Open Car Modal & Interactive Calculator
window.openCarModal = function(carId) {
  const car = store.cars.find(c => c.id === carId);
  if (!car) return;

  const modal = document.getElementById('car-modal');
  const modalContent = document.getElementById('car-modal-content');

  modalContent.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
      <div>
        <img src="${car.image}" alt="${car.brand} ${car.model}" style="width: 100%; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
        <h2 class="heading-md" style="margin-top: 1rem;">${car.brand} ${car.model}</h2>
        <p style="color: var(--accent-cyan); font-weight: 700; margin-bottom: 0.5rem;">${car.category}</p>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1.5rem;">${car.description || 'Veicolo sanificato ed in perfette condizioni meccaniche.'}</p>
        
        <div class="car-specs-grid" style="font-size: 0.95rem;">
          <div class="spec-item">⚙️ Cambio: <strong>${car.gearbox}</strong></div>
          <div class="spec-item">⛽ Motore: <strong>${car.fuel}</strong></div>
          <div class="spec-item">👥 Posti: <strong>${car.seats}</strong></div>
          <div class="spec-item">🧳 Bagagli: <strong>${car.luggage}</strong></div>
        </div>

        <div style="background: rgba(0,102,255,0.1); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glow); margin-top: 1rem;">
          <p style="font-size: 0.9rem; color: var(--text-secondary);">Tariffa giornaliera: <strong style="color: var(--accent-cyan);">€${car.priceDaily}</strong></p>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">Tariffa settimanale: <strong style="color: var(--accent-cyan);">€${car.priceWeekly}</strong></p>
        </div>
      </div>

      <div>
        <h3 class="heading-sm" style="margin-bottom: 1rem;">Richiesta Noleggio</h3>
        <form id="car-booking-form">
          <!-- Anti-Spam Honeypot -->
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
            <button type="submit" class="btn btn-primary" style="width: 100%;">
              💾 Invia Richiesta (Database Cloud + Alert Telegram)
            </button>
            <button type="button" class="btn btn-whatsapp" style="width: 100%;" onclick="sendCarWhatsAppEnhanced('${car.brand} ${car.model}', ${car.priceDaily}, ${car.priceWeekly})">
              📱 Invia Direttamente su WhatsApp
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Dynamic Date & Cost Calculator
  const startDateInput = document.getElementById('modal-start-date');
  const endDateInput = document.getElementById('modal-end-date');
  const costBox = document.getElementById('booking-cost-calc');
  const calcDaysSpan = document.getElementById('calc-days');
  const calcPriceSpan = document.getElementById('calc-price');

  const today = new Date().toISOString().split('T')[0];
  startDateInput.min = today;
  endDateInput.min = today;

  function calculateEstimate() {
    if (startDateInput.value && endDateInput.value) {
      const d1 = new Date(startDateInput.value);
      const d2 = new Date(endDateInput.value);
      const diffTime = d2 - d1;
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

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
        return total;
      }
    }
    costBox.style.display = 'none';
    return 0;
  }

  startDateInput.addEventListener('change', calculateEstimate);
  endDateInput.addEventListener('change', calculateEstimate);

  // Form Submit Handler
  const form = document.getElementById('car-booking-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    // Anti-Spam Check
    if (formData.get('website_hp')) return;

    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate');
    const estimatedTotal = calculateEstimate();

    const reqObj = {
      type: "Noleggio",
      serviceName: `${car.brand} ${car.model}`,
      clientName: formData.get('clientName'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      startDate: startDate,
      endDate: endDate,
      totalPrice: estimatedTotal,
      notes: formData.get('notes')
    };

    await store.createRequest(reqObj);
    showToast("Richiesta noleggio inviata con successo! Dati salvati su Cloud Database.");
    closeModal('car-modal');
  });

  modal.classList.add('active');
};

// Enhanced WhatsApp Message Builder for Car Rental
window.sendCarWhatsAppEnhanced = function(carTitle, priceDaily, priceWeekly) {
  const startDate = document.getElementById('modal-start-date')?.value || "Da definire";
  const endDate = document.getElementById('modal-end-date')?.value || "Da definire";
  const clientName = document.getElementById('modal-client-name')?.value || "Cliente";
  const notes = document.getElementById('modal-client-notes')?.value || "Nessuna nota aggiuntiva";
  const waNum = store.siteConfig.whatsappNumber;

  let msg = `🏎️ *RICHIESTA NOLEGGIO THE WORLD CARS*\n\n`;
  msg += `👤 *Nome:* ${clientName}\n`;
  msg += `🚗 *Vettura Scelta:* ${carTitle}\n`;
  msg += `📅 *Periodo:* dal ${startDate} al ${endDate}\n`;
  if (notes && notes !== "Nessuna nota aggiuntiva") msg += `📝 *Note:* ${notes}\n`;
  msg += `\nDesidero ricevere conferma della disponibilità ed istruzioni per il ritiro.`;

  window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
};

// Render Officina Services
function renderOfficinaGrid() {
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
}

window.openOfficinaModal = function(serviceTitle = '') {
  const modal = document.getElementById('officina-modal');
  const serviceSelect = document.getElementById('officina-service-select');
  if (serviceSelect && serviceTitle) {
    serviceSelect.value = serviceTitle;
  }
  modal.classList.add('active');
};

// Render Assistenza Stradale H24
function renderAssistenzaGrid() {
  const container = document.getElementById('assistenza-grid-container');
  if (!container) return;

  container.innerHTML = store.assistenzaServices.map(s => `
    <div class="glass-card service-card" style="border-top: 3px solid var(--status-rented);">
      <div class="service-icon-box" style="background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.4); color: #EF4444;">${s.icon}</div>
      <h3>${s.title}</h3>
      <p>${s.description}</p>
      <button class="btn btn-whatsapp" style="width: 100%; font-size: 0.85rem;" onclick="requestEmergencyWhatsAppEnhanced('${s.title}')">
        🚨 Richiedi su WhatsApp
      </button>
    </div>
  `).join('');
}

window.requestEmergencyWhatsAppEnhanced = function(serviceName) {
  const waNum = store.siteConfig.whatsappNumber;
  const msg = `🚨 *RICHIESTA ASSISTENZA STRADALE H24 URGENTE*\n\nServizio: ${serviceName}\nRichiedo intervento immediato del carroattrezzi sul posto!`;
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
      if (modal) modal.classList.remove('active');
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('active');
      }
    });
  });
}

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
};

// Forms Initializer (Officina, Assistenza & Contact Form)
function initForms() {
  // Officina Form
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

      await store.createRequest(reqObj);
      showToast("Prenotazione Officina salvata nel Database Cloud!");
      closeModal('officina-modal');
      officinaForm.reset();
    });
  }

  // Emergency Form
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

      await store.createRequest(reqObj);
      showToast("ALLERTA SOCCORSO REGISTRATA! Squadra operativa notificata.", "emergency");
      
      const waNum = store.siteConfig.whatsappNumber;
      const msg = `🚨 *RICHIESTA SOCCORSO STRADALE H24*\n\n👤 Nome: ${formData.get('clientName')}\n📞 Tel: ${formData.get('phone')}\n📍 GPS/Posizione: ${formData.get('location')}\n🛠️ Problema: ${formData.get('serviceType')}`;
      window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
      emergencyForm.reset();
    });
  }

  // Contact Form
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

      await store.createRequest(reqObj);
      showToast("Messaggio registrato! Grazie per averci contattato.");
      contactForm.reset();
    });
  }
}
