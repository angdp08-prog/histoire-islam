"""Precise word-by-word alignment of a recorded / externally generated voice-over with speech recognition.

Usage: python3 tools/align_ctc.py episodes/04-salih voix.mp3
Writes <ep>/audio/NN_id.mp3 + NN_id.json (ElevenLabs-style character alignment, one clip per scene), so
build_timeline.py / make.sh work unchanged, and prints a transcript check (words the voice said differently).

How: a multilingual CTC acoustic model (NeMo FastConformer, ONNX, French included) transcribes the voice with a
time stamp per token (80 ms frames). The transcript is matched to the script character by character, so every
script word gets the time where it is really spoken; word starts are then snapped onto the real voice onsets
(10 ms energy envelope) and scenes are cut in the middle of the silences between them.

Model (outside the repo, ASR_DIR, default ~/asr/sherpa-onnx-nemo-fast-conformer-ctc-be-de-en-es-fr-hr-it-pl-ru-uk-20k):
  https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-nemo-fast-conformer-ctc-be-de-en-es-fr-hr-it-pl-ru-uk-20k.tar.bz2
"""
import difflib, json, os, re, subprocess, sys, unicodedata
import numpy as np
import onnxruntime as ort

ep, voice = sys.argv[1], sys.argv[2]
cfg = json.load(open(os.path.join(ep, "script.json"), encoding="utf-8"))
D = os.environ.get("ASR_DIR", os.path.expanduser("~/asr/sherpa-onnx-nemo-fast-conformer-ctc-be-de-en-es-fr-hr-it-pl-ru-uk-20k"))
SR, HOP, SUB = 16000, 160, 8
FRAME = HOP * SUB / SR  # 0.08 s per output frame


