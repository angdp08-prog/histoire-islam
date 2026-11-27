
// =====================================================================================================================
// ---------- episode 34: the Cow of the Children of Israel (Al-Baqara 67-73) · « Histoires du Coran »
// Moussa = white silhouette, face hidden by a veil of white light (MUSA). The people, the murdered man, his nephew and the owner of the
// cow are ordinary people, faceless. Allah is never depicted (light only). The murder and the slaughter are never shown: night, a door,
// a covered body; the crowd's backs, a rope on the ground. The murdered man under his shroud is warm linen, never a white veil of light.
// The nephew / the inheritance / the other clan / the man naming his killer / the price = according to the exegetes (Ibn Kathir, al-Tabari).
function seriesTag34(c, a) { textGlow(c, 'HISTOIRES DU CORAN  ·  ÉPISODE 34', W / 2, 112, '600 32px Lora', '#fbe7c6', a * 0.92, '#000000', 12); }
function ctaText34(c, a) { ctaText29(c, a); }
const SEED34 = 3400, GY34 = 1300; // horizon of the camp plain
const hY34 = y => Math.max(60, (y - GY34) * 0.95); // figure height by depth (flat ground)
const ISR34 = [
  { robe: '#6a4a2a', wrap: '#e6dcc6', skin: '#a8714f', trim: '#c9a35a', band: '#c9a35a', inner: '#e4dac2' },
  { robe: '#3a4a5e', wrap: '#ece4d2', skin: '#9a6a4c', trim: '#b8a070', band: '#b8a070', inner: '#e2dccc' },
  { robe: '#5e5a3a', wrap: '#dcd0b0', skin: '#b07a58', trim: '#8a6a3a', band: '#8a6a3a', inner: '#d8ccaa' },
  { robe: '#7a5a3a', wrap: '#e8e0cc', skin: '#94664a', trim: '#5a3a20', band: '#5a3a20', inner: '#ddd2ba' },
  { robe: '#4a3a34', wrap: '#d8ccb4', skin: '#a8714f', trim: '#a89070', band: '#a89070', inner: '#cfc4aa' },
  { robe: '#5a6a5a', wrap: '#e4dccc', skin: '#9a6a4c', trim: '#c8b48a', band: '#c8b48a', inner: '#e0d8c6' },
  { robe: '#8a6a44', wrap: '#efe6d2', skin: '#b07a58', trim: '#4a3018', band: '#4a3018', inner: '#e6dcc4' },
  { robe: '#3e4436', wrap: '#d4c8ae', skin: '#8f5f42', trim: '#9a8a62', band: '#9a8a62', inner: '#cabe9e' }];
const NEPHEW34 = { robe: '#6a1e1a', wrap: '#d8c8b0', skin: '#9a6a4c', trim: '#2a0e0a', band: '#2a0e0a', inner: '#cdbfa6' }; // the killer (dark red)
const RICH34 = { robe: '#4a2a5a', wrap: '#eee6d6', skin: '#a8714f', trim: '#d8b45a', band: '#d8b45a', inner: '#e6dccc' };   // the murdered man
const OWNER34 = { robe: '#2e5a5a', wrap: '#ece6d6', skin: '#b07a58', trim: '#d8c48a', band: '#d8c48a', inner: '#e6e0d0' };  // the owner of the cow
const MUSA34 = Object.assign({}, MUSA, { veilGlow: 0.34 });

// ---------- the cow (side view, facing right for dir 1): origin = ground under the body. s = 1 → body ~300 px long.
// o.col: 'yellow' (Al-Baqara 69: bright yellow) | 'brown' | 'old' (thin, sagging, ribs) ; o.calf = young (small, no horns) ;
// o.dist = walk driven by the distance (cowStep34) ; o.head 0..1 = grazing ; o.glow ; o.yoke = yoke on the neck ; o.halter = rope halter.
const cowStep34 = (dist, s) => dist / (150 * s);
const COWCOL34 = { yellow: ['#ffe08a', '#f2b62e', '#b87a12', '#6a400a'], brown: ['#c08a5a', '#8a5430', '#5a3218', '#2a160a'],
  old: ['#b8a894', '#8a7a68', '#5a4c40', '#2e2620'], dark: ['#7a5a44', '#4a3426', '#2a1c14', '#140c08'] };
function cowAnchor34(x, y, s, dir, o = {}) { const hd = o.head || 0, calf = o.calf ? 0.72 : 1; // muzzle point (for the halter rope)
  return [x + dir * (178 + hd * 8) * s * calf, y + (-150 + hd * 128) * s * calf]; }
