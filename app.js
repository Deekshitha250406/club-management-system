/* app.js — Shared UI utilities: toasts, modals, theme, sidebar, image handling */

// ── Theme ──────────────────────────────────────────────────────
function initTheme() {
  const t = localStorage.getItem('cs_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
  updateThemeIcon(t);
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  const nxt = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', nxt);
  localStorage.setItem('cs_theme', nxt);
  updateThemeIcon(nxt);
}
function updateThemeIcon(t) {
  const btn = document.getElementById('themeBtn');
  if (btn) btn.innerHTML = t === 'dark'
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
}

// ── Toasts ─────────────────────────────────────────────────────
function toast(type, title, msg = '', dur = 3400) {
  let box = document.getElementById('toasts');
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
  const icons = { ok:'fa-circle-check', err:'fa-circle-xmark', warn:'fa-triangle-exclamation', info:'fa-circle-info' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `
    <i class="fa-solid ${icons[type]||icons.info} toast-ico"></i>
    <div class="toast-body">
      <div class="toast-ttl">${title}</div>
      ${msg ? `<div class="toast-msg">${msg}</div>` : ''}
    </div>
    <button class="toast-x" onclick="dismissToast(this.parentElement)"><i class="fa-solid fa-xmark"></i></button>`;
  box.appendChild(el);
  setTimeout(() => dismissToast(el), dur);
}
function dismissToast(el) {
  if (!el || !el.parentElement) return;
  el.classList.add('out');
  setTimeout(() => el.remove(), 300);
}

// ── Sidebar ────────────────────────────────────────────────────
function initSidebar() {
  const sb  = document.getElementById('sidebar');
  const ov  = document.getElementById('sbOverlay');
  const hbg = document.getElementById('hamburger');
  if (!sb) return;
  hbg?.addEventListener('click', () => { sb.classList.toggle('open'); ov?.classList.toggle('show'); });
  ov?.addEventListener('click',  () => { sb.classList.remove('open'); ov.classList.remove('show'); });
}
function populateUser(user) {
  const n = document.getElementById('sbName');
  const r = document.getElementById('sbRole');
  const a = document.getElementById('sbAvatar');
  if (n) n.textContent = user.name;
  if (r) r.textContent = user.role === 'leader' ? 'Club Leader' : user.role.charAt(0).toUpperCase() + user.role.slice(1);
  if (a) a.textContent = getInitials(user.name);
}
function setActiveNav(page) {
  document.querySelectorAll('.sb-item').forEach(el =>
    el.classList.toggle('active', el.dataset.page === page)
  );
}

// ── Build sidebar nav by role ──────────────────────────────────
function buildNav(role, user) {
  const nav = document.getElementById('sbNav');
  if (!nav) return;
  let html = '';
  if (role === 'admin') {
    html = `
      <div class="sb-section">Overview</div>
      <a href="dashboard.html"    class="sb-item" data-page="dashboard"><i class="fa-solid fa-gauge-high"></i> Dashboard</a>
      <div class="sb-section">Management</div>
      <a href="clubs.html"        class="sb-item" data-page="clubs"><i class="fa-solid fa-people-group"></i> All Clubs</a>
      <a href="events.html"       class="sb-item" data-page="events"><i class="fa-solid fa-calendar-days"></i> All Events</a>
      <a href="manage-clubs.html" class="sb-item" data-page="manage-clubs"><i class="fa-solid fa-sliders"></i> Manage Clubs</a>
      <div class="sb-section">Reports</div>
      <a href="#" class="sb-item" onclick="openRegistrationsModal()"><i class="fa-solid fa-list-check"></i> Registrations</a>
      <a href="#" class="sb-item" onclick="openMembershipsModal()"><i class="fa-solid fa-id-card"></i> Memberships</a>`;
  } else if (role === 'leader') {
    html = `
      <div class="sb-section">Overview</div>
      <a href="dashboard.html"    class="sb-item" data-page="dashboard"><i class="fa-solid fa-gauge-high"></i> Dashboard</a>
      <div class="sb-section">My Club</div>
      <a href="clubs.html"        class="sb-item" data-page="clubs"><i class="fa-solid fa-people-group"></i> All Clubs</a>
      <a href="events.html"       class="sb-item" data-page="events"><i class="fa-solid fa-calendar-days"></i> Events</a>
      <a href="manage-clubs.html" class="sb-item" data-page="manage-clubs"><i class="fa-solid fa-pen-to-square"></i> Manage My Club</a>`;
  } else {
    html = `
      <div class="sb-section">Explore</div>
      <a href="dashboard.html"    class="sb-item" data-page="dashboard"><i class="fa-solid fa-gauge-high"></i> Dashboard</a>
      <a href="clubs.html"        class="sb-item" data-page="clubs"><i class="fa-solid fa-people-group"></i> Browse Clubs</a>
      <a href="events.html"       class="sb-item" data-page="events"><i class="fa-solid fa-calendar-days"></i> Events</a>
      <div class="sb-section">My Activity</div>
      <a href="#" class="sb-item" onclick="scrollToSection('myClubs')"><i class="fa-solid fa-star"></i> My Clubs</a>
      <a href="#" class="sb-item" onclick="scrollToSection('myEvents')"><i class="fa-solid fa-ticket"></i> My Registrations</a>`;
  }
  nav.innerHTML = html;
}

// ── Skeleton ───────────────────────────────────────────────────
function renderSkeletons(container, count = 3) {
  container.innerHTML = Array(count).fill(0).map(() => `
    <div class="skel-card">
      <div class="skeleton skel-img"></div>
      <div class="skel-body">
        <div class="skeleton skel-line"></div>
        <div class="skeleton skel-line w-3"></div>
        <div class="skeleton skel-line w-2"></div>
        <div class="skeleton skel-line w-1" style="margin-top:14px"></div>
      </div>
    </div>`).join('');
}

// ── Modal helpers ──────────────────────────────────────────────
function mkModal(id, title, body, footer = '') {
  const old = document.getElementById(id);
  if (old) old.remove();
  const ov = document.createElement('div');
  ov.className = 'overlay'; ov.id = id;
  ov.addEventListener('click', e => { if (e.target === ov) closeModal(id); });
  ov.innerHTML = `
    <div class="modal">
      <div class="modal-head">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-x" onclick="closeModal('${id}')"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="modal-body">${body}</div>
      ${footer ? `<div class="modal-foot">${footer}</div>` : ''}
    </div>`;
  document.body.appendChild(ov);
  return ov;
}
function closeModal(id) { document.getElementById(id)?.remove(); }

function confirmAction(msg, onYes) {
  const m = mkModal('confirmModal', 'Confirm Action',
    `<p style="color:var(--text2);line-height:1.6">${msg}</p>`,
    `<button class="btn btn-ghost" onclick="closeModal('confirmModal')">Cancel</button>
     <button class="btn btn-danger" id="confirmYes">Yes, Delete</button>`);
  document.getElementById('confirmYes').onclick = () => { closeModal('confirmModal'); onYes(); };
}

// ── Image upload helper ────────────────────────────────────────
// Returns a helper object that manages url/file tab state and preview
function createImageUploader(containerEl, opts = {}) {
  const { previewHeight = '180px', onChange } = opts;
  let mode = 'url';
  let dataUrl = null;
  let urlVal  = '';

  containerEl.innerHTML = `
    <div class="img-tabs">
      <button type="button" class="img-tab active" data-mode="url">🔗 Image URL</button>
      <button type="button" class="img-tab" data-mode="file">📁 Upload File</button>
    </div>
    <div id="imgUrlPane">
      <input type="url" class="input" id="imgUrlInput" placeholder="https://images.unsplash.com/…" />
    </div>
    <div id="imgFilePane" style="display:none">
      <div class="upload-zone" id="uploadZone">
        <input type="file" accept="image/*" id="imgFileInput" />
        <div class="upload-zone-icon"><i class="fa-solid fa-cloud-arrow-up"></i></div>
        <div class="upload-zone-text"><strong>Click to upload</strong> or drag & drop<br>JPG, PNG, WebP, GIF — max 3 MB</div>
      </div>
    </div>
    <div id="imgPreviewWrap" class="img-preview" style="display:none">
      <img id="imgPreviewEl" src="" alt="Preview" style="height:${previewHeight}" />
      <button type="button" class="img-preview-rm" id="imgClearBtn" title="Remove"><i class="fa-solid fa-xmark"></i></button>
    </div>`;

  // Tab switching
  containerEl.querySelectorAll('.img-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      mode = tab.dataset.mode;
      containerEl.querySelectorAll('.img-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('imgUrlPane').style.display  = mode === 'url'  ? 'block' : 'none';
      document.getElementById('imgFilePane').style.display = mode === 'file' ? 'block' : 'none';
      clearPreview();
    });
  });

  // URL input
  document.getElementById('imgUrlInput').addEventListener('input', function () {
    urlVal = this.value.trim();
    if (urlVal) showPreview(urlVal); else clearPreview();
    onChange && onChange(getValue());
  });

  // File input
  document.getElementById('imgFileInput').addEventListener('change', function () {
    handleFile(this.files[0]);
  });

  // Drag and drop
  const zone = document.getElementById('uploadZone');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('drag');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  document.getElementById('imgClearBtn').addEventListener('click', () => {
    clearPreview();
    document.getElementById('imgUrlInput').value = '';
    document.getElementById('imgFileInput').value = '';
    urlVal = ''; dataUrl = null;
    onChange && onChange(null);
  });

  function handleFile(file) {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast('warn', 'Too Large', 'Pick an image under 3 MB.'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      dataUrl = e.target.result;
      showPreview(dataUrl);
      onChange && onChange(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function showPreview(src) {
    const wrap = document.getElementById('imgPreviewWrap');
    const img  = document.getElementById('imgPreviewEl');
    img.src = src;
    img.onerror = () => { wrap.style.display = 'none'; };
    wrap.style.display = 'block';
  }
  function clearPreview() {
    document.getElementById('imgPreviewWrap').style.display = 'none';
    document.getElementById('imgPreviewEl').src = '';
    dataUrl = null;
  }

  function getValue() {
    if (mode === 'file') return dataUrl;
    return urlVal || null;
  }

  function setValue(src) {
    if (!src) return;
    document.getElementById('imgUrlInput').value = src;
    urlVal = src;
    showPreview(src);
  }

  return { getValue, setValue, clearPreview };
}

// ── Button loading state ───────────────────────────────────────
function setBtnLoading(btn, loading, orig = '') {
  if (loading) { btn._orig = btn.innerHTML; btn.innerHTML = '<span class="spin"></span> Loading…'; btn.disabled = true; }
  else { btn.innerHTML = btn._orig || orig; btn.disabled = false; }
}

// ── Form validation helpers ────────────────────────────────────
function valRequired(el, msg = 'This field is required.') {
  const err = el.closest('.form-group')?.querySelector('.err-msg');
  if (!el.value.trim()) {
    el.classList.add('err');
    if (err) { err.textContent = msg; err.classList.add('show'); }
    return false;
  }
  el.classList.remove('err'); err?.classList.remove('show');
  return true;
}
function valEmail(el) {
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
  const err = el.closest('.form-group')?.querySelector('.err-msg');
  if (!ok) { el.classList.add('err'); if (err) { err.textContent = 'Enter a valid email.'; err.classList.add('show'); } return false; }
  el.classList.remove('err'); err?.classList.remove('show');
  return true;
}

// ── Scroll to a section by id ──────────────────────────────────
function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Render event card (shared) ─────────────────────────────────
function renderEventCard(ev, user, opts = {}) {
  const { showClubChip = true, showAdminBtns = false } = opts;
  const club  = getClubById(ev.clubId) || {};
  const reg   = user && isRegistered(user.id, ev.id);
  const past  = isPast(ev.date);
  const count = getRegCount(ev.id);
  const canEdit = user && (user.role === 'admin' || (user.role === 'leader' && user.clubId === ev.clubId));

  const imgHtml = ev.image
    ? `<img src="${ev.image}" alt="${ev.title}" loading="lazy" onerror="this.style.display='none'">`
    : '';

  let regBtn = '';
  if (user?.role === 'student') {
    if (past) regBtn = `<button class="btn btn-ghost btn-sm" disabled><i class="fa-solid fa-lock"></i> Ended</button>`;
    else if (reg) regBtn = `<button class="btn btn-danger btn-sm" onclick="doUnreg('${ev.id}')"><i class="fa-solid fa-calendar-xmark"></i> Unregister</button>`;
    else regBtn = `<button class="btn btn-primary btn-sm" onclick="doReg('${ev.id}')"><i class="fa-solid fa-calendar-plus"></i> Register</button>`;
  }

  const editBtns = canEdit ? `
    <button class="btn btn-ghost btn-sm" onclick="openEditEventModal('${ev.id}')"><i class="fa-solid fa-pen"></i></button>
    <button class="btn btn-danger btn-sm" onclick="confirmDeleteEvent('${ev.id}')"><i class="fa-solid fa-trash"></i></button>` : '';

  return `
    <div class="ev-card" id="ecard_${ev.id}">
      <div class="ev-img">
        ${imgHtml}
        <span style="display:${ev.image?'none':'flex'}">${catEmoji(club.category||'other')}</span>
        ${showClubChip && club.name ? `<span class="ev-club-chip"><i class="fa-solid fa-people-group"></i> ${club.name}</span>` : ''}
        ${reg ? `<span class="ev-reg-badge"><i class="fa-solid fa-check"></i> Registered</span>` : ''}
      </div>
      <div class="ev-body">
        <div class="ev-title">${ev.title}</div>
        <div class="ev-desc">${ev.description}</div>
        <div class="ev-meta">
          <div class="ev-meta-row"><i class="fa-solid fa-calendar"></i>${fmtDate(ev.date)}</div>
          <div class="ev-meta-row"><i class="fa-solid fa-clock"></i>${fmtTime(ev.time)}</div>
          <div class="ev-meta-row"><i class="fa-solid fa-location-dot"></i>${ev.venue}</div>
          <div class="ev-meta-row"><i class="fa-solid fa-users"></i>${count}${ev.maxSeats?' / '+ev.maxSeats:''} registered</div>
        </div>
        <div class="ev-actions">
          ${regBtn}
          ${editBtns}
          <button class="btn btn-ghost btn-sm" onclick="openEventDetail('${ev.id}')"><i class="fa-solid fa-eye"></i></button>
        </div>
      </div>
    </div>`;
}

// ── Event detail modal ─────────────────────────────────────────
function openEventDetail(eventId) {
  const ev   = getEventById(eventId);
  const club = ev ? getClubById(ev.clubId) : null;
  const user = getCurrentUser();
  if (!ev) return;
  const reg   = user && isRegistered(user.id, eventId);
  const past  = isPast(ev.date);
  const count = getRegCount(eventId);
  const canReg = user?.role === 'student' && !past;

  const regBtn = canReg
    ? reg
      ? `<button class="btn btn-danger" onclick="doUnreg('${eventId}');closeModal('evDetail')"><i class="fa-solid fa-calendar-xmark"></i> Unregister</button>`
      : `<button class="btn btn-primary" onclick="doReg('${eventId}');closeModal('evDetail')"><i class="fa-solid fa-calendar-plus"></i> Register Now</button>`
    : '';

  mkModal('evDetail', ev.title, `
    ${ev.image ? `<img src="${ev.image}" style="width:100%;height:190px;object-fit:cover;border-radius:12px;margin-bottom:16px" alt="${ev.title}" loading="lazy">` : ''}
    <div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:14px">
      ${club ? `<span class="cat-pill ${catClass(club.category)}">${catLabel(club.category)}</span>` : ''}
      ${reg ? `<span class="badge badge-green"><i class="fa-solid fa-check"></i> Registered</span>` : ''}
      ${past ? `<span class="badge" style="background:rgba(124,138,171,.12);color:var(--text2)">Past Event</span>` : ''}
      ${club ? `<span class="badge badge-orange"><i class="fa-solid fa-people-group"></i> ${club.name}</span>` : ''}
    </div>
    <p style="color:var(--text2);font-size:.88rem;line-height:1.7;margin-bottom:18px">${ev.description}</p>
    <div class="ev-meta">
      <div class="ev-meta-row"><i class="fa-solid fa-calendar"></i>${fmtDate(ev.date)}</div>
      <div class="ev-meta-row"><i class="fa-solid fa-clock"></i>${fmtTime(ev.time)}</div>
      <div class="ev-meta-row"><i class="fa-solid fa-location-dot"></i>${ev.venue}</div>
      <div class="ev-meta-row"><i class="fa-solid fa-users"></i>${count}${ev.maxSeats?' / '+ev.maxSeats:''} registered</div>
    </div>`,
    `<button class="btn btn-ghost" onclick="closeModal('evDetail')">Close</button>${regBtn}`);
}

// ── Register / Unregister (globally called) ────────────────────
function doReg(eventId) {
  const user = getCurrentUser();
  if (!user) return toast('err','Not logged in','Please log in first.');
  const res = registerEvent(user.id, eventId);
  if (res.ok) { toast('ok','Registered!','You\'re going 🎉'); refreshCards && refreshCards(); }
  else toast('err','Failed', res.msg);
}
function doUnreg(eventId) {
  const user = getCurrentUser();
  if (!user) return;
  unregisterEvent(user.id, eventId);
  toast('info','Unregistered','Removed from your events.');
  refreshCards && refreshCards();
}

// ── Delete event (globally called) ────────────────────────────
function confirmDeleteEvent(eventId) {
  const ev = getEventById(eventId);
  if (!ev) return;
  confirmAction(`Delete "<strong>${ev.title}</strong>"? This cannot be undone.`, () => {
    deleteEvent(eventId);
    toast('info','Deleted', `"${ev.title}" removed.`);
    refreshCards && refreshCards();
  });
}

// ── Edit event modal (shared for events.html and manage-clubs.html) ──
function openEditEventModal(eventId) {
  const ev = getEventById(eventId);
  if (!ev) return;

  const m = mkModal('editEvModal', 'Edit Event', `
    <form id="editEvForm" novalidate>
      <div class="form-group">
        <label class="label">Event Title *</label>
        <input class="input" id="eeTitle" value="${ev.title}" maxlength="100" />
        <div class="err-msg"></div>
      </div>
      <div class="form-group">
        <label class="label">Description *</label>
        <textarea class="input" id="eeDesc" rows="3">${ev.description}</textarea>
        <div class="err-msg"></div>
      </div>
      <div class="form-row">
        <div class="form-group mb-0">
          <label class="label">Date *</label>
          <input type="date" class="input" id="eeDate" value="${ev.date}" />
          <div class="err-msg"></div>
        </div>
        <div class="form-group mb-0">
          <label class="label">Time *</label>
          <input type="time" class="input" id="eeTime" value="${ev.time}" />
          <div class="err-msg"></div>
        </div>
      </div>
      <div class="form-group" style="margin-top:14px">
        <label class="label">Venue *</label>
        <input class="input" id="eeVenue" value="${ev.venue}" />
        <div class="err-msg"></div>
      </div>
      <div class="form-group">
        <label class="label">Max Seats</label>
        <input type="number" class="input" id="eeSeats" value="${ev.maxSeats||''}" placeholder="Unlimited" min="1" />
      </div>
      <div class="form-group mb-0">
        <label class="label">Event Image</label>
        <div id="eeImgUploader"></div>
      </div>
    </form>`,
    `<button class="btn btn-ghost" onclick="closeModal('editEvModal')">Cancel</button>
     <button class="btn btn-primary" id="eeSubmit"><i class="fa-solid fa-save"></i> Save Changes</button>`);

  const uploader = createImageUploader(document.getElementById('eeImgUploader'));
  if (ev.image) uploader.setValue(ev.image);

  document.getElementById('eeSubmit').onclick = () => {
    const title = document.getElementById('eeTitle');
    const desc  = document.getElementById('eeDesc');
    const date  = document.getElementById('eeDate');
    const time  = document.getElementById('eeTime');
    const venue = document.getElementById('eeVenue');
    let ok = true;
    [title,desc,date,time,venue].forEach(el => { if(!valRequired(el)) ok=false; });
    if (!ok) return toast('warn','Incomplete','Fill in all required fields.');
    updateEvent(eventId, {
      title: title.value.trim(), description: desc.value.trim(),
      date: date.value, time: time.value, venue: venue.value.trim(),
      maxSeats: parseInt(document.getElementById('eeSeats').value)||null,
      image: uploader.getValue() || ev.image || null
    });
    closeModal('editEvModal');
    toast('ok','Event Updated','Changes saved successfully.');
    refreshCards && refreshCards();
  };
}

// ── Admin: Registrations overview modal ───────────────────────
function openRegistrationsModal() {
  const regs  = getRegs();
  const users = getUsers();
  const evs   = getEvents();
  const rows  = regs.length
    ? regs.map(r => {
        const u = users.find(x=>x.id===r.userId)||{name:'?',email:'-'};
        const e = evs.find(x=>x.id===r.eventId)||{title:'Deleted',clubId:''};
        const c = getClubById(e.clubId);
        return `<tr>
          <td>${u.name}</td>
          <td style="color:var(--text2);font-size:.78rem">${u.email}</td>
          <td>${e.title}</td>
          <td>${c?c.name:'-'}</td>
          <td style="font-size:.75rem;color:var(--text2)">${new Date(r.registeredAt).toLocaleDateString('en-IN')}</td>
        </tr>`;
      }).join('')
    : `<tr><td colspan="5" style="text-align:center;padding:22px;color:var(--text3)">No registrations yet.</td></tr>`;

  mkModal('regsModal',`All Registrations (${regs.length})`,`
    <div class="tbl-wrap" style="max-height:420px;overflow-y:auto">
      <table>
        <thead><tr><th>Student</th><th>Email</th><th>Event</th><th>Club</th><th>Date</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`,
    `<button class="btn btn-ghost" onclick="closeModal('regsModal')">Close</button>`);
}

// ── Admin: Memberships overview modal ─────────────────────────
function openMembershipsModal() {
  const mems  = getMembers();
  const users = getUsers();
  const rows  = mems.length
    ? mems.map(m => {
        const u = users.find(x=>x.id===m.userId)||{name:'?',email:'-'};
        const c = getClubById(m.clubId)||{name:'Deleted'};
        return `<tr>
          <td>${u.name}</td>
          <td style="color:var(--text2);font-size:.78rem">${u.email}</td>
          <td>${c.name}</td>
          <td><span class="badge ${m.role==='leader'?'badge-orange':'badge-blue'}">${m.role}</span></td>
          <td style="font-size:.75rem;color:var(--text2)">${new Date(m.joinedAt).toLocaleDateString('en-IN')}</td>
        </tr>`;
      }).join('')
    : `<tr><td colspan="5" style="text-align:center;padding:22px;color:var(--text3)">No memberships yet.</td></tr>`;

  mkModal('memsModal',`All Memberships (${mems.length})`,`
    <div class="tbl-wrap" style="max-height:420px;overflow-y:auto">
      <table>
        <thead><tr><th>User</th><th>Email</th><th>Club</th><th>Role</th><th>Joined</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`,
    `<button class="btn btn-ghost" onclick="closeModal('memsModal')">Close</button>`);
}

// ── App boot ──────────────────────────────────────────────────
function initApp() {
  seedUsers();
  seedClubs();
  initTheme();
  initSidebar();
  document.getElementById('themeBtn')?.addEventListener('click', toggleTheme);
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
}

// placeholder so pages that don't define it won't crash
var refreshCards = null;
