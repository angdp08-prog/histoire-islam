// Episode 3 — Yunus (alayhi salam). Visual rule for this episode: the prophet is NEVER drawn
// (no face, no silhouette). His presence is suggested by symbols: a lamp, footprints, a ship,
// the great fish, a point of light in the darkness, the gourd plant, calligraphy. Townsfolk are faceless.

const FOLK = [
  { robe: '#5a4b40', wrap: '#7d6a58', skin: '#9a6a4c' }, { robe: '#46505c', wrap: '#6c7682', skin: '#b07a58' },
  { robe: '#6b5641', wrap: '#9a8468', skin: '#8f5f42' }, { robe: '#4b4038', wrap: '#6f6153', skin: '#a8714f' },
  { robe: '#3f4954', wrap: '#5e6b78', skin: '#94664a' }, { robe: '#5d4a3a', wrap: '#867058', skin: '#b4805c' },
  { robe: '#7a5a6a', wrap: '#5a3a4a', skin: '#c48e66' }, { robe: '#3a5a4a', wrap: '#284034', skin: '#b07a58' },
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
function torch(c, x, y, t, k = 0, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#3a2418'; c.fillRect(-6, -160, 12, 160);
  glow(c, 0, -175, 260, '#ff8a3a', 0.45 + 0.08 * Math.sin(t * 9 + k));
  c.fillStyle = '#ffb347'; c.beginPath(); c.moveTo(-14, -160); c.quadraticCurveTo(Math.sin(t * 8 + k) * 8, -230, 2, -215);
  c.quadraticCurveTo(18, -190, 14, -160); c.fill();
  c.fillStyle = '#ffe39a'; c.beginPath(); c.ellipse(0, -175, 6, 14, 0, 0, 6.283); c.fill();
  c.restore();
}
function lamp(c, x, y, s, t, a = 1) { // small oil lamp: the message / the remembrance of Allah
  c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(s, s);
  glow(c, 0, -40, 260, '#ffb466', 0.5 + 0.06 * Math.sin(t * 7));
  c.fillStyle = '#b07a3a'; c.beginPath(); c.moveTo(-60, 0); c.quadraticCurveTo(-50, -34, 0, -34); c.quadraticCurveTo(46, -34, 80, -20);
  c.lineTo(84, -12); c.quadraticCurveTo(40, 6, 0, 6); c.quadraticCurveTo(-40, 6, -60, 0); c.fill();
  c.fillStyle = '#7a4e22'; c.beginPath(); c.ellipse(0, 4, 36, 8, 0, 0, 6.283); c.fill();
  c.fillStyle = '#ffd890'; c.beginPath(); c.moveTo(74, -22); c.quadraticCurveTo(70 + Math.sin(t * 9) * 4, -70, 82, -78); c.quadraticCurveTo(94, -50, 86, -22); c.fill();
  c.fillStyle = '#fff6d8'; c.beginPath(); c.ellipse(80, -36, 4, 10, 0, 0, 6.283); c.fill();
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
function lightning(c, t, period, seed) {
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
// Nineveh: a long crenellated wall with a great gate, a stepped temple and flat-roofed houses
function city(c, y, col, lit = 0, t = 0, gateOpen = 0) {
  const dark = mix(col, '#000000', 0.3), r = rng(17);
  // houses behind the wall
  for (let i = 0; i < 9; i++) { const x = 40 + i * 125, h = 150 + r() * 120;
    c.fillStyle = mix(col, '#ffffff', 0.06); c.fillRect(x - 55, y - 170 - h, 110, h);
    if (lit > 0 && r() > 0.3) { c.fillStyle = `rgba(255,190,110,${lit * (0.7 + 0.3 * Math.sin(t * 2 + i))})`; c.fillRect(x - 12, y - 170 - h * 0.6, 22, 26); } }
  // stepped temple (ziggurat)
  c.fillStyle = dark; [[380, 120], [300, 110], [220, 100], [140, 90]].forEach(([w, h], k) => c.fillRect(760 - w / 2, y - 170 - 120 - k * 100 - h + 100, w, h));
  // wall + crenellations
  c.fillStyle = col; c.fillRect(-100, y - 200, W + 200, 200);
  for (let x = -100; x < W + 100; x += 56) c.fillRect(x, y - 236, 32, 40);
  c.fillStyle = dark; c.fillRect(-100, y - 200, W + 200, 14);
  // towers
  [130, 950].forEach(x => { c.fillStyle = col; c.fillRect(x - 60, y - 300, 120, 300); for (let k = 0; k < 3; k++) c.fillRect(x - 60 + k * 44, y - 336, 32, 40); });
  // gate
  c.fillStyle = mix(col, '#000000', 0.15); c.beginPath(); archPath(c, 540, y, 210, 330); c.fill();
  c.fillStyle = '#1a120c'; c.beginPath(); archPath(c, 540, y, 150, 270); c.fill();
  if (gateOpen > 0) { c.save(); c.beginPath(); archPath(c, 540, y, 150, 270); c.clip(); glow(c, 540, y - 100, 260, '#ffc070', 0.6 * gateOpen); c.restore(); }
}
function river(c, y, h, t, col, shine) {
  c.fillStyle = col; c.fillRect(-100, y, W + 200, h);
  c.strokeStyle = shine; c.lineWidth = 3;
  for (let i = 0; i < 14; i++) { const yy = y + 12 + (i * 37) % h, x = ((i * 211 + t * 30) % (W + 300)) - 150;
    c.beginPath(); c.moveTo(x, yy); c.lineTo(x + 80 + (i % 3) * 40, yy); c.stroke(); }
}
// a merchant ship with a square sail; cargo = number of crates still on deck
function ship(c, x, y, s, o = {}) {
  const rot = o.rot || 0, cargo = o.cargo === undefined ? 5 : o.cargo, sail = o.sail === undefined ? 1 : o.sail, t = o.t || 0;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  // mast + sail
  c.fillStyle = '#3a2412'; c.fillRect(-8, -520, 16, 400);
  c.fillStyle = '#e8dcc0'; c.beginPath(); c.moveTo(-170, -490); c.quadraticCurveTo(0 + Math.sin(t * 2) * 20 * sail, -380, 170, -490);
  c.lineTo(160, -230); c.quadraticCurveTo(0 + Math.sin(t * 2) * 30 * sail, -170, -160, -230); c.closePath(); c.fill();
  c.strokeStyle = '#a8946e'; c.lineWidth = 4; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(-165 + k * 2, -490 + k * 65); c.lineTo(165 - k * 2, -490 + k * 65); c.stroke(); }
  c.fillStyle = '#5a3a22'; c.fillRect(-190, -500, 380, 14);
  c.strokeStyle = '#2a1a0e'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -520); c.lineTo(-330, -150); c.moveTo(0, -520); c.lineTo(300, -150); c.stroke();
  // crates and jars on deck
  const cr = rng(3);
  for (let k = 0; k < cargo; k++) { const cx = -260 + k * 110 + (k > 2 ? 40 : 0); if (Math.abs(cx) < 30) continue;
    c.fillStyle = k % 2 ? '#8a5a2e' : '#a06a36'; c.fillRect(cx - 40, -230, 80, 80); c.strokeStyle = '#5a3a1a'; c.lineWidth = 4; c.strokeRect(cx - 40, -230, 80, 80);
    c.beginPath(); c.moveTo(cx - 40, -230); c.lineTo(cx + 40, -150); c.stroke(); cr(); }
  // hull
  c.fillStyle = '#6a3e20'; c.beginPath(); c.moveTo(-380, -170); c.quadraticCurveTo(-330, -20, -200, 0); c.lineTo(220, 0); c.quadraticCurveTo(340, -30, 400, -200);
  c.lineTo(360, -150); c.lineTo(-340, -150); c.closePath(); c.fill();
  c.strokeStyle = '#4a2a12'; c.lineWidth = 4; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-350 + k * 15, -130 + k * 32); c.lineTo(350 - k * 25, -130 + k * 32); c.stroke(); }
  c.strokeStyle = '#2a170b'; c.lineWidth = 7; c.beginPath(); c.moveTo(-380, -170); c.quadraticCurveTo(-330, -20, -200, 0); c.lineTo(220, 0); c.quadraticCurveTo(340, -30, 400, -200); c.stroke();
  c.fillStyle = '#c9a14a'; c.beginPath(); c.arc(330, -150, 12, 0, 6.283); c.fill(); // painted eye-less prow disc
  c.restore();
}
// the great fish: big rounded body, small eye, sweeping tail. open = 0..1 jaw
function whale(c, x, y, s, t, o = {}) {
  const open = o.open || 0, dir = o.dir || 1, col = o.col || '#22344a', belly = o.belly || '#3e5468', inner = o.inner || 0;
  c.save(); c.translate(x, y); c.scale(s * dir, s);
  const sw = Math.sin(t * 1.6) * 0.18;
  // tail
  c.save(); c.translate(-420, -10); c.rotate(sw);
  c.fillStyle = col; c.beginPath(); c.moveTo(40, -40); c.quadraticCurveTo(-60, -40, -170, -150); c.quadraticCurveTo(-120, -10, -170, 130); c.quadraticCurveTo(-60, 40, 40, 40); c.fill();
  c.restore();
  // body
  c.fillStyle = col; c.beginPath(); c.moveTo(-440, -10);
  c.bezierCurveTo(-300, -200, 200, -260, 420, -120 - open * 40);
  c.quadraticCurveTo(470, -70, 470, -30 - open * 30);
  c.lineTo(250, -20 + open * 10);
  c.lineTo(470, 0 + open * 50);
  c.quadraticCurveTo(450, 140, 200, 170); c.bezierCurveTo(-100, 190, -300, 120, -440, 10); c.closePath(); c.fill();
  c.fillStyle = belly; c.beginPath(); c.moveTo(-300, 70); c.bezierCurveTo(-100, 170, 200, 175, 420, 40 + open * 40); c.quadraticCurveTo(220, 120, -300, 70); c.fill();
  // throat grooves
  c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 4;
  for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(-60 + k * 10, 110 + k * 8); c.quadraticCurveTo(160, 150 + k * 4, 380, 50 + k * 14 + open * 30); c.stroke(); }
  // fin
  c.fillStyle = mix(col, '#000000', 0.25); c.beginPath(); c.moveTo(60, 100); c.quadraticCurveTo(0, 230 + Math.sin(t * 2) * 20, -90, 250); c.quadraticCurveTo(-20, 170, -30, 100); c.fill();
  // eye
  c.fillStyle = '#0a0e14'; c.beginPath(); c.arc(300, -60, 12, 0, 6.283); c.fill();
  // the light of invocation inside
  if (inner > 0) { c.globalCompositeOperation = 'lighter'; glow(c, 0, 20, 220, '#ffd890', 0.7 * inner); glow(c, 0, 20, 60, '#fff6d8', 0.9 * inner); c.globalCompositeOperation = 'source-over'; }
  c.restore();
}
function bubbles(c, t, n, seed, box, a = 0.5) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = box[0] + r() * box[2] + Math.sin(t * 2 + i) * 8, sp = 60 + r() * 120;
    const y = box[1] + box[3] - ((r() * box[3] + t * sp) % box[3]), s = 3 + r() * 9;
    c.strokeStyle = `rgba(200,230,255,${a})`; c.lineWidth = 2; c.beginPath(); c.arc(x, y, s, 0, 6.283); c.stroke();
  }
}
function footprints(c, pts, t0, t, color) { // trail of footprints appearing one after another
  pts.forEach(([x, y, ang, s], i) => {
    const a = seg(t, t0 + i * 0.35, t0 + i * 0.35 + 0.4); if (a <= 0) return;
    c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s * 0.55); c.fillStyle = hexA(color, 0.6 * a);
    c.beginPath(); c.ellipse(i % 2 ? 14 : -14, 0, 11, 24, 0, 0, 6.283); c.fill(); c.restore();
  });
}
// gourd vine (yaqtin): stems spreading over a frame of sticks, broad leaves, growth = 0..1
function gourd(c, x, y, s, growth, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const r = rng(91), stems = 7;
  for (let k = 0; k < stems; k++) {
    const ang = -Math.PI / 2 + (k - (stems - 1) / 2) * 0.32, L = (260 + r() * 140) * ease(clamp(growth * 1.3 - k * 0.04));
    if (L < 2) continue;
    const ex = Math.cos(ang) * L * 1.4, ey = Math.sin(ang) * L * 0.9 - L * 0.25;
    c.strokeStyle = '#4a6a2a'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0);
    c.bezierCurveTo(ex * 0.3, ey * 0.6 - 80, ex * 0.7, ey - 60, ex, ey); c.stroke();
    const nl = Math.floor(L / 55);
    for (let j = 1; j <= nl; j++) {
      const q = j / (nl + 1), bx = lerp(0, ex, q) + Math.sin(q * 9 + k) * 20, by = lerp(0, ey, q) - Math.sin(q * 3.14) * 70;
      const ls = (40 + r() * 30) * clamp((growth * 1.3 - k * 0.04) * 1.2 - q * 0.3), rot = ang + (j % 2 ? 0.9 : -0.9) + Math.sin(t * 1.2 + j + k) * 0.06;
      if (ls <= 2) continue;
      c.save(); c.translate(bx, by); c.rotate(rot);
      c.fillStyle = j % 3 ? '#5f8f34' : '#4c7a2a'; c.beginPath(); // broad lobed leaf
      c.moveTo(0, 0); c.bezierCurveTo(ls * 0.9, -ls * 0.9, ls * 1.6, -ls * 0.1, ls * 1.2, ls * 0.6); c.bezierCurveTo(ls * 0.9, ls * 1.1, ls * 0.2, ls * 0.8, 0, 0); c.fill();
      c.strokeStyle = 'rgba(30,60,20,0.4)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(ls * 1.1, ls * 0.3); c.stroke();
      c.restore();
      if (j === 2 && k % 2 === 0 && growth > 0.7) { c.fillStyle = '#e0c060'; c.beginPath(); c.arc(bx, by + 30, 14 * seg(growth, 0.7, 1), 0, 6.283); c.fill(); }
    }
  }
  c.restore();
}

