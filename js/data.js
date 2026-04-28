/* ═══════════════════════════════════════════════════════
   PULSO - Data Layer & localStorage Management
   ═══════════════════════════════════════════════════════ */

const SEED_VERSION = 4;

const SEED = {
  users: [
    { id:  1, name: 'Angélica Flechas',         email: 'angelica@haptica.co',           password: 'Haptica123', role: 'colaborador',   cargo: 'Gerente General',                     area: 'Gerencia',                ingreso: '2020-01-01', phone: '', active: true, birthday: null, cedula: null, pasaporte: null, correoPersonal: null, direccion: null, eps: null, fondoPensiones: null, fondoCesantias: null, nombreContacto: null, numeroContacto: null, doc_cedula: null, doc_pasaporte: null, doc_hoja_vida: null },
    { id:  2, name: 'Santiago Castillo',         email: 'santiago.castillo@haptica.co',  password: 'Haptica123', role: 'admin_gerente', cargo: 'Gerente Ejecutivo',                   area: 'Gerencia',                ingreso: '2020-01-01', phone: '', active: true, birthday: null, cedula: null, pasaporte: null, correoPersonal: null, direccion: null, eps: null, fondoPensiones: null, fondoCesantias: null, nombreContacto: null, numeroContacto: null, doc_cedula: null, doc_pasaporte: null, doc_hoja_vida: null },
    { id:  3, name: 'María Camila Venegas',      email: 'mariacamila@haptica.co',        password: 'Haptica123', role: 'admin_ops',     cargo: 'Directora de Operaciones',            area: 'Operaciones',             ingreso: '2020-01-01', phone: '', active: true, birthday: null, cedula: null, pasaporte: null, correoPersonal: null, direccion: null, eps: null, fondoPensiones: null, fondoCesantias: null, nombreContacto: null, numeroContacto: null, doc_cedula: null, doc_pasaporte: null, doc_hoja_vida: null },
    { id:  4, name: 'Daniel Pinilla',            email: 'daniel@haptica.co',             password: 'Haptica123', role: 'colaborador',   cargo: 'Director de Proyecto y Estrategia',   area: 'Proyecto y Estrategia',   ingreso: '2020-01-01', phone: '', active: true, birthday: null, cedula: null, pasaporte: null, correoPersonal: null, direccion: null, eps: null, fondoPensiones: null, fondoCesantias: null, nombreContacto: null, numeroContacto: null, doc_cedula: null, doc_pasaporte: null, doc_hoja_vida: null },
    { id:  5, name: 'María Alejandra Corrales',  email: 'mariaalejandra@haptica.co',     password: 'Haptica123', role: 'colaborador',   cargo: 'Director de Proyecto y Estrategia',   area: 'Proyecto y Estrategia',   ingreso: '2020-01-01', phone: '', active: true, birthday: null, cedula: null, pasaporte: null, correoPersonal: null, direccion: null, eps: null, fondoPensiones: null, fondoCesantias: null, nombreContacto: null, numeroContacto: null, doc_cedula: null, doc_pasaporte: null, doc_hoja_vida: null },
    { id:  6, name: 'Camilo Niño',              email: 'camilo.nino@haptica.co',        password: 'Haptica123', role: 'colaborador',   cargo: 'Líder de Proyecto y Estrategia',      area: 'Proyecto y Estrategia',   ingreso: '2020-01-01', phone: '', active: true, birthday: null, cedula: null, pasaporte: null, correoPersonal: null, direccion: null, eps: null, fondoPensiones: null, fondoCesantias: null, nombreContacto: null, numeroContacto: null, doc_cedula: null, doc_pasaporte: null, doc_hoja_vida: null },
    { id:  7, name: 'Azul Cardona',             email: 'azul.cardona@haptica.co',       password: 'Haptica123', role: 'colaborador',   cargo: 'Director de Estrategia e Innovación', area: 'Estrategia e Innovación', ingreso: '2020-01-01', phone: '', active: true, birthday: null, cedula: null, pasaporte: null, correoPersonal: null, direccion: null, eps: null, fondoPensiones: null, fondoCesantias: null, nombreContacto: null, numeroContacto: null, doc_cedula: null, doc_pasaporte: null, doc_hoja_vida: null },
    { id:  8, name: 'Stiben Ibarra',            email: 'stiben.ibarra@haptica.co',      password: 'Haptica123', role: 'colaborador',   cargo: 'Líder de Proyecto y Estrategia',      area: 'Proyecto y Estrategia',   ingreso: '2020-01-01', phone: '', active: true, birthday: null, cedula: null, pasaporte: null, correoPersonal: null, direccion: null, eps: null, fondoPensiones: null, fondoCesantias: null, nombreContacto: null, numeroContacto: null, doc_cedula: null, doc_pasaporte: null, doc_hoja_vida: null },
    { id:  9, name: 'María Alejandra Mariño',   email: 'maria.marino@haptica.co',       password: 'Haptica123', role: 'colaborador',   cargo: 'Líder de Proyecto y Estrategia',      area: 'Proyecto y Estrategia',   ingreso: '2020-01-01', phone: '', active: true, birthday: null, cedula: null, pasaporte: null, correoPersonal: null, direccion: null, eps: null, fondoPensiones: null, fondoCesantias: null, nombreContacto: null, numeroContacto: null, doc_cedula: null, doc_pasaporte: null, doc_hoja_vida: null },
    { id: 10, name: 'Ana Roa',                  email: 'ana.roa@haptica.co',            password: 'Haptica123', role: 'colaborador',   cargo: 'Líder de Proyecto y Estrategia',      area: 'Proyecto y Estrategia',   ingreso: '2020-01-01', phone: '', active: true, birthday: null, cedula: null, pasaporte: null, correoPersonal: null, direccion: null, eps: null, fondoPensiones: null, fondoCesantias: null, nombreContacto: null, numeroContacto: null, doc_cedula: null, doc_pasaporte: null, doc_hoja_vida: null },
    { id: 11, name: 'María Fernanda Martínez',  email: 'maria.martinez@haptica.co',     password: 'Haptica123', role: 'colaborador',   cargo: 'Líder de Proyecto y Estrategia',      area: 'Proyecto y Estrategia',   ingreso: '2020-01-01', phone: '', active: true, birthday: null, cedula: null, pasaporte: null, correoPersonal: null, direccion: null, eps: null, fondoPensiones: null, fondoCesantias: null, nombreContacto: null, numeroContacto: null, doc_cedula: null, doc_pasaporte: null, doc_hoja_vida: null },
    { id: 12, name: 'Jhojann Rodríguez',        email: 'jhojann.rodriguez@haptica.co',  password: 'Haptica123', role: 'colaborador',   cargo: 'Diseñador Visual de Proyectos',       area: 'Diseño',                  ingreso: '2020-01-01', phone: '', active: true, birthday: null, cedula: null, pasaporte: null, correoPersonal: null, direccion: null, eps: null, fondoPensiones: null, fondoCesantias: null, nombreContacto: null, numeroContacto: null, doc_cedula: null, doc_pasaporte: null, doc_hoja_vida: null },
    { id: 13, name: 'Kevin Barbosa',            email: 'kevin.barbosa@haptica.co',      password: 'Haptica123', role: 'colaborador',   cargo: 'Diseñador Visual de Proyectos',       area: 'Diseño',                  ingreso: '2020-01-01', phone: '', active: true, birthday: null, cedula: null, pasaporte: null, correoPersonal: null, direccion: null, eps: null, fondoPensiones: null, fondoCesantias: null, nombreContacto: null, numeroContacto: null, doc_cedula: null, doc_pasaporte: null, doc_hoja_vida: null },
    { id: 14, name: 'Julián Gaitán',            email: 'julian.gaitan@haptica.co',      password: 'Haptica123', role: 'colaborador',   cargo: 'Consultor de Proyecto y Estrategia',  area: 'Proyecto y Estrategia',   ingreso: '2020-01-01', phone: '', active: true, birthday: null, cedula: null, pasaporte: null, correoPersonal: null, direccion: null, eps: null, fondoPensiones: null, fondoCesantias: null, nombreContacto: null, numeroContacto: null, doc_cedula: null, doc_pasaporte: null, doc_hoja_vida: null },
    { id: 15, name: 'Geovanny Sánchez',         email: 'contabilidad@haptica.co',       password: 'Haptica123', role: 'colaborador',   cargo: 'Contador',                            area: 'Administrativa',          ingreso: '2020-01-01', phone: '', active: true, birthday: null, cedula: null, pasaporte: null, correoPersonal: null, direccion: null, eps: null, fondoPensiones: null, fondoCesantias: null, nombreContacto: null, numeroContacto: null, doc_cedula: null, doc_pasaporte: null, doc_hoja_vida: null },
    { id: 16, name: 'Svetlana Kahuazango',      email: 'maka@haptica.co',               password: 'Haptica123', role: 'admin_legal',   cargo: 'Directora Legal y Administrativa',    area: 'Legal y Administrativa',  ingreso: '2020-01-01', phone: '', active: true, birthday: null, cedula: null, pasaporte: null, correoPersonal: null, direccion: null, eps: null, fondoPensiones: null, fondoCesantias: null, nombreContacto: null, numeroContacto: null, doc_cedula: null, doc_pasaporte: null, doc_hoja_vida: null },
    { id: 17, name: 'Ana María Jiménez',        email: 'anamaria@haptica.co',           password: 'Haptica123', role: 'admin_rrhh',    cargo: 'Directora de RR.HH.',                area: 'Recursos Humanos',        ingreso: '2020-01-01', phone: '', active: true, birthday: null, cedula: null, pasaporte: null, correoPersonal: null, direccion: null, eps: null, fondoPensiones: null, fondoCesantias: null, nombreContacto: null, numeroContacto: null, doc_cedula: null, doc_pasaporte: null, doc_hoja_vida: null },
    { id: 18, name: 'Nicholle Torres',          email: 'nicholle.torres@haptica.co',    password: 'Haptica123', role: 'colaborador',   cargo: 'Consultora de Desarrollo de Negocio', area: 'Desarrollo de Negocio',   ingreso: '2020-01-01', phone: '', active: true, birthday: null, cedula: null, pasaporte: null, correoPersonal: null, direccion: null, eps: null, fondoPensiones: null, fondoCesantias: null, nombreContacto: null, numeroContacto: null, doc_cedula: null, doc_pasaporte: null, doc_hoja_vida: null },
    { id: 19, name: 'Juliana López',            email: 'juliana.lopez@haptica.co',      password: 'Haptica123', role: 'admin_adm',     cargo: 'Coordinadora Administrativa',         area: 'Administrativa',          ingreso: '2020-01-01', phone: '', active: true, birthday: null, cedula: null, pasaporte: null, correoPersonal: null, direccion: null, eps: null, fondoPensiones: null, fondoCesantias: null, nombreContacto: null, numeroContacto: null, doc_cedula: null, doc_pasaporte: null, doc_hoja_vida: null }
  ],
  announcements: [
    { id: 1, title: 'Jornada de Bienestar Empresarial', body: 'Este viernes 25 de abril realizaremos nuestra jornada de bienestar. Habrá actividades deportivas, charlas de salud mental y almuerzo compartido. ¡Los esperamos a todos!', tag: 'Bienestar', date: '2026-04-18', author: 'Ana María Jiménez' },
    { id: 2, title: 'Actualización de Política de Trabajo Remoto', body: 'A partir del 1 de mayo se modifica la política de trabajo remoto. Los colaboradores podrán trabajar desde casa hasta 3 días a la semana previa autorización de su líder.', tag: 'Política', date: '2026-04-15', author: 'Ana María Jiménez' },
    { id: 3, title: 'Capacitación Obligatoria SST - Abril 2026', body: 'Recordamos que todos los colaboradores deben completar los módulos de SST antes del 30 de abril. El incumplimiento afectará la evaluación de desempeño.', tag: 'Formación', date: '2026-04-10', author: 'Ana María Jiménez' },
    { id: 4, title: 'Nuevo sistema de solicitudes en línea', body: 'Ya está disponible el módulo de solicitudes en PULSO. Desde ahora todas las solicitudes de materiales y viajes deben gestionarse por este medio.', tag: 'Sistema', date: '2026-04-05', author: 'Ana María Jiménez' }
  ],
  certificates: [
    { id: 1, userId: 10, type: 'laboral_salario',    status: 'approved', date: '2026-04-10', approvedBy: 'Ana María Jiménez', approvedDate: '2026-04-11' },
    { id: 2, userId:  4, type: 'a_quien_interese',   status: 'pending',  date: '2026-04-18', approvedBy: null, approvedDate: null }
  ],
  requests: [
    { id: 1, userId:  5, type: 'materiales', description: 'Solicito una pantalla adicional para trabajo dual y teclado ergonómico.', status: 'approved', date: '2026-04-08', approvedBy: 'María Camila Venegas', approvedDate: '2026-04-09' },
    { id: 2, userId:  4, type: 'viaje', destination: 'Medellín', startDate: '2026-05-10', endDate: '2026-05-12', travelers: 2, costOwner: 'Empresa', status: 'pending', date: '2026-04-17', approvedBy: null, approvedDate: null },
    { id: 3, userId: 12, type: 'materiales', description: 'Silla ergonómica para home office.', status: 'rejected', date: '2026-04-01', approvedBy: 'María Camila Venegas', approvedDate: '2026-04-03', rejectReason: 'Presupuesto agotado para el trimestre.' }
  ],
  absences: [
    { id: 1, userId: 10, type: 'vacaciones',    startDate: '2026-05-05', endDate: '2026-05-16', days: 10, status: 'approved', date: '2026-04-10', approvedBy: 'María Camila Venegas' },
    { id: 2, userId:  4, type: 'dia_naranja',   startDate: '2026-04-28', endDate: '2026-04-28', days:  1, status: 'pending',  date: '2026-04-20', approvedBy: null },
    { id: 3, userId: 14, type: 'licencia_luto', startDate: '2026-03-15', endDate: '2026-03-20', days:  5, status: 'approved', date: '2026-03-15', approvedBy: 'Ana María Jiménez' }
  ],
  sst: {
    modules: [
      { id: 1, title: 'Inducción SST',      desc: 'Conceptos básicos de seguridad y salud en el trabajo. Obligatorio para todos los colaboradores.', icon: 'ph-shield-check',   iconColor: '#5295DA', color: 'rgba(82,149,218,.12)',  duration: '45 min', tips: ['Siempre reporta incidentes por pequeños que sean', 'Usa el equipo de protección personal asignado', 'Conoce las rutas de evacuación de tu área'] },
      { id: 2, title: 'Ergonomía y Posturas', desc: 'Aprende a configurar correctamente tu puesto de trabajo y mantener posturas saludables.',  icon: 'ph-person',            iconColor: '#6BBFA3', color: 'rgba(107,191,163,.15)', duration: '30 min', tips: ['Ajusta tu silla para que los pies lleguen al piso', 'La pantalla debe estar al nivel de los ojos', 'Toma pausas activas cada 90 minutos'] },
      { id: 3, title: 'Manejo del Estrés',  desc: 'Técnicas y herramientas para gestionar el estrés laboral de manera efectiva.',             icon: 'ph-heartbeat',         iconColor: '#FBBC33', color: 'rgba(251,188,51,.12)',  duration: '35 min', tips: ['Practica respiración diafragmática en momentos de tensión', 'Establece límites claros entre trabajo y vida personal', 'Comunica tu carga de trabajo a tu líder oportunamente'] },
      { id: 4, title: 'Plan de Emergencias', desc: 'Procedimientos de evacuación, puntos de encuentro y protocolos ante emergencias.',          icon: 'ph-warning-circle',    iconColor: '#FB4E4B', color: 'rgba(251,78,75,.1)',    duration: '40 min', tips: ['Identifica las salidas de emergencia de tu edificio', 'Participa en los simulacros programados', 'Mantén despejadas las rutas de evacuación'] },
      { id: 5, title: 'Riesgo Químico',     desc: 'Identificación, manejo y almacenamiento seguro de sustancias peligrosas.',                  icon: 'ph-flask',             iconColor: '#4E347F', color: 'rgba(78,52,127,.1)',    duration: '50 min', tips: ['Lee siempre la hoja de seguridad antes de manipular un químico', 'Usa guantes y gafas de protección', 'Nunca mezcles productos de limpieza sin autorización'] },
      { id: 6, title: 'Higiene Industrial', desc: 'Control de factores de riesgo físicos, químicos y biológicos en el ambiente laboral.',      icon: 'ph-drop',              iconColor: '#00BCA0', color: 'rgba(0,188,160,.1)',    duration: '40 min', tips: ['Lávate las manos frecuentemente', 'Mantén tu área de trabajo limpia y ordenada', 'Ventila adecuadamente los espacios de trabajo'] }
    ]
  },
  cyber: {
    modules: [
      { id: 1, title: 'Contraseñas Seguras', desc: 'Aprende a crear y gestionar contraseñas robustas para proteger tus cuentas corporativas.', icon: 'ph-key',               iconColor: '#5295DA', color: 'rgba(82,149,218,.12)',  duration: '25 min', tips: ['Usa contraseñas de mínimo 12 caracteres', 'Combina letras, números y símbolos', 'Nunca reutilices contraseñas entre sistemas'] },
      { id: 2, title: 'Phishing y Fraude',  desc: 'Identifica correos y mensajes maliciosos antes de que comprometan tu información.',         icon: 'ph-envelope-open',     iconColor: '#FBBC33', color: 'rgba(251,188,51,.12)',  duration: '30 min', tips: ['Verifica siempre el remitente de correos sospechosos', 'No hagas clic en enlaces de correos inesperados', 'Reporta correos sospechosos al área de TI'] },
      { id: 3, title: 'Protección de Datos', desc: 'Ley de protección de datos personales y buenas prácticas de manejo de información.',      icon: 'ph-lock-key',          iconColor: '#6BBFA3', color: 'rgba(107,191,163,.15)', duration: '35 min', tips: ['No compartas información de clientes por canales no autorizados', 'Bloquea tu equipo al ausentarte', 'Clasifica correctamente la información confidencial'] },
      { id: 4, title: 'Redes y VPN',        desc: 'Uso seguro de redes corporativas, WiFi públicas y conexión a VPN.',                        icon: 'ph-wifi-high',         iconColor: '#FB4E4B', color: 'rgba(251,78,75,.1)',    duration: '30 min', tips: ['Usa VPN siempre que trabajes fuera de la oficina', 'Evita conectarte a redes WiFi públicas sin VPN', 'No conectes dispositivos personales a la red corporativa'] },
      { id: 5, title: 'Ingeniería Social',  desc: 'Técnicas que usan los atacantes para manipular personas y obtener información.',           icon: 'ph-user-focus',        iconColor: '#4E347F', color: 'rgba(78,52,127,.1)',    duration: '40 min', tips: ['Verifica la identidad antes de entregar información', 'No reveles datos corporativos por teléfono sin verificación', 'Desconfía de solicitudes urgentes de información'] }
    ]
  },
  documents: [
    { id: 1, name: 'RUT Empresarial',      type: 'PDF', icon: 'ph-file-text',        iconColor: '#FB4E4B', color: 'rgba(251,78,75,.1)',    desc: 'Registro Único Tributario vigente 2026' },
    { id: 2, name: 'Cámara de Comercio',   type: 'PDF', icon: 'ph-bank',             iconColor: '#5295DA', color: 'rgba(82,149,218,.12)',  desc: 'Certificado de existencia y representación legal' },
    { id: 3, name: 'Reglamento Interno',   type: 'PDF', icon: 'ph-book-open',        iconColor: '#6BBFA3', color: 'rgba(107,191,163,.15)', desc: 'Reglamento interno de trabajo actualizado' },
    { id: 4, name: 'Política de Privacidad', type: 'PDF', icon: 'ph-lock-simple',    iconColor: '#FBBC33', color: 'rgba(251,188,51,.12)',  desc: 'Política de tratamiento de datos personales' },
    { id: 5, name: 'Manual de Convivencia', type: 'PDF', icon: 'ph-handshake',       iconColor: '#4E347F', color: 'rgba(78,52,127,.1)',    desc: 'Manual de convivencia y código de ética' },
    { id: 6, name: 'Organigrama 2026',     type: 'PDF', icon: 'ph-tree-structure',   iconColor: '#00BCA0', color: 'rgba(0,188,160,.1)',    desc: 'Estructura organizacional actualizada' },
    { id: 7, name: 'Plan Estratégico',     type: 'PDF', icon: 'ph-chart-line-up',    iconColor: '#FD9593', color: 'rgba(253,149,147,.15)', desc: 'Plan estratégico empresarial 2024-2026' },
    { id: 8, name: 'Política SST',         type: 'PDF', icon: 'ph-first-aid-kit',    iconColor: '#FA4616', color: 'rgba(250,70,22,.1)',    desc: 'Política de seguridad y salud en el trabajo' }
  ],
  cajaMenor: [],
  pqr: [
    { id: 1, userId: 3, anonymous: false, type: 'sugerencia', subject: 'Mejora en proceso de solicitudes', body: 'Sería ideal poder rastrear el estado de las solicitudes en tiempo real desde la plataforma.', status: 'en_revision', date: '2026-04-12' },
    { id: 2, userId: null, anonymous: true, type: 'queja', subject: 'Temperatura en área de trabajo', body: 'El sistema de aire acondicionado en el piso 3 no funciona adecuadamente, afectando la productividad.', status: 'pendiente', date: '2026-04-16' }
  ]
};

