import ironMan from './assets/heroes/iron-man.webp';
import spiderMan from './assets/heroes/spider-man.webp';
import captainAmerica from './assets/heroes/captain-america.webp';
import doctorStrange from './assets/heroes/doctor-strange.webp';
import thor from './assets/heroes/thor.webp';
import blackPanther from './assets/heroes/black-panther.webp';

const g = (d) => `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square">${d}</svg>`;

export const REALMS = [
  {
    id: 'neural', name: 'Neural', domain: 'AI and Machine Learning', color: '#ff3b30',
    team: 'Iron Man', why: 'Genius tech', theme: { accent: '#ff3b30', accent2: '#ffc53d', mode: 'hud' },
    photo: ironMan, photoBlend: true, // dark photo: blended so its black background disappears
    blurb: 'Genius, billionaire, builder. Suits that think for themselves. Build AI that makes humans stronger.',
    glyph: g('<circle cx="32" cy="32" r="6"/><circle cx="12" cy="14" r="4"/><circle cx="52" cy="14" r="4"/><circle cx="12" cy="50" r="4"/><circle cx="52" cy="50" r="4"/><path d="M15 17l12 11M49 17 37 28M15 47l12-11M49 47 37 36"/>'),
  },
  {
    id: 'sentinel', name: 'Sentinel', domain: 'Cybersecurity', color: '#3b7bff',
    team: 'Captain America', why: 'The shield', theme: { accent: '#3b7bff', accent2: '#ff3b4a', mode: 'shield' },
    photo: captainAmerica,
    blurb: 'The shield that never breaks. Find the breach before anyone else does, then lock it for good.',
    glyph: g('<path d="M32 6 54 14v16c0 14-9 23-22 28C19 53 10 44 10 30V14L32 6Z"/><path d="M22 32l7 7 13-14"/>'),
  },
  {
    id: 'titan', name: 'Titan', domain: 'Cloud, Infra and Web3', color: '#5fd0ff',
    team: 'Thor', why: 'Rules the clouds', theme: { accent: '#5fd0ff', accent2: '#e6f2ff', mode: 'lightning' },
    photo: thor,
    blurb: 'The god of thunder rules the clouds. Build cloud, infra and chains strong enough to hold a universe.',
    glyph: g('<path d="M32 6 56 19v26L32 58 8 45V19L32 6Z"/><path d="M8 19l24 13 24-13M32 32v26"/>'),
  },
  {
    id: 'pulse', name: 'Pulse', domain: 'HealthTech and Climate', color: '#a26bff',
    team: 'Black Panther', why: 'Wakandan medical tech', theme: { accent: '#a26bff', accent2: '#d9c8ff', mode: 'kinetic' },
    photo: blackPanther,
    blurb: 'Wakanda heals and protects. Tech that keeps people, and the planet, alive.',
    glyph: g('<path d="M4 34h14l6-14 9 28 7-20 5 6h15"/>'),
  },
  {
    id: 'rift', name: 'Rift', domain: 'AR, VR and Games', color: '#ff8a1f',
    team: 'Doctor Strange', why: 'Master of dimensions', theme: { accent: '#ff8a1f', accent2: '#3dff9a', mode: 'mystic' },
    photo: doctorStrange,
    blurb: 'Open portals to other dimensions. Build AR, VR and games people can step into.',
    glyph: g('<ellipse cx="32" cy="32" rx="24" ry="10"/><ellipse cx="32" cy="32" rx="10" ry="24"/><circle cx="32" cy="32" r="3"/>'),
  },
  {
    id: 'multiverse', name: 'Multiverse', domain: 'Open Innovation', color: '#ff2d55',
    team: 'Spider-Man', why: 'Friendly neighbourhood innovator', theme: { accent: '#ff2d55', accent2: '#3b7bff', mode: 'web' },
    photo: spiderMan,
    blurb: 'The student hero of the multiverse. No rules, no realm. Just your wildest build.',
    glyph: g('<circle cx="24" cy="26" r="14"/><circle cx="40" cy="26" r="14"/><circle cx="32" cy="40" r="14"/>'),
  },
];

const ic = (d) => `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square">${d}</svg>`;