const SCENES = {
  // 1. Nineveh on the Tigris — title card
  nineveh: {
    grade: 'rgba(255,150,80,0.28)',
    draw(c, t, d) {
      const p = t / d;
      cam(c, 1.0 + 0.07 * ease(p), W / 2, 1100);
      sky(c, [[0, '#1a1a38'], [0.35, '#6a3a4a'], [0.55, '#e08a5a'], [0.62, '#f0b070']]);
      sun(c, 300, 960, 70, '#ffc070', 0.9);
      stars(c, t, 50, 4, [0, 0, W, 500], 0.5);
      city(c, 1160, '#7a5238', 0.5, t, 0);
      c.fillStyle = '#5a3a26'; c.fillRect(-100, 1160, W + 200, 120);
      [40, 1000].forEach((x, i) => palm(c, x, 1220, 0.9, '#2a1a14', t + i));
      river(c, 1280, 700, t, '#2a3a4a', 'rgba(255,190,130,0.35)');
      for (let i = 0; i < 3; i++) bird(c, 200 + i * 90 + t * 30, 640 + Math.sin(t * 2 + i) * 20, 0.9, t + i, '#2a1a20');
      dust(c, t, 30, 9, [0, 700, W, 600], '#ffb070', 0.3);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a = seg(t, 0.2, 1.2) * (1 - seg(t, 6.5, 7.5));
      textGlow(c, 'LES PROPHÈTES  ·  ÉPISODE 3', W / 2, 215, '600 34px Lora', '#fbe7c6', a * 0.9, '#000000', 12);
      c.save(); c.direction = 'rtl';
      textGlow(c, 'يُونُس', W / 2, 430 - (1 - easeOut(seg(t, 0.4, 1.6))) * 30, '700 170px Amiri', '#f6c453', a, '#ffb300', 40);
      c.restore();
      textGlow(c, 'ʿalayhi s-salām', W / 2, 585, 'italic 500 46px Lora', '#fff3dc', a, '#000000', 14);
      textGlow(c, 'Dhū n-Nūn · « l\'homme du poisson »', W / 2, 650, 'italic 500 34px Lora', '#e8d6b8', a * 0.8, '#000000', 10);
    },
  },

  // 2. He calls them — they turn away (a lamp burns in the street: the message)
  call: {
    grade: 'rgba(255,170,90,0.26)',
    draw(c, t, d) {
      const p = t / d, turn = ease(seg(t, d * 0.45, d * 0.65));
      cam(c, 1.02 + 0.05 * p, W / 2, 1100);
      sky(c, [[0, '#2a3048'], [0.4, '#8a6a6a'], [0.6, '#c89a7a']]);
      for (let i = 0; i < 5; i++) { const x = 90 + i * 230, h = 260 + (i % 2) * 80;
        c.fillStyle = '#8a6448'; c.fillRect(x - 100, 1150 - h, 200, h); c.fillStyle = '#6a4a34'; c.fillRect(x - 100, 1150 - h, 200, 14);
        c.fillStyle = 'rgba(30,20,15,0.85)'; c.fillRect(x - 20, 1150 - h * 0.6, 40, 50); }
      c.fillStyle = '#9a7656'; c.fillRect(-100, 1140, W + 200, 900);
      // stone idols in a niche
      c.fillStyle = '#6a5a4a'; [820, 900, 980].forEach((x, k) => { c.fillRect(x - 22, 1140 - 150 - k * 10, 44, 150 + k * 10); c.beginPath(); c.arc(x, 1140 - 170 - k * 10, 28, 0, 6.283); c.fill(); });
      lamp(c, 200, 1400, 1.1, t);
      FOLK.slice(0, 6).forEach((f, i) => {
        const x = 330 + i * 125, dir = turn > 0.5 ? 1 : -1;
        figure(c, Object.assign({ x, y: 1420 + (i % 2) * 40, h: 340, dir, covered: turn > 0.5 && i % 2 === 0, light: 0.6 }, f));
      });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'اعْبُدُوا اللَّهَ', t, 0.6, d * 0.5, 280, 120);
    },
  },

  // 3. He leaves the city, angry — footprints from the gate toward the sea
  leave: {
    grade: 'rgba(200,110,70,0.3)',
    draw(c, t, d) {
      const p = t / d;
      cam(c, 1.06 - 0.05 * ease(p), W / 2, 1000);
      sky(c, [[0, '#141626'], [0.4, '#5a2a30'], [0.6, '#b0603a']]);
      cloudBank(c, t, 220, 10, '#2a1a22', 0.6, 4, 18);
      city(c, 900, '#4a3226', 0.35, t, 0);
      dune(c, -200, 700, 1120, 90, '#9a6a44', '#7a5234'); dune(c, 300, 1300, 1130, 110, '#8a5e3c', '#6a462c');
      c.fillStyle = '#8a603e'; c.fillRect(-100, 1120, W + 200, 900);
      const pts = []; for (let i = 0; i < 14; i++) { const q = i / 13; pts.push([lerp(540, 820, q) + Math.sin(q * 6) * 40, lerp(1150, 1820, q), 0.25 - q * 0.2, lerp(0.6, 1.6, q)]); }
      footprints(c, pts, 0.8, t, '#3a2414');
      dust(c, t, 60, 33, [0, 900, W, 900], '#ffd0a0', 0.35, 40);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'إِذ ذَّهَبَ مُغَاضِبًا', t, d * 0.35, d + 1, 280, 110);
    },
  },

  // 4. The laden ship leaves the harbour
  ship: {
    grade: 'rgba(255,170,100,0.25)',
    draw(c, t, d) {
      const p = t / d;
      cam(c, 1.0 + 0.04 * p, W / 2, 1050);
      sky(c, [[0, '#3a5a7a'], [0.4, '#d8a07a'], [0.55, '#f0c090']]);
      sun(c, 820, 900, 60, '#ffe0a0', 0.9);
      cloudBank(c, t, 480, 8, '#f0d0b0', 0.22, 21, 8);
      waves(c, t, 1040, 6, '#4a6a84', 0.01, 0.6, 1, 'rgba(255,220,180,.3)');
      const x = lerp(420, 640, ease(p)), y = waveY(x, t, 1220, 10, 0.006, 0.9, 2);
      ship(c, x, y + 20, 0.9, { t, rot: Math.sin(t * 0.9) * 0.02, cargo: 6 });
      waves(c, t, 1240, 14, '#3a5a74', 0.006, 0.9, 2, 'rgba(255,220,180,.35)');
      // the pier
      c.fillStyle = '#4a3020'; c.fillRect(-100, 1300, 360, 30); for (let k = 0; k < 5; k++) c.fillRect(-60 + k * 70, 1320, 16, 200);
      waves(c, t, 1440, 20, '#2a4a64', 0.004, 1.1, 3, 'rgba(255,220,180,.25)');
      for (let i = 0; i < 3; i++) bird(c, 650 + i * 70 + t * 25, 560 + Math.sin(t * 2.4 + i) * 20, 0.9, t + i * 0.7, '#3a2a2a');
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'إِلَى الْفُلْكِ الْمَشْحُونِ', t, 0.5, d + 1, 280, 100);
    },
  },

  // 5. The storm — cargo thrown over — lots are cast
  storm: {
    grade: 'rgba(40,70,140,0.42)',
    draw(c, t, d) {
      const p = t / d, toss = seg(t, d * 0.3, d * 0.6), lots = ease(seg(t, d * 0.6, d * 0.75));
      phases(c, t, d * 0.62, 0.8, c => {
        cam(c, 1.05 + 0.04 * Math.sin(t * 0.7), W / 2, 1000, Math.sin(t * 1.3) * 10, 0);
        sky(c, [[0, '#06080f'], [0.4, '#1a2234'], [0.6, '#2a3446']]);
        cloudBank(c, t, 60, 18, '#0e121c', 1, 12, 40);
        lightning(c, t, 3.4, 0.6);
        waves(c, t, 1050, 150, '#16243a', 0.004, 1.1, 1, 'rgba(150,180,220,.25)');
        const ay = waveY(540, t, 1200, 110, 0.005, 1.6, 2), ay2 = waveY(600, t, 1200, 110, 0.005, 1.6, 2);
        ship(c, 540, ay + 40, 0.6, { t: t * 3, rot: Math.atan2(ay2 - ay, 60) * 0.8, cargo: Math.round(6 - 5 * toss) });
        // crates falling into the sea
        for (let k = 0; k < 4; k++) { const q = seg(t, d * 0.3 + k * 0.6, d * 0.3 + k * 0.6 + 1.0); if (q <= 0 || q >= 1) continue;
          const bx = 540 + (k % 2 ? 1 : -1) * lerp(80, 300, q), by = ay - 100 + q * q * 400 - Math.sin(q * 3.14) * 120;
          c.save(); c.translate(bx, by); c.rotate(q * 4 * (k % 2 ? 1 : -1)); c.fillStyle = '#8a5a2e'; c.fillRect(-26, -26, 52, 52); c.restore(); }
        waves(c, t, 1200, 110, '#1e3050', 0.005, 1.6, 2, 'rgba(170,200,240,.35)');
        waves(c, t, 1380, 130, '#122038', 0.0035, 2.2, 4, 'rgba(190,210,240,.4)');
        rain(c, t, 400, 1, 0.35, 2300, 7);
      }, c => {
        // close-up: the lots (arrows) drawn from a bowl, lit by a lantern swinging in the storm
        c.fillStyle = '#120e0c'; c.fillRect(-100, -100, W + 200, H + 200);
        const sw = Math.sin(t * 2.2) * 0.12;
        c.save(); c.translate(540, 500); c.rotate(sw); c.strokeStyle = '#3a2a1a'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -500); c.lineTo(0, 120); c.stroke();
        glow(c, 0, 160, 520, '#ffb466', 0.55); c.fillStyle = '#c98a3a'; c.fillRect(-30, 120, 60, 80); c.fillStyle = '#ffe0a0'; c.fillRect(-18, 132, 36, 56); c.restore();
        c.fillStyle = '#2a1c14'; c.fillRect(-100, 1250, W + 200, 800);
        c.fillStyle = '#7a4e2a'; c.beginPath(); c.ellipse(540, 1250, 230, 60, 0, 0, Math.PI); c.fill();
        c.beginPath(); c.moveTo(310, 1250); c.quadraticCurveTo(320, 1420, 540, 1430); c.quadraticCurveTo(760, 1420, 770, 1250); c.fill();
        c.fillStyle = '#4a2e18'; c.beginPath(); c.ellipse(540, 1250, 230, 50, 0, 0, 6.283); c.fill();
        for (let k = 0; k < 7; k++) { const sel = k === 3, rise = sel ? ease(seg(t, d * 0.72, d * 0.9)) * 260 : 0;
          const x = 400 + k * 46, top = 1060 - (k % 3) * 18 - rise;
          c.strokeStyle = sel ? '#f6c453' : '#b89a6a'; c.lineWidth = sel ? 9 : 7; c.beginPath(); c.moveTo(x, 1250); c.lineTo(x + (k - 3) * 8, top); c.stroke();
          if (sel && rise > 0) glow(c, x, top, 120, '#ffd27a', 0.5 * rise / 260); }
        rain(c, t, 120, 0.4, 0.3, 2100, 2);
      });
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'فَسَاهَمَ', t, d * 0.66, d + 1, 280, 140, '#dfeaff');
    },
  },

  // 6. Thrown into the sea — swallowed by the great fish (seen from below the surface)
  whale: {
    grade: 'rgba(30,70,130,0.45)',
    draw(c, t, d) {
      const p = t / d, swim = ease(seg(t, d * 0.15, d * 0.85)), shut = ease(seg(t, d * 0.55, d * 0.7));
      cam(c, 1.0 + 0.05 * p, W / 2, 1000);
      sky(c, [[0, '#2a4a6a'], [0.18, '#173450'], [0.5, '#0a1a2c'], [1, '#02060c']]);
      // surface seen from below + the splash ring
      c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 540, -60, Math.PI / 2, 0.8, 1300, 12, '#9fc8ea', 0.09, t, 13); c.restore();
      c.strokeStyle = 'rgba(200,230,255,0.35)'; c.lineWidth = 4; c.beginPath();
      for (let x = -100; x <= W + 100; x += 10) { const yy = 250 + Math.sin(x * 0.01 + t * 1.4) * 10; x === -100 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke();
      const sp = seg(t, 0.2, 2.2); if (sp > 0 && sp < 1) { c.strokeStyle = `rgba(255,255,255,${0.6 * (1 - sp)})`; c.lineWidth = 6; c.beginPath(); c.ellipse(560, 260, 40 + sp * 260, 10 + sp * 40, 0, 0, 6.283); c.stroke(); }
      bubbles(c, t, 40, 7, [460, 260, 200, 700], 0.4 * (1 - seg(t, d * 0.4, d * 0.7)));
      // the fish rises from the deep toward the bubbles
      whale(c, lerp(1500, 520, swim), lerp(1350, 900, swim), 1.1, t, { open: (1 - shut) * seg(t, d * 0.2, d * 0.4), dir: -1 });
      dust(c, t, 60, 5, [0, 300, W, 1600], '#bfe0ff', 0.25, 6);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'فَالْتَقَمَهُ الْحُوتُ', t, d * 0.55, d + 1, 280, 110, '#dfeaff');
    },
  },

  // 7. Three darknesses: night, sea, belly — a faint light within
  darkness: {
    grade: 'rgba(20,30,70,0.5)',
    draw(c, t, d) {
      const p = t / d, k1 = ease(seg(t, 0.3, 2.3)), k2 = ease(seg(t, d * 0.25, d * 0.45)), k3 = ease(seg(t, d * 0.5, d * 0.7));
      cam(c, 1.0 + 0.12 * ease(p), W / 2, 1050);
      sky(c, [[0, '#04050c'], [0.4, '#070b18'], [1, '#010205']]);
      stars(c, t, 120, 31, [0, 0, W, 500], 0.6 * (1 - k3));
      moon(c, 820, 260, 40, 0.6 * (1 - k3));
      waves(c, t, 600, 14, '#060c18', 0.005, 0.7, 1, `rgba(150,180,220,${0.18 * (1 - k3)})`);
      whale(c, 560, 1100, 1.0, t * 0.6, { dir: -1, col: '#0a121c', belly: '#101a26', inner: 0.15 + 0.6 * k3 + 0.08 * Math.sin(t * 2) });
      c.fillStyle = `rgba(0,0,0,${0.45 * k2})`; c.fillRect(-200, -200, W + 400, H + 400);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const words = [['ظُلْمَةُ اللَّيْلِ', 0.3, k1], ['ظُلْمَةُ الْبَحْرِ', d * 0.25, k2], ['ظُلْمَةُ بَطْنِ الْحُوتِ', d * 0.5, k3]];
      c.save(); c.direction = 'rtl';
      words.forEach(([w, t0], i) => { const a = seg(t, t0, t0 + 0.8) * (1 - seg(t, d * 0.8, d * 0.95)) * (i === 2 ? 1 : 0.7);
        textGlow(c, w, W / 2, 240 + i * 105, '700 70px Amiri', '#c8d6f0', a, '#5a7ab0', 24); });
      c.restore();
      arabicCaption(c, 'فَنَادَىٰ فِي الظُّلُمَاتِ', t, d * 0.82, d + 1, 300, 100, '#e6efff');
    },
  },

  // 8. The invocation — calligraphy rising in the darkness
  dua: {
    grade: 'rgba(255,190,110,0.22)',
    draw(c, t, d) {
      const p = t / d, br = ease(seg(t, 0.3, d * 0.9));
      cam(c, 1.0 + 0.04 * p, W / 2, 960);
      c.fillStyle = '#050608'; c.fillRect(-100, -100, W + 200, H + 200);
      // ribs of the fish's belly, barely visible
      c.strokeStyle = `rgba(90,60,50,${0.25 + 0.2 * br})`; c.lineWidth = 26; c.lineCap = 'round';
      for (let k = 0; k < 6; k++) { const x = 80 + k * 185; c.beginPath(); c.moveTo(x, -50); c.quadraticCurveTo(x + 60, 960, x, 1980); c.stroke(); }
      c.save(); c.globalCompositeOperation = 'lighter';
      glow(c, 540, 960, 520 + 200 * br, '#ffcf80', 0.18 + 0.35 * br);
      glow(c, 540, 960, 120, '#fff6d8', 0.6 + 0.3 * br);
      dust(c, t, 70, 77, [140, 400, 800, 1100], '#ffe0a0', 0.5 * br, 10);
      c.restore();
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.save(); c.direction = 'rtl';
      const L = [['لَّا إِلَٰهَ إِلَّا أَنتَ', 0.2], ['سُبْحَانَكَ', d * 0.28], ['إِنِّي كُنتُ مِنَ الظَّالِمِينَ', d * 0.48]];
      L.forEach(([w, t0], i) => { const a = seg(t, t0, t0 + 0.9);
        textGlow(c, w, W / 2, 560 + i * 140 - (1 - easeOut(seg(t, t0, t0 + 0.9))) * 30, `700 ${i === 2 ? 84 : 100}px Amiri`, '#f6c453', a, '#ffb300', 34); });
      c.restore();
      textGlow(c, 'Al-Anbiya, 87', W / 2, 1000, 'italic 500 36px Lora', '#f3e7d0', seg(t, d * 0.6, d * 0.7) * 0.8, '#000', 10);
    },
  },

  // 9. The answer — light pierces the sea, the fish rises
  answer: {
    grade: 'rgba(120,170,220,0.3)',
    draw(c, t, d) {
      const p = t / d, light = ease(seg(t, 0.4, d * 0.5)), rise = ease(seg(t, d * 0.3, d));
      cam(c, 1.0 + 0.05 * p, W / 2, 1000);
      sky(c, [[0, mix('#0a1626', '#3a7aa8', light)], [0.4, mix('#06101c', '#1a4a6e', light)], [1, mix('#010306', '#0a2236', light)]]);
      c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 540, -100, Math.PI / 2, 0.9, 1900, 16, '#d8ecff', 0.13 * light, t, 41); c.restore();
      whale(c, lerp(560, 600, rise), lerp(1500, 900, rise), 1.0, t, { dir: -1, col: '#1e3248', belly: '#344c62', inner: 0.4 * (1 - rise) });
      bubbles(c, t, 60, 13, [0, 300, W, 1500], 0.35 * light);
      dust(c, t, 60, 19, [0, 200, W, 1600], '#e0f0ff', 0.3 * light, 10);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'فَاسْتَجَبْنَا لَهُ', t, 0.6, d * 0.55, 280, 120, '#eef6ff');
      arabicCaption(c, 'وَنَجَّيْنَاهُ مِنَ الْغَمِّ', t, d * 0.58, d + 1, 280, 110, '#eef6ff');
    },
  },

  // 10. Cast onto a bare shore at dawn — the fish returns to the deep
  shore: {
    grade: 'rgba(255,190,140,0.28)',
    draw(c, t, d) {
      const p = t / d, go = ease(seg(t, d * 0.3, d));
      cam(c, 1.0 + 0.05 * p, W / 2, 1050);
      sky(c, [[0, '#3a4a6a'], [0.35, '#c89a9a'], [0.55, '#f4c8a0']]);
      sun(c, 300, 930, 55, '#ffe8c0', 0.8);
      waves(c, t, 960, 6, '#6a8aa8', 0.01, 0.5, 1, 'rgba(255,230,200,.35)');
      // the tail of the fish sinking back into the sea
      c.save(); c.translate(lerp(800, 900, go), lerp(990, 1100, go)); c.rotate(Math.sin(t * 1.5) * 0.1); c.globalAlpha = 1 - go;
      c.fillStyle = '#22344a'; c.beginPath(); c.moveTo(0, 60); c.quadraticCurveTo(-20, -40, -130, -120); c.quadraticCurveTo(-40, -70, 0, -60); c.quadraticCurveTo(40, -70, 130, -120); c.quadraticCurveTo(20, -40, 0, 60); c.fill(); c.restore();
      waves(c, t, 1060, 10, '#4a6e8e', 0.008, 0.8, 2, 'rgba(255,235,210,.4)');
      // bare beach (al-ʿarāʾ): sand, foam, a trace where the waves just withdrew
      c.fillStyle = '#d8b48a'; c.beginPath(); c.moveTo(-100, 1180); c.quadraticCurveTo(540, 1120, W + 100, 1200); c.lineTo(W + 100, H + 100); c.lineTo(-100, H + 100); c.fill();
      const fo = 1180 + Math.sin(t * 1.2) * 20;
      c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 6; c.beginPath(); c.moveTo(-100, fo); c.quadraticCurveTo(540, fo - 60, W + 100, fo + 20); c.stroke();
      c.fillStyle = 'rgba(120,90,60,0.35)'; c.beginPath(); c.ellipse(520, 1420, 210, 50, -0.05, 0, 6.283); c.fill();
      [[180, 1560], [820, 1500], [700, 1700]].forEach(([x, y]) => { c.fillStyle = '#a08060'; c.beginPath(); c.ellipse(x, y, 26, 14, 0, 0, 6.283); c.fill(); });
      for (let i = 0; i < 2; i++) bird(c, 600 + i * 90 + t * 20, 640 + Math.sin(t * 2 + i) * 20, 0.8, t + i, '#4a3a3a');
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'فَنَبَذْنَاهُ بِالْعَرَاءِ وَهُوَ سَقِيمٌ', t, 0.5, d + 1, 280, 80);
    },
  },

  // 11. The gourd plant grows and gives shade
  plant: {
    grade: 'rgba(255,200,110,0.28)',
    draw(c, t, d) {
      const p = t / d, g = ease(seg(t, 0.3, d * 0.85));
      cam(c, 1.03 + 0.04 * p, W / 2, 1150);
      sky(c, [[0, '#4a7aa8'], [0.4, '#e8d0a8'], [0.55, '#f6e0b0']]);
      sun(c, 860, 640, 70, '#fff2c0');
      rays(c, 860, 640, Math.PI * 0.7, 1.2, 1500, 10, '#fff0c0', 0.07, t, 9);
      waves(c, t, 1000, 5, '#7a9ab4', 0.01, 0.5, 1, 'rgba(255,240,210,.35)');
      c.fillStyle = '#e0bc8c'; c.beginPath(); c.moveTo(-100, 1060); c.quadraticCurveTo(540, 1020, W + 100, 1080); c.lineTo(W + 100, H + 100); c.lineTo(-100, H + 100); c.fill();
      // shade spreading on the sand where the vine covers
      c.fillStyle = `rgba(60,50,30,${0.35 * g})`; c.beginPath(); c.ellipse(500, 1440, 520 * g + 20, 90 * g + 6, 0, 0, 6.283); c.fill();
      gourd(c, 540, 1420, 1.7, g, t);
      dust(c, t, 30, 51, [0, 900, W, 700], '#fff4d0', 0.3, 10);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'شَجَرَةً مِّن يَقْطِينٍ', t, 0.6, d + 1, 280, 110);
    },
  },

  // 12. Nineveh repents — the punishment is lifted
  repent: {
    grade: 'rgba(90,90,140,0.32)',
    draw(c, t, d) {
      const p = t / d, lift = ease(seg(t, d * 0.55, d * 0.9));
      cam(c, 1.02 + 0.04 * p, W / 2, 1100);
      sky(c, [[0, mix('#14101a', '#4a7aa8', lift)], [0.4, mix('#3a2a34', '#e8c090', lift)], [0.6, mix('#4a3430', '#f4d0a0', lift)]]);
      if (lift > 0) { sun(c, 540, 600, 60, '#fff0c0', lift); c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 540, 600, Math.PI / 2, 2.6, 1500, 14, '#ffe8b8', 0.09 * lift, t, 5); c.restore(); }
      cloudBank(c, t, lerp(120, -380, lift), 16, '#2a1a20', 0.95 * (1 - lift * 0.8), 3, 16);
      c.fillStyle = `rgba(255,120,60,${0.12 * (1 - lift)})`; c.fillRect(-100, -100, W + 200, 900);
      city(c, 1020, mix('#4a3226', '#8a5e40', lift), 0.3, t, 0);
      c.fillStyle = mix('#3a2a20', '#9a7454', lift); c.fillRect(-100, 1010, W + 200, 1000);
      FOLK.forEach((f, i) => figure(c, Object.assign({ x: 80 + i * 132, y: 1210 + (i % 2) * 40, h: 300, dir: i < 4 ? 1 : -1, pose: lift > 0.6 ? 'kneel' : 'prostrate', light: 0.4 + 0.6 * lift }, f)));
      FOLK.slice(0, 6).forEach((f, i) => figure(c, Object.assign({ x: 150 + i * 160, y: 1350, h: 340, dir: i % 2 ? -1 : 1, pose: 'prostrate', light: 0.3 + 0.6 * lift }, f)));
      if (lift < 0.5) lightning(c, t, 4.2, 1.1);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'لَمَّا آمَنُوا كَشَفْنَا عَنْهُمْ', t, d * 0.4, d + 1, 280, 96);
    },
  },

  // 13. He returns to his people — the gate opens, more than 100 000
  return: {
    grade: 'rgba(255,180,100,0.3)',
    draw(c, t, d) {
      const p = t / d, open = ease(seg(t, d * 0.15, d * 0.5));
      cam(c, 1.0 + 0.06 * ease(p), W / 2, 1000);
      sky(c, [[0, '#4a6a92'], [0.4, '#eab890'], [0.58, '#f6d4a4']]);
      sun(c, 820, 520, 60, '#fff0c0');
      city(c, 1000, '#9a6a46', 0.2, t, open);
      c.fillStyle = '#b48a5e'; c.fillRect(-100, 990, W + 200, 1000);
      // footprints arriving from the shore toward the gate
      const pts = []; for (let i = 0; i < 12; i++) { const q = 1 - i / 11; pts.push([lerp(540, 300, q) + Math.sin(q * 5) * 30, lerp(1010, 1820, q), -0.2 + q * 0.15, lerp(0.55, 1.5, q)]); }
      footprints(c, pts, 0.3, t, '#5a3a20');
      // crowds of people coming out of the gate to meet him
      const r = rng(8);
      for (let i = 0; i < 16; i++) { const q = clamp(open * 1.4 - i * 0.05); if (q <= 0) continue;
        const side = i % 2 ? 1 : -1, x = 540 + side * (60 + q * (120 + r() * 340)), y = lerp(1000, 1180 + r() * 260, q);
        figure(c, Object.assign({ x, y, h: lerp(120, 300, q), dir: -side, light: 0.9, alpha: q }, FOLK[i % FOLK.length])); }
      c.setTransform(1, 0, 0, 1, 0, 0);
      textGlow(c, '100 000+', W / 2, 1720, '600 130px Lora', '#fbe7c6', seg(t, d * 0.35, d * 0.5) * 0.85, '#000', 20);
      arabicCaption(c, 'مِائَةِ أَلْفٍ أَوْ يَزِيدُونَ', t, d * 0.3, d + 1, 280, 96);
    },
  },

  // 14. "Thus do We save the believers" — the lamp in the night
  lesson: {
    grade: 'rgba(255,170,90,0.26)',
    draw(c, t, d) {
      const p = t / d;
      cam(c, 1.0 + 0.08 * ease(p), W / 2, 1150);
      sky(c, [[0, '#05060f'], [0.5, '#0e1228'], [0.7, '#141834']]);
      stars(c, t, 220, 61, [0, 0, W, 1100], 1);
      moon(c, 780, 420, 55, 1);
      waves(c, t, 1180, 8, '#0a1424', 0.008, 0.6, 1, 'rgba(200,220,255,.25)');
      c.fillStyle = '#1a140e'; c.beginPath(); c.moveTo(-100, 1320); c.quadraticCurveTo(540, 1270, W + 100, 1330); c.lineTo(W + 100, H + 100); c.lineTo(-100, H + 100); c.fill();
      lamp(c, 540, 1420, 1.6, t);
      dust(c, t, 40, 91, [200, 900, 700, 500], '#ffd890', 0.4, 6);
      c.setTransform(1, 0, 0, 1, 0, 0);
      arabicCaption(c, 'وَكَذَٰلِكَ نُنجِي الْمُؤْمِنِينَ', t, 0.4, d + 1, 300, 92);
    },
  },

  outro: {
    grade: null,
    draw(c, t, d) {
      sky(c, [[0, '#05060f'], [0.6, '#0d1024'], [1, '#14122a']]);
      stars(c, t + 50, 140, 81, [0, 0, W, H], 0.7);
      const a = seg(t, 0.2, 1.2);
      c.save(); c.direction = 'rtl';
      textGlow(c, 'وَإِنَّ يُونُسَ', W / 2, 770, '700 100px Amiri', '#f6c453', a, '#ffb300', 30);
      textGlow(c, 'لَمِنَ الْمُرْسَلِينَ', W / 2, 900, '700 90px Amiri', '#f6c453', a, '#ffb300', 30);
      c.restore();
      const b = seg(t, 0.8, 1.8);
      textGlow(c, '« Et Yunus était, certes, du nombre des Messagers. »', W / 2, 1040, 'italic 500 36px Lora', '#f3e7d0', b, '#000', 10);
      textGlow(c, '— As-Saffat, 139', W / 2, 1100, 'italic 500 38px Lora', '#f3e7d0', b, '#000', 10);
      textGlow(c, 'LES PROPHÈTES  ·  À SUIVRE', W / 2, 1330, '600 34px Lora', '#c9b48a', seg(t, 1.6, 2.4), '#000', 8);
      c.fillStyle = 'rgba(0,0,0,' + seg(t, d - 0.8, d) + ')'; c.fillRect(0, 0, W, H);
    },
  },
};