/* ── Storage helpers ───────────────────────────────────── */
const DB = {
  get(key) {
    try { return JSON.parse(localStorage.getItem('pulso_' + key)); } catch { return null; }
  },
  set(key, val) {
    localStorage.setItem('pulso_' + key, JSON.stringify(val));
  },
  init() {
    if (!DB.get('initialized') || DB.get('seed_version') !== SEED_VERSION) {
      Object.entries(SEED).forEach(([k, v]) => DB.set(k, v));
      // Init training progress for all users
      const progress = {};
      SEED.users.forEach(u => {
        progress[u.id] = {
          sst: SEED.sst.modules.reduce((a, m) => ({ ...a, [m.id]: 0 }), {}),
          cyber: SEED.cyber.modules.reduce((a, m) => ({ ...a, [m.id]: 0 }), {})
        };
      });
      DB.set('progress', progress);
      DB.set('ann_read', {});
      DB.set('initialized', true);
      DB.set('seed_version', SEED_VERSION);
    }
  }
};

/* ── CRUD helpers ──────────────────────────────────────── */
const Users = {
  all: () => DB.get('users') || [],
  find: (id) => Users.all().find(u => u.id === id),
  byEmail: (email) => Users.all().find(u => u.email === email),
  update(id, data) {
    const users = Users.all();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) { users[idx] = { ...users[idx], ...data }; DB.set('users', users); }
  },
  save(users) { DB.set('users', users); }
};

