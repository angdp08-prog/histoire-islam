// Episode 8 — Soulayman (Salomon, alayhi salam): the ant that warned its people, the hoopoe, the Queen of Saba,
// the throne brought before a blink, and the gratitude of a prophet-king (An-Naml 15-44; Saba 12; Sad 35; Al-Anbiya 81).
// Visual rules: the prophet is shown only as a silhouette in white, face entirely hidden by a veil of white light
// (prophet: true); everyone else is faceless. Allah is never depicted: only light and calligraphy. The jinn are named
// in the narration but never drawn. Events are synced to the narration with at(scene, word).
// The last frame (outro) is the first frame (hook): the video loops.
window.NO_INTRO_FADE = true; // the hook image is there from the very first frame

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

// ---------- shared landscape helpers (from episodes 4-7)
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
const FOLK = [
  { robe: '#6a4a32', wrap: '#e2d4b8', skin: '#9a6a4c' }, { robe: '#3a4a62', wrap: '#e6dfcf', skin: '#b07a58' },
  { robe: '#7a5236', wrap: '#d6c29c', skin: '#8f5f42', trim: '#c9a35a' }, { robe: '#4a3a30', wrap: '#ece4d4', skin: '#a8714f', covered: true },
  { robe: '#2e4a52', wrap: '#d8ccb2', skin: '#94664a' }, { robe: '#8a5a3a', wrap: '#efe6d4', skin: '#b4805c' },
  { robe: '#5a3a4e', wrap: '#e0d2bc', skin: '#c48e66', trim: '#b89a62', covered: true }, { robe: '#3e5440', wrap: '#ddd2bc', skin: '#b07a58' },
  { robe: '#6e3a28', wrap: '#e8dcc4', skin: '#9a6a4c' },
];
const SOLDIER = { robe: '#4a3020', wrap: '#2a3a5a', skin: '#8f5f42', trim: '#c9a35a', band: '#c9a35a', inner: '#e8e0cc' };
const GOLD = '#e0b85a', SAND = '#d39a5e';
// world position of a figure's head (figure(): translate, scale h/300 (x0.82 for a child), head at -268 standing)
function headOf(o) { const s = (o.h || 300) / 300 * (o.child ? 0.82 : 1), hy = { stand: -268, sit: -192, kneel: -205 }[o.pose || 'stand']; return [o.x, o.y + hy * s, 21 * s]; }
function handOf(o) { // world position of the near hand for armUp / reach (same maths as figureRaw)
  const s = (o.h || 300) / 300, d = o.dir || 1; let hp;
  if (o.armUp > 0) hp = [lerp(48, 82, o.armUp), lerp(-112, -300, o.armUp)]; else if (o.reach > 0) hp = [lerp(48, 100, o.reach), lerp(-112, -180, o.reach)]; else hp = [48, -114];
  return [o.x + d * hp[0] * s, o.y + (hp[1] + 4) * s];
}
function spearOf(c, o, k = 0) { // a soldier's spear and round shield
  const s = (o.h || 300) / 300, d = o.dir || 1, sx = o.x + d * 56 * s, sy = o.y;
  c.strokeStyle = '#3a2614'; c.lineWidth = 5 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx - d * 4 * s, sy - 10 * s); c.lineTo(sx + d * 10 * s, sy - 400 * s); c.stroke();
  c.fillStyle = '#c8c0b0'; c.beginPath(); c.moveTo(sx + d * 10 * s, sy - 440 * s); c.lineTo(sx + d * 17 * s, sy - 398 * s); c.lineTo(sx + d * 3 * s, sy - 398 * s); c.closePath(); c.fill();
  const shx = o.x - d * 30 * s, shy = o.y - 150 * s;
  const g = c.createRadialGradient(shx - 8 * s, shy - 10 * s, 0, shx, shy, 48 * s); g.addColorStop(0, '#b08a4a'); g.addColorStop(1, '#5a3a1a');
  c.fillStyle = g; c.beginPath(); c.ellipse(shx, shy, 30 * s, 50 * s, 0, 0, 6.283); c.fill();
  c.strokeStyle = '#d4b26a'; c.lineWidth = 3 * s; c.stroke();
}
function soldier(c, o) { fig(c, SOLDIER, Object.assign({ hood: true }, o)); spearOf(c, o); }

function water(c, t, y0, y1, o = {}) { // river / sea band seen from the bank: gradient, shimmering ripples, glints toward sunX
  const top = o.top || '#5a8aa0', bot = o.bot || '#1a3a4a', sunX = o.sunX, seed = o.seed || 1, flow = o.flow || 20;
  const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, top); g.addColorStop(1, bot);
  c.fillStyle = g; c.fillRect(-300, y0, W + 600, y1 - y0);
  const r = rng(seed);
  for (let i = 0; i < (o.n || 70); i++) {
    const q = r(), y = y0 + Math.pow(q, 1.6) * (y1 - y0), l = 30 + Math.pow(q, 1.6) * 200 * r(), x = ((r() * (W + 600) + t * flow * (0.4 + q)) % (W + 600)) - 300;
    const sh = 0.5 + 0.5 * Math.sin(t * (1 + r() * 2) + i);
    c.strokeStyle = `rgba(230,245,255,${(0.08 + 0.22 * q) * sh * (o.a || 1)})`; c.lineWidth = 1 + q * 3;
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + l / 2, y - 2 - q * 3, x + l, y); c.stroke();
  }
  if (sunX !== undefined) { c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 60; i++) { const q = r(), y = y0 + Math.pow(q, 1.4) * (y1 - y0), sp = 20 + q * 160, x = sunX + (r() - 0.5) * sp * 2, l = 10 + q * 40;
      c.fillStyle = `rgba(255,236,190,${0.5 * (0.4 + 0.6 * Math.sin(t * 3 + i * 1.7) ** 2) * (1 - q * 0.5)})`; c.fillRect(x, y, l, 2 + q * 2); }
    c.restore(); }
}
function horse(c, x, y, s, t, dir = 1, col = '#3a2a20', gallop = 1) {
  c.save(); c.translate(x, y); c.scale(s * dir, s);
  const dk = mix(col, '#000000', 0.4), lt = mix(col, '#ffffff', 0.18), p = t * 9, bob = Math.sin(p * 2) * 4 * gallop;
  c.fillStyle = 'rgba(10,6,4,0.28)'; c.beginPath(); c.ellipse(0, 2, 120, 12, 0, 0, 6.283); c.fill();
  c.translate(0, bob);
  const leg = (hx, ph, far) => { const sw = Math.sin(p + ph) * gallop, lift = Math.max(0, Math.cos(p + ph)) * gallop;
    const knee = [hx + sw * 24, -54 - lift * 18], foot = [hx + sw * 40, -lift * 20]; const cl = far ? dk : col;
    limb(c, [hx, -104], [hx + sw * 10, -80], knee, 26, 12, cl); limb(c, knee, [(knee[0] + foot[0]) / 2 + 4, (knee[1] + foot[1]) / 2], foot, 10, 8, cl);
    c.fillStyle = '#140c08'; c.beginPath(); c.ellipse(foot[0] + 3, foot[1] - 3, 8, 5, 0, 0, 6.283); c.fill(); };
  leg(-50, 2.6, true); leg(52, 0.4, true);
  c.strokeStyle = dk; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(-84, -122); c.quadraticCurveTo(-124, -112 + Math.sin(p) * 10, -126, -64); c.stroke();
  const g = c.createLinearGradient(0, -150, 0, -80); g.addColorStop(0, lt); g.addColorStop(1, dk);
  c.fillStyle = g; c.beginPath(); c.ellipse(-4, -116, 88, 34, 0, 0, 6.283); c.fill();
  limb(c, [52, -128], [82, -162], [104, -198], 52, 28, col);
  c.save(); c.translate(112, -196); c.rotate(1.0); c.fillStyle = col; c.beginPath(); c.ellipse(0, 22, 15, 34, 0, 0, 6.283); c.fill(); c.restore();
  c.fillStyle = dk; c.beginPath(); c.moveTo(98, -214); c.lineTo(102, -234); c.lineTo(110, -212); c.fill();
  c.strokeStyle = dk; c.lineWidth = 6; for (let k = 0; k < 6; k++) { const q = k / 6; c.beginPath(); c.moveTo(lerp(56, 98, q), lerp(-140, -206, q)); c.lineTo(lerp(44, 86, q) + Math.sin(p + k) * 4, lerp(-128, -196, q) + 8); c.stroke(); }
  c.fillStyle = '#c8a050'; c.fillRect(-40, -150, 70, 6); // harness strap
  leg(-40, 0.9, false); leg(62, 3.4, false);
  c.restore();
}
function dustCloud(c, t, x0, x1, y, h, col, a, seed = 3) { // rolling dust raised by an army
  const r = rng(seed);
  for (let i = 0; i < 26; i++) { const x = lerp(x0, x1, r()) + Math.sin(t * 0.5 + i) * 30, yy = y - r() * h * 0.6, rr = h * (0.3 + r() * 0.5);
    const g = c.createRadialGradient(x, yy, 0, x, yy, rr); g.addColorStop(0, hexA(col, a * (0.5 + 0.5 * r()))); g.addColorStop(1, hexA(col, 0));
    c.fillStyle = g; c.fillRect(x - rr, yy - rr, rr * 2, rr * 2); }
}
function spearLine(c, t, x0, x1, y, h, n, col, seed = 2) { // far army in silhouette: heads, spears, banners
  const r = rng(seed);
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, i / n) + r() * 10, yy = y + Math.sin(i * 1.7) * 3, bob = Math.sin(t * 6 + i) * 1.5;
    c.fillStyle = col; c.beginPath(); c.ellipse(x, yy - h * 0.82 + bob, h * 0.09, h * 0.11, 0, 0, 6.283); c.fill(); c.fillRect(x - h * 0.12, yy - h * 0.72 + bob, h * 0.24, h * 0.72);
    c.strokeStyle = col; c.lineWidth = Math.max(1, h * 0.03); c.beginPath(); c.moveTo(x + h * 0.15, yy + bob); c.lineTo(x + h * 0.2, yy - h * 1.6 + bob); c.stroke();
    if (i % 9 === 4) { c.fillStyle = hexA('#8a2a22', 0.9); c.beginPath(); c.moveTo(x + h * 0.2, yy - h * 1.9); for (let q = 0; q <= 6; q++) c.lineTo(x + h * 0.2 + q * h * 0.08, yy - h * 1.9 + Math.sin(t * 5 + q + i) * h * 0.04); c.lineTo(x + h * 0.2 + h * 0.48, yy - h * 1.6); c.lineTo(x + h * 0.2, yy - h * 1.6); c.fill();
      c.lineWidth = Math.max(1, h * 0.035); c.beginPath(); c.moveTo(x + h * 0.2, yy); c.lineTo(x + h * 0.2, yy - h * 1.95); c.stroke(); }
  }
}
function crowdRow(c, t, x0, x1, y, h, n, seed, o = {}) { const r = rng(seed);
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, (i + 0.5) / n) + (r() - 0.5) * 30, yy = y + (r() - 0.5) * (o.jit || 20), who = FOLK[(i + seed) % FOLK.length];
    fig(c, who, Object.assign({ x, y: yy, h: h * (0.92 + r() * 0.16), dir: o.dir || (r() > 0.5 ? 1 : -1), light: o.light || 0.7, t: t + i, wind: o.wind || 0.3, child: i % 6 === 4, ink: o.ink }, o.f ? o.f(i, x) : {})); } }
function overlayBox(c, x, y, w, h, a) { c.save(); c.globalAlpha = a; c.fillStyle = 'rgba(8,10,20,0.55)'; c.beginPath(); c.roundRect(x, y, w, h, 28); c.fill(); c.strokeStyle = 'rgba(246,196,83,0.7)'; c.lineWidth = 3; c.stroke(); c.restore(); }
function ctaText(c, a) {
  if (a <= 0) return;
  overlayBox(c, 90, 330, 900, 360, a);
  textGlow(c, 'Quel prophète veux-tu', W / 2, 420, '700 66px Lora', '#fff6e0', a, '#000', 12);
  textGlow(c, 'pour le prochain épisode ?', W / 2, 505, '700 66px Lora', '#fff6e0', a, '#000', 12);
  textGlow(c, 'Dis-le en commentaire', W / 2, 610, 'italic 500 54px Lora', '#f6c453', a, '#000', 12);
}

// ---------- episode 8: characters
const SUL = { veilGlow: 0.6, prophet: true, robe: '#ede8db', wrap: '#f7f3ea', skin: '#c99872', trim: '#d8b45a', band: '#c9a040', inner: '#fbf8f0' };
const QUEEN = { robe: '#5a1e3a', wrap: '#eadfc6', skin: '#b4805c', trim: '#e0b85a', band: '#e0b85a', covered: true, inner: '#f2e8d4' };
const SAGE = { robe: '#22324a', wrap: '#ddd2bc', skin: '#9a6a4c', trim: '#b8a070', band: '#8a7040' };
const COURT = [{ robe: '#6a2a22', wrap: '#e8dcc4', skin: '#a8714f', trim: '#c9a35a' }, { robe: '#2a4a3e', wrap: '#e2d6be', skin: '#94664a', trim: '#c9a35a' },
  { robe: '#4a3a6a', wrap: '#ece4d4', skin: '#b07a58', trim: '#d0b070' }, { robe: '#7a5236', wrap: '#d6c29c', skin: '#8f5f42', trim: '#c9a35a' }];
const SABA = [{ robe: '#7a3a22', wrap: '#e6d6b6', skin: '#8f5f42' }, { robe: '#3a2e4a', wrap: '#e2d2b4', skin: '#9a6a4c', covered: true }, { robe: '#5a4a2a', wrap: '#ece0c8', skin: '#a8714f' }];
const ANT = '#3a1810';

// ---------- blur a whole layer at once (depth of field), drawn with the current camera transform
const _blurPool = [];
function blurLayer(c, px, fn, i = 0) {
  if (px < 0.3) { c.save(); fn(c); c.restore(); return; }
  const b = _blurPool[i] || (_blurPool[i] = Object.assign(document.createElement('canvas'), { width: W, height: H }));
  const bc = b.getContext('2d'); bc.setTransform(1, 0, 0, 1, 0, 0); bc.globalAlpha = 1; bc.filter = 'none'; bc.globalCompositeOperation = 'source-over';
  bc.clearRect(0, 0, W, H); bc.setTransform(c.getTransform()); bc.save(); fn(bc); bc.restore();
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.filter = `blur(${px}px)`; c.drawImage(b, 0, 0); c.restore();
}

