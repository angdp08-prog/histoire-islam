// =====================================================================================================================
// ---------- episode 33: the People of the Garden (Al-Qalam 17-33) · « Histoires du Coran »
// The father, the three brothers and the poor are ordinary people, faceless. Allah is never depicted (light only). The calamity
// (« ta'if », Al-Qalam 19) is never a form: a dark front passing over the garden at night, a faint glow of embers, then the black garden.
// Yemen near Sanaa / the father's share for the poor / three brothers = according to the exegetes (Ibn Kathir, al-Tabari, al-Qurtubi).
function seriesTag33(c, a) { textGlow(c, 'HISTOIRES DU CORAN  ·  ÉPISODE 33', W / 2, 112, '600 32px Lora', '#fbe7c6', a * 0.92, '#000000', 12); }
function ctaText33(c, a) { ctaText29(c, a); }
const SEED33 = 3300, GW33 = 1440, GX33 = 540, GTW33 = 200, GTH33 = 262, WH33 = 172, WX0 = -250, WX1 = 1350, HX33 = -700;
const burnAt33 = (o, x) => clamp(typeof o.burn === 'function' ? o.burn(x) : (o.burn || 0));
const BRO33 = [
  { robe: '#7a2a22', wrap: '#e8dcc4', skin: '#a8714f', trim: '#c9a35a', band: '#c9a35a', inner: '#e8dcc0' }, // the eldest
  { robe: '#2e4a66', wrap: '#ece6d6', skin: '#9a6a4c', trim: '#d8c48a', band: '#d8c48a', inner: '#e6e0d0' }, // the most just of them (awsatuhum)
  { robe: '#6a5426', wrap: '#e2d4b4', skin: '#b07a58', trim: '#8a3a1a', band: '#8a3a1a', inner: '#dccca8' }]; // the youngest
const FATHER33 = { robe: '#5a5048', wrap: '#e6e0d4', skin: '#9a6a4c', trim: '#b8a070', band: '#b8a070', inner: '#ddd6c8' };
const POOR33 = [{ robe: '#7a6a54', wrap: '#cfc2a6', skin: '#8f5f42', inner: '#c4b494' }, { robe: '#5e5446', wrap: '#d6cab0', skin: '#a8714f', inner: '#bfb08e' },
  { robe: '#8a7258', wrap: '#c8b896', skin: '#94664a', inner: '#cdbd9a' }, { robe: '#4e4a40', wrap: '#dcd0b6', skin: '#b07a58', inner: '#c8b892' }];

