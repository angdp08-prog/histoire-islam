// Episode 24 — Al-Yasa' (alayhi salam). Qur'an: "And Ismail, Al-Yasa', Yunus and Lut: each of them We favoured over the worlds" (Al-An'am 86);
// "And remember Ismail, Al-Yasa' and Dhul-Kifl: each of them among the best" (Sad 48). His name is written only in these two places.
// Historians (signalled as such): a descendant of Yusuf who grew up beside Ilyas and followed him; they hid together in the mountain near Damascus
// (Mount Qasiyun, according to some narrations); when Ilyas left his people he left Al-Yasa' in his place, and Allah made him a prophet.
// Al-Hasan al-Basri (narrated by Qatada, cited by Ibn Kathir, Qisas al-Anbiya): "After Ilyas came Al-Yasa'; he remained among them as long as
// Allah willed, calling them to Allah, holding to the way and law of Ilyas, until Allah took him." His successor Dhul-Kifl: narration of
// Mujahid (episode 23). Al-Yasa' and Ilyas are white silhouettes whose faces are hidden by a veil of white light (prophet: true); everyone else is
// faceless. The idol is a statue (no face). Allah is never depicted: light and calligraphy only.
// Events are synced to the narration with at(scene, word). The last frame (outro) dissolves into the first frame (hook): the video loops.
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
function topShade(c, a = 1) { const g = c.createLinearGradient(0, 0, 0, 660); g.addColorStop(0, `rgba(10,6,4,${Math.min(0.85, 0.7 * a)})`); g.addColorStop(0.55, `rgba(10,6,4,${Math.min(0.5, 0.4 * a)})`); g.addColorStop(1, "rgba(10,6,4,0)"); c.fillStyle = g; c.fillRect(0, 0, W, 660); } // stronger: titles over snowy peaks
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
  stars(c, t, 170, 2121, [-300, -300, W + 600, 1100], 0.9); moon(c, 860, 640, 40, 0.95, 0.5);
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
// ---------- episode 24: Al-Yasa'
// =====================================================================================================================
const YASY = Object.assign({}, YASA, { robe: '#ebe5d4', wrap: '#f8f4ea', trim: '#d8c080', veilGlow: 0.42 }); // Al-Yasa' young, at Ilyas' side
const YAS = Object.assign({}, YASA, { veilGlow: 0.42 }); // Al-Yasa' grown, then old (staff)
function seriesTag24(c, a) { seriesTag(c, a, 24); }

// the hero image (hook / cta / outro / cover): Al-Yasa' alone on the high spur at dawn, the valley and the city of the idol far below
function yaHero(c, T, o = {}) {
  const z = o.z || 1, cx = o.cx || 540, cy = o.cy || 1200;
  cam(c, z + 0.004 * Math.sin(T * 0.3), cx, cy);
  lebanon(c, T, { sky: 'dawn', to: 'gold', k: o.gold || 0.35, sunX: 820, sunY: 1010, sunA: 0.95, fy: 1340, haze: '#f0c8a8', city: cityIdol({ x: 800, y: 1334, s: 0.3, lamp: 0.35, fire: 0.6 }) });
  flock(c, T, 640 + T * 14, 700 - T * 2, 6, 0.8, 2401);
  spur(c, T, { cedarX: 1000, cedarS: 1.5 });
  const h = o.h || 500, x = o.x || 360;
  const hal = o.halo === undefined ? 0.6 : o.halo;
  if (hal > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x + 10, spurY(x) - h * 0.75, h * 1.2, '#fff2d0', 0.28 * hal); c.restore(); rays(c, x, spurY(x) - h * 2.2, Math.PI / 2, 0.45, h * 2.6, 8, '#fff6e0', 0.06 * hal, T, 2402); }
  fig(c, YAS, { x, y: spurY(x), h, dir: o.dir || 1, staff: !(o.armUp > 0) && !(o.reach > 0), armUp: o.armUp || 0, reach: o.reach || 0, light: 1.05, t: T, wind: 0.6, veilGlow: o.veil || 0.4 });
  if (o.fg !== false) blurred(c, 10, () => { cedar(c, -150, 2350, 3.6, '#1e2a1a', T, 2403); });
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// the two of them on the spur (master and disciple): Ilyas ahead, the young Al-Yasa' a few steps behind; dist drives the steps
function pairWalk(c, T, dist, o = {}) {
  const h = o.h || 470, x1 = (o.x0 || 120) + dist, x2 = x1 - (o.gap || 190);
  const sky = o.sky || 'gold';
  lebanon(c, T, { sky, to: o.to, k: o.k || 0, sunX: o.sunX === undefined ? 860 : o.sunX, sunY: o.sunY === undefined ? 980 : o.sunY, sunA: 0.9, fy: 1340, haze: o.haze || '#f2d0b0', px: o.px || 0,
    city: o.city === false ? null : cityIdol({ x: 820, y: 1334, s: 0.3, lamp: 0.3, fire: 0.5 }) });
  spur(c, T, { cedarX: o.cedarX || 1010, cedarS: 1.4 });
  fig(c, YASY, { x: x2, y: spurY(x2), h: h * 0.93, dir: 1, walk: stepOf(dist, h * 0.93) + 0.5, light: 1, t: T + 1, wind: 0.5, veilGlow: 0.4 });
  fig(c, ILY, { x: x1, y: spurY(x1), h, dir: 1, walk: stepOf(dist, h), staff: true, light: 1, t: T, wind: 0.55, veilGlow: 0.4 });
}

// prayer under the cedar at dusk: Ilyas stands with raised hands, the young man behind him bows / prostrates
function prayPair(c, T, o = {}) {
  lebanon(c, T, { sky: 'gold', to: 'dusk', k: 0.55, sunX: 300, sunY: 1100, sunA: 0.8, fy: 1340, haze: '#f0b898', city: false });
  spur(c, T, { cedarX: 820, cedarS: 1.9 });
  rug(c, 330, spurY(330) + 4, 520, 70, '#7a2a22');
  const p = o.pose || 0; // 0 standing hands raised, 1 bowing, 2 prostrate
  fig(c, ILY, { x: 420, y: spurY(420), h: 470, dir: -1, dua: p < 1, light: 1, t: T, wind: 0.35, veilGlow: 0.4 });
  const yo = { x: 230, y: spurY(230), h: 430, dir: -1, light: 0.95, t: T + 2, wind: 0.3, veilGlow: 0.38 };
  if (p < 0.5) fig(c, YASY, Object.assign(yo, { dua: true }));
  else if (p < 1.5) lean(c, yo.x, yo.y, 0.55, () => fig(c, YASY, yo));
  else fig(c, YASY, Object.assign(yo, { pose: 'prostrate' }));
}

// night lesson: an oil lamp between them on a rock ledge, Ilyas speaking (reach), the young man sitting, listening
function lessonNight(c, T, o = {}) {
  lebanon(c, T, { sky: 'night', sun: false, stars: 1, moon: 0.9, moonX: 860, moonY: 520, night: 0.85, fy: 1340, haze: '#2a2a48', city: cityIdol({ x: 820, y: 1334, s: 0.3, lamp: 0.9, night: 1, fire: 0.8 }) });
  spur(c, T, { cedarX: 980, cedarS: 1.4, col: '#3a3038', night: 1 });
  oilLamp(c, 330, spurY(330) - 2, 1.4, 1, T);
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 330, spurY(330) - 40, 420, '#ffb860', 0.35); c.restore();
  fig(c, ILY, { x: 470, y: spurY(470), h: 430, dir: -1, pose: 'sit', reach: o.reach === undefined ? 0.45 : o.reach, light: 0.9, t: T, wind: 0.1, veilGlow: 0.38 });
  fig(c, YASY, { x: 180, y: spurY(180), h: 400, dir: 1, pose: 'sit', light: 0.9, t: T + 2, wind: 0.1, veilGlow: 0.36 });
}

