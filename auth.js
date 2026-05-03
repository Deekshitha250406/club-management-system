/* auth.js — Session & User Management (3 roles: admin / leader / student) */

const KEY_USERS   = 'cs_users';
const KEY_SESSION = 'cs_session';

// ── Seed default accounts ──────────────────────────────────────
function seedUsers() {
  if (getUsers().length) return;
  const users = [
    { id:'u1', name:'Dr. Kavitha Rajan',  email:'admin@college.edu',   password:'admin123',   role:'admin',   createdAt: now() },
    { id:'u2', name:'Rithvik Sharma',     email:'rithvik@college.edu',  password:'leader123',  role:'leader',  clubId: null, createdAt: now() },
    { id:'u3', name:'Priya Nair',         email:'priya@college.edu',    password:'leader123',  role:'leader',  clubId: null, createdAt: now() },
    { id:'u4', name:'Arjun Mehta',        email:'arjun@student.edu',    password:'student123', role:'student', createdAt: now() },
    { id:'u5', name:'Sneha Patel',        email:'sneha@student.edu',    password:'student123', role:'student', createdAt: now() },
    { id:'u6', name:'Karan Dev',          email:'karan@student.edu',    password:'student123', role:'student', createdAt: now() },
    { id:'u7', name:'Meera Iyer',         email:'meera@student.edu',    password:'student123', role:'student', createdAt: now() },
  ];
  localStorage.setItem(KEY_USERS, JSON.stringify(users));
}

function getUsers() {
  try { return JSON.parse(localStorage.getItem(KEY_USERS)) || []; } catch { return []; }
}
function saveUsers(u) { localStorage.setItem(KEY_USERS, JSON.stringify(u)); }

function getUserById(id) { return getUsers().find(u => u.id === id) || null; }

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(KEY_SESSION)); } catch { return null; }
}
function setSession(user) {
  const { password, ...safe } = user;
  localStorage.setItem(KEY_SESSION, JSON.stringify(safe));
}
function clearSession() { localStorage.removeItem(KEY_SESSION); }

// ── Auth actions ───────────────────────────────────────────────
function login(email, password) {
  const user = getUsers().find(u =>
    u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
  );
  if (!user) return { ok: false, msg: 'Invalid email or password.' };
  setSession(user);
  return { ok: true, user };
}

function signup(name, email, password, role) {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()))
    return { ok: false, msg: 'An account with this email already exists.' };
  const u = { id:'u_'+Date.now(), name:name.trim(), email:email.toLowerCase().trim(), password, role, createdAt:now() };
  if (role === 'leader') u.clubId = null;
  users.push(u);
  saveUsers(users);
  setSession(u);
  return { ok: true, user: u };
}

function logout() { clearSession(); window.location.href = 'index.html'; }

// Assign a club to a leader (called by admin)
function assignLeaderToClub(leaderId, clubId) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === leaderId);
  if (idx === -1) return false;
  users[idx].clubId = clubId;
  saveUsers(users);
  // Refresh session if it's this user
  if (getCurrentUser()?.id === leaderId) setSession(users[idx]);
  return true;
}

// ── Route guards ───────────────────────────────────────────────
function requireAuth() {
  const u = getCurrentUser();
  if (!u) { window.location.href = 'index.html'; return null; }
  return u;
}
function requireAdmin() {
  const u = requireAuth();
  if (u && u.role !== 'admin') { window.location.href = 'dashboard.html'; return null; }
  return u;
}
function requireAdminOrLeader() {
  const u = requireAuth();
  if (u && u.role === 'student') { window.location.href = 'dashboard.html'; return null; }
  return u;
}
function redirectIfLoggedIn() {
  if (getCurrentUser()) window.location.href = 'dashboard.html';
}

// ── Helpers ────────────────────────────────────────────────────
function getInitials(name='?') {
  return name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
}
function now() { return new Date().toISOString(); }
