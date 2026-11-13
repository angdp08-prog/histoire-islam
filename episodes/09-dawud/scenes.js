// Episode 9 — Dawud (David, alayhi salam): Talut chosen as king, the river test, the small band of believers against
// Jalut and his host, the stone that brought the giant down, then the mountains and the birds glorifying with him,
// iron made soft, the Zabur (Al-Baqara 246-251; Saba 10-11; Sad 17-20; Al-Anbiya 79-80; An-Nisa 163).
// Visual rules: the prophets are shown only as silhouettes in white, faces entirely hidden by a veil of white light
// (prophet: true); everyone else is faceless (Jalut's head stays inside his helmet's shadow). Allah is never depicted:
// only light and calligraphy. The fall of Jalut is shown without violence (a stone, a flash, a fall in a cloud of dust).
// Events are synced to the narration with at(scene, word). The last frame (outro) is the first frame (hook): the video loops.
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

function seriesTag(c, a, ep = 9) { textGlow(c, `LES PROPHÈTES  ·  ÉPISODE ${ep}`, W / 2, 112, '600 32px Lora', '#fbe7c6', a * 0.92, '#000000', 12); }
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

// ---------- episode 9: characters
const DAW = { veilGlow: 0.55, prophet: true, robe: '#ece6d8', wrap: '#f7f3ea', skin: '#c49470', trim: '#cfae6a', band: '#b8954a', inner: '#fbf8f0' };
const NABI = { veilGlow: 0.5, prophet: true, robe: '#e2dacb', wrap: '#f2ede2', skin: '#b88a66', trim: '#b8a070', band: '#a08a5a', inner: '#f6f2ea' };
const TALUT = { robe: '#3a2a5a', wrap: '#e8dcc4', skin: '#a8714f', trim: GOLD, band: GOLD, inner: '#e8e0cc' };
const ENEMY = { robe: '#2e2a2c', wrap: '#3a3438', skin: '#5a4034', trim: '#6a5a4a', band: '#4a3a2a', inner: '#4a4440' };
const FOE = [{ robe: '#3a2a26', wrap: '#4a3e38', skin: '#6a4a3a', trim: '#7a5a3a' }, { robe: '#2a2a30', wrap: '#5a5048', skin: '#5a4034', trim: '#6a6a70' },
  { robe: '#4a2a1e', wrap: '#3a3430', skin: '#6a4a3a', trim: '#8a6a3a' }];
const BELIEVERS = [SOLDIER, FOLK[0], { robe: '#5a4a32', wrap: '#e8dcc4', skin: '#a8714f', trim: '#b89a62' }, FOLK[1], FOLK[4], FOLK[7], FOLK[2], FOLK[5]];

// Jalut: a huge armoured warrior; the head stays in the shadow of a crested helmet (no face). fall: 0 standing -> 1 lying.
function giant(c, o) {
  const { x, y, h = 800, dir = -1, t = 0, walk = null, fall = 0, light = 0.8, glint = 0 } = o, s = h / 300;
  const ang = -dir * 1.42 * Math.pow(clamp(fall), 2.2);
  lean(c, x, y, ang, () => {
    // the long spear, held upright on the near side
    c.strokeStyle = '#2a1a10'; c.lineWidth = 9 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + dir * 44 * s, y + 8 * s); c.lineTo(x + dir * 66 * s, y - 470 * s); c.stroke();
    c.fillStyle = '#8a8a90'; c.beginPath(); c.moveTo(x + dir * 68 * s, y - 540 * s); c.lineTo(x + dir * 80 * s, y - 466 * s); c.lineTo(x + dir * 56 * s, y - 466 * s); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,240,210,0.5)'; c.lineWidth = 2 * s; c.beginPath(); c.moveTo(x + dir * 68 * s, y - 532 * s); c.lineTo(x + dir * 70 * s, y - 470 * s); c.stroke();
    fig(c, ENEMY, { x, y, h, dir, walk, t, light, hood: false, agal: false, wind: 0.15 });
    c.save(); c.translate(x, y + (walk !== null ? -Math.abs(Math.sin(walk * Math.PI * 2)) * 3 * s : 0)); c.scale(dir * s, s);
    // scale cuirass, belt, leather strips
    const mg = c.createLinearGradient(-44, 0, 48, 0); mg.addColorStop(0, '#2a2a30'); mg.addColorStop(0.55, '#5a5a62'); mg.addColorStop(1, mix('#7a7a82', '#ffe0b0', 0.2 * light));
    c.fillStyle = mg; c.beginPath(); c.moveTo(-40, -236); c.quadraticCurveTo(2, -250, 42, -236); c.lineTo(48, -150); c.quadraticCurveTo(2, -138, -46, -150); c.closePath(); c.fill();
    c.strokeStyle = '#141216'; c.lineWidth = 2.5; c.stroke();
    c.save(); c.clip();
    for (let r = 0; r < 9; r++) for (let k = -4; k < 5; k++) { const lx = k * 12 + (r % 2) * 6, ly = -232 + r * 10;
      c.strokeStyle = 'rgba(210,205,200,0.35)'; c.lineWidth = 1.6; c.beginPath(); c.arc(lx, ly, 6.5, 0.15, Math.PI - 0.15); c.stroke();
      c.strokeStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.arc(lx, ly + 2, 6.5, 0.3, Math.PI - 0.3); c.stroke(); }
    c.restore();
    c.fillStyle = '#3a2416'; c.fillRect(-46, -152, 94, 13); c.fillStyle = '#8a7a5a'; c.fillRect(-4, -151, 12, 11);
    for (let k = -4; k < 5; k++) { c.fillStyle = k % 2 ? '#4a3020' : '#3a2416'; c.fillRect(k * 11 - 4, -139, 9, 48); c.fillStyle = '#7a7a80'; c.fillRect(k * 11 - 3, -97, 7, 5); }
    // greaves on the shins
    c.fillStyle = '#4a4a50'; c.fillRect(-26, -40, 18, 30); c.fillRect(12, -40, 18, 30);
    // crested helmet: dome, cheek and neck guards, nasal bar; the face stays a dark hollow
    const hy = -268;
    c.fillStyle = '#7a1c1c'; c.beginPath(); c.moveTo(-26, hy - 22); c.quadraticCurveTo(-4, hy - 62, 30, hy - 26); c.quadraticCurveTo(0, hy - 40, -26, hy - 22); c.fill();
    c.strokeStyle = '#4a0e0e'; c.lineWidth = 1.5; for (let k = 0; k < 7; k++) { c.beginPath(); c.moveTo(-20 + k * 7, hy - 28); c.lineTo(-24 + k * 8, hy - 48 + Math.abs(k - 3) * 4); c.stroke(); }
    const hg = c.createLinearGradient(-26, 0, 30, 0); hg.addColorStop(0, '#2a2a30'); hg.addColorStop(0.6, '#6a6a72'); hg.addColorStop(1, mix('#9a9aa2', '#ffe0b0', 0.25 * light));
    c.fillStyle = hg; c.beginPath(); c.ellipse(2, hy - 6, 27, 25, 0, Math.PI, 0); c.lineTo(29, hy + 2); c.lineTo(-25, hy + 2); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(-25, hy - 4); c.lineTo(-29, hy + 30); c.lineTo(-8, hy + 32); c.lineTo(-6, hy); c.closePath(); c.fill(); // neck guard
    c.beginPath(); c.moveTo(26, hy - 2); c.lineTo(27, hy + 18); c.lineTo(17, hy + 28); c.lineTo(13, hy + 4); c.closePath(); c.fill(); // cheek guard
    c.fillRect(15, hy - 14, 5, 26); // nasal bar
    c.strokeStyle = '#141216'; c.lineWidth = 2; c.beginPath(); c.ellipse(2, hy - 6, 27, 25, 0, Math.PI, 0); c.stroke();
    c.fillStyle = '#b8954a'; c.fillRect(-26, hy - 2, 55, 4);
    // big round shield on the far arm
    const sg = c.createRadialGradient(-40, -168, 4, -30, -150, 70); sg.addColorStop(0, '#c09a5a'); sg.addColorStop(0.7, '#6a4a22'); sg.addColorStop(1, '#3a2410');
    c.fillStyle = sg; c.beginPath(); c.ellipse(-30, -150, 42, 66, 0, 0, 6.283); c.fill(); c.strokeStyle = '#d4b26a'; c.lineWidth = 4; c.stroke();
    c.strokeStyle = 'rgba(40,24,10,0.6)'; c.lineWidth = 2; c.beginPath(); c.ellipse(-30, -150, 32, 52, 0, 0, 6.283); c.stroke();
    c.fillStyle = '#d4b26a'; c.beginPath(); c.ellipse(-30, -150, 10, 14, 0, 0, 6.283); c.fill();
    c.restore();
    if (glint > 0) star4(c, x + dir * 10 * s, y - 296 * s, 22 * s * 0.6, '#fff6dc', glint);
  });
}
function giantHead(o) { const s = o.h / 300; return [o.x + (o.dir || -1) * 4 * s, o.y - 272 * s]; }

// Dawud's sling: whirling over his head (spin), or hanging empty after the throw
function slingFx(c, hx, hy, s, t, o = {}) {
  const R = 64 * s;
  c.save(); c.lineCap = 'round';
  if (!o.released) {
    const sq = o.tilt || 0.38, a = t * (8 + 10 * (o.spin || 0)), px = hx + Math.cos(a) * R, py = hy - 6 * s + Math.sin(a) * R * sq;
    for (let k = 0; k < 6; k++) { c.strokeStyle = `rgba(255,240,210,${0.32 * (o.spin || 0) * (1 - k / 6)})`; c.lineWidth = (5 - k * 0.6) * s; c.beginPath(); c.ellipse(hx, hy - 6 * s, R, R * sq, 0, a - 0.35 * (k + 1), a - 0.35 * k); c.stroke(); } // motion arc
    c.strokeStyle = '#4a3020'; c.lineWidth = 2.2 * s; c.beginPath(); c.moveTo(hx, hy); c.lineTo(px - 4 * s, py); c.moveTo(hx, hy); c.lineTo(px + 4 * s, py + 2 * s); c.stroke();
    c.fillStyle = '#5a3a22'; c.beginPath(); c.ellipse(px, py, 9 * s, 6 * s, a, 0, 6.283); c.fill();
    c.fillStyle = '#9a948a'; c.beginPath(); c.arc(px, py - 2 * s, 4.5 * s, 0, 6.283); c.fill();
  } else {
    const sw = Math.sin(t * 5) * 6 * s;
    c.strokeStyle = '#4a3020'; c.lineWidth = 2.2 * s; c.beginPath(); c.moveTo(hx, hy); c.quadraticCurveTo(hx + 10 * s + sw, hy + R * 0.5, hx + 6 * s + sw * 1.5, hy + R); c.stroke();
    c.fillStyle = '#5a3a22'; c.beginPath(); c.ellipse(hx + 6 * s + sw * 1.5, hy + R + 4 * s, 7 * s, 5 * s, 0, 0, 6.283); c.fill();
  }
  c.restore();
}
function stoneFx(c, x0, y0, x1, y1, q, s = 1) { // the stone in flight with a bright trail
  if (q <= 0 || q >= 1) return;
  const P = k => [lerp(x0, x1, k), lerp(y0, y1, k) - Math.sin(k * Math.PI) * 90 * s];
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 14; i++) { const k = Math.max(0, q - i * 0.012), [px, py] = P(k); c.fillStyle = `rgba(255,236,190,${0.5 * (1 - i / 14)})`; c.beginPath(); c.arc(px, py, (7 - i * 0.4) * s, 0, 6.283); c.fill(); }
  const [sx, sy] = P(q); glow(c, sx, sy, 40 * s, '#fff2c8', 0.6); c.restore();
  c.fillStyle = '#8a847a'; c.beginPath(); c.arc(sx, sy, 6 * s, 0, 6.283); c.fill(); c.fillStyle = '#d8d2c6'; c.beginPath(); c.arc(sx - 2 * s, sy - 2 * s, 2.4 * s, 0, 6.283); c.fill();
}
function impact(c, x, y, k, s = 1) { if (k <= 0.01) return; c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y, 260 * s, '#fff0c0', 0.9 * k); star4(c, x, y, 60 * s * k, '#ffffff', k); c.restore(); }