// ---------- the ant: glossy three-part body, elbowed antennae, six jointed legs (tripod gait), can rear up to call out
function ant(c, x, y, s, t, o = {}) {
  const dir = o.dir || 1, col = o.col || ANT, rear = o.rear || 0, alert = o.alert === undefined ? rear : o.alert;
  const dk = mix(col, '#000000', 0.55), lt = mix(col, '#ff9a50', 0.45), legC = mix(col, '#000000', 0.25);
  c.save(); c.translate(x, y); c.scale(s * dir, s);
  if (o.shadow !== false) { c.fillStyle = 'rgba(30,14,4,0.32)'; c.beginPath(); c.ellipse(-6, 2, 128 - rear * 30, 9, 0, 0, 6.283); c.fill(); }
  const walking = o.walk !== undefined && o.walk !== null, ph = walking ? o.walk * 6.283 : 0;
  const er = ease(clamp(rear)), ang = -0.72 * er, ang0 = ang, lift = -16 * er, P = [-24, -46], ca = Math.cos(ang), sa = Math.sin(ang);
  const T = p => p[0] < -26 ? Tg(p) : [P[0] + (p[0] - P[0]) * ca - (p[1] - P[1]) * sa, P[1] + lift + (p[0] - P[0]) * sa + (p[1] - P[1]) * ca];
  const ga = 0.12 * er, cg = Math.cos(ga), sg = Math.sin(ga), Tg = p => [P[0] + (p[0] - P[0]) * cg - (p[1] - P[1]) * sg, P[1] + lift * 0.6 + (p[0] - P[0]) * sg + (p[1] - P[1]) * cg];
  const legs = [[38, -46, 52, 0], [16, -42, 6, 1], [-4, -42, -56, 2]];
  const drawLeg = (L, far) => {
    const [ax, ay, fx, k] = L, a = T([ax, ay]);
    const p = ph + (k % 2 ? Math.PI : 0) + (far ? Math.PI : 0), sw = walking ? Math.sin(p) : 0, lift = walking ? Math.max(0, Math.cos(p)) : 0;
    let foot = [ax + fx + sw * 20 + (far ? -6 : 0), -lift * 10 - (far ? 3 : 0)];
    if (k === 0 && rear > 0) { const w = Math.sin(t * 9 + (far ? 1.5 : 0)) * 14 * alert, up = T([ax + 46, ay + 4]); foot = [lerp(foot[0], up[0] + 10, rear), lerp(foot[1], up[1] - 18 + w, rear)]; }
    const mid = [(a[0] + foot[0]) / 2, (a[1] + foot[1]) / 2], knee = [mid[0] + (k === 2 ? -10 : 10), Math.min(a[1], foot[1]) - 30 - lift * 6];
    const cl = far ? dk : legC;
    limb(c, a, [lerp(a[0], knee[0], 0.5), knee[1] - 4], knee, 11, 7, cl, 6);
    limb(c, knee, [lerp(knee[0], foot[0], 0.5), lerp(knee[1], foot[1], 0.4)], foot, 7, 3.5, cl, 6);
    c.fillStyle = cl; c.beginPath(); c.ellipse(knee[0], knee[1], 5, 5, 0, 0, 6.283); c.fill();
    c.strokeStyle = cl; c.lineWidth = 2.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(foot[0], foot[1]); c.lineTo(foot[0] + (k === 2 ? -10 : 10), foot[1] + 1); c.stroke();
  };
  legs.forEach(L => drawLeg(L, true));
  const blob = (cx, cy, rx, ry, rot, hi = 1) => { const p = T([cx, cy]), ang = cx < -26 ? ga : ang0;
    const g = c.createRadialGradient(p[0] + rx * 0.25, p[1] - ry * 0.45, 0, p[0], p[1], Math.max(rx, ry) * 1.15);
    g.addColorStop(0, mix(lt, '#ffffff', 0.12 * hi)); g.addColorStop(0.35, col); g.addColorStop(1, dk);
    c.fillStyle = g; c.beginPath(); c.ellipse(p[0], p[1], rx, ry, rot + ang, 0, 6.283); c.fill();
    c.fillStyle = `rgba(255,236,210,${0.32 * hi})`; c.beginPath(); c.ellipse(p[0] + rx * 0.15, p[1] - ry * 0.55, rx * 0.42, ry * 0.18, rot + ang - 0.2, 0, 6.283); c.fill(); return p; };
  // gaster (abdomen) with segment bands and fine hairs
  const g0 = blob(-80, -48, 52, 35, 0.22);
  c.save(); c.translate(g0[0], g0[1]); c.rotate(0.22 + ga); c.strokeStyle = hexA(dk, 0.55); c.lineWidth = 2.5;
  for (let k = -2; k <= 2; k++) { c.beginPath(); c.ellipse(k * 15 + 6, 0, 8, 33 - Math.abs(k) * 4, 0, -1.4, 1.4); c.stroke(); }
  c.strokeStyle = hexA(lt, 0.5); c.lineWidth = 1.2; for (let k = 0; k < 9; k++) { const a0 = 0.6 + k * 0.28; c.beginPath(); c.moveTo(Math.cos(a0) * 50, Math.sin(a0) * 33); c.lineTo(Math.cos(a0) * 58, Math.sin(a0) * 39); c.stroke(); }
  c.restore();
  blob(-30, -48, 10, 10, 0, 0.7); blob(-18, -52, 8, 9, 0, 0.7); // petiole nodes
  blob(12, -50, 32, 15, -0.15); blob(36, -57, 17, 14, -0.3); // thorax
  // head, mandibles, eye
  const hd = blob(70, -62, 27, 22, 0.35);
  c.save(); c.translate(hd[0], hd[1]); c.rotate(0.35 + ang);
  c.fillStyle = dk; const open = 0.15 + 0.25 * alert * (0.5 + 0.5 * Math.sin(t * 14));
  c.beginPath(); c.moveTo(20, 8); c.quadraticCurveTo(40, 12 - 8 * open, 36, 24); c.lineTo(28, 16); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(18, 12); c.quadraticCurveTo(34, 26 + 8 * open, 24, 30); c.lineTo(20, 20); c.closePath(); c.fill();
  c.fillStyle = '#0c0604'; c.beginPath(); c.ellipse(4, -6, 7, 9, 0.2, 0, 6.283); c.fill();
  c.fillStyle = 'rgba(255,240,220,0.7)'; c.beginPath(); c.arc(6, -9, 2.2, 0, 6.283); c.fill();
  c.restore();
  // elbowed antennae (scape + segmented funiculus), quivering when alert
  [0, 1].forEach(k => { const b = T([78 - k * 6, -80]), wq = Math.sin(t * (4 + alert * 8) + k * 2) * (4 + alert * 10);
    const el = T([96 - k * 10, -122 - k * 4]), tip = T([142 - k * 16 + wq * 0.5, -112 - k * 10 + wq - alert * 30]);
    c.strokeStyle = k ? dk : legC; c.lineCap = 'round'; c.lineWidth = 5; c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(el[0], el[1]); c.stroke();
    c.lineWidth = 4; c.beginPath(); c.moveTo(el[0], el[1]); c.quadraticCurveTo(lerp(el[0], tip[0], 0.5), lerp(el[1], tip[1], 0.5) - 8, tip[0], tip[1]); c.stroke();
    c.fillStyle = k ? dk : legC; c.beginPath(); c.ellipse(tip[0], tip[1], 5, 4, 0, 0, 6.283); c.fill(); });
  legs.forEach(L => drawLeg(L, false));
  c.restore();
}
function antHill(c, x, y, s, seed = 1) { // a heap of sand grains around a dark entrance
  c.save(); c.translate(x, y); c.scale(s, s);
  const g = c.createLinearGradient(0, -120, 0, 10); g.addColorStop(0, '#e8bc80'); g.addColorStop(1, '#a8743e');
  c.fillStyle = g; c.beginPath(); c.moveTo(-230, 6); c.bezierCurveTo(-150, -40, -90, -110, 0, -112); c.bezierCurveTo(90, -110, 150, -40, 230, 6); c.closePath(); c.fill();
  const r = rng(seed); for (let i = 0; i < 260; i++) { const a = r(), xx = (a - 0.5) * 440, top = -112 * Math.pow(Math.sin(a * Math.PI), 0.8), yy = top + r() * (6 - top);
    c.fillStyle = hexA(r() > 0.5 ? '#f6d6a0' : '#7a4e28', 0.55); c.beginPath(); c.ellipse(xx, yy, 2.5 + r() * 4, 2 + r() * 3, r() * 3, 0, 6.283); c.fill(); }
  c.fillStyle = '#1a0c06'; c.beginPath(); c.ellipse(4, -104, 38, 15, 0, 0, 6.283); c.fill();
  c.fillStyle = 'rgba(255,220,170,0.35)'; c.beginPath(); c.ellipse(4, -112, 40, 6, 0, Math.PI, 0); c.fill();
  c.restore();
}
function grains(c, y0, y1, n, seed, col = '#8a5a30', k = 1) { // sand grains / tiny pebbles, bigger toward the viewer
  const r = rng(seed);
  for (let i = 0; i < n; i++) { const q = r(), y = lerp(y0, y1, q * q), sz = (1.5 + q * q * 14 * r()) * k, x = r() * (W + 400) - 200;
    c.fillStyle = hexA(r() > 0.35 ? col : '#f8dcaa', 0.5 + 0.3 * r()); c.beginPath(); c.ellipse(x, y, sz * 1.3, sz, r() * 3, 0, 6.283); c.fill(); }
}
function soundRings(c, x, y, t, t0, a = 1, n = 4) { // the ant's call: rings spreading from its head
  for (let k = 0; k < n; k++) { const ph = (t - t0) * 0.9 - k * 0.25; if (ph <= 0 || ph >= 1) continue;
    c.strokeStyle = `rgba(255,236,190,${0.55 * a * (1 - ph)})`; c.lineWidth = 5 * (1 - ph) + 1; c.beginPath(); c.arc(x, y, 40 + ph * 420, -2.4, -0.2); c.stroke(); }
}

// ---------- the hoopoe: cinnamon body, black-and-white barred wings and tail, long curved bill, fan crest
function hoopoe(c, x, y, s, t, o = {}) { // perched: (x, y) = feet; fly: (x, y) = body
  const dir = o.dir || 1, crest = o.crest === undefined ? 0.25 : o.crest, fly = !!o.fly;
  const body = '#d4844a', lt = '#f2b47a', dk = '#8a4a24';
  c.save(); c.translate(x, y); c.scale(s * dir, s);
  const bars = (fn, len) => { c.save(); fn(); c.clip(); c.fillStyle = '#16100c'; c.fillRect(-200, -200, 400, 400); c.fillStyle = '#f4efe4';
    for (let k = 0; k < 5; k++) c.fillRect(-200, -len * 0.75 + k * len * 0.32, 400, len * 0.11); c.restore(); };
  const wingAt = (sx, sy, f, far) => { c.save(); c.translate(sx, sy); c.rotate(-0.25); c.scale(1, f);
    bars(() => { c.beginPath(); c.moveTo(-6, 0); c.bezierCurveTo(-46, -20, -56, -96, -16, -108); c.bezierCurveTo(16, -112, 30, -40, 14, 0); c.closePath(); }, 110);
    if (far) { c.fillStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.moveTo(-6, 0); c.bezierCurveTo(-46, -20, -56, -96, -16, -108); c.bezierCurveTo(16, -112, 30, -40, 14, 0); c.fill(); }
    c.restore(); };
  let hx, hy, bodyRot;
  if (fly) {
    const f = Math.sin(t * 13 + (o.k || 0));
    wingAt(-4, -6, f, true);
    bars(() => { c.beginPath(); c.moveTo(-30, 2); c.lineTo(-92, -6); c.lineTo(-96, 14); c.lineTo(-30, 12); c.closePath(); }, 30); // tail
    const g = c.createLinearGradient(0, -26, 0, 22); g.addColorStop(0, lt); g.addColorStop(1, dk); c.fillStyle = g;
    c.beginPath(); c.ellipse(0, 4, 44, 20, -0.06, 0, 6.283); c.fill();
    hx = 46; hy = -8; bodyRot = 0;
    wingAt(4, -2, f * 0.95, false);
  } else {
    c.strokeStyle = '#4a3a30'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(-6, -16); c.lineTo(-10, 0); c.moveTo(4, -16); c.lineTo(6, 0); c.stroke();
    bars(() => { c.save(); c.translate(-40, -30); c.rotate(0.45); c.beginPath(); c.roundRect(-70, -12, 74, 24, 10); c.restore(); }, 40); // tail
    const g = c.createLinearGradient(0, -66, 0, -14); g.addColorStop(0, lt); g.addColorStop(1, dk); c.fillStyle = g;
    c.beginPath(); c.ellipse(-4, -40, 42, 25, -0.38, 0, 6.283); c.fill();
    bars(() => { c.beginPath(); c.ellipse(-16, -38, 34, 16, -0.3, 0, 6.283); }, 30); // folded barred wing
    hx = 32; hy = -68; bodyRot = -0.38;
  }
  // crest: a fan of cinnamon feathers with black tips, opens when alert
  const n = 7; for (let k = 0; k < n; k++) {
    const q = k / (n - 1), a = lerp(lerp(-2.9, -2.55, q), lerp(-2.7, -0.85, q), crest) + Math.sin(t * 3 + k) * 0.03 * crest, len = 38 + Math.sin(q * Math.PI) * 14;
    const b = [hx - 6 + q * 10, hy - 10], tip = [b[0] + Math.cos(a) * len, b[1] + Math.sin(a) * len];
    limb(c, b, [lerp(b[0], tip[0], 0.5), lerp(b[1], tip[1], 0.5) - 2], tip, 11, 7, k % 2 ? body : lt, 5);
    c.fillStyle = '#16100c'; c.beginPath(); c.ellipse(tip[0], tip[1], 5, 4, a, 0, 6.283); c.fill();
    c.fillStyle = '#f4efe4'; c.beginPath(); c.ellipse(lerp(b[0], tip[0], 0.78), lerp(b[1], tip[1], 0.78), 3.5, 2.5, a, 0, 6.283); c.fill(); }
  // head + long down-curved bill
  c.fillStyle = body; c.beginPath(); c.arc(hx, hy, 16, 0, 6.283); c.fill();
  c.fillStyle = hexA(lt, 0.6); c.beginPath(); c.arc(hx + 3, hy - 5, 8, 0, 6.283); c.fill();
  limb(c, [hx + 12, hy + 2], [hx + 44, hy - 2], [hx + 66, hy + 16], 7, 2.2, '#2a2420', 8);
  c.fillStyle = '#100a08'; c.beginPath(); c.arc(hx + 5, hy - 2, 2.6, 0, 6.283); c.fill();
  if (o.letter) { c.save(); c.translate(hx + 60, hy + 22); c.rotate(0.15); c.fillStyle = '#efe0bc'; c.beginPath(); c.roundRect(-30, -8, 60, 16, 7); c.fill();
    c.fillStyle = '#9a1a1a'; c.beginPath(); c.arc(0, 0, 7, 0, 6.283); c.fill(); c.restore(); }
  c.restore();
}
// small perched birds of different kinds (Sulayman's review of the birds)
function perchBird(c, x, y, s, t, k, sp) {
  c.save(); c.translate(x, y); c.scale(s * (sp.dir || 1), s);
  const bob = Math.sin(t * 2 + k) * 2, look = Math.sin(t * 0.9 + k * 2.3) > 0.6 ? 0.15 : 0;
  c.strokeStyle = '#3a2a20'; c.lineWidth = 3; c.beginPath(); c.moveTo(-4, -12); c.lineTo(-6, 0); c.moveTo(4, -12); c.lineTo(5, 0); c.stroke();
  c.translate(0, bob);
  const L = sp.size || 1;
  c.fillStyle = sp.tail || sp.wing; c.save(); c.translate(-28 * L, -26 * L); c.rotate(0.6); c.beginPath(); c.roundRect(-36 * L, -7 * L, 40 * L, 14 * L, 6); c.fill(); c.restore();
  const g = c.createLinearGradient(0, -60 * L, 0, -10); g.addColorStop(0, mix(sp.body, '#ffffff', 0.2)); g.addColorStop(1, mix(sp.body, '#000000', 0.25));
  c.fillStyle = g; c.beginPath(); c.ellipse(0, -34 * L, 30 * L, 22 * L, -0.4, 0, 6.283); c.fill();
  c.fillStyle = sp.wing; c.beginPath(); c.ellipse(-8 * L, -34 * L, 24 * L, 13 * L, -0.35, 0, 6.283); c.fill();
  c.strokeStyle = hexA(mix(sp.wing, '#000000', 0.4), 0.6); c.lineWidth = 2; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-20 * L + i * 8 * L, -30 * L); c.lineTo(-34 * L + i * 8 * L, -24 * L); c.stroke(); }
  c.save(); c.translate(22 * L, -54 * L); c.rotate(look);
  c.fillStyle = sp.head || sp.body; c.beginPath(); c.arc(0, 0, 14 * L, 0, 6.283); c.fill();
  c.fillStyle = sp.beak || '#d8a040'; c.beginPath();
  if (sp.hook) { c.moveTo(10 * L, -4 * L); c.quadraticCurveTo(26 * L, -4 * L, 22 * L, 10 * L); c.lineTo(12 * L, 4 * L); }
  else { c.moveTo(11 * L, -4 * L); c.lineTo((24 + (sp.bill || 0)) * L, 1 * L); c.lineTo(11 * L, 5 * L); } c.closePath(); c.fill();
  c.fillStyle = '#0c0806'; c.beginPath(); c.arc(4 * L, -3 * L, 2.4 * L, 0, 6.283); c.fill();
  c.restore(); c.restore();
}
const BIRDS = [
  { body: '#d8d4cc', wing: '#a8a49c', head: '#c8c4bc', beak: '#c08a6a' }, // dove
  { body: '#a87a4a', wing: '#6a4a2a', head: '#8a5a3a', beak: '#3a2a20', size: 0.8 }, // sparrow
  { body: '#e8dcc0', wing: '#6a4a30', head: '#5a3a24', beak: '#e8b040', hook: true, size: 1.25 }, // falcon
  { body: '#e88a3a', wing: '#1e7aa8', head: '#1e6a98', beak: '#2a2020', bill: 14, size: 0.85 }, // kingfisher
  { body: '#f0e6d4', wing: '#2a2a2a', head: '#f6f0e4', beak: '#e0a030', size: 1.1 }, // stork-like
  { body: '#6a8a5a', wing: '#3a5a3a', head: '#e8c040', beak: '#c03a2a', size: 0.9 }, // bee-eater
  { body: '#3a3a40', wing: '#22222a', head: '#2a2a30', beak: '#f0c040', size: 0.95 }, // blackbird
];
function flock(c, t, cx, cy, n, s, seed, o = {}) { // V of birds, flapping, gliding as a group
  const r = rng(seed);
  for (let i = 0; i < n; i++) { const side = i % 2 ? 1 : -1, row = Math.ceil(i / 2), x = cx + side * row * 44 * s * (o.spread || 1) - (o.dir || 1) * row * 10 * s + Math.sin(t * 0.8 + i) * 6 * s, y = cy + row * 26 * s + Math.cos(t * 0.7 + i) * 5 * s;
    bird(c, x, y, s * (0.8 + r() * 0.4), t, i * 3.1, o.col || '#2a1e1a'); }
}

