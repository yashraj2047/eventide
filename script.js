'use strict';
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- Data (dates are relative to today so countdowns always run) ---------- */
const EVENTS = [
  {id:1,name:'HackSprint 24h',cat:'Tech',in:3,time:'09:00',venue:'Innovation Lab, Block C',seats:60,desc:'Team up and build a working prototype in 24 hours. Mentors on site, prizes for the top three teams.'},
  {id:2,name:'Rangotsav Cultural Night',cat:'Cultural',in:5,time:'18:30',venue:'Main Auditorium',seats:200,desc:'Dance, music and theatre performances from student societies, ending with a live band.'},
  {id:3,name:'Inter-College Football Cup',cat:'Sports',in:8,time:'16:00',venue:'Central Sports Ground',seats:150,desc:'Eight teams, one trophy. Knockout matches with live commentary and food stalls.'},
  {id:4,name:'Git & GitHub in 2 Hours',cat:'Workshop',in:10,time:'11:00',venue:'Seminar Hall 2',seats:80,desc:'Learn commits, branches, pull requests and GitHub Pages with hands-on exercises.'},
  {id:5,name:'Placement Prep Masterclass',cat:'Career',in:12,time:'14:00',venue:'Convention Centre',seats:120,desc:'Resume reviews, aptitude strategy and mock interviews led by recruiters from top firms.'},
  {id:6,name:'AI for Beginners Bootcamp',cat:'Tech',in:15,time:'10:00',venue:'Computer Centre, Lab 4',seats:50,desc:'Build a small machine-learning project from scratch. No prior experience needed.'},
  {id:7,name:'Open Mic & Poetry Evening',cat:'Cultural',in:18,time:'17:30',venue:'Amphitheatre',seats:90,desc:'Perform or just listen. Poetry, stand-up, music and storytelling under the evening sky.'},
  {id:8,name:'UI/UX Design Sprint',cat:'Workshop',in:21,time:'10:30',venue:'Design Studio, Block A',seats:40,desc:'Go from problem statement to clickable prototype in one day using Figma.'},
  {id:9,name:'Startup Pitch Day',cat:'Career',in:25,time:'13:00',venue:'Incubation Centre',seats:100,desc:'Pitch your idea to founders and investors. Best three ideas receive seed mentoring.'}
];
const base = new Date(); base.setHours(0,0,0,0);
EVENTS.forEach(e => { const d = new Date(base); d.setDate(d.getDate() + e.in); const [h,m] = e.time.split(':'); d.setHours(+h, +m); e.start = d; });
const CATS = ['All', ...new Set(EVENTS.map(e => e.cat))];
const HUE = {Tech:250,Cultural:335,Sports:95,Workshop:28,Career:195};

/* ---------- Storage ---------- */
const KEY = 'eventide_regs';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const save = r => { try { localStorage.setItem(KEY, JSON.stringify(r)); } catch {} };
let regs = load();
const seatsLeft = e => e.seats - regs.filter(r => r.eventId === e.id).length;
const byId = id => EVENTS.find(e => e.id === +id);

/* ---------- Helpers ---------- */
function cover(e) {
  const h = HUE[e.cat]; let s = e.id * 97;
  const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  let sh = '';
  for (let i = 0; i < 8; i++) {
    const x = r()*400, y = r()*240, z = 30 + r()*90;
    sh += i % 2
      ? `<circle cx="${x}" cy="${y}" r="${z/2}" fill="hsl(${h+40} 90% 70%)" opacity=".55"/>`
      : `<rect x="${x}" y="${y}" width="${z}" height="${z}" rx="14" transform="rotate(${r()*60} ${x} ${y})" fill="hsl(${h-30} 85% 25%)" opacity=".5"/>`;
  }
  return 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h} 80% 55%)"/><stop offset="1" stop-color="hsl(${h+50} 80% 35%)"/></linearGradient></defs><rect width="400" height="240" fill="url(#g)"/>${sh}</svg>`);
}
const fmtDate = d => d.toLocaleDateString('en-IN', {weekday:'short', day:'numeric', month:'short', year:'numeric'});
const fmtTime = d => d.toLocaleTimeString('en-IN', {hour:'numeric', minute:'2-digit'});
const cdHTML = ms => {
  if (ms <= 0) return '<div><b>0</b><small>Started</small></div>';
  const t = Math.floor(ms / 1000);
  const v = [Math.floor(t/86400), Math.floor(t%86400/3600), Math.floor(t%3600/60), t%60];
  return ['days','hrs','min','sec'].map((l,i) => `<div><b>${String(v[i]).padStart(2,'0')}</b><small>${l}</small></div>`).join('');
};

