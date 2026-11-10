// Episode 1 — Yusuf (alayhi salam). Each scene: { grade, draw(c, t, d) } with t = local time, d = duration.
// Prophets (Yusuf, Ya'qub) are drawn with prophet:true -> face covered by white light.
// All other characters are faceless.

const BRO = [ // the brothers: muted robes, faceless
  { robe: '#5a4b40', wrap: '#7d6a58', skin: '#9a6a4c' }, { robe: '#46505c', wrap: '#6c7682', skin: '#b07a58' },
  { robe: '#6b5641', wrap: '#9a8468', skin: '#8f5f42' }, { robe: '#4b4038', wrap: '#6f6153', skin: '#a8714f' },
  { robe: '#3f4954', wrap: '#5e6b78', skin: '#94664a' }, { robe: '#5d4a3a', wrap: '#867058', skin: '#b4805c' },
  { robe: '#544a42', wrap: '#7a6e62', skin: '#9c6b4b' }, { robe: '#475058', wrap: '#66717c', skin: '#a77653' },
  { robe: '#62503f', wrap: '#8b7660', skin: '#8e5d40' }, { robe: '#4d443d', wrap: '#72665a', skin: '#ab7855' },
];
const YUSUF = { prophet: true, robe: '#b9cfdc', wrap: '#e9eef0', skin: '#d9a77f' };
const YAQUB = { prophet: true, robe: '#cbbfa6', wrap: '#e9e2d2', skin: '#c99872', staff: true };

function cam(c, z, cx = W / 2, cy = H / 2, dx = 0, dy = 0) {
  c.translate(W / 2 + dx, H / 2 + dy); c.scale(z, z); c.translate(-cx, -cy);
}
// draw A, then B fading in over [t0, t0+f]
function phases(c, t, t0, f, A, B) {
  const k = seg(t, t0, t0 + f);
  if (k < 1) { c.save(); A(c); c.restore(); }
  if (k > 0) layer(c, ease(k), cc => { cc.save(); B(cc); cc.restore(); });
}
function shirtShape(c, x, y, s, stain = true, a = 1) {
  c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#efe9dc'; c.beginPath();
  c.moveTo(-30, -60); c.lineTo(-70, -40); c.lineTo(-58, -10); c.lineTo(-36, -20); c.lineTo(-38, 60); c.lineTo(38, 60);
  c.lineTo(36, -20); c.lineTo(58, -10); c.lineTo(70, -40); c.lineTo(30, -60); c.quadraticCurveTo(0, -44, -30, -60); c.fill();
  if (stain) {
    c.fillStyle = '#8e1f1f'; c.beginPath(); c.ellipse(-6, 10, 20, 14, 0.4, 0, 6.283); c.fill();
    c.beginPath(); c.ellipse(14, 30, 10, 7, 0, 0, 6.283); c.fill(); c.beginPath(); c.ellipse(-16, 38, 6, 9, 0, 0, 6.283); c.fill();
  }
  c.restore();
}
function coin(c, x, y, r, spin, a = 1) {
  c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(Math.max(0.12, Math.abs(Math.cos(spin))), 1);
  c.fillStyle = '#c9ccd2'; c.beginPath(); c.arc(0, 0, r, 0, 6.283); c.fill();
  c.strokeStyle = '#8e939b'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, r * 0.72, 0, 6.283); c.stroke();
  c.restore();
  if (Math.cos(spin) > 0.92) star4(c, x + r * 0.4, y - r * 0.4, r * 0.7, '#ffffff', 0.8 * a);
}
function stoneWall(c, x0, y0, x1, y1, base, seed) {
  c.fillStyle = base; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  const r = rng(seed); let row = 0;
  for (let y = y0; y < y1; y += 70, row++) {
    for (let x = x0 - (row % 2) * 60; x < x1; x += 120) {
      c.fillStyle = mix(base, r() > 0.5 ? '#000000' : '#ffffff', 0.04 + r() * 0.06);
      c.beginPath(); c.roundRect(x + 4, y + 4, 112, 62, 8); c.fill();
    }
  }
}
function egyptColumn(c, x, y, w, h, c1, c2, band) {
  c.fillStyle = c1; c.fillRect(x - w / 2, y - h, w, h);
  c.fillStyle = c2; c.fillRect(x + w * 0.15, y - h, w * 0.35, h);
  c.fillStyle = c1; c.beginPath(); // papyrus capital
  c.moveTo(x - w / 2, y - h); c.quadraticCurveTo(x - w * 1.1, y - h - w * 0.6, x - w * 0.9, y - h - w * 1.1);
  c.lineTo(x + w * 0.9, y - h - w * 1.1); c.quadraticCurveTo(x + w * 1.1, y - h - w * 0.6, x + w / 2, y - h); c.fill();
  c.fillStyle = band;
  for (let i = 0; i < 3; i++) c.fillRect(x - w / 2, y - h + 30 + i * 22, w, 8);
  c.fillRect(x - w * 0.95, y - h - w * 1.1 - 20, w * 1.9, 22);
}
function crowd(c, list, t, opts) { list.forEach((f, i) => figure(c, Object.assign({}, opts, f, { walk: f.walk !== undefined ? f.walk : (opts.walking ? t * 1.1 + i * 0.37 : null) }))); }


const YUSUF_A = { prophet: true, robe: '#c4d6e0', wrap: '#e9eef0', skin: '#d9a77f', band: '#c9a14a' }; // adult Yusuf
const KING = { robe: '#2f4c6e', wrap: '#e6c55a', skin: '#a8724f', band: '#e6c55a' };
const HUSBAND = { robe: '#3b3a5a', wrap: '#d9cfa8', skin: '#a8724f', band: '#c9a14a' };
const WIFE = { robe: '#8a2f3a', wrap: '#5a1f28', skin: '#c48e66', band: '#c9a14a' };
const WOMEN = [ // veiled, faceless
  { robe: '#6a3a5a', wrap: '#4a2a40', skin: '#c48e66' }, { robe: '#3a5a6a', wrap: '#2a4050', skin: '#b07a58' },
  { robe: '#7a5a2a', wrap: '#5a4020', skin: '#c99872' }, { robe: '#5a3a3a', wrap: '#3a2626', skin: '#a8724f' },
  { robe: '#3a5a4a', wrap: '#284034', skin: '#c48e66' }, { robe: '#6a4a6a', wrap: '#4a304a', skin: '#b07a58' },
];
function prisonBg(c, t, o = {}) {
  stoneWall(c, -100, -100, W + 100, 1400, o.night ? '#1e222c' : '#2b2f38', 9);
  const years = o.years || 0;
  c.strokeStyle = 'rgba(220,210,190,0.45)'; c.lineWidth = 5;
  for (let i = 0; i < years; i++) {
    const gx = 90 + Math.floor(i / 5) % 6 * 110, gy = 700 + Math.floor(i / 30) * 140 + Math.floor((i % 30) / 5 / 6) * 0, k = i % 5;
    c.beginPath(); if (k < 4) { c.moveTo(gx + k * 18, gy); c.lineTo(gx + k * 18, gy + 90); } else { c.moveTo(gx - 10, gy + 80); c.lineTo(gx + 70, gy + 10); } c.stroke();
  }
  c.fillStyle = o.night ? '#7b8fb8' : '#d7e4f5'; c.beginPath(); c.roundRect(640, 470, 190, 150, 10); c.fill();
  c.fillStyle = '#1a1d24'; for (let i = 0; i < 4; i++) c.fillRect(660 + i * 46, 470, 12, 150);
  rays(c, 735, 550, Math.PI * (o.ang || 0.6), 0.22, 1300, 8, o.night ? '#8fa8e0' : '#cfe0ff', o.night ? 0.08 : 0.16, t, 12);
  c.fillStyle = '#20232b'; c.fillRect(-100, 1300, W + 200, 700);
  dust(c, t, 60, 41, [300, 400, 600, 900], '#dfe9ff', 0.4, 8);
}
function throneRoom(c, t) {
  c.fillStyle = '#3a1f14'; c.fillRect(-100, -100, W + 200, H + 200);
  c.save(); c.beginPath(); archPath(c, W / 2, 1000, 520, 600); c.clip();
  c.fillStyle = '#ffd99a'; c.fillRect(200, 380, 680, 640); lattice(c, 280, 400, 520, 600, '#8a4a22', 0.8, 34); c.restore();
  glow(c, W / 2, 720, 480, '#ffd890', 0.3);
  egyptColumn(c, 100, 1350, 130, 1050, '#a8703c', '#7f532a', '#3d6f7a'); egyptColumn(c, 980, 1350, 130, 1050, '#a8703c', '#7f532a', '#3d6f7a');
  c.fillStyle = '#6b3a1e'; c.fillRect(-100, 1150, W + 200, 900);
  c.fillStyle = '#8a5230'; c.fillRect(330, 1150, 420, 90); c.fillStyle = '#c9a14a'; c.fillRect(330, 1150, 420, 10);
  c.fillStyle = '#c9a14a'; c.fillRect(440, 820, 200, 330); c.fillStyle = '#9a7a30'; c.fillRect(460, 840, 160, 300); // throne
}
function bubble(c, x, y, r, a, from, fn) { // dream bubble rising from a sleeper
  if (a <= 0) return;
  c.save(); c.globalAlpha *= ease(a);
  for (let k = 0; k < 3; k++) { const f = (k + 1) / 4; c.fillStyle = 'rgba(230,220,255,0.5)'; c.beginPath(); c.arc(lerp(from[0], x, f), lerp(from[1], y + r, f), 10 + k * 8, 0, 6.283); c.fill(); }
  glow(c, x, y, r * 1.4, '#d8ccff', 0.35);
  c.beginPath(); c.arc(x, y, r * (0.85 + 0.15 * easeOut(a)), 0, 6.283); c.clip(); fn(c);
  c.restore();
  c.save(); c.globalAlpha *= ease(a); c.strokeStyle = 'rgba(240,230,255,0.7)'; c.lineWidth = 5; c.beginPath(); c.arc(x, y, r * (0.85 + 0.15 * easeOut(a)), 0, 6.283); c.stroke(); c.restore();
}
function grapes(c, x, y, s) {
  c.fillStyle = '#5a2a6a';
  for (let row = 0; row < 5; row++) for (let k = 0; k <= 4 - row; k++) { c.beginPath(); c.arc(x + (k - (4 - row) / 2) * 18 * s, y + row * 16 * s, 10 * s, 0, 6.283); c.fill(); }
  c.fillStyle = '#4a7a3a'; c.beginPath(); c.ellipse(x + 12 * s, y - 14 * s, 18 * s, 9 * s, -0.4, 0, 6.283); c.fill();
}
function bird(c, x, y, s, ph, color) {
  const f = Math.sin(ph * 9) * 16 * s;
  c.strokeStyle = color; c.lineWidth = 5 * s; c.lineCap = 'round'; c.beginPath();
  c.moveTo(x - 26 * s, y - f); c.quadraticCurveTo(x - 10 * s, y - 6 * s, x, y); c.quadraticCurveTo(x + 10 * s, y - 6 * s, x + 26 * s, y - f); c.stroke();
}

