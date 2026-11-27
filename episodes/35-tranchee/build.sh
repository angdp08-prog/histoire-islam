#!/bin/bash
# assemble scenes.js: shared library (episodes up to 34) + episode 35 section + SCENES
cd "$(dirname "$0")"
{ echo "// Episode 35 — The People of the Trench. Qur'an, Al-Buruj 4-10; Sahih Muslim 3005 (hadith of Suhayb); Ibn Kathir, al-Tabari (tafsir)."
  echo "// Shared library carried over from the previous episodes (up to 34), then the episode 35 section at the end."
  sed -n '3,7249p' ../34-vache/scenes.js; cat ep35_lib.js ep35_scenes.js; } > scenes.js
