import { sb, googleEnabled } from './supabase.js';
import { REALMS, CLASSES, EVENT_START, EVENT_END } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

let user = null;
let reg = null;
let hooks = {};

export async function initRegister(h) {
  hooks = h;
  buildPickers();
  bindForm();
  bindPass();

  $('#googleBtn').addEventListener('click', signIn);
  $$('[data-signout]').forEach((b) => b.addEventListener('click', signOut));
  $('#navUser').addEventListener('click', () => hooks.scrollTo?.('#register'));

  // surface OAuth errors that come back in the URL (e.g. provider not enabled)
  const params = new URLSearchParams(location.search + '&' + location.hash.replace(/^#/, ''));
  const oauthErr = params.get('error_description');
  if (oauthErr) {
    hooks.toast?.(decodeURIComponent(oauthErr).replace(/\+/g, ' '));
    history.replaceState(null, '', location.pathname + '#register');
  }

  googleEnabled().then((ok) => {
    if (!ok) {
      const w = $('#authWarn');
      w.hidden = false;
      w.textContent = 'Heads up: Google sign-in is still being switched on by the organisers. Try again in a bit.';
    }
  });

  sb.auth.onAuthStateChange((_evt, session) => {
    // defer so we never call Supabase inside the auth callback lock
    setTimeout(() => handleSession(session), 0);
  });
  const { data } = await sb.auth.getSession();
  await handleSession(data.session);
  refreshStats();
}

let lastUid = undefined;
async function handleSession(session) {
  const uid = session?.user?.id ?? null;
  if (uid === lastUid) return;
  lastUid = uid;
  user = session?.user ?? null;
  updateNav();

  if (!user) { reg = null; show('auth'); hooks.onTeam?.(null); return; }

  show('loading');
  const { data, error } = await sb.from('registrations').select('*').eq('user_id', user.id).maybeSingle();
  if (error) { hooks.toast?.('Could not load your file. ' + error.message); }
  reg = data || null;
  updateNav();
  const needsSquad = reg && !(reg.team_size && Array.isArray(reg.members) && reg.members.length);
  if (reg && !needsSquad) { renderPass(); show('pass'); hooks.onTeam?.(reg.realm, 'welcome'); }
  else {
    fillForm(); show('form');
    if (needsSquad) {
      const err = $('#formError');
      err.textContent = 'Welcome back. Registration now needs your full squad: pick how many members and add everyone\'s details below.';
      err.hidden = false;
      hooks.scrollTo?.('#register');
    }
  }

  if (new URLSearchParams(location.search).has('code') || location.hash === '#register') {
    history.replaceState(null, '', location.pathname + '#register');
    hooks.scrollTo?.('#register');
  }
}

function show(name) {
  $$('.pane').forEach((p) => (p.hidden = p.dataset.pane !== name));
  const titles = { loading: 'AUTH_TERMINAL', auth: 'AUTH_TERMINAL', form: 'HERO_FILE.NEW', pass: 'HERO_PASS.ISSUED' };
  $('#consoleTitle').textContent = titles[name];
  const step = { loading: 1, auth: 1, form: 2, pass: 3 }[name];
  $$('#steps li').forEach((li) => {
    const n = +li.dataset.step;
    li.classList.toggle('is-active', n === step);
    li.classList.toggle('is-done', n < step);
  });
  hooks.onPane?.(name);
}

function updateNav() {
  const nu = $('#navUser'), cta = $('#navCta');
  if (user) {
    const m = user.user_metadata || {};
    nu.hidden = false;
    setImg($('#navAvatar'), m.avatar_url || m.picture);
    $('#navName').textContent = (m.full_name || m.name || user.email).split(' ')[0];
    cta.textContent = reg ? 'My Pass' : 'Finish sign-up';
  } else {
    nu.hidden = true;
    cta.textContent = 'Join the Initiative';
  }
}

function setImg(img, src) {
  if (src) { img.src = src; img.hidden = false; img.onerror = () => (img.hidden = true); }
  else img.hidden = true;
}

async function signIn() {
  const btn = $('#googleBtn');
  btn.disabled = true;
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: location.origin + location.pathname, queryParams: { prompt: 'select_account' } },
  });
  if (error) { hooks.toast?.(error.message); btn.disabled = false; }
}