const Announcements = {
  all: () => (DB.get('announcements') || []).sort((a, b) => b.date.localeCompare(a.date)),
  add(ann) {
    const list = DB.get('announcements') || [];
    const newAnn = { ...ann, id: Date.now() };
    list.unshift(newAnn);
    DB.set('announcements', list);
    return newAnn;
  },
  del(id) {
    DB.set('announcements', (DB.get('announcements') || []).filter(a => a.id !== id));
  }
};

const Certificates = {
  all: () => DB.get('certificates') || [],
  forUser: (uid) => Certificates.all().filter(c => c.userId === uid),
  add(cert) {
    const list = Certificates.all();
    const newC = { ...cert, id: Date.now() };
    list.push(newC);
    DB.set('certificates', list);
    return newC;
  },
  update(id, data) {
    const list = Certificates.all();
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) { list[idx] = { ...list[idx], ...data }; DB.set('certificates', list); }
  },
  pending: () => Certificates.all().filter(c => c.status === 'pending')
};

const Requests = {
  all: () => DB.get('requests') || [],
  forUser: (uid) => Requests.all().filter(r => r.userId === uid),
  add(req) {
    const list = Requests.all();
    const newR = { ...req, id: Date.now() };
    list.push(newR);
    DB.set('requests', list);
    return newR;
  },
  update(id, data) {
    const list = Requests.all();
    const idx = list.findIndex(r => r.id === id);
    if (idx !== -1) { list[idx] = { ...list[idx], ...data }; DB.set('requests', list); }
  },
  pending: () => Requests.all().filter(r => r.status === 'pending')
};

