#!/usr/bin/env bash
# Full pipeline for one episode:  bash tools/make.sh episodes/01-yusuf
# 1) voice (ElevenLabs, skipped if audio/*.mp3 exist unless FORCE_TTS=1)  2) timeline  3) ambience  4) frames  5) mix
set -euo pipefail
EP=${1:?episode dir}; cd "$(dirname "$0")/.."
NAME=$(basename "$EP")
VOICE=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]+'/script.json')).get('voice','elevenlabs'))" "$EP")
if [ "$VOICE" != user ] && { ! ls "$EP"/audio/*.mp3 >/dev/null 2>&1 || [ "${FORCE_TTS:-0}" = 1 ]; }; then python3 tools/tts.py "$EP" || { echo "!! ElevenLabs failed: trying local Kokoro voice (tools/tts_local.py)"; python3 tools/tts_local.py "$EP"; } || echo "!! TTS failed: building without voice"; fi
python3 tools/build_timeline.py "$EP"
python3 tools/ambience.py "$EP"
# optional halal background bed (voices only, no instruments): "music" in script.json
if python3 -c "import json,sys;sys.exit(0 if json.load(open(sys.argv[1]+'/script.json')).get('music') else 1)" "$EP"; then python3 tools/music_voices.py "$EP"; fi
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
# final mix: voice (gentle compression) + ambience at a FIXED level, then ONE static gain to -15 LUFS + limiter.
# (no dynamic loudnorm: it pumped the ambience noise up during every pause -> audible hiss)
python3 - "$EP" "$NAME" <<'PY'
import json, re, subprocess, sys
ep, name = sys.argv[1], sys.argv[2]; S = f"{ep}/.segments"
tl = json.load(open(f"{ep}/timeline.json")); cfg = json.load(open(f"{ep}/script.json", encoding="utf-8"))
amb = cfg.get("ambience_gain", 0.9)
mus = cfg.get("music"); mfile = f"{ep}/{mus['file']}" if mus else None
if tl["audio"]:
    mix = ("[0:a]highpass=f=70,acompressor=threshold=-22dB:ratio=2.5:attack=8:release=220:makeup=2,aformat=channel_layouts=stereo[v];"
           f"[1:a]lowpass=f=9000,volume={amb}[b];[v][b]amix=inputs=2:normalize=0[m]")
    if mfile:  # music bed, ducked under the voice (sidechain)
        mix = ("[0:a]highpass=f=70,acompressor=threshold=-22dB:ratio=2.5:attack=8:release=220:makeup=2,aformat=channel_layouts=stereo,asplit[v][vk];"
               f"[1:a]lowpass=f=9000,volume={amb}[b];[2:a]lowpass=f=6000,volume={mus.get('gain', 0.5)},aformat=channel_layouts=stereo[mu];"
               "[mu][vk]sidechaincompress=threshold=0.03:ratio=3:attack=60:release=700[md];[v][b][md]amix=inputs=3:normalize=0[m]")
else:
    mix = "[1:a]lowpass=f=9000,volume=1.4[m]"
pre = f"{S}/premix.wav"
subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-i", f"{S}/voice.wav", "-i", f"{ep}/ambience.wav", *(["-i", mfile] if mfile and tl["audio"] else []),
                       "-filter_complex", mix, "-map", "[m]", "-ar", "48000", pre])
log = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", log)[-1])
gain = (-15.0 if tl["audio"] else -30.0) - I  # no voice yet: keep the ambience bed low (normalising it to -15 LUFS made it hiss)
print(f"mix loudness {I:.1f} LUFS -> static gain {gain:+.1f} dB")
subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-i", f"{S}/video.mp4", "-i", pre, "-filter_complex",
                       f"[1:a]volume={gain:.2f}dB,alimiter=limit=0.84:attack=5:release=60:level=disabled[a]",
                       "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart",
                       f"{ep}/{name}.mp4"])
PY
rm -rf "$S"
echo "==> $EP/$NAME.mp4"