async function signOut() {
  await sb.auth.signOut();
  hooks.toast?.('Signed out. See you on the other side.');
}


/* ---------------- team members ---------------- */
const BATCHES = ['2022-26', '2023-27', '2024-28', '2025-29', '2026-30', 'Other'];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function memberBlock(i, m = {}, lockedEmail = '') {
  const lead = i === 0;
  return `
  <fieldset class="member" data-i="${i}">
    <legend><b>Member ${i + 1}</b>${lead ? ' <em>Team leader</em>' : ''}</legend>
    <div class="field-row">
      <label class="field"><span>Full name</span><input data-k="name" maxlength="80" value="${esc(m.name)}" autocomplete="${lead ? 'name' : 'off'}" /></label>
      <label class="field"><span>Enrollment number</span><input data-k="enrollment" maxlength="20" value="${esc(m.enrollment)}" placeholder="e.g. E23CSEU0001" autocapitalize="characters" /></label>
    </div>
    <div class="field-row">
      <label class="field"><span>Batch</span><input data-k="batch" name="batch-${i}-x" maxlength="20" value="${esc(m.batch)}" autocomplete="off" autocorrect="off" spellcheck="false" /></label>
      <label class="field"><span>Branch</span><input data-k="branch" name="branch-${i}-x" maxlength="60" value="${esc(m.branch)}" autocomplete="off" autocorrect="off" spellcheck="false" /></label>
    </div>
    <div class="field-row">
      <label class="field"><span>Microsoft (Outlook) ID</span><input data-k="email" type="email" maxlength="120" value="${esc(m.email)}" placeholder="enrollment@bennett.edu.in" autocomplete="off" /></label>
      <div class="field"><span>Stay</span>
        <div class="stay">
          <label><input type="radio" name="stay-${i}" value="Hosteller" ${m.stay === 'Hosteller' ? 'checked' : ''} /><span>Hosteller</span></label>
          <label><input type="radio" name="stay-${i}" value="Day Scholar" ${m.stay === 'Day Scholar' ? 'checked' : ''} /><span>Day scholar</span></label>
        </div>
      </div>
    </div>
  </fieldset>`;
}
function readMembers() {
  return $$('#members .member').map((fs) => {
    const o = {};
    $$('[data-k]', fs).forEach((el) => { o[el.dataset.k] = el.value.trim(); });
    o.stay = $(`input[name="stay-${fs.dataset.i}"]:checked`, fs)?.value || '';
    return o;
  });
}
function renderMembers(n, keep) {
  const old = keep || readMembers();
  const box = $('#members');
  if (!n) { box.innerHTML = ''; return; }
  box.innerHTML = `<p class="members__head">Step 3 · Member details</p>` + Array.from({ length: n }, (_, i) => memberBlock(i, old[i] || {})).join('');
  if (!old[0]?.name && user) { const inp = $('#members .member [data-k=name]'); if (inp) inp.value = user.user_metadata?.full_name || user.user_metadata?.name || ''; }
}

/* ---------------- form ---------------- */
function buildPickers() {
  $('#classPicker').innerHTML = CLASSES.map((c) => `
    <div class="cls">
      <input type="radio" name="hero_class" id="cls-${c.id}" value="${c.id}" />
      <label for="cls-${c.id}">${c.icon}<b>${c.name}</b><small>${c.desc}</small></label>
    </div>`).join('');
  $('#realmPicker').innerHTML = REALMS.map((r) => `
    <div class="chip">
      <input type="radio" name="realm" id="realm-${r.id}" value="${r.id}" />
      <label for="realm-${r.id}" style="--c:${r.color}">${r.name} <span class="chip__x">× ${r.team}</span></label>
    </div>`).join('');
}

