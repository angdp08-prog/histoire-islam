"""Use a recorded / externally generated voice-over (one file, whole script read in order) for an episode.
Aligns it word by word against a synthetic reference of the same script (DTW on MFCC + voice activity),
then cuts it into per-scene clips and writes <ep>/audio/NN_id.mp3 + NN_id.json like tts.py does.

Usage: python3 tools/align_voice.py episodes/03-yunus voice.mp3 [reference_audio_dir]
The reference dir must hold NN_id.mp3/.json for every scene (e.g. made by tts_local.py); default <ep>/audio."""
import ctypes, json, os, subprocess, sys, tempfile
import numpy as np
from scipy.fft import dct

ep, voice = sys.argv[1], sys.argv[2]
ref_dir = sys.argv[3] if len(sys.argv) > 3 else os.path.join(ep, "audio")
cfg = json.load(open(os.path.join(ep, "script.json"), encoding="utf-8"))
SR, HOP = 16000, 320  # 20 ms frames


def load(path):
    raw = subprocess.check_output(["ffmpeg", "-loglevel", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"])
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def words_of(al):
    out, cur, s0 = [], "", None
    for c, s, e in zip(al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]):
        if c == " ":
            if cur: out.append([cur, s0, pe])
            cur = ""; continue
        if not cur: s0 = s
        cur += c; pe = e
    if cur: out.append([cur, s0, pe])
    return out


_fb = None
def feats(x):
    global _fb
    n = 512; win = np.hanning(n).astype(np.float32)
    pad = np.concatenate([np.zeros(n // 2, np.float32), x, np.zeros(n, np.float32)])
    frames = np.lib.stride_tricks.sliding_window_view(pad, n)[::HOP][: len(x) // HOP + 1] * win
    spec = np.abs(np.fft.rfft(frames, axis=1)) ** 2
    if _fb is None:
        mel = lambda f: 2595 * np.log10(1 + f / 700); imel = lambda m: 700 * (10 ** (m / 2595) - 1)
        pts = imel(np.linspace(mel(60), mel(7600), 42)); bins = np.floor((n + 1) * pts / SR).astype(int)
        _fb = np.zeros((40, n // 2 + 1), np.float32)
        for i in range(40):
            a, b, c = bins[i], bins[i + 1], bins[i + 2]
            _fb[i, a:b] = (np.arange(a, b) - a) / max(1, b - a); _fb[i, b:c] = (c - np.arange(b, c)) / max(1, c - b)
    logm = np.log(spec @ _fb.T + 1e-8)
    energy = logm.max(axis=1)
    m = dct(logm, type=2, axis=1, norm="ortho")[:, 1:14]
    d = np.gradient(m, axis=0)
    f = np.concatenate([m, d], 1); f = (f - f.mean(0)) / (f.std(0) + 1e-6)
    vad = (energy > np.percentile(energy, 30) + 2.0).astype(np.float32)
    return f.astype(np.float32), vad


C_SRC = r"""
#include <stdlib.h>
#include <math.h>
void dtw(const float*A,const float*B,const float*va,const float*vb,int n,int m,int d,int*path_j){
  float *D=malloc(sizeof(float)*(size_t)n*m); unsigned char *P=malloc((size_t)n*m);
  for(int i=0;i<n;i++)for(int j=0;j<m;j++){
    float s=0,na=0,nb=0; for(int k=0;k<d;k++){s+=A[i*d+k]*B[j*d+k];na+=A[i*d+k]*A[i*d+k];nb+=B[j*d+k]*B[j*d+k];}
    float c=1.f-s/(sqrtf(na*nb)+1e-6f); if(va[i]!=vb[j]) c+=0.8f;
    size_t ij=(size_t)i*m+j; float best; unsigned char p;
    if(i==0&&j==0){best=0;p=0;}
    else if(i==0){best=D[ij-1];p=2;} else if(j==0){best=D[ij-m];p=1;}
    else{best=D[ij-m-1];p=0; if(D[ij-m]+0.15f<best){best=D[ij-m]+0.15f;p=1;} if(D[ij-1]+0.15f<best){best=D[ij-1]+0.15f;p=2;}}
    D[ij]=best+c; P[ij]=p;}
  int i=n-1,j=m-1; while(1){ path_j[i]=j; if(i==0&&j==0)break; unsigned char p=P[(size_t)i*m+j]; if(p==0){i--;j--;}else if(p==1)i--; else j--; if(i<0)i=0; if(j<0)j=0; }
  free(D);free(P);}
"""


def dtw_lib():
    d = tempfile.mkdtemp(); src = os.path.join(d, "dtw.c"); so = os.path.join(d, "dtw.so")
    open(src, "w").write(C_SRC); subprocess.check_call(["gcc", "-O3", "-shared", "-fPIC", src, "-o", so, "-lm"])
    return ctypes.CDLL(so)


# ---- reference: scenes concatenated with a short gap, global word times
GAP = 0.6
ref, ref_words, scene_word_idx, t = [], [], [], 0.0
for i, s in enumerate(cfg["scenes"]):
    base = os.path.join(ref_dir, f"{i:02d}_{s['id']}")
    x = load(base + ".mp3"); ws = words_of(json.load(open(base + ".json", encoding="utf-8")))
    idx = []
    for w in ws:
        idx.append(len(ref_words)); ref_words.append([w[0], t + w[1], t + w[2]])
    scene_word_idx.append(idx)
    ref += [x, np.zeros(int(GAP * SR), np.float32)]; t += len(x) / SR + GAP
ref = np.concatenate(ref); usr = load(voice)
FA, VA = feats(ref); FB, VB = feats(usr)
n, m = len(FA), len(FB)
path = np.zeros(n, np.int32)
lib = dtw_lib()
P = ctypes.POINTER(ctypes.c_float)
lib.dtw(FA.ctypes.data_as(P), FB.ctypes.data_as(P), VA.ctypes.data_as(P), VB.ctypes.data_as(P), n, m, FA.shape[1],
        path.ctypes.data_as(ctypes.POINTER(ctypes.c_int)))
fps = SR / HOP
def map_t(tr):  # reference time -> user time
    i = min(n - 1, max(0, int(round(tr * fps)))); return path[i] / fps

# ---- user word times; snap edges to voiced frames
uw = []
for w, a, b in ref_words:
    uw.append([w, map_t(a), max(map_t(b), map_t(a) + 0.05)])
for k in range(1, len(uw)):  # keep strictly monotonic
    uw[k][1] = max(uw[k][1], uw[k - 1][1] + 0.02); uw[k][2] = max(uw[k][2], uw[k][1] + 0.05)

# ---- refine: snap word boundaries onto the real pauses of the recording (piecewise-linear warp)
fr_e = np.array([np.sqrt((usr[k:k + HOP] ** 2).mean() + 1e-12) for k in range(0, len(usr) - HOP, HOP)])
thr = max(1e-4, np.percentile(fr_e, 95) * 0.06)
sil, k, q = [], 0, fr_e < thr
while k < len(q):
    if q[k]:
        j = k
        while j < len(q) and q[j]: j += 1
        if j - k >= 7 and k > 0: sil.append((k / fps, j / fps))  # >= 140 ms
        k = j
    else: k += 1
punct = lambda w: w.rstrip()[-1:] in ",.!?:;…»"
anchors, last = [(0.0, 0.0)], -1
for s0, s1 in sil:
    mid = (s0 + s1) / 2; best = None
    for kk in range(max(0, last + 1), len(uw) - 1):
        bt = (uw[kk][2] + uw[kk + 1][1]) / 2; dist = abs(bt - mid) - (0.25 if punct(uw[kk][0]) else 0)
        if bt - mid > 1.2: break
        if abs(bt - mid) < 0.8 and (best is None or dist < best[0]): best = (dist, kk)
    if best:
        kk = best[1]; last = kk
        anchors += [(uw[kk][2], s0 + 0.03), (uw[kk + 1][1], s1 - 0.03)]
anchors.append((uw[-1][2] + 1.0, min(len(usr) / SR, uw[-1][2] + 1.0)))
ax = np.array([a for a, _ in anchors]); ay = np.array([b for _, b in anchors])
keep = np.concatenate([[True], (np.diff(ax) > 1e-3) & (np.diff(ay) > 1e-3)])
ax, ay = ax[keep], np.maximum.accumulate(ay[keep])
for w in uw: w[1] = float(np.interp(w[1], ax, ay)); w[2] = float(np.interp(w[2], ax, ay))
print(f"pauses detected: {len(sil)}, snapped: {(len(anchors) - 2) // 2}")

# ---- cut scenes at the quietest point between the last word of a scene and the first of the next
dur_u = len(usr) / SR
def quiet_cut(t0, t1):
    a, b = int(t0 * fps), max(int(t0 * fps) + 1, int(t1 * fps))
    seg = fr_e[a:b]
    if not len(seg): return (t0 + t1) / 2
    # middle of the longest run of near-minimum energy
    th = seg.min() * 2.5 + 1e-5; q = seg < th; best, bs, k = 0, a, 0
    while k < len(q):
        if q[k]:
            j = k
            while j < len(q) and q[j]: j += 1
            if j - k > best: best, bs = j - k, a + k
            k = j
        else: k += 1
    return (bs + best / 2) / fps
cuts = [0.0]
for si in range(len(cfg["scenes"]) - 1):
    last, first = uw[scene_word_idx[si][-1]], uw[scene_word_idx[si + 1][0]]
    cuts.append(quiet_cut(last[2] - 0.15, first[1] + 0.15))
cuts.append(dur_u)

out = os.path.join(ep, "audio"); os.makedirs(out, exist_ok=True)
for f in os.listdir(out):
    if f.endswith((".mp3", ".json")): os.remove(os.path.join(out, f))
report = []
for si, s in enumerate(cfg["scenes"]):
    ws = [uw[k] for k in scene_word_idx[si]]
    c0, c1 = cuts[si], cuts[si + 1]
    # trim the clip to speech (+ small margins) so build_timeline controls the pauses between scenes
    v0 = max(c0, ws[0][1] - 0.12); v1 = min(c1, ws[-1][2] + 0.35)
    base = os.path.join(out, f"{si:02d}_{s['id']}")
    subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-i", voice, "-ss", f"{v0:.3f}", "-to", f"{v1:.3f}",
                           "-af", "afade=t=in:d=0.03,areverse,afade=t=in:d=0.08,areverse", "-ar", "44100", "-b:a", "160k", base + ".mp3"])
    chars, st, en = [], [], []
    for k, (w, a, b) in enumerate(ws):
        a -= v0; b -= v0
        if k: chars.append(" "); st.append(en[-1]); en.append(a)
        for j, ch in enumerate(w):
            chars.append(ch); st.append(a + (b - a) * j / len(w)); en.append(a + (b - a) * (j + 1) / len(w))
    json.dump({"characters": chars, "character_start_times_seconds": st, "character_end_times_seconds": en},
              open(base + ".json", "w"), ensure_ascii=False)
    report.append(f"{s['id']:9s} {v0:7.2f} -> {v1:7.2f}  ({v1 - v0:5.2f}s)  '{ws[0][0]}' @{ws[0][1]:.2f}  ...  '{ws[-1][0]}' @{ws[-1][2]:.2f}")
print("\n".join(report))
# sanity: fraction of words whose start lands in voiced audio
vb = VB; ok = np.mean([vb[min(len(vb) - 1, int((w[1] + 0.06) * fps))] for w in uw])
print(f"words starting on voiced frames: {ok:.0%}  | user voice {dur_u:.1f}s, reference {len(ref)/SR:.1f}s")
