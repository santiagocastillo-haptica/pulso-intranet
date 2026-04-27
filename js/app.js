/* ═══════════════════════════════════════════════════════
   PULSO - Application Logic
   ═══════════════════════════════════════════════════════ */

/* ── State ─────────────────────────────────────────────── */
let currentUser = null;
let currentView = 'home';

/* ── Boot ──────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  const session = Session.get();
  if (session) {
    currentUser = session;
    showApp();
    navigate('home');
  }
  document.getElementById('login-form').addEventListener('submit', handleLogin);
});

/* ── Auth ──────────────────────────────────────────────── */
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const pw = document.getElementById('login-password').value;
  const user = Users.byEmail(email);
  const errEl = document.getElementById('login-error');

  if (!user || user.password !== pw) {
    errEl.textContent = 'Correo o contraseña incorrectos.';
    errEl.classList.remove('hidden');
    return;
  }
  if (!user.active) {
    errEl.textContent = 'Tu cuenta está desactivada. Contacta a RRHH.';
    errEl.classList.remove('hidden');
    return;
  }

  errEl.classList.add('hidden');
  currentUser = user;
  Session.set(user);
  showApp();
  navigate('home');
}

/* ── Google Login ──────────────────────────────────────── */
// Para activar: reemplaza el CLIENT_ID con el tuyo desde
// https://console.cloud.google.com → APIs & Services → Credentials
const GOOGLE_CLIENT_ID = '662265278503-r92mephgvmenns558n0ecbg303vrmib5.apps.googleusercontent.com';

function handleGoogleLoginBtn() {
  if (GOOGLE_CLIENT_ID.startsWith('TU_')) {
    const errEl = document.getElementById('login-error');
    errEl.textContent = 'Google Login aún no está configurado. Usa el formulario de acceso o contacta a RRHH para configurarlo.';
    errEl.classList.remove('hidden');
    return;
  }
  if (!window.google) {
    showToast('Cargando Google... intenta en un momento', 'error');
    return;
  }
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback:  handleGoogleCredential,
    hd:        'haptica.co'
  });
  google.accounts.id.prompt();
}

function handleGoogleCredential(response) {
  try {
    // Decodificar JWT de Google (payload en base64)
    const payload = JSON.parse(atob(response.credential.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
    const email = payload.email;
    const user  = Users.byEmail(email);
    const errEl = document.getElementById('login-error');

    if (!user) {
      errEl.textContent = `La cuenta ${email} no está registrada en PULSO. Contacta a RRHH.`;
      errEl.classList.remove('hidden');
      return;
    }
    if (!user.active) {
      errEl.textContent = 'Tu cuenta está desactivada. Contacta a RRHH.';
      errEl.classList.remove('hidden');
      return;
    }
    errEl.classList.add('hidden');
    currentUser = user;
    Session.set(user);
    showApp();
    navigate('home');
  } catch(e) {
    showToast('Error al verificar cuenta de Google', 'error');
  }
}

function handleLogout() {
  Session.clear();
  currentUser = null;
  document.getElementById('app-view').classList.add('hidden');
  document.getElementById('login-view').classList.remove('hidden');
  document.getElementById('login-form').reset();
}

/* ── App shell ─────────────────────────────────────────── */
function showApp() {
  document.getElementById('login-view').classList.add('hidden');
  document.getElementById('app-view').classList.remove('hidden');

  // Header
  document.getElementById('header-user-name').textContent = currentUser.name;
  const roleBadge = document.getElementById('header-role-badge');
  roleBadge.textContent = roleLabel(currentUser.role);
  roleBadge.className = 'role-badge role-' + currentUser.role;

  // Sidebar user
  document.getElementById('sidebar-avatar').textContent = initials(currentUser.name);
  document.getElementById('sidebar-user-name').textContent = currentUser.name;
  document.getElementById('sidebar-user-role').textContent = roleLabel(currentUser.role);

  // Admin menu items
  document.querySelectorAll('.admin-only').forEach(el => {
    el.classList.toggle('hidden', !isAdmin(currentUser.role));
  });

  // Aprobaciones badge
  if (isAdmin(currentUser.role)) updateAprovBadge();
}

function updateAprovBadge() {
  const badge = document.getElementById('aprov-badge');
  if (!badge) return;
  const count = getPendingForApproval().length;
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'inline-flex';
  } else {
    badge.style.display = 'none';
  }
}

/* ── Sidebar ───────────────────────────────────────────── */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('main-wrapper');
  const isMobile = window.innerWidth <= 900;

  if (isMobile) {
    sidebar.classList.toggle('mobile-open');
  } else {
    sidebar.classList.toggle('collapsed');
    main.classList.toggle('expanded');
  }
}

/* ── Sidebar submenu ───────────────────────────────────── */
function toggleNavParent(key) {
  const sub     = document.getElementById('nav-sub-' + key);
  const chevron = document.getElementById('nav-chevron-' + key);
  if (!sub) return;
  const isOpen = !sub.classList.contains('hidden');
  sub.classList.toggle('hidden', isOpen);
  if (chevron) chevron.style.transform = isOpen ? '' : 'rotate(90deg)';
  // mark parent active when open
  const parent = document.getElementById('nav-parent-' + key);
  if (parent) parent.classList.toggle('active', !isOpen);
}

function openNavParent(key) {
  const sub     = document.getElementById('nav-sub-' + key);
  const chevron = document.getElementById('nav-chevron-' + key);
  const parent  = document.getElementById('nav-parent-' + key);
  if (sub)     { sub.classList.remove('hidden'); }
  if (chevron) { chevron.style.transform = 'rotate(90deg)'; }
  if (parent)  { parent.classList.add('active'); }
}

/* ── Router ────────────────────────────────────────────── */
function navigate(view) {
  if (view === 'admin' && !isAdmin(currentUser.role)) return;
  currentView = view;

  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.view === view);
  });

  // Auto-expand parent submenus when a child is active
  if (view.startsWith('solicitudes')) openNavParent('solicitudes');

  const labels = {
    home: 'Inicio', certificados: 'Certificados',
    solicitudes: 'Solicitudes', solicitudes_materiales: 'Materiales', solicitudes_viaje: 'Viaje',
    ausencias: 'Ausencias', sst: 'SST', ciberseguridad: 'Ciberseguridad',
    pqr: 'PQR', informacion: 'Información Corporativa', perfil: 'Mi Perfil',
    aprobaciones: 'Aprobaciones', admin: 'Panel de Administración'
  };
  document.getElementById('breadcrumb').textContent = labels[view] || view;

  const content = document.getElementById('content');
  content.innerHTML = '';

  const renderers = {
    home: renderHome, certificados: renderCertificados,
    solicitudes: () => { navigate('solicitudes_materiales'); return ''; },
    solicitudes_materiales: renderSolicitudesMateriales,
    solicitudes_viaje: renderSolicitudesViaje,
    ausencias: renderAusencias, sst: renderSST, ciberseguridad: renderCiberseguridad,
    pqr: renderPQR, informacion: renderInformacion, perfil: renderPerfil,
    aprobaciones: renderAprobaciones, admin: renderAdmin
  };

  if (renderers[view]) content.innerHTML = renderers[view]();
  bindEvents(view);

  if (window.innerWidth <= 900) {
    document.getElementById('sidebar').classList.remove('mobile-open');
  }
}

/* ══════════════════════════════════════════════════════════
   HOME
══════════════════════════════════════════════════════════ */
function renderHome() {
  const u   = currentUser;
  const now = new Date();
  const dayNames   = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const monthNames = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const greeting   = now.getHours() < 12 ? 'Buenos días' : now.getHours() < 18 ? 'Buenas tardes' : 'Buenas noches';

  const pendingTotal = Certificates.forUser(u.id).filter(c => c.status === 'pending').length
                     + Requests.forUser(u.id).filter(r => r.status === 'pending').length;
  const vacDays    = 15 - Absences.vacDaysUsed(u.id);
  const prog       = Progress.pct(u.id, 'sst', DB.get('sst').modules);
  const unreadCnt  = AnnRead.unreadCount(u.id);

  const allAnns    = Announcements.all();
  const unreadAnns = allAnns.filter(a => !AnnRead.isRead(u.id, a.id));
  const readAnns   = allAnns.filter(a =>  AnnRead.isRead(u.id, a.id));
  const displayAnns= [...unreadAnns, ...readAnns].slice(0, 6);

  return `
    <div class="welcome-banner">
      <h2>${greeting}, ${u.name.split(' ')[0]}! <i class="ph ph-hand-waving" style="font-size:inherit"></i></h2>
      <p>${dayNames[now.getDay()]}, ${now.getDate()} de ${monthNames[now.getMonth()]} de ${now.getFullYear()}</p>
      <p class="welcome-date">${u.cargo} · ${u.area}</p>
    </div>

    <div class="grid-4 mb-4">
      <div class="stat-card clickable" onclick="navigate('solicitudes')" title="Ver solicitudes">
        <div class="stat-icon stat-icon-red"><i class="ph ph-clipboard-text"></i></div>
        <div>
          <div class="stat-num">${pendingTotal}</div>
          <div class="stat-label">Solicitudes pendientes</div>
        </div>
        <div class="stat-arrow"><i class="ph ph-caret-right"></i></div>
      </div>
      <div class="stat-card clickable" onclick="navigate('ausencias')" title="Ver ausencias">
        <div class="stat-icon stat-icon-blue"><i class="ph ph-beach"></i></div>
        <div>
          <div class="stat-num">${vacDays}</div>
          <div class="stat-label">Días de vacaciones</div>
        </div>
        <div class="stat-arrow"><i class="ph ph-caret-right"></i></div>
      </div>
      <div class="stat-card clickable" onclick="navigate('sst')" title="Ver SST">
        <div class="stat-icon stat-icon-green"><i class="ph ph-shield-check"></i></div>
        <div>
          <div class="stat-num">${prog}%</div>
          <div class="stat-label">Progreso SST</div>
        </div>
        <div class="stat-arrow"><i class="ph ph-caret-right"></i></div>
      </div>
      <div class="stat-card clickable" onclick="scrollToAnuncios()" title="Ver anuncios">
        <div class="stat-icon stat-icon-yellow"><i class="ph ph-megaphone"></i></div>
        <div>
          <div class="stat-num">${unreadCnt}</div>
          <div class="stat-label">Anuncios sin leer</div>
        </div>
        <div class="stat-arrow"><i class="ph ph-caret-right"></i></div>
      </div>
    </div>

    <div class="grid-2 mb-4">
      <div class="banner-card">
        <div class="banner-card-header">
          <i class="ph ph-airplane banner-card-icon"></i>
          <h3>Ausencias próximas</h3>
          <span class="banner-card-sub">Próximos 30 días</span>
        </div>
        <div class="banner-list">${renderAbsBanner()}</div>
      </div>
      <div class="banner-card">
        <div class="banner-card-header">
          <i class="ph ph-cake banner-card-icon"></i>
          <h3>Cumpleaños del mes</h3>
          <span class="banner-card-sub">${monthNames[now.getMonth()]} ${now.getFullYear()}</span>
        </div>
        <div class="banner-list">${renderBdBanner()}</div>
      </div>
    </div>

    <div class="card" id="anuncios-section">
      <div class="card-header">
        <h2><i class="ph ph-megaphone"></i> Anuncios sin leer${unreadCnt > 0 ? ` <span class="ann-unread-badge">${unreadCnt}</span>` : ''}</h2>
        ${isAdmin(currentUser.role) ? '<button class="btn btn-primary btn-sm" onclick="showNewAnnModal()">+ Nuevo Anuncio</button>' : ''}
      </div>
      <div class="card-body">
        ${displayAnns.length ? displayAnns.map(a => {
          const isRead = AnnRead.isRead(u.id, a.id);
          return `
            <div class="announcement-item ${isRead ? 'ann-read' : 'ann-unread'}">
              <div class="ann-meta">
                <span class="ann-tag">${a.tag}</span>
                <span class="ann-date">${fmtDate(a.date)}</span>
                ${!isRead ? '<span class="ann-new-badge">Nuevo</span>' : ''}
                ${isAdmin(currentUser.role) ? `<button class="btn btn-danger btn-sm" style="margin-left:auto" onclick="deleteAnn(${a.id})"><i class="ph ph-x"></i></button>` : ''}
              </div>
              <div class="ann-title">${a.title}</div>
              <div class="ann-body">${a.body}</div>
              ${!isRead ? `<button class="btn btn-outline btn-sm ann-read-btn" onclick="markAnnRead(${a.id})"><i class="ph ph-check"></i> Marcar como leído</button>` : ''}
            </div>`;
        }).join('') : '<div class="empty-state"><div class="empty-state-icon"><i class="ph ph-envelope-open"></i></div><p>No hay anuncios aún.</p></div>'}
      </div>
    </div>`;
}

