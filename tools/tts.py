"""Generate per-scene voice-over with character timestamps via ElevenLabs.
Usage: python3 tools/tts.py episodes/01-yusuf [scene_id ...]
The API key is read from ELEVENLABS_API_KEY (or injected by a proxy)."""
import base64, json, os, sys, urllib.request

ep = sys.argv[1]
only = set(sys.argv[2:])
cfg = json.load(open(os.path.join(ep, "script.json"), encoding="utf-8"))
out = os.path.join(ep, "audio"); os.makedirs(out, exist_ok=True)
key = os.environ.get("ELEVENLABS_API_KEY", "proxy-injected")
scenes = cfg["scenes"]
for i, s in enumerate(scenes):
    if only and s["id"] not in only:
        continue
    model = cfg.get("model_id", "eleven_multilingual_v2")
    if model == "eleven_v3":  # most natural model; stability must be 0.0 / 0.5 / 1.0, no context stitching
        body = {"text": s["text"], "model_id": model,
                "voice_settings": {"stability": cfg.get("stability", 0.5), "similarity_boost": 0.8, "use_speaker_boost": True}}
    else:
        body = {
            "text": s["text"], "model_id": model,
            "voice_settings": {"stability": 0.62, "similarity_boost": 0.8, "style": 0.15,
                               "use_speaker_boost": True, "speed": cfg.get("speed", 0.92)},
            "previous_text": scenes[i - 1]["text"] if i else None,
            "next_text": scenes[i + 1]["text"] if i + 1 < len(scenes) else None,
        }
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{cfg['voice_id']}/with-timestamps?output_format=mp3_44100_128",
        data=json.dumps(body).encode(), headers={"xi-api-key": key, "Content-Type": "application/json"})
    r = json.load(urllib.request.urlopen(req))
    open(os.path.join(out, f"{i:02d}_{s['id']}.mp3"), "wb").write(base64.b64decode(r["audio_base64"]))
    json.dump(r["alignment"], open(os.path.join(out, f"{i:02d}_{s['id']}.json"), "w"), ensure_ascii=False)
    print("ok", s["id"], r["alignment"]["character_end_times_seconds"][-1])
