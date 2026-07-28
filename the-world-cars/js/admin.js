/* ==========================================================================
   THE WORLD CARS - Admin Suite (v2.4)
   Includes: Logo Drag-and-Drop, Customer Confirmation Dispatcher & Status Triggers
   ========================================================================== */

let adminInactivityTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  initAdminTabs();
  initAdminActivityTracker();
  initDropzoneUploaders();
});

// Admin Inactivity Auto-Logout Tracker (15 Minutes)
function initAdminActivityTracker() {
  const resetTimer = () => {
    if (store.isAdminAuthenticated()) {
      store.refreshAdminSession();
      clearTimeout(adminInactivityTimer);
      adminInactivityTimer = setTimeout(() => {
        if (store.isAdminAuthenticated()) {
          store.logoutAdmin();
          alert("⏱️ Sessione amministratore scaduta per inattività (15 min).");
          const modal = document.getElementById('admin-modal');
          if (modal) modal.classList.remove('active');
          document.getElementById('admin-login-box').style.display = 'block';
          document.getElementById('admin-dashboard-box').style.display = 'none';
        }
      }, 15 * 60 * 1000);
    }
  };

  ['mousemove', 'keydown', 'click', 'scroll'].forEach(evt => {
    window.addEventListener(evt, resetTimer, { passive: true });
  });
}

// Drag & Drop File Uploaders using FileReader Base64
function initDropzoneUploaders() {
  document.querySelectorAll('.dropzone').forEach(dropzone => {
    const fileInput = dropzone.querySelector('input[type="file"]');
    const previewImg = dropzone.parentElement.querySelector('.dropzone-preview') || dropzone.querySelector('.dropzone-preview');
    const targetUrlInput = dropzone.parentElement.querySelector('input[name="image"]') || dropzone.parentElement.querySelector('input[name="logoImageUrl"]');

    if (!fileInput) return;

    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0], previewImg, targetUrlInput);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (fileInput.files.length > 0) {
        handleFileSelect(fileInput.files[0], previewImg, targetUrlInput);
      }
    });
  });
}

function handleFileSelect(file, previewImg, targetUrlInput) {
  if (!file.type.startsWith('image/')) {
    alert("Seleziona solo file immagine (JPG, PNG, WebP)!");
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (evt) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 800;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Compress to 70% quality JPEG to ensure it fits in localStorage and Cloud payload limits
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
      
      if (targetUrlInput) targetUrlInput.value = compressedBase64;
      if (previewImg) {
        previewImg.src = compressedBase64;
        previewImg.style.display = 'block';
      }
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
}

// Open Admin Modal
window.openAdminModal = function() {
  const modal = document.getElementById('admin-modal');

  if (store.isAdminAuthenticated()) {
    document.getElementById('admin-login-box').style.display = 'none';
    document.getElementById('admin-dashboard-box').style.display = 'block';
    renderAdminDashboard();
  } else {
    document.getElementById('admin-login-box').style.display = 'block';
    document.getElementById('admin-dashboard-box').style.display = 'none';
  }

  modal.classList.add('active');
};

// Handle Admin Login with SHA-256 Verification
window.handleAdminLogin = async function(e) {
  e.preventDefault();
  const passInput = document.getElementById('admin-password-input');
  const enteredPass = passInput.value.trim();

  const isVal = await store.verifyAdminPassword(enteredPass);
  if (isVal) {
    passInput.value = '';
    document.getElementById('admin-login-box').style.display = 'none';
    document.getElementById('admin-dashboard-box').style.display = 'block';
    renderAdminDashboard();
  } else {
    alert("❌ Password errata. Accesso negato.");
  }
};

window.handleAdminLogout = function() {
  store.logoutAdmin();
  clearTimeout(adminInactivityTimer);
  document.getElementById('admin-login-box').style.display = 'block';
  document.getElementById('admin-dashboard-box').style.display = 'none';
};

function initAdminTabs() {
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
      btn.classList.add('active');
      const target = document.getElementById(`admin-tab-${btn.dataset.tab}`);
      if (target) target.style.display = 'block';
    });
  });
}

function renderAdminDashboard() {
  renderAdminStats();
  renderAdminRequestsTable();
  renderAdminCarsTable();
  renderAdminServicesTables();
  loadAdminSettingsForm();
}

