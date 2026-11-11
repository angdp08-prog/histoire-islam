// Episode 5 — Ibrahim (alayhi salam): the star, the moon and the sun, the idols of his people, and the fire made cool.
// Visual rules: the prophet is shown only as a silhouette in white, face entirely hidden by a veil of white light
// (prophet: true, as in episodes 1 and 4); everyone else is faceless; Allah is never depicted (only light and calligraphy).
// Idols are abstract faceless statues. Events are synced to the narration with at(scene, word).

const IBRAHIM = { prophet: true, robe: '#ece7da', wrap: '#f7f3ea', skin: '#c99872', trim: '#d4b26a', band: '#c9a86a', inner: '#fbf8f0' };
const FATHER = { robe: '#4a3248', wrap: '#e6dccb', skin: '#a8714f', trim: '#c9a14a', band: '#b88a3a' };
const FOLK = [
  { robe: '#2f4a6a', wrap: '#e2d6bc', skin: '#a8714f', trim: '#c9a14a' }, { robe: '#7a3a2a', wrap: '#e8dcc4', skin: '#b07a58' },
  { robe: '#5a5a32', wrap: '#d9cdb5', skin: '#8f5f42' }, { robe: '#6a4a2e', wrap: '#efe7d6', skin: '#b4805c', trim: '#8a6a3a' },
  { robe: '#3a3a5a', wrap: '#d6cbb3', skin: '#94664a' }, { robe: '#8a5a2a', wrap: '#e0d4c0', skin: '#c48e66' },
  { robe: '#4a2e3e', wrap: '#e6e0d2', skin: '#9a6a4c', trim: '#b89a62' }, { robe: '#2e5a52', wrap: '#d9d0bd', skin: '#b07a58' },
  { robe: '#6b3a22', wrap: '#e8dcc4', skin: '#a06a4a' }, { robe: '#46505c', wrap: '#efe5d0', skin: '#b4805c', trim: '#d4a94a' },
];
const BRICK = '#b98a5a', LAPIS = '#24508a', GOLD = '#e0b85a';

