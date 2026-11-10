"""Natural ambience bed (no music): wind, night crickets, dripping water, fire crackle, room tone.
Writes <ep>/ambience.wav following the scene timeline.  Usage: python3 tools/ambience.py episodes/01-yusuf"""
import json, os, sys, wave
import numpy as np

ep = sys.argv[1]
TL = json.load(open(os.path.join(ep, "timeline.json")))
SR = 44100
N = int(TL["total"] * SR) + SR
rs = np.random.default_rng(7)
t = np.arange(N) / SR

def lowpass(x, a):  # one-pole low-pass (applied in the frequency domain)
    fc = a * SR / (2 * np.pi)
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / (1 + 1j * f / fc), n=len(x))

def env_for(gains):
    """Per-scene gain envelope with smooth 0.8 s cross-fades."""
    e = np.zeros(N)
    for s in TL["scenes"]:
        g = gains.get(s["id"], 0.0)
        a, b = int(s["start"] * SR), int((s["start"] + s["dur"]) * SR)
        e[a:b] = g
    k = int(0.8 * SR)  # moving average via cumulative sum (fast)
    cs = np.concatenate([[0.0], np.cumsum(e)])
    i = np.arange(N); lo = np.clip(i - k // 2, 0, N); hi = np.clip(i + k // 2, 0, N)
    return (cs[hi] - cs[lo]) / k

# wind: brown-ish noise, slowly modulated
white = rs.standard_normal(N)
wind = lowpass(white, 0.02); wind /= np.abs(wind).max()
wind *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t + 1) * np.sin(2 * np.pi * 0.023 * t)
# crickets: 4.4 kHz chirps in short trains
cr = np.zeros(N)
for start in np.arange(0, TL["total"], 0.9):
    for k in range(3):
        a = int((start + rs.uniform(0, 0.05) + k * 0.06) * SR); L = int(0.035 * SR)
        if a + L < N:
            cr[a:a + L] += np.sin(2 * np.pi * 4400 * np.arange(L) / SR) * np.hanning(L)
# water drips in the well
dr = np.zeros(N)
for start in np.arange(0, TL["total"], 1.7):
    a = int((start + rs.uniform(0, 0.8)) * SR); L = int(0.12 * SR)
    if a + L < N:
        tt = np.arange(L) / SR
        dr[a:a + L] += np.sin(2 * np.pi * (900 + 1400 * tt / 0.12) * tt) * np.exp(-tt * 45)
# fire crackle
fc = np.zeros(N)
for _ in range(int(TL["total"] * 9)):
    a = rs.integers(0, N - 400); fc[a:a + 300] += rs.standard_normal(300) * np.exp(-np.arange(300) / 40) * rs.uniform(0.2, 1)
fc += lowpass(rs.standard_normal(N), 0.05) * 0.4
room = lowpass(rs.standard_normal(N), 0.01); room /= np.abs(room).max()

W = {"canaan": .5, "dream": .15, "well": .45, "shirt": .25, "caravan": .7, "palace": 0, "prison": .12,
     "king": .35, "brothers": .8, "forgive": .3, "reunion": .35, "death": .45, "outro": .15}
C = {"dream": .5, "shirt": .45, "death": .25, "outro": .2}
D = {"well": 1.0, "prison": .4}
F = {"shirt": 1.0}
R = {"palace": 1.0, "prison": .8, "king": .3, "brothers": .3, "reunion": .4}
mixd = (wind * 0.11 * env_for(W) + cr * 0.025 * env_for(C) + dr * 0.08 * env_for(D)
        + fc * 0.05 * env_for(F) + room * 0.05 * env_for(R))
fade = np.minimum(1, np.minimum(t / 1.5, (TL["total"] - t) / 2.0).clip(0))
mixd *= fade
st = np.stack([mixd, np.roll(mixd, 300)], 1)  # light stereo width
pcm = (np.clip(st, -1, 1) * 32767).astype(np.int16)
with wave.open(os.path.join(ep, "ambience.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ambience ok")
