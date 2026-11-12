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
