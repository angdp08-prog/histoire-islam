// Episode 4 — Salih (alayhi salam). The prophet is NEVER drawn (no face, no silhouette): his message is shown as a
// lamp / light, his path as footprints or lanterns. Other people are faceless, as in the rest of the series.

const FOLK = [
  { robe: '#5a4b40', wrap: '#7d6a58', skin: '#9a6a4c' }, { robe: '#46505c', wrap: '#6c7682', skin: '#b07a58' },
  { robe: '#6b5641', wrap: '#9a8468', skin: '#8f5f42' }, { robe: '#4b4038', wrap: '#6f6153', skin: '#a8714f' },
  { robe: '#3f4954', wrap: '#5e6b78', skin: '#94664a' }, { robe: '#5d4a3a', wrap: '#867058', skin: '#b4805c' },
  { robe: '#7a5a6a', wrap: '#5a3a4a', skin: '#c48e66' }, { robe: '#3a5a4a', wrap: '#284034', skin: '#b07a58' },
];
const NOBLE = { robe: '#6a2e2a', wrap: '#8a5a3a', skin: '#a8714f', band: '#c9a14a' };
const CAMEL = '#d9b38a';

function cam(c, z, cx = W / 2, cy = H / 2, dx = 0, dy = 0) { c.translate(W / 2 + dx, H / 2 + dy); c.scale(z, z); c.translate(-cx, -cy); }
function phases(c, t, t0, f, A, B) {
  const k = seg(t, t0, t0 + f);
  if (k < 1) { c.save(); A(c); c.restore(); }
  if (k > 0) layer(c, ease(k), cc => { cc.save(); B(cc); cc.restore(); });
}
function bird(c, x, y, s, ph, color) {
  const f = Math.sin(ph * 9) * 16 * s;
  c.strokeStyle = color; c.lineWidth = 5 * s; c.lineCap = 'round'; c.beginPath();
  c.moveTo(x - 26 * s, y - f); c.quadraticCurveTo(x - 10 * s, y - 6 * s, x, y); c.quadraticCurveTo(x + 10 * s, y - 6 * s, x + 26 * s, y - f); c.stroke();
}
function torch(c, x, y, t, k = 0, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#3a2418'; c.fillRect(-6, -160, 12, 160);
  glow(c, 0, -175, 260, '#ff8a3a', 0.45 + 0.08 * Math.sin(t * 9 + k));
  c.fillStyle = '#ffb347'; c.beginPath(); c.moveTo(-14, -160); c.quadraticCurveTo(Math.sin(t * 8 + k) * 8, -230, 2, -215);
  c.quadraticCurveTo(18, -190, 14, -160); c.fill();
  c.fillStyle = '#ffe39a'; c.beginPath(); c.ellipse(0, -175, 6, 14, 0, 0, 6.283); c.fill();
  c.restore();
}
function lamp(c, x, y, s, t, a = 1) { // small oil lamp: the message brought by the prophet
  c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(s, s);
  glow(c, 0, -40, 260, '#ffb466', 0.5 + 0.06 * Math.sin(t * 7));
  c.fillStyle = '#b07a3a'; c.beginPath(); c.moveTo(-60, 0); c.quadraticCurveTo(-50, -34, 0, -34); c.quadraticCurveTo(46, -34, 80, -20);
  c.lineTo(84, -12); c.quadraticCurveTo(40, 6, 0, 6); c.quadraticCurveTo(-40, 6, -60, 0); c.fill();
  c.fillStyle = '#7a4e22'; c.beginPath(); c.ellipse(0, 4, 36, 8, 0, 0, 6.283); c.fill();
  c.fillStyle = '#ffd890'; c.beginPath(); c.moveTo(74, -22); c.quadraticCurveTo(70 + Math.sin(t * 9) * 4, -70, 82, -78); c.quadraticCurveTo(94, -50, 86, -22); c.fill();
  c.fillStyle = '#fff6d8'; c.beginPath(); c.ellipse(80, -36, 4, 10, 0, 0, 6.283); c.fill();
  c.restore();
}
function lantern(c, x, y, s, t, k = 0, a = 1) { // hand lantern carried by the believers (no one drawn)
  c.save(); c.globalAlpha *= a; c.translate(x, y + Math.sin(t * 2.4 + k) * 4 * s); c.scale(s, s);
  glow(c, 0, 0, 110, '#ffc070', 0.55 + 0.08 * Math.sin(t * 8 + k));
  c.fillStyle = '#4a2e18'; c.fillRect(-14, -24, 28, 6); c.fillRect(-14, 18, 28, 6);
  c.fillStyle = '#ffe2a0'; c.fillRect(-11, -18, 22, 36);
  c.strokeStyle = '#4a2e18'; c.lineWidth = 3; c.beginPath(); c.arc(0, -28, 10, Math.PI, 0); c.stroke();
  c.restore();
}
function cloudBank(c, t, y, n, color, a = 1, seed = 3, drift = 10) {
  const r = rng(seed); c.fillStyle = hexA(color, a);
  for (let i = 0; i < n; i++) {
    const x = ((r() * (W + 600) + t * drift * (0.5 + r())) % (W + 600)) - 300, yy = y + r() * 220, rr = 90 + r() * 140;
    c.beginPath(); c.ellipse(x, yy, rr * 1.6, rr * 0.7, 0, 0, 6.283); c.fill();
  }
}
// sandstone massif: lumpy rounded outcrop (like the rocks of al-Hijr)
function massif(c, x, y, w, h, col, seed) {
  const r = rng(seed), dark = mix(col, '#000000', 0.28), lite = mix(col, '#ffffff', 0.12);
  c.fillStyle = col; c.beginPath(); c.moveTo(x - w / 2, y);
  const n = 7;
  for (let i = 0; i <= n; i++) {
    const q = i / n, px = x - w / 2 + q * w, bump = Math.sin(q * Math.PI) * h * (0.75 + r() * 0.3);
    c.quadraticCurveTo(px - w / n * 0.5, y - bump - h * 0.1 * r(), px, y - bump);
  }
  c.lineTo(x + w / 2, y); c.closePath(); c.fill();
  // vertical erosion grooves
  c.strokeStyle = hexA(dark, 0.45); c.lineWidth = 6;
  for (let i = 0; i < 9; i++) { const gx = x - w * 0.42 + r() * w * 0.84, top = y - Math.sin((gx - x + w / 2) / w * Math.PI) * h * 0.8;
    c.beginPath(); c.moveTo(gx, top + 20); c.quadraticCurveTo(gx + (r() - 0.5) * 30, (top + y) / 2, gx + (r() - 0.5) * 20, y); c.stroke(); }
  c.fillStyle = hexA(lite, 0.25); c.beginPath(); c.ellipse(x - w * 0.18, y - h * 0.75, w * 0.18, h * 0.12, -0.2, 0, 6.283); c.fill();
}
// carved tomb-house facade (Hegra style): stepped crown, pilasters, pediment door; lit = window glow
function facade(c, x, y, w, h, col, lit = 0, t = 0, k = 0) {
  const dark = mix(col, '#000000', 0.3), lite = mix(col, '#ffffff', 0.15);
  c.fillStyle = mix(col, '#000000', 0.12); c.fillRect(x - w / 2, y - h, w, h);
  // stepped crow-step crown: two rows of 5 steps
  const sw = w / 10;
  c.fillStyle = mix(col, '#000000', 0.12);
  for (let s = 0; s < 3; s++) { c.fillRect(x - w / 2 + s * sw, y - h - (s + 1) * sw * 0.7, sw, (s + 1) * sw * 0.7); c.fillRect(x + w / 2 - (s + 1) * sw, y - h - (s + 1) * sw * 0.7, sw, (s + 1) * sw * 0.7); }
  c.fillStyle = dark; c.fillRect(x - w / 2, y - h, w, 8); c.fillRect(x - w / 2, y - h * 0.62, w, 6);
  // pilasters
  c.fillStyle = lite; c.fillRect(x - w / 2 + 6, y - h * 0.62, 16, h * 0.62); c.fillRect(x + w / 2 - 22, y - h * 0.62, 16, h * 0.62);
  // door with triangular pediment
  const dw = w * 0.3, dh = h * 0.36;
  c.fillStyle = dark; c.beginPath(); c.moveTo(x - dw * 0.8, y - dh - 10); c.lineTo(x, y - dh - 10 - dw * 0.45); c.lineTo(x + dw * 0.8, y - dh - 10); c.closePath(); c.fill();
  c.fillStyle = '#1a100a'; c.fillRect(x - dw / 2, y - dh, dw, dh);
  if (lit > 0) { c.save(); c.beginPath(); c.rect(x - dw / 2, y - dh, dw, dh); c.clip(); glow(c, x, y - dh * 0.3, dw * 1.4, '#ffb060', lit * (0.75 + 0.2 * Math.sin(t * 3 + k))); c.restore(); }
}
// the valley town: massifs with carved facades along the foot of the rock
function valley(c, y, col, lit = 0, t = 0, opts = {}) {
  const fac = mix(col, '#ffffff', 0.08);
  massif(c, 160, y, 620, 640, mix(col, '#000000', 0.08), 3);
  massif(c, 900, y, 700, 760, col, 5);
  massif(c, 540, y + 40, 420, 380, mix(col, '#000000', 0.15), 9);
  facade(c, 150, y, 200, 300, fac, lit, t, 1);
  facade(c, 820, y, 240, 360, fac, lit, t, 2);
  facade(c, 1010, y - 10, 150, 220, fac, lit * (opts.dimRight || 1), t, 3);
  facade(c, 520, y + 40, 170, 230, mix(fac, '#000000', 0.08), lit, t, 4);
  c.fillStyle = mix(col, '#000000', 0.25); c.fillRect(-200, y + 30, W + 400, 1200);
}
function footprints(c, pts, color) {
  pts.forEach(([x, y, ang, s, a], i) => {
    if (a <= 0) return;
    c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s * 0.55); c.fillStyle = hexA(color, 0.6 * a);
    c.beginPath(); c.ellipse(i % 2 ? 14 : -14, 0, 11, 24, 0, 0, 6.283); c.fill(); c.restore();
  });
}
function well(c, x, y, s, water = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#8a6a4a'; c.beginPath(); c.ellipse(0, 0, 150, 40, 0, 0, 6.283); c.fill();
  c.fillStyle = '#6a4e34'; c.fillRect(-150, 0, 300, 90); c.beginPath(); c.ellipse(0, 90, 150, 40, 0, 0, Math.PI); c.fill();
  c.strokeStyle = '#4a3420'; c.lineWidth = 4; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-150, 22 * k + 12); c.quadraticCurveTo(0, 22 * k + 52, 150, 22 * k + 12); c.stroke(); }
  c.fillStyle = water > 0 ? mix('#1a2a3a', '#4a7a9a', water) : '#120c08'; c.beginPath(); c.ellipse(0, 0, 120, 28, 0, 0, 6.283); c.fill();
  c.fillStyle = `rgba(200,230,255,${0.4 * water})`; c.beginPath(); c.ellipse(-30, -4, 40, 6, 0, 0, 6.283); c.fill();
  // wooden frame + pulley
  c.strokeStyle = '#4a2e18'; c.lineWidth = 12; c.beginPath(); c.moveTo(-130, 10); c.lineTo(-110, -220); c.moveTo(130, 10); c.lineTo(110, -220); c.moveTo(-125, -215); c.lineTo(125, -215); c.stroke();
  c.fillStyle = '#6a4424'; c.beginPath(); c.arc(0, -215, 20, 0, 6.283); c.fill();
  c.strokeStyle = '#a08a6a'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -195); c.lineTo(0, -40); c.stroke();
  c.restore();
}
function jar(c, x, y, s, col = '#b07a4a') {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath();
  c.moveTo(-14, -70); c.lineTo(14, -70); c.quadraticCurveTo(10, -56, 26, -40); c.quadraticCurveTo(36, -10, 16, 0); c.lineTo(-16, 0); c.quadraticCurveTo(-36, -10, -26, -40); c.quadraticCurveTo(-10, -56, -14, -70); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(-28, -36, 56, 6); c.restore();
}
function fire(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  glow(c, 0, -40, 420, '#ff7a2a', 0.45 + 0.06 * Math.sin(t * 11));
  c.strokeStyle = '#3a2214'; c.lineWidth = 14; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-70, 10); c.lineTo(60, -10); c.moveTo(-60, -12); c.lineTo(70, 12); c.stroke();
  [['#ff8a2a', 70, 150], ['#ffc04a', 46, 110], ['#fff0b0', 22, 60]].forEach(([col, w, h], k) => {
    c.fillStyle = col; c.beginPath(); c.moveTo(-w, 0);
    c.quadraticCurveTo(-w * 0.8 + Math.sin(t * 9 + k) * 10, -h * 0.6, Math.sin(t * 7 + k) * 14, -h - Math.sin(t * 13 + k) * 14);
    c.quadraticCurveTo(w * 0.8 + Math.sin(t * 8 + k) * 10, -h * 0.6, w, 0); c.closePath(); c.fill(); });
  c.restore();
}
function sparks(c, t, x, y, n, seed, a = 1) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) { const ph = (t * (0.6 + r()) + r()) % 1, ang = -Math.PI / 2 + (r() - 0.5) * 1.6, d = ph * (60 + r() * 120);
    c.fillStyle = `rgba(255,${190 + r() * 60 | 0},120,${a * (1 - ph)})`; c.beginPath(); c.arc(x + Math.cos(ang) * d, y + Math.sin(ang) * d + ph * ph * 60, 2 + r() * 2, 0, 6.283); c.fill(); }
}
function dayMarks(c, t, n, k, y = 1700) { // three day discs filling in turn
  for (let i = 0; i < n; i++) {
    const x = W / 2 + (i - (n - 1) / 2) * 190, f = clamp(k * n - i);
    c.strokeStyle = 'rgba(251,231,198,0.8)'; c.lineWidth = 5; c.beginPath(); c.arc(x, y, 56, 0, 6.283); c.stroke();
    if (f > 0) { c.fillStyle = `rgba(246,196,83,${0.85 * f})`; c.beginPath(); c.moveTo(x, y); c.arc(x, y, 50, -Math.PI / 2, -Math.PI / 2 + f * 6.283); c.closePath(); c.fill(); }
    textGlow(c, String(i + 1), x, y + 4, '600 56px Lora', '#fff7e6', 0.95, '#000', 10);
  }
}
function sandFloor(c, y, col, t, seed = 1) {
  c.fillStyle = col; c.beginPath(); c.moveTo(-200, y);
  for (let x = -200; x <= W + 200; x += 20) c.lineTo(x, y - Math.sin(x * 0.004 + seed) * 18);
  c.lineTo(W + 200, H + 200); c.lineTo(-200, H + 200); c.closePath(); c.fill();
  c.strokeStyle = hexA(mix(col, '#000000', 0.25), 0.35); c.lineWidth = 3;
  for (let i = 0; i < 10; i++) { const yy = y + 90 + i * 70; c.beginPath(); for (let x = -100; x <= W + 100; x += 20) { const v = yy + Math.sin(x * 0.012 + i * 1.7 + seed) * 10; x === -100 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); }
}