// ---------- the throne, the letter, the palace
function gem(c, x, y, r, col) { const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r); g.addColorStop(0, mix(col, '#ffffff', 0.6)); g.addColorStop(0.5, col); g.addColorStop(1, mix(col, '#000000', 0.5));
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); c.strokeStyle = '#7a5418'; c.lineWidth = 2; c.stroke(); }
function throne(c, x, y, s, t, o = {}) { // base at y; about 560*s tall
  c.save(); c.translate(x, y); c.scale(s, s);
  const shine = o.shine || 0, gold = (x0, x1) => { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#8a5a1a'); g.addColorStop(0.3, '#f0c860'); g.addColorStop(0.5, '#fff0b0'); g.addColorStop(0.7, '#e0a840'); g.addColorStop(1, '#7a4a14'); return g; };
  if (o.glow) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -280, 620, '#ffd890', 0.35 * o.glow); c.restore(); }
  c.fillStyle = 'rgba(10,6,4,0.35)'; c.beginPath(); c.ellipse(0, 4, 300, 22, 0, 0, 6.283); c.fill();
  for (let k = 0; k < 3; k++) { const w = 520 - k * 80, yy = -k * 34; c.fillStyle = gold(-w / 2, w / 2); c.fillRect(-w / 2, yy - 34, w, 34); c.fillStyle = 'rgba(80,40,10,0.35)'; c.fillRect(-w / 2, yy - 6, w, 6);
    for (let i = 0; i < 7 - k; i++) gem(c, -w / 2 + (i + 0.5) * w / (7 - k), yy - 18, 6, ['#c0283a', '#1e8a5a', '#2a5ab0'][(i + k) % 3]); }
  const by = -102;
  // tall back with a pointed arch
  c.fillStyle = gold(-150, 150); c.beginPath(); c.moveTo(-150, by); c.lineTo(-150, by - 330); c.quadraticCurveTo(-150, by - 430, 0, by - 470); c.quadraticCurveTo(150, by - 430, 150, by - 330); c.lineTo(150, by); c.closePath(); c.fill();
  c.save(); c.beginPath(); c.moveTo(-112, by - 120); c.lineTo(-112, by - 320); c.quadraticCurveTo(-112, by - 392, 0, by - 424); c.quadraticCurveTo(112, by - 392, 112, by - 320); c.lineTo(112, by - 120); c.closePath();
  const ig = c.createLinearGradient(0, by - 420, 0, by - 120); ig.addColorStop(0, '#8a1e2a'); ig.addColorStop(1, '#4a0e16'); c.fillStyle = ig; c.fill(); c.clip();
  lattice(c, -120, by - 430, 240, 320, '#f0c860', 0.35, 30); c.restore();
  c.strokeStyle = '#fff0b0'; c.lineWidth = 3; c.beginPath(); c.moveTo(-112, by - 120); c.lineTo(-112, by - 320); c.quadraticCurveTo(-112, by - 392, 0, by - 424); c.quadraticCurveTo(112, by - 392, 112, by - 320); c.lineTo(112, by - 120); c.stroke();
  for (let i = 0; i < 9; i++) { const q = i / 8, a = lerp(Math.PI * 1.05, Math.PI * 1.95, q); gem(c, Math.cos(a) * 130, by - 330 + Math.sin(a) * 120, 8, ['#c0283a', '#2a5ab0', '#1e8a5a'][i % 3]); }
  star4(c, 0, by - 470, 22, '#fff4c8', 0.9);
  // seat, cushion, armrests with round finials
  c.fillStyle = gold(-170, 170); c.fillRect(-170, by - 110, 340, 110);
  c.fillStyle = '#9a1e2e'; c.beginPath(); c.roundRect(-140, by - 140, 280, 42, 14); c.fill(); c.fillStyle = 'rgba(255,200,200,0.25)'; c.fillRect(-130, by - 136, 260, 8);
  for (let i = 0; i < 5; i++) gem(c, -120 + i * 60, by - 55, 10, ['#2a5ab0', '#c0283a', '#1e8a5a'][i % 3]);
  [-1, 1].forEach(d => { c.fillStyle = gold(d * 150, d * 200); c.fillRect(d > 0 ? 150 : -200, by - 210, 50, 210); gem(c, d * 175, by - 222, 22, '#f0c860'); gem(c, d * 175, by - 120, 9, '#c0283a'); });
  if (shine > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const sx = lerp(-260, 260, (t * 0.35) % 1); const g = c.createLinearGradient(sx - 60, 0, sx + 60, 0);
    g.addColorStop(0, 'rgba(255,250,220,0)'); g.addColorStop(0.5, `rgba(255,250,220,${0.35 * shine})`); g.addColorStop(1, 'rgba(255,250,220,0)'); c.fillStyle = g; c.fillRect(-260, by - 480, 520, 480); c.restore(); }
  c.restore();
}
function scroll(c, x, y, s, open, t, o = {}) { // the letter: rolled with a wax seal, then unrolled to show the Bismillah
  c.save(); c.translate(x, y); c.scale(s, s);
  const k = ease(clamp(open)), w = lerp(40, 700, k), h = 440;
  if (k > 0.02) {
    c.fillStyle = 'rgba(10,6,4,0.35)'; c.fillRect(-w / 2 + 14, -h / 2 + 18, w, h);
    const g = c.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#f6e8c6'); g.addColorStop(1, '#dcc292'); c.fillStyle = g; c.fillRect(-w / 2, -h / 2, w, h);
    c.save(); c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip();
    const eg = c.createLinearGradient(-w / 2, 0, w / 2, 0); eg.addColorStop(0, 'rgba(120,80,30,0.3)'); eg.addColorStop(0.1, 'rgba(120,80,30,0)'); eg.addColorStop(0.9, 'rgba(120,80,30,0)'); eg.addColorStop(1, 'rgba(120,80,30,0.3)'); c.fillStyle = eg; c.fillRect(-w / 2, -h / 2, w, h);
    c.strokeStyle = 'rgba(150,100,40,0.6)'; c.lineWidth = 3; c.strokeRect(-310, -190, 620, 380); c.lineWidth = 1.5; c.strokeRect(-298, -178, 596, 356);
    const a1 = seg(open, 0.75, 1) * (o.l1 === undefined ? 1 : o.l1), a2 = o.l2 || 0;
    c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.globalAlpha = a1; c.font = '700 66px Amiri'; c.fillStyle = '#3a2410'; c.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 0, -70);
    c.globalAlpha = a2; c.font = '700 48px Amiri'; c.fillStyle = '#5a2a14'; c.fillText('أَلَّا تَعْلُوا عَلَيَّ وَأْتُونِي مُسْلِمِينَ', 0, 60);
    c.globalAlpha = Math.max(a1, a2) * 0.7; c.strokeStyle = '#a07a3a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-200, 0); c.lineTo(200, 0); c.stroke(); gem(c, 0, 0, 7, '#c0283a');
    c.restore();
  }
  [-1, 1].forEach(d => { if (k <= 0.02 && d > 0) return; const rx = k <= 0.02 ? 0 : d * w / 2;
    const g = c.createLinearGradient(rx - 22, 0, rx + 22, 0); g.addColorStop(0, '#b8955a'); g.addColorStop(0.5, '#f6e6c0'); g.addColorStop(1, '#9a7840');
    c.fillStyle = g; c.beginPath(); c.roundRect(rx - 22, -h / 2 - 20, 44, h + 40, 18); c.fill();
    c.fillStyle = '#6a4220'; c.beginPath(); c.ellipse(rx, -h / 2 - 20, 22, 7, 0, 0, 6.283); c.ellipse(rx, h / 2 + 20, 22, 7, 0, 0, 6.283); c.fill(); });
  if (k < 0.3) { c.globalAlpha = 1 - k / 0.3; c.fillStyle = '#9a1a1a'; c.beginPath(); c.arc(4, 20, 30, 0, 6.283); c.fill(); c.strokeStyle = '#6a0e0e'; c.lineWidth = 3; c.beginPath(); c.arc(4, 20, 20, 0, 6.283); c.stroke(); star4(c, 4, 20, 12, '#e8b0a0', 0.6); c.globalAlpha = 1; }
  c.restore();
}
function column(c, x, y, w, h, col, o = {}) { // limestone column: base, fluted shaft, carved capital with a gold band
  const lt = mix(col, '#fff4e0', 0.35), dk = mix(col, '#1a0c06', 0.45);
  const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, dk); g.addColorStop(0.35, lt); g.addColorStop(0.6, col); g.addColorStop(1, dk);
  c.fillStyle = g; c.fillRect(x - w / 2, y - h * 0.93, w, h * 0.87);
  c.strokeStyle = hexA(dk, 0.35); c.lineWidth = Math.max(1, w * 0.04); for (let k = 1; k < 6; k++) { const xx = x - w / 2 + k * w / 6; c.beginPath(); c.moveTo(xx, y - h * 0.92); c.lineTo(xx, y - h * 0.07); c.stroke(); }
  c.fillStyle = g; c.fillRect(x - w * 0.75, y - h * 0.07, w * 1.5, h * 0.07); c.fillRect(x - w * 0.85, y - h, w * 1.7, h * 0.05);
  c.fillStyle = o.band || GOLD; c.fillRect(x - w * 0.62, y - h * 0.95, w * 1.24, h * 0.02);
  c.fillStyle = hexA(dk, 0.3); c.fillRect(x - w * 0.75, y - h * 0.07, w * 1.5, 3);
}
function hall(c, t, o = {}) { // Sulayman's court: tiled floor in perspective, columns, arches with sky, lamps, curtains
  const fy = o.fy || 1250, vx = o.vx || 540;
  const wg = c.createLinearGradient(0, 300, 0, fy); wg.addColorStop(0, '#5a3e2a'); wg.addColorStop(1, '#a87a50'); c.fillStyle = wg; c.fillRect(-400, -400, W + 800, fy + 400);
  for (let i = -2; i < 6; i++) { const ax = 30 + i * 260; c.save(); archPath(c, ax + 130, fy - 260, 150, 520); c.fillStyle = '#e8c69a'; c.fill(); c.clip();
    const sg = c.createLinearGradient(0, fy - 780, 0, fy - 260); sg.addColorStop(0, o.skyTop || '#6a9ac8'); sg.addColorStop(1, o.skyBot || '#f0d8b0'); c.fillStyle = sg; c.fillRect(ax, fy - 800, 280, 560);
    ridge(c, fy - 330, 30, 0.01, i + 3, hexA('#7a8a6a', 0.9)); c.restore();
    c.strokeStyle = '#3a2618'; c.lineWidth = 6; c.beginPath(); archPath(c, ax + 130, fy - 260, 150, 520); c.stroke(); }
  for (let i = -2; i < 7; i++) column(c, 30 + i * 260, fy, 60, 820, '#d8b88e');
  c.fillStyle = '#4a2e1c'; c.fillRect(-400, fy - 900, W + 800, 90); c.fillStyle = GOLD; c.fillRect(-400, fy - 812, W + 800, 8);
  // floor: polished tiles in perspective
  const g = c.createLinearGradient(0, fy, 0, H + 300); g.addColorStop(0, '#c8a070'); g.addColorStop(1, '#6a4428'); c.fillStyle = g; c.fillRect(-400, fy, W + 800, H + 400);
  c.strokeStyle = 'rgba(60,30,10,0.35)'; c.lineWidth = 2;
  for (let i = -14; i <= 14; i++) { c.beginPath(); c.moveTo(vx + i * 40, fy); c.lineTo(vx + i * 360, H + 300); c.stroke(); }
  for (let k = 1; k < 12; k++) { const yy = fy + Math.pow(k / 12, 2) * (H + 300 - fy); c.beginPath(); c.moveTo(-400, yy); c.lineTo(W + 400, yy); c.stroke(); }
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, vx, fy + 120, 600, '#ffe0b0', 0.12); c.restore();
  // a long carpet toward the dais
  c.fillStyle = '#7a1a22'; c.beginPath(); c.moveTo(vx - 60, fy); c.lineTo(vx + 60, fy); c.lineTo(vx + 520, H + 300); c.lineTo(vx - 520, H + 300); c.closePath(); c.fill();
  c.strokeStyle = GOLD; c.lineWidth = 4; c.beginPath(); c.moveTo(vx - 48, fy); c.lineTo(vx - 430, H + 300); c.moveTo(vx + 48, fy); c.lineTo(vx + 430, H + 300); c.stroke();
  [[180, 520], [900, 520], [540, 380]].forEach(([lx, ly], k) => { c.strokeStyle = '#2a1a10'; c.lineWidth = 2; c.beginPath(); c.moveTo(lx, ly - 400); c.lineTo(lx, ly - 30); c.stroke(); lanternBox(c, lx, ly, 1.3, t, k); });
}
function city(c, x0, x1, y, hillH, s, col, seed, o = {}) { // stone houses climbing a hill, flat roofs, small windows; palace on top
  const r = rng(seed), rows = 7, lt = mix(col, '#fff2dc', 0.3), dk = mix(col, '#1a0c06', 0.4);
  const hy = x => y - hillH * Math.pow(Math.sin(clamp((x - x0) / (x1 - x0)) * Math.PI), 0.7);
  c.fillStyle = mix(col, '#4a3a2a', 0.4); c.beginPath(); c.moveTo(x0 - 100, y + 40); for (let x = x0 - 100; x <= x1 + 100; x += 20) c.lineTo(x, hy(x) + 30); c.lineTo(x1 + 100, y + 40); c.closePath(); c.fill();
  for (let k = 0; k < rows; k++) {
    const q = k / rows; let x = x0 + r() * 40;
    while (x < x1) { const bw = (50 + r() * 70) * s, bh = (40 + r() * 60) * s, cx = x + bw / 2; const top = lerp(hy(cx), y, q) + 26 * s;
      if (top < y + 30) { c.fillStyle = r() > 0.4 ? col : lt; c.fillRect(x, top - bh, bw, bh + 40 * s); c.fillStyle = dk; c.fillRect(x + bw * 0.72, top - bh, bw * 0.28, bh + 40 * s);
        c.fillStyle = hexA(dk, 0.8); for (let w = 0; w < 2; w++) if (r() > 0.35) c.fillRect(x + bw * (0.18 + w * 0.3), top - bh * 0.6, 7 * s, 11 * s);
        c.fillStyle = hexA(lt, 0.8); c.fillRect(x - 2, top - bh - 3 * s, bw + 4, 4 * s); }
      x += bw + r() * 8 * s; }
  }
  if (o.palace) { const px = (x0 + x1) / 2, py = hy(px) + 30 * s, pw = Math.min(380, (x1 - x0) * 0.32);
    c.fillStyle = lt; c.fillRect(px - pw / 2, py - 120 * s, pw, 120 * s); c.fillStyle = dk; c.fillRect(px - pw / 2, py - 128 * s, pw, 10 * s);
    for (let i = 0; i < 9; i++) { const cx = px - pw / 2 + (i + 0.5) * pw / 9; c.fillStyle = hexA(dk, 0.7); c.fillRect(cx - 3 * s, py - 110 * s, 6 * s, 100 * s); }
    c.fillStyle = col; c.fillRect(px - pw * 0.2, py - 190 * s, pw * 0.4, 70 * s); c.fillStyle = GOLD; c.fillRect(px - pw * 0.2, py - 196 * s, pw * 0.4, 6 * s); }
  if (o.walls) { c.fillStyle = mix(col, '#000000', 0.15); c.fillRect(x0 - 60, y - 40 * s, x1 - x0 + 120, 70 * s);
    for (let x = x0 - 60; x < x1 + 60; x += 22 * s) c.fillRect(x, y - 52 * s, 12 * s, 14 * s);
    [x0 - 40, (x0 + x1) / 2 - 200, (x0 + x1) / 2 + 200, x1 + 40].forEach(tx => { c.fillRect(tx - 24 * s, y - 100 * s, 48 * s, 130 * s); for (let k = 0; k < 3; k++) c.fillRect(tx - 24 * s + k * 18 * s, y - 112 * s, 12 * s, 14 * s); }); }
}
function cedar(c, x, y, s, col, t = 0, seed = 1) { // tiered cedar of Lebanon
  c.save(); c.translate(x, y); c.scale(s, s); const r = rng(seed), dk = mix(col, '#000000', 0.35), lt = mix(col, '#e8f0c0', 0.18), sw = Math.sin(t * 0.8 + seed) * 4;
  c.fillStyle = '#3a2618'; c.fillRect(-9, -260, 18, 260);
  for (let k = 0; k < 6; k++) { const yy = -70 - k * 52, w = (220 - k * 30) * (0.85 + r() * 0.3), off = (r() - 0.5) * 30 + sw * (k / 6);
    c.fillStyle = dk; c.beginPath(); c.ellipse(off, yy + 10, w / 2, 20, 0, 0, 6.283); c.fill();
    c.fillStyle = k % 2 ? col : lt; c.beginPath(); c.ellipse(off, yy, w / 2 - 6, 16, 0, Math.PI, 0); c.lineTo(off + w / 2 - 6, yy + 4); c.lineTo(off - w / 2 + 6, yy + 4); c.fill(); }
  c.restore();
}
function towerHouse(c, x, y, w, h, col, seed, t = 0) { // Yemeni tower house: mud brick, white gypsum bands and window frames
  const r = rng(seed), dk = mix(col, '#1a0c06', 0.35), lt = mix(col, '#fff0d8', 0.25), tw = w * 0.06;
  c.fillStyle = col; c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x - w / 2 + tw, y - h); c.lineTo(x + w / 2 - tw, y - h); c.lineTo(x + w / 2, y); c.closePath(); c.fill();
  c.fillStyle = hexA(dk, 0.5); c.beginPath(); c.moveTo(x + w * 0.2, y); c.lineTo(x + w * 0.2, y - h); c.lineTo(x + w / 2 - tw, y - h); c.lineTo(x + w / 2, y); c.closePath(); c.fill();
  const floors = Math.max(3, Math.round(h / (w * 0.5)));
  for (let f = 0; f < floors; f++) { const fy = y - (f + 0.5) * h / floors;
    c.fillStyle = '#f4efe2'; c.fillRect(x - w / 2 + tw * (f / floors) + 2, fy - h / floors * 0.5 - 2, w - tw * 2 * (f / floors) - 4, Math.max(2, w * 0.025));
    for (let k = 0; k < 3; k++) { if (f === 0 && k === 1) continue; const wx = x - w * 0.3 + k * w * 0.3, ww = w * 0.12, wh = h / floors * 0.42;
      c.fillStyle = '#f4efe2'; c.fillRect(wx - ww / 2 - 3, fy - wh / 2 - 3, ww + 6, wh + 6); c.fillStyle = '#1a100a'; c.fillRect(wx - ww / 2, fy - wh / 2, ww, wh);
      c.fillStyle = r() > 0.5 ? 'rgba(255,190,110,0.8)' : 'rgba(120,180,220,0.7)'; c.beginPath(); c.arc(wx, fy - wh / 2 - 4, ww / 2, Math.PI, 0); c.fill(); } }
  c.fillStyle = '#f4efe2'; c.fillRect(x - w / 2 + tw - 4, y - h - 6, w - tw * 2 + 8, 10);
  for (let k = 0; k < 5; k++) c.fillRect(x - w / 2 + tw + k * (w - tw * 2) / 4.5, y - h - 22, (w - tw * 2) / 9, 18);
  c.fillStyle = 'rgba(10,6,4,0.25)'; c.fillRect(x - w / 2, y - 4, w, 6);
}
function crystalFloor(c, t, y0, o = {}) { // the palace floor of glass with deep water under it (An-Naml 44)
  const vx = o.vx || 540;
  const g = c.createLinearGradient(0, y0, 0, H + 300); g.addColorStop(0, '#5ab0c0'); g.addColorStop(0.5, '#1e6a80'); g.addColorStop(1, '#0a2a3a'); c.fillStyle = g; c.fillRect(-400, y0, W + 800, H + 400);
  c.save(); c.beginPath(); c.rect(-400, y0, W + 800, H + 400); c.clip();
  const r = rng(5); // fish gliding under the glass
  for (let i = 0; i < 9; i++) { const sp = 30 + r() * 50, dir = r() > 0.5 ? 1 : -1, yy = y0 + 120 + r() * 700, x = ((r() * 1600 + dir * t * sp) % 1600 + 1600) % 1600 - 260, s = 0.6 + (yy - y0) / 700;
    c.save(); c.translate(x, yy + Math.sin(t + i) * 8); c.scale(dir * s, s); c.fillStyle = `rgba(10,40,50,${0.45 + 0.2 * r()})`; c.beginPath(); c.ellipse(0, 0, 40, 13, 0, 0, 6.283); c.fill();
    c.beginPath(); c.moveTo(-34, 0); c.lineTo(-62, -14 + Math.sin(t * 6 + i) * 4); c.lineTo(-62, 14 + Math.sin(t * 6 + i) * 4); c.closePath(); c.fill(); c.restore(); }
  c.globalCompositeOperation = 'lighter'; c.lineWidth = 2.5; // caustics
  for (let k = 0; k < 26; k++) { const yy = y0 + 40 + k * k * 1.8 + k * 20; c.strokeStyle = `rgba(200,250,255,${0.1 + 0.08 * Math.sin(t * 1.5 + k)})`; c.beginPath();
    for (let x = -200; x <= W + 200; x += 30) { const v = yy + Math.sin(x * 0.02 + t * 1.8 + k) * 8 + Math.sin(x * 0.007 - t + k * 2) * 10; x === -200 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); }
  c.globalCompositeOperation = 'source-over';
  c.strokeStyle = 'rgba(230,250,255,0.35)'; c.lineWidth = 2; // the glass seams
  for (let i = -12; i <= 12; i++) { c.beginPath(); c.moveTo(vx + i * 60, y0); c.lineTo(vx + i * 420, H + 300); c.stroke(); }
  for (let k = 1; k < 10; k++) { const yy = y0 + Math.pow(k / 10, 2) * (H + 300 - y0); c.beginPath(); c.moveTo(-400, yy); c.lineTo(W + 400, yy); c.stroke(); }
  c.globalCompositeOperation = 'lighter'; const sx = 200 + Math.sin(t * 0.3) * 120, sg = c.createLinearGradient(sx - 160, 0, sx + 160, 0);
  sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.14)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = sg;
  c.beginPath(); c.moveTo(sx - 60, y0); c.lineTo(sx + 60, y0); c.lineTo(sx + 500, H + 300); c.lineTo(sx + 200, H + 300); c.closePath(); c.fill();
  c.restore();
}
function reflect(c, y, a, fn) { c.save(); c.globalAlpha *= a; c.translate(0, 2 * y); c.scale(1, -1); fn(); c.restore(); }
function blink(c, k) { // eyelids closing (k = 1: shut)
  if (k <= 0) return; const e = ease(clamp(k)), hh = lerp(-260, H / 2 + 30, e), bend = 240;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#050302';
  c.beginPath(); c.moveTo(-20, -20); c.lineTo(W + 20, -20); c.lineTo(W + 20, hh); c.quadraticCurveTo(W / 2, hh + bend, -20, hh); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(-20, H + 20); c.lineTo(W + 20, H + 20); c.lineTo(W + 20, H - hh); c.quadraticCurveTo(W / 2, H - hh - bend, -20, H - hh); c.closePath(); c.fill();
  c.restore();
}
function windStreaks(c, t, a, seed = 5, y0 = 0, y1 = H) { if (a <= 0) return; const r = rng(seed);
  for (let i = 0; i < 50; i++) { const yy = y0 + r() * (y1 - y0), sp = 500 + r() * 700, l = 80 + r() * 220, x = ((r() * 2200 + t * sp) % 2200) - 500;
    c.strokeStyle = `rgba(255,250,235,${a * (0.15 + 0.25 * r())})`; c.lineWidth = 1.5 + r() * 2.5; c.beginPath(); c.moveTo(x, yy); c.quadraticCurveTo(x + l / 2, yy - 10 - r() * 10, x + l, yy + Math.sin(t * 2 + i) * 6); c.stroke(); } }
