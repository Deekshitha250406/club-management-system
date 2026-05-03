/* clubs.js — Club & Event management, membership, registrations */

const KEY_CLUBS  = 'cs_clubs';
const KEY_EVENTS = 'cs_events';
const KEY_MEMBERS= 'cs_members';   // { id, userId, clubId, joinedAt }
const KEY_REGS   = 'cs_regs';     // { id, userId, eventId, registeredAt }

// ── Category config ────────────────────────────────────────────
const CLUB_CATS = {
  dance:     { label:'Dance',      emoji:'💃', cssClass:'cat-dance'    },
  music:     { label:'Music',      emoji:'🎵', cssClass:'cat-music'    },
  technical: { label:'Technical',  emoji:'💻', cssClass:'cat-technical'},
  sports:    { label:'Sports',     emoji:'⚽', cssClass:'cat-sports'   },
  arts:      { label:'Arts',       emoji:'🎨', cssClass:'cat-arts'     },
  literary:  { label:'Literary',   emoji:'📖', cssClass:'cat-literary' },
  social:    { label:'Social',     emoji:'🤝', cssClass:'cat-social'   },
  other:     { label:'Other',      emoji:'⭐', cssClass:'cat-other'    },
};

// ── Seed data ──────────────────────────────────────────────────
function seedClubs() {
  if (getClubs().length) return;

  const future = d => {
    const dt = new Date(); dt.setDate(dt.getDate()+d);
    return dt.toISOString().split('T')[0];
  };

  const clubs = [
    { id:'c1', name:'Taal Tadka Dance Club',      category:'dance',     description:'From classical Bharatanatyam to hip-hop and contemporary — we celebrate all dance forms. Compete, perform, and grow with passionate dancers.',      image:'https://images.unsplash.com/photo-1547153760-18fc86324498?w=600&q=80', leaderId:'u2', founded:'2018', memberLimit:60, createdAt:now() },
    { id:'c2', name:'Resonance Music Society',    category:'music',     description:'A band of musicians, vocalists, and composers. We hold weekly jams, open-mics and perform at every college fest.',                                   image:'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80', leaderId:'u3', founded:'2016', memberLimit:80, createdAt:now() },
    { id:'c3', name:'TechNova — Coding Club',     category:'technical', description:'Hackathons, DSA bootcamps, open-source contributions, AI workshops — if it runs on electricity, we\'re into it.',                                   image:'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80', leaderId:null, founded:'2019', memberLimit:120, createdAt:now() },
    { id:'c4', name:'Pixel Arts Collective',      category:'arts',      description:'Digital art, photography, film-making and graphic design. Gallery exhibitions every semester and collaborative art projects year-round.',           image:'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80', leaderId:null, founded:'2020', memberLimit:50, createdAt:now() },
    { id:'c5', name:'Quill & Compass — Literary', category:'literary',  description:'Poetry slams, short-story contests, book clubs, debate and elocution. Home for every wordsmith on campus.',                                         image:'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&q=80', leaderId:null, founded:'2017', memberLimit:70, createdAt:now() },
    { id:'c6', name:'Champions Sports Club',      category:'sports',    description:'Cricket, football, badminton, basketball — we train hard, compete harder. State-level tournaments and inter-college league participation.',          image:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80', leaderId:null, founded:'2015', memberLimit:150, createdAt:now() },
  ];

  const events = [
    { id:'e1', clubId:'c1', title:'Annual Dance Showcase 2025',         description:'A spectacular evening of performances across 12 dance forms by our top choreographers.',  date:future(7),  time:'18:00', venue:'Main Auditorium',       image:'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=600&q=80', maxSeats:300, createdBy:'u2', createdAt:now() },
    { id:'e2', clubId:'c1', title:'Bollywood Night Workshop',           description:'Learn Bollywood moves from our champion dancers. Open to all experience levels.',            date:future(14), time:'17:00', venue:'Dance Studio, Block D',  image:'https://images.unsplash.com/photo-1606293926249-ed1a25d8df43?w=600&q=80', maxSeats:40,  createdBy:'u2', createdAt:now() },
    { id:'e3', clubId:'c2', title:'Resonance Open Mic Night',           description:'Grab the mic and rock the stage — original compositions welcome. Judges and prizes await.', date:future(5),  time:'19:00', venue:'College Amphitheatre',  image:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80', maxSeats:200, createdBy:'u3', createdAt:now() },
    { id:'e4', clubId:'c2', title:'Battle of the Bands',               description:'8 bands, one stage, zero mercy. The ultimate college music face-off.',                       date:future(21), time:'17:00', venue:'Main Auditorium',       image:'https://images.unsplash.com/photo-1501612780327-45045538702b?w=600&q=80', maxSeats:400, createdBy:'u3', createdAt:now() },
    { id:'e5', clubId:'c3', title:'HackSphere 36-Hr Hackathon',        description:'Build. Break. Deploy. 36 hours of coding madness with ₹2L in prizes.',                      date:future(10), time:'09:00', venue:'Innovation Hub, Block C', image:'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80', maxSeats:120, createdBy:'u1', createdAt:now() },
    { id:'e6', clubId:'c3', title:'AI & ML Hands-on Bootcamp',         description:'Two-day deep dive into machine learning with Python and TensorFlow.',                       date:future(3),  time:'10:00', venue:'CS Lab 101',             image:'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80', maxSeats:40,  createdBy:'u1', createdAt:now() },
    { id:'e7', clubId:'c4', title:'Click! — Photography Exhibition',   description:'Showcasing the best 100 photos taken by club members this year.',                           date:future(8),  time:'11:00', venue:'Gallery, Arts Block',    image:'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&q=80', maxSeats:500, createdBy:'u1', createdAt:now() },
    { id:'e8', clubId:'c6', title:'Inter-College Cricket Championship', description:'16 college teams battle it out over 3 days. Root for your college!',                       date:future(18), time:'08:00', venue:'College Sports Ground',   image:'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80', maxSeats:500, createdBy:'u1', createdAt:now() },
  ];

  // Seed memberships: u2 → c1, u3 → c2, u4 → c1, c3, u5 → c2
  const members = [
    { id:'m1', userId:'u2', clubId:'c1', role:'leader', joinedAt:now() },
    { id:'m2', userId:'u3', clubId:'c2', role:'leader', joinedAt:now() },
    { id:'m3', userId:'u4', clubId:'c1', role:'member', joinedAt:now() },
    { id:'m4', userId:'u4', clubId:'c3', role:'member', joinedAt:now() },
    { id:'m5', userId:'u5', clubId:'c2', role:'member', joinedAt:now() },
    { id:'m6', userId:'u6', clubId:'c6', role:'member', joinedAt:now() },
    { id:'m7', userId:'u7', clubId:'c4', role:'member', joinedAt:now() },
  ];

  // Seed some registrations
  const regs = [
    { id:'r1', userId:'u4', eventId:'e3', registeredAt:now() },
    { id:'r2', userId:'u5', eventId:'e5', registeredAt:now() },
    { id:'r3', userId:'u6', eventId:'e8', registeredAt:now() },
    { id:'r4', userId:'u7', eventId:'e7', registeredAt:now() },
  ];

  // Link leaders to clubs in users
  const users = getUsers();
  const u2 = users.find(u=>u.id==='u2'); if(u2) u2.clubId='c1';
  const u3 = users.find(u=>u.id==='u3'); if(u3) u3.clubId='c2';
  saveUsers(users);

  localStorage.setItem(KEY_CLUBS,  JSON.stringify(clubs));
  localStorage.setItem(KEY_EVENTS, JSON.stringify(events));
  localStorage.setItem(KEY_MEMBERS,JSON.stringify(members));
  localStorage.setItem(KEY_REGS,   JSON.stringify(regs));
}

// ── CLUBS CRUD ─────────────────────────────────────────────────
function getClubs() {
  try { return JSON.parse(localStorage.getItem(KEY_CLUBS))||[]; } catch { return []; }
}
function saveClubs(c) { localStorage.setItem(KEY_CLUBS, JSON.stringify(c)); }
function getClubById(id) { return getClubs().find(c=>c.id===id)||null; }

function createClub(data) {
  const clubs = getClubs();
  const club = { id:'c_'+Date.now(), ...data, createdAt:now() };
  clubs.push(club);
  saveClubs(clubs);
  return club;
}
function updateClub(id, data) {
  const clubs = getClubs();
  const i = clubs.findIndex(c=>c.id===id);
  if(i===-1) return null;
  clubs[i] = { ...clubs[i], ...data, updatedAt:now() };
  saveClubs(clubs);
  return clubs[i];
}
function deleteClub(id) {
  saveClubs(getClubs().filter(c=>c.id!==id));
  // cascade: remove events, memberships, registrations
  const evIds = getEvents().filter(e=>e.clubId===id).map(e=>e.id);
  saveEvents(getEvents().filter(e=>e.clubId!==id));
  saveMembers(getMembers().filter(m=>m.clubId!==id));
  saveRegs(getRegs().filter(r=>!evIds.includes(r.eventId)));
}

function filterClubs({ search='', category='' }={}) {
  let clubs = getClubs();
  if(search) { const q=search.toLowerCase(); clubs=clubs.filter(c=>c.name.toLowerCase().includes(q)||c.description.toLowerCase().includes(q)); }
  if(category) clubs=clubs.filter(c=>c.category===category);
  return clubs;
}

// ── EVENTS CRUD ────────────────────────────────────────────────
function getEvents() {
  try { return JSON.parse(localStorage.getItem(KEY_EVENTS))||[]; } catch { return []; }
}
function saveEvents(e) { localStorage.setItem(KEY_EVENTS, JSON.stringify(e)); }
function getEventById(id) { return getEvents().find(e=>e.id===id)||null; }
function getClubEvents(clubId) { return getEvents().filter(e=>e.clubId===clubId).sort((a,b)=>new Date(a.date)-new Date(b.date)); }

function createEvent(data) {
  const events = getEvents();
  const ev = { id:'e_'+Date.now(), ...data, createdAt:now() };
  events.push(ev);
  saveEvents(events);
  return ev;
}
function updateEvent(id, data) {
  const events = getEvents();
  const i = events.findIndex(e=>e.id===id);
  if(i===-1) return null;
  events[i] = { ...events[i], ...data, updatedAt:now() };
  saveEvents(events);
  return events[i];
}
function deleteEvent(id) {
  saveEvents(getEvents().filter(e=>e.id!==id));
  saveRegs(getRegs().filter(r=>r.eventId!==id));
}

function filterEvents({ search='', clubId='', date='' }={}) {
  let evs = getEvents();
  const today = new Date(); today.setHours(0,0,0,0);
  if(search) { const q=search.toLowerCase(); evs=evs.filter(e=>e.title.toLowerCase().includes(q)||e.venue.toLowerCase().includes(q)); }
  if(clubId) evs=evs.filter(e=>e.clubId===clubId);
  if(date==='upcoming') evs=evs.filter(e=>new Date(e.date)>=today);
  if(date==='past') evs=evs.filter(e=>new Date(e.date)<today);
  if(date==='week') { const nw=new Date(today.getTime()+7*864e5); evs=evs.filter(e=>{const d=new Date(e.date);return d>=today&&d<=nw;}); }
  return evs.sort((a,b)=>new Date(a.date)-new Date(b.date));
}

function getUpcomingEvents(n=6) {
  const t=new Date(); t.setHours(0,0,0,0);
  return getEvents().filter(e=>new Date(e.date)>=t).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,n);
}

// ── MEMBERSHIP ─────────────────────────────────────────────────
function getMembers() { try { return JSON.parse(localStorage.getItem(KEY_MEMBERS))||[]; } catch { return []; } }
function saveMembers(m) { localStorage.setItem(KEY_MEMBERS, JSON.stringify(m)); }

function isClubMember(userId, clubId) { return getMembers().some(m=>m.userId===userId&&m.clubId===clubId); }
function getClubMembers(clubId) { return getMembers().filter(m=>m.clubId===clubId); }
function getUserClubs(userId) {
  const mems = getMembers().filter(m=>m.userId===userId);
  return getClubs().filter(c=>mems.some(m=>m.clubId===c.id));
}
function getMemberCount(clubId) { return getMembers().filter(m=>m.clubId===clubId).length; }

function joinClub(userId, clubId) {
  if(isClubMember(userId, clubId)) return { ok:false, msg:'You are already a member of this club.' };
  const club = getClubById(clubId);
  if(!club) return { ok:false, msg:'Club not found.' };
  const count = getMemberCount(clubId);
  if(club.memberLimit && count>=club.memberLimit) return { ok:false, msg:'This club has reached its member limit.' };
  const mems = getMembers();
  mems.push({ id:'m_'+Date.now(), userId, clubId, role:'member', joinedAt:now() });
  saveMembers(mems);
  return { ok:true };
}
function leaveClub(userId, clubId) {
  saveMembers(getMembers().filter(m=>!(m.userId===userId&&m.clubId===clubId)));
  return { ok:true };
}
function removeMember(userId, clubId) { leaveClub(userId, clubId); }

// ── EVENT REGISTRATION ─────────────────────────────────────────
function getRegs() { try { return JSON.parse(localStorage.getItem(KEY_REGS))||[]; } catch { return []; } }
function saveRegs(r) { localStorage.setItem(KEY_REGS, JSON.stringify(r)); }

function isRegistered(userId, eventId) { return getRegs().some(r=>r.userId===userId&&r.eventId===eventId); }
function getRegCount(eventId) { return getRegs().filter(r=>r.eventId===eventId).length; }

function registerEvent(userId, eventId) {
  if(isRegistered(userId, eventId)) return { ok:false, msg:'Already registered.' };
  const ev = getEventById(eventId);
  if(!ev) return { ok:false, msg:'Event not found.' };
  if(ev.maxSeats && getRegCount(eventId)>=ev.maxSeats) return { ok:false, msg:'Event is fully booked.' };
  const regs=getRegs();
  regs.push({ id:'r_'+Date.now(), userId, eventId, registeredAt:now() });
  saveRegs(regs);
  return { ok:true };
}
function unregisterEvent(userId, eventId) {
  saveRegs(getRegs().filter(r=>!(r.userId===userId&&r.eventId===eventId)));
  return { ok:true };
}
function getStudentRegisteredEvents(userId) {
  const ids = getRegs().filter(r=>r.userId===userId).map(r=>r.eventId);
  return getEvents().filter(e=>ids.includes(e.id));
}

// ── Helpers ────────────────────────────────────────────────────
function fmtDate(d) {
  if(!d) return '';
  return new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
}
function fmtTime(t) {
  if(!t) return '';
  const [h,m]=t.split(':'); const hr=+h; const ap=hr>=12?'PM':'AM';
  return `${hr%12||12}:${m} ${ap}`;
}
function isPast(dateStr) {
  const t=new Date(); t.setHours(0,0,0,0);
  return new Date(dateStr)<t;
}
function getDayMon(dateStr) {
  const d=new Date(dateStr);
  return { day:d.getDate(), mon:d.toLocaleString('en',{month:'short'}).toUpperCase() };
}
function catClass(cat) { return (CLUB_CATS[cat]||CLUB_CATS.other).cssClass; }
function catEmoji(cat) { return (CLUB_CATS[cat]||CLUB_CATS.other).emoji; }
function catLabel(cat) { return (CLUB_CATS[cat]||CLUB_CATS.other).label; }

function catOptions(sel='') {
  return Object.entries(CLUB_CATS).map(([v,c])=>`<option value="${v}"${v===sel?' selected':''}>${c.label}</option>`).join('');
}