/* ---------- Theme ---------- */
const root = document.documentElement;
const savedTheme = localStorage.getItem('eventide_theme');
root.dataset.theme = savedTheme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
$('#themeBtn').addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('eventide_theme', root.dataset.theme); } catch {}
});

/* ---------- Listing: search + filter ---------- */
let cat = 'All', q = '';
$('#chips').innerHTML = CATS.map(c => `<button class="chip" aria-pressed="${c === 'All'}" data-cat="${c}">${c}</button>`).join('');
$('#chips').addEventListener('click', ev => {
  const b = ev.target.closest('.chip'); if (!b) return;
  cat = b.dataset.cat;
  document.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c === b));
  render();
});
$('#search').addEventListener('input', ev => { q = ev.target.value.trim().toLowerCase(); render(); });

function render() {
  const list = EVENTS.filter(e => (cat === 'All' || e.cat === cat) && (e.name + e.venue + e.desc + e.cat).toLowerCase().includes(q));
  $('#count').textContent = `${list.length} event${list.length === 1 ? '' : 's'} found`;
  $('#grid').innerHTML = list.length ? list.map(e => {
    const left = seatsLeft(e);
    return `<article class="card">
      <img src="${cover(e)}" alt="Artwork for ${esc(e.name)}" loading="lazy">
      <div class="card-body">
        <span class="tag">${e.cat}</span>
        <h3>${esc(e.name)}</h3>
        <p><b>${fmtDate(e.start)}</b> · ${fmtTime(e.start)}</p>
        <p>${esc(e.venue)}</p>
        <p>${esc(e.desc.split('. ')[0].replace(/\.$/, ''))}.</p>
        <div class="row"><span class="muted">${left > 0 ? left + ' seats left' : 'Fully booked'}</span>
        <button class="ghost" data-open="${e.id}">View details</button></div>
      </div></article>`;
  }).join('') : '<p class="empty">No events match your search. Try another keyword or category.</p>';
  $('#regCount').textContent = regs.length;
  hero();
}
$('#grid').addEventListener('click', ev => { const b = ev.target.closest('[data-open]'); if (b) openEvent(b.dataset.open); });

/* ---------- Hero: next event + countdown ---------- */
let nextEv;
function hero() {
  nextEv = EVENTS.filter(e => e.start > new Date()).sort((a,b) => a.start - b.start)[0] || EVENTS[0];
  $('#nextName').textContent = nextEv.name;
  $('#nextMeta').textContent = `${fmtDate(nextEv.start)} · ${fmtTime(nextEv.start)} · ${nextEv.venue}`;
  $('#nextClock').dataset.cd = nextEv.start.getTime();
}
$('#nextBtn').addEventListener('click', () => openEvent(nextEv.id));
function tick() { document.querySelectorAll('[data-cd]').forEach(el => { if (el.dataset.cd) el.innerHTML = cdHTML(+el.dataset.cd - Date.now()); }); }
setInterval(tick, 1000);

