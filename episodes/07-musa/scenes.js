// Episode 7 — Moussa (Moïse, alayhi salam): Pharaoh, the river, the fire on Mount Tur, the staff, and the sea split in two.
// Visual rules: the prophet is shown only as a silhouette in white, face entirely hidden by a veil of white light
// (prophet: true, as in episodes 1, 4, 6); everyone else is faceless. Allah is never depicted: only light and calligraphy.
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

const MUSA = { prophet: true, robe: '#ece7da', wrap: '#f7f3ea', skin: '#c99872', trim: '#c9a86a', band: '#b89a5a', inner: '#fbf8f0' };
const FOLK = [
  { robe: '#6a4a32', wrap: '#e2d4b8', skin: '#9a6a4c' }, { robe: '#3a4a62', wrap: '#e6dfcf', skin: '#b07a58' },
  { robe: '#7a5236', wrap: '#d6c29c', skin: '#8f5f42', trim: '#c9a35a' }, { robe: '#4a3a30', wrap: '#ece4d4', skin: '#a8714f', covered: true },
  { robe: '#2e4a52', wrap: '#d8ccb2', skin: '#94664a' }, { robe: '#8a5a3a', wrap: '#efe6d4', skin: '#b4805c' },
  { robe: '#5a3a4e', wrap: '#e0d2bc', skin: '#c48e66', trim: '#b89a62', covered: true }, { robe: '#3e5440', wrap: '#ddd2bc', skin: '#b07a58' },
  { robe: '#6e3a28', wrap: '#e8dcc4', skin: '#9a6a4c' },
];
const SOLDIER = { robe: '#4a3020', wrap: '#2a3a5a', skin: '#8f5f42', trim: '#c9a35a', band: '#c9a35a', inner: '#e8e0cc' };
const PHARAOH = { robe: '#f0e6cc', wrap: '#e0b85a', skin: '#a8714f', trim: '#e0b85a', band: '#2a4a8a', inner: '#f6efdc', hood: false };
const COURT = [{ robe: '#efe6d0', wrap: '#2a3a6a', skin: '#a8714f', trim: '#e0b85a', inner: '#f6efdc' }, { robe: '#e6dcc4', wrap: '#1e2e4e', skin: '#94664a', trim: '#c9a14a', inner: '#f2ead6' }];
const MAGES = [{ robe: '#2a1e2e', wrap: '#4a3a5a', skin: '#94664a', trim: '#8a6ab0' }, { robe: '#3a1e1a', wrap: '#5a2a2a', skin: '#a8714f', trim: '#b05a4a' }, { robe: '#1e2a2e', wrap: '#3a4a4a', skin: '#8f5f42', trim: '#5a9aa0' }];
const QUEEN = { robe: '#1e5060', wrap: '#f0e8d6', skin: '#b4805c', trim: '#e0b85a', band: '#e0b85a', covered: true, inner: '#f6efdc' };
const MOTHER = { robe: '#5a3a4e', wrap: '#e0d2bc', skin: '#a8714f', trim: '#b89a62', covered: true };
const GOLD = '#e0b85a', LAPIS = '#2a4a8a', SAND = '#d39a5e';

// world position of a figure's head (figure(): translate, scale h/300 (x0.82 for a child), head at -268 standing)
function headOf(o) { const s = (o.h || 300) / 300 * (o.child ? 0.82 : 1), hy = { stand: -268, sit: -192, kneel: -205 }[o.pose || 'stand']; return [o.x, o.y + hy * s, 21 * s]; }
function handOf(o) { // world position of the near hand for armUp / reach (same maths as figureRaw)
  const s = (o.h || 300) / 300, d = o.dir || 1; let hp;
  if (o.armUp > 0) hp = [lerp(48, 82, o.armUp), lerp(-112, -300, o.armUp)]; else if (o.reach > 0) hp = [lerp(48, 100, o.reach), lerp(-112, -180, o.reach)]; else hp = [48, -114];
  return [o.x + d * hp[0] * s, o.y + (hp[1] + 4) * s];
}
// Pharaoh's striped royal headcloth with brow band, lappets and broad collar (drawn over a hood-less figure)
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

// ---------- Egypt
function egColumn(c, x, y, w, h, col, o = {}) { // papyrus-bundle column: base, banded shaft, open bell capital, abacus
  const lt = mix(col, '#fff6e4', 0.35), dk = mix(col, '#1a0c06', 0.5);
  const g = c.createLinearGradient(x - w, 0, x + w, 0); g.addColorStop(0, lt); g.addColorStop(0.5, col); g.addColorStop(1, dk);
  c.fillStyle = 'rgba(10,6,4,0.25)'; c.beginPath(); c.ellipse(x + w * 0.5, y + 2, w * 1.4, w * 0.18, 0, 0, 6.283); c.fill();
  c.fillStyle = g; c.beginPath(); c.ellipse(x, y - w * 0.12, w * 0.95, w * 0.22, 0, 0, 6.283); c.fill(); c.fillRect(x - w * 0.95, y - w * 0.3, w * 1.9, w * 0.2);
  const top = y - h + w * 1.25;
  c.beginPath(); c.moveTo(x - w * 0.62, y - w * 0.3); c.quadraticCurveTo(x - w * 0.82, (y + top) / 2, x - w * 0.55, top); c.lineTo(x + w * 0.55, top); c.quadraticCurveTo(x + w * 0.82, (y + top) / 2, x + w * 0.62, y - w * 0.3); c.closePath(); c.fill();
  c.strokeStyle = hexA(dk, 0.35); c.lineWidth = Math.max(1.5, w * 0.05); // papyrus stalks
  for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(x + k * w * 0.22, y - w * 0.32); c.quadraticCurveTo(x + k * w * 0.3, (y + top) / 2, x + k * w * 0.2, top); c.stroke(); }
  [0.12, 0.17, 0.22].forEach(q => { c.fillStyle = o.band || LAPIS; c.fillRect(x - w * 0.6, top + (y - top) * q - w * 0.04, w * 1.2, w * 0.07); });
  c.fillStyle = o.band || LAPIS; c.fillRect(x - w * 0.56, top - w * 0.06, w * 1.12, w * 0.1);
  c.fillStyle = g; c.beginPath(); c.moveTo(x - w * 0.5, top); c.quadraticCurveTo(x - w * 1.25, top - w * 0.6, x - w * 1.3, top - w * 1.05); c.lineTo(x + w * 1.3, top - w * 1.05); c.quadraticCurveTo(x + w * 1.25, top - w * 0.6, x + w * 0.5, top); c.closePath(); c.fill();
  c.strokeStyle = hexA(dk, 0.4); c.lineWidth = Math.max(1.5, w * 0.05); for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(x + k * w * 0.12, top); c.quadraticCurveTo(x + k * w * 0.35, top - w * 0.5, x + k * w * 0.4, top - w * 1.0); c.stroke(); }
  c.fillStyle = mix(col, '#1a0c06', 0.15); c.fillRect(x - w * 1.0, top - w * 1.3, w * 2.0, w * 0.26);
  c.fillStyle = hexA(lt, 0.6); c.fillRect(x - w * 1.0, top - w * 1.3, w * 2.0, Math.max(2, w * 0.04));
}
function glyphs(c, x, y, w, h, col, seed, a = 0.5) { // abstract incised signs in registers (no figures)
  const r = rng(seed), rows = Math.max(1, Math.round(h / 34)), cell = h / rows;
  c.save(); c.globalAlpha *= a; c.strokeStyle = col; c.fillStyle = col; c.lineWidth = Math.max(1.5, cell * 0.08);
  for (let j = 0; j < rows; j++) for (let xx = x + cell * 0.4; xx < x + w - cell * 0.4; xx += cell * (0.7 + r() * 0.4)) {
    const cy = y + j * cell + cell / 2, s = cell * 0.32, k = Math.floor(r() * 6); c.beginPath();
    if (k === 0) c.arc(xx, cy, s * 0.6, 0, 6.283);
    else if (k === 1) { c.moveTo(xx, cy - s); c.lineTo(xx, cy + s); }
    else if (k === 2) { c.moveTo(xx - s, cy); for (let q = 0; q <= 4; q++) c.lineTo(xx - s + q * s / 2, cy + (q % 2 ? -s * 0.4 : s * 0.4)); }
    else if (k === 3) { c.arc(xx, cy + s * 0.5, s * 0.8, Math.PI, 0); }
    else if (k === 4) { c.moveTo(xx - s * 0.8, cy + s * 0.6); c.lineTo(xx, cy - s); c.lineTo(xx + s * 0.8, cy + s * 0.6); c.closePath(); }
    else { c.rect(xx - s * 0.6, cy - s * 0.25, s * 1.2, s * 0.5); }
    k === 0 || k === 4 || k === 5 ? c.stroke() : c.stroke();
    if (j < rows - 1) { c.globalAlpha *= 1; }
  }
  c.strokeStyle = col; c.lineWidth = 2; for (let j = 0; j <= rows; j++) { c.beginPath(); c.moveTo(x, y + j * cell); c.lineTo(x + w, y + j * cell); c.stroke(); }
  c.restore();
}
function pylon(c, x, y, w, h, col, o = {}) { // temple gateway tower: battered walls, torus edge, cavetto cornice, reliefs
  const lt = mix(col, '#fff6e4', 0.3), dk = mix(col, '#1a0c06', 0.45), bat = w * 0.09;
  const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, lt); g.addColorStop(0.6, col); g.addColorStop(1, dk);
  c.fillStyle = g; c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x - w / 2 + bat, y - h); c.lineTo(x + w / 2 - bat, y - h); c.lineTo(x + w / 2, y); c.closePath(); c.fill();
  c.fillStyle = mix(col, '#1a0c06', 0.2); c.beginPath(); c.moveTo(x - w / 2 + bat - w * 0.04, y - h); c.quadraticCurveTo(x - w / 2 + bat - w * 0.06, y - h - h * 0.07, x - w / 2 + bat - w * 0.1, y - h - h * 0.1);
  c.lineTo(x + w / 2 - bat + w * 0.1, y - h - h * 0.1); c.quadraticCurveTo(x + w / 2 - bat + w * 0.06, y - h - h * 0.07, x + w / 2 - bat + w * 0.04, y - h); c.closePath(); c.fill(); // cavetto
  c.fillStyle = hexA(lt, 0.7); c.fillRect(x - w / 2 + bat - w * 0.1, y - h - h * 0.1, w - 2 * bat + w * 0.2, Math.max(2, h * 0.008));
  c.save(); c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x - w / 2 + bat, y - h); c.lineTo(x + w / 2 - bat, y - h); c.lineTo(x + w / 2, y); c.closePath(); c.clip();
  glyphs(c, x - w / 2 + bat + w * 0.08, y - h * 0.86, w - 2 * bat - w * 0.16, h * 0.55, dk, o.seed || 3, 0.35);
  c.strokeStyle = hexA(dk, 0.18); c.lineWidth = 2; for (let k = 1; k < 18; k++) { c.beginPath(); c.moveTo(x - w, y - h * k / 18); c.lineTo(x + w, y - h * k / 18); c.stroke(); } // courses
  if (o.banner) { [-0.3, 0.3].forEach((q, i) => { c.fillStyle = i ? o.banner : mix(o.banner, '#000000', 0.2); c.fillRect(x + q * w - w * 0.05, y - h * 0.95, w * 0.1, h * 0.55); }); }
  c.restore();
}
function obelisk(c, x, y, w, h, col) {
  const lt = mix(col, '#fff6e4', 0.35), dk = mix(col, '#1a0c06', 0.45);
  c.fillStyle = lt; c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x - w * 0.32, y - h); c.lineTo(x, y - h - w * 0.5); c.lineTo(x, y); c.closePath(); c.fill();
  c.fillStyle = dk; c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w * 0.32, y - h); c.lineTo(x, y - h - w * 0.5); c.lineTo(x, y); c.closePath(); c.fill();
  c.fillStyle = '#f6d880'; c.beginPath(); c.moveTo(x - w * 0.32, y - h); c.lineTo(x, y - h - w * 0.5); c.lineTo(x + w * 0.32, y - h); c.closePath(); c.fill();
  glyphs(c, x - w * 0.3, y - h * 0.9, w * 0.3, h * 0.8, mix(col, '#1a0c06', 0.3), 17, 0.35);
}
function pyramid2(c, x, y, w, h, lit, dk, a = 1) {
  c.save(); c.globalAlpha *= a;
  c.fillStyle = lit; c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x - w * 0.06, y - h); c.lineTo(x + w * 0.1, y); c.closePath(); c.fill();
  c.fillStyle = dk; c.beginPath(); c.moveTo(x + w * 0.1, y); c.lineTo(x - w * 0.06, y - h); c.lineTo(x + w / 2, y); c.closePath(); c.fill();
  c.strokeStyle = hexA(mix(dk, '#000000', 0.3), 0.25); c.lineWidth = 1.5;
  for (let k = 1; k < 16; k++) { const q = k / 16, yy = y - h * q; c.beginPath(); c.moveTo(lerp(x - w / 2, x - w * 0.06, q), yy); c.lineTo(lerp(x + w / 2, x - w * 0.06, q), yy); c.stroke(); }
  c.restore();
}

