
// =====================================================================================================================
// ---------- episode 35: the People of the Trench (Al-Buruj 4-10; Sahih Muslim 3005, hadith of Suhayb) · « Histoires du Coran »
// The boy, the king, the old magician, the monk, the blind courtier, the soldiers, the mother and the people are ordinary people,
// faceless (the boy in sky blue, never white). Allah is never depicted (light only). The Prophet ﷺ is only named, never shown.
// No violence is shown: the soldiers' fall is a dust cloud, the boat heels over into a white flash, the arrow leaves the bow and
// the picture cuts to light; the trench is a glow seen from afar, no one is ever shown in the fire. The baby's words = light.
// Najran (Yemen) as the place = according to the exegetes; the hadith itself names no city.
function seriesTag35(c, a) { textGlow(c, 'HISTOIRES DU CORAN  ·  ÉPISODE 35', W / 2, 112, '600 32px Lora', '#fbe7c6', a * 0.92, '#000000', 12); }
function ctaText35(c, a) { ctaText29(c, a); }
const SEED35 = 3500, GY35 = 1300;
const hY35 = y => Math.max(60, (y - GY35) * 0.95); // figure height by depth on the flat plain
const NAJ35 = [
  { robe: '#2e3e6a', wrap: '#e8dcc4', skin: '#a8714f', trim: '#c9a35a', band: '#c9a35a', inner: '#e2d8c0' },
  { robe: '#7a4a24', wrap: '#ece2cc', skin: '#9a6a4c', trim: '#3a2210', band: '#3a2210', inner: '#e0d6c0' },
  { robe: '#5a2a2a', wrap: '#dccfb2', skin: '#b07a58', trim: '#d8b070', band: '#d8b070', inner: '#d8ccb0' },
  { robe: '#3e5a46', wrap: '#e6dcc8', skin: '#94664a', trim: '#b8a070', band: '#b8a070', inner: '#ddd4c0' },
  { robe: '#6a5a3a', wrap: '#efe6d2', skin: '#a8714f', trim: '#4a3018', band: '#4a3018', inner: '#e6dcc6' },
  { robe: '#2a4a5e', wrap: '#d8ccb4', skin: '#8f5f42', trim: '#a89070', band: '#a89070', inner: '#cfc4aa' },
  { robe: '#8a5a3a', wrap: '#e8e0cc', skin: '#b07a58', trim: '#5a3a20', band: '#5a3a20', inner: '#ddd2ba' },
  { robe: '#4a3a4e', wrap: '#e4dccc', skin: '#9a6a4c', trim: '#c8b48a', band: '#c8b48a', inner: '#e0d8c6' }];
const BOY35 = { robe: '#3f7090', wrap: '#e6dabe', skin: '#a8714f', trim: '#e2c27a', band: '#e2c27a', inner: '#e4dac4', child: true };
const KING35 = { robe: '#7a1622', wrap: '#d8b878', skin: '#a8714f', trim: '#e0b85a', band: '#e0b85a', inner: '#c8a070' };
const MAGE35 = { robe: '#2c2236', wrap: '#4c3c50', skin: '#8f5f42', trim: '#9a7a4a', band: '#9a7a4a', inner: '#5a4a5c', agal: false };
const MONK35 = { robe: '#5a4430', wrap: '#5e4a36', skin: '#a07050', trim: '#3a2a1a', band: '#3a2a1a', inner: '#8a7660', agal: false };
const COURT35 = { robe: '#1e4a4c', wrap: '#ece2cc', skin: '#a8714f', trim: '#d8b45a', band: '#d8b45a', inner: '#e4dac4' };
const MOTHER35 = { robe: '#5a2a3a', wrap: '#3a2632', skin: '#a8714f', trim: '#c9a35a', band: '#c9a35a', inner: '#7a5a5e', covered: true, agal: false };
const SOLD35 = [
  { robe: '#4a3a2a', wrap: '#6a4a30', skin: '#9a6a4c', trim: '#a8843a', band: '#7a2a22', inner: '#8a7a60' },
  { robe: '#3a3430', wrap: '#7a3a2a', skin: '#a8714f', trim: '#8a8478', band: '#5a2a1a', inner: '#7a7060' },
  { robe: '#5a3422', wrap: '#4a4038', skin: '#94664a', trim: '#b8944a', band: '#3a2a1a', inner: '#8a7660' },
  { robe: '#2e3434', wrap: '#6a4a30', skin: '#b07a58', trim: '#8a7a5a', band: '#8a2a22', inner: '#7a7464' }];
function sold35(c, i, o) { fig(c, SOLD35[((i % 4) + 4) % 4], o); if (!o.noSpear && (o.pose || 'stand') === 'stand' && !o.armUp && !o.reach) spearOf(c, o); }
function king35(c, o) { fig(c, KING35, o); const [hx, hy, r] = headOf(o); crown(c, hx + (o.dir || 1) * r * 0.08, hy - r * 0.55, r * 1.05, 1); }
const DUSK35 = { sky: 'dusk', to: 'gold', k: 0.45, sunA: 0.6, sunX: 780, sunY: 1150, lamp: 0.4, haze: '#f0b0a0' };
const DAY35 = { sky: 'day', to: 'gold', k: 0.3, sunA: 0.6, sunX: 860, sunY: 980, haze: '#f0dcc4' };
const NIGHT35 = { sky: 'night', stars: 0.8, moon: 0.6, moonX: 840, moonY: 420, night: 1, lamp: 0.8, haze: '#2a2a48' };
const DAWN35 = { sky: 'dawn', to: 'gold', k: 0.35, sunA: 0.7, sunX: 300, sunY: 1120, haze: '#f0d0b8' };

