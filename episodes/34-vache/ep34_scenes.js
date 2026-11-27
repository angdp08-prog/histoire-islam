
// ---------- episode 34 scenes
const DAY34 = { sky: 'day', to: 'gold', k: 0.3, sunA: 0.7, sunX: 860, sunY: 1000 };
const DUSK34 = { sky: 'dusk', to: 'gold', k: 0.35, sunA: 0.75, sunX: 240, sunY: 1120, lamp: 0.5, haze: '#e8b8a0' };
const NIGHT34 = { sky: 'night', stars: 0.8, moon: 0.7, moonX: 820, moonY: 420, night: 1, lamp: 0.8, fires: 0.5, haze: '#3a3a5a' };
const MORN34 = { sky: 'dawn', to: 'gold', k: 0.4, sunA: 0.8, sunX: 860, sunY: 1080, haze: '#f0d0b8' };
// the assembly: people on the left, facing Moussa on the right
const ASM34 = (() => { const r = rng(SEED34 + 90), L = []; [[1490, 6, 110], [1545, 5, 130], [1610, 5, 150], [1690, 4, 175]].forEach(([y, n, gap], row) => {
  for (let i = 0; i < n; i++) L.push({ x: 120 + i * gap + row * 22 + (r() - 0.5) * 30, y: y + (r() - 0.5) * 16, f: (i * 3 + row * 2) % ISR34.length, ph: r() * 10, row }); });
  return L.sort((a, b) => a.y - b.y); })();
const MX34 = 860, MY34 = 1650;
function musaAt34(c, T, o = {}) { fig(c, MUSA34, Object.assign({ x: MX34, y: MY34, h: hY34(MY34), dir: -1, t: T + 7, light: 1.05, wind: 0.45, staff: !(o.armUp || o.reach || o.dua), veilGlow: 0.3 }, o)); }
function assembly34(T, o = {}) { return c => {
  crowd34(c, T, { list: ASM34, dir: 1, light: o.light, fn: (p, i) => o.fn ? o.fn(p, i) : {} });
  if (o.musa !== false) musaAt34(c, T, o.m || {}); }; }
// two clans facing each other over the covered body (morning)
const CLAN_A34 = [[170, 1560, 0], [280, 1610, 2], [140, 1680, 4], [300, 1720, 6]], CLAN_B34 = [[800, 1560, 1], [700, 1600, 3], [880, 1660, 5], [760, 1730, 7]];
function clans34(T, k, shout = 0) { return c => {
  covered34(c, 520, 1640, 0.75, T, {});
  CLAN_A34.forEach(([x, y, f], j) => fig(c, ISR34[f], { x, y, h: hY34(y), dir: 1, t: T + j, light: 0.95, wind: 0.35, ink: 0.7, armUp: (j % 2 ? 0.7 : 0.35) * k * (0.85 + 0.15 * Math.sin(T * 3 + j)), reach: j % 2 ? 0 : 0.6 * k }));
  CLAN_B34.forEach(([x, y, f], j) => fig(c, ISR34[f], { x, y, h: hY34(y), dir: -1, t: T + j + 4, light: 0.95, wind: 0.35, ink: 0.7, armUp: (j % 2 ? 0.35 : 0.7) * k * (0.85 + 0.15 * Math.sin(T * 3.3 + j)), reach: j % 2 ? 0.6 * k : 0 }));
  if (shout > 0) { whisper33(c, 300, 1610 - hY34(1610) * 0.9, 1.6, T, 1, shout); whisper33(c, 700, 1600 - hY34(1600) * 0.9, 1.6, T + 0.5, -1, shout); } }; }
// three cows side by side: the calf, the old cow, the one "between the two" (Al-Baqara 68); lit = which is highlighted
function threeCows34(T, o = {}) { return c => {
  const dimC = o.dimCalf || 0, dimO = o.dimOld || 0, mid = o.mid || 0, yel = o.yellow || 0;
  cow34(c, 270, 1640, 0.72, T, { calf: true, col: 'brown', dim: 0.55 * dimC, head: 0.3 });
  cow34(c, 820, 1660, 0.74, T + 2, { col: 'old', dir: -1, dim: 0.55 * dimO });
  cow34(c, 520, 1760, 0.9, T + 1, { col: 'brown', glow: mid, halter: false });
  if (yel > 0) { c.save(); c.globalAlpha *= yel; cow34(c, 520, 1760, 0.9, T + 1, { col: 'yellow', glow: mid }); c.restore(); } }; }
const HERD34 = [[-120, 1520, 0.42, 1, 'brown', 1], [120, 1560, 0.48, -1, 'dark', 0], [380, 1510, 0.4, 1, 'brown', 1], [640, 1545, 0.46, -1, 'brown', 0], [930, 1520, 0.42, -1, 'dark', 1], [1180, 1560, 0.48, 1, 'brown', 0],
  [20, 1640, 0.6, 1, 'dark', 1], [300, 1680, 0.66, -1, 'brown', 0], [780, 1660, 0.62, 1, 'brown', 1], [1060, 1690, 0.68, -1, 'dark', 0]];
function herd34(T, o = {}) { return c => HERD34.forEach(([x, y, s, d, col, hd], i) => cow34(c, x, y, s, T + i, { col, dir: d, head: hd, glow: o.pick === i ? o.k || 0 : 0 })); }

