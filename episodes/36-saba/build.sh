#!/bin/bash
# assemble scenes.js: shared library (episodes up to 35) + episode 36 section + SCENES
cd "$(dirname "$0")"
{ echo "// Episode 36 — The people of Saba and the flood of the dam. Qur'an, Saba 15-19; Ibn Kathir, al-Tabari, al-Qurtubi (tafsir)."
  echo "// Shared library carried over from the previous episodes (up to 35), then the episode 36 section at the end."
  sed -n '3,7577p' ../35-tranchee/scenes.js; cat ep36_lib.js ep36_scenes.js; } > scenes.js
