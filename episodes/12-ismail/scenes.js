// Episode 12 — Isma'il (Ismaël, alayhi salam): Ibrahim brings Hajar and their baby to a barren valley (Mecca) by Allah's command;
// "Then He will not abandon us"; Ibrahim's prayer at the pass; Hajar runs seven times between Safa and Marwa; Zamzam gushes;
// the boy grows; the dream; "O my father, do what you are commanded"; both submit; the call "you have fulfilled the vision";
// the great sacrifice (a ram, per the exegetes); father and son raise the foundations of the Kaaba.
// Sources: Ibrahim 37; As-Saffat 100-111; Al-Baqara 125-129, 158; al-Bukhari 3364 (Hajar, Zamzam). The son of the sacrifice is
// not named in the Qur'an: Isma'il according to the majority of the exegetes. Prophets (Ibrahim, Isma'il) are white silhouettes,
// the face hidden by a veil of white light (prophet: true); everyone else is faceless. Allah and the angels are never depicted.
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

// ---------- HERO shot (hook + cta + outro + cover): a rocky height at dawn near Mina. Ibrahim facing his son, the crescent setting.
const HK = [[430, 1250, 1.32], [470, 1170, 1.22], [690, 1260, 1.32], [560, 1180, 1.04]];
const HG = x => ridgeY(x, 1560, 26, 0.004, 61) + 10;
function ismHero(c, T, o = {}) {
  const f = o.light || 0, dr = o.dream || 0;
  sky0(c, [[0, '#141a3a'], [0.2, '#3a3a6a'], [0.36, '#b07070'], [0.48, '#f0b07a']]);
  let p = HK[0].slice(); [o.kD, o.kS, o.kW].forEach((k, i) => { if (k > 0) p = p.map((v, j) => lerp(v, HK[i + 1][j], k)); });
  cam(c, p[2] + 0.004 * T, p[0] + 3 * T, p[1]);
  stars(c, T, 90, 6, [-600, -400, W + 1200, 820], 0.6 + 0.4 * dr);
  moon(c, 840, 420, 44, 0.9, 0.35);
  if (dr > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 840, 420, 520, '#b8c8ff', 0.25 * dr); c.restore(); lightRings(c, 400, 1060, T, 0.6 * dr, 4, 420); }
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 180, 900, 700, '#ff9a60', 0.32); c.restore();
  wisps(c, T, 640, 7, '#ffb890', 0.16, 8, 5);
  crags(c, 1060, 220, 31, '#5a4a62', { detail: false, light: 0.5, litCol: '#ffb090' }); hazeWide(c, 1080, 220, '#e09a7a', 0.45);
  crags(c, 1260, 260, 33, '#4a3640', { rim: 'rgba(255,190,140,0.4)', gullies: 30, blocks: 40, litCol: '#ffb090' }); hazeWide(c, 1290, 180, '#d08a6a', 0.35);
  fgRidge(c, 1560, 26, 0.004, 61, '#6a4a3a', { rim: 'rgba(255,200,150,0.6)', shade: 0.3 });
  const xi = 380, xs = 730;
  fig(c, IBR, { x: xi, y: HG(xi), h: 560, dir: 1, light: 0.9 + 0.1 * f, t: T, wind: 0.35, veilGlow: 0.5, reach: o.reachI || 0 });
  fig(c, ISM, { x: xs, y: HG(xs), h: 480, dir: -1, light: 0.9 + 0.1 * f, t: T + 2, wind: 0.35, veilGlow: 0.5, reach: o.reachS || 0 });
  if (f > 0) { lightFromAbove(c, T, 560, 0.55 * f, 280); lightRings(c, 560, 1560, T, 0.6 * f, 4, 520); sparkle(c, T, 560, 1250, 14, 240, 5, f); }
  blurLayer(c, 10, cc => { fgStones(cc, 60, 2080, 2.4, '#3a2a24', 4); fgStones(cc, 1120, 2120, 2.2, '#3a2a24', 9); }, 2);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