function cow34(c, x, y, s, T, o = {}) {
  T += 100; const dir = o.dir || 1, P = COWCOL34[o.col || 'yellow'], old = o.col === 'old' ? 1 : 0, calf = o.calf ? 1 : 0, nt = o.night || 0, dim = o.dim || 0;
  const col = k => mix(mix(P[k], '#14141e', nt * 0.7), '#000000', dim);
  const ss = s * (calf ? 0.72 : 1);
  c.save(); c.translate(x, y); c.scale(ss * dir, ss);
  if (o.glow) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 0, -150, 320, '#ffd060', 0.28 * o.glow * (0.92 + 0.08 * Math.sin(T * 2))); c.restore(); }
  c.fillStyle = `rgba(10,6,4,${0.3 * (1 - nt * 0.4)})`; c.beginPath(); c.ellipse(4, 2, 170, 14, 0, 0, 6.283); c.fill();
  const walking = o.dist !== undefined && o.dist !== null, ph = walking ? cowStep34(o.dist, ss) * 6.283 : 0, A = walking ? 26 : 0;
  const LG = (d) => { const g = c.createLinearGradient(0, -130, 0, 0); g.addColorStop(0, mix(col(1), '#000000', d)); g.addColorStop(1, mix(col(2), '#000000', d)); return g; };
  // a leg: hip/shoulder at (lx, -118), knee/hock, hoof on the ground; stance feet slide back with the body, swing feet lift
  const leg = (lx, far, off, hind) => { const d = far ? 0.3 : 0, q = ph + off, sx = Math.sin(q) * A, lift = walking ? Math.max(0, Math.cos(q)) * 12 : 0;
    const fx = lx + sx, fy = -lift, kx = lx + sx * 0.5 + (hind ? -10 : 6), ky = -64 - lift * 0.5;
    limb(c, [lx, -140], [kx, ky], [fx, fy - 12], (hind ? 46 : 38) * (old ? 0.8 : 1), 12, LG(d));
    c.fillStyle = mix(col(3), '#000000', d); c.beginPath(); c.moveTo(fx - 10, fy - 14); c.lineTo(fx + 10, fy - 14); c.lineTo(fx + 12, fy); c.lineTo(fx - 9, fy); c.closePath(); c.fill(); // hoof
    c.strokeStyle = hexA('#000000', 0.35); c.lineWidth = 1.5; c.beginPath(); c.moveTo(fx + 1, fy - 13); c.lineTo(fx + 1, fy); c.stroke(); };
  leg(-92, true, Math.PI, true); leg(90, true, 0, false); leg(-74, false, 0, true); leg(108, false, Math.PI, false);
  // tail with its tuft
  const sw = Math.sin(T * 1.7) * 0.6 + (o.swish || 0) * Math.sin(T * 5);
  c.strokeStyle = col(2); c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-138, -172); c.quadraticCurveTo(-158 + sw * 6, -120, -150 + sw * 14, -66); c.stroke();
  c.fillStyle = col(3); c.beginPath(); c.ellipse(-150 + sw * 14, -58, 9, 18, sw * 0.2, 0, 6.283); c.fill();
  // body: barrel, withers, hip bone; old = sagging back and belly
  const sag = old * 18, belly = old * 10;
  const body = () => { c.beginPath(); c.moveTo(-146, -170); c.bezierCurveTo(-140, -200, -110, -214, -84, -206); c.bezierCurveTo(-40, -196 + sag, 30, -196 + sag, 70, -204);
    c.bezierCurveTo(96, -216, 124, -212, 132, -196); c.bezierCurveTo(150, -170, 150, -132, 130, -112); c.bezierCurveTo(100, -96, 60, -88 + belly, 0, -86 + belly);
    c.bezierCurveTo(-60, -86 + belly, -100, -96, -126, -112); c.bezierCurveTo(-150, -126, -152, -150, -146, -170); c.closePath(); };
  body(); const bg = c.createLinearGradient(0, -200, 0, -96); bg.addColorStop(0, col(0)); bg.addColorStop(0.4, col(1)); bg.addColorStop(1, col(2)); c.fillStyle = bg; c.fill();
  c.save(); body(); c.clip();
  const sh = c.createLinearGradient(-150, 0, 150, 0); sh.addColorStop(0, hexA('#000000', 0.18)); sh.addColorStop(0.35, 'rgba(0,0,0,0)'); sh.addColorStop(0.8, 'rgba(0,0,0,0)'); sh.addColorStop(1, hexA('#000000', 0.12)); c.fillStyle = sh; c.fillRect(-160, -210, 320, 120);
  c.strokeStyle = hexA(col(0), 0.55 * (1 - nt)); c.lineWidth = 7; c.beginPath(); c.moveTo(-126, -182); c.bezierCurveTo(-60, -196 + sag, 40, -192 + sag * 0.5, 110, -194); c.stroke(); // sheen on the back
  c.strokeStyle = hexA(col(3), 0.25); c.lineWidth = 3; c.beginPath(); c.moveTo(-96, -180); c.quadraticCurveTo(-110, -150, -92, -118); c.stroke(); // hip
  c.beginPath(); c.moveTo(86, -186); c.quadraticCurveTo(70, -150, 84, -116); c.stroke(); // shoulder
  if (old) { c.strokeStyle = hexA(col(3), 0.35); c.lineWidth = 3; for (let k = -2; k <= 3; k++) { c.beginPath(); c.moveTo(k * 18, -178 + sag); c.quadraticCurveTo(k * 18 + 8, -140, k * 18, -108); c.stroke(); } }
  c.restore();
  // neck, dewlap and head (hd: grazing lowers the head to the grass)
  const hd = o.head || 0, bob = Math.sin(T * 0.9) * 0.04, hx = 182 + hd * 8, hy = -156 + hd * 128 + bob * 30;
  const ng = c.createLinearGradient(0, -210, 0, -110); ng.addColorStop(0, col(0)); ng.addColorStop(1, col(2));
  c.fillStyle = ng; c.beginPath(); c.moveTo(96, -196); c.quadraticCurveTo(140, -206 + hd * 40, hx - 12, hy - 30); c.lineTo(hx - 6, hy + 14); c.quadraticCurveTo(130, -100 + hd * 40, 112, -112); c.closePath(); c.fill();
  c.fillStyle = col(1); c.beginPath(); c.moveTo(118, -122); c.quadraticCurveTo(140, -88 + hd * 30, hx - 18, hy + 12); c.quadraticCurveTo(140, -120 + hd * 30, 118, -122); c.fill(); // dewlap
  c.save(); c.translate(hx, hy); c.rotate(0.5 + hd * 0.9); c.scale(1.2, 1.2);
  const hg = c.createLinearGradient(0, -30, 0, 30); hg.addColorStop(0, col(0)); hg.addColorStop(1, col(2));
  c.fillStyle = hg; c.beginPath(); c.moveTo(-26, -26); c.quadraticCurveTo(10, -34, 30, -18); c.quadraticCurveTo(58, -8, 62, 12); c.quadraticCurveTo(60, 30, 40, 30); c.quadraticCurveTo(0, 30, -24, 20); c.quadraticCurveTo(-36, 0, -26, -26); c.closePath(); c.fill();
  c.fillStyle = mix(col(2), '#3a2418', 0.5); c.beginPath(); c.ellipse(52, 16, 14, 14, 0, 0, 6.283); c.fill(); // muzzle
  c.fillStyle = hexA('#140a06', 0.7); c.beginPath(); c.ellipse(58, 12, 3, 4, 0.3, 0, 6.283); c.fill();
  c.fillStyle = '#1a0e08'; c.beginPath(); c.ellipse(4, -6, 5, 4, 0.2, 0, 6.283); c.fill(); c.fillStyle = hexA('#ffffff', 0.5); c.beginPath(); c.arc(3, -7, 1.4, 0, 6.283); c.fill(); // eye
  c.fillStyle = col(1); c.beginPath(); c.ellipse(-28, -10, 22, 9, -0.5 + Math.sin(T * 1.3) * 0.12, 0, 6.283); c.fill(); // ear
  c.fillStyle = hexA(col(3), 0.4); c.beginPath(); c.ellipse(-30, -10, 14, 4, -0.5 + Math.sin(T * 1.3) * 0.12, 0, 6.283); c.fill();
  if (!calf) { c.strokeStyle = mix('#efe2c2', '#2a2a30', nt * 0.6); c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(-14, -26); c.quadraticCurveTo(-22, -52, -4, -60); c.stroke();
    c.strokeStyle = hexA('#5a4a30', 0.6); c.lineWidth = 3; c.beginPath(); c.moveTo(-10, -55); c.lineTo(-4, -60); c.stroke(); }
  if (o.halter) { c.strokeStyle = '#6a4a24'; c.lineWidth = 4; c.beginPath(); c.moveTo(42, -22); c.lineTo(42, 30); c.moveTo(-8, -24); c.quadraticCurveTo(20, 4, 46, 2); c.stroke(); }
  c.restore();
  if (o.yoke) { c.fillStyle = '#5a3a20'; c.save(); c.translate(124, -206); c.rotate(-0.15); c.fillRect(-60, -10, 120, 16); c.fillStyle = '#3a2414'; c.fillRect(-46, -10, 8, 46); c.fillRect(38, -10, 8, 46); c.restore(); }
  c.restore();
}

