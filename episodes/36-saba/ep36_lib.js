
// =====================================================================================================================
// ---------- episode 36: the people of Saba and the flood of the dam (Saba 15-19) · « Histoires du Coran »
// The people of Saba, the woman with the basket, the rich men, the travellers and the storytellers are ordinary people, faceless.
// Allah is never depicted (light only). Ma'rib as the place of the dam = according to the exegetes; the rats gnawing the dam =
// « according to some reports » (Wahb ibn Munabbih, quoted by Ibn Kathir). No one is ever shown in the water: the flood takes trees and fields.
function seriesTag36(c, a) { textGlow(c, 'HISTOIRES DU CORAN  ·  ÉPISODE 36', W / 2, 112, '600 32px Lora', '#fbe7c6', a * 0.92, '#000000', 12); }
function ctaText36(c, a) { ctaText29(c, a); }
const SEED36 = 3600, DY36 = 1185;                     // DY36 = the foot of the dam = far end of the valley floor
const hY36 = y => Math.max(40, (y - 1170) * 0.95);    // figure height by depth on the valley floor
const wcx36 = y => 540 + Math.sin((y - DY36) * 0.004) * 46 * clamp((y - DY36) / 420); // centre of the wadi bed
const whw36 = y => 14 + (y - DY36) * 0.17;            // half width of the wadi bed
const footL36 = y => 290 - (y - DY36) * 2.4, footR36 = y => 790 + (y - DY36) * 2.4; // feet of the two mountains
const SABA36 = [
  { robe: '#2e4a6a', wrap: '#e8dcc4', skin: '#a8714f', trim: '#c9a35a', band: '#c9a35a', inner: '#e2d8c0' },
  { robe: '#7a4a24', wrap: '#ece2cc', skin: '#9a6a4c', trim: '#3a2210', band: '#3a2210', inner: '#e0d6c0' },
  { robe: '#2e5a4a', wrap: '#dccfb2', skin: '#b07a58', trim: '#d8b070', band: '#d8b070', inner: '#d8ccb0' },
  { robe: '#6a3a2a', wrap: '#e6dcc8', skin: '#94664a', trim: '#b8a070', band: '#b8a070', inner: '#ddd4c0' },
  { robe: '#5a5a2e', wrap: '#efe6d2', skin: '#a8714f', trim: '#4a3018', band: '#4a3018', inner: '#e6dcc6' },
  { robe: '#3a3a5e', wrap: '#d8ccb4', skin: '#8f5f42', trim: '#a89070', band: '#a89070', inner: '#cfc4aa' },
  { robe: '#8a5a2a', wrap: '#e8e0cc', skin: '#b07a58', trim: '#5a3a20', band: '#5a3a20', inner: '#ddd2ba' },
  { robe: '#4a2e3e', wrap: '#e4dccc', skin: '#9a6a4c', trim: '#c8b48a', band: '#c8b48a', inner: '#e0d8c6' }];
const WOMAN36 = { robe: '#2a4a6e', wrap: '#2e2a3e', skin: '#a8714f', trim: '#d8b45a', band: '#d8b45a', inner: '#5a5a7a', covered: true, agal: false };
const GIRL36 = { robe: '#7a3a3a', wrap: '#3a2632', skin: '#a8714f', trim: '#e2c27a', band: '#e2c27a', inner: '#8a6a6a', covered: true, agal: false, child: true };
const BOY36 = { robe: '#4a6a3a', wrap: '#e6dabe', skin: '#a8714f', trim: '#e2c27a', band: '#e2c27a', inner: '#e4dac4', child: true };
const RICH36 = [
  { robe: '#6a1a2e', wrap: '#f0e6cc', skin: '#a8714f', trim: '#e8c060', band: '#e8c060', inner: '#efe4cc' },
  { robe: '#1e3a5a', wrap: '#f2e8d0', skin: '#9a6a4c', trim: '#e8c060', band: '#e8c060', inner: '#ece2ca' },
  { robe: '#4a2a5a', wrap: '#ece0c6', skin: '#b07a58', trim: '#d8b45a', band: '#d8b45a', inner: '#e8dcc4' }];
const OLD36 = { robe: '#5a4a3a', wrap: '#ece6d8', skin: '#9a6a4c', trim: '#c8b48a', band: '#c8b48a', inner: '#e6e0d0' };
const GOLD36 = { sky: 'gold', sunA: 0.7, sunX: 250, sunY: 980, haze: '#f0c8a0' };
const DAY36 = { sky: 'day', to: 'gold', k: 0.25, sunA: 0.55, sunX: 230, sunY: 760, haze: '#f0dcc4' };
const DAWN36 = { sky: 'dawn', to: 'gold', k: 0.3, sunA: 0.75, sunX: 820, sunY: 1010, haze: '#f0d0b8' };
const DUSK36 = { sky: 'dusk', to: 'gold', k: 0.35, sunA: 0.7, sunX: 230, sunY: 1000, haze: '#f0b0a0', lamp: 0.4 };
const STORM36 = { sky: 'grey', to: 'night', k: 0.45, storm: 1, haze: '#5a5a6a', rain: 0.5 };
const NIGHT36 = { sky: 'night', stars: 0.8, moon: 0.6, moonX: 840, moonY: 420, night: 1, lamp: 0.8, haze: '#2a2a48' };

// ---------- plants ------------------------------------------------------------------------------------------------
// a fruit tree of the gardens (orange-red fruits); origin = foot, ~440*s tall
function fruitTree36(c, x, y, s, T, seed, o = {}) { T += 100; const nt = o.night || 0, r = rng(seed);
  const leafC = mix(o.col || ['#3f6a2a', '#4a7430', '#365e26'][seed % 3], '#141a1a', nt * 0.75), dk = mix(leafC, '#0a1008', 0.45), lt = mix(leafC, '#e0eca8', 0.3 * (1 - nt)), trunkC = mix('#5a4030', '#18161c', nt * 0.7);
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.25)'; c.beginPath(); c.ellipse(0, 2, 120, 14, 0, 0, 6.283); c.fill();
  const sw = Math.sin(T * 0.8 + seed) * 4 * (o.wind === undefined ? 1 : o.wind);
  limb(c, [0, 0], [-6, -90], [sw * 0.5 - 4, -190], 30, 18, trunkC);
  limb(c, [-4, -150], [-40, -190], [-84 + sw, -236], 14, 8, trunkC); limb(c, [0, -160], [40, -200], [80 + sw, -246], 14, 8, trunkC);
  const cy = -290, B = []; for (let i = 0; i < 12; i++) { const a = r() * 6.283, d = Math.sqrt(r()); B.push([Math.cos(a) * 120 * d + sw, cy + Math.sin(a) * 72 * d, 58 + r() * 32]); }
  c.fillStyle = dk; B.forEach(([bx, by, br]) => { c.beginPath(); c.arc(bx, by + 12, br, 0, 6.283); c.fill(); });
  c.fillStyle = leafC; B.forEach(([bx, by, br]) => { c.beginPath(); c.arc(bx - 6, by - 4, br * 0.86, 0, 6.283); c.fill(); });
  c.fillStyle = lt; B.forEach(([bx, by, br], i) => { if (i % 2) return; c.beginPath(); c.arc(bx - 20, by - 22, br * 0.48, 0, 6.283); c.fill(); });
  c.fillStyle = hexA(mix(leafC, '#000000', 0.3), 0.5); for (let i = 0; i < 40; i++) { const a = r() * 6.283, d = Math.sqrt(r()); c.beginPath(); c.ellipse(Math.cos(a) * 140 * d + sw, cy + Math.sin(a) * 84 * d, 9, 5, a, 0, 6.283); c.fill(); }
  const nf = Math.round((o.fruit === undefined ? 1 : o.fruit) * 18), fc = o.fruitCol || ['#e2862a', '#c8402a', '#e8a832'][seed % 3];
  for (let i = 0; i < 18; i++) { const a = r() * 6.283, d = 0.35 + 0.65 * Math.sqrt(r()); if (i >= nf) continue; const fx = Math.cos(a) * 118 * d + sw, fy = cy + 6 + Math.abs(Math.sin(a)) * 64 * d;
    c.fillStyle = mix(fc, '#000000', 0.3 + nt * 0.4); c.beginPath(); c.arc(fx + 1.5, fy + 1.5, 9.5, 0, 6.283); c.fill(); c.fillStyle = mix(fc, '#181418', nt * 0.6); c.beginPath(); c.arc(fx, fy, 8.5, 0, 6.283); c.fill();
    c.fillStyle = `rgba(255,250,220,${0.5 * (1 - nt)})`; c.beginPath(); c.arc(fx - 3, fy - 3, 2.6, 0, 6.283); c.fill(); }
  c.restore(); }
// the tamarisk (athl, Saba 16): several stems, grey-green feathery plumes; ~300*s tall
function tamarisk36(c, x, y, s, T, seed, o = {}) { T += 100; const nt = o.night || 0, r = rng(seed);
  const col = mix('#8a9480', '#1a1e22', nt * 0.7), dk = mix(col, '#2a3028', 0.45), lt = mix(col, '#f2f0e0', 0.35 * (1 - nt)), stem = mix('#5e4a3c', '#16141a', nt * 0.7);
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.25)'; c.beginPath(); c.ellipse(0, 2, 110, 11, 0, 0, 6.283); c.fill();
  const tips = []; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.3 + (r() - 0.5) * 0.15, L = 170 + r() * 70, ex = Math.cos(a) * L, ey = Math.sin(a) * L;
    limb(c, [(i - 2) * 6, 0], [ex * 0.3 + (r() - 0.5) * 24, ey * 0.55], [ex, ey], 12, 4, stem); tips.push([ex, ey]); }
  // soft crown masses
  tips.forEach(([tx, ty]) => { c.fillStyle = hexA(dk, 0.75); c.beginPath(); c.ellipse(tx, ty + 34, 74, 48, 0, 0, 6.283); c.fill(); });
  tips.forEach(([tx, ty]) => { c.fillStyle = hexA(col, 0.85); c.beginPath(); c.ellipse(tx - 8, ty + 22, 60, 36, 0, 0, 6.283); c.fill(); });
  // drooping feathery strands (the tamarisk's « hair »)
  c.lineCap = 'round';
  tips.forEach(([tx, ty], i) => { for (let k = 0; k < 26; k++) { const a = r() * 6.283, d = Math.sqrt(r()), px = tx + Math.cos(a) * 64 * d, py = ty + 10 + Math.sin(a) * 34 * d, L = 26 + r() * 44, sw = Math.sin(T * 0.9 + i + k * 0.3) * 3;
    c.strokeStyle = hexA(k % 3 === 0 ? dk : (k % 3 === 1 ? col : lt), 0.9); c.lineWidth = 2.6; c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo(px + 6 + sw, py + L * 0.45, px + 3 + sw * 1.4, py + L); c.stroke(); } });
  c.restore(); }