const SCENES = {
  // 1. HOOK — a father saw in a dream that he must sacrifice his son; the son answered "do what you are commanded" (As-Saffat 102). First frame = last frame.
  hook: {
    grade: 'rgba(255,170,130,0.14)',
    draw(c, t, d) {
      const tR = at('hook', 'rêve', 0, 1.4), tF = at('hook', 'fils', 0, 3.3), tRe = at('hook', 'répondu', 0, 5.0), tFa = at('hook', 'fais', 0, 5.8), tO = at('hook', 'ordonné', 0, 7.0);
      const kD = ramp(t, tR - 0.4, 0.8) * (1 - ramp(t, tF - 0.4, 0.6)), kS = ramp(t, tF - 0.4, 0.9), kW = ramp(t, tRe - 0.3, 1.1);
      ismHero(c, t, { kD, kS, kW, dream: ramp(t, tR - 0.3, 0.6) * (1 - ramp(t, tRe, 1)), reachS: 0.55 * ramp(t, tFa - 0.3, 0.6), reachI: 0.4 * ramp(t, tF - 0.3, 0.6) * (1 - ramp(t, tFa, 0.8)), light: ramp(t, tO - 0.2, 0.9) });
      topShade(c, 1); seriesTag(c, 1, 12);
      const a = 1 - seg(t, d - 0.6, d);
      c.save(); c.direction = 'rtl'; textGlow(c, 'يَا أَبَتِ افْعَلْ مَا تُؤْمَرُ', W / 2, 290 - (1 - easeOut(seg(t, tFa - 0.1, tFa + 0.6))) * 26, '700 104px Amiri', '#f6c453', a * seg(t, tFa - 0.1, tFa + 0.5), '#ffb300', 30); c.restore();
      caption(c, 'As-Sâffât, 102', 400, seg(t, tFa + 0.3, tFa + 0.9) * a);
    },
  },

  // 2. Title over the valley at sunrise; teaser: what happened at the last moment
  promise: {
    grade: 'rgba(255,190,150,0.14)',
    draw(c, t, d) {
      const tDe = at('promise', 'dernier', 0, 4.2), tCh = at('promise', 'changé', 0, 6.0);
      phases(c, t, tDe - 0.5, 0.5, cc => {
        const push = ease(seg(t, 0, tDe));
        sky0(cc, [[0, '#2a3a6a'], [0.26, '#8a7aa0'], [0.4, '#f0b090'], [0.5, '#ffe0b0']]);
        cam(cc, 1.0 + 0.12 * push, lerp(520, 580, push), lerp(1160, 1200, push));
        sun(cc, 760, 980, 60, '#ffe6c0', 0.85); wisps(cc, t, 600, 8, '#ffd8c0', 0.26, 9, 6);
        flock(cc, t, 160 + t * 50, 640, 5, 0.8, 3, { col: '#4a3040' });
        meccaValley(cc, t, { y: 1320, px: t * 20, far: '#9a8aa0', mid: '#7a5a5a', near: '#4a3434', haze: '#f6d0b0', rim: 'rgba(255,214,170,0.5)' });
        acacia(cc, 640, 1420, 1.5, '#5a6a3a', t);
        blurLayer(cc, 9, c3 => { fgStones(c3, 980, 2080, 2.4, '#3a2a24', 5); }, 2);
      }, cc => {
        const q = t - tDe + 0.5;
        sky0(cc, [[0, '#08060e'], [0.6, '#1a1222'], [1, '#2a1a18']]);
        cam(cc, 1.12 + 0.05 * q, 540, 1150);
        cloudsPart(cc, t, 0.25 + 0.1 * ramp(q, 0.5, 2), 540, 560);
        rays(cc, 540, 420, Math.PI / 2, 0.35, 1300, 10, '#fff2d0', 0.12 * ramp(q, 0.2, 1), t, 7);
        fgRidge(cc, 1500, 60, 0.004, 77, '#2a1e1c', { rim: 'rgba(255,220,170,0.5)' });
        cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, 540, ridgeY(540, 1500, 60, 0.004, 77), 300, '#ffe6b0', 0.35 * ramp(q, 0.3, 1)); cc.restore();
      });
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a = seg(t, 0.05, 0.6) * (1 - seg(t, tDe - 0.6, tDe - 0.1));
      topShade(c, a * 1.3); topShade(c, a); c.fillStyle = `rgba(10,6,4,${0.35 * a})`; c.fillRect(0, 440, W, 200); seriesTag(c, a, 12);
      c.save(); c.direction = 'rtl'; textGlow(c, 'إِسْمَاعِيل', W / 2, 360 - (1 - easeOut(seg(t, 0.05, 1.0))) * 30, '700 176px Amiri', '#f6c453', a, '#ffb300', 40); c.restore();
      textGlow(c, 'ʿalayhi s-salām', W / 2, 530, 'italic 500 46px Lora', '#fff3dc', a, '#000000', 14);
      textGlow(c, 'Ismaïl  ·  Ismaël', W / 2, 600, '600 42px Lora', '#e8d6b8', a * 0.9, '#000000', 10);
      const b = ramp(t, tDe, 0.5) * (1 - seg(t, d - 0.4, d));
      textGlow(c, 'AU DERNIER', W / 2, 330, '700 92px Lora', '#fff6e0', b, '#000', 20);
      textGlow(c, 'INSTANT', W / 2, 440, '700 92px Lora', '#fff6e0', b, '#000', 20);
      textGlow(c, '?', W / 2, 560, '700 110px Lora', '#f6c453', b * ramp(t, tCh - 0.3, 0.4), '#ffb300', 24);
    },
  },

  // 3. Long before: Ibrahim brought Hajar and their baby to a barren valley — where Mecca stands today (Ibrahim 37; al-Bukhari 3364)
  valley: {
    grade: 'rgba(255,200,150,0.12)',
    draw(c, t, d) {
      const tH = at('valley', 'hajar', 0, 2.4), tB = at('valley', 'bébé', 0, 3.4), tV = at('valley', 'vallée', 0, 4.6), tE = at('valley', 'eau', 0, 5.8), tM = at('valley', 'mecque', 0, 9.4);
      phases(c, t, tV - 0.4, 0.6, cc => { // the journey: Ibrahim leads, Hajar carries the baby, the camel follows with the water
        const dist = 30 + t * 46, k = ease(seg(t, 0, tV));
        heatSky(cc, 0.3);
        cam(cc, lerp(1.18, 1.08, k), 540 + dist * 0.55, 1260);
        sun(cc, 900 + dist * 0.4, 420, 56, '#fff4d8', 0.6);
        meccaValley(cc, t, { y: 1380, px: dist * 0.9 });
        const gy = 1600, xI = 600 + dist, xH = 400 + dist, xC = 130 + dist;
        camel(cc, xC, gy - 6, 0.95, '#b88a5a', camelT(dist, 0.95), 1, '#6a4a2a', { halter: '#3a2414' });
        const hj = { x: xH, y: gy, h: 450, dir: 1, walk: stepOf(dist, 450) + 0.4, light: 1, t, wind: 0.4, reach: 0.25 };
        fig(cc, HAJ, hj); heldBundle(cc, hj);
        fig(cc, IBR, { x: xI, y: gy + 8, h: 520, dir: 1, staff: true, walk: stepOf(dist, 520), light: 1, t, wind: 0.4 });
        if (t > tB - 0.3) { cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, xH + 40, gy - 260, 140, '#fff6dc', 0.35 * ramp(t, tB - 0.3, 0.5)); cc.restore(); }
        blurLayer(cc, 10, c3 => { fgStones(c3, 300 + dist * 1.3, 2120, 2.2, '#3a2a24', 6); shrub(c3, 1100 + dist * 1.3, 2000, 4, '#4a3a20', t, 3); }, 2);
      }, cc => { // wide: three tiny figures crossing the empty valley between huge dark mountains
        const q = t - tV + 0.4, k = ease(seg(q, 0, d - tV + 0.4)), kM = ramp(t, tM - 0.4, 0.8);
        heatSky(cc, 0.5);
        cam(cc, lerp(1.25, 1.0, k), lerp(560, 540, k), lerp(1260, 1160, k));
        sun(cc, 820, 380, 50, '#fff4d8', 0.7); glow(cc, 820, 380, 600, '#fff0c8', 0.2);
        meccaValley(cc, t, { y: 1300, px: -q * 10 });
        hazeWide(cc, 1310, 60, '#fff0d0', 0.4);
        mound(cc, 700, 1420, 0.8, kM, t);
        const dist = q * 24, gy = 1470;
        camel(cc, 250 + dist, gy - 2, 0.3, '#b88a5a', camelT(dist, 0.3), 1, '#6a4a2a');
        fig(cc, HAJ, { x: 330 + dist, y: gy, h: 140, dir: 1, walk: stepOf(dist, 140) + 0.4, light: 1, t, ink: 0.5 });
        fig(cc, IBR, { x: 380 + dist, y: gy + 2, h: 160, dir: 1, staff: true, walk: stepOf(dist, 160), light: 1, t, ink: 0.5, veilGlow: 0.4 });
        blurLayer(cc, 9, c3 => { fgStones(c3, 1000, 2100, 2.6, '#3a2a24', 8); }, 2);
      });
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 0.9);
      arabicCaption(c, 'بِوَادٍ غَيْرِ ذِي زَرْعٍ', t, tE - 0.4, tM - 0.4, 300, 116);
      caption(c, 'Ibrâhîm, 37', 410, seg(t, tE, tE + 0.6) * (1 - seg(t, tM - 0.5, tM - 0.2)));
      textGlow(c, 'LA MECQUE', W / 2, 310, '700 88px Lora', '#fff6e0', ramp(t, tM - 0.3, 0.4) * (1 - seg(t, d - 0.5, d)), '#000', 18);
      caption(c, "là où elle se trouve aujourd'hui", 400, ramp(t, tM, 0.4) * (1 - seg(t, d - 0.5, d)), 38);
    },
  },

  // 4. By Allah's command he left them. "Did Allah command you this?" "Yes." "Then He will not abandon us." (al-Bukhari 3364)
  leave: {
    grade: 'rgba(255,200,150,0.12)',
    draw(c, t, d) {
      const tL = at('leave', 'laissa', 0, 2.2), tD = at('leave', 'demanda', 0, 3.4), tO = at('leave', 'oui', 0, 6.3), tA = at('leave', 'alors', 0, 7.0), tAb = at('leave', 'abandonnera', 0, 8.6);
      const kA = ramp(t, tA - 0.4, 1.0), kAb = ramp(t, tAb - 0.4, 1.0);
      heatSky(c, 0.35);
      const walk = Math.max(0, t - tL + 0.3), dI = walk * 55, xI = 640 + dI;
      cam(c, lerp(1.1, 1.3, kA) + 0.01 * t, lerp(560 + dI * 0.25, 400, kA), lerp(1260, 1320, kA));
      sun(c, 960, 360, 52, '#fff4d8', 0.6);
      meccaValley(c, t, { y: 1320, px: 0 });
      const gy = 1610;
      acacia(c, 300, gy - 30, 2.4, '#5a6a3a', t);
      c.fillStyle = 'rgba(20,12,6,0.25)'; c.beginPath(); c.ellipse(300, gy, 420, 40, 0, 0, 6.283); c.fill(); // the tree's shade
      waterskin(c, 120, gy + 10, 0.9, 1); dateBag(c, 40, gy + 6, 1);
      babyOnMat(c, 210, gy + 4, 1, t, 0.5 + 0.5 * kAb);
      const follow = ease(seg(t, tL + 0.3, tO - 0.4)) * 200, back = turnDir(t, tA - 0.2, 1, -1, 0.5);
      const xH = 380 + follow;
      fig(c, HAJ, { x: xH, y: gy, h: 450, dir: back, light: 0.95 + 0.1 * kAb, t, wind: 0.3, walk: follow > 0 && follow < 199 ? stepOf(follow, 450) : null, reach: t > tD - 0.2 && t < tA ? 0.5 * ramp(t, tD - 0.2, 0.4) : 0, dua: t > tAb - 0.1 });
      fig(c, IBR, { x: xI, y: gy + 6, h: 520, dir: 1, staff: true, walk: walk > 0 ? stepOf(dI, 520) : null, light: 1, t, wind: 0.35 });
      if (t > tO - 0.2) { const kO = ramp(t, tO - 0.2, 0.6) * (1 - 0.6 * kA); lightFromAbove(c, t, xI, 0.4 * kO, 220); }
      if (kAb > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 280, 1500, 460, '#ffe6b0', 0.25 * kAb); c.restore(); sparkle(c, t, 260, 1430, 10, 200, 4, kAb); }
      blurLayer(c, 10, cc => { fgStones(cc, 1060, 2100, 2.4, '#3a2a24', 11); }, 2);
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 0.9);
      arabicCaption(c, 'آللَّهُ أَمَرَكَ بِهَذَا؟', t, tD - 0.2, tA - 0.4, 300, 110);
      arabicCaption(c, 'إِذًا لَا يُضَيِّعُنَا', t, tA - 0.2, d + 1, 300, 120);
      caption(c, 'Sahîh al-Bukhârî', 410, seg(t, tD + 0.3, tD + 0.9) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 5. Out of sight, at the pass, Ibrahim turned to the valley and prayed (Ibrahim 37)
  prayer: {
    grade: 'rgba(255,180,140,0.14)',
    draw(c, t, d) {
      const tP = at('prayer', 'pria', 0, 2.0), tS = at('prayer', 'seigneur', 0, 2.8), tDe = at('prayer', 'descendance', 0, 5.0), tMa = at('prayer', 'maison', 0, 8.8);
      phases(c, t, tS - 0.4, 0.6, cc => { // climbing to the pass
        sky0(cc, [[0, '#3a4a7a'], [0.3, '#c08a8a'], [0.46, '#ffc890']]);
        const dist = 30 + t * 50; cam(cc, 1.2, 420 + dist * 0.7, 1220 - dist * 0.25);
        sun(cc, 200, 820, 64, '#fff0d0', 0.8);
        crags(cc, 1150, 260, 41, '#6a5060', { detail: false, light: 0.7, litCol: '#ffb090' }); hazeWide(cc, 1170, 200, '#f0a880', 0.4);
        const sy = x => 1700 - (x - 200) * 0.28; // the slope climbing to the right
        cc.fillStyle = '#4a3430'; cc.beginPath(); cc.moveTo(-600, sy(-600)); cc.lineTo(1800, sy(1800)); cc.lineTo(1800, 2600); cc.lineTo(-600, 2600); cc.closePath(); cc.fill();
        cc.strokeStyle = 'rgba(255,200,150,0.55)'; cc.lineWidth = 3; cc.beginPath(); cc.moveTo(-600, sy(-600)); cc.lineTo(1800, sy(1800)); cc.stroke();
        const r = rng(3); for (let i = 0; i < 26; i++) { const bx = -400 + r() * 2000; boulder(cc, bx, sy(bx) + 20 + r() * 300, 40 + r() * 90, 26 + r() * 50, '#5a4038', i); }
        const xI = 300 + dist; lean(cc, xI, sy(xI) + 8, 0.06, () => fig(cc, IBR, { x: xI, y: sy(xI) + 8, h: 500, dir: 1, staff: true, walk: stepOf(dist * 1.04, 500), light: 1, t, wind: 0.4 }));
        blurLayer(cc, 10, c3 => { fgStones(c3, 200 + dist, 2200, 2.6, '#2a1e1a', 12); }, 2);
      }, cc => { // at the top, turned toward the valley, hands raised; far below: the tree, the mound, two tiny figures
        const q = t - tS + 0.4, k = ease(seg(q, 0, d - tS)), kM = ramp(t, tMa - 0.4, 0.8);
        sky0(cc, [[0, '#2a3a6a'], [0.3, '#b08090'], [0.46, '#ffc890']]);
        cam(cc, lerp(1.05, 1.18, k), lerp(600, 520, k), lerp(1150, 1200, k));
        sun(cc, 980, 760, 60, '#fff0d0', 0.8); cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, 980, 760, 500, '#ffb070', 0.3); cc.restore();
        crags(cc, 900, 200, 43, '#7a6070', { detail: false, light: 0.6, litCol: '#ffb090' }); hazeWide(cc, 920, 200, '#f0b090', 0.45);
        sandW(cc, 1060, '#c8a07a', 5, { pebbles: 40 });
        acacia(cc, 380, 1120, 0.5, '#5a6a3a', t); mound(cc, 520, 1118, 0.35, kM, t);
        fig(cc, HAJ, { x: 440, y: 1124, h: 60, dir: -1, light: 1, t, ink: 0.3, pose: 'sit' });
        cc.fillStyle = '#3a2a28'; cc.beginPath(); cc.moveTo(560, 2600); cc.lineTo(600, 1520); cc.quadraticCurveTo(760, 1440, 980, 1460); cc.lineTo(1500, 1500); cc.lineTo(1500, 2600); cc.closePath(); cc.fill();
        cc.strokeStyle = 'rgba(255,200,150,0.55)'; cc.lineWidth = 3; cc.beginPath(); cc.moveTo(600, 1520); cc.quadraticCurveTo(760, 1440, 980, 1460); cc.lineTo(1500, 1500); cc.stroke();
        fig(cc, IBR, { x: 800, y: 1470, h: 480, dir: -1, dua: true, light: 1, t, wind: 0.45 });
        if (kM > 0) sparkle(cc, t, 520, 1080, 8, 80, 3, kM);
        blurLayer(cc, 9, c3 => { fgStones(c3, 1060, 2120, 2.4, '#2a1e1a', 13); }, 2);
      });
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 1);
      arabicCaption(c, 'رَبَّنَا إِنِّي أَسْكَنتُ مِن ذُرِّيَّتِي', t, tS - 0.2, tDe + 1.6, 300, 92);
      arabicCaption(c, 'عِندَ بَيْتِكَ الْمُحَرَّمِ', t, tDe + 1.7, d + 1, 300, 108);
      caption(c, 'Ibrâhîm, 37', 410, seg(t, tS + 0.3, tS + 0.9) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 6. The water ran out; the child cried of thirst; Hajar ran between Safa and Marwa, seven times (al-Bukhari 3364)
  run: {
    grade: 'rgba(255,190,120,0.16)',
    draw(c, t, d) {
      const tM = at('run', 'manquer', 0, 1.6), tSo = at('run', 'soif', 0, 3.2), tC = at('run', 'courut', 0, 4.0), tSa = at('run', 'safa', 0, 5.8), tMa = at('run', 'marwa', 0, 6.4), tSe = at('run', 'sept', 0, 8.4);
      phases(c, t, tC - 0.3, 0.5, cc => { // the empty water skin, the child crying under the burning sun
        heatSky(cc, 0.8);
        const k = ease(seg(t, 0, tC)); cam(cc, lerp(1.5, 1.3, k), lerp(380, 460, k), lerp(1560, 1500, k));
        sun(cc, 820, 620, 70, '#fffaf0', 1); cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, 820, 620, 700, '#fff0c8', 0.35); cc.restore();
        meccaValley(cc, t, { y: 1320 });
        const gy = 1610;
        acacia(cc, 420, gy - 30, 2.4, '#6a6a3a', t);
        waterskin(cc, 300, gy + 30, 1.3, 1 - ramp(t, tM - 0.6, 1.0));
        babyOnMat(cc, 520, gy + 10, 1.25, t, 0.5);
        cryRings(cc, 470, gy - 20, t, ramp(t, tSo - 0.8, 0.5));
        fig(cc, HAJ, { x: 720, y: gy + 10, h: 470, dir: -1, pose: 'kneel', light: 1, t, ink: 0.85, dua: t > tSo - 0.2 });
        cc.fillStyle = `rgba(255,240,210,${0.08 + 0.04 * Math.sin(t * 2)})`; cc.fillRect(-600, -600, W + 1200, H + 1200); // glare
      }, cc => { // Safa and Marwa: she runs back and forth between the two hills
        const q = t - tC + 0.3, speed = 300, span = 520, x0 = 280;
        const tri = u => { const m = u % (2 * span); return m < span ? m : 2 * span - m; }, dist = q * speed, xR = x0 + tri(dist), going = (dist % (2 * span)) < span;
        const kL = ramp(t, tSa - 0.3, 0.4);
        heatSky(cc, 0.7);
        cam(cc, 1.06 + 0.02 * q, 540 + (xR - 540) * 0.25, 1300);
        sun(cc, 540, 380, 60, '#fffaf0', 0.9);
        crags(cc, 1100, 200, 51, '#8a7280', { detail: false, light: 0.6 }); hazeWide(cc, 1120, 200, '#f4dcb8', 0.5);
        sandW(cc, 1560, SANDC, 7, { pebbles: 80 });
        rock(cc, 60, 1600, 520, 360, '#6a5040', 17, { sharp: 0.45, domes: 5, bumps: 6, lightX: 1 });
        rock(cc, 1040, 1600, 520, 400, '#6a5040', 19, { sharp: 0.45, domes: 5, bumps: 6 });
        const u = dist % span, edge = clamp(Math.min(u, span - u) / 45), hd = (going ? 1 : -1) * Math.max(0.04, edge);
        fig(cc, HAJ, { x: xR, y: 1640, h: 400, dir: hd, walk: stepOf(dist, 400) * 1.3, light: 1, t, wind: 0.6 });
        blowingSand(cc, t, 1500, 0.25, 5);
        cc.setTransform(1, 0, 0, 1, 0, 0);
        textGlow(cc, 'SAFA', 150, 1180, '700 54px Lora', '#fff6e0', kL, '#000', 12);
        textGlow(cc, 'MARWA', 930, 1180, '700 54px Lora', '#fff6e0', ramp(t, tMa - 0.3, 0.4), '#000', 12);
        runCount(cc, Math.min(1, seg(t, tC + 0.3, tSe + 0.3)), 1780, ramp(q, 0.4, 0.5));
      });
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 0.9);
      arabicCaption(c, 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ', t, tSa - 0.4, d + 1, 300, 80);
      caption(c, 'Al-Baqara, 158', 410, seg(t, tSa, tSa + 0.6) * (1 - seg(t, d - 0.5, d)));
      textGlow(c, 'SEPT FOIS', W / 2, 520, '700 70px Lora', '#f6c453', ramp(t, tSe - 0.1, 0.3) * (1 - seg(t, d - 0.5, d)), '#000', 16);
    },
  },

  // 7. Near the child the water gushed: an angel struck the ground (the angel never shown). Zamzam, still flowing today. (al-Bukhari 3364)
  zamzam: {
    grade: 'rgba(200,220,255,0.12)',
    draw(c, t, d) {
      const tJ = at('zamzam', 'jaillit', 0, 2.0), tAn = at('zamzam', 'ange', 0, 3.4), tHa = at('zamzam', 'hadith', 0, 5.2), tZ = at('zamzam', 'zamzam', 0, 6.6), tCo = at('zamzam', 'coule', 0, 7.6);
      const kJ = ramp(t, tJ - 0.3, 1.6), kB = ramp(t, tAn - 0.3, 0.4) * (1 - ramp(t, tAn + 0.6, 1.2)), kZ = ramp(t, tZ - 0.6, 1.2), kCo = ramp(t, tCo - 0.4, 2.2);
      const gy = 1620, wx = 600;
      const setA = (cc, z, cx, cy) => {
        sky0(cc, [[0, mix('#6a9ac8', '#7aa8d8', kZ)], [0.3, '#c8dcea'], [0.48, '#f6ecd0']]);
        cam(cc, z, cx, cy);
        sun(cc, 880, 420, 52, '#fffaf0', 0.7);
        meccaValley(cc, t, { y: 1320 });
        acacia(cc, 380, gy - 40, 2.4, '#5a6a3a', t);
        babyOnMat(cc, 420, gy + 6, 1.15, t, 0.6 + 0.4 * kJ);
        cryRings(cc, 370, gy - 22, t, 1 - ramp(t, tJ - 0.2, 0.4));
        groundBurst(cc, wx, gy + 20, kB, t);
        spring(cc, wx, gy + 30, kJ, t, 0.85, { jet: 0.7 });
        basinRing(cc, wx, gy + 30, 0.85, ramp(t, tZ - 0.4, 2.0));
      };
      phases(c, t, tZ - 0.5, 0.35, cc => { // the water gushes; Hajar runs back to the child
        setA(cc, 1.3 + 0.01 * t, 620, 1480);
        const arrive = ease(seg(t, tAn, tZ - 0.3)), xH = lerp(1240, 840, arrive);
        fig(cc, HAJ, { x: xH, y: gy + 10, h: 470, dir: -1, walk: arrive < 1 ? stepOf(400 * arrive, 470) * 1.2 : null, light: 1, t, wind: 0.5 });
        blurLayer(cc, 10, c3 => { fgStones(c3, 60, 2160, 2.4, '#3a2a24', 15); }, 2);
      }, cc => { // she kneels and heaps sand around the water; then the camera rises: birds circle over the valley
        setA(cc, lerp(1.2, 0.98, kCo), lerp(600, 540, kCo), lerp(1440, 1300, kCo));
        fig(cc, HAJ, { x: 820, y: gy + 10, h: 470, dir: -1, pose: 'kneel', light: 1, t, ink: 0.85, dua: t > tZ + 0.4 });
        circleBirds(cc, t, 600, 760, 7, 260, kCo, 7, '#2a2a3a');
        blurLayer(cc, 10, c3 => { fgStones(c3, 60, 2160, 2.4, '#3a2a24', 15); }, 2);
      });
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 0.9);
      c.save(); c.direction = 'rtl'; textGlow(c, 'زَمْزَم', W / 2, 330 - (1 - easeOut(seg(t, tZ - 0.2, tZ + 0.6))) * 30, '700 190px Amiri', '#f6c453', ramp(t, tZ - 0.2, 0.5) * (1 - seg(t, d - 0.6, d)), '#ffb300', 40); c.restore();
      caption(c, 'Sahîh al-Bukhârî', 410, ramp(t, tHa - 0.4, 0.4) * (1 - ramp(t, tZ - 0.6, 0.3)));
      caption(c, "elle coule encore aujourd'hui", 470, ramp(t, tCo, 0.5) * (1 - seg(t, d - 0.5, d)), 40, '#fff3dc');
    },
  },

  // 8. Isma'il grew up; when he was old enough to go about with his father, Ibrahim saw the dream (As-Saffat 102). A prophet's dream is revelation (exegetes).
  dream: {
    grade: 'rgba(170,180,240,0.14)',
    draw(c, t, d) {
      const tG = at('dream', 'grandit', 0, 0.8), tAc = at('dream', 'accompagner', 0, 3.2), tS = at('dream', 'songe', 0, 5.4), tP = at('dream', 'prophète', 0, 7.0), tR = at('dream', 'révélation', 0, 8.4);
      phases(c, t, tS - 0.5, 0.6, cc => { // the years: the boy grows, walking with his father
        phases(cc, t, tAc - 0.5, 0.35, c3 => { // the boy runs beside his mother near the water (the years pass)
          const dist = 20 + t * 40;
          sky0(c3, [[0, '#5a8ac0'], [0.32, '#c0d4e4'], [0.48, '#f6e6c8']]);
          cam(c3, 1.2, 560 + dist * 0.5, 1320);
          meccaValley(c3, t, { y: 1380, px: dist * 0.9, sand: '#c8a274' });
          acacia(c3, 220, 1600, 2.0, '#5a6a3a', t); spring(c3, 330, 1640, 1, t, 0.45, { jet: 0.1 }); basinRing(c3, 330, 1640, 0.45, 1);
          fig(c3, HAJ, { x: 520 + dist, y: 1640, h: 450, dir: 1, walk: stepOf(dist, 450), light: 1, t, wind: 0.3 });
          fig(c3, ISMC, { x: 680 + dist * 1.0, y: 1644, h: 350, dir: 1, walk: stepOf(dist, 350 * 0.82) + 0.3, light: 1, t, wind: 0.3 });
          blurLayer(c3, 10, c4 => { fgStones(c4, 1000 + dist * 1.3, 2140, 2.4, '#3a2a24', 16); }, 2);
        }, c3 => { // grown: he goes about with his father, among the flock
          const dist = 20 + t * 44;
          sky0(c3, [[0, '#5a8ac0'], [0.32, '#c0d4e4'], [0.48, '#f6e6c8']]);
          cam(c3, 1.15, 540 + dist * 0.6, 1300);
          meccaValley(c3, t, { y: 1380, px: dist * 0.9, sand: '#c8a274' });
          const gy = 1620, xI = 460 + dist, xS = 660 + dist;
          fig(c3, IBR, { x: xI, y: gy, h: 520, dir: 1, staff: true, walk: stepOf(dist, 520), light: 1, t, wind: 0.35 });
          fig(c3, ISM, { x: xS, y: gy + 4, h: 450, dir: 1, walk: stepOf(dist, 450) + 0.3, light: 1, t, wind: 0.35 });
          for (let i = 0; i < 3; i++) sheep(c3, 900 + dist * 1.0 + i * 120, gy + 30 + (i % 2) * 20, 1.0, t, 1, { graze: false });
          blurLayer(c3, 10, c4 => { fgStones(c4, 200 + dist * 1.3, 2140, 2.4, '#3a2a24', 16); }, 2);
        });
      }, cc => { // night: Ibrahim asleep by the tent, the dream (light, stars), "revelation"
        const q = t - tS + 0.5, k = ease(seg(q, 0, d - tS)), kR = ramp(t, tR - 0.3, 1.0), kP = ramp(t, tP - 0.4, 0.8);
        sky0(cc, [[0, '#04061a'], [0.5, '#101838'], [1, '#1a1a38']]);
        cam(cc, lerp(1.05, 1.3, k), 540, lerp(1200, 1340, k));
        stars(cc, t, 200, 8, [-300, -300, W + 600, 1100], 1); milkyWay(cc, t, 0.8); moon(cc, 820, 360, 40, 1, 0.3);
        crags(cc, 1250, 200, 61, '#1a1828', { detail: false, light: 0.2, litCol: '#8090c0' });
        sandW(cc, 1400, '#2a2834', 9, { pebbles: 40 });
        tentDark(cc, 820, 1460, 1.3, t);
        fig(cc, IBR, { x: 480, y: 1560, h: 460, dir: 1, pose: 'lie', light: 0.6 + 0.4 * kR, t, ink: 0.7 });
        cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, 330, 1520, 260 + 120 * kP, '#c8d4ff', 0.25 + 0.2 * kP); cc.restore();
        lightRings(cc, 330, 1500, t, 0.5 + 0.5 * kP, 4, 520);
        if (kR > 0) { lightFromAbove(cc, t, 340, 0.45 * kR, 240); sparkle(cc, t, 340, 1300, 12, 220, 6, kR); }
      });
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 0.9);
      arabicCaption(c, 'فَلَمَّا بَلَغَ مَعَهُ السَّعْيَ', t, tAc - 0.4, tS - 0.5, 300, 110);
      caption(c, 'As-Sâffât, 102', 410, seg(t, tAc, tAc + 0.6) * (1 - seg(t, tS - 0.7, tS - 0.4)));
      textGlow(c, 'UNE RÉVÉLATION', W / 2, 320, '700 78px Lora', '#e8ecff', ramp(t, tR - 0.2, 0.4) * (1 - seg(t, d - 0.5, d)), '#000', 18);
      caption(c, 'le songe des prophètes est révélation — selon les exégètes', 410, ramp(t, tP - 0.3, 0.4) * (1 - seg(t, d - 0.5, d)), 32);
    },
  },

  // 9. "O my son, I see in a dream that I am sacrificing you. So see what you think." (As-Saffat 102)
  ask: {
    grade: 'rgba(200,170,190,0.14)',
    draw(c, t, d) {
      const tF = at('ask', 'fils', 0, 1.6), tSo = at('ask', 'songe', 0, 3.0), tIm = at('ask', 'immoler', 0, 4.4), tPe = at('ask', 'penses', 0, 5.6);
      const kF = ramp(t, tF - 0.3, 0.6), kI = ramp(t, tIm - 0.4, 1.2);
      sky0(c, [[0, '#2a2a52'], [0.3, '#8a6a88'], [0.46, '#e8a888']]);
      cam(c, lerp(1.15, 1.42, ease(seg(t, 0, d))), lerp(560, lerp(560, 690, kI), 0.9), lerp(1300, 1340, kI));
      sun(c, 560, 1020, 54, '#ffe0c0', 0.7);
      crags(c, 1060, 220, 31, '#5a4a62', { detail: false, light: 0.5, litCol: '#ffb090' }); hazeWide(c, 1080, 220, '#e09a7a', 0.45);
      crags(c, 1260, 240, 33, '#4a3640', { rim: 'rgba(255,190,140,0.4)', gullies: 30, blocks: 40, litCol: '#ffb090' });
      fgRidge(c, 1600, 20, 0.004, 63, '#6a4a3a', { rim: 'rgba(255,200,150,0.6)', shade: 0.3 });
      const gy = x => ridgeY(x, 1600, 20, 0.004, 63) + 10;
      boulder(c, 720, gy(720) + 6, 200, 64, '#5a4038', 4);
      fig(c, IBR, { x: 420, y: gy(420), h: 540, dir: 1, light: 0.95, t, wind: 0.3, reach: 0.5 * kF });
      fig(c, ISM, { x: 730, y: gy(720) - 56, h: 440, dir: -1, pose: 'sit', light: 0.95, t: t + 1, ink: 0.85 });
      heartbeat(c, t, 0.6 * kI * (1 - ramp(t, tPe, 1)));
      blurLayer(c, 10, cc => { fgStones(cc, 80, 2140, 2.4, '#2a1e1a', 17); fgStones(cc, 1100, 2160, 2.2, '#2a1e1a', 18); }, 2);
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 1);
      arabicCaption(c, 'يَا بُنَيَّ إِنِّي أَرَىٰ فِي الْمَنَامِ', t, tF - 0.3, tIm - 0.1, 300, 96);
      arabicCaption(c, 'فَانظُرْ مَاذَا تَرَىٰ', t, tIm, d + 1, 300, 116);
      caption(c, 'As-Sâffât, 102', 410, seg(t, tF, tF + 0.6) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 10. "O my father, do what you are commanded; you will find me, if Allah wills, among the patient." (As-Saffat 102)
  answer: {
    grade: 'rgba(255,200,160,0.14)',
    draw(c, t, d) {
      const tFa = at('answer', 'fais', 0, 1.3), tO = at('answer', 'ordonné', 0, 2.3), tTr = at('answer', 'trouveras', 0, 3.4), tEn = at('answer', 'endurants', 0, 6.2);
      const kTr = ramp(t, tTr - 0.4, 1.4), kE = ramp(t, tEn - 0.4, 1.2);
      phases(c, t, tTr - 0.4, 0.6, cc => { // close on the son: he rises, his hand to his father
        sky0(cc, [[0, '#2a2a52'], [0.3, '#9a7088'], [0.46, '#f0b088']]);
        const up = ramp(t, 0.1, 0.8);
        cam(cc, 1.6 + 0.02 * t, 650, 1180);
        sun(cc, 560, 1000, 58, '#ffe6c8', 0.8 + 0.2 * up);
        crags(cc, 1060, 220, 31, '#5a4a62', { detail: false, light: 0.5, litCol: '#ffb090' }); hazeWide(cc, 1080, 220, '#e09a7a', 0.45);
        crags(cc, 1260, 240, 33, '#4a3640', { rim: 'rgba(255,190,140,0.4)', gullies: 30, blocks: 40, litCol: '#ffb090' });
        fgRidge(cc, 1600, 20, 0.004, 63, '#6a4a3a', { rim: 'rgba(255,200,150,0.6)', shade: 0.3 });
        const gy = x => ridgeY(x, 1600, 20, 0.004, 63) + 10;
        fig(cc, ISM, { x: 720, y: gy(720), h: 480, dir: -1, light: 1, t: t + 1, wind: 0.35, reach: 0.55 * ramp(t, tFa - 0.3, 0.6) });
        if (t > tO - 0.2) { cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, 700, 1250, 300, '#ffe8c0', 0.3 * ramp(t, tO - 0.2, 0.8)); cc.restore(); }
      }, cc => { // wide: both standing at sunrise, light growing
        sky0(cc, [[0, '#2a3262'], [0.3, '#b07a88'], [0.46, '#ffc890']]);
        cam(cc, lerp(1.35, 1.1, kTr), lerp(560, 560, kTr), lerp(1280, 1220, kTr));
        sun(cc, 560, lerp(1000, 940, kE), 62, '#fff0d0', 1); cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, 560, 960, 700, '#ffb070', 0.3 + 0.2 * kE); cc.restore();
        crags(cc, 1060, 220, 31, '#6a5068', { detail: false, light: 0.6, litCol: '#ffb090' }); hazeWide(cc, 1080, 220, '#f0aa7a', 0.45);
        crags(cc, 1260, 240, 33, '#4a3640', { rim: 'rgba(255,200,150,0.5)', gullies: 30, blocks: 40, litCol: '#ffb090' });
        fgRidge(cc, 1600, 20, 0.004, 63, '#6a4a3a', { rim: 'rgba(255,210,160,0.7)', shade: 0.3 });
        const gy = x => ridgeY(x, 1600, 20, 0.004, 63) + 10;
        fig(cc, IBR, { x: 400, y: gy(400), h: 540, dir: 1, light: 1, t, wind: 0.35, dua: t > tEn - 0.3 });
        fig(cc, ISM, { x: 720, y: gy(720), h: 480, dir: -1, light: 1, t: t + 1, wind: 0.35, dua: t > tEn - 0.3 });
        if (kE > 0) { lightFromAbove(cc, t, 560, 0.35 * kE, 280); sparkle(cc, t, 560, 1250, 12, 260, 8, kE); }
        blurLayer(cc, 10, c3 => { fgStones(c3, 80, 2140, 2.4, '#2a1e1a', 17); fgStones(c3, 1100, 2160, 2.2, '#2a1e1a', 18); }, 2);
      });
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 1);
      arabicCaption(c, 'يَا أَبَتِ افْعَلْ مَا تُؤْمَرُ', t, tFa - 0.3, tTr - 0.2, 300, 110);
      arabicCaption(c, 'سَتَجِدُنِي إِن شَاءَ اللَّهُ مِنَ الصَّابِرِينَ', t, tTr - 0.1, d + 1, 300, 76);
      caption(c, 'As-Sâffât, 102', 410, seg(t, tFa, tFa + 0.6) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 11. Both submitted; he laid him down on his forehead (As-Saffat 103). Shown without any blade: only the gesture, the wind, the dark sky.
  submit: {
    grade: 'rgba(150,140,190,0.18)',
    draw(c, t, d) {
      const tSo = at('submit', 'soumirent', 0, 1.2), tCo = at('submit', 'coucha', 0, 3.0), tFr = at('submit', 'front', 0, 4.2);
      const push = ease(seg(t, 0, d + 1));
      const set = (c, z, cx, cy) => {
      sky0(c, [[0, '#14141e'], [0.3, '#3a3040'], [0.48, '#8a6a68']]);
      cam(c, z, cx, cy);
      cloudBank(c, t, 200, 8, '#2a2430', 0.7, 31, 14); cloudBank(c, t, 520, 7, '#3a3038', 0.55, 32, 9);
      crags(c, 1160, 240, 33, '#2a2228', { rim: 'rgba(200,160,150,0.3)', gullies: 30, blocks: 40, litCol: '#c09090', light: 0.4 });
      fgRidge(c, 1600, 20, 0.004, 63, '#4a3632', { rim: 'rgba(220,180,160,0.4)', shade: 0.35 });
      };
      const gy = x => ridgeY(x, 1600, 20, 0.004, 63) + 10;
      phases(c, t, tCo - 0.3, 0.35, c => {
      set(c, lerp(1.05, 1.3, push), lerp(560, 580, push), lerp(1280, 1360, push));
      fig(c, IBR, { x: 430, y: gy(430), h: 540, dir: 1, light: 0.8, t, wind: 0.6, dua: t > tSo - 0.2 });
      fig(c, ISM, { x: 700, y: gy(700), h: 480, dir: -1, light: 0.8, t: t + 1, wind: 0.6, dua: t > tSo - 0.2 });
      blowingSand(c, t, 1500, 0.3, 8);
      blurLayer(c, 10, cc => { fgStones(cc, 80, 2140, 2.4, '#1a1412', 21); fgStones(cc, 1100, 2160, 2.2, '#1a1412', 22); }, 2);
      }, c => {
      set(c, lerp(1.4, 1.55, push), 600, 1430);
      fig(c, ISM, { x: 690, y: gy(690), h: 430, dir: 1, pose: 'prostrate', light: 0.85, t, ink: 0.85 });
      fig(c, IBR, { x: 480, y: gy(480), h: 520, dir: 1, pose: 'kneel', light: 0.85, t, ink: 0.85 });
      blowingSand(c, t, 1500, 0.3, 8);
      blurLayer(c, 10, cc => { fgStones(cc, 80, 2140, 2.4, '#1a1412', 21); fgStones(cc, 1100, 2160, 2.2, '#1a1412', 22); }, 2);
      });
      c.setTransform(1, 0, 0, 1, 0, 0); heartbeat(c, t, 0.7 * ramp(t, tCo - 0.3, 1.0));
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 1);
      arabicCaption(c, 'فَلَمَّا أَسْلَمَا', t, tSo - 0.3, tCo - 0.2, 300, 130, '#e8d8c0');
      arabicCaption(c, 'وَتَلَّهُ لِلْجَبِينِ', t, tCo - 0.1, d + 1, 300, 130, '#e8d8c0');
      caption(c, 'As-Sâffât, 103', 410, seg(t, tSo, tSo + 0.6) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 12. THE PEAK — "We called to him: O Ibrahim! You have fulfilled the vision. Thus do We reward the doers of good." (As-Saffat 104-105)
  call: {
    grade: 'rgba(255,220,170,0.16)',
    draw(c, t, d) {
      const tAp = at('call', 'appela', 0, 1.4), tI = at('call', 'ibrahim', 0, 2.3), tCf = at('call', 'confirmé', 0, 3.6), tRe = at('call', 'récompensons', 0, 6.4);
      const kA = ramp(t, tAp - 0.3, 1.2), kI = ramp(t, tI - 0.2, 0.8), kR = ramp(t, tRe - 0.4, 1.4);
      sky0(c, [[0, mix('#14141e', '#3a4a7a', kA)], [0.3, mix('#3a3040', '#d0a0a0', kA)], [0.48, mix('#8a6a68', '#ffd8a8', kA)]]);
      cam(c, lerp(1.45, 1.05, ease(seg(t, tAp - 0.3, tRe + 0.5))), lerp(600, 560, kA), lerp(1420, 1240, kA));
      cloudsPart(c, t, kA, 560, 360);
      rays(c, 560, 240, Math.PI / 2, 0.8, 1700, 16, '#fff6dc', 0.16 * kA, t, 9);
      crags(c, 1160, 240, 33, mix('#2a2228', '#5a4048', kA), { rim: `rgba(255,220,180,${0.3 + 0.4 * kA})`, gullies: 30, blocks: 40, litCol: '#ffc8a0', light: 0.4 + 0.6 * kA });
      fgRidge(c, 1600, 20, 0.004, 63, mix('#4a3632', '#7a5a46', kA), { rim: `rgba(255,220,170,${0.4 + 0.4 * kA})`, shade: 0.3 });
      const gy = x => ridgeY(x, 1600, 20, 0.004, 63) + 10;
      lightFromAbove(c, t, 560, 0.7 * kA, 360);
      if (t < tI - 0.15) { fig(c, ISM, { x: 690, y: gy(690), h: 430, dir: 1, pose: 'prostrate', light: 0.85 + 0.15 * kA, t, ink: 0.85 }); fig(c, IBR, { x: 480, y: gy(480), h: 520, dir: 1, pose: 'kneel', light: 0.85 + 0.15 * kA, t, ink: 0.85, dua: t > tAp }); }
      else { fig(c, IBR, { x: 430, y: gy(430), h: 540, dir: 1, light: 1, t, wind: 0.3, armUp: kR > 0.5 ? 0 : 0.8 * kI, dua: kR > 0.5 });
        fig(c, ISM, { x: 700, y: gy(700), h: 480, dir: -1, light: 1, t: t + 1, wind: 0.3, dua: true }); }
      if (Math.abs(t - tI + 0.15) < 0.12) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(255,250,235,${0.9 * (1 - Math.abs(t - tI + 0.15) / 0.12)})`; c.fillRect(0, 0, W, H); c.restore(); } // white flash hides the cut
      lightRings(c, 560, 1580, t, 0.8 * kA, 5, 700); sparkle(c, t, 560, 1200, 18, 340, 9, kA);
      blurLayer(c, 10, cc => { fgStones(cc, 80, 2140, 2.4, mix('#1a1412', '#3a2a24', kA), 21); fgStones(cc, 1100, 2160, 2.2, mix('#1a1412', '#3a2a24', kA), 22); }, 2);
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 1);
      arabicCaption(c, 'وَنَادَيْنَاهُ أَن يَا إِبْرَاهِيمُ', t, tAp - 0.2, tCf - 0.3, 300, 100);
      arabicCaption(c, 'قَدْ صَدَّقْتَ الرُّؤْيَا', t, tCf - 0.2, d + 1, 300, 124);
      caption(c, 'As-Sâffât, 104-105', 410, seg(t, tAp + 0.3, tAp + 0.9) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 13. "We ransomed him with a great sacrifice" (As-Saffat 107): a ram (exegetes). Remembered by Muslims at every Eid al-Adha.
  ram: {
    grade: 'rgba(255,210,160,0.14)',
    draw(c, t, d) {
      const tSa = at('ram', 'sacrifice', 0, 2.6), tB = at('ram', 'bélier', 0, 4.0), tMu = at('ram', 'musulmans', 0, 5.6), tAi = at('ram', 'aïd', 0, 7.4);
      phases(c, t, tMu - 0.4, 0.6, cc => { // the ram walks in on the height; father and son side by side in the light
        const kB = ease(seg(t, tSa - 0.6, tB + 0.4));
        sky0(cc, [[0, '#3a4a7a'], [0.3, '#d0a0a0'], [0.48, '#ffd8a8']]);
        cam(cc, 1.12 - 0.04 * ease(seg(t, 0, tMu)), 600, 1260);
        rays(cc, 560, 240, Math.PI / 2, 0.8, 1700, 14, '#fff6dc', 0.1, t, 9);
        crags(cc, 1160, 240, 33, '#5a4048', { rim: 'rgba(255,220,180,0.6)', gullies: 30, blocks: 40, litCol: '#ffc8a0' });
        fgRidge(cc, 1600, 20, 0.004, 63, '#7a5a46', { rim: 'rgba(255,220,170,0.75)', shade: 0.3 });
        const gy = x => ridgeY(x, 1600, 20, 0.004, 63) + 10;
        lightFromAbove(cc, t, 560, 0.35, 320);
        fig(cc, IBR, { x: 330, y: gy(330), h: 540, dir: 1, light: 1, t, wind: 0.3, reach: 0.35 * ramp(t, tB - 0.2, 0.6) });
        fig(cc, ISM, { x: 520, y: gy(520), h: 480, dir: 1, light: 1, t: t + 1, wind: 0.3 });
        const rx = lerp(1300, 830, kB); ram(cc, rx, gy(rx) + 4, 1.5, t, -1, { walk: kB < 1 ? (1300 - rx) / 160 : null, glow: ramp(t, tB - 0.3, 0.8) });
        sparkle(cc, t, 830, 1420, 10, 160, 4, ramp(t, tB - 0.2, 0.8));
        blurLayer(cc, 10, c3 => { fgStones(c3, 80, 2140, 2.4, '#3a2a24', 21); }, 2);
      }, cc => { // Eid al-Adha: dawn, the crescent, rows of faithful in prayer
        const q = t - tMu + 0.4, kAi = ramp(t, tAi - 0.4, 0.8);
        sky0(cc, [[0, '#1a2250'], [0.32, '#7a6a90'], [0.46, '#f0b088']]);
        cam(cc, lerp(1.2, 1.05, ease(seg(q, 0, 3))), 540, 1200);
        stars(cc, t, 60, 12, [-200, -200, W + 400, 700], 0.6); moon(cc, 780, 400, 40, 1, 0.55);
        crags(cc, 1080, 200, 71, '#4a3a52', { detail: false, light: 0.5, litCol: '#ffb090' }); hazeWide(cc, 1100, 200, '#e0a080', 0.4);
        sandW(cc, 1240, '#a88a6a', 11, { pebbles: 30 });
        for (let row = 0; row < 3; row++) { const yy = 1300 + row * 130, hh = 150 + row * 60, n = 7 - row;
          for (let i = 0; i < n + 2; i++) { const x = -60 + (i + (row % 2) * 0.5) * (W + 120) / n, who = FOLK[(i * 3 + row) % FOLK.length];
            fig(cc, who, { x, y: yy, h: hh, dir: 1, pose: row === 1 ? 'prostrate' : 'kneel', dua: row !== 1, light: 0.8, t: t + i, ink: 0.6 }); } }
      });
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 0.9);
      arabicCaption(c, 'وَفَدَيْنَاهُ بِذِبْحٍ عَظِيمٍ', t, tSa - 0.4, tMu - 0.4, 300, 112);
      caption(c, 'As-Sâffât, 107  ·  le bélier : selon les exégètes', 410, seg(t, tSa, tSa + 0.6) * (1 - seg(t, tMu - 0.6, tMu - 0.3)), 32);
      textGlow(c, 'AÏD AL-ADHA', W / 2, 320, '700 92px Lora', '#fff6e0', ramp(t, tAi - 0.3, 0.4) * (1 - seg(t, d - 0.5, d)), '#000', 18);
      c.save(); c.direction = 'rtl'; textGlow(c, 'عِيدُ الأَضْحَى', W / 2, 440, '700 84px Amiri', '#f6c453', ramp(t, tAi, 0.5) * (1 - seg(t, d - 0.5, d)), '#ffb300', 24); c.restore();
    },
  },

  // 14. Years later, father and son raised the foundations of the House: "Our Lord, accept this from us" (Al-Baqara 127)
  kaaba: {
    grade: 'rgba(255,200,150,0.14)',
    draw(c, t, d) {
      const tEl = at('kaaba', 'élevèrent', 0, 3.2), tK = at('kaaba', 'kaaba', 0, 5.2), tS = at('kaaba', 'seigneur', 0, 6.4), tAc = at('kaaba', 'accepte', 0, 7.2);
      const build = lerp(0.35, 0.82, ease(seg(t, 0, tS))), kS = ramp(t, tS - 0.3, 0.8), wide = ease(seg(t, tK - 0.6, tS + 0.4));
      sky0(c, [[0, '#3a4a7a'], [0.3, '#c08a8a'], [0.46, '#ffc890']]);
      cam(c, lerp(1.3, 1.05, wide) + 0.01 * t, lerp(580, 560, wide), lerp(1360, 1260, wide));
      sun(c, 200, 880, 60, '#fff0d0', 0.8); c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 200, 880, 600, '#ffb070', 0.3); c.restore();
      meccaValley(c, t, { y: 1340, far: '#8a7a90', mid: '#6a5050', near: '#4a3434', haze: '#f6c8a0', rim: 'rgba(255,210,160,0.5)' });
      const gy = 1640, kx = 520, kw = 340, kh = 520;
      kaabaWalls(c, kx, gy, kw, kh, build, t, { glow: kS });
      // the son brings a stone; the father, on the stone, lays it on the wall
      const cyc = (t * 0.32) % 1, carry = cyc < 0.5, sx = carry ? lerp(1120, 900, cyc * 2) : lerp(900, 1120, (cyc - 0.5) * 2);
      const pray = t > tS - 0.3;
      maqamStone(c, 300, gy + 4, 1.2);
      fig(c, IBR, { x: 300, y: gy - 58, h: 500, dir: 1, light: 1, t, wind: 0.3, armUp: pray ? 0 : 0.75 + 0.15 * Math.sin(t * 2), dua: pray });
      if (!pray) { const au = 0.75 + 0.15 * Math.sin(t * 2), s5 = 500 / 300; block(c, 300 + lerp(48, 82, au) * s5 + 6, gy - 58 + lerp(-112, -300, au) * s5 - 26, 1.1); }
      const so = { x: pray ? 900 : sx, y: gy, h: 460, dir: pray ? -1 : (carry ? -1 : 1), light: 1, t: t + 1, wind: 0.3, walk: pray ? null : stepOf(t * 0.32 * 440, 460), reach: pray ? 0 : (carry ? 0.45 : 0), dua: pray };
      fig(c, ISM, so); if (!pray && carry) block(c, so.x + so.dir * lerp(48, 100, 0.45) * 460 / 300, gy + lerp(-112, -180, 0.45) * 460 / 300 - 22, 1.1);
      if (kS > 0) { lightRings(c, kx + 80, gy - 20, t, 0.6 * kS, 4, 620); sparkle(c, t, kx + 80, gy - 300, 14, 300, 11, kS); }
      blurLayer(c, 10, cc => { fgStones(cc, 60, 2160, 2.4, '#3a2a24', 23); }, 2);
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 1);
      arabicCaption(c, 'وَإِذْ يَرْفَعُ إِبْرَاهِيمُ الْقَوَاعِدَ مِنَ الْبَيْتِ', t, tEl - 0.4, tS - 0.3, 300, 76);
      arabicCaption(c, 'رَبَّنَا تَقَبَّلْ مِنَّا', t, tS - 0.2, d + 1, 300, 130);
      caption(c, 'Al-Baqara, 127', 410, seg(t, tEl, tEl + 0.6) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 15. The lesson: Hajar had said it — Allah will not abandon us. Trust Him (At-Talaq 3). The valley, the House, Zamzam, the birds.
  lesson: {
    grade: 'rgba(255,190,140,0.16)',
    draw(c, t, d) {
      const tAb = at('lesson', 'abandonnera', 0, 2.6), tCo = at('lesson', 'confiance', 0, 4.6), tJa = at('lesson', 'jamais', 0, 6.0);
      const back = ease(seg(t, 0, d)), kJ = ramp(t, tJa - 0.3, 1.0);
      sky0(c, [[0, '#2a3262'], [0.28, '#b07a88'], [0.44, '#ffc890'], [0.5, '#ffe2b0']]);
      cam(c, lerp(1.32, 1.0, back), lerp(560, 540, back), lerp(1380, 1250, back));
      sun(c, 900, 1060, 70, '#fff0d0', 0.9); c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 900, 1060, 700, '#ffb070', 0.32); c.restore();
      meccaValley(c, t, { y: 1340, far: '#8a7a90', mid: '#6a5050', near: '#4a3434', haze: '#f6c8a0', rim: 'rgba(255,210,160,0.55)' });
      const gy = 1640;
      kaabaWalls(c, 700, 1520, 260, 330, 1, t, { glow: 0.4 + 0.6 * kJ });
      acacia(c, 160, gy - 40, 2.2, '#5a6a3a', t);
      spring(c, 360, gy + 10, 1, t, 0.55, { jet: 0.15 }); basinRing(c, 360, gy + 10, 0.55, 1);
      fig(c, HAJ, { x: 520, y: gy + 10, h: 450, dir: 1, light: 1, t, wind: 0.3, dua: t > tCo - 0.2 });
      fig(c, ISMC, { x: 640, y: gy + 14, h: 330, dir: 1, light: 1, t: t + 1, wind: 0.3, dua: t > tCo });
      circleBirds(c, t, 600, 820, 7, 280, 1, 7, '#2a2230');
      lightFromAbove(c, t, 640, 0.25 + 0.35 * kJ, 320); sparkle(c, t, 640, 1300, 14, 320, 5, 0.5 + 0.5 * kJ);
      blurLayer(c, 10, cc => { fgStones(cc, 1080, 2160, 2.4, '#3a2a24', 25); shrub(cc, 40, 2060, 5, '#3a2a18', t, 6); }, 2);
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c);
      arabicCaption(c, 'إِذًا لَا يُضَيِّعُنَا', t, 0.2, tCo - 0.4, 300, 124);
      arabicCaption(c, 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', t, tCo - 0.3, tJa - 0.4, 300, 80);
      caption(c, 'At-Talâq, 3', 410, seg(t, tCo, tCo + 0.6) * (1 - seg(t, tJa - 0.6, tJa - 0.3)));
      textGlow(c, 'IL NE TE LAISSE', W / 2, 300, '700 78px Lora', '#fff6e0', kJ * (1 - seg(t, d - 0.4, d)), '#000', 18);
      textGlow(c, 'JAMAIS SEUL', W / 2, 400, '700 92px Lora', '#f6c453', ramp(t, tJa, 0.5) * (1 - seg(t, d - 0.4, d)), '#000', 18);
    },
  },

  // 16. Call to action, on the hero image (continuous with the outro and the hook)
  cta: {
    grade: 'rgba(255,170,130,0.14)',
    draw(c, t, d) {
      const od = ((window.TL.scenes || []).find(s => s.id === 'outro') || { dur: 3 }).dur, T = t - d - od;
      ismHero(c, T, {});
      c.fillStyle = 'rgba(6,8,18,0.25)'; c.fillRect(0, 0, W, H);
      ctaText(c, seg(t, 0.1, 0.6));
    },
  },
  outro: {
    grade: 'rgba(255,170,130,0.14)',
    draw(c, t, d) {
      const T = t - d;
      ismHero(c, T, {});
      const k = 1 - seg(t, d - 1.4, d - 0.6); // the overlay goes away: the last frame is the first frame
      c.fillStyle = `rgba(6,8,18,${0.25 * k})`; c.fillRect(0, 0, W, H);
      ctaText(c, k);
      const a = seg(t, d - 1.0, d - 0.15);
      topShade(c, a); seriesTag(c, a, 12);
    },
  },

  // cover for TikTok (not in the timeline: rendered by tools/cover.js)
  cover: {
    draw(c) {
      ismHero(c, 0.4, { kW: 0.6, light: 0.8, reachS: 0.5 });
      const g = c.createLinearGradient(0, 0, 0, 780); g.addColorStop(0, 'rgba(6,8,18,0.85)'); g.addColorStop(1, 'rgba(6,8,18,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 780);
      seriesTag(c, 1, 12);
      textGlow(c, 'IL A VU EN RÊVE', W / 2, 280, '700 96px Lora', '#fff6e0', 1, '#000', 24);
      textGlow(c, 'SACRIFIER SON FILS', W / 2, 410, '700 92px Lora', '#f6c453', 1, '#000', 24);
      textGlow(c, '…et son fils a dit oui', W / 2, 525, 'italic 500 58px Lora', '#fff3dc', 1, '#000', 14);
      const g2 = c.createLinearGradient(0, 1420, 0, H); g2.addColorStop(0, 'rgba(6,8,18,0)'); g2.addColorStop(1, 'rgba(6,8,18,0.8)'); c.fillStyle = g2; c.fillRect(0, 1420, W, 500);
      c.save(); c.direction = 'rtl'; textGlow(c, 'إِسْمَاعِيل', W / 2, 1640, '700 150px Amiri', '#f6c453', 1, '#ffb300', 34); c.restore();
      textGlow(c, 'Ismaïl (Ismaël), paix sur lui', W / 2, 1790, 'italic 500 46px Lora', '#fff3dc', 1, '#000', 14);
    },
  },
};