// ---------- the settlement of the Children of Israel: Sinai granite ranges, black tents and mud houses, palms, the open sandy ground
function sinai34(c, T, nt, haze, px) { par(c, -0.85, px, 0, () => { ridgeW(c, 1080, 330, 0.0021, SEED34 + 1, mix('#a06a5a', '#1a1a2e', nt));
    c.save(); c.globalAlpha = 0.35 * (1 - nt * 0.7); c.strokeStyle = '#fff0e0'; c.lineWidth = 3; c.beginPath(); for (let x = -2400; x <= 3400; x += 18) { const yy = ridgeY(x, 1080, 330, 0.0021, SEED34 + 1) + 6; x === -2400 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); c.restore();
    hazeW(c, 1130, 260, haze || '#f0d0b8', 0.5 * (1 - nt * 0.7)); });
  par(c, -0.6, px, 0, () => { ridgeW(c, 1190, 200, 0.0033, SEED34 + 2, mix('#7a4a3e', '#141424', nt));
    c.save(); c.globalAlpha = 0.22 * (1 - nt * 0.7); c.strokeStyle = '#2a1410'; c.lineWidth = 2; for (let k = 0; k < 26; k++) { const x0 = -1600 + k * 170; c.beginPath(); c.moveTo(x0, ridgeY(x0, 1190, 200, 0.0033, SEED34 + 2) + 10); c.lineTo(x0 + 40, 1290); c.stroke(); } c.restore();
    hazeW(c, 1240, 160, haze || '#f0d0b8', 0.42 * (1 - nt * 0.7)); }); }