function leaves(c, t, a, seed = 9, y0 = 300, y1 = 1400) { if (a <= 0) return; const r = rng(seed);
  for (let i = 0; i < 22; i++) { const yy = y0 + r() * (y1 - y0) + Math.sin(t * 3 + i) * 30, sp = 380 + r() * 400, x = ((r() * 2000 + t * sp) % 2000) - 400, rot = t * (3 + r() * 4) + i;
    c.save(); c.translate(x, yy); c.rotate(rot); c.globalAlpha = a; c.fillStyle = r() > 0.5 ? '#6a8a3a' : '#a89a4a'; c.beginPath(); c.ellipse(0, 0, 10, 4, 0, 0, 6.283); c.fill(); c.restore(); } }
function banner(c, x, y, s, t, col = '#2a4a8a', k = 0, wind = 1) { // a tall standard with a waving cloth
  c.strokeStyle = '#3a2614'; c.lineWidth = 6 * s; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 420 * s); c.stroke();
  c.fillStyle = GOLD; c.beginPath(); c.arc(x, y - 426 * s, 9 * s, 0, 6.283); c.fill();
  c.fillStyle = col; c.beginPath(); c.moveTo(x, y - 410 * s);
  for (let i = 0; i <= 10; i++) { const q = i / 10; c.lineTo(x + q * 130 * s, y - 410 * s + Math.sin(t * 4 * wind + k - q * 4) * 12 * s * q * wind); }
  for (let i = 10; i >= 0; i--) { const q = i / 10; c.lineTo(x + q * 130 * s, y - 320 * s + Math.sin(t * 4 * wind + k - q * 4) * 12 * s * q * wind - q * 10 * s); }
  c.closePath(); c.fill(); c.fillStyle = GOLD; c.fillRect(x, y - 410 * s, 6 * s, 90 * s);
}
function rider(c, x, y, s, t, dir, who, o = {}) { // a horseman: horse + seated figure on its back
  horse(c, x, y, s, t, dir, o.col || '#4a3020', o.gallop === undefined ? 0.4 : o.gallop);
  fig(c, who, { x: x - dir * 6 * s, y: y - 108 * s, h: 190 * s, dir, pose: 'sit', t, light: o.light || 0.85, shadow: false, ink: o.ink });
  if (o.spear) { c.strokeStyle = '#3a2614'; c.lineWidth = 4 * s; c.beginPath(); c.moveTo(x + dir * 30 * s, y - 120 * s); c.lineTo(x + dir * 50 * s, y - 420 * s); c.stroke(); }
}
function book(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#5a2a1a'; c.fillRect(-26, -18, 52, 36); c.fillStyle = '#f2e6c8'; c.fillRect(-22, -15, 44, 28);
  c.strokeStyle = GOLD; c.lineWidth = 2; c.strokeRect(-26, -18, 52, 36); c.beginPath(); c.moveTo(0, -18); c.lineTo(0, 18); c.stroke(); c.restore(); }