// the bitter fruit (khamt, Saba 16 — the arak / bitter thorny bush): a low dome, dark leaves, small dark berries; ~130*s tall
function khamt36(c, x, y, s, T, seed, o = {}) { const nt = o.night || 0, r = rng(seed);
  const col = mix('#4e5c32', '#141818', nt * 0.7), dk = mix(col, '#0a0c08', 0.5), lt = mix(col, '#c8d8a0', 0.25 * (1 - nt));
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.28)'; c.beginPath(); c.ellipse(0, 2, 118, 12, 0, 0, 6.283); c.fill();
  c.strokeStyle = mix('#4a3a2e', '#141218', nt * 0.7); c.lineWidth = 4; c.lineCap = 'round';
  for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.34; c.beginPath(); c.moveTo((i - 4) * 3, 0); c.quadraticCurveTo(Math.cos(a) * 50, Math.sin(a) * 60 - 10, Math.cos(a) * 104, Math.sin(a) * 112 + 26); c.stroke(); }
  const B = []; for (let i = 0; i < 15; i++) { const a = Math.PI + 0.15 + r() * (Math.PI - 0.3), d = 0.35 + r() * 0.65; B.push([Math.cos(a) * 96 * d, -40 + Math.sin(a) * 74 * d, 28 + r() * 16]); }
  c.fillStyle = dk; B.forEach(([bx, by, br]) => { c.beginPath(); c.arc(bx, by + 6, br, 0, 6.283); c.fill(); });
  c.fillStyle = col; B.forEach(([bx, by, br]) => { c.beginPath(); c.arc(bx - 3, by - 2, br * 0.82, 0, 6.283); c.fill(); });
  c.fillStyle = lt; B.forEach(([bx, by, br], i) => { if (i % 3) return; c.beginPath(); c.arc(bx - 10, by - 10, br * 0.4, 0, 6.283); c.fill(); });
  c.strokeStyle = hexA(mix('#3a2a1e', '#000000', 0.2), 0.8); c.lineWidth = 2; for (let i = 0; i < 16; i++) { const a = Math.PI + r() * Math.PI, R = 100 + r() * 12, px = Math.cos(a) * R * 0.98, py = -30 + Math.sin(a) * R * 0.78; c.beginPath(); c.moveTo(px, py); c.lineTo(px + Math.cos(a) * 12, py + Math.sin(a) * 12); c.stroke(); }
  for (let i = 0; i < 26; i++) { const a = Math.PI + 0.2 + r() * (Math.PI - 0.4), d = 0.4 + r() * 0.6; const bx = Math.cos(a) * 92 * d, by = -38 + Math.sin(a) * 70 * d;
    c.fillStyle = mix('#5a1e2e', '#120a10', nt * 0.6); c.beginPath(); c.arc(bx, by, 4.2, 0, 6.283); c.fill(); c.fillStyle = 'rgba(255,220,220,0.35)'; c.beginPath(); c.arc(bx - 1.2, by - 1.2, 1.2, 0, 6.283); c.fill(); }
  c.restore(); }
// the lote tree (sidr, Saba 16): a gnarled small tree, zigzag thorny branches, sparse small leaves, a few small yellow fruits; ~330*s tall
function sidr36(c, x, y, s, T, seed, o = {}) { T += 100; const nt = o.night || 0, r = rng(seed);
  const bark = mix('#5a4434', '#18161c', nt * 0.7), leaf = mix('#6a7a3a', '#161a1a', nt * 0.7), lt = mix(leaf, '#e0e8a8', 0.3 * (1 - nt));
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.25)'; c.beginPath(); c.ellipse(0, 2, 110, 12, 0, 0, 6.283); c.fill();
  limb(c, [0, 0], [26, -90], [-6, -170], 30, 16, bark);
  const tips = [];
  const br = (x0, y0, a, L, w, d) => { const sw = Math.sin(T * 0.7 + d + x0 * 0.02) * 0.02; const mx = x0 + Math.cos(a + 0.35) * L * 0.5, my = y0 + Math.sin(a + 0.35) * L * 0.5, ex = mx + Math.cos(a - 0.3 + sw) * L * 0.5, ey = my + Math.sin(a - 0.3 + sw) * L * 0.5;
    c.strokeStyle = bark; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(mx, my); c.lineTo(ex, ey); c.stroke();
    c.lineWidth = Math.max(1.4, w * 0.25); c.beginPath(); c.moveTo(mx, my); c.lineTo(mx + Math.cos(a + 1.3) * 10, my + Math.sin(a + 1.3) * 10); c.stroke(); // thorn
    if (d >= 3) { tips.push([ex, ey]); return; } br(ex, ey, a - 0.45 - r() * 0.2, L * 0.72, w * 0.62, d + 1); br(ex, ey, a + 0.4 + r() * 0.2, L * 0.7, w * 0.6, d + 1); };
  br(-6, -170, -Math.PI / 2 - 0.5, 110, 14, 0); br(-6, -170, -Math.PI / 2 + 0.55, 104, 13, 0);
  tips.forEach(([tx, ty], i) => { for (let k = 0; k < 9; k++) { const lx = tx + (r() - 0.5) * 50, ly = ty + (r() - 0.5) * 36; c.fillStyle = k % 3 ? leaf : lt; c.beginPath(); c.ellipse(lx, ly, 7, 5, r() * 3, 0, 6.283); c.fill(); }
    if (i % 2 === 0) { c.fillStyle = mix('#d89a2a', '#1a1410', nt * 0.6); c.beginPath(); c.arc(tx + 6, ty + 8, 5, 0, 6.283); c.fill(); } });
  c.restore(); }

