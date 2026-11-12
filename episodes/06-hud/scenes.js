// Episode 6 — Hud (alayhi salam), the people of 'Ad, Iram of the pillars and the barren wind.
// Visual rules: the prophet is shown only as a silhouette in white, face entirely hidden by a veil of white light
// (prophet: true, as in episodes 1 and 4); everyone else is faceless. Allah is never depicted: only light and calligraphy.
// Events are synced to the narration with at(scene, word).

const HUD = { prophet: true, robe: '#ece7da', wrap: '#f7f3ea', skin: '#c99872', trim: '#d4b26a', band: '#c9a86a', inner: '#fbf8f0' };
const FOLK = [
  { robe: '#6a4a32', wrap: '#e2d4b8', skin: '#9a6a4c' }, { robe: '#3a4a62', wrap: '#e6dfcf', skin: '#b07a58' },
  { robe: '#7a5236', wrap: '#d6c29c', skin: '#8f5f42', trim: '#c9a35a' }, { robe: '#4a3a30', wrap: '#ece4d4', skin: '#a8714f' },
  { robe: '#2e4a52', wrap: '#d8ccb2', skin: '#94664a' }, { robe: '#8a5a3a', wrap: '#efe6d4', skin: '#b4805c' },
  { robe: '#5a3a4e', wrap: '#e0d2bc', skin: '#c48e66', trim: '#b89a62' }, { robe: '#3e5440', wrap: '#ddd2bc', skin: '#b07a58' },
  { robe: '#6e3a28', wrap: '#e8dcc4', skin: '#9a6a4c' },
];
const NOBLES = [
  { robe: '#7a2a22', wrap: '#f0e6d0', skin: '#a8714f', trim: '#e0b85a', band: '#e0b85a' },
  { robe: '#22345a', wrap: '#ebe0c8', skin: '#b07a58', trim: '#e0b85a', band: '#b88a3a' },
  { robe: '#4e2650', wrap: '#f0e6d0', skin: '#94664a', trim: '#e0b85a', band: '#e0b85a' },
  { robe: '#5e3a16', wrap: '#e6d8bc', skin: '#b4805c', trim: '#f0c868', band: '#c9a14a' },
  { robe: '#1e4a46', wrap: '#ebe0c8', skin: '#8f5f42', trim: '#e0b85a', band: '#d4a94a' },
];
const CAMEL = '#c28c5c', SAND = '#d39a5e', LAPIS = '#2a4a7a', GOLD = '#e0b85a', STONE = '#c7966a';
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

function lean(c, x, y, ang, fn) { c.save(); c.translate(x, y); c.rotate(ang); c.translate(-x, -y); fn(); c.restore(); } // bow a figure around its feet
function fig(c, base, o) { figure(c, Object.assign({}, base, o)); }

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
function cloudBank(c, t, y, n, color, a = 1, seed = 3, drift = 10) {
  const r = rng(seed); c.fillStyle = hexA(color, a);
  for (let i = 0; i < n; i++) {
    const x = ((r() * (W + 600) + t * drift * (0.5 + r())) % (W + 600)) - 300, yy = y + r() * 220, rr = 90 + r() * 140;
    c.beginPath(); c.ellipse(x, yy, rr * 1.6, rr * 0.7, 0, 0, 6.283); c.fill();
  }
}
function smoke(c, t, x, y, n, seed, col = '#2a2224', a = 0.35, spread = 1, rise = 60) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const ph = (t * (0.08 + r() * 0.06) + r()) % 1, sx = x + (r() - 0.5) * 120 * spread + Math.sin(t * 0.6 + i) * 30 * ph + ph * 90 * spread, sy = y - ph * rise * 14;
    const rr = (40 + r() * 50) * (0.5 + ph * 1.6) * spread;
    const g = c.createRadialGradient(sx, sy, 0, sx, sy, rr); g.addColorStop(0, hexA(col, a * Math.sin(ph * Math.PI))); g.addColorStop(1, hexA(col, 0));
    c.fillStyle = g; c.fillRect(sx - rr, sy - rr, rr * 2, rr * 2);
  }
}
function datePalm(c, x, y, s, col, t = 0, seed = 1) { // segmented trunk, arching fronds with leaflets, date clusters
  c.save(); c.translate(x, y); c.scale(s, s);
  const sway = Math.sin(t * 0.7 + seed) * 6, dk = mix(col, '#000000', 0.3);
  const top = [18 + sway, -300];
  limb(c, [0, 0], [26, -150], top, 22, 13, dk);
  c.strokeStyle = hexA(mix(col, '#ffffff', 0.15), 0.5); c.lineWidth = 2;
  for (let k = 1; k < 16; k++) { const q = k / 16, px = 2 * (1 - q) * q * 26 + q * q * top[0], py = 2 * (1 - q) * q * -150 + q * q * top[1];
    c.beginPath(); c.moveTo(px - 10 + q * 4, py + 3); c.lineTo(px + 10 - q * 4, py - 3); c.stroke(); }
  const r = rng(seed);
  for (let i = 0; i < 11; i++) {
    const ang = -Math.PI / 2 + (i - 5) * 0.34 + (r() - 0.5) * 0.15 + Math.sin(t * 0.9 + i) * 0.03, len = (120 + r() * 50);
    const ex = top[0] + Math.cos(ang) * len, ey = top[1] + Math.sin(ang) * len * 0.55 + len * 0.42;
    const mx = top[0] + Math.cos(ang) * len * 0.55, my = top[1] + Math.sin(ang) * len * 0.55 - 26;
    c.strokeStyle = i % 2 ? col : dk; c.lineWidth = 4; c.beginPath(); c.moveTo(top[0], top[1]); c.quadraticCurveTo(mx, my, ex, ey); c.stroke();
    c.lineWidth = 3;
    for (let k = 2; k < 12; k++) { const q = k / 12, qx = (1 - q) * (1 - q) * top[0] + 2 * (1 - q) * q * mx + q * q * ex, qy = (1 - q) * (1 - q) * top[1] + 2 * (1 - q) * q * my + q * q * ey;
      const l = 30 * (1 - q * 0.6); c.beginPath(); c.moveTo(qx, qy); c.lineTo(qx - 6 + Math.cos(ang + 1.4) * l * 0.4, qy + l); c.moveTo(qx, qy); c.lineTo(qx + 6 + Math.cos(ang - 1.4) * l * 0.4, qy + l * 0.9); c.stroke(); }
  }
  c.fillStyle = '#8a4a1a'; for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(top[0] - 18 + k * 18, top[1] + 30, 9, 16, 0, 0, 6.283); c.fill(); }
  c.restore();
}
function idolShape(c, h, kind, o = {}) {
  const col = o.col || '#8a7a6a', lt = mix(col, '#fff4e0', 0.3), dk = mix(col, '#140a05', 0.45), acc = o.acc || LAPIS;
  const grad = (w) => { const g = c.createLinearGradient(-w, 0, w, 0); g.addColorStop(0, lt); g.addColorStop(0.55, col); g.addColorStop(1, dk); return g; };
  // plinth
  c.fillStyle = grad(h * 0.26); c.fillRect(-h * 0.24, -h * 0.12, h * 0.48, h * 0.12);
  c.fillStyle = lt; c.fillRect(-h * 0.26, -h * 0.13, h * 0.52, h * 0.025); c.fillStyle = hexA(dk, 0.6); c.fillRect(-h * 0.24, -h * 0.03, h * 0.48, h * 0.03);
  if (kind === 3) { // stele with astral symbols (crescent, star, sun disc)
    c.fillStyle = grad(h * 0.2); c.beginPath(); c.moveTo(-h * 0.18, -h * 0.12); c.lineTo(-h * 0.18, -h * 0.8); c.quadraticCurveTo(0, -h * 1.0, h * 0.18, -h * 0.8); c.lineTo(h * 0.18, -h * 0.12); c.closePath(); c.fill();
    c.strokeStyle = hexA(dk, 0.7); c.lineWidth = h * 0.012; c.fillStyle = hexA(GOLD, 0.85);
    c.beginPath(); c.arc(-h * 0.08, -h * 0.74, h * 0.045, 0, 6.283); c.fill();
    c.beginPath(); c.arc(h * 0.08, -h * 0.74, h * 0.045, 0.6, 5.7); c.stroke();
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; c.beginPath(); c.moveTo(0, -h * 0.6); c.lineTo(Math.cos(a) * h * 0.05, -h * 0.6 + Math.sin(a) * h * 0.05); c.stroke(); }
    c.strokeStyle = hexA(dk, 0.35); c.lineWidth = h * 0.008; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(-h * 0.13, -h * (0.46 - k * 0.05)); c.lineTo(h * 0.13, -h * (0.46 - k * 0.05)); c.stroke(); }
    return;
  }
  const big = kind === 2, sq = kind === 1;
  const w0 = h * (sq ? 0.2 : big ? 0.17 : 0.13), w1 = h * (sq ? 0.17 : big ? 0.15 : 0.11), top = -h * (sq ? 0.62 : 0.74);
  // fleece skirt (kaunakes) + torso
  c.fillStyle = grad(w0); c.beginPath(); c.moveTo(-w0, -h * 0.12); c.quadraticCurveTo(-w0 * 1.08, (top - h * 0.12) / 2, -w1, top); c.quadraticCurveTo(0, top - h * 0.03, w1, top); c.quadraticCurveTo(w0 * 1.08, (top - h * 0.12) / 2, w0, -h * 0.12); c.closePath(); c.fill();
  c.strokeStyle = hexA(dk, 0.35); c.lineWidth = h * 0.006;
  for (let k = 0; k < 6; k++) { const yy = -h * 0.16 - k * h * 0.05; c.beginPath(); for (let xx = -w0; xx <= w0; xx += h * 0.02) c.lineTo(xx, yy + Math.sin(xx * 0.4 / (h * 0.01)) * h * 0.008); c.stroke(); }
  c.fillStyle = hexA(acc, 0.85); c.fillRect(-w0 * 0.98, -h * 0.44 + (sq ? h * 0.06 : 0), w0 * 1.96, h * 0.03); // painted belt
  // clasped hands on the chest (worshipper pose)
  c.fillStyle = lt; c.beginPath(); c.ellipse(0, top + h * 0.12, w1 * 0.55, h * 0.035, 0, 0, 6.283); c.fill();
  c.strokeStyle = hexA(dk, 0.4); c.lineWidth = h * 0.008; c.beginPath(); c.moveTo(-w1 * 0.95, top + h * 0.02); c.quadraticCurveTo(-w1 * 0.7, top + h * 0.12, -w1 * 0.3, top + h * 0.12); c.moveTo(w1 * 0.95, top + h * 0.02); c.quadraticCurveTo(w1 * 0.7, top + h * 0.12, w1 * 0.3, top + h * 0.12); c.stroke();
  // shoulders + smooth faceless head
  c.fillStyle = grad(w1); c.beginPath(); c.ellipse(0, top + h * 0.015, w1 * 1.05, h * 0.04, 0, 0, 6.283); c.fill();
  const hr = h * (big ? 0.085 : 0.075), hy = top - hr * 0.9;
  c.fillStyle = grad(hr); c.beginPath(); c.ellipse(0, hy, hr * 0.85, hr, 0, 0, 6.283); c.fill();
  c.fillStyle = hexA(dk, 0.25); c.beginPath(); c.ellipse(hr * 0.3, hy + hr * 0.2, hr * 0.5, hr * 0.7, 0, 0, 6.283); c.fill();
  if (big) { // tall horned crown (tiers), gold
    for (let k = 0; k < 4; k++) { const yy = hy - hr * 0.7 - k * h * 0.035, ww = hr * (0.95 - k * 0.12);
      c.fillStyle = k % 2 ? GOLD : mix(GOLD, '#000000', 0.25); c.fillRect(-ww, yy - h * 0.035, ww * 2, h * 0.035);
      c.strokeStyle = mix(GOLD, '#000000', 0.45); c.lineWidth = h * 0.006; c.beginPath(); c.moveTo(-ww, yy - h * 0.01); c.quadraticCurveTo(-ww * 1.5, yy - h * 0.02, -ww * 1.2, yy - h * 0.05); c.moveTo(ww, yy - h * 0.01); c.quadraticCurveTo(ww * 1.5, yy - h * 0.02, ww * 1.2, yy - h * 0.05); c.stroke(); }
    c.fillStyle = hexA(GOLD, 0.8); c.fillRect(-w0 * 0.98, -h * 0.26, w0 * 1.96, h * 0.02);
  } else if (kind === 0) { c.fillStyle = hexA(acc, 0.9); c.beginPath(); c.ellipse(0, hy - hr * 0.75, hr * 0.8, hr * 0.32, 0, Math.PI, 0); c.fill(); }
}
// broken: 0 intact .. 1 shards resting on the floor
function idol(c, x, y, h, kind, o = {}) {
  const b = o.broken || 0;
  c.save(); c.translate(x, y);
  if (o.shadow !== false) { c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(h * 0.04, 2, h * 0.34, h * 0.04, 0, 0, 6.283); c.fill(); }
  if (b <= 0) { idolShape(c, h, kind, o); c.restore(); return; }
  const r = rng(o.seed || 7), cuts = [0.13, 0.36, 0.58, 0.82, 1.2], pieces = [];
  const jag = (yy, sd) => { const q = rng(sd), p = []; for (let k = 0; k <= 6; k++) p.push([-h * 0.4 + k * h * 0.8 / 6, -h * yy + (q() - 0.5) * h * 0.06]); return p; };
  const lines = cuts.map((cy, i) => jag(cy, (o.seed || 7) * 10 + i));
  // plinth stays
  c.save(); c.beginPath(); c.moveTo(-h, 10); lines[0].forEach(p => c.lineTo(p[0], p[1])); c.lineTo(h, 10); c.closePath(); c.clip(); idolShape(c, h, kind, o); c.restore();
  for (let i = 0; i < cuts.length - 1; i++) {
    for (let side = -1; side <= 1; side += 2) {
      const lo = lines[i], hi = lines[i + 1], cy = -h * (cuts[i] + Math.min(cuts[i + 1], 1)) / 2, cx = side * h * 0.07;
      const d = r(), dir = side * (0.4 + d), delay = i * 0.06 + r() * 0.08, q = clamp((b - delay) / (1 - delay));
      const fall = -cy - h * 0.04 - r() * h * 0.03, bounce = Math.abs(Math.sin(clamp(q * 1.4 - 0.4) * Math.PI)) * 0.15 * (1 - q);
      const dx = dir * h * (0.25 + i * 0.12) * easeOut(q), dy = fall * Math.min(1, q * q * 1.25) - bounce * h, rot = side * (1.1 + d) * easeOut(q);
      c.save(); c.translate(cx + dx, cy + dy); c.rotate(rot); c.translate(-cx, -cy);
      const mid = lo.length >> 1, half = side < 0 ? [lo.slice(0, mid + 1), hi.slice(0, mid + 1)] : [lo.slice(mid), hi.slice(mid)];
      c.beginPath(); half[0].forEach((p, k) => k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]));
      [...half[1]].reverse().forEach(p => c.lineTo(p[0], p[1])); c.closePath();
      c.clip(); idolShape(c, h, kind, o); c.restore();
    }
  }
  // dust puff at the moment of breaking
  const pf = seg(b, 0, 0.5);
  if (pf > 0 && pf < 1) for (let k = 0; k < 9; k++) { const a = k * 0.7, rr = h * (0.06 + pf * 0.22); c.fillStyle = `rgba(200,180,150,${0.35 * (1 - pf)})`; c.beginPath(); c.arc(Math.cos(a) * h * 0.2 * pf, -h * 0.4 + Math.sin(a) * h * 0.25 * pf, rr, 0, 6.283); c.fill(); }
  c.restore();
}

