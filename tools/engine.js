// Shared drawing engine for the prophets series (Canvas 2D, deterministic: draw(t) only depends on t).
const W = 1080, H = 1920;

// ---------- math helpers ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = t => t * t * (3 - 2 * t);
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeIn = t => t * t * t;
function rng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function noise1(x, seed = 0) { // smooth 1D value noise
  const i = Math.floor(x), f = x - i;
  const h = n => { const r = rng((n * 374761393 + seed * 668265263) | 0); return r(); };
  return lerp(h(i), h(i + 1), ease(f));
}
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
}
function mix(h1, h2, t) {
  const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16);
  const c = [16, 8, 0].map(s => Math.round(lerp(a >> s & 255, b >> s & 255, t)));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}

// ---------- primitive painters ----------
function sky(ctx, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  stops.forEach(([p, c]) => g.addColorStop(p, c));
  ctx.fillStyle = g; ctx.fillRect(-200, -200, W + 400, H + 400);
}
function glow(ctx, x, y, r, color, a = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, hexA(color, a)); g.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
function stars(ctx, t, n, seed, area = [0, 0, W, H * 0.6], a = 1) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = area[0] + r() * area[2], y = area[1] + r() * area[3], s = 0.6 + r() * 2.2, ph = r() * 6.28;
    const tw = 0.55 + 0.45 * Math.sin(t * (0.8 + r() * 2) + ph);
    ctx.fillStyle = `rgba(255,248,225,${a * tw * (0.35 + s / 3.4)})`;
    ctx.beginPath(); ctx.arc(x, y, s, 0, 6.283); ctx.fill();
  }
}
function star4(ctx, x, y, r, color, a = 1) { // sparkly 4-point star
  glow(ctx, x, y, r * 3.2, color, 0.35 * a);
  ctx.fillStyle = hexA(color, a);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const ang = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? r * 0.28 : r;
    ctx.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr);
  }
  ctx.closePath(); ctx.fill();
}
function sun(ctx, x, y, r, color = '#ffd27a', a = 1) {
  glow(ctx, x, y, r * 5, color, 0.35 * a);
  glow(ctx, x, y, r * 2.2, '#fff1c9', 0.5 * a);
  ctx.fillStyle = hexA('#fff4d6', a); ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
}
const _moon = document.createElement('canvas');
function moon(ctx, x, y, r, a = 1, phase = 0.42) {
  _moon.width = _moon.height = Math.ceil(r * 2 + 4);
  const m = _moon.getContext('2d');
  m.clearRect(0, 0, _moon.width, _moon.height);
  m.fillStyle = '#fff3d4'; m.beginPath(); m.arc(r + 2, r + 2, r, 0, 6.283); m.fill();
  m.globalCompositeOperation = 'destination-out';
  m.beginPath(); m.arc(r + 2 + r * phase * 1.6, r + 2 - r * 0.25, r * 0.95, 0, 6.283); m.fill();
  m.globalCompositeOperation = 'source-over';
  glow(ctx, x, y, r * 4, '#cfe0ff', 0.22 * a);
  ctx.save(); ctx.globalAlpha = a; ctx.drawImage(_moon, x - r - 2, y - r - 2); ctx.restore();
}
function ridge(ctx, y, amp, freq, seed, color, opts = {}) { // rolling hills / dunes silhouette
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(-200, H + 200);
  for (let x = -200; x <= W + 200; x += 12) {
    const v = noise1(x * freq, seed) * amp + Math.sin(x * freq * 0.37 + seed) * amp * 0.35;
    ctx.lineTo(x, y - v);
  }
  ctx.lineTo(W + 200, H + 200); ctx.closePath(); ctx.fill();
  if (opts.rim) { // light rim on top
    ctx.strokeStyle = opts.rim; ctx.lineWidth = opts.rimW || 3; ctx.beginPath();
    for (let x = -200; x <= W + 200; x += 12) {
      const v = noise1(x * freq, seed) * amp + Math.sin(x * freq * 0.37 + seed) * amp * 0.35;
      x === -200 ? ctx.moveTo(x, y - v) : ctx.lineTo(x, y - v);
    }
    ctx.stroke();
  }
}
function ridgeY(x, y, amp, freq, seed) {
  return y - (noise1(x * freq, seed) * amp + Math.sin(x * freq * 0.37 + seed) * amp * 0.35);
}
function dune(ctx, x0, x1, y, h, c1, c2) { // a sculpted dune with shaded face
  ctx.fillStyle = c1; ctx.beginPath(); ctx.moveTo(x0, y);
  ctx.bezierCurveTo(lerp(x0, x1, 0.3), y - h * 0.4, lerp(x0, x1, 0.45), y - h, lerp(x0, x1, 0.55), y - h);
  ctx.bezierCurveTo(lerp(x0, x1, 0.7), y - h * 0.9, lerp(x0, x1, 0.85), y - h * 0.2, x1, y);
  ctx.lineTo(x1, H + 100); ctx.lineTo(x0, H + 100); ctx.closePath(); ctx.fill();
  ctx.fillStyle = c2; ctx.beginPath(); ctx.moveTo(lerp(x0, x1, 0.55), y - h);
  ctx.bezierCurveTo(lerp(x0, x1, 0.7), y - h * 0.9, lerp(x0, x1, 0.85), y - h * 0.2, x1, y);
  ctx.lineTo(x1, H + 100); ctx.lineTo(lerp(x0, x1, 0.62), H + 100);
  ctx.bezierCurveTo(lerp(x0, x1, 0.62), y, lerp(x0, x1, 0.58), y - h * 0.6, lerp(x0, x1, 0.55), y - h);
  ctx.fill();
}
function rays(ctx, x, y, ang, spread, len, n, color, a, t = 0, seed = 1) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const aa = ang + (r() - 0.5) * spread, w = 0.02 + r() * 0.05;
    const flick = 0.6 + 0.4 * Math.sin(t * (0.3 + r() * 0.6) + r() * 6);
    const g = ctx.createLinearGradient(x, y, x + Math.cos(aa) * len, y + Math.sin(aa) * len);
    g.addColorStop(0, hexA(color, a * flick)); g.addColorStop(1, hexA(color, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(aa - w) * len, y + Math.sin(aa - w) * len);
    ctx.lineTo(x + Math.cos(aa + w) * len, y + Math.sin(aa + w) * len);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function dust(ctx, t, n, seed, box, color = '#fff2cc', a = 0.5, speed = 12) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x0 = r() * box[2], y0 = r() * box[3], s = 1 + r() * 3, sp = (0.4 + r()) * speed, ph = r() * 6;
    const x = box[0] + ((x0 + t * sp * 0.6 + Math.sin(t * 0.5 + ph) * 20) % box[2] + box[2]) % box[2];
    const y = box[1] + ((y0 - t * sp * 0.35) % box[3] + box[3]) % box[3];
    ctx.fillStyle = hexA(color, a * (0.4 + 0.6 * Math.abs(Math.sin(t * 0.7 + ph))));
    ctx.beginPath(); ctx.arc(x, y, s, 0, 6.283); ctx.fill();
  }
}
function oliveTree(ctx, x, y, s, c1, c2, sway = 0) {
  ctx.fillStyle = c2; ctx.beginPath();
  ctx.moveTo(x - 10 * s, y); ctx.quadraticCurveTo(x - 4 * s, y - 60 * s, x - 20 * s, y - 110 * s);
  ctx.lineTo(x + 2 * s, y - 100 * s); ctx.quadraticCurveTo(x + 14 * s, y - 50 * s, x + 12 * s, y); ctx.fill();
  const r = rng(Math.floor(x * 7 + y));
  for (let i = 0; i < 9; i++) {
    const cx = x + (r() - 0.5) * 150 * s + sway * (1 + i * 0.1), cy = y - 120 * s - r() * 70 * s, rr = (30 + r() * 30) * s;
    ctx.fillStyle = i % 3 === 0 ? c2 : c1; ctx.beginPath(); ctx.ellipse(cx, cy, rr * 1.3, rr, 0, 0, 6.283); ctx.fill();
  }
}
function palm(ctx, x, y, s, color, t = 0) {
  ctx.strokeStyle = color; ctx.lineWidth = 12 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 30 * s, y - 160 * s, x + 18 * s, y - 300 * s); ctx.stroke();
  const tx = x + 18 * s, ty = y - 300 * s;
  ctx.fillStyle = color;
  for (let i = 0; i < 8; i++) {
    const ang = -Math.PI / 2 + (i - 3.5) * 0.42 + Math.sin(t * 0.8 + i) * 0.03;
    const len = 130 * s, ex = tx + Math.cos(ang) * len, ey = ty + Math.sin(ang) * len * 0.6 + 40 * s;
    ctx.beginPath(); ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx + Math.cos(ang) * len * 0.5, ty + Math.sin(ang) * len * 0.5 - 30 * s, ex, ey);
    ctx.quadraticCurveTo(tx + Math.cos(ang) * len * 0.5, ty + Math.sin(ang) * len * 0.5 - 6 * s, tx, ty);
    ctx.fill();
  }
}
function tent(ctx, x, y, w, h, c1, c2) {
  ctx.fillStyle = c1; ctx.beginPath();
  ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w * 0.3, y - h * 0.85); ctx.quadraticCurveTo(x, y - h * 1.05, x + w * 0.3, y - h * 0.85);
  ctx.lineTo(x + w / 2, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = c2; ctx.beginPath();
  ctx.moveTo(x - w * 0.12, y); ctx.lineTo(x, y - h * 0.62); ctx.lineTo(x + w * 0.12, y); ctx.fill();
}
function pyramid(ctx, x, y, w, c1, c2) {
  ctx.fillStyle = c1; ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x, y - w * 0.62); ctx.lineTo(x + w / 2, y); ctx.fill();
  ctx.fillStyle = c2; ctx.beginPath(); ctx.moveTo(x, y - w * 0.62); ctx.lineTo(x + w / 2, y); ctx.lineTo(x + w * 0.08, y); ctx.fill();
}
function archPath(ctx, x, y, w, h) { // pointed (islamic-like) arch opening, y = bottom
  const r = w * 0.62;
  ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2, y - h + w * 0.55);
  ctx.quadraticCurveTo(x - w / 2, y - h + w * 0.1, x, y - h);
  ctx.quadraticCurveTo(x + w / 2, y - h + w * 0.1, x + w / 2, y - h + w * 0.55);
  ctx.lineTo(x + w / 2, y); ctx.closePath();
}
function lattice(ctx, x, y, w, h, color, a, cell = 34) { // mashrabiya-like pattern clipped by caller
  ctx.strokeStyle = hexA(color, a); ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = -h; i < w + h; i += cell) {
    ctx.moveTo(x + i, y); ctx.lineTo(x + i + h, y + h);
    ctx.moveTo(x + i, y + h); ctx.lineTo(x + i + h, y);
  }
  ctx.stroke();
}
function cow(ctx, x, y, s, color, fat, t, dir = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  const bw = fat ? 100 : 82, bh = fat ? 50 : 30, leg = fat ? 52 : 62;
  const p = t * 3;
  ctx.strokeStyle = color; ctx.lineWidth = fat ? 12 : 8; ctx.lineCap = 'round';
  [[-bw * 0.7, 0], [-bw * 0.5, 3], [bw * 0.55, 1.5], [bw * 0.75, 4.5]].forEach(([lx, ph]) => {
    ctx.beginPath(); ctx.moveTo(lx, -leg); ctx.lineTo(lx + Math.sin(p + ph) * 6, 0); ctx.stroke();
  });
  ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(0, -leg - bh * 0.6, bw, bh, 0, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.moveTo(bw * 0.8, -leg - bh); ctx.quadraticCurveTo(bw * 1.1, -leg - bh * 1.6, bw * 1.25, -leg - bh * 0.9);
  ctx.lineTo(bw * 1.45, -leg - bh * 0.4); ctx.lineTo(bw * 1.32, -leg - bh * 0.1); ctx.lineTo(bw * 0.9, -leg - bh * 0.3); ctx.fill();
  ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(bw * 1.15, -leg - bh * 1.15); ctx.quadraticCurveTo(bw * 1.1, -leg - bh * 1.9, bw * 1.3, -leg - bh * 1.9); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-bw, -leg - bh * 0.7); ctx.quadraticCurveTo(-bw * 1.2, -leg, -bw * 1.1, -leg * 0.5); ctx.lineWidth = 4; ctx.stroke();
  if (!fat) { // ribs
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 3;
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 14, -leg - bh * 1.2); ctx.quadraticCurveTo(i * 14 + 6, -leg - bh * 0.6, i * 14, -leg - bh * 0.1); ctx.stroke(); }
  }
  ctx.restore();
}
function wheat(ctx, x, y, s, color, dry = false, t = 0) {
  const r = rng(Math.floor(x * 13 + y));
  for (let i = 0; i < 7; i++) {
    const bx = x + (i - 3) * 14 * s, bend = Math.sin(t + i) * 6 * s + (dry ? 40 * s : 0);
    const top = y - (180 + r() * 60) * s * (dry ? 0.75 : 1);
    ctx.strokeStyle = color; ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.moveTo(bx, y); ctx.quadraticCurveTo(bx, (y + top) / 2, bx + bend, top); ctx.stroke();
    ctx.fillStyle = color;
    for (let k = 0; k < 6; k++) {
      const ky = top + k * 9 * s, kx = bx + bend * (1 - k * 0.08);
      ctx.beginPath(); ctx.ellipse(kx - 5 * s, ky, 4 * s, 8 * s, -0.5, 0, 6.283); ctx.fill();
      ctx.beginPath(); ctx.ellipse(kx + 5 * s, ky, 4 * s, 8 * s, 0.5, 0, 6.283); ctx.fill();
    }
  }
}

