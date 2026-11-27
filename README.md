# histoire-islam
Histoire sur les prophetes de l'islam

## Série « Les Prophètes » — motion design

Chaque épisode vit dans `episodes/<nn-nom>/` :
- `script.json` : texte de la voix off, découpé par scène (+ `voice_id` ElevenLabs)
- `scenes.js` : les illustrations animées de chaque scène

Générer un épisode (voix ElevenLabs → timeline/sous-titres → ambiance → rendu 1080x1920 → mixage) :

```bash
ELEVENLABS_API_KEY=... bash tools/make.sh episodes/01-yusuf   # FORCE_TTS=1 pour régénérer la voix
```

Règles visuelles : prophète = silhouette en blanc, visage entièrement caché par un voile de lumière blanche
(`prophet: true`, comme les épisodes 1 et 4) ; tous les autres personnages sans visage.
Niveau de détail (engine.js) : `figure()` dessine des personnages détaillés (thobe + manteau ouvert à galon, ceinture,
plis, manches, mains, sandales, keffieh, ombre au sol, respiration, vent `wind`, marche `walk`, poses stand/sit/kneel/
prostrate/lie, gestes `armUp`/`reach`/`dua`, `lantern`, `staff`) ; `camel()` une chamelle articulée.
Décors : couches en parallaxe, brume de profondeur, premier plan flou (`ctx.filter = blur`), roches stratifiées,
façades nabatéennes (voir `episodes/04-salih/scenes.js` : `rock`, `tomb`, `acacia`, `wisps`, `milkyWay`…).
Synchro image/voix : `at(scène, 'mot')` donne l'instant où le mot est prononcé (timeline.json → `scenes[].words`),
pour déclencher gestes et effets pile sur la narration. Pas de grain animé (il faisait « grésiller » l'image).
Audio : voix + ambiance naturelle (vent, eau, feu, grillons), aucune musique. Mixage à gain fixe (-15 LUFS + limiteur) :
pas de normalisation dynamique, qui remontait le souffle de l'ambiance pendant les pauses.

Voix hors ligne (si ElevenLabs est inaccessible) : `tools/tts_local.py` génère la voix avec Kokoro v1.0
(voix `local_voice`, vitesse `local_speed` dans script.json) et les mêmes fichiers d'alignement ;
`make.sh` l'utilise automatiquement en secours. Modèles à placer dans `~/tts` (voir l'en-tête du script).