function crown(c, x, y, r, a = 1) { // a simple gold circlet on a head (Talut, the king)
  if (a <= 0) return; c.save(); c.globalAlpha *= a; c.fillStyle = GOLD; c.strokeStyle = '#7a5a1a'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(x - r * 1.05, y - r * 0.85);
  for (let k = 0; k <= 4; k++) { const px = x - r * 1.05 + k * r * 0.525; c.lineTo(px, y - r * (k % 2 ? 1.25 : 1.55)); c.lineTo(px + r * 0.26, y - r * 0.95); }
  c.lineTo(x + r * 1.05, y - r * 0.6); c.lineTo(x - r * 1.05, y - r * 0.6); c.closePath(); c.fill(); c.stroke(); c.restore();
}
function sheep(c, x, y, s, t, dir = 1, o = {}) {
  c.save(); c.translate(x, y); c.scale(s * dir, s);
  const wool = o.col || '#ebe3d2', dk = mix(wool, '#000000', 0.3), gz = o.graze ? 0.5 + 0.5 * Math.sin(t * 0.7 + x * 0.05) : 0;
  c.fillStyle = 'rgba(10,6,4,0.25)'; c.beginPath(); c.ellipse(4, 2, 62, 8, 0, 0, 6.283); c.fill();
  c.strokeStyle = '#2a2018'; c.lineWidth = 7; c.lineCap = 'round'; [-36, -22, 26, 40].forEach(lx => { c.beginPath(); c.moveTo(lx, -40); c.lineTo(lx + 2, 0); c.stroke(); });
  for (let k = 0; k < 10; k++) { const bx = -44 + k * 10, by = -62 + Math.sin(k * 1.7) * 9; const g = c.createRadialGradient(bx - 6, by - 8, 2, bx, by, 24);
    g.addColorStop(0, mix(wool, '#ffffff', 0.4)); g.addColorStop(1, dk); c.fillStyle = g; c.beginPath(); c.arc(bx, by, 22, 0, 6.283); c.fill(); }
  c.save(); c.translate(52, -66); c.rotate(0.15 + gz * 0.9);
  c.fillStyle = '#2a2220'; c.beginPath(); c.ellipse(14, 4, 17, 11, 0.3, 0, 6.283); c.fill(); c.beginPath(); c.ellipse(2, -8, 10, 4, -0.6, 0, 6.283); c.fill();
  c.restore(); c.restore();
}
function plain(c, y, t, o = {}) { // the valley floor: dry grass, ochre and olive, tufts and stones bigger toward the viewer
  const col = o.col || '#a88a58';
  const g = c.createLinearGradient(0, y - 10, 0, H + 300); g.addColorStop(0, mix(col, '#fff0d0', 0.2)); g.addColorStop(0.4, col); g.addColorStop(1, mix(col, '#1a1208', 0.5));
  c.fillStyle = g; c.fillRect(-2400, y, W + 4800, H + 2400);
  const r = rng(o.seed || 5);
  for (let i = 0; i < (o.n || 160); i++) { const yy = y + Math.pow(r(), 1.7) * (H + 300 - y), x = -1500 + r() * (W + 3000), k = (yy - y) / (H - y + 1), sz = 4 + k * 26;
    if (r() < 0.25) { c.fillStyle = hexA(mix(col, '#000000', 0.45), 0.55); c.beginPath(); c.ellipse(x, yy, sz * 0.9, sz * 0.35, 0, 0, 6.283); c.fill(); continue; }
    c.strokeStyle = hexA(r() > 0.5 ? mix(col, '#4a5a20', 0.5) : mix(col, '#fff0c0', 0.2), 0.75); c.lineWidth = 1 + k * 3; c.lineCap = 'round';
    for (let b = -2; b <= 2; b++) { const sw = Math.sin(t * 1.4 + i + b) * sz * 0.2; c.beginPath(); c.moveTo(x + b * sz * 0.2, yy); c.quadraticCurveTo(x + b * sz * 0.35, yy - sz * 0.8, x + b * sz * 0.6 + sw, yy - sz * (1.2 + Math.abs(b) * -0.15)); c.stroke(); } }
}
function echoRidge(c, t, y, amp, freq, seed, a, x0 = 540, speed = 420) { // light pulses running along a crest, outward from x0
  if (a <= 0) return;
  c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
  for (let x = -300; x <= W + 300; x += 14) {
    const d = Math.abs(x - x0); let v = 0;
    for (let k = 0; k < 3; k++) { const front = ((t * speed + k * 520) % 1560); v += Math.exp(-Math.pow((d - front) / 110, 2)); }
    if (v < 0.02) continue;
    const y1 = ridgeY(x, y, amp, freq, seed), y2 = ridgeY(x + 14, y, amp, freq, seed);
    c.strokeStyle = `rgba(255,226,160,${a * Math.min(1, v) * 0.9})`; c.lineWidth = 5; c.beginPath(); c.moveTo(x, y1); c.lineTo(x + 14, y2); c.stroke();
    glow(c, x, y1, 60, '#ffd890', a * v * 0.12);
  }
  c.restore();
}
function lightRings(c, x, y, t, a, n = 4, max = 700) { // soft rings of light spreading from a point (praise answered by the mountains)
  if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter';
  for (let k = 0; k < n; k++) { const ph = (t * 0.35 + k / n) % 1; c.strokeStyle = `rgba(255,230,170,${a * 0.28 * Math.sin(ph * Math.PI)})`; c.lineWidth = 5 - ph * 3.5;
    c.beginPath(); c.ellipse(x, y, ph * max, ph * max * 0.42, 0, 0, 6.283); c.stroke(); }
  c.restore();
}
function circleBirds(c, t, cx, cy, n, rad, k, seed = 5, col = '#2a1e1a') { // birds gathering into a slow circle
  if (k <= 0) return; const r = rng(seed);
  for (let i = 0; i < n; i++) { const ang = t * (0.6 + r() * 0.3) + i * 6.283 / n, rr = lerp(1300, rad * (0.8 + r() * 0.4), ease(k));
    bird(c, cx + Math.cos(ang) * rr * 1.3, cy + Math.sin(ang) * rr * 0.32 - r() * 60, 1.1 + r() * 0.5, t, i, col); }
}
function anvil(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#3a2a1c'; c.fillRect(-40, -90, 80, 90); c.fillStyle = '#2a1e14'; c.fillRect(-48, -10, 96, 12);
  const g = c.createLinearGradient(0, -150, 0, -90); g.addColorStop(0, '#6a6a72'); g.addColorStop(1, '#1a1a20');
  c.fillStyle = g; c.beginPath(); c.moveTo(-90, -150); c.lineTo(80, -150); c.quadraticCurveTo(150, -146, 170, -130); c.quadraticCurveTo(120, -124, 70, -120); c.lineTo(40, -90); c.lineTo(-40, -90); c.lineTo(-70, -122); c.lineTo(-90, -124); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(255,220,170,0.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-88, -149); c.lineTo(80, -149); c.stroke();
  c.restore();
}
function mail(c, cx, cy, r, k, heat, t) { // a coat of mail growing ring by ring (Saba 11): interlinked rings, glowing then steel
  const cols = 13, rows = 17, N = cols * rows; let idx = 0;
  c.save(); c.lineWidth = r * 0.34;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    idx++; const body = j > 3 ? (i >= 3 && i <= 9) : true; if (!body) continue;
    if (j > 3 && j < 6 && (i === 3 || i === 9)) continue;
    const q = idx / N; if (q > k) continue;
    const x = cx + (i - (cols - 1) / 2) * r * 1.45 + (j % 2) * r * 0.72, y = cy + j * r * 1.05;
    const hot = clamp(heat - (k - q) * 4); const col = mix('#8a8e96', '#ffb060', hot);
    c.strokeStyle = 'rgba(10,8,8,0.6)'; c.beginPath(); c.ellipse(x + 1.5, y + 1.5, r * 0.62, r * 0.5, 0, 0, 6.283); c.stroke();
    c.strokeStyle = col; c.beginPath(); c.ellipse(x, y, r * 0.62, r * 0.5, 0, 0, 6.283); c.stroke();
    if (hot > 0.3) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y, r * 2, '#ff9a40', 0.15 * hot); c.restore(); }
  }
  c.restore();
}
function cuppedHands(c, x, y, s, t, fill = 1) { // a hand seen from the side, cupped like a bowl, holding a handful of river water (Al-Baqara 249)
  c.save(); c.translate(x, y); c.scale(s, s);
  const skin = '#b88262', dk = mix(skin, '#000000', 0.38), lt = mix(skin, '#fff0d8', 0.28);
  limb(c, [-420, 260], [-300, 120], [-150, 40], 190, 120, '#3a4a62'); // sleeve from the left edge
  c.fillStyle = '#2e3c52'; c.beginPath(); c.ellipse(-150, 40, 28, 62, 0.35, 0, 6.283); c.fill(); // cuff
  // the cupped hand: wrist -> heel of the palm -> curled fingers rising to the right
  const g = c.createLinearGradient(0, -40, 0, 110); g.addColorStop(0, lt); g.addColorStop(0.5, skin); g.addColorStop(1, dk);
  c.fillStyle = g; c.beginPath(); c.moveTo(-150, 4); c.quadraticCurveTo(-110, 110, 10, 104); c.quadraticCurveTo(120, 98, 150, 6); c.quadraticCurveTo(156, -18, 136, -22);
  c.quadraticCurveTo(110, 40, 20, 46); c.quadraticCurveTo(-80, 50, -120, -4); c.closePath(); c.fill();
  c.strokeStyle = hexA(dk, 0.7); c.lineWidth = 3; c.beginPath(); // finger joints near the tips
  [[98, 62, 126, 30], [84, 70, 116, 44], [70, 76, 104, 56]].forEach(([a1, b1, a2, b2]) => { c.moveTo(a1, b1); c.quadraticCurveTo((a1 + a2) / 2 + 8, (b1 + b2) / 2 + 6, a2, b2); }); c.stroke();
  c.fillStyle = mix(skin, '#ffd8c0', 0.2); c.beginPath(); c.ellipse(140, -12, 14, 10, -0.6, 0, 6.283); c.fill(); // fingertip nail light
  // water held in the hollow
  if (fill > 0) { const wy = lerp(50, -2, fill); c.save(); c.beginPath(); c.moveTo(-120, -4); c.quadraticCurveTo(-80, 50, 20, 46); c.quadraticCurveTo(110, 40, 136, -22); c.lineTo(136, wy); c.lineTo(-120, wy); c.closePath(); c.clip();
    const wg = c.createLinearGradient(0, wy, 0, 50); wg.addColorStop(0, `rgba(220,242,252,${0.95})`); wg.addColorStop(1, 'rgba(70,120,150,0.9)'); c.fillStyle = wg; c.fillRect(-130, wy, 280, 80); c.restore();
    c.save(); c.globalCompositeOperation = 'lighter'; for (let k = 0; k < 5; k++) { c.fillStyle = `rgba(255,255,255,${0.6 * (0.5 + 0.5 * Math.sin(t * 4 + k * 2))})`; c.fillRect(-80 + k * 40, wy + 2 + Math.sin(k) * 3, 22, 3); } c.restore(); }
  // the thumb resting along the top edge
  c.fillStyle = mix(skin, '#000000', 0.06); c.beginPath(); c.ellipse(-70, 6, 58, 17, -0.18, 0, 6.283); c.fill();
  c.strokeStyle = hexA(dk, 0.6); c.lineWidth = 2.5; c.beginPath(); c.ellipse(-70, 6, 58, 17, -0.18, 0, 6.283); c.stroke();
  for (let k = 0; k < 3; k++) { const ph = (t * 1.1 + k / 3) % 1; c.fillStyle = `rgba(200,230,245,${0.8 * (1 - ph)})`; c.beginPath(); c.ellipse(20 + k * 50, 108 + ph * 260, 5, 8, 0, 0, 6.283); c.fill(); }
  c.restore();
}
function reeds(c, x0, x1, y, h, col, t, seed = 3) { const r = rng(seed); c.strokeStyle = col; c.lineCap = 'round';
  for (let i = 0; i < (x1 - x0) / 9; i++) { const x = x0 + r() * (x1 - x0), hh = h * (0.5 + r() * 0.6), sw = Math.sin(t * 1.3 + i) * 8;
    c.lineWidth = 2 + r() * 2; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + sw * 0.3, y - hh * 0.6, x + sw, y - hh); c.stroke();
    if (r() > 0.7) { c.fillStyle = mix(col, '#4a2a10', 0.5); c.beginPath(); c.ellipse(x + sw, y - hh, 3, 10, 0, 0, 6.283); c.fill(); } } }