function sparkle(c, t, x, y, n, rad, seed, a = 1) { const r = rng(seed); c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const ph = (t * (0.3 + r() * 0.4) + r()) % 1, an = r() * 6.283, d = rad * (0.2 + r() * 0.9), sx = x + Math.cos(an) * d, sy = y + Math.sin(an) * d * 0.8 - ph * 120;
    const tw = Math.sin(ph * Math.PI); if (i % 4 === 0) star4(c, sx, sy, 7 + r() * 8, '#fff2c0', a * tw); else { c.fillStyle = `rgba(255,236,170,${a * tw * 0.8})`; c.beginPath(); c.arc(sx, sy, 2 + r() * 2.5, 0, 6.283); c.fill(); } }
  c.restore(); }

// ---------- HERO shot (hook + cta + outro): macro at ground level in the valley of the ants. The ant stands on a pebble
// and calls out; behind, out of focus, Sulayman's army comes in a golden haze, birds above it. T is continuous across
// cta -> outro -> hook, so the last frame of the video is exactly its first frame (seamless loop).
function heroShot(c, T, o = {}) {
  const f = ease(clamp(o.focus || 0)), rear = o.rear || 0;
  sky0(c, [[0, '#4a6a9a'], [0.25, '#9ab0c0'], [0.42, '#f0cc96'], [0.52, '#f8dcac']]);
  cam(c, 1.06 + 0.004 * T + 0.1 * f, lerp(540, 760, f), lerp(1040, 960, f));
  // far valley + army: out of focus, then in focus when the narration names the prophet
  blurLayer(c, lerp(7, 1.2, f), cc => {
    cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, 860, 800, 700, '#ffd8a0', 0.5); cc.restore();
    sun(cc, 860, 790, 56, '#fff0c8', 0.85);
    ridge(cc, 905, 70, 0.004, 5, '#c8a888'); ridge(cc, 950, 40, 0.006, 8, '#b8906a');
    haze(cc, 960, 160, '#f6d6a6', 0.6);
    const ax = T * 7;
    dustCloud(cc, T, 560 + ax, 1400, 980, 230, '#f0c890', 0.32, 4);
    spearLine(cc, T, 600 + ax, 1400, 990, 44, 34, '#5a3e2a', 3);
    for (let i = 0; i < 4; i++) banner(cc, 640 + ax + i * 170, 992, 0.16, T, ['#2a4a8a', '#8a2a22', '#2a6a4a', '#6a2a6a'][i], i);
    fig(cc, SUL, { x: 560 + ax, y: 1000, h: 70, dir: -1, walk: stepOf(T * 7, 70), light: 1, t: T, veilGlow: 0.6 });
    flock(cc, T, 900 + T * 6, 640, 9, 0.9, 11, { dir: -1, col: '#5a4038' }); flock(cc, T, 700 + T * 6, 560, 7, 0.7, 12, { dir: -1, col: '#6a5048' });
    const gg = cc.createLinearGradient(0, 960, 0, 1140); gg.addColorStop(0, '#d8aa74'); gg.addColorStop(1, '#c8965e'); cc.fillStyle = gg; cc.fillRect(-400, 975, W + 800, 400);
  });
  // macro ground (sharp), fading in from the blurred far ground
  blurLayer(c, 5 * f, cc => {
    const g = cc.createLinearGradient(0, 1040, 0, 1900); g.addColorStop(0, 'rgba(206,154,96,0)'); g.addColorStop(0.12, '#ce9a60'); g.addColorStop(1, '#8a5a32');
    cc.fillStyle = g; cc.fillRect(-400, 1040, W + 800, 1200);
    grains(cc, 1100, 1900, 420, 7);
    antHill(cc, 250, 1300, 1.0, 3);
    // the ants hurrying home (from the right, toward the hole): enter by the frame edge, vanish into the entrance
    for (let i = 0; i < 9; i++) { const q = ((T * 0.11 + i / 9) % 1 + 1) % 1, x = lerp(1250, 268, q), y = lerp(1350, 1206, q) + Math.sin(q * 9 + i) * 10 - Math.max(0, q - 0.75) * 40, s = lerp(0.42, 0.28, q) * (1 - seg(q, 0.93, 1) * 0.6);
      cc.save(); cc.globalAlpha = 1 - seg(q, 0.95, 1); ant(cc, x, y, s, T + i, { dir: -1, walk: (1250 - x) / (110 * s) }); cc.restore(); }
    boulder(cc, 690, 1236, 330, 100, '#a8784a', 5);
    cc.fillStyle = 'rgba(255,230,190,0.35)'; cc.beginPath(); cc.ellipse(700, 1142, 140, 10, 0, Math.PI, 0); cc.fill();
    cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, 760, 1040, 260, '#ffd8a0', 0.2 + 0.25 * rear); cc.restore();
    ant(cc, 700, 1146, 1.45, T, { dir: -1, rear, alert: o.alert });
    if (o.ringT !== undefined) soundRings(cc, 590, 980, T, o.ringT, 1 - f);
    // dry grass blades catching the light
    cc.strokeStyle = '#8a6a3a'; cc.lineCap = 'round'; for (let i = 0; i < 7; i++) { const bx = 900 + i * 22, sw = Math.sin(T * 1.3 + i) * 10; cc.lineWidth = 5; cc.beginPath(); cc.moveTo(bx, 1300); cc.quadraticCurveTo(bx + 10, 1140, bx + 30 + sw, 1000 + i * 18); cc.stroke(); }
  }, 1);
  // blurred foreground pebbles (depth)
  blurLayer(c, 12, cc => { boulder(cc, 140, 1990, 520, 260, '#6a4426', 7); boulder(cc, 980, 2010, 560, 330, '#5a3820', 9); grains(cc, 1800, 1950, 30, 13, '#4a2a14', 3); }, 2);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
