#!/bin/bash
# assemble scenes.js: shared library (episodes up to 33) + episode 34 section + SCENES
cd "$(dirname "$0")"
{ echo "// Episode 34 — The Cow of the Children of Israel. Qur'an, Al-Baqara 67-73; Ibn Kathir, al-Tabari, al-Qurtubi (tafsir)."
  echo "// Shared library carried over from the previous episodes (up to 33), then the episode 34 section at the end."
  sed -n '3,6955p' ../33-jardin/scenes.js; cat ep34_lib.js ep34_scenes.js; } > scenes.js