// men with torches searching the valley at night (they wanted to harm them); walking, steps driven by distance
const SEARCH = [[-420, 1, 0], [-300, 1, 3], [-120, 1, 6], [1500, -1, 2], [1380, -1, 5]];
function searchNight(c, T, q, o = {}) {
  lebanon(c, T, { sky: 'night', sun: false, stars: 1, moon: 0.85, moonX: 260, moonY: 420, night: 0.9, fy: 1300, haze: '#262848', city: cityIdol({ x: 540, y: 1294, s: 0.36, lamp: 0.9, night: 1, fire: 0.9 }) });
  const r = 1520;
  SEARCH.forEach(([x0, d, f], i) => { const dist = 60 + q * 70 + i * 14, h = 230 + (i % 2) * 20, so = { x: x0 + d * dist + (d > 0 ? 400 : -400), y: r + (i % 3) * 30, h, dir: d, walk: stepOf(dist, h) + i * 0.4, reach: 0.35, light: 0.55, t: T + i, wind: 0.3, ink: 0.7 };
    fig(c, BAALP[f], so); heldTorch(c, so, T, i); });
  c.fillStyle = 'rgba(6,8,22,0.25)'; c.fillRect(-800, -800, W + 1600, H + 1600);
}

// the hiding place: the mouth of a cave in the mountain at night, a small lamp inside, the two of them sitting in its glow
function caveMouth(c, T, o = {}) {
  sky0(c, [[0, '#050818'], [0.3, '#101634'], [0.5, '#22284a']]);
  stars(c, T, 140, 2411, [-400, -300, W + 800, 900], 0.9); moon(c, 860, 360, 36, 0.9, 0.32);
  snowRange(c, 980, 300, 2412, '#1a1e36', '#4a5070', 760); hazeW(c, 1040, 220, '#262a48', 0.5);
  // the rock mass: layered, a rim of moonlight, the arched opening
  const top = x => 760 + Math.abs(x - 560) * 0.32 + noise1(x * 0.01, 2413) * 60;
  const g = c.createLinearGradient(0, 700, 0, 2000); g.addColorStop(0, '#4a4250'); g.addColorStop(1, '#16121a');
  c.fillStyle = g; c.beginPath(); c.moveTo(-500, H + 400); for (let x = -500; x <= 1600; x += 14) c.lineTo(x, top(x)); c.lineTo(1600, H + 400); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(190,200,240,0.35)'; c.lineWidth = 4; c.beginPath(); for (let x = -500; x <= 1600; x += 14) x === -500 ? c.moveTo(x, top(x)) : c.lineTo(x, top(x)); c.stroke();
  const r = rng(2414); c.strokeStyle = 'rgba(10,8,14,0.45)'; c.lineWidth = 3; c.beginPath();
  for (let i = 0; i < 60; i++) { const x = -400 + r() * 1900, y = top(x) + 40 + r() * 1000; c.moveTo(x, y); c.lineTo(x + 50 + r() * 120, y + (r() - 0.5) * 30); } c.stroke();
  const mx = 560, my = 1640, mw = 560, mh = 520;
  c.fillStyle = '#0a0608'; c.beginPath(); c.moveTo(mx - mw / 2, my); c.quadraticCurveTo(mx - mw / 2 - 20, my - mh * 0.8, mx - 40, my - mh); c.quadraticCurveTo(mx + mw / 2 + 30, my - mh * 0.9, mx + mw / 2, my); c.closePath(); c.fill();
  const lamp = o.lamp === undefined ? 1 : o.lamp;
  c.save(); c.beginPath(); c.moveTo(mx - mw / 2, my); c.quadraticCurveTo(mx - mw / 2 - 20, my - mh * 0.8, mx - 40, my - mh); c.quadraticCurveTo(mx + mw / 2 + 30, my - mh * 0.9, mx + mw / 2, my); c.closePath(); c.clip();
  const lg = c.createRadialGradient(mx, my - 60, 10, mx, my - 60, 420); lg.addColorStop(0, `rgba(255,190,110,${0.75 * lamp})`); lg.addColorStop(0.5, `rgba(150,80,40,${0.4 * lamp})`); lg.addColorStop(1, 'rgba(20,10,8,0)');
  c.fillStyle = lg; c.fillRect(mx - 400, my - 600, 800, 640);
  c.fillStyle = '#2a1a14'; c.fillRect(mx - 400, my - 30, 800, 40);
  oilLamp(c, mx, my - 24, 1.1, lamp, T);
  fig(c, ILY, { x: mx + 120, y: my - 24, h: 330, dir: -1, pose: 'sit', dua: !!o.dua, light: 0.85, t: T, wind: 0, veilGlow: 0.35, ink: 0.8 });
  fig(c, YASY, { x: mx - 120, y: my - 24, h: 310, dir: 1, pose: 'sit', dua: !!o.dua, light: 0.85, t: T + 2, wind: 0, veilGlow: 0.34, ink: 0.8 });
  c.restore();
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, mx, my - 100, 380, '#ffb060', 0.18 * lamp); c.restore();
  // a ledge in front of the cave, then blurred rocks in the foreground
  c.fillStyle = '#241c22'; c.beginPath(); c.moveTo(-500, my + 10); c.quadraticCurveTo(560, my - 10, 1600, my + 30); c.lineTo(1600, H + 400); c.lineTo(-500, H + 400); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(255,170,100,0.25)'; c.lineWidth = 3; c.beginPath(); c.moveTo(mx - 300, my + 6); c.quadraticCurveTo(mx, my - 4, mx + 300, my + 8); c.stroke();
  blurred(c, 9, () => { boulder(c, -40, 2140, 460, 260, '#120e14', 2415); boulder(c, 1120, 2160, 420, 240, '#120e14', 2416); });
}

// the departure (dawn): Ilyas walks off down the spur into the light; the young Al-Yasa' stays (dist = Ilyas' walk, 0 = side by side)
function departSet(c, T, dist, o = {}) {
  lebanon(c, T, { sky: 'dawn', to: 'gold', k: 0.2, sunX: 980, sunY: 1120, sunA: 1, fy: 1340, haze: '#f6d0b0', city: false });
  spur(c, T, { cedarX: 1020, cedarS: 1.3 });
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 980, 1150, 700, '#ffe6b8', 0.35); c.restore();
  const xi = 470 + dist, hi = 470 - Math.max(0, dist) * 0.06;
  if (o.ilyas !== false) fig(c, ILY, { x: xi, y: spurY(xi), h: hi, dir: dist > 2 ? 1 : -1, walk: dist > 2 ? stepOf(dist, hi) : 0, staff: true, light: 1.05, t: T, wind: 0.55, veilGlow: 0.4, reach: o.ilyReach || 0 });
  fig(c, YASY, { x: 280, y: spurY(280), h: 450, dir: 1, reach: o.reach || 0, light: 1, t: T + 2, wind: 0.5, veilGlow: 0.4 });
}