const SCENES = {
  // 1. The Thamud carve their homes in the mountains of al-Hijr — title card
  thamud: {
    grade: 'rgba(255,150,80,0.28)',
    draw(c, t, d) {
      const p = t / d;
      cam(c, 1.0 + 0.07 * ease(p), W / 2, 1100);
      sky(c, [[0, '#1a1a38'], [0.35, '#6a3a4a'], [0.55, '#e08a5a'], [0.62, '#f0b070']]);
      sun(c, 820, 900, 70, '#ffc070', 0.9);
      stars(c, t, 50, 4, [0, 0, W, 500], 0.5);
      valley(c, 1180, '#b0704a', 0.35, t);
      // chisel sparks on a facade being carved
      sparks(c, t, 860, 960, 18, 7, 0.9);
      sandFloor(c, 1250, '#a46a42', t, 2);
      [60, 1010].forEach((x, i) => palm(c, x, 1300, 0.85, '#2a1a14', t + i));
      for (let i = 0; i < 3; i++) bird(c, 200 + i * 90 + t * 30, 640 + Math.sin(t * 2 + i) * 20, 0.9, t + i, '#2a1a20');
      dust(c, t, 30, 9, [0, 700, W, 600], '#ffb070', 0.3);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a = seg(t, 0.2, 1.2) * (1 - seg(t, 6.5, 7.5));
      textGlow(c, 'LES PROPHÈTES  ·  ÉPISODE 4', W / 2, 215, '600 34px Lora', '#fbe7c6', a * 0.9, '#000000', 12);
      c.save(); c.direction = 'rtl';
      textGlow(c, 'صَالِح', W / 2, 430 - (1 - easeOut(seg(t, 0.4, 1.6))) * 30, '700 170px Amiri', '#f6c453', a, '#ffb300', 40);
      c.restore();
      textGlow(c, 'ʿalayhi s-salām', W / 2, 585, 'italic 500 46px Lora', '#fff3dc', a, '#000000', 14);
      textGlow(c, 'et la chamelle d\'Allah', W / 2, 650, 'italic 500 34px Lora', '#e8d6b8', a * 0.8, '#000000', 10);
    },
  },

  // 2. "O my people, worship Allah" — the lamp of the message shines in the square
  call: {
    grade: 'rgba(255,170,90,0.26)',
    draw(c, t, d) {
      const p = t / d, br = ease(seg(t, 0.3, 2.5)), turn = ease(seg(t, d * 0.55, d * 0.7));
      cam(c, 1.02 + 0.05 * p, W / 2, 1100);
      sky(c, [[0, '#2a3048'], [0.4, '#8a6a6a'], [0.6, '#c89a7a']]);
      valley(c, 1050, '#9a6448', 0.2, t);
      sandFloor(c, 1120, '#a8805c', t, 4);
      // the message: a lamp on a stone plinth, rays reaching the people
      c.fillStyle = '#7a5a40'; c.fillRect(110, 1280, 150, 200); c.fillStyle = '#5a4030'; c.fillRect(100, 1270, 170, 20);
      c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 200, 1220, 0, 1.0, 900, 10, '#ffd890', 0.12 * br, t, 3); c.restore();
      lamp(c, 185, 1270, 1.1, t, 0.4 + 0.6 * br);
      FOLK.forEach((f, i) => {
        const x = 400 + (i % 4) * 160 + (i > 3 ? 70 : 0), y = i > 3 ? 1560 : 1420, dir = turn > 0.5 && i % 2 ? 1 : -1;
        figure(c, Object.assign({ x, y, h: i > 3 ? 380 : 330, dir, covered: turn > 0.5 && i % 2 === 1, light: 0.5 + 0.4 * br }, f));
      });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'يَا قَوْمِ اعْبُدُوا اللَّهَ', t, 0.6, d + 1, 280, 110);
    },
  },

  // 3. The arrogant notables mock him at night, by torchlight
  mock: {
    grade: 'rgba(200,90,60,0.32)',
    draw(c, t, d) {
      const p = t / d;
      cam(c, 1.05 - 0.04 * ease(p), W / 2, 1100);
      sky(c, [[0, '#06070f'], [0.5, '#141226'], [0.7, '#2a1a24']]);
      stars(c, t, 120, 13, [0, 0, W, 800], 0.8);
      moon(c, 820, 330, 44, 0.8);
      valley(c, 1080, '#5a3a30', 0.8, t);
      sandFloor(c, 1150, '#4a3024', t, 6);
      torch(c, 120, 1420, t, 0, 1.2); torch(c, 960, 1420, t, 2, 1.2);
      [0, 1, 2, 3, 4].forEach(i => {
        const x = 220 + i * 160, laugh = Math.sin(t * 5 + i * 1.3) * 0.12;
        figure(c, Object.assign({}, i % 2 ? NOBLE : Object.assign({}, FOLK[i], { band: '#c9a14a' }), { x, y: 1480 + (i % 2) * 30, h: 400, dir: i < 2 ? 1 : -1, armUp: i % 2 ? 0.55 + laugh : 0, light: 0.6 }));
      });
      dust(c, t, 30, 17, [0, 1000, W, 500], '#ffb070', 0.35, 8);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'إِنَّمَا أَنتَ مِنَ الْمُسَحَّرِينَ', t, d * 0.3, d + 1, 280, 96);
    },
  },

  // 4. The sign: the she-camel of Allah appears in the light near the rock
  camel: {
    grade: 'rgba(255,200,130,0.28)',
    draw(c, t, d) {
      const p = t / d, burst = ease(seg(t, 0.2, d * 0.35)), come = ease(seg(t, d * 0.25, d * 0.75));
      cam(c, 1.0 + 0.06 * ease(p), W / 2, 1150);
      sky(c, [[0, mix('#14182a', '#4a6a92', burst)], [0.4, mix('#3a2a34', '#e8b890', burst)], [0.6, mix('#4a3430', '#f6d4a4', burst)]]);
      sun(c, 540, 820, 50, '#fff0c0', 0.5 * burst);
      massif(c, 540, 1240, 1100, 700, '#a06a46', 21);
      // the light opening in the rock
      c.save(); c.globalCompositeOperation = 'lighter';
      glow(c, 540, 1080, 520 * burst + 40, '#ffe2a0', 0.7 * burst);
      rays(c, 540, 1080, -Math.PI / 2, 3.0, 1100, 18, '#fff0c8', 0.12 * burst, t, 11);
      c.restore();
      sandFloor(c, 1240, '#c09060', t, 8);
      const cx = lerp(540, 560, come), cy = lerp(1250, 1430, come), s = lerp(0.7, 1.45, come);
      c.save(); c.globalAlpha = seg(t, d * 0.2, d * 0.4);
      c.fillStyle = 'rgba(60,30,10,0.25)'; c.beginPath(); c.ellipse(cx, cy + 4, 150 * s, 18 * s, 0, 0, 6.283); c.fill();
      camel(c, cx - 30 * s, cy, s, '#8a5636', come < 1 ? t * 0.7 : 0, 1);
      c.strokeStyle = 'rgba(255,240,200,0.55)'; c.lineWidth = 3; c.globalCompositeOperation = 'lighter';
      glow(c, cx, cy - 170 * s, 160 * s, '#fff2cc', 0.18);
      c.restore();
      dust(c, t, 60, 23, [0, 800, W, 900], '#fff2cc', 0.4 * burst, 10);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'هَٰذِهِ نَاقَةُ اللَّهِ لَكُمْ آيَةً', t, d * 0.3, d + 1, 280, 96);
      textGlow(c, 'Al-A\'raf, 73', W / 2, 395, 'italic 500 34px Lora', '#f3e7d0', seg(t, d * 0.45, d * 0.55) * 0.8, '#000', 10);
    },
  },

  // 5. The water is shared: one day for the camel, one day for them
  water: {
    grade: 'rgba(255,190,110,0.26)',
    draw(c, t, d) {
      const p = t / d, sw = ease(seg(t, d * 0.42, d * 0.55));
      cam(c, 1.02 + 0.04 * p, W / 2, 1150);
      sky(c, [[0, '#4a7aa8'], [0.4, '#e8d0a8'], [0.55, '#f6e0b0']]);
      sun(c, 860, 600, 70, '#fff2c0');
      massif(c, 180, 1150, 600, 420, '#b47a50', 31); massif(c, 900, 1150, 600, 520, '#a8704a', 33);
      sandFloor(c, 1150, '#d0a474', t, 5);
      well(c, 540, 1360, 1.2, 1 - 0.3 * sw);
      // day of the camel
      c.save(); c.globalAlpha = 1 - sw; camel(c, 330, 1540, 1.4, CAMEL, 0, 1); c.restore();
      // day of the people: jars and faceless figures
      c.save(); c.globalAlpha = sw;
      [0, 1, 2].forEach(i => figure(c, Object.assign({ x: 760 + i * 120, y: 1560 + (i % 2) * 30, h: 320, dir: -1, light: 0.8 }, FOLK[i + 2])));
      [[300, 1600], [380, 1640], [230, 1660]].forEach(([x, y], i) => jar(c, x, y, 1.3, i % 2 ? '#a06a3a' : '#c08a5a'));
      c.restore();
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'لَهَا شِرْبٌ وَلَكُمْ شِرْبُ يَوْمٍ', t, 0.4, d + 1, 280, 92);
      const la = seg(t, 0.6, 1.2);
      textGlow(c, sw < 0.5 ? 'Jour 1 · la chamelle' : 'Jour 2 · le peuple', W / 2, 1760, '600 44px Lora', '#fbe7c6', la * 0.9 * (sw < 0.5 ? 1 - sw * 2 : sw * 2 - 1), '#000', 14);
    },
  },

  // 6. Nine men spreading corruption plot around a fire
  plot: {
    grade: 'rgba(160,60,40,0.36)',
    draw(c, t, d) {
      const p = t / d;
      cam(c, 1.0 + 0.1 * ease(p), W / 2, 1300);
      sky(c, [[0, '#040509'], [0.6, '#0e0c16'], [1, '#1a1010']]);
      stars(c, t, 90, 41, [0, 0, W, 700], 0.6);
      valley(c, 1000, '#2e201c', 0.15, t);
      sandFloor(c, 1080, '#24180f', t, 9);
      fire(c, 540, 1420, 1.0, t);
      sparks(c, t, 540, 1330, 14, 3, 0.8);
      for (let i = 0; i < 9; i++) {
        const ang = Math.PI + (i / 8) * Math.PI, x = 540 + Math.cos(ang) * 380, y = 1420 + Math.sin(ang) * -140 + 60;
        const f = FOLK[i % FOLK.length];
        figure(c, Object.assign({ x, y: i === 0 || i === 8 ? y + 120 : y, h: 300 + Math.abs(Math.sin(ang)) * -40, dir: x < 540 ? 1 : -1, light: 0.25,
          robe: mix(f.robe, '#000000', 0.45), wrap: mix(f.wrap, '#000000', 0.5), skin: mix(f.skin, '#000000', 0.5) }));
      }
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'وَكَانَ فِي الْمَدِينَةِ تِسْعَةُ رَهْطٍ', t, 0.5, d + 1, 280, 88, '#ffcf9a');
      textGlow(c, '9', W / 2, 520, '600 150px Lora', '#ffcf9a', seg(t, 1.0, 1.8) * 0.5 * (1 - seg(t, d * 0.6, d * 0.8)), '#ff7a2a', 30);
    },
  },

  // 7. The she-camel is killed (shown only by its absence) — they defy him
  kill: {
    grade: 'rgba(200,50,40,0.38)',
    draw(c, t, d) {
      const gone = ease(seg(t, d * 0.25, d * 0.45));
      phases(c, t, d * 0.42, 0.8, c => {
        cam(c, 1.0 + 0.04 * t / d, W / 2, 1100);
        sky(c, [[0, '#1a0a12'], [0.4, '#6a1a1a'], [0.6, '#c84a2a']]);
        sun(c, 540, 1000, 80, '#ff8a4a', 0.8);
        ridge(c, 1180, 60, 0.004, 3, '#2a1210');
        c.save(); c.globalAlpha = 1 - gone; camel(c, 520, ridgeY(520, 1180, 60, 0.004, 3) + 6, 1.1, '#1a0a0a', 0, 1); c.restore();
        // a dark shadow sweeps over the ridge
        c.fillStyle = `rgba(0,0,0,${0.6 * Math.sin(gone * Math.PI)})`; c.fillRect(-100, -100, W + 200, H + 200);
        dust(c, t, 80, 47, [200, 900, 700, 400], '#ff9a6a', 0.5 * gone, 30);
      }, c => {
        // the empty halter lying on the sand
        cam(c, 1.0 + 0.05 * seg(t, d * 0.42, d), W / 2, 1200);
        sky(c, [[0, '#14060a'], [0.5, '#4a1214'], [0.7, '#8a2a1e']]);
        sandFloor(c, 1100, '#5a2a1a', t, 12);
        c.strokeStyle = '#2a140c'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath();
        c.moveTo(200, 1500); c.bezierCurveTo(380, 1420, 460, 1600, 600, 1520); c.bezierCurveTo(720, 1450, 760, 1560, 680, 1600);
        c.bezierCurveTo(600, 1640, 560, 1560, 640, 1530); c.stroke();
        c.strokeStyle = '#6a3a1e'; c.lineWidth = 5; c.stroke();
        c.fillStyle = 'rgba(30,10,6,0.45)'; c.beginPath(); c.ellipse(560, 1580, 300, 50, 0, 0, 6.283); c.fill();
        dust(c, t, 40, 53, [0, 1000, W, 700], '#ffb08a', 0.35, 20);
      });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'فَتَعَاطَىٰ فَعَقَرَ', t, d * 0.3, d + 1, 280, 120, '#ffcf9a');
    },
  },

  // 8. Three days: the respite runs out
  days: {
    grade: 'rgba(120,90,140,0.32)',
    draw(c, t, d) {
      const p = t / d, k = ease(seg(t, 0.4, d * 0.9));
      cam(c, 1.0 + 0.05 * p, W / 2, 1100);
      sky(c, [[0, mix('#4a6a92', '#0a0a14', k)], [0.4, mix('#e8b890', '#2a1a24', k)], [0.6, mix('#f6d4a4', '#3a2420', k)]]);
      // the sun crossing three times
      const ph = (k * 3) % 1, sx = lerp(-60, W + 60, ph), sy = 900 - Math.sin(ph * Math.PI) * 500;
      if (k < 0.99) sun(c, sx, sy, 50, '#fff0c0', 0.8 * (1 - k * 0.5));
      cloudBank(c, t, 160, 12, '#1a1220', 0.6 * k, 7, 14);
      valley(c, 1150, mix('#a87048', '#3a2420', k), 0.4 * k, t);
      sandFloor(c, 1220, mix('#b88a5e', '#2a1a14', k), t, 13);
      c.setTransform(1, 0, 0, 1, 0, 0);
      dayMarks(c, t, 3, k, 1700);
      arabicCaption(c, 'تَمَتَّعُوا فِي دَارِكُمْ ثَلَاثَةَ أَيَّامٍ', t, 0.5, d + 1, 280, 82);
    },
  },

  // 9. The Cry and the earthquake — then the town lies empty
  cry: {
    grade: 'rgba(60,60,110,0.42)',
    draw(c, t, d) {
      const hit = seg(t, 0.4, 1.0), quake = (1 - seg(t, d * 0.3, d * 0.55)) * hit, after = ease(seg(t, d * 0.5, d * 0.8));
      const shx = Math.sin(t * 47) * 22 * quake, shy = Math.cos(t * 39) * 16 * quake;
      cam(c, 1.04, W / 2, 1100, shx, shy);
      sky(c, [[0, '#06060c'], [0.4, mix('#2a2238', '#3a3a4a', after)], [0.6, mix('#4a3040', '#6a5a5a', after)]]);
      cloudBank(c, t, 80, 18, '#0e0c14', 0.9, 12, 30);
      // the shockwave of the Cry
      const w = seg(t, 0.4, 2.6);
      if (w > 0 && w < 1) { c.strokeStyle = `rgba(230,235,255,${0.7 * (1 - w)})`; c.lineWidth = 30 * (1 - w) + 4; c.beginPath(); c.arc(540, 300, 80 + w * 1600, 0, 6.283); c.stroke();
        c.fillStyle = `rgba(220,225,255,${0.35 * (1 - w)})`; c.fillRect(-200, -200, W + 400, H + 400); }
      valley(c, 1150, '#6a4a3a', 0.9 * (1 - hit), t);
      // falling rocks
      const r = rng(5);
      for (let i = 0; i < 14; i++) { const q = seg(t, 0.6 + r() * 2.5, 0.6 + r() * 2.5 + 1.2); const x0 = r() * W, s = 10 + r() * 26;
        if (q > 0 && q < 1) { c.fillStyle = '#4a3428'; c.beginPath(); c.arc(x0 + q * 40, 700 + q * q * 700, s, 0, 6.283); c.fill(); } }
      sandFloor(c, 1220, '#5a3e2e', t, 14);
      dust(c, t, 140, 61, [-100, 800, W + 200, 900], '#c8b0a0', 0.55 * quake + 0.2 * after, 40);
      c.fillStyle = `rgba(150,130,120,${0.25 * quake})`; c.fillRect(-200, 900, W + 400, 1200);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'وَأَخَذَ الَّذِينَ ظَلَمُوا الصَّيْحَةُ', t, 0.3, d * 0.55, 280, 88, '#e6efff');
      arabicCaption(c, 'كَأَن لَّمْ يَغْنَوْا فِيهَا', t, d * 0.58, d + 1, 280, 110, '#e6efff');
    },
  },

  // 10. Allah saves Salih and the believers — a line of lanterns leaving the valley at dawn
  saved: {
    grade: 'rgba(255,200,140,0.28)',
    draw(c, t, d) {
      const p = t / d, go = ease(seg(t, 0.2, d));
      cam(c, 1.0 + 0.05 * p, W / 2, 1050);
      sky(c, [[0, '#2a3a5a'], [0.35, '#c89a9a'], [0.55, '#f4c8a0']]);
      sun(c, 540, 930, 55, '#ffe8c0', 0.9);
      c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 540, 930, -Math.PI / 2, 3.0, 1300, 14, '#ffe8c0', 0.08, t, 17); c.restore();
      massif(c, 60, 1180, 520, 700, '#6a4434', 41); massif(c, 1020, 1180, 520, 760, '#5e3c2e', 43);
      // the path leading out of the valley toward the light
      c.fillStyle = '#c09270'; c.beginPath(); c.moveTo(380, H + 100); c.quadraticCurveTo(480, 1300, 530, 980); c.lineTo(550, 980); c.quadraticCurveTo(620, 1300, 760, H + 100); c.closePath(); c.fill();
      for (let i = 0; i < 9; i++) { const q = clamp(go * 1.15 - i * 0.07); const y = lerp(1820, 1020, q), x = 540 + Math.sin(q * 4 + i) * lerp(110, 10, q) + (i % 2 ? 26 : -26) * (1 - q);
        lantern(c, x, y, lerp(1.5, 0.35, q), t, i, 1 - seg(q, 0.85, 1)); }
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'نَجَّيْنَا صَالِحًا وَالَّذِينَ آمَنُوا مَعَهُ', t, 0.4, d + 1, 280, 82);
    },
  },

  // 11. He turns away from them — footprints leaving the silent town
  farewell: {
    grade: 'rgba(200,120,90,0.3)',
    draw(c, t, d) {
      const p = t / d, wq = ease(seg(t, 0.3, d * 0.9));
      cam(c, 1.05 - 0.05 * ease(p), W / 2, 1100);
      sky(c, [[0, '#141626'], [0.4, '#5a2a30'], [0.6, '#b0603a']]);
      cloudBank(c, t, 220, 10, '#2a1a22', 0.5, 4, 14);
      valley(c, 1100, '#5a3a2e', 0, t);
      sandFloor(c, 1170, '#8a603e', t, 16);
      const path = q => [lerp(520, 640, q) + Math.sin(q * 6) * 40, lerp(1200, 1850, q)], pts = [];
      for (let i = 0; i < 16; i++) { const q = i / 16, [x, y] = path(q); pts.push([x + (i % 2 ? 10 : -10), y, 0.15, lerp(0.5, 1.4, q), seg(wq, q, q + 0.08)]); }
      footprints(c, pts, '#3a2414');
      { const [lx, ly] = path(wq); lantern(c, lx + 60, ly - 120, lerp(0.6, 1.6, wq), t, 3, 1 - seg(wq, 0.9, 1)); }
      dust(c, t, 60, 33, [0, 900, W, 900], '#ffd0a0', 0.35, 40);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'وَلَٰكِن لَّا تُحِبُّونَ النَّاصِحِينَ', t, d * 0.35, d + 1, 280, 92);
    },
  },

  // 12. Their homes carved in the rock still stand, empty — "in that is a sign"
  lesson: {
    grade: 'rgba(255,170,90,0.24)',
    draw(c, t, d) {
      const p = t / d;
      cam(c, 1.0 + 0.08 * ease(p), W / 2, 1150);
      sky(c, [[0, '#05060f'], [0.5, '#0e1228'], [0.7, '#2a2234']]);
      stars(c, t, 220, 61, [0, 0, W, 1100], 1);
      moon(c, 820, 380, 50, 1);
      ridge(c, 1250, 40, 0.003, 8, '#1a141c');
      // a lone giant rock with a single carved facade (like Qasr al-Farid)
      c.fillStyle = '#5a3e34'; c.beginPath(); c.moveTo(250, 1360); c.quadraticCurveTo(230, 760, 540, 700); c.quadraticCurveTo(850, 760, 830, 1360); c.closePath(); c.fill();
      facade(c, 540, 1340, 320, 460, '#7a5848', 0, t);
      c.fillStyle = 'rgba(200,210,255,0.08)'; c.beginPath(); c.moveTo(540, 700); c.quadraticCurveTo(850, 760, 830, 1360); c.lineTo(700, 1360); c.quadraticCurveTo(740, 800, 540, 700); c.fill();
      sandFloor(c, 1340, '#2a1e1a', t, 18);
      dust(c, t, 40, 91, [0, 900, W, 800], '#d8c8b0', 0.3, 18);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'إِنَّ فِي ذَٰلِكَ لَآيَةً', t, 0.4, d + 1, 300, 110);
    },
  },

  outro: {
    grade: null,
    draw(c, t, d) {
      sky(c, [[0, '#05060f'], [0.6, '#0d1024'], [1, '#14122a']]);
      stars(c, t + 50, 140, 81, [0, 0, W, H], 0.7);
      const a = seg(t, 0.2, 1.2);
      c.save(); c.direction = 'rtl';
      textGlow(c, 'وَإِلَىٰ ثَمُودَ', W / 2, 770, '700 100px Amiri', '#f6c453', a, '#ffb300', 30);
      textGlow(c, 'أَخَاهُمْ صَالِحًا', W / 2, 900, '700 100px Amiri', '#f6c453', a, '#ffb300', 30);
      c.restore();
      const b = seg(t, 0.8, 1.8);
      textGlow(c, '« Et aux Thamud, leur frère Salih. »', W / 2, 1040, 'italic 500 38px Lora', '#f3e7d0', b, '#000', 10);
      textGlow(c, '— Hud, 61', W / 2, 1100, 'italic 500 38px Lora', '#f3e7d0', b, '#000', 10);
      textGlow(c, 'LES PROPHÈTES  ·  À SUIVRE', W / 2, 1330, '600 34px Lora', '#c9b48a', seg(t, 1.6, 2.4), '#000', 8);
      c.fillStyle = 'rgba(0,0,0,' + seg(t, d - 0.8, d) + ')'; c.fillRect(0, 0, W, H);
    },
  },
};