function camp34(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 8) : [0, 0]));
  const px = o.px || 0, nt = o.night || 0;
  sky0(c, skyStops(o.sky || 'day', o.to, o.k || 0));
  if (o.stars) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); stars(c, T, 160, SEED34 + 3, [0, 0, W, 1000], o.stars); c.restore(); }
  if (o.moon) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); moon(c, o.moonX || 800, o.moonY || 330, 42, o.moon); c.restore(); }
  if (o.sunA) bigSun30(c, o.sunX === undefined ? 820 : o.sunX, o.sunY === undefined ? 1000 : o.sunY, 48, o.sunCol || '#ffd08a', o.sunA);
  cloudBank(c, T, 300, 6, o.cloud || '#fff0dc', 0.12 * (1 - nt * 0.8), SEED34 + 4, 6);
  sinai34(c, T, nt, o.haze, px);
  par(c, -0.3, px, 0, () => { // the far ground and the rows of tents, palms between them
    const g = c.createLinearGradient(0, 1236, 0, 1420); g.addColorStop(0, mix('#e0bc94', '#2a2636', nt * 0.8)); g.addColorStop(1, mix('#c09468', '#262230', nt * 0.8)); c.fillStyle = g; c.fillRect(-2600, 1236, 6300, 440);
    for (let i = 0, r = rng(SEED34 + 5); i < 16; i++) { const x = -1300 + i * 260 + r() * 80; palm33(c, x, 1300 + r() * 10, 0.5 + r() * 0.12, T, SEED34 + 6 + i, 0, { night: nt }); }
    camp19(c, T, 1296, { lamp: o.lamp || 0, light: 1 - nt * 0.7, fires: o.fires || 0, skip: o.skip });
    if (nt > 0) { c.fillStyle = `rgba(8,10,26,${0.35 * nt})`; c.fillRect(-2600, 1100, 6300, 500); } });
  par(c, -0.12, px, 0, () => { // nearer mud houses on both sides of the open ground
    const hs = o.houses || [[-260, 1420, 300, 220, 0], [130, 1400, 240, 190, 1], [980, 1410, 280, 210, 2], [1330, 1430, 320, 240, 3]];
    hs.forEach(([x, y, w, h, i]) => { house(c, x, y, w, h, mix(mix('#c49a6a', '#a8805a', (i % 2) * 0.6), '#2a2632', nt * 0.75), { lamp: o.lamp ? o.lamp * (i % 2 ? 1 : 0.7) : 0, t: T + i, doorOpen: o.doorOpen === i });
      if (o.doorOpen === i && o.doorLight) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(255,214,150,${0.85 * o.doorLight})`; c.beginPath(); archPath(c, x - w * 0.18, y, w * 0.2, h * 0.55); c.fill(); glow(c, x - w * 0.18, y - h * 0.25, 160, '#ffd090', 0.5 * o.doorLight); c.restore(); } });
    if (o.onHouses) o.onHouses(c); });
  par(c, 0, px, 0, () => { // the open ground in front
    const earth = mix('#caa274', '#2c2834', nt * 0.8), g = c.createLinearGradient(0, 1380, 0, H + 300); g.addColorStop(0, mix(earth, '#fff0d4', 0.12 * (1 - nt))); g.addColorStop(0.45, earth); g.addColorStop(1, mix(earth, '#140a04', 0.45));
    c.fillStyle = g; c.fillRect(-2600, 1415, 6300, H + 1400);
    const r = rng(SEED34 + 30); for (let i = 0; i < 150; i++) { const q = Math.pow(r(), 1.5), yy = 1430 + q * (H + 200 - 1430), x = -1500 + r() * 4100, sz = 2 + q * 13, cv = r();
      c.fillStyle = hexA(mix(earth, cv > 0.6 ? '#2a1a10' : '#fff0d8', 0.4), 0.5); c.beginPath(); c.ellipse(x, yy, sz, sz * 0.42, 0, 0, 6.283); c.fill(); }
    c.strokeStyle = hexA(mix(earth, '#2a1a0c', 0.5), 0.18); c.lineWidth = 2; for (let k = 0; k < 7; k++) { c.beginPath(); c.moveTo(-1500, 1450 + k * k * 14); c.quadraticCurveTo(540, 1440 + k * k * 14 + 18, 2600, 1452 + k * k * 14); c.stroke(); }
    for (let i = 0, rr = rng(SEED34 + 31); i < 18; i++) { const q = rr(), yy = 1440 + q * 600, x = -1200 + rr() * 3400; if (Math.abs(x - 540) < 380) continue; shrub(c, x, yy, 0.3 + q * 0.7, mix('#7a7a3a', '#1a2020', nt * 0.75), T, i + 5); }
    if (o.torches) o.torches.forEach(([x, y, s], i) => torch(c, x, y, T + i, i, s || 1));
    if (o.props) o.props(c); });
  if (o.light) lightFromAbove(c, T, o.lightX || 540, o.light, o.lightW || 380);
  par(c, 0, px, 0, () => { if (o.walkers) o.walkers(c); });
  if (o.night && o.vignette !== false) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const v = c.createRadialGradient(W / 2, H * 0.58, H * 0.2, W / 2, H * 0.55, H * 0.75); v.addColorStop(0, 'rgba(4,4,12,0)'); v.addColorStop(1, `rgba(4,4,12,${0.55 * nt})`); c.fillStyle = v; c.fillRect(0, 0, W, H); c.restore(); }
  if (o.tint) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = o.tint; c.fillRect(0, 0, W, H); c.restore(); }
  if (o.fg !== false) blurLayer(c, 10, bc => { rock(bc, -60, 2140, 380, 220, mix('#8a6248', '#16141c', nt * 0.85), SEED34 + 40); shrub(bc, 1120, 2120, 3.0, mix('#5a5a2a', '#101418', nt * 0.8), T, 9); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- the pasture (an oasis meadow below the mountains): grass, a stream, palms, cows grazing
function pasture34(c, T, o = {}) {
  const z = o.z || 1; cam(c, z, o.cx === undefined ? 540 : o.cx, o.cy || 1150, ...(o.shake ? shake(T, o.shake, 8) : [0, 0]));
  const px = o.px || 0, nt = o.night || 0, dry = o.dry || 0;
  sky0(c, skyStops(o.sky || 'day', o.to, o.k || 0));
  if (o.sunA) bigSun30(c, o.sunX === undefined ? 820 : o.sunX, o.sunY === undefined ? 1000 : o.sunY, 48, o.sunCol || '#ffd08a', o.sunA);
  cloudBank(c, T, 320, 6, '#fff4e4', 0.16 * (1 - nt), SEED34 + 50, 6);
  sinai34(c, T, nt, o.haze || '#f2e0c8', px);
  par(c, -0.3, px, 0, () => { const g = c.createLinearGradient(0, 1236, 0, 1420); g.addColorStop(0, mix(mix('#b8b480', '#c8aa72', dry), '#1e2420', nt * 0.8)); g.addColorStop(1, mix(mix('#7a8e46', '#a88a58', dry), '#1a2018', nt * 0.8)); c.fillStyle = g; c.fillRect(-2600, 1236, 6300, 440);
    for (let i = 0, r = rng(SEED34 + 51); i < 22; i++) { const x = -1300 + i * 190 + r() * 70; palm33(c, x, 1296 + r() * 14, 0.55 + r() * 0.16, T, SEED34 + 52 + i, 0, { night: nt, lush: 0.3 }); }
    if (o.farHerd) for (let i = 0, r = rng(SEED34 + 75); i < 9; i++) { const x = -300 + i * 190 + r() * 60; cow34(c, x, 1340 + r() * 30, 0.2, T + i, { col: r() > 0.4 ? 'brown' : 'dark', dir: r() > 0.5 ? 1 : -1, head: r() > 0.4 ? 1 : 0, night: nt }); } });
  par(c, 0, px, 0, () => {
    const gr = mix(mix('#86a04a', '#b49a60', dry), '#1a2418', nt * 0.8), g = c.createLinearGradient(0, 1380, 0, H + 300); g.addColorStop(0, mix(gr, '#f8f0c0', 0.12)); g.addColorStop(0.5, gr); g.addColorStop(1, mix(gr, '#0a1006', 0.5));
    c.fillStyle = g; c.fillRect(-2600, 1415, 6300, H + 1400);
    // the stream: a band crossing the meadow, glints
    if (o.stream !== false) { const sy = o.streamY || 1500; c.fillStyle = mix('#6a9ab0', '#1a2440', nt); c.beginPath(); c.moveTo(-2600, sy); for (let x = -2600; x <= 3700; x += 40) c.lineTo(x, sy + Math.sin(x * 0.004) * 16); for (let x = 3700; x >= -2600; x -= 40) c.lineTo(x, sy + 26 + Math.sin(x * 0.004 + 0.4) * 18); c.closePath(); c.fill();
      c.strokeStyle = hexA('#fff8e0', 0.45 * (1 - nt * 0.6)); c.lineWidth = 2; for (let k = 0; k < 40; k++) { const x = -1400 + k * 90 + ((T * 30 + k * 37) % 90); c.beginPath(); c.moveTo(x, sy + 12 + Math.sin(x * 0.004) * 16); c.lineTo(x + 26, sy + 12 + Math.sin(x * 0.004) * 16); c.stroke(); }
      c.fillStyle = hexA('#3a4a20', 0.5); c.fillRect(-2600, sy - 4, 6300, 5); }
    const r = rng(SEED34 + 60); c.lineCap = 'round';
    for (let i = 0; i < 420; i++) { const q = Math.pow(r(), 1.4), yy = 1430 + q * (H + 200 - 1430), x = -1500 + r() * 4100, l = 6 + q * 26, sw = Math.sin(T * 1.6 + x * 0.02) * 3 * q;
      c.strokeStyle = hexA(mix(gr, r() > 0.5 ? '#2a3a10' : '#e8f0a0', 0.4), 0.7); c.lineWidth = 1 + q * 2.5; c.beginPath(); c.moveTo(x, yy); c.quadraticCurveTo(x + 2, yy - l * 0.6, x + sw + 3, yy - l); c.stroke(); }
    for (let i = 0, rr = rng(SEED34 + 61); i < 30; i++) { const q = rr(), yy = 1450 + q * 600, x = -1200 + rr() * 3400; c.fillStyle = hexA(rr() > 0.5 ? '#f8e070' : '#ffffff', 0.7 * (1 - nt)); c.beginPath(); c.arc(x, yy, 2 + q * 4, 0, 6.283); c.fill(); }
    if (o.props) o.props(c); });
  if (o.light) lightFromAbove(c, T, o.lightX || 540, o.light, o.lightW || 380);
  par(c, 0, px, 0, () => { if (o.walkers) o.walkers(c); });
  if (o.vision) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const v = c.createRadialGradient(W / 2, H * 0.5, H * 0.22, W / 2, H * 0.52, H * 0.72); v.addColorStop(0, 'rgba(255,250,235,0)'); v.addColorStop(1, `rgba(255,248,230,${0.6 * o.vision})`); c.fillStyle = v; c.fillRect(0, 0, W, H); c.restore(); }
  if (o.tint) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = o.tint; c.fillRect(0, 0, W, H); c.restore(); }
  if (o.fg !== false) blurLayer(c, 10, bc => { shrub(bc, -30, 2140, 3.4, mix('#4a6a2a', '#101418', nt * 0.8), T, 7); shrub(bc, 1110, 2150, 3.0, mix('#5a7a30', '#101418', nt * 0.8), T, 8); }, 3);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- the murdered man under a cloak, lying on the ground at night (no wound, no face: only a covered form)
function covered34(c, x, y, s, T, o = {}) { c.save(); c.translate(x, y); c.scale(s * (o.dir || 1), s); const nt = o.night || 0;
  c.fillStyle = 'rgba(6,4,4,0.35)'; c.beginPath(); c.ellipse(0, 2, 170, 12, 0, 0, 6.283); c.fill();
  const col = mix(RICH34.robe, '#0a0a14', nt * 0.5), lt = mix(col, '#ffe0c0', 0.25), dk = mix(col, '#000000', 0.45);
  const g = c.createLinearGradient(0, -70, 0, 0); g.addColorStop(0, lt); g.addColorStop(1, dk); c.fillStyle = g;
  c.beginPath(); c.moveTo(-160, 0); c.quadraticCurveTo(-168, -50, -128, -56); c.quadraticCurveTo(-96, -60, -80, -46); c.quadraticCurveTo(-20, -72, 60, -54); c.quadraticCurveTo(120, -46, 150, -30); c.quadraticCurveTo(170, -12, 160, 0); c.closePath(); c.fill();
  c.strokeStyle = hexA(mix(RICH34.trim, '#000000', nt * 0.4), 0.8); c.lineWidth = 5; c.beginPath(); c.moveTo(-140, -6); c.quadraticCurveTo(0, -10, 150, -6); c.stroke();
  c.fillStyle = mix('#5a3a22', '#141018', nt * 0.5); c.beginPath(); c.ellipse(166, -10, 9, 14, 0.3, 0, 6.283); c.ellipse(158, -4, 9, 12, 0.3, 0, 6.283); c.fill(); // sandals at the feet
  c.strokeStyle = hexA(dk, 0.6); c.lineWidth = 2.5; [-40, 20, 80].forEach(fx => { c.beginPath(); c.moveTo(fx, -58); c.quadraticCurveTo(fx + 10, -30, fx - 4, -4); c.stroke(); });
  c.restore(); }

// ---------- the body on its bier under a linen shroud; rise 0..1 = sits up (Al-Baqara 73: "thus Allah gives life to the dead"). Never a face,
// warm linen (not the white veil of light of a prophet). o.glow = warm light around it.
function risen34(c, x, y, s, T, o = {}) { T += 100; const rise = ease(clamp(o.rise || 0)), nt = o.night || 0;
  c.save(); c.translate(x, y); c.scale(s * (o.dir || 1), s);
  if (o.glow) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, -40, -150, 380, '#ffc060', 0.5 * o.glow * (0.92 + 0.08 * Math.sin(T * 3))); c.restore(); }
  c.fillStyle = 'rgba(10,6,4,0.35)'; c.beginPath(); c.ellipse(0, 4, 210, 15, 0, 0, 6.283); c.fill();
  // the bier: two poles, slats, four short legs
  const wood = mix('#5a3a20', '#1a1418', nt * 0.6), wlt = mix(wood, '#e0b080', 0.25);
  c.fillStyle = wood; [-170, -80, 80, 170].forEach(lx => c.fillRect(lx - 6, -44, 12, 44));
  c.fillStyle = wlt; c.fillRect(-200, -56, 400, 12); c.fillStyle = mix(wood, '#000000', 0.3); c.fillRect(-200, -46, 400, 4);
  c.fillStyle = hexA('#2a1a0c', 0.5); for (let k = 0; k < 9; k++) c.fillRect(-180 + k * 45, -60, 6, 4);
  const lin = mix(mix('#e6d4b0', '#5a5a6a', nt * 0.3), '#ffd9a0', 0.25 * (o.glow || 0)), lsh = mix(lin, '#4a3420', 0.4), llt = mix(lin, '#fff2d8', 0.35);
  // legs part (lying along the bier, feet to the right)
  const lg = c.createLinearGradient(0, -100, 0, -56); lg.addColorStop(0, llt); lg.addColorStop(1, lsh); c.fillStyle = lg;
  c.beginPath(); c.moveTo(-50, -58); c.quadraticCurveTo(-46, -100, 0, -96); c.quadraticCurveTo(90, -86, 150, -84); c.quadraticCurveTo(184, -82, 180, -58); c.closePath(); c.fill();
  c.strokeStyle = hexA(lsh, 0.7); c.lineWidth = 3; c.beginPath(); c.moveTo(168, -86); c.lineTo(168, -58); c.stroke(); // the tie at the feet
  [30, 90].forEach(fx => { c.beginPath(); c.moveTo(fx, -92); c.quadraticCurveTo(fx + 8, -76, fx, -60); c.stroke(); });
  // torso + covered head, pivoting at the hips (-40,-80): lying (pointing left) → sitting (upright)
  c.save(); c.translate(-40, -78); c.rotate(rise * (Math.PI / 2) * 0.8);
  const tg = c.createLinearGradient(0, -40, 0, 40); tg.addColorStop(0, llt); tg.addColorStop(1, lsh); c.fillStyle = tg;
  c.beginPath(); c.moveTo(14, 26); c.quadraticCurveTo(-50, 30, -100, 32); c.quadraticCurveTo(-128, 32, -138, 22); c.quadraticCurveTo(-148, 14, -150, 10); // back
  c.lineTo(-152, -14); c.quadraticCurveTo(-140, -32, -118, -36); c.quadraticCurveTo(-70, -30, -40, -24); c.quadraticCurveTo(0, -26, 14, -14); c.closePath(); c.fill();
  const hg = c.createRadialGradient(-180, -10, 4, -176, -4, 34); hg.addColorStop(0, llt); hg.addColorStop(1, lsh); c.fillStyle = hg;
  c.beginPath(); c.ellipse(-178, -2, 30, 27, 0, 0, 6.283); c.fill(); // the covered head: a plain rounded form, no feature
  c.strokeStyle = hexA(lsh, 0.75); c.lineWidth = 3; c.beginPath(); c.moveTo(-150, -14); c.quadraticCurveTo(-154, 0, -150, 12); c.stroke(); // tie at the neck
  c.strokeStyle = hexA(mix(lsh, '#000000', 0.15), 0.6); c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(-128, -26); c.quadraticCurveTo(-80, -40, -30, -30); c.stroke(); // the wrapped arm along the front
  c.strokeStyle = hexA(lsh, 0.55); c.lineWidth = 2.5; c.beginPath(); c.moveTo(-96, 30); c.quadraticCurveTo(-90, 0, -100, -30); c.moveTo(-50, 28); c.quadraticCurveTo(-44, 0, -52, -26); c.moveTo(-196, -16); c.quadraticCurveTo(-186, -4, -192, 14); c.stroke();
  c.restore();
  c.restore(); }
// a small cloth-wrapped piece held in a hand (the "part of it", Al-Baqara 73): never flesh, never blood
function bundle34(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); const g = c.createRadialGradient(-4, -4, 2, 0, 0, 18); g.addColorStop(0, '#efe2c4'); g.addColorStop(1, '#a8916a'); c.fillStyle = g; c.beginPath(); c.ellipse(0, 2, 17, 12, -0.3, 0, 6.283); c.fill();
  c.fillStyle = '#c8b48a'; c.beginPath(); c.moveTo(-4, -8); c.quadraticCurveTo(-12, -22, -2, -20); c.quadraticCurveTo(4, -16, 2, -8); c.moveTo(2, -8); c.quadraticCurveTo(12, -22, 14, -12); c.quadraticCurveTo(10, -8, 4, -6); c.fill(); // the knot
  c.strokeStyle = 'rgba(90,64,30,0.5)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-10, 4); c.quadraticCurveTo(0, 8, 12, 0); c.stroke(); c.restore(); }

// ---------- the plough (a brown ox under the yoke drawing a wooden ard, the ploughman behind) and the irrigation well (an ox walking away
// from the well, the rope over the pulley lifting the leather bucket): what the cow had NEVER done (Al-Baqara 71)
function plough34(c, x, y, s, T, dist, o = {}) { const sx = x + dist; cow34(c, sx, y, s, T, { col: 'brown', yoke: true, dist, dir: 1 });
  const yx = sx + 124 * s, yy = y - 206 * s, ax = sx - 230 * s, ay = y; // beam from the yoke back down to the ard
  c.strokeStyle = '#4a2e18'; c.lineWidth = 9 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(yx, yy); c.quadraticCurveTo(sx - 60 * s, y - 120 * s, ax, ay - 30 * s); c.stroke();
  c.strokeStyle = '#5a3a20'; c.lineWidth = 11 * s; c.beginPath(); c.moveTo(ax + 40 * s, ay + 6 * s); c.lineTo(ax - 30 * s, ay - 20 * s); c.lineTo(ax - 70 * s, ay - 140 * s); c.stroke(); // share + handle
  c.fillStyle = hexA('#3a2414', 0.5); c.fillRect(x - 900 * s, y + 4 * s, dist + 900 * s - 230 * s + 40 * s, 6 * s); // the furrow behind
  fig(c, o.who || ISR34[3], { x: ax - 120 * s, y: y + 6 * s, h: 360 * s, dir: 1, t: T, light: 0.9, wind: 0.3, ink: 0.6, reach: 0.55, walk: stepOf(dist, 360 * s) }); }
function irrigWell34(c, x, y, s, T, dist, o = {}) { // the well at x, the ox walks right (away), the bucket rises
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,6,4,0.3)'; c.beginPath(); c.ellipse(0, 4, 110, 16, 0, 0, 6.283); c.fill();
  const g = c.createLinearGradient(-90, 0, 90, 0); g.addColorStop(0, '#d8c0a0'); g.addColorStop(1, '#6a5038'); c.fillStyle = g; c.beginPath(); c.moveTo(-90, -70); c.lineTo(-90, 0); c.quadraticCurveTo(0, 18, 90, 0); c.lineTo(90, -70); c.quadraticCurveTo(0, -54, -90, -70); c.fill();
  c.fillStyle = '#e8d6b8'; c.beginPath(); c.ellipse(0, -70, 90, 18, 0, 0, 6.283); c.fill(); c.fillStyle = '#140c08'; c.beginPath(); c.ellipse(0, -70, 70, 12, 0, 0, 6.283); c.fill();
  c.strokeStyle = '#4a3020'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(-70, -76); c.lineTo(-60, -300); c.moveTo(70, -76); c.lineTo(60, -300); c.stroke(); c.lineWidth = 10; c.beginPath(); c.moveTo(-74, -296); c.lineTo(74, -296); c.stroke();
  c.fillStyle = '#6a4a2a'; c.beginPath(); c.arc(40, -296, 18, 0, 6.283); c.fill(); c.fillStyle = '#3a2414'; c.beginPath(); c.arc(40, -296, 6, 0, 6.283); c.fill(); // pulley
  const lift = clamp(dist / 260), by = lerp(-60, -260, lift); // the bucket comes up
  c.strokeStyle = '#8a6a3a'; c.lineWidth = 4; c.beginPath(); c.moveTo(22, -296); c.lineTo(22, by - 20); c.stroke();
  if (lift > 0.05) { c.fillStyle = '#5a3418'; c.beginPath(); c.moveTo(4, by - 20); c.lineTo(40, by - 20); c.lineTo(34, by + 16); c.lineTo(10, by + 16); c.closePath(); c.fill();
    if (lift > 0.9) { c.fillStyle = hexA('#9ac8e0', 0.8); c.fillRect(10, by + 16, 6, 60); } }
  c.restore();
  const ox = x + 200 * s + dist; cow34(c, ox, y + 30 * s, s, T, { col: 'brown', yoke: true, dist, dir: 1 });
  c.strokeStyle = '#8a6a3a'; c.lineWidth = 4 * s; c.beginPath(); c.moveTo(x + 58 * s, y - 296 * s); c.quadraticCurveTo((x + ox) / 2, y - 220 * s, ox + 110 * s, y - 180 * s); c.stroke();
  c.fillStyle = mix('#6a9ab0', '#2a3a50', 0.2); c.fillRect(x - 600 * s, y + 40 * s, 520 * s, 14 * s); // the channel toward the field
  if (o.who !== false) fig(c, ISR34[2], { x: ox + 330 * s, y: y + 50 * s, h: 340 * s, dir: -1, t: T, light: 0.9, wind: 0.3, ink: 0.6, staff: true }); }
// a dim "vision" frame for the two things the cow never did: desaturated, soft, then struck out by a gentle fade
function visionFx34(c, k) { if (k <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(232,222,204,${0.32 * k})`; c.fillRect(0, 0, W, H);
  const v = c.createRadialGradient(W / 2, H * 0.55, H * 0.2, W / 2, H * 0.55, H * 0.7); v.addColorStop(0, 'rgba(250,244,230,0)'); v.addColorStop(1, `rgba(250,244,230,${0.7 * k})`); c.fillStyle = v; c.fillRect(0, 0, W, H); c.restore(); }
// a big "no" sign over a vision (a red-ochre circle and bar, drawn stroke by stroke)
function noSign34(c, x, y, r, k) { if (k <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.strokeStyle = `rgba(190,60,40,${0.85 * Math.min(1, k * 1.5)})`; c.lineWidth = 18; c.lineCap = 'round';
  c.beginPath(); c.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + 6.283 * clamp(k * 1.6)); c.stroke();
  const b = clamp(k * 1.6 - 0.8) / 0.8 * 1.0; if (b > 0) { c.beginPath(); c.moveTo(x - r * 0.7, y - r * 0.7); c.lineTo(x - r * 0.7 + r * 1.4 * clamp(b), y - r * 0.7 + r * 1.4 * clamp(b)); c.stroke(); } c.restore(); }

// ---------- people: a crowd standing on the flat ground (perspective height hY34), facing a point; o.fn(p, i) can override gestures
const CROWD34 = (() => { const r = rng(SEED34 + 80), L = [];
  [[1470, 8, 190], [1520, 8, 210], [1580, 7, 240], [1650, 6, 270]].forEach(([y, n, gap], row) => { for (let i = 0; i < n; i++) { const x = 540 + (i - (n - 1) / 2) * gap + (r() - 0.5) * 60;
    L.push({ x, y: y + (r() - 0.5) * 18, f: (i * 3 + row) % ISR34.length, ph: r() * 10, row }); } });
  return L.sort((a, b) => a.y - b.y); })();
function crowd34(c, T, o = {}) { const list = o.list || CROWD34; list.forEach((p, i) => { if (o.skip && o.skip(p)) return;
  const h = hY34(p.y), dir = o.face !== undefined ? (p.x < o.face ? 1 : -1) : (o.dir || 1);
  const base = { x: p.x, y: p.y, h, dir, t: T + p.ph, light: o.light === undefined ? 0.85 : o.light, wind: 0.25, ink: 0.65 };
  const extra = o.fn ? o.fn(p, i, base) : {}; if (extra === null) return; fig(c, ISR34[p.f], Object.assign(base, extra)); }); }

// ---------- the hero shot (hook, cta, outro, cover): night in the camp, torches; the shrouded man sits up on his bier in a warm light; the crowd
// recoils; Moussa (white, veil of light) on the right; the nephew (dark red) on the left, singled out.
const HERO34 = { sky: 'night', stars: 0.7, moon: 0.6, moonX: 820, moonY: 560, night: 1, lamp: 0.9, fires: 0.6, z: 1.5, cx: 540, cy: 1500, haze: '#3a3a5a' };
const HERO_TORCH34 = [[205, 1560, 0.9], [905, 1560, 0.9]];
function heroCrowd34(T, o = {}) { const rise = o.rise === undefined ? 1 : o.rise, turn = o.turn === undefined ? 1 : o.turn; return c => {
  [[250, 1490, 0], [345, 1470, 1], [440, 1500, 3], [640, 1495, 2], [735, 1472, 4], [835, 1500, 5]].forEach(([x, y, f], j) => {
    fig(c, ISR34[f], { x, y, h: hY34(y), dir: turnDir(turn, 0.1 + j * 0.06, x < 540 ? 1 : -1, -1, 0.3), t: T + j, light: 0.85, wind: 0.25, ink: 0.65, armUp: 0.35 * rise * (j % 2), reach: j % 2 ? 0 : 0.5 * rise * turn }); });
  risen34(c, 520, 1650, 1.1, T, { rise, glow: 0.4 + 0.6 * rise, night: 1 });
  if (rise > 0.3) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 260, 1560, 220, '#ffcf7a', 0.22 * turn * rise); c.restore(); }
  fig(c, NEPHEW34, { x: 255, y: 1730, h: hY34(1730) * 0.92, dir: 1, t: T + 3, light: 0.9 + 0.3 * turn * rise, wind: 0.3, ink: 0.7, armUp: 0.6 * turn * rise });
  fig(c, MUSA34, { x: 868, y: 1735, h: hY34(1735) * 0.92, dir: -1, t: T + 5, light: 1.05, wind: 0.4, staff: true, veilGlow: 0.3 }); }; }
const hero34 = (c, T, o = {}) => camp34(c, T, Object.assign({}, HERO34, { torches: HERO_TORCH34, walkers: heroCrowd34(T, o) }, o));
function heroTexts34(c, a) { if (a <= 0) return; topShade(c, 1.3 * a); seriesTag34(c, a); bigWord27(c, 'UN MORT', 250, a, 120); bigWord27(c, 'S\'EST RELEVÉ', 365, a, 96, '#f6c453'); }
