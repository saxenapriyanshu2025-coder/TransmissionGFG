import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initPortal } from './portal.js';
import { initRegister, preselectRealm, preselectClass } from './register.js';
import { REALMS, TIMELINE, FAQ, EVENT_START, HEROES } from './data.js';
import teaserMp4 from './assets/teaser.mp4?url';
import teaserWebm from './assets/teaser.webm?url';
import teaserPoster from './assets/teaser-poster.jpg?url';
import introMp4 from './assets/intro.mp4?url';
import introWebm from './assets/intro.webm?url';

gsap.registerPlugin(ScrollTrigger);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------------- toast ---------------- */
let toastT;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('is-on');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('is-on'), 4200);
}

/* ---------------- render dynamic content ---------------- */
$('#realmsGrid').innerHTML = REALMS.map((r, i) => `
  <article class="realm ${r.photo ? 'has-photo' : ''}" style="--c:${r.color}" data-realm="${r.id}" data-cursor="PICK">
    <div class="realm__top"><span>R.0${i + 1}</span><span class="realm__glyph">${r.glyph}</span></div>
    ${r.photo ? `<img class="realm__photo ${r.photoBlend ? 'is-blend' : ''}" src="${r.photo}" alt="${r.team}" loading="lazy" />` : ''}
    <small class="realm__team">Team</small>
    <h3>${r.name}</h3>
    <span class="realm__member"><i>×</i> ${r.team}</span>
    <span class="realm__domain">${r.domain}</span>
    <p>${r.blurb}</p>
    <span class="realm__bar"></span>
  </article>`).join('');


$('#rosterRow').innerHTML = REALMS.map((r, i) => `
  <article class="hero-card ${i === 0 ? 'is-active' : ''}" style="--c:${r.color}" data-realm="${r.id}" data-cursor="JOIN" tabindex="0" role="button" aria-label="Join team ${r.name}, with ${r.team}">
    <span class="hero-card__num" aria-hidden="true">0${i + 1}</span>
    <div class="hero-card__art ${r.photoBlend ? 'is-blend' : ''}">${r.photo ? `<img src="${r.photo}" alt="${r.team}" loading="lazy" />` : r.glyph}</div>
    <span class="hero-card__label" aria-hidden="true">${r.name}</span>
    <div class="hero-card__info">
      <small>R.0${i + 1} · TEAM</small>
      <h3>${r.name}</h3>
      <b class="hero-card__member">× ${r.team}</b>
      <p>${r.blurb}</p>
      <div class="hteam"><span>Track</span><b>${r.domain}</b><span>Power</span><b>${r.why}</b></div>
      <span class="hero-card__cta">Join this team →</span>
    </div>
  </article>`).join('');

$('#lineup').innerHTML = REALMS.map((r) => `
  <button class="lineup__item" style="--c:${r.color}" data-realm="${r.id}" data-cursor="MEET">
    <span class="lineup__pic ${r.photoBlend ? 'is-blend' : ''}">${r.photo ? `<img src="${r.photo}" alt="" />` : ''}</span>
    <span class="lineup__txt"><b>${r.name}</b><small>× ${r.team}</small></span>
  </button>`).join('');

let n = 0;
$('#tlTrack').innerHTML = TIMELINE.map((e) => {
  if (e.day) return `<div class="tl tl--day"><span class="tl__code">${e.date}</span><b>${e.day.split(' ')[1]}</b><div><h4>${e.day}</h4><p>${e.note}</p></div></div>`;
  n++;
  return `<div class="tl ${e.hot ? 'tl--hot' : ''}" data-n="${String(n).padStart(2, '0')}"><span class="tl__time">${e.t}</span><span class="tl__code">${e.code}</span><h4>${e.title}</h4><p>${e.text}</p></div>`;
}).join('');