function fillForm() {
  const f = $('#regForm');
  const m = user.user_metadata || {};
  setImg($('#formAvatar'), m.avatar_url || m.picture);
  $('#formEmail').textContent = user.email;
  const src = reg || {};
  f.hero_alias.value = src.hero_alias || '';
  f.team_name.value = src.team_name || '';
  const size = src.team_size || (Array.isArray(src.members) && src.members.length) || 0;
  $$('input[name=team_size]', f).forEach((i) => (i.checked = +i.value === size));
  renderMembers(size, Array.isArray(src.members) ? src.members : []);
  const preCls = src.hero_class || hooks.getPreferredClass?.();
  $$('input[name=hero_class]', f).forEach((i) => (i.checked = i.value === preCls));
  const pre = src.realm || hooks.getPreferredRealm?.();
  $$('input[name=realm]', f).forEach((i) => (i.checked = i.value === pre));
  $('#submitBtn').innerHTML = reg ? 'Save changes <i>→</i>' : 'Generate Hero Pass <i>→</i>';
  $('#cancelEdit').hidden = !reg;
  $('#formError').hidden = true;
  $$('.is-invalid', f).forEach((e) => e.classList.remove('is-invalid'));
}

export function preselectClass(id) {
  const i = document.getElementById('cls-' + id);
  if (i) { i.checked = true; i.closest('.picker')?.classList.remove('is-invalid'); }
}

export function preselectRealm(id) {
  const i = document.getElementById('realm-' + id);
  if (i) i.checked = true;
}

function bindForm() {
  const f = $('#regForm');
  f.addEventListener('input', (e) => e.target.classList?.remove('is-invalid'));
  f.addEventListener('change', (e) => e.target.closest('.stay')?.classList.remove('is-invalid'));
  f.addEventListener('change', (e) => {
    e.target.closest('.picker')?.classList.remove('is-invalid');
    if (e.target.name === 'realm') hooks.onTeam?.(e.target.value, 'preview');
    if (e.target.name === 'team_size') { renderMembers(+e.target.value); $('#members .member input')?.focus({ preventScroll: true }); }
  });
  $('#cancelEdit').addEventListener('click', () => { renderPass(); show('pass'); });

  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('#formError');
    err.hidden = true;
    const fd = new FormData(f);
    const v = Object.fromEntries([...fd.entries()].map(([k, val]) => [k, String(val).trim()]));

    const problems = [];
    const need = (name, ok, msg) => { if (!ok) { problems.push(msg); f[name]?.classList?.add('is-invalid'); } };
    if (!v.realm) { problems.push('a team'); $('#realmPicker').closest('.picker').classList.add('is-invalid'); }
    const size = +v.team_size || 0;
    if (!size) { problems.push('how many members'); $('#sizeBlock').classList.add('is-invalid'); }
    const members = readMembers();
    const emailRe = /^[^\s@]+@(bennett\.edu\.in|outlook\.[a-z.]+|hotmail\.[a-z.]+|live\.[a-z.]+|msn\.com)$/i;
    const seen = new Set();
    $$('#members .member').forEach((fs, i) => {
      const mm = members[i], miss = [];
      const mark = (k) => $(`[data-k=${k}]`, fs)?.classList.add('is-invalid');
      if (!mm.name || mm.name.length < 2) { miss.push('name'); mark('name'); }
      if (!/^[A-Za-z0-9]{5,20}$/.test(mm.enrollment)) { miss.push('enrollment number'); mark('enrollment'); }
      else if (seen.has(mm.enrollment.toUpperCase())) { miss.push('a different enrollment number'); mark('enrollment'); }
      else seen.add(mm.enrollment.toUpperCase());
      if (!mm.batch) { miss.push('batch'); mark('batch'); }
      if (!mm.branch) { miss.push('branch'); mark('branch'); }
      if (!emailRe.test(mm.email)) { miss.push('Microsoft (Outlook) ID, like enrollment@bennett.edu.in'); mark('email'); }
      else if (seen.has('@' + mm.email.toLowerCase())) { miss.push('a different Microsoft ID'); mark('email'); }
      else seen.add('@' + mm.email.toLowerCase());
      if (!mm.stay) { miss.push('hosteller or day scholar'); fs.querySelector('.stay')?.classList.add('is-invalid'); }
      if (miss.length) problems.push(`member ${i + 1}'s ${miss.join(', ')}`);
    });
    need('hero_alias', v.hero_alias?.length >= 2, "the leader's hero alias");
    if (!v.hero_class) { problems.push("the leader's role"); $('#classPicker').closest('.picker').classList.add('is-invalid'); }
    if (problems.length) {
      err.textContent = 'Almost there. Please add ' + problems.join('; ') + '.';
      err.hidden = false;
      return;
    }

    const m = user.user_metadata || {};
    const lead = members[0];
    const row = {
      full_name: lead.name,
      hero_alias: v.hero_alias,
      college: 'Bennett University',
      year_of_study: lead.batch,
      phone: null,
      team_name: v.team_name || null,
      hero_class: v.hero_class,
      realm: v.realm,
      team_size: size,
      members: members.map((x, i) => ({ ...x, enrollment: x.enrollment.toUpperCase(), role: i === 0 ? 'Leader' : 'Member' })),
      avatar_url: m.avatar_url || m.picture || null,
    };

    const btn = $('#submitBtn');
    btn.disabled = true;
    btn.innerHTML = 'Transmitting...';
    let res;
    if (reg) {
      res = await sb.from('registrations').update(row).eq('user_id', user.id).select().single();
    } else {
      res = await sb.from('registrations').insert({ ...row, user_id: user.id, email: user.email }).select().single();
    }
    btn.disabled = false;

    if (res.error) {
      btn.innerHTML = reg ? 'Save changes <i>→</i>' : 'Generate Hero Pass <i>→</i>';
      const msg = res.error.code === '23505' ? 'You are already registered. Reload the page to see your pass.' : res.error.message;
      err.textContent = 'Transmission failed. ' + msg;
      err.hidden = false;
      return;
    }
    const wasNew = !reg;
    reg = res.data;
    updateNav();
    renderPass();
    show('pass');
    hooks.onTeam?.(reg.realm, 'suit');
    hooks.onRegistered?.(wasNew);
    setTimeout(sendRegistrationMail, 900);
    refreshStats();
  });
}

