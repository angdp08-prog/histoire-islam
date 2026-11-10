// Episode 2 — Nuh (alayhi salam). Same visual rules: prophets = face veiled by white light, others faceless.

const NUH = { prophet: true, robe: '#c9d3bf', wrap: '#eef0e6', skin: '#c99872' };
const NUH_OLD = Object.assign({}, NUH, { robe: '#d8d2c2', staff: true });
const SON = { robe: '#4a5a6a', wrap: '#6a7a88', skin: '#a8724f' };
const FOLK = [
  { robe: '#5a4b40', wrap: '#7d6a58', skin: '#9a6a4c' }, { robe: '#46505c', wrap: '#6c7682', skin: '#b07a58' },
  { robe: '#6b5641', wrap: '#9a8468', skin: '#8f5f42' }, { robe: '#4b4038', wrap: '#6f6153', skin: '#a8714f' },
  { robe: '#3f4954', wrap: '#5e6b78', skin: '#94664a' }, { robe: '#5d4a3a', wrap: '#867058', skin: '#b4805c' },
  { robe: '#7a5a6a', wrap: '#5a3a4a', skin: '#c48e66' }, { robe: '#3a5a4a', wrap: '#284034', skin: '#b07a58' },
];
const NOBLE = [ // the arrogant notables: rich robes, gold bands
  { robe: '#5a2a3a', wrap: '#c9a14a', skin: '#a8724f', band: '#c9a14a' }, { robe: '#2f3f6a', wrap: '#d9c080', skin: '#b07a58', band: '#c9a14a' },
  { robe: '#4a2a5a', wrap: '#c9a14a', skin: '#9a6a4c', band: '#e6c55a' }, { robe: '#6a3a1a', wrap: '#e0cfa0', skin: '#a8714f', band: '#c9a14a' },
];
const BELIEVERS = [ // the few, simple clothes
  { robe: '#8a7a62', wrap: '#b8aa90', skin: '#9a6a4c' }, { robe: '#7a6a58', wrap: '#a89a84', skin: '#b07a58' },
  { robe: '#6a7466', wrap: '#9aa494', skin: '#8f5f42' }, { robe: '#8a6a5a', wrap: '#b89a8a', skin: '#c48e66' },
  { robe: '#74705e', wrap: '#a4a08e', skin: '#a8714f' },
];

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
function torch(c, x, y, t, k = 0) {
  c.fillStyle = '#3a2418'; c.fillRect(x - 6, y - 160, 12, 160);
  glow(c, x, y - 175, 260, '#ff8a3a', 0.45 + 0.08 * Math.sin(t * 9 + k));
  c.fillStyle = '#ffb347'; c.beginPath(); c.moveTo(x - 14, y - 160); c.quadraticCurveTo(x + Math.sin(t * 8 + k) * 8, y - 230, x + 2, y - 215);
  c.quadraticCurveTo(x + 18, y - 190, x + 14, y - 160); c.fill();
  c.fillStyle = '#ffe39a'; c.beginPath(); c.ellipse(x, y - 175, 6, 14, 0, 0, 6.283); c.fill();
}
// five stone idols (no human faces): Wadd, Suwa', Yaghuth (lion), Ya'uq (horse), Nasr (eagle)
function idol(c, x, y, s, kind, t) {
  const st = '#8a7a6a', sh = '#5e5246', li = '#b5a38c';
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = sh; c.fillRect(-80, -60, 160, 60); c.fillStyle = st; c.fillRect(-90, -76, 180, 20);
  c.fillStyle = st; c.beginPath();
  if (kind === 0) { c.moveTo(-45, -76); c.lineTo(-40, -330); c.lineTo(40, -330); c.lineTo(45, -76); c.fill(); c.beginPath(); c.arc(0, -370, 42, 0, 6.283); c.fill(); }
  else if (kind === 1) { c.moveTo(-60, -76); c.quadraticCurveTo(-30, -250, -26, -300); c.lineTo(26, -300); c.quadraticCurveTo(30, -250, 60, -76); c.fill(); c.beginPath(); c.ellipse(0, -335, 34, 40, 0, 0, 6.283); c.fill(); }
  else if (kind === 2) { c.fillRect(-80, -190, 150, 90); c.fillRect(-75, -110, 26, 36); c.fillRect(40, -110, 26, 36); c.beginPath(); c.arc(80, -210, 58, 0, 6.283); c.fill(); }
  else if (kind === 3) { c.fillRect(-85, -200, 140, 80); c.fillRect(-80, -125, 24, 50); c.fillRect(30, -125, 24, 50);
    c.beginPath(); c.moveTo(40, -200); c.lineTo(70, -300); c.lineTo(115, -290); c.lineTo(80, -190); c.fill(); }
  else { c.ellipse(0, -170, 40, 80, 0, 0, 6.283); c.fill(); c.beginPath(); c.moveTo(-30, -200); c.lineTo(-150, -280); c.lineTo(-120, -170); c.fill();
    c.beginPath(); c.moveTo(30, -200); c.lineTo(150, -280); c.lineTo(120, -170); c.fill(); c.beginPath(); c.arc(0, -265, 28, 0, 6.283); c.fill(); }
  c.fillStyle = 'rgba(255,170,90,0.18)'; c.fillRect(20, -390, 60, 330);
  c.restore();
}
function house(c, x, y, w, h, col, lit = 0) {
  c.fillStyle = col; c.fillRect(x - w / 2, y - h, w, h);
  c.fillStyle = mix(col, '#000000', 0.25); c.fillRect(x - w / 2, y - h, w, 12);
  c.fillStyle = lit ? `rgba(255,190,110,${lit})` : 'rgba(30,20,15,0.8)'; c.fillRect(x - 18, y - h * 0.55, 36, 46); c.fillRect(x + w * 0.2, y - 70, 40, 70);
}
function mountain(c, x, y, w, h, c1, c2) { // rugged rocky mountain with a shaded flank
  const r = rng(Math.floor(x * 3 + h)), pts = [];
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const f = i / n, peak = 1 - Math.abs(f - 0.45) / 0.55;
    pts.push([x - w / 2 + w * f, y - h * Math.max(0, peak) * (0.82 + 0.18 * r()) - (i > 0 && i < n ? r() * h * 0.06 : 0)]);
  }
  c.fillStyle = c1; c.beginPath(); c.moveTo(x - w / 2, y); pts.forEach(([px, py]) => c.lineTo(px, py)); c.lineTo(x + w / 2, y); c.fill();
  c.fillStyle = c2; c.beginPath(); const k = Math.round(n * 0.45); c.moveTo(pts[k][0], pts[k][1]);
  for (let i = k + 1; i <= n; i++) c.lineTo(pts[i][0], pts[i][1]);
  c.lineTo(x + w / 2, y); c.lineTo(pts[k][0] + w * 0.06, y);
  for (let i = 0; i < 4; i++) c.lineTo(pts[k][0] + w * (0.06 - i * 0.015) + (r() - 0.5) * 30, pts[k][1] + (y - pts[k][1]) * (0.8 - i * 0.2));
  c.fill();
}
// the ark: hull with planks, cabin and door; build = 0..1 (ribs -> planked), door = 0 (closed) .. 1 (open)
function ark(c, x, y, s, o = {}) {
  const build = o.build === undefined ? 1 : o.build, door = o.door || 0, rot = o.rot || 0;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const hull = () => { c.beginPath(); c.moveTo(-380, -170); c.quadraticCurveTo(-330, -40, -230, 0); c.lineTo(230, 0); c.quadraticCurveTo(330, -40, 380, -170); c.lineTo(330, -150); c.lineTo(-330, -150); c.closePath(); };
  c.strokeStyle = '#4a2e1a'; c.lineWidth = 12; // ribs
  for (let i = -6; i <= 6; i++) { const xx = i * 50; c.beginPath(); c.moveTo(xx, -150); c.quadraticCurveTo(xx * 1.05, -40, xx * 0.92, 0); c.stroke(); }
  c.save(); hull(); c.clip();
  c.fillStyle = '#7a4a2a'; c.fillRect(-400, -200, 800 * build, 220);
  c.strokeStyle = '#5a341c'; c.lineWidth = 4; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(-400, -150 + k * 28); c.lineTo(-400 + 800 * build, -150 + k * 28); c.stroke(); }
  c.restore();
  c.strokeStyle = '#3a2412'; c.lineWidth = 8; hull(); c.stroke();
  if (build > 0.85) {
    const a = seg(build, 0.85, 1);
    c.globalAlpha *= a;
    c.fillStyle = '#8a5a34'; c.fillRect(-220, -300, 440, 150);
    c.fillStyle = '#5a341c'; c.beginPath(); c.moveTo(-250, -300); c.lineTo(0, -370); c.lineTo(250, -300); c.fill();
    c.fillStyle = '#2a170b'; c.fillRect(-50, -280, 100, 130);
    if (door > 0) { c.fillStyle = '#ffd9a0'; c.fillRect(-50, -280, 100 * door, 130); }
    c.fillStyle = '#3a2412'; for (let k = 0; k < 3; k++) c.fillRect(-180 + k * 100 + (k > 0 ? 160 : 0), -270, 40, 30);
  }
  c.restore();
}
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
function waveY(x, t, y, amp, freq, speed, seed) { return y - amp * (Math.sin(x * freq + t * speed + seed) + 0.45 * Math.sin(x * freq * 2.3 - t * speed * 1.4 + seed * 2)); }
function rain(c, t, n, a, slant = 0.25, speed = 1900, seed = 5) {
  if (a <= 0) return;
  const r = rng(seed); c.strokeStyle = `rgba(200,215,240,${0.35 * a})`; c.lineWidth = 2; c.beginPath();
  for (let i = 0; i < n; i++) {
    const x0 = r() * (W + 600) - 300, y0 = r() * H, len = 40 + r() * 50;
    const y = (y0 + t * speed * (0.8 + r() * 0.4)) % (H + 200) - 100, x = x0 + (y + 100) * slant;
    c.moveTo(x, y); c.lineTo(x + len * slant, y + len);
  }
  c.stroke();
}
function lightning(c, t, period, seed) { // returns flash intensity, draws bolt
  const ph = (t + seed) % period, f = ph < 0.25 ? (1 - ph / 0.25) : 0;
  if (f <= 0) return 0;
  const r = rng(Math.floor((t + seed) / period) * 31 + 7);
  c.save(); c.globalAlpha = f; c.strokeStyle = '#f0f4ff'; c.lineWidth = 6; c.shadowColor = '#cfe0ff'; c.shadowBlur = 30;
  let x = 200 + r() * 680, y = 0; c.beginPath(); c.moveTo(x, y);
  while (y < 900) { x += (r() - 0.5) * 120; y += 60 + r() * 60; c.lineTo(x, y); }
  c.stroke(); c.restore();
  c.fillStyle = `rgba(220,230,255,${0.35 * f})`; c.fillRect(-100, -100, W + 200, H + 200);
  return f;
}
function cloudBank(c, t, y, n, color, a = 1, seed = 3, drift = 10) {
  const r = rng(seed); c.fillStyle = hexA(color, a);
  for (let i = 0; i < n; i++) {
    const x = ((r() * (W + 600) + t * drift * (0.5 + r())) % (W + 600)) - 300, yy = y + r() * 220, rr = 90 + r() * 140;
    c.beginPath(); c.ellipse(x, yy, rr * 1.6, rr * 0.7, 0, 0, 6.283); c.fill();
  }
}
function goat(c, x, y, s, color, t, dir = 1) {
  c.save(); c.translate(x, y); c.scale(s * dir, s);
  c.strokeStyle = color; c.lineWidth = 7; c.lineCap = 'round';
  [-30, -15, 25, 38].forEach((lx, i) => { c.beginPath(); c.moveTo(lx, -40); c.lineTo(lx + Math.sin(t * 4 + i * 1.7) * 5, 0); c.stroke(); });
  c.fillStyle = color; c.beginPath(); c.ellipse(0, -55, 52, 24, 0, 0, 6.283); c.fill();
  c.beginPath(); c.ellipse(60, -80, 18, 14, -0.4, 0, 6.283); c.fill();
  c.lineWidth = 5; c.beginPath(); c.moveTo(55, -92); c.quadraticCurveTo(45, -120, 30, -115); c.stroke();
  c.restore();
}
function tannur(c, x, y, s, gush, t) { // clay oven from which water gushes
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#9a6a42'; c.beginPath(); c.moveTo(-90, 0); c.quadraticCurveTo(-95, -150, 0, -160); c.quadraticCurveTo(95, -150, 90, 0); c.fill();
  c.fillStyle = '#6a4228'; c.beginPath(); c.ellipse(0, -150, 42, 12, 0, 0, 6.283); c.fill();
  c.fillStyle = '#2a1a10'; c.beginPath(); c.ellipse(0, -60, 34, 30, 0, 0, 6.283); c.fill();
  if (gush > 0) {
    for (let i = 0; i < 40; i++) {
      const ph = (t * 1.6 + i / 40) % 1, ang = -Math.PI / 2 + Math.sin(i * 7.3) * 0.7;
      const d = ph * 260 * gush, px = Math.cos(ang) * d, py = -150 + Math.sin(ang) * d + ph * ph * 260;
      c.fillStyle = `rgba(150,200,255,${0.8 * (1 - ph) * gush})`; c.beginPath(); c.arc(px, py, 7 + 5 * (1 - ph), 0, 6.283); c.fill();
    }
    glow(c, 0, -150, 160, '#bfe0ff', 0.4 * gush);
  }
  c.restore();
}