// ---------- the landscape of Ma'rib (according to the exegetes): two mountains, the dam in the gap, the reservoir behind it,
// the valley floor with fields, canals, two gardens (right and left of the wadi bed)
const topL36 = x => { const u = clamp((335 - x) / 560); return 1190 - 300 * ease(u) - 120 * ease(clamp((335 - x) / 1100)) - 70 * clamp((335 - x) / 90) * (1 - u) + noise1(x * 0.0035, 3) * 80 * u + noise1(x * 0.012, 4) * 22 * u + noise1(x * 0.05, 7) * 5 * u; };
const topR36 = x => { const u = clamp((x - 745) / 560); return 1190 - 310 * ease(u) - 120 * ease(clamp((x - 745) / 1100)) - 70 * clamp((x - 745) / 90) * (1 - u) + noise1(x * 0.0035, 5) * 80 * u + noise1(x * 0.012, 6) * 22 * u + noise1(x * 0.05, 8) * 5 * u; };
const hillL36 = x => 1192 - 95 * ease(clamp((250 - x) / 380)) + noise1(x * 0.01, 11) * 14 * clamp((250 - x) / 200), hillR36 = x => 1192 - 100 * ease(clamp((x - 830) / 380)) + noise1(x * 0.01, 12) * 14 * clamp((x - 830) / 200);
function mtn36(c, T, nt, st) {
  const base = mix(mix('#8e6c58', '#4a4450', st * 0.6), '#14141e', nt * 0.85), lit = mix(base, '#ffd8b0', 0.3 * (1 - nt) * (1 - st * 0.7)), sh = mix(base, '#140c10', 0.5);
  [[topL36, -2600, 335, -900, 335], [topR36, 745, 3700, 745, 2000]].forEach(([top, x0, x1, gl, gs], side) => {
    const path = () => { c.beginPath(); c.moveTo(x0, H + 900); for (let x = x0; x <= x1; x += 10) c.lineTo(x, top(x)); c.lineTo(x1, H + 900); c.closePath(); };
    path(); const g = c.createLinearGradient(gl, 0, gs, 0); if (side === 0) { g.addColorStop(0, lit); g.addColorStop(0.55, base); g.addColorStop(1, sh); } else { g.addColorStop(0, lit); g.addColorStop(0.4, base); g.addColorStop(1, sh); }
    c.fillStyle = g; c.fill();
    c.save(); path(); c.clip(); const r = rng(SEED36 + 10 + side);
    for (let k = 0; k < 14; k++) { const yy = 700 + k * 38; c.strokeStyle = hexA(k % 2 ? sh : lit, 0.14); c.lineWidth = 3; c.beginPath(); for (let x = x0; x <= x1; x += 24) { const v = yy + noise1(x * 0.006, k + 20 + side * 30) * 22 + (x - 540) * (side ? 0.06 : -0.06); x === x0 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); }
    for (let i = 0; i < 34; i++) { const x = side ? 770 + r() * 1300 : -1000 + r() * 1310, y0 = top(x) + 10 + r() * 60; if (y0 > 1120) continue; const L = 70 + r() * 150, dx = (r() - 0.5) * 30;
      c.strokeStyle = hexA(sh, 0.3); c.lineWidth = 2 + r() * 3; c.beginPath(); c.moveTo(x, y0); c.quadraticCurveTo(x + dx, y0 + L * 0.5, x + dx * 0.4, y0 + L); c.stroke();
      c.strokeStyle = hexA(lit, 0.2); c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + 4, y0 + 2); c.quadraticCurveTo(x + 4 + dx, y0 + L * 0.5, x + 4 + dx * 0.4, y0 + L * 0.9); c.stroke(); }
    for (let i = 0; i < 30; i++) { const x = side ? 770 + r() * 1300 : -1000 + r() * 1310, y = top(x) + 30 + r() * 300; if (y > 1170) continue; c.fillStyle = hexA(r() > 0.5 ? sh : lit, 0.16); c.beginPath(); c.ellipse(x, y, 16 + r() * 40, 6 + r() * 12, (r() - 0.5) * 0.4, 0, 6.283); c.fill(); }
    const sg = c.createLinearGradient(0, 1120, 0, 1260); sg.addColorStop(0, hexA(mix(base, '#e8c8a0', 0.25), 0)); sg.addColorStop(1, hexA(mix(base, '#e8c8a0', 0.25 * (1 - nt)), 0.6)); c.fillStyle = sg; c.fillRect(x0, 1120, x1 - x0, 600); // scree at the foot
    c.restore();
    c.strokeStyle = hexA(lit, 0.45); c.lineWidth = 3; c.beginPath(); for (let x = x0; x <= x1; x += 10) x === x0 ? c.moveTo(x, top(x) + 1) : c.lineTo(x, top(x) + 1); c.stroke(); });
  // nearer foothills (lighter, hazier), their feet hidden by the valley floor
  const fh = mix(base, '#e8c8a0', 0.22 * (1 - nt)), fhd = mix(fh, '#140c10', 0.35);
  [[hillL36, -2600, 252], [hillR36, 828, 3700]].forEach(([top, x0, x1], side) => { c.beginPath(); c.moveTo(x0, H + 900); for (let x = x0; x <= x1; x += 10) c.lineTo(x, top(x)); c.lineTo(x1, H + 900); c.closePath();
    const g = c.createLinearGradient(0, 1080, 0, 1260); g.addColorStop(0, fh); g.addColorStop(1, fhd); c.fillStyle = g; c.fill();
    c.save(); c.clip(); const r = rng(SEED36 + 15 + side); for (let i = 0; i < 40; i++) { const x = side ? 840 + r() * 1200 : -950 + r() * 1190, y = top(x) + 6 + r() * 70; c.fillStyle = hexA(r() > 0.5 ? fhd : mix(fh, '#fff0d8', 0.3), 0.3); c.beginPath(); c.ellipse(x, y, 8 + r() * 22, 3 + r() * 6, 0, 0, 6.283); c.fill(); }
    for (let i = 0; i < 10; i++) { const x = side ? 860 + r() * 900 : -650 + r() * 880; shrub(c, x, top(x) + 8 + r() * 20, 0.25 + r() * 0.2, mix('#6a6a3a', '#141818', nt * 0.8), T, SEED36 + 16 + i); } c.restore();
    c.strokeStyle = hexA(mix(fh, '#fff0d8', 0.35), 0.5); c.lineWidth = 2.5; c.beginPath(); for (let x = x0; x <= x1; x += 10) x === x0 ? c.moveTo(x, top(x) + 1) : c.lineTo(x, top(x) + 1); c.stroke(); });
}
// the reservoir behind the dam (a strip of water between the mountains); o.high = brimming, choppy (storm)
function lake36(c, T, nt, st, o = {}) { T += 100; const y0 = 1062, y1 = 1104, lvl = o.ruins ? 0 : 1;
  if (!lvl || o.after) { const g = c.createLinearGradient(0, y0 - 8, 0, y1); g.addColorStop(0, mix('#b89a80', '#24222e', nt * 0.8)); g.addColorStop(1, mix('#d0b08a', '#2a2834', nt * 0.8)); c.fillStyle = g; c.fillRect(150, y0 - 8, 780, y1 - y0 + 8);
    c.strokeStyle = hexA(mix('#8a6a4a', '#14121a', nt * 0.8), 0.35); c.lineWidth = 2; for (let k = 0; k < 4; k++) { c.beginPath(); for (let x = 150; x <= 930; x += 20) { const v = y0 + 4 + k * 10 + Math.sin(x * 0.02 + k * 2) * 3; x === 150 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); } return; }
  c.fillStyle = mix(mix('#4a5a3a', '#2a2e30', st), '#121418', nt * 0.8); c.fillRect(150, y0 - 6, 780, 8); // far shore
  const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, mix(mix('#9ab8c8', '#5a6470', st), '#1a2236', nt * 0.8)); g.addColorStop(1, mix(mix('#4a7a8e', '#3a4450', st), '#0e1626', nt * 0.8));
  c.fillStyle = g; c.fillRect(150, y0, 780, y1 - y0);
  const r = rng(SEED36 + 20); c.strokeStyle = `rgba(240,248,255,${0.35 * (1 - nt * 0.6)})`; c.lineWidth = 1.6;
  for (let i = 0; i < 40; i++) { const yy = y0 + 4 + r() * (y1 - y0 - 6), x = 160 + ((r() * 760 + T * (8 + st * 30) * (0.5 + r())) % 760), L = 10 + r() * 24; c.beginPath(); c.moveTo(x, yy); c.lineTo(x + L, yy); c.stroke(); }
}
// the dam: a long stone wall across the gap, buttresses, two sluice towers at its ends (water into the canals).
// o.flow = water released into the canals; o.crack 0..1; o.breach 0..1 = the wall bursts in the middle; o.ruins = only the sluices remain (today)
const DX0 = 300, DX1 = 780, DTOP = 1092;
function dam36(c, T, o = {}) { T += 100; const nt = o.night || 0, st = o.storm || 0, br = o.breach || 0;
  const stone = mix(mix('#c2a47c', '#7a7472', st * 0.5), '#26242e', nt * 0.8), dk = mix(stone, '#1a0e08', 0.45), lt = mix(stone, '#fff0d8', 0.3 * (1 - nt));
  const tower = (x0, x1, top, ruin) => { c.fillStyle = stone; c.beginPath(); c.moveTo(x0 - 4, DY36 + 2); c.lineTo(x0, top); c.lineTo(x1, top); c.lineTo(x1 + 4, DY36 + 2); c.closePath(); c.fill();
    c.fillStyle = hexA(dk, 0.45); c.fillRect(x1 - (x1 - x0) * 0.3, top, (x1 - x0) * 0.3 + 4, DY36 + 2 - top);
    c.strokeStyle = hexA(dk, 0.6); c.lineWidth = 1.2; for (let y = DY36 - 7, k = 0; y > top + 2; y -= 7, k++) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); for (let x = x0 + (k % 2) * 6; x < x1; x += 12) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 7); c.stroke(); } }
    if (ruin) { c.fillStyle = mix(stone, '#000000', 0.15); c.beginPath(); c.moveTo(x0, top); for (let k = 0; k <= 5; k++) c.lineTo(lerp(x0, x1, k / 5), top - (k % 2 ? 8 : 0) - (k === 2 ? 10 : 0)); c.lineTo(x1, top + 4); c.closePath(); c.fill(); }
    else { c.fillStyle = lt; c.fillRect(x0 - 2, top - 4, x1 - x0 + 4, 5); }
    const gx = (x0 + x1) / 2; c.fillStyle = '#140c08'; c.beginPath(); archPath(c, gx, DY36 + 1, (x1 - x0) * 0.4, 22); c.fill(); return gx; };
  if (o.ruins) { const block = (x0, x1, steps, top, sd) => { const r = rng(sd), w = x1 - x0; for (let k = 0; k < steps; k++) { const ya = lerp(DY36 + 2, top, k / steps), yb = lerp(DY36 + 2, top, (k + 1) / steps), ins = k * w * 0.07 * (r() + 0.4);
        c.fillStyle = mix(stone, k % 2 ? '#fff0d8' : '#1a0e08', 0.06); c.fillRect(x0 + ins, yb, w - ins * 1.6, ya - yb); c.fillStyle = hexA(dk, 0.45); c.fillRect(x1 - ins * 0.6 - w * 0.22, yb, w * 0.22, ya - yb); c.fillStyle = hexA(lt, 0.6); c.fillRect(x0 + ins, yb, w - ins * 1.6, 2);
        c.strokeStyle = hexA(dk, 0.55); c.lineWidth = 1; for (let y = ya - 7; y > yb; y -= 7) { c.beginPath(); c.moveTo(x0 + ins, y); c.lineTo(x1 - ins * 0.6, y); c.stroke(); } for (let y = ya; y > yb + 2; y -= 7) for (let x = x0 + ins + ((y / 7) % 2) * 6; x < x1 - ins * 0.6; x += 13) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 7); c.stroke(); } } };
    block(DX0 - 40, DX0 + 70, 4, DTOP - 70, SEED36 + 35); block(DX1 - 80, DX1 + 30, 3, DTOP - 52, SEED36 + 36);
    c.fillStyle = '#140c08'; c.fillRect(DX0 + 6, DY36 - 30, 22, 32); c.fillRect(DX1 - 40, DY36 - 24, 20, 26); // the old sluice channels
    rubble(c, 450, DY36 + 2, 120, 0.45, stone, SEED36 + 31, nt); rubble(c, 640, DY36 + 2, 100, 0.4, stone, SEED36 + 32, nt); return; }
  // the long wall (with the breach cut out of it)
  const nB = clamp(br * 1.4), hwT = 14 + 120 * br, hwB = 4 + 76 * br, nbY = lerp(DTOP + 10, DY36 + 2, nB);
  c.save();
  if (br > 0) { c.beginPath(); c.rect(0, 900, W, 400); c.moveTo(540 - hwT, DTOP - 20); c.lineTo(540 - hwB, nbY); c.lineTo(540 + hwB, nbY); c.lineTo(540 + hwT, DTOP - 20); c.closePath(); c.clip('evenodd'); }
  const g = c.createLinearGradient(0, DTOP, 0, DY36); g.addColorStop(0, lt); g.addColorStop(0.4, stone); g.addColorStop(1, mix(stone, '#1a0e08', 0.2));
  c.fillStyle = g; c.beginPath(); c.moveTo(DX0 - 4, DY36 + 2); c.lineTo(DX0 + 6, DTOP); c.lineTo(DX1 - 6, DTOP); c.lineTo(DX1 + 4, DY36 + 2); c.closePath(); c.fill();
  c.strokeStyle = hexA(dk, 0.42); c.lineWidth = 1; for (let y = DY36 - 6, k = 0; y > DTOP + 3; y -= 6, k++) { c.beginPath(); c.moveTo(DX0, y); c.lineTo(DX1, y); c.stroke(); }
  c.strokeStyle = hexA(dk, 0.3); for (let y = DY36 - 6, k = 0; y > DTOP + 3; y -= 6, k++) { c.beginPath(); for (let x = DX0 + (k % 2) * 7; x < DX1; x += 14) { c.moveTo(x, y); c.lineTo(x, y + 6); } c.stroke(); }
  for (let x = DX0 + 60; x < DX1 - 40; x += 46) { c.fillStyle = hexA(lt, 0.35); c.fillRect(x - 7, DTOP + 4, 7, DY36 - DTOP - 2); c.fillStyle = hexA(dk, 0.35); c.fillRect(x, DTOP + 4, 7, DY36 - DTOP - 2); } // buttresses
  c.fillStyle = lt; c.fillRect(DX0 + 6, DTOP - 3, DX1 - DX0 - 12, 5); c.fillStyle = hexA(dk, 0.5); c.fillRect(DX0 + 6, DTOP + 2, DX1 - DX0 - 12, 2);
  c.fillStyle = hexA(mix(stone, '#2a3a2a', 0.5), 0.35); c.fillRect(DX0, DY36 - 10, DX1 - DX0, 12); // damp foot
  if (o.crack) { c.save(); c.strokeStyle = `rgba(30,18,12,${0.75 * o.crack})`; c.lineCap = 'round'; const r = rng(SEED36 + 33);
    for (let i = 0; i < 7; i++) { let px = 540 + (r() - 0.5) * 16, py = DY36 - 4; const n = 3 + Math.floor(o.crack * 6); for (let j = 0; j < n; j++) { const nx = px + (r() - 0.5) * 22, ny = py - 8 - r() * 8; c.lineWidth = 2.2 - j * 0.15; c.beginPath(); c.moveTo(px, py); c.lineTo(nx, ny); c.stroke(); px = nx; py = ny; if (py < DTOP + 4) break; } } c.restore(); }
  c.restore();
  const gL = tower(DX0 - 6, DX0 + 52, DTOP - 26, false), gR = tower(DX1 - 56, DX1 + 4, DTOP - 30, false);
  if (o.flow) { [gL, gR].forEach((gx, i) => { c.fillStyle = `rgba(220,240,250,${0.7 * o.flow})`; c.beginPath(); c.ellipse(gx, DY36 + 4, 12, 4, 0, 0, 6.283); c.fill();
    c.save(); c.globalCompositeOperation = 'lighter'; glow(c, gx, DY36, 26, '#e0f4ff', 0.3 * o.flow); c.restore(); }); }
  // the breach: the falling torrent, spray, blocks tumbling
  if (br > 0 && o.after) { c.fillStyle = mix(stone, '#1a0e08', 0.25); c.beginPath(); c.moveTo(540 - hwT, DTOP); c.lineTo(540 - hwB - 10, DY36 + 2); c.lineTo(540 + hwB + 10, DY36 + 2); c.lineTo(540 + hwT, DTOP); c.closePath(); c.globalAlpha = 0; c.fill(); c.globalAlpha = 1;
    rubble(c, 540 - hwT * 0.6, DY36 + 2, 60, 0.35, stone, SEED36 + 37, nt); rubble(c, 540 + hwT * 0.7, DY36 + 2, 50, 0.3, stone, SEED36 + 38, nt); }
  else if (br > 0) { const r = rng(SEED36 + 34);
    c.save(); c.beginPath(); c.moveTo(540 - hwT, DTOP - 20); c.lineTo(540 - hwB, nbY); c.lineTo(540 - hwB - 6, DY36 + 6); c.lineTo(540 + hwB + 6, DY36 + 6); c.lineTo(540 + hwB, nbY); c.lineTo(540 + hwT, DTOP - 20); c.closePath(); c.clip();
    const wg = c.createLinearGradient(0, DTOP - 20, 0, DY36); wg.addColorStop(0, mix('#8aa0a8', '#4a4e54', st)); wg.addColorStop(0.5, '#a08866'); wg.addColorStop(1, '#e8e0d0'); c.fillStyle = wg; c.fillRect(540 - hwT - 10, DTOP - 30, hwT * 2 + 20, DY36 - DTOP + 40);
    c.strokeStyle = 'rgba(250,246,236,0.55)'; c.lineWidth = 2; for (let i = 0; i < 26; i++) { const x = 540 - hwT + r() * hwT * 2, ph = ((T * 2.2 + r()) % 1), y = DTOP - 10 + ph * (DY36 - DTOP + 10); c.beginPath(); c.moveTo(x, y - 12); c.lineTo(x + (x - 540) * 0.06, y + 8); c.stroke(); }
    c.restore();
    c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, DY36 - 4, 60 + 160 * br, '#f4f0e8', 0.45 * Math.min(1, br * 2)); c.restore();
    for (let i = 0; i < 22; i++) { const a = -Math.PI / 2 + (r() - 0.5) * 2.6, ph = ((T * (0.6 + r() * 0.5) + r()) % 1), d = (20 + r() * 90) * (0.4 + br) * ph; c.fillStyle = `rgba(245,242,235,${0.5 * (1 - ph) * Math.min(1, br * 2)})`;
      c.beginPath(); c.arc(540 + Math.cos(a) * d * 1.6, DY36 - 6 + Math.sin(a) * d * 0.7, 6 + ph * 16, 0, 6.283); c.fill(); }
    if (br < 0.75) for (let i = 0; i < 6; i++) { const f = clamp(br * 1.8 - i * 0.08), x = 540 + (r() - 0.5) * hwT * 1.6, y = DTOP + 6 + f * f * 120; if (f <= 0 || y > DY36 - 4) continue; c.fillStyle = mix(stone, '#000000', 0.2 + r() * 0.2); c.save(); c.translate(x, y); c.rotate(f * (r() - 0.5) * 6); c.fillRect(-6, -4, 12, 8); c.restore(); }
  }
}
// the valley floor: fields in perspective, two main canals from the sluices, the wadi bed between the two gardens. o.after = dry cracked mud
const floorPath36 = c => { c.beginPath(); c.moveTo(footL36(DY36), DY36); c.lineTo(footR36(DY36), DY36); c.lineTo(footR36(H + 700), H + 700); c.lineTo(footL36(H + 700), H + 700); c.closePath(); };
const canalX36 = (side, y) => side ? lerp(wcx36(y) + whw36(y), footR36(y), 0.38) : lerp(wcx36(y) - whw36(y), footL36(y), 0.38);
function floor36(c, T, o = {}) { T += 100; const nt = o.night || 0, st = o.storm || 0, aft = o.after || 0;
  const dim = col => mix(mix(col, '#5a5a60', st * 0.45), '#16161e', nt * 0.82);
  c.save(); floorPath36(c); c.clip();
  if (!aft) {
    const g = c.createLinearGradient(0, DY36, 0, H + 300); g.addColorStop(0, dim('#8a9050')); g.addColorStop(1, dim('#4e6a2a')); c.fillStyle = g; c.fillRect(-2600, DY36, 6300, 1800);
    const VPy = 1110, BY = [DY36]; for (let j = 0; j < 11; j++) BY.push(1110 + 90 * Math.pow(1.3, j + 1));
    const PAL = ['#6f8a34', '#7f9a3c', '#8aa040', '#a8a84a', '#5f7a2e', '#9a8a44', '#7a9238'];
    for (let j = 0; j < BY.length - 1; j++) for (let i = -14; i < 14; i++) { const ya = BY[j], yb = BY[j + 1], u0 = i * 0.12, u1 = (i + 1) * 0.12, xa0 = 540 + u0 * (ya - VPy), xa1 = 540 + u1 * (ya - VPy), xb0 = 540 + u0 * (yb - VPy), xb1 = 540 + u1 * (yb - VPy);
      const hsh = Math.abs(Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1; c.fillStyle = dim(PAL[Math.floor(hsh * PAL.length)]);
      c.beginPath(); c.moveTo(xa0, ya); c.lineTo(xa1, ya); c.lineTo(xb1, yb); c.lineTo(xb0, yb); c.closePath(); c.fill();
      if (yb - ya > 50) { c.strokeStyle = hexA(dim('#3a5020'), 0.35); c.lineWidth = 1 + (ya - DY36) * 0.004; c.beginPath(); for (let k = 1; k < 5; k++) { const q = k / 5; c.moveTo(lerp(xa0, xa1, q), ya); c.lineTo(lerp(xb0, xb1, q), yb); } c.stroke(); } }
    c.strokeStyle = hexA(dim('#c8b48a'), 0.5); for (let j = 1; j < BY.length; j++) { c.lineWidth = 1 + (BY[j] - DY36) * 0.008; c.beginPath(); c.moveTo(-2600, BY[j]); c.lineTo(3700, BY[j]); c.stroke(); }
    for (let i = -14; i <= 14; i++) { const u = i * 0.12; c.lineWidth = 1.5; c.beginPath(); c.moveTo(540 + u * (DY36 - VPy), DY36); c.lineTo(540 + u * (H + 600 - VPy), H + 600); c.stroke(); }
    // canals from the two sluices (o.flow = moving glints)
    [0, 1].forEach(side => { const pts = []; for (let y = DY36 + 2; y <= H + 600; y += 14) pts.push([canalX36(side, y), y]);
      const sx = side ? DX1 - 26 : DX0 + 23; pts.unshift([sx, DY36 + 2]);
      c.lineCap = 'round'; for (let k = 1; k < pts.length; k++) { const [x0, y0] = pts[k - 1], [x1, y1] = pts[k], w = 2 + (y1 - DY36) * 0.035; c.strokeStyle = dim('#6a5a3a'); c.lineWidth = w + 3; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
        c.strokeStyle = dim(o.flow ? '#7ab4c8' : '#8a9a88'); c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
      if (o.flow) { c.save(); c.globalCompositeOperation = 'lighter'; for (let k = 0; k < 26; k++) { const q = ((T * 0.18 + k / 26) % 1), idx = Math.floor(Math.pow(q, 1.6) * (pts.length - 1)); const [x, y] = pts[idx]; glow(c, x, y, 6 + (y - DY36) * 0.03, '#e8f8ff', 0.5 * o.flow); } c.restore(); }
      for (let j = 2; j < BY.length - 1; j += 2) { const y = BY[j], xc = canalX36(side, y), xe = side ? wcx36(y) + whw36(y) : wcx36(y) - whw36(y); c.strokeStyle = dim(o.flow ? '#7ab4c8' : '#8a9a88'); c.lineWidth = 1 + (y - DY36) * 0.012; c.beginPath(); c.moveTo(xc, y); c.lineTo(xe, y); c.stroke(); } });
  } else { // after: cracked dry mud, sand drifts, stones
    const g = c.createLinearGradient(0, DY36, 0, H + 300); g.addColorStop(0, dim('#c4a882')); g.addColorStop(1, dim('#8a6c4c')); c.fillStyle = g; c.fillRect(-2600, DY36, 6300, 1800);
    const r = rng(SEED36 + 40); c.lineCap = 'round';
    for (let i = 0; i < 260; i++) { const q = Math.pow(r(), 1.4), yy = DY36 + 8 + q * (H + 300 - DY36), k = 0.1 + q * 1.5; let x = -1400 + r() * 3900, py = yy;
      c.strokeStyle = hexA(dim('#4a3420'), 0.35 + q * 0.2); c.lineWidth = 0.8 + k; c.beginPath(); c.moveTo(x, py); for (let s = 0; s < 4; s++) { x += (r() - 0.3) * 40 * k; py += (r() - 0.5) * 10 * k; c.lineTo(x, py); } c.stroke(); }
    for (let i = 0; i < 22; i++) { const q = r(), yy = DY36 + 20 + q * q * 800, x = -900 + r() * 2900, w = (40 + r() * 120) * (0.2 + q * 1.4); c.fillStyle = hexA(dim('#e8d0a8'), 0.4); c.beginPath(); c.ellipse(x, yy, w, w * 0.12, 0, 0, 6.283); c.fill(); }
    for (let i = 0; i < 70; i++) { const q = Math.pow(r(), 1.5), yy = DY36 + 10 + q * 900, x = -900 + r() * 2900, sz = 2 + q * 12; c.fillStyle = hexA(dim(r() > 0.5 ? '#5a4430' : '#e8d8b8'), 0.6); c.beginPath(); c.ellipse(x, yy, sz, sz * 0.45, 0, 0, 6.283); c.fill(); }
  }
  // the wadi bed (dry while the dam holds)
  c.beginPath(); for (let y = DY36; y <= H + 700; y += 20) c.lineTo(wcx36(y) - whw36(y) * (aft ? 1.4 : 1), y); for (let y = H + 700; y >= DY36; y -= 20) c.lineTo(wcx36(y) + whw36(y) * (aft ? 1.4 : 1), y); c.closePath();
  const wg = c.createLinearGradient(0, DY36, 0, H + 300); wg.addColorStop(0, dim('#d8c09a')); wg.addColorStop(1, dim('#a88a64')); c.fillStyle = wg; c.fill();
  const r2 = rng(SEED36 + 41); for (let i = 0; i < 90; i++) { const q = Math.pow(r2(), 1.4), y = DY36 + 10 + q * 900, x = wcx36(y) + (r2() - 0.5) * 1.8 * whw36(y), sz = 1.5 + q * 9; c.fillStyle = hexA(dim(r2() > 0.5 ? '#6a5440' : '#f4e8d0'), 0.55); c.beginPath(); c.ellipse(x, y, sz, sz * 0.5, 0, 0, 6.283); c.fill(); }
  c.restore();
  // a soft rim where the floor meets the feet of the mountains
  c.strokeStyle = hexA(dim(aft ? '#e8d0a8' : '#c8c088'), 0.35); c.lineWidth = 4; c.beginPath(); c.moveTo(footL36(H + 700), H + 700); c.lineTo(footL36(DY36), DY36); c.lineTo(footR36(DY36), DY36); c.lineTo(footR36(H + 700), H + 700); c.stroke();
}
// the flood (sayl al-'arim, Saba 16): muddy water out of the breach, down the wadi, spreading over the fields. fl 0..1 = front
const floodF36 = fl => DY36 + 6 + fl * 1150;
const floodHW36 = (fl, y) => { const yf = floodF36(fl), base = whw36(y) * 1.5 + 14 + (y - DY36) * 0.3, behind = clamp((yf - y) / 180 + 0.35); return base + clamp(fl * 1.4) * behind * (y - DY36 + 30) * 2.4; };
function flood36(c, T, fl, o = {}) { if (fl <= 0) return; T += 100; const nt = o.night || 0, st = o.storm || 0, yf = floodF36(fl);
  c.save(); floorPath36(c); c.clip();
  const pts = []; for (let y = DY36 - 2; y <= yf; y += 10) pts.push(y);
  const kf = (yf - DY36) / 700, front = x => yf + (Math.sin(x * 0.03 + T * 3) * 6 + Math.sin(x * 0.011 - T * 2) * 9 + noise1(x * 0.02 + T * 0.8, 51) * 16) * (0.3 + kf) - Math.pow(Math.abs(x - wcx36(yf)) / (floodHW36(fl, yf) + 1), 2) * 50 * (0.3 + kf);
  c.beginPath(); pts.forEach((y, i) => { const x = wcx36(y) - floodHW36(fl, y); i ? c.lineTo(x, y) : c.moveTo(x, y); });
  const xl = wcx36(yf) - floodHW36(fl, yf), xr = wcx36(yf) + floodHW36(fl, yf); for (let x = xl; x <= xr; x += 16) c.lineTo(x, front(x));
  for (let i = pts.length - 1; i >= 0; i--) { const y = pts[i]; c.lineTo(wcx36(y) + floodHW36(fl, y), y); } c.closePath();
  const g = c.createLinearGradient(0, DY36, 0, yf); g.addColorStop(0, mix(mix('#d8d0c0', '#9a9890', st * 0.4), '#2a2630', nt * 0.7)); g.addColorStop(0.25, mix(mix('#a8906a', '#7a7468', st * 0.4), '#2a2630', nt * 0.7)); g.addColorStop(1, mix(mix('#8a6c48', '#5a5048', st * 0.4), '#1a1820', nt * 0.7));
  c.fillStyle = g; c.fill(); c.save(); c.clip();
  const r = rng(SEED36 + 50); c.lineCap = 'round';
  for (let i = 0; i < 160; i++) { const u = (r() - 0.5) * 1.9, sp = 0.5 + r() * 0.8, ph = ((T * sp * 0.35 + r()) % 1), y = DY36 + Math.pow(ph, 1.3) * (yf - DY36), x = wcx36(y) + u * floodHW36(fl, y) * 0.92, k = (y - DY36) / 700;
    c.strokeStyle = `rgba(246,240,228,${0.6 * (1 - nt * 0.6)})`; c.lineWidth = 1.5 + k * 5; c.beginPath(); c.moveTo(x - u * 4 * k, y - 10 - 26 * k); c.quadraticCurveTo(x + Math.sin(T * 4 + i) * 6 * k, y - 4, x + u * 6 * k, y + 8 * k); c.stroke(); }
  for (let k = 0; k < 16; k++) { const q = ((k / 16 + T * 0.12) % 1), y = DY36 + Math.pow(q, 1.4) * (yf - DY36), kk = (y - DY36) / 700, hw = floodHW36(fl, y), x0 = wcx36(y) - hw, x1 = wcx36(y) + hw;
    c.strokeStyle = `rgba(40,28,18,${0.13 * (1 - nt * 0.5)})`; c.lineWidth = 2 + kk * 6; c.beginPath(); for (let x = x0; x <= x1; x += 18) { const v = y + (Math.sin(x * 0.02 / (0.3 + kk) + k * 1.7 + T * 2) + noise1(x * 0.01 + k * 3, 60)) * 5 * (0.3 + kk); x === x0 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke();
    c.strokeStyle = `rgba(236,228,210,${0.3 * (1 - nt * 0.5)})`; c.lineWidth = 1 + kk * 3; c.beginPath(); for (let x = x0; x <= x1; x += 18) { const v = y - 3 - kk * 5 + Math.sin(x * 0.02 / (0.3 + kk) + k * 1.7 + T * 2) * 5 * (0.3 + kk); x === x0 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); }
  c.restore();
  c.strokeStyle = `rgba(248,240,226,${0.8 * (1 - nt * 0.5)})`; c.lineWidth = 3 + (yf - DY36) * 0.012; c.beginPath(); for (let x = xl; x <= xr; x += 14) x === xl ? c.moveTo(x, front(x) - 2) : c.lineTo(x, front(x) - 2); c.stroke();
  for (let i = 0; i < 40; i++) { const x = lerp(xl, xr, r()), ph = ((T * 1.4 + r()) % 1), k = (yf - DY36) / 700; c.fillStyle = `rgba(245,240,230,${0.5 * (1 - ph)})`; c.beginPath(); c.arc(x, front(x) - 6 - ph * 30 * (0.4 + k), (3 + ph * 8) * (0.4 + k), 0, 6.283); c.fill(); }
  c.restore();
}
// the trees of the two gardens (lush) or the bitter plants (after); depth sorted. Flooded trees lean and sink into the water.
const GT36 = (() => { const r = rng(SEED36 + 60), L = [];
  for (let k = 0; k < 15; k++) { const y = 1194 + 6 * k + k * k * 1.0, sp = 22 + (y - 1180) * 0.75;
    [0, 1].forEach(side => { const a = side ? wcx36(y) + whw36(y) + sp * 0.5 : footL36(y) + sp * 0.7, b = side ? footR36(y) - sp * 0.7 : wcx36(y) - whw36(y) - sp * 0.5;
      for (let x = a + r() * sp * 0.5; x < b; x += sp * (0.8 + r() * 0.5)) { if (r() > 0.78) continue; if (y > 1320 && Math.abs(x - wcx36(y)) < 330 + (y - 1320) * 2.2) continue; L.push({ x, y: y + (r() - 0.5) * 6, side, kind: r() < 0.42 ? 'P' : 'F', seed: SEED36 + 61 + L.length, ak: r(), on: r() }); } }); }
  return L.sort((p, q) => p.y - q.y); })();
function trees36(c, T, o = {}) { const nt = o.night || 0, fl = o.flood || 0, aft = o.after || 0, yf = floodF36(fl);
  GT36.forEach(p => { if (o.maxY && p.y > o.maxY) return; const h = hY36(p.y);
    if (aft) { if (p.on > 0.62) return; const kind = p.ak < 0.4 ? 'T' : (p.ak < 0.85 ? 'K' : 'S');
      if (kind === 'T') tamarisk36(c, p.x, p.y, h / 300 * 1.25, T, p.seed, { night: nt }); else if (kind === 'K') khamt36(c, p.x, p.y, h / 300 * 1.0, T, p.seed, { night: nt }); else sidr36(c, p.x, p.y, h / 300 * 1.15, T, p.seed, { night: nt }); return; }
    let sink = 0; if (fl > 0 && p.y < yf) { const dx = Math.abs(p.x - wcx36(p.y)), hw = floodHW36(fl, p.y); if (dx < hw) sink = clamp((yf - p.y) / 420) * clamp((hw - dx) / 140); }
    const th = p.kind === 'P' ? h * 1.15 * 1.4 : h * 1.3;
    if (sink >= 0.98) return;
    c.save(); if (sink > 0) { c.beginPath(); c.rect(p.x - 2000, -3000, 4000, p.y + 3000); c.clip(); c.translate(p.x, p.y + sink * th * 0.9); c.rotate((p.x < wcx36(p.y) ? -1 : 1) * sink * 0.45); c.translate(-p.x, -p.y); c.globalAlpha *= 1 - clamp(sink * 1.4 - 0.4); }
    if (p.kind === 'P') palm33(c, p.x, p.y, h / 300 * 1.15, T, p.seed, 0, { night: nt, lush: 0.6 }); else fruitTree36(c, p.x, p.y, h / 300 * 0.9, T, p.seed, { night: nt });
    c.restore();
    if (sink > 0.05 && sink < 0.9) { c.strokeStyle = 'rgba(245,238,224,0.5)'; c.lineWidth = 1 + h * 0.008; c.beginPath(); c.ellipse(p.x, p.y, h * 0.07, h * 0.015, 0, 0, 6.283); c.stroke(); } });
}
// the town of Ma'rib: tower houses on the two foothills (on the slope, above the floor)
function town36(c, T, nt, lamp) { const r = rng(SEED36 + 70), L = [];
  for (let i = 0; i < 9; i++) { const side = i < 6 ? 1 : 0, x = side ? 860 + i * 70 + r() * 30 : 200 - (i - 6) * 80 - r() * 30, yb = side ? DY36 + (x - 790) / 2.4 : DY36 + (290 - x) / 2.4, y = yb - 6 - r() * 10, s = hY36(y) / 300;
    L.push({ x, y, w: (90 + r() * 50) * s * 0.9, h: (150 + r() * 120) * s * 0.9, col: mix('#9a6040', '#c08a5a', r()), sd: SEED36 + 71 + i, lw: r(), lw2: r() }); }
  L.sort((a, b) => a.y - b.y).forEach(p => { towerHouse(c, p.x, p.y, p.w, p.h, mix(p.col, '#22202c', nt * 0.75), p.sd, T);
    if (lamp > 0 && p.lw > 0.3) { c.save(); c.globalCompositeOperation = 'lighter'; const wy = p.y - p.h * (0.35 + 0.4 * p.lw2); glow(c, p.x + p.w * 0.1, wy, p.w * 0.4, '#ffc070', 0.55 * lamp); c.restore(); } });
}
// the whole valley. o: z cx cy shake sky to k sunA sunX sunY storm night stars moon lightning lgX rain flow crack breach flood after ruins town lamp light lightX lightW walkers props post fg
function marib36(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 10) : [0, 0]));
  const nt = o.night || 0, st = o.storm || 0, hz = mix(mix(o.haze || '#f0c8a8', '#6a6a78', st * 0.7), '#22243c', nt * 0.6);
  sky0(c, skyStops(o.sky || 'gold', o.to, o.k || 0));
  if (st > 0) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(22,22,34,${0.6 * st})`); g.addColorStop(0.55, `rgba(40,40,52,${0.35 * st})`); g.addColorStop(1, 'rgba(30,30,40,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }
  if (o.stars) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); stars(c, T, 160, SEED36 + 3, [0, 0, W, 1000], o.stars); c.restore(); }
  if (o.moon) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); moon(c, o.moonX || 820, o.moonY || 400, 42, o.moon); c.restore(); }
  if (o.sunA) bigSun30(c, o.sunX === undefined ? 250 : o.sunX, o.sunY === undefined ? 980 : o.sunY, 46, o.sunCol || '#ffd08a', o.sunA);
  cloudBank(c, T, 280, 6, mix('#ffe6cc', '#22243c', nt), 0.12 * (1 - nt * 0.7) * (1 - st), SEED36 + 4, 6);
  if (st > 0) stormSky(c, T, st);
  if (o.lightning) lightning(c, o.lgX || 780, 260, 860, o.lightning, SEED36 + 9);
  const px = o.px || 0;
  par(c, -0.85, px, 0, () => { ridgeW(c, 1040, 200, 0.0021, SEED36 + 1, mix(mix('#8a7a9a', '#4a4a5a', st * 0.6), '#141628', nt)); hazeW(c, 1075, 220, hz, 0.5 * (1 - nt * 0.6)); });
  lake36(c, T, nt, st, o);
  mtn36(c, T, nt, st);

  floor36(c, T, o);
  flood36(c, T, o.flood || 0, o);
  dam36(c, T, o);
  trees36(c, T, o);
  if (o.town !== false) town36(c, T, nt, o.lamp || 0);
  if (o.props) o.props(c);
  if (o.light) lightFromAbove(c, T, o.lightX || 540, o.light, o.lightW || 380);
  if (o.walkers) o.walkers(c);
  if (o.post) o.post(c);
  if (o.rain) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); rainVeil(c, T + 100, -100, W + 100, -60, H, 0.22 * o.rain); rainVeil(c, T * 1.3 + 50, -100, W + 100, -60, H, 0.15 * o.rain); c.restore(); }
  if ((nt || st) && o.vignette !== false) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const v = c.createRadialGradient(W / 2, H * 0.55, H * 0.2, W / 2, H * 0.55, H * 0.75); v.addColorStop(0, 'rgba(4,4,12,0)'); v.addColorStop(1, `rgba(4,4,12,${0.5 * Math.max(nt, st * 0.8)})`); c.fillStyle = v; c.fillRect(0, 0, W, H); c.restore(); }
  if (o.tint) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = o.tint; c.fillRect(0, 0, W, H); c.restore(); }
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// highlight of one garden (« one on the right, one on the left »): a warm glow over the trees of one side
function sideGlow36(c, side, k) { if (k <= 0) return; c.save(); floorPath36(c); c.clip(); c.globalCompositeOperation = 'lighter';
  c.beginPath(); for (let y = DY36; y <= H + 700; y += 20) c.lineTo(side ? wcx36(y) + whw36(y) : wcx36(y) - whw36(y), y); c.lineTo(side ? 3700 : -2600, H + 700); c.lineTo(side ? 3700 : -2600, DY36 - 400); c.lineTo(540, DY36 - 400); c.closePath();
  const g = c.createLinearGradient(0, DY36 - 300, 0, 1700); g.addColorStop(0, 'rgba(255,230,160,0)'); g.addColorStop(0.5, `rgba(255,226,150,${0.42 * k})`); g.addColorStop(1, 'rgba(255,226,150,0)'); c.fillStyle = g; c.fill(); c.restore(); }

// ---------- inside a garden: eye level among fruit trees and palms, a path with a rill, light through the leaves
const ORCH36 = (() => { const L = [], r = rng(SEED36 + 80);
  for (let k = 0; k < 9; k++) { const d = 1 + k * 0.75; [-1, 1].forEach(sd => { L.push({ d, X: sd * (1.25 + r() * 0.2), kind: (k + (sd > 0 ? 1 : 0)) % 3 === 0 ? 'P' : 'F', seed: SEED36 + 81 + L.length });
    L.push({ d: d + 0.37, X: sd * (2.5 + r() * 0.4), kind: r() < 0.4 ? 'P' : 'F', seed: SEED36 + 120 + L.length }); }); }
  return L.sort((a, b) => b.d - a.d); })();
const oY36 = d => 1170 + 760 / d, oX36 = (X, d) => 540 + X * 560 / d, oH36 = y => Math.max(40, (y - 1170) * 0.62);
function orchard36(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 8) : [0, 0]));
  const dawn = o.dawn || 0, dim = col => mix(col, '#1a1a24', o.dim || 0);
  sky0(c, skyStops(dawn ? 'dawn' : 'day', 'gold', dawn ? 0.3 : 0.35));
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, 1080, 600, '#fff0c8', 0.25); c.restore();
  par(c, -0.8, 0, 0, () => { ridgeW(c, 1090, 120, 0.0026, SEED36 + 85, mix('#a89a8a', '#e8d8c0', 0.4)); hazeW(c, 1130, 200, '#fff0d8', 0.6); });
  // far garden wall of green
  c.fillStyle = dim('#5a7a3a'); c.beginPath(); c.moveTo(-1600, 1200); for (let x = -1600; x <= 2700; x += 30) c.lineTo(x, 1150 - Math.abs(Math.sin(x * 0.013)) * 40 - Math.abs(Math.sin(x * 0.031)) * 20); c.lineTo(2700, 1200); c.closePath(); c.fill();
  hazeW(c, 1200, 120, '#f8f0d8', 0.45);
  const g = c.createLinearGradient(0, 1180, 0, H + 200); g.addColorStop(0, dim('#8aa04a')); g.addColorStop(1, dim('#4a6a26')); c.fillStyle = g; c.fillRect(-1600, 1180, 4300, 1500);
  // the path and its rill
  c.fillStyle = dim('#c8b48a'); c.beginPath(); c.moveTo(530, 1182); c.lineTo(550, 1182); c.lineTo(540 + 300, H + 300); c.lineTo(540 - 300, H + 300); c.closePath(); c.fill();
  c.strokeStyle = dim('#7ab4c8'); c.lineWidth = 2; c.beginPath(); c.moveTo(552, 1184); c.lineTo(540 + 330, H + 300); c.stroke();
  c.save(); c.globalCompositeOperation = 'lighter'; for (let k = 0; k < 14; k++) { const q = ((T * 0.1 + k / 14) % 1), y = 1184 + Math.pow(q, 2) * 900, x = 552 + (y - 1184) * 0.36; glow(c, x, y, 3 + q * 10, '#e8f8ff', 0.5); } c.restore();
  const r = rng(SEED36 + 86); for (let i = 0; i < 160; i++) { const q = Math.pow(r(), 1.6), y = 1190 + q * 800, x = -800 + r() * 2700; if (Math.abs(x - 540) < (y - 1170) * 0.4) continue; const hh = 3 + q * 18; c.strokeStyle = dim(r() > 0.5 ? '#6a8a34' : '#a8c060'); c.lineWidth = 1 + q * 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * hh * 0.6, y - hh); c.stroke(); }
  // trees: back to front; walkers drawn at their depth (o.walkersAt = y below which they are drawn)
  let walkDone = false;
  ORCH36.forEach(p => { const y = oY36(p.d), x = oX36(p.X, p.d), s = 1.6 / p.d;
    if (!walkDone && o.walkers && y > (o.walkY || 1700)) { o.walkers(c); walkDone = true; }
    if (p.kind === 'P') palm33(c, x, y, s * 1.9, T, p.seed, 0, { lush: 0.8 }); else fruitTree36(c, x, y, s, T, p.seed, { fruit: o.fruit === undefined ? 1 : o.fruit }); });
  if (o.props) o.props(c);
  if (!walkDone && o.walkers) o.walkers(c);
  if (o.canopy) canopy36(c, T, o.canopy);
  // dappled light
  c.save(); c.globalCompositeOperation = 'lighter'; rays(c, 760, 300, Math.PI / 2 + 0.25, 0.7, 1700, 7, '#fff6d8', 0.06 + 0.06 * dawn, T, SEED36 + 87); c.restore();
  if (o.light) lightFromAbove(c, T, o.lightX || 540, o.light, o.lightW || 300);
  if (o.post) o.post(c);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// the woman with the basket on her head (Qatada, quoted by the exegetes): fill 0..1; fruits falling into it
function basketWoman36(c, T, o, fill = 0) { fig(c, WOMAN36, o); const [hx, hy, hr] = headOf(o), s = o.h / 300, w = o.walk === null || o.walk === undefined ? 0 : Math.abs(Math.sin(o.walk * Math.PI * 2)) * 4 * s;
  c.fillStyle = '#c8b090'; c.beginPath(); c.ellipse(hx, hy - hr * 0.95 - w, hr * 0.9, hr * 0.28, 0, 0, 6.283); c.fill(); // cloth ring
  headBasket36(c, hx, hy - hr * 1.0 - w, s, fill); }
function headBasket36(c, x, y, s, fill) { c.save(); c.translate(x, y); c.scale(s, s); const col = '#c09a5e', dk = mix(col, '#2a1408', 0.45), lt = mix(col, '#fff0c8', 0.3);
  const rr = rng(SEED36 + 160), n = Math.round(fill * 22); for (let j = 0; j < 22; j++) { const fx = (rr() - 0.5) * 62, fy = -30 - rr() * 12 - (1 - Math.abs(fx) / 31) * 10 * fill, cl = ['#e2862a', '#c8402a', '#e8a832'][j % 3]; if (j >= n) continue;
    c.fillStyle = mix(cl, '#000000', 0.25); c.beginPath(); c.arc(fx + 1, fy + 1, 7, 0, 6.283); c.fill(); c.fillStyle = cl; c.beginPath(); c.arc(fx, fy, 6.5, 0, 6.283); c.fill(); }
  const g = c.createLinearGradient(-44, 0, 44, 0); g.addColorStop(0, dk); g.addColorStop(0.45, col); g.addColorStop(1, mix(col, '#2a1408', 0.3));
  c.fillStyle = g; c.beginPath(); c.moveTo(-30, 0); c.lineTo(-44, -30); c.quadraticCurveTo(0, -24, 44, -30); c.lineTo(30, 0); c.quadraticCurveTo(0, 6, -30, 0); c.fill();
  c.strokeStyle = hexA(dk, 0.7); c.lineWidth = 1.6; for (let k = 1; k < 4; k++) { const yy = -k * 7.5, w2 = lerp(30, 44, k / 4); c.beginPath(); c.moveTo(-w2, yy); c.quadraticCurveTo(0, yy + 5, w2, yy); c.stroke(); }
  c.strokeStyle = lt; c.lineWidth = 3; c.beginPath(); c.moveTo(-44, -30); c.quadraticCurveTo(0, -24, 44, -30); c.stroke(); c.restore(); }
// a canopy of fruit trees overhanging the path (top of the frame): y = lower edge of the leaves
function canopy36(c, T, y) { T += 100; const r = rng(SEED36 + 175), sw = Math.sin(T * 0.6) * 6;
  for (let pass = 0; pass < 3; pass++) for (let i = 0; i < 16; i++) { const x = -300 + i * 110 + r() * 60 + sw, yy = y - 40 - r() * 260, R = 80 + r() * 70;
    c.fillStyle = ['#2a4a1e', '#3f6a2a', '#5a8a36'][pass]; c.beginPath(); c.arc(x - pass * 10, yy - pass * 14, R * (1 - pass * 0.25), 0, 6.283); c.fill(); }
  for (let i = 0; i < 30; i++) { const x = -250 + r() * 1600 + sw, yy = y - 20 - r() * 120, cl = ['#e2862a', '#c8402a', '#e8a832'][i % 3]; c.fillStyle = mix(cl, '#000000', 0.25); c.beginPath(); c.arc(x + 1.5, yy + 1.5, 10, 0, 6.283); c.fill(); c.fillStyle = cl; c.beginPath(); c.arc(x, yy, 9, 0, 6.283); c.fill(); } }
function fallingFruit36(c, x, y, s, q, col = '#e2862a', y0 = null) { if (q <= 0 || q >= 1) return; const yy = y0 === null ? y - (1 - q * q) * 320 * s : lerp(y0, y, q * q); c.fillStyle = mix(col, '#000000', 0.25); c.beginPath(); c.arc(x + 1, yy + 1, 8 * s, 0, 6.283); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(x, yy, 7.5 * s, 0, 6.283); c.fill(); }

// ---------- the dam up close (its foot): huge dressed blocks, the wet foot, small holes (according to some reports: gnawed by rats),
// trickles that become jets; o.crack 0..1, o.leak 0..1, o.burst = everything gives way (spray + white)
function damClose36(c, T, o = {}) { T += 100;
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 10) : [0, 0]));
  const st = o.storm === undefined ? 0.6 : o.storm, stone = mix('#b89a74', '#6a6460', st * 0.5), dk = mix(stone, '#1a0e08', 0.5), lt = mix(stone, '#fff0d8', 0.25);
  sky0(c, skyStops('grey', 'night', 0.4)); stormSky(c, T, st);
  // the wall: big blocks in perspective (the wall rises out of frame)
  const base = 1560;
  c.fillStyle = stone; c.fillRect(-900, -900, W + 1800, base + 900);
  const r = rng(SEED36 + 90);
  for (let row = 0; row < 16; row++) { const y1 = base - row * 120, y0 = y1 - 120, off = (row % 2) * 110;
    for (let x = -900 + off; x < W + 900; x += 220) { const sh = r(); c.fillStyle = mix(stone, sh > 0.5 ? '#fff0d8' : '#1a0e08', 0.12 * Math.abs(sh - 0.5) * 2); c.fillRect(x + 4, y0 + 4, 212, 112);
      c.fillStyle = hexA(lt, 0.35); c.fillRect(x + 4, y0 + 4, 212, 6); c.fillStyle = hexA(dk, 0.35); c.fillRect(x + 4, y1 - 10, 212, 6);
      for (let k = 0; k < 6; k++) { c.fillStyle = hexA(r() > 0.5 ? dk : lt, 0.18); c.beginPath(); c.arc(x + 20 + r() * 180, y0 + 16 + r() * 90, 2 + r() * 4, 0, 6.283); c.fill(); } }
    c.fillStyle = hexA(dk, 0.7); c.fillRect(-900, y1 - 4, W + 1800, 4); }
  for (let row = 0; row < 16; row++) { const y1 = base - row * 120, off = (row % 2) * 110; c.fillStyle = hexA(dk, 0.7); for (let x = -900 + off; x < W + 900; x += 220) c.fillRect(x, y1 - 120, 4, 120); }
  const wg = c.createLinearGradient(0, base - 260, 0, base); wg.addColorStop(0, hexA('#2a3a2a', 0)); wg.addColorStop(1, hexA('#2a3a2a', 0.45)); c.fillStyle = wg; c.fillRect(-900, base - 260, W + 1800, 260); // wet foot, algae
  // the ground at the foot
  const gg = c.createLinearGradient(0, base, 0, H + 200); gg.addColorStop(0, '#6a5a44'); gg.addColorStop(1, '#3a3024'); c.fillStyle = gg; c.fillRect(-900, base, W + 1800, H + 600);
  for (let i = 0; i < 60; i++) { const q = Math.pow(r(), 1.3), y = base + 10 + q * 500, x = -300 + r() * 1700, sz = 3 + q * 16; c.fillStyle = hexA(r() > 0.5 ? '#2a2018' : '#a89070', 0.5); c.beginPath(); c.ellipse(x, y, sz, sz * 0.45, 0, 0, 6.283); c.fill(); }
  // holes at the foot of the wall (according to some reports, gnawed by rats) + trickles
  const HOLES = [[300, base - 40, 16], [470, base - 70, 12], [610, base - 30, 18], [780, base - 60, 13], [190, base - 80, 10], [880, base - 35, 11]];
  const nh = Math.round((o.holes === undefined ? 1 : o.holes) * HOLES.length);
  HOLES.slice(0, nh).forEach(([x, y, rr], i) => { c.fillStyle = '#120a06'; c.beginPath(); c.ellipse(x, y, rr * 1.3, rr, 0, 0, 6.283); c.fill(); c.strokeStyle = hexA(dk, 0.9); c.lineWidth = 3; c.stroke();
    c.fillStyle = hexA('#d8c8a8', 0.6); for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(x + (r() - 0.5) * rr * 3, base + 6 + r() * 10, 1.6 + r() * 2, 0, 6.283); c.fill(); } // gnawed grit
    const lk = o.leak || 0; if (lk > 0) { const jl = lk * (30 + i * 6); c.strokeStyle = `rgba(200,224,236,${0.75})`; c.lineWidth = 3 + lk * 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + jl * 0.5, y, x + jl * 0.7, base + 4); c.stroke();
      c.fillStyle = 'rgba(220,236,244,0.5)'; for (let k = 0; k < 4; k++) { const ph = ((T * 2 + k / 4 + i * 0.3) % 1); c.beginPath(); c.arc(x + jl * 0.7 + (k - 1.5) * 6, base + 4 - ph * 14, 2 + lk * 3 * (1 - ph), 0, 6.283); c.fill(); }
      c.fillStyle = `rgba(160,190,200,${0.35 * lk})`; c.beginPath(); c.ellipse(x + jl * 0.7, base + 12, 30 + lk * 60, 8 + lk * 10, 0, 0, 6.283); c.fill(); } });
  if (o.crack) { c.save(); c.strokeStyle = `rgba(20,12,8,${0.85 * clamp(o.crack * 2)})`; c.lineCap = 'round'; c.lineJoin = 'round'; const rc = rng(SEED36 + 91);
    [[470, base - 70], [610, base - 30], [300, base - 40]].forEach(([x0, y0]) => { for (let b = 0; b < 3; b++) { let px = x0, py = y0; const n = Math.floor(1 + o.crack * 5); for (let j = 0; j < n; j++) { const nx = px + (rc() - 0.5) * 34, ny = py - 8 - rc() * 18; c.lineWidth = 3 - j * 0.35; c.beginPath(); c.moveTo(px, py); c.lineTo(nx, ny); c.stroke(); px = nx; py = ny; } } }); c.restore(); }
  if (o.burst) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, base - 200, 300 + 700 * o.burst, '#e8f0f4', 0.6 * o.burst); c.restore(); }
  blurLayer(c, 8, bc => { boulder(bc, -40, 2060, 340, 160, '#4a3e30', SEED36 + 92); boulder(bc, 1120, 2080, 300, 140, '#4a3e30', SEED36 + 93); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- the map: Arabia, Saba (Ma'rib) in the south, the blessed lands (ash-Sham) in the north, the « visible towns » on the route.
// o.towns 0..1 = how many appear, o.gaps 0..1 = every other town fades (the distances grow), o.disperse 0..1 = the tribes scatter, o.medina = highlight
const MAPR36 = [[810, 1690], [745, 1520], [690, 1350], [640, 1180], [595, 1010], [560, 880], [530, 760], [500, 650]];
const MAPD36 = [[[810, 1690], [690, 1300], [595, 1000]], [[810, 1690], [600, 1100], [500, 640]], [[810, 1690], [900, 1150], [900, 720]], [[810, 1690], [960, 1640], [1020, 1560]], [[810, 1690], [740, 1450], [640, 1190]]];
function routePt36(q) { const n = MAPR36.length - 1, f = clamp(q) * n, i = Math.min(n - 1, Math.floor(f)), k = f - i; return [lerp(MAPR36[i][0], MAPR36[i + 1][0], k), lerp(MAPR36[i][1], MAPR36[i + 1][1], k)]; }
function map36(c, T, o = {}) { T += 100;
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1100);
  const g = c.createLinearGradient(0, -400, 0, 2400); g.addColorStop(0, '#e8d4ac'); g.addColorStop(1, '#c8a878'); c.fillStyle = g; c.fillRect(-900, -900, W + 1800, H + 1800);
  const r = rng(SEED36 + 100); for (let i = 0; i < 120; i++) { c.fillStyle = hexA(r() > 0.5 ? '#a8885a' : '#fff4dc', 0.12); c.beginPath(); c.ellipse(-200 + r() * 1500, -100 + r() * 2000, 20 + r() * 80, 10 + r() * 40, r() * 3, 0, 6.283); c.fill(); }
  const sea = '#7a9aa0', seaD = '#5a7c84';
  const poly = (P) => { c.beginPath(); P.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); };
  c.fillStyle = sea; c.strokeStyle = seaD; c.lineWidth = 4;
  poly([[-400, 420], [250, 450], [320, 560], [250, 640], [-400, 660]]); c.fill(); c.stroke(); // Mediterranean
  poly([[330, 640], [372, 660], [440, 840], [520, 1060], [600, 1270], [680, 1480], [760, 1700], [800, 1790], [740, 1830], [690, 1740], [610, 1520], [530, 1310], [450, 1100], [380, 880], [320, 700]]); c.fill(); c.stroke(); // Red Sea
  poly([[740, 1830], [800, 1790], [900, 1830], [1010, 1800], [1100, 1760], [1500, 1700], [1500, 2600], [500, 2600], [600, 1930]]); c.fill(); c.stroke(); // Gulf of Aden, Arabian Sea
  poly([[880, 760], [940, 800], [990, 900], [1050, 990], [1120, 1040], [1500, 1060], [1500, 600], [900, 640]]); c.fill(); c.stroke(); // the Gulf
  c.strokeStyle = hexA('#fff4dc', 0.35); c.lineWidth = 2; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(700 + k * 30, 1940 + k * 50); c.quadraticCurveTo(950, 1890 + k * 50, 1300, 1920 + k * 50); c.stroke(); }
  c.fillStyle = hexA('#8a6a44', 0.25); for (let i = 0; i < 46; i++) { const x = 430 + r() * 560, y = 760 + r() * 900; if (x < 380 + (y - 640) * 0.36) continue; c.beginPath(); c.moveTo(x - 10, y); c.lineTo(x, y - 12); c.lineTo(x + 10, y); c.closePath(); c.fill(); } // hills
  const lab = (t, x, y, a = 1, sz = 34, col = '#4a3018') => { if (a > 0) textGlow(c, t, x, y, `600 ${sz}px Lora`, col, a, '#fff4dc', 6); };
  lab('ASH-CHAM', 520, 610, 1, 36); lab('MER ROUGE', 470, 1250, 0.6, 26, '#2a4a54'); lab('SABA', 900, 1660, 1, 42, '#7a2a14'); lab("Ma'rib", 900, 1712, 0.9, 28);
  // the route and its towns
  const tw = o.towns || 0; if (tw > 0) { c.save(); c.setLineDash([14, 12]); c.strokeStyle = hexA('#7a4a20', 0.6 * Math.min(1, tw * 2)); c.lineWidth = 4; c.beginPath(); MAPR36.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); c.restore();
    const N = 12; for (let i = 1; i < N; i++) { const q = i / N, a = clamp((tw - q * 0.85) * 6) * (o.gaps && i % 2 ? 1 - o.gaps : 1); if (a <= 0) continue; const [x, y] = routePt36(q);
      c.save(); c.globalAlpha = a; c.globalCompositeOperation = 'source-over'; c.fillStyle = '#fff4dc'; c.beginPath(); c.arc(x, y, 13, 0, 6.283); c.fill(); c.fillStyle = '#a8401c'; c.beginPath(); c.arc(x, y, 9, 0, 6.283); c.fill();
      if (o.night) { c.globalCompositeOperation = 'lighter'; glow(c, x, y, 40, '#ffc070', 0.5); } c.restore(); } }
  c.fillStyle = '#7a2a14'; c.beginPath(); c.arc(810, 1690, 16, 0, 6.283); c.fill(); c.fillStyle = '#f6c453'; c.beginPath(); c.arc(810, 1690, 8, 0, 6.283); c.fill();
  // the dispersal: dashed lines from Ma'rib, little groups travelling along them
  const dp = o.disperse || 0; if (dp > 0) MAPD36.forEach((P, i) => { const k = clamp(dp * 1.3 - i * 0.07); if (k <= 0) return;
    const pt = q => { const a = (1 - q) * (1 - q), b = 2 * (1 - q) * q, cc = q * q; return [a * P[0][0] + b * P[1][0] + cc * P[2][0], a * P[0][1] + b * P[1][1] + cc * P[2][1]]; };
    c.strokeStyle = 'rgba(122,42,20,0.8)'; c.lineWidth = 5; c.setLineDash([16, 10]); c.beginPath(); for (let q = 0; q <= k; q += 0.02) { const [x, y] = pt(q); q ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.setLineDash([]);
    const [ex, ey] = pt(k), [bx, by] = pt(Math.max(0, k - 0.04)), ang = Math.atan2(ey - by, ex - bx); c.fillStyle = '#7a2a14'; c.beginPath(); c.moveTo(ex + Math.cos(ang) * 18, ey + Math.sin(ang) * 18); c.lineTo(ex + Math.cos(ang + 2.5) * 16, ey + Math.sin(ang + 2.5) * 16); c.lineTo(ex + Math.cos(ang - 2.5) * 16, ey + Math.sin(ang - 2.5) * 16); c.closePath(); c.fill(); });
  if (o.medina) { const a = o.medina; c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 595, 1000, 120, '#ffd070', 0.5 * a); c.restore(); c.fillStyle = hexA('#2a4a24', a); c.beginPath(); c.arc(595, 1000, 14, 0, 6.283); c.fill(); lab('MÉDINE', 750, 1010, a, 38, '#2a4a24'); }
  // vignette
  c.setTransform(1, 0, 0, 1, 0, 0); const v = c.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); v.addColorStop(0, 'rgba(60,40,20,0)'); v.addColorStop(1, 'rgba(60,40,20,0.45)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
}

// ---------- the caravan road to ash-Sham: a desert plain, the « visible towns » on low hills at regular intervals, a caravan on the road.
// o.night = lanterns, lit windows, stars; o.dist = distance walked (steps driven by it)
const rY36 = 1640; // ground line of the caravan
function hillTown36(c, x, y, s, T, nt, lamp, seed) { const r = rng(seed); c.fillStyle = mix('#b8946a', '#24222e', nt * 0.8); c.beginPath(); c.moveTo(x - 260 * s, y); c.quadraticCurveTo(x, y - 110 * s, x + 260 * s, y); c.closePath(); c.fill();
  for (let i = 0; i < 6; i++) { const hx = x + (i - 2.5) * 52 * s + (r() - 0.5) * 20 * s, hy = y - 70 * s * (1 - Math.pow((hx - x) / (260 * s), 2)) + 4 * s, w = (40 + r() * 20) * s, h = (60 + r() * 60) * s, lw = r();
    towerHouse(c, hx, hy, w, h, mix(mix('#9a6040', '#c08a5a', r()), '#22202c', nt * 0.75), seed + i, T);
    if (lamp > 0 && lw > 0.3) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, hx, hy - h * 0.5, w * 0.8, '#ffc070', 0.6 * lamp); c.restore(); } } }
function route36(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 8) : [0, 0]));
  const nt = o.night || 0, px = o.px || 0;
  sky0(c, skyStops(nt ? 'night' : (o.sky || 'day'), nt ? null : 'gold', nt ? 0 : 0.35));
  if (nt) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); stars(c, T, 200, SEED36 + 110, [0, 0, W, 1100], 0.9); moon(c, 820, 380, 40, 0.7); c.restore(); }
  else bigSun30(c, 260, 820, 46, '#ffd08a', 0.6);
  par(c, -0.85, px, 0, () => { ridgeW(c, 1180, 120, 0.0024, SEED36 + 111, mix('#a8909a', '#161828', nt)); hazeW(c, 1220, 200, mix('#f0d8c0', '#22243c', nt), 0.5); });
  par(c, -0.6, px, 0, () => { const g = c.createLinearGradient(0, 1230, 0, 1700); g.addColorStop(0, mix('#d8b888', '#2a2834', nt * 0.85)); g.addColorStop(1, mix('#c09a6a', '#24222c', nt * 0.85)); c.fillStyle = g; c.fillRect(-2600, 1235, 6300, 1400);
    [[-700, 1290, 0.45], [120, 1262, 0.32], [760, 1250, 0.24], [1350, 1245, 0.19], [1900, 1242, 0.15]].forEach(([x, y, s], i) => hillTown36(c, x, y, s, T, nt, nt ? 1 : 0, SEED36 + 112 + i * 10)); });
  par(c, -0.25, px, 0, () => { // the road: a pale beaten track narrowing toward the towns
    const P = q => { const a = [-1400, 1700], b = [200, 1420], cc = [700, 1300], d = [1500, 1256]; const u = 1 - q; return [u * u * u * a[0] + 3 * u * u * q * b[0] + 3 * u * q * q * cc[0] + q * q * q * d[0], u * u * u * a[1] + 3 * u * u * q * b[1] + 3 * u * q * q * cc[1] + q * q * q * d[1]]; };
    c.fillStyle = hexA(mix('#e8d0a8', '#3a3644', nt * 0.85), 0.55); c.beginPath(); for (let q = 0; q <= 1.001; q += 0.02) { const [x, y] = P(q), w = lerp(70, 3, q); q ? c.lineTo(x, y - w) : c.moveTo(x, y - w); } for (let q = 1; q >= -0.001; q -= 0.02) { const [x, y] = P(q), w = lerp(70, 3, q); c.lineTo(x, y + w); } c.closePath(); c.fill();
    c.strokeStyle = hexA(mix('#8a6a48', '#14121a', nt * 0.85), 0.25); c.lineWidth = 2; [-0.4, 0.4].forEach(k => { c.beginPath(); for (let q = 0; q <= 1.001; q += 0.02) { const [x, y] = P(q), w = lerp(70, 3, q) * k; q ? c.lineTo(x, y + w) : c.moveTo(x, y + w); } c.stroke(); }); });
  par(c, 0, px, 0, () => { const g = c.createLinearGradient(0, 1580, 0, H + 200); g.addColorStop(0, mix('#cfae80', '#2a2834', nt * 0.85)); g.addColorStop(1, mix('#9a7650', '#1a1820', nt * 0.85)); c.fillStyle = g;
    c.beginPath(); c.moveTo(-2600, H + 600); for (let x = -2600; x <= 3700; x += 20) c.lineTo(x, rY36 - 30 + Math.sin(x * 0.003) * 12); c.lineTo(3700, H + 600); c.closePath(); c.fill();
    const r = rng(SEED36 + 120); for (let i = 0; i < 80; i++) { const q = Math.pow(r(), 1.4), y = rY36 - 20 + q * 500, x = -1500 + r() * 4200, sz = 2 + q * 12; c.fillStyle = hexA(mix(r() > 0.5 ? '#6a5038' : '#f4e2c0', '#1a1820', nt * 0.7), 0.55); c.beginPath(); c.ellipse(x, y, sz, sz * 0.45, 0, 0, 6.283); c.fill(); }
    for (let i = 0; i < 9; i++) shrub(c, -1200 + i * 520 + (i % 3) * 60, rY36 + 10 + (i % 2) * 160, 0.7 + (i % 3) * 0.3, mix('#7a7a3a', '#141818', nt * 0.8), T, SEED36 + 121 + i);
    if (o.walkers) o.walkers(c); });
  if (o.post) o.post(c);
  if (nt) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const v = c.createRadialGradient(W / 2, H * 0.58, H * 0.2, W / 2, H * 0.55, H * 0.75); v.addColorStop(0, 'rgba(4,4,12,0)'); v.addColorStop(1, 'rgba(4,4,12,0.5)'); c.fillStyle = v; c.fillRect(0, 0, W, H); c.restore(); }
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// a caravan on the ground line y (camels + men; steps driven by the distance); list = [['C'|index, dx], ...]; o.lantern = index of the man holding a lantern
function caravan36(c, T, dist, list, o = {}) { const dir = o.dir || 1, x0 = o.x0 || 0, h = o.h || 300, gy = o.gy || (() => rY36), nt = o.night || 0;
  list.forEach(([wi, dx], i) => { const d = dist + dx, x = x0 + d * dir, y = gy(x);
    if (wi === 'C') { const s = h / 300 * 0.92; camel(c, x, y, s, mix(mix('#b0845a', '#000000', (i % 3) * 0.07), '#1a1820', nt * 0.6), o.still ? T * 0.2 : camelT(Math.abs(d), s) + i * 0.6, dir, i % 2 ? '#7a3a2a' : '#3a4a6a', { walk: !o.still, head: 0 }); return; }
    fig(c, (o.who || SABA36)[wi % (o.who || SABA36).length], { x, y, h, dir, t: T + i, light: o.light || (nt ? 0.75 : 1), wind: 0.4, walk: o.still ? null : stepOf(Math.abs(d), h) + i * 0.31, ink: 0.7, lantern: o.lantern === i, staff: wi % 3 === 1 && o.lantern !== i }); });
}

// ---------- a rooftop terrace of a tower house above the valley (the rich men at their feast); background = the valley seen from above
function terrace36(c, T, o = {}) {
  marib36(c, T, Object.assign({}, o.land || GOLD36, { z: 0.82, cx: 540, cy: 1250, town: false }));
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150);
  const fy = 1640, wallTop = 1480, plaster = mix('#e0cfae', '#2a2834', o.dim || 0), dk = mix(plaster, '#2a1a10', 0.35);
  // parapet with the white gypsum zigzag frieze of Yemeni houses
  c.fillStyle = mix('#a8704a', '#2a2834', o.dim || 0); c.fillRect(-900, wallTop, W + 1800, fy - wallTop);
  c.fillStyle = '#f4efe2'; c.fillRect(-900, wallTop, W + 1800, 10); c.fillRect(-900, wallTop + 60, W + 1800, 8);
  c.strokeStyle = '#f4efe2'; c.lineWidth = 5; c.beginPath(); for (let x = -900; x < W + 900; x += 40) { c.moveTo(x, wallTop + 54); c.lineTo(x + 20, wallTop + 18); c.lineTo(x + 40, wallTop + 54); } c.stroke();
  for (let x = -900; x < W + 900; x += 80) { c.fillStyle = '#f4efe2'; c.beginPath(); c.moveTo(x + 10, wallTop); c.lineTo(x + 40, wallTop - 34); c.lineTo(x + 70, wallTop); c.closePath(); c.fill(); }
  // roof floor
  const g = c.createLinearGradient(0, fy - 20, 0, H + 200); g.addColorStop(0, plaster); g.addColorStop(1, mix(plaster, '#5a4a38', 0.5)); c.fillStyle = g; c.fillRect(-900, fy - 30, W + 1800, H + 600);
  c.fillStyle = hexA(dk, 0.4); c.fillRect(-900, fy - 30, W + 1800, 8);
  if (o.walkers) o.walkers(c);
  if (o.light) lightFromAbove(c, T, o.lightX || 540, o.light, o.lightW || 300);
  if (o.post) o.post(c);
  if (o.dim) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(14,10,20,${0.35 * o.dim})`; c.fillRect(0, 0, W, H); c.restore(); }
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- the storytellers at night (« We made them tales », Saba 19): a camp, a fire, people sitting around an old man
function campfire36(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150);
  sky0(c, skyStops('night')); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); stars(c, T, 220, SEED36 + 130, [0, 0, W, 1200], 0.9); moon(c, 820, 360, 40, 0.7); c.restore();
  par(c, -0.8, 0, 0, () => { ridgeW(c, 1250, 140, 0.0024, SEED36 + 131, '#161828'); hazeW(c, 1290, 200, '#22243c', 0.4); });
  const g = c.createLinearGradient(0, 1300, 0, H + 200); g.addColorStop(0, '#2a2834'); g.addColorStop(1, '#14121a'); c.fillStyle = g; c.fillRect(-1600, 1300, 4300, 1500);
  [[150, 1430, 0.9, '#3a2e2a'], [880, 1420, 0.85, '#2e2a30'], [-180, 1470, 1.0, '#342a28']].forEach(([x, y, s, col], i) => bedTent(c, x, y, s, col, SEED36 + 132 + i, { lamp: 0.6 }));
  camel(c, 1050, 1500, 0.55, '#3a2e26', T * 0.2, -1, null, { walk: false, head: 0.2 });
  const fx = 540, fyy = 1700;
  c.save(); c.globalCompositeOperation = 'lighter'; glow(c, fx, fyy - 60, 700, '#ff8a3a', 0.28); c.restore();
  const ring = [[300, 1650, 1, 0], [400, 1590, 1, 1], [680, 1590, -1, 2], [790, 1650, -1, 3]];
  ring.forEach(([x, y, d, i]) => fig(c, i % 2 ? SABA36[i + 2] : (i === 0 ? BOY36 : GIRL36), { x, y, h: oH36(y) * 1.3, pose: 'sit', dir: d, t: T + i, light: 0.75, wind: 0.1, ink: 0.7, child: i === 0 || i === 3 }));
  fire(c, fx, fyy, 0.55, T);
  const old = { x: 540, y: 1560, h: oH36(1560) * 1.3, pose: 'sit', dir: 1, t: T + 5, light: 0.85, wind: 0.1, ink: 0.7, dua: false };
  if (o.teller !== false) fig(c, OLD36, old);
  [[180, 1800, 1, 4], [900, 1820, -1, 5]].forEach(([x, y, d, i]) => fig(c, SABA36[i], { x, y, h: oH36(y) * 1.3, pose: 'sit', dir: d, t: T + i, light: 0.7, wind: 0.1, ink: 0.7 }));
  smoke(c, T + 100, fx, fyy - 120, 6, SEED36 + 135, '#3a3034', 0.25, 0.8, 60); sparks(c, T + 100, fx, fyy - 80, 16, SEED36 + 136, 0.8, 0.6);
  fireLight35(c, 0.6);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- the hero shot (hook, cta, outro, cover): the storm, the dam bursting, the torrent rushing down the wadi between the two gardens