// ---------- interiors
function flowers(c, x, y, rw, grow, seed, t, n = 40) { // grass and blossoms sprouting in an oval around (x, y)
  if (grow <= 0) return;
  const r = rng(seed), cols = ['#ffffff', '#ffd6e0', '#fff0a8', '#ffe0f0', '#d8f0ff'];
  for (let i = 0; i < n; i++) {
    const a = r() * 6.283, d = Math.sqrt(r()), px = x + Math.cos(a) * rw * d, py = y + Math.sin(a) * rw * 0.22 * d, delay = r() * 0.5, g = clamp((grow - delay) / 0.5);
    const hh = (30 + r() * 60) * ease(g) * (0.6 + py / H * 0.5), sw = Math.sin(t * 1.5 + i) * 4;
    if (g <= 0) continue;
    c.strokeStyle = mix('#3a7a3a', '#6ab04a', r()); c.lineWidth = 3; c.lineCap = 'round';
    for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(px + k * 6, py); c.quadraticCurveTo(px + k * 10, py - hh * 0.5, px + k * 14 + sw, py - hh * 0.8); c.stroke(); }
    if (i % 2 === 0) { const bx = px + sw, by = py - hh, br = (7 + r() * 7) * ease(clamp(g * 1.5 - 0.5)), col = cols[i % cols.length];
      c.fillStyle = col; for (let k = 0; k < 5; k++) { const an = k * 1.2566 + t * 0.2; c.beginPath(); c.ellipse(bx + Math.cos(an) * br * 0.7, by + Math.sin(an) * br * 0.7, br * 0.6, br * 0.35, an, 0, 6.283); c.fill(); }
      c.fillStyle = '#f6c453'; c.beginPath(); c.arc(bx, by, br * 0.3, 0, 6.283); c.fill(); }
  }
}
function lightFromAbove(c, t, x, a, w = 420) { // a column of soft light (no form, no figure)
  if (a <= 0) return;
  c.save(); c.globalCompositeOperation = 'lighter';
  const g = c.createLinearGradient(0, 0, 0, 1700); g.addColorStop(0, `rgba(255,252,240,${0.5 * a})`); g.addColorStop(1, 'rgba(255,252,240,0)');
  c.fillStyle = g; c.beginPath(); c.moveTo(x - w * 0.35, -100); c.lineTo(x + w * 0.35, -100); c.lineTo(x + w, 1700); c.lineTo(x - w, 1700); c.closePath(); c.fill();
  c.restore();
  rays(c, x, -60, Math.PI / 2, 0.9, 1800, 12, '#fffaf0', 0.06 * a, t, 23);
}

