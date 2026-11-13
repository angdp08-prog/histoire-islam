"""Halal background bed: VOICES ONLY (humming choir "mmm/ooh"), no instruments, no percussion.
Additive formant synthesis of a small humming choir on a slow chord cycle; intensity follows the scenes
("music_level" in script.json, per scene id, 0..1). Writes <ep>/music.wav.  Usage: python3 tools/music_voices.py episodes/07-musa"""
import json, os, sys, wave
import numpy as np

ep = sys.argv[1]
TL = json.load(open(os.path.join(ep, "timeline.json"))); cfg = json.load(open(os.path.join(ep, "script.json"), encoding="utf-8"))
SR = 44100; T = TL["total"]; N = int(T * SR) + 1; t = np.arange(N) / SR
rs = np.random.default_rng(3)
FORM = [(320, 1.0, 80), (800, 0.25, 90), (2300, 0.04, 120)]  # "oo" / closed-mouth hum: soft, dark, no sibilance
def fgain(f):
    return sum(a / (1 + ((f - fc) / bw) ** 2) for fc, a, bw in FORM) + 0.02
def hz(m): return 440 * 2 ** ((m - 69) / 12)
# D minor, calm cycle: Dm - Bb - Gm - A (each ~7 s), four voices (bass, tenor, alto, soprano)
CH = [[38, 57, 62, 65], [34, 58, 62, 65], [43, 58, 62, 67], [45, 57, 61, 64]]
DUR, XF = 7.0, 2.2
out = np.zeros(N)
k = 0; start = -XF / 2
while start < T:
    notes = CH[k % len(CH)]; a0, a1 = start, start + DUR + XF
    i0, i1 = max(0, int(a0 * SR)), min(N, int(a1 * SR))
    if i1 > i0:
        tt = t[i0:i1]; q = (tt - a0) / (a1 - a0)
        env = np.clip(np.minimum((tt - a0) / XF, (a1 - tt) / XF), 0, 1); env = 0.5 - 0.5 * np.cos(np.pi * env)
        for vi, m in enumerate(notes):
            f0 = hz(m)
            for d in (-0.06, 0.0, 0.07):  # three singers per part, slightly detuned (chorus)
                vib = 1 + 0.004 * np.sin(2 * np.pi * (4.6 + rs.uniform(-0.4, 0.4)) * tt + rs.uniform(0, 6)) * np.clip((tt - a0) / 1.5, 0, 1)
                f = f0 * 2 ** (d / 12) * vib
                ph = 2 * np.pi * np.cumsum(f) / SR + rs.uniform(0, 6)
                sig = np.zeros_like(tt)
                for h in range(1, 13):
                    if f0 * h > 3500: break
                    sig += np.sin(h * ph) * fgain(f0 * h) / h ** 1.2
                out[i0:i1] += sig * env * (0.55 if vi == 0 else 0.35) * (1 + 0.15 * np.sin(2 * np.pi * 0.11 * tt + vi))
    start += DUR; k += 1
# per-scene intensity, smoothed
lev = cfg.get("music_level", {}); e = np.zeros(N)
for s in TL["scenes"]:
    a, b = int(s["start"] * SR), int((s["start"] + s["dur"]) * SR); e[a:b] = lev.get(s["id"], 0.6)
kk = int(1.5 * SR); cs = np.concatenate([[0.0], np.cumsum(e)]); i = np.arange(N)
e = (cs[np.clip(i + kk // 2, 0, N)] - cs[np.clip(i - kk // 2, 0, N)]) / kk
out *= e
out *= np.clip(np.minimum(t / 0.4, (T - t) / 1.0), 0, 1)
out /= np.abs(out).max() + 1e-9; out *= 0.6
st = np.stack([out, np.roll(out, 220)], 1)
with wave.open(os.path.join(ep, "music.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes())
print("music (voices only) ok")