function renderAdminStats() {
  const totalReqs = store.requests.length;
  const newReqs = store.requests.filter(r => r.status === 'Nuova').length;
  const availableCars = store.cars.filter(c => c.available).length;
  const totalCars = store.cars.length;

  document.getElementById('admin-stat-requests').textContent = `${newReqs} Nuove / ${totalReqs} Totali`;
  document.getElementById('admin-stat-cars').textContent = `${availableCars} / ${totalCars} Disponibili`;
}

// Render Requests Table
let adminSearchTerm = '';

window.handleAdminSearch = function(val) {
  adminSearchTerm = val.toLowerCase();
  renderAdminRequestsTable();
};

function renderAdminRequestsTable() {
  const container = document.getElementById('admin-requests-table-body');
  if (!container) return;

  const filtered = store.requests.filter(r => {
    return (r.clientName || '').toLowerCase().includes(adminSearchTerm) ||
           (r.phone || '').toLowerCase().includes(adminSearchTerm) ||
           (r.type || '').toLowerCase().includes(adminSearchTerm) ||
           (r.serviceName || '').toLowerCase().includes(adminSearchTerm);
  });

  if (filtered.length === 0) {
    container.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">Nessuna richiesta trovata.</td></tr>`;
    return;
  }

  container.innerHTML = filtered.map(r => `
    <tr>
      <td><strong>${r.id}</strong></td>
      <td>
        <span class="badge-availability" style="position: relative; top: 0; right: 0;">${r.type}</span>
      </td>
      <td>
        <strong>${r.clientName}</strong><br>
        <small style="color: var(--text-muted);">${r.phone}</small>
        ${r.email ? `<br><small style="color: var(--accent-cyan);">${r.email}</small>` : ''}
      </td>
      <td>${r.serviceName || '-'}</td>
      <td>${r.startDate ? `${r.startDate} ${r.endDate ? '➜ ' + r.endDate : ''}` : (r.createdAt || '-')}</td>
      <td>
        <select class="form-control" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" onchange="changeReqStatus('${r.id}', this.value)">
          <option value="Nuova" ${r.status === 'Nuova' ? 'selected' : ''}>Nuova</option>
          <option value="Confermata" ${r.status === 'Confermata' ? 'selected' : ''}>Confermata</option>
          <option value="Completata" ${r.status === 'Completata' ? 'selected' : ''}>Completata</option>
          <option value="Annullata" ${r.status === 'Annullata' ? 'selected' : ''}>Annullata</option>
        </select>
      </td>
      <td>
        <button class="btn btn-secondary" style="padding: 0.3rem 0.7rem; font-size: 0.75rem; background: rgba(239,68,68,0.2); border-color: rgba(239,68,68,0.4);" onclick="deleteAdminRequest('${r.id}')">
          🗑️ Elimina
        </button>
      </td>
    </tr>
  `).join('');
}