const Absences = {
  all: () => DB.get('absences') || [],
  forUser: (uid) => Absences.all().filter(a => a.userId === uid),
  add(abs) {
    const list = Absences.all();
    const newA = { ...abs, id: Date.now() };
    list.push(newA);
    DB.set('absences', list);
    return newA;
  },
  update(id, data) {
    const list = Absences.all();
    const idx = list.findIndex(a => a.id === id);
    if (idx !== -1) { list[idx] = { ...list[idx], ...data }; DB.set('absences', list); }
  },
  pending: () => Absences.all().filter(a => a.status === 'pending'),
  vacDaysUsed: (uid) => {
    return Absences.forUser(uid)
      .filter(a => a.type === 'vacaciones' && a.status === 'approved')
      .reduce((sum, a) => sum + (a.days || 0), 0);
  }
};

const PQR = {
  all: () => DB.get('pqr') || [],
  forUser: (uid) => PQR.all().filter(p => !p.anonymous && p.userId === uid),
  add(item) {
    const list = PQR.all();
    const newP = { ...item, id: Date.now() };
    list.push(newP);
    DB.set('pqr', list);
    return newP;
  },
  update(id, data) {
    const list = PQR.all();
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) { list[idx] = { ...list[idx], ...data }; DB.set('pqr', list); }
  }
};