def load(path, sr=SR):
    raw = subprocess.check_output(["ffmpeg", "-loglevel", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-f", "s16le", "-"])
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def mel_fb(sr=SR, n_fft=512, n_mels=80):  # librosa / slaney mel filterbank (what NeMo uses)
    lo, ls = 1000 / (200 / 3), np.log(6.4) / 27
    hz2mel = lambda f: np.where(f >= 1000, lo + np.log(np.maximum(f, 1e-10) / 1000) / ls, f / (200 / 3))
    mel2hz = lambda m: np.where(m >= lo, 1000 * np.exp(ls * (m - lo)), m * (200 / 3))
    ff = np.linspace(0, sr / 2, 1 + n_fft // 2); mf = mel2hz(np.linspace(hz2mel(np.array(0.)), hz2mel(np.array(sr / 2.)), n_mels + 2))
    fd = np.diff(mf); ramps = mf[:, None] - ff[None, :]; w = np.zeros((n_mels, len(ff)))
    for i in range(n_mels):
        w[i] = np.maximum(0, np.minimum(-ramps[i] / fd[i], ramps[i + 2] / fd[i + 1]))
    return (w * (2.0 / (mf[2:] - mf[:n_mels]))[:, None]).astype(np.float32)


def features(x):  # NeMo AudioToMelSpectrogramPreprocessor (25 ms hann, 10 ms hop, 80 mels, per-feature norm)
    x = np.concatenate([x[:1], x[1:] - 0.97 * x[:-1]])
    n_fft, wl = 512, 400
    win = np.zeros(n_fft, np.float32); win[(n_fft - wl) // 2:(n_fft - wl) // 2 + wl] = np.hanning(wl)
    pad = np.pad(x, (n_fft // 2, n_fft // 2)); n = 1 + (len(pad) - n_fft) // HOP
    fr = np.lib.stride_tricks.sliding_window_view(pad, n_fft)[::HOP][:n] * win
    m = np.log((np.abs(np.fft.rfft(fr, axis=1)) ** 2) @ mel_fb().T + 2 ** -24).T
    return ((m - m.mean(1, keepdims=True)) / (m.std(1, ddof=1, keepdims=True) + 1e-5)).astype(np.float32)


def norm_chars(s):  # letters only, lower case, no accents
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if c.isalpha())


# ---------- 1. recognise the voice with token time stamps
x = load(voice)
toks = [l.rstrip("\n").rsplit(" ", 1)[0] for l in open(os.path.join(D, "tokens.txt"), encoding="utf-8")]
sess = ort.InferenceSession(os.path.join(D, "model.onnx"), providers=["CPUExecutionProvider"])
f = features(x)[None]
lp = sess.run(None, {"audio_signal": f, "length": np.array([f.shape[2]], np.int64)})[0][0]
blank = lp.shape[1] - 1
best = lp.argmax(1)
rec_chars, rec_times, transcript, prev = [], [], "", -1  # each recognised letter with the time of its token
for k, tid in enumerate(best):
    if tid != prev and tid != blank:
        piece = toks[tid]; transcript += piece
        for c in norm_chars(piece):
            rec_chars.append(c); rec_times.append(k * FRAME)
    prev = tid
transcript = transcript.replace("▁", " ").strip()

# ---------- 2. script words (same tokens as build_timeline) and their letters
words = []  # [text, scene_index, first_char_index, n_chars]
script_chars = []
for si, s in enumerate(cfg["scenes"]):
    for w in s["text"].split():
        n = norm_chars(w)
        words.append([w, si, len(script_chars), len(n)])
        script_chars += list(n)

# ---------- 3. match letters (robust to words split / merged / misheard)
sm = difflib.SequenceMatcher(None, script_chars, rec_chars, autojunk=False)
ct = [None] * len(script_chars)
for a, b, size in sm.get_matching_blocks():
    for k in range(size): ct[a + k] = rec_times[b + k]
diffs = [(script_chars and "".join(script_chars[i1:i2]), "".join(rec_chars[j1:j2]))
         for tag, i1, i2, j1, j2 in sm.get_opcodes() if tag != "equal"]

cst, cen = [], []  # recognised time of each script word: first / last letter (None if not heard)
for w, si, c0, n in words:
    known = [ct[c] for c in range(c0, c0 + n) if ct[c] is not None]
    cst.append(min(known) if known else None); cen.append(max(known) + FRAME if known else None)
speech = [i for i, w in enumerate(words) if w[3] > 0]
kn = [i for i in speech if cst[i] is not None]
pos = np.array([words[i][2] for i in kn], float)
for i in speech:  # words not heard as such: interpolate on the letter position
    if cst[i] is None:
        cst[i] = float(np.interp(words[i][2], pos, [cst[j] for j in kn]))
        cen[i] = float(np.interp(words[i][2] + words[i][3], pos, [cen[j] for j in kn]))
for a_, b_ in zip(speech, speech[1:]):
    cst[b_] = max(cst[b_], cst[a_]); cen[b_] = max(cen[b_], cst[b_] + 0.04)

# ---------- 4. real timing: the pauses of the voice are matched to the punctuation of the script
# (CTC spikes drift inside pauses by up to ~0.5 s, the 10 ms energy envelope does not)
FS = 0.01; hop = int(FS * SR)
env = np.array([np.sqrt((x[k:k + hop] ** 2).mean() + 1e-12) for k in range(0, len(x) - hop, hop)])
thr = max(1e-4, np.percentile(env, 95) * 0.05)
quiet = env < thr
sil, k = [], 0
while k < len(quiet):
    if quiet[k]:
        j = k
        while j < len(quiet) and quiet[j]: j += 1
        if j - k >= 12 and k > 0 and j < len(quiet): sil.append((k * FS, j * FS))  # pauses >= 120 ms
        k = j
    else: k += 1
runs = np.convolve((~quiet).astype(int), np.ones(8, int), "valid")  # ignore clicks / breaths shorter than 80 ms
voiced = np.where(runs == 8)[0]
v_on, v_off = voiced[0] * FS, (voiced[-1] + 8) * FS

PUN = re.compile(r"[.,;:!?…»]$")
bnd = []  # candidate boundaries after speech word i: (i, next speech word, ctc time, cost if no pause)
for a_, b_ in zip(speech, speech[1:]):
    raw = " ".join(w[0] for w in words[a_:b_])  # word + punctuation-only tokens up to the next word
    strong = re.search(r"[.!?…:»]", raw) or words[a_][1] != words[b_][1]
    weak = PUN.search(words[a_][0]) or re.search(r"[,;]", raw)
    if strong or weak:
        bnd.append((a_, b_, (cen[a_] + cst[b_]) / 2, 1.2 if strong else 0.35))
# monotonic matching pauses <-> boundaries (dynamic programming)
n, m = len(bnd), len(sil)
INF = 1e9; dp = np.full((n + 1, m + 1), INF); bk = np.zeros((n + 1, m + 1), np.int8); dp[0, 0] = 0
pcost = [0.4 + 3 * max(0.0, (s1 - s0) - 0.35) for s0, s1 in sil]
for i in range(n + 1):
    for j in range(m + 1):
        if dp[i, j] >= INF: continue
        if i < n and dp[i, j] + bnd[i][3] < dp[i + 1, j]: dp[i + 1, j] = dp[i, j] + bnd[i][3]; bk[i + 1, j] = 1
        if j < m and dp[i, j] + pcost[j] < dp[i, j + 1]: dp[i, j + 1] = dp[i, j] + pcost[j]; bk[i, j + 1] = 2
        if i < n and j < m:
            s0, s1 = sil[j]; tb = bnd[i][2]; d = max(0.0, s0 - tb, tb - s1)
            if d < 0.9 and dp[i, j] + d / 0.3 < dp[i + 1, j + 1]: dp[i + 1, j + 1] = dp[i, j] + d / 0.3; bk[i + 1, j + 1] = 3
i, j, match = n, m, {}
while i or j:
    if bk[i, j] == 3: match[bnd[i - 1][0]] = sil[j - 1]; i -= 1; j -= 1
    elif bk[i, j] == 1: i -= 1
    else: j -= 1
used = set(match.values())


def place(anchors):
    """anchors: {speech word index a: (pause start, pause end)} meaning a ends at s0 and the next word starts at s1."""
    st, en = {}, {}
    seg_start, seg = v_on, []
    for idx, i in enumerate(speech):
        seg.append(i)
        last = idx == len(speech) - 1
        if i in anchors or last:
            seg_end = anchors[i][0] if i in anchors else v_off
            c0, c1 = cst[seg[0]], max(cen[seg[-1]], cst[seg[-1]] + 0.05)
            for w in seg:
                q0 = (cst[w] - c0) / max(1e-3, c1 - c0); q1 = (cen[w] - c0) / max(1e-3, c1 - c0)
                st[w] = seg_start + (seg_end - seg_start) * min(1, max(0, q0))
                en[w] = seg_start + (seg_end - seg_start) * min(1, max(0, q1))
            if not last: seg_start = anchors[i][1]
            seg = []
    for a_, b_ in zip(speech, speech[1:]):
        en[a_] = min(en[a_], st[b_]) if a_ not in anchors else en[a_]
    return st, en


st, en = place(match)
# second pass: pauses not explained by punctuation (a breath inside a sentence) snap the nearest word gap
extra = 0
for s0, s1 in sil:
    if (s0, s1) in used: continue
    best = None
    for a_, b_ in zip(speech, speech[1:]):
        if a_ in match or words[a_][1] != words[b_][1]: continue
        d = abs((en[a_] + st[b_]) / 2 - (s0 + s1) / 2)
        if d < 0.35 and (best is None or d < best[0]): best = (d, a_)
    if best: match[best[1]] = (s0, s1); extra += 1
st, en = place(match)

starts, ends = [], []
for i, w in enumerate(words):  # punctuation-only tokens take the time of their neighbour
    if i in st: starts.append(st[i] - 0.02); ends.append(max(en[i], st[i] + 0.05))
    else:
        prev = max([k for k in speech if k < i], default=None); nxt = min([k for k in speech if k > i], default=None)
        t0 = st[nxt] if w[0] == "«" and nxt is not None else (en[prev] if prev is not None else st[nxt])
        starts.append(t0); ends.append(t0 + 0.05)
shift, snapped = 0.0, len(match)

# ---------- 5. cut one clip per scene in the silences
dur = len(x) / SR
first = {}; last = {}
for i in speech:
    si = words[i][1]; first.setdefault(si, i); last[si] = i
cuts = [0.0]
for si in range(len(cfg["scenes"]) - 1):
    cuts.append((en[last[si]] + st[first[si + 1]]) / 2)  # middle of the pause between two scenes
cuts.append(dur)
first_tok = {}; last_tok = {}
for i, w in enumerate(words):
    first_tok.setdefault(w[1], i); last_tok[w[1]] = i

out = os.path.join(ep, "audio"); os.makedirs(out, exist_ok=True)
for fn in os.listdir(out):
    if fn.endswith((".mp3", ".json")): os.remove(os.path.join(out, fn))
report = []
for si, s in enumerate(cfg["scenes"]):
    ids = list(range(first_tok[si], last_tok[si] + 1))
    v0 = max(cuts[si], st[first[si]] - 0.10); v1 = min(cuts[si + 1], en[last[si]] + 0.25)
    base = os.path.join(out, f"{si:02d}_{s['id']}")
    subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-i", voice, "-ss", f"{v0:.3f}", "-to", f"{v1:.3f}",
                           "-af", "afade=t=in:d=0.02,areverse,afade=t=in:d=0.12,areverse", "-ar", "44100", "-b:a", "192k", base + ".mp3"])
    chars, cs, ce = [], [], []
    for k, i in enumerate(ids):
        w = words[i][0]; a, b = starts[i] - v0, ends[i] - v0
        if k: chars.append(" "); cs.append(ce[-1]); ce.append(a)
        for j, ch in enumerate(w):
            chars.append(ch); cs.append(a + (b - a) * j / len(w)); ce.append(a + (b - a) * (j + 1) / len(w))
    json.dump({"characters": chars, "character_start_times_seconds": cs, "character_end_times_seconds": ce},
              open(base + ".json", "w"), ensure_ascii=False)
    report.append(f"{s['id']:10s} {v0:7.2f} -> {v1:7.2f}  ({v1 - v0:5.2f}s)  '{words[first[si]][0]}' @{st[first[si]]:.2f} ... '{words[last[si]][0]}' ->{en[last[si]]:.2f}")
print("transcript:", transcript)
print(f"pauses: {len(sil)}, matched to punctuation: {snapped - extra}, breaths inside sentences: {extra}, boundaries: {len(bnd)}")
print("differences script -> heard:", "; ".join(f"{a!r}->{b!r}" for a, b in diffs) or "none")
print("\n".join(report))