// ---------- the land of al-Ahqaf and the city of Iram
// sand ridge with lit crest, soft shading toward the viewer and wind ripples
function fgRidge(c, y, amp, freq, seed, col, o = {}) {
  const path = () => { c.beginPath(); c.moveTo(-300, H + 300); for (let x = -300; x <= W + 300; x += 12) c.lineTo(x, ridgeY(x, y, amp, freq, seed)); c.lineTo(W + 300, H + 300); c.closePath(); };
  const g = c.createLinearGradient(0, y - amp * 1.3, 0, Math.min(H + 200, y + 700));
  g.addColorStop(0, mix(col, '#fff0d0', 0.22 * (o.light === undefined ? 1 : o.light))); g.addColorStop(0.35, col); g.addColorStop(1, mix(col, '#1a0c06', 0.45));
  path(); c.fillStyle = g; c.fill();
  c.save(); path(); c.clip();
  c.lineWidth = 3;
  for (let i = 0; i < 12; i++) { // wind ripples, wider toward the viewer
    const yy = y + 30 + i * i * 7 + i * 16; c.strokeStyle = hexA(i % 2 ? mix(col, '#000000', 0.3) : mix(col, '#ffffff', 0.25), 0.22);
    c.beginPath(); for (let x = -200; x <= W + 200; x += 24) { const v = yy + Math.sin(x * (0.012 - i * 0.0005) + i * 2.1 + seed) * (5 + i) - (ridgeY(x, y, amp, freq, seed) - y) * 0.5; x === -200 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke();
  }
  if (o.shade) { const sg = c.createLinearGradient(-200, 0, W + 200, 0); sg.addColorStop(0, 'rgba(20,8,4,0)'); sg.addColorStop(1, `rgba(20,8,4,${o.shade})`); c.fillStyle = sg; c.fillRect(-300, y - amp * 2, W + 600, H); }
  c.restore();
  if (o.rim) { c.strokeStyle = o.rim; c.lineWidth = o.rimW || 3; c.beginPath(); for (let x = -300; x <= W + 300; x += 12) { const v = ridgeY(x, y, amp, freq, seed); x === -300 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); }
}
// a colossal fluted pillar (Iram "dhat al-'imad"); broken > 0 cuts the shaft with a jagged top and no capital
function column(c, x, y, w, h, col, o = {}) {
  const lt = mix(col, '#fff2dc', 0.3), dk = mix(col, '#1a0c06', 0.5), md = mix(col, '#1a0c06', 0.22), br = o.broken || 0;
  const base = y - h * 0.085, sTop = br ? y - h * (1 - br) : y - h * 0.9;
  c.fillStyle = hexA('#140a05', 0.25); c.beginPath(); c.ellipse(x + w * 0.4, y + 2, w * 1.3, w * 0.18, 0, 0, 6.283); c.fill();
  c.fillStyle = md; c.fillRect(x - w * 0.85, y - h * 0.045, w * 1.7, h * 0.045);
  c.fillStyle = col; c.fillRect(x - w * 0.72, base, w * 1.44, h * 0.04);
  c.fillStyle = lt; c.fillRect(x - w * 0.85, y - h * 0.045, w * 1.7, Math.max(2, h * 0.006)); c.fillRect(x - w * 0.72, base, w * 1.44, Math.max(2, h * 0.006));
  const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, lt); g.addColorStop(0.42, col); g.addColorStop(1, dk);
  const topPts = [];
  if (br) { const r = rng(o.seed || 3); for (let k = 0; k <= 6; k++) topPts.push([x - w * 0.47 + k * w * 0.94 / 6, sTop + (r() - 0.3) * w * 0.5]); }
  c.fillStyle = g; c.beginPath(); c.moveTo(x - w / 2, base);
  if (br) topPts.forEach(p => c.lineTo(p[0], p[1])); else { c.lineTo(x - w * 0.44, sTop); c.lineTo(x + w * 0.44, sTop); }
  c.lineTo(x + w / 2, base); c.closePath(); c.fill();
  c.save(); c.clip();
  for (let k = -3; k <= 3; k++) { const fx = x + k * w * 0.13; c.strokeStyle = hexA(dk, 0.28); c.lineWidth = Math.max(1, w * 0.035); c.beginPath(); c.moveTo(fx, base); c.lineTo(fx * 0.995 + x * 0.005, sTop - w); c.stroke();
    c.strokeStyle = hexA(lt, 0.18); c.lineWidth = Math.max(1, w * 0.02); c.beginPath(); c.moveTo(fx + w * 0.04, base); c.lineTo(fx + w * 0.04, sTop - w); c.stroke(); }
  c.strokeStyle = hexA(dk, 0.3); c.lineWidth = Math.max(1, h * 0.003); // drums
  for (let k = 1; k < 8; k++) { const yy = base - (base - sTop) * k / 8; c.beginPath(); c.moveTo(x - w / 2, yy); c.lineTo(x + w / 2, yy); c.stroke(); }
  const vg = c.createLinearGradient(0, sTop, 0, y); vg.addColorStop(0, 'rgba(255,240,210,0.08)'); vg.addColorStop(1, 'rgba(20,10,5,0.3)'); c.fillStyle = vg; c.fillRect(x - w, sTop - w, w * 2, y - sTop + w);
  c.restore();
  if (!br) { // capital: echinus + abacus + shadow under it
    c.fillStyle = col; c.beginPath(); c.moveTo(x - w * 0.44, sTop); c.quadraticCurveTo(x - w * 0.7, sTop - h * 0.01, x - w * 0.72, sTop - h * 0.04); c.lineTo(x + w * 0.72, sTop - h * 0.04); c.quadraticCurveTo(x + w * 0.7, sTop - h * 0.01, x + w * 0.44, sTop); c.closePath(); c.fill();
    c.fillStyle = hexA(dk, 0.45); c.fillRect(x - w * 0.44, sTop, w * 0.88, h * 0.012);
    c.fillStyle = lt; c.fillRect(x - w * 0.8, y - h, w * 1.6, h * 0.06 - h * 0.04 + h * 0.025);
    c.fillStyle = md; c.fillRect(x - w * 0.8, y - h + h * 0.045, w * 1.6, h * 0.012);
  }
}
// stepped tower with arched windows and merlons; grow < 1 = under construction (scaffold on top)
function tower(c, x, y, w, h, col, o = {}) {
  const tiers = o.tiers || 4, grow = o.grow === undefined ? 1 : o.grow, lit = o.lit || 0, t = o.t || 0;
  if (grow <= 0) return;
  const lt = mix(col, '#fff2dc', 0.25), dk = mix(col, '#1a0c06', 0.48), th = h / tiers, top = y - h * grow;
  for (let k = 0; k < tiers; k++) {
    const y0 = y - k * th, y1 = Math.max(top, y0 - th); if (y1 >= y0) break;
    const tw = w * (1 - k * 0.14);
    const g = c.createLinearGradient(x - tw / 2, 0, x + tw / 2, 0); g.addColorStop(0, lt); g.addColorStop(0.5, col); g.addColorStop(1, dk);
    c.fillStyle = g; c.fillRect(x - tw / 2, y1, tw, y0 - y1);
    c.fillStyle = hexA(dk, 0.35); for (let b = 1; b < 6; b++) c.fillRect(x - tw / 2, y0 - (y0 - y1) * b / 6, tw, 1.5); // courses of stone
    if (y0 - y1 >= th * 0.98) {
      c.fillStyle = lt; c.fillRect(x - tw / 2 - tw * 0.04, y1, tw * 1.08, th * 0.06); c.fillStyle = hexA(dk, 0.5); c.fillRect(x - tw / 2 - tw * 0.04, y1 + th * 0.06, tw * 1.08, th * 0.03);
      const nwin = k < 2 ? 2 : 1;
      for (let j = 0; j < nwin; j++) { const wx = x + (nwin === 1 ? 0 : (j - 0.5) * tw * 0.42), ww = tw * 0.13, wh = th * 0.42, wy = y0 - th * 0.25;
        c.fillStyle = '#1a0e08'; c.beginPath(); archPath(c, wx, wy, ww, wh); c.fill();
        if (lit > 0) { c.fillStyle = hexA('#ffb860', 0.85 * lit); c.beginPath(); archPath(c, wx, wy, ww * 0.8, wh * 0.85); c.fill();
          c.save(); c.globalCompositeOperation = 'lighter'; glow(c, wx, wy - wh * 0.4, ww * 2.2, '#ff9a40', 0.3 * lit * (0.85 + 0.15 * Math.sin(t * 3 + wx))); c.restore(); } }
    }
  }
  const topW = w * (1 - (tiers - 1) * 0.14);
  if (grow >= 0.999) { // merlons
    const n = 5, mw = topW / (n * 2 - 1);
    for (let k = 0; k < n; k++) { c.fillStyle = k % 2 ? col : lt; c.fillRect(x - topW / 2 + k * mw * 2, y - h - th * 0.18, mw, th * 0.18); }
  } else if (!o.ruin) { // scaffold + hoisted block
    c.strokeStyle = '#4a2e18'; c.lineWidth = Math.max(2, w * 0.03);
    [x - topW * 0.6, x + topW * 0.6].forEach(sx => { c.beginPath(); c.moveTo(sx, top + th * 0.4); c.lineTo(sx, top - th * 0.9); c.stroke(); });
    c.beginPath(); c.moveTo(x - topW * 0.7, top - th * 0.85); c.lineTo(x + topW * 0.9, top - th * 0.85); c.stroke();
    c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + topW * 0.75, top - th * 0.85); c.lineTo(x + topW * 0.75, top - th * 0.3 + Math.sin(t * 1.5) * 4); c.stroke();
    c.fillStyle = col; c.fillRect(x + topW * 0.62, top - th * 0.32 + Math.sin(t * 1.5) * 4, topW * 0.26, th * 0.18);
  }
}
// the city of Iram: towers, a palace on terraces and the great colonnade
function iram(c, t, o = {}) {
  const b = o.base || 1100, col = o.col || STONE, s = o.s || 1, lit = o.lit || 0, cx = o.cx || 540, br = o.broken || 0;
  c.save(); c.translate(cx, b); c.scale(s, s); c.translate(-540, -b);
  const far = mix(col, o.sky || '#e8b890', 0.35);
  if (!br) {
    tower(c, 110, b - 40, 150, 720, far, { lit: lit * 0.7, t }); tower(c, 960, b - 40, 160, 780, far, { lit: lit * 0.7, t, tiers: 5 });
    // palace on stepped terraces
    for (let k = 0; k < 3; k++) { const ww = 640 - k * 150, hh = 90, yy = b - 140 - k * hh;
      const g = c.createLinearGradient(540 - ww / 2, 0, 540 + ww / 2, 0); g.addColorStop(0, mix(far, '#ffffff', 0.15)); g.addColorStop(1, mix(far, '#000000', 0.3));
      c.fillStyle = g; c.fillRect(540 - ww / 2, yy - hh, ww, hh);
      c.fillStyle = hexA('#1a0c06', 0.4); for (let j = 0; j < 7 - k * 2; j++) { const wx = 540 - ww / 2 + (j + 0.5) * ww / (7 - k * 2); c.beginPath(); archPath(c, wx, yy - 12, 20, 46); c.fill();
        if (lit > 0) { c.fillStyle = hexA('#ffb860', 0.7 * lit); c.beginPath(); archPath(c, wx, yy - 14, 14, 38); c.fill(); c.fillStyle = hexA('#1a0c06', 0.4); } }
    }
    tower(c, 300, b - 60, 110, 560, mix(col, far, 0.5), { lit, t }); tower(c, 790, b - 60, 120, 600, mix(col, far, 0.5), { lit, t });
    if (o.flags) { flag(c, 300, b - 60 - 560 - 560 / 4 * 0.18, 1.4, t, '#8a2a22', 1); flag(c, 790, b - 60 - 600 - 600 / 4 * 0.18, 1.4, t, '#2a4a7a', 2);
      flag(c, 110, b - 40 - 720 - 720 / 4 * 0.18, 1.2, t, '#8a2a22', 3); flag(c, 960, b - 40 - 780 - 780 / 5 * 0.18, 1.2, t, '#7a5a1a', 4); }
    haze(c, b - 40, 220, o.sky || '#e8b890', 0.35);
  }
  // colonnade with architrave
  const n = o.n || 7, x0 = 200, x1 = 880, ch = o.colH || 460;
  if (!br) { c.fillStyle = mix(col, '#000000', 0.15); c.fillRect(x0 - 70, b - ch - 50, x1 - x0 + 140, 54);
    c.fillStyle = mix(col, '#fff2dc', 0.25); c.fillRect(x0 - 76, b - ch - 58, x1 - x0 + 152, 12);
    c.fillStyle = hexA('#1a0c06', 0.35); for (let k = 0; k < 22; k++) c.fillRect(x0 - 60 + k * (x1 - x0 + 120) / 22, b - ch - 30, 10, 18); }
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, i / (n - 1)); column(c, x, b, 62, ch, col, { broken: br ? 0.45 + 0.4 * rng(i + 9)() : 0, seed: i + 3 }); }
  c.fillStyle = mix(col, '#000000', 0.2); c.fillRect(x0 - 90, b - 6, x1 - x0 + 180, 14); // stylobate
  c.restore();
}
function crackedEarth(c, y, col, seed, a = 1) {
  const r = rng(seed), dk = mix(col, '#1a0c06', 0.55);
  c.strokeStyle = hexA(dk, 0.55 * a); c.lineCap = 'round';
  for (let i = 0; i < 70; i++) {
    let px = r() * (W + 200) - 100, py = y + Math.pow(r(), 1.4) * (H - y + 100); const sc = 0.4 + (py - y) / (H - y) * 1.2;
    c.lineWidth = 1.5 + sc * 2.5; c.beginPath(); c.moveTo(px, py);
    for (let k = 0; k < 5; k++) { px += (r() - 0.5) * 120 * sc; py += (r() - 0.5) * 30 * sc; c.lineTo(px, py); }
    c.stroke();
  }
}
// a rolling wall of sand-cloud, drawn at quarter resolution and blurred (soft, no hard "balls").
// k: 0 (a line on the horizon) .. 1 (fills the sky)
const _sw = document.createElement('canvas'), _sw2 = document.createElement('canvas'); _sw.width = _sw2.width = 420; _sw.height = _sw2.height = 450;
function stormWall(c, t, k, base, o = {}) {
  if (k <= 0) return;
  const g = _sw.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 420, 450);
  g.setTransform(0.25, 0, 0, 0.25, 75, 0.25 * (1700 - base));
  const r = rng(o.seed || 5), dark = o.dark || '#3a2216', mid = o.mid || '#7a4a2a', rim = o.rim || '#e8a060';
  const top = base - k * (o.height || 1300);
  const bg = g.createLinearGradient(0, top, 0, base); bg.addColorStop(0, mid); bg.addColorStop(0.5, mix(mid, dark, 0.5)); bg.addColorStop(1, dark);
  g.fillStyle = bg; g.fillRect(-300, top + 110 * k, W + 600, base - top + 60);
  for (let j = 4; j >= 0; j--) {
    const yb = top + j * 130 * k + 60;
    for (let i = 0; i < 16; i++) {
      const x = (i / 15) * (W + 500) - 250 + Math.sin(t * 0.22 + i * 1.7 + j) * 50 + (r() - 0.5) * 90;
      const rr = (70 + r() * r() * 260) * (0.35 + 0.75 * k), yy = yb - r() * 160 * k + Math.sin(t * 0.4 + i + j * 2) * 14 * k;
      const gg = g.createRadialGradient(x - rr * 0.35, yy - rr * 0.45, rr * 0.05, x, yy, rr);
      gg.addColorStop(0, mix(mid, rim, j === 0 ? 0.55 : 0.35 - j * 0.05)); gg.addColorStop(0.55, mix(mid, dark, 0.2 + j * 0.12)); gg.addColorStop(1, hexA(mix(dark, mid, 0.25), 0));
      g.fillStyle = gg; g.beginPath(); g.arc(x, yy, rr, 0, 6.283); g.fill();
    }
  }
  for (let i = 0; i < 9; i++) { // long dark bands of driven sand inside the wall
    const yy = top + 200 * k + r() * (base - top) * 0.8, w = 500 + r() * 700, x = ((r() * (W + 900) + t * 60 * (0.5 + r())) % (W + 900)) - 450;
    g.fillStyle = hexA(dark, 0.35); g.beginPath(); g.ellipse(x, yy, w / 2, 26 + r() * 30, 0, 0, 6.283); g.fill();
  }
  const g2 = _sw2.getContext('2d'); g2.setTransform(1, 0, 0, 1, 0, 0); g2.clearRect(0, 0, 420, 450); g2.filter = 'blur(2.5px)'; g2.drawImage(_sw, 0, 0); g2.filter = 'none';
  c.drawImage(_sw2, -300, base - 1700, 1680, 1800);
}
function fgStones(c, x, y, s, col, seed = 1) { // a cluster of rough stones for the blurred foreground
  c.save(); c.translate(x, y); c.scale(s, s);
  rock(c, -60, 0, 260, 170, col, seed, { sharp: 0.9, grooves: 3, domes: 2, bumps: 3 });
  rock(c, 110, 0, 170, 100, mix(col, '#000000', 0.15), seed + 1, { sharp: 0.9, grooves: 2, domes: 2, bumps: 3 });
  c.restore();
}
function bird(c, x, y, s, t, k = 0, col = '#2a1a14') {
  const f = Math.sin(t * 9 + k * 1.7);
  c.strokeStyle = col; c.lineWidth = 3 * s; c.lineCap = 'round'; c.beginPath();
  c.moveTo(x - 22 * s, y - f * 12 * s); c.quadraticCurveTo(x - 10 * s, y - 8 * s - f * 4 * s, x, y);
  c.quadraticCurveTo(x + 10 * s, y - 8 * s - f * 4 * s, x + 22 * s, y - f * 12 * s); c.stroke();
}
// a fallen, hollow palm trunk half covered by sand (Al-Haqqa 7) — the image only, no bodies
function palmTrunk(c, x, y, len, ang, s, col, sandCol, cover = 0.3) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
  const dk = mix(col, '#000000', 0.4), lt = mix(col, '#fff0d8', 0.2);
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(len / 2, 22, len * 0.55, 12, 0, 0, 6.283); c.fill();
  const g = c.createLinearGradient(0, -30, 0, 30); g.addColorStop(0, lt); g.addColorStop(0.5, col); g.addColorStop(1, dk);
  c.fillStyle = g; c.beginPath(); c.moveTo(0, -30); c.lineTo(len, -24); c.lineTo(len, 24); c.lineTo(0, 30); c.closePath(); c.fill();
  c.strokeStyle = hexA(dk, 0.6); c.lineWidth = 3;
  for (let k = 1; k < len / 26; k++) { const xx = k * 26; c.beginPath(); c.moveTo(xx, -29 + xx * 0.012); c.quadraticCurveTo(xx + 8, 0, xx, 29 - xx * 0.012); c.stroke(); }
  c.fillStyle = mix(col, '#fff0d8', 0.1); c.beginPath(); c.ellipse(len, 0, 9, 24, 0, 0, 6.283); c.fill(); // hollow end
  c.fillStyle = '#140a06'; c.beginPath(); c.ellipse(len + 1, 0, 6, 18, 0, 0, 6.283); c.fill();
  c.strokeStyle = dk; c.lineWidth = 3; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(0, -20 + k * 8); c.lineTo(-18 - (k % 2) * 10, -26 + k * 10); c.stroke(); } // torn fibres
  c.fillStyle = sandCol; c.beginPath(); c.moveTo(len * (0.2 - cover * 0.2), 34); c.quadraticCurveTo(len * 0.45, 30 - 80 * cover, len * (0.7 + cover * 0.2), 34); c.closePath(); c.fill();
  c.restore();
}
function rainVeil(c, t, x0, x1, y0, y1, a) {
  if (a <= 0) return;
  const r = rng(91); c.strokeStyle = `rgba(210,225,240,${a})`; c.lineWidth = 2;
  for (let i = 0; i < 90; i++) { const x = x0 + r() * (x1 - x0), ph = (t * (1.2 + r()) + r()) % 1, y = y0 + ph * (y1 - y0), l = 30 + r() * 30;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x - l * 0.25, y + l); c.stroke(); }
}
function sandVeil(c, a, col = '#b07040') { if (a > 0) { c.fillStyle = hexA(col, a); c.fillRect(-300, -300, W + 600, H + 600); } }
function iconMoon(c, x, y, r, f) {
  c.fillStyle = 'rgba(10,6,4,0.45)'; c.beginPath(); c.arc(x, y, r * 1.35, 0, 6.283); c.fill();
  c.strokeStyle = 'rgba(251,231,198,0.7)'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, r * 1.3, 0, 6.283); c.stroke();
  if (f <= 0) return;
  c.save(); c.globalAlpha = f; c.fillStyle = '#f3e6c8'; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill();
  c.fillStyle = '#1a1210'; c.beginPath(); c.arc(x + r * 0.45, y - r * 0.2, r * 0.85, 0, 6.283); c.fill(); c.restore();
}
function iconSun(c, x, y, r, f) {
  c.fillStyle = 'rgba(10,6,4,0.45)'; c.beginPath(); c.arc(x, y, r * 1.35, 0, 6.283); c.fill();
  c.strokeStyle = 'rgba(251,231,198,0.7)'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, r * 1.3, 0, 6.283); c.stroke();
  if (f <= 0) return;
  c.save(); c.globalAlpha = f; c.fillStyle = '#f6c453'; c.beginPath(); c.arc(x, y, r * 0.6, 0, 6.283); c.fill();
  c.strokeStyle = '#f6c453'; c.lineWidth = 3; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; c.beginPath(); c.moveTo(x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78); c.lineTo(x + Math.cos(a) * r * 1.05, y + Math.sin(a) * r * 1.05); c.stroke(); }
  c.restore();
}
// feet that do not slide: the walk cycle is driven by the distance really travelled (one cycle = 0.293 h for a figure)
const stepOf = (dist, h) => dist / (0.293 * h);
const camelT = (dist, s) => dist / (120 * s) * 2.094; // camel(): one leg cycle = 2.094 s of its clock and 120*s px of ground
const turnDir = (t, t0, from = -1, to = 1, dur = 0.4) => lerp(from, to, ease(seg(t, t0, t0 + dur))); // a real turn, not a flip
function caravan(c, dist, x, groundY, s, n, dir = 1, col = '#a8784e') { // groundY(x) -> feet on the sand
  for (let i = 0; i < n; i++) { const cx = x - dir * i * 200 * s;
    camel(c, cx, groundY(cx), s, mix(col, '#000000', i * 0.06), camelT(dist, s) + i * 0.6, dir, i % 2 ? '#7a3a2a' : '#3a4a6a', { shadow: false }); }
}
function flag(c, x, y, s, t, col = '#8a2a22', k = 0) { // pennant on a tower, waving
  c.strokeStyle = '#2a1a10'; c.lineWidth = 3 * s; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 70 * s); c.stroke();
  c.fillStyle = col; c.beginPath(); c.moveTo(x, y - 70 * s);
  for (let i = 0; i <= 8; i++) { const q = i / 8; c.lineTo(x + q * 60 * s, y - 70 * s + q * 8 * s + Math.sin(t * 5 + k - q * 4) * 5 * s * q); }
  for (let i = 8; i >= 0; i--) { const q = i / 8; c.lineTo(x + q * 60 * s, y - 48 * s - q * 6 * s + Math.sin(t * 5 + k - q * 4) * 5 * s * q); }
  c.closePath(); c.fill();
}
function sky0(c, stops) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); sky(c, stops); c.restore(); } // sky in screen space (camera tilts)
const shake = (t, k, a = 22) => [Math.sin(t * 47) * a * k, Math.cos(t * 39) * a * 0.7 * k];