// alone before the people: the court of the idol (episode 21 set) with Al-Yasa' in Ilyas' place
function yHero(c, T, o = {}) {
  const z = o.z || 1, cx = o.cx || 540, cy = o.cy || 1150;
  cam(c, z + 0.004 * Math.sin(T * 0.3), cx, cy);
  courtBack(c, T, o);
  [[70, 1268, 1], [1030, 1262, -1]].forEach(([x, y, d], i) => { const so = { x, y, h: hP(y) * 1.05, dir: d, reach: 0.35, light: 0.8, t: T + i * 2, wind: 0.2, ink: 0.7 }; fig(c, BAALP[i ? 6 : 2], so); heldTorch(c, so, T, i); });
  PROS.forEach(p => crowdFig(c, p, T, Object.assign({ bow: o.bow, light: 0.75 }, o.crowd || {})));
  dust(c, T, 26, 2421, [0, 700, W, 900], '#ffc890', 0.22);
  const io = Object.assign({}, HERO_ILY, { dir: 1, staff: !o.armUp && !o.reach, armUp: o.armUp || 0, reach: o.reach || 0, light: 1, t: T, wind: o.wind || 0.5, veilGlow: 0.38 });
  if (o.halo) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, HERO_ILY.x + 20, HERO_ILY.y - 330, 520, '#fff2d0', 0.3 * o.halo); c.restore(); rays(c, HERO_ILY.x + 20, -100, Math.PI / 2, 0.5, 2000, 9, '#fff6e0', 0.07 * o.halo, T, 2422); }
  fig(c, YAS, io);
  blurred(c, 8, () => { boulder(c, 1060, 2080, 300, 120, '#5a4636', 5); shrub(c, 1120, 2030, 3.6, '#3a3420', T, 3); });
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// years of calling: Al-Yasa' teaching a circle of people on the valley floor at dusk, moons passing (cyc), he grows old (old: staff, bent)
const RING = [[250, 1600, 0], [380, 1640, 2], [140, 1680, 4], [520, 1690, 1], [300, 1760, 5], [680, 1780, 3], [120, 1840, 6], [460, 1860, 7], [820, 1700, 8]];
function teachYears(c, T, o = {}) {
  const cyc = o.cyc || 0, nt = o.night || 0;
  lebanon(c, T, { sky: 'gold', to: 'dusk', k: o.dusk === undefined ? 0.55 : o.dusk, sun: o.sun, sunX: 200, sunY: 1050, sunA: 0.8, stars: 0.4 * (o.moons ? 1 : 0), night: nt, fy: 1300, haze: '#f0b898', city: cityIdol({ x: 860, y: 1294, s: 0.3, lamp: 0.6 }) });
  if (o.moons) moonArc(c, T, cyc, o.moons);
  tree(c, 930, 1560, 1.6, T, { col: '#4a3428', leaf: 1, seed: 2431, depth: 6, leafCol: '#5a7034', wind: 0.6 });
  rug(c, 420, 1700, 760, 260, '#6a2a22');
  const old = o.old || 0;
  RING.slice().sort((a, b) => a[1] - b[1]).forEach(([x, y, f], i) => fig(c, FOLK[f], { x, y, h: 230 + (y - 1600) * 0.9, dir: x < 700 ? 1 : -1, pose: 'sit', light: 0.85, t: T + i, wind: 0.15, ink: 0.7 }));
  const yx = 760, yy = 1640;
  lean(c, yx, yy, -0.08 * old, () => fig(c, YAS, { x: yx, y: yy, h: 400, dir: -1, staff: old > 0.5 && !(o.reach > 0), reach: o.reach || 0, light: 1.05, t: T, wind: 0.3, veilGlow: 0.4 }));
  blurred(c, 9, () => fgBrush(c, T, { col: '#4a4a2a' }));
}

// an old man walking with his staff along the spur at sunset (the straight path): dist drives the steps
function oldWalk(c, T, dist, o = {}) {
  lebanon(c, T, { sky: 'gold', to: 'dusk', k: o.dusk === undefined ? 0.7 : o.dusk, sunX: 760, sunY: 1150, sunA: 0.9, fy: 1340, haze: '#f0a888', city: false });
  spur(c, T, { cedarX: 980, cedarS: 1.5 });
  const x = (o.x0 || 80) + dist, h = 480;
  lean(c, x, spurY(x), 0.06, () => fig(c, YAS, { x, y: spurY(x), h, dir: 1, walk: stepOf(dist, h), staff: true, light: 1, t: T, wind: 0.5, veilGlow: 0.4 }));
  if (o.path) { c.strokeStyle = `rgba(255,226,170,${0.55 * o.path})`; c.lineWidth = 6; c.setLineDash([20, 18]); c.beginPath(); c.moveTo(x + 40, spurY(x + 40) + 6); c.lineTo(Math.min(520, x + 600), spurY(Math.min(520, x + 600)) + 6); c.stroke(); c.setLineDash([]); }
}

// the verse rising from the open Book (Al-An'am 86) — no harakat in giant type (Amiri drops them)
function verseRise(c, t, k, x, y, txt) { if (k <= 0) return;
  c.save(); c.direction = 'rtl'; for (let i = 0; i < 3; i++) { const q = clamp(k * 2 - i * 0.55); if (q <= 0 || q >= 1) continue;
    textGlow(c, txt, x - 40 + Math.sin(i * 2.3) * 40, y - 60 - q * 520, `700 ${62 - i * 6}px Amiri`, '#f6c453', Math.sin(q * Math.PI) * 0.95, '#ffb300', 22); }
  c.restore(); }
// "2" counter: the two places in the Qur'an where his name is written
function twoMarks(c, a, y, t, n = 2) { if (a <= 0) return;
  const L = [['AL-AN\'AM', 'verset 86'], ['SAD', 'verset 48']];
  for (let i = 0; i < 2; i++) { const x = 540 + (i - 0.5) * 380, on = i < n; c.save(); c.globalAlpha = a * (on ? 1 : 0.35);
    c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y, 150, '#ffc860', on ? 0.3 : 0); c.restore();
    c.fillStyle = 'rgba(14,10,20,0.65)'; c.beginPath(); c.roundRect(x - 160, y - 56, 320, 112, 24); c.fill(); c.strokeStyle = '#f6c453'; c.lineWidth = 3; c.stroke(); c.restore();
    textGlow(c, L[i][0], x, y - 6, '700 44px Lora', '#f6c453', a * (on ? 1 : 0.4), '#000', 12); textGlow(c, L[i][1], x, y + 36, 'italic 500 30px Lora', '#fff3dc', a * (on ? 0.95 : 0.4), '#000', 10); }
}