// ---------- a date palm that can burn (burn 0..1: fronds blacken, droop and fall, dates shrivel) or be laden (lush)
function palm33(c, x, y, s, T, seed, burn = 0, o = {}) {
  T += 100; const nt = o.night || 0, lush = o.lush || 0;
  const live = mix(mix('#4f6e2c', '#5e8a34', lush * 0.5), '#16201c', nt * 0.75), col = mix(live, '#16100c', burn), dk = mix(col, '#000000', 0.3);
  const trunkC = mix(mix('#6a5034', '#1c1a22', nt * 0.7), '#140e0a', burn);
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.25)'; c.beginPath(); c.ellipse(6, 2, 46, 7, 0, 0, 6.283); c.fill();
  const sway = Math.sin(T * 0.7 + seed) * 6 * (1 - burn * 0.8), top = [18 + sway, -300];
  limb(c, [0, 0], [26, -150], top, 24, 13, trunkC);
  c.strokeStyle = hexA(mix(trunkC, '#ffffff', 0.18), 0.55); c.lineWidth = 2.2;
  for (let k = 1; k < 17; k++) { const q = k / 17, px = 2 * (1 - q) * q * 26 + q * q * top[0], py = 2 * (1 - q) * q * -150 + q * q * top[1];
    c.beginPath(); c.moveTo(px - 11 + q * 4, py + 3); c.lineTo(px + 11 - q * 4, py - 3); c.stroke(); }
  const r = rng(seed);
  // date bunches under the crown (drawn first: the fronds hang over them)
  const nb = 3 + Math.round(lush * 2);
  for (let k = 0; k < nb; k++) { const bx = top[0] - 34 + k * (68 / Math.max(1, nb - 1)), by = top[1] + 16; c.strokeStyle = mix('#a07a2a', '#1a120c', burn); c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(top[0] - 4 + k * 3, top[1] + 4); c.quadraticCurveTo(bx, by - 4, bx + (k - 1) * 4, by + 30 + lush * 12); c.stroke();
    const rr = rng(seed * 7 + k), nn = 16 + Math.round(lush * 10);
    for (let j = 0; j < nn; j++) { const q = j / nn, dx = (rr() - 0.5) * (24 + lush * 10) * (1 - q * 0.5), dy = 8 + q * (40 + lush * 16), cv = rr();
      c.fillStyle = mix(mix('#6a2a0e', '#c0702a', cv), '#120a08', burn); c.beginPath(); c.ellipse(bx + dx + (k - 1) * 4 * q, by + dy, 3.8 * (1 - 0.35 * burn), 5.8 * (1 - 0.35 * burn), 0.3, 0, 6.283); c.fill(); } }
  // burnt: the dead fronds hang in a short charred skirt along the trunk
  if (burn > 0.25) { const rs = rng(seed + 5); c.lineCap = 'round';
    for (let j = 0; j < 7; j++) { const hx = top[0] + (j - 3) * 9, hl = (70 + rs() * 60) * burn, bend = (j - 3) * 6 + (rs() - 0.5) * 10;
      c.strokeStyle = mix('#2a1e16', '#0c0806', rs()); c.lineWidth = 5; c.beginPath(); c.moveTo(hx, top[1] + 6); c.quadraticCurveTo(hx + bend * 1.6, top[1] + hl * 0.5, hx + bend * 1.2, top[1] + hl); c.stroke();
      c.lineWidth = 2; for (let k = 1; k < 5; k++) { const q = k / 5, qx = hx + bend * 1.4 * q, qy = top[1] + 6 + hl * q; c.beginPath(); c.moveTo(qx, qy); c.lineTo(qx - 7, qy + 8); c.moveTo(qx, qy); c.lineTo(qx + 7, qy + 7); c.stroke(); } } }
  for (let i = 0; i < 12; i++) {
    const rv = r(), lenR = r(), gone = r();
    if (burn > 0.35 && gone < (burn - 0.35) * 0.75) continue; // some fronds burnt away
    const droop = burn * (0.2 + rv * 0.3), ang = -Math.PI / 2 + (i - 5.5) * 0.33 + (rv - 0.5) * 0.15 + Math.sin(T * 0.9 + i) * 0.03 * (1 - burn), len = (122 + lenR * 50) * (1 - 0.42 * burn);
    const a2 = -Math.PI / 2 + (i - 5.5) * 0.27 + (rv - 0.5) * 0.3, l2 = len * (0.7 + rv * 0.3), bb = ease(clamp(burn * 1.4 - 0.2)); // burnt: stiff, short, broken fronds
    const ex = lerp(top[0] + Math.cos(ang) * len, top[0] + Math.cos(a2) * l2, bb), ey = lerp(top[1] + Math.sin(ang) * len * 0.55 + len * 0.42 + droop * len * 0.4, top[1] + Math.sin(a2) * l2, bb);
    const mx = lerp(top[0] + Math.cos(ang) * len * 0.55, top[0] + Math.cos(a2) * l2 * 0.5, bb), my = lerp(top[1] + Math.sin(ang) * len * 0.55 - 26 + droop * len * 0.15, top[1] + Math.sin(a2) * l2 * 0.5 + 6, bb);
    c.strokeStyle = i % 2 ? col : dk; c.lineWidth = 4 + burn; c.beginPath(); c.moveTo(top[0], top[1]); c.quadraticCurveTo(mx, my, ex, ey); c.stroke();
    c.lineWidth = 3;
    for (let k = 2; k < 12; k++) { if (burn > 0.5 && k % 3) continue;
      const q = k / 12, qx = (1 - q) * (1 - q) * top[0] + 2 * (1 - q) * q * mx + q * q * ex, qy = (1 - q) * (1 - q) * top[1] + 2 * (1 - q) * q * my + q * q * ey;
      const l = 30 * (1 - q * 0.6) * (1 - 0.55 * burn); c.beginPath(); c.moveTo(qx, qy); c.lineTo(qx - 6 + Math.cos(ang + 1.4) * l * 0.4, qy + l); c.moveTo(qx, qy); c.lineTo(qx + 6 + Math.cos(ang - 1.4) * l * 0.4, qy + l * 0.9); c.stroke(); }
  }
  if (o.ember && burn > 0.3) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, top[0], top[1] + 10, 90, '#ff6a2a', 0.18 * o.ember * burn); c.restore(); }
  c.restore();
}

// ---------- a vine leaf (three lobes) and a bunch of grapes
function leaf33(c, x, y, R, rot, col) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = col; c.beginPath();
  c.ellipse(0, -R * 0.38, R * 0.55, R * 0.68, 0, 0, 6.283); c.ellipse(-R * 0.46, 0, R * 0.5, R * 0.4, -0.6, 0, 6.283); c.ellipse(R * 0.46, 0, R * 0.5, R * 0.4, 0.6, 0, 6.283); c.fill(); c.restore(); }