function sculptDune(c, cx, cy, yl, yr, c1, c2, rim) { // a big dune with a sharp crest at (cx, cy), shadow face on the right
  const g = c.createLinearGradient(0, cy, 0, H); g.addColorStop(0, mix(c1, '#fff0d0', 0.15)); g.addColorStop(1, mix(c1, '#1a0c06', 0.4));
  c.fillStyle = g; c.beginPath(); c.moveTo(-300, yl); c.quadraticCurveTo(cx - 260, cy + 30, cx, cy); c.quadraticCurveTo(cx + 320, cy + 70, W + 300, yr); c.lineTo(W + 300, H + 300); c.lineTo(-300, H + 300); c.closePath(); c.fill();
  const g2 = c.createLinearGradient(cx - 150, 0, cx + 650, 0); g2.addColorStop(0, hexA(c2, 0)); g2.addColorStop(0.35, hexA(c2, 0.45)); g2.addColorStop(1, hexA(c2, 0.7));
  c.fillStyle = g2; c.beginPath(); c.moveTo(cx, cy); c.quadraticCurveTo(cx + 320, cy + 70, W + 300, yr); c.lineTo(W + 300, H + 300); c.lineTo(cx - 200, H + 300); c.quadraticCurveTo(cx - 60, cy + 400, cx, cy); c.closePath(); c.fill();
  c.strokeStyle = rim; c.lineWidth = 3; c.beginPath(); c.moveTo(-300, yl); c.quadraticCurveTo(cx - 260, cy + 30, cx, cy); c.quadraticCurveTo(cx + 320, cy + 70, W + 300, yr); c.stroke();
  c.save(); c.beginPath(); c.moveTo(-300, yl); c.quadraticCurveTo(cx - 260, cy + 30, cx, cy); c.bezierCurveTo(cx + 60, cy + 200, cx + 260, cy + 600, cx + 420, H + 300); c.lineTo(-300, H + 300); c.closePath(); c.clip();
  c.strokeStyle = hexA(mix(c1, '#000000', 0.3), 0.25); c.lineWidth = 3;
  for (let i = 0; i < 10; i++) { const yy = cy + 80 + i * i * 9 + i * 20; c.beginPath(); for (let x = -300; x <= cx + 400; x += 24) { const v = yy + Math.sin(x * 0.01 + i * 1.9) * (6 + i) + (x - cx) * 0.12; x === -300 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); }
  c.restore();
}
function stoneDrum(c, x, y, w, h, col, sandCol) { // a fallen column drum lying half buried
  const lt = mix(col, '#fff2dc', 0.3), dk = mix(col, '#1a0c06', 0.5);
  c.fillStyle = 'rgba(10,6,4,0.25)'; c.beginPath(); c.ellipse(x + w * 0.1, y + h * 0.5, w * 0.6, h * 0.14, 0, 0, 6.283); c.fill();
  const g = c.createLinearGradient(0, y - h / 2, 0, y + h / 2); g.addColorStop(0, lt); g.addColorStop(0.5, col); g.addColorStop(1, dk);
  c.fillStyle = g; c.fillRect(x - w / 2, y - h / 2, w, h);
  c.strokeStyle = hexA(dk, 0.35); c.lineWidth = 3; for (let k = 1; k < 6; k++) { c.beginPath(); c.moveTo(x - w / 2, y - h / 2 + k * h / 6); c.lineTo(x + w / 2, y - h / 2 + k * h / 6); c.stroke(); }
  c.fillStyle = mix(col, '#fff2dc', 0.12); c.beginPath(); c.ellipse(x - w / 2, y, h * 0.22, h / 2, 0, 0, 6.283); c.fill();
  c.strokeStyle = hexA(dk, 0.3); c.lineWidth = 2; c.beginPath(); c.ellipse(x - w / 2, y, h * 0.14, h * 0.33, 0, 0, 6.283); c.stroke();
  c.fillStyle = sandCol; c.beginPath(); c.moveTo(x - w * 0.15, y + h / 2 + 4); c.quadraticCurveTo(x + w * 0.3, y - h * 0.15, x + w * 0.75, y + h / 2 + 4); c.closePath(); c.fill();
}

