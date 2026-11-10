"""Build timeline.json (scene timings + word-timed subtitle cues) for an episode.
Uses ElevenLabs alignment files in <ep>/audio when present, else estimates timings.
Usage: python3 tools/build_timeline.py episodes/01-yusuf"""
import json, os, re, subprocess, sys

ep = sys.argv[1]
cfg = json.load(open(os.path.join(ep, "script.json"), encoding="utf-8"))
LEAD_FIRST, LEAD, TAIL, OUTRO = 1.2, 0.25, 0.45, 3.5
CHARS_PER_SEC = 13.5  # estimate when no audio


def words_from_alignment(al):
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    words, cur, s0, e0 = [], "", None, None
    for c, s, e in zip(chars, st, en):
        if c.isspace():
            if cur:
                words.append({"w": cur, "s": s0, "e": e0})
            cur, s0 = "", None
            continue
        if not cur:
            s0 = s
        cur += c
        e0 = e
    if cur:
        words.append({"w": cur, "s": s0, "e": e0})
    return glue(words)


def glue(words):
    """French typography: attach lone punctuation tokens (« » : ! ? ;) to the neighbouring word."""
    out = []
    for w in words:
        if out and re.fullmatch(r"[»:!?;…,.]+", w["w"]):
            out[-1]["w"] += "\u00a0" + w["w"]; out[-1]["e"] = w["e"]
        elif out and out[-1]["w"] == "«":
            prev = out.pop(); out.append({"w": "«\u00a0" + w["w"], "s": prev["s"], "e": w["e"]})
        else:
            out.append(dict(w))
    return out


def words_estimated(text):
    toks = text.split()
    words, t = [], 0.0
    for w in toks:
        d = (len(w) + 1) / CHARS_PER_SEC
        if re.search(r"[.!?…:»]$", w):
            d += 0.35
        elif w.endswith(","):
            d += 0.15
        words.append({"w": w, "s": t, "e": t + d * 0.85})
        t += d
    return glue(words)


def audio_dur(path):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                   "-of", "csv=p=0", path]).decode().strip()
    return float(out)


def chunk(words, max_line=30):
    """Group words into cues of <= 2 lines, preferring breaks after punctuation."""
    cues, cur = [], []
    def length(ws):
        return sum(len(x["w"]) + 1 for x in ws)
    for i, w in enumerate(words):
        cur.append(w)
        L = length(cur)
        nxt = words[i + 1] if i + 1 < len(words) else None
        punct = re.search(r"[.!?…:»,]$", w["w"]) is not None
        strong = re.search(r"[.!?…:»]$", w["w"]) is not None
        if nxt is None or (strong and L > 14) or (punct and L > 34) or L + len(nxt["w"]) > max_line * 2 - 4:
            # never leave an opening quote or a lone short word dangling at the start of the next cue
            cues.append(cur); cur = []
    return cues


def lines(ws, max_line=30):
    txt = [x["w"] for x in ws]
    if sum(len(t) + 1 for t in txt) <= max_line:
        return [list(range(len(ws)))]
    best, bi = 1e9, 1
    for k in range(1, len(ws)):
        a = sum(len(t) + 1 for t in txt[:k]); b = sum(len(t) + 1 for t in txt[k:])
        score = abs(a - b) + (0 if re.search(r"[,.:!?…»]$", txt[k - 1]) else 6)
        if score < best:
            best, bi = score, k
    return [list(range(bi)), list(range(bi, len(ws)))]


timeline = {"fps": 30, "width": 1080, "height": 1920, "scenes": [], "cues": [], "audio": []}
t = 0.0
for i, s in enumerate(cfg["scenes"]):
    base = os.path.join(ep, "audio", f"{i:02d}_{s['id']}")
    if os.path.exists(base + ".json"):
        ws = words_from_alignment(json.load(open(base + ".json", encoding="utf-8")))
        src = base + ".mp3"
        tempo = cfg.get("tempo", 1.0)
        if tempo != 1.0:  # speed up slightly without changing pitch; rescale word timings
            tdir = os.path.join(ep, ".segments", "tempo"); os.makedirs(tdir, exist_ok=True)
            dst = os.path.join(tdir, os.path.basename(base) + ".wav")
            subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", f"atempo={tempo}", dst])
            src = dst
            for x in ws:
                x["s"] /= tempo; x["e"] /= tempo
        vdur = audio_dur(src)
        timeline["audio"].append({"file": src, "at": None})
    else:
        ws = words_estimated(s["text"])
        vdur = ws[-1]["e"] + 0.1
    lead = LEAD_FIRST if i == 0 else LEAD
    vstart = t + lead
    if timeline["audio"] and timeline["audio"][-1]["at"] is None:
        timeline["audio"][-1]["at"] = round(vstart, 3)
    dur = lead + vdur + TAIL
    timeline["scenes"].append({"id": s["id"], "start": round(t, 3), "dur": round(dur, 3), "voice": round(vstart, 3)})
    for c in chunk(ws):
        cue = {"start": round(vstart + c[0]["s"] - 0.08, 3), "end": round(vstart + c[-1]["e"] + 0.25, 3),
               "words": [{"w": x["w"], "s": round(vstart + x["s"], 3)} for x in c], "lines": lines(c)}
        timeline["cues"].append(cue)
    t += dur
# make cues not overlap
for a, b in zip(timeline["cues"], timeline["cues"][1:]):
    a["end"] = min(a["end"], b["start"] - 0.02)
timeline["scenes"].append({"id": "outro", "start": round(t, 3), "dur": OUTRO, "voice": None})
timeline["total"] = round(t + OUTRO, 3)
json.dump(timeline, open(os.path.join(ep, "timeline.json"), "w"), ensure_ascii=False, indent=1)
print("total", timeline["total"], "s;", len(timeline["cues"]), "cues;",
      "audio" if timeline["audio"] else "ESTIMATED timings")
for s in timeline["scenes"]:
    print(f"  {s['id']:9s} {s['start']:7.2f} +{s['dur']:.2f}")
