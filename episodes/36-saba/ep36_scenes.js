
// ---------- episode 36 scenes
const NX36 = (...a) => Object.assign({}, ...a);
// the family at the foot of a fruit tree in the garden: rug, basket of fruits, people sitting; a man picking a fruit (o.pick), o.dua = thanks
function family36(T, o = {}) { return c => { const y = 1720, h = oH36(y) * 1.0;
  rug(c, 470, y + 6, 520, 90, '#7a2a22'); basket33(c, 470, y - 40, 0.75, { fill: 1 }); bowl(c, 560, y - 30, 0.8);
  fig(c, SABA36[0], { x: 300, y: y - 10, h: h * 1.02, pose: 'sit', dir: 1, t: T, light: 1, wind: 0.2, ink: 0.7, dua: !!o.dua });
  fig(c, WOMAN36, { x: 640, y: y - 18, h: h * 0.98, pose: 'sit', dir: -1, t: T + 1, light: 1, wind: 0.2, ink: 0.7 });
  fig(c, GIRL36, { x: 420, y: y + 20, h: h * 1.0, pose: 'sit', dir: 1, t: T + 2, light: 1, wind: 0.2, ink: 0.7 });
  fruitTree36(c, 1000, y - 20, 1.05, T, SEED36 + 170, {});
  fig(c, SABA36[2], { x: 860, y: y + 30, h: h * 1.12, dir: -1, t: T + 3, light: 1, wind: 0.2, ink: 0.7, armUp: o.pick === undefined ? 0.85 : o.pick }); }; }
// the rich men at their feast on the roof terrace (o.stand = one rises and speaks; o.away = they turn their backs to the light)
function feast36(T, o = {}) { return c => { const y = 1720, h = 330;
  rug(c, 540, y + 20, 760, 120, '#5a1a2e'); [[300, 0], [540, 1], [780, 2]].forEach(([x, i]) => cushion(c, x, y - 40, 1.3, ['#8a2a3a', '#2a4a6a', '#6a4a2a'][i]));
  basket33(c, 540, y - 6, 0.9, { fill: 1, col: '#c8a060' }); ewer32(c, 650, y - 4, 0.7); bowl(c, 420, y - 2, 0.9);
  fig(c, RICH36[0], { x: 300, y: y - 30, h, pose: 'sit', dir: o.away ? -1 : 1, t: T, light: 1, wind: 0.15, ink: 0.7 });
  fig(c, RICH36[2], { x: 780, y: y - 30, h, pose: 'sit', dir: o.away ? 1 : -1, t: T + 1, light: 1, wind: 0.15, ink: 0.7 });
  if (o.stand) fig(c, RICH36[1], { x: 560, y: y - 10, h: h * 1.25, dir: 1, t: T + 2, light: 1.05, wind: 0.15, ink: 0.75, reach: o.stand });
  else fig(c, RICH36[1], { x: 560, y: y - 40, h, pose: 'sit', dir: o.away ? 1 : -1, t: T + 2, light: 1, wind: 0.15, ink: 0.7 }); }; }
// the three plants of Saba 16 up close in the dry valley (khamt left, tamarisk centre, sidr right); k = [kA, kT, kS] glow under each
function plants36(T, k = [0, 0, 0]) { return c => {
  [[560, 1690, 'T'], [210, 1800, 'K'], [880, 1780, 'S']].forEach(([x, y, w], i) => { const kk = k[w === 'K' ? 0 : w === 'T' ? 1 : 2]; if (kk > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glow(c, x, y - 120, 260, '#ffe0a0', 0.25 * kk); c.restore(); }
    if (w === 'K') khamt36(c, x, y, 1.55, T, SEED36 + 150); else if (w === 'T') tamarisk36(c, x, y, 1.35, T, SEED36 + 151); else sidr36(c, x, y, 1.05, T, SEED36 + 152); }); }; }
// the people leaving the valley (two groups going opposite ways, camels; steps driven by the distance)
function leaving36(T, dist) { return c => {
  caravan36(c, T, dist, [[0, 0], ['C', -150], [2, -300], [3, -400]], { dir: -1, x0: 380, gy: () => 1450, h: hY36(1450) });
  caravan36(c, T, dist, [[4, 0], ['C', -170], [5, -330]], { dir: 1, x0: 700, gy: () => 1600, h: hY36(1600) }); }; }
// the dry valley where the torrent passed: dam broken, no water
const AFTER36 = Object.assign({}, DUSK36, { sky: 'dusk', to: 'grey', k: 0.45, after: 1, breach: 1, lamp: 0, town: false });
const RUINS36 = Object.assign({}, DUSK36, { after: 1, ruins: 1, town: false, lamp: 0 });

