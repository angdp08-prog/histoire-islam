#!/bin/bash
# assemble scenes.js: shared library (from episode 32) + episode 33 section + SCENES
cd "$(dirname "$0")"
{ echo "// Episode 33 — The People of the Garden. Qur'an, Al-Qalam 17-33; Ibn Kathir, al-Tabari, al-Qurtubi (tafsir)."
  echo "// Shared library carried over from the previous episodes (up to 32), then the episode 33 section at the end."
  sed -n '3,6689p' ../32-qarun/scenes.js; cat ep33_lib.js ep33_scenes.js; } > scenes.js