const SCENES = {
  // 1. Idol worship — title card
  idols: {
    grade: 'rgba(190,80,40,0.3)',
    draw(c, t, d) {
      const p = t / d;
      cam(c, 1.0 + 0.07 * ease(p), W / 2, 1100);
      sky(c, [[0, '#0a0a18'], [0.4, '#2a1a2a'], [0.62, '#5a2a24']]);
      stars(c, t, 90, 4, [0, 0, W, 700], 0.7);
      mountain(c, 250, 1050, 800, 300, '#2a1a1e', '#1e1216'); mountain(c, 850, 1060, 700, 260, '#2e1c20', '#22141a');
      c.fillStyle = '#2a1812'; c.fillRect(-100, 1050, W + 200, 900);
      [0, 1, 2, 3, 4].forEach(k => idol(c, 120 + k * 210, 1180 - (k % 2) * 30, 0.72 + (k === 2 ? 0.08 : 0), k, t));
      torch(c, 30, 1200, t, 0); torch(c, 1050, 1200, t, 2); torch(c, 540, 1240, t, 4);
      FOLK.slice(0, 6).forEach((f, i) => figure(c, Object.assign({ x: 100 + i * 175, y: 1400 + (i % 2) * 30, h: 300, dir: i < 3 ? 1 : -1, pose: i % 2 ? 'prostrate' : 'kneel', light: 0.5 }, f)));
      dust(c, t, 40, 9, [0, 700, W, 700], '#ffb070', 0.35);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a = seg(t, 0.2, 1.2) * (1 - seg(t, 6.0, 7.0));
      textGlow(c, 'LES PROPHÈTES  ·  ÉPISODE 2', W / 2, 215, '600 34px Lora', '#fbe7c6', a * 0.9, '#000000', 12);
      c.save(); c.direction = 'rtl';
      textGlow(c, 'نُوح', W / 2, 430 - (1 - easeOut(seg(t, 0.4, 1.6))) * 30, '700 170px Amiri', '#f6c453', a, '#ffb300', 40);
      c.restore();
      textGlow(c, 'ʿalayhi s-salām', W / 2, 585, 'italic 500 46px Lora', '#fff3dc', a, '#000000', 14);
    },
  },

  // 2. Nuh calls his people, day and night, openly and in secret
  call: {
    grade: 'rgba(255,170,90,0.28)',
    draw(c, t, d) {
      phases(c, t, d * 0.5, 1.0, c => {
        cam(c, 1.03, W / 2, 1050);
        sky(c, [[0, '#6a9ab8'], [0.4, '#e8d0a8'], [0.6, '#f4dcb0']]);
        sun(c, 820, 360, 55, '#fff2c0');
        for (let i = 0; i < 5; i++) house(c, 100 + i * 220, 1120, 180, 200 + (i % 2) * 60, '#c89a6a');
        c.fillStyle = '#c8a070'; c.fillRect(-100, 1110, W + 200, 900);
        c.fillStyle = '#9a7a52'; c.beginPath(); c.ellipse(540, 1330, 120, 30, 0, 0, 6.283); c.fill();
        figure(c, Object.assign({ x: 540, y: 1320, h: 440, dir: 1, armUp: 0.6 + 0.15 * Math.sin(t * 1.5), light: 1 }, NUH));
        FOLK.slice(0, 5).forEach((f, i) => { const x = ((t * 50 * (i % 2 ? 1 : -1) + i * 260) % 1400 + 1400) % 1400 - 160;
          figure(c, Object.assign({ x, y: 1420 + (i % 2) * 40, h: 330, dir: i % 2 ? 1 : -1, walk: t + i, light: 0.8 }, f)); });
      }, c => {
        cam(c, 1.05, 600, 1050);
        sky(c, [[0, '#060816'], [0.45, '#141a36'], [0.6, '#1e2440']]);
        stars(c, t, 140, 14, [0, 0, W, 900], 0.9); moon(c, 220, 300, 50, 1);
        c.fillStyle = '#2a2420'; c.fillRect(560, 700, 600, 600);
        c.fillStyle = '#ffb466'; c.fillRect(700, 950, 170, 340); glow(c, 785, 1120, 320, '#ffb466', 0.45);
        c.fillStyle = '#1a1614'; c.fillRect(-100, 1290, W + 200, 800);
        figure(c, Object.assign({ x: 560, y: 1320, h: 430, dir: 1, light: 0.6 }, NUH));
        figure(c, Object.assign({ x: 790, y: 1300, h: 400, dir: -1, light: 0.2 }, FOLK[1], { robe: '#1e1a18', wrap: '#2a2420', skin: '#2a1d18' }));
        c.setTransform(1, 0, 0, 1, 0, 0);
        arabicCaption(c, 'يَا قَوْمِ اعْبُدُوا اللَّهَ', t, d * 0.6, d + 1, 280, 100);
      });
    },
  },

  // 3. They cover their ears and heads; the notables mock
  refuse: {
    grade: 'rgba(150,110,90,0.3)',
    draw(c, t, d) {
      const p = t / d, mock = ease(seg(t, d * 0.5, d * 0.62));
      cam(c, 1.0 + 0.06 * ease(p), W / 2, 1050);
      sky(c, [[0, '#7a8a98'], [0.45, '#c8b498'], [0.6, '#d8c4a4']]);
      for (let i = 0; i < 5; i++) house(c, 90 + i * 230, 1080, 190, 210 + (i % 2) * 50, '#a88a68');
      c.fillStyle = '#b09470'; c.fillRect(-100, 1070, W + 200, 900);
      figure(c, Object.assign({ x: 230, y: 1320, h: 440, dir: 1, armUp: 0.5, light: 1 }, NUH));
      BELIEVERS.slice(0, 3).forEach((b, i) => figure(c, Object.assign({ x: 70 + i * 55, y: 1300 - i * 14, h: 300, dir: 1, light: 0.6 }, b)));
      NOBLE.forEach((n, i) => figure(c, Object.assign({ x: 560 + i * 135, y: 1360 + (i % 2) * 30, h: 420, dir: mock > 0.5 && i % 2 === 0 ? -1 : 1, covered: mock < 0.5 || i % 2 === 1,
        armUp: i % 2 === 0 ? mock * (0.7 + 0.15 * Math.sin(t * 6 + i)) : 0, light: 0.6 }, n)));
      FOLK.slice(2, 6).forEach((f, i) => figure(c, Object.assign({ x: 480 + i * 170, y: 1500, h: 360, dir: 1, covered: true, light: 0.4 }, f)));
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'وَاسْتَغْشَوْا ثِيَابَهُمْ', t, 0.5, d * 0.55, 280, 100);
    },
  },

  // 4. 950 years of patience
  years: {
    grade: 'rgba(120,110,170,0.25)',
    draw(c, t, d) {
      const p = t / d, cyc = (t * 0.55) % 1, day = 0.5 + 0.5 * Math.sin(cyc * 6.283);
      cam(c, 1.02 + 0.04 * p, W / 2, 1050);
      sky(c, [[0, mix('#060816', '#5d86a6', day)], [0.45, mix('#1a1e3a', '#e8c79a', day)], [0.6, mix('#2a2a48', '#f6dcae', day)]]);
      stars(c, t, 120, 44, [0, 0, W, 900], 1 - day);
      const ang = cyc * 6.283; sun(c, 540 + Math.cos(ang - 1.57) * 420, 950 + Math.sin(ang - 1.57) * 600, 50, '#ffe0a0', day);
      mountain(c, 540, 1180, 1300, 260, mix('#1a1a2a', '#8a7058', day), mix('#12121e', '#6a5444', day));
      c.fillStyle = mix('#14141e', '#9a7a58', day); c.fillRect(-100, 1170, W + 200, 900);
      figure(c, Object.assign({ x: 540, y: 1330, h: 440, dir: 1, staff: p > 0.4, light: 0.6 + 0.4 * day }, NUH, { robe: mix('#c9d3bf', '#d8d2c2', p) }));
      BELIEVERS.forEach((b, i) => figure(c, Object.assign({ x: 700 + i * 70, y: 1340 + (i % 2) * 12, h: 300, dir: -1, alpha: seg(t, 0.8 + i * 0.6, 1.6 + i * 0.6), light: 0.4 + 0.5 * day }, b)));
      c.setTransform(1, 0, 0, 1, 0, 0);
      textGlow(c, '950', W / 2, 640, '600 150px Lora', '#fbe7c6', seg(t, 0.4, 1.2) * 0.85, '#000', 20);
      arabicCaption(c, 'أَلْفَ سَنَةٍ إِلَّا خَمْسِينَ عَامًا', t, 0.4, d + 1, 280, 82);
    },
  },

  // 5. Revelation: build the ark under Our eyes
  command: {
    grade: 'rgba(90,110,200,0.28)',
    draw(c, t, d) {
      const p = t / d, beam = ease(seg(t, d * 0.25, d * 0.6));
      cam(c, 1.08 - 0.06 * ease(p), W / 2, 1000);
      sky(c, [[0, '#04060f'], [0.5, '#121a38'], [0.66, '#1e2444']]);
      stars(c, t, 260, 51, [0, 0, W, 1100], 1);
      if (beam > 0) { c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 540, -100, Math.PI / 2, 0.22, 1500, 8, '#dfe8ff', 0.12 * beam, t, 3); glow(c, 540, 1200, 400, '#e8eeff', 0.35 * beam); c.restore(); }
      mountain(c, 540, 1350, 1500, 260, '#14141f', '#0e0e17');
      figure(c, Object.assign({ x: 540, y: 1260, h: 360, dir: 1, pose: 'kneel', light: 0.4 + beam }, NUH));
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'وَاصْنَعِ الْفُلْكَ بِأَعْيُنِنَا', t, d * 0.3, d + 1, 280, 90, '#e6efff');
    },
  },

  // 6. Building the ark far from any sea — the mockers
  build: {
    grade: 'rgba(255,165,80,0.32)',
    draw(c, t, d) {
      const p = t / d, b = lerp(0.15, 0.92, ease(p));
      cam(c, 1.0 + 0.05 * p, W / 2, 1050);
      sky(c, [[0, '#5a86a6'], [0.35, '#e6c48e'], [0.55, '#f4d6a0']]);
      sun(c, 860, 330, 60, '#fff0b0');
      dune(c, -300, 700, 1000, 120, '#e2b37a', '#c69660'); dune(c, 400, 1400, 1010, 150, '#d8a86c', '#b8874f');
      c.fillStyle = '#d4a66a'; c.fillRect(-100, 1000, W + 200, 900);
      ark(c, 470, 1220, 0.95, { build: b });
      c.strokeStyle = '#6a4a2a'; c.lineWidth = 10; c.beginPath(); c.moveTo(80, 1240); c.lineTo(160, 980); c.moveTo(860, 1240); c.lineTo(790, 980); c.stroke(); // scaffold
      figure(c, Object.assign({ x: 300, y: 1340, h: 400, dir: 1, armUp: 0.6 + 0.4 * Math.abs(Math.sin(t * 3.7)), light: 1 }, NUH));
      BELIEVERS.slice(0, 2).forEach((bb, i) => { const x = ((t * 55 + i * 300) % 700) - 100;
        figure(c, Object.assign({ x, y: 1420 + i * 20, h: 330, dir: 1, walk: t + i, light: 0.8 }, bb));
        c.fillStyle = '#8a5a34'; c.save(); c.translate(x, 1420 + i * 20 - 340); c.rotate(-0.1); c.fillRect(-120, -10, 240, 20); c.restore(); });
      const m = ease(seg(t, d * 0.45, d * 0.6));
      NOBLE.slice(0, 3).forEach((n, i) => figure(c, Object.assign({ x: lerp(1200, 820 + i * 95, m), y: 1440 + (i % 2) * 24, h: 400, dir: -1, walk: m < 1 ? t * 1.2 + i : null,
        armUp: m * (0.65 + 0.15 * Math.sin(t * 7 + i)), light: 0.7 }, n)));
      dust(c, t, 40, 61, [0, 800, W, 700], '#fff0c8', 0.35, 18);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'سَخِرُوا مِنْهُ', t, d * 0.58, d + 1, 280, 120);
    },
  },

  // 7. The oven gushes; pairs of animals board
  sign: {
    grade: 'rgba(90,110,150,0.32)',
    draw(c, t, d) {
      const p = t / d, dark = ease(seg(t, 0, d * 0.5));
      cam(c, 1.02 + 0.04 * p, W / 2, 1050);
      sky(c, [[0, mix('#5a86a6', '#1e2430', dark)], [0.4, mix('#d8c49a', '#4a4a52', dark)], [0.55, mix('#e8d0a0', '#5a5650', dark)]]);
      cloudBank(c, t, 150, 14, '#2a2e3a', 0.4 + 0.5 * dark, 8, 14);
      c.fillStyle = mix('#c8a06a', '#6a5a48', dark); c.fillRect(-100, 1000, W + 200, 900);
      ark(c, 600, 1180, 0.9, { build: 1, door: 1 });
      c.fillStyle = '#5a3a22'; c.beginPath(); c.moveTo(560, 1000); c.lineTo(600, 1000); c.lineTo(380, 1310); c.lineTo(300, 1310); c.fill(); // ramp
      const board = seg(t, d * 0.3, d);
      const animals = [['camel', 0], ['camel', 0.06], ['cow', 0.18], ['cow', 0.24], ['goat', 0.36], ['goat', 0.4]];
      animals.forEach(([k, off], i) => {
        const q = clamp((board - off) * 1.6), x = lerp(-150, 560, q), y = lerp(1420, 1010, clamp((q - 0.55) / 0.45));
        if (q <= 0 || q >= 1) return;
        const sc = lerp(1, 0.6, clamp((q - 0.55) / 0.45));
        if (k === 'camel') camel(c, x, y, 0.55 * sc, '#7a5a3e', t + i, 1);
        else if (k === 'cow') cow(c, x, y, 0.7 * sc, '#8a6a4e', true, t + i, 1);
        else goat(c, x, y, 0.9 * sc, '#d8d0c0', t + i, 1);
      });
      for (let i = 0; i < 2; i++) bird(c, lerp(-100, 560, clamp(board * 1.4 - 0.2)) + i * 40, 800 + i * 30 + Math.sin(t * 3 + i) * 10, 1.1, t + i, '#2a2a30');
      tannur(c, 860, 1500, 1.0, ease(seg(t, d * 0.05, d * 0.25)), t);
      figure(c, Object.assign({ x: 230, y: 1350, h: 400, dir: 1, armUp: 0.4, light: 0.7 }, NUH));
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'وَفَارَ التَّنُّورُ', t, d * 0.12, d + 1, 280, 120, '#dfeaff');
    },
  },

  // 8. "In the name of Allah be its sailing and its anchoring"
  embark: {
    grade: 'rgba(70,90,150,0.35)',
    draw(c, t, d) {
      const p = t / d, close = ease(seg(t, d * 0.45, d * 0.9));
      cam(c, 1.25 - 0.05 * p, 600, 1000);
      sky(c, [[0, '#14182a'], [0.45, '#2e3446'], [0.6, '#3e4250']]);
      cloudBank(c, t, 100, 16, '#1a1e2a', 0.9, 9, 22);
      c.fillStyle = '#4a4238'; c.fillRect(-100, 1000, W + 200, 900);
      ark(c, 600, 1180, 0.9, { build: 1, door: 1 - close });
      figure(c, Object.assign({ x: 600, y: 1046, h: 210, dir: -1, armUp: 0.8, light: 0.9, alpha: 1 - close }, NUH));
      rain(c, t, 260, ease(seg(t, 0, d * 0.5)), 0.2);
      lightning(c, t, 4.5, 1.3);
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.save(); c.direction = 'rtl';
      const a = seg(t, 0.3, 1.1) * (1 - seg(t, d + 0.2, d + 0.6));
      textGlow(c, 'بِسْمِ اللَّهِ مَجْرَاهَا', W / 2, 260, '700 96px Amiri', '#f6c453', a, '#ffb300', 30);
      textGlow(c, 'وَمُرْسَاهَا', W / 2, 380, '700 96px Amiri', '#f6c453', a, '#ffb300', 30);
      c.restore();
    },
  },

  // 9. The flood — waves like mountains
  flood: {
    grade: 'rgba(40,70,140,0.42)',
    draw(c, t, d) {
      const p = t / d;
      cam(c, 1.05 + 0.05 * Math.sin(t * 0.7), W / 2, 1000, Math.sin(t * 1.3) * 10, 0);
      sky(c, [[0, '#06080f'], [0.4, '#1a2234'], [0.6, '#2a3446']]);
      cloudBank(c, t, 60, 18, '#0e121c', 1, 12, 40);
      lightning(c, t, 3.2, 0.4);
      waves(c, t, 1050, 160, '#16243a', 0.004, 1.1, 1, 'rgba(150,180,220,.25)');
      const ay = waveY(540, t, 1180, 120, 0.005, 1.6, 2), ay2 = waveY(600, t, 1180, 120, 0.005, 1.6, 2);
      ark(c, 540, ay + 30, 0.62, { build: 1, rot: Math.atan2(ay2 - ay, 60) * 0.8 });
      waves(c, t, 1180, 120, '#1e3050', 0.005, 1.6, 2, 'rgba(170,200,240,.35)');
      waves(c, t, 1360, 140, '#122038', 0.0035, 2.2, 4, 'rgba(190,210,240,.4)');
      rain(c, t, 420, 1, 0.35, 2300, 7);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'فِي مَوْجٍ كَالْجِبَالِ', t, d * 0.45, d + 1, 280, 104, '#dfeaff');
    },
  },

  // 10. His son refuses — the wave separates them
  son: {
    grade: 'rgba(40,60,130,0.45)',
    draw(c, t, d) {
      const rise = ease(seg(t, d * 0.15, d)), engulf = ease(seg(t, d * 0.8, d * 0.92));
      cam(c, 1.02, W / 2, 1000);
      sky(c, [[0, '#05070d'], [0.45, '#18202e'], [0.6, '#222a38']]);
      cloudBank(c, t, 60, 16, '#0c1018', 1, 15, 30);
      lightning(c, t, 5.5, 2.1);
      // the son on a rocky peak to the right
      mountain(c, 820, 1250, 520, 620, '#1e2228', '#15181d');
      const sonAlpha = 1 - engulf;
      figure(c, Object.assign({ x: 790, y: 660, h: 240, dir: -1, light: 0.3, alpha: sonAlpha }, SON));
      // ark on the left with Nuh calling
      const ay = waveY(300, t, 1150, 70, 0.005, 1.4, 3);
      ark(c, 290, ay + 30, 0.5, { build: 1, rot: Math.sin(t * 1.1) * 0.05 });
      figure(c, Object.assign({ x: 290, y: ay - 120, h: 170, dir: 1, armUp: 0.8 + 0.1 * Math.sin(t * 2), light: 0.7 }, NUH));
      waves(c, t, lerp(1250, 1080, rise), 80, '#16243a', 0.006, 1.4, 3, 'rgba(160,190,230,.3)');
      // the great wave
      const wx = lerp(1300, 500, ease(seg(t, d * 0.68, d * 0.95))), wy = lerp(1500, 520, ease(seg(t, d * 0.68, d * 0.88)));
      if (t > d * 0.66) {
        c.fillStyle = '#1a2c48'; c.beginPath(); c.moveTo(wx - 300, H + 200); c.quadraticCurveTo(wx - 260, wy + 300, wx, wy);
        c.quadraticCurveTo(wx + 200, wy - 80, wx + 160, wy + 120); c.quadraticCurveTo(wx + 300, wy + 400, W + 300, H + 200); c.fill();
        c.strokeStyle = 'rgba(200,220,250,.45)'; c.lineWidth = 6; c.beginPath(); c.moveTo(wx - 260, wy + 300); c.quadraticCurveTo(wx - 200, wy + 60, wx, wy); c.quadraticCurveTo(wx + 200, wy - 80, wx + 160, wy + 120); c.stroke();
      }
      waves(c, t, 1400, 110, '#0e1a2e', 0.004, 2, 5, 'rgba(180,200,240,.3)');
      rain(c, t, 360, 0.9, 0.3, 2100, 9);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'يَا بُنَيَّ ارْكَب مَّعَنَا', t, d * 0.05, d * 0.5, 280, 100, '#dfeaff');
      arabicCaption(c, 'لَا عَاصِمَ الْيَوْمَ مِنْ أَمْرِ اللَّهِ', t, d * 0.55, d + 1, 280, 80, '#dfeaff');
    },
  },

  // 11. Earth swallows its water; the ark rests on al-Judi
  calm: {
    grade: 'rgba(200,170,120,0.25)',
    draw(c, t, d) {
      const p = t / d, clear = ease(seg(t, d * 0.15, d * 0.6)), recede = ease(seg(t, d * 0.35, d));
      cam(c, 1.0 + 0.06 * ease(p), W / 2, 1000);
      sky(c, [[0, mix('#1a2232', '#4f7a9a', clear)], [0.4, mix('#3a4454', '#e6c9a0', clear)], [0.6, mix('#4a505a', '#f2d8ac', clear)]]);
      sun(c, 760, 420, 70, '#fff0c0', clear);
      if (clear > 0) { c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 760, 420, Math.PI * 0.6, 1.6, 1500, 12, '#ffe8b8', 0.1 * clear, t, 11); c.restore(); }
      cloudBank(c, t, lerp(80, -260, clear), 14, '#262c38', 1 - clear * 0.7, 17, 12);
      mountain(c, 520, 1250, 900, 520, mix('#2a2e34', '#7a6a58', clear), mix('#1e2228', '#5a4c40', clear));
      ark(c, 520, 792, 0.55, { build: 1 });
      const wl = lerp(900, 1280, recede);
      waves(c, t, wl, 20, mix('#22344e', '#5a8aa8', clear), 0.006, 0.6, 1, 'rgba(255,240,210,.35)');
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'وَاسْتَوَتْ عَلَى الْجُودِيِّ', t, d * 0.55, d + 1, 280, 96);
    },
  },

  // 12. Descend in peace — a new land
  descend: {
    grade: 'rgba(255,190,110,0.3)',
    draw(c, t, d) {
      const p = t / d, green = ease(seg(t, d * 0.2, d * 0.8));
      cam(c, 1.0 + 0.05 * p, W / 2, 1050);
      sky(c, [[0, '#5d86a6'], [0.4, '#f0c89a'], [0.6, '#f8dcae']]);
      sun(c, 260, 520, 80, '#fff0c0');
      rays(c, 260, 520, Math.PI * 0.25, 1.4, 1500, 10, '#ffe8b8', 0.08, t, 21);
      mountain(c, 760, 1150, 900, 420, '#8a7058', '#6a5444');
      ark(c, 760, 800, 0.45, { build: 1, door: 1 });
      c.fillStyle = mix('#9a8060', '#6a8a4a', green); c.fillRect(-100, 1140, W + 200, 900);
      const r = rng(5);
      for (let i = 0; i < 60; i++) { const x = r() * W, y = 1150 + r() * 400, h = (14 + r() * 26) * seg(green, r() * 0.6, r() * 0.6 + 0.4);
        if (h > 0.5) { c.strokeStyle = '#4a7a3a'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 4, y - h / 2, x + 8 * Math.sin(t + i), y - h); c.stroke(); } }
      const walk = seg(t, 0, d);
      figure(c, Object.assign({ x: lerp(640, 300, walk), y: lerp(1200, 1380, walk), h: lerp(320, 440, walk), dir: -1, walk: t * 1.1, light: 1 }, NUH_OLD));
      BELIEVERS.forEach((b, i) => { const q = clamp(walk - 0.08 * (i + 1));
        figure(c, Object.assign({ x: lerp(700, 420 + i * 70, q), y: lerp(1180, 1350 + (i % 2) * 20, q), h: lerp(260, 340, q), dir: -1, walk: t * 1.1 + i, light: 0.9 }, b)); });
      goat(c, lerp(760, 620, walk), 1300, 0.9, '#d8d0c0', t, -1);
      for (let i = 0; i < 3; i++) bird(c, 300 + i * 120 + t * 40, 700 + Math.sin(t * 2 + i) * 30, 1, t + i, '#3a3a40');
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'اهْبِطْ بِسَلَامٍ مِّنَّا', t, 0.4, d + 1, 280, 104);
    },
  },

  // 13. His last advice — and his death
  death: {
    grade: 'rgba(200,120,80,0.3)',
    draw(c, t, d) {
      const p = t / d, night = ease(seg(t, d * 0.6, d));
      cam(c, 1.0 + 0.07 * ease(p), W / 2, 1050);
      c.fillStyle = '#2a1a12'; c.fillRect(-100, -100, W + 200, H + 200);
      c.save(); c.beginPath(); c.roundRect(560, 480, 380, 520, 190); c.clip(); // window
      sky(c, [[0.2, mix('#c0607a', '#070814', night)], [0.4, mix('#ffb36a', '#141a34', night)]]);
      stars(c, t, 60, 71, [560, 480, 380, 520], night);
      sun(c, 750, lerp(880, 1060, p), 60, '#ffb066', 1 - night);
      c.restore();
      c.strokeStyle = '#5a3a22'; c.lineWidth = 14; c.beginPath(); c.roundRect(560, 480, 380, 520, 190); c.stroke();
      glow(c, 300, 1180, 380, '#ffb466', 0.4 * (1 - night * 0.5) + 0.04 * Math.sin(t * 7));
      c.fillStyle = '#c98a3a'; c.beginPath(); c.ellipse(170, 1290, 26, 12, 0, 0, 6.283); c.fill();
      c.fillStyle = '#ffd890'; c.beginPath(); c.ellipse(170, 1266 + Math.sin(t * 9), 7, 14, 0, 0, 6.283); c.fill();
      c.fillStyle = '#3a2418'; c.fillRect(-100, 1300, W + 200, 800);
      c.fillStyle = '#6b2f2f'; c.beginPath(); c.roundRect(260, 1285, 520, 50, 12); c.fill();
      figure(c, Object.assign({ x: 420, y: 1300, h: 400, dir: 1, pose: 'sit', light: 0.7 * (1 - night * 0.6) }, NUH_OLD, { staff: false }));
      figure(c, Object.assign({ x: 700, y: 1310, h: 360, dir: -1, pose: 'kneel', light: 0.5 }, FOLK[4]));
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'لَا إِلَٰهَ إِلَّا اللَّهُ', t, d * 0.22, d * 0.8, 280, 110);
    },
  },

  outro: {
    grade: null,
    draw(c, t, d) {
      sky(c, [[0, '#05060f'], [0.6, '#0d1024'], [1, '#14122a']]);
      stars(c, t + 50, 140, 81, [0, 0, W, H], 0.7);
      const a = seg(t, 0.2, 1.2);
      c.save(); c.direction = 'rtl';
      textGlow(c, 'سَلَامٌ عَلَىٰ نُوحٍ', W / 2, 770, '700 100px Amiri', '#f6c453', a, '#ffb300', 30);
      textGlow(c, 'فِي الْعَالَمِينَ', W / 2, 900, '700 90px Amiri', '#f6c453', a, '#ffb300', 30);
      c.restore();
      const b = seg(t, 0.8, 1.8);
      textGlow(c, '« Paix sur Nuh dans tout l\'univers. »', W / 2, 1040, 'italic 500 42px Lora', '#f3e7d0', b, '#000', 10);
      textGlow(c, '— As-Saffat, 79', W / 2, 1100, 'italic 500 38px Lora', '#f3e7d0', b, '#000', 10);
      textGlow(c, 'LES PROPHÈTES  ·  À SUIVRE', W / 2, 1330, '600 34px Lora', '#c9b48a', seg(t, 1.6, 2.4), '#000', 8);
      c.fillStyle = 'rgba(0,0,0,' + seg(t, d - 0.8, d) + ')'; c.fillRect(0, 0, W, H);
    },
  },
};
