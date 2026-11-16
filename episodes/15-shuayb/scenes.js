// Episode 15 — Shu'ayb (alayhi salam), the prophet sent to Madyan: a rich town of merchants on the caravan road, surrounded by a thick
// grove (al-Ayka); in the market they reduced the measure, falsified the balance and cheated people of their goods. Shu'ayb, one of their
// own: "Worship Allah... give full measure and weight... do not spread corruption on the earth". They sat on every road threatening those
// who came to him; they mocked his prayer; he answered "I only want reform as much as I can; my success is only through Allah". The chiefs:
// "Were it not for your clan we would have stoned you", "we will drive you out". "Is my clan mightier to you than Allah? Wait, I too am
// waiting." Their challenge: "make a piece of the sky fall on us". The punishment of the Day of the Shadow (a terrible heat, then a cloud
// whose shade they ran to, according to the exegetes), the Cry and the trembling; Shu'ayb and the believers saved by mercy; the town empty
// "as if they had never lived there"; Shu'ayb's farewell.
// Sources: Al-A'raf 85-93; Hud 84-95; Ash-Shu'ara 176-191; Al-'Ankabut 36-37; Ibn Kathir (tafsir of Ash-Shu'ara 189, from Ibn 'Abbas).
// Shu'ayb is a white silhouette whose face is hidden by a veil of white light (prophet: true); everyone else is faceless.
// Allah is never depicted (light and calligraphy only). The punishment is shown only as cloud, light, sound rings, dust and darkness:
// no bodies. Events are synced to the narration with at(scene, word). The last frame (outro) is the first frame (hook): the video loops.
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