// ---------- Najran (according to the exegetes): Yemeni ranges, a tell of tower houses, palms, the open plain in front (the « one plain » of the hadith)
const tellY35 = x => 1300 - 70 * Math.exp(-Math.pow((x - 300) / 520, 2));
function najranCity35(c, T, nt, lamp) {
  const g = c.createLinearGradient(0, 1220, 0, 1440); g.addColorStop(0, mix('#c8a078', '#2a2636', nt * 0.8)); g.addColorStop(1, mix('#b08a62', '#24202e', nt * 0.8)); c.fillStyle = g;
  c.beginPath(); c.moveTo(-2600, 1700); for (let x = -2600; x <= 3700; x += 20) c.lineTo(x, tellY35(x)); c.lineTo(3700, 1700); c.closePath(); c.fill();
  const r = rng(SEED35 + 5), L = [];
  for (let i = 0; i < 22; i++) { const x = -900 + i * 150 + r() * 60, near = Math.exp(-Math.pow((x - 300) / 600, 2)), h = 60 + near * 100 + r() * 60, w = 70 + r() * 40, col = mix('#9a6040', '#c08a5a', r()), sd = SEED35 + 6 + i, lw = r(), lw2 = r(); L.push({ x, h, w, col, sd, lw, lw2 }); }
  L.forEach(p => { towerHouse(c, p.x, tellY35(p.x) + 6, p.w, p.h, mix(p.col, '#22202c', nt * 0.75), p.sd, T);
    if (lamp > 0 && p.lw > 0.35) { c.save(); c.globalCompositeOperation = 'lighter'; const wy = tellY35(p.x) - p.h * (0.35 + 0.4 * p.lw2); glow(c, p.x + p.w * 0.1, wy, 26, '#ffc070', 0.55 * lamp); c.fillStyle = `rgba(255,210,140,${0.8 * lamp})`; c.fillRect(p.x + p.w * 0.1 - 4, wy - 6, 8, 12); c.restore(); } });
  if (nt > 0) { c.fillStyle = `rgba(8,10,26,${0.32 * nt})`; c.fillRect(-2600, 900, 6300, 800); }
}
function najran35(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 8) : [0, 0]));
  const px = o.px || 0, nt = o.night || 0, hz = mix(o.haze || '#f0c8a8', '#22243c', nt * 0.6);
  sky0(c, skyStops(o.sky || 'gold', o.to, o.k || 0));
  if (o.stars) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); stars(c, T, 160, SEED35 + 3, [0, 0, W, 1000], o.stars); c.restore(); }
  if (o.moon) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); moon(c, o.moonX || 820, o.moonY || 400, 42, o.moon); c.restore(); }
  if (o.sunA) bigSun30(c, o.sunX === undefined ? 820 : o.sunX, o.sunY === undefined ? 1000 : o.sunY, 46, o.sunCol || '#ffd08a', o.sunA);
  cloudBank(c, T, 300, 6, mix('#ffe6cc', '#22243c', nt), 0.13 * (1 - nt * 0.7), SEED35 + 4, 6);
  par(c, -0.85, px, 0, () => { ridgeW(c, 1060, 300, 0.0019, SEED35 + 1, mix('#8a7a9a', '#141628', nt));
    c.save(); c.globalAlpha = 0.3 * (1 - nt * 0.7); c.strokeStyle = '#fff0e0'; c.lineWidth = 3; c.beginPath(); for (let x = -2400; x <= 3400; x += 18) { const yy = ridgeY(x, 1060, 300, 0.0019, SEED35 + 1) + 5; x === -2400 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); c.restore();
    hazeW(c, 1110, 280, hz, 0.5 * (1 - nt * 0.6)); });
  par(c, -0.6, px, 0, () => { ridgeW(c, 1175, 170, 0.003, SEED35 + 2, mix('#86705a', '#161422', nt));
    c.strokeStyle = hexA(mix('#4a3a24', '#0a0a14', nt), 0.3); c.lineWidth = 2; for (let k = 0; k < 8; k++) { c.beginPath(); for (let x = -2400; x <= 3400; x += 24) { const yy = ridgeY(x, 1175, 170, 0.003, SEED35 + 2) + 16 + k * 18; x === -2400 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); } // terraced slopes
    hazeW(c, 1235, 160, hz, 0.42 * (1 - nt * 0.6)); });
  par(c, -0.35, px, 0, () => { najranCity35(c, T, nt, o.lamp || 0);
    for (let i = 0, r = rng(SEED35 + 40); i < 18; i++) { const x = -1300 + i * 250 + r() * 90; palm33(c, x, 1316 + r() * 10, 0.55 + r() * 0.14, T, SEED35 + 41 + i, 0, { night: nt }); }
    hazeW(c, 1330, 80, hz, 0.25 * (1 - nt * 0.6)); });
  par(c, 0, px, 0, () => { // the open plain
    const earth = mix('#c9a272', '#2a2634', nt * 0.82), g = c.createLinearGradient(0, 1320, 0, H + 300); g.addColorStop(0, mix(earth, '#fff0d4', 0.14 * (1 - nt))); g.addColorStop(0.4, earth); g.addColorStop(1, mix(earth, '#140a04', 0.5));
    c.fillStyle = g; c.fillRect(-2600, 1322, 6300, H + 1400);
    c.fillStyle = hexA(mix(earth, '#4a3420', 0.5), 0.5); c.fillRect(-2600, 1320, 6300, 4);
    const r = rng(SEED35 + 30); for (let i = 0; i < 170; i++) { const q = Math.pow(r(), 1.5), yy = 1340 + q * (H + 200 - 1340), x = -1500 + r() * 4100, sz = 2 + q * 13, cv = r();
      c.fillStyle = hexA(mix(earth, cv > 0.6 ? '#2a1a10' : '#fff0d8', 0.4), 0.5); c.beginPath(); c.ellipse(x, yy, sz, sz * 0.42, 0, 0, 6.283); c.fill(); }
    c.strokeStyle = hexA(mix(earth, '#2a1a0c', 0.5), 0.16); c.lineWidth = 2; for (let k = 0; k < 7; k++) { c.beginPath(); c.moveTo(-1500, 1360 + k * k * 15); c.quadraticCurveTo(540, 1350 + k * k * 15 + 18, 2600, 1362 + k * k * 15); c.stroke(); }
    for (let i = 0, rr = rng(SEED35 + 31); i < 16; i++) { const q = rr(), yy = 1360 + q * 640, x = -1200 + rr() * 3400; if (Math.abs(x - 540) < 420) continue; shrub(c, x, yy, 0.3 + q * 0.7, mix('#7a7a3a', '#1a2020', nt * 0.75), T, i + 5); }
    if (o.torches) o.torches.forEach(([x, y, s], i) => torch(c, x, y, T + i, i, s || 1));
    if (o.props) o.props(c); });
  if (o.light) lightFromAbove(c, T, o.lightX || 540, o.light, o.lightW || 380);
  par(c, 0, px, 0, () => { if (o.walkers) o.walkers(c); });
  if (o.post) o.post(c);
  if (nt && o.vignette !== false) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const v = c.createRadialGradient(W / 2, H * 0.58, H * 0.2, W / 2, H * 0.55, H * 0.75); v.addColorStop(0, 'rgba(4,4,12,0)'); v.addColorStop(1, `rgba(4,4,12,${0.55 * nt})`); c.fillStyle = v; c.fillRect(0, 0, W, H); c.restore(); }
  if (o.tint) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = o.tint; c.fillRect(0, 0, W, H); c.restore(); }
  if (o.fg !== false) blurLayer(c, 10, bc => { rock(bc, -80, 2150, 380, 210, mix('#8a6248', '#16141c', nt * 0.85), SEED35 + 45); shrub(bc, 1130, 2130, 3.0, mix('#5a5a2a', '#101418', nt * 0.8), T, 9); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- the palm trunk (al-jidh', the hadith): a bare trunk standing as a post; ring scars, cut top. Origin = foot. ~520*s tall
function trunk35(c, x, y, s, T, o = {}) { c.save(); c.translate(x, y); c.scale(s, s); const nt = o.night || 0;
  c.fillStyle = 'rgba(10,6,4,0.32)'; c.beginPath(); c.ellipse(4, 2, 70, 10, 0, 0, 6.283); c.fill();
  const col = mix('#7a5a3a', '#1c1a22', nt * 0.7), g = c.createLinearGradient(-26, 0, 26, 0); g.addColorStop(0, mix(col, '#000000', 0.35)); g.addColorStop(0.4, mix(col, '#ffe0b0', 0.18)); g.addColorStop(1, mix(col, '#000000', 0.5));
  c.fillStyle = g; c.beginPath(); c.moveTo(-28, 0); c.quadraticCurveTo(-30, -60, -24, -110); c.lineTo(-19, -520); c.lineTo(19, -520); c.lineTo(24, -110); c.quadraticCurveTo(30, -60, 28, 0); c.closePath(); c.fill();
  c.strokeStyle = hexA(mix(col, '#000000', 0.55), 0.6); c.lineWidth = 3; for (let k = 0; k < 19; k++) { const yy = -14 - k * 27, w = lerp(27, 19, k / 19); c.beginPath(); c.moveTo(-w, yy); c.quadraticCurveTo(0, yy + 9, w, yy - 3); c.stroke(); }
  c.strokeStyle = hexA(mix(col, '#fff0d0', 0.4), 0.35); c.lineWidth = 2; for (let k = 0; k < 19; k++) { const yy = -20 - k * 27, w = lerp(25, 17, k / 19); c.beginPath(); c.moveTo(-w * 0.6, yy + 2); c.quadraticCurveTo(-w * 0.1, yy + 7, w * 0.3, yy + 3); c.stroke(); }
  c.fillStyle = mix(col, '#e8c89a', 0.35); c.beginPath(); c.ellipse(0, -520, 19, 6, 0, 0, 6.283); c.fill();
  c.restore(); }
// the rope around the boy and the trunk (two loops, at the chest and the knees)
function tied35(c, o, k = 1) { if (k <= 0) return; const s = o.h / 300 * 0.82; c.save(); c.globalAlpha *= k; c.strokeStyle = '#a8865a'; c.lineCap = 'round';
  [[-196, 1], [-92, 0.9]].forEach(([yy, wk]) => { const y = o.y + yy * s; c.lineWidth = 6 * s; c.beginPath(); c.moveTo(o.x - 46 * s, y + 4 * s); c.quadraticCurveTo(o.x, y + 16 * s, o.x + 50 * s * wk, y + 2 * s); c.stroke();
    c.strokeStyle = 'rgba(60,40,20,0.5)'; c.lineWidth = 2 * s; c.beginPath(); c.moveTo(o.x - 44 * s, y + 8 * s); c.quadraticCurveTo(o.x, y + 19 * s, o.x + 48 * s * wk, y + 6 * s); c.stroke(); c.strokeStyle = '#a8865a'; });
  c.restore(); }
// the boy tied to the trunk (the hero shot): trunk, boy in front of it, the rope; o.light = soft column of light
function boyAtTrunk35(c, x, y, s, T, o = {}) {
  if (o.light) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y - 260 * s, 380 * s, '#fff0c8', 0.35 * o.light); c.restore(); }
  trunk35(c, x, y, s, T, o);
  const b = { x, y: y + 2, h: 300 * s * 1.05, dir: o.dir || 1, t: T + 2, light: 0.95 + 0.25 * (o.light || 0), wind: 0.35, ink: 0.7 };
  fig(c, BOY35, b); tied35(c, b, o.rope === undefined ? 1 : o.rope); }

// ---------- the bow: held in the near hand of a figure (o: same object as for fig/handOf, with reach); draw 0..1 = string pulled; arrow = nocked
function bow35(c, o, draw = 0, arrow = true) { const s = (o.h || 300) / 300, d = o.dir || 1, [hx, hy] = handOf(o);
  c.save(); c.translate(hx, hy - 4 * s); c.scale(d * s, s);
  const bend = 34 + draw * 22, nx = -14 - draw * 96;
  c.strokeStyle = '#4a2a14'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(-6, -150); c.quadraticCurveTo(bend, -70, 4, 0); c.quadraticCurveTo(bend, 70, -6, 150); c.stroke();
  c.strokeStyle = '#8a5a2a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-4, -146); c.quadraticCurveTo(bend - 4, -70, 2, -8); c.stroke();
  c.fillStyle = '#c8a060'; c.fillRect(-4, -12, 12, 24); // grip
  c.strokeStyle = 'rgba(240,230,210,0.85)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-6, -150); c.lineTo(nx, 0); c.lineTo(-6, 150); c.stroke();
  if (arrow) { c.strokeStyle = '#6a4a2a'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(nx, 0); c.lineTo(58, 0); c.stroke();
    c.fillStyle = '#b8b4a8'; c.beginPath(); c.moveTo(72, 0); c.lineTo(56, -6); c.lineTo(56, 6); c.closePath(); c.fill();
    c.fillStyle = '#d8c8a8'; c.beginPath(); c.moveTo(nx + 2, 0); c.lineTo(nx + 22, -8); c.lineTo(nx + 30, 0); c.lineTo(nx + 22, 8); c.closePath(); c.fill(); }
  if (draw > 0.05) { hand(c, nx + 4, 6, 1.4, o.skin || KING35.skin, 0.9); } // the drawing hand at the nock
  c.restore(); }
// the arrow in flight: a thin shaft with a bright trail (it never reaches anyone on screen)
function arrowFly35(c, x0, y0, x1, y1, q, s = 1) { if (q <= 0 || q >= 1) return; const x = lerp(x0, x1, q), y = lerp(y0, y1, q), ang = Math.atan2(y1 - y0, x1 - x0);
  c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(x0 + (x - x0) * 0.4, y0 + (y - y0) * 0.4, x, y); g.addColorStop(0, 'rgba(255,240,210,0)'); g.addColorStop(1, 'rgba(255,240,210,0.7)');
  c.strokeStyle = g; c.lineWidth = 5 * s; c.beginPath(); c.moveTo(x0 + (x - x0) * 0.4, y0 + (y - y0) * 0.4); c.lineTo(x, y); c.stroke(); c.restore();
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s); c.strokeStyle = '#4a2e18'; c.lineWidth = 4; c.beginPath(); c.moveTo(-110, 0); c.lineTo(0, 0); c.stroke();
  c.fillStyle = '#c8c4b8'; c.beginPath(); c.moveTo(16, 0); c.lineTo(-2, -7); c.lineTo(-2, 7); c.closePath(); c.fill(); c.fillStyle = '#e0d0b0'; c.beginPath(); c.moveTo(-110, 0); c.lineTo(-88, -9); c.lineTo(-80, 0); c.lineTo(-88, 9); c.closePath(); c.fill(); c.restore(); }
