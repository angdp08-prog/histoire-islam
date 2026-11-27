
// ---------- episode 35 scenes
const NX35 = (o, extra) => Object.assign({}, o, extra);
// the boy before the throne (court35): king seated, boy standing on the carpet, soldiers on both sides
function boyBeforeKing35(T, o = {}) { return c => {
  kingOnThrone35(c, T, { armUp: o.kArm || 0 });
  [[250, 1700, 0, 1], [830, 1700, 2, -1]].forEach(([x, y, i, d], j) => sold35(c, i, { x, y, h: 400, dir: d, t: T + j, light: 0.9, wind: 0.1, ink: 0.7 }));
  fig(c, BOY35, { x: o.bx || 470, y: 1820, h: 470, dir: 1, t: T + 3, light: 1.05, wind: 0.1, ink: 0.75, reach: o.reach || 0, armUp: o.arm || 0 }); }; }
// the courtier before the throne
function courtierBeforeKing35(T, o = {}) { return c => {
  kingOnThrone35(c, T, { armUp: o.kArm || 0 });
  fig(c, COURT35, { x: 400, y: 1800, h: 560, dir: 1, t: T + 2, light: 1.0 + 0.2 * (o.lit || 0), wind: 0.1, ink: 0.75, reach: o.reach || 0, armUp: o.arm || 0 });
  sold35(c, 1, { x: 880, y: 1720, h: 420, dir: -1, t: T + 4, light: 0.9, wind: 0.1, ink: 0.7 }); }; }
// walkers streaming into the plain from both edges (steps driven by the distance)
function streamIn35(T, dist) { return c => { [[-140, 1500, 0, 1], [-260, 1560, 2, 1], [-90, 1640, 4, 1], [-300, 1720, 6, 1], [1220, 1520, 1, -1], [1330, 1580, 3, -1], [1180, 1660, 5, -1], [1390, 1740, 7, -1]].forEach(([x0, y, f, d], j) => {
  const h = hY35(y), dd = dist * (0.85 + 0.05 * (j % 4)); fig(c, NAJ35[f], { x: x0 + d * dd, y, h, dir: d, t: T + j, light: 0.9, wind: 0.3, ink: 0.65, walk: stepOf(dd, h) + j * 0.27 }); });
  crowd35(c, T, { skip: p => p.row < 2 || Math.abs(p.x - 540) > 330 }); }; }
// the believers standing in line before the fire (backs to us), calm, some in prayer; soldiers at the ends
function believers35(T, o = {}) { return c => {
  [[150, 1700, 0], [290, 1730, 3], [430, 1705, 5], [570, 1735, 1], [710, 1710, 6], [850, 1740, 2]].forEach(([x, y, f], j) => fig(c, NAJ35[f], { x, y, h: hY35(y), dir: j % 2 ? -1 : 1, t: T + j, light: 0.75, wind: 0.35, ink: 0.7, dua: j % 3 === 1 }));
  sold35(c, 0, { x: -10, y: 1780, h: hY35(1780), dir: 1, t: T + 7, light: 0.7, wind: 0.3, ink: 0.7 }); sold35(c, 3, { x: 1010, y: 1790, h: hY35(1790), dir: -1, t: T + 8, light: 0.7, wind: 0.3, ink: 0.7 }); }; }
// the king and his court seated on rugs at the edge of the trench (Al-Buruj 6-7), seen from behind, against the glow
function seated35(T) { return c => { rug(c, 560, 1800, 760, 120, '#5a1a22');
  [[300, 1770, 'C', 1], [470, 1790, 'K', 1], [660, 1790, 'S', -1], [820, 1770, 'C2', -1]].forEach(([x, y, w, d], j) => { const o = { x, y, h: hY35(y) * 0.98, pose: 'sit', dir: d, t: T + j, light: 0.7, wind: 0.2, ink: 0.7 };
    if (w === 'K') king35(c, o); else if (w === 'S') sold35(c, 2, Object.assign(o, { noSpear: true })); else fig(c, w === 'C' ? COURT35 : NAJ35[2], o); }); }; }
// the mother carrying her baby (the « bundle » in her arms); o.light = the baby's light
function mother35(c, T, x, y, o = {}) { const h = o.h || hY35(y), mo = { x, y, h, dir: o.dir || 1, t: T, light: 0.85, wind: 0.35, ink: 0.7, walk: o.walk === undefined ? null : o.walk };
  fig(c, MOTHER35, mo); heldBundle(c, mo);
  if (o.baby) { const s = h / 300, d = mo.dir; babyLight(c, x + d * 30 * s, y - 172 * s - (o.walk === null || o.walk === undefined ? 0 : Math.abs(Math.sin(o.walk * Math.PI * 2)) * 3 * s), o.baby, T); } }