const SCENES = {
  // 1. HOOK — they had everything; Allah asked only one thing: to say thank you; they turned away… and the dam gave way (Saba 15-16)
  hook: {
    grade: 'rgba(200,190,170,0.06)',
    draw(c, t, d) {
      const tTo = at('hook', 'tout', 0, 1.0), tAl = at('hook', 'allah', 0, 1.8), tMe = at('hook', 'merci', 0, 4.4), tDe = at('hook', 'detournes', 0, 6.4), tDi = at('hook', 'digue', 0, 7.8), tCe = at('hook', 'cede', 0, 8.6);
      shots(c, t, [
        [0, (cc, q) => hero36(cc, t, { z: lerp(1.32, 1.37, ease(seg(q, 0, tTo + 0.3))), cy: lerp(1235, 1225, ease(seg(q, 0, tTo + 0.3))) })],
        [tTo + 0.3, (cc, q) => marib36(cc, t, NX36(GOLD36, { flow: 1, z: lerp(1.12, 1.18, ease(seg(q, 0, tAl - tTo))), cy: 1180 }))],
        [tAl - 0.2, (cc, q) => orchard36(cc, t, { z: lerp(1.1, 1.15, ease(seg(q, 0, tDe - tAl))), walkY: 1650, light: 0.3 * ramp(q, tMe - tAl - 0.6, 0.6), lightX: 560, lightW: 260,
          walkers: c2 => { const y = 1690; fig(c2, SABA36[3], { x: 560, y, h: oH36(y), dir: -1, t, light: 1.05, wind: 0.2, ink: 0.7, dua: q > tMe - tAl - 0.3 }); } })],
        [tDe - 0.2, (cc, q) => terrace36(cc, t, { z: lerp(1.05, 1.1, ease(seg(q, 0, tDi - tDe))), dim: 0.4 * ramp(q, 0.2, 0.8), walkers: feast36(t, { away: true }) })],
        [tDi - 0.3, (cc, q) => hero36(cc, t, { z: lerp(2.1, 2.2, ease(seg(q, 0, d - tDi))), cx: 540, cy: 1160, breach: lerp(0.35, 0.85, ease(seg(q, 0.1, 1.3))), flood: lerp(0.05, 0.25, ease(seg(q, 0.2, 2.0))), shake: 0.12 * ramp(q, 0.3, 0.3) })],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      hookTexts36(c, 1 - ramp(t, tAl - 0.4, 0.2));
      const a2 = ramp(t, tAl - 0.2, 0.25) * (1 - ramp(t, tDe - 0.4, 0.25)); quote2(c, 'UNE SEULE CHOSE :', 'DIRE MERCI', a2, 260, 72, 110 * ramp(t, tMe - 0.4, 0.3) + 0.01); seriesTag36(c, a2);
      const a3 = ramp(t, tDe - 0.2, 0.25) * (1 - ramp(t, tDi - 0.5, 0.25)); quote2(c, 'ILS SE SONT', 'DÉTOURNÉS…', a3, 260, 84, 100); seriesTag36(c, a3);
      const a4 = ramp(t, tDi - 0.3, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, '…ET LA DIGUE', 'A CÉDÉ', a4, 260, 88, 120 * ramp(t, tCe - 0.4, 0.3) + 0.01); seriesTag36(c, a4);
      caption(c, 'sourate Saba, versets 15 et 16', 520, a4 * ramp(t, tCe, 0.3), 30);
    },
  },
  // 2. the people of Saba (sura Saba, 34); the open loop: their name became a proverb the Arabs still say
  promise: {
    grade: 'rgba(255,200,160,0.07)',
    draw(c, t, d) {
      const tSa = at('promise', 'saba', 0, 2.2), tSo = at('promise', 'sourate', 0, 3.4), tRe = at('promise', 'reste', 0, 5.6), tPr = at('promise', 'proverbe', 0, 8.6), tAr = at('promise', 'arabes', 0, 9.8), tEn = at('promise', 'encore', 0, 10.8);
      shots(c, t, [
        [0, (cc, q) => marib36(cc, t, NX36(DAWN36, { flow: 1, z: lerp(1.04, 1.09, ease(seg(q, 0, tSo))), cy: lerp(1150, 1170, ease(seg(q, 0, tSo))), lamp: 0.3 }))],
        [tSo - 0.2, (cc, q) => marib36(cc, t, NX36(DAWN36, { flow: 1, z: lerp(2.0, 2.08, ease(seg(q, 0, tRe - tSo))), cx: lerp(880, 940, ease(seg(q, 0, tRe - tSo))), cy: 1210, lamp: 0.5 }))],
        [tRe - 0.2, (cc, q) => route36(cc, t, { sky: 'gold', z: lerp(1.2, 1.25, ease(seg(q, 0, tAr - tRe))), cy: 1350, px: q * 30, walkers: c2 => caravan36(c2, t, 60 + q * 70, [[0, 0], ['C', -160], [1, -320], ['C', -470]], { dir: 1, x0: 330, h: 300 }) })],
        [tAr - 0.2, (cc, q) => campfire36(cc, t, { z: lerp(1.3, 1.36, ease(seg(q, 0, d - tAr))), cy: 1420 })],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a0 = ramp(t, 0.05, 0.25) * (1 - ramp(t, tRe - 0.4, 0.25)); topShade(c, a0 * 1.3); arabic(c, 'سبأ', 250, a0, 140);
      bigWord27(c, 'LE PEUPLE DE SABA', 390, a0 * ramp(t, tSa - 0.5, 0.3), 80, '#f6c453'); caption(c, 'sourate Saba (34), versets 15 à 19', 470, a0 * ramp(t, tSo - 0.3, 0.3), 32); seriesTag36(c, a0);
      const a2 = ramp(t, tRe - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'RESTE JUSQU\'AU BOUT :', 'LEUR NOM EST DEVENU UN PROVERBE', a2, 260, 66, 54 * ramp(t, tPr - 0.8, 0.3) + 0.01);
      caption(c, 'que les Arabes disent encore', 470, a2 * ramp(t, tAr - 0.2, 0.3), 36);
    },
  },
  // 3. in Yemen, at Ma'rib according to the exegetes: a huge dam between two mountains; it held the rain water and watered the valley; its ruins still stand
  dam: {
    grade: 'rgba(255,215,170,0.07)',
    draw(c, t, d) {
      const tYe = at('dam', 'yemen', 0, 0.6), tMa = at('dam', "ma'rib", 0, 1.4), tBa = at('dam', 'bati', 0, 4.0), tDi = at('dam', 'digue', 0, 5.2), tMo = at('dam', 'montagnes', 0, 6.4), tRe = at('dam', 'retenait', 0, 7.6), tPl = at('dam', 'pluies', 0, 8.6), tAr = at('dam', 'arrosait', 0, 9.4), tVa = at('dam', 'vallee', 0, 10.4), tRu = at('dam', 'ruines', 0, 11.6), tDe = at('dam', 'debout', 0, 12.8);
      shots(c, t, [
        [0, (cc, q) => map36(cc, t, { z: lerp(1.05, 1.55, ease(seg(q, 0, tBa))), cx: lerp(560, 780, ease(seg(q, 0, tBa))), cy: lerp(1150, 1560, ease(seg(q, 0, tBa))) })],
        [tBa - 0.2, (cc, q) => marib36(cc, t, NX36(DAY36, { z: lerp(2.3, 2.3, 0), cx: lerp(330, 760, ease(seg(q, 0, tRe - tBa))), cy: 1120 }))],
        [tRe - 0.2, (cc, q) => marib36(cc, t, NX36(DAY36, { sky: 'grey', to: 'day', k: 0.3, sunA: 0, z: lerp(1.5, 1.56, ease(seg(q, 0, tAr - tRe))), cy: 1060, rain: ramp(q, 0, 0.4) * (1 - ramp(q, tAr - tRe - 0.5, 0.4)) }))],
        [tAr - 0.2, (cc, q) => marib36(cc, t, NX36(DAY36, { flow: ramp(q, 0, 0.6), z: lerp(1.14, 1.08, ease(seg(q, 0, tRu - tAr))), cy: lerp(1240, 1200, ease(seg(q, 0, tRu - tAr))) }))],
        [tRu - 0.2, (cc, q) => marib36(cc, t, NX36(RUINS36, { z: lerp(1.6, 1.66, ease(seg(q, 0, d - tRu))), cx: 420, cy: 1130 }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tBa - 0.4, 0.25)); quote2(c, 'AU YÉMEN,', 'À MA\'RIB', a1, 260, 84, 104 * ramp(t, tMa - 0.5, 0.3) + 0.01); caption(c, 'selon les exégètes', 470, a1 * ramp(t, tMa, 0.3), 34);
      const a2 = ramp(t, tBa - 0.2, 0.25) * (1 - ramp(t, tRe - 0.4, 0.25)); quote2(c, 'UNE IMMENSE DIGUE', 'ENTRE DEUX MONTAGNES', a2, 260, 80, 72 * ramp(t, tMo - 0.6, 0.3) + 0.01);
      const a3 = ramp(t, tRe - 0.2, 0.25) * (1 - ramp(t, tAr - 0.4, 0.25)); quote2(c, 'ELLE RETENAIT', 'L\'EAU DES PLUIES', a3, 260, 84, 92 * ramp(t, tPl - 0.6, 0.3) + 0.01);
      const a4 = ramp(t, tAr - 0.2, 0.25) * (1 - ramp(t, tRu - 0.4, 0.25)); quote2(c, 'ET ARROSAIT', 'TOUTE LA VALLÉE', a4, 260, 84, 92 * ramp(t, tVa - 0.6, 0.3) + 0.01);
      const a5 = ramp(t, tRu - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'SES RUINES', 'SONT ENCORE DEBOUT', a5, 260, 92, 80 * ramp(t, tDe - 0.6, 0.3) + 0.01); caption(c, 'Ma\'rib, Yémen — aujourd\'hui', 470, a5, 32);
    },
  },
  // 4. « two gardens, on the right and on the left » (Saba 15); according to the reports (Qatada), a woman walked under the trees with a basket on her head and it filled with fruit
  gardens: {
    grade: 'rgba(255,220,170,0.07)',
    draw(c, t, d) {
      const tCo = at('gardens', 'coran', 0, 0.6), tDe = at('gardens', 'deux', 0, 1.4), tDr = at('gardens', 'droite', 0, 3.0), tGa = at('gardens', 'gauche', 0, 4.4), tRe = at('gardens', 'recits', 0, 5.8), tFe = at('gardens', 'femme', 0, 6.8), tPa = at('gardens', 'panier', 0, 9.0), tTe = at('gardens', 'tete', 0, 9.8), tRm = at('gardens', 'remplissait', 0, 11.0), tFr = at('gardens', 'fruits', 0, 12.0);
      const t0 = tRe - 0.2, NF = 8, drops = [...Array(NF).keys()].map(i => tTe - t0 + 0.2 + i * Math.max(0.3, (tFr - tTe + 0.6) / NF));
      shots(c, t, [
        [0, (cc, q) => marib36(cc, t, NX36(GOLD36, { flow: 1, z: lerp(1.2, 1.26, ease(seg(q, 0, t0))), cy: lerp(1250, 1270, ease(seg(q, 0, t0))),
          post: c2 => { sideGlow36(c2, 1, ramp(q, tDr - 0.4, 0.4) * (1 - ramp(q, tGa - 0.3, 0.6) * 0.5)); sideGlow36(c2, 0, ramp(q, tGa - 0.4, 0.4)); } }))],
        [t0, (cc, q) => { const dist = 40 + q * 85, x = -40 + dist, y = 1700, h = oH36(y), wo = { x, y, h, dir: 1, t, light: 1.05, wind: 0.2, ink: 0.7, walk: stepOf(dist, h) };
          orchard36(cc, t, { z: 1.12, cx: lerp(380, 560, ease(seg(q, 0, d - t0))), cy: 1360, walkY: 1690, canopy: 880, walkers: c2 => {
            const fill = drops.filter(td => q > td + 0.55).length / NF; basketWoman36(c2, t, wo, fill);
            const [hx, hy, hr] = headOf(wo); drops.forEach((td, i) => { const p = (q - td) / 0.55; if (p > 0 && p < 1) { const xx = hx + (i % 3 - 1) * 14 + dist * 0, s = h / 300; fallingFruit36(c2, hx + (i % 3 - 1) * 12 * s, hy - hr * 1.9, s, p, ['#e2862a', '#c8402a', '#e8a832'][i % 3], 860); } }); } }); }],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, t0 - 0.2, 0.25)); topShade(c, a1 * 1.3); arabic(c, 'جنتان عن يمين وشمال', 230, a1, 84); bigWord27(c, 'DEUX JARDINS', 350, a1 * ramp(t, tDe - 0.5, 0.3), 92, '#f6c453');
      bigWord27(c, 'L\'UN À DROITE, L\'AUTRE À GAUCHE', 445, a1 * ramp(t, tDr - 0.6, 0.3), 50); caption(c, 'Saba, verset 15', 510, a1, 28);
      const a2 = ramp(t, t0, 0.25) * (1 - ramp(t, tPa - 0.4, 0.25)); quote2(c, 'SELON LES RÉCITS,', 'UNE FEMME SOUS LES ARBRES', a2, 260, 70, 64 * ramp(t, tFe - 0.6, 0.3) + 0.01); caption(c, 'Qatada, cité par les exégètes', 470, a2, 30);
      const a3 = ramp(t, tPa - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'UN PANIER SUR LA TÊTE…', '…QUI SE REMPLISSAIT', a3, 260, 66, 84 * ramp(t, tRm - 0.6, 0.3) + 0.01);
    },
  },
  // 5. « Eat from the provision of your Lord and be grateful to Him: a good land, and a forgiving Lord » (Saba 15)
  command: {
    grade: 'rgba(255,215,170,0.07)',
    draw(c, t, d) {
      const tMa = at('command', 'mangez', 0, 1.4), tSe = at('command', 'seigneur', 0, 3.0), tRe = at('command', 'reconnaissants', 0, 5.4), tBo = at('command', 'bonne', 0, 7.2), tCo = at('command', 'contree', 0, 7.8), tPa = at('command', 'pardonne', 0, 10.2);
      shots(c, t, [
        [0, (cc, q) => orchard36(cc, t, { z: lerp(1.15, 1.2, ease(seg(q, 0, tRe))), cy: 1420, walkY: 1690, light: 0.22 * ramp(q, tSe - 0.4, 0.8), lightX: 520, lightW: 320, walkers: family36(t, { pick: lerp(0.4, 0.95, ease(seg(q, 0.3, 2.0))) }) })],
        [tRe - 0.2, (cc, q) => orchard36(cc, t, { z: lerp(1.9, 1.96, ease(seg(q, 0, tBo - tRe))), cx: 380, cy: 1560, walkY: 1690, light: 0.3, lightX: 320, lightW: 220, walkers: family36(t, { dua: true, pick: 0.6 }) })],
        [tBo - 0.2, (cc, q) => marib36(cc, t, NX36(GOLD36, { flow: 1, lamp: 0.4, z: lerp(1.05, 1.1, ease(seg(q, 0, d - tBo))), cy: lerp(1170, 1150, ease(seg(q, 0, d - tBo))), light: 0.18 * ramp(q, tPa - tBo - 0.6, 0.8), lightX: 540, lightW: 520 }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tBo - 0.4, 0.25)); topShade(c, a1 * 1.3); arabic(c, 'كلوا من رزق ربكم واشكروا له', 230, a1, 70);
      bigWord27(c, '« MANGEZ DE CE QUE VOTRE SEIGNEUR', 340, a1 * ramp(t, tMa - 0.4, 0.3), 44); bigWord27(c, 'VOUS DONNE…', 410, a1 * ramp(t, tMa - 0.2, 0.3), 56); bigWord27(c, 'ET SOYEZ-LUI RECONNAISSANTS »', 490, a1 * ramp(t, tRe - 0.6, 0.3), 54, '#f6c453');
      const a2 = ramp(t, tBo - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); topShade(c, a2 * 1.3); arabic(c, 'بلدة طيبة ورب غفور', 230, a2, 92); bigWord27(c, '« UNE BONNE CONTRÉE,', 350, a2 * ramp(t, tCo - 0.6, 0.3), 70); bigWord27(c, 'ET UN SEIGNEUR QUI PARDONNE »', 440, a2 * ramp(t, tPa - 0.8, 0.3), 56, '#f6c453'); caption(c, 'Saba, verset 15', 505, a2, 28);
    },
  },
  // 6. between them and the blessed lands (ash-Sham) visible towns at measured stages; « travel there by night and by day in safety » (Saba 18)
  route: {
    grade: 'rgba(255,210,170,0.07)',
    draw(c, t, d) {
      const tTe = at('route', 'terres', 0, 1.0), tCh = at('route', 'cham', 0, 2.0), tVi = at('route', 'villages', 0, 3.8), tVs = at('route', 'visibles', 0, 4.6), tDi = at('route', 'distance', 0, 5.6), tVo = at('route', 'voyageait', 0, 7.4), tNu = at('route', 'nuit', 0, 8.4), tJo = at('route', 'jour', 0, 9.4), tSe = at('route', 'securite', 0, 10.4);
      shots(c, t, [
        [0, (cc, q) => map36(cc, t, { z: lerp(1.0, 1.04, ease(seg(q, 0, tVo))), cy: lerp(1140, 1120, ease(seg(q, 0, tVo))), towns: ease(seg(q, tVi - 0.3, tDi + 0.6)) })],
        [tVo - 0.2, (cc, q) => route36(cc, t, { night: 1, z: lerp(1.25, 1.3, ease(seg(q, 0, tJo - tVo))), cy: 1360, px: q * 30, walkers: c2 => caravan36(c2, t, 80 + q * 70, [[0, 0], ['C', -150], [1, -300], ['C', -450]], { dir: 1, x0: 380, h: 300, night: 1, lantern: 0 }) })],
        [tJo - 0.2, (cc, q) => route36(cc, t, { z: lerp(1.25, 1.3, ease(seg(q, 0, d - tJo))), cy: 1360, px: 30 + q * 30, walkers: c2 => caravan36(c2, t, 160 + q * 70, [[2, 0], ['C', -150], [5, -300], ['C', -450], [6, -590]], { dir: 1, x0: 360, h: 300 }) })],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tVi - 0.4, 0.25)); quote2(c, 'LES TERRES BÉNIES', 'DU CHAM', a1, 260, 80, 100 * ramp(t, tCh - 0.5, 0.3) + 0.01); caption(c, 'Saba, verset 18', 470, a1, 30);
      const a2 = ramp(t, tVi - 0.2, 0.25) * (1 - ramp(t, tVo - 0.4, 0.25)); quote2(c, 'DES VILLAGES BIEN VISIBLES', 'À DISTANCE MESURÉE', a2, 260, 60, 76 * ramp(t, tDi - 0.6, 0.3) + 0.01);
      const a3 = ramp(t, tVo - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'DE NUIT COMME DE JOUR,', 'EN SÉCURITÉ', a3 * ramp(t, tNu - 0.4, 0.3), 260, 68, 100 * ramp(t, tSe - 0.6, 0.3) + 0.01);
    },
  },
  // 7. but they turned away and forgot the One who gave them everything; they even said « our Lord, lengthen the distance between our journeys »; they wronged themselves (Saba 16, 19)
  ingrat: {
    grade: 'rgba(230,200,180,0.06)',
    draw(c, t, d) {
      const tDe = at('ingrat', 'detournerent', 0, 0.8), tOu = at('ingrat', 'oublierent', 0, 2.2), tTo = at('ingrat', 'tout', 0, 4.0), tDi = at('ingrat', 'dirent', 0, 5.0), tSe = at('ingrat', 'seigneur', 0, 6.0), tAl = at('ingrat', 'allonge', 0, 6.8), tEt = at('ingrat', 'etapes', 0, 8.8), tTr = at('ingrat', 'tort', 0, 10.6);
      shots(c, t, [
        [0, (cc, q) => terrace36(cc, t, { z: lerp(1.1, 1.16, ease(seg(q, 0, tDi))), cy: 1350, light: 0.3 * (1 - ramp(q, tDe - 0.2, 1.2)), lightX: 540, lightW: 380, dim: 0.5 * ramp(q, tOu - 0.3, 1.0), walkers: feast36(t, { away: q > tDe + 0.2 }) })],
        [tDi - 0.2, (cc, q) => terrace36(cc, t, { z: lerp(1.5, 1.56, ease(seg(q, 0, tAl - tDi + 0.6))), cx: 560, cy: 1400, dim: 0.35, walkers: feast36(t, { stand: lerp(0.3, 0.75, ease(seg(q, 0.3, 1.0))) }) })],
        [tAl + 0.4, (cc, q) => map36(cc, t, { z: lerp(1.0, 1.04, ease(seg(q, 0, tTr - tAl))), cy: 1130, towns: 1, gaps: ease(seg(q, 0.4, tEt - tAl + 0.4)) })],
        [tTr - 0.4, (cc, q) => marib36(cc, t, NX36(GOLD36, { sky: 'gold', to: 'grey', k: ease(seg(q, 0, 2)), sunA: 0.5 * (1 - ramp(q, 0, 1.5)), storm: 0.7 * ease(seg(q, 0, 2.2)), z: lerp(1.15, 1.2, ease(seg(q, 0, d - tTr))), cy: 1180 }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tDi - 0.4, 0.25)); quote2(c, 'ILS SE DÉTOURNÈRENT', '', a1, 270, 82); bigWord27(c, 'ET OUBLIÈRENT CELUI', 380, a1 * ramp(t, tOu - 0.4, 0.3), 64); bigWord27(c, 'QUI LEUR DONNAIT TOUT', 460, a1 * ramp(t, tTo - 0.9, 0.3), 64, '#f6c453');
      const a2 = ramp(t, tDi - 0.2, 0.25) * (1 - ramp(t, tTr - 0.5, 0.25)); topShade(c, a2 * 1.3); arabic(c, 'ربنا باعد بين أسفارنا', 230, a2, 92); bigWord27(c, '« SEIGNEUR, ALLONGE LES DISTANCES', 345, a2 * ramp(t, tAl - 0.6, 0.3), 46); bigWord27(c, 'ENTRE NOS ÉTAPES »', 425, a2 * ramp(t, tEt - 0.8, 0.3), 70, '#f6c453'); caption(c, 'Saba, verset 19', 490, a2, 28);
      const a3 = ramp(t, tTr - 0.4, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'ILS SE FIRENT DU TORT', 'À EUX-MÊMES', a3, 260, 70, 100);
    },
  },
  // 8. the flood of the dam (sayl al-'arim, Saba 16); according to some reports rats had gnawed its foot; the water carried away the trees, the fields… everything
  flood: {
    grade: 'rgba(190,190,200,0.06)',
    draw(c, t, d) {
      const tEn = at('flood', 'envoya', 0, 1.0), tTo = at('flood', 'torrent', 0, 2.6), tDi = at('flood', 'digue', 0, 3.4), tRe = at('flood', 'recits', 0, 4.8), tRa = at('flood', 'rats', 0, 5.6), tRo = at('flood', 'ronge', 0, 6.6), tBa = at('flood', 'base', 0, 7.2), tEa = at('flood', 'eau', 0, 8.4), tEm = at('flood', 'emporta', 0, 8.8), tAr = at('flood', 'arbres', 0, 9.6), tCh = at('flood', 'champs', 0, 10.4), tTt = at('flood', 'tout', 0, 11.6);
      shots(c, t, [
        [0, (cc, q) => marib36(cc, t, NX36(STORM36, { z: lerp(1.2, 1.28, ease(seg(q, 0, tRe))), cy: lerp(1120, 1140, ease(seg(q, 0, tRe))), lightning: 0.9 * Math.max(seg(q, tTo - 0.2, tTo) * (1 - seg(q, tTo, tTo + 0.35)), seg(q, 0.2, 0.3) * (1 - seg(q, 0.3, 0.6))), lgX: 760, flash: 0 }))],
        [tRe - 0.2, (cc, q) => damClose36(cc, t, { z: lerp(1.15, 1.25, ease(seg(q, 0, tEa - tRe))), cy: lerp(1300, 1380, ease(seg(q, 0, tEa - tRe))), leak: ease(seg(q, tRo - tRe - 0.2, tEa - tRe)), crack: ease(seg(q, tBa - tRe - 0.3, tEa - tRe + 0.2)), shake: 0.04 * ramp(q, tBa - tRe, 0.5) })],
        [tEa - 0.4, (cc, q) => marib36(cc, t, NX36(STORM36, { z: lerp(2.3, 2.1, ease(seg(q, 0, tAr - tEa + 0.4))), cx: 540, cy: 1140, crack: 1, breach: ease(seg(q, 0.05, 1.1)), flood: lerp(0, 0.08, ease(seg(q, 0.4, 1.4))), shake: 0.18 * (1 - ramp(q, 0.8, 1.2)) }))],
        [tAr - 0.3, (cc, q) => marib36(cc, t, NX36(STORM36, { z: lerp(1.12, 1.08, ease(seg(q, 0, d - tAr))), cy: 1180, breach: 1, flood: lerp(0.15, 1.0, ease(seg(q, 0, tTt - tAr + 0.6))), shake: 0.06 * (1 - ramp(q, tTt - tAr + 0.3, 1.0)), tint: `rgba(10,10,18,${0.35 * ramp(q, tTt - tAr, 0.8)})` }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, tEn - 0.3, 0.25) * (1 - ramp(t, tRe - 0.4, 0.25)); topShade(c, a1 * 1.3); arabic(c, 'سيل العرم', 240, a1 * ramp(t, tTo - 0.4, 0.3), 120); bigWord27(c, 'LE TORRENT DE LA DIGUE', 380, a1 * ramp(t, tTo - 0.4, 0.3), 72, '#f6c453'); caption(c, 'Saba, verset 16', 450, a1, 30);
      const a2 = ramp(t, tRe - 0.2, 0.25) * (1 - ramp(t, tEa - 0.5, 0.25)); quote2(c, 'SELON CERTAINS RÉCITS,', 'DES RATS EN RONGEAIENT LA BASE', a2, 260, 66, 54 * ramp(t, tRa - 0.5, 0.3) + 0.01); caption(c, 'Wahb ibn Munabbih, cité par Ibn Kathir', 470, a2, 30);
      const a3 = ramp(t, tEm - 0.3, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'L\'EAU EMPORTA LES ARBRES,', 'LES CHAMPS…', a3, 260, 62, 84 * ramp(t, tCh - 0.5, 0.3) + 0.01);
      bigWord27(c, 'TOUT', 480, a3 * ramp(t, tTt - 0.3, 0.3), 130, '#f6c453');
    },
  },
  // 9. in place of the two gardens: bitter fruit, tamarisks and a few lote trees (Saba 16); the people scattered across Arabia; the Aws and Khazraj of Medina came from there (historians)
  after: {
    grade: 'rgba(230,200,170,0.07)',
    draw(c, t, d) {
      const tPl = at('after', 'place', 0, 0.6), tJa = at('after', 'jardins', 0, 1.6), tCo = at('after', 'coran', 0, 2.4), tAm = at('after', 'amers', 0, 3.8), tTa = at('after', 'tamaris', 0, 4.6), tJu = at('after', 'jujubiers', 0, 6.0), tPe = at('after', 'peuple', 0, 7.4), tDs = at('after', 'dispersa', 0, 8.2), tAr = at('after', 'arabie', 0, 9.4), tHi = at('after', 'historiens', 0, 10.6), tAw = at('after', 'aws', 0, 11.6), tKh = at('after', 'khazraj', 0, 12.4), tMd = at('after', 'medine', 0, 13.2);
      shots(c, t, [
        [0, (cc, q) => marib36(cc, t, NX36(AFTER36, { z: lerp(1.08, 1.12, ease(seg(q, 0, tCo))), cy: 1160 }))],
        [tCo - 0.2, (cc, q) => marib36(cc, t, NX36(AFTER36, { z: lerp(1.0, 1.04, ease(seg(q, 0, tPe - tCo))), cy: 1330, maxY: 1420, post: plants36(t, [ramp(q, tAm - tCo - 0.3, 0.4), ramp(q, tTa - tCo - 0.3, 0.4), ramp(q, tJu - tCo - 0.3, 0.4)]) }))],
        [tPe - 0.2, (cc, q) => marib36(cc, t, NX36(AFTER36, { z: lerp(1.3, 1.34, ease(seg(q, 0, tAr - tPe))), cy: 1330, walkers: leaving36(t, 40 + q * 60) }))],
        [tAr - 0.2, (cc, q) => map36(cc, t, { z: lerp(1.0, 1.04, ease(seg(q, 0, tAw - tAr))), cy: 1130, disperse: ease(seg(q, 0, tAw - tAr)) })],
        [tAw - 0.3, (cc, q) => map36(cc, t, { z: lerp(1.04, 1.5, ease(seg(q, 0, 1.4))), cx: lerp(540, 560, ease(seg(q, 0, 1.4))), cy: lerp(1130, 1080, ease(seg(q, 0, 1.4))), disperse: 1, medina: ramp(q, tMd - tAw - 0.6, 0.5) })],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tCo - 0.4, 0.25)); quote2(c, 'À LA PLACE', 'DES DEUX JARDINS…', a1, 260, 88, 88 * ramp(t, tJa - 0.6, 0.3) + 0.01);
      const a2 = ramp(t, tCo - 0.2, 0.25) * (1 - ramp(t, tPe - 0.4, 0.25)); topShade(c, a2 * 1.3); arabic(c, 'أكل خمط وأثل وشيء من سدر قليل', 230, a2, 64); caption(c, 'Saba, verset 16', 300, a2, 28);
      [['FRUITS AMERS', 240, 1180, tAm], ['TAMARIS', 560, 800, tTa], ['JUJUBIERS', 860, 1020, tJu]].forEach(([w, x, y, tw]) => { const a = a2 * ramp(t, tw - 0.3, 0.3); if (a > 0) textGlow(c, w, x, y, '700 48px Lora', '#f6c453', a, '#000', 16); });
      const a3 = ramp(t, tPe - 0.2, 0.25) * (1 - ramp(t, tHi - 0.4, 0.25)); quote2(c, 'LE PEUPLE SE DISPERSA', 'DANS TOUTE L\'ARABIE', a3, 260, 70, 76 * ramp(t, tAr - 0.6, 0.3) + 0.01);
      const a4 = ramp(t, tHi - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); quote2(c, 'LES AWS ET LES KHAZRAJ', 'DE MÉDINE VENAIENT DE LÀ', a4 * ramp(t, tAw - 0.5, 0.3), 260, 66, 60 * ramp(t, tMd - 0.6, 0.3) + 0.01); caption(c, 'selon les historiens', 470, a4, 32);
    },
  },
  // 10. the promise kept: « We made them tales » (Saba 19); the Arabs still say « they scattered like Saba » (tafarraqū aydī Saba')
  proverb: {
    grade: 'rgba(255,190,150,0.07)',
    draw(c, t, d) {
      const tDt = at('proverb', 'dit', 0, 0.6), tRe = at('proverb', 'recits', 0, 2.2), tAu = at('proverb', "aujourd'hui", 0, 3.4), tEp = at('proverb', 'eparpilles', 0, 6.4), tAr = at('proverb', 'arabes', 0, 7.6), tDs = at('proverb', 'disperses', 0, 9.4), tSa = at('proverb', 'saba', 0, 10.4);
      shots(c, t, [
        [0, (cc, q) => campfire36(cc, t, { z: lerp(1.35, 1.42, ease(seg(q, 0, tAu))), cy: 1460 })],
        [tAu - 0.2, (cc, q) => route36(cc, t, { sky: 'gold', z: lerp(1.2, 1.25, ease(seg(q, 0, tAr - tAu))), cy: 1360, walkers: c2 => { caravan36(c2, t, 40 + q * 60, [[0, 0], ['C', -150], [1, -290]], { dir: -1, x0: 540, h: 300 }); caravan36(c2, t, 40 + q * 60, [[3, 0], ['C', -150]], { dir: 1, x0: 640, h: 320, gy: () => rY36 + 60 }); } })],
        [tAr - 0.2, (cc, q) => marib36(cc, t, NX36(RUINS36, { z: lerp(1.25, 1.3, ease(seg(q, 0, d - tAr))), cy: 1180 }))],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tAu - 0.4, 0.25)); topShade(c, a1 * 1.3); arabic(c, 'فجعلناهم أحاديث', 240, a1, 104); bigWord27(c, '« NOUS EN FÎMES', 370, a1 * ramp(t, tDt, 0.3), 76); bigWord27(c, 'DES RÉCITS »', 460, a1 * ramp(t, tRe - 0.5, 0.3), 88, '#f6c453');
      const a2 = ramp(t, tAu - 0.2, 0.25) * (1 - ramp(t, tAr - 0.4, 0.25)); quote2(c, 'AUJOURD\'HUI ENCORE…', '', a2, 270, 84);
      const a3 = ramp(t, tAr - 0.2, 0.25) * (1 - seg(t, d - 0.4, d)); topShade(c, a3 * 1.6); arabic(c, 'تفرقوا أيدي سبأ', 250, a3 * ramp(t, tDs - 0.6, 0.4), 120); bigWord27(c, '« ILS SE SONT DISPERSÉS', 390, a3 * ramp(t, tDs - 0.5, 0.3), 70); bigWord27(c, 'COMME SABA »', 485, a3 * ramp(t, tSa - 0.5, 0.3), 100, '#f6c453'); caption(c, 'proverbe arabe', 550, a3 * ramp(t, tDs - 0.3, 0.3), 30);
    },
  },
  // 11. the lesson: « in this are signs for every patient, grateful one » (Saba 19); what keeps a blessing is not a dam: it is gratitude
  lesson: {
    grade: 'rgba(255,215,170,0.08)',
    draw(c, t, d) {
      const tCo = at('lesson', 'conclut', 0, 1.0), tSi = at('lesson', 'signes', 0, 2.6), tPa = at('lesson', 'patient', 0, 4.4), tRe = at('lesson', 'reconnaissant', 0, 5.4), tGa = at('lesson', 'garde', 0, 7.0), tBi = at('lesson', 'bienfait', 0, 7.8), tDi = at('lesson', 'digue', 0, 9.4), tMe = at('lesson', 'merci', 0, 10.8);
      shots(c, t, [
        [0, (cc, q) => marib36(cc, t, NX36(RUINS36, DAWN36, { after: 1, ruins: 1, town: false, z: lerp(1.08, 1.13, ease(seg(q, 0, tGa))), cy: 1170, light: 0.2 * ramp(q, tSi - 0.4, 1), lightX: 820, lightW: 400 }))],
        [tGa - 0.2, (cc, q) => marib36(cc, t, NX36(RUINS36, DAWN36, { after: 1, ruins: 1, town: false, z: lerp(2.2, 2.3, ease(seg(q, 0, tMe - tGa))), cx: 360, cy: 1110 }))],
        [tMe - 0.9, (cc, q) => orchard36(cc, t, { dawn: 1, z: lerp(1.3, 1.25, ease(seg(q, 0, d - tMe + 0.9))), cy: 1460, walkY: 1690, light: 0.35, lightX: 540, lightW: 260,
          walkers: c2 => { rug(c2, 540, 1790, 380, 70, '#2a4a3a'); fig(c2, SABA36[0], { x: 490, y: 1780, h: oH36(1780) * 1.1, pose: 'prostrate', dir: 1, t, light: 1.1, wind: 0.1, ink: 0.7 }); } })],
      ]);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const a1 = ramp(t, 0.1, 0.25) * (1 - ramp(t, tGa - 0.4, 0.25)); topShade(c, a1 * 1.3); arabic(c, 'إن في ذلك لآيات لكل صبار شكور', 230, a1, 60);
      bigWord27(c, 'DES SIGNES POUR TOUT HOMME', 340, a1 * ramp(t, tSi - 0.4, 0.3), 56); bigWord27(c, 'PATIENT ET RECONNAISSANT', 430, a1 * ramp(t, tPa - 0.4, 0.3), 64, '#f6c453'); caption(c, 'Saba, verset 19', 495, a1, 28);
      const a2 = ramp(t, tGa - 0.2, 0.25) * (1 - ramp(t, tMe - 1.2, 0.25)); quote2(c, 'CE QUI GARDE UN BIENFAIT,', 'CE N\'EST PAS UNE DIGUE', a2, 260, 62, 70 * ramp(t, tDi - 0.6, 0.3) + 0.01);
      const a3 = ramp(t, tMe - 0.9, 0.25) * (1 - seg(t, d - 0.4, d)); topShade(c, a3 * 1.4); bigWord27(c, 'C\'EST', 300, a3, 90); bigWord27(c, 'LE MERCI', 430, a3 * ramp(t, tMe - 0.4, 0.3), 140, '#f6c453');
    },
  },
  cta: {
    grade: 'rgba(200,190,170,0.06)',
    draw(c, t, d) {
      hero36(c, 60 + t, { z: lerp(1.37, 1.34, seg(t, 0, d)), cy: lerp(1225, 1232, seg(t, 0, d)) });
      c.fillStyle = 'rgba(6,8,18,0.3)'; c.fillRect(0, 0, W, H);
      ctaText36(c, seg(t, 0.1, 0.6));
    },
  },
  // the last frame dissolves into the first (hook)
  outro: {
    grade: 'rgba(200,190,170,0.06)',
    draw(c, t, d) {
      const back = seg(t, d - 0.8, d);
      if (back <= 0) { const cd = ((window.TL.scenes || []).find(s => s.id === 'cta') || { dur: 6 }).dur; hero36(c, 60 + cd + t, { z: lerp(1.34, 1.32, seg(t, 0, d - 0.8)), cy: lerp(1232, 1235, seg(t, 0, d - 0.8)) }); }
      else hero36(c, 0, {});
      const k = 1 - seg(t, d - 2.0, d - 1.2);
      c.fillStyle = `rgba(6,8,18,${0.3 * k})`; c.fillRect(0, 0, W, H);
      ctaText36(c, k);
      flashW(c, 0.3 * Math.sin(Math.PI * clamp((t - (d - 1.6)) / 1.6)));
      const a = seg(t, d - 0.8, d - 0.1); if (a > 0) { c.save(); c.globalAlpha = a; hookTexts36(c, 1); c.restore(); }
    },
  },
  cover: {
    draw(c) {
      hero36(c, 0.4, { z: 1.7, cx: 540, cy: 1190, breach: 0.75, flood: 0.35 });
      const g = c.createLinearGradient(0, 0, 0, 820); g.addColorStop(0, 'rgba(6,8,18,0.88)'); g.addColorStop(1, 'rgba(6,8,18,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 820);
      seriesTag36(c, 1);
      textS(c, 'ILS AVAIENT TOUT', 250, 1, '700 100px Lora', 100, '#fff6e0', 24);
      textGlow(c, 'SAUF LE MERCI', W / 2, 372, '700 104px Lora', '#f6c453', 1, '#000', 24);
      textGlow(c, 'et la digue a cédé', W / 2, 475, 'italic 500 56px Lora', '#fff3dc', 1, '#000', 20);
      const g2 = c.createLinearGradient(0, 1420, 0, H); g2.addColorStop(0, 'rgba(6,8,18,0)'); g2.addColorStop(1, 'rgba(6,8,18,0.85)'); c.fillStyle = g2; c.fillRect(0, 1420, W, 500);
      arabic(c, 'سيل العرم', 1650, 1, 120);
      textGlow(c, 'La digue de Saba', W / 2, 1790, 'italic 500 54px Lora', '#fff3dc', 1, '#000', 14);
    },
  },
};
