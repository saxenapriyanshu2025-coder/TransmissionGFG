// Swirling energy portal drawn on a 2D canvas. Reacts to the pointer.
export function initPortal(canvas) {
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w = 0, h = 0, dpr = 1, cx = 0, cy = 0, R = 0;
  let particles = [], sparks = [];
  let mx = 0, my = 0, tmx = 0, tmy = 0, boost = 0, running = true, raf = 0;
  const DEFAULT = ['#e8202a', '#ff4a3d', '#ff7a1a', '#ffc53d', '#f3ede4'];
  let COLORS = DEFAULT.slice(), mode = null, accent = '#e8202a', accent2 = '#ffc53d', bolt = null, nextBolt = 0, pulses = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const mobile = w < 760;
    cx = mobile ? w * 0.5 : w * 0.68;
    cy = mobile ? h * 0.34 : h * 0.4;
    R = Math.min(w, h) * (mobile ? 0.36 : 0.3);
    const n = mobile ? 380 : 900;
    particles = Array.from({ length: n }, () => spawn());
  }

  function spawn() {
    const band = Math.random();
    return {
      a: Math.random() * Math.PI * 2,
      r: R * (0.72 + Math.pow(band, 2) * 0.55) * (Math.random() < 0.08 ? 1.35 : 1),
      s: (0.0025 + Math.random() * 0.006) * (Math.random() < 0.5 ? 1 : 1.3),
      z: 0.4 + Math.random() * 0.8,
      c: COLORS[(Math.random() * (Math.random() < 0.8 ? 3 : 5)) | 0],
      wob: Math.random() * Math.PI * 2,
    };
  }

  function frame(t) {
    if (!running) return;
    mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
    boost *= 0.95;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';

    const ox = cx + mx * 40, oy = cy + my * 30;

    // core glow
    const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, R * 1.1);
    g.addColorStop(0, accent2);
    g.addColorStop(0.55, accent);
    g.addColorStop(1, 'rgba(7,6,10,0)');
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ox, oy, R * 1.1, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    ctx.globalCompositeOperation = 'lighter';
    const tilt = 0.32 + my * 0.08;
    for (const p of particles) {
      p.a += p.s * (1 + boost * 3);
      p.wob += 0.02;
      const rr = p.r + Math.sin(p.wob + t * 0.0006) * 6;
      const x = ox + Math.cos(p.a) * rr;
      const y = oy + Math.sin(p.a) * rr * (0.92 - tilt * 0.2) + Math.sin(p.a * 3 + t * 0.001) * 3;
      const size = p.z * 1.6;
      ctx.fillStyle = p.c;
      ctx.globalAlpha = 0.35 + p.z * 0.45;
      ctx.fillRect(x, y, size, size);
      if (Math.random() < 0.0006 + boost * 0.004) {
        sparks.push({ x, y, vx: Math.cos(p.a + Math.PI / 2) * (2 + Math.random() * 4), vy: Math.sin(p.a + Math.PI / 2) * (2 + Math.random() * 4), life: 1 });
      }
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx; s.y += s.vy; s.vy += 0.06; s.life -= 0.02;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.globalAlpha = s.life;
      ctx.fillStyle = '#ffc53d';
      ctx.fillRect(s.x, s.y, 2, 2);
    }
    // team power effects
    if (mode) drawMode(t, ox, oy);
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }


  function drawMode(t, ox, oy) {
    ctx.globalCompositeOperation = 'lighter';
    if (mode === 'hud') { // Iron Man: rotating targeting arcs
      ctx.lineWidth = 2;
      [[1.12, 0.0008, 0.9], [1.25, -0.0005, 1.6], [0.62, 0.0012, 0.6]].forEach(([k, sp, len], i) => {
        const a0 = t * sp + i * 2;
        ctx.strokeStyle = i === 1 ? accent2 : accent; ctx.globalAlpha = 0.55;
        for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.arc(ox, oy, R * k, a0 + j * 2.094, a0 + j * 2.094 + len); ctx.stroke(); }
      });
      ctx.globalAlpha = 0.8; ctx.fillStyle = accent2;
      for (let j = 0; j < 24; j++) { const a = j * 0.2618 + t * 0.0003; ctx.fillRect(ox + Math.cos(a) * R * 1.32, oy + Math.sin(a) * R * 1.32, 2, 2); }
    } else if (mode === 'shield') { // Captain America: shield pulses
      if (!pulses.length || t - pulses[pulses.length - 1] > 1400) pulses.push(t);
      pulses = pulses.filter((p) => t - p < 2600);
      pulses.forEach((p) => { const k = (t - p) / 2600; ctx.globalAlpha = (1 - k) * 0.7; ctx.strokeStyle = k < 0.5 ? accent : accent2; ctx.lineWidth = 3 * (1 - k) + 1; ctx.beginPath(); ctx.arc(ox, oy, R * (0.3 + k * 1.2), 0, Math.PI * 2); ctx.stroke(); });
    } else if (mode === 'lightning') { // Thor: lightning bolts off the ring
      if (t > nextBolt) {
        const a = Math.random() * Math.PI * 2, pts = [[ox + Math.cos(a) * R, oy + Math.sin(a) * R * 0.9]];
        let [x, y] = pts[0]; const tx = ox + Math.cos(a) * R * 3, ty = oy + Math.sin(a) * R * 2.4;
        for (let i = 1; i <= 9; i++) { x += (tx - pts[0][0]) / 9 + (Math.random() - 0.5) * 60; y += (ty - pts[0][1]) / 9 + (Math.random() - 0.5) * 60; pts.push([x, y]); }
        bolt = { pts, born: t }; nextBolt = t + 900 + Math.random() * 1600;
      }
      if (bolt && t - bolt.born < 260) {
        const k = 1 - (t - bolt.born) / 260;
        [[6, accent, 0.35], [2, accent2, 1]].forEach(([w, c, al]) => { ctx.globalAlpha = al * k; ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); bolt.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); });
      }
    } else if (mode === 'kinetic') { // Black Panther: stored kinetic energy released in bursts
      if (boost > 0.6 && (!pulses.length || t - pulses[pulses.length - 1] > 500)) pulses.push(t);
      if (!pulses.length || t - pulses[pulses.length - 1] > 2200) pulses.push(t);
      pulses = pulses.filter((p) => t - p < 1200);
      pulses.forEach((p) => { const k = (t - p) / 1200; const g = ctx.createRadialGradient(ox, oy, R * k * 1.3 * 0.8, ox, oy, R * k * 1.3); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, accent); ctx.globalAlpha = (1 - k) * 0.6; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ox, oy, R * k * 1.3, 0, Math.PI * 2); ctx.fill(); });
    } else if (mode === 'mystic') { // Doctor Strange: spinning spell circles throwing sparks
      ctx.strokeStyle = accent; ctx.lineWidth = 1.5;
      [[0.55, 0.0009], [0.75, -0.0006]].forEach(([k, sp]) => {
        ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.arc(ox, oy, R * k, 0, Math.PI * 2); ctx.stroke();
        for (let j = 0; j < 8; j++) { const a = t * sp + j * 0.785; ctx.beginPath(); ctx.moveTo(ox + Math.cos(a) * R * k, oy + Math.sin(a) * R * k); ctx.lineTo(ox + Math.cos(a + 0.785 * 3) * R * k, oy + Math.sin(a + 0.785 * 3) * R * k); ctx.globalAlpha = 0.25; ctx.stroke(); }
      });
      for (let j = 0; j < 3; j++) { const a = t * 0.004 + j * 2.094; sparks.push({ x: ox + Math.cos(a) * R * 0.75, y: oy + Math.sin(a) * R * 0.75, vx: -Math.sin(a) * 3, vy: Math.cos(a) * 3, life: 0.7 }); }
    } else if (mode === 'web') { // Spider-Man: web threads between particles near the pointer
      const px = (mx / 2 + 0.5) * w, py = (my / 2 + 0.5) * h;
      const near = [];
      for (let i = 0; i < particles.length && near.length < 70; i += 3) { const p = particles[i]; const x = ox + Math.cos(p.a) * p.r, y = oy + Math.sin(p.a) * p.r * 0.9; if (Math.hypot(x - px, y - py) < 260) near.push([x, y]); }
      ctx.strokeStyle = accent2; ctx.lineWidth = 0.8;
      for (let i = 0; i < near.length; i++) for (let j = i + 1; j < near.length; j++) { const d = Math.hypot(near[i][0] - near[j][0], near[i][1] - near[j][1]); if (d < 70) { ctx.globalAlpha = (1 - d / 70) * 0.7; ctx.beginPath(); ctx.moveTo(near[i][0], near[i][1]); ctx.lineTo(near[j][0], near[j][1]); ctx.stroke(); } }
      ctx.globalAlpha = 0.6; ctx.strokeStyle = accent;
      near.slice(0, 10).forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke(); });
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function onMove(e) {
    const pt = e.touches ? e.touches[0] : e;
    tmx = (pt.clientX / w - 0.5) * 2;
    tmy = (pt.clientY / h - 0.5) * 2;
    boost = Math.min(boost + 0.04, 1);
  }

  resize();
  window.addEventListener('resize', () => { cancelAnimationFrame(raf); resize(); if (running) raf = requestAnimationFrame(frame); });
  window.addEventListener('pointermove', onMove, { passive: true });

  function setTheme(th) {
    if (!th) { COLORS = DEFAULT.slice(); mode = null; accent = '#e8202a'; accent2 = '#ffc53d'; }
    else { accent = th.accent; accent2 = th.accent2; mode = th.mode; COLORS = [th.accent, th.accent, th.accent2, th.accent2, '#f3ede4']; }
    pulses = []; bolt = null;
    particles.forEach((p) => { p.c = COLORS[(Math.random() * (Math.random() < 0.8 ? 3 : 5)) | 0]; });
    boost = 1;
  }

  if (reduced) { running = true; frame(0); running = false; return { burst() {}, setTheme() {} }; }

  const io = new IntersectionObserver(([en]) => {
    const vis = en.isIntersecting;
    if (vis && !running) { running = true; raf = requestAnimationFrame(frame); }
    if (!vis) { running = false; cancelAnimationFrame(raf); }
  });
  io.observe(canvas);
  raf = requestAnimationFrame(frame);

  return { burst() { boost = 1; }, setTheme };
}
