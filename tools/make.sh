#!/usr/bin/env bash
# Full pipeline for one episode:  bash tools/make.sh episodes/01-yusuf
# 1) voice (ElevenLabs, skipped if audio/*.mp3 exist unless FORCE_TTS=1)  2) timeline  3) ambience  4) frames  5) mix
set -euo pipefail
EP=${1:?episode dir}; cd "$(dirname "$0")/.."
NAME=$(basename "$EP")
VOICE=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]+'/script.json')).get('voice','elevenlabs'))" "$EP")
if [ "$VOICE" != user ] && { ! ls "$EP"/audio/*.mp3 >/dev/null 2>&1 || [ "${FORCE_TTS:-0}" = 1 ]; }; then python3 tools/tts.py "$EP" || echo "!! TTS failed: building without voice"; fi
python3 tools/build_timeline.py "$EP"
python3 tools/ambience.py "$EP"
node tools/render.js "$EP" --workers "${WORKERS:-4}"
S="$EP/.segments"
ffmpeg -y -loglevel error -f concat -safe 0 -i "$S/list.txt" -c copy "$S/video.mp4"
# voice track: each scene clip placed at its start time
python3 - "$EP" <<'PY'
import json, subprocess, sys
ep = sys.argv[1]; tl = json.load(open(f"{ep}/timeline.json"))
args, filt = [], []
for i, a in enumerate(tl["audio"]):
    args += ["-i", a["file"]]; ms = int(a["at"] * 1000)
    filt.append(f"[{i}:a]adelay={ms}|{ms},aformat=channel_layouts=stereo[v{i}]")
out = f"{ep}/.segments/voice.wav"
if tl["audio"]:
    filt.append("".join(f"[v{i}]" for i in range(len(tl["audio"]))) + f"amix=inputs={len(tl['audio'])}:normalize=0,apad=whole_dur={tl['total']}[out]")
    subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", *args, "-filter_complex", ";".join(filt), "-map", "[out]", "-t", str(tl["total"]), out])
else:
    subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", str(tl["total"]), out])
PY
ffmpeg -y -loglevel error -i "$S/video.mp4" -i "$S/voice.wav" -i "$EP/ambience.wav" -filter_complex \
  "[1:a]highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=10:release=200,volume=1.6[v];[2:a]volume=1.0[b];[v][b]amix=inputs=2:normalize=0,loudnorm=I=-15:TP=-1.5:LRA=11[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$EP/$NAME.mp4"
rm -rf "$S"
echo "==> $EP/$NAME.mp4"