// the boy's quiver (« take an arrow from my quiver »): leather tube with strap and fletchings; pull 0..1 = one arrow drawn out by a hand
function quiver35(c, x, y, s, T, pull = 0) { c.save(); c.translate(x, y); c.rotate(-0.18); c.scale(s, s);
  const arrows = [[-26, -8], [-10, 4], [8, -4], [24, 6]];
  arrows.forEach(([ax, ay], i) => { const up = i === 2 ? pull * 260 : 0; c.strokeStyle = '#6a4a2a'; c.lineWidth = 6; c.beginPath(); c.moveTo(ax, -250 + ay - up); c.lineTo(ax, -60); c.stroke();
    c.fillStyle = ['#e8dcc0', '#c8a878', '#f0e6d0', '#b89068'][i]; c.beginPath(); c.moveTo(ax, -250 + ay - up); c.lineTo(ax - 12, -230 + ay - up); c.lineTo(ax - 12, -190 + ay - up); c.lineTo(ax, -204 + ay - up); c.lineTo(ax + 12, -190 + ay - up); c.lineTo(ax + 12, -230 + ay - up); c.closePath(); c.fill();
    if (i === 2 && pull > 0.3) { c.fillStyle = '#c8c4b8'; c.beginPath(); c.moveTo(ax, 40 - up + 30); c.lineTo(ax - 9, 40 - up + 8); c.lineTo(ax + 9, 40 - up + 8); c.closePath(); c.fill(); c.strokeStyle = '#6a4a2a'; c.lineWidth = 6; c.beginPath(); c.moveTo(ax, -60 - up); c.lineTo(ax, 40 - up + 8); c.stroke(); } });
  const g = c.createLinearGradient(-50, 0, 50, 0); g.addColorStop(0, '#4a2a16'); g.addColorStop(0.45, '#9a6234'); g.addColorStop(1, '#3a200e');
  c.fillStyle = g; c.beginPath(); c.moveTo(-46, -150); c.quadraticCurveTo(0, -164, 46, -150); c.lineTo(38, 170); c.quadraticCurveTo(0, 186, -38, 170); c.closePath(); c.fill();
  c.fillStyle = '#2a1608'; c.beginPath(); c.ellipse(0, -152, 46, 12, 0, 0, 6.283); c.fill();
  c.strokeStyle = '#d8b060'; c.lineWidth = 5; [-110, 120].forEach(yy => { c.beginPath(); c.moveTo(-44, yy); c.quadraticCurveTo(0, yy + 12, 44, yy); c.stroke(); });
  c.strokeStyle = 'rgba(255,230,190,0.18)'; c.lineWidth = 8; c.beginPath(); c.moveTo(-18, -130); c.lineTo(-14, 160); c.stroke();
  c.strokeStyle = '#5a3418'; c.lineWidth = 10; c.beginPath(); c.moveTo(-44, -120); c.quadraticCurveTo(-140, -20, -46, 140); c.stroke(); // strap
  c.restore(); }