const SCENES = {
  // 1. The 'Ad in the dunes of al-Ahqaf, Iram of the pillars — title card
  ad: {
    grade: 'rgba(255,150,80,0.24)',
    draw(c, t, d) {
      const p = t / d, px = lerp(50, -50, ease(p)), tI = at('ad', 'Iram', 0, 5), tA = at('ad', 'Allah', 0, d * 0.7), tH = at('ad', 'Hud', 0, d * 0.85);
      const shine = ramp(t, tI - 0.2, 1.0) * (1 - ramp(t, tA, 1.2)), hud = ease(seg(t, tH - 2.6, tH + 0.6));
      cam(c, 1.0 + 0.07 * ease(p), W / 2, 1100);
      sky(c, [[0, '#1e1838'], [0.28, '#6a3450'], [0.46, '#d8784e'], [0.58, '#f4b26e']]);
      par(c, 0.05, px, 0, () => { stars(c, t, 50, 4, [0, 0, W, 360], 0.45); sun(c, 270, 880, 78, '#ffc070', 0.95); wisps(c, t, 360, 10, '#ffb890', 0.32, 6, 8); });
      par(c, 0.12, px, 0, () => { ridge(c, 1000, 70, 0.003, 2, '#c98a6e'); haze(c, 1010, 200, '#f0a878', 0.55); });
      par(c, 0.3, px, 0, () => {
        iram(c, t, { base: 1110, col: '#c4865c', lit: 0.55, sky: '#f0a878', s: 0.5, flags: true });
        ridge(c, 1118, 10, 0.004, 3, '#c98a62');
        if (shine > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, 900, 460, '#ffd8a0', 0.25 * shine); rays(c, 270, 880, 0, 1.0, 1100, 10, '#ffe0b0', 0.07 * shine, t, 5); c.restore(); }
        haze(c, 1100, 140, '#f0a878', 0.35);
      });
      par(c, 0.55, px, 0, () => {
        fgRidge(c, 1210, 70, 0.0028, 7, '#c88454', { rim: 'rgba(255,214,160,0.55)' });
        [[60, 1215, 0.75, 1], [170, 1225, 0.6, 2], [930, 1205, 0.7, 3], [1040, 1220, 0.85, 4]].forEach(([x, y, s, k]) => datePalm(c, x, y, s, '#4a5a2e', t, k));
        caravan(c, t * 17, t * 17 - 60, cx => ridgeY(cx, 1210, 70, 0.0028, 7) + 14, 0.3, 4, 1);
        [[200 + t * 26, 1, 0, 26], [980 - t * 24, -1, 1, 24], [760 - t * 18, -1, 5, 18], [420 + t * 15, 1, 6, 15], [600 - t * 21, -1, 2, 21]].forEach(([wx, dr, k, v]) =>
          fig(c, FOLK[k], { x: wx, y: ridgeY(wx, 1210, 70, 0.0028, 7) + 30 + (k % 2) * 14, h: 120 + (k % 2) * 10, dir: dr, walk: stepOf(t * v, 120) + k * 0.3, light: 0.7, t, shadow: false }));
      });
      fgRidge(c, 1440, 110, 0.0022, 11, '#d6955e', { rim: 'rgba(255,224,180,0.7)', shade: 0.35 });
      if (hud > 0) { const hx = lerp(-180, 300, hud); fig(c, HUD, { x: hx, y: ridgeY(hx, 1440, 110, 0.0022, 11) + 8, h: 360, dir: 1, walk: hud < 1 ? stepOf(hx + 180, 360) : null, light: 1, t, wind: 0.6 }); }
      blurred(c, 7, () => { shrub(c, 960, 1910, 3.2, '#3a2214', t, 3); fgStones(c, 60, 1990, 1.3, '#6a4028', 4); });
      dust(c, t, 34, 9, [0, 700, W, 700], '#ffc890', 0.3);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a = seg(t, 0.2, 1.2) * (1 - seg(t, tI - 1.0, tI - 0.2));
      textGlow(c, 'LES PROPHÈTES  ·  ÉPISODE 6', W / 2, 215, '600 34px Lora', '#fbe7c6', a * 0.9, '#000000', 12);
      c.save(); c.direction = 'rtl';
      textGlow(c, 'هُود', W / 2, 430 - (1 - easeOut(seg(t, 0.4, 1.6))) * 30, '700 180px Amiri', '#f6c453', a, '#ffb300', 40);
      c.restore();
      textGlow(c, 'ʿalayhi s-salām', W / 2, 585, 'italic 500 46px Lora', '#fff3dc', a, '#000000', 14);
      textGlow(c, 'et le peuple de \'Ad', W / 2, 650, 'italic 500 34px Lora', '#e8d6b8', a * 0.8, '#000000', 10);
      arabicCaption(c, 'إِرَمَ ذَاتِ الْعِمَادِ', t, tI - 0.1, d + 1, 290, 120);
      textGlow(c, 'Al-Fajr, 7', W / 2, 410, 'italic 500 34px Lora', '#f3e7d0', seg(t, tI + 0.5, tI + 1.2) * 0.85, '#000', 10);
    },
  },

  // 2. "O my people, worship Allah... my reward is only from the Lord of the worlds"
  call: {
    grade: 'rgba(255,175,95,0.22)',
    draw(c, t, d) {
      const p = t / d, tJ = at('call', 'Je', 0, d * 0.6);
      const up = ramp(t, at('call', 'adorez', 0, 3) - 0.4, 0.7) * (1 - ramp(t, tJ - 0.3, 0.7)), open = ramp(t, at('call', 'salaire', 0, d * 0.75) - 0.3, 0.7);
      const px = lerp(-30, 30, ease(p));
      cam(c, 1.03 + 0.05 * p, W / 2, 1150);
      sky(c, [[0, '#4a6a92'], [0.36, '#dca888'], [0.55, '#f4cc98']]);
      par(c, 0.05, px, 0, () => { sun(c, 170, 620, 60, '#fff0c0', 0.85); wisps(c, t, 300, 8, '#fff0e0', 0.3, 11, 6); });
      c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 170, 620, 0.8, 0.9, 1700, 9, '#fff0c0', 0.07, t, 9); c.restore();
      par(c, 0.15, px, 0, () => { ridge(c, 1000, 60, 0.003, 4, '#d8a07a'); haze(c, 1020, 200, '#f4c8a0', 0.5); });
      par(c, 0.35, px, 0, () => { iram(c, t, { base: 1140, col: '#c8905e', s: 0.62, sky: '#f4c8a0', cx: 640, flags: true }); haze(c, 1120, 150, '#f4c8a0', 0.35); });
      fgRidge(c, 1290, 50, 0.003, 5, '#d4985e', { rim: 'rgba(255,230,190,0.6)' });
      // the people listening: back rows smaller, in the haze
      for (let i = 0; i < 6; i++) fig(c, FOLK[(i + 3) % FOLK.length], { x: 520 + i * 100, y: ridgeY(520 + i * 100, 1290, 50, 0.003, 5) + 8 + (i % 2) * 10, h: 250, dir: -1, light: 0.55, t: t + i, alpha: 0.88 });
      haze(c, 1270, 110, '#f4c8a0', 0.25);
      for (let i = 0; i < 4; i++) fig(c, FOLK[i], { x: 560 + i * 140, y: 1370 + (i % 2) * 26, h: 340, dir: -1, light: 0.8, t: t + i * 2, child: i === 2, wind: 0.3 });
      boulder(c, 240, 1340, 320, 80, '#9a6440', 12);
      fig(c, HUD, { x: 240, y: 1300, h: 480, dir: 1, armUp: 0.15 + 0.65 * up, reach: open * 0.75, light: 1, t, wind: 0.45 });
      dust(c, t, 50, 21, [0, 700, W, 900], '#fff0c8', 0.35, 8);
      blurred(c, 7, () => shrub(c, 1010, 1900, 3, '#3a2a1a', t, 4));
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'يَا قَوْمِ اعْبُدُوا اللَّهَ', t, at('call', 'Ô', 0, 1.5) - 0.3, tJ - 0.2, 280, 112);
      arabicCaption(c, 'إِنْ أَجْرِيَ إِلَّا عَلَىٰ رَبِّ الْعَالَمِينَ', t, tJ, d + 1, 280, 76);
    },
  },

  // 3. "Do you build on every height a monument, in vanity? and fortresses, as if you would live forever?"
  towers: {
    grade: 'rgba(255,165,90,0.24)',
    draw(c, t, d) {
      const tm = at('towers', 'monument', 0, 4), tf = at('towers', 'forteresses', 0, d * 0.6), point = ramp(t, at('towers', 'colline', 0, 3) - 0.4, 0.7);
      const tilt = ease(seg(t, tf - 0.6, tf + 1.6)), fort = lerp(0.35, 1, ease(seg(t, tf - 0.3, tf + 2.4)));
      sky0(c, [[0, '#3a5a86'], [0.4, '#e0ae84'], [0.62, '#f6d29c']]);
      cam(c, 1.02 + 0.04 * t / d, W / 2, lerp(1150, 1040, tilt));
      sun(c, 880, 560, 58, '#fff2c8', 0.85); wisps(c, t, 320, 7, '#ffffff', 0.22, 5, 5);
      ridge(c, 1010, 50, 0.003, 9, '#d4a07c'); haze(c, 1030, 200, '#f6d0a6', 0.45);
      // three hills, each crowned by a tower rising on the word "monument"
      let peakC = 900;
      [[150, 1130, 420, 300, 0], [930, 1140, 440, 280, 2], [560, 1110, 520, 330, 1]].forEach(([hx, hy, hw, hh, i]) => {
        const pts = rock(c, hx, hy, hw, hh, mix('#b57a4e', '#e8b890', 0.2 + i * 0.05), 30 + i, { lightX: 1, sharp: 0.22, grooves: 7, domes: 2, bumps: 3 });
        const mid = pts.slice(14, 27), peak = Math.max(...mid.map(p => p[1])) + 6; // lowest of the top points: the tower sits IN the hill
        const g = ease(seg(t, tm - 0.4 + i * 0.45, tm + 1.6 + i * 0.45));
        if (i !== 1) tower(c, hx, peak + 20, 100, 340, '#c08a5e', { grow: 0.12 + 0.88 * g, t, tiers: 4 }); else peakC = peak;
      });
      // the great fortress on the central hill
      tower(c, 560, peakC + 30, 210, 480, '#c48c5e', { grow: fort, t, tiers: 4 });
      if (fort < 1) [[520, 0], [604, 1]].forEach(([wx, k]) => { const blow = Math.abs(Math.sin(t * 3.4 + k * 1.3)), wy = peakC + 30 - 480 * fort + 6;
        fig(c, FOLK[k + 2], { x: wx, y: wy, h: 64, dir: k ? -1 : 1, armUp: 0.25 + 0.5 * blow, light: 0.7, t, shadow: false });
        if (blow > 0.93) sparks(c, t * 4, wx + (k ? -20 : 20), wy - 40, 8, 7 + k, 0.9, 1.3); });
      haze(c, 1140, 140, '#f6d0a6', 0.3);
      fgRidge(c, 1280, 40, 0.003, 13, '#cf9460', { rim: 'rgba(255,230,190,0.5)' });
      // workers hauling a block on rollers
      const hx0 = 1010 - t * 20;
      c.fillStyle = '#c08a5e'; c.fillRect(hx0 + 230, 1260, 150, 80); c.fillStyle = hexA('#1a0c06', 0.35); c.fillRect(hx0 + 230, 1325, 150, 15);
      c.strokeStyle = '#6a4a2a'; c.lineWidth = 3; c.beginPath(); c.moveTo(hx0 + 230, 1290); c.lineTo(hx0 - 20, 1240); c.stroke();
      for (let i = 0; i < 3; i++) lean(c, hx0 + 180 - i * 80, 1340, -0.22, () => fig(c, FOLK[(i + 4) % FOLK.length], { x: hx0 + 180 - i * 80, y: 1340, h: 200, dir: -1, walk: stepOf(t * 20, 200) + i * 0.33, light: 0.75, t, reach: 0.6 }));
      fig(c, HUD, { x: 200, y: 1560, h: 540, dir: 1, reach: point * 0.9, light: 1, t, wind: 0.5 });
      dust(c, t, 40, 27, [0, 700, W, 900], '#fff0c8', 0.3, 10);
      blurred(c, 8, () => fgStones(c, 1000, 1990, 1.3, '#6a4028', 6));
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'أَتَبْنُونَ بِكُلِّ رِيعٍ آيَةً تَعْبَثُونَ', t, at('towers', 'Bâtissez', 0, 1.5) - 0.3, d + 1, 280, 86);
    },
  },

  // 4. "Ask forgiveness of your Lord... He will send the sky upon you in showers and add strength to your strength"
  forgive: {
    grade: 'rgba(200,180,200,0.22)',
    draw(c, t, d) {
      const tp = at('forgive', 'pluie', 0, d * 0.5), tF = at('forgive', 'force', 0, d * 0.8);
      const rain = ramp(t, at('forgive', 'ciel', 0, d * 0.45) - 0.4, 1.4), green = ramp(t, tF - 0.6, 1.8);
      cam(c, 1.0 + 0.05 * t / d, W / 2, 1150);
      sky(c, [[0, mix('#2a2e4e', '#3e5a7e', rain)], [0.38, mix('#a07a8e', '#9aa6b6', rain)], [0.58, mix('#f2c09a', '#e8d6b8', rain)]]);
      sun(c, 820, 960, 52, '#ffe8c0', 0.8 * (1 - rain * 0.4));
      cloudBank(c, t, 160, 14, '#5a6478', 0.55 * rain, 21, 8); cloudBank(c, t, 320, 10, '#7a8498', 0.4 * rain, 22, 12);
      rainVeil(c, t, 380, 1180, 520, 1100, 0.35 * rain * (1 - 0.4 * green));
      c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 820, 700, Math.PI / 2, 1.4, 900, 10, '#fff4dc', 0.06 * rain, t, 31); c.restore();
      ridge(c, 1050, 50, 0.003, 15, mix('#b88a7a', '#7a8a7a', green)); haze(c, 1070, 180, '#e8c8b0', 0.45);
      fgRidge(c, 1150, 30, 0.003, 17, mix('#c8955e', '#9aa060', green * 0.6));
      // the valley turns green and palms grow (a promise, not yet real: soft, a little transparent)
      c.save(); c.globalAlpha = 0.85;
      [[480, 1150, 0.75, 1], [640, 1160, 0.9, 2], [820, 1140, 0.7, 3], [980, 1170, 0.85, 4], [340, 1170, 0.6, 5]].forEach(([x, y, s, k]) => {
        const g = ease(seg(green, k * 0.08, k * 0.08 + 0.6)); if (g > 0) datePalm(c, x, y, s * g, '#3e5a2e', t, k); });
      flowers(c, 700, 1200, 520, green, 4, t, 60);
      c.restore();
      fgRidge(c, 1460, 80, 0.0024, 19, '#d29a62', { rim: 'rgba(255,230,190,0.5)', shade: 0.3 });
      fig(c, HUD, { x: 260, y: ridgeY(260, 1460, 80, 0.0024, 19) + 10, h: 470, dir: 1, pose: 'kneel', dua: true, light: 1, t, wind: 0.4 });
      c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 300, 1160, 260, '#fff6dc', 0.12 + 0.1 * rain); c.restore();
      dust(c, t, 30, 33, [0, 800, W, 800], '#fff0d8', 0.3, 6);
      blurred(c, 7, () => { shrub(c, 1000, 1920, 3.2, '#3a2a1a', t, 8); fgStones(c, 80, 1990, 1.2, '#6a4028', 12); });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'اسْتَغْفِرُوا رَبَّكُمْ ثُمَّ تُوبُوا إِلَيْهِ', t, 0.3, tp - 0.2, 280, 88);
      arabicCaption(c, 'يُرْسِلِ السَّمَاءَ عَلَيْكُم مِّدْرَارًا', t, tp, d + 1, 280, 92);
    },
  },

  // 5. "Who is mightier than us?" — then the camera tilts up to the sky: Allah who created them is mightier
  pride: {
    grade: 'rgba(255,140,70,0.26)',
    draw(c, t, d) {
      const tQ = at('pride', 'Qui', 0, 3), tN = at('pride', 'voyaient', 0, d * 0.55), fists = ramp(t, tQ - 0.3, 0.5);
      const tilt = ease(seg(t, tN - 0.5, tN + 2.5)), light = ramp(t, at('pride', 'qu\'Allah', 0, d * 0.65) - 0.3, 1.8);
      sky0(c, [[0, mix('#2a1a3a', '#4a5a8a', light)], [0.4, mix('#9a3a3a', '#e0a88a', light)], [0.62, '#f2a060']]);
      cam(c, lerp(1.08, 0.96, tilt), W / 2, lerp(1250, 760, tilt));
      sun(c, 540, 1060, 90, '#ffb060', 0.8);
      wisps(c, t, 500, 10, '#ffb890', 0.3, 7, 6);
      lightFromAbove(c, t, 540, light * 0.5, 480);
      par(c, 0.2, 0, 0, () => { ridge(c, 1180, 40, 0.003, 21, '#7a4a3a'); tower(c, 150, 1180, 110, 520, '#8a5a40', { lit: 0.6, t }); tower(c, 930, 1180, 120, 560, '#8a5a40', { lit: 0.6, t }); });
      // palace terrace
      const fy = 1520;
      c.fillStyle = '#6a4030'; c.fillRect(-300, fy - 40, W + 600, H);
      const tg = c.createLinearGradient(0, fy - 40, 0, H); tg.addColorStop(0, '#b07a54'); tg.addColorStop(1, '#4a2a1c'); c.fillStyle = tg; c.fillRect(-300, fy - 34, W + 600, H);
      c.strokeStyle = 'rgba(30,14,8,0.4)'; c.lineWidth = 2; for (let k = 0; k < 8; k++) { const yy = fy - 34 + k * k * 9 + k * 14; c.beginPath(); c.moveTo(-300, yy); c.lineTo(W + 300, yy); c.stroke(); }
      for (let k = -6; k <= 6; k++) { c.beginPath(); c.moveTo(540 + k * 60, fy - 34); c.lineTo(540 + k * 260, H + 200); c.stroke(); }
      column(c, 40, fy - 30, 120, 1250, '#c48c60'); column(c, 1040, fy - 30, 120, 1250, '#b47e56');
      NOBLES.slice(0, 4).forEach((n, i) => { const x = 200 + i * 225, swell = Math.sin(t * 4 + i) * 0.06;
        fig(c, n, { x, y: fy + (i % 2) * 24, h: lerp(560, 600, i % 2), dir: i < 2 ? 1 : -1, armUp: fists * (0.82 + swell) * (i === 1 ? 0.5 : 1), reach: i === 1 ? fists * 0.7 : 0, t, light: 0.85, wind: 0.2 }); });
      c.setTransform(1, 0, 0, 1, 0, 0);
      { const dg = c.createLinearGradient(0, 1250, 0, H); dg.addColorStop(0, 'rgba(20,10,5,0)'); dg.addColorStop(0.3, `rgba(20,10,5,${0.55 * tilt})`); dg.addColorStop(1, `rgba(20,10,5,${0.75 * tilt})`); c.fillStyle = dg; c.fillRect(0, 1250, W, H - 1250); }
      arabicCaption(c, 'مَنْ أَشَدُّ مِنَّا قُوَّةً', t, tQ - 0.2, tN - 0.3, 280, 112, '#ffcf9a');
      arabicCaption(c, 'هُوَ أَشَدُّ مِنْهُمْ قُوَّةً', t, at('pride', 'fort', 1, d * 0.85) - 0.3, d + 1, 280, 112);
      textGlow(c, 'Fussilat, 15', W / 2, 395, 'italic 500 34px Lora', '#f3e7d0', seg(t, at('pride', 'fort', 1, d * 0.85) + 0.4, at('pride', 'fort', 1, d * 0.85) + 1.1) * 0.85, '#000', 10);
    },
  },

  // 6. "O Hud, you brought us no proof; we will not leave our gods on your word" — night, by their idols
  refuse: {
    grade: 'rgba(200,90,60,0.28)',
    draw(c, t, d) {
      const dismiss = ramp(t, at('refuse', 'preuve', 0, 3) - 0.3, 0.5) * (1 - ramp(t, at('refuse', 'abandonnerons', 0, d * 0.6) - 0.2, 0.6));
      const turn = turnDir(t, at('refuse', 'abandonnerons', 0, d * 0.6) - 0.2), venerate = ramp(t, at('refuse', 'abandonnerons', 0, d * 0.6), 0.8);
      cam(c, 1.05 - 0.04 * ease(t / d), W / 2, 1150);
      sky(c, [[0, '#05060e'], [0.5, '#141226'], [0.68, '#2e1a24']]);
      stars(c, t, 140, 13, [0, 0, W, 800], 0.8); moon(c, 860, 300, 42, 0.8);
      ridge(c, 1060, 50, 0.003, 23, '#24161a');
      iram(c, t, { base: 1080, col: '#4a3028', lit: 0.8, sky: '#2e1a24', s: 0.55, cx: 540 });
      // platform with the idols (standing steles, faceless)
      c.fillStyle = '#3a2418'; c.fillRect(300, 1230, 520, 50); c.fillStyle = '#5a3a26'; c.fillRect(290, 1222, 540, 12);
      idol(c, 400, 1225, 460, 3, { col: '#7a6a5a', acc: '#6a2a2a' }); idol(c, 560, 1225, 560, 1, { col: '#8a7a68', acc: LAPIS }); idol(c, 720, 1225, 460, 3, { col: '#7a6a5a', acc: '#6a2a2a' });
      fgRidge(c, 1300, 20, 0.003, 25, '#3e2a1e', { light: 0.3 });
      torch(c, 330, 1400, t, 0, 1.2); torch(c, 1000, 1420, t, 2, 1.2);
      NOBLES.slice(0, 4).forEach((n, i) => { const x = 470 + i * 160;
        fig(c, n, { x, y: 1500 + (i % 2) * 30, h: 410, dir: turnDir(t, at('refuse', 'abandonnerons', 0, d * 0.6) - 0.2 + i * 0.08), t, light: 0.6, reach: i === 0 ? dismiss : 0, armUp: i % 2 === 1 ? venerate * 0.7 : 0 }); });
      fig(c, HUD, { x: 190, y: 1560, h: 520, dir: 1, light: 0.9, t, wind: 0.3 });
      c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 190, 1300, 300, '#fff6dc', 0.12); c.restore();
      dust(c, t, 30, 17, [0, 1000, W, 500], '#ffb070', 0.3, 8);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'يَا هُودُ مَا جِئْتَنَا بِبَيِّنَةٍ', t, at('refuse', 'Ô', 0, 1.5) - 0.3, d + 1, 280, 108, '#ffcf9a');
    },
  },

  // 7. "I put my trust in Allah, my Lord and your Lord. There is no living creature but He holds it in His power."
  trust: {
    grade: 'rgba(170,150,210,0.22)',
    draw(c, t, d) {
      const tA = at('trust', 'Allah', 0, 3), dawn = ramp(t, tA - 0.6, 3.0), lift = ramp(t, at('trust', 'confiance', 0, 2.5) - 0.4, 0.8) * (1 - ramp(t, at('trust', 'Il', 0, d * 0.6) - 0.2, 0.8));
      const tv = at('trust', 'vivant', 0, d * 0.7), life = seg(t, tv - 0.8, d + 0.5);
      cam(c, 1.04 - 0.03 * t / d, W / 2, 1150);
      sky(c, [[0, mix('#070a1e', '#24305a', dawn)], [0.4, mix('#1e1a3a', '#8a6a8e', dawn)], [0.6, mix('#3a2a40', '#f4b880', dawn)]]);
      stars(c, t, 200, 51, [0, 0, W, 1000], 1 - 0.7 * dawn); milkyWay(c, t, 0.7 * (1 - dawn));
      c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 760, 1060, 900, '#ffc880', 0.35 * dawn); rays(c, 760, 1060, -Math.PI / 2, 2.2, 1300, 14, '#ffe0b0', 0.06 * dawn, t, 41); c.restore();
      ridge(c, 1080, 60, 0.0026, 27, mix('#1a1428', '#7a5a62', dawn));
      // living creatures: a camel herd on the far dunes, a flight of birds
      if (life > 0) { c.save(); c.globalAlpha = seg(life, 0, 0.2); caravan(c, 550 * life, lerp(1250, 700, life), cx => ridgeY(cx, 1080, 60, 0.0026, 27) + 16, 0.22, 4, -1, mix('#2a1e24', '#6a4a40', dawn)); c.restore();
        for (let i = 0; i < 11; i++) { const r = rng(i + 70), bx = lerp(-120, 1240, clamp(life * 1.25 - r() * 0.25)), by = 420 + r() * 200 - life * 60; bird(c, bx, by, 0.7 + r() * 0.6, t, i, mix('#1a1420', '#3a2a2a', dawn)); } }
      haze(c, 1090, 160, mix('#3a2a40', '#f0b890', dawn), 0.4);
      fgRidge(c, 1230, 40, 0.003, 30, mix('#2a2034', '#a0705a', dawn), { light: dawn * 0.6 });
      sculptDune(c, 400, 1140, 1330, 1420, mix('#4a3040', '#cf9460', dawn), mix('#24161e', '#7a4a34', dawn), hexA('#ffd8a8', 0.15 + 0.55 * dawn));
      const hx = 400;
      fig(c, HUD, { x: hx, y: 1146, h: 560, dir: 1, armUp: 0.1 + 0.5 * lift, light: 0.5 + 0.5 * dawn, t, wind: 0.9 });
      blowingSand(c, t, 1300, 0.18, 12);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'إِنِّي تَوَكَّلْتُ عَلَى اللَّهِ رَبِّي وَرَبِّكُم', t, at('trust', 'Je', 0, 2) - 0.3, d + 1, 280, 84);
    },
  },

  // 8. Drought — then a cloud on the horizon: "This is a cloud that will bring us rain!"
  cloud: {
    grade: 'rgba(255,200,120,0.24)',
    draw(c, t, d) {
      const tn = at('cloud', 'nuage', 0, 2.5), tv = at('cloud', 'Voici', 0, d * 0.6), k = 0.42 * ease(seg(t, tn - 0.8, d + 1)), joy = ramp(t, tv - 0.3, 0.6);
      cam(c, 1.0 + 0.06 * t / d, W / 2, 1150);
      sky(c, [[0, '#a8a088'], [0.4, '#e8d8b0'], [0.58, '#f6e8c4']]);
      sun(c, 820, 420, 70, '#fffaf0', 0.9 * (1 - k));
      ridge(c, 1080, 40, 0.003, 31, '#c8a888');
      stormWall(c, t, k, 1090, { seed: 7, dark: '#4a3424', mid: '#8a6a50', rim: '#f0d0a0', height: 1100 });
      haze(c, 1110, 160, '#e8d4b0', 0.4);
      // the dry valley: cracked earth, withered palms
      fgRidge(c, 1150, 20, 0.003, 33, '#d8b488', { light: 0.6 });
      crackedEarth(c, 1170, '#d8b488', 5, 0.9);
      [[150, 1210, 0.8, 1], [930, 1190, 0.7, 2], [760, 1170, 0.5, 3]].forEach(([x, y, s, kk]) => datePalm(c, x, y, s, '#6a5a3a', t * 0.2, kk));
      fgRidge(c, 1430, 50, 0.003, 35, '#c89c6c', { rim: 'rgba(255,240,210,0.45)', shade: 0.25 });
      [[300, 1250, 230], [470, 1262, 240], [640, 1248, 225], [820, 1258, 235], [960, 1250, 220]].forEach(([x, y, h], i) =>
        fig(c, FOLK[(i + 4) % FOLK.length], { x, y, h, dir: -1, t: t + i, light: 0.75, alpha: 0.92, armUp: i % 2 ? joy * 0.8 : 0 }));
      haze(c, 1265, 80, '#e8d4b0', 0.25);
      [[250, 0, 420], [520, 40, 380], [760, 10, 440], [990, 50, 360]].forEach(([x, dy, h], i) => { const y = ridgeY(x, 1430, 50, 0.003, 35) + 20 + dy;
        fig(c, FOLK[(i + 1) % FOLK.length], { x, y, h, dir: -1, t: t + i * 1.7, light: 0.9, armUp: i === 2 || i === 0 ? joy * 0.9 : 0, reach: i === 1 ? joy * 0.95 : 0, child: i === 3 }); });
      dust(c, t, 30, 41, [0, 800, W, 800], '#fff4d8', 0.3, 10);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'هَٰذَا عَارِضٌ مُّمْطِرُنَا', t, tv - 0.3, d + 1, 280, 116, '#fff0c8');
    },
  },

  // 9. "Rather, it is what you sought to hasten: a wind bearing a painful punishment, destroying everything"
  wind: {
    grade: 'rgba(200,110,50,0.32)',
    draw(c, t, d) {
      const tN = at('wind', 'Non', 0, 1.3), tv = at('wind', 'vent', 0, 4), td = at('wind', 'détruit', 0, d * 0.7);
      const hit = ramp(t, tN - 0.2, 0.5), k = lerp(0.42, 0.86, ease(seg(t, tN - 0.3, tv + 1.5)));
      const q = clamp(seg(t, tv - 0.3, tv + 0.6) * (1 - seg(t, tv + 1.4, tv + 2.4)) + seg(t, td - 0.3, td + 0.3) * (1 - seg(t, td + 1.2, td + 2.4)));
      const [sx, sy] = shake(t, q, 18), fall = seg(t, td - 0.1, td + 1.6);
      cam(c, 1.04, W / 2, 1150, sx, sy);
      sky(c, [[0, '#1a100c'], [0.3, '#4a2e22'], [0.6, '#9a6440']]);
      stormWall(c, t, k, 1150, { seed: 7, dark: '#2e1c12', mid: '#7a4a2a', rim: '#e09050', height: 1300 });
      // Iram in silhouette; one tower loses its top on "détruit"
      sandVeil(c, 0.12 + 0.12 * k, '#9a6438');
      iram(c, t, { base: 1180, col: '#3a2216', sky: '#5a3420', s: 0.72, n: 6 });
      tower(c, 900, 1230, 170, 720, '#33200f', { grow: 1 - 0.38 * ease(fall), ruin: true, tiers: 5 });
      fgRidge(c, 1205, 14, 0.004, 36, '#5a3420', { light: 0.2 });
      const r = rng(13);
      for (let i = 0; i < 11; i++) { const bx = 900 + (r() - 0.5) * 120 + fall * (80 + r() * 200), by = 1230 - 720 * 0.7 + fall * fall * (420 + r() * 160), rot = fall * (r() - 0.5) * 4;
        if (fall > 0 && fall < 1) { c.save(); c.translate(bx, by); c.rotate(rot); c.fillStyle = '#3a2416'; c.fillRect(-18, -13, 36, 26); c.restore(); } }
      if (fall > 0 && fall < 1) smoke(c, t, 900, 1230 - 720 * 0.62, 8, 5, '#8a5a38', 0.4 * (1 - fall), 1.4, 20);
      sandVeil(c, 0.1 + 0.1 * k, '#9a6438');
      fgRidge(c, 1330, 40, 0.003, 37, '#7a4a2a', { light: 0.3 });
      blowingSand(c, t, 900, 0.35 + 0.3 * k, 3); blowingSand(c, t * 1.3, 1200, 0.4, 5);
      // people running before the wind, bent and wrapped in their cloaks
      for (let i = 0; i < 5; i++) { const x = ((t * (120 + i * 18) + i * 260) % 1500) - 200, y = ridgeY(x, 1330, 40, 0.003, 37) + 40 + (i % 2) * 70;
        lean(c, x, y, 0.2, () => fig(c, FOLK[(i + 2) % FOLK.length], { x, y, h: 300 + (i % 2) * 60, dir: 1, walk: stepOf(t * (120 + i * 18), 300 + (i % 2) * 60) + i * 0.4, light: 0.4, t, wind: 1, covered: true })); }
      dust(c, t, 180, 61, [-100, 600, W + 200, 1300], '#e0b080', 0.5, 60);
      c.fillStyle = `rgba(30,14,6,${0.35 * hit})`; c.fillRect(-200, -200, W + 400, H + 400);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const fl = seg(t, tN - 0.15, tN + 0.5); if (fl > 0 && fl < 1) { c.fillStyle = `rgba(255,220,180,${0.22 * (1 - fl)})`; c.fillRect(0, 0, W, H); }
      arabicCaption(c, 'رِيحٌ فِيهَا عَذَابٌ أَلِيمٌ', t, tv - 0.3, d + 1, 280, 116, '#ffd8a8');
    },
  },

  // 10. Seven nights and eight days, without respite; people overturned like hollow palm trunks
  seven: {
    grade: 'rgba(170,90,50,0.34)',
    draw(c, t, d) {
      const t7 = at('seven', 'sept', 0, 2), tO = at('seven', 'voyait', 0, d * 0.55), cnt = seg(t, t7 - 0.2, tO - 0.4), calm = ramp(t, tO - 0.6, 1.6) * 0.5;
      const flick = 0.5 + 0.5 * Math.sin(cnt * 15 * Math.PI);
      cam(c, 1.02 + 0.06 * ease(t / d), W / 2, 1150);
      sky(c, [[0, mix('#1a0e0a', '#3a2214', flick * (1 - calm))], [0.5, '#6a3e22'], [0.62, '#8a5a34']]);
      stormWall(c, t, 0.85, 1220, { seed: 9, dark: '#2a180e', mid: '#6a3e22', rim: '#c07a40', height: 1300 });
      iram(c, t, { base: 1250, col: '#4a2c1a', sky: '#6a3e22', s: 1.05, broken: 1, n: 6 });
      for (let i = 0; i < 6; i++) { const x = 540 + (lerp(200, 880, i / 5) - 540) * 1.05; c.fillStyle = '#9a6438'; c.beginPath(); c.ellipse(x - 20, 1250, 110 + (i % 3) * 30, 34 + (i % 2) * 22, 0, Math.PI, 0); c.fill(); }
      sandVeil(c, 0.25 * (1 - calm), '#8a5430');
      fgRidge(c, 1300, 50, 0.0025, 39, '#a8703e', { light: 0.4, rim: 'rgba(255,200,140,0.3)' });
      // hollow palm trunks, overturned, half buried
      const sh = ramp(t, tO - 0.3, 1.2);
      c.save(); c.globalAlpha = 0.35 + 0.65 * sh;
      palmTrunk(c, 1020, 1300, 300, 3.08, 0.7, '#4e321e', '#a8703e', 0.3);
      palmTrunk(c, 560, 1290, 340, -0.08, 0.8, '#4e321e', '#a8703e', 0.45);
      palmTrunk(c, -40, 1350, 520, 0.05, 1.15, '#5a3a24', '#a8703e', 0.35);
      c.restore();
      blowingSand(c, t * 1.4, 1000, 0.45 * (1 - calm), 7); blowingSand(c, t, 1250, 0.35, 8);
      dust(c, t, 140, 71, [-100, 600, W + 200, 1200], '#d8a070', 0.45 * (1 - calm), 60);
      c.setTransform(1, 0, 0, 1, 0, 0);
      // counters: 7 nights, 8 days (below the subtitles)
      const ca = seg(t, t7 - 0.4, t7 + 0.2);
      if (ca > 0) { c.save(); c.globalAlpha = ca;
        for (let i = 0; i < 7; i++) iconMoon(c, W / 2 + (i - 3) * 112, 1690, 30, clamp(cnt * 7 - i));
        for (let i = 0; i < 8; i++) iconSun(c, W / 2 + (i - 3.5) * 112, 1800, 30, clamp(cnt * 8 - i)); c.restore(); }
      arabicCaption(c, 'سَبْعَ لَيَالٍ وَثَمَانِيَةَ أَيَّامٍ حُسُومًا', t, 0.3, d + 1, 280, 84, '#ffd8a8');
    },
  },

  // 11. Allah saves Hud and the believers: they walk out in a calm light while the storm stays behind them
  saved: {
    grade: 'rgba(255,200,140,0.24)',
    draw(c, t, d) {
      const go = ease(seg(t, 0, d + 0.8));
      cam(c, 1.0 + 0.05 * t / d, W / 2, 1100);
      sky(c, [[0, '#2a3a5a'], [0.35, '#c89a9a'], [0.55, '#f4c8a0']]);
      stormWall(c, t, 0.35, 1100, { seed: 3, dark: '#3a2418', mid: '#6a4430', rim: '#c08060', height: 900 });
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const g0 = c.createLinearGradient(0, 0, W, 0); g0.addColorStop(0, 'rgba(0,0,0,0)'); g0.addColorStop(0.55, 'rgba(244,200,160,0)'); g0.addColorStop(1, 'rgba(244,200,160,0.55)'); c.fillStyle = g0; c.fillRect(0, 0, W, H); c.restore();
      sun(c, 880, 960, 55, '#ffe8c0', 0.95);
      c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 880, 960, Math.PI, 2.6, 1400, 14, '#ffe8c0', 0.08, t, 17); c.restore();
      ridge(c, 1080, 50, 0.003, 41, '#a07a7a'); haze(c, 1110, 160, '#f4c8a8', 0.5);
      rock(c, 90, 1190, 520, 700, '#6a4434', 43, { lightX: 1 }); rock(c, 1040, 1190, 420, 520, '#7a5040', 45, { lightX: -1 });
      fgRidge(c, 1180, 20, 0.003, 47, '#c09270');
      c.fillStyle = 'rgba(255,235,200,0.22)'; c.beginPath(); c.moveTo(160, H + 100); c.quadraticCurveTo(520, 1420, 900, 1176); c.lineTo(940, 1178); c.quadraticCurveTo(620, 1460, 420, H + 100); c.fill();
      const path = q => [lerp(200, 880, q), lerp(1700, 1180, q) - Math.sin(q * Math.PI) * 50];
      const stepsAt = q => { let acc = 0, [px, py] = path(0); for (let k = 1; k <= 30; k++) { const qq = q * k / 30, [nx, ny] = path(qq); acc += Math.hypot(nx - px, (ny - py) * 2.2) / (0.293 * lerp(420, 120, qq)); px = nx; py = ny; } return acc; };
      for (let i = 6; i >= 0; i--) {
        const q = clamp(go * 0.9 + 0.05 - i * 0.075); if (q <= 0) continue;
        const [x, y] = path(q), h = lerp(420, 120, q);
        const who = i === 0 ? HUD : Object.assign({}, FOLK[i], { lantern: i % 2 === 1 });
        fig(c, who, { x, y, h, dir: 1, walk: stepsAt(q) + i * 0.37, light: 0.9, t, alpha: 1 - seg(q, 0.9, 1), wind: 0.4, child: i === 4 });
      }
      blurred(c, 6, () => { fgStones(c, 990, 1990, 1.3, '#4a2c1c', 8); shrub(c, 60, 1920, 3, '#2a1c12', t, 6); });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'نَجَّيْنَا هُودًا وَالَّذِينَ آمَنُوا مَعَهُ', t, 0.3, d + 1, 280, 84);
    },
  },

  // 12. The morning after: nothing to be seen but their dwellings — "Such were the 'Ad"
  lesson: {
    grade: 'rgba(255,180,110,0.2)',
    draw(c, t, d) {
      const p = t / d, tT = at('lesson', 'Tels', 0, d * 0.5);
      cam(c, 1.0 + 0.1 * ease(p), W / 2, 1150, 0, -20 * ease(p));
      sky(c, [[0, '#5a7aa4'], [0.38, '#e8c0a0'], [0.56, '#f8dcb0']]);
      sun(c, 260, 860, 60, '#fff2d0', 0.9); wisps(c, t, 380, 6, '#ffffff', 0.2, 9, 3);
      ridge(c, 1020, 60, 0.003, 49, '#d8aa84'); haze(c, 1040, 200, '#f6d8b0', 0.5);
      // pillar stumps and tower tops emerging from the sand
      fgRidge(c, 1200, 60, 0.0025, 51, '#d8a46c', { rim: 'rgba(255,240,210,0.6)' });
      [[200, 1150, 50, 260, 0.45], [330, 1165, 56, 380, 0.25], [470, 1170, 60, 320, 0.5], [640, 1160, 62, 420, 0.2], [790, 1150, 54, 300, 0.4], [930, 1160, 50, 240, 0.55]].forEach(([x, y, w, h, b], i) =>
        { column(c, x, y + 90, w, h, '#c4905e', { broken: b, seed: i + 11 }); c.fillStyle = '#dcaa72'; c.beginPath(); c.ellipse(x - w * 0.2, y + 70, w * 1.6, 38, 0, Math.PI, 0); c.fill(); });
      tower(c, 560, 1215, 180, 300, '#b88456', { tiers: 2 }); c.fillStyle = '#dcaa72'; c.beginPath(); c.ellipse(540, 1200, 190, 50, 0, Math.PI, 0); c.fill();
      fgRidge(c, 1240, 40, 0.003, 53, '#dcaa72', { light: 0.8 });
      fgRidge(c, 1560, 120, 0.0019, 55, '#d49a62', { rim: 'rgba(255,236,200,0.6)', shade: 0.3 });
      stoneDrum(c, 330, 1720, 340, 130, '#c08a58', '#d49a62');
      bird(c, 300 + t * 40, 640 - t * 6, 0.9, t, 1, '#4a3a3a');
      blowingSand(c, t, 1500, 0.12, 7);
      dust(c, t, 30, 91, [0, 900, W, 800], '#fff0d8', 0.25, 6);
      blurred(c, 8, () => { shrub(c, 980, 1960, 3.4, '#3a2416', t, 9); fgStones(c, 70, 2000, 1.2, '#6a4028', 9); });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'فَأَصْبَحُوا لَا يُرَىٰ إِلَّا مَسَاكِنُهُمْ', t, 0.3, tT - 0.3, 280, 86);
      arabicCaption(c, 'وَتِلْكَ عَادٌ جَحَدُوا بِآيَاتِ رَبِّهِمْ', t, tT, d + 1, 280, 86);
    },
  },

  outro: {
    grade: null,
    draw(c, t, d) {
      sky(c, [[0, '#05060f'], [0.6, '#0d1024'], [1, '#1a1426']]);
      milkyWay(c, t, 0.5); stars(c, t + 50, 140, 81, [0, 0, W, H], 0.7);
      c.globalAlpha = 0.4; ridge(c, 1800, 120, 0.002, 61, '#1a1418'); c.globalAlpha = 1;
      const a = seg(t, 0.2, 1.2);
      c.save(); c.direction = 'rtl';
      textGlow(c, 'وَإِلَىٰ عَادٍ', W / 2, 770, '700 100px Amiri', '#f6c453', a, '#ffb300', 30);
      textGlow(c, 'أَخَاهُمْ هُودًا', W / 2, 900, '700 100px Amiri', '#f6c453', a, '#ffb300', 30);
      c.restore();
      const b = seg(t, 0.8, 1.8);
      textGlow(c, '« Et aux \'Ad, leur frère Hud. »', W / 2, 1040, 'italic 500 38px Lora', '#f3e7d0', b, '#000', 10);
      textGlow(c, '— Hud, 50', W / 2, 1100, 'italic 500 38px Lora', '#f3e7d0', b, '#000', 10);
      textGlow(c, 'LES PROPHÈTES  ·  À SUIVRE', W / 2, 1330, '600 34px Lora', '#c9b48a', seg(t, 1.6, 2.4), '#000', 8);
      c.fillStyle = 'rgba(0,0,0,' + seg(t, d - 0.8, d) + ')'; c.fillRect(0, 0, W, H);
    },
  },
};
