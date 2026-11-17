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