function lightning(c, x, y0, y1, a, seed = 4) { if (a <= 0) return; const r = rng(seed); c.save(); c.globalCompositeOperation = 'lighter';
  c.strokeStyle = `rgba(230,236,255,${a})`; c.lineWidth = 4; c.beginPath(); let px = x, py = y0; c.moveTo(px, py);
  while (py < y1) { px += (r() - 0.5) * 80; py += 30 + r() * 50; c.lineTo(px, py); } c.stroke(); glow(c, x, (y0 + y1) / 2, 500, '#c8d0ff', 0.25 * a); c.restore(); }
function enemyRanks(c, t, x0, x1, y, h, n, seed, o = {}) { const r = rng(seed); // a row of faceless foot soldiers of Jalut with spears
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, (i + 0.5) / n) + (r() - 0.5) * 24, yy = y + (r() - 0.5) * 14, hh = h * (0.9 + r() * 0.2), who = FOE[i % 3];
    const fo = Object.assign({ x, y: yy, h: hh, dir: o.dir || -1, light: o.light || 0.6, t: t + i, wind: 0.2, ink: 0.6 }, o.f ? o.f(i, x) : {});
    fig(c, who, fo); if (!fo.noSpear) spearOf(c, fo); } }
function hostRanks(c, t, x0, x1, y, h, n, seed, o = {}) { const r = rng(seed); // Talut's small band
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, (i + 0.5) / n) + (r() - 0.5) * 20, yy = y + (r() - 0.5) * 10, hh = h * (0.92 + r() * 0.16);
    const fo = Object.assign({ x, y: yy, h: hh, dir: o.dir || 1, light: o.light || 0.85, t: t + i * 1.3, wind: 0.3, ink: o.ink }, o.f ? o.f(i, x) : {});
    fig(c, BELIEVERS[(i + seed) % BELIEVERS.length], fo); if (i % 3 === 1 && !fo.noSpear && (fo.pose || 'stand') === 'stand') spearOf(c, fo); } }

// ---------- HERO shot (hook + sling + cta + outro): the valley at dawn. Near, Dawud whirls his sling; in the plain, Jalut
// towers in his armour before his host on the ridge; far left, Talut's small band. T is continuous across cta -> outro -> hook.
const HERO_G = { x: 720, y: 1330, h: 700, dir: -1 }, HERO_D = { x: 230, y: 1640, h: 600, dir: 1, armUp: 0.95 };
function dawudHero(c, T, o = {}) {
  const pan = o.pan || 0, fall = o.fall || 0, push = o.push || 0;
  sky0(c, [[0, '#24283e'], [0.2, '#6a5a72'], [0.36, '#d89a6e'], [0.46, '#f6c890']]);
  const [sx, sy] = shake(T, o.shake || 0, 18);
  cam(c, 1.04 + 0.004 * T + 0.16 * push, lerp(500, lerp(660, 720, push), pan), lerp(1060, 920, pan * push), sx, sy + (o.dy || 0));
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 860, 900, 820, '#ffbf80', 0.32); c.restore();
  sun(c, 880, 920, 58, '#ffe6b8', 0.75);
  cloudBank(c, T, 300, 7, '#2a2034', 0.35, 4, 6); wisps(c, T, 640, 8, '#ffcc9a', 0.22, 7, 8);
  rangeFar(c, 1010, '#5a4a5e', 3, 150); haze(c, 1020, 220, '#e4a880', 0.5);
  ridge(c, 1110, 60, 0.004, 6, '#6e5a48'); haze(c, 1120, 130, '#dca070', 0.35);
  dustCloud(c, T, 520, 1600, 1130, 210, '#e0b088', 0.28 + 0.15 * clamp(fall), 6);
  spearLine(c, T, 470, 1600, 1112, 50, 52, '#3a2a28', 5);
  spearLine(c, T, 520, 1600, 1146, 66, 44, '#261a18', 8);
  for (let i = 0; i < 5; i++) banner(c, 560 + i * 220, 1150, 0.2, T, ['#5a1a1a', '#2a2a2a', '#6a3a1a'][i % 3], i);
  hostRanks(c, T, -120, 300, 1186, 140, 8, 2, { ink: 0.5, light: 0.75 });
  plain(c, 1172, T, { seed: 9 });
  giant(c, Object.assign({}, HERO_G, { t: T, fall, light: 0.85, glint: o.glint || 0 }));
  if (fall > 0.75) dustCloud(c, T, 820, 1700, 1320, 300, '#d8b088', 0.55 * seg(fall, 0.75, 1), 9);
  const [gx, gy] = giantHead(HERO_G);
  // Dawud, near, the sling over his head
  const dw = Object.assign({}, HERO_D, { light: 1, t: T, wind: 0.5, armUp: o.released ? 0.7 : 0.95, veilGlow: 0.5 });
  fig(c, DAW, dw);
  const [hx, hy] = handOf(dw);
  slingFx(c, hx, hy, 2, T, { spin: o.spin === undefined ? 1 : o.spin, released: o.released });
  if (o.stone !== undefined) stoneFx(c, hx + 60, hy - 20, gx, gy, o.stone, o.stoneS || 2.2);
  impact(c, gx, gy, o.hit || 0, 1.4);
  blurLayer(c, 10, cc => { boulder(cc, 40, 2010, 560, 300, '#3e3022', 3); boulder(cc, 1080, 2020, 500, 280, '#33261a', 5); shrub(cc, 960, 1960, 4.5, '#4a4020', T, 7); }, 2);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
function ctaText2(c, a) { ctaText(c, a); }

// ---------- scene backdrops
function judeanHills(c, t, o = {}) { // dawn hills: layered ranges, terraces of olive trees, mist
  rangeFar(c, o.y || 980, o.far || '#6a6a8a', 11, 130); haze(c, (o.y || 980) + 10, 200, o.haze || '#f0c0a0', 0.5);
  ridge(c, (o.y || 980) + 90, 80, 0.003, 12, o.mid || '#7a7a6a'); haze(c, (o.y || 980) + 100, 140, o.haze || '#f0c0a0', 0.35);
  for (let i = -2; i < 9; i++) oliveTree(c, i * 150 + 40, (o.y || 980) + 150 + (i % 2) * 14, 0.42, o.olive || '#6a7458', mix(o.olive || '#6a7458', '#000000', 0.3), Math.sin(t + i) * 2);
}
function stormSky(c, t, a = 1) { cloudBank(c, t, 160, 8, '#1a1620', 0.55 * a, 12, 8); cloudBank(c, t, 420, 7, '#2a2230', 0.45 * a, 13, 5); }