export const CLASSES = [
  { id: 'genius', name: 'Genius', desc: 'Builds the brain', icon: ic('<circle cx="16" cy="16" r="3"/><ellipse cx="16" cy="16" rx="13" ry="5"/><ellipse cx="16" cy="16" rx="13" ry="5" transform="rotate(60 16 16)"/><ellipse cx="16" cy="16" rx="13" ry="5" transform="rotate(120 16 16)"/>') },
  { id: 'speedster', name: 'Speedster', desc: 'Ships fast', icon: ic('<path d="M18 3 7 18h8l-2 11 12-16h-8l1-10Z"/>') },
  { id: 'strategist', name: 'Strategist', desc: 'Plans and pitches', icon: ic('<circle cx="16" cy="16" r="12"/><circle cx="16" cy="16" r="5"/><path d="M16 1v8M16 23v8M1 16h8M23 16h8"/>') },
  { id: 'mystic', name: 'Mystic', desc: 'Designs the magic', icon: ic('<path d="M16 3c7 0 12 5 12 12 0 5-4 9-9 9-4 0-7-3-7-7 0-3 2-5 5-5 2 0 4 2 4 4"/>') },
  { id: 'guardian', name: 'Guardian', desc: 'Keeps it running', icon: ic('<path d="M16 3 27 7v8c0 7-5 12-11 14C10 27 5 22 5 15V7l11-4Z"/><path d="M16 3v26"/>') },
];

export const TIMELINE = [
  { day: 'Day 01', date: 'Sat, Oct 24', note: 'The portal opens' },
  { t: '09:00', code: 'Check-in', title: 'Suit up', text: 'Collect your kit, find your squad, grab breakfast.' },
  { t: '10:30', code: 'Opening', title: 'The call', text: 'Problem drops, realm reveals and a word from the jury.' },
  { t: '11:00', code: 'Hacking starts', title: 'Initiative live', text: 'The clock starts. 24 hours on the board.', hot: true },
  { t: '15:00', code: 'Mentors I', title: 'War room', text: 'Mentors walk the floor. Pressure-test your idea early.' },
  { t: '21:00', code: 'Night ops', title: 'Side quests', text: 'Mini games, a jam session and swag for the winners.' },
  { t: '02:00', code: 'Supply drop', title: 'Midnight fuel', text: 'Maggi, coffee and a quick energy reset.' },
  { day: 'Day 02', date: 'Sun, Oct 25', note: 'The final hours' },
  { t: '08:00', code: 'Mentors II', title: 'Final push', text: 'Last round of feedback before the freeze.' },
  { t: '11:00', code: 'Code freeze', title: 'Hands up', text: 'Push your last commit. Nothing changes after this.', hot: true },
  { t: '12:00', code: 'Demos', title: 'The showdown', text: 'Every squad gets 5 minutes on stage. Make them count.' },
  { t: '16:00', code: 'Closing', title: 'Legends crowned', text: 'Awards, photos and the after-party.' },
];

export const FAQ = [
  ['Who can join?', 'Any undergrad or postgrad student from any college in India. First-years are very welcome, and there is a bounty just for you.'],
  ['Is it really free?', 'Yes. Entry, meals, snacks, Wi-Fi and swag are all on us. Just bring yourself.'],
  ['Do I need a team to register?', 'No. Register solo and leave the squad name blank. We run a team-forming session right after check-in.'],
  ['What should I bring?', 'Laptop, charger, college ID, a water bottle and something warm for the night. Extension boards are a big plus.'],
  ['Can I start building before the event?', 'You can plan and research all you want. All code must be written during the 24 hours. We check commit history.'],
  ['Why Google sign-in?', 'It keeps registration quick and stops fake sign-ups. We only read your name, email and profile photo.'],
  ['Is this an official Marvel event?', 'No. It is a fan-inspired superhero theme by the GFG Student Chapter. We are not linked to Marvel or Disney in any way.'],
];

export const EVENT_START = new Date('2026-10-24T09:00:00+05:30');
export const EVENT_END = new Date('2026-10-25T18:00:00+05:30');

/* ---------------- Hero roster: original masked heroes, one per class ---------------- */
const glow = (id, c) => `<defs><filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241f2c"/><stop offset="1" stop-color="#0d0b11"/></linearGradient></defs>`;
const bust = (id, c) => `<path d="M14 262c4-46 38-66 86-66s82 20 86 66Z" fill="url(#${id}s)" stroke="${c}" stroke-opacity=".45" stroke-width="1.5"/><path d="M82 168h36v34H82z" fill="#0c0a10"/>`;

