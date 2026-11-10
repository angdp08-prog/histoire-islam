"""Offline voice-over with Kokoro v1.0 (onnx) when ElevenLabs is unreachable.
Writes the same files as tts.py: <ep>/audio/NN_id.mp3 + NN_id.json (ElevenLabs-style character alignment),
so build_timeline.py / make.sh work unchanged.

Usage: python3 tools/tts_local.py episodes/03-yunus [scene_id ...]
Needs (outside the repo, see TTS_DIR, default ~/tts):
  kokoro-multi-lang-v1_0/  (k2-fsa/sherpa-onnx release "tts-models": model.onnx, voices.bin, tokens.txt)
  piper/                   (rhasspy/piper release 2023.11.14-2: espeak-ng + espeak-ng-data, for French phonemes)
script.json keys: "local_voice" (default ff_siwis), "local_speed" (default 0.92), "pron" {word: spelling for TTS}."""
import json, os, re, subprocess, sys, wave
import numpy as np
import onnxruntime as ort

ep = sys.argv[1]; only = set(sys.argv[2:])
D = os.environ.get("TTS_DIR", os.path.expanduser("~/tts"))
K, P = os.path.join(D, "kokoro-multi-lang-v1_0"), os.path.join(D, "piper")
cfg = json.load(open(os.path.join(ep, "script.json"), encoding="utf-8"))
out = os.path.join(ep, "audio"); os.makedirs(out, exist_ok=True)

sess = ort.InferenceSession(os.path.join(K, "model.onnx"), providers=["CPUExecutionProvider"])
meta = sess.get_modelmeta().custom_metadata_map
names = meta["speaker_names"].split(",")
voices = np.fromfile(os.path.join(K, "voices.bin"), dtype=np.float32).reshape(len(names), 510, 1, 256)
vocab = {}
for line in open(os.path.join(K, "tokens.txt"), encoding="utf-8"):
    line = line.rstrip("\n")
    if not line: continue
    sym, idx = line.rsplit(" ", 1)
    vocab[sym if sym else " "] = int(idx)
vocab.setdefault(" ", 16)
VOICE = cfg.get("local_voice", "ff_siwis"); SPEED = cfg.get("local_speed", 0.92)
style_all = voices[names.index(VOICE)]
PRON = cfg.get("pron", {})


def espeak(text):
    env = dict(os.environ, LD_LIBRARY_PATH=P)
    r = subprocess.run([os.path.join(P, "espeak-ng"), "--path=" + P, "-q", "--ipa", "-v", "fr-fr", text],
                       capture_output=True, text=True, env=env, check=True)
    return [w.replace("-", "") for w in r.stdout.split()]


PUNCT = {",": ",", ".": ".", "!": "!", "?": "?", ":": ":", ";": ";", "…": "…", "«": "“", "»": "”"}


def phonemize(text):
    """Return (phoneme string, list of (word, start_char_in_phonemes, end_char)) with one entry per spoken word."""
    toks = re.findall(r"[«»]|[^\s«»]+", text)
    ph, spans, chunk = "", [], []

    def flush():
        nonlocal ph
        if not chunk: return
        spoken = " ".join(PRON.get(re.sub(r"[^\w'’-]", "", w), re.sub(r"[^\w'’-]", "", w)) for w in chunk)
        ipa = espeak(spoken)
        if len(ipa) != len(chunk):  # merge/split happened: distribute by length
            whole = " ".join(ipa); n = len(whole); acc = 0; tot = sum(len(w) for w in chunk); ipa = []
            for w in chunk:
                k = round(n * len(w) / tot); ipa.append(whole[acc:acc + k].strip() or "ə"); acc += k
        for w, p in zip(chunk, ipa):
            if ph and not ph.endswith(("“", " ")): ph += " "
            spans.append((w, len(ph), len(ph) + len(p))); ph += p
        chunk.clear()

    for tk in toks:
        lead = PUNCT.get(tk[0]) if tk[0] in "«" else None
        core = tk.strip(",.!?:;…»«")
        trail = re.findall(r"[,.!?:;…»]", tk[len(tk.rstrip(',.!?:;…»')):]) if core else []
        if lead or tk == "«":
            flush(); ph += (" " if ph else "") + "“"; spans.append(("«", len(ph), len(ph))); continue
        if tk == "»":
            flush(); spans.append(("»", len(ph), len(ph))); ph += "”"; continue
        if not core:  # standalone punctuation such as " :" or " !"
            flush(); ph += "".join(PUNCT.get(c, "") for c in tk)
            if spans: w0, a0, b0 = spans[-1]; spans[-1] = (w0 + "\u00a0" + tk, a0, b0)
            continue
        chunk.append(tk)
        if trail:
            flush(); ph += "".join(PUNCT[c] for c in trail)
    flush()
    return ph, spans


def synth(text):
    ph, spans = phonemize(text)
    ids, pos = [0], []  # map phoneme char index -> token index
    for i, ch in enumerate(ph):
        pos.append(len(ids))
        if ch in vocab: ids.append(vocab[ch])
    ids.append(0)
    assert len(ids) <= 510, "scene too long for one Kokoro pass"
    style = style_all[len(ids) - 2]
    audio, dur = sess.run(None, {"tokens": np.array([ids], dtype=np.int64), "style": style.astype(np.float32),
                                 "speed": np.array([SPEED], dtype=np.float32)})
    audio = audio.reshape(-1); dur = dur.reshape(-1).astype(float)
    spf = len(audio) / dur.sum() / 24000  # seconds per duration frame
    cum = np.concatenate([[0], np.cumsum(dur)]) * spf
    words = []
    for w, a, b in spans:
        a = min(a, len(pos) - 1)
        ta = pos[a]; tb = pos[min(b, len(pos)) - 1] + 1 if b > a else ta
        words.append((w, float(cum[ta]), float(cum[tb])))
    return audio, words, ph


def alignment(words):
    chars, st, en = [], [], []
    for i, (w, s, e) in enumerate(words):
        if i:
            chars.append(" "); st.append(words[i - 1][2]); en.append(s)
        n = len(w)
        for k, c in enumerate(w):
            chars.append(c); st.append(s + (e - s) * k / n); en.append(s + (e - s) * (k + 1) / n)
    return {"characters": chars, "character_start_times_seconds": st, "character_end_times_seconds": en}


for i, s in enumerate(cfg["scenes"]):
    if only and s["id"] not in only: continue
    audio, words, ph = synth(s["text"])
    pad = np.zeros(int(0.12 * 24000), dtype=np.float32)  # tiny tail so the last word is not clipped
    audio = np.concatenate([audio, pad])
    base = os.path.join(out, f"{i:02d}_{s['id']}")
    wav = base + ".wav"
    with wave.open(wav, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000)
        w.writeframes((np.clip(audio, -1, 1) * 32767).astype(np.int16).tobytes())
    subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-ar", "44100", "-b:a", "128k", base + ".mp3"]); os.remove(wav)
    json.dump(alignment(words), open(base + ".json", "w"), ensure_ascii=False)
    print("ok", s["id"], round(len(audio) / 24000, 2), "s |", ph[:90])
