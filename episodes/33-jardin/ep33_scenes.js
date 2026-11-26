
// sweep of the calamity: burn front following the dark front (left -> right)
const burnFront33 = sx => x => clamp((sx - x) / 260);
const GREEN33 = { sky: 'day', to: 'gold', k: 0.35, sunX: 900, sunY: 820, sunA: 0.7, burn: 0, open: 1 };

const SCENES = {
  // 1. HOOK — they left before dawn to harvest, whispering; when they arrived they did not recognise it: black as night (Al-Qalam 17-27). First frame = last frame.
  hook: {
    grade: 'rgba(255,190,150,0.08)',
    draw(c, t, d) {
      const tAv = at('hook', 'avant', 0, 1.3), tCh = at('hook', 'chuchotant', 0, 4.3), tAr = at('hook', 'arrivant', 0, 5.6), tRe = at('hook', 'reconnu', 0, 7.5), tNo = at('hook', 'noir', 0, 9.5);
      const PRE = { sky: 'night', to: 'dawn', k: 0.35, stars: 0.5, night: 0.75, burn: 1, open: 0, homeLamp: 0.8, fg: false, haze: '#6a6a8a' };
      const walk = (q, x0) => c2 => { const dist = q * 60; [[x0, 1640, 0, 380], [x0 - 150, 1600, 1, 340], [x0 - 280, 1660, 2, 390]].forEach(([x, y, i, h], j) => {
        const o = { x: x + dist, y, h, dir: 1, t: t + j, light: 0.7, wind: 0.3, ink: 0.6, walk: stepOf(dist, h) + j * 0.37 }; carrier33(c2, BRO33[i], o); }); };
      shots(c, t, [
        [0, (cc, q) => hero33(cc, t, { z: lerp(1.0, 1.05, ease(seg(q, 0, tAv))), cy: lerp(1250, 1265, ease(seg(q, 0, tAv))) })],
        [tAv - 0.2, (cc, q) => garden33(cc, t, Object.assign({}, PRE, { z: lerp(1.25, 1.3, ease(seg(q, 0, tCh - tAv))), cx: -440 + q * 60, cy: 1380, walkers: walk(q + 0, -320) }))],
        [tCh - 0.2, (cc, q) => garden33(cc, t, Object.assign({}, PRE, { k: 0.5, z: lerp(2.3, 2.38, ease(seg(q, 0, tAr - tCh))), cx: -440 + (tCh - tAv + q) * 60, cy: 1470, walkers: c2 => { walk(tCh - tAv + q, -320)(c2);
          whisper33(c2, -320 + (tCh - tAv + q) * 60 - 150 + 34, 1600 - 345 * 0.9 + 10, 0.9, t, 1, 1); } }))],
        [tAr - 0.2, (cc, q) => garden33(cc, t, Object.assign({}, PRE, { k: 0.7, night: 0.55, stars: 0.2, open: ease(seg(q, 0.5, 1.6)), z: lerp(1.5, 1.56, ease(seg(q, 0, tRe - tAr))), cy: 1360,
          walkers: c2 => { [[420, 1620, 1, 340, 1], [640, 1600, 0, 360, -1]].forEach(([x, y, i, h, dd], j) => fig(c2, BRO33[i], { x, y, h, dir: dd, t: t + j, light: 0.8, wind: 0.3, ink: 0.6, reach: ramp(q, 0.3, 0.5) * 0.7 })); basket33(c2, 300, 1680, 0.62, { fill: 0 }); fig(c2, BRO33[2], { x: 230, y: 1690, h: 400, dir: 1, t: t + 4, light: 0.8, ink: 0.6 }); } }))],
        [tRe - 0.2, (cc, q) => vineyard33(cc, t, { sky: 'dawn', to: 'gold', k: 0.2, sunA: 0.6, sunX: 820, sunY: 1100, burn: 1, smoke: 0.9, ash: 1, haze: '#e8c8b8', z: lerp(1.02, 1.1, ease(seg(q, 0, tNo - tRe))), cy: 1340,
          walkers: c2 => [[380, 1760, 0, 420, 1], [720, 1740, 2, 410, -1]].forEach(([x, y, i, h, dd], j) => { const back = ramp(q, 0.2, 0.8) * 30; fig(c2, BRO33[i], { x: x - dd * back, y, h, dir: dd, t: t + j, light: 0.9, wind: 0.4, ink: 0.7, armUp: 0.3 * ramp(q, 0.3, 0.4), walk: stepOf(-back, h) }); }) })],
        [tNo - 0.2, (cc, q) => hero33(cc, t, { z: lerp(1.16, 1.1, ease(seg(q, 0, d - tNo))), cy: 1270 })],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      heroTexts33(c, 1 - ramp(t, tAv - 0.4, 0.2));
      const a1 = ramp(t, tAv - 0.2, 0.2) * (1 - ramp(t, tAr - 0.4, 0.2)); quote2(c, 'AVANT L\'AUBE…', '', a1, 270, 92); caption(c, 'en chuchotant', 380, a1 * ramp(t, tCh - 0.3, 0.3), 40); seriesTag33(c, a1);
      const a2 = ramp(t, tAr - 0.2, 0.2) * (1 - ramp(t, tNo - 0.45, 0.2)); quote2(c, 'ILS NE L\'ONT', 'PAS RECONNU', a2 * ramp(t, tRe - 0.6, 0.25), 260, 96, 96); seriesTag33(c, a2);
      const a3 = ramp(t, tNo - 0.2, 0.2) * (1 - seg(t, d - 0.4, d)); quote2(c, 'NOIR', 'COMME LA NUIT', a3, 260, 120, 92); seriesTag33(c, a3); caption(c, 'Coran, sourate Al-Qalam, versets 17-33', 480, a3, 30);
    },
  },
  // 2. the story, the surah; the open loop (paid off in "middle"): « tu vas découvrir les mots qui leur ont manqué »
  promise: {
    grade: 'rgba(255,200,150,0.08)',
    draw(c, t, d) {
      const tGe = at('promise', 'gens', 0, 1.6), tSo = at('promise', 'sourate', 0, 3.3), tRe = at('promise', 'reste', 0, 4.8), tMo = at('promise', 'mots', 0, 7.9), tMa = at('promise', 'manque', 0, 9.1);
      shots(c, t, [
        [0, (cc, q) => garden33(cc, t, Object.assign({}, GREEN33, { open: 0, z: lerp(1.0, 1.05, ease(seg(q, 0, tSo))), cy: lerp(1120, 1150, ease(seg(q, 0, tSo))) }))],
        [tSo - 0.2, (cc, q) => vineyard33(cc, t, Object.assign({}, GREEN33, { z: lerp(1.5, 1.58, ease(seg(q, 0, tRe - tSo))), cx: lerp(460, 520, ease(seg(q, 0, tRe - tSo))), cy: 1420 }))],
        [tRe - 0.2, (cc, q) => garden33(cc, t, { sky: 'dusk', to: 'night', k: 0.3, sunA: 0.6, sunX: 200, sunY: 1150, open: 0, homeLamp: 0.6, z: lerp(1.6, 1.66, ease(seg(q, 0, tMo - tRe))), cy: 1380,
          walkers: c2 => [[330, 1640, 2, 380, 1], [520, 1620, 0, 400, 1], [700, 1650, 1, 370, -1]].forEach(([x, y, i, h, dd], j) => fig(c2, BRO33[i], { x, y, h, dir: dd, t: t + j, light: 0.85, wind: 0.3, ink: 0.65, armUp: j < 2 ? 0.8 * ramp(q, 0.4 + j * 0.15, 0.4) : 0 })) })],
        [tMo - 0.2, (cc, q) => sleepRoom33(cc, t, { z: lerp(1.6, 1.66, ease(seg(q, 0, d - tMo))), cx: 520, cy: 1660, lamp: 0.6 })],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a0 = ramp(t, 0.05, 0.25) * (1 - ramp(t, tSo - 0.4, 0.25)); topShade(c, a0 * 1.3); arabic(c, 'أصحاب الجنة', 250, a0, 120); bigWord27(c, 'LES GENS DU JARDIN', 390, a0 * ramp(t, tGe - 0.4, 0.3), 84, '#f6c453'); seriesTag33(c, a0 * (1 - ramp(t, 1.2, 0.3)));
      const a1 = ramp(t, tSo - 0.2, 0.25) * (1 - ramp(t, tRe - 0.4, 0.25)); topShade(c, a1 * 1.3); arabic(c, 'سورة القلم', 250, a1, 110); bigWord27(c, 'SOURATE AL-QALAM', 385, a1, 80, '#f6c453'); caption(c, 'sourate 68 · « le calame »', 465, a1, 30);
      const a2 = ramp(t, tRe - 0.2, 0.25) * (1 - ramp(t, tMo - 0.4, 0.25)); quote2(c, 'RESTE JUSQU\'AU BOUT', '', a2, 270, 74);
      const a3 = ramp(t, tMo - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'LES MOTS', 'QUI LEUR ONT MANQUÉ', a3, 260, 100, 72 * ramp(t, tMa - 0.6, 0.3) + 0.01);
    },
  },
  // 3. the father (the exegetes: Yemen near Sanaa, Sa'id ibn Jubayr in Ibn Kathir): a pious man, palms and vines, the share of the poor at each harvest
  father: {
    grade: 'rgba(255,215,170,0.08)',
    draw(c, t, d) {
      const tYe = at('father', 'yemen', 0, 2.4), tHo = at('father', 'homme', 0, 4.5), tPa = at('father', 'palmiers', 0, 6.6), tRe = at('father', 'recolte', 0, 9.1), tVe = at('father', 'venaient', 0, 10.6), tPt = at('father', 'part', 0, 13.0);
      const walker = (q) => c2 => { const dist = q * 42; fig(c2, FATHER33, { x: 300 + dist, y: 1700, h: 400, dir: 1, t, light: 1.05, wind: 0.35, ink: 0.7, staff: true, walk: stepOf(dist, 400) }); };
      const give = (q, k) => c2 => {
        basket33(c2, 720, 1650, 0.8, { fill: 1 }); basket33(c2, 800, 1690, 0.85, { fill: 1 }); basket33(c2, 650, 1700, 0.75, { fill: 0.8 });
        [[200, 1640, 0, 360], [330, 1680, 1, 330], [440, 1610, 2, 300], [80, 1700, 3, 380]].forEach(([x, y, i, h], j) => { const arr = Math.min(q, 2.2), dist = arr * 60 - 132;
          fig(c2, POOR33[i], { x: x + dist, y, h, dir: 1, t: t + j, light: 1, wind: 0.3, ink: 0.65, child: j === 2, walk: q < 2.2 ? stepOf(dist + 132, h) + j * 0.3 : null, reach: j === 2 ? 0.7 * k : 0.3 * k * (j % 2) }); });
        fig(c2, FATHER33, { x: 620, y: 1640, h: 400, dir: -1, t, light: 1.05, wind: 0.35, ink: 0.7, reach: 0.75 * k });
        if (k > 0.3) { const [hx, hy] = handOf({ x: 620, y: 1640, h: 400, dir: -1, reach: 0.75 * k }); basket33(c2, hx - 10, hy + 70 * k, 0.42, { fill: 1 }); } };
      shots(c, t, [
        [0, (cc, q) => garden33(cc, t, Object.assign({}, GREEN33, { open: 0, z: lerp(0.95, 1.0, ease(seg(q, 0, tHo))), cy: lerp(1080, 1120, ease(seg(q, 0, tHo))), cx: 640 }))],
        [tHo - 0.2, (cc, q) => vineyard33(cc, t, Object.assign({}, GREEN33, { z: lerp(1.3, 1.35, ease(seg(q, 0, tPa - tHo))), cx: 460 + q * 20, cy: 1400, walkers: walker(q) }))],
        [tPa - 0.2, (cc, q) => vineyard33(cc, t, Object.assign({}, GREEN33, { lush: 0.4, z: lerp(2.6, 2.7, ease(seg(q, 0, tRe - tPa))), cx: lerp(380, 460, ease(seg(q, 0, tRe - tPa))), cy: lerp(1140, 1340, ease(seg(q, 0, tRe - tPa))), walkers: walker(tPa - tHo + q) }))],
        [tRe - 0.2, (cc, q) => garden33(cc, t, Object.assign({}, GREEN33, { lush: 0.3, z: lerp(1.35, 1.4, ease(seg(q, 0, tPt - tRe))), cx: 460, cy: 1420, walkers: give(q, ramp(q, tVe - tRe + 0.6, 0.6)) }))],
        [tPt - 0.2, (cc, q) => garden33(cc, t, Object.assign({}, GREEN33, { lush: 0.3, z: lerp(2.3, 2.38, ease(seg(q, 0, d - tPt))), cx: 560, cy: 1460, walkers: give(9, 1) }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, tYe - 0.4, 0.25) * (1 - ramp(t, tHo - 0.4, 0.25)); quote2(c, 'AU YÉMEN', '', a1, 270, 100); caption(c, 'près de Sanaa, selon les exégètes (Ibn Kathir)', 380, a1, 30);
      const a2 = ramp(t, tHo - 0.2, 0.25) * (1 - ramp(t, tRe - 0.4, 0.25)); quote2(c, 'UN HOMME PIEUX', 'PALMIERS ET VIGNES', a2, 260, 88, 74 * ramp(t, tPa - 0.5, 0.3) + 0.01);
      const a3 = ramp(t, tRe - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'À CHAQUE RÉCOLTE', 'LA PART DES PAUVRES', a3, 260, 80, 80 * ramp(t, tVe - 0.3, 0.3) + 0.01); caption(c, 'selon les exégètes', 470, a3, 30);
    },
  },
  // 4. the father dies; the sons swear to harvest it all in the morning, leaving nothing to the poor (Al-Qalam 17); without saying « in sha Allah » (18, the exegetes)
  oath: {
    grade: 'rgba(255,190,150,0.1)',
    draw(c, t, d) {
      const tMo = at('oath', 'mort', 0, 0.6), tFi = at('oath', 'fils', 0, 1.4), tPa = at('oath', 'pauvres', 0, 2.9), tJu = at('oath', 'jurerent', 0, 5.1), tSa = at('oath', 'sans', 0, 7.5), tEt = at('oath', 'et', 0, 9.4), tSi = at('oath', 'si', 0, 13.0);
      const DU = { sky: 'dusk', to: 'night', k: 0.15, sunA: 0.7, sunX: 220, sunY: 1150, open: 0, homeLamp: 0.6, haze: '#e8b8a0' };
      const bros = (q, up, k0 = 0) => c2 => [[330, 1650, 2, 390, 1], [540, 1620, 0, 410, 1], [740, 1660, 1, 380, -1]].forEach(([x, y, i, h, dd], j) =>
        fig(c2, BRO33[i], { x, y, h, dir: i === 1 ? turnDir(q, 0.2, -1, -1) : dd, t: t + j, light: 0.9, wind: 0.35, ink: 0.7, armUp: i === 1 ? 0 : up, reach: i === 0 ? k0 : 0 }));
      const staff = c2 => { c2.strokeStyle = '#3e2818'; c2.lineWidth = 14; c2.lineCap = 'round'; c2.beginPath(); c2.moveTo(GX33 + 150, GW33 + 2); c2.lineTo(GX33 + 190, GW33 - 290); c2.stroke(); c2.strokeStyle = '#8a6040'; c2.lineWidth = 4; c2.beginPath(); c2.moveTo(GX33 + 146, GW33 - 4); c2.lineTo(GX33 + 184, GW33 - 280); c2.stroke(); c2.fillStyle = 'rgba(10,6,4,0.3)'; c2.beginPath(); c2.ellipse(GX33 + 152, GW33 + 3, 18, 4, 0, 0, 6.283); c2.fill(); };
      shots(c, t, [
        [0, (cc, q) => garden33(cc, t, Object.assign({}, DU, { z: lerp(1.6, 1.66, ease(seg(q, 0, tFi))), cx: 620, cy: 1330, onWall: staff }))],
        [tFi - 0.2, (cc, q) => garden33(cc, t, Object.assign({}, DU, { z: lerp(1.25, 1.3, ease(seg(q, 0, tPa - tFi))), cy: 1400, onWall: staff, walkers: bros(q, 0) }))],
        [tPa - 0.2, (cc, q) => garden33(cc, t, Object.assign({}, DU, { z: lerp(2.0, 2.08, ease(seg(q, 0, tJu - tPa))), cx: 480, cy: 1440, walkers: bros(q, 0, 0.7 * ramp(q, 0.2, 0.5)) }))],
        [tJu - 0.2, (cc, q) => garden33(cc, t, Object.assign({}, DU, { k: 0.4, z: lerp(1.4, 1.46, ease(seg(q, 0, tSa - tJu))), cy: 1420, walkers: bros(q, 0.85 * ramp(q, 0, 0.35)) }))],
        [tSa - 0.2, (cc, q) => garden33(cc, t, Object.assign({}, DU, { k: 0.55, z: lerp(1.15, 1.2, ease(seg(q, 0, tEt - tSa))), cy: 1300, open: 0, walkers: bros(9, 0.85) }))],
        [tEt - 0.2, (cc, q) => garden33(cc, t, Object.assign({}, DU, { k: 0.75, sunA: 0.3, stars: 0.3, z: lerp(1.85, 1.92, ease(seg(q, 0, d - tEt))), cx: 560, cy: 1440, walkers: bros(9, 0.85) }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tFi - 0.4, 0.25)); quote2(c, 'À SA MORT…', '', a1, 270, 92);
      const a2 = ramp(t, tFi - 0.2, 0.25) * (1 - ramp(t, tJu - 0.4, 0.25)); quote2(c, 'SES FILS', '« LES PAUVRES PRENNENT TROP »', a2, 260, 100, 56 * ramp(t, tPa - 0.4, 0.3) + 0.01);
      const a3 = ramp(t, tJu - 0.2, 0.25) * (1 - ramp(t, tEt - 0.4, 0.25)); topShade(c, a3 * 1.3); arabic(c, 'ليصرمنها مصبحين', 230, a3, 90);
      bigWord27(c, 'ILS JURÈRENT DE TOUT CUEILLIR', 345, a3, 58); bigWord27(c, 'SANS RIEN LAISSER', 435, a3 * ramp(t, tSa - 0.4, 0.3), 80, '#f6c453'); caption(c, 'Al-Qalam, verset 17', 505, a3, 28);
      const a4 = ramp(t, tEt - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'SANS DIRE…', '', a4, 270, 84); caption(c, 'Al-Qalam, verset 18 · selon les exégètes', 380, a4, 28);
      // the words they did not say: they light up for an instant, then go out
      const gk = ramp(t, tSi - 0.3, 0.4) * (1 - ramp(t, tSi + 1.3, 0.9)) * (0.75 + 0.25 * Math.sin(t * 13)); if (gk > 0) { c.save(); c.globalAlpha = 0.85; arabic(c, 'إن شاء الله', 520, gk, 120); c.restore(); }
      caption(c, '« si Allah le veut »', 640, gk, 40);
    },
  },
  // 5. while they slept, a calamity from your Lord passed over the garden (Al-Qalam 19); in the morning it was like the black night (20)
  night: {
    grade: 'rgba(170,180,230,0.1)',
    draw(c, t, d) {
      const tDo = at('night', 'dormaient', 0, 1.5), tFl = at('night', 'fleau', 0, 2.6), tPs = at('night', 'passa', 0, 4.3), tMa = at('night', 'matin', 0, 6.2), tNu = at('night', 'nuit', 0, 8.1);
      const NI = { sky: 'night', stars: 0.9, moon: 0.9, night: 1, open: 0, homeLamp: 0.4, fg: false, haze: '#3a3a5a' };
      const sx = lerp(-250, 1800, ease(seg(t, tFl - 0.3, tMa - 0.2)));
      shots(c, t, [
        [0, (cc, q) => sleepRoom33(cc, t, { z: lerp(1.6, 1.68, ease(seg(q, 0, tFl))), cx: 520, cy: 1660, lamp: lerp(0.4, 0.15, ramp(q, 0.5, 1.5)) })],
        [tFl - 0.2, (cc, q) => garden33(cc, t, Object.assign({}, NI, { z: lerp(1.0, 1.04, ease(seg(q, 0, tPs - tFl))), cy: 1180, sweep: sx, burn: burnFront33(sx), ember: 1, shake: 0.015 }))],
        [tPs - 0.2, (cc, q) => vineyard33(cc, t, Object.assign({}, NI, { z: lerp(1.25, 1.3, ease(seg(q, 0, tMa - tPs))), cy: 1300, sweep: sx - 300, burn: burnFront33(sx - 300), ember: 1 }))],
        [tMa - 0.2, (cc, q) => garden33(cc, t, { sky: 'dawn', to: 'grey', k: 0.5, sunA: 0.4, sunX: 880, sunY: 1160, burn: 1, soot: 1, open: 0, smoke: 1, haze: '#c8c0c0', z: lerp(1.0, 1.06, ease(seg(q, 0, tNu - tMa))), cy: 1140 })],
        [tNu - 0.2, (cc, q) => vineyard33(cc, t, { sky: 'dawn', to: 'grey', k: 0.5, sunA: 0.35, sunX: 880, sunY: 1100, burn: 1, smoke: 1, ash: 1, haze: '#c8c0c0', z: lerp(1.08, 1.18, ease(seg(q, 0, d - tNu))), cy: 1250 })],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tFl - 0.4, 0.25)); quote2(c, 'PENDANT', 'QU\'ILS DORMAIENT', a1, 260, 84, 84 * ramp(t, tDo - 0.6, 0.3) + 0.01);
      const a2 = ramp(t, tFl - 0.2, 0.25) * (1 - ramp(t, tMa - 0.4, 0.25)); topShade(c, a2 * 1.3); arabic(c, 'فطاف عليها طائف من ربك', 230, a2, 72);
      bigWord27(c, 'UN FLÉAU VENU', 345, a2, 82); bigWord27(c, 'DE TON SEIGNEUR', 440, a2, 82, '#f6c453'); caption(c, 'Al-Qalam, verset 19', 510, a2, 28);
      const a3 = ramp(t, tMa - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); topShade(c, a3 * 1.3); arabic(c, 'فأصبحت كالصريم', 230, a3, 96);
      bigWord27(c, 'COMME UNE', 350, a3 * ramp(t, tMa + 0.4, 0.3), 80); bigWord27(c, 'NUIT NOIRE', 450, a3 * ramp(t, tNu - 0.4, 0.3), 104, '#f6c453'); caption(c, 'Al-Qalam, verset 20', 525, a3, 28);
    },
  },
  // 6. at dawn they called one another (21-22), went off whispering: « let no poor man enter it today » (23-24); they went early, sure of themselves (25)
  dawn: {
    grade: 'rgba(190,190,240,0.08)',
    draw(c, t, d) {
      const tAp = at('dawn', "s'appelerent", 0, 1.3), tPa = at('dawn', 'partez', 0, 2.6), tCh = at('dawn', 'chemin', 0, 6.6), tBa = at('dawn', 'bas', 0, 8.6), tQu = at('dawn', "qu'aujourd'hui", 0, 9.3), tAv = at('dawn', 'avancaient', 0, 13.3), tSu = at('dawn', 'surs', 0, 14.3);
      const PRE = { sky: 'night', to: 'dawn', k: 0.3, stars: 0.6, night: 0.75, burn: 1, open: 0, fg: false, haze: '#6a6a8a' };
      const out = (q) => c2 => { [[HX33 + 40, 1600, 0, 360, 1], [HX33 - 90, 1560, 2, 330, 1], [HX33 + 200, 1590, 1, 340, -1]].forEach(([x, y, i, h, dd], j) => {
        const o = { x, y, h, dir: i === 1 ? turnDir(q, 1.0, -1, 1, 0.5) : dd, t: t + j, light: 0.75, wind: 0.3, ink: 0.6, armUp: i === 0 ? 0.9 * ramp(q, 0.2, 0.4) * (1 - ramp(q, 2.8, 0.5)) : 0 }; if (i === 0) fig(c2, BRO33[i], o); else carrier33(c2, BRO33[i], o); }); };
      const road = (q, x0, wh = 0) => c2 => { const dist = q * 62; [[x0, 1640, 0, 390], [x0 - 120, 1610, 1, 360], [x0 - 250, 1660, 2, 395]].forEach(([x, y, i, h], j) => {
        const o = { x: x + dist, y, h, dir: 1, t: t + j, light: 0.75, wind: 0.3, ink: 0.6, walk: stepOf(dist, h) + j * 0.37 }; carrier33(c2, BRO33[i], o); });
        if (wh > 0) { whisper33(c2, x0 + dist - 120 + 36, 1610 - 360 * 0.9 + 8, 0.9, t, 1, wh); whisper33(c2, x0 + dist + 36, 1640 - 390 * 0.9 + 8, 0.9, t + 0.4, 1, wh * 0.8); } };
      const hut = c2 => { shelter(c2, 1000, 1560, 1.1, t, '#7a6a54'); fig(c2, POOR33[1], { x: 1010, y: 1560, h: 260, pose: 'sit', dir: -1, t, light: 0.6, ink: 0.5 }); };
      shots(c, t, [
        [0, (cc, q) => garden33(cc, t, Object.assign({}, PRE, { homeLamp: 0.9, doorOpen: true, z: lerp(1.6, 1.66, ease(seg(q, 0, tPa))), cx: HX33 + 60, cy: 1360, walkers: out(q) }))],
        [tPa - 0.2, (cc, q) => garden33(cc, t, Object.assign({}, PRE, { homeLamp: 0.9, doorOpen: true, z: lerp(2.4, 2.48, ease(seg(q, 0, tCh - tPa))), cx: HX33 + 60, cy: 1380, walkers: out(tPa + q) }))],
        [tCh - 0.2, (cc, q) => garden33(cc, t, Object.assign({}, PRE, { k: 0.45, z: lerp(1.3, 1.34, ease(seg(q, 0, tBa - tCh))), cx: -640 + q * 62, cy: 1400, walkers: road(q, -520) }))],
        [tBa - 0.2, (cc, q) => garden33(cc, t, Object.assign({}, PRE, { k: 0.5, z: lerp(2.6, 2.66, ease(seg(q, 0, tQu - tBa))), cx: -620 + (tBa - tCh + q) * 62, cy: 1450, walkers: road(tBa - tCh + q, -520, 1) }))],
        [tQu - 0.2, (cc, q) => garden33(cc, t, Object.assign({}, PRE, { k: 0.55, z: lerp(1.5, 1.55, ease(seg(q, 0, tAv - tQu))), cx: 700 + q * 40, cy: 1420, walkers: c2 => { hut(c2); road(q, 500, 0.8)(c2); } }))],
        [tAv - 0.2, (cc, q) => garden33(cc, t, Object.assign({}, PRE, { k: 0.65, z: lerp(1.1, 1.14, ease(seg(q, 0, d - tAv))), cx: 360 + q * 50, cy: 1280, walkers: road(tAv - tQu + q, 120) }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, tAp - 0.4, 0.25) * (1 - ramp(t, tCh - 0.4, 0.25)); quote2(c, '« PARTEZ TÔT ! »', '', a1 * ramp(t, tPa - 0.5, 0.3), 270, 96); caption(c, 'à l\'aube, ils s\'appelèrent · Al-Qalam 21-22', 380, a1, 30);
      const a2 = ramp(t, tCh - 0.2, 0.25) * (1 - ramp(t, tQu - 0.4, 0.25)); quote2(c, 'TOUT BAS…', '', a2 * ramp(t, tBa - 0.6, 0.3), 270, 96);
      const a3 = ramp(t, tQu - 0.2, 0.25) * (1 - ramp(t, tAv - 0.4, 0.25)); topShade(c, a3 * 1.3); arabic(c, 'أن لا يدخلنها اليوم عليكم مسكين', 230, a3, 60);
      bigWord27(c, '« QU\'AUJOURD\'HUI, AUCUN', 340, a3, 66); bigWord27(c, 'PAUVRE N\'Y ENTRE ! »', 430, a3, 76, '#f6c453'); caption(c, 'Al-Qalam, versets 23-24', 500, a3, 28);
      const a4 = ramp(t, tAv - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'SÛRS D\'EUX', '', a4 * ramp(t, tSu - 0.6, 0.3), 270, 100); caption(c, 'Al-Qalam, verset 25', 380, a4, 30);
    },
  },
  // 7. when they saw it: « we have lost our way! » ... « no, we are deprived » (Al-Qalam 26-27)
  see: {
    grade: 'rgba(200,190,200,0.1)',
    draw(c, t, d) {
      const tVi = at('see', 'virent', 0, 1.1), tEg = at('see', 'egares', 0, 4.2), tCo = at('see', 'comprirent', 0, 6.2), tNo = at('see', 'non', 0, 7.3), tPr = at('see', 'prives', 0, 8.9);
      const MO = { sky: 'dawn', to: 'grey', k: 0.35, sunA: 0.55, sunX: 880, sunY: 1150, burn: 1, soot: 1, smoke: 0.8, haze: '#d0c4c0' };
      const gate = (q) => c2 => { basket33(c2, 300, 1690, 0.62, {}); fig(c2, BRO33[2], { x: 230, y: 1700, h: 400, dir: 1, t, light: 0.95, ink: 0.65 });
        [[430, 1620, 1, 340, 1], [650, 1600, 0, 360, -1]].forEach(([x, y, i, h, dd], j) => fig(c2, BRO33[i], { x, y, h, dir: dd, t: t + j, light: 0.95, wind: 0.3, ink: 0.65, reach: 0.7 })); };
      const lost = (q) => c2 => [[300, 1740, 0, 420], [560, 1700, 1, 380], [800, 1750, 2, 430]].forEach(([x, y, i, h], j) => { const dd = turnDir(q, 0.2 + j * 0.25, j === 2 ? -1 : 1, j === 2 ? 1 : -1, 0.5);
        fig(c2, BRO33[i], { x, y, h, dir: turnDir(q, 1.4 + j * 0.2, dd, j === 2 ? -1 : 1, 0.5), t: t + j, light: 0.95, wind: 0.4, ink: 0.7, armUp: j === 0 ? 0.3 : 0 }); });
      shots(c, t, [
        [0, (cc, q) => garden33(cc, t, Object.assign({}, MO, { open: ease(seg(q, 0.1, 0.9)), z: lerp(1.5, 1.56, ease(seg(q, 0, tVi))), cy: 1360, walkers: gate(q) }))],
        [tVi - 0.2, (cc, q) => vineyard33(cc, t, Object.assign({}, MO, { ash: 1, z: lerp(1.0, 1.08, ease(seg(q, 0, tEg - tVi))), cy: 1340, walkers: c2 => [[340, 1760, 0, 430, 1], [740, 1740, 2, 420, -1]].forEach(([x, y, i, h, dd], j) => { const back = ramp(q, 0.1, 0.9) * 40; fig(c2, BRO33[i], { x: x - dd * back, y, h, dir: dd, t: t + j, light: 0.95, wind: 0.4, ink: 0.7, walk: stepOf(-back, h), armUp: 0.3 * ramp(q, 0.2, 0.4) }); }) }))],
        [tEg - 0.2, (cc, q) => garden33(cc, t, Object.assign({}, MO, { open: 1, z: lerp(1.25, 1.3, ease(seg(q, 0, tCo - tEg))), cy: 1420, walkers: lost(q) }))],
        [tCo - 0.2, (cc, q) => vineyard33(cc, t, Object.assign({}, MO, { ash: 1, z: lerp(2.3, 2.4, ease(seg(q, 0, tPr - tCo))), cx: lerp(560, 520, ease(seg(q, 0, tPr - tCo))), cy: 1290 }))],
        [tPr - 0.3, (cc, q) => vineyard33(cc, t, Object.assign({}, MO, { ash: 1, z: lerp(1.35, 1.3, ease(seg(q, 0, d - tPr))), cy: 1460, walkers: c2 => { const f = ease(seg(q, 0.0, 0.5));
          basket33(c2, 620, 1800, 0.95, { rot: lerp(0, 1.45, f) }); fig(c2, BRO33[0], { x: 420, y: 1780, h: 430, pose: f > 0.6 ? 'kneel' : 'stand', dir: 1, t, light: 0.95, wind: 0.4, ink: 0.7 });
          fig(c2, BRO33[2], { x: 800, y: 1760, h: 420, dir: -1, t: t + 2, light: 0.95, wind: 0.4, ink: 0.7, armUp: 0.25 }); } }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tEg - 0.6, 0.25)); quote2(c, 'QUAND ILS LE VIRENT…', '', a1, 270, 78);
      const a2 = ramp(t, tEg - 0.5, 0.25) * (1 - ramp(t, tCo - 0.4, 0.25)); topShade(c, a2 * 1.3); arabic(c, 'إنا لضالون', 230, a2, 100); quote2(c, '« NOUS NOUS SOMMES', 'ÉGARÉS ! »', a2, 345, 70, 92);
      const a3 = ramp(t, tNo - 0.3, 0.25) * (1 - seg(t, d - 0.4, d)); topShade(c, a3 * 1.3); arabic(c, 'بل نحن محرومون', 230, a3, 96); quote2(c, '« NON… NOUS SOMMES', 'PRIVÉS DE TOUT »', a3, 345, 66, 92 * ramp(t, tPr - 0.5, 0.3) + 0.01); caption(c, 'Al-Qalam, versets 26-27', 545, a3, 28);
    },
  },
  // 8. the most just of them (awsatuhum, 28): « did I not tell you: if only you glorified Allah? » — the open loop is paid off: « in sha Allah » (the exegetes)
  middle: {
    grade: 'rgba(220,200,190,0.08)',
    draw(c, t, d) {
      const tJu = at('middle', 'juste', 0, 0.8), tNe = at('middle', 'ne', 0, 3.0), tGl = at('middle', 'glorifiiez', 0, 6.4), tVo = at('middle', 'voila', 0, 8.7), tMo = at('middle', 'mots', 0, 9.5);
      const MO = { sky: 'dawn', to: 'gold', k: 0.3, sunA: 0.65, sunX: 880, sunY: 1120, burn: 1, ash: 1, smoke: 0.5, haze: '#d8c8c0' };
      const three = (q, rc) => c2 => { fig(c2, BRO33[0], { x: 300, y: 1760, h: 430, dir: 1, t, light: 0.95, wind: 0.35, ink: 0.7 }); fig(c2, BRO33[2], { x: 440, y: 1700, h: 390, dir: 1, t: t + 2, light: 0.95, wind: 0.35, ink: 0.7 });
        const sx = 760 - Math.min(q, 1.2) * 40; fig(c2, BRO33[1], { x: sx, y: 1730, h: 420, dir: -1, t: t + 1, light: 1.1, wind: 0.4, ink: 0.75, walk: q < 1.2 ? stepOf(Math.min(q, 1.2) * 40, 420) : null, reach: rc }); };
      shots(c, t, [
        [0, (cc, q) => vineyard33(cc, t, Object.assign({}, MO, { z: lerp(1.3, 1.35, ease(seg(q, 0, tNe))), cy: 1420, walkers: three(q, 0) }))],
        [tNe - 0.2, (cc, q) => vineyard33(cc, t, Object.assign({}, MO, { z: lerp(2.3, 2.4, ease(seg(q, 0, tGl - tNe))), cx: 700, cy: 1480, walkers: three(9, 0.75 * ramp(q, 0.2, 0.5)) }))],
        [tGl - 0.2, (cc, q) => vineyard33(cc, t, Object.assign({}, MO, { z: lerp(1.9, 1.98, ease(seg(q, 0, tVo - tGl))), cx: 470, cy: 1500, walkers: three(9, 0.75) }))],
        [tVo - 0.2, (cc, q) => { vineyard33(cc, t, Object.assign({}, MO, { k: 0.6, z: lerp(1.2, 1.15, ease(seg(q, 0, d - tVo))), cy: 1300, light: 0.35 * ramp(q, 0.2, 0.8), lightX: 540, walkers: three(9, 0.3) })); flashW(cc, 0.3 * Math.exp(-q * 4)); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tNe - 0.4, 0.25)); quote2(c, 'LE PLUS JUSTE', 'D\'ENTRE EUX', a1 * ramp(t, tJu - 0.5, 0.3), 260, 96, 88); caption(c, '« awsatuhum » · Al-Qalam, verset 28', 470, a1, 30);
      const a2 = ramp(t, tNe - 0.2, 0.25) * (1 - ramp(t, tVo - 0.4, 0.25)); topShade(c, a2 * 1.3); arabic(c, 'لولا تسبحون', 230, a2 * ramp(t, tGl - 0.6, 0.3), 100);
      bigWord27(c, '« SI SEULEMENT VOUS', 345, a2, 70); bigWord27(c, 'GLORIFIIEZ ALLAH ? »', 435, a2 * ramp(t, tGl - 0.5, 0.3), 82, '#f6c453');
      const a3 = ramp(t, tVo - 0.2, 0.2) * (1 - seg(t, d - 0.4, d)); topShade(c, a3 * 1.4); quote2(c, 'LES VOILÀ,', 'LES MOTS :', a3, 230, 96, 96);
      arabic(c, 'إن شاء الله', 500, a3 * ramp(t, tMo - 0.3, 0.3), 130); caption(c, '« si Allah le veut » · selon les exégètes (Ibn Kathir)', 610, a3 * ramp(t, tMo, 0.3), 30);
    },
  },
  // 9. repentance (Al-Qalam 29-32): « Glory to our Lord, we were wrongdoers »; they blamed one another; « perhaps our Lord will give us better than it »
  repent: {
    grade: 'rgba(255,215,180,0.08)',
    draw(c, t, d) {
      const tGl = at('repent', 'gloire', 0, 1.8), tIn = at('repent', 'injustes', 0, 4.8), tRp = at('repent', 'reproches', 0, 7.4), tTo = at('repent', 'tournerent', 0, 8.8), tPe = at('repent', 'peutetre', 0, 10.5), tMi = at('repent', 'mieux', 0, 12.5);
      const SR = (k) => ({ sky: 'dawn', to: 'gold', k: 0.4 + 0.4 * k, sunA: 0.8 + 0.2 * k, sunX: 860, sunY: lerp(1120, 1040, k), burn: 1, ash: 1, smoke: 0.4 * (1 - k), haze: '#f0d0b0' });
      const kneel = (q, mode) => c2 => [[300, 1750, 0, 400, 1], [560, 1700, 1, 380, 1], [800, 1760, 2, 410, -1]].forEach(([x, y, i, h, dd], j) => {
        if (mode === 'pros') fig(c2, BRO33[i], { x: x - 60, y, h, pose: 'prostrate', dir: 1, t: t + j, light: 1, ink: 0.7 });
        else fig(c2, BRO33[i], { x, y, h, pose: 'kneel', dir: mode === 'face' ? (j === 0 ? 1 : -1) : 1, t: t + j, light: 1, wind: 0.3, ink: 0.7, dua: mode === 'dua' }); });
      shots(c, t, [
        [0, (cc, q) => vineyard33(cc, t, Object.assign({}, SR(0), { z: lerp(1.25, 1.3, ease(seg(q, 0, tIn))), cy: 1420, walkers: kneel(q, 'dua') }))],
        [tIn - 0.2, (cc, q) => vineyard33(cc, t, Object.assign({}, SR(0.1), { z: lerp(2.1, 2.2, ease(seg(q, 0, tRp - tIn))), cx: 480, cy: 1520, walkers: kneel(q, 'dua') }))],
        [tRp - 0.2, (cc, q) => vineyard33(cc, t, Object.assign({}, SR(0.2), { z: lerp(1.6, 1.66, ease(seg(q, 0, tTo - tRp))), cx: 560, cy: 1500, walkers: kneel(q, 'face') }))],
        [tTo - 0.2, (cc, q) => vineyard33(cc, t, Object.assign({}, SR(0.4), { z: lerp(1.3, 1.36, ease(seg(q, 0, tPe - tTo))), cy: 1450, light: 0.3 * ramp(q, 0.2, 1.0), walkers: kneel(q, 'pros') }))],
        [tPe - 0.2, (cc, q) => vineyard33(cc, t, Object.assign({}, SR(0.6 + 0.4 * ramp(q, 0, 4)), { z: lerp(1.02, 0.98, ease(seg(q, 0, d - tPe))), cy: lerp(1340, 1320, ease(seg(q, 0, d - tPe))), light: 0.45 * ramp(q, 0.1, 1.2), lightW: 520, walkers: kneel(q, 'dua') }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, tGl - 0.4, 0.25) * (1 - ramp(t, tRp - 0.4, 0.25)); topShade(c, a1 * 1.3); arabic(c, 'سبحان ربنا إنا كنا ظالمين', 230, a1, 72);
      bigWord27(c, '« GLOIRE À NOTRE SEIGNEUR ! »', 345, a1, 60); bigWord27(c, 'NOUS ÉTIONS INJUSTES', 435, a1 * ramp(t, tIn - 0.5, 0.3), 76, '#f6c453'); caption(c, 'Al-Qalam, verset 29', 505, a1, 28);
      const a2 = ramp(t, tRp - 0.2, 0.25) * (1 - ramp(t, tPe - 0.4, 0.25)); quote2(c, 'ILS SE FIRENT', 'DES REPROCHES', a2, 260, 88, 88); caption(c, 'Al-Qalam, versets 30-31', 470, a2, 28);
      const a3 = ramp(t, tPe - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); topShade(c, a3 * 1.3); arabic(c, 'عسى ربنا أن يبدلنا خيرا منها', 230, a3, 64);
      bigWord27(c, '« PEUT-ÊTRE NOUS DONNERA-T-IL', 345, a3, 54); bigWord27(c, 'MIEUX QUE CE JARDIN »', 435, a3 * ramp(t, tMi - 0.4, 0.3), 76, '#f6c453'); caption(c, 'Al-Qalam, verset 32', 505, a3, 28);
    },
  },
  // 10. according to some exegetes, their repentance was sincere and Allah gave them a better garden (reported by Ibn Kathir; Allah knows best): shown as a soft vision
  better: {
    grade: 'rgba(255,230,190,0.08)',
    draw(c, t, d) {
      const tSi = at('better', 'sincere', 0, 3.3), tAl = at('better', 'allah', 0, 4.2), tMe = at('better', 'meilleur', 0, 6.5), tSa = at('better', 'sait', 0, 8.3);
      const LU = { sky: 'day', to: 'gold', k: 0.45, sunA: 0.85, sunX: 880, sunY: 980, burn: 0, lush: 1, haze: '#f8e4c8' };
      const pray = c2 => [[320, 1750, 0, 400, 1], [560, 1710, 1, 380, 1], [790, 1760, 2, 410, -1]].forEach(([x, y, i, h, dd], j) => fig(c2, BRO33[i], { x, y, h, pose: 'kneel', dir: dd, t: t + j, light: 1.1, wind: 0.3, ink: 0.7, dua: true }));
      shots(c, t, [
        [0, (cc, q) => vineyard33(cc, t, Object.assign({}, LU, { burn: 1 - ease(seg(q, 0.3, tAl + 0.5)), vision: 0.6, z: lerp(1.2, 1.26, ease(seg(q, 0, tAl))), cy: 1400, walkers: pray, light: 0.3 }))],
        [tAl - 0.2, (cc, q) => vineyard33(cc, t, Object.assign({}, LU, { vision: 0.6, z: lerp(2.4, 2.5, ease(seg(q, 0, tMe - tAl))), cx: lerp(380, 440, ease(seg(q, 0, tMe - tAl))), cy: 1200 }))],
        [tMe - 0.2, (cc, q) => garden33(cc, t, Object.assign({}, LU, { open: 1, vision: 0.5, z: lerp(1.0, 0.96, ease(seg(q, 0, tSa - tMe))), cy: lerp(1120, 1090, ease(seg(q, 0, tSa - tMe))), light: 0.3 }))],
        [tSa - 0.2, (cc, q) => vineyard33(cc, t, Object.assign({}, LU, { vision: 0.7, z: lerp(1.15, 1.1, ease(seg(q, 0, d - tSa))), cy: 1380, walkers: pray, light: 0.4 }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tAl - 0.4, 0.25)); quote2(c, 'SELON CERTAINS', 'EXÉGÈTES', a1, 260, 84, 84); caption(c, 'un repentir sincère', 470, a1 * ramp(t, tSi - 0.5, 0.3), 34);
      const a2 = ramp(t, tAl - 0.2, 0.25) * (1 - ramp(t, tSa - 0.4, 0.25)); quote2(c, 'UN JARDIN', 'MEILLEUR ENCORE', a2, 260, 96, 88 * ramp(t, tMe - 0.5, 0.3) + 0.01); caption(c, 'rapporté par Ibn Kathir', 470, a2, 28);
      const a3 = ramp(t, tSa - 0.3, 0.25) * (1 - seg(t, d - 0.4, d)); topShade(c, a3 * 1.3); arabic(c, 'والله أعلم', 240, a3, 110); bigWord27(c, 'ALLAH SAIT MIEUX', 380, a3, 80, '#f6c453');
    },
  },
  // 11. the lesson (Al-Qalam 33) + « si Allah le veut »
  lesson: {
    grade: 'rgba(255,205,160,0.1)',
    draw(c, t, d) {
      const tCh = at('lesson', 'chatiment', 0, 1.0), tAu = at('lesson', "l'au-dela", 0, 2.6), tRf = at('lesson', 'refuses', 0, 5.7), tPv = at('lesson', 'prive', 0, 8.5), tPj = at('lesson', 'projet', 0, 10.3), tDi = at('lesson', 'dis', 0, 11.6), tVe = at('lesson', 'veut', 0, 13.2);
      const give = (k) => c2 => { basket33(c2, 700, 1700, 0.85, { fill: 1 }); fig(c2, POOR33[2], { x: 380, y: 1720, h: 330, dir: 1, t, light: 1.05, wind: 0.3, ink: 0.7, child: true, reach: 0.7 * k });
        fig(c2, POOR33[0], { x: 240, y: 1700, h: 400, dir: 1, t: t + 1, light: 1, wind: 0.3, ink: 0.7 });
        fig(c2, BRO33[1], { x: 600, y: 1690, h: 410, dir: -1, t: t + 2, light: 1.1, wind: 0.35, ink: 0.75, reach: 0.75 * k });
        if (k > 0.2) { const [hx, hy] = handOf({ x: 600, y: 1690, h: 410, dir: -1, reach: 0.75 * k }); basket33(c2, hx - 6, hy + 60 * k, 0.42, { fill: 1 }); } };
      shots(c, t, [
        [0, (cc, q) => garden33(cc, t, { sky: 'dusk', to: 'ash', k: 0.3, sunA: 0.6, sunX: 220, sunY: 1150, burn: 1, soot: 1, open: 1, smoke: 0.5, haze: '#e0b0a0', z: lerp(1.0, 1.05, ease(seg(q, 0, tRf))), cy: lerp(1120, 1160, ease(seg(q, 0, tRf))) })],
        [tRf - 0.6, (cc, q) => garden33(cc, t, Object.assign({}, GREEN33, { lush: 0.5, k: 0.5, z: lerp(1.6, 1.68, ease(seg(q, 0, tPv - tRf + 0.6))), cx: 520, cy: 1470, walkers: give(ramp(q, 0.6, 0.8)) }))],
        [tPv - 0.2, (cc, q) => vineyard33(cc, t, { sky: 'dusk', to: 'ash', k: 0.4, sunA: 0.5, sunX: 220, sunY: 1100, burn: 1, ash: 1, smoke: 0.4, haze: '#e0b0a0', z: lerp(2.0, 2.1, ease(seg(q, 0, tPj - tPv))), cx: 540, cy: 1260 })],
        [tPj - 0.2, (cc, q) => garden33(cc, t, Object.assign({}, GREEN33, { sky: 'dawn', to: 'gold', k: 0.5, sunX: 880, sunY: 1060, sunA: 0.9, lush: 0.6, open: 0, z: lerp(1.02, 1.08, ease(seg(q, 0, d - tPj))), cy: 1150, light: 0.3 * ramp(q, tDi - tPj, 1.0) }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tRf - 0.8, 0.25)); topShade(c, a1 * 1.3); arabic(c, 'كذلك العذاب', 230, a1, 100); bigWord27(c, 'TEL FUT LE CHÂTIMENT', 350, a1 * ramp(t, tCh - 0.5, 0.3), 72, '#f6c453');
      caption(c, 'et celui de l\'au-delà est plus grand encore · Al-Qalam, verset 33', 435, a1 * ramp(t, tAu - 0.3, 0.3), 27);
      const a2 = ramp(t, tRf - 0.6, 0.25) * (1 - ramp(t, tPj - 0.4, 0.25)); quote2(c, 'CE QUE TU REFUSES AUX PAUVRES,', 'C\'EST TOI QUI EN ES PRIVÉ', a2, 260, 54, 62 * ramp(t, tPv - 1.2, 0.3) + 0.01);
      const a3 = ramp(t, tPj - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); topShade(c, a3 * 1.4); quote2(c, 'POUR CHAQUE PROJET', 'DE DEMAIN', a3, 230, 76, 76);
      arabic(c, 'إن شاء الله', 480, a3 * ramp(t, tDi - 0.2, 0.3), 140); caption(c, '« si Allah le veut »', 600, a3 * ramp(t, tVe - 0.6, 0.3), 40);
    },
  },
  cta: {
    grade: 'rgba(255,190,150,0.08)',
    draw(c, t, d) {
      hero33(c, 60 + t, { z: lerp(1.08, 1.04, seg(t, 0, d)), cy: lerp(1170, 1160, seg(t, 0, d)) });
      c.fillStyle = 'rgba(6,8,18,0.3)'; c.fillRect(0, 0, W, H);
      ctaText33(c, seg(t, 0.1, 0.6));
    },
  },
  // the last frame dissolves into the first (hook)
  outro: {
    grade: 'rgba(255,190,150,0.08)',
    draw(c, t, d) {
      const back = seg(t, d - 0.8, d);
      if (back <= 0) { const cd = ((window.TL.scenes || []).find(s => s.id === 'cta') || { dur: 6 }).dur; hero33(c, 60 + cd + t, { z: lerp(1.04, 1.0, seg(t, 0, d - 0.8)), cy: lerp(1160, 1150, seg(t, 0, d - 0.8)) }); }
      else hero33(c, 0, {});
      const k = 1 - seg(t, d - 2.0, d - 1.2);
      c.fillStyle = `rgba(6,8,18,${0.3 * k})`; c.fillRect(0, 0, W, H);
      ctaText33(c, k);
      flashW(c, 0.4 * Math.sin(Math.PI * clamp((t - (d - 1.6)) / 1.6)));
      const a = seg(t, d - 0.8, d - 0.1); if (a > 0) { c.save(); c.globalAlpha = a; heroTexts33(c, 1); c.restore(); }
    },
  },
  cover: {
    draw(c) {
      hero33(c, 0.4, { z: 1.12, cx: 560, cy: 1330 });
      const g = c.createLinearGradient(0, 0, 0, 820); g.addColorStop(0, 'rgba(6,8,18,0.88)'); g.addColorStop(1, 'rgba(6,8,18,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 820);
      seriesTag33(c, 1);
      textS(c, 'LEUR JARDIN', 250, 1, '700 120px Lora', 120, '#fff6e0', 24);
      textGlow(c, 'NOIR COMME', W / 2, 375, '700 96px Lora', '#f6c453', 1, '#000', 24);
      textGlow(c, 'LA NUIT', W / 2, 480, '700 96px Lora', '#f6c453', 1, '#000', 24);
      textGlow(c, 'en une seule nuit', W / 2, 585, 'italic 500 58px Lora', '#fff3dc', 1, '#000', 20);
      const g2 = c.createLinearGradient(0, 1420, 0, H); g2.addColorStop(0, 'rgba(6,8,18,0)'); g2.addColorStop(1, 'rgba(6,8,18,0.85)'); c.fillStyle = g2; c.fillRect(0, 1420, W, 500);
      arabic(c, 'أصحاب الجنة', 1650, 1, 120);
      textGlow(c, 'Les gens du jardin', W / 2, 1790, 'italic 500 54px Lora', '#fff3dc', 1, '#000', 14);
    },
  },
};