Voix enregistrée / générée ailleurs (un seul fichier, script lu dans l'ordre) :
**Voix fournie (recommandé)** : `python3 tools/align_ctc.py episodes/<ep> episodes/<ep>/voix_off.mp3` reconnaît la voix
(modèle CTC NeMo multilingue, ONNX, voir l'en-tête du script), cale chaque mot du script sur la voix, accroche chaque
pause à la ponctuation, découpe une piste par scène et affiche les mots prononcés différemment. Puis `"voice": "user"`
dans script.json et `make.sh`.
Ancienne méthode : `python3 tools/align_voice.py episodes/<ep> voix.mp3 <dossier_audio_de_référence>` aligne la voix mot à mot
(DTW contre une voix de synthèse du même texte + calage sur les vraies pauses), la découpe par scène et écrit
`audio/NN_id.mp3/.json`. Mettre `"voice": "user"` dans script.json, puis lancer `make.sh`.

## Épisode de référence : `episodes/06-hud/` (validé par Ange le 12/11/2026)
Tout nouvel épisode prend 06-hud comme modèle : niveau de détail des décors et des personnages, mise en scène,
synchro au mot, mixage et ambiance. Lire son `scenes.js`, son `script.json` et son `SCRIPT_VOIX_OFF.md` avant d'écrire.

## Règles d'Ange (12/11/2026) — à respecter pour chaque nouvel épisode
- **Pas de voix off générée** (ni ElevenLabs, ni Piper/Kokoro) : `"voice": "user"` sans audio, le minutage des mots est estimé
  (sous-titres et `at()` restent calés) et la vidéo sort avec l'ambiance seule. Ange envoie ensuite SA voix, calée avec
  `tools/align_ctc.py` (modèle ASR dans `~/asr`), puis `make.sh` : images, gestes et sous-titres se recalent sur elle.
- **Aucun grésillement** : ambiance = vent grave (`wind`, ≤ 0,4 hors tempête) + tonnerre lointain éventuel, `ambience_gain` ~0,6.
  Pas de `rain`, `fire`, `crickets`, `hammer`, `room` (textures de bruit qui grésillent). Sans voix, make.sh garde l'ambiance à -30 LUFS.
- **Personnages plus dessinés** : figure() pose un contour encré et met les visages dans l'ombre du keffieh (rien ne se lit).
- **Zéro erreur de montage** : rien ne flotte (pieds et bases de bâtiments sur la ligne de sol calculée, `ridgeY`, ou une bande de sol
  dessinée par-dessus la base), cycle de pas piloté par la distance parcourue (`stepOf(dist, h)`, `camelT(dist, s)` dans
  `episodes/06-hud/scenes.js`), pas de modulo qui fait sauter un personnage à l'écran, pas d'apparition en fondu au milieu
  d'une scène (on entre par le bord), demi-tours progressifs (`turnDir`), travailleurs/objets posés sur ce qui les porte.

## Règles d'Ange (14/11/2026) — qualité, rythme, longueur : PRIORITAIRES sur tout le reste
- **Prendre son temps, raconter clairement** : les épisodes 9-10 faisaient « rushés ». L'histoire est racontée dans l'ordre, avec les
  liaisons (qui, où, pourquoi, ce qui se passe ensuite), une idée par phrase, sans sauter d'étape. Plus de détails vrais et sourcés
  (Coran d'abord, puis tafsir reconnus, signalés comme tels), moins de formules choc enchaînées.
- **Longueur du script : 1 800 à 2 000 caractères MAXIMUM** (espaces compris) pour tout le texte de la voix off — c'est la limite du
  générateur de voix d'Ange (copier-coller). Toujours compter (`len()` du texte intégral) et l'indiquer dans SCRIPT_VOIX_OFF.md.
- **Respiration** : `"tail": 0.9` dans script.json (silence après chaque scène, au lieu de 0,45 s), et `"hold": 1.5`-`2.5` sur les scènes
  fortes (pic émotionnel, miracle, leçon) pour laisser l'image vivre. Viser ~2 min 15 - 2 min 40 de vidéo avec la voix d'Ange.
- **Zéro défaut d'image** (vérifier chaque scène sur une planche d'images AVANT le rendu, puis sur la vidéo finale) :
  personne ne vole, les pieds touchent toujours le sol (y = ligne de sol calculée : `ridgeY`, bord du rocher, plancher), pas de pied qui
  décolle pendant une marche (cycle `stepOf(distance, h)`), pas de glissement ; pas de figure posée sur une pente sans que la pente soit
  sous ses pieds ; décors qui s'emboîtent (aucun trou, aucune bande vide entre deux couches, aucun bord de dessin visible quand la caméra
  bouge ou zoome : dessiner les couches plus larges que le cadre) ; rien de coupé bizarrement par le cadre ; objets posés sur ce qui les
  porte ; aucune forme ratée (si un dessin ne se lit pas du premier coup, on le refait ou on le retire) ; pas de chute ou de rotation
  qui fait traverser le sol.

## Viralité (demande d'Ange du 12/11/2026) — outils ajoutés avec l'épisode 7 (`episodes/07-musa/`)
- **Accroche immédiate** : `"lead_first": 0.3` dans script.json (la 1re phrase tombe dès 0,3 s) et `window.NO_INTRO_FADE = true`
  dans scenes.js (pas de fondu au noir : la 1re image est là dès la 1re frame). Titre de série + « Épisode N » petits dès la 1re seconde.
- **Mots-clés plus gros** dans les sous-titres : `"keywords": [...]` dans script.json (dorés, plus grands, petit « pop » à l'énonciation).
- **Boucle** : la scène `cta` + `outro` reprennent l'image de l'accroche (`heroShot(c, T)` avec un temps continu) : la dernière image = la première.
  `"outro": 3.0` règle la durée de l'écran final.
- **Couverture TikTok** : `SCENES.cover` dans scenes.js, puis `node tools/cover.js episodes/<ep>` → `cover.png` (1080x1920).
- `figure({..., veilGlow: 0.3})` atténue le halo du voile de lumière sur les très grands plans (évite l'éblouissement).
- `"est_cps": 15.5` : minutage estimé au rythme réel de la voix d'Ange (Hud : ~15-16 caractères/s).
- **Fond musical halal** (demande d'Ange du 13/11/2026) : `tools/music_voices.py` synthétise un chœur fredonné (« mmm/ouh »),
  **voix uniquement, sans instrument ni percussion**, accords lents en ré mineur. Intensité par scène : `"music_level"` ; activé par
  `"music": {"file": "music.wav", "gain": 0.5}` dans script.json. make.sh le génère et le mixe sous la voix avec ducking (sidechain).

## Épisode 8 (`episodes/08-sulayman/`) — nouveaux éléments réutilisables
- `ant()` (fourmi détaillée, marche tripode, se dresse avec `rear`), `antHill()`, `soundRings()`, `hoopoe()` (huppe perchée / en vol, crête `crest`),
  `perchBird()` + `BIRDS` (espèces variées), `throne()`, `scroll()` (lettre scellée qui se déroule, Basmala), `hall()` (salle du trône),
  `city()` / `cedar()` / `towerHouse()` (maisons-tours du Yémen), `crystalFloor()` + `reflect()` (sol de cristal sur l'eau), `blink()` (clin d'œil plein écran),
  `blurLayer()` (flou de profondeur appliqué à toute une couche, mise au point qui bascule), `topShade()` (lisibilité des légendes arabes).
- Les djinns sont nommés dans le texte mais jamais dessinés.

## Épisode 9 (`episodes/09-dawud/`) — nouveaux éléments réutilisables
- `giant()` (Jalout : guerrier géant en armure à écailles, casque à cimier, bouclier rond, lance ; la tête reste dans l'ombre du casque ; `fall` 0→1 le fait tomber en arrière autour de ses pieds),
  `slingFx()` (fronde qui tournoie, `spin`, `tilt`, ou pend après le tir avec `released`), `stoneFx()` (pierre en vol + traînée), `impact()`,
  `crown()` (couronne de Talout), `sheep()`, `plain()` (plaine d'herbes sèches), `echoRidge()` + `lightRings()` (montagnes qui « répondent » : impulsions de lumière
  le long des crêtes), `circleBirds()`, `anvil()`, `mail()` (cotte de mailles qui se forme anneau par anneau), `reeds()`, `lightning()`, `enemyRanks()` / `hostRanks()`.
- La chute de Jalout est montrée sans violence : une pierre, un éclair de lumière, une chute dans la poussière. Fronde et pierre sont annoncées « selon les exégètes ».

## Épisode 10 (`episodes/10-ayyub/`) — nouveaux éléments réutilisables
- `tree()` (arbre à branches récursives : `leaf` 0 = mort et nu, 1 = en feuilles, `bloom`, `lastLeaves`), `house()` (maison en briques crues, poutres, porte, fenêtre éclairée `lamp`, `ruin` effondre un angle),
  `fence()` (enclos, `broken`), `dryGround()` (terre craquelée, `glow` + `wet` : lumière / eau qui monte par les fissures), `spring()` (source qui jaillit : jet, gouttes, bassin, rides),
  `oilLamp()` (lampe à huile qui s'éteint avec fumée), `bowl()`, `wheatD()` / `field()` (blé qui sèche en continu), `valley()` (vallée verte → sèche, `dry` 0→1), `herd()`, `camels()`,
  `shelter()` (abri de toile), `oven()` (four à pain), `stomp()` (gros plan : pied en sandale + ourlet blanc qui frappe le sol), `moonArc()` (les années qui passent), `ridgeW()` / `hazeW()` (couches lointaines très larges pour les grands panoramiques).
- Piège corrigé : les fondus enchaînés dessinent une scène à t légèrement négatif → `(t * k) % 1` devient négatif (rayon d'ellipse négatif = crash du rendu). Les fonctions à phase (`spring`, `lightRings`, `sparkle`, `oilLamp`) décalent `t += 100`.

## Épisode 13 (`episodes/13-issa/`) — nouveaux éléments réutilisables
- `issaHero()` (place du village au crépuscule : foule disposée en arc `CROWD`, berceau, Maryam ; `speak`, `recoil`, `accuse`, `point`, `hush`), `village()` (collines, maisons en terrasse, oliviers, dallage),
  `babyLight()` (lumière du bébé qui parle : halo, rayons, anneaux), `brook()` (ruisseau qui arrive par la gauche, `k` 0→1), `fallingDates()` (dattes qui tombent avec gravité et rebond),
  `hangingCurtain()` (le voile tendu entre deux poteaux, Maryam 17), `bier()` (brancard et linceul, lumière), `flowLine()` / `healGlow()` (guérisons), `eastPlace()`, `heavens()`, `oliveGrove()`, `palmGround()`.
- `datePalm()` porte désormais de vrais régimes de petites dattes (plus de « boules orange »). `village()` passe `t + 100` aux maisons : `smoke()` plantait à t négatif (fondus, outro).
- L'ange Jibril n'est jamais dessiné : une colonne de lumière et la mention « l'ange n'est jamais représenté ».

## Épisode 16 (`episodes/16-yaqub/`) — nouveaux éléments réutilisables
- `qamis()` (la chemise de Yusuf : tunique à manches, plis, encolure brodée ; `stain` = faux sang sobre, `glow` = chemise de la bonne nouvelle, `flut` = flotte au vent),
  `blindFx(c, k)` (la cécité montrée par l'image elle-même : flou, désaturation, voile blanc — jamais sur un visage), `whiteOut()`, `scentRibbon()` (l'odeur portée par le vent :
  rubans de lumière chaude le long d'un chemin), `wolfSil()` (loup en silhouette lointaine), `dreamBodies()` (onze étoiles, soleil et lune qui s'inclinent),
  `canaanLand()` (collines de Canaan : chaînes lointaines, terrasses d'oliviers, pâturage ; `night`, `dry`), `camp()` (maison, tente, enclos, moutons), `egyptHall()`, `egyptRoad()`, `desertWide()`.
- Boucle : l'outro blanchit l'image puis repart sur la première image (pâle) de l'accroche.

## Épisode 17 (`episodes/17-lut/`) — nouveaux éléments réutilisables
- `valleyLand()` (vallée de la mer Morte : plateau de Moab, mer turquoise laiteuse, croûtes de sel, champs et palmeraies ; `night`, `ash` = lieux désolés aujourd'hui, `mid` pour poser une cité),
  `sodomCity()` (cité sur un tell : maisons étagées, tour, rempart crénelé à tours et porte ; `lamp`, `only` = une seule maison éclairée, `gateLit`), `earthSlab()` + `overturn()` (la cité arrachée avec
  sa motte de terre, soulevée, retournée puis engloutie : « Nous la renversâmes de fond en comble »), `stoneRain()` (pierres d'argile incandescentes), `bigDust()`, `cracks()`, `emberGlow()`.
- `streetSet()` / `lutHouse()` (rue de nuit en perspective, porte qui s'ouvre sur la lumière `open`, lumière qui filtre `leak`), `drawMob()` (foule aux torches qui descend la rue, pas pilotés
  par la distance, `recoil` = aveuglée qui recule en se protégeant), `heldTorch()`, `guests()` (les anges jamais dessinés : trois colonnes de lumière), `roofTop()`, `squareSet()`.

## Épisode 18 (`episodes/18-yahya/`) — nouveaux éléments réutilisables
- `yahHero()` (cour du Temple de Jérusalem remplie : foule assise en rangs en perspective `SEATED` avec allée centrale, rangs proches floutés, gens assis sur le haut du mur `wallCrowd()`,
  Yahya sur les marches dans la lumière de la porte), `streamIn()` (la foule qui entre par les deux bords, pas pilotés par la distance), `fiveDots()` (compteur des cinq paroles, 1 à 5),
  `village18()` (= `village()` + ciel et soleil : `village()` seul ne dessine pas de ciel → bande noire en haut), `rehal()` (lutrin en X avec livre ouvert), `muskPouch()` (bourse de musc + `scentRibbon()`),
  `rope()` / `ropeCoil()` / `farHand()` (prisonnier mené à la corde, corde qui tombe), `fortress()` (forteresse : remparts en pierre de taille, deux tours, portes qui se ferment `close`), `runnerSet()` (plaine au couchant qui défile, `px` = distance).
- Le Prophète Muhammad ﷺ est seulement nommé (texte), jamais montré. La peur de Yahya (« que la terre m'engloutisse ») est une vision sombre (fissures, désaturation), pas un événement.
- Arabe en très gros corps : éviter l'alif suscrit (ٰ) et les voyelles dans les titres géants (Amiri les décroche) → `'يحيى'` sans voyelles.

## Épisode 20 (`episodes/20-ishaq/`) — nouveaux éléments réutilisables
- `ishHero()` (le campement d'Ibrahim au crépuscule : tente, Sara à l'entrée, plat du veau rôti, les trois hôtes en lumière, Ibrahim ; `gk` intensité des lumières, `rings`, `gold`
  = pluie de lumière de la miséricorde, `sUp`/`sReach`/`iReach` gestes), `campSet()` (plan large du campement : `land` = options de `canaanLand()`, `night`, `lamp`, `fire`, `leaf`/`bloom` de l'arbre),
  `ibrTent()` (tente en poil de chèvre `bedTent()` + tapis `rug()`, coussins `cushion()`, jarres `jar()`, feu), `feastTray()` (grand plateau de cuivre, riz, veau rôti, herbes, dattes, vapeur `steam`),
  `liveCalf()` (veau vivant, robe brune et blanche), `guestLight()` / `guests3()` (les anges jamais dessinés : colonnes de lumière douce, flaque de lumière au sol, poussières qui montent),
  `oldTree()` (l'arbre nu qui reverdit et fleurit), `plaque()` (cartouche doré d'un nom, pour une lignée).

## Épisode 21 (`episodes/21-ilyas/`) — nouveaux éléments réutilisables
- `lebanon()` (la chaîne du Liban enneigée au-dessus de la Beqaa : `snowRange()` = sommets avec neige dans les ravines et faces à l'ombre, crête de cèdres, champs en perspective
  `fieldsBeqaa()` ; `sky` parmi `SKY21` dusk/day/gold/dawn/night/storm, `storm`, `night`, `city` = fonction de dessin posée sur la crête, `px` parallaxe), `cityIdol()` (= `sodomCity()` + l'idole sur la tour, feu et fumée).
- `baal()` (l'idole : statue de bronze qui marche, masse levée, lance fourchue, haute couronne à cornes ; tête lisse sans aucun trait ; `fire` = lumière des braseros, `dim` = orage),
  `pedestal21()`, `brazier()` (trépied, flammes, fumée ; `k` 0 = braises), `portico()` / `courtBack()` (la cour du temple : colonnade, dallage, idole, braseros), `iHero()` (le plan héros : foule
  prosternée `PROS` + `crowdFig()` avec modes `bow` 0→1 (se courbent, s'agenouillent, se prosternent), `raise`, `turn`/`point` (se retournent et accusent), `leave` (s'en vont, pas pilotés par la distance)).
- `carving()` + `roughIdol()` + `malletPose()` + `chips()` (atelier : statue à moitié taillée, mains au ciseau et au maillet, coups calés sur des mots), `callRings()` (l'appel qui part et ne revient pas),
  `recite()` + `risingVerse()` (lutrin, Livre ouvert, lecteur assis ; le verset qui monte en lignes d'or), `nightCities()` / `skyline()` (le monde aujourd'hui la nuit : dômes, minarets, fenêtres), `spur()` / `spurY()` (éperon rocheux en hauteur).
- La fin du peuple d'Ilyas n'est pas détaillée par le Coran : rien n'est inventé à l'image (orage, braseros qui s'éteignent, lumière sur les croyants).

## Épisode 23 (`episodes/23-dhulkifl/`) — nouveaux éléments réutilisables
- `dkDoor()` (rue à midi : grand mur de pisé enduit, porte en planches `plankDoor()` avec clous et heurtoir, petite fenêtre haute, vigne, jarres, maisons qui fuient ; `open`, `shake`, `knockT`/`rings` = coups frappés, `old` = le vieillard, `extra` = figures posées devant la porte),
  `plankDoor()` (porte à planches dans un arc, `bar` = barre de bois en travers vue de l'intérieur, `barGlow`, `open` = le battant s'ouvre sur la lumière), `knocks()` / `knockK()` / `knockRings()` (coups calés sur des mots : pulsation du bras, ondes autour de la porte),
  `dkRoom()` + `dkRoomFg()` (la pièce : murs enduits, poutres et nattes de roseau, soubassement peint, niche à lampe, fenêtre haute avec rai de soleil et poussières `shaft`, porte barrée, natte, coussins ; `night`, `winShadow`), `twoShot()` (face-à-face dans la pièce, ombre qui grandit sur le mur),
  `oldMan()` (vieillard courbé au bâton, frappe avec `knock`), `castShadow()` (ombre portée d'une figure sur un mur : cisaillée, étirée, floutée), `ysHero()` (assemblée devant le lieu de prière : un homme assis dans la foule se lève dans la lumière, `rise`, `lit`, `dim`),
  `threeVows()` (trois médaillons : jeûner le jour, prier la nuit, jamais en colère ; `done` = cochés), `dayTag()` (JOUR 1/2/3), `courtSet()` + `awning()` (l'audience à la porte de la ville : estrade, tapis, auvent rayé, file de plaignants, `empty` = la place vide), `nightTown()` + `darkSmoke()` (rue de nuit où glisse une obscurité froide).
- Les démons ne sont jamais dessinés (obscurité seulement) ; Iblis n'apparaît que sous la forme du vieillard sans visage décrite par le récit (Mujahid, cité par Ibn Kathir), signalé à l'écran.

## Épisode 25 (`episodes/25-muhammad/`) — le Prophète Muhammad ﷺ, la première révélation
- **Le Prophète ﷺ n'est jamais représenté, même en silhouette** : point de vue (on est dans la grotte), lieux, lumière, objets (outre, provisions, natte, manteau, lampe) et calligraphie.
  L'ange Jibril = lumière seulement ; Khadija et Waraqa ne sont pas dessinés (leur maison, leur pièce). Dans Lora, le glyphe ﷺ ne s'affiche pas : l'écrire seulement en Amiri (`arabic()`), sinon « paix et bénédictions sur lui ».
- Nouveaux éléments : `hiraView()` (l'intérieur de la grotte de Hira, ouverture irrégulière sur la vallée de La Mecque la nuit, `light` = lumière de la révélation, `shake`, `spin` = étoiles qui tournent),
  `noorMount()` (Jabal an-Nour au-dessus de La Mecque : `cave`, `beam`, `path`, `spin`), `meccaSet()` (La Mecque vers 610 : Kaaba `kaaba()`, idoles `idol25()` avec `idols` = surbrillance, tawaf avec pas pilotés par la distance, marché, `night`, `door`, `dark`),
  `mantle()` (« couvrez-moi » : manteau rayé qui recouvre l'image), `fourVirtues()`, `scrollRoom()` (pièce aux rouleaux, livre ouvert, lampe), `desertNight()` (traces de chameaux vers le nord, `dawn`, `palms`),
  `hijraMap()` (carte La Mecque → Médine qui se trace), `bookLight()`, `qalamWrite()` (calame sans main qui écrit en or), `threeDots()`, `vignette25()` (étreinte), `beat()` (battement de cœur).

## Épisode 26 (`episodes/26-uzayr/`) — 'Uzayr, l'homme mort cent ans (Al-Baqara 259)
- Les 25 prophètes nommés dans le Coran ont tous un épisode (01 à 25) : l'épisode 26 traite de 'Uzayr, nommé dans At-Tawba 30, identifié par la plupart
  des exégètes à l'homme d'Al-Baqara 259 (sa qualité de prophète est discutée : signalé « pour beaucoup de savants »).
- Nouveaux éléments : `donkey()` (âne gris détaillé : longues oreilles, crinière droite, croix sur les épaules, museau clair ; `walk` piloté par `donkeyStep(dist, s)`,
  `lie` couché, `head` broute, `blanket`, `halter`, `earFlick`/`swish` ; `halterOf()` pour la longe), `donkeyBones()` + `BONES26` (squelette propre et blanc qui se
  rassemble : `k` 0 = os épars au sol → 1 = squelette debout ; puis `donkey({alpha})` pour la chair), `figBasket()` / `fig26()` (panier de figues, `fresh`, `dust`), `jug26()`,
  `ruinTown()` (Jérusalem en ruines vue de loin) + `townK()` (ruines → ville rebâtie en fondu), `brokenWall()` / `brokenTop()` (mur cassé en gradins), `rubble()`,
  `judea()` (paysage complet : ciel, chaînes, colline de la ville, terrasses d'oliviers ; `skyFn`, `walkers`, `cityFx`), `slope()` + `gY()` (pente proche où tout est posé),
  `daySky()` + `lapse()` (accéléré : jours/nuits, saisons de l'arbre, compteur `yearCount()`), `ruinNear()` (brèche dans le rempart), `fallSet()` (destruction, sans violence), `uzHero()`.

## Épisode 27 (`episodes/27-khidr/`) — Al-Khidr et Moussa (Al-Kahf 60-82, Bukhari 122)
- Après les 25 prophètes nommés et 'Uzayr : Al-Khidr (nommé dans Bukhari, prophète pour beaucoup de savants, signalé comme tel). Moussa, Al-Khidr et Youcha' sont
  des silhouettes blanches au voile de lumière (galon vert pour Al-Khidr) ; la mort du garçon n'est pas montrée (une lampe qui s'éteint).
- Nouveaux éléments : `seaSet27()` (pleine mer : côtes lointaines, houle en perspective, scintillement sous le soleil, voiles au large), `seaFront27()` (eau devant une coque :
  cache la quille, écume, reflet), `boat27()` (bateau à voile latine : bordages à clin qui suivent la tonture, membrures, rames de gouverne, jarres ; `hole` = planche arrachée
  aux bords éclatés, `patch` = rapiécé, `crew(c, deck27)` = personnages sur le pont, pieds cachés par le bordé, `sparrow` = l'oiseau de Bukhari sur l'étrave), `plank27()`,
  `khHero()` (plan héros : le bateau, Al-Khidr tient la planche, Moussa lève la main), `twoSeas()` (le confluent des deux mers : deux eaux de couleurs différentes, couture d'écume),
  `shore27()` + `sandY27()` (plage, grand rocher, coquillages, algues), `greenPatch()` (l'herbe qui verdit sous Al-Khidr, Bukhari 3402), `basket27()`, `fish27()`, `tunnel27()`
  (le chemin du poisson « comme un tunnel »), `splash27()`, `sermonSet()`, `meetSet()` (`trio` = les trois marchent), `leanWall()` (mur penché par cisaillement, la base reste au sol),
  `villageSet()` (`cut` = coupe du sol sur le trésor `chest27()`), `playSet()`, `lampSet()`, `harbourSet()` (soldats du roi qui saisissent les bateaux), `parentsSet()`, `sailAway()`, `fgShore()`.

## Épisode 28 (`episodes/28-yasin/`) — les messagers de Yâ-Sîn et Habib, l'homme qui arriva en courant (Yâ-Sîn 13-29)
- Après les 25 prophètes nommés, 'Uzayr et Al-Khidr : les trois messagers envoyés à « la cité » (Antioche selon beaucoup d'exégètes, signalé « Allah sait mieux »).
  Les messagers = silhouettes blanches au voile de lumière ; Habib (nom donné par les exégètes, menuisier selon Ibn Ishaq) est un croyant ordinaire, sans visage.
  Sa mort n'est pas montrée (lumière blanche, puis son herminette sur les dalles) ; le Paradis n'est qu'évoqué (jardin de lumière) ; le Cri = une onde et toutes les lampes qui s'éteignent.
- Nouveaux éléments : `silpius()` (le mont Silpius : rempart à tours qui suit la crête, citadelle, maisons étagées avec lampes `lamp`, `dark`), `orontes()` (fleuve dans la plaine),
  `antioch()` (paysage complet + sol proche `slope()`/`gY` pour les marcheurs `walkers`), `square28()` (place à colonnade, auvent, jarres), `crowd28()` (foule en perspective `CR28` :
  `anger`, `stones` = pierres en main, `laugh`, `close` = la foule se resserre en gardant ses distances avec Habib), `hero28()` (plan héros : colonne de lumière + vignette sur Habib),
  `runnerAt()` (course dans la rue en perspective, pas pilotés par la distance intégrée), `garden28()` (jardin de lumière), `adze()` (herminette), `cryWave()`, `cityAt()` (`out` = lampes éteintes).
- Piège : `sparkle()` près d'une tête dessine des points blancs qui ressemblent à des yeux → toujours le placer bien au-dessus des personnages.

## Épisode 29 (`episodes/29-kahf/`) — Les gens de la Caverne (Al-Kahf 9-26) · série « Histoires du Coran »
- Début de la série « Histoires du Coran » (une histoire différente à chaque épisode) : `seriesTag29()` affiche « HISTOIRES DU CORAN · ÉPISODE N », `ctaText29()` = « Quelle histoire du Coran veux-tu pour le prochain épisode ? ».
- Les jeunes gens sont des croyants ordinaires (sans visage, pas de voile de lumière) ; Éphèse / Daqyanus / la pièce reconnue au marché = « selon les exégètes / les récits ». Leur nombre n'est jamais tranché à l'image (les dormeurs du fond restent dans l'ombre ; scène 3 ? 5 ? 7 ? puis « Mon Seigneur connaît mieux leur nombre »).
- Nouveaux éléments : `dog29()` (lévrier couleur sable : `pose` stand / `walk` (trot, phase pilotée par `dogStep(dist, s)`, pattes posées au sol automatiquement) / `lie` = pattes avant étendues (Al-Kahf 18), `head` 0 = tête sur les pattes, 1 = aux aguets),
  `sleeper29()` (dormeur sur le côté sur une natte : tête dans le keffieh, bras sous la joue, genoux pliés, respiration ; `dir` = tourné à droite / à gauche), `cave29()` (la caverne vue de l'intérieur : bouche irrégulière `MOUTH29` / `mouthPath29()`,
  paroi en anneaux, sol en perspective `caveFloorY`, dormeurs `SLP29`, chien sur le seuil, `sunPatch` = la tache de soleil qui passe sur la paroi droite au lever / gauche au coucher sans les toucher, `awake` = assis, `turned`, `mercy` = lumière douce, `ph` = ciel en accéléré),
  `outside29()` / `sky29()` (ciel fixe ou cycle jour-nuit), `massif29()` + `mtY29()` (montagne à plusieurs sommets, éperons ombrés, strates, corniche sous la grotte), `mount29()` (la montagne et la grotte vues de dehors, ville au loin `idol` = idole sur la tour, sentier, pente proche `pY29()` pour les marcheurs),
  `walkers29()` (groupe qui marche sur `pY29`, `dir` ±1, `dog` = le chien suit), `temple29()` + `youthsAt29()` (temple à colonnes, idole, braseros, fidèles prosternés ; les jeunes gens debout à l'écart, `step`, `armUp`, `dua`), `market29()` (arcades, étal, marchand `recoil`, passants qui entrent par les bords),
  `coin29()` (pièce d'argent : couronne en relief, inscription usée, patine, reflet `glint`, aucun visage) + `coinClose29()` (la pièce dans la paume), `count29()` (silhouettes 3 / 5 / 7 + le chien dans la lumière de la bouche), `yearCount29()` (compteur 0 → 309).
- Piège : avec `dir: -1`, une distance de marche doit être soustraite (`x0 + d * dir`), sinon le marcheur recule hors champ.

## Épisode 30 (`episodes/30-dhulqarnayn/`) — Dhul-Qarnayn et la muraille de fer (Al-Kahf 83-98) · « Histoires du Coran »
- Dhul-Qarnayn = roi juste et croyant pour la plupart des savants (prophétie et identité discutées, signalé à l'oral et à l'écran) : sans visage, sans voile de lumière, manteau bleu nuit à galon d'or, bâton.
  **Ya'juj et Ma'juj ne sont jamais dessinés** : obscurité qui roule derrière le col, poussière, grains projetés contre le haut du mur (`surge`). Le nivellement du mur (verset 98) est montré comme une vision (`level`, `vision`), signalé « cela n'est pas encore arrivé ».
- Nouveaux éléments : `gorge30()` (le col entre deux montagnes en V : `flank30()`/`gapL30()`/`gapR30()` = flancs intérieurs, `cliff30()` montagnes avec ravines, strates, face éclairée à gauche / ombrée à droite ; `beyond30()` = au-delà du col, `dark`, `surge`, `wallTop` ; `ghost` = contour en pointillés du mur à venir ; `hAt30(y)` = taille d'un personnage selon la profondeur au pied du mur),
  `wall30()` (le mur bloc par bloc : `fill` 0→1 monte rangée par rangée, `heat` = fer rouge, `copper` = cuivre fondu qui coule du haut avec un front incandescent, `cool` = cuivre refroidi, joints de cuivre, `level` = nivelé + poussière), `forge30()` (foyers `flame30()`, soufflets en cuir `bellows30()` actionnés par des hommes à genoux, `pump`),
  `pour30()` (échafaudage + creuset qui bascule et verse), `ironPile30()` (piles de blocs de fer), `carriers30()` (porteurs de blocs sur l'épaule, pas pilotés par la distance), `tribute30()` (tapis, tas d'or, coffres), `hero30()` / `heroPeople30()` (plan héros : `cheer`, `kDua`, `kArm`),
  `plain30()` (plaine ouverte : `marsh` = source boueuse et sombre au couchant avec reflet `marsh30()`, `huts30()` huttes de roseaux, `dry` = sol craquelé du levant + `heat` (miroitement), `horns` = lueurs aux deux extrémités, levant et couchant ; parallaxe `px` = déplacement de la caméra), `caravan30()` (le roi, ses hommes et des chameaux en marche ; `'K'`, `'C'`, `dir`), `bigSun30()`.
- Piège : dans `plain30`, les marcheurs sont sur la couche du sol proche (parallaxe 0) ; la caméra suit le groupe avec `cx = x0 + dist*dir ± décalage`, sinon il sort du cadre.

## Épisode 31 (`episodes/31-elephant/`) — Les gens de l'Éléphant (Al-Fil 1-5, Ibn Ishaq, Bukhari 2731) · « Histoires du Coran »
- Abraha, ses soldats, Abd al-Muttalib et les Mecquois sont sans visage ; **le Prophète Muhammad ﷺ n'est jamais représenté** (révélation finale = une maison éclairée la nuit + calligraphie `محمد ﷺ`) ;
  Allah jamais représenté (lumière `lightFromAbove`) ; les pierres tombent au loin (traînées + poussière), l'armée s'enfuit, la plaine vide : aucune violence montrée. Mahmoud, les 200 chameaux, le dialogue, les trois pierres par oiseau = « selon les récits (Ibn Ishaq) ».
- Nouveaux éléments : `elephant31()` (éléphant de guerre : tête en dôme, grandes oreilles qui battent, trompe annelée `trunk` 0 pendante → 1 levée, défenses, pattes en colonnes ridées avec ongles,
  caparaçon rouge à galon d'or et pompons, collier à cloche ; `walk` piloté par `eleStep31(dist, s)` (les pieds d'appui ne glissent pas), `kneel` 0→1 = pattes avant pliées d'abord puis arrière, trompe posée au sol ;
  `eleAnchor31()` = point du corps dans le monde, ex. pour une corde tirée par un soldat), `swallow31()` (oiseau de près, de profil : queue fourchue, gorge rousse, une pierre dans le bec et deux dans les pattes),
  `birdM31()` / `flock31()` (volées qui entrent par le bord, densité `k`), `pebbleRain31()` (pierres d'argile qui tombent au loin + bouffées de poussière), `dust31()`, `straw31()` / `chaff31()` / `after31()` (paille mâchée, lances et boucliers à terre),
  `tinySol31()` / `ranks31()` (rangs de soldats lointains en perspective, marche `dist`, bannières), `sold31()` (soldat + lance et bouclier), `meccaOut31()` (la plaine devant La Mecque : trois chaînes de granit `meccaRange31()`
  avec ravines et faces à l'ombre par décalage du profil, La Mecque et la Kaaba au fond du col `KXo31/KYo31`, `hide` = Mecquois réfugiés sur les pentes, `farArmy`/`midFx`/`walkers`/`flockMid`, `after31`, `gy` = sol proche, ex. `pY31` pente),
  `hero31()` / `heroNear31()` (plan héros : l'éléphant agenouillé, soldats qui tirent et poussent), `sanaa31()` + `church31()` (Sanaa : maisons-tours, la grande église al-Qullays sans aucun symbole), `pavilion31()` + `pavPeople31()` (le pavillon d'Abraha, trône, gardes),
  `march31()` (l'armée en marche sur `plain30`), `herd31()` (chameaux qui paissent / emmenés), `climbers31()`, `mecca31()` (= `meccaSet()` de l'épisode 25 avec caméra, `noIdols`, `skyFn`, `people`, `moonX/moonY`).
- Piège : dans `elephant31`, les pattes proches sont dessinées entre le corps et le caparaçon (deux passes sous la même transformation de cisaillement) ; la tête est agrandie (x1,14) : la limite du sol de la trompe est recalculée dans ce repère.

## Épisode 32 (`episodes/32-qarun/`) — Qarun et ses trésors (Al-Qasas 76-83) · « Histoires du Coran »
- Qarun, ses porteurs, son cortège, les sages et les gens sont sans visage ; Moussa = silhouette blanche au voile de lumière ; Allah jamais représenté (lumière `lightFromAbove`).
  L'engloutissement (verset 81) = la maison qui s'enfonce dans une fosse, poussière, fissures : personne n'est montré dedans. « Son cousin » = selon les exégètes (Ibn Abbas). Les détails non vérifiés (mulets, habits du cortège) ne sont pas dits à l'oral.
- Piège corrigé : les entrées `covered: true` de `FOLK` dessinaient une tête claire et vide qui se lit comme un **voile de lumière de prophète** → l'épisode 32 remet `covered: false` partout (et retire le violet de `FOLK[6]`, réservé à Qarun).
- Nouveaux éléments : `key32()` (grande clé de bronze : anneau, tige, panneton à dents ; pend par l'anneau, `ang`), `bearers32()` (file d'hommes forts courbés (`lean`) sous une poutre posée sur leurs épaules
  (points d'épaule recalculés après l'inclinaison), trousseaux de clés qui se balancent entre eux, coussinets ; `dist` = marche pilotée par la distance, sinon ils peinent sur place),
  `palace32()` (palais sur plateforme à gradins : tours à merlons à redans, frise peinte, colonnade dorée, porte dorée cloutée, étage aux fenêtres éclairées `lamp`, dôme doré `glint`),
  `town32()` (ville basse en parallaxe : rempart, rangées de maisons à toits plats, palmiers, fenêtres éclairées ; tirages aléatoires toujours faits pour que rien ne saute quand `lamp` change),
  `forecourt32()` (parvis dallé en perspective + palmiers), `qarunLand32()` (paysage complet : `onPalace` = personnages sur le perron du palais, `walkers`, `sink` 0→1 = la maison s'enfonce
  (clip rectangle + demi-ellipse de la fosse), `after` = la cicatrice du lendemain, `light`, `tint`, `shake`), `sinking32()` + `cracks32()` (fissures fines qui partent du bord de la fosse : `cracks()` était trop épais en gros plan),
  `treasury32()` (salle du trésor : portes bardées de fer `vaultDoor32()` avec serrure et clé qui tourne `key`, lumière sous la porte `doorGlow`, tas d'or `goldHeap32()`, coffres ouverts `openChest32()`, aiguières `ewer32()`),
  `procession32()` + `parasol32()` (cortège en safran et rouge, Qarun sous l'ombrelle), `ruins32()` + `brokenCol32()` (colonnes brisées dans les dunes au couchant), `humble32()` (maison modeste, croyant en prière dans la lumière),
  `keyClose32()` (gros plan : la clé dans le sable à l'aube), `hero32()` / `heroTexts32()` (plan héros : palais à l'heure dorée, Qarun sur le perron, porteurs au premier plan).

## Épisode 33 (`episodes/33-jardin/`) — Les gens du jardin (Al-Qalam 17-33) · « Histoires du Coran »
- Le père, les trois frères (nombre non précisé par le Coran) et les pauvres sont des croyants ordinaires, sans visage. Le fléau (ṭā'if, verset 19) n'est jamais une forme : un front sombre
  qui passe sur le jardin la nuit + une lueur de braises, puis le jardin noir. Yémen / Sanaa, la part des pauvres, « sans dire : si Allah le veut », le jardin meilleur ensuite = « selon les exégètes ».
- Le scenes.js est assemblé par `episodes/33-jardin/build.sh` : bibliothèque partagée de l'épisode 32 (jusqu'avant `const SCENES`) + `ep33_lib.js` (décors et personnages) + `ep33_scenes.js` (SCENES).
- Nouveaux éléments : `palm33()` (palmier dattier qui brûle : `burn` 0→1 = palmes noircies, courtes, raides et cassées + « jupe » de palmes mortes pendantes, dattes ratatinées ; `lush` = régimes plus nombreux ; `ember`),
  `vineRow33()` (rang de vigne sur treille : piquets, fil, ceps tordus, feuilles à trois lobes `leaf33()`, grappes `grapes33()` ; `burn` nombre ou fonction de x), `basket33()` (panier tressé : `fill` = dattes, `hang` = origine en haut de l'anse, `rot` = renversé),
  `hand33()` / `carrier33()` (personnage qui porte un panier à la main, main calculée avec le balancement de la marche), `whisper33()` (chuchotement : petits arcs à côté de la tête, jamais de points),
  `terraces33()` (montagnes en terrasses du Yémen), `village33()` (maisons-tours lointaines), `wall33()` (mur du jardin en pierre, piliers et linteau, porte à deux battants qui s'ouvrent vers l'intérieur `open`, `soot` = haut noirci),
  `orchard33()` (l'intérieur derrière le mur : sol, rang de vigne vu par la porte, deux rangées de palmiers), `ground33()` (terre, chemin vers la porte et le long du mur, rigole d'irrigation), `home33()` (la maison des frères à gauche, `HX33`),
  `fleau33()` (front d'obscurité + lueur de braises qui balaie le jardin ; avec `burn: burnFront33(sx)` le jardin noircit derrière lui), `smoke33()`, `garden33()` (paysage complet : `burn`, `open`, `night`, `stars`, `moon`, `sweep`, `smoke`, `lush`, `onWall`, `walkers`, `doorOpen`),
  `vineyard33()` (dans le jardin : rangs de vigne en profondeur, allée centrale douce, rang proche flou ; `ash`, `vision` = bords blancs d'une vision), `sleepRoom33()` (les trois frères endormis la nuit, `sleeper29()`), `hero33()` / `heroTexts33()`.
- Piège : dans une fonction `par(c, …, () => {…})`, une variable déclarée dans une autre fermeture n'existe pas — `top` tombait sur `window.top` (crash `h1.slice` dans `mix()`).

## Épisode 34 (`episodes/34-vache/`) — La vache des fils d'Israël (Al-Baqara 67-73) · « Histoires du Coran »
- Moussa = silhouette blanche au voile de lumière (`MUSA34`) ; le riche assassiné, son neveu (rouge sombre, `NEPHEW34`), le propriétaire de la vache et les gens sont sans visage ; Allah jamais représenté (lumière).
  Le meurtre n'est jamais montré (une fenêtre dont la lampe s'éteint, un corps couvert devant une porte) ; l'égorgement non plus (la foule de dos au couchant, puis la corde au sol). Le mort ressuscité = linceul de lin chaud, jamais blanc lumineux (pour ne pas le confondre avec un prophète).
  Neveu / héritage / autre clan / « il nomma son meurtrier » / prix = « selon les exégètes / les récits » ; parole d'Ibn Abbas = rapportée par at-Tabari.
- Le scenes.js est assemblé par `episodes/34-vache/build.sh` : bibliothèque de l'épisode 33 (jusqu'avant `const SCENES`) + `ep34_lib.js` + `ep34_scenes.js`.
- Nouveaux éléments : `cow34()` (vache de profil détaillée : tonneau à garrot et hanche, fanon, cornes, oreille, queue à touffe, sabots ; `col` yellow / brown / dark / old (maigre, dos creusé, côtes),
  `calf`, `dist` = marche pilotée par la distance (`cowStep34`), `head` = broute, `glow`, `halter`, `yoke`, `dim`, `night` ; `cowAnchor34()` = point du museau pour une longe), `camp34()` (campement des fils d'Israël :
  chaînes de granit du Sinaï `sinai34()`, rangées de tentes `camp19()`, palmiers, maisons de briques proches `houses`, sol plat en perspective ; `night`, `lamp`, `fires`, `torches`, `doorOpen` + `doorLight` = porte ouverte sur la lumière),
  `hY34(y)` (taille d'un personnage selon la profondeur sur ce sol plat), `pasture34()` (prairie d'oasis : ruisseau, herbe animée, fleurs, palmiers, `farHerd` ; `vision`), `crowd34()` / `CROWD34` / `ASM34` (foules en rangs, `face` = regardent un point, `fn` = gestes par personne),
  `covered34()` (corps couvert d'un manteau, seules les sandales dépassent), `risen34()` (le mort sur son brancard sous un linceul de lin : `rise` 0→1 = il se redresse en pivotant aux hanches, `glow`), `bundle34()` (« un morceau » = petit paquet de tissu noué),
  `plough34()` (bœuf sous le joug + araire + laboureur, sillon), `irrigWell34()` (puits d'irrigation : le bœuf s'éloigne, la corde sur la poulie remonte le seau), `visionFx34()` + `noSign34()` (vision pâle barrée d'un cercle tracé),
  `hero34()` / `heroCrowd34()` (`rise`, `turn` = la foule se tourne vers le meurtrier) / `heroTexts34()`.