function grapes33(c, x, y, s, col, b = 0) { const r = 4.6 * s * (1 - 0.35 * b), cc = mix(col, '#120a0c', b);
  c.strokeStyle = mix('#5a4020', '#140c08', b); c.lineWidth = 2 * s; c.beginPath(); c.moveTo(x, y - 6 * s); c.lineTo(x + 1, y + 2 * s); c.stroke();
  const rows = [5, 5, 4, 4, 3, 2, 1];
  rows.forEach((n, j) => { for (let k = 0; k < n; k++) { const gx = x + (k - (n - 1) / 2) * r * 1.8 + (j % 2) * r * 0.3, gy = y + 4 * s + j * r * 1.6;
    c.fillStyle = mix(cc, '#000000', (k + j) % 3 === 0 ? 0.2 : 0); c.beginPath(); c.arc(gx, gy, r, 0, 6.283); c.fill();
    if (b < 0.5) { c.fillStyle = hexA('#ffffff', 0.22 * (1 - b * 2)); c.beginPath(); c.arc(gx - r * 0.35, gy - r * 0.35, r * 0.3, 0, 6.283); c.fill(); } } });
}
// ---------- a row of vines on a trellis (posts, wire, twisted trunks, leaves, bunches). y = ground line. o.burn = number or function of x
function vineRow33(c, x0, x1, y, s, T, seed, o = {}) {
  T += 100; const nt = o.night || 0, lush = o.lush || 0, step = 150 * s, ph = 140 * s, r = rng(seed);
  const postC = mix('#5a4028', '#16141c', nt * 0.7);
  for (let x = x0; x <= x1 + 1; x += step) { const b = burnAt33(o, x); c.fillStyle = mix(postC, '#120c08', b * 0.6); c.fillRect(x - 4 * s, y - ph, 8 * s, ph); c.fillStyle = 'rgba(10,6,4,0.25)'; c.beginPath(); c.ellipse(x, y + 1, 12 * s, 3 * s, 0, 0, 6.283); c.fill(); }
  c.strokeStyle = hexA(mix('#3a2a1a', '#0c0a10', nt), 0.7); c.lineWidth = 1.6 * s; c.beginPath();
  for (let x = x0; x < x1; x += step) { c.moveTo(x, y - ph * 0.92); c.quadraticCurveTo(x + step / 2, y - ph * 0.86, x + step, y - ph * 0.92); } c.stroke();
  for (let x = x0; x < x1; x += step) {
    const b = burnAt33(o, x + step / 2), sw = Math.sin(T * 0.8 + x * 0.01) * 2 * s * (1 - b);
    const leafC = mix(mix(mix('#5a8a34', '#6a9a3a', lush * 0.6), '#182620', nt * 0.75), '#1c1410', b), leafD = mix(leafC, '#000000', 0.3), leafL = mix(leafC, '#e8f0a0', 0.25 * (1 - b) * (1 - nt));
    const tx = x + step * (0.42 + r() * 0.16); // the twisted trunk
    limb(c, [tx, y], [tx + 14 * s, y - ph * 0.45], [tx - 6 * s, y - ph * 0.88], 12 * s, 7 * s, mix(mix('#5a3a22', '#18141a', nt * 0.7), '#100a08', b));
    const L = []; for (let k = 0; k < 16; k++) L.push([x + r() * step, y - ph * 0.92 + (r() - 0.62) * ph * 0.5, (16 + r() * 11) * s, r() * 6, r(), r()]);
    const G = []; for (let j = 0; j < 3; j++) G.push([x + (0.18 + 0.3 * j) * step + (r() - 0.5) * 18 * s, r(), r()]);
    L.slice(0, 8).forEach(([lx, ly, R, rot, cv, gone]) => { if (b > 0.5 && gone < (b - 0.5) * 1.2) return; leaf33(c, lx + sw, ly, R * (1 - 0.45 * b), rot, cv > 0.5 ? leafD : leafC); });
    G.forEach(([gx, cv, has]) => { if (has < 0.35 - lush * 0.4) return; grapes33(c, gx + sw * 0.5, y - ph * 0.86, s * (0.85 + lush * 0.45), cv > 0.45 ? '#4a1e48' : '#8aa040', b); });
    L.slice(8).forEach(([lx, ly, R, rot, cv, gone]) => { if (b > 0.5 && gone < (b - 0.5) * 1.2) return; leaf33(c, lx + sw, ly - 6 * s, R * (1 - 0.45 * b), rot, cv > 0.6 ? leafL : leafC); });
  }
}

// ---------- a woven palm-leaf basket: origin = bottom centre on the ground (o.hang: origin = top of the handle), o.fill = dates heaped, o.rot = tipped over
function basket33(c, x, y, s, o = {}) { c.save(); c.translate(x, y); c.scale(s, s); if (o.hang) c.translate(0, 124); if (o.rot) { c.translate(o.rot > 0 ? 48 : -48, 0); c.rotate(o.rot); c.translate(o.rot > 0 ? -48 : 48, 0); }
  const col = o.col || '#b8925a', dk = mix(col, '#2a1408', 0.45), lt = mix(col, '#fff0c8', 0.3);
  if (!o.hang && !o.rot) { c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(0, 2, 52, 8, 0, 0, 6.283); c.fill(); }
  if (o.fill) { const rr = rng(77); for (let j = 0; j < 30; j++) { const a = rr() * 3.14, d = Math.sqrt(rr()); c.fillStyle = mix('#6a2a0e', '#b0602a', rr());
    c.beginPath(); c.ellipse(Math.cos(a) * 42 * d, -66 - Math.sin(a) * 22 * d * o.fill, 5, 7, rr() * 3, 0, 6.283); c.fill(); } }
  const g = c.createLinearGradient(-48, 0, 48, 0); g.addColorStop(0, dk); g.addColorStop(0.45, col); g.addColorStop(1, mix(col, '#2a1408', 0.25));
  c.fillStyle = g; c.beginPath(); c.moveTo(-35, 0); c.lineTo(-48, -66); c.lineTo(48, -66); c.lineTo(35, 0); c.closePath(); c.fill();
  c.strokeStyle = hexA(dk, 0.7); c.lineWidth = 2; for (let k = 1; k < 6; k++) { const yy = -k * 11, w2 = lerp(35, 48, k / 6); c.beginPath(); c.moveTo(-w2, yy); c.lineTo(w2, yy); c.stroke(); }
  c.strokeStyle = hexA(lt, 0.5); c.lineWidth = 1.5; for (let k = -4; k <= 4; k++) { c.beginPath(); c.moveTo(k * 8, 0); c.lineTo(k * 11, -66); c.stroke(); }
  c.fillStyle = lt; c.beginPath(); c.ellipse(0, -66, 49, 7, 0, 0, 6.283); c.fill(); c.strokeStyle = dk; c.lineWidth = 2; c.stroke();
  if (o.fill) { const rr = rng(78); for (let j = 0; j < 18; j++) { c.fillStyle = mix('#7a3410', '#c0702a', rr()); c.beginPath(); c.ellipse((rr() - 0.5) * 70, -68 - rr() * 14 * o.fill, 5, 7, rr() * 3, 0, 6.283); c.fill(); } }
  c.strokeStyle = dk; c.lineWidth = 6; c.beginPath(); c.moveTo(-40, -64); c.quadraticCurveTo(-30, -130, 0, -124); c.quadraticCurveTo(30, -130, 40, -64); c.stroke();
  c.strokeStyle = lt; c.lineWidth = 2; c.beginPath(); c.moveTo(-38, -66); c.quadraticCurveTo(-28, -126, 0, -121); c.stroke();
  c.restore(); }