/* ---------------- pass ---------------- */
function hashBits(str, n) {
  let h = 2166136261;
  const out = [];
  for (let i = 0; i < n; i++) {
    h ^= str.charCodeAt(i % str.length) + i * 31;
    h = Math.imul(h, 16777619) >>> 0;
    out.push((h >>> 7) & 1);
  }
  return out;
}

// 9x9 symmetric access glyph derived from the pass code
function glyphMatrix(code) {
  const bits = hashBits(code, 45);
  const m = [];
  let k = 0;
  for (let y = 0; y < 9; y++) {
    const row = [];
    for (let x = 0; x < 5; x++) row.push(bits[k++]);
    m.push([...row, ...row.slice(0, 4).reverse()]);
  }
  const finder = (ox, oy) => { for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) m[oy + y][ox + x] = 1; };
  finder(0, 0); finder(6, 0); finder(0, 6);
  m[1][1] = 0; m[1][7] = 0; m[7][1] = 0;
  return m;
}

function initials(name) {
  return (name || '?').split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase();
}

function renderPass() {
  if (!reg) return;
  const realm = REALMS.find((r) => r.id === reg.realm) || REALMS[0];
  const cls = CLASSES.find((c) => c.id === reg.hero_class) || CLASSES[0];
  const pass = $('#pass');
  pass.style.setProperty('--c', realm.color);
  $('#passAlias').textContent = reg.hero_alias;
  $('#passName').textContent = `${reg.full_name} · Leader · ${reg.team_size || 1} ${(reg.team_size || 1) === 1 ? 'member' : 'members'}`;
  $('#passClass').textContent = cls.name;
  $('#passRealm').textContent = `${realm.name} × ${realm.team}`;
  $('#passCode').textContent = reg.pass_code;
  $('#passTeam').textContent = reg.team_name || 'Solo';
  $('#passInitials').textContent = initials(reg.full_name);
  setImg($('#passAvatar'), reg.avatar_url);
  const ms = Array.isArray(reg.members) ? reg.members : [];
  $('#squadList').innerHTML = ms.map((mm, i) => `<li><b>0${i + 1}</b><span>${esc(mm.name)}${i === 0 ? ' · Leader' : ''}</span><small>${esc(mm.enrollment)} · ${esc(mm.branch)} · ${esc(mm.batch)} · ${esc(mm.stay)}</small></li>`).join('');
  $('#passGlyph').innerHTML = glyphMatrix(reg.pass_code).flat().map((b) => `<i class="${b ? '' : 'off'}"></i>`).join('');

  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const cal = new URL('https://calendar.google.com/calendar/render');
  cal.searchParams.set('action', 'TEMPLATE');
  cal.searchParams.set('text', "ASSEMBLE '26 · The Multiverse Hackathon");
  cal.searchParams.set('dates', `${fmt(EVENT_START)}/${fmt(EVENT_END)}`);
  cal.searchParams.set('details', `Hero Pass: ${reg.pass_code}\nTeam: ${realm.name} × ${realm.team}\nBring your laptop, charger and college ID.`);
  cal.searchParams.set('location', 'Bennett University, Greater Noida, Uttar Pradesh');
  $('#calLink').href = cal.toString();
}