const SCENES = {
  // 1. HOOK — a murdered man came back to life and, according to the exegetes, said who had killed him; it all began with a strange order: slaughter a cow.
  hook: {
    grade: 'rgba(255,190,140,0.08)',
    draw(c, t, d) {
      const tVi = at('hook', 'vie', 0, 2.2), tEx = at('hook', 'exegetes', 0, 3.6), tTu = at('hook', 'tue', 0, 5.6), tCo = at('hook', 'commence', 0, 6.6), tOr = at('hook', 'ordre', 0, 7.6), tEg = at('hook', 'egorger', 0, 9.0), tVa = at('hook', 'vache', 0, 10.0);
      shots(c, t, [
        [0, (cc, q) => hero34(cc, t, { z: lerp(1.5, 1.56, ease(seg(q, 0, tVi + 0.4))), cy: lerp(1500, 1515, ease(seg(q, 0, tVi + 0.4))) })],
        [tVi + 0.3, (cc, q) => hero34(cc, t, { z: lerp(2.3, 2.38, ease(seg(q, 0, tEx - tVi))), cx: 520, cy: 1500 })],
        [tEx - 0.2, (cc, q) => hero34(cc, t, { z: lerp(2.2, 2.3, ease(seg(q, 0, tCo - tEx))), cx: lerp(380, 330, ease(seg(q, 0, tCo - tEx))), cy: 1560 })],
        [tCo - 0.2, (cc, q) => pasture34(cc, t, Object.assign({}, DAY34, { farHerd: true, z: lerp(1.25, 1.3, ease(seg(q, 0, tEg - tCo))), cy: 1420, walkers: c2 => cow34(c2, 300 + q * 70, 1690, 0.75, t, { dist: q * 70, halter: true }) }))],
        [tEg - 0.2, (cc, q) => pasture34(cc, t, Object.assign({}, DAY34, { z: lerp(2.0, 2.1, ease(seg(q, 0, d - tEg))), cx: 600, cy: 1600, walkers: c2 => cow34(c2, 450 + (tEg - tCo + q) * 70, 1700, 0.75, t, { dist: (tEg - tCo + q) * 70, halter: true, glow: 0.4 * ramp(q, tVa - tEg, 0.5) }) }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      heroTexts34(c, 1 - ramp(t, tEx - 0.4, 0.2));
      const a1 = ramp(t, tEx - 0.2, 0.2) * (1 - ramp(t, tCo - 0.4, 0.2)); quote2(c, 'IL A DIT', 'QUI L\'AVAIT TUÉ', a1, 260, 100, 96 * ramp(t, tTu - 0.9, 0.3) + 0.01); caption(c, 'selon les exégètes (Ibn Kathir, at-Tabari)', 470, a1, 30); seriesTag34(c, a1);
      const a2 = ramp(t, tCo - 0.2, 0.2) * (1 - seg(t, d - 0.4, d)); quote2(c, 'UN ORDRE ÉTRANGE :', 'ÉGORGER UNE VACHE', a2 * ramp(t, tOr - 0.5, 0.3), 260, 78, 86 * ramp(t, tEg - 0.4, 0.3) + 0.01); seriesTag34(c, a2);
      caption(c, 'Coran, sourate Al-Baqara, versets 67-73', 470, a2 * ramp(t, tVa - 0.3, 0.3), 30);
    },
  },
  // 2. the surah named after the story; the open loop (paid off in "payoff"): « ce que leurs questions leur ont coûté »
  promise: {
    grade: 'rgba(255,205,150,0.08)',
    draw(c, t, d) {
      const tLo = at('promise', 'longue', 0, 4.0), tBa = at('promise', 'al-baqara', 0, 6.0), tRe = at('promise', 'reste', 0, 7.8), tQu = at('promise', 'questions', 0, 10.0), tCt = at('promise', 'coute', 0, 11.6);
      shots(c, t, [
        [0, (cc, q) => pasture34(cc, t, Object.assign({}, DAY34, { farHerd: true, z: lerp(1.0, 1.05, ease(seg(q, 0, tLo))), cy: lerp(1180, 1210, ease(seg(q, 0, tLo))), walkers: herd34(t) }))],
        [tLo - 0.2, (cc, q) => pasture34(cc, t, Object.assign({}, DAY34, { farHerd: true, z: lerp(1.5, 1.56, ease(seg(q, 0, tBa - tLo))), cx: lerp(260, 340, ease(seg(q, 0, tBa - tLo))), cy: 1500, walkers: herd34(t) }))],
        [tBa - 0.2, (cc, q) => pasture34(cc, t, Object.assign({}, DAY34, { z: lerp(1.7, 1.78, ease(seg(q, 0, tRe - tBa))), cx: lerp(500, 560, ease(seg(q, 0, tRe - tBa))), cy: 1580, walkers: herd34(t, { pick: 3, k: 0.6 }) }))],
        [tRe - 0.2, (cc, q) => camp34(cc, t, Object.assign({}, DAY34, { z: lerp(1.35, 1.4, ease(seg(q, 0, tQu - tRe))), cy: 1460, walkers: assembly34(t, { fn: (p, i) => ({ armUp: i % 3 === 0 ? 0.85 * ramp(q, 0.3 + (i % 5) * 0.25, 0.4) : 0 }) }) }))],
        [tQu - 0.2, (cc, q) => camp34(cc, t, Object.assign({}, DAY34, { z: lerp(2.0, 2.06, ease(seg(q, 0, tCt - tQu))), cx: 380, cy: 1540, walkers: assembly34(t, { musa: false, fn: (p, i) => ({ armUp: i % 2 ? 0.85 : 0, reach: i % 2 ? 0 : 0.6 }) }) }))],
        [tCt - 0.2, (cc, q) => camp34(cc, t, Object.assign({}, DUSK34, { z: lerp(2.6, 2.7, ease(seg(q, 0, d - tCt))), cx: 540, cy: 1640, walkers: c2 => { goldHeap32(c2, 540, 1690, 0.9, t, 7); coins(c2, 700, 1700, 1.4, Math.floor(6 + 14 * ramp(q, 0.2, 1.6)), t); } }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a0 = ramp(t, 0.05, 0.25) * (1 - ramp(t, tRe - 0.4, 0.25)); topShade(c, a0 * 1.3); arabic(c, 'سورة البقرة', 250, a0, 120);
      bigWord27(c, 'AL-BAQARA', 390, a0 * ramp(t, tBa - 0.5, 0.3), 100, '#f6c453'); caption(c, '« la vache » · la plus longue sourate du Coran', 470, a0 * ramp(t, tLo - 0.3, 0.3), 32); seriesTag34(c, a0 * (1 - ramp(t, 1.2, 0.3)));
      const a1 = ramp(t, tRe - 0.2, 0.25) * (1 - ramp(t, tQu - 0.4, 0.25)); quote2(c, 'RESTE JUSQU\'AU BOUT', '', a1, 270, 74);
      const a2 = ramp(t, tQu - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'CE QUE LEURS QUESTIONS', 'LEUR ONT COÛTÉ', a2, 260, 66, 92 * ramp(t, tCt - 0.6, 0.3) + 0.01);
    },
  },
  // 3. in the time of Moussa, a rich man was killed (lamp blown out, never shown); the exegetes: his nephew, for the inheritance, threw the body before another clan
  murder: {
    grade: 'rgba(200,190,230,0.08)',
    draw(c, t, d) {
      const tMo = at('murder', 'moussa', 0, 1.0), tRi = at('murder', 'riche', 0, 3.4), tTu = at('murder', 'tue', 0, 4.4), tNe = at('murder', 'neveu', 0, 6.6), tHe = at('murder', 'heriter', 0, 7.9), tJe = at('murder', 'jete', 0, 9.6), tCl = at('murder', 'clan', 0, 11.8);
      shots(c, t, [
        [0, (cc, q) => camp34(cc, t, Object.assign({}, DAY34, { z: lerp(1.15, 1.2, ease(seg(q, 0, tRi))), cy: 1380, walkers: assembly34(t) }))],
        [tRi - 0.2, (cc, q) => camp34(cc, t, Object.assign({}, DUSK34, { z: lerp(1.8, 1.86, ease(seg(q, 0, tTu - tRi))), cx: 480 + q * 30, cy: 1540, walkers: c2 => { const dist = q * 50;
          fig(c2, RICH34, { x: 360 + dist, y: 1660, h: hY34(1660), dir: 1, t, light: 0.95, wind: 0.3, ink: 0.7, walk: stepOf(dist, hY34(1660)), staff: true });
          fig(c2, NEPHEW34, { x: 220 + dist, y: 1620, h: hY34(1620), dir: 1, t: t + 2, light: 0.85, wind: 0.3, ink: 0.7, walk: stepOf(dist, hY34(1620)) + 0.4 }); } }))],
        [tTu - 0.2, (cc, q) => camp34(cc, t, Object.assign({}, NIGHT34, { z: lerp(3.0, 3.1, ease(seg(q, 0, tNe - tTu))), cx: 1040, cy: 1290, fg: false, lamp: 0.9 * (1 - ramp(q, 0.4, 0.8)) }))],
        [tNe - 0.2, (cc, q) => camp34(cc, t, Object.assign({}, NIGHT34, { z: lerp(2.0, 2.06, ease(seg(q, 0, tJe - tNe))), cx: 420, cy: 1560, walkers: c2 => fig(c2, NEPHEW34, { x: 430, y: 1700, h: hY34(1700), dir: -1, t, light: 0.6, wind: 0.3, ink: 0.6 }) }))],
        [tJe - 0.2, (cc, q) => camp34(cc, t, Object.assign({}, NIGHT34, { z: lerp(1.7, 1.75, ease(seg(q, 0, d - tJe))), cx: 760, cy: 1440, walkers: c2 => { covered34(c2, 920, 1460, 0.42, t, { night: 1 });
          const dist = q * 60; fig(c2, NEPHEW34, { x: 700 - dist, y: 1560, h: hY34(1560), dir: -1, t, light: 0.55, wind: 0.3, ink: 0.6, walk: stepOf(dist, hY34(1560)) }); } }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tRi - 0.4, 0.25)); quote2(c, 'AU TEMPS DE MOUSSA', '', a1 * ramp(t, tMo - 0.5, 0.3), 270, 80); caption(c, 'paix sur lui', 370, a1 * ramp(t, tMo, 0.3), 34);
      const a2 = ramp(t, tRi - 0.2, 0.25) * (1 - ramp(t, tNe - 0.4, 0.25)); quote2(c, 'UN HOMME RICHE', 'FUT TUÉ', a2, 260, 88, 88 * ramp(t, tTu - 0.4, 0.3) + 0.01);
      const a3 = ramp(t, tNe - 0.2, 0.25) * (1 - ramp(t, tJe - 0.4, 0.25)); quote2(c, 'SON NEVEU', 'POUR HÉRITER', a3, 260, 96, 88 * ramp(t, tHe - 0.5, 0.3) + 0.01); caption(c, 'selon les exégètes', 470, a3, 30);
      const a4 = ramp(t, tJe - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'DEVANT', 'UN AUTRE CLAN', a4 * ramp(t, tCl - 1.2, 0.3), 260, 92, 92); caption(c, 'selon les exégètes', 470, a4, 30);
    },
  },
  // 4. each clan accused the other (Al-Baqara 72: "you disputed over it"); they came to Moussa: « ask your Lord who killed him »
  dispute: {
    grade: 'rgba(255,210,170,0.08)',
    draw(c, t, d) {
      const tAc = at('dispute', 'accusait', 0, 1.2), tCo = at('dispute', 'colere', 0, 2.6), tVi = at('dispute', 'vinrent', 0, 4.4), tDe = at('dispute', 'demande', 0, 6.2), tTu = at('dispute', 'tue', 0, 8.2);
      shots(c, t, [
        [0, (cc, q) => camp34(cc, t, Object.assign({}, MORN34, { z: lerp(1.4, 1.45, ease(seg(q, 0, tCo))), cy: 1480, walkers: clans34(t, ramp(q, 0.2, 0.8)) }))],
        [tCo - 0.2, (cc, q) => camp34(cc, t, Object.assign({}, MORN34, { z: lerp(2.1, 2.2, ease(seg(q, 0, tVi - tCo))), cx: 540, cy: 1540, shake: 0.06, walkers: clans34(t, 1, ramp(q, 0.2, 0.4)) }))],
        [tVi - 0.2, (cc, q) => camp34(cc, t, Object.assign({}, MORN34, { z: lerp(1.3, 1.34, ease(seg(q, 0, tDe - tVi))), cx: 600, cy: 1460, walkers: c2 => { const dist = q * 55;
          [[60, 1540, 0], [-60, 1600, 2], [130, 1660, 4], [-20, 1720, 6], [250, 1580, 1], [200, 1700, 3]].forEach(([x, y, f], j) => fig(c2, ISR34[f], { x: x + dist, y, h: hY34(y), dir: 1, t: t + j, light: 0.95, wind: 0.3, ink: 0.65, walk: stepOf(dist, hY34(y)) + j * 0.3 }));
          musaAt34(c2, t); } }))],
        [tDe - 0.2, (cc, q) => camp34(cc, t, Object.assign({}, MORN34, { z: lerp(2.2, 2.28, ease(seg(q, 0, d - tDe))), cx: 700, cy: 1520, walkers: c2 => {
          [[520, 1600, 0, 0.8], [640, 1700, 2, 0], [430, 1680, 4, 0.5]].forEach(([x, y, f, r], j) => fig(c2, ISR34[f], { x, y, h: hY34(y), dir: 1, t: t + j, light: 1, wind: 0.3, ink: 0.7, reach: r, dua: j === 1 }));
          musaAt34(c2, t); } }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tVi - 0.4, 0.25)); quote2(c, 'CHAQUE CLAN', 'ACCUSAIT L\'AUTRE', a1, 260, 92, 88 * ramp(t, tAc - 0.5, 0.3) + 0.01); caption(c, '« vous vous disputiez à son sujet » · Al-Baqara, verset 72', 470, a1 * ramp(t, tCo, 0.3), 27);
      const a2 = ramp(t, tVi - 0.2, 0.25) * (1 - ramp(t, tDe - 0.4, 0.25)); quote2(c, 'ILS VINRENT VOIR', 'MOUSSA', a2, 260, 84, 96);
      const a3 = ramp(t, tDe - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, '« DEMANDE À TON SEIGNEUR', 'QUI L\'A TUÉ »', a3, 260, 64, 92 * ramp(t, tTu - 0.8, 0.3) + 0.01); caption(c, 'selon les exégètes', 470, a3, 30);
    },
  },
  // 5. « Allah orders you to slaughter a cow » — « do you mock us? » — « I seek refuge in Allah from being among the ignorant » (Al-Baqara 67)
  order: {
    grade: 'rgba(255,220,180,0.08)',
    draw(c, t, d) {
      const tOr = at('order', 'ordonne', 0, 2.4), tVa = at('order', 'vache', 0, 3.8), tRe = at('order', 'repondirent', 0, 4.8), tMq = at('order', 'moques', 0, 6.8), tDi = at('order', 'dit', 1, 8.2), tPr = at('order', 'protege', 0, 9.6), tIg = at('order', 'ignorants', 0, 11.6);
      shots(c, t, [
        [0, (cc, q) => camp34(cc, t, Object.assign({}, DAY34, { z: lerp(1.3, 1.36, ease(seg(q, 0, tVa))), cx: 560, cy: 1460, light: 0.3 * ramp(q, 0.3, 1), lightX: MX34, lightW: 260, walkers: assembly34(t, { m: { armUp: 0.9 * ramp(q, tOr - 0.6, 0.5) } }) }))],
        [tVa - 0.2, (cc, q) => camp34(cc, t, Object.assign({}, DAY34, { z: lerp(2.4, 2.5, ease(seg(q, 0, tRe - tVa))), cx: MX34 - 60, cy: 1500, light: 0.3, lightX: MX34, lightW: 260, walkers: assembly34(t, { m: { armUp: 0.9 } }) }))],
        [tRe - 0.2, (cc, q) => camp34(cc, t, Object.assign({}, DAY34, { z: lerp(2.0, 2.08, ease(seg(q, 0, tDi - tRe))), cx: 380, cy: 1560, walkers: assembly34(t, { musa: false, fn: (p, i) => ({ dir: i % 3 === 1 ? turnDir(q, 0.4 + (i % 4) * 0.2, 1, -1, 0.4) : 1, armUp: i % 3 === 0 ? 0.45 * ramp(q, tMq - tRe - 0.4, 0.4) : 0, reach: i % 3 === 2 ? 0.7 * ramp(q, 0.5, 0.4) : 0 }) }) }))],
        [tDi - 0.2, (cc, q) => camp34(cc, t, Object.assign({}, DAY34, { z: lerp(2.5, 2.6, ease(seg(q, 0, d - tDi))), cx: MX34 - 40, cy: 1520, light: 0.25 * ramp(q, 0.5, 1), lightX: MX34, lightW: 240, walkers: assembly34(t, { m: { dua: q > 0.6 } }) }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tRe - 0.4, 0.25)); topShade(c, a1 * 1.3); arabic(c, 'إن الله يأمركم أن تذبحوا بقرة', 230, a1, 62);
      bigWord27(c, '« ALLAH VOUS ORDONNE', 345, a1 * ramp(t, tOr - 0.5, 0.3), 66); bigWord27(c, 'D\'ÉGORGER UNE VACHE »', 435, a1 * ramp(t, tVa - 0.9, 0.3), 74, '#f6c453'); caption(c, 'Al-Baqara, verset 67', 505, a1, 28);
      const a2 = ramp(t, tRe - 0.2, 0.25) * (1 - ramp(t, tDi - 0.4, 0.25)); topShade(c, a2 * 1.3); arabic(c, 'أتتخذنا هزوا', 230, a2 * ramp(t, tMq - 0.8, 0.3), 100); quote2(c, '« TU TE MOQUES', 'DE NOUS ? »', a2 * ramp(t, tMq - 0.8, 0.3), 345, 80, 92);
      const a3 = ramp(t, tDi - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); topShade(c, a3 * 1.3); arabic(c, 'أعوذ بالله أن أكون من الجاهلين', 230, a3, 58);
      bigWord27(c, '« QU\'ALLAH ME PROTÈGE', 345, a3 * ramp(t, tPr - 0.5, 0.3), 66); bigWord27(c, 'D\'ÊTRE PARMI LES IGNORANTS »', 430, a3 * ramp(t, tIg - 0.9, 0.3), 56, '#f6c453');
    },
  },
  // 6. instead of obeying, questions: « which cow? » — neither old nor too young, between the two (Al-Baqara 68)
  age: {
    grade: 'rgba(255,215,170,0.08)',
    draw(c, t, d) {
      const tQs = at('age', 'questions', 0, 2.6), tQu = at('age', 'quelle', 0, 3.6), tVi = at('age', 'vieille', 0, 4.8), tJe = at('age', 'jeune', 0, 5.9), tEn = at('age', 'entre', 0, 6.8), tFa = at('age', 'faites', 0, 8.4);
      const tc = q0 => q => threeCows34(t, { dimOld: ramp(t, tVi + 0.2, 0.5), dimCalf: ramp(t, tJe + 0.2, 0.5), mid: 0.6 * ramp(t, tEn, 0.5) });
      shots(c, t, [
        [0, (cc, q) => camp34(cc, t, Object.assign({}, DAY34, { z: lerp(1.35, 1.42, ease(seg(q, 0, tQs))), cy: 1480, walkers: assembly34(t, { fn: (p, i) => ({ armUp: (i % 2) * 0.85 * ramp(q, 0.2 + (i % 7) * 0.2, 0.3) }) }) }))],
        [tQs - 0.2, (cc, q) => camp34(cc, t, Object.assign({}, DAY34, { z: lerp(2.2, 2.3, ease(seg(q, 0, tQu - tQs))), cx: 360, cy: 1560, walkers: assembly34(t, { musa: false, fn: (p, i) => ({ armUp: (i % 2) * 0.85, reach: (1 - i % 2) * 0.6 }) }) }))],
        [tQu - 0.2, (cc, q) => pasture34(cc, t, Object.assign({}, DAY34, { z: lerp(1.38, 1.44, ease(seg(q, 0, tEn - tQu))), cx: 540, cy: 1560, walkers: tc()(q) }))],
        [tEn - 0.2, (cc, q) => pasture34(cc, t, Object.assign({}, DAY34, { z: lerp(2.3, 2.4, ease(seg(q, 0, tFa - tEn))), cx: 540, cy: 1640, walkers: tc()(q) }))],
        [tFa - 0.2, (cc, q) => camp34(cc, t, Object.assign({}, DAY34, { z: lerp(2.4, 2.5, ease(seg(q, 0, d - tFa))), cx: MX34 - 60, cy: 1500, walkers: assembly34(t, { m: { reach: 0.8 } }) }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tQu - 0.4, 0.25)); quote2(c, 'AU LIEU D\'OBÉIR…', 'DES QUESTIONS', a1, 260, 84, 92 * ramp(t, tQs - 0.5, 0.3) + 0.01);
      const a2 = ramp(t, tQu - 0.2, 0.25) * (1 - ramp(t, tFa - 0.4, 0.25)); quote2(c, '« QUELLE VACHE ? »', '', a2 * (1 - ramp(t, tVi - 0.3, 0.2)), 270, 92);
      const a3 = a2 * ramp(t, tVi - 0.3, 0.2); topShade(c, a3 * 1.3); arabic(c, 'لا فارض ولا بكر عوان بين ذلك', 230, a3, 60);
      bigWord27(c, 'NI VIEILLE, NI TROP JEUNE', 345, a3, 62); bigWord27(c, 'ENTRE LES DEUX', 435, a3 * ramp(t, tEn - 0.4, 0.3), 84, '#f6c453'); caption(c, 'Al-Baqara, verset 68', 505, a3, 28);
      const a4 = ramp(t, tFa - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, '« FAITES DONC CE QU\'ON', 'VOUS ORDONNE ! »', a4, 260, 66, 84); caption(c, 'Al-Baqara, verset 68', 470, a4, 28);
    },
  },
  // 7. « which colour? » — bright yellow, pleasing to those who look at her (Al-Baqara 69)
  color: {
    grade: 'rgba(255,225,160,0.08)',
    draw(c, t, d) {
      const tCo = at('color', 'couleur', 0, 1.0), tJa = at('color', 'jaune', 0, 1.9), tEc = at('color', 'eclatant', 0, 3.0), tRe = at('color', 'rejouit', 0, 4.4);
      const yel = ramp(t, tJa - 0.1, 0.9);
      shots(c, t, [
        [0, (cc, q) => pasture34(cc, t, Object.assign({}, DAY34, { z: lerp(2.6, 2.75, ease(seg(q, 0, tRe))), cx: 600, cy: 1620, sunA: 0.7 + 0.3 * yel, walkers: c2 => { cow34(c2, 560, 1720, 0.95, t, { col: 'brown' }); if (yel > 0) { c2.save(); c2.globalAlpha *= yel; cow34(c2, 560, 1720, 0.95, t, { col: 'yellow', glow: 0.8 * ramp(t, tEc - 0.2, 0.5) }); c2.restore(); } } }))],
        [tRe - 0.2, (cc, q) => pasture34(cc, t, Object.assign({}, DAY34, { sunA: 1, k: 0.5, z: lerp(1.4, 1.45, ease(seg(q, 0, d - tRe))), cy: 1500, walkers: c2 => { cow34(c2, 560 + q * 40, 1680, 0.7, t, { dist: q * 40, glow: 0.8 });
          [[200, 1600, 1, 1], [300, 1720, 3, 1], [880, 1620, 5, -1], [960, 1720, 6, -1]].forEach(([x, y, f, dd], j) => fig(c2, ISR34[f], { x, y, h: hY34(y), dir: dd, t: t + j, light: 1.05, wind: 0.3, ink: 0.65, armUp: j % 2 ? 0.75 * ramp(q, 0.3 + j * 0.2, 0.4) : 0, reach: j % 2 ? 0 : 0.5 })); } }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.05, 0.25) * (1 - ramp(t, tRe - 0.4, 0.25)); quote2(c, '« QUELLE COULEUR ? »', '', a1 * (1 - ramp(t, tJa - 0.3, 0.2)), 270, 88);
      const a2 = a1 * ramp(t, tJa - 0.3, 0.2); topShade(c, a2 * 1.3); arabic(c, 'صفراء فاقع لونها', 230, a2, 96); bigWord27(c, 'JAUNE', 350, a2, 110, '#f6c453'); bigWord27(c, 'ÉCLATANT', 455, a2 * ramp(t, tEc - 0.4, 0.3), 84, '#ffe08a');
      const a3 = ramp(t, tRe - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'QUI RÉJOUIT', 'CEUX QUI LA REGARDENT', a3, 260, 88, 72); caption(c, 'Al-Baqara, verset 69', 470, a3, 28);
    },
  },
  // 8. « cows look alike to us! » — a cow never put to plough nor to water the fields, sound, without a blemish (Al-Baqara 70-71)
  noyoke: {
    grade: 'rgba(255,215,170,0.08)',
    draw(c, t, d) {
      const tRs = at('noyoke', 'ressemblent', 0, 1.4), tPr = at('noyoke', 'precise', 0, 5.0), tLa = at('noyoke', 'laboure', 0, 7.4), tAr = at('noyoke', 'arrose', 0, 8.6), tSa = at('noyoke', 'saine', 0, 10.4), tTa = at('noyoke', 'tache', 0, 12.2);
      shots(c, t, [
        [0, (cc, q) => pasture34(cc, t, Object.assign({}, DAY34, { farHerd: true, z: lerp(1.05, 1.12, ease(seg(q, 0, tPr))), cy: 1300, walkers: c2 => { herd34(t)(c2);
          [[160, 1780, 1, 1], [920, 1790, 4, -1]].forEach(([x, y, f, dd], j) => fig(c2, ISR34[f], { x, y, h: hY34(y), dir: dd, t: t + j, light: 1, wind: 0.3, ink: 0.7, armUp: 0.5 * ramp(q, 0.3 + j * 0.3, 0.4), reach: 0.4 })); } }))],
        [tPr - 0.2, (cc, q) => camp34(cc, t, Object.assign({}, DAY34, { z: lerp(2.4, 2.5, ease(seg(q, 0, tLa - tPr))), cx: MX34 - 60, cy: 1500, light: 0.3, lightX: MX34, lightW: 240, walkers: assembly34(t, { m: { armUp: 0.7 } }) }))],
        [tLa - 0.4, (cc, q) => { pasture34(cc, t, Object.assign({}, DAY34, { stream: false, z: lerp(1.6, 1.65, ease(seg(q, 0, tAr - tLa))), cx: 520, cy: 1560, walkers: c2 => plough34(c2, 380, 1720, 0.72, t, 40 + q * 50) })); visionFx34(cc, 0.8); noSign34(cc, 540, 900, 300, seg(q, 0.7, 1.6)); }],
        [tAr - 0.2, (cc, q) => { pasture34(cc, t, Object.assign({}, DAY34, { stream: false, z: lerp(1.6, 1.65, ease(seg(q, 0, tSa - tAr))), cx: 520, cy: 1560, walkers: c2 => irrigWell34(c2, 260, 1680, 0.72, t, 60 + q * 120, { who: false }) })); visionFx34(cc, 0.8); noSign34(cc, 540, 900, 300, seg(q, 0.6, 1.4)); }],
        [tSa - 0.2, (cc, q) => pasture34(cc, t, Object.assign({}, DAY34, { sunA: 1, z: lerp(2.3, 2.4, ease(seg(q, 0, d - tSa))), cx: 560, cy: 1600, walkers: c2 => cow34(c2, 420 + q * 45, 1720, 0.9, t, { dist: q * 45, glow: 0.9 }) }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tPr - 0.4, 0.25)); topShade(c, a1 * 1.3); arabic(c, 'إن البقر تشابه علينا', 230, a1, 84); quote2(c, '« LES VACHES SE', 'RESSEMBLENT ! »', a1 * ramp(t, tRs - 0.8, 0.3), 345, 76, 88); caption(c, 'Al-Baqara, verset 70', 545, a1, 28);
      const a2 = ramp(t, tPr - 0.2, 0.25) * (1 - ramp(t, tLa - 0.6, 0.25)); quote2(c, 'PLUS PRÉCISE', '', a2, 270, 92);
      const a3 = ramp(t, tLa - 0.4, 0.25) * (1 - ramp(t, tAr - 0.4, 0.25)); quote2(c, 'JAMAIS LABOURÉ', '', a3, 270, 92);
      const a4 = ramp(t, tAr - 0.2, 0.25) * (1 - ramp(t, tSa - 0.4, 0.25)); quote2(c, 'NI ARROSÉ LES CHAMPS', '', a4, 270, 80);
      const a5 = ramp(t, tSa - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); topShade(c, a5 * 1.3); arabic(c, 'مسلمة لا شية فيها', 230, a5, 92); quote2(c, 'SAINE,', 'SANS AUCUNE TACHE', a5, 345, 92, 80 * ramp(t, tTa - 0.9, 0.3) + 0.01); caption(c, 'Al-Baqara, verset 71', 545, a5, 28);
    },
  },
  // 9. « now you have brought the truth »; (the récits) one cow only, at a great price; they slaughtered it — and nearly did not (Al-Baqara 71). Never shown: backs, a rope.
  price: {
    grade: 'rgba(255,200,150,0.09)',
    draw(c, t, d) {
      const tVe = at('price', 'verite', 0, 1.8), tRc = at('price', 'recits', 0, 3.0), tSe = at('price', 'seule', 0, 4.0), tFo = at('price', 'fortune', 0, 7.4), tEg = at('price', 'egorgerent', 0, 8.6), tFa = at('price', 'failli', 0, 11.6);
      const sale = (q, k) => c2 => { cow34(c2, 390, 1700, 0.6, t, { halter: true, glow: 0.4 }); const [ax, ay] = cowAnchor34(390, 1700, 0.6, 1, {});
        fig(c2, OWNER34, { x: 590, y: 1690, h: hY34(1690), dir: -1, t, light: 1, wind: 0.3, ink: 0.7, reach: 0.5 }); const [hx, hy] = handOf({ x: 590, y: 1690, h: hY34(1690), dir: -1, reach: 0.5 }); rope(c2, ax, ay, hx, hy, 40, 0.8);
        goldHeap32(c2, 725, 1730, 0.55 * (0.4 + 0.6 * k), t, 7);
        [[830, 1640, 1], [890, 1720, 3]].forEach(([x, y, f], j) => fig(c2, ISR34[f], { x, y, h: hY34(y), dir: -1, t: t + j, light: 1, wind: 0.3, ink: 0.7, reach: 0.6 * k })); };
      shots(c, t, [
        [0, (cc, q) => camp34(cc, t, Object.assign({}, DAY34, { z: lerp(1.35, 1.4, ease(seg(q, 0, tRc))), cy: 1480, walkers: assembly34(t, { fn: (p, i) => ({ armUp: i % 4 === 0 ? 0.6 : 0 }) }) }))],
        [tRc - 0.2, (cc, q) => camp34(cc, t, Object.assign({}, DUSK34, { z: lerp(1.5, 1.55, ease(seg(q, 0, tFo - tRc))), cx: 590, cy: 1560, walkers: sale(q, ramp(q, 1.0, 1.5)) }))],
        [tFo - 0.2, (cc, q) => camp34(cc, t, Object.assign({}, DUSK34, { z: lerp(2.6, 2.7, ease(seg(q, 0, tEg - tFo))), cx: 680, cy: 1680, walkers: c2 => { sale(q, 1)(c2); coins(c2, 610, 1745, 1.3, Math.floor(4 + 16 * ramp(q, 0, 1.2)), t); } }))],
        [tEg - 0.2, (cc, q) => camp34(cc, t, Object.assign({}, DUSK34, { k: 0.6, z: lerp(1.5, 1.55, ease(seg(q, 0, tFa - tEg - 0.6))), cy: 1500, walkers: c2 => { crowd34(c2, t, { face: 540, light: 0.8 }); musaAt34(c2, t, { x: 980, y: 1600, h: hY34(1600) }); } }))],
        [tFa - 0.8, (cc, q) => camp34(cc, t, Object.assign({}, DUSK34, { k: 0.7, sunA: 0.5, z: lerp(3.2, 3.3, ease(seg(q, 0, d - tFa))), cx: 540, cy: 1730, fg: false, walkers: c2 => { ropeCoil(c2, 540, 1760, 2.2); rope(c2, 600, 1756, 760, 1770, 6, 2); } }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tRc - 0.4, 0.25)); topShade(c, a1 * 1.3); arabic(c, 'الآن جئت بالحق', 230, a1, 96); quote2(c, '« MAINTENANT, TU DIS', 'LA VÉRITÉ ! »', a1, 345, 66, 92 * ramp(t, tVe - 0.6, 0.3) + 0.01);
      const a2 = ramp(t, tRc - 0.2, 0.25) * (1 - ramp(t, tFo - 0.4, 0.25)); quote2(c, 'UNE SEULE VACHE', '', a2 * ramp(t, tSe - 0.4, 0.3), 270, 88); caption(c, 'selon les récits (Ibn Kathir)', 370, a2, 30);
      const a3 = ramp(t, tFo - 0.2, 0.25) * (1 - ramp(t, tEg - 0.4, 0.25)); quote2(c, 'UNE FORTUNE', '', a3, 270, 104); caption(c, 'selon les récits', 380, a3, 30);
      const a4 = ramp(t, tEg - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); topShade(c, a4 * 1.3); arabic(c, 'فذبحوها وما كادوا يفعلون', 230, a4, 76);
      bigWord27(c, 'ILS L\'ÉGORGÈRENT ENFIN…', 345, a4, 66); bigWord27(c, 'ILS AVAIENT FAILLI NE PAS LE FAIRE', 430, a4 * ramp(t, tFa - 0.6, 0.3), 50, '#f6c453'); caption(c, 'Al-Baqara, verset 71', 500, a4, 28);
    },
  },
  // 10. the miracle (Al-Baqara 73): « strike him with part of it »; the dead man rose; (the exegetes) he named his killer, then fell back lifeless
  miracle: {
    grade: 'rgba(255,200,150,0.08)',
    draw(c, t, d) {
      const tFr = at('miracle', 'frappez', 0, 1.0), tMc = at('miracle', 'morceau', 0, 2.8), tRl = at('miracle', 'releva', 0, 5.2), tNo = at('miracle', 'nomma', 0, 7.6), tMe = at('miracle', 'meurtrier', 0, 8.4), tRt = at('miracle', 'retomba', 0, 9.6);
      const rise = ease(seg(t, tRl - 0.9, tRl + 0.3)) * (1 - ease(seg(t, tRt - 0.1, tRt + 1.4)));
      const kneel = c2 => { const o = { x: 215, y: 1720, h: hY34(1720) * 0.9, pose: 'kneel', dir: 1, t, light: 0.95, ink: 0.7, reach: 0.8 * ramp(t, tMc - 0.4, 0.8) }; fig(c2, ISR34[1], o); const [hx, hy] = handOf(o); bundle34(c2, hx + 8, hy, 1.7); };
      shots(c, t, [
        [0, (cc, q) => hero34(cc, t, { rise: 0, turn: 0, z: lerp(1.45, 1.5, ease(seg(q, 0, tMc))) })],
        [tMc - 0.2, (cc, q) => hero34(cc, t, { rise: 0, turn: 0, z: lerp(2.3, 2.4, ease(seg(q, 0, tRl - tMc - 0.9))), cx: 400, cy: 1580, walkers: c2 => { heroCrowd34(t, { rise: 0, turn: 0 })(c2); kneel(c2); } })],
        [tRl - 0.9, (cc, q) => { hero34(cc, t, { rise, turn: 0, z: lerp(1.6, 1.5, ease(seg(q, 0, 1.4))), shake: 0.05 * Math.exp(-Math.max(0, q - 0.9) * 3) * (q > 0.6 ? 1 : 0), light: 0.35 * rise, lightX: 500 }); flashW(cc, 0.35 * Math.exp(-Math.max(0, q - 0.9) * 4) * (q > 0.8 ? 1 : 0)); }],
        [tNo - 0.2, (cc, q) => hero34(cc, t, { rise, turn: ramp(q, 0.2, 0.8), z: lerp(2.0, 2.1, ease(seg(q, 0, tRt - tNo))), cx: 360, cy: 1560, light: 0.3 * rise, lightX: 500 })],
        [tRt - 0.2, (cc, q) => hero34(cc, t, { rise, turn: 1 - ramp(q, 1.0, 1.0), z: lerp(1.5, 1.42, ease(seg(q, 0, d - tRt))), light: 0.3 * rise, lightX: 500 })],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tRl - 1.1, 0.25)); topShade(c, a1 * 1.3); arabic(c, 'اضربوه ببعضها', 230, a1, 100);
      bigWord27(c, '« FRAPPEZ LE MORT', 345, a1 * ramp(t, tFr - 0.5, 0.3), 76); bigWord27(c, 'AVEC UN MORCEAU DE LA VACHE »', 430, a1 * ramp(t, tMc - 0.6, 0.3), 52, '#f6c453'); caption(c, 'Al-Baqara, verset 73', 500, a1, 28);
      const a2 = ramp(t, tRl - 0.5, 0.2) * (1 - ramp(t, tNo - 0.4, 0.25)); quote2(c, 'LE MORT', 'SE RELEVA', a2, 260, 100, 110);
      const a3 = ramp(t, tNo - 0.2, 0.25) * (1 - ramp(t, tRt - 0.4, 0.25)); quote2(c, 'IL NOMMA', 'SON MEURTRIER', a3, 260, 100, 96 * ramp(t, tMe - 0.5, 0.3) + 0.01); caption(c, 'selon les exégètes', 470, a3, 30);
      const a4 = ramp(t, tRt - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'PUIS RETOMBA', 'SANS VIE', a4, 260, 92, 100);
    },
  },
  // 11. the promise kept: Ibn Abbas (reported by at-Tabari): any cow would have sufficed; they made it hard, and it was made hard for them
  payoff: {
    grade: 'rgba(255,215,170,0.08)',
    draw(c, t, d) {
      const tAb = at('payoff', 'abbas', 0, 0.9), tIm = at('payoff', 'importe', 0, 3.4), tSu = at('payoff', 'suffi', 0, 5.4), tCo = at('payoff', 'complique', 0, 7.8), tCe = at('payoff', 'complique', 1, 10.0);
      shots(c, t, [
        [0, (cc, q) => pasture34(cc, t, Object.assign({}, DAY34, { farHerd: true, z: lerp(1.05, 1.1, ease(seg(q, 0, tIm))), cy: 1320, walkers: herd34(t) }))],
        [tIm - 0.2, (cc, q) => pasture34(cc, t, Object.assign({}, DAY34, { z: lerp(1.7, 1.76, ease(seg(q, 0, tCo - tIm))), cx: 560, cy: 1560, walkers: herd34(t, { pick: 8, k: 0.7 * ramp(q, tSu - tIm - 0.3, 0.5) }) }))],
        [tCo - 0.2, (cc, q) => camp34(cc, t, Object.assign({}, DAY34, { z: lerp(1.4, 1.46, ease(seg(q, 0, tCe - tCo))), cy: 1480, walkers: assembly34(t, { fn: (p, i) => ({ armUp: (i % 2) * 0.85 * (0.8 + 0.2 * Math.sin(t * 3 + i)) }) }) }))],
        [tCe - 0.2, (cc, q) => camp34(cc, t, Object.assign({}, DUSK34, { z: lerp(2.8, 2.9, ease(seg(q, 0, d - tCe))), cx: 600, cy: 1680, walkers: c2 => { goldHeap32(c2, 540, 1720, 0.8, t, 7); coins(c2, 700, 1740, 1.2, 14, t); } }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tIm - 0.4, 0.25)); quote2(c, 'IBN ABBAS A DIT :', '', a1 * ramp(t, tAb - 0.6, 0.3), 270, 84); caption(c, 'rapporté par at-Tabari', 370, a1, 30);
      const a2 = ramp(t, tIm - 0.2, 0.25) * (1 - ramp(t, tCo - 0.4, 0.25)); quote2(c, 'N\'IMPORTE QUELLE VACHE', 'AURAIT SUFFI', a2, 260, 70, 96 * ramp(t, tSu - 0.6, 0.3) + 0.01);
      const a3 = ramp(t, tCo - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'ILS SE SONT COMPLIQUÉ LA TÂCHE', 'ET ELLE LEUR FUT COMPLIQUÉE', a3, 260, 52, 56 * ramp(t, tCe - 0.6, 0.3) + 0.01);
      caption(c, 'voilà ce que leurs questions leur ont coûté', 470, a3 * ramp(t, tCe + 0.6, 0.4), 32);
    },
  },
  // 12. the lesson (Al-Baqara 73) in one sentence
  lesson: {
    grade: 'rgba(255,215,170,0.09)',
    draw(c, t, d) {
      const tRe = at('lesson', 'redonne', 0, 1.2), tMo = at('lesson', 'morts', 0, 2.4), tDe = at('lesson', 'demande', 0, 4.6), tSi = at('lesson', 'simple', 0, 5.6), tCp = at('lesson', 'complique', 0, 6.6), tOb = at('lesson', 'obeis', 0, 8.0), tPo = at('lesson', 'porte', 0, 8.8), tOu = at('lesson', 'ouverte', 0, 9.8);
      shots(c, t, [
        [0, (cc, q) => camp34(cc, t, Object.assign({}, MORN34, { k: 0.3, z: lerp(1.0, 1.06, ease(seg(q, 0, tDe))), cy: lerp(1200, 1230, ease(seg(q, 0, tDe))), light: 0.25 * ramp(q, 0.5, 1.5), walkers: assembly34(t, { fn: (p, i) => ({ dua: i % 3 === 0 }) }) }))],
        [tDe - 0.2, (cc, q) => pasture34(cc, t, Object.assign({}, MORN34, { z: lerp(1.9, 1.98, ease(seg(q, 0, tOb - tDe))), cx: 560, cy: 1580, walkers: c2 => cow34(c2, 380 + q * 40, 1700, 0.85, t, { dist: q * 40, glow: 0.7 }) }))],
        [tOb - 0.2, (cc, q) => camp34(cc, t, Object.assign({}, MORN34, { k: 0.6, z: lerp(2.6, 2.75, ease(seg(q, 0, d - tOb))), cx: 990, cy: 1330, fg: false, doorOpen: 2, doorLight: 0.4 + 0.6 * ramp(q, tPo - tOb - 0.2, 0.8) }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tDe - 0.4, 0.25)); topShade(c, a1 * 1.3); arabic(c, 'كذلك يحيي الله الموتى', 230, a1, 84);
      bigWord27(c, 'AINSI ALLAH REDONNE', 345, a1 * ramp(t, tRe - 0.6, 0.3), 70); bigWord27(c, 'LA VIE AUX MORTS', 435, a1 * ramp(t, tMo - 0.6, 0.3), 82, '#f6c453'); caption(c, 'Al-Baqara, verset 73', 505, a1, 28);
      const a2 = ramp(t, tDe - 0.2, 0.25) * (1 - ramp(t, tOb - 0.4, 0.25)); quote2(c, 'UNE CHOSE SIMPLE ?', 'NE LA COMPLIQUE PAS', a2 * ramp(t, tSi - 0.6, 0.3), 260, 80, 76 * ramp(t, tCp - 0.5, 0.3) + 0.01);
      const a3 = ramp(t, tOb - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'OBÉIS :', 'LA PORTE EST OUVERTE', a3, 260, 100, 74 * ramp(t, tPo - 0.5, 0.3) + 0.01);
    },
  },
  cta: {
    grade: 'rgba(255,190,140,0.08)',
    draw(c, t, d) {
      hero34(c, 60 + t, { z: lerp(1.56, 1.52, seg(t, 0, d)), cy: lerp(1515, 1505, seg(t, 0, d)) });
      c.fillStyle = 'rgba(6,8,18,0.3)'; c.fillRect(0, 0, W, H);
      ctaText34(c, seg(t, 0.1, 0.6));
    },
  },
  // the last frame dissolves into the first (hook)
  outro: {
    grade: 'rgba(255,190,140,0.08)',
    draw(c, t, d) {
      const back = seg(t, d - 0.8, d);
      if (back <= 0) { const cd = ((window.TL.scenes || []).find(s => s.id === 'cta') || { dur: 6 }).dur; hero34(c, 60 + cd + t, { z: lerp(1.52, 1.5, seg(t, 0, d - 0.8)), cy: lerp(1505, 1500, seg(t, 0, d - 0.8)) }); }
      else hero34(c, 0, {});
      const k = 1 - seg(t, d - 2.0, d - 1.2);
      c.fillStyle = `rgba(6,8,18,${0.3 * k})`; c.fillRect(0, 0, W, H);
      ctaText34(c, k);
      flashW(c, 0.3 * Math.sin(Math.PI * clamp((t - (d - 1.6)) / 1.6)));
      const a = seg(t, d - 0.8, d - 0.1); if (a > 0) { c.save(); c.globalAlpha = a; heroTexts34(c, 1); c.restore(); }
    },
  },
  cover: {
    draw(c) {
      hero34(c, 0.4, { z: 1.6, cx: 540, cy: 1560 });
      const g = c.createLinearGradient(0, 0, 0, 820); g.addColorStop(0, 'rgba(6,8,18,0.88)'); g.addColorStop(1, 'rgba(6,8,18,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 820);
      seriesTag34(c, 1);
      textS(c, 'UN MORT', 250, 1, '700 130px Lora', 130, '#fff6e0', 24);
      textGlow(c, 'S\'EST RELEVÉ', W / 2, 380, '700 104px Lora', '#f6c453', 1, '#000', 24);
      textGlow(c, 'pour nommer son meurtrier', W / 2, 490, 'italic 500 56px Lora', '#fff3dc', 1, '#000', 20);
      const g2 = c.createLinearGradient(0, 1420, 0, H); g2.addColorStop(0, 'rgba(6,8,18,0)'); g2.addColorStop(1, 'rgba(6,8,18,0.85)'); c.fillStyle = g2; c.fillRect(0, 1420, W, 500);
      arabic(c, 'سورة البقرة', 1650, 1, 120);
      textGlow(c, 'La vache des fils d\'Israël', W / 2, 1790, 'italic 500 54px Lora', '#fff3dc', 1, '#000', 14);
    },
  },
};