const SCENES = {
  // 1. HOOK — the small band against the huge host; the giant falls (Al-Baqara 249-251). First frame = last frame.
  hook: {
    grade: 'rgba(255,180,120,0.14)',
    draw(c, t, d) {
      const tI = at('hook', 'immense', 0, 1.7), tJ = at('hook', 'jeune', 0, 3.2), tT = at('hook', 'tomber', 0, 5.2), tG = at('hook', 'géant', 0, 6.0);
      const rel = tT - 0.25, hit = Math.max(rel + 0.5, tG - 0.15);
      const pan = ramp(t, tI - 0.3, 1.1) * (1 - ramp(t, tJ - 0.3, 0.9)) + 0.85 * ramp(t, rel, 0.5);
      dawudHero(c, t, { pan, push: ramp(t, tJ - 0.2, 1.2) * 0.7 + 0.3 * ramp(t, rel, 0.5), spin: 1, released: t > rel, stone: t > rel ? seg(t, rel, hit) : undefined,
        hit: t > hit ? Math.exp(-(t - hit) * 2.5) : 0, fall: ease(seg(t, hit + 0.05, hit + 1.4)), shake: t > hit ? Math.exp(-(t - hit - 1.2) * 3) * seg(t, hit + 1.0, hit + 1.3) * 0.8 : 0, glint: ramp(t, tI - 0.2, 0.3) * (1 - ramp(t, tI + 0.4, 0.4)) });
      topShade(c, 1); seriesTag(c, 1);
      const a = 1 - seg(t, d - 0.6, d);
      c.save(); c.direction = 'rtl'; textGlow(c, 'وَقَتَلَ دَاوُودُ جَالُوتَ', W / 2, 290, '700 112px Amiri', '#f6c453', a, '#ffb300', 30); c.restore();
      caption(c, 'Al-Baqara, 251', 400, seg(t, 0.6, 1.2) * a);
    },
  },

  // 2. Title — the young Dawud on the hills at dawn among the sheep; teaser: the mountains answering his praise (Saba 10)
  promise: {
    grade: 'rgba(255,190,150,0.14)',
    draw(c, t, d) {
      const tB = at('promise', 'début', 0, 4.0), tM = at('promise', 'montagnes', 0, 6.4), tA = at('promise', 'Allah', 0, 8.0);
      phases(c, t, tM - 0.6, 0.6, cc => {
        const push = ease(seg(t, 0, tM));
        cam(cc, 1.0 + 0.12 * push, lerp(540, 600, push), lerp(1120, 1180, push));
        sky(cc, [[0, '#2a3a6a'], [0.28, '#8a7aa0'], [0.42, '#f0b090'], [0.5, '#ffe0b0']]);
        sun(cc, 820, 930, 70, '#ffe6c0', 0.85); wisps(cc, t, 560, 8, '#ffd8c0', 0.28, 9, 6);
        bird(cc, 160 + t * 34, 640, 1.0, t, 1, '#4a3040'); bird(cc, 220 + t * 30, 690, 0.8, t, 2, '#4a3040');
        judeanHills(cc, t, { y: 960, far: '#7a6a8a', mid: '#8a7a6a', haze: '#f0c4a0' });
        fgRidge(cc, 1360, 50, 0.004, 41, '#9a8a5a', { rim: 'rgba(255,236,190,0.6)' });
        for (let i = 0; i < 6; i++) { const sx = 520 + i * 120 + Math.sin(i * 2.1) * 30, wx = sx - 18 * Math.sin(t * 0.3 + i); sheep(cc, wx, ridgeY(wx, 1360, 50, 0.004, 41) + 30 + (i % 2) * 40, 0.9 + (i % 3) * 0.12, t, i % 2 ? 1 : -1, { graze: true }); }
        const dx = 300; fig(cc, DAW, { x: dx, y: ridgeY(dx, 1360, 50, 0.004, 41) + 14, h: 520, dir: 1, staff: true, light: 1, t, wind: 0.5 });
        blurred(cc, 9, () => { shrub(cc, 1000, 2050, 4.5, '#3a3a20', t, 5); boulder(cc, 60, 2050, 420, 260, '#4a3a28', 6); });
      }, cc => {
        const q = t - tM + 0.6;
        cam(cc, 1.0 + 0.04 * q, 540, 1000);
        sky(cc, [[0, '#1a2448'], [0.3, '#5a5a8a'], [0.45, '#e8a080'], [0.52, '#ffd8a8']]);
        sun(cc, 540, 980, 60, '#fff0d0', 0.7);
        ridge(cc, 900, 220, 0.0028, 31, '#3a3a5a'); echoRidge(cc, q, 900, 220, 0.0028, 31, ramp(q, 0.3, 0.8), 540, 380);
        haze(cc, 920, 200, '#e8a888', 0.4);
        ridge(cc, 1080, 160, 0.0035, 32, '#2e2e44'); echoRidge(cc, q - 0.5, 1080, 160, 0.0035, 32, ramp(q, 0.6, 0.8), 540, 380);
        ridge(cc, 1260, 90, 0.004, 33, '#24243a'); echoRidge(cc, q - 1.0, 1260, 90, 0.004, 33, ramp(q, 0.9, 0.8), 540, 380);
        circleBirds(cc, q + 3, 540, 700, 12, 300, ramp(q, 0.4, 2.0), 7, '#1a1420');
        const dy = ridgeY(540, 1260, 90, 0.004, 33) + 8; fig(cc, DAW, { x: 540, y: dy, h: 200, dir: 1, dua: true, light: 1, t, veilGlow: 0.7 });
        lightRings(cc, 540, dy - 180, q, ramp(q, 0.3, 1), 4, 900);
      });
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a = seg(t, 0.05, 0.6) * (1 - seg(t, tB - 0.6, tB));
      topShade(c, a * 1.3); seriesTag(c, a);
      c.save(); c.direction = 'rtl'; textGlow(c, 'دَاوُود', W / 2, 360 - (1 - easeOut(seg(t, 0.05, 1.0))) * 30, '700 190px Amiri', '#f6c453', a, '#ffb300', 40); c.restore();
      textGlow(c, 'ʿalayhi s-salām', W / 2, 530, 'italic 500 46px Lora', '#fff3dc', a, '#000000', 14);
      textGlow(c, 'Dawud  ·  David', W / 2, 600, '600 42px Lora', '#e8d6b8', a * 0.9, '#000000', 10);
      topShade(c, ramp(t, tM - 0.4, 0.6) * 0.8);
      arabicCaption(c, 'يَا جِبَالُ أَوِّبِي مَعَهُ', t, tM - 0.2, d + 1, 300, 120);
      caption(c, 'Saba, 10', 410, seg(t, tA, tA + 0.6) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 3. "Raise for us a king" — "Allah has sent Talut to you as king" (Al-Baqara 246-247)
  king: {
    grade: 'rgba(255,200,150,0.14)',
    draw(c, t, d) {
      const tR = at('king', 'roi', 0, 2.0), tP = at('king', 'prophète', 0, 3.4), tA = at('king', 'Allah', 0, 4.6), tT = at('king', 'Talout', 0, 6.0);
      const push = ease(seg(t, 0, tP + 0.5)), pan = ease(seg(t, tT - 1.2, tT + 0.8));
      cam(c, 1.05 + 0.1 * push - 0.03 * pan, lerp(lerp(540, 420, push), 640, pan), lerp(1160, 1080, push));
      sky(c, [[0, '#3a5a8a'], [0.32, '#a8b4c4'], [0.46, '#f2d6a8']]);
      sun(c, 200, 640, 60, '#fff2d0', 0.6); wisps(c, t, 420, 9, '#ffffff', 0.25, 5, 6);
      judeanHills(c, t, { y: 900, far: '#8a90a8', mid: '#9a9078', haze: '#f0dcc0' });
      city(c, 380, 1200, 1060, 160, 0.7, '#d8bc94', 7, { walls: true });
      plain(c, 1110, t, { col: '#b0945e', seed: 3 });
      rock(c, 240, 1260, 380, 150, '#a8845a', 4, { sharp: 0.8, grooves: 4 });
      const pro = { x: 230, y: 1140, h: 400, dir: 1, armUp: 0.75 * ramp(t, tA - 0.4, 0.5) * (1 - ramp(t, tT - 0.2, 0.5)), reach: 0.8 * ramp(t, tT - 0.2, 0.5), light: 1, t, wind: 0.4 };
      fig(c, NABI, pro);
      // the elders and the people gathered around
      crowdRow(c, t, 380, 1500, 1250, 250, 9, 3, { dir: -1, light: 0.85, f: (i) => ({ armUp: i % 3 === 0 ? 0.5 * ramp(t, tR - 0.3 + i * 0.05, 0.5) * (1 - ramp(t, tP, 0.6)) : 0 }) });
      // Talut steps in from the right edge: taller than all of them (Al-Baqara 247 "increased in stature")
      const ent = ease(seg(t, tT - 1.4, tT + 0.2)), tx = lerp(1500, 860, ent);
      const to = { x: tx, y: 1330, h: 520, dir: -1, walk: ent > 0 && ent < 1 ? stepOf(1500 - tx, 520) : null, light: 1, t, wind: 0.35 };
      if (ent > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, tx, 1100, 420, '#ffe0a0', 0.25 * ramp(t, tT, 0.8)); c.restore(); fig(c, TALUT, to);
        const [hx, hy, hr] = headOf(to); crown(c, hx - 4, hy + 2, hr * 1.05, ramp(t, tT, 0.6)); sparkle(c, t, hx, hy - 30, 10, 90, 5, ramp(t, tT, 0.6)); }
      crowdRow(c, t, -200, 1300, 1720, 520, 5, 8, { dir: -1, light: 0.6, ink: 0.4, f: () => ({ wind: 0.2 }) });
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c);
      arabicCaption(c, 'ابْعَثْ لَنَا مَلِكًا', t, 0.2, tP - 0.3, 290, 116);
      arabicCaption(c, 'إِنَّ اللَّهَ قَدْ بَعَثَ لَكُمْ طَالُوتَ مَلِكًا', t, tP - 0.1, d + 1, 290, 76);
      caption(c, 'Al-Baqara, 247', 390, seg(t, tT, tT + 0.6) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 4. The river test: "whoever drinks from it is not of me, except a handful scooped in his hand" — they drank, all but a few (Al-Baqara 249)
  river: {
    grade: 'rgba(170,210,230,0.12)',
    draw(c, t, d) {
      const tF = at('river', 'fleuve', 0, 2.2), tB = at('river', 'boira', 0, 3.4), tG = at('river', 'gorgée', 0, 5.4), tCr = at('river', 'creux', 0, 6.6), tBu = at('river', 'burent', 0, d - 1.4);
      const handIn = tG - 0.4, handOut = tBu - 0.7;
      const riverShot = cc => {
        const tilt = ease(seg(t, tF - 0.6, tF + 0.6)), drink = ramp(t, tBu - 0.3, 0.8);
        cam(cc, 1.08 - 0.05 * tilt + 0.06 * drink, 540, lerp(1300, 1160, tilt) + 60 * drink);
        sky(cc, [[0, '#4a7aa8'], [0.3, '#a8c4d4'], [0.45, '#f4e0bc']]);
        sun(cc, 860, 620, 54, '#fff4d8', 0.6); wisps(cc, t, 420, 8, '#ffffff', 0.3, 8, 6);
        judeanHills(cc, t, { y: 880, far: '#8a9ab0', mid: '#8a9a7a', haze: '#e8e4d0', olive: '#5a6a48' });
        cc.fillStyle = '#7a8a5a'; cc.fillRect(-400, 1020, W + 800, 80); reeds(cc, -300, 1400, 1100, 70, '#5a6a3a', t, 5);
        water(cc, t, 1100, 1420, { top: '#7aa8c0', bot: '#2a5a6a', sunX: 860, flow: 26, seed: 4 });
        plain(cc, 1410, t, { col: '#a08a58', seed: 11, n: 110 });
        cc.fillStyle = 'rgba(40,60,50,0.35)'; cc.fillRect(-400, 1408, W + 800, 10);
        reeds(cc, 900, 1300, 1430, 120, '#6a7a3a', t, 9);
        // the soldiers arrive along the bank; on "burent" they kneel to drink, a few stay standing
        for (let i = 0; i < 8; i++) { const arrive = ease(seg(t, 0, 2.6)), x = lerp(-400, 0, arrive) + i * 120 + 40, y = 1500 + (i % 2) * 40, keep = i === 2 || i === 6;
          const kneel = drink > 0.3 && !keep;
          const fo = { x, y, h: 300, dir: 1, walk: arrive < 1 ? stepOf(x - (-400 + i * 120 + 40), 300) + i * 0.3 : null, light: 0.9, t: t + i, wind: 0.3, pose: kneel ? 'kneel' : 'stand' };
          if (kneel) lean(cc, x, y, 0.22, () => fig(cc, BELIEVERS[i % BELIEVERS.length], fo)); else { fig(cc, BELIEVERS[i % BELIEVERS.length], fo); if (i % 3 === 1) spearOf(cc, fo); } }
        const to = { x: 900, y: 1560, h: 420, dir: -1, armUp: 0.55 * ramp(t, tB - 0.4, 0.5) * (1 - ramp(t, handIn, 0.4)), light: 1, t, wind: 0.35 };
        fig(cc, TALUT, to); { const [hx, hy, hr] = headOf(to); crown(cc, hx - 4, hy + 2, hr * 1.05); }
        fig(cc, DAW, { x: 700, y: 1600, h: 400, dir: -1, light: 1, t, wind: 0.4 });
        blurred(cc, 9, () => { reeds(cc, -100, 400, 2000, 380, '#3a4a20', t, 13); });
      };
      phases(c, t, handIn, 0.5, cc => riverShot(cc), cc => {
        phases(cc, t, handOut, 0.5, c2 => {
          const q = t - handIn; cam(c2, 1.0 + 0.03 * q, 540, 1000);
          blurred(c2, 6, () => { sky(c2, [[0, '#6a9ab8'], [0.4, '#d8e8e8']]); judeanHills(c2, t, { y: 760, far: '#8a9ab0', mid: '#8a9a7a', haze: '#e8e4d0', olive: '#5a6a48' }); }); water(c2, t, 980, 1730, { top: '#8ab8c8', bot: '#2a5a6a', sunX: 760, seed: 5, n: 80 });
          // one of the few: he only scoops a handful in his palm, and the water runs between his fingers
          plain(c2, 1720, t, { col: '#8a7a50', seed: 13, n: 40 });
          const so = { x: 420, y: 1960, h: 1150, dir: 1, reach: lerp(0.3, 0.85, ease(seg(q, 0, 1.2))), light: 0.95, t, wind: 0.3 };
          fig(c2, FOLK[1], so); const [hx, hy] = handOf(so);
          c2.save(); c2.globalCompositeOperation = 'lighter'; glow(c2, hx + 10, hy - 6, 90, '#d8f0ff', 0.5 * ramp(q, 0.2, 0.6)); c2.restore();
          c2.fillStyle = 'rgba(200,235,250,0.9)'; c2.beginPath(); c2.ellipse(hx + 8, hy - 8, 30, 9, -0.1, 0, 6.283); c2.fill();
          for (let k = 0; k < 4; k++) { const ph = (t * 1.2 + k / 4) % 1; c2.fillStyle = `rgba(210,238,250,${0.85 * (1 - ph)})`; c2.beginPath(); c2.ellipse(hx - 6 + k * 10, hy + 20 + ph * 520, 4, 7, 0, 0, 6.283); c2.fill(); }
          for (let k = 0; k < 3; k++) { const ph = (t * 0.7 + k / 3) % 1; c2.strokeStyle = `rgba(230,250,255,${0.4 * (1 - ph)})`; c2.lineWidth = 3; c2.beginPath(); c2.ellipse(hx + 10, 1640, 30 + ph * 200, 6 + ph * 30, 0, 0, 6.283); c2.stroke(); }
        }, c2 => riverShot(c2));
      });
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c);
      arabicCaption(c, 'إِنَّ اللَّهَ مُبْتَلِيكُم بِنَهَرٍ', t, 0.3, tB - 0.3, 290, 100);
      arabicCaption(c, 'إِلَّا مَنِ اغْتَرَفَ غُرْفَةً بِيَدِهِ', t, tB - 0.1, tBu - 0.3, 290, 96);
      arabicCaption(c, 'فَشَرِبُوا مِنْهُ إِلَّا قَلِيلًا', t, tBu - 0.1, d + 1, 290, 104);
    },
  },

  // 5. Only a few crossed with Talut — and before them, Jalut and his host (Al-Baqara 249)
  few: {
    grade: 'rgba(200,170,190,0.16)',
    draw(c, t, d) {
      const tTr = at('few', 'traversa', 0, 1.6), tF = at('few', 'face', 0, 3.4), tJ = at('few', 'Jalout', 0, 4.4), tI = at('few', 'immense', 0, d - 1.2);
      const up = ease(seg(t, tF - 0.6, tJ + 0.3)), back = ease(seg(t, tI - 0.8, d)), dist = t * 70;
      const fl = Math.exp(-Math.pow((t - tJ) * 5, 2)) + 0.6 * Math.exp(-Math.pow((t - tJ - 0.35) * 7, 2));
      cam(c, lerp(1.3, 1.0, up) - 0.12 * back, lerp(420, 600, up), lerp(1700, 1060, up) + 40 * back);
      sky(c, [[0, '#1e1a2e'], [0.3, '#4a3a52'], [0.45, '#a86a5a'], [0.52, '#d8946a']]);
      stormSky(c, t); lightning(c, 760, 120, 760, fl, 6);
      rangeFar(c, 980, '#3a2e3a', 21, 120); haze(c, 990, 160, '#a86a5a', 0.4);
      // Jalut's host along the ridge, rank after rank
      dustCloud(c, t, -300, 1500, 1050, 220, '#b88a6a', 0.3, 7);
      spearLine(c, t, -300, 1500, 1030, 36, 90, '#2a1c1c', 11); spearLine(c, t, -300, 1500, 1060, 46, 80, '#22161a', 12);
      ridge(c, 1100, 30, 0.004, 22, '#3e2e2a');
      enemyRanks(c, t, -200, 1400, 1120, 120, 16, 4);
      for (let i = 0; i < 7; i++) banner(c, -100 + i * 230, 1126, 0.32, t, ['#5a1a1a', '#2a2a2a', '#6a3a1a'][i % 3], i);
      giant(c, { x: 640, y: 1160, h: 420, dir: -1, t, light: 0.6, glint: fl * 0.8 });
      // the near bank: the small band walks on after the crossing
      plain(c, 1200, t, { col: '#7a6a4a', seed: 21, n: 120 });
      water(c, t, 1200, 1290, { top: '#4a5a6a', bot: '#2a3a4a', seed: 6, n: 30, a: 0.6 });
      plain(c, 1290, t, { col: '#8a7450', seed: 22, n: 90 });
      for (let i = 0; i < 6; i++) { const x = 60 + i * 120 + dist - 140, who = i === 2 ? TALUT : i === 4 ? DAW : BELIEVERS[i]; const fo = { x, y: 1620 + (i % 2) * 24, h: 330, dir: 1, walk: stepOf(dist, 330) + i * 0.27, light: 0.85, t: t + i, wind: 0.4 };
        fig(c, who, fo); if (i === 2) { const [hx, hy, hr] = headOf(fo); crown(c, hx - 4, hy + 2, hr * 1.05); } if (i === 1 || i === 5) spearOf(c, fo); }
      if (fl > 0.02) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(220,226,255,${0.22 * fl})`; c.fillRect(0, 0, W, H); c.restore(); }
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c);
      arabicCaption(c, 'فَلَمَّا جَاوَزَهُ هُوَ وَالَّذِينَ آمَنُوا مَعَهُ', t, 0.2, tF - 0.2, 290, 80);
      arabicCaption(c, 'جَالُوتَ وَجُنُودِهِ', t, tF, d + 1, 290, 120);
    },
  },

  // 6. "We have no strength today against Jalut" — "How many a small company has overcome a large company by Allah's permission!" (Al-Baqara 249)
  faith: {
    grade: 'rgba(200,180,200,0.14)',
    draw(c, t, d) {
      const tN = at('faith', 'aucune', 0, 1.6), tCr = at('faith', 'croyants', 0, 4.6), tCo = at('faith', 'Combien', 0, 6.4), tPe = at('faith', 'petite', 0, 8.0), tGr = at('faith', 'grande', 0, 10.0), tPm = at('faith', 'permission', 0, 12.0);
      const fear = ramp(t, tN - 0.3, 0.8) * (1 - ramp(t, tCr, 1.0)), hope = ramp(t, tCr - 0.2, 1.2), back = ease(seg(t, tCo - 0.4, tGr + 0.4)), beam = ramp(t, tPm - 0.3, 0.8);
      cam(c, lerp(1.12, 0.98, back), lerp(560, 540, back), lerp(1200, 1080, back));
      sky(c, [[0, mix('#1e1a2e', '#3a4a7a', hope)], [0.3, mix('#4a3a52', '#8a8aa8', hope)], [0.45, mix('#a86a5a', '#f0b890', hope)]]);
      stormSky(c, t, 1 - 0.6 * hope);
      // the clouds part over the small band
      if (hope > 0) { c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 300, 0, Math.PI / 2 - 0.15, 0.5, 1800, 10, '#fff0c8', 0.08 * hope + 0.1 * beam, t, 31); c.restore(); }
      rangeFar(c, 980, '#3a2e3a', 21, 120); haze(c, 990, 160, mix('#a86a5a', '#f0c8a0', hope), 0.4);
      dustCloud(c, t, 400, 1600, 1050, 220, '#b88a6a', 0.3 + 0.2 * ramp(t, tGr - 0.2, 0.6), 7);
      spearLine(c, t, 380, 1600, 1030, 36, 60, '#2a1c1c', 11); spearLine(c, t, 420, 1600, 1060, 46, 54, '#22161a', 12);
      ridge(c, 1100, 30, 0.004, 22, '#3e2e2a');
      enemyRanks(c, t, 520, 1500, 1120, 120, 10, 4);
      giant(c, { x: 820, y: 1160, h: 420, dir: -1, t, light: 0.6 });
      plain(c, 1200, t, { col: '#7a6a4a', seed: 21, n: 120 });
      // the small company (lit by the beam on "permission")
      if (beam > 0 || hope > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 280, 1400, 520, '#ffe0a0', 0.12 * hope + 0.3 * beam); c.restore(); }
      hostRanks(c, t, 60, 500, 1380, 230, 7, 5, { light: lerp(0.6, 1, hope) });
      // the three in front: two step back in fear, the believers step forward (Dawud among them)
      const fw = ramp(t, tCr - 0.2, 1.0);
      const A = { x: 360 - 70 * fear, y: 1780, h: 560, dir: 1, light: lerp(0.55, 0.95, hope), t, wind: 0.4, walk: fear > 0 && fear < 1 ? -stepOf(70 * fear, 560) : null };
      lean(c, A.x, A.y, -0.06 * fear, () => fig(c, BELIEVERS[3], A));
      const B = { x: 700 + 60 * fw, y: 1760, h: 540, dir: 1, light: lerp(0.6, 1, hope), t: t + 2, wind: 0.4, armUp: 0.7 * ramp(t, tCo - 0.2, 0.5), walk: fw > 0 && fw < 1 ? stepOf(60 * fw, 540) : null };
      fig(c, SOLDIER, B); spearOf(c, Object.assign({}, B, { x: B.x - 20 }));
      fig(c, DAW, { x: 540 + 50 * fw, y: 1820, h: 560, dir: 1, light: 1, t: t + 4, wind: 0.5, walk: fw > 0 && fw < 1 ? stepOf(50 * fw, 560) : null });
      if (fear > 0.02) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(10,8,20,${0.3 * fear})`; c.fillRect(0, 0, W, H); c.restore(); }
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c);
      arabicCaption(c, 'لَا طَاقَةَ لَنَا الْيَوْمَ بِجَالُوتَ', t, 0.3, tCr - 0.3, 290, 96);
      arabicCaption(c, 'كَم مِّن فِئَةٍ قَلِيلَةٍ غَلَبَتْ فِئَةً كَثِيرَةً', t, tCo - 0.2, d + 1, 280, 78);
      arabicCaption(c, 'بِإِذْنِ اللَّهِ', t, tPm - 0.2, d + 1, 400, 96);
    },
  },

  // 7. Their prayer before the battle (Al-Baqara 250)
  dua: {
    grade: 'rgba(200,190,240,0.12)',
    draw(c, t, d) {
      const tE = at('dua', 'endurance', 0, 3.0), tAf = at('dua', 'affermis', 0, 4.6), tV = at('dua', 'victoire', 0, d - 1.2);
      const dawn = ease(seg(t, 0, d)), lit = ramp(t, tE - 0.2, 1.2), win = ramp(t, tV - 0.2, 0.8), low = ease(seg(t, tAf - 0.4, tAf + 1.0)) * (1 - ease(seg(t, tV - 0.6, tV + 0.4)));
      cam(c, 1.02 + 0.08 * dawn + 0.12 * low, 540, lerp(1060, 1240, low));
      sky(c, [[0, mix('#0a0e22', '#2a3a6a', dawn)], [0.3, mix('#1a1e3a', '#7a6a9a', dawn)], [0.46, mix('#2a2a4a', '#f0a888', dawn)], [0.52, mix('#3a3050', '#ffd8a8', dawn)]]);
      stars(c, t, 160, 9, [0, 0, W, 900], 1 - dawn * 0.8); moon(c, 820, 360, 40, 1 - dawn * 0.7);
      if (win > 0) { sun(c, 540, 1010 - 40 * win, 70, '#fff0d0', win); c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 540, 1000, -Math.PI / 2, 2.6, 1400, 14, '#ffe8c0', 0.08 * win, t, 7); c.restore(); }
      rangeFar(c, 1010, mix('#1a1a2e', '#5a4a6a', dawn), 26, 110); haze(c, 1020, 160, mix('#2a2a4a', '#e8a888', dawn), 0.5);
      plain(c, 1060, t, { col: mix('#3a3428', '#8a7450', dawn), seed: 31, n: 120 });
      // rows of the small army kneeling, hands raised
      for (let r = 0; r < 3; r++) for (let i = 0; i < 9 - r * 2; i++) { const x = 120 + i * 105 + r * 60 + (r % 2) * 40, y = 1150 + r * 90, h = 160 + r * 50;
        fig(c, BELIEVERS[(i + r) % BELIEVERS.length], { x, y, h, dir: 1, pose: 'kneel', dua: true, light: lerp(0.5, 0.95, dawn), t: t + i + r, ink: 0.6 }); }
      const ta = { x: 300, y: 1560, h: 420, dir: 1, pose: 'kneel', dua: true, light: 1, t };
      fig(c, TALUT, ta); { const [hx, hy, hr] = headOf(ta); crown(c, hx - 4, hy + 2, hr * 1.05); }
      fig(c, DAW, { x: 640, y: 1600, h: 440, dir: 1, pose: 'kneel', dua: true, light: 1, t: t + 1 });
      lightFromAbove(c, t, 520, 0.25 * lit + 0.4 * win, 560);
      blurred(c, 9, () => { boulder(c, 80, 2050, 480, 260, '#2a2218', 3); shrub(c, 980, 2000, 4, '#2a2a18', t, 3); });
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c);
      arabicCaption(c, 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا', t, 0.3, tAf - 0.3, 290, 104);
      arabicCaption(c, 'وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا', t, tAf - 0.1, d + 1, 290, 100);
      caption(c, 'Al-Baqara, 250', 400, seg(t, tAf + 0.4, tAf + 1.0) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 8. Jalut comes forward; from the small ranks a young man steps out: Dawud
  duel: {
    grade: 'rgba(255,180,130,0.14)',
    draw(c, t, d) {
      const tAv = at('duel', 'avança', 0, 0.8), tFe = at('duel', 'fer', 0, 1.9), tFa = at('duel', 'face', 0, 2.9), tD = at('duel', 'Dawud', 0, d - 1.2);
      const gw = ease(seg(t, tAv - 0.4, tFa)), gx = lerp(1180, 780, gw), gd = 1180 - gx;
      const dwk = ease(seg(t, tFa - 0.2, tD + 0.4)), dx = lerp(170, 360, dwk);
      const steps = stepOf(gd, 820), stomp = gw > 0 && gw < 1 ? Math.pow(Math.abs(Math.cos(steps * Math.PI)), 12) : 0, [sx, sy] = shake(t, stomp * 0.35, 14);
      cam(c, 1.0 + 0.1 * ease(seg(t, tD - 0.6, d)), lerp(720, 540, ease(seg(t, tFa - 0.6, tFa + 0.8))), lerp(1080, 1140, dwk), sx, sy);
      sky(c, [[0, '#2a2a40'], [0.25, '#7a6070'], [0.42, '#e0a070'], [0.5, '#f6c890']]);
      sun(c, 540, 960, 66, '#ffe8c0', 0.8); cloudBank(c, t, 300, 6, '#2a2034', 0.3, 4, 6);
      rangeFar(c, 1000, '#5a4a5e', 3, 150); haze(c, 1010, 200, '#e4a880', 0.5);
      dustCloud(c, t, 700, 1700, 1140, 220, '#e0b088', 0.3, 6); spearLine(c, t, 760, 1700, 1130, 60, 40, '#2a1e1c', 8);
      plain(c, 1150, t, { seed: 17 });
      enemyRanks(c, t, 880, 1600, 1250, 240, 8, 6);
      hostRanks(c, t, -260, 220, 1250, 240, 6, 3);
      giant(c, { x: gx, y: 1420, h: 820, dir: -1, t, walk: gw > 0 && gw < 1 ? steps : null, light: 0.85, glint: ramp(t, tFe - 0.1, 0.25) * (1 - ramp(t, tFe + 0.5, 0.4)) });
      if (stomp > 0.3) dustCloud(c, t, gx - 160, gx + 160, 1430, 90, '#d8b088', 0.3 * stomp, 3);
      const dw = { x: dx, y: 1420, h: 330, dir: 1, walk: dwk > 0 && dwk < 1 ? stepOf(dx - 170, 330) : null, light: 1, t, wind: 0.5, veilGlow: 0.8 };
      if (dwk > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, dx, 1300, 300, '#ffe8b0', 0.2 * dwk); c.restore(); }
      fig(c, DAW, dw); { const [hx, hy] = handOf(dw); slingFx(c, hx, hy, 1, t, { released: true }); }
      blurLayer(c, 9, cc => { boulder(cc, 1000, 2060, 520, 300, '#33261a', 5); shrub(cc, 80, 2000, 4.5, '#3a3018', t, 2); }, 2);
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c);
      arabicCaption(c, 'وَلَمَّا بَرَزُوا لِجَالُوتَ وَجُنُودِهِ', t, 0.2, d + 1, 290, 88);
    },
  },

  // 9. The sling — the stone — the giant falls (the sling and the stone are reported by the exegetes; the Qur'an: "and Dawud killed Jalut")
  sling: {
    grade: 'rgba(255,180,120,0.16)',
    draw(c, t, d) {
      const tFr = at('sling', 'fronde', 0, 3.0), tPi = at('sling', 'pierre', 0, 3.9), tPa = at('sling', 'partit', 0, 4.4), tG = at('sling', 'géant', 0, 5.6), tE = at('sling', 'effondra', 0, d - 1.3);
      const rel = tPa + 0.05, hit = Math.max(rel + 0.7, tE - 0.35);
      phases(c, t, rel - 0.35, 0.35, cc => {
        // close-up, low angle: Dawud raises the sling and makes it whirl faster and faster
        const spin = ramp(t, tFr - 0.4, 1.0), z = 1.0 + 0.08 * t / d;
        cam(cc, z, 540, 1000);
        sky(cc, [[0, '#1e2036'], [0.3, '#6a5068'], [0.5, '#e09a6a'], [0.6, '#f6c890']]);
        cloudBank(cc, t, 260, 6, '#2a2034', 0.35, 4, 10);
        blurLayer(cc, 6, c2 => { rangeFar(c2, 1250, '#5a4a5e', 3, 150); haze(c2, 1260, 200, '#e4a880', 0.5); giant(c2, { x: 860, y: 1500, h: 560, dir: -1, t, light: 0.6 }); plain(c2, 1440, t, { seed: 9, n: 60 }); }, 1);
        const dw = { x: 330, y: 2080, h: 1080, dir: 1, armUp: lerp(0.35, 0.95, ease(spin)), light: 1, t, wind: 0.7, veilGlow: 0.4 };
        fig(cc, DAW, dw);
        const [hx, hy] = handOf(dw); slingFx(cc, hx, hy, 2.6, t, { spin, tilt: 0.7 });
        windStreaks(cc, t, 0.3 + 0.4 * spin, 3, 400, 1600);
      }, cc => {
        dawudHero(cc, t, { pan: 0.9, push: ramp(t, rel - 0.2, 0.8) * (1 - 0.5 * ramp(t, hit + 0.6, 1.0)), spin: 1, released: true, stone: seg(t, rel, hit),
          hit: t > hit ? Math.exp(-(t - hit) * 2.2) : 0, fall: ease(seg(t, hit + 0.05, hit + 1.5)), shake: t > hit ? seg(t, hit + 1.1, hit + 1.35) * Math.exp(-Math.max(0, t - hit - 1.35) * 3) : 0 });
      });
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 0.9);
      caption(c, 'selon les exégètes', 300, seg(t, 0.3, 0.9) * (1 - seg(t, tFr + 0.8, tFr + 1.4)), 40);
    },
  },

  // 10. "They defeated them by Allah's permission, and Dawud killed Jalut; Allah gave him the kingship and wisdom" (Al-Baqara 251)
  victory: {
    grade: 'rgba(255,200,140,0.16)',
    draw(c, t, d) {
      const tDe = at('victory', 'déroute', 0, 1.0), tT = at('victory', 'tua', 0, 4.0), tR = at('victory', 'royauté', 0, 6.6), tS = at('victory', 'sagesse', 0, d - 1.0);
      phases(c, t, tR - 0.6, 0.6, cc => {
        const flee = ease(seg(t, tDe - 0.6, tR)), joy = ramp(t, tT - 0.2, 0.8);
        cam(cc, 1.06 - 0.06 * flee, 560 + 60 * flee, 1100);
        sky(cc, [[0, '#3a5a8a'], [0.3, '#b0a8b8'], [0.45, '#f6d0a0']]);
        c.save(); sun(cc, 820, 820, 64, '#fff2d0', 0.8); c.restore();
        cc.save(); cc.globalCompositeOperation = 'lighter'; rays(cc, 820, 820, Math.PI / 2, 3, 1500, 14, '#ffe8c0', 0.05 + 0.06 * joy, t, 5); cc.restore();
        rangeFar(cc, 1000, '#7a6a7a', 3, 150); haze(cc, 1010, 200, '#f0c8a0', 0.5);
        // the host scatters away over the ridge, leaving dust and dropped standards
        dustCloud(cc, t, 600 + flee * 500, 1800, 1110, 240, '#e8c8a0', 0.35 + 0.15 * flee, 4);
        plain(cc, 1130, t, { seed: 41 });
        for (let i = 0; i < 9; i++) { const x = 700 + i * 90 + flee * 900 + (i % 3) * 30, fo = { x, y: 1200 + (i % 3) * 18, h: 170, dir: 1, walk: stepOf(flee * 900, 170) + i * 0.4, light: 0.6, t: t + i, wind: 0.3, ink: 0.5, noSpear: true };
          fig(cc, FOE[i % 3], fo); }
        cc.save(); cc.translate(1080, 1260); cc.rotate(1.3); banner(cc, 0, 0, 0.35, 0, '#5a1a1a', 0, 0.1); cc.restore();
        // the believers raise their hands, Dawud at the centre in the light
        hostRanks(cc, t, -40, 1000, 1560, 300, 8, 7, { f: (i) => ({ armUp: i % 2 ? 0.8 * ramp(t, tT - 0.4 + i * 0.07, 0.5) : 0 }) });
        lightFromAbove(cc, t, 470, 0.35 * joy, 360);
        fig(cc, DAW, { x: 460, y: 1680, h: 440, dir: 1, light: 1, t, wind: 0.5, armUp: 0.4 * joy });
        blurred(cc, 9, () => { shrub(cc, 1000, 2040, 4, '#3a3018', t, 9); });
      }, cc => {
        const q = t - tR + 0.6;
        cam(cc, 1.0 + 0.04 * q, 540, 1060);
        hall(cc, t, { fy: 1180 });
        for (let k = 0; k < 2; k++) { cc.fillStyle = mix('#c8a070', '#5a3a20', k * 0.3); cc.fillRect(380 + k * 30, 1150 + k * 20, 360 - k * 60, 30 - k * 10); }
        COURT.forEach((who, i) => { const x = i < 2 ? 140 + i * 110 : 820 + (i - 2) * 110, dir = i < 2 ? 1 : -1, y = 1290 + (i % 2) * 30; lean(cc, x, y, -dir * 0.07 * ramp(q, 0.4 + i * 0.15, 0.6), () => fig(cc, who, { x, y, h: 380, dir, light: 0.9, t: t + i })); });
        lightFromAbove(cc, t, 540, 0.45 * ramp(q, 0.2, 1.0), 300);
        const so = { x: 540, y: 1180, h: 470, dir: 1, light: 1, t, reach: 0.5 * ramp(t, tS - 0.3, 0.5) };
        fig(cc, DAW, so); if (t > tS - 0.3) { const [bx, by] = handOf(so); book(cc, bx + 6, by + 6, 1.1); sparkle(cc, t, bx, by - 20, 14, 120, 3, ramp(t, tS - 0.3, 0.5)); }
        blurred(cc, 9, () => { column(cc, -40, 2300, 160, 1400, '#a88a64'); column(cc, 1130, 2300, 160, 1400, '#a88a64'); });
      });
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c);
      arabicCaption(c, 'فَهَزَمُوهُم بِإِذْنِ اللَّهِ', t, 0.2, tT - 0.3, 290, 110);
      arabicCaption(c, 'وَقَتَلَ دَاوُودُ جَالُوتَ', t, tT - 0.1, tR - 0.4, 290, 116);
      arabicCaption(c, 'وَآتَاهُ اللَّهُ الْمُلْكَ وَالْحِكْمَةَ', t, tR - 0.2, d + 1, 290, 90);
      caption(c, 'Al-Baqara, 251', 400, seg(t, tR + 0.4, tR + 1.0) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 11. The promise kept: "O mountains, repeat [Our praise] with him, and you birds" (Saba 10); "at evening and at sunrise" (Sad 18-19)
  mountains: {
    grade: 'rgba(255,200,170,0.14)',
    draw(c, t, d) {
      const tGl = at('mountains', 'glorifiait', 0, 2.4), tMo = at('mountains', 'montagnes', 0, 3.6), tO = at('mountains', 'oiseaux', 0, 4.6), tR = at('mountains', 'répétaient', 0, 5.4), tSo = at('mountains', 'soir', 0, d - 1.2);
      const eve = ease(seg(t, tSo - 1.2, tSo + 0.4)), praise = ramp(t, tGl - 0.2, 0.6), echo = ramp(t, tMo - 0.2, 0.8);
      cam(c, 1.12 - 0.1 * ease(seg(t, 0, tO + 1)), 540, lerp(1240, 1080, ease(seg(t, 0, tO + 1))));
      sky(c, [[0, mix('#3a5a9a', '#1a1a3e', eve)], [0.3, mix('#a8b8d0', '#6a4a7a', eve)], [0.44, mix('#ffd8a8', '#e88a6a', eve)], [0.52, mix('#fff0c8', '#f0b080', eve)]]);
      if (eve > 0) { stars(c, t, 90, 4, [0, 0, W, 700], eve * 0.8); moon(c, 820, 380, 36, eve); }
      sun(c, lerp(260, 820, eve), lerp(760, 1020, eve), 64, '#fff2d0', 0.9 - 0.3 * eve);
      wisps(c, t, 520, 8, '#ffffff', 0.25, 6, 6);
      ridge(c, 900, 240, 0.0026, 51, mix('#7a7aa0', '#3a3a5a', eve)); echoRidge(c, t - tMo, 900, 240, 0.0026, 51, echo, 540, 360);
      haze(c, 920, 200, mix('#f0dcc8', '#e8a888', eve), 0.45);
      ridge(c, 1080, 170, 0.0034, 52, mix('#6a6a7a', '#2e2e44', eve)); echoRidge(c, t - tMo - 0.4, 1080, 170, 0.0034, 52, echo, 540, 360);
      haze(c, 1090, 140, mix('#f0dcc8', '#e8a888', eve), 0.35);
      ridge(c, 1260, 100, 0.004, 53, mix('#5a5a5a', '#24243a', eve)); echoRidge(c, t - tMo - 0.8, 1260, 100, 0.004, 53, echo, 540, 360);
      fgRidge(c, 1440, 40, 0.004, 54, mix('#8a7458', '#4a3a3a', eve), { rim: 'rgba(255,230,190,0.5)' });
      circleBirds(c, t, 540, 820, 16, 320, ramp(t, tO - 0.8, 2.2), 9, mix('#2a1e1a', '#1a1018', eve));
      const dy = ridgeY(540, 1440, 40, 0.004, 54) + 10, dw = { x: 540, y: dy, h: 480, dir: 1, dua: praise > 0.5, light: 1, t, wind: 0.4 };
      fig(c, DAW, dw);
      lightRings(c, 540, dy - 420, t, praise * 0.9, 4, 900);
      lightFromAbove(c, t, 540, 0.3 * praise, 360);
      blurred(c, 10, () => { boulder(c, 60, 2060, 500, 280, '#3a2e24', 8); shrub(c, 1020, 2020, 4.5, '#3a3018', t, 4); });
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c);
      arabicCaption(c, 'يَا جِبَالُ أَوِّبِي مَعَهُ وَالطَّيْرَ', t, tMo - 0.4, tSo - 0.6, 290, 100);
      caption(c, 'Saba, 10', 400, seg(t, tMo + 0.3, tMo + 0.9) * (1 - seg(t, tSo - 0.8, tSo - 0.4)));
      arabicCaption(c, 'بِالْعَشِيِّ وَالْإِشْرَاقِ', t, tSo - 0.4, d + 1, 290, 110);
      caption(c, 'Sad, 18', 400, seg(t, tSo, tSo + 0.6) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 12. "We made iron soft for him: make full coats of mail" (Saba 10-11; Al-Anbiya 80) — "and to Dawud We gave the Zabur" (An-Nisa 163)
  iron: {
    grade: 'rgba(255,170,110,0.16)',
    draw(c, t, d) {
      const tFe = at('iron', 'fer', 0, 1.6), tSo = at('iron', 'souple', 0, 2.4), tCo = at('iron', 'cottes', 0, 3.8), tPr = at('iron', 'protéger', 0, 5.4), tZ = at('iron', 'Zabour', 0, d - 1.0);
      phases(c, t, tZ - 0.7, 0.6, cc => {
        const bend = ease(seg(t, tSo - 0.2, tSo + 1.4)), grow = ease(seg(t, tCo - 0.5, tPr + 0.8)), done = ramp(t, tPr - 0.2, 0.8);
        cam(cc, 1.06 + 0.06 * t / d, lerp(600, 480, ease(seg(t, tCo - 0.8, tCo + 0.4))), 1180);
        // workshop: rough stone walls, a window on the night, the forge glowing
        const wg = cc.createLinearGradient(0, 200, 0, 1400); wg.addColorStop(0, '#1a120e'); wg.addColorStop(1, '#4a3022'); cc.fillStyle = wg; cc.fillRect(-400, -400, W + 800, 1800);
        { const r = rng(12); cc.strokeStyle = 'rgba(0,0,0,0.35)'; cc.lineWidth = 3; for (let row = 0; row < 18; row++) { const y = 300 + row * 62; cc.beginPath(); cc.moveTo(-400, y); cc.lineTo(W + 400, y); cc.stroke();
          for (let x = -400 + (row % 2) * 60; x < W + 400; x += 120 + r() * 30) { cc.beginPath(); cc.moveTo(x, y); cc.lineTo(x, y + 62); cc.stroke(); } } }
        cc.save(); archPath(cc, 820, 760, 180, 300); cc.fillStyle = '#16203a'; cc.fill(); cc.clip(); stars(cc, t, 30, 3, [700, 440, 260, 320]); moon(cc, 860, 560, 22, 0.9); cc.restore();
        cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, 160, 1200, 760, '#ff8a3a', 0.35 + 0.05 * Math.sin(t * 9)); cc.restore();
        cc.fillStyle = '#2a1a12'; cc.fillRect(-400, 1300, W + 800, 900);
        const fg = cc.createLinearGradient(0, 1300, 0, 1400); fg.addColorStop(0, '#5a3a24'); fg.addColorStop(1, '#2a1a12'); cc.fillStyle = fg; cc.fillRect(-400, 1300, W + 800, 100);
        cc.fillStyle = '#3a2a1e'; cc.beginPath(); cc.roundRect(30, 1120, 300, 190, 20); cc.fill(); fire(cc, 180, 1140, 0.8, t); sparks(cc, t, 180, 1060, 14, 4, 0.8);
        anvil(cc, 560, 1330, 1.25);
        // the iron bar on the anvil, glowing, bending softly under his hands (no hammer)
        const heat = 1 - 0.6 * done, bx0 = 470, bx1 = 700, by = 1142;
        cc.strokeStyle = mix('#9a8a80', '#ffb050', heat); cc.lineWidth = 16; cc.lineCap = 'round'; cc.beginPath(); cc.moveTo(bx0, by); cc.quadraticCurveTo((bx0 + bx1) / 2, by - 4 - 120 * bend, bx1 - 30 * bend, by - 60 * bend); cc.stroke();
        cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, (bx0 + bx1) / 2, by - 60 * bend, 160, '#ff9a40', 0.35 * heat * ramp(t, tFe - 0.3, 0.5)); cc.restore();
        // the coat of mail taking shape on its wooden stand
        cc.fillStyle = '#4a2e1a'; cc.fillRect(272, 700, 18, 620); cc.fillRect(120, 720, 322, 16);
        mail(cc, 262, 744, 20, grow, 1 - done * 0.8, t);
        if (done > 0) sparkle(cc, t, 280, 940, 16, 220, 6, done);
        const dw = { x: 820, y: 1500, h: 600, dir: -1, reach: 0.75, light: 0.9, t, wind: 0 };
        fig(cc, DAW, dw);
        sparks(cc, t, (bx0 + bx1) / 2, by - 30, 10 * ramp(t, tSo - 0.2, 0.4), 8, 0.6, 0.6);
        blurred(cc, 9, () => { cc.fillStyle = '#1a100a'; cc.beginPath(); cc.ellipse(980, 2000, 400, 300, 0, 0, 6.283); cc.fill(); });
      }, cc => {
        const q = t - tZ + 0.7;
        cam(cc, 1.0 + 0.05 * q, 540, 1100);
        const g = cc.createRadialGradient(540, 1000, 60, 540, 1000, 1200); g.addColorStop(0, '#5a3a20'); g.addColorStop(1, '#0e0806'); cc.fillStyle = g; cc.fillRect(-300, -300, W + 600, H + 600);
        cc.fillStyle = '#2a1a10'; cc.fillRect(-300, 1330, W + 600, 900);
        lanternBox(cc, 780, 1160, 1.3, t);
        fig(cc, DAW, { x: 520, y: 1330, h: 520, dir: 1, pose: 'sit', light: 1, t });
        book(cc, 640, 1200, 2.0);
        cc.save(); cc.globalCompositeOperation = 'lighter'; rays(cc, 640, 1180, -Math.PI / 2, 1.6, 900, 12, '#ffe8b0', 0.1 * ramp(q, 0.2, 0.8), t, 3); cc.restore();
        sparkle(cc, t, 640, 1100, 18, 220, 8, ramp(q, 0.2, 0.8));
      });
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c);
      arabicCaption(c, 'وَأَلَنَّا لَهُ الْحَدِيدَ', t, tFe - 0.3, tCo - 0.3, 290, 116);
      arabicCaption(c, 'أَنِ اعْمَلْ سَابِغَاتٍ', t, tCo - 0.1, tZ - 0.6, 290, 116);
      caption(c, 'Saba, 10-11', 400, seg(t, tFe + 0.2, tFe + 0.8) * (1 - seg(t, tZ - 0.9, tZ - 0.5)));
      arabicCaption(c, 'وَآتَيْنَا دَاوُودَ زَبُورًا', t, tZ - 0.4, d + 1, 290, 110);
    },
  },

  // 13. The lesson (Al-Baqara 249: "and Allah is with the patient")
  lesson: {
    grade: 'rgba(255,180,130,0.18)',
    draw(c, t, d) {
      const tN = at('lesson', 'nombre', 0, 2.0), tA = at('lesson', 'Allah', 0, 2.8), tE = at('lesson', 'endurent', 0, d - 1.0);
      const back = ease(seg(t, 0.2, tN + 0.8)), pros = t > tA - 0.1;
      cam(c, lerp(1.3, 0.98, back), 540, lerp(1240, 1080, back));
      sky(c, [[0, '#2a2a5a'], [0.28, '#b06a7a'], [0.42, '#ffb070'], [0.5, '#ffe0a8']]);
      sun(c, 540, 1060, 120, '#fff2d0', 0.95);
      c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 540, 1060, -Math.PI / 2, 2.8, 1500, 16, '#ffe8c0', 0.05 + 0.08 * ramp(t, tA, 1.2), t, 13); c.restore();
      wisps(c, t, 560, 8, '#ffd0b0', 0.25, 23, 6);
      rangeFar(c, 1110, '#6a4a5a', 3, 90); haze(c, 1120, 160, '#ffb880', 0.45);
      fgRidge(c, 1300, 60, 0.0035, 61, '#3a2420', { rim: 'rgba(255,210,160,0.8)' });
      // the small company standing on the crest, against the sun
      const xs = [300, 380, 460, 620, 700, 790];
      xs.forEach((x, i) => { const y = ridgeY(x, 1300, 60, 0.0035, 61) + 10, who = i === 1 ? TALUT : BELIEVERS[i];
        const fo = { x, y, h: 230, dir: i < 3 ? 1 : -1, light: 0.5, t: t + i, ink: 0.6, pose: pros && t > tA + 0.3 + i * 0.12 ? 'prostrate' : 'stand' }; fig(c, who, fo);
        if (i === 1 && fo.pose === 'stand') { const [hx, hy, hr] = headOf(fo); crown(c, hx - 4, hy + 2, hr * 1.05); } });
      const dx = 540, dy = ridgeY(dx, 1300, 60, 0.0035, 61) + 10;
      fig(c, DAW, { x: dx, y: dy, h: 250, dir: 1, light: 1, t, pose: pros ? 'prostrate' : 'stand' });
      if (pros) lightFromAbove(c, t, 560, ramp(t, tA, 1.4) * 0.45, 360);
      blurred(c, 10, () => { shrub(c, 80, 2000, 5, '#1a1010', t, 6); shrub(c, 1000, 2020, 4.5, '#1a1010', t, 7); });
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c);
      arabicCaption(c, 'وَاللَّهُ مَعَ الصَّابِرِينَ', t, tA - 0.3, d + 1, 300, 124);
      caption(c, 'Al-Baqara, 249', 420, seg(t, tA + 0.4, tA + 1.0) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 14. Call to action, on the hero image (continuous with the outro and the hook)
  cta: {
    grade: 'rgba(255,180,120,0.14)',
    draw(c, t, d) {
      const od = ((window.TL.scenes || []).find(s => s.id === 'outro') || { dur: 3 }).dur, T = t - d - od;
      dawudHero(c, T, {});
      c.fillStyle = 'rgba(6,8,18,0.25)'; c.fillRect(0, 0, W, H);
      ctaText(c, seg(t, 0.1, 0.6));
    },
  },
  outro: {
    grade: 'rgba(255,180,120,0.14)',
    draw(c, t, d) {
      const T = t - d;
      dawudHero(c, T, {});
      const k = 1 - seg(t, d - 1.4, d - 0.6); // the overlay goes away: the last frame is the first frame
      c.fillStyle = `rgba(6,8,18,${0.25 * k})`; c.fillRect(0, 0, W, H);
      ctaText(c, k);
      const a = seg(t, d - 1.0, d - 0.15);
      topShade(c, a); seriesTag(c, a);
      c.save(); c.direction = 'rtl'; textGlow(c, 'وَقَتَلَ دَاوُودُ جَالُوتَ', W / 2, 290, '700 112px Amiri', '#f6c453', a, '#ffb300', 30); c.restore();
    },
  },

  // cover for TikTok (not in the timeline: rendered by tools/cover.js)
  cover: {
    draw(c) {
      dawudHero(c, 0.4, { pan: 0.35, push: 0.1, released: true, stone: 0.55, stoneS: 4, dy: 170 });
      const g = c.createLinearGradient(0, 0, 0, 760); g.addColorStop(0, 'rgba(6,8,18,0.8)'); g.addColorStop(1, 'rgba(6,8,18,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 760);
      seriesTag(c, 1);
      textGlow(c, 'SEUL FACE', W / 2, 290, '700 132px Lora', '#fff6e0', 1, '#000', 24);
      textGlow(c, 'AU GÉANT', W / 2, 430, '700 132px Lora', '#f6c453', 1, '#000', 24);
      textGlow(c, 'une petite armée contre une armée immense', W / 2, 540, 'italic 500 42px Lora', '#fff3dc', 1, '#000', 14);
      const g2 = c.createLinearGradient(0, 1420, 0, H); g2.addColorStop(0, 'rgba(6,8,18,0)'); g2.addColorStop(1, 'rgba(6,8,18,0.75)'); c.fillStyle = g2; c.fillRect(0, 1420, W, 500);
      c.save(); c.direction = 'rtl'; textGlow(c, 'دَاوُود', W / 2, 1640, '700 160px Amiri', '#f6c453', 1, '#ffb300', 34); c.restore();
      textGlow(c, 'Dawud (David), paix sur lui', W / 2, 1790, 'italic 500 48px Lora', '#fff3dc', 1, '#000', 14);
    },
  },
};