// ---------- the monk's cell outside the town (a stone hut against a rock, arched door with lamp light, a mat in front)
function cell35(c, x, y, s, T, o = {}) { c.save(); c.translate(x, y); c.scale(s, s); const nt = o.night || 0, lamp = o.lamp === undefined ? 0.6 : o.lamp;
  rock(c, -60, 10, 560, 420, mix('#8a6a52', '#1a1820', nt * 0.8), SEED35 + 60);
  const st = mix('#b89a78', '#2a2632', nt * 0.75), dk = mix(st, '#140c08', 0.45), lt = mix(st, '#fff0d8', 0.25);
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(20, 6, 230, 18, 0, 0, 6.283); c.fill();
  c.fillStyle = st; c.beginPath(); c.moveTo(-180, 0); c.lineTo(-170, -230); c.quadraticCurveTo(0, -300, 180, -236); c.lineTo(190, 0); c.closePath(); c.fill();
  c.fillStyle = dk; c.beginPath(); c.moveTo(120, 0); c.lineTo(126, -240); c.quadraticCurveTo(160, -238, 180, -236); c.lineTo(190, 0); c.closePath(); c.fill();
  const r = rng(SEED35 + 61); c.strokeStyle = hexA(dk, 0.55); c.lineWidth = 2; for (let k = 0; k < 7; k++) { const yy = -20 - k * 32; c.beginPath(); c.moveTo(-176, yy); c.lineTo(186, yy - 2); c.stroke(); for (let j = 0; j < 6; j++) { const xx = -170 + j * 60 + (k % 2) * 30 + r() * 10; c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx, yy - 32); c.stroke(); } }
  c.fillStyle = hexA(lt, 0.6); c.beginPath(); c.moveTo(-170, -230); c.quadraticCurveTo(0, -300, 180, -236); c.lineTo(180, -226); c.quadraticCurveTo(0, -288, -170, -220); c.closePath(); c.fill();
  c.fillStyle = '#140a06'; c.beginPath(); archPath(c, -20, 0, 104, 170); c.fill(); // door
  if (lamp > 0) { c.save(); c.beginPath(); archPath(c, -20, 0, 104, 170); c.clip(); c.fillStyle = `rgba(255,190,110,${0.55 * lamp})`; c.fillRect(-80, -180, 120, 180); c.restore(); c.save(); c.globalCompositeOperation = 'lighter'; glow(c, -20, -70, 200, '#ffb060', 0.35 * lamp * (0.92 + 0.08 * Math.sin((T + 100) * 7))); c.restore(); }
  c.fillStyle = '#140a06'; c.fillRect(90, -170, 30, 40); // small window
  rug(c, -20, 60, 300, 50, mix('#7a3a2a', '#2a1a20', nt * 0.6));
  jar(c, 150, 8, 0.6, mix('#a8603a', '#2a2028', nt * 0.6));
  c.restore(); }

