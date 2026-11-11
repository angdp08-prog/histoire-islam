// Episode 4 — Salih (alayhi salam), the Thamud of al-Hijr and the she-camel of Allah.
// Visual rules: the prophet is shown only as a silhouette in white, face entirely hidden by a veil of white light
// (prophet: true, as in episode 1); everyone else is faceless. Events are synced to the narration with W(scene, word).

const SALIH = { prophet: true, robe: '#ece7da', wrap: '#f7f3ea', skin: '#c99872', trim: '#d4b26a', band: '#c9a86a', inner: '#fbf8f0' };
const FOLK = [
  { robe: '#5a4b40', wrap: '#d9cdb5', skin: '#9a6a4c' }, { robe: '#46505c', wrap: '#e2dccd', skin: '#b07a58' },
  { robe: '#6b5641', wrap: '#cdbb98', skin: '#8f5f42' }, { robe: '#4b4038', wrap: '#e6e0d2', skin: '#a8714f', trim: '#8a6a3a' },
  { robe: '#3f4954', wrap: '#d6cbb3', skin: '#94664a' }, { robe: '#5d4a3a', wrap: '#efe7d6', skin: '#b4805c' },
  { robe: '#7a5a6a', wrap: '#e0d4c0', skin: '#c48e66', trim: '#b89a62' }, { robe: '#3a5a4a', wrap: '#d9d0bd', skin: '#b07a58' },
  { robe: '#6a4a2e', wrap: '#e8dcc4', skin: '#9a6a4c' },
];
const NOBLES = [
  { robe: '#6a2e2a', wrap: '#efe5d0', skin: '#a8714f', trim: '#d4a94a', band: '#d4a94a' },
  { robe: '#2e3a5a', wrap: '#e8dcc4', skin: '#b07a58', trim: '#d4a94a', band: '#b88a3a' },
  { robe: '#4a2a4a', wrap: '#efe5d0', skin: '#94664a', trim: '#d4a94a', band: '#d4a94a' },
  { robe: '#5a3a1e', wrap: '#e2d6bc', skin: '#b4805c', trim: '#e0b860', band: '#c9a14a' },
  { robe: '#702a20', wrap: '#e8dcc4', skin: '#8f5f42', trim: '#d4a94a', band: '#d4a94a' },
];
const CAMEL = '#c28c5c', SAND = '#c8935f';