const SCENES = {
  // 1. Canaan at dusk — Yusuf and his father
  canaan: {
    grade: 'rgba(255,150,70,0.35)',
    draw(c, t, d) {
      const p = t / d;
      cam(c, 1.0 + 0.08 * ease(p), W / 2, 1050, 0, 0);
      sky(c, [[0, '#26304f'], [0.3, '#7d5a6e'], [0.48, '#e39a63'], [0.6, '#f7d39b']]);
      stars(c, t, 50, 3, [0, 0, W, 520], 0.6 * (1 - p));
      sun(c, 790, 1010 + p * 30, 70, '#ffc070');
      rays(c, 790, 1010, Math.PI * 0.8, 1.2, 1400, 9, '#ffcf8a', 0.10, t, 5);
      ridge(c, 1060, 90, 0.004, 1, '#c98a6c');
      ridge(c, 1150, 110, 0.003, 2, '#9b6553', { rim: 'rgba(255,190,130,.35)' });
      tent(c, 250, 1110, 170, 90, '#6d4438', '#3d2620'); tent(c, 390, 1120, 120, 64, '#7a4c3d', '#3d2620');
      oliveTree(c, 880, 1170, 1.0, '#5a4a3a', '#43362b', Math.sin(t * 0.7) * 4);
      oliveTree(c, 130, 1200, 0.8, '#5a4a3a', '#43362b', Math.sin(t * 0.6) * 3);
      ridge(c, 1290, 50, 0.002, 7, '#4f3029');
      figure(c, Object.assign({ x: 440, y: 1285, h: 400, dir: 1 }, YAQUB));
      figure(c, Object.assign({ x: 610, y: 1290, h: 270, dir: -1, child: true }, YUSUF));
      dust(c, t, 60, 9, [0, 600, W, 800], '#ffdca8', 0.45);
      // title card
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a = seg(t, 0.2, 1.2) * (1 - seg(t, 6.2, 7.2));
      textGlow(c, 'LES PROPHÈTES  ·  ÉPISODE 1', W / 2, 215, '600 34px Lora', '#fbe7c6', a * 0.9, '#000000', 12);
      c.save(); c.direction = 'rtl';
      textGlow(c, 'يُوسُف', W / 2, 430 - (1 - easeOut(seg(t, 0.4, 1.6))) * 30, '700 170px Amiri', '#f6c453', a, '#ffb300', 40);
      c.restore();
      textGlow(c, 'ʿalayhi s-salām', W / 2, 585, 'italic 500 46px Lora', '#fff3dc', a, '#000000', 14);
    },
  },

  // 2. The dream — eleven stars, the sun and the moon bow down
  dream: {
    grade: 'rgba(60,90,200,0.3)',
    draw(c, t, d) {
      const p = t / d;
      cam(c, 1.06 - 0.06 * ease(p), W / 2, 900, 0, 0);
      sky(c, [[0, '#050818'], [0.5, '#141d42'], [0.75, '#26305c']]);
      stars(c, t, 180, 11, [0, 0, W, 1150], 0.9);
      // celestial bodies: appear one by one, then bow toward the dreamer
      const bow = ease(seg(t, d * 0.42, d * 0.62));
      const cx = W / 2, cy = 560;
      for (let i = 0; i < 11; i++) {
        const ang = Math.PI * (0.12 + 0.76 * i / 10);
        const app = seg(t, 0.6 + i * 0.32, 1.2 + i * 0.32);
        const x = cx - Math.cos(ang) * 400, y = cy + 260 - Math.sin(ang) * 300 + bow * 120 * Math.sin(ang);
        star4(c, x, y, 20 + 4 * Math.sin(t * 2 + i), '#ffe9a8', app * (0.8 + 0.2 * bow));
      }
      const appS = seg(t, 4.4, 5.4), appM = seg(t, 5.0, 6.0);
      sun(c, cx - 230, cy - 30 + bow * 170, 46, '#ffc35a', appS);
      moon(c, cx + 230, cy - 30 + bow * 170, 50, appM);
      // the tent and the sleeping child
      c.fillStyle = '#0d0f1d'; c.beginPath(); c.moveTo(-50, 1500); c.lineTo(-50, 950); c.quadraticCurveTo(80, 1050, 160, 1500); c.fill();
      c.beginPath(); c.moveTo(W + 50, 1500); c.lineTo(W + 50, 950); c.quadraticCurveTo(W - 80, 1050, W - 160, 1500); c.fill();
      c.fillStyle = '#1b1a2a'; c.fillRect(-50, 1300, W + 100, 700);
      c.fillStyle = '#6b2f2f'; c.beginPath(); c.roundRect(300, 1255, 480, 60, 12); c.fill();
      c.fillStyle = '#8a4a3c'; for (let i = 0; i < 6; i++) c.fillRect(320 + i * 76, 1265, 40, 8);
      glow(c, 840, 1210, 260, '#ffb466', 0.35 + 0.05 * Math.sin(t * 7));
      c.fillStyle = '#c98a3a'; c.beginPath(); c.ellipse(840, 1250, 26, 12, 0, 0, 6.283); c.fill();
      c.fillStyle = '#ffd890'; c.beginPath(); c.ellipse(840, 1226 + Math.sin(t * 9), 7, 14, 0, 0, 6.283); c.fill();
      figure(c, Object.assign({ x: 560, y: 1262, h: 250, dir: 1, pose: 'lie', child: true }, YUSUF));
      // father appears to warn him
      const fa = ease(seg(t, d * 0.62, d * 0.75));
      if (fa > 0) figure(c, Object.assign({ x: 250, y: 1300, h: 380, dir: 1, pose: 'sit', alpha: fa }, YAQUB));
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'أَحَدَ عَشَرَ كَوْكَبًا', t, 1.0, d * 0.6, 260, 84);
    },
  },

  // 3. Jealousy and the well
  well: {
    grade: 'rgba(40,70,140,0.38)',
    draw(c, t, d) {
      phases(c, t, d * 0.42, 0.9, c => {
        const p = t / (d * 0.5);
        cam(c, 1.0 + 0.05 * p, W / 2, 1000);
        sky(c, [[0, '#28324a'], [0.45, '#6b6b7a'], [0.62, '#b49a86']]);
        dune(c, -200, 700, 1150, 160, '#8d7b6e', '#6e5f56'); dune(c, 300, 1300, 1170, 200, '#7d6c61', '#5e5049');
        ridge(c, 1300, 30, 0.003, 4, '#4c4039');
        const walkX = -80 + t * 95;
        BRO.forEach((b, i) => figure(c, Object.assign({ x: walkX + i * 62 - (i % 2) * 20, y: 1290 + (i % 3) * 14, h: 330 + (i % 4) * 14, dir: 1, walk: t * 1.2 + i * 0.3, light: 0.5 }, b)));
        figure(c, Object.assign({ x: walkX + 680, y: 1300, h: 240, dir: -1, child: true, walk: t * 1.2 }, YUSUF));
      }, c => {
        const q = seg(t, d * 0.42, d);
        cam(c, 1.0 + 0.06 * q, W / 2, 900, 0, 0);
        c.fillStyle = '#0b1220'; c.fillRect(-100, -100, W + 200, H + 200);
        sky(c, [[0, '#0c1630'], [0.25, '#1d2c50'], [0.3, '#0b1220']]); // night above
        c.fillStyle = '#0b1220'; c.fillRect(-100, 560, W + 200, H);
        stars(c, t, 60, 21, [0, 0, W, 480], 0.8);
        moon(c, 760, 230, 52, 1);
        // earth cross-section
        stoneWall(c, -100, 560, 400, 1500, '#232a36', 3); stoneWall(c, 680, 560, W + 100, 1500, '#232a36', 4);
        c.fillStyle = '#070b14'; c.fillRect(400, 560, 280, 940);
        c.fillStyle = '#3a4252'; c.fillRect(360, 530, 60, 50); c.fillRect(660, 530, 60, 50);
        rays(c, 540, 470, Math.PI / 2, 0.18, 950, 6, '#a9c4ff', 0.13, t, 8);
        // water
        c.fillStyle = '#10223d'; c.fillRect(400, 1310, 280, 200);
        for (let i = 0; i < 4; i++) {
          const rr = ((t * 30 + i * 40) % 160);
          c.strokeStyle = `rgba(160,190,255,${0.3 * (1 - rr / 160)})`; c.lineWidth = 2;
          c.beginPath(); c.ellipse(540, 1312, rr, rr * 0.12, 0, 0, 6.283); c.stroke();
        }
        c.fillStyle = '#2d3442'; c.beginPath(); c.ellipse(560, 1316, 90, 20, 0, 0, 6.283); c.fill(); // stone ledge
        // the boy falls, then sits alone
        const fall = easeIn(seg(t, d * 0.5, d * 0.62));
        if (fall < 1) figure(c, Object.assign({ x: 545, y: lerp(560, 1300, fall), h: 210, dir: 1, child: true }, YUSUF));
        else figure(c, Object.assign({ x: 560, y: 1306, h: 200, dir: 1, child: true, pose: 'sit' }, YUSUF));
        // brothers looking down, then leaving
        const lv = seg(t, d * 0.72, d * 0.9);
        [[300, 0], [420, 1], [660, 2], [780, 3]].forEach(([x, i]) =>
          figure(c, Object.assign({ x: x, y: 600, h: 260, dir: x < 540 ? 1 : -1, alpha: 1 - lv, light: 0.2 }, BRO[i], { robe: '#141a24', wrap: '#1d2430', skin: '#1a1f28' })));
        c.fillStyle = '#0d1424'; c.fillRect(-100, 560, 400, 30);
      });
    },
  },

  // 4. The blood-stained shirt — "a beautiful patience"
  shirt: {
    grade: 'rgba(40,60,130,0.35)',
    draw(c, t, d) {
      const p = t / d;
      cam(c, 1.0 + 0.16 * ease(seg(p, 0.45, 1)), lerp(W / 2, 740, ease(seg(p, 0.45, 1))), lerp(1000, 1080, ease(seg(p, 0.45, 1))));
      sky(c, [[0, '#070a18'], [0.45, '#18203c'], [0.62, '#2b3150']]);
      stars(c, t, 120, 31, [0, 0, W, 900], 0.8);
      ridge(c, 1100, 70, 0.003, 12, '#1a1d2c');
      tent(c, 800, 1290, 520, 300, '#3b2a28', '#120c0c');
      glow(c, 800, 1220, 300, '#ff9b4a', 0.32 + 0.04 * Math.sin(t * 6));
      c.fillStyle = '#161521'; c.fillRect(-100, 1280, W + 200, 800);
      // campfire
      glow(c, 560, 1290, 220, '#ff8a3a', 0.45 + 0.06 * Math.sin(t * 9));
      for (let i = 0; i < 3; i++) {
        c.fillStyle = ['#ff7a2a', '#ffb347', '#ffe39a'][i]; c.beginPath();
        const fh = 70 - i * 18 + Math.sin(t * 8 + i) * 8;
        c.moveTo(530 + i * 10, 1292); c.quadraticCurveTo(545 + Math.sin(t * 6 + i) * 8, 1292 - fh * 0.7, 560 + Math.sin(t * 7) * 4, 1292 - fh);
        c.quadraticCurveTo(575, 1292 - fh * 0.6, 590 - i * 10, 1292); c.fill();
      }
      figure(c, Object.assign({ x: 790, y: 1300, h: 360, dir: -1, pose: 'sit', light: 0.4 }, YAQUB));
      // brothers arrive from the left, the first one holding the shirt
      const arr = easeOut(seg(t, 0, d * 0.35));
      const bx = lerp(-300, 120, arr);
      [4, 1, 6, 2, 0].forEach((bi, k) => figure(c, Object.assign({ x: bx + k * 70 - 140, y: 1300 + (k % 2) * 12, h: 360, dir: 1, walk: arr < 1 ? t * 1.1 + k * 0.3 : null, light: 0.35 }, BRO[bi])));
      figure(c, Object.assign({ x: bx + 230, y: 1305, h: 370, dir: 1, walk: arr < 1 ? t * 1.1 : null, armUp: 1, light: 0.4 }, BRO[3]));
      shirtShape(c, bx + 290, 980, 1.0 + 0.04 * Math.sin(t * 2));
      // falling tears of light (sadness)
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'فَصَبْرٌ جَمِيلٌ', t, d * 0.62, d + 1, 300, 110, '#dfe8ff');
    },
  },

  // 5. The caravan — sold for a few coins
  caravan: {
    grade: 'rgba(255,170,80,0.38)',
    draw(c, t, d) {
      const p = t / d;
      cam(c, 1.04 + 0.04 * p, W / 2, 1000);
      sky(c, [[0, '#4f7a9a'], [0.3, '#bfc8b0'], [0.5, '#f4d49a']]);
      sun(c, 820, 360, 60, '#fff0b0');
      dune(c, -300, 600, 980, 130, '#e7b87a', '#c9965f'); dune(c, 300, 1400, 1000, 170, '#dcaa6c', '#bb8752');
      // caravan crossing
      for (let i = 0; i < 4; i++) {
        const x = -250 + t * 70 + i * 230;
        camel(c, x, 1040 + i * 4, 0.75, '#7a5233', t + i * 0.4, 1, i % 2 ? '#a0442f' : '#5c6b7a');
        figure(c, { x: x + 160 * 0.75, y: 1040, h: 210, dir: 1, walk: t * 1.1 + i, robe: ['#8a6a4a', '#5d6b74', '#7d5c45', '#6b5d4d'][i], wrap: '#d8ccb4', skin: '#9c6a48', light: 0.8 });
      }
      dune(c, -400, 1500, 1260, 120, '#d9a565', '#b47e4a');
      // the well and the rescue
      c.fillStyle = '#8c7a66'; c.beginPath(); c.roundRect(420, 1180, 240, 120, 14); c.fill();
      c.fillStyle = '#6e5e4e'; for (let i = 0; i < 4; i++) c.fillRect(430 + i * 58, 1200 + (i % 2) * 40, 50, 30);
      c.fillStyle = '#3a2e24'; c.beginPath(); c.ellipse(540, 1182, 120, 22, 0, 0, 6.283); c.fill();
      c.strokeStyle = '#5a3d27'; c.lineWidth = 10; c.beginPath(); c.moveTo(440, 1180); c.lineTo(450, 1000); c.lineTo(630, 1000); c.lineTo(640, 1180); c.stroke();
      const pull = ease(seg(t, d * 0.18, d * 0.45));
      figure(c, { x: 330, y: 1290, h: 360, dir: 1, robe: '#7d5c45', wrap: '#e2d6bd', skin: '#a06c4a', armUp: 1 - pull * 0.3 });
      c.strokeStyle = '#3b2a1c'; c.lineWidth = 4; c.beginPath(); c.moveTo(540, 1000); c.lineTo(540, lerp(1240, 1120, pull)); c.stroke();
      const up = ease(seg(t, d * 0.42, d * 0.6));
      if (up > 0) figure(c, Object.assign({ x: lerp(540, 720, up), y: lerp(1260, 1300, up), h: 250, dir: -1, child: true, alpha: up }, YUSUF));
      // coins
      for (let i = 0; i < 6; i++) {
        const ct = seg(t, d * 0.68 + i * 0.18, d * 0.68 + i * 0.18 + 0.6);
        if (ct > 0) coin(c, 300 + i * 95, lerp(1000, 1390 + (i % 2) * 20, easeIn(ct)), 26, t * 6 + i, 1);
      }
      dust(c, t, 40, 17, [0, 800, W, 700], '#fff0c8', 0.35, 20);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'دَرَاهِمَ مَعْدُودَةٍ', t, d * 0.66, d + 1, 300, 96);
    },
  },

  // 6. The palace — he flees temptation
  palace: {
    grade: 'rgba(255,160,70,0.3)',
    draw(c, t, d) {
      const p = t / d, run = ease(seg(t, d * 0.55, d));
      cam(c, 1.0 + 0.1 * run, W / 2, 950);
      c.fillStyle = '#3a1f14'; c.fillRect(-100, -100, W + 200, H + 200);
      // corridor of doors toward a vanishing point
      const vx = W / 2, vy = 880, close = ease(seg(t, d * 0.35, d * 0.55));
      for (let i = 7; i >= 0; i--) {
        const s = Math.pow(0.72, i), w = 820 * s, h = 1250 * s, y = vy + 520 * s;
        c.fillStyle = mix('#8a4a26', '#2a140c', i / 8); c.fillRect(vx - w / 2 - 60 * s, y - h - 60 * s, w + 120 * s, h + 60 * s);
        c.fillStyle = mix('#ffcf7a', '#ffe7b0', i / 8);
        if (i === 7) { glow(c, vx, y - h / 2, 400 * s + 200, '#fff0c0', 0.6 + 0.4 * run); }
        c.fillStyle = mix('#c8783a', '#ffe0a0', i / 7 * (0.3 + 0.7 * run));
        c.fillRect(vx - w / 2, y - h, w, h);
        // door leaves closing then bursting open at the end
        const open = i <= 1 ? close * (1 - run) : 0;
        if (open > 0) {
          c.fillStyle = '#5a2e18'; c.fillRect(vx - w / 2, y - h, w / 2 * open, h); c.fillRect(vx + w / 2 - w / 2 * open, y - h, w / 2 * open, h);
        }
      }
      // big columns in front
      [[110, '#b5793f', '#8c5a2e'], [970, '#b5793f', '#8c5a2e']].forEach(([x, c1, c2]) => egyptColumn(c, x, 1500, 150, 1150, c1, c2, '#3d6f7a'));
      // flowing curtain (only a hint of the scene)
      c.fillStyle = 'rgba(150,40,40,0.75)'; c.beginPath(); c.moveTo(180, 200);
      for (let y = 200; y <= 1450; y += 50) c.lineTo(250 + Math.sin(y * 0.01 + t * 1.5) * 25 + (y - 200) * 0.06, y);
      c.lineTo(180, 1450); c.fill();
      // floor
      const fg = c.createLinearGradient(0, 1400, 0, 1920); fg.addColorStop(0, '#6b3a1e'); fg.addColorStop(1, '#2a140b');
      c.fillStyle = fg; c.fillRect(-100, 1400, W + 200, 600);
      c.fillStyle = 'rgba(255,210,140,0.15)'; c.beginPath(); c.moveTo(vx - 120, 1400); c.lineTo(vx + 120, 1400); c.lineTo(vx + 400, 1920); c.lineTo(vx - 400, 1920); c.fill();
      // Yusuf: stands, then walks away from us toward the light
      const sc = lerp(1, 0.42, run);
      figure(c, Object.assign({ x: lerp(540, vx, run), y: lerp(1480, 1080, run), h: 470 * sc, dir: 1, walk: run > 0 && run < 1 ? t * 2.2 : null, band: '#c9a14a', robe: '#c4d6e0' }, { prophet: true, wrap: '#e9eef0', skin: '#d9a77f' }));
      dust(c, t, 50, 23, [200, 300, 700, 1200], '#ffe4b0', 0.4);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'مَعَاذَ اللَّهِ', t, d * 0.66, d + 1, 300, 120);
    },
  },

  // 7. Accusation — the shirt torn from behind
  accuse: {
    grade: 'rgba(210,90,60,0.3)',
    draw(c, t, d) {
      phases(c, t, d * 0.55, 0.9, c => {
        const p = seg(t, 0, d * 0.6);
        cam(c, 1.0 + 0.05 * p, W / 2, 1000);
        c.fillStyle = '#3a1d12'; c.fillRect(-100, -100, W + 200, H + 200);
        stoneWall(c, -100, 200, W + 100, 1350, '#5a301c', 14);
        // the door bursts open: light and the husband standing in it
        const open = ease(seg(t, 0.2, 1.4));
        c.fillStyle = '#2a140b'; c.fillRect(330, 420, 420, 900);
        c.save(); c.beginPath(); c.rect(540 - 210 * open, 420, 420 * open, 900); c.clip();
        c.fillStyle = '#ffe2a8'; c.fillRect(330, 420, 420, 900); glow(c, 540, 870, 500, '#fff4d8', 0.9); c.restore();
        c.fillStyle = '#c9a14a'; c.fillRect(310, 400, 460, 24); c.fillRect(310, 400, 22, 920); c.fillRect(748, 400, 22, 920);
        rays(c, 540, 870, Math.PI / 2, 2.2, 1100, 10, '#ffe2a8', 0.08 * open, t, 3);
        figure(c, Object.assign({ x: 540, y: 1310, h: 520, dir: -1, light: 0.1, alpha: open }, HUSBAND, { robe: '#231a22', wrap: '#3a2c30', skin: '#2a1d1d' }));
        c.fillStyle = '#4a2716'; c.fillRect(-100, 1320, W + 200, 700);
        figure(c, Object.assign({ x: 250, y: 1500, h: 520, dir: 1, light: 0.8 }, YUSUF_A));
        c.strokeStyle = '#4a2716'; c.lineWidth = 9; c.beginPath(); // torn back of his shirt
        for (let k = 0; k <= 8; k++) c.lineTo(250 - 52 + (k % 2) * 12, 1500 - 400 + k * 30); c.stroke();
        const accuse = ease(seg(t, d * 0.2, d * 0.32));
        figure(c, Object.assign({ x: 860, y: 1510, h: 500, dir: -1, armUp: accuse, light: 0.6 }, WIFE));
      }, c => {
        const q = seg(t, d * 0.55, d);
        cam(c, 1.0 + 0.08 * q, W / 2, 950);
        sky(c, [[0, '#2a140b'], [0.5, '#5a2e18'], [1, '#2a140b']]);
        glow(c, 540, 900, 700, '#ffc67a', 0.35);
        c.save(); c.translate(540, 950); c.rotate(Math.sin(t * 0.8) * 0.02); shirtShape(c, 0, 0, 5.2, false); 
        c.fillStyle = '#3a1d12'; c.beginPath(); c.moveTo(-14, -230);
        for (let k = 0; k <= 10; k++) c.lineTo((k % 2 ? 26 : -22) + Math.sin(k) * 8, -230 + k * 54);
        for (let k = 10; k >= 0; k--) c.lineTo((k % 2 ? 6 : -40) + Math.sin(k) * 8, -230 + k * 54);
        c.fill(); c.restore();
        textGlow(c, 'DÉCHIRÉE PAR-DERRIÈRE', W / 2, 1300, '600 40px Lora', '#fbe7c6', seg(t, d * 0.65, d * 0.75) * 0.9, '#000', 12);
        c.setTransform(1, 0, 0, 1, 0, 0);
        arabicCaption(c, 'قُدَّ مِن دُبُرٍ', t, d * 0.62, d + 1, 300, 120);
      });
    },
  },

  // 8. The women of the city cut their hands
  women: {
    grade: 'rgba(255,165,85,0.32)',
    draw(c, t, d) {
      const p = t / d, enter = ease(seg(t, d * 0.4, d * 0.62)), cut = seg(t, d * 0.62, d * 0.8);
      cam(c, 1.0 + 0.07 * ease(p), W / 2, 1050);
      c.fillStyle = '#3a1f14'; c.fillRect(-100, -100, W + 200, H + 200);
      // arcaded back wall with lattice windows
      for (let i = 0; i < 3; i++) {
        const ax = 180 + i * 360;
        c.save(); c.beginPath(); archPath(c, ax, 1150, 240, 560); c.clip();
        c.fillStyle = i === 1 ? '#ffe6b0' : '#e7a865'; c.fillRect(ax - 130, 580, 260, 580);
        if (i !== 1) lattice(c, ax - 130, 580, 260, 580, '#7a3e1e', 0.85, 30);
        c.restore();
        c.strokeStyle = '#c9a14a'; c.lineWidth = 8; c.beginPath(); archPath(c, ax, 1150, 240, 560); c.stroke();
      }
      glow(c, 540, 880, 420, '#fff2c8', 0.25 + 0.5 * enter);
      for (let i = 0; i < 4; i++) { // hanging lamps
        const lx = 120 + i * 280, ly = 330 + Math.sin(t + i) * 6;
        c.strokeStyle = '#2a140b'; c.lineWidth = 3; c.beginPath(); c.moveTo(lx, 0); c.lineTo(lx, ly); c.stroke();
        glow(c, lx, ly + 20, 140, '#ffb45a', 0.45 + 0.05 * Math.sin(t * 6 + i));
        c.fillStyle = '#c9a14a'; c.beginPath(); c.moveTo(lx - 22, ly); c.lineTo(lx + 22, ly); c.lineTo(lx + 10, ly + 40); c.lineTo(lx - 10, ly + 40); c.fill();
      }
      c.fillStyle = '#5a2e18'; c.fillRect(-100, 1150, W + 200, 900);
      c.fillStyle = '#7a2f2a'; c.fillRect(-100, 1330, W + 200, 260);
      c.fillStyle = '#9a4a32'; for (let i = 0; i < 14; i++) c.fillRect(i * 80, 1345, 40, 8);
      // Yusuf enters through the central arch
      if (enter > 0) figure(c, Object.assign({ x: 540, y: lerp(1150, 1260, enter), h: lerp(330, 440, enter), dir: 1, alpha: enter, light: 1 }, YUSUF_A));
      // the women, seated, each with a fruit and a knife
      WOMEN.forEach((wmn, i) => {
        const left = i < 3, x = left ? 110 + i * 150 : 970 - (i - 3) * 150, y = 1450 + (i % 3) * 25, dir = left ? 1 : -1;
        figure(c, Object.assign({ x, y, h: 330, dir, pose: 'sit', light: 0.4 + 0.6 * enter }, wmn));
        const hx = x + dir * 58, hy = y - 110;
        c.fillStyle = '#f2c14e'; c.beginPath(); c.arc(hx + dir * 18, hy + 6, 15, 0, 6.283); c.fill();
        c.strokeStyle = '#dfe4ea'; c.lineWidth = 5; c.beginPath(); c.moveTo(hx - dir * 6, hy + 16); c.lineTo(hx + dir * 26, hy - 14); c.stroke();
        if (cut > 0) {
          c.fillStyle = '#b3201f';
          for (let k = 0; k < 3; k++) { const dy = ((t * 60 + k * 30 + i * 13) % 90) * cut; c.beginPath(); c.arc(hx + dir * 8 + k * 4, hy + 18 + dy, 4.5, 0, 6.283); c.fill(); }
        }
      });
      dust(c, t, 50, 91, [100, 500, 880, 900], '#fff0c8', 0.35);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'مَا هَٰذَا بَشَرًا', t, d * 0.72, d + 1, 260, 120);
    },
  },

  // 9. He chooses prison
  prison: {
    grade: 'rgba(50,80,130,0.38)',
    draw(c, t, d) {
      const p = t / d, bars = ease(seg(t, d * 0.55, d * 0.85));
      cam(c, 1.1 - 0.08 * ease(p), W / 2, 1050);
      prisonBg(c, t, { ang: 0.6 });
      figure(c, Object.assign({ x: 540, y: 1360, h: 420, dir: 1, pose: 'kneel', light: 0.8 }, YUSUF_A));
      // the gate slides shut in the foreground
      c.fillStyle = '#0c0e13';
      const gx = lerp(W + 40, -40, bars);
      for (let i = 0; i < 12; i++) { const x = gx + i * 100; if (x < W + 60) c.fillRect(x, -100, 26, H + 200); }
      if (bars > 0) { c.fillRect(gx, 520, W + 200, 22); c.fillRect(gx, 1180, W + 200, 22); }
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'رَبِّ السِّجْنُ أَحَبُّ إِلَيَّ', t, d * 0.15, d + 1, 280, 96, '#e6efff');
    },
  },

  // 10. Two companions and their dreams
  companions: {
    grade: 'rgba(60,70,150,0.35)',
    draw(c, t, d) {
      const p = t / d;
      cam(c, 1.0 + 0.05 * p, W / 2, 1000);
      prisonBg(c, t, { ang: 0.55, night: true });
      figure(c, Object.assign({ x: 540, y: 1310, h: 260, dir: 1, pose: 'sit', light: 0.5 }, YUSUF_A));
      figure(c, { x: 300, y: 1360, h: 300, dir: 1, pose: 'lie', robe: '#4a4f5a', wrap: '#6a707c', skin: '#9a6a4c' });
      figure(c, { x: 800, y: 1365, h: 300, dir: -1, pose: 'lie', robe: '#5a4c40', wrap: '#7c6c5c', skin: '#b07a58' });
      // dream 1: pressing grapes into a cup
      bubble(c, 290, 760, 230, seg(t, d * 0.12, d * 0.25), [205, 1320], cc => {
        sky(cc, [[0.25, '#3a2050'], [0.45, '#7a4a7a']]);
        for (let k = 0; k < 3; k++) grapes(cc, 210 + k * 80, 680 + (k % 2) * 30, 1);
        cc.fillStyle = '#e8c15a'; cc.beginPath(); cc.moveTo(240, 860); cc.lineTo(340, 860); cc.quadraticCurveTo(330, 920, 290, 925); cc.quadraticCurveTo(250, 920, 240, 860); cc.fill();
        cc.fillRect(284, 925, 12, 40); cc.fillRect(262, 962, 56, 10);
        cc.fillStyle = '#6a1f4a'; for (let k = 0; k < 3; k++) { const dy = (t * 120 + k * 40) % 110; cc.beginPath(); cc.arc(290, 750 + dy, 6, 0, 6.283); cc.fill(); }
      });
      // dream 2: bread on his head, birds eating
      bubble(c, 790, 760, 230, seg(t, d * 0.5, d * 0.63), [880, 1325], cc => {
        sky(cc, [[0.25, '#203048'], [0.45, '#4a5a7a']]);
        figure(cc, { x: 790, y: 980, h: 300, dir: 1, robe: '#5a4c40', wrap: '#7c6c5c', skin: '#b07a58' });
        cc.fillStyle = '#c98c4a'; cc.beginPath(); cc.ellipse(795, 690, 70, 26, 0, 0, 6.283); cc.fill();
        cc.fillStyle = '#e0aa62'; for (let k = 0; k < 3; k++) { cc.beginPath(); cc.ellipse(760 + k * 35, 670, 22, 14, 0, 0, 6.283); cc.fill(); }
        for (let k = 0; k < 4; k++) bird(cc, 795 + Math.cos(t * 1.5 + k * 1.6) * 120, 620 + Math.sin(t * 2 + k) * 50, 1, t * 1.3 + k, '#1a1d28');
      });
    },
  },

  // 11. He calls them to tawhid, then interprets
  interpret: {
    grade: 'rgba(60,85,140,0.32)',
    draw(c, t, d) {
      const p = t / d, raise = ease(seg(t, 0.4, 1.2)) * (1 - ease(seg(t, d * 0.4, d * 0.5)));
      const good = ease(seg(t, d * 0.45, d * 0.6)), bad = ease(seg(t, d * 0.7, d * 0.82));
      cam(c, 1.06 - 0.05 * ease(p), W / 2, 1050);
      prisonBg(c, t, { ang: 0.62 });
      figure(c, Object.assign({ x: 540, y: 1340, h: 450, dir: 1, armUp: raise, light: 0.9 }, YUSUF_A));
      if (good > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 240, 1180, 300, '#ffc86a', 0.5 * good); c.restore(); }
      figure(c, { x: 240, y: 1380, h: 370, dir: 1, pose: 'sit', robe: '#4a4f5a', wrap: '#6a707c', skin: '#9a6a4c', light: 0.3 + good });
      // golden cup for the cupbearer
      if (good > 0) {
        c.save(); c.globalAlpha = good; c.fillStyle = '#f2c14e';
        c.beginPath(); c.moveTo(200, 900); c.lineTo(280, 900); c.quadraticCurveTo(272, 960, 240, 965); c.quadraticCurveTo(208, 960, 200, 900); c.fill();
        c.fillRect(235, 965, 10, 34); c.fillRect(216, 996, 48, 8); star4(c, 268, 910, 16, '#fff5d0', good); c.restore();
      }
      figure(c, { x: 850, y: 1385, h: 360, dir: -1, pose: 'sit', robe: '#5a4c40', wrap: '#7c6c5c', skin: '#b07a58', light: 0.3 * (1 - bad) });
      if (bad > 0) { c.fillStyle = `rgba(5,8,16,${0.45 * bad})`; c.fillRect(680, 300, 520, 1200);
        for (let k = 0; k < 3; k++) bird(c, 850 + Math.cos(t + k * 2.1) * 120, 900 + Math.sin(t * 1.4 + k) * 60, 1.2, t * 1.4 + k, `rgba(10,10,16,${bad})`); }
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'اللَّهُ الْوَاحِدُ الْقَهَّارُ', t, 0.3, d * 0.45, 280, 92, '#e6efff');
    },
  },

  // 12. Forgotten — years in prison
  forgotten: {
    grade: 'rgba(50,75,130,0.4)',
    draw(c, t, d) {
      phases(c, t, d * 0.45, 0.9, c => {
        const go = ease(seg(t, d * 0.12, d * 0.48));
        cam(c, 1.03, W / 2, 1000);
        prisonBg(c, t, { ang: 0.6 });
        c.fillStyle = '#0c0e13'; c.fillRect(600, 680, 320, 670);
        c.save(); c.beginPath(); c.rect(620, 700, 280, 650); c.clip(); c.fillStyle = '#ffe9c0'; c.fillRect(600, 680, 320, 670); glow(c, 760, 960, 400, '#ffffff', 0.7); c.restore();
        figure(c, { x: lerp(620, 760, go), y: lerp(1360, 1250, go), h: lerp(400, 250, go), dir: 1, walk: go < 1 ? t * 1.4 : null, robe: '#4a4f5a', wrap: '#6a707c', skin: '#9a6a4c', light: 0.2 });
        figure(c, Object.assign({ x: 330, y: 1380, h: 440, dir: 1, armUp: 0.5, light: 0.8 }, YUSUF_A));
      }, c => {
        const q = seg(t, d * 0.45, d);
        cam(c, 1.0 + 0.06 * q, W / 2, 1050);
        prisonBg(c, t, { ang: 0.45 + 0.3 * ((q * 4) % 1), years: Math.floor(4 + q * 26) });
        figure(c, Object.assign({ x: 620, y: 1360, h: 400, dir: -1, pose: 'kneel', light: 0.7 }, YUSUF_A));
        c.setTransform(1, 0, 0, 1, 0, 0);
        arabicCaption(c, 'بِضْعَ سِنِينَ', t, d * 0.6, d + 1, 280, 120, '#e6efff');
      });
    },
  },

  // 13. The king's dream
  king: {
    grade: 'rgba(170,120,220,0.28)',
    draw(c, t, d) {
      phases(c, t, d * 0.68, 0.9, c => {
        cam(c, 1.02, W / 2, 1000);
        sky(c, [[0, '#1e1838'], [0.4, '#4b3a6b'], [0.62, '#b88aa0']]);
        glow(c, W / 2, 900, 700, '#e6c3ff', 0.25);
        c.fillStyle = '#3b5f74'; c.fillRect(-100, 1080, W + 200, 60);
        c.fillStyle = '#5a4870'; c.fillRect(-100, 1140, W + 200, 800);
        for (let i = 0; i < 7; i++) {
          const fx = -200 + t * 80 + i * 170, eaten = seg(t, d * 0.18 + i * 0.22, d * 0.18 + i * 0.22 + 1.2);
          c.save(); c.globalAlpha = 1 - eaten; cow(c, fx, 1260 - (i % 2) * 40, 0.75, '#e2c9a6', true, t + i, 1); c.restore();
        }
        for (let i = 0; i < 7; i++) cow(c, W + 200 - seg(t, d * 0.1, d * 0.45) * 900 + i * 150, 1380 - (i % 2) * 30, 0.7, '#3a2b3e', false, t + i, -1);
        const ears = ease(seg(t, d * 0.4, d * 0.55));
        c.save(); c.globalAlpha = ears;
        for (let i = 0; i < 7; i++) wheat(c, 40 + i * 62, 1078, 0.55, '#7fb24a', false, t);
        for (let i = 0; i < 7; i++) wheat(c, 600 + i * 62, 1078, 0.55, '#8a7046', true, t);
        c.restore();
        c.setTransform(1, 0, 0, 1, 0, 0);
        arabicCaption(c, 'سَبْعَ بَقَرَاتٍ سِمَانٍ', t, 0.6, d * 0.68, 280, 96, '#f2d9ff');
      }, c => {
        const q = seg(t, d * 0.68, d);
        cam(c, 1.0 + 0.05 * q, W / 2, 1000);
        throneRoom(c, t);
        figure(c, Object.assign({ x: 540, y: 1150, h: 380, dir: 1, pose: 'sit' }, KING));
        for (let i = 0; i < 6; i++) {
          const x = i < 3 ? 130 + i * 110 : 950 - (i - 3) * 110;
          figure(c, { x, y: 1420 + (i % 3) * 20, h: 360, dir: i < 3 ? 1 : -1, robe: ['#3a3048', '#2f3a48', '#483a30'][i % 3], wrap: '#8a7a6a', skin: '#8f5f42', light: 0.4 });
        }
      });
    },
  },

  // 14. The cupbearer remembers; Yusuf interprets
  cupbearer: {
    grade: 'rgba(230,160,90,0.28)',
    draw(c, t, d) {
      phases(c, t, d * 0.32, 0.8, c => {
        cam(c, 1.02, W / 2, 1000);
        sky(c, [[0, '#2a2f4a'], [0.4, '#c97a5a'], [0.6, '#f0b880']]);
        c.fillStyle = '#5a4438'; c.fillRect(560, 620, 600, 700); // prison fortress
        for (let i = 0; i < 6; i++) c.fillRect(560 + i * 100, 580, 60, 50);
        c.fillStyle = '#1a120e'; c.beginPath(); archPath(c, 820, 1320, 180, 320); c.fill();
        c.fillStyle = '#b07a52'; c.fillRect(-100, 1310, W + 200, 700);
        const run = seg(t, 0, d * 0.34);
        figure(c, { x: lerp(-60, 700, run), y: 1330, h: 380, dir: 1, walk: t * 2.4, robe: '#4a4f5a', wrap: '#6a707c', skin: '#9a6a4c', light: 0.7 });
      }, c => {
        const q = seg(t, d * 0.32, d);
        cam(c, 1.0 + 0.05 * q, W / 2, 1050);
        prisonBg(c, t, { ang: 0.6 });
        figure(c, { x: 280, y: 1400, h: 380, dir: 1, pose: 'kneel', robe: '#4a4f5a', wrap: '#6a707c', skin: '#9a6a4c', light: 0.4 });
        figure(c, Object.assign({ x: 700, y: 1390, h: 420, dir: -1, pose: 'sit', light: 0.9 }, YUSUF_A));
        const g = ease(seg(t, d * 0.45, d * 0.58)), b = ease(seg(t, d * 0.62, d * 0.75));
        c.save(); c.globalAlpha = g; for (let i = 0; i < 7; i++) wheat(c, 120 + i * 140, 820, 0.5, '#e7b94a', false, t); c.restore();
        c.save(); c.globalAlpha = b; c.fillStyle = 'rgba(10,10,20,.5)'; c.fillRect(0, 840, W, 30); for (let i = 0; i < 7; i++) wheat(c, 120 + i * 140, 1010, 0.45, '#7a6448', true, t); c.restore();
        c.setTransform(1, 0, 0, 1, 0, 0);
        arabicCaption(c, 'فَذَرُوهُ فِي سُنبُلِهِ', t, d * 0.78, d + 1, 280, 96);
      });
    },
  },

  // 15. He refuses to leave until his innocence is proven
  release: {
    grade: 'rgba(240,170,90,0.28)',
    draw(c, t, d) {
      phases(c, t, d * 0.42, 0.9, c => {
        cam(c, 1.03, W / 2, 1000);
        prisonBg(c, t, { ang: 0.6 });
        c.fillStyle = '#0c0e13'; c.fillRect(120, 680, 320, 670);
        c.save(); c.beginPath(); c.rect(140, 700, 280, 650); c.clip(); c.fillStyle = '#ffe9c0'; c.fillRect(120, 680, 320, 670); glow(c, 280, 960, 400, '#ffffff', 0.7); c.restore();
        figure(c, Object.assign({ x: 290, y: 1350, h: 420, dir: 1, armUp: 0.7 + 0.1 * Math.sin(t * 3), light: 0.3 }, KING, { robe: '#2a2a3a', wrap: '#4a4030', skin: '#2a1d1d' }));
        figure(c, Object.assign({ x: 760, y: 1380, h: 420, dir: -1, pose: 'sit', light: 0.9 }, YUSUF_A));
      }, c => {
        const q = seg(t, d * 0.42, d);
        cam(c, 1.0 + 0.06 * q, W / 2, 1050);
        throneRoom(c, t);
        figure(c, Object.assign({ x: 540, y: 1150, h: 380, dir: 1, pose: 'sit' }, KING));
        WOMEN.forEach((w, i) => figure(c, Object.assign({ x: 110 + i * 85, y: 1500 + (i % 2) * 20, h: 300, dir: 1, pose: 'kneel', light: 0.4 }, w)));
        const conf = ease(seg(t, d * 0.65, d * 0.75));
        figure(c, Object.assign({ x: 820, y: 1500, h: 470, dir: -1, light: 0.4 + 0.6 * conf }, WIFE));
        if (conf > 0) { c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 540, 600, Math.PI / 2, 1.2, 1300, 10, '#fff0c8', 0.1 * conf, t, 6); c.restore(); }
        c.setTransform(1, 0, 0, 1, 0, 0);
        arabicCaption(c, 'الْآنَ حَصْحَصَ الْحَقُّ', t, d * 0.66, d + 1, 280, 104);
      });
    },
  },

  // 16. Free and entrusted with the storehouses of Egypt
  treasury: {
    grade: 'rgba(255,170,90,0.28)',
    draw(c, t, d) {
      const q = t / d;
      cam(c, 1.0 + 0.06 * q, W / 2, 1000);
      sky(c, [[0, '#5d86a6'], [0.35, '#e8c79a'], [0.55, '#f6dcae']]);
      sun(c, 220, 420, 55, '#fff1c0');
      pyramid(c, 800, 1000, 380, '#d9b07a', '#b88a56'); pyramid(c, 560, 1000, 220, '#d2a670', '#ae8050');
      c.fillStyle = '#4e7d8c'; c.fillRect(-100, 1000, W + 200, 40);
      c.fillStyle = '#d7b07a'; c.fillRect(-100, 1040, W + 200, 900);
      for (let i = 0; i < 4; i++) {
        const gx = 140 + i * 210;
        c.fillStyle = '#c99862'; c.beginPath(); c.moveTo(gx - 80, 1220); c.lineTo(gx - 80, 1080); c.quadraticCurveTo(gx, 940, gx + 80, 1080); c.lineTo(gx + 80, 1220); c.fill();
        c.fillStyle = '#7a5530'; c.beginPath(); c.arc(gx, 1110, 18, 0, 6.283); c.fill();
        const fill = ease(seg(t, d * 0.3 + i * 0.4, d * 0.5 + i * 0.4));
        c.fillStyle = '#f2c14e'; c.beginPath(); c.ellipse(gx + 120, 1222, 40 * fill + 1, 22 * fill + 1, 0, Math.PI, 0); c.fill();
      }
      palm(c, 980, 1240, 1.0, '#3d4a2a', t); palm(c, 60, 1260, 0.8, '#3d4a2a', t);
      for (let i = 0; i < 3; i++) {
        const wx = ((t * 60 + i * 380) % 1300) - 150;
        figure(c, { x: wx, y: 1260 + i * 10, h: 220, dir: 1, walk: t + i, robe: '#e8dcc4', wrap: '#e8dcc4', skin: '#9c6a48' });
        c.fillStyle = '#b48a52'; c.beginPath(); c.ellipse(wx + 5, 1260 + i * 10 - 225, 34, 22, 0, 0, 6.283); c.fill();
      }
      figure(c, Object.assign({ x: 330, y: 1420, h: 470, dir: 1 }, KING));
      figure(c, Object.assign({ x: 650, y: 1430, h: 480, dir: -1, light: 1 }, YUSUF_A));
      dust(c, t, 40, 51, [0, 700, W, 800], '#fff0c8', 0.35);
      c.fillStyle = `rgba(255,250,235,${1 - ease(seg(t, 0, 1.4))})`; c.setTransform(1, 0, 0, 1, 0, 0); c.fillRect(0, 0, W, H); // stepping out into the light
      arabicCaption(c, 'خَزَائِنِ الْأَرْضِ', t, d * 0.35, d + 1, 280, 110);
    },
  },
  // 9. Famine — the brothers come to Egypt; "I am Yusuf"
  brothers: {
    grade: 'rgba(230,150,90,0.25)',
    draw(c, t, d) {
      phases(c, t, d * 0.42, 0.9, c => {
        cam(c, 1.03, W / 2, 1000);
        sky(c, [[0, '#a8a296'], [0.5, '#e2c9a2'], [0.6, '#efd9b2']]);
        sun(c, 540, 500, 80, '#fffbe8');
        c.fillStyle = '#c4a27a'; c.fillRect(-100, 1100, W + 200, 900);
        c.strokeStyle = 'rgba(90,60,40,0.45)'; c.lineWidth = 3; const r = rng(77);
        for (let i = 0; i < 40; i++) { const x = r() * W, y = 1120 + r() * 600; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 40 - r() * 80, y + 10 + r() * 20); c.lineTo(x + 70 - r() * 140, y + 20); c.stroke(); }
        c.strokeStyle = '#4a3a2e'; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath(); c.moveTo(880, 1150); c.lineTo(880, 900); c.moveTo(880, 980); c.lineTo(960, 900); c.moveTo(880, 1020); c.lineTo(810, 950); c.stroke();
        const walkX = -400 + t * 80;
        BRO.forEach((b, i) => figure(c, Object.assign({ x: walkX + i * 58, y: 1290 + (i % 3) * 16, h: 300 + (i % 4) * 12, dir: 1, walk: t * 0.8 + i * 0.3, light: 0.6 }, b)));
        camel(c, walkX - 140, 1290, 0.7, '#7a5a3e', t * 0.8, 1, '#7a6a52');
      }, c => {
        const q = seg(t, d * 0.42, d), burst = ease(seg(t, d * 0.75, d * 0.9));
        cam(c, 1.0 + 0.06 * q, W / 2, 1000);
        c.fillStyle = '#4a2716'; c.fillRect(-100, -100, W + 200, H + 200);
        egyptColumn(c, 120, 1350, 130, 1000, '#a8703c', '#7f532a', '#3d6f7a');
        egyptColumn(c, 960, 1350, 130, 1000, '#a8703c', '#7f532a', '#3d6f7a');
        glow(c, 760, 900, 500, '#ffd890', 0.25 + 0.6 * burst);
        c.fillStyle = '#6b3a1e'; c.fillRect(-100, 1330, W + 200, 700);
        c.fillStyle = '#8a5230'; c.fillRect(600, 1250, 360, 90); // dais
        c.fillStyle = '#c9a14a'; c.fillRect(600, 1250, 360, 10);
        for (let i = 0; i < 3; i++) { c.fillStyle = '#c8a06a'; c.beginPath(); c.ellipse(520 + i * 40, 1330, 34, 26, 0, Math.PI, 0); c.fill(); }
        figure(c, Object.assign({ x: 790, y: 1255, h: 420, dir: -1, pose: 'sit', band: '#c9a14a', robe: '#c4d6e0', light: 1 }, { prophet: true, wrap: '#e9eef0', skin: '#d9a77f' }));
        BRO.slice(0, 7).forEach((b, i) => figure(c, Object.assign({ x: 70 + i * 62, y: 1380 + (i % 2) * 18, h: 330, dir: 1, light: 0.5 }, b)));
        if (burst > 0) { c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 790, 1060, Math.PI, 2.6, 1200, 14, '#ffe0a0', 0.12 * burst, t, 4); c.restore(); }
        c.setTransform(1, 0, 0, 1, 0, 0);
        arabicCaption(c, 'أَنَا يُوسُفُ', t, d * 0.78, d + 1, 300, 140);
      });
    },
  },

  // 10. Forgiveness
  forgive: {
    grade: 'rgba(255,180,100,0.35)',
    draw(c, t, d) {
      const p = t / d;
      cam(c, 1.05 + 0.05 * p, W / 2, 1000);
      sky(c, [[0, '#3a2a40'], [0.4, '#d98a5a'], [0.7, '#ffd9a0']]);
      sun(c, 540, 860, 120, '#ffd590');
      rays(c, 540, 860, -Math.PI / 2, 6.28, 1500, 18, '#ffe2a8', 0.09, t, 9);
      c.fillStyle = '#5a3424'; c.fillRect(-100, 1300, W + 200, 700);
      figure(c, Object.assign({ x: 540, y: 1310, h: 560, dir: 1, band: '#c9a14a', robe: '#c4d6e0', armUp: 0.45 + 0.05 * Math.sin(t) }, { prophet: true, wrap: '#e9eef0', skin: '#d9a77f' }));
      [[150, 1], [290, 1], [800, -1], [940, -1]].forEach(([x, dir], i) =>
        figure(c, Object.assign({ x, y: 1460, h: 380, dir, pose: 'kneel', light: 0.3 }, BRO[i * 2], { robe: mix(BRO[i * 2].robe, '#000000', 0.45), wrap: mix(BRO[i * 2].wrap, '#000000', 0.45) })));
      dust(c, t, 60, 61, [0, 500, W, 900], '#fff0c8', 0.4);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'لَا تَثْرِيبَ عَلَيْكُمُ الْيَوْمَ', t, 0.6, d + 1, 300, 84);
    },
  },

  // 11. Reunion — sight restored, the dream fulfilled
  reunion: {
    grade: 'rgba(255,175,95,0.32)',
    draw(c, t, d) {
      phases(c, t, d * 0.45, 1.0, c => {
        const col = ease(seg(t, d * 0.12, d * 0.38));
        cam(c, 1.1 - 0.05 * col, 620, 1050);
        sky(c, [[0, mix('#3a3f4c', '#3a5a86', col)], [0.45, mix('#7c7c80', '#f0b27a', col)], [0.6, mix('#a19c94', '#f8d9a6', col)]]);
        sun(c, 300, 900, 70, '#ffe0a0', col);
        ridge(c, 1150, 90, 0.003, 2, mix('#5b5552', '#9b6553', col));
        ridge(c, 1310, 40, 0.002, 7, mix('#3a3634', '#4f3029', col));
        oliveTree(c, 900, 1250, 1.0, mix('#4a4a46', '#5a6a3a', col), mix('#353532', '#43502b', col), Math.sin(t) * 3);
        figure(c, Object.assign({ x: 640, y: 1310, h: 400, dir: -1, pose: 'sit', light: 0.4 + col }, YAQUB));
        figure(c, { x: 380, y: 1305, h: 390, dir: 1, robe: '#6b5641', wrap: '#9a8468', skin: '#8f5f42', armUp: 0.8 });
        shirtShape(c, lerp(470, 560, ease(seg(t, 0, d * 0.15))), lerp(980, 1060, ease(seg(t, 0, d * 0.15))), 0.8, false, 1 - col * 0.8);
        if (col > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 640, 1080, 380 * col, '#fff3c8', 0.6 * col * (1 - seg(t, d * 0.35, d * 0.5) * 0.5)); c.restore(); }
      }, c => {
        const q = seg(t, d * 0.45, d);
        cam(c, 1.0 + 0.05 * q, W / 2, 1000);
        c.fillStyle = '#3b1f12'; c.fillRect(-100, -100, W + 200, H + 200);
        c.save(); c.beginPath(); archPath(c, W / 2, 1150, 700, 950); c.clip();
        sky(c, [[0, '#0c1230'], [0.35, '#2a2f5c'], [0.6, '#c27a5a']]);
        const ap = seg(t, d * 0.6, d * 0.85);
        for (let i = 0; i < 11; i++) star4(c, 260 + i * 56, 420 + Math.sin(i * 0.9) * 50, 14, '#ffe9a8', ap);
        sun(c, 380, 640, 34, '#ffc35a', ap); moon(c, 700, 640, 38, ap);
        c.restore();
        c.strokeStyle = '#c9a14a'; c.lineWidth = 12; c.beginPath(); archPath(c, W / 2, 1150, 700, 950); c.stroke();
        egyptColumn(c, 90, 1400, 120, 1050, '#a8703c', '#7f532a', '#3d6f7a'); egyptColumn(c, 990, 1400, 120, 1050, '#a8703c', '#7f532a', '#3d6f7a');
        c.fillStyle = '#6b3a1e'; c.fillRect(-100, 1150, W + 200, 900);
        c.fillStyle = '#8a5230'; c.fillRect(340, 1080, 400, 80); c.fillStyle = '#c9a14a'; c.fillRect(340, 1080, 400, 10);
        figure(c, Object.assign({ x: 540, y: 1085, h: 400, dir: 1, band: '#c9a14a', robe: '#c4d6e0' }, { prophet: true, wrap: '#e9eef0', skin: '#d9a77f' }));
        const pr = ease(seg(t, d * 0.55, d * 0.7));
        const fam = [YAQUB, { robe: '#7a5a6a', wrap: '#b8a0a8', skin: '#b07a58' }].concat(BRO.slice(0, 6));
        fam.forEach((f, i) => {
          const x = 120 + (i % 4) * 260, y = 1350 + Math.floor(i / 4) * 160;
          figure(c, Object.assign({ x, y, h: 260, dir: x < 540 ? 1 : -1, pose: pr > 0.5 ? 'prostrate' : 'kneel', light: 0.6 }, f, { staff: false }));
        });
        c.setTransform(1, 0, 0, 1, 0, 0);
        arabicCaption(c, 'هَٰذَا تَأْوِيلُ رُؤْيَايَ', t, d * 0.62, d + 1, 270, 92);
      });
    },
  },

  // 12. The end of his life — sunset over the Nile
  death: {
    grade: 'rgba(200,110,90,0.32)',
    draw(c, t, d) {
      const p = t / d, night = ease(seg(t, d * 0.5, d * 0.9));
      cam(c, 1.0 + 0.07 * ease(p), W / 2, 1050);
      sky(c, [[0, mix('#3a2a5a', '#05060f', night)], [0.4, mix('#c0607a', '#121735', night)], [0.58, mix('#ffb36a', '#2a2a48', night)]]);
      stars(c, t, 160, 71, [0, 0, W, 950], night);
      sun(c, 620, lerp(880, 1060, ease(p)), 90, '#ffb066', 1 - night);
      pyramid(c, 820, 1060, 420, mix('#5a3040', '#141422', night), mix('#3a2030', '#0c0c18', night));
      pyramid(c, 560, 1060, 240, mix('#64364a', '#16162a', night), mix('#422436', '#0d0d1a', night));
      // the Nile with reflections
      c.fillStyle = mix('#c26a5a', '#141a34', night); c.fillRect(-100, 1060, W + 200, 160);
      for (let i = 0; i < 9; i++) { c.fillStyle = hexA('#ffd59a', 0.35 * (1 - night)); c.fillRect(620 - 90 + Math.sin(t * 1.3 + i) * 20 + (i % 3) * 30, 1070 + i * 16, 120 - i * 10, 4); }
      c.fillStyle = mix('#3b1e22', '#07070e', night); c.fillRect(-100, 1220, W + 200, 800);
      palm(c, 930, 1240, 1.2, mix('#2a1418', '#05050a', night), t); palm(c, 1040, 1250, 0.9, mix('#2a1418', '#05050a', night), t);
      figure(c, Object.assign({ x: 330, y: 1300, h: 360, dir: 1, pose: 'kneel', armUp: 0, robe: '#d6ccba', light: 0.3 + 0.7 * (1 - night) }, { prophet: true, wrap: '#ece6d8', skin: '#c99872' }));
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.save(); c.direction = 'rtl';
      const a = seg(t, 0.8, 1.8) * (1 - seg(t, d * 0.55, d * 0.62));
      textGlow(c, 'تَوَفَّنِي مُسْلِمًا', W / 2, 270, '700 96px Amiri', '#f6c453', a, '#ffb300', 30);
      textGlow(c, 'وَأَلْحِقْنِي بِالصَّالِحِينَ', W / 2, 390, '700 80px Amiri', '#f6c453', a, '#ffb300', 30);
      c.restore();
    },
  },

  // Outro card
  outro: {
    grade: null,
    draw(c, t, d) {
      sky(c, [[0, '#05060f'], [0.6, '#0d1024'], [1, '#14122a']]);
      stars(c, t + 50, 140, 81, [0, 0, W, H], 0.7);
      const a = seg(t, 0.2, 1.2);
      c.save(); c.direction = 'rtl';
      textGlow(c, 'إِنَّهُ مَن يَتَّقِ وَيَصْبِرْ', W / 2, 760, '700 84px Amiri', '#f6c453', a, '#ffb300', 30);
      textGlow(c, 'فَإِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ', W / 2, 880, '700 66px Amiri', '#f6c453', a, '#ffb300', 30);
      c.restore();
      const b = seg(t, 1.0, 2.0);
      textGlow(c, '« Quiconque craint Allah et patiente…', W / 2, 1010, 'italic 500 40px Lora', '#f3e7d0', b, '#000', 10);
      textGlow(c, 'Allah ne laisse pas perdre la récompense', W / 2, 1066, 'italic 500 40px Lora', '#f3e7d0', b, '#000', 10);
      textGlow(c, 'des bienfaisants. »  — Yusuf, 90', W / 2, 1122, 'italic 500 40px Lora', '#f3e7d0', b, '#000', 10);
      const e = seg(t, 2.0, 2.8);
      textGlow(c, 'LES PROPHÈTES  ·  À SUIVRE', W / 2, 1330, '600 34px Lora', '#c9b48a', e, '#000', 8);
      c.fillStyle = 'rgba(0,0,0,' + seg(t, d - 0.8, d) + ')'; c.fillRect(0, 0, W, H);
    },
  },
};
