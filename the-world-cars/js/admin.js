/* ==========================================================================
   THE WORLD CARS - Admin Suite (v2.1)
   Includes: Real Password Change Hashing & Instant UI Config Binding
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initAdminTabs();
});

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
  store.updateRequestStatus(id, newStatus);
  renderAdminStats();
};

window.deleteAdminRequest = function(id) {
  if (confirm("Confermi l'eliminazione definitiva di questa richiesta?")) {
    store.deleteRequest(id);
    renderAdminDashboard();
  }
};

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

function loadAdminSettingsForm() {
  const form = document.getElementById('admin-settings-form');
  if (!form) return;

  form.elements['phone'].value = store.siteConfig.phone || '';
  form.elements['emergencyPhone'].value = store.siteConfig.emergencyPhone || '';
  form.elements['whatsappNumber'].value = store.siteConfig.whatsappNumber || '';
  form.elements['email'].value = store.siteConfig.email || '';
  form.elements['supabaseUrl'].value = store.siteConfig.supabaseUrl || '';
  form.elements['supabaseKey'].value = store.siteConfig.supabaseKey || '';
  form.elements['newAdminPassword'].value = '';
}

window.handleSettingsSubmit = async function(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  const newPass = formData.get('newAdminPassword');

  const updatedConfig = {
    phone: formData.get('phone').trim(),
    emergencyPhone: formData.get('emergencyPhone').trim(),
    whatsappNumber: formData.get('whatsappNumber').trim(),
    email: formData.get('email').trim(),
    supabaseUrl: formData.get('supabaseUrl').trim(),
    supabaseKey: formData.get('supabaseKey').trim()
  };

  if (newPass && newPass.trim() !== '') {
    const newHash = await store.hashPassword(newPass.trim());
    updatedConfig.adminPasswordHash = newHash;
  }

  await store.updateConfig(updatedConfig);
  if (typeof applySiteConfigToUI === 'function') applySiteConfigToUI();
  alert("⚙️ Configurazione ed impostazioni aggiornate con successo!");
};