// the near hand of a standing / walking figure (same maths as figureRaw: arm swing + body bob)
function hand33(o) { const s = (o.h || 300) / 300, d = o.dir || 1, w = o.walk === null || o.walk === undefined ? null : o.walk, S = w === null ? 0 : Math.sin(w * Math.PI * 2), sw = w === null ? 0 : -S * 0.5;
  return [o.x + d * (48 + sw * 30) * s, o.y + (-114 + 4) * s - (w === null ? 0 : Math.abs(S) * 3 * s)]; }
// a figure carrying a basket in the near hand
function carrier33(c, who, o, bo = {}) { fig(c, who, o); const [hx, hy] = hand33(o); basket33(c, hx, hy - 4 * (o.h || 300) / 300, 0.55 * (o.h || 300) / 300, Object.assign({ hang: true }, bo)); }
// whispering: three small arcs beside the head (never dots near a head)
function whisper33(c, x, y, s, T, dir = 1, a = 1) { if (a <= 0) return; T += 100; c.save(); c.translate(x, y); c.scale(dir * s, s); c.lineCap = 'round';
  for (let k = 0; k < 3; k++) { const ph = ((T * 1.2 + k / 3) % 1); c.strokeStyle = `rgba(255,244,220,${0.55 * a * Math.sin(ph * Math.PI)})`; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 10 + ph * 26, -0.55, 0.55); c.stroke(); }
  c.restore(); }

// ---------- the highlands of Yemen (far layers): ranges, terraced slopes, a far village of tower houses
function terraces33(c, y, nt, haze) { const col = mix('#8a8660', '#20222c', nt * 0.8);
  ridgeW(c, y, 150, 0.0032, SEED33 + 5, col);
  c.strokeStyle = hexA(mix('#4a4a30', '#0c0c14', nt), 0.35); c.lineWidth = 2;
  for (let k = 0; k < 10; k++) { c.beginPath(); for (let x = -2400; x <= 3400; x += 24) { const yy = ridgeY(x, y, 150, 0.0032, SEED33 + 5) + 16 + k * 20; x === -2400 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); }
  c.strokeStyle = hexA(mix('#c8c08a', '#2a2a3a', nt), 0.25); c.lineWidth = 2;
  for (let k = 0; k < 10; k++) { c.beginPath(); for (let x = -2400; x <= 3400; x += 24) { const yy = ridgeY(x, y, 150, 0.0032, SEED33 + 5) + 13 + k * 20; x === -2400 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); }
  hazeW(c, y + 60, 200, haze || '#f0dccc', 0.42 * (1 - nt * 0.75)); }
function village33(c, T, nt, lamp) { const hy = x => ridgeY(x, 1316, 46, 0.005, SEED33 + 6), col = mix('#9a8a60', '#1e2028', nt * 0.8);
  c.fillStyle = col; c.beginPath(); c.moveTo(-2400, H + 400); for (let x = -2400; x <= 3400; x += 16) c.lineTo(x, hy(x)); c.lineTo(3400, H + 400); c.closePath(); c.fill();
  const r = rng(SEED33 + 7);
  for (let i = 0; i < 9; i++) { const x = 820 + i * 52 + r() * 20, h = 70 + r() * 70, w = 34 + r() * 18; c.save(); c.globalAlpha *= 0.9; towerHouse(c, x, hy(x) + 6, w, h, mix(mix('#9a6040', '#c08a5a', r()), '#24222e', nt * 0.75), SEED33 + 8 + i, T); c.restore(); }
  for (let i = 0; i < 4; i++) { const x = -520 + i * 60 + r() * 20, h = 60 + r() * 50, w = 30 + r() * 14; towerHouse(c, x, hy(x) + 6, w, h, mix(mix('#9a6040', '#c08a5a', r()), '#24222e', nt * 0.75), SEED33 + 20 + i, T); }
  if (nt > 0.3) { c.save(); c.fillStyle = `rgba(8,10,24,${0.5 * nt})`; c.fillRect(-2400, 1100, 5800, 400); c.restore(); }
  hazeW(c, 1330, 90, '#f0dccc', 0.2 * (1 - nt)); }