// ---------- sync & camera helpers (same as episode 4)
function at(id, word, n = 0, fb = 0) { // time (scene-relative) where `word` is spoken (n-th occurrence)
  const sc = (window.TL.scenes || []).find(s => s.id === id); if (!sc || !sc.words) return fb;
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z']/g, '');
  const target = norm(word); let k = 0;
  for (const w of sc.words) { const v = norm(w.w); if (target && (v.startsWith(target) || v.replace(/^[a-z]'/, '').startsWith(target))) { if (k++ === n) return w.s; } }
  return fb;
}
const ramp = (t, t0, dur = 0.8) => ease(seg(t, t0, t0 + dur));
function cam(c, z, cx = W / 2, cy = H / 2, dx = 0, dy = 0) { c.translate(W / 2 + dx, H / 2 + dy); c.scale(z, z); c.translate(-cx, -cy); }
function par(c, k, px, py, fn) { c.save(); c.translate(-px * k, -py * k); fn(); c.restore(); }
function phases(c, t, t0, f, A, B) {
  const k = seg(t, t0, t0 + f);
  if (k < 1) { c.save(); A(c); c.restore(); }
  if (k > 0) layer(c, ease(k), cc => { cc.save(); B(cc); cc.restore(); });
}
function blurred(c, px, fn) { c.save(); c.filter = `blur(${px}px)`; fn(); c.restore(); }
function lean(c, x, y, ang, fn) { c.save(); c.translate(x, y); c.rotate(ang); c.translate(-x, -y); fn(); c.restore(); } // bow a figure around its feet
function fig(c, base, o) { figure(c, Object.assign({}, base, o)); }

// ---------- atmosphere
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
function milkyWay(c, t, a, ang = -0.55, y = 500) {
  c.save(); c.translate(540, y); c.rotate(ang);
  const g = c.createLinearGradient(0, -170, 0, 170); g.addColorStop(0, 'rgba(180,190,255,0)'); g.addColorStop(0.5, `rgba(200,205,255,${0.16 * a})`); g.addColorStop(1, 'rgba(180,190,255,0)');
  c.fillStyle = g; c.fillRect(-1400, -170, 2800, 340);
  const r = rng(77); for (let i = 0; i < 500; i++) { const x = (r() - 0.5) * 2600, yy = (r() + r() + r() - 1.5) * 150; c.fillStyle = `rgba(255,250,235,${a * (0.25 + r() * 0.6) * (0.6 + 0.4 * Math.sin(t * (1 + r() * 2) + i))})`; c.fillRect(x, yy, 1.6, 1.6); }
  c.restore();
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
function sparks(c, t, x, y, n, seed, a = 1, spread = 1, reach = 1) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) { const ph = (t * (0.6 + r()) + r()) % 1, ang = -Math.PI / 2 + (r() - 0.5) * 1.6 * spread, d = ph * (60 + r() * 140) * reach;
    c.fillStyle = `rgba(255,${190 + r() * 60 | 0},120,${a * (1 - ph)})`; c.beginPath(); c.arc(x + Math.cos(ang) * d, y + Math.sin(ang) * d + ph * ph * 60, 2 + r() * 2, 0, 6.283); c.fill(); }
}
function embers(c, t, box, n, seed, a = 1, col = [255, 170, 80]) { // glowing motes rising in the heat
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const sp = 60 + r() * 140, x0 = box[0] + r() * box[2], ph = r() * 6.28;
    const y = box[1] + box[3] - ((r() * box[3] + t * sp) % box[3]), x = x0 + Math.sin(t * 1.3 + ph) * 26;
    const k = (y - box[1]) / box[3];
    c.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${a * k * (0.5 + 0.5 * Math.sin(t * 7 + ph))})`;
    c.beginPath(); c.arc(x, y, 1.6 + r() * 2.4, 0, 6.283); c.fill();
  }
}
function lampFlame(c, x, y, t, k = 0, s = 1) { // small clay oil lamp on a ledge
  c.save(); c.translate(x, y); c.scale(s, s);
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -18, 170, '#ff9a40', 0.32 + 0.05 * Math.sin(t * 9 + k)); c.restore();
  c.fillStyle = '#6a4024'; c.beginPath(); c.ellipse(0, 0, 22, 9, 0, 0, 6.283); c.fill(); c.beginPath(); c.moveTo(14, -4); c.lineTo(30, -8); c.lineTo(26, 2); c.fill();
  [['#ff8a2a', 7, 26], ['#ffe2a0', 3.5, 16]].forEach(([col, w, h], j) => { c.fillStyle = col; c.beginPath(); c.moveTo(24 - w, -8);
    c.quadraticCurveTo(24 - w, -8 - h * 0.6, 26 + Math.sin(t * 8 + k + j) * 3, -8 - h - Math.sin(t * 11 + k) * 3); c.quadraticCurveTo(24 + w, -8 - h * 0.5, 24 + w, -8); c.fill(); });
  c.restore();
}
function torch(c, x, y, t, k = 0, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#3a2418'; c.fillRect(-6, -160, 12, 160); c.fillStyle = '#5a3a24'; c.fillRect(-10, -168, 20, 12);
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -190, 300, '#ff8a3a', 0.4 + 0.08 * Math.sin(t * 9 + k)); c.restore();
  [['#ff7a2a', 18, 70], ['#ffb347', 12, 52], ['#ffe9a8', 6, 30]].forEach(([col, w, hh], j) => { c.fillStyle = col; c.beginPath(); c.moveTo(-w, -166);
    c.quadraticCurveTo(-w + Math.sin(t * 8 + k + j) * 6, -166 - hh * 0.6, Math.sin(t * 7 + k + j) * 8, -166 - hh - Math.sin(t * 13 + k) * 8); c.quadraticCurveTo(w, -166 - hh * 0.5, w, -166); c.fill(); });
  c.restore();
}
// handheld torch (held up by a crowd member): only the stick + flame, placed at the raised hand
function handTorch(c, x, y, t, k = 0, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(0.15);
  c.fillStyle = '#3a2418'; c.fillRect(-4, -10, 8, 70);
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -30, 160, '#ff8a3a', 0.35 + 0.08 * Math.sin(t * 9 + k)); c.restore();
  [['#ff7a2a', 11, 46], ['#ffe9a8', 4, 22]].forEach(([col, w, hh], j) => { c.fillStyle = col; c.beginPath(); c.moveTo(-w, -8);
    c.quadraticCurveTo(-w + Math.sin(t * 8 + k + j) * 5, -8 - hh * 0.6, Math.sin(t * 7 + k + j) * 6, -8 - hh - Math.sin(t * 13 + k) * 6); c.quadraticCurveTo(w, -8 - hh * 0.5, w, -8); c.fill(); });
  c.restore();
}

// ---------- Mesopotamian land: river plain, mud-brick town, ziggurat, date palms
function plain(c, y, col, t, seed = 1, specks = true) {
  const g = c.createLinearGradient(0, y - 20, 0, H + 100); g.addColorStop(0, mix(col, '#ffe8c8', 0.12)); g.addColorStop(1, mix(col, '#000000', 0.3));
  c.fillStyle = g; c.beginPath(); c.moveTo(-300, y);
  for (let x = -300; x <= W + 300; x += 20) c.lineTo(x, y - Math.sin(x * 0.004 + seed) * 10);
  c.lineTo(W + 300, H + 300); c.lineTo(-300, H + 300); c.closePath(); c.fill();
  c.lineWidth = 3;
  for (let i = 0; i < 12; i++) { const yy = y + 50 + i * i * 7 + i * 22; c.strokeStyle = hexA(i % 2 ? mix(col, '#000000', 0.25) : mix(col, '#ffffff', 0.18), 0.25);
    c.beginPath(); for (let x = -200; x <= W + 200; x += 24) { const v = yy + Math.sin(x * (0.01 - i * 0.0004) + i * 1.7 + seed) * (5 + i); x === -200 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); }
  if (specks) { const r = rng(seed * 7 + 3); for (let i = 0; i < 70; i++) { const sx = r() * W, sy = y + 40 + r() * (H - y); c.fillStyle = hexA(mix(col, '#000000', 0.4), 0.4); c.beginPath(); c.ellipse(sx, sy, 3 + r() * 6 * (sy / H), 2 + r() * 3, 0, 0, 6.283); c.fill(); } }
}
function river(c, y, h, t, col, sky) { // the Euphrates: a calm band with drifting glints
  const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, mix(col, sky, 0.5)); g.addColorStop(1, col);
  c.fillStyle = g; c.beginPath(); c.moveTo(-300, y); for (let x = -300; x <= W + 300; x += 30) c.lineTo(x, y + Math.sin(x * 0.006) * 6);
  c.lineTo(W + 300, y + h); c.lineTo(-300, y + h); c.closePath(); c.fill();
  const r = rng(19);
  for (let i = 0; i < 40; i++) { const yy = y + 6 + r() * (h - 10), w = 30 + r() * 90, x = ((r() * 1500 + t * (8 + r() * 10)) % 1500) - 200;
    c.fillStyle = hexA(sky, 0.25 + 0.2 * Math.sin(t * 2 + i)); c.fillRect(x, yy, w, 2); }
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
function house(c, x, y, w, h, col, o = {}) { // mud-brick house, flat roof, parapet, palm-log beams, arched door, small windows
  const lt = mix(col, '#fff0d8', 0.2), dk = mix(col, '#1a0e08', 0.42), sd = o.side === undefined ? w * 0.22 : o.side, lit = o.lit || 0;
  c.fillStyle = dk; c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2 + sd, y - sd * 0.35); c.lineTo(x + w / 2 + sd, y - h - sd * 0.35); c.lineTo(x + w / 2, y - h); c.closePath(); c.fill();
  const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, lt); g.addColorStop(1, col);
  c.fillStyle = g; c.fillRect(x - w / 2, y - h, w, h);
  c.fillStyle = mix(col, '#fff4e0', 0.3); c.beginPath(); c.moveTo(x - w / 2, y - h); c.lineTo(x + w / 2, y - h); c.lineTo(x + w / 2 + sd, y - h - sd * 0.35); c.lineTo(x - w / 2 + sd, y - h - sd * 0.35); c.closePath(); c.fill();
  c.fillStyle = lt; c.fillRect(x - w / 2 - 3, y - h - 10, w + 6, 12);
  c.save(); c.beginPath(); c.rect(x - w / 2, y - h, w, h); c.clip();
  c.strokeStyle = hexA(dk, 0.14); c.lineWidth = 2;
  for (let yy = y - h + 14; yy < y; yy += 15) { c.beginPath(); c.moveTo(x - w / 2, yy); c.lineTo(x + w / 2, yy); c.stroke(); }
  const gb = c.createLinearGradient(0, y - h * 0.3, 0, y); gb.addColorStop(0, 'rgba(0,0,0,0)'); gb.addColorStop(1, 'rgba(30,15,8,0.3)'); c.fillStyle = gb; c.fillRect(x - w / 2, y - h * 0.3, w, h * 0.3);
  c.restore();
  c.fillStyle = mix(dk, '#000000', 0.2); for (let k = 0; k < Math.floor(w / 26); k++) { c.beginPath(); c.arc(x - w / 2 + 14 + k * 26, y - h + 20, 4.5, 0, 6.283); c.fill(); }
  if (!o.noDoor) { c.fillStyle = '#1a0e08'; c.beginPath(); archPath(c, x + (o.doorX || 0), y, w * 0.22, Math.min(h * 0.55, 120)); c.fill(); }
  const win = (wx, wy) => { c.fillStyle = '#1a0e08'; c.fillRect(wx - 7, wy - 10, 14, 20); if (lit > 0) { c.fillStyle = hexA('#ffb860', lit * 0.9); c.fillRect(wx - 6, wy - 9, 12, 18);
    c.save(); c.globalCompositeOperation = 'lighter'; glow(c, wx, wy, 60, '#ff9a40', lit * 0.35); c.restore(); } };
  if (w > 120) { win(x - w * 0.3, y - h * 0.62); win(x + w * 0.3, y - h * 0.62); }
}
function ziggurat(c, x, y, w, h, col, o = {}) { // stepped temple tower: 3 terraces with buttresses, front stair, shrine on top
  const lt = mix(col, '#fff0d8', 0.22), dk = mix(col, '#1a0e08', 0.4), tiers = 3, th = h / (tiers + 0.6);
  for (let i = 0; i < tiers; i++) {
    const tw = w * (1 - i * 0.27), ty = y - i * th, sd = tw * 0.12;
    c.fillStyle = dk; c.beginPath(); c.moveTo(x + tw / 2, ty); c.lineTo(x + tw / 2 + sd, ty - sd * 0.4); c.lineTo(x + tw / 2 + sd * 0.8, ty - th - sd * 0.4); c.lineTo(x + tw / 2 - 6, ty - th); c.closePath(); c.fill();
    const g = c.createLinearGradient(x - tw / 2, 0, x + tw / 2, 0); g.addColorStop(0, lt); g.addColorStop(0.6, col); g.addColorStop(1, mix(col, '#000000', 0.15));
    c.fillStyle = g; c.beginPath(); c.moveTo(x - tw / 2, ty); c.lineTo(x - tw / 2 + 6, ty - th); c.lineTo(x + tw / 2 - 6, ty - th); c.lineTo(x + tw / 2, ty); c.closePath(); c.fill();
    c.fillStyle = hexA(dk, 0.3); for (let k = 0; k < 11; k++) c.fillRect(x - tw / 2 + 10 + k * (tw - 20) / 10, ty - th + 6, 4, th - 6); // buttresses
    c.strokeStyle = hexA(dk, 0.18); c.lineWidth = 1.5; for (let yy = ty - th + 8; yy < ty; yy += 9) { c.beginPath(); c.moveTo(x - tw / 2 + 4, yy); c.lineTo(x + tw / 2 - 4, yy); c.stroke(); }
    c.fillStyle = lt; c.fillRect(x - tw / 2 + 4, ty - th - 4, tw - 8, 6);
  }
  // front stair
  const sw0 = w * 0.16, sw1 = w * 0.08, top = y - tiers * th + 4;
  c.fillStyle = mix(col, '#fff0d8', 0.32); c.beginPath(); c.moveTo(x - sw0 / 2, y + 2); c.lineTo(x - sw1 / 2, top); c.lineTo(x + sw1 / 2, top); c.lineTo(x + sw0 / 2, y + 2); c.closePath(); c.fill();
  c.strokeStyle = hexA(dk, 0.35); c.lineWidth = 1.5; for (let k = 1; k < 26; k++) { const q = k / 26, yy = lerp(y, top, q), hw = lerp(sw0, sw1, q) / 2; c.beginPath(); c.moveTo(x - hw, yy); c.lineTo(x + hw, yy); c.stroke(); }
  // shrine on top
  const sx = w * 0.18, sy = th * 0.75;
  c.fillStyle = lt; c.fillRect(x - sx / 2, top - sy, sx, sy); c.fillStyle = dk; c.fillRect(x + sx / 2, top - sy, sx * 0.15, sy);
  c.fillStyle = '#1a0e08'; c.beginPath(); archPath(c, x, top, sx * 0.3, sy * 0.6); c.fill();
  if (o.lit) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, top - sy * 0.3, sx * 1.4, '#ff9a40', 0.4 * o.lit); c.restore(); }
  c.fillStyle = LAPIS; c.fillRect(x - sx / 2, top - sy - 6, sx, 8);
}
// the whole town: far ziggurat, rows of houses, palms on the river bank
function town(c, t, o = {}) {
  const base = o.base || 1150, col = o.col || BRICK, lit = o.lit || 0, px = o.px || 0, sky = o.sky || '#e8b890';
  par(c, 0.15, px, 0, () => { ridge(c, base - 120, 30, 0.004, 3, mix(col, sky, 0.7)); ziggurat(c, o.zx || 760, base - 70, o.zw || 480, o.zh || 400, mix(col, sky, 0.38), { lit }); haze(c, base - 40, 300, sky, 0.45); });
  par(c, 0.35, px, 0, () => {
    const r = rng(12);
    for (let i = 0; i < 12; i++) { const hx = -60 + i * 105 + r() * 30, hw = 90 + r() * 70, hh = 80 + r() * 90; house(c, hx, base - 10 + r() * 14, hw, hh, mix(col, sky, 0.22 + r() * 0.1), { lit: lit * (r() > 0.4 ? 1 : 0), side: hw * 0.18 }); }
    haze(c, base + 10, 140, sky, 0.3);
  });
  par(c, 0.55, px, 0, () => {
    if (!o.noPalms) [[60, 1.0, 1], [250, 0.85, 2], [930, 1.05, 3], [1060, 0.9, 4]].forEach(([x, s, k]) => datePalm(c, x, base + 40, s, mix('#2e3a22', sky, 0.15), t, k));
  });
}

// ---------- idols (abstract, faceless statues) and their breaking
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
function brickWall(c, x, y, w, h, col, seed = 1) {
  const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, mix(col, '#000000', 0.35)); g.addColorStop(1, col);
  c.fillStyle = g; c.fillRect(x, y, w, h);
  c.strokeStyle = 'rgba(20,10,5,0.18)'; c.lineWidth = 2;
  for (let row = 0, yy = y; yy < y + h; yy += 26, row++) { c.beginPath(); c.moveTo(x, yy); c.lineTo(x + w, yy); for (let xx = x + (row % 2) * 30; xx < x + w; xx += 60) { c.moveTo(xx, yy); c.lineTo(xx, yy + 26); } c.stroke(); }
}
function glazedBand(c, y, h, t, a = 1) { // glazed lapis bricks with golden rosettes (Babylonian style)
  c.fillStyle = hexA(LAPIS, a); c.fillRect(-200, y, W + 400, h);
  c.fillStyle = hexA('#3a70b0', 0.5 * a); c.fillRect(-200, y, W + 400, h * 0.15);
  c.fillStyle = hexA('#e8dcc0', a); c.fillRect(-200, y - 6, W + 400, 6); c.fillRect(-200, y + h, W + 400, 6);
  for (let x = -40; x < W + 80; x += h * 1.25) {
    const cy = y + h / 2, rr = h * 0.33;
    c.fillStyle = hexA('#f4e2b0', a); for (let k = 0; k < 8; k++) { const an = k * Math.PI / 4; c.beginPath(); c.ellipse(x + Math.cos(an) * rr * 0.55, cy + Math.sin(an) * rr * 0.55, rr * 0.38, rr * 0.18, an, 0, 6.283); c.fill(); }
    c.fillStyle = hexA(GOLD, a); c.beginPath(); c.arc(x, cy, rr * 0.28, 0, 6.283); c.fill();
  }
}
function pillar(c, x, y0, y1, w, col) {
  const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, mix(col, '#000000', 0.5)); g.addColorStop(0.35, mix(col, '#fff0d8', 0.15)); g.addColorStop(1, mix(col, '#000000', 0.6));
  c.fillStyle = g; c.fillRect(x - w / 2, y0, w, y1 - y0);
  c.fillStyle = mix(col, '#000000', 0.3); c.fillRect(x - w * 0.62, y0, w * 1.24, 40); c.fillRect(x - w * 0.62, y1 - 40, w * 1.24, 40);
  c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 3; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x - w / 2 + k * w / 4, y0 + 40); c.lineTo(x - w / 2 + k * w / 4, y1 - 40); c.stroke(); }
}
function tileFloor(c, y, col, vx = 540) {
  const g = c.createLinearGradient(0, y, 0, H + 100); g.addColorStop(0, mix(col, '#000000', 0.25)); g.addColorStop(1, col);
  c.fillStyle = g; c.fillRect(-300, y, W + 600, H + 300 - y);
  c.strokeStyle = 'rgba(20,10,5,0.22)'; c.lineWidth = 2.5;
  for (let k = -12; k <= 12; k++) { c.beginPath(); c.moveTo(vx + k * 60, y); c.lineTo(vx + k * 420, H + 200); c.stroke(); }
  for (let i = 1; i < 12; i++) { const yy = y + Math.pow(i / 11, 1.8) * (H + 100 - y); c.beginPath(); c.moveTo(-300, yy); c.lineTo(W + 300, yy); c.stroke(); }
}
function lightShaft(c, x0, w0, x1, w1, y0, y1, col, a) {
  c.save(); c.globalCompositeOperation = 'lighter';
  const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, hexA(col, a)); g.addColorStop(1, hexA(col, 0));
  c.fillStyle = g; c.beginPath(); c.moveTo(x0 - w0 / 2, y0); c.lineTo(x0 + w0 / 2, y0); c.lineTo(x1 + w1 / 2, y1); c.lineTo(x1 - w1 / 2, y1); c.closePath(); c.fill(); c.restore();
}
function temple(c, t, o = {}) { // temple hall: brick walls, glazed bands, pillars, bright door at the back, oil lamps
  const dim = o.dim === undefined ? 1 : o.dim;
  brickWall(c, -200, 0, W + 400, 1260, mix('#8a5a3a', '#1a0e08', 1 - dim * 0.8));
  glazedBand(c, 520, 90, t, 0.4 + 0.5 * dim); glazedBand(c, 1050, 60, t, 0.3 + 0.4 * dim);
  // the bright doorway at the back
  c.fillStyle = '#1a0e08'; c.beginPath(); archPath(c, 540, 1240, 250, 560); c.fill();
  c.save(); c.beginPath(); archPath(c, 540, 1236, 230, 540); c.clip();
  const gd = c.createLinearGradient(0, 700, 0, 1240); gd.addColorStop(0, o.doorSky || '#fff2d0'); gd.addColorStop(1, o.doorGround || '#f0c890'); c.fillStyle = gd; c.fillRect(400, 680, 280, 580);
  if (o.doorFn) o.doorFn(c); c.restore();
  tileFloor(c, 1240, mix('#a87850', '#1a0e08', 1 - dim * 0.75));
  lightShaft(c, 540, 230, 540, 900, 1240, 1900, o.shaft || '#fff0c8', 0.18 * (o.shaftA === undefined ? 1 : o.shaftA));
  [[150, 900], [930, 900]].forEach(([x, y], k) => lampFlame(c, x, y, t, k * 2, 1.2));
}

// ---------- the pyre, the fire made cool, the garden
function pyre(c, x, y, s, char = 0, flat = 0) {
  c.save(); c.translate(x, y); c.scale(s, s * (1 - flat));
  const wood = mix('#5a3a22', '#120a08', char), end = mix('#c8a070', '#3a2214', char);
  for (let row = 0; row < 6; row++) {
    const yy = -row * 34, half = 330 - row * 46;
    for (let k = 0; k < 7; k++) { const lx = -half + k * (half * 2 / 6), ang = ((row + k) % 2 ? 0.25 : -0.25);
      c.save(); c.translate(lx, yy); c.rotate(ang); c.fillStyle = wood; c.beginPath(); c.roundRect(-70, -13, 140, 26, 12); c.fill();
      c.fillStyle = end; c.beginPath(); c.ellipse(68, 0, 7, 12, 0, 0, 6.283); c.fill(); c.restore(); }
  }
  c.restore();
}
function blaze(c, x, y, s, t, cool = 0, size = 1) { // the great fire; cool -> white/cyan, shrinking into soft light
  if (size <= 0) return;
  c.save(); c.translate(x, y); c.scale(s, s);
  const hot = ['#ff4a12', '#ff8a1a', '#ffc040', '#fff0b0'], cold = ['#7ab8e0', '#a8d8f0', '#dff2ff', '#ffffff'];
  c.save(); c.globalCompositeOperation = 'lighter';
  glow(c, 0, -300 * size, 900 * size, mix('#ff6a1a', '#bfe6ff', cool), (0.5 - 0.2 * cool) + 0.05 * Math.sin(t * 11));
  c.restore();
  const shrink = size * (1 - 0.85 * cool);
  for (let L = 0; L < 4; L++) { // overlapping teardrop tongues, back (red, wide) to front (white, narrow)
    const col = mix(hot[L], cold[L], cool), n = 9 - L, wid = 330 - L * 66, hh = (880 - L * 170) * shrink;
    c.fillStyle = hexA(col, 1 - 0.55 * cool);
    c.beginPath(); c.ellipse(0, -10, wid * 1.05, 40 * shrink + 10, 0, 0, 6.283); c.fill();
    for (let k = 0; k < n; k++) {
      const q = (k + 0.5) / n, x = -wid + q * wid * 2, env = Math.pow(Math.sin(q * Math.PI), 0.7);
      const fl = 0.6 + 0.4 * noise1(t * 3.0 + k * 1.9 + L * 7, L + 3), h = hh * env * fl, w = wid / n * 1.6, sw = Math.sin(t * 4.5 + k * 1.3 + L) * 26 * env;
      c.beginPath(); c.moveTo(x - w, 0);
      c.bezierCurveTo(x - w * 1.1, -h * 0.45, x - w * 0.35 + sw * 0.6, -h * 0.72, x + sw, -h);
      c.bezierCurveTo(x + w * 0.35 + sw * 0.6, -h * 0.72, x + w * 1.1, -h * 0.45, x + w, 0); c.closePath(); c.fill();
    }
  }
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
function ghost(c, base, o, a) { c.save(); c.globalAlpha = a; figure(c, Object.assign({}, base, o, { robe: '#a8b0c8', wrap: '#c8d0e0', skin: '#9098b0', trim: '#c0c8dc', band: '#b0b8d0', shadow: false, light: 0.3 })); c.restore(); }

const SCENES = {
  // 1. Mesopotamia: a people carving idols and worshipping them; the young Ibrahim appears — title card
  intro: {
    grade: 'rgba(255,150,80,0.26)',
    draw(c, t, d) {
      const p = t / d, px = lerp(50, -50, ease(p)), tI = at('intro', 'Ibrahim', 0, d * 0.75), ib = ramp(t, tI - 0.8, 1.6), tId = at('intro', 'idoles', 0, 5.5);
      cam(c, 1.0 + 0.07 * ease(p), W / 2, 1150);
      sky(c, [[0, '#1c1a3a'], [0.3, '#6a3a52'], [0.5, '#e0885a'], [0.6, '#f4b878']]);
      par(c, 0.05, px, 0, () => { sun(c, 250, 860, 70, '#ffc070', 0.95); wisps(c, t, 360, 10, '#ffb890', 0.35, 4, 8); stars(c, t, 60, 4, [0, 0, W, 400], 0.5); });
      c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 250, 860, 0.3, 1.2, 1500, 10, '#ffd8a0', 0.05, t, 3); c.restore();
      town(c, t, { base: 1100, px, sky: '#e8a078', lit: 0.5, zx: 880 });
      par(c, 0.6, px, 0, () => river(c, 1150, 60, t, '#3a5a6a', '#f0b080'));
      plain(c, 1215, '#b88a5c', t, 2);
      // the sculptor's yard: a row of finished idols, incense smoke, a sculptor chiselling a new one (sparks on each blow)
      par(c, 0.85, px, 0, () => {
        const lit = ramp(t, tId - 0.3, 0.8);
        [[640, 230, 0, '#9a8a76'], [740, 280, 3, '#a89070'], [850, 250, 1, '#8a7a6a'], [960, 320, 2, '#b09a74']].forEach(([x, h, k, col], i) => {
          idol(c, x, 1330, h, k, { col, acc: i % 2 ? '#8a2a1a' : LAPIS });
          c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, 1330 - h * 0.6, h * 0.9, '#ffb060', 0.22 * lit); c.restore();
        });
        smoke(c, t, 800, 1300, 8, 5, '#d8c0a8', 0.18, 0.8, 40);
        const blow = Math.abs(Math.sin(t * 3.0));
        idol(c, 360, 1360, 260, 1, { col: '#c8b090', broken: 0 });
        fig(c, FOLK[3], { x: 220, y: 1380, h: 300, dir: 1, armUp: 0.25 + 0.4 * blow, light: 0.8, t });
        if (blow > 0.94) sparks(c, t * 4, 300, 1240, 10, 7, 0.9, 1.4);
      });
      // townsfolk carrying a small idol home, others walking
      fig(c, FOLK[0], { x: (t * 45) % 1500 - 260, y: 1470, h: 280, dir: 1, walk: t * 1.1, light: 0.8, t, lantern: false });
      fig(c, FOLK[5], { x: 1180 - (t * 38) % 1500, y: 1500, h: 300, dir: -1, walk: t * 1.1 + 0.4, light: 0.8, t, reach: 0.3 });
      // Ibrahim appears when the narration names him
      if (ib > 0) { c.save(); c.globalAlpha = ib; fig(c, IBRAHIM, { x: lerp(560, 520, ib), y: 1620, h: 420, dir: 1, walk: ib < 1 ? t * 1.1 : null, light: 1, t, wind: 0.4 }); c.restore(); }
      blurred(c, 7, () => { reeds(c, 1010, 2040, 1.5, '#1e1a0e', t, 3); reeds(c, 40, 2060, 1.4, '#221c10', t, 4); });
      dust(c, t, 30, 9, [0, 700, W, 600], '#ffb070', 0.3);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a = seg(t, 0.2, 1.2) * (1 - seg(t, 7.2, 8.2));
      textGlow(c, 'LES PROPHÈTES  ·  ÉPISODE 5', W / 2, 215, '600 34px Lora', '#fbe7c6', a * 0.9, '#000000', 12);
      c.save(); c.direction = 'rtl';
      textGlow(c, 'إِبْرَاهِيم', W / 2, 430 - (1 - easeOut(seg(t, 0.4, 1.6))) * 30, '700 170px Amiri', '#f6c453', a, '#ffb300', 40);
      c.restore();
      textGlow(c, 'ʿalayhi s-salām', W / 2, 590, 'italic 500 46px Lora', '#fff3dc', a, '#000000', 14);
      textGlow(c, 'et les idoles de son peuple', W / 2, 655, 'italic 500 34px Lora', '#e8d6b8', a * 0.8, '#000000', 10);
    },
  },

  // 2. A star rises; "is this my Lord?" — it sets: "I do not love what disappears"
  star: {
    grade: 'rgba(90,110,200,0.28)',
    draw(c, t, d) {
      const tE = at('star', 'étoile', 0, 1.6), tQ = at('star', 'Est', 0, 3.2), tD = at('star', 'disparut', 0, 5.6), tJ = at('star', 'Je', 0, 7.7);
      const appear = ramp(t, tE - 0.4, 1.0), set = ease(seg(t, tD - 0.8, tD + 1.2)), look = ramp(t, tQ - 0.3, 0.7) * (1 - ramp(t, tD + 0.4, 0.8));
      cam(c, 1.0 + 0.06 * ease(t / d), W / 2, 1100, 0, 30 * ease(t / d));
      sky(c, [[0, '#03040c'], [0.45, '#0a1030'], [0.62, '#1e2048'], [0.7, '#3a2a4a']]);
      milkyWay(c, t, 0.9, -0.5, 520); stars(c, t, 220, 21, [0, 0, W, 1050], 0.9);
      // the bright star: rises, shines, then sinks behind the hills
      const sx = lerp(760, 900, set), sy = lerp(520, 1150, set * set);
      if (appear > 0) { c.save(); c.beginPath(); c.rect(-200, -200, W + 400, ridgeY(sx, 1120, 70, 0.004, 7) + 200); c.clip();
        star4(c, sx, sy, (26 + 6 * Math.sin(t * 3)) * appear, '#fff4d8', appear); glow(c, sx, sy, 160 * appear, '#cfe0ff', 0.25 * appear); c.restore(); }
      ridge(c, 1120, 70, 0.004, 7, '#141428', { rim: hexA('#8a90c8', 0.35 + 0.3 * appear * (1 - set)) });
      // a distant town with lamp-lit windows
      c.save(); c.globalAlpha = 0.85; for (let i = 0; i < 9; i++) house(c, 120 + i * 60, 1170, 52, 40 + (i % 3) * 16, '#1e1a2a', { lit: 0.8 * (i % 2), side: 8, noDoor: true }); c.restore();
      ridge(c, 1260, 60, 0.003, 11, '#0e0e1c');
      // Ibrahim on the hill, alone
      const turn = t > tJ - 0.2;
      fig(c, IBRAHIM, { x: 380, y: 1640, h: 560, dir: turn ? -1 : 1, reach: look * 0.95, light: 0.55 + 0.25 * appear * (1 - set), t, wind: 0.5 });
      c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 380, 1300, 500, '#9ab0ff', 0.08 * appear * (1 - set)); c.restore();
      blurred(c, 7, () => { rocksFg(c, 960, 1990, 1.3, '#1a1a2c', 2); shrubDark(c, 70, 1940, 3.0, t); });
      dust(c, t, 30, 31, [0, 900, W, 900], '#c8d0ff', 0.25, 6);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'لَا أُحِبُّ الْآفِلِينَ', t, tJ - 0.3, d + 1, 280, 110, '#e8eeff');
      textGlow(c, 'Al-An\'am, 76', W / 2, 395, 'italic 500 34px Lora', '#e8eeff', seg(t, tJ + 0.4, tJ + 1.2) * 0.85, '#000', 10);
    },
  },

  // 3. The moon, then the sun — both set. "I turn my face toward the One who created the heavens and the earth."
  sky: {
    grade: 'rgba(255,170,110,0.22)',
    draw(c, t, d) {
      const tL = at('sky', 'lune', 0, 0.7), tS = at('sky', 'soleil', 0, 2.3), tC = at('sky', 'couchèrent', 0, 5.8), tT = at('sky', 'tourne', 0, 7.2), tCi = at('sky', 'cieux', 0, 9.7);
      const mq = seg(t, tL - 0.8, tS + 1.6), sq = seg(t, tS - 0.6, tC + 0.6), night = ramp(t, tC + 0.2, 1.4);
      const sunH = Math.sin(sq * Math.PI), day = clamp(sunH * 1.4) * (1 - night);
      cam(c, 1.0 + 0.05 * ease(t / d), W / 2, 1150);
      const top = mix(mix('#0a0e24', '#4a7ab0', day), '#05060f', night), mid = mix(mix('#2a2a4a', '#bcd0e0', day), '#0c1026', night), hor = mix(mix('#5a3a4a', '#f4d8a8', day), '#2a2234', night);
      const dusk = Math.max(0, 1 - Math.abs(sq - 0.92) * 8) * (1 - night) + Math.max(0, 1 - Math.abs(sq - 0.05) * 10);
      sky(c, [[0, top], [0.42, mid], [0.6, mix(hor, '#e0703a', dusk * 0.7)]]);
      stars(c, t, 160, 51, [0, 0, W, 1000], clamp(1 - day * 1.5) * 0.9);
      if (night > 0) milkyWay(c, t, night, -0.6, 500);
      // moon arc, then sun arc (both sink behind the horizon)
      const arc = (q, x0, x1, top) => [lerp(x0, x1, q), 1180 - Math.sin(q * Math.PI) * (1180 - top)];
      if (mq > 0 && mq < 1) { const [mx, my] = arc(mq, 120, 980, 420); c.save(); c.beginPath(); c.rect(-200, -200, W + 400, 1330); c.clip(); moon(c, mx, my, 50, clamp(1 - day * 0.7)); c.restore(); }
      if (sq > 0 && sq < 1) { const [sx, sy] = arc(sq, 100, 980, 380); c.save(); c.beginPath(); c.rect(-200, -200, W + 400, 1330); c.clip(); sun(c, sx, sy, 60 + 30 * (1 - sunH), mix('#ffd27a', '#ff8a4a', 1 - sunH), 1);
        c.globalCompositeOperation = 'lighter'; rays(c, sx, sy, Math.PI / 2, 6.2, 900, 14, '#fff0c0', 0.04 * sunH, t, 5); c.restore(); }
      wisps(c, t, 420, 9, mix('#ffffff', '#3a3050', night), 0.3, 6, 7);
      // wide land: far ridges, the river plain, palms
      ridge(c, 1180, 50, 0.003, 17, mix(mix('#3a2a3a', '#b89880', day), '#141224', night));
      haze(c, 1200, 160, mix(hor, '#1a1828', night), 0.45);
      ridge(c, 1260, 40, 0.004, 19, mix(mix('#2a1e22', '#8a6a4a', day), '#0e0c18', night));
      [[160, 0.9], [880, 1.0]].forEach(([x, s], k) => datePalm(c, x, 1300, s, mix(mix('#1a1410', '#3a4a2a', day), '#0a0a12', night), t, k + 3));
      plain(c, 1330, mix(mix('#3a2a24', '#b08a5c', day), '#16121c', night), t, 21, false);
      // Ibrahim follows the sky with his hand, then turns to pray (dua) at "tourne"
      const tq = ramp(t, tT - 0.4, 0.8), follow = (1 - tq) * (mq > 0 && mq < 1 || sq > 0 && sq < 1 ? 0.7 : 0.2);
      lightFromAbove(c, t, 540, ramp(t, tCi - 1.2, 1.6) * 0.8, 380);
      fig(c, IBRAHIM, { x: 540, y: 1640, h: 560, dir: (sq > 0.5 && tq < 0.5) || (sq <= 0.5 && mq > 0.5 && tq < 0.5) ? 1 : -1, reach: follow, dua: tq > 0.5, light: 0.5 + 0.5 * day + 0.3 * tq, t, wind: 0.4 });
      blurred(c, 7, () => { rocksFg(c, 1000, 2000, 1.3, mix(mix('#3a2a20', '#8a6a4a', day), '#12101c', night), 5); reeds(c, 50, 2060, 1.3, mix('#2a2014', '#0a0a12', night), t, 6); });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'إِنِّي وَجَّهْتُ وَجْهِيَ لِلَّذِي', t, tT - 0.4, d + 1, 260, 84);
      arabicCaption(c, 'فَطَرَ السَّمَاوَاتِ وَالْأَرْضَ', t, tT + 0.2, d + 1, 380, 84);
    },
  },

  // 4. "O my father, why do you worship what neither hears nor sees?" — inside the house, among the idols
  father: {
    grade: 'rgba(255,150,70,0.3)',
    draw(c, t, d) {
      const tO = at('father', 'Ô', 0, 1.9), tP = at('father', 'pourquoi', 0, 3), tN = at('father', 'entend', 0, 4.3), tV = at('father', 'voit', 0, 5.4), tR = at('father', 'rien', 0, 7);
      const speak = ramp(t, tO - 0.3, 0.6), point = ramp(t, tP - 0.2, 0.6) * (1 - ramp(t, tR + 0.2, 0.8));
      cam(c, 1.02 + 0.08 * ease(t / d), 540, 1150, 0, 0);
      brickWall(c, -200, 0, W + 400, 1300, '#6a4028');
      glazedBand(c, 640, 60, t, 0.55);
      // a niche with the household idols on a shelf
      c.fillStyle = '#2a170c'; c.beginPath(); archPath(c, 700, 1180, 560, 560); c.fill();
      const ng = c.createLinearGradient(0, 620, 0, 1180); ng.addColorStop(0, '#1a0e06'); ng.addColorStop(1, '#3a2010'); c.fillStyle = ng; c.beginPath(); archPath(c, 700, 1172, 520, 540); c.fill();
      c.fillStyle = '#5a3820'; c.fillRect(420, 1040, 560, 24); c.fillStyle = '#3a2412'; c.fillRect(420, 1064, 560, 10);
      [[500, 210, 0, '#8a7a6a'], [610, 260, 3, '#9a8a70'], [720, 300, 2, '#a89070'], [835, 240, 1, '#7a6a5a'], [925, 190, 0, '#8a7060']].forEach(([x, h, k, col], i) => {
        idol(c, x, 1040, h, k, { col, acc: i % 2 ? '#8a2a1a' : LAPIS, shadow: false });
        // each "does not hear / does not see / is of no use": a cold glint passes over the idols, then dies
        const g = Math.max(ramp(t, tN - 0.1 + i * 0.06, 0.25) * (1 - ramp(t, tN + 0.5, 0.6)), ramp(t, tV - 0.1 + i * 0.06, 0.25) * (1 - ramp(t, tV + 0.5, 0.6)), ramp(t, tR - 0.1 + i * 0.06, 0.25) * (1 - ramp(t, tR + 0.6, 0.8)));
        if (g > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, 1040 - h * 0.6, h * 0.6, '#9ab0d0', 0.18 * g); c.restore(); }
      });
      lampFlame(c, 440, 1020, t, 0, 1.3); lampFlame(c, 960, 1020, t, 3, 1.1);
      smoke(c, t, 700, 1000, 6, 3, '#c8a888', 0.12, 0.6, 30);
      tileFloor(c, 1300, '#6a4a30', 540);
      // a woven rug
      c.fillStyle = '#7a2a1a'; c.beginPath(); c.moveTo(160, 1560); c.lineTo(920, 1560); c.lineTo(1040, 1760); c.lineTo(40, 1760); c.closePath(); c.fill();
      c.strokeStyle = GOLD; c.lineWidth = 6; c.beginPath(); c.moveTo(190, 1580); c.lineTo(890, 1580); c.lineTo(990, 1740); c.lineTo(90, 1740); c.closePath(); c.stroke();
      c.strokeStyle = hexA('#e8d0a0', 0.4); c.lineWidth = 3; for (let k = 0; k < 7; k++) { const x = 240 + k * 110; c.beginPath(); c.moveTo(x, 1620); c.lineTo(x + 30, 1660); c.lineTo(x, 1700); c.lineTo(x - 30, 1660); c.closePath(); c.stroke(); }
      // the father (elder, staff) on the right, Ibrahim on the left speaking, hand toward the idols
      fig(c, FATHER, { x: 860, y: 1640, h: 560, dir: -1, staff: true, light: 0.65, t });
      fig(c, IBRAHIM, { x: 260, y: 1660, h: 590, dir: 1, reach: Math.max(0.25 * speak, point), light: 0.9, t });
      c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 700, 900, 700, '#ff9a40', 0.1); c.restore();
      blurred(c, 9, () => { pillar(c, -10, 0, 2000, 150, '#4a2a18'); });
      dust(c, t, 40, 41, [100, 600, 900, 900], '#ffd0a0', 0.25, 5);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'يَا أَبَتِ لِمَ تَعْبُدُ', t, tO - 0.3, d + 1, 250, 92);
      arabicCaption(c, 'مَا لَا يَسْمَعُ وَلَا يُبْصِرُ', t, tN - 0.3, d + 1, 370, 92);
    },
  },

  // 5. "We found our forefathers worshipping them" — the crowd at the foot of the ziggurat, ghosts of the forefathers behind
  ancestors: {
    grade: 'rgba(255,165,90,0.26)',
    draw(c, t, d) {
      const tA = at('ancestors', 'ancêtres', 0, 3.2), tI = at('ancestors', 'Il', 0, 4.8), tE = at('ancestors', 'égarement', 0, 8.2);
      const gh = ramp(t, tA - 0.4, 1.0) * (1 - ramp(t, tE - 0.2, 1.0)), up = ramp(t, tI - 0.2, 0.7);
      const px = lerp(-30, 30, ease(t / d));
      cam(c, 1.03 + 0.05 * ease(t / d), W / 2, 1150);
      sky(c, [[0, '#4a6a92'], [0.38, '#e0b090'], [0.55, '#f4d0a0']]);
      par(c, 0.05, px, 0, () => { sun(c, 880, 560, 60, '#fff0c0', 0.8); wisps(c, t, 300, 8, '#fff0e0', 0.3, 11, 6); });
      par(c, 0.2, px, 0, () => { ziggurat(c, 600, 1130, 820, 560, '#c09062'); haze(c, 1130, 300, '#f0c8a0', 0.35); });
      par(c, 0.4, px, 0, () => { house(c, 80, 1150, 200, 150, '#b08058'); house(c, 1000, 1160, 220, 170, '#a87850'); });
      plain(c, 1150, '#c09468', t, 4);
      // ghosts of the forefathers: faint, bluish rows receding behind the crowd
      if (gh > 0) for (let row = 0; row < 3; row++) for (let i = 0; i < 7; i++) {
        const x = 330 + i * 115 + row * 40, y = 1200 - row * 45;
        ghost(c, FOLK[(i + row) % FOLK.length], { x, y: y - 20 * (1 - gh), h: 330 - row * 50, dir: -1, t: t + i }, gh * (0.62 - row * 0.15) * (0.75 + 0.25 * Math.sin(t * 2 + i)));
        if (row === 0 && i === 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 700, 1050, 520, '#b8c8ff', 0.18 * gh); c.restore(); }
      }
      haze(c, 1240, 140, '#f0c8a0', 0.3);
      // the crowd (three rows, varied clothes and heights)
      for (let i = 0; i < 7; i++) fig(c, FOLK[(i + 3) % FOLK.length], { x: 470 + i * 95, y: 1270, h: 230, dir: -1, light: 0.55, t: t + i, alpha: 0.9, armUp: i === 2 ? 0.3 * (1 - up) : 0 });
      for (let i = 0; i < 6; i++) fig(c, FOLK[i % FOLK.length], { x: 500 + i * 110 + (i % 2) * 20, y: 1360, h: 300, dir: -1, light: 0.7, t: t + i * 2, reach: i === 1 ? 0.5 * ramp(t, 0.6, 0.6) * (1 - up) : 0 });
      for (let i = 0; i < 3; i++) fig(c, FOLK[(i + 6) % FOLK.length], { x: 640 + i * 170, y: 1500 + (i % 2) * 20, h: 380, dir: -1, light: 0.8, t: t + i });
      // Ibrahim facing them alone
      fig(c, IBRAHIM, { x: 220, y: 1600, h: 560, dir: 1, armUp: 0.1 + 0.6 * up, light: 1, t, wind: 0.4 });
      dust(c, t, 50, 21, [0, 700, W, 900], '#fff0c8', 0.3, 8);
      blurred(c, 7, () => { datePalm(c, 1060, 2050, 2.3, '#2a1c12', t, 4); });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'وَجَدْنَا آبَاءَنَا لَهَا عَابِدِينَ', t, 0.6, tI - 0.1, 280, 96);
      arabicCaption(c, 'فِي ضَلَالٍ مُّبِينٍ', t, tI + 0.4, d + 1, 280, 110);
    },
  },

  // 6. Festival day: the town empties; Ibrahim enters the temple and breaks the idols — all but the biggest
  idols: {
    grade: 'rgba(255,160,90,0.26)',
    draw(c, t, d) {
      const tV = at('idols', 'vida', 0, 2.1), tE = at('idols', 'entra', 0, 3.7), tB = at('idols', 'brisa', 0, 5.2), tM = at('idols', 'morceaux', 0, 6.5), tS = at('idols', 'sauf', 0, 8);
      const tp = at('idols', 'Ibrahim', 0, 3.2);
      phases(c, t, tp - 0.6, 0.8, c => {
        // the town empties: the crowd walks out toward the festival, leaving the street empty
        cam(c, 1.0 + 0.04 * t, W / 2, 1150);
        sky(c, [[0, '#4a7aa8'], [0.38, '#e8d0a8'], [0.55, '#f6e0b0']]);
        sun(c, 860, 600, 60, '#fff2c0'); wisps(c, t, 320, 6, '#ffffff', 0.25, 5, 5);
        town(c, t, { base: 1120, sky: '#f0d0a8', zx: 540, noPalms: true });
        plain(c, 1180, '#c8a070', t, 5);
        // festival banners
        c.strokeStyle = '#3a2414'; c.lineWidth = 3; c.beginPath(); c.moveTo(-20, 1000); c.quadraticCurveTo(540, 1100, 1100, 990); c.stroke();
        for (let k = 0; k < 14; k++) { const q = k / 13, x = lerp(-20, 1100, q), y = 1000 + Math.sin(q * Math.PI) * 95 - q * 10; c.fillStyle = [LAPIS, '#c0402a', GOLD][k % 3]; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 28, y); c.lineTo(x + 14, y + 40 + Math.sin(t * 3 + k) * 4); c.fill(); }
        const leave = ease(seg(t, 0, tV + 0.6));
        for (let i = 0; i < 9; i++) { const x0 = 120 + i * 100, x = x0 + leave * (900 + i * 40); fig(c, FOLK[i % FOLK.length], { x, y: 1300 + (i % 3) * 60, h: 260 + (i % 3) * 40, dir: 1, walk: t * 1.2 + i * 0.3, light: 0.85, t }); }
        dust(c, t, 40, 7, [0, 900, W, 700], '#fff0c8', 0.35, 20);
      }, c => {
        // inside the temple: rows of idols, Ibrahim enters and strikes
        const ts = t - (tp - 0.6), shake = Math.max(0, ...[0, 1, 2, 3].map(k => 1 - seg(t, tB + k * 0.45, tB + k * 0.45 + 0.35))) * (t > tB ? 1 : 0);
        cam(c, 1.0 + 0.03 * ts, W / 2, 1200, Math.sin(t * 50) * 10 * shake, Math.cos(t * 43) * 7 * shake);
        temple(c, t, {});
        // idols along both sides + the biggest in the center back
        const tb = k => tB + 0.15 + k * 0.32;
        const list = [[120, 1330, 300, 0], [270, 1290, 250, 3], [400, 1260, 200, 1], [680, 1260, 210, 0], [810, 1290, 260, 1], [960, 1330, 310, 3]];
        idol(c, 540, 1250, 560, 2, { col: '#b09a74', acc: LAPIS });
        const keep = ramp(t, tS - 0.2, 0.8);
        c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, 950, 420, '#cfe0ff', 0.22 * keep); c.restore();
        list.forEach(([x, y, h, k], i) => idol(c, x, y, h, k, { col: ['#8a7a6a', '#a08a70', '#7a6a5a'][i % 3], acc: i % 2 ? '#8a2a1a' : LAPIS, broken: ramp(t, tb(i), 0.9), seed: 3 + i }));
        list.forEach(([x, y, h], i) => { const q = seg(t, tb(i), tb(i) + 0.5); if (q > 0 && q < 1) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y - h * 0.5, h * 0.8, '#ffe0a0', 0.4 * (1 - q)); c.restore(); } });
        // Ibrahim: walks in from the door, then strikes with his right hand
        const walkIn = ease(seg(t, tE - 0.8, tB - 0.1)), strike = t > tB - 0.3 ? Math.abs(Math.sin((t - tB + 0.3) * 5.5)) : 0, strikeA = (1 - ramp(t, tS - 0.3, 0.6));
        fig(c, IBRAHIM, { x: lerp(540, 330, walkIn), y: lerp(1300, 1720, walkIn), h: lerp(240, 500, walkIn), dir: 1, walk: walkIn > 0 && walkIn < 1 ? t * 1.1 : null, armUp: (0.25 + 0.6 * strike) * strikeA * (t > tB - 0.3 ? 1 : 0), light: 0.9, t });
        dust(c, t, 60, 13, [0, 900, W, 900], '#ffe0b0', 0.3 + 0.3 * shake, 12);
        blurred(c, 9, () => { pillar(c, 30, -100, 2100, 170, '#5a3420'); pillar(c, 1050, -100, 2100, 170, '#5a3420'); });
      });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'فَجَعَلَهُمْ جُذَاذًا إِلَّا كَبِيرًا لَّهُمْ', t, tB - 0.2, d + 1, 280, 86);
    },
  },

  // 7. "Who did this to our gods?" — he is brought before the crowd: "Rather the biggest of them did it. Ask them, if they speak!"
  accuse: {
    grade: 'rgba(220,110,70,0.3)',
    draw(c, t, d) {
      const tOn = at('accuse', 'On', 0, 2.4), tC = at('accuse', 'C\'est', 0, 8.2), tV = at('accuse', 'voici', 0, 10.3), tI = at('accuse', 'Interrogez', 0, 12.6), tT = at('accuse', 'toi', 0, 4.8);
      phases(c, t, tOn - 0.3, 0.8, c => {
        // the temple at dusk: shards everywhere, the crowd rushes in with torches
        cam(c, 1.05 - 0.03 * t / 3, W / 2, 1200);
        temple(c, t, { dim: 0.45, doorSky: '#ff9a5a', doorGround: '#5a2a1a', shaft: '#ff9a5a', shaftA: 0.8 });
        idol(c, 540, 1250, 560, 2, { col: '#a08a6a', acc: LAPIS });
        [[120, 1330, 300, 0], [270, 1290, 250, 3], [400, 1260, 200, 1], [680, 1260, 210, 0], [810, 1290, 260, 1], [960, 1330, 310, 3]].forEach(([x, y, h, k], i) => idol(c, x, y, h, k, { col: ['#7a6a5a', '#8a7a62', '#6a5a4a'][i % 3], broken: 1, seed: 3 + i }));
        const rush = ease(seg(t, 0, 1.6));
        for (let i = 0; i < 6; i++) { const x = 340 + i * 80, y = lerp(1300, 1650 + (i % 2) * 40, rush), h = lerp(200, 440, rush);
          fig(c, FOLK[(i + 2) % FOLK.length], { x, y, h, dir: i < 3 ? 1 : -1, armUp: 0.6 + 0.2 * Math.sin(t * 6 + i), light: 0.5, t, walk: rush < 1 ? t * 1.3 + i : null });
          if (i % 2 === 0) handTorch(c, x + (i < 3 ? 1 : -1) * h * 0.27, y - h * 1.0, t, i, h / 440); }
        dust(c, t, 40, 17, [0, 1000, W, 600], '#ffb070', 0.35, 10);
      }, c => {
        // before the crowd: Ibrahim in the middle, the great idol on its plinth, accusing hands
        const ts = t - tOn;
        cam(c, 1.0 + 0.04 * clamp(ts / 10), W / 2, 1150);
        sky(c, [[0, '#1a1430'], [0.4, '#7a3a3a'], [0.6, '#e07a4a']]);
        sun(c, 540, 1060, 70, '#ff9a5a', 0.7);
        ziggurat(c, 600, 1130, 700, 470, '#6a4030', { lit: 0.6 }); haze(c, 1130, 260, '#c86a4a', 0.4);
        plain(c, 1160, '#8a5a3a', t, 7);
        // the great idol, carried out on a cart-plinth on the right
        const show = ramp(t, tV - 0.3, 0.6) * (1 - ramp(t, tI + 1.6, 1.0));
        c.fillStyle = '#4a2e1c'; c.fillRect(780, 1400, 240, 60);
        idol(c, 900, 1400, 520, 2, { col: '#b09a74', acc: LAPIS });
        if (show > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 900, 1150, 340, '#ffe0a0', 0.25 * show); c.restore(); }
        // crowd ring (back row, middle row) with torches and pointing hands
        for (let i = 0; i < 9; i++) { const x = 60 + i * 120, h = 220; fig(c, FOLK[i % FOLK.length], { x, y: 1240, h, dir: x < 540 ? 1 : -1, light: 0.45, t: t + i, armUp: (i % 3 === 0 ? 0.5 + 0.1 * Math.sin(t * 5 + i) : 0) * (1 - ramp(t, tI + 0.4, 1.2)), reach: i % 3 === 1 ? 0.5 : 0 });
          if (i % 3 === 0) handTorch(c, x + (x < 540 ? 1 : -1) * 64, 1240 - 228, t, i, 0.55); }
        haze(c, 1260, 100, '#c86a4a', 0.3);
        for (let i = 0; i < 4; i++) { const x = [80, 230, 560, 700][i], h = 330; fig(c, FOLK[(i + 4) % FOLK.length], { x, y: 1360 + (i % 2) * 20, h, dir: x < 420 ? 1 : -1, light: 0.55, t: t + i * 2, reach: i === 2 ? 0.7 * (1 - ramp(t, tC - 0.3, 0.8)) : 0 }); }
        // Ibrahim: answers, hand toward the great idol on "voici", then "ask them" with the open hand raised
        const toIdol = ramp(t, tV - 0.3, 0.5) * (1 - ramp(t, tI - 0.2, 0.6)), ask = ramp(t, tI - 0.2, 0.6);
        fig(c, IBRAHIM, { x: 420, y: 1640, h: 560, dir: 1, reach: toIdol * 0.95, armUp: ask * 0.55, light: 0.95, t, wind: 0.3 });
        dust(c, t, 40, 19, [0, 900, W, 800], '#ffb080', 0.3, 8);
        blurred(c, 8, () => { torch(c, 40, 1960, t, 5, 1.7); torch(c, 1050, 1980, t, 7, 1.7); rocksFg(c, 1000, 2010, 1.2, '#2a140c', 3); });
      });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'مَن فَعَلَ هَٰذَا بِآلِهَتِنَا', t, 0.2, tT + 0.4, 280, 96, '#ffcf9a');
      arabicCaption(c, 'بَلْ فَعَلَهُ كَبِيرُهُمْ هَٰذَا', t, tC - 0.3, d + 1, 280, 100);
    },
  },

  // 8. They lower their heads: "You know they do not speak." — "Do you worship, besides Allah, what can neither benefit nor harm you?"
  silence: {
    grade: 'rgba(120,110,150,0.3)',
    draw(c, t, d) {
      const tB = at('silence', 'baissèrent', 0, 0.5), tA = at('silence', 'Adorez', 0, 4.1), tP = at('silence', 'profiter', 0, 7.8), tN = at('silence', 'nuire', 0, 9.1);
      const bow = ramp(t, tB - 0.1, 1.0), speak = ramp(t, tA - 0.3, 0.6), dimK = ramp(t, tA, 2.5);
      cam(c, 1.06 - 0.05 * ease(t / d), W / 2, 1180);
      sky(c, [[0, '#0e0e1c'], [0.4, '#3a2a3a'], [0.62, mix('#8a4a3a', '#4a3040', dimK)]]);
      wisps(c, t, 380, 8, '#6a4a5a', 0.4, 9, 5);
      ziggurat(c, 420, 1110, 700, 470, '#4a3030'); haze(c, 1100, 240, '#5a3a3a', 0.45);
      plain(c, 1150, '#5a3a2a', t, 8);
      // the great idol, mute, a cold rim of light on it; cracks appear on "profiter" / "nuire"
      idol(c, 820, 1380, 560, 2, { col: '#8a7a64', acc: '#1a3a6a' });
      const cr = Math.max(ramp(t, tP, 0.4) * 0.5, ramp(t, tN, 0.4));
      if (cr > 0) { c.strokeStyle = `rgba(20,10,5,${0.8 * cr})`; c.lineWidth = 4; c.beginPath(); c.moveTo(830, 940); c.lineTo(812, 1010 * 1); c.lineTo(842, 1070); c.lineTo(820, 1120 + 80 * cr); c.moveTo(812, 1010); c.lineTo(780, 1040); c.stroke(); }
      // the crowd with heads bowed (leaning forward), stepping back into the shadow
      for (let i = 0; i < 6; i++) { const x = 90 + i * 90 + (i % 2) * 20, y = 1300 + (i % 2) * 30;
        lean(c, x, y, -0.2 * bow * (0.7 + 0.3 * (i % 3)), () => fig(c, FOLK[(i + 1) % FOLK.length], { x, y, h: 280, dir: 1, light: 0.45 - 0.2 * dimK, t: t + i })); }
      for (let i = 0; i < 4; i++) { const x = 160 + i * 150, y = 1430 + (i % 2) * 30;
        lean(c, x, y, -0.24 * bow, () => fig(c, FOLK[(i + 6) % FOLK.length], { x: x - 30 * dimK, y, h: 360, dir: 1, light: 0.55 - 0.25 * dimK, t: t + i * 2 })); }
      // Ibrahim in the foreground, the question with the open hand toward the idol
      fig(c, IBRAHIM, { x: 560, y: 1700, h: 600, dir: 1, reach: speak * 0.8 * (1 - 0.4 * ramp(t, tN, 0.6)), light: 1, t, wind: 0.3 });
      c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 560, 1400, 420, '#fff2d8', 0.1); c.restore();
      dust(c, t, 30, 29, [0, 900, W, 800], '#d8c0b0', 0.25, 6);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'لَقَدْ عَلِمْتَ مَا هَٰؤُلَاءِ يَنطِقُونَ', t, 0.6, tA - 0.1, 280, 86, '#e6e0ff');
      arabicCaption(c, 'أَفَتَعْبُدُونَ مِن دُونِ اللَّهِ', t, tA + 0.3, d + 1, 280, 100);
    },
  },

  // 9. "Burn him!" — an immense fire is lit, and Ibrahim is thrown into it
  fire: {
    grade: 'rgba(230,80,40,0.34)',
    draw(c, t, d) {
      const tBr = at('fire', 'Brûlez', 0, 2), tAl = at('fire', 'allumèrent', 0, 5.3), tJ = at('fire', 'jetèrent', 0, 7.5);
      const fists = ramp(t, tBr - 0.2, 0.5), lit = ease(seg(t, tAl - 0.2, tAl + 2.2)), thrown = ease(seg(t, tJ - 0.2, tJ + 1.4));
      const shk = lit * (1 - seg(t, tAl + 1.6, tAl + 3)) * 0.6;
      cam(c, 1.0 + 0.08 * ease(t / d), W / 2, 1200, Math.sin(t * 40) * 6 * shk, Math.cos(t * 33) * 5 * shk);
      sky(c, [[0, '#06040a'], [0.4, mix('#1a0c14', '#5a1a14', lit)], [0.62, mix('#2a1414', '#c8501e', lit)]]);
      stars(c, t, 80, 61, [0, 0, W, 700], 0.6 * (1 - lit));
      ziggurat(c, 860, 1080, 620, 500, mix('#2a1a18', '#6a2a1a', lit), { lit }); haze(c, 1080, 240, mix('#1a0c10', '#8a2a14', lit), 0.5);
      plain(c, 1120, mix('#2a1a12', '#5a2a16', lit), t, 9, false);
      // the pyre, then the blaze
      pyre(c, 540, 1240, 1.05, lit * 0.6);
      blaze(c, 540, 1230, 1.0, t, 0, lit);
      if (lit > 0) { smoke(c, t, 540, 600, 14, 9, '#1a1012', 0.45 * lit, 2.4, 50); embers(c, t, [140, 300, 800, 950], 70, 11, lit); }
      // Ibrahim, a small white silhouette, carried into the heart of the fire (no harm shown)
      if (thrown > 0) { const q = thrown, x = lerp(150, 540, q), y = lerp(1300, 1090, q) - Math.sin(q * Math.PI) * 300;
        c.save(); c.globalAlpha = 1 - 0.3 * q; fig(c, IBRAHIM, { x, y, h: 200, dir: 1, light: 1, t, shadow: false, wind: 1 }); c.restore();
        c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y - 100, 160, '#ffffff', 0.4 * q); c.restore(); }
      // the crowd in silhouette, fists raised against the glow
      for (let i = 0; i < 10; i++) { const x = -40 + i * 125 + (i % 2) * 20, y = 1700 + (i % 3) * 60, h = 300 + (i % 3) * 50;
        fig(c, FOLK[i % FOLK.length], { x, y, h, dir: x < 540 ? 1 : -1, armUp: fists * (0.7 + 0.15 * Math.sin(t * 6 + i)), t: t + i,
          robe: '#140a08', wrap: '#1e100c', skin: '#140a08', trim: '#2a160c', band: '#1a0c08', inner: '#1a0e0a', light: 0, shadow: false });
        if (i % 3 === 1) handTorch(c, x + (x < 540 ? 1 : -1) * h * 0.27 * fists + (x < 540 ? 1 : -1) * h * 0.16 * (1 - fists), y - h * lerp(0.38, 1.0, fists), t, i, h / 440); }
      c.fillStyle = 'rgba(20,6,4,0.5)'; c.fillRect(-200, 1800, W + 400, 300);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'حَرِّقُوهُ وَانصُرُوا آلِهَتَكُمْ', t, tBr - 0.2, d + 1, 280, 100, '#ffcf9a');
    },
  },

  // 10. "O fire, be coolness and peace for Ibrahim!" — light from above, the flames turn white and cool, flowers grow
  cool: {
    grade: 'rgba(170,210,255,0.22)',
    draw(c, t, d) {
      const tO = at('cool', 'Ô', 0, 1.6), tF = at('cool', 'fraîcheur', 0, 2.7), tP = at('cool', 'paix', 0, 3.4);
      const beam = ramp(t, tO - 0.6, 0.9), coolK = ease(seg(t, tF - 0.3, tF + 1.6)), bloom = seg(t, tP - 0.2, d + 0.6);
      cam(c, 1.1 - 0.06 * ease(t / d), W / 2, 1200);
      sky(c, [[0, mix('#06040a', '#0a1430', coolK)], [0.4, mix('#5a1a14', '#2a4a7a', coolK)], [0.62, mix('#c8501e', '#a8c8e0', coolK)]]);
      stars(c, t, 120, 61, [0, 0, W, 800], 0.7 * coolK);
      ziggurat(c, 860, 1080, 620, 500, mix('#6a2a1a', '#3a4a6a', coolK)); haze(c, 1080, 240, mix('#8a2a14', '#5a7aa0', coolK), 0.5);
      plain(c, 1120, mix('#5a2a16', '#4a5a6a', coolK), t, 9, false);
      lightFromAbove(c, t, 540, beam, 360);
      pyre(c, 540, 1240, 1.05, 0.6 + 0.4 * coolK, 0.65 * coolK);
      blaze(c, 540, 1230, 1.0, t, coolK, 1);
      // cool mist and soft petals of light
      if (coolK > 0) { smoke(c, t, 540, 1200, 14, 21, '#e8f4ff', 0.25 * coolK, 2.2, 14); embers(c, t, [140, 400, 800, 900], 60, 13, coolK * 0.8, [220, 240, 255]); }
      flowers(c, 540, 1225, 300, bloom, 5, t, 46);
      fig(c, IBRAHIM, { x: 540, y: 1225, h: 380, dir: 1, pose: 'sit', light: 1, t, shadow: false, dua: bloom > 0.15 });
      c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, 1100, 380, '#ffffff', 0.18 + 0.15 * coolK); c.restore();
      for (let i = 0; i < 8; i++) { const x = -40 + i * 160, y = 1720 + (i % 2) * 60, h = 330;
        fig(c, FOLK[i % FOLK.length], { x, y, h, dir: x < 540 ? 1 : -1, armUp: 0.7 * (1 - coolK), t: t + i, robe: '#140a08', wrap: '#1e100c', skin: '#140a08', trim: '#2a160c', band: '#1a0c08', inner: '#1a0e0a', light: 0, shadow: false }); }
      c.fillStyle = 'rgba(8,10,20,0.4)'; c.fillRect(-200, 1820, W + 400, 300);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'يَا نَارُ كُونِي بَرْدًا وَسَلَامًا', t, tO - 0.3, d + 1, 260, 92, '#ffffff');
      arabicCaption(c, 'عَلَىٰ إِبْرَاهِيمَ', t, tO + 0.4, d + 1, 380, 92, '#ffffff');
      textGlow(c, 'Al-Anbiya, 69', W / 2, 485, 'italic 500 34px Lora', '#eef6ff', seg(t, tO + 0.8, tO + 1.6) * 0.85, '#000', 10);
    },
  },

  // 11. The fire did not burn him; they wanted a plot, and it is they who lost
  safe: {
    grade: 'rgba(200,190,230,0.24)',
    draw(c, t, d) {
      const tV = at('safe', 'voulaient', 0, 2.5), tPe = at('safe', 'perdants', 0, 6.3), tE = at('safe', 'eux', 0, 4.8);
      const back = ramp(t, tE - 0.3, 1.6), dark = ramp(t, tPe - 0.3, 1.2);
      cam(c, 1.0 + 0.08 * ease(t / d), W / 2, 1250);
      sky(c, [[0, '#0a1430'], [0.4, '#2a3a6a'], [0.62, '#7a8ab0']]);
      milkyWay(c, t, 0.5, -0.5, 400); stars(c, t, 120, 71, [0, 0, W, 900], 0.7);
      ziggurat(c, 860, 1080, 620, 500, '#2a3048'); haze(c, 1080, 240, '#4a5a80', 0.5);
      plain(c, 1120, '#3a3a48', t, 9, false);
      // the dead embers ring, the garden in the middle
      pyre(c, 540, 1260, 1.05, 1, 0.65);
      smoke(c, t, 540, 1150, 10, 31, '#c8d0e0', 0.18, 2.0, 30);
      c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, 1150, 520, '#e0f0ff', 0.22); c.restore();
      c.fillStyle = '#3a6a3a'; c.beginPath(); c.ellipse(540, 1250, 300, 60, 0, 0, 6.283); c.fill();
      flowers(c, 540, 1250, 300, 1, 5, t, 60);
      fig(c, IBRAHIM, { x: 540, y: 1245, h: 420, dir: 1, pose: 'sit', light: 1, t, shadow: false, dua: t > tV - 0.2 && t < tE });
      embers(c, t, [200, 500, 700, 700], 40, 41, 0.6, [230, 240, 255]);
      // the crowd steps back into the dark
      for (let i = 0; i < 8; i++) { const sx = i < 4 ? -1 : 1, x0 = -40 + i * 160, x = x0 + sx * 80 * back, y = 1720 + (i % 2) * 60 + 30 * back, h = 330;
        fig(c, FOLK[i % FOLK.length], { x, y, h, dir: x0 < 540 ? 1 : -1, walk: back > 0 && back < 1 ? t * 0.9 + i : null, t: t + i, robe: '#0c0a10', wrap: '#14121a', skin: '#0c0a10', trim: '#1a1820', band: '#100e14', inner: '#121018', light: 0, shadow: false, alpha: 1 - 0.4 * dark }); }
      c.fillStyle = `rgba(4,4,10,${0.35 + 0.35 * dark})`; c.fillRect(-200, 1780, W + 400, 340);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'وَأَرَادُوا بِهِ كَيْدًا', t, tV - 0.3, d + 1, 260, 96);
      arabicCaption(c, 'فَجَعَلْنَاهُمُ الْأَخْسَرِينَ', t, tE - 0.2, d + 1, 380, 96);
    },
  },

  // 12. "Ibrahim was a nation by himself, devoutly obedient to Allah" — dawn; Allah took him as an intimate friend: Khalil Allah
  khalil: {
    grade: 'rgba(255,190,120,0.24)',
    draw(c, t, d) {
      const tCo = at('khalil', 'communauté', 0, 3.1), tK = at('khalil', 'Khalil', 0, 8), go = ease(seg(t, 0, d + 1));
      const lights = ramp(t, tCo - 0.5, 2.0);
      cam(c, 1.0 + 0.08 * ease(t / d), W / 2, 1150, 0, -20 * ease(t / d));
      sky(c, [[0, '#1a2244'], [0.35, '#7a6a8a'], [0.55, '#f0b888'], [0.62, '#ffd8a0']]);
      sun(c, 540, 1080, 70, '#fff0c8', 1);
      c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 540, 1080, -Math.PI / 2, 3.0, 1500, 18, '#ffe8c0', 0.07, t, 17); c.restore();
      wisps(c, t, 560, 10, '#ffd8c0', 0.35, 13, 5);
      ridge(c, 1110, 50, 0.003, 23, '#8a6a7a'); haze(c, 1140, 160, '#f4c8a8', 0.5);
      // countless small lights along the plains: those who would follow his way
      if (lights > 0) { const r = rng(91); for (let i = 0; i < 160; i++) { const x = r() * W, y = 1160 + Math.pow(r(), 1.5) * 200, q = clamp(lights * 1.6 - r() * 0.8);
        if (q > 0) { c.fillStyle = `rgba(255,236,190,${q * (0.5 + 0.5 * Math.sin(t * 3 + i))})`; c.beginPath(); c.arc(x, y, 1.5 + (y - 1160) / 90, 0, 6.283); c.fill(); } } }
      ridge(c, 1400, 70, 0.0035, 29, '#3a2a2a', { rim: hexA('#ffd8a0', 0.6) });
      plain(c, 1440, '#4a3430', t, 29); haze(c, 1460, 60, '#3a2a2a', 0.6);
      // his single silhouette walking on the ridge toward the dawn, long shadow
      const x = lerp(260, 480, go), y = ridgeY(lerp(260, 480, go), 1400, 70, 0.0035, 29) + 4;
      c.fillStyle = 'rgba(20,10,10,0.35)'; c.beginPath(); c.moveTo(x - 20, y); c.lineTo(x - 260, y + 60); c.lineTo(x - 230, y + 70); c.lineTo(x + 10, y + 2); c.fill();
      fig(c, IBRAHIM, { x, y, h: 360, dir: 1, walk: t * 1.0, light: 1, t, wind: 0.6, staff: true });
      c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y - 200, 260, '#fff2d0', 0.15); c.restore();
      blurred(c, 7, () => { rocksFg(c, 980, 2000, 1.4, '#2a1a18', 8); reeds(c, 40, 2060, 1.3, '#1a1010', t, 8); });
      dust(c, t, 40, 81, [0, 800, W, 900], '#ffe0b0', 0.3, 6);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'إِنَّ إِبْرَاهِيمَ كَانَ أُمَّةً قَانِتًا لِّلَّهِ', t, 0.4, tK - 0.4, 280, 86);
      const k = seg(t, tK - 0.4, tK + 0.8);
      if (k > 0) { c.save(); c.direction = 'rtl'; textGlow(c, 'خَلِيلُ اللَّه', W / 2, 340 - (1 - easeOut(k)) * 30, '700 150px Amiri', '#f6c453', k, '#ffb300', 40); c.restore(); }
    },
  },

  outro: {
    grade: null,
    draw(c, t, d) {
      sky(c, [[0, '#05060f'], [0.6, '#0d1024'], [1, '#14122a']]);
      milkyWay(c, t, 0.5); stars(c, t + 50, 140, 81, [0, 0, W, H], 0.7);
      c.globalAlpha = 0.35; ziggurat(c, 540, 1920, 900, 560, '#1a1418'); c.globalAlpha = 1;
      const a = seg(t, 0.2, 1.2);
      c.save(); c.direction = 'rtl';
      textGlow(c, 'وَاتَّخَذَ اللَّهُ', W / 2, 770, '700 100px Amiri', '#f6c453', a, '#ffb300', 30);
      textGlow(c, 'إِبْرَاهِيمَ خَلِيلًا', W / 2, 900, '700 100px Amiri', '#f6c453', a, '#ffb300', 30);
      c.restore();
      const b = seg(t, 0.8, 1.8);
      textGlow(c, '« Et Allah prit Ibrahim pour ami intime. »', W / 2, 1040, 'italic 500 38px Lora', '#f3e7d0', b, '#000', 10);
      textGlow(c, '— An-Nisa, 125', W / 2, 1100, 'italic 500 38px Lora', '#f3e7d0', b, '#000', 10);
      textGlow(c, 'LES PROPHÈTES  ·  À SUIVRE', W / 2, 1330, '600 34px Lora', '#c9b48a', seg(t, 1.6, 2.4), '#000', 8);
      c.fillStyle = 'rgba(0,0,0,' + seg(t, d - 0.8, d) + ')'; c.fillRect(0, 0, W, H);
    },
  },
};
function shrubDark(c, x, y, s, t) {
  const r = rng(5); c.strokeStyle = '#06060e'; c.lineCap = 'round';
  for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (r() - 0.5) * 2.2, l = (30 + r() * 40) * s, sw = Math.sin(t * 1.5 + i) * 3 * s;
    c.lineWidth = 2.5 * s; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * l * 0.5, y + Math.sin(a) * l * 0.6, x + Math.cos(a) * l + sw, y + Math.sin(a) * l); c.stroke(); }
}
function reeds(c, x, y, s, col, t, seed = 1) { // riverbank reeds and grass for the blurred foreground
  const r = rng(seed); c.strokeStyle = col; c.fillStyle = col; c.lineCap = 'round';
  for (let i = 0; i < 22; i++) { const bx = x + (r() - 0.5) * 220 * s, hh = (120 + r() * 160) * s, lean = (r() - 0.5) * 60 * s + Math.sin(t * 1.2 + i) * 6 * s;
    c.lineWidth = (3 + r() * 3) * s; c.beginPath(); c.moveTo(bx, y); c.quadraticCurveTo(bx + lean * 0.3, y - hh * 0.6, bx + lean, y - hh); c.stroke();
    if (i % 4 === 0) { c.beginPath(); c.ellipse(bx + lean, y - hh - 14 * s, 5 * s, 18 * s, lean * 0.004, 0, 6.283); c.fill(); } }
}
function rocksFg(c, x, y, s, col, seed = 1) { // a cluster of rounded rocks (for a blurred foreground)
  const r = rng(seed);
  for (let i = 0; i < 6; i++) { const rx = x + (r() - 0.5) * 360 * s, rw = (60 + r() * 120) * s, rh = rw * (0.5 + r() * 0.3), ry = y + r() * 40 * s;
    const g = c.createLinearGradient(rx - rw, ry - rh, rx + rw, ry); g.addColorStop(0, mix(col, '#ffffff', 0.12)); g.addColorStop(1, mix(col, '#000000', 0.35));
    c.fillStyle = g; c.beginPath(); c.ellipse(rx, ry, rw, rh, (r() - 0.5) * 0.4, Math.PI, 0); c.fill(); }
}