function renderAbsBanner() {
  const now   = new Date();
  const in30  = new Date(now); in30.setDate(in30.getDate() + 30);
  const mths  = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  const upcoming = Absences.all()
    .filter(a => a.status !== 'rejected')
    .filter(a => { const s = new Date(a.startDate + 'T12:00:00'); return s >= now && s <= in30; })
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  if (!upcoming.length)
    return `<div class="banner-empty"><span><i class="ph ph-airplane" style="font-size:30px;opacity:.4"></i></span><p>Sin ausencias en los próximos 30 días</p></div>`;

  return upcoming.slice(0, 5).map(a => {
    const user  = Users.find(a.userId);
    const start = new Date(a.startDate + 'T12:00:00');
    const end   = new Date(start); end.setDate(end.getDate() + a.days - 1);
    return `
      <div class="banner-item">
        <div class="banner-date-range">
          <div class="banner-date-box">
            <span class="banner-day">${start.getDate()}</span>
            <span class="banner-month">${mths[start.getMonth()]}</span>
          </div>
          <span class="banner-range-arrow">→</span>
          <div class="banner-date-box">
            <span class="banner-day">${end.getDate()}</span>
            <span class="banner-month">${mths[end.getMonth()]}</span>
          </div>
        </div>
        <div class="banner-info">
          <div class="banner-name">${user ? user.name.split(' ').slice(0,2).join(' ') : '—'}</div>
          <div class="banner-type">${absTypeName(a.type)} · ${a.days} día${a.days !== 1 ? 's' : ''}</div>
        </div>
        <span class="banner-status-pill ${a.status}">${a.status === 'approved' ? 'Aprobado' : 'Pendiente'}</span>
      </div>`;
  }).join('');
}

function renderBdBanner() {
  const now   = new Date();
  const month = now.getMonth();
  const today = now.getDate();
  const mths  = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  const bdays = Users.all()
    .filter(u => { if (!u.birthday) return false; return new Date(u.birthday + 'T12:00:00').getMonth() === month; })
    .sort((a, b) => new Date(a.birthday).getDate() - new Date(b.birthday).getDate());

  if (!bdays.length)
    return `<div class="banner-empty"><span><i class="ph ph-cake" style="font-size:30px;opacity:.4"></i></span><p>Sin cumpleaños este mes</p></div>`;

  return bdays.map(u => {
    const bd      = new Date(u.birthday + 'T12:00:00');
    const day     = bd.getDate();
    const isToday = day === today;
    return `
      <div class="banner-item ${isToday ? 'banner-today' : ''}">
        <div class="banner-date-box ${isToday ? 'banner-date-box--today' : ''}">
          <span class="banner-day">${day}</span>
          <span class="banner-month">${mths[month]}</span>
        </div>
        <div class="banner-info">
          <div class="banner-name">${u.name.split(' ').slice(0,2).join(' ')}${isToday ? ' <i class="ph ph-confetti" style="color:var(--color-amarillo)"></i>' : ''}</div>
          <div class="banner-type">${u.cargo}</div>
        </div>
        ${isToday ? '<span class="banner-status-pill approved">¡Hoy!</span>' : ''}
      </div>`;
  }).join('');
}

function markAnnRead(annId) {
  AnnRead.markRead(currentUser.id, annId);
  showToast('Anuncio marcado como leído ✓', 'success');
  navigate('home');
}