// ---------- the garden wall and its gate (o.open 0..1 = the two leaves swing inward), o.soot = blackened coping after the fire
function wall33(c, T, o = {}) {
  const y = GW33, h = WH33, nt = o.night || 0, gx = GX33, gw = GTW33, gh = GTH33, soot = o.soot || 0;
  const base = mix('#b89a72', '#2a2834', nt * 0.8), lt = mix(base, '#fff0d8', 0.25 * (1 - nt)), dk = mix(base, '#1a0c06', 0.45);
  const face = (xa, xb, top) => { const g = c.createLinearGradient(0, y - top, 0, y); g.addColorStop(0, lt); g.addColorStop(0.5, base); g.addColorStop(1, dk); c.fillStyle = g; c.fillRect(xa, y - top, xb - xa, top);
    const r = rng(SEED33 + 11 + Math.round(xa)); c.strokeStyle = hexA(mix(dk, '#000000', 0.2), 0.35); c.lineWidth = 2;
    for (let yy = y - 4, row = 0; yy > y - top + 6; yy -= 24, row++) { c.beginPath(); c.moveTo(xa, yy); c.lineTo(xb, yy); c.stroke();
      for (let xx = xa + (row % 2) * 22 + r() * 10; xx < xb; xx += 40 + r() * 20) { c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx + (r() - 0.5) * 4, yy - 24); c.stroke(); } }
    const rr = rng(SEED33 + 12 + Math.round(xb)); for (let k = 0; k < (xb - xa) / 30; k++) { c.fillStyle = hexA(rr() > 0.5 ? '#fff4dc' : '#3a2414', 0.08 * (1 - nt * 0.6)); c.beginPath(); c.ellipse(xa + rr() * (xb - xa), y - rr() * top, 20 + rr() * 30, 8 + rr() * 10, 0, 0, 6.283); c.fill(); }
    c.fillStyle = mix(lt, '#ffffff', 0.1 * (1 - nt)); c.beginPath(); c.roundRect(xa - 6, y - top - 12, xb - xa + 12, 16, 6); c.fill(); c.fillStyle = hexA(dk, 0.5); c.fillRect(xa - 6, y - top + 2, xb - xa + 12, 4);
    if (soot > 0) { const sg = c.createLinearGradient(0, y - top - 12, 0, y - top + 70); sg.addColorStop(0, `rgba(14,10,8,${0.55 * soot})`); sg.addColorStop(1, 'rgba(14,10,8,0)'); c.fillStyle = sg; c.fillRect(xa - 6, y - top - 12, xb - xa + 12, 82); } };
  face(WX0, gx - gw / 2 - 30, h); face(gx + gw / 2 + 30, WX1, h);
  // corner posts at both ends
  [WX0, WX1].forEach(xx => { face(xx - 22, xx + 22, h + 26); });
  // the gate: two pillars and a lintel with a small pointed arch, the two plank leaves
  const pl = (xa) => face(xa, xa + 30, gh + 40); pl(gx - gw / 2 - 30); pl(gx + gw / 2);
  c.fillStyle = base; c.fillRect(gx - gw / 2 - 30, y - gh - 40, gw + 60, 30); c.fillStyle = lt; c.fillRect(gx - gw / 2 - 36, y - gh - 52, gw + 72, 14);
  c.fillStyle = dk; c.beginPath(); archPath(c, gx, y - gh - 12, 70, 0); c.fill();
  c.strokeStyle = hexA(dk, 0.7); c.lineWidth = 6; c.beginPath(); c.moveTo(gx - gw / 2, y - gh - 10); c.lineTo(gx + gw / 2, y - gh - 10); c.stroke();
  const op = ease(clamp(o.open || 0)), wood = mix('#6a4428', '#1a1620', nt * 0.75), wdk = mix(wood, '#000000', 0.4);
  const leafD = (hx, sgn) => { const w = gw / 2 * Math.cos(op * 1.35), sh = op * 16; // swings inward: narrower and a bit smaller (perspective)
    const xa = hx, xb = hx + sgn * w; c.fillStyle = op > 0.05 ? mix(wood, '#000000', 0.25 * op) : wood;
    c.beginPath(); c.moveTo(xa, y - gh - 10); c.lineTo(xb, y - gh - 10 + sh); c.lineTo(xb, y - sh * 0.6); c.lineTo(xa, y); c.closePath(); c.fill();
    c.strokeStyle = hexA(wdk, 0.8); c.lineWidth = 2; for (let k = 1; k < 4; k++) { const xx = lerp(xa, xb, k / 4); c.beginPath(); c.moveTo(xx, y - gh - 10 + sh * k / 4); c.lineTo(xx, y - sh * 0.6 * k / 4); c.stroke(); }
    c.strokeStyle = mix('#2a2a2e', '#0a0a0e', nt); c.lineWidth = 6; [0.18, 0.78].forEach(q => { c.beginPath(); c.moveTo(xa, y - gh * (1 - q) - 10 * (1 - q)); c.lineTo(xb, y - gh * (1 - q) - 10 * (1 - q) + sh * (1 - q) - sh * 0.6 * q); c.stroke(); }); };
  leafD(gx - gw / 2, 1); leafD(gx + gw / 2, -1);
}
// inside the wall: the garden ground, a row of vines (seen through the gate) and two rows of palms
function orchard33(c, T, o = {}) { const nt = o.night || 0;
  const gb = burnAt33(o, GX33), ig = mix(mix('#7a8a48', '#2e3424', nt * 0.75), '#2a2420', gb);
  c.fillStyle = ig; c.fillRect(WX0, 1300, WX1 - WX0, GW33 - 1300 + 2);
  for (let i = 0, r = rng(SEED33 + 30); i < 16; i++) { const x = WX0 + 40 + i * 100 + r() * 40; palm33(c, x, 1392 + r() * 8, 1.0 + r() * 0.12, T, SEED33 + 31 + i, burnAt33(o, x), { night: nt, lush: o.lush, ember: o.ember }); }
  vineRow33(c, WX0 + 20, WX1 - 20, GW33 - 26, 0.62, T, SEED33 + 50, { burn: o.burn, night: nt, lush: o.lush });
  for (let i = 0, r = rng(SEED33 + 60); i < 9; i++) { const x = WX0 + 110 + i * 185 + r() * 40; if (Math.abs(x - GX33) < 120) continue; palm33(c, x, GW33 - 8, 1.32 + r() * 0.12, T, SEED33 + 61 + i, burnAt33(o, x), { night: nt, lush: o.lush, ember: o.ember }); }
}
// near ground outside the wall: earth, the beaten path to the gate, a little irrigation channel, stones and tufts
function ground33(c, T, o = {}) { const nt = o.night || 0, earth = mix('#b08a5c', '#2a2630', nt * 0.8);
  const g = c.createLinearGradient(0, GW33, 0, H + 300); g.addColorStop(0, mix(earth, '#fff0d4', 0.14 * (1 - nt))); g.addColorStop(0.4, earth); g.addColorStop(1, mix(earth, '#140a04', 0.5));
  c.fillStyle = g; c.fillRect(-2400, GW33, 5800, H + 1200);
  c.fillStyle = hexA(mix('#3a2a1a', '#0c0a10', nt), 0.45); c.fillRect(-2400, GW33, 5800, 6);
  c.fillStyle = hexA(mix(earth, '#fff4dc', 0.35), 0.35 * (1 - nt * 0.6)); c.beginPath(); // the path: to the gate, and along the wall toward the house
  c.moveTo(GX33 - GTW33 / 2, GW33); c.lineTo(GX33 + GTW33 / 2, GW33); c.lineTo(GX33 + 560, H + 300); c.lineTo(GX33 - 560, H + 300); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(HX33 - 200, GW33 + 30); c.lineTo(GX33, GW33 + 30); c.lineTo(GX33, GW33 + 150); c.lineTo(HX33 - 200, GW33 + 170); c.closePath(); c.fill();
  c.strokeStyle = hexA(mix(earth, '#2a1a0c', 0.5), 0.25); c.lineWidth = 2; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(GX33 + k * 20, GW33 + 4); c.lineTo(GX33 + k * 150, H + 300); c.stroke(); }
  if (o.channel !== false) { c.fillStyle = mix('#5a4a3a', '#141420', nt); c.fillRect(-2400, GW33 + 14, 5800, 7); c.fillStyle = hexA(mix('#9ac0d0', '#2a3050', nt), (1 - burnAt33(o, GX33) * 0.8) * 0.5); c.fillRect(-2400, GW33 + 16, 5800, 3); }
  const r = rng(SEED33 + 70);
  for (let i = 0; i < 120; i++) { const q = Math.pow(r(), 1.6), yy = GW33 + 30 + q * (H + 200 - GW33), x = -1800 + r() * 4600, sz = 2 + q * 14, cv = r();
    c.fillStyle = hexA(mix(earth, cv > 0.6 ? '#2a1a10' : '#fff0d8', 0.4), 0.5); c.beginPath(); c.ellipse(x, yy, sz, sz * 0.45, 0, 0, 6.283); c.fill(); }
  for (let i = 0; i < 26; i++) { const q = Math.pow(r(), 1.3), yy = GW33 + 26 + q * (H - GW33), x = -1400 + r() * 3800; if (Math.abs(x - GX33) < 200 + q * 300) continue; shrub(c, x, yy, 0.25 + q * 0.8, mix('#6a7a3a', '#1c2420', nt * 0.75), T, i + 3); }
}
// the brothers' house (left of the garden, on the path): mud brick, lamp in the window, a bench
function home33(c, T, o = {}) { const nt = o.night || 0; house(c, HX33, GW33 + 2, 430, 330, mix('#b88e64', '#2a2632', nt * 0.75), { lamp: o.lamp === undefined ? nt : o.lamp, t: T, doorOpen: o.doorOpen });
  palm33(c, HX33 + 300, GW33 + 4, 1.1, T, SEED33 + 90, 0, { night: nt }); }