function bindPass() {
  $('#editBtn').addEventListener('click', () => { fillForm(); show('form'); });
  $('#downloadPass').addEventListener('click', () => downloadPass());

  const pass = $('#pass');
  if (matchMedia('(hover: hover)').matches) {
    pass.addEventListener('pointermove', (e) => {
      const r = pass.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      pass.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 10}deg)`;
      pass.style.setProperty('--shine', `${(x + 0.5) * 100}%`);
    });
    pass.addEventListener('pointerleave', () => { pass.style.transform = ''; });
  }
}

function loadImg(src) {
  return new Promise((res) => {
    if (!src) return res(null);
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.referrerPolicy = 'no-referrer';
    i.onload = () => res(i);
    i.onerror = () => res(null);
    i.src = src;
  });
}

async function drawPass(skipAvatar = false) {
  if (!reg) return null;
  await document.fonts.ready;
  const W = 1600, H = 1000;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  const realm = REALMS.find((r) => r.id === reg.realm) || REALMS[0];
  const cls = CLASSES.find((k) => k.id === reg.hero_class) || CLASSES[0];

  x.fillStyle = '#0b0a0e'; x.fillRect(0, 0, W, H);
  // colour slash
  x.save();
  x.fillStyle = realm.color;
  x.beginPath(); x.moveTo(W * 0.55, 0); x.lineTo(W * 0.9, 0); x.lineTo(W * 0.72, H); x.lineTo(W * 0.37, H); x.closePath(); x.fill();
  // halftone
  x.fillStyle = 'rgba(7,6,10,0.45)';
  for (let yy = 0; yy < H; yy += 14) for (let xx = W * 0.5; xx < W; xx += 14) { x.beginPath(); x.arc(xx, yy, 2.2 * ((xx - W * 0.5) / (W * 0.5)), 0, Math.PI * 2); x.fill(); }
  x.restore();
  x.strokeStyle = 'rgba(243,237,228,0.25)'; x.lineWidth = 2; x.strokeRect(20, 20, W - 40, H - 40);

  // header
  x.fillStyle = '#f3ede4'; x.font = '64px Anton'; x.textBaseline = 'top';
  x.fillText("ASSEMBLE '26", 80, 70);
  x.fillStyle = '#f3ede4'; x.fillRect(W - 360, 76, 280, 56);
  x.fillStyle = '#07060a'; x.font = '600 28px "JetBrains Mono"'; x.fillText('HERO PASS', W - 336, 88);
  x.fillStyle = '#8f8a97'; x.font = '22px "JetBrains Mono"';
  x.fillText('GFG STUDENT CHAPTER · BENNETT UNIVERSITY', 80, 150);

  // photo
  const px = 80, py = 300, ps = 300;
  x.fillStyle = '#17141c'; x.fillRect(px, py, ps, ps);
  const img = skipAvatar ? null : await loadImg(reg.avatar_url);
  if (img) { try { x.drawImage(img, px, py, ps, ps); } catch { /* tainted */ } }
  else { x.fillStyle = '#f3ede4'; x.font = '140px Anton'; x.textAlign = 'center'; x.fillText(initials(reg.full_name), px + ps / 2, py + 70); x.textAlign = 'left'; }
  x.strokeStyle = '#f3ede4'; x.lineWidth = 6; x.strokeRect(px, py, ps, ps);

  // alias + info
  const tx = 440;
  x.fillStyle = '#8f8a97'; x.font = '22px "JetBrains Mono"'; x.fillText('ALIAS', tx, 300);
  x.fillStyle = '#f3ede4';
  let size = 140; x.font = `${size}px Anton`;
  const alias = reg.hero_alias.toUpperCase();
  while (x.measureText(alias).width > 760 && size > 60) { size -= 6; x.font = `${size}px Anton`; }
  x.fillText(alias, tx, 330);
  x.font = '500 32px "Space Grotesk"'; x.fillStyle = '#cfc8d4';
  x.fillText(`${reg.full_name} · Leader · ${reg.team_size || 1} members`.slice(0, 48), tx, 340 + size + 10);
  const tagY = 400 + size + 20;
  const tag = (label, at) => {
    x.font = '600 24px "JetBrains Mono"';
    const tw = x.measureText(label).width + 36;
    x.fillStyle = 'rgba(7,6,10,0.7)'; x.fillRect(at, tagY, tw, 52);
    x.strokeStyle = 'rgba(243,237,228,0.4)'; x.lineWidth = 2; x.strokeRect(at, tagY, tw, 52);
    x.fillStyle = '#f3ede4'; x.fillText(label, at + 18, tagY + 13);
    return at + tw + 16;
  };
  let nx = tag(cls.name.toUpperCase(), tx);
  tag(`${realm.name} × ${realm.team}`.toUpperCase(), nx);

  // glyph
  const m = glyphMatrix(reg.pass_code);
  const gs = 220, gx = W - 80 - gs, gy = 330, cell = (gs - 20) / 9;
  x.fillStyle = '#f3ede4'; x.fillRect(gx, gy, gs, gs);
  x.fillStyle = '#07060a';
  m.forEach((row, yy) => row.forEach((b, xx) => { if (b) x.fillRect(gx + 10 + xx * cell + 1, gy + 10 + yy * cell + 1, cell - 2, cell - 2); }));

  // footer
  x.fillStyle = 'rgba(243,237,228,0.25)'; x.fillRect(80, H - 200, W - 160, 2);
  const foot = [['PASS CODE', reg.pass_code], ['SQUAD', (reg.team_name || 'SOLO').toUpperCase().slice(0, 18)], ['DATE', 'OCT 24-25, 2026'], ['VENUE', 'BENNETT UNIVERSITY']];
  foot.forEach(([k, v], i) => {
    const fx = 80 + i * 370;
    x.fillStyle = '#8f8a97'; x.font = '20px "JetBrains Mono"'; x.fillText(k, fx, H - 165);
    x.fillStyle = '#f3ede4'; x.font = '600 34px "JetBrains Mono"'; x.fillText(v, fx, H - 130);
  });

  return c;
}

async function passDataUrl() {
  let c = await drawPass(false);
  try { return c.toDataURL('image/png'); }
  catch { c = await drawPass(true); return c.toDataURL('image/png'); } // avatar blocked the canvas
}

async function downloadPass() {
  if (!reg) return;
  const a = document.createElement('a');
  a.download = `hero-pass-${reg.pass_code}.png`;
  a.href = await passDataUrl();
  a.click();
  hooks.toast?.('Hero Pass saved. Welcome to the Initiative.');
}

async function sendRegistrationMail() {
  try {
    const pass = await passDataUrl();
    const { data, error } = await sb.functions.invoke('send-registration-mail', { body: { pass } });
    if (error) throw error;
    if (data?.sent) hooks.toast?.(`Confirmation email with your Hero Pass sent to ${data.sent} ${data.sent === 1 ? 'member' : 'members'}.`);
  } catch (e) {
    console.warn('Registration email failed', e);
  }
}

export async function refreshStats() {
  const { data } = await sb.rpc('event_stats');
  if (data) hooks.onStats?.(data);
}