$('#faqList').innerHTML = FAQ.map(([q, a], i) => `
  <div class="qa">
    <button aria-expanded="false" aria-controls="qa-${i}" id="qb-${i}"><span>${q}</span><span class="qa__icon" aria-hidden="true"></span></button>
    <div class="qa__a" id="qa-${i}" role="region" aria-labelledby="qb-${i}"><p>${a}</p></div>
  </div>`).join('');

/* ---------------- smooth scroll ---------------- */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
function scrollTo(target) {
  const el = typeof target === 'string' ? $(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 });
  else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (id.length < 2) return;
  e.preventDefault();
  closeMenu();
  scrollTo(id);
});

/* ---------------- nav ---------------- */
const nav = $('#nav');
let lastY = 0;
function onScroll(y) {
  nav.classList.toggle('is-scrolled', y > 40);
  const menuOpen = $('#menu').classList.contains('is-open');
  nav.classList.toggle('is-hidden', !menuOpen && y > lastY && y > 400);
  lastY = y;
}
if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll));
else addEventListener('scroll', () => onScroll(scrollY), { passive: true });

const burger = $('#burger'), menu = $('#menu');
function closeMenu() {
  menu.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-hidden', 'true');
  lenis?.start();
}
burger.addEventListener('click', () => {
  const open = !menu.classList.contains('is-open');
  menu.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-hidden', String(!open));
  if (open) {
    lenis?.stop();
    gsap.fromTo($$('.menu nav a'), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.05, duration: 0.8, ease: 'expo.out', delay: 0.2 });
  } else lenis?.start();
});
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

// active section highlight
$$('.nav__links a').forEach((a) => {
  const sec = $(a.getAttribute('href'));
  if (!sec) return;
  ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => a.classList.toggle('is-active', s.isActive) });
});

/* ---------------- cursor ---------------- */
if (finePointer && !reduced) {
  const cur = $('#cursor'), label = $('#cursorLabel');
  const xTo = gsap.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' });
  const yTo = gsap.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' });
  addEventListener('pointermove', (e) => { cur.classList.add('is-live'); xTo(e.clientX); yTo(e.clientY); });
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cursor], a, button, label');
    if (!t) return;
    cur.classList.add('is-big');
    label.textContent = t.dataset.cursor || '';
  });
  document.addEventListener('pointerout', (e) => {
    const t = e.target.closest('[data-cursor], a, button, label');
    if (t && !t.contains(e.relatedTarget)) { cur.classList.remove('is-big'); label.textContent = ''; }
  });
} else {
  $('#cursor').remove();
}

/* ---------------- hero ---------------- */
const portal = initPortal($('#portal'));
const word = $('.hero__word');
if (finePointer) {
  addEventListener('pointermove', (e) => {
    word.style.setProperty('--mx', (e.clientX / innerWidth - 0.5).toFixed(3));
    word.style.setProperty('--my', (e.clientY / innerHeight - 0.5).toFixed(3));
  }, { passive: true });
}

function heroIntro() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from('.hero__word .ch', { yPercent: 110, rotate: 8, opacity: 0, duration: 1.3, stagger: 0.06 })
    .from('.hero .reveal-up', { y: 40, opacity: 0, duration: 1, stagger: 0.1 }, '-=0.9')
    .from('.hud', { opacity: 0, duration: 1, stagger: 0.08 }, '-=0.9')
  portal.burst();
}