// ---------- characters ----------
// Detailed faceless figures: layered clothes (long thobe + open cloak with trim), sash, folds, wide sleeves, hands,
// sandals, head cloth, soft contact shadow, breathing, wind in the cloth, real walk cycle.
// Prophets (prophet: true): white garments and the face entirely hidden under a veil of white light (as in episode 1).
function limb(ctx, p0, p1, p2, w0, w1, color, n = 10) { // tapered quadratic "tube" (sleeves, legs, necks)
  const L = [], R = [];
  for (let i = 0; i <= n; i++) {
    const q = i / n, a = (1 - q) * (1 - q), b = 2 * (1 - q) * q, c = q * q;
    const x = a * p0[0] + b * p1[0] + c * p2[0], y = a * p0[1] + b * p1[1] + c * p2[1];
    const dx = 2 * (1 - q) * (p1[0] - p0[0]) + 2 * q * (p2[0] - p1[0]), dy = 2 * (1 - q) * (p1[1] - p0[1]) + 2 * q * (p2[1] - p1[1]);
    const l = Math.hypot(dx, dy) || 1, w = lerp(w0, w1, q) / 2;
    L.push([x - dy / l * w, y + dx / l * w]); R.push([x + dy / l * w, y - dx / l * w]);
  }
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]);
  L.forEach(p => ctx.lineTo(p[0], p[1])); R.reverse().forEach(p => ctx.lineTo(p[0], p[1])); ctx.closePath(); ctx.fill();
}
function hand(ctx, x, y, ang, skin, s = 1, open = false) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(0, 7, 7.5, 10.5, 0, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.ellipse(open ? 9 : 6, 2, 3.2, 6, open ? -0.9 : -0.4, 0, 6.283); ctx.fill(); // thumb
  ctx.strokeStyle = mix(skin, '#000000', 0.3); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-3, 12); ctx.lineTo(-2, 16); ctx.moveTo(1, 12); ctx.lineTo(1.5, 17); ctx.stroke();
  ctx.restore();
}
function sandal(ctx, x, y, lift, skin) {
  ctx.fillStyle = mix(skin, '#000000', 0.12); ctx.fillRect(x - 6, y - 18 - lift, 12, 16); // ankle
  ctx.fillStyle = '#3a2618'; ctx.beginPath(); ctx.ellipse(x + 4, y - 3 - lift, 16, 5, 0, 0, 6.283); ctx.fill(); // sole
  ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(x + 6, y - 7 - lift, 13, 5.5, 0, 0, 6.283); ctx.fill(); // foot
  ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 2, y - 11 - lift); ctx.lineTo(x + 12, y - 4 - lift); ctx.stroke();
}
function headCloth(ctx, hx, hy, r, wrap, light, o) { // ghutra / turban framing a faceless head
  const dk = mix(wrap, '#000000', 0.22), lt = mix(wrap, '#ffffff', 0.25 * light);
  const g = ctx.createLinearGradient(hx - r * 1.6, 0, hx + r * 1.4, 0); g.addColorStop(0, dk); g.addColorStop(0.6, wrap); g.addColorStop(1, lt);
  ctx.fillStyle = g; ctx.beginPath();
  ctx.moveTo(hx + r * 0.95, hy - r * 0.35);
  ctx.bezierCurveTo(hx + r * 0.9, hy - r * 1.5, hx - r * 1.3, hy - r * 1.55, hx - r * 1.25, hy - r * 0.1);
  ctx.bezierCurveTo(hx - r * 1.35, hy + r * 1.3, hx - r * 1.9, hy + r * 2.4, hx - r * 2.05, hy + r * 3.3 + (o.flap || 0)); // falls on the back
  ctx.lineTo(hx - r * 0.7, hy + r * 2.7);
  ctx.bezierCurveTo(hx - r * 0.75, hy + r * 1.6, hx - r * 0.5, hy + r * 0.6, hx - r * 0.35, hy - r * 0.25); // edge on the far cheek
  ctx.quadraticCurveTo(hx + r * 0.3, hy - r * 0.55, hx + r * 0.95, hy - r * 0.35); ctx.closePath(); ctx.fill();
  // front drape over the near shoulder
  ctx.beginPath(); ctx.moveTo(hx + r * 0.78, hy + r * 0.62); ctx.quadraticCurveTo(hx + r * 1.3, hy + r * 1.5, hx + r * 1.15, hy + r * 2.9);
  ctx.lineTo(hx + r * 0.45, hy + r * 2.5); ctx.quadraticCurveTo(hx + r * 0.75, hy + r * 1.6, hx + r * 0.5, hy + r * 0.95); ctx.closePath(); ctx.fill();
  ctx.fillStyle = lt; ctx.beginPath(); ctx.moveTo(hx + r * 0.95, hy - r * 0.35); ctx.quadraticCurveTo(hx + r * 0.3, hy - r * 0.62, hx - r * 0.35, hy - r * 0.25);
  ctx.quadraticCurveTo(hx + r * 0.3, hy - r * 0.42, hx + r * 0.95, hy - r * 0.2); ctx.closePath(); ctx.fill(); // brow edge of the cloth
  ctx.strokeStyle = hexA(dk, 0.5); ctx.lineWidth = 2; ctx.beginPath(); // folds
  ctx.moveTo(hx - r * 0.9, hy + r * 0.2); ctx.quadraticCurveTo(hx - r * 1.2, hy + r * 1.6, hx - r * 1.6, hy + r * 2.8);
  ctx.moveTo(hx - r * 0.4, hy - r * 1.0); ctx.quadraticCurveTo(hx - r * 0.9, hy - r * 0.6, hx - r * 1.0, hy + r * 0.1); ctx.stroke();
  if (o.agal) { ctx.strokeStyle = '#1c1612'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(hx - r * 0.15, hy - r * 0.78, r * 1.05, r * 0.28, -0.12, Math.PI * 0.95, Math.PI * 2.05); ctx.stroke(); }
  if (o.turban) { ctx.fillStyle = lt; ctx.beginPath(); ctx.ellipse(hx - r * 0.1, hy - r * 0.95, r * 1.12, r * 0.5, -0.1, 0, 6.283); ctx.fill();
    ctx.strokeStyle = hexA(dk, 0.45); ctx.lineWidth = 2; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.ellipse(hx - r * 0.1, hy - r * (0.75 + k * 0.18), r * 1.05, r * 0.3, -0.1, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); } }
}
function faceless(ctx, hx, hy, r, skin, prophet, covered, wrap) {
  if (prophet) { // veil of white light: no face, no features, ever
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(ctx, hx + 3, hy, r * 3.0, '#fff6dc', 0.6); ctx.restore();
    const g = ctx.createRadialGradient(hx + 3, hy, 0, hx + 3, hy, r * 1.5);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.7, 'rgba(255,253,245,0.98)'); g.addColorStop(1, 'rgba(255,250,235,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx + 3, hy, r * 1.5, 0, 6.283); ctx.fill();
    return;
  }
  // a plain oval, no features, almost entirely in the shadow of the head cloth (only a soft rim catches the light)
  const g = ctx.createLinearGradient(hx - r, hy - r, hx + r, hy + r);
  g.addColorStop(0, mix(skin, '#000000', 0.7)); g.addColorStop(0.6, mix(skin, '#000000', 0.52)); g.addColorStop(1, mix(skin, '#000000', 0.3));
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(hx + 3, hy + 2, r * 0.82, r, 0.05, 0, 6.283); ctx.fill();
  const sh = ctx.createLinearGradient(0, hy - r, 0, hy + r); sh.addColorStop(0, 'rgba(12,7,4,0.75)'); sh.addColorStop(0.65, 'rgba(12,7,4,0.35)'); sh.addColorStop(1, 'rgba(12,7,4,0.1)');
  ctx.fillStyle = sh; ctx.beginPath(); ctx.ellipse(hx + 3, hy + 2, r * 0.83, r * 1.01, 0.05, 0, 6.283); ctx.fill();
  if (covered) { ctx.fillStyle = mix(wrap, '#000000', 0.15); ctx.beginPath(); ctx.ellipse(hx + 2, hy + 3, r * 1.25, r * 1.35, 0, 0, 6.283); ctx.fill(); }
}
function figureRaw(ctx, o) {
  const { x, y, h = 300, dir = 1, pose = 'stand', robe = '#d9d2c3', wrap = '#efe9dc', skin = '#c48e66',
    prophet = false, child = false, walk = null, staff = false, light = 1, band = null, hood = true, alpha = 1, armUp = 0,
    covered = false, t = 0, wind = 0, shadow = true, trim = null, inner = null, dua = false, reach = 0, lantern = false,
    agal = !prophet && !child, turn = 0 } = o;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y);
  if (shadow && pose !== 'lie') { ctx.fillStyle = `rgba(10,6,4,${0.28 * Math.min(1, light + 0.3)})`; ctx.beginPath(); ctx.ellipse(0, 1, h * 0.26, h * 0.035, 0, 0, 6.283); ctx.fill(); }
  ctx.scale(dir, 1); const s = h / 300; ctx.scale(s, s);
  if (child) { ctx.scale(0.82, 0.82); }
  const cloak = robe, cShade = mix(robe, '#000000', 0.32), cLit = mix(robe, '#ffffff', 0.16 * light);
  const thobe = inner || (prophet ? '#f7f4ec' : mix(wrap, '#ffffff', 0.35)), tShade = mix(thobe, '#000000', 0.2);
  const trimC = trim || band || mix(robe, '#000000', 0.45);
  const walking = walk !== null, ph = walking ? walk * Math.PI * 2 : 0, S = Math.sin(ph);
  const breathe = 1 + 0.008 * Math.sin(t * 1.7 + x * 0.01), wv = (k) => Math.sin(t * 2.3 + k) * wind * 5;
  const headR = child ? 25 : 21;
  let hx = 0, hy;
  const grad = (x0, x1, a, b, c) => { const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, a); g.addColorStop(0.55, b); g.addColorStop(1, c); return g; };
  if (pose === 'stand') {
    hy = -268 + (walking ? -Math.abs(Math.sin(ph)) * 4 : 0);
    ctx.translate(0, walking ? -Math.abs(S) * 3 : 0);
    // legs & sandals
    const st = walking ? 22 : 9, lift1 = walking ? Math.max(0, Math.cos(ph)) * 7 : 0, lift2 = walking ? Math.max(0, -Math.cos(ph)) * 7 : 0;
    sandal(ctx, -st * S - (walking ? 0 : 9), 0, lift2, skin); sandal(ctx, st * S + (walking ? 6 : 12), 0, lift1, skin);
    // far arm (behind the body)
    const swing = walking ? -S * 0.5 : 0;
    if (!dua) { limb(ctx, [-34, -224], [-50, -170], [-46 - swing * 30, -116], 28, 24, cShade); hand(ctx, -46 - swing * 30, -118, 0.1, mix(skin, '#000000', 0.2), 0.95); }
    // thobe (long inner robe)
    ctx.save(); ctx.scale(breathe, 1);
    ctx.fillStyle = grad(-50, 50, tShade, thobe, mix(thobe, '#ffffff', 0.2 * light)); ctx.beginPath();
    ctx.moveTo(-36, -232); ctx.quadraticCurveTo(0, -244, 36, -232);
    ctx.quadraticCurveTo(46, -120, 50 + S * 6 + wv(1), -14); ctx.quadraticCurveTo(0, -8 + S * 3, -50 + S * 6 + wv(2), -14);
    ctx.quadraticCurveTo(-46, -120, -36, -232); ctx.fill();
    ctx.strokeStyle = hexA(tShade, 0.6); ctx.lineWidth = 2.5; ctx.beginPath(); // thobe folds
    ctx.moveTo(-4, -140); ctx.quadraticCurveTo(-6 + S * 4, -70, -10 + S * 8, -16); ctx.moveTo(14, -140); ctx.quadraticCurveTo(16 + S * 3, -70, 20 + S * 7, -16); ctx.stroke();
    // cloak: two panels open on the front (3/4 view), trimmed edges, folds
    const bot = -26, hemL = -66 + S * 7 + wv(3), hemR = 64 + S * 7 + wv(4);
    ctx.fillStyle = grad(-66, 66, cShade, cloak, cLit);
    ctx.beginPath(); ctx.moveTo(-44, -230); ctx.quadraticCurveTo(-30, -246, -6, -240); // left panel
    ctx.quadraticCurveTo(-10, -150, -14 + S * 4, bot + 4); ctx.lineTo(hemL, bot + wv(5)); ctx.quadraticCurveTo(-60, -130, -44, -230); ctx.fill();
    ctx.beginPath(); ctx.moveTo(44, -230); ctx.quadraticCurveTo(30, -246, 12, -240); // right panel
    ctx.quadraticCurveTo(22, -150, 26 + S * 4, bot + 4); ctx.lineTo(hemR, bot + wv(6)); ctx.quadraticCurveTo(62, -130, 44, -230); ctx.fill();
    ctx.strokeStyle = trimC; ctx.lineWidth = 4; ctx.beginPath(); // trim on the opening
    ctx.moveTo(-6, -240); ctx.quadraticCurveTo(-10, -150, -14 + S * 4, bot + 4); ctx.moveTo(12, -240); ctx.quadraticCurveTo(22, -150, 26 + S * 4, bot + 4); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,0.16)'; ctx.lineWidth = 3; ctx.beginPath(); // cloak folds
    ctx.moveTo(-34, -200); ctx.quadraticCurveTo(-40, -110, -46 + S * 5, bot); ctx.moveTo(-22, -170); ctx.quadraticCurveTo(-24, -90, -30 + S * 5, bot + 2);
    ctx.moveTo(38, -190); ctx.quadraticCurveTo(44, -110, 50 + S * 5, bot); ctx.stroke();
    ctx.strokeStyle = `rgba(255,250,235,${0.16 * light})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(46, -222); ctx.quadraticCurveTo(58, -130, 62 + S * 6, bot); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,0.07)'; ctx.lineWidth = 2; ctx.beginPath(); // woven stripes
    [-40, -31, 33, 41].forEach(sx => { ctx.moveTo(sx, -222); ctx.quadraticCurveTo(sx * 1.12, -120, sx * 1.3 + S * 5, bot); }); ctx.stroke();
    ctx.fillStyle = mix(trimC, '#ffffff', 0.35); // embroidery along the opening
    for (let k = 1; k < 10; k++) { const q = k / 10; ctx.beginPath(); ctx.arc(lerp(-6, -14 + S * 4, q) - 3, lerp(-240, bot + 4, q), 1.6, 0, 6.283); ctx.arc(lerp(12, 26 + S * 4, q) + 3, lerp(-240, bot + 4, q), 1.6, 0, 6.283); ctx.fill(); }
    ctx.strokeStyle = trimC; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(hemL + 2, bot + wv(5) - 3); ctx.lineTo(-14 + S * 4, bot + 1); ctx.moveTo(26 + S * 4, bot + 1); ctx.lineTo(hemR - 2, bot + wv(6) - 3); ctx.stroke(); // hem band
    // sash at the waist (visible in the opening)
    ctx.fillStyle = band || mix(robe, '#000000', 0.15); ctx.fillRect(-10, -156, 34, 11);
    ctx.fillRect(4, -147, 6, 34 + wv(7)); ctx.fillRect(12, -147, 5, 26 + wv(8));
    ctx.restore();
    // near arm
    const sh = [38, -224];
    let hp, ha = 0.15, open = false;
    if (dua) { hp = [30, -196]; ha = -2.6; open = true; }
    else if (staff) hp = [56, -150];
    else if (lantern) hp = [58, -132];
    else if (armUp > 0) { hp = [lerp(48, 82, armUp), lerp(-112, -300, armUp)]; ha = lerp(0.15, -2.9, armUp); open = armUp > 0.4; }
    else if (reach > 0) { hp = [lerp(48, 100, reach), lerp(-112, -180, reach)]; ha = lerp(0.15, -1.4, reach); open = true; }
    else hp = [48 + swing * 30, -114];
    const el = [lerp(sh[0], hp[0], 0.5) + (armUp > 0.3 || dua ? 18 : 12), lerp(sh[1], hp[1], 0.5) + (armUp > 0.3 ? 14 : 4)];
    if (staff) { ctx.strokeStyle = '#5a3d27'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(62, -300); ctx.lineTo(70, 0); ctx.stroke();
      ctx.strokeStyle = '#7a5537'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(60, -296); ctx.lineTo(66, -60); ctx.stroke(); }
    if (lantern) { ctx.strokeStyle = '#3a2614'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(hp[0] + 2, hp[1] + 14); ctx.lineTo(hp[0] + 2, hp[1] + 34); ctx.stroke();
      lanternBox(ctx, hp[0] + 2, hp[1] + 58, 0.9, t); }
    limb(ctx, sh, el, [hp[0], hp[1] - 6], 30, 26, cloak);
    ctx.fillStyle = cShade; ctx.beginPath(); ctx.ellipse(hp[0], hp[1] - 6, 13, 7, ha + 1.57, 0, 6.283); ctx.fill(); // cuff opening
    hand(ctx, hp[0], hp[1] - 2, ha, skin, 1, open);
    if (dua) { limb(ctx, [-30, -222], [-12, -186], [-2, -196], 26, 22, cShade); hand(ctx, -2, -194, -2.4, skin, 0.95, true); }
    if (staff) { ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(hp[0] + 4, hp[1] + 4, 8, 10, 0, 0, 6.283); ctx.fill(); }
  } else if (pose === 'sit') {
    hy = -192;
    ctx.fillStyle = grad(-90, 90, cShade, cloak, cLit); ctx.beginPath(); // crossed legs + cloak spread on the ground
    ctx.moveTo(-36, -150); ctx.quadraticCurveTo(-40, -166, -8, -170); ctx.lineTo(10, -170); ctx.quadraticCurveTo(38, -166, 40, -148);
    ctx.quadraticCurveTo(48, -64, 66, -46); ctx.quadraticCurveTo(104, -30, 96, -2); ctx.lineTo(-90, -2); ctx.quadraticCurveTo(-98, -30, -54, -48); ctx.quadraticCurveTo(-46, -80, -36, -150); ctx.fill();
    ctx.fillStyle = thobe; ctx.beginPath(); ctx.moveTo(-6, -166); ctx.quadraticCurveTo(4, -110, -2, -60); ctx.lineTo(18, -60); ctx.quadraticCurveTo(18, -120, 12, -166); ctx.fill();
    ctx.strokeStyle = trimC; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(-6, -166); ctx.quadraticCurveTo(4, -110, -2, -60); ctx.moveTo(12, -166); ctx.quadraticCurveTo(18, -120, 18, -60); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-70, -30); ctx.quadraticCurveTo(-10, -50, 60, -30); ctx.moveTo(-50, -12); ctx.quadraticCurveTo(0, -26, 70, -10); ctx.stroke();
    limb(ctx, [30, -160], [56, -110], [44, -62], 26, 22, cShade); hand(ctx, 44, -62, 0.4, skin);
    if (dua) { limb(ctx, [30, -160], [50, -130], [34, -140], 26, 22, cloak); hand(ctx, 34, -140, -2.6, skin, 1, true); }
  } else if (pose === 'kneel') {
    hy = -205;
    ctx.fillStyle = grad(-80, 90, cShade, cloak, cLit); ctx.beginPath();
    ctx.moveTo(-34, -165); ctx.quadraticCurveTo(-34, -180, -8, -182); ctx.lineTo(8, -182); ctx.quadraticCurveTo(34, -180, 36, -162);
    ctx.quadraticCurveTo(44, -80, 84, -44); ctx.quadraticCurveTo(98, -18, 88, -2); ctx.lineTo(-70, -2); ctx.quadraticCurveTo(-82, -50, -34, -165); ctx.fill();
    ctx.fillStyle = thobe; ctx.beginPath(); ctx.moveTo(-4, -180); ctx.quadraticCurveTo(6, -120, 2, -70); ctx.lineTo(20, -70); ctx.quadraticCurveTo(20, -130, 12, -180); ctx.fill();
    ctx.strokeStyle = trimC; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(-4, -180); ctx.quadraticCurveTo(6, -120, 2, -70); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-50, -40); ctx.quadraticCurveTo(10, -60, 76, -30); ctx.moveTo(-30, -120); ctx.quadraticCurveTo(-40, -70, -56, -20); ctx.stroke();
    sandal(ctx, -78, 0, 0, skin);
    if (dua) { limb(ctx, [30, -172], [58, -150], [44, -186], 28, 24, cloak); hand(ctx, 44, -184, -2.6, skin, 1, true);
      limb(ctx, [-24, -172], [6, -150], [10, -184], 26, 22, cShade); hand(ctx, 10, -182, -2.4, skin, 0.95, true); }
    else { limb(ctx, [30, -172], [54, -120], [62, -82], 28, 24, cloak); hand(ctx, 62, -80, 0.3, skin); }
  } else if (pose === 'prostrate') {
    hy = -26; hx = 92;
    const g = ctx.createLinearGradient(0, -130, 0, 0); g.addColorStop(0, cLit); g.addColorStop(1, cShade);
    ctx.fillStyle = g; ctx.beginPath();
    ctx.moveTo(-74, -2); ctx.quadraticCurveTo(-94, -112, -20, -120); ctx.quadraticCurveTo(52, -118, 82, -42); ctx.lineTo(98, -4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-60, -60); ctx.quadraticCurveTo(-10, -100, 50, -70); ctx.moveTo(-40, -20); ctx.quadraticCurveTo(10, -50, 70, -30); ctx.stroke();
    sandal(ctx, -82, 0, 0, skin);
    limb(ctx, [50, -70], [96, -40], [126, -6], 24, 20, cShade); hand(ctx, 128, -8, -1.4, skin);
  } else if (pose === 'lie') { // sleeping on side
    hy = -34; hx = -110;
    ctx.fillStyle = `rgba(10,6,4,0.22)`; ctx.beginPath(); ctx.ellipse(0, 0, 140, 12, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = grad(-90, 120, cShade, cloak, cLit); ctx.beginPath();
    ctx.moveTo(-90, -4); ctx.quadraticCurveTo(-96, -66, -40, -62); ctx.quadraticCurveTo(40, -72, 100, -40);
    ctx.quadraticCurveTo(132, -22, 122, -4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-60, -40); ctx.quadraticCurveTo(10, -56, 90, -30); ctx.stroke();
    ctx.fillStyle = cShade; ctx.beginPath(); ctx.moveTo(-90, -4); ctx.quadraticCurveTo(10, -30, 122, -4); ctx.fill();
    sandal(ctx, 118, 0, 0, skin);
  }
  // head: faceless (or veiled in light) + head cloth
  const flap = wv(9) * 1.5;
  if (pose === 'prostrate') { // forehead on the ground: only the covered head is seen
    ctx.fillStyle = wrap; ctx.beginPath(); ctx.ellipse(hx - 4, hy - 2, headR * 1.15, headR * 0.95, 0.3, 0, 6.283); ctx.fill();
    ctx.fillStyle = mix(wrap, '#000000', 0.25); ctx.beginPath(); ctx.ellipse(hx - 16, hy + 6, headR * 0.9, headR * 0.6, 0.3, 0, 6.283); ctx.fill();
    if (prophet) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, hx, hy, headR * 2.6, '#fff6dc', 0.5); ctx.restore(); }
    ctx.restore(); return;
  }
  ctx.fillStyle = prophet ? mix(wrap, '#000000', 0.1) : mix(skin, '#000000', 0.3); ctx.fillRect(hx - 8, hy + headR * 0.6, 16, headR * 0.9);
  if (prophet) { headCloth(ctx, hx, hy, headR, wrap, light, { flap, turban: true });
    if (o.veilOut) { const m = ctx.getTransform(), p = m.transformPoint(new DOMPoint(hx, hy)); _veil = { x: p.x, y: p.y, r: headR * Math.hypot(m.a, m.b) }; } // drawn after the outline pass
    else faceless(ctx, hx, hy, headR, skin, true, false, wrap); }
  else {
    faceless(ctx, hx, hy, headR, skin, false, covered, wrap);
    if (hood) headCloth(ctx, hx, hy, headR, wrap, light, { flap, agal });
  }
  ctx.restore();
}

// Inked look: each figure is drawn on its own layer, then put on the scene with a thin soft dark contour
// (drop-shadow filter). The prophet's veil of light is drawn afterwards on the scene, so it is never outlined.
let _veil = null; const _figCv = document.createElement('canvas');
function figure(ctx, o) {
  const h = o.h || 300, x = o.x, y = o.y, padX = 0.8 * h + 70, x0 = x - padX, y0 = y - 1.3 * h - 70;
  const w = Math.ceil(padX * 2), hh = Math.ceil(1.3 * h + 70 + 0.15 * h + 30);
  if (_figCv.width < w || _figCv.height < hh) { _figCv.width = Math.max(_figCv.width, w); _figCv.height = Math.max(_figCv.height, hh); }
  const c2 = _figCv.getContext('2d'); c2.setTransform(1, 0, 0, 1, 0, 0); c2.globalAlpha = 1; c2.globalCompositeOperation = 'source-over'; c2.filter = 'none';
  c2.clearRect(0, 0, w, hh); c2.translate(-x0, -y0);
  _veil = null; figureRaw(c2, Object.assign({}, o, { veilOut: true }));
  const ink = o.ink === undefined ? 1 : o.ink;
  ctx.save(); if (ink > 0) ctx.filter = `drop-shadow(0 0 ${1.4 * ink}px rgba(28,15,8,0.9))`;
  ctx.drawImage(_figCv, 0, 0, w, hh, x0, y0, w, hh); ctx.restore();
  if (_veil) { ctx.save(); ctx.globalAlpha *= (o.alpha === undefined ? 1 : o.alpha); faceless(ctx, x0 + _veil.x - 3, y0 + _veil.y, _veil.r, '#000000', true); ctx.restore(); }
}
function lanternBox(ctx, x, y, s, t, k = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, 0, 120, '#ffc070', 0.5 + 0.08 * Math.sin(t * 8 + k)); ctx.restore();
  ctx.fillStyle = '#3e2814'; ctx.beginPath(); ctx.moveTo(-14, -22); ctx.lineTo(14, -22); ctx.lineTo(8, -30); ctx.lineTo(-8, -30); ctx.fill(); ctx.fillRect(-14, 18, 28, 6);
  ctx.fillStyle = '#ffe2a0'; ctx.fillRect(-11, -22, 22, 40); ctx.fillStyle = '#fff6d8'; ctx.beginPath(); ctx.ellipse(0, 0, 4, 9, 0, 0, 6.283); ctx.fill();
  ctx.strokeStyle = '#3e2814'; ctx.lineWidth = 2.5; ctx.strokeRect(-11, -22, 22, 40); ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(0, 18); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -34, 8, Math.PI, 0); ctx.stroke();
  ctx.restore();
}
// Dromedary with jointed legs, real walk cycle, shading, ears, tufted tail. Same placement as before (feet on y).
function camel(ctx, x, y, s, color, t, dir = 1, load = null, o = {}) {
  ctx.save(); ctx.translate(x, y);
  if (o.shadow !== false) { ctx.fillStyle = 'rgba(10,6,4,0.25)'; ctx.beginPath(); ctx.ellipse(10 * s * dir, 2, 150 * s, 13 * s, 0, 0, 6.283); ctx.fill(); }
  ctx.scale(s * dir, s);
  const dk = mix(color, '#000000', 0.3), dk2 = mix(color, '#000000', 0.45), lt = mix(color, '#ffffff', 0.22);
  const walking = o.walk !== false, p = t * 3.0, bob = walking ? Math.sin(p * 2) * 3 : 0, head = o.head || 0; // head: 0 up, 1 down (grazing/drinking)
  const leg = (hipX, hipY, ph, far) => {
    const sw = walking ? Math.sin(p + ph) : 0, lift = walking ? Math.max(0, Math.cos(p + ph)) : 0;
    const knee = [hipX + sw * 16, -58 - lift * 10], foot = [hipX + sw * 30 + lift * 6, -lift * 12];
    const c = far ? dk2 : dk;
    const rear = hipX < 0;
    limb(ctx, [hipX + (rear ? -6 : 4), hipY - 10], [hipX + sw * 8 + (rear ? 10 : 0), (hipY + knee[1]) / 2], knee, rear ? 46 : 34, 15, c);
    limb(ctx, knee, [(knee[0] + foot[0]) / 2, (knee[1] + foot[1]) / 2], [foot[0], foot[1] - 6], 13, 9, c);
    ctx.fillStyle = mix(c, '#000000', 0.1); ctx.beginPath(); ctx.ellipse(knee[0], knee[1], 8, 7, 0, 0, 6.283); ctx.fill(); // knee
    ctx.fillStyle = mix(c, '#000000', 0.25); ctx.beginPath(); ctx.ellipse(foot[0] + 5, foot[1] - 4, 15, 6, 0, 0, 6.283); ctx.fill(); // pad
  };
  ctx.translate(0, bob);
  leg(-48, -120, Math.PI, true); leg(52, -118, 0, true);
  // tail
  const tw = Math.sin(t * 2.2) * 0.25;
  ctx.save(); ctx.translate(-92, -150); ctx.rotate(0.35 + tw); ctx.strokeStyle = dk; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-8, 30, -4, 62); ctx.stroke(); ctx.fillStyle = dk2; ctx.beginPath(); ctx.ellipse(-4, 70, 6, 13, 0, 0, 6.283); ctx.fill(); ctx.restore();
  // body + hump
  const g = ctx.createLinearGradient(0, -260, 0, -100); g.addColorStop(0, lt); g.addColorStop(0.5, color); g.addColorStop(1, dk);
  ctx.fillStyle = g; ctx.beginPath();
  ctx.moveTo(-92, -146);
  ctx.bezierCurveTo(-100, -190, -60, -205, -40, -208); ctx.bezierCurveTo(-20, -262, 40, -262, 56, -206); // hump
  ctx.bezierCurveTo(78, -200, 92, -186, 96, -160);
  ctx.bezierCurveTo(98, -132, 84, -112, 60, -108); ctx.bezierCurveTo(20, -100, -30, -100, -60, -110);
  ctx.bezierCurveTo(-80, -116, -90, -128, -92, -146); ctx.closePath(); ctx.fill();
  ctx.fillStyle = hexA(dk, 0.35); ctx.beginPath(); ctx.ellipse(10, -112, 70, 14, 0, 0, 6.283); ctx.fill(); // belly shade
  ctx.strokeStyle = hexA(lt, 0.7); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-34, -214); ctx.bezierCurveTo(-16, -256, 36, -258, 50, -214); ctx.stroke(); // rim light
  if (load) { ctx.fillStyle = load; ctx.beginPath(); ctx.roundRect(-40, -238, 84, 46, 10); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(-40, -212, 84, 7); }
  if (o.blanket) { ctx.fillStyle = o.blanket; ctx.beginPath(); ctx.moveTo(-36, -214); ctx.quadraticCurveTo(6, -236, 50, -212); ctx.lineTo(56, -160); ctx.lineTo(-42, -160); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e9c46a'; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.arc(-34 + k * 17, -162, 4, 0, 6.283); ctx.fill(); } }
  // neck + head (head lowers when drinking)
  const nb = [88, -168], hd = [lerp(150, 170, head), lerp(-262, -60, head)], nm = [lerp(140, 150, head), lerp(-170, -110, head)];
  limb(ctx, nb, nm, [hd[0] - 6, hd[1] + 14], 46, 26, color);
  ctx.save(); ctx.translate(hd[0], hd[1]); ctx.rotate(lerp(0.05, 1.2, head));
  ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(6, 4, 24, 16, 0.15, 0, 6.283); ctx.fill(); // skull
  ctx.beginPath(); ctx.moveTo(10, -6); ctx.quadraticCurveTo(44, -2, 50, 12); ctx.quadraticCurveTo(44, 26, 14, 20); ctx.closePath(); ctx.fill(); // muzzle
  ctx.fillStyle = dk; ctx.beginPath(); ctx.ellipse(-8, -12, 5, 9, -0.6, 0, 6.283); ctx.fill(); // ear
  ctx.fillStyle = '#1a120c'; ctx.beginPath(); ctx.ellipse(12, -2, 3.2, 2.6, 0, 0, 6.283); ctx.fill(); // eye
  ctx.strokeStyle = dk2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(44, 6); ctx.lineTo(48, 4); ctx.moveTo(30, 20); ctx.quadraticCurveTo(40, 22, 48, 16); ctx.stroke();
  if (o.halter) { ctx.strokeStyle = o.halter; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(28, 8, 14, 15, 0, 0, 6.283); ctx.stroke(); }
  ctx.restore();
  leg(-58, -118, 0, false); leg(62, -116, Math.PI, false);
  ctx.fillStyle = hexA(dk, 0.5); ctx.beginPath(); ctx.ellipse(70, -112, 16, 8, 0, 0, 6.283); ctx.fill(); // chest pad
  ctx.restore();
}

// ---------- post / overlays ----------
const grainCanvas = document.createElement('canvas');
(function makeGrain() {
  grainCanvas.width = grainCanvas.height = 512;
  const g = grainCanvas.getContext('2d'), im = g.createImageData(512, 512), r = rng(42);
  for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  g.putImageData(im, 0, 0);
})();
function post(ctx, t, grade) {
  if (grade) { ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = grade; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  const v = ctx.createRadialGradient(W / 2, H * 0.46, H * 0.28, W / 2, H * 0.5, H * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(10,6,4,0.62)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  // static, almost invisible dither (only to avoid gradient banding). The old animated grain flickered
  // and read as a grey "sizzle" over the picture, so it is gone.
  ctx.save(); ctx.globalAlpha = 0.012; ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(grainCanvas, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
}
function textGlow(ctx, txt, x, y, font, color, a, glowColor = color, blur = 26) {
  ctx.save(); ctx.globalAlpha = a; ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = glowColor; ctx.shadowBlur = blur; ctx.fillStyle = color; ctx.fillText(txt, x, y);
  ctx.shadowBlur = 0; ctx.fillText(txt, x, y); ctx.restore();
}
// Arabic caption (like the reference posts): golden glowing line, appears with a soft rise
function arabicCaption(ctx, txt, t, t0, t1, y = 330, size = 92, color = '#f6c453') {
  const a = seg(t, t0, t0 + 0.8) * (1 - seg(t, t1 - 0.6, t1));
  if (a <= 0) return;
  ctx.save(); ctx.direction = 'rtl';
  textGlow(ctx, txt, W / 2, y + (1 - easeOut(seg(t, t0, t0 + 0.8))) * 30, `700 ${size}px Amiri`, color, a, '#ffb300', 30);
  ctx.restore();
}
function subtitles(ctx, t, cues) {
  const c = cues.find(c => t >= c.start && t < c.end);
  if (!c) return;
  const a = seg(t, c.start, c.start + 0.18) * (1 - seg(t, c.end - 0.15, c.end));
  ctx.save(); ctx.font = '600 54px Lora'; ctx.textBaseline = 'middle';
  const lh = 74, n = c.lines.length, y0 = 1470 - (n - 1) * lh / 2;
  c.lines.forEach((idxs, li) => {
    const parts = idxs.map(i => c.words[i]);
    const widths = parts.map(p => ctx.measureText(p.w).width), space = ctx.measureText(' ').width;
    const total = widths.reduce((s, w) => s + w, 0) + space * (parts.length - 1);
    let x = W / 2 - total / 2; const y = y0 + li * lh;
    parts.forEach((p, k) => {
      const spoken = t >= p.s, cur = spoken && (k === parts.length - 1 && li === n - 1 ? true : (() => {
        const nextIdx = idxs[k + 1] !== undefined ? idxs[k + 1] : (c.lines[li + 1] || [])[0];
        return nextIdx === undefined || t < c.words[nextIdx].s; })());
      ctx.globalAlpha = a;
      ctx.lineJoin = 'round'; ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(12,8,6,0.82)';
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.strokeText(p.w, x, y); ctx.shadowBlur = 0;
      ctx.fillStyle = cur ? '#ffd27a' : (spoken ? '#ffffff' : 'rgba(255,255,255,0.78)');
      ctx.fillText(p.w, x, y);
      x += widths[k] + space;
    });
  });
  ctx.restore();
}