// ---------- sync & camera helpers
function at(id, word, n = 0, fb = 0) { // time (scene-relative) where `word` is spoken (n-th occurrence)
  const sc = (window.TL.scenes || []).find(s => s.id === id); if (!sc || !sc.words) return fb;
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z']/g, '');
  const target = norm(word); let k = 0;
  for (const w of sc.words) { const v = norm(w.w); if (target && (v.startsWith(target) || v.replace(/^[a-z]'/, '').startsWith(target))) { if (k++ === n) return w.s; } }
  return fb;
}
const ramp = (t, t0, dur = 0.8) => ease(seg(t, t0, t0 + dur));
function cam(c, z, cx = W / 2, cy = H / 2, dx = 0, dy = 0) { c.translate(W / 2 + dx, H / 2 + dy); c.scale(z, z); c.translate(-cx, -cy); }
function par(c, k, px, py, fn) { c.save(); c.translate(-px * k, -py * k); fn(); c.restore(); } // parallax layer
function phases(c, t, t0, f, A, B) {
  const k = seg(t, t0, t0 + f);
  if (k < 1) { c.save(); A(c); c.restore(); }
  if (k > 0) layer(c, ease(k), cc => { cc.save(); B(cc); cc.restore(); });
}
function blurred(c, px, fn) { c.save(); c.filter = `blur(${px}px)`; fn(); c.restore(); }

// ---------- landscape of al-Hijr
function wisps(c, t, y, n, col, a, seed, drift = 6) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const w = 260 + r() * 420, x = ((r() * (W + w * 2) + t * drift * (0.6 + r())) % (W + w * 2)) - w, yy = y + r() * 260;
    const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    g.addColorStop(0, hexA(col, 0)); g.addColorStop(0.5, hexA(col, a * (0.5 + r() * 0.5))); g.addColorStop(1, hexA(col, 0));
    c.fillStyle = g; c.beginPath(); c.ellipse(x, yy, w / 2, 10 + r() * 22, 0, 0, 6.283); c.fill();
  }
}
function haze(c, y, h, col, a) {
  const g = c.createLinearGradient(0, y - h, 0, y); g.addColorStop(0, hexA(col, 0)); g.addColorStop(1, hexA(col, a));
  c.fillStyle = g; c.fillRect(-300, y - h, W + 600, h);
}
function rangeFar(c, y, col, seed, amp = 120) { ridge(c, y, amp, 0.0035, seed, col); }
// sandstone outcrop: rounded domes, layered strata, erosion grooves, lit side, speckles
function rock(c, x, y, w, h, col, seed, o = {}) {
  const r = rng(seed), lx = o.lightX === undefined ? -1 : o.lightX, n = 40;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const q = i / n, env = Math.pow(Math.sin(q * Math.PI), o.sharp || 0.55);
    const v = env * h * (0.8 + 0.2 * noise1(q * (o.bumps || 5), seed)) + Math.sin(q * Math.PI * (o.domes || 7)) * h * 0.035 * env;
    pts.push([x - w / 2 + q * w, y - v]);
  }
  const path = () => { c.beginPath(); c.moveTo(x - w / 2, y + 2); pts.forEach(p => c.lineTo(p[0], p[1])); c.lineTo(x + w / 2, y + 2); c.closePath(); };
  const lt = mix(col, '#ffe2b8', 0.22 * (o.light === undefined ? 1 : o.light)), dk = mix(col, '#1a0e08', 0.42);
  const g = c.createLinearGradient(x - w / 2 * lx, 0, x + w / 2 * lx, 0); g.addColorStop(0, lt); g.addColorStop(0.55, col); g.addColorStop(1, dk);
  path(); c.fillStyle = g; c.fill();
  c.save(); path(); c.clip();
  const gv = c.createLinearGradient(0, y - h, 0, y); gv.addColorStop(0, 'rgba(255,240,210,0.10)'); gv.addColorStop(0.7, 'rgba(0,0,0,0)'); gv.addColorStop(1, 'rgba(20,10,5,0.35)');
  c.fillStyle = gv; c.fillRect(x - w / 2, y - h, w, h + 4);
  c.lineWidth = 3;
  for (let k = 1; k < 16; k++) { // strata
    const yy = y - h * k / 16 + Math.sin(k * 3.1 + seed) * 8; c.strokeStyle = hexA(k % 3 ? dk : lt, 0.13 + (k % 2) * 0.06); c.lineWidth = 2 + (k % 4);
    c.beginPath(); for (let xx = x - w / 2; xx <= x + w / 2; xx += 30) { const v = yy + Math.sin(xx * 0.012 + k + seed) * 6 + noise1(xx * 0.02, k + seed) * 8; xx === x - w / 2 ? c.moveTo(xx, v) : c.lineTo(xx, v); } c.stroke();
  }
  c.strokeStyle = hexA(dk, 0.32); c.lineWidth = 7;
  for (let i = 0; i < (o.grooves === undefined ? 12 : o.grooves); i++) { // erosion grooves running down from the top
    const q = 0.06 + r() * 0.88, gx = x - w / 2 + q * w, top = pts[Math.round(q * n)][1];
    c.beginPath(); c.moveTo(gx, top + 6); c.bezierCurveTo(gx + (r() - 0.5) * 30, top + (y - top) * 0.3, gx + (r() - 0.5) * 40, top + (y - top) * 0.7, gx + (r() - 0.5) * 30, y);
    c.lineWidth = 3 + r() * 7; c.stroke();
  }
  for (let i = 0; i < 160; i++) { const sx = x - w / 2 + r() * w, sy = y - r() * h; c.fillStyle = hexA(r() > 0.5 ? lt : dk, 0.18); c.fillRect(sx, sy, 2 + r() * 3, 2 + r() * 3); }
  c.restore();
  c.strokeStyle = hexA(lt, 0.5); c.lineWidth = 3; c.beginPath(); let on = false; // rim light on the lit side
  pts.forEach((p, i) => { const q = i / n; if ((lx <= 0 && q < 0.6) || (lx > 0 && q > 0.4)) { on ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); on = true; } }); c.stroke();
  return pts;
}
// Nabataean tomb facade carved in the rock (Hegra): double crow-steps, cornices, pilasters with capitals, pedimented door
function tomb(c, x, y, w, h, col, o = {}) {
  const lit = o.lit || 0, t = o.t || 0, dk = mix(col, '#140a05', 0.45), md = mix(col, '#140a05', 0.2), lt = mix(col, '#fff0d8', 0.2);
  c.fillStyle = hexA(dk, 0.55); c.fillRect(x - w / 2 - 14, y - h - 8, w + 28, h + 8); // carved recess shadow
  const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, lt); g.addColorStop(0.6, col); g.addColorStop(1, md);
  c.fillStyle = g; c.fillRect(x - w / 2, y - h, w, h);
  const step = w / 11, sh = h * 0.07;
  for (let s = 0; s < 5; s++) { // double crow-steps on the crown
    c.fillStyle = s % 2 ? col : lt;
    c.fillRect(x - w / 2 + s * step, y - h - (s + 1) * sh, step + 1, (s + 1) * sh);
    c.fillRect(x + w / 2 - (s + 1) * step, y - h - (s + 1) * sh, step + 1, (s + 1) * sh);
    c.fillStyle = hexA(dk, 0.35); c.fillRect(x - w / 2 + (s + 1) * step - 4, y - h - (s + 1) * sh, 4, (s + 1) * sh);
  }
  const corn = (yy, th) => { c.fillStyle = lt; c.fillRect(x - w / 2 - 6, yy, w + 12, th); c.fillStyle = hexA(dk, 0.6); c.fillRect(x - w / 2 - 6, yy + th, w + 12, th * 0.5);
    c.fillStyle = md; c.fillRect(x - w / 2 - 2, yy + th * 1.5, w + 4, th * 0.6); };
  corn(y - h, h * 0.035); corn(y - h * 0.8, h * 0.03); corn(y - h * 0.6, h * 0.04);
  const pw = w * 0.07;
  [x - w / 2 + pw * 0.2, x + w / 2 - pw * 1.2].forEach(px => { // pilasters + capitals
    c.fillStyle = lt; c.fillRect(px, y - h * 0.57, pw, h * 0.57); c.fillStyle = hexA(dk, 0.4); c.fillRect(px + pw * 0.75, y - h * 0.57, pw * 0.25, h * 0.57);
    c.fillStyle = md; c.fillRect(px - pw * 0.3, y - h * 0.59, pw * 1.6, h * 0.035); c.fillRect(px - pw * 0.2, y - h * 0.555, pw * 1.4, h * 0.02);
  });
  const dw = w * 0.3, dh = h * 0.34, dy0 = y - dh;
  c.fillStyle = lt; c.beginPath(); c.moveTo(x - dw * 0.85, dy0 - 14); c.lineTo(x, dy0 - 14 - dw * 0.5); c.lineTo(x + dw * 0.85, dy0 - 14); c.closePath(); c.fill(); // pediment
  c.fillStyle = hexA(dk, 0.5); c.beginPath(); c.moveTo(x - dw * 0.7, dy0 - 18); c.lineTo(x, dy0 - 18 - dw * 0.38); c.lineTo(x + dw * 0.7, dy0 - 18); c.closePath(); c.fill();
  c.fillStyle = md; c.beginPath(); c.ellipse(x, dy0 - 18 - dw * 0.55, dw * 0.08, dw * 0.12, 0, 0, 6.283); c.fill(); // urn finial
  c.fillStyle = lt; c.fillRect(x - dw / 2 - 12, dy0 - 10, dw + 24, dh + 10); // door frame
  c.fillStyle = md; c.fillRect(x - dw / 2 - 5, dy0 - 4, dw + 10, dh + 4);
  const gd = c.createLinearGradient(0, dy0, 0, y); gd.addColorStop(0, '#0c0604'); gd.addColorStop(1, '#22140c');
  c.fillStyle = gd; c.fillRect(x - dw / 2, dy0, dw, dh);
  if (lit > 0) { c.save(); c.beginPath(); c.rect(x - dw / 2, dy0, dw, dh); c.clip(); c.globalCompositeOperation = 'lighter';
    glow(c, x, y - dh * 0.25, dw * 1.5, '#ff9a40', lit * (0.75 + 0.15 * Math.sin(t * 3 + x))); c.restore();
    c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y, dw * 1.3, '#ff9a40', 0.25 * lit); c.restore(); }
  c.fillStyle = hexA(SAND, 0.85); c.beginPath(); c.moveTo(x - w / 2 - 30, y + 2); c.quadraticCurveTo(x - w / 4, y - h * 0.06, x, y - h * 0.02); c.quadraticCurveTo(x + w / 3, y - h * 0.07, x + w / 2 + 30, y + 2); c.fill(); // drifted sand
  c.strokeStyle = hexA(dk, 0.35); c.lineWidth = 2; c.beginPath(); c.moveTo(x + w * 0.3, y - h * 0.95); c.lineTo(x + w * 0.27, y - h * 0.8); c.lineTo(x + w * 0.31, y - h * 0.66); c.stroke(); // crack
}
function acacia(c, x, y, s, col, t = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const dk = mix(col, '#000000', 0.35), sw = Math.sin(t * 0.9) * 3;
  c.strokeStyle = dk; c.lineCap = 'round';
  [[0, 0, -10, -90, -60, -150, 14], [0, -60, 30, -110, 70, -150, 10], [-30, -110, -60, -140, -110, -158, 7], [40, -120, 80, -140, 120, -152, 6]].forEach(([a, b, cx, cy, ex, ey, w]) => {
    c.lineWidth = w; c.beginPath(); c.moveTo(a, b); c.quadraticCurveTo(cx, cy, ex + sw, ey); c.stroke(); });
  const r = rng(31);
  for (let i = 0; i < 9; i++) { const cx = -150 + i * 36 + r() * 20 + sw, cy = -160 - r() * 26, rw = 70 + r() * 40;
    c.fillStyle = dk; c.beginPath(); c.ellipse(cx, cy + 8, rw, 18, 0, 0, 6.283); c.fill();
    c.fillStyle = i % 2 ? col : mix(col, '#ffffff', 0.1); c.beginPath(); c.ellipse(cx, cy, rw * 0.92, 15, 0, 0, 6.283); c.fill(); }
  c.restore();
}
function shrub(c, x, y, s, col, t = 0, seed = 1) {
  const r = rng(seed); c.strokeStyle = col; c.lineCap = 'round';
  for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (r() - 0.5) * 2.2, l = (30 + r() * 40) * s, sw = Math.sin(t * 1.5 + i) * 3 * s;
    c.lineWidth = 2.5 * s; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * l * 0.5, y + Math.sin(a) * l * 0.6, x + Math.cos(a) * l + sw, y + Math.sin(a) * l); c.stroke(); }
}
function boulder(c, x, y, w, h, col, seed) {
  const r = rng(seed), lt = mix(col, '#fff0d8', 0.2), dk = mix(col, '#000000', 0.4);
  const g = c.createLinearGradient(x - w / 2, y - h, x + w / 2, y); g.addColorStop(0, lt); g.addColorStop(0.5, col); g.addColorStop(1, dk);
  c.fillStyle = g; c.beginPath(); c.moveTo(x - w / 2, y);
  c.bezierCurveTo(x - w / 2 - 6, y - h * (0.7 + r() * 0.3), x - w * 0.1, y - h * 1.05, x + w * 0.15, y - h); c.bezierCurveTo(x + w * 0.45, y - h * 0.95, x + w / 2 + 6, y - h * 0.4, x + w / 2, y); c.closePath(); c.fill();
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(x + w * 0.1, y + 2, w * 0.6, h * 0.08, 0, 0, 6.283); c.fill();
}
function sandFloor(c, y, col, t, seed = 1, specks = true) {
  const g = c.createLinearGradient(0, y - 20, 0, H + 100); g.addColorStop(0, mix(col, '#ffe8c8', 0.15)); g.addColorStop(1, mix(col, '#000000', 0.25));
  c.fillStyle = g; c.beginPath(); c.moveTo(-300, y);
  for (let x = -300; x <= W + 300; x += 20) c.lineTo(x, y - Math.sin(x * 0.004 + seed) * 16);
  c.lineTo(W + 300, H + 300); c.lineTo(-300, H + 300); c.closePath(); c.fill();
  c.lineWidth = 3;
  for (let i = 0; i < 14; i++) { const yy = y + 50 + i * i * 6 + i * 20; c.strokeStyle = hexA(i % 2 ? mix(col, '#000000', 0.25) : mix(col, '#ffffff', 0.2), 0.3);
    c.beginPath(); for (let x = -200; x <= W + 200; x += 24) { const v = yy + Math.sin(x * (0.01 - i * 0.0004) + i * 1.7 + seed) * (6 + i); x === -200 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); }
  if (specks) { const r = rng(seed * 7 + 3); for (let i = 0; i < 70; i++) { const sx = r() * W, sy = y + 40 + r() * (H - y); c.fillStyle = hexA(mix(col, '#000000', 0.4), 0.45); c.beginPath(); c.ellipse(sx, sy, 3 + r() * 6 * (sy / H), 2 + r() * 3, 0, 0, 6.283); c.fill(); } }
}
function blowingSand(c, t, y, a = 0.4, seed = 3) {
  const r = rng(seed); c.strokeStyle = `rgba(240,215,175,${a})`; c.lineWidth = 2;
  for (let i = 0; i < 40; i++) { const yy = y + r() * 240, sp = 200 + r() * 260, x = ((r() * 1600 + t * sp) % 1600) - 260, l = 40 + r() * 90;
    c.beginPath(); c.moveTo(x, yy); c.quadraticCurveTo(x + l / 2, yy - 4, x + l, yy + Math.sin(t * 3 + i) * 3); c.stroke(); }
}
function milkyWay(c, t, a) {
  c.save(); c.translate(540, 500); c.rotate(-0.55);
  const g = c.createLinearGradient(0, -170, 0, 170); g.addColorStop(0, 'rgba(180,190,255,0)'); g.addColorStop(0.5, `rgba(200,205,255,${0.16 * a})`); g.addColorStop(1, 'rgba(180,190,255,0)');
  c.fillStyle = g; c.fillRect(-1400, -170, 2800, 340);
  const r = rng(77); for (let i = 0; i < 500; i++) { const x = (r() - 0.5) * 2600, y = (r() + r() + r() - 1.5) * 150; c.fillStyle = `rgba(255,250,235,${a * (0.25 + r() * 0.6) * (0.6 + 0.4 * Math.sin(t * (1 + r() * 2) + i))})`; c.fillRect(x, y, 1.6, 1.6); }
  c.restore();
}
function torch(c, x, y, t, k = 0, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#3a2418'; c.fillRect(-6, -160, 12, 160); c.fillStyle = '#5a3a24'; c.fillRect(-10, -168, 20, 12);
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -190, 300, '#ff8a3a', 0.45 + 0.08 * Math.sin(t * 9 + k)); c.restore();
  [['#ff7a2a', 18, 70], ['#ffb347', 12, 52], ['#ffe9a8', 6, 30]].forEach(([col, w, hh], j) => { c.fillStyle = col; c.beginPath(); c.moveTo(-w, -166);
    c.quadraticCurveTo(-w + Math.sin(t * 8 + k + j) * 6, -166 - hh * 0.6, Math.sin(t * 7 + k + j) * 8, -166 - hh - Math.sin(t * 13 + k) * 8); c.quadraticCurveTo(w, -166 - hh * 0.5, w, -166); c.fill(); });
  c.restore();
}
function fire(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -40, 520, '#ff7a2a', 0.42 + 0.06 * Math.sin(t * 11)); c.restore();
  c.fillStyle = '#2a1a10'; for (let k = 0; k < 7; k++) { c.beginPath(); c.ellipse(Math.cos(k * 0.9) * 74, 6 + Math.sin(k * 0.9) * 10, 16, 11, 0, 0, 6.283); c.fill(); } // stones
  c.strokeStyle = '#3a2214'; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath(); c.moveTo(-60, 10); c.lineTo(56, -8); c.moveTo(-52, -10); c.lineTo(62, 12); c.stroke();
  [['#ff6a1a', 70, 160], ['#ffa83a', 48, 120], ['#ffe08a', 24, 70]].forEach(([col, w, h], k) => {
    c.fillStyle = col; c.beginPath(); c.moveTo(-w, 0);
    c.quadraticCurveTo(-w * 0.8 + Math.sin(t * 9 + k) * 10, -h * 0.6, Math.sin(t * 7 + k) * 14, -h - Math.sin(t * 13 + k) * 14);
    c.quadraticCurveTo(w * 0.8 + Math.sin(t * 8 + k) * 10, -h * 0.6, w, 0); c.closePath(); c.fill(); });
  c.restore();
}
function sparks(c, t, x, y, n, seed, a = 1, spread = 1) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) { const ph = (t * (0.6 + r()) + r()) % 1, ang = -Math.PI / 2 + (r() - 0.5) * 1.6 * spread, d = ph * (60 + r() * 140);
    c.fillStyle = `rgba(255,${190 + r() * 60 | 0},120,${a * (1 - ph)})`; c.beginPath(); c.arc(x + Math.cos(ang) * d, y + Math.sin(ang) * d + ph * ph * 60, 2 + r() * 2, 0, 6.283); c.fill(); }
}
function well(c, x, y, s, water = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.25)'; c.beginPath(); c.ellipse(10, 96, 190, 26, 0, 0, 6.283); c.fill();
  c.fillStyle = '#8a6a4a'; c.beginPath(); c.ellipse(0, 0, 150, 40, 0, 0, 6.283); c.fill();
  const g = c.createLinearGradient(-150, 0, 150, 0); g.addColorStop(0, '#9a7a56'); g.addColorStop(1, '#5a4030'); c.fillStyle = g; c.fillRect(-150, 0, 300, 90);
  c.beginPath(); c.ellipse(0, 90, 150, 40, 0, 0, Math.PI); c.fill();
  c.strokeStyle = '#4a3420'; c.lineWidth = 3; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-150, 22 * k + 12); c.quadraticCurveTo(0, 22 * k + 52, 150, 22 * k + 12); c.stroke(); }
  for (let k = 0; k < 9; k++) { c.beginPath(); c.moveTo(-140 + k * 35, 14 + Math.sin(k) * 4 + (k % 2) * 22); c.lineTo(-140 + k * 35, 36 + (k % 2) * 22); c.stroke(); }
  c.fillStyle = water > 0 ? mix('#1a2a3a', '#4a7a9a', water) : '#120c08'; c.beginPath(); c.ellipse(0, 0, 120, 28, 0, 0, 6.283); c.fill();
  c.fillStyle = `rgba(220,240,255,${0.45 * water})`; c.beginPath(); c.ellipse(-30, -4, 40, 5, 0, 0, 6.283); c.fill();
  c.strokeStyle = '#4a2e18'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(-130, 10); c.lineTo(-110, -220); c.moveTo(130, 10); c.lineTo(110, -220); c.moveTo(-125, -215); c.lineTo(125, -215); c.stroke();
  c.fillStyle = '#6a4424'; c.beginPath(); c.arc(0, -215, 20, 0, 6.283); c.fill();
  c.strokeStyle = '#a08a6a'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -195); c.lineTo(0, -40); c.stroke();
  c.fillStyle = '#7a5434'; c.beginPath(); c.roundRect(-16, -48, 32, 30, 5); c.fill();
  c.restore();
}
function jar(c, x, y, s, col = '#b07a4a') {
  c.save(); c.translate(x, y); c.scale(s, s);
  const g = c.createLinearGradient(-30, 0, 30, 0); g.addColorStop(0, mix(col, '#ffffff', 0.2)); g.addColorStop(1, mix(col, '#000000', 0.35));
  c.fillStyle = g; c.beginPath();
  c.moveTo(-14, -70); c.lineTo(14, -70); c.quadraticCurveTo(10, -56, 26, -40); c.quadraticCurveTo(36, -10, 16, 0); c.lineTo(-16, 0); c.quadraticCurveTo(-36, -10, -26, -40); c.quadraticCurveTo(-10, -56, -14, -70); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(-28, -36, 56, 6); c.restore();
}
function footprints(c, pts, color) {
  pts.forEach(([x, y, ang, s, a], i) => {
    if (a <= 0) return;
    c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s * 0.55); c.fillStyle = hexA(color, 0.55 * a);
    c.beginPath(); c.ellipse(i % 2 ? 14 : -14, 0, 11, 24, 0, 0, 6.283); c.fill(); c.restore();
  });
}
function dayMarks(c, n, k, y = 1720) {
  for (let i = 0; i < n; i++) {
    const x = W / 2 + (i - (n - 1) / 2) * 190, f = clamp(k * n - i);
    c.fillStyle = 'rgba(10,6,4,0.45)'; c.beginPath(); c.arc(x, y, 60, 0, 6.283); c.fill();
    c.strokeStyle = 'rgba(251,231,198,0.85)'; c.lineWidth = 5; c.beginPath(); c.arc(x, y, 56, 0, 6.283); c.stroke();
    if (f > 0) { c.fillStyle = `rgba(246,196,83,${0.9 * f})`; c.beginPath(); c.moveTo(x, y); c.arc(x, y, 50, -Math.PI / 2, -Math.PI / 2 + f * 6.283); c.closePath(); c.fill(); }
    textGlow(c, String(i + 1), x, y + 4, '600 56px Lora', '#fff7e6', 0.95, '#000', 10);
  }
}
// the whole valley: far range, two great outcrops with tombs, a smaller one in front
function valley(c, t, o = {}) {
  const base = o.base || 1180, col = o.col || '#b8774c', lit = o.lit || 0, px = o.px || 0;
  par(c, 0.2, px, 0, () => { rangeFar(c, base - 330, mix(col, o.sky || '#d8a888', 0.62), 4, 140); haze(c, base - 200, 260, o.sky || '#e8b890', 0.5); });
  par(c, 0.45, px, 0, () => {
    rock(c, 170, base, 640, 700, mix(col, '#000000', 0.06), 3, { lightX: o.lightX });
    rock(c, 900, base, 720, 820, col, 5, { lightX: o.lightX });
    if (!o.noTombs) { tomb(c, 150, base, 210, 320, mix(col, '#ffe0c0', 0.1), { lit, t }); tomb(c, 830, base, 250, 390, mix(col, '#ffe0c0', 0.12), { lit, t }); tomb(c, 1010, base - 6, 150, 230, mix(col, '#ffe0c0', 0.08), { lit: lit * (o.dimRight === undefined ? 1 : o.dimRight), t }); }
    haze(c, base, 160, o.sky || '#e8b890', 0.28);
  });
  par(c, 0.7, px, 0, () => {
    rock(c, 520, base + 50, 460, 400, mix(col, '#000000', 0.14), 9, { lightX: o.lightX });
    if (!o.noTombs) tomb(c, 510, base + 50, 170, 240, mix(col, '#ffe0c0', 0.04), { lit, t });
  });
}