/* ---------- Event details + registration ---------- */
const dlg = $('#eventDlg');
function openEvent(id) {
  const e = byId(id), left = seatsLeft(e);
  const options = EVENTS.filter(x => seatsLeft(x) > 0).map(x => `<option value="${x.id}" ${x.id === e.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('');
  $('#dBody').innerHTML = `
    <img class="d-img" src="${cover(e)}" alt="Artwork for ${esc(e.name)}">
    <div class="d-pad">
      <span class="tag">${e.cat}</span>
      <h2 id="dTitle">${esc(e.name)}</h2>
      <ul class="facts"><li><b>When:</b> ${fmtDate(e.start)}, ${fmtTime(e.start)}</li><li><b>Where:</b> ${esc(e.venue)}</li><li><b>Seats left:</b> ${left} of ${e.seats}</li></ul>
      <p>${esc(e.desc)}</p>
      <div class="mini" data-cd="${e.start.getTime()}"></div>
      <hr>
      ${left > 0 ? `<h3>Register for this event</h3>
      <form id="regForm" novalidate>
        <div class="f"><label for="fName">Full name</label><input id="fName" name="name" autocomplete="name" required><p class="err"></p></div>
        <div class="f"><label for="fEmail">Email address</label><input id="fEmail" name="email" type="email" autocomplete="email" required><p class="err"></p></div>
        <div class="f"><label for="fPhone">Phone number</label><input id="fPhone" name="phone" type="tel" inputmode="numeric" autocomplete="tel" placeholder="10-digit mobile number" required><p class="err"></p></div>
        <div class="f"><label for="fEvent">Event</label><select id="fEvent" name="event">${options}</select><p class="err"></p></div>
        <button class="btn" type="submit">Register for event</button>
      </form>` : '<p><b>This event is fully booked.</b> Browse other events from the list.</p>'}
    </div>`;
  tick();
  if (!dlg.open) dlg.showModal();
  const form = $('#regForm'); if (form) wire(form);
}

const RULES = {
  name: v => !v ? 'Enter your full name.' : !/^[A-Za-z][A-Za-z .'-]{2,}$/.test(v) ? 'Use at least 3 letters. Numbers are not allowed.' : '',
  email: v => !v ? 'Enter your email address.' : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? 'Enter a valid email, like name@example.com.' : '',
  phone: v => { const d = v.replace(/[\s-]/g, '').replace(/^(\+91|0)/, ''); return !v ? 'Enter your phone number.' : !/^[6-9]\d{9}$/.test(d) ? 'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.' : ''; },
  event: v => !v ? 'Select an event.' : seatsLeft(byId(v)) < 1 ? 'This event is fully booked.' : ''
};
function check(field) {
  const box = field.closest('.f'), msg = RULES[field.name](field.value.trim());
  box.classList.toggle('bad', !!msg); box.classList.toggle('good', !msg);
  $('.err', box).textContent = msg; field.setAttribute('aria-invalid', !!msg);
  return !msg;
}
function wire(form) {
  form.querySelectorAll('input,select').forEach(f => { f.addEventListener('blur', () => check(f)); f.addEventListener('input', () => f.closest('.f').classList.contains('bad') && check(f)); });
  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const fields = [...form.querySelectorAll('input,select')];
    const ok = fields.map(check).every(Boolean);
    if (!ok) { fields.find(f => f.getAttribute('aria-invalid') === 'true').focus(); return; }
    const d = Object.fromEntries(new FormData(form));
    const eventId = +d.event, email = d.email.trim().toLowerCase();
    if (regs.some(r => r.eventId === eventId && r.email === email)) {
      const f = $('#fEmail'); f.closest('.f').classList.replace('good', 'bad'); $('.err', f.closest('.f')).textContent = 'This email is already registered for this event.'; f.focus(); return;
    }
    const rec = {ref: 'EVT' + Date.now().toString(36).toUpperCase(), eventId, name: d.name.trim(), email, phone: d.phone.trim(), at: new Date().toISOString()};
    regs.push(rec); save(regs); render(); confirmView(rec);
  });
}
function confirmView(r) {
  const e = byId(r.eventId);
  $('#dBody').innerHTML = `<div class="done" role="status"><div class="tick">✓</div>
    <h2 id="dTitle">You're registered, ${esc(r.name.split(' ')[0])}!</h2>
    <p><b>${esc(e.name)}</b><br>${fmtDate(e.start)}, ${fmtTime(e.start)} · ${esc(e.venue)}</p>
    <p class="muted">Confirmation sent to ${esc(r.email)}<br>Reference: <b>${r.ref}</b></p>
    <button class="btn" data-close>Done</button></div>`;
}

/* ---------- My registrations ---------- */
const rd = $('#regsDlg');
function renderRegs() {
  $('#regList').innerHTML = regs.length ? regs.map(r => { const e = byId(r.eventId); return `<div class="reg"><div><b>${esc(e.name)}</b><small>${fmtDate(e.start)} · ${esc(r.name)} · ${r.ref}</small></div><button class="ghost" data-cancel="${r.ref}">Cancel</button></div>`; }).join('') : '<p class="muted">You have not registered for any event yet.</p>';
}
$('#myRegsBtn').addEventListener('click', () => { renderRegs(); rd.showModal(); });
rd.addEventListener('click', ev => {
  const b = ev.target.closest('[data-cancel]'); if (!b) return;
  regs = regs.filter(r => r.ref !== b.dataset.cancel); save(regs); renderRegs(); render();
});

/* ---------- Dialog closing ---------- */
document.querySelectorAll('dialog').forEach(d => d.addEventListener('click', ev => { if (ev.target === d || ev.target.closest('[data-close]')) d.close(); }));

render(); tick();