// ---------- water
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
function reeds(c, x, y, s, t, seed, col = '#4a6a2a') { // papyrus clump: stems with umbels
  const r = rng(seed), dk = mix(col, '#000000', 0.35);
  for (let i = 0; i < 9; i++) {
    const a = (r() - 0.5) * 0.5, l = (160 + r() * 140) * s, sw = Math.sin(t * 1.2 + i + seed) * 6 * s, bx = x + (r() - 0.5) * 60 * s;
    const ex = bx + Math.sin(a) * l + sw, ey = y - Math.cos(a) * l;
    c.strokeStyle = i % 2 ? col : dk; c.lineWidth = 3.5 * s; c.beginPath(); c.moveTo(bx, y); c.quadraticCurveTo(bx + Math.sin(a) * l * 0.5, y - l * 0.55, ex, ey); c.stroke();
    c.fillStyle = i % 2 ? mix(col, '#c8d070', 0.3) : col; c.beginPath(); c.moveTo(ex, ey);
    for (let k = 0; k <= 8; k++) { const an = -Math.PI / 2 + (k / 8 - 0.5) * 2.2; c.lineTo(ex + Math.cos(an) * 34 * s, ey + Math.sin(an) * 30 * s - 4 * s); } c.closePath(); c.fill();
  }
}
function chest(c, x, y, s, t, glowA = 0, o = {}) { // the wooden chest (tabut) carrying the baby, bundle wrapped in white cloth
  c.save(); c.translate(x, y); c.rotate(o.rock === undefined ? Math.sin(t * 1.6) * 0.04 : o.rock); c.scale(s, s);
  if (glowA > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -30, 220, '#fff2d0', 0.35 * glowA); c.restore(); }
  c.fillStyle = '#f4f0e6'; c.beginPath(); c.ellipse(0, -38, 44, 20, 0, Math.PI, 0); c.fill(); // cloth bundle (no face, ever)
  c.fillStyle = '#e4ddcc'; c.beginPath(); c.ellipse(-18, -42, 22, 14, -0.3, 0, 6.283); c.fill();
  const g = c.createLinearGradient(0, -40, 0, 10); g.addColorStop(0, '#9a6a3a'); g.addColorStop(1, '#4a2e16');
  c.fillStyle = g; c.beginPath(); c.moveTo(-70, -36); c.lineTo(70, -36); c.lineTo(62, 8); c.lineTo(-62, 8); c.closePath(); c.fill();
  c.strokeStyle = '#2e1a0c'; c.lineWidth = 3; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(-68 + k * 2, -36 + k * 11); c.lineTo(68 - k * 2, -36 + k * 11); c.stroke(); }
  c.fillStyle = GOLD; c.fillRect(-70, -40, 140, 6); [-44, 0, 44].forEach(bx => c.fillRect(bx - 3, -36, 6, 44));
  c.fillStyle = '#6a4424'; c.save(); c.translate(64, -40); c.rotate(-1.1); c.fillRect(0, -3, 50, 7); c.restore(); // lid ajar
  c.restore();
}
function ripplesAround(c, x, y, s, t, a = 1) { for (let k = 0; k < 3; k++) { const ph = (t * 0.5 + k / 3) % 1; c.strokeStyle = `rgba(230,245,255,${0.35 * a * (1 - ph)})`; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y, (80 + ph * 140) * s, (10 + ph * 18) * s, 0, 0, 6.283); c.stroke(); } }

// ---------- the light in the tree on Mount Tur (no form, no figure: only light)
function sacredTree(c, x, y, s, t, a) {
  c.save(); c.translate(x, y); c.scale(s, s);
  if (a > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -150, 620, '#ffcf80', 0.45 * a); glow(c, 0, -150, 260, '#fff6e0', 0.55 * a); c.restore(); }
  const dk = '#2a1a10'; c.strokeStyle = dk; c.lineCap = 'round';
  [[0, 0, -10, -90, -70, -170, 18], [0, -60, 30, -120, 80, -190, 13], [-40, -140, -80, -180, -130, -200, 8], [50, -150, 100, -190, 140, -215, 7], [0, -100, 0, -170, 10, -250, 10]].forEach(([a0, b0, cx, cy, ex, ey, w]) => {
    c.lineWidth = w; c.beginPath(); c.moveTo(a0, b0); c.quadraticCurveTo(cx, cy, ex, ey); c.stroke(); });
  const r = rng(5);
  for (let i = 0; i < 16; i++) { const lx = -150 + r() * 300, ly = -170 - r() * 110; // green leaves: the tree is not consumed
    c.fillStyle = i % 2 ? '#3a5a2a' : '#4a6a30'; c.beginPath(); c.ellipse(lx, ly, 26 + r() * 20, 14, r() * 3, 0, 6.283); c.fill(); }
  if (a > 0) { c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 22; i++) { const fx = -140 + rng(i + 9)() * 280, fy = -160 - rng(i + 3)() * 120, fh = (40 + 30 * Math.sin(t * 5 + i)) * a;
      const g = c.createRadialGradient(fx, fy - fh * 0.4, 0, fx, fy - fh * 0.4, fh); g.addColorStop(0, `rgba(255,250,230,${0.55 * a})`); g.addColorStop(0.5, `rgba(255,200,110,${0.3 * a})`); g.addColorStop(1, 'rgba(255,150,60,0)');
      c.fillStyle = g; c.beginPath(); c.ellipse(fx, fy - fh * 0.4, fh * 0.45, fh, Math.sin(t * 3 + i) * 0.2, 0, 6.283); c.fill(); }
    c.restore(); }
  c.restore();
}

// ---------- the serpent (staff -> serpent). grow 0 = a staff lying, 1 = a great serpent; rise lifts the head
function serpent(c, x, y, s, t, o = {}) {
  const L = (o.len || 520) * s, dir = o.dir || 1, grow = clamp(o.grow === undefined ? 1 : o.grow), rise = o.rise || 0, N = 48, sp = o.speed || 4;
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, wave = Math.sin(u * 2.6 * Math.PI - t * sp) * 36 * s * (0.4 + 0.6 * u) * (u < 0.78 ? 1 : 1 - (u - 0.78) / 0.22);
    const hu = clamp((u - 0.7) / 0.3), lift = rise * hu * hu * 230 * s;
    const sx = x + dir * u * L * lerp(0.6, 1, grow), sy = y + lerp(0, wave, grow) - lerp(0, lift, grow);
    pts.push([sx, sy]);
  }
  const width = u => lerp(9 * s, s * (8 + 40 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.08 + 0.02)), 0.5)), grow) * (u > 0.94 ? 1.25 : 1);
  const L1 = [], R1 = [];
  pts.forEach((p, i) => { const q = pts[Math.min(N, i + 1)], pr = pts[Math.max(0, i - 1)], dx = q[0] - pr[0], dy = q[1] - pr[1], l = Math.hypot(dx, dy) || 1, w = width(i / N) / 2;
    L1.push([p[0] - dy / l * w, p[1] + dx / l * w]); R1.push([p[0] + dy / l * w, p[1] - dx / l * w]); });
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(x + dir * L * 0.45, y + 18 * s, L * 0.55, 16 * s, 0, 0, 6.283); c.fill();
  const body = mix('#5a4a1e', '#3a4a22', grow), g = c.createLinearGradient(0, y - 60 * s, 0, y + 40 * s); g.addColorStop(0, mix(body, '#c8b070', 0.35)); g.addColorStop(1, mix(body, '#000000', 0.4));
  c.fillStyle = grow < 0.3 ? mix('#6a4a2a', body, grow / 0.3) : g; c.beginPath(); c.moveTo(L1[0][0], L1[0][1]); L1.forEach(p => c.lineTo(p[0], p[1])); [...R1].reverse().forEach(p => c.lineTo(p[0], p[1])); c.closePath(); c.fill();
  if (grow > 0.3) { c.save(); c.globalAlpha *= seg(grow, 0.3, 0.8); // scales and belly line
    c.strokeStyle = 'rgba(220,200,130,0.35)'; c.lineWidth = 3 * s; c.beginPath(); R1.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke();
    for (let i = 2; i < N - 2; i += 2) { const [px, py] = pts[i], w = width(i / N) * 0.28; c.fillStyle = i % 4 ? 'rgba(20,16,6,0.45)' : 'rgba(200,180,110,0.3)'; c.beginPath(); c.moveTo(px - w, py); c.lineTo(px, py - w * 0.8); c.lineTo(px + w, py); c.lineTo(px, py + w * 0.8); c.closePath(); c.fill(); }
    // head
    const [hx, hy] = pts[N], [qx, qy] = pts[N - 3], ang = Math.atan2(hy - qy, hx - qx), hs = s * lerp(0.4, 1, grow), open = o.open || 0;
    c.save(); c.translate(hx, hy); c.rotate(ang);
    c.fillStyle = mix(body, '#000000', 0.15); c.beginPath(); c.moveTo(-20 * hs, -26 * hs); c.quadraticCurveTo(40 * hs, -30 * hs - open * 10 * hs, 62 * hs, -6 * hs - open * 16 * hs); c.lineTo(0, -2 * hs); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(-20 * hs, 26 * hs); c.quadraticCurveTo(40 * hs, 26 * hs + open * 10 * hs, 58 * hs, 8 * hs + open * 16 * hs); c.lineTo(0, 2 * hs); c.closePath(); c.fill();
    if (open > 0.2) { c.fillStyle = '#5a1a14'; c.beginPath(); c.moveTo(2 * hs, 0); c.lineTo(58 * hs, -4 * hs - open * 14 * hs); c.lineTo(56 * hs, 6 * hs + open * 14 * hs); c.closePath(); c.fill(); }
    c.fillStyle = '#e8c040'; c.beginPath(); c.ellipse(26 * hs, -14 * hs, 5 * hs, 3.5 * hs, 0.2, 0, 6.283); c.fill(); c.fillStyle = '#100800'; c.fillRect(25 * hs, -17 * hs, 2 * hs, 6 * hs);
    if (Math.sin(t * 6) > 0.3) { c.strokeStyle = '#b02a2a'; c.lineWidth = 2.5 * hs; c.beginPath(); c.moveTo(60 * hs, 0); c.lineTo(84 * hs, 0); c.lineTo(94 * hs, -6 * hs); c.moveTo(84 * hs, 0); c.lineTo(94 * hs, 6 * hs); c.stroke(); }
    c.restore(); c.restore(); }
  return pts[N];
}
function ropes(c, t, x0, x1, y, n, seed, wig, gone = []) { // the magicians' ropes; wig = the illusion that they move
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const cx = lerp(x0, x1, (i + 0.5) / n) + (r() - 0.5) * 40, cy = y + (r() - 0.5) * 70, L = 140 + r() * 120, ph = r() * 6, a = 1 - (gone[i] || 0);
    if (a <= 0) continue;
    c.save(); c.globalAlpha *= a; c.translate(cx, cy); c.scale(lerp(1, 0.2, gone[i] || 0), lerp(1, 0.2, gone[i] || 0));
    c.strokeStyle = '#7a5a34'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath();
    for (let k = 0; k <= 20; k++) { const q = k / 20, xx = (q - 0.5) * L, yy = Math.sin(q * 9 + ph + t * 7 * wig) * (8 + 14 * wig) + Math.sin(q * 3 + ph) * 10; k ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke();
    c.strokeStyle = 'rgba(40,24,10,0.6)'; c.lineWidth = 2; c.setLineDash([5, 7]); c.stroke(); c.setLineDash([]);
    c.restore();
  }
  if (wig > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, (x0 + x1) / 2, y, (x1 - x0) * 0.6, '#a070ff', 0.12 * wig * (0.7 + 0.3 * Math.sin(t * 9))); c.restore(); }
}

