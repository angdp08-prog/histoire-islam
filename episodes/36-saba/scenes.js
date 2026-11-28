// Episode 36 — The people of Saba and the flood of the dam. Qur'an, Saba 15-19; Ibn Kathir, al-Tabari, al-Qurtubi (tafsir).
// Shared library carried over from the previous episodes (up to 35), then the episode 36 section at the end.
window.NO_INTRO_FADE = true; // the hook image is there from the very first frame
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
  for (let k = 0; k < 3; k++) { const bx = top[0] - 24 + k * 24, by = top[1] + 18; c.strokeStyle = '#a07a2a'; c.lineWidth = 2.5; // hanging bunches of small dates
    c.beginPath(); c.moveTo(top[0] - 4 + k * 4, top[1] + 4); c.quadraticCurveTo(bx, by - 4, bx + (k - 1) * 4, by + 30); c.stroke();
    const rr = rng(seed * 7 + k); for (let j = 0; j < 14; j++) { const q = j / 14, dx = (rr() - 0.5) * 22 * (1 - q * 0.5), dy = 8 + q * 40;
      c.fillStyle = mix('#6a2a0e', '#b0602a', rr()); c.beginPath(); c.ellipse(bx + dx + (k - 1) * 4 * q, by + dy, 3.6, 5.6, 0.3, 0, 6.283); c.fill(); } }
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
  c.save(); c.globalAlpha *= f; c.fillStyle = '#f3e6c8'; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill();
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
function sparkle(c, t, x, y, n, rad, seed, a = 1) { t += 100; // crossfades draw a scene at small negative times: keep every phase (x % 1) positive
  const r = rng(seed); c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const ph = (t * (0.3 + r() * 0.4) + r()) % 1, an = r() * 6.283, d = rad * (0.2 + r() * 0.9), sx = x + Math.cos(an) * d, sy = y + Math.sin(an) * d * 0.8 - ph * 120;
    const tw = Math.sin(ph * Math.PI); if (i % 4 === 0) star4(c, sx, sy, 7 + r() * 8, '#fff2c0', a * tw); else { c.fillStyle = `rgba(255,236,170,${a * tw * 0.8})`; c.beginPath(); c.arc(sx, sy, 2 + r() * 2.5, 0, 6.283); c.fill(); } }
  c.restore(); }

function seriesTag(c, a, ep = 10) { textGlow(c, `LES PROPHÈTES  ·  ÉPISODE ${ep}`, W / 2, 112, '600 32px Lora', '#fbe7c6', a * 0.92, '#000000', 12); }
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
function lightRings(c, x, y, t, a, n = 4, max = 700) { t += 100; // crossfades draw a scene at small negative times: keep every phase (x % 1) positive
  // soft rings of light spreading from a point (praise answered by the mountains)
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

// ======================================================================================================
// ---------- episode 10: Ayyub (Job, alayhi salam)
const AYY = { veilGlow: 0.55, prophet: true, robe: '#ece6d8', wrap: '#f7f3ea', skin: '#c49470', trim: '#cfae6a', band: '#b8954a', inner: '#fbf8f0' };
const WIFE = { agal: false, robe: '#5a3a4e', wrap: '#e0d2bc', skin: '#b07a58', trim: '#b89a62', band: '#8a6a4a', covered: true, inner: '#ece2d0' };
const KIDS = [{ robe: '#7a5236', wrap: '#e8dcc4', skin: '#a8714f', child: true }, { robe: '#3a5a6a', wrap: '#ece4d4', skin: '#b07a58', child: true },
  { robe: '#8a3a2a', wrap: '#e2d6be', skin: '#9a6a4c', child: true }, { robe: '#4a6a3a', wrap: '#efe6d4', skin: '#b4805c', child: true },
  { robe: '#6a4a7a', wrap: '#e6dccc', skin: '#a8714f', child: true, covered: true }, { robe: '#a86a2a', wrap: '#ece0c8', skin: '#94664a', child: true }];

// a tree with recursive branches; leaf 0 = dead and bare, 1 = in full leaf (with a few blossoms)
function tree(c, x, y, s, t, o = {}) {
  const col = o.col || '#4a3428', leaf = o.leaf || 0, r = rng(o.seed || 7), tips = [];
  const dk = mix(col, '#000000', 0.35), lt = mix(col, '#e8c8a0', 0.25);
  const br = (x0, y0, ang, len, w, d) => {
    const sw = Math.sin(t * 0.8 + d * 1.3 + x0 * 0.01) * 0.012 * (5 - d) * (o.wind || 1);
    const a = ang + sw, ex = x0 + Math.cos(a) * len, ey = y0 + Math.sin(a) * len;
    const mx = (x0 + ex) / 2 + Math.cos(a + 1.57) * len * 0.12 * (r() - 0.5), my = (y0 + ey) / 2 + Math.sin(a + 1.57) * len * 0.12 * (r() - 0.5);
    limb(c, [x0, y0], [mx, my], [ex, ey], w, w * 0.62, d < 2 ? dk : col);
    if (d < 2) { c.strokeStyle = hexA(lt, 0.35); c.lineWidth = Math.max(1, w * 0.12); c.beginPath(); c.moveTo(x0 - w * 0.2, y0); c.quadraticCurveTo(mx - w * 0.2, my, ex - w * 0.12, ey); c.stroke(); }
    if (d >= (o.depth || 5)) { tips.push([ex, ey]); return; }
    const n = d < 1 ? 2 : (r() > 0.4 ? 2 : 3);
    for (let k = 0; k < n; k++) br(ex, ey, a + (k - (n - 1) / 2) * (0.5 + r() * 0.35) + (r() - 0.5) * 0.2, len * (0.68 + r() * 0.12), w * 0.66, d + 1);
  };
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.28)'; c.beginPath(); c.ellipse(10, 2, 120, 14, 0, 0, 6.283); c.fill();
  limb(c, [-34, 4], [-10, -10], [0, -20], 30, 30, dk); limb(c, [36, 4], [10, -8], [0, -20], 26, 26, dk); // roots
  br(0, 0, -Math.PI / 2 + (o.lean || 0), 150, 46, 0);
  if (leaf > 0) {
    const g1 = o.leafCol || '#5a7a3a', g2 = mix(g1, '#000000', 0.3), g3 = mix(g1, '#e8f0a0', 0.3), rr = rng(99);
    tips.forEach(([tx, ty], i) => { const k = clamp(leaf * 1.4 - rr() * 0.4); if (k <= 0) return;
      for (let j = 0; j < 3; j++) { const lx = tx + (rr() - 0.5) * 50, ly = ty + (rr() - 0.5) * 40, R = (22 + rr() * 16) * ease(k);
        c.fillStyle = j === 0 ? g2 : j === 1 ? g1 : g3; c.beginPath(); c.ellipse(lx + Math.sin(t + i) * 2, ly, R * 1.2, R, rr() * 3, 0, 6.283); c.fill(); }
      if (o.bloom && i % 3 === 0) { c.fillStyle = hexA('#fff0f4', o.bloom * k); c.beginPath(); c.arc(tx + 6, ty - 6, 6, 0, 6.283); c.fill(); } });
  } else if (o.lastLeaves) { const rr = rng(5); tips.forEach(([tx, ty], i) => { if (i % 4) return; c.fillStyle = hexA('#8a7a3a', o.lastLeaves); c.beginPath(); c.ellipse(tx, ty + 6, 7, 4, rr() * 3, 0, 6.283); c.fill(); }); }
  c.restore();
}
// mud-brick house with a flat roof, protruding beams, a door and a small window (lamp light); ruin collapses the right corner
function house(c, x, y, w, h, col, o = {}) {
  const lt = mix(col, '#fff0d8', 0.25), dk = mix(col, '#1a0c06', 0.45), ruin = o.ruin || 0;
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(x + w * 0.1, y + 4, w * 0.62, 16, 0, 0, 6.283); c.fill();
  const top = xx => y - h + (xx > x + w * 0.15 ? ruin * Math.pow((xx - x - w * 0.15) / (w * 0.35), 1.2) * h * 0.45 + (ruin > 0 ? Math.sin(xx * 0.3) * 6 * ruin : 0) : 0);
  c.beginPath(); c.moveTo(x - w / 2, y); for (let xx = x - w / 2; xx <= x + w / 2; xx += 6) c.lineTo(xx, top(xx)); c.lineTo(x + w / 2, y); c.closePath();
  const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, lt); g.addColorStop(0.6, col); g.addColorStop(1, dk); c.fillStyle = g; c.fill();
  c.save(); c.clip();
  c.strokeStyle = hexA(dk, 0.18); c.lineWidth = 2; // brick courses
  for (let yy = y - 14; yy > y - h; yy -= 22) { c.beginPath(); c.moveTo(x - w / 2, yy); c.lineTo(x + w / 2, yy); c.stroke();
    for (let xx = x - w / 2 + ((yy / 22) % 2 ? 20 : 0); xx < x + w / 2; xx += 40) { c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx, yy + 22); c.stroke(); } }
  const gv = c.createLinearGradient(0, y - h, 0, y); gv.addColorStop(0, 'rgba(255,240,210,0.12)'); gv.addColorStop(1, 'rgba(20,10,5,0.3)'); c.fillStyle = gv; c.fillRect(x - w / 2, y - h, w, h);
  c.restore();
  c.fillStyle = mix(col, '#fff2dc', 0.35); c.fillRect(x - w / 2 - 6, y - h - 6, w * (ruin > 0 ? 0.55 : 1) + 12, 10); // roof edge
  c.fillStyle = '#4a3020'; for (let k = 0; k < 6; k++) { const bx = x - w / 2 + 20 + k * (w - 40) / 5; if (ruin > 0 && bx > x + w * 0.1) continue; c.fillRect(bx - 5, y - h + 8, 10, 8); c.fillRect(bx - 4, y - h + 8, 8, -0); c.fillRect(bx - 5, y - h + 4, 22, 7); }
  // door
  const dx = x - w * 0.18, dw = w * 0.2, dh = h * 0.55;
  c.fillStyle = mix(col, '#000000', 0.3); c.beginPath(); archPath(c, dx, y, dw + 12, dh + 10); c.fill();
  c.fillStyle = o.doorOpen ? '#120a06' : '#5a3a22'; c.beginPath(); archPath(c, dx, y, dw, dh); c.fill();
  if (!o.doorOpen) { c.strokeStyle = '#3a2414'; c.lineWidth = 2; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(dx - dw / 2 + k * dw / 4, y); c.lineTo(dx - dw / 2 + k * dw / 4, y - dh + 10); c.stroke(); } }
  // window with lamp light
  const wx = x + w * 0.22, wy = y - h * 0.6, lamp = o.lamp || 0;
  c.fillStyle = mix('#1a0e08', '#ffc070', lamp * (0.85 + 0.15 * Math.sin((o.t || 0) * 7))); c.fillRect(wx - 18, wy - 24, 36, 40);
  c.strokeStyle = '#3a2414'; c.lineWidth = 4; c.strokeRect(wx - 18, wy - 24, 36, 40); c.beginPath(); c.moveTo(wx, wy - 24); c.lineTo(wx, wy + 16); c.stroke();
  if (lamp > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, wx, wy - 4, 110, '#ffb060', 0.35 * lamp); c.restore(); }
  if (ruin > 0) { const r = rng(4); for (let k = 0; k < 14; k++) { const rx = x + w * 0.1 + r() * w * 0.55, ry = y - r() * 10; c.fillStyle = mix(col, r() > 0.5 ? '#000000' : '#fff0d8', 0.25); c.beginPath(); c.ellipse(rx, ry, 10 + r() * 16, 6 + r() * 8, r(), 0, 6.283); c.fill(); } }
  if (o.smoke) smoke(c, o.t || 0, wx, wy - 30, 4, 3, '#cfc6bc', 0.12 * o.smoke, 0.4, 20);
}
// wooden pen fence: posts and two rails; broken > 0 leans posts and drops rails
function fence(c, x0, x1, y, h, broken, seed = 3) {
  const r = rng(seed), n = Math.round((x1 - x0) / 70);
  const posts = []; for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n), lean = broken * (r() - 0.5) * 0.7, gone = broken > 0.5 && r() < 0.25 * broken; posts.push([x, lean, gone]); }
  c.lineCap = 'round';
  for (let rail = 0; rail < 2; rail++) for (let i = 0; i < n; i++) { if (broken > 0 && r() < broken * 0.5) continue;
    const [xa, la] = posts[i], [xb, lb] = posts[i + 1], ya = y - h * (0.45 + rail * 0.4), sag = broken * (r() - 0.3) * 30;
    c.strokeStyle = '#4a3020'; c.lineWidth = 8; c.beginPath(); c.moveTo(xa + Math.sin(la) * h * (0.45 + rail * 0.4), ya); c.lineTo(xb + Math.sin(lb) * h * (0.45 + rail * 0.4), ya + sag); c.stroke(); }
  posts.forEach(([x, la, gone]) => { if (gone) return; c.strokeStyle = '#3a2414'; c.lineWidth = 12; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(la) * h, y - Math.cos(la) * h); c.stroke();
    c.strokeStyle = 'rgba(255,220,170,0.25)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 3, y); c.lineTo(x - 3 + Math.sin(la) * h, y - Math.cos(la) * h); c.stroke(); });
}
// dry cracked earth: gradient ground, a network of cracks bigger toward the viewer, pebbles; glow lights cracks around (gx, gy)
function dryGround(c, y, t, o = {}) {
  const col = o.col || '#9a7a5a', r = rng(o.seed || 3);
  const g = c.createLinearGradient(0, y, 0, H + 400); g.addColorStop(0, mix(col, '#fff0d8', 0.18)); g.addColorStop(0.45, col); g.addColorStop(1, mix(col, '#1a0c06', 0.5));
  c.fillStyle = g; c.fillRect(-2400, y, W + 4800, H + 2400);
  const lines = [];
  for (let i = 0; i < (o.n || 120); i++) { const q = Math.pow(r(), 1.5), yy = y + 10 + q * (H + 300 - y), k = 0.15 + q * 1.6; let x = -1400 + r() * (W + 2800), py = yy;
    const pts = [[x, py]]; for (let s = 0; s < 4; s++) { x += (20 + r() * 50) * k * (r() > 0.5 ? 1 : -1) + 30 * k; py += (r() - 0.5) * 18 * k; pts.push([x, py]); } lines.push([pts, k]); }
  c.lineCap = 'round'; c.lineJoin = 'round';
  lines.forEach(([pts, k]) => { c.strokeStyle = hexA(mix(col, '#000000', 0.55), 0.55); c.lineWidth = 1 + k * 2.2; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke();
    c.strokeStyle = hexA(mix(col, '#fff0d8', 0.35), 0.25); c.lineWidth = 1; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1] + 2 + k) : c.moveTo(p[0], p[1] + 2 + k)); c.stroke(); });
  if (o.glow > 0) { c.save(); c.globalCompositeOperation = 'lighter';
    lines.forEach(([pts, k], i) => { const d = Math.hypot(pts[2][0] - o.gx, (pts[2][1] - o.gy) * 2.2), a = o.glow * clamp(1 - d / (o.gr || 500)) * (0.7 + 0.3 * Math.sin(t * 3 + i));
      if (a <= 0.01) return; c.strokeStyle = `rgba(255,${200 + 40 * (o.wet || 0) | 0},${120 + 120 * (o.wet || 0) | 0},${a})`; c.lineWidth = 2 + k * 3; c.beginPath(); pts.forEach((p, j) => j ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); });
    glow(c, o.gx, o.gy, (o.gr || 500) * 0.6, o.wet ? '#c8ecff' : '#ffc870', 0.25 * o.glow); c.restore(); }
  for (let i = 0; i < (o.pebbles || 60); i++) { const q = Math.pow(r(), 1.6), yy = y + 20 + q * (H + 300 - y), x = -1400 + r() * (W + 2800), sz = 3 + q * 18;
    c.fillStyle = hexA(mix(col, r() > 0.5 ? '#000000' : '#fff0d8', 0.35), 0.6); c.beginPath(); c.ellipse(x, yy, sz, sz * 0.45, 0, 0, 6.283); c.fill(); }
}
// the spring of Ayyub (Sad 42): a jet of clear water, spray droplets, a pool spreading on the ground, ripples, glints
function spring(c, x, y, k, t, s = 1, o = {}) { t += 100; // crossfades draw a scene at small negative times: keep every phase (x % 1) positive
 
  if (k <= 0) return;
  const pool = ease(clamp(k * 1.3)), jet = (o.jet === undefined ? 1 : o.jet) * ease(clamp(k * 2)) * (1 - 0.35 * clamp(k * 1.5 - 1));
  // pool
  const pr = 230 * s * pool;
  if (pr > 2) { const g = c.createRadialGradient(x, y, 0, x, y, pr); g.addColorStop(0, 'rgba(160,215,235,0.95)'); g.addColorStop(0.7, 'rgba(70,140,170,0.9)'); g.addColorStop(1, 'rgba(60,110,130,0)');
    c.fillStyle = g; c.beginPath(); c.ellipse(x, y, pr, pr * 0.24, 0, 0, 6.283); c.fill();
    c.strokeStyle = 'rgba(40,70,60,0.45)'; c.lineWidth = 4 * s; c.beginPath(); c.ellipse(x, y + 2, pr * 0.96, pr * 0.23, 0, 0, Math.PI); c.stroke();
    for (let j = 0; j < 4; j++) { const ph = (t * 0.6 + j / 4) % 1; c.strokeStyle = `rgba(235,250,255,${0.45 * (1 - ph) * pool})`; c.lineWidth = 2.5 * s; c.beginPath(); c.ellipse(x, y, pr * ph * 0.9 + 10, (pr * ph * 0.9 + 10) * 0.24, 0, 0, 6.283); c.stroke(); }
    c.save(); c.globalCompositeOperation = 'lighter'; const r = rng(17); for (let j = 0; j < 30; j++) { const a = r() * 6.283, d = Math.sqrt(r()) * pr * 0.85; c.fillStyle = `rgba(255,250,230,${0.5 * pool * (0.5 + 0.5 * Math.sin(t * 4 + j * 1.9)) ** 2})`; c.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.24, 10 * s, 2 * s); } c.restore(); }
  // jet: a column of water that rises, falls back in arcs
  if (jet > 0.01) { const hh = 300 * s * jet;
    c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y - hh * 0.5, hh * 0.8, '#d8f4ff', 0.3 * jet); c.restore();
    const g = c.createLinearGradient(0, y - hh, 0, y); g.addColorStop(0, 'rgba(240,252,255,0.25)'); g.addColorStop(0.3, 'rgba(225,246,255,0.85)'); g.addColorStop(1, 'rgba(170,220,240,0.9)');
    c.fillStyle = g; c.beginPath(); c.moveTo(x - 18 * s, y); c.quadraticCurveTo(x - 10 * s + Math.sin(t * 9) * 3, y - hh * 0.6, x - 4 * s, y - hh); c.lineTo(x + 4 * s, y - hh); c.quadraticCurveTo(x + 10 * s + Math.sin(t * 8) * 3, y - hh * 0.6, x + 18 * s, y); c.closePath(); c.fill();
    const r = rng(23); // spray: droplets on ballistic arcs
    for (let j = 0; j < 70; j++) { const ph = (t * (0.9 + r() * 0.5) + r()) % 1, vx = (r() - 0.5) * 340 * s, top = hh * (0.7 + r() * 0.35);
      const px = x + vx * ph, py = y - top + 4 * top * (ph - 0.5) ** 2; if (py > y + 4) continue;
      c.fillStyle = `rgba(230,248,255,${0.85 * (1 - ph * 0.6) * jet})`; c.beginPath(); c.ellipse(px, py, (2 + r() * 3) * s, (3 + r() * 4) * s, Math.atan2(vx, 1) * 0.3, 0, 6.283); c.fill(); }
    c.fillStyle = `rgba(250,255,255,${0.7 * jet})`; c.beginPath(); c.ellipse(x, y - hh, 22 * s, 12 * s, 0, 0, 6.283); c.fill(); }
}
// clay oil lamp; flame 0..1 (smoke wisp when it goes out)
function oilLamp(c, x, y, s, flame, t, out = 0) { t += 100; // crossfades draw a scene at small negative times: keep every phase (x % 1) positive
 
  c.save(); c.translate(x, y); c.scale(s, s);
  if (flame > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 22, -30, 220, '#ffb060', 0.45 * flame * (0.9 + 0.1 * Math.sin(t * 9))); c.restore(); }
  c.fillStyle = '#8a5a34'; c.beginPath(); c.ellipse(0, -10, 30, 14, 0, 0, 6.283); c.fill(); c.beginPath(); c.moveTo(14, -16); c.quadraticCurveTo(30, -18, 34, -14); c.lineTo(30, -6); c.quadraticCurveTo(20, -4, 12, -6); c.fill();
  c.fillStyle = '#5a3a20'; c.beginPath(); c.ellipse(-4, -18, 10, 4, 0, 0, 6.283); c.fill(); c.fillStyle = '#b07a48'; c.fillRect(-26, -12, 50, 3);
  if (flame > 0) { c.fillStyle = hexA('#ffb347', flame); c.beginPath(); c.moveTo(28, -16); c.quadraticCurveTo(26 + Math.sin(t * 8) * 3, -30 * flame, 32 + Math.sin(t * 11) * 3, -44 * flame); c.quadraticCurveTo(38, -28 * flame, 34, -16); c.fill();
    c.fillStyle = hexA('#fff2c0', flame); c.beginPath(); c.ellipse(32, -22 * flame, 2.5, 6 * flame, 0, 0, 6.283); c.fill(); }
  if (out > 0) for (let k = 0; k < 5; k++) { const ph = (t * 0.5 + k / 5) % 1; c.fillStyle = `rgba(200,195,190,${0.25 * out * (1 - ph)})`; c.beginPath(); c.arc(32 + Math.sin(t * 2 + k) * 8 * ph, -20 - ph * 120, 6 + ph * 14, 0, 6.283); c.fill(); }
  c.restore();
}
function bowl(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#6a4024'; c.beginPath(); c.moveTo(-26, -8); c.quadraticCurveTo(0, 22, 26, -8); c.closePath(); c.fill();
  c.fillStyle = '#d8a860'; c.beginPath(); c.ellipse(-6, -10, 12, 6, 0.2, 0, 6.283); c.fill(); c.beginPath(); c.ellipse(8, -11, 10, 5, -0.2, 0, 6.283); c.fill(); c.fillStyle = '#8a5a34'; c.fillRect(-26, -10, 52, 3); c.restore(); }
// wheat with a continuous dryness d (0 green-gold and upright, 1 brown, bent and broken)
function wheatD(c, x, y, s, d, t) {
  const r = rng(Math.floor(x * 13 + y)), col = mix(mix('#c8b050', '#e0c060', r()), '#6a4a2a', d);
  for (let i = 0; i < 6; i++) { const bx = x + (i - 2.5) * 13 * s, bend = Math.sin(t * 1.6 + i + x * 0.01) * 7 * s * (1 - d) + d * (50 + r() * 30) * s, top = y - (150 + r() * 60) * s * (1 - 0.35 * d);
    c.strokeStyle = col; c.lineWidth = 3 * s; c.beginPath(); c.moveTo(bx, y); c.quadraticCurveTo(bx, (y + top) / 2, bx + bend, top + d * 40 * s); c.stroke();
    c.fillStyle = col; for (let k = 0; k < 5; k++) { const ky = top + d * 40 * s + k * 9 * s, kx = bx + bend * (1 - k * 0.08);
      c.beginPath(); c.ellipse(kx - 5 * s, ky, 4 * s, 8 * s * (1 - 0.4 * d), -0.5, 0, 6.283); c.fill(); c.beginPath(); c.ellipse(kx + 5 * s, ky, 4 * s, 8 * s * (1 - 0.4 * d), 0.5, 0, 6.283); c.fill(); } }
}
function field(c, x0, x1, y0, rows, s, d, t) { for (let j = 0; j < rows; j++) { const yy = y0 + j * 34 * s, ss = s * (0.8 + j * 0.08); for (let x = x0 + (j % 2) * 30; x < x1; x += 70 * ss) wheatD(c, x, yy, ss, d, t); } }
// the valley of Ayyub (Hawran, according to the exegetes): far hills, olive terraces, fields, pen, house. dry 0 -> 1
function ridgeW(c, y, amp, freq, seed, color) { c.fillStyle = color; c.beginPath(); c.moveTo(-2600, H + 400);
  for (let x = -2600; x <= 3700; x += 16) c.lineTo(x, ridgeY(x, y, amp, freq, seed)); c.lineTo(3700, H + 400); c.closePath(); c.fill(); }
function hazeW(c, y, h, col, a) { const g = c.createLinearGradient(0, y - h, 0, y); g.addColorStop(0, hexA(col, 0)); g.addColorStop(1, hexA(col, a)); c.fillStyle = g; c.fillRect(-2600, y - h, 6300, h); }
function valley(c, t, o = {}) {
  const d = o.dry || 0, cx = o.cx === undefined ? 540 : o.cx;
  par(c, -0.6, cx - 540, 0, () => { ridgeW(c, 980, 130, 0.0035, 11, mix('#7a8aa0', '#8a7a78', d)); hazeW(c, 990, 200, mix('#f0dcc0', '#c8a890', d), 0.5); });
  par(c, -0.3, cx - 540, 0, () => { ridgeW(c, 1080, 70, 0.003, 12, mix('#7a8a5a', '#8a7458', d));
    for (let i = -6; i < 14; i++) oliveTree(c, i * 160 + 40, 1110 + (i % 2) * 16, 0.45, mix('#6a7a48', '#7a6a4a', d), mix('#4a5a30', '#4a3a28', d), Math.sin(t + i) * 2 * (1 + 2 * (o.storm || 0)));
    hazeW(c, 1120, 120, mix('#f0dcc0', '#c8a890', d), 0.3); });
  plain(c, 1180, t, { col: mix('#8a9a4a', '#9a7a5a', d), seed: 9, n: Math.round(lerp(170, 60, d)) });
  if (d > 0.3) { c.save(); c.globalAlpha = seg(d, 0.3, 1); dryGround(c, 1184, t, { col: '#9a7a5a', seed: 5, n: 90, pebbles: 20 }); c.restore(); }
  field(c, -60, 980, 1215, 4, 0.75, o.fieldDry === undefined ? d : o.fieldDry, t);
  fence(c, -900, -120, 1300, 90, o.fenceBroken || 0, 4);
  house(c, 1390, 1330, 380, 250, mix('#c8a47a', '#a88a6a', d), { lamp: o.lamp || 0, t, doorOpen: o.doorOpen, smoke: o.smoke, ruin: o.ruin || 0 });
  tree(c, 1660, 1350, 0.9, t, { leaf: o.treeLeaf === undefined ? 1 - d : o.treeLeaf, seed: 12, leafCol: '#5a7a3a', wind: 1 + 2 * (o.storm || 0) });
}
function herd(c, t, x0, y, n, o = {}) { // sheep grazing in loose rows; run > 0 moves them (feet driven by distance)
  for (let i = 0; i < n; i++) { const r = rng(i * 7 + 3); const sx = x0 + (i % 6) * 120 + r() * 40 - (o.run || 0), sy = y + Math.floor(i / 6) * 60 + r() * 20;
    sheep(c, sx, sy, 0.9 + (sy - y) * 0.003, (o.run ? (o.run / 40) : t) + i, o.dir || (i % 3 ? 1 : -1), { graze: !o.run }); }
}
function camels(c, t, x, y, n, o = {}) { for (let i = 0; i < n; i++) { const cx = x + i * 260 - (o.run || 0), s = 0.75 + i * 0.05;
  camel(c, cx, y + i * 30, s, mix('#b0845a', '#000000', i * 0.08), o.run ? camelT(o.run, s) + i : 0, o.dir || -1, i % 2 ? '#7a3a2a' : null, { walk: !!o.run, head: o.run ? 0 : 0.6 + 0.4 * Math.sin(t * 0.4 + i) }); } }
function moonArc(c, t, cyc, a = 1) { // the moon crossing the sky again and again (long years passing)
  const ph = cyc % 1, x = lerp(-120, 1200, ph), y = 620 - Math.sin(ph * Math.PI) * 360;
  moon(c, x, y, 50, a * Math.sin(ph * Math.PI) ** 0.4, 0.2 + 0.6 * ((Math.floor(cyc) * 0.37) % 1));
}
function shelter(c, x, y, s, t, col = '#8a7a64') { // a tattered cloth stretched on two sticks (a lean-to), the hem moving in the wind
  c.save(); c.translate(x, y); c.scale(s, s);
  c.strokeStyle = '#3a2614'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(-150, 0); c.lineTo(-140, -260); c.moveTo(150, 0); c.lineTo(140, -230); c.stroke();
  c.fillStyle = col; c.beginPath(); c.moveTo(-150, -262); c.lineTo(146, -232);
  for (let i = 0; i <= 10; i++) { const q = i / 10; c.lineTo(lerp(146, -150, q), -160 + Math.sin(t * 2.5 + q * 6) * 6 + (i % 2) * 10); } c.closePath(); c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.2)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-100, -255); c.lineTo(-110, -170); c.moveTo(20, -244); c.lineTo(14, -168); c.stroke();
  c.restore();
}
function oven(c, x, y, s, t, fire = 1) { // a clay bread oven (tannur), glowing mouth, smoke
  c.save(); c.translate(x, y); c.scale(s, s);
  const g = c.createLinearGradient(-80, 0, 80, 0); g.addColorStop(0, '#c89a6a'); g.addColorStop(1, '#7a5a3a');
  c.fillStyle = g; c.beginPath(); c.moveTo(-90, 0); c.quadraticCurveTo(-96, -120, -50, -150); c.lineTo(50, -150); c.quadraticCurveTo(96, -120, 90, 0); c.closePath(); c.fill();
  c.fillStyle = '#2a1408'; c.beginPath(); c.ellipse(0, -150, 52, 14, 0, 0, 6.283); c.fill();
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -150, 160, '#ff8a3a', 0.35 * fire * (0.9 + 0.1 * Math.sin(t * 9))); c.fillStyle = hexA('#ffb050', 0.6 * fire); c.beginPath(); c.ellipse(0, -150, 40, 9, 0, 0, 6.283); c.fill(); c.restore();
  c.fillStyle = '#2a1408'; c.beginPath(); archPath(c, 0, -6, 46, 50); c.fill(); c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = hexA('#ff9a40', 0.5 * fire); c.beginPath(); archPath(c, 0, -10, 30, 34); c.fill(); c.restore();
  c.restore(); smoke(c, t, x, y - 160 * s, 5, 8, '#d8cfc4', 0.14, 0.5, 30);
}
function stomp(c, x, y, s, lift, t) { // close-up: the hem of a white robe, the ankle, a sandalled foot (no face, no body part beyond the foot)
  c.save(); c.translate(x, y - lift); c.scale(s, s);
  const skin = '#c49470';
  c.fillStyle = mix(skin, '#000000', 0.12); c.beginPath(); c.moveTo(-34, -150); c.lineTo(30, -150); c.lineTo(26, -40); c.lineTo(-30, -40); c.closePath(); c.fill(); // ankle
  c.fillStyle = '#3a2618'; c.beginPath(); c.ellipse(30, -6, 120, 22, 0, 0, 6.283); c.fill(); // sole
  const g = c.createLinearGradient(0, -80, 0, 0); g.addColorStop(0, mix(skin, '#fff0d8', 0.2)); g.addColorStop(1, mix(skin, '#000000', 0.2));
  c.fillStyle = g; c.beginPath(); c.moveTo(-40, -60); c.quadraticCurveTo(-46, -10, -20, -18); c.lineTo(130, -20); c.quadraticCurveTo(150, -30, 130, -46); c.quadraticCurveTo(40, -60, 20, -90); c.lineTo(-30, -90); c.closePath(); c.fill();
  c.fillStyle = mix(skin, '#000000', 0.1); for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(118 - k * 18, -30 + k * 1.5, 11, 9, 0, 0, 6.283); c.fill(); }
  c.strokeStyle = '#5a3a22'; c.lineWidth = 10; c.beginPath(); c.moveTo(-34, -60); c.lineTo(60, -26); c.moveTo(70, -48); c.lineTo(84, -20); c.stroke();
  // the white hem falling over the ankle
  const hg = c.createLinearGradient(-160, 0, 160, 0); hg.addColorStop(0, '#cfc8ba'); hg.addColorStop(0.5, '#fbf8f0'); hg.addColorStop(1, '#ddd6c8');
  const sw = Math.sin(t * 3) * 6, hem = [];
  for (let i = 0; i <= 12; i++) { const q = i / 12; hem.push([lerp(170, -160, q) + (i % 2 ? 0 : sw), -122 + Math.sin(q * Math.PI * 3 + t * 2) * 8 + (i % 2) * 10]); }
  c.fillStyle = hg; c.beginPath(); c.moveTo(-110, -1500); c.lineTo(110, -1500); c.quadraticCurveTo(130, -600, 170 + sw, -122); hem.forEach(p => c.lineTo(p[0], p[1])); c.quadraticCurveTo(-130, -600, -110, -1500); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(80,70,50,0.16)'; c.lineWidth = 5; c.beginPath(); // folds
  [-70, -20, 40, 95].forEach((fx, k) => { c.moveTo(fx * 0.6, -1400); c.quadraticCurveTo(fx * 0.9 + Math.sin(t + k) * 4, -600, fx * 1.25 + sw * 0.5, -130); }); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-10, -1400); c.quadraticCurveTo(-4, -700, 4, -140); c.stroke();
  c.strokeStyle = '#cfae6a'; c.lineWidth = 7; c.beginPath(); hem.forEach((p, i) => i ? c.lineTo(p[0], p[1] - 6) : c.moveTo(p[0], p[1] - 6)); c.stroke();
  c.restore();
}

function judeanHills(c, t, o = {}) { // dawn hills: layered ranges, terraces of olive trees, mist
  rangeFar(c, o.y || 980, o.far || '#6a6a8a', 11, 130); haze(c, (o.y || 980) + 10, 200, o.haze || '#f0c0a0', 0.5);
  ridge(c, (o.y || 980) + 90, 80, 0.003, 12, o.mid || '#7a7a6a'); haze(c, (o.y || 980) + 100, 140, o.haze || '#f0c0a0', 0.35);
  for (let i = -2; i < 9; i++) oliveTree(c, i * 150 + 40, (o.y || 980) + 150 + (i % 2) * 14, 0.42, o.olive || '#6a7458', mix(o.olive || '#6a7458', '#000000', 0.3), Math.sin(t + i) * 2);
}
function stormSky(c, t, a = 1) { cloudBank(c, t, 160, 8, '#1a1620', 0.55 * a, 12, 8); cloudBank(c, t, 420, 7, '#2a2230', 0.45 * a, 13, 5); }

// ---------- episode 11: characters
const ZAK = { veilGlow: 0.55, prophet: true, robe: '#ebe5d6', wrap: '#f7f3ea', skin: '#c49470', trim: '#cfae6a', band: '#b8954a', inner: '#fbf8f0' };
const YAH = { veilGlow: 0.5, prophet: true, child: true, robe: '#efe9dc', wrap: '#f8f5ee', skin: '#c49470', trim: '#d8bf80', band: '#c9a35a', inner: '#fcfaf4' };
const ISH = { agal: false, robe: '#4a3a52', wrap: '#ddd2c0', skin: '#b07a58', trim: '#a8946a', band: '#7a6a5a', covered: true, inner: '#e6dccb' }; // his wife (never named in the Qur'an)
const MAR = { agal: false, robe: '#2a3a5e', wrap: '#eee8dc', skin: '#b4805c', trim: '#c9b07a', band: '#8a7a5a', covered: true, inner: '#f2ece0' }; // Maryam
const STONE = '#d6b98e';

// ---------- episode 11: sets
function flagFloor(c, fy, vx = 540, col = '#b89a72', o = {}) { // flagstones in perspective (temple courtyard / sanctuary)
  const g = c.createLinearGradient(0, fy, 0, H + 500); g.addColorStop(0, mix(col, '#fff0d8', 0.12)); g.addColorStop(0.5, col); g.addColorStop(1, mix(col, '#1a0c06', 0.5));
  c.fillStyle = g; c.fillRect(-1800, fy, W + 3600, H + 1200);
  c.strokeStyle = 'rgba(40,22,10,0.25)'; c.lineWidth = 2;
  for (let i = -26; i <= 26; i++) { c.beginPath(); c.moveTo(vx + i * 70, fy); c.lineTo(vx + i * 470, H + 900); c.stroke(); }
  for (let k = 1; k < 14; k++) { const yy = fy + Math.pow(k / 14, 1.8) * (H + 900 - fy); c.beginPath(); c.moveTo(-1800, yy); c.lineTo(W + 1800, yy); c.stroke(); }
  c.fillStyle = 'rgba(30,16,8,0.25)'; c.fillRect(-1800, fy, W + 3600, 6);
  if (o.sheen) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, o.sheenX || vx, fy + 200, 700, o.sheenCol || '#ffd8a0', o.sheen); c.restore(); }
}
function ashlar(c, x0, y0, x1, y1, col, seed = 3) { // a wall of dressed stone blocks
  const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, mix(col, '#1a0c06', 0.3)); g.addColorStop(1, col);
  c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  const r = rng(seed), dk = mix(col, '#1a0c06', 0.6);
  for (let y = y1, row = 0; y > y0; y -= 46, row++) {
    for (let x = x0 + (row % 2) * 60 - 60; x < x1; x += 120) {
      const v = r(); if (v < 0.35) { c.fillStyle = hexA(v < 0.17 ? '#fff2dc' : '#1a0c06', 0.04 + r() * 0.05); c.fillRect(x + 2, y - 44, 116, 42); }
      c.fillStyle = hexA('#fff2dc', 0.07); c.fillRect(x + 2, y - 44, 116, 3); }
    c.strokeStyle = hexA(dk, 0.32); c.lineWidth = 2; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y);
    for (let x = x0 + (row % 2) * 60 - 60; x < x1; x += 120) { c.moveTo(x, y); c.lineTo(x, y - 46); } c.stroke();
  }
}
function templeFacade(c, t, o = {}) { // the Temple of Jerusalem seen from its courtyard: stone wall, blind arcade, great arched door lit from inside
  const fy = o.fy || 1300, dx = o.doorX || 620, top = fy - 760, gk = o.glow === undefined ? 0.6 : o.glow;
  ashlar(c, -1100, top, W + 1100, fy, STONE, 5);
  c.fillStyle = mix(STONE, '#1a0c06', 0.35); c.fillRect(-1100, top - 30, W + 2200, 34);
  c.fillStyle = mix(STONE, '#fff2dc', 0.25); c.fillRect(-1100, top - 40, W + 2200, 12);
  for (let x = -1100; x < W + 1100; x += 72) { c.fillStyle = mix(STONE, '#1a0c06', 0.18); c.fillRect(x, top - 84, 40, 46); c.fillStyle = hexA('#fff2dc', 0.18); c.fillRect(x, top - 84, 40, 5); }
  for (let i = -5; i <= 6; i++) { const ax = dx + i * 230; if (Math.abs(ax - dx) < 220) continue;
    c.save(); c.beginPath(); archPath(c, ax, top + 330, 120, 240); c.fillStyle = mix(STONE, '#1a0c06', 0.5); c.fill(); c.clip(); lattice(c, ax - 70, top + 70, 140, 270, '#f0d8b0', 0.22, 22);
    if (o.windows) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, ax, top + 240, 90, '#ffb060', 0.35 * o.windows); c.restore(); } c.restore();
    c.strokeStyle = mix(STONE, '#fff2dc', 0.3); c.lineWidth = 6; c.beginPath(); archPath(c, ax, top + 334, 136, 252); c.stroke();
    c.fillStyle = mix(STONE, '#1a0c06', 0.25); c.fillRect(ax - 76, top + 334, 152, 12); }
  const dw = 300, dh = 600;
  c.fillStyle = mix(STONE, '#fff2dc', 0.22); c.beginPath(); archPath(c, dx, fy, dw + 70, dh + 56); c.fill();
  c.strokeStyle = mix(STONE, '#1a0c06', 0.35); c.lineWidth = 4; c.beginPath(); archPath(c, dx, fy, dw + 70, dh + 56); c.stroke();
  c.strokeStyle = hexA(GOLD, 0.7); c.lineWidth = 3; c.beginPath(); archPath(c, dx, fy, dw + 30, dh + 26); c.stroke();
  const ig = c.createLinearGradient(0, fy - dh, 0, fy); ig.addColorStop(0, mix('#2a1408', '#c07838', gk * 0.7)); ig.addColorStop(1, mix('#1a0c06', '#ffd8a0', gk * 0.85));
  c.fillStyle = ig; c.beginPath(); archPath(c, dx, fy, dw, dh); c.fill();
  c.save(); c.beginPath(); archPath(c, dx, fy, dw, dh); c.clip();
  c.fillStyle = hexA('#2a1408', 0.45); c.beginPath(); archPath(c, dx, fy - 30, 130, 280); c.fill();
  c.strokeStyle = '#2a1a10'; c.lineWidth = 2; c.beginPath(); c.moveTo(dx, fy - dh); c.lineTo(dx, fy - dh + 190); c.stroke(); lanternBox(c, dx, fy - dh + 220, 1.1, t, 2);
  c.restore();
  if (gk > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, dx, fy - 220, 460, '#ffc070', 0.3 * gk); c.restore(); }
  for (let k = 0; k < 3; k++) { const w = dw + 140 + k * 70; c.fillStyle = mix(STONE, '#fff2dc', 0.18 - k * 0.05); c.fillRect(dx - w / 2, fy + k * 20, w, 20); c.fillStyle = hexA('#1a0c06', 0.25); c.fillRect(dx - w / 2, fy + k * 20 + 16, w, 4); }
  (o.cols || [dx - 330, dx + 330]).forEach(x => column(c, x, fy, 74, 720, STONE));
}
function hillsBehind(c, t, y, o = {}) { // Judean hills over the wall, cypresses
  ridgeW(c, y - 40, 110, 0.0035, 8, o.far || '#5a4a6a'); hazeW(c, y - 30, 180, o.haze || '#e09a7a', 0.45);
  ridgeW(c, y + 20, 50, 0.005, 9, o.mid || '#4a3a48');
  for (let i = -6; i < 16; i++) cedar(c, -700 + i * 150 + (i % 3) * 20, y + 70 + (i % 2) * 8, 0.28 + (i % 3) * 0.04, o.tree || '#2e3030', t, i + 2);
}
function sanctuary(c, t, o = {}) { // the mihrab (sanctuary chamber): stone wall, carved niche with a lattice window, hanging lamps, rug, curtain
  const fy = o.fy || 1380, nx = o.nx || 540, night = o.night || 0, lamp = o.lamp === undefined ? 1 : o.lamp;
  ashlar(c, -1100, -600, W + 1100, fy, mix(STONE, '#5a4a5a', 0.35 * night), 11);
  c.fillStyle = hexA('#0a0614', 0.5 * night); c.fillRect(-1100, -600, W + 2200, fy + 600);
  // niche
  c.fillStyle = mix(STONE, '#fff2dc', 0.15 - 0.1 * night); c.beginPath(); archPath(c, nx, fy, 520, 900); c.fill();
  c.strokeStyle = hexA(GOLD, 0.75); c.lineWidth = 5; c.beginPath(); archPath(c, nx, fy, 486, 870); c.stroke();
  c.fillStyle = mix('#5a3e2a', '#1a1428', night * 0.6); c.beginPath(); archPath(c, nx, fy, 440, 830); c.fill();
  c.save(); c.beginPath(); archPath(c, nx, fy, 440, 830); c.clip();
  for (let k = 0; k < 9; k++) { c.strokeStyle = hexA('#1a0c06', 0.14); c.lineWidth = 3; c.beginPath(); c.moveTo(nx - 220 + k * 55, fy); c.lineTo(nx - 220 + k * 55, fy - 830); c.stroke(); } // carved flutes
  // window in the niche: outside world (o.out(c, wx, wy) draws it), with a lattice over it
  const wx = nx, wy = fy - 560;
  c.save(); c.beginPath(); archPath(c, wx, wy + 150, 160, 300); c.clip();
  if (o.out) o.out(c, wx, wy); else { const g = c.createLinearGradient(0, wy - 150, 0, wy + 150); g.addColorStop(0, night ? '#0e1430' : '#9ab8d8'); g.addColorStop(1, night ? '#2a2a50' : '#f0dcb8'); c.fillStyle = g; c.fillRect(wx - 100, wy - 160, 200, 320); }
  lattice(c, wx - 90, wy - 160, 180, 320, '#2a1608', 0.9, 30); c.restore();
  c.strokeStyle = '#3a2412'; c.lineWidth = 7; c.beginPath(); archPath(c, wx, wy + 150, 166, 306); c.stroke();
  c.restore();
  // hanging lamps
  [[nx - 380, 260], [nx + 380, 260], [nx, 140]].forEach(([lx, ly], k) => { c.strokeStyle = '#2a1a10'; c.lineWidth = 2; c.beginPath(); c.moveTo(lx, ly - 700); c.lineTo(lx, ly - 30); c.stroke(); if (lamp > 0) lanternBox(c, lx, ly, 1.2, t, k); });
  if (lamp > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, nx - 380, 280, 340, '#ffb060', 0.22 * lamp); glow(c, nx + 380, 280, 340, '#ffb060', 0.22 * lamp); c.restore(); }
  // curtains on the sides
  [-1, 1].forEach(sd => { const x0 = nx + sd * 470; const g = c.createLinearGradient(x0 - 90, 0, x0 + 90, 0); g.addColorStop(0, '#4a1418'); g.addColorStop(0.5, '#8a2a2a'); g.addColorStop(1, '#3a1012');
    c.fillStyle = g; c.beginPath(); c.moveTo(x0 - sd * 10, -600); c.lineTo(x0 + sd * 200, -600); c.lineTo(x0 + sd * 200, fy); c.quadraticCurveTo(x0 + sd * 80, fy - 60 + Math.sin(t) * 6, x0 - sd * 30, fy - 300); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 3; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x0 + sd * k * 45, -600); c.quadraticCurveTo(x0 + sd * k * 50, fy - 400, x0 + sd * (k * 40 + 20), fy - 60); c.stroke(); }
    c.strokeStyle = GOLD; c.lineWidth = 4; c.beginPath(); c.moveTo(x0 + sd * 40, fy - 340); c.quadraticCurveTo(x0 + sd * 90, fy - 330, x0 + sd * 170, fy - 380); c.stroke(); });
  flagFloor(c, fy, nx, mix('#a88a66', '#3a3448', 0.5 * night), { sheen: 0.1 * lamp });
  // rug before the niche
  c.fillStyle = '#6a1a22'; c.beginPath(); c.moveTo(nx - 260, fy + 40); c.lineTo(nx + 260, fy + 40); c.lineTo(nx + 420, fy + 300); c.lineTo(nx - 420, fy + 300); c.closePath(); c.fill();
  c.strokeStyle = GOLD; c.lineWidth = 5; c.beginPath(); c.moveTo(nx - 236, fy + 56); c.lineTo(nx + 236, fy + 56); c.lineTo(nx + 380, fy + 284); c.lineTo(nx - 380, fy + 284); c.closePath(); c.stroke();
  c.strokeStyle = hexA('#e8c890', 0.5); c.lineWidth = 3; c.beginPath(); c.moveTo(nx, fy + 80); c.lineTo(nx + 60, fy + 170); c.lineTo(nx, fy + 260); c.lineTo(nx - 60, fy + 170); c.closePath(); c.stroke();
  c.fillStyle = hexA('#0a0614', 0.35 * night); c.fillRect(-1100, fy, W + 2200, H + 800);
}
function winterOut(c, wx, wy, t) { // through the lattice: a cold grey sky and a bare branch (winter outside)
  const g = c.createLinearGradient(0, wy - 160, 0, wy + 160); g.addColorStop(0, '#6a7a90'); g.addColorStop(1, '#c8ccd4'); c.fillStyle = g; c.fillRect(wx - 100, wy - 170, 200, 340);
  c.strokeStyle = '#3a3438'; c.lineCap = 'round'; c.lineWidth = 7; c.beginPath(); c.moveTo(wx - 110, wy + 40); c.quadraticCurveTo(wx - 20, wy + 10, wx + 70, wy - 60); c.stroke();
  c.lineWidth = 3; c.beginPath(); c.moveTo(wx - 40, wy + 20); c.lineTo(wx - 20, wy - 40); c.moveTo(wx + 20, wy - 20); c.lineTo(wx + 60, wy + 10); c.moveTo(wx + 40, wy - 40); c.lineTo(wx + 50, wy - 100); c.stroke();
  const r = rng(8); c.fillStyle = 'rgba(255,255,255,0.8)'; for (let i = 0; i < 14; i++) { const x = wx - 100 + r() * 200, y = wy - 170 + ((r() * 340 + t * (20 + r() * 20)) % 340); c.beginPath(); c.arc(x, y, 2 + r() * 2, 0, 6.283); c.fill(); }
}
function nightOut(c, wx, wy, t) { const g = c.createLinearGradient(0, wy - 160, 0, wy + 160); g.addColorStop(0, '#0a1030'); g.addColorStop(1, '#2a2a58'); c.fillStyle = g; c.fillRect(wx - 100, wy - 170, 200, 340);
  stars(c, t, 26, 6, [wx - 100, wy - 170, 200, 300], 1); moon(c, wx + 30, wy - 60, 26, 1, 0.3); }
function fruitPlatter(c, x, y, s, k, t) { // a brass tray of fruit (grapes, pomegranates, figs): the provision found beside Maryam (Al-Imran 37)
  c.save(); c.translate(x, y); c.scale(s, s);
  if (k > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -40, 260, '#ffd890', 0.35 * k * (0.9 + 0.1 * Math.sin(t * 2.4))); c.restore(); }
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(4, 6, 130, 18, 0, 0, 6.283); c.fill();
  const g = c.createLinearGradient(-120, 0, 120, 0); g.addColorStop(0, '#7a5420'); g.addColorStop(0.4, '#e8c060'); g.addColorStop(1, '#6a4818');
  c.fillStyle = g; c.beginPath(); c.ellipse(0, -6, 120, 26, 0, 0, 6.283); c.fill(); c.fillStyle = '#a07830'; c.beginPath(); c.ellipse(0, -10, 100, 18, 0, 0, 6.283); c.fill();
  const grape = (gx, gy, col) => { const r = rng(gx | 0); for (let i = 0; i < 16; i++) { const row = Math.floor(Math.sqrt(i * 2)), px = gx + (i - row * row / 2) * 9 - row * 3, py = gy + row * 12;
    c.fillStyle = mix(col, '#000000', r() * 0.3); c.beginPath(); c.arc(px + (r() - 0.5) * 6, py, 8, 0, 6.283); c.fill(); c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.arc(px - 2, py - 3, 2.2, 0, 6.283); c.fill(); }
    c.strokeStyle = '#4a3a1a'; c.lineWidth = 3; c.beginPath(); c.moveTo(gx + 6, gy - 6); c.lineTo(gx + 12, gy - 20); c.stroke(); };
  grape(-70, -46, '#5a2a5a'); grape(30, -52, '#8aa040');
  const pom = (px, py, r) => { const pg = c.createRadialGradient(px - r * 0.3, py - r * 0.3, 0, px, py, r); pg.addColorStop(0, '#f05a4a'); pg.addColorStop(1, '#7a1418'); c.fillStyle = pg; c.beginPath(); c.arc(px, py, r, 0, 6.283); c.fill();
    c.fillStyle = '#6a1418'; c.beginPath(); c.moveTo(px - 7, py - r + 2); c.lineTo(px - 4, py - r - 9); c.lineTo(px, py - r - 3); c.lineTo(px + 4, py - r - 9); c.lineTo(px + 7, py - r + 2); c.closePath(); c.fill(); };
  pom(-10, -40, 26); pom(70, -32, 22);
  const fig_ = (px, py) => { c.fillStyle = '#5a3a5a'; c.beginPath(); c.moveTo(px, py - 24); c.quadraticCurveTo(px + 18, py - 2, px, py + 8); c.quadraticCurveTo(px - 18, py - 2, px, py - 24); c.fill(); c.fillStyle = 'rgba(255,220,240,0.25)'; c.beginPath(); c.ellipse(px - 4, py - 6, 3, 7, 0.3, 0, 6.283); c.fill(); };
  fig_(-40, -20); fig_(40, -16); fig_(0, -14);
  c.fillStyle = '#4a7a2a'; c.beginPath(); c.ellipse(-96, -26, 22, 8, -0.5, 0, 6.283); c.fill(); c.beginPath(); c.ellipse(96, -22, 20, 7, 0.6, 0, 6.283); c.fill();
  c.restore();
}
function cradle(c, x, y, s, t, k = 1) { // a wooden cradle on rockers, a baby swaddled in white (no face: the swaddle and a soft light)
  const rock = Math.sin(t * 1.4) * 0.04;
  c.save(); c.translate(x, y); c.rotate(rock); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(0, 4, 150, 14, 0, 0, 6.283); c.fill();
  c.strokeStyle = '#4a2c16'; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.arc(0, -330, 330, Math.PI * 0.39, Math.PI * 0.61); c.stroke();
  const g = c.createLinearGradient(0, -130, 0, -10); g.addColorStop(0, '#9a6a3a'); g.addColorStop(1, '#5a3a1e');
  c.fillStyle = g; c.beginPath(); c.moveTo(-140, -130); c.lineTo(140, -130); c.lineTo(120, -20); c.lineTo(-120, -20); c.closePath(); c.fill();
  c.strokeStyle = '#3a2210'; c.lineWidth = 4; for (let i = -5; i <= 5; i++) { c.beginPath(); c.moveTo(i * 24, -126); c.lineTo(i * 21, -24); c.stroke(); }
  c.fillStyle = '#c99a5a'; c.fillRect(-150, -140, 300, 14);
  // swaddled baby (head end covered by the cloth)
  c.fillStyle = '#f6f1e6'; c.beginPath(); c.ellipse(10, -150, 92, 30, 0, 0, 6.283); c.fill();
  c.fillStyle = '#ebe3d2'; c.beginPath(); c.ellipse(-62, -156, 34, 30, 0, 0, 6.283); c.fill();
  c.strokeStyle = 'rgba(120,100,70,0.35)'; c.lineWidth = 2.5; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-20 + i * 26, -176); c.quadraticCurveTo(-8 + i * 26, -150, -24 + i * 26, -124); c.stroke(); }
  c.restore();
  if (k > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x - 62 * s, y - 156 * s, 120 * s, '#fff6dc', 0.55 * k); c.restore(); }
}
function threeNights(c, t, k, x, y) { // three crescents lighting one after another (Maryam 10: three nights)
  for (let i = 0; i < 3; i++) { const f = clamp(k * 3 - i), xx = x + (i - 1) * 170;
    c.fillStyle = 'rgba(10,6,14,0.45)'; c.beginPath(); c.arc(xx, y, 66, 0, 6.283); c.fill();
    c.strokeStyle = 'rgba(251,231,198,0.75)'; c.lineWidth = 4; c.beginPath(); c.arc(xx, y, 62, 0, 6.283); c.stroke();
    if (f > 0) moon(c, xx, y, 34, f, 0.3); }
}
function hushLines(c, x, y, k, t) { // speech that does not come out: three short arcs fading before they spread
  if (k <= 0) return;
  for (let i = 0; i < 3; i++) { const ph = ((t * 0.8 + i / 3) % 1); c.strokeStyle = `rgba(255,236,190,${0.6 * k * (1 - ph) * (ph < 0.5 ? 1 : 0.3)})`; c.lineWidth = 4;
    c.beginPath(); c.arc(x, y, 30 + ph * 60, -0.6, 0.6); c.stroke(); }
}

// ---------- episode 12: characters
const IBR = { veilGlow: 0.55, prophet: true, robe: '#ebe5d6', wrap: '#f7f3ea', skin: '#c49470', trim: '#cfae6a', band: '#b8954a', inner: '#fbf8f0' };
const ISM = { veilGlow: 0.5, prophet: true, robe: '#f0ebdf', wrap: '#f8f5ee', skin: '#c49470', trim: '#d8bf80', band: '#c9a35a', inner: '#fcfaf4' }; // Isma'il as a youth
const ISMC = Object.assign({}, ISM, { child: true }); // Isma'il as a small boy
const HAJ = { agal: false, robe: '#4a3446', wrap: '#e2d6c2', skin: '#9a6a4c', trim: '#b89a62', band: '#7a5a4a', covered: true, inner: '#ece2d0' }; // Hajar
const GRANITE = '#4a3830', SANDC = '#c49a68';

// ---------- episode 12: Hijaz landscape
function cragY(x, y, amp, seed) { return y - (noise1(x * 0.004, seed) * amp + noise1(x * 0.017, seed + 1) * amp * 0.38 + noise1(x * 0.06, seed + 2) * amp * 0.09); }
function crags(c, y, amp, seed, col, o = {}) { // rugged dark granite range of the Hijaz (Mecca), drawn very wide
  const x0 = o.x0 === undefined ? -2200 : o.x0, x1 = o.x1 === undefined ? W + 2200 : o.x1;
  const path = () => { c.beginPath(); c.moveTo(x0, H + 1400); for (let x = x0; x <= x1; x += 14) c.lineTo(x, cragY(x, y, amp, seed)); c.lineTo(x1, H + 1400); c.closePath(); };
  const lt = mix(col, o.litCol || '#ffd8a8', 0.28 * (o.light === undefined ? 1 : o.light)), dk = mix(col, '#0a0604', 0.45);
  const g = c.createLinearGradient(0, y - amp * 1.4, 0, y + (o.depth || 500)); g.addColorStop(0, lt); g.addColorStop(0.4, col); g.addColorStop(1, dk);
  path(); c.fillStyle = g; c.fill();
  if (o.detail !== false) {
    c.save(); path(); c.clip();
    const r = rng(seed * 13 + 1); c.lineCap = 'round';
    for (let i = 0; i < (o.gullies || 46); i++) { // gullies and scree running down the slopes
      const gx = x0 + r() * (x1 - x0), top = cragY(gx, y, amp, seed) + 6, len = 120 + r() * 380, dx = (r() - 0.5) * 120;
      c.strokeStyle = hexA(r() > 0.35 ? dk : lt, 0.18 + r() * 0.16); c.lineWidth = 2 + r() * 6;
      c.beginPath(); c.moveTo(gx, top); c.bezierCurveTo(gx + dx * 0.3, top + len * 0.3, gx + dx * 0.8, top + len * 0.6, gx + dx, top + len); c.stroke(); }
    for (let i = 0; i < (o.blocks || 90); i++) { const bx = x0 + r() * (x1 - x0), by = cragY(bx, y, amp, seed) + 20 + r() * 420, bw = 8 + r() * 26;
      c.fillStyle = hexA(r() > 0.5 ? lt : dk, 0.16); c.beginPath(); c.moveTo(bx - bw, by); c.lineTo(bx - bw * 0.3, by - bw * 0.7); c.lineTo(bx + bw, by - bw * 0.2); c.lineTo(bx + bw * 0.6, by + bw * 0.3); c.closePath(); c.fill(); }
    if (o.shadeSide) { const sg = c.createLinearGradient(x0, 0, x1, 0); sg.addColorStop(0, 'rgba(10,6,4,0)'); sg.addColorStop(1, `rgba(10,6,4,${o.shadeSide})`); c.fillStyle = sg; c.fillRect(x0, y - amp * 2, x1 - x0, H + 1400); }
    c.restore();
  }
  if (o.rim) { c.strokeStyle = o.rim; c.lineWidth = o.rimW || 2.5; c.beginPath(); for (let x = x0; x <= x1; x += 14) { const v = cragY(x, y, amp, seed); x === x0 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); }
}
function hazeWide(c, y, h, col, a) { const g = c.createLinearGradient(0, y - h, 0, y + h * 0.7); g.addColorStop(0, hexA(col, 0)); g.addColorStop(0.59, hexA(col, a)); g.addColorStop(1, hexA(col, 0)); c.fillStyle = g; c.fillRect(-2600, y - h, W + 5200, h * 1.7); }
function sandW(c, y, col, seed = 1, o = {}) { // the wadi floor: wide sand, faint ripples, pebbles bigger toward the viewer
  const g = c.createLinearGradient(0, y - 10, 0, H + 400); g.addColorStop(0, mix(col, '#fff0d4', 0.2)); g.addColorStop(0.45, col); g.addColorStop(1, mix(col, '#1a0c06', 0.45));
  c.fillStyle = g; c.fillRect(-2600, y, W + 5200, H + 2600);
  c.lineWidth = 2;
  for (let i = 0; i < 16; i++) { const yy = y + 12 + Math.pow(i / 16, 1.8) * (H + 300 - y); c.strokeStyle = hexA(i % 2 ? mix(col, '#000000', 0.3) : mix(col, '#ffffff', 0.3), 0.16 + i * 0.008);
    c.beginPath(); for (let x = -2400; x <= W + 2400; x += 30) { const v = yy + Math.sin(x * (0.006 - i * 0.0002) + i * 1.9 + seed) * (3 + i * 0.8); x === -2400 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); }
  const r = rng(seed * 5 + 7);
  for (let i = 0; i < (o.pebbles || 120); i++) { const q = Math.pow(r(), 1.6), yy = y + 8 + q * (H + 300 - y), x = -1800 + r() * (W + 3600), sz = 2 + q * 16;
    c.fillStyle = hexA(mix(col, r() > 0.6 ? '#2a1a10' : '#fff0d8', 0.4), 0.55); c.beginPath(); c.ellipse(x, yy, sz, sz * 0.45, 0, 0, 6.283); c.fill(); }
  if (o.tufts) for (let i = 0; i < o.tufts; i++) { const q = Math.pow(r(), 1.4), yy = y + 10 + q * (H - y), x = -1200 + r() * (W + 2400); shrub(c, x, yy, 0.3 + q * 1.1, '#6a5a32', 0, i + 3); }
}
function heatSky(c, k = 0) { sky0(c, [[0, mix('#6a9ac8', '#c8b090', k)], [0.3, mix('#b8cede', '#f0dcb4', k)], [0.48, mix('#f2e2c0', '#fff0d0', k)]]); }
function meccaValley(c, t, o = {}) { // the barren valley between dark mountains (Ibrahim 37: "a valley without cultivation")
  const y = o.y || 1300, px = o.px || 0;
  par(c, 0.15, px, 0, () => { crags(c, y - 330, 260, 21, o.far || '#8a7a8a', { detail: false, light: 0.6 }); hazeWide(c, y - 300, 260, o.haze || '#f4dcb8', 0.55); });
  par(c, 0.35, px, 0, () => { crags(c, y - 170, 300, 23, o.mid || '#6a5048', { rim: o.rim || 'rgba(255,226,180,0.35)', gullies: 30, blocks: 40 }); hazeWide(c, y - 140, 200, o.haze || '#f4dcb8', 0.4); });
  par(c, 0.6, px, 0, () => { crags(c, y - 40, 240, 25, o.near || GRANITE, { rim: o.rim || 'rgba(255,226,180,0.45)', shadeSide: 0.25 }); hazeWide(c, y - 10, 120, o.haze || '#f4dcb8', 0.25); });
  sandW(c, y, o.sand || SANDC, 3, { pebbles: 140 });
}
function mound(c, x, y, s, glowK = 0, t = 0) { // the low red mound where the House would stand (al-Bukhari: "like a hillock")
  c.fillStyle = 'rgba(10,6,4,0.25)'; c.beginPath(); c.ellipse(x, y + 4 * s, 120 * s, 12 * s, 0, 0, 6.283); c.fill();
  const g = c.createLinearGradient(0, y - 50 * s, 0, y); g.addColorStop(0, '#c08060'); g.addColorStop(1, '#8a5a40');
  c.fillStyle = g; c.beginPath(); c.moveTo(x - 120 * s, y); c.quadraticCurveTo(x - 40 * s, y - 50 * s, x, y - 52 * s); c.quadraticCurveTo(x + 50 * s, y - 50 * s, x + 120 * s, y); c.closePath(); c.fill();
  if (glowK > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y - 30 * s, 260 * s, '#ffe6b0', 0.4 * glowK * (0.85 + 0.15 * Math.sin(t * 2))); c.restore(); }
}
function bundle(c, x, y, s, ang = 0, k = 0.6) { // the baby Isma'il swaddled in white (no face: the head end is covered by the cloth), soft light
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
  c.fillStyle = '#f6f1e6'; c.beginPath(); c.ellipse(8, 0, 46, 17, 0, 0, 6.283); c.fill();
  c.fillStyle = '#e8dfcc'; c.beginPath(); c.ellipse(-30, -2, 19, 17, 0, 0, 6.283); c.fill();
  c.strokeStyle = 'rgba(120,100,70,0.4)'; c.lineWidth = 2; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-6 + i * 13, -15); c.quadraticCurveTo(i * 13, 0, -8 + i * 13, 15); c.stroke(); }
  c.restore();
  if (k > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x - 30 * s * Math.cos(ang), y - 30 * s * Math.sin(ang), 70 * s, '#fff6dc', 0.4 * k); c.restore(); }
}
function babyOnMat(c, x, y, s, t, k = 0.6) { // lying on a small woven mat in the shade
  c.fillStyle = 'rgba(10,6,4,0.25)'; c.beginPath(); c.ellipse(x, y + 4, 90 * s, 12 * s, 0, 0, 6.283); c.fill();
  c.fillStyle = '#8a3a2a'; c.beginPath(); c.ellipse(x, y, 84 * s, 16 * s, 0, 0, 6.283); c.fill();
  c.strokeStyle = '#d8a050'; c.lineWidth = 2.5 * s; c.beginPath(); c.ellipse(x, y, 74 * s, 12 * s, 0, 0, 6.283); c.stroke();
  bundle(c, x + 6 * s, y - 14 * s + Math.sin(t * 1.3) * 0.6, s * 1.1, 0, k);
}
function heldBundle(c, o) { const s = o.h / 300, d = o.dir || 1; bundle(c, o.x + d * 30 * s, o.y - 172 * s, s * 0.95, d > 0 ? -0.25 : 0.25 + Math.PI, 0.7); }
function cryRings(c, x, y, t, a) { if (a <= 0) return; t += 100; // the baby's cries: small arcs
  for (let k = 0; k < 3; k++) { const ph = (t * 1.2 + k / 3) % 1; c.strokeStyle = `rgba(255,240,220,${0.6 * a * (1 - ph)})`; c.lineWidth = 3;
    c.beginPath(); c.arc(x, y, 20 + ph * 70, -2.3, -0.8); c.stroke(); } }
function waterskin(c, x, y, s, full = 1) { // goatskin water bag lying on the ground: round when full, flat and wrinkled when empty
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.28)'; c.beginPath(); c.ellipse(0, 2, 62, 9, 0, 0, 6.283); c.fill();
  const hh = lerp(14, 46, full), g = c.createLinearGradient(0, -hh * 2, 0, 0); g.addColorStop(0, '#9a6a3e'); g.addColorStop(1, '#5a3a20');
  c.fillStyle = g; c.beginPath(); c.moveTo(-58, 0); c.quadraticCurveTo(-60, -hh * 1.6, -6, -hh * 1.7); c.quadraticCurveTo(50, -hh * 1.6, 58, 0); c.closePath(); c.fill();
  c.fillStyle = '#4a2c16'; c.beginPath(); c.moveTo(48, -hh * 0.9); c.lineTo(78, -hh * 1.2 - 10); c.lineTo(84, -hh * 1.2 - 2); c.lineTo(56, -hh * 0.5); c.closePath(); c.fill(); // neck
  c.strokeStyle = 'rgba(30,16,8,0.5)'; c.lineWidth = 2; for (let i = 0; i < (full < 0.5 ? 6 : 2); i++) { c.beginPath(); c.moveTo(-40 + i * 14, -4); c.quadraticCurveTo(-34 + i * 14, -hh * 0.9, -44 + i * 14, -hh * 1.4); c.stroke(); }
  c.restore();
}
function dateBag(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.28)'; c.beginPath(); c.ellipse(0, 2, 40, 7, 0, 0, 6.283); c.fill();
  c.fillStyle = '#a88a5a'; c.beginPath(); c.moveTo(-34, 0); c.quadraticCurveTo(-40, -50, -14, -62); c.lineTo(14, -62); c.quadraticCurveTo(40, -50, 34, 0); c.closePath(); c.fill();
  c.strokeStyle = '#6a5030'; c.lineWidth = 3; c.beginPath(); c.moveTo(-16, -58); c.lineTo(16, -58); c.stroke();
  c.fillStyle = '#5a2a16'; [[-8, -66], [4, -68], [12, -64]].forEach(([a, b]) => { c.beginPath(); c.ellipse(a, b, 6, 4, 0.3, 0, 6.283); c.fill(); });
  c.restore(); }
function basinRing(c, x, y, s, k) { // the low wall of sand and stones Hajar heaped around the water
  if (k <= 0) return; const r = rng(51), n = Math.round(22 * k);
  for (let i = 0; i < n; i++) { const a = i / 22 * 6.283 + 0.2, rx = 240 * s, ry = 58 * s, px = x + Math.cos(a) * rx, py = y + Math.sin(a) * ry, sz = (12 + r() * 10) * s * (Math.sin(a) > 0 ? 1.25 : 0.9);
    c.fillStyle = mix('#8a6a4a', r() > 0.5 ? '#2a1a10' : '#e8c8a0', 0.25); c.beginPath(); c.ellipse(px, py, sz * 1.4, sz * 0.8, 0, 0, 6.283); c.fill();
    c.fillStyle = 'rgba(255,240,210,0.25)'; c.beginPath(); c.ellipse(px - sz * 0.3, py - sz * 0.3, sz * 0.6, sz * 0.3, 0, 0, 6.283); c.fill(); }
}
function groundBurst(c, x, y, k, t) { // where the earth was struck: a flash of light at the ground (the angel is never shown)
  if (k <= 0) return; c.save(); c.globalCompositeOperation = 'lighter';
  glow(c, x, y, 420 * k, '#fff4d8', 0.7 * k * (1 - 0.3 * Math.sin(t * 3))); star4(c, x, y - 10, 60 * k, '#ffffff', k);
  c.strokeStyle = `rgba(255,246,220,${0.6 * k})`; c.lineWidth = 4; c.beginPath(); c.ellipse(x, y, 300 * (1.2 - k * 0.4), 70 * (1.2 - k * 0.4), 0, 0, 6.283); c.stroke();
  c.restore();
}
function ram(c, x, y, s, t, dir = 1, o = {}) { // the ram (As-Saffat 107): heavy fleece, curled horns, standing proud
  c.save(); c.translate(x, y); c.scale(s * dir, s);
  const wool = o.col || '#f2ecdf', dk = mix(wool, '#6a5a48', 0.55), walking = o.walk !== undefined && o.walk !== null, p = walking ? o.walk * 6.283 : 0;
  c.fillStyle = 'rgba(10,6,4,0.28)'; c.beginPath(); c.ellipse(6, 2, 86, 10, 0, 0, 6.283); c.fill();
  c.strokeStyle = '#2a2018'; c.lineWidth = 9; c.lineCap = 'round';
  [[-48, 0], [-30, Math.PI], [34, Math.PI], [52, 0]].forEach(([lx, ph], i) => { const sw = walking ? Math.sin(p + ph) * 9 : 0, lift = walking ? Math.max(0, Math.cos(p + ph)) * 6 : 0;
    c.strokeStyle = i % 3 ? '#3a2e24' : '#2a2018'; c.beginPath(); c.moveTo(lx, -52); c.quadraticCurveTo(lx + sw * 0.5, -26, lx + sw, -lift); c.stroke(); });
  for (let k = 0; k < 14; k++) { const bx = -62 + k * 10, by = -84 + Math.sin(k * 1.9) * 12; const g = c.createRadialGradient(bx - 8, by - 10, 2, bx, by, 30);
    g.addColorStop(0, mix(wool, '#ffffff', 0.5)); g.addColorStop(1, dk); c.fillStyle = g; c.beginPath(); c.arc(bx, by, 28, 0, 6.283); c.fill(); }
  c.save(); c.translate(70, -92); c.rotate(0.35 + (o.bow || 0));
  c.fillStyle = '#3a3028'; c.beginPath(); c.ellipse(20, 10, 24, 14, 0.5, 0, 6.283); c.fill(); // head
  c.beginPath(); c.ellipse(36, 22, 12, 9, 0.6, 0, 6.283); c.fill(); // muzzle
  c.strokeStyle = '#c8b48e'; c.lineWidth = 9; c.beginPath(); // curled horn
  for (let i = 0; i <= 30; i++) { const a = -1.2 + i * 0.2, rr = 26 - i * 0.6, px = 2 + Math.cos(a) * rr, py = -2 + Math.sin(a) * rr; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke();
  c.strokeStyle = 'rgba(80,60,40,0.5)'; c.lineWidth = 2; for (let i = 3; i < 28; i += 4) { const a = -1.2 + i * 0.2, rr = 26 - i * 0.6; c.beginPath(); c.arc(2 + Math.cos(a) * rr, -2 + Math.sin(a) * rr, 4, 0, 6.283); c.stroke(); }
  c.fillStyle = '#1a120c'; c.beginPath(); c.ellipse(24, 4, 2.6, 2.2, 0, 0, 6.283); c.fill();
  c.restore(); c.restore();
  if (o.glow) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y - 80 * s, 200 * s, '#fff2d0', 0.35 * o.glow); c.restore(); }
}
function kaabaWalls(c, x, y, w, h, k, t, o = {}) { // the House raised course by course (Al-Baqara 127): grey stone blocks, 3/4 view
  const sw = w * 0.42, rows = 12, rh = h / rows, built = k * rows, dk = '#4a4844', lt = '#8a8680';
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(x + sw * 0.4, y + 6, w * 0.8, 22, 0, 0, 6.283); c.fill();
  const r = rng(77);
  for (let j = 0; j < Math.ceil(built); j++) {
    const yy = y - (j + 1) * rh, frac = clamp(built - j), n = 6, bw = w / n;
    for (let i = 0; i < n; i++) { if (i / n >= frac) break; // front face
      const off = (j % 2) * bw * 0.5, bx = x - w / 2 + i * bw - off, xa = Math.max(x - w / 2, bx), xb = Math.min(x + w / 2, bx + bw);
      if (xb <= xa) continue; const v = r(); c.fillStyle = mix(lt, '#5a5650', 0.2 + v * 0.35); c.fillRect(xa, yy, xb - xa - 2, rh - 2);
      c.fillStyle = 'rgba(255,245,225,0.12)'; c.fillRect(xa, yy, xb - xa - 2, 3); }
    if (j % 2 === 0 && frac >= 1) { const bx = x + w / 2 - bw * 0.5; c.fillStyle = mix(lt, '#5a5650', 0.3); c.fillRect(bx, yy, bw * 0.5 - 2, rh - 2); }
    if (frac >= 1) { // side face, darker, receding
      c.fillStyle = mix(dk, '#000000', 0.1 + r() * 0.15); c.beginPath(); c.moveTo(x + w / 2, yy + rh); c.lineTo(x + w / 2 + sw, yy + rh - sw * 0.28); c.lineTo(x + w / 2 + sw, yy - sw * 0.28); c.lineTo(x + w / 2, yy); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(20,18,16,0.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + w / 2, yy + rh); c.lineTo(x + w / 2 + sw, yy + rh - sw * 0.28); for (let q = 1; q < 3; q++) { const px = x + w / 2 + sw * (q / 3 + (j % 2) * 0.15); c.moveTo(px, yy + rh - sw * 0.28 * (q / 3 + (j % 2) * 0.15)); c.lineTo(px, yy - sw * 0.28 * (q / 3 + (j % 2) * 0.15)); } c.stroke(); }
  }
  const topY = y - Math.floor(built) * rh;
  if (built >= 1) { c.fillStyle = mix(lt, '#ffffff', 0.15); c.beginPath(); c.moveTo(x - w / 2, topY); c.lineTo(x + w / 2, topY); c.lineTo(x + w / 2 + sw, topY - sw * 0.28); c.lineTo(x - w / 2 + sw, topY - sw * 0.28); c.closePath(); c.fill(); }
  if (o.glow > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x + sw * 0.4, y - k * h * 0.5, w, '#ffe6b0', 0.25 * o.glow); c.restore(); }
  if (o.door && k > 0.6) { c.fillStyle = '#6a4a26'; c.fillRect(x + w * 0.14, y - h * 0.62, w * 0.2, h * 0.36); c.strokeStyle = '#c9a35a'; c.lineWidth = 3; c.strokeRect(x + w * 0.14, y - h * 0.62, w * 0.2, h * 0.36); }
  return topY;
}
function maqamStone(c, x, y, s) { // the stone Isma'il brought for his father to stand on (al-Bukhari)
  const g = c.createLinearGradient(x - 40 * s, 0, x + 40 * s, 0); g.addColorStop(0, '#a89a80'); g.addColorStop(1, '#6a6050');
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(x, y + 3, 60 * s, 8 * s, 0, 0, 6.283); c.fill();
  c.fillStyle = g; c.beginPath(); c.roundRect(x - 46 * s, y - 52 * s, 92 * s, 52 * s, 6 * s); c.fill();
  c.fillStyle = 'rgba(255,245,225,0.2)'; c.fillRect(x - 44 * s, y - 52 * s, 88 * s, 4 * s);
}
function block(c, x, y, s) { c.fillStyle = '#7a7670'; c.fillRect(x - 24 * s, y - 18 * s, 48 * s, 36 * s); c.fillStyle = 'rgba(255,245,225,0.2)'; c.fillRect(x - 24 * s, y - 18 * s, 48 * s, 4 * s); }
function runCount(c, k, y, a = 1) { // seven rounds between Safa and Marwa
  if (a <= 0) return;
  for (let i = 0; i < 7; i++) { const x = W / 2 + (i - 3) * 118, f = clamp(k * 7 - i);
    c.save(); c.globalAlpha = a; c.fillStyle = 'rgba(10,6,4,0.45)'; c.beginPath(); c.arc(x, y, 44, 0, 6.283); c.fill();
    c.strokeStyle = 'rgba(251,231,198,0.8)'; c.lineWidth = 4; c.beginPath(); c.arc(x, y, 41, 0, 6.283); c.stroke();
    if (f > 0) { c.fillStyle = `rgba(246,196,83,${0.9 * f})`; c.beginPath(); c.moveTo(x, y); c.arc(x, y, 36, -Math.PI / 2, -Math.PI / 2 + f * 6.283); c.closePath(); c.fill(); }
    c.restore(); textGlow(c, String(i + 1), x, y + 3, '600 42px Lora', '#fff7e6', 0.95 * a, '#000', 8);
  }
}
function tentDark(c, x, y, s, t) { tent(c, x, y, 360 * s, 220 * s, '#4a3a30', '#1a120c'); c.strokeStyle = '#2a1e16'; c.lineWidth = 3 * s; c.beginPath(); c.moveTo(x - 180 * s, y); c.lineTo(x - 240 * s, y + 10); c.moveTo(x + 180 * s, y); c.lineTo(x + 240 * s, y + 10); c.stroke(); }
function heartbeat(c, t, a) { if (a <= 0) return; const k = Math.pow(Math.max(0, Math.sin(t * 5.2)), 12); c.fillStyle = `rgba(10,4,4,${a * (0.18 + 0.12 * k)})`; c.fillRect(0, 0, W, H); }
function cloudsPart(c, t, k, x, y) { blurred(c, 22, () => cloudsPart0(c, t, k, x, y)); }
function cloudsPart0(c, t, k, x, y) { // dark clouds drawn apart around a gap of light
  for (let i = 0; i < 10; i++) { const side = i % 2 ? 1 : -1, row = Math.floor(i / 2), d = lerp(60, 640, ease(k)) + row * 70, yy = y - 80 + row * 70;
    c.fillStyle = hexA(row % 2 ? '#2a2430' : '#3a3038', 0.85); c.beginPath(); c.ellipse(x + side * (d + 260), yy + Math.sin(t * 0.3 + i) * 6, 360, 90, 0, 0, 6.283); c.fill(); }
}


// ======================================================================================================
// ---------- episode 13: characters
const ISA = { veilGlow: 0.5, prophet: true, robe: '#efe9dc', wrap: '#f8f5ee', skin: '#c49470', trim: '#d8bf80', band: '#c9a35a', inner: '#fcfaf4' }; // 'Issa as a man
const ISAC = Object.assign({}, ISA, { child: true }); // 'Issa as a small boy (lesson)
const MARY = Object.assign({}, MAR, { robe: '#2a3a5e', wrap: '#e2d8c6' }); // Maryam (same colours as in episode 11)
const BLIND = { robe: '#5a4a3a', wrap: '#cfc2a8', skin: '#9a6a4c', trim: '#8a7a5a' };
const LEPER = { robe: '#4a4038', wrap: '#bfb4a0', skin: '#8f5f42', trim: '#6a5a4a', covered: true };
const ELDER = { robe: '#3a2e40', wrap: '#e8e0d0', skin: '#a8714f', trim: '#c9a35a', band: '#8a6a3a' };
const VCOL = '#cdb08a'; // village stone

// ---------- episode 13: helpers
function hushAt(c, o, k, t) { const [hx, hy, r] = headOf(o); hushLines(c, hx + (o.dir || 1) * r * 1.6, hy, k, t); }
function babyLight(c, x, y, k, t) { // the light of the baby who speaks: glow, rays, rings, sparkles (no face, no form)
  if (k <= 0) return;
  c.save(); c.globalCompositeOperation = 'lighter';
  glow(c, x, y, 480 * k, '#fff2cc', 0.32 * k); glow(c, x, y, 130, '#ffffff', 0.42 * k); c.restore();
  rays(c, x, y, -Math.PI / 2, 2.6, 900 * k, 16, '#fff4d8', 0.1 * k, t, 31);
  lightRings(c, x, y + 20, t, 0.9 * k, 5, 900);
  sparkle(c, t, x, y - 40, 18, 260, 13, k);
}
function lapBundle(c, o, k = 0.7) { // the baby held on the lap of a seated figure
  const s = o.h / 300, d = o.dir || 1; bundle(c, o.x + d * 30 * s, o.y - 70 * s, s * 0.8, d > 0 ? -0.35 : Math.PI + 0.35, k * 0.5);
}
// a stream running across the ground (Maryam 24: "your Lord has placed a stream beneath you"); k: 0 -> 1 it flows in from the left
function brook(c, x0, x1, y, k, t, o = {}) { t += 100;
  if (k <= 0) return;
  const xe = lerp(x0, x1, ease(k)), wd = o.w || 46, yc = x => y + Math.sin(x * 0.006 + 1.3) * 34 + (x - x0) * (o.slope || 0);
  const w = x => wd * (0.6 + 0.4 * clamp((x - x0) / 300)) * (1 - 0.5 * clamp((x - xe + 140) / 140));
  const path = () => { c.beginPath(); for (let x = x0; x <= xe; x += 10) c.lineTo(x, yc(x) - w(x) / 2); for (let x = xe; x >= x0; x -= 10) c.lineTo(x, yc(x) + w(x) / 2); c.closePath(); };
  c.fillStyle = 'rgba(40,26,14,0.5)'; c.save(); c.translate(0, 6); path(); c.fill(); c.restore(); // wet bank
  const g = c.createLinearGradient(0, y - 60, 0, y + 60); g.addColorStop(0, o.top || '#9ac8d8'); g.addColorStop(1, o.bot || '#3a6a80');
  path(); c.fillStyle = g; c.fill();
  c.save(); path(); c.clip(); c.globalCompositeOperation = 'lighter';
  const r = rng(o.seed || 4);
  for (let i = 0; i < 40; i++) { const ph = (t * (0.25 + r() * 0.2) + r()) % 1, x = x0 + ph * (x1 - x0), yy = yc(x) + (r() - 0.5) * wd * 0.6, l = 14 + r() * 26;
    c.strokeStyle = `rgba(255,255,240,${0.45 * Math.sin(ph * Math.PI)})`; c.lineWidth = 2; c.beginPath(); c.moveTo(x, yy); c.lineTo(x + l, yy + (yc(x + l) - yc(x))); c.stroke(); }
  c.restore();
  c.strokeStyle = 'rgba(255,250,230,0.35)'; c.lineWidth = 2; c.beginPath(); for (let x = x0; x <= xe; x += 10) c.lineTo(x, yc(x) - w(x) / 2); c.stroke();
  const r2 = rng(7); for (let i = 0; i < 16; i++) { const x = x0 + r2() * (xe - x0), sd = r2() > 0.5 ? 1 : -1; boulder(c, x, yc(x) + sd * (w(x) / 2 + 6), 12 + r2() * 16, 8 + r2() * 8, '#5a4a3a', i + 3); }
}
// fresh dates dropping from the crown when the trunk is shaken (Maryam 25): they fall with gravity, bounce once, then rest on the ground
function fallingDates(c, t, t0, cx, cy, gy, n = 14, spread = 220) {
  const r = rng(17);
  for (let i = 0; i < n; i++) {
    const st = t0 + r() * 1.6, x = cx + (r() - 0.5) * spread, x1 = x + (r() - 0.5) * 120, ly = gy + (r() - 0.3) * 40, dt = t - st;
    if (dt < 0) { r(); continue; }
    const fall = ly - cy, tf = Math.sqrt(2 * fall / 2400); let px, py;
    if (dt < tf) { py = cy + 0.5 * 2400 * dt * dt; px = lerp(x, x1, dt / tf); }
    else { const b = dt - tf, bounce = Math.max(0, 60 * b - 0.5 * 1400 * b * b) * (1 - clamp(b * 4)); py = ly - bounce; px = x1 + Math.min(b, 0.4) * 30 * (r() - 0.5); }
    c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(px, ly + 3, 10, 3, 0, 0, 6.283); c.fill();
    c.fillStyle = '#7a3a14'; c.beginPath(); c.ellipse(px, py - 8, 7, 11, 0.3 + i, 0, 6.283); c.fill();
    c.fillStyle = 'rgba(255,200,140,0.45)'; c.beginPath(); c.ellipse(px - 2, py - 11, 2, 4, 0.3, 0, 6.283); c.fill();
  }
}
function hangingCurtain(c, x0, x1, y, h, t, col = '#d8ccb4') { // a cloth hung between two posts (Maryam 17: "she placed a screen")
  ['#4a3220', '#4a3220'].forEach((pc, k) => { c.fillStyle = pc; c.fillRect((k ? x1 : x0) - 7, y - h - 30, 14, h + 30); });
  c.strokeStyle = '#3a2414'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, y - h - 20); c.quadraticCurveTo((x0 + x1) / 2, y - h, x1, y - h - 20); c.stroke();
  const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, mix(col, '#000000', 0.25)); g.addColorStop(0.5, col); g.addColorStop(1, mix(col, '#000000', 0.3));
  c.fillStyle = g; c.beginPath(); c.moveTo(x0 + 6, y - h - 18);
  for (let i = 0; i <= 10; i++) { const q = i / 10; c.lineTo(lerp(x0 + 6, x1 - 6, q), y - h - 18 + Math.sin(q * Math.PI) * 18); }
  for (let i = 10; i >= 0; i--) { const q = i / 10; c.lineTo(lerp(x0 + 6, x1 - 6, q) + Math.sin(t * 1.6 + q * 5) * 10, y - 40 + Math.sin(t * 2 + q * 7) * 6); }
  c.closePath(); c.fill();
  c.strokeStyle = 'rgba(40,24,10,0.18)'; c.lineWidth = 3; for (let k = 1; k < 9; k++) { const xx = lerp(x0, x1, k / 9); c.beginPath(); c.moveTo(xx, y - h); c.quadraticCurveTo(xx + Math.sin(t * 1.6 + k) * 8, y - h / 2, xx + Math.sin(t * 1.6 + k * 0.55) * 10, y - 44); c.stroke(); }
}
function bier(c, x, y, s, k, t) { // a shrouded body on a wooden bier (no face, no form beyond the shroud); k: light on it
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(0, 4, 200, 14, 0, 0, 6.283); c.fill();
  c.fillStyle = '#4a2c16'; c.fillRect(-180, -50, 360, 14); [-160, 160].forEach(lx => c.fillRect(lx - 6, -50, 12, 50));
  c.fillStyle = '#f2ece0'; c.beginPath(); c.moveTo(-160, -50); c.quadraticCurveTo(-170, -96, -110, -98); c.quadraticCurveTo(20, -84, 120, -86); c.quadraticCurveTo(170, -84, 164, -50); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(120,100,70,0.35)'; c.lineWidth = 3; [-80, -10, 60, 120].forEach(bx => { c.beginPath(); c.moveTo(bx, -92); c.quadraticCurveTo(bx + 10, -70, bx, -52); c.stroke(); });
  c.restore();
  if (k > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y - 80 * s, 300 * s, '#fff2cc', 0.45 * k); c.restore(); lightRings(c, x, y - 20 * s, t, 0.7 * k, 3, 360 * s); sparkle(c, t, x, y - 120 * s, 10, 160 * s, 9, k); }
}
function healGlow(c, x, y, k, t, r = 90) { if (k <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y, r * 2.6, '#fff2cc', 0.5 * k); c.restore(); sparkle(c, t, x, y, 10, r, 21, k); }
function flowLine(c, x0, y0, x1, y1, k, t) { // a ribbon of soft light from the hand of 'Issa to the one he heals
  if (k <= 0) return; t += 100; c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 14; i++) { const ph = (t * 0.6 + i / 14) % 1, q = ph, x = lerp(x0, x1, q), y = lerp(y0, y1, q) - Math.sin(q * Math.PI) * 40;
    c.fillStyle = `rgba(255,240,200,${0.7 * k * Math.sin(q * Math.PI)})`; c.beginPath(); c.arc(x, y, 4 + 3 * Math.sin(q * Math.PI), 0, 6.283); c.fill(); }
  c.restore();
}
// the village (Bethlehem / the outskirts of Jerusalem): far hills with cedars, a terrace of stone houses, olive trees, a flagstone square
function village(c, t, o = {}) {
  const fy = o.fy || 1220, lamp = o.lamp === undefined ? 0.6 : o.lamp, dusk = o.dusk === undefined ? 1 : o.dusk;
  hillsBehind(c, t, fy - 170, { far: mix('#8a8aa0', '#5a4a6a', dusk), mid: mix('#7a7a70', '#4a3a48', dusk), haze: mix('#f4e0c0', '#e09a7a', dusk), tree: '#2e3030' });
  const hs = [[-700, 300, 240], [-420, 260, 200], [-170, 300, 260], [120, 240, 190], [380, 280, 230], [880, 300, 250], [1150, 260, 210], [1420, 300, 240], [1700, 280, 220]];
  hs.forEach(([x, w, h], i) => house(c, x, fy + 8, w, h, mix(VCOL, '#8a7060', (i % 3) * 0.15 + 0.2 * dusk), { lamp: lamp * (i % 2 ? 1 : 0.6), t: t + 100, smoke: i === 3 ? 1 : 0 }));
  [[-300, 0.9], [640, 0.8], [1300, 0.95]].forEach(([x, s], i) => oliveTree(c, x, fy + 12, s, mix('#6a7a48', '#4a5038', dusk), mix('#4a5a30', '#2a3020', dusk), Math.sin(t * 0.8 + i) * 3));
  flagFloor(c, fy + 6, o.vx || 540, mix('#b8a07a', '#8a7058', dusk), { sheen: o.sheen || 0.12, sheenCol: '#ffc890' });
}
const CROWD = [ // the people of Maryam in the square: [x, y, h, dir, folk index]
  [330, 1300, 250, 1, 2], [480, 1296, 240, -1, 5], [560, 1304, 250, -1, 0],
  [-60, 1340, 300, 1, 1], [90, 1336, 300, 1, 3], [215, 1344, 300, 1, 8], [880, 1340, 300, -1, 4], [1010, 1334, 300, -1, 6], [1150, 1344, 300, -1, 7],
  [10, 1450, 380, 1, 5], [170, 1462, 370, 1, 0], [960, 1452, 380, -1, 2], [1110, 1466, 370, -1, 3],
];
// the square at dusk: Maryam, the baby in the cradle, the crowd around. o: kC / kM / kW camera, speak (light of the baby),
// recoil (people step back), accuse (arms raised), point (Maryam's hand toward the baby), hush (Maryam silent)
const HQ = [[540, 1380, 1.18], [420, 1500, 1.55], [660, 1220, 1.45], [540, 1220, 0.94]];
function issaHero(c, T, o = {}) {
  const sp = o.speak || 0, rc = o.recoil || 0, ac = o.accuse || 0;
  sky0(c, [[0, '#121838'], [0.22, '#3a3a6a'], [0.4, '#a87080'], [0.52, '#f0a878']]);
  let p = HQ[0].slice(); [o.kC, o.kM, o.kW].forEach((k, i) => { if (k > 0) p = p.map((v, j) => lerp(v, HQ[i + 1][j], k)); });
  const [sx, sy] = o.shake ? shake(T, o.shake, 10) : [0, 0];
  cam(c, p[2] + 0.004 * Math.sin(T * 0.3), p[0] + 3 * Math.sin(T * 0.2), p[1], sx, sy);
  stars(c, T, 70, 9, [-500, -400, W + 1000, 760], 0.7);
  moon(c, 860, 360, 40, 0.9, 0.33);
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 200, 1000, 700, '#ff9a60', 0.28); c.restore();
  wisps(c, T, 600, 6, '#ffb890', 0.14, 4, 5);
  village(c, T, { fy: 1220, lamp: 0.8 });
  const xc = 430, yc = 1660, xm = 700, ym = 1640;
  CROWD.forEach(([x, y, h, d, k], i) => {
    const towards = d, back = rc * (h > 330 ? 1 : 0.6), shift = -towards * back * 24;
    const who = Object.assign({}, FOLK[k], i === 4 ? ELDER : {});
    const pose = { x: x + shift, y, h, dir: d, light: 0.75, t: T + i * 1.3, wind: 0.25,
      armUp: ac > 0 && i % 3 === 0 ? 0.55 * ac : 0, reach: ac > 0 && i % 3 === 1 ? 0.7 * ac : (sp > 0 && i % 4 === 2 ? 0.4 * sp : 0) };
    lean(c, pose.x, y, -towards * 0.07 * back, () => fig(c, who, pose));
  });
  cradle(c, xc, yc, 0.85, T, 0.6 + 0.4 * sp);
  const mo = { x: xm, y: ym, h: 540, dir: -1, light: 0.95, t: T, wind: 0.3, reach: o.point || 0 };
  fig(c, MARY, mo);
  if (o.hush) hushAt(c, Object.assign({}, mo, { dir: 1 }), o.hush, T);
  babyLight(c, xc - 53, yc - 135, sp, T);
  blurLayer(c, 9, cc => fgBrush(cc, t), 2);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// the palm in the remote place (Maryam 22-26): dusk, low hills, sand, the palm trunk on the left
const PX0 = 300, PGY = 1600;
function palmPlace(c, t, o = {}) {
  const night = o.night || 0, warm = o.warm || 0;
  sky0(c, [[0, mix(mix('#3a3a6a', '#0a0e26', night), '#4a5a8a', warm)], [0.3, mix(mix('#b07a8a', '#1e2448', night), '#e0a890', warm)], [0.5, mix(mix('#ffb88a', '#3a3a60', night), '#ffd8a8', warm)]]);
}
function palmGround(c, t, o = {}) {
  const night = o.night || 0, px = o.px || 0;
  par(c, 0.12, px, 0, () => { ridgeW(c, 1180, 120, 0.003, 41, mix('#8a7090', '#2a2a48', night)); hazeW(c, 1200, 220, mix('#f0b090', '#3a3a68', night), 0.45); });
  par(c, 0.3, px, 0, () => { ridgeW(c, 1300, 80, 0.004, 43, mix('#7a5a5a', '#262438', night)); hazeW(c, 1320, 140, mix('#f0b090', '#3a3a68', night), 0.3);
    for (let i = -4; i < 12; i++) if (i % 3 !== 1) datePalm(c, -600 + i * 210, 1312 + (i % 2) * 6, 0.32 + (i % 3) * 0.05, mix('#4a5a30', '#1a2018', night), t, i + 3); });
  sandW(c, 1380, mix('#c49a68', '#3a3448', night), 7, { pebbles: 110, tufts: 14 });
}

// the eastern place where Maryam withdrew (Maryam 16-17): dawn courtyard, a stone wall, the screen she placed, an olive tree
function eastPlace(c, t, o = {}) {
  const fy = o.fy || 1560;
  sky0(c, [[0, '#2a3a6a'], [0.28, '#9a8aa8'], [0.42, '#f6c8a0'], [0.52, '#fff0d0']]);
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 980, 1100, 900, '#ffd8a0', 0.35); c.restore();
  wisps(c, t, 520, 7, '#ffe0c8', 0.22, 12, 5);
  hillsBehind(c, t, 1270, { far: '#9a90a8', mid: '#7a6a78', haze: '#f6d0b0', tree: '#3a3a38' });
  ashlar(c, -1200, fy - 520, 120, fy, STONE, 7);
  c.fillStyle = mix(STONE, '#fff2dc', 0.25); c.fillRect(-1200, fy - 534, 1332, 16);
  column(c, 140, fy, 70, 640, STONE);
  oliveTree(c, 1010, fy + 4, 1.25, '#6a7a48', '#4a5a30', Math.sin(t * 0.8) * 3);
  flagFloor(c, fy, 600, '#b89a72', { sheen: 0.18, sheenX: 900, sheenCol: '#ffd8a0' });
  hangingCurtain(c, 170, 480, fy, 520, t);
}
function heavens(c, t, k, o = {}) { // the sky opening above (no form: clouds drawn apart, rays of light)
  sky0(c, [[0, '#0a0c22'], [0.45, '#1e2448'], [0.7, '#3a3460']]);
  stars(c, t, 120, 31, [-200, -200, W + 400, 1400], 0.8);
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, 520, 900 * (0.5 + 0.5 * k), '#fff2d0', 0.35 * k); c.restore();
  cloudsPart(c, t, 0.2 + 0.5 * k, 540, 560);
  rays(c, 540, 380, Math.PI / 2, 0.8, 1700, 14, '#fff4d8', 0.14 * k, t, 41);
  ridgeW(c, 1560, 90, 0.004, 51, '#1a1626'); hazeW(c, 1580, 160, '#3a3460', 0.4);
  ridgeW(c, 1700, 60, 0.005, 53, '#120e18');
}
function oliveGrove(c, t, o = {}) { // the night hillside (Mount of Olives, according to the tradition): far city lights, old olive trees
  sky0(c, [[0, '#05081a'], [0.35, '#141a38'], [0.55, '#2a2a4a']]);
  stars(c, t, 140, 44, [-600, -300, W + 1200, 1100], 0.9); moon(c, 820, 330, 38, 0.85, 0.3);
  ridgeW(c, 1200, 110, 0.0035, 61, '#1a1a30'); hazeW(c, 1220, 160, '#2a2a50', 0.4);
  const r = rng(5); for (let i = 0; i < 40; i++) { const x = -800 + r() * 2600, y = 1230 + r() * 60; c.fillStyle = `rgba(255,190,110,${0.35 + 0.3 * r()})`; c.fillRect(x, y, 3, 3); }
  ridgeW(c, 1380, 60, 0.004, 63, '#141428');
  [[-500, 1.3], [-120, 1.5], [1180, 1.6], [1500, 1.3]].forEach(([x, s], i) => oliveTree(c, x, 1400, s, '#26302a', '#1a2018', Math.sin(t * 0.7 + i) * 4));
  const g = c.createLinearGradient(0, 1380, 0, H + 300); g.addColorStop(0, '#2a2620'); g.addColorStop(1, '#0e0c0a'); c.fillStyle = g; c.fillRect(-2000, 1380, W + 4000, H + 1000);
  const r2 = rng(9); for (let i = 0; i < 60; i++) { const q = Math.pow(r2(), 1.5), y = 1390 + q * 600, x = -1500 + r2() * 4000; boulder(c, x, y, 20 + q * 70, 12 + q * 30, '#3a3428', i); }
}


// ---------- episode 14: Adam
const ADAM = { veilGlow: 0.5, prophet: true, robe: '#efe9dc', wrap: '#f8f5ee', skin: '#c49470', trim: '#d8bf80', band: '#c9a35a', inner: '#fcfaf4' };
const HAWA = { agal: false, robe: '#3e5a6e', wrap: '#ece4d4', skin: '#b4805c', trim: '#c9b07a', band: '#8a7a5a', covered: true, inner: '#f2ece0' }; // "his wife" (Hawwa in the hadith)
const CLAY = { prophet: true, veilGlow: 0.2, robe: '#8a5a3a', wrap: '#9a6a48', skin: '#7a4e32', trim: '#6a4028', band: '#6a4028', inner: '#9a6a4a', shadow: true };
const GFY = 1180; // horizon of the heavenly assembly

// An angel is never drawn: a tall soft flame of white-gold light. bow 0 -> 1: it bends toward dir and lowers to the ground.
function angelLight(c, x, y, h, bow, dir, t, k = 1, seed = 0) {
  if (k <= 0) return;
  const b = ease(clamp(bow)), fl = 1 + 0.035 * Math.sin(t * 2.6 + seed * 1.7);
  const hh = h * lerp(1, 0.5, b) * fl, lean = dir * 0.75 * b, w = h * 0.12;
  const tipx = Math.sin(lean) * hh, tipy = -Math.cos(lean) * hh;
  c.save(); c.translate(x, y); c.globalCompositeOperation = 'lighter';
  c.save(); c.scale(1, 0.28); glow(c, tipx * 0.3, 0, h * 0.45, '#ffe2a8', 0.16 * k); c.restore(); // pool of light on the floor
  glow(c, tipx * 0.45, tipy * 0.45, h * 0.5, '#ffe8bc', 0.07 * k);
  const g = c.createLinearGradient(0, 0, tipx, tipy);
  g.addColorStop(0, `rgba(255,232,180,${0.42 * k})`); g.addColorStop(0.55, `rgba(255,246,222,${0.3 * k})`); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.beginPath(); c.moveTo(-w, 0);
  c.bezierCurveTo(-w * 1.25, -hh * 0.35 * (1 - b * 0.5), tipx * 0.55 - w * 0.7 * Math.cos(lean), tipy * 0.7 - w * 0.7 * Math.sin(lean) * dir, tipx, tipy);
  c.bezierCurveTo(tipx * 0.55 + w * 0.7 * Math.cos(lean), tipy * 0.7 + w * 0.7 * Math.sin(lean) * dir, w * 1.25, -hh * 0.35 * (1 - b * 0.5), w, 0);
  c.closePath(); c.fill();
  c.strokeStyle = `rgba(255,255,248,${0.42 * k})`; c.lineWidth = Math.max(2, h * 0.03); c.lineCap = 'round';
  c.beginPath(); c.moveTo(0, -3); c.quadraticCurveTo(tipx * 0.25, tipy * 0.55, tipx * 0.72, tipy * 0.72); c.stroke();
  glow(c, 0, -h * 0.05, h * 0.14, '#ffffff', 0.2 * k);
  c.restore();
}
// Iblis is never drawn: a dark, smoky flame that stays upright. flare: it rises, taller and hotter (arrogance)
function darkFlame(c, x, y, h, t, k = 1, flare = 0) { t += 100;
  if (k <= 0) return;
  const H0 = h * (1 + 0.45 * flare);
  c.save(); c.translate(x, y);
  smoke(c, t, -H0 * 0.15, -H0 * 0.55, 9, 7, '#140a0c', 0.55 * k, H0 / 360, H0 / 26);
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -H0 * 0.35, H0 * (0.75 + 0.3 * flare), '#ff4a1a', (0.18 + 0.22 * flare) * k); c.restore();
  c.save(); c.scale(1, 0.25); glow(c, 0, 0, H0 * 0.5, '#ff5a20', 0.35 * k); c.restore();
  [['#1e0806', 1, 0.96], ['#5a1208', 0.82, 0.92], ['#a8300e', 0.62, 0.9], ['#e8661e', 0.42, 0.85], ['#ffc060', 0.22, 0.8]].forEach(([col, s, a], j) => {
    const hh = H0 * s * (1 + 0.07 * Math.sin(t * 8 + j * 1.7)), w = H0 * 0.2 * Math.sqrt(s), sw = Math.sin(t * 6 + j) * w * 0.45;
    c.fillStyle = hexA(col, a * k); c.beginPath(); c.moveTo(-w, 0);
    c.bezierCurveTo(-w * 1.35, -hh * 0.38, -w * 0.5 + sw, -hh * 0.72, Math.sin(t * 7 + j * 1.3) * w * 0.55, -hh);
    c.bezierCurveTo(w * 0.5 + sw * 0.6, -hh * 0.66, w * 1.35, -hh * 0.36, w, 0); c.closePath(); c.fill();
  });
  for (let i = 0; i < 5; i++) { const ph = (t * (0.9 + i * 0.13) + i * 0.37) % 1, ex = Math.sin(i * 2.3 + t * 2) * H0 * 0.18, ey = -H0 * (0.5 + ph * 0.8); // embers rising
    c.fillStyle = `rgba(255,140,60,${0.8 * k * (1 - ph)})`; c.beginPath(); c.arc(ex, ey, 3 + (1 - ph) * 3, 0, 6.283); c.fill(); }
  c.restore();
}
function heavenSky(c, dim = 0) {
  sky0(c, [[0, mix('#0a0c26', '#040408', dim)], [0.28, mix('#24244e', '#0a0a14', dim)], [0.44, mix('#8a6a98', '#1e1420', dim)], [0.54, mix('#ffd8a8', '#3a2418', dim)], [1, mix('#3a2e50', '#08060a', dim)]]);
}
// the floor of the heavenly assembly: a plain of soft light with a sea of clouds at the horizon (abstract: no building, no throne)
function assemblyFloor(c, t, fy = GFY, dim = 0) {
  const hz = mix('#e8b890', '#4a3020', dim);
  const sg = c.createLinearGradient(0, fy - 760, 0, fy); sg.addColorStop(0, hexA(hz, 0)); sg.addColorStop(1, hexA(hz, 0.55)); c.fillStyle = sg; c.fillRect(-2400, fy - 760, W + 4800, 762);
  const g = c.createLinearGradient(0, fy, 0, fy + 1100); g.addColorStop(0, hz); g.addColorStop(0.1, mix('#8a6a88', '#2a1e24', dim)); g.addColorStop(0.45, mix('#3a3058', '#140e18', dim)); g.addColorStop(1, mix('#161228', '#06040a', dim));
  c.fillStyle = g; c.fillRect(-2400, fy, W + 4800, 2600);
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, fy, 900, '#ffc890', 0.16 * (1 - dim)); c.restore();
  c.strokeStyle = `rgba(255,236,200,${0.09 * (1 - dim)})`; c.lineWidth = 3; // perspective lines of light on the floor
  for (let i = -16; i <= 16; i++) { c.beginPath(); c.moveTo(540 + i * 20, fy); c.lineTo(540 + i * 380, fy + 1400); c.stroke(); }
  for (let j = 1; j < 9; j++) { const y = fy + Math.pow(j / 9, 2.2) * 1200; c.strokeStyle = `rgba(255,236,200,${0.06 * (1 - dim)})`; c.beginPath(); c.moveTo(-2400, y); c.lineTo(W + 2400, y); c.stroke(); }
  cloudBank(c, t, fy - 120, 10, mix('#e8c8b8', '#3a2a28', dim), 0.25, 81, 4);
  cloudBank(c, t, fy - 60, 9, mix('#a88aa0', '#2a2024', dim), 0.3, 82, 6);
  wisps(c, t, fy + 40, 8, mix('#d8c0d0', '#4a3a3a', dim), 0.14, 83, 8);
}
const AROWS = [1250, 1310, 1400, 1520];
function lightSlots() { // positions of the angels' lights in the assembly: two wings facing the aisle where Adam stands
  const out = [];
  AROWS.forEach((y, j) => { const h = (y - 1150) * 1.1, aisle = 70 + (y - GFY) * 0.6, sp = h * 0.56, n = 8 - j;
    for (let i = 0; i < n; i++) [-1, 1].forEach(side => out.push({ x: 540 + side * (aisle + i * sp), y, h, side, j, i })); });
  return out;
}
const SLOTS = lightSlots();
const FLAME = { x: 540 + (70 + (1400 - GFY) * 0.6) + (1400 - 1150) * 1.1 * 0.56, y: 1400, h: 300 }; // Iblis' place among them (row 2, right wing)
// hero image (hook / order / refuse / cta / outro / cover): Adam among the angels' lights, all bowing, one dark flame upright
const AQ = [[540, 1330, 1.0], [540, 1370, 1.42], [FLAME.x - 40, 1260, 1.75], [540, 1260, 0.86]];
function adamHero(c, T, o = {}) {
  const bow = o.bow || 0, fk = o.flame === undefined ? 1 : o.flame, dim = o.dim || 0;
  heavenSky(c, dim);
  let p = AQ[0].slice(); [o.kC, o.kF, o.kW].forEach((k, i) => { if (k > 0) p = p.map((v, j) => lerp(v, AQ[i + 1][j], k)); });
  const [sx, sy] = o.shake ? shake(T, o.shake, 9) : [0, 0];
  cam(c, p[2] + 0.006 * Math.sin(T * 0.35), p[0] + 4 * Math.sin(T * 0.21), p[1], sx, sy);
  stars(c, T, 90, 14, [-700, -500, W + 1400, 1300], 0.8 * (1 - dim * 0.5)); milkyWay(c, T, 0.5 * (1 - dim));
  assemblyFloor(c, T, GFY, dim);
  const wave = s => clamp(bow * 1.7 - Math.abs(s.x - 540) / 1400 * 0.7 - s.j * 0.04);
  SLOTS.forEach((s, i) => { if (Math.abs(s.x - FLAME.x) < 5 && s.y === FLAME.y) return; angelLight(c, s.x, s.y, s.h, wave(s), -s.side, T, 1 - 0.4 * dim, i); });
  darkFlame(c, FLAME.x, FLAME.y, FLAME.h, T, fk, o.flare || 0);
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, 1300, 420, '#fff2d8', 0.08 + 0.06 * bow); c.restore();
  fig(c, ADAM, { x: 540, y: 1600, h: 540, dir: 1, light: 1.1, t: T, wind: 0.2, veilGlow: 0.45, armUp: o.armUp || 0 });
  blurLayer(c, 12, cc => { [[-120, 1880, 760, 1], [1200, 1900, 780, -1]].forEach(([x, y, h, d], i) => angelLight(cc, x, y, h, clamp(bow * 1.7 - 0.62), d, T, 0.45, 40 + i)); }, 2);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// the empty young earth (no house, no road: nobody lives there yet). o.red: angry dusk, o.flood: light pouring from above
function wildEarth(c, t, o = {}) {
  const red = o.red || 0, fl = o.flood || 0, px = o.px || 0, fy = o.fy || 1380;
  sky0(c, [[0, mix(mix('#2a3a6a', '#2a0e12', red), '#6a8ac0', fl)], [0.3, mix(mix('#b08aa0', '#8a2a1e', red), '#f0d8c0', fl)], [0.5, mix(mix('#ffd0a0', '#e0602a', red), '#fff4dc', fl)]]);
  sun(c, 760, fy - 300, 60, '#ffe6c0', 0.8 + 0.2 * fl); c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 760, fy - 300, 800, mix('#ff9a60', '#ff4a1a', red), 0.3); c.restore();
  wisps(c, t, 520, 7, mix('#ffd8c0', '#c05040', red), 0.22, 91, 6);
  par(c, 0.12, px, 0, () => { ridgeW(c, fy - 180, 170, 0.003, 92, mix(mix('#7a7a9a', '#5a2a30', red), '#9a9ab8', fl)); hazeW(c, fy - 160, 240, mix('#f4d0b0', '#e07050', red), 0.5); });
  par(c, 0.3, px, 0, () => { ridgeW(c, fy - 60, 110, 0.004, 93, mix(mix('#5a6a5a', '#4a2224', red), '#7a8a6a', fl)); hazeW(c, fy - 40, 160, mix('#f4d0b0', '#e07050', red), 0.35);
    for (let i = -6; i < 14; i++) if (i % 3) oliveTree(c, -700 + i * 190, fy - 40 + (i % 2) * 10, 0.35, mix('#4a5a3a', '#3a2020', red), mix('#2a3a24', '#2a1414', red), Math.sin(t + i) * 2); });
  par(c, 0.55, px, 0, () => { water(c, t, fy - 4, fy + 46, { top: mix('#8ab0c0', '#c06040', red), bot: mix('#3a6070', '#5a2020', red), sunX: 760, flow: 14, n: 40 }); });
  plain(c, fy + 40, t, { col: mix('#7a8a4a', '#7a4a32', red), seed: 94, n: 150 });
}
function earthGlyph(c, k, x, y, s, t) { // where the first man will stand: a spot of light on the empty land
  if (k <= 0) return; lightRings(c, x, y, t, 0.8 * k, 3, 420 * s); c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y - 20, 240 * s, '#fff2d0', 0.5 * k); c.restore(); star4(c, x, y - 40 * s, 26 * s * k, '#ffffff', k);
}
// clay: soils of every colour gathered (at-Tirmidhi: Adam was made from a handful taken from all the earth)
const SOILS = ['#a8502e', '#e8dcc4', '#2a1e1a', '#c8964e', '#7a4a32', '#d8b070'];
function soilSwirl(c, t, x, y, k, n = 160) { t += 100;
  const r = rng(17);
  for (let i = 0; i < n; i++) { const a0 = r() * 6.283, d0 = 300 + r() * 600, sp = 0.4 + r() * 0.6, col = SOILS[i % SOILS.length];
    const d = lerp(d0, 20 + r() * 90, ease(k)), a = a0 + t * sp * (1 - k * 0.7) + k * 3;
    const px = x + Math.cos(a) * d, py = y - 60 + Math.sin(a) * d * 0.45 * (1 - k * 0.6), s = 4 + r() * 9;
    c.fillStyle = hexA(col, 0.9 * (1 - 0.5 * k)); c.beginPath(); c.ellipse(px, py, s, s * 0.7, a, 0, 6.283); c.fill(); }
}
function clayMound(c, x, y, s, k) { // a heap of kneaded clay, streaked with the soils' colours
  if (k <= 0) return; c.save(); c.translate(x, y); c.scale(s, s * ease(k));
  const g = c.createLinearGradient(0, -120, 0, 0); g.addColorStop(0, '#b07a52'); g.addColorStop(1, '#5a3420');
  c.fillStyle = g; c.beginPath(); c.moveTo(-240, 0); c.bezierCurveTo(-200, -90, -80, -130, 0, -128); c.bezierCurveTo(90, -126, 200, -90, 240, 0); c.closePath(); c.fill();
  SOILS.forEach((col, i) => { c.strokeStyle = hexA(col, 0.45); c.lineWidth = 6; c.beginPath(); c.moveTo(-200 + i * 20, -10); c.quadraticCurveTo(-60 + i * 30, -110 + i * 12, 120 + i * 18, -20); c.stroke(); });
  c.restore();
}
function clayPlain(c, t, o = {}) { // the plain under a soft light where the clay was shaped
  const fy = o.fy || 1300, warm = o.warm || 0;
  sky0(c, [[0, mix('#1a1a3a', '#3a4a7a', warm)], [0.3, mix('#6a4a6a', '#c8a0a0', warm)], [0.5, mix('#d0906a', '#ffe0b8', warm)]]);
  stars(c, t, 60, 51, [-400, -300, W + 800, 900], 0.6 * (1 - warm));
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, fy - 100, 900, '#ffb880', 0.3 + 0.2 * warm); c.restore();
  ridgeW(c, fy - 60, 120, 0.0035, 52, mix('#5a3a48', '#8a6a78', warm)); hazeW(c, fy - 40, 200, mix('#e0a080', '#ffe0c0', warm), 0.45);
  ridgeW(c, fy + 10, 60, 0.005, 53, mix('#6a3a28', '#8a5a3a', warm));
  const g = c.createLinearGradient(0, fy, 0, H + 400); g.addColorStop(0, mix('#9a5a3a', '#b8805a', warm)); g.addColorStop(1, '#2a1610'); c.fillStyle = g; c.fillRect(-2400, fy + 20, W + 4800, H + 2400);
  const r = rng(55); for (let i = 0; i < 90; i++) { const q = Math.pow(r(), 1.5), yy = fy + 30 + q * (H + 300 - fy), x = -1400 + r() * (W + 2800), sz = 3 + q * 22;
    c.fillStyle = hexA(SOILS[i % SOILS.length], 0.3 + 0.3 * q); c.beginPath(); c.ellipse(x, yy, sz * 2, sz * 0.5, 0, 0, 6.283); c.fill(); }
}
// the names (Al-Baqara 31): medallions of light, each holding one thing of creation
const NAMES = ['ÉTOILE', 'LUNE', 'ARBRE', 'OISEAU', 'EAU', 'MONTAGNE', 'CHAMEAU'];
function nameIcon(c, i, x, y, r, t) {
  c.save(); c.translate(x, y); const s = r / 70;
  c.strokeStyle = '#3a2a1a'; c.fillStyle = '#3a2a1a'; c.lineCap = 'round';
  if (i === 0) star4(c, 0, 0, 36 * s, '#fff4c8', 1);
  else if (i === 1) moon(c, 0, 0, 30 * s, 1, 0.4);
  else if (i === 2) tree(c, 0, 36 * s, 0.32 * s, t, { leaf: 1, seed: 4, depth: 4, leafCol: '#4a7a3a', col: '#5a3a24' });
  else if (i === 3) { c.save(); c.scale(s * 1.6, s * 1.6); bird(c, 0, 0, 1.3, t, 2, '#3a2a1a'); c.restore(); }
  else if (i === 4) { c.lineWidth = 5 * s; for (let k = 0; k < 3; k++) { c.strokeStyle = ['#3a7aa0', '#5a9ac0', '#8ac0e0'][k]; c.beginPath(); for (let xx = -40; xx <= 40; xx += 5) { const yy = -18 + k * 16 + Math.sin(xx * 0.15 + t * 3 + k) * 5; xx === -40 ? c.moveTo(xx * s, yy * s) : c.lineTo(xx * s, yy * s); } c.stroke(); } }
  else if (i === 5) { c.fillStyle = '#6a5a7a'; c.beginPath(); c.moveTo(-46 * s, 30 * s); c.lineTo(-8 * s, -34 * s); c.lineTo(10 * s, -8 * s); c.lineTo(22 * s, -22 * s); c.lineTo(48 * s, 30 * s); c.closePath(); c.fill();
    c.fillStyle = '#fff6ec'; c.beginPath(); c.moveTo(-8 * s, -34 * s); c.lineTo(-18 * s, -16 * s); c.lineTo(-4 * s, -20 * s); c.lineTo(4 * s, -18 * s); c.closePath(); c.fill(); }
  else if (i === 6) camel(c, 0, 34 * s, 0.22 * s, '#b0845a', t, 1, null, { walk: false, shadow: false, head: 0 });
  c.restore();
}
function medallion(c, i, x, y, r, k, lit, t) { // k: appears; lit: named (label + brighter)
  if (k <= 0) return; const e = easeOut(k), rr = r * (0.6 + 0.4 * e);
  c.save(); c.globalAlpha *= e;
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y, rr * 2.4, '#ffe8b0', 0.35 + 0.35 * lit); c.restore();
  const g = c.createRadialGradient(x, y - rr * 0.3, 0, x, y, rr); g.addColorStop(0, '#fffaf0'); g.addColorStop(1, mix('#f6e2b8', '#ffffff', lit * 0.4));
  c.fillStyle = g; c.beginPath(); c.arc(x, y, rr, 0, 6.283); c.fill();
  c.strokeStyle = hexA('#d8a840', 0.8); c.lineWidth = 4; c.stroke();
  c.save(); c.beginPath(); c.arc(x, y, rr - 4, 0, 6.283); c.clip(); nameIcon(c, i, x, y, rr, t); c.restore();
  if (lit > 0) { textGlow(c, NAMES[i], x, y + rr + 34, '700 30px Lora', '#fff6e0', ease(lit), '#000', 10); sparkle(c, t, x, y, 6, rr * 1.3, 60 + i, lit * (1 - lit * 0.5)); }
  c.restore();
}
// Paradise (al-Janna): luminous valley, rivers, trees in bloom, flowers, birds. o.fade: colours drain (after the fault)
function paradise(c, t, o = {}) {
  const px = o.px || 0, fy = o.fy || 1340, dusk = o.dusk || 0;
  sky0(c, [[0, mix('#6aa0d8', '#1a1a3a', dusk)], [0.3, mix('#cfe4f0', '#5a4a6a', dusk)], [0.5, mix('#fff4dc', '#c08a7a', dusk)]]);
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 620, fy - 380, 900, mix('#fff2d0', '#ff9a70', dusk), 0.4); c.restore();
  wisps(c, t, 420, 8, '#ffffff', 0.25 * (1 - dusk), 101, 5);
  par(c, 0.1, px, 0, () => { ridgeW(c, fy - 260, 220, 0.0028, 102, mix('#a8c0d8', '#4a4a6a', dusk)); hazeW(c, fy - 230, 300, mix('#fff8ec', '#d0a090', dusk), 0.6);
    for (let i = 0; i < 4; i++) { const wx = -300 + i * 620, wy = ridgeY(wx, fy - 260, 220, 0.0028, 102); c.fillStyle = `rgba(255,255,255,${0.35 * (1 - dusk)})`; c.fillRect(wx - 8, wy + 10, 16, fy - 230 - wy); } }); // far waterfalls
  par(c, 0.28, px, 0, () => { ridgeW(c, fy - 120, 120, 0.0038, 103, mix('#6a9a6a', '#3a4a48', dusk)); hazeW(c, fy - 100, 200, mix('#fff4e4', '#c09080', dusk), 0.4);
    for (let i = -8; i < 16; i++) tree(c, -900 + i * 150 + (i % 3) * 30, fy - 90 + (i % 2) * 14, 0.3 + (i % 3) * 0.04, t, { leaf: 1, seed: 110 + i, depth: 4, leafCol: mix(i % 2 ? '#5a9a4a' : '#7ab05a', '#3a4a3a', dusk), bloom: i % 3 === 0 ? 1 : 0, col: '#4a3a2a' }); });
  par(c, 0.5, px, 0, () => { water(c, t, fy - 26, fy + 40, { top: mix('#a8e0f0', '#5a6a8a', dusk), bot: mix('#4a9ab8', '#2a3a5a', dusk), sunX: 620, flow: 18, n: 50 }); });
  plain(c, fy + 30, t, { col: mix('#6aa04a', '#3a4a3a', dusk), seed: 104, n: 190 });
  par(c, 0.7, px, 0, () => { for (let i = -3; i < 7; i++) flowers(c, -400 + i * 330, fy + 140 + (i % 2) * 60, 180, 1, 120 + i, t, 26); });
  if (!o.noBirds) flock(c, t, 200 + ((t * 40) % 1400) - px * 0.3, 520, 5, 0.8, 7, { col: mix('#2a3a4a', '#1a1a2a', dusk) });
}
const TREEX = 820; // the tree they were told not to approach, on a low knoll
function theTree(c, x, y, s, t, o = {}) {
  c.fillStyle = mix('#5a8a3e', '#2a3a30', o.dusk || 0); c.beginPath(); c.ellipse(x, y + 10, 340 * s, 50 * s, 0, Math.PI, 0); c.fill(); // knoll
  if (o.ring > 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,230,170,${0.6 * o.ring})`; c.lineWidth = 5; c.setLineDash([18, 14]); c.beginPath(); c.ellipse(x, y + 6, 300 * s, 46 * s, 0, 0, 6.283); c.stroke(); c.setLineDash([]); c.restore(); }
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y - 300 * s, 420 * s, '#ffe6a0', 0.18 * (o.aura === undefined ? 1 : o.aura)); c.restore();
  tree(c, x, y, s, t, { leaf: o.leaf === undefined ? 1 : o.leaf, seed: 141, depth: 5, leafCol: mix('#2e6a4a', '#2a3a34', o.dusk || 0), col: '#3a2a1e', wind: 1 + (o.shiver || 0) * 6 });
}
function darkWisp(c, t, k, pts, o = {}) { t += 100; // the whisper (Satan is never drawn): a dark ribbon of smoke winding along pts
  if (k <= 0) return; const n = 60, lim = Math.floor(n * clamp(k));
  const P = q => { const m = pts.length - 1, f = q * m, i = Math.min(m - 1, Math.floor(f)), u = f - i, a = pts[i], b = pts[i + 1]; return [lerp(a[0], b[0], u), lerp(a[1], b[1], u)]; };
  for (let i = 0; i < lim; i++) { const q = i / n, [x, y] = P(q), wob = Math.sin(q * 18 - t * 3) * 26 * (o.wob || 1), r = (28 + 30 * Math.sin(q * Math.PI)) * (o.s || 1);
    const g = c.createRadialGradient(x, y + wob, 0, x, y + wob, r); g.addColorStop(0, `rgba(16,8,14,${0.5 * (o.a || 1)})`); g.addColorStop(1, 'rgba(16,8,14,0)');
    c.fillStyle = g; c.fillRect(x - r, y + wob - r, r * 2, r * 2); }
  const [hx, hy] = P(clamp(k)); c.save(); c.globalCompositeOperation = 'lighter'; glow(c, hx, hy, 40, '#ff3a1a', 0.22 * (o.a || 1)); c.restore();
}
function whisperRings(c, x, y, t, a) { if (a <= 0) return; t += 100; // dark murmurs at the ear
  for (let i = 0; i < 3; i++) { const ph = (t * 0.7 + i / 3) % 1; c.strokeStyle = `rgba(20,10,16,${0.55 * a * (1 - ph)})`; c.lineWidth = 5; c.beginPath(); c.arc(x, y, 20 + ph * 70, Math.PI * 0.7, Math.PI * 1.3); c.stroke(); }
}
function fallingLeaves(c, t, k, x, y, n = 18, seed = 3) { t += 100; if (k <= 0) return; const r = rng(seed);
  for (let i = 0; i < n; i++) { const ph = (t * (0.18 + r() * 0.12) + r()) % 1, lx = x + (r() - 0.5) * 500 + Math.sin(t * 2 + i) * 40 + ph * 140, ly = y + ph * 900;
    c.save(); c.translate(lx, ly); c.rotate(t * 2 + i); c.fillStyle = hexA(r() > 0.5 ? '#6a8a3a' : '#9a8a3a', k * 0.85 * Math.sin(ph * Math.PI)); c.beginPath(); c.ellipse(0, 0, 12, 5, 0, 0, 6.283); c.fill(); c.restore(); }
}
function desat(c, k) { if (k <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'saturation'; c.fillStyle = `rgba(128,128,128,${k})`; c.fillRect(0, 0, W, H); c.restore(); }
const ARL = ['ك', 'ل', 'م', 'ا', 'ت', 'ر', 'ب', 'ه', 'و', 'ن'];
function wordsOfLight(c, t, k, x, y, a = 1) { t += 100; // the words Adam received (Al-Baqara 37): letters of light drifting down to him
  if (k <= 0) return; const r = rng(71); c.save(); c.direction = 'rtl'; c.textAlign = 'center';
  for (let i = 0; i < 22; i++) { const ph = (t * (0.12 + r() * 0.08) + r()) % 1, lx = x + (r() - 0.5) * 760 * (1 - ph * 0.7), ly = y - 900 + ph * 820, sz = 40 + r() * 50;
    const al = a * k * Math.sin(ph * Math.PI); if (al <= 0.01) continue;
    c.globalAlpha = al; c.font = `700 ${sz}px Amiri`; c.shadowColor = '#ffb300'; c.shadowBlur = 20; c.fillStyle = '#ffe6a0'; c.fillText(ARL[i % ARL.length], lx, ly); }
  c.restore();
}
function splitPanel(c, x0, x1, fn) { c.save(); c.beginPath(); c.rect(x0, 0, x1 - x0, H); c.clip(); fn(); c.restore(); }
function nightWorld(c, t, k) { // today's world at night: far valleys, scattered lights; a dark wisp drifting over it
  sky0(c, [[0, '#04060f'], [0.4, '#0e1428'], [0.55, '#1e2238']]);
  stars(c, t, 160, 61, [-200, -200, W + 400, 1100], 0.9);
  ridgeW(c, 1100, 120, 0.0035, 62, '#141a30'); hazeW(c, 1120, 180, '#2a3258', 0.4);
  const r = rng(63); for (let i = 0; i < 160; i++) { const q = Math.pow(r(), 1.3), y = 1130 + q * 700, x = -700 + r() * 2500; c.fillStyle = `rgba(255,${180 + r() * 50 | 0},110,${0.3 + 0.5 * r()})`; c.fillRect(x, y, 2 + q * 4, 2 + q * 4); }
  ridgeW(c, 1300, 70, 0.004, 64, '#0e1222');
  const g = c.createLinearGradient(0, 1500, 0, H + 300); g.addColorStop(0, '#16141c'); g.addColorStop(1, '#060508'); c.fillStyle = g; c.beginPath(); c.moveTo(-500, H + 300); for (let x = -500; x <= W + 500; x += 20) c.lineTo(x, ridgeY(x, 1580, 60, 0.004, 65)); c.lineTo(W + 500, H + 300); c.fill();
  darkWisp(c, t, k, [[-300, 900], [200, 1050], [600, 980], [1000, 1150], [1400, 1050]], { s: 2.4, wob: 2, a: 0.9 });
}
function walkers(c, t, gy, dist, n, h, o = {}) { // the children of Adam: a long line of small faceless figures crossing the land
  for (let i = 0; i < n; i++) { const x = -200 + i * 150 + dist + (i % 2) * 30, hh = h * (0.9 + (i % 3) * 0.08), who = Object.assign({}, FOLK[i % FOLK.length], i % 4 === 2 ? { child: true } : {});
    fig(c, who, { x, y: gy(x), h: hh, dir: 1, walk: stepOf(dist, hh) + i * 0.37, light: o.light || 0.45, t: t + i, wind: 0.3, ink: 0.6 }); }
}

// =====================================================================================================================
// ---------- episode 15: Shu'ayb and the people of Madyan
const SHU = { veilGlow: 0.5, prophet: true, robe: '#ece6d8', wrap: '#f7f3ea', skin: '#c49470', trim: '#cfae6a', band: '#b8954a', inner: '#fbf8f0' };
const NOTABLES = [
  { robe: '#6a1e2a', wrap: '#ece0c6', skin: '#a8714f', trim: '#e0b85a', band: '#e0b85a', inner: '#efe4cc' },
  { robe: '#2a2a52', wrap: '#e6dcc4', skin: '#94664a', trim: '#d8b45a', band: '#c9a040', inner: '#ece2cc' },
  { robe: '#4a2a4e', wrap: '#efe6d0', skin: '#b07a58', trim: '#e0b85a', band: '#b8954a', inner: '#f0e6d2' },
  { robe: '#1e4038', wrap: '#e2d6bc', skin: '#8f5f42', trim: '#d0a850', band: '#c9a040', inner: '#e8dcc6' },
];
const MERCH = { robe: '#7a4a26', wrap: '#e2d2b0', skin: '#a8714f', trim: '#c9a35a', band: '#8a5a2a', inner: '#e6dac2' };
const BELIEVE = [FOLK[1], FOLK[3], FOLK[7], FOLK[0], FOLK[6], FOLK[4]];
const RED = '#a4553c', REDK = '#6a2e22', PLAZA = '#c9a271', BRONZE = '#b8863a';
const SKYC = { day: [[0, '#5f8fc0'], [0.28, '#a8c4da'], [0.47, '#f0dfc0']], heat: [[0, '#c8844a'], [0.28, '#eab47a'], [0.47, '#f8d8a4']],
  dusk: [[0, '#2a2a52'], [0.25, '#8a5a6a'], [0.47, '#f2a070']], dawn: [[0, '#3a4a78'], [0.28, '#c0a0a8'], [0.47, '#ffd8a8']],
  storm: [[0, '#1a1a24'], [0.3, '#3a3438'], [0.47, '#7a6a5a']] };
function skyMix(a, b, k) { return SKYC[a].map((s, i) => [s[0], mix(s[1], SKYC[b][i][1], k)]); }

// 1) shots: quick cuts with a short cross-dissolve (a new picture every 2-3 s). list = [[t0, fn(c, q)], ...] sorted by t0
function shots(c, t, list, xf = 0.35) {
  let i = 0; while (i + 1 < list.length && t >= list[i + 1][0]) i++;
  const run = (k, cc) => { cc.save(); list[k][1](cc, t - list[k][0]); cc.restore(); cc.setTransform(1, 0, 0, 1, 0, 0); };
  const f = i > 0 ? seg(t, list[i][0], list[i][0] + xf) : 1;
  if (f < 1 && i > 0) run(i - 1, c);
  if (f >= 1) run(i, c); else layer(c, ease(f), cc => run(i, cc));
}

// 2) the town of Madyan: red mountains, the thick grove (al-Ayka), mud-brick houses, the beaten-earth square
function midianSky(c, o = {}) {
  let st = SKYC.day;
  if (o.heat) st = skyMix('day', 'heat', o.heat);
  if (o.dusk) st = st.map((s, i) => [s[0], mix(s[1], SKYC.dusk[i][1], o.dusk)]);
  if (o.dawn) st = st.map((s, i) => [s[0], mix(s[1], SKYC.dawn[i][1], o.dawn)]);
  if (o.storm) st = st.map((s, i) => [s[0], mix(s[1], SKYC.storm[i][1], o.storm)]);
  sky0(c, st);
}
function grove(c, t, x0, x1, y, s, o = {}) { // al-Ayka: a dense thicket of trees and palms behind the town
  const dry = o.dry || 0, r = rng(o.seed || 17), n = Math.round((x1 - x0) / (70 * s));
  for (let i = 0; i < n; i++) { const x = x0 + i * 70 * s + r() * 30 * s, yy = y + r() * 16 * s, k = r();
    if (k < 0.35) datePalm(c, x, yy, s * (0.75 + r() * 0.35), mix('#4a6a2a', '#8a7a4a', dry), t, i + 3);
    else { const R = (60 + r() * 50) * s, g1 = mix(k > 0.7 ? '#3e5a2a' : '#4e6a30', '#8a7a48', dry), g2 = mix(g1, '#0a1206', 0.45);
      c.fillStyle = mix('#3a2a1a', '#000000', 0.2); c.fillRect(x - 6 * s, yy - R * 0.9, 12 * s, R * 0.9);
      for (let j = 0; j < 5; j++) { const bx = x + (j - 2) * R * 0.32 + Math.sin(t * 0.7 + i + j) * 2 * s, by = yy - R * (1.05 + (j % 2) * 0.25);
        c.fillStyle = j % 2 ? g2 : g1; c.beginPath(); c.ellipse(bx, by, R * 0.55, R * 0.45, 0, 0, 6.283); c.fill(); }
      c.fillStyle = hexA(mix(g1, '#fff0b0', 0.35), 0.5); c.beginPath(); c.ellipse(x - R * 0.2, yy - R * 1.45, R * 0.4, R * 0.22, 0, 0, 6.283); c.fill(); }
  }
}
const HOUSES = [[-620, 300, 230], [-330, 250, 200], [-80, 290, 250], [200, 230, 190], [440, 300, 240], [720, 250, 210], [980, 310, 250], [1260, 260, 205], [1520, 300, 240], [1790, 260, 210]];
function madyan(c, t, o = {}) {
  const fy = o.fy || 1250, px = o.px || 0, heat = o.heat || 0, dry = o.dry || 0, dusk = o.dusk || 0, empty = o.empty || 0;
  midianSky(c, o);
  if (o.sun !== false) { const sx = o.sunX === undefined ? 880 : o.sunX, sy = o.sunY === undefined ? 520 : o.sunY;
    c.save(); c.globalCompositeOperation = 'lighter'; glow(c, sx, sy, 340 + 160 * heat, '#fff2c8', (0.3 + 0.12 * heat) * (o.sunA === undefined ? 1 : o.sunA)); c.restore();
    sun(c, sx, sy, 46 + 10 * heat, mix('#ffe9b0', '#fffbea', heat), (o.sunA === undefined ? 1 : o.sunA) * (1 - 0.6 * dusk)); }
  if (o.stars) stars(c, t, 90, 9, [-600, -400, W + 1200, 900], o.stars);
  if (o.behind) o.behind(c);
  wisps(c, t, 640, 5, '#fff4e0', 0.12 * (1 - (o.storm || 0)), 4, 4);
  par(c, 0.12, px, 0, () => { crags(c, fy - 300, 240, 41, mix(mix('#b07a6a', '#8a7a8a', 0.5), '#5a4a5a', dusk), { detail: false, light: 0.7 }); hazeWide(c, fy - 270, 240, mix('#f4dcc0', '#e0a080', dusk), 0.55 + 0.2 * heat); });
  par(c, 0.3, px, 0, () => { crags(c, fy - 150, 300, 43, mix(RED, '#4a2a2a', dusk * 0.6), { rim: 'rgba(255,220,180,0.4)', gullies: 40, blocks: 50, litCol: '#ffd8b0' }); hazeWide(c, fy - 120, 200, mix('#f4dcc0', '#e0a080', dusk), 0.4 + 0.25 * heat); });
  par(c, 0.55, px, 0, () => { grove(c, t, -1400, 2500, fy - 36, 0.95, { dry, seed: 17 }); hazeWide(c, fy - 30, 90, mix('#f4dcc0', '#d09070', dusk), 0.25 + 0.3 * heat); });
  par(c, 0.8, px, 0, () => {
    HOUSES.forEach(([x, w, h], i) => house(c, x, fy + 6, w, h, mix(mix('#c8a47a', '#b08a64', (i % 3) * 0.3), '#6a4a3a', dusk * 0.6),
      { lamp: (o.lamp || 0) * (i % 2 ? 1 : 0.5) * (1 - empty), t: t + 100 + i, doorOpen: empty > 0.5 || i % 3 === 1, smoke: (o.smoke || 0) * (i === 4 ? 1 : 0) }));
    if (o.wall !== false) { c.fillStyle = mix('#b8946a', '#5a3a2a', dusk * 0.6); c.fillRect(-1400, fy - 40, 700, 46); c.fillRect(1950, fy - 40, 700, 46); }
  });
  sandW(c, fy + 4, mix(mix(PLAZA, '#e0c08a', heat * 0.6), '#7a5a46', dusk * 0.6), 5, { pebbles: 90 });
  if (heat > 0) heatShimmer(c, t, fy + 10, 0.5 * heat);
  if (o.storm) { c.fillStyle = `rgba(14,16,30,${0.32 * o.storm})`; c.fillRect(-2600, fy - 700, W + 5200, H + 2600); }
}
function heatShimmer(c, t, y, a) { t += 100; if (a <= 0) return; // wavering hot air above the ground
  c.save(); c.globalCompositeOperation = 'lighter'; c.lineWidth = 3;
  for (let i = 0; i < 18; i++) { const yy = y - 20 - i * 26, al = a * 0.12 * (1 - i / 18);
    c.strokeStyle = `rgba(255,244,220,${al})`; c.beginPath();
    for (let x = -600; x <= W + 600; x += 30) { const v = yy + Math.sin(x * 0.02 + t * 3 + i) * 4 + Math.sin(x * 0.007 - t * 2 + i * 2) * 3; x === -600 ? c.moveTo(x, v) : c.lineTo(x, v); }
    c.stroke(); }
  c.restore();
}
function well(c, x, y, s, t) { // the stone well of Madyan with a wooden frame and a rope
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(10, 4, 130, 22, 0, 0, 6.283); c.fill();
  const g = c.createLinearGradient(-110, 0, 110, 0); g.addColorStop(0, '#d8c0a0'); g.addColorStop(0.6, '#a88a68'); g.addColorStop(1, '#5a4430');
  c.fillStyle = g; c.beginPath(); c.moveTo(-110, -90); c.lineTo(-110, 0); c.quadraticCurveTo(0, 26, 110, 0); c.lineTo(110, -90); c.quadraticCurveTo(0, -66, -110, -90); c.fill();
  c.strokeStyle = 'rgba(40,24,12,0.35)'; c.lineWidth = 2;
  for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(-110, -90 + k * 22); c.quadraticCurveTo(0, -66 + k * 26, 110, -90 + k * 22); c.stroke(); }
  for (let k = 0; k < 8; k++) { const xx = -96 + k * 27 + (k % 2) * 8; c.beginPath(); c.moveTo(xx, -84 + Math.abs(xx) * 0.05); c.lineTo(xx, -62 + Math.abs(xx) * 0.07); c.stroke(); }
  c.fillStyle = '#e8d6b8'; c.beginPath(); c.ellipse(0, -90, 110, 24, 0, 0, 6.283); c.fill();
  c.fillStyle = '#1a120c'; c.beginPath(); c.ellipse(0, -90, 86, 16, 0, 0, 6.283); c.fill();
  c.strokeStyle = '#4a3020'; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(-96, -96); c.lineTo(-70, -250); c.moveTo(96, -96); c.lineTo(70, -250); c.stroke();
  c.lineWidth = 12; c.beginPath(); c.moveTo(-90, -248); c.lineTo(90, -248); c.stroke();
  c.strokeStyle = '#8a6a44'; c.lineWidth = 3; c.beginPath(); c.moveTo(6, -248); c.lineTo(6 + Math.sin(t * 0.8) * 3, -130); c.stroke();
  c.fillStyle = '#5a3a22'; c.beginPath(); c.roundRect(-10 + Math.sin(t * 0.8) * 3, -132, 32, 26, 5); c.fill();
  c.restore();
}

// 3) market: stalls with striped awnings, sacks of grain, jars, dates, the balance
function sack(c, x, y, s, col = '#c8b08a', grain = '#d8b25a') {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.25)'; c.beginPath(); c.ellipse(4, 2, 40, 7, 0, 0, 6.283); c.fill();
  const g = c.createLinearGradient(-36, 0, 36, 0); g.addColorStop(0, mix(col, '#ffffff', 0.15)); g.addColorStop(1, mix(col, '#000000', 0.35));
  c.fillStyle = g; c.beginPath(); c.moveTo(-34, 0); c.quadraticCurveTo(-44, -40, -28, -64); c.lineTo(28, -64); c.quadraticCurveTo(44, -40, 34, 0); c.closePath(); c.fill();
  c.fillStyle = mix(col, '#000000', 0.3); c.beginPath(); c.ellipse(0, -64, 30, 9, 0, 0, 6.283); c.fill();
  c.fillStyle = grain; c.beginPath(); c.ellipse(0, -66, 26, 9, 0, Math.PI, 0); c.fill();
  c.strokeStyle = 'rgba(40,24,12,0.3)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-20, -56); c.quadraticCurveTo(-24, -30, -18, -6); c.moveTo(14, -56); c.quadraticCurveTo(18, -30, 16, -6); c.stroke();
  c.restore();
}
function jar(c, x, y, s, col = '#a8603a') {
  c.save(); c.translate(x, y); c.scale(s, s);
  const g = c.createLinearGradient(-30, 0, 30, 0); g.addColorStop(0, mix(col, '#ffe0c0', 0.3)); g.addColorStop(1, mix(col, '#000000', 0.4));
  c.fillStyle = g; c.beginPath(); c.moveTo(-12, -86); c.quadraticCurveTo(-40, -60, -26, -10); c.quadraticCurveTo(0, 4, 26, -10); c.quadraticCurveTo(40, -60, 12, -86); c.closePath(); c.fill();
  c.fillStyle = mix(col, '#000000', 0.2); c.fillRect(-14, -94, 28, 10);
  c.strokeStyle = hexA(mix(col, '#000000', 0.5), 0.5); c.lineWidth = 2; c.beginPath(); c.moveTo(-28, -50); c.quadraticCurveTo(0, -42, 28, -50); c.stroke();
  c.restore();
}
function datesBasket(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#8a6a3a'; c.beginPath(); c.moveTo(-40, -30); c.lineTo(40, -30); c.lineTo(30, 0); c.lineTo(-30, 0); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(40,24,12,0.4)'; c.lineWidth = 2; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(-40 + k * 2.5, -30 + k * 7.5); c.lineTo(40 - k * 2.5, -30 + k * 7.5); c.stroke(); }
  const r = rng(5); for (let k = 0; k < 16; k++) { c.fillStyle = mix('#5a1e0a', '#a0501e', r()); c.beginPath(); c.ellipse(-30 + r() * 60, -32 - r() * 12, 6, 4, r() * 3, 0, 6.283); c.fill(); }
  c.restore();
}
function balance(c, x, y, s, tilt, o = {}) { // a standing bronze balance (mizan): base on the ground at (x, y)
  c.save(); c.translate(x, y); c.scale(s, s);
  const br = o.col || BRONZE, lt = mix(br, '#fff4d0', 0.45), dk = mix(br, '#1a0c04', 0.5);
  if (o.glow) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -240, 420, '#ffd890', 0.35 * o.glow); c.restore(); }
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(0, 4, 110, 14, 0, 0, 6.283); c.fill();
  c.fillStyle = dk; c.beginPath(); c.ellipse(0, -6, 80, 16, 0, 0, 6.283); c.fill();
  const gp = c.createLinearGradient(-10, 0, 10, 0); gp.addColorStop(0, lt); gp.addColorStop(1, dk);
  c.fillStyle = gp; c.fillRect(-8, -330, 16, 326);
  c.fillStyle = br; c.beginPath(); c.arc(0, -334, 14, 0, 6.283); c.fill();
  const L = 190; c.save(); c.translate(0, -334); c.rotate(tilt);
  c.fillStyle = gp; c.beginPath(); c.moveTo(-L, -5); c.lineTo(L, -5); c.lineTo(L, 5); c.lineTo(-L, 5); c.closePath(); c.fill();
  c.fillStyle = lt; c.beginPath(); c.moveTo(-8, -6); c.lineTo(0, -40); c.lineTo(8, -6); c.closePath(); c.fill(); // pointer
  c.restore();
  [-1, 1].forEach(sd => { // chains and pans (they hang straight down from the beam ends)
    const ex = sd * L * Math.cos(tilt), ey = -334 + sd * L * Math.sin(tilt), py = ey + 170;
    c.strokeStyle = mix(br, '#000000', 0.3); c.lineWidth = 2.5; c.beginPath();
    c.moveTo(ex, ey); c.lineTo(ex - 52, py - 6); c.moveTo(ex, ey); c.lineTo(ex + 52, py - 6); c.moveTo(ex, ey); c.lineTo(ex, py - 10); c.stroke();
    const g = c.createLinearGradient(0, py - 10, 0, py + 22); g.addColorStop(0, lt); g.addColorStop(1, dk);
    c.fillStyle = g; c.beginPath(); c.moveTo(ex - 62, py - 6); c.quadraticCurveTo(ex, py + 40, ex + 62, py - 6); c.closePath(); c.fill();
    c.fillStyle = mix(br, '#000000', 0.15); c.beginPath(); c.ellipse(ex, py - 6, 62, 9, 0, 0, 6.283); c.fill();
    if (sd < 0 && o.grain) { c.fillStyle = '#d8b25a'; c.beginPath(); c.ellipse(ex, py - 9, 50 * Math.min(1, o.grain), 8, 0, Math.PI, 0); c.quadraticCurveTo(ex, py - 9 - 38 * o.grain, ex - 50 * Math.min(1, o.grain), py - 9); c.fill();
      const r = rng(3); c.fillStyle = 'rgba(120,80,20,0.35)'; for (let k = 0; k < 20; k++) c.fillRect(ex - 34 + r() * 68, py - 12 - r() * 26 * o.grain, 2, 2); }
    if (sd > 0 && o.weights) for (let k = 0; k < o.weights; k++) { const wx = ex - 26 + k * 26; c.fillStyle = mix('#7a6a5a', '#3a2a1a', k * 0.2); c.beginPath(); c.roundRect(wx - 10, py - 30 - (k === 1 ? 6 : 0), 20, 24 + (k === 1 ? 6 : 0), 4); c.fill();
      c.fillStyle = 'rgba(255,240,210,0.25)'; c.fillRect(wx - 9, py - 29 - (k === 1 ? 6 : 0), 18, 3); }
    if (sd > 0 && o.gram) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, ex, py - 20, 70, '#ffe2a0', 0.8 * o.gram); c.restore();
      c.fillStyle = mix('#c8a050', '#fff4d0', 0.3 * o.gram); c.beginPath(); c.roundRect(ex - 7, py - 24, 14, 16, 3); c.fill(); }
  });
  c.restore();
}
// pan end world position (for hands pressing / effects): same maths as balance()
function panOf(x, y, s, tilt, sd) { const L = 190, ex = sd * L * Math.cos(tilt), ey = -334 + sd * L * Math.sin(tilt) + 170; return [x + ex * s, y + ey * s]; }
function arm(c, x0, y0, x1, y1, s, col, skin, ang, open = false) { // a sleeve coming into the frame with a big hand at its end (close-ups)
  limb(c, [x0, y0], [lerp(x0, x1, 0.55), lerp(y0, y1, 0.45) - 20 * s], [x1, y1], 90 * s, 64 * s, col);
  c.fillStyle = mix(col, '#000000', 0.3); c.beginPath(); c.ellipse(x1, y1, 30 * s, 18 * s, ang + 1.57, 0, 6.283); c.fill();
  hand(c, x1, y1, ang, skin, 3.4 * s, open);
}
function measureBox(c, x, y, s, fill, o = {}) { // the wooden measure (mikyal) with a heap of grain; fill 1 = full, > 1 heaped
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(0, 6, 150, 20, 0, 0, 6.283); c.fill();
  const g = c.createLinearGradient(-130, 0, 130, 0); g.addColorStop(0, '#b07a4a'); g.addColorStop(0.6, '#8a5a32'); g.addColorStop(1, '#4a2a16');
  c.fillStyle = g; c.beginPath(); c.moveTo(-130, -200); c.lineTo(-120, 0); c.quadraticCurveTo(0, 24, 120, 0); c.lineTo(130, -200); c.closePath(); c.fill();
  c.strokeStyle = '#3a2010'; c.lineWidth = 8; [-150, -60].forEach(yy => { c.beginPath(); c.moveTo(-128, yy); c.quadraticCurveTo(0, yy + 22, 128, yy); c.stroke(); });
  c.fillStyle = '#6a4224'; c.beginPath(); c.ellipse(0, -200, 130, 26, 0, 0, 6.283); c.fill();
  const lvl = -200 + (1 - Math.min(1, fill)) * 140; // grain level inside
  c.save(); c.beginPath(); c.ellipse(0, -200, 120, 22, 0, 0, 6.283); c.clip();
  c.fillStyle = '#2a160a'; c.fillRect(-130, -230, 260, 60);
  c.fillStyle = '#d8b25a'; c.beginPath(); c.ellipse(0, lvl + (fill < 1 ? 0 : 0), 120, 22, 0, 0, 6.283); c.fill(); c.restore();
  if (fill > 1) { const hh = (fill - 1) * 160; c.fillStyle = '#d8b25a'; c.beginPath(); c.moveTo(-120, -200); c.quadraticCurveTo(0, -200 - hh * 2, 120, -200); c.quadraticCurveTo(0, -180, -120, -200); c.fill();
    const r = rng(9); c.fillStyle = 'rgba(130,90,30,0.4)'; for (let k = 0; k < 40; k++) { const gx = -100 + r() * 200; c.fillRect(gx, -200 - r() * hh * (1 - Math.abs(gx) / 120), 3, 3); } }
  if (o.pour) { const r = rng(4); c.fillStyle = '#e0bc66'; for (let k = 0; k < 60; k++) { const ph = ((o.t || 0) * 1.6 + r()) % 1; c.fillRect(-14 + r() * 28, -560 + ph * (360 - (fill - 1) * 100), 3, 6); } }
  c.restore();
}
function stall(c, x, y, w, s, t, o = {}) { // a market stall: two posts, striped awning, a counter with goods
  const cloth = o.cloth || '#8a2a22', cloth2 = o.cloth2 || '#e8d6b0', h = 300 * s, torn = o.torn || 0;
  c.fillStyle = 'rgba(10,6,4,0.25)'; c.beginPath(); c.ellipse(x, y + 4, w * 0.6, 16 * s, 0, 0, 6.283); c.fill();
  c.strokeStyle = '#4a3020'; c.lineWidth = 10 * s; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x - w / 2, y - h); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y - h * (1 - 0.25 * torn)); c.stroke();
  // awning: stripes, sag and flutter
  const n = 8, fl = k => Math.sin(t * 3 + k * 0.8 + x * 0.01) * 6 * s * (1 + 2 * torn);
  for (let k = 0; k < n; k++) { const xa = x - w / 2 - 20 * s + (w + 40 * s) * k / n, xb = x - w / 2 - 20 * s + (w + 40 * s) * (k + 1) / n;
    if (torn > 0.5 && k > 4) continue;
    const ya = y - h - 10 * s + Math.sin(k / n * Math.PI) * 26 * s, yb = y - h - 10 * s + Math.sin((k + 1) / n * Math.PI) * 26 * s;
    c.fillStyle = k % 2 ? cloth : cloth2; c.beginPath(); c.moveTo(xa, ya); c.lineTo(xb, yb); c.lineTo(xb, yb + 50 * s + fl(k + 1)); c.lineTo(xa, ya + 50 * s + fl(k)); c.closePath(); c.fill(); }
  c.fillStyle = 'rgba(10,6,4,0.18)'; c.fillRect(x - w / 2 - 20 * s, y - h + 40 * s, w + 40 * s, 14 * s);
  // counter
  const cy = y - 120 * s; c.fillStyle = '#6a4428'; c.fillRect(x - w / 2 + 10 * s, cy, w - 20 * s, 18 * s); c.fillStyle = '#4a2e1a'; c.fillRect(x - w / 2 + 16 * s, cy + 18 * s, w - 32 * s, 102 * s);
  c.strokeStyle = 'rgba(20,10,4,0.35)'; c.lineWidth = 2; for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(x - w / 2 + 16 * s, cy + 18 * s + k * 20 * s); c.lineTo(x + w / 2 - 16 * s, cy + 18 * s + k * 20 * s); c.stroke(); }
  if (o.goods !== false && !o.emptied) { sack(c, x - w * 0.32, cy + 2, 0.75 * s); jar(c, x + w * 0.3, cy + 2, 0.7 * s, o.jar || '#a8603a'); datesBasket(c, x + w * 0.05, cy + 2, 0.75 * s); }
  if (o.scale !== undefined) balance(c, x - w * 0.05, cy + 2, 0.28 * s, o.scale, { weights: 2, grain: 0.6 });
  sack(c, x - w / 2 - 30 * s, y, 1.0 * s, '#b8a07a'); sack(c, x - w / 2 + 50 * s, y + 6 * s, 0.9 * s, '#c8b28a', '#c8a050');
}
function coins(c, x, y, s, n, t, k = 1) { const r = rng(n); for (let i = 0; i < n; i++) { const cx = x + (r() - 0.5) * 60 * s, cy = y - i * 4 * s * k;
  c.fillStyle = mix('#b8862a', '#ffe08a', r() * 0.6); c.beginPath(); c.ellipse(cx, cy, 14 * s, 5 * s, 0, 0, 6.283); c.fill(); c.fillStyle = 'rgba(80,50,10,0.5)'; c.fillRect(cx - 14 * s, cy, 28 * s, 2 * s); } }

// 4) the cloud of the Day of the Shadow (Ash-Shu'ara 189): a huge dark cloud, lit edges, flickers inside; and its shade on the ground
function bigCloud(c, t, cx, cy, s, a, o = {}) { t += 100; if (a <= 0) return; // cumulonimbus: puffy cauliflower top lit by the sun, flat dark base
  const r = rng(o.seed || 7), puffs = [], dark = o.dark === undefined ? 0.5 : o.dark, lx = o.lightX === undefined ? 1 : o.lightX;
  for (let i = 0; i < 130; i++) { const u = r() * 2 - 1, env = Math.pow(1 - u * u, 0.55), f = Math.pow(r(), 0.8);
    puffs.push([cx + u * 720 * s, cy - f * env * 380 * s, (45 + r() * 80) * s * (0.55 + 0.45 * env), f]); }
  puffs.sort((p, q) => p[1] - q[1]);
  const body = mix('#7a7080', '#2a2432', dark), base = mix('#4a4252', '#110e16', dark), lit = mix('#e8dcd0', '#8a7e88', dark);
  c.save(); c.globalAlpha *= a;
  blurLayer(c, 11 * s, cc => {
    if (o.column) { const g = cc.createLinearGradient(0, cy + 40 * s, 0, cy + 1200 * s); g.addColorStop(0, `rgba(12,14,28,${0.35 * o.column})`); g.addColorStop(1, 'rgba(12,14,28,0)');
      cc.fillStyle = g; cc.beginPath(); cc.moveTo(cx - 640 * s, cy + 40 * s); cc.lineTo(cx + 640 * s, cy + 40 * s); cc.lineTo(cx + 800 * s, cy + 1200 * s); cc.lineTo(cx - 800 * s, cy + 1200 * s); cc.closePath(); cc.fill(); }
    puffs.forEach(([x, y, R, f], i) => { const xx = x + Math.sin(t * 0.15 + i) * 5 * s;
      const g = cc.createRadialGradient(xx + lx * R * 0.35, y - R * 0.4, R * 0.1, xx, y, R * 1.05);
      g.addColorStop(0, mix(body, lit, 0.3 + 0.45 * f)); g.addColorStop(0.7, mix(body, base, 0.25 * (1 - f))); g.addColorStop(1, mix(body, base, 0.3 * (1 - f)));
      cc.fillStyle = g; cc.beginPath(); cc.arc(xx, y, R, 0, 6.283); cc.fill(); });
    const gb = cc.createLinearGradient(0, cy - 60 * s, 0, cy + 70 * s); gb.addColorStop(0, hexA(base, 0)); gb.addColorStop(0.5, base); gb.addColorStop(1, mix(base, '#000000', 0.3));
    cc.fillStyle = gb; cc.beginPath(); cc.moveTo(cx - 760 * s, cy - 40 * s); cc.quadraticCurveTo(cx, cy - 90 * s, cx + 760 * s, cy - 40 * s);
    cc.quadraticCurveTo(cx + 800 * s, cy + 40 * s, cx + 680 * s, cy + 56 * s); cc.quadraticCurveTo(cx, cy + 80 * s, cx - 680 * s, cy + 56 * s); cc.quadraticCurveTo(cx - 800 * s, cy + 40 * s, cx - 760 * s, cy - 40 * s); cc.fill();
  }, 3);
  c.globalCompositeOperation = 'lighter';
  if (o.rimLight) puffs.forEach(([x, y, R, f], i) => { if (f < 0.55 || i % 2) return; c.strokeStyle = `rgba(255,232,196,${0.07 * o.rimLight * (1 - dark * 0.6)})`; c.lineWidth = 8 * s;
    c.beginPath(); c.arc(x, y, R * 0.96, lx > 0 ? -1.6 : -2.6, lx > 0 ? -0.4 : -1.4); c.stroke(); });
  if (o.flash > 0) { const r2 = rng(Math.floor(t * 6));
    for (let k = 0; k < 3; k++) { const fx = cx + (r2() - 0.5) * 1000 * s, fy = cy - r2() * 200 * s; glow(c, fx, fy, 320 * s, '#ffe8d0', 0.5 * o.flash * Math.max(0, Math.sin(t * 23 + k * 2.1))); } }
  c.restore();
}
function cloudShade(c, cx, cy, rx, ry, a) { if (a <= 0) return; // the cool shade of the cloud on the ground
  c.save(); c.translate(cx, cy); c.scale(1, ry / rx);
  const g = c.createRadialGradient(0, 0, rx * 0.3, 0, 0, rx); g.addColorStop(0, `rgba(18,24,44,${0.5 * a})`); g.addColorStop(0.75, `rgba(18,24,44,${0.38 * a})`); g.addColorStop(1, 'rgba(18,24,44,0)');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, rx, 0, 6.283); c.fill(); c.restore();
}
function sideShade(c, x1, a) { if (a <= 0) return; const g = c.createLinearGradient(-800, 0, x1, 0); g.addColorStop(0, `rgba(16,20,38,${0.55 * a})`); g.addColorStop(0.6, `rgba(16,20,38,${0.35 * a})`); g.addColorStop(1, 'rgba(16,20,38,0)');
  c.fillStyle = g; c.fillRect(-1600, -1000, x1 + 1600, H + 2000); }
function cryRing(c, x, y, t, t0, a = 1) { // the Cry (as-Sayha): rings of a single blast spreading out (sound only, no form)
  if (a <= 0 || t < t0) return; c.save(); c.globalCompositeOperation = 'lighter'; c.filter = 'blur(6px)';
  for (let k = 0; k < 4; k++) { const q = (t - t0) * 0.9 - k * 0.18; if (q <= 0 || q > 1) continue;
    c.strokeStyle = `rgba(255,244,226,${0.32 * a * (1 - q)})`; c.lineWidth = 30 * (1 - q) + 6; c.beginPath(); c.ellipse(x, y, q * 1400, q * 600, 0, 0, 6.283); c.stroke(); }
  c.restore();
}
function dustBurst(c, t, x0, x1, y, k, seed = 5) { if (k <= 0) return; t += 100; const r = rng(seed); // dust shaken from the ground (the trembling)
  for (let i = 0; i < 40; i++) { const x = x0 + r() * (x1 - x0), R = (60 + r() * 120) * k, yy = y - r() * 80 * k - (t * 20 * r()) % 30;
    const g = c.createRadialGradient(x, yy, 0, x, yy, R); g.addColorStop(0, `rgba(190,150,110,${0.4 * k})`); g.addColorStop(1, 'rgba(190,150,110,0)'); c.fillStyle = g; c.fillRect(x - R, yy - R, R * 2, R * 2); }
}

// 5) the hero shot (hook / cta / outro / cover): the square of Madyan in a crushing heat, the dark cloud coming in from the left,
//    the people running to its shade from the sunny side. T is continuous: outro (T <= 0) runs straight into the hook (T >= 0).
const RUN = [ // [x at T=0, ground y, folk, speed px/s, where they stop in the shade]
  [690, 1420, 0, 70, 360], [820, 1380, 2, 62, 470], [930, 1500, 5, 80, 520], [1040, 1350, 7, 58, 600],
  [610, 1600, 1, 74, 250], [1140, 1460, 4, 86, 660], [1240, 1560, 8, 76, 720], [870, 1700, 3, 82, 420], [1110, 1640, 6, 72, 560],
];
const SHADE_STAND = [[140, 1420, 1, 4], [250, 1520, 1, 6], [70, 1600, 1, 2], [330, 1380, -1, 8]];
const hAt = y => 300 * (y - 1150) / 360; // figure height for a foot line y (perspective of the square)
const hH = y => 0.82 * hAt(y);
function shuHero(c, T, o = {}) {
  const kz = o.kz || 0, [sx, sy] = o.shake ? shake(T, o.shake, 16) : [0, 0];
  cam(c, lerp(1.0, 1.1, kz) + 0.005 * Math.sin(T * 0.25), lerp(540, 500, kz) + 5 * Math.sin(T * 0.2), lerp(1130, 1200, kz), sx, sy);
  const dk = o.dark || 0;
  madyan(c, T, { heat: 1, dry: 0.4, sunX: 900, sunY: 470, storm: 0.15 + 0.4 * dk, sunA: 1 - 0.3 * dk, px: 0,
    behind: cc => bigCloud(cc, T, 230 + T * 5, 760, 1.05, 1, { dark: 0.45 + 0.4 * dk, flash: o.flash || 0, rimLight: 1, column: 0.6 }) });
  well(c, 800, 1330, 0.5, T);
  sideShade(c, 820, 0.75);
  cloudShade(c, 330, 1480, 560, 220, 1);
  const peeps = [];
  RUN.forEach(([x0, y, k, v, stop], i) => { const x = Math.max(stop, x0 - v * T), dist = x0 - x, h = hH(y), moving = x > stop + 1;
    peeps.push([y, () => lean(c, x, y, moving ? -0.08 : 0, () => fig(c, FOLK[k], { x, y, h, dir: -1, walk: moving ? stepOf(dist, h) + i * 0.31 : null, light: x > 640 ? 1.0 : 0.6, t: T + i, wind: 0.35, ink: 0.8,
      armUp: !moving && i % 3 === 0 ? 0.3 * (o.look || 0) : 0 }))]); });
  SHADE_STAND.forEach(([x, y, d, k], i) => { const h = hH(y);
    peeps.push([y, () => fig(c, FOLK[k], { x, y, h, dir: d, light: 0.55, t: T + i * 2, wind: 0.3, ink: 0.8, child: i === 2, armUp: i === 1 ? 0.35 * (o.look || 0) : 0 })]); });
  peeps.sort((a, b) => a[0] - b[0]).forEach(p => p[1]());
  blurLayer(c, 8, cc => { jar(cc, 1010, 1990, 2.2, '#8a4a2a'); sack(cc, 60, 2000, 2.6, '#a8906a'); }, 2);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
function fgBrush(c, t, o = {}) { // blurred foreground: dry grass tufts and a low stone at the bottom corners (depth, no dark blobs)
  const col = o.col || '#7a6a3a';
  [[-40, 2010, 4.2, 1], [90, 2060, 3.4, 2], [1120, 2020, 4.0, 3], [990, 2070, 3.0, 4]].forEach(([x, y, k, sd]) => shrub(c, x, y, k, col, t, sd));
  boulder(c, 40, 2080, 300, 120, o.stone || '#8a6a4a', 5); boulder(c, 1060, 2090, 260, 100, o.stone || '#8a6a4a', 6);
}
function seriesTag15(c, a) { seriesTag(c, a, 15); }
function bigWord(c, txt, y, a, size = 96, col = '#fff6e0') { textGlow(c, txt, W / 2, y, `700 ${size}px Lora`, col, a, '#000', 22); }
function stele(c, x, y, s, col = '#6a5a52') { // the old standing stones "their fathers worshipped" (bare blocks, no form)
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(x, y + 3, 50 * s, 9 * s, 0, 0, 6.283); c.fill();
  const g = c.createLinearGradient(x - 40 * s, 0, x + 40 * s, 0); g.addColorStop(0, mix(col, '#ffe0c0', 0.25)); g.addColorStop(1, mix(col, '#000000', 0.45));
  c.fillStyle = g; c.beginPath(); c.moveTo(x - 36 * s, y); c.lineTo(x - 30 * s, y - 170 * s); c.quadraticCurveTo(x, y - 196 * s, x + 30 * s, y - 170 * s); c.lineTo(x + 36 * s, y); c.closePath(); c.fill();
}
function majlis(c, t, o = {}) { // the notables' courtyard: a carved wall with arches, hanging lamps, rugs and cushions
  const fy = o.fy || 1380, dusk = o.dusk || 0;
  sky0(c, skyMix('day', 'dusk', 0.55 + 0.45 * dusk));
  ashlar(c, -600, 300, W + 600, fy, mix('#c8a47a', '#7a5a46', dusk * 0.5), 15);
  for (let i = -1; i < 4; i++) { const ax = 140 + i * 300; c.fillStyle = mix('#3a2418', '#1a0e08', dusk); c.beginPath(); archPath(c, ax, fy - 40, 190, 420); c.fill();
    c.fillStyle = hexA('#ffb870', 0.12 + 0.2 * dusk); c.beginPath(); archPath(c, ax, fy - 40, 150, 360); c.fill();
    c.strokeStyle = '#e0c08a'; c.lineWidth = 6; c.beginPath(); archPath(c, ax, fy - 40, 200, 430); c.stroke(); }
  if (o.lamps !== false) for (let i = 0; i < 4; i++) { const lx = 290 + i * 300; c.strokeStyle = '#2a1a10'; c.lineWidth = 2; c.beginPath(); c.moveTo(lx, 700); c.lineTo(lx, 900); c.stroke(); lanternBox(c, lx, 930, 1.1, t, i); }
  c.fillStyle = mix('#a88a64', '#5a4030', dusk * 0.5); c.fillRect(-600, fy - 40, W + 1200, 60);
  flagFloor(c, fy + 20, 540, mix('#b89a72', '#6a5040', dusk * 0.5), { sheen: 0.1 });
  [[180, '#7a2a22'], [560, '#2a3a5a'], [900, '#5a2a4a']].forEach(([x, col]) => { c.fillStyle = col; c.beginPath(); c.moveTo(x - 200, fy + 140); c.lineTo(x + 200, fy + 140); c.lineTo(x + 240, fy + 300); c.lineTo(x - 240, fy + 300); c.closePath(); c.fill();
    c.strokeStyle = '#e0b85a'; c.lineWidth = 4; c.stroke(); c.strokeStyle = 'rgba(224,184,90,0.45)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 170, fy + 170); c.lineTo(x + 170, fy + 170); c.moveTo(x - 190, fy + 270); c.lineTo(x + 190, fy + 270); c.stroke(); });
}
function cityGate(c, x, y, s, t, o = {}) { // the town gate in a mud-brick wall, open on the desert
  c.save(); c.translate(x, y); c.scale(s, s);
  ashlar(c, -900, -520, 900, 0, o.col || '#b8946a', 21);
  c.fillStyle = '#e8c890'; c.beginPath(); archPath(c, 0, 0, 280, 420); c.fill(); // desert seen through the gate
  c.save(); c.beginPath(); archPath(c, 0, 0, 280, 420); c.clip();
  sky(c, [[0, '#f0d8a8'], [1, '#ffe8c0']]); c.fillStyle = '#d8b07a'; c.fillRect(-200, -110, 400, 110); c.fillStyle = '#b07a5a'; c.beginPath(); c.moveTo(-200, -110); c.lineTo(-60, -170); c.lineTo(60, -130); c.lineTo(200, -180); c.lineTo(200, -110); c.closePath(); c.fill();
  c.restore();
  c.strokeStyle = '#6a4a30'; c.lineWidth = 16; c.beginPath(); archPath(c, 0, 0, 300, 440); c.stroke();
  c.restore();
}
function stoneInHand(c, o) { const [hx, hy] = handOf(o), s = (o.h || 300) / 300; c.fillStyle = '#6a625a'; c.beginPath(); c.ellipse(hx + (o.dir || 1) * 4 * s, hy - 10 * s, 11 * s, 9 * s, 0.4, 0, 6.283); c.fill(); }
function roadSet(c, t, o = {}) { // the caravan road outside Madyan, winding between red rocks; dusk light
  const dusk = o.dusk === undefined ? 0.35 : o.dusk, fy = 1220;
  midianSky(c, { dusk });
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 760, 820, 500, '#ffc890', 0.35); c.restore(); sun(c, 760, 860, 44, '#ffd890', 0.9);
  par(c, 0.15, o.px || 0, 0, () => { crags(c, fy - 160, 260, 51, mix('#9a6a6a', '#6a4a5a', dusk), { detail: false }); hazeWide(c, fy - 140, 220, '#f2c8a0', 0.5); });
  par(c, 0.4, o.px || 0, 0, () => { rock(c, -40, fy + 40, 640, 380, RED, 52, { lightX: 1 }); rock(c, 1160, fy + 50, 700, 420, mix(RED, '#000000', 0.15), 53, { lightX: 1 }); hazeWide(c, fy + 20, 120, '#f2c8a0', 0.3); });
  sandW(c, fy, '#c8946a', 7, { pebbles: 120, tufts: 30 });
  c.fillStyle = 'rgba(255,236,200,0.28)'; c.beginPath(); c.moveTo(500, fy + 2); c.quadraticCurveTo(560, fy + 200, 380, 1500); c.quadraticCurveTo(220, 1760, 300, H + 200); c.lineTo(860, H + 200); c.quadraticCurveTo(700, 1760, 720, 1500); c.quadraticCurveTo(640, fy + 200, 580, fy + 2); c.closePath(); c.fill();
  acacia(c, 120, fy + 120, 1.0, '#5a6a3a', t); acacia(c, 1000, fy + 90, 0.8, '#5a6a3a', t + 2);
}
const roadX = y => { const q = (y - 1222) / (H - 1222); return lerp(540, 560, q) + Math.sin(q * 3.2) * -140 * q; }; // centre line of the road
function darkVeil(c, a, col = '8,8,16') { if (a > 0) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(${col},${a})`; c.fillRect(0, 0, W, H); c.restore(); } }
function flashW(c, a) { if (a > 0) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(255,250,240,${a})`; c.fillRect(0, 0, W, H); c.restore(); } }


// =====================================================================================================================
// ---------- episode 16: Ya'qub
const YAQ = { veilGlow: 0.5, prophet: true, robe: '#e8e2d4', wrap: '#f7f3ea', skin: '#c49470', trim: '#cfae6a', band: '#b8954a', inner: '#fbf8f0' };
const YUSC = { veilGlow: 0.45, prophet: true, child: true, robe: '#efe9dc', wrap: '#f8f5ee', skin: '#c49470', trim: '#d8bf80', band: '#c9a35a', inner: '#fcfaf4' }; // Yusuf as a boy
const YUSA = { veilGlow: 0.5, prophet: true, robe: '#f2ede2', wrap: '#fbf8f0', skin: '#c49470', trim: '#e0b85a', band: '#e0b85a', inner: '#fcfaf4' }; // Yusuf in Egypt
const BENJ = { robe: '#3a5a6a', wrap: '#ece4d4', skin: '#b07a58', child: true, trim: '#c9a35a' }; // the little brother (Binyamin according to the exegetes)
const MOM = { agal: false, robe: '#4a3a5a', wrap: '#e6dccb', skin: '#b07a58', trim: '#b8a070', band: '#8a6a4a', covered: true, inner: '#ece2d0' };
const BROS = [FOLK[0], FOLK[1], FOLK[2], FOLK[4], FOLK[5], FOLK[7], FOLK[8], { robe: '#5a4a32', wrap: '#e8dcc4', skin: '#a8714f', trim: '#b89a62' },
  { robe: '#2a3a4a', wrap: '#d8ccb2', skin: '#94664a' }, { robe: '#6a3a2a', wrap: '#e2d6be', skin: '#8f5f42', trim: '#c9a35a' }];
const SKY16 = { day: [[0, '#5a86b8'], [0.3, '#a6c2d8'], [0.5, '#f0e2c4']], gold: [[0, '#4a5a8a'], [0.3, '#d8a882'], [0.5, '#ffd8a0']],
  dusk: [[0, '#24284a'], [0.3, '#7a4a62'], [0.5, '#f09060']], night: [[0, '#060a1c'], [0.3, '#141a3a'], [0.5, '#2a2a4a']],
  dawn: [[0, '#3a4a78'], [0.3, '#c0a0a8'], [0.5, '#ffd8a8']], harsh: [[0, '#8aa0b8'], [0.3, '#e0d0b0'], [0.5, '#fff0d0']] };
function skyBlend(o) { let st = SKY16[o.sky || 'gold']; if (o.to) st = st.map((s, i) => [s[0], mix(s[1], SKY16[o.to][i][1], o.k || 0)]); return st; }
function seriesTag16(c, a) { seriesTag(c, a, 16); }
const GRASS = '#8a8a50';

// 1) the land of Canaan: wide sky, far ranges, olive terraces, green-ochre pasture (all layers drawn much wider than the frame)
function canaanLand(c, t, o = {}) {
  const fy = o.fy || 1300, px = o.px || 0, dry = o.dry || 0, nt = o.night || 0;
  sky0(c, skyBlend(o));
  if (o.stars) stars(c, t, 130, 16, [-600, -400, W + 1200, fy - 200], o.stars);
  if (o.sun !== false) { const sx = o.sunX === undefined ? 820 : o.sunX, sy = o.sunY === undefined ? fy - 420 : o.sunY, sa = o.sunA === undefined ? 1 : o.sunA;
    c.save(); c.globalCompositeOperation = 'lighter'; glow(c, sx, sy, 420, '#ffd8a0', 0.35 * sa); c.restore(); sun(c, sx, sy, 42, '#ffe2a8', sa); }
  if (o.moon) moon(c, o.moonX || 820, o.moonY || 520, 40, o.moon);
  if (o.behind) o.behind(c);
  wisps(c, t, fy - 800, 5, '#fff4e0', 0.13 * (1 - nt), 6, 4);
  const far = mix(mix('#8a8aa8', '#a08a88', dry), '#141830', nt), mid = mix(mix('#6f7a5c', '#8a7a5a', dry), '#10141c', nt),
    near = mix(mix('#7a7a4a', '#9a8458', dry), '#10120e', nt), hz = mix(o.haze || '#f4d8b0', '#2a2a48', nt);
  const ol1 = mix(mix('#6a7a48', '#7a6a4a', dry), '#0e120e', nt), ol2 = mix(mix('#4a5a30', '#4a3a28', dry), '#080a08', nt);
  par(c, 0.1, px, 0, () => { ridgeW(c, fy - 270, 150, 0.0022, 61, far); hazeW(c, fy - 240, 230, hz, 0.55); });
  par(c, 0.3, px, 0, () => { ridgeW(c, fy - 140, 90, 0.0036, 62, mid);
    for (let i = -18; i < 26; i++) { const x = i * 118 + (i % 3) * 26, y = ridgeY(x, fy - 140, 90, 0.0036, 62) + 34 + (i % 2) * 18; oliveTree(c, x, y, 0.36, ol1, ol2, Math.sin(t + i) * 2); }
    hazeW(c, fy - 90, 150, hz, 0.42); });
  par(c, 0.55, px, 0, () => { ridgeW(c, fy - 30, 36, 0.004, 63, near); // stone terraces on the near slope
    c.strokeStyle = hexA(mix(near, '#000000', 0.35), 0.5); c.lineWidth = 3;
    for (let k = 0; k < 3; k++) { c.beginPath(); for (let x = -2400; x <= 3600; x += 20) { const v = ridgeY(x, fy - 30, 36, 0.004, 63) + 14 + k * 12; x === -2400 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); }
    hazeW(c, fy, 70, hz, 0.25); });
  plain(c, fy, t, { col: mix(mix(GRASS, '#a88a58', dry), '#14140e', nt * 0.85), seed: o.seed || 7, n: o.n || 150 });
}
function camp(c, t, x, fy, s = 1, o = {}) { // Ya'qub's home: a mud-brick house, a tent, a low stone fence, a few sheep
  const nt = o.night || 0;
  tent(c, x + 300 * s, fy + 4, 380 * s, 230 * s, mix('#6a4a34', '#1a120c', nt), mix('#2a1a10', '#000000', nt));
  c.strokeStyle = mix('#3a2614', '#000000', nt); c.lineWidth = 3 * s; c.beginPath(); c.moveTo(x + 110 * s, fy + 4); c.lineTo(x + 60 * s, fy + 14); c.moveTo(x + 490 * s, fy + 4); c.lineTo(x + 540 * s, fy + 14); c.stroke();
  house(c, x, fy + 6, 340 * s, 240 * s, mix('#c8a882', '#3a3040', nt * 0.8), { lamp: o.lamp || 0, t: t + 100, smoke: o.smoke || 0, doorOpen: o.doorOpen });
  if (o.fence !== false) { c.fillStyle = mix('#9a8a6a', '#2a2828', nt); for (let k = 0; k < 9; k++) { const bx = x - 420 * s + k * 34 * s; c.beginPath(); c.ellipse(bx, fy + 20 * s, 20 * s, 14 * s, 0, Math.PI, 0); c.fill(); } }
  if (o.sheep !== false) [[-360, 40, 1], [-250, 52, -1], [-150, 36, 1]].forEach(([dx, dy, d], i) => sheep(c, x + dx * s, fy + dy * s, 0.5 * s, t + i * 2, d, { graze: true, col: mix('#ebe3d2', '#4a4650', nt) }));
}
function grassFg(c, t, col = '#5a6a30') { // blurred foreground: grass tufts and stones at the bottom corners
  [[-30, 2010, 4.4, 1], [100, 2070, 3.6, 2], [1110, 2020, 4.2, 3], [980, 2075, 3.2, 4]].forEach(([x, y, k, sd]) => shrub(c, x, y, k, col, t, sd));
  boulder(c, 30, 2090, 300, 120, '#7a6a52', 5); boulder(c, 1070, 2095, 260, 100, '#7a6a52', 6);
}

// 2) Yusuf's shirt (qamis): long tunic with sleeves, folds, embroidered neckline; stain = the false blood; glow = the shirt of good news
function qamis(c, x, y, s, o = {}) {
  const t = (o.t || 0) + 100, fl = o.flut || 0, wv = k => Math.sin(t * 3 + k) * 8 * fl;
  c.save(); c.translate(x, y); c.rotate(o.ang || 0); c.scale(s, s); c.globalAlpha *= o.alpha === undefined ? 1 : o.alpha;
  if (o.glow) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, 0, 300, '#fff0c0', 0.6 * o.glow); c.restore(); }
  c.fillStyle = 'rgba(20,10,4,0.18)'; c.beginPath(); c.ellipse(6, 10, 120, 130, 0, 0, 6.283); c.fill();
  const g = c.createLinearGradient(-100, -110, 100, 120); g.addColorStop(0, '#fffdf6'); g.addColorStop(0.55, '#eee6d4'); g.addColorStop(1, '#cbbfa6');
  c.fillStyle = g; c.beginPath();
  c.moveTo(-32, -104); c.quadraticCurveTo(0, -86, 32, -104);
  c.lineTo(80, -92); c.lineTo(136 + wv(1), -28 + wv(2)); c.lineTo(110 + wv(1), -2 + wv(2)); c.lineTo(64, -38);
  c.quadraticCurveTo(68, 30, 72 + wv(3), 116);
  for (let i = 0; i <= 8; i++) { const q = i / 8; c.lineTo(lerp(72, -72, q) + wv(i) * 0.5, 116 + (i % 2) * 7 + wv(i + 4) * 0.6); }
  c.quadraticCurveTo(-68, 30, -64, -38); c.lineTo(-110 - wv(5), -2 + wv(6)); c.lineTo(-136 - wv(5), -28 + wv(6)); c.lineTo(-80, -92); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(110,90,60,0.28)'; c.lineWidth = 3; c.beginPath(); // folds
  c.moveTo(-30, -60); c.quadraticCurveTo(-38, 30, -44 + wv(2), 112); c.moveTo(18, -70); c.quadraticCurveTo(26, 20, 30 + wv(3), 112); c.moveTo(-4, -20); c.quadraticCurveTo(-2, 50, 2, 112);
  c.moveTo(70, -80); c.quadraticCurveTo(100, -50, 120, -18); c.moveTo(-70, -80); c.quadraticCurveTo(-100, -50, -120, -18); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-50, -82); c.quadraticCurveTo(-56, 0, -60, 100); c.stroke();
  c.fillStyle = '#6a5038'; c.beginPath(); c.moveTo(-8, -96); c.lineTo(8, -96); c.lineTo(3, -50); c.lineTo(-3, -50); c.closePath(); c.fill(); // neck slit
  c.fillStyle = '#c9a050'; for (let k = 0; k < 11; k++) { const q = k / 10; c.beginPath(); c.arc(lerp(-30, 30, q), -102 + Math.sin(q * Math.PI) * 14, 2.6, 0, 6.283); c.fill(); } // embroidery
  c.strokeStyle = '#c9a050'; c.lineWidth = 4; c.beginPath(); c.moveTo(112 + wv(1), -4 + wv(2)); c.lineTo(136 + wv(1), -26 + wv(2)); c.moveTo(-112 - wv(5), -4 + wv(6)); c.lineTo(-136 - wv(5), -26 + wv(6));
  c.moveTo(-72, 110); c.lineTo(72, 110); c.stroke();
  if (o.stain) { const r = rng(4); c.fillStyle = hexA('#7a1c18', 0.8 * o.stain); // the false blood: a few dull smears (no gore)
    [[-14, 6, 26, 18, 0.4], [18, 34, 14, 10, 0], [-24, 46, 9, 13, 0.2], [30, -8, 10, 7, 0.6]].forEach(([sx, sy, rx, ry, a]) => { c.beginPath(); c.ellipse(sx, sy, rx, ry, a, 0, 6.283); c.fill(); });
    c.fillStyle = hexA('#5a1210', 0.5 * o.stain); for (let k = 0; k < 8; k++) { c.beginPath(); c.arc(-30 + r() * 70, -10 + r() * 70, 2 + r() * 4, 0, 6.283); c.fill(); } }
  c.restore();
  if (o.glow) sparkle(c, t, x, y, 10, 160 * s, 13, o.glow);
}
// 3) the blindness: the picture itself turns blurred, colourless and white (never on a face); k 0..1
function blindFx(c, k) {
  if (k <= 0.01) return;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.filter = `blur(${(18 * k).toFixed(1)}px)`; c.globalAlpha = Math.min(1, k * 1.5); c.drawImage(c.canvas, 0, 0); c.restore();
  desat(c, 0.8 * k);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createRadialGradient(W / 2, H * 0.45, H * 0.1, W / 2, H * 0.5, H * 0.8); g.addColorStop(0, `rgba(250,248,242,${0.42 * k})`); g.addColorStop(1, `rgba(232,228,220,${0.68 * k})`);
  c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
}
function whiteOut(c, a) { if (a > 0) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(248,246,240,${a})`; c.fillRect(0, 0, W, H); c.restore(); } }
// 4) the scent of Yusuf carried by the wind (Yusuf 94): strands of warm light along a path (no form)
function scentRibbon(c, t, pts, k, a = 1) {
  if (k <= 0 || a <= 0) return; t += 100;
  const P = q => { const n = pts.length - 1, f = clamp(q) * n, i = Math.min(n - 1, Math.floor(f)), u = f - i;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)];
    const cr = (A, B, C, D) => 0.5 * ((2 * B) + (-A + C) * u + (2 * A - 5 * B + 4 * C - D) * u * u + (-A + 3 * B - 3 * C + D) * u * u * u);
    return [cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])]; };
  c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; c.lineJoin = 'round';
  for (let s = 0; s < 4; s++) { c.strokeStyle = `rgba(255,216,150,${0.17 * a})`; c.lineWidth = 30 - s * 6; c.filter = `blur(${9 - s * 2}px)`; c.beginPath();
    for (let i = 0; i <= 90; i++) { const q = i / 90 * k, [x, y] = P(q), off = Math.sin(q * 16 + t * 1.6 + s * 1.7) * (16 + s * 7) * Math.min(1, i / 8); i ? c.lineTo(x, y + off) : c.moveTo(x, y + off); }
    c.stroke(); }
  c.filter = 'none';
  const r = rng(11); for (let i = 0; i < 46; i++) { const q = ((r() + t * 0.07) % 1) * k, [x, y] = P(q); glow(c, x + (r() - 0.5) * 70, y + Math.sin(t * 2 + i) * 22 + (r() - 0.5) * 40, 12 + r() * 12, '#ffe8b0', 0.55 * a); }
  const [hx, hy] = P(k); glow(c, hx, hy, 90, '#fff0c8', 0.45 * a);
  c.restore();
}
// 5) a wolf in silhouette on a far crest (only a dark shape against the dusk sky)
function wolfSil(c, x, y, s, howl = 0, col = '#16121a') {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.strokeStyle = col; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-58, -70); c.quadraticCurveTo(-20, -86, 30, -84); c.quadraticCurveTo(62, -96, 70, -70); c.quadraticCurveTo(66, -44, 40, -42); c.quadraticCurveTo(-10, -40, -50, -44); c.quadraticCurveTo(-70, -54, -58, -70); c.fill(); // body
  c.lineWidth = 9; [[50, -48, 54, -22, 52, 0], [36, -46, 34, -22, 38, 0], [-40, -50, -52, -26, -46, 0], [-26, -48, -30, -24, -24, 0]].forEach(([a, b, d, e, f, g]) => { c.beginPath(); c.moveTo(a, b); c.quadraticCurveTo(d, e, f, g); c.stroke(); });
  c.lineWidth = 12; c.beginPath(); c.moveTo(-56, -62); c.quadraticCurveTo(-86, -50, -96, -18); c.stroke(); // tail
  const ha = -0.15 - 0.75 * howl; c.save(); c.translate(62, -82); c.rotate(ha);
  c.beginPath(); c.moveTo(-6, 12); c.lineTo(8, -12); c.lineTo(30, -16); c.lineTo(58, -8); c.lineTo(60, 0); c.lineTo(30, 8); c.lineTo(10, 22); c.closePath(); c.fill(); // neck, head, snout
  c.beginPath(); c.moveTo(14, -12); c.lineTo(16, -34); c.lineTo(26, -14); c.closePath(); c.fill(); c.beginPath(); c.moveTo(22, -14); c.lineTo(30, -32); c.lineTo(34, -12); c.closePath(); c.fill(); // ears
  c.restore(); c.restore();
}
// 6) the dream (Yusuf 4): eleven stars, the sun and the moon bowing (bow 0..1, staggered); count = how many stars are lit
function dreamBodies(c, t, cx, cy, R, count, sunK, moonK, bow) {
  const tgt = [cx, cy + R * 1.25];
  for (let i = 0; i < 11; i++) { const k = clamp(count - i); if (k <= 0) continue;
    const ang = Math.PI * (1.08 + 0.84 * i / 10), b = ease(clamp(bow * 1.6 - i * 0.05)), x0 = cx + Math.cos(ang) * R, y0 = cy + Math.sin(ang) * R * 0.75;
    const x = lerp(x0, lerp(x0, tgt[0], 0.25), b), y = lerp(y0, lerp(y0, tgt[1], 0.3), b);
    star4(c, x, y, 26 * ease(k) * (1 - 0.25 * b), '#fff6d8', ease(k) * (0.8 + 0.2 * Math.sin(t * 2 + i))); }
  const bs = ease(clamp(bow * 1.4 - 0.2)), bm = ease(clamp(bow * 1.4 - 0.3));
  if (sunK > 0) { const x = lerp(cx - R * 1.05, cx - R * 0.8, bs), y = lerp(cy + R * 0.15, cy + R * 0.55, bs); sun(c, x, y, 48, '#ffd890', ease(sunK)); }
  if (moonK > 0) { const x = lerp(cx + R * 1.05, cx + R * 0.8, bm), y = lerp(cy + R * 0.15, cy + R * 0.55, bm); moon(c, x, y, 44, ease(moonK), 0.42); }
}
// 7) Egypt: the hall of the treasury where Yusuf received his brothers; and the desert road out of Egypt
function pillarE(c, x, y, w, h, c1, c2, band) { // papyrus column (from episode 1)
  const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, mix(c1, '#fff0d0', 0.15)); g.addColorStop(0.6, c1); g.addColorStop(1, c2);
  c.fillStyle = g; c.fillRect(x - w / 2, y - h, w, h);
  c.fillStyle = g; c.beginPath(); c.moveTo(x - w / 2, y - h); c.quadraticCurveTo(x - w * 1.1, y - h - w * 0.6, x - w * 0.9, y - h - w * 1.1);
  c.lineTo(x + w * 0.9, y - h - w * 1.1); c.quadraticCurveTo(x + w * 1.1, y - h - w * 0.6, x + w / 2, y - h); c.fill();
  c.fillStyle = band; for (let i = 0; i < 3; i++) c.fillRect(x - w / 2, y - h + 30 + i * 22, w, 8);
  c.fillRect(x - w * 0.95, y - h - w * 1.1 - 20, w * 1.9, 22);
  c.strokeStyle = 'rgba(40,20,8,0.25)'; c.lineWidth = 3; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x - w / 2 + k * w / 4, y - h + 100); c.lineTo(x - w / 2 + k * w / 4, y - 10); c.stroke(); }
  c.fillStyle = mix(c2, '#000000', 0.2); c.fillRect(x - w * 0.62, y - 26, w * 1.24, 26);
}
function egyptHall(c, t, o = {}) {
  const fy = o.fy || 1420;
  const g = c.createLinearGradient(0, -300, 0, fy); g.addColorStop(0, '#4a2a14'); g.addColorStop(1, '#b07a44'); c.fillStyle = g; c.fillRect(-900, -400, W + 1800, fy + 400);
  for (let i = -2; i < 5; i++) { const ax = 160 + i * 380; // tall openings with a hot sky and palms behind
    c.fillStyle = '#2a1608'; c.beginPath(); archPath(c, ax, fy - 130, 210, 660); c.fill();
    c.save(); c.beginPath(); archPath(c, ax, fy - 140, 186, 636); c.clip();
    const sg = c.createLinearGradient(0, fy - 800, 0, fy - 140); sg.addColorStop(0, '#f8e2b0'); sg.addColorStop(1, '#f0b878'); c.fillStyle = sg; c.fillRect(ax - 120, fy - 800, 240, 700);
    datePalm(c, ax + 40, fy - 140, 0.8, '#5a6a3a', t, i + 5); c.restore();
    c.strokeStyle = '#d8a850'; c.lineWidth = 6; c.beginPath(); archPath(c, ax, fy - 130, 222, 672); c.stroke(); }
  c.fillStyle = '#3a6a72'; c.fillRect(-900, fy - 900, W + 1800, 26); c.fillStyle = '#d8a850'; c.fillRect(-900, fy - 874, W + 1800, 10); // painted frieze
  for (let x = -880; x < W + 900; x += 60) { c.fillStyle = (x / 60) % 2 ? '#c8503a' : '#3a6a72'; c.beginPath(); c.moveTo(x, fy - 864); c.lineTo(x + 30, fy - 820); c.lineTo(x + 60, fy - 864); c.closePath(); c.fill(); }
  c.fillStyle = '#7a4a24'; c.fillRect(-900, fy - 130, W + 1800, 130);
  flagFloor(c, fy, 540, '#b08a5a', { sheen: 0.22, sheenCol: '#ffd8a0' });
  c.save(); c.globalCompositeOperation = 'lighter'; // light shafts from the openings
  for (let i = -1; i < 4; i++) { const ax = 160 + i * 380; const lg = c.createLinearGradient(0, fy - 700, 0, fy + 400); lg.addColorStop(0, 'rgba(255,220,160,0.12)'); lg.addColorStop(1, 'rgba(255,220,160,0)');
    c.fillStyle = lg; c.beginPath(); c.moveTo(ax - 90, fy - 700); c.lineTo(ax + 90, fy - 700); c.lineTo(ax + 300, fy + 400); c.lineTo(ax + 60, fy + 400); c.closePath(); c.fill(); }
  c.restore();
  if (o.lamps !== false) for (let i = 0; i < 3; i++) { const lx = 350 + i * 190; c.strokeStyle = '#2a1a10'; c.lineWidth = 2; c.beginPath(); c.moveTo(lx, -100); c.lineTo(lx, 520); c.stroke(); lanternBox(c, lx, 550, 1.0, t, i); }
  pillarE(c, -40, fy + 120, 150, 1300, '#c08a4e', '#7a5028', '#3d6f7a'); pillarE(c, 1120, fy + 120, 150, 1300, '#c08a4e', '#7a5028', '#3d6f7a');
}
function egyptRoad(c, t, o = {}) { // the desert just outside Egypt: pyramids in the haze, a palm-lined wall, the road
  const fy = o.fy || 1300, px = o.px || 0;
  sky0(c, skyBlend({ sky: o.sky || 'day', to: o.to, k: o.k }));
  const sx = o.sunX === undefined ? 860 : o.sunX; c.save(); c.globalCompositeOperation = 'lighter'; glow(c, sx, o.sunY || 640, 420, '#fff0c8', 0.35); c.restore(); sun(c, sx, o.sunY || 640, 46, '#fff4d6', 1);
  wisps(c, t, 520, 5, '#ffffff', 0.18, 8, 6);
  par(c, 0.1, px, 0, () => { pyramid(c, 260, fy - 70, 520, '#dcb488', '#b08860'); pyramid(c, 640, fy - 60, 360, '#d8b080', '#a87c54'); pyramid(c, 860, fy - 64, 240, '#d4ac7c', '#a47850'); hazeW(c, fy - 40, 260, '#f6e2c0', 0.7); });
  par(c, 0.35, px, 0, () => { c.fillStyle = '#c8a070'; c.fillRect(-2600, fy - 120, 5800, 100); for (let x = -2600; x < 3200; x += 70) c.fillRect(x, fy - 140, 40, 22);
    for (let i = -14; i < 24; i++) datePalm(c, i * 170 + (i % 2) * 40, fy - 40, 0.9 + (i % 3) * 0.12, '#5a6a3a', t, i + 30);
    hazeW(c, fy - 10, 90, '#f6e2c0', 0.35); });
  sandW(c, fy, '#d8b07a', 9, { pebbles: 90, tufts: 8 });
  c.fillStyle = 'rgba(255,240,210,0.22)'; c.beginPath(); c.moveTo(-2600, fy + 120); c.quadraticCurveTo(540, fy + 60, 3600, fy + 140); c.lineTo(3600, fy + 230); c.quadraticCurveTo(540, fy + 150, -2600, fy + 220); c.closePath(); c.fill(); // the road
}
function desertWide(c, t, o = {}) { // the long road between Egypt and Canaan
  const fy = o.fy || 1250;
  sky0(c, skyBlend({ sky: o.sky || 'gold', to: o.to, k: o.k }));
  if (o.sunX !== undefined) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, o.sunX, o.sunY, 460, '#ffd8a0', 0.4); c.restore(); sun(c, o.sunX, o.sunY, 44, '#ffe2a8', 1); }
  wisps(c, t, 560, 5, '#fff4e0', 0.16, 21, 8);
  par(c, 0.1, o.px || 0, 0, () => { ridgeW(c, fy - 120, 110, 0.0024, 71, '#b08a80'); hazeW(c, fy - 90, 220, '#f8d8b0', 0.6); });
  par(c, 0.35, o.px || 0, 0, () => { ridgeW(c, fy - 30, 60, 0.0032, 72, '#c8946a'); hazeW(c, fy, 100, '#f8d8b0', 0.35); });
  sandW(c, fy, '#d4a46e', 13, { pebbles: 80, tufts: 6 });
}

// 8) the hero shot (hook, sight, cta, outro, cover): the hillside of Canaan in the golden hour. Ya'qub seated on a rug before his home,
//    the bearer of good news standing before him with the shirt. o: blind (0..1), lay (shirt laid over his face), reach, burst (light)
const HY = { x: 400, y: 1590, h: 560 }, HM = { x: 690, y: 1610, h: 520 };
function yaqHero(c, T, o = {}) {
  const kz = o.kz || 0, lay = o.lay || 0, reach = o.reach === undefined ? 0.15 : o.reach, burst = o.burst || 0;
  cam(c, lerp(1.0, 1.14, kz) + 0.004 * Math.sin(T * 0.3), lerp(540, 520, kz), lerp(1200, 1250, kz));
  canaanLand(c, T, { fy: 1330, sky: 'gold', sunX: 780, sunY: 960, sunA: 0.95, seed: 9 });
  camp(c, T, 960, 1338, 0.9, { lamp: 0.25, smoke: 1 });
  oliveTree(c, 80, 1520, 1.75, '#6a7a48', '#4a5a30', Math.sin(T * 0.6) * 3);
  c.fillStyle = '#7a2a22'; c.beginPath(); c.moveTo(220, 1560); c.lineTo(560, 1560); c.lineTo(600, 1640); c.lineTo(180, 1640); c.closePath(); c.fill(); // rug
  c.strokeStyle = '#e0b85a'; c.lineWidth = 4; c.stroke(); c.strokeStyle = 'rgba(224,184,90,0.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(220, 1580); c.lineTo(570, 1580); c.moveTo(200, 1620); c.lineTo(585, 1620); c.stroke();
  lean(c, HY.x, HY.y, (o.bow || 0) * 0.07, () => fig(c, YAQ, { x: HY.x, y: HY.y, h: HY.h, dir: 1, pose: 'sit', light: 0.9, veilGlow: 0.4, t: T, wind: 0.3, dua: !!o.dua }));
  const mo = { x: HM.x, y: HM.y, h: HM.h, dir: -1, reach, light: 1.0, t: T, wind: 0.35 };
  fig(c, BROS[1], mo);
  const [hx, hy] = handOf(mo), [yx, yy] = headOf({ x: HY.x, y: HY.y, h: HY.h, pose: 'sit' }), q = ease(lay);
  if (o.shirt !== false) qamis(c, lerp(hx - 40, yx + 6, q), lerp(hy + 70, yy + 46, q), lerp(0.55, 0.74, q), { ang: lerp(-0.25, 0.08, q), t: T, flut: 0.4 * (1 - q), glow: Math.min(0.5, (o.shirtGlow || 0) + 0.5 * burst) });
  if (burst > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, yx, yy - 60, 420, '#ffe8c0', 0.3 * burst); c.restore(); rays(c, yx, yy - 60, -Math.PI / 2, 6.28, 900, 22, '#fff6dc', 0.045 * burst, T, 41); lightRings(c, yx, yy, T, 0.35 * burst, 4, 600); }
  blurLayer(c, 9, cc => grassFg(cc, T), 2);
  c.setTransform(1, 0, 0, 1, 0, 0);
  blindFx(c, o.blind || 0);
}


// =====================================================================================================================
// ---------- episode 17: Lut
const LUT = { veilGlow: 0.5, prophet: true, robe: '#ebe5d6', wrap: '#f7f3ea', skin: '#c49470', trim: '#cfae6a', band: '#b8954a', inner: '#fbf8f0' };
const IBRA = { veilGlow: 0.5, prophet: true, robe: '#e2dbc8', wrap: '#f5f0e4', skin: '#c49470', trim: '#d8b45a', band: '#c9a040', inner: '#fbf8f0' };
const DAUG = [{ agal: false, robe: '#3e5a6e', wrap: '#ece4d4', skin: '#b4805c', trim: '#c9b07a', band: '#8a7a5a', covered: true, inner: '#f2ece0' },
  { agal: false, robe: '#5a4a6a', wrap: '#e6dccb', skin: '#b07a58', trim: '#b8a070', band: '#7a6a5a', covered: true, inner: '#ece2d0' }];
const LWIFE = { agal: false, robe: '#3a2e2e', wrap: '#5a4a44', skin: '#8f5f42', trim: '#6a5a4a', band: '#4a3a30', covered: true, inner: '#6a5a50' }; // his wife (never named in the Qur'an)
const SODOM = [ // the people of the cities: rich dark cloth, gold trims
  { robe: '#5a1e2a', wrap: '#c8b48a', skin: '#8f5f42', trim: '#d8b45a', band: '#d8b45a' }, { robe: '#2a2440', wrap: '#b8a888', skin: '#9a6a4c', trim: '#c9a35a' },
  { robe: '#4a2a1a', wrap: '#d0c09a', skin: '#a8714f', trim: '#b8863a', band: '#7a4a2a' }, { robe: '#1e3a3a', wrap: '#c0b090', skin: '#8f5f42', trim: '#c9a35a' },
  { robe: '#6a3a22', wrap: '#d8c8a4', skin: '#94664a', trim: '#e0b85a', band: '#e0b85a' }, { robe: '#3a1e30', wrap: '#bca880', skin: '#a8714f', trim: '#b89a62' },
  { robe: '#2e2a26', wrap: '#a89878', skin: '#7a5038', trim: '#8a7a5a' }, { robe: '#4a3a52', wrap: '#ccbc98', skin: '#9a6a4c', trim: '#c9a35a', band: '#8a6a3a' },
];
SKY16.ember = [[0, '#1c1424'], [0.3, '#7a3a34'], [0.5, '#f0884a']];
SKY16.ash = [[0, '#4a4a5a'], [0.3, '#9a9098'], [0.5, '#d8c8b4']];
SKY16.violet = [[0, '#1a1838'], [0.3, '#5a3a5a'], [0.5, '#c87a6a']];
function seriesTag17(c, a) { seriesTag(c, a, 17); }

// 1) the valley of the Dead Sea (according to the exegetes): the Moab range across the water, the milky turquoise sea, salt crusts on the
//    shore, the green plain with fields and palm groves. All layers are drawn much wider than the frame.
function valleyLand(c, t, o = {}) {
  const fy = o.fy || 1240, px = o.px || 0, nt = o.night || 0, ash = o.ash || 0, seaY = fy - (o.seaH || 170);
  sky0(c, skyBlend(o));
  if (o.stars) stars(c, t, 140, 17, [-600, -400, W + 1200, seaY - 160], o.stars);
  if (o.sun !== false) { const sx = o.sunX === undefined ? 800 : o.sunX, sy = o.sunY === undefined ? seaY - 330 : o.sunY, sa = o.sunA === undefined ? 1 : o.sunA;
    c.save(); c.globalCompositeOperation = 'lighter'; glow(c, sx, sy, 460, '#ffd0a0', 0.35 * sa); c.restore(); sun(c, sx, sy, 40, '#ffe0a8', sa); }
  if (o.moon) moon(c, o.moonX || 780, o.moonY || 520, 38, o.moon);
  if (o.behind) o.behind(c);
  wisps(c, t, seaY - 700, 5, '#fff2e0', 0.12 * (1 - nt), 7, 4);
  const hz = mix(mix(o.haze || '#f2d0b0', '#c8b8b0', ash), '#2a2440', nt);
  const far = mix(mix('#a07a8a', '#8a8090', ash), '#141428', nt), far2 = mix(mix('#8a6a6a', '#7a7070', ash), '#12121e', nt);
  par(c, 0.06, px, 0, () => { ridgeW(c, seaY - 30, 200, 0.0017, 71, far); // the Moab plateau: flat top, steep flanks
    c.strokeStyle = hexA(mix(far, '#000000', 0.25), 0.35); c.lineWidth = 3; for (let i = 0; i < 26; i++) { const x = -1800 + i * 230, y = ridgeY(x, seaY - 30, 200, 0.0017, 71); c.beginPath(); c.moveTo(x, y + 10); c.quadraticCurveTo(x + 20, y + 120, x - 10, seaY - 10); c.stroke(); }
    hazeW(c, seaY, 300, hz, 0.62); });
  par(c, 0.12, px, 0, () => { ridgeW(c, seaY + 4, 46, 0.006, 72, far2); hazeW(c, seaY + 8, 90, hz, 0.5); });
  const seaTop = mix(mix(o.seaTop || '#9cc8c4', '#a8a8a8', ash), '#1a2438', nt), seaBot = mix(mix('#3a8890', '#6a7a80', ash), '#0c1420', nt);
  par(c, 0.2, px, 0, () => { c.fillStyle = seaBot; c.fillRect(-2600, seaY, W + 5200, fy - seaY + 20);
    const g = c.createLinearGradient(0, seaY, 0, fy); g.addColorStop(0, seaTop); g.addColorStop(1, seaBot); c.fillStyle = g; c.fillRect(-2600, seaY, W + 5200, fy - seaY + 20);
    water(c, t, seaY + 2, fy + 10, { top: seaTop, bot: seaBot, sunX: o.glint === false ? undefined : (o.sunX === undefined ? 800 : o.sunX), n: 60, a: 0.6 * (1 - nt * 0.7), flow: 5, seed: 17 });
    const r = rng(23); c.fillStyle = hexA(mix('#fffaf0', '#4a4a5a', nt), 0.55); // salt crusts along the shore
    for (let i = 0; i < 90; i++) { const x = -2000 + r() * (W + 4000), y = fy - 6 + r() * 26; c.beginPath(); c.ellipse(x, y, 20 + r() * 70, 3 + r() * 5, 0, 0, 6.283); c.fill(); } });
  par(c, 0.35, px, 0, () => {
    const gc = mix(mix('#8a8a4a', '#8a7a68', ash), '#12140e', nt);
    plain(c, fy + 10, t, { col: gc, seed: o.seed || 9, n: 90 });
    if (!ash) { const r = rng(31); for (let j = 0; j < 4; j++) { const yy = fy + 30 + j * 46; // fields: strips in perspective
      for (let i = -12; i < 22; i++) { const x = i * 150 + (j % 2) * 70 + r() * 30, w = 110 + r() * 60;
        c.fillStyle = hexA(mix(r() > 0.5 ? '#6a8a3a' : '#b8a050', '#10140c', nt), 0.55); c.beginPath(); c.moveTo(x, yy); c.lineTo(x + w, yy); c.lineTo(x + w * 1.08, yy + 30 + j * 6); c.lineTo(x - w * 0.08, yy + 30 + j * 6); c.closePath(); c.fill(); } }
      for (let i = -10; i < 22; i++) { const x = i * 170 + (i % 3) * 40, y = fy + 40 + (i % 2) * 24; if (o.clear && Math.abs(x - o.clear[0]) < o.clear[1]) continue; datePalm(c, x, y, 0.28 + (i % 3) * 0.04, mix('#3a4a24', '#06080a', nt), t + i, i + 40); } }
    else { const r = rng(37); for (let i = 0; i < 40; i++) { const x = -1500 + r() * (W + 3000), y = fy + 20 + r() * 220; c.fillStyle = hexA('#3a3438', 0.35); c.beginPath(); c.ellipse(x, y, 30 + r() * 80, 6 + r() * 8, 0, 0, 6.283); c.fill(); } }
    if (o.mid) o.mid(c);
  });
}

// 2) one of the cities of the valley: a low mound (tell), houses climbing it, a tower, a crenellated wall with towers and a gate.
//    lamp: lit windows at night; only: index of the ONLY lit house ("one house of Muslims"); scale s, base y.
function sodomCity(c, t, x, y, s, o = {}) {
  const nt = o.night || 0, lamp = o.lamp || 0, ash = o.ash || 0;
  const base = mix(mix('#c9a57c', '#9a8a7a', ash), '#2a2632', nt * 0.85), wallC = mix('#b08a60', '#201c26', nt * 0.85);
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = mix('#9a7a52', '#16141c', nt * 0.85); c.beginPath(); c.ellipse(0, 12, 820, 120, 0, Math.PI, 0); c.fill(); // the tell
  const r = rng(o.seed || 17); let idx = 0;
  // the high tower / temple on top
  c.fillStyle = mix(base, '#000000', 0.1); c.fillRect(-90, -420, 180, 260); c.fillStyle = mix(base, '#fff0d8', 0.15); c.fillRect(-90, -420, 60, 260);
  for (let k = 0; k < 5; k++) c.fillRect(-90 + k * 40, -440, 22, 22);
  c.fillStyle = mix('#1a0e08', '#ffc070', (o.only === undefined ? lamp * 0.8 : 0)); c.fillRect(-14, -380, 28, 44);
  for (let row = 0; row < 4; row++) {
    const ry = -230 + row * 52, n = 9 - (row === 0 ? 3 : 0);
    for (let i = 0; i < n; i++) {
      const hx = (row === 0 ? -380 : -620) + i * (row === 0 ? 150 : 152) + (row % 2) * 60 + (r() - 0.5) * 30, w = 120 + r() * 60, h = 90 + r() * 70 - row * 6;
      const lit = o.only !== undefined ? (idx === o.only ? 1 : 0) : lamp * (r() > 0.35 ? 1 : 0.2);
      house(c, hx, ry, w, h, mix(base, r() > 0.5 ? '#fff0d8' : '#6a4a3a', 0.12 + r() * 0.12), { lamp: lit, t: t + 100 + idx });
      if (o.only !== undefined && idx === o.only && lit) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, hx, ry - h * 0.5, 260, '#ffc878', 0.45 * (0.9 + 0.1 * Math.sin(t * 3))); c.restore(); }
      idx++;
    }
    if (row === 1 && !ash) for (let i = 0; i < 5; i++) datePalm(c, -560 + i * 290 + (i % 2) * 50, ry + 20, 0.45, mix('#3a4a24', '#06080a', nt), t + i, 60 + i);
  }
  // the wall: crenellations, towers, a gate
  const wy = 0, wh = 120;
  c.fillStyle = wallC; c.fillRect(-700, wy - wh, 1400, wh);
  for (let k = 0; k < 36; k++) c.fillRect(-700 + k * 40, wy - wh - 18, 22, 20);
  c.strokeStyle = hexA(mix(wallC, '#000000', 0.4), 0.35); c.lineWidth = 2; for (let yy = wy - 20; yy > wy - wh; yy -= 24) { c.beginPath(); c.moveTo(-700, yy); c.lineTo(700, yy); c.stroke(); }
  [-700, -260, 260, 700].forEach(tx => { c.fillStyle = mix(wallC, '#fff0d8', 0.08); c.fillRect(tx - 60, wy - wh - 70, 120, wh + 70);
    for (let k = 0; k < 3; k++) c.fillRect(tx - 60 + k * 44, wy - wh - 92, 30, 24); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(tx + 20, wy - wh - 70, 40, wh + 70); });
  c.fillStyle = o.gateLit ? mix('#2a1a10', '#ffcf8a', o.gateLit) : mix('#2a1a10', '#0a0608', nt); c.beginPath(); archPath(c, 0, wy, 120, 150); c.fill();
  c.strokeStyle = mix('#e0c08a', '#3a3040', nt); c.lineWidth = 8; c.beginPath(); archPath(c, 0, wy, 136, 164); c.stroke();
  c.fillStyle = 'rgba(10,6,4,0.25)'; c.fillRect(-700, wy - 8, 1400, 8);
  c.restore();
}

// 3) the city lifted and turned over (Hud 82: "We made its highest part its lowest"), sinking into the ground and the dust
function earthSlab(c, x, y, s) { // the ground torn out under the city: soil and rock strata, jagged underside, roots
  const r = rng(77), pts = [];
  for (let i = 0; i <= 24; i++) { const q = i / 24, env = Math.sin(q * Math.PI); pts.push([x + (q - 0.5) * 1560 * s, y + (30 + env * (250 + r() * 70)) * s]); }
  const path = () => { c.beginPath(); c.moveTo(x - 780 * s, y - 4 * s); c.lineTo(x + 780 * s, y - 4 * s); pts.slice().reverse().forEach(p => c.lineTo(p[0], p[1])); c.closePath(); };
  const g = c.createLinearGradient(0, y, 0, y + 330 * s); g.addColorStop(0, '#8a6444'); g.addColorStop(0.35, '#6a4a34'); g.addColorStop(0.7, '#4a3428'); g.addColorStop(1, '#2a1e18');
  path(); c.fillStyle = g; c.fill(); c.save(); path(); c.clip();
  for (let k = 0; k < 5; k++) { c.strokeStyle = hexA(k % 2 ? '#2a1a10' : '#c8a07a', 0.3); c.lineWidth = (4 + k * 2) * s; c.beginPath();
    for (let xx = -800; xx <= 800; xx += 40) { const yy = y + (40 + k * 55 + Math.sin(xx * 0.01 + k) * 10) * s; xx === -800 ? c.moveTo(x + xx * s, yy) : c.lineTo(x + xx * s, yy); } c.stroke(); }
  for (let i = 0; i < 40; i++) { c.fillStyle = hexA(r() > 0.5 ? '#3a2a20' : '#9a7a5a', 0.6); c.beginPath(); c.ellipse(x + (r() - 0.5) * 1400 * s, y + (40 + r() * 220) * s, (8 + r() * 26) * s, (6 + r() * 14) * s, r() * 3, 0, 6.283); c.fill(); }
  c.strokeStyle = 'rgba(40,26,16,0.6)'; c.lineCap = 'round'; for (let i = 0; i < 12; i++) { const rx = x + (r() - 0.5) * 1300 * s, ry = y + 20 * s; c.lineWidth = (2 + r() * 3) * s; c.beginPath(); c.moveTo(rx, ry); c.quadraticCurveTo(rx + (r() - 0.5) * 60 * s, ry + 60 * s, rx + (r() - 0.5) * 80 * s, ry + (90 + r() * 80) * s); c.stroke(); }
  c.restore();
  c.fillStyle = 'rgba(255,220,170,0.25)'; c.fillRect(x - 780 * s, y - 6 * s, 1560 * s, 6 * s);
}
function overturn(c, x, y, s, k, fn) {
  if (k <= 0) { fn(); return; }
  const lift = easeOut(seg(k, 0, 0.35)) * 320 * s - easeIn(seg(k, 0.5, 1)) * 900 * s, rot = ease(seg(k, 0.18, 0.8)) * Math.PI * 0.96;
  c.save(); c.fillStyle = '#1a0e0a'; c.beginPath(); c.ellipse(x, y + 16 * s, 760 * s * Math.min(1, k * 4), 70 * s * Math.min(1, k * 4), 0, 0, 6.283); c.fill(); // the pit left in the ground
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y + 16 * s, 600 * s, '#ff6a2a', 0.35 * Math.min(1, k * 3)); c.restore(); c.restore();
  c.save(); if (k > 0.5) { c.beginPath(); c.rect(-4000, -4000, 9000, y + 30 * s + 4000); c.clip(); }
  c.translate(x, y + 60 * s - lift); c.rotate(rot); c.translate(-x, -(y + 60 * s)); earthSlab(c, x, y + 12 * s, s); fn(); c.restore();
}
function cracks(c, x, y, s, k, seed = 3) { if (k <= 0) return; const r = rng(seed); c.save(); c.strokeStyle = `rgba(20,8,4,${0.7 * k})`; c.lineCap = 'round';
  for (let i = 0; i < 14; i++) { let px = x + (r() - 0.5) * 900 * s, py = y + r() * 60 * s; c.lineWidth = (2 + r() * 5) * s; c.beginPath(); c.moveTo(px, py);
    for (let j = 0; j < 5; j++) { px += (r() - 0.5) * 160 * s * k; py += r() * 50 * s * k; c.lineTo(px, py); } c.stroke(); }
  c.globalCompositeOperation = 'lighter'; glow(c, x, y + 20 * s, 700 * s, '#ff7a3a', 0.25 * k); c.restore(); }
// stones of baked clay (sijjil) raining in layers: glowing trails, dark stones, small flashes where they land
function stoneRain(c, t, x0, x1, y0, y1, k, seed = 7, n = 46, s = 1) { if (k <= 0) return; t += 100; const r = rng(seed);
  c.save(); c.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const on = r(), sp = 0.45 + r() * 0.4, off = r(), xs = x0 + r() * (x1 - x0), land = y1 + (r() - 0.5) * 120 * s, sz = (5 + r() * 7) * s;
    if (on > k) continue;
    const q = (t * sp + off) % 1, yy = lerp(y0, land, q), xx = xs + (yy - y0) * 0.22, L = 220 * s;
    c.globalCompositeOperation = 'lighter';
    const g = c.createLinearGradient(xx - L * 0.22, yy - L, xx, yy); g.addColorStop(0, 'rgba(255,140,60,0)'); g.addColorStop(1, `rgba(255,190,110,${0.55 * Math.min(1, k * 2)})`);
    c.strokeStyle = g; c.lineWidth = sz * 0.9; c.beginPath(); c.moveTo(xx - L * 0.22, yy - L); c.lineTo(xx, yy); c.stroke();
    glow(c, xx, yy, sz * 4, '#ffb060', 0.5);
    if (q > 0.9) glow(c, xx, land, 120 * s, '#ff9040', 0.5 * (1 - q) * 10 * 0.6);
    c.globalCompositeOperation = 'source-over'; c.fillStyle = '#3a2216'; c.beginPath(); c.ellipse(xx, yy, sz, sz * 0.8, 0.5, 0, 6.283); c.fill();
  }
  c.restore();
}
function emberGlow(c, x, y, r, a) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y, r, '#ff7030', 0.3 * a); glow(c, x, y - r * 0.2, r * 0.5, '#ffb070', 0.25 * a); c.restore(); }
function bigDust(c, t, x, y, s, k, seed = 9) { if (k <= 0) return; t += 100; const r = rng(seed); // a rolling cloud of dust over the place where the city stood
  for (let i = 0; i < 70; i++) { const u = r() * 2 - 1, R = (50 + r() * 120) * s * (0.6 + k), dx = u * 900 * s * (0.4 + 0.6 * k), dy = -r() * r() * 420 * s * k - ((t * (6 + 10 * r())) % 60) * s;
    const up = clamp(-dy / (420 * s)), col = up > 0.4 ? (r() > 0.5 ? '150,115,95' : '120,95,85') : (r() > 0.5 ? '80,56,48' : '58,40,36');
    const g = c.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, R); g.addColorStop(0, `rgba(${col},${0.5 * Math.min(1, k * 1.5) * (1 - Math.abs(u) * 0.5)})`); g.addColorStop(1, `rgba(${col},0)`);
    c.fillStyle = g; c.fillRect(x + dx - R, y + dy - R, R * 2, R * 2); } }

// 4) a torch carried in the hand (crowd at night)
function heldTorch(c, o, t, k = 0) { t += 100; const [hx, hy] = handOf(o), s = (o.h || 300) / 300, d = o.dir || 1;
  c.strokeStyle = '#3a2418'; c.lineWidth = 7 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx - d * 8 * s, hy + 36 * s); c.lineTo(hx + d * 10 * s, hy - 64 * s); c.stroke();
  const fx = hx + d * 11 * s, fy = hy - 70 * s;
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, fx, fy - 20 * s, 190 * s, '#ff8a3a', 0.4 + 0.08 * Math.sin(t * 9 + k)); c.restore();
  [['#ff7a2a', 13, 52], ['#ffb347', 8, 38], ['#ffe9a8', 4, 22]].forEach(([col, w, hh], j) => { c.fillStyle = col; c.beginPath(); c.moveTo(fx - w * s, fy);
    c.quadraticCurveTo(fx + (-w + Math.sin(t * 8 + k + j) * 5) * s, fy - hh * 0.6 * s, fx + Math.sin(t * 7 + k + j) * 7 * s, fy - (hh + Math.sin(t * 13 + k) * 6) * s); c.quadraticCurveTo(fx + w * s, fy - hh * 0.5 * s, fx + w * s, fy); c.fill(); });
}
// the guests (Hud 77): angels are never drawn — three columns of soft light only
function guests(c, x, y, h, t, k = 1, gap = 120) { for (let i = 0; i < 3; i++) angelLight(c, x + (i - 1) * gap, y + (i === 1 ? 6 : 0), h * (i === 1 ? 1.06 : 0.96), 0, 1, t, k, 70 + i); }

// 5) the night street: Lut's house in the foreground on the left, houses receding toward the vanishing point, flagstones
const VP = [720, 1200], DOOR = { x: 300, y: 1560 };
const sAt = y => clamp((y - VP[1]) / (1560 - VP[1]), 0.05, 2.4); // perspective scale for a foot line y
function lutHouse(c, x, y, s, t, o = {}) { // returns door rect; open 0..1 pours light out of the door
  const w = 600 * s, h = 620 * s, col = mix('#c8a882', '#3a3040', (o.night === undefined ? 1 : o.night) * 0.8);
  house(c, x, y, w, h, col, { lamp: o.lamp === undefined ? 0.7 : o.lamp, t: t + 100, doorOpen: (o.open || 0) > 0.02 });
  const dx = x - w * 0.18, dw = w * 0.2, dh = h * 0.55, op = o.open || 0;
  c.fillStyle = mix('#5a3a22', '#2a1a10', 0.3); c.fillRect(dx - dw * 0.5 - 30 * s, y - 14 * s, dw + 60 * s, 14 * s); // step
  if (op > 0.02) { c.save(); c.beginPath(); archPath(c, dx, y, dw, dh); c.clip();
    const g = c.createLinearGradient(0, y - dh, 0, y); g.addColorStop(0, `rgba(255,250,230,${op})`); g.addColorStop(1, `rgba(255,236,190,${op})`); c.fillStyle = g; c.fillRect(dx - dw, y - dh, dw * 2, dh); c.restore();
    c.save(); c.globalCompositeOperation = 'lighter'; glow(c, dx, y - dh * 0.5, dh * 1.6, '#fff0c8', 0.55 * op); c.restore(); }
  else if (o.leak) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,240,200,${0.8 * o.leak})`; c.lineWidth = 4 * s; c.beginPath(); archPath(c, dx, y, dw - 4 * s, dh - 4 * s); c.stroke();
    glow(c, dx, y - dh * 0.5, dh, '#fff0c8', 0.18 * o.leak); c.restore(); }
  lanternBox(c, dx + dw * 0.5 + 60 * s, y - dh - 20 * s, 1.1 * s, t, 3);
  return { x: dx, y, w: dw, h: dh };
}
function streetSet(c, t, o = {}) {
  const nt = o.night === undefined ? 1 : o.night;
  sky0(c, skyBlend({ sky: o.sky || 'night', to: o.to, k: o.k }));
  stars(c, t, 120, 27, [-400, -300, W + 800, 1000], 0.7 * nt);
  if (o.moon !== false) moon(c, 820, 380, 40, 0.9 * nt);
  wisps(c, t, 520, 4, '#c8c8e0', 0.06, 4, 3);
  // houses receding along the right side and the far left side (far first)
  const R = [[1260, 1510, 0.95], [1080, 1420, 0.72], [950, 1350, 0.55], [860, 1300, 0.42], [800, 1262, 0.32]], L = [[560, 1300, 0.42], [630, 1262, 0.32], [480, 1350, 0.55]];
  flagFloor(c, VP[1] + 40, VP[0], mix('#a08a6a', '#2a2630', nt * 0.75), { sheen: o.sheen || 0.12, sheenX: DOOR.x + 60, sheenCol: o.sheenCol || '#ffb870' });
  [...R, ...L].sort((a, b) => a[1] - b[1]).forEach(([x, y, s], i) => house(c, x, y, 360 * s, 420 * s, mix(mix('#c4a07a', '#a88a6a', (i % 3) * 0.3), '#2a2632', nt * 0.75), { lamp: (o.lamps === undefined ? 0.6 : o.lamps) * (i % 2 ? 1 : 0.4), t: t + 100 + i }));
  if (o.torches !== false) [[1000, 1440, 0.55], [1170, 1560, 0.8]].forEach(([x, y, s], i) => torch(c, x, y, t, i, s));
  if (o.behindDoor) o.behindDoor(c);
  return lutHouse(c, DOOR.x, DOOR.y, 1, t, { night: nt, open: o.open || 0, leak: o.leak || 0, lamp: 0.75 });
}
// the crowd coming down the street toward the door: each one walks along a lane from the far end to a stop point, feet driven by distance
const MOB = [ // [lane x offset at the far end, stop x, stop y, delay, speed, folk]
  [40, 680, 1600, 0.0, 120, 0], [90, 810, 1570, 0.3, 110, 1], [10, 900, 1640, 0.6, 130, 2], [120, 1010, 1590, 0.2, 105, 3], [60, 760, 1690, 0.9, 125, 4],
  [150, 1100, 1660, 0.5, 115, 5], [30, 950, 1730, 1.2, 120, 6], [100, 1160, 1560, 1.0, 110, 7], [70, 1040, 1480, 0.4, 100, 1], [130, 870, 1470, 0.8, 120, 0],
  [20, 940, 1410, 0.1, 95, 2], [110, 1080, 1400, 0.7, 100, 4],
];
function mobAt(m, q) { const [lx, sx, sy] = m, x0 = 820 + lx * 0.4, y0 = 1270; return [lerp(x0, sx, q), lerp(y0, sy, q)]; }
function drawMob(c, t, k, o = {}) { // k: seconds since they started; recoil: blinded, stepping back, arms up to shield
  const list = MOB.map((m, i) => { const [, sx, sy, del, sp] = m, len = Math.hypot(sx - 820, sy - 1270), dist = clamp((k - del) * sp, 0, len), q = len ? dist / len : 1;
    const [x, y] = mobAt(m, q); return { i, m, x, y, dist, q }; }).filter(p => p.q > 0 || (o.all)).sort((a, b) => a.y - b.y);
  list.forEach(p => { const h = 340 * Math.min(1.25, sAt(p.y)) * (0.9 + (p.i % 3) * 0.06), who = SODOM[p.m[5] % SODOM.length], rec = o.recoil || 0;
    const fo = { x: p.x + rec * 30 * sAt(p.y), y: p.y, h, dir: -1, light: o.light || 0.75, t: t + p.i, wind: 0.25, walk: p.q < 1 ? stepOf(p.dist, h) + p.i * 0.3 : null,
      armUp: rec > 0 ? lerp(0.45, 0.6, rec) : (p.i % 3 === 0 ? 0.45 : 0), reach: rec > 0 ? 0 : (o.reach && p.i % 3 === 1 ? o.reach : 0) };
    lean(c, fo.x, fo.y, rec * 0.2 + (o.laugh ? Math.sin(t * 6 + p.i) * 0.04 * o.laugh + 0.06 * o.laugh : 0), () => { fig(c, who, fo); if (p.i % 3 === 0 && !(rec > 0.5 && p.i % 2)) heldTorch(c, fo, t, p.i); });
    if (rec > 0.5 && p.i % 3 === 0 && p.i % 2) torch(c, p.x - 60 * sAt(p.y), p.y + 6, t, p.i, 0.35 * sAt(p.y)); }); // a dropped torch
}

function roofTop(c, t) { // the flat roof of Lut's house at night: beaten clay, a low mud-brick parapet, an oil lamp, a jar
  const g = c.createLinearGradient(0, 1600, 0, H + 200); g.addColorStop(0, '#4a4048'); g.addColorStop(1, '#1a161e'); c.fillStyle = g; c.fillRect(-600, 1600, W + 1200, 900);
  c.fillStyle = '#3a3240'; c.fillRect(-600, 1560, W + 1200, 46); c.fillStyle = '#5a5060'; c.fillRect(-600, 1556, W + 1200, 8);
  c.strokeStyle = 'rgba(10,8,14,0.4)'; c.lineWidth = 2; for (let x = -600; x < W + 600; x += 44) { c.beginPath(); c.moveTo(x, 1566); c.lineTo(x, 1584); c.moveTo(x + 22, 1584); c.lineTo(x + 22, 1604); c.stroke(); }
  c.beginPath(); c.moveTo(-600, 1584); c.lineTo(W + 600, 1584); c.stroke();
  const r = rng(5); for (let i = 0; i < 40; i++) { c.fillStyle = hexA(r() > 0.5 ? '#2a2430' : '#5a5060', 0.4); c.beginPath(); c.ellipse(-300 + r() * (W + 600), 1620 + r() * 300, 10 + r() * 30, 3 + r() * 5, 0, 0, 6.283); c.fill(); }
  oilLamp(c, 820, 1560, 1.2, 1, t);
  c.fillStyle = '#5a2a22'; c.beginPath(); c.moveTo(250, 1705); c.lineTo(610, 1705); c.lineTo(650, 1765); c.lineTo(210, 1765); c.closePath(); c.fill(); c.strokeStyle = '#c9a35a'; c.lineWidth = 3; c.stroke();
}
// 6) the town square / assembly at dusk (sin, call, mock)
function squareSet(c, t, o = {}) {
  const fy = o.fy || 1300, dusk = o.dusk === undefined ? 0.5 : o.dusk;
  sky0(c, skyBlend({ sky: 'gold', to: 'dusk', k: dusk }));
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 300, fy - 300, 520, '#ffb070', 0.3); c.restore(); sun(c, 300, fy - 330, 40, '#ffc890', 0.8 * (1 - dusk * 0.5));
  par(c, 0.1, o.px || 0, 0, () => { ridgeW(c, fy - 260, 160, 0.0018, 71, mix('#a07a8a', '#5a4058', dusk)); hazeW(c, fy - 220, 240, '#f2c8a8', 0.55); });
  par(c, 0.3, o.px || 0, 0, () => { sodomCity(c, t, 540, fy - 40, 0.62, { lamp: 0.4 * dusk, seed: 5 }); hazeW(c, fy - 30, 120, '#f2c8a8', 0.25); });
  par(c, 0.6, o.px || 0, 0, () => { [[-300, 0.9], [60, 1.0], [1000, 0.95], [1380, 0.85]].forEach(([x, s], i) => house(c, x, fy + 20, 360 * s, 380 * s, mix('#c4a07a', '#7a5a4a', dusk * 0.5 + (i % 2) * 0.1), { lamp: 0.5 * dusk, t: t + 100 + i }));
    [[200, 1.2], [880, 1.1]].forEach(([x, s], i) => datePalm(c, x, fy + 30, s * 0.8, '#3a4a24', t + i, 80 + i)); });
  flagFloor(c, fy + 20, 540, mix('#b89a72', '#6a5040', dusk * 0.5), { sheen: 0.12, sheenX: 300 });
}

// 7) the hero shot (hook / dawn / cta / outro / cover): at dawn, from the heights above the valley; below, the city is lifted and turned
//    over under a rain of stones; in the foreground Lut and his daughters walk away to the left and never look back.
//    T is continuous; dist drives the walk (feet driven by the distance walked).
const FAM = [[LUT, 0, 400], [DAUG[0], 150, 330], [DAUG[1], 265, 320]];
const fgY = x => ridgeY(x, 1660, 46, 0.0042, 31);
function family(c, T, lx, o = {}) { // Lut leads (leftmost), the daughters follow; all face left (dir -1)
  FAM.slice().reverse().forEach(([who, dx, h], j) => { const x = lx + dx, walking = o.walk !== false;
    fig(c, who, { x, y: fgY(x) + 6, h: h * (o.hs || 1), dir: -1, light: o.light || 0.95, t: T + j, wind: 0.45, walk: walking ? stepOf(o.dist || 0, h * (o.hs || 1)) + j * 0.31 : null, staff: who === LUT, veilGlow: 0.45 }); });
}
function lutHero(c, T, o = {}) {
  const kz = o.kz || 0, fo = o.focus || 0, flip = o.flip === undefined ? 0.4 : o.flip, rain = o.rain === undefined ? 1 : o.rain, dist = o.dist === undefined ? T * 24 : o.dist;
  cam(c, lerp(1.0, 1.08, kz) + 0.16 * fo + 0.004 * Math.sin(T * 0.3), lerp(560, 470, fo), lerp(1180, 1330, fo), ...(o.shake ? shake(T, o.shake, 14) : [0, 0]));
  const CX = 700, CY = 1300, CS = 0.55;
  valleyLand(c, T, { fy: 1240, sky: 'ember', to: 'dawn', k: 0.25, sunX: 860, sunY: 980, sunA: 0.75, seed: 11, glint: true, clear: [CX, 520],
    mid: cc => { cracks(cc, CX, CY + 10, CS, seg(flip, 0.1, 0.5)); overturn(cc, CX, CY, CS, flip, () => sodomCity(cc, T, CX, CY, CS, { lamp: 0.2, seed: 17 }));
      bigDust(cc, T, CX, CY + 10, CS * 1.4, seg(flip, 0.3, 0.9)); emberGlow(cc, CX, CY - 60, 700, 0.6 + 0.4 * seg(flip, 0.2, 0.8)); } });
  stoneRain(c, T, 120, 1100, -200, CY + 10, rain, 7, 46, 0.9);
  c.fillStyle = 'rgba(40,14,10,0.18)'; c.fillRect(-600, -600, W + 1200, H + 1200);
  fgRidge(c, 1660, 46, 0.0042, 31, '#7a5a48', { rim: 'rgba(255,190,140,0.55)', shade: 0.3 });
  family(c, T, 360 - dist, { dist, walk: o.walk });
  blurLayer(c, 10, cc => { fgStones(cc, -40, 2010, 1.6, '#5a4038', 3); fgStones(cc, 1080, 2030, 1.4, '#5a4038', 5); }, 2);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// 8) a high desert road (Ibrahim and Lut together), golden light
function goldRoad(c, t, o = {}) {
  canaanLand(c, t, { fy: 1280, sky: 'gold', sunX: 260, sunY: 980, px: o.px || 0, seed: 21, dry: 0.6 });
  c.fillStyle = 'rgba(255,236,200,0.25)'; c.beginPath(); c.moveTo(560, 1282); c.quadraticCurveTo(640, 1500, 360, 1700); c.quadraticCurveTo(200, 1860, 260, H + 200); c.lineTo(860, H + 200); c.quadraticCurveTo(720, 1760, 760, 1600); c.quadraticCurveTo(700, 1400, 610, 1282); c.closePath(); c.fill();
}
function bigLine(c, txt, y, a, size = 64, col = '#fff6e0') { textGlow(c, txt, W / 2, y, `700 ${size}px Lora`, col, a, '#000', 18); }
function arabic(c, txt, y, a, size = 84) { if (a <= 0) return; c.save(); c.direction = 'rtl'; textGlow(c, txt, W / 2, y, `700 ${size}px Amiri`, '#f6c453', a, '#ffb300', 28); c.restore(); }

// =====================================================================================================================
// ---------- episode 18: Yahya
const YAHA = { veilGlow: 0.5, prophet: true, robe: '#efe9dc', wrap: '#f8f5ee', skin: '#c49470', trim: '#d8bf80', band: '#c9a35a', inner: '#fcfaf4' }; // Yahya as a man
const YAHC = Object.assign({}, YAHA, { child: true, veilGlow: 0.45 }); // Yahya as a boy
const ZAKO = Object.assign({}, ZAK, { robe: '#e4ddcc' }); // Zakariya, an old man (staff)
const MOTH = Object.assign({}, ISH); // his mother (Elisabeth / Ishaʿ in the tradition, never named in the Qur'an)
const FOE18 = { robe: '#2e2a2c', wrap: '#3a3438', skin: '#5a4034', trim: '#6a5a4a', band: '#4a3a2a', inner: '#4a4440' };
function village18(c, t, o = {}) { const dk = o.dusk === undefined ? 0.4 : o.dusk;
  sky0(c, skyBlend({ sky: 'gold', to: 'dusk', k: dk })); c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 820, 700, 600, '#ffc880', 0.3); c.restore(); sun(c, 820, 720, 40, '#ffd8a0', 0.8 * (1 - dk * 0.5));
  wisps(c, t, 380, 5, '#fff2dc', 0.12, 19, 4); village(c, t, o); }
function rehal(c, x, y, s) { // a low folding wooden book stand (X-shaped), an open book on it
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(0, 2, 60, 8, 0, 0, 6.283); c.fill();
  c.strokeStyle = '#6a4222'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(-40, 0); c.lineTo(30, -66); c.moveTo(40, 0); c.lineTo(-30, -66); c.stroke();
  c.strokeStyle = '#8a5a30'; c.lineWidth = 3; c.beginPath(); c.moveTo(-36, -4); c.lineTo(28, -62); c.stroke();
  c.fillStyle = '#5a2a1a'; c.beginPath(); c.moveTo(-52, -66); c.lineTo(0, -54); c.lineTo(52, -66); c.lineTo(50, -58); c.lineTo(0, -46); c.lineTo(-50, -58); c.closePath(); c.fill();
  c.fillStyle = '#f2e6c8'; c.beginPath(); c.moveTo(-48, -72); c.quadraticCurveTo(-24, -80, 0, -60); c.quadraticCurveTo(24, -80, 48, -72); c.lineTo(46, -64); c.quadraticCurveTo(24, -70, 0, -54); c.quadraticCurveTo(-24, -70, -46, -64); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(90,60,30,0.45)'; c.lineWidth = 1.5; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(-40, -68 + k * 3); c.lineTo(-10, -64 + k * 3); c.moveTo(10, -64 + k * 3); c.lineTo(40, -68 + k * 3); c.stroke(); }
  c.restore(); }
function seriesTag18(c, a) { seriesTag(c, a, 18); }
const TFY = 1300, TTOP = TFY - 760;

// five medallions: the five commandments (n lit, the last one pulsing)
function fiveDots(c, n, a, y = 640, t = 0) {
  if (a <= 0) return;
  const LBL = ['ALLAH SEUL', 'LA PRIÈRE', 'LE JEÛNE', "L'AUMÔNE", 'LE RAPPEL'];
  for (let i = 0; i < 5; i++) { const x = 540 + (i - 2) * 150, on = i < n, cur = i === n - 1;
    c.save(); c.globalAlpha = a;
    if (on) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y, 90, '#ffc860', (cur ? 0.45 + 0.15 * Math.sin(t * 4) : 0.25)); c.restore(); }
    c.fillStyle = on ? '#f6c453' : 'rgba(10,8,14,0.55)'; c.beginPath(); c.arc(x, y, 40, 0, 6.283); c.fill();
    c.strokeStyle = on ? '#fff0c0' : 'rgba(246,196,83,0.8)'; c.lineWidth = 4; c.stroke();
    c.font = '700 44px Lora'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = on ? '#2a1a08' : '#f6c453'; c.fillText(String(i + 1), x, y + 2);
    c.restore();
  }
}

// people sitting on the top of the courtyard wall (the hadith: "they sat on the terraces")
const WALLSIT = (() => { const r = rng(181), L = []; for (let x = -620; x < 1720; x += 44 + r() * 30) L.push([x, 0.85 + r() * 0.3, Math.floor(r() * 9), r() > 0.5 ? 1 : -1, r() > 0.75]); return L; })();
// seated crowd in the courtyard: rows in perspective, an aisle in the middle toward the door
const hS = y => 150 + (y - 1350) * 0.78;
const SEATED = (() => { const r = rng(182), L = [];
  [1395, 1450, 1520, 1600, 1700, 1820].forEach((y, row) => { const h = hS(y), aisle = 70 + (y - 1300) * 0.55, step = h * 0.58;
    for (let x = -500 + (row % 2) * step * 0.5; x < 1580; x += step * (0.9 + r() * 0.2)) { if (Math.abs(x - 540) < aisle) continue;
      L.push({ x, y: y + (r() - 0.5) * 12, h: h * (0.92 + r() * 0.14), dir: x < 540 ? 1 : -1, f: Math.floor(r() * 9), row, ph: r() * 6 }); } });
  return L; })();
const STANDERS = [[-120, 1340, 1], [10, 1336, 1], [130, 1344, 1], [960, 1342, -1], [1080, 1336, -1], [1200, 1344, -1], [250, 1330, 1], [830, 1332, -1]];

function wallCrowd(c, t, a = 1) {
  WALLSIT.forEach(([x, s, f, d, stand], i) => { const h = 64 * s;
    if (stand) fig(c, FOLK[f], { x, y: TTOP - 38, h: h * 1.05, dir: d, light: 0.85, t: t + i, wind: 0.3, ink: 0.5, alpha: a, shadow: false });
    else fig(c, FOLK[f], { x, y: TTOP - 38, h, dir: d, pose: 'sit', light: 0.85, t: t + i, wind: 0.2, ink: 0.5, alpha: a, shadow: false }); });
}
function seatedCrowd(c, t, o = {}) { // rows behind the cut (near rows are blurred separately)
  const lo = o.lo || 0, hi = o.hi === undefined ? 99 : o.hi;
  SEATED.filter(p => p.row >= lo && p.row <= hi).forEach((p, i) => fig(c, FOLK[p.f], { x: p.x, y: p.y, h: p.h, dir: p.dir, pose: 'sit', light: o.light || 0.85, t: t + p.ph, wind: 0.15,
    dua: o.dua && (i % 3 === 0), ink: p.row > 3 ? 0.8 : 0.6 }));
}
// the hero picture: the Temple of Jerusalem, its courtyard filled, people sitting up on the walls, Yahya on the steps in the light
function yahHero(c, T, o = {}) {
  const z = o.z || 1, cx = o.cx || 540, cy = o.cy || 1180, dusk = o.dusk || 0;
  cam(c, z + 0.004 * Math.sin(T * 0.3), cx, cy, ...(o.shake ? shake(T, o.shake, 12) : [0, 0]));
  sky0(c, skyBlend({ sky: 'gold', to: o.to || 'dusk', k: dusk }));
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 180, 420, 620, '#ffc880', 0.35); c.restore(); sun(c, 180, 430, 40, '#ffd8a0', 0.8);
  wisps(c, T, 300, 5, '#fff2dc', 0.14, 18, 4);
  hillsBehind(c, T, TTOP + 30, { far: '#8a7a90', mid: '#6a5a62', haze: '#f2c8a0', tree: '#3a3a30' });
  templeFacade(c, T, { fy: TFY, doorX: 540, glow: o.glow === undefined ? 0.85 : o.glow, windows: 0.6 });
  wallCrowd(c, T, o.wall === undefined ? 1 : o.wall);
  STANDERS.forEach(([x, y, d], i) => fig(c, FOLK[(i + 3) % 9], { x, y, h: 190, dir: d, light: 0.8, t: T + i, wind: 0.2, ink: 0.7 }));
  flagFloor(c, TFY + 60, 540, '#b89a72', { sheen: 0.25, sheenX: 540, sheenCol: '#ffd8a0' }); // the floor below the steps
  for (let k = 0; k < 3; k++) { const w = 440 + k * 70; c.fillStyle = mix(STONE, '#fff2dc', 0.18 - k * 0.05); c.fillRect(540 - w / 2, TFY + k * 20, w, 20); c.fillStyle = hexA('#1a0c06', 0.25); c.fillRect(540 - w / 2, TFY + k * 20 + 16, w, 4); }
  const lk = o.light === undefined ? 1 : o.light;
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, TFY - 200, 520, '#fff0c8', 0.28 * lk); c.restore();
  rays(c, 540, TFY - 330, Math.PI / 2, 2.6, 1300, 16, '#fff2d0', 0.05 * lk, T, 31);
  fig(c, YAHA, { x: 540, y: TFY + 2, h: 300, dir: o.dir || -1, light: 1.1, t: T, wind: 0.25, armUp: o.arm || 0, reach: o.reach || 0, veilGlow: 0.45 });
  seatedCrowd(c, T, { hi: 3, dua: o.dua });
  blurLayer(c, 5, cc => seatedCrowd(cc, T, { lo: 4, light: 0.75 }), 2);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// crowd entering the courtyard from the edges (temple scene): rows walking toward the middle, feet driven by distance
function streamIn(c, t, k) {
  [[1440, 220, 1, 0], [1440, 220, -1, 0.4], [1560, 300, 1, 0.8], [1560, 300, -1, 0.2], [1700, 400, 1, 0.5], [1700, 400, -1, 1.0]].forEach(([y, h, d, del], row) => {
    for (let i = 0; i < 6; i++) { const dist = Math.max(0, (k - del - i * 0.55) * 95), x0 = d > 0 ? -140 - i * 10 : W + 140 + i * 10, x = x0 + d * dist;
      if (dist <= 0 || (d > 0 ? x > 470 - (y - 1400) * 0.3 : x < 610 + (y - 1400) * 0.3)) continue;
      const who = Object.assign({}, FOLK[(i * 3 + row) % 9], i % 5 === 3 ? { child: true } : {});
      fig(c, who, { x, y: y + i * 6, h, dir: d, walk: stepOf(dist, h) + i * 0.3, light: 0.85, t: t + i, wind: 0.3, ink: 0.8 }); } });
}

// a small cloth pouch of musk, tied at the neck (held in a hand)
function muskPouch(c, x, y, s, t, k = 0) {
  if (k > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y, 120 * s, '#ffd890', 0.45 * k * (0.9 + 0.1 * Math.sin(t * 3))); c.restore(); }
  c.save(); c.translate(x, y); c.scale(s, s);
  const g = c.createRadialGradient(-6, 6, 2, 0, 10, 30); g.addColorStop(0, '#c89a5a'); g.addColorStop(1, '#6a4422');
  c.fillStyle = g; c.beginPath(); c.moveTo(-8, -10); c.quadraticCurveTo(-30, 4, -24, 24); c.quadraticCurveTo(0, 38, 24, 24); c.quadraticCurveTo(30, 4, 8, -10); c.closePath(); c.fill();
  c.fillStyle = '#7a5230'; c.beginPath(); c.moveTo(-8, -10); c.lineTo(-14, -24); c.lineTo(0, -18); c.lineTo(14, -24); c.lineTo(8, -10); c.closePath(); c.fill();
  c.strokeStyle = '#c9a35a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-10, -10); c.lineTo(10, -10); c.stroke();
  c.strokeStyle = 'rgba(40,20,8,0.35)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-14, 2); c.quadraticCurveTo(-8, 14, -12, 26); c.moveTo(6, 0); c.quadraticCurveTo(12, 14, 8, 28); c.stroke();
  c.restore();
}
// a rope: from (ax, ay) to (bx, by) with a sag; or lying on the ground when slack (k = 1)
function rope(c, ax, ay, bx, by, sag, s = 1) {
  c.strokeStyle = '#8a6a3a'; c.lineWidth = 4 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo((ax + bx) / 2, Math.max(ay, by) + sag, bx, by); c.stroke();
  c.strokeStyle = 'rgba(40,24,8,0.4)'; c.lineWidth = 1.5 * s; c.setLineDash([5 * s, 6 * s]); c.stroke(); c.setLineDash([]);
}
function ropeCoil(c, x, y, s) { c.strokeStyle = '#8a6a3a'; c.lineWidth = 4 * s; for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(x + k * 6 * s, y - k * 2 * s, (26 - k * 4) * s, (8 - k) * s, 0.1, 0, 6.283); c.stroke(); } }
function farHand(o) { const s = (o.h || 300) / 300, d = o.dir || 1; return [o.x - d * 46 * s, o.y - 114 * s]; }

// a fortress on the plain: ashlar walls, two round towers, crenellations, a gate whose doors close (o.close 0..1)
function fortress(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const col = o.col || '#c8a87e', dk = mix(col, '#1a0c06', 0.45);
  c.fillStyle = 'rgba(10,6,4,0.25)'; c.beginPath(); c.ellipse(0, 6, 620, 30, 0, 0, 6.283); c.fill();
  ashlar(c, -380, -440, 380, 0, col, 41);
  for (let xx = -380; xx < 380; xx += 56) { c.fillStyle = mix(col, '#1a0c06', 0.15); c.fillRect(xx, -484, 32, 46); c.fillStyle = hexA('#fff2dc', 0.2); c.fillRect(xx, -484, 32, 5); }
  [-430, 430].forEach(tx => { const g = c.createLinearGradient(tx - 110, 0, tx + 110, 0); g.addColorStop(0, dk); g.addColorStop(0.4, mix(col, '#fff2dc', 0.2)); g.addColorStop(1, dk);
    c.fillStyle = g; c.fillRect(tx - 110, -600, 220, 600);
    c.strokeStyle = hexA(dk, 0.35); c.lineWidth = 2; for (let yy = -46; yy > -600; yy -= 46) { c.beginPath(); c.moveTo(tx - 110, yy); c.lineTo(tx + 110, yy); c.stroke(); }
    for (let k = 0; k < 4; k++) { c.fillStyle = mix(col, '#1a0c06', 0.2); c.fillRect(tx - 110 + k * 60, -644, 40, 46); }
    c.fillStyle = '#2a1608'; c.beginPath(); archPath(c, tx, -380, 26, 70); c.fill(); });
  const gw = 200, gh = 300;
  c.fillStyle = '#ffe2a8'; c.beginPath(); archPath(c, 0, 0, gw, gh); c.fill(); // light inside
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -120, 260, '#ffd890', 0.4 * (1 - (o.close || 0) * 0.6)); c.restore();
  const cl = o.close || 0; c.save(); c.beginPath(); archPath(c, 0, 0, gw, gh); c.clip();
  [-1, 1].forEach(sd => { const w = gw / 2 * cl; c.fillStyle = '#5a3a20'; c.fillRect(sd < 0 ? -gw / 2 : gw / 2 - w, -gh, w, gh);
    c.strokeStyle = '#2a1608'; c.lineWidth = 3; for (let k = 1; k < 4; k++) { const xx = sd < 0 ? -gw / 2 + w * k / 4 : gw / 2 - w * k / 4; c.beginPath(); c.moveTo(xx, -gh); c.lineTo(xx, 0); c.stroke(); }
    c.fillStyle = '#3a2412'; c.fillRect(sd < 0 ? -gw / 2 : gw / 2 - w, -gh * 0.62, w, 10); c.fillRect(sd < 0 ? -gw / 2 : gw / 2 - w, -gh * 0.22, w, 10); });
  c.restore();
  c.strokeStyle = mix(col, '#fff2dc', 0.3); c.lineWidth = 10; c.beginPath(); archPath(c, 0, 0, gw + 24, gh + 20); c.stroke();
  if (o.flag !== false) flag(c, 430, -644, 1, t, '#7a2a22', 1);
  c.restore();
}
function runnerSet(c, t, px, o = {}) { // the open plain at dusk, scrolling (px: travel), fortress far right
  const fy = 1240;
  sky0(c, skyBlend({ sky: 'gold', to: 'dusk', k: o.dusk || 0.55 }));
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 860, fy - 300, 600, '#ffb070', 0.35); c.restore(); sun(c, 860, fy - 320, 44, '#ffc890', 0.85);
  par(c, 0.08, px, 0, () => { ridgeW(c, fy - 220, 150, 0.002, 81, '#8a6a7a'); hazeW(c, fy - 180, 220, '#f2b890', 0.55); });
  par(c, 0.25, px, 0, () => { ridgeW(c, fy - 90, 70, 0.0035, 82, '#7a5a5a'); hazeW(c, fy - 60, 140, '#f2b890', 0.4);
    if (o.fort) fortress(c, o.fort[0], fy - 40, o.fort[1], t, { close: o.close || 0 }); });
  par(c, 1, px, 0, () => { plain(c, fy, t, { col: '#a07a52', seed: 83, n: 220 });
    c.fillStyle = 'rgba(255,230,190,0.16)'; c.fillRect(-4000, 1560, 12000, 90); });
}


// =====================================================================================================================
// ---------- episode 19: Harun
const MOU = { veilGlow: 0.5, prophet: true, robe: '#ebe5d6', wrap: '#f7f3ea', skin: '#c49470', trim: '#cfae6a', band: '#b8954a', inner: '#fbf8f0' }; // Moussa
const HAR = { veilGlow: 0.5, prophet: true, robe: '#f3efe6', wrap: '#fbf8f0', skin: '#c49470', trim: '#9fb4cc', band: '#7f96b4', inner: '#fcfaf4' }; // Harun (blue-grey trim)
const SAMIRI = { robe: '#2a2226', wrap: '#3a3034', skin: '#6a4a3a', trim: '#8a6a3a', band: '#5a4a30', inner: '#4a4040' };
const PHARAOH19 = { robe: '#f0e6cc', wrap: '#e0b85a', skin: '#a8714f', trim: '#e0b85a', band: '#2a4a8a', inner: '#f6efdc', hood: false };
const TRIBE = [FOLK[0], FOLK[1], FOLK[2], FOLK[3], FOLK[4], FOLK[5], FOLK[6], FOLK[7], FOLK[8],
  { agal: false, robe: '#4a3a5a', wrap: '#e6dccb', skin: '#b07a58', trim: '#b8a070', covered: true, inner: '#ece2d0' },
  { agal: false, robe: '#5a3a2e', wrap: '#e0d2bc', skin: '#9a6a4c', trim: '#b89a62', covered: true, inner: '#ece2d0' }];
const LAPIS = '#2a4a8a';
function nemes(c, o) {
  const [hx, hy, r] = headOf(o), d = o.dir || 1;
  c.save(); c.translate(hx, hy); c.scale(d, 1);
  c.fillStyle = GOLD; c.beginPath(); c.ellipse(0, r * 2.15, r * 1.75, r * 0.85, 0, 0, Math.PI); c.fill(); // broad collar
  c.strokeStyle = LAPIS; c.lineWidth = r * 0.16; for (let k = 1; k < 4; k++) { c.beginPath(); c.ellipse(0, r * 2.15, r * 1.75 * k / 3.6, r * 0.85 * k / 3.6, 0, 0.15, Math.PI - 0.15); c.stroke(); }
  const g = c.createLinearGradient(-r * 1.8, 0, r * 1.6, 0); g.addColorStop(0, '#9a7420'); g.addColorStop(0.55, '#f0cc6a'); g.addColorStop(1, '#a8801e');
  c.fillStyle = g; c.beginPath();
  c.moveTo(-r * 0.95, -r * 0.3); c.quadraticCurveTo(-r * 1.0, -r * 1.35, 0, -r * 1.35); c.quadraticCurveTo(r * 1.0, -r * 1.3, r * 0.95, -r * 0.3);
  c.lineTo(r * 1.15, r * 0.4); c.lineTo(r * 1.05, r * 2.6); c.lineTo(r * 0.5, r * 2.6); c.lineTo(r * 0.62, r * 0.55);
  c.lineTo(-r * 0.7, r * 0.55); c.lineTo(-r * 1.25, r * 2.3); c.lineTo(-r * 1.85, r * 1.5); c.lineTo(-r * 1.45, r * 0.2); c.closePath(); c.fill();
  c.save(); c.clip(); c.fillStyle = 'rgba(28,48,110,0.8)'; for (let k = -6; k < 10; k++) c.fillRect(-r * 2.2, -r * 1.4 + k * r * 0.4, r * 4.4, r * 0.17); c.restore();
  c.fillStyle = '#f8dc8a'; c.fillRect(-r * 0.98, -r * 0.5, r * 1.95, r * 0.2); // brow band
  c.beginPath(); c.ellipse(r * 0.8, -r * 0.72, r * 0.12, r * 0.3, 0.25, 0, 6.283); c.fill(); // uraeus
  c.restore();
}
const SKY19 = {
  dusk: [[0, '#1e1a3a'], [0.22, '#5a2c48'], [0.38, '#c8603e'], [0.5, '#f2a060']],
  night: [[0, '#04060f'], [0.22, '#0a1026'], [0.38, '#18203e'], [0.5, '#2e2c4a']],
  dawn: [[0, '#24345e'], [0.22, '#6a6a92'], [0.38, '#e0a890'], [0.5, '#f8d6a8']],
  day: [[0, '#4f7fb4'], [0.22, '#7aa2c8'], [0.38, '#b8d0e0'], [0.5, '#f0dcbc']],
  storm: [[0, '#140e14'], [0.22, '#3a1e22'], [0.38, '#7a3a2a'], [0.5, '#b0603a']],
};
function sky19(c, a, b, k = 0) { let st = SKY19[a]; if (b) st = st.map((s, i) => [s[0], mix(s[1], SKY19[b][i][1], k)]); sky0(c, st); }
function seriesTag19(c, a) { seriesTag(c, a, 19); }
function nameTag(c, txt, x, y, a, sub) { if (a <= 0) return; textGlow(c, txt, x, y, '700 38px Lora', '#f6c453', a, '#000', 14); if (sub) textGlow(c, sub, x, y + 44, 'italic 500 28px Lora', '#fff3dc', a * 0.9, '#000', 10); }

// Mount Tur (Sinai): a tall jagged massif of red granite; summit light (no form) and a ring of cloud
function turMount(c, x, y, s, t, o = {}) {
  const n = 120, w = 1700 * s, H0 = 900 * s, pts = [], col = o.col || '#6e4438';
  const pk = (q, c0, wd, hh) => hh * Math.pow(Math.max(0, 1 - Math.abs(q - c0) / wd), 1.15);
  for (let i = 0; i <= n; i++) { const q = i / n, env = Math.max(pk(q, 0.5, 0.5, 1), pk(q, 0.36, 0.2, 0.78), pk(q, 0.66, 0.24, 0.7), pk(q, 0.2, 0.2, 0.42), pk(q, 0.84, 0.18, 0.4));
    const v = env * H0 * (0.86 + 0.14 * noise1(q * 9, 191)) + (noise1(q * 60, 192) - 0.5) * 60 * s * Math.sqrt(env) + (noise1(q * 4, 193) - 0.5) * 50 * s * (1 - env);
    pts.push([x - w / 2 + q * w, y - Math.max(0, v)]); }
  const path = () => { c.beginPath(); c.moveTo(x - w / 2, y + 400); pts.forEach(p => c.lineTo(p[0], p[1])); c.lineTo(x + w / 2, y + 400); c.closePath(); };
  const lt = mix(col, o.litCol || '#ffc8a0', 0.3 * (o.light === undefined ? 1 : o.light)), dk = mix(col, '#0a0408', 0.5);
  const g = c.createLinearGradient(x - w * 0.3, 0, x + w * 0.35, 0); g.addColorStop(0, lt); g.addColorStop(0.5, col); g.addColorStop(1, dk);
  path(); c.fillStyle = g; c.fill();
  c.save(); path(); c.clip();
  const r = rng(194); c.lineCap = 'round';
  for (let i = 0; i < 60; i++) { const q = 0.1 + r() * 0.8, p = pts[Math.round(q * n)], len = (200 + r() * 600) * s, dx = (q - 0.5) * 300 * s * r();
    c.strokeStyle = hexA(r() > 0.3 ? dk : lt, 0.16 + r() * 0.16); c.lineWidth = (2 + r() * 7) * s;
    c.beginPath(); c.moveTo(p[0], p[1] + 8); c.bezierCurveTo(p[0] + dx * 0.3, p[1] + len * 0.35, p[0] + dx * 0.8, p[1] + len * 0.7, p[0] + dx, p[1] + len); c.stroke(); }
  for (let i = 0; i < 120; i++) { const q = r(), p = pts[Math.round(q * n)], by = p[1] + 30 + r() * 700 * s, bx = p[0] + (r() - 0.5) * 40, bw = (6 + r() * 20) * s;
    c.fillStyle = hexA(r() > 0.5 ? lt : dk, 0.18); c.beginPath(); c.moveTo(bx - bw, by); c.lineTo(bx - bw * 0.2, by - bw * 0.8); c.lineTo(bx + bw, by - bw * 0.2); c.lineTo(bx + bw * 0.5, by + bw * 0.3); c.closePath(); c.fill(); }
  const vg = c.createLinearGradient(0, y - H0, 0, y + 100); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, hexA(o.haze || '#f0a878', 0.5)); c.fillStyle = vg; c.fillRect(x - w / 2, y - H0 - 50, w, H0 + 500);
  c.restore();
  c.strokeStyle = hexA(lt, 0.6); c.lineWidth = 3 * s; c.beginPath(); for (let i = 0; i <= n * 0.52; i++) { const p = pts[i]; i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); } c.stroke();
  let top = pts[0]; pts.forEach(p => { if (p[1] < top[1]) top = p; });
  const L = o.glow || 0;
  if (L > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, top[0], top[1] - 20, 420 * s + 120, '#fff2d0', 0.45 * L); glow(c, top[0], top[1], 140 * s + 40, '#ffffff', 0.5 * L);
    for (let j = 1; j < 5; j++) glow(c, top[0], top[1] - j * 150 * s, (160 - j * 18) * s + 40, '#fff6e0', 0.12 * L * (1 - j / 5)); c.restore(); }
  if (o.cloud) { const cr = rng(195); for (let i = 0; i < 9; i++) { const cx = top[0] + (cr() - 0.5) * 520 * s + Math.sin(t * 0.2 + i) * 20 * s, cy = top[1] + (40 + cr() * 140) * s, rw = (140 + cr() * 140) * s;
      const cg = c.createRadialGradient(cx, cy, 0, cx, cy, rw); cg.addColorStop(0, hexA(o.cloudCol || '#f6e2d0', 0.55 * o.cloud)); cg.addColorStop(1, hexA(o.cloudCol || '#f6e2d0', 0));
      c.save(); c.translate(cx, cy); c.scale(1, 0.32); c.translate(-cx, -cy); c.fillStyle = cg; c.fillRect(cx - rw, cy - rw, rw * 2, rw * 2); c.restore(); } }
  return top;
}
// the wilderness of Sinai: far ranges, Mount Tur, mid crags, the sand floor
function sinai(c, t, o = {}) {
  const fy = o.fy || 1250, px = o.px || 0, mx = o.mx === undefined ? 760 : o.mx, ms = o.ms || 0.7;
  sky19(c, o.sky || 'dusk', o.to, o.k);
  const night = o.sky === 'night' ? 1 - (o.to ? o.k || 0 : 0) : (o.to === 'night' ? o.k || 0 : 0);
  if (night > 0.2) stars(c, t, 160, 191, [-300, -300, W + 600, fy - 300], night);
  if (o.moon) moon(c, o.moon[0], o.moon[1], 46, night);
  if (o.sunX !== undefined) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, o.sunX, o.sunY, 520, o.sunCol || '#ffc080', 0.45 * (o.sunA || 1)); c.restore(); sun(c, o.sunX, o.sunY, 48, o.sunCol || '#ffd8a0', o.sunA || 1); }
  wisps(c, t, fy - 900, 5, o.wisp || '#ffd8c0', 0.16, 191, 5);
  const hz = o.haze || '#f0a878', far = o.far || '#7a5a6e', mid = o.mid || '#5a3a3a';
  par(c, 0.06, px, 0, () => { ridgeW(c, fy - 170, 150, 0.0022, 191, far); hazeW(c, fy - 140, 240, hz, 0.55); });
  let top = null; if (o.mount !== false) par(c, 0.12, px, 0, () => { top = turMount(c, mx, fy - 60, ms, t, { col: o.mcol || '#6e4438', glow: o.glow || 0, cloud: o.cloud === undefined ? 0.6 : o.cloud, haze: hz, light: o.mlight }); hazeW(c, fy - 40, 200, hz, 0.45); });
  par(c, 0.3, px, 0, () => { crags(c, fy - 30, 150, 196, mid, { rim: o.rim || 'rgba(255,200,160,0.35)', gullies: 30, blocks: 40, x0: -2200, x1: W + 2200 }); hazeWide(c, fy - 10, 120, hz, 0.3); });
  sandW(c, fy, o.sand || '#b8875a', 19, { pebbles: 130, tufts: 5 });
  return top;
}
// a Bedouin tent of woven goat hair: long low roof on poles, stripes, a dark opening (lamp inside), guy ropes and pegs
function bedTent(c, x, y, s, col, seed = 1, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const dk = mix(col, '#000000', 0.45), lt = mix(col, '#ffe0c0', 0.18 * (o.light === undefined ? 1 : o.light)), r = rng(seed);
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(0, 3, 190, 14, 0, 0, 6.283); c.fill();
  c.strokeStyle = 'rgba(60,40,24,0.7)'; c.lineWidth = 2; c.beginPath(); [[-130, -92, -220, 2], [130, -88, 222, 2], [-40, -112, -110, 2], [40, -110, 120, 2]].forEach(([a, b, cc, d]) => { c.moveTo(a, b); c.lineTo(cc, d); }); c.stroke();
  c.fillStyle = '#3a2614'; [-220, 222, -110, 120].forEach(px => c.fillRect(px - 2, -6, 4, 9));
  const g = c.createLinearGradient(0, -115, 0, 0); g.addColorStop(0, lt); g.addColorStop(1, dk);
  c.fillStyle = g; c.beginPath(); c.moveTo(-170, 0); c.lineTo(-150, -70); c.quadraticCurveTo(-140, -92, -120, -94); c.lineTo(-42, -114); c.quadraticCurveTo(0, -104, 42, -112); c.lineTo(120, -90); c.quadraticCurveTo(140, -88, 150, -66); c.lineTo(172, 0); c.closePath(); c.fill();
  c.save(); c.clip(); c.strokeStyle = hexA(o.stripe || '#d8c8a8', 0.35); c.lineWidth = 6; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(-200, -82 + k * 26); c.lineTo(200, -86 + k * 26); c.stroke(); }
  c.strokeStyle = 'rgba(0,0,0,0.2)'; c.lineWidth = 2; for (let k = -6; k <= 6; k++) { c.beginPath(); c.moveTo(k * 26, -112); c.lineTo(k * 30, 0); c.stroke(); } c.restore();
  c.fillStyle = '#140c08'; c.beginPath(); c.moveTo(-44, 0); c.lineTo(-30, -74); c.lineTo(34, -74); c.lineTo(46, 0); c.closePath(); c.fill();
  if (o.lamp) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -30, 110, '#ffb060', 0.5 * o.lamp); c.restore(); }
  c.fillStyle = mix(col, '#000000', 0.25); c.beginPath(); c.moveTo(-30, -74); c.lineTo(-56, -40); c.lineTo(-44, 0); c.closePath(); c.fill(); // flap
  c.strokeStyle = '#3a2614'; c.lineWidth = 5; c.beginPath(); c.moveTo(-42, -114); c.lineTo(-42, -126); c.moveTo(42, -112); c.lineTo(42, -124); c.stroke();
  c.restore();
}
const TENTC = ['#3a2c26', '#4a382c', '#2e2622', '#5a4434', '#3e3028'];
const TENTS = (() => { const r = rng(197), L = []; [[0, 0.55], [60, 0.7], [140, 0.9]].forEach(([dy, s], row) => { for (let x = -700 + row * 90; x < 1800; x += 300 * s + r() * 120) L.push([x, dy, s * (0.9 + r() * 0.2), Math.floor(r() * 5), r() > 0.55]); }); return L; })();
function camp19(c, t, fy, o = {}) { // rows of tents behind the calf, small fires and smoke; o.lamp: lamps lit (dusk/night)
  TENTS.forEach(([x, dy, s, k, lamp], i) => { if (o.skip && Math.abs(x - o.skip[0]) < o.skip[1]) return; bedTent(c, x, fy + dy, s, TENTC[k], i + 3, { lamp: lamp ? (o.lamp || 0) : 0, light: o.light }); });
  if (o.fires) [[-160, 70], [420, 40], [1180, 60]].forEach(([x, dy], i) => { const yy = fy + dy + 20; c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, yy - 20, 120, '#ff8a3a', 0.35 * o.fires * (0.9 + 0.1 * Math.sin(t * 9 + i))); c.restore();
    c.fillStyle = '#ffb050'; c.beginPath(); c.moveTo(x - 12, yy); c.quadraticCurveTo(x, yy - 30 - Math.sin(t * 8 + i) * 6, x + 12, yy); c.fill(); smoke(c, t + 100 + i * 7, x, yy - 20, 5, 199 + i, '#3a3034', 0.2, 0.5, 20); });
}
// the calf (Ta-Ha 88: "a calf, a body that lowed"), cast from their ornaments: polished gold, glints. A statue: rigid legs.
function goldCalf(c, x, y, s, t, o = {}) { t += 100;
  const k = o.k === undefined ? 1 : o.k, burn = o.burn || 0, gl = o.glow === undefined ? 1 : o.glow;
  if (k <= 0) return;
  c.save(); c.globalAlpha *= k; c.translate(x, y); c.scale(s * (o.dir || 1), s);
  if (gl > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 20, -170, 380, burn > 0 ? '#ff7a30' : '#ffc860', 0.32 * gl * (0.9 + 0.1 * Math.sin(t * 2))); c.restore(); }
  const G = (y0, y1, d = 0) => { const g = c.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, mix(mix('#fff2b8', '#ff8a40', burn), '#000000', d)); g.addColorStop(0.35, mix(mix('#f0c050', '#c0401a', burn), '#000000', d));
    g.addColorStop(0.72, mix(mix('#b8801e', '#5a1a0a', burn), '#000000', d)); g.addColorStop(1, mix(mix('#5a3a0a', '#1a0804', burn), '#000000', d)); return g; };
  const leg = (lx, far) => { const d = far ? 0.32 : 0; limb(c, [lx, -122], [lx + 3, -64], [lx + 2, -16], 34, 20, G(-130, 0, d)); c.fillStyle = mix('#3a240a', '#000000', d); c.beginPath(); c.ellipse(lx + 5, -8, 15, 9, 0, 0, 6.283); c.fill(); };
  leg(-70, true); leg(74, true);
  c.strokeStyle = G(-170, -40, 0.15); c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(-120, -160); c.quadraticCurveTo(-140, -110, -132, -64); c.stroke(); // tail
  c.fillStyle = mix('#6a4410', '#000000', 0.2); c.beginPath(); c.ellipse(-132, -56, 8, 16, 0, 0, 6.283); c.fill();
  const body = () => { c.beginPath(); c.moveTo(-118, -172); c.bezierCurveTo(-70, -206, 40, -208, 96, -186); c.bezierCurveTo(130, -172, 138, -130, 108, -104);
    c.bezierCurveTo(50, -88, -40, -90, -96, -104); c.bezierCurveTo(-128, -116, -136, -150, -118, -172); c.closePath(); };
  body(); c.fillStyle = G(-212, -88); c.fill();
  c.save(); body(); c.clip(); c.strokeStyle = 'rgba(70,40,6,0.35)'; c.lineWidth = 3; c.beginPath(); c.arc(-70, -132, 44, -1.9, 1.3); c.moveTo(90, -170); c.quadraticCurveTo(64, -132, 84, -100); c.stroke();
  c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,250,220,${0.55 * (1 - burn)})`; c.lineWidth = 7; c.beginPath(); c.moveTo(-100, -184); c.bezierCurveTo(-50, -204, 40, -204, 90, -186); c.stroke(); c.restore(); c.restore();
  limb(c, [86, -176], [124, -214], [150, -222], 72, 46, G(-240, -150)); // neck
  c.save(); c.translate(166, -220); c.rotate(0.38);
  c.fillStyle = G(-30, 30); c.beginPath(); c.ellipse(0, 0, 36, 26, 0, 0, 6.283); c.fill(); c.beginPath(); c.ellipse(28, 10, 22, 17, 0.2, 0, 6.283); c.fill(); // skull + muzzle
  c.fillStyle = 'rgba(60,30,6,0.6)'; c.beginPath(); c.ellipse(44, 14, 3.5, 2.5, 0, 0, 6.283); c.fill();
  c.fillStyle = G(-40, 0, 0.1); c.beginPath(); c.ellipse(-22, -22, 9, 18, -0.9, 0, 6.283); c.fill(); // ear
  c.strokeStyle = mix('#fff0b0', '#ff8a40', burn); c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(-6, -22); c.quadraticCurveTo(-4, -44, 8, -52); c.moveTo(8, -22); c.quadraticCurveTo(14, -40, 26, -44); c.stroke(); // small horns
  c.restore();
  leg(-58, false); leg(86, false);
  if (gl > 0 && burn < 0.5) { [[-40, -196, 0], [120, -238, 1.3], [104, -150, 2.6], [-96, -120, 3.4]].forEach(([gx, gy, ph]) => { const tw = Math.pow(Math.max(0, Math.sin(t * 1.6 + ph)), 6); if (tw > 0.02) star4(c, gx, gy, 16 * tw, '#ffffff', tw * gl); }); }
  c.restore();
}
function pedestal(c, x, y, s, col = '#7a6052') { // a heaped stone altar; returns the y of its top
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.35)'; c.beginPath(); c.ellipse(0, 4, 190, 18, 0, 0, 6.283); c.fill();
  [[170, 64, 0], [124, 58, 64]].forEach(([hw, h, y0]) => { const g = c.createLinearGradient(-hw, 0, hw, 0); g.addColorStop(0, mix(col, '#ffe0c0', 0.25)); g.addColorStop(0.5, col); g.addColorStop(1, mix(col, '#000000', 0.45));
    c.fillStyle = g; c.fillRect(-hw, -y0 - h, hw * 2, h); c.fillStyle = mix(col, '#fff0d8', 0.3); c.fillRect(-hw, -y0 - h, hw * 2, 6);
    c.strokeStyle = 'rgba(20,10,6,0.3)'; c.lineWidth = 2; for (let xx = -hw + 40; xx < hw; xx += 52) { c.beginPath(); c.moveTo(xx + (y0 ? 20 : 0), -y0 - h + 6); c.lineTo(xx + (y0 ? 20 : 0), -y0); c.stroke(); } });
  c.restore(); return y - 122 * s;
}
// worshippers around the calf: [dx, dy, pose, folk, dir]; drawn back half, then the calf, then the front half
const RING19 = (() => { const r = rng(198), L = []; for (let i = 0; i < 30; i++) { const a = (i / 30) * 6.283 + r() * 0.15, rx = 300 + r() * 120, dx = Math.cos(a) * rx, dy = Math.sin(a) * 80;
  if (Math.abs(dx) < 120 && dy > 0) continue; const p = r(); L.push({ dx, dy, pose: p < 0.45 ? 'stand' : p < 0.72 ? 'bow' : 'kneel', f: Math.floor(r() * TRIBE.length), dir: dx < 0 ? 1 : -1, ph: r() * 6, torch: r() > 0.8 }); }
  return L.sort((a, b) => a.dy - b.dy); })();
function worshippers(c, t, cx, cy, sc, half, o = {}) {
  RING19.filter(p => half === 'back' ? p.dy < 0 : p.dy >= 0).forEach(p => { const x = cx + p.dx * sc, y = cy + p.dy * sc, h = 190 * sc * (1 + p.dy / 500), turn = o.turn || 0;
    const dir = turn > 0 && p.dx < 200 ? lerp(p.dir, -1, turn) : p.dir, pose = turn > 0.5 && p.pose !== 'stand' ? 'stand' : p.pose;
    const fo = { x, y, h, dir: Math.abs(dir) < 0.15 ? Math.sign(dir || 1) * 0.15 : dir, light: o.light || 0.7, t: t + p.ph, wind: 0.2, ink: 0.6 };
    if (pose === 'bow') lean(c, x, y, Math.sign(fo.dir) * 0.32, () => fig(c, TRIBE[p.f], fo));
    else if (pose === 'kneel') fig(c, TRIBE[p.f], Object.assign(fo, { pose: 'kneel' }));
    else { const so = Object.assign(fo, p.torch ? { reach: 0.35 } : {}); fig(c, TRIBE[p.f], so); if (p.torch) heldTorch(c, so, t, p.ph); } });
}
function calfGroup(c, t, cx, by, sc, o = {}) { // pedestal + calf + worshippers; by: ground y of the pedestal
  worshippers(c, t, cx, by, sc, 'back', o);
  const top = pedestal(c, cx, by, sc * 0.9);
  goldCalf(c, cx - 18 * sc, top, sc * 0.8, t, { glow: o.glow, burn: o.burn, k: o.k });
  if (o.moo) soundRings(c, cx + 120 * sc, top - 200 * sc, t, o.moo, 1, 4);
  worshippers(c, t, cx, by, sc, 'front', o);
}
// the two Tablets (Al-A'raf 145): rounded tops, lines of light; ang 0 = upright, k = light
function tablets(c, x, y, s, ang = 0, k = 1) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
  if (k > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -60, 200, '#fff0c8', 0.35 * k); c.restore(); }
  [[-34, 0.06, '#9a948a'], [30, -0.04, '#b0aa9e']].forEach(([dx, rot, col]) => { c.save(); c.translate(dx, 0); c.rotate(rot);
    const g = c.createLinearGradient(-36, 0, 36, 0); g.addColorStop(0, mix(col, '#ffffff', 0.25)); g.addColorStop(1, mix(col, '#000000', 0.35));
    c.fillStyle = g; c.beginPath(); c.moveTo(-36, 0); c.lineTo(-36, -96); c.arc(0, -96, 36, Math.PI, 0); c.lineTo(36, 0); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(40,30,20,0.5)'; c.lineWidth = 2.5; c.stroke();
    c.strokeStyle = k > 0 ? `rgba(255,236,170,${0.5 + 0.5 * k})` : 'rgba(60,50,40,0.5)'; c.lineWidth = 2.5;
    for (let l = 0; l < 7; l++) { const yy = -108 + l * 14, w0 = l === 0 ? 18 : 26; c.beginPath(); for (let xx = -w0; xx < w0; xx += 9) { c.moveTo(xx, yy); c.lineTo(xx + 5 + (l + xx) % 3, yy + (xx % 2)); } c.stroke(); }
    c.restore(); });
  c.restore();
}
function tabletsHeld(c, o, k = 1) { // held against the chest by a figure (o: fig options, reach ~0.3)
  const s = (o.h || 300) / 300, d = o.dir || 1; tablets(c, o.x + d * 52 * s, o.y - 106 * s, s * 0.85, d * 0.04, k);
  const [hx, hy] = handOf(o); hand(c, hx, hy - 4 * s, d > 0 ? -0.3 : 0.3, o.skin || '#c49470', s, false);
}
function bangles(c, x, y, s, t, seed = 1, n = 6) { const r = rng(seed); c.save(); c.translate(x, y); c.scale(s, s);
  for (let i = 0; i < n; i++) { const bx = (r() - 0.5) * 90, by = (r() - 0.5) * 30, rw = 14 + r() * 12; c.strokeStyle = r() > 0.3 ? '#f0c050' : '#d8d0c0'; c.lineWidth = 4 + r() * 3;
    c.beginPath(); c.ellipse(bx, by, rw, rw * 0.4, r(), 0, 6.283); c.stroke(); c.strokeStyle = 'rgba(255,250,220,0.7)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(bx, by - 1, rw, rw * 0.4, 0, 3.6, 5.2); c.stroke(); }
  c.restore(); }
function fallingJewels(c, t, t0, x, y0, y1, n = 12, seed = 3) { const r = rng(seed);
  for (let i = 0; i < n; i++) { const st = t0 + r() * 1.6 + i * 0.12, q = t - st; if (q <= 0) continue; const yy = y0 + 900 * q * q, xx = x + (r() - 0.5) * 120 + q * (r() - 0.5) * 60;
    if (yy > y1) continue; const rw = 10 + r() * 10; c.strokeStyle = r() > 0.3 ? '#f6c860' : '#e0d8c8'; c.lineWidth = 4;
    c.beginPath(); c.ellipse(xx, yy, rw, rw * (0.3 + 0.7 * Math.abs(Math.sin(q * 6 + i))), q * 3 + i, 0, 6.283); c.stroke(); }
}
// the slope of the mountain (close): a rocky path rising to the right; slopeY gives the ground under the feet
const slopeY = x => 1660 - (x - 0) * 0.42 + Math.sin(x * 0.012) * 14;
function mountainSlope(c, t, o = {}) {
  sky19(c, o.sky || 'day', o.to, o.k);
  if (o.sunX !== undefined) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, o.sunX, o.sunY, 460, '#ffd8a0', 0.4); c.restore(); sun(c, o.sunX, o.sunY, 44, '#ffe8b8', 1); }
  wisps(c, t, 420, 6, '#ffffff', 0.18, 201, 6);
  par(c, 0.1, o.px || 0, 0, () => { ridgeW(c, 1180, 120, 0.0025, 202, o.far || '#9a7a88'); hazeW(c, 1200, 220, o.haze || '#f6d8c0', 0.6); });
  if (o.camp) par(c, 0.2, o.px || 0, 0, () => { c.save(); c.translate(-80, 1230); c.scale(0.38, 0.38); c.translate(0, -1250); sandW(c, 1250, '#b8875a', 23, { pebbles: 20 }); camp19(c, t, 1250, { lamp: o.lamp, fires: o.fires });
    if (o.calf) calfGroup(c, t, 760, 1420, 0.8, { glow: o.calf }); c.restore(); hazeW(c, 1300, 140, o.haze || '#f6d8c0', 0.35); });
  const col = o.rock || '#7a4e40', path = () => { c.beginPath(); c.moveTo(-400, H + 400); for (let x = -400; x <= W + 400; x += 12) c.lineTo(x, slopeY(x)); c.lineTo(W + 400, -400); c.lineTo(W + 400, H + 400); c.closePath(); };
  const g = c.createLinearGradient(0, 700, 0, H); g.addColorStop(0, mix(col, '#ffd8b0', 0.25)); g.addColorStop(1, mix(col, '#100808', 0.5)); path(); c.fillStyle = g; c.fill();
  c.save(); path(); c.clip(); const r = rng(203); for (let i = 0; i < 70; i++) { const x = -300 + r() * 1700, y = slopeY(x) + 40 + r() * 900, w = 20 + r() * 70; boulder(c, x, y, w, w * 0.6, mix(col, r() > 0.5 ? '#000000' : '#ffd8b0', 0.2), i + 210); } c.restore();
  c.strokeStyle = 'rgba(255,220,180,0.5)'; c.lineWidth = 4; c.beginPath(); for (let x = -400; x <= W + 400; x += 12) x === -400 ? c.moveTo(x, slopeY(x)) : c.lineTo(x, slopeY(x)); c.stroke();
}
// the camp split in two (the fear of Harun): two groups drifting apart, a glowing rift between them
function splitCamp(c, t, k) {
  sky19(c, 'storm', 'night', 0.4);
  ridgeW(c, 1150, 120, 0.0025, 211, '#3a2228'); hazeW(c, 1170, 200, '#7a3a2a', 0.5);
  sandW(c, 1200, '#7a5640', 24, { pebbles: 80 });
  const gap = lerp(10, 160, ease(k)), crack = y => 540 + Math.sin(y * 0.03) * 14 + (y - 1200) * 0.015;
  c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; c.lineJoin = 'round';
  [[60 * k + 10, 0.12], [24 * k + 6, 0.35], [8, 0.8]].forEach(([w, a]) => { c.strokeStyle = `rgba(255,140,70,${a * k})`; c.lineWidth = w; c.beginPath(); for (let y = 1200; y < H + 60; y += 24) { const x = crack(y) + (noise1(y * 0.05, 3) - 0.5) * 30; y === 1200 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke(); });
  glow(c, 540, 1600, 500, '#ff7a3a', 0.18 * k); c.restore();
  [[1330, 250, 3], [1540, 380, 3], [1800, 560, 2]].forEach(([y, h, n], row) => [-1, 1].forEach(sd => { for (let i = 0; i < n; i++) {
    const x = 540 + sd * (h * 0.42 + i * h * 0.62 + gap * (0.6 + row * 0.5));
    fig(c, TRIBE[(i * 3 + row * 2 + (sd > 0 ? 5 : 0)) % TRIBE.length], { x, y: y + (i % 2) * 10, h, dir: sd, light: 0.6, t: t + i + row, wind: 0.4, ink: 0.7 }); } }));
}
// the dust of the calf blown over the sea (Ta-Ha 97)
function ashDrift(c, t, k, x0, y0) { if (k <= 0) return; t += 100; const r = rng(212);
  for (let i = 0; i < 90; i++) { const q = clamp(k * 1.4 - r() * 0.4), x = x0 + q * (400 + r() * 700), y = y0 + q * (200 + r() * 260) - Math.sin(q * 3 + i) * 30, rr = 3 + r() * 6;
    if (q <= 0) continue; c.fillStyle = `rgba(${r() > 0.5 ? '210,170,90' : '120,110,100'},${0.6 * (1 - q * 0.7)})`; c.beginPath(); c.arc(x, y, rr, 0, 6.283); c.fill(); } }

// the hero picture (hook / return / plea / calm / cta / outro / cover): the camp at dusk below Mount Tur, the calf glowing on its altar
// among its worshippers; in front, Moussa holding his brother by the head, Harun leaning back, his hand open; the Tablets on the sand.
// T is continuous across cta -> outro, and the outro ends on exactly the first frame of the hook (loop).
const MO = { x: 320, y: 1770, h: 560 }, HA = { x: 488, y: 1762, h: 545 };
function harHero(c, T, o = {}) {
  const z = o.z || 1, cx = o.cx || 540, cy = o.cy || 1220, calm = o.calm || 0;
  cam(c, z + 0.004 * Math.sin(T * 0.3), cx, cy, ...(o.shake ? shake(T, o.shake, 10) : [0, 0]));
  sinai(c, T, { fy: 1250, sky: 'dusk', to: 'dawn', k: calm * 0.6, sunX: 160, sunY: 1060, sunA: 0.8, mx: 860, ms: 0.78, glow: 0.35 + 0.4 * calm, cloud: 0.5 });
  camp19(c, T, 1258, { lamp: 0.8, fires: 1, skip: [820, 260] });
  calfGroup(c, T, 840, 1400, 0.85, { glow: 1 - calm * 0.7, moo: o.moo, turn: o.turn });
  fgRidge(c, 1620, 40, 0.003, 213, '#9a6a48', { rim: 'rgba(255,200,150,0.5)', shade: 0.25 });
  if (o.tab !== false) tablets(c, 150, 1790, 0.95, 1.42, 0.25 + 0.5 * calm);
  const grip = o.grip === undefined ? 0.86 : o.grip, hlean = (o.hlean === undefined ? 1 : o.hlean) * grip / 0.86;
  lean(c, HA.x, HA.y, 0.05 * hlean, () => fig(c, HAR, Object.assign({}, HA, { dir: -1, reach: o.hreach === undefined ? 0.55 : o.hreach, light: 1, t: T, wind: 0.5, veilGlow: 0.4 })));
  fig(c, MOU, Object.assign({}, MO, { dir: 1, armUp: grip, light: 1, t: T, wind: 0.5, veilGlow: 0.4 }));
  dust(c, T, 30, 214, [0, 900, W, 900], '#ffc890', 0.25);
  blowingSand(c, T, 1580, 0.12 * (1 - calm), 215);
  blurred(c, 7, () => { fgStones(c, 1000, 1980, 1.4, '#4a2c1e', 216); shrub(c, 60, 1960, 3, '#2a1a10', T, 217); });
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// title / name words
function quoteBig(c, l1, l2, a, y = 290, c2 = '#f6c453') { if (a <= 0) return; topShade(c, a * 1.3); bigWord(c, l1, y, a, 76); if (l2) bigWord(c, l2, y + 100, a, 76, c2); }


// =====================================================================================================================
// ---------- episode 20: Ishaq
const SARA = { agal: false, robe: '#5a3a52', wrap: '#e9dfcc', skin: '#b4805c', trim: '#c9a86a', band: '#8a6a5a', covered: true, inner: '#efe6d6' }; // Ibrahim's wife (named Sara by the tradition)
const ISQ = { veilGlow: 0.5, prophet: true, robe: '#f2ede2', wrap: '#f9f6ef', skin: '#c49470', trim: '#a8c09a', band: '#8aa07a', inner: '#fcfaf4' }; // Ishaq as a young man
const SERV = [FOLK[1], FOLK[4], FOLK[5]];
function seriesTag20(c, a) { seriesTag(c, a, 20); }

// a woven rug laid on the ground in perspective (front edge wider), border, diamonds
function rug(c, x, y, w, d, col = '#8a2a22', o = {}) {
  const tw = w * 0.82, P = [[x - tw / 2, y - d], [x + tw / 2, y - d], [x + w / 2, y], [x - w / 2, y]];
  const path = (k = 0) => { const q = (a, b, s) => [lerp(a[0], b[0], s), lerp(a[1], b[1], s)], cx = x, cy = y - d / 2;
    const sh = p => [lerp(p[0], cx, k), lerp(p[1], cy, k)]; c.beginPath(); P.map(sh).forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); };
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(x, y + 4, w * 0.55, 10, 0, 0, 6.283); c.fill();
  path(); c.fillStyle = col; c.fill();
  path(0.08); c.fillStyle = mix(col, '#1a0806', 0.35); c.fill();
  path(0.14); c.fillStyle = mix(col, '#ffffff', 0.04); c.fill();
  c.save(); path(0.14); c.clip();
  for (let i = 0; i < 5; i++) { const q = (i + 0.5) / 5, px = lerp(x - w * 0.36, x + w * 0.36, q), py = y - d / 2, rw = w * 0.05, rh = d * 0.28;
    c.fillStyle = i % 2 ? '#d8a850' : '#f0e2c0'; c.beginPath(); c.moveTo(px, py - rh); c.lineTo(px + rw, py); c.lineTo(px, py + rh); c.lineTo(px - rw, py); c.closePath(); c.fill();
    c.fillStyle = mix(col, '#000000', 0.3); c.beginPath(); c.moveTo(px, py - rh * 0.45); c.lineTo(px + rw * 0.45, py); c.lineTo(px, py + rh * 0.45); c.lineTo(px - rw * 0.45, py); c.closePath(); c.fill(); }
  c.restore();
  c.strokeStyle = 'rgba(240,220,180,0.6)'; c.lineWidth = 2; c.beginPath(); for (let k = 0; k < 14; k++) { const fx = lerp(x - w / 2, x + w / 2, k / 13); c.moveTo(fx, y); c.lineTo(fx + 2, y + 9); } c.stroke(); // fringe
  if (o.light) { c.save(); c.globalCompositeOperation = 'lighter'; path(); c.fillStyle = `rgba(255,200,130,${0.12 * o.light})`; c.fill(); c.restore(); }
}
function cushion(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(0, 4, 56, 9, 0, 0, 6.283); c.fill();
  const g = c.createLinearGradient(0, -40, 0, 0); g.addColorStop(0, mix(col, '#ffffff', 0.2)); g.addColorStop(1, mix(col, '#000000', 0.35)); c.fillStyle = g;
  c.beginPath(); c.moveTo(-52, 0); c.quadraticCurveTo(-58, -38, -40, -40); c.lineTo(40, -40); c.quadraticCurveTo(58, -38, 52, 0); c.closePath(); c.fill();
  c.strokeStyle = '#d8b060'; c.lineWidth = 3; c.beginPath(); c.moveTo(-44, -22); c.lineTo(44, -22); c.stroke(); c.restore(); }
function jar(c, x, y, s, col = '#a8643a') { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(0, 3, 34, 7, 0, 0, 6.283); c.fill();
  const g = c.createLinearGradient(-30, 0, 30, 0); g.addColorStop(0, mix(col, '#ffe0c0', 0.25)); g.addColorStop(0.6, col); g.addColorStop(1, mix(col, '#000000', 0.45)); c.fillStyle = g;
  c.beginPath(); c.moveTo(-12, -92); c.lineTo(12, -92); c.quadraticCurveTo(10, -78, 26, -62); c.quadraticCurveTo(44, -30, 16, 0); c.lineTo(-16, 0); c.quadraticCurveTo(-44, -30, -26, -62); c.quadraticCurveTo(-10, -78, -12, -92); c.fill();
  c.fillStyle = mix(col, '#000000', 0.5); c.fillRect(-14, -96, 28, 6); c.restore(); }
// Ibrahim's tent: the goat-hair tent (bedTent) with rugs, cushions, jars, a cooking fire with its pot
function ibrTent(c, x, y, s, t, o = {}) {
  const nt = o.night || 0;
  bedTent(c, x, y, s, mix('#4a3a2e', '#1a1410', nt), 31, { lamp: o.lamp || 0, light: 1 - nt * 0.7 });
  if (o.props !== false) {
    jar(c, x - 210 * s, y + 6, 0.62 * s, mix('#a8643a', '#2a1a14', nt)); jar(c, x - 250 * s, y + 10, 0.5 * s, mix('#8a5a3a', '#2a1a14', nt));
    rug(c, x + 6 * s, y + 46 * s, 300 * s, 40 * s, mix('#8a2a22', '#2a0c0a', nt * 0.7), { light: o.lamp || 0 });
    cushion(c, x - 80 * s, y + 20 * s, 0.4 * s, mix('#3a5a7a', '#141a24', nt)); cushion(c, x + 90 * s, y + 22 * s, 0.4 * s, mix('#7a5a2a', '#241a10', nt));
  }
  if (o.fire) { const fx = x + 260 * s, fy = y + 30 * s; fire(c, fx, fy, 0.38 * s * o.fire, t); smoke(c, t + 100, fx, fy - 40 * s, 6, 33, '#6a5a50', 0.18 * o.fire, 0.5, 30); }
}
// a living calf (same build as the golden calf of episode 19, in brown and white hide)
function liveCalf(c, x, y, s, t, o = {}) { t += 100;
  c.save(); c.translate(x, y); c.scale(s * (o.dir || 1), s);
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(10, 2, 150, 14, 0, 0, 6.283); c.fill();
  const G = (y0, y1, d = 0) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, mix('#c88a5a', '#000000', d)); g.addColorStop(0.5, mix('#8a4a26', '#000000', d)); g.addColorStop(1, mix('#4a2410', '#000000', d)); return g; };
  const leg = (lx, far, ph) => { const d = far ? 0.32 : 0, sw = (o.walk !== undefined ? Math.sin(o.walk * 6.283 + ph) * 10 : 0);
    limb(c, [lx, -122], [lx + 3 + sw * 0.4, -64], [lx + 2 + sw, -16], 30, 18, G(-130, 0, d)); c.fillStyle = mix('#2a160a', '#000000', d); c.beginPath(); c.ellipse(lx + 5 + sw, -8, 13, 8, 0, 0, 6.283); c.fill(); };
  leg(-70, true, 0); leg(74, true, Math.PI);
  c.strokeStyle = G(-170, -40, 0.15); c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(-120, -160); c.quadraticCurveTo(-136 + Math.sin(t * 2) * 6, -110, -128, -66); c.stroke();
  const body = () => { c.beginPath(); c.moveTo(-118, -172); c.bezierCurveTo(-70, -206, 40, -208, 96, -186); c.bezierCurveTo(130, -172, 138, -130, 108, -104);
    c.bezierCurveTo(50, -88, -40, -90, -96, -104); c.bezierCurveTo(-128, -116, -136, -150, -118, -172); c.closePath(); };
  body(); c.fillStyle = G(-212, -88); c.fill();
  c.save(); body(); c.clip(); c.fillStyle = 'rgba(240,230,215,0.85)'; // white patches
  c.beginPath(); c.ellipse(-50, -150, 38, 26, 0.3, 0, 6.283); c.fill(); c.beginPath(); c.ellipse(40, -112, 30, 18, -0.2, 0, 6.283); c.fill();
  c.strokeStyle = 'rgba(255,230,190,0.35)'; c.lineWidth = 6; c.beginPath(); c.moveTo(-100, -184); c.bezierCurveTo(-50, -204, 40, -204, 90, -186); c.stroke(); c.restore();
  const bob = Math.sin(t * 0.9) * 0.08 + (o.graze ? 0.5 : 0);
  limb(c, [86, -176], [124, -214 + bob * 60], [150, -222 + bob * 120], 66, 42, G(-240, -150));
  c.save(); c.translate(166, -220 + bob * 130); c.rotate(0.38 + bob);
  c.fillStyle = G(-30, 30); c.beginPath(); c.ellipse(0, 0, 34, 25, 0, 0, 6.283); c.fill(); c.fillStyle = '#e8d8c4'; c.beginPath(); c.ellipse(28, 10, 21, 16, 0.2, 0, 6.283); c.fill();
  c.fillStyle = G(-40, 0, 0.1); c.beginPath(); c.ellipse(-22, -20, 9, 18, -0.9 + Math.sin(t * 1.7) * 0.15, 0, 6.283); c.fill();
  c.restore();
  leg(-58, false, Math.PI); leg(86, false, 0);
  c.restore();
}
// the feast: a broad brass tray, a bed of rice, the roasted calf (Hud 69: "a roasted calf"; Adh-Dhariyat 26: "a fat calf"), herbs, steam
function feastTray(c, x, y, s, t, o = {}) { t += 100;
  c.save(); c.translate(x, y); c.scale(s, s);
  if (o.glow) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -40, 300, '#ffc070', 0.25 * o.glow); c.restore(); }
  c.fillStyle = 'rgba(10,6,4,0.35)'; c.beginPath(); c.ellipse(6, 8, 150, 22, 0, 0, 6.283); c.fill();
  const g = c.createLinearGradient(-140, 0, 140, 0); g.addColorStop(0, '#6a4818'); g.addColorStop(0.35, '#f0c868'); g.addColorStop(0.6, '#c89a3a'); g.addColorStop(1, '#5a3a10');
  c.fillStyle = g; c.beginPath(); c.ellipse(0, -4, 140, 30, 0, 0, 6.283); c.fill();
  c.strokeStyle = 'rgba(90,60,16,0.7)'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, -6, 124, 24, 0, 0, 6.283); c.stroke();
  const rg = c.createLinearGradient(0, -36, 0, 0); rg.addColorStop(0, '#fbf2d8'); rg.addColorStop(1, '#d8c08a'); c.fillStyle = rg; // rice
  c.beginPath(); c.ellipse(0, -10, 112, 22, 0, Math.PI, 0); c.quadraticCurveTo(100, 6, 0, 8); c.quadraticCurveTo(-100, 6, -112, -10); c.fill();
  const r = rng(5); c.fillStyle = 'rgba(180,150,90,0.5)'; for (let i = 0; i < 70; i++) { const a = r() * 6.283, d = Math.sqrt(r()); c.fillRect(Math.cos(a) * 100 * d, -10 + Math.sin(a) * 18 * d, 3, 1.5); }
  c.save(); c.translate(0, -16); c.scale(0.62, 0.62); // the roast, lying, legs folded under
  const RG = (y0, y1) => { const q = c.createLinearGradient(0, y0, 0, y1); q.addColorStop(0, '#f0b064'); q.addColorStop(0.35, '#c0682a'); q.addColorStop(0.75, '#7a3410'); q.addColorStop(1, '#3a1606'); return q; };
  [[-80, 0], [-30, 4], [60, 2], [100, 0]].forEach(([lx, ly]) => { c.fillStyle = RG(-40, 0); c.beginPath(); c.ellipse(lx, ly - 10, 34, 14, 0.1, 0, 6.283); c.fill(); });
  c.beginPath(); c.moveTo(-130, -18); c.bezierCurveTo(-110, -96, 70, -110, 120, -60); c.bezierCurveTo(146, -40, 140, -10, 110, -4); c.bezierCurveTo(30, 6, -60, 6, -112, 0); c.closePath(); c.fillStyle = RG(-110, 0); c.fill();
  c.save(); c.clip(); c.strokeStyle = 'rgba(60,20,4,0.35)'; c.lineWidth = 4; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(k * 32 - 10, -100); c.quadraticCurveTo(k * 32 + 6, -50, k * 30 - 4, 0); c.stroke(); }
  c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,220,150,0.5)'; c.lineWidth = 9; c.beginPath(); c.moveTo(-100, -40); c.bezierCurveTo(-60, -88, 40, -96, 100, -62); c.stroke();
  c.fillStyle = 'rgba(255,240,200,0.6)'; [[-40, -76], [20, -84], [70, -70]].forEach(([hx, hy]) => { c.beginPath(); c.ellipse(hx, hy, 10, 4, -0.2, 0, 6.283); c.fill(); }); c.restore();
  c.restore();
  const herb = (hx, hy, a) => { c.fillStyle = '#4a7a2a'; c.beginPath(); c.ellipse(hx, hy, 13, 5, a, 0, 6.283); c.fill(); c.fillStyle = '#6a9a3a'; c.beginPath(); c.ellipse(hx + 6, hy - 3, 9, 4, a + 0.6, 0, 6.283); c.fill(); };
  [[-96, -12, -0.4], [-70, 2, 0.3], [84, 0, 0.5], [104, -14, -0.3], [-10, 6, 0.1]].forEach(p => herb(...p));
  [[-118, -6], [118, -4], [-50, 8], [50, 8]].forEach(([dx, dy]) => { c.fillStyle = '#6a2a10'; c.beginPath(); c.ellipse(dx, dy, 8, 5, 0, 0, 6.283); c.fill(); }); // dates
  const st = o.steam === undefined ? 1 : o.steam;
  if (st > 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    for (let i = 0; i < 6; i++) { const ph = (t * 0.35 + i / 6) % 1, sx = -70 + i * 28; c.strokeStyle = `rgba(255,245,230,${0.22 * st * Math.sin(ph * Math.PI)})`; c.lineWidth = 7 - ph * 4; c.beginPath();
      for (let k = 0; k <= 10; k++) { const yy = -60 - ph * 140 - k * 10, xx = sx + Math.sin(k * 0.7 + t * 1.6 + i) * 9; k ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); } c.restore(); }
  c.restore();
}
// the guests: angels are never depicted. Only a soft presence of light: a tall column of glow, a pool on the ground, motes rising.
function guestLight(c, x, y, h, t, k = 1, seed = 0) { if (k <= 0) return; t += 100;
  const fl = 1 + 0.04 * Math.sin(t * 2.2 + seed * 1.9);
  c.save(); c.globalCompositeOperation = 'lighter';
  c.save(); c.translate(x, y); c.scale(1, 0.22); glow(c, 0, 0, h * 0.42, '#ffe2a8', 0.3 * k); c.restore(); // pool of light on the ground
  c.save(); c.translate(x, y - h * 0.48); c.scale(0.26, 1); glow(c, 0, 0, h * 0.56 * fl, '#fff0cc', 0.55 * k); glow(c, 0, 0, h * 0.34 * fl, '#ffffff', 0.35 * k); c.restore();
  c.save(); c.translate(x, y - h * 0.5); c.scale(0.09, 1); glow(c, 0, 0, h * 0.5 * fl, '#ffffff', 0.5 * k); c.restore();
  glow(c, x, y - h * 0.86, h * 0.2, '#fff8e8', 0.32 * k);
  const r = rng(300 + seed); for (let i = 0; i < 12; i++) { const ph = (t * (0.12 + r() * 0.1) + r()) % 1, sx = x + (r() - 0.5) * h * 0.22 + Math.sin(t + i) * 6, sy = y - ph * h * 1.1;
    c.fillStyle = `rgba(255,244,210,${0.7 * k * Math.sin(ph * Math.PI)})`; c.beginPath(); c.arc(sx, sy, 2 + r() * 2.5, 0, 6.283); c.fill(); }
  c.restore(); }
function guests3(c, x, y, h, t, k = 1, gap = 130) { for (let i = 0; i < 3; i++) guestLight(c, x + (i - 1) * gap, y + (i === 1 ? 8 : 0), h * (i === 1 ? 1.05 : 0.95), t, k, i); }
// warm laughter / joy: small golden arcs and sparkles rising (never a face)
function joyRings(c, x, y, t, t0, a = 1) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 5; k++) { const ph = (t - t0) * 0.8 - k * 0.22; if (ph <= 0 || ph >= 1) continue;
    c.strokeStyle = `rgba(255,220,150,${0.6 * a * (1 - ph)})`; c.lineWidth = 4 * (1 - ph) + 1; c.beginPath(); c.arc(x, y, 30 + ph * 260, -2.6, -0.5); c.stroke(); }
  c.restore(); }
// the old tree beside the tent: bare (years without child) -> in leaf and blossom (lesson)
function oldTree(c, x, y, s, t, k = 0, bloom = 0) { tree(c, x, y, s, t, { col: '#4a3428', leaf: k, bloom, seed: 21, depth: 5, leafCol: '#6a8a3a', lastLeaves: k <= 0 ? 0.6 : 0 }); }

// the hero picture (hook / mercy / cta / outro / cover): dusk over the hills of Canaan; Ibrahim's tent; Sara standing at the entrance;
// the three guests (light only: angels are never depicted); the roasted calf untouched on its tray; Ibrahim facing them.
// T is continuous across cta -> outro, and the outro ends on exactly the first frame of the hook (loop).
const IH = { tent: [440, 1404, 2.2], sara: { x: 470, y: 1412, h: 215 }, ibr: { x: 226, y: 1860, h: 560 }, gx: 850, gy: 1800, gh: 600, tray: [580, 1836, 1.25] };
function ishHero(c, T, o = {}) {
  const z = o.z || 1, cx = o.cx || 540, cy = o.cy || 1150, gk = o.gk === undefined ? 1.2 : o.gk, gold = o.gold || 0;
  cam(c, z + 0.004 * Math.sin(T * 0.3), cx, cy, ...(o.shake ? shake(T, o.shake, 10) : [0, 0]));
  canaanLand(c, T, { fy: 1330, sky: 'dusk', to: 'gold', k: 0.35 + 0.5 * gold, sunX: 930, sunY: 1010, sunA: 0.85, haze: '#f4c8a0', seed: 20, n: 140 });
  herd(c, T, 930, 1350, 6, { dir: -1 });
  oldTree(c, 90, 1395, 1.25, T, o.leaf || 0, o.bloom || 0);
  ibrTent(c, ...IH.tent, T, { lamp: 0.8 + 0.4 * gold });
  fig(c, SARA, Object.assign({}, IH.sara, { dir: 1, armUp: o.sUp || 0, reach: o.sReach || 0, light: 0.9 + 0.3 * gold, t: T + 2, wind: 0.35 }));
  if (o.joy) joyRings(c, IH.sara.x + 20, IH.sara.y - 270, T, o.joy0 || 0, o.joy);
  feastTray(c, ...IH.tray, T, { steam: o.steam === undefined ? 1 : o.steam, glow: 0.5 + gold });
  guests3(c, IH.gx, IH.gy, IH.gh * (o.gs || 1), T, gk, 132);
  if (o.rings) lightRings(c, IH.gx, IH.gy - 20, T, o.rings, 4, 520);
  fig(c, IBR, Object.assign({}, IH.ibr, { dir: 1, reach: o.iReach === undefined ? 0.35 : o.iReach, staff: !!o.staff, light: 1, t: T, wind: 0.45, veilGlow: 0.4 }));
  if (gold > 0) sparkle(c, T, 600, 1100, 40, 520, 207, gold);
  dust(c, T, 30, 208, [0, 900, W, 900], '#ffd8a0', 0.25);
  blurred(c, 7, () => grassFg(c, T, '#4a5426'));
  c.setTransform(1, 0, 0, 1, 0, 0);
}
function quoteBig(c, l1, l2, a, y = 290, c2 = '#f6c453') { if (a <= 0) return; topShade(c, a * 1.3); bigWord(c, l1, y, a, 76); if (l2) bigWord(c, l2, y + 100, a, 76, c2); }
// golden name plaque (lineage)
function plaque(c, txt, x, y, k, t, lit = 1) { if (k <= 0) return; const e = easeOut(clamp(k)); c.save(); c.globalAlpha *= e;
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y, 190, '#ffd890', 0.35 * lit); c.restore();
  c.fillStyle = 'rgba(14,10,20,0.65)'; c.beginPath(); c.roundRect(x - 170, y - 46, 340, 92, 46); c.fill(); c.strokeStyle = hexA('#f6c453', 0.9); c.lineWidth = 3; c.stroke();
  textGlow(c, txt, x, y + 3 + (1 - e) * 16, '700 50px Lora', '#f6c453', 1, '#ffb300', 16); c.restore(); }

// a wider look at the camp (home / guests / birth / lesson): tent, rug, herd, old tree; o.night, o.lamp
function campSet(cc, t, o = {}) {
  canaanLand(cc, t, Object.assign({ fy: 1330, sky: 'gold', sunX: 880, sunY: 860, haze: '#f4d8b0', seed: 21, n: 140 }, o.land || {}));
  if (o.herd !== false) herd(cc, t, o.herdX || 820, 1352, 8, { dir: -1 });
  oldTree(cc, o.treeX || 110, 1395, 1.25, t, o.leaf || 0, o.bloom || 0);
  ibrTent(cc, o.tx || 470, 1404, o.ts || 2.2, t, { lamp: o.lamp || 0, night: o.night || 0, fire: o.fire || 0 });
}

// =====================================================================================================================
// Episode 21 — Ilyas (alayhi salam): Baalbek, the idol Baal, "Will you not fear Allah?" (As-Saffat 123-132)
// =====================================================================================================================
const ILY = { veilGlow: 0.5, prophet: true, robe: '#ebe5d6', wrap: '#f7f3ea', skin: '#c49470', trim: '#cfae6a', band: '#b8954a', inner: '#fbf8f0' };
const BAALP = [ // the people of Baalbek: dark, rich cloth, gold trims
  { robe: '#5a2a26', wrap: '#d8c8aa', skin: '#a8714f', trim: '#c9a35a' }, { robe: '#2e3a4e', wrap: '#e0d4bc', skin: '#94664a', trim: '#b89a62' },
  { robe: '#6a4a2a', wrap: '#cbb894', skin: '#8f5f42' }, { robe: '#3a2e3a', wrap: '#e6dccb', skin: '#b07a58', covered: true, agal: false },
  { robe: '#4a5a3a', wrap: '#d6c8a8', skin: '#9a6a4c', trim: '#a88a52' }, { robe: '#7a3a2a', wrap: '#ece0c8', skin: '#b4805c' },
  { robe: '#2a2a32', wrap: '#c8b898', skin: '#7a5038', trim: '#8a7a5a' }, { robe: '#5a3a4e', wrap: '#e0d2bc', skin: '#c48e66', covered: true, agal: false, trim: '#b89a62' },
];
const FAITH = [FOLK[1], FOLK[7], FOLK[3]]; // the few sincere servants who believed with him
function seriesTag21(c, a) { seriesTag(c, a, 21); }
const SKY21 = { dusk: [[0, '#1e2040'], [0.3, '#6a3a58'], [0.5, '#f08850']], day: [[0, '#4f7fb4'], [0.3, '#9fbedc'], [0.5, '#eadcc0']],
  gold: [[0, '#3e4c80'], [0.3, '#cf9c80'], [0.5, '#ffd49a']], dawn: [[0, '#2e3a6a'], [0.3, '#b898a8'], [0.5, '#ffd6a4']],
  night: [[0, '#050818'], [0.3, '#121838'], [0.5, '#262848']], storm: [[0, '#101218'], [0.3, '#26282e'], [0.5, '#4a4644']] };
function sky21(c, a, b, k = 0) { let st = SKY21[a]; if (b) st = st.map((s, i) => [s[0], mix(s[1], SKY21[b][i][1], clamp(k))]); sky0(c, st); }

// 1) the Lebanon range (snow on the summits) over the Beqaa valley
const lbY = (x, y, amp, seed) => y - (noise1(x * 0.0016, seed) * amp + noise1(x * 0.006, seed + 1) * amp * 0.3 + noise1(x * 0.03, seed + 2) * amp * 0.05);
function snowRange(c, y, amp, seed, col, snowCol, snowLine) {
  const path = () => { c.beginPath(); c.moveTo(-2600, H + 400); for (let x = -2600; x <= 3700; x += 12) c.lineTo(x, lbY(x, y, amp, seed)); c.lineTo(3700, H + 400); c.closePath(); };
  const g = c.createLinearGradient(0, y - amp, 0, y + 120); g.addColorStop(0, mix(col, '#ffffff', 0.12)); g.addColorStop(1, mix(col, '#000000', 0.12));
  path(); c.fillStyle = g; c.fill();
  // snow caps: deeper under the high summits, jagged lower edge (snow lying in the gullies), a cool shadow on the faces turned away from the light
  const depth = x => { const top = lbY(x, y, amp, seed); if (top > snowLine) return 0; const b = (snowLine - top) * 0.62 + 10;
    return b * (0.45 + 0.75 * noise1(x * 0.045, seed + 5) + 0.25 * noise1(x * 0.13, seed + 6)); };
  const sg = c.createLinearGradient(0, y - amp, 0, snowLine + 60); sg.addColorStop(0, snowCol); sg.addColorStop(1, mix(snowCol, '#8a90b0', 0.35));
  c.fillStyle = sg; c.beginPath(); c.moveTo(-2600, lbY(-2600, y, amp, seed));
  for (let x = -2600; x <= 3700; x += 10) c.lineTo(x, lbY(x, y, amp, seed) - 1);
  for (let x = 3700; x >= -2600; x -= 10) c.lineTo(x, lbY(x, y, amp, seed) + depth(x));
  c.closePath(); c.fill();
  c.fillStyle = hexA('#5a6088', 0.28); c.beginPath(); let on = false;
  for (let x = -2600; x <= 3700; x += 10) { const a = lbY(x, y, amp, seed), b = lbY(x + 10, y, amp, seed), d = depth(x);
    if (b > a + 1.5 && d > 0) { if (!on) { c.moveTo(x, a); on = true; } c.lineTo(x, a); } else if (on) { c.lineTo(x, a + depth(x) * 0.9); c.closePath(); on = false; } }
  c.fill();
  const sh = c.createLinearGradient(0, y - amp, 0, y + 60); sh.addColorStop(0, 'rgba(30,30,60,0)'); sh.addColorStop(1, 'rgba(30,30,60,0.16)');
  path(); c.fillStyle = sh; c.fill();
}
function fieldsBeqaa(c, fy, col, t, nt = 0) { // strips of fields in perspective on the valley floor
  const cols = ['#8a8a48', '#a8904e', '#6e7a3a', '#b89a5a', '#7a8442'].map(x => mix(mix(x, col, 0.35), '#101210', nt * 0.85));
  for (let k = 0; k < 7; k++) { const y0 = fy + 8 + Math.pow(k / 7, 1.6) * 260, y1 = fy + 8 + Math.pow((k + 1) / 7, 1.6) * 260;
    for (let i = -14; i < 18; i++) { const xa = 540 + (i - 0.5) * lerp(160, 260, k / 7) + (k % 2) * 60, xb = xa + lerp(150, 250, k / 7);
      c.fillStyle = hexA(cols[(i * 3 + k * 7 + 50) % 5], 0.55); c.beginPath(); c.moveTo(xa, y0); c.lineTo(xb, y0); c.lineTo(xb + (xb - 540) * 0.08, y1); c.lineTo(xa + (xa - 540) * 0.08, y1); c.closePath(); c.fill(); } }
}
function lebanon(c, t, o = {}) {
  const fy = o.fy || 1300, px = o.px || 0, nt = o.night || 0, st = o.storm || 0;
  sky21(c, o.sky || 'gold', o.to, o.k || 0);
  if (o.stars) stars(c, t, 150, 21, [-600, -400, W + 1200, fy - 300], o.stars);
  if (o.sun !== false) { const sx = o.sunX === undefined ? 760 : o.sunX, sy = o.sunY === undefined ? fy - 560 : o.sunY, sa = (o.sunA === undefined ? 1 : o.sunA) * (1 - st);
    c.save(); c.globalCompositeOperation = 'lighter'; glow(c, sx, sy, 460, '#ffd8a0', 0.35 * sa); c.restore(); sun(c, sx, sy, 40, '#ffe2a8', sa); }
  if (o.moon) moon(c, o.moonX || 820, o.moonY || 480, 40, o.moon);
  wisps(c, t, fy - 950, 5, '#fff4e0', 0.12 * (1 - nt) * (1 - st), 21, 4);
  if (st > 0) { cloudBank(c, t, -120, 9, '#0e1016', 0.75 * st, 24, 9); cloudBank(c, t, 200, 8, '#24242c', 0.6 * st, 25, 6); }
  const far = mix(mix('#7c86a8', '#4a4a56', st), '#121630', nt), snow = mix(mix('#f6f2ee', '#9a9aa4', st), '#4a5070', nt), hz = mix(mix(o.haze || '#f2d0b0', '#5a5a62', st), '#262a48', nt);
  par(c, 0.06, px, 0, () => { snowRange(c, fy - 320, 380, 211, far, snow, fy - 560); hazeW(c, fy - 250, 260, hz, 0.5); });
  const mid = mix(mix('#4e5e48', '#2e322e', st), '#0c1014', nt), cd = mix(mix('#2a3a26', '#1a1e1a', st), '#060a08', nt);
  par(c, 0.25, px, 0, () => { ridgeW(c, fy - 140, 110, 0.003, 212, mid);
    for (let i = -16; i < 26; i++) { const x = i * 96 + (i % 3) * 22; cedar(c, x, ridgeY(x, fy - 140, 110, 0.003, 212) + 26 + (i % 2) * 12, 0.3 + (i % 4) * 0.03, cd, t, 30 + i); }
    hazeW(c, fy - 100, 160, hz, 0.4); });
  if (o.city) par(c, o.cityPar || 0.4, px, 0, () => o.city(c));
  const near = mix(mix('#7a7a4a', '#4a4a3a', st), '#10120e', nt);
  par(c, 0.55, px, 0, () => { ridgeW(c, fy - 24, 26, 0.004, 213, near); hazeW(c, fy, 60, hz, 0.22); });
  par(c, 1, px, 0, () => { plain(c, fy, t, { col: mix(mix('#94884e', '#5a5642', st), '#14140e', nt * 0.85), seed: o.seed || 21, n: o.n || 130 }); if (o.fields !== false) fieldsBeqaa(c, fy, '#94884e', t, nt); });
}

// 2) the idol Baal: a striding bronze statue, raised mace, a forked spear in the other hand, tall horned crown. Faceless: the head is a smooth
//    dark oval (it is a statue; nothing is drawn on it). fire: light of the braziers; dim: darkness of the storm.
function baal(c, x, y, s, t, o = {}) { t += 100;
  const fk = o.fire === undefined ? 1 : o.fire, dim = o.dim || 0;
  c.save(); c.translate(x, y); c.scale(s, s);
  const B = (d = 0) => { const g = c.createLinearGradient(-120, -650, 120, -100); g.addColorStop(0, mix(mix('#e0b070', '#4a3e36', dim), '#000000', d)); g.addColorStop(0.4, mix(mix('#9a6630', '#2e2622', dim), '#000000', d));
    g.addColorStop(1, mix(mix('#3a2410', '#141010', dim), '#000000', d)); return g; };
  if (fk > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -300, 420, '#ff9a40', 0.18 * fk * (0.92 + 0.08 * Math.sin(t * 7))); c.restore(); }
  // far leg (back), far arm raised with the mace
  limb(c, [16, -250], [32, -130], [48, -10], 44, 26, B(0.3)); c.fillStyle = mix('#2a1a0c', '#000000', 0.3); c.beginPath(); c.ellipse(62, -8, 28, 10, 0, 0, 6.283); c.fill();
  c.strokeStyle = B(0.25); c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(98, -560); c.lineTo(58, -700); c.stroke(); // mace shaft
  c.fillStyle = B(0.1); c.beginPath(); c.arc(54, -712, 24, 0, 6.283); c.fill(); c.fillStyle = hexA('#ffd890', 0.35 * fk * (1 - dim)); c.beginPath(); c.arc(46, -720, 8, 0, 6.283); c.fill();
  limb(c, [52, -436], [110, -470], [100, -560], 34, 24, B(0.25)); c.fillStyle = B(0.2); c.beginPath(); c.ellipse(100, -566, 17, 20, 0, 0, 6.283); c.fill();
  // near leg
  limb(c, [-16, -250], [-36, -130], [-60, -10], 48, 28, B()); c.fillStyle = '#2a1a0c'; c.beginPath(); c.ellipse(-74, -8, 30, 11, 0, 0, 6.283); c.fill();
  // kilt with pleats and a gold belt
  c.fillStyle = B(); c.beginPath(); c.moveTo(-48, -338); c.lineTo(48, -338); c.quadraticCurveTo(66, -280, 74, -222); c.quadraticCurveTo(0, -210, -74, -222); c.quadraticCurveTo(-66, -280, -48, -338); c.fill();
  c.strokeStyle = 'rgba(20,10,4,0.45)'; c.lineWidth = 3; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(k * 13, -326); c.lineTo(k * 19, -218); c.stroke(); }
  c.fillStyle = mix('#c89a3a', '#3a3230', dim); c.fillRect(-50, -342, 100, 16);
  // torso
  c.fillStyle = B(); c.beginPath(); c.moveTo(-62, -446); c.quadraticCurveTo(0, -458, 62, -446); c.quadraticCurveTo(54, -390, 44, -338); c.lineTo(-44, -338); c.quadraticCurveTo(-54, -390, -62, -446); c.fill();
  c.strokeStyle = 'rgba(20,10,4,0.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-34, -410); c.quadraticCurveTo(-10, -396, -2, -410); c.moveTo(2, -410); c.quadraticCurveTo(10, -396, 34, -410); c.stroke();
  // neck, head (smooth, faceless), crown with horns
  c.fillStyle = B(0.1); c.fillRect(-14, -474, 28, 30);
  c.fillStyle = B(0.05); c.beginPath(); c.ellipse(0, -498, 27, 33, 0, 0, 6.283); c.fill();
  c.fillStyle = 'rgba(10,6,4,0.45)'; c.beginPath(); c.ellipse(4, -494, 22, 28, 0, 0, 6.283); c.fill();
  limb(c, [-24, -524], [-62, -536], [-78, -598], 14, 5, B(0.1)); limb(c, [24, -524], [62, -536], [78, -598], 14, 5, B(0.2));
  c.fillStyle = B(); c.beginPath(); c.moveTo(-31, -518); c.quadraticCurveTo(-24, -600, -12, -648); c.quadraticCurveTo(0, -668, 12, -648); c.quadraticCurveTo(24, -600, 31, -518); c.closePath(); c.fill();
  c.fillStyle = B(); c.beginPath(); c.arc(0, -668, 10, 0, 6.283); c.fill();
  c.fillStyle = mix('#c89a3a', '#3a3230', dim); c.fillRect(-32, -530, 64, 10);
  // near arm, forward, holding the forked spear
  limb(c, [-54, -436], [-104, -418], [-140, -442], 34, 24, B()); c.fillStyle = B(); c.beginPath(); c.ellipse(-148, -444, 18, 17, 0, 0, 6.283); c.fill();
  c.strokeStyle = B(0.05); c.lineWidth = 9; c.lineJoin = 'round'; c.beginPath();
  [[-152, -560], [-136, -516], [-160, -484], [-146, -444], [-164, -398], [-148, -352], [-168, -290]].forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.stroke();
  c.fillStyle = B(); c.beginPath(); c.moveTo(-162, -556); c.lineTo(-152, -600); c.lineTo(-142, -556); c.closePath(); c.fill();
  // verdigris and the rim light of the fire
  const r = rng(77); c.fillStyle = hexA('#4a8a7a', 0.22 * (1 - dim)); for (let i = 0; i < 14; i++) { c.beginPath(); c.ellipse(-60 + r() * 120, -560 + r() * 520, 6 + r() * 10, 4 + r() * 8, r() * 3, 0, 6.283); c.fill(); }
  if (fk > 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,170,90,${0.45 * fk * (1 - dim)})`; c.lineWidth = 4; c.beginPath();
    c.moveTo(-60, -444); c.quadraticCurveTo(-56, -390, -44, -338); c.moveTo(-74, -224); c.quadraticCurveTo(-66, -280, -48, -338); c.moveTo(-30, -520); c.quadraticCurveTo(-24, -600, -12, -648);
    c.moveTo(-26, -490); c.quadraticCurveTo(-24, -520, -10, -528); c.moveTo(-58, -20); c.lineTo(-36, -130); c.stroke(); c.restore(); }
  c.restore();
}
function pedestal21(c, x, y, s, col = '#8a7058', dim = 0) { // stepped stone base with a carved zigzag band; returns the y of its top
  c.save(); c.translate(x, y); c.scale(s, s); col = mix(col, '#2a2626', dim * 0.7);
  c.fillStyle = 'rgba(10,6,4,0.35)'; c.beginPath(); c.ellipse(0, 4, 200, 20, 0, 0, 6.283); c.fill();
  [[170, 50, 0], [130, 50, 50], [96, 64, 100]].forEach(([hw, h, y0]) => { const g = c.createLinearGradient(-hw, 0, hw, 0); g.addColorStop(0, mix(col, '#ffe0c0', 0.25)); g.addColorStop(0.5, col); g.addColorStop(1, mix(col, '#000000', 0.45));
    c.fillStyle = g; c.fillRect(-hw, -y0 - h, hw * 2, h); c.fillStyle = mix(col, '#fff0d8', 0.3); c.fillRect(-hw, -y0 - h, hw * 2, 5); });
  c.strokeStyle = hexA('#2a1a10', 0.5); c.lineWidth = 3; c.beginPath(); for (let k = 0; k <= 12; k++) { const xx = -90 + k * 15; k ? c.lineTo(xx, -134 + (k % 2) * 16) : c.moveTo(xx, -134); } c.stroke();
  c.restore(); return y - 164 * s;
}
function brazier(c, x, y, s, t, k = 1, seed = 1) { t += 100; // a bronze bowl on a tripod with a fire
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(0, 3, 60, 8, 0, 0, 6.283); c.fill();
  c.strokeStyle = '#3a2614'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(-46, 0); c.lineTo(-10, -140); c.moveTo(46, 0); c.lineTo(10, -140); c.moveTo(0, 6); c.lineTo(0, -140); c.stroke();
  c.fillStyle = '#6a4424'; c.beginPath(); c.moveTo(-58, -150); c.quadraticCurveTo(0, -96, 58, -150); c.closePath(); c.fill(); c.fillStyle = '#9a6a38'; c.fillRect(-60, -154, 120, 7);
  if (k > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -190, 340, '#ff8a3a', 0.42 * k * (0.9 + 0.1 * Math.sin(t * 9 + seed))); c.restore();
    [['#ff6a1a', 40, 110], ['#ffa83a', 26, 80], ['#ffe08a', 12, 46]].forEach(([col, w, hh], j) => { c.fillStyle = col; c.globalAlpha = Math.min(1, k * 1.4); c.beginPath(); c.moveTo(-w, -152);
      c.quadraticCurveTo(-w + Math.sin(t * 8 + seed + j) * 8, -152 - hh * 0.6 * k, Math.sin(t * 7 + seed + j) * 10, -152 - hh * k - Math.sin(t * 13 + seed) * 10 * k); c.quadraticCurveTo(w, -152 - hh * 0.5 * k, w, -152); c.fill(); });
    c.globalAlpha = 1; }
  else { c.fillStyle = 'rgba(255,90,30,0.4)'; c.beginPath(); c.ellipse(0, -152, 40, 5, 0, 0, 6.283); c.fill(); }
  c.restore();
  smoke(c, t, x, y - 250 * s, 4, seed + 40, '#2a2226', 0.28 * Math.max(0.3, k), 0.5 * s, 34 * s);
}

// 3) the temple court of Baal (hero): portico of columns on a low wall, snowy range seen between the columns, flagstones,
//    the idol on its stepped base between two braziers, the crowd prostrated toward it; Ilyas alone, standing, in the foreground.
const PFY = 1240, IDX = 800;
const hP = y => 100 + (y - PFY) * 0.6; // figure height for a foot line y (perspective of the court)
const PROS = (() => { const r = rng(2101), L = []; [[1282, 170, 640, 5], [1335, 190, 700, 4], [1420, 200, 730, 3], [1520, 300, 760, 2]].forEach(([y, x0, x1, n], row) => {
  for (let i = 0; i < n; i++) L.push({ x: lerp(x0, x1, (i + 0.5) / n) + (r() - 0.5) * 36, y: y + (r() - 0.5) * 14, f: (row * 3 + i * 5) % BAALP.length, ph: r() * 6, d: r() }); });
  return L.sort((a, b) => a.y - b.y); })();
function crowdFig(c, p, t, m = {}) { // m.bow 0..1: from standing to bowed (then prostrated); m.turn: they stand and face Ilyas; m.leave: walking away (px)
  const h = hP(p.y), who = BAALP[p.f], tt = t + p.ph, base = { x: p.x, y: p.y, h, t: tt, light: m.light || 0.75, wind: 0.2, ink: 0.7 };
  if (m.leave !== undefined) { const d = Math.max(0, m.leave - p.d * 60); fig(c, who, Object.assign(base, { x: p.x + d, dir: 1, walk: stepOf(d, h) + p.ph })); return; }
  if (m.raise !== undefined) { fig(c, who, Object.assign(base, { dir: 1, armUp: 0.75 * clamp(m.raise * 1.3 - p.d * 0.3) })); return; }
  if (m.turn !== undefined) { fig(c, who, Object.assign(base, { dir: lerp(1, -1, ease(clamp(m.turn * 1.3 - p.d * 0.3))), reach: (m.point || 0) * (p.d > 0.4 ? 0.8 : 0) })); return; }
  const b = m.bow === undefined ? 1 : clamp(m.bow * 1.2 - p.d * 0.2);
  if (b >= 1) fig(c, who, Object.assign(base, { pose: 'prostrate', dir: 1 }));
  else if (b > 0.5) fig(c, who, Object.assign(base, { pose: 'kneel', dir: 1 }));
  else lean(c, p.x, p.y, 0.6 * ease(b * 2), () => fig(c, who, Object.assign(base, { dir: 1 })));
}
function portico(c, t, o = {}) {
  const dim = o.dim || 0, stoneC = mix(mix('#c8a47a', '#7a5a46', 0.35), '#2a2830', dim * 0.7);
  ashlar(c, -900, PFY - 170, W + 900, PFY + 6, stoneC, 21);
  for (let i = -5; i < 13; i++) { const x = i * 150 + 20; column(c, x, PFY - 150, 60, 470, mix(stoneC, '#fff0d8', 0.1), { band: mix(GOLD, '#3a3430', dim) }); }
  c.fillStyle = mix(stoneC, '#000000', 0.1); c.fillRect(-900, PFY - 668, W + 1800, 52); c.fillStyle = mix(stoneC, '#fff0d8', 0.25); c.fillRect(-900, PFY - 668, W + 1800, 8);
  c.fillStyle = mix(stoneC, '#000000', 0.3); for (let x = -900; x < W + 900; x += 36) c.fillRect(x, PFY - 616, 18, 10);
  flagFloor(c, PFY, 640, mix('#b08a64', '#3a3434', dim * 0.7), { sheen: 0.12 * (o.fire === undefined ? 1 : o.fire), sheenX: IDX, sheenCol: '#ff9a50' });
}
function courtBack(c, t, o = {}) { // sky + range + portico + idol + braziers (no people)
  const dim = o.dim || 0, fk = o.fire === undefined ? 1 : o.fire;
  sky21(c, o.sky || 'dusk', o.to, o.k || 0);
  stars(c, t, 80, 22, [-500, -300, W + 1000, 700], 0.5 * (o.stars === undefined ? 1 : o.stars));
  if (o.sun !== false) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 220, 1010, 520, '#ffb070', 0.4 * (1 - dim)); c.restore(); }
  if (dim > 0) { cloudBank(c, t, -160, 9, '#0c0e14', 0.8 * dim, 26, 9); cloudBank(c, t, 160, 8, '#20202a', 0.6 * dim, 27, 6); }
  snowRange(c, PFY - 380, 330, 214, mix(mix('#6a5a78', '#3a3a46', dim), '#141626', 0.2), mix(mix('#f6d8c8', '#8a8a96', dim), '#3a3a50', 0.15), PFY - 600);
  hazeW(c, PFY - 300, 240, mix('#f0a878', '#4a4a56', dim), 0.45);
  if (o.lightning) lightning(c, o.lx || 980, -100, PFY - 400, o.lightning, o.lseed || 4);
  portico(c, t, { dim, fire: fk });
  brazier(c, 610, PFY + 116, 1.0, t, fk, 1);
  const top = pedestal21(c, IDX, PFY + 96, 1.0, '#8a7058', dim);
  baal(c, IDX, top, o.bs || 0.98, t, { fire: fk, dim });
  brazier(c, 995, PFY + 110, 1.0, t, fk, 2);
}
const HERO_ILY = { x: 150, y: 1850, h: 620 };
function iHero(c, T, o = {}) {
  const z = o.z || 1, cx = o.cx || 540, cy = o.cy || 1150;
  cam(c, z + 0.004 * Math.sin(T * 0.3), cx, cy);
  courtBack(c, T, o);
  // two torch-bearers at the sides of the court
  [[70, 1268, 1], [1030, 1262, -1]].forEach(([x, y, d], i) => { const so = { x, y, h: hP(y) * 1.05, dir: d, reach: 0.35, light: 0.8, t: T + i * 2, wind: 0.2, ink: 0.7 }; fig(c, BAALP[i ? 6 : 2], so); heldTorch(c, so, T, i); });
  PROS.forEach(p => crowdFig(c, p, T, Object.assign({ bow: o.bow, light: 0.75 }, o.crowd || {})));
  dust(c, T, 26, 2102, [0, 700, W, 900], '#ffc890', 0.22);
  if (o.ily !== false) { const io = Object.assign({}, ILY, HERO_ILY, { dir: 1, staff: !o.armUp && !o.reach, armUp: o.armUp || 0, reach: o.reach || 0, light: 1, t: T, wind: o.wind || 0.5, veilGlow: 0.4 });
    if (o.halo) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, HERO_ILY.x + 20, HERO_ILY.y - 330, 520, '#fff2d0', 0.3 * o.halo); c.restore(); rays(c, HERO_ILY.x + 20, -100, Math.PI / 2, 0.5, 2000, 9, '#fff6e0', 0.07 * o.halo, T, 31); }
    fig(c, ILY, io); }
  blurred(c, 8, () => { boulder(c, 1060, 2080, 300, 120, '#5a4636', 5); shrub(c, 1120, 2030, 3.6, '#3a3420', T, 3); });
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// 4) a carving workshop (hands): a limestone block roughed into a crowned figure, a chisel and a mallet in big hands (no face)
function roughIdol(c, x, y, s, k = 1) { // a limestone figure half carved out of its block: crowned head, shoulders, a raised arm still in the rough
  c.save(); c.translate(x, y); c.scale(s, s);
  const col = '#c9b08a', dk = mix(col, '#2a1a10', 0.5), lt = mix(col, '#fff8e8', 0.4);
  const G = () => { const g = c.createLinearGradient(-140, -560, 160, 0); g.addColorStop(0, dk); g.addColorStop(0.45, col); g.addColorStop(0.8, lt); g.addColorStop(1, col); return g; };
  c.fillStyle = 'rgba(10,6,4,0.35)'; c.beginPath(); c.ellipse(0, 4, 170, 16, 0, 0, 6.283); c.fill();
  c.fillStyle = G(); c.beginPath(); c.moveTo(-130, 0); c.lineTo(-124, -170); c.lineTo(-90, -176); c.lineTo(-74, -300); c.lineTo(-70, -330); c.quadraticCurveTo(-84, -390, -78, -404); // block, legs, torso
  c.lineTo(-34, -414); c.lineTo(-16, -420); c.lineTo(16, -420); c.lineTo(46, -414); c.lineTo(66, -420); c.lineTo(78, -470); c.lineTo(lerp(96, 84, k), -540); c.lineTo(110, -546); c.lineTo(124, -470); // raised arm in the rough
  c.lineTo(96, -400); c.quadraticCurveTo(84, -360, 72, -330); c.lineTo(76, -300); c.lineTo(92, -176); c.lineTo(128, -170); c.lineTo(134, 0); c.closePath(); c.fill();
  c.beginPath(); c.ellipse(0, -452, 25, 31, 0, 0, 6.283); c.fill(); // head
  c.beginPath(); c.moveTo(-26, -474); c.quadraticCurveTo(-18, -540, -6, -578); c.quadraticCurveTo(0, -592, 6, -578); c.quadraticCurveTo(18, -540, 26, -474); c.closePath(); c.fill(); // crown
  c.strokeStyle = hexA(dk, 0.55); c.lineWidth = 3; c.beginPath(); c.moveTo(-74, -300); c.lineTo(76, -300); c.moveTo(-8, -300); c.lineTo(-14, -176); c.moveTo(-124, -170); c.lineTo(128, -170); c.moveTo(-28, -484); c.lineTo(28, -484); c.stroke();
  c.fillStyle = hexA('#fff8e8', 0.35); c.beginPath(); c.moveTo(70, -330); c.lineTo(96, -400); c.lineTo(84, -330); c.closePath(); c.fill();
  c.strokeStyle = hexA(dk, 0.45); c.lineWidth = 2; const r = rng(55); c.beginPath(); // chisel marks
  for (let i = 0; i < 90; i++) { const py = -20 - r() * 520, w = py < -420 ? 20 : py < -300 ? 70 : py < -176 ? 80 : 120, px = (r() - 0.5) * 2 * w; c.moveTo(px, py); c.lineTo(px + 5 + r() * 8, py + 4 + r() * 6); } c.stroke();
  c.fillStyle = 'rgba(236,224,200,0.8)'; for (let i = 0; i < 26; i++) { c.beginPath(); c.ellipse(-170 + r() * 340, 2 - r() * 6, 3 + r() * 6, 2 + r() * 3, 0, 0, 6.283); c.fill(); } // chips on the bench
  c.restore();
}
function chips(c, t, x, y, t0, seed = 1) { // stone chips and dust flying from the chisel point (gravity)
  const q = t - t0; if (q < 0 || q > 1.0) return; const r = rng(seed);
  for (let i = 0; i < 14; i++) { const vx = -(80 + r() * 320), vy = -(120 + r() * 260), px = x + vx * q, py = y + vy * q + 700 * q * q, a = 1 - q;
    c.fillStyle = `rgba(236,224,200,${a})`; c.beginPath(); c.arc(px, py, 2 + r() * 4, 0, 6.283); c.fill(); }
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y, 60, '#fff2d8', 0.5 * Math.max(0, 1 - q * 4)); c.restore();
  const g = c.createRadialGradient(x - 40 * q, y - 30 * q, 0, x - 40 * q, y - 30 * q, 40 + 120 * q); g.addColorStop(0, `rgba(220,206,180,${0.35 * (1 - q)})`); g.addColorStop(1, 'rgba(220,206,180,0)');
  c.fillStyle = g; c.fillRect(x - 300, y - 300, 600, 600);
}
function malletPose(t, strikes) { // 0 = on the chisel, 1 = raised; drops fast just before each strike
  let tp = -9, tn = 99; strikes.forEach(s => { if (s <= t && s > tp) tp = s; if (s > t && s < tn) tn = s; });
  if (tn - t < 0.16) return 1 - ease(1 - (tn - t) / 0.16);
  return ease(clamp((t - tp) / 0.45));
}
function carving(c, t, strikes, o = {}) {
  const sleeve = '#5a3a26', skin = '#a8714f';
  // workshop: warm stone wall, a window of light, shelves, a lamp
  ashlar(c, -400, -200, W + 400, 1650, '#8a6a4c', 22);
  c.fillStyle = '#1a0e08'; c.beginPath(); archPath(c, 860, 900, 240, 520); c.fill();
  const wg = c.createLinearGradient(0, 380, 0, 900); wg.addColorStop(0, '#ffe2b0'); wg.addColorStop(1, '#f0a868'); c.fillStyle = wg; c.beginPath(); archPath(c, 860, 900, 200, 480); c.fill();
  c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,220,170,0.12)'; c.beginPath(); c.moveTo(760, 440); c.lineTo(960, 440); c.lineTo(420, 1700); c.lineTo(80, 1700); c.closePath(); c.fill(); c.restore();
  c.fillStyle = '#5a3a20'; c.fillRect(-100, 760, 520, 18); jar(c, 60, 760, 0.9); jar(c, 190, 760, 0.7, '#8a5a3a'); oilLamp(c, 320, 760, 1.1, 1, t);
  c.fillStyle = '#6a5038'; c.fillRect(-400, 1650, W + 800, 900); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(-400, 1650, W + 800, 10);
  c.fillStyle = '#5a3a20'; c.fillRect(120, 1560, 620, 40); c.fillRect(160, 1600, 30, 110); c.fillRect(670, 1600, 30, 110); // bench
  roughIdol(c, 420, 1560, 1.55, o.k === undefined ? 0.8 : o.k);
  // chisel hand (from the bottom right) and mallet hand (from the top right)
  const tip = [552, 1066], butt = [716, 1046];
  c.strokeStyle = '#8a8e96'; c.lineWidth = 12; c.lineCap = 'butt'; c.beginPath(); c.moveTo(tip[0], tip[1]); c.lineTo(butt[0], butt[1]); c.stroke();
  c.strokeStyle = '#c8ccd4'; c.lineWidth = 3; c.beginPath(); c.moveTo(tip[0] + 4, tip[1] - 4); c.lineTo(butt[0], butt[1] - 4); c.stroke();
  c.fillStyle = '#6a4a2a'; c.fillRect(butt[0] - 70, butt[1] - 13, 50, 26);
  arm(c, 1200, 1330, 690, 1090, 1.15, sleeve, skin, 1.75);
  const m = malletPose(t, strikes), head = [lerp(butt[0] + 26, butt[0] + 120, m), lerp(butt[1] - 4, butt[1] - 300, m)], ang = lerp(0.1, -0.7, m);
  const hnd = [head[0] + Math.cos(ang) * 150, head[1] + Math.sin(ang) * 150 + 30];
  arm(c, 1200, lerp(1000, 760, m), hnd[0] + 20, hnd[1] - 10, 1.15, sleeve, skin, 0.9);
  c.save(); c.translate(head[0], head[1]); c.rotate(ang);
  c.fillStyle = '#7a5434'; c.fillRect(0, -7, 160, 14); c.fillStyle = '#5a3a20'; c.fillRect(-26, -38, 52, 76); c.fillStyle = 'rgba(255,240,210,0.18)'; c.fillRect(-26, -38, 52, 8); c.restore();
  strikes.forEach((s, i) => chips(c, t, tip[0], tip[1], s, 60 + i));
}

// 5) sound that goes out and comes back with nothing (the statue neither hears nor answers)
function callRings(c, x0, y0, x1, y1, t, t0, a = 1) { if (a <= 0 || t < t0) return; t += 100; t0 += 100;
  for (let k = 0; k < 3; k++) { const q = ((t - t0) * 0.55 - k * 0.22); if (q <= 0 || q >= 1) continue; const x = lerp(x0, x1, q), y = lerp(y0, y1, q);
    c.strokeStyle = `rgba(255,236,200,${0.6 * a * Math.sin(q * Math.PI)})`; c.lineWidth = 5; c.beginPath(); c.arc(x, y, 30 + q * 50, -0.7, 0.7); c.stroke(); } }

// 6) a lectern with the open Book, a seated reader seen from behind and the side (today); lines of light rising
function recite(c, t, o = {}) {
  const dk = o.dark || 0;
  ashlar(c, -400, -200, W + 400, 1500, mix('#7a5a42', '#2a2028', dk), 23);
  c.fillStyle = mix('#2a1a12', '#0a0608', dk); c.beginPath(); archPath(c, 540, 1460, 520, 900); c.fill(); // a carved niche
  c.strokeStyle = mix('#c8a46a', '#5a4a3a', dk); c.lineWidth = 10; c.beginPath(); archPath(c, 540, 1460, 560, 940); c.stroke();
  c.save(); c.beginPath(); archPath(c, 540, 1460, 500, 880); c.clip(); lattice(c, 290, 560, 500, 900, '#c8a46a', 0.18); c.restore();
  for (let i = 0; i < 2; i++) { const lx = 170 + i * 740; c.strokeStyle = '#2a1a10'; c.lineWidth = 2; c.beginPath(); c.moveTo(lx, 380); c.lineTo(lx, 560); c.stroke(); lanternBox(c, lx, 590, 1.3, t, i); }
  flagFloor(c, 1500, 540, mix('#7a5a42', '#2a2420', dk), { sheen: 0.15, sheenCol: '#ffc070' });
  rug(c, 540, 1620, 820, 260, '#7a2a22');
  const ro = { x: 330, y: 1720, h: 520, dir: 1, pose: 'sit', light: 0.9, t, wind: 0, ink: 1 };
  fig(c, BAALP[1], Object.assign({}, ro, { robe: '#3a4a3a', wrap: '#ece4d4', trim: '#c9a35a' }));
  rehal(c, 660, 1700, 2.4);
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 660, 1540, 300, '#ffe0a0', 0.4 * (o.glow === undefined ? 1 : o.glow)); c.restore();
}
function risingVerse(c, t, k, x, y) { if (k <= 0) return; // the verse rising as soft gold lines from the open book, one after another
  c.save(); c.direction = 'rtl'; for (let i = 0; i < 3; i++) { const q = clamp(k * 2 - i * 0.55); if (q <= 0 || q >= 1) continue;
    textGlow(c, 'سلام على إل ياسين', x - 40 + Math.sin(i * 2.3) * 40, y - 60 - q * 520, `700 ${64 - i * 6}px Amiri`, '#f6c453', Math.sin(q * Math.PI) * 0.95, '#ffb300', 22); }
  c.restore(); }

// 8) today's world at night: far carpets of light, cities with domes and minarets, lit windows (all over the world)
function skyline(c, x0, x1, y, s, col, seed, lit, t) { const r = rng(seed); let x = x0;
  while (x < x1) { const w = (40 + r() * 90) * s, h = (60 + r() * 160) * s, kind = r();
    c.fillStyle = col; c.fillRect(x, y - h, w, h + 400);
    if (kind < 0.18) { c.beginPath(); c.ellipse(x + w / 2, y - h, w * 0.45, w * 0.5, 0, Math.PI, 0); c.fill(); c.fillRect(x + w / 2 - 2 * s, y - h - w * 0.5 - 14 * s, 4 * s, 14 * s); }
    else if (kind < 0.3) { const mx = x + w * 0.8, mh = h + (110 + r() * 80) * s; c.fillRect(mx - 7 * s, y - mh, 14 * s, mh); c.fillRect(mx - 11 * s, y - mh * 0.78, 22 * s, 6 * s);
      c.beginPath(); c.moveTo(mx - 8 * s, y - mh); c.lineTo(mx, y - mh - 26 * s); c.lineTo(mx + 8 * s, y - mh); c.fill();
      c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(255,220,150,${0.35 * lit})`; c.fillRect(mx - 11 * s, y - mh * 0.78 - 3 * s, 22 * s, 3 * s); c.restore(); }
    for (let wy = y - h + 12 * s; wy < y - 8 * s; wy += 18 * s) for (let wx = x + 8 * s; wx < x + w - 10 * s; wx += 16 * s) if (r() < 0.22 * lit) {
      const tw = 0.7 + 0.3 * Math.sin(t * 0.7 + wx * 0.37 + wy); c.fillStyle = `rgba(255,${200 + (r() * 40 | 0)},130,${0.75 * tw})`; c.fillRect(wx, wy, 6 * s, 8 * s); }
    x += w + r() * 10 * s; }
}
function nightCities(c, t, o = {}) {
  sky0(c, [[0, '#03050e'], [0.35, '#0c1230'], [0.55, '#1e2444']]);
  stars(c, t, 170, 2121, [-300, -300, W + 600, 1100], 0.9); moon(c, 820, 430, 44, 0.95, 0.5);
  const r = rng(2122); for (let i = 0; i < 260; i++) { const q = Math.pow(r(), 1.4), yy = 1180 + q * 160, xx = -400 + r() * 1900; c.fillStyle = `rgba(255,${190 + (r() * 50 | 0)},120,${0.25 + 0.5 * r()})`; c.fillRect(xx, yy, 1.5 + q * 2.5, 1.5 + q * 2.5); }
  hazeW(c, 1200, 200, '#3a3a60', 0.35);
  skyline(c, -500, 1700, 1420, 0.8, '#121630', 2123, 0.8, t); hazeW(c, 1440, 160, '#2a2a50', 0.35);
  skyline(c, -500, 1700, 1660, 1.3, '#0a0c1a', 2124, 1, t);
  const g = c.createLinearGradient(0, 1640, 0, H + 300); g.addColorStop(0, '#0a0a14'); g.addColorStop(1, '#040408'); c.fillStyle = g; c.fillRect(-600, 1640, W + 1200, H);
}

// 7) a lone spur of rock high on the range (call / peace / lesson): Ilyas stands on it
const spurY = x => 1660 - Math.max(0, x - 520) * 0.5 + Math.sin(x * 0.01) * 8;
function spur(c, t, o = {}) { const col = o.col || '#6a5a4a';
  const g = c.createLinearGradient(0, 1300, 0, H + 200); g.addColorStop(0, mix(col, '#ffe0c0', 0.2)); g.addColorStop(1, mix(col, '#000000', 0.5));
  c.fillStyle = g; c.beginPath(); c.moveTo(-500, H + 400); c.lineTo(-500, spurY(-500)); for (let x = -500; x <= 1700; x += 16) c.lineTo(x, spurY(x)); c.lineTo(1700, H + 400); c.closePath(); c.fill();
  c.strokeStyle = hexA(mix(col, '#fff0d8', 0.4), 0.6); c.lineWidth = 4; c.beginPath(); for (let x = -500; x <= 1700; x += 16) x === -500 ? c.moveTo(x, spurY(x)) : c.lineTo(x, spurY(x)); c.stroke();
  const r = rng(91); c.strokeStyle = hexA(mix(col, '#000000', 0.4), 0.4); c.lineWidth = 3; c.beginPath();
  for (let i = 0; i < 26; i++) { const x = -300 + r() * 1900, y0 = spurY(x) + 30 + r() * 200; c.moveTo(x, y0); c.lineTo(x + 40 + r() * 60, y0 + 10 + r() * 30); } c.stroke();
  if (o.cedar !== false) cedar(c, o.cedarX || 900, spurY(o.cedarX || 900) + 10, o.cedarS || 1.3, mix('#2a3a26', '#0a0e0a', o.night || 0), t, 9);
}

const flashes = (q, list, k = 7) => list.reduce((m, s) => Math.max(m, s <= q ? Math.exp(-(q - s) * k) : 0), 0);
const cityIdol = (o = {}) => c => { const x = o.x || 560, y = o.y || 1312, s = o.s || 0.42; sodomCity(c, 0, x, y, s, { lamp: o.lamp || 0.3, night: o.night || 0, seed: 21 });
  const ty = y - 440 * s; c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, ty - 60 * s, 180 * s, '#ff9a40', 0.5 * (o.fire === undefined ? 1 : o.fire)); c.restore();
  baal(c, x, ty, s * 0.32, 0, { fire: o.fire === undefined ? 1 : o.fire, dim: o.dim || 0 }); smoke(c, 0, x, ty - 260 * s, 3, 77, '#2a2226', 0.25, s, 20 * s); };
function quote2(c, l1, l2, a, y = 270, s1 = 76, s2 = 76, c2 = '#f6c453') { if (a <= 0) return; topShade(c, a * 1.3); bigWord(c, l1, y, a, s1); if (l2) bigWord(c, l2, y + 104, a, s2, c2); }


// =====================================================================================================================
// Episode 22 — Idris (alayhi salam): "We raised him to a high station" (Maryam 56-57), the fourth heaven (Night Journey)
// =====================================================================================================================
const IDR = { veilGlow: 0.45, prophet: true, robe: '#ece6d8', wrap: '#f7f3ea', skin: '#c49470', trim: '#d6b870', band: '#c9a35a', inner: '#fbf8f0' };
const EARLY = [ // the first peoples: plain undyed wool, earth tones
  { robe: '#7a5a3e', wrap: '#e0d0b0', skin: '#a8714f' }, { robe: '#5a4a3a', wrap: '#d8c8a8', skin: '#8f5f42' },
  { robe: '#6a5236', wrap: '#e8dcc4', skin: '#b07a58', covered: true, agal: false }, { robe: '#4a4a3a', wrap: '#d0c0a0', skin: '#94664a' },
  { robe: '#8a6a48', wrap: '#ece0c8', skin: '#b4805c' }, { robe: '#5a3e30', wrap: '#e2d4b8', skin: '#9a6a4c', covered: true, agal: false },
  { robe: '#3e4a3a', wrap: '#ddd2bc', skin: '#a8714f' }, { robe: '#6e4a36', wrap: '#d6c29c', skin: '#8f5f42' },
];
SKY16.storm = [[0, '#3a3430'], [0.3, '#7a6a5a'], [0.5, '#c8a070']];
function shade22(c, a, h = 760) { if (a <= 0) return; const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, `rgba(8,6,16,${0.75 * a})`); g.addColorStop(0.7, `rgba(8,6,16,${0.45 * a})`); g.addColorStop(1, 'rgba(8,6,16,0)'); c.fillStyle = g; c.fillRect(0, 0, W, h); }
function farHeavens(c, T, o = {}) { cosmos(c, T, { hi: 3, hk: o.hk || 0, ay: 1300, gy: 1100, gk: 0.8 }); cloudPuffs(c, T, 1260, 20, '#5a4a7a', '#d8c0d0', 2290, 0.5, 3);
  heavenGate(c, 540, 1270, 0.42, T, { open: o.open === undefined ? 0.8 : o.open }); cloudSea(c, T, 1300, { lit: 0.6 }); }
// text with the honorific ﷺ drawn in Amiri (Lora has no such glyph): parts measured and centred together
function textS(c, txt, y, a, font, size, col, blur = 22) { if (a <= 0) return;
  const parts = txt.split('ﷺ'), fa = `700 ${Math.round(size * 1.15)}px Amiri`; c.save(); c.font = font; const ws = parts.map(p => c.measureText(p).width); c.font = fa; const sw = c.measureText('ﷺ').width; c.restore();
  const total = ws.reduce((m, w) => m + w, 0) + sw * (parts.length - 1); let x = W / 2 - total / 2;
  parts.forEach((p, i) => { if (p) { textGlow(c, p, x + ws[i] / 2, y, font, col, a, '#000', blur); } x += ws[i];
    if (i < parts.length - 1) { c.save(); c.direction = 'rtl'; textGlow(c, 'ﷺ', x + sw / 2, y - size * 0.05, fa, '#f6c453', a, '#000', blur * 0.6); c.restore(); x += sw; } });
}
function bigWordS(c, txt, y, a, size = 96, col = '#fff6e0') { textS(c, txt, y, a, `700 ${size}px Lora`, size, col); }
function seriesTag22(c, a) { seriesTag(c, a, 22); }
const SKY22 = { cosmos: [[0, '#05071c'], [0.3, '#141640'], [0.5, '#3a2e62']], dawn: [[0, '#2e3a6a'], [0.3, '#b898a8'], [0.5, '#ffd6a4']],
  gold: [[0, '#3e4c80'], [0.3, '#cf9c80'], [0.5, '#ffd49a']], dusk: [[0, '#1e2040'], [0.3, '#6a3a58'], [0.5, '#f08850']],
  day: [[0, '#4f7fb4'], [0.3, '#9fbedc'], [0.5, '#eadcc0']], storm: [[0, '#3a3430'], [0.3, '#8a6a4a'], [0.5, '#d8a868']] };
function sky22(c, a, b, k = 0) { let st = SKY22[a]; if (b) st = st.map((s, i) => [s[0], mix(s[1], SKY22[b][i][1], clamp(k))]); sky0(c, st); }

// 1) the heavens: deep sky, stars, a soft band of the galaxy, seven stacked arcs of light (the seven heavens, as light only: no form)
function heavenArcs(c, t, cx, cy, a, hi = -1, hk = 0, nums = 0) { t += 100; if (a <= 0) return;
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) { const rx = 520 + i * 230, ry = 150 + i * 92, on = i === hi ? hk : 0, sh = 0.75 + 0.25 * Math.sin(t * 0.6 + i * 1.3);
    c.strokeStyle = `rgba(255,236,190,${a * (0.05 + 0.06 * sh + 0.4 * on)})`; c.lineWidth = 26 + on * 20; c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, Math.PI * 1.02, Math.PI * 1.98); c.stroke();
    c.strokeStyle = `rgba(255,248,225,${a * (0.12 + 0.08 * sh + 0.6 * on)})`; c.lineWidth = 2.5 + on * 3; c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, Math.PI * 1.02, Math.PI * 1.98); c.stroke(); }
  c.restore();
  if (nums > 0) for (let i = 0; i < 7; i++) { const v = clamp(nums - i); if (v <= 0) break; const ry = 150 + i * 92, y = cy - ry, big = i === Math.ceil(nums) - 1;
    c.save(); c.globalCompositeOperation = 'lighter'; glow(c, cx, y, 80 + (big ? 70 : 0), '#ffe0a0', 0.55 * v); c.restore();
    textGlow(c, String(i + 1), cx, y + 2, `700 ${big ? 84 : 54}px Lora`, i === 3 ? '#f6c453' : '#fff3dc', a * v, '#000', 10); }
}
function cosmos(c, t, o = {}) {
  sky22(c, 'cosmos', o.to, o.k || 0);
  stars(c, t, 220, 2201, [-700, -900, W + 1400, 2200], 0.95);
  stars(c, t, 60, 2202, [-700, -900, W + 1400, 2200], 0.6);
  milkyWay(c, t, 0.9);
  c.save(); c.globalCompositeOperation = 'lighter';
  glow(c, 220, 380, 520, '#6a5aa8', 0.16); glow(c, 900, 760, 600, '#a86a9a', 0.12); glow(c, 540, o.gy || 1250, 900, '#ffd8a0', 0.22 * (o.gk === undefined ? 1 : o.gk));
  c.restore();
  heavenArcs(c, t, 540, o.ay || 1500, o.arcs === undefined ? 1 : o.arcs, o.hi, o.hk || 0, o.nums || 0);
}
// a sea of clouds lit from above (floor of the heavens), layers drawn far wider than the frame
function cloudPuffs(c, t, y, n, col, top, seed, s = 1, drift = 6) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) { const x = -900 + r() * 2900 + Math.sin(t * 0.12 + i) * 10 + t * drift * (r() - 0.5), yy = y + r() * 40, w = (160 + r() * 220) * s, h = (50 + r() * 50) * s;
    const g = c.createLinearGradient(0, yy - h, 0, yy + h * 0.6); g.addColorStop(0, top); g.addColorStop(0.55, col); g.addColorStop(1, mix(col, '#000000', 0.25));
    c.fillStyle = g; c.beginPath(); c.ellipse(x, yy, w, h, 0, 0, 6.283); c.fill(); }
}
function cloudSea(c, t, y, o = {}) {
  const k = o.lit === undefined ? 1 : o.lit;
  const g = c.createLinearGradient(0, y - 40, 0, H + 400); g.addColorStop(0, mix('#c8b0c8', '#ffe8c8', 0.4 * k)); g.addColorStop(0.35, '#7a6a98'); g.addColorStop(1, '#2a2448');
  c.fillStyle = g; c.fillRect(-1500, y, W + 3000, H + 1500);
  cloudPuffs(c, t, y - 30, 26, '#8a7aa8', mix('#e8d8e8', '#fff0d0', 0.5 * k), 2210, 0.7);
  cloudPuffs(c, t, y + 60, 22, '#6a5a8a', mix('#c8b8d8', '#ffe2c0', 0.4 * k), 2211, 1.0);
  cloudPuffs(c, t, y + 220, 16, '#4a4070', mix('#a898c0', '#f0d0b0', 0.3 * k), 2212, 1.5);
  c.save(); c.globalCompositeOperation = 'lighter'; c.translate(540, y + 120); c.scale(1, 0.18); glow(c, 0, 0, 900, '#ffe8c0', 0.35 * k); c.restore();
}
// the gate of a heaven: two pillars with gold bands, a pointed arch, geometric star ornaments, light pouring through (no figure inside)
function star8(c, x, y, r, col, lw = 2) { c.strokeStyle = col; c.lineWidth = lw; for (let k = 0; k < 2; k++) { c.beginPath(); for (let i = 0; i < 4; i++) { const a = k * Math.PI / 4 + i * Math.PI / 2; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath(); c.stroke(); } }
function heavenGate(c, x, y, s, t, o = {}) { t += 100;
  const op = o.open === undefined ? 1 : o.open, gw = 300, gh = 640;
  c.save(); c.translate(x, y); c.scale(s, s);
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -gh * 0.45, 700, '#ffe2b0', 0.32 * op); c.restore();
  rays(c, 0, -gh * 0.5, -Math.PI / 2, 3.6, 1100, 18, '#fff2d0', 0.07 * op, t, 2221);
  // inner light
  const li = c.createRadialGradient(0, -gh * 0.42, 10, 0, -gh * 0.42, gh * 0.75); li.addColorStop(0, '#ffffff'); li.addColorStop(0.45, mix('#fff2d4', '#ffe0a8', 0.3)); li.addColorStop(1, '#e8b878');
  c.fillStyle = li; c.globalAlpha *= 0.55 + 0.45 * op; c.beginPath(); archPath(c, 0, 0, gw, gh); c.fill(); c.globalAlpha = 1;
  c.save(); c.beginPath(); archPath(c, 0, 0, gw, gh); c.clip(); lattice(c, -gw / 2, -gh, gw, gh, '#ffffff', 0.12, 40);
  const r = rng(2222); for (let i = 0; i < 16; i++) { const ph = (t * (0.08 + r() * 0.06) + r()) % 1; c.fillStyle = `rgba(255,250,235,${0.7 * Math.sin(ph * Math.PI)})`; c.beginPath(); c.arc((r() - 0.5) * gw * 0.8, -ph * gh, 2 + r() * 3, 0, 6.283); c.fill(); }
  c.restore();
  // pillars and frame (gold on deep lapis)
  const fr = (dx) => { const g = c.createLinearGradient(dx - 50, 0, dx + 50, 0); g.addColorStop(0, '#1e2450'); g.addColorStop(0.5, '#3a4282'); g.addColorStop(1, '#141838'); return g; };
  [-1, 1].forEach(sd => { const px = sd * (gw / 2 + 46); c.fillStyle = fr(px); c.fillRect(px - 44, -gh + 120, 88, gh - 120);
    c.fillStyle = '#d8b462'; c.fillRect(px - 52, -24, 104, 24); c.fillRect(px - 52, -gh + 108, 104, 22); c.fillRect(px - 48, -gh * 0.5, 96, 10);
    for (let k = 0; k < 4; k++) star8(c, px, -gh + 200 + k * 120, 16, hexA('#f6d68a', 0.8), 2); });
  c.strokeStyle = '#d8b462'; c.lineWidth = 12; c.beginPath(); archPath(c, 0, 0, gw + 20, gh + 14); c.stroke();
  c.strokeStyle = hexA('#fff0c0', 0.8); c.lineWidth = 3; c.beginPath(); archPath(c, 0, 0, gw + 52, gh + 40); c.stroke();
  c.fillStyle = '#2a3070'; c.beginPath(); c.moveTo(-gw / 2 - 90, -gh + 110); c.lineTo(-gw / 2 - 90, -gh - 80); c.quadraticCurveTo(0, -gh - 200, gw / 2 + 90, -gh - 80); c.lineTo(gw / 2 + 90, -gh + 110);
  c.lineTo(gw / 2 + 26, -gh + 110); c.lineTo(gw / 2 + 26, -gh + 280); c.quadraticCurveTo(gw / 2 + 10, -gh + 40, 0, -gh - 8); c.quadraticCurveTo(-gw / 2 - 10, -gh + 40, -gw / 2 - 26, -gh + 280); c.lineTo(-gw / 2 - 26, -gh + 110); c.closePath(); c.fill();
  c.strokeStyle = '#d8b462'; c.lineWidth = 6; c.beginPath(); c.moveTo(-gw / 2 - 90, -gh - 80); c.quadraticCurveTo(0, -gh - 200, gw / 2 + 90, -gh - 80); c.stroke();
  star8(c, 0, -gh - 92, 34, '#f6d68a', 3); c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -gh - 92, 70, '#ffe2a0', 0.5 * op); c.restore();
  [-1, 1].forEach(sd => star8(c, sd * (gw / 2 + 40), -gh - 20, 18, hexA('#f6d68a', 0.8), 2));
  // steps of light at the threshold
  for (let k = 0; k < 3; k++) { const w = gw + 120 + k * 70; c.fillStyle = hexA(mix('#fff2d4', '#c8a8c8', k * 0.3), 0.75 - k * 0.15); c.fillRect(-w / 2, k * 16, w, 16); }
  c.restore();
}
// the hero picture (hook / fourth / cta / outro / cover): the fourth heaven — the gate of light on the sea of clouds, Idris beside it.
// T continuous across cta -> outro; the outro ends on exactly the first frame of the hook (loop).
const GX = 600, GY = 1400, IDX22 = 330, IDY = 1452;
function idHero(c, T, o = {}) {
  const z = o.z || 1, cx = o.cx || 540, cy = o.cy || 1150;
  cam(c, z + 0.004 * Math.sin(T * 0.3), cx, cy);
  par(c, 0.3, cx - 540, cy - 1150, () => cosmos(c, T, { hi: 3, hk: o.hk === undefined ? 0.5 : o.hk, ay: 1520, gy: 1100, gk: o.gk }));
  par(c, 0.12, cx - 540, 0, () => { cloudPuffs(c, T, 1300, 18, '#5a4a7a', '#c8b0c8', 2213, 0.55, 3); });
  cloudSea(c, T, 1380, { lit: 1 });
  heavenGate(c, GX, GY, 0.95, T, { open: o.open === undefined ? 1 : o.open });
  c.save(); c.globalCompositeOperation = 'lighter'; c.translate(GX, IDY + 30); c.scale(1, 0.16); glow(c, 0, 0, 700, '#fff0cc', 0.45); c.restore(); // pool of light on the cloud floor
  if (o.rings) lightRings(c, GX, GY - 300, T, o.rings, 4, 640);
  fig(c, IDR, { x: IDX22, y: IDY, h: o.h || 420, dir: 1, reach: o.reach || 0, armUp: o.arm || 0, light: 1.15, t: T, wind: 0.35, veilGlow: o.vg || 0.42 });
  sparkle(c, T, 540, 1000, 40, 560, 2214, 0.6 + (o.sparkle || 0));
  dust(c, T, 26, 2215, [0, 700, W, 900], '#fff0d0', 0.3, 8);
  blurLayer(c, 8, bc => cloudPuffs(bc, T, 1900, 6, '#3a3060', '#8a7aa8', 2216, 1.9, 4), 5);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// 2) the first ages of mankind: a river valley under far ranges, reed huts on the banks, palms, smoke, herds
function riverPath(fy, q) { const yy = fy + Math.pow(q, 1.6) * (H + 200 - fy), cx = 600 + 300 * Math.sin(q * 2.6) * q, w = 8 + Math.pow(q, 1.5) * 620; return [cx, yy, w]; }
function river(c, fy, t, o = {}) { t += 100;
  const nt = o.night || 0, L = [], R = [];
  for (let i = 0; i <= 40; i++) { const [x, y, w] = riverPath(fy, i / 40); L.push([x - w / 2, y]); R.push([x + w / 2, y]); }
  const g = c.createLinearGradient(0, fy, 0, H); g.addColorStop(0, mix(o.top || '#ffe0b0', '#3a3a5a', nt)); g.addColorStop(0.4, mix('#7a9ab0', '#1a2034', nt)); g.addColorStop(1, mix('#3a5a6a', '#0a1018', nt));
  c.fillStyle = g; c.beginPath(); L.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); R.reverse().forEach(([x, y]) => c.lineTo(x, y)); c.closePath(); c.fill();
  c.strokeStyle = hexA(mix('#5a4a30', '#0a0a0a', nt), 0.6); c.lineWidth = 3; c.beginPath(); L.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
  const r = rng(2230); c.lineCap = 'round';
  for (let i = 0; i < 60; i++) { const q = Math.pow(r(), 0.8), [x, y, w] = riverPath(fy, q), dx = (r() - 0.5) * w * 0.8, l = 6 + q * 60, ph = Math.sin(t * 1.5 + i * 2.1);
    c.strokeStyle = `rgba(255,240,210,${(0.18 + 0.25 * Math.abs(ph)) * (1 - nt * 0.6)})`; c.lineWidth = 1 + q * 2.5; c.beginPath(); c.moveTo(x + dx - l / 2 + ph * 6, y); c.lineTo(x + dx + l / 2 + ph * 6, y); c.stroke(); }
}
function reedHut(c, x, y, s, t, o = {}) { // a domed hut of bound reeds and mud, ribbed, arched dark doorway, thin smoke
  const nt = o.night || 0, col = mix(o.col || '#b8946a', '#2a2430', nt * 0.85), dk = mix(col, '#1a0c06', 0.45), lt = mix(col, '#fff0d8', 0.3);
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(10, 4, 150, 16, 0, 0, 6.283); c.fill();
  const g = c.createLinearGradient(-130, 0, 130, 0); g.addColorStop(0, dk); g.addColorStop(0.6, col); g.addColorStop(1, lt);
  c.fillStyle = g; c.beginPath(); c.moveTo(-130, 0); c.bezierCurveTo(-130, -150, -70, -210, 0, -212); c.bezierCurveTo(70, -210, 130, -150, 130, 0); c.closePath(); c.fill();
  c.strokeStyle = hexA(dk, 0.55); c.lineWidth = 3; for (let k = -4; k <= 4; k++) { c.beginPath(); c.moveTo(k * 30, 0); c.quadraticCurveTo(k * 26, -150, 0, -210); c.stroke(); }
  c.strokeStyle = hexA(lt, 0.5); c.lineWidth = 4; for (let k = 1; k < 4; k++) { c.beginPath(); c.ellipse(0, 0, 130 * (1 - k * 0.2), 212 * (1 - k * 0.04) * k / 4 + 40, 0, Math.PI * 1.08, Math.PI * 1.92); c.stroke(); }
  c.fillStyle = mix('#1a0e08', '#000000', nt); c.beginPath(); archPath(c, 18, 0, 64, 110); c.fill();
  if (o.lamp) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 18, -40, 90, '#ffb060', 0.5 * o.lamp); c.restore(); c.fillStyle = hexA('#ffc070', 0.7 * o.lamp); c.beginPath(); archPath(c, 18, 0, 50, 90); c.fill(); }
  c.restore();
  if (o.smoke) smoke(c, t + 100, x - 10 * s, y - 210 * s, 4, Math.floor(x), '#d8ccc0', 0.18, s, 40 * s);
}
const HUTS = [[-380, 1, 0.55], [-120, 0, 0.6], [140, 1, 0.5], [920, 0, 0.62], [1180, 1, 0.55], [1430, 0, 0.6]];
function earthLand(c, t, o = {}) { // o: sky, to, k, px, night, lamp, fy
  const fy = o.fy || 1240, nt = o.night || 0, px = o.px || 0;
  canaanLand(c, t, { fy, sky: o.sky || 'gold', to: o.to, k: o.k, px, night: nt, sun: o.sun, sunX: o.sunX === undefined ? 760 : o.sunX, sunY: o.sunY === undefined ? fy - 380 : o.sunY, sunA: o.sunA,
    stars: o.stars, moon: o.moon, haze: o.haze || '#f4d0a8', seed: 22, n: 120 });
  par(c, 1, px, 0, () => {
    if (o.river !== false) river(c, fy, t, { night: nt, top: o.water });
    HUTS.forEach(([x, sm, s], i) => reedHut(c, x, fy + 20 + i % 2 * 14, s, t + i, { night: nt, smoke: sm, lamp: o.lamp ? o.lamp * (i % 2 ? 1 : 0.6) : 0 }));
    [[-560, 1.0], [40, 0.85], [1040, 0.95], [1640, 1.0]].forEach(([x, s], i) => datePalm(c, x, fy + 30, s, mix('#3a4a2a', '#0a0e0a', nt), t, 40 + i));
    if (o.herd !== false) herd(c, t, -260, fy + 60, 5, { dir: 1 });
  });
}
function earthFg(c, t, col = '#4a5426') { blurLayer(c, 7, bc => grassFg(bc, t, col), 5); } // one blur for the whole layer (fast)

// 3) the reed pen (calamus) writing on a sheet, seen from above: ink strokes appear one after another; a white sleeve, the hand holding the pen
const GLY = (() => { const r = rng(2240), L = []; // 5 lines of an early script (abstract strokes, not any real text)
  for (let ln = 0; ln < 5; ln++) { let x = 860; const y = 860 + ln * 92;
    while (x > 230) { const w = 26 + r() * 48, kind = Math.floor(r() * 4), dot = r() < 0.3; L.push({ x, y: y + (r() - 0.5) * 6, w, kind, dot, h: 18 + r() * 26 }); x -= w + 10 + r() * 14; if (r() < 0.15) x -= 24; } }
  return L; })();
function glyph(c, g, q) { // q 0..1: drawn fraction of this stroke
  c.beginPath(); const n = 12, k = Math.max(1, Math.floor(n * q));
  for (let i = 0; i <= k; i++) { const u = i / n, x = g.x - u * g.w;
    let y = g.y; if (g.kind === 0) y -= Math.sin(u * Math.PI) * g.h; else if (g.kind === 1) y -= (u < 0.3 ? u / 0.3 : 1) * g.h * (u < 0.3 ? 1 : 0) ; else if (g.kind === 2) y += Math.sin(u * Math.PI * 2) * g.h * 0.35; else y -= u * g.h * 0.6 * Math.sin(u * 3);
    i ? c.lineTo(x, y) : c.moveTo(x, y); }
  c.stroke();
  if (g.dot && q >= 1) { c.beginPath(); c.arc(g.x - g.w * 0.5, g.y + 22, 4, 0, 6.283); c.fill(); }
}
function penHand(c, px, py, t, o = {}) { // the calamus tip at (px, py); hand and sleeve come from the lower right
  const lift = o.lift || 0, tx = px, ty = py - lift;
  // shadow of the pen on the sheet
  c.strokeStyle = 'rgba(30,18,8,0.25)'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(tx + 14, ty + 18); c.lineTo(tx + 170, ty - 190); c.stroke();
  // sleeve (white wool, folds) from off-frame
  const hx = tx + 78, hy = ty - 70;
  limb(c, [1400, 1700], [hx + 330, hy + 120], [hx + 70, hy + 34], 360, 150, '#e8e2d4');
  c.strokeStyle = 'rgba(120,100,70,0.25)'; c.lineWidth = 4; c.beginPath(); c.moveTo(hx + 120, hy + 120); c.quadraticCurveTo(hx + 300, hy + 160, hx + 420, hy + 300); c.moveTo(hx + 150, hy + 40); c.quadraticCurveTo(hx + 320, hy + 60, hx + 460, hy + 160); c.stroke();
  c.fillStyle = '#d4ccba'; c.beginPath(); c.ellipse(hx + 74, hy + 36, 70, 40, -0.6, 0, 6.283); c.fill(); // cuff opening
  c.strokeStyle = '#c9a35a'; c.lineWidth = 5; c.beginPath(); c.ellipse(hx + 74, hy + 36, 72, 42, -0.6, 2.2, 5.6); c.stroke();
  // hand: palm, curled fingers around the pen, thumb
  const sk = '#c49470', dk = mix(sk, '#000000', 0.25);
  c.fillStyle = dk; c.beginPath(); c.ellipse(hx + 20, hy + 6, 56, 40, -0.7, 0, 6.283); c.fill();
  c.fillStyle = sk; c.beginPath(); c.ellipse(hx + 14, hy, 50, 36, -0.7, 0, 6.283); c.fill();
  // pen (reed): from the tip to beyond the hand
  c.strokeStyle = '#b08a4a'; c.lineWidth = 10; c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx + 150, ty - 220); c.stroke();
  c.strokeStyle = '#d8b878'; c.lineWidth = 3; c.beginPath(); c.moveTo(tx + 4, ty - 8); c.lineTo(tx + 150, ty - 222); c.stroke();
  c.strokeStyle = '#7a5a2a'; c.lineWidth = 2; [0.55, 0.8].forEach(q => { c.beginPath(); c.moveTo(tx + 150 * q - 6, ty - 220 * q - 3); c.lineTo(tx + 150 * q + 6, ty - 220 * q + 3); c.stroke(); }); // reed nodes
  c.fillStyle = '#2a1a10'; c.beginPath(); c.moveTo(tx - 2, ty + 3); c.lineTo(tx + 8, ty - 10); c.lineTo(tx + 2, ty - 12); c.closePath(); c.fill(); // inked nib
  // fingers over the pen
  c.fillStyle = sk; [[-26, 28, 20, 11], [-12, 40, 19, 10], [4, 48, 17, 9]].forEach(([dx, dy, a, b]) => { c.beginPath(); c.ellipse(hx + dx - 18, hy + dy - 20, a, b, -0.9, 0, 6.283); c.fill(); });
  c.strokeStyle = hexA(dk, 0.7); c.lineWidth = 1.5; [[-26, 28], [-12, 40], [4, 48]].forEach(([dx, dy]) => { c.beginPath(); c.arc(hx + dx - 18, hy + dy - 20, 12, 0.6, 2.2); c.stroke(); });
  c.fillStyle = mix(sk, '#ffffff', 0.08); c.beginPath(); c.ellipse(hx - 28, hy - 22, 24, 11, -1.1, 0, 6.283); c.fill(); // thumb
}
function penClose(c, T, k, o = {}) { // k: writing progress 0..1 (strokes drawn); o.lamp, o.rest (pen laid down)
  sky0(c, [[0, '#1a0e08'], [0.5, '#2a1a10'], [1, '#120a06']]);
  // wooden board
  const g = c.createLinearGradient(0, 300, 0, 1900); g.addColorStop(0, '#5a3a20'); g.addColorStop(1, '#2a1a0c'); c.fillStyle = g; c.fillRect(-300, 300, W + 600, 1900);
  c.strokeStyle = 'rgba(20,10,4,0.35)'; c.lineWidth = 3; for (let i = 0; i < 14; i++) { c.beginPath(); c.moveTo(-300, 340 + i * 120 + Math.sin(i) * 10); c.bezierCurveTo(300, 330 + i * 120, 700, 360 + i * 120, 1400, 340 + i * 120); c.stroke(); }
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 120, 520, 700, '#ffb060', 0.35 * (o.lamp === undefined ? 1 : o.lamp)); c.restore();
  // the sheet (parchment) slightly rotated
  c.save(); c.translate(540, 1060); c.rotate(-0.04); c.translate(-540, -1060);
  c.fillStyle = 'rgba(10,6,2,0.4)'; c.fillRect(168, 728, 760, 640);
  const pg = c.createRadialGradient(560, 1000, 60, 560, 1040, 520); pg.addColorStop(0, '#f4e6c4'); pg.addColorStop(1, '#d4b884');
  c.fillStyle = pg; c.beginPath(); c.moveTo(160, 716); c.lineTo(920, 708); c.lineTo(928, 1352); c.lineTo(166, 1360); c.closePath(); c.fill();
  const rr = rng(2241); c.strokeStyle = 'rgba(140,100,50,0.12)'; c.lineWidth = 1.5; for (let i = 0; i < 40; i++) { const y = 720 + rr() * 630; c.beginPath(); c.moveTo(170, y); c.lineTo(920, y + (rr() - 0.5) * 8); c.stroke(); }
  c.strokeStyle = 'rgba(120,80,40,0.35)'; c.lineWidth = 6; c.strokeRect(166, 714, 758, 642);
  // strokes
  const n = GLY.length, done = k * n; let tip = [GLY[0].x, GLY[0].y];
  c.strokeStyle = '#2a1608'; c.fillStyle = '#2a1608'; c.lineWidth = 6; c.lineCap = 'round'; c.lineJoin = 'round';
  for (let i = 0; i < n; i++) { const q = clamp(done - i); if (q <= 0) break; glyph(c, GLY[i], q); tip = [GLY[i].x - GLY[i].w * q, GLY[i].y]; }
  if (k > 0 && k < 1) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, tip[0], tip[1], 80, '#ffd890', 0.35); c.restore(); }
  c.restore();
  // ink pot
  c.fillStyle = 'rgba(10,6,2,0.4)'; c.beginPath(); c.ellipse(132, 1500, 70, 20, 0, 0, 6.283); c.fill();
  const ig = c.createLinearGradient(70, 0, 190, 0); ig.addColorStop(0, '#3a2a1a'); ig.addColorStop(0.6, '#7a5a3a'); ig.addColorStop(1, '#2a1a10');
  c.fillStyle = ig; c.beginPath(); c.moveTo(80, 1500); c.quadraticCurveTo(70, 1420, 100, 1400); c.lineTo(164, 1400); c.quadraticCurveTo(194, 1420, 184, 1500); c.closePath(); c.fill();
  c.fillStyle = '#0a0604'; c.beginPath(); c.ellipse(132, 1400, 32, 9, 0, 0, 6.283); c.fill();
  if (o.rest) { // the pen laid on the sheet, no hand
    c.strokeStyle = '#b08a4a'; c.lineWidth = 10; c.beginPath(); c.moveTo(420, 1300); c.lineTo(760, 1180); c.stroke(); c.strokeStyle = '#d8b878'; c.lineWidth = 3; c.beginPath(); c.moveTo(424, 1294); c.lineTo(760, 1176); c.stroke();
    c.fillStyle = '#2a1a10'; c.beginPath(); c.moveTo(412, 1306); c.lineTo(428, 1292); c.lineTo(430, 1302); c.closePath(); c.fill();
  } else penHand(c, tip[0] + Math.sin(T * 9) * 1.2, tip[1], T, { lift: k >= 1 ? 30 : Math.max(0, Math.sin(done * Math.PI)) * 0 + (done % 1 > 0.92 ? 6 : 0) });
}

// 4) thirty scrolls coming down in a column of light (revelation: light only), gathering into a bound bundle; counter
function sheetsFall(c, T, k, o = {}) { T += 100;
  const n = 30, x0 = o.x || 540, y1 = o.y || 1230;
  for (let i = 0; i < n; i++) { const q = clamp(k * (n + 8) / n * 1.0 - i / (n + 8) * 1.0); const p = clamp((k * 38 - i) / 8); if (p <= 0) continue;
    const r = rng(2250 + i), sx = x0 + (r() - 0.5) * 360 * (1 - p), sy = lerp(-120, y1 - i * 3.2, easeOut(p)), rot = (1 - p) * (r() - 0.5) * 2.4 + Math.sin(T * 1.3 + i) * 0.06 * (1 - p);
    c.save(); c.translate(sx, sy); c.rotate(rot); c.scale(1, p >= 1 ? 0.35 : 1 - p * 0.65);
    c.fillStyle = 'rgba(20,10,4,0.25)'; c.fillRect(-60, -38, 124, 80);
    const g = c.createLinearGradient(-60, -40, 60, 40); g.addColorStop(0, '#fbf0d4'); g.addColorStop(1, '#d8c08c'); c.fillStyle = g; c.fillRect(-62, -42, 124, 84);
    c.strokeStyle = 'rgba(80,50,20,0.4)'; c.lineWidth = 2; for (let l = 0; l < 4; l++) { c.beginPath(); c.moveTo(-46, -24 + l * 16); c.lineTo(46, -24 + l * 16); c.stroke(); }
    c.restore(); }
  if (k > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x0, y1, 260, '#ffe2a8', 0.4 * clamp(k * 2)); c.restore(); }
}

// 5) the teaching place at dusk: a great leafy tree by the huts, a rug, a lamp, Idris seated, people seated around him
const CIRCLE = [[150, 1560, 250, 1, 0], [300, 1590, 260, 1, 2], [70, 1700, 320, 1, 4], [250, 1730, 330, 1, 5], [430, 1660, 290, 1, 1],
  [-40, 1820, 380, 1, 3], [180, 1880, 400, 1, 6], [420, 1830, 380, 1, 7], [590, 1560, 240, 1, 3]];
function teachSet(c, T, o = {}) { // o: dusk, idris pose (sit / stand), arm, reach, crowd (stand + turn), light
  const nt = o.night || 0;
  earthLand(c, T, { sky: 'gold', to: 'dusk', k: o.dusk === undefined ? 0.6 : o.dusk, sunX: 220, sunY: 980, sunA: 0.8, lamp: 0.7, night: nt, herd: false, river: false, fy: 1240 });
  tree(c, 860, 1500, 1.7, T, { col: '#4a3428', leaf: 1, seed: 22, depth: 6, leafCol: '#5a7a34', wind: 0.6 });
  rug(c, 720, 1520, 380, 120, '#7a2a22');
  oilLamp(c, 590, 1520, 1.1, 1, T);
  if (o.lit) lightFromAbove(c, T, 760, o.lit, 300);
  const ip = o.stand ? { pose: 'stand', h: 420 } : { pose: 'sit', h: 360 };
  fig(c, IDR, Object.assign({ x: 790, y: 1520, dir: -1, light: 1.05, t: T, wind: 0.3, reach: o.reach || 0, armUp: o.arm || 0, veilGlow: 0.4 }, ip));
  if (o.sheet) { c.save(); c.translate(738, 1452); c.rotate(-0.15); c.scale(0.85, 0.85); c.fillStyle = '#f2e2bc'; c.fillRect(-36, -22, 72, 44); c.strokeStyle = 'rgba(80,50,20,0.5)'; c.lineWidth = 2; for (let l = 0; l < 3; l++) { c.beginPath(); c.moveTo(-26, -10 + l * 10); c.lineTo(26, -10 + l * 10); c.stroke(); } c.restore(); }
  const cr = o.crowd || {};
  CIRCLE.forEach(([x, y, h, d, f], i) => { const who = Object.assign({}, EARLY[f], i === 8 ? { child: true } : {});
    if (cr.stand) fig(c, who, { x, y, h: h * 1.25, dir: d, light: 0.85, t: T + i, wind: 0.3, ink: 0.8, armUp: cr.raise && i % 3 === 1 ? cr.raise * 0.6 : 0 });
    else fig(c, who, { x, y, h, dir: d, pose: 'sit', light: 0.85, t: T + i, wind: 0.2, ink: 0.8, dua: cr.dua && i % 3 === 0 }); });
}

// 6) the plain in the wind (patience): Idris stands firm; sand and streaks; o.calm (the wind drops, light comes)
function windPlain(c, T, o = {}) {
  const st = o.storm === undefined ? 1 : o.storm;
  canaanLand(c, T, { fy: 1300, sky: 'gold', to: 'dusk', k: 0.3, dry: 1, sunX: 820, sunY: 900, sunA: 0.5 + 0.4 * (1 - st), haze: '#e8b888', seed: 23, n: 140 });
  sandVeil(c, 0.18 * st, '#b07040');
  if (st > 0) { blowingSand(c, T, 1150, 0.45 * st, 31); blowingSand(c, T, 1500, 0.55 * st, 32); windStreaks(c, T, 0.7 * st, 33, 500, 1800); }
  if (o.lit) { lightFromAbove(c, T, o.ix || 540, o.lit, 360); sparkle(c, T, o.ix || 540, 1100, 30, 380, 2260, o.lit); }
  fig(c, IDR, { x: o.ix || 540, y: 1560, h: o.h || 520, dir: 1, dua: !!o.dua, light: 1, t: T, wind: 0.4 + 1.2 * st, veilGlow: 0.42 });
  blurLayer(c, 6, bc => grassFg(bc, T, '#6a5a2a'), 5);
}

// 7) ascent from the earth to the heavens: alt 0 (land) -> 1 (stars); clouds pass downward
function ascent(c, T, alt, o = {}) {
  const a = clamp(alt);
  if (a < 0.55) { c.save(); c.translate(0, a * 1900); earthLand(c, T, o.night ? { sky: 'night', sun: false, stars: 1, night: 0.75, lamp: 1, moon: 0.9, moonX: 800, moonY: 500, herd: false } : { sky: 'dawn', to: 'gold', k: 0.4, sunX: 760, sunY: 900, herd: false }); c.restore(); }
  if (a > 0.25) { c.save(); c.globalAlpha = ease(seg(a, 0.25, 0.7)); cosmos(c, T, { arcs: ease(seg(a, 0.6, 1)), hi: o.hi === undefined ? -1 : o.hi, hk: o.hk || 0, ay: 1500 + (1 - a) * 800 }); c.restore(); }
  // cloud layers rushing down
  blurLayer(c, 16, c => { const r = rng(2270);
  for (let i = 0; i < 9; i++) { const y = ((r() * 2600 + a * 5200) % 2600) - 500, x = r() * W, w = 300 + r() * 400, vis = Math.sin(clamp((a - 0.15) / 0.7) * Math.PI);
    if (vis <= 0) continue; c.fillStyle = `rgba(236,222,244,${0.32 * vis})`; c.beginPath(); c.ellipse(x, y, w, w * 0.22, 0, 0, 6.283); c.fill(); c.beginPath(); c.ellipse(x + w * 0.4, y - w * 0.08, w * 0.6, w * 0.2, 0, 0, 6.283); c.fill(); } }, 4);
}
// streaks of light rushing down (moving up through the heavens)
function riseStreaks(c, T, a) { if (a <= 0) return; const r = rng(2271); c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 70; i++) { const x = r() * W, sp = 900 + r() * 1400, l = 80 + r() * 260, y = ((r() * 2400 + T * sp) % 2400) - 300;
    const g = c.createLinearGradient(x, y - l, x, y); g.addColorStop(0, 'rgba(255,240,210,0)'); g.addColorStop(1, `rgba(255,244,220,${a * (0.3 + 0.4 * r())})`);
    c.strokeStyle = g; c.lineWidth = 1.5 + r() * 2.5; c.beginPath(); c.moveTo(x, y - l); c.lineTo(x, y); c.stroke(); }
  c.restore(); }
// one of the first heavens: its gate on the clouds, the prophets met there as columns of light (never a figure); n = 1..3
function heavenLevel(c, T, n, o = {}) {
  const tint = ['#2a2a6a', '#3a2a5a', '#2a3a5a'][n - 1];
  cosmos(c, T, { hi: n - 1, hk: 0.8, ay: 1500, gy: 1150 });
  c.save(); c.globalCompositeOperation = 'soft-light'; c.fillStyle = tint; c.fillRect(-500, -500, W + 1000, H + 1000); c.restore();
  cloudSea(c, T, 1380, { lit: 0.8 });
  heavenGate(c, 540, 1400, 0.85, T, { open: o.open === undefined ? 1 : o.open });
  const cols = n === 2 ? [[170, 0], [910, 1]] : [[n === 1 ? 190 : 890, 0]];
  cols.forEach(([x, s]) => { guestLight(c, x, 1480, 560, T, 1.5 * (o.k === undefined ? 1 : o.k), s + n * 3); guestLight(c, x, 1480, 380, T, 0.8 * (o.k === undefined ? 1 : o.k), s + n * 3 + 1); });
}


// =====================================================================================================================
// ---------- episode 23: Dhul-Kifl
const DK = { veilGlow: 0.45, prophet: true, robe: '#ebe5d6', wrap: '#f7f3ea', skin: '#c49470', trim: '#c9b07a', band: '#b8a060', inner: '#fbf8f0' };
const YASA = { veilGlow: 0.45, prophet: true, robe: '#e2dbc8', wrap: '#f5f0e4', skin: '#c49470', trim: '#d8b45a', band: '#c9a040', inner: '#fbf8f0' }; // Al-Yasa', old
// the "old man" of the narration (Iblis taking that form): dusty grey cloth, faceless like everyone, bent over a stick
const OLDM = { robe: '#3e3834', wrap: '#7e746a', skin: '#7a5a48', trim: '#5e544a', band: '#4a4038', inner: '#6a625a' };
const KIN = [FOLK[1], FOLK[5]]; // his household (day 3)
function seriesTag23(c, a) { seriesTag(c, a, 23); }

// knocks: k 0..1 pulse for each knock time (fast in, slower out)
const knocks = (t0, n = 3, gap = 0.3) => [...Array(n)].map((_, i) => t0 + i * gap);
function knockK(t, times) { let k = 0; times.forEach(t0 => { const d = t - t0; if (d > -0.12 && d < 0.26) k = Math.max(k, d < 0 ? 1 + d / 0.12 : 1 - d / 0.26); }); return clamp(k); }
function knockRings(c, x, y, t, times, a = 1, col = '255,236,190', R = 260) {
  if (a <= 0) return;
  times.forEach(t0 => { const ph = (t - t0) * 1.5; if (ph <= 0 || ph >= 1) return;
    c.strokeStyle = `rgba(${col},${0.65 * a * (1 - ph)})`; c.lineWidth = 7 * (1 - ph) + 1.5; c.lineCap = 'round';
    const r = 30 + ph * R; c.beginPath(); c.arc(x, y, r, -0.7, 0.7); c.stroke(); c.beginPath(); c.arc(x, y, r, Math.PI - 0.7, Math.PI + 0.7); c.stroke(); });
}
function knockFlash(c, x, y, t, times, a = 1) { const k = knockK(t, times); if (k <= 0 || a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y, 120, '#fff0c8', 0.35 * k * a); c.restore(); }

// a stick held in the far hand (drawn before the figure, so it stays behind the body)
function farStick(c, o) { const [fx, fy] = farHand(o), s = (o.h || 300) / 300, d = o.dir || 1;
  c.strokeStyle = '#4a3220'; c.lineWidth = 7 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(fx + d * 4 * s, fy - 40 * s); c.lineTo(fx - d * 26 * s, o.y); c.stroke(); }
// the old man: bent, stick, knock with the near hand (k = knock pulse)
function oldMan(c, o, k = 0) {
  const base = Object.assign({ h: 360, dir: -1, light: 0.85, wind: 0.25, ink: 1 }, o), bend = o.bend === undefined ? 0.09 : o.bend;
  lean(c, base.x, base.y, -base.dir * bend, () => {
    if (base.knock !== undefined) { farStick(c, base); fig(c, OLDM, Object.assign({}, base, { reach: lerp(0.55, 0.95, k) })); }
    else fig(c, OLDM, Object.assign({ staff: true }, base)); });
}
// the shadow of a figure cast on a wall by a low light (sheared, stretched, blurred)
function castShadow(c, who, o, a = 0.5, sx = -0.5, sy = 1.25, blur = 5) { if (a <= 0) return;
  c.save(); c.globalAlpha *= a; c.filter = `brightness(0) blur(${blur}px)`;
  c.translate(o.x, o.y); c.transform(1, 0, sx, sy, 0, 0); c.translate(-o.x, -o.y);
  figure(c, Object.assign({}, who, o, { ink: 0, shadow: false, prophet: false, veilGlow: 0 })); c.restore(); }

// a heavy plank door in an arched frame: planks, iron studs, a ring knocker, (bar) the wooden bolt in its brackets
function plankDoor(c, x, y, w, h, o = {}) { // x = centre, y = threshold
  const sh = o.shake || 0, op = o.open || 0;
  c.save(); c.beginPath(); archPath(c, x, y, w, h); c.clip();
  if (op > 0) { const g = c.createLinearGradient(0, y - h, 0, y); g.addColorStop(0, '#fff8e8'); g.addColorStop(1, '#ffe6b0'); c.fillStyle = g; c.fillRect(x - w, y - h, w * 2, h); }
  const dw = w * (1 - op * 0.82), dx = x - w / 2 + sh; // the leaf swings inward on its left hinge: it gets narrower
  const g = c.createLinearGradient(dx, 0, dx + dw, 0); g.addColorStop(0, '#6a4426'); g.addColorStop(0.5, '#7e5432'); g.addColorStop(1, '#4a2e18');
  c.fillStyle = g; c.fillRect(dx, y - h - 4, dw, h + 4);
  c.strokeStyle = 'rgba(30,16,6,0.6)'; c.lineWidth = 3; for (let k = 1; k < 5; k++) { const xx = dx + dw * k / 5; c.beginPath(); c.moveTo(xx, y - h); c.lineTo(xx, y); c.stroke(); }
  c.strokeStyle = 'rgba(255,220,170,0.12)'; c.lineWidth = 2; for (let k = 1; k < 5; k++) { const xx = dx + dw * k / 5 + 3; c.beginPath(); c.moveTo(xx, y - h); c.lineTo(xx, y); c.stroke(); }
  c.fillStyle = '#3a2614'; [0.22, 0.62].forEach(q => c.fillRect(dx, y - h * q - 12, dw, 24)); // cross battens
  c.fillStyle = '#2a1a10'; [0.22, 0.62].forEach(q => { for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(dx + 14 + k * (dw - 28) / 5, y - h * q, 4.5, 0, 6.283); c.fill(); } });
  if (op < 0.3) { const kx = dx + dw * 0.78, ky = y - h * 0.45; c.strokeStyle = '#2a1a10'; c.lineWidth = 6; c.beginPath(); c.arc(kx, ky + 16, 16, 0, 6.283); c.stroke(); // ring knocker
    c.strokeStyle = 'rgba(255,220,160,0.3)'; c.lineWidth = 2; c.beginPath(); c.arc(kx - 2, ky + 14, 16, -2.4, -0.8); c.stroke(); c.fillStyle = '#2a1a10'; c.beginPath(); c.arc(kx, ky, 7, 0, 6.283); c.fill(); }
  c.restore();
  c.strokeStyle = o.frame || '#4a3020'; c.lineWidth = 12; c.beginPath(); archPath(c, x, y, w + 12, h + 8); c.stroke();
  if (o.bar) { const by = y - h * 0.42 + sh * 0.3; // the wooden bolt across the door, in two iron brackets (seen from inside)
    c.fillStyle = '#2a1a10'; [x - w * 0.42, x + w * 0.42].forEach(bx => c.fillRect(bx - 16, by - 26, 32, 52));
    const bg = c.createLinearGradient(0, by - 16, 0, by + 16); bg.addColorStop(0, '#9a6a40'); bg.addColorStop(1, '#5a3a20'); c.fillStyle = bg; c.fillRect(x - w * 0.62, by - 14, w * 1.24, 28);
    if (o.barGlow) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, by, w * 0.9, '#ffd890', 0.5 * o.barGlow); c.strokeStyle = `rgba(255,236,190,${0.8 * o.barGlow})`; c.lineWidth = 4; c.strokeRect(x - w * 0.62, by - 14, w * 1.24, 28); c.restore(); } }
}

// 1) the street at noon in front of his house (hook, cta, outro, cover): high white sun, short shadows, sunlit mud-brick walls
const DOORX = 300, DOORY = 1500, DOORW = 210, DOORH = 470, OLDX = 470;
function dkDoor(c, T, o = {}) {
  const z = o.z || 1, cx = o.cx || 540, cy = o.cy || 1150;
  cam(c, z + 0.004 * Math.sin(T * 0.3), cx + 4 * Math.sin(T * 0.21), cy);
  sky0(c, skyBlend({ sky: 'harsh', to: o.to || 'day', k: o.k === undefined ? 0.35 : o.k }));
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 860, 240, 620, '#fff2d0', 0.4); c.restore(); sun(c, 860, 240, 48, '#fffbe8', 1);
  wisps(c, T, 420, 5, '#ffffff', 0.18, 23, 4);
  hillsBehind(c, T, 1080, { far: '#a89aa8', mid: '#8a8078', haze: '#f6e6cc', tree: '#4a4a3a' });
  flagFloor(c, 1210, 760, '#cdb08a', { sheen: 0.18, sheenX: 760, sheenCol: '#fff0d0' });
  // the far end of the street (receding houses on the right), a palm over the roofs
  [[1300, 1300, 0.62], [1120, 1260, 0.5], [980, 1232, 0.4], [880, 1218, 0.32]].forEach(([x, y, s], i) => house(c, x, y, 380 * s, 470 * s, mix('#d8b88e', '#b89a72', (i % 2) * 0.4), { lamp: 0, t: T + 100 + i }));
  datePalm(c, 1010, 1180, 0.55, '#4a5a2c', T, 231);
  // the opposite wall's shadow band on the street (noon: short and sharp)
  c.fillStyle = 'rgba(60,36,20,0.16)'; c.beginPath(); c.moveTo(600, 1500); c.lineTo(1400, 1500); c.lineTo(1400, 1580); c.lineTo(560, 1580); c.closePath(); c.fill();
  // his house: a big sunlit wall, the door, a small high window (the opening), a vine and a bench
  const hx = 360, hw = 1000, hh = 1040, top = DOORY - hh;
  const g = c.createLinearGradient(hx - hw / 2, 0, hx + hw / 2, 0); g.addColorStop(0, '#e8cca0'); g.addColorStop(0.6, '#d8b88a'); g.addColorStop(1, '#a88660');
  c.fillStyle = g; c.fillRect(hx - hw / 2, top, hw, hh);
  const r = rng(233); for (let i = 0; i < 70; i++) { c.fillStyle = hexA(r() > 0.5 ? '#fff4dc' : '#8a6a48', 0.06 + r() * 0.06); c.beginPath(); c.ellipse(hx - hw / 2 + r() * hw, top + r() * hh, 20 + r() * 60, 10 + r() * 26, r(), 0, 6.283); c.fill(); } // plaster patches
  c.strokeStyle = 'rgba(120,84,50,0.16)'; c.lineWidth = 2; for (let yy = DOORY - 18; yy > top + 40; yy -= 24) { c.beginPath(); c.moveTo(hx - hw / 2, yy); c.lineTo(hx + hw / 2, yy); c.stroke(); }
  c.fillStyle = '#f2dcb4'; c.fillRect(hx - hw / 2 - 10, top - 14, hw + 20, 18); c.fillStyle = '#5a3a22'; for (let k = 0; k < 8; k++) c.fillRect(hx - hw / 2 + 40 + k * 130, top + 10, 26, 16); // roof beams
  c.fillStyle = 'rgba(90,60,30,0.25)'; c.fillRect(hx + hw / 2 - 30, top, 30, hh); // the corner in shade
  // the small high window (the opening of the story)
  const wx = 640, wy = top + 300; c.fillStyle = '#2a1a10'; c.beginPath(); archPath(c, wx, wy, 96, 130); c.fill();
  c.strokeStyle = '#b8946a'; c.lineWidth = 8; c.beginPath(); archPath(c, wx, wy + 4, 112, 142); c.stroke();
  // door step + door + lintel
  c.fillStyle = '#9a7a56'; c.fillRect(DOORX - DOORW / 2 - 36, DOORY - 14, DOORW + 72, 18);
  c.fillStyle = '#b8946a'; c.beginPath(); archPath(c, DOORX, DOORY - 12, DOORW + 60, DOORH + 46); c.fill();
  plankDoor(c, DOORX, DOORY - 12, DOORW, DOORH, { shake: (o.shake || 0) * 3 * Math.sin(T * 70), open: o.open || 0 });
  // vine over the door
  const vr = rng(235); c.strokeStyle = '#5a4a2a'; c.lineWidth = 5; c.beginPath(); c.moveTo(DOORX + 160, DOORY); c.bezierCurveTo(DOORX + 190, DOORY - 300, DOORX + 120, DOORY - 520, DOORX - 30, DOORY - 560); c.stroke();
  for (let i = 0; i < 34; i++) { const q = vr(), x = lerp(DOORX + 160, DOORX - 60, q) + (vr() - 0.5) * 70, y = lerp(DOORY - 80, DOORY - 580, q) + (vr() - 0.5) * 40;
    c.fillStyle = mix('#5a7a32', '#2e4a1e', vr()); c.beginPath(); c.ellipse(x + Math.sin(T * 1.3 + i) * 1.5, y, 16, 11, vr() * 3, 0, 6.283); c.fill(); }
  jar(c, DOORX + 230, DOORY, 1.3, '#b0683a'); jar(c, DOORX + 300, DOORY + 6, 0.95, '#9a5a32');
  if (o.rings) { const kt = o.rings; knockRings(c, DOORX + 60, DOORY - DOORH * 0.45, T, kt, 1); knockFlash(c, DOORX + 60, DOORY - DOORH * 0.45, T, kt, 0.8); }
  // the old man at the door, knocking (or standing, waiting)
  if (o.old !== false) { const kt = o.knockT || [], k = knockK(T, kt), ox = o.oldX === undefined ? OLDX : o.oldX;
    oldMan(c, { x: ox, y: DOORY + 40, h: 400, dir: -1, t: T, knock: o.knock === false ? undefined : 1 }, k); }
  if (o.extra) o.extra(c);
  // blurred foreground: a corner of the bench and a hanging cloth edge
  if (o.fg !== false) blurLayer(c, 10, cc => { jar(cc, 1010, 2150, 3.4, '#a8603a'); // a big water jar close to the lens, and a corner of vine leaves
    const vr2 = rng(251); for (let i = 0; i < 16; i++) { cc.fillStyle = mix('#4a6a2a', '#2a3a18', vr2()); cc.beginPath(); cc.ellipse(-40 + vr2() * 200 + Math.sin(T + i) * 3, -60 + vr2() * 260, 46, 30, vr2() * 3, 0, 6.283); cc.fill(); } }, 2);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// 2) the room inside (day1, day2, day3, reveal, lesson): plastered walls, ceiling beams, the barred door on the left, the small high
//    window on the right with a shaft of sunlight full of dust, a mat, cushions, a niche with an oil lamp, a water jar.
const RFY = 1500, RDX = 230, RDW = 250, RDH = 560, RWX = 840, RWY = 560;
function dkRoom(c, T, o = {}) {
  const nt = o.night || 0, z = o.z || 1, cx = o.cx || 540, cy = o.cy || 1150;
  cam(c, z + 0.004 * Math.sin(T * 0.27), cx, cy, ...(o.shakeCam ? shake(T, o.shakeCam, 8) : [0, 0]));
  // back wall
  const wc = mix('#d6b688', '#2a2638', nt * 0.85), g = c.createLinearGradient(0, -300, 0, RFY); g.addColorStop(0, mix(wc, '#1a0c06', 0.35)); g.addColorStop(0.5, wc); g.addColorStop(1, mix(wc, '#1a0c06', 0.25));
  c.fillStyle = g; c.fillRect(-800, -600, W + 1600, RFY + 600);
  const r = rng(237); for (let i = 0; i < 90; i++) { c.fillStyle = hexA(r() > 0.5 ? '#fff4dc' : '#6a4a30', (0.04 + r() * 0.05) * (1 - nt * 0.6)); c.beginPath(); c.ellipse(-700 + r() * (W + 1400), -200 + r() * (RFY + 200), 30 + r() * 80, 14 + r() * 30, r(), 0, 6.283); c.fill(); }
  // ceiling beams and reed matting
  c.fillStyle = mix('#5a4028', '#100c14', nt); c.fillRect(-800, -600, W + 1600, 700);
  c.strokeStyle = hexA(mix('#8a6a40', '#2a2430', nt), 0.5); c.lineWidth = 3; for (let x = -800; x < W + 800; x += 16) { c.beginPath(); c.moveTo(x, -600); c.lineTo(x + 6, 100); c.stroke(); }
  for (let i = -3; i < 9; i++) { const bx = i * 170 + 20; const bg = c.createLinearGradient(0, 70, 0, 150); bg.addColorStop(0, mix('#4a3220', '#0c0a10', nt)); bg.addColorStop(1, mix('#2a1a10', '#06060a', nt)); c.fillStyle = bg;
    c.beginPath(); c.ellipse(bx, 110, 34, 40, 0, 0, 6.283); c.fill(); }
  c.fillStyle = mix('#3a2818', '#08080c', nt); c.fillRect(-800, 96, W + 1600, 28);
  // a painted dado along the bottom of the wall, and a lantern hanging from a beam
  c.fillStyle = mix('#9a6a44', '#1e1a28', nt * 0.85); c.fillRect(-800, RFY - 210, W + 1600, 210); c.fillStyle = mix('#c8a070', '#2a2634', nt * 0.85); c.fillRect(-800, RFY - 218, W + 1600, 10);
  c.strokeStyle = hexA(mix('#e0c08a', '#3a3444', nt), 0.35); c.lineWidth = 3; for (let x = -800; x < W + 800; x += 60) { c.beginPath(); c.moveTo(x, RFY - 180); c.lineTo(x + 30, RFY - 200); c.lineTo(x + 60, RFY - 180); c.stroke(); }
  c.strokeStyle = mix('#2a1a10', '#08080c', nt); c.lineWidth = 2; c.beginPath(); c.moveTo(400, 124); c.lineTo(400, 300); c.stroke(); lanternBox(c, 400, 330, 1.2, T, 4);
  // the niche with the oil lamp
  c.fillStyle = mix('#8a6a48', '#14121a', nt); c.beginPath(); archPath(c, 560, 900, 150, 200); c.fill();
  c.strokeStyle = mix('#c8a478', '#3a3444', nt); c.lineWidth = 6; c.beginPath(); archPath(c, 560, 904, 166, 214); c.stroke();
  oilLamp(c, 540, 896, 1.1, o.lamp === undefined ? (nt > 0.3 ? 1 : 0.3) : o.lamp, T);
  // shelf with a folded cloth and a bowl
  c.fillStyle = mix('#6a4a2c', '#14101a', nt); c.fillRect(380, 1080, 380, 16); c.fillStyle = mix('#9a7a8a', '#2a2430', nt); c.fillRect(420, 1048, 120, 32); bowl(c, 680, 1080, 0.9);
  // the window: sky (or night) behind a small arched opening, then the shaft of light
  c.save(); c.beginPath(); archPath(c, RWX, RWY, 150, 200); c.clip();
  const sk = c.createLinearGradient(0, RWY - 200, 0, RWY); sk.addColorStop(0, nt > 0.5 ? '#0e1430' : '#bcd8f0'); sk.addColorStop(1, nt > 0.5 ? '#2a2a50' : '#fff4dc'); c.fillStyle = sk; c.fillRect(RWX - 100, RWY - 210, 200, 220);
  if (nt > 0.5) stars(c, T, 10, 239, [RWX - 80, RWY - 200, 160, 180], 0.8);
  if (o.winShadow) { c.fillStyle = `rgba(20,14,10,${o.winShadow})`; c.fillRect(RWX - 100, RWY - 210, 200, 220); } // something blocks the opening
  c.restore();
  c.strokeStyle = mix('#b8946a', '#3a3444', nt); c.lineWidth = 12; c.beginPath(); archPath(c, RWX, RWY + 4, 172, 214); c.stroke();
  c.fillStyle = mix('#a8845a', '#2a2632', nt); c.fillRect(RWX - 96, RWY - 2, 192, 16);
  // floor
  const fg = c.createLinearGradient(0, RFY, 0, H + 400); fg.addColorStop(0, mix('#a88458', '#2a2430', nt * 0.85)); fg.addColorStop(1, mix('#6a4a30', '#141018', nt * 0.85));
  c.fillStyle = fg; c.fillRect(-800, RFY, W + 1600, H + 1000); c.fillStyle = 'rgba(40,24,12,0.35)'; c.fillRect(-800, RFY, W + 1600, 8);
  for (let i = 0; i < 40; i++) { c.fillStyle = hexA(r() > 0.5 ? '#fff0d0' : '#3a2614', 0.06); c.beginPath(); c.ellipse(-600 + r() * (W + 1200), RFY + 20 + r() * 500, 30 + r() * 60, 4 + r() * 6, 0, 0, 6.283); c.fill(); }
  // the door (left), barred from inside
  c.fillStyle = mix('#c8a478', '#2a2632', nt); c.beginPath(); archPath(c, RDX, RFY, RDW + 60, RDH + 44); c.fill();
  plankDoor(c, RDX, RFY, RDW, RDH, { shake: (o.shake || 0) * 3 * Math.sin(T * 70), open: o.open || 0, bar: o.bar === undefined ? true : o.bar, barGlow: o.barGlow || 0, frame: mix('#4a3020', '#14101a', nt) });
  if ((o.open || 0) > 0.02) { c.save(); c.globalCompositeOperation = 'lighter'; // the noon light pours in from the open door
    c.fillStyle = `rgba(255,236,190,${0.35 * o.open})`; c.beginPath(); c.moveTo(RDX - RDW / 2, RFY); c.lineTo(RDX + RDW / 2, RFY); c.lineTo(RDX + RDW * 2.4, RFY + 520); c.lineTo(RDX - RDW * 0.2, RFY + 520); c.closePath(); c.fill();
    glow(c, RDX, RFY - RDH * 0.5, RDH, '#fff0c8', 0.35 * o.open); c.restore(); }
  if (o.rings) { knockRings(c, RDX + 40, RFY - RDH * 0.5, T, o.rings, 1, nt > 0.5 ? '200,210,255' : '255,236,190', 300); knockFlash(c, RDX + 20, RFY - RDH * 0.5, T, o.rings, 0.7); }
  // mat, rug, cushions, jar
  c.fillStyle = mix('#d8c088', '#3a3440', nt * 0.8); c.beginPath(); c.moveTo(420, 1560); c.lineTo(1000, 1560); c.lineTo(1060, 1650); c.lineTo(370, 1650); c.closePath(); c.fill();
  c.strokeStyle = hexA(mix('#8a7040', '#1a1820', nt), 0.5); c.lineWidth = 2; for (let k = 0; k < 14; k++) { const q = k / 13; c.beginPath(); c.moveTo(lerp(420, 1000, q), 1560); c.lineTo(lerp(370, 1060, q), 1650); c.stroke(); }
  cushion(c, 470, 1556, 1.1, mix('#8a2a22', '#2a1a24', nt * 0.8)); cushion(c, 960, 1530, 0.9, mix('#3a5a6a', '#1a1a2a', nt * 0.8));
  jar(c, 1010, RFY + 10, 1.3, mix('#b0683a', '#2a2028', nt * 0.8));
  // the shaft of sunlight from the window, down to the floor (day only)
  const sh = (o.shaft === undefined ? 1 : o.shaft) * (1 - nt);
  if (sh > 0) { c.save(); c.globalCompositeOperation = 'lighter';
    const lg = c.createLinearGradient(RWX, RWY - 100, 560, 1640); lg.addColorStop(0, `rgba(255,240,200,${0.34 * sh})`); lg.addColorStop(1, `rgba(255,230,180,${0.1 * sh})`);
    c.fillStyle = lg; c.beginPath(); c.moveTo(RWX - 70, RWY - 150); c.lineTo(RWX + 70, RWY - 150); c.lineTo(760, 1660); c.lineTo(430, 1660); c.closePath(); c.fill();
    glow(c, 595, 1630, 220, '#fff0c8', 0.22 * sh); c.restore();
    dust(c, T, 40, 241, [480, RWY, 360, 1000], '#fff6dc', 0.5 * sh, 8); }
  if (nt > 0.4) { c.save(); c.globalCompositeOperation = 'lighter'; const lg = c.createLinearGradient(RWX, RWY - 100, 560, 1640); lg.addColorStop(0, `rgba(170,190,255,${0.14 * nt})`); lg.addColorStop(1, 'rgba(170,190,255,0)');
    c.fillStyle = lg; c.beginPath(); c.moveTo(RWX - 70, RWY - 150); c.lineTo(RWX + 70, RWY - 150); c.lineTo(760, 1660); c.lineTo(430, 1660); c.closePath(); c.fill(); c.restore(); }
}
function dkRoomFg(c, T, o = {}) { // blurred foreground: the edge of a hanging curtain on the right, a low table corner on the left
  blurLayer(c, 10, cc => { const nt = o.night || 0;
    cc.fillStyle = mix('#4a2a1e', '#120c16', nt * 0.8); cc.beginPath(); cc.moveTo(W + 300, -200); cc.lineTo(W + 10 + Math.sin(T * 0.8) * 8, -200); cc.quadraticCurveTo(W - 40, 900, W + 20 + Math.sin(T * 0.7) * 10, 2200); cc.lineTo(W + 300, 2200); cc.closePath(); cc.fill();
    cc.fillStyle = mix('#4a2e1a', '#0e0a10', nt * 0.8); cc.fillRect(-300, 1880, 420, 60); cc.fillRect(40, 1930, 40, 300); }, 2);
}

// 3) the assembly (yasa, stand): the courtyard of the house of prayer, filled; Al-Yasa' on the steps, old, with his stick;
//    the man who "nobody noticed" sits in the crowd (seat DKS) and stands up (rise 0..1).
const DKS = { x: 770, y: 1520 };
function ysHero(c, T, o = {}) {
  const z = o.z || 1, cx = o.cx || 540, cy = o.cy || 1180, dim = o.dim || 0;
  cam(c, z + 0.004 * Math.sin(T * 0.3), cx, cy);
  sky0(c, skyBlend({ sky: 'gold', to: 'day', k: 0.3 }));
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 180, 420, 620, '#ffe0a0', 0.32); c.restore(); sun(c, 180, 430, 40, '#fff0c8', 0.85);
  wisps(c, T, 300, 5, '#fff2dc', 0.14, 18, 4);
  hillsBehind(c, T, TTOP + 30, { far: '#9a8aa0', mid: '#7a6a6a', haze: '#f6d8b0', tree: '#3a3a30' });
  templeFacade(c, T, { fy: TFY, doorX: 540, glow: 0.75, windows: 0.4 });
  wallCrowd(c, T, 1);
  STANDERS.forEach(([x, y, d], i) => fig(c, FOLK[(i + 3) % 9], { x, y, h: 190, dir: d, light: 0.8, t: T + i, wind: 0.2, ink: 0.7 }));
  flagFloor(c, TFY + 60, 540, '#b89a72', { sheen: 0.25, sheenX: 540, sheenCol: '#ffd8a0' });
  for (let k = 0; k < 3; k++) { const w = 440 + k * 70; c.fillStyle = mix(STONE, '#fff2dc', 0.18 - k * 0.05); c.fillRect(540 - w / 2, TFY + k * 20, w, 20); c.fillStyle = hexA('#1a0c06', 0.25); c.fillRect(540 - w / 2, TFY + k * 20 + 16, w, 4); }
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, TFY - 200, 520, '#fff0c8', 0.24); c.restore();
  lean(c, 540, TFY + 2, 0.05, () => fig(c, YASA, { x: 540, y: TFY + 2, h: 290, dir: o.ydir || 1, light: 1.1, t: T, wind: 0.25, staff: !(o.arm > 0), armUp: o.arm || 0, veilGlow: 0.42 }));
  // the seated crowd without the man's seat, then the man (sitting, or standing up in a ray of light)
  const near = p => Math.hypot(p.x - DKS.x, p.y - DKS.y) < 70;
  const rows = (lo, hi, light) => SEATED.filter(p => p.row >= lo && p.row <= hi && !near(p)).forEach((p, i) => fig(c, FOLK[p.f], { x: p.x, y: p.y, h: p.h, dir: p.dir, pose: 'sit', light: light * (1 - dim * 0.35), t: T + p.ph, wind: 0.15, ink: p.row > 3 ? 0.8 : 0.6 }));
  rows(0, 1, 0.85);
  const rise = o.rise || 0, h = hS(DKS.y);
  if (o.lit > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, DKS.x, DKS.y - h * 0.9, h * 2.2, '#fff2d0', 0.35 * o.lit); c.restore(); rays(c, DKS.x, DKS.y - h * 2.6, Math.PI / 2, 0.5, h * 3, 8, '#fff6dc', 0.06 * o.lit, T, 243); }
  if (rise < 1) fig(c, DK, { x: DKS.x, y: DKS.y, h: h * 0.98, dir: -1, pose: 'sit', light: 0.95, t: T, wind: 0.15, alpha: 1 - ease(rise), veilGlow: 0.35 });
  if (rise > 0) fig(c, DK, { x: DKS.x, y: DKS.y, h: h * 1.02, dir: -1, light: 1.05, t: T, wind: 0.2, alpha: ease(rise), armUp: o.dkArm || 0, veilGlow: 0.6 });
  rows(2, 3, 0.85);
  blurLayer(c, 5, cc => SEATED.filter(p => p.row >= 4 && !near(p)).forEach(p => fig(cc, FOLK[p.f], { x: p.x, y: p.y, h: p.h, dir: p.dir, pose: 'sit', light: 0.75, t: T + p.ph, wind: 0.15, ink: 0.6 })), 2);
  if (dim > 0) { c.fillStyle = `rgba(20,12,8,${0.25 * dim})`; c.fillRect(-600, -600, W + 1200, H + 1200); }
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// 4) the three vows: sun (fast by day), crescent (pray by night), calm water (never angry); n lit
function vowIcon(c, i, x, y, r, col) { c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 4; c.lineCap = 'round';
  if (i === 0) { c.beginPath(); c.arc(x, y, r * 0.38, 0, 6.283); c.fill(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; c.beginPath(); c.moveTo(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55); c.lineTo(x + Math.cos(a) * r * 0.75, y + Math.sin(a) * r * 0.75); c.stroke(); } }
  else if (i === 1) { c.beginPath(); c.arc(x, y, r * 0.55, 0.9, 5.4, false); c.arc(x + r * 0.28, y - r * 0.12, r * 0.42, 5.0, 1.3, true); c.closePath(); c.fill(); }
  else { for (let k = -1; k <= 1; k++) { c.beginPath(); for (let q = -1; q <= 1.001; q += 0.1) { const xx = x + q * r * 0.6, yy = y + k * r * 0.3 + Math.sin(q * 3) * r * 0.06; q === -1 ? c.moveTo(xx, yy) : c.lineTo(xx, yy); } c.stroke(); } } }
function threeVows(c, n, a, y = 640, t = 0, o = {}) {
  if (a <= 0) return;
  const L = ['JEÛNER', 'PRIER', 'JAMAIS'], L2 = ['le jour', 'la nuit', 'en colère'];
  for (let i = 0; i < 3; i++) { const x = 540 + (i - 1) * 300, on = i < n, cur = i === n - 1, done = o.done;
    c.save(); c.globalAlpha = a;
    if (on) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y, 120, '#ffc860', cur && !done ? 0.45 + 0.15 * Math.sin(t * 4) : 0.28); c.restore(); }
    c.fillStyle = on ? '#f6c453' : 'rgba(10,8,14,0.6)'; c.beginPath(); c.arc(x, y, 58, 0, 6.283); c.fill();
    c.strokeStyle = on ? '#fff0c0' : 'rgba(246,196,83,0.85)'; c.lineWidth = 4; c.stroke();
    vowIcon(c, i, x, y, 58, on ? '#2a1a08' : '#f6c453');
    c.restore();
    textGlow(c, L[i], x, y + 108, '700 40px Lora', on ? '#f6c453' : '#fff6e0', a, '#000', 12);
    textGlow(c, L2[i], x, y + 154, 'italic 500 34px Lora', '#fff3dc', a * 0.95, '#000', 10);
    if (done) { c.save(); c.globalAlpha = a * done; c.strokeStyle = '#2a1a08'; c.lineWidth = 8; c.beginPath(); c.moveTo(x + 26, y + 30); c.lineTo(x + 40, y + 44); c.lineTo(x + 66, y + 14); c.stroke(); c.restore(); } }
}
function dayTag(c, n, a, y = 250) { if (a <= 0) return; topShade(c, a * 1.3); bigWord(c, `JOUR ${n}`, y, a, 104, '#f6c453');
  for (let i = 0; i < 3; i++) { const x = 540 + (i - 1) * 70, on = i < n; c.save(); c.globalAlpha = a; c.fillStyle = on ? '#f6c453' : 'rgba(10,8,14,0.55)'; c.beginPath(); c.arc(x, y + 90, 16, 0, 6.283); c.fill(); c.strokeStyle = '#fff0c0'; c.lineWidth = 3; c.stroke(); c.restore(); } }

// 5) the dark whispers (plan): devils are never drawn — only a creeping darkness, cold smoke over the night town
function darkSmoke(c, t, x, y, k, seed = 1, s = 1) { if (k <= 0) return; t += 100; const r = rng(seed);
  for (let i = 0; i < 40; i++) { const u = r() * 2 - 1, R = (60 + r() * 140) * s, dx = u * 520 * s + Math.sin(t * 0.4 + i) * 30 * s, dy = -r() * 300 * s + Math.cos(t * 0.3 + i * 1.7) * 24 * s;
    const g = c.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, R); g.addColorStop(0, `rgba(8,6,14,${0.5 * k * (1 - Math.abs(u) * 0.5)})`); g.addColorStop(1, 'rgba(8,6,14,0)');
    c.fillStyle = g; c.fillRect(x + dx - R, y + dy - R, R * 2, R * 2); } }
function nightTown(c, T, o = {}) { // the night street; a cold darkness slides down it from the far end (o.smoke), the lit windows go out one by one
  cam(c, o.z || 1, o.cx || 540, o.cy || 1150);
  streetSet(c, T, { night: 1, lamps: 0.8 * (1 - 0.6 * (o.smoke || 0)), torches: true });
  const k = o.smoke || 0;
  if (k > 0) { darkSmoke(c, T, VP[0], VP[1] + 40, k, 247, 0.7); darkSmoke(c, T, VP[0] + 120, VP[1] + 200, k * ramp(k, 0.3, 0.6), 249, 1.0); darkSmoke(c, T, 700, 1600, k * ramp(k, 0.6, 0.4), 253, 1.3);
    c.fillStyle = `rgba(4,4,12,${0.25 * k})`; c.fillRect(-800, -800, W + 1600, H + 1600); }
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// 6) the seat of judgment (court): the town gate in the afternoon, an awning, a low platform with a rug; people waiting their turn
const LINE = [[700, 1600, 1], [800, 1630, 4], [900, 1610, 6], [1000, 1640, 2], [1090, 1600, 7], [760, 1700, 8], [880, 1720, 0], [1010, 1730, 3]];
function awning(c, x0, x1, y, T) { // two poles and a striped cloth, its front edge rippling
  c.strokeStyle = '#4a3020'; c.lineWidth = 12; c.lineCap = 'round'; [x0, x1].forEach(x => { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 470); c.stroke(); });
  const n = 9, w = (x1 - x0) / n;
  for (let i = 0; i < n; i++) { const xa = x0 + i * w, sag = (q) => y + 30 + Math.sin(T * 1.4 + (i + q) * 0.8) * 4;
    c.fillStyle = i % 2 ? '#f0e2c4' : '#8a3a2a'; c.beginPath(); c.moveTo(xa, y - 40); c.lineTo(xa + w, y - 40); c.lineTo(xa + w, sag(1)); c.quadraticCurveTo(xa + w / 2, sag(0.5) + 16, xa, sag(0)); c.closePath(); c.fill(); }
  c.fillStyle = 'rgba(30,16,8,0.2)'; c.fillRect(x0, y - 44, x1 - x0, 10); }
function courtSet(c, T, o = {}) {
  const z = o.z || 1, cx = o.cx || 540, cy = o.cy || 1180, empty = o.empty || 0;
  cam(c, z + 0.004 * Math.sin(T * 0.3), cx, cy);
  sky0(c, skyBlend({ sky: 'gold', to: 'harsh', k: 0.35 }));
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 860, 600, 600, '#ffe0a0', 0.3); c.restore(); sun(c, 860, 600, 42, '#fff0c8', 0.9);
  wisps(c, T, 380, 5, '#fff2dc', 0.14, 25, 4);
  hillsBehind(c, T, 1060, { far: '#a090a0', mid: '#8a7a70', haze: '#f6dcb4', tree: '#3e3e32' });
  fortress(c, 760, 1270, 0.66, T, { close: 0, col: '#d0b088' });
  flagFloor(c, 1260, 760, '#c4a47a', { sheen: 0.18, sheenX: 760, sheenCol: '#fff0d0' });
  [[-200, 1290, 0.7], [1320, 1300, 0.75]].forEach(([x, y, s], i) => house(c, x, y, 420 * s, 500 * s, '#d0ae84', { lamp: 0, t: T + 100 + i }));
  // the gate passage beyond: people passing far away (small)
  if (!o.noPass) for (let i = 0; i < 3; i++) { const dist = ((T * 26 + i * 220) % 700), x = 560 + dist * 0.6; fig(c, FOLK[(i * 2 + 1) % 9], { x, y: 1290, h: 120, dir: 1, walk: stepOf(dist * 0.6, 120), light: 0.8, t: T + i, ink: 0.5 }); }
  // platform, rug, awning
  c.fillStyle = '#b89870'; c.fillRect(120, 1500, 520, 34); c.fillStyle = '#8a6a4a'; c.fillRect(120, 1534, 520, 20); c.fillStyle = 'rgba(255,240,210,0.3)'; c.fillRect(120, 1500, 520, 5);
  rug(c, 380, 1502, 460, 90, '#7a2a22');
  awning(c, 110, 660, 1040, T);
  c.fillStyle = 'rgba(40,20,10,0.16)'; c.fillRect(110, 1504, 550, 140);
  // the elders sitting on the left side of the platform
  [[170, 1502, 1, 0], [240, 1506, 1, 6]].forEach(([x, y, d, f], i) => fig(c, FOLK[f], { x, y, h: 220, dir: d, pose: 'sit', light: 0.85, t: T + i, ink: 0.8 }));
  // Dhul-Kifl: seated, judging; or standing, looking for the old man
  const dko = o.look ? { x: 430, y: 1502, h: 330, dir: o.lookDir || 1, light: 1, t: T, wind: 0.2, armUp: o.lookArm || 0, veilGlow: 0.42 } : { x: 430, y: 1502, h: 320, dir: 1, pose: 'sit', light: 1, t: T, wind: 0.15, reach: o.reach || 0, veilGlow: 0.42 };
  fig(c, DK, dko);
  // the line of people (one place empty where the old man should have been)
  // the line of people; when empty > 0 the first place (where the old man should stand) stays empty
  LINE.slice().sort((a, b) => a[1] - b[1]).forEach(([x, y, f], i) => { if (empty > 0 && x === 700) return; fig(c, FOLK[f], { x, y, h: 300 + (y - 1600) * 0.9, dir: -1, light: 0.85, t: T + i * 1.3, wind: 0.25, reach: (f === 4 && o.plead) ? 0.6 : 0 }); });
  if (empty > 0) { c.save(); c.globalAlpha = empty; c.strokeStyle = 'rgba(255,240,200,0.8)'; c.lineWidth = 5; c.setLineDash([14, 12]); c.beginPath(); c.ellipse(690, 1602, 80, 20, 0, 0, 6.283); c.stroke(); c.setLineDash([]); c.restore();
    dust(c, T, 18, 249, [600, 1420, 200, 180], '#fff0d0', 0.45 * empty, 20); }
  blurLayer(c, 10, cc => { jar(cc, 60, 2160, 3.2, '#9a5a32'); cc.strokeStyle = '#3a2414'; cc.lineWidth = 34; cc.beginPath(); cc.moveTo(1040, -200); cc.lineTo(1060, 2300); cc.stroke(); }, 2);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// the reveal two-shot inside the room: Dhul-Kifl (left, in the light) faces the old man (right) who stands inside the shut room;
// the low lamp throws the old man's shadow up the wall (sh = height factor); dark = the room darkens around the old man; calm = light on Dhul-Kifl
function twoShot(c, T, o = {}) {
  dkRoom(c, T, { z: o.z, cx: o.cx, cy: o.cy, shaft: 0.45, winShadow: 0.3, lamp: 1 });
  const dk = o.dark || 0;
  if (dk > 0) { const g = c.createRadialGradient(900, 1300, 100, 900, 1300, 900); g.addColorStop(0, `rgba(8,6,16,${0.45 * dk})`); g.addColorStop(1, `rgba(8,6,16,${0.15 * dk})`); c.fillStyle = g; c.fillRect(-600, -600, W + 1200, H + 1200); }
  castShadow(c, OLDM, { x: 800, y: 1590, h: 400, dir: -1, t: T }, 0.5 + 0.25 * dk, -0.32, o.sh || 1.25, 7);
  oldMan(c, { x: 800, y: 1590, h: 400, dir: -1, t: T, light: 0.75 - 0.15 * dk });
  const cl = o.calm || 0; c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 380, 1330, 420, '#fff0c8', 0.18 + 0.25 * cl); c.restore();
  fig(c, DK, { x: 380, y: 1600, h: 420, dir: 1, light: 1.05, t: T, reach: o.reach || 0, veilGlow: 0.42 });
  dkRoomFg(c, T);
}



// =====================================================================================================================


// =====================================================================================================================
// ---------- episode 26: 'Uzayr
const UZ = { veilGlow: 0.42, prophet: true, robe: '#ebe5d6', wrap: '#f7f3ea', skin: '#c49470', trim: '#cfae6a', band: '#b8954a', inner: '#fbf8f0' };
const JPEOPLE = [FOLK[0], FOLK[1], FOLK[2], FOLK[4], FOLK[5], FOLK[7], FOLK[8], FOLK[3], FOLK[6]];
function seriesTag26(c, a) { seriesTag(c, a, 26); }
const SKY26 = {
  day: [[0, '#5a88bc'], [0.3, '#a8c4da'], [0.5, '#f0e2c4']], gold: [[0, '#465a8c'], [0.3, '#d6a684'], [0.5, '#ffd49a']],
  dusk: [[0, '#1e2244'], [0.3, '#7a4a62'], [0.5, '#f0905a']], night: [[0, '#04071a'], [0.3, '#0e1834'], [0.5, '#283052']],
  ash: [[0, '#2a1c1c'], [0.3, '#7a4632'], [0.5, '#d2803e']], dawn: [[0, '#2e3a6a'], [0.3, '#b898a8'], [0.5, '#ffd6a4']],
  grey: [[0, '#5a6278'], [0.3, '#a8a6a8'], [0.5, '#e2d6c2']],
};
function skyStops(a, b, k = 0) { let st = SKY26[a]; if (b) st = st.map((s, i) => [s[0], mix(s[1], SKY26[b][i][1], clamp(k))]); return st; }
// the time-lapse sky: ph = fraction of a day (0 midnight, 0.5 noon); returns {el, day} for the lights of the land
function daySky(c, ph) {
  const el = Math.sin((ph - 0.25) * 6.283), day = clamp(el * 2.2 + 0.35), gold = clamp(1 - Math.abs(el) * 2.6) * (el > -0.3 ? 1 : 0);
  let st = SKY26.night.map((s, i) => [s[0], mix(s[1], SKY26.day[i][1], day)]);
  st = st.map((s, i) => [s[0], mix(s[1], SKY26.dusk[i][1], gold * 0.75)]);
  sky0(c, st);
  return { el, day, gold };
}
// ground of the near hillside where 'Uzayr rests (feet, bodies, bones and baskets all sit on gY)
const gY = x => 1600 - (x - 540) * 0.05 + Math.sin(x * 0.005 + 1) * 16;
function slope(c, t, o = {}) {
  const col = o.col || '#a8875a', nt = o.night || 0, cc = mix(col, '#141420', nt * 0.8);
  const g = c.createLinearGradient(0, 1520, 0, H + 200); g.addColorStop(0, mix(cc, '#fff0d0', 0.16 * (1 - nt))); g.addColorStop(0.35, cc); g.addColorStop(1, mix(cc, '#140c06', 0.55));
  c.fillStyle = g; c.beginPath(); c.moveTo(-1600, H + 900); for (let x = -1600; x <= 2700; x += 16) c.lineTo(x, gY(x)); c.lineTo(2700, H + 900); c.closePath(); c.fill();
  c.strokeStyle = hexA(mix(cc, '#fff2d8', 0.4), 0.35 * (1 - nt * 0.7)); c.lineWidth = 3; c.beginPath(); for (let x = -1600; x <= 2700; x += 16) x === -1600 ? c.moveTo(x, gY(x) + 1) : c.lineTo(x, gY(x) + 1); c.stroke();
  const r = rng(o.seed || 2621), grass = o.grass === undefined ? 1 : o.grass, green = o.green || 0;
  for (let i = 0; i < 190; i++) { // tufts and stones, bigger toward the viewer
    const x = -1500 + r() * 4100, q = Math.pow(r(), 1.5), yy = gY(x) + 6 + q * (H + 250 - gY(x)), sz = 5 + q * 30, kind = r();
    if (kind < 0.3) { c.fillStyle = hexA(mix(cc, r() > 0.5 ? '#000000' : '#fff0d8', 0.32), 0.7); c.beginPath(); c.ellipse(x, yy, sz, sz * 0.42, 0, 0, 6.283); c.fill(); continue; }
    if (r() > grass) continue;
    const gc = mix(mix(mix(cc, '#c8a868', 0.4), '#6a8a3a', green), '#10141c', nt * 0.7);
    c.strokeStyle = hexA(gc, 0.85); c.lineWidth = 1 + q * 3; c.lineCap = 'round';
    for (let b = -2; b <= 2; b++) { const sw = Math.sin(t * 1.3 + i + b) * sz * 0.18 * (o.wind || 1); c.beginPath(); c.moveTo(x + b * sz * 0.2, yy); c.quadraticCurveTo(x + b * sz * 0.35, yy - sz * 0.8, x + b * sz * 0.55 + sw, yy - sz * (1.1 - Math.abs(b) * 0.12)); c.stroke(); }
  }
}
// Jerusalem on its hill, far away: ruins (k = 0) or rebuilt (k = 1, lamps when night)
function brokenTop(c, x0, x1, yb, hL, hR, seed, step = 46) { // stepped jagged profile of broken masonry: returns the points
  const r = rng(seed), pts = [[x0, yb]];
  for (let x = x0; x < x1; x += 56) { const q = (x - x0) / (x1 - x0), hh = lerp(hL, hR, q) * (0.6 + 0.4 * r()), yy = yb - Math.round(hh / step) * step;
    pts.push([x, yy]); pts.push([Math.min(x1, x + 56), yy]); }
  pts.push([x1, yb]); return pts;
}
function brokenWall(c, x0, x1, yb, hL, hR, col, seed, o = {}) { // a wall of dressed stone broken off in steps, rim light on every step
  const pts = brokenTop(c, x0, x1, yb, hL, hR, seed, o.step || 46), top = Math.min(...pts.map(p => p[1]));
  c.save(); c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.clip();
  ashlar(c, x0 - 120, top - 10, x1 + 120, yb, col, seed);
  const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, `rgba(255,236,200,${0.08 * (o.lit || 1)})`); g.addColorStop(1, 'rgba(20,10,5,0.28)'); c.fillStyle = g; c.fillRect(x0, top, x1 - x0, yb - top);
  if (o.night) { c.fillStyle = `rgba(10,12,30,${0.7 * o.night})`; c.fillRect(x0, top, x1 - x0, yb - top); }
  c.restore();
  c.strokeStyle = hexA(mix(col, '#fff2dc', 0.45), 0.55 * (1 - (o.night || 0) * 0.8)); c.lineWidth = 3; c.beginPath();
  for (let i = 1; i < pts.length - 1; i += 2) { c.moveTo(pts[i][0], pts[i][1] + 1); c.lineTo(pts[i + 1][0], pts[i + 1][1] + 1); } c.stroke();
}
function rubble(c, x, y, w, s, col, seed, nt = 0) { // a heap of fallen blocks and stones
  const r = rng(seed), cc = mix(col, '#141420', nt * 0.75);
  c.fillStyle = mix(cc, '#1a0c06', 0.35); c.beginPath(); c.ellipse(x, y, w / 2, 18 * s, 0, Math.PI, 0); c.fill();
  for (let i = 0; i < 16; i++) { const q = r(), bx = x + (q - 0.5) * w * 0.9, by = y - Math.sin(q * Math.PI) * 40 * s * r() - 6 * s, bw = (30 + r() * 46) * s, bh = (20 + r() * 22) * s;
    c.save(); c.translate(bx, by); c.rotate((r() - 0.5) * 0.9);
    const g = c.createLinearGradient(0, -bh / 2, 0, bh / 2); g.addColorStop(0, mix(cc, '#fff2dc', 0.25)); g.addColorStop(1, mix(cc, '#1a0c06', 0.4));
    c.fillStyle = g; c.fillRect(-bw / 2, -bh / 2, bw, bh); c.strokeStyle = hexA(mix(cc, '#1a0c06', 0.6), 0.5); c.lineWidth = 2; c.strokeRect(-bw / 2, -bh / 2, bw, bh); c.restore(); }
}
function ruinTown(c, t, x, y, s, o = {}) {
  const nt = o.night || 0, base = mix('#c6a882', '#2a2632', nt * 0.85), wallC = mix('#b0906a', '#201c26', nt * 0.85), dk = mix(base, '#1a0c06', 0.5);
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = mix('#9a7a52', '#16141c', nt * 0.85); c.beginPath(); c.ellipse(0, 12, 840, 120, 0, Math.PI, 0); c.fill(); // the hill top
  const r = rng(o.seed || 2611);
  // the great sanctuary on top, broken: platform, column stumps, a fallen lintel
  c.fillStyle = mix(base, '#000000', 0.12); c.fillRect(-230, -300, 460, 74); c.fillStyle = mix(base, '#fff0d8', 0.18); c.fillRect(-230, -306, 460, 10);
  [[-170, 150], [-90, 70], [-10, 210], [80, 40], [160, 120]].forEach(([cx, hh]) => { c.fillStyle = mix(base, '#fff0d8', 0.12); c.beginPath(); c.moveTo(cx - 17, -300); c.lineTo(cx - 17, -300 - hh); c.lineTo(cx - 4, -300 - hh - 14); c.lineTo(cx + 6, -300 - hh + 6); c.lineTo(cx + 17, -300 - hh - 8); c.lineTo(cx + 17, -300); c.closePath(); c.fill();
    c.fillStyle = hexA(dk, 0.45); c.fillRect(cx + 5, -300 - hh + 4, 12, hh - 4); });
  c.save(); c.translate(120, -232); c.rotate(0.18); c.fillStyle = mix(base, '#fff0d8', 0.1); c.fillRect(-110, -16, 220, 30); c.restore();
  // roofless houses, row after row, their right corners fallen
  for (let row = 0; row < 3; row++) { const ry = -170 + row * 60, n = 8 - (row === 0 ? 2 : 0);
    for (let i = 0; i < n; i++) { const hx = (row === 0 ? -420 : -600) + i * 160 + (row % 2) * 50 + (r() - 0.5) * 30, w = 110 + r() * 60, h = 80 + r() * 60 - row * 6;
      house(c, hx, ry, w, h, mix(base, r() > 0.5 ? '#fff0d8' : '#6a4a3a', 0.12 + r() * 0.1), { ruin: 0.7 + r() * 0.3, t: t + 100 }); } }
  // the city wall, broken with breaches, and its towers cut down
  brokenWall(c, -720, -330, 0, 150, 90, wallC, 2612, { night: nt }); brokenWall(c, -250, 40, 0, 60, 130, wallC, 2613, { night: nt });
  brokenWall(c, 150, 420, 0, 110, 40, wallC, 2614, { night: nt }); brokenWall(c, 500, 720, 0, 170, 120, wallC, 2615, { night: nt });
  [[-300, 0, 260, 0.9], [90, 0, 220, 1.1], [460, 0, 240, 0.8]].forEach(([rx, ry, w, ss], i) => rubble(c, rx, ry + 6, w, ss * 1.6, wallC, 2616 + i, nt));
  c.restore();
}
function townK(c, t, x, y, s, k, o = {}) { // ruins -> rebuilt (cross-fade at distance; rebuilt = walls, houses, lamps)
  const m = c.getTransform();
  if (k < 1) ruinTown(c, t, x, y, s, o);
  if (k > 0) layer(c, ease(k), cc => { cc.setTransform(m); sodomCity(cc, t, x, y, s, { lamp: o.lamp || 0, night: o.night || 0, seed: 2617 }); });
}
// the land around Jerusalem: sky, far ranges, the city hill, olive terraces, haze; the near slope is drawn by slope()
function judea(c, t, o = {}) {
  const fy = o.fy || 1240, px = o.px || 0, nt = o.night || 0;
  if (o.skyFn) o.skyFn(c); else sky0(c, skyStops(o.sky || 'gold', o.to, o.k));
  if (o.stars) stars(c, t, 140, 2622, [-400, -300, W + 800, fy - 150], o.stars);
  if (o.sun !== false) { const sx = o.sunX === undefined ? 860 : o.sunX, sy = o.sunY === undefined ? fy - 360 : o.sunY, sa = o.sunA === undefined ? 1 : o.sunA;
    if (sa > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, sx, sy, 460, o.sunCol || '#ffd8a0', 0.38 * sa); c.restore(); sun(c, sx, sy, o.sunR || 44, '#ffe2a8', sa); } }
  if (o.moon) moon(c, o.moonX || 300, o.moonY || 420, 42, o.moon);
  wisps(c, t, fy - 820, 6, o.wisp || '#fff2dc', 0.12 * (1 - nt), 2623, 5);
  const far = mix(o.far || '#8a84a0', '#121628', nt), mid = mix(o.mid || '#8a7a68', '#141622', nt), hz = mix(o.haze || '#f6d0a8', '#262a48', nt), ol1 = mix('#6a7450', '#0e120e', nt), ol2 = mix('#46502e', '#080a08', nt);
  par(c, 0.08, px, 0, () => { ridgeW(c, fy - 250, 150, 0.0021, 2624, far); hazeW(c, fy - 220, 240, hz, 0.55); });
  par(c, 0.2, px, 0, () => { ridgeW(c, fy - 90, 70, 0.0028, 2625, mid); hazeW(c, fy - 60, 140, hz, 0.3);
    const cx = o.cityX === undefined ? 760 : o.cityX; townK(c, t, cx, ridgeY(cx, fy - 90, 70, 0.0028, 2625) + 40, o.cityS || 0.36, o.city || 0, { night: nt, lamp: o.lamp || 0 });
    if (o.cityFx) o.cityFx(c, cx, ridgeY(cx, fy - 90, 70, 0.0028, 2625));
    hazeW(c, fy - 10, 90, hz, 0.35); });
  par(c, 0.4, px, 0, () => { ridgeW(c, fy + 40, 40, 0.0035, 2626, mix(o.near || '#9a8460', '#12141a', nt));
    for (let i = -16; i < 26; i++) { const x = i * 96 + (i % 3) * 22, yy = ridgeY(x, fy + 40, 40, 0.0035, 2626) + 26 + (i % 2) * 12; if (o.groves === false) continue; oliveTree(c, x, yy, 0.3, ol1, ol2, Math.sin(t + i) * 2); }
    if (o.walkers) o.walkers(c);
    hazeW(c, fy + 70, 90, hz, 0.25); });
}

// ---------- the donkey: grey coat, long ears, upright dark mane, pale muzzle, eye ring and belly, the dark cross on the shoulders
// (x, y) = hooves on the ground; walk = cycle phase (drive it by distance: donkeyStep); lie 0..1 = lying down, legs folded
const DONK = '#8e8274';
const donkeyStep = (dist, s) => dist / (150 * s);
function donkey(c, x, y, s, t, o = {}) {
  const a = o.alpha === undefined ? 1 : o.alpha; if (a <= 0) return;
  const dir = o.dir || 1, col = o.col || DONK, dk = mix(col, '#000000', 0.38), dk2 = mix(col, '#000000', 0.55), lt = mix(col, '#ffffff', 0.22), pale = mix(col, '#efe8de', 0.75);
  const lie = clamp(o.lie || 0), walking = o.walk !== undefined && o.walk !== null && lie === 0, p = walking ? o.walk * 6.283 : 0, head = o.head || 0;
  c.save(); c.globalAlpha *= a; c.translate(x, y);
  if (o.shadow !== false) { c.fillStyle = 'rgba(10,6,4,0.26)'; c.beginPath(); c.ellipse(6 * s * dir, 2, 128 * s, 12 * s, 0, 0, 6.283); c.fill(); }
  c.scale(s * dir, s);
  const by = lerp(0, 60, ease(lie)) + (walking ? -Math.abs(Math.sin(p)) * 3 : 0);
  const leg = (hx, ph, far, rear) => { // upper leg, knee/hock, cannon, hoof; drawn from the hip
    const cl = far ? dk : col;
    if (lie > 0.5) { c.fillStyle = far ? dk : mix(col, '#000000', 0.15); c.beginPath(); c.ellipse(hx + (rear ? 6 : 14), -14, 34, 13, 0, 0, 6.283); c.fill();
      c.fillStyle = '#2a221c'; c.beginPath(); c.ellipse(hx + (rear ? 34 : 46), -7, 9, 6, 0, 0, 6.283); c.fill(); return; }
    const sw = walking ? Math.sin(p + ph) : 0, lift = walking ? Math.max(0, Math.cos(p + ph)) : 0;
    const hip = [hx, -112 + by], knee = [hx + sw * 12 + (rear ? -10 : 2), -58 - lift * 9], foot = [hx + sw * 24 + (rear ? -4 : 2), -lift * 10];
    limb(c, hip, [hx + (rear ? -6 : 4), -86 + by * 0.5], knee, rear ? 40 : 28, 13, cl);
    limb(c, knee, [(knee[0] + foot[0]) / 2, (knee[1] + foot[1]) / 2], [foot[0], foot[1] - 8], 12, 9, cl);
    c.fillStyle = mix(cl, '#000000', 0.15); c.beginPath(); c.ellipse(knee[0], knee[1], 7, 6, 0, 0, 6.283); c.fill();
    c.fillStyle = '#2a221c'; c.beginPath(); c.moveTo(foot[0] - 7, foot[1] - 10); c.lineTo(foot[0] + 8, foot[1] - 10); c.lineTo(foot[0] + 10, foot[1]); c.lineTo(foot[0] - 8, foot[1]); c.closePath(); c.fill();
  };
  leg(-58, Math.PI, true, true); leg(54, 0, true, false);
  // tail: thin, with a dark tuft, swishing
  const tw = Math.sin(t * 2.1) * 0.22 + (o.swish || 0) * Math.sin(t * 7) * 0.3;
  c.save(); c.translate(-88, -136 + by); c.rotate(0.25 + tw); c.strokeStyle = dk; c.lineWidth = 5; c.lineCap = 'round';
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-6, 34, -2, 64 - lie * 20); c.stroke(); c.fillStyle = dk2; c.beginPath(); c.ellipse(-2, 72 - lie * 20, 7, 14, 0, 0, 6.283); c.fill(); c.restore();
  // body: barrel, round rump, pale belly
  const g = c.createLinearGradient(0, -160 + by, 0, -78 + by); g.addColorStop(0, lt); g.addColorStop(0.5, col); g.addColorStop(1, dk);
  c.fillStyle = g; c.beginPath(); c.moveTo(-92, -128 + by);
  c.bezierCurveTo(-96, -160 + by, -64, -164 + by, -40, -156 + by); c.bezierCurveTo(-6, -150 + by, 30, -156 + by, 58, -154 + by);
  c.bezierCurveTo(80, -150 + by, 88, -128 + by, 80, -104 + by); c.bezierCurveTo(60, -84 + by, -40, -80 + by, -74, -92 + by);
  c.bezierCurveTo(-88, -100 + by, -92, -112 + by, -92, -128 + by); c.closePath(); c.fill();
  c.save(); c.clip(); c.fillStyle = hexA(pale, 0.75); c.beginPath(); c.ellipse(-4, -84 + by, 74, 16, 0, 0, 6.283); c.fill(); c.restore();
  c.strokeStyle = hexA(dk2, 0.7); c.lineWidth = 5; c.beginPath(); c.moveTo(-84, -148 + by); c.quadraticCurveTo(-10, -158 + by, 60, -156 + by); c.stroke(); // dorsal stripe
  c.lineWidth = 4; c.beginPath(); c.moveTo(50, -158 + by); c.quadraticCurveTo(44, -136 + by, 46, -112 + by); c.stroke(); // shoulder cross
  c.strokeStyle = hexA(lt, 0.5); c.lineWidth = 3; c.beginPath(); c.moveTo(-70, -156 + by); c.quadraticCurveTo(-20, -162 + by, 40, -158 + by); c.stroke(); // rim light
  if (o.blanket) { c.fillStyle = o.blanket; c.beginPath(); c.moveTo(-34, -160 + by); c.quadraticCurveTo(8, -168 + by, 44, -158 + by); c.lineTo(48, -112 + by); c.lineTo(-40, -112 + by); c.closePath(); c.fill();
    c.strokeStyle = '#e9c46a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-38, -122 + by); c.lineTo(46, -122 + by); c.moveTo(-36, -146 + by); c.lineTo(44, -144 + by); c.stroke();
    c.fillStyle = '#6a4a2a'; c.beginPath(); c.roundRect(-60, -136 + by, 34, 42, 8); c.fill(); c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(-60, -110 + by, 34, 5); } // saddle bag
  // neck, mane, head
  const hd = [lerp(122, 152, head), lerp(-200, -46, head) + by * (1 - head * 0.6)];
  const n0 = [62, -138 + by], nm = [lerp(98, 116, head), lerp(-176, -112, head) + by];
  limb(c, n0, nm, [hd[0] - 10, hd[1] + 10], 54, 30, col);
  c.strokeStyle = dk2; c.lineWidth = 3; c.lineCap = 'round'; // the short upright mane
  for (let k = 0; k <= 12; k++) { const q = k / 12, qa = (1 - q) * (1 - q), qb = 2 * (1 - q) * q, qc = q * q;
    const mx = qa * (n0[0] - 10) + qb * (nm[0] - 14) + qc * (hd[0] - 18), my = qa * (n0[1] - 22) + qb * (nm[1] - 16) + qc * (hd[1] - 12);
    c.beginPath(); c.moveTo(mx, my); c.lineTo(mx - 6, my - 13); c.stroke(); }
  c.save(); c.translate(hd[0], hd[1]); c.rotate(lerp(0.85, 1.45, head));
  const ear = (dx, ang, len, far) => { c.save(); c.translate(-6 + dx, -12); c.rotate(ang + Math.sin(t * 1.3 + dx) * 0.05 + (o.earFlick || 0) * Math.sin(t * 9) * 0.25);
    c.fillStyle = far ? dk : col; c.beginPath(); c.moveTo(-8, 0); c.quadraticCurveTo(-14, -len * 0.6, 0, -len); c.quadraticCurveTo(12, -len * 0.6, 8, 0); c.closePath(); c.fill();
    c.fillStyle = hexA(pale, 0.55); c.beginPath(); c.moveTo(-3, -6); c.quadraticCurveTo(-6, -len * 0.55, 0, -len * 0.85); c.quadraticCurveTo(5, -len * 0.55, 3, -6); c.closePath(); c.fill();
    c.fillStyle = dk2; c.beginPath(); c.moveTo(-5, -len * 0.82); c.quadraticCurveTo(0, -len * 1.02, 5, -len * 0.82); c.closePath(); c.fill(); c.restore(); };
  ear(-10, -2.1, 66, true);
  c.fillStyle = col; c.beginPath(); c.ellipse(6, 0, 30, 20, 0, 0, 6.283); c.fill(); // skull
  c.beginPath(); c.moveTo(14, -14); c.quadraticCurveTo(52, -12, 62, 4); c.quadraticCurveTo(58, 24, 18, 20); c.closePath(); c.fill(); // long face
  c.fillStyle = pale; c.beginPath(); c.ellipse(54, 6, 17, 15, 0.2, 0, 6.283); c.fill(); // pale muzzle
  c.fillStyle = '#3a302a'; c.beginPath(); c.ellipse(62, 2, 4, 3, 0.4, 0, 6.283); c.fill(); c.strokeStyle = '#4a3c34'; c.lineWidth = 2; c.beginPath(); c.moveTo(46, 18); c.quadraticCurveTo(56, 22, 64, 14); c.stroke();
  c.fillStyle = hexA(pale, 0.8); c.beginPath(); c.ellipse(8, -6, 9, 7, 0, 0, 6.283); c.fill(); c.fillStyle = '#1a120c'; c.beginPath(); c.ellipse(9, -6, 4, 3.4, 0, 0, 6.283); c.fill(); // eye ring + eye
  ear(4, -1.75, 70, false);
  if (o.halter) { c.strokeStyle = o.halter; c.lineWidth = 3; c.beginPath(); c.ellipse(34, 4, 16, 17, 0, 0, 6.283); c.stroke(); c.beginPath(); c.moveTo(8, -18); c.lineTo(22, 18); c.stroke(); }
  c.restore();
  leg(-48, 0, false, true); leg(66, Math.PI, false, false);
  c.restore();
}
function halterOf(x, y, s, dir = 1, head = 0) { const hx = lerp(122, 152, head) + 34 * Math.cos(lerp(0.85, 1.45, head)), hy = lerp(-200, -46, head) + 34 * Math.sin(lerp(0.85, 1.45, head)); return [x + dir * hx * s, y + hy * s]; }

// ---------- the donkey's bones (Al-Baqara 259: "look at the bones, how We raise them, then We clothe them with flesh")
// clean ivory bones, no gore. k = 0: scattered on the ground where it lay; k = 1: each bone in its place, the skeleton standing.
const BONES26 = (() => { const L = [], r = rng(2631);
  const add = (kind, cx, cy, ang, len, w = 10) => L.push({ kind, cx, cy, ang, len, w });
  const long = (p0, p1, w) => add('long', (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, Math.atan2(p1[1] - p0[1], p1[0] - p0[0]), Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), w);
  // legs (far first): [hip/shoulder, knee, fetlock, hoof]
  [[[-66, -124], [-72, -62], [-62, -14]], [[46, -128], [52, -62], [54, -14]], [[-52, -124], [-60, -62], [-50, -14]], [[60, -128], [66, -62], [68, -14]]].forEach(([a, b, d]) => { long(a, b, 12); long(b, d, 9); add('hoof', d[0] + 2, -6, 0, 18, 10); });
  add('pelvis', -66, -138, 0.1, 46); add('scap', 50, -140, 1.3, 50);
  for (let i = 0; i < 13; i++) { const q = i / 12, x = lerp(58, -80, q), y = -150 - Math.sin(q * Math.PI) * 8; add('vert', x, y, 0.04, 12, 10); }
  for (let i = 0; i < 9; i++) { const x = lerp(40, -40, i / 8), l = 46 + Math.sin((i + 1) / 10 * Math.PI) * 20; add('rib', x - 6, -152 + l / 2 + 2, Math.PI / 2 + 0.22, l, 5); }
  for (let i = 0; i < 6; i++) { const q = i / 5; add('vert', lerp(66, 112, q), lerp(-152, -196, q), -0.8, 14, 11); }
  for (let i = 0; i < 4; i++) add('vert', -88 - i * 3, -132 + i * 14, 1.4, 9, 7);
  add('skull', 134, -178, 0.95, 84, 30);
  L.forEach((b, i) => { b.d = (b.kind === 'hoof' ? 0 : b.kind === 'long' ? 0.08 : b.kind === 'skull' ? 0.5 : 0.15 + r() * 0.4); // the order they rise in
    b.sx = b.kind === 'skull' ? 150 : b.cx * 1.15 + (r() - 0.5) * 50; b.sy = -5 - r() * 7; b.sa = (r() - 0.5) * 1.4 + (b.kind === 'rib' ? Math.PI * 0.05 : 0); });
  return L; })();
function drawBone(c, b, glowK) {
  const ivory = '#efe6d0', shade = '#b8a888', ink = 'rgba(70,56,40,0.85)';
  c.lineJoin = 'round'; c.lineCap = 'round';
  if (b.kind === 'long' || b.kind === 'hoof') { const L = b.len, w = b.w;
    if (b.kind === 'hoof') { c.fillStyle = shade; c.beginPath(); c.moveTo(-9, -6); c.lineTo(9, -6); c.lineTo(11, 6); c.lineTo(-10, 6); c.closePath(); c.fill(); c.strokeStyle = ink; c.lineWidth = 1.5; c.stroke(); return; }
    c.fillStyle = ivory; c.strokeStyle = ink; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-L / 2 + w * 0.6, -w * 0.42); c.lineTo(L / 2 - w * 0.6, -w * 0.42); c.arc(L / 2 - w * 0.4, -w * 0.38, w * 0.48, Math.PI, 0.5 * Math.PI); c.arc(L / 2 - w * 0.4, w * 0.38, w * 0.48, -0.5 * Math.PI, Math.PI * 0.9);
    c.lineTo(-L / 2 + w * 0.6, w * 0.42); c.arc(-L / 2 + w * 0.4, w * 0.38, w * 0.48, 0.1, 1.5 * Math.PI); c.arc(-L / 2 + w * 0.4, -w * 0.38, w * 0.48, 0.5 * Math.PI, 0); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = hexA(shade, 0.8); c.lineWidth = 2; c.beginPath(); c.moveTo(-L / 2 + w, w * 0.15); c.lineTo(L / 2 - w, w * 0.15); c.stroke(); return; }
  if (b.kind === 'rib') { c.strokeStyle = ink; c.lineWidth = b.w + 3; c.beginPath(); c.moveTo(-b.len / 2, 0); c.quadraticCurveTo(0, -b.len * 0.28, b.len / 2, 0); c.stroke();
    c.strokeStyle = ivory; c.lineWidth = b.w; c.stroke(); return; }
  if (b.kind === 'vert') { c.fillStyle = ivory; c.strokeStyle = ink; c.lineWidth = 1.6; c.beginPath(); c.roundRect(-b.len / 2, -b.w / 2, b.len, b.w, 3); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-2, -b.w / 2); c.lineTo(-5, -b.w / 2 - 9); c.lineTo(2, -b.w / 2); c.closePath(); c.fill(); c.stroke(); return; }
  if (b.kind === 'pelvis') { c.fillStyle = ivory; c.strokeStyle = ink; c.lineWidth = 2; c.beginPath(); c.moveTo(-24, -12); c.quadraticCurveTo(0, -24, 24, -10); c.quadraticCurveTo(20, 6, 6, 8); c.quadraticCurveTo(0, 22, -10, 20); c.quadraticCurveTo(-26, 6, -24, -12); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = shade; c.beginPath(); c.ellipse(-6, 4, 6, 5, 0, 0, 6.283); c.fill(); return; }
  if (b.kind === 'scap') { c.fillStyle = ivory; c.strokeStyle = ink; c.lineWidth = 2; c.beginPath(); c.moveTo(-25, -12); c.lineTo(25, -4); c.lineTo(25, 4); c.lineTo(-25, 14); c.closePath(); c.fill(); c.stroke(); return; }
  if (b.kind === 'skull') { const L = b.len; c.fillStyle = ivory; c.strokeStyle = ink; c.lineWidth = 2.2; // pointing +x: cranium at -x, long face toward +x
    c.beginPath(); c.moveTo(-L * 0.45, -10); c.quadraticCurveTo(-L * 0.42, -24, -L * 0.15, -20); c.quadraticCurveTo(L * 0.2, -16, L * 0.48, -6); c.quadraticCurveTo(L * 0.54, 2, L * 0.46, 8);
    c.quadraticCurveTo(L * 0.1, 10, -L * 0.2, 16); c.quadraticCurveTo(-L * 0.46, 14, -L * 0.45, -10); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#4a3a2c'; c.beginPath(); c.ellipse(-L * 0.18, -6, 7, 6, 0, 0, 6.283); c.fill(); c.beginPath(); c.ellipse(L * 0.42, -1, 4, 3, 0, 0, 6.283); c.fill();
    c.strokeStyle = ink; c.lineWidth = 2; c.beginPath(); c.moveTo(-L * 0.1, 14); c.quadraticCurveTo(L * 0.2, 22, L * 0.44, 12); c.stroke(); // jaw
    c.strokeStyle = hexA(shade, 0.9); c.beginPath(); for (let k = 0; k < 6; k++) { c.moveTo(L * (0.18 + k * 0.045), 8); c.lineTo(L * (0.18 + k * 0.045), 12); } c.stroke(); return; }
}
function donkeyBones(c, x, y, s, t, k, o = {}) { // k: assembly 0..1; o.glow: light while they move; o.dir
  const dir = o.dir || 1, a = o.alpha === undefined ? 1 : o.alpha; if (a <= 0) return;
  c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(s * dir, s);
  if (k < 0.98) { c.fillStyle = `rgba(10,6,4,${0.22 * (1 - k)})`; c.beginPath(); c.ellipse(20, 0, 170, 14, 0, 0, 6.283); c.fill(); }
  const moving = [];
  BONES26.forEach(b => { const q = ease(clamp((k - b.d) / 0.42)), lift = Math.sin(q * Math.PI) * 70 * (b.kind === 'hoof' ? 0.3 : 1);
    const cx = lerp(b.sx, b.cx, q), cy = lerp(b.sy, b.cy, q) - lift, ang = lerp(b.sa, b.ang, q);
    if (q > 0.02 && q < 0.98) moving.push([cx, cy]);
    c.save(); c.translate(cx, cy); c.rotate(ang); drawBone(c, b, 0); c.restore(); });
  const gk = (o.glow === undefined ? 1 : o.glow);
  if (gk > 0 && moving.length) { c.save(); c.globalCompositeOperation = 'lighter'; moving.forEach(([mx, my], i) => { if (i % 3 === 0) glow(c, mx, my, 40, '#fff2c8', 0.25 * gk); }); c.restore(); }
  c.restore();
}
// ---------- his provisions: a basket of figs and a jug of grape juice (narrations reported by Ibn Kathir)
function fig26(c, x, y, r, ang, split = false) {
  c.save(); c.translate(x, y); c.rotate(ang);
  const g = c.createRadialGradient(-r * 0.3, -r * 0.2, 0, 0, 0, r * 1.2); g.addColorStop(0, '#8a4a72'); g.addColorStop(0.6, '#5a2448'); g.addColorStop(1, '#2e1026');
  c.fillStyle = g; c.beginPath(); c.moveTo(0, -r * 1.25); c.bezierCurveTo(r * 0.5, -r * 1.0, r * 1.05, -r * 0.1, r * 0.9, r * 0.45); c.quadraticCurveTo(r * 0.5, r * 1.05, 0, r * 1.0); c.quadraticCurveTo(-r * 0.5, r * 1.05, -r * 0.9, r * 0.45);
  c.bezierCurveTo(-r * 1.05, -r * 0.1, -r * 0.5, -r * 1.0, 0, -r * 1.25); c.closePath(); c.fill();
  c.fillStyle = '#4a6a2a'; c.fillRect(-2, -r * 1.45, 4, r * 0.3);
  if (split) { c.fillStyle = '#d8506a'; c.beginPath(); c.ellipse(0, r * 0.25, r * 0.55, r * 0.6, 0, 0, 6.283); c.fill(); c.fillStyle = '#f2c8a8'; c.beginPath(); c.ellipse(0, r * 0.25, r * 0.6, r * 0.66, 0, 0, 6.283); c.lineWidth = 3; c.strokeStyle = '#f2d8c0'; c.stroke();
    c.fillStyle = '#f6e0b0'; const rr = rng(7); for (let i = 0; i < 14; i++) { c.beginPath(); c.arc((rr() - 0.5) * r * 0.8, r * 0.25 + (rr() - 0.5) * r * 0.9, 1.6, 0, 6.283); c.fill(); } }
  c.fillStyle = 'rgba(255,240,250,0.35)'; c.beginPath(); c.ellipse(-r * 0.35, -r * 0.25, r * 0.18, r * 0.4, 0.3, 0, 6.283); c.fill();
  c.restore();
}
function figBasket(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(4, 2, 78, 12, 0, 0, 6.283); c.fill();
  // fig leaves under the fruit
  [[-58, -62, -0.7], [56, -60, 0.6]].forEach(([lx, ly, la]) => { c.save(); c.translate(lx, ly); c.rotate(la); c.fillStyle = '#4a6a2e'; c.beginPath();
    c.moveTo(0, 0); c.quadraticCurveTo(-24, -10, -18, -36); c.quadraticCurveTo(-6, -30, 0, -50); c.quadraticCurveTo(6, -30, 18, -36); c.quadraticCurveTo(24, -10, 0, 0); c.fill();
    c.strokeStyle = '#2e4a1e'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -44); c.stroke(); c.restore(); });
  // fruit heaped above the rim
  const fr = [[-36, -70, 0.3], [0, -78, -0.1], [34, -70, -0.4], [-16, -94, 0.2], [18, -96, -0.3]]; fr.forEach(([fx, fy, fa], i) => fig26(c, fx, fy, 17, fa, false));
  fig26(c, 46, -50, 15, 0.9, true);
  // the woven basket
  const g = c.createLinearGradient(0, -70, 0, 0); g.addColorStop(0, '#c8995a'); g.addColorStop(1, '#7a5430');
  c.fillStyle = g; c.beginPath(); c.moveTo(-66, -62); c.lineTo(66, -62); c.lineTo(52, 0); c.lineTo(-52, 0); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(70,40,18,0.6)'; c.lineWidth = 2; for (let k = 1; k < 6; k++) { const yy = -62 + k * 11; c.beginPath(); c.moveTo(-66 + k * 2.4, yy); c.lineTo(66 - k * 2.4, yy); c.stroke(); }
  for (let k = -6; k <= 6; k++) { c.beginPath(); c.moveTo(k * 10.5, -62); c.lineTo(k * 8.4, 0); c.stroke(); }
  c.fillStyle = '#a87a44'; c.beginPath(); c.ellipse(0, -62, 68, 9, 0, 0, 6.283); c.fill(); c.strokeStyle = '#6a4424'; c.lineWidth = 3; c.stroke();
  if (o.dust) { c.fillStyle = `rgba(200,170,120,${0.5 * o.dust})`; c.fillRect(-70, -116, 140, 116); }
  c.restore();
  if (o.fresh) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y - 80 * s, 140 * s, '#fff0d0', 0.25 * o.fresh); c.restore(); sparkle(c, t, x, y - 80 * s, 10, 90 * s, 2632, o.fresh); }
}
function jug26(c, x, y, s, t, o = {}) { // a clay jug of grape juice with a cup
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(6, 2, 46, 8, 0, 0, 6.283); c.fill();
  const g = c.createLinearGradient(-36, 0, 36, 0); g.addColorStop(0, '#d08a5a'); g.addColorStop(0.5, '#a8603a'); g.addColorStop(1, '#5a2e1a');
  c.fillStyle = g; c.beginPath(); c.moveTo(-14, -120); c.lineTo(14, -120); c.quadraticCurveTo(12, -96, 30, -76); c.quadraticCurveTo(48, -40, 22, 0); c.lineTo(-22, 0); c.quadraticCurveTo(-48, -40, -30, -76); c.quadraticCurveTo(-12, -96, -14, -120); c.closePath(); c.fill();
  c.strokeStyle = '#5a2e1a'; c.lineWidth = 7; c.beginPath(); c.moveTo(16, -108); c.quadraticCurveTo(52, -104, 34, -64); c.stroke(); // handle
  c.fillStyle = '#c07a4a'; c.beginPath(); c.ellipse(0, -120, 16, 5, 0, 0, 6.283); c.fill(); c.fillStyle = '#4a1a2a'; c.beginPath(); c.ellipse(0, -120, 11, 3, 0, 0, 6.283); c.fill();
  c.strokeStyle = 'rgba(255,230,200,0.3)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-30, -50); c.lineTo(30, -50); c.moveTo(-26, -42); c.lineTo(26, -42); c.stroke();
  c.fillStyle = 'rgba(255,240,220,0.25)'; c.beginPath(); c.ellipse(-18, -60, 6, 22, 0.1, 0, 6.283); c.fill();
  // cup of dark juice beside it
  c.fillStyle = '#9a5a36'; c.beginPath(); c.moveTo(48, -30); c.lineTo(80, -30); c.lineTo(74, 0); c.lineTo(54, 0); c.closePath(); c.fill(); c.fillStyle = '#5a1630'; c.beginPath(); c.ellipse(64, -30, 16, 4, 0, 0, 6.283); c.fill();
  if (o.fresh) { c.fillStyle = `rgba(255,220,240,${0.6 * o.fresh})`; c.beginPath(); c.ellipse(60, -31, 6, 1.6, 0, 0, 6.283); c.fill(); }
  c.restore();
}

// ---------- sets
function deadTree(c, x, y, s, t, o = {}) { tree(c, x, y, s, t, { col: o.col || '#4a3a2e', leaf: o.leaf || 0, bloom: o.bloom || 0, seed: o.seed || 2641, depth: 5, leafCol: '#6a8a3a', lastLeaves: (o.leaf || 0) <= 0 ? 0.5 : 0, wind: o.wind || 1 }); }
function birds26(c, t, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha *= a; flock(c, t, 300 + t * 18, 560 - t * 3, 7, 0.85, 2642); c.restore(); }
// the hero image (hook / cta / outro / cover): golden hour on the slope facing Jerusalem; 'Uzayr seated, woken, beside the bones of his donkey,
// the basket of figs and the jug, under the old tree. o: z, cx, cy, pose, bones (assembly k), flesh, leaf, city, halo
function uzHero(c, T, o = {}) {
  cam(c, (o.z || 1) + 0.004 * Math.sin(T * 0.3), o.cx || 540, o.cy || 1200);
  judea(c, T, { sky: o.sky || 'gold', to: o.to, k: o.k, city: o.city || 0, lamp: o.lamp || 0, sunX: 880, sunY: 820, sunA: o.sunA === undefined ? 1 : o.sunA, cityX: 700, cityS: 0.4 });
  cloudBank(c, T, 360, 4, '#ffe6c8', 0.12, 2643, 6); birds26(c, T, o.birds === undefined ? 1 : o.birds);
  slope(c, T, { grass: 0.9, green: o.green || 0 });
  deadTree(c, 150, gY(150) + 4, 1.45, T, { leaf: o.leaf || 0, bloom: o.bloom || 0 });
  const hal = o.halo === undefined ? 0.5 : o.halo, ux = o.x || 360, h = o.h || 470;
  if (hal > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, ux + 20, gY(ux) - h * 0.55, h * 1.2, '#fff2d0', 0.26 * hal); c.restore(); }
  jug26(c, 600, gY(600) + 6, 0.8, T, { fresh: o.fresh || 0 }); figBasket(c, 520, gY(520) + 8, 0.85, T, { fresh: o.fresh || 0 });
  const bk = o.bones === undefined ? 0 : o.bones, fl = o.flesh || 0, dx = 800;
  if (fl < 1) donkeyBones(c, dx, gY(dx) + 4, 1.5, T, bk, { dir: -1, alpha: 1 - ease(fl) * 0.9 });
  if (fl > 0) { donkey(c, dx, gY(dx) + 4, 1.5, T, { dir: -1, alpha: ease(fl), earFlick: o.alive || 0, swish: o.alive || 0, halter: '#5a3a22', head: o.dHead || 0 });
    if (fl < 1) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, dx, gY(dx) - 170, 300, '#fff2cc', 0.5 * Math.sin(fl * Math.PI)); c.restore(); } }
  if (o.boneGlow) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, dx, gY(dx) - 40, 260, '#fff4d6', 0.3 * o.boneGlow); c.restore(); }
  const pose = o.pose || 'sit';
  fig(c, UZ, { x: ux, y: gY(ux), h, dir: o.dir || 1, pose, t: T, light: 1.05, wind: 0.4, reach: o.reach || 0, armUp: o.armUp || 0, dua: o.dua || false, veilGlow: o.veil || 0.4 });
  if (o.fg !== false) blurLayer(c, 9, bc => { bc.save(); fgBrush(bc, T, { col: '#6a5a30', stone: '#7a6450' }); bc.restore(); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// close ruins: a breach in the broken wall of the city, a fallen arch, roofless houses, column drums in the dust
function ruinNear(c, T, o = {}) {
  const px = o.px || 0, nt = o.night || 0, fy = 1440;
  sky0(c, skyStops(o.sky || 'gold', o.to, o.k)); const sx = 760, sy = 760;
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, sx, sy, 520, '#ffd8a0', 0.4 * (o.sunA === undefined ? 1 : o.sunA)); c.restore(); sun(c, sx, sy, 46, '#ffe2a8', o.sunA === undefined ? 1 : o.sunA);
  if (o.smoke) { for (let i = 0; i < 4; i++) smoke(c, T, 200 + i * 260, 1180, 6, 2650 + i, '#2a1e1e', 0.4 * o.smoke, 1.6, 50); }
  wisps(c, T, 500, 5, '#fff2dc', 0.1, 2651, 5);
  par(c, 0.1, px, 0, () => { ridgeW(c, 1180, 120, 0.0024, 2652, '#8a80a0'); hazeW(c, 1200, 200, '#f4cca0', 0.5); });
  par(c, 0.25, px, 0, () => { ruinTown(c, T, 560, 1290, 0.5, { seed: 2653 }); hazeW(c, 1330, 120, '#f4cca0', 0.4); });
  par(c, 0.55, px, 0, () => { // the street of shells
    [[-380, 230, 200], [-120, 260, 230], [880, 250, 220], [1150, 230, 190], [1400, 260, 210]].forEach(([x, w, h], i) => house(c, x, fy - 10, w, h, mix('#c6a882', '#6a4a3a', 0.1 + (i % 3) * 0.1), { ruin: 1, t: T + 100 }));
    deadTree(c, 300, fy, 0.9, T, { seed: 2654 });
    hazeW(c, fy, 70, '#f4cca0', 0.25); });
  par(c, 1, px, 0, () => {
    const g = c.createLinearGradient(0, fy - 20, 0, H + 200); g.addColorStop(0, '#c4a070'); g.addColorStop(0.4, '#9a7a50'); g.addColorStop(1, '#4a3420');
    c.fillStyle = g; c.fillRect(-1600, fy - 20, W + 3600, H); // dust and road
    c.fillStyle = 'rgba(240,215,170,0.35)'; c.beginPath(); c.moveTo(480, fy - 20); c.lineTo(600, fy - 20); c.lineTo(1100, H + 100); c.lineTo(-100, H + 100); c.closePath(); c.fill();
    const r = rng(2655); for (let i = 0; i < 90; i++) { const yy = fy + Math.pow(r(), 1.4) * (H - fy + 100), x = -800 + r() * 2800, sz = 3 + (yy - fy) / 30; c.fillStyle = hexA(r() > 0.5 ? '#4a3420' : '#f0d8b0', 0.5); c.beginPath(); c.ellipse(x, yy, sz, sz * 0.4, 0, 0, 6.283); c.fill(); }
    brokenWall(c, -700, 240, fy + 10, 900, 420, '#b8966a', 2656); rubble(c, 200, fy + 30, 380, 1.6, '#b8966a', 2657);
    brokenWall(c, 820, 1800, fy + 10, 380, 980, '#b09068', 2658); rubble(c, 860, fy + 34, 320, 1.5, '#b09068', 2659);
    stoneDrum(c, 260, fy + 170, 220, 90, '#cbb08a', '#b08a5a'); stoneDrum(c, 900, fy + 250, 180, 76, '#cbb08a', '#b08a5a');
  });
  if (o.figs) o.figs(c);
  blowingSand(c, T, 1500, 0.25, 2660);
  if (o.fg !== false) blurLayer(c, 10, bc => { bc.save(); bc.translate(-px * 1.4, 0); rubble(bc, -20, 2010, 520, 3, '#8a6a44', 2661); rubble(bc, 1140, 2030, 460, 2.6, '#8a6a44', 2662); bc.restore(); }, 3);
}
// 'Uzayr walking (lateral, distance-driven) leading his donkey on the road below the city
function approach(c, T, dist, o = {}) {
  const px = dist * (o.track === undefined ? 1 : o.track);
  c.save(); c.translate(-px * 0.0, 0);
  judea(c, T, { sky: o.sky || 'gold', city: 0, px, sunX: 900, sunY: 760, cityX: 900, cityS: 0.6, fy: 1250 });
  c.restore();
  c.save(); c.translate(-px, 0); slope(c, T, { grass: 0.8 });
  const ux = 380 + dist, h = o.h || 470; const ws = stepOf(dist, h);
  const dxp = ux - 300; donkey(c, dxp, gY(dxp), 1.25, T, { dir: 1, walk: donkeyStep(dist, 1.25), blanket: '#8a2a22', halter: '#5a3a22' });
  const uo = { x: ux, y: gY(ux), h, dir: 1, walk: dist > 0.01 || o.walking ? ws : null, t: T, light: 1, wind: 0.5 };
  // the lead rope from his far hand back to the halter
  const [hx, hy] = farHand(uo), [ax, ay] = halterOf(dxp, gY(dxp), 1.25, 1);
  c.strokeStyle = '#6a4a2a'; c.lineWidth = 3; c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo((ax + hx) / 2, Math.max(ay, hy) + 40, hx, hy); c.stroke();
  fig(c, UZ, uo);
  c.restore();
  if (o.fg !== false) blurLayer(c, 9, bc => { bc.save(); bc.translate(-px * 1.5 % 1400, 0); fgBrush(bc, T, { col: '#6a5a30', stone: '#7a6450' }); bc.translate(1400, 0); fgBrush(bc, T, { col: '#6a5a30', stone: '#7a6450' }); bc.restore(); }, 3);
}
// the time-lapse: days racing by (ph = number of days elapsed, fractional), the tree in and out of leaf, the donkey turning to bones,
// the far city rebuilt (o.city), sand drifting over the provisions
function lapse(c, T, ph, o = {}) {
  cam(c, o.z || 1, o.cx || 540, o.cy || 1200);
  const d = ph % 1, el = Math.sin((d - 0.25) * 6.283), day = clamp(el * 2.2 + 0.35), nt = 1 - day;
  const sunX = lerp(-80, 1160, clamp((d - 0.25) / 0.5)), sunY = 1050 - el * 820, mx = lerp(-80, 1160, clamp(((d + 0.5) % 1 - 0.25) / 0.5)), my = 1050 + el * 820;
  judea(c, T, { skyFn: cc => daySky(cc, d), city: o.city || 0, lamp: o.city > 0.5 ? 1 : 0, night: nt * 0.85, sunX, sunY, sunA: el > -0.05 ? 1 : 0, stars: nt, moon: el < 0.05 ? 0.9 : 0, moonX: mx, moonY: my, cityX: 700, cityS: 0.4, walkers: o.walkers });
  slope(c, T, { night: nt * 0.85, grass: 0.9, green: 0.5 + 0.5 * Math.sin(ph * 6.283 / 6) });
  const season = 0.5 + 0.5 * Math.sin(ph * 6.283 / 6); // a "year" every 6 days of the lapse
  deadTree(c, 150, gY(150) + 4, 1.45, T, { leaf: season, bloom: season > 0.8 ? 0.6 : 0 });
  figBasket(c, 520, gY(520) + 8, 0.85, T, { dust: o.dust || 0 }); jug26(c, 600, gY(600) + 6, 0.8, T);
  const bk = o.decay || 0; donkey(c, 800, gY(800) + 4, 1.5, T, { dir: -1, lie: 1, alpha: 1 - bk, shadow: true }); donkeyBones(c, 800, gY(800) + 4, 1.5, T, 0, { dir: -1, alpha: bk, glow: 0 });
  fig(c, UZ, { x: 380, y: gY(380), h: 470, pose: 'lie', dir: 1, t: T, light: 0.8 + 0.3 * day });
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 300, gY(300) - 40, 240, '#fff4dc', 0.12 + 0.08 * nt); c.restore(); // a soft light keeps him
  c.fillStyle = `rgba(6,10,30,${0.45 * nt})`; c.fillRect(-500, -500, W + 1000, H + 1000);
  if (o.fg !== false) blurLayer(c, 9, bc => { bc.save(); fgBrush(bc, T, { col: '#6a5a30', stone: '#7a6450' }); bc.restore(); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// Jerusalem burning (the destruction by Nebuchadnezzar, before the story): reddened sky, smoke, the army on the ridge in silhouette, no violence shown
function fallSet(c, T, o = {}) {
  cam(c, o.z || 1, o.cx || 540, o.cy || 1150);
  judea(c, T, { sky: 'ash', city: 0, sunA: 0.6, sunX: 300, sunY: 820, sunCol: '#ff8a40', cityX: 600, cityS: 0.75, fy: 1300, haze: '#c87a50', far: '#5a3a3a', mid: '#5a4038', near: '#4a3428', groves: false,
    cityFx: (cc, x, y) => { cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, x, y - 80, 520, '#ff7030', 0.35); cc.restore(); for (let i = 0; i < 5; i++) smoke(cc, T, x - 300 + i * 150, y - 120, 6, 2670 + i, '#1e1414', 0.55, 1.4, 70); } });
  spearLine(c, T, -200, 1300, 1395, 46, 60, '#1a1210', 2671);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
function yearCount(c, n, a, y = 300, t = 0) { if (a <= 0) return; topShade(c, a * 1.4);
  const v = Math.max(1, Math.round(n)); textS(c, String(v), y, a, '700 190px Lora', 190, '#f6c453', 28); bigWord(c, v > 1 ? 'ANS' : 'AN', y + 130, a, 64);
  c.save(); c.globalAlpha = a; c.strokeStyle = 'rgba(246,196,83,0.35)'; c.lineWidth = 8; c.beginPath(); c.arc(W / 2, y + 30, 210, 0, 6.283); c.stroke();
  c.strokeStyle = '#f6c453'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.arc(W / 2, y + 30, 210, -Math.PI / 2, -Math.PI / 2 + 6.283 * clamp(n / 100)); c.stroke(); c.restore(); }
function sunIcon(c, x, y, a, low = 0) { if (a <= 0) return; c.save(); c.globalAlpha = a; sun(c, x, y, 34, low ? '#ff9a50' : '#ffe2a8', 1); c.restore(); }

// waves() from episode 3 (Yunus)
function waves(c, t, y, amp, color, freq, speed, seed, light) {
  c.fillStyle = color; c.beginPath(); c.moveTo(-200, H + 200);
  for (let x = -200; x <= W + 200; x += 10) c.lineTo(x, y - amp * (Math.sin(x * freq + t * speed + seed) + 0.45 * Math.sin(x * freq * 2.3 - t * speed * 1.4 + seed * 2)));
  c.lineTo(W + 200, H + 200); c.closePath(); c.fill();
  if (light) {
    c.strokeStyle = light; c.lineWidth = 4; c.beginPath();
    for (let x = -200; x <= W + 200; x += 10) { const yy = y - amp * (Math.sin(x * freq + t * speed + seed) + 0.45 * Math.sin(x * freq * 2.3 - t * speed * 1.4 + seed * 2)); x === -200 ? c.moveTo(x, yy) : c.lineTo(x, yy); }
    c.stroke();
  }
}

// =====================================================================================================================
// ---------- episode 27: Al-Khidr (Al-Kahf 60-82)
const MUSA = { veilGlow: 0.42, prophet: true, robe: '#ebe5d6', wrap: '#f7f3ea', skin: '#c49470', trim: '#cfae6a', band: '#b8954a', inner: '#fbf8f0' };
const KHIDR = { veilGlow: 0.42, prophet: true, robe: '#e4ebdc', wrap: '#f4f6ee', skin: '#b88a66', trim: '#5f8f4a', band: '#4a7a3a', inner: '#fbfbf4' };
const YUSHA = { veilGlow: 0.36, prophet: true, robe: '#e2dccb', wrap: '#efe9dc', skin: '#c49470', trim: '#a89a7a', band: '#8a7a5a', inner: '#f6f2ea' };
const SAILOR = [{ robe: '#5a3a26', wrap: '#d6c29c', skin: '#8f5f42', trim: '#3a2a1a' }, { robe: '#2e4a5a', wrap: '#e2d6be', skin: '#9a6a4c', trim: '#c9a35a' }];
function seriesTag27(c, a) { seriesTag(c, a, 27); }
const SEAY = 1010; // sea horizon (world)
const SKY27 = Object.assign({}, SKY26, { sea: [[0, '#3a6a9c'], [0.3, '#9cc0d8'], [0.5, '#f4e4c4']] });
function sky27(c, a, b, k) { let st = SKY27[a]; if (b) st = st.map((s, i) => [s[0], mix(s[1], SKY27[b][i][1], clamp(k))]); sky0(c, st); }
const SEA_TOP = { gold: '#7a8ca0', day: '#4f87a8', dusk: '#6a5a74', sea: '#4f87a8', night: '#1a2440', dawn: '#7a809c' };

// ---------- the open sea: sky, sun, far coast, perspective swell, glitter, far sails
function seaSet27(c, T, o = {}) {
  const sk = o.sky || 'gold', nt = o.night || 0, sx = o.sunX === undefined ? 820 : o.sunX, sy = o.sunY === undefined ? SEAY - 170 : o.sunY;
  sky27(c, sk, o.to, o.k);
  if (o.sunA !== 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, sx, sy, 520, '#ffd8a0', 0.35 * (o.sunA || 1)); c.restore(); sun(c, sx, sy, 46, '#ffe2a8', o.sunA || 1); }
  cloudBank(c, T, 300, 5, mix('#ffe6c8', '#2a2a44', nt), 0.13, 2701, 5); wisps(c, T, SEAY - 560, 6, '#fff2dc', 0.12, 2702, 6);
  const px = o.px || 0;
  par(c, 0.06, px, 0, () => { // far coast on the left, a headland on the right
    c.fillStyle = mix('#8a84a0', '#202438', nt); c.beginPath(); c.moveTo(-1400, SEAY + 4);
    for (let x = -1400; x <= 300; x += 14) c.lineTo(x, SEAY - 6 - Math.max(0, (300 - x) / 1700) * 120 * (0.7 + 0.3 * noise1(x * 0.006, 2703)));
    c.lineTo(300, SEAY + 4); c.closePath(); c.fill();
    c.fillStyle = mix('#9a90a8', '#262a3e', nt); c.beginPath(); c.moveTo(860, SEAY + 4);
    for (let x = 860; x <= 2200; x += 14) c.lineTo(x, SEAY - 4 - Math.min(1, (x - 860) / 500) * 60 * (0.6 + 0.4 * noise1(x * 0.008, 2704)));
    c.lineTo(2200, SEAY + 4); c.closePath(); c.fill();
    haze(c, SEAY + 4, 120, mix('#f6d6b0', '#303450', nt), 0.6);
  });
  const top = mix(SEA_TOP[sk] || '#7a8ca0', SEA_TOP[o.to] || SEA_TOP[sk] || '#7a8ca0', o.k || 0), bot = mix('#14324a', '#060a18', nt);
  const g = c.createLinearGradient(0, SEAY, 0, H + 200); g.addColorStop(0, mix(top, '#ffffff', 0.12)); g.addColorStop(0.18, top); g.addColorStop(1, bot);
  c.fillStyle = g; c.fillRect(-1600, SEAY, W + 3200, H + 900 - SEAY);
  for (let j = 0; j < 44; j++) { // swell lines: thin and dense at the horizon, broad toward the viewer
    const u = j / 44, y = SEAY + Math.pow(u, 1.9) * (H + 300 - SEAY), amp = 1 + u * 12, a = 0.05 + 0.16 * u;
    c.strokeStyle = j % 2 ? `rgba(225,240,250,${a * (1 - nt * 0.6)})` : `rgba(0,18,32,${a * 1.3})`; c.lineWidth = 1 + u * 4;
    c.beginPath(); for (let x = -1600; x <= W + 1600; x += 24) { const v = y + Math.sin(x * (0.02 - u * 0.016) + T * 1.4 + j * 2.1) * amp; x === -1600 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke();
  }
  if (o.glit !== 0) { c.save(); c.globalCompositeOperation = 'lighter'; const r = rng(2705);
    for (let i = 0; i < 140; i++) { const u = Math.pow(r(), 0.8), y = SEAY + 3 + Math.pow(u, 1.9) * (H + 200 - SEAY), w = 8 + 150 * u * r(), x = sx + (r() - 0.5) * (40 + 620 * u);
      c.fillStyle = `rgba(255,236,196,${(o.glit || 0.55) * (0.25 + 0.75 * Math.sin(T * 2.2 + i * 1.7) ** 2) * (1 - nt * 0.5)})`; c.fillRect(x - w / 2, y, w, 1.5 + 3 * u); }
    c.restore(); }
  if (o.sails !== false) { // two far boats on the horizon, drifting
    [[200 + T * 6, 0.16, 2706], [980 - T * 4, 0.12, 2707]].forEach(([x, s]) => { c.fillStyle = mix('#3a3040', '#0a0c18', nt); c.beginPath(); c.moveTo(x - 60 * s * 4, SEAY - 2); c.lineTo(x + 60 * s * 4, SEAY - 2); c.lineTo(x + 40 * s * 4, SEAY + 6); c.lineTo(x - 50 * s * 4, SEAY + 6); c.fill();
      c.fillStyle = mix('#f4e6c8', '#4a4a60', nt); c.beginPath(); c.moveTo(x - 40 * s * 4, SEAY - 6); c.lineTo(x + 30 * s * 4, SEAY - 120 * s * 4 * 0.5); c.lineTo(x + 28 * s * 4, SEAY - 6); c.closePath(); c.fill(); });
  }
  if (o.birds !== false) flock(c, T, 260 + T * 22, 520 + Math.sin(T * 0.4) * 10, 5, 0.7, 2708, { col: '#2a2430' });
}
// water in front of a hull: hides the keel, foam along the waterline, ripples, a soft reflection
function seaFront27(c, T, wl, x0, x1, o = {}) {
  const sk = o.sky || 'gold', top = mix(SEA_TOP[sk] || '#7a8ca0', SEA_TOP[o.to] || SEA_TOP[sk] || '#7a8ca0', o.k || 0), bot = mix('#14324a', '#060a18', o.night || 0);
  const g = c.createLinearGradient(0, SEAY, 0, H + 200); g.addColorStop(0, mix(top, '#ffffff', 0.12)); g.addColorStop(0.18, top); g.addColorStop(1, bot);
  const wy = x => wl + Math.sin(x * 0.021 + T * 2.1) * 4 + Math.sin(x * 0.006 - T * 0.9) * 6;
  c.fillStyle = g; c.beginPath(); c.moveTo(-1600, H + 900); for (let x = -1600; x <= W + 1600; x += 12) c.lineTo(x, wy(x)); c.lineTo(W + 1600, H + 900); c.closePath(); c.fill();
  c.fillStyle = 'rgba(40,22,12,0.22)'; c.beginPath(); c.ellipse((x0 + x1) / 2, wl + 40, (x1 - x0) * 0.5, 40, 0, 0, 6.283); c.fill(); // reflection of the hull
  c.strokeStyle = 'rgba(245,250,255,0.75)'; c.lineCap = 'round';
  for (let x = x0 - 20; x < x1 + 30; x += 22) { c.lineWidth = 2 + 3 * Math.abs(Math.sin(T * 2.4 + x * 0.05)); c.beginPath(); c.moveTo(x, wy(x) + 1); c.lineTo(x + 16, wy(x + 16) + 1); c.stroke(); }
  for (let j = 0; j < 6; j++) { const yy = wl + 40 + j * j * 14 + j * 30, a = 0.18 - j * 0.02; c.strokeStyle = `rgba(230,245,255,${a})`; c.lineWidth = 2 + j;
    c.beginPath(); for (let x = x0 - 200 - j * 60; x <= x1 + 200 + j * 60; x += 20) { const v = yy + Math.sin(x * 0.012 + T * 1.6 + j) * (4 + j * 2); x === x0 - 200 - j * 60 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); }
  if (o.sunX !== undefined) { c.save(); c.globalCompositeOperation = 'lighter'; const r = rng(2709);
    for (let i = 0; i < 50; i++) { const y = wl + 20 + r() * (H - wl), w = 20 + r() * 140, x = o.sunX + (r() - 0.5) * 700; c.fillStyle = `rgba(255,236,196,${0.4 * (0.25 + 0.75 * Math.sin(T * 2.2 + i * 1.3) ** 2)})`; c.fillRect(x - w / 2, y, w, 3 + r() * 3); }
    c.restore(); }
}
// ---------- the boat (a wooden sailing boat of the poor: lapped planks, ribs, a lateen sail). (x, y) = waterline, centre.
// o.hole 0..1 = the plank pulled out, o.patch = patched (lesson), o.crew(c, deckY) draws the people standing on the deck
const gun27 = x => -150 - 45 * Math.pow(x / 470, 2) - 0.03 * x;
const bot27 = x => lerp(60, gun27(x), Math.pow(clamp(Math.abs(x) / 486), 5));
const deck27 = x => gun27(x) + 55;
const HOLE27 = 205;
function boat27(c, x, y, s, T, o = {}) {
  const bob = o.still ? 0 : Math.sin(T * 1.3) * 5, rot = o.still ? 0 : Math.sin(T * 0.9 + 0.6) * 0.012 + (o.rot || 0), nt = o.night || 0;
  c.save(); c.translate(x, y + bob); c.rotate(rot); c.scale(s, s);
  const wood = mix(o.wood || '#7a4a2a', '#1a1420', nt * 0.7), dk = mix(wood, '#120a06', 0.5), lt = mix(wood, '#ffe0b0', 0.3);
  // steering oar at the stern
  c.strokeStyle = mix('#5a3a22', '#1a1420', nt * 0.7); c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(-430, -260); c.lineTo(-540, 70); c.stroke();
  c.fillStyle = mix('#5a3a22', '#1a1420', nt * 0.7); c.beginPath(); c.ellipse(-530, 50, 16, 46, 0.32, 0, 6.283); c.fill();
  // far bulwark (inside of the hull seen from a little above)
  c.fillStyle = mix(dk, '#000000', 0.2); c.beginPath(); c.moveTo(-470, gun27(-470));
  for (let xx = -470; xx <= 490; xx += 10) c.lineTo(xx, gun27(xx) - 30 + Math.pow(Math.abs(xx) / 480, 4) * 26); for (let xx = 490; xx >= -470; xx -= 10) c.lineTo(xx, gun27(xx)); c.closePath(); c.fill();
  c.strokeStyle = hexA(lt, 0.35); c.lineWidth = 3; c.beginPath(); for (let xx = -460; xx <= 480; xx += 10) { const v = gun27(xx) - 30 + Math.pow(Math.abs(xx) / 480, 4) * 26; xx === -460 ? c.moveTo(xx, v) : c.lineTo(xx, v); } c.stroke();
  c.strokeStyle = hexA(dk, 0.8); c.lineWidth = 6; for (let xx = -400; xx <= 420; xx += 70) { c.beginPath(); c.moveTo(xx, gun27(xx) - 26); c.lineTo(xx, gun27(xx)); c.stroke(); } // ribs
  // mast, yard and lateen sail
  const sail = mix('#efe3c6', '#4a4a5e', nt * 0.75), sailD = mix('#c4ae86', '#2a2a3a', nt * 0.75), bill = Math.sin(T * 1.1) * 10;
  c.fillStyle = mix('#4a2e1a', '#141018', nt * 0.7); c.fillRect(-42, -720, 18, deck27(-30) + 720);
  if (o.sail !== 0) {
    const A = [-360, -300], B = [300, -800], C = [250, -250];
    const gs = c.createLinearGradient(-300, -700, 260, -260); gs.addColorStop(0, mix(sail, '#ffffff', 0.15)); gs.addColorStop(0.6, sail); gs.addColorStop(1, sailD);
    c.fillStyle = gs; c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.quadraticCurveTo(330 + bill, -520, C[0], C[1]); c.quadraticCurveTo(-40, -230 + bill * 0.5, A[0], A[1]); c.closePath(); c.fill();
    c.strokeStyle = hexA(sailD, 0.55); c.lineWidth = 2.5; for (let k = 1; k < 7; k++) { const q = k / 7; c.beginPath(); c.moveTo(lerp(A[0], B[0], q), lerp(A[1], B[1], q)); c.quadraticCurveTo(lerp(-40, 330, q) + bill * 0.5, lerp(-240, -520, q), lerp(A[0], C[0], 0.15) + q * (C[0] - A[0]) * 0.85, lerp(-280, -250, q)); c.stroke(); }
    c.strokeStyle = mix('#3a2414', '#141018', nt * 0.7); c.lineWidth = 9; c.beginPath(); c.moveTo(A[0] - 20, A[1] + 14); c.lineTo(B[0] + 14, B[1] - 14); c.stroke(); // the yard
    c.strokeStyle = 'rgba(40,24,12,0.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-33, -720); c.lineTo(-460, gun27(-460)); c.moveTo(-33, -720); c.lineTo(480, gun27(480) - 40); c.moveTo(C[0], C[1]); c.lineTo(400, gun27(400)); c.stroke();
  }
  // cargo of a poor crew: two jars and a coil of rope behind the near bulwark
  jar(c, 330, gun27(330) + 30, 0.9, mix('#a8643a', '#1a1420', nt * 0.6)); jar(c, 285, gun27(285) + 34, 0.75, mix('#94563a', '#1a1420', nt * 0.6));
  c.strokeStyle = mix('#a08050', '#2a2430', nt * 0.6); c.lineWidth = 6; for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(-340, gun27(-340) + 6 - k * 6, 40 - k * 6, 10, 0, Math.PI, 0); c.stroke(); }
  if (o.crew) o.crew(c, deck27);
  // near hull: planks (strakes) following the sheer, seams, nails, butt joints, the gunwale
  const hull = () => { c.beginPath(); c.moveTo(-470, gun27(-470)); for (let xx = -470; xx <= 490; xx += 10) c.lineTo(xx, gun27(xx)); for (let xx = 490; xx >= -470; xx -= 10) c.lineTo(xx, bot27(xx)); c.closePath(); };
  const gh = c.createLinearGradient(0, -220, 0, 60); gh.addColorStop(0, lt); gh.addColorStop(0.35, wood); gh.addColorStop(1, dk);
  hull(); c.fillStyle = gh; c.fill();
  c.save(); hull(); c.clip();
  const sy = (xx, k) => lerp(gun27(xx), bot27(xx), k / 7), r = rng(2710);
  for (let k = 1; k < 7; k++) { // each strake: a lit upper edge, a shadowed seam
    c.strokeStyle = hexA(dk, 0.75); c.lineWidth = 3.5; c.beginPath(); for (let xx = -480; xx <= 500; xx += 10) xx === -480 ? c.moveTo(xx, sy(xx, k)) : c.lineTo(xx, sy(xx, k)); c.stroke();
    c.strokeStyle = hexA(lt, 0.28); c.lineWidth = 2; c.beginPath(); for (let xx = -480; xx <= 500; xx += 10) xx === -480 ? c.moveTo(xx, sy(xx, k) + 3) : c.lineTo(xx, sy(xx, k) + 3); c.stroke();
    for (let j = 0; j < 3; j++) { const bx = -380 + r() * 760; c.strokeStyle = hexA(dk, 0.6); c.lineWidth = 2.5; c.beginPath(); c.moveTo(bx, sy(bx, k - 1)); c.lineTo(bx + 4, sy(bx, k)); c.stroke(); }
    c.fillStyle = hexA('#1a100a', 0.55); for (let xx = -440; xx <= 460; xx += 70) { c.beginPath(); c.arc(xx + (k % 2) * 35, (sy(xx, k - 1) + sy(xx, k)) / 2, 2.4, 0, 6.283); c.fill(); }
  }
  for (let i = 0; i < 60; i++) { const xx = -460 + r() * 940, k = Math.floor(r() * 6), yy = lerp(sy(xx, k), sy(xx, k + 1), 0.3 + r() * 0.4); c.strokeStyle = hexA(r() > 0.5 ? dk : lt, 0.18); c.lineWidth = 1.5; c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx + 30 + r() * 60, yy + (r() - 0.5) * 2); c.stroke(); } // grain
  // the missing plank (strake 2), or its patch
  const h0 = HOLE27 - 70, h1 = HOLE27 + 70;
  if (o.hole > 0) { c.save(); c.globalAlpha *= o.hole; const jr = rng(2732), top = [], bt = [];
    for (let xx = h0; xx <= h1; xx += 10) { top.push([xx, sy(xx, 1) + 2 + (jr() - 0.5) * 3]); bt.push([xx, sy(xx, 2) - 1 + (jr() - 0.5) * 3]); }
    c.fillStyle = '#0c0705'; c.beginPath(); c.moveTo(h0 - 6, sy(h0, 1.5)); top.forEach(p => c.lineTo(p[0], p[1])); c.lineTo(h1 + 4, sy(h1, 1.3)); c.lineTo(h1 - 6, sy(h1, 1.6)); c.lineTo(h1 + 8, sy(h1, 1.85));
    bt.reverse().forEach(p => c.lineTo(p[0], p[1])); c.lineTo(h0 + 6, sy(h0, 1.75)); c.closePath(); c.fill(); // jagged, splintered ends
    c.strokeStyle = 'rgba(150,100,64,0.55)'; c.lineWidth = 6; c.beginPath(); c.moveTo(h0 + 60, sy(h0 + 60, 1) + 5); c.lineTo(h0 + 60, sy(h0 + 60, 2) - 4); c.stroke(); // a rib seen through the gap
    c.strokeStyle = 'rgba(255,214,160,0.6)'; c.lineWidth = 2; c.beginPath(); top.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); // raw wood on the edges
    c.restore(); }
  if (o.patch > 0) { c.save(); c.globalAlpha *= o.patch; c.fillStyle = mix('#a07048', '#1a1420', nt * 0.6); c.beginPath(); c.moveTo(h0 - 10, sy(h0 - 10, 1) - 3); for (let xx = h0 - 10; xx <= h1 + 10; xx += 10) c.lineTo(xx, sy(xx, 1) - 3); for (let xx = h1 + 10; xx >= h0 - 10; xx -= 10) c.lineTo(xx, sy(xx, 2) + 3); c.closePath(); c.fill();
    c.fillStyle = '#2a1a10'; for (let xx = h0; xx <= h1; xx += 28) { c.beginPath(); c.arc(xx, sy(xx, 1) + 4, 3, 0, 6.283); c.arc(xx, sy(xx, 2) - 4, 3, 0, 6.283); c.fill(); }
    if (o.patchGlow) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, HOLE27, sy(HOLE27, 1.5), 180, '#ffd890', 0.45 * o.patchGlow); c.restore(); }
    c.restore(); }
  c.fillStyle = mix('#200c08', '#0a0810', nt); c.globalAlpha = 0.25 + 0.2 * nt; c.fillRect(-500, -260, 1000, 400); c.globalAlpha = 1; // a touch of shade so the sail and people read first
  c.restore();
  // gunwale (rubbing strake), stem and stern posts
  c.strokeStyle = mix('#5a341c', '#141018', nt * 0.7); c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); for (let xx = -470; xx <= 490; xx += 10) xx === -470 ? c.moveTo(xx, gun27(xx)) : c.lineTo(xx, gun27(xx)); c.stroke();
  c.strokeStyle = hexA(lt, 0.6 * (1 - nt * 0.6)); c.lineWidth = 4; c.beginPath(); for (let xx = -470; xx <= 490; xx += 10) xx === -470 ? c.moveTo(xx, gun27(xx) - 6) : c.lineTo(xx, gun27(xx) - 6); c.stroke();
  c.strokeStyle = mix('#5a341c', '#141018', nt * 0.7); c.lineWidth = 18; c.beginPath(); c.moveTo(490, gun27(490)); c.quadraticCurveTo(540, gun27(490) - 30, 556, gun27(490) - 92); c.stroke(); // raked stem
  c.beginPath(); c.moveTo(-470, gun27(-470)); c.lineTo(-488, gun27(-470) - 46); c.stroke();
  if (o.sparrow) { // the little bird on the bow, dipping its beak in the sea (Bukhari 4725)
    const bx = 548, by = gun27(490) - 96, dip = o.sparrow;
    c.save(); c.translate(bx, by); c.fillStyle = mix('#6a4a32', '#141018', nt * 0.7); c.beginPath(); c.ellipse(0, -12, 15, 10, -0.2 - dip * 0.5, 0, 6.283); c.fill();
    c.beginPath(); c.arc(12 + dip * 4, -22 + dip * 10, 7, 0, 6.283); c.fill(); c.fillStyle = '#d8a040'; c.beginPath(); c.moveTo(18 + dip * 5, -22 + dip * 12); c.lineTo(28 + dip * 6, -18 + dip * 18); c.lineTo(17 + dip * 4, -18 + dip * 12); c.fill();
    c.strokeStyle = '#3a2414'; c.lineWidth = 2; c.beginPath(); c.moveTo(-4, -4); c.lineTo(-4, 4); c.moveTo(4, -4); c.lineTo(4, 4); c.stroke(); c.restore();
  }
  c.restore();
}
// a loose plank in a hand
function plank27(c, x, y, ang, s = 1, nt = 0) { c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
  const g = c.createLinearGradient(0, -12, 0, 12); g.addColorStop(0, mix('#c08a5a', '#2a2430', nt * 0.6)); g.addColorStop(1, mix('#6a3e20', '#141018', nt * 0.6)); c.fillStyle = g; c.fillRect(-80, -11, 160, 22);
  c.strokeStyle = 'rgba(40,20,10,0.5)'; c.lineWidth = 1.5; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-76, -6 + k * 4); c.lineTo(76, -5 + k * 4); c.stroke(); }
  c.fillStyle = '#2a1a10'; [-64, -20, 30, 66].forEach(xx => { c.beginPath(); c.arc(xx, 0, 2.5, 0, 6.283); c.fill(); }); c.restore(); }
function drips27(c, T, x0, x1, y0, y1, a = 1) { if (a <= 0) return; T += 100; c.fillStyle = `rgba(200,230,245,${0.8 * a})`;
  for (let i = 0; i < 7; i++) { const q = ((T * 1.3 + i * 0.37) % 1), x = lerp(x0, x1, (i + 0.5) / 7) + Math.sin(i * 7) * 6, y = lerp(y0, y1, q * q); c.beginPath(); c.ellipse(x, y, 3, 5, 0, 0, 6.283); c.fill(); } }

// The hero image (hook, promise, boat, cta, outro, cover): golden hour at sea, the boat of the poor sailors; Al-Khidr holds the plank he has just
// pulled out, the gap in the hull below him; Musa raises his hand; Yusha' and the sailors. o: z, cx, cy, hole, plank, musaUp, kReach, sky
function khHero(c, T, o = {}) {
  cam(c, (o.z || 1) + 0.004 * Math.sin(T * 0.3), o.cx || 540, o.cy || 1200);
  const sk = o.sky || 'gold';
  seaSet27(c, T, { sky: sk, to: o.to, k: o.k, sunX: 860, sunY: SEAY - 170, night: o.night || 0 });
  const BX = 540, WL = 1440, S = 0.95, hole = o.hole === undefined ? 1 : o.hole, pl = o.plank === undefined ? hole : o.plank;
  boat27(c, BX, WL, S, T, { hole, patch: o.patch || 0, patchGlow: o.patchGlow || 0, sparrow: o.sparrow || 0, night: o.night || 0,
    crew: (cc, dy) => {
      fig(cc, SAILOR[0], { x: -400, y: dy(-400), h: 300, dir: 1, t: T, light: 0.85, wind: 0.6, reach: 0.35, ink: 0.8 });
      fig(cc, YUSHA, { x: -255, y: dy(-255), h: 290, dir: 1, t: T + 1, light: 0.95, wind: 0.6, veilGlow: 0.3 });
      fig(cc, MUSA, { x: -110, y: dy(-110), h: 335, dir: 1, t: T + 2, light: 1.05, wind: 0.7, armUp: o.musaUp || 0, reach: o.musaReach || 0, staff: !(o.musaUp || o.musaReach), veilGlow: 0.34 });
      const kh = { x: 175, y: dy(175), h: 330, dir: -1, t: T + 3, light: 1.05, wind: 0.7, armUp: o.kUp === undefined ? 0.42 * pl : o.kUp, reach: o.kReach || 0, veilGlow: 0.34 };
      fig(cc, KHIDR, kh);
      if (pl > 0 && !o.kReach) { const [hx, hy] = handOf(kh); cc.save(); cc.globalAlpha *= pl; plank27(cc, hx - 30, hy + 20, -0.55, 0.95); cc.restore(); }
      fig(cc, SAILOR[1], { x: 395, y: dy(395), h: 300, dir: -1, t: T + 4, light: 0.85, wind: 0.6, armUp: o.sailorUp || 0, ink: 0.8 });
    } });
  seaFront27(c, T, WL + 10, BX - 470 * S, BX + 500 * S, { sky: sk, to: o.to, k: o.k, sunX: 860, night: o.night || 0 });
  if (hole > 0 && o.drip !== false) drips27(c, T, BX + (HOLE27 - 50) * S, BX + (HOLE27 + 50) * S, WL + gun27(HOLE27) * S + 60, WL + 10, hole * 0.8);
  if (o.fg !== false) blurLayer(c, 10, bc => { bc.save(); waves(bc, T, H + 60, 26, 'rgba(20,50,70,0.85)', 0.006, 1.2, 2711, 'rgba(220,240,255,0.25)'); bc.restore(); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- the meeting place of the two seas (Al-Kahf 60): two waters of different colour meeting along a seam, a great rock, a sand spit
const sandY27 = x => 1520 + Math.sin(x * 0.004 + 0.7) * 26 - (x - 540) * 0.03;
function twoSeas(c, T, o = {}) {
  const sk = o.sky || 'gold', nt = o.night || 0, sx = o.sunX === undefined ? 300 : o.sunX;
  seaSet27(c, T, { sky: sk, to: o.to, k: o.k, sunX: sx, sunY: o.sunY || SEAY - 200, night: nt, sails: false, birds: o.birds, px: o.px, glit: 0.35 });
  // the second sea, greener, meeting the first along a wandering seam that runs to the horizon
  const seam = y => 600 + Math.sin(y * 0.01 + T * 0.4) * 20 * ((y - SEAY) / 900) + (y - SEAY) * 0.55;
  c.save(); c.beginPath(); c.moveTo(seam(SEAY), SEAY); for (let y = SEAY; y <= H + 300; y += 16) c.lineTo(seam(y), y); c.lineTo(W + 1600, H + 300); c.lineTo(W + 1600, SEAY); c.closePath(); c.clip();
  const g = c.createLinearGradient(0, SEAY, 0, H); g.addColorStop(0, mix('#7aa898', '#1a2a30', nt)); g.addColorStop(0.3, mix('#3e8a7a', '#0e1a20', nt)); g.addColorStop(1, mix('#12403a', '#050a10', nt));
  c.globalAlpha = 0.7; c.fillStyle = g; c.fillRect(-1600, SEAY, W + 3200, H + 400); c.restore();
  c.strokeStyle = `rgba(240,250,250,${0.55 * (1 - nt * 0.5)})`; c.lineCap = 'round';
  for (let y = SEAY + 4; y < H + 200; y += 14) { const q = (y - SEAY) / 900; c.lineWidth = 1 + q * 5; c.beginPath(); c.moveTo(seam(y), y); c.lineTo(seam(y + 10) + Math.sin(T * 2 + y) * 3 * q, y + 10); c.stroke(); }
}
function shore27(c, T, o = {}) { // the sand spit, the great rock (left), pebbles, sea grass; everything sits on sandY27
  const nt = o.night || 0, col = mix(o.sand || '#d6b486', '#2a2836', nt * 0.8);
  const g = c.createLinearGradient(0, 1480, 0, H + 200); g.addColorStop(0, mix(col, '#3a3020', 0.3)); g.addColorStop(0.05, mix(col, '#fff0d8', 0.12)); g.addColorStop(1, mix(col, '#1a1008', 0.5));
  c.fillStyle = g; c.beginPath(); c.moveTo(-1600, H + 900); for (let x = -1600; x <= 2700; x += 14) c.lineTo(x, sandY27(x)); c.lineTo(2700, H + 900); c.closePath(); c.fill();
  const sw = Math.sin(T * 0.9) * 8; c.strokeStyle = `rgba(245,250,255,${0.65 * (1 - nt * 0.5)})`; c.lineWidth = 4; // foam that comes and goes
  c.beginPath(); for (let x = -1600; x <= 2700; x += 16) { const v = sandY27(x) - 4 + sw + Math.sin(x * 0.03 + T * 2) * 3; x === -1600 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke();
  c.fillStyle = `rgba(60,50,40,${0.12})`; c.beginPath(); for (let x = -1600; x <= 2700; x += 16) c.lineTo(x, sandY27(x) + 2); for (let x = 2700; x >= -1600; x -= 16) c.lineTo(x, sandY27(x) + 34 + sw); c.closePath(); c.fill(); // wet strip
  const r = rng(o.seed || 2712);
  for (let i = 0; i < 120; i++) { const x = -1400 + r() * 3800, q = Math.pow(r(), 1.5), yy = sandY27(x) + 30 + q * (H + 260 - sandY27(x)), sz = 3 + q * 18;
    c.fillStyle = hexA(mix(col, r() > 0.5 ? '#000000' : '#fff4dc', 0.3), 0.6); c.beginPath(); c.ellipse(x, yy, sz, sz * 0.45, 0, 0, 6.283); c.fill(); }
  for (let i = 0; i < 26; i++) { const x = -1200 + r() * 3400, q = Math.pow(r(), 1.3), yy = sandY27(x) + 40 + q * (H + 200 - sandY27(x)), sz = 4 + q * 14; // shells and seaweed
    if (r() > 0.5) { c.fillStyle = `rgba(250,240,225,${0.75 * (1 - nt * 0.7)})`; c.beginPath(); c.ellipse(x, yy, sz, sz * 0.7, r() * 3, 0, Math.PI); c.fill(); c.strokeStyle = 'rgba(160,130,100,0.6)'; c.lineWidth = 1; c.stroke(); }
    else { c.strokeStyle = hexA(mix('#4a5a2a', '#141820', nt * 0.8), 0.75); c.lineWidth = 2 + q * 3; c.beginPath(); c.moveTo(x - sz * 3, yy); c.quadraticCurveTo(x, yy - sz, x + sz * 3, yy + sz * 0.4); c.stroke(); } }
  for (let i = 0; i < 8; i++) { const x = 820 + i * 60 + r() * 30, yy = sandY27(x) + 6; c.save(); c.globalAlpha = 0.25 * (1 - nt); c.fillStyle = '#fff0d0'; c.beginPath(); c.ellipse(x, yy + 12, 40, 4, 0, 0, 6.283); c.fill(); c.restore(); } // sun glints on the wet sand
  if (o.rock !== false) { const rx = o.rockX === undefined ? 120 : o.rockX; rock(c, rx, sandY27(rx) + 30, 640, 480, mix('#8a7058', '#1e1c26', nt * 0.8), 2713, { sharp: 0.7, grooves: 6, domes: 3, bumps: 5 }); }
  if (o.green > 0) flowers(c, o.gx || 700, sandY27(o.gx || 700) + 16, 200 * o.green + 40, o.green, 2714, T, 60);
}
// green grass spreading where Al-Khidr sits (Bukhari 3402: he was named Khidr because he sat on barren land and it became green)
function greenPatch(c, x, y, k, T) { if (k <= 0) return; const r = rng(2715);
  c.fillStyle = `rgba(96,150,60,${0.7 * k})`; c.beginPath(); c.ellipse(x, y + 4, 260 * k, 38 * k, 0, 0, 6.283); c.fill();
  c.fillStyle = `rgba(140,190,90,${0.45 * k})`; c.beginPath(); c.ellipse(x - 20, y, 170 * k, 22 * k, 0, 0, 6.283); c.fill();
  for (let i = 0; i < 160; i++) { const a = r() * 6.283, rr = Math.sqrt(r()) * 220 * k, gx = x + Math.cos(a) * rr, gy = y + 4 + Math.sin(a) * rr * 0.13, l = (10 + r() * 22) * (1 - rr / 260);
    c.strokeStyle = r() > 0.5 ? '#6aa040' : '#4a8a30'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(gx, gy); c.quadraticCurveTo(gx + 3, gy - l * 0.6, gx + Math.sin(T * 1.4 + i) * 3, gy - l); c.stroke(); } }
// ---------- the basket and the fish
function basket27(c, x, y, s, open = 0) { c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(0, 4, 60, 10, 0, 0, 6.283); c.fill();
  const g = c.createLinearGradient(-50, 0, 50, 0); g.addColorStop(0, '#9a6a34'); g.addColorStop(0.5, '#c89a5a'); g.addColorStop(1, '#6a4420');
  c.fillStyle = g; c.beginPath(); c.moveTo(-52, -70); c.quadraticCurveTo(-58, -10, -40, 0); c.lineTo(40, 0); c.quadraticCurveTo(58, -10, 52, -70); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(70,40,16,0.6)'; c.lineWidth = 2.5; for (let k = 1; k < 7; k++) { c.beginPath(); c.moveTo(-54, -70 + k * 10); c.quadraticCurveTo(0, -64 + k * 10, 54, -70 + k * 10); c.stroke(); }
  for (let k = -4; k <= 4; k++) { c.beginPath(); c.moveTo(k * 12, -70); c.lineTo(k * 9, 0); c.stroke(); }
  c.fillStyle = '#5a3a1a'; c.beginPath(); c.ellipse(0, -70, 54, 12, 0, 0, 6.283); c.fill();
  c.fillStyle = '#2a1a0c'; c.beginPath(); c.ellipse(0, -70, 46, 8, 0, 0, 6.283); c.fill();
  c.strokeStyle = '#7a5228'; c.lineWidth = 6; c.beginPath(); c.moveTo(-44, -70); c.quadraticCurveTo(0, -150, 44, -70); c.stroke();
  if (open < 1) { c.save(); c.globalAlpha *= 1 - open; c.fillStyle = '#d8d0b0'; c.beginPath(); c.ellipse(-6, -76, 40, 9, -0.05, 0, 6.283); c.fill(); c.restore(); } // the cloth over it
  c.restore(); }
function fish27(c, x, y, s, ang, T, o = {}) { c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
  const wag = Math.sin(T * (o.alive ? 14 : 0)) * 0.35 * (o.alive || 0);
  if (o.glow) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, 0, 160, '#bfefff', 0.4 * o.glow); c.restore(); }
  c.save(); c.translate(-62, 0); c.rotate(wag); c.fillStyle = '#5a7a8a'; c.beginPath(); c.moveTo(4, 0); c.lineTo(-38, -30); c.quadraticCurveTo(-26, 0, -38, 30); c.closePath(); c.fill(); c.restore();
  const g = c.createLinearGradient(0, -28, 0, 28); g.addColorStop(0, '#5a7488'); g.addColorStop(0.45, '#c8d8e0'); g.addColorStop(1, '#f0f4f4');
  c.fillStyle = g; c.beginPath(); c.moveTo(-66, 0); c.bezierCurveTo(-40, -32, 30, -34, 70, -4); c.quadraticCurveTo(76, 2, 68, 8); c.bezierCurveTo(30, 30, -40, 26, -66, 0); c.fill();
  c.fillStyle = '#4a6474'; c.beginPath(); c.moveTo(-20, -24); c.quadraticCurveTo(0, -46, 24, -26); c.closePath(); c.fill(); // dorsal fin
  c.beginPath(); c.moveTo(10, 14); c.quadraticCurveTo(0, 32, -14, 20); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(60,80,96,0.35)'; c.lineWidth = 1.5; for (let i = 0; i < 7; i++) for (let j = 0; j < 2; j++) { c.beginPath(); c.arc(-36 + i * 12, -8 + j * 12, 7, -1.2, 1.2); c.stroke(); }
  c.strokeStyle = 'rgba(40,60,70,0.6)'; c.lineWidth = 2; c.beginPath(); c.arc(46, -2, 13, -1.3, 1.3); c.stroke(); // gill
  c.fillStyle = '#1a2228'; c.beginPath(); c.arc(56, -8, 3.6, 0, 6.283); c.fill();
  c.restore(); }
// the fish's way in the sea "like a tunnel" (Al-Kahf 61, 63): a lit channel in the water running toward the open sea
function tunnel27(c, T, x0, y0, k, a = 1) { if (k <= 0 || a <= 0) return; T += 100;
  const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40 * k; pts.push([lerp(x0, 760, u) + Math.sin(u * 5) * 40 * (1 - u), lerp(y0, SEAY + 30, Math.pow(u, 0.7)), lerp(1, 0.08, Math.pow(u, 0.6))]); }
  c.save(); c.globalCompositeOperation = 'lighter';
  pts.forEach(([x, y, s], i) => { const fl = 0.6 + 0.4 * Math.sin(T * 3 - i * 0.5); c.strokeStyle = `rgba(190,240,255,${0.35 * a * fl})`; c.lineWidth = 3 * s + 1; c.beginPath(); c.ellipse(x, y, 60 * s, 24 * s, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); });
  c.restore();
  c.fillStyle = `rgba(4,20,34,${0.35 * a})`; c.beginPath(); pts.forEach(([x, y, s], i) => i ? c.lineTo(x, y - 6 * s) : c.moveTo(x, y)); for (let i = pts.length - 1; i >= 0; i--) c.lineTo(pts[i][0], pts[i][1] + 14 * pts[i][2]); c.closePath(); c.fill();
}
function splash27(c, x, y, k, s = 1) { if (k <= 0 || k >= 1) return; const r = rng(2716); c.fillStyle = `rgba(235,248,255,${0.9 * (1 - k)})`;
  for (let i = 0; i < 18; i++) { const a = -Math.PI / 2 + (r() - 0.5) * 2.2, v = (80 + r() * 160) * s, px = x + Math.cos(a) * v * k, py = y + Math.sin(a) * v * k + 260 * k * k * s; c.beginPath(); c.arc(px, py, (3 + r() * 5) * s, 0, 6.283); c.fill(); }
  c.strokeStyle = `rgba(235,248,255,${0.8 * (1 - k)})`; c.lineWidth = 3 * s; c.beginPath(); c.ellipse(x, y, 30 + 120 * k * s, 10 + 30 * k * s, 0, 0, 6.283); c.stroke(); }
// the fish set: the travellers' camp at the rock, the basket, the leap
function fishSet(c, T, o = {}) {
  cam(c, o.z || 1, o.cx || 540, o.cy || 1200);
  twoSeas(c, T, { sky: o.sky || 'gold', to: o.to, k: o.k, sunX: 900, sunY: SEAY - 150 });
  shore27(c, T, { rockX: 140 });
  if (o.walkers) o.walkers(c);
  const bx = 520, by = sandY27(520) + 40;
  basket27(c, bx, by, 1.1, o.open || 0);
  if (o.fishIn) fish27(c, bx - 4, by - 84, 0.62, -0.15 + Math.sin(T * 12) * 0.05 * (o.wiggle || 0), T, { alive: o.wiggle || 0, glow: o.wiggle || 0 });
  if (o.sleep) { fig(c, MUSA, { x: 250, y: sandY27(250) + 70, h: 380, pose: 'lie', t: T, light: 0.95, veilGlow: 0.3 }); fig(c, YUSHA, { x: 820, y: sandY27(820) + 60, h: 330, pose: 'sit', dir: -1, t: T, light: 0.95, veilGlow: 0.3 }); }
  const L = o.leap || 0; // 0 in the basket, 0..1 flying, then gone
  if (L > 0 && L < 1) { const x = lerp(bx, 690, L), y = lerp(by - 90, sandY27(690) - 30, L) - Math.sin(L * Math.PI) * 340; fish27(c, x, y, 1.0, lerp(-0.9, 0.9, L), T, { alive: 1, glow: 0.6 }); }
  if (o.leap > 0.95) splash27(c, 700, sandY27(700) - 26, seg(L, 0.95, 1.6));
  tunnel27(c, T, 700, sandY27(700) - 26, o.tunnel || 0, 1);
  blurLayer(c, 9, bc => { bc.save(); fgShore(bc, T); bc.restore(); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// ---------- the sermon (Bukhari 122): Musa addresses the Children of Israel in the camp; tents, Sinai ranges, the crowd turned toward him
function sermonSet(c, T, o = {}) {
  cam(c, o.z || 1, o.cx || 540, o.cy || 1200);
  judea(c, T, { sky: o.sky || 'gold', to: o.to, k: o.k, far: '#9a7a8a', mid: '#a0765a', near: '#b08a5e', haze: '#f6c8a0', groves: false, sunX: 220, sunY: 820, fy: 1200, cityX: -3000 });
  for (let i = 0; i < 7; i++) { const x = -60 + i * 190 + (i % 2) * 40, y = 1300 + (i % 2) * 18; tent(c, x, y, 190, 120, mix('#4a3428', '#7a5a3a', (i % 3) / 3), '#1a100a'); }
  const gy = x => 1440 + (x - 540) * -0.02;
  c.fillStyle = '#b08a5e'; c.beginPath(); c.moveTo(-1600, H + 900); for (let x = -1600; x <= 2700; x += 20) c.lineTo(x, gy(x) - 60 + Math.sin(x * 0.01) * 6); c.lineTo(2700, H + 900); c.closePath(); c.fill();
  const g = c.createLinearGradient(0, 1360, 0, H); g.addColorStop(0, 'rgba(255,230,190,0.2)'); g.addColorStop(1, 'rgba(30,16,8,0.5)'); c.fillStyle = g; c.fillRect(-1600, 1360, 4300, 900);
  rock(c, 780, 1500, 420, 160, '#8a6a52', 2719, { sharp: 0.5 });
  const MX = 780, MY = 1440;
  fig(c, MUSA, { x: MX, y: MY, h: 420, dir: -1, t: T, light: 1.05, wind: 0.6, armUp: o.armUp || 0, reach: o.reach || 0, staff: !(o.armUp || o.reach), veilGlow: 0.36 });
  if (o.light) lightFromAbove(c, T, MX, o.light, 280);
  const r = rng(2720); // rows of listeners turned toward him; the near rows larger and blurred
  for (let row = 0; row < 3; row++) for (let i = 0; i < 6 - row; i++) { const x = -40 + i * 130 + row * 50 + (r() - 0.5) * 40, y = 1500 + row * 70, hh = 270 + row * 40;
    fig(c, FOLK[(i + row * 3) % FOLK.length], { x, y, h: hh, dir: 1, t: T + i + row, light: 0.75, wind: 0.3, ink: 0.6, child: (i + row) % 5 === 3, pose: row === 2 ? 'sit' : 'stand' }); }
  blurLayer(c, 8, bc => { bc.save(); [[60, 1980, 0], [330, 2010, 1], [980, 1990, 2]].forEach(([x, y, k]) => fig(bc, FOLK[k + 4], { x, y, h: 560, dir: k === 2 ? -1 : 1, t: T + k, light: 0.5, ink: 0.3 })); bc.restore(); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// ---------- the meeting: Al-Khidr seated on the sand, wrapped in his garment, grass greening around him; Musa and Yusha' come back along the shore
function meetSet(c, T, o = {}) {
  cam(c, o.z || 1, o.cx || 540, o.cy || 1200);
  twoSeas(c, T, { sky: o.sky || 'gold', to: o.to, k: o.k, sunX: 900, sunY: SEAY - 140 });
  shore27(c, T, { rockX: 140 });
  const KX = o.kx || 700, KY = sandY27(KX) + 70, d = o.dist === undefined ? 300 : o.dist;
  if (!o.noK && !o.trio) { greenPatch(c, KX, KY, o.green === undefined ? 1 : o.green, T);
    fig(c, KHIDR, { x: KX, y: KY, h: 420, pose: o.kPose || 'sit', dir: o.kDir || -1, t: T, light: 1.05, wind: 0.5, reach: o.kReach || 0, armUp: o.kUp || 0, dua: o.kDua || false, veilGlow: 0.36 }); }
  if (o.trio) { const kx = -40 + d * 1.0; fig(c, KHIDR, { x: kx, y: sandY27(kx) + 70, h: 420, dir: 1, t: T + 3, light: 1.05, wind: 0.5, walk: stepOf(d, 420), veilGlow: 0.34 }); }
  if (o.kLight) lightFromAbove(c, T, KX, o.kLight, 260);
  // Musa and Yusha' walking in from the left, feet driven by the distance
  const mx = -200 + d, yx = -360 + d * 0.98;
  if (o.walk !== false) { fig(c, YUSHA, { x: yx, y: sandY27(yx) + 64, h: 360, dir: 1, t: T + 1, light: 1, wind: 0.5, walk: o.moving ? stepOf(d, 360) : null, veilGlow: 0.3 });
    fig(c, MUSA, { x: mx, y: sandY27(mx) + 70, h: 430, dir: 1, t: T + 2, light: 1.05, wind: 0.5, walk: o.moving ? stepOf(d, 430) : null, staff: !o.moving && !o.mReach, reach: o.mReach || 0, veilGlow: 0.34 }); }
  blurLayer(c, 9, bc => { bc.save(); fgShore(bc, T); bc.restore(); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// ---------- the village (wall): houses, the people who refuse, the leaning wall; o.lean 0..1, o.cut = the ground opened on the treasure
const vgY = x => 1560 + Math.sin(x * 0.004) * 10;
function chest27(c, x, y, s, k, T) { c.save(); c.translate(x, y); c.scale(s, s);
  if (k > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -40, 260, '#ffd070', 0.5 * k * (0.9 + 0.1 * Math.sin(T * 3))); c.restore(); }
  c.fillStyle = '#5a3418'; c.fillRect(-90, -80, 180, 80); c.fillStyle = '#7a4a22'; c.beginPath(); c.moveTo(-94, -80); c.quadraticCurveTo(0, -140, 94, -80); c.closePath(); c.fill();
  c.strokeStyle = '#c9a040'; c.lineWidth = 7; [-60, 60].forEach(xx => { c.beginPath(); c.moveTo(xx, 0); c.lineTo(xx, -80); c.quadraticCurveTo(xx * 0.9, -112, xx * 0.8, -118); c.stroke(); });
  c.fillStyle = '#e0b850'; c.fillRect(-12, -92, 24, 26); c.fillStyle = '#3a2410'; c.fillRect(-3, -84, 6, 10);
  if (k > 0) sparkle(c, T, 0, -70, 10, 120, 2721, k); c.restore(); }
function leanWall(c, x0, x1, yb, h, lean, T, o = {}) { // dressed stone wall pivoting on its base; leaning = cracks, a bulge, falling grit
  const col = o.col || '#b8946a';
  c.save(); const sk = lean * 0.22; c.transform(1, 0, -sk, 1, sk * yb, 0); // leaning: the top slides sideways, the base stays on the ground
  c.save(); c.beginPath(); c.moveTo(x0, yb); c.lineTo(x0, yb - h); for (let x = x0; x <= x1; x += 40) c.lineTo(x, yb - h - (Math.sin(x * 0.05) > 0.7 ? 8 : 0)); c.lineTo(x1, yb); c.closePath(); c.clip();
  ashlar(c, x0 - 60, yb - h - 20, x1 + 60, yb, col, 2722);
  const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, 'rgba(255,236,200,0.12)'); g.addColorStop(1, 'rgba(20,10,5,0.3)'); c.fillStyle = g; c.fillRect(x0, yb - h - 20, x1 - x0, h + 20);
  if (lean > 0.05) { c.strokeStyle = `rgba(30,16,8,${0.8 * clamp(lean * 1.5)})`; c.lineWidth = 4; const r = rng(2723);
    for (let k = 0; k < 4; k++) { let x = lerp(x0, x1, 0.15 + k * 0.23), y = yb; c.beginPath(); c.moveTo(x, y); for (let j = 0; j < 7; j++) { x += (r() - 0.5) * 50; y -= h / 7; c.lineTo(x, y); } c.stroke(); } }
  c.restore();
  c.fillStyle = mix(col, '#fff2dc', 0.3); c.fillRect(x0 - 8, yb - h - 14, x1 - x0 + 16, 16); // coping
  if (o.glowK > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const gx = lerp(x0, x1, o.glowK); glow(c, gx, yb - h / 2, 260, '#fff0c8', 0.45 * Math.sin(Math.PI * o.glowK)); c.restore(); }
  c.restore();
  if (lean > 0.05) { T += 100; c.fillStyle = 'rgba(120,96,70,0.8)'; for (let i = 0; i < 8; i++) { const q = (T * 0.9 + i * 0.29) % 1, gx = lerp(x0, x1, (i + 0.5) / 8) + lean * 60; c.fillRect(gx, yb - h + q * h, 4, 4); } }
}
function villageSet(c, T, o = {}) {
  cam(c, o.z || 1, o.cx || 540, o.cy || 1200);
  judea(c, T, { sky: o.sky || 'gold', to: o.to, k: o.k, far: '#8a84a0', mid: '#8a7a68', groves: true, sunX: 860, sunY: 860, fy: 1180, night: o.night || 0, city: 1, cityX: 560, cityS: 0.34, lamp: o.lamp || 0 });
  const hs = [[-260, 1430, 300, 250], [60, 1410, 260, 220], [880, 1420, 280, 240], [1180, 1440, 300, 260]];
  hs.forEach(([x, y, w, h], i) => house(c, x, y, w, h, mix('#c6a882', '#7a5a42', i * 0.12), { lamp: o.lamp || 0, t: T + 100 + i, doorOpen: false }));
  c.fillStyle = mix('#b8946a', '#20202a', (o.night || 0) * 0.8); c.beginPath(); c.moveTo(-1600, H + 900); for (let x = -1600; x <= 2700; x += 20) c.lineTo(x, vgY(x) - 110 + Math.sin(x * 0.02) * 3); c.lineTo(2700, H + 900); c.closePath(); c.fill();
  const g = c.createLinearGradient(0, 1440, 0, H); g.addColorStop(0, 'rgba(255,236,200,0.18)'); g.addColorStop(1, 'rgba(30,16,8,0.55)'); c.fillStyle = g; c.fillRect(-1600, 1440, 4300, 900);
  if (o.refuse) { // villagers turning their backs, walking back into their houses
    [[150, 1430, 0], [820, 1420, 1], [330, 1450, 2]].forEach(([x0, y, k]) => { const d = o.refuse * 140 * (k === 1 ? 1 : -1), x = x0 + d;
      fig(c, FOLK[k + 2], { x, y, h: 240, dir: k === 1 ? 1 : -1, t: T + k, light: 0.7, ink: 0.6, walk: stepOf(Math.abs(d), 240) }); }); }
  if (o.cut > 0) { // the ground in front of the wall opened like a cut-away: the buried chest of the two orphans
    c.save(); c.globalAlpha *= o.cut; const sy0 = vgY(540) - 70;
    const sg = c.createLinearGradient(0, sy0, 0, sy0 + 360); sg.addColorStop(0, '#6a4a30'); sg.addColorStop(1, '#2a1a10'); c.fillStyle = sg; c.beginPath(); c.moveTo(160, sy0); c.lineTo(920, sy0); c.lineTo(860, sy0 + 330); c.lineTo(220, sy0 + 330); c.closePath(); c.fill();
    const r = rng(2724); for (let i = 0; i < 40; i++) { c.fillStyle = hexA(r() > 0.5 ? '#8a6a4a' : '#1a100a', 0.5); c.beginPath(); c.ellipse(200 + r() * 680, sy0 + 20 + r() * 290, 6 + r() * 14, 4 + r() * 6, 0, 0, 6.283); c.fill(); }
    chest27(c, 540, sy0 + 270, 1.2, o.cut, T); c.restore(); }
  leanWall(c, 250, 830, vgY(540) - 70, 330, o.lean || 0, T, { glowK: o.glowK || 0 });
  if (o.figs) o.figs(c);
  blurLayer(c, 9, bc => { bc.save(); fgBrush(bc, T, { col: '#6a5a30', stone: '#7a6450' }); bc.restore(); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// ---------- the boy (no violence, nothing shown): children playing at dusk, then only a lamp going out
function playSet(c, T, o = {}) {
  cam(c, o.z || 1, o.cx || 540, o.cy || 1200);
  judea(c, T, { sky: 'dusk', to: 'gold', k: 0.4, groves: true, sunX: 300, sunY: 960, fy: 1200, city: 1, cityX: 820, cityS: 0.3 });
  slope(c, T, { grass: 1, green: 0.5 });
  const d = o.run || 0; // children running across the meadow, feet driven by the distance (they enter by the left edge)
  [[-120, 0, 260], [-300, 1, 240], [-480, 2, 250], [-640, 0, 230]].forEach(([x0, k, hh], i) => { const x = x0 + d * (1 + i * 0.05);
    fig(c, KIDS27[i], { x, y: gY(x), h: hh, child: true, dir: 1, t: T + i, light: 0.85, wind: 0.4, walk: stepOf(d * (1 + i * 0.05), hh * 0.82) + i * 0.3, ink: 0.7 }); });
  if (o.kh) fig(c, KHIDR, { x: 560, y: gY(560), h: 460, dir: 1, t: T + 2, light: 0.95, wind: 0.4, veilGlow: 0.32 });
  if (o.watch) { fig(c, MUSA, { x: 860, y: gY(860), h: 470, dir: -1, t: T, light: 1, wind: 0.4, staff: !o.mUp, armUp: o.mUp || 0, veilGlow: 0.32 }); }
  blurLayer(c, 9, bc => { bc.save(); fgBrush(bc, T, { col: '#5a6a30', stone: '#7a6450' }); bc.restore(); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
const KIDS27 = [{ robe: '#7a5236', wrap: '#e8dcc4', skin: '#a8714f' }, { robe: '#3a5a6a', wrap: '#ece4d4', skin: '#b07a58' }, { robe: '#6a3a3a', wrap: '#e2d6be', skin: '#9a6a4c' }, { robe: '#4a5a3a', wrap: '#e8dcc4', skin: '#a8714f' }];
function lampSet(c, T, out, o = {}) { // a niche in a dark wall, an oil lamp whose flame goes out, its last smoke
  c.save(); cam(c, o.z || 1, 540, 1150);
  c.fillStyle = '#120c0a'; c.fillRect(-400, -400, W + 800, H + 800);
  const lit = 1 - out, g = c.createRadialGradient(540, 1100, 0, 540, 1100, 700); g.addColorStop(0, `rgba(120,70,30,${0.55 * lit + 0.08})`); g.addColorStop(1, 'rgba(10,6,4,0)'); c.fillStyle = g; c.fillRect(-400, -400, W + 800, H + 800);
  ashlar(c, -300, 300, W + 300, 1700, mix('#3a2a20', '#7a5a40', lit * 0.6), 2725);
  c.fillStyle = 'rgba(8,5,4,0.75)'; c.beginPath(); archPath(c, 540, 1300, 360, 420); c.fill();
  c.fillStyle = mix('#3a2a20', '#8a6a4a', lit * 0.5); c.fillRect(340, 1296, 400, 26);
  oilLamp(c, 520, 1296, 2.4, lit, T, out);
  c.restore();
}
// ---------- the king's harbour (reveal): soldiers seizing every good boat; the holed boat of the poor left on the sand
function harbourSet(c, T, o = {}) {
  cam(c, o.z || 1, o.cx || 540, o.cy || 1200);
  seaSet27(c, T, { sky: o.sky || 'gold', to: 'dusk', k: 0.3, sunX: 820, sunY: SEAY - 150, sails: false });
  const take = o.take || 0;
  boat27(c, 1020 - take * 260, 1180, 0.42, T + 1, { wood: '#8a5a32', crew: (cc, dy) => { soldier(cc, { x: -120, y: dy(-120), h: 300, dir: -1, t: T, light: 0.8, ink: 0.7 }); cc.save(); cc.scale(1, 1); banner(cc, 200, dy(200), 1.2, T, '#7a1a1a', 1); cc.restore(); } });
  seaFront27(c, T, 1186, 820 - take * 260, 1240 - take * 260, { sky: o.sky || 'gold', to: 'dusk', k: 0.3 });
  boat27(c, -60 - take * 120, 1250, 0.5, T + 2, { wood: '#94603a', crew: (cc, dy) => soldier(cc, { x: 80, y: dy(80), h: 300, dir: 1, t: T, light: 0.8, ink: 0.7 }) });
  seaFront27(c, T, 1256, -300, 200, { sky: o.sky || 'gold', to: 'dusk', k: 0.3 });
  shore27(c, T, { rock: false, sand: '#d2b088' });
  // the poor men's boat pulled up on the beach, the gap in its side; the soldier walks past it
  boat27(c, 600, sandY27(600) + 150, 0.62, T, { still: true, hole: o.patch ? 0 : 1, patch: o.patch || 0, sail: 0, crew: (cc, dy) => {
    if (o.owners) { fig(cc, SAILOR[0], { x: -150, y: dy(-150), h: 330, dir: 1, t: T, light: 0.9, dua: o.dua, ink: 0.8 }); fig(cc, SAILOR[1], { x: 40, y: dy(40), h: 320, dir: -1, t: T + 1, light: 0.9, dua: o.dua, ink: 0.8 }); } } });
  if (o.walkD !== undefined) { const x = 1220 - o.walkD; soldier(c, { x, y: sandY27(x) + 120, h: 420, dir: -1, t: T, light: 0.85, walk: stepOf(o.walkD, 420), ink: 0.8 }); }
  blurLayer(c, 9, bc => { bc.save(); fgShore(bc, T); bc.restore(); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// ---------- the believing parents at night (reveal2): their house, the lamp, a newborn of light in the mother's arms (no face)
function parentsSet(c, T, o = {}) {
  cam(c, o.z || 1, o.cx || 540, o.cy || 1200);
  judea(c, T, { sky: 'night', night: 0.85, stars: 1, moon: 1, moonX: 820, moonY: 420, groves: true, sun: false, fy: 1180, city: 1, lamp: 1, cityX: 200, cityS: 0.3 });
  house(c, 540, 1500, 640, 460, '#7a6050', { lamp: 1, t: T + 100, doorOpen: true });
  c.fillStyle = '#2a2430'; c.beginPath(); c.moveTo(-1600, H + 900); for (let x = -1600; x <= 2700; x += 20) c.lineTo(x, 1500 + Math.sin(x * 0.01) * 4); c.lineTo(2700, H + 900); c.closePath(); c.fill();
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 420, 1400, 360, '#ffb060', 0.35); c.restore();
  const mother = Object.assign({}, FOLK[3], { x: 470, y: 1640, h: 430, dir: 1, t: T, light: 0.8, reach: 0.55, ink: 0.7 }), father = Object.assign({}, FOLK[1], { x: 690, y: 1650, h: 450, dir: -1, t: T + 1, light: 0.8, ink: 0.7 });
  c.fillStyle = '#3a3036'; c.fillRect(-400, 1600, W + 800, 600);
  fig(c, FOLK[1], father); fig(c, FOLK[3], mother);
  const [hx, hy] = handOf(mother), k = o.babe || 0;
  if (k > 0) { c.save(); c.globalAlpha *= k; c.save(); c.globalCompositeOperation = 'lighter'; glow(c, hx + 10, hy - 10, 200, '#fff0c8', 0.6); c.restore();
    c.fillStyle = '#f4ecdc'; c.beginPath(); c.ellipse(hx + 6, hy - 8, 42, 22, -0.3, 0, 6.283); c.fill(); c.fillStyle = '#e2d6c0'; c.beginPath(); c.ellipse(hx + 34, hy - 20, 16, 15, 0, 0, 6.283); c.fill();
    sparkle(c, T, hx + 10, hy - 40, 10, 120, 2728, 1); c.restore(); }
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// ---------- the lesson: the boat, patched, sails away safe into the sunset; a long road of light on the water
function sailAway(c, T, o = {}) {
  cam(c, o.z || 1, o.cx || 540, o.cy || 1200);
  seaSet27(c, T, { sky: 'gold', to: 'dusk', k: o.k === undefined ? 0.5 : o.k, sunX: 540, sunY: SEAY - 90, glit: 0.8, sails: false });
  const x = 300 + (o.d || 0), s = o.s || 0.55, wl = o.wl || 1240;
  boat27(c, x, wl, s, T, { patch: 1, patchGlow: o.pg || 0, crew: (cc, dy) => { fig(cc, SAILOR[0], { x: -380, y: dy(-380), h: 300, dir: 1, t: T, light: 0.8, ink: 0.7 }); fig(cc, SAILOR[1], { x: 360, y: dy(360), h: 300, dir: 1, t: T, light: 0.8, ink: 0.7 }); } });
  seaFront27(c, T, wl + 6, x - 470 * s, x + 500 * s, { sky: 'gold', to: 'dusk', k: o.k === undefined ? 0.5 : o.k, sunX: 540 });
  c.setTransform(1, 0, 0, 1, 0, 0);
}
function bigWord27(c, txt, y, a, size, col) { if (a > 0) bigWord(c, txt, y, a, size, col); }

function fgShore(c, T) { // blurred foreground: beach grass and a low sand bank in the bottom corners (warm, never dark blobs)
  c.fillStyle = '#c8a070'; c.beginPath(); c.moveTo(-200, H + 200); c.quadraticCurveTo(-100, 1900, 260, 1960); c.quadraticCurveTo(320, 2000, 340, H + 200); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(W + 200, H + 200); c.quadraticCurveTo(W + 80, 1890, W - 220, 1950); c.quadraticCurveTo(W - 300, 1990, W - 320, H + 200); c.closePath(); c.fill();
  [[40, 1960, 3.6, 1], [200, 1990, 2.8, 2], [1040, 1950, 3.4, 3], [880, 1990, 2.6, 4]].forEach(([x, y, k, sd]) => shrub(c, x, y, k, '#8a8a4a', T, sd));
}


// =====================================================================================================================
// ---------- episode 28: the messengers of Ya-Sin and the man who came running (Ya-Sin 13-29)
// Three messengers (white silhouettes, faces hidden by a veil of white light: prophet: true). Habib (named by the exegetes) is an
// ordinary believer: faceless, warm brown clothes of a carpenter. His death is never shown: the crowd closes in, a white light, then
// only his adze on the flagstones. Allah is never depicted: light, calligraphy. The punishment (one Cry, Ya-Sin 29) is a sound wave
// and every lamp of the city going out at once — no bodies.
const RASUL = [
  { veilGlow: 0.42, prophet: true, robe: '#ebe5d6', wrap: '#f7f3ea', skin: '#c49470', trim: '#cfae6a', band: '#b8954a', inner: '#fbf8f0' },
  { veilGlow: 0.42, prophet: true, robe: '#e6e2d8', wrap: '#f5f2ea', skin: '#c49470', trim: '#b8a88a', band: '#a8946a', inner: '#fbf8f0' },
  { veilGlow: 0.42, prophet: true, robe: '#efe9dc', wrap: '#f8f5ee', skin: '#c49470', trim: '#d8bf80', band: '#c9a35a', inner: '#fcfaf4' }];
const HABIB = { robe: '#8a5230', wrap: '#eadcc0', skin: '#a8714f', trim: '#d8b45a', band: '#7a5a3a', inner: '#efe4cc' };
const PEOPLE28 = [SODOM[0], FOLK[0], SODOM[1], FOLK[2], SODOM[2], FOLK[4], SODOM[3], FOLK[5], SODOM[4], FOLK[8], SODOM[5], FOLK[7], SODOM[7], FOLK[1]];
function seriesTag28(c, a) { seriesTag(c, a, 28); }
const Q_FY = 1270; // floor line of the square
const hQ = y => 60 + (y - Q_FY) * 0.72; // figure height for a foot line y in the square

// ---------- Antioch's mountain (Silpius) with its wall climbing the crest, houses on the lower slope (lamps), citadel on top
const silY = (x, fy) => fy - 60 - 560 * Math.pow(clamp((x + 300) / 1700), 1.15) + Math.sin(x * 0.011) * 26 + Math.sin(x * 0.031 + 2) * 10;
function silpius(c, t, fy, o = {}) {
  const nt = o.night || 0, lamp = o.lamp || 0, dark = o.dark || 0;
  const rock = mix(mix('#9a7a6a', '#4a3a48', 0.25), '#16141e', nt * 0.85), lit = mix('#e8b890', '#3a3048', nt * 0.85);
  const g = c.createLinearGradient(0, fy - 650, 0, fy); g.addColorStop(0, mix(rock, lit, 0.35)); g.addColorStop(1, rock);
  c.fillStyle = g; c.beginPath(); c.moveTo(-900, fy + 60); for (let x = -900; x <= 2100; x += 14) c.lineTo(x, silY(x, fy)); c.lineTo(2100, fy + 60); c.closePath(); c.fill();
  // gullies and strata
  const r = rng(2801); c.strokeStyle = hexA(mix(rock, '#000000', 0.4), 0.35); c.lineWidth = 3;
  for (let i = 0; i < 26; i++) { const x = -600 + i * 100 + r() * 50, y0 = silY(x, fy) + 10; c.beginPath(); c.moveTo(x, y0); c.quadraticCurveTo(x - 20 + r() * 40, y0 + 120, x - 40 + r() * 30, Math.min(fy, y0 + 200 + r() * 160)); c.stroke(); }
  c.strokeStyle = hexA(lit, 0.35 * (1 - nt)); c.lineWidth = 3; c.beginPath(); for (let x = -900; x <= 2100; x += 14) x === -900 ? c.moveTo(x, silY(x, fy) + 2) : c.lineTo(x, silY(x, fy) + 2); c.stroke();
  // the wall along the crest, towers every ~150 px, citadel on the summit
  const wc = mix(mix('#c8a47a', '#8a6a52', 0.3), '#1c1a26', nt * 0.85);
  c.strokeStyle = wc; c.lineWidth = 12; c.lineJoin = 'round'; c.beginPath(); for (let x = -500; x <= 1500; x += 20) { const y = silY(x, fy) + 14; x === -500 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke();
  for (let x = -480; x <= 1500; x += 150) { const y = silY(x, fy) + 14; c.fillStyle = wc; c.fillRect(x - 14, y - 46, 28, 52); c.fillStyle = mix(wc, '#000000', 0.3); c.fillRect(x + 4, y - 46, 10, 52);
    c.fillStyle = wc; for (let k = 0; k < 3; k++) c.fillRect(x - 14 + k * 10, y - 54, 7, 9); }
  const sx = 1180, sy = silY(sx, fy) + 20; c.fillStyle = wc; c.fillRect(sx - 90, sy - 90, 180, 96); c.fillRect(sx - 40, sy - 150, 80, 70); c.fillStyle = mix(wc, '#000000', 0.3); c.fillRect(sx + 30, sy - 90, 60, 96);
  // houses on the lower slope, in rows (far rows first); lamps light their windows
  const rr = rng(2802);
  for (let row = 0; row < 5; row++) { const q = row / 5;
    for (let x = -420 + rr() * 60; x < 1500; x += 70 + rr() * 50) {
      const ground = lerp(silY(x, fy) + 160, fy + 10, 0.35 + q * 0.65); if (ground > fy + 20) continue;
      const w = (54 + rr() * 50) * (0.7 + q * 0.4), h = (46 + rr() * 50) * (0.7 + q * 0.4), on = rr() > 0.35 ? 1 : 0.25;
      house(c, x, ground, w, h, mix(mix('#d4b28a', rr() > 0.5 ? '#fff0d8' : '#8a6a52', 0.25), '#22202c', nt * 0.82), { lamp: lamp * on, t: t + 100 + row * 13 + x * 0.01 });
    } }
  if (dark > 0) { c.fillStyle = `rgba(14,14,22,${0.45 * dark})`; c.fillRect(-900, fy - 900, 3000, 1000); }
}
// the river Orontes in the plain: a band of water reflecting the sky, glints
function orontes(c, t, y, o = {}) {
  const nt = o.night || 0, col = mix(o.col || '#9ab8c8', '#1a2238', nt * 0.85);
  const top = x => y + Math.sin(x * 0.004 + 1) * 14, bot = x => y + 56 + Math.sin(x * 0.005 + 2) * 12;
  const g = c.createLinearGradient(0, y, 0, y + 70); g.addColorStop(0, mix(col, '#fff4dc', 0.35 * (1 - nt))); g.addColorStop(1, col);
  c.fillStyle = g; c.beginPath(); c.moveTo(-1400, top(-1400)); for (let x = -1400; x <= 2500; x += 20) c.lineTo(x, top(x)); for (let x = 2500; x >= -1400; x -= 20) c.lineTo(x, bot(x)); c.closePath(); c.fill();
  c.strokeStyle = hexA('#3a4a3a', 0.5); c.lineWidth = 4; c.beginPath(); for (let x = -1400; x <= 2500; x += 20) x === -1400 ? c.moveTo(x, bot(x)) : c.lineTo(x, bot(x)); c.stroke();
  const r = rng(2803); t += 100;
  for (let i = 0; i < 46; i++) { const x = -600 + r() * 2300, yy = lerp(top(x), bot(x), 0.2 + r() * 0.6), w = 10 + r() * 30, a = (0.3 + 0.3 * Math.sin(t * 2 + i)) * (1 - nt * 0.7);
    c.fillStyle = `rgba(255,248,225,${a})`; c.fillRect(x + Math.sin(t * 0.6 + i) * 8, yy, w, 2); }
}
// the city seen from the plain: sky, sun, far range, Silpius with the city, river, olive groves, near ground (gY) for walkers
function antioch(c, T, o = {}) {
  const fy = o.fy || 1180, px = o.px || 0, nt = o.night || 0;
  sky0(c, skyBlend({ sky: o.sky || 'gold', to: o.to, k: o.k }));
  if (o.stars) stars(c, T, 140, 2804, [-400, -300, W + 800, fy - 300], o.stars);
  if (o.sunA !== 0) { const sa = o.sunA === undefined ? 1 : o.sunA, sx = o.sunX === undefined ? 200 : o.sunX, sy = o.sunY === undefined ? fy - 420 : o.sunY;
    c.save(); c.globalCompositeOperation = 'lighter'; glow(c, sx, sy, 520, '#ffc890', 0.38 * sa); c.restore(); sun(c, sx, sy, 42, '#ffe2a8', sa); }
  cloudBank(c, T, 260, 5, mix('#ffe6c8', '#2a2a44', nt), 0.12, 2805, 5); wisps(c, T, fy - 760, 6, '#fff2dc', 0.1 * (1 - nt), 2806, 5);
  const hz = mix('#f6caa0', '#262a48', nt);
  par(c, 0.05, px, 0, () => { ridgeW(c, fy - 330, 120, 0.0019, 2807, mix('#9a8aa8', '#121628', nt)); hazeW(c, fy - 300, 260, hz, 0.5); });
  par(c, 0.14, px, 0, () => { silpius(c, T, fy, o); if (o.cityFx) o.cityFx(c); hazeW(c, fy + 10, 160, hz, 0.35); });
  par(c, 0.3, px, 0, () => { orontes(c, T, fy + 40, { night: nt });
    c.fillStyle = mix('#8a8050', '#14161a', nt * 0.85); c.fillRect(-1400, fy + 100, 3900, 600);
    for (let i = -14; i < 30; i++) { const x = i * 86 + (i % 3) * 20, yy = fy + 140 + (i % 2) * 22; oliveTree(c, x, yy, 0.32, mix('#6a7450', '#0e120e', nt), mix('#46502e', '#080a08', nt), Math.sin(T + i) * 2); }
    hazeW(c, fy + 170, 80, hz, 0.25); });
  par(c, 0.6, px, 0, () => { slope(c, T, { col: '#b08a5a', night: nt, seed: 2808 }); if (o.walkers) o.walkers(c); });
}

// ---------- the square: colonnaded street (Antioch's colonnades), houses and the mountain behind, flagstones; people in perspective
function square28(c, T, o = {}) {
  const fy = Q_FY, dusk = o.dusk === undefined ? 0.45 : o.dusk, dim = o.dim || 0, px = o.px || 0;
  sky0(c, skyBlend({ sky: 'gold', to: o.to || 'dusk', k: dusk }));
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 280, fy - 420, 560, '#ffb070', 0.32 * (1 - dim)); c.restore(); sun(c, 280, fy - 440, 40, '#ffd0a0', 0.85 * (1 - dim));
  wisps(c, T, fy - 900, 5, '#fff0dc', 0.1, 2811, 5);
  par(c, 0.08, px, 0, () => { c.save(); c.translate(0, -120); silpius(c, T, fy, { lamp: o.lamp || 0, night: dim * 0.5 }); c.restore(); hazeW(c, fy - 100, 220, '#f2c8a8', 0.45); });
  par(c, 0.3, px, 0, () => { // the colonnade: a row of columns with an architrave, shops behind
    ashlar(c, -900, fy - 260, W + 900, fy + 4, mix('#b08a64', '#4a3a3a', dim * 0.6), 2812);
    for (let i = -6; i < 14; i++) { const x = i * 140 + 30; c.fillStyle = 'rgba(30,16,10,0.55)'; c.fillRect(x + 22, fy - 230, 96, 220); }
    for (let i = -6; i < 15; i++) column(c, i * 140 - 40, fy + 4, 44, 330, mix(mix('#d8b890', '#a88a6a', 0.2), '#3a3434', dim * 0.6), { band: mix(GOLD, '#3a3430', dim) });
    const ac = mix('#c8a47a', '#3a3434', dim * 0.6); c.fillStyle = ac; c.fillRect(-900, fy - 412, W + 1800, 44); c.fillStyle = mix(ac, '#fff0d8', 0.3); c.fillRect(-900, fy - 412, W + 1800, 7);
    c.fillStyle = mix(ac, '#000000', 0.25); for (let x = -900; x < W + 900; x += 32) c.fillRect(x, fy - 368, 16, 9);
    if (o.awning !== false) awning(c, 760, 1120, fy - 466, T);
    jar(c, 700, fy + 6, 0.9); jar(c, 735, fy + 4, 0.7, '#8a5030'); jar(c, 1150, fy + 6, 0.9, '#9a6a40');
  });
  flagFloor(c, fy, 540, mix('#b89a72', '#4a3a3a', dim * 0.5), { sheen: 0.13 * (1 - dim), sheenX: 300 });
}
// the crowd of the city (they face left, toward the messengers): rows in perspective
const CR28 = (() => { const r = rng(2813), L = []; [[1390, 600, 1080, 6], [1470, 620, 1120, 5], [1570, 660, 1140, 4], [1690, 740, 1170, 3]].forEach(([y, x0, x1, n], row) => {
  for (let i = 0; i < n; i++) L.push({ x: lerp(x0, x1, (i + 0.5) / n) + (r() - 0.5) * 40, y: y + (r() - 0.5) * 20, f: (row * 5 + i * 3) % PEOPLE28.length, ph: r() * 6, d: r(), row }); });
  return L.sort((a, b) => a.y - b.y); })();
// people who come in from the left edge around Habib (killed scene): [stop x, y, delay]
const CL28 = [[250, 1600, 0], [120, 1720, 0.25], [330, 1760, 0.45], [60, 1560, 0.15]];
const MS28 = [[150, 1640], [285, 1612], [410, 1668]]; // the messengers' spots
const HB = [540, 1720]; // Habib's spot
function stoneInHand(c, fo) { const [hx, hy] = handOf(fo), s = fo.h / 300; c.fillStyle = '#8a7e72'; c.beginPath(); c.ellipse(hx, hy - 6 * s, 11 * s, 9 * s, 0.4, 0, 6.283); c.fill(); c.fillStyle = 'rgba(255,240,220,0.35)'; c.beginPath(); c.ellipse(hx - 3 * s, hy - 10 * s, 5 * s, 3 * s, 0.4, 0, 6.283); c.fill(); }
function crowd28(c, T, m = {}) {
  CR28.forEach((p, i) => {
    const h = hQ(p.y), who = PEOPLE28[p.f], tt = T + p.ph, close = (m.close || 0) * (0.5 + 0.5 * (1 - p.row / 3)) * 260;
    const ang = clamp((m.anger || 0) * 1.4 - p.d * 0.4), st = m.stones && p.d > 0.45;
    const x = Math.max(p.x - close, p.y > 1560 ? HB[0] + 175 : p.y > 1500 ? HB[0] + 60 : -9999), fo = { x, y: p.y, h, t: tt, dir: m.dirFn ? m.dirFn(p) : -1, light: (m.light || 0.8), wind: 0.2, ink: 0.7,
      armUp: st ? 0.62 * ang : (p.d < 0.5 ? 0.55 * ang : 0), reach: !st && p.d >= 0.5 ? 0.85 * ang : 0,
      walk: m.close && x > (p.y > 1560 ? HB[0] + 176 : -9998) && m.moving ? stepOf(close, h) + p.ph : null };
    lean(c, x, p.y, (m.laugh ? Math.sin(T * 5 + i) * 0.03 * m.laugh + 0.05 * m.laugh : 0), () => fig(c, who, fo));
    if (st && ang > 0.2) stoneInHand(c, fo);
  });
}
function rasul28(c, T, o = {}) { // the three messengers on the left; n = how many (2 then 3); third: walking-in distance for the third
  MS28.forEach(([x, y], i) => { if (i >= (o.n || 3)) return; const h = hQ(y) * 1.02;
    fig(c, RASUL[i], { x, y, h, dir: 1, t: T + i * 1.3, light: 1.05, wind: 0.35, veilGlow: 0.26, reach: (o.speak || 0) * (i === 1 ? 0.7 : 0), dua: !!o.dua && i !== 1 }); });
}
function habib28(c, T, o = {}) {
  const x = o.x === undefined ? HB[0] : o.x, y = o.y === undefined ? HB[1] : o.y, h = hQ(y) * 1.04;
  fig(c, HABIB, { x, y, h, dir: o.dir === undefined ? 1 : o.dir, t: T, light: o.light || 1, wind: 0.4, reach: o.reach || 0, armUp: o.armUp || 0, dua: !!o.dua, walk: o.walk === undefined ? null : o.walk });
}
// the hero (hook / killed / cta / outro / cover): Habib alone between the messengers and his people, a column of light falls on him
const HERO28 = { z: 1.3, cx: 600, cy: 1385, beam: 1, close: 0.6, anger: 1, dusk: 0.85, dim: 0.5 };
function hero28(c, T, o = {}) {
  const z = o.z || 1, cx = o.cx || 540, cy = o.cy || 1200, beam = o.beam || 0;
  cam(c, z + 0.004 * Math.sin(T * 0.3), cx, cy, ...(o.shake ? shake(T, o.shake, 12) : [0, 0]));
  square28(c, T, { dusk: o.dusk === undefined ? 0.7 : o.dusk, dim: o.dim === undefined ? 0.35 : o.dim, lamp: 0.4 });
  if (o.rasul !== false) rasul28(c, T, { dua: o.rdua });
  // the crowd behind him (far rows), Habib, then the near rows
  crowd28(c, T, { close: o.close || 0, anger: o.anger || 0, stones: o.stones, light: o.beam ? 0.55 : 0.68, moving: o.moving });
  if (o.habib !== false) habib28(c, T, { dua: o.hdua, reach: o.hreach || (o.hdua ? 0 : 0.35), armUp: o.harm || 0 });
  if (o.left) CL28.forEach(([sx, y, del], i) => { const h = hQ(y), d = clamp((o.left - del) * 260, 0, sx + 160), x = -160 + d;
    fig(c, PEOPLE28[(i * 5 + 2) % PEOPLE28.length], { x, y, h, dir: 1, t: T + i, light: 0.6, wind: 0.2, ink: 0.7, walk: d < sx + 160 ? stepOf(d, h) + i * 0.4 : null, armUp: d >= sx + 150 ? 0.55 : 0 }); });
  if (beam > 0) { lightFromAbove(c, T, HB[0], beam * 1.5, 230); c.save(); c.globalCompositeOperation = 'lighter'; glow(c, HB[0], HB[1] - 200, 420, '#fff4d8', 0.45 * beam); c.fillStyle = `rgba(255,240,205,${0.28 * beam})`; c.beginPath(); c.ellipse(HB[0], HB[1] + 6, 190, 34, 0, 0, 6.283); c.fill(); c.restore(); sparkle(c, T, HB[0], HB[1] - 760, 10, 200, 2814, beam * 0.8); }
  if (beam > 0) { const g = c.createRadialGradient(HB[0], HB[1] - 200, 180, HB[0], HB[1] - 200, 1100); g.addColorStop(0, 'rgba(12,8,20,0)'); g.addColorStop(1, `rgba(12,8,20,${0.62 * beam})`); c.fillStyle = g; c.fillRect(-900, -900, W + 1800, H + 1800); }
  c.setTransform(1, 0, 0, 1, 0, 0);
}
function heroTexts28(c, t, a1) { topShade(c, 1.3); seriesTag28(c, 1); bigWord27(c, 'SON PEUPLE', 250, a1, 100); bigWord27(c, 'L\'A TUÉ…', 365, a1, 112, '#f6c453'); }

// ---------- the carpenter's adze dropped on the flagstones (what is left of him in the square: we never show the killing)
function adze(c, x, y, s, a = 1) {
  if (a <= 0) return; c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(s, s); c.rotate(-0.25);
  c.fillStyle = 'rgba(10,6,4,0.35)'; c.beginPath(); c.ellipse(10, 14, 120, 12, 0.25, 0, 6.283); c.fill();
  const g = c.createLinearGradient(0, -10, 0, 10); g.addColorStop(0, '#b0804a'); g.addColorStop(1, '#5a3a1a'); c.fillStyle = g; c.beginPath(); c.roundRect(-110, -9, 200, 18, 8); c.fill();
  c.strokeStyle = 'rgba(40,20,8,0.4)'; c.lineWidth = 2; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-100 + i * 36, -5); c.lineTo(-80 + i * 36, 4); c.stroke(); }
  const b = c.createLinearGradient(80, -40, 120, 30); b.addColorStop(0, '#c8ccd0'); b.addColorStop(1, '#4a4e54'); c.fillStyle = b;
  c.beginPath(); c.moveTo(78, -26); c.lineTo(102, -26); c.lineTo(104, 22); c.quadraticCurveTo(118, 44, 146, 50); c.lineTo(130, 60); c.quadraticCurveTo(96, 50, 84, 22); c.closePath(); c.fill();
  c.strokeStyle = '#2a2e34'; c.lineWidth = 2; c.stroke();
  c.restore();
}
function shavings(c, x, y, s, seed) { const r = rng(seed); for (let i = 0; i < 9; i++) { const sx = x + (r() - 0.5) * 220 * s, sy = y + (r() - 0.5) * 40 * s;
  c.strokeStyle = '#e8c890'; c.lineWidth = 3 * s; c.beginPath(); c.arc(sx, sy, (6 + r() * 6) * s, r() * 3, r() * 3 + 4); c.stroke(); } }
function emptySpot(c, T, o = {}) { // close on the flagstones where he stood: the adze, wood shavings, dust settling, light from above
  const z = o.z || 1; cam(c, z, o.cx || 540, o.cy || 1500);
  square28(c, T, { dusk: 0.8, dim: 0.5, lamp: 0.4, awning: false });
  if (o.leave !== undefined) CR28.filter(p => p.row < 2).forEach((p, i) => { const h = hQ(p.y), dd = o.leave * (70 + p.d * 40); fig(c, PEOPLE28[p.f], { x: p.x + dd, y: p.y, h, dir: 1, t: T + p.ph, light: 0.6, ink: 0.6, walk: stepOf(dd, h) + p.ph }); });
  shavings(c, HB[0] - 40, HB[1] + 10, 1, 2815); adze(c, HB[0] + 10, HB[1] - 6, 1.1);
  dust(c, T, 40, 2816, [HB[0] - 400, HB[1] - 400, 800, 420], '#f2dcc0', 0.35 * (o.dust === undefined ? 1 : o.dust), 6);
  lightFromAbove(c, T, HB[0], o.beam || 0.8, 260);
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, HB[0], HB[1] - 20, 300, '#fff4d8', 0.3 * (o.beam || 0.8)); c.restore();
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- the street: Habib comes running "from the farthest end of the city" (Ya-Sin 20), feet driven by the ground distance
const RUN_A = [760, 1268], RUN_B = [560, 1760];
function runnerAt(q) { // position, height and step phase for progress q (0..1) along the street (ground distance integrated in world units)
  const n = 40; let dist = 0; const steps = Math.ceil(q * n);
  for (let i = 0; i < steps; i++) { const q0 = i / n, q1 = Math.min(q, (i + 1) / n), y0 = lerp(RUN_A[1], RUN_B[1], q0), y1 = lerp(RUN_A[1], RUN_B[1], q1);
    dist += Math.hypot((RUN_B[0] - RUN_A[0]) * (q1 - q0), y1 - y0) / sAt((y0 + y1) / 2); }
  const y = lerp(RUN_A[1], RUN_B[1], q), x = lerp(RUN_A[0], RUN_B[0], q), h = 400 * sAt(y);
  return { x, y, h, phase: dist / (0.293 * 400) * 0.62 };
}
function street28(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx || 540, o.cy || 1200);
  streetSet(c, T, { sky: 'gold', to: 'dusk', k: 0.45, night: 0.2, moon: false, torches: false, lamps: 0.25, sheen: 0.18, sheenCol: '#ffc890' });
  // townspeople at their doors who turn to look
  [[1010, 1450, 0], [880, 1330, 1], [1140, 1560, 2]].forEach(([x, y, i]) => { const h = 360 * sAt(y); fig(c, [SODOM[1], SODOM[3], SODOM[5]][i], { x, y, h, dir: o.look ? lerp(-1, 1, ease(clamp(o.look))) * -1 : -1, t: T + i, light: 0.8, ink: 0.7 }); });
  if (o.run !== undefined) { const r = runnerAt(clamp(o.run)); dust(c, T, 10, 2817, [r.x - 60, r.y - 40, 160, 50], '#e8d0a8', 0.4 * (o.run < 1 ? 1 : 0), 20);
    lean(c, r.x, r.y, o.run < 1 ? -0.2 : 0, () => fig(c, HABIB, { x: r.x, y: r.y, h: r.h, dir: -1, t: T, light: 1, wind: 0.8, walk: o.run < 1 ? r.phase : null, reach: o.run < 1 ? 0.45 + 0.2 * Math.sin(r.phase * 6.283) : 0.5 })); }
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- Paradise is evoked, never described: a garden of light (Ya-Sin 26), trees in blossom, a river of light
function garden28(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx || 540, o.cy || 1200);
  const g = c.createLinearGradient(0, -400, 0, 1500); g.addColorStop(0, '#f6e8c8'); g.addColorStop(0.55, '#fff6e0'); g.addColorStop(1, '#fffaf0'); c.fillStyle = g; c.fillRect(-900, -900, W + 1800, 4000);
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, 700, 900, '#fff2c8', 0.5); c.restore();
  rays(c, 540, 300, Math.PI / 2, 1.6, 1600, 16, '#fffaf0', 0.08, T, 2818);
  ridgeW(c, 1080, 90, 0.0022, 2819, '#e8dcc0'); hazeW(c, 1110, 200, '#fffaf0', 0.6);
  ridgeW(c, 1190, 60, 0.003, 2820, '#d8d4a8'); hazeW(c, 1220, 140, '#fffaf0', 0.45);
  // the river of light winding toward the horizon
  c.save(); c.globalCompositeOperation = 'lighter'; const rv = c.createLinearGradient(0, 1220, 0, H); rv.addColorStop(0, 'rgba(255,250,235,0.5)'); rv.addColorStop(1, 'rgba(220,240,255,0.7)');
  c.fillStyle = rv; c.beginPath(); c.moveTo(560, 1225); c.bezierCurveTo(500, 1350, 760, 1450, 640, 1600); c.bezierCurveTo(560, 1720, 780, 1840, 760, H + 200); c.lineTo(1100, H + 200); c.bezierCurveTo(1000, 1800, 860, 1700, 900, 1590); c.bezierCurveTo(960, 1440, 640, 1360, 600, 1225); c.closePath(); c.fill(); c.restore();
  // meadow
  const m = c.createLinearGradient(0, 1220, 0, H); m.addColorStop(0, 'rgba(200,214,150,0.0)'); m.addColorStop(0.3, 'rgba(170,196,120,0.55)'); m.addColorStop(1, 'rgba(120,150,80,0.75)'); c.fillStyle = m; c.fillRect(-900, 1220, W + 1800, 900); c.fillStyle = 'rgba(120,150,80,0.75)'; c.fillRect(-900, 2119, W + 1800, 1200);
  [[90, 1330, 0.9], [980, 1360, 1.0], [300, 1270, 0.55], [820, 1265, 0.5], [-140, 1480, 1.3], [1230, 1520, 1.3]].forEach(([x, y, s], i) => tree(c, x, y, s, T, { leaf: 1, bloom: 1, col: '#7a5a3a', leafCol: i % 2 ? '#8aa85a' : '#9ab866', seed: 2821 + i }));
  flowers(c, 300, 1700, 340, 1, 2827, T, 60); flowers(c, 900, 1760, 300, 1, 2828, T, 50);
  sparkle(c, T, 540, 650, 24, 460, 2829, 0.9);
  if (o.habib !== undefined) { const d = o.habib, x = (o.x0 === undefined ? 120 : o.x0) + d, y = 1660;
    fig(c, HABIB, { x, y, h: 430, dir: o.dir === undefined ? 1 : o.dir, t: T, light: 1.15, wind: 0.3, walk: o.walking ? stepOf(d, 430) : null, reach: o.reach || 0, dua: !!o.dua, ink: 0.6 }); }
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, 1300, 700, '#fffaf0', 0.25); c.restore();
  c.setTransform(1, 0, 0, 1, 0, 0);
  const sg = c.createLinearGradient(0, 0, 0, 640); sg.addColorStop(0, 'rgba(60,38,18,0.62)'); sg.addColorStop(1, 'rgba(60,38,18,0)'); c.fillStyle = sg; c.fillRect(0, 0, W, 640);
}

// ---------- the one Cry (Ya-Sin 29): a wave of light and sound over the city, then every lamp goes out at once
function cryWave(c, x, y, k) { if (k <= 0 || k >= 1) return;
  for (let i = 0; i < 3; i++) { const q = clamp(k * 1.25 - i * 0.12); if (q <= 0 || q >= 1) continue; c.strokeStyle = `rgba(255,248,232,${0.65 * (1 - q)})`; c.lineWidth = 18 * (1 - q) + 2;
    c.beginPath(); c.ellipse(x, y, 60 + q * 1500, 20 + q * 520, 0, 0, 6.283); c.stroke(); } }
function cityAt(c, T, o = {}) { // the city from the plain at dusk (lamps), for the cry and the lesson
  const out = o.out || 0;
  antioch(c, T, Object.assign({ sky: 'dusk', to: out > 0 ? 'night' : undefined, k: out * 0.8, night: lerp(0.55, 0.8, out), lamp: (o.lamp === undefined ? 1 : o.lamp) * (1 - out), dark: out, sunA: 0.3 * (1 - out), sunX: 140, stars: 0.4 + 0.4 * out }, o));
}

// ---------- the messengers approach the city on the road (the walk is driven by the distance)
function arrive28(c, T, o = {}) {
  cam(c, o.z || 1, o.cx || 540, o.cy || 1200);
  antioch(c, T, { sky: o.sky || 'gold', to: o.to, k: o.k, lamp: o.lamp || 0, px: o.px || 0, walkers: cc => {
    const list = [[0, 0], [1, -150]]; if (o.third !== undefined) list.push([2, -150 - 160 - (1 - o.third) * 900]);
    list.forEach(([i, dx]) => { const d = (o.dist || 0) + dx, x = 160 + d; if (x < -200) return; const hh = 430 * (i === 2 ? 0.98 : 1);
      fig(cc, RASUL[i], { x, y: gY(x) + 40, h: hh, dir: 1, t: T + i, light: 1.05, wind: 0.5, walk: o.walking === false ? null : stepOf(i === 2 ? (o.dist || 0) + (o.third || 0) * 900 : d, hh) + i * 0.33, staff: i === 0, veilGlow: 0.34 }); }); } });
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// =====================================================================================================================
// ---------- episode 29: the People of the Cave (Al-Kahf 9-26)
// The young men are ordinary believers: faceless, never veiled in light (they are not prophets). Allah is never depicted:
// light and calligraphy only. Their number is left undecided on screen (Al-Kahf 22): the deepest sleepers stay in the dark.
// The dog stretches its forelegs across the threshold (Al-Kahf 18). The sun never touches them (Al-Kahf 17).
const YOUTHS = [
  { robe: '#4a4a72', wrap: '#e6dcc6', skin: '#b07a58', trim: '#c9a35a', band: '#8a7040' },
  { robe: '#2e5a58', wrap: '#ece2cc', skin: '#a8714f', trim: '#b8a070' },
  { robe: '#7a4a32', wrap: '#e2d4b8', skin: '#c48e66', trim: '#d8b45a' },
  { robe: '#5a3a52', wrap: '#ece4d4', skin: '#9a6a4c', trim: '#c9a35a' },
  { robe: '#3e5440', wrap: '#ddd2bc', skin: '#b4805c', trim: '#b89a62' },
  { robe: '#6a5a3a', wrap: '#efe6d4', skin: '#a8714f', trim: '#cfae6a' },
  { robe: '#344a6a', wrap: '#e8dcc4', skin: '#94664a', trim: '#c9a35a' }];
const SELLER29 = { robe: '#7a3a22', wrap: '#e8dcc4', skin: '#9a6a4c', trim: '#d8b45a', band: '#c9a040' };
function seriesTag29(c, a) { textGlow(c, 'HISTOIRES DU CORAN  ·  ÉPISODE 29', W / 2, 112, '600 32px Lora', '#fbe7c6', a * 0.92, '#000000', 12); }
const SEED29 = 2900;

// ---------- the dog (a slender sand-coloured hound): stand / walk (trot driven by the distance) / lie with the forelegs stretched (Al-Kahf 18)
// (x, y) = ground under the body, s = scale (body ~240 px long at s = 1), o.dir, o.walk (phase in cycles), o.head 0 = resting on the paws, 1 = head up
function dog29(c, x, y, s, T, o = {}) {
  const a = o.alpha === undefined ? 1 : o.alpha; if (a <= 0) return;
  const dir = o.dir || 1, lt = o.light === undefined ? 1 : o.light, pose = o.pose || 'stand';
  const base = mix(o.col || '#c49a62', '#18120e', clamp(1 - lt) * 0.85), back = mix(base, '#3a2414', 0.32), belly = mix(base, '#f6e0b8', 0.35 * lt), dk = mix(base, '#120a06', 0.55);
  const far = mix(base, '#000000', 0.28), ink = mix(base, '#140a04', 0.7);
  const tt = T + 100, br = Math.sin(tt * 1.6) * 1.2;
  c.save(); c.globalAlpha *= a; c.translate(x, y);
  c.fillStyle = 'rgba(10,6,4,0.26)'; c.beginPath(); c.ellipse(0, 2, (pose === 'lie' ? 130 : 105) * s, 9 * s, 0, 0, 6.283); c.fill();
  c.scale(s * dir, s); c.lineJoin = 'round'; c.lineCap = 'round';
  const out = (fill, w = 2.4) => { c.fillStyle = fill; c.fill(); c.strokeStyle = ink; c.lineWidth = w; c.stroke(); };
  const chain = (p, segs) => { const pts = [p]; segs.forEach(([L, an]) => { const q = pts[pts.length - 1]; pts.push([q[0] + Math.sin(an) * L, q[1] + Math.cos(an) * L]); }); return pts; };
  const legPath = (pts, w0, w1, col) => { // a tapering leg along a chain of points
    const n = pts.length - 1; c.beginPath();
    const side = (k, sgn) => { const p = pts[k], q = pts[Math.min(n, k + 1)], pp = pts[Math.max(0, k - 1)], dx = q[0] - pp[0], dy = q[1] - pp[1], l = Math.hypot(dx, dy) || 1, w = lerp(w0, w1, k / n) / 2;
      return [p[0] - dy / l * w * sgn, p[1] + dx / l * w * sgn]; };
    for (let k = 0; k <= n; k++) { const v = side(k, 1); k ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]); }
    for (let k = n; k >= 0; k--) { const v = side(k, -1); c.lineTo(v[0], v[1]); }
    c.closePath(); out(col, 2);
    const e = pts[n]; c.beginPath(); c.ellipse(e[0] + 5, e[1] - 3, 9, 5, 0, 0, 6.283); out(col, 2); };
  const head = (hx, hy, tilt) => {
    c.save(); c.translate(hx, hy); c.rotate(tilt);
    c.beginPath(); c.moveTo(-14, -12); c.quadraticCurveTo(4, -22, 16, -12); c.lineTo(46, 0); c.quadraticCurveTo(52, 4, 46, 8); c.quadraticCurveTo(22, 12, 4, 14); c.quadraticCurveTo(-18, 14, -20, 0); c.closePath(); out(base);
    c.fillStyle = belly; c.beginPath(); c.moveTo(10, 8); c.quadraticCurveTo(30, 10, 44, 7); c.quadraticCurveTo(26, 14, 6, 13); c.closePath(); c.fill();
    c.fillStyle = '#1a100a'; c.beginPath(); c.ellipse(48, 2, 4.5, 3.6, 0, 0, 6.283); c.fill(); // nose
    c.beginPath(); c.ellipse(14, -6, 3, 2.2, -0.2, 0, 6.283); c.fill(); // eye
    c.strokeStyle = ink; c.lineWidth = 1.6; c.beginPath(); c.moveTo(46, 7); c.quadraticCurveTo(34, 11, 24, 9); c.stroke(); // mouth line
    c.beginPath(); c.moveTo(-6, -12); c.quadraticCurveTo(-22, 0, -16, 26); c.quadraticCurveTo(-10, 32, -4, 24); c.quadraticCurveTo(-2, 6, 4, -10); c.closePath(); out(back, 1.8); // drooping feathered ear
    c.strokeStyle = hexA(dk, 0.6); c.lineWidth = 1.4; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(-10 + k * 3, 0 + k * 5); c.lineTo(-13 + k * 3, 18 + k * 3); c.stroke(); }
    c.restore(); };
  if (pose === 'lie') {
    const hu = o.head === undefined ? 1 : o.head;
    // far foreleg stretched
    c.beginPath(); c.roundRect(38, -22, 86, 14, 7); out(far, 2); c.beginPath(); c.ellipse(124, -14, 11, 6, 0, 0, 6.283); out(far, 2);
    // tail curled along the ground
    c.strokeStyle = ink; c.lineWidth = 11; c.beginPath(); c.moveTo(-96, -18); c.quadraticCurveTo(-130, -4, -96, 2); c.quadraticCurveTo(-60, 6, -30, 0); c.stroke();
    c.strokeStyle = back; c.lineWidth = 7.5; c.stroke();
    // body
    c.beginPath(); c.moveTo(66, -30); c.quadraticCurveTo(60, -66 - br, 34, -70 - br); c.quadraticCurveTo(-20, -66 - br, -64, -64 - br * 0.5); c.quadraticCurveTo(-100, -60, -104, -30);
    c.quadraticCurveTo(-106, -4, -84, -2); c.lineTo(48, -2); c.quadraticCurveTo(70, -8, 66, -30); c.closePath();
    const g = c.createLinearGradient(0, -72, 0, 0); g.addColorStop(0, back); g.addColorStop(0.45, base); g.addColorStop(1, belly); out(g);
    // folded hind leg (thigh + tucked paw)
    c.beginPath(); c.ellipse(-66, -28, 34, 24, -0.2, 0, 6.283); out(mix(base, back, 0.3), 2);
    c.beginPath(); c.moveTo(-50, -10); c.quadraticCurveTo(-30, -4, -14, -6); c.quadraticCurveTo(-6, -2, -16, 2); c.lineTo(-56, 2); c.closePath(); out(base, 2);
    c.strokeStyle = hexA(dk, 0.35); c.lineWidth = 2; c.beginPath(); c.moveTo(20, -60); c.quadraticCurveTo(0, -40, 8, -12); c.moveTo(-20, -62); c.quadraticCurveTo(-34, -40, -30, -18); c.stroke(); // ribs / fur
    // near foreleg stretched forward, flat on the ground ("stretching his forelegs at the threshold")
    c.beginPath(); c.roundRect(30, -16, 104, 15, 7); out(base, 2); c.beginPath(); c.ellipse(134, -8, 12, 7, 0, 0, 6.283); out(base, 2);
    // neck and head (up and watchful, or resting on the paws)
    const hx = lerp(122, 82, hu), hy = lerp(-26, -98, hu) + br * 0.5;
    c.beginPath(); c.moveTo(34, -68); c.quadraticCurveTo(lerp(70, 60, hu), lerp(-60, -96, hu), hx - 8, hy - 10); c.lineTo(hx + 4, hy + 12); c.quadraticCurveTo(lerp(70, 72, hu), lerp(-22, -50, hu), 62, -28); c.closePath(); out(base);
    head(hx, hy, lerp(0.15, 0.08, hu));
  } else {
    const walking = o.walk !== undefined && o.walk !== null, ph = walking ? o.walk * 6.283 : 0;
    const sw = k => walking ? Math.sin(ph + k) : 0, lf = k => walking ? Math.max(0, Math.cos(ph + k)) : 0;
    const fore = k => chain([0, 0], [[46, 0.22 * sw(k) - 0.06], [50, 0.32 * sw(k) - 1.0 * lf(k)], [6, 0.6]]);
    const hind = k => chain([0, 0], [[42, 0.38 + 0.32 * sw(k)], [44, -0.55 + 0.28 * sw(k) - 0.35 * lf(k)], [34, 0.06 + 0.3 * sw(k) + 0.7 * lf(k)]]);
    const SH = [56, -96], HP = [-62, -104];
    const legs = [[SH, fore(Math.PI), 'f'], [HP, hind(0), 'f'], [SH, fore(0), 'n'], [HP, hind(Math.PI), 'n']];
    let low = -1e9; legs.forEach(([b, pts]) => pts.forEach(p => { low = Math.max(low, b[1] + p[1]); }));
    const lift = -(low + 4) + (walking ? -Math.abs(Math.sin(ph * 2)) * 2 : 0);
    c.translate(0, lift);
    const place = (b, pts) => pts.map(p => [b[0] + p[0], b[1] + p[1]]);
    legs.filter(l => l[2] === 'f').forEach(([b, pts]) => legPath(place(b, pts), 16, 8, far));
    // tail
    const tw = Math.sin(tt * 2.2) * 6;
    c.strokeStyle = ink; c.lineWidth = 10; c.beginPath(); c.moveTo(-86, -104); c.quadraticCurveTo(-124, -80 + tw, -118, -40 + tw); c.quadraticCurveTo(-112, -22, -96, -24 + tw); c.stroke();
    c.strokeStyle = back; c.lineWidth = 6.5; c.stroke();
    // body: deep chest, tucked belly
    c.beginPath(); c.moveTo(80, -86); c.quadraticCurveTo(80, -114, 52, -120); c.quadraticCurveTo(10, -112 - br, -46, -116 - br); c.quadraticCurveTo(-82, -118, -94, -98);
    c.quadraticCurveTo(-100, -74, -82, -68); c.quadraticCurveTo(-58, -76, -36, -72); c.quadraticCurveTo(0, -54, 40, -54); c.quadraticCurveTo(72, -58, 80, -86); c.closePath();
    const g = c.createLinearGradient(0, -122, 0, -52); g.addColorStop(0, back); g.addColorStop(0.5, base); g.addColorStop(1, belly); out(g);
    c.strokeStyle = hexA(dk, 0.35); c.lineWidth = 2; c.beginPath(); c.moveTo(30, -110); c.quadraticCurveTo(14, -86, 22, -62); c.moveTo(-6, -108); c.quadraticCurveTo(-18, -88, -12, -66); c.stroke();
    // thigh mass over the near hind leg
    legs.filter(l => l[2] === 'n').forEach(([b, pts]) => legPath(place(b, pts), 18, 9, base));
    c.beginPath(); c.ellipse(-62, -92, 30, 24, 0.3 + 0.15 * sw(Math.PI), 0, 6.283); out(mix(base, back, 0.15), 2);
    // neck + head
    const hu = o.head === undefined ? 1 : o.head, hx = lerp(112, 98, hu), hy = lerp(-110, -150, hu);
    c.beginPath(); c.moveTo(44, -118); c.quadraticCurveTo(70, -128, hx - 10, hy - 12); c.lineTo(hx + 6, hy + 12); c.quadraticCurveTo(84, -100, 78, -82); c.closePath(); out(base);
    head(hx, hy, lerp(0.35, 0.05, hu));
  }
  c.restore();
}
const dogStep = (dist, s) => dist / (150 * s); // trot cycles for a ground distance (no sliding)

// ---------- a young man asleep on his side on a reed mat (Al-Kahf 18: "you would think them awake, while they sleep"; turned right and left)
// (x, y) = ground, s = scale (~300 px long at s = 1), dir 1 = head on the left
function sleeper29(c, x, y, s, T, who, o = {}) {
  const a = o.alpha === undefined ? 1 : o.alpha; if (a <= 0) return;
  const dir = o.dir || 1, lt = o.light === undefined ? 1 : o.light, dimK = clamp(1 - lt) * 0.8;
  const robe = mix(who.robe, '#0a0a12', dimK), lit = mix(robe, '#fff4e0', 0.18 * lt), shade = mix(robe, '#000000', 0.38), wrap = mix(who.wrap, '#16141c', dimK), skin = mix(who.skin, '#140c08', dimK);
  const br = Math.sin((T + 100) * 1.1 + x * 0.013) * 2.2;
  c.save(); c.globalAlpha *= a; c.translate(x, y);
  c.fillStyle = `rgba(8,5,3,${0.3})`; c.beginPath(); c.ellipse(0, 3, 168 * s, 13 * s, 0, 0, 6.283); c.fill();
  c.scale(s * dir, s); c.lineJoin = 'round';
  // the reed mat
  const mat = mix('#9a7a48', '#14100c', dimK); c.fillStyle = mat; c.beginPath(); c.roundRect(-160, -7, 330, 11, 4); c.fill();
  c.strokeStyle = mix(mat, '#000000', 0.35); c.lineWidth = 1.5; for (let k = -150; k < 168; k += 9) { c.beginPath(); c.moveTo(k, -7); c.lineTo(k, 4); c.stroke(); }
  // feet (bare, sole toward us) and the thobe hem
  c.fillStyle = skin; c.beginPath(); c.ellipse(150, -12, 13, 8, -0.3, 0, 6.283); c.fill(); c.beginPath(); c.ellipse(144, -24, 12, 8, -0.4, 0, 6.283); c.fill();
  c.fillStyle = mix(wrap, '#ffffff', 0.25 * lt); c.beginPath(); c.moveTo(96, -38); c.quadraticCurveTo(126, -36, 140, -30); c.lineTo(138, -6); c.quadraticCurveTo(116, -6, 92, -10); c.closePath(); c.fill();
  // the body under the cloak: shoulder, waist, hip, bent knees
  c.beginPath(); c.moveTo(-96, -6); c.quadraticCurveTo(-104, -50, -76, -62 - br); c.quadraticCurveTo(-40, -70 - br, -8, -54 - br * 0.4); c.quadraticCurveTo(18, -46, 40, -64);
  c.quadraticCurveTo(70, -84, 100, -60); c.quadraticCurveTo(124, -44, 132, -30); c.quadraticCurveTo(124, -14, 100, -10); c.lineTo(60, -6); c.closePath();
  const g = c.createLinearGradient(0, -80, 0, 0); g.addColorStop(0, lit); g.addColorStop(0.55, robe); g.addColorStop(1, shade);
  c.fillStyle = g; c.fill(); c.strokeStyle = mix(robe, '#120804', 0.7); c.lineWidth = 2.6; c.stroke();
  c.strokeStyle = hexA(shade, 0.8); c.lineWidth = 2.5; c.beginPath(); c.moveTo(-70, -40); c.quadraticCurveTo(-30, -52, 10, -36); c.moveTo(20, -30); c.quadraticCurveTo(60, -58, 104, -40); c.moveTo(-40, -18); c.quadraticCurveTo(10, -26, 60, -18); c.stroke();
  if (who.trim) { c.strokeStyle = mix(who.trim, '#14100c', dimK); c.lineWidth = 4; c.beginPath(); c.moveTo(-60, -60 - br); c.quadraticCurveTo(-10, -50, 30, -60); c.stroke(); }
  // the arm folded under the head, hand by the cheek
  c.fillStyle = shade; c.beginPath(); c.moveTo(-84, -48); c.quadraticCurveTo(-118, -40, -128, -20); c.lineTo(-112, -14); c.quadraticCurveTo(-100, -32, -74, -36); c.closePath(); c.fill();
  c.fillStyle = skin; c.beginPath(); c.ellipse(-124, -16, 10, 7, 0.3, 0, 6.283); c.fill();
  // the head (on its side, face toward the mat: nothing to read) in its head cloth
  c.save(); c.translate(-118, -36 - br * 0.5); c.rotate(-1.42);
  faceless(c, 0, 0, 21, skin, false, false, wrap); headCloth(c, 0, 0, 21, wrap, lt, { flap: 0, agal: false });
  c.restore();
  c.restore();
}

// ---------- the cave seen from inside, looking out through its mouth
const MOUTH29 = (() => { const P = [], n = 64; for (let i = 0; i < n; i++) { const an = i / n * 6.283, rr = 1 + 0.09 * noise1(i * 0.45, SEED29) + 0.05 * Math.sin(i * 1.7);
  let px = 560 + Math.cos(an) * 285 * rr, py = 760 + Math.sin(an) * 430 * rr; if (py > 1180) py = 1180 + (py - 1180) * 0.08; P.push([px, py]); } return P; })();
function mouthPath29(c, s = 1, cx = 560, cy = 760) { c.moveTo(cx + (MOUTH29[0][0] - 560) * s, cy + (MOUTH29[0][1] - 760) * s); MOUTH29.forEach(p => c.lineTo(cx + (p[0] - 560) * s, cy + (p[1] - 760) * s)); c.closePath(); }
// the sky outside: a fixed key (sky/to/k) or a time-lapse day phase (o.ph)
function sky29(c, o) {
  if (o.ph !== undefined) return daySky(c, o.ph % 1);
  sky0(c, skyStops(o.sky || 'gold', o.to, o.k || 0)); return null;
}
function outside29(c, T, o = {}) {
  const nt = o.night || 0, hz = mix(o.haze || '#f6caa0', '#202848', nt);
  sky29(c, o);
  if (o.stars) stars(c, T, 120, SEED29 + 1, [-300, -300, W + 600, 1100], o.stars);
  if (o.moonA) moon(c, o.moonX || 700, o.moonY || 520, 34, o.moonA);
  if (o.sunA) { const sx = o.sunX === undefined ? 420 : o.sunX, sy = o.sunY === undefined ? 1010 : o.sunY; c.save(); c.globalCompositeOperation = 'lighter'; glow(c, sx, sy, 460, '#ffc890', 0.4 * o.sunA); c.restore(); sun(c, sx, sy, 34, '#ffe2a8', o.sunA); }
  cloudBank(c, T, 420, 4, mix('#ffe6c8', '#2a2a44', nt), 0.12, SEED29 + 2, 4);
  ridgeW(c, 960, 110, 0.0034, SEED29 + 3, mix('#8a7a9a', '#121628', nt)); hazeW(c, 990, 220, hz, 0.55);
  ridgeW(c, 1060, 80, 0.0046, SEED29 + 4, mix('#7a6a62', '#10121c', nt)); hazeW(c, 1080, 140, hz, 0.4);
  if (o.cityFar) { c.save(); sodomCity(c, T, 380, 1100, 0.16, { lamp: o.lamp || 0, night: nt, seed: 29 }); c.restore(); hazeW(c, 1110, 90, hz, 0.35); }
  ridgeW(c, 1140, 50, 0.006, SEED29 + 5, mix('#8a7050', '#14120e', nt));
}
// sleepers: [x, y, s, dir, who, depth light]; the two deepest stay in the dark (their number is Allah's knowledge, Al-Kahf 22)
const SLP29 = [[455, 1262, 0.6, 1, 6, 0.22], [680, 1256, 0.58, -1, 5, 0.22], [280, 1365, 0.86, 1, 0, 0.5], [820, 1352, 0.84, -1, 1, 0.5],
  [210, 1535, 1.16, 1, 2, 0.72], [880, 1522, 1.12, -1, 3, 0.72], [380, 1770, 1.55, 1, 4, 0.85]];
const caveFloorY = 1180;
function cave29(c, T, o = {}) {
  const z = o.z || 1; cam(c, z + 0.003 * Math.sin(T * 0.25), o.cx || 540, o.cy || 960, ...(o.shake ? shake(T, o.shake, 10) : [0, 0]));
  const nt = o.night || 0, day = 1 - nt, inLit = (o.inLit === undefined ? 1 : o.inLit) * (0.45 + 0.55 * day);
  outside29(c, T, o);
  // rock all around the mouth (even-odd hole)
  c.save(); c.beginPath(); c.rect(-900, -900, W + 1800, H + 1800); mouthPath29(c);
  const rg = c.createRadialGradient(560, 900, 260, 560, 1000, 1300);
  rg.addColorStop(0, mix(mix('#8a725a', '#2a2430', nt * 0.7), '#000000', 1 - inLit)); rg.addColorStop(0.35, mix(mix('#5a4a3c', '#1a1820', nt * 0.7), '#000000', (1 - inLit) * 0.8)); rg.addColorStop(1, '#0e0b09');
  c.fillStyle = rg; c.fill('evenodd'); c.clip('evenodd');
  // strata and cracks following the vault, lumps of stone
  const r = rng(SEED29 + 6);
  for (let k = 0; k < 14; k++) { const sc = 1.12 + k * 0.11; c.strokeStyle = `rgba(${k % 2 ? '255,230,190' : '10,6,4'},${(k % 2 ? 0.07 : 0.22) * (1 - k / 16)})`; c.lineWidth = 3 + (k % 3) * 2;
    c.beginPath(); mouthPath29(c, sc, 560 + Math.sin(k * 2.1) * 20, 840 + k * 8); c.stroke(); }
  for (let i = 0; i < 70; i++) { const an = r() * 6.283, d = 380 + r() * 700, px = 560 + Math.cos(an) * d * 0.75, py = 850 + Math.sin(an) * d, rr = 20 + r() * 60;
    const lg = c.createRadialGradient(px - rr * 0.3, py - rr * 0.3, 2, px, py, rr); lg.addColorStop(0, `rgba(255,225,180,${0.06 * inLit})`); lg.addColorStop(1, 'rgba(0,0,0,0.0)');
    c.fillStyle = lg; c.beginPath(); c.ellipse(px, py, rr, rr * 0.7, an, 0, 6.283); c.fill();
    c.strokeStyle = 'rgba(8,5,3,0.25)'; c.lineWidth = 2; c.beginPath(); c.moveTo(px - rr, py); c.quadraticCurveTo(px, py + rr * 0.4, px + rr, py - rr * 0.2); c.stroke(); }
  c.restore();
  // the lit rim of the mouth, and a few hanging teeth of rock along the top
  c.save(); c.strokeStyle = mix('#ffd8a8', '#5a6a8a', nt); c.globalAlpha = 0.5 * (0.4 + 0.6 * day); c.lineWidth = 10; c.filter = 'blur(5px)'; c.beginPath(); mouthPath29(c); c.stroke(); c.restore();
  c.strokeStyle = 'rgba(14,10,8,0.9)'; c.lineWidth = 4; c.beginPath(); mouthPath29(c); c.stroke();
  [[400, 0.9], [470, 1.4], [610, 1.1], [700, 0.8]].forEach(([tx, k], i) => { const top = MOUTH29.filter(p => p[1] < 760).reduce((b, p) => Math.abs(p[0] - tx) < Math.abs(b[0] - tx) ? p : b);
    c.fillStyle = '#1a140f'; c.beginPath(); c.moveTo(tx - 26 * k, top[1] - 10); c.quadraticCurveTo(tx - 6, top[1] + 50 * k, tx + 2, top[1] + 64 * k); c.quadraticCurveTo(tx + 10, top[1] + 40 * k, tx + 24 * k, top[1] - 10); c.closePath(); c.fill(); });
  // the floor of the cave, widening toward us
  const fl = mix('#8a7458', '#1c1a20', nt * 0.7);
  c.beginPath(); c.moveTo(320, caveFloorY + 4); c.lineTo(800, caveFloorY + 4); c.bezierCurveTo(1060, 1240, 1300, 1380, 1500, 1440); c.lineTo(1500, H + 900); c.lineTo(-420, H + 900); c.lineTo(-420, 1440); c.bezierCurveTo(-200, 1380, 60, 1240, 320, caveFloorY + 4); c.closePath();
  const fg = c.createLinearGradient(0, caveFloorY, 0, H + 100); fg.addColorStop(0, mix(fl, '#ffe8c0', 0.3 * day * inLit)); fg.addColorStop(0.25, mix(fl, '#000000', 1 - inLit)); fg.addColorStop(1, mix(fl, '#080604', 0.75)); c.fillStyle = fg; c.fill();
  const fr = rng(SEED29 + 7); // pebbles and floor texture in perspective
  for (let i = 0; i < 120; i++) { const py = caveFloorY + 10 + Math.pow(fr(), 1.6) * 760, k = (py - caveFloorY) / 740, px = 560 + (fr() - 0.5) * (520 + k * 1500), rr = (2 + fr() * 5) * (0.4 + k * 1.6);
    c.fillStyle = fr() > 0.5 ? `rgba(12,8,5,${0.35})` : `rgba(255,236,200,${0.1 * inLit})`; c.beginPath(); c.ellipse(px, py, rr * 1.6, rr * 0.7, 0, 0, 6.283); c.fill(); }
  // light pooling on the floor in front of the mouth
  c.save(); c.globalCompositeOperation = 'lighter'; const lp = c.createRadialGradient(560, caveFloorY + 30, 10, 560, caveFloorY + 60, 420);
  lp.addColorStop(0, `rgba(255,226,180,${0.3 * day * inLit})`); lp.addColorStop(1, 'rgba(255,226,180,0)'); c.fillStyle = lp; c.fillRect(0, caveFloorY - 100, W, 700); c.restore();
  // the sun passing by: a patch of light on the right wall at sunrise, on the left wall at sunset — never on them (Al-Kahf 17)
  if (o.sunPatch) { const sp = o.sunPatch, sd = sp.side, k = sp.k === undefined ? 1 : sp.k, mv = sp.move || 0;
    c.save(); c.globalCompositeOperation = 'lighter';
    const x0 = sd > 0 ? 860 : 260, x1 = sd > 0 ? 1180 : -100, y0 = 560 + mv * 220, gq = c.createLinearGradient(x0, 0, x1, 0);
    gq.addColorStop(0, `rgba(255,214,150,${0.32 * k})`); gq.addColorStop(1, 'rgba(255,214,150,0)'); c.fillStyle = gq;
    c.beginPath(); c.moveTo(x0, y0 - 140); c.lineTo(x1, y0 + 60); c.lineTo(x1, y0 + 480); c.lineTo(x0, y0 + 220); c.closePath(); c.fill();
    dust(c, T, 18, SEED29 + 8 + sd, [Math.min(x0, x1), y0 - 100, Math.abs(x1 - x0), 520], '#ffe8c0', 0.35 * k, 5); c.restore(); }
  // the dog across the threshold, forelegs stretched (in silhouette against the day)
  if (o.dog !== false) dog29(c, o.dogX || 450, caveFloorY + 2, 0.82, T, Object.assign({ pose: 'lie', dir: 1, light: 0.25 + 0.4 * day, head: o.dogHead === undefined ? 1 : o.dogHead }, o.dogO || {}));
  // the sleepers (or, awake, sitting up)
  if (o.sleepers !== false) SLP29.forEach(([sx, sy, ss, sdr, wi, l], i) => { const dirI = o.turned ? -sdr : sdr, light = l * inLit * (o.sleepLight || 1);
    if (o.awake) { if (i < 2) sleeper29(c, sx, sy, ss, T, YOUTHS[wi], { dir: dirI, light: light * 0.7 }); else fig(c, YOUTHS[wi], { x: sx + sdr * 20 * ss, y: sy, h: 330 * ss, pose: 'sit', dir: o.faceIn ? (sx < 560 ? 1 : -1) : -sdr, t: T + i, light: light + 0.2, ink: 0.7, reach: o.reachI === i ? 0.6 : 0, dua: o.dua }); }
    else sleeper29(c, sx, sy, ss, T, YOUTHS[wi], { dir: dirI, light }); });
  if (o.extra) o.extra(c);
  // mercy: a soft light that fills the cave (no form)
  if (o.mercy) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 560, 1450, 700, '#fff0d0', 0.28 * o.mercy); c.restore(); sparkle(c, T, 560, 1000, 14, 360, SEED29 + 9, 0.6 * o.mercy); }
  // depth: darkness gathers at the edges of the rock
  const vg = c.createRadialGradient(560, 1150, 520, 560, 1150, 1250); vg.addColorStop(0, 'rgba(6,4,3,0)'); vg.addColorStop(1, `rgba(6,4,3,${0.55 + 0.25 * nt})`); c.fillStyle = vg; c.fillRect(-900, -900, W + 1800, H + 1800);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
const HERO29 = { z: 1.06, cx: 560, cy: 1080, sky: 'dawn', to: 'gold', k: 0.5, sunA: 1, sunX: 400, sunY: 1000, sunPatch: { side: 1, k: 0.8 } };
function heroTexts29(c, a1) { if (a1 <= 0) return; topShade(c, 1.3 * a1); seriesTag29(c, a1); bigWord27(c, 'ENDORMIS DANS', 250, a1, 84); bigWord27(c, 'UNE CAVERNE…', 360, a1, 104, '#f6c453'); }

// the mountain massif: several peaks, lit faces and shaded spurs, gullies, strata, a cliff band where the cave opens
const mtH29 = x => 780 * Math.exp(-Math.pow((x - 800) / 360, 2)) + 360 * Math.exp(-Math.pow((x - 1220) / 300, 2)) + 220 * Math.exp(-Math.pow((x - 400) / 240, 2))
  + noise1(x * 0.011, 31) * 46 + noise1(x * 0.045, 32) * 14;
const mtY29 = x => 1470 - mtH29(x);
function massif29(c, T, nt) {
  const rockC = mix(mix('#b08c6e', '#7a6260', 0.25), '#16141e', nt * 0.85), lit = mix('#f0c89c', '#3a3448', nt * 0.85), shd = mix('#4a3640', '#0c0a12', nt * 0.7);
  const path = () => { c.beginPath(); c.moveTo(-400, 1560); for (let x = -400; x <= 1800; x += 10) c.lineTo(x, mtY29(x)); c.lineTo(1800, 1560); c.closePath(); };
  path(); const g = c.createLinearGradient(0, 680, 0, 1500); g.addColorStop(0, mix(rockC, lit, 0.3)); g.addColorStop(1, mix(rockC, '#2a2020', 0.2)); c.fillStyle = g; c.fill();
  c.save(); path(); c.clip();
  // shaded spurs: from each crest point, a shadow wedge falls down-right (light from the left)
  const r = rng(SEED29 + 90);
  for (let i = 0; i < 26; i++) { const x = -200 + i * 80 + r() * 40, y = mtY29(x), len = 300 + r() * 420, w = 40 + r() * 70;
    const sg = c.createLinearGradient(x, y, x + w, y); sg.addColorStop(0, hexA(shd, 0.5)); sg.addColorStop(1, hexA(shd, 0));
    c.fillStyle = sg; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 10 + r() * 30, y + len * 0.5, x - 10 + r() * 30, y + len); c.lineTo(x + w + 10, y + len); c.quadraticCurveTo(x + w * 0.6, y + len * 0.4, x + w * 0.3, y + 10); c.closePath(); c.fill();
    c.strokeStyle = hexA(lit, 0.22 * (1 - nt * 0.6)); c.lineWidth = 3; c.beginPath(); c.moveTo(x - 2, y + 4); c.quadraticCurveTo(x + 6 + r() * 20, y + len * 0.5, x - 12 + r() * 20, y + len); c.stroke(); }
  // strata, gently tilted
  for (let k = 0; k < 18; k++) { const yy = 760 + k * 42; c.strokeStyle = hexA(k % 2 ? shd : lit, 0.1 + (k % 3) * 0.04); c.lineWidth = 2 + (k % 3);
    c.beginPath(); for (let x = -400; x <= 1800; x += 24) { const v = yy + (x - 700) * 0.06 + noise1(x * 0.01, k + 40) * 14; x === -400 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); }
  // the cliff band around the cave: a steeper darker wall with a ledge under the mouth
  const cg = c.createRadialGradient(760, 1050, 40, 760, 1050, 190); cg.addColorStop(0, hexA(shd, 0.5)); cg.addColorStop(1, hexA(shd, 0)); c.fillStyle = cg; c.beginPath(); c.ellipse(760, 1050, 200, 170, 0, 0, 6.283); c.fill();
  c.fillStyle = mix(rockC, lit, 0.35); c.beginPath(); c.moveTo(600, 1128); c.quadraticCurveTo(760, 1112, 920, 1132); c.lineTo(930, 1150); c.quadraticCurveTo(760, 1138, 590, 1146); c.closePath(); c.fill();
  // scrub on the slopes
  const rs = rng(SEED29 + 91); for (let i = 0; i < 60; i++) { const x = -200 + rs() * 1900, y = mtY29(x) + 40 + rs() * (1500 - mtY29(x) - 40); if (Math.abs(x - 760) < 170 && y > 900 && y < 1160) continue;
    c.fillStyle = mix(mix('#5a6a3a', '#3a4a2a', rs()), '#0e120e', nt * 0.8); c.beginPath(); c.ellipse(x, y, 6 + rs() * 10, 4 + rs() * 5, 0, 0, 6.283); c.fill(); }
  c.restore();
  c.strokeStyle = hexA(lit, 0.45 * (1 - nt * 0.6)); c.lineWidth = 3; c.beginPath(); for (let x = -400; x <= 1800; x += 10) x === -400 ? c.moveTo(x, mtY29(x) + 1) : c.lineTo(x, mtY29(x) + 1); c.stroke();
}
// ---------- the mountain seen from outside: the cave mouth high on the cliff, a path, the city far below in the valley
const pY29 = x => 1660 - (x - 540) * 0.16 + Math.sin(x * 0.008) * 10; // the near slope, rising to the right (toward the cave)
function mount29(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx || 540, o.cy || 1150);
  const nt = o.night || 0, px = o.px || 0;
  const st = sky29(c, o);
  if (o.stars) stars(c, T, 140, SEED29 + 11, [-500, -300, W + 1000, 1100], o.stars);
  if (o.moonA) moon(c, o.moonX || 820, o.moonY || 360, 40, o.moonA);
  if (o.sunA) { const sx = o.sunX === undefined ? 200 : o.sunX, sy = o.sunY === undefined ? 760 : o.sunY; c.save(); c.globalCompositeOperation = 'lighter'; glow(c, sx, sy, 520, '#ffc890', 0.38 * o.sunA); c.restore(); sun(c, sx, sy, 42, '#ffe2a8', o.sunA); }
  cloudBank(c, T, 300, 5, mix('#ffe6c8', '#22243c', nt), 0.12, SEED29 + 12, 5);
  const hz = mix(o.haze || '#f2c8a0', '#1e2440', nt);
  par(c, 0.05, px, 0, () => { ridgeW(c, 1000, 130, 0.0022, SEED29 + 13, mix('#9a8aa8', '#121628', nt)); hazeW(c, 1030, 240, hz, 0.5); });
  par(c, 0.12, px, 0, () => { ridgeW(c, 1140, 70, 0.004, SEED29 + 14, mix('#8a7a72', '#141420', nt));
    // the city far below (o.idol: the idol on its temple tower; o.lamp)
    c.save(); sodomCity(c, T, 250, 1235, 0.3, { lamp: o.lamp || 0, night: nt, seed: 29 }); c.restore();
    if (o.idol) { c.save(); c.globalAlpha *= o.idol; pedestal21(c, 250, 1235 - 440 * 0.3 + 2, 0.12, '#8a7058', nt); baal(c, 250, 1235 - 440 * 0.3 - 10, 0.1, T, { fire: 0.6 * (1 - nt * 0.5), dim: nt }); c.restore(); }
    if (o.cityFx) o.cityFx(c);
    hazeW(c, 1250, 120, hz, 0.4); });
  par(c, 0.25, px, 0, () => { // the mountain: a great outcrop, the cave mouth in its face
    massif29(c, T, nt);
    const mx = 760, my = 1050, gl = o.caveGlow || 0;
    c.fillStyle = 'rgba(8,6,6,0.95)'; c.beginPath(); for (let i = 0; i <= 40; i++) { const an = i / 40 * 6.283, rr = 1 + 0.1 * noise1(i * 0.5, 7); let qx = mx + Math.cos(an) * 62 * rr, qy = my + Math.sin(an) * 84 * rr; if (qy > my + 70) qy = my + 70; i ? c.lineTo(qx, qy) : c.moveTo(qx, qy); } c.closePath(); c.fill();
    c.strokeStyle = hexA(mix('#ffe2b8', '#6a7088', nt), 0.45); c.lineWidth = 4; c.stroke();
    if (gl > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, mx, my, 260, '#fff0d0', 0.6 * gl); c.restore(); rays(c, mx, my, -Math.PI / 2, 2.4, 900, 12, '#fff6e0', 0.06 * gl, T, SEED29 + 16); }
    // the path climbing to the mouth
    c.strokeStyle = hexA(mix('#e8d0a8', '#3a3a48', nt), 0.55); c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-200, 1500); c.quadraticCurveTo(250, 1440, 420, 1360); c.quadraticCurveTo(560, 1300, 470, 1240); c.quadraticCurveTo(420, 1190, 610, 1140); c.stroke();
    for (let i = 0; i < 9; i++) shrub(c, 380 + i * 120 + Math.sin(i * 3) * 40, 1400 - i * 6 + Math.cos(i) * 30, 0.6, mix('#5a6a3a', '#101410', nt), T, SEED29 + 20 + i);
    hazeW(c, 1520, 120, hz, 0.25); });
  par(c, 0.6, px, 0, () => { // the near slope where people walk
    const cc = mix('#a88a62', '#16141c', nt * 0.82);
    const g = c.createLinearGradient(0, 1500, 0, H + 200); g.addColorStop(0, mix(cc, '#fff0d0', 0.14 * (1 - nt))); g.addColorStop(0.4, cc); g.addColorStop(1, mix(cc, '#140c06', 0.55));
    c.fillStyle = g; c.beginPath(); c.moveTo(-1600, H + 900); for (let x = -1600; x <= 2800; x += 16) c.lineTo(x, pY29(x)); c.lineTo(2800, H + 900); c.closePath(); c.fill();
    c.strokeStyle = hexA(mix(cc, '#fff2d8', 0.4), 0.35 * (1 - nt * 0.7)); c.lineWidth = 3; c.beginPath(); for (let x = -1600; x <= 2800; x += 16) x === -1600 ? c.moveTo(x, pY29(x) + 1) : c.lineTo(x, pY29(x) + 1); c.stroke();
    const r = rng(SEED29 + 30); for (let i = 0; i < 120; i++) { const x = -800 + r() * 2900, y = pY29(x) + 8 + Math.pow(r(), 1.5) * 380, k = 0.6 + (y - pY29(x)) / 300;
      if (r() > 0.6) shrub(c, x, y, 0.35 * k, mix('#6a6a3a', '#101410', nt), T, SEED29 + 40 + i); else { c.fillStyle = mix('#8a7458', '#14121a', nt * 0.8); c.beginPath(); c.ellipse(x, y, 8 * k, 4 * k, 0, 0, 6.283); c.fill(); } }
    if (o.walkers) o.walkers(c); });
  if (o.fg !== false) blurLayer(c, 9, bc => fgBrush(bc, T, { col: mix('#6a5a30', '#0c0c10', nt * 0.8), stone: mix('#7a6450', '#141218', nt * 0.8) }), 3);
  if (nt > 0) { c.fillStyle = `rgba(6,10,30,${0.25 * nt})`; c.fillRect(-900, -900, W + 1800, H + 1800); }
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// a group walking up the slope (feet on pY29, steps driven by the distance); list of [who, dx], o.dog = include the dog behind them
function walkers29(c, T, dist, list, o = {}) {
  list.forEach(([wi, dx], i) => { const d = dist + dx, x = (o.x0 === undefined ? 0 : o.x0) + d * (o.dir || 1), y = pY29(x), h = o.h || 300;
    fig(c, wi === 'S' ? SELLER29 : YOUTHS[wi], { x, y, h, dir: o.dir || 1, t: T + i, light: o.light || 1, wind: 0.5, walk: o.still ? null : stepOf(Math.abs(d), h) + i * 0.31, ink: 0.7, lantern: o.lantern === i }); });
  if (o.dog !== undefined) { const d = dist + o.dog, x = (o.x0 || 0) + d * (o.dir || 1); const ds = 0.0032 * (o.h || 300); dog29(c, x, pY29(x) + 2, ds, T, { dir: o.dir || 1, walk: o.still ? null : dogStep(Math.abs(d), ds), light: o.light || 1 }); }
}

// ---------- the temple of the city: a portico, the idol on its pedestal, braziers, worshippers bowed toward it; the young men apart
const TFY29 = 1330;
function temple29(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx || 540, o.cy || 1150);
  const dim = o.dim || 0;
  sky0(c, skyStops('gold', 'dusk', 0.5 + 0.4 * dim));
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 180, TFY29 - 520, 560, '#ffb070', 0.32); c.restore(); sun(c, 180, TFY29 - 540, 40, '#ffd0a0', 0.8);
  wisps(c, T, TFY29 - 1000, 5, '#fff0dc', 0.1, SEED29 + 50, 5);
  par(c, 0.08, 0, 0, () => { ridgeW(c, TFY29 - 380, 90, 0.003, SEED29 + 51, '#9a849a'); hazeW(c, TFY29 - 340, 220, '#f2c0a0', 0.5);
    const r = rng(SEED29 + 52); for (let x = -500; x < 1600; x += 70 + r() * 40) house(c, x, TFY29 - 300 + r() * 30, 60 + r() * 50, 50 + r() * 50, mix('#d4b28a', '#8a6a52', r() * 0.4), { lamp: 0.2, t: T + 100 + x * 0.01 });
    hazeW(c, TFY29 - 260, 140, '#f0c0a0', 0.4); });
  // the temple at the right: stepped podium, columns, architrave, pediment; the idol between the middle columns
  const stoneC = mix('#d2b48c', '#4a3a3a', dim * 0.5);
  ashlar(c, 520, TFY29 - 120, 1500, TFY29 + 4, mix(stoneC, '#6a5040', 0.2), SEED29 + 53);
  for (let k = 0; k < 4; k++) { c.fillStyle = mix(stoneC, k % 2 ? '#000000' : '#fff0d8', 0.12); c.fillRect(540 + k * 20, TFY29 - 120 + k * 30, 1000, 30); }
  const colX = [620, 760, 1020, 1160];
  colX.forEach(x => column(c, x, TFY29 - 120, 52, 520, mix(stoneC, '#fff0d8', 0.08), { band: mix(GOLD, '#3a3430', dim) }));
  c.fillStyle = mix(stoneC, '#000000', 0.15); c.fillRect(560, TFY29 - 690, 700, 56); c.fillStyle = mix(stoneC, '#fff0d8', 0.3); c.fillRect(560, TFY29 - 690, 700, 8);
  c.fillStyle = mix(stoneC, '#000000', 0.05); c.beginPath(); c.moveTo(560, TFY29 - 690); c.lineTo(910, TFY29 - 860); c.lineTo(1260, TFY29 - 690); c.closePath(); c.fill();
  c.strokeStyle = mix(stoneC, '#000000', 0.35); c.lineWidth = 4; c.stroke();
  c.fillStyle = 'rgba(30,18,12,0.55)'; c.fillRect(800, TFY29 - 630, 200, 510); // the dark cella behind the idol
  const pTop = TFY29 - 120; pedestal21(c, 890, pTop, 0.5, '#8a7058', dim);
  baal(c, 890, pTop - 92, 0.62, T, { fire: o.fire === undefined ? 1 : o.fire, dim });
  brazier(c, 700, TFY29 + 6, 0.8, T, o.fire === undefined ? 1 : o.fire, SEED29 + 54); brazier(c, 1100, TFY29 + 6, 0.8, T, o.fire === undefined ? 1 : o.fire, SEED29 + 55);
  flagFloor(c, TFY29, 700, mix('#b89a72', '#3a3434', dim * 0.5), { sheen: 0.12, sheenX: 880, sheenCol: '#ff9a50' });
  // worshippers bowed toward the idol (they face right)
  const r = rng(SEED29 + 56), bow = o.bow === undefined ? 1 : o.bow;
  [[1390, 380, 700, 4], [1450, 360, 720, 4], [1520, 340, 740, 3]].forEach(([y, x0, x1, n], row) => { for (let i = 0; i < n; i++) { const x = lerp(x0, x1, (i + 0.5) / n) + (r() - 0.5) * 30, h = 200 + (y - TFY29) * 0.9, who = (SODOM || FOLK)[(row * 3 + i) % 8];
    const b = clamp(bow * 1.2 - r() * 0.2); const base = { x, y, h, t: T + i, light: 0.8, wind: 0.2, ink: 0.7, dir: 1 };
    if (b >= 1) fig(c, who, Object.assign(base, { pose: 'prostrate' })); else if (b > 0.5) fig(c, who, Object.assign(base, { pose: 'kneel' })); else lean(c, x, y, 0.6 * ease(b * 2), () => fig(c, who, base)); } });
  if (o.youths) o.youths(c);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// the young men standing at the left of the court (they do not bow); rise 0..1 = they step forward and stand up straight, armUp = they declare
const YT29 = [[70, 1420, 0], [175, 1440, 1], [270, 1470, 2], [110, 1505, 3], [215, 1530, 4]];
function youthsAt29(c, T, o = {}) {
  YT29.forEach(([x, y, wi], i) => { const h = 200 + (y - TFY29) * 0.9, step = (o.step || 0) * 60;
    fig(c, YOUTHS[wi], { x: x + step, y, h, dir: o.dir === undefined ? 1 : o.dir, t: T + i, light: 1.05, wind: 0.4, ink: 0.7, walk: o.walking ? stepOf(step, h) + i * 0.3 : null, armUp: i === 2 ? (o.armUp || 0) : 0, reach: i !== 2 ? (o.reach || 0) * (i % 2 ? 0.6 : 0) : 0, dua: !!o.dua && i !== 2 }); });
}

// ---------- the market (on waking): arcade of shops, stalls, passers-by; the seller behind his counter
const MFY29 = 1300;
function market29(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx || 540, o.cy || 1150);
  sky0(c, skyStops('day', 'gold', 0.3));
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 860, 600, 600, '#fff0c8', 0.25); c.restore();
  par(c, 0.06, 0, 0, () => { ridgeW(c, MFY29 - 520, 100, 0.003, SEED29 + 60, '#9aa0b8'); hazeW(c, MFY29 - 480, 220, '#f6e2c8', 0.5);
    const r = rng(SEED29 + 61); for (let x = -500; x < 1600; x += 80 + r() * 40) house(c, x, MFY29 - 420 + r() * 20, 70 + r() * 50, 70 + r() * 70, mix('#e2c8a0', '#a8886a', r() * 0.4), { lamp: 0, t: T + 100 });
    // a dome and a cross-shaped roof would be anachronistic guesses: only plain houses and a colonnade
    hazeW(c, MFY29 - 380, 120, '#f6e2c8', 0.4); });
  // the arcade: a stone wall with arched shop fronts
  const st = '#c8aa84'; ashlar(c, -900, MFY29 - 430, W + 900, MFY29 + 4, st, SEED29 + 62);
  for (let i = -4; i < 10; i++) { const x = i * 200 + 40; c.fillStyle = 'rgba(28,16,10,0.75)'; c.beginPath(); c.moveTo(x, MFY29); c.lineTo(x, MFY29 - 250); c.arc(x + 70, MFY29 - 250, 70, Math.PI, 0); c.lineTo(x + 140, MFY29); c.closePath(); c.fill();
    c.strokeStyle = mix(st, '#fff0d8', 0.3); c.lineWidth = 6; c.beginPath(); c.arc(x + 70, MFY29 - 250, 76, Math.PI, 0); c.stroke();
    c.fillStyle = 'rgba(255,200,120,0.18)'; c.fillRect(x + 20, MFY29 - 200, 100, 120); }
  c.fillStyle = mix(st, '#000000', 0.15); c.fillRect(-900, MFY29 - 452, W + 1800, 30); c.fillStyle = mix(st, '#fff0d8', 0.3); c.fillRect(-900, MFY29 - 452, W + 1800, 6);
  if (o.awn !== false) awning(c, -60, 420, MFY29 - 300, T);
  flagFloor(c, MFY29, 540, '#b8a07a', { sheen: 0.14, sheenX: 800 });
  // passers-by crossing behind (they enter from the edges; steps driven by the distance)
  const q = o.q || 0;
  [[1390, -1, 1250, 34, 0], [1420, 1, -180, 40, 3], [1460, -1, 1400, 30, 5]].forEach(([y, d, x0, v, fi], i) => { const dist = v * q, x = x0 + d * dist, h = 60 + (y - MFY29) * 2.1 + 150;
    if (x > -200 && x < W + 200) fig(c, FOLK[fi], { x, y, h, dir: d, t: T + i, light: 0.9, ink: 0.7, walk: stepOf(dist, h) + i * 0.4 }); });
  // the stall and the seller behind it
  const sx = 700, sy = 1560, ss = 1.15;
  if (o.seller !== false) { const so = { x: sx + 20, y: sy - 40, h: 460, dir: -1, t: T, light: 1, wind: 0.2, ink: 0.7, reach: o.sReach || 0 };
    lean(c, so.x, so.y, (o.recoil || 0) * 0.12, () => fig(c, SELLER29, so)); }
  stall(c, sx, sy, 380, ss, T, { cloth: '#2e5a6a', cloth2: '#efe2c4' });
  if (o.coinOn) coin29(c, sx - 130, sy - 120 * ss - 6, 16, T, { flat: true });
  if (o.youth !== false) { const yx = o.yx === undefined ? 330 : o.yx, yy = 1700, h = 520;
    fig(c, YOUTHS[0], { x: yx, y: yy, h, dir: 1, t: T, light: 1.05, wind: 0.3, ink: 0.7, reach: o.yReach || 0, walk: o.yWalk === undefined ? null : o.yWalk });
    if (o.yReach > 0.5 && !o.coinOn) { const [hx, hy] = handOf({ x: yx, y: yy, h, dir: 1, reach: o.yReach }); coin29(c, hx + 6, hy - 10, 12, T, {}); } }
  if (o.fg !== false) blurLayer(c, 8, bc => { jar(bc, 60, 2010, 2.6, '#9a5a30'); sack(bc, 1060, 2020, 2.4, '#b8a07a'); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// ---------- the silver coin (wariq, Al-Kahf 19): crown, inscription of an old king (the exegetes), worn rim; no face on it
function coin29(c, x, y, r, T, o = {}) {
  c.save(); c.translate(x, y); if (o.flat) c.scale(1, 0.45);
  if (o.shadow !== false) { c.fillStyle = 'rgba(10,6,4,0.4)'; c.beginPath(); c.ellipse(r * 0.12, r * 0.18, r * 1.04, r * 1.0, 0, 0, 6.283); c.fill(); }
  const g = c.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.05); g.addColorStop(0, '#f4f4f0'); g.addColorStop(0.5, '#b8b8b4'); g.addColorStop(1, '#6a6a66');
  c.fillStyle = g; c.beginPath(); for (let i = 0; i <= 48; i++) { const an = i / 48 * 6.283, rr = r * (1 + 0.025 * Math.sin(i * 2.3) + 0.015 * Math.sin(i * 5.1)); i ? c.lineTo(Math.cos(an) * rr, Math.sin(an) * rr) : c.moveTo(rr, 0); } c.closePath(); c.fill();
  c.strokeStyle = 'rgba(60,60,58,0.7)'; c.lineWidth = r * 0.06; c.beginPath(); c.arc(0, 0, r * 0.86, 0, 6.283); c.stroke();
  if (r > 30) { // detail only when seen close
    c.strokeStyle = 'rgba(70,70,66,0.55)'; c.lineWidth = r * 0.02; for (let i = 0; i < 60; i++) { const an = i / 60 * 6.283; c.beginPath(); c.moveTo(Math.cos(an) * r * 0.9, Math.sin(an) * r * 0.9); c.lineTo(Math.cos(an) * r * 0.97, Math.sin(an) * r * 0.97); c.stroke(); }
    // crown in relief
    const cr = (dx, dy, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(-r * 0.42 + dx, r * 0.12 + dy); c.lineTo(-r * 0.42 + dx, -r * 0.22 + dy); c.lineTo(-r * 0.24 + dx, -r * 0.04 + dy); c.lineTo(-r * 0.1 + dx, -r * 0.34 + dy); c.lineTo(0 + dx, -r * 0.06 + dy);
      c.lineTo(r * 0.1 + dx, -r * 0.34 + dy); c.lineTo(r * 0.24 + dx, -r * 0.04 + dy); c.lineTo(r * 0.42 + dx, -r * 0.22 + dy); c.lineTo(r * 0.42 + dx, r * 0.12 + dy); c.closePath(); c.fill(); };
    cr(r * 0.02, r * 0.025, 'rgba(50,50,48,0.55)'); cr(-r * 0.012, -r * 0.012, 'rgba(255,255,250,0.55)'); cr(0, 0, '#a8a8a2');
    c.fillStyle = '#9a9a94'; c.fillRect(-r * 0.42, r * 0.14, r * 0.84, r * 0.1);
    // inscription around the rim (an old name; letters worn)
    c.save(); c.font = `600 ${r * 0.2}px Lora`; c.fillStyle = 'rgba(60,60,56,0.75)'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const txt = 'ΔΕΚΙΟΣ · ΒΑΣΙΛΕΥΣ · '; for (let i = 0; i < txt.length; i++) { const an = -Math.PI * 0.95 + i / txt.length * Math.PI * 1.9; c.save(); c.rotate(an + Math.PI / 2); c.fillText(txt[i], 0, -r * 0.7); c.restore(); }
    c.restore();
    c.fillStyle = 'rgba(70,74,60,0.25)'; const rr = rng(SEED29 + 70); for (let i = 0; i < 30; i++) { c.beginPath(); c.arc((rr() - 0.5) * r * 1.5, (rr() - 0.5) * r * 1.5, r * (0.02 + rr() * 0.06), 0, 6.283); c.fill(); } // patina
  }
  if (o.glint) { c.save(); c.globalCompositeOperation = 'lighter'; const gx = lerp(-r * 1.2, r * 1.2, o.glint); const gg = c.createLinearGradient(gx - r * 0.3, -r, gx + r * 0.3, r);
    gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.5, 'rgba(255,255,250,0.5)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gg; c.beginPath(); c.arc(0, 0, r, 0, 6.283); c.fill(); c.restore(); }
  c.restore();
}
// the coin in the palm of an open hand, seen close over the wooden counter
function coinClose29(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, 540, 1000);
  const wg = c.createLinearGradient(0, 0, 0, H); wg.addColorStop(0, '#5a3a22'); wg.addColorStop(1, '#2a1a10'); c.fillStyle = wg; c.fillRect(-600, -600, W + 1200, H + 1200);
  c.strokeStyle = 'rgba(20,10,4,0.4)'; c.lineWidth = 3; for (let i = -10; i < 40; i++) { c.beginPath(); c.moveTo(-600, i * 70); for (let x = -600; x < W + 600; x += 40) c.lineTo(x, i * 70 + Math.sin(x * 0.006 + i) * 12 + noise1(x * 0.01, i) * 10); c.stroke(); }
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 640, 760, 700, '#ffe0b0', 0.25); c.restore();
  // the open palm (cupped, from below) holding the coin
  const sk = '#b07a58'; c.save(); c.translate(540, 1150);
  c.fillStyle = YOUTHS[0].robe; c.beginPath(); c.moveTo(-700, 500); c.quadraticCurveTo(-420, 300, -230, 260); c.lineTo(-170, 420); c.quadraticCurveTo(-400, 560, -700, 700); c.closePath(); c.fill(); // sleeve
  const hg = c.createLinearGradient(-200, -100, 250, 300); hg.addColorStop(0, mix(sk, '#ffe0c0', 0.25)); hg.addColorStop(1, mix(sk, '#000000', 0.25)); c.fillStyle = hg;
  c.beginPath(); c.moveTo(-230, 260); c.quadraticCurveTo(-300, 40, -120, -40); c.quadraticCurveTo(60, -90, 230, -20); c.quadraticCurveTo(300, 20, 260, 80); c.quadraticCurveTo(200, 200, 40, 300); c.quadraticCurveTo(-100, 400, -170, 420); c.closePath(); c.fill();
  c.strokeStyle = mix(sk, '#000000', 0.4); c.lineWidth = 4; c.stroke();
  [[-90, -60, 0.2], [10, -80, 0.0], [110, -70, -0.15], [200, -40, -0.35]].forEach(([fx, fy, an]) => { c.save(); c.translate(fx, fy); c.rotate(an); c.fillStyle = mix(sk, '#000000', 0.08); c.beginPath(); c.roundRect(-34, -120, 68, 150, 34); c.fill(); c.strokeStyle = mix(sk, '#000000', 0.35); c.lineWidth = 3; c.stroke(); c.restore(); });
  c.fillStyle = mix(sk, '#000000', 0.18); c.beginPath(); c.ellipse(-210, 120, 60, 120, 0.6, 0, 6.283); c.fill(); // thumb
  c.strokeStyle = mix(sk, '#000000', 0.3); c.lineWidth = 3; c.beginPath(); c.moveTo(-140, 60); c.quadraticCurveTo(0, 0, 160, 40); c.moveTo(-120, 160); c.quadraticCurveTo(0, 120, 120, 150); c.stroke(); // palm lines
  c.restore();
  coin29(c, 600, 1080, 150, T, { glint: o.glint, shadow: true });
  c.setTransform(1, 0, 0, 1, 0, 0);
  const vg = c.createRadialGradient(540, 1100, 400, 540, 1100, 1200); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
}

// ---------- "how many were they?" (Al-Kahf 22): standing silhouettes in the light of the mouth; n = 3, 5 or 7, and the dog
function count29(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx || 560, o.cy || 1100);
  outside29(c, T, { sky: 'dawn', to: 'gold', k: 0.4, sunA: 0.6, sunX: 560, sunY: 1000 });
  c.save(); c.beginPath(); c.rect(-900, -900, W + 1800, H + 1800); mouthPath29(c); c.fillStyle = '#0c0907'; c.fill('evenodd'); c.restore();
  c.save(); c.strokeStyle = '#ffd8a8'; c.globalAlpha = 0.5; c.lineWidth = 10; c.filter = 'blur(5px)'; c.beginPath(); mouthPath29(c); c.stroke(); c.restore();
  c.fillStyle = '#100c0a'; c.fillRect(-900, caveFloorY, W + 1800, H + 900);
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 560, caveFloorY + 20, 420, '#ffd8a8', 0.25); c.restore();
  const n = o.n || 0, sp = 74, x0 = 560 - (n - 1) * sp / 2;
  for (let i = 0; i < n; i++) { const k = o.grow === undefined ? 1 : clamp(o.grow * n - i); if (k <= 0) continue;
    fig(c, YOUTHS[i % 7], { x: x0 + i * sp, y: caveFloorY, h: 300, dir: i % 2 ? -1 : 1, t: T + i, light: 0.05, wind: 0.3, ink: 0.3, alpha: k }); }
  if (n) dog29(c, x0 + n * sp + 40, caveFloorY, 0.5, T, { pose: 'stand', dir: -1, light: 0.05, alpha: o.grow === undefined ? 1 : clamp(o.grow * n - n + 1) });
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// the years counter (0 -> 309): a big number, a ring that fills
function yearCount29(c, n, a, y = 300, plus = 0) { if (a <= 0) return; topShade(c, a * 1.4);
  const v = Math.max(1, Math.round(n)); textS(c, String(v), y, a, '700 190px Lora', 190, '#f6c453', 28); bigWord(c, 'ANS', y + 130, a, 64);
  c.save(); c.globalAlpha = a; c.strokeStyle = 'rgba(246,196,83,0.35)'; c.lineWidth = 8; c.beginPath(); c.arc(W / 2, y + 30, 210, 0, 6.283); c.stroke();
  c.strokeStyle = '#f6c453'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.arc(W / 2, y + 30, 210, -Math.PI / 2, -Math.PI / 2 + 6.283 * clamp(n / 309)); c.stroke(); c.restore(); }

function ctaText29(c, a) {
  if (a <= 0) return;
  overlayBox(c, 80, 320, 920, 450, a);
  textGlow(c, 'Quelle histoire du Coran', W / 2, 410, '700 62px Lora', '#fff6e0', a, '#000', 12);
  textGlow(c, 'veux-tu pour le', W / 2, 490, '700 62px Lora', '#fff6e0', a, '#000', 12);
  textGlow(c, 'prochain épisode ?', W / 2, 570, '700 62px Lora', '#fff6e0', a, '#000', 12);
  textGlow(c, 'Dis-le en commentaire', W / 2, 680, 'italic 500 54px Lora', '#f6c453', a, '#000', 12);
}
const hero29 = (c, T, o = {}) => cave29(c, T, Object.assign({}, HERO29, o));
// =====================================================================================================================
// ---------- episode 30: Dhul-Qarnayn and the wall of iron and copper (Al-Kahf 83-98) · « Histoires du Coran »
// Dhul-Qarnayn is a believing, just king for most scholars (his prophethood and his identity are discussed): faceless, no veil
// of light. Ya'juj and Ma'juj are NEVER drawn: only darkness, storm and dust beyond the gap. Allah is never depicted.
const KING30 = { robe: '#22385e', wrap: '#f2ead8', skin: '#a8714f', trim: '#e0b85a', band: '#e0b85a', inner: '#efe6d0' };
const MEN30 = [
  { robe: '#5a3a28', wrap: '#e6dcc6', skin: '#a8714f', trim: '#c9a35a' }, { robe: '#2e4a52', wrap: '#ece2cc', skin: '#94664a', trim: '#b8a070' },
  { robe: '#6a4a2a', wrap: '#dccdb0', skin: '#b4805c' }, { robe: '#3a3a5a', wrap: '#efe6d4', skin: '#9a6a4c', trim: '#c9a35a' },
  { robe: '#4a5a3a', wrap: '#e2d4b8', skin: '#c48e66' }, { robe: '#7a4430', wrap: '#e8dcc4', skin: '#8f5f42', trim: '#d8b45a' }];
const GAPFOLK = [ // the people between the two mountains: rough wool, felt, furs
  { robe: '#6a5442', wrap: '#c8b89e', skin: '#b48a6a', band: '#8a5a3a' }, { robe: '#4e4038', wrap: '#d2c2a4', skin: '#c49878' },
  { robe: '#7a5e3e', wrap: '#bcae96', skin: '#a8805e', trim: '#9a7a4a' }, { robe: '#5a4a46', wrap: '#d8ccb4', skin: '#b88c68', covered: true },
  { robe: '#3e4a46', wrap: '#c4b49a', skin: '#c09070' }, { robe: '#6e4a3a', wrap: '#ccbca0', skin: '#a87a58', band: '#5a3a2a' }];
const WESTFOLK = [{ robe: '#3a2e2a', wrap: '#b8a88c', skin: '#8a5a3e' }, { robe: '#4a3a2a', wrap: '#c4b498', skin: '#7a5038' }, { robe: '#2e2a2e', wrap: '#a89c88', skin: '#8f5f42', covered: true }, { robe: '#5a402a', wrap: '#bcac90', skin: '#7e5238' }];
const EASTFOLK = [{ robe: '#c8b48a', wrap: '#efe4cc', skin: '#7a4a30' }, { robe: '#b89a6a', wrap: '#e8dcc0', skin: '#6e4228' }, { robe: '#d0bc94', wrap: '#f2e8d2', skin: '#83533a', covered: true }];
function seriesTag30(c, a) { textGlow(c, 'HISTOIRES DU CORAN  ·  ÉPISODE 30', W / 2, 112, '600 32px Lora', '#fbe7c6', a * 0.92, '#000000', 12); }
function ctaText30(c, a) { ctaText29(c, a); }
const SEED30 = 3000;

// ---------- a little flame (fire pits of the forge): layered tongues, additive glow
function flame30(c, x, y, s, T, k = 1) { if (k <= 0) return; T += 100;
  c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha *= clamp(k);
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -30, 220, '#ff6a20', 0.45 + 0.08 * Math.sin(T * 11)); c.restore();
  [['#ff5a16', 46, 120], ['#ff9a30', 32, 92], ['#ffe08a', 16, 54]].forEach(([col, w, h], i) => { c.fillStyle = col; c.beginPath(); c.moveTo(-w, 0);
    c.quadraticCurveTo(-w * 0.8 + Math.sin(T * 9 + i) * 8, -h * 0.6, Math.sin(T * 7 + i) * 10, -h - Math.sin(T * 13 + i) * 12);
    c.quadraticCurveTo(w * 0.8 + Math.sin(T * 8 + i) * 8, -h * 0.6, w, 0); c.closePath(); c.fill(); });
  c.restore();
}
// ---------- a leather bellows (pumped: k 0..1 squash), nozzle toward +x
function bellows30(c, x, y, s, T, o = {}) {
  const sq = o.pump ? 0.5 + 0.5 * Math.sin(T * 5 + (o.ph || 0)) : 0.6, d = o.dir || 1;
  c.save(); c.translate(x, y); c.scale(s * d, s);
  c.fillStyle = 'rgba(10,6,4,0.35)'; c.beginPath(); c.ellipse(10, 2, 110, 12, 0, 0, 6.283); c.fill();
  c.strokeStyle = '#2a1a10'; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(70, -26); c.lineTo(140, -16); c.stroke(); // clay nozzle
  const hgt = 30 + 34 * sq;
  const g = c.createLinearGradient(0, -hgt - 10, 0, 0); g.addColorStop(0, '#8a5a36'); g.addColorStop(1, '#4a2e1a');
  c.fillStyle = g; c.beginPath(); c.moveTo(-90, -6); c.quadraticCurveTo(-96, -hgt, -40, -hgt - 6); c.quadraticCurveTo(30, -hgt - 4, 76, -26); c.quadraticCurveTo(40, -4, -90, -6); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(20,10,4,0.5)'; c.lineWidth = 2.5; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(-80 + k * 6, -8); c.quadraticCurveTo(-70 + k * 22, -hgt * (1 - k * 0.12), -30 + k * 26, -hgt * 0.4); c.stroke(); }
  c.fillStyle = '#6a4a2a'; c.save(); c.translate(-20, -hgt - 4); c.rotate(-0.05 + 0.1 * (1 - sq)); c.fillRect(-70, -6, 130, 10); c.fillStyle = '#3a2414'; c.fillRect(-82, -12, 18, 18); c.restore(); // top board, handle
  c.fillStyle = 'rgba(255,200,140,0.18)'; c.beginPath(); c.ellipse(-30, -hgt * 0.7, 30, 8, -0.1, 0, 6.283); c.fill();
  c.restore();
}
// ---------- stacked iron blocks (raw material), a pile on the ground
function ironPile30(c, x, y, s, n = 9, seed = 1, heat = 0) { const r = rng(seed); c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.35)'; c.beginPath(); c.ellipse(0, 2, 150, 16, 0, 0, 6.283); c.fill();
  const rows = [[5, 0], [4, 1], [3, 2], [2, 3]]; let i = 0;
  rows.forEach(([m, row]) => { for (let k = 0; k < m && i < n; k++, i++) { const bx = (k - (m - 1) / 2) * 56 + (r() - 0.5) * 6, by = -row * 30;
    const col = mix('#3a3c44', '#5a5c66', r()); c.fillStyle = mix(col, '#ff5a1e', heat * 0.6); c.fillRect(bx - 26, by - 28, 52, 28);
    c.fillStyle = 'rgba(200,210,230,0.25)'; c.fillRect(bx - 26, by - 28, 52, 4); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(bx - 26, by - 4, 52, 4); c.fillRect(bx + 22, by - 28, 4, 28); } });
  c.restore(); }
// ---------- the tribute they offered (Al-Kahf 94): a rug, heaps of gold coins, two open chests; k = gleam
function tribute30(c, x, y, s, T, k = 0) { c.save(); c.translate(x, y); c.scale(s, s);
  rug(c, 0, 0, 320, 70, '#7a2a22');
  const r = rng(SEED30 + 70); const heap = (hx, hy, w, h) => { for (let i = 0; i < 70; i++) { const u = r() * 2 - 1, v = r(), px = hx + u * w * (1 - v * 0.7), py = hy - v * h + Math.abs(u) * h * 0.3;
    c.fillStyle = mix('#c8962a', '#ffe08a', r()); c.beginPath(); c.ellipse(px, py, 9, 4.5, (r() - 0.5) * 0.6, 0, 6.283); c.fill(); c.strokeStyle = 'rgba(90,50,10,0.5)'; c.lineWidth = 1; c.stroke(); } };
  heap(-40, -8, 90, 46); heap(70, -4, 60, 30);
  [[-150, 6, 0.42], [160, 10, 0.38]].forEach(([cx, cy, cs]) => chest27(c, cx, cy, cs, 0, T));
  [[-150, -36], [160, -30]].forEach(([hx, hy]) => { for (let i = 0; i < 16; i++) { c.fillStyle = mix('#d8a83a', '#fff0a0', r()); c.beginPath(); c.ellipse(hx + (r() - 0.5) * 50, hy + (r() - 0.5) * 10, 8, 4, 0, 0, 6.283); c.fill(); } });
  if (k > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -30, 260, '#ffd070', 0.35 * k); c.restore(); }
  c.restore(); }

// ---------- the open plain (road, west, east): sky, low ranges, a horizon, the near ground pgY30 where people walk
const HZ30 = 1180;
const pgY30 = x => 1600 + Math.sin(x * 0.0042 + 0.6) * 16 - (x - 540) * 0.015;
function bigSun30(c, x, y, r, col, a = 1) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y, r * 6, col, 0.32 * a); glow(c, x, y, r * 2.4, '#fff0c8', 0.3 * a); c.restore();
  c.save(); c.globalAlpha *= a; const g = c.createRadialGradient(x - r * 0.2, y - r * 0.2, 0, x, y, r); g.addColorStop(0, '#fff6dc'); g.addColorStop(0.7, mix(col, '#fff6dc', 0.5)); g.addColorStop(1, col); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); c.restore(); }
function plain30(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx || 540, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 8) : [0, 0]));
  const nt = o.night || 0, px = o.px || 0;
  sky0(c, skyStops(o.sky || 'gold', o.to, o.k || 0));
  if (o.stars) stars(c, T, 140, SEED30 + 1, [-500, -300, W + 1000, 1100], o.stars);
  const sx = o.sunX === undefined ? 540 : o.sunX, sy = o.sunY === undefined ? 900 : o.sunY;
  if (o.sunA) bigSun30(c, sx, sy, o.sunR || 60, o.sunCol || '#ffb070', o.sunA * (o.dry && !o.sunCol ? 1 : 1));
  if (o.horns) { c.save(); c.globalCompositeOperation = 'lighter'; [[-200, '#ff9a5a'], [1280, '#ffe0a0']].forEach(([hx, col]) => { glow(c, hx, HZ30 - 40, 700, col, 0.5 * o.horns); }); c.restore();
    rays(c, -200, HZ30 - 40, -0.25, 0.8, 1300, 10, '#ffd8a0', 0.08 * o.horns, T, SEED30 + 2); rays(c, 1280, HZ30 - 40, Math.PI + 0.25, 0.8, 1300, 10, '#fff0c8', 0.08 * o.horns, T, SEED30 + 3); }
  cloudBank(c, T, 380, 5, mix('#ffe6c8', '#22243c', nt), 0.14, SEED30 + 4, 6);
  const hz = mix(o.haze || '#f2c8a0', '#1e2440', nt);
  par(c, -0.92, px, 0, () => { ridgeW(c, HZ30 - 40, 70, 0.003, SEED30 + 5, mix(o.far || '#9a8aa8', '#121628', nt)); hazeW(c, HZ30 - 10, 200, hz, 0.55); });
  par(c, -0.7, px, 0, () => {
    // the land toward the horizon
    const lc = mix(o.dry ? '#d8b888' : '#b0906a', '#1a1820', nt * 0.8);
    const g = c.createLinearGradient(0, HZ30 - 20, 0, 1500); g.addColorStop(0, mix(lc, hz, 0.6)); g.addColorStop(1, lc); c.fillStyle = g; c.fillRect(-2600, HZ30 - 22, 6300, 700);
    if (o.sunA && sy > HZ30 - 160 && !o.marsh) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, sx, HZ30, 500, o.sunCol || '#ffb070', 0.25 * o.sunA); c.restore(); }
    if (o.marsh) marsh30(c, T, sx, o);
    if (o.huts) huts30(c, T, nt);
    if (o.dry) { c.strokeStyle = hexA(mix('#8a6a48', '#000000', nt), 0.35); c.lineWidth = 2; const r = rng(SEED30 + 6); // cracked dry ground
      for (let i = 0; i < 90; i++) { const y0 = HZ30 + 30 + Math.pow(r(), 0.8) * 420, k = (y0 - HZ30) / 420, x0 = -400 + r() * 1900; c.beginPath(); c.moveTo(x0, y0); for (let j = 0; j < 4; j++) c.lineTo(x0 + (r() - 0.5) * 120 * (0.3 + k), y0 + (r() - 0.5) * 20 * (0.3 + k)); c.stroke(); } }
    if (!o.marsh && !o.dry) { const ra = rng(SEED30 + 9); for (let i = 0; i < 14; i++) { const x = -1400 + i * 300 + ra() * 160, y = HZ30 + 30 + ra() * 90, k = 0.35 + (y - HZ30) / 260;
      if (i % 3 === 0) rock(c, x, y, 120 * k, 70 * k, mix('#9a7a62', '#141218', nt * 0.8), SEED30 + 10 + i); else acacia(c, x, y, 0.5 * k, mix('#4a5a32', '#0e120e', nt * 0.8), T); } }
    if (o.dry) { const ra = rng(SEED30 + 11); for (let i = 0; i < 8; i++) { const x = -1200 + i * 420 + ra() * 200, y = HZ30 + 40 + ra() * 70, k = 0.4 + (y - HZ30) / 260; rock(c, x, y, 140 * k, 50 * k, mix('#c8a478', '#141218', nt * 0.8), SEED30 + 20 + i); } }
    hazeW(c, HZ30 + 140, 160, hz, 0.25);
  });
  par(c, 0, px, 0, () => { // near ground
    const cc = mix(o.dry ? '#d2ae7a' : '#a88a62', '#16141c', nt * 0.82);
    const g = c.createLinearGradient(0, 1500, 0, H + 200); g.addColorStop(0, mix(cc, '#fff0d0', 0.14 * (1 - nt))); g.addColorStop(0.4, cc); g.addColorStop(1, mix(cc, '#140c06', 0.5));
    c.fillStyle = g; c.beginPath(); c.moveTo(-2600, H + 900); for (let x = -2600; x <= 3800; x += 16) c.lineTo(x, pgY30(x)); c.lineTo(3800, H + 900); c.closePath(); c.fill();
    c.strokeStyle = hexA(mix(cc, '#fff2d8', 0.4), 0.35 * (1 - nt * 0.7)); c.lineWidth = 3; c.beginPath(); for (let x = -2600; x <= 3800; x += 16) x === -2600 ? c.moveTo(x, pgY30(x) + 1) : c.lineTo(x, pgY30(x) + 1); c.stroke();
    const r = rng(SEED30 + 7); for (let i = 0; i < 160; i++) { const x = -1500 + r() * 4200, y = pgY30(x) + 8 + Math.pow(r(), 1.5) * 380, k = 0.6 + (y - pgY30(x)) / 300;
      if (!o.dry && r() > 0.65) shrub(c, x, y, 0.32 * k, mix('#6a6a3a', '#101410', nt), T, SEED30 + 8 + i); else { c.fillStyle = mix(o.dry ? '#a88a60' : '#8a7458', '#14121a', nt * 0.8); c.beginPath(); c.ellipse(x, y, 8 * k, 4 * k, 0, 0, 6.283); c.fill(); } }
    if (o.walkers) o.walkers(c);
  });
  if (o.heat) { c.save(); c.globalAlpha = 0.12 * o.heat; c.fillStyle = '#fff4d8'; for (let i = 0; i < 6; i++) { const y = HZ30 + 20 + i * 40; c.beginPath(); c.moveTo(-600, y); for (let x = -600; x <= 1700; x += 30) c.lineTo(x, y + Math.sin(x * 0.03 + T * 3 + i) * 4); c.lineTo(1700, y + 12); c.lineTo(-600, y + 12); c.fill(); } c.restore(); }
  if (o.fg !== false) blurLayer(c, 9, bc => fgBrush(bc, T, { col: mix(o.dry ? '#9a7a40' : '#6a5a30', '#0c0c10', nt * 0.8), stone: mix('#7a6450', '#141218', nt * 0.8) }), 3);
  if (nt > 0) { c.fillStyle = `rgba(6,10,30,${0.25 * nt})`; c.fillRect(-900, -900, W + 1800, H + 1800); }
  if (o.after) o.after(c);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// the dark, muddy spring where the sun seemed to set (Al-Kahf 86: « une source boueuse et noire »)
function marsh30(c, T, sx, o) {
  const top = HZ30 - 6, bot = 1430, nt = o.night || 0;
  c.save(); c.beginPath(); c.moveTo(-1400, top); for (let x = -1400; x <= 2600; x += 30) c.lineTo(x, top + noise1(x * 0.004, 11) * 10); for (let x = 2600; x >= -1400; x -= 30) c.lineTo(x, bot - 60 - noise1(x * 0.003, 12) * 90 - Math.max(0, 1 - Math.abs(x - sx) / 900) * 40); c.closePath();
  const g = c.createLinearGradient(0, top, 0, bot); g.addColorStop(0, '#3a2a22'); g.addColorStop(0.5, '#22180f'); g.addColorStop(1, '#140e08'); c.fillStyle = g; c.fill(); c.clip();
  if (o.sunA) { c.save(); c.globalCompositeOperation = 'lighter'; const rg = c.createLinearGradient(sx - 140, 0, sx + 140, 0); rg.addColorStop(0, 'rgba(255,120,60,0)'); rg.addColorStop(0.5, `rgba(255,140,70,${0.55 * o.sunA})`); rg.addColorStop(1, 'rgba(255,120,60,0)');
    c.fillStyle = rg; for (let i = 0; i < 26; i++) { const y = top + 4 + i * 11, w = (60 + i * 7) * (0.7 + 0.3 * Math.sin(T * 2 + i * 1.7)); c.fillRect(sx - w, y, w * 2, 4 + i * 0.12); } c.restore();
    c.save(); c.globalCompositeOperation = 'lighter'; glow(c, sx, top + 10, 380, '#ff7a3a', 0.35 * o.sunA); c.restore(); }
  const r = rng(SEED30 + 20); c.fillStyle = 'rgba(80,60,40,0.5)'; // mud islets and slick
  for (let i = 0; i < 30; i++) { const x = -800 + r() * 2600, y = top + 20 + r() * (bot - top - 80); c.beginPath(); c.ellipse(x, y, 30 + r() * 80, 4 + r() * 6, 0, 0, 6.283); c.fill(); }
  c.strokeStyle = 'rgba(255,200,150,0.08)'; c.lineWidth = 2; for (let i = 0; i < 20; i++) { const x = -600 + r() * 2200, y = top + 30 + r() * 200; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 60 + r() * 80, y); c.stroke(); }
  c.restore();
  // muddy banks and reeds along the near shore
  const bc = mix('#7a6046', '#14121a', nt * 0.7), bg = c.createLinearGradient(0, bot - 140, 0, 1560); bg.addColorStop(0, mix(bc, '#2a1e14', 0.5)); bg.addColorStop(1, mix('#a88a62', '#16141c', nt * 0.82));
  c.fillStyle = bg; c.beginPath(); c.moveTo(-1400, 1560); for (let x = -1400; x <= 2600; x += 30) c.lineTo(x, bot - 56 - noise1(x * 0.003, 12) * 90 - Math.max(0, 1 - Math.abs(x - sx) / 900) * 40 + 6); c.lineTo(2600, 1560); c.closePath(); c.fill();
  reeds(c, -400, 140, 1392, 70, mix('#3a3020', '#0c0c10', nt), T, SEED30 + 21); reeds(c, 900, 1500, 1386, 80, mix('#3a3020', '#0c0c10', nt), T, SEED30 + 22);
}
function huts30(c, T, nt) { const r = rng(SEED30 + 30); // domed reed huts of the people of the west, on the far bank
  [[-80, 1300, 0.9], [60, 1290, 0.7], [880, 1296, 0.8], [1010, 1306, 1]].forEach(([x, y, s], i) => { const col = mix(mix('#7a6440', '#5a4630', r()), '#141218', nt * 0.7);
    c.fillStyle = 'rgba(10,6,4,0.35)'; c.beginPath(); c.ellipse(x, y + 2, 70 * s, 8 * s, 0, 0, 6.283); c.fill();
    c.fillStyle = col; c.beginPath(); c.moveTo(x - 64 * s, y); c.bezierCurveTo(x - 60 * s, y - 90 * s, x + 60 * s, y - 90 * s, x + 64 * s, y); c.closePath(); c.fill();
    c.strokeStyle = hexA(mix(col, '#000000', 0.4), 0.7); c.lineWidth = 2; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(x + k * 16 * s, y); c.quadraticCurveTo(x + k * 10 * s, y - 70 * s, x, y - 68 * s); c.stroke(); }
    c.fillStyle = '#140c08'; c.beginPath(); c.ellipse(x + 10 * s, y - 2, 12 * s, 24 * s, 0, Math.PI, 0); c.fill();
    if (i === 3) smoke(c, T + 100, x + 4, y - 70 * s, 6, SEED30 + 31 + i, '#5a5050', 0.2, 0.6, 40); });
}
// a marching company: list of [who, dx], who = 'K' (the king), a number (MEN30) or 'C' (a camel); feet on pgY30, steps driven by the distance
function caravan30(c, T, dist, list, o = {}) {
  const dir = o.dir || 1, x0 = o.x0 || 0, h = o.h || 280, gy = o.gy || pgY30;
  list.forEach(([wi, dx], i) => { const d = dist + dx, x = x0 + d * dir, y = gy(x);
    if (wi === 'C') { const s = h / 300 * 0.92; camel(c, x, y, s, mix('#b0845a', '#000000', (i % 3) * 0.07), camelT(Math.abs(d), s) + i * 0.6, dir, i % 2 ? '#7a3a2a' : '#3a4a6a', { walk: !o.still, head: 0 }); return; }
    const who = wi === 'K' ? KING30 : MEN30[wi % MEN30.length];
    fig(c, who, { x, y, h: wi === 'K' ? h * 1.04 : h, dir, t: T + i, light: o.light || 1, wind: 0.5, walk: o.still ? null : stepOf(Math.abs(d), h) + i * 0.31, ink: 0.7, staff: wi === 'K' || (wi % 3 === 1) }); });
}

// ---------- the gap between the two mountains, and the wall (Al-Kahf 93-98)
const GB30 = 1480, WT30 = 640; // ground at the foot of the gap, top of the finished wall
const PK30 = 250; // height of the two summits; the inner flanks drop steeply to the floor of the gap (a V-shaped pass)
const flank30 = y => Math.pow(clamp((GB30 - y) / (GB30 - PK30)), 1.55);
const gapL30 = y => 380 - 330 * flank30(y) + (noise1(y * 0.012, 3) * 30 + noise1(y * 0.05, 5) * 10) * Math.min(1, flank30(y) * 4);
const gapR30 = y => 700 + 330 * flank30(y) - (noise1(y * 0.012, 4) * 30 + noise1(y * 0.05, 6) * 10) * Math.min(1, flank30(y) * 4);
const hAt30 = y => 90 + (y - GB30) * 1.3; // figure height by depth on the valley floor
const mtTop30 = (x, s) => { const ex = s < 0 ? 50 : 1030, d = Math.abs(x - ex); return PK30 + d * 0.5 - 60 * Math.exp(-Math.pow((d - 560) / 160, 2)) + noise1(x * 0.012, 40 + s) * 40 * Math.min(1, d / 100); };
function cliff30(c, T, side, nt, o) {
  const s = side, edge = s < 0 ? gapL30 : gapR30, xo = s < 0 ? -1100 : 2180, ex = edge(PK30);
  const path = () => { c.beginPath(); c.moveTo(xo, GB30 + 80); c.lineTo(xo, mtTop30(xo, s));
    if (s < 0) { for (let x = xo; x <= ex; x += 12) c.lineTo(x, mtTop30(x, s)); } else { for (let x = xo; x >= ex; x -= 12) c.lineTo(x, mtTop30(x, s)); }
    for (let y = PK30; y <= GB30 + 80; y += 8) c.lineTo(edge(y), y); c.closePath(); };
  const base = mix(s < 0 ? (o.rock || '#a07c62') : '#6a5662', '#14121c', nt * 0.85), lit = mix('#ffd2a4', '#3a3448', nt * 0.85), shd = mix('#2e2230', '#0a0810', nt * 0.7);
  path(); const g = c.createLinearGradient(0, PK30, 0, GB30); g.addColorStop(0, mix(base, lit, s < 0 ? 0.45 : 0.12)); g.addColorStop(0.5, base); g.addColorStop(1, mix(base, shd, 0.4)); c.fillStyle = g; c.fill();
  c.save(); path(); c.clip();
  const r = rng(SEED30 + 40 + s);
  // the inner flank facing the gap: shaded on the right mountain, lit on the left one (light from the left)
  c.beginPath(); for (let y = PK30; y <= GB30 + 80; y += 8) c.lineTo(edge(y), y); for (let y = GB30 + 80; y >= PK30; y -= 8) c.lineTo(edge(y) - s * (90 + 260 * flank30(y)), y); c.closePath();
  const fg = c.createLinearGradient(edge(900) - s * 300, 0, edge(900), 0); fg.addColorStop(0, hexA(s < 0 ? lit : shd, 0)); fg.addColorStop(1, hexA(s < 0 ? lit : shd, s < 0 ? 0.35 : 0.6)); c.fillStyle = fg; c.fill();
  // gullies and ribs running down the slopes toward the gap
  for (let i = 0; i < 34; i++) { const u = r(), y0 = lerp(PK30 + 20, GB30 - 200, u * u), x0 = edge(y0) - s * (20 + r() * 520), len = 160 + r() * 420, w = 18 + r() * 50, dx = s * (30 + r() * 80);
    c.fillStyle = hexA(shd, 0.28 + r() * 0.25); c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 + dx * 0.4 + w * 0.3, y0 + len * 0.5, x0 + dx, y0 + len); c.lineTo(x0 + dx + w * 0.5, y0 + len); c.quadraticCurveTo(x0 + dx * 0.5 + w, y0 + len * 0.4, x0 + w * 0.6, y0); c.closePath(); c.fill();
    c.strokeStyle = hexA(lit, 0.16 * (1 - nt * 0.6)); c.lineWidth = 2.5; c.beginPath(); c.moveTo(x0 - 3, y0); c.quadraticCurveTo(x0 + dx * 0.4 - 3, y0 + len * 0.5, x0 + dx - 3, y0 + len); c.stroke(); }
  // tilted strata
  for (let k = 0; k < 30; k++) { const yy = 300 + k * 42; c.strokeStyle = hexA(k % 2 ? shd : lit, 0.12 + (k % 3) * 0.05); c.lineWidth = 2 + (k % 3);
    c.beginPath(); for (let x = -1100; x <= 2200; x += 24) { const v = yy + (x - 540) * 0.08 * -s + noise1(x * 0.01, k + 60) * 12; x === -1100 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); }
  // fractured blocks on the steep lower cliff
  c.strokeStyle = hexA(shd, 0.55); c.lineWidth = 3; for (let i = 0; i < 26; i++) { const y = lerp(900, GB30, r()), x = edge(y) - s * (10 + r() * 140); c.beginPath(); c.moveTo(x, y); c.lineTo(x - s * (20 + r() * 50), y + 16 + r() * 30); c.lineTo(x - s * (30 + r() * 60), y + 30 + r() * 40); c.stroke(); }
  // scrub
  const rs = rng(SEED30 + 50 + s); for (let i = 0; i < 70; i++) { const x = (s < 0 ? -1000 : 400) + rs() * 1700, top = Math.max(mtTop30(x, s), PK30) + 40; const y = top + rs() * (GB30 - top); if ((s < 0 && x > edge(y) - 10) || (s > 0 && x < edge(y) + 10)) continue;
    c.fillStyle = mix(mix('#5a6a3a', '#3a4a2a', rs()), '#0e120e', nt * 0.8); c.beginPath(); c.ellipse(x, y, 5 + rs() * 9, 3 + rs() * 5, 0, 0, 6.283); c.fill(); }
  // contact shadow along the wall
  const cs = c.createLinearGradient(edge(1100), 0, edge(1100) - s * 120, 0); cs.addColorStop(0, hexA('#0a0608', 0.45)); cs.addColorStop(1, hexA('#0a0608', 0)); c.fillStyle = cs; c.fillRect(-1100, PK30, 3300, GB30);
  c.restore();
  c.strokeStyle = hexA(lit, 0.45 * (1 - nt * 0.6)); c.lineWidth = 3; c.beginPath(); if (s < 0) { for (let x = xo; x <= ex; x += 12) x === xo ? c.moveTo(x, mtTop30(x, s) + 1) : c.lineTo(x, mtTop30(x, s) + 1); } else { for (let x = xo; x >= ex; x -= 12) x === xo ? c.moveTo(x, mtTop30(x, s) + 1) : c.lineTo(x, mtTop30(x, s) + 1); } c.stroke();
}
// what lies beyond the pass: far ranges and, with o.dark, a churning darkness and dust (Ya'juj and Ma'juj are never drawn)
function beyond30(c, T, o, nt) {
  const hz = mix(o.haze || '#f2c8a0', '#1e2440', nt);
  ridgeW(c, 980, 120, 0.004, SEED30 + 60, mix('#8a7a98', '#121628', nt)); hazeW(c, 1010, 220, hz, 0.5);
  ridgeW(c, 1180, 80, 0.005, SEED30 + 61, mix('#7a6a72', '#10121c', nt)); hazeW(c, 1210, 160, hz, 0.4);
  const dk = o.dark || 0; if (dk <= 0) return;
  T += 100; const r = rng(SEED30 + 62);
  c.save(); const bg = c.createLinearGradient(0, 300, 0, 1300); bg.addColorStop(0, `rgba(16,10,16,${0.55 * dk})`); bg.addColorStop(0.75, `rgba(20,14,18,${0.35 * dk})`); bg.addColorStop(1, 'rgba(20,14,18,0)'); c.fillStyle = bg; c.fillRect(-300, 300, 1700, 1000);
  for (let i = 0; i < 70; i++) { const bx = 60 + r() * 960, by = 380 + r() * 640 - ((T * (8 + r() * 14)) % 160), R = 70 + r() * 150, wob = Math.sin(T * (0.6 + r()) + i) * 30;
    const col = r() > 0.6 ? '62,42,38' : r() > 0.3 ? '26,18,22' : '96,70,54';
    const g = c.createRadialGradient(bx + wob, by, 0, bx + wob, by, R); g.addColorStop(0, `rgba(${col},${0.6 * dk})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(bx + wob - R, by - R, R * 2, R * 2); }
  if (o.surge) { const sv = o.surge; for (let i = 0; i < 34; i++) { const ph = (T * 0.7 + r()) % 1, bx = 200 + r() * 680, top = (o.wallTop || WT30) - Math.sin(ph * Math.PI) * (100 + r() * 180) * sv, R = 60 + r() * 90;
      const g = c.createRadialGradient(bx, top, 0, bx, top, R); g.addColorStop(0, `rgba(${i % 2 ? '130,106,90' : '84,64,58'},${0.7 * dk * sv})`); g.addColorStop(1, 'rgba(78,60,54,0)'); c.fillStyle = g; c.fillRect(bx - R, top - R, R * 2, R * 2); } }
  if (o.surge) { const rg = rng(SEED30 + 63); c.fillStyle = `rgba(190,165,140,${0.6 * dk * o.surge})`; for (let i = 0; i < 90; i++) { const ph = (T * (0.5 + rg() * 0.5) + rg()) % 1, bx = 160 + rg() * 760, by = (o.wallTop || WT30) - 10 - Math.sin(ph * Math.PI) * (40 + rg() * 200) * o.surge;
      c.beginPath(); c.arc(bx + (ph - 0.5) * 30, by, 1.5 + rg() * 2.5, 0, 6.283); c.fill(); } }
  const fl = Math.max(0, Math.sin(T * 1.3) * Math.sin(T * 3.1)); if (fl > 0.6) { c.globalCompositeOperation = 'lighter'; glow(c, 300 + (Math.floor(T * 1.3) % 5) * 110, 520, 340, '#a0a0c0', 0.12 * dk * (fl - 0.6) * 2.5); }
  c.restore();
}
// the wall itself, course by course: o.fill 0..1 (rising), o.heat 0..1 (blown red), o.copper 0..1 (molten copper poured from the top), o.cool (copper set),
// o.level 0..1 (levelled: the vision of Al-Kahf 98)
function wall30(c, T, o) {
  const fill = o.fill === undefined ? 1 : o.fill, heat = o.heat || 0, cop = o.copper || 0, lev = o.level || 0, nt = o.night || 0, cool = o.cool || 0;
  if (fill <= 0) return;
  const top = lerp(GB30, WT30, fill), topL = lerp(top, GB30 - 30, ease(lev));
  const CH = 46; const r = rng(SEED30 + 80);
  c.save(); c.beginPath(); c.moveTo(gapL30(GB30 + 60) - 40, GB30 + 60); for (let y = GB30 + 60; y >= topL; y -= 8) c.lineTo(gapL30(y) - 40, y); c.lineTo(gapR30(topL) + 40, topL); for (let y = topL; y <= GB30 + 60; y += 8) c.lineTo(gapR30(y) + 40, y); c.closePath(); c.clip();
  const nRows = Math.ceil((GB30 + 60 - WT30) / CH) + 1, copFront = lerp(WT30 - 10, GB30 + 60, clamp(cop));
  for (let row = 0; row < nRows; row++) { const yb = GB30 + 60 - row * CH, yt = yb - CH; if (yb <= top) break;
    const xl = gapL30(yt) - 60, xr = gapR30(yt) + 60, off = (row % 2) * 55; let x = xl - off;
    const partial = yt < top ? clamp((yb - top) / CH) : 1;
    while (x < xr) { const bw = 100 + r() * 40, rr = r(), x1 = Math.min(x + bw, xr);
      if (yt >= top || (x - xl) / (xr - xl) < partial) {
        const base = mix('#2c2e36', '#4a4c56', rr * 0.8), hk = heat * (0.8 + 0.2 * Math.sin(T * 2 + rr * 9)), cov = yt < copFront ? cop > 0 ? 1 : 0 : 0;
        let col = mix(base, '#ff4a12', hk * 0.75); col = mix(col, '#ffb050', hk * hk * 0.3); if (cov) col = mix(col, mix('#7a4a2e', '#ff8a3a', (1 - cool) * 0.6), 0.32);
        const bg = c.createLinearGradient(0, yt, 0, yb); bg.addColorStop(0, mix(col, '#ffffff', 0.1)); bg.addColorStop(1, mix(col, '#000000', 0.25)); c.fillStyle = bg; c.fillRect(x + 3, yt + 3, x1 - x - 6, CH - 6);
        c.fillStyle = `rgba(200,212,235,${0.2 * (1 - heat)})`; c.fillRect(x + 3, yt + 3, x1 - x - 6, 3); // bevel light
        c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x + 3, yb - 6, x1 - x - 6, 3); c.fillRect(x1 - 6, yt + 3, 3, CH - 6);
        if (rr > 0.45) { c.fillStyle = `rgba(230,230,240,${0.16 * (1 - heat)})`; [[x + 12, yt + 12], [x1 - 12, yt + 12], [x + 12, yb - 12], [x1 - 12, yb - 12]].forEach(([qx, qy]) => { c.beginPath(); c.arc(qx, qy, 2.6, 0, 6.283); c.fill(); }); }
        if (rr < 0.25 && heat < 0.3) { c.fillStyle = 'rgba(120,60,30,0.18)'; c.beginPath(); c.ellipse(x + bw * 0.5, yt + CH * 0.6, 14, 6, 0, 0, 6.283); c.fill(); } // rust
        // seams between blocks: dark, glowing when blown, copper once poured
        const seamC = cov ? mix('#c8743a', '#ffb060', (1 - cool) * 0.7) : heat > 0.05 ? mix('#3a1a10', '#ffa040', heat) : '#14141a';
        c.fillStyle = seamC; c.fillRect(x1 - 3, yt, 3, CH); c.fillRect(x, yb - 3, x1 - x, 3);
      }
      x = x1; }
  }
  if (heat > 0.05) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, lerp(top, GB30, 0.55), 560, '#ff5a1e', 0.32 * heat); c.restore(); }
  // the molten front of the copper running down the face
  if (cop > 0 && cop < 1) { c.save(); c.globalCompositeOperation = 'lighter';
    for (let x = 150; x <= 930; x += 26) { const fy = copFront + Math.sin(x * 0.05 + 1) * 12 + noise1(x * 0.02, 81) * 34; glow(c, x, fy, 46, '#ffb060', 0.4); }
    c.restore();
    c.fillStyle = 'rgba(255,170,80,0.85)'; const rd = rng(SEED30 + 82); for (let i = 0; i < 22; i++) { const x = 180 + rd() * 720, fy = copFront + Math.sin(x * 0.05 + 1) * 12 + noise1(x * 0.02, 81) * 34, len = 20 + rd() * 40;
      c.beginPath(); c.moveTo(x - 4, fy - 10); c.quadraticCurveTo(x - 4, fy + len, x, fy + len + 6); c.quadraticCurveTo(x + 4, fy + len, x + 4, fy - 10); c.fill(); } }
  // metallic sheen: a soft diagonal band of light
  c.save(); c.globalCompositeOperation = 'lighter'; const sh = c.createLinearGradient(200, WT30, 880, GB30); sh.addColorStop(0, 'rgba(255,210,170,0)'); sh.addColorStop(0.45, `rgba(255,210,170,${0.1 * (1 - nt * 0.6)})`); sh.addColorStop(0.6, 'rgba(255,210,170,0)'); c.fillStyle = sh; c.fillRect(0, WT30 - 20, 1080, GB30 - WT30 + 100); c.restore();
  // ambient occlusion at the foot and the top
  const ao = c.createLinearGradient(0, GB30 - 120, 0, GB30 + 20); ao.addColorStop(0, 'rgba(10,6,6,0)'); ao.addColorStop(1, 'rgba(10,6,6,0.45)'); c.fillStyle = ao; c.fillRect(0, GB30 - 120, 1080, 200);
  c.restore();
  // the capping course along the top
  if (fill > 0.98 || lev > 0) { const capC = mix(cop > 0.9 ? '#8a5432' : '#4a4c56', '#000000', nt * 0.5); c.fillStyle = capC; c.beginPath(); c.moveTo(gapL30(topL) - 10, topL - 14); c.lineTo(gapR30(topL) + 10, topL - 14); c.lineTo(gapR30(topL) + 10, topL + 4); c.lineTo(gapL30(topL) - 10, topL + 4); c.closePath(); c.fill();
    c.fillStyle = hexA(mix('#ffd0a0', '#6a7088', nt), 0.45); c.fillRect(gapL30(topL) - 10, topL - 14, gapR30(topL) - gapL30(topL) + 20, 3); }
  if (lev > 0) { bigDust(c, T, 540, GB30 - 40, 0.55, lev * (1 - lev * 0.4), SEED30 + 83);
    c.fillStyle = hexA('#7a6a58', 0.95); c.beginPath(); c.moveTo(gapL30(GB30) - 120, GB30 + 12); c.quadraticCurveTo(540, GB30 - 110 * ease(lev), gapR30(GB30) + 120, GB30 + 12); c.closePath(); c.fill(); }
}
// the whole set: sky, beyond, the wall, the two cliffs, the valley floor, forge gear, people
function gorge30(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx || 540, o.cy || 1100, ...(o.shake ? shake(T, o.shake, 8) : [0, 0]));
  const nt = o.night || 0;
  sky0(c, skyStops(o.sky || 'gold', o.to, o.k || 0));
  if (o.stars) stars(c, T, 140, SEED30 + 90, [-500, -300, W + 1000, 1000], o.stars);
  if (o.moonA) moon(c, o.moonX || 820, o.moonY || 360, 40, o.moonA);
  if (o.sunA) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, o.sunX || 540, o.sunY || 700, 600, '#ffc890', 0.35 * o.sunA); c.restore(); sun(c, o.sunX || 540, o.sunY || 700, 40, '#ffe2a8', o.sunA); }
  cloudBank(c, T, 260, 5, mix('#ffe6c8', '#22243c', nt), 0.12, SEED30 + 91, 5);
  beyond30(c, T, o, nt);
  wall30(c, T, o);
  if (o.pour) pour30(c, T, o.pour, o);
  cliff30(c, T, -1, nt, o); cliff30(c, T, 1, nt, o);
  if (o.ghost) { c.save(); c.setLineDash([18, 14]); c.strokeStyle = `rgba(255,236,190,${0.7 * o.ghost})`; c.lineWidth = 5; c.beginPath(); c.moveTo(gapL30(GB30), GB30); c.lineTo(gapL30(WT30), WT30); c.lineTo(gapR30(WT30), WT30); c.lineTo(gapR30(GB30), GB30); c.stroke(); c.restore(); }
  // the valley floor in front of the gap
  const fc = mix('#a88660', '#16141c', nt * 0.82);
  const g = c.createLinearGradient(0, GB30, 0, H + 200); g.addColorStop(0, mix(fc, '#fff0d0', 0.12 * (1 - nt))); g.addColorStop(0.3, fc); g.addColorStop(1, mix(fc, '#140c06', 0.5));
  c.fillStyle = g; c.beginPath(); c.moveTo(-900, GB30 + 20); for (let x = -900; x <= 1980; x += 20) c.lineTo(x, GB30 + 4 + Math.abs(x - 540) * 0.06 + noise1(x * 0.01, 92) * 10); c.lineTo(1980, H + 900); c.lineTo(-900, H + 900); c.closePath(); c.fill();
  const r = rng(SEED30 + 93); for (let i = 0; i < 140; i++) { const y = GB30 + 20 + Math.pow(r(), 1.4) * 520, k = 0.4 + (y - GB30) / 260, x = -500 + r() * 2100;
    if (r() > 0.75) shrub(c, x, y, 0.28 * k, mix('#6a6a3a', '#101410', nt), T, SEED30 + 94 + i); else { c.fillStyle = mix('#7a6448', '#14121a', nt * 0.8); c.beginPath(); c.ellipse(x, y, 7 * k, 3.5 * k, 0, 0, 6.283); c.fill(); } }
  if (o.heat) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, GB30 + 60, 560, '#ff6a2a', 0.3 * o.heat); c.restore(); }
  if (o.pile || o.forge) { ironPile30(c, 150, GB30 + 110, 0.9, 12, SEED30 + 100, (o.heat || 0) * 0.3); ironPile30(c, 930, GB30 + 120, 0.9, 10, SEED30 + 101, (o.heat || 0) * 0.3); }
  if (o.forge) forge30(c, T, o);
  if (o.tribute) tribute30(c, o.tribX || 560, o.tribY || 1720, o.tribS || 1, T, o.tribute);
  if (o.people) o.people(c);
  if (o.fg !== false) blurLayer(c, 9, bc => fgBrush(bc, T, { col: mix('#6a5a30', '#0c0c10', nt * 0.8), stone: mix('#7a6450', '#141218', nt * 0.8) }), 3);
  if (o.vision) { c.fillStyle = `rgba(200,190,180,${0.35 * o.vision})`; c.fillRect(-900, -900, W + 1800, H + 1800); }
  if (nt > 0) { c.fillStyle = `rgba(6,10,30,${0.22 * nt})`; c.fillRect(-900, -900, W + 1800, H + 1800); }
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// the forge at the foot of the wall (Al-Kahf 96 « Soufflez ! »): fire pits, bellows pumped by kneeling men, piles of iron
const FORGE30 = [[380, GB30 + 60], [540, GB30 + 70], [700, GB30 + 60]];
function forge30(c, T, o) {
  const f = o.forge, pump = !!o.pump, hk = o.heat || 0;
  FORGE30.forEach(([x, y], i) => { const s = 0.45 + (y - GB30) * 0.004;
    c.fillStyle = '#2a1a10'; for (let k = 0; k < 6; k++) { c.beginPath(); c.ellipse(x + Math.cos(k * 1.05) * 46 * s, y + 4 + Math.sin(k * 1.05) * 8 * s, 12 * s, 8 * s, 0, 0, 6.283); c.fill(); }
    flame30(c, x, y, s * (0.8 + 0.6 * hk), T + i, f);
    const bx = x + (i === 1 ? 140 : i === 0 ? -150 : 150), by = y + 50, bd = bx < x ? 1 : -1;
    bellows30(c, bx, by, s * 1.1, T, { pump, ph: i * 1.3, dir: bd });
    const kx = bx - bd * 100 * s, ky = by + 6; fig(c, GAPFOLK[i * 2 % 6], { x: kx, y: ky, h: hAt30(ky) * 0.95, pose: 'kneel', dir: bd, t: T + i, light: 0.9, ink: 0.7, reach: pump ? 0.5 + 0.3 * Math.sin(T * 5 + i * 1.3) : 0.2 }); });
  if (hk > 0.2) sparks(c, T, 540, GB30 - 40, 30, SEED30 + 102, hk, 2.2);
}
// pouring the molten copper from the top (Al-Kahf 96): a timber scaffold on the right, a crucible tipping, the stream
function pour30(c, T, k, o) {
  const sx = 700, sy = WT30 - 30;
  c.strokeStyle = '#4a3220'; c.lineWidth = 10; c.lineCap = 'round';
  [[760, 820], [840, 900]].forEach(([a, b]) => { c.beginPath(); c.moveTo(a, GB30 + 10); c.lineTo(a - 10, sy - 20); c.moveTo(b, GB30 + 10); c.lineTo(b - 10, sy - 20); c.stroke(); });
  c.lineWidth = 7; for (let y = sy; y < GB30; y += 110) { c.beginPath(); c.moveTo(740, y); c.lineTo(910, y + 14); c.stroke(); }
  c.fillStyle = '#5a3a24'; c.fillRect(640, sy - 6, 280, 14);
  const tilt = -0.7 * ease(clamp(k * 3));
  c.save(); c.translate(sx + 40, sy - 20); c.rotate(tilt);
  const g = c.createLinearGradient(-60, 0, 60, 0); g.addColorStop(0, '#2a2420'); g.addColorStop(1, '#5a4a40'); c.fillStyle = g; c.beginPath(); c.moveTo(-60, -60); c.lineTo(60, -60); c.quadraticCurveTo(58, 20, 0, 24); c.quadraticCurveTo(-58, 20, -60, -60); c.fill();
  c.fillStyle = '#ffb048'; c.beginPath(); c.ellipse(0, -60, 58, 12, 0, 0, 6.283); c.fill(); c.restore();
  if (k > 0.15) { const lx = sx - 20, ly = sy - 60; c.save(); c.globalCompositeOperation = 'lighter'; glow(c, lx, ly, 200, '#ffa040', 0.5); c.restore();
    c.strokeStyle = '#ffc060'; c.lineWidth = 14; c.beginPath(); c.moveTo(lx, ly); c.quadraticCurveTo(lx - 50, ly + 10, lx - 70, WT30 - 4); c.stroke(); c.strokeStyle = '#fff0b0'; c.lineWidth = 5; c.stroke(); sparks(c, T, lx - 70, WT30, 16, SEED30 + 103, 1, 1.2); }
}
// men carrying iron blocks on their shoulders toward the foot of the wall (steps driven by the distance); list of [x0, y, dir, who]
function carriers30(c, T, dist, list) {
  list.forEach(([x0, y, d, wi], i) => { const h = hAt30(y), x = x0 + d * dist * (0.9 + i * 0.05), o = { x, y, h, dir: d, armUp: 0.82, t: T + i, light: 0.95, wind: 0.3, ink: 0.7, walk: stepOf(dist * (0.9 + i * 0.05), h) + i * 0.3 };
    fig(c, GAPFOLK[wi % 6], o); const [hx, hy] = handOf(o), s = h / 300;
    c.fillStyle = '#3a3c44'; c.fillRect(hx - 40 * s, hy - 34 * s, 70 * s, 34 * s); c.fillStyle = 'rgba(210,220,240,0.3)'; c.fillRect(hx - 40 * s, hy - 34 * s, 70 * s, 4 * s); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(hx - 40 * s, hy - 5 * s, 70 * s, 5 * s); });
}
// the hero shot (hook / loop): the finished wall at dusk, a darkness churning beyond it, the people below, the king among them
const HERO30 = { z: 1.0, cx: 540, cy: 1060, sky: 'dusk', to: 'gold', k: 0.35, fill: 1, copper: 1, cool: 0.85, heat: 0, dark: 0.85 };
function heroPeople30(c, T, o = {}) {
  const ppl = [[150, 1600, 0, 1], [240, 1660, 1, 1], [800, 1610, 2, -1], [900, 1680, 3, -1], [700, 1720, 4, -1], [80, 1760, 5, 1]];
  ppl.forEach(([x, y, wi, d], i) => fig(c, GAPFOLK[wi], { x, y, h: hAt30(y), dir: d, t: T + i, light: 0.9, wind: 0.4, ink: 0.7, armUp: o.cheer ? 0.6 + 0.3 * Math.sin(T * 2 + i) : 0, reach: o.reach ? 0.6 : 0 }));
  fig(c, KING30, { x: o.kx || 470, y: o.ky || 1700, h: hAt30(o.ky || 1700) * 1.05, dir: o.kdir || 1, t: T, light: 1.05, wind: 0.5, ink: 0.75, staff: true, armUp: o.kArm || 0, dua: !!o.kDua, reach: o.kReach || 0 });
}
const hero30 = (c, T, o = {}) => gorge30(c, T, Object.assign({}, HERO30, { people: cc => heroPeople30(cc, T, o) }, o));
function heroTexts30(c, a) { if (a <= 0) return; topShade(c, 1.3 * a); seriesTag30(c, a); bigWord27(c, 'UN MUR DE FER', 250, a, 92); bigWord27(c, 'ET DE CUIVRE FONDU', 355, a, 76, '#f6c453'); }


// =====================================================================================================================
// ---------- from episode 25: Mecca (the valley, the Kaaba). The Prophet ﷺ is never depicted.
const SKY25 = {
  night: [[0, '#03050f'], [0.3, '#081030'], [0.55, '#141c44'], [0.75, '#232a52'], [1, '#2c2c50']],
  deep: [[0, '#020309'], [0.3, '#060a20'], [0.55, '#0e1434'], [0.75, '#161c3c'], [1, '#1c2040']],
  dusk: [[0, '#1c1838'], [0.3, '#4a3658'], [0.55, '#b8685a'], [0.75, '#eea068'], [1, '#ffd29a']],
  gold: [[0, '#34446e'], [0.3, '#8a7090'], [0.55, '#e0a07a'], [0.75, '#ffcc90'], [1, '#ffeac0']],
  dawn: [[0, '#141a46'], [0.3, '#4a4a80'], [0.55, '#c88a9a'], [0.75, '#ffc0a0'], [1, '#ffecd4']],
};
function sky25(c, a, b, k = 0) { let st = SKY25[a]; if (b) st = st.map((s, i) => [s[0], mix(s[1], SKY25[b][i][1], k)]); sky0(c, st); }
function arabicBig(c, txt, y, a, size, pop = 0) { if (a <= 0) return; c.save(); c.direction = 'rtl';
  textGlow(c, txt, W / 2, y, `700 ${Math.round(size * (1 + pop))}px Amiri`, '#ffe08a', a, '#ffb300', 46); c.restore(); }
const popK = (t, t0) => t < t0 ? 0 : 0.18 * Math.exp(-(t - t0) * 6) * Math.sin(Math.min(1, (t - t0) * 6) * Math.PI);
function vignette25(c, k, col = '0,0,0') { if (k <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createRadialGradient(W / 2, H * 0.45, H * lerp(0.75, 0.18, k), W / 2, H * 0.45, H * lerp(1.0, 0.62, k)); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(1, `rgba(${col},${0.92 * Math.min(1, k * 1.4)})`);
  c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }
const beat = (t, t0, per = 0.8) => t < t0 ? 0 : Math.pow(Math.max(0, Math.sin(((t - t0) / per) * Math.PI * 2)), 8); // heartbeat pulse

function kaaba(c, x, y, s, o = {}) { c.save(); c.translate(x, y); c.scale(s, s); const lit = o.lit === undefined ? 1 : o.lit;
  c.fillStyle = 'rgba(10,6,4,0.35)'; c.beginPath(); c.ellipse(30, 6, 190, 22, 0, 0, 6.283); c.fill();
  c.fillStyle = mix('#a08a70', '#3a3440', 1 - lit); c.beginPath(); c.moveTo(-112, 0); c.lineTo(112, 0); c.lineTo(178, -26); c.lineTo(178, -38); c.lineTo(112, -12); c.lineTo(-112, -12); c.closePath(); c.fill(); // plinth
  const fh = 236; // front face
  const g = c.createLinearGradient(-110, 0, 110, 0); g.addColorStop(0, '#2a2426'); g.addColorStop(1, '#161214'); c.fillStyle = g; c.fillRect(-108, -12 - fh, 216, fh);
  c.fillStyle = '#0c0a0c'; c.beginPath(); c.moveTo(108, -12); c.lineTo(108, -12 - fh); c.lineTo(172, -38 - fh); c.lineTo(172, -38); c.closePath(); c.fill(); // side face
  c.fillStyle = '#3a3234'; c.beginPath(); c.moveTo(-108, -12 - fh); c.lineTo(108, -12 - fh); c.lineTo(172, -38 - fh); c.lineTo(-44, -38 - fh); c.closePath(); c.fill(); // top
  c.strokeStyle = 'rgba(255,255,255,0.05)'; c.lineWidth = 2; for (let k = 0; k < 9; k++) { c.beginPath(); c.moveTo(-96 + k * 24, -14); c.lineTo(-98 + k * 24, -10 - fh); c.stroke(); } // folds of the cloth
  c.strokeStyle = `rgba(255,220,170,${0.35 * lit})`; c.lineWidth = 3; c.beginPath(); c.moveTo(-108, -12 - fh); c.lineTo(-108, -12); c.stroke(); // sun edge
  c.fillStyle = '#4a3020'; c.fillRect(-14 + 40, -12 - 150, 46, 92); c.strokeStyle = '#8a6040'; c.lineWidth = 3; c.strokeRect(-14 + 40, -12 - 150, 46, 92); // the raised door
  c.restore(); }
function idol25(c, x, y, s, col, hi = 0, seed = 1) { c.save(); c.translate(x, y); c.scale(s, s); const r = rng(seed), lean = (r() - 0.5) * 0.06;
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(0, 3, 34, 7, 0, 0, 6.283); c.fill();
  c.fillStyle = mix(col, '#2a1a10', 0.3); c.fillRect(-26, -30, 52, 30); c.fillStyle = mix(col, '#ffffff', 0.15); c.fillRect(-28, -34, 56, 6); // pedestal
  c.rotate(lean); const g = c.createLinearGradient(-20, 0, 20, 0); g.addColorStop(0, mix(col, '#fff0d8', 0.25)); g.addColorStop(1, mix(col, '#100a06', 0.4)); c.fillStyle = g;
  c.beginPath(); c.moveTo(-16, -34); c.lineTo(-20, -96); c.quadraticCurveTo(-24, -118, -10, -122); c.lineTo(10, -122); c.quadraticCurveTo(24, -118, 20, -96); c.lineTo(16, -34); c.closePath(); c.fill();
  c.beginPath(); c.ellipse(0, -136, 13, 16, 0, 0, 6.283); c.fill(); // a smooth head: no features
  if (hi > 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,120,80,${0.7 * hi})`; c.lineWidth = 4; c.stroke(); glow(c, 0, -90, 90, '#ff7040', 0.3 * hi); c.restore(); }
  c.restore(); }
const KX25 = 540, KY25 = 1330, IDOLS = [[250, 1352, 0.9], [330, 1302, 0.75], [420, 1282, 0.62], [700, 1286, 0.62], [790, 1306, 0.75], [880, 1356, 0.9], [170, 1420, 1.05], [930, 1430, 1.05]];
const TAWAF = [...Array(16).keys()].map(i => ({ a0: i / 16 * 6.283 + (i % 3) * 0.12, f: FOLK[i % FOLK.length], sp: 0.16 + (i % 4) * 0.012 }));
function meccaSet(c, T, o = {}) {
  const nt = o.night || 0, dk = o.dark || 0;
  if (o.skyFn) o.skyFn(c); else if (nt > 0.5) sky25(c, 'night', 'deep', dk); else sky25(c, 'gold', 'dusk', o.dusk === undefined ? 0.45 : o.dusk);
  if (nt > 0.3) { stars(c, T, 160, 2541, [-300, -300, W + 600, 1000], nt); moon(c, o.moonX || 840, o.moonY || 600, 34, nt, 0.25); }
  else if (!o.noSun) { const sx = o.sunX || 780, sy = o.sunY || 1040; c.save(); c.globalCompositeOperation = 'lighter'; glow(c, sx, sy, 560, '#ffd8a0', 0.45); c.restore(); sun(c, sx, sy, 50, '#ffe6b0', 0.95); }
  wisps(c, T, 600, 4, nt > 0.5 ? '#3a4070' : '#fff0dc', 0.14, 2542, 6);
  par(c, 0.1, o.px || 0, 0, () => { ridgeW(c, 1120, 180, 0.0034, 2543, mix('#9a7078', '#1a1c3a', nt)); hazeW(c, 1140, 220, mix('#f8c8a0', '#262a50', nt), 0.55); });
  par(c, 0.25, o.px || 0, 0, () => { // the bare mountains framing the valley (left: Abu Qubays side; right)
    const L = x => 760 + Math.pow(Math.max(0, x + 100) / 520, 1.5) * 420 + noise1(x * 0.012, 2544) * 50, R = x => 820 + Math.pow(Math.max(0, 1250 - x) / 560, 1.5) * 420 + noise1(x * 0.012, 2545) * 50;
    [[L, -900, 520, mix('#6a4a40', '#141428', nt)], [R, 640, 2000, mix('#62443c', '#121226', nt)]].forEach(([f, x0, x1, col]) => { c.fillStyle = col; c.beginPath(); c.moveTo(x0, H); for (let x = x0; x <= x1; x += 12) c.lineTo(x, Math.min(1400, f(x))); c.lineTo(x1, H); c.closePath(); c.fill();
      c.strokeStyle = hexA(mix('#ffd8b0', '#7a80b0', nt), 0.35); c.lineWidth = 3; c.beginPath(); for (let x = x0; x <= x1; x += 12) { const y = Math.min(1400, f(x)); x === x0 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke(); });
    hazeW(c, 1300, 240, mix('#f0c098', '#20244a', nt), 0.4); });
  // houses climbing both slopes
  par(c, 0.4, o.px || 0, 0, () => { city(c, -380, 380, 1330, 150, 0.85, mix('#b08860', '#2a2638', nt * 0.9), 2546); city(c, 700, 1460, 1330, 150, 0.85, mix('#a88058', '#262234', nt * 0.9), 2547);
    if (nt > 0.3) { const rr = rng(2548); c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const x = rr() < 0.5 ? -300 + rr() * 640 : 720 + rr() * 700, y = 1190 + rr() * 130; c.fillStyle = `rgba(255,200,120,${0.7 * nt})`; c.fillRect(x, y, 6, 8); glow(c, x + 3, y + 4, 18, '#ffb860', 0.2 * nt); } c.restore(); } });
  // the valley floor and the open court around the Kaaba
  const fg = c.createLinearGradient(0, 1320, 0, H + 200); fg.addColorStop(0, mix('#d0a478', '#2a2636', nt * 0.9)); fg.addColorStop(1, mix('#8a6440', '#100e18', nt * 0.9)); c.fillStyle = fg; c.fillRect(-800, 1320, W + 1600, H);
  c.fillStyle = hexA(mix('#f0d8b0', '#4a4660', nt), 0.5); c.beginPath(); c.ellipse(KX25, KY25 + 10, 400, 96, 0, 0, 6.283); c.fill();
  const r = rng(2549); for (let i = 0; i < 70; i++) { c.fillStyle = hexA(r() > 0.5 ? '#fff0d0' : '#4a3020', 0.08); c.beginPath(); c.ellipse(-500 + r() * 2100, 1350 + Math.pow(r(), 1.6) * 600, 20 + r() * 60, 3 + r() * 5, 0, 0, 6.283); c.fill(); }
  // idols on their pedestals around the court, people walking around the House (back half behind the Kaaba)
  const hi = o.idols || 0;
  const P = TAWAF.map((p, i) => { const th = p.a0 - T * p.sp, x = KX25 + 330 * Math.cos(th), y = KY25 + 8 + 74 * Math.sin(th), h = 120 + (y - (KY25 - 66)) * 0.75;
    return { x, y, h, d: clamp(Math.sin(th) * 3, -1, 1), dist: T * p.sp * 260, f: p.f, i }; });
  const drawP = p => { if (Math.abs(p.d) < 0.08) p.d = p.d < 0 ? -0.08 : 0.08; fig(c, p.f, { x: p.x, y: p.y, h: p.h, dir: p.d, walk: stepOf(p.dist, p.h) + p.i * 0.37, light: nt > 0.5 ? 0.45 : 0.85, t: T + p.i, wind: 0.2, ink: 0.6 }); };
  if (o.crowd !== false) P.filter(p => p.y < KY25 + 8).sort((a, b) => a.y - b.y).forEach(drawP);
  (o.noIdols ? [] : IDOLS).filter(q => q[1] < KY25).forEach(([x, y, s], i) => idol25(c, x, y, s, mix('#9a8068', '#3a3444', nt), hi * (0.6 + 0.4 * Math.sin(T * 3 + i)), 2550 + i));
  kaaba(c, KX25 - 30, KY25, 0.82, { lit: 1 - nt });
  (o.noIdols ? [] : IDOLS).filter(q => q[1] >= KY25).forEach(([x, y, s], i) => idol25(c, x, y, s, mix('#9a8068', '#3a3444', nt), hi * (0.6 + 0.4 * Math.sin(T * 3 + i + 4)), 2560 + i));
  if (o.crowd !== false) P.filter(p => p.y >= KY25 + 8).sort((a, b) => a.y - b.y).forEach(drawP);
  // the market on the right: camels resting with their loads, merchants standing (faceless)
  if (o.market !== false) {
    camel(c, 930, 1600, 0.85, mix('#b4875a', '#3a3040', nt), T, -1, null, { walk: false });
    fig(c, FOLK[2], { x: 760, y: 1640, h: 300, dir: 1, reach: 0.4 + 0.15 * Math.sin(T * 1.3), light: nt > 0.5 ? 0.5 : 0.9, t: T, wind: 0.3, ink: 0.7 });
    fig(c, FOLK[4], { x: 640, y: 1700, h: 320, dir: 1, light: nt > 0.5 ? 0.5 : 0.9, t: T + 3, wind: 0.3, ink: 0.7 });
    datesBasket(c, 840, 1690, 1.2); jar(c, 1010, 1690, 1.2, mix('#a8643a', '#2a2430', nt));
    fig(c, FOLK[6], { x: 230, y: 1660, h: 310, dir: 1, light: nt > 0.5 ? 0.5 : 0.9, t: T + 5, wind: 0.3, ink: 0.7 });
    fig(c, FOLK[1], { x: 90, y: 1700, h: 330, dir: 1, reach: 0.3, light: nt > 0.5 ? 0.5 : 0.9, t: T + 7, wind: 0.3, ink: 0.7 }); }
  // a lit doorway (Khadija's house, at night): a house in front on the left, warm light from the open door
  if (o.door) { house(c, 260, 1700, 380, 300, mix('#a88058', '#2a2638', nt * 0.85), { lamp: 1 });
    c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 230, 1620, 260, '#ffb860', 0.45 * o.door); c.restore(); }
  if (o.people) o.people(c);
  if (nt > 0.4) { c.fillStyle = `rgba(6,8,24,${0.25 * nt})`; c.fillRect(-800, -800, W + 1600, H + 1600); }
  if (dk > 0) { c.fillStyle = `rgba(10,12,30,${0.45 * dk})`; c.fillRect(-800, -800, W + 1600, H + 1600); }
  if (o.fg !== false) blurLayer(c, 9, bc => datePalm(bc, -120, 2250, 2.6, mix('#3a4a26', '#0c0e14', nt), T, 2570), 3);
}


// =====================================================================================================================
// ---------- episode 31: the People of the Elephant (Al-Fil 1-5) · « Histoires du Coran »
// Abraha, his soldiers, Abd al-Muttalib and the Meccans are faceless figures. The Prophet ﷺ is NEVER depicted (named only:
// a lit house at night, calligraphy). Allah is never depicted: only light. No violence is shown: the stones fall far away,
// dust, an army that scatters, an empty plain. The elephant (Mahmud, Ibn Ishaq) kneels and refuses to walk toward the Kaaba.
const SEED31 = 3100;
function seriesTag31(c, a) { textGlow(c, 'HISTOIRES DU CORAN  ·  ÉPISODE 31', W / 2, 112, '600 32px Lora', '#fbe7c6', a * 0.92, '#000000', 12); }
function ctaText31(c, a) { ctaText29(c, a); }
const ABRAHA = { robe: '#6e1c22', wrap: '#efe0bc', skin: '#4e3022', trim: '#e6c060', band: '#e6c060', inner: '#f2e6c8' };
const ABDM = { robe: '#3e2e24', wrap: '#f5efe2', skin: '#a8714f', trim: '#d8b45a', band: '#c9a35a', inner: '#ece2cc' };
const SOLD31 = [
  { robe: '#3a2a22', wrap: '#5a3a2a', skin: '#4a2e22', trim: '#a8843a', band: '#7a2a22' }, { robe: '#2e2a2a', wrap: '#7a2a24', skin: '#3e281e', trim: '#8a8478' },
  { robe: '#4a3022', wrap: '#3a3a40', skin: '#523426', trim: '#b8944a' }, { robe: '#5a2420', wrap: '#4a3a30', skin: '#462a20', trim: '#c9a35a' },
  { robe: '#2a3036', wrap: '#6a4a30', skin: '#3a241a', trim: '#8a7a5a', band: '#8a2a22' }];
const MECC31 = [FOLK[0], FOLK[1], FOLK[2], FOLK[3], FOLK[4], FOLK[5], FOLK[6], FOLK[7], FOLK[8]];
const ELE31 = '#80766d';
function sold31(c, i, o) { const f = SOLD31[((i % 5) + 5) % 5]; fig(c, f, o); if (!o.noSpear && (o.pose || 'stand') === 'stand') spearOf(c, o); }

// ---------- the elephant: domed head, big ears that fan, a long ringed trunk, tusks, wrinkled column legs with toenails,
// a red caparison with gold border and tassels (a war elephant). (x, y) = ground under the middle of the body, facing dir.
// o.walk = gait phase (eleStep31(dist, s): the stance feet never slide), o.kneel 0..1 (front legs fold first, then the hind legs),
// o.trunk 0 hanging .. 1 raised, o.lit = light on the near side.
const eleStep31 = (dist, s) => dist / (111 * s);
function eleDrop31(o) { const k = clamp(o.kneel || 0); return [132 * ease(seg(k, 0, 0.6)), 112 * ease(seg(k, 0.3, 1))]; }
function eleAnchor31(x, y, s, o, bx, by) { // world position of a point of the body (body coordinates, standing)
  const [dF, dB] = eleDrop31(o), m = (dF - dB) / 400; return [x + (o.dir || 1) * bx * s, y + (by + dB + m * (bx + 200)) * s]; }
function elephant31(c, x, y, s, T, o = {}) {
  const dir = o.dir || 1, [dF, dB] = eleDrop31(o), kf = dF / 132, kb = dB / 112, m = (dF - dB) / 400, off = dB + m * 200;
  const walking = o.walk !== undefined && o.walk !== null && kf === 0, wph = walking ? o.walk : 0;
  const col = o.col || ELE31, lit = o.lit === undefined ? 1 : o.lit;
  const dk = mix(col, '#140c08', 0.35), dk2 = mix(col, '#140c08', 0.52), lt = mix(col, '#fff0dc', 0.22 * lit), ink = 'rgba(24,14,8,0.55)';
  const P = (bx, by) => [bx, by + off + m * bx];
  c.save(); c.translate(x, y); c.scale(s * dir, s);
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(20, 4, 270 + kf * 60, 22, 0, 0, 6.283); c.fill();
  const bob = walking ? Math.sin(wph * 12.566) * 3 : 0;
  const leg = (hx, hy, ph, far, front) => {
    const top = P(hx, hy + bob), A = 36;
    let fx = 0, lift = 0;
    if (walking) { const u = (((wph + ph) % 1) + 1) % 1; if (u < 0.35) { const q = u / 0.35; fx = lerp(-A, A, ease(q)); lift = Math.sin(Math.PI * q) * 20; } else fx = lerp(A, -A, (u - 0.35) / 0.65); }
    const kk = front ? kf : kb;
    const kneeS = [hx + fx * 0.45 + (front ? 4 : -6), -122 - lift * 0.6], footS = [hx + fx, -lift];
    const kneeK = front ? [hx + 20, -26] : [hx + 22, -28], footK = front ? [hx - 56, -22] : [hx - 112, -20];
    const knee = [lerp(kneeS[0], kneeK[0], kk), lerp(kneeS[1], kneeK[1], kk)], foot = [lerp(footS[0], footK[0], kk), lerp(footS[1], footK[1], kk)];
    const cc = far ? dk2 : mix(col, '#140c08', 0.12), shade = far ? mix(dk2, '#000000', 0.15) : dk;
    const lg = c.createLinearGradient(0, top[1] - 40, 0, 0); lg.addColorStop(0, far ? dk2 : col); lg.addColorStop(1, far ? mix(dk2, '#000000', 0.15) : mix(col, '#140c08', 0.3));
    if (!far) { c.fillStyle = col; c.beginPath(); c.ellipse(top[0] + (front ? 6 : -4), top[1] - 26, front ? 52 : 60, 62, 0, 0, 6.283); c.fill(); } // shoulder / thigh mass
    limb(c, [top[0], top[1] - 20], [lerp(top[0], knee[0], 0.5) + (front ? 4 : -8), lerp(top[1], knee[1], 0.5)], knee, front ? 90 : 100, 68, lg);
    limb(c, knee, [lerp(knee[0], foot[0], 0.5), lerp(knee[1], foot[1], 0.5)], [foot[0], foot[1] - 8 * (1 - kk)], 68, 60, lg);
    if (!far) { c.strokeStyle = 'rgba(24,14,8,0.35)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(knee[0] + 33, knee[1]); c.lineTo(foot[0] + 30, foot[1] - 8); c.moveTo(knee[0] - 33, knee[1]); c.lineTo(foot[0] - 30, foot[1] - 8); c.stroke(); }
    c.strokeStyle = hexA(shade, 0.7); c.lineWidth = 2.5; // wrinkles across the knee and the lower leg
    for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(knee[0] - 26, knee[1] + i * 9); c.quadraticCurveTo(knee[0], knee[1] + i * 9 + 5, knee[0] + 26, knee[1] + i * 9); c.stroke(); }
    if (kk < 0.6) { const a = 1 - kk / 0.6; c.globalAlpha *= 1; c.fillStyle = mix(cc, '#000000', 0.2); c.beginPath(); c.ellipse(foot[0], foot[1] - 7, 34, 9, 0, 0, 6.283); c.fill();
      c.fillStyle = hexA('#e8dcc8', 0.75 * a); [-18, -2, 14].forEach(tx => { c.beginPath(); c.ellipse(foot[0] + tx + 6, foot[1] - 10, 6, 5, 0, Math.PI, 0); c.fill(); }); }
    else { c.fillStyle = mix(cc, '#c8b8a0', 0.3); c.beginPath(); c.ellipse(foot[0] - 26, foot[1] - 30, 8, 26, 0, 0, 6.283); c.fill(); } // the sole, turned backward
  };
  leg(-122, -232, 0.5, true, false); leg(116, -236, 0.75, true, true);
  // ---- everything attached to the body follows its tilt (front drops first when kneeling)
  c.save(); c.transform(1, m, 0, 1, 0, off + bob);
  // tail
  const sw = Math.sin(T * 2.1) * 0.22 + (o.swish || 0);
  c.save(); c.translate(-208, -300); c.rotate(0.12 + sw); c.strokeStyle = dk; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-14, 60, -6, 120); c.stroke();
  c.fillStyle = dk2; c.beginPath(); c.ellipse(-6, 132, 7, 18, 0, 0, 6.283); c.fill(); c.restore();
  // far ear, peeking behind the head
  const flap = 0.86 + 0.14 * Math.sin(T * 2.3 + (o.ph || 0));
  c.save(); c.translate(170, -300); c.scale(1.14, 1.14); c.translate(-170, 300);
  c.fillStyle = dk2; c.beginPath(); c.moveTo(200, -380); c.bezierCurveTo(176, -440, 236, -446, 250, -400); c.lineTo(232, -360); c.closePath(); c.fill(); c.restore();
  // body
  const bodyPath = () => { c.beginPath(); c.moveTo(-210, -235); c.bezierCurveTo(-224, -300, -184, -354, -110, -358); c.bezierCurveTo(-40, -362, 40, -352, 100, -374);
    c.bezierCurveTo(150, -390, 190, -364, 202, -322); c.lineTo(206, -232); c.bezierCurveTo(200, -196, 160, -180, 120, -178); c.bezierCurveTo(40, -168, -80, -168, -150, -182);
    c.bezierCurveTo(-190, -190, -206, -205, -210, -235); c.closePath(); };
  const g = c.createLinearGradient(0, -390, 0, -170); g.addColorStop(0, lt); g.addColorStop(0.45, col); g.addColorStop(1, dk);
  bodyPath(); c.fillStyle = g; c.fill(); c.strokeStyle = ink; c.lineWidth = 3; c.stroke();
  c.save(); bodyPath(); c.clip();
  const g2 = c.createLinearGradient(-220, 0, 210, 0); g2.addColorStop(0, hexA(dk2, 0.55)); g2.addColorStop(0.25, hexA(dk2, 0)); g2.addColorStop(0.8, hexA(dk2, 0)); g2.addColorStop(1, hexA(dk2, 0.3)); c.fillStyle = g2; c.fillRect(-240, -400, 470, 240);
  c.strokeStyle = hexA(dk2, 0.45); c.lineWidth = 2.5; // skin folds on the flank, the shoulder and the hip
  [[-150, -330, -160, -200], [-120, -340, -130, -190], [130, -350, 120, -200], [150, -340, 156, -210], [0, -340, 6, -190]].forEach(([a, b, cc, d], i) => { c.beginPath(); c.moveTo(a, b); c.quadraticCurveTo(a + (i % 2 ? 14 : -14), (b + d) / 2, cc, d); c.stroke(); });
  for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-60 + i * 24, -190); c.quadraticCurveTo(-50 + i * 24, -205, -40 + i * 24, -190); c.stroke(); }
  c.strokeStyle = hexA('#fff4e0', 0.28 * lit); c.lineWidth = 5; c.beginPath(); c.moveTo(-180, -330); c.bezierCurveTo(-120, -360, 40, -352, 100, -372); c.stroke();
  c.restore();
  c.restore();
  leg(-150, -228, 0, false, false); leg(92, -232, 0.25, false, true);
  c.save(); c.transform(1, m, 0, 1, 0, off + bob);
  // caparison: deep red cloth over the back, gold border with lozenges, tassels; a rope collar with a bell
  if (o.cap !== false) {
    const cg = c.createLinearGradient(0, -380, 0, -230); cg.addColorStop(0, '#a8282a'); cg.addColorStop(1, '#5e1216');
    c.fillStyle = cg; c.beginPath(); c.moveTo(-150, -352); c.bezierCurveTo(-60, -364, 40, -352, 100, -372); c.lineTo(122, -252);
    for (let i = 0; i <= 8; i++) { const xx = lerp(122, -160, i / 8); c.quadraticCurveTo(xx + 17, -230, xx, -246); } c.closePath(); c.fill(); c.strokeStyle = ink; c.lineWidth = 2.5; c.stroke();
    c.strokeStyle = '#e6c060'; c.lineWidth = 9; c.beginPath(); c.moveTo(-156, -262); c.lineTo(120, -268); c.stroke();
    c.fillStyle = '#7a1418'; for (let i = 0; i < 9; i++) { const xx = -140 + i * 31; c.beginPath(); c.moveTo(xx, -268); c.lineTo(xx + 6, -263); c.lineTo(xx, -258); c.lineTo(xx - 6, -263); c.closePath(); c.fill(); }
    c.strokeStyle = 'rgba(255,220,150,0.25)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-140, -340); c.bezierCurveTo(-60, -350, 40, -340, 96, -358); c.stroke();
    c.fillStyle = '#d8a848'; for (let i = 0; i <= 8; i++) { const xx = lerp(122, -160, i / 8) + 8; c.beginPath(); c.ellipse(xx, -232 + Math.sin(T * 2 + i) * 1.5, 4, 9, 0, 0, 6.283); c.fill(); }
    c.fillStyle = '#e6c060'; c.beginPath(); c.arc(-20, -310, 16, 0, 6.283); c.fill(); c.fillStyle = '#9a2024'; c.beginPath(); c.arc(-20, -310, 9, 0, 6.283); c.fill();
  }
  c.translate(170, -300); c.scale(1.14, 1.14); c.translate(-170, 300); // a bigger head
  // head
  const headPath = () => { c.beginPath(); c.moveTo(160, -358); c.bezierCurveTo(168, -414, 252, -420, 270, -374); c.bezierCurveTo(284, -340, 286, -292, 274, -262);
    c.lineTo(236, -236); c.bezierCurveTo(206, -230, 176, -258, 160, -300); c.closePath(); };
  const hg = c.createLinearGradient(150, -420, 280, -240); hg.addColorStop(0, lt); hg.addColorStop(0.5, col); hg.addColorStop(1, dk);
  headPath(); c.fillStyle = hg; c.fill(); c.strokeStyle = ink; c.lineWidth = 3; c.stroke();
  if (o.cap !== false) { c.fillStyle = '#8e1c20'; c.beginPath(); c.moveTo(196, -404); c.quadraticCurveTo(240, -414, 266, -384); c.lineTo(276, -330); c.quadraticCurveTo(250, -320, 228, -334); c.closePath(); c.fill();
    c.strokeStyle = '#e6c060'; c.lineWidth = 4; c.stroke(); c.fillStyle = '#e6c060'; c.beginPath(); c.arc(252, -366, 8, 0, 6.283); c.fill(); }
  c.fillStyle = '#1a100a'; c.beginPath(); c.ellipse(238, -322, 5, 4, 0.2, 0, 6.283); c.fill(); // eye
  c.strokeStyle = hexA(dk2, 0.6); c.lineWidth = 2; c.beginPath(); c.arc(238, -322, 10, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
  // trunk (hanging -> raised), ringed; resting on the ground when the elephant kneels
  const tr = clamp(o.trunk || 0), swy = Math.sin(T * 1.4 + (o.ph || 0)) * 7 * (1 - tr);
  const gnd = xs => { const bx = 170 + (xs - 170) * 1.14; return (-20 - (off + m * bx) + 300) / 1.14 - 300; }; // ground level in the (scaled) head coordinates
  const q0 = [266, -276], q1 = [lerp(300, 336, tr), lerp(-196, -330, tr)], q2 = [lerp(294 + swy * 0.5, 342, tr), lerp(-112, -420, tr)];
  const q3 = [lerp(288 + swy, 328, tr), lerp(-52, -470, tr)], q4 = [lerp(308 + swy, 296, tr), lerp(-26, -486, tr)];
  [q1, q2, q3, q4].forEach((q, i) => { const gy = gnd(q[0]) - [70, 30, 8, 0][i]; if (q[1] > gy) { q[1] = gy; q[0] += (i + 1) * 12 * kf; } });
  limb(c, q0, q1, q2, 58, 38, col, 14); limb(c, q2, q3, q4, 38, 18, col, 14);
  c.strokeStyle = hexA(dk2, 0.55); c.lineWidth = 2; // rings
  const pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, d = u * u; pts.push([a * q0[0] + b * q1[0] + d * q2[0], a * q0[1] + b * q1[1] + d * q2[1], lerp(29, 19, u)]); }
  for (let i = 1; i <= 10; i++) { const u = i / 10, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, d = u * u; pts.push([a * q2[0] + b * q3[0] + d * q4[0], a * q2[1] + b * q3[1] + d * q4[1], lerp(19, 9, u)]); }
  for (let i = 1; i < pts.length - 1; i++) { const [px0, py0, w] = pts[i], dx = pts[i + 1][0] - pts[i - 1][0], dy = pts[i + 1][1] - pts[i - 1][1], l = Math.hypot(dx, dy) || 1;
    c.beginPath(); c.moveTo(px0 - dy / l * w * 0.8, py0 + dx / l * w * 0.8); c.lineTo(px0 + dy / l * w * 0.8, py0 - dx / l * w * 0.8); c.stroke(); }
  c.fillStyle = '#2a1a12'; c.beginPath(); c.moveTo(232, -244); c.quadraticCurveTo(246, -232, 258, -246); c.quadraticCurveTo(246, -240, 232, -244); c.fill(); // mouth
  limb(c, [246, -252], [298, -226], [330, -262], 17, 4, '#efe4cc', 10); // tusk
  c.strokeStyle = 'rgba(120,100,70,0.5)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(250, -248); c.quadraticCurveTo(296, -230, 326, -260); c.stroke();
  // near ear, fanning
  c.save(); c.translate(186, -320); c.scale(flap, 1); c.translate(-186, 320);
  const eg = c.createLinearGradient(80, 0, 190, 0); eg.addColorStop(0, dk); eg.addColorStop(1, mix(col, '#fff0dc', 0.1 * lit));
  c.fillStyle = eg; c.beginPath(); c.moveTo(192, -392); c.bezierCurveTo(110, -420, 62, -350, 74, -282); c.bezierCurveTo(84, -220, 140, -196, 180, -240); c.bezierCurveTo(190, -270, 186, -330, 192, -392); c.closePath(); c.fill();
  c.strokeStyle = ink; c.lineWidth = 3; c.stroke();
  c.strokeStyle = hexA(dk2, 0.5); c.lineWidth = 2; [[170, -370, 110, -330, 96, -280], [176, -320, 120, -300, 112, -250], [178, -280, 140, -262, 140, -228]].forEach(v => { c.beginPath(); c.moveTo(v[0], v[1]); c.quadraticCurveTo(v[2], v[3], v[4], v[5]); c.stroke(); });
  c.strokeStyle = hexA('#fff0dc', 0.22 * lit); c.lineWidth = 3; c.beginPath(); c.moveTo(186, -392); c.bezierCurveTo(116, -410, 70, -350, 78, -290); c.stroke();
  c.restore();
  if (o.cap !== false) { c.strokeStyle = '#6a4a2a'; c.lineWidth = 7; c.beginPath(); c.moveTo(168, -372); c.quadraticCurveTo(196, -300, 186, -236); c.stroke(); // collar rope + bell
    c.fillStyle = '#c89a3a'; c.beginPath(); c.moveTo(178, -238); c.quadraticCurveTo(186, -262, 196, -238); c.lineTo(200, -222); c.lineTo(174, -222); c.closePath(); c.fill(); }
  c.restore();
  c.restore();
}

// ---------- a swallow-like bird (« oiseaux par volées », Al-Fil 3). Detailed side view: forked tail, long pointed wings, chestnut throat,
// one stone in the beak and two in the feet (Ibn Ishaq). Far birds: a flapping "M" silhouette.
function stone31(c, x, y, r) { c.fillStyle = '#7a3e22'; c.beginPath(); c.ellipse(x, y, r * 1.1, r, 0.3, 0, 6.283); c.fill(); c.fillStyle = 'rgba(230,150,100,0.6)'; c.beginPath(); c.arc(x - r * 0.3, y - r * 0.35, r * 0.4, 0, 6.283); c.fill(); }
function swallow31(c, x, y, s, T, o = {}) {
  const f = Math.sin(T * (o.rate || 15) + (o.ph || 0)), col = o.col || '#1f1c26';
  c.save(); c.translate(x, y); c.rotate(o.ang || 0); c.scale(s * (o.dir || 1), s);
  c.fillStyle = mix(col, '#000000', 0.25); c.beginPath(); c.moveTo(4, -6); c.quadraticCurveTo(-18, -40 * f - 14, -46, -70 * f - 6); c.quadraticCurveTo(-20, -30 * f, -10, -2); c.closePath(); c.fill(); // far wing
  c.fillStyle = col; c.beginPath(); c.moveTo(-34, -2); c.lineTo(-82, -10); c.lineTo(-48, 2); c.lineTo(-80, 12); c.lineTo(-34, 5); c.closePath(); c.fill(); // forked tail
  c.beginPath(); c.moveTo(-38, 0); c.bezierCurveTo(-20, -12, 18, -14, 30, -8); c.bezierCurveTo(38, -4, 36, 6, 26, 8); c.bezierCurveTo(10, 12, -20, 8, -38, 3); c.closePath(); c.fill(); // body
  c.fillStyle = '#e8dcc8'; c.beginPath(); c.moveTo(-26, 5); c.bezierCurveTo(-6, 11, 14, 10, 22, 6); c.bezierCurveTo(10, 4, -10, 4, -26, 5); c.fill(); // pale belly
  c.fillStyle = '#9a4a2a'; c.beginPath(); c.ellipse(28, 2, 6, 5, 0, 0, 6.283); c.fill(); // chestnut throat
  c.fillStyle = col; c.beginPath(); c.arc(28, -5, 8, 0, 6.283); c.fill(); c.beginPath(); c.moveTo(34, -8); c.lineTo(45, -4); c.lineTo(34, -1); c.fill(); // head, beak
  c.fillStyle = '#e8e0d0'; c.beginPath(); c.arc(31, -7, 1.6, 0, 6.283); c.fill();
  if (o.stones !== false) { stone31(c, 47, -4, 4.2); c.strokeStyle = '#3a2a20'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(2, 8); c.lineTo(0, 16); c.moveTo(10, 8); c.lineTo(11, 17); c.stroke(); stone31(c, -1, 19, 4.2); stone31(c, 11, 20, 4.2); }
  c.fillStyle = col; c.beginPath(); c.moveTo(6, -6); c.quadraticCurveTo(-14, -48 * f - 10, -40, -78 * f + 6); c.quadraticCurveTo(-12, -34 * f + 2, -8, 0); c.closePath(); c.fill(); // near wing
  c.strokeStyle = 'rgba(160,170,200,0.25)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(4, -5); c.quadraticCurveTo(-14, -46 * f - 8, -38, -76 * f + 6); c.stroke();
  c.restore();
}
function birdM31(c, x, y, s, T, ph, col) { const f = Math.sin(T * 14 + ph); c.strokeStyle = col; c.lineWidth = Math.max(1.6, 3.2 * s); c.lineCap = 'round';
  c.beginPath(); c.moveTo(x - 16 * s, y - 9 * s * f); c.quadraticCurveTo(x - 7 * s, y - 6 * s * f - 3 * s, x, y); c.quadraticCurveTo(x + 7 * s, y - 6 * s * f - 3 * s, x + 16 * s, y - 9 * s * f); c.stroke();
  c.fillStyle = col; c.beginPath(); c.ellipse(x, y + 1 * s, 3.4 * s, 2.2 * s, 0, 0, 6.283); c.fill(); }
// a flock crossing the sky from the left (toward the army). k = density 0..1 (birds enter from the edge, never fade in), t0 = start time
function flock31(c, T, o = {}) { const r = rng(o.seed || SEED31 + 1), n = Math.round((o.n || 160) * clamp(o.k === undefined ? 1 : o.k)), t0 = o.t0 || 0, col = o.col || '#1c1820';
  for (let i = 0; i < n; i++) { const yy = (o.y0 || 300) + r() * (o.h || 700), sp = (o.sp || 150) * (0.75 + r() * 0.5), s = (o.s || 1) * (0.5 + r() * 0.8) * (0.7 + (yy - (o.y0 || 300)) / (o.h || 700) * 0.5), lag = r() * (o.spread || 1600);
    const x = (o.x0 === undefined ? -200 : o.x0) + (T - t0) * sp - lag; if (x < -400 || x > (o.xMax || 2200)) continue;
    birdM31(c, x, yy + Math.sin(T * 1.3 + i) * 14, s, T, i * 1.7, col); } }
// stones of baked clay falling (seen from far away): short dark streaks, a puff of dust where each one lands. Nothing else.
function pebbleRain31(c, T, x0, x1, ytop, gy, k, seed = SEED31 + 5, n = 70) { if (k <= 0) return; T += 100; const r = rng(seed);
  for (let i = 0; i < Math.round(n * k); i++) { const per = 0.7 + r() * 0.6, ph = ((T / per + r()) % 1), x = lerp(x0, x1, r()) + ph * 40, gyy = gy(x) - r() * 60, y = lerp(ytop + r() * 200, gyy, Math.pow(ph, 1.6));
    if (ph < 0.9) { const g = c.createLinearGradient(x - 14, y - 44, x, y); g.addColorStop(0, 'rgba(60,30,16,0)'); g.addColorStop(1, 'rgba(60,30,16,0.85)'); c.strokeStyle = g; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 14, y - 44); c.lineTo(x, y); c.stroke(); c.fillStyle = '#6a3018'; c.beginPath(); c.arc(x, y, 4.4, 0, 6.283); c.fill(); }
    else { const q = (ph - 0.9) / 0.1; c.fillStyle = `rgba(215,185,145,${0.65 * (1 - q)})`; c.beginPath(); c.ellipse(x, gyy - q * 10, 14 + q * 50, 6 + q * 22, 0, 0, 6.283); c.fill(); } } }
function dust31(c, T, x, y, s, k, seed = SEED31 + 6, col = '#c8a882') { if (k <= 0) return; smoke(c, T + 100, x, y, 10, seed, col, 0.32 * k, s, 22); }
// a far soldier (tiny silhouette with spear and shield) for the back ranks
function tinySol31(c, x, y, h, T, i, o = {}) { const r = rng(SEED31 + 40 + i), bob = o.walk ? Math.abs(Math.sin(o.walk * Math.PI)) * h * 0.03 : 0, d = o.dir || 1, lt = o.light === undefined ? 1 : o.light;
  const body = mix(['#3a2a22', '#2e2a2a', '#4a3022', '#5a2420'][i % 4], '#c8a888', 0.18 * lt), wr = mix(['#5a3a2a', '#7a2a24', '#3a3a40'][i % 3], '#c8a888', 0.2 * lt);
  c.save(); c.translate(x, y - bob);
  if (o.walk) { const S = Math.sin(o.walk * 6.283) * h * 0.08; c.strokeStyle = body; c.lineWidth = h * 0.07; c.beginPath(); c.moveTo(-S, 0); c.lineTo(0, -h * 0.35); c.lineTo(S, 0); c.stroke(); }
  c.fillStyle = body; c.beginPath(); c.moveTo(-h * 0.13, -h * 0.05); c.lineTo(-h * 0.1, -h * 0.72); c.lineTo(h * 0.1, -h * 0.72); c.lineTo(h * 0.13, -h * 0.05); c.closePath(); c.fill();
  c.fillStyle = wr; c.beginPath(); c.arc(0, -h * 0.82, h * 0.1, 0, 6.283); c.fill();
  if (o.spear !== false) { c.strokeStyle = '#2a1a10'; c.lineWidth = Math.max(1, h * 0.025); c.beginPath(); c.moveTo(d * h * 0.18, 0); c.lineTo(d * h * 0.22, -h * 1.35 - r() * h * 0.1); c.stroke(); c.fillStyle = '#c8c0b0'; c.beginPath(); c.moveTo(d * h * 0.22, -h * 1.48); c.lineTo(d * h * 0.25, -h * 1.33); c.lineTo(d * h * 0.19, -h * 1.33); c.fill(); }
  c.fillStyle = '#6a4a22'; c.beginPath(); c.ellipse(-d * h * 0.1, -h * 0.45, h * 0.1, h * 0.16, 0, 0, 6.283); c.fill();
  c.restore(); }
// ranks of far soldiers in perspective on a ground line gy(x); dist = marching distance (0 = standing)
function ranks31(c, T, o) { const gy = o.gy, rows = o.rows || 4, dir = o.dir || 1;
  for (let rw = 0; rw < rows; rw++) { const dy = rw * (o.dy || 26), h = (o.h || 60) * (1 + rw * 0.18), n = o.n || 18, sp = (o.x1 - o.x0) / n;
    for (let i = 0; i < n; i++) { const xx = o.x0 + (i + (rw % 2) * 0.5) * sp + (o.dist || 0) * dir, y = gy(xx) + dy + Math.sin(i * 2.3 + rw) * 4;
      if (o.clipX && (xx < o.clipX[0] || xx > o.clipX[1])) continue;
      tinySol31(c, xx, y, h, T, i + rw * 7, { walk: o.dist ? (o.dist / (h * 0.9) + i * 0.37) : 0, dir, light: o.light }); }
    if (o.flags) for (let i = 0; i < 3; i++) { const xx = o.x0 + (i + 0.5) * (o.x1 - o.x0) / 3 + (o.dist || 0) * dir + rw * 40; if (rw === 1) flag(c, xx, gy(xx) + dy - h * 0.9, h / 70, T, i % 2 ? '#8a1e22' : '#c89a3a', i); } } }

// ---------- outside Mecca: the plain where the army stood (al-Mughammas / the valley of Muhassir, the exegetes), the dark granite
// mountains of Mecca, and far away in the gap between them, the town and the Kaaba. Near ground gY31 (or o.gy) where people stand.
const gY31 = x => 1640 + Math.sin(x * 0.0037 + 0.4) * 14 - (x - 540) * 0.018;
const HZ31 = 1236, KXo31 = 868, KYo31 = 1226;
const mtEnv31 = x => Math.pow(clamp(Math.abs(x - 860) / 300), 1.25);
const mtL31 = [ // three ranges, far to near: [amplitude, seed, colour day, colour night, rim]
  [340, SEED31 + 2, '#9a7a80', '#20223a', 0.35], [250, SEED31 + 3, '#6e4c44', '#18182a', 0.3], [140, SEED31 + 4, '#4e342c', '#121220', 0.22]];
const mtP31 = (x, L) => { const [amp, sd] = L; const big = 0.5 + 0.5 * noise1(x * 0.0035, sd), jag = Math.abs(noise1(x * 0.022, sd + 1) - 0.5) * 2;
  return amp * mtEnv31(x) * (0.45 + 0.55 * big) * (0.82 + 0.18 * jag) + noise1(x * 0.08, sd + 2) * 8 * mtEnv31(x) + 6; };
const mtH31 = x => Math.max(...mtL31.map(L => mtP31(x, L)));
function meccaRange31(c, T, nt, o = {}) {
  const x0 = -1500, x1 = 2600, hz = mix(o.haze || '#f0c0a0', '#1e2440', nt);
  mtL31.forEach((L, li) => { const base = mix(L[2], L[3], nt), yb = HZ31 + 10 - li * 0, f = x => yb - mtP31(x, L) - (2 - li) * 10;
    const g = c.createLinearGradient(0, yb - L[0], 0, yb); g.addColorStop(0, mix(base, '#ffe0c8', 0.12 * (1 - nt))); g.addColorStop(1, mix(base, '#000000', 0.15));
    c.fillStyle = g; c.beginPath(); c.moveTo(x0, yb + 80); for (let x = x0; x <= x1; x += 8) c.lineTo(x, f(x)); c.lineTo(x1, yb + 80); c.closePath(); c.fill();
    c.save(); c.clip();
    const r = rng(L[1] + 9); c.strokeStyle = hexA(mix(base, '#000000', 0.45), 0.4); c.lineWidth = 2.5; // ravines running down from the crests
    for (let i = 0; i < 60; i++) { const x = x0 + r() * (x1 - x0), top = f(x), hh = yb - top; if (hh < 50) continue; c.beginPath(); c.moveTo(x, top + 6); c.quadraticCurveTo(x + (r() - 0.5) * 30, top + hh * 0.35, x + (r() - 0.5) * 50, top + hh * (0.5 + r() * 0.35)); c.stroke(); }
    c.fillStyle = hexA(mix(base, '#000000', 0.35), 0.4); // the same crest shifted right and down: what it covers is in shadow, a lit band stays on the left-facing slopes
    c.beginPath(); c.moveTo(x0, yb + 80); for (let x = x0; x <= x1; x += 8) c.lineTo(x, f(x - 26) + 16); c.lineTo(x1, yb + 80); c.closePath(); c.fill();
    hazeW(c, yb + 20, 160 - li * 30, hz, 0.5 - li * 0.1);
    c.restore();
    c.strokeStyle = hexA(mix('#ffe0b8', '#7a80b0', nt), L[4]); c.lineWidth = 2.5; c.beginPath(); for (let x = x0; x <= x1; x += 8) { const y = f(x); x === x0 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke(); });
}
function meccaOut31(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx || 540, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 8) : [0, 0]));
  const nt = o.night || 0, px = o.px || 0, gy = o.gy || gY31, dkB = o.dark || 0;
  sky0(c, skyStops(o.sky || 'gold', o.to, o.k || 0));
  if (o.stars) stars(c, T, 150, SEED31 + 7, [-500, -300, W + 1000, 1100], o.stars);
  if (o.moonA) moon(c, o.moonX || 820, o.moonY || 360, 38, o.moonA);
  const sx = o.sunX === undefined ? 180 : o.sunX, sy = o.sunY === undefined ? 900 : o.sunY;
  if (o.sunA) bigSun30(c, sx, sy, o.sunR || 52, o.sunCol || '#ffc078', o.sunA);
  cloudBank(c, T, 330, 5, mix('#ffe6c8', '#22243c', nt), 0.13, SEED31 + 8, 6);
  if (dkB > 0) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, 1300); g.addColorStop(0, `rgba(20,14,22,${0.7 * dkB})`); g.addColorStop(1, `rgba(40,26,26,${0.25 * dkB})`); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }
  if (o.flockFar) o.flockFar(c);
  par(c, -0.9, px, 0, () => { ridgeW(c, HZ31 - 150, 60, 0.0026, SEED31 + 9, mix('#a890a0', '#141830', nt)); hazeW(c, HZ31 - 120, 180, mix('#f6d0b0', '#1e2440', nt), 0.5); });
  par(c, -0.6, px, 0, () => {
    meccaRange31(c, T, nt, o);
    // Mecca in the gap: a few houses and the Kaaba (o.kLight = soft light on the House)
    city(c, 770, 980, HZ31 + 4, 26, 0.32, mix('#b08868', '#2a2638', nt * 0.9), SEED31 + 10);
    if (o.kLight) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, KXo31, KYo31 - 20, 160, '#fff0d0', 0.5 * o.kLight); c.restore(); }
    kaaba(c, KXo31, KYo31, 0.18, { lit: 1 - nt });
    if (o.hide) { const r = rng(SEED31 + 11); for (let i = 0; i < 26; i++) { const xx = (i < 14 ? 300 + r() * 380 : 1040 + r() * 360), f = 0.2 + r() * 0.4, yy = HZ31 - mtP31(xx, mtL31[2]) * f;
      const q = clamp(o.hide * 1.4 - r() * 0.4); if (q <= 0) continue; tinySol31(c, xx, yy, 19, T, i, { spear: false, light: 0.75 }); } }
    hazeW(c, HZ31 + 30, 90, mix(o.haze || '#f0c0a0', '#1e2440', nt), 0.35);
  });
  par(c, -0.3, px, 0, () => { // the plain toward the mountains
    const lc = mix('#b89068', '#1a1820', nt * 0.85), hz = mix(o.haze || '#f0c8a0', '#1e2440', nt);
    const g = c.createLinearGradient(0, HZ31, 0, 1660); g.addColorStop(0, mix(lc, hz, 0.55)); g.addColorStop(1, lc); c.fillStyle = g; c.fillRect(-2600, HZ31 - 2, 6300, 700);
    const ra = rng(SEED31 + 12); for (let i = 0; i < 16; i++) { const x = -1400 + i * 260 + ra() * 160, y = HZ31 + 40 + ra() * 110, k = 0.35 + (y - HZ31) / 280;
      if (i % 3 === 0) rock(c, x, y, 110 * k, 60 * k, mix('#7a5a48', '#141218', nt * 0.8), SEED31 + 13 + i); else acacia(c, x, y, 0.45 * k, mix('#4a5432', '#0e120e', nt * 0.8), T); }
    if (o.farArmy) o.farArmy(c);
    if (o.midFx) o.midFx(c);
    hazeW(c, HZ31 + 200, 160, hz, 0.18);
  });
  if (o.flockMid) o.flockMid(c);
  par(c, 0, px, 0, () => { // near ground
    const cc = mix('#a8845e', '#16141c', nt * 0.82);
    const g = c.createLinearGradient(0, 1520, 0, H + 200); g.addColorStop(0, mix(cc, '#fff0d0', 0.14 * (1 - nt))); g.addColorStop(0.4, cc); g.addColorStop(1, mix(cc, '#140c06', 0.5));
    c.fillStyle = g; c.beginPath(); c.moveTo(-2600, H + 900); for (let x = -2600; x <= 3800; x += 16) c.lineTo(x, gy(x)); c.lineTo(3800, H + 900); c.closePath(); c.fill();
    c.strokeStyle = hexA(mix(cc, '#fff2d8', 0.4), 0.35 * (1 - nt * 0.7)); c.lineWidth = 3; c.beginPath(); for (let x = -2600; x <= 3800; x += 16) x === -2600 ? c.moveTo(x, gy(x) + 1) : c.lineTo(x, gy(x) + 1); c.stroke();
    const r = rng(SEED31 + 14); for (let i = 0; i < 150; i++) { const x = -1500 + r() * 4200, y = gy(x) + 8 + Math.pow(r(), 1.5) * 380, k = 0.6 + (y - gy(x)) / 300;
      if (r() > 0.7) shrub(c, x, y, 0.3 * k, mix('#6a6034', '#101410', nt), T, SEED31 + 15 + i); else { c.fillStyle = mix('#7a6046', '#14121a', nt * 0.8); c.beginPath(); c.ellipse(x, y, 8 * k, 4 * k, 0, 0, 6.283); c.fill(); } }
    if (o.after31) after31(c, T, o.after31, gy, nt);
    if (o.walkers) o.walkers(c);
  });
  if (o.flockNear) o.flockNear(c);
  if (o.fg !== false) blurLayer(c, 9, bc => fgBrush(bc, T, { col: mix('#8a6a38', '#0c0c10', nt * 0.8), stone: mix('#6a4a3a', '#141218', nt * 0.8) }), 3);
  if (nt > 0) { c.fillStyle = `rgba(6,10,30,${0.25 * nt})`; c.fillRect(-900, -900, W + 1800, H + 1800); }
  if (o.after) o.after(c);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// what is left on the plain (Al-Fil 5: « comme de la paille mâchée »): dry broken stalks blown by the wind, spears and shields lying, a fallen banner
function after31(c, T, k, gy, nt = 0) { if (k <= 0) return; const r = rng(SEED31 + 20); c.save(); c.globalAlpha *= clamp(k);
  for (let i = 0; i < 12; i++) { const x = -300 + r() * 1700, y = gy(x) + 20 + r() * 260, s = 0.6 + (y - gy(x)) / 300, a = (r() - 0.5) * 0.5;
    c.strokeStyle = mix('#3a2614', '#101014', nt * 0.7); c.lineWidth = 5 * s; c.beginPath(); c.moveTo(x - Math.cos(a) * 120 * s, y - Math.sin(a) * 12 * s); c.lineTo(x + Math.cos(a) * 120 * s, y + Math.sin(a) * 12 * s); c.stroke();
    if (i % 3 === 0) { c.fillStyle = mix('#5a3a1a', '#101014', nt * 0.7); c.beginPath(); c.ellipse(x + 40 * s, y + 6 * s, 30 * s, 10 * s, 0, 0, 6.283); c.fill(); c.strokeStyle = mix('#b8944a', '#202024', nt * 0.7); c.lineWidth = 2 * s; c.stroke(); } }
  straw31(c, T, -400, 1500, gy, 1, nt, 220, 1);
  c.restore(); }
function straw31(c, T, x0, x1, gy, s, nt, n = 200, wind = 1, seed = SEED31 + 21) { const r = rng(seed); c.lineCap = 'round';
  for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0), y = gy(x) + 6 + Math.pow(r(), 1.3) * 330 * s, k = (0.6 + (y - gy(x)) / (300 * s)) * s, a = r() * 6.28, l = (14 + r() * 26) * k, sw = Math.sin(T * 3 + i) * 0.15 * wind;
    c.strokeStyle = mix(r() > 0.5 ? '#d8b878' : '#b8945a', '#202026', nt * 0.75); c.lineWidth = Math.max(1, 2.4 * k); c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a + sw) * l, y + Math.sin(a + sw) * l * 0.35); c.stroke(); } }
// chaff carried by the wind across the frame
function chaff31(c, T, k, seed = SEED31 + 22) { if (k <= 0) return; T += 100; const r = rng(seed); c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < 60; i++) { const sp = 120 + r() * 220, x = ((r() * 1600 + T * sp) % 1600) - 260, y = 600 + r() * 1300 + Math.sin(T * 2 + i) * 30, a = T * 3 + i;
    c.strokeStyle = `rgba(222,196,140,${0.55 * k})`; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 12, y + Math.sin(a) * 5); c.stroke(); } c.restore(); }

// ---------- the hero shot (hook / loop): the elephant kneeling before Mecca at dawn, soldiers pulling and pushing in vain, the army behind
const HERO31 = { sky: 'dawn', to: 'gold', k: 0.55, sunA: 0.9, sunX: 150, sunY: 980, kLight: 0.7, z: 1.12, cx: 560, cy: 1400 };
const EX31 = 500;
function heroArmy31(c, T, o = {}) {
  ranks31(c, T, { gy: x => 1540 + (x - 540) * 0.02, x0: -760, x1: 380, rows: 4, h: 56, dy: 30, n: 16, flags: true, light: 0.9 });
}
function heroNear31(c, T, o = {}) {
  const ex = o.ex === undefined ? EX31 : o.ex, ey = gY31(ex) + 50, es = o.es || 1.0, eo = { dir: 1, kneel: o.kneel === undefined ? 1 : o.kneel, trunk: o.trunk || 0, lit: 1.05 };
  const pull = 0.6 + 0.15 * Math.sin(T * 2.4), rope = eleAnchor31(ex, ey, es, eo, 180, -330);
  [[110, 1690, 2, 1], [230, 1700, 0, 1]].forEach(([x, y, i, d], j) => sold31(c, i, { x, y, h: 310 + (y - 1690) * 0.9, dir: d, t: T + j, light: 0.95, wind: 0.4, ink: 0.7, armUp: j === 1 ? 0.35 + 0.15 * Math.sin(T * 3) : 0 }));
  elephant31(c, ex, ey, es, T, eo);
  sold31(c, 3, { x: ex - 250 * es, y: ey + 70, h: 360, dir: 1, t: T + 2, light: 1.0, wind: 0.4, ink: 0.75, reach: 0.85, noSpear: true });
  const px = 900, py = 1800, ph = 390, hand = handOf({ x: px, y: py, h: ph, dir: -1, reach: pull });
  c.strokeStyle = '#7a5a34'; c.lineWidth = 7; c.beginPath(); c.moveTo(rope[0], rope[1]); c.quadraticCurveTo((rope[0] + hand[0]) / 2, Math.max(rope[1], hand[1]) + 40, hand[0], hand[1]); c.stroke();
  lean(c, px, py, 0.12, () => sold31(c, 4, { x: px, y: py, h: ph, dir: -1, t: T + 5, light: 1.0, wind: 0.5, ink: 0.75, reach: pull, noSpear: true }));
  sold31(c, 1, { x: 60, y: 1880, h: 470, dir: 1, t: T + 7, light: 1.0, wind: 0.4, ink: 0.75 });
}
const hero31 = (c, T, o = {}) => meccaOut31(c, T, Object.assign({}, HERO31, { farArmy: cc => heroArmy31(cc, T, o), walkers: o.nearOff ? null : cc => heroNear31(cc, T, o) }, o));
function heroTexts31(c, a) { if (a <= 0) return; topShade(c, 1.3 * a); seriesTag31(c, a); bigWord27(c, 'UN ÉLÉPHANT GÉANT', 250, a, 88); bigWord27(c, 'A REFUSÉ D\'AVANCER', 355, a, 74, '#f6c453'); }

// ---------- Sanaa: the Yemeni highlands, tower houses, and the great church Abraha built (al-Qullays, Ibn Ishaq): marble, gold, domes
function church31(c, x, y, s, T, o = {}) { c.save(); c.translate(x, y); c.scale(s, s);
  const mar = '#ece2d0', mdk = '#b8a890', gold = '#e0b050';
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(0, 6, 420, 26, 0, 0, 6.283); c.fill();
  for (let i = 0; i < 4; i++) { c.fillStyle = mix(mdk, '#ffffff', i * 0.08); c.fillRect(-400 + i * 18, -i * 16 - 16, 800 - i * 36, 16); } // steps
  const by = -64; // hall
  const g = c.createLinearGradient(-330, 0, 330, 0); g.addColorStop(0, mix(mar, '#000000', 0.2)); g.addColorStop(0.6, mar); g.addColorStop(1, mix(mar, '#ffffff', 0.3)); c.fillStyle = g; c.fillRect(-330, by - 300, 660, 300);
  c.fillStyle = '#7a2a22'; c.fillRect(-330, by - 304, 660, 14); c.fillStyle = gold; c.fillRect(-330, by - 312, 660, 8); c.fillRect(-330, by - 150, 660, 6);
  for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? '#6a8a8a' : '#a8603a'; c.fillRect(-330 + i * 110, by - 290, 110, 10); } // coloured marble band
  for (let i = 0; i < 7; i++) { const ax = -280 + i * 93.3; if (i === 3) continue; c.fillStyle = '#2a1810'; c.beginPath(); archPath(c, ax, by - 20, 54, 110); c.fill(); c.fillStyle = hexA('#ffc070', 0.35 + 0.1 * Math.sin(T * 2 + i)); c.beginPath(); archPath(c, ax, by - 26, 40, 96); c.fill();
    c.strokeStyle = gold; c.lineWidth = 3; c.beginPath(); archPath(c, ax, by - 20, 60, 116); c.stroke();
    c.fillStyle = '#2a1810'; c.beginPath(); archPath(c, ax, by - 175, 40, 80); c.fill(); c.strokeStyle = gold; c.lineWidth = 2; c.beginPath(); archPath(c, ax, by - 175, 46, 86); c.stroke(); }
  c.fillStyle = '#3a2416'; c.beginPath(); archPath(c, 0, by, 110, 210); c.fill(); c.fillStyle = gold; c.beginPath(); archPath(c, 0, by, 92, 190); c.fill(); // gilded doors
  c.strokeStyle = '#8a6020'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, by); c.lineTo(0, by - 176); c.stroke(); for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(-22, by - 30 - k * 32, 4, 0, 6.283); c.arc(22, by - 30 - k * 32, 4, 0, 6.283); c.stroke(); }
  c.strokeStyle = '#f6d080'; c.lineWidth = 6; c.beginPath(); archPath(c, 0, by, 120, 220); c.stroke();
  const dome = (dx, dy, r) => { c.fillStyle = mar; c.fillRect(dx - r * 0.9, dy - r * 0.5, r * 1.8, r * 0.5); for (let k = 0; k < 6; k++) { c.fillStyle = '#2a1810'; c.beginPath(); archPath(c, dx - r * 0.7 + k * r * 0.28, dy - 6, r * 0.12, r * 0.3); c.fill(); }
    const dg = c.createRadialGradient(dx - r * 0.4, dy - r * 1.1, 0, dx, dy - r * 0.5, r * 1.3); dg.addColorStop(0, '#fff2c0'); dg.addColorStop(0.5, gold); dg.addColorStop(1, '#8a5a20');
    c.fillStyle = dg; c.beginPath(); c.moveTo(dx - r * 0.9, dy - r * 0.5); c.bezierCurveTo(dx - r * 0.9, dy - r * 1.5, dx + r * 0.9, dy - r * 1.5, dx + r * 0.9, dy - r * 0.5); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(120,70,20,0.5)'; c.lineWidth = 2; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(dx + k * r * 0.3, dy - r * 0.5); c.quadraticCurveTo(dx + k * r * 0.2, dy - r * 1.1, dx, dy - r * 1.25); c.stroke(); }
    c.fillStyle = gold; c.beginPath(); c.arc(dx, dy - r * 1.3, r * 0.08, 0, 6.283); c.fill(); };
  dome(-230, by - 312, 70); dome(230, by - 312, 70); dome(0, by - 312, 150);
  if (o.glint) { c.save(); c.globalCompositeOperation = 'lighter'; star4(c, -40, by - 470, 26 * o.glint, '#fff6d8', o.glint); c.restore(); }
  c.restore(); }
function sanaa31(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx || 540, o.cy || 1100);
  sky0(c, skyStops(o.sky || 'day', o.to || 'gold', o.k === undefined ? 0.4 : o.k));
  bigSun30(c, 860, 520, 46, '#ffe0a0', 0.8);
  cloudBank(c, T, 320, 6, '#fff6ea', 0.2, SEED31 + 30, 6);
  par(c, -0.8, o.px || 0, 0, () => { ridgeW(c, 900, 200, 0.0028, SEED31 + 31, '#8a8aa0'); hazeW(c, 930, 220, '#f0e0cc', 0.55); });
  par(c, -0.55, o.px || 0, 0, () => { ridgeW(c, 1080, 150, 0.0034, SEED31 + 32, '#7a7a58'); // terraced slopes of the highlands
    c.strokeStyle = 'rgba(60,70,40,0.35)'; c.lineWidth = 2; for (let k = 0; k < 9; k++) { c.beginPath(); for (let x = -1400; x <= 2400; x += 24) { const y = ridgeY(x, 1080, 150, 0.0034, SEED31 + 32) + 20 + k * 22; x === -1400 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke(); }
    hazeW(c, 1180, 200, '#f0e0cc', 0.45); });
  par(c, -0.35, o.px || 0, 0, () => { const r = rng(SEED31 + 33); // the town of tower houses
    for (let i = 0; i < 20; i++) { const x = -500 + i * 110 + r() * 40, h = 150 + r() * 180, w = 70 + r() * 40; if (x > 180 && x < 900 && h > 250) continue; towerHouse(c, x, 1330 + (i % 3) * 8, w, h, mix('#9a6040', '#c08a5a', r()), SEED31 + 34 + i, T); }
    hazeW(c, 1340, 100, '#f0e0cc', 0.25); });
  par(c, -0.15, o.px || 0, 0, () => { church31(c, 540, 1470, 0.82, T, { glint: o.glint || 0 }); });
  par(c, 0, o.px || 0, 0, () => { // paved square
    const g = c.createLinearGradient(0, 1460, 0, H + 200); g.addColorStop(0, '#cdb48e'); g.addColorStop(1, '#6a5238'); c.fillStyle = g; c.fillRect(-1600, 1466, 4200, 900);
    c.strokeStyle = 'rgba(90,64,40,0.35)'; c.lineWidth = 2; for (let k = 0; k < 10; k++) { const y = 1480 + k * k * 6 + k * 14; c.beginPath(); c.moveTo(-1600, y); c.lineTo(2600, y); c.stroke(); }
    for (let i = -14; i <= 14; i++) { c.beginPath(); c.moveTo(540 + i * 40, 1470); c.lineTo(540 + i * 200, 2000); c.stroke(); }
    if (o.walkers) o.walkers(c); });
  blurLayer(c, 9, bc => { towerHouse(bc, -90, 2100, 320, 900, '#7a4a30', SEED31 + 60, T); datePalm(bc, 1160, 2150, 2.4, '#3a4a26', T, SEED31 + 61); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- Abraha's camp: his great pavilion (striped cloth, gilded poles, a valance), carpets, his raised seat; guards; tents behind
function pavilion31(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx || 540, o.cy || 1150);
  const nt = o.night || 0;
  sky0(c, skyStops('dusk', 'gold', 0.35));
  bigSun30(c, 900, 1040, 54, '#ff9a5a', 0.85);
  cloudBank(c, T, 360, 5, '#ffd8b8', 0.14, SEED31 + 70, 5);
  par(c, -0.7, 0, 0, () => { meccaRange31(c, T, 0.15, { haze: '#e8a888' }); });
  par(c, -0.4, 0, 0, () => { const g = c.createLinearGradient(0, HZ31, 0, 1500); g.addColorStop(0, '#c08a68'); g.addColorStop(1, '#a07a58'); c.fillStyle = g; c.fillRect(-1600, HZ31, 4200, 400);
    [[-260, 1300, 0.55, '#8a6a4a'], [-60, 1290, 0.45, '#6a4a3a'], [1060, 1300, 0.55, '#7a5a40'], [1260, 1310, 0.6, '#8a6a4a'], [160, 1300, 0.4, '#5a4434']].forEach(([x, y, s, col], i) => bedTent(c, x, y, s, col, SEED31 + 71 + i));
    flag(c, -160, 1250, 0.9, T, '#8a1e22', 1); flag(c, 1160, 1250, 0.9, T, '#c89a3a', 2);
    if (o.ele !== false) elephant31(c, 1010, 1420, 0.36, T, { dir: -1, lit: 0.8 }); });
  { const g = c.createLinearGradient(0, 1440, 0, 2400); g.addColorStop(0, '#b08462'); g.addColorStop(1, '#5a3e2a'); c.fillStyle = g; c.fillRect(-1600, 1440, 4200, 1400); } // near ground
  // the pavilion
  const px = 360, py = 1500, pw = 620, ph = 520;
  c.save(); c.translate(px, py);
  c.fillStyle = 'rgba(10,6,4,0.35)'; c.beginPath(); c.ellipse(0, 6, pw * 0.62, 22, 0, 0, 6.283); c.fill();
  c.fillStyle = '#2a140e'; c.fillRect(-pw / 2 + 20, -ph + 60, pw - 40, ph - 60); // interior shadow
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -200, 300, '#ffb060', 0.35); c.restore();
  for (let i = 0; i < 3; i++) lanternBox(c, -180 + i * 180, -ph + 140, 0.9, T, i);
  const stripes = (x0, x1, y0, y1, n) => { for (let i = 0; i < n; i++) { c.fillStyle = i % 2 ? '#a8282a' : '#e8c890'; c.beginPath(); c.moveTo(lerp(x0, x1, i / n), y0); c.lineTo(lerp(x0, x1, (i + 1) / n), y0); c.lineTo(lerp(x0 - 30, x1 + 30, (i + 1) / n), y1); c.lineTo(lerp(x0 - 30, x1 + 30, i / n), y1); c.closePath(); c.fill(); } };
  c.save(); c.beginPath(); c.moveTo(-pw / 2 - 40, -ph + 80); c.quadraticCurveTo(0, -ph - 120, pw / 2 + 40, -ph + 80); c.closePath(); c.clip(); stripes(-pw / 2 - 60, pw / 2 + 60, -ph - 140, -ph + 90, 14); c.restore(); // roof
  c.fillStyle = '#e0b050'; for (let i = 0; i < 14; i++) { const xx = -pw / 2 - 40 + (i + 0.5) * (pw + 80) / 14; c.beginPath(); c.moveTo(xx - 24, -ph + 76); c.quadraticCurveTo(xx, -ph + 120, xx + 24, -ph + 76); c.fill(); } // valance
  c.fillStyle = '#7a1a1c'; c.fillRect(-pw / 2 - 40, -ph + 70, pw + 80, 12);
  [[-pw / 2 + 10, 1], [pw / 2 - 10, -1]].forEach(([sx, sd]) => { c.fillStyle = sd > 0 ? '#8a2024' : '#9a2a2a'; c.beginPath(); c.moveTo(sx - sd * 50, -ph + 80); c.quadraticCurveTo(sx + sd * 30, -ph * 0.5, sx + sd * 70, 0); c.lineTo(sx - sd * 40, 0); c.closePath(); c.fill(); // tied-back flaps
    c.strokeStyle = '#e0b050'; c.lineWidth = 4; c.stroke(); });
  c.fillStyle = '#c89a3a'; [-pw / 2 + 30, pw / 2 - 30].forEach(xx => { c.fillRect(xx - 6, -ph + 70, 12, ph - 70); c.beginPath(); c.arc(xx, -ph + 64, 12, 0, 6.283); c.fill(); });
  c.restore();
  rug(c, px, py + 60, 760, 120, '#7a1e22', {});
  // the raised seat (cushions on a gilded bench)
  c.fillStyle = '#8a6020'; c.fillRect(px - 110, py - 70, 220, 70); c.fillStyle = '#e0b050'; c.fillRect(px - 118, py - 78, 236, 12); c.fillRect(px - 110, py - 4, 220, 6);
  cushion(c, px - 10, py - 76, 1.4, '#a8282a'); c.fillStyle = '#6a1418'; c.beginPath(); c.roundRect(px - 90, py - 230, 180, 160, 30); c.fill(); c.strokeStyle = '#e0b050'; c.lineWidth = 5; c.stroke();
  if (o.people) o.people(c);
  blurLayer(c, 9, bc => { bedTent(bc, 1220, 2150, 1.6, '#5a3a2a', SEED31 + 80); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
const PAVY31 = 1500;
function pavPeople31(c, T, o = {}) {
  [[90, 1560, 0, 1], [640, 1556, 2, -1]].forEach(([x, y, i, d], j) => sold31(c, i, { x, y, h: 320, dir: d, t: T + j, light: 0.9, wind: 0.2, ink: 0.7 }));
  fig(c, ABRAHA, { x: 352, y: PAVY31 - 96, h: 330, pose: 'sit', dir: 1, t: T, light: 1.05, ink: 0.75, reach: o.aReach || 0, armUp: o.aUp || 0 });
  if (o.abdm !== false) fig(c, ABDM, { x: o.ax || 820, y: 1640, h: 400, dir: -1, t: T + 3, light: 1.1, wind: 0.4, ink: 0.75, staff: !o.mReach, reach: o.mReach || 0, armUp: o.mUp || 0, walk: o.mWalk });
  sold31(c, 3, { x: 1010, y: 1700, h: 420, dir: -1, t: T + 6, light: 0.95, wind: 0.3, ink: 0.7 });
}

// ---------- the climb: the Meccans leave for the mountains (Ibn Ishaq): a slope rising to the right, families walking up at dawn
const pY31 = x => 1690 - (x - 540) * 0.2 + Math.sin(x * 0.007) * 10;
function climbers31(c, T, dist, o = {}) {
  [[0, 0], [1, -150], [6, -260], [3, -420], [5, -560], [2, -700], [8, -840]].forEach(([wi, dx], i) => { const d = dist + dx, x = -100 + d * 0.92, y = pY31(x), h = 290 - (i % 2) * 20;
    fig(c, MECC31[wi], { x, y, h, dir: 1, t: T + i, light: o.light || 0.8, wind: 0.4, walk: stepOf(d * 1.02, h) + i * 0.31, ink: 0.7, child: i === 4, staff: i === 0 }); });
}

// ---------- small helpers of the episode
function mecca31(c, T, o = {}) { cam(c, o.z || 1, o.cx || 540, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 8) : [0, 0])); meccaSet(c, T, Object.assign({ noIdols: true }, o)); c.setTransform(1, 0, 0, 1, 0, 0); }
const DAWN31 = c => sky0(c, skyStops('dawn', 'gold', 0.5));
const DAY31 = c => sky0(c, skyStops('day', 'gold', 0.35));
function march31(c, T, dist, o = {}) { // the army on the move (plain30, near ground pgY30); every step driven by the distance
  const x0 = o.x0 || 0, gy = pgY30;
  ranks31(c, T, { gy: x => gy(x) + 4, x0: x0 - 1300, x1: x0 + 60, rows: 3, h: 74, dy: 16, n: 15, dist, flags: true, light: 0.95 });
  dust31(c, T, x0 + dist - 1000, gy(x0 + dist - 1000) - 10, 2.4, o.dust === undefined ? 0.8 : o.dust);
  const ex = x0 + dist + 120, es = o.es || 0.62; elephant31(c, ex, gy(ex) + 62, es, T, { dir: 1, walk: eleStep31(dist, es), trunk: o.trunk || 0 });
  [['A', 540, 120], [0, -20, 130], [2, -270, 150], [1, -500, 120], [3, -700, 165], [4, -900, 140], [0, -1100, 125]].forEach(([wi, dx, dy], i) => {
    const x = x0 + dist + dx, y = gy(x) + dy, h = 230 + dy * 0.9;
    if (wi === 'A') fig(c, ABRAHA, { x, y, h, dir: 1, t: T + i, light: 1.05, wind: 0.5, walk: stepOf(dist, h) + 0.2, ink: 0.75 });
    else sold31(c, wi, { x, y, h, dir: 1, t: T + i, light: 0.95, wind: 0.4, walk: stepOf(dist, h) + i * 0.31, ink: 0.7 }); });
}
function herd31(c, T, o = {}) { // the Meccans' camels grazing on the plain (o.drive: driven away to the left by soldiers, distance-driven)
  const d = o.drive || 0, gy = gY31;
  const cams = [[260, 70, -1, 0.62], [560, 40, 1, 0.56], [840, 90, -1, 0.66], [1100, 60, 1, 0.6], [20, 110, 1, 0.7], [700, 150, -1, 0.74]];
  cams.sort((a, b) => a[1] - b[1]).forEach(([x, dy, dr, s], i) => { const moving = d > 0, xx = moving ? x - d : x, dir = moving ? -1 : dr;
    camel(c, xx, gy(xx) + dy, s, mix('#9a6a42', '#4a2e1a', (i % 3) * 0.18), moving ? camelT(d, s) + i * 0.5 : T * 0.2 + i, dir, null, { walk: moving, head: moving ? 0 : 0.85 + 0.1 * Math.sin(T * 0.6 + i) }); });
  if (d > 0) [[1180, 120, 0], [1420, 80, 2], [1300, 170, 3]].forEach(([x, dy, wi], i) => { const xx = x - d, h = 300 + dy * 0.8; sold31(c, wi, { x: xx, y: gy(xx) + dy, h, dir: -1, t: T + i, light: 1, wind: 0.4, walk: stepOf(d, h) + i * 0.3, ink: 0.7 }); });
  else fig(c, MECC31[5], { x: 420, y: gy(420) + 130, h: 300, dir: 1, t: T, light: 1, wind: 0.4, ink: 0.7, staff: true });
}
function marching31(c, T, dist, o = {}) { // near ground of meccaOut31: the army advancing toward Mecca (to the right), the elephant ahead
  const x0 = o.x0 || 0, gy = gY31;
  const ex = o.ex !== undefined ? o.ex : x0 + dist + 160, es = o.es || 0.7, ek = o.kneel || 0;
  [[0, -60, 120], [2, -300, 150], [1, -520, 110], [3, -720, 170], [4, -940, 130]].forEach(([wi, dx, dy], i) => { const x = (o.stop !== undefined ? o.stop : x0 + dist) + dx, y = gy(x) + dy, h = 250 + dy * 0.9;
    sold31(c, wi, { x, y, h, dir: 1, t: T + i, light: 0.95, wind: 0.4, walk: o.stop !== undefined ? null : stepOf(dist, h) + i * 0.31, ink: 0.7, reach: o.push ? 0.5 : 0 }); });
  elephant31(c, ex, gy(ex) + 40, es, T, { dir: o.edir || 1, walk: o.ewalk !== undefined ? o.ewalk : (ek > 0 ? null : eleStep31(dist, es)), kneel: ek, trunk: o.trunk || 0 });
}


// =====================================================================================================================
// ---------- episode 32: Qarun and his treasures (Al-Qasas 76-83) · « Histoires du Coran »
// Qarun, his porters, the sages and the people are faceless; Musa is a white silhouette veiled in light. Allah is never depicted (light only).
// The swallowing (Al-Qasas 81) shows only the house sinking into the earth, dust and cracks: no one is shown inside.
function seriesTag32(c, a) { textGlow(c, 'HISTOIRES DU CORAN  ·  ÉPISODE 32', W / 2, 112, '600 32px Lora', '#fbe7c6', a * 0.92, '#000000', 12); }
function ctaText32(c, a) { ctaText29(c, a); }
FOLK.forEach((f, i) => { FOLK[i] = Object.assign({}, f, { covered: false }); }); FOLK[6] = Object.assign({}, FOLK[6], { robe: '#6a5a3a' });
const SEED32 = 3200, PX32 = 540, PY32 = 1440, PS32 = 0.95, GT32 = 1446;
const QARUN = { robe: '#4a1a52', wrap: '#f0e2bc', skin: '#b4805c', trim: '#e8c060', band: '#e0b050', inner: '#efe0c0' };
const PORTER32 = [{ robe: '#5a4030', wrap: '#d8c8a8', skin: '#8f5f42', inner: '#cdb894' }, { robe: '#4a3a2e', wrap: '#e0d0b0', skin: '#9a6a4c', inner: '#c8b490' },
  { robe: '#6a4a32', wrap: '#d0bea0', skin: '#7f5238', inner: '#d4c09c' }, { robe: '#3e3428', wrap: '#ddd0b4', skin: '#94664a', inner: '#c4b08c' }, { robe: '#5e4634', wrap: '#e4d6ba', skin: '#a8714f', inner: '#cfbc98' }];
const RETINUE32 = [{ robe: '#c8781e', wrap: '#f4e4b8', skin: '#9a6a4c', trim: '#7a1e1a', band: '#7a1e1a', inner: '#f2e2b8' }, { robe: '#a82a24', wrap: '#f0dcb0', skin: '#b07a58', trim: '#e0b050', band: '#e0b050', inner: '#f0e0c0' },
  { robe: '#d89a2a', wrap: '#f6e8c4', skin: '#8f5f42', trim: '#8a2a1a', band: '#8a2a1a', inner: '#f4e6c0' }];
const SAGE32 = [{ robe: '#2e3a4a', wrap: '#e8e0cc', skin: '#9a6a4c', trim: '#a89870' }, { robe: '#4a3a2a', wrap: '#ece4d2', skin: '#a8714f', trim: '#8a7a5a' }, { robe: '#3a4436', wrap: '#e4dcc8', skin: '#8f5f42', trim: '#9a8a6a' }];

// ---------- a big bronze key (hangs from its bow: bow at the origin, shaft downward). ang rotates it around the bow.
function key32(c, x, y, s, ang = 0, col = '#c89a48') { c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
  const dk = mix(col, '#2a1408', 0.55), lt = mix(col, '#fff2c8', 0.45);
  c.lineWidth = 10; c.strokeStyle = dk; c.beginPath(); c.arc(0, 18, 16, 0, 6.283); c.stroke();
  c.lineWidth = 6; c.strokeStyle = col; c.beginPath(); c.arc(0, 18, 16, 0, 6.283); c.stroke();
  c.lineWidth = 2; c.strokeStyle = lt; c.beginPath(); c.arc(0, 18, 16, 3.6, 5.4); c.stroke();
  c.fillStyle = dk; c.fillRect(-6, 32, 12, 94); c.fillStyle = col; c.fillRect(-4, 33, 8, 92); c.fillStyle = lt; c.fillRect(-2.5, 35, 2.5, 88);
  c.fillStyle = dk; c.fillRect(-10, 34, 20, 9); c.fillStyle = col; c.fillRect(-9, 35, 18, 7);
  c.fillStyle = dk; c.fillRect(3, 96, 30, 30); c.fillStyle = col; c.fillRect(4, 98, 27, 26); c.fillStyle = lt; c.fillRect(4, 98, 27, 3);
  c.fillStyle = dk; c.fillRect(13, 104, 6, 10); c.fillRect(22, 114, 9, 6);
  c.restore(); }

// ---------- the porters (Al-Qasas 76: "its keys would weigh down a band of strong men"): n men in a file bending under a beam laden with keys
// o: x0 (front man), dir, h, gap, n, gy(x), dist (walk driven by the distance; null = standing, straining), bend
function bearers32(c, T, o = {}) {
  const dir = o.dir || 1, h = o.h || 420, n = o.n || 4, gap = o.gap || h * 0.42, gy = o.gy || (() => 1760), x0 = o.x0 === undefined ? 700 : o.x0, bend = o.bend === undefined ? 0.075 : o.bend;
  const s = h / 300, men = [];
  for (let i = 0; i < n; i++) { const x = x0 - dir * i * gap, y = gy(x), walk = o.dist !== undefined && o.dist !== null ? stepOf(o.dist, h) + i * 0.5 : null;
    const ang = dir * (bend + (walk === null ? 0.012 * Math.sin(T * 1.7 + i * 1.3) : 0.01 * Math.sin(walk * 6.283 * 2)));
    const lx = dir * 30 * s, ly = (walk === null ? -238 : -240) * s;
    men.push({ x, y, walk, ang, i, sx: x + lx * Math.cos(ang) - ly * Math.sin(ang), sy: y + lx * Math.sin(ang) + ly * Math.cos(ang) }); }
  men.forEach(m => lean(c, m.x, m.y, m.ang, () => fig(c, PORTER32[(m.i + (o.seed || 0)) % 5], { x: m.x, y: m.y, h, dir, t: T + m.i, light: o.light || 1, wind: 0.3, ink: 0.7, walk: m.walk, armUp: 0.55 })));
  const a = men[0], b = men[n - 1], L = Math.hypot(a.sx - b.sx, a.sy - b.sy) || 1, ux = (a.sx - b.sx) / L, uy = (a.sy - b.sy) / L;
  const ext = 0.3 * h, p0 = [a.sx + ux * ext, a.sy + uy * ext], p1 = [b.sx - ux * ext, b.sy - uy * ext], bw = 15 * s;
  const sag = (q) => Math.sin(q * Math.PI * (n - 1)) * 0; // supported at every shoulder: no visible sag
  // keys hanging between the men (in bunches on rings), swinging
  const r = rng(SEED32 + 7), sw = o.dist !== undefined && o.dist !== null ? 0.12 * Math.sin(o.dist * 0.03) : 0.05 * Math.sin(T * 1.3);
  const tot = Math.hypot(p0[0] - p1[0], p0[1] - p1[1]), kn = Math.floor(tot / (0.075 * h));
  const keysAt = [];
  for (let k = 0; k <= kn; k++) { const q = k / kn, kx = lerp(p1[0], p0[0], q), ky = lerp(p1[1], p0[1], q) + sag(q);
    if (men.some(m => Math.abs(kx - (m.x + dir * 18 * s)) < 0.12 * h)) continue; keysAt.push([kx, ky, k]); }
  keysAt.forEach(([kx, ky, k]) => { const nb = 2 + (k % 2), cl = 8 + (k % 3) * 6;
    for (let j = 0; j < nb; j++) { const aa = sw * (1 + j * 0.3) + (j - (nb - 1) / 2) * 0.22, ks = 0.42 * s * (0.9 + (j % 2) * 0.12);
      c.strokeStyle = '#4a3420'; c.lineWidth = 2.2 * s; c.beginPath(); c.moveTo(kx, ky + bw * 0.4); c.lineTo(kx + Math.sin(-aa) * cl * s, ky + bw * 0.4 + Math.cos(aa) * cl * s); c.stroke();
      key32(c, kx + Math.sin(-aa) * cl * s, ky + bw * 0.4 + Math.cos(aa) * cl * s - 4 * s, ks, aa, j % 2 ? '#c89a48' : '#b8863a'); } });
  // the beam (rough wood) over the shoulders
  const nx = -uy, ny = ux; c.save();
  const g = c.createLinearGradient(p0[0] + nx * bw, p0[1] + ny * bw, p0[0] - nx * bw, p0[1] - ny * bw); g.addColorStop(0, '#3a2414'); g.addColorStop(0.45, '#8a6038'); g.addColorStop(1, '#5a3a20');
  c.fillStyle = g; c.beginPath(); c.moveTo(p0[0] + nx * bw / 2, p0[1] + ny * bw / 2); c.lineTo(p1[0] + nx * bw / 2, p1[1] + ny * bw / 2); c.lineTo(p1[0] - nx * bw / 2, p1[1] - ny * bw / 2); c.lineTo(p0[0] - nx * bw / 2, p0[1] - ny * bw / 2); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(30,16,8,0.5)'; c.lineWidth = 1.5 * s; c.stroke();
  c.strokeStyle = 'rgba(40,22,10,0.35)'; c.lineWidth = 1.2 * s; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(p0[0] + nx * (k - 1) * bw * 0.25, p0[1] + ny * (k - 1) * bw * 0.25); c.lineTo(p1[0] + nx * (k - 1) * bw * 0.25, p1[1] + ny * (k - 1) * bw * 0.25); c.stroke(); }
  // cloth pads on the shoulders
  men.forEach(m => { c.fillStyle = '#c8b48a'; c.beginPath(); c.ellipse(m.sx, m.sy + 2 * s, 13 * s, 9 * s, Math.atan2(uy, ux), 0, 6.283); c.fill(); });
  c.restore();
  return men;
}

// ---------- Qarun's house (Al-Qasas 81 "him and his house"): a great palace on a stepped platform: towers with stepped merlons,
// a painted colonnade, gilded doors, an upper storey with lit windows, a gilded dome. Origin = middle of the ground line.
function palace32(c, x, y, s, T, o = {}) { c.save(); c.translate(x, y); c.scale(s, s);
  const nt = o.night || 0, lamp = o.lamp || 0;
  const pl = mix('#efdcb8', '#5a4e66', nt * 0.7), plD = mix(pl, '#2a1408', 0.38), plL = mix(pl, '#fff6e4', 0.35 * (1 - nt));
  const gold = mix('#e2b456', '#8a6a40', nt * 0.5), red = mix('#9a2a24', '#3a1a20', nt * 0.5), blue = mix('#2a5a7a', '#1a2a40', nt * 0.5);
  const wallG = (x0, x1) => { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, plL); g.addColorStop(0.55, pl); g.addColorStop(1, plD); return g; };
  const merlons = (x0, x1, yy, sz = 22) => { c.fillStyle = pl; const n = Math.max(2, Math.round((x1 - x0) / (sz * 2.2)));
    for (let k = 0; k < n; k++) { const mx = x0 + (k + 0.5) * (x1 - x0) / n, hw = sz * 0.62; c.beginPath(); c.moveTo(mx - hw, yy); c.lineTo(mx - hw, yy - sz * 0.6); c.lineTo(mx - hw * 0.5, yy - sz * 0.6);
      c.lineTo(mx - hw * 0.5, yy - sz * 1.2); c.lineTo(mx + hw * 0.5, yy - sz * 1.2); c.lineTo(mx + hw * 0.5, yy - sz * 0.6); c.lineTo(mx + hw, yy - sz * 0.6); c.lineTo(mx + hw, yy); c.closePath(); c.fill(); }
    c.fillStyle = hexA(plD, 0.5); c.fillRect(x0, yy - 3, x1 - x0, 3); };
  const win = (wx, wy, w, h, k) => { c.fillStyle = mix('#2a1608', '#ffc070', lamp * (0.85 + 0.15 * Math.sin(T * 5 + k))); c.beginPath(); archPath(c, wx, wy, w, h); c.fill();
    c.strokeStyle = gold; c.lineWidth = 3; c.beginPath(); archPath(c, wx, wy + 3, w + 8, h + 8); c.stroke();
    if (lamp > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, wx, wy - h * 0.5, h * 1.3, '#ffb060', 0.28 * lamp); c.restore(); } };
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(20, 4, 520, 26, 0, 0, 6.283); c.fill();
  for (let i = 0; i < 4; i++) { const w = 980 - i * 44; c.fillStyle = mix(pl, i % 2 ? '#000000' : '#ffffff', 0.06); c.fillRect(-w / 2, -14 * (i + 1), w, 14); c.fillStyle = hexA(plD, 0.55); c.fillRect(-w / 2, -14 * i - 3, w, 3); }
  const B = -56;
  // the upper storey and the dome (behind the hall)
  c.fillStyle = wallG(-240, 240); c.fillRect(-240, B - 580, 480, 200);
  c.fillStyle = red; c.fillRect(-240, B - 572, 480, 9); c.fillStyle = gold; c.fillRect(-240, B - 561, 480, 4);
  for (let k = 0; k < 5; k++) win(-176 + k * 88, B - 410, 38, 92, k + 3);
  merlons(-240, 240, B - 580, 20);
  const dx = 0, dy = B - 580, r = 112;
  c.fillStyle = wallG(-r * 0.92, r * 0.92); c.fillRect(-r * 0.92, dy - 58, r * 1.84, 58); for (let k = 0; k < 7; k++) { c.fillStyle = '#2a1810'; c.beginPath(); archPath(c, -r * 0.72 + k * r * 0.24, dy - 8, r * 0.1, 38); c.fill(); }
  const dg = c.createRadialGradient(dx - r * 0.45, dy - r * 1.2, 0, dx, dy - 58, r * 1.4); dg.addColorStop(0, mix('#fff2c0', '#c0a070', nt * 0.5)); dg.addColorStop(0.45, gold); dg.addColorStop(1, mix('#8a5a20', '#3a2a20', nt * 0.5));
  c.fillStyle = dg; c.beginPath(); c.moveTo(-r * 0.92, dy - 58); c.bezierCurveTo(-r * 0.95, dy - 58 - r * 1.15, r * 0.95, dy - 58 - r * 1.15, r * 0.92, dy - 58); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(120,70,20,0.45)'; c.lineWidth = 2.5; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(k * r * 0.27, dy - 58); c.quadraticCurveTo(k * r * 0.2, dy - 58 - r * 0.7, 0, dy - 58 - r * 0.86); c.stroke(); }
  c.fillStyle = gold; c.fillRect(-3, dy - 58 - r * 0.86 - 40, 6, 40); c.beginPath(); c.arc(0, dy - 58 - r * 0.86 - 44, 9, 0, 6.283); c.fill();
  // the side towers
  [-1, 1].forEach(sd => { const tx = sd * 400, tw = 140, th = 600;
    c.fillStyle = wallG(tx - tw / 2, tx + tw / 2); c.fillRect(tx - tw / 2, B - th, tw, th);
    c.fillStyle = red; c.fillRect(tx - tw / 2, B - th + 26, tw, 10); c.fillStyle = gold; c.fillRect(tx - tw / 2, B - th + 38, tw, 5);
    c.fillStyle = blue; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(tx - tw / 2 + k * tw / 5, B - th + 46); c.lineTo(tx - tw / 2 + (k + 0.5) * tw / 5, B - th + 66); c.lineTo(tx - tw / 2 + (k + 1) * tw / 5, B - th + 46); c.closePath(); c.fill(); }
    merlons(tx - tw / 2, tx + tw / 2, B - th, 22);
    for (let k = 0; k < 3; k++) win(tx, B - 150 - k * 150, 34, 70, k + sd * 2);
    c.fillStyle = hexA(plD, 0.35); c.fillRect(tx + sd * tw * 0.5 - (sd > 0 ? 12 : 0), B - th, 12, th); // corner shade
    flag(c, tx, B - th - 26, 1.1, T, sd < 0 ? '#9a2a24' : '#d8a032', sd + 2); });
  // the hall and its colonnade
  c.fillStyle = wallG(-330, 330); c.fillRect(-330, B - 400, 660, 400);
  const pg = c.createLinearGradient(0, B - 330, 0, B); pg.addColorStop(0, mix('#2a160c', '#0a0810', nt * 0.5)); pg.addColorStop(1, mix('#6a4428', '#2a2030', nt * 0.5)); c.fillStyle = pg; c.fillRect(-316, B - 330, 632, 330);
  c.fillStyle = hexA(mix('#3a4a6a', '#1a2030', nt * 0.5), 0.5); for (let k = 0; k < 9; k++) c.fillRect(-316 + k * 79, B - 120, 40, 120); // painted dado
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, B - 160, 380, '#ffb060', 0.22 + 0.25 * lamp); c.restore();
  [-210, 210].forEach((lx, i) => { c.fillStyle = '#1a0e08'; c.beginPath(); archPath(c, lx, B, 76, 150); c.fill(); c.strokeStyle = gold; c.lineWidth = 3; c.beginPath(); archPath(c, lx, B, 86, 160); c.stroke(); });
  c.fillStyle = '#3a2416'; c.beginPath(); archPath(c, 0, B, 140, 250); c.fill(); // the great gilded door
  const doorG = c.createLinearGradient(-60, 0, 60, 0); doorG.addColorStop(0, mix('#b8862e', '#5a4a30', nt * 0.5)); doorG.addColorStop(0.5, mix('#f2cc6a', '#8a7a50', nt * 0.5)); doorG.addColorStop(1, mix('#9a6a22', '#4a3a28', nt * 0.5));
  c.fillStyle = doorG; c.beginPath(); archPath(c, 0, B, 118, 230); c.fill();
  c.strokeStyle = 'rgba(110,60,14,0.7)'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, B); c.lineTo(0, B - 200); c.stroke();
  c.fillStyle = 'rgba(110,60,14,0.75)'; for (let k = 0; k < 6; k++) for (let j = -1; j <= 1; j += 2) { c.beginPath(); c.arc(j * 30, B - 24 - k * 32, 4, 0, 6.283); c.fill(); }
  for (let i = 0; i < 3; i++) { const lx = -150 + i * 150; c.strokeStyle = '#2a1a10'; c.lineWidth = 2; c.beginPath(); c.moveTo(lx, B - 330); c.lineTo(lx, B - 300); c.stroke(); lanternBox(c, lx, B - 270, 0.8, T, i + 4); }
  for (let i = 0; i < 8; i++) column(c, -300 + i * 600 / 7, B, 30, 300, mix('#e8d4b0', '#5a4e66', nt * 0.7), { band: gold });
  c.fillStyle = blue; c.fillRect(-340, B - 352, 680, 30); c.fillStyle = gold; c.fillRect(-340, B - 322, 680, 6); c.fillRect(-346, B - 360, 692, 9);
  for (let k = 0; k < 22; k++) { c.fillStyle = k % 2 ? red : gold; c.beginPath(); c.moveTo(-340 + k * 680 / 22, B - 352); c.lineTo(-340 + (k + 0.5) * 680 / 22, B - 326); c.lineTo(-340 + (k + 1) * 680 / 22, B - 352); c.closePath(); c.fill(); }
  c.fillStyle = wallG(-340, 340); c.fillRect(-340, B - 400, 680, 40);
  merlons(-340, 340, B - 400, 18);
  if (o.glint) { c.save(); c.globalCompositeOperation = 'lighter'; star4(c, -r * 0.4, dy - 58 - r * 0.6, 26 * o.glint, '#fff6d8', o.glint); star4(c, -48, B - 150, 18 * o.glint, '#fff6d8', o.glint * 0.8); c.restore(); }
  c.restore(); }

// ---------- the town behind (parallax layer): far city wall, rows of flat-roofed houses, palms; a ground band so nothing floats
function town32(c, T, o = {}) { const r = rng(SEED32 + 10), nt = o.night || 0, lamp = o.lamp || 0;
  const g = c.createLinearGradient(0, 1380, 0, 1700); g.addColorStop(0, mix('#cfa978', '#3a3040', nt * 0.8)); g.addColorStop(1, mix('#a8825a', '#2a2230', nt * 0.8)); c.fillStyle = g; c.fillRect(-2600, 1392, 6300, 1300);
  const wc = mix('#b88e60', '#342c3c', nt * 0.75); c.fillStyle = wc; c.fillRect(-2600, 1334, 6300, 62); for (let x = -2600; x < 3700; x += 36) c.fillRect(x, 1322, 20, 14);
  for (let row = 0; row < 3; row++) for (let i = 0; i < 36; i++) { const x = -1700 + i * 120 + r() * 60 + row * 40, w = 80 + r() * 90, h = 60 + r() * 110 - row * 14, y = 1360 + row * 18;
    const col = mix(mix('#dcb88c', '#b88a5e', r()), '#3a3040', nt * 0.75), lt = mix(col, '#fff2dc', 0.25 * (1 - nt)), dk = mix(col, '#1a0c06', 0.35);
    c.fillStyle = col; c.fillRect(x, y - h, w, h + 36); c.fillStyle = dk; c.fillRect(x + w * 0.75, y - h, w * 0.25, h + 36); c.fillStyle = lt; c.fillRect(x - 2, y - h - 4, w + 4, 5);
    for (let k = 0; k < 2; k++) { const r1 = r(), r2 = r(); if (r1 > 0.35) { const wx = x + w * (0.18 + k * 0.32), wy = y - h * 0.62, L = lamp > 0 && r2 > 0.45;
      c.fillStyle = L ? mix('#1a0e08', '#ffc070', lamp) : hexA(dk, 0.85); c.fillRect(wx, wy, 8, 12); if (L) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, wx + 4, wy + 6, 34, '#ffb060', 0.35 * lamp); c.restore(); } } }
    const rp = r(), rs = r(); if (rp > 0.72) datePalm(c, x + w + 10, y + 8, 0.5 + rs * 0.2, mix('#4a5a30', '#1a2028', nt), T, SEED32 + 20 + i + row * 40); }
  hazeW(c, 1400, 120, o.haze || '#f4d8b8', 0.22 * (1 - nt));
}

// ---------- the forecourt (near ground, parallax 0): flagstones in perspective, the road, palms lining the court
function forecourt32(c, T, o = {}) { const nt = o.night || 0;
  flagFloor(c, GT32, 540, mix('#cdb08a', '#3a3242', nt * 0.75), { sheen: 0.12 * (1 - nt), sheenCol: '#ffd8a0' });
  c.fillStyle = hexA(mix('#a8805a', '#2a2430', nt * 0.7), 0.3); c.beginPath(); c.moveTo(-1800, 1600); c.quadraticCurveTo(540, 1560, 2900, 1610); c.lineTo(2900, 1760); c.quadraticCurveTo(540, 1700, -1800, 1750); c.closePath(); c.fill();
  [[-430, 1478, 1.0], [-130, 1470, 1.08], [1210, 1474, 1.1], [1520, 1480, 1.0]].forEach(([x, y, s], i) => datePalm(c, x, y, s, mix('#4a5a30', '#141a20', nt), T, SEED32 + 30 + i));
}

function cracks32(c, x, y, rx, ry, k, seed) { if (k <= 0) return; const r = rng(seed); c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  for (let i = 0; i < 18; i++) { const a = 0.08 + r() * (Math.PI - 0.16), len = (50 + r() * 150) * k; let px = x + Math.cos(a) * rx, py = y + Math.sin(a) * ry, dx = Math.cos(a), dy = Math.sin(a) * 0.45 + 0.15;
    const n = Math.hypot(dx, dy); dx /= n; dy /= n; c.strokeStyle = `rgba(40,22,12,${0.5 * k})`;
    for (let j = 0; j < 4; j++) { const nx = px + dx * len / 4 + (r() - 0.5) * 18, ny = py + dy * len / 4 + (r() - 0.5) * 8; c.lineWidth = 3.2 - j * 0.7; c.beginPath(); c.moveTo(px, py); c.lineTo(nx, ny); c.stroke(); px = nx; py = ny; } }
  c.restore(); }
// ---------- the swallowing (Al-Qasas 81): the ground opens, the house sinks into the earth, dust and cracks. o.after = the scar the next day.
function sinking32(c, T, o) { const k = o.after ? 1 : o.sink, s = PS32, x = PX32, y = PY32 + 6;
  const open = ease(clamp(k * 2.4)), rx = 580 * s * open, ry = 74 * s * open;
  if (o.after) { // the next morning: a wide sunken scar of broken earth, nothing left
    const g = c.createRadialGradient(x, y + 10, 0, x, y + 10, rx); g.addColorStop(0, '#3a2618'); g.addColorStop(0.75, '#5a3e2a'); g.addColorStop(1, 'rgba(120,90,60,0)');
    c.fillStyle = g; c.beginPath(); c.ellipse(x, y + 8, rx * 1.05, ry * 1.2, 0, 0, 6.283); c.fill();
    cracks32(c, x, y + 8, rx, ry, 0.8, SEED32 + 40);
  } else if (rx > 1) {
    const g = c.createRadialGradient(x, y, 0, x, y, rx); g.addColorStop(0, '#0a0604'); g.addColorStop(0.85, '#24160e'); g.addColorStop(1, 'rgba(60,40,28,0)');
    c.fillStyle = g; c.beginPath(); c.ellipse(x, y, rx * 1.04, ry * 1.08, 0, 0, 6.283); c.fill();
    const d = easeIn(seg(k, 0.05, 1)) * 1150 * s, tilt = 0.025 * Math.sin(k * 4) * k;
    c.save(); c.beginPath(); c.rect(-4000, -4000, 9000, 4000 + y); c.moveTo(x + rx, y); c.ellipse(x, y, rx, ry, 0, 0, Math.PI); c.clip();
    c.translate(x, y); c.rotate(tilt); c.translate(-x, -y + d); palace32(c, PX32, PY32, s, T, o); c.restore();
    c.strokeStyle = '#7a5a40'; c.lineWidth = 9 * open; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0.05, Math.PI - 0.05); c.stroke(); // the front lip
    cracks32(c, x, y + 4, rx, ry, clamp(k * 3), SEED32 + 40);
  }
  const r = rng(SEED32 + 42); // broken paving and earth along the edge
  for (let i = 0; i < 40; i++) { const a = r() * Math.PI, u = r(), px = x + Math.cos(a) * rx * (1 + u * 0.12), py = y + Math.sin(a) * ry * (1 + u * 0.3) + 4, sz = (6 + r() * 16) * open;
    c.fillStyle = r() > 0.5 ? '#8a6a4a' : '#5a4030'; c.beginPath(); c.ellipse(px, py, sz, sz * 0.55, r() * 3, 0, 6.283); c.fill(); }
  if (!o.after) bigDust(c, T, x, y - 30, 0.95, Math.sin(Math.PI * clamp(k * 1.05)) * 1.0 + (k > 0.9 ? 0.25 : 0), SEED32 + 41);
}

// ---------- the land of the story: sky, desert ranges, the town, Qarun's house, the forecourt; walkers on the forecourt
function qarunLand32(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx || 540, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 8) : [0, 0]));
  const px = o.px || 0, nt = o.night || 0;
  if (o.skyFn) o.skyFn(c); else sky0(c, skyStops(o.sky || 'gold', o.to, o.k || 0));
  if (o.stars) stars(c, T, 120, SEED32 + 1, [-600, -300, W + 1200, 1000], o.stars);
  if (o.sunA !== 0) bigSun30(c, o.sunX === undefined ? 860 : o.sunX, o.sunY === undefined ? 1010 : o.sunY, 50, o.sunCol || '#ffd08a', o.sunA === undefined ? 0.9 : o.sunA);
  cloudBank(c, T, 300, 6, o.cloud || '#fff0dc', 0.16 * (1 - nt * 0.7), SEED32 + 2, 6);
  par(c, -0.8, px, 0, () => { ridgeW(c, 1250, 170, 0.0026, SEED32 + 3, mix('#b48c86', '#2a2840', nt)); hazeW(c, 1290, 230, o.haze || '#f4d8b8', 0.5 * (1 - nt * 0.7)); });
  par(c, -0.55, px, 0, () => { ridgeW(c, 1330, 90, 0.0036, SEED32 + 4, mix('#c89c74', '#342a3a', nt)); hazeW(c, 1370, 150, o.haze || '#f4d8b8', 0.38 * (1 - nt * 0.7)); });
  par(c, -0.3, px, 0, () => town32(c, T, { lamp: o.lamp || 0, night: nt, haze: o.haze }));
  const sinkMode = o.after || o.sink > 0;
  par(c, -0.12, px, 0, () => { if (!sinkMode) { palace32(c, PX32, PY32, PS32, T, o); if (o.onPalace) o.onPalace(c); } });
  par(c, 0, px, 0, () => forecourt32(c, T, o));
  if (sinkMode) par(c, -0.12, px, 0, () => { sinking32(c, T, o); if (o.onEdge) o.onEdge(c); });
  if (o.light) lightFromAbove(c, T, o.lightX || 540, o.light, o.lightW || 380);
  if (o.tint) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = o.tint; c.fillRect(0, 0, W, H); c.restore(); }
  par(c, 0, px, 0, () => { if (o.walkers) o.walkers(c); });
  if (o.fg !== false) blurLayer(c, 9, bc => { datePalm(bc, 1240, 2260, 2.5, mix('#4a5a30', '#141a20', nt), T, SEED32 + 9); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- the treasury: a vaulted store room, iron-banded doors with lock plates, heaps of gold, open chests, ewers, rugs, lamps
function vaultDoor32(c, x, y, s, T, o = {}) { c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#4a3624'; c.beginPath(); archPath(c, 0, 0, 280, 440); c.fill();
  c.strokeStyle = '#c8a878'; c.lineWidth = 10; c.beginPath(); archPath(c, 0, 0, 290, 450); c.stroke();
  const g = c.createLinearGradient(-120, 0, 120, 0); g.addColorStop(0, '#4a2c16'); g.addColorStop(0.5, '#7a4c28'); g.addColorStop(1, '#3a2010');
  c.fillStyle = g; c.beginPath(); archPath(c, 0, 0, 240, 410); c.fill();
  c.strokeStyle = 'rgba(30,16,6,0.6)'; c.lineWidth = 3; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(k * 48, 0); c.lineTo(k * 48, -330); c.stroke(); }
  c.fillStyle = '#2a2420'; [-330, -220, -110, -30].forEach(yy => { c.fillRect(-120, yy - 9, 240, 18); for (let k = -5; k <= 5; k++) { c.fillStyle = '#6a625a'; c.beginPath(); c.arc(k * 22, yy, 3.5, 0, 6.283); c.fill(); c.fillStyle = '#2a2420'; } });
  c.fillStyle = '#c89a48'; c.beginPath(); c.ellipse(0, -180, 38, 50, 0, 0, 6.283); c.fill(); c.strokeStyle = '#6a4a1a'; c.lineWidth = 4; c.stroke(); // lock plate
  c.fillStyle = '#120a06'; c.beginPath(); c.arc(0, -192, 8, 0, 6.283); c.fill(); c.fillRect(-4, -192, 8, 26);
  if (o.key !== undefined && o.key !== null) { c.save(); c.translate(0, -186); c.rotate(-Math.PI / 2 + o.key * Math.PI / 2); key32(c, 0, -150, 1.2, 0); c.restore(); }
  if (o.glow > 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(255,200,110,${0.7 * o.glow})`; c.fillRect(-120, -6, 240, 6); glow(c, 0, -4, 220, '#ffc070', 0.35 * o.glow); c.restore(); }
  c.restore(); }
function goldHeap32(c, x, y, s, T, seed, o = {}) { c.save(); c.translate(x, y); c.scale(s, s); const r = rng(seed);
  c.fillStyle = 'rgba(10,6,4,0.35)'; c.beginPath(); c.ellipse(0, 4, 150, 18, 0, 0, 6.283); c.fill();
  const g = c.createLinearGradient(0, -110, 0, 0); g.addColorStop(0, '#ffe08a'); g.addColorStop(0.5, '#d8a238'); g.addColorStop(1, '#7a4e14');
  c.fillStyle = g; c.beginPath(); c.moveTo(-150, 0); c.quadraticCurveTo(-70, -120, 0, -116); c.quadraticCurveTo(80, -110, 150, 0); c.closePath(); c.fill();
  for (let i = 0; i < 160; i++) { const u = r() * 2 - 1, v = r(), px = u * 145 * (1 - v * 0.75), py = -v * 110 * (1 - u * u * 0.6) + 4;
    c.fillStyle = mix('#b8821e', '#fff0a0', r()); c.beginPath(); c.ellipse(px, py, 9, 4.5, (r() - 0.5) * 0.8, 0, 6.283); c.fill(); c.strokeStyle = 'rgba(100,56,10,0.5)'; c.lineWidth = 1; c.stroke(); }
  for (let i = 0; i < 6; i++) { const px = (r() - 0.5) * 200, py = -r() * 70; c.fillStyle = i % 2 ? '#c8283a' : '#2a9a6a'; c.beginPath(); c.arc(px, py, 6, 0, 6.283); c.fill(); c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.arc(px - 2, py - 2, 2, 0, 6.283); c.fill(); }
  c.restore();
  sparkle(c, T, x, y - 150 * s, 5, 110 * s, seed + 1, 0.7 * (o.glint === undefined ? 1 : o.glint)); }
function openChest32(c, x, y, s, T) { c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.35)'; c.beginPath(); c.ellipse(0, 4, 110, 14, 0, 0, 6.283); c.fill();
  c.fillStyle = '#4a2a14'; c.beginPath(); c.moveTo(-94, -84); c.lineTo(-84, -190); c.quadraticCurveTo(0, -214, 84, -190); c.lineTo(94, -84); c.closePath(); c.fill(); // open lid
  c.strokeStyle = '#c9a040'; c.lineWidth = 6; c.stroke();
  c.fillStyle = '#2a140a'; c.fillRect(-90, -88, 180, 14);
  const g = c.createLinearGradient(0, -110, 0, -70); g.addColorStop(0, '#fff0a0'); g.addColorStop(1, '#c89030'); c.fillStyle = g; c.beginPath(); c.moveTo(-88, -80); c.quadraticCurveTo(0, -128, 88, -80); c.closePath(); c.fill();
  const r = rng(SEED32 + 61); for (let i = 0; i < 40; i++) { c.fillStyle = mix('#c08a2a', '#fff4b0', r()); c.beginPath(); c.ellipse((r() - 0.5) * 160, -84 - r() * 28, 8, 4, 0, 0, 6.283); c.fill(); }
  c.strokeStyle = '#f0d070'; c.lineWidth = 3; c.beginPath(); c.moveTo(-60, -96); c.quadraticCurveTo(-20, -60, 30, -100); c.stroke(); // a necklace
  const bg = c.createLinearGradient(-94, 0, 94, 0); bg.addColorStop(0, '#5a3418'); bg.addColorStop(0.5, '#8a5428'); bg.addColorStop(1, '#4a2a12'); c.fillStyle = bg; c.fillRect(-94, -84, 188, 84);
  c.strokeStyle = '#c9a040'; c.lineWidth = 7; [-62, 62].forEach(xx => { c.beginPath(); c.moveTo(xx, 0); c.lineTo(xx, -84); c.stroke(); }); c.fillStyle = '#e0b850'; c.fillRect(-12, -84, 24, 24);
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -110, 200, '#ffd070', 0.4 * (0.9 + 0.1 * Math.sin(T * 3))); c.restore();
  c.restore(); }
function ewer32(c, x, y, s, col = '#d8a840') { c.save(); c.translate(x, y); c.scale(s, s); const dk = mix(col, '#3a2008', 0.5), lt = mix(col, '#fff4c8', 0.5);
  const g = c.createLinearGradient(-40, 0, 40, 0); g.addColorStop(0, dk); g.addColorStop(0.35, lt); g.addColorStop(0.7, col); g.addColorStop(1, dk);
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(0, 3, 40, 7, 0, 0, 6.283); c.fill();
  c.fillStyle = g; c.beginPath(); c.moveTo(-24, 0); c.quadraticCurveTo(-52, -60, -18, -100); c.lineTo(-12, -140); c.lineTo(12, -140); c.lineTo(18, -100); c.quadraticCurveTo(52, -60, 24, 0); c.closePath(); c.fill();
  c.strokeStyle = col; c.lineWidth = 6; c.beginPath(); c.moveTo(30, -90); c.quadraticCurveTo(60, -110, 34, -46); c.stroke(); c.beginPath(); c.moveTo(-26, -76); c.lineTo(-56, -120); c.stroke();
  c.restore(); }
function treasury32(c, T, o = {}) { const z = o.z || 1; cam(c, z, o.cx || 540, o.cy || 1150);
  const fy = 1400;
  ashlar(c, -1400, -500, 2500, fy, '#8a6a48', SEED32 + 50);
  const wg = c.createLinearGradient(0, -500, 0, fy); wg.addColorStop(0, 'rgba(18,10,4,0.78)'); wg.addColorStop(1, 'rgba(18,10,4,0.15)'); c.fillStyle = wg; c.fillRect(-1400, -500, 3900, fy + 500);
  [-260, 1340].forEach(wx => { c.fillStyle = '#ffe8b8'; c.beginPath(); archPath(c, wx, 420, 70, 170); c.fill(); });
  c.save(); c.globalCompositeOperation = 'lighter'; [[-260, 1], [1340, -1]].forEach(([wx, sd]) => { const lg = c.createLinearGradient(0, 300, 0, fy + 300); lg.addColorStop(0, 'rgba(255,226,170,0.2)'); lg.addColorStop(1, 'rgba(255,226,170,0)');
    c.fillStyle = lg; c.beginPath(); c.moveTo(wx - 35, 260); c.lineTo(wx + 35, 260); c.lineTo(wx + sd * 700 + 150, fy + 300); c.lineTo(wx + sd * 700 - 150, fy + 300); c.closePath(); c.fill(); }); c.restore();
  [[150, 0.78], [540, 1], [930, 0.78]].forEach(([dx, ds], i) => vaultDoor32(c, dx, fy, ds, T, { key: i === 1 ? o.key : null, glow: i === 1 ? (o.doorGlow || 0) : 0 }));
  c.fillStyle = '#3a2818'; c.fillRect(-1400, fy - 640, 3900, 26); c.fillStyle = '#c9a040'; c.fillRect(-1400, fy - 614, 3900, 5);
  flagFloor(c, fy, 540, '#9a7a56', { sheen: 0.22, sheenCol: '#ffc870' });
  rug(c, 540, 1560, 820, 140, '#7a1e22', {});
  [[220, 520, 0], [860, 520, 1]].forEach(([lx, ly, k]) => { c.strokeStyle = '#2a1a10'; c.lineWidth = 2; c.beginPath(); c.moveTo(lx, -300); c.lineTo(lx, ly - 34); c.stroke(); lanternBox(c, lx, ly, 1.3, T, k); });
  goldHeap32(c, -60, 1500, 1.3, T, SEED32 + 52); goldHeap32(c, 1130, 1490, 1.2, T, SEED32 + 53);
  openChest32(c, 300, 1500, 0.95, T); openChest32(c, 800, 1505, 0.9, T);
  ewer32(c, 120, 1440, 0.9); ewer32(c, 960, 1436, 0.85, '#c8a060'); jar(c, 1030, 1430, 1.1, '#a8603a'); jar(c, 60, 1426, 1.0, '#9a5a34');
  if (o.people) o.people(c);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- the procession (Al-Qasas 79 "he went out before his people in his adornment"): retinue in saffron and red, Qarun under a parasol
function parasol32(c, x, y, s, T) { c.save(); c.translate(x, y); c.scale(s, s);
  c.strokeStyle = '#3a2414'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -170); c.stroke();
  const g = c.createLinearGradient(-130, 0, 130, 0); g.addColorStop(0, '#6a1418'); g.addColorStop(0.45, '#c8303a'); g.addColorStop(1, '#6a1418');
  c.fillStyle = g; c.beginPath(); c.moveTo(-130, -160); c.quadraticCurveTo(0, -250, 130, -160); c.closePath(); c.fill();
  c.strokeStyle = '#e8c060'; c.lineWidth = 4; c.stroke();
  c.fillStyle = '#e8c060'; for (let k = 0; k < 13; k++) { const fx = -124 + k * 20.6; c.beginPath(); c.moveTo(fx - 8, -160); c.lineTo(fx, -144 + Math.sin(T * 3 + k) * 2); c.lineTo(fx + 8, -160); c.closePath(); c.fill(); }
  c.beginPath(); c.arc(0, -214, 8, 0, 6.283); c.fill();
  c.restore(); }
function procession32(c, T, dist, o = {}) { const x0 = o.x0 || 0, by = o.y || 1720, h = o.h || 360;
  const M = [['R', 0, 380, 0], ['R', 1, 200, -30], ['Q', 0, 0, 0], ['P', 2, -170, -26], ['R', 0, -340, 0], ['R', 2, -520, -34], ['R', 1, -700, 0]];
  M.slice().sort((a, b) => a[3] - b[3]).forEach(([w, i, dx, dy], j) => { const x = x0 + dist + dx, y = by + dy, hh = (w === 'Q' ? 1.06 : 1) * h * (1 + dy / 900);
    const walk = o.stop ? null : stepOf(dist, hh) + j * 0.37;
    if (w === 'Q') fig(c, QARUN, { x, y, h: hh, dir: 1, t: T, light: 1.1, wind: 0.5, walk, ink: 0.75, armUp: o.qArm || 0 });
    else if (w === 'P') { const fo = { x, y, h: hh, dir: 1, t: T + j, light: 1, wind: 0.4, walk, ink: 0.7, armUp: 0.75 }; fig(c, RETINUE32[i], fo); const [hx, hy] = handOf(fo); parasol32(c, hx + 120 * hh / 300, hy + 30, hh / 300 * 1.05, T); }
    else fig(c, RETINUE32[i], { x, y, h: hh, dir: 1, t: T + j, light: 1, wind: 0.4, walk, ink: 0.7, staff: j % 2 === 0 }); });
}

// ---------- the ruins of the strong generations before him (Al-Qasas 78): broken colonnades half buried in the dunes at dusk
function brokenCol32(c, x, y, w, h, col, seed) { const r = rng(seed); c.save(); c.beginPath(); c.moveTo(x - w, y + 10);
  for (let k = 0; k <= 6; k++) c.lineTo(x - w + k * w / 3, y - h + (r() - 0.5) * w * 1.2); c.lineTo(x + w, y + 10); c.closePath(); c.clip(); column(c, x, y, w, h * 1.4, col, { band: '#8a7050' }); c.restore(); }
function ruins32(c, T, o = {}) { const z = o.z || 1; cam(c, z, o.cx || 540, o.cy || 1150);
  sky0(c, skyStops('dusk', 'ash', 0.35)); bigSun30(c, 300, 1110, 64, '#ff9a5a', 0.85);
  wisps(c, T, 600, 5, '#ffd0b0', 0.14, SEED32 + 70, 8);
  par(c, -0.6, o.px || 0, 0, () => { ridgeW(c, 1260, 140, 0.0028, SEED32 + 71, '#6a4a54'); hazeW(c, 1300, 200, '#f0a878', 0.45); });
  par(c, -0.3, o.px || 0, 0, () => { const col = '#b08a6a';
    for (let i = 0; i < 7; i++) brokenCol32(c, 160 + i * 140, 1420, 56, 260 + (i % 3) * 110 - (i === 3 ? 140 : 0), col, SEED32 + 72 + i);
    ridgeW(c, 1440, 110, 0.0035, SEED32 + 79, mix('#c08458', '#fff0d4', 0.2)); c.strokeStyle = 'rgba(255,214,170,0.45)'; c.lineWidth = 3; c.beginPath(); for (let x = -1200; x <= 2300; x += 16) { const v = ridgeY(x, 1440, 110, 0.0035, SEED32 + 79); x === -1200 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); });
  par(c, 0, o.px || 0, 0, () => { sandW(c, 1560, '#c08458', SEED32 + 73, { pebbles: 70, tufts: 5 }); stoneDrum(c, 260, 1660, 220, 120, '#a8865e', '#c08458'); stoneDrum(c, 840, 1760, 260, 140, '#9a7a54', '#b87a4e');
    palmTrunk(c, 480, 1840, 380, -0.08, 1, '#6a4a32', '#b87a4e', 0.4); });
  blowingSand(c, T, 1500, 0.3, SEED32 + 74);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- a humble house at dusk (the good deed; the reward of Allah: a believer at prayer in a soft light, never a form)
function humble32(c, T, o = {}) { const z = o.z || 1; cam(c, z, o.cx || 540, o.cy || 1150);
  sky0(c, skyStops(o.sky || 'dusk', o.to || 'gold', o.k === undefined ? 0.5 : o.k)); bigSun30(c, 820, 1080, 48, '#ffb070', 0.8);
  par(c, -0.6, 0, 0, () => { ridgeW(c, 1260, 150, 0.0026, SEED32 + 3, '#9a7478'); hazeW(c, 1290, 220, '#f4c8a0', 0.5); });
  par(c, -0.3, 0, 0, () => town32(c, T, { lamp: 0.6, haze: '#f4c8a0' }));
  sandW(c, 1460, '#c8a070', SEED32 + 80, { pebbles: 60, tufts: 4 });
  house(c, 380, 1500, 460, 380, '#b88e64', { lamp: 0.9, t: T });
  datePalm(c, 760, 1480, 1.15, '#4a5a30', T, SEED32 + 81);
  if (o.people) o.people(c);
  if (o.light) lightFromAbove(c, T, o.lightX || 640, o.light, 300);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- the key left in the sand at dawn (lesson): close-up, low light, blowing sand
function keyClose32(c, T, o = {}) { const z = o.z || 1; cam(c, z, o.cx || 540, o.cy || 1150);
  sky0(c, skyStops('dawn', 'gold', 0.4)); bigSun30(c, 760, 820, 70, '#ffd8a0', 0.95);
  par(c, -0.5, 0, 0, () => { ridgeW(c, 960, 80, 0.003, SEED32 + 90, '#b08a7a'); hazeW(c, 1000, 220, '#ffd8b0', 0.6); });
  sandW(c, 1000, '#d0a070', SEED32 + 91, { pebbles: 140, tufts: 0 });
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 760, 1040, 700, '#ffd0a0', 0.25); c.restore();
  c.fillStyle = 'rgba(40,20,8,0.3)'; c.beginPath(); c.ellipse(520, 1290, 340, 38, -0.03, 0, 6.283); c.fill();
  key32(c, 200, 1250, 4.6, -1.62, '#b8863a');
  c.fillStyle = '#c89a68'; c.beginPath(); c.moveTo(690, 1300); c.quadraticCurveTo(790, 1200, 930, 1290); c.quadraticCurveTo(860, 1310, 690, 1306); c.closePath(); c.fill(); // sand drifted over the bit
  blowingSand(c, T, 1150, 0.35, SEED32 + 92);
  if (o.glint) { c.save(); c.globalCompositeOperation = 'lighter'; star4(c, 270, 1225, 34 * o.glint, '#fff6d8', o.glint); c.restore(); }
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- the hero shot (hook, cta, outro, cover): the palace at the golden hour, Qarun on his steps, the porters bending under the keys
const HERO32 = { sky: 'gold', to: 'dusk', k: 0.2, sunX: 880, sunY: 1060, sunA: 0.9, lamp: 0.35, glint: 0.6, z: 1.0, cx: 540, cy: 1150 };
const qOnSteps32 = (T, o = {}) => c => fig(c, QARUN, Object.assign({ x: PX32 + 20, y: PY32 - 56 * PS32 + 2, h: 170, dir: -1, t: T, light: 1.1, wind: 0.4, ink: 0.6 }, o));
function heroPorters32(c, T, o = {}) { bearers32(c, T, { x0: 960, dir: 1, h: 440, n: 4, gy: () => 1850, light: 1.05, dist: o.dist }); }
const hero32 = (c, T, o = {}) => qarunLand32(c, T, Object.assign({}, HERO32, { onPalace: qOnSteps32(T), walkers: o.nearOff ? null : cc => heroPorters32(cc, T, o) }, o));
function heroTexts32(c, a) { if (a <= 0) return; topShade(c, 1.3 * a); seriesTag32(c, a); bigWord27(c, 'SES CLÉS SEULES', 250, a, 92); bigWord27(c, 'PESAIENT SUR DES HOMMES FORTS', 355, a, 58, '#f6c453'); }


// =====================================================================================================================
// ---------- episode 33: the People of the Garden (Al-Qalam 17-33) · « Histoires du Coran »
// The father, the three brothers and the poor are ordinary people, faceless. Allah is never depicted (light only). The calamity
// (« ta'if », Al-Qalam 19) is never a form: a dark front passing over the garden at night, a faint glow of embers, then the black garden.
// Yemen near Sanaa / the father's share for the poor / three brothers = according to the exegetes (Ibn Kathir, al-Tabari, al-Qurtubi).
function seriesTag33(c, a) { textGlow(c, 'HISTOIRES DU CORAN  ·  ÉPISODE 33', W / 2, 112, '600 32px Lora', '#fbe7c6', a * 0.92, '#000000', 12); }
function ctaText33(c, a) { ctaText29(c, a); }
const SEED33 = 3300, GW33 = 1440, GX33 = 540, GTW33 = 200, GTH33 = 262, WH33 = 172, WX0 = -250, WX1 = 1350, HX33 = -700;
const burnAt33 = (o, x) => clamp(typeof o.burn === 'function' ? o.burn(x) : (o.burn || 0));
const BRO33 = [
  { robe: '#7a2a22', wrap: '#e8dcc4', skin: '#a8714f', trim: '#c9a35a', band: '#c9a35a', inner: '#e8dcc0' }, // the eldest
  { robe: '#2e4a66', wrap: '#ece6d6', skin: '#9a6a4c', trim: '#d8c48a', band: '#d8c48a', inner: '#e6e0d0' }, // the most just of them (awsatuhum)
  { robe: '#6a5426', wrap: '#e2d4b4', skin: '#b07a58', trim: '#8a3a1a', band: '#8a3a1a', inner: '#dccca8' }]; // the youngest
const FATHER33 = { robe: '#5a5048', wrap: '#e6e0d4', skin: '#9a6a4c', trim: '#b8a070', band: '#b8a070', inner: '#ddd6c8' };
const POOR33 = [{ robe: '#7a6a54', wrap: '#cfc2a6', skin: '#8f5f42', inner: '#c4b494' }, { robe: '#5e5446', wrap: '#d6cab0', skin: '#a8714f', inner: '#bfb08e' },
  { robe: '#8a7258', wrap: '#c8b896', skin: '#94664a', inner: '#cdbd9a' }, { robe: '#4e4a40', wrap: '#dcd0b6', skin: '#b07a58', inner: '#c8b892' }];

// ---------- a date palm that can burn (burn 0..1: fronds blacken, droop and fall, dates shrivel) or be laden (lush)
function palm33(c, x, y, s, T, seed, burn = 0, o = {}) {
  T += 100; const nt = o.night || 0, lush = o.lush || 0;
  const live = mix(mix('#4f6e2c', '#5e8a34', lush * 0.5), '#16201c', nt * 0.75), col = mix(live, '#16100c', burn), dk = mix(col, '#000000', 0.3);
  const trunkC = mix(mix('#6a5034', '#1c1a22', nt * 0.7), '#140e0a', burn);
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.25)'; c.beginPath(); c.ellipse(6, 2, 46, 7, 0, 0, 6.283); c.fill();
  const sway = Math.sin(T * 0.7 + seed) * 6 * (1 - burn * 0.8), top = [18 + sway, -300];
  limb(c, [0, 0], [26, -150], top, 24, 13, trunkC);
  c.strokeStyle = hexA(mix(trunkC, '#ffffff', 0.18), 0.55); c.lineWidth = 2.2;
  for (let k = 1; k < 17; k++) { const q = k / 17, px = 2 * (1 - q) * q * 26 + q * q * top[0], py = 2 * (1 - q) * q * -150 + q * q * top[1];
    c.beginPath(); c.moveTo(px - 11 + q * 4, py + 3); c.lineTo(px + 11 - q * 4, py - 3); c.stroke(); }
  const r = rng(seed);
  // date bunches under the crown (drawn first: the fronds hang over them)
  const nb = 3 + Math.round(lush * 2);
  for (let k = 0; k < nb; k++) { const bx = top[0] - 34 + k * (68 / Math.max(1, nb - 1)), by = top[1] + 16; c.strokeStyle = mix('#a07a2a', '#1a120c', burn); c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(top[0] - 4 + k * 3, top[1] + 4); c.quadraticCurveTo(bx, by - 4, bx + (k - 1) * 4, by + 30 + lush * 12); c.stroke();
    const rr = rng(seed * 7 + k), nn = 16 + Math.round(lush * 10);
    for (let j = 0; j < nn; j++) { const q = j / nn, dx = (rr() - 0.5) * (24 + lush * 10) * (1 - q * 0.5), dy = 8 + q * (40 + lush * 16), cv = rr();
      c.fillStyle = mix(mix('#6a2a0e', '#c0702a', cv), '#120a08', burn); c.beginPath(); c.ellipse(bx + dx + (k - 1) * 4 * q, by + dy, 3.8 * (1 - 0.35 * burn), 5.8 * (1 - 0.35 * burn), 0.3, 0, 6.283); c.fill(); } }
  // burnt: the dead fronds hang in a short charred skirt along the trunk
  if (burn > 0.25) { const rs = rng(seed + 5); c.lineCap = 'round';
    for (let j = 0; j < 7; j++) { const hx = top[0] + (j - 3) * 9, hl = (70 + rs() * 60) * burn, bend = (j - 3) * 6 + (rs() - 0.5) * 10;
      c.strokeStyle = mix('#2a1e16', '#0c0806', rs()); c.lineWidth = 5; c.beginPath(); c.moveTo(hx, top[1] + 6); c.quadraticCurveTo(hx + bend * 1.6, top[1] + hl * 0.5, hx + bend * 1.2, top[1] + hl); c.stroke();
      c.lineWidth = 2; for (let k = 1; k < 5; k++) { const q = k / 5, qx = hx + bend * 1.4 * q, qy = top[1] + 6 + hl * q; c.beginPath(); c.moveTo(qx, qy); c.lineTo(qx - 7, qy + 8); c.moveTo(qx, qy); c.lineTo(qx + 7, qy + 7); c.stroke(); } } }
  for (let i = 0; i < 12; i++) {
    const rv = r(), lenR = r(), gone = r();
    if (burn > 0.35 && gone < (burn - 0.35) * 0.75) continue; // some fronds burnt away
    const droop = burn * (0.2 + rv * 0.3), ang = -Math.PI / 2 + (i - 5.5) * 0.33 + (rv - 0.5) * 0.15 + Math.sin(T * 0.9 + i) * 0.03 * (1 - burn), len = (122 + lenR * 50) * (1 - 0.42 * burn);
    const a2 = -Math.PI / 2 + (i - 5.5) * 0.27 + (rv - 0.5) * 0.3, l2 = len * (0.7 + rv * 0.3), bb = ease(clamp(burn * 1.4 - 0.2)); // burnt: stiff, short, broken fronds
    const ex = lerp(top[0] + Math.cos(ang) * len, top[0] + Math.cos(a2) * l2, bb), ey = lerp(top[1] + Math.sin(ang) * len * 0.55 + len * 0.42 + droop * len * 0.4, top[1] + Math.sin(a2) * l2, bb);
    const mx = lerp(top[0] + Math.cos(ang) * len * 0.55, top[0] + Math.cos(a2) * l2 * 0.5, bb), my = lerp(top[1] + Math.sin(ang) * len * 0.55 - 26 + droop * len * 0.15, top[1] + Math.sin(a2) * l2 * 0.5 + 6, bb);
    c.strokeStyle = i % 2 ? col : dk; c.lineWidth = 4 + burn; c.beginPath(); c.moveTo(top[0], top[1]); c.quadraticCurveTo(mx, my, ex, ey); c.stroke();
    c.lineWidth = 3;
    for (let k = 2; k < 12; k++) { if (burn > 0.5 && k % 3) continue;
      const q = k / 12, qx = (1 - q) * (1 - q) * top[0] + 2 * (1 - q) * q * mx + q * q * ex, qy = (1 - q) * (1 - q) * top[1] + 2 * (1 - q) * q * my + q * q * ey;
      const l = 30 * (1 - q * 0.6) * (1 - 0.55 * burn); c.beginPath(); c.moveTo(qx, qy); c.lineTo(qx - 6 + Math.cos(ang + 1.4) * l * 0.4, qy + l); c.moveTo(qx, qy); c.lineTo(qx + 6 + Math.cos(ang - 1.4) * l * 0.4, qy + l * 0.9); c.stroke(); }
  }
  if (o.ember && burn > 0.3) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, top[0], top[1] + 10, 90, '#ff6a2a', 0.18 * o.ember * burn); c.restore(); }
  c.restore();
}

// ---------- a vine leaf (three lobes) and a bunch of grapes
function leaf33(c, x, y, R, rot, col) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = col; c.beginPath();
  c.ellipse(0, -R * 0.38, R * 0.55, R * 0.68, 0, 0, 6.283); c.ellipse(-R * 0.46, 0, R * 0.5, R * 0.4, -0.6, 0, 6.283); c.ellipse(R * 0.46, 0, R * 0.5, R * 0.4, 0.6, 0, 6.283); c.fill(); c.restore(); }
function grapes33(c, x, y, s, col, b = 0) { const r = 4.6 * s * (1 - 0.35 * b), cc = mix(col, '#120a0c', b);
  c.strokeStyle = mix('#5a4020', '#140c08', b); c.lineWidth = 2 * s; c.beginPath(); c.moveTo(x, y - 6 * s); c.lineTo(x + 1, y + 2 * s); c.stroke();
  const rows = [5, 5, 4, 4, 3, 2, 1];
  rows.forEach((n, j) => { for (let k = 0; k < n; k++) { const gx = x + (k - (n - 1) / 2) * r * 1.8 + (j % 2) * r * 0.3, gy = y + 4 * s + j * r * 1.6;
    c.fillStyle = mix(cc, '#000000', (k + j) % 3 === 0 ? 0.2 : 0); c.beginPath(); c.arc(gx, gy, r, 0, 6.283); c.fill();
    if (b < 0.5) { c.fillStyle = hexA('#ffffff', 0.22 * (1 - b * 2)); c.beginPath(); c.arc(gx - r * 0.35, gy - r * 0.35, r * 0.3, 0, 6.283); c.fill(); } } });
}
// ---------- a row of vines on a trellis (posts, wire, twisted trunks, leaves, bunches). y = ground line. o.burn = number or function of x
function vineRow33(c, x0, x1, y, s, T, seed, o = {}) {
  T += 100; const nt = o.night || 0, lush = o.lush || 0, step = 150 * s, ph = 140 * s, r = rng(seed);
  const postC = mix('#5a4028', '#16141c', nt * 0.7);
  for (let x = x0; x <= x1 + 1; x += step) { const b = burnAt33(o, x); c.fillStyle = mix(postC, '#120c08', b * 0.6); c.fillRect(x - 4 * s, y - ph, 8 * s, ph); c.fillStyle = 'rgba(10,6,4,0.25)'; c.beginPath(); c.ellipse(x, y + 1, 12 * s, 3 * s, 0, 0, 6.283); c.fill(); }
  c.strokeStyle = hexA(mix('#3a2a1a', '#0c0a10', nt), 0.7); c.lineWidth = 1.6 * s; c.beginPath();
  for (let x = x0; x < x1; x += step) { c.moveTo(x, y - ph * 0.92); c.quadraticCurveTo(x + step / 2, y - ph * 0.86, x + step, y - ph * 0.92); } c.stroke();
  for (let x = x0; x < x1; x += step) {
    const b = burnAt33(o, x + step / 2), sw = Math.sin(T * 0.8 + x * 0.01) * 2 * s * (1 - b);
    const leafC = mix(mix(mix('#5a8a34', '#6a9a3a', lush * 0.6), '#182620', nt * 0.75), '#1c1410', b), leafD = mix(leafC, '#000000', 0.3), leafL = mix(leafC, '#e8f0a0', 0.25 * (1 - b) * (1 - nt));
    const tx = x + step * (0.42 + r() * 0.16); // the twisted trunk
    limb(c, [tx, y], [tx + 14 * s, y - ph * 0.45], [tx - 6 * s, y - ph * 0.88], 12 * s, 7 * s, mix(mix('#5a3a22', '#18141a', nt * 0.7), '#100a08', b));
    const L = []; for (let k = 0; k < 16; k++) L.push([x + r() * step, y - ph * 0.92 + (r() - 0.62) * ph * 0.5, (16 + r() * 11) * s, r() * 6, r(), r()]);
    const G = []; for (let j = 0; j < 3; j++) G.push([x + (0.18 + 0.3 * j) * step + (r() - 0.5) * 18 * s, r(), r()]);
    L.slice(0, 8).forEach(([lx, ly, R, rot, cv, gone]) => { if (b > 0.5 && gone < (b - 0.5) * 1.2) return; leaf33(c, lx + sw, ly, R * (1 - 0.45 * b), rot, cv > 0.5 ? leafD : leafC); });
    G.forEach(([gx, cv, has]) => { if (has < 0.35 - lush * 0.4) return; grapes33(c, gx + sw * 0.5, y - ph * 0.86, s * (0.85 + lush * 0.45), cv > 0.45 ? '#4a1e48' : '#8aa040', b); });
    L.slice(8).forEach(([lx, ly, R, rot, cv, gone]) => { if (b > 0.5 && gone < (b - 0.5) * 1.2) return; leaf33(c, lx + sw, ly - 6 * s, R * (1 - 0.45 * b), rot, cv > 0.6 ? leafL : leafC); });
  }
}

// ---------- a woven palm-leaf basket: origin = bottom centre on the ground (o.hang: origin = top of the handle), o.fill = dates heaped, o.rot = tipped over
function basket33(c, x, y, s, o = {}) { c.save(); c.translate(x, y); c.scale(s, s); if (o.hang) c.translate(0, 124); if (o.rot) { c.translate(o.rot > 0 ? 48 : -48, 0); c.rotate(o.rot); c.translate(o.rot > 0 ? -48 : 48, 0); }
  const col = o.col || '#b8925a', dk = mix(col, '#2a1408', 0.45), lt = mix(col, '#fff0c8', 0.3);
  if (!o.hang && !o.rot) { c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(0, 2, 52, 8, 0, 0, 6.283); c.fill(); }
  if (o.fill) { const rr = rng(77); for (let j = 0; j < 30; j++) { const a = rr() * 3.14, d = Math.sqrt(rr()); c.fillStyle = mix('#6a2a0e', '#b0602a', rr());
    c.beginPath(); c.ellipse(Math.cos(a) * 42 * d, -66 - Math.sin(a) * 22 * d * o.fill, 5, 7, rr() * 3, 0, 6.283); c.fill(); } }
  const g = c.createLinearGradient(-48, 0, 48, 0); g.addColorStop(0, dk); g.addColorStop(0.45, col); g.addColorStop(1, mix(col, '#2a1408', 0.25));
  c.fillStyle = g; c.beginPath(); c.moveTo(-35, 0); c.lineTo(-48, -66); c.lineTo(48, -66); c.lineTo(35, 0); c.closePath(); c.fill();
  c.strokeStyle = hexA(dk, 0.7); c.lineWidth = 2; for (let k = 1; k < 6; k++) { const yy = -k * 11, w2 = lerp(35, 48, k / 6); c.beginPath(); c.moveTo(-w2, yy); c.lineTo(w2, yy); c.stroke(); }
  c.strokeStyle = hexA(lt, 0.5); c.lineWidth = 1.5; for (let k = -4; k <= 4; k++) { c.beginPath(); c.moveTo(k * 8, 0); c.lineTo(k * 11, -66); c.stroke(); }
  c.fillStyle = lt; c.beginPath(); c.ellipse(0, -66, 49, 7, 0, 0, 6.283); c.fill(); c.strokeStyle = dk; c.lineWidth = 2; c.stroke();
  if (o.fill) { const rr = rng(78); for (let j = 0; j < 18; j++) { c.fillStyle = mix('#7a3410', '#c0702a', rr()); c.beginPath(); c.ellipse((rr() - 0.5) * 70, -68 - rr() * 14 * o.fill, 5, 7, rr() * 3, 0, 6.283); c.fill(); } }
  c.strokeStyle = dk; c.lineWidth = 6; c.beginPath(); c.moveTo(-40, -64); c.quadraticCurveTo(-30, -130, 0, -124); c.quadraticCurveTo(30, -130, 40, -64); c.stroke();
  c.strokeStyle = lt; c.lineWidth = 2; c.beginPath(); c.moveTo(-38, -66); c.quadraticCurveTo(-28, -126, 0, -121); c.stroke();
  c.restore(); }
// the near hand of a standing / walking figure (same maths as figureRaw: arm swing + body bob)
function hand33(o) { const s = (o.h || 300) / 300, d = o.dir || 1, w = o.walk === null || o.walk === undefined ? null : o.walk, S = w === null ? 0 : Math.sin(w * Math.PI * 2), sw = w === null ? 0 : -S * 0.5;
  return [o.x + d * (48 + sw * 30) * s, o.y + (-114 + 4) * s - (w === null ? 0 : Math.abs(S) * 3 * s)]; }
// a figure carrying a basket in the near hand
function carrier33(c, who, o, bo = {}) { fig(c, who, o); const [hx, hy] = hand33(o); basket33(c, hx, hy - 4 * (o.h || 300) / 300, 0.55 * (o.h || 300) / 300, Object.assign({ hang: true }, bo)); }
// whispering: three small arcs beside the head (never dots near a head)
function whisper33(c, x, y, s, T, dir = 1, a = 1) { if (a <= 0) return; T += 100; c.save(); c.translate(x, y); c.scale(dir * s, s); c.lineCap = 'round';
  for (let k = 0; k < 3; k++) { const ph = ((T * 1.2 + k / 3) % 1); c.strokeStyle = `rgba(255,244,220,${0.55 * a * Math.sin(ph * Math.PI)})`; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 10 + ph * 26, -0.55, 0.55); c.stroke(); }
  c.restore(); }

// ---------- the highlands of Yemen (far layers): ranges, terraced slopes, a far village of tower houses
function terraces33(c, y, nt, haze) { const col = mix('#8a8660', '#20222c', nt * 0.8);
  ridgeW(c, y, 150, 0.0032, SEED33 + 5, col);
  c.strokeStyle = hexA(mix('#4a4a30', '#0c0c14', nt), 0.35); c.lineWidth = 2;
  for (let k = 0; k < 10; k++) { c.beginPath(); for (let x = -2400; x <= 3400; x += 24) { const yy = ridgeY(x, y, 150, 0.0032, SEED33 + 5) + 16 + k * 20; x === -2400 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); }
  c.strokeStyle = hexA(mix('#c8c08a', '#2a2a3a', nt), 0.25); c.lineWidth = 2;
  for (let k = 0; k < 10; k++) { c.beginPath(); for (let x = -2400; x <= 3400; x += 24) { const yy = ridgeY(x, y, 150, 0.0032, SEED33 + 5) + 13 + k * 20; x === -2400 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); }
  hazeW(c, y + 60, 200, haze || '#f0dccc', 0.42 * (1 - nt * 0.75)); }
function village33(c, T, nt, lamp) { const hy = x => ridgeY(x, 1316, 46, 0.005, SEED33 + 6), col = mix('#9a8a60', '#1e2028', nt * 0.8);
  c.fillStyle = col; c.beginPath(); c.moveTo(-2400, H + 400); for (let x = -2400; x <= 3400; x += 16) c.lineTo(x, hy(x)); c.lineTo(3400, H + 400); c.closePath(); c.fill();
  const r = rng(SEED33 + 7);
  for (let i = 0; i < 9; i++) { const x = 820 + i * 52 + r() * 20, h = 70 + r() * 70, w = 34 + r() * 18; c.save(); c.globalAlpha *= 0.9; towerHouse(c, x, hy(x) + 6, w, h, mix(mix('#9a6040', '#c08a5a', r()), '#24222e', nt * 0.75), SEED33 + 8 + i, T); c.restore(); }
  for (let i = 0; i < 4; i++) { const x = -520 + i * 60 + r() * 20, h = 60 + r() * 50, w = 30 + r() * 14; towerHouse(c, x, hy(x) + 6, w, h, mix(mix('#9a6040', '#c08a5a', r()), '#24222e', nt * 0.75), SEED33 + 20 + i, T); }
  if (nt > 0.3) { c.save(); c.fillStyle = `rgba(8,10,24,${0.5 * nt})`; c.fillRect(-2400, 1100, 5800, 400); c.restore(); }
  hazeW(c, 1330, 90, '#f0dccc', 0.2 * (1 - nt)); }

// ---------- the garden wall and its gate (o.open 0..1 = the two leaves swing inward), o.soot = blackened coping after the fire
function wall33(c, T, o = {}) {
  const y = GW33, h = WH33, nt = o.night || 0, gx = GX33, gw = GTW33, gh = GTH33, soot = o.soot || 0;
  const base = mix('#b89a72', '#2a2834', nt * 0.8), lt = mix(base, '#fff0d8', 0.25 * (1 - nt)), dk = mix(base, '#1a0c06', 0.45);
  const face = (xa, xb, top) => { const g = c.createLinearGradient(0, y - top, 0, y); g.addColorStop(0, lt); g.addColorStop(0.5, base); g.addColorStop(1, dk); c.fillStyle = g; c.fillRect(xa, y - top, xb - xa, top);
    const r = rng(SEED33 + 11 + Math.round(xa)); c.strokeStyle = hexA(mix(dk, '#000000', 0.2), 0.35); c.lineWidth = 2;
    for (let yy = y - 4, row = 0; yy > y - top + 6; yy -= 24, row++) { c.beginPath(); c.moveTo(xa, yy); c.lineTo(xb, yy); c.stroke();
      for (let xx = xa + (row % 2) * 22 + r() * 10; xx < xb; xx += 40 + r() * 20) { c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx + (r() - 0.5) * 4, yy - 24); c.stroke(); } }
    const rr = rng(SEED33 + 12 + Math.round(xb)); for (let k = 0; k < (xb - xa) / 30; k++) { c.fillStyle = hexA(rr() > 0.5 ? '#fff4dc' : '#3a2414', 0.08 * (1 - nt * 0.6)); c.beginPath(); c.ellipse(xa + rr() * (xb - xa), y - rr() * top, 20 + rr() * 30, 8 + rr() * 10, 0, 0, 6.283); c.fill(); }
    c.fillStyle = mix(lt, '#ffffff', 0.1 * (1 - nt)); c.beginPath(); c.roundRect(xa - 6, y - top - 12, xb - xa + 12, 16, 6); c.fill(); c.fillStyle = hexA(dk, 0.5); c.fillRect(xa - 6, y - top + 2, xb - xa + 12, 4);
    if (soot > 0) { const sg = c.createLinearGradient(0, y - top - 12, 0, y - top + 70); sg.addColorStop(0, `rgba(14,10,8,${0.55 * soot})`); sg.addColorStop(1, 'rgba(14,10,8,0)'); c.fillStyle = sg; c.fillRect(xa - 6, y - top - 12, xb - xa + 12, 82); } };
  face(WX0, gx - gw / 2 - 30, h); face(gx + gw / 2 + 30, WX1, h);
  // corner posts at both ends
  [WX0, WX1].forEach(xx => { face(xx - 22, xx + 22, h + 26); });
  // the gate: two pillars and a lintel with a small pointed arch, the two plank leaves
  const pl = (xa) => face(xa, xa + 30, gh + 40); pl(gx - gw / 2 - 30); pl(gx + gw / 2);
  c.fillStyle = base; c.fillRect(gx - gw / 2 - 30, y - gh - 40, gw + 60, 30); c.fillStyle = lt; c.fillRect(gx - gw / 2 - 36, y - gh - 52, gw + 72, 14);
  c.fillStyle = dk; c.beginPath(); archPath(c, gx, y - gh - 12, 70, 0); c.fill();
  c.strokeStyle = hexA(dk, 0.7); c.lineWidth = 6; c.beginPath(); c.moveTo(gx - gw / 2, y - gh - 10); c.lineTo(gx + gw / 2, y - gh - 10); c.stroke();
  const op = ease(clamp(o.open || 0)), wood = mix('#6a4428', '#1a1620', nt * 0.75), wdk = mix(wood, '#000000', 0.4);
  const leafD = (hx, sgn) => { const w = gw / 2 * Math.cos(op * 1.35), sh = op * 16; // swings inward: narrower and a bit smaller (perspective)
    const xa = hx, xb = hx + sgn * w; c.fillStyle = op > 0.05 ? mix(wood, '#000000', 0.25 * op) : wood;
    c.beginPath(); c.moveTo(xa, y - gh - 10); c.lineTo(xb, y - gh - 10 + sh); c.lineTo(xb, y - sh * 0.6); c.lineTo(xa, y); c.closePath(); c.fill();
    c.strokeStyle = hexA(wdk, 0.8); c.lineWidth = 2; for (let k = 1; k < 4; k++) { const xx = lerp(xa, xb, k / 4); c.beginPath(); c.moveTo(xx, y - gh - 10 + sh * k / 4); c.lineTo(xx, y - sh * 0.6 * k / 4); c.stroke(); }
    c.strokeStyle = mix('#2a2a2e', '#0a0a0e', nt); c.lineWidth = 6; [0.18, 0.78].forEach(q => { c.beginPath(); c.moveTo(xa, y - gh * (1 - q) - 10 * (1 - q)); c.lineTo(xb, y - gh * (1 - q) - 10 * (1 - q) + sh * (1 - q) - sh * 0.6 * q); c.stroke(); }); };
  leafD(gx - gw / 2, 1); leafD(gx + gw / 2, -1);
}
// inside the wall: the garden ground, a row of vines (seen through the gate) and two rows of palms
function orchard33(c, T, o = {}) { const nt = o.night || 0;
  const gb = burnAt33(o, GX33), ig = mix(mix('#7a8a48', '#2e3424', nt * 0.75), '#2a2420', gb);
  c.fillStyle = ig; c.fillRect(WX0, 1300, WX1 - WX0, GW33 - 1300 + 2);
  for (let i = 0, r = rng(SEED33 + 30); i < 16; i++) { const x = WX0 + 40 + i * 100 + r() * 40; palm33(c, x, 1392 + r() * 8, 1.0 + r() * 0.12, T, SEED33 + 31 + i, burnAt33(o, x), { night: nt, lush: o.lush, ember: o.ember }); }
  vineRow33(c, WX0 + 20, WX1 - 20, GW33 - 26, 0.62, T, SEED33 + 50, { burn: o.burn, night: nt, lush: o.lush });
  for (let i = 0, r = rng(SEED33 + 60); i < 9; i++) { const x = WX0 + 110 + i * 185 + r() * 40; if (Math.abs(x - GX33) < 120) continue; palm33(c, x, GW33 - 8, 1.32 + r() * 0.12, T, SEED33 + 61 + i, burnAt33(o, x), { night: nt, lush: o.lush, ember: o.ember }); }
}
// near ground outside the wall: earth, the beaten path to the gate, a little irrigation channel, stones and tufts
function ground33(c, T, o = {}) { const nt = o.night || 0, earth = mix('#b08a5c', '#2a2630', nt * 0.8);
  const g = c.createLinearGradient(0, GW33, 0, H + 300); g.addColorStop(0, mix(earth, '#fff0d4', 0.14 * (1 - nt))); g.addColorStop(0.4, earth); g.addColorStop(1, mix(earth, '#140a04', 0.5));
  c.fillStyle = g; c.fillRect(-2400, GW33, 5800, H + 1200);
  c.fillStyle = hexA(mix('#3a2a1a', '#0c0a10', nt), 0.45); c.fillRect(-2400, GW33, 5800, 6);
  c.fillStyle = hexA(mix(earth, '#fff4dc', 0.35), 0.35 * (1 - nt * 0.6)); c.beginPath(); // the path: to the gate, and along the wall toward the house
  c.moveTo(GX33 - GTW33 / 2, GW33); c.lineTo(GX33 + GTW33 / 2, GW33); c.lineTo(GX33 + 560, H + 300); c.lineTo(GX33 - 560, H + 300); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(HX33 - 200, GW33 + 30); c.lineTo(GX33, GW33 + 30); c.lineTo(GX33, GW33 + 150); c.lineTo(HX33 - 200, GW33 + 170); c.closePath(); c.fill();
  c.strokeStyle = hexA(mix(earth, '#2a1a0c', 0.5), 0.25); c.lineWidth = 2; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(GX33 + k * 20, GW33 + 4); c.lineTo(GX33 + k * 150, H + 300); c.stroke(); }
  if (o.channel !== false) { c.fillStyle = mix('#5a4a3a', '#141420', nt); c.fillRect(-2400, GW33 + 14, 5800, 7); c.fillStyle = hexA(mix('#9ac0d0', '#2a3050', nt), (1 - burnAt33(o, GX33) * 0.8) * 0.5); c.fillRect(-2400, GW33 + 16, 5800, 3); }
  const r = rng(SEED33 + 70);
  for (let i = 0; i < 120; i++) { const q = Math.pow(r(), 1.6), yy = GW33 + 30 + q * (H + 200 - GW33), x = -1800 + r() * 4600, sz = 2 + q * 14, cv = r();
    c.fillStyle = hexA(mix(earth, cv > 0.6 ? '#2a1a10' : '#fff0d8', 0.4), 0.5); c.beginPath(); c.ellipse(x, yy, sz, sz * 0.45, 0, 0, 6.283); c.fill(); }
  for (let i = 0; i < 26; i++) { const q = Math.pow(r(), 1.3), yy = GW33 + 26 + q * (H - GW33), x = -1400 + r() * 3800; if (Math.abs(x - GX33) < 200 + q * 300) continue; shrub(c, x, yy, 0.25 + q * 0.8, mix('#6a7a3a', '#1c2420', nt * 0.75), T, i + 3); }
}
// the brothers' house (left of the garden, on the path): mud brick, lamp in the window, a bench
function home33(c, T, o = {}) { const nt = o.night || 0; house(c, HX33, GW33 + 2, 430, 330, mix('#b88e64', '#2a2632', nt * 0.75), { lamp: o.lamp === undefined ? nt : o.lamp, t: T, doorOpen: o.doorOpen });
  palm33(c, HX33 + 300, GW33 + 4, 1.1, T, SEED33 + 90, 0, { night: nt }); }
// the calamity passing over the garden at night (Al-Qalam 19): a dark rolling front, a faint low glow of embers behind it. Never a form.
function fleau33(c, T, sx, k = 1) { if (k <= 0) return; T += 100; const r = rng(SEED33 + 80);
  for (let i = 0; i < 46; i++) { const u = r(), R = 90 + r() * 170, dx = (r() - 0.5) * 420 + Math.sin(T * 0.5 + i) * 30, dy = 880 + u * 600 + Math.cos(T * 0.4 + i * 1.7) * 26;
    const g = c.createRadialGradient(sx + dx, dy, 0, sx + dx, dy, R); g.addColorStop(0, `rgba(6,4,10,${0.72 * k})`); g.addColorStop(1, 'rgba(6,4,10,0)'); c.fillStyle = g; c.fillRect(sx + dx - R, dy - R, R * 2, R * 2); }
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 10; i++) { const x = sx - 120 - i * 70, a = 0.2 * k * (1 - i / 10); glow(c, x, 1390 - (i % 3) * 30, 160, '#ff5a1e', a); }
  const rr = rng(SEED33 + 81); for (let i = 0; i < 60; i++) { const x = sx - 80 - rr() * 700, ph = (T * (0.3 + rr() * 0.4) + rr()) % 1, y = 1420 - ph * 420 - rr() * 60, a = k * Math.sin(ph * Math.PI) * (1 - (sx - x) / 800);
    if (a <= 0) continue; c.fillStyle = `rgba(255,${130 + (i % 4) * 25},60,${0.7 * a})`; c.beginPath(); c.arc(x + Math.sin(T + i) * 10, y, 1.6 + (i % 3), 0, 6.283); c.fill(); }
  c.restore(); }
// thin smoke still rising from the black garden in the morning
function smoke33(c, T, k, x0 = WX0, x1 = WX1) { if (k <= 0) return; for (let i = 0; i < 6; i++) smoke(c, T + 100, x0 + 120 + i * (x1 - x0 - 240) / 5, 1300, 4, SEED33 + 82 + i, '#4a4448', 0.22 * k, 0.6, 40); }

// ---------- the land: sky, highlands, far village, the walled garden, the house, the near ground; walkers on the ground
function garden33(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 8) : [0, 0]));
  const px = o.px || 0, nt = o.night || 0;
  if (o.skyFn) o.skyFn(c); else sky0(c, skyStops(o.sky || 'day', o.to, o.k || 0));
  if (o.stars) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); stars(c, T, 150, SEED33 + 1, [0, 0, W, 1000], o.stars); c.restore(); }
  if (o.moon) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); moon(c, o.moonX || 780, o.moonY || 360, 44, o.moon); c.restore(); }
  if (o.sunA) bigSun30(c, o.sunX === undefined ? 860 : o.sunX, o.sunY === undefined ? 1060 : o.sunY, 50, o.sunCol || '#ffd08a', o.sunA);
  cloudBank(c, T, 330, 6, o.cloud || '#fff0dc', 0.14 * (1 - nt * 0.8), SEED33 + 2, 6);
  par(c, -0.8, px, 0, () => { ridgeW(c, 1120, 250, 0.0024, SEED33 + 3, mix('#8a88a6', '#181a30', nt)); hazeW(c, 1160, 260, o.haze || '#f0dccc', 0.5 * (1 - nt * 0.75)); });
  par(c, -0.55, px, 0, () => terraces33(c, 1250, nt, o.haze));
  par(c, -0.38, px, 0, () => village33(c, T, nt, o.lamp || 0));
  par(c, -0.15, px, 0, () => { orchard33(c, T, o); if (o.sweep !== undefined) fleau33(c, T, o.sweep, o.sweepK === undefined ? 1 : o.sweepK); wall33(c, T, o); home33(c, T, { night: nt, lamp: o.homeLamp, doorOpen: o.doorOpen }); if (o.onWall) o.onWall(c); });
  par(c, 0, px, 0, () => { ground33(c, T, o); if (o.props) o.props(c); });
  if (o.smoke) par(c, -0.15, px, 0, () => smoke33(c, T, o.smoke));
  if (o.light) lightFromAbove(c, T, o.lightX || 540, o.light, o.lightW || 380);
  par(c, 0, px, 0, () => { if (o.walkers) o.walkers(c); });
  if (o.tint) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = o.tint; c.fillRect(0, 0, W, H); c.restore(); }
  if (o.fg !== false) blurLayer(c, 10, bc => { shrub(bc, -40, 2140, 3.2, mix('#4a5a2a', '#101418', nt * 0.8), T, 7); rock(bc, 1130, 2120, 360, 200, mix('#8a7050', '#1a1820', nt * 0.8), SEED33 + 95); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// ---------- inside the garden: rows of vines one behind the other, palms behind, the earth with furrows; people stand in the open middle
function vineyard33(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 8) : [0, 0]));
  const px = o.px || 0, nt = o.night || 0;
  if (o.skyFn) o.skyFn(c); else sky0(c, skyStops(o.sky || 'day', o.to, o.k || 0));
  if (o.stars) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); stars(c, T, 150, SEED33 + 1, [0, 0, W, 900], o.stars); c.restore(); }
  if (o.moon) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); moon(c, o.moonX || 780, o.moonY || 360, 44, o.moon); c.restore(); }
  if (o.sunA) bigSun30(c, o.sunX === undefined ? 860 : o.sunX, o.sunY === undefined ? 1000 : o.sunY, 50, o.sunCol || '#ffd08a', o.sunA);
  par(c, -0.8, px, 0, () => { ridgeW(c, 1080, 250, 0.0024, SEED33 + 3, mix('#8a88a6', '#181a30', nt)); hazeW(c, 1120, 260, o.haze || '#f0dccc', 0.5 * (1 - nt * 0.75)); });
  par(c, -0.5, px, 0, () => terraces33(c, 1200, nt, o.haze));
  par(c, -0.25, px, 0, () => { const b = burnAt33(o, 540), top = mix(mix(mix('#9a8a52', '#7a8a48', 0.4), '#2a2a2c', nt * 0.75), '#7a7470', b), bot = mix(mix('#5a4630', '#16141c', nt * 0.75), '#3e3a36', b);
    const g = c.createLinearGradient(0, 1290, 0, H + 300); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(-2400, 1290, 5800, H + 1000);
    for (let i = 0, r = rng(SEED33 + 100); i < 22; i++) { const x = -800 + i * 130 + r() * 50; palm33(c, x, 1296, 0.78 + r() * 0.1, T, SEED33 + 101 + i, burnAt33(o, x), { night: nt, lush: o.lush, ember: o.ember }); } });
  par(c, -0.1, px, 0, () => { const Y = [1334, 1378, 1436, 1516, 1626], S = [0.38, 0.48, 0.62, 0.82, 1.08], b = burnAt33(o, 540); const soil = mix(mix(mix('#9a8a52', '#7a8a48', 0.4), '#2a2a2c', nt * 0.75), '#7a7470', b);
    { const pc = mix(mix('#c8b080', '#3a3a44', nt * 0.75), '#a8a29c', b), pg = c.createLinearGradient(0, 1300, 0, 2000); pg.addColorStop(0, hexA(pc, 0)); pg.addColorStop(0.5, hexA(pc, 0.22)); pg.addColorStop(1, hexA(pc, 0.3)); c.fillStyle = pg; c.save(); c.filter = 'blur(6px)'; c.beginPath(); c.moveTo(510, 1300); c.lineTo(570, 1300); c.lineTo(900, H + 300); c.lineTo(180, H + 300); c.closePath(); c.fill(); c.restore(); } // the middle path, soft
    Y.forEach((y, j) => { c.strokeStyle = hexA('#2a1a0c', 0.22); c.lineWidth = 2 + j; c.beginPath(); c.moveTo(-2400, y + 4 + j * 2); c.lineTo(3400, y + 4 + j * 2); c.stroke();
      const vo = { burn: o.burn, night: nt, lush: o.lush };
      if (j < 4) vineRow33(c, -1000 + (j % 2) * 60 * S[j], 2100, y, S[j], T, SEED33 + 110 + j, vo);
      else { vineRow33(c, -1400, 250, y, S[j], T, SEED33 + 114, vo); vineRow33(c, 830, 2400, y, S[j], T, SEED33 + 115, vo); } });
    const r = rng(SEED33 + 121); for (let i = 0; i < 60; i++) { const q = r(), yy = 1640 + q * 520, x = -500 + r() * 2100, sz = 2 + q * 10, cv = r();
      c.fillStyle = hexA(mix(soil, cv > 0.5 ? '#1a1410' : '#fff4e0', 0.4), 0.5); c.beginPath(); c.ellipse(x, yy, sz, sz * 0.45, 0, 0, 6.283); c.fill(); }
    if (o.ash) { const r = rng(SEED33 + 120); for (let i = 0; i < 70; i++) { const q = r(), yy = 1560 + q * 560, x = -400 + r() * 1900, cv = r(); c.fillStyle = cv > 0.5 ? `rgba(150,144,138,${0.35 * o.ash})` : `rgba(24,20,18,${0.3 * o.ash})`; c.beginPath(); c.ellipse(x, yy, 18 + q * 40, 4 + q * 7, 0, 0, 6.283); c.fill(); } } });
  if (o.sweep !== undefined) par(c, -0.1, px, 0, () => fleau33(c, T, o.sweep, o.sweepK === undefined ? 1 : o.sweepK));
  if (o.smoke) par(c, -0.1, px, 0, () => smoke33(c, T, o.smoke, -600, 1700));
  if (o.light) lightFromAbove(c, T, o.lightX || 540, o.light, o.lightW || 380);
  par(c, 0, px, 0, () => { if (o.props) o.props(c); if (o.walkers) o.walkers(c); });
  if (o.vision) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const v = c.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H * 0.5, H * 0.72); v.addColorStop(0, 'rgba(255,250,235,0)'); v.addColorStop(1, `rgba(255,248,230,${0.55 * o.vision})`); c.fillStyle = v; c.fillRect(0, 0, W, H); c.restore(); }
  if (o.fg !== false) blurLayer(c, 10, bc => { vineRow33(bc, -700, 160, 2140, 2.3, T, SEED33 + 130, { burn: o.burn, night: nt, lush: o.lush }); vineRow33(bc, 1000, 1900, 2160, 2.3, T, SEED33 + 131, { burn: o.burn, night: nt, lush: o.lush }); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// ---------- the brothers' room at night: the three asleep on their mats (sleeper29), the lamp low
function sleepRoom33(c, T, o = {}) { dkRoom(c, T, { night: 1, z: o.z || 1, cx: o.cx || 560, cy: o.cy || 1300, lamp: o.lamp === undefined ? 0.35 : o.lamp, shaft: 0, winShadow: o.winShadow || 0 });
  sleeper29(c, 690, 1606, 0.8, T, BRO33[2], { dir: -1, light: 0.5 }); sleeper29(c, 330, 1660, 0.9, T, BRO33[1], { dir: 1, light: 0.55 }); sleeper29(c, 640, 1790, 1.08, T, BRO33[0], { dir: 1, light: 0.6 });
  if (o.dark) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(4,4,10,${o.dark})`; c.fillRect(0, 0, W, H); c.restore(); }
  c.setTransform(1, 0, 0, 1, 0, 0); }

// ---------- the hero shot (hook, cta, outro, cover): the black garden at dawn, smoke, the gate open, the three brothers before it, a basket dropped
const HERO33 = { sky: 'dawn', to: 'gold', k: 0.25, sunX: 880, sunY: 1150, sunA: 0.75, burn: 1, soot: 1, open: 1, smoke: 0.8, z: 1.0, cx: 540, cy: 1250, haze: '#f0d0c0' };
function heroBros33(T, o = {}) { const k = o.k === undefined ? 1 : o.k; return c => {
  basket33(c, 450, 1714, 0.75, { rot: -1.45, fill: 0 });
  fig(c, BRO33[1], { x: 620, y: 1600, h: 320, dir: 1, t: T + 1, light: 1, wind: 0.4, ink: 0.7, reach: 0.25 * k });
  fig(c, BRO33[0], { x: 340, y: 1730, h: 430, dir: 1, t: T, light: 1.05, wind: 0.45, ink: 0.75, armUp: 0.35 * k });
  fig(c, BRO33[2], { x: 820, y: 1700, h: 410, dir: -1, t: T + 2, light: 1, wind: 0.45, ink: 0.75, reach: 0.45 * k }); }; }
const hero33 = (c, T, o = {}) => garden33(c, T, Object.assign({}, HERO33, { walkers: o.noBros ? null : heroBros33(T) }, o));
function heroTexts33(c, a) { if (a <= 0) return; topShade(c, 1.3 * a); seriesTag33(c, a); bigWord27(c, 'LEUR JARDIN', 250, a, 104); bigWord27(c, 'NOIR COMME LA NUIT', 360, a, 84, '#f6c453'); }

// sweep of the calamity: burn front following the dark front (left -> right)
const burnFront33 = sx => x => clamp((sx - x) / 260);
const GREEN33 = { sky: 'day', to: 'gold', k: 0.35, sunX: 900, sunY: 820, sunA: 0.7, burn: 0, open: 1 };


// =====================================================================================================================
// ---------- episode 34: the Cow of the Children of Israel (Al-Baqara 67-73) · « Histoires du Coran »
// Moussa = white silhouette, face hidden by a veil of white light (MUSA). The people, the murdered man, his nephew and the owner of the
// cow are ordinary people, faceless. Allah is never depicted (light only). The murder and the slaughter are never shown: night, a door,
// a covered body; the crowd's backs, a rope on the ground. The murdered man under his shroud is warm linen, never a white veil of light.
// The nephew / the inheritance / the other clan / the man naming his killer / the price = according to the exegetes (Ibn Kathir, al-Tabari).
function seriesTag34(c, a) { textGlow(c, 'HISTOIRES DU CORAN  ·  ÉPISODE 34', W / 2, 112, '600 32px Lora', '#fbe7c6', a * 0.92, '#000000', 12); }
function ctaText34(c, a) { ctaText29(c, a); }
const SEED34 = 3400, GY34 = 1300; // horizon of the camp plain
const hY34 = y => Math.max(60, (y - GY34) * 0.95); // figure height by depth (flat ground)
const ISR34 = [
  { robe: '#6a4a2a', wrap: '#e6dcc6', skin: '#a8714f', trim: '#c9a35a', band: '#c9a35a', inner: '#e4dac2' },
  { robe: '#3a4a5e', wrap: '#ece4d2', skin: '#9a6a4c', trim: '#b8a070', band: '#b8a070', inner: '#e2dccc' },
  { robe: '#5e5a3a', wrap: '#dcd0b0', skin: '#b07a58', trim: '#8a6a3a', band: '#8a6a3a', inner: '#d8ccaa' },
  { robe: '#7a5a3a', wrap: '#e8e0cc', skin: '#94664a', trim: '#5a3a20', band: '#5a3a20', inner: '#ddd2ba' },
  { robe: '#4a3a34', wrap: '#d8ccb4', skin: '#a8714f', trim: '#a89070', band: '#a89070', inner: '#cfc4aa' },
  { robe: '#5a6a5a', wrap: '#e4dccc', skin: '#9a6a4c', trim: '#c8b48a', band: '#c8b48a', inner: '#e0d8c6' },
  { robe: '#8a6a44', wrap: '#efe6d2', skin: '#b07a58', trim: '#4a3018', band: '#4a3018', inner: '#e6dcc4' },
  { robe: '#3e4436', wrap: '#d4c8ae', skin: '#8f5f42', trim: '#9a8a62', band: '#9a8a62', inner: '#cabe9e' }];
const NEPHEW34 = { robe: '#6a1e1a', wrap: '#d8c8b0', skin: '#9a6a4c', trim: '#2a0e0a', band: '#2a0e0a', inner: '#cdbfa6' }; // the killer (dark red)
const RICH34 = { robe: '#4a2a5a', wrap: '#eee6d6', skin: '#a8714f', trim: '#d8b45a', band: '#d8b45a', inner: '#e6dccc' };   // the murdered man
const OWNER34 = { robe: '#2e5a5a', wrap: '#ece6d6', skin: '#b07a58', trim: '#d8c48a', band: '#d8c48a', inner: '#e6e0d0' };  // the owner of the cow
const MUSA34 = Object.assign({}, MUSA, { veilGlow: 0.34 });

// ---------- the cow (side view, facing right for dir 1): origin = ground under the body. s = 1 → body ~300 px long.
// o.col: 'yellow' (Al-Baqara 69: bright yellow) | 'brown' | 'old' (thin, sagging, ribs) ; o.calf = young (small, no horns) ;
// o.dist = walk driven by the distance (cowStep34) ; o.head 0..1 = grazing ; o.glow ; o.yoke = yoke on the neck ; o.halter = rope halter.
const cowStep34 = (dist, s) => dist / (150 * s);
const COWCOL34 = { yellow: ['#ffe08a', '#f2b62e', '#b87a12', '#6a400a'], brown: ['#c08a5a', '#8a5430', '#5a3218', '#2a160a'],
  old: ['#b8a894', '#8a7a68', '#5a4c40', '#2e2620'], dark: ['#7a5a44', '#4a3426', '#2a1c14', '#140c08'] };
function cowAnchor34(x, y, s, dir, o = {}) { const hd = o.head || 0, calf = o.calf ? 0.72 : 1; // muzzle point (for the halter rope)
  return [x + dir * (178 + hd * 8) * s * calf, y + (-150 + hd * 128) * s * calf]; }
function cow34(c, x, y, s, T, o = {}) {
  T += 100; const dir = o.dir || 1, P = COWCOL34[o.col || 'yellow'], old = o.col === 'old' ? 1 : 0, calf = o.calf ? 1 : 0, nt = o.night || 0, dim = o.dim || 0;
  const col = k => mix(mix(P[k], '#14141e', nt * 0.7), '#000000', dim);
  const ss = s * (calf ? 0.72 : 1);
  c.save(); c.translate(x, y); c.scale(ss * dir, ss);
  if (o.glow) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -150, 320, '#ffd060', 0.28 * o.glow * (0.92 + 0.08 * Math.sin(T * 2))); c.restore(); }
  c.fillStyle = `rgba(10,6,4,${0.3 * (1 - nt * 0.4)})`; c.beginPath(); c.ellipse(4, 2, 170, 14, 0, 0, 6.283); c.fill();
  const walking = o.dist !== undefined && o.dist !== null, ph = walking ? cowStep34(o.dist, ss) * 6.283 : 0, A = walking ? 26 : 0;
  const LG = (d) => { const g = c.createLinearGradient(0, -130, 0, 0); g.addColorStop(0, mix(col(1), '#000000', d)); g.addColorStop(1, mix(col(2), '#000000', d)); return g; };
  // a leg: hip/shoulder at (lx, -118), knee/hock, hoof on the ground; stance feet slide back with the body, swing feet lift
  const leg = (lx, far, off, hind) => { const d = far ? 0.3 : 0, q = ph + off, sx = Math.sin(q) * A, lift = walking ? Math.max(0, Math.cos(q)) * 12 : 0;
    const fx = lx + sx, fy = -lift, kx = lx + sx * 0.5 + (hind ? -10 : 6), ky = -64 - lift * 0.5;
    limb(c, [lx, -140], [kx, ky], [fx, fy - 12], (hind ? 46 : 38) * (old ? 0.8 : 1), 12, LG(d));
    c.fillStyle = mix(col(3), '#000000', d); c.beginPath(); c.moveTo(fx - 10, fy - 14); c.lineTo(fx + 10, fy - 14); c.lineTo(fx + 12, fy); c.lineTo(fx - 9, fy); c.closePath(); c.fill(); // hoof
    c.strokeStyle = hexA('#000000', 0.35); c.lineWidth = 1.5; c.beginPath(); c.moveTo(fx + 1, fy - 13); c.lineTo(fx + 1, fy); c.stroke(); };
  leg(-92, true, Math.PI, true); leg(90, true, 0, false); leg(-74, false, 0, true); leg(108, false, Math.PI, false);
  // tail with its tuft
  const sw = Math.sin(T * 1.7) * 0.6 + (o.swish || 0) * Math.sin(T * 5);
  c.strokeStyle = col(2); c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-138, -172); c.quadraticCurveTo(-158 + sw * 6, -120, -150 + sw * 14, -66); c.stroke();
  c.fillStyle = col(3); c.beginPath(); c.ellipse(-150 + sw * 14, -58, 9, 18, sw * 0.2, 0, 6.283); c.fill();
  // body: barrel, withers, hip bone; old = sagging back and belly
  const sag = old * 18, belly = old * 10;
  const body = () => { c.beginPath(); c.moveTo(-146, -170); c.bezierCurveTo(-140, -200, -110, -214, -84, -206); c.bezierCurveTo(-40, -196 + sag, 30, -196 + sag, 70, -204);
    c.bezierCurveTo(96, -216, 124, -212, 132, -196); c.bezierCurveTo(150, -170, 150, -132, 130, -112); c.bezierCurveTo(100, -96, 60, -88 + belly, 0, -86 + belly);
    c.bezierCurveTo(-60, -86 + belly, -100, -96, -126, -112); c.bezierCurveTo(-150, -126, -152, -150, -146, -170); c.closePath(); };
  body(); const bg = c.createLinearGradient(0, -200, 0, -96); bg.addColorStop(0, col(0)); bg.addColorStop(0.4, col(1)); bg.addColorStop(1, col(2)); c.fillStyle = bg; c.fill();
  c.save(); body(); c.clip();
  const sh = c.createLinearGradient(-150, 0, 150, 0); sh.addColorStop(0, hexA('#000000', 0.18)); sh.addColorStop(0.35, 'rgba(0,0,0,0)'); sh.addColorStop(0.8, 'rgba(0,0,0,0)'); sh.addColorStop(1, hexA('#000000', 0.12)); c.fillStyle = sh; c.fillRect(-160, -210, 320, 120);
  c.strokeStyle = hexA(col(0), 0.55 * (1 - nt)); c.lineWidth = 7; c.beginPath(); c.moveTo(-126, -182); c.bezierCurveTo(-60, -196 + sag, 40, -192 + sag * 0.5, 110, -194); c.stroke(); // sheen on the back
  c.strokeStyle = hexA(col(3), 0.25); c.lineWidth = 3; c.beginPath(); c.moveTo(-96, -180); c.quadraticCurveTo(-110, -150, -92, -118); c.stroke(); // hip
  c.beginPath(); c.moveTo(86, -186); c.quadraticCurveTo(70, -150, 84, -116); c.stroke(); // shoulder
  if (old) { c.strokeStyle = hexA(col(3), 0.35); c.lineWidth = 3; for (let k = -2; k <= 3; k++) { c.beginPath(); c.moveTo(k * 18, -178 + sag); c.quadraticCurveTo(k * 18 + 8, -140, k * 18, -108); c.stroke(); } }
  c.restore();
  // neck, dewlap and head (hd: grazing lowers the head to the grass)
  const hd = o.head || 0, bob = Math.sin(T * 0.9) * 0.04, hx = 182 + hd * 8, hy = -156 + hd * 128 + bob * 30;
  const ng = c.createLinearGradient(0, -210, 0, -110); ng.addColorStop(0, col(0)); ng.addColorStop(1, col(2));
  c.fillStyle = ng; c.beginPath(); c.moveTo(96, -196); c.quadraticCurveTo(140, -206 + hd * 40, hx - 12, hy - 30); c.lineTo(hx - 6, hy + 14); c.quadraticCurveTo(130, -100 + hd * 40, 112, -112); c.closePath(); c.fill();
  c.fillStyle = col(1); c.beginPath(); c.moveTo(118, -122); c.quadraticCurveTo(140, -88 + hd * 30, hx - 18, hy + 12); c.quadraticCurveTo(140, -120 + hd * 30, 118, -122); c.fill(); // dewlap
  c.save(); c.translate(hx, hy); c.rotate(0.5 + hd * 0.9); c.scale(1.2, 1.2);
  const hg = c.createLinearGradient(0, -30, 0, 30); hg.addColorStop(0, col(0)); hg.addColorStop(1, col(2));
  c.fillStyle = hg; c.beginPath(); c.moveTo(-26, -26); c.quadraticCurveTo(10, -34, 30, -18); c.quadraticCurveTo(58, -8, 62, 12); c.quadraticCurveTo(60, 30, 40, 30); c.quadraticCurveTo(0, 30, -24, 20); c.quadraticCurveTo(-36, 0, -26, -26); c.closePath(); c.fill();
  c.fillStyle = mix(col(2), '#3a2418', 0.5); c.beginPath(); c.ellipse(52, 16, 14, 14, 0, 0, 6.283); c.fill(); // muzzle
  c.fillStyle = hexA('#140a06', 0.7); c.beginPath(); c.ellipse(58, 12, 3, 4, 0.3, 0, 6.283); c.fill();
  c.fillStyle = '#1a0e08'; c.beginPath(); c.ellipse(4, -6, 5, 4, 0.2, 0, 6.283); c.fill(); c.fillStyle = hexA('#ffffff', 0.5); c.beginPath(); c.arc(3, -7, 1.4, 0, 6.283); c.fill(); // eye
  c.fillStyle = col(1); c.beginPath(); c.ellipse(-28, -10, 22, 9, -0.5 + Math.sin(T * 1.3) * 0.12, 0, 6.283); c.fill(); // ear
  c.fillStyle = hexA(col(3), 0.4); c.beginPath(); c.ellipse(-30, -10, 14, 4, -0.5 + Math.sin(T * 1.3) * 0.12, 0, 6.283); c.fill();
  if (!calf) { c.strokeStyle = mix('#efe2c2', '#2a2a30', nt * 0.6); c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(-14, -26); c.quadraticCurveTo(-22, -52, -4, -60); c.stroke();
    c.strokeStyle = hexA('#5a4a30', 0.6); c.lineWidth = 3; c.beginPath(); c.moveTo(-10, -55); c.lineTo(-4, -60); c.stroke(); }
  if (o.halter) { c.strokeStyle = '#6a4a24'; c.lineWidth = 4; c.beginPath(); c.moveTo(42, -22); c.lineTo(42, 30); c.moveTo(-8, -24); c.quadraticCurveTo(20, 4, 46, 2); c.stroke(); }
  c.restore();
  if (o.yoke) { c.fillStyle = '#5a3a20'; c.save(); c.translate(124, -206); c.rotate(-0.15); c.fillRect(-60, -10, 120, 16); c.fillStyle = '#3a2414'; c.fillRect(-46, -10, 8, 46); c.fillRect(38, -10, 8, 46); c.restore(); }
  c.restore();
}

// ---------- the settlement of the Children of Israel: Sinai granite ranges, black tents and mud houses, palms, the open sandy ground
function sinai34(c, T, nt, haze, px) { par(c, -0.85, px, 0, () => { ridgeW(c, 1080, 330, 0.0021, SEED34 + 1, mix('#a06a5a', '#1a1a2e', nt));
    c.save(); c.globalAlpha = 0.35 * (1 - nt * 0.7); c.strokeStyle = '#fff0e0'; c.lineWidth = 3; c.beginPath(); for (let x = -2400; x <= 3400; x += 18) { const yy = ridgeY(x, 1080, 330, 0.0021, SEED34 + 1) + 6; x === -2400 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); c.restore();
    hazeW(c, 1130, 260, haze || '#f0d0b8', 0.5 * (1 - nt * 0.7)); });
  par(c, -0.6, px, 0, () => { ridgeW(c, 1190, 200, 0.0033, SEED34 + 2, mix('#7a4a3e', '#141424', nt));
    c.save(); c.globalAlpha = 0.22 * (1 - nt * 0.7); c.strokeStyle = '#2a1410'; c.lineWidth = 2; for (let k = 0; k < 26; k++) { const x0 = -1600 + k * 170; c.beginPath(); c.moveTo(x0, ridgeY(x0, 1190, 200, 0.0033, SEED34 + 2) + 10); c.lineTo(x0 + 40, 1290); c.stroke(); } c.restore();
    hazeW(c, 1240, 160, haze || '#f0d0b8', 0.42 * (1 - nt * 0.7)); }); }
function camp34(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 8) : [0, 0]));
  const px = o.px || 0, nt = o.night || 0;
  sky0(c, skyStops(o.sky || 'day', o.to, o.k || 0));
  if (o.stars) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); stars(c, T, 160, SEED34 + 3, [0, 0, W, 1000], o.stars); c.restore(); }
  if (o.moon) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); moon(c, o.moonX || 800, o.moonY || 330, 42, o.moon); c.restore(); }
  if (o.sunA) bigSun30(c, o.sunX === undefined ? 820 : o.sunX, o.sunY === undefined ? 1000 : o.sunY, 48, o.sunCol || '#ffd08a', o.sunA);
  cloudBank(c, T, 300, 6, o.cloud || '#fff0dc', 0.12 * (1 - nt * 0.8), SEED34 + 4, 6);
  sinai34(c, T, nt, o.haze, px);
  par(c, -0.3, px, 0, () => { // the far ground and the rows of tents, palms between them
    const g = c.createLinearGradient(0, 1236, 0, 1420); g.addColorStop(0, mix('#e0bc94', '#2a2636', nt * 0.8)); g.addColorStop(1, mix('#c09468', '#262230', nt * 0.8)); c.fillStyle = g; c.fillRect(-2600, 1236, 6300, 440);
    for (let i = 0, r = rng(SEED34 + 5); i < 16; i++) { const x = -1300 + i * 260 + r() * 80; palm33(c, x, 1300 + r() * 10, 0.5 + r() * 0.12, T, SEED34 + 6 + i, 0, { night: nt }); }
    camp19(c, T, 1296, { lamp: o.lamp || 0, light: 1 - nt * 0.7, fires: o.fires || 0, skip: o.skip });
    if (nt > 0) { c.fillStyle = `rgba(8,10,26,${0.35 * nt})`; c.fillRect(-2600, 1100, 6300, 500); } });
  par(c, -0.12, px, 0, () => { // nearer mud houses on both sides of the open ground
    const hs = o.houses || [[-260, 1420, 300, 220, 0], [130, 1400, 240, 190, 1], [980, 1410, 280, 210, 2], [1330, 1430, 320, 240, 3]];
    hs.forEach(([x, y, w, h, i]) => { house(c, x, y, w, h, mix(mix('#c49a6a', '#a8805a', (i % 2) * 0.6), '#2a2632', nt * 0.75), { lamp: o.lamp ? o.lamp * (i % 2 ? 1 : 0.7) : 0, t: T + i, doorOpen: o.doorOpen === i });
      if (o.doorOpen === i && o.doorLight) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(255,214,150,${0.85 * o.doorLight})`; c.beginPath(); archPath(c, x - w * 0.18, y, w * 0.2, h * 0.55); c.fill(); glow(c, x - w * 0.18, y - h * 0.25, 160, '#ffd090', 0.5 * o.doorLight); c.restore(); } });
    if (o.onHouses) o.onHouses(c); });
  par(c, 0, px, 0, () => { // the open ground in front
    const earth = mix('#caa274', '#2c2834', nt * 0.8), g = c.createLinearGradient(0, 1380, 0, H + 300); g.addColorStop(0, mix(earth, '#fff0d4', 0.12 * (1 - nt))); g.addColorStop(0.45, earth); g.addColorStop(1, mix(earth, '#140a04', 0.45));
    c.fillStyle = g; c.fillRect(-2600, 1415, 6300, H + 1400);
    const r = rng(SEED34 + 30); for (let i = 0; i < 150; i++) { const q = Math.pow(r(), 1.5), yy = 1430 + q * (H + 200 - 1430), x = -1500 + r() * 4100, sz = 2 + q * 13, cv = r();
      c.fillStyle = hexA(mix(earth, cv > 0.6 ? '#2a1a10' : '#fff0d8', 0.4), 0.5); c.beginPath(); c.ellipse(x, yy, sz, sz * 0.42, 0, 0, 6.283); c.fill(); }
    c.strokeStyle = hexA(mix(earth, '#2a1a0c', 0.5), 0.18); c.lineWidth = 2; for (let k = 0; k < 7; k++) { c.beginPath(); c.moveTo(-1500, 1450 + k * k * 14); c.quadraticCurveTo(540, 1440 + k * k * 14 + 18, 2600, 1452 + k * k * 14); c.stroke(); }
    for (let i = 0, rr = rng(SEED34 + 31); i < 18; i++) { const q = rr(), yy = 1440 + q * 600, x = -1200 + rr() * 3400; if (Math.abs(x - 540) < 380) continue; shrub(c, x, yy, 0.3 + q * 0.7, mix('#7a7a3a', '#1a2020', nt * 0.75), T, i + 5); }
    if (o.torches) o.torches.forEach(([x, y, s], i) => torch(c, x, y, T + i, i, s || 1));
    if (o.props) o.props(c); });
  if (o.light) lightFromAbove(c, T, o.lightX || 540, o.light, o.lightW || 380);
  par(c, 0, px, 0, () => { if (o.walkers) o.walkers(c); });
  if (o.night && o.vignette !== false) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const v = c.createRadialGradient(W / 2, H * 0.58, H * 0.2, W / 2, H * 0.55, H * 0.75); v.addColorStop(0, 'rgba(4,4,12,0)'); v.addColorStop(1, `rgba(4,4,12,${0.55 * nt})`); c.fillStyle = v; c.fillRect(0, 0, W, H); c.restore(); }
  if (o.tint) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = o.tint; c.fillRect(0, 0, W, H); c.restore(); }
  if (o.fg !== false) blurLayer(c, 10, bc => { rock(bc, -60, 2140, 380, 220, mix('#8a6248', '#16141c', nt * 0.85), SEED34 + 40); shrub(bc, 1120, 2120, 3.0, mix('#5a5a2a', '#101418', nt * 0.8), T, 9); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- the pasture (an oasis meadow below the mountains): grass, a stream, palms, cows grazing
function pasture34(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 8) : [0, 0]));
  const px = o.px || 0, nt = o.night || 0, dry = o.dry || 0;
  sky0(c, skyStops(o.sky || 'day', o.to, o.k || 0));
  if (o.sunA) bigSun30(c, o.sunX === undefined ? 820 : o.sunX, o.sunY === undefined ? 1000 : o.sunY, 48, o.sunCol || '#ffd08a', o.sunA);
  cloudBank(c, T, 320, 6, '#fff4e4', 0.16 * (1 - nt), SEED34 + 50, 6);
  sinai34(c, T, nt, o.haze || '#f2e0c8', px);
  par(c, -0.3, px, 0, () => { const g = c.createLinearGradient(0, 1236, 0, 1420); g.addColorStop(0, mix(mix('#b8b480', '#c8aa72', dry), '#1e2420', nt * 0.8)); g.addColorStop(1, mix(mix('#7a8e46', '#a88a58', dry), '#1a2018', nt * 0.8)); c.fillStyle = g; c.fillRect(-2600, 1236, 6300, 440);
    for (let i = 0, r = rng(SEED34 + 51); i < 22; i++) { const x = -1300 + i * 190 + r() * 70; palm33(c, x, 1296 + r() * 14, 0.55 + r() * 0.16, T, SEED34 + 52 + i, 0, { night: nt, lush: 0.3 }); }
    if (o.farHerd) for (let i = 0, r = rng(SEED34 + 75); i < 9; i++) { const x = -300 + i * 190 + r() * 60; cow34(c, x, 1340 + r() * 30, 0.2, T + i, { col: r() > 0.4 ? 'brown' : 'dark', dir: r() > 0.5 ? 1 : -1, head: r() > 0.4 ? 1 : 0, night: nt }); } });
  par(c, 0, px, 0, () => {
    const gr = mix(mix('#86a04a', '#b49a60', dry), '#1a2418', nt * 0.8), g = c.createLinearGradient(0, 1380, 0, H + 300); g.addColorStop(0, mix(gr, '#f8f0c0', 0.12)); g.addColorStop(0.5, gr); g.addColorStop(1, mix(gr, '#0a1006', 0.5));
    c.fillStyle = g; c.fillRect(-2600, 1415, 6300, H + 1400);
    // the stream: a band crossing the meadow, glints
    if (o.stream !== false) { const sy = o.streamY || 1500; c.fillStyle = mix('#6a9ab0', '#1a2440', nt); c.beginPath(); c.moveTo(-2600, sy); for (let x = -2600; x <= 3700; x += 40) c.lineTo(x, sy + Math.sin(x * 0.004) * 16); for (let x = 3700; x >= -2600; x -= 40) c.lineTo(x, sy + 26 + Math.sin(x * 0.004 + 0.4) * 18); c.closePath(); c.fill();
      c.strokeStyle = hexA('#fff8e0', 0.45 * (1 - nt * 0.6)); c.lineWidth = 2; for (let k = 0; k < 40; k++) { const x = -1400 + k * 90 + ((T * 30 + k * 37) % 90); c.beginPath(); c.moveTo(x, sy + 12 + Math.sin(x * 0.004) * 16); c.lineTo(x + 26, sy + 12 + Math.sin(x * 0.004) * 16); c.stroke(); }
      c.fillStyle = hexA('#3a4a20', 0.5); c.fillRect(-2600, sy - 4, 6300, 5); }
    const r = rng(SEED34 + 60); c.lineCap = 'round';
    for (let i = 0; i < 420; i++) { const q = Math.pow(r(), 1.4), yy = 1430 + q * (H + 200 - 1430), x = -1500 + r() * 4100, l = 6 + q * 26, sw = Math.sin(T * 1.6 + x * 0.02) * 3 * q;
      c.strokeStyle = hexA(mix(gr, r() > 0.5 ? '#2a3a10' : '#e8f0a0', 0.4), 0.7); c.lineWidth = 1 + q * 2.5; c.beginPath(); c.moveTo(x, yy); c.quadraticCurveTo(x + 2, yy - l * 0.6, x + sw + 3, yy - l); c.stroke(); }
    for (let i = 0, rr = rng(SEED34 + 61); i < 30; i++) { const q = rr(), yy = 1450 + q * 600, x = -1200 + rr() * 3400; c.fillStyle = hexA(rr() > 0.5 ? '#f8e070' : '#ffffff', 0.7 * (1 - nt)); c.beginPath(); c.arc(x, yy, 2 + q * 4, 0, 6.283); c.fill(); }
    if (o.props) o.props(c); });
  if (o.light) lightFromAbove(c, T, o.lightX || 540, o.light, o.lightW || 380);
  par(c, 0, px, 0, () => { if (o.walkers) o.walkers(c); });
  if (o.vision) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const v = c.createRadialGradient(W / 2, H * 0.5, H * 0.22, W / 2, H * 0.52, H * 0.72); v.addColorStop(0, 'rgba(255,250,235,0)'); v.addColorStop(1, `rgba(255,248,230,${0.6 * o.vision})`); c.fillStyle = v; c.fillRect(0, 0, W, H); c.restore(); }
  if (o.tint) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = o.tint; c.fillRect(0, 0, W, H); c.restore(); }
  if (o.fg !== false) blurLayer(c, 10, bc => { shrub(bc, -30, 2140, 3.4, mix('#4a6a2a', '#101418', nt * 0.8), T, 7); shrub(bc, 1110, 2150, 3.0, mix('#5a7a30', '#101418', nt * 0.8), T, 8); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- the murdered man under a cloak, lying on the ground at night (no wound, no face: only a covered form)
function covered34(c, x, y, s, T, o = {}) { c.save(); c.translate(x, y); c.scale(s * (o.dir || 1), s); const nt = o.night || 0;
  c.fillStyle = 'rgba(6,4,4,0.35)'; c.beginPath(); c.ellipse(0, 2, 170, 12, 0, 0, 6.283); c.fill();
  const col = mix(RICH34.robe, '#0a0a14', nt * 0.5), lt = mix(col, '#ffe0c0', 0.25), dk = mix(col, '#000000', 0.45);
  const g = c.createLinearGradient(0, -70, 0, 0); g.addColorStop(0, lt); g.addColorStop(1, dk); c.fillStyle = g;
  c.beginPath(); c.moveTo(-160, 0); c.quadraticCurveTo(-168, -50, -128, -56); c.quadraticCurveTo(-96, -60, -80, -46); c.quadraticCurveTo(-20, -72, 60, -54); c.quadraticCurveTo(120, -46, 150, -30); c.quadraticCurveTo(170, -12, 160, 0); c.closePath(); c.fill();
  c.strokeStyle = hexA(mix(RICH34.trim, '#000000', nt * 0.4), 0.8); c.lineWidth = 5; c.beginPath(); c.moveTo(-140, -6); c.quadraticCurveTo(0, -10, 150, -6); c.stroke();
  c.fillStyle = mix('#5a3a22', '#141018', nt * 0.5); c.beginPath(); c.ellipse(166, -10, 9, 14, 0.3, 0, 6.283); c.ellipse(158, -4, 9, 12, 0.3, 0, 6.283); c.fill(); // sandals at the feet
  c.strokeStyle = hexA(dk, 0.6); c.lineWidth = 2.5; [-40, 20, 80].forEach(fx => { c.beginPath(); c.moveTo(fx, -58); c.quadraticCurveTo(fx + 10, -30, fx - 4, -4); c.stroke(); });
  c.restore(); }

// ---------- the body on its bier under a linen shroud; rise 0..1 = sits up (Al-Baqara 73: "thus Allah gives life to the dead"). Never a face,
// warm linen (not the white veil of light of a prophet). o.glow = warm light around it.
function risen34(c, x, y, s, T, o = {}) { T += 100; const rise = ease(clamp(o.rise || 0)), nt = o.night || 0;
  c.save(); c.translate(x, y); c.scale(s * (o.dir || 1), s);
  if (o.glow) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, -40, -150, 380, '#ffc060', 0.5 * o.glow * (0.92 + 0.08 * Math.sin(T * 3))); c.restore(); }
  c.fillStyle = 'rgba(10,6,4,0.35)'; c.beginPath(); c.ellipse(0, 4, 210, 15, 0, 0, 6.283); c.fill();
  // the bier: two poles, slats, four short legs
  const wood = mix('#5a3a20', '#1a1418', nt * 0.6), wlt = mix(wood, '#e0b080', 0.25);
  c.fillStyle = wood; [-170, -80, 80, 170].forEach(lx => c.fillRect(lx - 6, -44, 12, 44));
  c.fillStyle = wlt; c.fillRect(-200, -56, 400, 12); c.fillStyle = mix(wood, '#000000', 0.3); c.fillRect(-200, -46, 400, 4);
  c.fillStyle = hexA('#2a1a0c', 0.5); for (let k = 0; k < 9; k++) c.fillRect(-180 + k * 45, -60, 6, 4);
  const lin = mix(mix('#e6d4b0', '#5a5a6a', nt * 0.3), '#ffd9a0', 0.25 * (o.glow || 0)), lsh = mix(lin, '#4a3420', 0.4), llt = mix(lin, '#fff2d8', 0.35);
  // legs part (lying along the bier, feet to the right)
  const lg = c.createLinearGradient(0, -100, 0, -56); lg.addColorStop(0, llt); lg.addColorStop(1, lsh); c.fillStyle = lg;
  c.beginPath(); c.moveTo(-50, -58); c.quadraticCurveTo(-46, -100, 0, -96); c.quadraticCurveTo(90, -86, 150, -84); c.quadraticCurveTo(184, -82, 180, -58); c.closePath(); c.fill();
  c.strokeStyle = hexA(lsh, 0.7); c.lineWidth = 3; c.beginPath(); c.moveTo(168, -86); c.lineTo(168, -58); c.stroke(); // the tie at the feet
  [30, 90].forEach(fx => { c.beginPath(); c.moveTo(fx, -92); c.quadraticCurveTo(fx + 8, -76, fx, -60); c.stroke(); });
  // torso + covered head, pivoting at the hips (-40,-80): lying (pointing left) → sitting (upright)
  c.save(); c.translate(-40, -78); c.rotate(rise * (Math.PI / 2) * 0.8);
  const tg = c.createLinearGradient(0, -40, 0, 40); tg.addColorStop(0, llt); tg.addColorStop(1, lsh); c.fillStyle = tg;
  c.beginPath(); c.moveTo(14, 26); c.quadraticCurveTo(-50, 30, -100, 32); c.quadraticCurveTo(-128, 32, -138, 22); c.quadraticCurveTo(-148, 14, -150, 10); // back
  c.lineTo(-152, -14); c.quadraticCurveTo(-140, -32, -118, -36); c.quadraticCurveTo(-70, -30, -40, -24); c.quadraticCurveTo(0, -26, 14, -14); c.closePath(); c.fill();
  const hg = c.createRadialGradient(-180, -10, 4, -176, -4, 34); hg.addColorStop(0, llt); hg.addColorStop(1, lsh); c.fillStyle = hg;
  c.beginPath(); c.ellipse(-178, -2, 30, 27, 0, 0, 6.283); c.fill(); // the covered head: a plain rounded form, no feature
  c.strokeStyle = hexA(lsh, 0.75); c.lineWidth = 3; c.beginPath(); c.moveTo(-150, -14); c.quadraticCurveTo(-154, 0, -150, 12); c.stroke(); // tie at the neck
  c.strokeStyle = hexA(mix(lsh, '#000000', 0.15), 0.6); c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(-128, -26); c.quadraticCurveTo(-80, -40, -30, -30); c.stroke(); // the wrapped arm along the front
  c.strokeStyle = hexA(lsh, 0.55); c.lineWidth = 2.5; c.beginPath(); c.moveTo(-96, 30); c.quadraticCurveTo(-90, 0, -100, -30); c.moveTo(-50, 28); c.quadraticCurveTo(-44, 0, -52, -26); c.moveTo(-196, -16); c.quadraticCurveTo(-186, -4, -192, 14); c.stroke();
  c.restore();
  c.restore(); }
// a small cloth-wrapped piece held in a hand (the "part of it", Al-Baqara 73): never flesh, never blood
function bundle34(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); const g = c.createRadialGradient(-4, -4, 2, 0, 0, 18); g.addColorStop(0, '#efe2c4'); g.addColorStop(1, '#a8916a'); c.fillStyle = g; c.beginPath(); c.ellipse(0, 2, 17, 12, -0.3, 0, 6.283); c.fill();
  c.fillStyle = '#c8b48a'; c.beginPath(); c.moveTo(-4, -8); c.quadraticCurveTo(-12, -22, -2, -20); c.quadraticCurveTo(4, -16, 2, -8); c.moveTo(2, -8); c.quadraticCurveTo(12, -22, 14, -12); c.quadraticCurveTo(10, -8, 4, -6); c.fill(); // the knot
  c.strokeStyle = 'rgba(90,64,30,0.5)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-10, 4); c.quadraticCurveTo(0, 8, 12, 0); c.stroke(); c.restore(); }

// ---------- the plough (a brown ox under the yoke drawing a wooden ard, the ploughman behind) and the irrigation well (an ox walking away
// from the well, the rope over the pulley lifting the leather bucket): what the cow had NEVER done (Al-Baqara 71)
function plough34(c, x, y, s, T, dist, o = {}) { const sx = x + dist; cow34(c, sx, y, s, T, { col: 'brown', yoke: true, dist, dir: 1 });
  const yx = sx + 124 * s, yy = y - 206 * s, ax = sx - 230 * s, ay = y; // beam from the yoke back down to the ard
  c.strokeStyle = '#4a2e18'; c.lineWidth = 9 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(yx, yy); c.quadraticCurveTo(sx - 60 * s, y - 120 * s, ax, ay - 30 * s); c.stroke();
  c.strokeStyle = '#5a3a20'; c.lineWidth = 11 * s; c.beginPath(); c.moveTo(ax + 40 * s, ay + 6 * s); c.lineTo(ax - 30 * s, ay - 20 * s); c.lineTo(ax - 70 * s, ay - 140 * s); c.stroke(); // share + handle
  c.fillStyle = hexA('#3a2414', 0.5); c.fillRect(x - 900 * s, y + 4 * s, dist + 900 * s - 230 * s + 40 * s, 6 * s); // the furrow behind
  fig(c, o.who || ISR34[3], { x: ax - 120 * s, y: y + 6 * s, h: 360 * s, dir: 1, t: T, light: 0.9, wind: 0.3, ink: 0.6, reach: 0.55, walk: stepOf(dist, 360 * s) }); }
function irrigWell34(c, x, y, s, T, dist, o = {}) { // the well at x, the ox walks right (away), the bucket rises
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(0, 4, 110, 16, 0, 0, 6.283); c.fill();
  const g = c.createLinearGradient(-90, 0, 90, 0); g.addColorStop(0, '#d8c0a0'); g.addColorStop(1, '#6a5038'); c.fillStyle = g; c.beginPath(); c.moveTo(-90, -70); c.lineTo(-90, 0); c.quadraticCurveTo(0, 18, 90, 0); c.lineTo(90, -70); c.quadraticCurveTo(0, -54, -90, -70); c.fill();
  c.fillStyle = '#e8d6b8'; c.beginPath(); c.ellipse(0, -70, 90, 18, 0, 0, 6.283); c.fill(); c.fillStyle = '#140c08'; c.beginPath(); c.ellipse(0, -70, 70, 12, 0, 0, 6.283); c.fill();
  c.strokeStyle = '#4a3020'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(-70, -76); c.lineTo(-60, -300); c.moveTo(70, -76); c.lineTo(60, -300); c.stroke(); c.lineWidth = 10; c.beginPath(); c.moveTo(-74, -296); c.lineTo(74, -296); c.stroke();
  c.fillStyle = '#6a4a2a'; c.beginPath(); c.arc(40, -296, 18, 0, 6.283); c.fill(); c.fillStyle = '#3a2414'; c.beginPath(); c.arc(40, -296, 6, 0, 6.283); c.fill(); // pulley
  const lift = clamp(dist / 260), by = lerp(-60, -260, lift); // the bucket comes up
  c.strokeStyle = '#8a6a3a'; c.lineWidth = 4; c.beginPath(); c.moveTo(22, -296); c.lineTo(22, by - 20); c.stroke();
  if (lift > 0.05) { c.fillStyle = '#5a3418'; c.beginPath(); c.moveTo(4, by - 20); c.lineTo(40, by - 20); c.lineTo(34, by + 16); c.lineTo(10, by + 16); c.closePath(); c.fill();
    if (lift > 0.9) { c.fillStyle = hexA('#9ac8e0', 0.8); c.fillRect(10, by + 16, 6, 60); } }
  c.restore();
  const ox = x + 200 * s + dist; cow34(c, ox, y + 30 * s, s, T, { col: 'brown', yoke: true, dist, dir: 1 });
  c.strokeStyle = '#8a6a3a'; c.lineWidth = 4 * s; c.beginPath(); c.moveTo(x + 58 * s, y - 296 * s); c.quadraticCurveTo((x + ox) / 2, y - 220 * s, ox + 110 * s, y - 180 * s); c.stroke();
  c.fillStyle = mix('#6a9ab0', '#2a3a50', 0.2); c.fillRect(x - 600 * s, y + 40 * s, 520 * s, 14 * s); // the channel toward the field
  if (o.who !== false) fig(c, ISR34[2], { x: ox + 330 * s, y: y + 50 * s, h: 340 * s, dir: -1, t: T, light: 0.9, wind: 0.3, ink: 0.6, staff: true }); }
// a dim "vision" frame for the two things the cow never did: desaturated, soft, then struck out by a gentle fade
function visionFx34(c, k) { if (k <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(232,222,204,${0.32 * k})`; c.fillRect(0, 0, W, H);
  const v = c.createRadialGradient(W / 2, H * 0.55, H * 0.2, W / 2, H * 0.55, H * 0.7); v.addColorStop(0, 'rgba(250,244,230,0)'); v.addColorStop(1, `rgba(250,244,230,${0.7 * k})`); c.fillStyle = v; c.fillRect(0, 0, W, H); c.restore(); }
// a big "no" sign over a vision (a red-ochre circle and bar, drawn stroke by stroke)
function noSign34(c, x, y, r, k) { if (k <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.strokeStyle = `rgba(190,60,40,${0.85 * Math.min(1, k * 1.5)})`; c.lineWidth = 18; c.lineCap = 'round';
  c.beginPath(); c.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + 6.283 * clamp(k * 1.6)); c.stroke();
  const b = clamp(k * 1.6 - 0.8) / 0.8 * 1.0; if (b > 0) { c.beginPath(); c.moveTo(x - r * 0.7, y - r * 0.7); c.lineTo(x - r * 0.7 + r * 1.4 * clamp(b), y - r * 0.7 + r * 1.4 * clamp(b)); c.stroke(); } c.restore(); }

// ---------- people: a crowd standing on the flat ground (perspective height hY34), facing a point; o.fn(p, i) can override gestures
const CROWD34 = (() => { const r = rng(SEED34 + 80), L = [];
  [[1470, 8, 190], [1520, 8, 210], [1580, 7, 240], [1650, 6, 270]].forEach(([y, n, gap], row) => { for (let i = 0; i < n; i++) { const x = 540 + (i - (n - 1) / 2) * gap + (r() - 0.5) * 60;
    L.push({ x, y: y + (r() - 0.5) * 18, f: (i * 3 + row) % ISR34.length, ph: r() * 10, row }); } });
  return L.sort((a, b) => a.y - b.y); })();
function crowd34(c, T, o = {}) { const list = o.list || CROWD34; list.forEach((p, i) => { if (o.skip && o.skip(p)) return;
  const h = hY34(p.y), dir = o.face !== undefined ? (p.x < o.face ? 1 : -1) : (o.dir || 1);
  const base = { x: p.x, y: p.y, h, dir, t: T + p.ph, light: o.light === undefined ? 0.85 : o.light, wind: 0.25, ink: 0.65 };
  const extra = o.fn ? o.fn(p, i, base) : {}; if (extra === null) return; fig(c, ISR34[p.f], Object.assign(base, extra)); }); }

// ---------- the hero shot (hook, cta, outro, cover): night in the camp, torches; the shrouded man sits up on his bier in a warm light; the crowd
// recoils; Moussa (white, veil of light) on the right; the nephew (dark red) on the left, singled out.
const HERO34 = { sky: 'night', stars: 0.7, moon: 0.6, moonX: 820, moonY: 560, night: 1, lamp: 0.9, fires: 0.6, z: 1.5, cx: 540, cy: 1500, haze: '#3a3a5a' };
const HERO_TORCH34 = [[205, 1560, 0.9], [905, 1560, 0.9]];
function heroCrowd34(T, o = {}) { const rise = o.rise === undefined ? 1 : o.rise, turn = o.turn === undefined ? 1 : o.turn; return c => {
  [[250, 1490, 0], [345, 1470, 1], [440, 1500, 3], [640, 1495, 2], [735, 1472, 4], [835, 1500, 5]].forEach(([x, y, f], j) => {
    fig(c, ISR34[f], { x, y, h: hY34(y), dir: turnDir(turn, 0.1 + j * 0.06, x < 540 ? 1 : -1, -1, 0.3), t: T + j, light: 0.85, wind: 0.25, ink: 0.65, armUp: 0.35 * rise * (j % 2), reach: j % 2 ? 0 : 0.5 * rise * turn }); });
  risen34(c, 520, 1650, 1.1, T, { rise, glow: 0.4 + 0.6 * rise, night: 1 });
  if (rise > 0.3) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 260, 1560, 220, '#ffcf7a', 0.22 * turn * rise); c.restore(); }
  fig(c, NEPHEW34, { x: 255, y: 1730, h: hY34(1730) * 0.92, dir: 1, t: T + 3, light: 0.9 + 0.3 * turn * rise, wind: 0.3, ink: 0.7, armUp: 0.6 * turn * rise });
  fig(c, MUSA34, { x: 868, y: 1735, h: hY34(1735) * 0.92, dir: -1, t: T + 5, light: 1.05, wind: 0.4, staff: true, veilGlow: 0.3 }); }; }
const hero34 = (c, T, o = {}) => camp34(c, T, Object.assign({}, HERO34, { torches: HERO_TORCH34, walkers: heroCrowd34(T, o) }, o));
function heroTexts34(c, a) { if (a <= 0) return; topShade(c, 1.3 * a); seriesTag34(c, a); bigWord27(c, 'UN MORT', 250, a, 120); bigWord27(c, 'S\'EST RELEVÉ', 365, a, 96, '#f6c453'); }

// ---------- episode 34 scenes
const DAY34 = { sky: 'day', to: 'gold', k: 0.3, sunA: 0.7, sunX: 860, sunY: 1000 };
const DUSK34 = { sky: 'dusk', to: 'gold', k: 0.35, sunA: 0.75, sunX: 240, sunY: 1120, lamp: 0.5, haze: '#e8b8a0' };
const NIGHT34 = { sky: 'night', stars: 0.8, moon: 0.7, moonX: 820, moonY: 420, night: 1, lamp: 0.8, fires: 0.5, haze: '#3a3a5a' };
const MORN34 = { sky: 'dawn', to: 'gold', k: 0.4, sunA: 0.8, sunX: 860, sunY: 1080, haze: '#f0d0b8' };
// the assembly: people on the left, facing Moussa on the right
const ASM34 = (() => { const r = rng(SEED34 + 90), L = []; [[1490, 6, 110], [1545, 5, 130], [1610, 5, 150], [1690, 4, 175]].forEach(([y, n, gap], row) => {
  for (let i = 0; i < n; i++) L.push({ x: 120 + i * gap + row * 22 + (r() - 0.5) * 30, y: y + (r() - 0.5) * 16, f: (i * 3 + row * 2) % ISR34.length, ph: r() * 10, row }); });
  return L.sort((a, b) => a.y - b.y); })();
const MX34 = 860, MY34 = 1650;
function musaAt34(c, T, o = {}) { fig(c, MUSA34, Object.assign({ x: MX34, y: MY34, h: hY34(MY34), dir: -1, t: T + 7, light: 1.05, wind: 0.45, staff: !(o.armUp || o.reach || o.dua), veilGlow: 0.3 }, o)); }
function assembly34(T, o = {}) { return c => {
  crowd34(c, T, { list: ASM34, dir: 1, light: o.light, fn: (p, i) => o.fn ? o.fn(p, i) : {} });
  if (o.musa !== false) musaAt34(c, T, o.m || {}); }; }
// two clans facing each other over the covered body (morning)
const CLAN_A34 = [[170, 1560, 0], [280, 1610, 2], [140, 1680, 4], [300, 1720, 6]], CLAN_B34 = [[800, 1560, 1], [700, 1600, 3], [880, 1660, 5], [760, 1730, 7]];
function clans34(T, k, shout = 0) { return c => {
  covered34(c, 520, 1640, 0.75, T, {});
  CLAN_A34.forEach(([x, y, f], j) => fig(c, ISR34[f], { x, y, h: hY34(y), dir: 1, t: T + j, light: 0.95, wind: 0.35, ink: 0.7, armUp: (j % 2 ? 0.7 : 0.35) * k * (0.85 + 0.15 * Math.sin(T * 3 + j)), reach: j % 2 ? 0 : 0.6 * k }));
  CLAN_B34.forEach(([x, y, f], j) => fig(c, ISR34[f], { x, y, h: hY34(y), dir: -1, t: T + j + 4, light: 0.95, wind: 0.35, ink: 0.7, armUp: (j % 2 ? 0.35 : 0.7) * k * (0.85 + 0.15 * Math.sin(T * 3.3 + j)), reach: j % 2 ? 0.6 * k : 0 }));
  if (shout > 0) { whisper33(c, 300, 1610 - hY34(1610) * 0.9, 1.6, T, 1, shout); whisper33(c, 700, 1600 - hY34(1600) * 0.9, 1.6, T + 0.5, -1, shout); } }; }
// three cows side by side: the calf, the old cow, the one "between the two" (Al-Baqara 68); lit = which is highlighted
function threeCows34(T, o = {}) { return c => {
  const dimC = o.dimCalf || 0, dimO = o.dimOld || 0, mid = o.mid || 0, yel = o.yellow || 0;
  cow34(c, 270, 1640, 0.72, T, { calf: true, col: 'brown', dim: 0.55 * dimC, head: 0.3 });
  cow34(c, 820, 1660, 0.74, T + 2, { col: 'old', dir: -1, dim: 0.55 * dimO });
  cow34(c, 520, 1760, 0.9, T + 1, { col: 'brown', glow: mid, halter: false });
  if (yel > 0) { c.save(); c.globalAlpha *= yel; cow34(c, 520, 1760, 0.9, T + 1, { col: 'yellow', glow: mid }); c.restore(); } }; }
const HERD34 = [[-120, 1520, 0.42, 1, 'brown', 1], [120, 1560, 0.48, -1, 'dark', 0], [380, 1510, 0.4, 1, 'brown', 1], [640, 1545, 0.46, -1, 'brown', 0], [930, 1520, 0.42, -1, 'dark', 1], [1180, 1560, 0.48, 1, 'brown', 0],
  [20, 1640, 0.6, 1, 'dark', 1], [300, 1680, 0.66, -1, 'brown', 0], [780, 1660, 0.62, 1, 'brown', 1], [1060, 1690, 0.68, -1, 'dark', 0]];
function herd34(T, o = {}) { return c => HERD34.forEach(([x, y, s, d, col, hd], i) => cow34(c, x, y, s, T + i, { col, dir: d, head: hd, glow: o.pick === i ? o.k || 0 : 0 })); }


// =====================================================================================================================
// ---------- episode 35: the People of the Trench (Al-Buruj 4-10; Sahih Muslim 3005, hadith of Suhayb) · « Histoires du Coran »
// The boy, the king, the old magician, the monk, the blind courtier, the soldiers, the mother and the people are ordinary people,
// faceless (the boy in sky blue, never white). Allah is never depicted (light only). The Prophet ﷺ is only named, never shown.
// No violence is shown: the soldiers' fall is a dust cloud, the boat heels over into a white flash, the arrow leaves the bow and
// the picture cuts to light; the trench is a glow seen from afar, no one is ever shown in the fire. The baby's words = light.
// Najran (Yemen) as the place = according to the exegetes; the hadith itself names no city.
function seriesTag35(c, a) { textGlow(c, 'HISTOIRES DU CORAN  ·  ÉPISODE 35', W / 2, 112, '600 32px Lora', '#fbe7c6', a * 0.92, '#000000', 12); }
function ctaText35(c, a) { ctaText29(c, a); }
const SEED35 = 3500, GY35 = 1300;
const hY35 = y => Math.max(60, (y - GY35) * 0.95); // figure height by depth on the flat plain
const NAJ35 = [
  { robe: '#2e3e6a', wrap: '#e8dcc4', skin: '#a8714f', trim: '#c9a35a', band: '#c9a35a', inner: '#e2d8c0' },
  { robe: '#7a4a24', wrap: '#ece2cc', skin: '#9a6a4c', trim: '#3a2210', band: '#3a2210', inner: '#e0d6c0' },
  { robe: '#5a2a2a', wrap: '#dccfb2', skin: '#b07a58', trim: '#d8b070', band: '#d8b070', inner: '#d8ccb0' },
  { robe: '#3e5a46', wrap: '#e6dcc8', skin: '#94664a', trim: '#b8a070', band: '#b8a070', inner: '#ddd4c0' },
  { robe: '#6a5a3a', wrap: '#efe6d2', skin: '#a8714f', trim: '#4a3018', band: '#4a3018', inner: '#e6dcc6' },
  { robe: '#2a4a5e', wrap: '#d8ccb4', skin: '#8f5f42', trim: '#a89070', band: '#a89070', inner: '#cfc4aa' },
  { robe: '#8a5a3a', wrap: '#e8e0cc', skin: '#b07a58', trim: '#5a3a20', band: '#5a3a20', inner: '#ddd2ba' },
  { robe: '#4a3a4e', wrap: '#e4dccc', skin: '#9a6a4c', trim: '#c8b48a', band: '#c8b48a', inner: '#e0d8c6' }];
const BOY35 = { robe: '#3f7090', wrap: '#e6dabe', skin: '#a8714f', trim: '#e2c27a', band: '#e2c27a', inner: '#e4dac4', child: true };
const KING35 = { robe: '#7a1622', wrap: '#d8b878', skin: '#a8714f', trim: '#e0b85a', band: '#e0b85a', inner: '#c8a070' };
const MAGE35 = { robe: '#2c2236', wrap: '#4c3c50', skin: '#8f5f42', trim: '#9a7a4a', band: '#9a7a4a', inner: '#5a4a5c', agal: false };
const MONK35 = { robe: '#5a4430', wrap: '#5e4a36', skin: '#a07050', trim: '#3a2a1a', band: '#3a2a1a', inner: '#8a7660', agal: false };
const COURT35 = { robe: '#1e4a4c', wrap: '#ece2cc', skin: '#a8714f', trim: '#d8b45a', band: '#d8b45a', inner: '#e4dac4' };
const MOTHER35 = { robe: '#5a2a3a', wrap: '#3a2632', skin: '#a8714f', trim: '#c9a35a', band: '#c9a35a', inner: '#7a5a5e', covered: true, agal: false };
const SOLD35 = [
  { robe: '#4a3a2a', wrap: '#6a4a30', skin: '#9a6a4c', trim: '#a8843a', band: '#7a2a22', inner: '#8a7a60' },
  { robe: '#3a3430', wrap: '#7a3a2a', skin: '#a8714f', trim: '#8a8478', band: '#5a2a1a', inner: '#7a7060' },
  { robe: '#5a3422', wrap: '#4a4038', skin: '#94664a', trim: '#b8944a', band: '#3a2a1a', inner: '#8a7660' },
  { robe: '#2e3434', wrap: '#6a4a30', skin: '#b07a58', trim: '#8a7a5a', band: '#8a2a22', inner: '#7a7464' }];
function sold35(c, i, o) { fig(c, SOLD35[((i % 4) + 4) % 4], o); if (!o.noSpear && (o.pose || 'stand') === 'stand' && !o.armUp && !o.reach) spearOf(c, o); }
function king35(c, o) { fig(c, KING35, o); const [hx, hy, r] = headOf(o); crown(c, hx + (o.dir || 1) * r * 0.08, hy - r * 0.55, r * 1.05, 1); }
const DUSK35 = { sky: 'dusk', to: 'gold', k: 0.45, sunA: 0.6, sunX: 780, sunY: 1150, lamp: 0.4, haze: '#f0b0a0' };
const DAY35 = { sky: 'day', to: 'gold', k: 0.3, sunA: 0.6, sunX: 860, sunY: 980, haze: '#f0dcc4' };
const NIGHT35 = { sky: 'night', stars: 0.8, moon: 0.6, moonX: 840, moonY: 420, night: 1, lamp: 0.8, haze: '#2a2a48' };
const DAWN35 = { sky: 'dawn', to: 'gold', k: 0.35, sunA: 0.7, sunX: 300, sunY: 1120, haze: '#f0d0b8' };

// ---------- Najran (according to the exegetes): Yemeni ranges, a tell of tower houses, palms, the open plain in front (the « one plain » of the hadith)
const tellY35 = x => 1300 - 70 * Math.exp(-Math.pow((x - 300) / 520, 2));
function najranCity35(c, T, nt, lamp) {
  const g = c.createLinearGradient(0, 1220, 0, 1440); g.addColorStop(0, mix('#c8a078', '#2a2636', nt * 0.8)); g.addColorStop(1, mix('#b08a62', '#24202e', nt * 0.8)); c.fillStyle = g;
  c.beginPath(); c.moveTo(-2600, 1700); for (let x = -2600; x <= 3700; x += 20) c.lineTo(x, tellY35(x)); c.lineTo(3700, 1700); c.closePath(); c.fill();
  const r = rng(SEED35 + 5), L = [];
  for (let i = 0; i < 22; i++) { const x = -900 + i * 150 + r() * 60, near = Math.exp(-Math.pow((x - 300) / 600, 2)), h = 60 + near * 100 + r() * 60, w = 70 + r() * 40, col = mix('#9a6040', '#c08a5a', r()), sd = SEED35 + 6 + i, lw = r(), lw2 = r(); L.push({ x, h, w, col, sd, lw, lw2 }); }
  L.forEach(p => { towerHouse(c, p.x, tellY35(p.x) + 6, p.w, p.h, mix(p.col, '#22202c', nt * 0.75), p.sd, T);
    if (lamp > 0 && p.lw > 0.35) { c.save(); c.globalCompositeOperation = 'lighter'; const wy = tellY35(p.x) - p.h * (0.35 + 0.4 * p.lw2); glow(c, p.x + p.w * 0.1, wy, 26, '#ffc070', 0.55 * lamp); c.fillStyle = `rgba(255,210,140,${0.8 * lamp})`; c.fillRect(p.x + p.w * 0.1 - 4, wy - 6, 8, 12); c.restore(); } });
  if (nt > 0) { c.fillStyle = `rgba(8,10,26,${0.32 * nt})`; c.fillRect(-2600, 900, 6300, 800); }
}
function najran35(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 8) : [0, 0]));
  const px = o.px || 0, nt = o.night || 0, hz = mix(o.haze || '#f0c8a8', '#22243c', nt * 0.6);
  sky0(c, skyStops(o.sky || 'gold', o.to, o.k || 0));
  if (o.stars) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); stars(c, T, 160, SEED35 + 3, [0, 0, W, 1000], o.stars); c.restore(); }
  if (o.moon) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); moon(c, o.moonX || 820, o.moonY || 400, 42, o.moon); c.restore(); }
  if (o.sunA) bigSun30(c, o.sunX === undefined ? 820 : o.sunX, o.sunY === undefined ? 1000 : o.sunY, 46, o.sunCol || '#ffd08a', o.sunA);
  cloudBank(c, T, 300, 6, mix('#ffe6cc', '#22243c', nt), 0.13 * (1 - nt * 0.7), SEED35 + 4, 6);
  par(c, -0.85, px, 0, () => { ridgeW(c, 1060, 300, 0.0019, SEED35 + 1, mix('#8a7a9a', '#141628', nt));
    c.save(); c.globalAlpha = 0.3 * (1 - nt * 0.7); c.strokeStyle = '#fff0e0'; c.lineWidth = 3; c.beginPath(); for (let x = -2400; x <= 3400; x += 18) { const yy = ridgeY(x, 1060, 300, 0.0019, SEED35 + 1) + 5; x === -2400 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); c.restore();
    hazeW(c, 1110, 280, hz, 0.5 * (1 - nt * 0.6)); });
  par(c, -0.6, px, 0, () => { ridgeW(c, 1175, 170, 0.003, SEED35 + 2, mix('#86705a', '#161422', nt));
    c.strokeStyle = hexA(mix('#4a3a24', '#0a0a14', nt), 0.3); c.lineWidth = 2; for (let k = 0; k < 8; k++) { c.beginPath(); for (let x = -2400; x <= 3400; x += 24) { const yy = ridgeY(x, 1175, 170, 0.003, SEED35 + 2) + 16 + k * 18; x === -2400 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); } // terraced slopes
    hazeW(c, 1235, 160, hz, 0.42 * (1 - nt * 0.6)); });
  par(c, -0.35, px, 0, () => { najranCity35(c, T, nt, o.lamp || 0);
    for (let i = 0, r = rng(SEED35 + 40); i < 18; i++) { const x = -1300 + i * 250 + r() * 90; palm33(c, x, 1316 + r() * 10, 0.55 + r() * 0.14, T, SEED35 + 41 + i, 0, { night: nt }); }
    hazeW(c, 1330, 80, hz, 0.25 * (1 - nt * 0.6)); });
  par(c, 0, px, 0, () => { // the open plain
    const earth = mix('#c9a272', '#2a2634', nt * 0.82), g = c.createLinearGradient(0, 1320, 0, H + 300); g.addColorStop(0, mix(earth, '#fff0d4', 0.14 * (1 - nt))); g.addColorStop(0.4, earth); g.addColorStop(1, mix(earth, '#140a04', 0.5));
    c.fillStyle = g; c.fillRect(-2600, 1322, 6300, H + 1400);
    c.fillStyle = hexA(mix(earth, '#4a3420', 0.5), 0.5); c.fillRect(-2600, 1320, 6300, 4);
    const r = rng(SEED35 + 30); for (let i = 0; i < 170; i++) { const q = Math.pow(r(), 1.5), yy = 1340 + q * (H + 200 - 1340), x = -1500 + r() * 4100, sz = 2 + q * 13, cv = r();
      c.fillStyle = hexA(mix(earth, cv > 0.6 ? '#2a1a10' : '#fff0d8', 0.4), 0.5); c.beginPath(); c.ellipse(x, yy, sz, sz * 0.42, 0, 0, 6.283); c.fill(); }
    c.strokeStyle = hexA(mix(earth, '#2a1a0c', 0.5), 0.16); c.lineWidth = 2; for (let k = 0; k < 7; k++) { c.beginPath(); c.moveTo(-1500, 1360 + k * k * 15); c.quadraticCurveTo(540, 1350 + k * k * 15 + 18, 2600, 1362 + k * k * 15); c.stroke(); }
    for (let i = 0, rr = rng(SEED35 + 31); i < 16; i++) { const q = rr(), yy = 1360 + q * 640, x = -1200 + rr() * 3400; if (Math.abs(x - 540) < 420) continue; shrub(c, x, yy, 0.3 + q * 0.7, mix('#7a7a3a', '#1a2020', nt * 0.75), T, i + 5); }
    if (o.torches) o.torches.forEach(([x, y, s], i) => torch(c, x, y, T + i, i, s || 1));
    if (o.props) o.props(c); });
  if (o.light) lightFromAbove(c, T, o.lightX || 540, o.light, o.lightW || 380);
  par(c, 0, px, 0, () => { if (o.walkers) o.walkers(c); });
  if (o.post) o.post(c);
  if (nt && o.vignette !== false) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const v = c.createRadialGradient(W / 2, H * 0.58, H * 0.2, W / 2, H * 0.55, H * 0.75); v.addColorStop(0, 'rgba(4,4,12,0)'); v.addColorStop(1, `rgba(4,4,12,${0.55 * nt})`); c.fillStyle = v; c.fillRect(0, 0, W, H); c.restore(); }
  if (o.tint) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = o.tint; c.fillRect(0, 0, W, H); c.restore(); }
  if (o.fg !== false) blurLayer(c, 10, bc => { rock(bc, -80, 2150, 380, 210, mix('#8a6248', '#16141c', nt * 0.85), SEED35 + 45); shrub(bc, 1130, 2130, 3.0, mix('#5a5a2a', '#101418', nt * 0.8), T, 9); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- the palm trunk (al-jidh', the hadith): a bare trunk standing as a post; ring scars, cut top. Origin = foot. ~520*s tall
function trunk35(c, x, y, s, T, o = {}) { c.save(); c.translate(x, y); c.scale(s, s); const nt = o.night || 0;
  c.fillStyle = 'rgba(10,6,4,0.32)'; c.beginPath(); c.ellipse(4, 2, 70, 10, 0, 0, 6.283); c.fill();
  const col = mix('#7a5a3a', '#1c1a22', nt * 0.7), g = c.createLinearGradient(-26, 0, 26, 0); g.addColorStop(0, mix(col, '#000000', 0.35)); g.addColorStop(0.4, mix(col, '#ffe0b0', 0.18)); g.addColorStop(1, mix(col, '#000000', 0.5));
  c.fillStyle = g; c.beginPath(); c.moveTo(-28, 0); c.quadraticCurveTo(-30, -60, -24, -110); c.lineTo(-19, -520); c.lineTo(19, -520); c.lineTo(24, -110); c.quadraticCurveTo(30, -60, 28, 0); c.closePath(); c.fill();
  c.strokeStyle = hexA(mix(col, '#000000', 0.55), 0.6); c.lineWidth = 3; for (let k = 0; k < 19; k++) { const yy = -14 - k * 27, w = lerp(27, 19, k / 19); c.beginPath(); c.moveTo(-w, yy); c.quadraticCurveTo(0, yy + 9, w, yy - 3); c.stroke(); }
  c.strokeStyle = hexA(mix(col, '#fff0d0', 0.4), 0.35); c.lineWidth = 2; for (let k = 0; k < 19; k++) { const yy = -20 - k * 27, w = lerp(25, 17, k / 19); c.beginPath(); c.moveTo(-w * 0.6, yy + 2); c.quadraticCurveTo(-w * 0.1, yy + 7, w * 0.3, yy + 3); c.stroke(); }
  c.fillStyle = mix(col, '#e8c89a', 0.35); c.beginPath(); c.ellipse(0, -520, 19, 6, 0, 0, 6.283); c.fill();
  c.restore(); }
// the rope around the boy and the trunk (two loops, at the chest and the knees)
function tied35(c, o, k = 1) { if (k <= 0) return; const s = o.h / 300 * 0.82; c.save(); c.globalAlpha *= k; c.strokeStyle = '#a8865a'; c.lineCap = 'round';
  [[-196, 1], [-92, 0.9]].forEach(([yy, wk]) => { const y = o.y + yy * s; c.lineWidth = 6 * s; c.beginPath(); c.moveTo(o.x - 46 * s, y + 4 * s); c.quadraticCurveTo(o.x, y + 16 * s, o.x + 50 * s * wk, y + 2 * s); c.stroke();
    c.strokeStyle = 'rgba(60,40,20,0.5)'; c.lineWidth = 2 * s; c.beginPath(); c.moveTo(o.x - 44 * s, y + 8 * s); c.quadraticCurveTo(o.x, y + 19 * s, o.x + 48 * s * wk, y + 6 * s); c.stroke(); c.strokeStyle = '#a8865a'; });
  c.restore(); }
// the boy tied to the trunk (the hero shot): trunk, boy in front of it, the rope; o.light = soft column of light
function boyAtTrunk35(c, x, y, s, T, o = {}) {
  if (o.light) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y - 260 * s, 380 * s, '#fff0c8', 0.35 * o.light); c.restore(); }
  trunk35(c, x, y, s, T, o);
  const b = { x, y: y + 2, h: 300 * s * 1.05, dir: o.dir || 1, t: T + 2, light: 0.95 + 0.25 * (o.light || 0), wind: 0.35, ink: 0.7 };
  fig(c, BOY35, b); tied35(c, b, o.rope === undefined ? 1 : o.rope); }

// ---------- the bow: held in the near hand of a figure (o: same object as for fig/handOf, with reach); draw 0..1 = string pulled; arrow = nocked
function bow35(c, o, draw = 0, arrow = true) { const s = (o.h || 300) / 300, d = o.dir || 1, [hx, hy] = handOf(o);
  c.save(); c.translate(hx, hy - 4 * s); c.scale(d * s, s);
  const bend = 34 + draw * 22, nx = -14 - draw * 96;
  c.strokeStyle = '#4a2a14'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(-6, -150); c.quadraticCurveTo(bend, -70, 4, 0); c.quadraticCurveTo(bend, 70, -6, 150); c.stroke();
  c.strokeStyle = '#8a5a2a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-4, -146); c.quadraticCurveTo(bend - 4, -70, 2, -8); c.stroke();
  c.fillStyle = '#c8a060'; c.fillRect(-4, -12, 12, 24); // grip
  c.strokeStyle = 'rgba(240,230,210,0.85)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-6, -150); c.lineTo(nx, 0); c.lineTo(-6, 150); c.stroke();
  if (arrow) { c.strokeStyle = '#6a4a2a'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(nx, 0); c.lineTo(58, 0); c.stroke();
    c.fillStyle = '#b8b4a8'; c.beginPath(); c.moveTo(72, 0); c.lineTo(56, -6); c.lineTo(56, 6); c.closePath(); c.fill();
    c.fillStyle = '#d8c8a8'; c.beginPath(); c.moveTo(nx + 2, 0); c.lineTo(nx + 22, -8); c.lineTo(nx + 30, 0); c.lineTo(nx + 22, 8); c.closePath(); c.fill(); }
  if (draw > 0.05) { hand(c, nx + 4, 6, 1.4, o.skin || KING35.skin, 0.9); } // the drawing hand at the nock
  c.restore(); }
// the arrow in flight: a thin shaft with a bright trail (it never reaches anyone on screen)
function arrowFly35(c, x0, y0, x1, y1, q, s = 1) { if (q <= 0 || q >= 1) return; const x = lerp(x0, x1, q), y = lerp(y0, y1, q), ang = Math.atan2(y1 - y0, x1 - x0);
  c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(x0 + (x - x0) * 0.4, y0 + (y - y0) * 0.4, x, y); g.addColorStop(0, 'rgba(255,240,210,0)'); g.addColorStop(1, 'rgba(255,240,210,0.7)');
  c.strokeStyle = g; c.lineWidth = 5 * s; c.beginPath(); c.moveTo(x0 + (x - x0) * 0.4, y0 + (y - y0) * 0.4); c.lineTo(x, y); c.stroke(); c.restore();
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s); c.strokeStyle = '#4a2e18'; c.lineWidth = 4; c.beginPath(); c.moveTo(-110, 0); c.lineTo(0, 0); c.stroke();
  c.fillStyle = '#c8c4b8'; c.beginPath(); c.moveTo(16, 0); c.lineTo(-2, -7); c.lineTo(-2, 7); c.closePath(); c.fill(); c.fillStyle = '#e0d0b0'; c.beginPath(); c.moveTo(-110, 0); c.lineTo(-88, -9); c.lineTo(-80, 0); c.lineTo(-88, 9); c.closePath(); c.fill(); c.restore(); }
// the boy's quiver (« take an arrow from my quiver »): leather tube with strap and fletchings; pull 0..1 = one arrow drawn out by a hand
function quiver35(c, x, y, s, T, pull = 0) { c.save(); c.translate(x, y); c.rotate(-0.18); c.scale(s, s);
  const arrows = [[-26, -8], [-10, 4], [8, -4], [24, 6]];
  arrows.forEach(([ax, ay], i) => { const up = i === 2 ? pull * 260 : 0; c.strokeStyle = '#6a4a2a'; c.lineWidth = 6; c.beginPath(); c.moveTo(ax, -250 + ay - up); c.lineTo(ax, -60); c.stroke();
    c.fillStyle = ['#e8dcc0', '#c8a878', '#f0e6d0', '#b89068'][i]; c.beginPath(); c.moveTo(ax, -250 + ay - up); c.lineTo(ax - 12, -230 + ay - up); c.lineTo(ax - 12, -190 + ay - up); c.lineTo(ax, -204 + ay - up); c.lineTo(ax + 12, -190 + ay - up); c.lineTo(ax + 12, -230 + ay - up); c.closePath(); c.fill();
    if (i === 2 && pull > 0.3) { c.fillStyle = '#c8c4b8'; c.beginPath(); c.moveTo(ax, 40 - up + 30); c.lineTo(ax - 9, 40 - up + 8); c.lineTo(ax + 9, 40 - up + 8); c.closePath(); c.fill(); c.strokeStyle = '#6a4a2a'; c.lineWidth = 6; c.beginPath(); c.moveTo(ax, -60 - up); c.lineTo(ax, 40 - up + 8); c.stroke(); } });
  const g = c.createLinearGradient(-50, 0, 50, 0); g.addColorStop(0, '#4a2a16'); g.addColorStop(0.45, '#9a6234'); g.addColorStop(1, '#3a200e');
  c.fillStyle = g; c.beginPath(); c.moveTo(-46, -150); c.quadraticCurveTo(0, -164, 46, -150); c.lineTo(38, 170); c.quadraticCurveTo(0, 186, -38, 170); c.closePath(); c.fill();
  c.fillStyle = '#2a1608'; c.beginPath(); c.ellipse(0, -152, 46, 12, 0, 0, 6.283); c.fill();
  c.strokeStyle = '#d8b060'; c.lineWidth = 5; [-110, 120].forEach(yy => { c.beginPath(); c.moveTo(-44, yy); c.quadraticCurveTo(0, yy + 12, 44, yy); c.stroke(); });
  c.strokeStyle = 'rgba(255,230,190,0.18)'; c.lineWidth = 8; c.beginPath(); c.moveTo(-18, -130); c.lineTo(-14, 160); c.stroke();
  c.strokeStyle = '#5a3418'; c.lineWidth = 10; c.beginPath(); c.moveTo(-44, -120); c.quadraticCurveTo(-140, -20, -46, 140); c.stroke(); // strap
  c.restore(); }

// ---------- the monk's cell outside the town (a stone hut against a rock, arched door with lamp light, a mat in front)
function cell35(c, x, y, s, T, o = {}) { c.save(); c.translate(x, y); c.scale(s, s); const nt = o.night || 0, lamp = o.lamp === undefined ? 0.6 : o.lamp;
  rock(c, -60, 10, 560, 420, mix('#8a6a52', '#1a1820', nt * 0.8), SEED35 + 60);
  const st = mix('#b89a78', '#2a2632', nt * 0.75), dk = mix(st, '#140c08', 0.45), lt = mix(st, '#fff0d8', 0.25);
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(20, 6, 230, 18, 0, 0, 6.283); c.fill();
  c.fillStyle = st; c.beginPath(); c.moveTo(-180, 0); c.lineTo(-170, -230); c.quadraticCurveTo(0, -300, 180, -236); c.lineTo(190, 0); c.closePath(); c.fill();
  c.fillStyle = dk; c.beginPath(); c.moveTo(120, 0); c.lineTo(126, -240); c.quadraticCurveTo(160, -238, 180, -236); c.lineTo(190, 0); c.closePath(); c.fill();
  const r = rng(SEED35 + 61); c.strokeStyle = hexA(dk, 0.55); c.lineWidth = 2; for (let k = 0; k < 7; k++) { const yy = -20 - k * 32; c.beginPath(); c.moveTo(-176, yy); c.lineTo(186, yy - 2); c.stroke(); for (let j = 0; j < 6; j++) { const xx = -170 + j * 60 + (k % 2) * 30 + r() * 10; c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx, yy - 32); c.stroke(); } }
  c.fillStyle = hexA(lt, 0.6); c.beginPath(); c.moveTo(-170, -230); c.quadraticCurveTo(0, -300, 180, -236); c.lineTo(180, -226); c.quadraticCurveTo(0, -288, -170, -220); c.closePath(); c.fill();
  c.fillStyle = '#140a06'; c.beginPath(); archPath(c, -20, 0, 104, 170); c.fill(); // door
  if (lamp > 0) { c.save(); c.beginPath(); archPath(c, -20, 0, 104, 170); c.clip(); c.fillStyle = `rgba(255,190,110,${0.55 * lamp})`; c.fillRect(-80, -180, 120, 180); c.restore(); c.save(); c.globalCompositeOperation = 'lighter'; glow(c, -20, -70, 200, '#ffb060', 0.35 * lamp * (0.92 + 0.08 * Math.sin((T + 100) * 7))); c.restore(); }
  c.fillStyle = '#140a06'; c.fillRect(90, -170, 30, 40); // small window
  rug(c, -20, 60, 300, 50, mix('#7a3a2a', '#2a1a20', nt * 0.6));
  jar(c, 150, 8, 0.6, mix('#a8603a', '#2a2028', nt * 0.6));
  c.restore(); }

// ---------- the trench (al-ukhdud): a long pit across the plain (x0..x1 at depth y, opening d px deep on screen); dig 0..1 = length dug (from x0),
// k 0..1 = fire. Flames rise from inside, the near lip hides their foot; smoke; sparks. Seen only from a distance: never anyone in it.
function trench35(c, T, x0, x1, y, d, o = {}) { T += 100; const dig = o.dig === undefined ? 1 : o.dig, k = o.k || 0, nt = o.night || 0, xe = lerp(x0, x1, dig);
  if (xe - x0 < 4) return;
  const earth = mix('#a8805a', '#2a2430', nt * 0.75), dk = mix(earth, '#0a0604', 0.6);
  // far mound of dug earth
  c.fillStyle = mix(earth, '#fff0d0', 0.1); c.beginPath(); c.moveTo(x0 - 30, y - d * 0.5); for (let x = x0 - 30; x <= xe + 30; x += 20) c.lineTo(x, y - d * 0.5 - 16 - Math.sin(x * 0.05) * 5); c.lineTo(xe + 30, y - d * 0.5); c.closePath(); c.fill();
  // the pit
  c.fillStyle = mix(dk, '#ff6a20', 0.75 * k); c.beginPath(); c.moveTo(x0, y - d * 0.5); c.lineTo(xe, y - d * 0.5); c.lineTo(xe, y + d * 0.5); c.lineTo(x0, y + d * 0.5); c.closePath(); c.fill();
  if (k > 0) { const g = c.createLinearGradient(0, y - d * 0.5, 0, y + d * 0.5); g.addColorStop(0, `rgba(255,200,90,${0.9 * k})`); g.addColorStop(1, `rgba(200,50,10,${0.6 * k})`); c.fillStyle = g; c.fillRect(x0, y - d * 0.5, xe - x0, d);
    c.save(); c.globalCompositeOperation = 'lighter'; for (let x = x0; x < xe; x += 160) glow(c, x + 80, y - d, 260, '#ff8a30', 0.18 * k); c.restore();
    // flame tongues along the trench (behind the near lip)
    const r = rng(SEED35 + 70), n = Math.floor((xe - x0) / 14);
    for (let i = 0; i < n; i++) { const fx = x0 + 6 + i * 14 + r() * 8, ph = r() * 6.28, sp = 3 + r() * 3, hh = (40 + r() * 70) * (o.fs || 1) * k * (0.75 + 0.25 * Math.sin(T * sp + ph)), w = 10 + r() * 8;
      const fg = c.createLinearGradient(0, y + d * 0.4, 0, y + d * 0.4 - hh); fg.addColorStop(0, `rgba(255,236,170,${0.95 * k})`); fg.addColorStop(0.5, `rgba(255,140,40,${0.85 * k})`); fg.addColorStop(1, 'rgba(200,40,10,0)');
      c.fillStyle = fg; const sw = Math.sin(T * 4 + ph) * w * 0.6; c.beginPath(); c.moveTo(fx - w, y + d * 0.4); c.quadraticCurveTo(fx - w * 0.8 + sw, y + d * 0.4 - hh * 0.6, fx + sw * 1.4, y + d * 0.4 - hh); c.quadraticCurveTo(fx + w * 0.8 + sw, y + d * 0.4 - hh * 0.6, fx + w, y + d * 0.4); c.closePath(); c.fill(); }
    sparks(c, T, (x0 + xe) / 2, y - d * 0.3, Math.floor(12 + 20 * k), SEED35 + 71, 0.8 * k, (xe - x0) / 260); }
  // near lip + a thin bank of earth (hides the foot of the flames)
  const lg = c.createLinearGradient(0, y + d * 0.3, 0, y + d * 0.5 + 18); lg.addColorStop(0, mix(earth, '#ffb060', 0.35 * k)); lg.addColorStop(1, earth); c.fillStyle = lg;
  c.beginPath(); c.moveTo(x0 - 40, y + d * 0.5 + 20); c.lineTo(x0 - 20, y + d * 0.38); for (let x = x0; x <= xe; x += 20) c.lineTo(x, y + d * 0.38 + Math.sin(x * 0.07) * 3); c.lineTo(xe + 20, y + d * 0.38); c.lineTo(xe + 40, y + d * 0.5 + 20); c.closePath(); c.fill();
  if (!o.noEnd) { c.fillStyle = mix(earth, '#000000', 0.3); c.beginPath(); c.ellipse(xe, y, 10, d * 0.5, 0, 0, 6.283); c.fill(); }
  if (o.smoke !== false && k > 0) for (let i = 0; i < 4; i++) smoke(c, T, lerp(x0, xe, (i + 0.5) / 4), y - d * 0.6, 5, SEED35 + 72 + i, mix('#3a3034', '#1a1418', nt), 0.25 * k, 1.2, 70); }
// the orange light of the fire on the whole frame (from below)
function fireLight35(c, k, y = H) { if (k <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(0, y, 0, y - 1300); g.addColorStop(0, `rgba(255,110,40,${0.28 * k})`); g.addColorStop(1, 'rgba(255,110,40,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }

// ---------- the mountain top (the soldiers take the boy up to throw him down): a broad rocky summit, a cliff dropping on the right,
// the plain and Najran far below. sumY35 = ground line (the slope rises from the left, flat top, then the drop).
const sumY35 = x => x < 250 ? 1560 + Math.pow((250 - x) / 600, 1.1) * 420 + Math.sin(x * 0.012) * 8 : x < 720 ? 1560 + Math.sin(x * 0.012) * 8 : 1560 + Math.sin(720 * 0.012) * 8 + Math.pow((x - 720) / 220, 2) * 420;
function summit35(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 10) : [0, 0]));
  const nt = o.night || 0;
  sky0(c, skyStops(o.sky || 'gold', o.to, o.k || 0));
  if (o.sunA) bigSun30(c, o.sunX === undefined ? 240 : o.sunX, o.sunY === undefined ? 900 : o.sunY, 44, '#ffd08a', o.sunA);
  cloudBank(c, T, 700, 6, '#fff0dc', 0.18, SEED35 + 80, 8);
  par(c, -0.9, 0, 0, () => { ridgeW(c, 1250, 120, 0.0026, SEED35 + 81, mix('#9a8aa8', '#141628', nt)); hazeW(c, 1290, 260, mix('#f2d0b0', '#222440', nt), 0.6); // far plain far below
    c.fillStyle = mix('#c8a882', '#2a2834', nt * 0.8); c.fillRect(-2600, 1290, 6300, 1800); c.save(); c.translate(900, 1330); c.scale(0.18, 0.18); c.translate(-300, -1300); najranCity35(c, T, nt, 0); c.restore(); hazeW(c, 1420, 160, '#f2d8c0', 0.55); });
  wisps(c, T, 1150, 5, '#fff6ea', 0.25, SEED35 + 82, 10);
  const rc = mix('#9a7a5e', '#1a1820', nt * 0.85), lt = mix('#f0c89c', '#3a3448', nt * 0.85), sh = mix('#3a2a26', '#0a0a10', nt);
  const path = () => { c.beginPath(); c.moveTo(-2000, H + 900); for (let x = -2000; x <= 1400; x += 10) c.lineTo(x, sumY35(x)); c.lineTo(1400, H + 900); c.closePath(); };
  path(); const g = c.createLinearGradient(0, 1500, 0, H + 300); g.addColorStop(0, mix(rc, lt, 0.35)); g.addColorStop(0.5, rc); g.addColorStop(1, mix(rc, '#140c08', 0.5)); c.fillStyle = g; c.fill();
  c.save(); path(); c.clip(); const r = rng(SEED35 + 83);
  for (let k = 0; k < 16; k++) { const yy = 1600 + k * 40; c.strokeStyle = hexA(k % 2 ? sh : lt, 0.12); c.lineWidth = 3; c.beginPath(); for (let x = -2000; x <= 1400; x += 24) { const v = yy + (x - 500) * 0.05 + noise1(x * 0.01, k + 60) * 12; x === -2000 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); }
  const cg = c.createLinearGradient(700, 0, 1300, 0); cg.addColorStop(0, hexA(sh, 0)); cg.addColorStop(1, hexA(sh, 0.65)); c.fillStyle = cg; c.fillRect(700, 1400, 700, 1200); // the shaded cliff face
  for (let i = 0; i < 40; i++) { const x = -1600 + r() * 2900, y = sumY35(x) + 20 + Math.pow(r(), 1.6) * 360; c.fillStyle = mix('#7a6450', '#141218', nt * 0.8); c.beginPath(); c.ellipse(x, y, 10 + r() * 16, 5 + r() * 6, 0, 0, 6.283); c.fill(); }
  c.restore();
  c.strokeStyle = hexA(lt, 0.5); c.lineWidth = 3; c.beginPath(); for (let x = -2000; x <= 1400; x += 10) x === -2000 ? c.moveTo(x, sumY35(x) + 1) : c.lineTo(x, sumY35(x) + 1); c.stroke();
  for (let i = 0; i < 6; i++) shrub(c, -500 + i * 190, sumY35(-500 + i * 190) + 4, 0.5, mix('#5a6a3a', '#101410', nt), T, SEED35 + 84 + i);
  if (o.light) lightFromAbove(c, T, o.lightX || 480, o.light, o.lightW || 300);
  if (o.walkers) o.walkers(c);
  if (o.post) o.post(c);
  if (o.fg !== false) blurLayer(c, 9, bc => { boulder(bc, -60, 2090, 360, 140, mix('#7a6450', '#141218', nt * 0.8), SEED35 + 86); shrub(bc, 1130, 2120, 2.8, mix('#5a5a2a', '#101418', nt * 0.8), T, 7); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// the mountain seen from far (it shakes; dust rolls off the top; pebbles roll down): no one is shown falling
function peak35(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 10) : [0, 0]));
  sky0(c, skyStops(o.sky || 'gold', o.to || 'dusk', o.k || 0.3));
  bigSun30(c, 230, 980, 44, '#ffd08a', 0.6); cloudBank(c, T, 320, 6, '#fff0dc', 0.14, SEED35 + 90, 6);
  par(c, -0.6, 0, 0, () => { ridgeW(c, 1180, 160, 0.0024, SEED35 + 91, '#8a7a96'); hazeW(c, 1220, 200, '#f2c8a8', 0.5); });
  const pk = x => 1420 - 760 * Math.exp(-Math.pow((x - 560) / 330, 2)) - 40 * Math.exp(-Math.pow((x - 300) / 140, 2)) + noise1(x * 0.02, 92) * 14;
  const rc = '#8a6a56', lt = '#f0c89c', sh = '#3a2a2a';
  c.beginPath(); c.moveTo(-1600, 1700); for (let x = -1600; x <= 2700; x += 10) c.lineTo(x, pk(x)); c.lineTo(2700, 1700); c.closePath();
  const g = c.createLinearGradient(200, 0, 900, 0); g.addColorStop(0, mix(rc, lt, 0.35)); g.addColorStop(0.5, rc); g.addColorStop(1, mix(rc, sh, 0.5)); c.fillStyle = g; c.fill();
  c.save(); c.clip(); const r = rng(SEED35 + 93); for (let i = 0; i < 22; i++) { const x = 300 + r() * 540, y0 = pk(x); c.strokeStyle = hexA(r() > 0.5 ? sh : lt, 0.25); c.lineWidth = 3; c.beginPath(); c.moveTo(x, y0 + 6); c.quadraticCurveTo(x + (x - 560) * 0.3, y0 + 200, x + (x - 560) * 0.6 + r() * 30, y0 + 420); c.stroke(); }
  for (let k = 0; k < 12; k++) { c.strokeStyle = hexA(k % 2 ? sh : lt, 0.1); c.lineWidth = 3; c.beginPath(); for (let x = -1600; x <= 2700; x += 24) { const v = 900 + k * 50 + (x - 600) * 0.05; x === -1600 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); } c.restore();
  if (o.fall) { const rr = rng(SEED35 + 94); for (let i = 0; i < 14; i++) { const q = ((o.fall * 1.6 + rr()) % 1), x = 560 + (rr() - 0.5) * 140 + (rr() > 0.5 ? 1 : -1) * q * 260, y = pk(560) + 30 + q * 560; c.fillStyle = 'rgba(70,52,40,0.85)'; c.beginPath(); c.ellipse(x, y, 6 + rr() * 6, 5, q * 6, 0, 6.283); c.fill(); } }
  bigDust(c, T, 560, pk(560) + 40, 0.42, o.dust || 0, SEED35 + 95);
  par(c, 0, 0, 0, () => { const gg = c.createLinearGradient(0, 1400, 0, H + 200); gg.addColorStop(0, '#b89468'); gg.addColorStop(1, '#5a4028'); c.fillStyle = gg; c.beginPath(); c.moveTo(-1600, H + 400); for (let x = -1600; x <= 2700; x += 20) c.lineTo(x, 1560 + Math.sin(x * 0.004) * 30); c.lineTo(2700, H + 400); c.closePath(); c.fill();
    for (let i = 0, r2 = rng(SEED35 + 96); i < 12; i++) shrub(c, -300 + i * 140 + r2() * 60, 1590 + r2() * 260, 0.6 + r2() * 0.6, '#5a6a3a', T, i + 30); });
  blurLayer(c, 9, bc => fgBrush(bc, T, {}), 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- the sea: the soldiers' boat in the open sea (seaSet27 + boat27); o.rot = heel, o.storm = dark squall, o.splash, o.beach = the shore
function sea35(c, T, o = {}) {
  cam(c, (o.z || 1), o.cx || 540, o.cy || 1200, ...(o.shake ? shake(T, o.shake, 8) : [0, 0]));
  const sk = o.sky || 'gold', st = o.storm || 0;
  seaSet27(c, T, { sky: sk, to: o.to, k: o.k, sunX: 860, sunY: SEAY - 170, sunA: 1 - st * 0.8, glit: 0.55 * (1 - st), sails: !o.beach && st < 0.2, birds: st < 0.2 });
  if (st > 0) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(24,26,40,${0.7 * st})`); g.addColorStop(0.55, `rgba(30,36,50,${0.45 * st})`); g.addColorStop(1, `rgba(10,16,26,${0.4 * st})`); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }
  if (!o.beach) {
    const BX = o.bx || 540, WL = 1440, S = o.s || 0.9;
    boat27(c, BX, WL + (o.sink || 0) * 60, S, T, { rot: o.rot || 0, crew: (cc, dy) => {
      sold35(cc, 0, { x: -330, y: dy(-330), h: 300, dir: 1, t: T, light: 0.85, wind: 0.6, ink: 0.8, noSpear: true, reach: o.oar ? 0.5 : 0 });
      sold35(cc, 1, { x: -170, y: dy(-170), h: 305, dir: 1, t: T + 1, light: 0.85, wind: 0.6, ink: 0.8 });
      fig(cc, BOY35, { x: 70, y: dy(70), h: 330, dir: 1, t: T + 2, light: 1.0 + 0.2 * (o.pray || 0), wind: 0.7, ink: 0.75, dua: (o.pray || 0) > 0.5 });
      sold35(cc, 2, { x: 300, y: dy(300), h: 300, dir: -1, t: T + 3, light: 0.85, wind: 0.6, ink: 0.8 }); } });
    if (o.pray) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, BX + 70 * S, WL - 400 * S, 220, '#fff0c8', 0.3 * o.pray); c.restore(); }
    seaFront27(c, T, WL + 10, BX - 470 * S, BX + 500 * S, { sky: sk, to: o.to, k: o.k, sunX: 860 });
    if (o.splash) { splash27(c, BX + 300, WL - 40, o.splash, 2.4); splash27(c, BX - 260, WL - 20, clamp(o.splash * 1.2 - 0.1), 2); }
  } else { // the beach: wet sand, foam line, the boy walking alone (o.walkers)
    const sy = x => 1600 + Math.sin(x * 0.004) * 20;
    c.fillStyle = 'rgba(240,250,255,0.55)'; c.beginPath(); c.moveTo(-1600, sy(-1600) - 10); for (let x = -1600; x <= 2700; x += 20) c.lineTo(x, sy(x) - 10 + Math.sin(T * 1.6 + x * 0.02) * 6); c.lineTo(2700, sy(2700) + 14); c.lineTo(-1600, sy(-1600) + 14); c.closePath(); c.fill();
    const g = c.createLinearGradient(0, 1590, 0, H + 200); g.addColorStop(0, '#a88e6c'); g.addColorStop(0.15, '#d6b88e'); g.addColorStop(1, '#8a6c4a'); c.fillStyle = g;
    c.beginPath(); c.moveTo(-1600, H + 400); for (let x = -1600; x <= 2700; x += 20) c.lineTo(x, sy(x)); c.lineTo(2700, H + 400); c.closePath(); c.fill();
    const r = rng(SEED35 + 100); for (let i = 0; i < 70; i++) { const x = -800 + r() * 2600, y = sy(x) + 10 + Math.pow(r(), 1.4) * 360; c.fillStyle = hexA(r() > 0.5 ? '#6a5038' : '#f6e6c8', 0.5); c.beginPath(); c.ellipse(x, y, 3 + r() * 7, 2 + r() * 3, 0, 0, 6.283); c.fill(); }
    if (o.walkers) o.walkers(c, sy); }
  if (o.fg !== false && !o.beach) blurLayer(c, 10, bc => { bc.save(); waves(bc, T, H + 60, 26 + st * 30, 'rgba(20,50,70,0.85)', 0.006, 1.2 + st, 2711, 'rgba(220,240,255,0.25)'); bc.restore(); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- the king's hall (hall() of episode 8, darker; the throne); the magician's room = the same hall, dim, with braziers and smoke
function court35(c, T, o = {}) {
  cam(c, (o.z || 1) + 0.004 * Math.sin(T * 0.3), o.cx || 540, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 8) : [0, 0]));
  const dim = o.dim || 0;
  hall(c, T, { fy: 1250, skyTop: mix('#6a8ab8', '#1a1830', dim), skyBot: mix('#f0d0a8', '#5a3a4a', dim) });
  if (dim > 0) { c.fillStyle = `rgba(14,8,20,${0.55 * dim})`; c.fillRect(-900, -900, W + 1800, H + 1800); }
  if (o.braziers) { [[170, 1420], [910, 1420]].forEach(([x, y], i) => { brazier(c, x, y, 0.9, T, o.braziers, SEED35 + 110 + i); smoke(c, T + 100, x, y - 220, 6, SEED35 + 112 + i, '#4a3a4a', 0.3 * o.braziers, 1, 90); });
    c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 170, 1240, 360, '#ff9040', 0.22 * o.braziers); glow(c, 910, 1240, 360, '#ff9040', 0.22 * o.braziers); c.restore(); }
  if (o.throne) throne(c, o.thX || 540, o.thY || 1330, o.thS || 0.62, T, { glow: o.thGlow || 0 });
  if (o.walkers) o.walkers(c);
  if (o.post) o.post(c);
  if (o.fg !== false) blurLayer(c, 10, bc => { column(bc, -60, 2300, 130, 1500, mix('#d8b88e', '#3a2a24', dim * 0.7)); column(bc, 1140, 2300, 130, 1500, mix('#d8b88e', '#3a2a24', dim * 0.7)); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// the king seated on his throne in court35 (throne at thX, thY, thS)
function kingOnThrone35(c, T, o = {}) { const x = o.thX || 540, y = o.thY || 1330, s = o.thS || 0.62; king35(c, { x, y: y - 236 * s, h: 300 * s * 1.35, pose: 'sit', dir: o.dir || 1, t: T, light: 1, wind: 0.1, ink: 0.7, armUp: o.armUp || 0, dua: false }); }

// ---------- the crowd on the plain (the « one plain » of the hadith): rows facing the trunk (x = 540), an aisle in the middle
const HCROWD35 = (() => { const r = rng(SEED35 + 120), L = [];
  [[1430, 16, 84], [1470, 14, 100], [1515, 12, 120], [1580, 10, 150], [1660, 8, 190]].forEach(([y, n, gap], row) => { for (let i = 0; i < n; i++) { const x = 540 + (i - (n - 1) / 2) * gap + (r() - 0.5) * 34;
    if (row >= 1 && Math.abs(x - 540) < [0, 120, 200, 260, 320][row]) continue; L.push({ x, y: y + (r() - 0.5) * 14, f: (i * 3 + row * 5) % NAJ35.length, ph: r() * 10, row, d: r() }); } });
  return L.sort((a, b) => a.y - b.y); })();
function crowd35(c, T, o = {}) { const list = o.list || HCROWD35, fx = o.face === undefined ? 540 : o.face;
  list.forEach((p, i) => { if (o.skip && o.skip(p)) return; const h = hY35(p.y), dir = p.x < fx ? 1 : -1;
    const base = { x: p.x, y: p.y, h, dir, t: T + p.ph, light: o.light === undefined ? 0.85 : o.light, wind: 0.25, ink: 0.65 };
    const extra = o.fn ? o.fn(p, i, base) : {}; if (extra === null) return; fig(c, NAJ35[p.f], Object.assign(base, extra)); }); }

// ---------- the hero shot (hook, cta, outro, cover): the plain of Najran at dusk, the whole people gathered; the boy tied to the palm trunk in a
// soft column of light; the king on the right foreground with his bow lowered; o.cheer 0..1 = the crowd raises its arms (« we believe in the Lord of the boy »)
const HERO35 = Object.assign({}, DUSK35, { z: 1.32, cx: 540, cy: 1480, lamp: 0.5 });
function heroPeople35(T, o = {}) { const ch = o.cheer || 0; return c => {
  const drawBoy = () => { if (o.boyGone) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, 1380, 340, '#fff4d8', 0.45 * (o.boyLight || 1)); c.restore(); trunk35(c, 540, 1560, 0.8, T, {}); }
  else boyAtTrunk35(c, 540, 1560, 0.8, T, { light: o.boyLight === undefined ? 1 : o.boyLight, dir: 1 }); };
  const cf = (p, i) => ({ armUp: ch * (p.d > 0.3 ? 0.75 + 0.25 * Math.sin(T * 2.4 + i) : 0), dua: ch > 0.5 && p.d <= 0.12 });
  crowd35(c, T, { skip: p => p.y >= 1560, fn: cf }); drawBoy();
  crowd35(c, T, { skip: p => p.y < 1560 || (p.x > 700 && p.y > 1600), fn: (p, i) => ({ armUp: ch * (p.d > 0.3 ? 0.75 + 0.25 * Math.sin(T * 2.4 + i) : 0), dua: ch > 0.5 && p.d <= 0.12 }) });
  [[740, 1730, 0]].forEach(([x, y, i], j) => sold35(c, i, { x, y, h: hY35(y), dir: -1, t: T + 6 + j, light: 0.9, wind: 0.3, ink: 0.7 }));
  fig(c, COURT35, { x: 1000, y: 1780, h: hY35(1780), dir: -1, t: T + 4, light: 0.9, wind: 0.3, ink: 0.7 });
  const k = { x: 860, y: 1840, h: hY35(1840) * 0.96, dir: -1, t: T + 5, light: 1.0, wind: 0.35, ink: 0.75, reach: o.bowUp === undefined ? 0.35 : o.bowUp };
  king35(c, k); bow35(c, k, o.draw || 0, !!o.arrow); }; }
const hero35 = (c, T, o = {}) => najran35(c, T, Object.assign({}, HERO35, { light: 0.35, lightX: 540, lightW: 200, torches: [[150, 1660, 0.8], [930, 1640, 0.8]], walkers: heroPeople35(T, o) }, o));
function heroTexts35(c, a) { if (a <= 0) return; topShade(c, 1.3 * a); seriesTag35(c, a); bigWord27(c, 'TOUT UN PEUPLE', 250, a, 104); bigWord27(c, 'A CRU EN ALLAH', 360, a, 96, '#f6c453'); }

// ---------- episode 35 scenes
const NX35 = (o, extra) => Object.assign({}, o, extra);
// the boy before the throne (court35): king seated, boy standing on the carpet, soldiers on both sides
function boyBeforeKing35(T, o = {}) { return c => {
  kingOnThrone35(c, T, { armUp: o.kArm || 0 });
  [[250, 1700, 0, 1], [830, 1700, 2, -1]].forEach(([x, y, i, d], j) => sold35(c, i, { x, y, h: 400, dir: d, t: T + j, light: 0.9, wind: 0.1, ink: 0.7 }));
  fig(c, BOY35, { x: o.bx || 470, y: 1820, h: 470, dir: 1, t: T + 3, light: 1.05, wind: 0.1, ink: 0.75, reach: o.reach || 0, armUp: o.arm || 0 }); }; }
// the courtier before the throne
function courtierBeforeKing35(T, o = {}) { return c => {
  kingOnThrone35(c, T, { armUp: o.kArm || 0 });
  fig(c, COURT35, { x: 400, y: 1800, h: 560, dir: 1, t: T + 2, light: 1.0 + 0.2 * (o.lit || 0), wind: 0.1, ink: 0.75, reach: o.reach || 0, armUp: o.arm || 0 });
  sold35(c, 1, { x: 880, y: 1720, h: 420, dir: -1, t: T + 4, light: 0.9, wind: 0.1, ink: 0.7 }); }; }
// walkers streaming into the plain from both edges (steps driven by the distance)
function streamIn35(T, dist) { return c => { [[-140, 1500, 0, 1], [-260, 1560, 2, 1], [-90, 1640, 4, 1], [-300, 1720, 6, 1], [1220, 1520, 1, -1], [1330, 1580, 3, -1], [1180, 1660, 5, -1], [1390, 1740, 7, -1]].forEach(([x0, y, f, d], j) => {
  const h = hY35(y), dd = dist * (0.85 + 0.05 * (j % 4)); fig(c, NAJ35[f], { x: x0 + d * dd, y, h, dir: d, t: T + j, light: 0.9, wind: 0.3, ink: 0.65, walk: stepOf(dd, h) + j * 0.27 }); });
  crowd35(c, T, { skip: p => p.row < 2 || Math.abs(p.x - 540) > 330 }); }; }
// the believers standing in line before the fire (backs to us), calm, some in prayer; soldiers at the ends
function believers35(T, o = {}) { return c => {
  [[150, 1700, 0], [290, 1730, 3], [430, 1705, 5], [570, 1735, 1], [710, 1710, 6], [850, 1740, 2]].forEach(([x, y, f], j) => fig(c, NAJ35[f], { x, y, h: hY35(y), dir: j % 2 ? -1 : 1, t: T + j, light: 0.75, wind: 0.35, ink: 0.7, dua: j % 3 === 1 }));
  sold35(c, 0, { x: -10, y: 1780, h: hY35(1780), dir: 1, t: T + 7, light: 0.7, wind: 0.3, ink: 0.7 }); sold35(c, 3, { x: 1010, y: 1790, h: hY35(1790), dir: -1, t: T + 8, light: 0.7, wind: 0.3, ink: 0.7 }); }; }
// the king and his court seated on rugs at the edge of the trench (Al-Buruj 6-7), seen from behind, against the glow
function seated35(T) { return c => { rug(c, 560, 1800, 760, 120, '#5a1a22');
  [[300, 1770, 'C', 1], [470, 1790, 'K', 1], [660, 1790, 'S', -1], [820, 1770, 'C2', -1]].forEach(([x, y, w, d], j) => { const o = { x, y, h: hY35(y) * 0.98, pose: 'sit', dir: d, t: T + j, light: 0.7, wind: 0.2, ink: 0.7 };
    if (w === 'K') king35(c, o); else if (w === 'S') sold35(c, 2, Object.assign(o, { noSpear: true })); else fig(c, w === 'C' ? COURT35 : NAJ35[2], o); }); }; }
// the mother carrying her baby (the « bundle » in her arms); o.light = the baby's light
function mother35(c, T, x, y, o = {}) { const h = o.h || hY35(y), mo = { x, y, h, dir: o.dir || 1, t: T, light: 0.85, wind: 0.35, ink: 0.7, walk: o.walk === undefined ? null : o.walk };
  fig(c, MOTHER35, mo); heldBundle(c, mo);
  if (o.baby) { const s = h / 300, d = mo.dir; babyLight(c, x + d * 30 * s, y - 172 * s - (o.walk === null || o.walk === undefined ? 0 : Math.abs(Math.sin(o.walk * Math.PI * 2)) * 3 * s), o.baby, T); } }


// =====================================================================================================================
// ---------- episode 36: the people of Saba and the flood of the dam (Saba 15-19) · « Histoires du Coran »
// The people of Saba, the woman with the basket, the rich men, the travellers and the storytellers are ordinary people, faceless.
// Allah is never depicted (light only). Ma'rib as the place of the dam = according to the exegetes; the rats gnawing the dam =
// « according to some reports » (Wahb ibn Munabbih, quoted by Ibn Kathir). No one is ever shown in the water: the flood takes trees and fields.
function seriesTag36(c, a) { textGlow(c, 'HISTOIRES DU CORAN  ·  ÉPISODE 36', W / 2, 112, '600 32px Lora', '#fbe7c6', a * 0.92, '#000000', 12); }
function ctaText36(c, a) { ctaText29(c, a); }
const SEED36 = 3600, DY36 = 1185;                     // DY36 = the foot of the dam = far end of the valley floor
const hY36 = y => Math.max(40, (y - 1170) * 0.95);    // figure height by depth on the valley floor
const wcx36 = y => 540 + Math.sin((y - DY36) * 0.004) * 46 * clamp((y - DY36) / 420); // centre of the wadi bed
const whw36 = y => 14 + (y - DY36) * 0.17;            // half width of the wadi bed
const footL36 = y => 290 - (y - DY36) * 2.4, footR36 = y => 790 + (y - DY36) * 2.4; // feet of the two mountains
const SABA36 = [
  { robe: '#2e4a6a', wrap: '#e8dcc4', skin: '#a8714f', trim: '#c9a35a', band: '#c9a35a', inner: '#e2d8c0' },
  { robe: '#7a4a24', wrap: '#ece2cc', skin: '#9a6a4c', trim: '#3a2210', band: '#3a2210', inner: '#e0d6c0' },
  { robe: '#2e5a4a', wrap: '#dccfb2', skin: '#b07a58', trim: '#d8b070', band: '#d8b070', inner: '#d8ccb0' },
  { robe: '#6a3a2a', wrap: '#e6dcc8', skin: '#94664a', trim: '#b8a070', band: '#b8a070', inner: '#ddd4c0' },
  { robe: '#5a5a2e', wrap: '#efe6d2', skin: '#a8714f', trim: '#4a3018', band: '#4a3018', inner: '#e6dcc6' },
  { robe: '#3a3a5e', wrap: '#d8ccb4', skin: '#8f5f42', trim: '#a89070', band: '#a89070', inner: '#cfc4aa' },
  { robe: '#8a5a2a', wrap: '#e8e0cc', skin: '#b07a58', trim: '#5a3a20', band: '#5a3a20', inner: '#ddd2ba' },
  { robe: '#4a2e3e', wrap: '#e4dccc', skin: '#9a6a4c', trim: '#c8b48a', band: '#c8b48a', inner: '#e0d8c6' }];
const WOMAN36 = { robe: '#2a4a6e', wrap: '#2e2a3e', skin: '#a8714f', trim: '#d8b45a', band: '#d8b45a', inner: '#5a5a7a', covered: true, agal: false };
const GIRL36 = { robe: '#7a3a3a', wrap: '#3a2632', skin: '#a8714f', trim: '#e2c27a', band: '#e2c27a', inner: '#8a6a6a', covered: true, agal: false, child: true };
const BOY36 = { robe: '#4a6a3a', wrap: '#e6dabe', skin: '#a8714f', trim: '#e2c27a', band: '#e2c27a', inner: '#e4dac4', child: true };
const RICH36 = [
  { robe: '#6a1a2e', wrap: '#f0e6cc', skin: '#a8714f', trim: '#e8c060', band: '#e8c060', inner: '#efe4cc' },
  { robe: '#1e3a5a', wrap: '#f2e8d0', skin: '#9a6a4c', trim: '#e8c060', band: '#e8c060', inner: '#ece2ca' },
  { robe: '#4a2a5a', wrap: '#ece0c6', skin: '#b07a58', trim: '#d8b45a', band: '#d8b45a', inner: '#e8dcc4' }];
const OLD36 = { robe: '#5a4a3a', wrap: '#ece6d8', skin: '#9a6a4c', trim: '#c8b48a', band: '#c8b48a', inner: '#e6e0d0' };
const GOLD36 = { sky: 'gold', sunA: 0.7, sunX: 250, sunY: 980, haze: '#f0c8a0' };
const DAY36 = { sky: 'day', to: 'gold', k: 0.25, sunA: 0.55, sunX: 230, sunY: 760, haze: '#f0dcc4' };
const DAWN36 = { sky: 'dawn', to: 'gold', k: 0.3, sunA: 0.75, sunX: 820, sunY: 1010, haze: '#f0d0b8' };
const DUSK36 = { sky: 'dusk', to: 'gold', k: 0.35, sunA: 0.7, sunX: 230, sunY: 1000, haze: '#f0b0a0', lamp: 0.4 };
const STORM36 = { sky: 'grey', to: 'night', k: 0.45, storm: 1, haze: '#5a5a6a', rain: 0.5 };
const NIGHT36 = { sky: 'night', stars: 0.8, moon: 0.6, moonX: 840, moonY: 420, night: 1, lamp: 0.8, haze: '#2a2a48' };

// ---------- plants ------------------------------------------------------------------------------------------------
// a fruit tree of the gardens (orange-red fruits); origin = foot, ~440*s tall
function fruitTree36(c, x, y, s, T, seed, o = {}) { T += 100; const nt = o.night || 0, r = rng(seed);
  const leafC = mix(o.col || ['#3f6a2a', '#4a7430', '#365e26'][seed % 3], '#141a1a', nt * 0.75), dk = mix(leafC, '#0a1008', 0.45), lt = mix(leafC, '#e0eca8', 0.3 * (1 - nt)), trunkC = mix('#5a4030', '#18161c', nt * 0.7);
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.25)'; c.beginPath(); c.ellipse(0, 2, 120, 14, 0, 0, 6.283); c.fill();
  const sw = Math.sin(T * 0.8 + seed) * 4 * (o.wind === undefined ? 1 : o.wind);
  limb(c, [0, 0], [-6, -90], [sw * 0.5 - 4, -190], 30, 18, trunkC);
  limb(c, [-4, -150], [-40, -190], [-84 + sw, -236], 14, 8, trunkC); limb(c, [0, -160], [40, -200], [80 + sw, -246], 14, 8, trunkC);
  const cy = -290, B = []; for (let i = 0; i < 12; i++) { const a = r() * 6.283, d = Math.sqrt(r()); B.push([Math.cos(a) * 120 * d + sw, cy + Math.sin(a) * 72 * d, 58 + r() * 32]); }
  c.fillStyle = dk; B.forEach(([bx, by, br]) => { c.beginPath(); c.arc(bx, by + 12, br, 0, 6.283); c.fill(); });
  c.fillStyle = leafC; B.forEach(([bx, by, br]) => { c.beginPath(); c.arc(bx - 6, by - 4, br * 0.86, 0, 6.283); c.fill(); });
  c.fillStyle = lt; B.forEach(([bx, by, br], i) => { if (i % 2) return; c.beginPath(); c.arc(bx - 20, by - 22, br * 0.48, 0, 6.283); c.fill(); });
  c.fillStyle = hexA(mix(leafC, '#000000', 0.3), 0.5); for (let i = 0; i < 40; i++) { const a = r() * 6.283, d = Math.sqrt(r()); c.beginPath(); c.ellipse(Math.cos(a) * 140 * d + sw, cy + Math.sin(a) * 84 * d, 9, 5, a, 0, 6.283); c.fill(); }
  const nf = Math.round((o.fruit === undefined ? 1 : o.fruit) * 18), fc = o.fruitCol || ['#e2862a', '#c8402a', '#e8a832'][seed % 3];
  for (let i = 0; i < 18; i++) { const a = r() * 6.283, d = 0.35 + 0.65 * Math.sqrt(r()); if (i >= nf) continue; const fx = Math.cos(a) * 118 * d + sw, fy = cy + 6 + Math.abs(Math.sin(a)) * 64 * d;
    c.fillStyle = mix(fc, '#000000', 0.3 + nt * 0.4); c.beginPath(); c.arc(fx + 1.5, fy + 1.5, 9.5, 0, 6.283); c.fill(); c.fillStyle = mix(fc, '#181418', nt * 0.6); c.beginPath(); c.arc(fx, fy, 8.5, 0, 6.283); c.fill();
    c.fillStyle = `rgba(255,250,220,${0.5 * (1 - nt)})`; c.beginPath(); c.arc(fx - 3, fy - 3, 2.6, 0, 6.283); c.fill(); }
  c.restore(); }
// the tamarisk (athl, Saba 16): several stems, grey-green feathery plumes; ~300*s tall
function tamarisk36(c, x, y, s, T, seed, o = {}) { T += 100; const nt = o.night || 0, r = rng(seed);
  const col = mix('#8a9480', '#1a1e22', nt * 0.7), dk = mix(col, '#2a3028', 0.45), lt = mix(col, '#f2f0e0', 0.35 * (1 - nt)), stem = mix('#5e4a3c', '#16141a', nt * 0.7);
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.25)'; c.beginPath(); c.ellipse(0, 2, 110, 11, 0, 0, 6.283); c.fill();
  const tips = []; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.3 + (r() - 0.5) * 0.15, L = 170 + r() * 70, ex = Math.cos(a) * L, ey = Math.sin(a) * L;
    limb(c, [(i - 2) * 6, 0], [ex * 0.3 + (r() - 0.5) * 24, ey * 0.55], [ex, ey], 12, 4, stem); tips.push([ex, ey]); }
  // soft crown masses
  tips.forEach(([tx, ty]) => { c.fillStyle = hexA(dk, 0.75); c.beginPath(); c.ellipse(tx, ty + 34, 74, 48, 0, 0, 6.283); c.fill(); });
  tips.forEach(([tx, ty]) => { c.fillStyle = hexA(col, 0.85); c.beginPath(); c.ellipse(tx - 8, ty + 22, 60, 36, 0, 0, 6.283); c.fill(); });
  // drooping feathery strands (the tamarisk's « hair »)
  c.lineCap = 'round';
  tips.forEach(([tx, ty], i) => { for (let k = 0; k < 26; k++) { const a = r() * 6.283, d = Math.sqrt(r()), px = tx + Math.cos(a) * 64 * d, py = ty + 10 + Math.sin(a) * 34 * d, L = 26 + r() * 44, sw = Math.sin(T * 0.9 + i + k * 0.3) * 3;
    c.strokeStyle = hexA(k % 3 === 0 ? dk : (k % 3 === 1 ? col : lt), 0.9); c.lineWidth = 2.6; c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo(px + 6 + sw, py + L * 0.45, px + 3 + sw * 1.4, py + L); c.stroke(); } });
  c.restore(); }
// the bitter fruit (khamt, Saba 16 — the arak / bitter thorny bush): a low dome, dark leaves, small dark berries; ~130*s tall
function khamt36(c, x, y, s, T, seed, o = {}) { const nt = o.night || 0, r = rng(seed);
  const col = mix('#4e5c32', '#141818', nt * 0.7), dk = mix(col, '#0a0c08', 0.5), lt = mix(col, '#c8d8a0', 0.25 * (1 - nt));
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.28)'; c.beginPath(); c.ellipse(0, 2, 118, 12, 0, 0, 6.283); c.fill();
  c.strokeStyle = mix('#4a3a2e', '#141218', nt * 0.7); c.lineWidth = 4; c.lineCap = 'round';
  for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.34; c.beginPath(); c.moveTo((i - 4) * 3, 0); c.quadraticCurveTo(Math.cos(a) * 50, Math.sin(a) * 60 - 10, Math.cos(a) * 104, Math.sin(a) * 112 + 26); c.stroke(); }
  const B = []; for (let i = 0; i < 15; i++) { const a = Math.PI + 0.15 + r() * (Math.PI - 0.3), d = 0.35 + r() * 0.65; B.push([Math.cos(a) * 96 * d, -40 + Math.sin(a) * 74 * d, 28 + r() * 16]); }
  c.fillStyle = dk; B.forEach(([bx, by, br]) => { c.beginPath(); c.arc(bx, by + 6, br, 0, 6.283); c.fill(); });
  c.fillStyle = col; B.forEach(([bx, by, br]) => { c.beginPath(); c.arc(bx - 3, by - 2, br * 0.82, 0, 6.283); c.fill(); });
  c.fillStyle = lt; B.forEach(([bx, by, br], i) => { if (i % 3) return; c.beginPath(); c.arc(bx - 10, by - 10, br * 0.4, 0, 6.283); c.fill(); });
  c.strokeStyle = hexA(mix('#3a2a1e', '#000000', 0.2), 0.8); c.lineWidth = 2; for (let i = 0; i < 16; i++) { const a = Math.PI + r() * Math.PI, R = 100 + r() * 12, px = Math.cos(a) * R * 0.98, py = -30 + Math.sin(a) * R * 0.78; c.beginPath(); c.moveTo(px, py); c.lineTo(px + Math.cos(a) * 12, py + Math.sin(a) * 12); c.stroke(); }
  for (let i = 0; i < 26; i++) { const a = Math.PI + 0.2 + r() * (Math.PI - 0.4), d = 0.4 + r() * 0.6; const bx = Math.cos(a) * 92 * d, by = -38 + Math.sin(a) * 70 * d;
    c.fillStyle = mix('#5a1e2e', '#120a10', nt * 0.6); c.beginPath(); c.arc(bx, by, 4.2, 0, 6.283); c.fill(); c.fillStyle = 'rgba(255,220,220,0.35)'; c.beginPath(); c.arc(bx - 1.2, by - 1.2, 1.2, 0, 6.283); c.fill(); }
  c.restore(); }
// the lote tree (sidr, Saba 16): a gnarled small tree, zigzag thorny branches, sparse small leaves, a few small yellow fruits; ~330*s tall
function sidr36(c, x, y, s, T, seed, o = {}) { T += 100; const nt = o.night || 0, r = rng(seed);
  const bark = mix('#5a4434', '#18161c', nt * 0.7), leaf = mix('#6a7a3a', '#161a1a', nt * 0.7), lt = mix(leaf, '#e0e8a8', 0.3 * (1 - nt));
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.25)'; c.beginPath(); c.ellipse(0, 2, 110, 12, 0, 0, 6.283); c.fill();
  limb(c, [0, 0], [26, -90], [-6, -170], 30, 16, bark);
  const tips = [];
  const br = (x0, y0, a, L, w, d) => { const sw = Math.sin(T * 0.7 + d + x0 * 0.02) * 0.02; const mx = x0 + Math.cos(a + 0.35) * L * 0.5, my = y0 + Math.sin(a + 0.35) * L * 0.5, ex = mx + Math.cos(a - 0.3 + sw) * L * 0.5, ey = my + Math.sin(a - 0.3 + sw) * L * 0.5;
    c.strokeStyle = bark; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(mx, my); c.lineTo(ex, ey); c.stroke();
    c.lineWidth = Math.max(1.4, w * 0.25); c.beginPath(); c.moveTo(mx, my); c.lineTo(mx + Math.cos(a + 1.3) * 10, my + Math.sin(a + 1.3) * 10); c.stroke(); // thorn
    if (d >= 3) { tips.push([ex, ey]); return; } br(ex, ey, a - 0.45 - r() * 0.2, L * 0.72, w * 0.62, d + 1); br(ex, ey, a + 0.4 + r() * 0.2, L * 0.7, w * 0.6, d + 1); };
  br(-6, -170, -Math.PI / 2 - 0.5, 110, 14, 0); br(-6, -170, -Math.PI / 2 + 0.55, 104, 13, 0);
  tips.forEach(([tx, ty], i) => { for (let k = 0; k < 9; k++) { const lx = tx + (r() - 0.5) * 50, ly = ty + (r() - 0.5) * 36; c.fillStyle = k % 3 ? leaf : lt; c.beginPath(); c.ellipse(lx, ly, 7, 5, r() * 3, 0, 6.283); c.fill(); }
    if (i % 2 === 0) { c.fillStyle = mix('#d89a2a', '#1a1410', nt * 0.6); c.beginPath(); c.arc(tx + 6, ty + 8, 5, 0, 6.283); c.fill(); } });
  c.restore(); }

// ---------- the landscape of Ma'rib (according to the exegetes): two mountains, the dam in the gap, the reservoir behind it,
// the valley floor with fields, canals, two gardens (right and left of the wadi bed)
const topL36 = x => { const u = clamp((335 - x) / 560); return 1190 - 300 * ease(u) - 120 * ease(clamp((335 - x) / 1100)) - 70 * clamp((335 - x) / 90) * (1 - u) + noise1(x * 0.0035, 3) * 80 * u + noise1(x * 0.012, 4) * 22 * u + noise1(x * 0.05, 7) * 5 * u; };
const topR36 = x => { const u = clamp((x - 745) / 560); return 1190 - 310 * ease(u) - 120 * ease(clamp((x - 745) / 1100)) - 70 * clamp((x - 745) / 90) * (1 - u) + noise1(x * 0.0035, 5) * 80 * u + noise1(x * 0.012, 6) * 22 * u + noise1(x * 0.05, 8) * 5 * u; };
const hillL36 = x => 1192 - 95 * ease(clamp((250 - x) / 380)) + noise1(x * 0.01, 11) * 14 * clamp((250 - x) / 200), hillR36 = x => 1192 - 100 * ease(clamp((x - 830) / 380)) + noise1(x * 0.01, 12) * 14 * clamp((x - 830) / 200);
function mtn36(c, T, nt, st) {
  const base = mix(mix('#8e6c58', '#4a4450', st * 0.6), '#14141e', nt * 0.85), lit = mix(base, '#ffd8b0', 0.3 * (1 - nt) * (1 - st * 0.7)), sh = mix(base, '#140c10', 0.5);
  [[topL36, -2600, 335, -900, 335], [topR36, 745, 3700, 745, 2000]].forEach(([top, x0, x1, gl, gs], side) => {
    const path = () => { c.beginPath(); c.moveTo(x0, H + 900); for (let x = x0; x <= x1; x += 10) c.lineTo(x, top(x)); c.lineTo(x1, H + 900); c.closePath(); };
    path(); const g = c.createLinearGradient(gl, 0, gs, 0); if (side === 0) { g.addColorStop(0, lit); g.addColorStop(0.55, base); g.addColorStop(1, sh); } else { g.addColorStop(0, lit); g.addColorStop(0.4, base); g.addColorStop(1, sh); }
    c.fillStyle = g; c.fill();
    c.save(); path(); c.clip(); const r = rng(SEED36 + 10 + side);
    for (let k = 0; k < 14; k++) { const yy = 700 + k * 38; c.strokeStyle = hexA(k % 2 ? sh : lit, 0.14); c.lineWidth = 3; c.beginPath(); for (let x = x0; x <= x1; x += 24) { const v = yy + noise1(x * 0.006, k + 20 + side * 30) * 22 + (x - 540) * (side ? 0.06 : -0.06); x === x0 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); }
    for (let i = 0; i < 34; i++) { const x = side ? 770 + r() * 1300 : -1000 + r() * 1310, y0 = top(x) + 10 + r() * 60; if (y0 > 1120) continue; const L = 70 + r() * 150, dx = (r() - 0.5) * 30;
      c.strokeStyle = hexA(sh, 0.3); c.lineWidth = 2 + r() * 3; c.beginPath(); c.moveTo(x, y0); c.quadraticCurveTo(x + dx, y0 + L * 0.5, x + dx * 0.4, y0 + L); c.stroke();
      c.strokeStyle = hexA(lit, 0.2); c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + 4, y0 + 2); c.quadraticCurveTo(x + 4 + dx, y0 + L * 0.5, x + 4 + dx * 0.4, y0 + L * 0.9); c.stroke(); }
    for (let i = 0; i < 30; i++) { const x = side ? 770 + r() * 1300 : -1000 + r() * 1310, y = top(x) + 30 + r() * 300; if (y > 1170) continue; c.fillStyle = hexA(r() > 0.5 ? sh : lit, 0.16); c.beginPath(); c.ellipse(x, y, 16 + r() * 40, 6 + r() * 12, (r() - 0.5) * 0.4, 0, 6.283); c.fill(); }
    const sg = c.createLinearGradient(0, 1120, 0, 1260); sg.addColorStop(0, hexA(mix(base, '#e8c8a0', 0.25), 0)); sg.addColorStop(1, hexA(mix(base, '#e8c8a0', 0.25 * (1 - nt)), 0.6)); c.fillStyle = sg; c.fillRect(x0, 1120, x1 - x0, 600); // scree at the foot
    c.restore();
    c.strokeStyle = hexA(lit, 0.45); c.lineWidth = 3; c.beginPath(); for (let x = x0; x <= x1; x += 10) x === x0 ? c.moveTo(x, top(x) + 1) : c.lineTo(x, top(x) + 1); c.stroke(); });
  // nearer foothills (lighter, hazier), their feet hidden by the valley floor
  const fh = mix(base, '#e8c8a0', 0.22 * (1 - nt)), fhd = mix(fh, '#140c10', 0.35);
  [[hillL36, -2600, 252], [hillR36, 828, 3700]].forEach(([top, x0, x1], side) => { c.beginPath(); c.moveTo(x0, H + 900); for (let x = x0; x <= x1; x += 10) c.lineTo(x, top(x)); c.lineTo(x1, H + 900); c.closePath();
    const g = c.createLinearGradient(0, 1080, 0, 1260); g.addColorStop(0, fh); g.addColorStop(1, fhd); c.fillStyle = g; c.fill();
    c.save(); c.clip(); const r = rng(SEED36 + 15 + side); for (let i = 0; i < 40; i++) { const x = side ? 840 + r() * 1200 : -950 + r() * 1190, y = top(x) + 6 + r() * 70; c.fillStyle = hexA(r() > 0.5 ? fhd : mix(fh, '#fff0d8', 0.3), 0.3); c.beginPath(); c.ellipse(x, y, 8 + r() * 22, 3 + r() * 6, 0, 0, 6.283); c.fill(); }
    for (let i = 0; i < 10; i++) { const x = side ? 860 + r() * 900 : -650 + r() * 880; shrub(c, x, top(x) + 8 + r() * 20, 0.25 + r() * 0.2, mix('#6a6a3a', '#141818', nt * 0.8), T, SEED36 + 16 + i); } c.restore();
    c.strokeStyle = hexA(mix(fh, '#fff0d8', 0.35), 0.5); c.lineWidth = 2.5; c.beginPath(); for (let x = x0; x <= x1; x += 10) x === x0 ? c.moveTo(x, top(x) + 1) : c.lineTo(x, top(x) + 1); c.stroke(); });
}
// the reservoir behind the dam (a strip of water between the mountains); o.high = brimming, choppy (storm)
function lake36(c, T, nt, st, o = {}) { T += 100; const y0 = 1062, y1 = 1104, lvl = o.ruins ? 0 : 1;
  if (!lvl || o.after) { const g = c.createLinearGradient(0, y0 - 8, 0, y1); g.addColorStop(0, mix('#b89a80', '#24222e', nt * 0.8)); g.addColorStop(1, mix('#d0b08a', '#2a2834', nt * 0.8)); c.fillStyle = g; c.fillRect(150, y0 - 8, 780, y1 - y0 + 8);
    c.strokeStyle = hexA(mix('#8a6a4a', '#14121a', nt * 0.8), 0.35); c.lineWidth = 2; for (let k = 0; k < 4; k++) { c.beginPath(); for (let x = 150; x <= 930; x += 20) { const v = y0 + 4 + k * 10 + Math.sin(x * 0.02 + k * 2) * 3; x === 150 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); } return; }
  c.fillStyle = mix(mix('#4a5a3a', '#2a2e30', st), '#121418', nt * 0.8); c.fillRect(150, y0 - 6, 780, 8); // far shore
  const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, mix(mix('#9ab8c8', '#5a6470', st), '#1a2236', nt * 0.8)); g.addColorStop(1, mix(mix('#4a7a8e', '#3a4450', st), '#0e1626', nt * 0.8));
  c.fillStyle = g; c.fillRect(150, y0, 780, y1 - y0);
  const r = rng(SEED36 + 20); c.strokeStyle = `rgba(240,248,255,${0.35 * (1 - nt * 0.6)})`; c.lineWidth = 1.6;
  for (let i = 0; i < 40; i++) { const yy = y0 + 4 + r() * (y1 - y0 - 6), x = 160 + ((r() * 760 + T * (8 + st * 30) * (0.5 + r())) % 760), L = 10 + r() * 24; c.beginPath(); c.moveTo(x, yy); c.lineTo(x + L, yy); c.stroke(); }
}
// the dam: a long stone wall across the gap, buttresses, two sluice towers at its ends (water into the canals).
// o.flow = water released into the canals; o.crack 0..1; o.breach 0..1 = the wall bursts in the middle; o.ruins = only the sluices remain (today)
const DX0 = 300, DX1 = 780, DTOP = 1092;
function dam36(c, T, o = {}) { T += 100; const nt = o.night || 0, st = o.storm || 0, br = o.breach || 0;
  const stone = mix(mix('#c2a47c', '#7a7472', st * 0.5), '#26242e', nt * 0.8), dk = mix(stone, '#1a0e08', 0.45), lt = mix(stone, '#fff0d8', 0.3 * (1 - nt));
  const tower = (x0, x1, top, ruin) => { c.fillStyle = stone; c.beginPath(); c.moveTo(x0 - 4, DY36 + 2); c.lineTo(x0, top); c.lineTo(x1, top); c.lineTo(x1 + 4, DY36 + 2); c.closePath(); c.fill();
    c.fillStyle = hexA(dk, 0.45); c.fillRect(x1 - (x1 - x0) * 0.3, top, (x1 - x0) * 0.3 + 4, DY36 + 2 - top);
    c.strokeStyle = hexA(dk, 0.6); c.lineWidth = 1.2; for (let y = DY36 - 7, k = 0; y > top + 2; y -= 7, k++) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); for (let x = x0 + (k % 2) * 6; x < x1; x += 12) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 7); c.stroke(); } }
    if (ruin) { c.fillStyle = mix(stone, '#000000', 0.15); c.beginPath(); c.moveTo(x0, top); for (let k = 0; k <= 5; k++) c.lineTo(lerp(x0, x1, k / 5), top - (k % 2 ? 8 : 0) - (k === 2 ? 10 : 0)); c.lineTo(x1, top + 4); c.closePath(); c.fill(); }
    else { c.fillStyle = lt; c.fillRect(x0 - 2, top - 4, x1 - x0 + 4, 5); }
    const gx = (x0 + x1) / 2; c.fillStyle = '#140c08'; c.beginPath(); archPath(c, gx, DY36 + 1, (x1 - x0) * 0.4, 22); c.fill(); return gx; };
  if (o.ruins) { const block = (x0, x1, steps, top, sd) => { const r = rng(sd), w = x1 - x0; for (let k = 0; k < steps; k++) { const ya = lerp(DY36 + 2, top, k / steps), yb = lerp(DY36 + 2, top, (k + 1) / steps), ins = k * w * 0.07 * (r() + 0.4);
        c.fillStyle = mix(stone, k % 2 ? '#fff0d8' : '#1a0e08', 0.06); c.fillRect(x0 + ins, yb, w - ins * 1.6, ya - yb); c.fillStyle = hexA(dk, 0.45); c.fillRect(x1 - ins * 0.6 - w * 0.22, yb, w * 0.22, ya - yb); c.fillStyle = hexA(lt, 0.6); c.fillRect(x0 + ins, yb, w - ins * 1.6, 2);
        c.strokeStyle = hexA(dk, 0.55); c.lineWidth = 1; for (let y = ya - 7; y > yb; y -= 7) { c.beginPath(); c.moveTo(x0 + ins, y); c.lineTo(x1 - ins * 0.6, y); c.stroke(); } for (let y = ya; y > yb + 2; y -= 7) for (let x = x0 + ins + ((y / 7) % 2) * 6; x < x1 - ins * 0.6; x += 13) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 7); c.stroke(); } } };
    block(DX0 - 40, DX0 + 70, 4, DTOP - 70, SEED36 + 35); block(DX1 - 80, DX1 + 30, 3, DTOP - 52, SEED36 + 36);
    c.fillStyle = '#140c08'; c.fillRect(DX0 + 6, DY36 - 30, 22, 32); c.fillRect(DX1 - 40, DY36 - 24, 20, 26); // the old sluice channels
    rubble(c, 450, DY36 + 2, 120, 0.45, stone, SEED36 + 31, nt); rubble(c, 640, DY36 + 2, 100, 0.4, stone, SEED36 + 32, nt); return; }
  // the long wall (with the breach cut out of it)
  const nB = clamp(br * 1.4), hwT = 14 + 120 * br, hwB = 4 + 76 * br, nbY = lerp(DTOP + 10, DY36 + 2, nB);
  c.save();
  if (br > 0) { c.beginPath(); c.rect(0, 900, W, 400); c.moveTo(540 - hwT, DTOP - 20); c.lineTo(540 - hwB, nbY); c.lineTo(540 + hwB, nbY); c.lineTo(540 + hwT, DTOP - 20); c.closePath(); c.clip('evenodd'); }
  const g = c.createLinearGradient(0, DTOP, 0, DY36); g.addColorStop(0, lt); g.addColorStop(0.4, stone); g.addColorStop(1, mix(stone, '#1a0e08', 0.2));
  c.fillStyle = g; c.beginPath(); c.moveTo(DX0 - 4, DY36 + 2); c.lineTo(DX0 + 6, DTOP); c.lineTo(DX1 - 6, DTOP); c.lineTo(DX1 + 4, DY36 + 2); c.closePath(); c.fill();
  c.strokeStyle = hexA(dk, 0.42); c.lineWidth = 1; for (let y = DY36 - 6, k = 0; y > DTOP + 3; y -= 6, k++) { c.beginPath(); c.moveTo(DX0, y); c.lineTo(DX1, y); c.stroke(); }
  c.strokeStyle = hexA(dk, 0.3); for (let y = DY36 - 6, k = 0; y > DTOP + 3; y -= 6, k++) { c.beginPath(); for (let x = DX0 + (k % 2) * 7; x < DX1; x += 14) { c.moveTo(x, y); c.lineTo(x, y + 6); } c.stroke(); }
  for (let x = DX0 + 60; x < DX1 - 40; x += 46) { c.fillStyle = hexA(lt, 0.35); c.fillRect(x - 7, DTOP + 4, 7, DY36 - DTOP - 2); c.fillStyle = hexA(dk, 0.35); c.fillRect(x, DTOP + 4, 7, DY36 - DTOP - 2); } // buttresses
  c.fillStyle = lt; c.fillRect(DX0 + 6, DTOP - 3, DX1 - DX0 - 12, 5); c.fillStyle = hexA(dk, 0.5); c.fillRect(DX0 + 6, DTOP + 2, DX1 - DX0 - 12, 2);
  c.fillStyle = hexA(mix(stone, '#2a3a2a', 0.5), 0.35); c.fillRect(DX0, DY36 - 10, DX1 - DX0, 12); // damp foot
  if (o.crack) { c.save(); c.strokeStyle = `rgba(30,18,12,${0.75 * o.crack})`; c.lineCap = 'round'; const r = rng(SEED36 + 33);
    for (let i = 0; i < 7; i++) { let px = 540 + (r() - 0.5) * 16, py = DY36 - 4; const n = 3 + Math.floor(o.crack * 6); for (let j = 0; j < n; j++) { const nx = px + (r() - 0.5) * 22, ny = py - 8 - r() * 8; c.lineWidth = 2.2 - j * 0.15; c.beginPath(); c.moveTo(px, py); c.lineTo(nx, ny); c.stroke(); px = nx; py = ny; if (py < DTOP + 4) break; } } c.restore(); }
  c.restore();
  const gL = tower(DX0 - 6, DX0 + 52, DTOP - 26, false), gR = tower(DX1 - 56, DX1 + 4, DTOP - 30, false);
  if (o.flow) { [gL, gR].forEach((gx, i) => { c.fillStyle = `rgba(220,240,250,${0.7 * o.flow})`; c.beginPath(); c.ellipse(gx, DY36 + 4, 12, 4, 0, 0, 6.283); c.fill();
    c.save(); c.globalCompositeOperation = 'lighter'; glow(c, gx, DY36, 26, '#e0f4ff', 0.3 * o.flow); c.restore(); }); }
  // the breach: the falling torrent, spray, blocks tumbling
  if (br > 0 && o.after) { c.fillStyle = mix(stone, '#1a0e08', 0.25); c.beginPath(); c.moveTo(540 - hwT, DTOP); c.lineTo(540 - hwB - 10, DY36 + 2); c.lineTo(540 + hwB + 10, DY36 + 2); c.lineTo(540 + hwT, DTOP); c.closePath(); c.globalAlpha = 0; c.fill(); c.globalAlpha = 1;
    rubble(c, 540 - hwT * 0.6, DY36 + 2, 60, 0.35, stone, SEED36 + 37, nt); rubble(c, 540 + hwT * 0.7, DY36 + 2, 50, 0.3, stone, SEED36 + 38, nt); }
  else if (br > 0) { const r = rng(SEED36 + 34);
    c.save(); c.beginPath(); c.moveTo(540 - hwT, DTOP - 20); c.lineTo(540 - hwB, nbY); c.lineTo(540 - hwB - 6, DY36 + 6); c.lineTo(540 + hwB + 6, DY36 + 6); c.lineTo(540 + hwB, nbY); c.lineTo(540 + hwT, DTOP - 20); c.closePath(); c.clip();
    const wg = c.createLinearGradient(0, DTOP - 20, 0, DY36); wg.addColorStop(0, mix('#8aa0a8', '#4a4e54', st)); wg.addColorStop(0.5, '#a08866'); wg.addColorStop(1, '#e8e0d0'); c.fillStyle = wg; c.fillRect(540 - hwT - 10, DTOP - 30, hwT * 2 + 20, DY36 - DTOP + 40);
    c.strokeStyle = 'rgba(250,246,236,0.55)'; c.lineWidth = 2; for (let i = 0; i < 26; i++) { const x = 540 - hwT + r() * hwT * 2, ph = ((T * 2.2 + r()) % 1), y = DTOP - 10 + ph * (DY36 - DTOP + 10); c.beginPath(); c.moveTo(x, y - 12); c.lineTo(x + (x - 540) * 0.06, y + 8); c.stroke(); }
    c.restore();
    c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, DY36 - 4, 60 + 160 * br, '#f4f0e8', 0.45 * Math.min(1, br * 2)); c.restore();
    for (let i = 0; i < 22; i++) { const a = -Math.PI / 2 + (r() - 0.5) * 2.6, ph = ((T * (0.6 + r() * 0.5) + r()) % 1), d = (20 + r() * 90) * (0.4 + br) * ph; c.fillStyle = `rgba(245,242,235,${0.5 * (1 - ph) * Math.min(1, br * 2)})`;
      c.beginPath(); c.arc(540 + Math.cos(a) * d * 1.6, DY36 - 6 + Math.sin(a) * d * 0.7, 6 + ph * 16, 0, 6.283); c.fill(); }
    if (br < 0.75) for (let i = 0; i < 6; i++) { const f = clamp(br * 1.8 - i * 0.08), x = 540 + (r() - 0.5) * hwT * 1.6, y = DTOP + 6 + f * f * 120; if (f <= 0 || y > DY36 - 4) continue; c.fillStyle = mix(stone, '#000000', 0.2 + r() * 0.2); c.save(); c.translate(x, y); c.rotate(f * (r() - 0.5) * 6); c.fillRect(-6, -4, 12, 8); c.restore(); }
  }
}
// the valley floor: fields in perspective, two main canals from the sluices, the wadi bed between the two gardens. o.after = dry cracked mud
const floorPath36 = c => { c.beginPath(); c.moveTo(footL36(DY36), DY36); c.lineTo(footR36(DY36), DY36); c.lineTo(footR36(H + 700), H + 700); c.lineTo(footL36(H + 700), H + 700); c.closePath(); };
const canalX36 = (side, y) => side ? lerp(wcx36(y) + whw36(y), footR36(y), 0.38) : lerp(wcx36(y) - whw36(y), footL36(y), 0.38);
function floor36(c, T, o = {}) { T += 100; const nt = o.night || 0, st = o.storm || 0, aft = o.after || 0;
  const dim = col => mix(mix(col, '#5a5a60', st * 0.45), '#16161e', nt * 0.82);
  c.save(); floorPath36(c); c.clip();
  if (!aft) {
    const g = c.createLinearGradient(0, DY36, 0, H + 300); g.addColorStop(0, dim('#8a9050')); g.addColorStop(1, dim('#4e6a2a')); c.fillStyle = g; c.fillRect(-2600, DY36, 6300, 1800);
    const VPy = 1110, BY = [DY36]; for (let j = 0; j < 11; j++) BY.push(1110 + 90 * Math.pow(1.3, j + 1));
    const PAL = ['#6f8a34', '#7f9a3c', '#8aa040', '#a8a84a', '#5f7a2e', '#9a8a44', '#7a9238'];
    for (let j = 0; j < BY.length - 1; j++) for (let i = -14; i < 14; i++) { const ya = BY[j], yb = BY[j + 1], u0 = i * 0.12, u1 = (i + 1) * 0.12, xa0 = 540 + u0 * (ya - VPy), xa1 = 540 + u1 * (ya - VPy), xb0 = 540 + u0 * (yb - VPy), xb1 = 540 + u1 * (yb - VPy);
      const hsh = Math.abs(Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1; c.fillStyle = dim(PAL[Math.floor(hsh * PAL.length)]);
      c.beginPath(); c.moveTo(xa0, ya); c.lineTo(xa1, ya); c.lineTo(xb1, yb); c.lineTo(xb0, yb); c.closePath(); c.fill();
      if (yb - ya > 50) { c.strokeStyle = hexA(dim('#3a5020'), 0.35); c.lineWidth = 1 + (ya - DY36) * 0.004; c.beginPath(); for (let k = 1; k < 5; k++) { const q = k / 5; c.moveTo(lerp(xa0, xa1, q), ya); c.lineTo(lerp(xb0, xb1, q), yb); } c.stroke(); } }
    c.strokeStyle = hexA(dim('#c8b48a'), 0.5); for (let j = 1; j < BY.length; j++) { c.lineWidth = 1 + (BY[j] - DY36) * 0.008; c.beginPath(); c.moveTo(-2600, BY[j]); c.lineTo(3700, BY[j]); c.stroke(); }
    for (let i = -14; i <= 14; i++) { const u = i * 0.12; c.lineWidth = 1.5; c.beginPath(); c.moveTo(540 + u * (DY36 - VPy), DY36); c.lineTo(540 + u * (H + 600 - VPy), H + 600); c.stroke(); }
    // canals from the two sluices (o.flow = moving glints)
    [0, 1].forEach(side => { const pts = []; for (let y = DY36 + 2; y <= H + 600; y += 14) pts.push([canalX36(side, y), y]);
      const sx = side ? DX1 - 26 : DX0 + 23; pts.unshift([sx, DY36 + 2]);
      c.lineCap = 'round'; for (let k = 1; k < pts.length; k++) { const [x0, y0] = pts[k - 1], [x1, y1] = pts[k], w = 2 + (y1 - DY36) * 0.035; c.strokeStyle = dim('#6a5a3a'); c.lineWidth = w + 3; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
        c.strokeStyle = dim(o.flow ? '#7ab4c8' : '#8a9a88'); c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
      if (o.flow) { c.save(); c.globalCompositeOperation = 'lighter'; for (let k = 0; k < 26; k++) { const q = ((T * 0.18 + k / 26) % 1), idx = Math.floor(Math.pow(q, 1.6) * (pts.length - 1)); const [x, y] = pts[idx]; glow(c, x, y, 6 + (y - DY36) * 0.03, '#e8f8ff', 0.5 * o.flow); } c.restore(); }
      for (let j = 2; j < BY.length - 1; j += 2) { const y = BY[j], xc = canalX36(side, y), xe = side ? wcx36(y) + whw36(y) : wcx36(y) - whw36(y); c.strokeStyle = dim(o.flow ? '#7ab4c8' : '#8a9a88'); c.lineWidth = 1 + (y - DY36) * 0.012; c.beginPath(); c.moveTo(xc, y); c.lineTo(xe, y); c.stroke(); } });
  } else { // after: cracked dry mud, sand drifts, stones
    const g = c.createLinearGradient(0, DY36, 0, H + 300); g.addColorStop(0, dim('#c4a882')); g.addColorStop(1, dim('#8a6c4c')); c.fillStyle = g; c.fillRect(-2600, DY36, 6300, 1800);
    const r = rng(SEED36 + 40); c.lineCap = 'round';
    for (let i = 0; i < 260; i++) { const q = Math.pow(r(), 1.4), yy = DY36 + 8 + q * (H + 300 - DY36), k = 0.1 + q * 1.5; let x = -1400 + r() * 3900, py = yy;
      c.strokeStyle = hexA(dim('#4a3420'), 0.35 + q * 0.2); c.lineWidth = 0.8 + k; c.beginPath(); c.moveTo(x, py); for (let s = 0; s < 4; s++) { x += (r() - 0.3) * 40 * k; py += (r() - 0.5) * 10 * k; c.lineTo(x, py); } c.stroke(); }
    for (let i = 0; i < 22; i++) { const q = r(), yy = DY36 + 20 + q * q * 800, x = -900 + r() * 2900, w = (40 + r() * 120) * (0.2 + q * 1.4); c.fillStyle = hexA(dim('#e8d0a8'), 0.4); c.beginPath(); c.ellipse(x, yy, w, w * 0.12, 0, 0, 6.283); c.fill(); }
    for (let i = 0; i < 70; i++) { const q = Math.pow(r(), 1.5), yy = DY36 + 10 + q * 900, x = -900 + r() * 2900, sz = 2 + q * 12; c.fillStyle = hexA(dim(r() > 0.5 ? '#5a4430' : '#e8d8b8'), 0.6); c.beginPath(); c.ellipse(x, yy, sz, sz * 0.45, 0, 0, 6.283); c.fill(); }
  }
  // the wadi bed (dry while the dam holds)
  c.beginPath(); for (let y = DY36; y <= H + 700; y += 20) c.lineTo(wcx36(y) - whw36(y) * (aft ? 1.4 : 1), y); for (let y = H + 700; y >= DY36; y -= 20) c.lineTo(wcx36(y) + whw36(y) * (aft ? 1.4 : 1), y); c.closePath();
  const wg = c.createLinearGradient(0, DY36, 0, H + 300); wg.addColorStop(0, dim('#d8c09a')); wg.addColorStop(1, dim('#a88a64')); c.fillStyle = wg; c.fill();
  const r2 = rng(SEED36 + 41); for (let i = 0; i < 90; i++) { const q = Math.pow(r2(), 1.4), y = DY36 + 10 + q * 900, x = wcx36(y) + (r2() - 0.5) * 1.8 * whw36(y), sz = 1.5 + q * 9; c.fillStyle = hexA(dim(r2() > 0.5 ? '#6a5440' : '#f4e8d0'), 0.55); c.beginPath(); c.ellipse(x, y, sz, sz * 0.5, 0, 0, 6.283); c.fill(); }
  c.restore();
  // a soft rim where the floor meets the feet of the mountains
  c.strokeStyle = hexA(dim(aft ? '#e8d0a8' : '#c8c088'), 0.35); c.lineWidth = 4; c.beginPath(); c.moveTo(footL36(H + 700), H + 700); c.lineTo(footL36(DY36), DY36); c.lineTo(footR36(DY36), DY36); c.lineTo(footR36(H + 700), H + 700); c.stroke();
}
// the flood (sayl al-'arim, Saba 16): muddy water out of the breach, down the wadi, spreading over the fields. fl 0..1 = front
const floodF36 = fl => DY36 + 6 + fl * 1150;
const floodHW36 = (fl, y) => { const yf = floodF36(fl), base = whw36(y) * 1.5 + 14 + (y - DY36) * 0.3, behind = clamp((yf - y) / 180 + 0.35); return base + clamp(fl * 1.4) * behind * (y - DY36 + 30) * 2.4; };
function flood36(c, T, fl, o = {}) { if (fl <= 0) return; T += 100; const nt = o.night || 0, st = o.storm || 0, yf = floodF36(fl);
  c.save(); floorPath36(c); c.clip();
  const pts = []; for (let y = DY36 - 2; y <= yf; y += 10) pts.push(y);
  const kf = (yf - DY36) / 700, front = x => yf + (Math.sin(x * 0.03 + T * 3) * 6 + Math.sin(x * 0.011 - T * 2) * 9 + noise1(x * 0.02 + T * 0.8, 51) * 16) * (0.3 + kf) - Math.pow(Math.abs(x - wcx36(yf)) / (floodHW36(fl, yf) + 1), 2) * 50 * (0.3 + kf);
  c.beginPath(); pts.forEach((y, i) => { const x = wcx36(y) - floodHW36(fl, y); i ? c.lineTo(x, y) : c.moveTo(x, y); });
  const xl = wcx36(yf) - floodHW36(fl, yf), xr = wcx36(yf) + floodHW36(fl, yf); for (let x = xl; x <= xr; x += 16) c.lineTo(x, front(x));
  for (let i = pts.length - 1; i >= 0; i--) { const y = pts[i]; c.lineTo(wcx36(y) + floodHW36(fl, y), y); } c.closePath();
  const g = c.createLinearGradient(0, DY36, 0, yf); g.addColorStop(0, mix(mix('#d8d0c0', '#9a9890', st * 0.4), '#2a2630', nt * 0.7)); g.addColorStop(0.25, mix(mix('#a8906a', '#7a7468', st * 0.4), '#2a2630', nt * 0.7)); g.addColorStop(1, mix(mix('#8a6c48', '#5a5048', st * 0.4), '#1a1820', nt * 0.7));
  c.fillStyle = g; c.fill(); c.save(); c.clip();
  const r = rng(SEED36 + 50); c.lineCap = 'round';
  for (let i = 0; i < 160; i++) { const u = (r() - 0.5) * 1.9, sp = 0.5 + r() * 0.8, ph = ((T * sp * 0.35 + r()) % 1), y = DY36 + Math.pow(ph, 1.3) * (yf - DY36), x = wcx36(y) + u * floodHW36(fl, y) * 0.92, k = (y - DY36) / 700;
    c.strokeStyle = `rgba(246,240,228,${0.6 * (1 - nt * 0.6)})`; c.lineWidth = 1.5 + k * 5; c.beginPath(); c.moveTo(x - u * 4 * k, y - 10 - 26 * k); c.quadraticCurveTo(x + Math.sin(T * 4 + i) * 6 * k, y - 4, x + u * 6 * k, y + 8 * k); c.stroke(); }
  for (let k = 0; k < 16; k++) { const q = ((k / 16 + T * 0.12) % 1), y = DY36 + Math.pow(q, 1.4) * (yf - DY36), kk = (y - DY36) / 700, hw = floodHW36(fl, y), x0 = wcx36(y) - hw, x1 = wcx36(y) + hw;
    c.strokeStyle = `rgba(40,28,18,${0.13 * (1 - nt * 0.5)})`; c.lineWidth = 2 + kk * 6; c.beginPath(); for (let x = x0; x <= x1; x += 18) { const v = y + (Math.sin(x * 0.02 / (0.3 + kk) + k * 1.7 + T * 2) + noise1(x * 0.01 + k * 3, 60)) * 5 * (0.3 + kk); x === x0 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke();
    c.strokeStyle = `rgba(236,228,210,${0.3 * (1 - nt * 0.5)})`; c.lineWidth = 1 + kk * 3; c.beginPath(); for (let x = x0; x <= x1; x += 18) { const v = y - 3 - kk * 5 + Math.sin(x * 0.02 / (0.3 + kk) + k * 1.7 + T * 2) * 5 * (0.3 + kk); x === x0 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); }
  c.restore();
  c.strokeStyle = `rgba(248,240,226,${0.8 * (1 - nt * 0.5)})`; c.lineWidth = 3 + (yf - DY36) * 0.012; c.beginPath(); for (let x = xl; x <= xr; x += 14) x === xl ? c.moveTo(x, front(x) - 2) : c.lineTo(x, front(x) - 2); c.stroke();
  for (let i = 0; i < 40; i++) { const x = lerp(xl, xr, r()), ph = ((T * 1.4 + r()) % 1), k = (yf - DY36) / 700; c.fillStyle = `rgba(245,240,230,${0.5 * (1 - ph)})`; c.beginPath(); c.arc(x, front(x) - 6 - ph * 30 * (0.4 + k), (3 + ph * 8) * (0.4 + k), 0, 6.283); c.fill(); }
  c.restore();
}
// the trees of the two gardens (lush) or the bitter plants (after); depth sorted. Flooded trees lean and sink into the water.
const GT36 = (() => { const r = rng(SEED36 + 60), L = [];
  for (let k = 0; k < 15; k++) { const y = 1194 + 6 * k + k * k * 1.0, sp = 22 + (y - 1180) * 0.75;
    [0, 1].forEach(side => { const a = side ? wcx36(y) + whw36(y) + sp * 0.5 : footL36(y) + sp * 0.7, b = side ? footR36(y) - sp * 0.7 : wcx36(y) - whw36(y) - sp * 0.5;
      for (let x = a + r() * sp * 0.5; x < b; x += sp * (0.8 + r() * 0.5)) { if (r() > 0.78) continue; if (y > 1320 && Math.abs(x - wcx36(y)) < 330 + (y - 1320) * 2.2) continue; L.push({ x, y: y + (r() - 0.5) * 6, side, kind: r() < 0.42 ? 'P' : 'F', seed: SEED36 + 61 + L.length, ak: r(), on: r() }); } }); }
  return L.sort((p, q) => p.y - q.y); })();
function trees36(c, T, o = {}) { const nt = o.night || 0, fl = o.flood || 0, aft = o.after || 0, yf = floodF36(fl);
  GT36.forEach(p => { if (o.maxY && p.y > o.maxY) return; const h = hY36(p.y);
    if (aft) { if (p.on > 0.62) return; const kind = p.ak < 0.4 ? 'T' : (p.ak < 0.85 ? 'K' : 'S');
      if (kind === 'T') tamarisk36(c, p.x, p.y, h / 300 * 1.25, T, p.seed, { night: nt }); else if (kind === 'K') khamt36(c, p.x, p.y, h / 300 * 1.0, T, p.seed, { night: nt }); else sidr36(c, p.x, p.y, h / 300 * 1.15, T, p.seed, { night: nt }); return; }
    let sink = 0; if (fl > 0 && p.y < yf) { const dx = Math.abs(p.x - wcx36(p.y)), hw = floodHW36(fl, p.y); if (dx < hw) sink = clamp((yf - p.y) / 420) * clamp((hw - dx) / 140); }
    const th = p.kind === 'P' ? h * 1.15 * 1.4 : h * 1.3;
    if (sink >= 0.98) return;
    c.save(); if (sink > 0) { c.beginPath(); c.rect(p.x - 2000, -3000, 4000, p.y + 3000); c.clip(); c.translate(p.x, p.y + sink * th * 0.9); c.rotate((p.x < wcx36(p.y) ? -1 : 1) * sink * 0.45); c.translate(-p.x, -p.y); c.globalAlpha *= 1 - clamp(sink * 1.4 - 0.4); }
    if (p.kind === 'P') palm33(c, p.x, p.y, h / 300 * 1.15, T, p.seed, 0, { night: nt, lush: 0.6 }); else fruitTree36(c, p.x, p.y, h / 300 * 0.9, T, p.seed, { night: nt });
    c.restore();
    if (sink > 0.05 && sink < 0.9) { c.strokeStyle = 'rgba(245,238,224,0.5)'; c.lineWidth = 1 + h * 0.008; c.beginPath(); c.ellipse(p.x, p.y, h * 0.07, h * 0.015, 0, 0, 6.283); c.stroke(); } });
}
// the town of Ma'rib: tower houses on the two foothills (on the slope, above the floor)
function town36(c, T, nt, lamp) { const r = rng(SEED36 + 70), L = [];
  for (let i = 0; i < 9; i++) { const side = i < 6 ? 1 : 0, x = side ? 860 + i * 70 + r() * 30 : 200 - (i - 6) * 80 - r() * 30, yb = side ? DY36 + (x - 790) / 2.4 : DY36 + (290 - x) / 2.4, y = yb - 6 - r() * 10, s = hY36(y) / 300;
    L.push({ x, y, w: (90 + r() * 50) * s * 0.9, h: (150 + r() * 120) * s * 0.9, col: mix('#9a6040', '#c08a5a', r()), sd: SEED36 + 71 + i, lw: r(), lw2: r() }); }
  L.sort((a, b) => a.y - b.y).forEach(p => { towerHouse(c, p.x, p.y, p.w, p.h, mix(p.col, '#22202c', nt * 0.75), p.sd, T);
    if (lamp > 0 && p.lw > 0.3) { c.save(); c.globalCompositeOperation = 'lighter'; const wy = p.y - p.h * (0.35 + 0.4 * p.lw2); glow(c, p.x + p.w * 0.1, wy, p.w * 0.4, '#ffc070', 0.55 * lamp); c.restore(); } });
}
// the whole valley. o: z cx cy shake sky to k sunA sunX sunY storm night stars moon lightning lgX rain flow crack breach flood after ruins town lamp light lightX lightW walkers props post fg
function marib36(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 10) : [0, 0]));
  const nt = o.night || 0, st = o.storm || 0, hz = mix(mix(o.haze || '#f0c8a8', '#6a6a78', st * 0.7), '#22243c', nt * 0.6);
  sky0(c, skyStops(o.sky || 'gold', o.to, o.k || 0));
  if (st > 0) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(22,22,34,${0.6 * st})`); g.addColorStop(0.55, `rgba(40,40,52,${0.35 * st})`); g.addColorStop(1, 'rgba(30,30,40,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }
  if (o.stars) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); stars(c, T, 160, SEED36 + 3, [0, 0, W, 1000], o.stars); c.restore(); }
  if (o.moon) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); moon(c, o.moonX || 820, o.moonY || 400, 42, o.moon); c.restore(); }
  if (o.sunA) bigSun30(c, o.sunX === undefined ? 250 : o.sunX, o.sunY === undefined ? 980 : o.sunY, 46, o.sunCol || '#ffd08a', o.sunA);
  cloudBank(c, T, 280, 6, mix('#ffe6cc', '#22243c', nt), 0.12 * (1 - nt * 0.7) * (1 - st), SEED36 + 4, 6);
  if (st > 0) stormSky(c, T, st);
  if (o.lightning) lightning(c, o.lgX || 780, 260, 860, o.lightning, SEED36 + 9);
  const px = o.px || 0;
  par(c, -0.85, px, 0, () => { ridgeW(c, 1040, 200, 0.0021, SEED36 + 1, mix(mix('#8a7a9a', '#4a4a5a', st * 0.6), '#141628', nt)); hazeW(c, 1075, 220, hz, 0.5 * (1 - nt * 0.6)); });
  lake36(c, T, nt, st, o);
  mtn36(c, T, nt, st);

  floor36(c, T, o);
  flood36(c, T, o.flood || 0, o);
  dam36(c, T, o);
  trees36(c, T, o);
  if (o.town !== false) town36(c, T, nt, o.lamp || 0);
  if (o.props) o.props(c);
  if (o.light) lightFromAbove(c, T, o.lightX || 540, o.light, o.lightW || 380);
  if (o.walkers) o.walkers(c);
  if (o.post) o.post(c);
  if (o.rain) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); rainVeil(c, T + 100, -100, W + 100, -60, H, 0.22 * o.rain); rainVeil(c, T * 1.3 + 50, -100, W + 100, -60, H, 0.15 * o.rain); c.restore(); }
  if ((nt || st) && o.vignette !== false) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const v = c.createRadialGradient(W / 2, H * 0.55, H * 0.2, W / 2, H * 0.55, H * 0.75); v.addColorStop(0, 'rgba(4,4,12,0)'); v.addColorStop(1, `rgba(4,4,12,${0.5 * Math.max(nt, st * 0.8)})`); c.fillStyle = v; c.fillRect(0, 0, W, H); c.restore(); }
  if (o.tint) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = o.tint; c.fillRect(0, 0, W, H); c.restore(); }
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// highlight of one garden (« one on the right, one on the left »): a warm glow over the trees of one side
function sideGlow36(c, side, k) { if (k <= 0) return; c.save(); floorPath36(c); c.clip(); c.globalCompositeOperation = 'lighter';
  c.beginPath(); for (let y = DY36; y <= H + 700; y += 20) c.lineTo(side ? wcx36(y) + whw36(y) : wcx36(y) - whw36(y), y); c.lineTo(side ? 3700 : -2600, H + 700); c.lineTo(side ? 3700 : -2600, DY36 - 400); c.lineTo(540, DY36 - 400); c.closePath();
  const g = c.createLinearGradient(0, DY36 - 300, 0, 1700); g.addColorStop(0, 'rgba(255,230,160,0)'); g.addColorStop(0.5, `rgba(255,226,150,${0.42 * k})`); g.addColorStop(1, 'rgba(255,226,150,0)'); c.fillStyle = g; c.fill(); c.restore(); }

// ---------- inside a garden: eye level among fruit trees and palms, a path with a rill, light through the leaves
const ORCH36 = (() => { const L = [], r = rng(SEED36 + 80);
  for (let k = 0; k < 9; k++) { const d = 1 + k * 0.75; [-1, 1].forEach(sd => { L.push({ d, X: sd * (1.25 + r() * 0.2), kind: (k + (sd > 0 ? 1 : 0)) % 3 === 0 ? 'P' : 'F', seed: SEED36 + 81 + L.length });
    L.push({ d: d + 0.37, X: sd * (2.5 + r() * 0.4), kind: r() < 0.4 ? 'P' : 'F', seed: SEED36 + 120 + L.length }); }); }
  return L.sort((a, b) => b.d - a.d); })();
const oY36 = d => 1170 + 760 / d, oX36 = (X, d) => 540 + X * 560 / d, oH36 = y => Math.max(40, (y - 1170) * 0.62);
function orchard36(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 8) : [0, 0]));
  const dawn = o.dawn || 0, dim = col => mix(col, '#1a1a24', o.dim || 0);
  sky0(c, skyStops(dawn ? 'dawn' : 'day', 'gold', dawn ? 0.3 : 0.35));
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, 1080, 600, '#fff0c8', 0.25); c.restore();
  par(c, -0.8, 0, 0, () => { ridgeW(c, 1090, 120, 0.0026, SEED36 + 85, mix('#a89a8a', '#e8d8c0', 0.4)); hazeW(c, 1130, 200, '#fff0d8', 0.6); });
  // far garden wall of green
  c.fillStyle = dim('#5a7a3a'); c.beginPath(); c.moveTo(-1600, 1200); for (let x = -1600; x <= 2700; x += 30) c.lineTo(x, 1150 - Math.abs(Math.sin(x * 0.013)) * 40 - Math.abs(Math.sin(x * 0.031)) * 20); c.lineTo(2700, 1200); c.closePath(); c.fill();
  hazeW(c, 1200, 120, '#f8f0d8', 0.45);
  const g = c.createLinearGradient(0, 1180, 0, H + 200); g.addColorStop(0, dim('#8aa04a')); g.addColorStop(1, dim('#4a6a26')); c.fillStyle = g; c.fillRect(-1600, 1180, 4300, 1500);
  // the path and its rill
  c.fillStyle = dim('#c8b48a'); c.beginPath(); c.moveTo(530, 1182); c.lineTo(550, 1182); c.lineTo(540 + 300, H + 300); c.lineTo(540 - 300, H + 300); c.closePath(); c.fill();
  c.strokeStyle = dim('#7ab4c8'); c.lineWidth = 2; c.beginPath(); c.moveTo(552, 1184); c.lineTo(540 + 330, H + 300); c.stroke();
  c.save(); c.globalCompositeOperation = 'lighter'; for (let k = 0; k < 14; k++) { const q = ((T * 0.1 + k / 14) % 1), y = 1184 + Math.pow(q, 2) * 900, x = 552 + (y - 1184) * 0.36; glow(c, x, y, 3 + q * 10, '#e8f8ff', 0.5); } c.restore();
  const r = rng(SEED36 + 86); for (let i = 0; i < 160; i++) { const q = Math.pow(r(), 1.6), y = 1190 + q * 800, x = -800 + r() * 2700; if (Math.abs(x - 540) < (y - 1170) * 0.4) continue; const hh = 3 + q * 18; c.strokeStyle = dim(r() > 0.5 ? '#6a8a34' : '#a8c060'); c.lineWidth = 1 + q * 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * hh * 0.6, y - hh); c.stroke(); }
  // trees: back to front; walkers drawn at their depth (o.walkersAt = y below which they are drawn)
  let walkDone = false;
  ORCH36.forEach(p => { const y = oY36(p.d), x = oX36(p.X, p.d), s = 1.6 / p.d;
    if (!walkDone && o.walkers && y > (o.walkY || 1700)) { o.walkers(c); walkDone = true; }
    if (p.kind === 'P') palm33(c, x, y, s * 1.9, T, p.seed, 0, { lush: 0.8 }); else fruitTree36(c, x, y, s, T, p.seed, { fruit: o.fruit === undefined ? 1 : o.fruit }); });
  if (o.props) o.props(c);
  if (!walkDone && o.walkers) o.walkers(c);
  if (o.canopy) canopy36(c, T, o.canopy);
  // dappled light
  c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 760, 300, Math.PI / 2 + 0.25, 0.7, 1700, 7, '#fff6d8', 0.06 + 0.06 * dawn, T, SEED36 + 87); c.restore();
  if (o.light) lightFromAbove(c, T, o.lightX || 540, o.light, o.lightW || 300);
  if (o.post) o.post(c);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// the woman with the basket on her head (Qatada, quoted by the exegetes): fill 0..1; fruits falling into it
function basketWoman36(c, T, o, fill = 0) { fig(c, WOMAN36, o); const [hx, hy, hr] = headOf(o), s = o.h / 300, w = o.walk === null || o.walk === undefined ? 0 : Math.abs(Math.sin(o.walk * Math.PI * 2)) * 4 * s;
  c.fillStyle = '#c8b090'; c.beginPath(); c.ellipse(hx, hy - hr * 0.95 - w, hr * 0.9, hr * 0.28, 0, 0, 6.283); c.fill(); // cloth ring
  headBasket36(c, hx, hy - hr * 1.0 - w, s, fill); }
function headBasket36(c, x, y, s, fill) { c.save(); c.translate(x, y); c.scale(s, s); const col = '#c09a5e', dk = mix(col, '#2a1408', 0.45), lt = mix(col, '#fff0c8', 0.3);
  const rr = rng(SEED36 + 160), n = Math.round(fill * 22); for (let j = 0; j < 22; j++) { const fx = (rr() - 0.5) * 62, fy = -30 - rr() * 12 - (1 - Math.abs(fx) / 31) * 10 * fill, cl = ['#e2862a', '#c8402a', '#e8a832'][j % 3]; if (j >= n) continue;
    c.fillStyle = mix(cl, '#000000', 0.25); c.beginPath(); c.arc(fx + 1, fy + 1, 7, 0, 6.283); c.fill(); c.fillStyle = cl; c.beginPath(); c.arc(fx, fy, 6.5, 0, 6.283); c.fill(); }
  const g = c.createLinearGradient(-44, 0, 44, 0); g.addColorStop(0, dk); g.addColorStop(0.45, col); g.addColorStop(1, mix(col, '#2a1408', 0.3));
  c.fillStyle = g; c.beginPath(); c.moveTo(-30, 0); c.lineTo(-44, -30); c.quadraticCurveTo(0, -24, 44, -30); c.lineTo(30, 0); c.quadraticCurveTo(0, 6, -30, 0); c.fill();
  c.strokeStyle = hexA(dk, 0.7); c.lineWidth = 1.6; for (let k = 1; k < 4; k++) { const yy = -k * 7.5, w2 = lerp(30, 44, k / 4); c.beginPath(); c.moveTo(-w2, yy); c.quadraticCurveTo(0, yy + 5, w2, yy); c.stroke(); }
  c.strokeStyle = lt; c.lineWidth = 3; c.beginPath(); c.moveTo(-44, -30); c.quadraticCurveTo(0, -24, 44, -30); c.stroke(); c.restore(); }
// a canopy of fruit trees overhanging the path (top of the frame): y = lower edge of the leaves
function canopy36(c, T, y) { T += 100; const r = rng(SEED36 + 175), sw = Math.sin(T * 0.6) * 6;
  for (let pass = 0; pass < 3; pass++) for (let i = 0; i < 16; i++) { const x = -300 + i * 110 + r() * 60 + sw, yy = y - 40 - r() * 260, R = 80 + r() * 70;
    c.fillStyle = ['#2a4a1e', '#3f6a2a', '#5a8a36'][pass]; c.beginPath(); c.arc(x - pass * 10, yy - pass * 14, R * (1 - pass * 0.25), 0, 6.283); c.fill(); }
  for (let i = 0; i < 30; i++) { const x = -250 + r() * 1600 + sw, yy = y - 20 - r() * 120, cl = ['#e2862a', '#c8402a', '#e8a832'][i % 3]; c.fillStyle = mix(cl, '#000000', 0.25); c.beginPath(); c.arc(x + 1.5, yy + 1.5, 10, 0, 6.283); c.fill(); c.fillStyle = cl; c.beginPath(); c.arc(x, yy, 9, 0, 6.283); c.fill(); } }
function fallingFruit36(c, x, y, s, q, col = '#e2862a', y0 = null) { if (q <= 0 || q >= 1) return; const yy = y0 === null ? y - (1 - q * q) * 320 * s : lerp(y0, y, q * q); c.fillStyle = mix(col, '#000000', 0.25); c.beginPath(); c.arc(x + 1, yy + 1, 8 * s, 0, 6.283); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(x, yy, 7.5 * s, 0, 6.283); c.fill(); }

// ---------- the dam up close (its foot): huge dressed blocks, the wet foot, small holes (according to some reports: gnawed by rats),
// trickles that become jets; o.crack 0..1, o.leak 0..1, o.burst = everything gives way (spray + white)
function damClose36(c, T, o = {}) { T += 100;
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 10) : [0, 0]));
  const st = o.storm === undefined ? 0.6 : o.storm, stone = mix('#b89a74', '#6a6460', st * 0.5), dk = mix(stone, '#1a0e08', 0.5), lt = mix(stone, '#fff0d8', 0.25);
  sky0(c, skyStops('grey', 'night', 0.4)); stormSky(c, T, st);
  // the wall: big blocks in perspective (the wall rises out of frame)
  const base = 1560;
  c.fillStyle = stone; c.fillRect(-900, -900, W + 1800, base + 900);
  const r = rng(SEED36 + 90);
  for (let row = 0; row < 16; row++) { const y1 = base - row * 120, y0 = y1 - 120, off = (row % 2) * 110;
    for (let x = -900 + off; x < W + 900; x += 220) { const sh = r(); c.fillStyle = mix(stone, sh > 0.5 ? '#fff0d8' : '#1a0e08', 0.12 * Math.abs(sh - 0.5) * 2); c.fillRect(x + 4, y0 + 4, 212, 112);
      c.fillStyle = hexA(lt, 0.35); c.fillRect(x + 4, y0 + 4, 212, 6); c.fillStyle = hexA(dk, 0.35); c.fillRect(x + 4, y1 - 10, 212, 6);
      for (let k = 0; k < 6; k++) { c.fillStyle = hexA(r() > 0.5 ? dk : lt, 0.18); c.beginPath(); c.arc(x + 20 + r() * 180, y0 + 16 + r() * 90, 2 + r() * 4, 0, 6.283); c.fill(); } }
    c.fillStyle = hexA(dk, 0.7); c.fillRect(-900, y1 - 4, W + 1800, 4); }
  for (let row = 0; row < 16; row++) { const y1 = base - row * 120, off = (row % 2) * 110; c.fillStyle = hexA(dk, 0.7); for (let x = -900 + off; x < W + 900; x += 220) c.fillRect(x, y1 - 120, 4, 120); }
  const wg = c.createLinearGradient(0, base - 260, 0, base); wg.addColorStop(0, hexA('#2a3a2a', 0)); wg.addColorStop(1, hexA('#2a3a2a', 0.45)); c.fillStyle = wg; c.fillRect(-900, base - 260, W + 1800, 260); // wet foot, algae
  // the ground at the foot
  const gg = c.createLinearGradient(0, base, 0, H + 200); gg.addColorStop(0, '#6a5a44'); gg.addColorStop(1, '#3a3024'); c.fillStyle = gg; c.fillRect(-900, base, W + 1800, H + 600);
  for (let i = 0; i < 60; i++) { const q = Math.pow(r(), 1.3), y = base + 10 + q * 500, x = -300 + r() * 1700, sz = 3 + q * 16; c.fillStyle = hexA(r() > 0.5 ? '#2a2018' : '#a89070', 0.5); c.beginPath(); c.ellipse(x, y, sz, sz * 0.45, 0, 0, 6.283); c.fill(); }
  // holes at the foot of the wall (according to some reports, gnawed by rats) + trickles
  const HOLES = [[300, base - 40, 16], [470, base - 70, 12], [610, base - 30, 18], [780, base - 60, 13], [190, base - 80, 10], [880, base - 35, 11]];
  const nh = Math.round((o.holes === undefined ? 1 : o.holes) * HOLES.length);
  HOLES.slice(0, nh).forEach(([x, y, rr], i) => { c.fillStyle = '#120a06'; c.beginPath(); c.ellipse(x, y, rr * 1.3, rr, 0, 0, 6.283); c.fill(); c.strokeStyle = hexA(dk, 0.9); c.lineWidth = 3; c.stroke();
    c.fillStyle = hexA('#d8c8a8', 0.6); for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(x + (r() - 0.5) * rr * 3, base + 6 + r() * 10, 1.6 + r() * 2, 0, 6.283); c.fill(); } // gnawed grit
    const lk = o.leak || 0; if (lk > 0) { const jl = lk * (30 + i * 6); c.strokeStyle = `rgba(200,224,236,${0.75})`; c.lineWidth = 3 + lk * 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + jl * 0.5, y, x + jl * 0.7, base + 4); c.stroke();
      c.fillStyle = 'rgba(220,236,244,0.5)'; for (let k = 0; k < 4; k++) { const ph = ((T * 2 + k / 4 + i * 0.3) % 1); c.beginPath(); c.arc(x + jl * 0.7 + (k - 1.5) * 6, base + 4 - ph * 14, 2 + lk * 3 * (1 - ph), 0, 6.283); c.fill(); }
      c.fillStyle = `rgba(160,190,200,${0.35 * lk})`; c.beginPath(); c.ellipse(x + jl * 0.7, base + 12, 30 + lk * 60, 8 + lk * 10, 0, 0, 6.283); c.fill(); } });
  if (o.crack) { c.save(); c.strokeStyle = `rgba(20,12,8,${0.85 * clamp(o.crack * 2)})`; c.lineCap = 'round'; c.lineJoin = 'round'; const rc = rng(SEED36 + 91);
    [[470, base - 70], [610, base - 30], [300, base - 40]].forEach(([x0, y0]) => { for (let b = 0; b < 3; b++) { let px = x0, py = y0; const n = Math.floor(1 + o.crack * 5); for (let j = 0; j < n; j++) { const nx = px + (rc() - 0.5) * 34, ny = py - 8 - rc() * 18; c.lineWidth = 3 - j * 0.35; c.beginPath(); c.moveTo(px, py); c.lineTo(nx, ny); c.stroke(); px = nx; py = ny; } } }); c.restore(); }
  if (o.burst) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, base - 200, 300 + 700 * o.burst, '#e8f0f4', 0.6 * o.burst); c.restore(); }
  blurLayer(c, 8, bc => { boulder(bc, -40, 2060, 340, 160, '#4a3e30', SEED36 + 92); boulder(bc, 1120, 2080, 300, 140, '#4a3e30', SEED36 + 93); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- the map: Arabia, Saba (Ma'rib) in the south, the blessed lands (ash-Sham) in the north, the « visible towns » on the route.
// o.towns 0..1 = how many appear, o.gaps 0..1 = every other town fades (the distances grow), o.disperse 0..1 = the tribes scatter, o.medina = highlight
const MAPR36 = [[810, 1690], [745, 1520], [690, 1350], [640, 1180], [595, 1010], [560, 880], [530, 760], [500, 650]];
const MAPD36 = [[[810, 1690], [690, 1300], [595, 1000]], [[810, 1690], [600, 1100], [500, 640]], [[810, 1690], [900, 1150], [900, 720]], [[810, 1690], [960, 1640], [1020, 1560]], [[810, 1690], [740, 1450], [640, 1190]]];
function routePt36(q) { const n = MAPR36.length - 1, f = clamp(q) * n, i = Math.min(n - 1, Math.floor(f)), k = f - i; return [lerp(MAPR36[i][0], MAPR36[i + 1][0], k), lerp(MAPR36[i][1], MAPR36[i + 1][1], k)]; }
function map36(c, T, o = {}) { T += 100;
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1100);
  const g = c.createLinearGradient(0, -400, 0, 2400); g.addColorStop(0, '#e8d4ac'); g.addColorStop(1, '#c8a878'); c.fillStyle = g; c.fillRect(-900, -900, W + 1800, H + 1800);
  const r = rng(SEED36 + 100); for (let i = 0; i < 120; i++) { c.fillStyle = hexA(r() > 0.5 ? '#a8885a' : '#fff4dc', 0.12); c.beginPath(); c.ellipse(-200 + r() * 1500, -100 + r() * 2000, 20 + r() * 80, 10 + r() * 40, r() * 3, 0, 6.283); c.fill(); }
  const sea = '#7a9aa0', seaD = '#5a7c84';
  const poly = (P) => { c.beginPath(); P.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); };
  c.fillStyle = sea; c.strokeStyle = seaD; c.lineWidth = 4;
  poly([[-400, 420], [250, 450], [320, 560], [250, 640], [-400, 660]]); c.fill(); c.stroke(); // Mediterranean
  poly([[330, 640], [372, 660], [440, 840], [520, 1060], [600, 1270], [680, 1480], [760, 1700], [800, 1790], [740, 1830], [690, 1740], [610, 1520], [530, 1310], [450, 1100], [380, 880], [320, 700]]); c.fill(); c.stroke(); // Red Sea
  poly([[740, 1830], [800, 1790], [900, 1830], [1010, 1800], [1100, 1760], [1500, 1700], [1500, 2600], [500, 2600], [600, 1930]]); c.fill(); c.stroke(); // Gulf of Aden, Arabian Sea
  poly([[880, 760], [940, 800], [990, 900], [1050, 990], [1120, 1040], [1500, 1060], [1500, 600], [900, 640]]); c.fill(); c.stroke(); // the Gulf
  c.strokeStyle = hexA('#fff4dc', 0.35); c.lineWidth = 2; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(700 + k * 30, 1940 + k * 50); c.quadraticCurveTo(950, 1890 + k * 50, 1300, 1920 + k * 50); c.stroke(); }
  c.fillStyle = hexA('#8a6a44', 0.25); for (let i = 0; i < 46; i++) { const x = 430 + r() * 560, y = 760 + r() * 900; if (x < 380 + (y - 640) * 0.36) continue; c.beginPath(); c.moveTo(x - 10, y); c.lineTo(x, y - 12); c.lineTo(x + 10, y); c.closePath(); c.fill(); } // hills
  const lab = (t, x, y, a = 1, sz = 34, col = '#4a3018') => { if (a > 0) textGlow(c, t, x, y, `600 ${sz}px Lora`, col, a, '#fff4dc', 6); };
  lab('ASH-CHAM', 520, 610, 1, 36); lab('MER ROUGE', 470, 1250, 0.6, 26, '#2a4a54'); lab('SABA', 900, 1660, 1, 42, '#7a2a14'); lab("Ma'rib", 900, 1712, 0.9, 28);
  // the route and its towns
  const tw = o.towns || 0; if (tw > 0) { c.save(); c.setLineDash([14, 12]); c.strokeStyle = hexA('#7a4a20', 0.6 * Math.min(1, tw * 2)); c.lineWidth = 4; c.beginPath(); MAPR36.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); c.restore();
    const N = 12; for (let i = 1; i < N; i++) { const q = i / N, a = clamp((tw - q * 0.85) * 6) * (o.gaps && i % 2 ? 1 - o.gaps : 1); if (a <= 0) continue; const [x, y] = routePt36(q);
      c.save(); c.globalAlpha = a; c.globalCompositeOperation = 'source-over'; c.fillStyle = '#fff4dc'; c.beginPath(); c.arc(x, y, 13, 0, 6.283); c.fill(); c.fillStyle = '#a8401c'; c.beginPath(); c.arc(x, y, 9, 0, 6.283); c.fill();
      if (o.night) { c.globalCompositeOperation = 'lighter'; glow(c, x, y, 40, '#ffc070', 0.5); } c.restore(); } }
  c.fillStyle = '#7a2a14'; c.beginPath(); c.arc(810, 1690, 16, 0, 6.283); c.fill(); c.fillStyle = '#f6c453'; c.beginPath(); c.arc(810, 1690, 8, 0, 6.283); c.fill();
  // the dispersal: dashed lines from Ma'rib, little groups travelling along them
  const dp = o.disperse || 0; if (dp > 0) MAPD36.forEach((P, i) => { const k = clamp(dp * 1.3 - i * 0.07); if (k <= 0) return;
    const pt = q => { const a = (1 - q) * (1 - q), b = 2 * (1 - q) * q, cc = q * q; return [a * P[0][0] + b * P[1][0] + cc * P[2][0], a * P[0][1] + b * P[1][1] + cc * P[2][1]]; };
    c.strokeStyle = 'rgba(122,42,20,0.8)'; c.lineWidth = 5; c.setLineDash([16, 10]); c.beginPath(); for (let q = 0; q <= k; q += 0.02) { const [x, y] = pt(q); q ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.setLineDash([]);
    const [ex, ey] = pt(k), [bx, by] = pt(Math.max(0, k - 0.04)), ang = Math.atan2(ey - by, ex - bx); c.fillStyle = '#7a2a14'; c.beginPath(); c.moveTo(ex + Math.cos(ang) * 18, ey + Math.sin(ang) * 18); c.lineTo(ex + Math.cos(ang + 2.5) * 16, ey + Math.sin(ang + 2.5) * 16); c.lineTo(ex + Math.cos(ang - 2.5) * 16, ey + Math.sin(ang - 2.5) * 16); c.closePath(); c.fill(); });
  if (o.medina) { const a = o.medina; c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 595, 1000, 120, '#ffd070', 0.5 * a); c.restore(); c.fillStyle = hexA('#2a4a24', a); c.beginPath(); c.arc(595, 1000, 14, 0, 6.283); c.fill(); lab('MÉDINE', 750, 1010, a, 38, '#2a4a24'); }
  // vignette
  c.setTransform(1, 0, 0, 1, 0, 0); const v = c.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); v.addColorStop(0, 'rgba(60,40,20,0)'); v.addColorStop(1, 'rgba(60,40,20,0.45)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
}

// ---------- the caravan road to ash-Sham: a desert plain, the « visible towns » on low hills at regular intervals, a caravan on the road.
// o.night = lanterns, lit windows, stars; o.dist = distance walked (steps driven by it)
const rY36 = 1640; // ground line of the caravan
function hillTown36(c, x, y, s, T, nt, lamp, seed) { const r = rng(seed); c.fillStyle = mix('#b8946a', '#24222e', nt * 0.8); c.beginPath(); c.moveTo(x - 260 * s, y); c.quadraticCurveTo(x, y - 110 * s, x + 260 * s, y); c.closePath(); c.fill();
  for (let i = 0; i < 6; i++) { const hx = x + (i - 2.5) * 52 * s + (r() - 0.5) * 20 * s, hy = y - 70 * s * (1 - Math.pow((hx - x) / (260 * s), 2)) + 4 * s, w = (40 + r() * 20) * s, h = (60 + r() * 60) * s, lw = r();
    towerHouse(c, hx, hy, w, h, mix(mix('#9a6040', '#c08a5a', r()), '#22202c', nt * 0.75), seed + i, T);
    if (lamp > 0 && lw > 0.3) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, hx, hy - h * 0.5, w * 0.8, '#ffc070', 0.6 * lamp); c.restore(); } } }
function route36(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 8) : [0, 0]));
  const nt = o.night || 0, px = o.px || 0;
  sky0(c, skyStops(nt ? 'night' : (o.sky || 'day'), nt ? null : 'gold', nt ? 0 : 0.35));
  if (nt) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); stars(c, T, 200, SEED36 + 110, [0, 0, W, 1100], 0.9); moon(c, 820, 380, 40, 0.7); c.restore(); }
  else bigSun30(c, 260, 820, 46, '#ffd08a', 0.6);
  par(c, -0.85, px, 0, () => { ridgeW(c, 1180, 120, 0.0024, SEED36 + 111, mix('#a8909a', '#161828', nt)); hazeW(c, 1220, 200, mix('#f0d8c0', '#22243c', nt), 0.5); });
  par(c, -0.6, px, 0, () => { const g = c.createLinearGradient(0, 1230, 0, 1700); g.addColorStop(0, mix('#d8b888', '#2a2834', nt * 0.85)); g.addColorStop(1, mix('#c09a6a', '#24222c', nt * 0.85)); c.fillStyle = g; c.fillRect(-2600, 1235, 6300, 1400);
    [[-700, 1290, 0.45], [120, 1262, 0.32], [760, 1250, 0.24], [1350, 1245, 0.19], [1900, 1242, 0.15]].forEach(([x, y, s], i) => hillTown36(c, x, y, s, T, nt, nt ? 1 : 0, SEED36 + 112 + i * 10)); });
  par(c, -0.25, px, 0, () => { // the road: a pale beaten track narrowing toward the towns
    const P = q => { const a = [-1400, 1700], b = [200, 1420], cc = [700, 1300], d = [1500, 1256]; const u = 1 - q; return [u * u * u * a[0] + 3 * u * u * q * b[0] + 3 * u * q * q * cc[0] + q * q * q * d[0], u * u * u * a[1] + 3 * u * u * q * b[1] + 3 * u * q * q * cc[1] + q * q * q * d[1]]; };
    c.fillStyle = hexA(mix('#e8d0a8', '#3a3644', nt * 0.85), 0.55); c.beginPath(); for (let q = 0; q <= 1.001; q += 0.02) { const [x, y] = P(q), w = lerp(70, 3, q); q ? c.lineTo(x, y - w) : c.moveTo(x, y - w); } for (let q = 1; q >= -0.001; q -= 0.02) { const [x, y] = P(q), w = lerp(70, 3, q); c.lineTo(x, y + w); } c.closePath(); c.fill();
    c.strokeStyle = hexA(mix('#8a6a48', '#14121a', nt * 0.85), 0.25); c.lineWidth = 2; [-0.4, 0.4].forEach(k => { c.beginPath(); for (let q = 0; q <= 1.001; q += 0.02) { const [x, y] = P(q), w = lerp(70, 3, q) * k; q ? c.lineTo(x, y + w) : c.moveTo(x, y + w); } c.stroke(); }); });
  par(c, 0, px, 0, () => { const g = c.createLinearGradient(0, 1580, 0, H + 200); g.addColorStop(0, mix('#cfae80', '#2a2834', nt * 0.85)); g.addColorStop(1, mix('#9a7650', '#1a1820', nt * 0.85)); c.fillStyle = g;
    c.beginPath(); c.moveTo(-2600, H + 600); for (let x = -2600; x <= 3700; x += 20) c.lineTo(x, rY36 - 30 + Math.sin(x * 0.003) * 12); c.lineTo(3700, H + 600); c.closePath(); c.fill();
    const r = rng(SEED36 + 120); for (let i = 0; i < 80; i++) { const q = Math.pow(r(), 1.4), y = rY36 - 20 + q * 500, x = -1500 + r() * 4200, sz = 2 + q * 12; c.fillStyle = hexA(mix(r() > 0.5 ? '#6a5038' : '#f4e2c0', '#1a1820', nt * 0.7), 0.55); c.beginPath(); c.ellipse(x, y, sz, sz * 0.45, 0, 0, 6.283); c.fill(); }
    for (let i = 0; i < 9; i++) shrub(c, -1200 + i * 520 + (i % 3) * 60, rY36 + 10 + (i % 2) * 160, 0.7 + (i % 3) * 0.3, mix('#7a7a3a', '#141818', nt * 0.8), T, SEED36 + 121 + i);
    if (o.walkers) o.walkers(c); });
  if (o.post) o.post(c);
  if (nt) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const v = c.createRadialGradient(W / 2, H * 0.58, H * 0.2, W / 2, H * 0.55, H * 0.75); v.addColorStop(0, 'rgba(4,4,12,0)'); v.addColorStop(1, 'rgba(4,4,12,0.5)'); c.fillStyle = v; c.fillRect(0, 0, W, H); c.restore(); }
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// a caravan on the ground line y (camels + men; steps driven by the distance); list = [['C'|index, dx], ...]; o.lantern = index of the man holding a lantern
function caravan36(c, T, dist, list, o = {}) { const dir = o.dir || 1, x0 = o.x0 || 0, h = o.h || 300, gy = o.gy || (() => rY36), nt = o.night || 0;
  list.forEach(([wi, dx], i) => { const d = dist + dx, x = x0 + d * dir, y = gy(x);
    if (wi === 'C') { const s = h / 300 * 0.92; camel(c, x, y, s, mix(mix('#b0845a', '#000000', (i % 3) * 0.07), '#1a1820', nt * 0.6), o.still ? T * 0.2 : camelT(Math.abs(d), s) + i * 0.6, dir, i % 2 ? '#7a3a2a' : '#3a4a6a', { walk: !o.still, head: 0 }); return; }
    fig(c, (o.who || SABA36)[wi % (o.who || SABA36).length], { x, y, h, dir, t: T + i, light: o.light || (nt ? 0.75 : 1), wind: 0.4, walk: o.still ? null : stepOf(Math.abs(d), h) + i * 0.31, ink: 0.7, lantern: o.lantern === i, staff: wi % 3 === 1 && o.lantern !== i }); });
}

// ---------- a rooftop terrace of a tower house above the valley (the rich men at their feast); background = the valley seen from above
function terrace36(c, T, o = {}) {
  marib36(c, T, Object.assign({}, o.land || GOLD36, { z: 0.82, cx: 540, cy: 1250, town: false }));
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150);
  const fy = 1640, wallTop = 1480, plaster = mix('#e0cfae', '#2a2834', o.dim || 0), dk = mix(plaster, '#2a1a10', 0.35);
  // parapet with the white gypsum zigzag frieze of Yemeni houses
  c.fillStyle = mix('#a8704a', '#2a2834', o.dim || 0); c.fillRect(-900, wallTop, W + 1800, fy - wallTop);
  c.fillStyle = '#f4efe2'; c.fillRect(-900, wallTop, W + 1800, 10); c.fillRect(-900, wallTop + 60, W + 1800, 8);
  c.strokeStyle = '#f4efe2'; c.lineWidth = 5; c.beginPath(); for (let x = -900; x < W + 900; x += 40) { c.moveTo(x, wallTop + 54); c.lineTo(x + 20, wallTop + 18); c.lineTo(x + 40, wallTop + 54); } c.stroke();
  for (let x = -900; x < W + 900; x += 80) { c.fillStyle = '#f4efe2'; c.beginPath(); c.moveTo(x + 10, wallTop); c.lineTo(x + 40, wallTop - 34); c.lineTo(x + 70, wallTop); c.closePath(); c.fill(); }
  // roof floor
  const g = c.createLinearGradient(0, fy - 20, 0, H + 200); g.addColorStop(0, plaster); g.addColorStop(1, mix(plaster, '#5a4a38', 0.5)); c.fillStyle = g; c.fillRect(-900, fy - 30, W + 1800, H + 600);
  c.fillStyle = hexA(dk, 0.4); c.fillRect(-900, fy - 30, W + 1800, 8);
  if (o.walkers) o.walkers(c);
  if (o.light) lightFromAbove(c, T, o.lightX || 540, o.light, o.lightW || 300);
  if (o.post) o.post(c);
  if (o.dim) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(14,10,20,${0.35 * o.dim})`; c.fillRect(0, 0, W, H); c.restore(); }
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- the storytellers at night (« We made them tales », Saba 19): a camp, a fire, people sitting around an old man
function campfire36(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150);
  sky0(c, skyStops('night')); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); stars(c, T, 220, SEED36 + 130, [0, 0, W, 1200], 0.9); moon(c, 820, 360, 40, 0.7); c.restore();
  par(c, -0.8, 0, 0, () => { ridgeW(c, 1250, 140, 0.0024, SEED36 + 131, '#161828'); hazeW(c, 1290, 200, '#22243c', 0.4); });
  const g = c.createLinearGradient(0, 1300, 0, H + 200); g.addColorStop(0, '#2a2834'); g.addColorStop(1, '#14121a'); c.fillStyle = g; c.fillRect(-1600, 1300, 4300, 1500);
  [[150, 1430, 0.9, '#3a2e2a'], [880, 1420, 0.85, '#2e2a30'], [-180, 1470, 1.0, '#342a28']].forEach(([x, y, s, col], i) => bedTent(c, x, y, s, col, SEED36 + 132 + i, { lamp: 0.6 }));
  camel(c, 1050, 1500, 0.55, '#3a2e26', T * 0.2, -1, null, { walk: false, head: 0.2 });
  const fx = 540, fyy = 1700;
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, fx, fyy - 60, 700, '#ff8a3a', 0.28); c.restore();
  const ring = [[300, 1650, 1, 0], [400, 1590, 1, 1], [680, 1590, -1, 2], [790, 1650, -1, 3]];
  ring.forEach(([x, y, d, i]) => fig(c, i % 2 ? SABA36[i + 2] : (i === 0 ? BOY36 : GIRL36), { x, y, h: oH36(y) * 1.3, pose: 'sit', dir: d, t: T + i, light: 0.75, wind: 0.1, ink: 0.7, child: i === 0 || i === 3 }));
  fire(c, fx, fyy, 0.55, T);
  const old = { x: 540, y: 1560, h: oH36(1560) * 1.3, pose: 'sit', dir: 1, t: T + 5, light: 0.85, wind: 0.1, ink: 0.7, dua: false };
  if (o.teller !== false) fig(c, OLD36, old);
  [[180, 1800, 1, 4], [900, 1820, -1, 5]].forEach(([x, y, d, i]) => fig(c, SABA36[i], { x, y, h: oH36(y) * 1.3, pose: 'sit', dir: d, t: T + i, light: 0.7, wind: 0.1, ink: 0.7 }));
  smoke(c, T + 100, fx, fyy - 120, 6, SEED36 + 135, '#3a3034', 0.25, 0.8, 60); sparks(c, T + 100, fx, fyy - 80, 16, SEED36 + 136, 0.8, 0.6);
  fireLight35(c, 0.6);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- the hero shot (hook, cta, outro, cover): the storm, the dam bursting, the torrent rushing down the wadi between the two gardens
const HERO36 = Object.assign({}, STORM36, { z: 1.32, cx: 540, cy: 1235, breach: 0.62, flood: 0.3, lightning: 0, rain: 0.6 });
const hero36 = (c, T, o = {}) => { const lg = 0.8 * Math.pow(Math.max(0, Math.sin((T + 100) * 1.7) * Math.sin((T + 100) * 0.63)), 6);
  marib36(c, T, Object.assign({}, HERO36, { lightning: lg, lgX: 820, post: c2 => { birds36(c2, T, 1); } }, o)); };
// small dark birds fleeing over the valley (wing beats)
function birds36(c, T, a = 1) { if (a <= 0) return; T += 100; const r = rng(SEED36 + 140);
  for (let i = 0; i < 9; i++) { const x = ((r() * 1400 + T * (60 + r() * 40)) % 1600) - 300, y = 700 + r() * 300 + Math.sin(T * 1.3 + i) * 10, s = 0.5 + r() * 0.5, f = Math.sin(T * 12 + i * 2);
    c.strokeStyle = `rgba(30,24,30,${0.8 * a})`; c.lineWidth = 3 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 16 * s, y - f * 8 * s); c.quadraticCurveTo(x - 6 * s, y - 4 * s, x, y); c.quadraticCurveTo(x + 6 * s, y - 4 * s, x + 16 * s, y - f * 8 * s); c.stroke(); } }
function hookTexts36(c, a) { if (a <= 0) return; quote2(c, 'ILS AVAIENT TOUT…', '…ET LA DIGUE A CÉDÉ', a, 260, 84, 80); seriesTag36(c, a); }

// ---------- episode 36 scenes
const NX36 = (...a) => Object.assign({}, ...a);
// the family at the foot of a fruit tree in the garden: rug, basket of fruits, people sitting; a man picking a fruit (o.pick), o.dua = thanks
function family36(T, o = {}) { return c => { const y = 1720, h = oH36(y) * 1.0;
  rug(c, 470, y + 6, 520, 90, '#7a2a22'); basket33(c, 470, y - 40, 0.75, { fill: 1 }); bowl(c, 560, y - 30, 0.8);
  fig(c, SABA36[0], { x: 300, y: y - 10, h: h * 1.02, pose: 'sit', dir: 1, t: T, light: 1, wind: 0.2, ink: 0.7, dua: !!o.dua });
  fig(c, WOMAN36, { x: 640, y: y - 18, h: h * 0.98, pose: 'sit', dir: -1, t: T + 1, light: 1, wind: 0.2, ink: 0.7 });
  fig(c, GIRL36, { x: 420, y: y + 20, h: h * 1.0, pose: 'sit', dir: 1, t: T + 2, light: 1, wind: 0.2, ink: 0.7 });
  fruitTree36(c, 1000, y - 20, 1.05, T, SEED36 + 170, {});
  fig(c, SABA36[2], { x: 860, y: y + 30, h: h * 1.12, dir: -1, t: T + 3, light: 1, wind: 0.2, ink: 0.7, armUp: o.pick === undefined ? 0.85 : o.pick }); }; }
// the rich men at their feast on the roof terrace (o.stand = one rises and speaks; o.away = they turn their backs to the light)
function feast36(T, o = {}) { return c => { const y = 1720, h = 330;
  rug(c, 540, y + 20, 760, 120, '#5a1a2e'); [[300, 0], [540, 1], [780, 2]].forEach(([x, i]) => cushion(c, x, y - 40, 1.3, ['#8a2a3a', '#2a4a6a', '#6a4a2a'][i]));
  basket33(c, 540, y - 6, 0.9, { fill: 1, col: '#c8a060' }); ewer32(c, 650, y - 4, 0.7); bowl(c, 420, y - 2, 0.9);
  fig(c, RICH36[0], { x: 300, y: y - 30, h, pose: 'sit', dir: o.away ? -1 : 1, t: T, light: 1, wind: 0.15, ink: 0.7 });
  fig(c, RICH36[2], { x: 780, y: y - 30, h, pose: 'sit', dir: o.away ? 1 : -1, t: T + 1, light: 1, wind: 0.15, ink: 0.7 });
  if (o.stand) fig(c, RICH36[1], { x: 560, y: y - 10, h: h * 1.25, dir: 1, t: T + 2, light: 1.05, wind: 0.15, ink: 0.75, reach: o.stand });
  else fig(c, RICH36[1], { x: 560, y: y - 40, h, pose: 'sit', dir: o.away ? 1 : -1, t: T + 2, light: 1, wind: 0.15, ink: 0.7 }); }; }
// the three plants of Saba 16 up close in the dry valley (khamt left, tamarisk centre, sidr right); k = [kA, kT, kS] glow under each
function plants36(T, k = [0, 0, 0]) { return c => {
  [[560, 1690, 'T'], [210, 1800, 'K'], [880, 1780, 'S']].forEach(([x, y, w], i) => { const kk = k[w === 'K' ? 0 : w === 'T' ? 1 : 2]; if (kk > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y - 120, 260, '#ffe0a0', 0.25 * kk); c.restore(); }
    if (w === 'K') khamt36(c, x, y, 1.55, T, SEED36 + 150); else if (w === 'T') tamarisk36(c, x, y, 1.35, T, SEED36 + 151); else sidr36(c, x, y, 1.05, T, SEED36 + 152); }); }; }
// the people leaving the valley (two groups going opposite ways, camels; steps driven by the distance)
function leaving36(T, dist) { return c => {
  caravan36(c, T, dist, [[0, 0], ['C', -150], [2, -300], [3, -400]], { dir: -1, x0: 380, gy: () => 1450, h: hY36(1450) });
  caravan36(c, T, dist, [[4, 0], ['C', -170], [5, -330]], { dir: 1, x0: 700, gy: () => 1600, h: hY36(1600) }); }; }
// the dry valley where the torrent passed: dam broken, no water
const AFTER36 = Object.assign({}, DUSK36, { sky: 'dusk', to: 'grey', k: 0.45, after: 1, breach: 1, lamp: 0, town: false });
const RUINS36 = Object.assign({}, DUSK36, { after: 1, ruins: 1, town: false, lamp: 0 });

const SCENES = {
  // 1. HOOK — they had everything; Allah asked only one thing: to say thank you; they turned away… and the dam gave way (Saba 15-16)
  hook: {
    grade: 'rgba(200,190,170,0.06)',
    draw(c, t, d) {
      const tTo = at('hook', 'tout', 0, 1.0), tAl = at('hook', 'allah', 0, 1.8), tMe = at('hook', 'merci', 0, 4.4), tDe = at('hook', 'detournes', 0, 6.4), tDi = at('hook', 'digue', 0, 7.8), tCe = at('hook', 'cede', 0, 8.6);
      shots(c, t, [
        [0, (cc, q) => hero36(cc, t, { z: lerp(1.32, 1.37, ease(seg(q, 0, tTo + 0.3))), cy: lerp(1235, 1225, ease(seg(q, 0, tTo + 0.3))) })],
        [tTo + 0.3, (cc, q) => marib36(cc, t, NX36(GOLD36, { flow: 1, z: lerp(1.12, 1.18, ease(seg(q, 0, tAl - tTo))), cy: 1180 }))],
        [tAl - 0.2, (cc, q) => orchard36(cc, t, { z: lerp(1.1, 1.15, ease(seg(q, 0, tDe - tAl))), walkY: 1650, light: 0.3 * ramp(q, tMe - tAl - 0.6, 0.6), lightX: 560, lightW: 260,
          walkers: c2 => { const y = 1690; fig(c2, SABA36[3], { x: 560, y, h: oH36(y), dir: -1, t, light: 1.05, wind: 0.2, ink: 0.7, dua: q > tMe - tAl - 0.3 }); } })],
        [tDe - 0.2, (cc, q) => terrace36(cc, t, { z: lerp(1.05, 1.1, ease(seg(q, 0, tDi - tDe))), dim: 0.4 * ramp(q, 0.2, 0.8), walkers: feast36(t, { away: true }) })],
        [tDi - 0.3, (cc, q) => hero36(cc, t, { z: lerp(2.1, 2.2, ease(seg(q, 0, d - tDi))), cx: 540, cy: 1160, breach: lerp(0.35, 0.85, ease(seg(q, 0.1, 1.3))), flood: lerp(0.05, 0.25, ease(seg(q, 0.2, 2.0))), shake: 0.12 * ramp(q, 0.3, 0.3) })],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      hookTexts36(c, 1 - ramp(t, tAl - 0.4, 0.2));
      const a2 = ramp(t, tAl - 0.2, 0.25) * (1 - ramp(t, tDe - 0.4, 0.25)); quote2(c, 'UNE SEULE CHOSE :', 'DIRE MERCI', a2, 260, 72, 110 * ramp(t, tMe - 0.4, 0.3) + 0.01); seriesTag36(c, a2);
      const a3 = ramp(t, tDe - 0.2, 0.25) * (1 - ramp(t, tDi - 0.5, 0.25)); quote2(c, 'ILS SE SONT', 'DÉTOURNÉS…', a3, 260, 84, 100); seriesTag36(c, a3);
      const a4 = ramp(t, tDi - 0.3, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, '…ET LA DIGUE', 'A CÉDÉ', a4, 260, 88, 120 * ramp(t, tCe - 0.4, 0.3) + 0.01); seriesTag36(c, a4);
      caption(c, 'sourate Saba, versets 15 et 16', 520, a4 * ramp(t, tCe, 0.3), 30);
    },
  },
  // 2. the people of Saba (sura Saba, 34); the open loop: their name became a proverb the Arabs still say
  promise: {
    grade: 'rgba(255,200,160,0.07)',
    draw(c, t, d) {
      const tSa = at('promise', 'saba', 0, 2.2), tSo = at('promise', 'sourate', 0, 3.4), tRe = at('promise', 'reste', 0, 5.6), tPr = at('promise', 'proverbe', 0, 8.6), tAr = at('promise', 'arabes', 0, 9.8), tEn = at('promise', 'encore', 0, 10.8);
      shots(c, t, [
        [0, (cc, q) => marib36(cc, t, NX36(DAWN36, { flow: 1, z: lerp(1.04, 1.09, ease(seg(q, 0, tSo))), cy: lerp(1150, 1170, ease(seg(q, 0, tSo))), lamp: 0.3 }))],
        [tSo - 0.2, (cc, q) => marib36(cc, t, NX36(DAWN36, { flow: 1, z: lerp(2.0, 2.08, ease(seg(q, 0, tRe - tSo))), cx: lerp(880, 940, ease(seg(q, 0, tRe - tSo))), cy: 1210, lamp: 0.5 }))],
        [tRe - 0.2, (cc, q) => route36(cc, t, { sky: 'gold', z: lerp(1.2, 1.25, ease(seg(q, 0, tAr - tRe))), cy: 1350, px: q * 30, walkers: c2 => caravan36(c2, t, 60 + q * 70, [[0, 0], ['C', -160], [1, -320], ['C', -470]], { dir: 1, x0: 330, h: 300 }) })],
        [tAr - 0.2, (cc, q) => campfire36(cc, t, { z: lerp(1.3, 1.36, ease(seg(q, 0, d - tAr))), cy: 1420 })],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a0 = ramp(t, 0.05, 0.25) * (1 - ramp(t, tRe - 0.4, 0.25)); topShade(c, a0 * 1.3); arabic(c, 'سبأ', 250, a0, 140);
      bigWord27(c, 'LE PEUPLE DE SABA', 390, a0 * ramp(t, tSa - 0.5, 0.3), 80, '#f6c453'); caption(c, 'sourate Saba (34), versets 15 à 19', 470, a0 * ramp(t, tSo - 0.3, 0.3), 32); seriesTag36(c, a0);
      const a2 = ramp(t, tRe - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'RESTE JUSQU\'AU BOUT :', 'LEUR NOM EST DEVENU UN PROVERBE', a2, 260, 66, 54 * ramp(t, tPr - 0.8, 0.3) + 0.01);
      caption(c, 'que les Arabes disent encore', 470, a2 * ramp(t, tAr - 0.2, 0.3), 36);
    },
  },
  // 3. in Yemen, at Ma'rib according to the exegetes: a huge dam between two mountains; it held the rain water and watered the valley; its ruins still stand
  dam: {
    grade: 'rgba(255,215,170,0.07)',
    draw(c, t, d) {
      const tYe = at('dam', 'yemen', 0, 0.6), tMa = at('dam', "ma'rib", 0, 1.4), tBa = at('dam', 'bati', 0, 4.0), tDi = at('dam', 'digue', 0, 5.2), tMo = at('dam', 'montagnes', 0, 6.4), tRe = at('dam', 'retenait', 0, 7.6), tPl = at('dam', 'pluies', 0, 8.6), tAr = at('dam', 'arrosait', 0, 9.4), tVa = at('dam', 'vallee', 0, 10.4), tRu = at('dam', 'ruines', 0, 11.6), tDe = at('dam', 'debout', 0, 12.8);
      shots(c, t, [
        [0, (cc, q) => map36(cc, t, { z: lerp(1.05, 1.55, ease(seg(q, 0, tBa))), cx: lerp(560, 780, ease(seg(q, 0, tBa))), cy: lerp(1150, 1560, ease(seg(q, 0, tBa))) })],
        [tBa - 0.2, (cc, q) => marib36(cc, t, NX36(DAY36, { z: lerp(2.3, 2.3, 0), cx: lerp(330, 760, ease(seg(q, 0, tRe - tBa))), cy: 1120 }))],
        [tRe - 0.2, (cc, q) => marib36(cc, t, NX36(DAY36, { sky: 'grey', to: 'day', k: 0.3, sunA: 0, z: lerp(1.5, 1.56, ease(seg(q, 0, tAr - tRe))), cy: 1060, rain: ramp(q, 0, 0.4) * (1 - ramp(q, tAr - tRe - 0.5, 0.4)) }))],
        [tAr - 0.2, (cc, q) => marib36(cc, t, NX36(DAY36, { flow: ramp(q, 0, 0.6), z: lerp(1.14, 1.08, ease(seg(q, 0, tRu - tAr))), cy: lerp(1240, 1200, ease(seg(q, 0, tRu - tAr))) }))],
        [tRu - 0.2, (cc, q) => marib36(cc, t, NX36(RUINS36, { z: lerp(1.6, 1.66, ease(seg(q, 0, d - tRu))), cx: 420, cy: 1130 }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tBa - 0.4, 0.25)); quote2(c, 'AU YÉMEN,', 'À MA\'RIB', a1, 260, 84, 104 * ramp(t, tMa - 0.5, 0.3) + 0.01); caption(c, 'selon les exégètes', 470, a1 * ramp(t, tMa, 0.3), 34);
      const a2 = ramp(t, tBa - 0.2, 0.25) * (1 - ramp(t, tRe - 0.4, 0.25)); quote2(c, 'UNE IMMENSE DIGUE', 'ENTRE DEUX MONTAGNES', a2, 260, 80, 72 * ramp(t, tMo - 0.6, 0.3) + 0.01);
      const a3 = ramp(t, tRe - 0.2, 0.25) * (1 - ramp(t, tAr - 0.4, 0.25)); quote2(c, 'ELLE RETENAIT', 'L\'EAU DES PLUIES', a3, 260, 84, 92 * ramp(t, tPl - 0.6, 0.3) + 0.01);
      const a4 = ramp(t, tAr - 0.2, 0.25) * (1 - ramp(t, tRu - 0.4, 0.25)); quote2(c, 'ET ARROSAIT', 'TOUTE LA VALLÉE', a4, 260, 84, 92 * ramp(t, tVa - 0.6, 0.3) + 0.01);
      const a5 = ramp(t, tRu - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'SES RUINES', 'SONT ENCORE DEBOUT', a5, 260, 92, 80 * ramp(t, tDe - 0.6, 0.3) + 0.01); caption(c, 'Ma\'rib, Yémen — aujourd\'hui', 470, a5, 32);
    },
  },
  // 4. « two gardens, on the right and on the left » (Saba 15); according to the reports (Qatada), a woman walked under the trees with a basket on her head and it filled with fruit
  gardens: {
    grade: 'rgba(255,220,170,0.07)',
    draw(c, t, d) {
      const tCo = at('gardens', 'coran', 0, 0.6), tDe = at('gardens', 'deux', 0, 1.4), tDr = at('gardens', 'droite', 0, 3.0), tGa = at('gardens', 'gauche', 0, 4.4), tRe = at('gardens', 'recits', 0, 5.8), tFe = at('gardens', 'femme', 0, 6.8), tPa = at('gardens', 'panier', 0, 9.0), tTe = at('gardens', 'tete', 0, 9.8), tRm = at('gardens', 'remplissait', 0, 11.0), tFr = at('gardens', 'fruits', 0, 12.0);
      const t0 = tRe - 0.2, NF = 8, drops = [...Array(NF).keys()].map(i => tTe - t0 + 0.2 + i * Math.max(0.3, (tFr - tTe + 0.6) / NF));
      shots(c, t, [
        [0, (cc, q) => marib36(cc, t, NX36(GOLD36, { flow: 1, z: lerp(1.2, 1.26, ease(seg(q, 0, t0))), cy: lerp(1250, 1270, ease(seg(q, 0, t0))),
          post: c2 => { sideGlow36(c2, 1, ramp(q, tDr - 0.4, 0.4) * (1 - ramp(q, tGa - 0.3, 0.6) * 0.5)); sideGlow36(c2, 0, ramp(q, tGa - 0.4, 0.4)); } }))],
        [t0, (cc, q) => { const dist = 40 + q * 85, x = -40 + dist, y = 1700, h = oH36(y), wo = { x, y, h, dir: 1, t, light: 1.05, wind: 0.2, ink: 0.7, walk: stepOf(dist, h) };
          orchard36(cc, t, { z: 1.12, cx: lerp(380, 560, ease(seg(q, 0, d - t0))), cy: 1360, walkY: 1690, canopy: 880, walkers: c2 => {
            const fill = drops.filter(td => q > td + 0.55).length / NF; basketWoman36(c2, t, wo, fill);
            const [hx, hy, hr] = headOf(wo); drops.forEach((td, i) => { const p = (q - td) / 0.55; if (p > 0 && p < 1) { const xx = hx + (i % 3 - 1) * 14 + dist * 0, s = h / 300; fallingFruit36(c2, hx + (i % 3 - 1) * 12 * s, hy - hr * 1.9, s, p, ['#e2862a', '#c8402a', '#e8a832'][i % 3], 860); } }); } }); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, t0 - 0.2, 0.25)); topShade(c, a1 * 1.3); arabic(c, 'جنتان عن يمين وشمال', 230, a1, 84); bigWord27(c, 'DEUX JARDINS', 350, a1 * ramp(t, tDe - 0.5, 0.3), 92, '#f6c453');
      bigWord27(c, 'L\'UN À DROITE, L\'AUTRE À GAUCHE', 445, a1 * ramp(t, tDr - 0.6, 0.3), 50); caption(c, 'Saba, verset 15', 510, a1, 28);
      const a2 = ramp(t, t0, 0.25) * (1 - ramp(t, tPa - 0.4, 0.25)); quote2(c, 'SELON LES RÉCITS,', 'UNE FEMME SOUS LES ARBRES', a2, 260, 70, 64 * ramp(t, tFe - 0.6, 0.3) + 0.01); caption(c, 'Qatada, cité par les exégètes', 470, a2, 30);
      const a3 = ramp(t, tPa - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'UN PANIER SUR LA TÊTE…', '…QUI SE REMPLISSAIT', a3, 260, 66, 84 * ramp(t, tRm - 0.6, 0.3) + 0.01);
    },
  },
  // 5. « Eat from the provision of your Lord and be grateful to Him: a good land, and a forgiving Lord » (Saba 15)
  command: {
    grade: 'rgba(255,215,170,0.07)',
    draw(c, t, d) {
      const tMa = at('command', 'mangez', 0, 1.4), tSe = at('command', 'seigneur', 0, 3.0), tRe = at('command', 'reconnaissants', 0, 5.4), tBo = at('command', 'bonne', 0, 7.2), tCo = at('command', 'contree', 0, 7.8), tPa = at('command', 'pardonne', 0, 10.2);
      shots(c, t, [
        [0, (cc, q) => orchard36(cc, t, { z: lerp(1.15, 1.2, ease(seg(q, 0, tRe))), cy: 1420, walkY: 1690, light: 0.22 * ramp(q, tSe - 0.4, 0.8), lightX: 520, lightW: 320, walkers: family36(t, { pick: lerp(0.4, 0.95, ease(seg(q, 0.3, 2.0))) }) })],
        [tRe - 0.2, (cc, q) => orchard36(cc, t, { z: lerp(1.9, 1.96, ease(seg(q, 0, tBo - tRe))), cx: 380, cy: 1560, walkY: 1690, light: 0.3, lightX: 320, lightW: 220, walkers: family36(t, { dua: true, pick: 0.6 }) })],
        [tBo - 0.2, (cc, q) => marib36(cc, t, NX36(GOLD36, { flow: 1, lamp: 0.4, z: lerp(1.05, 1.1, ease(seg(q, 0, d - tBo))), cy: lerp(1170, 1150, ease(seg(q, 0, d - tBo))), light: 0.18 * ramp(q, tPa - tBo - 0.6, 0.8), lightX: 540, lightW: 520 }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tBo - 0.4, 0.25)); topShade(c, a1 * 1.3); arabic(c, 'كلوا من رزق ربكم واشكروا له', 230, a1, 70);
      bigWord27(c, '« MANGEZ DE CE QUE VOTRE SEIGNEUR', 340, a1 * ramp(t, tMa - 0.4, 0.3), 44); bigWord27(c, 'VOUS DONNE…', 410, a1 * ramp(t, tMa - 0.2, 0.3), 56); bigWord27(c, 'ET SOYEZ-LUI RECONNAISSANTS »', 490, a1 * ramp(t, tRe - 0.6, 0.3), 54, '#f6c453');
      const a2 = ramp(t, tBo - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); topShade(c, a2 * 1.3); arabic(c, 'بلدة طيبة ورب غفور', 230, a2, 92); bigWord27(c, '« UNE BONNE CONTRÉE,', 350, a2 * ramp(t, tCo - 0.6, 0.3), 70); bigWord27(c, 'ET UN SEIGNEUR QUI PARDONNE »', 440, a2 * ramp(t, tPa - 0.8, 0.3), 56, '#f6c453'); caption(c, 'Saba, verset 15', 505, a2, 28);
    },
  },
  // 6. between them and the blessed lands (ash-Sham) visible towns at measured stages; « travel there by night and by day in safety » (Saba 18)
  route: {
    grade: 'rgba(255,210,170,0.07)',
    draw(c, t, d) {
      const tTe = at('route', 'terres', 0, 1.0), tCh = at('route', 'cham', 0, 2.0), tVi = at('route', 'villages', 0, 3.8), tVs = at('route', 'visibles', 0, 4.6), tDi = at('route', 'distance', 0, 5.6), tVo = at('route', 'voyageait', 0, 7.4), tNu = at('route', 'nuit', 0, 8.4), tJo = at('route', 'jour', 0, 9.4), tSe = at('route', 'securite', 0, 10.4);
      shots(c, t, [
        [0, (cc, q) => map36(cc, t, { z: lerp(1.0, 1.04, ease(seg(q, 0, tVo))), cy: lerp(1140, 1120, ease(seg(q, 0, tVo))), towns: ease(seg(q, tVi - 0.3, tDi + 0.6)) })],
        [tVo - 0.2, (cc, q) => route36(cc, t, { night: 1, z: lerp(1.25, 1.3, ease(seg(q, 0, tJo - tVo))), cy: 1360, px: q * 30, walkers: c2 => caravan36(c2, t, 80 + q * 70, [[0, 0], ['C', -150], [1, -300], ['C', -450]], { dir: 1, x0: 380, h: 300, night: 1, lantern: 0 }) })],
        [tJo - 0.2, (cc, q) => route36(cc, t, { z: lerp(1.25, 1.3, ease(seg(q, 0, d - tJo))), cy: 1360, px: 30 + q * 30, walkers: c2 => caravan36(c2, t, 160 + q * 70, [[2, 0], ['C', -150], [5, -300], ['C', -450], [6, -590]], { dir: 1, x0: 360, h: 300 }) })],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tVi - 0.4, 0.25)); quote2(c, 'LES TERRES BÉNIES', 'DU CHAM', a1, 260, 80, 100 * ramp(t, tCh - 0.5, 0.3) + 0.01); caption(c, 'Saba, verset 18', 470, a1, 30);
      const a2 = ramp(t, tVi - 0.2, 0.25) * (1 - ramp(t, tVo - 0.4, 0.25)); quote2(c, 'DES VILLAGES BIEN VISIBLES', 'À DISTANCE MESURÉE', a2, 260, 60, 76 * ramp(t, tDi - 0.6, 0.3) + 0.01);
      const a3 = ramp(t, tVo - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'DE NUIT COMME DE JOUR,', 'EN SÉCURITÉ', a3 * ramp(t, tNu - 0.4, 0.3), 260, 68, 100 * ramp(t, tSe - 0.6, 0.3) + 0.01);
    },
  },
  // 7. but they turned away and forgot the One who gave them everything; they even said « our Lord, lengthen the distance between our journeys »; they wronged themselves (Saba 16, 19)
  ingrat: {
    grade: 'rgba(230,200,180,0.06)',
    draw(c, t, d) {
      const tDe = at('ingrat', 'detournerent', 0, 0.8), tOu = at('ingrat', 'oublierent', 0, 2.2), tTo = at('ingrat', 'tout', 0, 4.0), tDi = at('ingrat', 'dirent', 0, 5.0), tSe = at('ingrat', 'seigneur', 0, 6.0), tAl = at('ingrat', 'allonge', 0, 6.8), tEt = at('ingrat', 'etapes', 0, 8.8), tTr = at('ingrat', 'tort', 0, 10.6);
      shots(c, t, [
        [0, (cc, q) => terrace36(cc, t, { z: lerp(1.1, 1.16, ease(seg(q, 0, tDi))), cy: 1350, light: 0.3 * (1 - ramp(q, tDe - 0.2, 1.2)), lightX: 540, lightW: 380, dim: 0.5 * ramp(q, tOu - 0.3, 1.0), walkers: feast36(t, { away: q > tDe + 0.2 }) })],
        [tDi - 0.2, (cc, q) => terrace36(cc, t, { z: lerp(1.5, 1.56, ease(seg(q, 0, tAl - tDi + 0.6))), cx: 560, cy: 1400, dim: 0.35, walkers: feast36(t, { stand: lerp(0.3, 0.75, ease(seg(q, 0.3, 1.0))) }) })],
        [tAl + 0.4, (cc, q) => map36(cc, t, { z: lerp(1.0, 1.04, ease(seg(q, 0, tTr - tAl))), cy: 1130, towns: 1, gaps: ease(seg(q, 0.4, tEt - tAl + 0.4)) })],
        [tTr - 0.4, (cc, q) => marib36(cc, t, NX36(GOLD36, { sky: 'gold', to: 'grey', k: ease(seg(q, 0, 2)), sunA: 0.5 * (1 - ramp(q, 0, 1.5)), storm: 0.7 * ease(seg(q, 0, 2.2)), z: lerp(1.15, 1.2, ease(seg(q, 0, d - tTr))), cy: 1180 }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tDi - 0.4, 0.25)); quote2(c, 'ILS SE DÉTOURNÈRENT', '', a1, 270, 82); bigWord27(c, 'ET OUBLIÈRENT CELUI', 380, a1 * ramp(t, tOu - 0.4, 0.3), 64); bigWord27(c, 'QUI LEUR DONNAIT TOUT', 460, a1 * ramp(t, tTo - 0.9, 0.3), 64, '#f6c453');
      const a2 = ramp(t, tDi - 0.2, 0.25) * (1 - ramp(t, tTr - 0.5, 0.25)); topShade(c, a2 * 1.3); arabic(c, 'ربنا باعد بين أسفارنا', 230, a2, 92); bigWord27(c, '« SEIGNEUR, ALLONGE LES DISTANCES', 345, a2 * ramp(t, tAl - 0.6, 0.3), 46); bigWord27(c, 'ENTRE NOS ÉTAPES »', 425, a2 * ramp(t, tEt - 0.8, 0.3), 70, '#f6c453'); caption(c, 'Saba, verset 19', 490, a2, 28);
      const a3 = ramp(t, tTr - 0.4, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'ILS SE FIRENT DU TORT', 'À EUX-MÊMES', a3, 260, 70, 100);
    },
  },
  // 8. the flood of the dam (sayl al-'arim, Saba 16); according to some reports rats had gnawed its foot; the water carried away the trees, the fields… everything
  flood: {
    grade: 'rgba(190,190,200,0.06)',
    draw(c, t, d) {
      const tEn = at('flood', 'envoya', 0, 1.0), tTo = at('flood', 'torrent', 0, 2.6), tDi = at('flood', 'digue', 0, 3.4), tRe = at('flood', 'recits', 0, 4.8), tRa = at('flood', 'rats', 0, 5.6), tRo = at('flood', 'ronge', 0, 6.6), tBa = at('flood', 'base', 0, 7.2), tEa = at('flood', 'eau', 0, 8.4), tEm = at('flood', 'emporta', 0, 8.8), tAr = at('flood', 'arbres', 0, 9.6), tCh = at('flood', 'champs', 0, 10.4), tTt = at('flood', 'tout', 0, 11.6);
      shots(c, t, [
        [0, (cc, q) => marib36(cc, t, NX36(STORM36, { z: lerp(1.2, 1.28, ease(seg(q, 0, tRe))), cy: lerp(1120, 1140, ease(seg(q, 0, tRe))), lightning: 0.9 * Math.max(seg(q, tTo - 0.2, tTo) * (1 - seg(q, tTo, tTo + 0.35)), seg(q, 0.2, 0.3) * (1 - seg(q, 0.3, 0.6))), lgX: 760, flash: 0 }))],
        [tRe - 0.2, (cc, q) => damClose36(cc, t, { z: lerp(1.15, 1.25, ease(seg(q, 0, tEa - tRe))), cy: lerp(1300, 1380, ease(seg(q, 0, tEa - tRe))), leak: ease(seg(q, tRo - tRe - 0.2, tEa - tRe)), crack: ease(seg(q, tBa - tRe - 0.3, tEa - tRe + 0.2)), shake: 0.04 * ramp(q, tBa - tRe, 0.5) })],
        [tEa - 0.4, (cc, q) => marib36(cc, t, NX36(STORM36, { z: lerp(2.3, 2.1, ease(seg(q, 0, tAr - tEa + 0.4))), cx: 540, cy: 1140, crack: 1, breach: ease(seg(q, 0.05, 1.1)), flood: lerp(0, 0.08, ease(seg(q, 0.4, 1.4))), shake: 0.18 * (1 - ramp(q, 0.8, 1.2)) }))],
        [tAr - 0.3, (cc, q) => marib36(cc, t, NX36(STORM36, { z: lerp(1.12, 1.08, ease(seg(q, 0, d - tAr))), cy: 1180, breach: 1, flood: lerp(0.15, 1.0, ease(seg(q, 0, tTt - tAr + 0.6))), shake: 0.06 * (1 - ramp(q, tTt - tAr + 0.3, 1.0)), tint: `rgba(10,10,18,${0.35 * ramp(q, tTt - tAr, 0.8)})` }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, tEn - 0.3, 0.25) * (1 - ramp(t, tRe - 0.4, 0.25)); topShade(c, a1 * 1.3); arabic(c, 'سيل العرم', 240, a1 * ramp(t, tTo - 0.4, 0.3), 120); bigWord27(c, 'LE TORRENT DE LA DIGUE', 380, a1 * ramp(t, tTo - 0.4, 0.3), 72, '#f6c453'); caption(c, 'Saba, verset 16', 450, a1, 30);
      const a2 = ramp(t, tRe - 0.2, 0.25) * (1 - ramp(t, tEa - 0.5, 0.25)); quote2(c, 'SELON CERTAINS RÉCITS,', 'DES RATS EN RONGEAIENT LA BASE', a2, 260, 66, 54 * ramp(t, tRa - 0.5, 0.3) + 0.01); caption(c, 'Wahb ibn Munabbih, cité par Ibn Kathir', 470, a2, 30);
      const a3 = ramp(t, tEm - 0.3, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'L\'EAU EMPORTA LES ARBRES,', 'LES CHAMPS…', a3, 260, 62, 84 * ramp(t, tCh - 0.5, 0.3) + 0.01);
      bigWord27(c, 'TOUT', 480, a3 * ramp(t, tTt - 0.3, 0.3), 130, '#f6c453');
    },
  },
  // 9. in place of the two gardens: bitter fruit, tamarisks and a few lote trees (Saba 16); the people scattered across Arabia; the Aws and Khazraj of Medina came from there (historians)
  after: {
    grade: 'rgba(230,200,170,0.07)',
    draw(c, t, d) {
      const tPl = at('after', 'place', 0, 0.6), tJa = at('after', 'jardins', 0, 1.6), tCo = at('after', 'coran', 0, 2.4), tAm = at('after', 'amers', 0, 3.8), tTa = at('after', 'tamaris', 0, 4.6), tJu = at('after', 'jujubiers', 0, 6.0), tPe = at('after', 'peuple', 0, 7.4), tDs = at('after', 'dispersa', 0, 8.2), tAr = at('after', 'arabie', 0, 9.4), tHi = at('after', 'historiens', 0, 10.6), tAw = at('after', 'aws', 0, 11.6), tKh = at('after', 'khazraj', 0, 12.4), tMd = at('after', 'medine', 0, 13.2);
      shots(c, t, [
        [0, (cc, q) => marib36(cc, t, NX36(AFTER36, { z: lerp(1.08, 1.12, ease(seg(q, 0, tCo))), cy: 1160 }))],
        [tCo - 0.2, (cc, q) => marib36(cc, t, NX36(AFTER36, { z: lerp(1.0, 1.04, ease(seg(q, 0, tPe - tCo))), cy: 1330, maxY: 1420, post: plants36(t, [ramp(q, tAm - tCo - 0.3, 0.4), ramp(q, tTa - tCo - 0.3, 0.4), ramp(q, tJu - tCo - 0.3, 0.4)]) }))],
        [tPe - 0.2, (cc, q) => marib36(cc, t, NX36(AFTER36, { z: lerp(1.3, 1.34, ease(seg(q, 0, tAr - tPe))), cy: 1330, walkers: leaving36(t, 40 + q * 60) }))],
        [tAr - 0.2, (cc, q) => map36(cc, t, { z: lerp(1.0, 1.04, ease(seg(q, 0, tAw - tAr))), cy: 1130, disperse: ease(seg(q, 0, tAw - tAr)) })],
        [tAw - 0.3, (cc, q) => map36(cc, t, { z: lerp(1.04, 1.5, ease(seg(q, 0, 1.4))), cx: lerp(540, 560, ease(seg(q, 0, 1.4))), cy: lerp(1130, 1080, ease(seg(q, 0, 1.4))), disperse: 1, medina: ramp(q, tMd - tAw - 0.6, 0.5) })],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tCo - 0.4, 0.25)); quote2(c, 'À LA PLACE', 'DES DEUX JARDINS…', a1, 260, 88, 88 * ramp(t, tJa - 0.6, 0.3) + 0.01);
      const a2 = ramp(t, tCo - 0.2, 0.25) * (1 - ramp(t, tPe - 0.4, 0.25)); topShade(c, a2 * 1.3); arabic(c, 'أكل خمط وأثل وشيء من سدر قليل', 230, a2, 64); caption(c, 'Saba, verset 16', 300, a2, 28);
      [['FRUITS AMERS', 240, 1180, tAm], ['TAMARIS', 560, 800, tTa], ['JUJUBIERS', 860, 1020, tJu]].forEach(([w, x, y, tw]) => { const a = a2 * ramp(t, tw - 0.3, 0.3); if (a > 0) textGlow(c, w, x, y, '700 48px Lora', '#f6c453', a, '#000', 16); });
      const a3 = ramp(t, tPe - 0.2, 0.25) * (1 - ramp(t, tHi - 0.4, 0.25)); quote2(c, 'LE PEUPLE SE DISPERSA', 'DANS TOUTE L\'ARABIE', a3, 260, 70, 76 * ramp(t, tAr - 0.6, 0.3) + 0.01);
      const a4 = ramp(t, tHi - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'LES AWS ET LES KHAZRAJ', 'DE MÉDINE VENAIENT DE LÀ', a4 * ramp(t, tAw - 0.5, 0.3), 260, 66, 60 * ramp(t, tMd - 0.6, 0.3) + 0.01); caption(c, 'selon les historiens', 470, a4, 32);
    },
  },
  // 10. the promise kept: « We made them tales » (Saba 19); the Arabs still say « they scattered like Saba » (tafarraqū aydī Saba')
  proverb: {
    grade: 'rgba(255,190,150,0.07)',
    draw(c, t, d) {
      const tDt = at('proverb', 'dit', 0, 0.6), tRe = at('proverb', 'recits', 0, 2.2), tAu = at('proverb', "aujourd'hui", 0, 3.4), tEp = at('proverb', 'eparpilles', 0, 6.4), tAr = at('proverb', 'arabes', 0, 7.6), tDs = at('proverb', 'disperses', 0, 9.4), tSa = at('proverb', 'saba', 0, 10.4);
      shots(c, t, [
        [0, (cc, q) => campfire36(cc, t, { z: lerp(1.35, 1.42, ease(seg(q, 0, tAu))), cy: 1460 })],
        [tAu - 0.2, (cc, q) => route36(cc, t, { sky: 'gold', z: lerp(1.2, 1.25, ease(seg(q, 0, tAr - tAu))), cy: 1360, walkers: c2 => { caravan36(c2, t, 40 + q * 60, [[0, 0], ['C', -150], [1, -290]], { dir: -1, x0: 540, h: 300 }); caravan36(c2, t, 40 + q * 60, [[3, 0], ['C', -150]], { dir: 1, x0: 640, h: 320, gy: () => rY36 + 60 }); } })],
        [tAr - 0.2, (cc, q) => marib36(cc, t, NX36(RUINS36, { z: lerp(1.25, 1.3, ease(seg(q, 0, d - tAr))), cy: 1180 }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tAu - 0.4, 0.25)); topShade(c, a1 * 1.3); arabic(c, 'فجعلناهم أحاديث', 240, a1, 104); bigWord27(c, '« NOUS EN FÎMES', 370, a1 * ramp(t, tDt, 0.3), 76); bigWord27(c, 'DES RÉCITS »', 460, a1 * ramp(t, tRe - 0.5, 0.3), 88, '#f6c453');
      const a2 = ramp(t, tAu - 0.2, 0.25) * (1 - ramp(t, tAr - 0.4, 0.25)); quote2(c, 'AUJOURD\'HUI ENCORE…', '', a2, 270, 84);
      const a3 = ramp(t, tAr - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); topShade(c, a3 * 1.6); arabic(c, 'تفرقوا أيدي سبأ', 250, a3 * ramp(t, tDs - 0.6, 0.4), 120); bigWord27(c, '« ILS SE SONT DISPERSÉS', 390, a3 * ramp(t, tDs - 0.5, 0.3), 70); bigWord27(c, 'COMME SABA »', 485, a3 * ramp(t, tSa - 0.5, 0.3), 100, '#f6c453'); caption(c, 'proverbe arabe', 550, a3 * ramp(t, tDs - 0.3, 0.3), 30);
    },
  },
  // 11. the lesson: « in this are signs for every patient, grateful one » (Saba 19); what keeps a blessing is not a dam: it is gratitude
  lesson: {
    grade: 'rgba(255,215,170,0.08)',
    draw(c, t, d) {
      const tCo = at('lesson', 'conclut', 0, 1.0), tSi = at('lesson', 'signes', 0, 2.6), tPa = at('lesson', 'patient', 0, 4.4), tRe = at('lesson', 'reconnaissant', 0, 5.4), tGa = at('lesson', 'garde', 0, 7.0), tBi = at('lesson', 'bienfait', 0, 7.8), tDi = at('lesson', 'digue', 0, 9.4), tMe = at('lesson', 'merci', 0, 10.8);
      shots(c, t, [
        [0, (cc, q) => marib36(cc, t, NX36(RUINS36, DAWN36, { after: 1, ruins: 1, town: false, z: lerp(1.08, 1.13, ease(seg(q, 0, tGa))), cy: 1170, light: 0.2 * ramp(q, tSi - 0.4, 1), lightX: 820, lightW: 400 }))],
        [tGa - 0.2, (cc, q) => marib36(cc, t, NX36(RUINS36, DAWN36, { after: 1, ruins: 1, town: false, z: lerp(2.2, 2.3, ease(seg(q, 0, tMe - tGa))), cx: 360, cy: 1110 }))],
        [tMe - 0.9, (cc, q) => orchard36(cc, t, { dawn: 1, z: lerp(1.3, 1.25, ease(seg(q, 0, d - tMe + 0.9))), cy: 1460, walkY: 1690, light: 0.35, lightX: 540, lightW: 260,
          walkers: c2 => { rug(c2, 540, 1790, 380, 70, '#2a4a3a'); fig(c2, SABA36[0], { x: 490, y: 1780, h: oH36(1780) * 1.1, pose: 'prostrate', dir: 1, t, light: 1.1, wind: 0.1, ink: 0.7 }); } })],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tGa - 0.4, 0.25)); topShade(c, a1 * 1.3); arabic(c, 'إن في ذلك لآيات لكل صبار شكور', 230, a1, 60);
      bigWord27(c, 'DES SIGNES POUR TOUT HOMME', 340, a1 * ramp(t, tSi - 0.4, 0.3), 56); bigWord27(c, 'PATIENT ET RECONNAISSANT', 430, a1 * ramp(t, tPa - 0.4, 0.3), 64, '#f6c453'); caption(c, 'Saba, verset 19', 495, a1, 28);
      const a2 = ramp(t, tGa - 0.2, 0.25) * (1 - ramp(t, tMe - 1.2, 0.25)); quote2(c, 'CE QUI GARDE UN BIENFAIT,', 'CE N\'EST PAS UNE DIGUE', a2, 260, 62, 70 * ramp(t, tDi - 0.6, 0.3) + 0.01);
      const a3 = ramp(t, tMe - 0.9, 0.25) * (1 - seg(t, d - 0.4, d)); topShade(c, a3 * 1.4); bigWord27(c, 'C\'EST', 300, a3, 90); bigWord27(c, 'LE MERCI', 430, a3 * ramp(t, tMe - 0.4, 0.3), 140, '#f6c453');
    },
  },
  cta: {
    grade: 'rgba(200,190,170,0.06)',
    draw(c, t, d) {
      hero36(c, 60 + t, { z: lerp(1.37, 1.34, seg(t, 0, d)), cy: lerp(1225, 1232, seg(t, 0, d)) });
      c.fillStyle = 'rgba(6,8,18,0.3)'; c.fillRect(0, 0, W, H);
      ctaText36(c, seg(t, 0.1, 0.6));
    },
  },
  // the last frame dissolves into the first (hook)
  outro: {
    grade: 'rgba(200,190,170,0.06)',
    draw(c, t, d) {
      const back = seg(t, d - 0.8, d);
      if (back <= 0) { const cd = ((window.TL.scenes || []).find(s => s.id === 'cta') || { dur: 6 }).dur; hero36(c, 60 + cd + t, { z: lerp(1.34, 1.32, seg(t, 0, d - 0.8)), cy: lerp(1232, 1235, seg(t, 0, d - 0.8)) }); }
      else hero36(c, 0, {});
      const k = 1 - seg(t, d - 2.0, d - 1.2);
      c.fillStyle = `rgba(6,8,18,${0.3 * k})`; c.fillRect(0, 0, W, H);
      ctaText36(c, k);
      flashW(c, 0.3 * Math.sin(Math.PI * clamp((t - (d - 1.6)) / 1.6)));
      const a = seg(t, d - 0.8, d - 0.1); if (a > 0) { c.save(); c.globalAlpha = a; hookTexts36(c, 1); c.restore(); }
    },
  },
  cover: {
    draw(c) {
      hero36(c, 0.4, { z: 1.7, cx: 540, cy: 1190, breach: 0.75, flood: 0.35 });
      const g = c.createLinearGradient(0, 0, 0, 820); g.addColorStop(0, 'rgba(6,8,18,0.88)'); g.addColorStop(1, 'rgba(6,8,18,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 820);
      seriesTag36(c, 1);
      textS(c, 'ILS AVAIENT TOUT', 250, 1, '700 100px Lora', 100, '#fff6e0', 24);
      textGlow(c, 'SAUF LE MERCI', W / 2, 372, '700 104px Lora', '#f6c453', 1, '#000', 24);
      textGlow(c, 'et la digue a cédé', W / 2, 475, 'italic 500 56px Lora', '#fff3dc', 1, '#000', 20);
      const g2 = c.createLinearGradient(0, 1420, 0, H); g2.addColorStop(0, 'rgba(6,8,18,0)'); g2.addColorStop(1, 'rgba(6,8,18,0.85)'); c.fillStyle = g2; c.fillRect(0, 1420, W, 500);
      arabic(c, 'سيل العرم', 1650, 1, 120);
      textGlow(c, 'La digue de Saba', W / 2, 1790, 'italic 500 54px Lora', '#fff3dc', 1, '#000', 14);
    },
  },
};