const SCENES = {
  // 1. The Thamud carve their homes in the mountains of al-Hijr — title card
  thamud: {
    grade: 'rgba(255,150,80,0.26)',
    draw(c, t, d) {
      const p = t / d, px = lerp(60, -60, ease(p)), sal = ramp(t, at('thamud', 'Salih', 0, d * 0.8) - 0.6, 1.4);
      cam(c, 1.0 + 0.07 * ease(p), W / 2, 1100);
      sky(c, [[0, '#1c1a3a'], [0.32, '#6a3a52'], [0.52, '#e0885a'], [0.62, '#f4b878']]);
      par(c, 0.05, px, 0, () => { sun(c, 840, 900, 70, '#ffc070', 0.95); wisps(c, t, 380, 10, '#ffb890', 0.35, 4, 8); stars(c, t, 60, 4, [0, 0, W, 420], 0.5); });
      valley(c, t, { base: 1190, col: '#b8744a', lit: 0.4, px, sky: '#e8a078' });
      // a tomb being carved: scaffold, two small workers hammering, sparks on each blow
      par(c, 0.45, px, 0, () => {
        c.strokeStyle = '#4a2e18'; c.lineWidth = 6; [[700, 880], [800, 880]].forEach(([x0]) => { c.beginPath(); c.moveTo(x0, 1190); c.lineTo(x0, 860); c.stroke(); });
        c.lineWidth = 8; c.beginPath(); c.moveTo(690, 960); c.lineTo(810, 960); c.stroke();
        [[730, 960], [775, 1188]].forEach(([wx, wy], k) => { const blow = Math.abs(Math.sin(t * 3.2 + k * 1.3));
          figure(c, Object.assign({ x: wx, y: wy, h: 78, dir: -1, armUp: 0.25 + 0.45 * blow, light: 0.7, t, shadow: false }, FOLK[k + 2]));
          if (blow > 0.93) sparks(c, t * 4, wx - 30, wy - 60, 10, 7 + k, 0.9, 1.4); });
      });
      // camels resting and townsfolk walking on the valley floor
      sandFloor(c, 1250, SAND, t, 2);
      camel(c, 160, 1330, 0.55, '#a8784e', t, 1, null, { walk: false });
      [[ (t * 40) % 1400 - 200, 1300, 1 ], [900 - (t * 34) % 1300, 1320, -1]].forEach(([wx, wy, dr], k) => figure(c, Object.assign({ x: wx, y: wy, h: 150, dir: dr, walk: t * 1.1 + k, light: 0.8, t }, FOLK[k])));
      // Salih appears when the narration names him
      if (sal > 0) { c.save(); c.globalAlpha = sal; figure(c, Object.assign({ x: lerp(620, 560, sal), y: 1420, h: 300, dir: -1, walk: sal < 1 ? t * 1.1 : null, light: 1, t, wind: 0.5 }, SALIH)); c.restore(); }
      blurred(c, 6, () => { acacia(c, -20, 1820, 2.3, '#2a1c14', t); boulder(c, 980, 1900, 320, 200, '#3a2418', 3); });
      dust(c, t, 30, 9, [0, 700, W, 600], '#ffb070', 0.3);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a = seg(t, 0.2, 1.2) * (1 - seg(t, 7.0, 8.0));
      textGlow(c, 'LES PROPHÈTES  ·  ÉPISODE 4', W / 2, 215, '600 34px Lora', '#fbe7c6', a * 0.9, '#000000', 12);
      c.save(); c.direction = 'rtl';
      textGlow(c, 'صَالِح', W / 2, 430 - (1 - easeOut(seg(t, 0.4, 1.6))) * 30, '700 170px Amiri', '#f6c453', a, '#ffb300', 40);
      c.restore();
      textGlow(c, 'ʿalayhi s-salām', W / 2, 585, 'italic 500 46px Lora', '#fff3dc', a, '#000000', 14);
      textGlow(c, 'et la chamelle d\'Allah', W / 2, 650, 'italic 500 34px Lora', '#e8d6b8', a * 0.8, '#000000', 10);
    },
  },

  // 2. "O my people, worship Allah" — Salih speaks to his people in front of the carved tombs
  call: {
    grade: 'rgba(255,175,95,0.24)',
    draw(c, t, d) {
      const p = t / d, raise = ramp(t, at('call', 'adorez') - 0.4, 0.7) * (1 - 0.6 * ramp(t, at('call', 'C\'est') - 0.3, 0.8));
      const px = lerp(-30, 30, ease(p));
      cam(c, 1.03 + 0.05 * p, W / 2, 1150);
      sky(c, [[0, '#4a6a92'], [0.38, '#d8a888'], [0.56, '#f2cc9c']]);
      par(c, 0.05, px, 0, () => { sun(c, 180, 640, 60, '#fff0c0', 0.8); wisps(c, t, 300, 8, '#fff0e0', 0.3, 11, 6); });
      c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 180, 640, 0.75, 0.9, 1700, 9, '#fff0c0', 0.07, t, 9); c.restore();
      valley(c, t, { base: 1080, col: '#b47448', px, sky: '#f0c8a0' });
      sandFloor(c, 1140, SAND, t, 4);
      // Salih on a low rock step
      boulder(c, 250, 1350, 300, 70, '#8a5a3a', 12);
      figure(c, Object.assign({ x: 250, y: 1310, h: 470, dir: 1, armUp: 0.15 + 0.65 * raise, light: 1, t, wind: 0.4 }, SALIH));
      // the people listening (back rows smaller, hazier)
      for (let i = 0; i < 5; i++) figure(c, Object.assign({ x: 560 + i * 110, y: 1250, h: 270, dir: -1, light: 0.5, t: t + i, alpha: 0.85 }, FOLK[(i + 4) % FOLK.length]));
      haze(c, 1260, 120, '#f0c8a0', 0.25);
      for (let i = 0; i < 4; i++) figure(c, Object.assign({ x: 520 + i * 150, y: 1420 + (i % 2) * 30, h: 360, dir: -1, light: 0.75, t: t + i * 2 }, FOLK[i]));
      dust(c, t, 50, 21, [0, 700, W, 900], '#fff0c8', 0.35, 8);
      blurred(c, 7, () => shrub(c, 1000, 1900, 3, '#3a2a1a', t, 4));
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'يَا قَوْمِ اعْبُدُوا اللَّهَ', t, at('call', 'Ô') - 0.3, d + 1, 280, 110);
    },
  },

  // 3. The arrogant notables mock him at night, by torchlight
  mock: {
    grade: 'rgba(200,90,60,0.3)',
    draw(c, t, d) {
      const p = t / d, point = ramp(t, at('mock', 'Tu') - 0.2, 0.5), up = ramp(t, at('mock', 'Apporte') - 0.2, 0.6);
      cam(c, 1.06 - 0.04 * ease(p), W / 2, 1150);
      sky(c, [[0, '#05060e'], [0.5, '#121226'], [0.7, '#2a1a26']]);
      stars(c, t, 140, 13, [0, 0, W, 800], 0.8); moon(c, 840, 300, 44, 0.85);
      valley(c, t, { base: 1100, col: '#5a3a2e', lit: 0.9, sky: '#2a1a26', lightX: 1 });
      sandFloor(c, 1170, '#4a3024', t, 6);
      torch(c, 470, 1460, t, 0, 1.25); torch(c, 1010, 1440, t, 2, 1.25);
      NOBLES.forEach((n, i) => {
        const x = 560 + i * 105, laugh = Math.abs(Math.sin(t * 5 + i * 1.3)) * 4;
        figure(c, Object.assign({}, n, { x, y: 1500 + (i % 2) * 36 - laugh, h: 400, dir: -1, t, light: 0.65,
          reach: i === 0 ? point : 0, armUp: i === 2 || i === 4 ? up * (0.6 + 0.1 * Math.sin(t * 6 + i)) : (i === 1 ? 0.3 * up : 0) }));
      });
      figure(c, Object.assign({ x: 210, y: 1540, h: 520, dir: 1, light: 0.85, t, wind: 0.3 }, SALIH));
      blurred(c, 8, () => { c.fillStyle = '#120a06'; c.fillRect(-60, 1100, 120, 900); torch(c, 0, 1300, t, 5, 1.6); });
      dust(c, t, 30, 17, [0, 1000, W, 500], '#ffb070', 0.35, 8);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'إِنَّمَا أَنتَ مِنَ الْمُسَحَّرِينَ', t, at('mock', 'Tu') - 0.2, d + 1, 280, 96);
    },
  },

  // 4. The sign: the she-camel of Allah comes out of the light of the rock
  camel: {
    grade: 'rgba(255,200,130,0.26)',
    draw(c, t, d) {
      const t0 = at('camel', 'signe', 0, 1.0), burst = ramp(t, t0 - 0.2, 1.6), come = ease(seg(t, t0 + 0.6, at('camel', 'Laissez', 0, d * 0.6)));
      const graze = ramp(t, at('camel', 'manger', 0, d * 0.7), 1.0), show = ramp(t, at('camel', 'Voici', 0, 2), 0.8);
      cam(c, 1.0 + 0.06 * ease(t / d), W / 2, 1150);
      sky(c, [[0, mix('#1a1e34', '#5a7aa2', burst)], [0.4, mix('#4a3040', '#eab890', burst)], [0.6, mix('#5a3a34', '#f8d8a8', burst)]]);
      wisps(c, t, 260, 8, '#fff0e0', 0.25 * burst, 21, 5);
      rangeFar(c, 900, mix('#8a6a6a', '#e0b8a0', burst), 6, 120); haze(c, 1000, 220, '#f0c8a8', 0.4 * burst);
      rock(c, 560, 1250, 1000, 700, mix('#4a3028', '#9a5e3c', burst), 21, { lightX: -1, sharp: 0.6, grooves: 7 });
      tomb(c, 240, 1250, 150, 220, '#a8704a', {}); 
      // the cleft of light in the rock
      c.save(); c.globalCompositeOperation = 'lighter';
      glow(c, 560, 1090, 300 * burst + 30, '#ffe2a0', 0.45 * burst * (1 - 0.35 * come));
      rays(c, 560, 1090, -Math.PI / 2, 2.4, 1000, 16, '#fff0c8', 0.05 * burst, t, 11);
      c.restore();
      c.fillStyle = `rgba(255,248,225,${0.9 * burst})`; c.beginPath(); c.moveTo(540, 1250); c.lineTo(552, 1020); c.lineTo(566, 1110); c.lineTo(580, 1250); c.fill();
      sandFloor(c, 1250, '#d0a070', t, 8);
      // the people watching, small, on the right
      for (let i = 0; i < 5; i++) figure(c, Object.assign({ x: 820 + i * 50, y: 1330 + (i % 2) * 14, h: 170, dir: -1, light: 0.4 + 0.5 * burst, t, alpha: 0.9 }, FOLK[i + 3]));
      // the she-camel walks out of the light
      if (come > 0 || burst > 0.5) {
        const cx = lerp(565, 640, come), cy = lerp(1262, 1560, come), s = lerp(0.45, 1.25, come);
        c.save(); c.globalAlpha = seg(t, t0 + 0.4, t0 + 1.4);
        camel(c, cx, cy, s, CAMEL, come > 0 && come < 1 ? t * 0.8 : 0, 1, null, { walk: come > 0 && come < 1, head: graze * 0.55 });
        c.restore();
      }
      figure(c, Object.assign({ x: 190, y: 1590, h: 520, dir: 1, reach: show * (1 - 0.5 * graze), light: 0.6 + 0.4 * burst, t, wind: 0.4 }, SALIH));
      dust(c, t, 70, 23, [0, 700, W, 1000], '#fff2cc', 0.45 * burst, 10);
      blurred(c, 7, () => boulder(c, 1000, 1950, 380, 240, '#4a2e1c', 5));
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'هَٰذِهِ نَاقَةُ اللَّهِ لَكُمْ آيَةً', t, at('camel', 'Voici', 0, 2) - 0.2, d + 1, 280, 96);
      textGlow(c, 'Al-A\'raf, 73', W / 2, 395, 'italic 500 34px Lora', '#f3e7d0', seg(t, at('camel', 'Voici', 0, 2) + 0.6, at('camel', 'Voici', 0, 2) + 1.4) * 0.85, '#000', 10);
    },
  },

  // 5. The water is shared: one day for the camel, one day for them
  water: {
    grade: 'rgba(255,190,110,0.24)',
    draw(c, t, d) {
      const sw = ramp(t, at('water', 'eux', 0, d * 0.55) - 0.3, 0.9);
      cam(c, 1.02 + 0.04 * t / d, W / 2, 1150);
      sky(c, [[0, '#4a7aa8'], [0.38, '#e8d0a8'], [0.55, '#f6e0b0']]);
      sun(c, 860, 600, 70, '#fff2c0'); wisps(c, t, 320, 6, '#ffffff', 0.25, 5, 5);
      rangeFar(c, 1000, '#d8b090', 9, 110); haze(c, 1080, 200, '#f4dcb8', 0.4);
      rock(c, 140, 1150, 560, 460, '#b47a50', 31); rock(c, 940, 1150, 600, 560, '#a8704a', 33, { lightX: 1 });
      tomb(c, 940, 1150, 200, 300, '#c08a5c', {});
      palm(c, 760, 1180, 0.8, '#3a4a2a', t); palm(c, 300, 1170, 0.7, '#3a4a2a', t + 1);
      sandFloor(c, 1150, '#d4a674', t, 5);
      well(c, 540, 1360, 1.2, 1 - 0.3 * sw);
      c.save(); c.globalAlpha = 1 - sw; camel(c, 300, 1560, 1.25, CAMEL, t, 1, null, { walk: false, head: 0.75 }); c.restore();
      c.save(); c.globalAlpha = sw;
      [0, 1, 2, 3].forEach(i => figure(c, Object.assign({ x: 740 + i * 95, y: 1560 + (i % 2) * 34, h: 330, dir: -1, light: 0.85, t: t + i, reach: i === 0 ? 0.6 : 0 }, FOLK[i + 2])));
      [[270, 1600], [350, 1640], [200, 1660]].forEach(([x, y], i) => jar(c, x, y, 1.3, i % 2 ? '#a06a3a' : '#c08a5a'));
      c.restore();
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'لَهَا شِرْبٌ وَلَكُمْ شِرْبُ يَوْمٍ', t, 0.3, d + 1, 280, 92);
      const la = seg(t, 0.5, 1.1);
      textGlow(c, sw < 0.5 ? 'Jour 1 · la chamelle' : 'Jour 2 · le peuple', W / 2, 1760, '600 44px Lora', '#fbe7c6', la * 0.9 * Math.abs(sw * 2 - 1), '#000', 14);
    },
  },

  // 6. Nine men spreading corruption plot around a fire; they call the most wretched of them
  plot: {
    grade: 'rgba(160,60,40,0.34)',
    draw(c, t, d) {
      const call = ramp(t, at('plot', 'appelèrent', 0, d * 0.5) - 0.2, 0.8), rise = ramp(t, at('plot', 'misérable', 0, d * 0.7) - 0.3, 0.9);
      cam(c, 1.0 + 0.1 * ease(t / d), W / 2, 1320);
      sky(c, [[0, '#040509'], [0.6, '#0e0c16'], [1, '#1a1010']]);
      stars(c, t, 110, 41, [0, 0, W, 700], 0.6);
      rock(c, 120, 1150, 600, 760, '#2a1a14', 41, { lightX: 1, light: 0.3 }); rock(c, 960, 1150, 640, 820, '#24160f', 43, { lightX: -1, light: 0.3 });
      sandFloor(c, 1100, '#24180f', t, 9, false);
      fire(c, 540, 1440, 1.0, t); sparks(c, t, 540, 1340, 16, 3, 0.85);
      for (let i = 0; i < 9; i++) {
        const ang = Math.PI * 1.08 + (i / 8) * Math.PI * 0.84, back = Math.sin(ang) < -0.2;
        const lean = call * 14 * (i === 6 ? 0 : 1), x = 540 + Math.cos(ang) * (390 - lean), y = 1440 - Math.sin(ang) * -150 + 50;
        if (i === 6) continue;
        const f = FOLK[i % FOLK.length];
        figure(c, Object.assign({}, f, { x, y, h: back ? 280 : 330, dir: x < 540 ? 1 : -1, light: 0.3 * (1 - rise * 0.5), t: t + i, pose: i % 3 === 1 ? 'sit' : 'stand',
          robe: mix(f.robe, '#000000', 0.45), wrap: mix(f.wrap, '#3a1a0a', 0.55), skin: mix(f.skin, '#000000', 0.5), trim: '#3a2a1a' }));
      }
      // the most wretched one steps into the firelight
      const f = FOLK[8];
      figure(c, Object.assign({}, f, { x: lerp(760, 700, rise), y: lerp(1560, 1660, rise), h: lerp(330, 430, rise), dir: -1, light: 0.4, t, armUp: 0.25 * rise,
        robe: mix('#4a1a14', '#000000', 0.3), wrap: '#5a3a2a', skin: mix(f.skin, '#000000', 0.45), trim: '#1a0a06' }));
      c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, 1380, 700, '#ff6a2a', 0.12); c.restore();
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'وَكَانَ فِي الْمَدِينَةِ تِسْعَةُ رَهْطٍ', t, 0.4, d + 1, 280, 88, '#ffcf9a');
      textGlow(c, '9', W / 2, 520, '600 150px Lora', '#ffcf9a', seg(t, at('plot', 'neuf', 0, 1) - 0.1, at('plot', 'neuf', 0, 1) + 0.6) * 0.55 * (1 - seg(t, d * 0.6, d * 0.8)), '#ff7a2a', 30);
    },
  },

  // 7. The she-camel is killed (shown only by its absence) — then they defy Salih
  kill: {
    grade: 'rgba(200,50,40,0.36)',
    draw(c, t, d) {
      const tk = at('kill', 'tua', 0, d * 0.25), gone = ramp(t, tk, 0.6), tp = at('kill', 'Puis', 0, d * 0.45);
      phases(c, t, tp - 0.4, 0.8, c => {
        cam(c, 1.0 + 0.05 * t / d, W / 2, 1100);
        sky(c, [[0, '#1a0a12'], [0.4, '#6a1a1a'], [0.6, '#c84a2a']]);
        sun(c, 540, 1010, 90, '#ff8a4a', 0.85); wisps(c, t, 700, 6, '#ff9a6a', 0.25, 3, 4);
        ridge(c, 1190, 60, 0.004, 3, '#2a1210');
        c.save(); c.globalAlpha = 1 - gone; camel(c, 500, ridgeY(500, 1190, 60, 0.004, 3) + 6, 1.15, '#1a0a0a', t, 1, null, { walk: false, head: 0.35, shadow: false }); c.restore();
        // a shadow creeps toward the camel, then a dark flash: nothing is shown
        const sh = ease(seg(t, 0.2, tk));
        c.save(); c.globalAlpha = 1 - gone; figure(c, Object.assign({}, FOLK[8], { x: lerp(-60, 300, sh), y: ridgeY(lerp(-60, 300, sh), 1190, 60, 0.004, 3) + 6, h: 260, dir: 1, walk: sh < 1 ? t * 1.2 : null,
          robe: '#120606', wrap: '#1a0a0a', skin: '#140808', trim: '#0a0404', shadow: false, light: 0, t })); c.restore();
        c.fillStyle = `rgba(0,0,0,${0.85 * Math.sin(gone * Math.PI)})`; c.fillRect(-100, -100, W + 200, H + 200);
        dust(c, t, 80, 47, [200, 900, 700, 400], '#ff9a6a', 0.5 * gone, 30);
        c.strokeStyle = '#2a140c'; c.lineWidth = 9; c.lineCap = 'round'; c.globalAlpha = gone; c.beginPath(); // the empty halter
        c.moveTo(430, 1192); c.bezierCurveTo(480, 1170, 520, 1205, 560, 1186); c.stroke(); c.globalAlpha = 1;
      }, c => {
        // they defy him: fists raised against a bleeding sky; Salih in the foreground
        cam(c, 1.0 + 0.04 * seg(t, tp, d), W / 2, 1150);
        sky(c, [[0, '#14060a'], [0.45, '#5a1214'], [0.65, '#a83a24']]);
        sun(c, 540, 1060, 80, '#ff7a3a', 0.6);
        ridge(c, 1230, 50, 0.004, 5, '#1a0a0a');
        NOBLES.forEach((n, i) => figure(c, Object.assign({}, n, { x: 300 + i * 120, y: ridgeY(300 + i * 120, 1230, 50, 0.004, 5) + 6, h: 260, dir: -1, armUp: 0.75 + 0.1 * Math.sin(t * 5 + i), t,
          robe: mix(n.robe, '#000000', 0.6), wrap: mix(n.wrap, '#000000', 0.7), skin: '#1a0a0a', trim: '#2a1a0a', light: 0, shadow: false })));
        sandFloor(c, 1300, '#5a2a1a', t, 12);
        figure(c, Object.assign({ x: 190, y: 1640, h: 540, dir: 1, light: 0.7, t, wind: 0.6 }, SALIH));
        dust(c, t, 40, 53, [0, 1000, W, 700], '#ffb08a', 0.35, 20);
      });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'فَتَعَاطَىٰ فَعَقَرَ', t, 0.3, d + 1, 280, 120, '#ffcf9a');
    },
  },

  // 8. Three days: Salih warns them, the respite runs out
  days: {
    grade: 'rgba(120,90,140,0.3)',
    draw(c, t, d) {
      const t3 = at('days', 'trois', 0, 1.5), k = ease(seg(t, t3 - 0.3, d - 0.3)), warn = ramp(t, at('days', 'Jouissez', 0, 1) - 0.3, 0.7);
      cam(c, 1.0 + 0.05 * t / d, W / 2, 1150);
      sky(c, [[0, mix('#4a6a92', '#0a0a14', k)], [0.4, mix('#e8b890', '#2a1a24', k)], [0.6, mix('#f6d4a4', '#3a2420', k)]]);
      const ph = (k * 3) % 1, sx = lerp(-60, W + 60, ph), sy = 900 - Math.sin(ph * Math.PI) * 500;
      if (k < 0.99 && k > 0) sun(c, sx, sy, 50, '#fff0c0', 0.8 * (1 - k * 0.5));
      cloudBank(c, t, 140, 12, '#1a1220', 0.6 * k, 7, 14);
      valley(c, t, { base: 1150, col: mix('#b07048', '#3a2420', k), lit: 0.5 * k, sky: mix('#f0c8a0', '#2a1a24', k) });
      sandFloor(c, 1220, mix('#c0905e', '#2a1a14', k), t, 13);
      boulder(c, 300, 1460, 360, 90, mix('#8a5a3a', '#2a1a12', k), 15);
      figure(c, Object.assign({ x: 300, y: 1420, h: 500, dir: 1, armUp: 0.2 + 0.6 * warn, light: 1 - 0.4 * k, t, wind: 0.5 + 0.4 * k }, SALIH));
      c.setTransform(1, 0, 0, 1, 0, 0);
      dayMarks(c, 3, k, 1720);
      arabicCaption(c, 'تَمَتَّعُوا فِي دَارِكُمْ ثَلَاثَةَ أَيَّامٍ', t, at('days', 'Jouissez', 0, 1) - 0.3, d + 1, 280, 82);
    },
  },

  // 9. The Cry and the earthquake — then the town lies empty
  cry: {
    grade: 'rgba(60,60,110,0.4)',
    draw(c, t, d) {
      const tc = at('cry', 'Cri', 0, 1), tt = at('cry', 'trembla', 0, 3), tg = at('cry', 'gisaient', 0, 4.5);
      const hit = seg(t, tc - 0.1, tc + 0.4), quake = clamp(seg(t, tt - 0.6, tt) * (1 - seg(t, tg, tg + 1.6)) + hit * 0.4 * (1 - seg(t, tc + 0.8, tc + 1.6))), after = ramp(t, tg, 1.5);
      const shx = Math.sin(t * 47) * 26 * quake, shy = Math.cos(t * 39) * 18 * quake;
      cam(c, 1.04, W / 2, 1100, shx, shy);
      sky(c, [[0, '#06060c'], [0.4, mix('#2a2238', '#3a3a4a', after)], [0.6, mix('#4a3040', '#6a5a5a', after)]]);
      cloudBank(c, t, 60, 18, '#0e0c14', 0.9, 12, 30);
      const w = seg(t, tc - 0.1, tc + 2.2);
      if (w > 0 && w < 1) { c.strokeStyle = `rgba(230,235,255,${0.75 * (1 - w)})`; c.lineWidth = 34 * (1 - w) + 4; c.beginPath(); c.arc(540, 280, 80 + w * 1700, 0, 6.283); c.stroke();
        c.strokeStyle = `rgba(230,235,255,${0.4 * (1 - w)})`; c.lineWidth = 12; c.beginPath(); c.arc(540, 280, 40 + w * 1300, 0, 6.283); c.stroke();
        c.fillStyle = `rgba(220,225,255,${0.4 * (1 - w)})`; c.fillRect(-200, -200, W + 400, H + 400); }
      valley(c, t, { base: 1160, col: mix('#6a4a3a', '#5a4a44', after), lit: 0.9 * (1 - hit), sky: mix('#3a2a34', '#6a5a5a', after) });
      const r = rng(5);
      for (let i = 0; i < 16; i++) { const t0 = tt - 0.5 + r() * 2.5, q = seg(t, t0, t0 + 1.2), x0 = r() * W, s = 10 + r() * 30;
        if (q > 0 && q < 1) { c.fillStyle = '#4a3428'; c.beginPath(); c.ellipse(x0 + q * 40, 640 + q * q * 760, s, s * 0.8, q * 3, 0, 6.283); c.fill(); } }
      sandFloor(c, 1230, mix('#5a3e2e', '#6a5a4e', after), t, 14);
      dust(c, t, 160, 61, [-100, 760, W + 200, 1000], '#c8b0a0', 0.55 * quake + 0.2 * after, 40);
      c.fillStyle = `rgba(150,130,120,${0.3 * quake})`; c.fillRect(-200, 880, W + 400, 1300);
      blowingSand(c, t, 1300, 0.25 * after, 9);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'وَأَخَذَ الَّذِينَ ظَلَمُوا الصَّيْحَةُ', t, tc - 0.2, tg - 0.2, 280, 88, '#e6efff');
      arabicCaption(c, 'كَأَن لَّمْ يَغْنَوْا فِيهَا', t, at('cry', 'comme', 0, d * 0.7) - 0.2, d + 1, 280, 110, '#e6efff');
    },
  },

  // 10. Allah saves Salih and the believers: they leave the valley toward the dawn, lanterns in hand
  saved: {
    grade: 'rgba(255,200,140,0.26)',
    draw(c, t, d) {
      const go = ease(seg(t, 0, d + 0.8));
      cam(c, 1.0 + 0.05 * t / d, W / 2, 1100);
      sky(c, [[0, '#2a3a5a'], [0.35, '#c89a9a'], [0.55, '#f4c8a0']]);
      sun(c, 860, 960, 55, '#ffe8c0', 0.95);
      c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 860, 960, Math.PI, 2.6, 1400, 14, '#ffe8c0', 0.08, t, 17); c.restore();
      wisps(c, t, 520, 8, '#ffd8c0', 0.35, 13, 5);
      rangeFar(c, 1060, '#a07a7a', 2, 90); haze(c, 1110, 160, '#f4c8a8', 0.5);
      rock(c, 90, 1180, 520, 760, '#6a4434', 41, { lightX: 1 }); tomb(c, 90, 1180, 180, 270, '#7a5040', {});
      sandFloor(c, 1180, '#c09270', t, 15);
      c.fillStyle = 'rgba(255,235,200,0.25)'; c.beginPath(); c.moveTo(160, H + 100); c.quadraticCurveTo(520, 1400, 900, 1120); c.lineTo(940, 1124); c.quadraticCurveTo(620, 1440, 420, H + 100); c.fill();
      const path = q => [lerp(200, 880, q), lerp(1700, 1130, q) - Math.sin(q * Math.PI) * 60];
      for (let i = 6; i >= 0; i--) {
        const q = clamp(go * 0.9 + 0.05 - i * 0.075); if (q <= 0) continue;
        const [x, y] = path(q), h = lerp(420, 120, q);
        const who = i === 0 ? SALIH : Object.assign({}, FOLK[i], { lantern: true });
        figure(c, Object.assign({}, who, { x, y, h, dir: 1, walk: t * 1.15 + i * 0.37, light: 0.9, t, alpha: 1 - seg(q, 0.9, 1), wind: 0.4 }));
      }
      blurred(c, 6, () => { boulder(c, 1000, 1960, 360, 260, '#3a2418', 8); shrub(c, 60, 1920, 3, '#2a1c12', t, 6); });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'نَجَّيْنَا صَالِحًا وَالَّذِينَ آمَنُوا مَعَهُ', t, 0.3, d + 1, 280, 82);
    },
  },

  // 11. He turns away from them — looks back one last time at the silent town, then leaves
  farewell: {
    grade: 'rgba(200,120,90,0.28)',
    draw(c, t, d) {
      const tO = at('farewell', 'Ô', 0, 2), tM = at('farewell', 'Mais', 0, d * 0.7), tc = at('farewell', 'conseillers', 1, d * 0.85);
      const look = ramp(t, tO - 0.3, 0.6), leave = ease(seg(t, tc - 0.2, d + 0.6));
      cam(c, 1.05 - 0.05 * ease(t / d), W / 2, 1100);
      sky(c, [[0, '#141626'], [0.4, '#5a2a30'], [0.6, '#b0603a']]);
      wisps(c, t, 240, 10, '#3a2028', 0.5, 4, 8);
      valley(c, t, { base: 1100, col: '#5a3a2e', lit: 0, sky: '#8a4a3a' });
      sandFloor(c, 1170, '#8a603e', t, 16);
      blowingSand(c, t, 1200, 0.3, 4);
      // footprints leaving to the right
      const pts = []; for (let i = 0; i < 12; i++) { const q = i / 12; pts.push([lerp(700, 1080, q) + (i % 2 ? 8 : -8), lerp(1600, 1700, q), 0.1, 1.3, seg(leave, q * 0.9, q * 0.9 + 0.08)]); }
      footprints(c, pts, '#3a2414');
      const sx = lerp(700, 1200, leave), dirr = leave > 0.02 ? 1 : (t < tO - 0.3 ? 1 : -1);
      figure(c, Object.assign({ x: sx, y: lerp(1600, 1700, leave), h: 520, dir: dirr, light: 0.75, t, wind: 0.7,
        reach: leave > 0 ? 0 : look * (1 - ramp(t, tM - 0.2, 0.6)) * 0.8, walk: leave > 0 && leave < 1 ? t * 1.1 : (t < tO - 0.6 ? t * 1.0 : null) }, SALIH));
      dust(c, t, 60, 33, [0, 900, W, 900], '#ffd0a0', 0.35, 40);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'وَلَٰكِن لَّا تُحِبُّونَ النَّاصِحِينَ', t, tM - 0.3, d + 1, 280, 92);
    },
  },

  // 12. Their homes carved in the rock still stand, empty — "in that is a sign"
  lesson: {
    grade: 'rgba(255,170,90,0.22)',
    draw(c, t, d) {
      const p = t / d;
      cam(c, 1.0 + 0.1 * ease(p), W / 2, 1150, 0, -20 * ease(p));
      sky(c, [[0, '#04050d'], [0.5, '#0c1026'], [0.72, '#2a2234']]);
      milkyWay(c, t, 1); stars(c, t, 240, 61, [0, 0, W, 1100], 1);
      moon(c, 840, 360, 50, 1);
      ridge(c, 1260, 40, 0.003, 8, '#1a141c');
      // the lone monolith with a single great facade (like Qasr al-Farid)
      rock(c, 540, 1380, 760, 700, '#5a3e34', 51, { lightX: 1, sharp: 0.35, light: 0.5, domes: 3, bumps: 2 });
      tomb(c, 540, 1360, 330, 480, '#7a5848', {});
      sandFloor(c, 1360, '#2a1e1a', t, 18);
      blowingSand(c, t, 1380, 0.22, 7);
      dust(c, t, 40, 91, [0, 900, W, 800], '#d8c8b0', 0.3, 18);
      blurred(c, 8, () => { acacia(c, 980, 1980, 2.0, '#0e0a0a', t); boulder(c, 60, 1980, 320, 220, '#120c0a', 9); });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'إِنَّ فِي ذَٰلِكَ لَآيَةً', t, at('lesson', 'Certes', 0, d * 0.4) - 0.3, d + 1, 300, 110);
    },
  },

  outro: {
    grade: null,
    draw(c, t, d) {
      sky(c, [[0, '#05060f'], [0.6, '#0d1024'], [1, '#14122a']]);
      milkyWay(c, t, 0.5); stars(c, t + 50, 140, 81, [0, 0, W, H], 0.7);
      c.globalAlpha = 0.35; rock(c, 540, 1920, 900, 520, '#1a1418', 61, { light: 0.2 }); c.globalAlpha = 1;
      const a = seg(t, 0.2, 1.2);
      c.save(); c.direction = 'rtl';
      textGlow(c, 'وَإِلَىٰ ثَمُودَ', W / 2, 770, '700 100px Amiri', '#f6c453', a, '#ffb300', 30);
      textGlow(c, 'أَخَاهُمْ صَالِحًا', W / 2, 900, '700 100px Amiri', '#f6c453', a, '#ffb300', 30);
      c.restore();
      const b = seg(t, 0.8, 1.8);
      textGlow(c, '« Et aux Thamud, leur frère Salih. »', W / 2, 1040, 'italic 500 38px Lora', '#f3e7d0', b, '#000', 10);
      textGlow(c, '— Hud, 61', W / 2, 1100, 'italic 500 38px Lora', '#f3e7d0', b, '#000', 10);
      textGlow(c, 'LES PROPHÈTES  ·  À SUIVRE', W / 2, 1330, '600 34px Lora', '#c9b48a', seg(t, 1.6, 2.4), '#000', 8);
      c.fillStyle = 'rgba(0,0,0,' + seg(t, d - 0.8, d) + ')'; c.fillRect(0, 0, W, H);
    },
  },
};
function cloudBank(c, t, y, n, color, a = 1, seed = 3, drift = 10) {
  const r = rng(seed); c.fillStyle = hexA(color, a);
  for (let i = 0; i < n; i++) {
    const x = ((r() * (W + 600) + t * drift * (0.5 + r())) % (W + 600)) - 300, yy = y + r() * 220, rr = 90 + r() * 140;
    c.beginPath(); c.ellipse(x, yy, rr * 1.6, rr * 0.7, 0, 0, 6.283); c.fill();
  }
}