// ---------- the trench (al-ukhdud): a long pit across the plain (x0..x1 at depth y, opening d px deep on screen); dig 0..1 = length dug (from x0),
// k 0..1 = fire. Flames rise from inside, the near lip hides their foot; smoke; sparks. Seen only from a distance: never anyone in it.
function trench35(c, T, x0, x1, y, d, o = {}) { T += 100; const dig = o.dig === undefined ? 1 : o.dig, k = o.k || 0, nt = o.night || 0, xe = lerp(x0, x1, dig);
  if (xe - x0 < 4) return;
  const earth = mix('#a8805a', '#2a2430', nt * 0.75), dk = mix(earth, '#0a0604', 0.6);
  // far mound of dug earth
  c.fillStyle = mix(earth, '#fff0d0', 0.1); c.beginPath(); c.moveTo(x0 - 30, y - d * 0.5); for (let x = x0 - 30; x <= xe + 30; x += 20) c.lineTo(x, y - d * 0.5 - 16 - Math.sin(x * 0.05) * 5); c.lineTo(xe + 30, y - d * 0.5); c.closePath(); c.fill();
  // the pit
  c.fillStyle = mix(dk, '#ff6a20', 0.75 * k); c.beginPath(); c.moveTo(x0, y - d * 0.5); c.lineTo(xe, y - d * 0.5); c.lineTo(xe, y + d * 0.5); c.lineTo(x0, y + d * 0.5); c.closePath(); c.fill();
  if (k > 0) { const g = c.createLinearGradient(0, y - d * 0.5, 0, y + d * 0.5); g.addColorStop(0, `rgba(255,200,90,${0.9 * k})`); g.addColorStop(1, `rgba(200,50,10,${0.6 * k})`); c.fillStyle = g; c.fillRect(x0, y - d * 0.5, xe - x0, d);
    c.save(); c.globalCompositeOperation = 'lighter'; for (let x = x0; x < xe; x += 160) glow(c, x + 80, y - d, 260, '#ff8a30', 0.18 * k); c.restore();
    // flame tongues along the trench (behind the near lip)
    const r = rng(SEED35 + 70), n = Math.floor((xe - x0) / 14);
    for (let i = 0; i < n; i++) { const fx = x0 + 6 + i * 14 + r() * 8, ph = r() * 6.28, sp = 3 + r() * 3, hh = (40 + r() * 70) * (o.fs || 1) * k * (0.75 + 0.25 * Math.sin(T * sp + ph)), w = 10 + r() * 8;
      const fg = c.createLinearGradient(0, y + d * 0.4, 0, y + d * 0.4 - hh); fg.addColorStop(0, `rgba(255,236,170,${0.95 * k})`); fg.addColorStop(0.5, `rgba(255,140,40,${0.85 * k})`); fg.addColorStop(1, 'rgba(200,40,10,0)');
      c.fillStyle = fg; const sw = Math.sin(T * 4 + ph) * w * 0.6; c.beginPath(); c.moveTo(fx - w, y + d * 0.4); c.quadraticCurveTo(fx - w * 0.8 + sw, y + d * 0.4 - hh * 0.6, fx + sw * 1.4, y + d * 0.4 - hh); c.quadraticCurveTo(fx + w * 0.8 + sw, y + d * 0.4 - hh * 0.6, fx + w, y + d * 0.4); c.closePath(); c.fill(); }
    sparks(c, T, (x0 + xe) / 2, y - d * 0.3, Math.floor(12 + 20 * k), SEED35 + 71, 0.8 * k, (xe - x0) / 260); }
  // near lip + a thin bank of earth (hides the foot of the flames)
  const lg = c.createLinearGradient(0, y + d * 0.3, 0, y + d * 0.5 + 18); lg.addColorStop(0, mix(earth, '#ffb060', 0.35 * k)); lg.addColorStop(1, earth); c.fillStyle = lg;
  c.beginPath(); c.moveTo(x0 - 40, y + d * 0.5 + 20); c.lineTo(x0 - 20, y + d * 0.38); for (let x = x0; x <= xe; x += 20) c.lineTo(x, y + d * 0.38 + Math.sin(x * 0.07) * 3); c.lineTo(xe + 20, y + d * 0.38); c.lineTo(xe + 40, y + d * 0.5 + 20); c.closePath(); c.fill();
  if (!o.noEnd) { c.fillStyle = mix(earth, '#000000', 0.3); c.beginPath(); c.ellipse(xe, y, 10, d * 0.5, 0, 0, 6.283); c.fill(); }
  if (o.smoke !== false && k > 0) for (let i = 0; i < 4; i++) smoke(c, T, lerp(x0, xe, (i + 0.5) / 4), y - d * 0.6, 5, SEED35 + 72 + i, mix('#3a3034', '#1a1418', nt), 0.25 * k, 1.2, 70); }