const SCENES = {
  // 1. HOOK — a boy explained to the king himself how to kill him… and that day a whole people believed in Allah (Muslim 3005)
  hook: {
    grade: 'rgba(255,180,130,0.08)',
    draw(c, t, d) {
      const tRo = at('hook', 'roi', 0, 1.6), tTu = at('hook', 'tuer', 0, 2.8), tJo = at('hook', 'jour', 0, 4.0), tPe = at('hook', 'peuple', 0, 4.8), tCr = at('hook', 'cru', 0, 5.4);
      shots(c, t, [
        [0, (cc, q) => hero35(cc, t, { z: lerp(1.32, 1.37, ease(seg(q, 0, tRo + 0.4))), cy: lerp(1480, 1490, ease(seg(q, 0, tRo + 0.4))) })],
        [tRo + 0.2, (cc, q) => hero35(cc, t, { z: lerp(2.5, 2.58, ease(seg(q, 0, tTu - tRo))), cx: 830, cy: 1600, bowUp: lerp(0.35, 0.8, ease(seg(q, 0.1, 0.8))) })],
        [tTu - 0.1, (cc, q) => hero35(cc, t, { z: lerp(2.6, 2.72, ease(seg(q, 0, tJo - tTu))), cx: 540, cy: 1450 })],
        [tJo - 0.2, (cc, q) => hero35(cc, t, { z: lerp(1.5, 1.44, ease(seg(q, 0, d - tJo))), cy: 1500, cheer: ramp(q, tPe - tJo, 0.6) })],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = 1 - ramp(t, tJo - 0.4, 0.2); hookTexts35(c, a1);
      const a2 = ramp(t, tJo - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'TOUT UN PEUPLE', 'A CRU EN ALLAH', a2 * ramp(t, tPe - 0.5, 0.3), 260, 104, 96 * ramp(t, tCr - 0.4, 0.3) + 0.01); seriesTag35(c, a2);
      caption(c, 'Sahih Muslim 3005 · sourate Al-Buruj', 470, a2 * ramp(t, tCr, 0.3), 30);
    },
  },
  // 2. the People of the Trench (Al-Buruj 4); told by the Prophet ﷺ (never shown); the open loop: « a baby is going to speak »
  promise: {
    grade: 'rgba(255,170,120,0.08)',
    draw(c, t, d) {
      const tTr = at('promise', 'tranchee', 0, 2.0), tBu = at('promise', 'al-buruj', 0, 4.2), tPr = at('promise', 'prophete', 0, 6.2), tRe = at('promise', 'reste', 0, 9.4), tBe = at('promise', 'bebe', 0, 11.0), tPa = at('promise', 'parler', 0, 11.8);
      const fireFar = (q0) => c2 => trench35(c2, t, -400, 1500, 1400, 14, { k: 1, night: 1, fs: 0.7 });
      shots(c, t, [
        [0, (cc, q) => najran35(cc, t, NX35(NIGHT35, { z: lerp(1.05, 1.1, ease(seg(q, 0, tBu))), cy: lerp(1240, 1260, ease(seg(q, 0, tBu))), lamp: 0.4, props: fireFar(), post: c2 => fireLight35(c2, 0.6) }))],
        [tBu - 0.2, (cc, q) => najran35(cc, t, NX35(NIGHT35, { z: lerp(1.9, 2.0, ease(seg(q, 0, tPr - tBu))), cx: lerp(420, 520, ease(seg(q, 0, tPr - tBu))), cy: 1420, lamp: 0.4, props: fireFar(), post: c2 => fireLight35(c2, 0.8) }))],
        [tPr - 0.2, (cc, q) => najran35(cc, t, NX35(DAWN35, { z: lerp(1.1, 1.16, ease(seg(q, 0, tRe - tPr))), cy: 1220, light: 0.3 * ramp(q, 0.3, 1), lightX: 300, lightW: 420 }))],
        [tRe - 0.2, (cc, q) => najran35(cc, t, NX35(NIGHT35, { z: lerp(2.2, 2.3, ease(seg(q, 0, d - tRe))), cx: 560, cy: 1560, lamp: 0.3, props: c2 => trench35(c2, t, -500, 1600, 1440, 16, { k: 1, night: 1, fs: 0.8 }),
          walkers: c2 => mother35(c2, t, 560, 1720, { dir: 1, baby: 0.25 * ramp(q, tBe - tRe, 0.6) }), post: c2 => fireLight35(c2, 0.7) }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a0 = ramp(t, 0.05, 0.25) * (1 - ramp(t, tPr - 0.4, 0.25)); topShade(c, a0 * 1.3); arabic(c, 'قتل أصحاب الأخدود', 240, a0, 100);
      bigWord27(c, 'LES GENS DE LA TRANCHÉE', 370, a0 * ramp(t, tTr - 0.5, 0.3), 70, '#f6c453'); caption(c, 'sourate Al-Buruj (85), versets 4 à 10', 450, a0 * ramp(t, tBu - 0.3, 0.3), 32); seriesTag35(c, a0 * (1 - ramp(t, 1.4, 0.3)));
      const a1 = ramp(t, tPr - 0.2, 0.25) * (1 - ramp(t, tRe - 0.4, 0.25)); topShade(c, a1 * 1.3); quote2(c, 'RACONTÉE PAR', 'LE PROPHÈTE', a1, 260, 76, 92); arabic(c, 'صلى الله عليه وسلم', 470, a1, 54); caption(c, 'Sahih Muslim, n° 3005 (hadith de Suhayb)', 540, a1, 30);
      const a2 = ramp(t, tRe - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'RESTE JUSQU\'AU BOUT :', 'UN BÉBÉ VA PARLER', a2, 260, 66, 88 * ramp(t, tBe - 0.6, 0.3) + 0.01);
    },
  },
  // 3. a king and his old magician; the boy sent to learn magic; on the way he sat with a monk who taught him to believe in Allah
  magician: {
    grade: 'rgba(255,200,160,0.08)',
    draw(c, t, d) {
      const tMa = at('magician', 'magicien', 0, 1.6), tCo = at('magician', 'confia', 0, 2.6), tMg = at('magician', 'magie', 0, 4.6), tCh = at('magician', 'chemin', 0, 5.8), tMo = at('magician', 'moine', 0, 8.6), tCr = at('magician', 'croire', 0, 10.4);
      const mageRoom = (q, boy) => c2 => { cushion(c2, 340, 1760, 1.6, '#4a2a4a'); fig(c2, MAGE35, { x: 340, y: 1760, h: 520, pose: 'sit', dir: 1, t, light: 0.8, wind: 0.1, ink: 0.75, armUp: 0.5 * (0.5 + 0.5 * Math.sin(t * 1.3)) });
        if (boy) fig(c2, BOY35, { x: 700, y: 1800, h: 500, dir: -1, t: t + 2, light: 0.95, wind: 0.1, ink: 0.75 }); };
      const road = (q) => c2 => { const dist = q * 70; fig(c2, BOY35, { x: 860 - dist, y: 1640, h: hY35(1640) * 1.05, dir: -1, t, light: 1, wind: 0.35, ink: 0.7, walk: stepOf(dist, hY35(1640)) }); };
      shots(c, t, [
        [0, (cc, q) => court35(cc, t, { z: lerp(1.25, 1.3, ease(seg(q, 0, tCo))), cy: 1250, throne: true, walkers: c2 => { kingOnThrone35(c2, t, {}); fig(c2, MAGE35, { x: 300, y: 1720, h: 460, dir: 1, t, light: 0.85, wind: 0.1, ink: 0.75, staff: true }); } })],
        [tCo - 0.2, (cc, q) => court35(cc, t, { dim: 0.6, braziers: 1, z: lerp(1.5, 1.56, ease(seg(q, 0, tCh - tCo))), cx: 520, cy: 1430, walkers: mageRoom(q, true) })],
        [tCh - 0.2, (cc, q) => najran35(cc, t, NX35(DAY35, { z: lerp(1.45, 1.5, ease(seg(q, 0, tMo - tCh))), cx: lerp(560, 500, ease(seg(q, 0, tMo - tCh))), cy: 1460, props: c2 => cell35(c2, 260, 1530, 1.35, t, { lamp: 0.4 }), walkers: road(q) }))],
        [tMo - 0.2, (cc, q) => najran35(cc, t, NX35(DAY35, { z: lerp(2.3, 2.4, ease(seg(q, 0, d - tMo))), cx: 300, cy: 1500, light: 0.25 * ramp(q, tCr - tMo - 0.4, 0.8), lightX: 300, lightW: 260, props: c2 => cell35(c2, 260, 1530, 1.35, t, { lamp: 0.5 }),
          walkers: c2 => { fig(c2, MONK35, { x: 190, y: 1610, h: hY35(1610), pose: 'sit', dir: 1, t, light: 0.95, wind: 0.2, ink: 0.7, dua: q > tCr - tMo }); fig(c2, BOY35, { x: 400, y: 1620, h: hY35(1620) * 1.05, pose: 'sit', dir: -1, t: t + 2, light: 1, wind: 0.2, ink: 0.7 }); } }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tCo - 0.4, 0.25)); quote2(c, 'UN ROI', 'ET SON VIEUX MAGICIEN', a1, 260, 96, 76 * ramp(t, tMa - 0.5, 0.3) + 0.01);
      const a2 = ramp(t, tCo - 0.2, 0.25) * (1 - ramp(t, tCh - 0.4, 0.25)); quote2(c, 'UN GARÇON', 'POUR APPRENDRE LA MAGIE', a2, 260, 92, 70 * ramp(t, tMg - 0.6, 0.3) + 0.01);
      const a3 = ramp(t, tCh - 0.2, 0.25) * (1 - ramp(t, tMo - 0.4, 0.25)); quote2(c, 'MAIS EN CHEMIN…', '', a3, 270, 84);
      const a4 = ramp(t, tMo - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'UN MOINE', 'QUI CROYAIT EN ALLAH', a4, 260, 96, 76 * ramp(t, tCr - 0.6, 0.3) + 0.01); caption(c, 'Sahih Muslim 3005', 470, a4, 30);
    },
  },
  // 4. by Allah's leave the boy healed the blind; a blind courtier came: « it is not I who heal, it is Allah »; he believed, and he saw
  blind: {
    grade: 'rgba(255,215,170,0.08)',
    draw(c, t, d) {
      const tGu = at('blind', 'guerissait', 0, 2.6), tPr = at('blind', 'proche', 0, 5.0), tVi = at('blind', 'vint', 0, 6.6), tCe = at('blind', 'ce', 0, 8.0), tAl = at('blind', 'allah', 1, 10.4), tCr = at('blind', 'crut', 0, 11.6), tVt = at('blind', 'vit', 0, 12.4);
      const cellP = c2 => cell35(c2, 260, 1530, 1.35, t, { lamp: 0.4 });
      shots(c, t, [
        [0, (cc, q) => najran35(cc, t, NX35(DAY35, { z: lerp(1.6, 1.66, ease(seg(q, 0, tPr))), cx: 520, cy: 1500, props: cellP, light: 0.22, lightX: 470, lightW: 240, walkers: c2 => {
          [[700, 1600, 1], [800, 1640, 3], [900, 1610, 5], [990, 1660, 7]].forEach(([x, y, f], j) => fig(c2, NAJ35[f], { x, y, h: hY35(y), dir: -1, t: t + j, light: 0.9, wind: 0.3, ink: 0.65, reach: j === 0 ? 0.3 : 0 }));
          const ko = { x: 560, y: 1660, h: hY35(1660) * 0.92, pose: 'kneel', dir: -1, t: t + 5, light: 0.95, wind: 0.3, ink: 0.7, dua: q > 1.2 }; fig(c2, NAJ35[0], ko);
          fig(c2, BOY35, { x: 440, y: 1650, h: hY35(1650) * 1.05, dir: 1, t, light: 1.05, wind: 0.3, ink: 0.7, dua: true }); } }))],
        [tPr - 0.2, (cc, q) => najran35(cc, t, NX35(DAY35, { z: lerp(1.5, 1.55, ease(seg(q, 0, tCe - tPr))), cx: 620, cy: 1470, props: cellP, walkers: c2 => { const dist = q * 55;
          fig(c2, NAJ35[4], { x: 860 - dist, y: 1640, h: hY35(1640), dir: -1, t, light: 0.9, wind: 0.3, ink: 0.65, walk: stepOf(dist, hY35(1640)), reach: 0.0 });
          fig(c2, COURT35, { x: 960 - dist, y: 1660, h: hY35(1660), dir: -1, t: t + 2, light: 1.0, wind: 0.3, ink: 0.7, walk: stepOf(dist, hY35(1660)) + 0.3, reach: 0.55 });
          fig(c2, BOY35, { x: 440, y: 1640, h: hY35(1640) * 1.05, dir: 1, t: t + 3, light: 1.0, wind: 0.3, ink: 0.7 }); } }))],
        [tCe - 0.2, (cc, q) => najran35(cc, t, NX35(DAY35, { z: lerp(2.5, 2.6, ease(seg(q, 0, tCr - tCe))), cx: 560, cy: 1520, props: cellP, light: 0.4 * ramp(q, tAl - tCe - 0.5, 0.6), lightX: 600, lightW: 300, walkers: c2 => {
          fig(c2, BOY35, { x: 460, y: 1660, h: hY35(1660) * 1.05, dir: 1, t, light: 1.05, wind: 0.3, ink: 0.7, armUp: 0.9 * ramp(q, tAl - tCe - 0.6, 0.4) });
          fig(c2, COURT35, { x: 680, y: 1670, h: hY35(1670), dir: -1, t: t + 2, light: 1.0, wind: 0.3, ink: 0.7, reach: 0.4 }); } }))],
        [tCr - 0.2, (cc, q) => { najran35(cc, t, NX35(DAY35, { sunA: 0.9, z: lerp(1.15, 1.1, ease(seg(q, 0, d - tCr))), cy: 1300, walkers: c2 => { [[300, 1560, 2, 1], [760, 1580, 6, -1]].forEach(([x, y, f, dd], j) => fig(c2, NAJ35[f], { x, y, h: hY35(y), dir: dd, t: t + j, light: 1, wind: 0.3, ink: 0.65 })); } }));
          blindFx(cc, 1 - ease(seg(q, tVt - tCr - 0.5, tVt - tCr + 0.9))); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tPr - 0.4, 0.25)); quote2(c, 'AVEC LA PERMISSION D\'ALLAH', 'IL GUÉRISSAIT LES AVEUGLES', a1, 260, 58, 60 * ramp(t, tGu - 0.5, 0.3) + 0.01); caption(c, 'Sahih Muslim 3005', 470, a1, 30);
      const a2 = ramp(t, tPr - 0.2, 0.25) * (1 - ramp(t, tCe - 0.4, 0.25)); quote2(c, 'UN PROCHE DU ROI', 'AVEUGLE', a2, 260, 84, 96);
      const a3 = ramp(t, tCe - 0.2, 0.25) * (1 - ramp(t, tCr - 0.4, 0.25)); quote2(c, '« CE N\'EST PAS MOI…', '…C\'EST ALLAH »', a3, 260, 76, 96 * ramp(t, tAl - 0.6, 0.3) + 0.01);
      const a4 = ramp(t, tCr - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'IL CRUT,', 'ET IL VIT', a4, 260, 96, 110 * ramp(t, tVt - 0.4, 0.3) + 0.01);
    },
  },
  // 5. « who gave you back your sight? » — « my Lord and your Lord: Allah »; the king put him and the monk to death (never shown); the boy refused too
  king: {
    grade: 'rgba(255,200,160,0.08)',
    draw(c, t, d) {
      const tDe = at('king', 'demanda', 0, 1.0), tVu = at('king', 'vue', 0, 2.8), tSe = at('king', 'seigneur', 0, 3.8), tAl = at('king', 'allah', 0, 6.0), tMo = at('king', 'mourir', 0, 7.6), tMn = at('king', 'moine', 0, 9.2), tGa = at('king', 'garcon', 0, 10.2), tRe = at('king', 'renier', 0, 12.2);
      shots(c, t, [
        [0, (cc, q) => court35(cc, t, { throne: true, z: lerp(1.3, 1.36, ease(seg(q, 0, tSe))), cy: 1300, walkers: courtierBeforeKing35(t, { kArm: 0.6 * ramp(q, tDe - 0.3, 0.4) }) })],
        [tSe - 0.2, (cc, q) => court35(cc, t, { throne: true, z: lerp(2.1, 2.18, ease(seg(q, 0, tMo - tSe))), cx: 430, cy: 1450, walkers: courtierBeforeKing35(t, { lit: ramp(q, tAl - tSe - 0.4, 0.5), arm: 0.85 * ramp(q, tAl - tSe - 0.5, 0.4) }), post: c2 => lightFromAbove(c2, t, 430, 0.3 * ramp(q, tAl - tSe - 0.4, 0.6), 220) })],
        [tMo - 0.2, (cc, q) => najran35(cc, t, NX35(NIGHT35, { z: lerp(2.6, 2.7, ease(seg(q, 0, tGa - tMo))), cx: 290, cy: 1480, fg: false, props: c2 => cell35(c2, 260, 1530, 1.35, t, { night: 1, lamp: 0.8 * (1 - ramp(q, 0.6, 1.0)) }) }))],
        [tGa - 0.2, (cc, q) => court35(cc, t, { throne: true, z: lerp(1.5, 1.56, ease(seg(q, 0, d - tGa))), cx: 520, cy: 1420, walkers: boyBeforeKing35(t, { kArm: 0.5 }) })],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tSe - 0.4, 0.25)); quote2(c, '« QUI T\'A RENDU', 'LA VUE ? »', a1 * ramp(t, tDe - 0.3, 0.3), 260, 84, 100);
      const a2 = ramp(t, tSe - 0.2, 0.25) * (1 - ramp(t, tMo - 0.4, 0.25)); topShade(c, a2 * 1.3); arabic(c, 'ربي وربك الله', 230, a2, 100); bigWord27(c, '« MON SEIGNEUR, ET TON SEIGNEUR :', 350, a2, 50); bigWord27(c, 'ALLAH »', 450, a2 * ramp(t, tAl - 0.5, 0.3), 110, '#f6c453');
      const a3 = ramp(t, tMo - 0.2, 0.25) * (1 - ramp(t, tGa - 0.4, 0.25)); quote2(c, 'IL FIT MOURIR', 'CET HOMME ET LE MOINE', a3, 260, 92, 72 * ramp(t, tMn - 0.8, 0.3) + 0.01);
      const a4 = ramp(t, tGa - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'LE GARÇON AUSSI', 'REFUSA DE RENIER SA FOI', a4, 260, 84, 66 * ramp(t, tRe - 0.8, 0.3) + 0.01);
    },
  },
  // 6. the mountain: « O Allah, suffice me against them as You will »; it shook, they fell (dust only), he came back walking
  mountain: {
    grade: 'rgba(255,200,150,0.08)',
    draw(c, t, d) {
      const tMt = at('mountain', 'montagne', 0, 2.4), tJe = at('mountain', 'jeter', 0, 3.4), tPi = at('mountain', 'pria', 0, 4.6), tPr = at('mountain', 'protege', 0, 6.4), tTr = at('mountain', 'trembla', 0, 9.6), tTo = at('mountain', 'tomberent', 0, 10.6), tRv = at('mountain', 'revint', 0, 11.8), tPd = at('mountain', 'pied', 0, 12.8);
      const climb = (q) => c2 => { const dist = 60 + q * 60; [['S0', -150], ['S1', -40], ['B', 70], ['S2', 190]].forEach(([w, dx], j) => { const x = -900 + dist + dx, y = sumY35(x), h = 300;
        if (w === 'B') fig(c2, BOY35, { x, y, h: h * 1.05, dir: 1, t: t + j, light: 1, wind: 0.5, ink: 0.7, walk: stepOf(dist, h) + j * 0.3 }); else sold35(c2, +w[1], { x, y, h, dir: 1, t: t + j, light: 0.9, wind: 0.5, ink: 0.7, walk: stepOf(dist, h) + j * 0.3 }); }); };
      const top = (q, alone) => c2 => { if (!alone) { sold35(c2, 0, { x: 300, y: sumY35(300), h: 300, dir: 1, t, light: 0.9, wind: 0.6, ink: 0.7 }); sold35(c2, 1, { x: 620, y: sumY35(620), h: 300, dir: -1, t: t + 1, light: 0.9, wind: 0.6, ink: 0.7, reach: 0.5 }); sold35(c2, 3, { x: 690, y: sumY35(690), h: 300, dir: -1, t: t + 2, light: 0.9, wind: 0.6, ink: 0.7 }); }
        fig(c2, BOY35, { x: 470, y: sumY35(470), h: 290, pose: alone ? 'stand' : 'kneel', dir: 1, t: t + 3, light: 1.1, wind: 0.6, ink: 0.7, dua: !alone }); };
      shots(c, t, [
        [0, (cc, q) => summit35(cc, t, { sunA: 0.6, z: lerp(1.25, 1.3, ease(seg(q, 0, tPi))), cx: lerp(-640, -560, ease(seg(q, 0, tPi))), cy: 1980, walkers: climb(q) })],
        [tPi - 0.2, (cc, q) => summit35(cc, t, { sunA: 0.6, z: lerp(1.45, 1.52, ease(seg(q, 0, tTr - tPi))), cx: 500, cy: 1460, light: 0.3 * ramp(q, 0.5, 1), lightX: 470, lightW: 240, walkers: top(q, false) })],
        [tTr - 0.2, (cc, q) => peak35(cc, t, { z: 1.05, cy: 1100, shake: 0.35 * (1 - ramp(q, 1.4, 0.8)), dust: 0.65 * ramp(q, 0.4, 1.2), fall: q * 0.5 })],
        [tTo + 0.7, (cc, q) => summit35(cc, t, { sunA: 0.6, z: lerp(1.55, 1.6, ease(seg(q, 0, tRv - tTo))), cx: 520, cy: 1460, light: 0.3, lightX: 470, lightW: 240, walkers: top(q, true), post: c2 => bigDust(c2, t, 900, 1700, 0.5, 0.5 * (1 - ramp(q, 0, 1.4)), SEED35 + 97) })],
        [tRv - 0.2, (cc, q) => summit35(cc, t, { sunA: 0.6, z: lerp(1.3, 1.34, ease(seg(q, 0, d - tRv))), cx: -480, cy: 1800, walkers: c2 => { const dist = q * 60, x = -380 - dist; fig(c2, BOY35, { x, y: sumY35(x), h: 315, dir: -1, t, light: 1, wind: 0.5, ink: 0.7, walk: stepOf(dist, 300) }); } })],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tPi - 0.4, 0.25)); quote2(c, 'EN HAUT D\'UNE MONTAGNE', 'POUR L\'EN JETER', a1, 260, 70, 88 * ramp(t, tJe - 0.6, 0.3) + 0.01);
      const a2 = ramp(t, tPi - 0.2, 0.25) * (1 - ramp(t, tTr - 0.4, 0.25)); topShade(c, a2 * 1.3); arabic(c, 'اللهم اكفنيهم بما شئت', 230, a2, 80); bigWord27(c, '« Ô ALLAH, PROTÈGE-MOI D\'EUX', 345, a2 * ramp(t, tPr - 0.7, 0.3), 56); bigWord27(c, 'COMME TU VEUX »', 435, a2 * ramp(t, tPr - 0.2, 0.3), 80, '#f6c453');
      const a3 = ramp(t, tTr - 0.2, 0.2) * (1 - ramp(t, tRv - 0.4, 0.25)); quote2(c, 'LA MONTAGNE TREMBLA', 'ILS TOMBÈRENT', a3, 260, 72, 90 * ramp(t, tTo - 0.4, 0.3) + 0.01);
      const a4 = ramp(t, tRv - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'ET IL REVINT', 'À PIED', a4, 260, 92, 110 * ramp(t, tPd - 0.5, 0.3) + 0.01);
    },
  },
  // 7. the sea: he prayed again; the boat capsized (a heel and a white flash, no one shown in the water); the boy came back alone before the king
  sea: {
    grade: 'rgba(200,215,240,0.08)',
    draw(c, t, d) {
      const tMe = at('sea', 'mer', 0, 1.6), tPr = at('sea', 'pria', 0, 2.4), tBa = at('sea', 'bateau', 0, 3.6), tRn = at('sea', 'renversa', 0, 4.2), tGa = at('sea', 'garcon', 0, 5.6), tSe = at('sea', 'seul', 0, 6.6), tRo = at('sea', 'roi', 0, 7.6);
      shots(c, t, [
        [0, (cc, q) => sea35(cc, t, { z: lerp(1.0, 1.05, ease(seg(q, 0, tPr))), cy: 1200 })],
        [tPr - 0.2, (cc, q) => sea35(cc, t, { z: lerp(1.9, 1.98, ease(seg(q, 0, tBa - tPr))), cx: 620, cy: 1170, pray: ramp(q, 0.1, 0.4), storm: 0.4 * ramp(q, 0.4, 0.8) })],
        [tBa - 0.2, (cc, q) => { const k = ease(seg(q, 0.1, tGa - tBa - 0.4)); sea35(cc, t, { sky: 'dusk', z: lerp(1.2, 1.3, k), cy: 1200, storm: 1, rot: 0.42 * k, sink: k, shake: 0.12, splash: seg(q, tRn - tBa + 0.1, tRn - tBa + 1.0) }); whiteOut(cc, 0.8 * ramp(q, tGa - tBa - 0.7, 0.4)); }],
        [tGa - 0.2, (cc, q) => { sea35(cc, t, { beach: true, sky: 'gold', z: lerp(1.5, 1.55, ease(seg(q, 0, tRo - tGa))), cx: 540, cy: 1480, walkers: (c2, sy) => { const dist = q * 60, x = 380 + dist; fig(c2, BOY35, { x, y: sy(x) + 160, h: 400, dir: 1, t, light: 1, wind: 0.6, ink: 0.7, walk: stepOf(dist, 400) }); } }); whiteOut(cc, 0.8 * (1 - ramp(q, 0, 0.5))); }],
        [tRo - 0.3, (cc, q) => court35(cc, t, { throne: true, z: lerp(1.5, 1.56, ease(seg(q, 0, d - tRo))), cx: 520, cy: 1420, walkers: boyBeforeKing35(t, { kArm: 0.7 * ramp(q, 0.4, 0.4) }) })],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tBa - 0.4, 0.25)); quote2(c, 'EN PLEINE MER', '', a1 * ramp(t, tMe - 0.6, 0.3), 270, 96);
      const a2 = ramp(t, tBa - 0.2, 0.25) * (1 - ramp(t, tGa - 0.5, 0.25)); quote2(c, 'LE BATEAU', 'SE RENVERSA', a2, 260, 92, 100 * ramp(t, tRn - 0.4, 0.3) + 0.01);
      const a3 = ramp(t, tGa - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'IL REVINT, SEUL,', 'DEVANT LE ROI', a3, 260, 88, 92 * ramp(t, tRo - 0.6, 0.3) + 0.01);
    },
  },
  // 8. the secret: « you will not kill me unless you do what I tell you: gather the people, tie me to a trunk, take an arrow from my quiver, say: In the name of Allah, Lord of the boy »
  secret: {
    grade: 'rgba(255,200,150,0.08)',
    draw(c, t, d) {
      const tTu = at('secret', 'tueras', 0, 1.0), tDi = at('secret', 'dis', 0, 3.0), tRa = at('secret', 'rassemble', 0, 3.8), tAt = at('secret', 'attache', 0, 5.4), tTr = at('secret', 'tronc', 0, 6.6), tFl = at('secret', 'fleche', 0, 7.6), tCa = at('secret', 'carquois', 0, 8.8), tNo = at('secret', 'nom', 0, 10.4), tSe = at('secret', 'seigneur', 0, 11.4), tGa = at('secret', 'garcon', 0, 12.4);
      shots(c, t, [
        [0, (cc, q) => court35(cc, t, { throne: true, z: lerp(2.0, 2.08, ease(seg(q, 0, tRa))), cx: 470, cy: 1450, walkers: boyBeforeKing35(t, { reach: 0.6 * ramp(q, 0.3, 0.5) }) })],
        [tRa - 0.2, (cc, q) => najran35(cc, t, NX35(DUSK35, { z: lerp(1.3, 1.35, ease(seg(q, 0, tAt - tRa))), cy: 1470, walkers: streamIn35(t, 40 + q * 75) }))],
        [tAt - 0.2, (cc, q) => najran35(cc, t, NX35(DUSK35, { z: lerp(2.7, 2.8, ease(seg(q, 0, tFl - tAt))), cx: 560, cy: 1340, light: 0.2, lightX: 540, lightW: 200, walkers: c2 => { trunk35(c2, 540, 1440, 0.62, t); fig(c2, BOY35, { x: 610, y: 1442, h: 196, dir: -1, t, light: 1, wind: 0.35, ink: 0.7, reach: 0.5 * ramp(q, tTr - tAt - 0.4, 0.4) }); } }))],
        [tFl - 0.2, (cc, q) => { najran35(cc, t, NX35(DUSK35, { z: 2.4, cx: 540, cy: 1500, fg: false })); cc.fillStyle = 'rgba(10,6,12,0.55)'; cc.fillRect(0, 0, W, H); quiver35(cc, 560, 1380, 2.1, t, ease(seg(q, tCa - tFl - 0.3, tCa - tFl + 0.8))); }],
        [tNo - 0.2, (cc, q) => hero35(cc, t, { z: lerp(1.45, 1.5, ease(seg(q, 0, d - tNo))), cy: 1500, bowUp: 0.6 })],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tRa - 0.4, 0.25)); quote2(c, '« TU NE ME TUERAS QUE SI', 'TU FAIS CE QUE JE TE DIS »', a1, 260, 64, 64 * ramp(t, tDi - 1.0, 0.3) + 0.01); caption(c, 'Sahih Muslim 3005', 470, a1, 30);
      const a2 = ramp(t, tRa - 0.2, 0.25) * (1 - ramp(t, tAt - 0.4, 0.25)); quote2(c, 'RASSEMBLE LES GENS', '', a2, 270, 84);
      const a3 = ramp(t, tAt - 0.2, 0.25) * (1 - ramp(t, tFl - 0.4, 0.25)); quote2(c, 'ATTACHE-MOI', 'À UN TRONC', a3, 260, 92, 96 * ramp(t, tTr - 0.5, 0.3) + 0.01);
      const a4 = ramp(t, tFl - 0.2, 0.25) * (1 - ramp(t, tNo - 0.4, 0.25)); quote2(c, 'UNE FLÈCHE', 'DE MON CARQUOIS', a4, 260, 96, 84 * ramp(t, tCa - 0.6, 0.3) + 0.01);
      const a5 = ramp(t, tNo - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); topShade(c, a5 * 1.3); arabic(c, 'باسم الله رب الغلام', 230, a5, 100); bigWord27(c, '« AU NOM D\'ALLAH,', 350, a5, 80); bigWord27(c, 'SEIGNEUR DU GARÇON »', 445, a5 * ramp(t, tSe - 0.5, 0.3), 80, '#f6c453');
    },
  },
  // 9. the king obeyed; the arrow flew (cut to white light: nothing shown); the boy died (an empty trunk in a column of light); « we believe in the Lord of the boy! »
  arrow: {
    grade: 'rgba(255,190,140,0.08)',
    draw(c, t, d) {
      const tOb = at('arrow', 'obeit', 0, 1.0), tFl = at('arrow', 'fleche', 0, 1.8), tPa = at('arrow', 'partit', 0, 2.4), tMo = at('arrow', 'mourut', 0, 4.4), tFo = at('arrow', 'foule', 0, 5.6), tEc = at('arrow', 'ecria', 0, 6.8), tCy = at('arrow', 'croyons', 0, 7.8), tSg = at('arrow', 'seigneur', 0, 8.8);
      shots(c, t, [
        [0, (cc, q) => hero35(cc, t, { z: lerp(2.5, 2.62, ease(seg(q, 0, tPa))), cx: 830, cy: 1600, bowUp: 1, arrow: q < tPa, draw: ease(seg(q, 0.3, tPa - 0.1)) })],
        [tPa - 0.05, (cc, q) => { hero35(cc, t, { z: 1.7, cx: 640, cy: 1520, bowUp: 1, draw: 0, arrow: false, boyLight: 1.4 }); arrowFly35(cc, 800, 1360, 520, 1180, seg(q, 0, 0.35), 1.4); whiteOut(cc, 0.82 * ease(seg(q, 0.2, 0.5))); }],
        [tMo - 0.6, (cc, q) => { hero35(cc, t, { z: lerp(1.6, 1.55, ease(seg(q, 0, tFo - tMo + 0.6))), cy: 1480, boyGone: true, boyLight: 1.2, light: 0.6 }); whiteOut(cc, 0.82 * (1 - ramp(q, 0, 0.7))); }],
        [tFo - 0.2, (cc, q) => hero35(cc, t, { z: lerp(1.3, 1.25, ease(seg(q, 0, d - tFo))), cy: 1470, boyGone: true, boyLight: 1.0, light: 0.5, cheer: ramp(q, tEc - tFo - 0.3, 0.5), shake: 0.03 * ramp(q, tCy - tFo, 0.3) })],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tPa - 0.3, 0.2)); quote2(c, 'LE ROI OBÉIT', '', a1, 270, 96);
      const a2 = ramp(t, tMo - 0.4, 0.3) * (1 - ramp(t, tFo - 0.4, 0.25)); quote2(c, 'LA FLÈCHE PARTIT…', 'ET LE GARÇON MOURUT', a2, 260, 76, 72);
      const a3 = ramp(t, tFo - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); topShade(c, a3 * 1.3); arabic(c, 'آمنا برب الغلام', 230, a3 * ramp(t, tEc - 0.4, 0.3), 104); bigWord27(c, '« NOUS CROYONS', 350, a3 * ramp(t, tCy - 0.5, 0.3), 92); bigWord27(c, 'AU SEIGNEUR DU GARÇON ! »', 450, a3 * ramp(t, tSg - 0.5, 0.3), 70, '#f6c453');
    },
  },
  // 10. furious, the king had trenches dug and set alight; those who would not renounce were thrown in (never shown); they sat at its edge, watching (Al-Buruj 6-7)
  trench: {
    grade: 'rgba(255,170,120,0.08)',
    draw(c, t, d) {
      const tFu = at('trench', 'furieux', 0, 0.6), tCr = at('trench', 'creuser', 0, 1.8), tAl = at('trench', 'alluma', 0, 3.8), tRn = at('trench', 'reniaient', 0, 5.8), tJe = at('trench', 'jetes', 0, 7.6), tCo = at('trench', 'coran', 0, 8.8), tAs = at('trench', 'assis', 0, 10.0), tRe = at('trench', 'regarder', 0, 11.4);
      shots(c, t, [
        [0, (cc, q) => court35(cc, t, { throne: true, dim: 0.3, z: lerp(1.9, 2.0, ease(seg(q, 0, tCr))), cx: 540, cy: 1250, shake: 0.03, walkers: c2 => king35(c2, { x: 540, y: 1560, h: 560, dir: 1, t, light: 1, wind: 0.1, ink: 0.75, armUp: 0.95 * ramp(q, 0.1, 0.3) }) })],
        [tCr - 0.2, (cc, q) => najran35(cc, t, NX35(DUSK35, { z: lerp(1.45, 1.5, ease(seg(q, 0, tAl - tCr))), cy: 1470, props: c2 => trench35(c2, t, -300, 1400, 1520, 26, { dig: lerp(0.45, 0.9, ease(seg(q, 0, tAl - tCr))), noEnd: false }), walkers: c2 => {
          [[60, 1610, 1, 1], [330, 1640, 3, -1], [700, 1600, 5, 1]].forEach(([x0, y, f, dd], j) => { const dist = q * 40, x = x0 + dd * dist; carrier33(c2, NAJ35[f], { x, y, h: hY35(y), dir: dd, t: t + j, light: 0.9, wind: 0.3, ink: 0.65, walk: stepOf(dist, hY35(y)) + j * 0.3 }, { fill: false }); });
          [[200, 1560], [520, 1555]].forEach(([x, y], j) => fig(c2, NAJ35[6 + j], { x, y, h: hY35(y), pose: 'kneel', dir: j ? -1 : 1, t: t + j, light: 0.85, wind: 0.3, ink: 0.65, reach: 0.5 + 0.3 * Math.sin(t * 3 + j) }));
          sold35(c2, 0, { x: 950, y: 1700, h: hY35(1700), dir: -1, t, light: 0.9, wind: 0.3, ink: 0.7 }); } }))],
        [tAl - 0.2, (cc, q) => najran35(cc, t, NX35(NIGHT35, { z: lerp(1.6, 1.66, ease(seg(q, 0, tRn - tAl))), cy: 1480, props: c2 => trench35(c2, t, -400, 1500, 1520, 26, { k: ease(seg(q, 0.2, 1.4)), night: 1 }), post: c2 => fireLight35(c2, 0.8 * ease(seg(q, 0.2, 1.4))) }))],
        [tRn - 0.2, (cc, q) => najran35(cc, t, NX35(NIGHT35, { z: lerp(1.35, 1.4, ease(seg(q, 0, tCo - tRn))), cy: 1480, props: c2 => trench35(c2, t, -500, 1600, 1440, 18, { k: 1, night: 1, fs: 0.9 }), walkers: believers35(t), post: c2 => fireLight35(c2, 0.9) }))],
        [tCo - 0.2, (cc, q) => najran35(cc, t, NX35(NIGHT35, { z: lerp(1.5, 1.56, ease(seg(q, 0, d - tCo))), cy: 1560, props: c2 => trench35(c2, t, -500, 1600, 1600, 30, { k: 1, night: 1, fs: 1.2 }), walkers: seated35(t), post: c2 => fireLight35(c2, 1) }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.05, 0.2) * (1 - ramp(t, tCr - 0.4, 0.2)); quote2(c, 'FURIEUX', '', a1, 270, 120);
      const a2 = ramp(t, tCr - 0.2, 0.25) * (1 - ramp(t, tAl - 0.4, 0.25)); quote2(c, 'IL FIT CREUSER', 'DES TRANCHÉES', a2, 260, 88, 96);
      const a3 = ramp(t, tAl - 0.2, 0.25) * (1 - ramp(t, tRn - 0.4, 0.25)); quote2(c, 'ET Y ALLUMA', 'UN FEU', a3, 260, 88, 120);
      const a4 = ramp(t, tRn - 0.2, 0.25) * (1 - ramp(t, tCo - 0.4, 0.25)); quote2(c, 'ILS NE RENIAIENT PAS', 'LEUR FOI', a4, 260, 76, 110);
      const a5 = ramp(t, tCo - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); topShade(c, a5 * 1.3); arabic(c, 'إذ هم عليها قعود', 230, a5, 100); bigWord27(c, 'ASSIS AU BORD,', 350, a5 * ramp(t, tAs - 0.5, 0.3), 84); bigWord27(c, 'À REGARDER', 450, a5 * ramp(t, tRe - 0.6, 0.3), 92, '#f6c453'); caption(c, 'Al-Buruj, versets 6-7', 520, a5, 28);
    },
  },
  // 11. the open loop paid: a woman came with her baby and hesitated; the baby spoke: « Mother, be patient! You are upon the truth » (Muslim 3005)
  baby: {
    grade: 'rgba(255,190,150,0.08)',
    draw(c, t, d) {
      const tFe = at('baby', 'femme', 0, 0.6), tBb = at('baby', 'bebe', 0, 1.8), tHe = at('baby', 'hesita', 0, 3.0), tPa = at('baby', 'parla', 0, 4.8), tMa = at('baby', 'maman', 0, 5.6), tPt = at('baby', 'patience', 0, 6.4), tVe = at('baby', 'verite', 0, 8.2);
      const fireBg = c2 => trench35(c2, t, -500, 1600, 1460, 20, { k: 1, night: 1, fs: 1 });
      shots(c, t, [
        [0, (cc, q) => najran35(cc, t, NX35(NIGHT35, { z: lerp(1.6, 1.66, ease(seg(q, 0, tHe))), cx: 480, cy: 1520, props: fireBg, walkers: c2 => { const dist = 30 + q * 50; mother35(c2, t, 300 + dist, 1740, { dir: 1, walk: stepOf(dist, hY35(1740)) }); }, post: c2 => fireLight35(c2, 0.9) }))],
        [tHe - 0.2, (cc, q) => najran35(cc, t, NX35(NIGHT35, { z: lerp(2.2, 2.26, ease(seg(q, 0, tPa - tHe))), cx: 520, cy: 1560, props: fireBg, walkers: c2 => { const back = 30 * ease(seg(q, 0.2, 1.0)); mother35(c2, t, 540 - back, 1740, { dir: 1, walk: back > 0.5 && back < 29.5 ? -stepOf(back, hY35(1740)) : null }); }, post: c2 => fireLight35(c2, 0.9) }))],
        [tPa - 0.2, (cc, q) => najran35(cc, t, NX35(NIGHT35, { z: lerp(2.6, 2.7, ease(seg(q, 0, tMa - tPa))), cx: 530, cy: 1540, props: fireBg, fg: false, walkers: c2 => mother35(c2, t, 510, 1740, { dir: 1, baby: 0.4 * ramp(q, 0.3, 0.6) }), post: c2 => fireLight35(c2, 0.8) }))],
        [tMa - 0.2, (cc, q) => najran35(cc, t, NX35(NIGHT35, { z: lerp(1.9, 1.84, ease(seg(q, 0, d - tMa))), cx: 520, cy: 1520, props: fireBg, walkers: c2 => mother35(c2, t, 510, 1740, { dir: 1, baby: 0.6 + 0.3 * ramp(q, tPt - tMa, 0.6) }), post: c2 => fireLight35(c2, 0.7) }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tPa - 0.4, 0.25)); quote2(c, 'UNE FEMME', 'ET SON BÉBÉ', a1, 260, 96, 96 * ramp(t, tBb - 0.6, 0.3) + 0.01);
      caption(c, 'elle hésita', 470, a1 * ramp(t, tHe - 0.3, 0.3), 40);
      const a2 = ramp(t, tPa - 0.2, 0.25) * (1 - ramp(t, tMa - 0.4, 0.25)); quote2(c, 'ALORS', 'LE BÉBÉ PARLA', a2, 260, 80, 104);
      const a3 = ramp(t, tMa - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); topShade(c, a3 * 1.3); arabic(c, 'يا أمه اصبري فإنك على الحق', 230, a3, 64); bigWord27(c, '« MAMAN, PATIENCE !', 345, a3 * ramp(t, tPt - 0.6, 0.3), 80); bigWord27(c, 'TU ES DANS LA VÉRITÉ »', 440, a3 * ramp(t, tVe - 0.8, 0.3), 76, '#f6c453'); caption(c, 'Sahih Muslim 3005', 510, a3, 28);
    },
  },
  // 12. the lesson (Al-Buruj 8 and 11): their only « crime » was to believe; the king thought he had won; for them gardens: that is the great success
  lesson: {
    grade: 'rgba(255,215,170,0.09)',
    draw(c, t, d) {
      const tRp = at('lesson', 'reprochait', 0, 1.0), tCr = at('lesson', 'croire', 0, 2.8), tPu = at('lesson', 'puissant', 0, 4.0), tRo = at('lesson', 'roi', 0, 6.4), tGa = at('lesson', 'gagne', 0, 7.6), tJa = at('lesson', 'jardins', 0, 10.0), tCe = at('lesson', 'cest', 1, 11.0), tSu = at('lesson', 'succes', 0, 12.4);
      shots(c, t, [
        [0, (cc, q) => najran35(cc, t, NX35(DAWN35, { z: lerp(1.05, 1.1, ease(seg(q, 0, tRo))), cy: lerp(1220, 1250, ease(seg(q, 0, tRo))), light: 0.25 * ramp(q, 0.5, 1.5), lightX: 300, props: c2 => trench35(c2, t, -500, 1600, 1440, 16, { k: 0, smoke: false }), post: c2 => smoke33(c2, t, 0.8, -200, 1300) }))],
        [tRo - 0.2, (cc, q) => najran35(cc, t, NX35(DAWN35, { z: lerp(1.6, 1.64, ease(seg(q, 0, tJa - tRo))), cx: 560, cy: 1540, props: c2 => trench35(c2, t, -500, 1600, 1500, 22, { k: 0, smoke: false }), walkers: c2 => { rug(c2, 640, 1760, 360, 70, '#5a1a22'); king35(c2, { x: 640, y: 1750, h: hY35(1750), pose: 'sit', dir: -1, t, light: 0.85, wind: 0.3, ink: 0.7 }); }, post: c2 => smoke33(c2, t, 0.7, -200, 1300) }))],
        [tJa - 0.3, (cc, q) => garden28(cc, t, { z: lerp(1.15, 1.2, ease(seg(q, 0, tCe - tJa))) })],
        [tCe - 0.2, (cc, q) => garden28(cc, t, { z: lerp(1.0, 1.04, ease(seg(q, 0, d - tCe))) })],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tRo - 0.4, 0.25)); topShade(c, a1 * 1.3); arabic(c, 'وما نقموا منهم إلا أن يؤمنوا بالله', 230, a1, 56);
      bigWord27(c, 'LEUR SEUL « CRIME » :', 345, a1 * ramp(t, tRp - 0.5, 0.3), 70); bigWord27(c, 'CROIRE EN ALLAH', 440, a1 * ramp(t, tCr - 0.5, 0.3), 88, '#f6c453'); caption(c, 'Al-Buruj, verset 8', 510, a1, 28);
      const a2 = ramp(t, tRo - 0.2, 0.25) * (1 - ramp(t, tJa - 0.5, 0.25)); quote2(c, 'LE ROI CROYAIT', 'AVOIR GAGNÉ', a2, 260, 88, 100 * ramp(t, tGa - 0.6, 0.3) + 0.01);
      const a3 = ramp(t, tJa - 0.3, 0.25) * (1 - ramp(t, tCe - 0.4, 0.25)); quote2(c, 'POUR EUX,', 'DES JARDINS', a3, 260, 84, 110, '#c88a20'); caption(c, 'Al-Buruj, verset 11', 470, a3, 30, '#5a3a14');
      const a4 = ramp(t, tCe - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); topShade(c, a4 * 1.6); arabic(c, 'ذلك الفوز الكبير', 230, a4, 110); bigWord27(c, 'C\'EST CELA,', 350, a4, 84); bigWord27(c, 'LE GRAND SUCCÈS', 455, a4 * ramp(t, tSu - 0.6, 0.3), 96, '#f6c453');
    },
  },
  cta: {
    grade: 'rgba(255,180,130,0.08)',
    draw(c, t, d) {
      hero35(c, 60 + t, { z: lerp(1.37, 1.34, seg(t, 0, d)), cy: lerp(1490, 1484, seg(t, 0, d)) });
      c.fillStyle = 'rgba(6,8,18,0.3)'; c.fillRect(0, 0, W, H);
      ctaText35(c, seg(t, 0.1, 0.6));
    },
  },
  // the last frame dissolves into the first (hook)
  outro: {
    grade: 'rgba(255,180,130,0.08)',
    draw(c, t, d) {
      const back = seg(t, d - 0.8, d);
      if (back <= 0) { const cd = ((window.TL.scenes || []).find(s => s.id === 'cta') || { dur: 6 }).dur; hero35(c, 60 + cd + t, { z: lerp(1.34, 1.32, seg(t, 0, d - 0.8)), cy: lerp(1484, 1480, seg(t, 0, d - 0.8)) }); }
      else hero35(c, 0, {});
      const k = 1 - seg(t, d - 2.0, d - 1.2);
      c.fillStyle = `rgba(6,8,18,${0.3 * k})`; c.fillRect(0, 0, W, H);
      ctaText35(c, k);
      flashW(c, 0.3 * Math.sin(Math.PI * clamp((t - (d - 1.6)) / 1.6)));
      const a = seg(t, d - 0.8, d - 0.1); if (a > 0) { c.save(); c.globalAlpha = a; hookTexts35(c, 1); c.restore(); }
    },
  },
  cover: {
    draw(c) {
      hero35(c, 0.4, { z: 1.55, cx: 600, cy: 1520, cheer: 0.6 });
      const g = c.createLinearGradient(0, 0, 0, 820); g.addColorStop(0, 'rgba(6,8,18,0.88)'); g.addColorStop(1, 'rgba(6,8,18,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 820);
      seriesTag35(c, 1);
      textS(c, 'IL A DIT AU ROI', 250, 1, '700 104px Lora', 104, '#fff6e0', 24);
      textGlow(c, 'COMMENT LE TUER', W / 2, 375, '700 100px Lora', '#f6c453', 1, '#000', 24);
      textGlow(c, 'et tout un peuple a cru', W / 2, 480, 'italic 500 56px Lora', '#fff3dc', 1, '#000', 20);
      const g2 = c.createLinearGradient(0, 1420, 0, H); g2.addColorStop(0, 'rgba(6,8,18,0)'); g2.addColorStop(1, 'rgba(6,8,18,0.85)'); c.fillStyle = g2; c.fillRect(0, 1420, W, 500);
      arabic(c, 'أصحاب الأخدود', 1650, 1, 120);
      textGlow(c, 'Les gens de la Tranchée', W / 2, 1790, 'italic 500 54px Lora', '#fff3dc', 1, '#000', 14);
    },
  },
};
function hookTexts35(c, a) { if (a <= 0) return; quote2(c, 'IL A EXPLIQUÉ AU ROI', 'COMMENT LE TUER', a, 260, 74, 96); seriesTag35(c, a); }