window.changeReqStatus = function(id, newStatus) {
  const req = store.requests.find(r => r.id === id);
  store.updateRequestStatus(id, newStatus);
  renderAdminStats();
  renderAdminCarsTable();
  if (typeof renderCarsGrid === 'function') renderCarsGrid();

  // If status changed to 'Confermata', offer 1-click WhatsApp client confirmation
  if (newStatus === 'Confermata' && req) {
    const cleanPhone = (req.phone || '').replace(/[^0-9]/g, '');
    const clientMsg = `La tua richiesta per ${req.serviceName || req.type} è stata CONFERMATA! 🚗💨 Stiamo arrivando / Il tuo appuntamento è stato confermato. Grazie per aver scelto The World Cars!`;
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(clientMsg)}`;
    
    if (confirm(`✅ Richiesta CONFERMATA!\n\nVuoi inviare adesso il messaggio di conferma via WhatsApp al cliente (${req.clientName})?`)) {
      window.open(waUrl, '_blank');
    } else if (req.email && req.email.includes('@')) {
      const emailSubject = encodeURIComponent("✅ Prenotazione Confermata - THE WORLD CARS");
      const emailBody = encodeURIComponent(`Gentile ${req.clientName},\n\nSiamo lieti di informarti che la tua richiesta per ${req.serviceName || req.type} è stata CONFERMATA dal nostro staff!\n\nI nostri meccatronici / operatori ti stanno raggiungendo o ti attendono in sede.\nPer qualsiasi urgenza puoi contattarci al nostro recapito.\n\nCordiali Saluti,\nTHE WORLD CARS`);
      const mailtoUrl = `mailto:${req.email}?subject=${emailSubject}&body=${emailBody}`;
      
      if (confirm(`Vuoi inviare la conferma via Email al cliente tramite la tua app di posta (Outlook/Mail/Gmail)?`)) {
        window.location.href = mailtoUrl;
      }
    }
  }
};

window.deleteAdminRequest = function(id) {
  if (confirm("Confermi l'eliminazione definitiva di questa richiesta?")) {
    store.deleteRequest(id);
    renderAdminDashboard();
    if (typeof renderCarsGrid === 'function') renderCarsGrid();
  }
};

// Render Cars Fleet Table
function renderAdminCarsTable() {
  const container = document.getElementById('admin-cars-table-body');
  if (!container) return;

  container.innerHTML = store.cars.map(c => `
    <tr>
      <td><img src="${c.image}" style="width: 50px; height: 35px; object-fit: cover; border-radius: 4px;"></td>
      <td><strong>${c.brand} ${c.model}</strong></td>
      <td>${c.category}</td>
      <td>€${c.priceDaily} /giorno</td>
      <td>
        <button class="btn btn-secondary" style="padding: 0.3rem 0.8rem; font-size: 0.8rem; ${c.available ? 'border-color: #10B981; color: #10B981;' : 'border-color: #EF4444; color: #EF4444;'}" onclick="toggleCarStatus('${c.id}')">
          ${c.available ? 'Disponibile' : 'Occupata'}
        </button>
      </td>
      <td>
        <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; margin-right: 0.4rem;" onclick="openEditCarModal('${c.id}')">✏️ Edita</button>
        <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; background: rgba(239,68,68,0.2); border-color: rgba(239,68,68,0.4);" onclick="deleteCarFromAdmin('${c.id}')">🗑️ Elimina</button>
      </td>
    </tr>
  `).join('');
}

window.toggleCarStatus = function(carId) {
  store.toggleCarAvailability(carId);
  renderAdminCarsTable();
  renderAdminStats();
  if (typeof renderCarsGrid === 'function') renderCarsGrid();
};

window.deleteCarFromAdmin = function(carId) {
  if (confirm("Sei sicuro di voler eliminare questo veicolo dalla flotta?")) {
    store.deleteCar(carId);
    renderAdminCarsTable();
    renderAdminStats();
    if (typeof renderCarsGrid === 'function') renderCarsGrid();
  }
};

window.openEditCarModal = function(carId) {
  const car = store.cars.find(c => c.id === carId);
  if (!car) return;

  const modal = document.getElementById('edit-car-modal');
  const form = document.getElementById('edit-car-form');

  form.elements['carId'].value = car.id;
  form.elements['brand'].value = car.brand;
  form.elements['model'].value = car.model;
  form.elements['category'].value = car.category;
  form.elements['gearbox'].value = car.gearbox;
  form.elements['fuel'].value = car.fuel;
  form.elements['seats'].value = car.seats;
  form.elements['luggage'].value = car.luggage;
  form.elements['priceDaily'].value = car.priceDaily;
  form.elements['priceWeekly'].value = car.priceWeekly;
  form.elements['image'].value = car.image;
  form.elements['description'].value = car.description || '';

  const preview = form.querySelector('.dropzone-preview');
  if (preview) {
    preview.src = car.image;
    preview.style.display = 'block';
  }

  modal.classList.add('active');
};

window.handleEditCarSubmit = function(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  const carId = formData.get('carId');
  const updatedCarData = {
    brand: formData.get('brand'),
    model: formData.get('model'),
    category: formData.get('category'),
    gearbox: formData.get('gearbox'),
    fuel: formData.get('fuel'),
    seats: parseInt(formData.get('seats')) || 5,
    luggage: formData.get('luggage'),
    priceDaily: parseFloat(formData.get('priceDaily')),
    priceWeekly: parseFloat(formData.get('priceWeekly')),
    image: formData.get('image'),
    description: formData.get('description')
  };

  store.updateCar(carId, updatedCarData);
  alert("✅ Veicolo modificato con successo!");
  closeModal('edit-car-modal');
  renderAdminCarsTable();
  if (typeof renderCarsGrid === 'function') renderCarsGrid();
};

window.handleAddCarSubmit = function(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  const newCarData = {
    brand: formData.get('brand'),
    model: formData.get('model'),
    category: formData.get('category'),
    gearbox: formData.get('gearbox'),
    fuel: formData.get('fuel'),
    seats: parseInt(formData.get('seats')) || 5,
    luggage: formData.get('luggage') || '2 Valigie',
    priceDaily: parseFloat(formData.get('priceDaily')) || 100,
    priceWeekly: parseFloat(formData.get('priceWeekly')) || 600,
    image: formData.get('image') || './assets/images/car_porsche_911.jpg',
    description: formData.get('description') || 'Vettura eccellente in condizioni perfette.'
  };

  store.addCar(newCarData);
  alert("✅ Nuova auto aggiunta alla flotta!");
  form.reset();
  renderAdminCarsTable();
  if (typeof renderCarsGrid === 'function') renderCarsGrid();
};

// Render Services Management Tables
function renderAdminServicesTables() {
  const offContainer = document.getElementById('admin-officina-services-body');
  if (offContainer) {
    offContainer.innerHTML = store.officinaServices.map(s => `
      <tr>
        <td style="font-size: 1.5rem;">${s.icon}</td>
        <td><strong>${s.title}</strong></td>
        <td style="font-size: 0.85rem; color: var(--text-secondary);">${s.description}</td>
        <td>${s.time}</td>
        <td><strong style="color: var(--accent-cyan);">${s.price}</strong></td>
        <td>
          <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; margin-right: 0.3rem;" onclick="openEditOfficinaModal('${s.id}')">✏️ Edita</button>
          <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; background: rgba(239,68,68,0.2); border-color: rgba(239,68,68,0.4);" onclick="deleteOfficinaServiceFromAdmin('${s.id}')">🗑️ Elimina</button>
        </td>
      </tr>
    `).join('');
  }

  const astContainer = document.getElementById('admin-assistenza-services-body');
  if (astContainer) {
    astContainer.innerHTML = store.assistenzaServices.map(s => `
      <tr>
        <td style="font-size: 1.5rem;">${s.icon}</td>
        <td><strong>${s.title}</strong></td>
        <td style="font-size: 0.85rem; color: var(--text-secondary);">${s.description}</td>
        <td>${s.time}</td>
        <td>
          <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; margin-right: 0.3rem;" onclick="openEditAssistenzaModal('${s.id}')">✏️ Edita</button>
          <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; background: rgba(239,68,68,0.2); border-color: rgba(239,68,68,0.4);" onclick="deleteAssistenzaServiceFromAdmin('${s.id}')">🗑️ Elimina</button>
        </td>
      </tr>
    `).join('');
  }
}

// Add / Edit Officina Service Modal Handlers
window.openAddOfficinaModal = function() {
  const form = document.getElementById('officina-service-form');
  form.reset();
  form.elements['serviceId'].value = '';
  document.getElementById('officina-service-modal-title').textContent = "➕ Aggiungi Servizio Officina";
  document.getElementById('officina-service-modal').classList.add('active');
};

window.openEditOfficinaModal = function(id) {
  const s = store.officinaServices.find(item => item.id === id);
  if (!s) return;

  const form = document.getElementById('officina-service-form');
  form.elements['serviceId'].value = s.id;
  form.elements['icon'].value = s.icon;
  form.elements['title'].value = s.title;
  form.elements['description'].value = s.description;
  form.elements['time'].value = s.time;
  form.elements['price'].value = s.price;

  document.getElementById('officina-service-modal-title').textContent = "✏️ Modifica Servizio Officina";
  document.getElementById('officina-service-modal').classList.add('active');
};

window.handleOfficinaServiceSubmit = function(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  const id = formData.get('serviceId');
  const serviceData = {
    icon: formData.get('icon'),
    title: formData.get('title'),
    description: formData.get('description'),
    time: formData.get('time'),
    price: formData.get('price')
  };

  if (id) {
    store.updateOfficinaService(id, serviceData);
    alert("✅ Servizio Officina aggiornato!");
  } else {
    store.addOfficinaService(serviceData);
    alert("✅ Nuovo servizio Officina aggiunto!");
  }

  closeModal('officina-service-modal');
  renderAdminServicesTables();
  if (typeof renderOfficinaGrid === 'function') renderOfficinaGrid();
};

window.deleteOfficinaServiceFromAdmin = function(id) {
  if (confirm("Eliminare definitivamente questo servizio dall'officina?")) {
    store.deleteOfficinaService(id);
    renderAdminServicesTables();
    if (typeof renderOfficinaGrid === 'function') renderOfficinaGrid();
  }
};

// Add / Edit Assistenza Stradale Service Modal Handlers
window.openAddAssistenzaModal = function() {
  const form = document.getElementById('assistenza-service-form');
  form.reset();
  form.elements['serviceId'].value = '';
  document.getElementById('assistenza-service-modal-title').textContent = "➕ Aggiungi Servizio Soccorso H24";
  document.getElementById('assistenza-service-modal').classList.add('active');
};

window.openEditAssistenzaModal = function(id) {
  const s = store.assistenzaServices.find(item => item.id === id);
  if (!s) return;

  const form = document.getElementById('assistenza-service-form');
  form.elements['serviceId'].value = s.id;
  form.elements['icon'].value = s.icon;
  form.elements['title'].value = s.title;
  form.elements['description'].value = s.description;
  form.elements['time'].value = s.time;

  document.getElementById('assistenza-service-modal-title').textContent = "✏️ Modifica Servizio Soccorso H24";
  document.getElementById('assistenza-service-modal').classList.add('active');
};

window.handleAssistenzaServiceSubmit = function(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  const id = formData.get('serviceId');
  const serviceData = {
    icon: formData.get('icon'),
    title: formData.get('title'),
    description: formData.get('description'),
    time: formData.get('time')
  };

  if (id) {
    store.updateAssistenzaService(id, serviceData);
    alert("✅ Servizio Soccorso H24 aggiornato!");
  } else {
    store.addAssistenzaService(serviceData);
    alert("✅ Nuovo servizio Soccorso H24 aggiunto!");
  }

  closeModal('assistenza-service-modal');
  renderAdminServicesTables();
  if (typeof renderAssistenzaGrid === 'function') renderAssistenzaGrid();
};

window.deleteAssistenzaServiceFromAdmin = function(id) {
  if (confirm("Eliminare definitivamente questo servizio di soccorso H24?")) {
    store.deleteAssistenzaService(id);
    renderAdminServicesTables();
    if (typeof renderAssistenzaGrid === 'function') renderAssistenzaGrid();
  }
};

// Admin Settings Form Loader
function loadAdminSettingsForm() {
  const form = document.getElementById('admin-settings-form');
  if (!form) return;

  form.elements['companyName'].value = store.siteConfig.companyName || '';
  form.elements['address'].value = store.siteConfig.address || '';
  form.elements['phone'].value = store.siteConfig.phone || '';
  form.elements['emergencyPhone'].value = store.siteConfig.emergencyPhone || '';
  form.elements['whatsappNumber'].value = store.siteConfig.whatsappNumber || '';
  form.elements['email'].value = store.siteConfig.email || '';
  form.elements['logoIcon'].value = store.siteConfig.logoIcon || '🏎️';
  form.elements['logoImageUrl'].value = store.siteConfig.logoImageUrl || '';
  form.elements['supabaseUrl'].value = store.siteConfig.supabaseUrl || '';
  form.elements['supabaseKey'].value = store.siteConfig.supabaseKey || '';
  form.elements['newAdminPassword'].value = '';

  const logoPreview = document.getElementById('logo-preview-img');
  if (logoPreview && store.siteConfig.logoImageUrl) {
    logoPreview.src = store.siteConfig.logoImageUrl;
    logoPreview.style.display = 'block';
  }
}

window.handleSettingsSubmit = async function(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  const newPass = formData.get('newAdminPassword');

  const updatedConfig = {
    companyName: formData.get('companyName').trim(),
    address: formData.get('address').trim(),
    phone: formData.get('phone').trim(),
    emergencyPhone: formData.get('emergencyPhone').trim(),
    whatsappNumber: formData.get('whatsappNumber').trim(),
    email: formData.get('email').trim(),
    logoIcon: formData.get('logoIcon'),
    logoImageUrl: formData.get('logoImageUrl').trim(),
    supabaseUrl: formData.get('supabaseUrl').trim(),
    supabaseKey: formData.get('supabaseKey').trim()
  };

  if (newPass && newPass.trim() !== '') {
    const newHash = await store.hashPassword(newPass.trim());
    updatedConfig.adminPasswordHash = newHash;
  }

  await store.updateConfig(updatedConfig);
  if (typeof applySiteConfigToUI === 'function') applySiteConfigToUI();
  alert("⚙️ Configurazione, logo ed indirizzo aggiornati con successo!");
};