const CajaMenor = {
  all: () => DB.get('cajaMenor') || [],
  forUser: (uid) => CajaMenor.all().filter(x => x.userId === uid),
  add(item) {
    const list = CajaMenor.all();
    const newX = { ...item, id: Date.now() };
    list.push(newX);
    DB.set('cajaMenor', list);
    return newX;
  },
  update(id, data) {
    const list = CajaMenor.all();
    const idx = list.findIndex(x => x.id === id);
    if (idx !== -1) { list[idx] = { ...list[idx], ...data }; DB.set('cajaMenor', list); }
  },
  pending: () => CajaMenor.all().filter(x => x.status === 'pending')
};

const Progress = {
  get(uid) { return (DB.get('progress') || {})[uid] || { sst: {}, cyber: {} }; },
  complete(uid, module, moduleId) {
    const prog = DB.get('progress') || {};
    if (!prog[uid]) prog[uid] = { sst: {}, cyber: {} };
    prog[uid][module][moduleId] = 100;
    DB.set('progress', prog);
  },
  pct(uid, module, modules) {
    const prog = Progress.get(uid);
    const done = modules.filter(m => (prog[module] || {})[m.id] === 100).length;
    return Math.round((done / modules.length) * 100);
  }
};

/* ── Announcements Read Tracking ───────────────────────── */
const AnnRead = {
  _all()       { return DB.get('ann_read') || {}; },
  _forUser(uid){ return (AnnRead._all()[uid] || []); },
  markRead(uid, annId) {
    const data = AnnRead._all();
    if (!data[uid]) data[uid] = [];
    if (!data[uid].includes(annId)) {
      data[uid].push(annId);
      DB.set('ann_read', data);
    }
  },
  isRead(uid, annId) { return AnnRead._forUser(uid).includes(annId); },
  unreadCount(uid) {
    const allIds = Announcements.all().map(a => a.id);
    const read   = AnnRead._forUser(uid);
    return allIds.filter(id => !read.includes(id)).length;
  }
};