// ---------- horses, chariots, the army
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
function chariot(c, x, y, s, t, dir = 1, o = {}) { // horse + light chariot with a spoked wheel + a soldier standing in it
  const dist = o.dist === undefined ? t * 300 * s : o.dist;
  horse(c, x + dir * 150 * s, y, s, t + (o.k || 0) * 0.37, dir, o.col || '#3a2a20');
  const wx = x - dir * 40 * s, wy = y - 46 * s, wr = 46 * s;
  c.strokeStyle = '#3a2614'; c.lineWidth = 6 * s; c.beginPath(); c.moveTo(wx, wy - 30 * s); c.lineTo(x + dir * 110 * s, y - 110 * s); c.stroke(); // pole
  fig(c, o.who || SOLDIER, { x: wx - dir * 6 * s, y: y - 50 * s, h: 230 * s, dir, t, light: o.light || 0.7, shadow: false, ink: o.ink, armUp: o.armUp || 0 });
  if (o.spear !== false) spearOf(c, { x: wx - dir * 6 * s, y: y - 50 * s, h: 230 * s, dir });
  if (o.crown) nemes(c, { x: wx - dir * 6 * s, y: y - 50 * s, h: 230 * s, dir });
  c.fillStyle = o.box || '#8a5a2a'; c.beginPath(); c.moveTo(wx - dir * 40 * s, wy + 10 * s); c.lineTo(wx - dir * 40 * s, wy - 70 * s); c.quadraticCurveTo(wx + dir * 30 * s, wy - 80 * s, wx + dir * 46 * s, wy - 10 * s); c.lineTo(wx + dir * 46 * s, wy + 10 * s); c.closePath(); c.fill();
  c.fillStyle = GOLD; c.fillRect(wx - 40 * s, wy - 46 * s, 80 * s, 5 * s);
  c.strokeStyle = '#2a1a0c'; c.lineWidth = 7 * s; c.beginPath(); c.arc(wx, wy, wr, 0, 6.283); c.stroke();
  const rot = -dir * dist / wr; c.lineWidth = 3.5 * s; for (let k = 0; k < 6; k++) { const a = rot + k * Math.PI / 3; c.beginPath(); c.moveTo(wx, wy); c.lineTo(wx + Math.cos(a) * wr, wy + Math.sin(a) * wr); c.stroke(); }
  c.fillStyle = GOLD; c.beginPath(); c.arc(wx, wy, 7 * s, 0, 6.283); c.fill();
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
function torchLine(c, t, x0, x1, y, n, a = 1, seed = 4) { const r = rng(seed); c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, i / (n - 1)) + (r() - 0.5) * 20, yy = y + (r() - 0.5) * 16; glow(c, x, yy, 40 + r() * 20, '#ff8a3a', a * (0.5 + 0.2 * Math.sin(t * 9 + i))); c.fillStyle = `rgba(255,230,170,${a})`; c.beginPath(); c.arc(x, yy, 3, 0, 6.283); c.fill(); }
  c.restore(); }

// ---------- the sea and the path through it (perspective toward a vanishing point; u = 0 near .. 1 horizon)
const CP = u => 1 / (1 + u * 14);
function corrGeo(o = {}) { const vx = o.vx === undefined ? 540 : o.vx, hy = o.hy || 900, yb = o.yb || 2500, hw = o.hw || 1500; return { vx, hy, yb, hw, Y: u => hy + (yb - hy) * CP(u) }; }
function seaFlat(c, t, hy, o = {}) { // open sea from the horizon down: perspective swell lines + glitter under the light
  const G = corrGeo(Object.assign({}, o, { hy })), top = o.top || '#4a7a90', bot = o.bot || '#0e2a38';
  const g = c.createLinearGradient(0, hy, 0, H + 200); g.addColorStop(0, top); g.addColorStop(0.25, mix(top, bot, 0.6)); g.addColorStop(1, bot);
  c.fillStyle = g; c.fillRect(-400, hy, W + 800, H + 600 - hy);
  for (let j = 0; j < 46; j++) { const u = 1 - j / 46, y = G.Y(u) + Math.sin(t * 1.2 + j) * 2 * CP(u), a = (0.06 + 0.2 * (1 - u)) * (o.a || 1);
    c.strokeStyle = j % 2 ? `rgba(220,240,250,${a})` : `rgba(0,20,30,${a * 1.2})`; c.lineWidth = 1 + 4 * CP(u);
    c.beginPath(); for (let x = -400; x <= W + 400; x += 30) { const v = y + Math.sin(x * 0.012 / CP(u) * 0.2 + t * 1.6 + j * 2.3) * 6 * CP(u) * 6; x === -400 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); }
  if (o.sunX !== undefined) { c.save(); c.globalCompositeOperation = 'lighter'; const r = rng(7);
    for (let i = 0; i < 90; i++) { const u = Math.pow(r(), 0.7), y = G.Y(u), w = 40 + 260 * CP(u) * r(), x = o.sunX + (r() - 0.5) * (30 + 900 * CP(u)) ;
      c.fillStyle = `rgba(255,238,200,${(o.glit || 0.5) * (0.3 + 0.7 * Math.sin(t * 2.4 + i * 1.3) ** 2)})`; c.fillRect(x - w / 2, y, w, 1 + 4 * CP(u)); }
    c.restore(); }
}
// k: 0 flat sea .. 1 walls risen ("like a great mountain"); collapse: 0..1 walls fall back in; u0: a beach in front
function corridor(c, t, k, o = {}) {
  const G = corrGeo(o), N = 40, u0 = o.u0 || 0, UU = i => u0 + (1 - u0) * Math.pow(i / N, 1.35), open = ease(clamp(k * 1.5)), ratio = (o.ratio || 2.7) * ease(clamp(k)), col = o.collapse || 0;
  const half = u => G.hw * CP(u) * open * (1 - col * 0.85);
  const top = (u, side) => G.hy - (ratio - 1) * (G.Y(u) - G.hy) - ((noise1(u * 7 + t * 0.35, side + 3) - 0.5) * 120 + Math.sin(u * 40 - t * 1.5 + side) * 25) * CP(u) * k;
  const lean = (u, side) => col * (G.Y(u) - top(u, side)) * 0.6; // the crest curls inward when the sea closes
  if (open > 0) { // the sea bed: wet sand, ripple marks, pools reflecting the light, shells and weed
    c.save(); c.beginPath();
    for (let i = 0; i <= N; i++) { const u = UU(i); c.lineTo(G.vx - half(u), G.Y(u)); }
    for (let i = N; i >= 0; i--) { const u = UU(i); c.lineTo(G.vx + half(u), G.Y(u)); }
    c.closePath(); c.clip();
    const g = c.createLinearGradient(0, G.hy, 0, H + 300); g.addColorStop(0, o.floorFar || '#d8c0a0'); g.addColorStop(0.12, o.floorMid || '#a08868'); g.addColorStop(1, o.floorNear || '#4e3e2c');
    c.fillStyle = g; c.fillRect(-300, G.hy - 10, W + 600, H + 600);
    for (let j = 0; j < 46; j++) { const u = Math.pow(j / 46, 1.3), y = G.Y(u); c.strokeStyle = `rgba(40,26,12,${0.22 * (1 - u)})`; c.lineWidth = 1 + 3 * CP(u);
      c.beginPath(); for (let x = G.vx - half(u) * 1.05; x <= G.vx + half(u) * 1.05; x += 12) { const v = y + Math.sin(x * 0.02 / CP(u) * 0.3 + j * 1.3) * 5 * CP(u) * 3; x <= G.vx - half(u) * 1.05 + 1 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); }
    const r = rng(19);
    for (let i = 0; i < 30; i++) { const u = Math.pow(r(), 0.9), f = (r() - 0.5) * 1.6, x = G.vx + f * half(u), y = G.Y(u), pw = 110 * CP(u) * (0.6 + r());
      const pg = c.createLinearGradient(0, y - 8 * CP(u), 0, y + 12 * CP(u)); pg.addColorStop(0, hexA(o.light || '#fff0d0', 0.45)); pg.addColorStop(1, 'rgba(120,170,190,0.35)');
      c.fillStyle = pg; c.beginPath(); c.ellipse(x, y, pw, pw * 0.13, 0, 0, 6.283); c.fill(); }
    for (let i = 0; i < 60; i++) { const u = Math.pow(r(), 0.8), f = (r() - 0.5) * 1.9, x = G.vx + f * half(u), y = G.Y(u) + r() * 30 * CP(u), sz = (3 + r() * 6) * CP(u) * 3;
      c.fillStyle = i % 3 ? 'rgba(40,30,20,0.5)' : 'rgba(240,226,200,0.7)'; c.beginPath(); c.ellipse(x, y, sz, sz * 0.6, 0, 0, 6.283); c.fill(); }
    c.strokeStyle = 'rgba(40,70,40,0.55)'; c.lineCap = 'round'; for (let i = 0; i < 14; i++) { const u = Math.pow(r(), 0.7), sd = r() > 0.5 ? 1 : -1, x = G.vx + sd * half(u) * (0.8 + r() * 0.15), y = G.Y(u), l = 60 * CP(u) * (1 + r());
      c.lineWidth = 3 * CP(u) * 3; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - sd * l * 0.6, y - l * 0.1, x - sd * l, y + l * 0.05); c.stroke(); }
    const lg = c.createRadialGradient(G.vx, G.hy, 0, G.vx, G.hy, 900); lg.addColorStop(0, hexA(o.light || '#fff0d0', 0.6)); lg.addColorStop(0.5, hexA(o.light || '#fff0d0', 0.12)); lg.addColorStop(1, hexA(o.light || '#fff0d0', 0));
    c.fillStyle = lg; c.fillRect(-300, G.hy - 10, W + 600, H);
    c.restore();
  }
  if (k <= 0.001) return;
  [-1, 1].forEach(side => {
    const P = []; for (let i = 0; i <= N; i++) { const u = UU(i); P.push([G.vx + side * (half(u) - lean(u, side)), top(u, side), G.vx + side * half(u), G.Y(u), u]); }
    const path = () => { c.beginPath(); c.moveTo(side < 0 ? -500 : W + 500, P[0][1]); P.forEach(p => c.lineTo(p[0], p[1])); [...P].reverse().forEach(p => c.lineTo(p[2], p[3])); c.lineTo(side < 0 ? -500 : W + 500, P[0][3] + (u0 > 0 ? 0 : 300)); c.closePath(); };
    const g = c.createLinearGradient(G.vx, 0, G.vx + side * 900, 0); g.addColorStop(0, o.wallFar || '#0a3446'); g.addColorStop(0.3, o.wallMid || '#0f5a74'); g.addColorStop(1, o.wallNear || '#1f7f96');
    path(); c.fillStyle = g; c.fill();
    c.save(); path(); c.clip();
    // bands that follow the perspective: light through the top of the wall, darkness at its foot
    const band = (f0, f1, col, a) => { c.fillStyle = hexA(col, a); c.beginPath(); P.forEach((p, i) => { const x = lerp(p[2], p[0], f1), y = lerp(p[3], p[1], f1); i ? c.lineTo(x, y) : c.moveTo(x, y); });
      [...P].reverse().forEach(p => c.lineTo(lerp(p[2], p[0], f0), lerp(p[3], p[1], f0))); c.closePath(); c.fill(); };
    const lc = o.glowCol || '#9ff0f0';
    [[0.55, 1, 0.08], [0.7, 1, 0.1], [0.82, 1, 0.12], [0.92, 1, 0.16]].forEach(([f0, f1, a]) => band(f0, f1, lc, a));
    [[0, 0.3, 0.18], [0, 0.15, 0.22], [0, 0.06, 0.25]].forEach(([f0, f1, a]) => band(f0, f1, '#03121c', a));
    // soft wavy layers inside the water
    for (let f = 0.12; f < 0.95; f += 0.085) { c.strokeStyle = `rgba(200,250,255,${0.05 + 0.04 * Math.sin(t * 1.1 + f * 23)})`; c.lineWidth = 3 + 6 * f;
      c.beginPath(); P.forEach((p, i) => { const x = lerp(p[2], p[0], f), y = lerp(p[3], p[1], f) + Math.sin(t * 0.9 + f * 17 + i * 0.5) * 14 * CP(p[4]) * 3; i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke(); }
    // caustic glints drifting on the face
    c.save(); c.globalCompositeOperation = 'lighter'; const rc = rng(side + 11);
    for (let i = 0; i < 46; i++) { const u = u0 + (1 - u0) * Math.pow(rc(), 1.8), f = 0.2 + rc() * 0.75, p = P[Math.min(N, Math.round(Math.pow((u - u0) / (1 - u0), 1 / 1.35) * N))], x = lerp(p[2], p[0], f) + side * Math.sin(t * 0.6 + i) * 40 * CP(u) * 3, y = lerp(p[3], p[1], f) + Math.cos(t * 0.5 + i) * 30 * CP(u) * 3, rr = 90 * CP(u) * 3 * (0.5 + rc());
      const cg = c.createRadialGradient(x, y, 0, x, y, rr); cg.addColorStop(0, `rgba(170,255,250,${0.08 * (0.5 + 0.5 * Math.sin(t * 1.7 + i))})`); cg.addColorStop(1, 'rgba(170,255,250,0)'); c.fillStyle = cg; c.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    c.restore();
    // fine streaks running down
    const r = rng(side + 40);
    for (let i = 0; i < 40; i++) { const u = u0 + (1 - u0) * Math.pow(r(), 1.6), x0 = G.vx + side * (half(u) + r() * 300 * CP(u) * 3), yT = top(u, side), yB = G.Y(u), Lh = yB - yT;
      const ph = (t * (0.2 + r() * 0.25) + r()) % 1, y = yT + ph * Lh, l = Lh * (0.05 + r() * 0.08);
      c.strokeStyle = `rgba(220,250,255,${0.12 * (1 - u) * Math.sin(ph * Math.PI)})`; c.lineWidth = 1 + 3 * CP(u); c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + side * 2, y + l); c.stroke(); }
    if (o.fish !== false) for (let i = 0; i < 10; i++) { const u = u0 + 0.03 + r() * 0.4, f = 0.2 + r() * 0.6, p = P[Math.min(N, Math.round(Math.pow((u - u0) / (1 - u0), 1 / 1.35) * N))], fs = 30 * CP(u) * 3 * (0.5 + r());
      const fx = lerp(p[2], p[0], f) + side * (60 + r() * 260) * CP(u) * 3 + Math.sin(t * 0.5 + i) * 30 * CP(u), fy = lerp(p[3], p[1], f);
      c.fillStyle = 'rgba(4,22,32,0.4)'; c.beginPath(); c.ellipse(fx, fy, fs, fs * 0.35, 0, 0, 6.283); c.fill(); c.beginPath(); c.moveTo(fx - side * fs * 0.9, fy); c.lineTo(fx - side * fs * 1.5, fy - fs * 0.45); c.lineTo(fx - side * fs * 1.5, fy + fs * 0.45); c.fill(); }
    c.restore();
    // bright inner edge (the cut face catches the light), foam crest, foam at the foot
    // foam crest, foam at the foot
    c.strokeStyle = 'rgba(245,252,255,0.9)'; c.lineCap = 'round';
    for (let i = 0; i < N; i++) { const p = P[i], q = P[i + 1]; c.lineWidth = 3 + 22 * CP(p[4]) * (0.7 + 0.3 * Math.sin(t * 3 + i)); c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke(); }
    c.strokeStyle = 'rgba(235,250,255,0.55)'; for (let i = 0; i < N; i++) { const p = P[i], q = P[i + 1]; c.lineWidth = 2 + 14 * CP(p[4]); c.beginPath(); c.moveTo(p[2], p[3]); c.lineTo(q[2], q[3]); c.stroke(); }
    const rs = rng(side + 70); c.fillStyle = 'rgb(240,250,255)';
    for (let i = 0; i < 90; i++) { const u = u0 + (1 - u0) * Math.pow(rs(), 1.4), p = P[Math.min(N, Math.round(Math.pow((u - u0) / (1 - u0), 1 / 1.35) * N))], ph = (t * (0.4 + rs()) + rs()) % 1, sz = (2 + 6 * rs()) * CP(u) * 3;
      c.globalAlpha = 0.7 * (1 - ph); c.beginPath(); c.arc(p[0] + side * (rs() - 0.7) * 80 * CP(u) * 3, p[1] - ph * 140 * CP(u) * 3 + ph * ph * 110 * CP(u) * 3, sz, 0, 6.283); c.fill(); }
    c.globalAlpha = 1;
  });
}
// people walking inside the corridor: list of {f (-1..1 across), u (depth), who}
function corridorPeople(c, t, list, o = {}) {
  const G = corrGeo(o), open = ease(clamp((o.k === undefined ? 1 : o.k) * 1.5));
  list.slice().sort((a, b) => b.u - a.u).forEach(p => { if (p.u < 0 || p.u > 0.98) return;
    const x = G.vx + p.f * G.hw * CP(p.u) * open * 0.75, y = G.Y(p.u), h = (p.h || 820) * CP(p.u);
    fig(c, p.who, Object.assign({ x, y, h, dir: p.dir || 1, walk: p.walk, light: p.light || 0.8, t, wind: 0.5, ink: Math.min(1, CP(p.u) * 2) }, p.o || {}));
    if (p.staff) staffAt(c, Object.assign({ x, y, h, dir: p.dir || 1 }, p.o || {}), p.staffAng); });
}
function staffAt(c, o, ang) { // Moussa's staff held in the near hand (armUp / reach), at angle ang (rad, 0 = upright)
  const [hx, hy] = handOf(o), s = (o.h || 300) / 300, d = o.dir || 1, a = ang === undefined ? 0.1 : ang;
  const L1 = 70 * s, L2 = 250 * s, ux = Math.sin(a) * d, uy = -Math.cos(a);
  c.strokeStyle = '#4a3020'; c.lineWidth = 9 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx - ux * L2, hy - uy * L2); c.lineTo(hx + ux * L1, hy + uy * L1); c.stroke();
  c.strokeStyle = '#7a5537'; c.lineWidth = 3 * s; c.beginPath(); c.moveTo(hx - ux * L2 - 2 * s, hy - uy * L2); c.lineTo(hx + ux * L1 - 2 * s, hy + uy * L1); c.stroke();
  return [hx + ux * L1, hy + uy * L1];
}
// HERO shot (hook + cta + outro): the path through the parted sea at dawn. T is continuous across cta -> outro -> hook,
// so the last frame of the video is exactly its first frame (seamless loop).
function heroShot(c, T, o = {}) {
  const HY = 840, z = 1.1 - (T > 0 ? 0.08 * easeOut(clamp(T / 6)) : -0.04 * clamp(-T / 9)), tt = o.tTilt || 2.4, cy = T > 0 ? lerp(1000, 800, ease(seg(T, tt, tt + 2.6))) : 1000;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); sky(c, [[0, '#121c3a'], [0.22, '#33406e'], [0.36, '#b88480'], [0.44, '#f6c890']]); c.restore();
  cam(c, z, W / 2, cy);
  stars(c, T + 30, 50, 7, [0, -700, W, 900], 0.55);
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, HY, 560, '#ffd8a0', 0.55); rays(c, 540, HY, -Math.PI / 2, 1.2, 1500, 10, '#ffe0b0', 0.05, T, 3); c.restore();
  sun(c, 540, HY + 10, 46, '#fff0c8', 0.9);
  ridge(c, HY + 4, 10, 0.01, 4, '#4a3e4a');
  seaFlat(c, T, HY + 4, { sunX: 540, top: '#7a90a8', bot: '#0e2a38' });
  corridor(c, T, 1, { hy: HY, light: '#ffe8c0' });
  const ppl = [];
  for (let i = 0; i < 18; i++) { const u = 0.16 + i * 0.045 + T * 0.01, f = ((i * 37) % 11) / 11 * 1.3 - 0.65; ppl.push({ u, f, who: Object.assign({}, FOLK[i % FOLK.length], { lantern: i % 5 === 2 }), walk: u * 140 + i * 0.4, o: { child: i % 7 === 3 } }); }
  corridorPeople(c, T, ppl, { hy: HY });
  const G = corrGeo({ hy: HY }), mu = 0.145, mx = 400, my = G.Y(mu), mh = 820 * CP(mu) * 1.3;
  fig(c, MUSA, { x: mx, y: my, h: mh, dir: 1, armUp: 0.85, light: 1, t: T, wind: 0.7 });
  staffAt(c, { x: mx, y: my, h: mh, dir: 1, armUp: 0.85 }, 0.15);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