// scroll-out parallax for hero
if (!reduced) {
  gsap.to('.hero__inner', { yPercent: -10, opacity: 0.35, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__word .ch', { yPercent: (i) => (i % 2 ? -20 : -8), ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
}

/* ---------------- countdown ---------------- */
const cd = Object.fromEntries($$('[data-cd]').map((b) => [b.dataset.cd, b]));
function tick() {
  let s = Math.max(0, Math.floor((EVENT_START - Date.now()) / 1000));
  const d = Math.floor(s / 86400); s -= d * 86400;
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60); s -= m * 60;
  const vals = { d, h, m, s };
  for (const k in vals) {
    const v = String(vals[k]).padStart(2, '0');
    if (cd[k].textContent !== v) {
      cd[k].textContent = v;
      if (k === 's' && !reduced) gsap.fromTo(cd[k], { y: -6, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' });
    }
  }
}
tick();
setInterval(tick, 1000);

/* ---------------- marquee ---------------- */
$$('.marquee__row').forEach((row) => {
  const track = $('.marquee__track', row);
  const dir = +row.dataset.dir;
  let x = 0, speed = 1;
  gsap.ticker.add(() => {
    const half = track.scrollWidth / 2;
    x -= (0.6 + speed) * dir;
    if (dir > 0 && x <= -half) x += half;
    if (dir < 0 && x >= 0) x -= half;
    speed += (1 - speed) * 0.05;
    gsap.set(track, { x });
  });
  if (dir < 0) x = -track.scrollWidth / 2;
  lenis?.on('scroll', ({ velocity }) => { speed = 1 + Math.min(Math.abs(velocity) * 0.6, 14); });
});

/* ---------------- split headings ---------------- */
function splitLines(el) {
  // wrap each word, then group by line after layout
  const nodes = [...el.childNodes];
  el.innerHTML = '';
  const words = [];
  nodes.forEach((nd) => {
    if (nd.nodeType === 3) {
      nd.textContent.split(/(\s+)/).forEach((w) => {
        if (!w) return;
        if (/^\s+$/.test(w)) { el.appendChild(document.createTextNode(' ')); return; }
        const s = document.createElement('span'); s.textContent = w; el.appendChild(s); words.push(s);
      });
    } else if (nd.nodeType === 1) {
      const txt = nd.textContent.trim().split(/\s+/);
      txt.forEach((w, i) => {
        const s = nd.cloneNode(false); s.textContent = w; el.appendChild(s); words.push(s);
        if (i < txt.length - 1) el.appendChild(document.createTextNode(' '));
      });
    }
  });
  const lines = [];
  let top = null;
  words.forEach((w) => {
    const t = w.offsetTop;
    if (top === null || Math.abs(t - top) > 4) { lines.push([]); top = t; }
    lines[lines.length - 1].push(w);
  });
  el.innerHTML = '';
  lines.forEach((ws) => {
    const line = document.createElement('span'); line.className = 'line';
    const inner = document.createElement('span');
    ws.forEach((w, i) => { inner.appendChild(w); if (i < ws.length - 1) inner.appendChild(document.createTextNode(' ')); });
    line.appendChild(inner); el.appendChild(line);
  });
  return $$('.line > span', el);
}

/* ---------------- scroll reveals ---------------- */
function reveals() {
  if (reduced) return;
  $$('.split-lines').forEach((el) => {
    const inner = splitLines(el);
    gsap.from(inner, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  $$('.section__head').forEach((el) => gsap.from(el, { opacity: 0, y: 20, duration: 1, scrollTrigger: { trigger: el, start: 'top 90%' } }));
  gsap.from('.briefing__file', { clipPath: 'inset(0 0 100% 0)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: '.briefing__file', start: 'top 80%' } });
  gsap.from('.lineup__item', { opacity: 0, y: 30, stagger: 0.07, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.lineup', start: 'top 95%' } });
  gsap.from('.hero-card', { opacity: 0, y: 120, stagger: 0.08, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.roster__row', start: 'top 85%' } });
  gsap.from('.intel__item', { opacity: 0, y: 30, stagger: 0.08, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '.intel', start: 'top 90%' } });
  gsap.from('.realm', { opacity: 0, y: 80, rotateX: -18, stagger: 0.08, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.realms__grid', start: 'top 80%' } });
  gsap.from('.prize', { opacity: 0, y: 100, stagger: { each: 0.12, from: 'center' }, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.arsenal__grid', start: 'top 80%' } });
  gsap.from('.bounty', { opacity: 0, x: -30, stagger: 0.1, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '.bounties', start: 'top 92%' } });
  gsap.from('.console', { opacity: 0, y: 60, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.console', start: 'top 85%' } });
  gsap.from('.qa', { opacity: 0, y: 24, stagger: 0.06, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: '.faq__list', start: 'top 85%' } });
  gsap.from('.footer__word', { yPercent: 40, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.footer__word', start: 'top 95%' } });
  gsap.to('.register__bg', { xPercent: -15, ease: 'none', scrollTrigger: { trigger: '.register', start: 'top bottom', end: 'bottom top', scrub: true } });
}

/* ---------------- count up ---------------- */
$$('[data-count]').forEach((el) => {
  const end = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
  const set = (v) => (el.textContent = pre + Math.round(v) + suf);
  if (reduced) return set(end);
  const o = { v: 0 };
  ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 2, ease: 'power3.out', onUpdate: () => set(o.v) }) });
});

/* ---------------- realm cards: tilt + spotlight + pick ---------------- */
$$('.realm').forEach((card) => {
  if (finePointer && !reduced) {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--x', px * 100 + '%');
      card.style.setProperty('--y', py * 100 + '%');
      card.style.transform = `rotateY(${(px - 0.5) * 10}deg) rotateX(${(0.5 - py) * 10}deg)`;
    });
    card.addEventListener('pointerleave', () => (card.style.transform = ''));
  }
  card.addEventListener('click', () => {
    preferredRealm = card.dataset.realm;
    preselectRealm(preferredRealm);
    const r = REALMS.find((x) => x.id === preferredRealm);
    toast(`Team ${r.name} × ${r.team} picked. Sign in to make it official.`);
    setTimeout(() => scrollTo('#register'), 500);
  });
});

$$('[data-tilt]').forEach((card) => {
  if (!finePointer || reduced) return;
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `rotateY(${px * 12}deg) rotateX(${-py * 12}deg) translateZ(10px)`;
  });
  card.addEventListener('pointerleave', () => (card.style.transform = ''));
});

/* ---------------- timeline: horizontal pin on desktop ---------------- */
const mm = gsap.matchMedia();
mm.add('(min-width: 761px) and (prefers-reduced-motion: no-preference)', () => {
  const track = $('#tlTrack');
  const dist = () => track.scrollWidth - innerWidth;
  const tween = gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: {
      trigger: '.timeline', start: 'top top', end: () => '+=' + dist(), pin: '.timeline__pin', scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
    },
  });
  gsap.to('#tlProgress', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top top', end: () => '+=' + dist(), scrub: true } });
  $$('.tl').forEach((c) => gsap.from(c, { opacity: 0.25, scale: 0.94, duration: 0.5, scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 90%', toggleActions: 'play none none reverse' } }));
});
mm.add('(max-width: 760px) and (prefers-reduced-motion: no-preference)', () => {
  $$('.tl').forEach((c) => gsap.from(c, { opacity: 0, x: -30, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 90%' } }));
});


/* ---------------- roster (six teams) + hero lineup ---------------- */
let preferredClass = null;
let preferredRealm = null;
function activateCard(card) {
  $$('.hero-card.is-active').forEach((c) => c !== card && c.classList.remove('is-active'));
  card.classList.add('is-active');
}
$$('.hero-card').forEach((card) => {
  card.addEventListener('mouseenter', () => activateCard(card));
  card.addEventListener('focus', () => activateCard(card));
  const choose = () => {
    activateCard(card);
    preferredRealm = card.dataset.realm;
    preselectRealm(preferredRealm);
    const r = REALMS.find((x) => x.id === preferredRealm);
    toast(`Team ${r.name} × ${r.team} picked. Sign in to make it official.`);
    setTimeout(() => scrollTo('#register'), 500);
  };
  card.addEventListener('click', choose);
  card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } });
});
$$('.lineup__item').forEach((b) => b.addEventListener('click', () => {
  const card = $(`.hero-card[data-realm="${b.dataset.realm}"]`);
  if (card) activateCard(card);
  scrollTo('#roster');
}));

/* ---------------- videos: showreel, trailer popup, pill ---------------- */
// Both videos are original and ship with the site, so they play everywhere, even offline.
const canH264 = !!document.createElement('video').canPlayType('video/mp4; codecs="avc1.640028"');
const teaserUrl = canH264 ? teaserMp4 : teaserWebm;
const introUrl = canH264 ? introMp4 : introWebm;
// data: URIs (single-file build) seek badly, so turn them into blob URLs once
const urlCache = {};
function playableUrl(url) {
  if (!url.startsWith('data:')) return Promise.resolve(url);
  return (urlCache[url] ||= fetch(url).then((r) => r.blob()).then((b) => URL.createObjectURL(b)).catch(() => url));
}

/* ---- teaser: full-screen showreel at the top of the page ---- */
const show = $('#showVideo'), showreel = $('.showreel');
show.poster = teaserPoster;
show.muted = true;
playableUrl(teaserUrl).then((u) => { show.src = u; });
let showInView = true, theatreOpen = false, startedShow = false;
function syncShow() {
  if (showInView && !theatreOpen) show.play().catch(() => {});
  else show.pause();
}
new IntersectionObserver(([en]) => {
  const was = showInView;
  showInView = en.intersectionRatio > 0.35;
  if (showInView && !was) { show.currentTime = 0; firedThisPlay = false; } // coming back up = watch it again from the start
  syncShow();
}, { threshold: [0, 0.35, 0.6] }).observe(showreel);
// Hand-off: every time the teaser reaches its ASSEMBLE title shot, glide down to the ASSEMBLE hero.
const HANDOFF_AT = 15.9; // seconds into the teaser
let firedThisPlay = false;
function handoff() {
  if (firedThisPlay) return;
  firedThisPlay = true;
  if (theatreOpen || scrollY > showreel.offsetHeight * 0.5) return; // visitor already moved on
  showreel.classList.add('is-leaving');
  scrollTo('#home');
  setTimeout(() => { showreel.classList.remove('is-leaving'); nav.classList.remove('is-hidden'); }, 1700);
}
show.addEventListener('timeupdate', () => {
  if (show.currentTime < 1) firedThisPlay = false; // new playthrough
  if (show.currentTime >= HANDOFF_AT) handoff();
});
show.addEventListener('ended', () => { show.currentTime = 0; show.play().catch(() => {}); });

$('#showSound').addEventListener('click', () => {
  show.muted = !show.muted;
  showreel.classList.toggle('is-sound', !show.muted);
  $('#showSound').setAttribute('aria-label', show.muted ? 'Turn sound on' : 'Turn sound off');
  if (!show.muted) show.play().catch(() => {});
});

/* ---- built-in player (inside the theatre) ---- */
const vp = $('#vp'), video = $('#vpVideo'), box = $('#theatreBox');
const fmt = (t) => (isFinite(t) ? `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}` : '0:00');
playableUrl(introUrl).then((u) => { video.src = u; });
let hideT;
function wake() {
  vp.classList.add('is-awake');
  clearTimeout(hideT);
  if (!video.paused) hideT = setTimeout(() => vp.classList.remove('is-awake'), 2200);
}
function syncState() {
  vp.classList.toggle('is-playing', !video.paused);
  $('#vpToggle').setAttribute('aria-label', video.paused ? 'Play' : 'Pause');
  wake();
}
video.addEventListener('play', syncState);
video.addEventListener('pause', syncState);
video.addEventListener('ended', () => setTimeout(closeTheatre, 600));
video.addEventListener('loadedmetadata', () => { $('#vpDur').textContent = fmt(video.duration); });
video.addEventListener('timeupdate', () => {
  const p = video.duration ? video.currentTime / video.duration : 0;
  $('#vpProg').style.transform = `scaleX(${p})`;
  $('#vpTrack').setAttribute('aria-valuenow', Math.round(p * 100));
  $('#vpCur').textContent = fmt(video.currentTime);
});
video.addEventListener('progress', () => {
  if (video.buffered.length && video.duration) $('#vpBuf').style.transform = `scaleX(${video.buffered.end(video.buffered.length - 1) / video.duration})`;
});
const toggle = () => (video.paused ? video.play() : video.pause());
video.addEventListener('click', toggle);
video.addEventListener('dblclick', () => fullscreen());
$('#vpToggle').addEventListener('click', toggle);
$('#vpMute').addEventListener('click', () => { video.muted = !video.muted; vp.classList.toggle('is-muted', video.muted); });
function fullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else if (vp.requestFullscreen) vp.requestFullscreen();
  else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
}
$('#vpFs').addEventListener('click', fullscreen);
const track = $('#vpTrack'), hover = $('#vpHover');
const pos = (e) => Math.min(1, Math.max(0, (e.clientX - track.getBoundingClientRect().left) / track.clientWidth));
let scrubbing = false;
track.addEventListener('pointerdown', (e) => { scrubbing = true; track.setPointerCapture(e.pointerId); video.currentTime = pos(e) * video.duration; });
track.addEventListener('pointermove', (e) => {
  const p = pos(e);
  hover.textContent = fmt(p * video.duration);
  hover.style.left = `${p * 100}%`;
  if (scrubbing) video.currentTime = p * video.duration;
});
track.addEventListener('pointerup', () => { scrubbing = false; });
vp.addEventListener('pointermove', wake);
vp.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (k === ' ' || k === 'k') { e.preventDefault(); toggle(); }
  else if (k === 'm') $('#vpMute').click();
  else if (k === 'f') fullscreen();
  else if (k === 'arrowright') video.currentTime = Math.min(video.duration, video.currentTime + 5);
  else if (k === 'arrowleft') video.currentTime = Math.max(0, video.currentTime - 5);
  else return;
  wake();
});

/* ---- trailer popup (opens automatically) + "Watch trailer" pill ---- */
const SKIP_AFTER = 5; // seconds before the Skip button unlocks
const pill = $('#pill'), theatre = $('#theatre');
let skipTimer;

function showPill() {
  pill.hidden = false;
  gsap.fromTo(pill, { y: 30, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(2)' });
}
function lockSkip() {
  const btn = $('#theatreClose'), label = $('#skipLabel');
  let left = SKIP_AFTER;
  btn.disabled = true;
  label.textContent = `Skip in ${left}`;
  clearInterval(skipTimer);
  skipTimer = setInterval(() => {
    left -= 1;
    if (left > 0) { label.textContent = `Skip in ${left}`; return; }
    clearInterval(skipTimer);
    btn.disabled = false;
    label.textContent = 'Skip trailer ⏭';
  }, 1000);
}
function startTrailer(withGesture) {
  video.currentTime = 0;
  video.muted = false;
  vp.classList.remove('is-muted');
  $('#theatreUnmute').hidden = true;
  video.play().catch(() => {
    // browsers block sound until the visitor taps, so fall back to muted and offer a sound button
    video.muted = true;
    vp.classList.add('is-muted');
    $('#theatreUnmute').hidden = withGesture;
    video.play().catch(() => {});
  });
}
function openTheatre(fromEl, withGesture) {
  theatreOpen = true; syncShow();
  const o = fromEl && !fromEl.hidden ? fromEl.getBoundingClientRect() : { left: innerWidth / 2 - 20, top: innerHeight / 2 - 20, width: 40, height: 40 };
  theatre.hidden = false;
  lenis?.stop();
  document.body.classList.add('is-loading');
  const b = box.getBoundingClientRect();
  const cx = o.left + o.width / 2 - b.left, cy = o.top + o.height / 2 - b.top;
  if (!pill.hidden) gsap.to(pill, { opacity: 0, scale: 0.9, duration: 0.25, onComplete: () => { pill.hidden = true; } });
  gsap.fromTo('#theatreBackdrop', { opacity: 0 }, { opacity: 1, duration: 0.5 });
  gsap.fromTo(box, { clipPath: `circle(${Math.max(o.width, o.height) / 2}px at ${cx}px ${cy}px)` }, { clipPath: `circle(${Math.hypot(b.width, b.height)}px at ${cx}px ${cy}px)`, duration: 1, ease: 'expo.inOut' });
  gsap.fromTo('#theatreClose', { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.6 });
  lockSkip();
  startTrailer(withGesture);
  vp.focus({ preventScroll: true });
}
function closeTheatre(force) {
  if (theatre.hidden) return;
  if (!force && $('#theatreClose').disabled) return;
  clearInterval(skipTimer);
  video.pause();
  if (document.fullscreenElement) document.exitFullscreen();
  const b = box.getBoundingClientRect();
  pill.hidden = false; pill.style.opacity = 0;
  const o = pill.getBoundingClientRect();
  const cx = o.left + o.width / 2 - b.left, cy = o.top + o.height / 2 - b.top;
  gsap.to('#theatreBackdrop', { opacity: 0, duration: 0.5, delay: 0.3 });
  gsap.to('#theatreClose', { opacity: 0, duration: 0.2 });
  gsap.to(box, { clipPath: `circle(${o.height / 2}px at ${cx}px ${cy}px)`, duration: 0.8, ease: 'expo.inOut', onComplete: () => {
    theatre.hidden = true;
    document.body.classList.remove('is-loading');
    lenis?.start();
    theatreOpen = false;
    if (!startedShow) { startedShow = true; show.currentTime = 0; firedThisPlay = false; }
    syncShow();
    showPill();
  } });
}
video.addEventListener('ended', () => setTimeout(() => closeTheatre(true), 500));
$('#theatreUnmute').addEventListener('click', () => {
  video.muted = false; vp.classList.remove('is-muted'); $('#theatreUnmute').hidden = true;
  video.currentTime = 0; video.play().catch(() => {});
});
pill.addEventListener('click', () => openTheatre(pill, true));
$('#theatreClose').addEventListener('click', () => closeTheatre(false));
$('#theatreBackdrop').addEventListener('click', () => closeTheatre(false));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !theatre.hidden) closeTheatre(false); });

/* ---------------- faq ---------------- */
$$('.qa').forEach((qa) => {
  const btn = $('button', qa), ans = $('.qa__a', qa);
  btn.addEventListener('click', () => {
    const open = !qa.classList.contains('is-open');
    $$('.qa.is-open').forEach((o) => {
      if (o === qa) return;
      o.classList.remove('is-open'); $('button', o).setAttribute('aria-expanded', 'false');
      gsap.to($('.qa__a', o), { height: 0, duration: 0.5, ease: 'expo.out' });
    });
    qa.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    gsap.to(ans, { height: open ? 'auto' : 0, duration: reduced ? 0 : 0.6, ease: 'expo.out', onComplete: () => ScrollTrigger.refresh() });
  });
});


/* ---------------- team themes: the whole site suits up in your team's colours and power ---------------- */
const rootStyle = document.documentElement.style;
let currentTeam = null;
function applyTeam(id, how) {
  const r = REALMS.find((x) => x.id === id);
  if (!r) {
    if (!currentTeam) return;
    currentTeam = null;
    delete document.documentElement.dataset.team;
    ['--red', '--gold', '--team'].forEach((k) => rootStyle.removeProperty(k));
    portal.setTheme(null);
    return;
  }
  const changed = currentTeam !== id;
  currentTeam = id;
  document.documentElement.dataset.team = id;
  rootStyle.setProperty('--red', r.theme.accent);
  rootStyle.setProperty('--gold', r.theme.accent2);
  rootStyle.setProperty('--team', r.theme.accent);
  portal.setTheme(r.theme);
  if (how === 'preview' || !changed && how !== 'suit') return;
  // "suit up" moment
  $('#suitupKick').textContent = how === 'welcome' ? 'Welcome back' : 'Suit online';
  $('#suitupName').innerHTML = `${r.name} <em>× ${r.team}</em>`;
  $('#suitupWhy').textContent = `${r.why} · ${r.domain}`;
  const si = $('#suitupImg');
  if (r.photo) { si.src = r.photo; si.alt = r.team; si.hidden = false; si.classList.toggle('is-blend', !!r.photoBlend); } else si.hidden = true;
  if (reduced) return;
  gsap.timeline()
    .set('#suitup', { display: 'grid' })
    .fromTo('#suitup', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 0.7, ease: 'expo.out' })
    .fromTo('#suitupImg', { x: 120, opacity: 0, scale: 1.1 }, { x: 0, opacity: 1, scale: 1, duration: 1, ease: 'expo.out' }, '-=0.5')
    .fromTo('.suitup__inner > *', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.6, ease: 'expo.out' }, '-=0.8')
    .to('#suitup', { clipPath: 'circle(0% at 50% 50%)', duration: 0.6, ease: 'expo.in' }, '+=1.6')
    .set('#suitup', { display: 'none' });
}

/* ---------------- registration ---------------- */
function celebrate() {
  if (reduced) return;
  const pass = $('#pass');
  gsap.fromTo(pass, { rotateY: -90, opacity: 0 }, { rotateY: 0, opacity: 1, duration: 1.2, ease: 'expo.out', transformPerspective: 900 });
  const r = pass.getBoundingClientRect();
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('i');
    Object.assign(p.style, { position: 'fixed', left: r.left + r.width / 2 + 'px', top: r.top + r.height / 2 + 'px', width: '8px', height: '8px', background: ['#e8202a', '#ffc53d', '#f3ede4', '#ff7a1a'][i % 4], zIndex: 94, pointerEvents: 'none' });
    document.body.appendChild(p);
    gsap.to(p, { x: gsap.utils.random(-320, 320), y: gsap.utils.random(-260, 200), rotate: gsap.utils.random(-360, 360), opacity: 0, duration: gsap.utils.random(0.9, 1.6), ease: 'expo.out', onComplete: () => p.remove() });
  }
}

initRegister({
  toast,
  scrollTo,
  getPreferredRealm: () => preferredRealm,
  getPreferredClass: () => preferredClass,
  onTeam: applyTeam,
  onPane: () => requestAnimationFrame(() => ScrollTrigger.refresh()),
  onRegistered: (isNew) => {
    celebrate();
    toast(isNew ? 'Hero Pass issued. Welcome to the Initiative.' : 'Hero file updated.');
  },
  onStats: (s) => {
    const n = s.total || 0;
    const txt = `${String(n).padStart(3, '0')} heroes assembled`;
    $('#heroCount').textContent = txt.toUpperCase();
    $('#regCount').textContent = n ? `${n} registered from ${s.colleges} ${s.colleges === 1 ? 'college' : 'colleges'}` : 'Be the first to register';
  },
});

/* ---------------- start ---------------- */
function runLoader() {
  reveals();
  // the hero sits below the showreel now, so play its entrance when it scrolls in
  ScrollTrigger.create({ trigger: '.hero', start: 'top 70%', once: true, onEnter: heroIntro });
  // the trailer always opens in a popup when the site loads
  gsap.set(box, { clipPath: 'circle(0px at 50% 50%)' });
  setTimeout(() => openTheatre(null, false), 400);
}

document.fonts.ready.then(runLoader);
