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
function camel(ctx, x, y, s, color, t, dir = 1, load = null) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  const p = t * 3.2;
  ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineWidth = 11;
  [[-55, 0], [-35, Math.PI], [40, Math.PI * 0.5], [60, Math.PI * 1.5]].forEach(([lx, ph]) => {
    const sw = Math.sin(p + ph) * 14;
    ctx.beginPath(); ctx.moveTo(lx, -120); ctx.lineTo(lx + sw * 0.5, -60); ctx.lineTo(lx + sw, 0); ctx.stroke();
  });
  ctx.fillStyle = color; ctx.beginPath();
  ctx.moveTo(-80, -130); ctx.quadraticCurveTo(-70, -200, -20, -205); ctx.quadraticCurveTo(10, -250, 50, -200);
  ctx.quadraticCurveTo(80, -190, 85, -150); ctx.quadraticCurveTo(110, -170, 120, -230);
  ctx.quadraticCurveTo(125, -265, 150, -262); ctx.lineTo(160, -248); ctx.lineTo(140, -240);
  ctx.quadraticCurveTo(140, -170, 90, -112); ctx.quadraticCurveTo(0, -100, -80, -115); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-80, -130); ctx.quadraticCurveTo(-100, -110, -92, -80); ctx.lineWidth = 5; ctx.stroke();
  if (load) {
    ctx.fillStyle = load; ctx.beginPath(); ctx.roundRect(-40, -245, 70, 55, 10); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fillRect(-40, -215, 70, 8);
  }
  ctx.restore();
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
// Faceless figures (flat skin oval, no features). Prophets: face hidden under a soft white light.
function figure(ctx, o) {
  const { x, y, h = 300, dir = 1, pose = 'stand', robe = '#d9d2c3', wrap = '#efe9dc', skin = '#c48e66',
    prophet = false, child = false, walk = null, staff = false, light = 1, band = null, hood = true, alpha = 1, armUp = 0 } = o;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.scale(dir, 1);
  const s = h / 300;
  ctx.scale(s, s);
  const shade = mix(robe, '#000000', 0.22), lit = mix(robe, '#ffffff', 0.18 * light);
  const bob = walk !== null ? Math.abs(Math.sin(walk * Math.PI)) * -5 : 0;
  ctx.translate(0, bob);
  const headR = child ? 27 : 22;
  let headX = 0, headY;
  if (pose === 'stand') {
    headY = child ? -232 : -268;
    const top = child ? -205 : -238, sw = 40, bw = 58;
    // feet
    if (walk !== null) {
      const ph = Math.sin(walk * Math.PI * 2);
      ctx.fillStyle = '#2a211c'; ctx.beginPath(); ctx.ellipse(10 + ph * 16, -2, 15, 6, 0, 0, 6.283); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-10 - ph * 16, -2, 15, 6, 0, 0, 6.283); ctx.fill();
    }
    const sway = walk !== null ? Math.sin(walk * Math.PI * 2) * 7 : 0;
    const g = ctx.createLinearGradient(-bw, 0, bw, 0); g.addColorStop(0, shade); g.addColorStop(0.55, robe); g.addColorStop(1, lit);
    ctx.fillStyle = g; ctx.beginPath();
    ctx.moveTo(-sw, top + 12); ctx.quadraticCurveTo(-sw - 4, top - 4, -10, top - 8); ctx.lineTo(10, top - 8);
    ctx.quadraticCurveTo(sw + 4, top - 4, sw, top + 12);
    ctx.quadraticCurveTo(bw - 6, top * 0.45, bw + sway, -4); ctx.lineTo(-bw + sway, -4);
    ctx.quadraticCurveTo(-bw + 6, top * 0.45, -sw, top + 12); ctx.fill();
    // arm / sleeve
    ctx.fillStyle = shade; ctx.beginPath();
    if (armUp > 0) {
      ctx.moveTo(sw - 14, top + 10); ctx.quadraticCurveTo(sw + 30, top - 20 * armUp, sw + 40, top - 60 * armUp);
      ctx.lineTo(sw + 26, top - 64 * armUp); ctx.quadraticCurveTo(sw + 10, top - 10, sw - 26, top + 30);
    } else {
      ctx.moveTo(sw - 18, top + 10); ctx.quadraticCurveTo(sw + 10, top + 70, sw + 2, top + 120);
      ctx.lineTo(sw - 18, top + 118); ctx.quadraticCurveTo(sw - 14, top + 60, sw - 30, top + 20);
    }
    ctx.fill();
    ctx.fillStyle = skin; ctx.beginPath();
    armUp > 0 ? ctx.arc(sw + 34, top - 66 * armUp, 9, 0, 6.283) : ctx.arc(sw - 7, top + 126, 9, 0, 6.283); ctx.fill();
    if (staff) {
      ctx.strokeStyle = '#5a3d27'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(sw + 4, top - 30); ctx.lineTo(sw + 14, 0); ctx.stroke();
    }
    if (band) { ctx.fillStyle = band; ctx.fillRect(-bw * 0.62, top * 0.42, bw * 1.24, 9); }
  } else if (pose === 'sit') { // seated cross-legged, facing dir
    headY = child ? -170 : -192;
    const top = headY + 32;
    const g = ctx.createLinearGradient(-80, 0, 80, 0); g.addColorStop(0, shade); g.addColorStop(0.6, robe); g.addColorStop(1, lit);
    ctx.fillStyle = g; ctx.beginPath();
    ctx.moveTo(-36, top + 10); ctx.quadraticCurveTo(-36, top - 6, -8, top - 8); ctx.lineTo(8, top - 8); ctx.quadraticCurveTo(36, top - 6, 38, top + 12);
    ctx.quadraticCurveTo(46, -60, 60, -44); ctx.quadraticCurveTo(100, -30, 92, -4); ctx.lineTo(-84, -4);
    ctx.quadraticCurveTo(-92, -30, -50, -48); ctx.quadraticCurveTo(-44, -80, -36, top + 10); ctx.fill();
    ctx.fillStyle = shade; ctx.beginPath(); ctx.moveTo(20, top + 20); ctx.quadraticCurveTo(48, -80, 60, -52); ctx.lineTo(44, -46); ctx.quadraticCurveTo(30, -80, 8, top + 30); ctx.fill();
  } else if (pose === 'prostrate') {
    headY = -26; headX = 92;
    const g = ctx.createLinearGradient(0, -130, 0, 0); g.addColorStop(0, lit); g.addColorStop(1, shade);
    ctx.fillStyle = g; ctx.beginPath();
    ctx.moveTo(-70, -2); ctx.quadraticCurveTo(-90, -110, -20, -118); ctx.quadraticCurveTo(50, -116, 80, -40);
    ctx.lineTo(96, -4); ctx.closePath(); ctx.fill();
  } else if (pose === 'kneel') {
    headY = -205;
    const top = headY + 32;
    const g = ctx.createLinearGradient(-70, 0, 70, 0); g.addColorStop(0, shade); g.addColorStop(0.6, robe); g.addColorStop(1, lit);
    ctx.fillStyle = g; ctx.beginPath();
    ctx.moveTo(-34, top + 10); ctx.quadraticCurveTo(-34, top - 6, -8, top - 8); ctx.lineTo(8, top - 8); ctx.quadraticCurveTo(34, top - 6, 36, top + 12);
    ctx.quadraticCurveTo(44, -70, 78, -40); ctx.quadraticCurveTo(92, -16, 80, -4); ctx.lineTo(-64, -4);
    ctx.quadraticCurveTo(-74, -50, -34, top + 10); ctx.fill();
  } else if (pose === 'lie') { // sleeping on side
    headY = -34; headX = -110;
    ctx.fillStyle = robe; ctx.beginPath();
    ctx.moveTo(-90, -4); ctx.quadraticCurveTo(-96, -66, -40, -62); ctx.quadraticCurveTo(40, -70, 100, -40);
    ctx.quadraticCurveTo(130, -22, 120, -4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = shade; ctx.beginPath(); ctx.moveTo(-90, -4); ctx.quadraticCurveTo(10, -30, 120, -4); ctx.fill();
  }
  // head: skin oval (no features) + head wrap
  ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(headX + 3, headY + 2, headR * 0.86, headR, 0, 0, 6.283); ctx.fill();
  if (hood) {
    ctx.fillStyle = wrap; ctx.beginPath();
    if (pose === 'prostrate') {
      ctx.ellipse(headX - 4, headY - 4, headR * 1.05, headR * 0.95, 0.3, Math.PI * 0.75, Math.PI * 2.05); ctx.fill();
    } else {
      ctx.moveTo(headX + headR * 0.55, headY - headR * 0.55);
      ctx.arc(headX, headY, headR * 1.12, -Math.PI * 0.32, Math.PI * 0.95, true);
      ctx.quadraticCurveTo(headX - headR * 1.5, headY + headR * 2.2, headX - headR * 1.7, headY + headR * 3.2);
      ctx.lineTo(headX - headR * 0.2, headY + headR * 2.2);
      ctx.quadraticCurveTo(headX - headR * 0.5, headY + headR * 0.6, headX - headR * 0.25, headY - headR * 0.2);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = mix(wrap, '#000000', 0.45); ctx.fillRect(headX - headR * 1.0, headY - headR * 0.72, headR * 1.7, headR * 0.18);
    }
  }
  if (prophet) { // white veil of light on the face
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, headX + 4, headY, headR * 2.6, '#fff6dc', 0.55);
    ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createRadialGradient(headX + 4, headY, 0, headX + 4, headY, headR * 1.35);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.65, 'rgba(255,253,245,0.97)'); g.addColorStop(1, 'rgba(255,250,235,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(headX + 4, headY, headR * 1.35, 0, 6.283); ctx.fill();
  }
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
  ctx.save(); ctx.globalAlpha = 0.045; ctx.globalCompositeOperation = 'overlay';
  const f = Math.floor(t * 12), ox = (f * 137) % 512, oy = (f * 251) % 512;
  ctx.fillStyle = ctx.createPattern(grainCanvas, 'repeat');
  ctx.translate(-ox, -oy); ctx.fillRect(0, 0, W + 512, H + 512); ctx.restore();
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