function scrollToAnuncios() {
  if (currentView !== 'home') { navigate('home'); }
  setTimeout(() => {
    const el = document.getElementById('anuncios-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 120);
}

function showNewAnnModal() {
  openModal('Nuevo Anuncio', `
    <div class="form-group"><label>Título</label><input type="text" id="ann-title" placeholder="Título del anuncio"></div>
    <div class="form-group"><label>Categoría</label>
      <select id="ann-tag">
        <option>Bienestar</option><option>Política</option><option>Formación</option><option>Sistema</option><option>Eventos</option><option>General</option>
      </select>
    </div>
    <div class="form-group"><label>Contenido</label><textarea id="ann-body" placeholder="Escribe el anuncio aquí..."></textarea></div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="submitAnn()">Publicar</button>
    </div>`);
}

function submitAnn() {
  const title = document.getElementById('ann-title').value.trim();
  const body = document.getElementById('ann-body').value.trim();
  const tag = document.getElementById('ann-tag').value;
  if (!title || !body) { showToast('Completa todos los campos', 'error'); return; }
  Announcements.add({ title, body, tag, date: today(), author: currentUser.name });
  closeModal();
  showToast('Anuncio publicado exitosamente', 'success');
  navigate('home');
}

function deleteAnn(id) {
  Announcements.del(id);
  showToast('Anuncio eliminado', 'success');
  navigate('home');
}

/* ══════════════════════════════════════════════════════════
   CERTIFICADOS
══════════════════════════════════════════════════════════ */
function renderCertificados() {
  const certs = Certificates.forUser(currentUser.id);
  return `
    <div class="page-title">Certificados</div>
    <div class="page-subtitle">Solicita certificados laborales y de nómina. El área de RR.HH. los procesará en un plazo de 1-3 días hábiles.</div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><h2>Nueva Solicitud</h2></div>
        <div class="card-body">

          <div class="form-group">
            <label>Tipo de Certificado</label>
            <select id="cert-type" onchange="onCertTypeChange()">
              <option value="laboral_salario">Certificado Laboral con Salario</option>
              <option value="laboral_sin_salario">Certificado Laboral sin Salario</option>
              <option value="cesantias">Certificado de Cesantías</option>
              <option value="retenciones">Certificado de Retenciones</option>
            </select>
          </div>

          <div class="form-group">
            <label>A quién va dirigida la referencia</label>
            <div class="cert-dirigida-row">
              <select id="cert-dirigida" onchange="onDirigidaChange()">
                <option value="">Sin título</option>
                <option value="senor">Señor</option>
                <option value="senora">Señora</option>
                <option value="senores">Señores</option>
              </select>
              <input type="text" id="cert-dirigida-nombre" class="hidden" placeholder="Nombre del destinatario">
            </div>
          </div>

          <div id="cert-cesantias-section" class="hidden">
            <div class="cert-section-divider">Información de Cesantías</div>
            <div class="form-group">
              <label>Motivo de retiro <span class="text-danger">*</span></label>
              <div class="cert-motivo-list">
                <label class="radio-option"><input type="radio" name="ces_motivo" value="compra_vivienda" onchange="validateCertForm()"> Compra de vivienda</label>
                <label class="radio-option"><input type="radio" name="ces_motivo" value="mejora_vivienda" onchange="validateCertForm()"> Mejora de vivienda</label>
                <label class="radio-option"><input type="radio" name="ces_motivo" value="credito_vivienda" onchange="validateCertForm()"> Crédito de vivienda</label>
                <label class="radio-option"><input type="radio" name="ces_motivo" value="impuesto_predial" onchange="validateCertForm()"> Impuesto predial</label>
                <label class="radio-option"><input type="radio" name="ces_motivo" value="educacion" onchange="validateCertForm()"> Educación</label>
              </div>
            </div>
            <div class="form-group">
              <label>Documento de respaldo <span class="text-danger">*</span></label>
              <div class="cert-upload-box" onclick="document.getElementById('cert-doc-input').click()">
                <i class="ph ph-paperclip cert-upload-icon"></i>
                <span id="cert-doc-label">Adjuntar documento de soporte...</span>
              </div>
              <input type="file" id="cert-doc-input" class="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onchange="onDocAttached(this)">
            </div>
          </div>

          <div class="form-group">
            <label>Observaciones <span class="text-muted">(opcional)</span></label>
            <textarea id="cert-obs" placeholder="Agrega cualquier observación o indicación especial..."></textarea>
          </div>

          <button id="btn-solicitar-cert" class="btn btn-primary btn-full" onclick="submitCert()">Solicitar Certificado</button>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h2>Mis Certificados</h2></div>
        <div class="card-body" style="padding:0">
          ${certs.length ? `<table>
            <thead><tr><th>Tipo</th><th>Fecha</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              ${certs.map(c => `<tr>
                <td>
                  <div style="font-size:13px;font-weight:600">${certTypeName(c.type)}</div>
                  ${c.dirigida ? `<div style="font-size:11px;color:var(--text-muted)">${certDirigidaLabel(c.dirigida, c.dirigidaNombre)}</div>` : ''}
                  ${c.cesantiasMotivo ? `<div style="font-size:11px;color:var(--text-muted)">${cesantiasMotivoName(c.cesantiasMotivo)}</div>` : ''}
                </td>
                <td>${fmtDate(c.date)}</td>
                <td>${statusBadge(c.status)}</td>
                <td>${c.status === 'approved' ? `<button class="btn btn-outline btn-sm" onclick="downloadCert(${c.id})"><i class="ph ph-download-simple"></i> Descargar</button>` : ''}</td>
              </tr>`).join('')}
            </tbody>
          </table>` : `<div class="empty-state"><div class="empty-state-icon"><i class="ph ph-file-text"></i></div><p>No tienes certificados solicitados aún.</p></div>`}
        </div>
      </div>
    </div>`;
}

function onCertTypeChange() {
  const type = document.getElementById('cert-type').value;
  const sec  = document.getElementById('cert-cesantias-section');
  if (type === 'cesantias') {
    sec.classList.remove('hidden');
  } else {
    sec.classList.add('hidden');
    document.querySelectorAll('input[name="ces_motivo"]').forEach(r => r.checked = false);
    document.getElementById('cert-doc-label').textContent = 'Adjuntar documento de soporte...';
    document.getElementById('cert-doc-input').value = '';
  }
  validateCertForm();
}

function onDirigidaChange() {
  const val       = document.getElementById('cert-dirigida').value;
  const nameInput = document.getElementById('cert-dirigida-nombre');
  if (val) {
    nameInput.classList.remove('hidden');
  } else {
    nameInput.classList.add('hidden');
    nameInput.value = '';
  }
}

function onDocAttached(input) {
  const file = input.files[0];
  document.getElementById('cert-doc-label').textContent = file ? '✓ ' + file.name : 'Adjuntar documento de soporte...';
  validateCertForm();
}

function validateCertForm() {
  const type = document.getElementById('cert-type').value;
  const btn  = document.getElementById('btn-solicitar-cert');
  if (!btn) return;
  if (type === 'cesantias') {
    const motivo   = document.querySelector('input[name="ces_motivo"]:checked');
    const docInput = document.getElementById('cert-doc-input');
    btn.disabled   = !(motivo && docInput.files && docInput.files.length > 0);
  } else {
    btn.disabled = false;
  }
}

function submitCert() {
  const type         = document.getElementById('cert-type').value;
  const dirigida     = document.getElementById('cert-dirigida').value;
  const dirigidaNom  = document.getElementById('cert-dirigida-nombre').value.trim();
  const obs          = document.getElementById('cert-obs').value.trim();

  const certData = {
    userId:        currentUser.id,
    type,
    status:        'pending',
    date:          today(),
    approvedBy:    null,
    approvedDate:  null,
    dirigida:      dirigida || null,
    dirigidaNombre: (dirigida && dirigidaNom) ? dirigidaNom : null,
    obs:           obs || null
  };

  if (type === 'cesantias') {
    const motivo   = document.querySelector('input[name="ces_motivo"]:checked');
    const docInput = document.getElementById('cert-doc-input');
    certData.cesantiasMotivo = motivo ? motivo.value : null;
    certData.docRespaldo     = (docInput.files && docInput.files[0]) ? docInput.files[0].name : null;
  }

  Certificates.add(certData);
  showToast('Certificado solicitado. RR.HH. lo procesará en 1-3 días hábiles.', 'success');
  navigate('certificados');
}

function downloadCert(id) {
  const cert = Certificates.all().find(c => c.id === id);
  const user = Users.find(cert.userId);
  if (!cert || !user) return;
  const content = `CERTIFICADO LABORAL
======================================

EMPRESA PULSO S.A.S.
NIT: 900.123.456-7
Dirección: Calle 100 # 15-20, Bogotá D.C.

Bogotá D.C., ${fmtDate(cert.approvedDate || cert.date)}

${certTypeName(cert.type).toUpperCase()}

La empresa PULSO S.A.S., certifica que:

${user.name}
Identificado con cédula de ciudadanía
Cargo: ${user.cargo}
Área: ${user.area}
Fecha de ingreso: ${fmtDate(user.ingreso)}
${cert.type === 'laboral_salario' ? 'Salario: Información confidencial según política de privacidad' : ''}

Ha laborado en esta empresa de manera continua desde la fecha mencionada.

Esta certificación se expide a solicitud del interesado para los fines que estime convenientes.

Cordialmente,

Ana García
Gerente de Recursos Humanos
PULSO S.A.S.
======================================
Documento generado por PULSO Intranet`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `certificado_${cert.type}_${user.name.replace(/ /g, '_')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Certificado descargado', 'success');
}

/* ══════════════════════════════════════════════════════════
   SOLICITUDES — MATERIALES
══════════════════════════════════════════════════════════ */
function renderSolicitudesMateriales() {
  const reqs = Requests.forUser(currentUser.id).filter(r => r.type === 'materiales');
  return `
    <div class="page-title">Solicitud de Materiales</div>
    <div class="page-subtitle">Solicita materiales de oficina o equipos. El área Administrativa los gestionará en 1-3 días hábiles.</div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><h2>Nueva Solicitud</h2></div>
        <div class="card-body">
          <div class="form-group">
            <label>Materiales a solicitar <span class="text-danger">*</span></label>
            <textarea id="mat-items" placeholder="Ej: Resma de papel, esferos, marcadores..."></textarea>
          </div>
          <div class="form-group">
            <label>Cantidad <span class="text-danger">*</span></label>
            <input type="number" id="mat-qty" placeholder="Ej: 5" min="1">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Fecha de recogida en oficina <span class="text-danger">*</span></label>
              <input type="date" id="mat-pickup">
            </div>
            <div class="form-group">
              <label>Fecha de regreso a oficina</label>
              <input type="date" id="mat-return">
            </div>
          </div>
          <button class="btn btn-primary btn-full" onclick="submitMat()">Enviar Solicitud</button>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h2>Mis Solicitudes</h2></div>
        <div class="card-body" style="padding:0">
          ${reqs.length ? `<table>
            <thead><tr><th>Material</th><th>Cant.</th><th>Recogida</th><th>Estado</th></tr></thead>
            <tbody>
              ${reqs.map(r => `<tr>
                <td>${r.items || r.description || '—'}</td>
                <td>${r.qty || '—'}</td>
                <td>${r.pickupDate ? fmtDate(r.pickupDate) : '—'}</td>
                <td>${statusBadge(r.status)}</td>
              </tr>`).join('')}
            </tbody>
          </table>` : `<div class="empty-state"><div class="empty-state-icon"><i class="ph ph-package"></i></div><p>No tienes solicitudes de materiales aún.</p></div>`}
        </div>
      </div>
    </div>`;
}

function submitMat() {
  const items  = document.getElementById('mat-items').value.trim();
  const qty    = document.getElementById('mat-qty').value;
  const pickup = document.getElementById('mat-pickup').value;
  if (!items || !qty || !pickup) { showToast('Completa los campos obligatorios', 'error'); return; }
  Requests.add({
    userId: currentUser.id, type: 'materiales',
    items, qty: parseInt(qty),
    pickupDate:  pickup,
    returnDate:  document.getElementById('mat-return').value || null,
    description: items,
    status: 'pending', date: today()
  });
  showToast('Solicitud de materiales enviada. El área Administrativa la revisará.', 'success');
  navigate('solicitudes_materiales');
}

/* ══════════════════════════════════════════════════════════
   SOLICITUDES — VIAJE
══════════════════════════════════════════════════════════ */
const HORARIOS = ['06:00 – 08:00','08:00 – 10:00','10:00 – 12:00','12:00 – 14:00','14:00 – 16:00','16:00 – 18:00','18:00 – 20:00','20:00 – 22:00'];
const horariosOpts = HORARIOS.map(h => `<option>${h}</option>`).join('');

function renderSolicitudesViaje() {
  const reqs = Requests.forUser(currentUser.id).filter(r => r.type === 'viaje');
  return `
    <div class="page-title">Solicitud de Viaje</div>
    <div class="page-subtitle">Solicita desplazamientos corporativos. La Gerencia los aprobará en un plazo de 1-3 días hábiles.</div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><h2>Nueva Solicitud</h2></div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label>Código de proyecto <span class="text-danger">*</span></label>
              <input type="text" id="viaje-cod" placeholder="Ej: HAP-2026-001">
            </div>
            <div class="form-group">
              <label>Destino <span class="text-danger">*</span></label>
              <input type="text" id="viaje-dest" placeholder="Ciudad / País">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Fecha de salida <span class="text-danger">*</span></label>
              <input type="date" id="viaje-start">
            </div>
            <div class="form-group">
              <label>Horario deseado de salida</label>
              <select id="viaje-h-start"><option value="">Sin preferencia</option>${horariosOpts}</select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Fecha de regreso <span class="text-danger">*</span></label>
              <input type="date" id="viaje-end">
            </div>
            <div class="form-group">
              <label>Horario deseado de regreso</label>
              <select id="viaje-h-end"><option value="">Sin preferencia</option>${horariosOpts}</select>
            </div>
          </div>
          <div class="form-group">
            <label>Requerimiento de hotel</label>
            <div class="viaje-hotel-row">
              <label class="radio-option"><input type="radio" name="viaje-hotel" value="no" checked onchange="onHotelChange()"> No requiere</label>
              <label class="radio-option"><input type="radio" name="viaje-hotel" value="si" onchange="onHotelChange()"> Sí requiere</label>
            </div>
          </div>
          <div class="form-group">
            <label>Zona de preferencia <span class="text-muted">(opcional)</span></label>
            <input type="text" id="viaje-zona" placeholder="Ej: Norte de la ciudad, centro histórico...">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>N° de viajeros <span class="text-danger">*</span></label>
              <input type="number" id="viaje-n" value="1" min="1">
            </div>
            <div class="form-group">
              <label>¿Quién asume los costos?</label>
              <select id="viaje-costs">
                <option value="haptica">Háptica</option>
                <option value="cliente">Cliente</option>
              </select>
            </div>
          </div>
          <button class="btn btn-primary btn-full" onclick="submitViaje()">Enviar Solicitud</button>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h2>Mis Solicitudes</h2></div>
        <div class="card-body" style="padding:0">
          ${reqs.length ? `<table>
            <thead><tr><th>Proyecto</th><th>Destino</th><th>Salida</th><th>Estado</th></tr></thead>
            <tbody>
              ${reqs.map(r => `<tr>
                <td>${r.codigoProyecto || '—'}</td>
                <td>${r.destination || '—'}</td>
                <td>${r.startDate ? fmtDate(r.startDate) : '—'}</td>
                <td>${statusBadge(r.status)}</td>
              </tr>`).join('')}
            </tbody>
          </table>` : `<div class="empty-state"><div class="empty-state-icon"><i class="ph ph-airplane"></i></div><p>No tienes solicitudes de viaje aún.</p></div>`}
        </div>
      </div>
    </div>`;
}

function onHotelChange() { /* zona always visible */ }

function submitViaje() {
  const cod   = document.getElementById('viaje-cod').value.trim();
  const dest  = document.getElementById('viaje-dest').value.trim();
  const start = document.getElementById('viaje-start').value;
  const end   = document.getElementById('viaje-end').value;
  const n     = document.getElementById('viaje-n').value;
  if (!cod || !dest || !start || !end || !n) { showToast('Completa todos los campos obligatorios', 'error'); return; }
  const hotelVal = document.querySelector('input[name="viaje-hotel"]:checked')?.value || 'no';
  Requests.add({
    userId: currentUser.id, type: 'viaje',
    codigoProyecto: cod,
    destination:    dest,
    startDate:      start,
    horarioSalida:  document.getElementById('viaje-h-start').value || null,
    endDate:        end,
    horarioRegreso: document.getElementById('viaje-h-end').value || null,
    hotel:          hotelVal === 'si',
    zonaHotel:      document.getElementById('viaje-zona').value.trim() || null,
    travelers:      parseInt(n),
    costOwner:      document.getElementById('viaje-costs').value,
    status: 'pending', date: today()
  });
  showToast('Solicitud de viaje enviada. La Gerencia la revisará.', 'success');
  navigate('solicitudes_viaje');
}

/* ══════════════════════════════════════════════════════════
   AUSENCIAS
══════════════════════════════════════════════════════════ */
function renderAusencias() {
  const absences = Absences.forUser(currentUser.id);
  return `
    <div class="page-title">Ausencias</div>
    <div class="page-subtitle">Solicita vacaciones, licencias y días especiales. RR.HH. procesará tu solicitud en 1-3 días hábiles.</div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><h2>Nueva Solicitud de Ausencia</h2></div>
        <div class="card-body">
          <div class="form-group">
            <label>Tipo de ausencia</label>
            <select id="abs-type" onchange="onAbsTypeChange()">
              <option value="vacaciones">Vacaciones</option>
              <option value="dia_naranja">Día Naranja</option>
              <option value="licencia_no_remunerada">Licencia No Remunerada</option>
              <option value="otras_licencias">Otras Licencias</option>
              <option value="incapacidad">Incapacidad</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Fecha de inicio <span class="text-danger">*</span></label><input type="date" id="abs-start" onchange="updateAbsDays()"></div>
            <div class="form-group"><label>Fecha de fin <span class="text-danger">*</span></label><input type="date" id="abs-end" onchange="updateAbsDays()"></div>
          </div>
          <div id="abs-days-preview" class="text-muted text-sm mb-3"></div>

          <div id="abs-doc-section" class="hidden">
            <div class="cert-section-divider">Soporte requerido</div>
            <div class="form-group">
              <label>Documento de soporte <span class="text-danger">*</span></label>
              <div class="cert-upload-box" onclick="document.getElementById('abs-doc-input').click()">
                <i class="ph ph-paperclip cert-upload-icon"></i>
                <span id="abs-doc-label">Adjuntar soporte...</span>
              </div>
              <input type="file" id="abs-doc-input" class="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onchange="onAbsDocAttached(this)">
            </div>
          </div>

          <div class="form-group"><label>Observaciones <span class="text-muted">(opcional)</span></label><textarea id="abs-obs" placeholder="Información adicional..."></textarea></div>
          <button id="btn-solicitar-abs" class="btn btn-primary btn-full" onclick="submitAbs()">Solicitar Ausencia</button>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h2>Mis Ausencias</h2></div>
        <div class="card-body" style="padding:0">
          ${absences.length ? `<table>
            <thead><tr><th>Tipo</th><th>Período</th><th>Días</th><th>Estado</th></tr></thead>
            <tbody>
              ${absences.map(a => `<tr>
                <td>${absTypeName(a.type)}</td>
                <td>${fmtDateShort(a.startDate)} → ${fmtDateShort(a.endDate)}</td>
                <td>${a.days}</td>
                <td>${statusBadge(a.status)}</td>
              </tr>`).join('')}
            </tbody>
          </table>` : `<div class="empty-state"><div class="empty-state-icon"><i class="ph ph-calendar-blank"></i></div><p>No tienes ausencias registradas.</p></div>`}
        </div>
      </div>
    </div>`;
}

function onAbsTypeChange() {
  const type    = document.getElementById('abs-type').value;
  const needDoc = ['otras_licencias','incapacidad'].includes(type);
  document.getElementById('abs-doc-section').classList.toggle('hidden', !needDoc);
  if (!needDoc) {
    document.getElementById('abs-doc-label').textContent = 'Adjuntar soporte...';
    document.getElementById('abs-doc-input').value = '';
  }
  validateAbsForm();
}

function onAbsDocAttached(input) {
  const file = input.files[0];
  document.getElementById('abs-doc-label').textContent = file ? '✓ ' + file.name : 'Adjuntar soporte...';
  validateAbsForm();
}

function validateAbsForm() {
  const btn     = document.getElementById('btn-solicitar-abs');
  if (!btn) return;
  const type    = document.getElementById('abs-type').value;
  const needDoc = ['otras_licencias','incapacidad'].includes(type);
  if (needDoc) {
    const doc = document.getElementById('abs-doc-input');
    btn.disabled = !(doc && doc.files && doc.files.length > 0);
  } else {
    btn.disabled = false;
  }
}

function updateAbsDays() {
  const start   = document.getElementById('abs-start').value;
  const end     = document.getElementById('abs-end').value;
  const preview = document.getElementById('abs-days-preview');
  if (start && end) {
    const days = Math.ceil((new Date(end) - new Date(start)) / 86400000) + 1;
    preview.textContent = days > 0 ? `Duración: ${days} día(s)` : 'La fecha de fin debe ser posterior al inicio.';
  }
}

function submitAbs() {
  const type  = document.getElementById('abs-type').value;
  const start = document.getElementById('abs-start').value;
  const end   = document.getElementById('abs-end').value;
  const obs   = document.getElementById('abs-obs').value.trim();
  if (!start || !end) { showToast('Selecciona las fechas de la ausencia', 'error'); return; }
  const days = Math.ceil((new Date(end) - new Date(start)) / 86400000) + 1;
  if (days <= 0) { showToast('Las fechas no son válidas', 'error'); return; }
  const needDoc = ['otras_licencias','incapacidad'].includes(type);
  const docInput = document.getElementById('abs-doc-input');
  if (needDoc && !(docInput.files && docInput.files.length > 0)) {
    showToast('Debes adjuntar el soporte para este tipo de ausencia', 'error'); return;
  }
  Absences.add({
    userId: currentUser.id, type, startDate: start, endDate: end, days,
    obs: obs || null,
    docRespaldo: needDoc && docInput.files[0] ? docInput.files[0].name : null,
    status: 'pending', date: today()
  });
  showToast('Solicitud de ausencia enviada. Será procesada en 1-3 días hábiles.', 'success');
  navigate('ausencias');
}

/* ══════════════════════════════════════════════════════════
   SST
══════════════════════════════════════════════════════════ */
function renderSST() {
  const modules = DB.get('sst').modules;
  const prog = Progress.get(currentUser.id);
  const overall = Progress.pct(currentUser.id, 'sst', modules);

  return `
    <div class="page-title">Seguridad y Salud en el Trabajo</div>
    <div class="page-subtitle">Completa todos los módulos de capacitación SST. Es obligatorio para todos los colaboradores.</div>

    <div class="card mb-4">
      <div class="card-body">
        <div class="progress-label">
          <span class="font-semibold">Progreso General SST</span>
          <span>${overall}% completado</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar" style="width:${overall}%"></div>
        </div>
        ${overall === 100 ? '<div class="badge badge-approved mt-3"><i class="ph ph-trophy"></i> ¡Todos los módulos completados!</div>' : ''}
      </div>
    </div>

    <div class="grid-3">
      ${modules.map(m => {
        const done = (prog.sst || {})[m.id] === 100;
        return `<div class="training-card">
          <div class="training-card-icon" style="background:${m.color};color:${m.iconColor}"><i class="ph ${m.icon}"></i></div>
          <div class="training-card-title">${m.title}</div>
          <div class="training-card-desc">${m.desc}</div>
          <div class="training-card-meta">
            <span><i class="ph ph-clock"></i> ${m.duration}</span>
            <span>${done ? '<span class="badge badge-approved">Completado</span>' : '<span class="badge badge-pending">Pendiente</span>'}</span>
          </div>
          <div class="progress-bar-wrap mb-3">
            <div class="progress-bar" style="width:${done ? 100 : 0}%"></div>
          </div>
          ${done
            ? '<button class="btn btn-outline btn-sm btn-full" onclick="viewTips(\'sst\',' + m.id + ')">Ver buenas prácticas</button>'
            : '<button class="btn btn-primary btn-sm btn-full" onclick="startModule(\'sst\',' + m.id + ')">Iniciar módulo</button>'}
        </div>`;
      }).join('')}
    </div>`;
}

function renderCiberseguridad() {
  const modules = DB.get('cyber').modules;
  const prog = Progress.get(currentUser.id);
  const overall = Progress.pct(currentUser.id, 'cyber', modules);

  return `
    <div class="page-title">Ciberseguridad</div>
    <div class="page-subtitle">Aprende a proteger la información corporativa y personal. Completa todos los módulos.</div>

    <div class="card mb-4">
      <div class="card-body">
        <div class="progress-label">
          <span class="font-semibold">Progreso General Ciberseguridad</span>
          <span>${overall}% completado</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar" style="width:${overall}%"></div>
        </div>
        ${overall === 100 ? '<div class="badge badge-approved mt-3"><i class="ph ph-trophy"></i> ¡Todos los módulos completados!</div>' : ''}
      </div>
    </div>

    <div class="grid-3">
      ${modules.map(m => {
        const done = (prog.cyber || {})[m.id] === 100;
        return `<div class="training-card">
          <div class="training-card-icon" style="background:${m.color};color:${m.iconColor}"><i class="ph ${m.icon}"></i></div>
          <div class="training-card-title">${m.title}</div>
          <div class="training-card-desc">${m.desc}</div>
          <div class="training-card-meta">
            <span><i class="ph ph-clock"></i> ${m.duration}</span>
            <span>${done ? '<span class="badge badge-approved">Completado</span>' : '<span class="badge badge-pending">Pendiente</span>'}</span>
          </div>
          <div class="progress-bar-wrap mb-3">
            <div class="progress-bar" style="width:${done ? 100 : 0}%"></div>
          </div>
          ${done
            ? '<button class="btn btn-outline btn-sm btn-full" onclick="viewTips(\'cyber\',' + m.id + ')">Ver buenas prácticas</button>'
            : '<button class="btn btn-primary btn-sm btn-full" onclick="startModule(\'cyber\',' + m.id + ')">Iniciar módulo</button>'}
        </div>`;
      }).join('')}
    </div>`;
}

function startModule(type, id) {
  const modules = type === 'sst' ? DB.get('sst').modules : DB.get('cyber').modules;
  const mod = modules.find(m => m.id === id);
  if (!mod) return;

  openModal(mod.title, `
    <p class="mb-4 text-muted">${mod.desc}</p>
    <div style="background:#f8fafc;border-radius:8px;padding:20px;margin-bottom:20px;border:1px solid var(--border)">
      <p class="font-semibold mb-3">Contenido del módulo:</p>
      <p class="text-sm text-muted">Este módulo cubre los fundamentos de <strong>${mod.title}</strong>, incluyendo conceptos clave, procedimientos recomendados y casos prácticos. Duración estimada: <strong>${mod.duration}</strong>.</p>
      <br>
      <p class="text-sm text-muted">Al completar este módulo quedarás registrado en el sistema como participante activo en el programa de ${type === 'sst' ? 'Seguridad y Salud en el Trabajo' : 'Ciberseguridad'}.</p>
    </div>
    <p class="font-semibold mb-2">Buenas prácticas:</p>
    ${mod.tips.map(t => `<div class="tip-card"><div class="tip-icon"><i class="ph ph-check-circle"></i></div><div class="tip-text">${t}</div></div>`).join('')}
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
      <button class="btn btn-success" onclick="completeModule('${type}',${id})"><i class="ph ph-check"></i> Marcar como Completado</button>
    </div>`);
}

function viewTips(type, id) {
  const modules = type === 'sst' ? DB.get('sst').modules : DB.get('cyber').modules;
  const mod = modules.find(m => m.id === id);
  if (!mod) return;
  openModal(`${mod.title} — Buenas Prácticas`, `
    ${mod.tips.map(t => `<div class="tip-card"><div class="tip-icon"><i class="ph ph-lightbulb"></i></div><div class="tip-text">${t}</div></div>`).join('')}
    <div class="modal-footer"><button class="btn btn-primary" onclick="closeModal()">Cerrar</button></div>`);
}

function completeModule(type, id) {
  Progress.complete(currentUser.id, type, id);
  closeModal();
  showToast('¡Módulo completado! Tu progreso fue guardado.', 'success');
  navigate(type === 'sst' ? 'sst' : 'ciberseguridad');
}

/* ══════════════════════════════════════════════════════════
   PQR
══════════════════════════════════════════════════════════ */
function renderPQR() {
  const myPqr = PQR.forUser(currentUser.id);
  return `
    <div class="page-title">PQR — Peticiones, Quejas, Reclamos y Sugerencias</div>
    <div class="page-subtitle">Puedes enviar tu solicitud de forma anónima si lo prefieres. Tu voz es importante para nosotros.</div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><h2>Nueva PQR</h2></div>
        <div class="card-body">
          <div id="anon-toggle" class="anonymous-toggle" onclick="toggleAnon()">
            <div class="checkbox-label">
              <input type="checkbox" id="pqr-anon" onchange="toggleAnon()">
              <div>
                <div class="font-semibold">Enviar de forma anónima</div>
                <div class="text-sm text-muted">Tu identidad no será revelada al equipo de RRHH</div>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>Tipo</label>
            <select id="pqr-type">
              <option value="peticion">Petición</option>
              <option value="queja">Queja</option>
              <option value="reclamo">Reclamo</option>
              <option value="sugerencia">Sugerencia</option>
            </select>
          </div>
          <div class="form-group"><label>Asunto</label><input type="text" id="pqr-subject" placeholder="Asunto de tu PQR"></div>
          <div class="form-group"><label>Descripción</label><textarea id="pqr-body" placeholder="Describe tu petición, queja, reclamo o sugerencia con el mayor detalle posible..."></textarea></div>
          <button class="btn btn-primary btn-full" onclick="submitPQR()">Enviar PQR</button>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h2>Mis PQR Registradas</h2></div>
        <div class="card-body" style="padding:0">
          ${myPqr.length ? `<table>
            <thead><tr><th>Tipo</th><th>Asunto</th><th>Fecha</th><th>Estado</th></tr></thead>
            <tbody>
              ${myPqr.map(p => `<tr>
                <td><span class="badge badge-info">${pqrTypeName(p.type)}</span></td>
                <td>${p.subject}</td>
                <td>${fmtDate(p.date)}</td>
                <td>${statusBadge(p.status)}</td>
              </tr>`).join('')}
            </tbody>
          </table>` : `<div class="empty-state"><div class="empty-state-icon"><i class="ph ph-chat-circle-text"></i></div><p>No tienes PQR registradas.</p><p class="text-sm">Las PQR anónimas no aparecen aquí.</p></div>`}
        </div>
      </div>
    </div>`;
}

function toggleAnon() {
  const cb = document.getElementById('pqr-anon');
  const wrap = document.getElementById('anon-toggle');
  wrap.classList.toggle('active', cb.checked);
}

function submitPQR() {
  const anon = document.getElementById('pqr-anon').checked;
  const type = document.getElementById('pqr-type').value;
  const subject = document.getElementById('pqr-subject').value.trim();
  const body = document.getElementById('pqr-body').value.trim();
  if (!subject || !body) { showToast('Completa todos los campos', 'error'); return; }
  PQR.add({ userId: anon ? null : currentUser.id, anonymous: anon, type, subject, body, status: 'pendiente', date: today() });
  showToast('PQR enviada correctamente. RRHH la revisará pronto.', 'success');
  navigate('pqr');
}

/* ══════════════════════════════════════════════════════════
   INFORMACIÓN CORPORATIVA
══════════════════════════════════════════════════════════ */
function renderInformacion() {
  const docs = DB.get('documents');
  return `
    <div class="page-title">Información Corporativa</div>
    <div class="page-subtitle">Documentos oficiales de la empresa disponibles para todos los colaboradores.</div>
    <div class="grid-4">
      ${docs.map(d => `
        <div class="doc-card" onclick="downloadDoc('${d.name}')">
          <div class="doc-icon" style="background:${d.color};color:${d.iconColor}"><i class="ph ${d.icon}"></i></div>
          <div class="doc-name">${d.name}</div>
          <div class="doc-type">${d.desc}</div>
          <span class="badge badge-info"><i class="ph ph-download-simple"></i> ${d.type}</span>
        </div>`).join('')}
    </div>`;
}

function downloadDoc(name) {
  const content = `DOCUMENTO CORPORATIVO
======================================
PULSO S.A.S.
NIT: 900.123.456-7

Documento: ${name}
Fecha de consulta: ${new Date().toLocaleDateString('es-CO')}

Este es un documento simulado generado por
el sistema de intranet PULSO.

En un entorno real, aquí se descargaría el
documento oficial correspondiente.

© 2026 PULSO S.A.S. Todos los derechos reservados.`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/ /g, '_')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Descargando: ${name}`, 'success');
}

/* ══════════════════════════════════════════════════════════
   PERFIL
══════════════════════════════════════════════════════════ */
function renderPerfil() {
  const u = currentUser;
  const allReqs = [
    ...Certificates.forUser(u.id).map(c => ({ type: 'Certificado', desc: certTypeName(c.type), date: c.date, status: c.status })),
    ...Requests.forUser(u.id).map(r => ({ type: reqTypeName(r.type), desc: r.description || r.destination, date: r.date, status: r.status })),
    ...Absences.forUser(u.id).map(a => ({ type: 'Ausencia', desc: absTypeName(a.type), date: a.date, status: a.status }))
  ].sort((a, b) => b.date.localeCompare(a.date));

  const profileDocs = [
    { key: 'doc_cedula',    label: 'Cédula de Ciudadanía', icon: 'ph-identification-card' },
    { key: 'doc_pasaporte', label: 'Pasaporte',             icon: 'ph-book-open'           },
    { key: 'doc_hoja_vida', label: 'Hoja de Vida',          icon: 'ph-file-text'           }
  ];

  return `
    <div class="page-title">Mi Perfil</div>

    <div class="profile-header">
      <div class="profile-avatar">${initials(u.name)}</div>
      <div class="profile-info">
        <h2>${u.name}</h2>
        <p>${u.cargo}</p>
        <span class="role-badge role-${u.role}" style="margin-top:8px;display:inline-block">${roleLabel(u.role)}</span>
      </div>
    </div>

    <div class="tabs" id="profile-tabs" style="margin-bottom:20px">
      <div class="tab active" onclick="switchTab('profile','datos',this)">Datos Personales</div>
      <div class="tab" onclick="switchTab('profile','documentos',this)">Documentos</div>
      <div class="tab" onclick="switchTab('profile','historial',this)">Historial</div>
    </div>

    <!-- TAB: DATOS PERSONALES -->
    <div id="profile-tab-datos">
      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <h2>Información Personal</h2>
            <button class="btn btn-outline btn-sm" onclick="editPersonalData()"><i class="ph ph-pencil-simple"></i> Editar</button>
          </div>
          <div class="card-body">
            <div class="profile-field"><span class="profile-field-label">Nombre completo</span><span class="profile-field-value">${u.name}</span></div>
            <div class="profile-field"><span class="profile-field-label">Cédula</span><span class="profile-field-value">${u.cedula || '—'}</span></div>
            <div class="profile-field"><span class="profile-field-label">Pasaporte</span><span class="profile-field-value">${u.pasaporte || '—'}</span></div>
            <div class="profile-field"><span class="profile-field-label">Correo corporativo</span><span class="profile-field-value">${u.email}</span></div>
            <div class="profile-field"><span class="profile-field-label">Correo personal</span><span class="profile-field-value">${u.correoPersonal || '—'}</span></div>
            <div class="profile-field"><span class="profile-field-label">Cargo</span><span class="profile-field-value">${u.cargo}</span></div>
            <div class="profile-field"><span class="profile-field-label">Fecha de nacimiento</span><span class="profile-field-value">${u.birthday ? fmtDate(u.birthday) : '—'}</span></div>
            <div class="profile-field"><span class="profile-field-label">Celular</span><span class="profile-field-value">${u.phone || '—'}</span></div>
            <div class="profile-field"><span class="profile-field-label">Dirección</span><span class="profile-field-value">${u.direccion || '—'}</span></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h2>Seguridad Social</h2></div>
          <div class="card-body">
            <div class="profile-field"><span class="profile-field-label">EPS</span><span class="profile-field-value">${u.eps || '—'}</span></div>
            <div class="profile-field"><span class="profile-field-label">Fondo de pensiones</span><span class="profile-field-value">${u.fondoPensiones || '—'}</span></div>
            <div class="profile-field"><span class="profile-field-label">Cesantías</span><span class="profile-field-value">${u.fondoCesantias || '—'}</span></div>
            <div class="profile-field"><span class="profile-field-label">Nombre de contacto</span><span class="profile-field-value">${u.nombreContacto || '—'}</span></div>
            <div class="profile-field"><span class="profile-field-label">Número de contacto</span><span class="profile-field-value">${u.numeroContacto || '—'}</span></div>
          </div>
          <div style="border-top:1px solid var(--border);padding:16px 22px 4px"><strong style="font-size:13px">Progreso de Formación</strong></div>
          <div class="card-body">
            <div class="mb-4">
              <div class="progress-label"><span>SST</span><span>${Progress.pct(u.id,'sst',DB.get('sst').modules)}%</span></div>
              <div class="progress-bar-wrap"><div class="progress-bar" style="width:${Progress.pct(u.id,'sst',DB.get('sst').modules)}%"></div></div>
            </div>
            <div>
              <div class="progress-label"><span>Ciberseguridad</span><span>${Progress.pct(u.id,'cyber',DB.get('cyber').modules)}%</span></div>
              <div class="progress-bar-wrap"><div class="progress-bar" style="width:${Progress.pct(u.id,'cyber',DB.get('cyber').modules)}%"></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB: DOCUMENTOS -->
    <div id="profile-tab-documentos" class="hidden">
      <div class="grid-3">
        ${profileDocs.map(d => {
          const saved = u[d.key] || null;
          return `
            <div class="profile-doc-card">
              <div class="profile-doc-icon"><i class="ph ${d.icon}"></i></div>
              <div class="profile-doc-name">${d.label}</div>
              ${saved
                ? `<div class="profile-doc-status attached"><i class="ph ph-check-circle"></i> ${saved}</div>
                   <button class="btn btn-outline btn-sm btn-full" onclick="uploadProfileDoc('${d.key}')">Reemplazar</button>`
                : `<div class="profile-doc-status empty">Sin adjuntar</div>
                   <button class="btn btn-primary btn-sm btn-full" onclick="uploadProfileDoc('${d.key}')"><i class="ph ph-upload-simple"></i> Adjuntar</button>`
              }
              <input type="file" id="doc-input-${d.key}" class="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onchange="onProfileDocAttached(this,'${d.key}')">
            </div>`;
        }).join('')}
      </div>
    </div>

    <!-- TAB: HISTORIAL -->
    <div id="profile-tab-historial" class="hidden">
      <div class="card">
        <div class="card-header"><h2>Historial de Solicitudes</h2></div>
        <div class="card-body" style="padding:0">
          ${allReqs.length ? `<div class="table-wrap"><table>
            <thead><tr><th>Tipo</th><th>Descripción</th><th>Fecha</th><th>Estado</th></tr></thead>
            <tbody>
              ${allReqs.map(r => `<tr>
                <td><span class="badge badge-gray">${r.type}</span></td>
                <td>${r.desc || '—'}</td>
                <td>${fmtDate(r.date)}</td>
                <td>${statusBadge(r.status)}</td>
              </tr>`).join('')}
            </tbody>
          </table></div>` : `<div class="empty-state"><div class="empty-state-icon"><i class="ph ph-folder-open"></i></div><p>No tienes solicitudes en tu historial.</p></div>`}
        </div>
      </div>
    </div>`;
}

function editPersonalData() {
  const u = currentUser;
  openModal('Editar Datos Personales', `
    <div class="form-row">
      <div class="form-group"><label>Cédula</label><input type="text" id="edit-cedula" value="${u.cedula||''}" placeholder="Número de cédula"></div>
      <div class="form-group"><label>Pasaporte</label><input type="text" id="edit-pasaporte" value="${u.pasaporte||''}" placeholder="Número de pasaporte"></div>
    </div>
    <div class="form-group"><label>Correo personal</label><input type="email" id="edit-correo-personal" value="${u.correoPersonal||''}" placeholder="correo@personal.com"></div>
    <div class="form-row">
      <div class="form-group"><label>Celular</label><input type="tel" id="edit-phone" value="${u.phone||''}" placeholder="+57 300 000 0000"></div>
      <div class="form-group"><label>Fecha de nacimiento</label><input type="date" id="edit-birthday" value="${u.birthday||''}"></div>
    </div>
    <div class="form-group"><label>Dirección</label><input type="text" id="edit-direccion" value="${u.direccion||''}" placeholder="Calle, ciudad"></div>
    <div class="cert-section-divider">Seguridad Social</div>
    <div class="form-group"><label>EPS</label><input type="text" id="edit-eps" value="${u.eps||''}" placeholder="Nombre de la EPS"></div>
    <div class="form-row">
      <div class="form-group"><label>Fondo de pensiones</label><input type="text" id="edit-pensiones" value="${u.fondoPensiones||''}" placeholder="Nombre del fondo"></div>
      <div class="form-group"><label>Cesantías</label><input type="text" id="edit-cesantias" value="${u.fondoCesantias||''}" placeholder="Nombre del fondo"></div>
    </div>
    <div class="cert-section-divider">Contacto de Emergencia</div>
    <div class="form-row">
      <div class="form-group"><label>Nombre</label><input type="text" id="edit-contacto-nombre" value="${u.nombreContacto||''}" placeholder="Nombre completo"></div>
      <div class="form-group"><label>Teléfono</label><input type="tel" id="edit-contacto-num" value="${u.numeroContacto||''}" placeholder="+57 300 000 0000"></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="savePersonalData()">Guardar Cambios</button>
    </div>`);
}

function savePersonalData() {
  const updates = {
    cedula:         document.getElementById('edit-cedula').value.trim() || null,
    pasaporte:      document.getElementById('edit-pasaporte').value.trim() || null,
    correoPersonal: document.getElementById('edit-correo-personal').value.trim() || null,
    phone:          document.getElementById('edit-phone').value.trim(),
    birthday:       document.getElementById('edit-birthday').value || null,
    direccion:      document.getElementById('edit-direccion').value.trim() || null,
    eps:            document.getElementById('edit-eps').value.trim() || null,
    fondoPensiones: document.getElementById('edit-pensiones').value.trim() || null,
    fondoCesantias: document.getElementById('edit-cesantias').value.trim() || null,
    nombreContacto: document.getElementById('edit-contacto-nombre').value.trim() || null,
    numeroContacto: document.getElementById('edit-contacto-num').value.trim() || null
  };
  Users.update(currentUser.id, updates);
  currentUser = { ...currentUser, ...updates };
  Session.set(currentUser);
  closeModal();
  showToast('Datos actualizados correctamente', 'success');
  navigate('perfil');
}

function uploadProfileDoc(docKey) {
  document.getElementById('doc-input-' + docKey).click();
}

function onProfileDocAttached(input, docKey) {
  const file = input.files[0];
  if (!file) return;
  Users.update(currentUser.id, { [docKey]: file.name });
  currentUser = { ...currentUser, [docKey]: file.name };
  Session.set(currentUser);
  showToast('Documento adjuntado correctamente', 'success');
  navigate('perfil');
  setTimeout(() => {
    const tabs = document.querySelectorAll('#profile-tabs .tab');
    if (tabs.length >= 2) switchTab('profile', 'documentos', tabs[1]);
  }, 60);
}

/* keep editContact as alias for backward compatibility */
function editContact() { editPersonalData(); }
function saveContact()  { savePersonalData(); }

/* ══════════════════════════════════════════════════════════
   APROBACIONES
══════════════════════════════════════════════════════════ */
function renderAprobaciones() {
  if (!isAdmin(currentUser.role)) return '<div class="empty-state"><p>Sin acceso.</p></div>';

  const toApprove = getPendingForApproval();
  const toInfo    = getPendingForInfo();

  function itemCard(item, canApprove) {
    const user   = Users.find(item.userId);
    const cat    = item.category;
    const icons  = { certificado: 'ph-file-text', solicitud: 'ph-clipboard-text', ausencia: 'ph-calendar-blank' };
    const icon   = `<i class="ph ${icons[cat] || 'ph-push-pin'}"></i>`;

    let detail = '';
    if (cat === 'certificado') {
      detail = certTypeName(item.type)
        + (item.cesantiasMotivo ? ` · ${cesantiasMotivoName(item.cesantiasMotivo)}` : '')
        + (item.dirigida        ? ` · ${certDirigidaLabel(item.dirigida, item.dirigidaNombre)}` : '');
    } else if (cat === 'solicitud') {
      if (item.type === 'materiales') detail = `Materiales · ${item.items || item.description || ''} (x${item.qty || '?'}) · Recogida: ${item.pickupDate ? fmtDate(item.pickupDate) : '—'}`;
      else detail = `Viaje · ${item.codigoProyecto || ''} · ${item.destination || ''} · ${fmtDate(item.startDate)} → ${fmtDate(item.endDate)}`;
    } else if (cat === 'ausencia') {
      detail = `${absTypeName(item.type)} · ${fmtDateShort(item.startDate)} → ${fmtDateShort(item.endDate)} · ${item.days} día(s)`;
    }

    const docBadge = item.docRespaldo ? `<span class="aprov-doc-badge"><i class="ph ph-paperclip"></i> ${item.docRespaldo}</span>` : '';

    return `
      <div class="aprov-item">
        <div class="aprov-icon">${icon}</div>
        <div class="aprov-body">
          <div class="aprov-name">${user ? user.name : '—'} <span class="aprov-cat-badge aprov-cat-${cat}">${cat}</span></div>
          <div class="aprov-detail">${detail}</div>
          ${docBadge}
        </div>
        <div class="aprov-meta">
          <span class="aprov-date">${fmtDate(item.date)}</span>
          ${canApprove ? `
            <div class="aprov-actions">
              <button class="btn btn-success btn-sm" onclick="aprovAction('${cat}',${item.id},'approved')">✓ Aprobar</button>
              <button class="btn btn-danger btn-sm"  onclick="aprovAction('${cat}',${item.id},'rejected')">✗ Rechazar</button>
            </div>` : `<span class="badge badge-gray" style="font-size:10px">Informativo</span>`}
        </div>
      </div>`;
  }

  return `
    <div class="page-title">Aprobaciones</div>
    <div class="page-subtitle">Solicitudes pendientes que requieren tu acción o están para tu conocimiento.</div>

    <div class="aprov-section">
      <div class="aprov-section-header aprov-header-approve">
        <span>✅ Para tu aprobación</span>
        <span class="aprov-count">${toApprove.length}</span>
      </div>
      ${toApprove.length
        ? toApprove.sort((a,b) => b.date.localeCompare(a.date)).map(i => itemCard(i, true)).join('')
        : `<div class="aprov-empty">¡Todo al día! No hay solicitudes pendientes de tu aprobación.</div>`}
    </div>

    <div class="aprov-section" style="margin-top:24px">
      <div class="aprov-section-header aprov-header-info">
        <span>ℹ️ Para tu información</span>
        <span class="aprov-count">${toInfo.length}</span>
      </div>
      ${toInfo.length
        ? toInfo.sort((a,b) => b.date.localeCompare(a.date)).map(i => itemCard(i, false)).join('')
        : `<div class="aprov-empty">Sin solicitudes informativas pendientes.</div>`}
    </div>`;
}

function aprovAction(cat, id, newStatus) {
  if (newStatus === 'rejected') {
    openModal('Motivo de rechazo', `
      <div class="form-group">
        <label>Motivo <span class="text-muted">(opcional)</span></label>
        <textarea id="aprov-reject-reason" placeholder="Explica brevemente el motivo del rechazo..."></textarea>
      </div>
      <div class="modal-footer">
        <button class="btn btn-danger" onclick="confirmAprovReject('${cat}',${id})">Confirmar rechazo</button>
        <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      </div>`);
    return;
  }
  const data = { status: 'approved', approvedBy: currentUser.name, approvedDate: today() };
  applyAprovUpdate(cat, id, data);
  showToast('Solicitud aprobada ✓', 'success');
  updateAprovBadge();
  navigate('aprobaciones');
}

function confirmAprovReject(cat, id) {
  const reason = document.getElementById('aprov-reject-reason').value.trim() || 'Sin motivo especificado';
  applyAprovUpdate(cat, id, { status: 'rejected', approvedBy: currentUser.name, approvedDate: today(), rejectReason: reason });
  closeModal();
  showToast('Solicitud rechazada', 'error');
  updateAprovBadge();
  navigate('aprobaciones');
}

function applyAprovUpdate(cat, id, data) {
  if (cat === 'certificado') Certificates.update(id, data);
  else if (cat === 'solicitud') Requests.update(id, data);
  else if (cat === 'ausencia')  Absences.update(id, data);
}

/* ══════════════════════════════════════════════════════════
   ADMIN
══════════════════════════════════════════════════════════ */
function renderAdmin() {
  if (!isAdmin(currentUser.role)) return '<div class="empty-state"><p>Sin acceso.</p></div>';

  const pendCerts = Certificates.pending();
  const pendReqs = Requests.pending();
  const pendAbs = Absences.pending();
  const pendPqr = PQR.all().filter(p => p.status === 'pendiente');
  const users = Users.all();
  const now = new Date();
  const birthdays = users.filter(u => {
    if (!u.birthday) return false;
    const bd = new Date(u.birthday + 'T12:00:00');
    return bd.getMonth() === now.getMonth();
  });

  const totalPend = pendCerts.length + pendReqs.length + pendAbs.length;

  return `
    <div class="page-title">Panel de Administración</div>
    <div class="page-subtitle">Gestiona solicitudes, usuarios y comunicaciones internas.</div>

    <div class="grid-4 mb-4">
      <div class="stat-card"><div class="stat-icon stat-icon-yellow"><i class="ph ph-hourglass"></i></div><div><div class="stat-num">${totalPend}</div><div class="stat-label">Pendientes</div></div></div>
      <div class="stat-card"><div class="stat-icon stat-icon-blue"><i class="ph ph-users"></i></div><div><div class="stat-num">${users.filter(u=>u.active).length}</div><div class="stat-label">Usuarios activos</div></div></div>
      <div class="stat-card"><div class="stat-icon stat-icon-green"><i class="ph ph-megaphone"></i></div><div><div class="stat-num">${Announcements.all().length}</div><div class="stat-label">Anuncios publicados</div></div></div>
      <div class="stat-card"><div class="stat-icon stat-icon-purple"><i class="ph ph-cake"></i></div><div><div class="stat-num">${birthdays.length}</div><div class="stat-label">Cumpleaños este mes</div></div></div>
    </div>

    <div class="admin-tabs tabs">
      <div class="tab active" onclick="switchTab('adm','solicitudes',this)">Solicitudes (${totalPend})</div>
      <div class="tab" onclick="switchTab('adm','usuarios',this)">Usuarios</div>
      <div class="tab" onclick="switchTab('adm','pqr',this)">PQR (${pendPqr.length})</div>
      <div class="tab" onclick="switchTab('adm','cumples',this)">Cumpleaños</div>
    </div>

    <!-- SOLICITUDES PENDIENTES -->
    <div id="adm-tab-solicitudes">
      ${renderAdminSolicitudes(pendCerts, pendReqs, pendAbs)}
    </div>

    <!-- USUARIOS -->
    <div id="adm-tab-usuarios" class="hidden">
      <div class="card">
        <div class="card-header"><h2>Gestión de Usuarios</h2></div>
        <div class="card-body" style="padding:0">
          <table>
            <thead><tr><th>Nombre</th><th>Email</th><th>Cargo</th><th>Área</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              ${users.map(u => `<tr>
                <td><strong>${u.name}</strong></td>
                <td>${u.email}</td>
                <td>${u.cargo}</td>
                <td>${u.area}</td>
                <td><span class="role-badge role-${u.role}" style="background:#e2e8f0;color:#475569">${roleLabel(u.role)}</span></td>
                <td>${u.active ? '<span class="badge badge-approved">Activo</span>' : '<span class="badge badge-rejected">Inactivo</span>'}</td>
                <td>${u.id !== currentUser.id ? `<button class="btn ${u.active?'btn-warning':'btn-success'} btn-sm" onclick="toggleUser(${u.id})">${u.active?'Desactivar':'Activar'}</button>` : '<span class="text-muted text-sm">—</span>'}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- PQR -->
    <div id="adm-tab-pqr" class="hidden">
      <div class="card">
        <div class="card-header"><h2>PQR Recibidas</h2></div>
        <div class="card-body" style="padding:0">
          ${PQR.all().length ? `<table>
            <thead><tr><th>Tipo</th><th>Asunto</th><th>Remitente</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              ${PQR.all().sort((a,b)=>b.date.localeCompare(a.date)).map(p => {
                const user = p.anonymous ? null : Users.find(p.userId);
                return `<tr>
                  <td><span class="badge badge-info">${pqrTypeName(p.type)}</span></td>
                  <td>${p.subject}</td>
                  <td>${p.anonymous ? '<span class="badge badge-gray"><i class="ph ph-lock-simple"></i> Anónimo</span>' : (user ? user.name : '—')}</td>
                  <td>${fmtDate(p.date)}</td>
                  <td>${statusBadge(p.status)}</td>
                  <td class="td-actions">
                    <button class="btn btn-outline btn-sm" onclick="viewPqr(${p.id})">Ver</button>
                    ${p.status === 'pendiente' ? `<button class="btn btn-success btn-sm" onclick="updatePqrStatus(${p.id},'en_revision')">Revisar</button>` : ''}
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>` : `<div class="empty-state"><div class="empty-state-icon"><i class="ph ph-chat-circle-text"></i></div><p>No hay PQR registradas.</p></div>`}
        </div>
      </div>
    </div>

    <!-- CUMPLEAÑOS -->
    <div id="adm-tab-cumples" class="hidden">
      <div class="card">
        <div class="card-header"><h2><i class="ph ph-cake"></i> Cumpleaños del Mes</h2></div>
        <div class="card-body">
          ${birthdays.length ? birthdays.sort((a,b)=>new Date(a.birthday).getDate()-new Date(b.birthday).getDate()).map(u => `
            <div class="birthday-item">
              <div class="birthday-avatar">${initials(u.name)}</div>
              <div>
                <div class="font-semibold">${u.name}</div>
                <div class="text-sm text-muted">${u.cargo} · ${new Date(u.birthday+'T12:00:00').toLocaleDateString('es-CO',{day:'2-digit',month:'long'})}</div>
              </div>
            </div>`).join('') : `<div class="empty-state"><div class="empty-state-icon"><i class="ph ph-cake"></i></div><p>No hay cumpleaños este mes.</p></div>`}
        </div>
      </div>
    </div>`;
}

/* ── Routing de aprobaciones ───────────────────────────── */
// Retorna el rol que aprueba un item dado su categoría y tipo
function getApproveRole(category, type) {
  if (category === 'certificado') return 'admin_rrhh';
  if (category === 'solicitud') {
    if (type === 'materiales') return 'admin_adm';
    if (type === 'viaje')      return 'admin_gerente';
  }
  if (category === 'ausencia') {
    if (['vacaciones','dia_naranja','licencia_no_remunerada','otras_licencias'].includes(type)) return 'admin_rrhh';
    if (type === 'incapacidad') return 'admin_adm';
  }
  return null;
}

// Retorna los roles que tienen visibilidad informativa
function getInfoRoles(category, type) {
  if (category === 'certificado') return [];
  if (category === 'solicitud') {
    if (type === 'materiales') return ['admin_gerente','admin_legal'];
    if (type === 'viaje')      return ['admin_adm','admin_legal'];
  }
  if (category === 'ausencia') {
    if (['vacaciones','dia_naranja','licencia_no_remunerada','otras_licencias'].includes(type)) return ['admin_ops','admin_gerente'];
    if (type === 'incapacidad') return ['admin_rrhh','admin_gerente'];
  }
  return [];
}

// Compatibilidad con funciones anteriores de solicitudes
function reqApproveRole(type) { return getApproveRole('solicitud', type); }
function reqVisibleTo(type) {
  const approveRole = getApproveRole('solicitud', type);
  const infoRoles   = getInfoRoles('solicitud', type);
  return approveRole ? [approveRole, ...infoRoles] : infoRoles;
}

// Todos los items pending que el usuario actual debe aprobar
function getPendingForApproval() {
  const role = currentUser.role;
  const items = [
    ...Certificates.pending().map(c  => ({ ...c,  category: 'certificado' })),
    ...Requests.all().filter(r => r.status === 'pending').map(r => ({ ...r, category: 'solicitud' })),
    ...Absences.all().filter(a => a.status === 'pending').map(a => ({ ...a, category: 'ausencia' }))
  ];
  return items.filter(i => getApproveRole(i.category, i.type) === role);
}

// Todos los items pending que el usuario actual ve como informativo
function getPendingForInfo() {
  const role = currentUser.role;
  const items = [
    ...Certificates.pending().map(c  => ({ ...c,  category: 'certificado' })),
    ...Requests.all().filter(r => r.status === 'pending').map(r => ({ ...r, category: 'solicitud' })),
    ...Absences.all().filter(a => a.status === 'pending').map(a => ({ ...a, category: 'ausencia' }))
  ];
  return items.filter(i => getInfoRoles(i.category, i.type).includes(role));
}

function renderAdminSolicitudes(pendCerts, pendReqs, pendAbs) {
  // Filter requests: each admin only sees their assigned types
  const visibleReqs = pendReqs.filter(r => {
    const roles = reqVisibleTo(r.type);
    return !roles || roles.includes(currentUser.role);
  });

  const allPending = [
    ...pendCerts.map(c => ({
      ...c, category: 'certificado',
      label: certTypeName(c.type) + (c.cesantiasMotivo ? ' — ' + cesantiasMotivoName(c.cesantiasMotivo) : '') + (c.dirigida ? ' — ' + certDirigidaLabel(c.dirigida, c.dirigidaNombre) : '')
    })),
    ...visibleReqs.map(r => ({ ...r, category: 'solicitud', label: reqTypeName(r.type) + ': ' + (r.items || r.destination || r.description || '') })),
    ...pendAbs.map(a => ({ ...a, category: 'ausencia', label: absTypeName(a.type) }))
  ].sort((a, b) => b.date.localeCompare(a.date));

  if (!allPending.length) return `<div class="card"><div class="card-body"><div class="empty-state"><div class="empty-state-icon"><i class="ph ph-check-circle"></i></div><p>No hay solicitudes pendientes. ¡Todo al día!</p></div></div></div>`;

  return `<div class="card">
    <div class="card-header"><h2>Solicitudes Pendientes de Aprobación</h2></div>
    <div class="card-body" style="padding:0">
      <table>
        <thead><tr><th>Categoría</th><th>Colaborador</th><th>Detalle</th><th>Fecha</th><th>Acciones</th></tr></thead>
        <tbody>
          ${allPending.map(item => {
            const user = Users.find(item.userId);
            const isCes = item.category === 'certificado' && item.type === 'cesantias';
            return `<tr>
              <td>
                <span class="badge badge-pending">${item.category}</span>
                ${isCes ? '<span class="badge badge-info" style="margin-top:3px;display:block">Cesantías</span>' : ''}
              </td>
              <td>${user ? user.name : '—'}</td>
              <td>
                <div style="font-size:13px">${item.label.substring(0, 60)}</div>
                ${isCes && item.docRespaldo ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px"><i class="ph ph-paperclip"></i> ${item.docRespaldo}</div>` : ''}
              </td>
              <td>${fmtDate(item.date)}</td>
              <td class="td-actions">
                ${isCes ? `<button class="btn btn-outline btn-sm" onclick="viewCertDetail(${item.id})">Ver detalle</button>` : ''}
                ${item.category === 'solicitud' ? `<button class="btn btn-outline btn-sm" onclick="viewReqDetail(${item.id})">Ver detalle</button>` : ''}
                ${canAdminApproveItem(item) ? `
                  <button class="btn btn-success btn-sm" onclick="adminApprove('${item.category}',${item.id})">✓ Aprobar</button>
                  <button class="btn btn-danger btn-sm" onclick="adminReject('${item.category}',${item.id})">✗ Rechazar</button>
                ` : (item.category === 'solicitud' ? `<span class="badge badge-gray" style="font-size:10px">Solo visibilidad</span>` : `
                  <button class="btn btn-success btn-sm" onclick="adminApprove('${item.category}',${item.id})">✓ Aprobar</button>
                  <button class="btn btn-danger btn-sm" onclick="adminReject('${item.category}',${item.id})">✗ Rechazar</button>
                `)}
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

function viewCertDetail(id) {
  const c    = Certificates.all().find(x => x.id === id);
  const user = Users.find(c.userId);
  if (!c || !user) return;
  openModal('Detalle — Certificado de Cesantías', `
    <div class="profile-field"><span class="profile-field-label">Colaborador</span><span>${user.name}</span></div>
    <div class="profile-field"><span class="profile-field-label">Cargo</span><span>${user.cargo}</span></div>
    <div class="profile-field"><span class="profile-field-label">Fecha solicitud</span><span>${fmtDate(c.date)}</span></div>
    <div class="profile-field"><span class="profile-field-label">Motivo de retiro</span><span>${cesantiasMotivoName(c.cesantiasMotivo)}</span></div>
    <div class="profile-field"><span class="profile-field-label">Documento adjunto</span><span>${c.docRespaldo ? '<i class="ph ph-paperclip"></i> ' + c.docRespaldo : '—'}</span></div>
    ${c.dirigida ? `<div class="profile-field"><span class="profile-field-label">Dirigida a</span><span>${certDirigidaLabel(c.dirigida, c.dirigidaNombre)}</span></div>` : ''}
    ${c.obs ? `<div class="form-group mt-3"><label>Observaciones</label><div style="background:#f8fafc;padding:12px;border-radius:6px;font-size:13px;border:1px solid var(--border)">${c.obs}</div></div>` : ''}
    <div class="modal-footer" style="margin-top:16px">
      <button class="btn btn-success" onclick="adminApprove('certificado',${c.id});closeModal()">✓ Aprobar</button>
      <button class="btn btn-danger"  onclick="adminReject('certificado',${c.id})">✗ Rechazar</button>
      <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
    </div>`);
}

function canAdminApproveItem(item) {
  if (item.category === 'solicitud') return currentUser.role === reqApproveRole(item.type);
  if (item.category === 'certificado') return currentUser.role === 'admin_rrhh';
  if (item.category === 'ausencia')    return currentUser.role === 'admin_rrhh' || currentUser.role === 'admin_ops';
  return isAdmin(currentUser.role);
}

function viewReqDetail(id) {
  const r    = Requests.all().find(x => x.id === id);
  const user = Users.find(r.userId);
  if (!r || !user) return;
  const canApprove = currentUser.role === reqApproveRole(r.type);
  const body = r.type === 'materiales' ? `
    <div class="profile-field"><span class="profile-field-label">Colaborador</span><span>${user.name}</span></div>
    <div class="profile-field"><span class="profile-field-label">Materiales</span><span>${r.items || r.description || '—'}</span></div>
    <div class="profile-field"><span class="profile-field-label">Cantidad</span><span>${r.qty || '—'}</span></div>
    <div class="profile-field"><span class="profile-field-label">Fecha de recogida</span><span>${r.pickupDate ? fmtDate(r.pickupDate) : '—'}</span></div>
    <div class="profile-field"><span class="profile-field-label">Fecha de regreso</span><span>${r.returnDate ? fmtDate(r.returnDate) : '—'}</span></div>
    <div class="profile-field"><span class="profile-field-label">Solicitado</span><span>${fmtDate(r.date)}</span></div>` : `
    <div class="profile-field"><span class="profile-field-label">Colaborador</span><span>${user.name}</span></div>
    <div class="profile-field"><span class="profile-field-label">Código proyecto</span><span>${r.codigoProyecto || '—'}</span></div>
    <div class="profile-field"><span class="profile-field-label">Destino</span><span>${r.destination || '—'}</span></div>
    <div class="profile-field"><span class="profile-field-label">Salida</span><span>${fmtDate(r.startDate)}${r.horarioSalida ? ' · ' + r.horarioSalida : ''}</span></div>
    <div class="profile-field"><span class="profile-field-label">Regreso</span><span>${fmtDate(r.endDate)}${r.horarioRegreso ? ' · ' + r.horarioRegreso : ''}</span></div>
    <div class="profile-field"><span class="profile-field-label">Hotel</span><span>${r.hotel ? 'Sí' + (r.zonaHotel ? ' — ' + r.zonaHotel : '') : 'No'}</span></div>
    <div class="profile-field"><span class="profile-field-label">N° viajeros</span><span>${r.travelers || '—'}</span></div>
    <div class="profile-field"><span class="profile-field-label">Costos</span><span>${r.costOwner === 'haptica' ? 'Háptica' : 'Cliente'}</span></div>
    <div class="profile-field"><span class="profile-field-label">Solicitado</span><span>${fmtDate(r.date)}</span></div>`;
  openModal(`Detalle — Solicitud de ${reqTypeName(r.type)}`, body + `
    <div class="modal-footer" style="margin-top:16px">
      ${canApprove ? `
        <button class="btn btn-success" onclick="adminApprove('solicitud',${r.id});closeModal()">✓ Aprobar</button>
        <button class="btn btn-danger" onclick="adminReject('solicitud',${r.id})">✗ Rechazar</button>` : ''}
      <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
    </div>`);
}

function adminApprove(cat, id) {
  const data = { status: 'approved', approvedBy: currentUser.name, approvedDate: today() };
  if (cat === 'certificado') Certificates.update(id, data);
  else if (cat === 'solicitud') Requests.update(id, data);
  else if (cat === 'ausencia') Absences.update(id, data);
  showToast('Solicitud aprobada correctamente', 'success');
  navigate('admin');
}

function adminReject(cat, id) {
  openModal('Rechazar Solicitud', `
    <p class="mb-4 text-muted">Ingresa el motivo del rechazo para notificar al colaborador:</p>
    <div class="form-group"><textarea id="reject-reason" placeholder="Motivo del rechazo..."></textarea></div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-danger" onclick="confirmReject('${cat}',${id})">Confirmar Rechazo</button>
    </div>`);
}

function confirmReject(cat, id) {
  const reason = document.getElementById('reject-reason').value.trim() || 'Sin motivo especificado';
  const data = { status: 'rejected', approvedBy: currentUser.name, approvedDate: today(), rejectReason: reason };
  if (cat === 'certificado') Certificates.update(id, data);
  else if (cat === 'solicitud') Requests.update(id, data);
  else if (cat === 'ausencia') Absences.update(id, data);
  closeModal();
  showToast('Solicitud rechazada', 'error');
  navigate('admin');
}

function toggleUser(id) {
  const u = Users.find(id);
  if (!u) return;
  Users.update(id, { active: !u.active });
  showToast(`Usuario ${u.active ? 'desactivado' : 'activado'}`, 'success');
  navigate('admin');
}

function viewPqr(id) {
  const p = PQR.all().find(x => x.id === id);
  if (!p) return;
  const user = p.anonymous ? null : Users.find(p.userId);
  openModal(`PQR: ${p.subject}`, `
    <div class="profile-field"><span class="profile-field-label">Tipo</span><span>${pqrTypeName(p.type)}</span></div>
    <div class="profile-field"><span class="profile-field-label">Remitente</span><span>${p.anonymous ? '🔒 Anónimo' : (user ? user.name : '—')}</span></div>
    <div class="profile-field"><span class="profile-field-label">Fecha</span><span>${fmtDate(p.date)}</span></div>
    <div class="profile-field"><span class="profile-field-label">Estado</span>${statusBadge(p.status)}</div>
    <div class="form-group mt-3"><label>Descripción</label>
      <div style="background:#f8fafc;padding:14px;border-radius:6px;font-size:13px;line-height:1.6;border:1px solid var(--border)">${p.body}</div>
    </div>
    <div class="modal-footer"><button class="btn btn-primary" onclick="closeModal()">Cerrar</button></div>`);
}

function updatePqrStatus(id, status) {
  PQR.update(id, { status });
  showToast('Estado actualizado', 'success');
  navigate('admin');
}

/* ══════════════════════════════════════════════════════════
   UTILS
══════════════════════════════════════════════════════════ */
function switchTab(prefix, tab, el) {
  document.querySelectorAll(`[id^="${prefix}-tab-"]`).forEach(t => t.classList.add('hidden'));
  document.getElementById(`${prefix}-tab-${tab}`).classList.remove('hidden');
  if (el) el.closest('.tabs').querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
}

function openModal(title, body) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = body;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (type ? ' toast-' + type : '');
  t.classList.remove('hidden');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add('hidden'), 3500);
}

function bindEvents(view) {
  // Set min date for date inputs
  setTimeout(() => {
    document.querySelectorAll('input[type="date"]').forEach(el => {
      if (!el.min) el.min = today();
    });
  }, 50);
}

// Close modal on overlay click
document.getElementById('modal-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