export const HEROES = [
  {
    id: 'genius', name: 'Genius', code: 'H-01', color: '#00d6ff',
    line: 'Builds the brain. Turns raw data into something that thinks.',
    stats: [['Intellect', 0.96], ['Speed', 0.55], ['Defense', 0.4]],
    svg: `<svg viewBox="0 0 200 262" aria-hidden="true">${glow('gG', '#00d6ff')}${bust('gG', '#00d6ff')}
      <path d="M62 204 100 234l38-30" fill="none" stroke="#00d6ff" stroke-opacity=".6" stroke-width="2"/>
      <path d="M100 36c-34 0-56 26-56 62 0 30 10 54 26 68 9 8 19 12 30 12s21-4 30-12c16-14 26-38 26-68 0-36-22-62-56-62Z" fill="url(#gGs)" stroke="#00d6ff" stroke-opacity=".7" stroke-width="1.5"/>
      <path d="M100 36v30M76 44l8 22M124 44l-8 22" stroke="#00d6ff" stroke-opacity=".35" stroke-width="1.5"/>
      <path class="eyes" d="M50 94c16-8 34-11 50-11s34 3 50 11l-4 18c-14-6-30-9-46-9s-32 3-46 9Z" fill="#00d6ff" filter="url(#gG)"/>
      <path d="M58 124l14 10v18M142 124l-14 10v18M86 160h28" fill="none" stroke="#00d6ff" stroke-opacity=".55" stroke-width="2"/>
      <circle cx="72" cy="152" r="2.5" fill="#00d6ff"/><circle cx="128" cy="152" r="2.5" fill="#00d6ff"/></svg>`,
  },
  {
    id: 'speedster', name: 'Speedster', code: 'H-02', color: '#ffc53d',
    line: 'Ships before the others finish planning. First commit, last push.',
    stats: [['Intellect', 0.6], ['Speed', 0.98], ['Defense', 0.35]],
    svg: `<svg viewBox="0 0 200 262" aria-hidden="true">${glow('gS', '#ffc53d')}${bust('gS', '#ffc53d')}
      <path d="M40 262l30-60M160 262l-30-60" stroke="#ffc53d" stroke-opacity=".5" stroke-width="2"/>
      <path d="M52 90 12 64l36 46ZM148 90l40-26-36 46Z" fill="#ffc53d" opacity=".9"/>
      <path d="M100 42c-30 0-50 24-50 58 0 20 4 36 12 48l38 32 38-32c8-12 12-28 12-48 0-34-20-58-50-58Z" fill="url(#gSs)" stroke="#ffc53d" stroke-opacity=".7" stroke-width="1.5"/>
      <path d="M68 128c6 20 18 36 32 44 14-8 26-24 32-44-10 6-20 8-32 8s-22-2-32-8Z" fill="#2e2834"/>
      <path d="M100 42v46" stroke="#ffc53d" stroke-width="4"/>
      <path class="eyes" d="M60 98l32 5-4 13-26-5ZM140 98l-32 5 4 13 26-5Z" fill="#ffc53d" filter="url(#gS)"/>
      <path d="M90 154h20" stroke="#07060a" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  },
  {
    id: 'strategist', name: 'Strategist', code: 'H-03', color: '#e8202a',
    line: 'Sees three moves ahead. Owns the plan, the pitch and the room.',
    stats: [['Intellect', 0.85], ['Speed', 0.6], ['Defense', 0.7]],
    svg: `<svg viewBox="0 0 200 262" aria-hidden="true">${glow('gT', '#e8202a')}${bust('gT', '#e8202a')}
      <path d="M100 28c-46 0-66 40-66 80 0 26 6 50 16 66l50 22 50-22c10-16 16-40 16-66 0-40-20-80-66-80Z" fill="#110e15" stroke="#e8202a" stroke-opacity=".5" stroke-width="1.5"/>
      <path d="M100 58c-26 0-40 22-40 50 0 28 16 58 40 66 24-8 40-38 40-66 0-28-14-50-40-50Z" fill="url(#gTs)"/>
      <path d="M62 124c10 8 24 12 38 12s28-4 38-12c-4 26-20 44-38 50-18-6-34-24-38-50Z" fill="#0b0a0f" stroke="#e8202a" stroke-opacity=".6" stroke-width="1.5"/>
      <path d="M86 148h28M90 157h20" stroke="#e8202a" stroke-opacity=".6" stroke-width="2"/>
      <path class="eyes" d="M68 102l24 4-2 7-22-4Z" fill="#f3ede4" filter="url(#gT)"/>
      <g class="eyes" filter="url(#gT)"><circle cx="122" cy="106" r="11" fill="none" stroke="#e8202a" stroke-width="2.5"/><circle cx="122" cy="106" r="3.5" fill="#e8202a"/><path d="M122 90v8M122 114v8M106 106h8M130 106h8" stroke="#e8202a" stroke-width="2"/></g></svg>`,
  },
  {
    id: 'mystic', name: 'Mystic', code: 'H-04', color: '#b46bff',
    line: 'Designs the magic. Makes people feel something when they use it.',
    stats: [['Intellect', 0.75], ['Speed', 0.5], ['Defense', 0.55]],
    svg: `<svg viewBox="0 0 200 262" aria-hidden="true">${glow('gM', '#b46bff')}
      <g class="rune"><circle cx="100" cy="104" r="84" fill="none" stroke="#b46bff" stroke-opacity=".55" stroke-width="1.5" stroke-dasharray="2 7"/><circle cx="100" cy="104" r="74" fill="none" stroke="#b46bff" stroke-opacity=".3" stroke-width="1"/><path d="M100 20l6 10h-12ZM184 104l-10 6v-12ZM100 188l-6-10h12ZM16 104l10-6v12Z" fill="#b46bff" opacity=".7"/></g>
      ${bust('gM', '#b46bff')}
      <path d="M100 24c-40 10-62 48-62 90 0 30 8 56 22 76l40 12 40-12c14-20 22-46 22-76 0-42-22-80-62-90Z" fill="url(#gMs)" stroke="#b46bff" stroke-opacity=".6" stroke-width="1.5"/>
      <path d="M100 66c-22 0-34 20-34 44 0 26 14 50 34 58 20-8 34-32 34-58 0-24-12-44-34-44Z" fill="#050407"/>
      <path d="M100 24c-4 20-4 32 0 42" stroke="#b46bff" stroke-opacity=".4" stroke-width="1.5" fill="none"/>
      <path d="M100 78l5 6-5 6-5-6Z" fill="#b46bff" opacity=".8"/>
      <g class="eyes" filter="url(#gM)"><ellipse cx="87" cy="112" rx="8" ry="3" fill="#d9b8ff"/><ellipse cx="113" cy="112" rx="8" ry="3" fill="#d9b8ff"/></g></svg>`,
  },
  {
    id: 'guardian', name: 'Guardian', code: 'H-05', color: '#3dff9a',
    line: 'Keeps it running at 3 AM. Nothing breaks on their watch.',
    stats: [['Intellect', 0.65], ['Speed', 0.45], ['Defense', 0.97]],
    svg: `<svg viewBox="0 0 200 262" aria-hidden="true">${glow('gD', '#3dff9a')}${bust('gD', '#3dff9a')}
      <path d="M2 262c0-46 16-68 52-76l20 10-8 66ZM198 262c0-46-16-68-52-76l-20 10 8 66Z" fill="url(#gDs)" stroke="#3dff9a" stroke-opacity=".6" stroke-width="1.5"/>
      <path d="M20 222h36M144 222h36" stroke="#3dff9a" stroke-opacity=".4" stroke-width="2"/>
      <path d="M96 16h8v58h-8Z" fill="#3dff9a" opacity=".85"/>
      <path d="M100 32c-30 0-50 20-50 52v60c0 18 12 32 26 38h48c14-6 26-20 26-38V84c0-32-20-52-50-52Z" fill="url(#gDs)" stroke="#3dff9a" stroke-opacity=".7" stroke-width="1.5"/>
      <rect x="60" y="96" width="80" height="22" fill="#07060a"/>
      <path d="M72 96v22M86 96v22M100 96v22M114 96v22M128 96v22" stroke="#1d1924" stroke-width="3"/>
      <path class="eyes" d="M64 107h72" stroke="#3dff9a" stroke-width="4" filter="url(#gD)"/>
      <path d="M66 134l18 14v20M134 134l-18 14v20" fill="none" stroke="#3dff9a" stroke-opacity=".5" stroke-width="2"/></svg>`,
  },
];