const SCENES = {
  // 1. HOOK — his name is written only twice in the Qur'an… and yet Allah says He favoured him over the worlds (Al-An'am 86). First frame = last frame.
  hook: {
    grade: 'rgba(255,200,150,0.08)',
    draw(c, t, d) {
      const tDe = at('hook', 'deux', 0, 2.2), tPo = at('hook', 'pourtant', 0, 3.6), tFa = at('hook', 'favorise', 0, 5.0), tMo = at('hook', 'mondes', 0, 6.0);
      shots(c, t, [
        [0, (cc, q) => { const k = ease(seg(q, 0, tPo + 0.3)); yaHero(cc, t, { z: lerp(1.0, 1.1, k), cx: lerp(520, 470, k), cy: lerp(1200, 1220, k), halo: 0.4 }); }],
        [tPo - 0.1, (cc, q) => { const k = ease(seg(q, 0, tFa - tPo + 0.3)); yaHero(cc, t, { z: lerp(1.9, 2.05, k), cx: 380, cy: lerp(1480, 1440, k), halo: 0.6 }); }], // close, low
        [tFa - 0.1, (cc, q) => { const k = ease(seg(q, 0, d - tFa)); yaHero(cc, t, { z: lerp(1.3, 1.18, k), cx: 450, cy: 1240, halo: 0.6 + 0.4 * ramp(q, 0, 0.6), gold: 0.35 + 0.4 * k });
          lightFromAbove(cc, t, 370, 0.45 * ramp(q, 0, 0.6), 300); sparkle(cc, t, 370, 900, 20, 300, 2441, ramp(q, 0.1, 0.6)); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 1.3); seriesTag24(c, 1);
      const a1 = 1 - ramp(t, tPo - 0.2, 0.25); bigWord(c, 'CITÉ 2 FOIS', 240, a1, 100, '#f6c453'); bigWordS(c, 'SEULEMENT DANS LE CORAN', 340, a1, 54);
      twoMarks(c, a1 * ramp(t, tDe - 0.2, 0.3), 500, t);
      const a2 = ramp(t, tPo + 0.1, 0.25) * (1 - seg(t, d - 0.4, d)); bigWord(c, 'ET POURTANT…', 245, a2 * (1 - ramp(t, tFa - 0.2, 0.25)), 88);
      const a3 = ramp(t, tFa - 0.2, 0.3) * (1 - seg(t, d - 0.4, d)); bigWord(c, 'FAVORISÉ', 240, a3, 100, '#f6c453'); bigWord(c, 'SUR LES MONDES', 350, a3 * ramp(t, tMo - 0.4, 0.3), 76);
      caption(c, 'Coran, sourate Al-An\'am, verset 86', 430, a3 * ramp(t, tMo - 0.2, 0.3), 34);
      if (t > tFa) flashW(c, 0.22 * Math.exp(-(t - tFa) * 3.5));
    },
  },

  // 2. Title; the open loop: the disciple of a great prophet… and what he did the day he found himself alone (paid off in "alone" / "years")
  promise: {
    grade: 'rgba(255,190,140,0.1)',
    draw(c, t, d) {
      const tEl = at('promise', 'eleve', 0, 4.0), tGr = at('promise', 'grand', 0, 5.0), tSe = at('promise', 'seul', 0, 8.2), tSa = at('promise', 'savent', 0, 9.6);
      shots(c, t, [
        [0, (cc, q) => { const k = ease(seg(q, 0, tEl)); yaHero(cc, t, { z: lerp(1.25, 1.12, k), cx: 460, cy: 1250, halo: 0.5, gold: 0.6 }); }],
        [tEl - 0.25, (cc, q) => { const k = ease(seg(q, 0, tSe - tEl + 0.3)); cam(cc, lerp(1.05, 1.12, k), lerp(380, 430, k), 1200); pairWalk(cc, t, 40 + q * 60, { sky: 'gold', to: 'dusk', k: 0.5, sunX: 900, sunY: 1080 }); }],
        [tSe - 0.25, (cc, q) => { const k = ease(seg(q, 0, d - tSe)); yaHero(cc, t, { z: lerp(0.9, 0.86, k), cx: 540, cy: 1150, halo: 0.25, gold: 0.1, h: 470 }); cc.fillStyle = 'rgba(10,8,20,0.18)'; cc.fillRect(0, 0, W, H); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a = seg(t, 0.05, 0.5) * (1 - seg(t, tEl - 0.6, tEl - 0.2));
      topShade(c, a * 1.3); c.fillStyle = `rgba(10,6,4,${0.3 * a})`; c.fillRect(0, 440, W, 200); seriesTag24(c, a);
      c.save(); c.direction = 'rtl'; textGlow(c, 'اليسع', W / 2, 320 - (1 - easeOut(seg(t, 0.05, 1.0))) * 30, '700 200px Amiri', '#f6c453', a, '#ffb300', 40); c.restore();
      textGlow(c, 'ʿalayhi s-salām', W / 2, 520, 'italic 500 46px Lora', '#fff3dc', a, '#000000', 14);
      textGlow(c, 'Al-Yasa\'  ·  paix sur lui', W / 2, 590, '600 42px Lora', '#e8d6b8', a * 0.9, '#000000', 10);
      const b = ramp(t, tEl - 0.15, 0.3) * (1 - ramp(t, tSe - 0.5, 0.3)); quote2(c, 'L\'ÉLÈVE', 'D\'UN GRAND PROPHÈTE', b * ramp(t, tGr - 0.6, 0.3) + b * 0.0001, 270, 84, 66);
      const e = ramp(t, tSe - 0.2, 0.3) * (1 - seg(t, d - 0.4, d)); quote2(c, 'LE JOUR OÙ', 'IL SE RETROUVA SEUL…', e, 270, 74, 70);
      caption(c, 'peu de gens le savent', 490, e * ramp(t, tSa - 0.4, 0.3), 40);
    },
  },

  // 3. The Children of Israel had left Allah for an idol, Baal; Ilyas called them back and they called him a liar (As-Saffat 123-127)
  baal: {
    grade: 'rgba(255,160,110,0.1)',
    draw(c, t, d) {
      const tId = at('baal', 'idole', 0, 4.0), tBa = at('baal', 'baal', 0, 4.8), tIl = at('baal', 'ilyas', 0, 6.6), tMe = at('baal', 'menteur', 0, 9.6);
      shots(c, t, [
        [0, (cc, q) => { const k = ease(seg(q, 0, tId)); iHero(cc, t, { z: lerp(1.0, 1.08, k), cy: lerp(1080, 1120, k), ily: false, bow: ramp(q, 0.5, 2.0) }); }],
        [tId - 0.2, (cc, q) => { const k = ease(seg(q, 0, tIl - tId + 0.2)); cam(cc, 2.1, IDX, lerp(1160, 760, k)); courtBack(cc, t, {}); }], // tilt up the statue
        [tIl - 0.2, (cc, q) => { const k = ease(seg(q, 0, tMe - tIl + 0.2)); iHero(cc, t, { z: lerp(1.9, 1.75, k), cx: 280, cy: 1470, armUp: 0.85 * ramp(q, 0.3, 0.5), halo: 0.6, crowd: { turn: ramp(q, 0.3, 1.2) } }); }],
        [tMe - 0.2, (cc, q) => { const k = ease(seg(q, 0, d - tMe)); iHero(cc, t, { z: lerp(1.4, 1.5, k), cx: 470, cy: 1250, crowd: { turn: 1, point: ramp(q, 0, 0.4) } }); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a0 = ramp(t, 0.15, 0.4) * (1 - ramp(t, tId - 0.4, 0.3)); quote2(c, 'LES FILS D\'ISRAËL', 'AVAIENT DÉLAISSÉ ALLAH', a0, 270, 70, 60);
      const a1 = ramp(t, tId - 0.1, 0.3) * (1 - ramp(t, tIl - 0.4, 0.3)); quote2(c, 'POUR UNE IDOLE :', 'BAAL', a1 * 0.999 + 0.0001, 270, 66, 110 * (0.9 + 0.1 * ramp(t, tBa - 0.1, 0.3)));
      const a2 = ramp(t, tIl - 0.1, 0.3) * (1 - ramp(t, tMe - 0.4, 0.3)); topShade(c, a2 * 1.2); nameTag(c, 'LE PROPHÈTE ILYAS', 540, 260, a2, 'paix sur lui · épisode 21'); bigWord(c, '« REVENEZ À ALLAH »', 400, a2, 64, '#f6c453');
      const a3 = ramp(t, tMe - 0.2, 0.3) * (1 - seg(t, d - 0.4, d)); quote2(c, 'TRAITÉ', 'DE MENTEUR', a3, 270, 80, 88, '#f08a6a');
      caption(c, 'sourate As-Saffat, versets 123 à 127', 500, a3, 34);
    },
  },

  // 4. The Qur'an says nothing of his youth. Historians: a young man descended from Yusuf grew up beside Ilyas; Elisha in other traditions
  disciple: {
    grade: 'rgba(255,200,150,0.08)',
    draw(c, t, d) {
      const tRi = at('disciple', 'rien', 0, 2.4), tHi = at('disciple', 'historiens', 0, 3.6), tYu = at('disciple', 'yusuf', 0, 5.6), tAl = at('disciple', "al-yasa'", 0, 7.6),
        tEl = at('disciple', 'elisee', 0, 9.6), tPa = at('disciple', 'partout', 0, 11.4), tPr = at('disciple', 'priait', 0, 12.4), tAp = at('disciple', 'apprenait', 0, 13.8);
      shots(c, t, [
        [0, (cc, q) => { const k = ease(seg(q, 0, tHi)); cam(cc, lerp(1.2, 1.3, k), 600, lerp(1340, 1310, k)); recite(cc, t, { glow: 0.5, dark: 0.3 }); }],
        [tHi - 0.25, (cc, q) => { const k = ease(seg(q, 0, tYu - tHi + 0.3)); cam(cc, lerp(1.0, 1.06, k), 520, 1190); pairWalk(cc, t, q * 62, { x0: 60, sky: 'day', to: 'gold', k: 0.3, sunX: 880, sunY: 760 }); }],
        [tYu - 0.25, (cc, q) => { const k = ease(seg(q, 0, tAl - tYu + 0.3)); const dist = 120 + q * 62; cam(cc, lerp(1.7, 1.8, k), 60 + dist - 120, 1430); pairWalk(cc, t, dist, { x0: 60, sky: 'day', to: 'gold', k: 0.35, sunX: 880, sunY: 760 }); }],
        [tAl - 0.25, (cc, q) => { const k = ease(seg(q, 0, tPa - tAl + 0.3)); const dist = 240 + q * 62; cam(cc, lerp(2.2, 2.35, k), 60 + dist - 190, lerp(1460, 1440, k)); pairWalk(cc, t, dist, { x0: 60, sky: 'day', to: 'gold', k: 0.4, sunX: 880, sunY: 760 }); }],
        [tPa - 0.25, (cc, q) => { const k = ease(seg(q, 0, tPr - tPa + 0.3)); cam(cc, lerp(0.95, 1.0, k), 560, 1150); pairWalk(cc, t, 330 + q * 62, { x0: -150, sky: 'gold', k: 0, sunX: 760, sunY: 940, px: q * 30 }); }],
        [tPr - 0.25, (cc, q) => { const k = ease(seg(q, 0, tAp - tPr + 0.3)); cam(cc, lerp(1.25, 1.35, k), 360, 1290); prayPair(cc, t, { pose: q < 0.6 ? 0 : 0 + 2 * ramp(q, 0.6, 0.7) }); }],
        [tAp - 0.25, (cc, q) => { const k = ease(seg(q, 0, d - tAp)); cam(cc, lerp(1.35, 1.25, k), 340, 1300); lessonNight(cc, t, { reach: 0.3 + 0.25 * Math.sin(q * 2.2) }); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a0 = ramp(t, 0.15, 0.4) * (1 - ramp(t, tHi - 0.4, 0.3)); quote2(c, 'SUR SA JEUNESSE,', 'LE CORAN NE DIT RIEN', a0 * 0.999 + 0.0001, 270, 66, 62);
      const a1 = ramp(t, tHi - 0.1, 0.3) * (1 - ramp(t, tYu - 0.4, 0.3)); topShade(c, a1); caption(c, 'selon les historiens', 250, a1, 46); bigWord(c, 'UN JEUNE HOMME', 350, a1, 70);
      const a2 = ramp(t, tYu - 0.1, 0.3) * (1 - ramp(t, tAl - 0.4, 0.3)); topShade(c, a2 * 1.2); caption(c, 'descendant de', 240, a2, 40); plaque(c, 'YUSUF', 540, 330, a2, t, 1);
      const a3 = ramp(t, tAl - 0.1, 0.3) * (1 - ramp(t, tPa - 0.4, 0.3)); topShade(c, a3 * 1.3);
      arabic(c, 'اليسع', 260, a3, 140); bigWord(c, 'AL-YASA\'', 390, a3, 72, '#f6c453'); caption(c, '« Élisée » dans d\'autres traditions', 460, a3 * ramp(t, tEl - 0.3, 0.3), 38);
      const a4 = ramp(t, tPa - 0.1, 0.3) * (1 - ramp(t, tPr - 0.4, 0.3)); quote2(c, 'IL LE SUIVAIT', 'PARTOUT', a4, 270, 70, 86);
      const a5 = ramp(t, tPr - 0.1, 0.3) * (1 - ramp(t, tAp - 0.4, 0.3)); quote2(c, 'PRIAIT AVEC LUI', null, a5, 280, 72);
      const a6 = ramp(t, tAp - 0.1, 0.3) * (1 - seg(t, d - 0.4, d)); quote2(c, 'APPRENAIT DE LUI', null, a6, 280, 72);
    },
  },

  // 5. When they sought to harm them, they hid together in the mountain near Damascus (some narrations: Mount Qasiyun)
  hide: {
    grade: 'rgba(160,170,230,0.1)',
    draw(c, t, d) {
      const tNu = at('hide', 'nuire', 0, 1.6), tCa = at('hide', 'cacherent', 0, 2.6), tMo = at('hide', 'montagne', 0, 4.0), tDa = at('hide', 'damas', 0, 5.0), tRe = at('hide', 'recits', 0, 6.6);
      shots(c, t, [
        [0, (cc, q) => { const k = ease(seg(q, 0, tCa)); cam(cc, lerp(1.1, 1.2, k), 540, 1260); searchNight(cc, t, q); }],
        [tCa - 0.25, (cc, q) => { const k = ease(seg(q, 0, tMo - tCa + 0.3)); cam(cc, lerp(2.0, 1.85, k), 560, 1500); caveMouth(cc, t, {}); }],
        [tMo - 0.25, (cc, q) => { const k = ease(seg(q, 0, d - tMo)); cam(cc, lerp(0.92, 1.05, k), 560, lerp(1240, 1320, k)); caveMouth(cc, t, { dua: q > tRe - tMo }); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a0 = ramp(t, 0.1, 0.3) * (1 - ramp(t, tCa - 0.4, 0.3)); quote2(c, 'ON CHERCHA', 'À LEUR NUIRE', a0, 270, 70, 80, '#f08a6a');
      const a1 = ramp(t, tCa - 0.1, 0.3) * (1 - ramp(t, tMo - 0.4, 0.3)); quote2(c, 'CACHÉS', 'ENSEMBLE', a1, 270, 84, 80);
      const a2 = ramp(t, tMo - 0.1, 0.3) * (1 - seg(t, d - 0.4, d)); topShade(c, a2 * 1.2); bigWord(c, 'DANS LA MONTAGNE', 260, a2, 68); nameTag(c, 'PRÈS DE DAMAS', 540, 350, a2 * ramp(t, tDa - 0.3, 0.3), 'le mont Qassioun, selon certains récits');
    },
  },

  // 6. Then came the day Ilyas left his people; he left Al-Yasa' in his place to carry on the call, and Allah made him a prophet
  depart: {
    grade: 'rgba(255,210,160,0.1)',
    draw(c, t, d) {
      const tQu = at('depart', 'quitta', 0, 2.0), tAl = at('depart', "al-yasa'", 0, 3.6), tPl = at('depart', 'place', 0, 5.0), tAp = at('depart', "l'appel", 0, 6.6), tPr = at('depart', 'prophete', 0, 9.0);
      shots(c, t, [
        [0, (cc, q) => { const k = ease(seg(q, 0, tQu)); cam(cc, lerp(1.25, 1.35, k), 380, 1350); departSet(cc, t, 0, { ilyReach: 0.6 * ramp(q, 0.3, 0.6) }); }], // a last word
        [tQu - 0.25, (cc, q) => { const k = ease(seg(q, 0, tAl - tQu + 0.3)); cam(cc, lerp(1.0, 1.04, k), 560, 1200); departSet(cc, t, 10 + q * 120, { reach: 0.4 * ramp(q, 0.4, 0.8) }); }], // Ilyas walks off down into the light
        [tAl - 0.25, (cc, q) => { const k = ease(seg(q, 0, tAp - tAl + 0.3)); cam(cc, lerp(1.0, 1.06, k), 600, 1200); departSet(cc, t, 210 + q * 140); }],
        [tAp - 0.25, (cc, q) => { const k = ease(seg(q, 0, tPr - tAp + 0.3)); cam(cc, lerp(1.9, 2.05, k), 300, lerp(1470, 1440, k)); departSet(cc, t, 999, { ilyas: false }); }], // alone, close
        [tPr - 0.25, (cc, q) => { const k = ease(seg(q, 0, d - tPr)); yaHero(cc, t, { z: lerp(1.15, 1.0, k), cx: 460, cy: 1220, halo: 0.5 + 0.5 * ramp(q, 0, 0.6), armUp: 0.75 * ramp(q, 0.5, 0.7), gold: 0.6 });
          lightFromAbove(cc, t, 370, 0.55 * ramp(q, 0, 0.7), 300); sparkle(cc, t, 370, 860, 22, 320, 2461, ramp(q, 0.1, 0.7)); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a0 = ramp(t, 0.15, 0.3) * (1 - ramp(t, tAl - 0.4, 0.3)); quote2(c, 'ILYAS QUITTA', 'SON PEUPLE', a0 * ramp(t, tQu - 0.6, 0.3) + 0.0001, 270, 72, 72);
      const a1 = ramp(t, tAl - 0.1, 0.3) * (1 - ramp(t, tAp - 0.4, 0.3)); quote2(c, 'AL-YASA\'', 'À SA PLACE', a1 * 0.999 + 0.0001, 270, 84, 80 * (0.9 + 0.1 * ramp(t, tPl - 0.2, 0.3)));
      const a2 = ramp(t, tAp - 0.1, 0.3) * (1 - ramp(t, tPr - 0.4, 0.3)); quote2(c, 'POUR CONTINUER', 'L\'APPEL', a2, 270, 70, 88);
      const a3 = ramp(t, tPr - 0.2, 0.3) * (1 - seg(t, d - 0.4, d)); topShade(c, a3 * 1.3); caption(c, 'et Allah fit de lui', 240, a3, 44); bigWord(c, 'UN PROPHÈTE', 350, a3, 96, '#f6c453');
      if (t > tPr) flashW(c, 0.25 * Math.exp(-(t - tPr) * 3.5));
    },
  },

  // 7. PEAK — alone before the people who had rejected his master. He could have kept silent, or left. He did not.
  alone: {
    grade: 'rgba(255,170,120,0.1)',
    draw(c, t, d) {
      const tSe = at('alone', 'seul', 0, 1.0), tRe = at('alone', 'rejete', 0, 2.6), tTa = at('alone', 'taire', 0, 4.4), tPa = at('alone', 'partir', 0, 5.4), tNe = at('alone', 'ne', 0, 6.4), tFa = at('alone', 'fait', 0, 7.2);
      shots(c, t, [
        [0, (cc, q) => { const k = ease(seg(q, 0, tRe)); yHero(cc, t, { z: lerp(1.0, 1.08, k), cy: 1120, crowd: { turn: 1 } }); }],
        [tRe - 0.2, (cc, q) => { const k = ease(seg(q, 0, tTa - tRe + 0.2)); yHero(cc, t, { z: lerp(1.5, 1.6, k), cx: 520, cy: 1280, crowd: { turn: 1, point: ramp(q, 0.1, 0.4) } }); }],
        [tTa - 0.2, (cc, q) => { const k = ease(seg(q, 0, tPa - tTa + 0.2)); yHero(cc, t, { z: lerp(2.3, 2.4, k), cx: 230, cy: 1500, wind: 0.8, crowd: { turn: 1, point: 1 } }); cc.fillStyle = 'rgba(10,8,20,0.2)'; cc.fillRect(0, 0, W, H); }],
        [tPa - 0.2, (cc, q) => { const k = ease(seg(q, 0, tNe - tPa + 0.2)); cam(cc, lerp(1.0, 1.05, k), 540, 1200); oldWalk(cc, t, 0, { x0: -400, dusk: 0.9 }); /* the path away, empty */
          cc.setTransform(1, 0, 0, 1, 0, 0); cc.fillStyle = 'rgba(10,8,20,0.25)'; cc.fillRect(0, 0, W, H); }],
        [tNe - 0.2, (cc, q) => { const k = ease(seg(q, 0, d - tNe)); yHero(cc, t, { z: lerp(1.8, 1.45, k), cx: lerp(280, 360, k), cy: lerp(1420, 1320, k), armUp: 0.95 * ramp(q, tFa - tNe - 0.3, 0.5), halo: ramp(q, tFa - tNe - 0.2, 0.6), crowd: { turn: 1 } }); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a0 = ramp(t, 0.1, 0.3) * (1 - ramp(t, tTa - 0.4, 0.3)); topShade(c, a0 * 1.3); bigWord(c, 'SEUL', 260, a0, 130, '#f6c453'); bigWordS(c, 'FACE AU PEUPLE QUI AVAIT', 370, a0 * ramp(t, tRe - 1.0, 0.3), 46); bigWordS(c, 'REJETÉ SON MAÎTRE', 430, a0 * ramp(t, tRe - 0.3, 0.3), 54);
      const a1 = ramp(t, tTa - 0.2, 0.3) * (1 - ramp(t, tNe - 0.4, 0.3)); quote2(c, 'SE TAIRE…', 'OU PARTIR ?', a1 * 0.999 + 0.0001, 270, 84, 84 * ramp(t, tPa - 0.3, 0.3) + 0.0001, '#fff6e0');
      const a2 = ramp(t, tNe - 0.1, 0.3) * (1 - seg(t, d - 0.4, d)); quote2(c, 'IL NE L\'A', 'PAS FAIT.', a2, 270, 96, 110);
      if (t > tFa) flashW(c, 0.22 * Math.exp(-(t - tFa) * 3.5));
    },
  },

  // 8. Al-Hasan al-Basri (cited by Ibn Kathir): he stayed among them as long as Allah willed, calling them to Allah, following Ilyas' way, until his death
  years: {
    grade: 'rgba(255,190,140,0.1)',
    draw(c, t, d) {
      const tVo = at('years', 'voulut', 0, 4.6), tAp = at('years', 'appelant', 0, 5.6), tFi = at('years', 'fidele', 0, 7.4), tMo = at('years', 'mort', 0, 9.6), tAn = at('years', 'annees', 0, 10.6), tDe = at('years', 'devier', 0, 12.0);
      shots(c, t, [
        [0, (cc, q) => { const k = ease(seg(q, 0, tVo)); cam(cc, lerp(1.05, 1.0, k), 540, 1160); teachYears(cc, t, { reach: 0.5, dusk: 0.4 }); }],
        [tVo - 0.25, (cc, q) => { const k = ease(seg(q, 0, tFi - tVo + 0.3)); cam(cc, lerp(1.0, 1.06, k), 540, 1150); teachYears(cc, t, { moons: 1, cyc: q * 1.3, dusk: 0.6 + 0.3 * Math.sin(q * 2), night: 0.2 + 0.2 * Math.sin(q * 2.6), reach: 0.4 + 0.3 * ramp(q, tAp - tVo, 0.5), old: ramp(q, 0, tFi - tVo) }); }],
        [tFi - 0.25, (cc, q) => { const k = ease(seg(q, 0, tMo - tFi + 0.3)); cam(cc, lerp(1.6, 1.7, k), 60 + 40 + q * 55, 1440); oldWalk(cc, t, 40 + q * 55, { dusk: 0.6 }); }],
        [tMo - 0.25, (cc, q) => { const k = ease(seg(q, 0, tAn - tMo + 0.3)); cam(cc, lerp(1.0, 1.05, k), 540, 1200); // the spur empty at nightfall, a column of soft light where he walked
          lebanon(cc, t, { sky: 'dusk', sun: false, stars: 0.7, night: 0.4, fy: 1340, haze: '#8a6a7a', city: false }); spur(cc, t, { cedarX: 980, cedarS: 1.5, night: 0.4 }); lightFromAbove(cc, t, 360, 0.4 * ramp(q, 0, 0.8), 260); }],
        [tAn - 0.25, (cc, q) => { const k = ease(seg(q, 0, d - tAn)); cam(cc, lerp(1.0, 1.08, k), 400, 1200); oldWalk(cc, t, 80 + q * 55, { dusk: 0.75, path: ramp(q, tDe - tAn - 0.3, 0.5) }); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a0 = ramp(t, 0.15, 0.3) * (1 - ramp(t, tVo - 0.4, 0.3)); topShade(c, a0 * 1.2); nameTag(c, 'AL-HASSAN AL-BASRI', 540, 250, a0, 'cité par Ibn Kathir'); bigWord(c, '« IL RESTA PARMI EUX »', 390, a0, 62);
      const a1 = ramp(t, tVo - 0.1, 0.3) * (1 - ramp(t, tFi - 0.4, 0.3)); quote2(c, 'AUSSI LONGTEMPS', 'QU\'ALLAH LE VOULUT', a1, 270, 66, 64);
      const a2 = ramp(t, tFi - 0.1, 0.3) * (1 - ramp(t, tMo - 0.4, 0.3)); quote2(c, 'FIDÈLE', 'À LA VOIE D\'ILYAS', a2, 270, 90, 64);
      const a3 = ramp(t, tMo - 0.2, 0.3) * (1 - ramp(t, tAn - 0.4, 0.3)); quote2(c, 'JUSQU\'À SA MORT', null, a3, 280, 74);
      const a4 = ramp(t, tAn - 0.1, 0.3) * (1 - seg(t, d - 0.4, d)); quote2(c, 'SANS JAMAIS', 'DÉVIER DU CHEMIN', a4 * 0.999 + 0.0001, 270, 72, 72 * ramp(t, tDe - 0.4, 0.3) + 0.0001);
    },
  },

  // 9. Grown old (narration of Mujahid): he too sought a man to carry the charge, three pledges; the one who stood up became Dhul-Kifl (episode 23)
  heir: {
    grade: 'rgba(255,210,160,0.08)',
    draw(c, t, d) {
      const tVi = at('heir', 'vieux', 0, 0.8), tMu = at('heir', 'mujahid', 0, 2.8), tCh = at('heir', 'charge', 0, 6.0), tTr = at('heir', 'trois', 0, 7.2), tJe = at('heir', 'jeuner', 0, 8.6), tPr = at('heir', 'prier', 0, 9.8),
        tCo = at('heir', 'colere', 0, 12.0), tLe = at('heir', 'leva', 0, 13.4), tDh = at('heir', 'dhul-kifl', 0, 14.6), tEp = at('heir', 'episode', 0, 16.0);
      shots(c, t, [
        [0, (cc, q) => { const k = ease(seg(q, 0, tCh)); ysHero(cc, t, { z: lerp(1.7, 1.55, k), cx: 540, cy: lerp(1080, 1120, k) }); }],
        [tCh - 0.25, (cc, q) => { const k = ease(seg(q, 0, tLe - tCh + 0.2)); ysHero(cc, t, { z: lerp(1.0, 1.06, k), cy: 1200, arm: 0.7 * ramp(q, 0.2, 0.5) }); }],
        [tLe - 0.2, (cc, q) => { const k = ease(seg(q, 0, d - tLe)); ysHero(cc, t, { z: lerp(1.5, 1.7, k), cx: lerp(720, 770, k), cy: 1420, rise: ramp(q, 0, 0.9), lit: ramp(q, 0.2, 0.8), dim: 0.3 }); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a0 = ramp(t, 0.15, 0.3) * (1 - ramp(t, tCh - 0.4, 0.3)); topShade(c, a0 * 1.2); bigWord(c, 'DEVENU VIEUX', 260, a0, 80); caption(c, 'selon un récit rapporté par Mujahid', 340, a0 * ramp(t, tMu - 0.6, 0.3), 36);
      const a1 = ramp(t, tCh - 0.1, 0.3) * (1 - ramp(t, tLe - 0.4, 0.3)); shade22(c, a1, 780); bigWord(c, 'QUI PORTERA LA CHARGE ?', 240, a1, 60);
      threeVows(c, tCo - 0.3 < t ? 3 : tPr - 0.3 < t ? 2 : tJe - 0.3 < t ? 1 : 0, a1 * ramp(t, tTr - 0.4, 0.3), 430, t);
      const a2 = ramp(t, tLe - 0.1, 0.3) * (1 - seg(t, d - 0.4, d)); shade22(c, a2, 720); bigWord(c, 'CELUI QUI SE LEVA', 240, a2, 64);
      arabic(c, 'ذو الكفل', 380, a2 * ramp(t, tDh - 0.4, 0.3), 130); bigWord(c, 'DHUL-KIFL', 500, a2 * ramp(t, tDh - 0.3, 0.3), 70, '#f6c453');
      caption(c, '▶ épisode 23', 575, a2 * ramp(t, tEp - 0.4, 0.3), 40);
    },
  },

  // 10. The promise kept — Allah says: "Ismail, Al-Yasa', Yunus and Lut: each We favoured over the worlds" (Al-An'am 86); "each among the best" (Sad 48)
  quran: {
    grade: 'rgba(255,200,150,0.1)',
    draw(c, t, d) {
      const tIs = at('quran', 'ismail', 0, 1.4), tYa = at('quran', "al-yasa'", 0, 2.2), tYu = at('quran', 'yunus', 0, 3.0), tLu = at('quran', 'lut', 0, 3.6), tFa = at('quran', 'favorise', 0, 5.2),
        tEn = at('quran', 'encore', 0, 7.4), tMe = at('quran', 'meilleurs', 0, 9.6);
      shots(c, t, [
        [0, (cc, q) => { const k = ease(seg(q, 0, tFa)); cam(cc, lerp(1.15, 1.25, k), 600, lerp(1350, 1320, k)); recite(cc, t, { glow: 1 }); }],
        [tFa - 0.25, (cc, q) => { const k = ease(seg(q, 0, tEn - tFa + 0.3)); yaHero(cc, t, { z: lerp(1.05, 1.15, k), cx: 450, cy: 1230, halo: 1, gold: 0.8 }); lightFromAbove(cc, t, 370, 0.5, 300); sparkle(cc, t, 370, 880, 22, 320, 2471, 1); }],
        [tEn - 0.25, (cc, q) => { const k = ease(seg(q, 0, d - tEn)); cam(cc, lerp(1.0, 1.06, k), 540, 1170); teachYears(cc, t, { reach: 0.6, dusk: 0.3, old: 0.6 }); lightFromAbove(cc, t, 760, 0.35 * ramp(q, tMe - tEn - 0.4, 0.6), 280); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a0 = ramp(t, 0.1, 0.3) * (1 - ramp(t, tFa - 0.4, 0.3)); shade22(c, a0, 1150); caption(c, 'Coran, sourate Al-An\'am, verset 86', 230, a0, 36);
      plaque(c, 'ISMAÏL', 540, 360, a0 * ramp(t, tIs - 0.2, 0.3), t, 0.8); plaque(c, 'AL-YASA\'', 540, 500, a0 * ramp(t, tYa - 0.2, 0.3), t, 1.5);
      plaque(c, 'YUNUS', 540, 640, a0 * ramp(t, tYu - 0.2, 0.3), t, 0.8); plaque(c, 'LUT', 540, 780, a0 * ramp(t, tLu - 0.2, 0.3), t, 0.8);
      const a1 = ramp(t, tFa - 0.15, 0.3) * (1 - ramp(t, tEn - 0.4, 0.3)); shade22(c, a1, 720); arabic(c, 'وكلا فضلنا على العالمين', 270, a1, 84);
      bigWord(c, '« FAVORISÉS', 400, a1, 80, '#f6c453'); bigWord(c, 'SUR LES MONDES »', 490, a1, 70);
      const a2 = ramp(t, tEn - 0.1, 0.3) * (1 - seg(t, d - 0.4, d)); shade22(c, a2, 700); arabic(c, 'وكل من الأخيار', 270, a2 * ramp(t, tMe - 1.2, 0.3), 100);
      bigWord(c, '« CHACUN D\'EUX', 410, a2, 60); bigWord(c, 'PARMI LES MEILLEURS »', 490, a2 * ramp(t, tMe - 0.4, 0.3), 62, '#f6c453'); caption(c, 'sourate Sad, verset 48', 560, a2, 34);
      if (t > tFa) flashW(c, 0.2 * Math.exp(-(t - tFa) * 3.5));
    },
  },

  // 11. The lesson: not famous — faithful, even when you go on alone
  lesson: {
    grade: 'rgba(255,200,150,0.1)',
    draw(c, t, d) {
      const tDt = at('lesson', 'detail', 0, 2.0), tTe = at('lesson', 'tenu', 0, 4.4), tCe = at('lesson', 'celebre', 0, 7.0), tFi = at('lesson', 'fidele', 0, 9.0), tSe = at('lesson', 'seul', 0, 11.4);
      shots(c, t, [
        [0, (cc, q) => { const k = ease(seg(q, 0, tTe - 0.6)); cam(cc, lerp(1.05, 1.1, k), 360, 1220); oldWalk(cc, t, 60 + q * 55, { dusk: 0.8 }); }],
        [tTe - 0.6, (cc, q) => { const k = ease(seg(q, 0, tCe - tTe + 0.6)); yaHero(cc, t, { z: lerp(1.6, 1.45, k), cx: 380, cy: 1400, halo: 0.8, gold: 0.7 }); }],
        [tCe - 0.25, (cc, q) => { const k = ease(seg(q, 0, tFi - tCe + 0.3)); cam(cc, lerp(1.0, 1.06, k), 540, 1000); nightCities(cc, t); }],
        [tFi - 0.25, (cc, q) => { const k = ease(seg(q, 0, tSe - tFi + 0.3)); cam(cc, lerp(1.3, 1.2, k), 600, lerp(1350, 1330, k)); recite(cc, t, { glow: 1 }); }],
        [tSe - 0.25, (cc, q) => { const k = ease(seg(q, 0, d - tSe)); yaHero(cc, t, { z: lerp(1.0, 0.92, k), cx: 520, cy: 1180, halo: 0.6 + 0.4 * ramp(q, 0, 1), gold: 0.5 + 0.3 * k }); lightFromAbove(cc, t, 370, 0.35 * ramp(q, 0.2, 1.0), 300); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a0 = ramp(t, 0.15, 0.3) * (1 - ramp(t, tTe - 0.9, 0.3)); quote2(c, 'SA VIE N\'EST PAS', 'RACONTÉE EN DÉTAIL', a0, 270, 66, 64);
      const a1 = ramp(t, tTe - 0.6, 0.3) * (1 - ramp(t, tCe - 0.4, 0.3)); quote2(c, 'MAIS IL A TENU', 'JUSQU\'AU BOUT', a1, 270, 72, 80);
      const a2 = ramp(t, tCe - 0.2, 0.3) * (1 - ramp(t, tFi - 0.4, 0.3)); shade22(c, a2, 640); bigWord(c, 'PERSONNE NE TE DEMANDE', 250, a2, 54); bigWord(c, 'D\'ÊTRE CÉLÈBRE', 350, a2, 82);
      const a3 = ramp(t, tFi - 0.2, 0.3) * (1 - ramp(t, tSe - 0.5, 0.3)); shade22(c, a3, 640); bigWord(c, 'ON TE DEMANDE', 250, a3, 62); bigWord(c, 'D\'ÊTRE FIDÈLE', 360, a3, 92, '#f6c453');
      const a4 = ramp(t, tSe - 0.3, 0.3) * (1 - seg(t, d - 0.4, d)); quote2(c, '… MÊME QUAND TU', 'CONTINUES SEUL', a4, 270, 64, 84);
    },
  },

  cta: {
    grade: 'rgba(255,200,150,0.08)',
    draw(c, t, d) {
      yaHero(c, 60 + t, { z: lerp(1.05, 1.0, seg(t, 0, d)), halo: 0.4 });
      c.fillStyle = 'rgba(6,8,18,0.3)'; c.fillRect(0, 0, W, H);
      ctaText(c, seg(t, 0.1, 0.6));
    },
  },
  outro: {
    grade: 'rgba(255,200,150,0.08)',
    draw(c, t, d) {
      const back = seg(t, d - 0.8, d);
      if (back <= 0) { const cd = ((window.TL.scenes || []).find(s => s.id === 'cta') || { dur: 6 }).dur; yaHero(c, 60 + cd + t, { z: 1.0, halo: 0.4 }); }
      else yaHero(c, 0, { z: 1.0, cx: 520, cy: 1200, halo: 0.4 });
      const k = 1 - seg(t, d - 2.0, d - 1.2);
      c.fillStyle = `rgba(6,8,18,${0.3 * k})`; c.fillRect(0, 0, W, H);
      ctaText(c, k);
      flashW(c, 0.5 * Math.sin(Math.PI * clamp((t - (d - 1.6)) / 1.6)));
      const a = seg(t, d - 0.8, d - 0.1); topShade(c, 1.3 * a); seriesTag24(c, a);
      bigWord(c, 'CITÉ 2 FOIS', 240, a, 100, '#f6c453'); bigWordS(c, 'SEULEMENT DANS LE CORAN', 340, a, 54);
    },
  },
  // cover for TikTok (not in the timeline: rendered by tools/cover.js)
  cover: {
    draw(c) {
      yaHero(c, 0.4, { z: 1.12, cx: 430, cy: 1230, halo: 1, gold: 0.7 });
      lightFromAbove(c, 0.4, 340, 0.4, 300);
      const g = c.createLinearGradient(0, 0, 0, 820); g.addColorStop(0, 'rgba(6,8,18,0.88)'); g.addColorStop(1, 'rgba(6,8,18,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 820);
      seriesTag24(c, 1);
      textS(c, 'CITÉ 2 FOIS', 250, 1, '700 112px Lora', 112, '#f6c453', 24);
      textGlow(c, 'DANS LE CORAN…', W / 2, 375, '700 92px Lora', '#fff6e0', 1, '#000', 24);
      textGlow(c, 'ET FAVORISÉ', W / 2, 505, '700 100px Lora', '#f6c453', 1, '#000', 26);
      textGlow(c, 'sur les mondes', W / 2, 600, 'italic 500 60px Lora', '#fff6e0', 1, '#000', 20);
      const g2 = c.createLinearGradient(0, 1420, 0, H); g2.addColorStop(0, 'rgba(6,8,18,0)'); g2.addColorStop(1, 'rgba(6,8,18,0.85)'); c.fillStyle = g2; c.fillRect(0, 1420, W, 500);
      arabic(c, 'اليسع', 1640, 1, 170);
      textGlow(c, 'Al-Yasa\', paix sur lui', W / 2, 1790, 'italic 500 46px Lora', '#fff3dc', 1, '#000', 14);
    },
  },
};