function seriesTag(c, a, ep = 8) { textGlow(c, `LES PROPHÈTES  ·  ÉPISODE ${ep}`, W / 2, 112, '600 32px Lora', '#fbe7c6', a * 0.92, '#000000', 12); }
function topShade(c, a = 1) { const g = c.createLinearGradient(0, 0, 0, 520); g.addColorStop(0, `rgba(10,6,4,${0.55 * a})`); g.addColorStop(1, 'rgba(10,6,4,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 520); }
function caption(c, txt, y, a, size = 34, col = '#f3e7d0') { textGlow(c, txt, W / 2, y, `italic 500 ${size}px Lora`, col, a * 0.88, '#000', 10); }

// shared settings
function terrace(c, y, col = '#d8b88e') { // stone balustrade in the foreground
  const g = c.createLinearGradient(0, y - 120, 0, y + 400); g.addColorStop(0, mix(col, '#fff2dc', 0.25)); g.addColorStop(1, mix(col, '#1a0c06', 0.4));
  c.fillStyle = g; c.fillRect(-1400, y, W + 3400, 900);
  c.fillStyle = mix(col, '#1a0c06', 0.2); c.fillRect(-1400, y - 120, W + 3400, 18);
  for (let x = -1380; x < W + 2000; x += 70) { c.fillStyle = mix(col, '#fff2dc', 0.15); c.beginPath(); c.moveTo(x - 14, y); c.quadraticCurveTo(x - 24, y - 60, x - 10, y - 102); c.lineTo(x + 10, y - 102); c.quadraticCurveTo(x + 24, y - 60, x + 14, y); c.closePath(); c.fill();
    c.fillStyle = hexA(mix(col, '#000000', 0.4), 0.4); c.fillRect(x + 4, y - 100, 10, 100); }
  c.fillStyle = mix(col, '#fff2dc', 0.3); c.fillRect(-1400, y - 132, W + 3400, 16); c.fillStyle = 'rgba(255,240,210,0.6)'; c.fillRect(-1400, y - 132, W + 3400, 3);
}
function perch(c, x0, x1, y, t) { // a carved wooden perch on two posts
  c.fillStyle = '#4a2e1a'; c.fillRect(x0 + 40, y, 18, 520); c.fillRect(x1 - 58, y, 18, 520);
  const g = c.createLinearGradient(0, y - 12, 0, y + 16); g.addColorStop(0, '#9a6a3a'); g.addColorStop(1, '#3a2212'); c.fillStyle = g; c.beginPath(); c.roundRect(x0, y - 12, x1 - x0, 26, 12); c.fill();
  c.fillStyle = GOLD; [x0 + 49, x1 - 49].forEach(px => { c.beginPath(); c.arc(px, y, 13, 0, 6.283); c.fill(); });
}
function perchSet(c, t, cx) { // the terrace with the long perch of birds (hoopoe scenes)
  par(c, -0.55, cx - 540, 0, () => { sunsetCity(c, t, { far: '#90a0b8', haze: '#eee2cc', stone: '#e4cca8', valley: '#a8a078' }); });
  for (let i = -1; i < 10; i++) cedar(c, -200 + i * 300, 1150 + (i % 2) * 20, 0.9, '#3a5a3a', t, i + 10);
  terrace(c, 1400, '#d8bc94'); perch(c, -100, 2060, 1130, t); birdsOnPerch(c, t, 1130);
}
const PERCHED = [0, 3, 1, 5, 2, 6, 4, 1, 0]; // species along the perch (the last place, the hoopoe's, stays empty)
const PX = i => 120 + i * 190, EMPTY = PX(9);
function birdsOnPerch(c, t, y) { PERCHED.forEach((k, i) => perchBird(c, PX(i), y - 10, 1.6, t, i, Object.assign({ dir: i % 3 ? -1 : 1 }, BIRDS[k]))); }
function sunsetCity(c, t, o = {}) { // Sulayman's city across the valley (Bayt al-Maqdis), cedars and olive groves
  ridge(c, 920, 90, 0.003, 2, o.far || '#8a8aa0'); haze(c, 930, 220, o.haze || '#f0c8a0', 0.5);
  city(c, -760, 1840, 1000, 300, 1.0, o.stone || '#d8b48a', 5, { palace: true, walls: true });
  const vg = c.createLinearGradient(0, 1030, 0, 1500); vg.addColorStop(0, mix(o.valley || '#a89870', '#ffffff', 0.15)); vg.addColorStop(1, mix(o.valley || '#a89870', '#000000', 0.25));
  c.fillStyle = vg; c.fillRect(-2400, 1030, W + 4800, 1400);
  const r = rng(17); for (let i = 0; i < 40; i++) { const x = -1200 + r() * 3400, y = 1050 + r() * 120; c.fillStyle = hexA(mix(o.valley || '#a89870', '#1a2a10', 0.45), 0.7); c.beginPath(); c.ellipse(x, y, 16 + r() * 22, 8 + r() * 8, 0, 0, 6.283); c.fill(); }
  c.strokeStyle = hexA(mix(o.valley || '#a89870', '#000000', 0.3), 0.3); c.lineWidth = 2; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(-2400, 1060 + k * 22); c.lineTo(W + 2400, 1052 + k * 26); c.stroke(); }
  haze(c, 1060, 120, o.haze || '#f0c8a0', 0.35);
}

const SCENES = {
  // 1. HOOK — "an ant said: O ants, enter your dwellings" (An-Naml 18). First frame = last frame.
  hook: {
    grade: 'rgba(255,190,130,0.14)',
    draw(c, t, d) {
      const tA = at('hook', 'averti', 0, 1.0), tP = at('hook', 'prophète', 0, 3.6);
      heroShot(c, t, { rear: ease(seg(t, tA - 0.2, tA + 0.5)), focus: ease(seg(t, tP - 0.2, tP + 1.0)), ringT: tA + 0.1 });
      seriesTag(c, 1);
      c.save(); c.direction = 'rtl'; textGlow(c, 'قَالَتْ نَمْلَةٌ', W / 2, 300, '700 130px Amiri', '#f6c453', 1 - seg(t, d - 0.6, d), '#ffb300', 30); c.restore();
      caption(c, 'An-Naml, 18', 410, seg(t, 0.6, 1.2) * (1 - seg(t, d - 0.6, d)));
    },
  },

  // 2. Title — Sulayman on the terrace above his city at sunset; then the teaser: a throne in the dark, and a blink
  promise: {
    grade: 'rgba(255,170,140,0.16)',
    draw(c, t, d) {
      const tH = at('promise', 'histoire', 0, 0.6), tT = at('promise', 'trône', 0, 4.2), tC = at('promise', 'clin', 0, 7.2);
      phases(c, t, tT - 0.5, 0.6, cc => {
        const push = ease(seg(t, 0, tT));
        cam(cc, 1.0 + 0.1 * push, lerp(540, 470, push), 1080);
        sky(cc, [[0, '#2a3a6a'], [0.3, '#8a6a9a'], [0.45, '#f0a080'], [0.52, '#ffd0a0']]);
        sun(cc, 760, 900, 70, '#ffe0b0', 0.9); wisps(cc, t, 520, 8, '#ffd0c0', 0.25, 9, 6); bird(cc, 200 + t * 30, 600, 1.0, t, 1, '#4a3040'); bird(cc, 250 + t * 28, 640, 0.8, t, 2, '#4a3040');
        sunsetCity(cc, t, { far: '#8a7088', haze: '#f0b090', stone: '#d4a88a', valley: '#8a6a58' });
        cedar(cc, 60, 1200, 1.3, '#2a3a2a', t, 3); cedar(cc, 1040, 1210, 1.1, '#2a3a2a', t, 5);
        terrace(cc, 1340, '#c8a07a');
        fig(cc, SUL, { x: 300, y: 1340, h: 500, dir: 1, light: 1, t, wind: 0.5 });
        blurred(cc, 8, () => { cedar(cc, 1120, 2100, 3.4, '#1a2418', t, 8); });
      }, cc => {
        const q = t - tT + 0.5;
        cam(cc, 1.0 + 0.05 * q, W / 2, lerp(1080, 1020, ease(clamp(q / 4))));
        const g = cc.createRadialGradient(540, 900, 50, 540, 1000, 1200); g.addColorStop(0, '#3a2414'); g.addColorStop(1, '#0a0604'); cc.fillStyle = g; cc.fillRect(-300, -300, W + 600, H + 600);
        cc.save(); cc.globalCompositeOperation = 'lighter'; const lg = cc.createLinearGradient(0, 0, 0, 1300); lg.addColorStop(0, 'rgba(255,220,160,0.28)'); lg.addColorStop(1, 'rgba(255,220,160,0)');
        cc.fillStyle = lg; cc.beginPath(); cc.moveTo(440, -100); cc.lineTo(640, -100); cc.lineTo(860, 1300); cc.lineTo(220, 1300); cc.closePath(); cc.fill(); cc.restore();
        cc.fillStyle = '#2a1a10'; cc.fillRect(-300, 1260, W + 600, 900);
        throne(cc, 540, 1270, 1.15, t, { glow: 0.7, shine: 1 });
        sparkle(cc, t, 540, 900, 24, 360, 4, 0.6);
      });
      blink(c, Math.exp(-Math.pow((t - tC - 0.25) * 4.5, 2)) * 1.05);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a = seg(t, 0.05, 0.6) * (1 - seg(t, tT - 0.9, tT - 0.3));
      topShade(c, a * 1.3); seriesTag(c, a);
      c.save(); c.direction = 'rtl'; textGlow(c, 'سُلَيْمَان', W / 2, 360 - (1 - easeOut(seg(t, 0.05, 1.0))) * 30, '700 180px Amiri', '#f6c453', a, '#ffb300', 40); c.restore();
      textGlow(c, 'ʿalayhi s-salām', W / 2, 520, 'italic 500 46px Lora', '#fff3dc', a, '#000000', 14);
      textGlow(c, 'Soulayman  ·  Salomon', W / 2, 590, '600 42px Lora', '#e8d6b8', a * 0.9, '#000000', 10);
      arabicCaption(c, 'قَبْلَ أَن يَرْتَدَّ إِلَيْكَ طَرْفُكَ', t, tC + 0.5, d + 1, 300, 92);
    },
  },

  // 3. Son of Dawud, a kingdom like no other (Sad 35); the language of the birds (An-Naml 16); the wind at his command (Al-Anbiya 81)
  kingdom: {
    grade: 'rgba(255,210,150,0.14)',
    draw(c, t, d) {
      const tL = at('kingdom', 'langage', 0, 5), tO = at('kingdom', 'oiseaux', 0, 6.2), tV = at('kingdom', 'vent', 0, 8.2);
      const gust = ramp(t, tV - 0.2, 0.6), land = ease(seg(t, tO + 0.2, tO + 1.6)), [sx, sy] = shake(t, gust * 0.25, 10);
      cam(c, 1.02 + 0.06 * t / d, 540 + 30 * t / d, 1060, sx, sy);
      sky(c, [[0, '#3a6aa8'], [0.35, '#9ac0d8'], [0.5, '#f0e0c0']]);
      wisps(c, t * (1 + gust * 6), 380, 9, '#ffffff', 0.3, 5, 10);
      sun(c, 200, 520, 60, '#fff6dc', 0.7);
      sunsetCity(c, t, { far: '#8a9ab0', haze: '#e8dcc8', stone: '#e0c49a', valley: '#9aa070' });
      for (let i = 0; i < 6; i++) oliveTree(c, 40 + i * 190, 1150 + (i % 2) * 20, 0.6, '#6a7a4a', '#4a5a34', Math.sin(t * 2) * 4 + gust * 14);
      fgRidge(c, 1300, 40, 0.004, 21, '#b89a6a', { rim: 'rgba(255,240,200,0.6)' });
      cedar(c, 950, ridgeY(950, 1300, 40, 0.004, 21) + 10, 1.5, '#2e4a2e', t * (1 + gust * 3), 2);
      const so = { x: 600, y: ridgeY(600, 1300, 40, 0.004, 21) + 12, h: 470, dir: -1, armUp: 0.62 * ease(seg(t, tO - 0.4, tO + 0.4)), light: 1, t, wind: 0.4 + gust * 1.1 };
      fig(c, SUL, so);
      // the birds come around him; a dove lands on his raised hand
      if (t > tO - 1.0) { const k = seg(t, tO - 1.0, tO + 3), r = rng(5);
        for (let i = 0; i < 11; i++) { const ang = t * (0.9 + r() * 0.4) + i * 0.57, rad = lerp(900, 260 + r() * 160, ease(k)), bx = so.x + Math.cos(ang) * rad * 1.3, by = 760 + Math.sin(ang) * rad * 0.35 - r() * 120;
          bird(c, bx, by, 1.2 + r() * 0.5, t, i, '#3a2a28'); } }
      const [hx, hy] = handOf(so);
      if (land > 0) { const fx = lerp(-200, hx, land), fy = lerp(500, hy - 8, land) - Math.sin(land * Math.PI) * 120;
        if (land < 1) bird(c, fx, fy, 1.4, t, 3, '#d8d4cc'); else perchBird(c, hx + 6, hy - 6, 0.75, t, 2, Object.assign({ dir: -1 }, BIRDS[0])); }
      windStreaks(c, t, gust * 0.8, 5, 300, 1500); leaves(c, t, gust, 9);
      blurred(c, 9, () => { shrub(c, 80, 1990, 4, '#3a3a20', t * (1 + gust * 3), 3); boulder(c, 1000, 2000, 400, 220, '#6a5038', 4); });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'وَوَرِثَ سُلَيْمَانُ دَاوُودَ', t, 0.2, tL - 0.4, 290, 104);
      arabicCaption(c, 'عُلِّمْنَا مَنطِقَ الطَّيْرِ', t, tL - 0.2, tV - 0.4, 290, 104);
      arabicCaption(c, 'تَجْرِي بِأَمْرِهِ', t, tV - 0.2, d + 1, 290, 120);
    },
  },

  // 4. His armies gathered "of jinn, men and birds, marching in ranks" (An-Naml 17). The jinn are never drawn.
  army: {
    grade: 'rgba(255,200,140,0.16)',
    draw(c, t, d) {
      const tO = at('army', 'oiseaux', 0, d * 0.8), up = ease(seg(t, tO - 0.6, tO + 0.8)), dist = t * 85;
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); sky(c, [[0, '#4a72a8'], [0.35, '#b4c8d0'], [0.5, '#f2dcb0']]); c.restore();
      cam(c, 1.12 - 0.08 * up, 540 - dist, lerp(1160, 920, up));
      par(c, -0.85, dist, 0, () => { ridge(c, 930, 120, 0.003, 7, '#a0a0b0'); sun(c, 900 - dist, 600, 50, '#fff4d8', 0.6); });
      par(c, -0.5, dist, 0, () => { ridge(c, 990, 60, 0.004, 9, '#c0a080'); haze(c, 1000, 160, '#f2dcb0', 0.6); });
      c.save(); c.translate(-dist, 0); sandFloor(c, 1010, '#d0a068', t, 3, false); c.restore();
      { const r = rng(44); for (let i = 0; i < 70; i++) { const x = -2600 + r() * 4200, y = 1060 + Math.pow(r(), 1.5) * 800, sz = 3 + (y - 1000) / 40 * r(); c.fillStyle = hexA('#7a5230', 0.5); c.beginPath(); c.ellipse(x, y, sz * 1.6, sz * 0.7, 0, 0, 6.283); c.fill(); } }
      for (let x = -2000; x < 1400; x += 260) shrub(c, x + 60, 1180 + (x % 3) * 20, 1.2, '#7a6a3a', t, x);
      // far ranks (silhouettes), dust and standards
      dustCloud(c, t, -900 - dist, 1300 - dist, 1060, 220, '#e8c8a0', 0.35, 5);
      spearLine(c, t, -1000 - dist, 1300 - dist, 1062, 60, 70, '#6a4a34', 4);
      for (let i = 0; i < 7; i++) banner(c, -900 - dist + i * 330, 1066, 0.3, t, ['#2a4a8a', '#8a2a22', '#2a6a4a'][i % 3], i);
      // mid ranks: men on foot and horsemen
      for (let i = 0; i < 12; i++) { const x = -1100 + i * 190 - dist; fig(c, FOLK[i % FOLK.length], { x, y: 1170 + (i % 2) * 14, h: 230, dir: -1, walk: stepOf(dist, 230) + i * 0.37, light: 0.85, t: t + i, wind: 0.3 });
        if (i % 3 === 1) spearOf(c, { x, y: 1170 + (i % 2) * 14, h: 230, dir: -1 }); }
      for (let i = 0; i < 5; i++) rider(c, -800 + i * 420 - dist, 1270, 0.95, dist / 260 + i * 0.4, -1, SOLDIER, { spear: true, gallop: 0.35 });
      // Sulayman at the head of the march
      fig(c, SUL, { x: 280 - dist, y: 1340, h: 400, dir: -1, walk: stepOf(dist, 400), light: 1, t, wind: 0.5 });
      fig(c, FOLK[2], { x: 520 - dist, y: 1350, h: 380, dir: -1, walk: stepOf(dist, 380) + 0.5, light: 0.9, t });
      banner(c, 610 - dist, 1352, 0.8, t, '#2a4a8a', 2);
      // the birds above, in formation, casting their shadows on the ground
      flock(c, t, 300 - dist * 1.1, 560, 13, 1.6, 21, { dir: -1, col: '#3a2a26', spread: 1.3 }); flock(c, t, 800 - dist * 1.1, 420, 9, 1.2, 22, { dir: -1, col: '#4a3a34' });
      c.fillStyle = 'rgba(40,20,10,0.12)'; for (let i = 0; i < 8; i++) { c.beginPath(); c.ellipse(200 - dist * 1.1 + i * 70, 1250 + (i % 3) * 30, 40, 9, 0, 0, 6.283); c.fill(); }
      blurred(c, 8, () => { for (let i = 0; i < 3; i++) shrub(c, -dist * 1.4 + i * 600 + 200, 2000, 4, '#4a3a20', t, i + 4); });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'وَحُشِرَ لِسُلَيْمَانَ جُنُودُهُ', t, 0.2, d + 1, 280, 100);
      arabicCaption(c, 'مِنَ الْجِنِّ وَالْإِنسِ وَالطَّيْرِ', t, 0.8, d + 1, 400, 76);
    },
  },

  // 5. The valley of the ants: "O ants, enter your dwellings, lest Sulayman and his armies crush you unknowingly" (An-Naml 18)
  ant: {
    grade: 'rgba(255,190,120,0.14)',
    draw(c, t, d) {
      const tC = at('ant', 'cria', 0, 2.2), tE = at('ant', 'entrez', 0, 4.4), tX = at('ant', 'écrasent', 0, 8.8);
      const zin = ease(seg(t, tC - 0.6, tC + 0.3)) * (1 - ease(seg(t, tE - 0.2, tE + 0.8))), dark = ramp(t, tX - 1.2, 1.4), quake = Math.min(1, dark * 1.4) * (1 - seg(t, d - 1.5, d));
      const [sx, sy] = shake(t, quake * 0.35, 12);
      sky0(c, [[0, '#5a7aa0'], [0.3, '#c0c4b8'], [0.45, '#f2d4a0']]);
      cam(c, 1.0 + 0.85 * zin + 0.04 * t / d, lerp(540, 600, zin), lerp(1100, 1000, zin), sx, sy);
      blurLayer(c, 8, cc => { ridge(cc, 860, 50, 0.004, 3, '#c8a88a'); haze(cc, 900, 160, '#f2d4a0', 0.5);
        spearLine(cc, t, 700 - t * 10, 1500, 940, 70, 20, '#6a4a34', 6); dustCloud(cc, t, 600, 1500, 930, 260, '#e8c08a', 0.4 + 0.3 * dark, 7);
        cc.fillStyle = '#c99660'; cc.fillRect(-400, 930, W + 800, 400); });
      const g = c.createLinearGradient(0, 960, 0, 1900); g.addColorStop(0, 'rgba(201,150,96,0)'); g.addColorStop(0.1, '#c99660'); g.addColorStop(1, '#7a4e2a'); c.fillStyle = g; c.fillRect(-400, 960, W + 800, 1300);
      grains(c, 1000, 1900, 380, 17);
      antHill(c, 400, 1240, 1.25, 5);
      // the colony: ants carrying grains, then everyone hurrying to the entrance (no ant ever pops in: they come from the frame edge)
      const hole = [405, 1110], r = rng(31), hurry = Math.max(0, t - tE) * 0.22;
      for (let i = 0; i < 16; i++) { const from = [[-120, 1300], [1200, 1350], [1200, 1150], [-120, 1150], [700, 1600], [1150, 1500]][i % 6], q0 = -0.3 + r() * 0.9, q = clamp(q0 + t * 0.03 + hurry * (0.8 + r() * 0.5));
        if (q <= 0 || q >= 1) continue;
        const x = lerp(from[0], hole[0], q), y = lerp(from[1], hole[1], q) + Math.sin(q * 8 + i) * 18, s = lerp(0.55 + (from[1] - 1100) / 1200, 0.4, q) * (1 - 0.5 * seg(q, 0.9, 1));
        c.save(); c.globalAlpha = 1 - seg(q, 0.94, 1); ant(c, x, y, s, t + i, { dir: from[0] > hole[0] ? -1 : 1, walk: q * 30 + i });
        if (i % 3 === 0 && t < tE) { c.fillStyle = '#f2dcae'; c.beginPath(); c.arc(x + (from[0] > hole[0] ? -1 : 1) * 105 * s, y - 60 * s, 12 * s, 0, 6.283); c.fill(); } c.restore(); }
      boulder(c, 720, 1170, 300, 90, '#a8784a', 6);
      const rear = ease(seg(t, tC - 0.3, tC + 0.4)) * (1 - 0.4 * ease(seg(t, d - 2, d)));
      ant(c, 730, 1084, 1.3, t, { dir: -1, rear, alert: rear });
      soundRings(c, 640, 930, t, tC, 1, 5); soundRings(c, 640, 930, t, tE, 0.8, 5); soundRings(c, 640, 930, t, tX - 0.4, 0.8, 5);
      // the shadow of the marching army sweeps over the valley
      if (dark > 0) { const sxs = lerp(1500, 300, ease(dark)); const sg = c.createLinearGradient(sxs - 500, 0, sxs + 300, 0); sg.addColorStop(0, 'rgba(20,10,6,0)'); sg.addColorStop(0.5, `rgba(20,10,6,${0.45 * dark})`); sg.addColorStop(1, `rgba(20,10,6,${0.5 * dark})`);
        c.fillStyle = sg; c.save(); c.beginPath(); c.rect(-400, 940, W + 800, 1400); c.clip(); c.fillRect(sxs - 500, 900, 2400, 1600); c.restore();
        for (let k = 0; k < 3; k++) { const ph = (t * 1.6 + k / 3) % 1; dustCloud(c, t, 200 + k * 300, 400 + k * 300, 1250, 120 * ph, '#e8c8a0', 0.3 * (1 - ph) * dark, k + 9); } }
      blurLayer(c, 12, cc => { boulder(cc, 100, 2000, 520, 280, '#5a3820', 3); boulder(cc, 1000, 1980, 440, 240, '#6a4426', 8); }, 2);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'يَا أَيُّهَا النَّمْلُ ادْخُلُوا مَسَاكِنَكُمْ', t, tC - 0.1, tX - 0.4, 290, 86);
      arabicCaption(c, 'لَا يَحْطِمَنَّكُمْ سُلَيْمَانُ وَجُنُودُهُ', t, tX - 0.2, d + 1, 290, 90);
      caption(c, 'An-Naml, 18', 400, seg(t, tC + 0.4, tC + 1.0) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 6. "He smiled, amused at her words, and said: My Lord, inspire me to be grateful for Your favour" (An-Naml 19)
  smile: {
    grade: 'rgba(255,200,140,0.16)',
    draw(c, t, d) {
      const tS = at('smile', 'sourit', 0, 0.9), tP = at('smile', 'pria', 0, 2.8), tR = at('smile', 'remercier', 0, 5.6);
      const stop = ease(seg(t, tS - 0.3, tS + 0.4)) * (1 - ease(seg(t, tP - 0.3, tP + 0.2))), kneel = t > tP, warm = ramp(t, tS - 0.2, 0.8), holy = ramp(t, tR - 0.6, 1.4);
      cam(c, 1.04 + 0.08 * ease(t / d), lerp(560, 500, ease(t / d)), 1120);
      sky(c, [[0, '#4a72a8'], [0.35, '#c0c8c4'], [0.5, '#f4d8a8']]);
      sun(c, 880, 760, 60, '#fff2d0', 0.85);
      blurLayer(c, 6, cc => { ridge(cc, 960, 60, 0.004, 3, '#b8a08a'); haze(cc, 980, 160, '#f4d8a8', 0.5);
        for (let i = 0; i < 9; i++) { const x = 620 + i * 120; fig(cc, FOLK[(i + 3) % FOLK.length], { x, y: 1120 - (i % 2) * 18, h: 300, dir: -1, light: 0.8, t: t + i }); if (i % 3 === 0) spearOf(cc, { x, y: 1120 - (i % 2) * 18, h: 300, dir: -1 }); }
        banner(cc, 1020, 1130, 0.7, t, '#8a2a22', 1); banner(cc, 700, 1110, 0.6, t, '#2a4a8a', 2);
        cc.fillStyle = '#c99660'; cc.fillRect(-400, 1100, W + 800, 300); });
      const g = c.createLinearGradient(0, 1120, 0, 1900); g.addColorStop(0, 'rgba(201,150,96,0)'); g.addColorStop(0.12, '#c99660'); g.addColorStop(1, '#7a4e2a'); c.fillStyle = g; c.fillRect(-400, 1120, W + 800, 1100);
      grains(c, 1180, 1900, 300, 23);
      if (holy > 0) lightFromAbove(c, t, 330, holy * 0.6, 360);
      const so = { x: 330, y: 1340, h: 540, dir: 1, armUp: 0.55 * stop, pose: kneel ? 'kneel' : 'stand', dua: kneel, light: 1, t, wind: 0.35 };
      fig(c, SUL, so);
      if (warm > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const [hx, hy] = headOf(so); glow(c, hx, hy, 300, '#fff0d0', 0.18 * warm); c.restore(); }
      // the ants file safely into their home in front of him
      antHill(c, 860, 1390, 0.7, 9);
      for (let i = 0; i < 8; i++) { const q = clamp(-0.4 + i * 0.16 + t * 0.07); if (q <= 0 || q >= 1) continue; const x = lerp(1200, 864, q), y = lerp(1420, 1318, q), s = 0.3 * (1 - 0.4 * seg(q, 0.85, 1));
        c.save(); c.globalAlpha = 1 - seg(q, 0.92, 1); ant(c, x, y, s, t + i, { dir: -1, walk: (1200 - x) / (110 * s) }); c.restore(); }
      blurred(c, 9, () => { shrub(c, 1000, 2000, 4, '#3a3020', t, 7); });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'فَتَبَسَّمَ ضَاحِكًا مِّن قَوْلِهَا', t, tS - 0.2, tP - 0.3, 290, 100);
      arabicCaption(c, 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ', t, tP - 0.1, d + 1, 290, 90);
      caption(c, 'An-Naml, 19', 400, seg(t, tP + 0.4, tP + 1.0) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 7. "He reviewed the birds and said: why do I not see the hoopoe?" (An-Naml 20)
  hoopoe: {
    grade: 'rgba(255,210,160,0.14)',
    draw(c, t, d) {
      const tR = at('hoopoe', 'revue', 0, 1.2), tQ = at('hoopoe', 'Pourquoi', 0, 3.2), tH = at('hoopoe', 'huppe', 0, 5.4);
      const pan = ease(seg(t, 0.2, tH - 0.1)), push = ease(seg(t, tH - 0.5, tH + 0.8)), cx = lerp(420, 1450, pan) + 250 * push;
      sky0(c, [[0, '#3a6aa8'], [0.4, '#a8c8e0'], [0.55, '#f2e2c4']]);
      cam(c, 1.05 + 0.3 * push, cx, lerp(1080, 1040, push));
      perchSet(c, t, cx);
      if (push > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, EMPTY, 1060, 220, '#fff0c8', 0.35 * push); c.restore();
        c.strokeStyle = `rgba(255,240,200,${0.7 * push})`; c.lineWidth = 3; c.setLineDash([10, 10]); c.beginPath(); c.ellipse(EMPTY, 1050, 80, 90, 0, 0, 6.283); c.stroke(); c.setLineDash([]); }
      const sx = 200 + pan * 1000;
      fig(c, SUL, { x: sx, y: 1400, h: 500, dir: 1, walk: pan > 0 && pan < 1 ? stepOf(pan * 1000, 500) : null, reach: 0.6 * ramp(t, tQ - 0.3, 0.5), light: 1, t, wind: 0.3 });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'وَتَفَقَّدَ الطَّيْرَ', t, tR - 0.2, tQ - 0.3, 290, 110);
      arabicCaption(c, 'مَا لِيَ لَا أَرَى الْهُدْهُدَ', t, tQ - 0.1, d + 1, 290, 100);
    },
  },

  // 8. The hoopoe returns: "I bring you sure news from Saba... a queen with a mighty throne; they prostrate to the sun" (An-Naml 22-24)
  saba: {
    grade: 'rgba(255,190,130,0.16)',
    draw(c, t, d) {
      const tV = at('saba', 'revint', 0, 0.8), tS = at('saba', 'Saba', 0, 2.4), tT = at('saba', 'trône', 0, 5.0), tP = at('saba', 'peuple', 0, 6.6), tSo = at('saba', 'soleil', 0, 8.6);
      phases(c, t, tS - 0.5, 0.6, cc => {
        sky0(cc, [[0, '#3a6aa8'], [0.4, '#a8c8e0'], [0.55, '#f2e2c4']]);
        const cx = 1650 + 20 * t; cam(cc, 1.3, cx, 1040);
        perchSet(cc, t, cx);
        fig(cc, SUL, { x: 1300, y: 1400, h: 500, dir: 1, reach: 0.4, light: 1, t, wind: 0.3 });
        const ex = EMPTY, k = ease(seg(t, 0, tV + 0.5));
        if (k < 1) hoopoe(cc, lerp(2500, ex, k), lerp(700, 1080, k) - Math.sin(k * Math.PI) * 80, 1.6, t, { fly: true, dir: -1 });
        else hoopoe(cc, ex, 1120, 1.6, t, { dir: -1, crest: ramp(t, tV + 0.6, 0.4) });
      }, cc => {
        // the land of Saba: mountains, terraces, tower houses, the queen on her throne; the people bow to the sun
        const back = ease(seg(t, tP - 0.4, tP + 1.4)), push = ease(seg(t, tS, tT + 0.6)) * (1 - back);
        cam(cc, 1.0 + 0.55 * push + 0.0 * back, lerp(540, 700, push), lerp(1060, 980, push) + 80 * back);
        const sunY = lerp(900, 540, ease(seg(t, tP - 0.5, tSo + 1)));
        sky(cc, [[0, '#2a3a6a'], [0.32, '#c08a8a'], [0.47, '#ffc890'], [0.53, '#ffe0b0']]);
        cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, 220, sunY, 600, '#ffc070', 0.45); rays(cc, 220, sunY, -Math.PI / 2, 2.6, 1400, 14, '#ffe0a0', 0.05 * ramp(t, tSo - 0.4, 1), t, 5); cc.restore();
        sun(cc, 220, sunY, 64, '#fff0c0', 0.95);
        ridge(cc, 960, 220, 0.003, 11, '#7a5a6a'); ridge(cc, 1000, 140, 0.004, 13, '#9a6a5a');
        cc.strokeStyle = 'rgba(60,30,20,0.25)'; cc.lineWidth = 3; for (let k = 0; k < 8; k++) { cc.beginPath(); for (let x = -200; x < W + 200; x += 20) { const v = ridgeY(x, 1000, 140, 0.004, 13) + 18 + k * 16; x === -200 ? cc.moveTo(x, v) : cc.lineTo(x, v); } cc.stroke(); } // terraces
        ridge(cc, 1080, 60, 0.004, 15, '#a8745a');
        [[60, 1080, 80, 220], [170, 1070, 70, 180], [880, 1060, 90, 260], [990, 1080, 70, 200]].forEach(([x, y, w, h], k) => towerHouse(cc, x, y, w, h, '#a86a48', k + 3, t));
        // the palace with its open hall
        const px = 560, py = 1100; cc.fillStyle = '#b87a52'; cc.fillRect(px - 260, py - 380, 520, 380); cc.fillStyle = '#f4efe2'; cc.fillRect(px - 270, py - 392, 540, 14);
        for (let k = 0; k < 7; k++) cc.fillRect(px - 260 + k * 80, py - 410, 40, 20);
        cc.save(); archPath(cc, px, py - 10, 280, 330); cc.fillStyle = '#3a1a14'; cc.fill(); cc.clip(); cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, px, py - 160, 260, '#ffb060', 0.35); cc.restore();
        throne(cc, px, py - 12, 0.5, t, { glow: 0.4, shine: 0.6 }); fig(cc, QUEEN, { x: px, y: py - 72, h: 150, dir: 1, pose: 'sit', light: 0.9, t, shadow: false }); cc.restore();
        cc.strokeStyle = '#f4efe2'; cc.lineWidth = 6; cc.beginPath(); archPath(cc, px, py - 10, 280, 330); cc.stroke();
        towerHouse(cc, px - 330, py, 110, 460, '#9a5e40', 11, t); towerHouse(cc, px + 330, py, 110, 420, '#9a5e40', 12, t);
        // the plain where the people bow toward the rising sun
        const pg = cc.createLinearGradient(0, 1100, 0, 1900); pg.addColorStop(0, '#c08a5a'); pg.addColorStop(1, '#6a3e22'); cc.fillStyle = pg; cc.fillRect(-400, 1100, W + 800, 1100);
        if (t > tP - 0.6) { const bow = ease(seg(t, tSo - 0.6, tSo + 0.4));
          for (let i = 0; i < 9; i++) { const x = 80 + i * 120 + (i % 2) * 30, y = 1300 + (i % 3) * 40; fig(cc, SABA[i % 3], { x, y, h: 190, dir: -1, pose: bow > 0.5 ? 'prostrate' : 'stand', light: 0.75, t: t + i, ink: 0.6 }); } }
        blurred(cc, 9, () => { boulder(cc, 140, 2000, 500, 280, '#4a2a1a', 3); });
      });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'وَجِئْتُكَ مِن سَبَإٍ بِنَبَإٍ يَقِينٍ', t, tV - 0.2, tT - 0.4, 290, 90);
      arabicCaption(c, 'وَلَهَا عَرْشٌ عَظِيمٌ', t, tT - 0.2, tSo - 0.6, 290, 110);
      arabicCaption(c, 'يَسْجُدُونَ لِلشَّمْسِ', t, tSo - 0.4, d + 1, 290, 110);
    },
  },

  // 9. The letter: "It is from Sulayman, and it is: In the name of Allah, the Most Gracious, the Most Merciful.
  //    Do not exalt yourselves against me, and come to me in submission" (An-Naml 30-31)
  letter: {
    grade: 'rgba(255,200,140,0.16)',
    draw(c, t, d) {
      const tL = at('letter', 'lettre', 0, 2.4), tN = at('letter', 'nom', 0, 3.6), tV = at('letter', 'Venez', 0, 8.6);
      phases(c, t, tN - 0.5, 0.6, cc => {
        const off = ease(seg(t, tL - 0.1, tN)), tilt = off;
        cam(cc, 1.1, lerp(560, 760, tilt), lerp(1080, 820, tilt));
        sky(cc, [[0, '#2a5a98'], [0.35, '#9ac0dc'], [0.55, '#f2e0c0']]);
        wisps(cc, t, 300, 9, '#ffffff', 0.35, 13, 10);
        sunsetCity(cc, t, { far: '#90a0b8', haze: '#eee2cc', stone: '#e4cca8', valley: '#a8a078' });
        terrace(cc, 1400, '#d8bc94');
        const so = { x: 340, y: 1400, h: 520, dir: 1, reach: 0.85 * (1 - 0.6 * off), light: 1, t, wind: 0.35 };
        fig(cc, SUL, so); const [hx, hy] = handOf(so);
        cc.fillStyle = '#4a2e1a'; cc.fillRect(600, 1060, 16, 340); cc.fillStyle = GOLD; cc.fillRect(570, 1052, 76, 12);
        if (off <= 0) { scroll(cc, hx + 20, hy - 6, 0.1, 0, t); hoopoe(cc, 608, 1052, 1.0, t, { dir: -1, crest: 0.6 }); }
        else { const fx = lerp(608, 1400, easeIn(off)), fy = lerp(1000, 300, off) - Math.sin(off * Math.PI) * 60; hoopoe(cc, fx, fy, 1.0, t, { fly: true, dir: 1, letter: true }); }
      }, cc => {
        // the letter, opened in the queen's hall
        const q = t - tN + 0.5;
        cam(cc, 1.0 + 0.02 * q, W / 2, 1000);
        const g = cc.createRadialGradient(540, 900, 50, 540, 1000, 1300); g.addColorStop(0, '#6a1e24'); g.addColorStop(1, '#1a0608'); cc.fillStyle = g; cc.fillRect(-300, -300, W + 600, H + 600);
        cc.save(); cc.beginPath(); cc.rect(-300, -300, W + 600, H + 600); cc.clip(); lattice(cc, -300, -300, W + 600, H + 600, '#e0b85a', 0.06, 60); cc.restore();
        cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, 540, 860, 640, '#ffd890', 0.3 * ramp(t, tN, 1.2)); cc.restore();
        scroll(cc, 540, 860, 1.25, seg(t, tN - 0.3, tN + 1.2), t, { l2: ramp(t, tV - 0.3, 0.7) });
        sparkle(cc, t, 540, 860, 18, 420, 7, 0.5 * ramp(t, tN, 1));
      });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'اذْهَب بِّكِتَابِي هَٰذَا', t, tL - 0.2, tN - 0.4, 290, 110);
      caption(c, 'An-Naml, 30-31', 1290, ramp(t, tN + 0.8, 0.6) * (1 - seg(t, d - 0.5, d)), 36, '#f6e2b8');
    },
  },

  // 10. "Which of you will bring me her throne?" — "one who had knowledge of the Book": "I will bring it before your glance returns to you" (An-Naml 38-40)
  throne: {
    grade: 'rgba(255,190,120,0.16)',
    draw(c, t, d) {
      const tD = at('throne', 'demanda', 0, 0.5), tA = at('throne', 'apportera', 0, 2.0), tC = at('throne', 'Celui', 0, 3.8), tAp = at('throne', 'apporterai', 0, 6.6), tCl = at('throne', 'cligné', 0, d - 2.0);
      const push = ease(seg(t, tAp - 0.5, d)), shut = ease(seg(t, tCl + 0.3, d - 0.15));
      cam(c, 1.0 + 0.25 * push, lerp(540, 560, push), lerp(1000, 940, push));
      hall(c, t, { fy: 1180 });
      c.save(); c.globalCompositeOperation = 'lighter'; const lg = c.createLinearGradient(0, 200, 0, 1200); lg.addColorStop(0, `rgba(255,230,180,${0.16 + 0.12 * push})`); lg.addColorStop(1, 'rgba(255,230,180,0)');
      c.fillStyle = lg; c.beginPath(); c.moveTo(480, 200); c.lineTo(640, 200); c.lineTo(760, 1200); c.lineTo(360, 1200); c.closePath(); c.fill(); c.restore();
      for (let k = 0; k < 2; k++) { c.fillStyle = mix('#c8a070', '#5a3a20', k * 0.3); c.fillRect(380 + k * 30, 1150 + k * 20, 360 - k * 60, 30 - k * 10); } // empty dais
      COURT.forEach((who, i) => fig(c, who, { x: 820 + i * 90, y: 1250 + (i % 2) * 30, h: 400, dir: -1, light: 0.85, t: t + i }));
      const sw = ease(seg(t, tC - 0.4, tC + 1.2)), sgx = lerp(1200, 720, sw);
      const sage = { x: sgx, y: 1330, h: 440, dir: -1, walk: sw > 0 && sw < 1 ? stepOf(1200 - sgx, 440) : null, reach: 0.6 * ramp(t, tAp - 0.4, 0.5), light: 0.95, t };
      fig(c, SAGE, sage); const [bx, by] = handOf(sage); book(c, bx - 10, by + 10, 1.2);
      const so = { x: 280, y: 1350, h: 520, dir: 1, armUp: 0.45 * ramp(t, tD, 0.5) * (1 - ramp(t, tC, 0.6)), light: 1, t };
      fig(c, SUL, so);
      blurred(c, 9, () => { column(c, -40, 2300, 160, 1400, '#a88a64'); column(c, 1130, 2300, 160, 1400, '#a88a64'); });
      blink(c, shut);
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c);
      arabicCaption(c, 'أَيُّكُمْ يَأْتِينِي بِعَرْشِهَا', t, tA - 0.3, tAp - 0.4, 290, 104);
      arabicCaption(c, 'قَبْلَ أَن يَرْتَدَّ إِلَيْكَ طَرْفُكَ', t, tAp - 0.2, tCl + 0.5, 290, 92);
    },
  },

  // 11. The PEAK: the throne is there. "This is from the favour of my Lord, to test me: will I be grateful or ungrateful?" (An-Naml 40)
  miracle: {
    grade: 'rgba(255,200,130,0.18)',
    draw(c, t, d) {
      const tG = at('miracle', 'grâce', 0, 4.5), tRc = at('miracle', 'reconnaissant', 0, 9.0);
      const open = 1 - ease(seg(t, 0.05, 0.8)), flash = Math.exp(-t * 2.2), back = ease(seg(t, 0.6, 4.2)), kneel = t > tG - 0.2;
      cam(c, lerp(1.35, 1.02, back), lerp(560, 540, back), lerp(900, 1040, back));
      hall(c, t, { fy: 1180 });
      c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 560, 820, -Math.PI / 2, 3.2, 1500, 18, '#fff0c0', 0.06 + 0.1 * flash, t, 9); glow(c, 560, 900, 900, '#ffe0a0', 0.2 + 0.5 * flash); c.restore();
      for (let k = 0; k < 2; k++) { c.fillStyle = mix('#c8a070', '#5a3a20', k * 0.3); c.fillRect(380 + k * 30, 1150 + k * 20, 360 - k * 60, 30 - k * 10); }
      throne(c, 560, 1160, 0.95, t, { glow: 0.6 + flash, shine: 1 });
      sparkle(c, t, 560, 900, 40, 520, 3, 0.8);
      COURT.forEach((who, i) => { const x = 820 + i * 90 + 40 * back, y = 1250 + (i % 2) * 30; lean(c, x, y, 0.08 * back, () => fig(c, who, { x, y, h: 400, dir: -1, light: 0.95, t: t + i, pose: t > tG + 0.4 + i * 0.2 ? 'kneel' : 'stand' })); });
      fig(c, SAGE, { x: 760, y: 1330, h: 440, dir: -1, light: 1, t });
      const so = { x: 280, y: 1350, h: 520, dir: 1, pose: kneel ? 'kneel' : 'stand', dua: kneel, light: 1, t };
      fig(c, SUL, so);
      if (kneel) lightFromAbove(c, t, 290, ramp(t, tG - 0.2, 1.2) * 0.55, 300);
      if (flash > 0.02) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(255,248,230,${0.55 * flash})`; c.fillRect(0, 0, W, H); c.restore(); }
      blurred(c, 9, () => { column(c, -40, 2300, 160, 1400, '#a88a64'); column(c, 1130, 2300, 160, 1400, '#a88a64'); });
      blink(c, open);
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c);
      arabicCaption(c, 'فَلَمَّا رَآهُ مُسْتَقِرًّا عِندَهُ', t, 0.9, tG - 0.4, 290, 96);
      arabicCaption(c, 'هَٰذَا مِن فَضْلِ رَبِّي', t, tG - 0.2, tRc - 0.4, 290, 120);
      arabicCaption(c, 'لِيَبْلُوَنِي أَأَشْكُرُ أَمْ أَكْفُرُ', t, tRc - 0.2, d + 1, 290, 96);
    },
  },

  // 12. The palace floored with glass: she thought it deep water — "I submit, with Sulayman, to Allah, Lord of the worlds" (An-Naml 44)
  queen: {
    grade: 'rgba(170,220,255,0.14)',
    draw(c, t, d) {
      const tE = at('queen', 'entra', 0, 0.8), tCr = at('queen', 'cristal', 0, 3.0), tW = at('queen', 'eau', 0, 4.6), tS = at('queen', 'soumets', 0, 7.8);
      const walkK = ease(seg(t, tE - 0.6, tW)), qx = lerp(1250, 720, walkK), kneel = t > tS - 0.1, hes = ramp(t, tW - 0.3, 0.5) * (1 - ramp(t, tS - 0.6, 0.5));
      const down = ease(seg(t, tCr - 0.4, tW + 0.6)) * (1 - ease(seg(t, tS - 1.0, tS + 0.5)));
      cam(c, 1.02 + 0.08 * down, 540, lerp(1040, 1200, down));
      // back wall: white marble, arches open on the sky, slender columns
      const wg = c.createLinearGradient(0, 300, 0, 1150); wg.addColorStop(0, '#c8d8e0'); wg.addColorStop(1, '#f0ece2'); c.fillStyle = wg; c.fillRect(-400, -400, W + 800, 1560);
      for (let i = -1; i < 5; i++) { const ax = 30 + i * 260; c.save(); archPath(c, ax + 130, 1060, 160, 560); c.fillStyle = '#e8eef0'; c.fill(); c.clip();
        const sg = c.createLinearGradient(0, 500, 0, 1060); sg.addColorStop(0, '#5a90c8'); sg.addColorStop(1, '#d8e8f0'); c.fillStyle = sg; c.fillRect(ax, 480, 280, 600); wisps(c, t, 650, 3, '#ffffff', 0.5, i + 3, 6); c.restore();
        c.strokeStyle = '#b8a070'; c.lineWidth = 5; c.beginPath(); archPath(c, ax + 130, 1060, 160, 560); c.stroke(); }
      for (let i = -1; i < 6; i++) column(c, 30 + i * 260, 1160, 46, 760, '#ecebe4', { band: '#c8a860' });
      c.fillStyle = '#d8d0c0'; c.fillRect(-400, 1140, W + 800, 20);
      crystalFloor(c, t, 1160);
      reflect(c, 1160, 0.22, () => { for (let i = -1; i < 6; i++) column(c, 30 + i * 260, 1160, 46, 760, '#ecebe4'); });
      const so = { x: 260, y: 1330, h: 500, dir: 1, dua: kneel, light: 1, t };
      const qo = { x: qx, y: 1330, h: 470, dir: -1, walk: walkK > 0 && walkK < 1 ? stepOf(1250 - qx, 470) : null, reach: 0.5 * hes, pose: kneel ? 'kneel' : 'stand', dua: kneel, light: 0.95, t };
      reflect(c, 1330, 0.25, () => { fig(c, SUL, Object.assign({}, so, { shadow: false, ink: 0 })); fig(c, QUEEN, Object.assign({}, qo, { shadow: false, ink: 0 })); });
      if (hes > 0) for (let k = 0; k < 3; k++) { const ph = (t * 0.6 + k / 3) % 1; c.strokeStyle = `rgba(230,250,255,${0.5 * hes * (1 - ph)})`; c.lineWidth = 2.5; c.beginPath(); c.ellipse(qx - 60, 1340, 60 + ph * 220, 10 + ph * 34, 0, 0, 6.283); c.stroke(); }
      fig(c, SUL, so); fig(c, QUEEN, qo);
      fig(c, Object.assign({}, QUEEN, { robe: '#3a2a4a' }), { x: Math.max(qx + 210, 960), y: 1300, h: 420, dir: -1, walk: walkK > 0 && walkK < 1 ? stepOf(1250 - qx, 420) + 0.5 : null, light: 0.9, t, pose: t > tS + 0.4 ? 'kneel' : 'stand' });
      if (kneel) { lightFromAbove(c, t, 600, ramp(t, tS, 1.4) * 0.5, 520); sparkle(c, t, 500, 1100, 20, 400, 5, 0.5 * ramp(t, tS, 1)); }
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 0.9);
      arabicCaption(c, 'صَرْحٌ مُّمَرَّدٌ مِّن قَوَارِيرَ', t, tCr - 0.2, tS - 0.5, 290, 100);
      arabicCaption(c, 'أَسْلَمْتُ مَعَ سُلَيْمَانَ لِلَّهِ رَبِّ الْعَالَمِينَ', t, tS - 0.2, d + 1, 290, 74);
      caption(c, 'An-Naml, 44', 390, seg(t, tS + 0.5, tS + 1.1) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 13. The lesson: gratitude (An-Naml 40: "whoever is grateful is grateful for his own good")
  lesson: {
    grade: 'rgba(255,190,130,0.18)',
    draw(c, t, d) {
      const tV = at('lesson', 'vent', 0, 0.4), tO = at('lesson', 'oiseaux', 0, 1.2), tR = at('lesson', 'royaume', 0, 2.2), tM = at('lesson', 'merci', 0, 5.0), tG = at('lesson', 'grandeur', 0, 7.0);
      const gust = ramp(t, tV - 0.1, 0.5) * (1 - ramp(t, tM - 0.8, 1.0)), lit = ramp(t, tR - 0.2, 0.8), pros = t > tM - 0.1, rise = ease(t / d);
      cam(c, 1.0 + 0.1 * rise, 540, lerp(1120, 1040, rise));
      sky(c, [[0, '#3a3a6a'], [0.3, '#c07a7a'], [0.45, '#ffb880'], [0.52, '#ffe0b0']]);
      sun(c, 540, 960, 90, '#fff2d0', 0.95);
      c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 540, 960, -Math.PI / 2, 2.8, 1400, 14, '#ffe8c0', 0.05 + 0.07 * ramp(t, tM, 1.5), t, 13); c.restore();
      wisps(c, t * (1 + gust * 5), 520, 8, '#ffd8c0', 0.25, 23, 6);
      sunsetCity(c, t, { far: '#7a5a7a', haze: '#f0a880', stone: '#d8a07a', valley: '#8a5a48' });
      if (lit > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, 900, 700, '#ffc890', 0.25 * lit); c.restore(); }
      fgRidge(c, 1320, 30, 0.004, 31, '#8a6044', { rim: 'rgba(255,220,170,0.7)' });
      const k = ramp(t, tO - 0.6, 1.5);
      for (let i = 0; i < 12; i++) { const ang = t * 0.7 + i * 0.52, rad = lerp(800, 330, k), bx = 540 + Math.cos(ang) * rad * 1.3, by = 700 + Math.sin(ang) * rad * 0.3; bird(c, bx, by, 1.3, t, i, '#3a2228'); }
      const so = { x: 520, y: ridgeY(520, 1320, 30, 0.004, 31) + 12, h: 520, dir: 1, pose: pros ? 'prostrate' : 'stand', armUp: pros ? 0 : 0.3 * lit, light: 1, t, wind: 0.4 + gust };
      fig(c, SUL, so);
      if (pros) lightFromAbove(c, t, 560, ramp(t, tM, 1.6) * 0.5, 380);
      windStreaks(c, t, gust * 0.7, 7, 300, 1400); leaves(c, t, gust * 0.8, 11);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'وَمَن شَكَرَ فَإِنَّمَا يَشْكُرُ لِنَفْسِهِ', t, tM - 0.2, d + 1, 290, 88);
      caption(c, 'An-Naml, 40', 390, seg(t, tM + 0.6, tM + 1.2) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 14. Call to action, on the hero image (continuous with the outro and the hook)
  cta: {
    grade: 'rgba(255,190,130,0.14)',
    draw(c, t, d) {
      const od = ((window.TL.scenes || []).find(s => s.id === 'outro') || { dur: 3 }).dur, T = t - d - od;
      heroShot(c, T, { rear: ctaRear(T) });
      c.fillStyle = 'rgba(6,8,18,0.25)'; c.fillRect(0, 0, W, H);
      ctaText(c, seg(t, 0.1, 0.6));
    },
  },
  outro: {
    grade: 'rgba(255,190,130,0.14)',
    draw(c, t, d) {
      const T = t - d;
      heroShot(c, T, { rear: ctaRear(T) });
      const k = 1 - seg(t, d - 1.4, d - 0.6); // the overlay goes away: the last frame is the first frame
      c.fillStyle = `rgba(6,8,18,${0.25 * k})`; c.fillRect(0, 0, W, H);
      ctaText(c, k);
      const a = seg(t, d - 1.0, d - 0.15);
      seriesTag(c, a);
      c.save(); c.direction = 'rtl'; textGlow(c, 'قَالَتْ نَمْلَةٌ', W / 2, 300, '700 130px Amiri', '#f6c453', a, '#ffb300', 30); c.restore();
    },
  },

  // cover for TikTok (not in the timeline: rendered by tools/cover.js)
  cover: {
    draw(c) {
      heroShot(c, 1.9, { rear: 1, alert: 0.6, ringT: 0.4 });
      const g = c.createLinearGradient(0, 0, 0, 760); g.addColorStop(0, 'rgba(6,8,18,0.78)'); g.addColorStop(1, 'rgba(6,8,18,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 760);
      seriesTag(c, 1);
      textGlow(c, 'UNE FOURMI', W / 2, 290, '700 132px Lora', '#fff6e0', 1, '#000', 24);
      textGlow(c, 'A PARLÉ', W / 2, 430, '700 132px Lora', '#f6c453', 1, '#000', 24);
      textGlow(c, '…et un prophète l\'a entendue', W / 2, 540, 'italic 500 50px Lora', '#fff3dc', 1, '#000', 14);
      const g2 = c.createLinearGradient(0, 1420, 0, H); g2.addColorStop(0, 'rgba(6,8,18,0)'); g2.addColorStop(1, 'rgba(6,8,18,0.7)'); c.fillStyle = g2; c.fillRect(0, 1420, W, 500);
      c.save(); c.direction = 'rtl'; textGlow(c, 'سُلَيْمَان', W / 2, 1640, '700 150px Amiri', '#f6c453', 1, '#ffb300', 34); c.restore();
      textGlow(c, 'Soulayman (Salomon), paix sur lui', W / 2, 1780, 'italic 500 48px Lora', '#fff3dc', 1, '#000', 14);
    },
  },
};
function ctaRear(T) { return ease(seg(T, -8.6, -7.9)) * (1 - ease(seg(T, -2.4, -1.4))); }