const SCENES = {
  // 1. HOOK — a whole people ran to the shade of a cloud: it was their punishment (Ash-Shu'ara 189). First frame = last frame.
  hook: {
    grade: 'rgba(255,200,140,0.12)',
    draw(c, t, d) {
      const tN = at('hook', 'nuage', 0, 2.4), tC = at('hook', 'châtiment', 0, 4.9);
      const kD = ramp(t, tC - 0.2, 0.8);
      shuHero(c, t, { kz: ease(seg(t, 0, d)) * 0.8, dark: kD, flash: kD * (1 - seg(t, tC + 1.6, tC + 2.4)), look: ramp(t, tN, 1), shake: 0.3 * seg(t, tC, tC + 0.1) * (1 - seg(t, tC + 0.1, tC + 0.7)) });
      if (kD > 0) darkVeil(c, 0.18 * kD, '30,10,10');
      topShade(c, 1); seriesTag15(c, 1);
      const a = 1 - seg(t, d - 0.6, d);
      c.save(); c.direction = 'rtl'; textGlow(c, 'عَذَابُ يَوْمِ الظُّلَّةِ', W / 2, 290 - (1 - easeOut(seg(t, tC, tC + 0.6))) * 26, '700 104px Amiri', '#f6c453', a * seg(t, tC, tC + 0.5), '#ffb300', 30); c.restore();
      caption(c, 'Ash-Shuʿarâʾ, 189  ·  « le jour de l\'Ombre »', 400, seg(t, tC + 0.4, tC + 1.0) * a);
    },
  },

  // 2. Title on Madyan at dusk; teaser: it all began with a simple balance... and a challenge thrown at the sky
  promise: {
    grade: 'rgba(255,190,150,0.12)',
    draw(c, t, d) {
      const tB = at('promise', 'balance', 0, 4.6), tD = at('promise', 'défi', 0, 6.4), tCi = at('promise', 'ciel', 0, 7.3);
      shots(c, t, [
        [0, (cc, q) => { const k = ease(seg(q, 0, tB)); cam(cc, lerp(1.0, 1.1, k), lerp(500, 560, k), 1240);
          madyan(cc, t, { dusk: 0.7, sunX: 260, sunY: 900, lamp: 0.8, smoke: 1, px: k * 40 });
          const gy = x => ridgeY(x, 1660, 40, 0.004, 8); fgRidge(cc, 1660, 40, 0.004, 8, '#6a3a2a', { rim: 'rgba(255,200,150,0.5)' });
          fig(cc, SHU, { x: 760, y: gy(760) + 6, h: 380, dir: -1, light: 1.0, t, wind: 0.4, staff: true });
          blurLayer(cc, 9, c3 => fgBrush(c3, t), 2); }],
        [tB - 0.3, (cc, q) => { cc.fillStyle = '#120c0a'; cc.fillRect(0, 0, W, H); cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, 540, 1100, 700, '#ffb870', 0.35); cc.restore();
          cam(cc, lerp(1.25, 1.1, ease(seg(q, 0, 2))), 540, 1150); const tl = 0.18 * Math.sin(q * 1.6) * Math.exp(-q * 0.4) + 0.12;
          balance(cc, 540, 1600, 1.4, tl, { weights: 2, grain: 0.9, glow: 0.4 }); }],
        [tD - 0.3, (cc, q) => { const k = ease(seg(q, 0, d - tD)); cam(cc, lerp(1.0, 1.08, k), 540, lerp(1200, 1100, k));
          madyan(cc, t, { heat: 0.6, storm: 0.6, sunA: 0.4, px: 30 });
          bigCloud(cc, t, 540, 520, 1.1, ramp(q, 0, 1.2), { dark: 0.7, flash: 0.3 * ramp(t, tCi, 0.5), rimLight: 0.6 });
          crowdRow(cc, t, 80, 1000, 1500, 260, 8, 6, { f: i => ({ armUp: 0.75 + 0.15 * Math.sin(t * 3 + i), dir: i % 2 ? 1 : -1 }), light: 0.55 }); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a = seg(t, 0.05, 0.6) * (1 - seg(t, tB - 0.7, tB - 0.2));
      topShade(c, a * 1.3); c.fillStyle = `rgba(10,6,4,${0.3 * a})`; c.fillRect(0, 440, W, 200); seriesTag15(c, a);
      c.save(); c.direction = 'rtl'; textGlow(c, 'شُعَيْب', W / 2, 330 - (1 - easeOut(seg(t, 0.05, 1.0))) * 30, '700 200px Amiri', '#f6c453', a, '#ffb300', 40); c.restore();
      textGlow(c, 'ʿalayhi s-salām', W / 2, 530, 'italic 500 46px Lora', '#fff3dc', a, '#000000', 14);
      textGlow(c, 'Shuʿayb  ·  le prophète de Madyan', W / 2, 600, '600 42px Lora', '#e8d6b8', a * 0.9, '#000000', 10);
      const b = ramp(t, tB - 0.2, 0.4) * (1 - ramp(t, tD - 0.5, 0.4)); topShade(c, b); bigWord(c, 'UNE BALANCE…', 330, b, 100);
      const e = ramp(t, tD - 0.2, 0.4) * (1 - seg(t, d - 0.4, d)); topShade(c, e); bigWord(c, 'UN DÉFI', 320, e, 104, '#ff9a70');
      bigWord(c, 'LANCÉ AU CIEL', 440, e * ramp(t, tCi - 0.2, 0.4), 80);
    },
  },

  // 3. Madyan: a town of merchants on the caravan road, surrounded by thick trees (al-Ayka, Ash-Shu'ara 176)
  madyan: {
    grade: 'rgba(255,210,160,0.1)',
    draw(c, t, d) {
      const tM = at('madyan', 'madyan', 0, 1.2), tCa = at('madyan', 'caravanes', 0, 4.0), tAr = at('madyan', 'arbres', 0, 5.8);
      shots(c, t, [
        [0, (cc, q) => { const k = ease(seg(q, 0, tCa)); cam(cc, lerp(0.98, 1.06, k), lerp(380, 640, k), 1290);
          madyan(cc, t, { px: k * 120, smoke: 1 }); well(cc, 560, 1420, 0.6, t);
          crowdRow(cc, t, -100, 1180, 1330, 150, 9, 21, { light: 0.9 }); crowdRow(cc, t, 0, 1100, 1520, 240, 6, 23, { light: 0.95 }); }],
        [tCa - 0.3, (cc, q) => { const k = ease(seg(q, 0, tAr - tCa + 0.3)); cam(cc, 1.05, lerp(500, 600, k), 1250);
          madyan(cc, t, { px: 200 + k * 60, wall: false }); const gy = () => 1560;
          caravan(cc, 380 + q * 80, 420 + q * 80, gy, 0.85, 4, 1); wisps(cc, t, 520, 6, '#ffffff', 0.25, 9, 8); flock(cc, t, 200 + q * 60, 640, 5, 0.9, 3, { col: '#3a2a2a' });
          fig(cc, FOLK[2], { x: 620 + q * 80, y: 1560, h: 300, dir: 1, walk: stepOf(380 + q * 80, 300), light: 0.95, t, wind: 0.3, staff: true });
          blurLayer(cc, 9, c3 => { sack(c3, 980, 2050, 3.4); jar(c3, 140, 2080, 3, '#8a4a2a'); }, 2); }],
        [tAr - 0.3, (cc, q) => { const k = ease(seg(q, 0, d - tAr)); cam(cc, lerp(1.2, 1.08, k), lerp(380, 520, k), 1250);
          madyan(cc, t, { px: -120, wall: false }); flock(cc, t, 1100 - q * 70, 700, 6, 1, 4, { col: '#3a2a2a' });
          [[-40, 1560, 1.05, 3], [260, 1600, 0.9, 5], [900, 1580, 1.1, 8], [1120, 1640, 0.95, 11]].forEach(([x, y, k, sd]) => tree(cc, x, y, k, t, { leaf: 1, seed: sd, leafCol: '#4e6a30' }));
          datePalm(cc, 600, 1620, 1.5, '#4a6a2a', t, 4); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 0.8);
      caption(c, 'Madyan  ·  nord-ouest de l\'Arabie', 250, seg(t, tM, tM + 0.6) * (1 - seg(t, tCa - 0.4, tCa)), 40);
      caption(c, 'al-Ayka : « le fourré d\'arbres »  ·  Ash-Shuʿarâʾ, 176', 250, seg(t, tAr, tAr + 0.6) * (1 - seg(t, d - 0.5, d)), 34);
    },
  },

  // 4. The fraud in the market: the measure reduced, the balance falsified, people cheated of their goods (Hud 84-85)
  fraud: {
    grade: 'rgba(255,200,150,0.12)',
    draw(c, t, d) {
      const tMe = at('fraud', 'mesure', 0, 3.0), tBa = at('fraud', 'balance', 0, 4.9), tDe = at('fraud', 'dépouillaient', 0, 6.6), tBi = at('fraud', 'biens', 0, 8.0);
      shots(c, t, [
        [0, (cc, q) => { const k = ease(seg(q, 0, tMe)); cam(cc, lerp(1.0, 1.12, k), 540, 1300);
          madyan(cc, t, { px: 60 + k * 30 });
          stall(cc, 230, 1520, 380, 1.1, t, { cloth: '#8a2a22', scale: 0.05 }); stall(cc, 860, 1500, 360, 1.05, t, { cloth: '#2a4a6a', jar: '#7a5a3a' });
          fig(cc, MERCH, { x: 300, y: 1410, h: 230, dir: 1, light: 0.9, t, reach: 0.4 });
          crowdRow(cc, t, 380, 760, 1620, 330, 3, 11, { light: 1 }); fig(cc, FOLK[5], { x: 980, y: 1720, h: 400, dir: -1, light: 1, t, wind: 0.2 }); }],
        [tMe - 0.3, (cc, q) => { // close-up: the measure is filled... then a hand sweeps grain off the top and shakes it short
          cc.fillStyle = '#2a1a10'; cc.fillRect(0, 0, W, H); cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, 540, 1000, 800, '#ffb870', 0.3); cc.restore();
          cam(cc, lerp(1.0, 1.12, ease(seg(q, 0, 2.4))), 540, 1250);
          cc.fillStyle = '#5a3a24'; cc.fillRect(-200, 1560, W + 400, 700); cc.fillStyle = 'rgba(255,220,170,0.15)'; cc.fillRect(-200, 1560, W + 400, 10);
          const sw = ease(seg(q, 0.7, 1.5)), fill = lerp(1.3, 0.78, sw);
          measureBox(cc, 540, 1640, 2.0, fill, { pour: q < 0.7, t });
          const hx = lerp(880, 260, sw), hy = 1190 + Math.sin(sw * 3.14) * -20;
          arm(cc, 1400, 820, hx, hy, 2.0, MERCH.robe, MERCH.skin, -1.9, true);
          if (sw > 0) { const r = rng(2); cc.fillStyle = '#d8b25a'; for (let k = 0; k < 40; k++) { const ph = clamp((q - 0.7) * 1.4 - r() * 0.3); if (ph <= 0) continue; cc.fillRect(240 + r() * 140 - ph * 80, 1220 + ph * ph * 420, 5, 5); } } }],
        [tBa - 0.3, (cc, q) => { // close-up: a finger pressing on the pan of the balance
          cc.fillStyle = '#1e140c'; cc.fillRect(0, 0, W, H); cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, 520, 1100, 800, '#ffb870', 0.3); cc.restore();
          cam(cc, lerp(1.1, 1.22, ease(seg(q, 0, 2))), 560, 1200);
          cc.fillStyle = '#5a3a24'; cc.fillRect(-200, 1600, W + 400, 700);
          const p = ease(seg(q, 0.5, 1.0)), tilt = lerp(-0.12, 0.16, p) + 0.01 * Math.sin(q * 6) * (1 - p);
          balance(cc, 540, 1610, 1.5, tilt, { weights: 2, grain: 1.0 });
          const [px, py] = panOf(540, 1610, 1.5, tilt, 1);
          arm(cc, 1400, 640, px + 40, lerp(py - 240, py - 80, p), 1.6, MERCH.robe, MERCH.skin, -2.6);
          if (p > 0.5) { cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, px, py - 30, 120, '#ff7050', 0.4 * p); cc.restore(); } }],
        [tDe - 0.3, (cc, q) => { // the buyer leaves with too little; coins slide to the merchant
          const k = ease(seg(q, 0, d - tDe)); cam(cc, lerp(1.15, 1.05, k), 560, 1340);
          madyan(cc, t, { px: 90 }); stall(cc, 360, 1560, 420, 1.15, t, { cloth: '#8a2a22', scale: 0.16 });
          fig(cc, MERCH, { x: 430, y: 1440, h: 250, dir: 1, light: 0.95, t, reach: 0.5 * ramp(q, 0.3, 0.6) });
          coins(cc, 520, 1420, 1, 6 + Math.round(ramp(q, 0.4, 1) * 5), t);
          const bx = 700 + Math.max(0, q - 0.6) * 110, h = 360; fig(cc, FOLK[4], { x: bx, y: 1700, h, dir: q > 0.6 ? 1 : -1, walk: q > 0.6 ? stepOf((q - 0.6) * 110, h) : null, light: 0.9, t, wind: 0.3 });
          const [hx, hy] = handOf({ x: bx, y: 1700, h, dir: q > 0.6 ? 1 : -1 }); sack(cc, hx, hy + 30, 0.45, '#c8b08a'); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 1);
      arabicCaption(c, 'وَلَا تَنقُصُوا الْمِكْيَالَ وَالْمِيزَانَ', t, tMe - 0.2, d + 1, 290, 92);
      caption(c, 'Hûd, 84', 400, seg(t, tMe + 0.4, tMe + 1.0) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 5. Allah sent them one of their own, Shu'ayb: worship Allah, give full measure and weight, no corruption (Al-A'raf 85)
  call: {
    grade: 'rgba(255,210,170,0.1)',
    draw(c, t, d) {
      const tSh = at('call', "shu'ayb", 0, 2.2), tAd = at('call', 'adorez', 0, 4.4), tMe = at('call', 'mesure', 0, 6.6), tPo = at('call', 'poids', 0, 7.6), tCo = at('call', 'corruption', 0, 9.6);
      const sh = { x: 560, y: 1500, h: 470, dir: -1, light: 1.15, t, wind: 0.3 };
      shots(c, t, [
        [0, (cc, q) => { const k = ease(seg(q, 0, tAd)); cam(cc, lerp(1.0, 1.12, k), 540, lerp(1320, 1300, k));
          madyan(cc, t, { px: 40 }); stall(cc, 150, 1440, 340, 0.9, t, { cloth: '#8a2a22', scale: 0.04 }); stall(cc, 960, 1430, 330, 0.9, t, { cloth: '#2a4a6a' });
          lightFromAbove(cc, t, 560, 0.25 + 0.3 * ramp(t, tSh, 0.8), 260);
          fig(cc, SHU, Object.assign({}, sh, { x: lerp(980, 600, ease(seg(q, 0, tSh + 0.6))), walk: q < tSh + 0.6 ? stepOf(lerp(0, 380, ease(seg(q, 0, tSh + 0.6))), 470) : null, h: 380, y: 1460 }));
          crowdRow(cc, t, -40, 1120, 1720, 420, 5, 13, { dir: 1, light: 0.65, f: (i, x) => ({ dir: x < 560 ? 1 : -1 }) }); }],
        [tAd - 0.3, (cc, q) => { const k = ease(seg(q, 0, tMe - tAd)); cam(cc, lerp(1.2, 1.3, k), 540, 1260);
          madyan(cc, t, { px: 80, wall: false }); lightFromAbove(cc, t, 560, 0.55, 300); sparkle(cc, t, 560, 900, 12, 260, 5, 0.6);
          fig(cc, SHU, Object.assign({}, sh, { armUp: 0.85 * ramp(q, 0, 0.8) }));
          blurLayer(cc, 10, c3 => { fig(c3, FOLK[1], { x: 120, y: 2000, h: 700, dir: 1, light: 0.5, t }); fig(c3, FOLK[6], { x: 1000, y: 2020, h: 680, dir: -1, light: 0.5, t }); }, 2); }],
        [tMe - 0.3, (cc, q) => { // the balance comes level, in gold light: the just weight
          cc.fillStyle = '#1a120c'; cc.fillRect(0, 0, W, H); cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, 540, 1000, 820, '#ffd890', 0.4); cc.restore();
          cam(cc, lerp(1.0, 1.1, ease(seg(q, 0, 2.5))), 540, 1200);
          const lv = ease(seg(q, 0.2, 1.2)); balance(cc, 540, 1640, 1.45, lerp(0.2, 0, lv) + 0.02 * Math.sin(q * 5) * (1 - lv), { weights: 2, grain: 1.0, glow: lv, col: mix(BRONZE, '#e8c060', lv) });
          sparkle(cc, t, 540, 1150, 14, 300, 8, lv); }],
        [tCo - 0.4, (cc, q) => { const k = ease(seg(q, 0, d - tCo)); cam(cc, lerp(1.0, 1.08, k), lerp(600, 520, k), 1300);
          madyan(cc, t, { px: 20, smoke: 1 }); lightFromAbove(cc, t, 600, 0.3, 260);
          fig(cc, SHU, { x: 640, y: 1440, h: 340, dir: -1, light: 1.1, t, wind: 0.3, reach: 0.7 });
          crowdRow(cc, t, -60, 1140, 1700, 420, 6, 17, { light: 0.6, f: (i, x) => ({ dir: x < 640 ? 1 : -1 }) }); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 1);
      arabicCaption(c, 'اعْبُدُوا اللَّهَ', t, tAd - 0.2, tMe - 0.4, 300, 110);
      arabicCaption(c, 'فَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ', t, tMe - 0.2, tCo - 0.4, 300, 100);
      arabicCaption(c, 'وَلَا تُفْسِدُوا فِي الْأَرْضِ', t, tCo - 0.2, d + 1, 300, 100);
      caption(c, 'Al-Aʿrâf, 85', 410, seg(t, tAd + 0.4, tAd + 1.0) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 6. They sat on every road, threatening those who came to listen, turning them from Allah's path (Al-A'raf 86)
  roads: {
    grade: 'rgba(255,190,150,0.12)',
    draw(c, t, d) {
      const tCh = at('roads', 'chemin', 0, 2.2), tMn = at('roads', 'menaçaient', 0, 3.4), tDe = at('roads', 'détournaient', 0, 6.4);
      const men = [[250, 1560, 1, 0], [860, 1590, -1, 2], [170, 1760, 1, 1], [970, 1790, -1, 3]];
      shots(c, t, [
        [0, (cc, q) => { // the road at dusk: men sitting on both sides, a traveller coming toward the town
          const k = ease(seg(q, 0, tMn)); cam(cc, lerp(1.0, 1.08, k), 540, 1380);
          roadSet(cc, t);
          const ty = lerp(1300, 1400, q / (tMn + 0.5)), th = hAt(ty) * 1.05, tx = roadX(ty);
          fig(cc, FOLK[1], { x: tx, y: ty, h: th, dir: 1, walk: stepOf((ty - 1300) * 2.2, th), light: 0.9, t, wind: 0.3, staff: true });
          men.slice().sort((a, b) => a[1] - b[1]).forEach(([x, y, dd, n], i) => fig(cc, NOTABLES[n], { x, y, h: hAt(y), dir: dd, pose: 'sit', light: 0.8, t: t + i }));
          blurLayer(cc, 9, c3 => fgBrush(c3, t), 2); }],
        [tMn - 0.3, (cc, q) => { // closer: they are up, barring the road and threatening; the traveller stops
          const k = ease(seg(q, 0, tDe - tMn)); cam(cc, lerp(1.15, 1.22, k), 540, 1450);
          roadSet(cc, t);
          const ty = 1420, th = hAt(ty) * 1.05; fig(cc, FOLK[1], { x: roadX(ty), y: ty, h: th, dir: 1, light: 0.9, t, wind: 0.3, staff: true });
          men.slice().sort((a, b) => a[1] - b[1]).forEach(([x, y, dd, n], i) => fig(cc, NOTABLES[n], { x: x + dd * 60, y, h: hAt(y), dir: dd, light: 0.85, t: t + i, wind: 0.3,
            reach: i % 2 ? 0.85 * ramp(q, 0.1 + i * 0.12, 0.4) : 0, armUp: i % 2 ? 0 : 0.55 * ramp(q, 0.2 + i * 0.1, 0.4) }));
          blurLayer(cc, 9, c3 => fgBrush(c3, t), 2); }],
        [tDe - 0.3, (cc, q) => { // the traveller turns round and goes back the way he came
          const k = ease(seg(q, 0, d - tDe)); cam(cc, lerp(1.1, 1.0, k), 540, 1400);
          roadSet(cc, t);
          const dist = Math.max(0, q - 0.6) * 46, ty = 1420 - dist * 0.45, th = hAt(ty) * 1.05;
          fig(cc, FOLK[1], { x: roadX(ty) - dist * 0.3, y: ty, h: th, dir: turnDir(q, 0.1, 1, -1, 0.5), walk: q > 0.6 ? stepOf(dist, th) : null, light: 0.85, t, wind: 0.3, staff: true });
          men.slice().sort((a, b) => a[1] - b[1]).forEach(([x, y, dd, n], i) => fig(cc, NOTABLES[n], { x: x + dd * 60, y, h: hAt(y), dir: dd, light: 0.85, t: t + i, wind: 0.3, reach: i % 2 ? 0.6 : 0 }));
          blurLayer(cc, 9, c3 => fgBrush(c3, t), 2); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 1);
      arabicCaption(c, 'وَلَا تَقْعُدُوا بِكُلِّ صِرَاطٍ تُوعِدُونَ', t, tCh - 0.3, d + 1, 300, 90);
      caption(c, 'Al-Aʿrâf, 86', 400, seg(t, tCh + 0.3, tCh + 0.9) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 7. They mocked: "Does your prayer command you that we leave what our fathers worshipped, and do as we like with our wealth?" (Hud 87)
  mock: {
    grade: 'rgba(255,180,140,0.12)',
    draw(c, t, d) {
      const tMo = at('mock', 'moquèrent', 0, 1.0), tPr = at('mock', 'prière', 0, 2.6), tPe = at('mock', 'pères', 0, 5.2), tBi = at('mock', 'biens', 0, 7.6);
      const laugh = (q, i) => 0.05 * Math.sin(q * 9 + i * 1.7) * ramp(q, 0, 0.4);
      shots(c, t, [
        [0, (cc, q) => { const k = ease(seg(q, 0, tPr)); cam(cc, lerp(1.0, 1.1, k), 540, 1320);
          majlis(cc, t, { dusk: 0.4 });
          [[200, 1560, 1, 0], [420, 1520, 1, 2], [700, 1530, -1, 1], [920, 1580, -1, 3]].forEach(([x, y, dd, n], i) =>
            lean(cc, x, y, laugh(t, i) - dd * 0.03, () => fig(cc, NOTABLES[n], { x, y, h: 380, dir: dd, light: 0.9, t: t + i, reach: i === 2 ? 0.6 * ramp(t, tMo, 0.5) : 0 })));
          blurLayer(cc, 10, c3 => { fig(c3, NOTABLES[1], { x: 80, y: 2150, h: 760, dir: 1, light: 0.5, t }); }, 2); }],
        [tPr - 0.3, (cc, q) => { // Shu'ayb at prayer at night, a lamp beside him
          cc.fillStyle = '#0c0a14'; cc.fillRect(0, 0, W, H); cam(cc, lerp(1.1, 1.2, ease(seg(q, 0, 2.5))), 540, 1350);
          ashlar(cc, -400, 700, W + 400, 1500, '#5a4636', 33); flagFloor(cc, 1500, 540, '#4a3a2e');
          cc.fillStyle = '#7a2a22'; cc.beginPath(); cc.moveTo(300, 1560); cc.lineTo(800, 1560); cc.lineTo(860, 1720); cc.lineTo(240, 1720); cc.closePath(); cc.fill();
          oilLamp(cc, 240, 1600, 1.6, 1, t); cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, 240, 1560, 600, '#ffb060', 0.35); cc.restore();
          fig(cc, SHU, { x: 520, y: 1660, h: 420, dir: 1, pose: q < 1.4 ? 'kneel' : 'prostrate', light: 0.9, t, dua: q < 1.4 }); }],
        [tPe - 0.3, (cc, q) => { // what their fathers worshipped: old standing stones in a shrine
          cam(cc, lerp(1.2, 1.05, ease(seg(q, 0, 2.4))), 540, 1300);
          madyan(cc, t, { dusk: 0.6, sunX: 200, sunY: 980, wall: false, px: -200 });
          cc.fillStyle = 'rgba(30,14,10,0.35)'; cc.fillRect(-400, 1260, W + 800, 800);
          [[320, 1520, 1.3], [540, 1500, 1.6], [760, 1520, 1.25]].forEach(([x, y, s]) => stele(cc, x, y, s, '#5a4a44'));
          oilLamp(cc, 440, 1560, 1, 1, t); oilLamp(cc, 650, 1560, 1, 1, t + 3);
          fig(cc, NOTABLES[0], { x: 900, y: 1700, h: 440, dir: -1, light: 0.8, t, reach: 0.6 }); }],
        [tBi - 0.3, (cc, q) => { // "our wealth": heaps of coins and goods, a notable's hand over them
          const k = ease(seg(q, 0, d - tBi)); cam(cc, lerp(1.0, 1.1, k), 540, 1300);
          majlis(cc, t, { dusk: 0.6 }); stall(cc, 540, 1600, 520, 1.25, t, { cloth: '#4a2a4e', scale: 0.12 });
          coins(cc, 360, 1470, 1.4, 12, t); coins(cc, 420, 1476, 1.4, 8, t);
          fig(cc, NOTABLES[2], { x: 760, y: 1500, h: 300, dir: -1, light: 0.95, t, reach: 0.5 });
          lean(cc, 980, 1720, laugh(t, 1), () => fig(cc, NOTABLES[3], { x: 980, y: 1720, h: 420, dir: -1, light: 0.9, t })); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 1);
      arabicCaption(c, 'أَصَلَاتُكَ تَأْمُرُكَ', t, tMo - 0.2, d + 1, 300, 112);
      caption(c, 'Hûd, 87', 410, seg(t, tMo + 0.4, tMo + 1.0) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 8. He answered gently: "I only want reform, as much as I can. My success is only through Allah." (Hud 88)
  reply: {
    grade: 'rgba(255,220,180,0.1)',
    draw(c, t, d) {
      const tDo = at('reply', 'douceur', 0, 1.6), tRe = at('reply', 'réformer', 0, 3.8), tRu = at('reply', 'réussite', 0, 6.4), tAl = at('reply', 'allah', 0, 8.2);
      const k = ease(seg(t, 0, d));
      shots(c, t, [
        [0, (cc, q) => { cam(cc, lerp(1.0, 1.08, k), 540, 1300); majlis(cc, t, { dusk: 0.5 });
          [[180, 1560, 1, 0], [360, 1520, 1, 2], [740, 1520, -1, 1], [930, 1580, -1, 3]].forEach(([x, y, dd, n], i) => fig(cc, NOTABLES[n], { x, y, h: 360, dir: dd, light: 0.75, t: t + i }));
          lightFromAbove(cc, t, 560, 0.4, 260); fig(cc, SHU, { x: 560, y: 1640, h: 480, dir: -1, light: 1.1, t, wind: 0.2, reach: 0.35 * ramp(t, tDo, 0.8) }); }],
        [tRe - 0.3, (cc, q) => { cam(cc, lerp(1.35, 1.5, ease(seg(q, 0, d - tRe))), 560, 1340); majlis(cc, t, { dusk: 0.6, lamps: false });
          lightFromAbove(cc, t, 560, 0.5 + 0.3 * ramp(t, tAl - 0.3, 0.8), 300); sparkle(cc, t, 560, 1100, 14, 280, 5, 0.4 + 0.6 * ramp(t, tAl, 0.8));
          fig(cc, SHU, { x: 560, y: 1640, h: 480, dir: -1, light: 1.15, t, wind: 0.2, reach: q < tRu - tRe ? 0.45 : 0, dua: t > tRu - 0.1, veilGlow: 0.45 });
          if (t > tAl) lightRings(cc, 560, 1300, t, 0.5 * ramp(t, tAl, 0.8), 4, 560); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 1);
      arabicCaption(c, 'إِنْ أُرِيدُ إِلَّا الْإِصْلَاحَ مَا اسْتَطَعْتُ', t, tDo, tRu - 0.4, 300, 86);
      arabicCaption(c, 'وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ', t, tRu - 0.2, d + 1, 300, 104);
      caption(c, 'Hûd, 88', 400, seg(t, tDo + 0.4, tDo + 1.0) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 9. The chiefs threatened: "Were it not for your clan we would have stoned you! We will drive you out of our town" (Hud 91; Al-A'raf 88)
  threat: {
    grade: 'rgba(255,170,130,0.14)',
    draw(c, t, d) {
      const tCl = at('threat', 'clan', 0, 2.8), tLa = at('threat', 'lapidé', 0, 4.2), tCh = at('threat', 'chasserons', 0, 5.6), tCr = at('threat', 'cru', 0, 8.6);
      shots(c, t, [
        [0, (cc, q) => { const k = ease(seg(q, 0, tCh)); cam(cc, lerp(1.0, 1.12, k), lerp(560, 520, k), 1330);
          madyan(cc, t, { dusk: 0.35, sunX: 200, sunY: 900, px: 120 });
          crowdRow(cc, t, 60, 1050, 1380, 170, 8, 41, { light: 0.6, f: i => ({ armUp: i % 3 === 0 ? 0.5 * ramp(t, tLa, 0.4) : 0, dir: 1 }) });
          const st = [[300, 1560, 0], [520, 1600, 1], [760, 1570, 2]];
          st.forEach(([x, y, n], i) => { const o = { x, y, h: hAt(y), dir: 1, light: 0.85, t: t + i, wind: 0.3, reach: i === 1 ? 0.8 * ramp(t, 0.6, 0.6) : 0, armUp: i !== 1 ? 0.6 * ramp(t, tLa - 0.2, 0.5) : 0 };
            fig(cc, NOTABLES[n], o); if (o.armUp > 0.3) stoneInHand(cc, o); });
          fig(cc, SHU, { x: 960, y: 1520, h: hAt(1520), dir: -1, light: 1.1, t, wind: 0.3 }); }],
        [tCh - 0.3, (cc, q) => { const k = ease(seg(q, 0, d - tCh)); cam(cc, lerp(1.05, 0.98, k), 540, 1250);
          sky0(cc, skyMix('day', 'dusk', 0.4)); cityGate(cc, 540, 1500, 1.0, t);
          sandW(cc, 1500, PLAZA, 3, { pebbles: 60 });
          const o = { x: 220, y: 1720, h: 420, dir: 1, light: 0.85, t, reach: 0.9 * ramp(q, 0.2, 0.5) }; fig(cc, NOTABLES[0], o);
          fig(cc, NOTABLES[3], { x: 900, y: 1760, h: 440, dir: -1, light: 0.8, t, reach: 0.7 * ramp(q, 0.6, 0.5) });
          [[470, 1560, 0], [560, 1570, 1], [640, 1555, 2]].forEach(([x, y, n], i) => fig(cc, BELIEVE[n], { x, y, h: 190, dir: 1, light: 0.8, t: t + i, child: false }));
          fig(cc, SHU, { x: 540, y: 1600, h: 260, dir: -1, light: 1.1, t, wind: 0.3 }); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 1);
      arabicCaption(c, 'وَلَوْلَا رَهْطُكَ لَرَجَمْنَاكَ', t, tCl - 0.4, tCh - 0.4, 300, 104, '#ffb08a');
      arabicCaption(c, 'لَنُخْرِجَنَّكَ يَا شُعَيْبُ', t, tCh - 0.2, d + 1, 300, 108, '#ffb08a');
      caption(c, 'Hûd, 91  ·  Al-Aʿrâf, 88', 410, seg(t, tCl, tCl + 0.6) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 10. "Is my clan mightier to you than Allah? ... Wait then, I too am waiting." (Hud 92-93)
  clan: {
    grade: 'rgba(255,200,160,0.12)',
    draw(c, t, d) {
      const tCl = at('clan', 'clan', 0, 0.8), tAl = at('clan', 'allah', 0, 3.0), tAt = at('clan', 'attendez', 0, 4.0), tJa = at('clan', "j'attends", 0, 5.6);
      shots(c, t, [
        [0, (cc, q) => { // low angle: Shu'ayb alone in front of them, his hand raised to the sky
          const k = ease(seg(q, 0, tAt)); cam(cc, lerp(1.0, 1.12, k), 540, lerp(1200, 1150, k));
          madyan(cc, t, { dusk: 0.45, sunX: 900, sunY: 820, wall: false, px: -60 });
          lightFromAbove(cc, t, 600, 0.3 + 0.5 * ramp(t, tAl - 0.2, 0.8), 300); sparkle(cc, t, 600, 900, 14, 300, 9, ramp(t, tAl, 0.8));
          fig(cc, SHU, { x: 620, y: 1720, h: 640, dir: -1, light: 1.2, t, wind: 0.4, armUp: 0.9 * ramp(t, tAl - 0.4, 0.8), veilGlow: 0.4 });
          blurLayer(cc, 9, c3 => { fig(c3, NOTABLES[0], { x: 90, y: 2100, h: 820, dir: 1, light: 0.5, t }); fig(c3, NOTABLES[2], { x: 260, y: 2200, h: 900, dir: 1, light: 0.45, t }); }, 2); }],
        [tAt - 0.3, (cc, q) => { // he turns away; far over the mountains, the horizon grows heavy
          const k = ease(seg(q, 0, d - tAt)); cam(cc, lerp(1.05, 0.95, k), lerp(540, 600, k), 1250);
          madyan(cc, t, { dusk: 0.55, sunX: 260, sunY: 900, storm: 0.25 * ramp(t, tJa, 1.4), behind: c3 => bigCloud(c3, t, 900, 940 - 60 * ramp(q, 0, 4), 0.5, ramp(t, tJa - 0.6, 1.5), { dark: 0.6, rimLight: 0.6, lightX: -1 }) });
          const tdir = turnDir(q, 0.2, -1, 1, 0.6), dist = Math.max(0, q - 1.0) * 60;
          fig(cc, SHU, { x: 540 + dist, y: 1560, h: 380, dir: tdir, walk: q > 1.0 ? stepOf(dist, 380) : null, light: 1.1, t, wind: 0.4 });
          crowdRow(cc, t, -80, 360, 1720, 420, 3, 29, { dir: 1, light: 0.55 }); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 1);
      arabicCaption(c, 'أَرَهْطِي أَعَزُّ عَلَيْكُم مِّنَ اللَّهِ', t, tCl - 0.2, tAt - 0.4, 300, 94);
      arabicCaption(c, 'وَارْتَقِبُوا إِنِّي مَعَكُمْ رَقِيبٌ', t, tAt - 0.2, d + 1, 300, 96);
      caption(c, 'Hûd, 92-93', 400, seg(t, tCl + 0.4, tCl + 1.0) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 11. Their challenge: "Then make a piece of the sky fall on us, if you are truthful!" (Ash-Shu'ara 187)
  defy: {
    grade: 'rgba(255,170,130,0.14)',
    draw(c, t, d) {
      const tDe = at('defy', 'défi', 0, 1.6), tTo = at('defy', 'tomber', 0, 3.2), tCi = at('defy', 'ciel', 0, 4.6), tVe = at('defy', 'véridique', 0, 5.8);
      shots(c, t, [
        [0, (cc, q) => { const k = ease(seg(q, 0, tCi)); cam(cc, lerp(1.0, 1.1, k), 540, lerp(1340, 1300, k));
          madyan(cc, t, { heat: 0.3, px: 50 });
          crowdRow(cc, t, -60, 1140, 1400, 190, 9, 51, { light: 0.8, f: i => ({ armUp: 0.6 + 0.25 * Math.sin(t * 2.6 + i) * ramp(t, tDe, 0.4), dir: i % 2 ? 1 : -1 }) });
          crowdRow(cc, t, 40, 1040, 1620, 330, 5, 53, { light: 0.9, f: i => ({ armUp: i % 2 ? 0.8 * ramp(t, tTo - 0.3, 0.5) : 0, reach: i % 2 ? 0 : 0.7 * ramp(t, tDe, 0.5), dir: i % 2 ? 1 : -1 }) });
          blurLayer(cc, 10, c3 => { fig(c3, NOTABLES[1], { x: 980, y: 2150, h: 860, dir: -1, light: 0.5, t, armUp: 0.7 }); }, 2); }],
        [tCi - 0.3, (cc, q) => { // tilt up to an empty, burning sky
          const k = ease(seg(q, 0, d - tCi)); cam(cc, 1.0, 540, lerp(1150, 900, k));
          madyan(cc, t, { heat: 0.7, sunX: 560, sunY: 640, sunA: 0.75 });
          crowdRow(cc, t, -100, 1180, 1700, 420, 6, 57, { light: 0.6, f: i => ({ armUp: 0.75, dir: i % 2 ? 1 : -1 }) });
          if (t > tVe) { cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, 560, 600, 500, '#ffd8a0', 0.12 * ramp(t, tVe, 1)); cc.restore(); } }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 1);
      arabicCaption(c, 'فَأَسْقِطْ عَلَيْنَا كِسَفًا مِّنَ السَّمَاءِ', t, tDe - 0.2, d + 1, 300, 92, '#ffb08a');
      caption(c, 'Ash-Shuʿarâʾ, 187', 400, seg(t, tDe + 0.4, tDe + 1.0) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 12. According to the exegetes (Ibn Kathir, from Ibn 'Abbas): a terrible heat for days, no shelter protected them
  heat: {
    grade: 'rgba(255,200,120,0.18)',
    draw(c, t, d) {
      const tCh = at('heat', 'chaleur', 0, 2.0), tJo = at('heat', 'jours', 0, 4.6), tAb = at('heat', 'abri', 0, 6.4);
      shots(c, t, [
        [0, (cc, q) => { const k = ease(seg(q, 0, tJo)); cam(cc, lerp(1.1, 1.0, k), 540, lerp(1100, 1250, k));
          madyan(cc, t, { heat: 1, dry: 0.6 + 0.4 * k, sunX: 540, sunY: 640 });
          rays(cc, 540, 640, Math.PI / 2, 2.6, 1500, 18, '#fff4d0', 0.035, t, 7);
          crowdRow(cc, t, 0, 1080, 1360, 150, 7, 61, { light: 1.0 }); }],
        [tJo - 0.4, (cc, q) => { // days passing: the sun crossing again and again, trees drying
          cam(cc, 1.0, 540, 1150); const cyc = q * 0.6;
          midianSky(cc, { heat: 1 }); const sx = lerp(-100, 1180, cyc % 1), sy = 820 - Math.sin((cyc % 1) * Math.PI) * 500;
          cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, sx, sy, 360, '#fff2c8', 0.35); cc.restore(); sun(cc, sx, sy, 50, '#fffbea', 1);
          crags(cc, 1100, 260, 43, RED, { detail: false }); hazeWide(cc, 1120, 200, '#f8d8a4', 0.5);
          grove(cc, t, -200, 1300, 1260, 1.1, { dry: 0.6 + 0.4 * ramp(q, 0, 2) }); sandW(cc, 1264, '#e0c08a', 5); heatShimmer(cc, t, 1270, 0.7); }],
        [tAb - 0.4, (cc, q) => { // no shelter: people come out of their houses, fanning themselves, an empty water jar
          const k = ease(seg(q, 0, d - tAb)); cam(cc, lerp(1.25, 1.12, k), 520, 1320);
          madyan(cc, t, { heat: 1, dry: 1, sunX: 900, sunY: 520, px: 160 }); jar(cc, 300, 1500, 1.4, '#9a5a3a');
          [[180, 1440, 1, 3], [420, 1470, -1, 5], [640, 1450, 1, 0], [880, 1520, -1, 7], [700, 1700, -1, 2]].forEach(([x, y, dd, n], i) =>
            fig(cc, FOLK[n], { x, y, h: hAt(y) * 1.05, dir: dd, light: 1.05, t: t + i, armUp: i % 2 ? 0.35 + 0.1 * Math.sin(t * 6 + i) : 0, wind: 0.1 })); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 0.9);
      const days = seg(t, tJo - 0.2, tAb); if (days > 0) { c.save(); c.globalAlpha = seg(t, tJo - 0.3, tJo + 0.2) * (1 - seg(t, d - 0.5, d)); [0, 1, 2].forEach(i => iconSun(c, 380 + i * 160, 330, 44, clamp(days * 3 - i))); c.restore(); }
      caption(c, 'selon les exégètes (Ibn Kathîr, d\'après Ibn ʿAbbâs)', 250, seg(t, 0.2, 0.8) * (1 - seg(t, tJo - 0.6, tJo - 0.2)), 34);
    },
  },

  // 13. PEAK — the cloud; they all ran to its shade; the punishment of the Day of the Shadow; the Cry and the trembling (Ash-Shu'ara 189; Hud 94; Al-A'raf 91)
  cloud: {
    grade: 'rgba(200,170,200,0.12)',
    draw(c, t, d) {
      const tPa = at('cloud', 'parut', 0, 1.0), tCo = at('cloud', 'coururent', 0, 2.2), tCh = at('cloud', 'châtiment', 0, 4.6), tOm = at('cloud', "l'ombre", 0, 6.0),
        tCr = at('cloud', 'cri', 0, 7.2), tTr = at('cloud', 'tremblement', 0, 8.0), tSa = at('cloud', 'saisirent', 0, 8.9);
      shots(c, t, [
        [0, (cc, q) => { // the cloud rises from behind the mountains, its shadow slides over the burning town
          const k = ease(seg(q, 0, tCo + 0.3)); cam(cc, lerp(0.98, 1.04, k), 540, 1200);
          madyan(cc, t, { heat: 1, dry: 1, storm: 0.25 * k, sunX: 880, sunY: 520,
            behind: c3 => bigCloud(c3, t, lerp(80, 300, k), lerp(1150, 780, k), 1.1, 1, { dark: 0.5, rimLight: 1, column: 0.5 * k }) });
          sideShade(cc, lerp(-300, 760, k), ramp(t, tPa - 0.2, 1)); cloudShade(cc, lerp(-260, 340, k), 1480, 600, 220, ramp(t, tPa, 1));
          crowdRow(cc, t, 240, 1100, 1360, 170, 7, 71, { light: 1.0, f: i => ({ dir: -1, armUp: 0.3 * ramp(t, tPa + 0.2, 0.6) * (i % 2) }) });
          blurLayer(cc, 9, c3 => fgBrush(c3, t), 2); }],
        [tCo - 0.3, (cc, q) => { shuHero(cc, 1.2 + q * 1.3, { kz: 0.5 + 0.5 * ease(seg(q, 0, 2.4)), look: 1, dark: 0.25 }); }],
        [tCh - 0.3, (cc, q) => { // under the cloud: it fills the sky, the light goes
          const k = ease(seg(q, 0, tCr - tCh)); cam(cc, lerp(1.0, 1.08, k), 540, lerp(1180, 1240, k));
          madyan(cc, t, { storm: 0.9, sunA: 0, dry: 1, sun: false,
            behind: c3 => bigCloud(c3, t, 540, 860, 1.7, 1, { dark: 0.85, flash: 0.7 * ramp(q, 0.4, 0.5), rimLight: 0.3, column: 1 }) });
          cloudShade(cc, 540, 1560, 1000, 360, 1);
          crowdRow(cc, t, -40, 1120, 1420, 220, 8, 73, { light: 0.4, f: i => ({ armUp: 0.3 + 0.12 * (i % 3), dir: i % 2 ? 1 : -1 }) });
          crowdRow(cc, t, 60, 1020, 1640, 360, 4, 77, { light: 0.35, f: i => ({ armUp: 0.35, dir: i % 2 ? 1 : -1 }) });
          darkVeil(cc, 0.22 * k); }],
        [tCr - 0.25, (cc, q) => { // the Cry, then the trembling: dust, and the picture goes dark (nothing more is shown)
          const tq = tTr - tCr + 0.25, kq = seg(q, tq, tq + 0.3), [sx, sy] = shake(t, 0.9 * kq * (1 - seg(q, tq + 1.6, tq + 2.4)), 26);
          cam(cc, 1.06, 540, 1240, sx, sy);
          madyan(cc, t, { storm: 1, sun: false, dry: 1, behind: c3 => bigCloud(c3, t, 540, 860, 1.7, 1, { dark: 0.9, flash: 0.5, column: 1 }) });
          crowdRow(cc, t, 40, 1060, 1440, 230, 6, 75, { light: 0.35, f: i => ({ armUp: 0.5, dir: i % 2 ? 1 : -1 }) });
          dustBurst(cc, t, -200, W + 200, 1600, kq);
          cc.setTransform(1, 0, 0, 1, 0, 0); cryRing(cc, 540, 760, q, 0.15, 1);
          flashW(cc, 0.75 * seg(q, 0.15, 0.25) * (1 - seg(q, 0.25, 0.9)));
          darkVeil(cc, 0.92 * seg(q, tq + 1.4, tq + 3.0), '6,6,10'); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 1);
      arabicCaption(c, 'فَأَخَذَهُمْ عَذَابُ يَوْمِ الظُّلَّةِ', t, tCh - 0.2, tCr - 0.3, 300, 96);
      arabicCaption(c, 'الصَّيْحَةُ  ·  الرَّجْفَةُ', t, tCr, d + 1, 300, 110, '#ffd8b0');
      caption(c, 'Ash-Shuʿarâʾ, 189', 400, seg(t, tCh + 0.4, tCh + 1.0) * (1 - seg(t, tCr - 0.5, tCr - 0.2)));
      caption(c, 'Hûd, 94  ·  Al-Aʿrâf, 91', 400, seg(t, tCr + 0.5, tCr + 1.1) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 14. By His mercy Allah saved Shu'ayb and those who believed with him; the town left empty, as if no one had ever lived there (Hud 94-95)
  saved: {
    grade: 'rgba(255,210,180,0.12)',
    draw(c, t, d) {
      const tMi = at('saved', 'miséricorde', 0, 0.8), tSa = at('saved', 'sauva', 0, 2.4), tVi = at('saved', 'vide', 0, 6.4), tJa = at('saved', 'jamais', 0, 8.6);
      shots(c, t, [
        [0, (cc, q) => { // dawn: a small band walking out of the valley toward the light
          const k = ease(seg(q, 0, tVi)); cam(cc, lerp(1.0, 1.1, k), lerp(480, 600, k), 1300);
          midianSky(cc, { dawn: 1 }); cc.save(); cc.globalCompositeOperation = 'lighter'; glow(cc, 900, 980, 700, '#ffd8a0', 0.5); cc.restore(); sun(cc, 900, 1010, 50, '#ffe0a8', 0.9);
          crags(cc, 1080, 240, 81, '#8a6a7a', { detail: false }); hazeWide(cc, 1100, 220, '#ffd8b0', 0.55);
          crags(cc, 1200, 200, 83, '#6a4a4a', { rim: 'rgba(255,220,180,0.5)', gullies: 20 }); hazeWide(cc, 1220, 120, '#ffd8b0', 0.3);
          const gy = x => ridgeY(x, 1600, 50, 0.004, 31); fgRidge(cc, 1600, 50, 0.004, 31, '#a8786a', { rim: 'rgba(255,220,180,0.6)' });
          lightFromAbove(cc, t, 800, 0.35 * ramp(t, tMi, 1), 360);
          const dist = q * 52;
          [SHU].concat(BELIEVE).forEach((who, i) => { const x = 520 + dist - i * 120 - (i % 2) * 20, h = i === 0 ? 400 : 340 + (i % 3) * 14;
            fig(cc, who, { x, y: gy(x) + 4, h, dir: 1, walk: stepOf(dist, h) + i * 0.33, light: 1.0, t: t + i, wind: 0.4, child: i === 4, staff: i === 0 }); });
          blurLayer(cc, 9, c3 => fgBrush(c3, t), 2); }],
        [tVi - 0.3, (cc, q) => { // the empty market: doors open, the overturned scale, sand blowing
          const k = ease(seg(q, 0, d - tVi)); cam(cc, lerp(1.0, 1.15, k), lerp(540, 480, k), 1350);
          madyan(cc, t, { dawn: 0.8, empty: 1, dry: 0.8, sunX: 900, sunY: 900, px: 60 });
          stall(cc, 260, 1540, 400, 1.15, t, { cloth: '#7a3a2a', torn: 1, emptied: true }); stall(cc, 880, 1520, 360, 1.05, t, { cloth: '#3a4a5a', torn: 0.6, emptied: true });
          balance(cc, 600, 1740, 0.55, 0.32, { weights: 1 }); cc.fillStyle = '#d8b48a'; cc.beginPath(); cc.ellipse(600, 1744, 120, 22, 0, Math.PI, 0); cc.fill();
          cc.save(); cc.translate(820, 1716); cc.rotate(-1.4); jar(cc, 0, 0, 1.2, '#8a4a2a'); cc.restore(); coins(cc, 440, 1770, 1.2, 3, t);
          blowingSand(cc, t, 1500, 0.35, 5); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 1);
      arabicCaption(c, 'نَجَّيْنَا شُعَيْبًا وَالَّذِينَ آمَنُوا مَعَهُ بِرَحْمَةٍ مِّنَّا', t, tMi - 0.2, tVi - 0.4, 300, 74);
      arabicCaption(c, 'كَأَن لَّمْ يَغْنَوْا فِيهَا', t, tVi - 0.2, d + 1, 300, 108);
      caption(c, 'Hûd, 94-95', 400, seg(t, tMi + 0.4, tMi + 1.0) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 15. Shu'ayb turned away: "O my people, I conveyed to you the messages of my Lord and I advised you" (Al-A'raf 93)
  farewell: {
    grade: 'rgba(255,200,170,0.12)',
    draw(c, t, d) {
      const tDe = at('farewell', 'détourna', 0, 1.0), tMe = at('farewell', 'messages', 0, 4.4), tCo = at('farewell', 'conseillés', 0, 7.4);
      const k = ease(seg(t, 0, d));
      cam(c, lerp(1.15, 1.0, k), lerp(600, 520, k), lerp(1320, 1260, k));
      madyan(c, t, { dawn: 1, empty: 1, dry: 0.7, sunX: 220, sunY: 900, wall: true, px: 0 });
      blowingSand(c, t, 1300, 0.25, 7);
      const gy = x => ridgeY(x, 1640, 60, 0.0035, 41) - (x - 540) * 0.12;
      c.save(); fgRidge(c, 1640, 60, 0.0035, 41, '#7a4a3a', { rim: 'rgba(255,220,180,0.6)' }); c.restore();
      const tdir = turnDir(t, tDe - 0.2, -1, 1, 0.7), dist = Math.max(0, t - tCo + 0.4) * 50, x = 720 + dist;
      fig(c, SHU, { x, y: ridgeY(x, 1640, 60, 0.0035, 41) + 6, h: 470, dir: tdir, walk: dist > 0 ? stepOf(dist, 470) : null, light: 1.1, t, wind: 0.5, staff: true, veilGlow: 0.45 });
      lightFromAbove(c, t, x, 0.25 + 0.25 * ramp(t, tMe, 1), 260);
      blurLayer(c, 9, cc => fgBrush(cc, t), 2);
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 1);
      arabicCaption(c, 'يَا قَوْمِ لَقَدْ أَبْلَغْتُكُمْ رِسَالَاتِ رَبِّي', t, tDe, tCo - 0.3, 300, 84);
      arabicCaption(c, 'وَنَصَحْتُ لَكُمْ', t, tCo - 0.1, d + 1, 300, 116);
      caption(c, 'Al-Aʿrâf, 93', 400, seg(t, tDe + 0.4, tDe + 1.0) * (1 - seg(t, d - 0.5, d)));
    },
  },

  // 16. Lesson: a stolen gram looks small; but Allah sees every balance; be honest, even when no one is watching (Ar-Rahman 9)
  lesson: {
    grade: 'rgba(255,215,170,0.1)',
    draw(c, t, d) {
      const tGr = at('lesson', 'gramme', 0, 0.8), tVo = at('lesson', 'voit', 0, 3.4), tHo = at('lesson', 'honnête', 0, 5.8), tPe = at('lesson', 'personne', 0, 7.4);
      c.fillStyle = '#120c0a'; c.fillRect(0, 0, W, H);
      const k = ease(seg(t, 0, d)), kV = ramp(t, tVo - 0.2, 1.0);
      c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, 1100, 900, '#ffc070', 0.25 + 0.25 * kV); c.restore();
      cam(c, lerp(1.25, 1.05, k), 540, lerp(1250, 1200, k));
      if (kV > 0) { lightFromAbove(c, t, 540, 0.55 * kV, 360); sparkle(c, t, 540, 1000, 18, 380, 4, kV); }
      const tilt = t < tVo ? lerp(0, 0.1, ramp(t, tGr, 0.6)) : lerp(0.1, 0, ramp(t, tVo, 1.2));
      balance(c, 540, 1660, 1.5, tilt, { weights: 2, grain: 0.95, gram: ramp(t, tGr - 0.2, 0.5) * (1 - 0.5 * kV), glow: kV, col: mix(BRONZE, '#e8c060', kV) });
      c.setTransform(1, 0, 0, 1, 0, 0); topShade(c, 1.2);
      const a1 = ramp(t, tGr - 0.2, 0.4) * (1 - ramp(t, tVo - 0.5, 0.4)); bigWord(c, 'UN GRAMME VOLÉ', 320, a1, 90); textGlow(c, '… ça paraît petit', W / 2, 430, 'italic 500 56px Lora', '#fff3dc', a1 * ramp(t, tGr + 0.6, 0.4), '#000', 14);
      const a2 = ramp(t, tVo - 0.2, 0.4) * (1 - ramp(t, tHo - 0.5, 0.4)); bigWord(c, 'ALLAH VOIT', 300, a2, 100, '#f6c453'); bigWord(c, 'CHAQUE BALANCE', 420, a2, 78);
      const a3 = ramp(t, tHo - 0.2, 0.4) * (1 - seg(t, d - 0.4, d)); bigWord(c, 'SOIS HONNÊTE', 320, a3, 104, '#f6c453');
      textGlow(c, 'même quand personne ne regarde', W / 2, 440, 'italic 500 54px Lora', '#fff3dc', a3 * ramp(t, tPe - 0.3, 0.5), '#000', 14);
      c.save(); c.direction = 'rtl'; textGlow(c, 'وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ', W / 2, 560, '700 64px Amiri', '#f6c453', a3 * 0.85, '#ffb300', 20); c.restore();
      caption(c, 'Ar-Raḥmân, 9', 630, a3 * 0.9, 30);
    },
  },

  // 17. Call to action, on the hero image (continuous with the outro and the hook)
  cta: {
    grade: 'rgba(255,200,140,0.12)',
    draw(c, t, d) {
      const od = ((window.TL.scenes || []).find(s => s.id === 'outro') || { dur: 3 }).dur, T = t - d - od;
      shuHero(c, T, {});
      c.fillStyle = 'rgba(6,8,18,0.25)'; c.fillRect(0, 0, W, H);
      ctaText(c, seg(t, 0.1, 0.6));
    },
  },
  outro: {
    grade: 'rgba(255,200,140,0.12)',
    draw(c, t, d) {
      const T = t - d;
      shuHero(c, T, {});
      const k = 1 - seg(t, d - 1.4, d - 0.6); // the overlay goes away: the last frame is the first frame
      c.fillStyle = `rgba(6,8,18,${0.25 * k})`; c.fillRect(0, 0, W, H);
      ctaText(c, k);
      const a = seg(t, d - 1.0, d - 0.15);
      topShade(c, a); seriesTag15(c, a);
    },
  },

  // cover for TikTok (not in the timeline: rendered by tools/cover.js)
  cover: {
    draw(c) {
      shuHero(c, 3.2, { kz: 0.5, dark: 0.6, flash: 0.5, look: 1 });
      const g = c.createLinearGradient(0, 0, 0, 780); g.addColorStop(0, 'rgba(6,8,18,0.85)'); g.addColorStop(1, 'rgba(6,8,18,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 780);
      seriesTag15(c, 1);
      textGlow(c, 'ILS ONT COURU', W / 2, 260, '700 100px Lora', '#fff6e0', 1, '#000', 24);
      textGlow(c, 'SOUS CE NUAGE', W / 2, 375, '700 92px Lora', '#fff6e0', 1, '#000', 24);
      textGlow(c, "C'ÉTAIT LEUR", W / 2, 500, '700 76px Lora', '#ff9a60', 1, '#000', 24);
      textGlow(c, 'CHÂTIMENT', W / 2, 600, '700 112px Lora', '#ff9a60', 1, '#000', 26);
      const g2 = c.createLinearGradient(0, 1420, 0, H); g2.addColorStop(0, 'rgba(6,8,18,0)'); g2.addColorStop(1, 'rgba(6,8,18,0.8)'); c.fillStyle = g2; c.fillRect(0, 1420, W, 500);
      c.save(); c.direction = 'rtl'; textGlow(c, 'شُعَيْب', W / 2, 1640, '700 170px Amiri', '#f6c453', 1, '#ffb300', 34); c.restore();
      textGlow(c, 'Shuʿayb, paix sur lui', W / 2, 1790, 'italic 500 46px Lora', '#fff3dc', 1, '#000', 14);
    },
  },
};