/* ── Session ───────────────────────────────────────────── */
const Session = {
  get: () => DB.get('session'),
  set: (user) => DB.set('session', user),
  clear: () => localStorage.removeItem('pulso_session')
};

/* ── Helpers ───────────────────────────────────────────── */
function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d + 'T12:00:00');
  return dt.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateShort(d) {
  if (!d) return '—';
  const dt = new Date(d + 'T12:00:00');
  return dt.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}

function today() { return new Date().toISOString().split('T')[0]; }

function initials(name) {
  return (name || '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function certTypeName(t) {
  const map = {
    laboral_salario:     'Certificado Laboral con Salario',
    laboral_sin_salario: 'Certificado Laboral sin Salario',
    cesantias:           'Certificado de Cesantías',
    retenciones:         'Certificado de Retenciones',
    a_quien_interese:    'Certificado A Quien Pueda Interesar' // legacy
  };
  return map[t] || t;
}

function cesantiasMotivoName(m) {
  const map = {
    compra_vivienda:  'Compra de vivienda',
    mejora_vivienda:  'Mejora de vivienda',
    credito_vivienda: 'Crédito de vivienda',
    impuesto_predial: 'Impuesto predial',
    educacion:        'Educación'
  };
  return map[m] || m;
}

function certDirigidaLabel(dirigida, nombre) {
  const titles = { senor: 'Señor', senora: 'Señora', senores: 'Señores' };
  const title = titles[dirigida] || '';
  return nombre ? `${title} ${nombre}` : title;
}

function absTypeName(t) {
  const map = {
    vacaciones:             'Vacaciones',
    dia_naranja:            'Día Naranja',
    licencia_no_remunerada: 'Licencia No Remunerada',
    otras_licencias:        'Otras Licencias',
    incapacidad:            'Incapacidad',
    // legacy (kept for existing records)
    licencia_maternidad: 'Licencia de Maternidad',
    licencia_paternidad: 'Licencia de Paternidad',
    licencia_maternidad: 'Licencia Maternidad',
    licencia_paternidad: 'Licencia Paternidad',
    licencia_luto: 'Licencia de Luto',
    licencia_no_remunerada: 'Licencia No Remunerada'
  };
  return map[t] || t;
}

function pqrTypeName(t) {
  const map = { peticion: 'Petición', queja: 'Queja', reclamo: 'Reclamo', sugerencia: 'Sugerencia' };
  return map[t] || t;
}

function roleLabel(r) {
  const map = {
    admin_rrhh:    'Admin RR.HH.',
    admin_gerente: 'Admin Gerencia',
    admin_ops:     'Admin Operaciones',
    admin_legal:   'Admin Legal',
    admin_adm:     'Admin Administrativa',
    colaborador:   'Colaborador'
  };
  return map[r] || r;
}

function isAdmin(role) {
  return typeof role === 'string' && role.startsWith('admin_');
}

function statusBadge(s) {
  const map = {
    pending: '<span class="badge badge-pending">⏳ Pendiente</span>',
    approved: '<span class="badge badge-approved">✓ Aprobado</span>',
    rejected: '<span class="badge badge-rejected">✗ Rechazado</span>',
    en_revision: '<span class="badge badge-info">🔍 En Revisión</span>',
    pendiente: '<span class="badge badge-pending">⏳ Pendiente</span>'
  };
  return map[s] || `<span class="badge badge-gray">${s}</span>`;
}

function reqTypeName(t) {
  const map = { materiales: 'Materiales', viaje: 'Viaje' };
  return map[t] || t;
}

// Initialize on load
DB.init();