const HERO36 = Object.assign({}, STORM36, { z: 1.32, cx: 540, cy: 1235, breach: 0.62, flood: 0.3, lightning: 0, rain: 0.6 });
const hero36 = (c, T, o = {}) => { const lg = 0.8 * Math.pow(Math.max(0, Math.sin((T + 100) * 1.7) * Math.sin((T + 100) * 0.63)), 6);
  marib36(c, T, Object.assign({}, HERO36, { lightning: lg, lgX: 820, post: c2 => { birds36(c2, T, 1); } }, o)); };
// small dark birds fleeing over the valley (wing beats)
function birds36(c, T, a = 1) { if (a <= 0) return; T += 100; const r = rng(SEED36 + 140);
  for (let i = 0; i < 9; i++) { const x = ((r() * 1400 + T * (60 + r() * 40)) % 1600) - 300, y = 700 + r() * 300 + Math.sin(T * 1.3 + i) * 10, s = 0.5 + r() * 0.5, f = Math.sin(T * 12 + i * 2);
    c.strokeStyle = `rgba(30,24,30,${0.8 * a})`; c.lineWidth = 3 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 16 * s, y - f * 8 * s); c.quadraticCurveTo(x - 6 * s, y - 4 * s, x, y); c.quadraticCurveTo(x + 6 * s, y - 4 * s, x + 16 * s, y - f * 8 * s); c.stroke(); } }
function hookTexts36(c, a) { if (a <= 0) return; quote2(c, 'ILS AVAIENT TOUT…', '…ET LA DIGUE A CÉDÉ', a, 260, 84, 80); seriesTag36(c, a); }