// the calamity passing over the garden at night (Al-Qalam 19): a dark rolling front, a faint low glow of embers behind it. Never a form.
function fleau33(c, T, sx, k = 1) { if (k <= 0) return; T += 100; const r = rng(SEED33 + 80);
  for (let i = 0; i < 46; i++) { const u = r(), R = 90 + r() * 170, dx = (r() - 0.5) * 420 + Math.sin(T * 0.5 + i) * 30, dy = 880 + u * 600 + Math.cos(T * 0.4 + i * 1.7) * 26;
    const g = c.createRadialGradient(sx + dx, dy, 0, sx + dx, dy, R); g.addColorStop(0, `rgba(6,4,10,${0.72 * k})`); g.addColorStop(1, 'rgba(6,4,10,0)'); c.fillStyle = g; c.fillRect(sx + dx - R, dy - R, R * 2, R * 2); }
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 10; i++) { const x = sx - 120 - i * 70, a = 0.2 * k * (1 - i / 10); glow(c, x, 1390 - (i % 3) * 30, 160, '#ff5a1e', a); }
  const rr = rng(SEED33 + 81); for (let i = 0; i < 60; i++) { const x = sx - 80 - rr() * 700, ph = (T * (0.3 + rr() * 0.4) + rr()) % 1, y = 1420 - ph * 420 - rr() * 60, a = k * Math.sin(ph * Math.PI) * (1 - (sx - x) / 800);
    if (a <= 0) continue; c.fillStyle = `rgba(255,${130 + (i % 4) * 25},60,${0.7 * a})`; c.beginPath(); c.arc(x + Math.sin(T + i) * 10, y, 1.6 + (i % 3), 0, 6.283); c.fill(); }
  c.restore(); }
// thin smoke still rising from the black garden in the morning
function smoke33(c, T, k, x0 = WX0, x1 = WX1) { if (k <= 0) return; for (let i = 0; i < 6; i++) smoke(c, T + 100, x0 + 120 + i * (x1 - x0 - 240) / 5, 1300, 4, SEED33 + 82 + i, '#4a4448', 0.22 * k, 0.6, 40); }