// the orange light of the fire on the whole frame (from below)
function fireLight35(c, k, y = H) { if (k <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(0, y, 0, y - 1300); g.addColorStop(0, `rgba(255,110,40,${0.28 * k})`); g.addColorStop(1, 'rgba(255,110,40,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }

// ---------- the mountain top (the soldiers take the boy up to throw him down): a broad rocky summit, a cliff dropping on the right,
// the plain and Najran far below. sumY35 = ground line (the slope rises from the left, flat top, then the drop).
const sumY35 = x => x < 250 ? 1560 + Math.pow((250 - x) / 600, 1.1) * 420 + Math.sin(x * 0.012) * 8 : x < 720 ? 1560 + Math.sin(x * 0.012) * 8 : 1560 + Math.sin(720 * 0.012) * 8 + Math.pow((x - 720) / 220, 2) * 420;
function summit35(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 10) : [0, 0]));
  const nt = o.night || 0;
  sky0(c, skyStops(o.sky || 'gold', o.to, o.k || 0));
  if (o.sunA) bigSun30(c, o.sunX === undefined ? 240 : o.sunX, o.sunY === undefined ? 900 : o.sunY, 44, '#ffd08a', o.sunA);
  cloudBank(c, T, 700, 6, '#fff0dc', 0.18, SEED35 + 80, 8);
  par(c, -0.9, 0, 0, () => { ridgeW(c, 1250, 120, 0.0026, SEED35 + 81, mix('#9a8aa8', '#141628', nt)); hazeW(c, 1290, 260, mix('#f2d0b0', '#222440', nt), 0.6); // far plain far below
    c.fillStyle = mix('#c8a882', '#2a2834', nt * 0.8); c.fillRect(-2600, 1290, 6300, 1800); c.save(); c.translate(900, 1330); c.scale(0.18, 0.18); c.translate(-300, -1300); najranCity35(c, T, nt, 0); c.restore(); hazeW(c, 1420, 160, '#f2d8c0', 0.55); });
  wisps(c, T, 1150, 5, '#fff6ea', 0.25, SEED35 + 82, 10);
  const rc = mix('#9a7a5e', '#1a1820', nt * 0.85), lt = mix('#f0c89c', '#3a3448', nt * 0.85), sh = mix('#3a2a26', '#0a0a10', nt);
  const path = () => { c.beginPath(); c.moveTo(-2000, H + 900); for (let x = -2000; x <= 1400; x += 10) c.lineTo(x, sumY35(x)); c.lineTo(1400, H + 900); c.closePath(); };
  path(); const g = c.createLinearGradient(0, 1500, 0, H + 300); g.addColorStop(0, mix(rc, lt, 0.35)); g.addColorStop(0.5, rc); g.addColorStop(1, mix(rc, '#140c08', 0.5)); c.fillStyle = g; c.fill();
  c.save(); path(); c.clip(); const r = rng(SEED35 + 83);
  for (let k = 0; k < 16; k++) { const yy = 1600 + k * 40; c.strokeStyle = hexA(k % 2 ? sh : lt, 0.12); c.lineWidth = 3; c.beginPath(); for (let x = -2000; x <= 1400; x += 24) { const v = yy + (x - 500) * 0.05 + noise1(x * 0.01, k + 60) * 12; x === -2000 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); }
  const cg = c.createLinearGradient(700, 0, 1300, 0); cg.addColorStop(0, hexA(sh, 0)); cg.addColorStop(1, hexA(sh, 0.65)); c.fillStyle = cg; c.fillRect(700, 1400, 700, 1200); // the shaded cliff face
  for (let i = 0; i < 40; i++) { const x = -1600 + r() * 2900, y = sumY35(x) + 20 + Math.pow(r(), 1.6) * 360; c.fillStyle = mix('#7a6450', '#141218', nt * 0.8); c.beginPath(); c.ellipse(x, y, 10 + r() * 16, 5 + r() * 6, 0, 0, 6.283); c.fill(); }
  c.restore();
  c.strokeStyle = hexA(lt, 0.5); c.lineWidth = 3; c.beginPath(); for (let x = -2000; x <= 1400; x += 10) x === -2000 ? c.moveTo(x, sumY35(x) + 1) : c.lineTo(x, sumY35(x) + 1); c.stroke();
  for (let i = 0; i < 6; i++) shrub(c, -500 + i * 190, sumY35(-500 + i * 190) + 4, 0.5, mix('#5a6a3a', '#101410', nt), T, SEED35 + 84 + i);
  if (o.light) lightFromAbove(c, T, o.lightX || 480, o.light, o.lightW || 300);
  if (o.walkers) o.walkers(c);
  if (o.post) o.post(c);
  if (o.fg !== false) blurLayer(c, 9, bc => { boulder(bc, -60, 2090, 360, 140, mix('#7a6450', '#141218', nt * 0.8), SEED35 + 86); shrub(bc, 1130, 2120, 2.8, mix('#5a5a2a', '#101418', nt * 0.8), T, 7); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// the mountain seen from far (it shakes; dust rolls off the top; pebbles roll down): no one is shown falling
function peak35(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 10) : [0, 0]));
  sky0(c, skyStops(o.sky || 'gold', o.to || 'dusk', o.k || 0.3));
  bigSun30(c, 230, 980, 44, '#ffd08a', 0.6); cloudBank(c, T, 320, 6, '#fff0dc', 0.14, SEED35 + 90, 6);
  par(c, -0.6, 0, 0, () => { ridgeW(c, 1180, 160, 0.0024, SEED35 + 91, '#8a7a96'); hazeW(c, 1220, 200, '#f2c8a8', 0.5); });
  const pk = x => 1420 - 760 * Math.exp(-Math.pow((x - 560) / 330, 2)) - 40 * Math.exp(-Math.pow((x - 300) / 140, 2)) + noise1(x * 0.02, 92) * 14;
  const rc = '#8a6a56', lt = '#f0c89c', sh = '#3a2a2a';
  c.beginPath(); c.moveTo(-1600, 1700); for (let x = -1600; x <= 2700; x += 10) c.lineTo(x, pk(x)); c.lineTo(2700, 1700); c.closePath();
  const g = c.createLinearGradient(200, 0, 900, 0); g.addColorStop(0, mix(rc, lt, 0.35)); g.addColorStop(0.5, rc); g.addColorStop(1, mix(rc, sh, 0.5)); c.fillStyle = g; c.fill();
  c.save(); c.clip(); const r = rng(SEED35 + 93); for (let i = 0; i < 22; i++) { const x = 300 + r() * 540, y0 = pk(x); c.strokeStyle = hexA(r() > 0.5 ? sh : lt, 0.25); c.lineWidth = 3; c.beginPath(); c.moveTo(x, y0 + 6); c.quadraticCurveTo(x + (x - 560) * 0.3, y0 + 200, x + (x - 560) * 0.6 + r() * 30, y0 + 420); c.stroke(); }
  for (let k = 0; k < 12; k++) { c.strokeStyle = hexA(k % 2 ? sh : lt, 0.1); c.lineWidth = 3; c.beginPath(); for (let x = -1600; x <= 2700; x += 24) { const v = 900 + k * 50 + (x - 600) * 0.05; x === -1600 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); } c.restore();
  if (o.fall) { const rr = rng(SEED35 + 94); for (let i = 0; i < 14; i++) { const q = ((o.fall * 1.6 + rr()) % 1), x = 560 + (rr() - 0.5) * 140 + (rr() > 0.5 ? 1 : -1) * q * 260, y = pk(560) + 30 + q * 560; c.fillStyle = 'rgba(70,52,40,0.85)'; c.beginPath(); c.ellipse(x, y, 6 + rr() * 6, 5, q * 6, 0, 6.283); c.fill(); } }
  bigDust(c, T, 560, pk(560) + 40, 0.42, o.dust || 0, SEED35 + 95);
  par(c, 0, 0, 0, () => { const gg = c.createLinearGradient(0, 1400, 0, H + 200); gg.addColorStop(0, '#b89468'); gg.addColorStop(1, '#5a4028'); c.fillStyle = gg; c.beginPath(); c.moveTo(-1600, H + 400); for (let x = -1600; x <= 2700; x += 20) c.lineTo(x, 1560 + Math.sin(x * 0.004) * 30); c.lineTo(2700, H + 400); c.closePath(); c.fill();
    for (let i = 0, r2 = rng(SEED35 + 96); i < 12; i++) shrub(c, -300 + i * 140 + r2() * 60, 1590 + r2() * 260, 0.6 + r2() * 0.6, '#5a6a3a', T, i + 30); });
  blurLayer(c, 9, bc => fgBrush(bc, T, {}), 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- the sea: the soldiers' boat in the open sea (seaSet27 + boat27); o.rot = heel, o.storm = dark squall, o.splash, o.beach = the shore
function sea35(c, T, o = {}) {
  cam(c, (o.z || 1), o.cx || 540, o.cy || 1200, ...(o.shake ? shake(T, o.shake, 8) : [0, 0]));
  const sk = o.sky || 'gold', st = o.storm || 0;
  seaSet27(c, T, { sky: sk, to: o.to, k: o.k, sunX: 860, sunY: SEAY - 170, sunA: 1 - st * 0.8, glit: 0.55 * (1 - st), sails: !o.beach && st < 0.2, birds: st < 0.2 });
  if (st > 0) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(24,26,40,${0.7 * st})`); g.addColorStop(0.55, `rgba(30,36,50,${0.45 * st})`); g.addColorStop(1, `rgba(10,16,26,${0.4 * st})`); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }
  if (!o.beach) {
    const BX = o.bx || 540, WL = 1440, S = o.s || 0.9;
    boat27(c, BX, WL + (o.sink || 0) * 60, S, T, { rot: o.rot || 0, crew: (cc, dy) => {
      sold35(cc, 0, { x: -330, y: dy(-330), h: 300, dir: 1, t: T, light: 0.85, wind: 0.6, ink: 0.8, noSpear: true, reach: o.oar ? 0.5 : 0 });
      sold35(cc, 1, { x: -170, y: dy(-170), h: 305, dir: 1, t: T + 1, light: 0.85, wind: 0.6, ink: 0.8 });
      fig(cc, BOY35, { x: 70, y: dy(70), h: 330, dir: 1, t: T + 2, light: 1.0 + 0.2 * (o.pray || 0), wind: 0.7, ink: 0.75, dua: (o.pray || 0) > 0.5 });
      sold35(cc, 2, { x: 300, y: dy(300), h: 300, dir: -1, t: T + 3, light: 0.85, wind: 0.6, ink: 0.8 }); } });
    if (o.pray) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, BX + 70 * S, WL - 400 * S, 220, '#fff0c8', 0.3 * o.pray); c.restore(); }
    seaFront27(c, T, WL + 10, BX - 470 * S, BX + 500 * S, { sky: sk, to: o.to, k: o.k, sunX: 860 });
    if (o.splash) { splash27(c, BX + 300, WL - 40, o.splash, 2.4); splash27(c, BX - 260, WL - 20, clamp(o.splash * 1.2 - 0.1), 2); }
  } else { // the beach: wet sand, foam line, the boy walking alone (o.walkers)
    const sy = x => 1600 + Math.sin(x * 0.004) * 20;
    c.fillStyle = 'rgba(240,250,255,0.55)'; c.beginPath(); c.moveTo(-1600, sy(-1600) - 10); for (let x = -1600; x <= 2700; x += 20) c.lineTo(x, sy(x) - 10 + Math.sin(T * 1.6 + x * 0.02) * 6); c.lineTo(2700, sy(2700) + 14); c.lineTo(-1600, sy(-1600) + 14); c.closePath(); c.fill();
    const g = c.createLinearGradient(0, 1590, 0, H + 200); g.addColorStop(0, '#a88e6c'); g.addColorStop(0.15, '#d6b88e'); g.addColorStop(1, '#8a6c4a'); c.fillStyle = g;
    c.beginPath(); c.moveTo(-1600, H + 400); for (let x = -1600; x <= 2700; x += 20) c.lineTo(x, sy(x)); c.lineTo(2700, H + 400); c.closePath(); c.fill();
    const r = rng(SEED35 + 100); for (let i = 0; i < 70; i++) { const x = -800 + r() * 2600, y = sy(x) + 10 + Math.pow(r(), 1.4) * 360; c.fillStyle = hexA(r() > 0.5 ? '#6a5038' : '#f6e6c8', 0.5); c.beginPath(); c.ellipse(x, y, 3 + r() * 7, 2 + r() * 3, 0, 0, 6.283); c.fill(); }
    if (o.walkers) o.walkers(c, sy); }
  if (o.fg !== false && !o.beach) blurLayer(c, 10, bc => { bc.save(); waves(bc, T, H + 60, 26 + st * 30, 'rgba(20,50,70,0.85)', 0.006, 1.2 + st, 2711, 'rgba(220,240,255,0.25)'); bc.restore(); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- the king's hall (hall() of episode 8, darker; the throne); the magician's room = the same hall, dim, with braziers and smoke
function court35(c, T, o = {}) {
  cam(c, (o.z || 1) + 0.004 * Math.sin(T * 0.3), o.cx || 540, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 8) : [0, 0]));
  const dim = o.dim || 0;
  hall(c, T, { fy: 1250, skyTop: mix('#6a8ab8', '#1a1830', dim), skyBot: mix('#f0d0a8', '#5a3a4a', dim) });
  if (dim > 0) { c.fillStyle = `rgba(14,8,20,${0.55 * dim})`; c.fillRect(-900, -900, W + 1800, H + 1800); }
  if (o.braziers) { [[170, 1420], [910, 1420]].forEach(([x, y], i) => { brazier(c, x, y, 0.9, T, o.braziers, SEED35 + 110 + i); smoke(c, T + 100, x, y - 220, 6, SEED35 + 112 + i, '#4a3a4a', 0.3 * o.braziers, 1, 90); });
    c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 170, 1240, 360, '#ff9040', 0.22 * o.braziers); glow(c, 910, 1240, 360, '#ff9040', 0.22 * o.braziers); c.restore(); }
  if (o.throne) throne(c, o.thX || 540, o.thY || 1330, o.thS || 0.62, T, { glow: o.thGlow || 0 });
  if (o.walkers) o.walkers(c);
  if (o.post) o.post(c);
  if (o.fg !== false) blurLayer(c, 10, bc => { column(bc, -60, 2300, 130, 1500, mix('#d8b88e', '#3a2a24', dim * 0.7)); column(bc, 1140, 2300, 130, 1500, mix('#d8b88e', '#3a2a24', dim * 0.7)); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
// the king seated on his throne in court35 (throne at thX, thY, thS)
function kingOnThrone35(c, T, o = {}) { const x = o.thX || 540, y = o.thY || 1330, s = o.thS || 0.62; king35(c, { x, y: y - 236 * s, h: 300 * s * 1.35, pose: 'sit', dir: o.dir || 1, t: T, light: 1, wind: 0.1, ink: 0.7, armUp: o.armUp || 0, dua: false }); }

// ---------- the crowd on the plain (the « one plain » of the hadith): rows facing the trunk (x = 540), an aisle in the middle
const HCROWD35 = (() => { const r = rng(SEED35 + 120), L = [];
  [[1430, 16, 84], [1470, 14, 100], [1515, 12, 120], [1580, 10, 150], [1660, 8, 190]].forEach(([y, n, gap], row) => { for (let i = 0; i < n; i++) { const x = 540 + (i - (n - 1) / 2) * gap + (r() - 0.5) * 34;
    if (row >= 1 && Math.abs(x - 540) < [0, 120, 200, 260, 320][row]) continue; L.push({ x, y: y + (r() - 0.5) * 14, f: (i * 3 + row * 5) % NAJ35.length, ph: r() * 10, row, d: r() }); } });
  return L.sort((a, b) => a.y - b.y); })();
function crowd35(c, T, o = {}) { const list = o.list || HCROWD35, fx = o.face === undefined ? 540 : o.face;
  list.forEach((p, i) => { if (o.skip && o.skip(p)) return; const h = hY35(p.y), dir = p.x < fx ? 1 : -1;
    const base = { x: p.x, y: p.y, h, dir, t: T + p.ph, light: o.light === undefined ? 0.85 : o.light, wind: 0.25, ink: 0.65 };
    const extra = o.fn ? o.fn(p, i, base) : {}; if (extra === null) return; fig(c, NAJ35[p.f], Object.assign(base, extra)); }); }

// ---------- the hero shot (hook, cta, outro, cover): the plain of Najran at dusk, the whole people gathered; the boy tied to the palm trunk in a
// soft column of light; the king on the right foreground with his bow lowered; o.cheer 0..1 = the crowd raises its arms (« we believe in the Lord of the boy »)
const HERO35 = Object.assign({}, DUSK35, { z: 1.32, cx: 540, cy: 1480, lamp: 0.5 });
function heroPeople35(T, o = {}) { const ch = o.cheer || 0; return c => {
  const drawBoy = () => { if (o.boyGone) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, 1380, 340, '#fff4d8', 0.45 * (o.boyLight || 1)); c.restore(); trunk35(c, 540, 1560, 0.8, T, {}); }
  else boyAtTrunk35(c, 540, 1560, 0.8, T, { light: o.boyLight === undefined ? 1 : o.boyLight, dir: 1 }); };
  const cf = (p, i) => ({ armUp: ch * (p.d > 0.3 ? 0.75 + 0.25 * Math.sin(T * 2.4 + i) : 0), dua: ch > 0.5 && p.d <= 0.12 });
  crowd35(c, T, { skip: p => p.y >= 1560, fn: cf }); drawBoy();
  crowd35(c, T, { skip: p => p.y < 1560 || (p.x > 700 && p.y > 1600), fn: (p, i) => ({ armUp: ch * (p.d > 0.3 ? 0.75 + 0.25 * Math.sin(T * 2.4 + i) : 0), dua: ch > 0.5 && p.d <= 0.12 }) });
  [[740, 1730, 0]].forEach(([x, y, i], j) => sold35(c, i, { x, y, h: hY35(y), dir: -1, t: T + 6 + j, light: 0.9, wind: 0.3, ink: 0.7 }));
  fig(c, COURT35, { x: 1000, y: 1780, h: hY35(1780), dir: -1, t: T + 4, light: 0.9, wind: 0.3, ink: 0.7 });
  const k = { x: 860, y: 1840, h: hY35(1840) * 0.96, dir: -1, t: T + 5, light: 1.0, wind: 0.35, ink: 0.75, reach: o.bowUp === undefined ? 0.35 : o.bowUp };
  king35(c, k); bow35(c, k, o.draw || 0, !!o.arrow); }; }
const hero35 = (c, T, o = {}) => najran35(c, T, Object.assign({}, HERO35, { light: 0.35, lightX: 540, lightW: 200, torches: [[150, 1660, 0.8], [930, 1640, 0.8]], walkers: heroPeople35(T, o) }, o));
function heroTexts35(c, a) { if (a <= 0) return; topShade(c, 1.3 * a); seriesTag35(c, a); bigWord27(c, 'TOUT UN PEUPLE', 250, a, 104); bigWord27(c, 'A CRU EN ALLAH', 360, a, 96, '#f6c453'); }