function seriesTag(c, a, ep = 7) { textGlow(c, `LES PROPHÈTES  ·  ÉPISODE ${ep}`, W / 2, 112, '600 32px Lora', '#fbe7c6', a * 0.92, '#000000', 12); }

// ---------- shared pieces of the scenes
function shoreRocks(c, t, x, y, s, col, seed) { rock(c, x, y, 520 * s, 300 * s, col, seed, { sharp: 0.8, grooves: 5, domes: 3, bumps: 4 }); }
function foamLine(c, t, pts, a = 0.7) { c.strokeStyle = `rgba(240,250,255,${a})`; c.lineCap = 'round';
  for (let i = 0; i < pts.length - 1; i++) { c.lineWidth = 3 + 4 * Math.abs(Math.sin(t * 2 + i)); c.beginPath(); c.moveTo(pts[i][0], pts[i][1]); c.lineTo(pts[i + 1][0], pts[i + 1][1]); c.stroke(); } }
function beach(c, t, y, col, seed = 1) { // sand from y down, a wet strip and a foam edge that comes and goes
  const g = c.createLinearGradient(0, y, 0, H + 300); g.addColorStop(0, mix(col, '#3a3020', 0.35)); g.addColorStop(0.06, col); g.addColorStop(1, mix(col, '#000000', 0.35));
  c.fillStyle = g; c.beginPath(); c.moveTo(-1600, y); for (let x = -1600; x <= W + 600; x += 20) c.lineTo(x, y + Math.sin(x * 0.006 + seed) * 10); c.lineTo(W + 600, H + 400); c.lineTo(-1600, H + 400); c.closePath(); c.fill();
  const sw = Math.sin(t * 0.9 + seed) * 10; c.strokeStyle = 'rgba(240,250,255,0.6)'; c.lineWidth = 4;
  c.beginPath(); for (let x = -500; x <= W + 500; x += 20) { const v = y - 2 + sw + Math.sin(x * 0.006 + seed) * 10 + Math.sin(x * 0.03 + t * 2) * 3; x === -500 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke();
  c.strokeStyle = hexA(mix(col, '#000000', 0.3), 0.25); c.lineWidth = 3;
  for (let i = 0; i < 9; i++) { const yy = y + 60 + i * i * 9 + i * 24; c.beginPath(); for (let x = -500; x <= W + 500; x += 24) { const v = yy + Math.sin(x * 0.01 + i * 1.7 + seed) * (5 + i); x === -500 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); }
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

const SCENES = {
  // 1. HOOK — the sea split in two, walls "like a great mountain" (Ash-Shu'ara 63). First frame = last frame.
  hook: {
    grade: 'rgba(255,190,140,0.16)',
    draw(c, t, d) {
      const tF = at('hook', 'fendue', 0, 1.0), tM = at('hook', 'montagne', 0, 4.6);
      heroShot(c, t, { tTilt: at('hook', 'Chaque', 0, 2.4) - 0.3 });
      const fl = seg(t, tF - 0.05, tF + 0.6); if (fl > 0 && fl < 1) { c.fillStyle = `rgba(255,250,235,${0.2 * (1 - fl)})`; c.fillRect(0, 0, W, H); }
      seriesTag(c, 1);
      c.save(); c.direction = 'rtl'; textGlow(c, 'فَانفَلَقَ', W / 2, 300, '700 130px Amiri', '#f6c453', 1 - seg(t, tM - 0.9, tM - 0.3), '#ffb300', 30); c.restore();
      arabicCaption(c, 'كَالطَّوْدِ الْعَظِيمِ', t, tM - 0.25, d + 1, 300, 120);
      textGlow(c, 'Ash-Shuʿarāʾ, 63', W / 2, 410, 'italic 500 34px Lora', '#f3e7d0', seg(t, tM + 0.3, tM + 1.0) * 0.85, '#000', 10);
    },
  },

  // 2. Title — Moussa on the rocks before dawn; "what he said facing the sea..." (open loop), the army's dust far behind
  promise: {
    grade: 'rgba(170,150,255,0.14)',
    draw(c, t, d) {
      const tD = at('promise', 'dit', 0, 4), tP = at('promise', 'perdu', 0, 7), tJ = at('promise', 'jamais', 0, 9);
      const dark = ramp(t, tP - 0.6, 1.0), push = ease(seg(t, tD - 0.5, d)), pulse = Math.exp(-Math.pow((t - tJ) * 3, 2));
      cam(c, 1.0 + 0.16 * push, lerp(540, 470, push), lerp(1080, 1020, push));
      sky(c, [[0, mix('#1a1a3e', '#100c1c', dark)], [0.35, mix('#4a3a6a', '#2a1a2a', dark)], [0.5, mix('#c88a8a', '#7a3a2a', dark)], [0.56, mix('#f2b88a', '#a8502a', dark)]]);
      stars(c, t, 70, 12, [0, -200, W, 700], 0.6 * (1 - dark * 0.5));
      wisps(c, t, 420, 7, '#f0c0b0', 0.22, 4, 6);
      ridge(c, 1000, 12, 0.008, 3, '#3a2a3a');
      // the army far behind on the horizon, appearing on "perdu"
      if (dark > 0) { c.save(); c.globalAlpha = dark; c.globalCompositeOperation = 'lighter'; glow(c, 120, 990, 420, '#ff7a3a', 0.35); c.restore(); c.save(); c.globalAlpha = dark; dustCloud(c, t, -160, 460, 990, 380, '#9a5a42', 0.45, 5); torchLine(c, t, -120, 430, 985, 26, 1, 7); spearLine(c, t, -120, 430, 998, 40, 36, '#1a0e10', 9); c.restore(); }
      seaFlat(c, t, 1000, { sunX: 760, top: '#7a8aa8', bot: '#141e34', glit: 0.35 });
      // waves breaking on the rocks
      shoreRocks(c, t, 320, 1360, 1.6, '#4a3a3a', 21); shoreRocks(c, t, 900, 1420, 1.1, '#3a2e30', 23);
      foamLine(c, t, [[520, 1250], [640, 1262], [760, 1252], [880, 1262], [1000, 1250], [1120, 1262]], 0.5 + 0.3 * Math.sin(t * 1.4));
      { const rr = rng(4); for (let i = 0; i < 40; i++) { const sp = (t * (0.5 + rr() * 0.4) + rr()) % 1, a0 = -Math.PI / 2 + (rr() - 0.5) * 1.8, v = 80 + rr() * 160; c.fillStyle = `rgba(240,250,255,${0.55 * (1 - sp)})`; c.beginPath(); c.arc(560 + rr() * 360 + Math.cos(a0) * v * sp, 1250 + Math.sin(a0) * v * sp + sp * sp * 120, 2 + rr() * 4, 0, 6.283); c.fill(); } }
      const mo = { x: 360, y: 1196, h: 470, dir: 1, staff: true, light: 1, t, wind: 0.8 };
      fig(c, MUSA, mo);
      if (pulse > 0.01) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 360, 1000, 380, '#fff0d0', 0.25 * pulse); c.restore(); }
      blurred(c, 8, () => { rock(c, 980, 2010, 520, 420, '#1e1618', 27, { sharp: 0.9, grooves: 3 }); });
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a = seg(t, 0.05, 0.6) * (1 - seg(t, tD - 0.8, tD - 0.2));
      seriesTag(c, 1 - seg(t, tD - 0.8, tD - 0.2));
      c.save(); c.direction = 'rtl'; textGlow(c, 'موسى', W / 2, 360 - (1 - easeOut(seg(t, 0.05, 1.0))) * 30, '700 190px Amiri', '#f6c453', a, '#ffb300', 40); c.restore();
      textGlow(c, 'ʿalayhi s-salām', W / 2, 520, 'italic 500 46px Lora', '#fff3dc', a, '#000000', 14);
      textGlow(c, 'Moussa  ·  Moïse', W / 2, 590, '600 42px Lora', '#e8d6b8', a * 0.9, '#000000', 10);
      if (dark > 0) { c.fillStyle = `rgba(20,0,0,${0.12 * dark})`; c.fillRect(0, 0, W, H); }
    },
  },

  // 3. Pharaoh "exalted himself in the land" (Al-Qasas 4) — then the soldiers in the night
  pharaoh: {
    grade: 'rgba(255,170,90,0.24)',
    draw(c, t, d) {
      const tT = at('pharaoh', 'tout-puissant', 0, 2.5), tK = at('pharaoh', 'tuer', 0, d * 0.6);
      phases(c, t, tK - 0.5, 0.6, cc => {
        const push = ease(seg(t, 0, tK)), up = ramp(t, tT - 0.5, 0.6);
        cam(cc, 1.0 + 0.22 * push, lerp(540, 690, push), lerp(1100, 1020, push));
        sky(cc, [[0, '#5a7aa0'], [0.3, '#e0b088'], [0.5, '#f6d6a0']]);
        sun(cc, 220, 560, 70, '#fff2c8', 0.8); wisps(cc, t, 380, 7, '#ffffff', 0.25, 3, 5);
        pyramid2(cc, 200, 1010, 520, 300, '#e6b884', '#a8784e', 0.7); pyramid2(cc, 520, 1010, 340, 190, '#e6b884', '#a8784e', 0.6);
        haze(cc, 1015, 160, '#f6d0a0', 0.55);
        ridge(cc, 1020, 8, 0.004, 5, '#c8945e');
        obelisk(cc, 90, 1110, 50, 380, '#d8aa78'); pylon(cc, 330, 1120, 300, 320, '#d4a474', { seed: 4, banner: '#8a2a22' });
        [[40, 1130, 0.7, 1], [930, 1120, 0.8, 2], [1040, 1135, 0.65, 3]].forEach(([x, y, s, k]) => datePalm(cc, x, y, s, '#4a5a2e', t, k));
        // the royal terrace
        cc.fillStyle = '#c89a68'; cc.fillRect(470, 1130, 700, 70); cc.fillStyle = '#e8c08a'; cc.fillRect(470, 1126, 700, 8); glyphs(cc, 480, 1140, 680, 50, '#7a5232', 9, 0.4);
        for (let i = 0; i < 4; i++) egColumn(cc, 520 + i * 170, 1130, 34, 420, '#e0b888', { band: i % 2 ? LAPIS : '#8a2a22' });
        cc.fillStyle = '#d8aa78'; cc.fillRect(470, 690, 700, 40); cc.fillStyle = '#8a2a22'; cc.fillRect(470, 726, 700, 10);
        const ph = { x: 760, y: 1130, h: 330, dir: -1, armUp: 0.2 + 0.75 * up, light: 1, t };
        fig(cc, PHARAOH, ph); nemes(cc, ph);
        soldier(cc, { x: 600, y: 1130, h: 300, dir: 1, light: 0.8, t }); soldier(cc, { x: 930, y: 1130, h: 300, dir: -1, light: 0.8, t: t + 1 });
        // the Children of Israel hauling a stone block below
        const dist = t * 30, bx = 520 - dist;
        cc.fillStyle = 'rgba(10,6,4,0.3)'; cc.beginPath(); cc.ellipse(bx + 90, 1442, 160, 14, 0, 0, 6.283); cc.fill();
        const bg = cc.createLinearGradient(0, 1300, 0, 1440); bg.addColorStop(0, '#e6c08e'); bg.addColorStop(1, '#a87a4e'); cc.fillStyle = bg; cc.fillRect(bx, 1300, 190, 140);
        cc.strokeStyle = '#5a3a1e'; cc.lineWidth = 4; cc.beginPath(); cc.moveTo(bx, 1350); cc.lineTo(bx - 470, 1250); cc.stroke();
        for (let i = 0; i < 4; i++) { const wx = bx - 110 - i * 110; lean(cc, wx, 1440, -0.25, () => fig(cc, FOLK[i + 1], { x: wx, y: 1440, h: 260, dir: -1, walk: stepOf(dist, 260) + i * 0.3, reach: 0.5, light: 0.7, t })); }
        fgRidge(cc, 1450, 14, 0.004, 9, '#c8945e', { rim: 'rgba(255,230,190,0.5)' });
        blurred(cc, 7, () => { datePalm(cc, 1010, 2050, 2.2, '#2a3418', t, 7); });
      }, cc => {
        // night: soldiers marching through the quarter of the Children of Israel; a mother hides her baby
        const q = t - tK;
        cam(cc, 1.05 + 0.03 * q, W / 2, 1100);
        sky(cc, [[0, '#06080f'], [0.5, '#141a2a'], [1, '#1e1a22']]); moon(cc, 820, 420, 46, 0.8, 0.3); stars(cc, t, 60, 33, [0, 0, W, 800], 0.5);
        cc.fillStyle = '#20181a'; for (let i = 0; i < 6; i++) { const hx = -40 + i * 200, hh = 300 + (i % 3) * 90; cc.fillRect(hx, 1180 - hh, 180, hh); cc.fillStyle = 'rgba(255,190,110,0.25)'; cc.fillRect(hx + 70, 1180 - hh * 0.6, 26, 36); cc.fillStyle = '#20181a'; }
        cc.fillStyle = '#2a2024'; cc.fillRect(-300, 1180, W + 600, 900);
        const MW = 420; // the mother hiding behind a wall (left), the bundle held close
        cc.fillStyle = '#2e2426'; cc.fillRect(-60, 820, MW, 380);
        fig(cc, MOTHER, { x: 160, y: 1180, h: 300, dir: 1, pose: 'kneel', dua: true, light: 0.35, t });
        cc.fillStyle = '#e8e2d4'; cc.beginPath(); cc.ellipse(205, 1050, 30, 18, 0.3, 0, 6.283); cc.fill();
        cc.fillStyle = '#2e2426'; cc.fillRect(250, 900, 120, 300);
        for (let i = 0; i < 4; i++) { const dist = q * 150 + 0, sx = 1240 - dist - i * 190;
          soldier(cc, { x: sx, y: 1210 + (i % 2) * 20, h: 330, dir: -1, walk: stepOf(dist, 330) + i * 0.5, light: 0.45, t }); cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, sx - 50, 950, 160, '#ff8a3a', 0.35); cc.restore(); }
        cc.fillStyle = 'rgba(10,16,40,0.35)'; cc.fillRect(-300, -300, W + 600, H + 600);
        blurred(cc, 8, () => { fgStones(cc, 980, 2020, 1.4, '#1a1416', 3); });
      });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'إِنَّ فِرْعَوْنَ عَلَا فِي الْأَرْضِ', t, 0.2, d + 1, 280, 96);
    },
  },

  // 4. "Cast him into the river, and fear not: We shall return him to you" (Al-Qasas 7)
  river: {
    grade: 'rgba(255,160,150,0.18)',
    draw(c, t, d) {
      const tJ = at('river', 'Jette', 0, 2.4), tC = at('river', 'crains', 0, 4.5), tR = at('river', 'rendrons', 0, d * 0.8);
      const go = seg(t, tJ, tJ + 0.9), drift = Math.max(0, t - tJ) * 55, chx = lerp(470, 560, ease(go)) + drift, chy = lerp(1222, 1300, ease(go));
      const track = Math.max(0, chx - 560) * 0.85;
      cam(c, 1.06 + 0.04 * t / d, 540 + track, 1150);
      sky(c, [[0, '#2a3a6a'], [0.32, '#a07aa0'], [0.46, '#f0a890'], [0.52, '#ffd0a0']]);
      sun(c, 820 + track * 0.9, 1000, 60, '#ffe0b0', 0.9); wisps(c, t, 520, 8, '#ffd8c8', 0.25, 9, 6);
      // far bank: palms and the pale shapes of pyramids
      pyramid2(c, 300 + track * 0.6, 1010, 300, 160, '#c09098', '#806070', 0.6); pyramid2(c, 1300 + track * 0.6, 1010, 360, 200, '#c09098', '#806070', 0.6);
      ridge(c, 1020, 10, 0.006, 7, '#4a3a4a');
      for (let i = 0; i < 9; i++) datePalm(c, -200 + i * 230 + (i % 2) * 60, 1030, 0.45 + (i % 3) * 0.08, '#2a2a30', t, i);
      water(c, t, 1030, 2400, { top: '#c0a0b0', bot: '#1e3040', sunX: 820 + track * 0.9, flow: 18, seed: 3 });
      // near bank with papyrus
      c.fillStyle = '#3a3020'; c.beginPath(); c.moveTo(-300, 1200); c.quadraticCurveTo(200, 1170, 500, 1226); c.lineTo(500, 1260); c.quadraticCurveTo(160, 1300, -300, 1330); c.closePath(); c.fill();
      reeds(c, 40, 1230, 1.1, t, 3, '#3a5a2a'); reeds(c, 660 + 1400, 1300, 1.0, t, 5, '#3a5a2a');
      fig(c, MOTHER, { x: 300, y: 1232, h: 330, dir: 1, pose: 'kneel', dua: t > tC - 0.3, light: 0.75, t, wind: 0.3 });
      ripplesAround(c, chx, chy + 6, 1, t, go);
      chest(c, chx, chy, 0.9, t, ramp(t, tR - 0.4, 1.0), { rock: go > 0 ? undefined : 0 });
      if (go > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const lr = ramp(t, tR - 0.3, 1.2); glow(c, chx, chy - 40, 260, '#fff2d0', 0.28 * lr); c.restore(); }
      reeds(c, 1500, 1350, 1.4, t, 8, '#2e4a22');
      blurred(c, 8, () => { reeds(c, 120 + track, 2000, 2.6, t, 11, '#1e2a14'); });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'فَأَلْقِيهِ فِي الْيَمِّ وَلَا تَخَافِي', t, tJ - 0.2, tR - 0.3, 280, 92);
      arabicCaption(c, 'إِنَّا رَادُّوهُ إِلَيْكِ', t, tR - 0.2, d + 1, 280, 110);
    },
  },

  // 5. The chest reaches Pharaoh's palace — "Do not kill him" (Al-Qasas 9) — and he is returned to his mother (13)
  palace: {
    grade: 'rgba(255,200,130,0.18)',
    draw(c, t, d) {
      const tE = at('palace', 'épouse', 0, 3.2), tT = at('palace', 'tuez', 0, 4.6), tR = at('palace', 'rendit', 0, d * 0.65);
      phases(c, t, tR - 0.5, 0.6, cc => {
        const arr = ease(seg(t, 0, tE - 0.3)), chx = lerp(-120, 470, arr), stop = ramp(t, tT - 0.3, 0.5);
        cam(cc, 1.0 + 0.12 * ease(seg(t, tE - 0.5, tR)), lerp(540, 600, ease(seg(t, tE - 0.5, tR))), 1120);
        sky(cc, [[0, '#4a7ab0'], [0.4, '#d8c0a0'], [0.55, '#f6deb0']]); wisps(cc, t, 360, 6, '#ffffff', 0.25, 4, 4);
        pylon(cc, 760, 1080, 520, 420, '#d8b080', { seed: 7, banner: LAPIS });
        obelisk(cc, 440, 1080, 46, 330, '#e0b888');
        datePalm(cc, 1040, 1100, 0.85, '#3a5a2a', t, 2); datePalm(cc, 980, 1100, 0.7, '#4a6a30', t, 5);
        cc.fillStyle = '#e0b888'; cc.fillRect(-300, 1080, W + 600, 30); for (let i = 0; i < 5; i++) egColumn(cc, 100 + i * 230, 1100, 30, 360, '#ecc898', { band: i % 2 ? '#8a2a22' : LAPIS });
        // steps down to the water
        for (let k = 0; k < 5; k++) { cc.fillStyle = mix('#e0b888', '#7a5232', k * 0.12); cc.fillRect(380 - k * 10, 1110 + k * 30, 900, 30); cc.fillStyle = 'rgba(255,240,210,0.4)'; cc.fillRect(380 - k * 10, 1110 + k * 30, 900, 3); }
        water(cc, t, 1260, 2400, { top: '#6a9ab0', bot: '#1a3a4a', sunX: 300, flow: 14, seed: 7 });
        cc.fillStyle = 'rgba(224,184,136,0.35)'; cc.fillRect(340, 1262, 900, 14);
        ripplesAround(cc, chx, 1310, 1, t);
        chest(cc, chx, 1300, 0.85, t, 0.4);
        const qo = { x: 560, y: 1260, h: 330, dir: -1, reach: lerp(0.7, 0, stop), armUp: stop * 0.55, light: 1, t };
        fig(cc, QUEEN, qo);
        fig(cc, Object.assign({}, QUEEN, { robe: '#8a6a4a' }), { x: 690, y: 1200, h: 300, dir: -1, light: 0.9, t: t + 2 });
        const gd = Math.min(t, tT) * 70, gx = 1180 - gd;
        lean(cc, gx, 1230, -0.0, () => fig(cc, SOLDIER, { x: gx, y: 1230, h: 330, dir: -1, walk: t < tT ? stepOf(gd, 330) : null, light: 0.9, t }));
        cc.save(); cc.translate(gx, 1230); cc.rotate(stop * 0.18); spearOf(cc, { x: 0, y: 0, h: 330, dir: -1 }); cc.restore();
        blurred(cc, 7, () => reeds(cc, 1000, 2000, 2.4, t, 13, '#1e2a14'));
      }, cc => {
        // home: the mother holds her son again, lamp light
        const q = t - tR;
        cam(cc, 1.08 + 0.02 * q, W / 2, 1100);
        const g = cc.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a1a12'); g.addColorStop(1, '#120a08'); cc.fillStyle = g; cc.fillRect(-200, -200, W + 400, H + 400);
        cc.fillStyle = '#3a2618'; cc.fillRect(-200, 1250, W + 400, 900);
        cc.save(); archPath(cc, 760, 1000, 240, 380); cc.fillStyle = '#1a2a4a'; cc.fill(); cc.clip(); stars(cc, t, 30, 51, [640, 600, 260, 400], 0.8); moon(cc, 800, 760, 30, 0.9, 0.35); cc.restore();
        lanternBox(cc, 420, 980, 1.2, t);
        cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, 420, 980, 700, '#ffb060', 0.25); cc.restore();
        fig(cc, MOTHER, { x: 560, y: 1290, h: 380, dir: -1, pose: 'sit', light: 0.9, t });
        chest(cc, 760, 1290, 0.6, 0, 0, { rock: 0 });
        cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, 520, 1150, 160, '#fff2d0', 0.35); cc.restore();
        cc.fillStyle = '#f4f0e6'; cc.beginPath(); cc.ellipse(522, 1150, 46, 26, -0.3, 0, 6.283); cc.fill(); cc.fillStyle = '#e4ddcc'; cc.beginPath(); cc.ellipse(500, 1140, 22, 16, -0.3, 0, 6.283); cc.fill();
      });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'لَا تَقْتُلُوهُ', t, tT - 0.2, tR - 0.3, 280, 120);
      arabicCaption(c, 'فَرَدَدْنَاهُ إِلَى أُمِّهِ', t, tR, d + 1, 280, 110);
    },
  },

  // 6. The fire near Mount Tur — "O Moussa, I am Allah, Lord of the worlds" (Al-Qasas 30). Only light, never a form.
  fire: {
    grade: 'rgba(255,170,110,0.18)',
    draw(c, t, d) {
      const tF = at('fire', 'feu', 0, 2.5), tA = at('fire', 'appelé', 0, 5.2), tL = at('fire', 'Allah', 0, d * 0.75);
      const fa = ramp(t, tF - 0.4, 0.8) * (0.6 + 0.4 * ramp(t, tA - 0.2, 1.0)), push = ease(seg(t, tF, tA + 1.2)), holy = ramp(t, tL - 0.3, 1.0);
      cam(c, lerp(1.0, 1.35, push), lerp(540, 640, push), lerp(1100, 1030, push));
      sky(c, [[0, '#04060e'], [0.45, '#0e1426'], [0.6, '#1e1c2a']]);
      milkyWay(c, t, 0.6); stars(c, t, 120, 41, [0, 0, W, 900], 0.8);
      ridge(c, 1080, 60, 0.003, 13, '#141018');
      rock(c, 300, 1160, 900, 520, '#1e181e', 47, { sharp: 1.3, lightX: 1, light: 0.3, domes: 3, bumps: 7 });
      rock(c, 780, 1150, 1000, 720, '#2a2024', 43, { sharp: 1.6, lightX: -1, light: 0.4 + fa * 0.6, domes: 4, bumps: 9 });
      if (fa > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 760, 860, 900, '#ff9a50', 0.18 * fa); c.restore(); }
      sacredTree(c, 760, 1010, 0.95, t, fa);
      if (holy > 0) { c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 760, 860, -Math.PI / 2, 2.4, 1300, 16, '#fff0c8', 0.06 * holy, t, 7); c.restore(); }
      fgRidge(c, 1250, 30, 0.003, 15, '#2e2622', { light: 0.3 + fa * 0.4, rim: hexA('#ffb870', 0.4 * fa) });
      const dist = Math.min(t, tA) * 60, mx = 120 + dist, kneel = t > tA + 0.3;
      fig(c, MUSA, { x: mx, y: ridgeY(mx, 1250, 30, 0.003, 15) + 14, h: 380, dir: 1, walk: t < tA ? stepOf(dist, 380) : null, staff: !kneel, pose: kneel ? 'kneel' : 'stand', dua: kneel, light: 0.5 + fa * 0.5, t, wind: 0.3 });
      blurred(c, 8, () => { boulder(c, 960, 2000, 520, 300, '#140e10', 3); shrub(c, 70, 1960, 3, '#140e10', t, 5); });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'إِنِّي آنَسْتُ نَارًا', t, tF - 0.2, tL - 0.4, 280, 104, '#ffd8a8');
      arabicCaption(c, 'إِنِّي أَنَا اللَّهُ رَبُّ الْعَالَمِينَ', t, tL - 0.2, d + 1, 290, 88);
    },
  },

  // 7. Before Pharaoh: the staff becomes a serpent, the hand comes out white (Al-A'raf 107-108)
  signs: {
    grade: 'rgba(255,170,90,0.22)',
    draw(c, t, d) {
      const tJ = at('signs', 'jeta', 0, 1.6), tS = at('signs', 'serpent', 0, 3.2), tM = at('signs', 'main', 0, d * 0.65);
      const fly = seg(t, tJ - 0.1, tJ + 0.45), grow = ease(seg(t, tS - 0.6, tS + 0.4)) * (1 - ease(seg(t, tM - 1.0, tM - 0.3))), hand = ramp(t, tM - 0.3, 0.5);
      const fear = ramp(t, tS - 0.4, 0.6) * (1 - ramp(t, tM - 0.5, 1.0) * 0.5), [sx, sy] = shake(t, Math.exp(-Math.pow((t - tS) * 3, 2)) * 0.5, 14);
      cam(c, lerp(1.04, 1.16, ease(seg(t, tM - 0.5, d))), lerp(540, 420, ease(seg(t, tM - 0.5, d))), lerp(1100, 1040, ease(seg(t, tM - 0.5, d))), sx, sy);
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a120e'); g.addColorStop(0.6, '#2e2016'); g.addColorStop(1, '#140c08'); c.fillStyle = g; c.fillRect(-300, -300, W + 600, H + 600);
      // hall: painted columns, lapis band, braziers, tiled floor in perspective
      c.fillStyle = '#4a3020'; c.fillRect(-300, 520, W + 600, 50); glyphs(c, -280, 530, W + 560, 34, '#e0b85a', 21, 0.35);
      for (let i = 0; i < 6; i++) egColumn(c, -40 + i * 230, 1180, 46, 680, '#b8885a', { band: i % 2 ? LAPIS : '#8a2a22' });
      c.fillStyle = '#5a3c26'; c.fillRect(-300, 1180, W + 600, 900);
      c.strokeStyle = 'rgba(20,10,4,0.35)'; c.lineWidth = 2; for (let k = 0; k < 14; k++) { c.beginPath(); c.moveTo(540 + (k - 7) * 60, 1180); c.lineTo(540 + (k - 7) * 260, 2000); c.stroke(); }
      for (let k = 0; k < 8; k++) { const y = 1180 + k * k * 12 + k * 20; c.beginPath(); c.moveTo(-300, y); c.lineTo(W + 300, y); c.stroke(); }
      [[150, 1180], [930, 1180]].forEach(([bx, by], i) => { c.fillStyle = '#3a2614'; c.fillRect(bx - 30, by - 140, 60, 140); fire(c, bx, by - 140, 0.3, t + i); });
      // dais, throne and Pharaoh (right); guards behind, a courtier at the foot of the steps
      soldier(c, { x: 1010, y: 1150, h: 360, dir: -1, light: 0.6, t }); soldier(c, { x: 720, y: 1150, h: 360, dir: -1, light: 0.6, t: t + 1 });
      for (let k = 0; k < 3; k++) { c.fillStyle = mix('#c8a060', '#6a4a22', k * 0.2); c.fillRect(700 - k * 30, 1150 + k * 30, 460 + k * 60, 30); c.fillStyle = 'rgba(255,230,170,0.35)'; c.fillRect(700 - k * 30, 1150 + k * 30, 460 + k * 60, 3); }
      c.fillStyle = '#8a6a2a'; c.fillRect(800, 960, 190, 190); c.fillStyle = GOLD; c.fillRect(960, 820, 34, 330); c.fillStyle = LAPIS; c.fillRect(966, 840, 22, 290); c.fillStyle = GOLD; c.fillRect(790, 1040, 210, 16);
      const ph = { x: 880, y: 1150, h: 390, dir: -1, pose: 'sit', light: 0.85, t };
      lean(c, 880, 1150, fear * 0.08, () => { fig(c, PHARAOH, ph); nemes(c, ph); });
      lean(c, 640, 1250, fear * 0.15, () => fig(c, COURT[0], { x: 640, y: 1250, h: 330, dir: -1, light: 0.75, t, reach: fear * 0.6 }));
      const mo = { x: 230, y: 1300, h: 470, dir: 1, reach: t < tJ + 0.3 ? ramp(t, tJ - 0.5, 0.4) : hand > 0 ? 0 : 0.3, armUp: hand * 0.9, light: 1, t, wind: 0.2 };
      fig(c, MUSA, mo);
      // the staff: in his hand, then thrown, then a serpent
      const [hx, hy] = handOf(mo);
      if (t < tJ - 0.1) staffAt(c, mo, 0.35);
      else if (grow <= 0.001 && t < tS) { const px = lerp(hx, 470, ease(fly)), py = lerp(hy, 1330, ease(fly)) - Math.sin(fly * Math.PI) * 80, a = lerp(0.4, 1.57, ease(fly));
        c.save(); c.translate(px, py); c.rotate(a); c.strokeStyle = '#4a3020'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -150); c.lineTo(0, 150); c.stroke(); c.restore(); }
      else serpent(c, 300, 1350, 1.45, t, { grow: grow > 0 ? grow : 0, rise: grow * 1.1, open: 0.3 + 0.3 * Math.sin(t * 3), len: 420 });
      if (hand > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, hx, hy - 6, 210, '#ffffff', 0.55 * hand); glow(c, hx, hy - 6, 60, '#ffffff', 0.9 * hand); rays(c, hx, hy - 6, 0, Math.PI, 360, 14, '#ffffff', 0.1 * hand, t, 3); c.restore(); }
      blurred(c, 9, () => { egColumn(c, 1060, 2100, 90, 1200, '#5a3a22', { band: '#3a1a12' }); });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'فَإِذَا هِيَ ثُعْبَانٌ مُّبِينٌ', t, tS - 0.3, tM - 0.4, 280, 100);
      arabicCaption(c, 'فَإِذَا هِيَ بَيْضَاءُ لِلنَّاظِرِينَ', t, tM - 0.2, d + 1, 280, 96);
    },
  },

  // 8. The magicians: ropes, swallowed by the staff, and they fall in prostration (Al-A'raf 116-120)
  magic: {
    grade: 'rgba(255,175,100,0.22)',
    draw(c, t, d) {
      const tJ = at('magic', 'jetèrent', 0, 1.2), tA = at('magic', 'avala', 0, 4), tP = at('magic', 'prosternés', 0, d * 0.8), tT = at('magic', 'tombèrent', 0, tP - 0.5);
      const wig = ramp(t, tJ, 0.4), sw = seg(t, tA - 0.6, tA + 1.6), pros = seg(t, tT - 0.2, tT + 0.4);
      cam(c, lerp(1.0, 1.1, ease(t / d)), lerp(520, 600, ease(seg(t, tA, d))), 1100);
      sky(c, [[0, '#5a80aa'], [0.38, '#e8c09a'], [0.55, '#f8dcb0']]); sun(c, 900, 520, 60, '#fff4d0', 0.85);
      pylon(c, 260, 1010, 380, 300, '#d8ae80', { seed: 11, banner: '#8a2a22' }); pylon(c, 860, 1010, 380, 300, '#d8ae80', { seed: 12, banner: '#8a2a22' });
      // tiers of spectators
      for (let row = 0; row < 3; row++) { const y = 1010 + row * 46; c.fillStyle = mix('#c89a68', '#7a5232', row * 0.2); c.fillRect(-300, y, W + 600, 46); crowdRow(c, t, -100, 1180, y + 6, 100 + row * 14, 18, row * 7 + 1, { light: 0.5, ink: 0.4, dir: 1 }); }
      c.fillStyle = '#d8a870'; c.fillRect(-300, 1150, W + 600, 900);
      c.strokeStyle = 'rgba(80,50,20,0.25)'; c.lineWidth = 3; for (let k = 0; k < 8; k++) { const y = 1180 + k * k * 10 + k * 24; c.beginPath(); for (let x = -300; x <= W + 300; x += 30) c.lineTo(x, y + Math.sin(x * 0.01 + k) * 6); c.stroke(); }
      // ropes on the ground, then swallowed one by one as the serpent passes
      const headX = lerp(-200, 1250, sw), gone = [...Array(7)].map((_, i) => clamp((headX - lerp(380, 1000, (i + 0.5) / 7)) / 60));
      if (t > tJ) ropes(c, t, 380, 1000, 1330, 7, 5, wig * (1 - sw), gone);
      if (sw > 0 && sw < 1) serpent(c, headX - 620, 1330, 1.05, t, { len: 600, rise: 0.25, open: 0.6 + 0.4 * Math.sin(t * 8), speed: 7 });
      // the magicians (right), throwing, then prostrate
      for (let i = 0; i < 4; i++) { const x = 560 + i * 140, y = 1250 + (i % 2) * 20, who = MAGES[i % 3];
        if (pros < 1 || t < tT) lean(c, x, y, pros * 0.6, () => fig(c, who, { x, y, h: 320, dir: -1, reach: t < tJ + 0.6 ? ramp(t, tJ - 0.4, 0.3) * (1 - ramp(t, tJ + 0.3, 0.4)) : 0, light: 0.8, t: t + i, wind: 0.2 }));
        else fig(c, who, { x: x - 30, y, h: 320, dir: -1, pose: 'prostrate', light: 0.8, t }); }
      const mo = { x: 190, y: 1290, h: 430, dir: 1, staff: t < tA - 0.6 || t > tA + 1.8, light: 1, t, wind: 0.3 };
      fig(c, MUSA, mo);
      blurred(c, 8, () => { fgStones(c, 980, 2000, 1.4, '#6a4a2a', 4); });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'فَإِذَا هِيَ تَلْقَفُ مَا يَأْفِكُونَ', t, tA - 0.3, tT - 0.4, 280, 96);
      arabicCaption(c, 'وَأُلْقِيَ السَّحَرَةُ سَاجِدِينَ', t, tT - 0.2, d + 1, 280, 100);
    },
  },

  // 9. Night departure; Pharaoh pursues with his army (Ad-Dukhan 23, Ash-Shu'ara 52-60)
  night: {
    grade: 'rgba(120,150,255,0.18)',
    draw(c, t, d) {
      const tP = at('night', 'poursuivit', 0, d * 0.6), pan = ease(seg(t, tP - 1.2, tP + 0.5));
      sky0(c, [[0, '#04060e'], [0.5, '#0c1430'], [0.62, '#18203a']]);
      cam(c, 1.04 + 0.04 * pan, 540 + pan * 300, 1100);
      stars(c, t, 140, 61, [-200, 0, W + 900, 900], 0.8); moon(c, 840, 640, 50, 0.9, 0.28); c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 1200, 1010, 700, '#ff8a4a', 0.12 + 0.2 * pan); c.restore();
      ridge(c, 1020, 40, 0.003, 17, '#121626');
      // pursuers far on the right
      c.save(); c.globalAlpha = 0.5 + 0.5 * pan; dustCloud(c, t, 900, 1500, 1020, 300, '#6a5a6a', 0.45, 9); spearLine(c, t, 920, 1460, 1030, 44, 44, '#05060c', 7); torchLine(c, t, 920, 1460, 975, 22, 1, 9); c.restore();
      fgRidge(c, 1180, 50, 0.0025, 19, '#2a2a3a', { light: 0.4, rim: 'rgba(180,200,255,0.35)' });
      // the column walking left under the moon, lanterns; Moussa leads
      const dist = t * 42;
      for (let i = 0; i < 9; i++) { const x = 300 + i * 120 - dist, y = ridgeY(x, 1180, 50, 0.0025, 19) + 12;
        fig(c, i === 0 ? MUSA : Object.assign({}, FOLK[i % FOLK.length], { lantern: i % 3 === 1 }), { x, y, h: i === 0 ? 360 : 330, dir: -1, walk: stepOf(dist, i === 0 ? 360 : 330) + i * 0.37, staff: i === 0, light: 0.55, t, wind: 0.4, child: i === 5 }); }
      for (let i = 0; i < 3; i++) { const x = 1240 + i * 230 - dist * 1.4; chariot(c, x, 1250 + i * 34, 0.62, t, -1, { k: i, dist: dist * 1.4, light: 0.35 }); }
      blurred(c, 8, () => { shrub(c, 1500, 1950, 3.4, '#0a0c14', t, 9); boulder(c, 80 + pan * 520, 2010, 500, 260, '#0c0e16', 7); });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'فَأَسْرِ بِعِبَادِي لَيْلًا إِنَّكُم مُّتَّبَعُونَ', t, 0.2, d + 1, 280, 84, '#e8e0ff');
    },
  },

  // 10. Dawn: the sea ahead, the army behind — "We are overtaken!" (Ash-Shu'ara 61)
  trapped: {
    grade: 'rgba(255,170,130,0.2)',
    draw(c, t, d) {
      const tD = at('trapped', 'Derrière', 0, 3), tR = at('trapped', 'rattrapés', 0, d * 0.8), tC = at('trapped', 'crièrent', 0, tR - 0.8);
      const whip = ease(seg(t, tD - 0.4, tD + 0.4)), back = ease(seg(t, tC - 0.4, tC + 0.8)), [sx, sy] = shake(t, Math.exp(-Math.pow((t - tR) * 2.5, 2)) * 0.6, 12);
      const cx = lerp(lerp(760, -300, whip), 120, back), z = lerp(1.05, 1.0, back);
      sky0(c, [[0, '#2a3054'], [0.32, '#a07a8a'], [0.48, '#f2a880'], [0.54, '#ffd0a0']]);
      cam(c, z, cx, 1100, sx, sy);
      sun(c, 900, 900, 70, '#ffe0b0', 0.9);
      // the sea (right) and the dunes (left) where the army appears
      c.save(); c.beginPath(); c.rect(-100, 895, 2000, 900); c.clip(); seaFlat(c, t, 905, { sunX: 900, top: '#c8a0a0', bot: '#1a3044' }); c.restore();
      c.fillStyle = '#7a5a4a'; c.beginPath(); c.moveTo(-1200, 870); c.quadraticCurveTo(-500, 820, -120, 900); c.lineTo(80, 1300); c.lineTo(-1200, 1300); c.closePath(); c.fill();
      dustCloud(c, t, -1100, -150, 900, 300, '#c08a6a', 0.5, 11); spearLine(c, t, -1050, -200, 900, 40, 50, '#2a1a1a', 13);
      for (let i = 0; i < 4; i++) chariot(c, -900 + i * 190 + t * 25, 1010 + (i % 2) * 40, 0.55, t, 1, { k: i, crown: i === 2, who: i === 2 ? PHARAOH : SOLDIER, spear: i !== 2, box: i === 2 ? GOLD : undefined });
      beach(c, t, 1240, '#c8a07a', 3);
      // the people on the shore, turning back in fear
      for (let row = 0; row < 2; row++) for (let i = 0; i < 7; i++) { const x = -40 + i * 150 + row * 70, y = 1290 + row * 80, who = FOLK[(i + row * 3) % FOLK.length];
        fig(c, who, { x, y, h: 300 + row * 40, dir: x > 300 ? -1 : 1, light: 0.75, t: t + i, wind: 0.5, reach: i % 3 === 1 ? back * 0.6 : 0, armUp: i % 3 === 2 ? back * 0.4 : 0, child: i === 4 && row === 1 }); }
      fig(c, MUSA, { x: 760, y: 1330, h: 420, dir: -1, staff: true, light: 1, t, wind: 0.6 });
      blurred(c, 8, () => { rock(c, 1080, 2020, 600, 380, '#3a2a24', 31, { sharp: 0.9, grooves: 3 }); });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'إِنَّا لَمُدْرَكُونَ', t, tR - 0.3, d + 1, 280, 120, '#ffd8a8');
    },
  },

  // 11. EMOTIONAL PEAK — "Never! My Lord is with me, He will guide me." (Ash-Shu'ara 62)
  kalla: {
    grade: 'rgba(255,190,130,0.2)',
    draw(c, t, d) {
      const tJ = at('kalla', 'Jamais', 0, 1.3), tS = at('kalla', 'Seigneur', 0, 3), tG = at('kalla', 'guider', 0, d * 0.8);
      const up = ramp(t, tJ - 0.15, 0.35), punch = Math.exp(-Math.pow((t - tJ - 0.15) * 4, 2)), lightA = ramp(t, tS - 0.3, 1.2), path = ramp(t, tG - 0.4, 1.2);
      cam(c, 1.0 + 0.12 * ease(t / d) + 0.05 * punch, W / 2, lerp(1150, 1080, ease(t / d)));
      sky(c, [[0, '#2a3a64'], [0.3, '#b08a98'], [0.46, '#f6b88a'], [0.52, '#ffe0b0']]);
      sun(c, 700, 960, 80, '#fff0c8', 0.95); wisps(c, t, 560, 8, '#ffe0d0', 0.28, 17, 8);
      seaFlat(c, t, 965, { sunX: 700, top: '#e0b0a0', bot: '#1a3048', glit: 0.35 + 0.5 * path });
      if (path > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(0, 965, 0, 1900); g.addColorStop(0, `rgba(255,240,200,${0.4 * path})`); g.addColorStop(1, 'rgba(255,240,200,0)');
        c.fillStyle = g; c.beginPath(); c.moveTo(690, 965); c.lineTo(710, 965); c.lineTo(980, 1900); c.lineTo(420, 1900); c.closePath(); c.fill(); c.restore(); }
      lightFromAbove(c, t, 640, lightA * 0.55, 380);
      beach(c, t, 1330, '#b8906a', 5);
      crowdRow(c, t, 760, 1100, 1350, 240, 5, 3, { dir: -1, light: 0.6, ink: 0.6 });
      const mo = { x: 360, y: 2020, h: 1080, dir: 1, armUp: 0.25 + 0.7 * up, light: 1, t, wind: 0.9, veilGlow: 0.3 };
      fig(c, MUSA, mo); staffAt(c, mo, lerp(0.35, 0.1, up));
      if (punch > 0.02) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(255,245,220,${0.18 * punch})`; c.fillRect(-200, -200, W + 400, H + 400); c.restore(); }
      blowingSand(c, t, 1500, 0.15, 3);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'كَلَّا', t, tJ - 0.2, tS - 0.5, 300, 170);
      arabicCaption(c, 'إِنَّ مَعِيَ رَبِّي سَيَهْدِينِ', t, tS - 0.4, d + 1, 300, 110);
    },
  },

  // 12. "Strike the sea with your staff" — it split, each part like a great mountain (Ash-Shu'ara 63), a dry path (Ta-Ha 77)
  split: {
    grade: 'rgba(255,200,150,0.16)',
    draw(c, t, d) {
      const tF = at('split', 'Frappe', 0, 1.3), tS = at('split', 'fendit', 0, 4), tP = at('split', 'passèrent', 0, d * 0.75);
      const raise = ramp(t, tF - 0.7, 0.5), strike = ease(seg(t, tF + 0.1, tF + 0.35)), k = ease(seg(t, tS - 0.3, tS + 2.0));
      const [sx, sy] = shake(t, k > 0 && k < 1 ? 0.5 * Math.sin(k * Math.PI) : 0, 16), walk = Math.max(0, t - tP + 0.3);
      sky0(c, [[0, '#1a2448'], [0.3, '#5a5a88'], [0.46, '#e0a090'], [0.5, '#ffd0a0']]);
      cam(c, lerp(1.0, 1.08, ease(t / d)), W / 2, lerp(1080, 820, k), sx, sy);
      stars(c, t, 40, 9, [0, -600, W, 700], 0.4);
      c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, 905, 520, '#ffd8a0', 0.3 + 0.3 * k); c.restore();
      ridge(c, 905, 14, 0.01, 4, '#5a4a52');
      seaFlat(c, t, 905, { sunX: 540, top: '#6a8aa0', bot: '#0e2a38' });
      corridor(c, t, k, { hy: 905, u0: 0.12, light: '#ffe8c0' });
      const sp = seg(t, tF + 0.3, tF + 1.3); if (sp > 0 && sp < 1) { c.fillStyle = `rgba(240,250,255,${0.8 * (1 - sp)})`; for (let i = 0; i < 30; i++) { const a = -Math.PI / 2 + (i / 30 - 0.5) * 2.4, dd = sp * (80 + (i % 5) * 50); c.beginPath(); c.arc(600 + Math.cos(a) * dd * 1.6, 1330 + Math.sin(a) * dd + sp * sp * 100, 5, 0, 6.283); c.fill(); } }
      // the people walking in behind Moussa
      if (walk > 0) { const ppl = []; for (let i = 0; i < 10; i++) { const u = 0.13 + walk * 0.02 - i * 0.012 + 0.1; if (u > 0.13) ppl.push({ u, f: ((i * 37) % 9) / 9 * 1.2 - 0.6, who: FOLK[i % FOLK.length], walk: u * 60 + i * 0.4 }); } corridorPeople(c, t, ppl, { hy: 905, k }); }
      beach(c, t, 1335, '#a08060', 7);
      for (let row = 0; row < 2; row++) crowdRow(c, t, -160 + row * 40, 230 + row * 30, 1370 + row * 70, 300 + row * 40, 3, 9 + row, { dir: 1, light: 0.7, f: () => ({ reach: 0.3 * k }) });
      const mo = { x: 470, y: 1400, h: 600, dir: 1, armUp: raise > 0 && strike < 1 ? 0.95 * raise : lerp(0.95, 0.45, strike), light: 1, t, wind: 0.8, veilGlow: 0.6 };
      fig(c, MUSA, mo); staffAt(c, mo, lerp(0.05, 1.25, strike));
      blurred(c, 8, () => { rock(c, 1050, 2050, 520, 360, '#2a2226', 33, { sharp: 0.9, grooves: 3 }); });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'أَنِ اضْرِب بِّعَصَاكَ الْبَحْرَ', t, tF - 0.3, tS - 0.4, 280, 100);
      arabicCaption(c, 'فَانفَلَقَ فَكَانَ كُلُّ فِرْقٍ كَالطَّوْدِ الْعَظِيمِ', t, tS - 0.2, d + 1, 280, 76);
    },
  },

  // 13. Pharaoh follows; the waters close over him and his army; Moussa and those with him are saved (Ash-Shu'ara 65-66, Ta-Ha 78)
  drown: {
    grade: 'rgba(170,190,220,0.18)',
    draw(c, t, d) {
      const tE = at('drown', 'élança', 0, 1), tR = at('drown', 'refermèrent', 0, 3.6), tS = at('drown', 'sauvés', 0, d * 0.85), tM = at('drown', 'Moussa', 0, tS - 1.2);
      phases(c, t, tM - 0.4, 0.6, cc => {
        const cl = ease(seg(t, tR - 0.3, tR + 1.4)), flood = ease(seg(t, tR + 0.6, tR + 2.6)), [sx, sy] = shake(t, cl > 0 && cl < 1 ? 0.7 : 0, 18);
        sky0(cc, [[0, '#1a2038'], [0.3, '#3a4a6a'], [0.5, '#8a7a8a']]);
        cam(cc, lerp(1.05, 1.15, cl), W / 2, lerp(900, 1000, cl), sx, sy);
        ridge(cc, 905, 14, 0.01, 4, '#3a3442');
        seaFlat(cc, t, 905, { top: '#5a7a90', bot: '#0a2030' });
        if (flood < 0.97) corridor(cc, t, 1 - flood, { hy: 905, collapse: cl, light: '#c8d0e0', wallNear: '#1a5a70' });
        // the army inside the path, rushing in on "élança"
        if (flood < 0.6) { const run = Math.max(0, t - tE + 0.4) * 0.03;
          for (let i = 5; i >= 0; i--) { const u = 0.32 + i * 0.07 - run * 1.2, G = corrGeo({ hy: 905 }); if (u < 0.05 || u > 0.95) continue;
            const s = 2.4 * CP(u), x = G.vx + ((i % 3) - 1) * G.hw * CP(u) * 0.45 * (1 - cl), y = G.Y(u);
            chariot(cc, x, y, s, t, i % 2 ? 1 : -1, { k: i, crown: i === 0, who: i === 0 ? PHARAOH : SOLDIER, spear: i !== 0, box: i === 0 ? GOLD : undefined, light: 0.5, ink: 0.5 }); } }
        // the falling crests and foam
        if (cl > 0) { const r = rng(5), fa = Math.sin(Math.PI * Math.min(1, cl * 1.1));
          for (let i = 0; i < 70; i++) { const x = 540 + (r() - 0.5) * 1300 * (1 - cl * 0.4), y = lerp(200, 1250, r()) + cl * 380 * r(), rr = 60 + r() * 160; const g = cc.createRadialGradient(x, y, 0, x, y, rr); g.addColorStop(0, `rgba(235,248,255,${0.35 * fa})`); g.addColorStop(1, 'rgba(235,248,255,0)'); cc.fillStyle = g; cc.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
          cc.strokeStyle = `rgba(240,250,255,${0.4 * fa})`; cc.lineWidth = 3; for (let i = 0; i < 50; i++) { const x = r() * W, y = r() * 1300 + cl * 300, l = 40 + r() * 90; cc.beginPath(); cc.moveTo(x, y); cc.lineTo(x + (x - 540) * 0.08, y + l); cc.stroke(); } }
        if (flood > 0) { cc.save(); cc.globalAlpha = flood; seaFlat(cc, t, 905, { top: '#5a7a90', bot: '#0a2030', a: 1.4 }); const r = rng(9); cc.fillStyle = 'rgba(235,248,255,0.5)';
          for (let i = 0; i < 60; i++) { const u = r(), y = corrGeo({ hy: 905 }).Y(u), x = 540 + (r() - 0.5) * 1600 * CP(u); cc.beginPath(); cc.ellipse(x, y, 90 * CP(u) * (1 + r()), 12 * CP(u), 0, 0, 6.283); cc.fill(); } cc.restore(); }
      }, cc => {
        // the other shore at sunrise: Moussa and those with him, saved
        const q = t - tM;
        cam(cc, 1.02 + 0.02 * q, W / 2, 1120);
        sky(cc, [[0, '#3a5a8a'], [0.32, '#e0b0a0'], [0.48, '#ffd8a8']]);
        sun(cc, 300, 940, 80, '#fff2c8', 0.95); wisps(cc, t, 520, 7, '#ffffff', 0.25, 19, 5);
        seaFlat(cc, t, 960, { sunX: 300, top: '#e8c8b0', bot: '#2a5068', glit: 0.5 });
        beach(cc, t, 1230, '#d8b088', 9);
        crowdRow(cc, t, 520, 1130, 1290, 300, 7, 2, { dir: -1, light: 0.85, f: (i) => ({ dua: i % 2 === 0 }) });
        crowdRow(cc, t, 420, 1180, 1380, 340, 6, 5, { dir: -1, light: 0.9, f: (i) => ({ armUp: i % 3 === 1 ? 0.5 : 0 }) });
        fig(cc, MUSA, { x: 300, y: 1320, h: 430, dir: 1, dua: true, light: 1, t, wind: 0.4 });
      });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'فَغَشِيَهُم مِّنَ الْيَمِّ مَا غَشِيَهُمْ', t, tR - 0.2, tM - 0.4, 280, 92, '#d8e8ff');
      arabicCaption(c, 'وَأَنجَيْنَا مُوسَى وَمَن مَّعَهُ أَجْمَعِينَ', t, tM - 0.2, d + 1, 280, 82);
    },
  },

  // 14. The lesson: "whoever fears Allah, He makes for him a way out" (At-Talaq 2)
  lesson: {
    grade: 'rgba(255,200,140,0.2)',
    draw(c, t, d) {
      const tI = at('lesson', 'issue', 0, d * 0.85), tO = at('lesson', 'ouvert', 0, d * 0.5), bright = ramp(t, tI - 0.5, 1.2), rise = ease(t / d);
      cam(c, 1.0 + 0.08 * rise, W / 2, lerp(1150, 1000, rise));
      sky(c, [[0, '#4a6a9a'], [0.32, '#e8b8a0'], [0.47, '#ffdcaa']]);
      sun(c, 540, 930, 90, '#fff4d0', 0.95); wisps(c, t, 560, 8, '#ffffff', 0.22, 23, 4);
      c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 540, 930, -Math.PI / 2, 2.6, 1400, 14, '#fff0c8', 0.05 + 0.06 * bright, t, 11); c.restore();
      seaFlat(c, t, 960, { sunX: 540, top: '#f0d0b0', bot: '#244a62', glit: 0.5 + 0.4 * bright });
      // the path of light on the water (an "issue" opening)
      c.save(); c.globalCompositeOperation = 'lighter'; const ow = ramp(t, tO - 0.3, 1.5), g = c.createLinearGradient(0, 960, 0, 1600); g.addColorStop(0, `rgba(255,240,200,${0.45 * ow})`); g.addColorStop(1, 'rgba(255,240,200,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(530, 960); c.lineTo(550, 960); c.lineTo(540 + 260 * ow, 1600); c.lineTo(540 - 260 * ow, 1600); c.closePath(); c.fill(); c.restore();
      beach(c, t, 1300, '#d8b088', 11);
      for (let i = 0; i < 6; i++) { const x = 470 + i * 120, y = 1335 + (i % 2) * 40; fig(c, FOLK[(i + 2) % FOLK.length], { x, y, h: 320, dir: -1, pose: i % 2 ? 'prostrate' : 'kneel', dua: i % 2 === 0, light: 0.9, t }); }
      fig(c, MUSA, { x: 250, y: 1330, h: 420, dir: 1, dua: true, light: 1, t, wind: 0.35 });
      bird(c, 200 + t * 50, 700 - t * 8, 1.0, t, 1, '#5a4a4a'); bird(c, 260 + t * 46, 740 - t * 6, 0.8, t, 2, '#5a4a4a');
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا', t, 0.3, d + 1, 280, 92);
      textGlow(c, 'At-Talāq, 2', W / 2, 380, 'italic 500 34px Lora', '#3a2414', seg(t, 1.0, 1.8) * 0.9, '#fff0d0', 10);
    },
  },

  // 15. Call to action, on the hero image (continuous with the outro and the hook)
  cta: {
    grade: 'rgba(255,190,140,0.16)',
    draw(c, t, d) {
      const od = ((window.TL.scenes || []).find(s => s.id === 'outro') || { dur: 3 }).dur;
      heroShot(c, t - d - od);
      c.fillStyle = 'rgba(6,8,18,0.25)'; c.fillRect(0, 0, W, H);
      ctaText(c, seg(t, 0.1, 0.6));
    },
  },
  outro: {
    grade: 'rgba(255,190,140,0.16)',
    draw(c, t, d) {
      heroShot(c, t - d);
      const k = 1 - seg(t, d - 1.4, d - 0.6); // the overlay goes away: the last frame is the first frame
      c.fillStyle = `rgba(6,8,18,${0.25 * k})`; c.fillRect(0, 0, W, H);
      ctaText(c, k);
      const a = seg(t, d - 1.0, d - 0.15);
      seriesTag(c, a);
      c.save(); c.direction = 'rtl'; textGlow(c, 'فَانفَلَقَ', W / 2, 300, '700 130px Amiri', '#f6c453', a, '#ffb300', 30); c.restore();
    },
  },

  // cover for TikTok (not in the timeline: rendered by tools/cover.js)
  cover: {
    draw(c) {
      heroShot(c, 1.6);
      const g = c.createLinearGradient(0, 0, 0, 760); g.addColorStop(0, 'rgba(6,8,18,0.75)'); g.addColorStop(1, 'rgba(6,8,18,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 760);
      seriesTag(c, 1);
      textGlow(c, 'LA MER', W / 2, 300, '700 150px Lora', '#fff6e0', 1, '#000', 24);
      textGlow(c, 'S\'OUVRE EN DEUX', W / 2, 450, '700 104px Lora', '#f6c453', 1, '#000', 24);
      c.save(); c.direction = 'rtl'; textGlow(c, 'موسى', W / 2, 1640, '700 150px Amiri', '#f6c453', 1, '#ffb300', 34); c.restore();
      textGlow(c, 'Moussa (Moïse), paix sur lui', W / 2, 1770, 'italic 500 50px Lora', '#fff3dc', 1, '#000', 14);
    },
  },
};