// ---------- the land: sky, highlands, far village, the walled garden, the house, the near ground; walkers on the ground
function garden33(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 8) : [0, 0]));
  const px = o.px || 0, nt = o.night || 0;
  if (o.skyFn) o.skyFn(c); else sky0(c, skyStops(o.sky || 'day', o.to, o.k || 0));
  if (o.stars) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); stars(c, T, 150, SEED33 + 1, [0, 0, W, 1000], o.stars); c.restore(); }
  if (o.moon) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); moon(c, o.moonX || 780, o.moonY || 360, 44, o.moon); c.restore(); }
  if (o.sunA) bigSun30(c, o.sunX === undefined ? 860 : o.sunX, o.sunY === undefined ? 1060 : o.sunY, 50, o.sunCol || '#ffd08a', o.sunA);
  cloudBank(c, T, 330, 6, o.cloud || '#fff0dc', 0.14 * (1 - nt * 0.8), SEED33 + 2, 6);
  par(c, -0.8, px, 0, () => { ridgeW(c, 1120, 250, 0.0024, SEED33 + 3, mix('#8a88a6', '#181a30', nt)); hazeW(c, 1160, 260, o.haze || '#f0dccc', 0.5 * (1 - nt * 0.75)); });
  par(c, -0.55, px, 0, () => terraces33(c, 1250, nt, o.haze));
  par(c, -0.38, px, 0, () => village33(c, T, nt, o.lamp || 0));
  par(c, -0.15, px, 0, () => { orchard33(c, T, o); if (o.sweep !== undefined) fleau33(c, T, o.sweep, o.sweepK === undefined ? 1 : o.sweepK); wall33(c, T, o); home33(c, T, { night: nt, lamp: o.homeLamp, doorOpen: o.doorOpen }); if (o.onWall) o.onWall(c); });
  par(c, 0, px, 0, () => { ground33(c, T, o); if (o.props) o.props(c); });
  if (o.smoke) par(c, -0.15, px, 0, () => smoke33(c, T, o.smoke));
  if (o.light) lightFromAbove(c, T, o.lightX || 540, o.light, o.lightW || 380);
  par(c, 0, px, 0, () => { if (o.walkers) o.walkers(c); });
  if (o.tint) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = o.tint; c.fillRect(0, 0, W, H); c.restore(); }
  if (o.fg !== false) blurLayer(c, 10, bc => { shrub(bc, -40, 2140, 3.2, mix('#4a5a2a', '#101418', nt * 0.8), T, 7); rock(bc, 1130, 2120, 360, 200, mix('#8a7050', '#1a1820', nt * 0.8), SEED33 + 95); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// ---------- inside the garden: rows of vines one behind the other, palms behind, the earth with furrows; people stand in the open middle
function vineyard33(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 8) : [0, 0]));
  const px = o.px || 0, nt = o.night || 0;
  if (o.skyFn) o.skyFn(c); else sky0(c, skyStops(o.sky || 'day', o.to, o.k || 0));
  if (o.stars) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); stars(c, T, 150, SEED33 + 1, [0, 0, W, 900], o.stars); c.restore(); }
  if (o.moon) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); moon(c, o.moonX || 780, o.moonY || 360, 44, o.moon); c.restore(); }
  if (o.sunA) bigSun30(c, o.sunX === undefined ? 860 : o.sunX, o.sunY === undefined ? 1000 : o.sunY, 50, o.sunCol || '#ffd08a', o.sunA);
  par(c, -0.8, px, 0, () => { ridgeW(c, 1080, 250, 0.0024, SEED33 + 3, mix('#8a88a6', '#181a30', nt)); hazeW(c, 1120, 260, o.haze || '#f0dccc', 0.5 * (1 - nt * 0.75)); });
  par(c, -0.5, px, 0, () => terraces33(c, 1200, nt, o.haze));
  par(c, -0.25, px, 0, () => { const b = burnAt33(o, 540), top = mix(mix(mix('#9a8a52', '#7a8a48', 0.4), '#2a2a2c', nt * 0.75), '#7a7470', b), bot = mix(mix('#5a4630', '#16141c', nt * 0.75), '#3e3a36', b);
    const g = c.createLinearGradient(0, 1290, 0, H + 300); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(-2400, 1290, 5800, H + 1000);
    for (let i = 0, r = rng(SEED33 + 100); i < 22; i++) { const x = -800 + i * 130 + r() * 50; palm33(c, x, 1296, 0.78 + r() * 0.1, T, SEED33 + 101 + i, burnAt33(o, x), { night: nt, lush: o.lush, ember: o.ember }); } });
  par(c, -0.1, px, 0, () => { const Y = [1334, 1378, 1436, 1516, 1626], S = [0.38, 0.48, 0.62, 0.82, 1.08], b = burnAt33(o, 540); const soil = mix(mix(mix('#9a8a52', '#7a8a48', 0.4), '#2a2a2c', nt * 0.75), '#7a7470', b);
    { const pc = mix(mix('#c8b080', '#3a3a44', nt * 0.75), '#a8a29c', b), pg = c.createLinearGradient(0, 1300, 0, 2000); pg.addColorStop(0, hexA(pc, 0)); pg.addColorStop(0.5, hexA(pc, 0.22)); pg.addColorStop(1, hexA(pc, 0.3)); c.fillStyle = pg; c.save(); c.filter = 'blur(6px)'; c.beginPath(); c.moveTo(510, 1300); c.lineTo(570, 1300); c.lineTo(900, H + 300); c.lineTo(180, H + 300); c.closePath(); c.fill(); c.restore(); } // the middle path, soft
    Y.forEach((y, j) => { c.strokeStyle = hexA('#2a1a0c', 0.22); c.lineWidth = 2 + j; c.beginPath(); c.moveTo(-2400, y + 4 + j * 2); c.lineTo(3400, y + 4 + j * 2); c.stroke();
      const vo = { burn: o.burn, night: nt, lush: o.lush };
      if (j < 4) vineRow33(c, -1000 + (j % 2) * 60 * S[j], 2100, y, S[j], T, SEED33 + 110 + j, vo);
      else { vineRow33(c, -1400, 250, y, S[j], T, SEED33 + 114, vo); vineRow33(c, 830, 2400, y, S[j], T, SEED33 + 115, vo); } });
    const r = rng(SEED33 + 121); for (let i = 0; i < 60; i++) { const q = r(), yy = 1640 + q * 520, x = -500 + r() * 2100, sz = 2 + q * 10, cv = r();
      c.fillStyle = hexA(mix(soil, cv > 0.5 ? '#1a1410' : '#fff4e0', 0.4), 0.5); c.beginPath(); c.ellipse(x, yy, sz, sz * 0.45, 0, 0, 6.283); c.fill(); }
    if (o.ash) { const r = rng(SEED33 + 120); for (let i = 0; i < 70; i++) { const q = r(), yy = 1560 + q * 560, x = -400 + r() * 1900, cv = r(); c.fillStyle = cv > 0.5 ? `rgba(150,144,138,${0.35 * o.ash})` : `rgba(24,20,18,${0.3 * o.ash})`; c.beginPath(); c.ellipse(x, yy, 18 + q * 40, 4 + q * 7, 0, 0, 6.283); c.fill(); } } });
  if (o.sweep !== undefined) par(c, -0.1, px, 0, () => fleau33(c, T, o.sweep, o.sweepK === undefined ? 1 : o.sweepK));
  if (o.smoke) par(c, -0.1, px, 0, () => smoke33(c, T, o.smoke, -600, 1700));
  if (o.light) lightFromAbove(c, T, o.lightX || 540, o.light, o.lightW || 380);
  par(c, 0, px, 0, () => { if (o.props) o.props(c); if (o.walkers) o.walkers(c); });
  if (o.vision) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const v = c.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H * 0.5, H * 0.72); v.addColorStop(0, 'rgba(255,250,235,0)'); v.addColorStop(1, `rgba(255,248,230,${0.55 * o.vision})`); c.fillStyle = v; c.fillRect(0, 0, W, H); c.restore(); }
  if (o.fg !== false) blurLayer(c, 10, bc => { vineRow33(bc, -700, 160, 2140, 2.3, T, SEED33 + 130, { burn: o.burn, night: nt, lush: o.lush }); vineRow33(bc, 1000, 1900, 2160, 2.3, T, SEED33 + 131, { burn: o.burn, night: nt, lush: o.lush }); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// ---------- the brothers' room at night: the three asleep on their mats (sleeper29), the lamp low
function sleepRoom33(c, T, o = {}) { dkRoom(c, T, { night: 1, z: o.z || 1, cx: o.cx || 560, cy: o.cy || 1300, lamp: o.lamp === undefined ? 0.35 : o.lamp, shaft: 0, winShadow: o.winShadow || 0 });
  sleeper29(c, 690, 1606, 0.8, T, BRO33[2], { dir: -1, light: 0.5 }); sleeper29(c, 330, 1660, 0.9, T, BRO33[1], { dir: 1, light: 0.55 }); sleeper29(c, 640, 1790, 1.08, T, BRO33[0], { dir: 1, light: 0.6 });
  if (o.dark) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(4,4,10,${o.dark})`; c.fillRect(0, 0, W, H); c.restore(); }
  c.setTransform(1, 0, 0, 1, 0, 0); }

// ---------- the hero shot (hook, cta, outro, cover): the black garden at dawn, smoke, the gate open, the three brothers before it, a basket dropped
const HERO33 = { sky: 'dawn', to: 'gold', k: 0.25, sunX: 880, sunY: 1150, sunA: 0.75, burn: 1, soot: 1, open: 1, smoke: 0.8, z: 1.0, cx: 540, cy: 1250, haze: '#f0d0c0' };
function heroBros33(T, o = {}) { const k = o.k === undefined ? 1 : o.k; return c => {
  basket33(c, 450, 1714, 0.75, { rot: -1.45, fill: 0 });
  fig(c, BRO33[1], { x: 620, y: 1600, h: 320, dir: 1, t: T + 1, light: 1, wind: 0.4, ink: 0.7, reach: 0.25 * k });
  fig(c, BRO33[0], { x: 340, y: 1730, h: 430, dir: 1, t: T, light: 1.05, wind: 0.45, ink: 0.75, armUp: 0.35 * k });
  fig(c, BRO33[2], { x: 820, y: 1700, h: 410, dir: -1, t: T + 2, light: 1, wind: 0.45, ink: 0.75, reach: 0.45 * k }); }; }
const hero33 = (c, T, o = {}) => garden33(c, T, Object.assign({}, HERO33, { walkers: o.noBros ? null : heroBros33(T) }, o));
function heroTexts33(c, a) { if (a <= 0) return; topShade(c, 1.3 * a); seriesTag33(c, a); bigWord27(c, 'LEUR JARDIN', 250, a, 104); bigWord27(c, 'NOIR COMME LA NUIT', 360, a, 84, '#f6c453'); }
