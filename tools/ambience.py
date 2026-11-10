"""Natural ambience bed (no music): wind, crickets, drips, fire, room tone, rain, sea, thunder, hammer knocks.
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

# rain: band-limited noise with gusts
rain = lowpass(rs.standard_normal(N), 0.35) - lowpass(rs.standard_normal(N), 0.02)
rain /= np.abs(rain).max(); rain *= 0.75 + 0.25 * np.sin(2 * np.pi * 0.11 * t) ** 2
# sea: deep swells
sea = lowpass(rs.standard_normal(N), 0.006); sea /= np.abs(sea).max()
sea *= 0.45 + 0.55 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.12 * t + np.sin(2 * np.pi * 0.031 * t) * 2))
# thunder: rare low rumbles
th = np.zeros(N)
for start in np.arange(1.5, TL["total"], 6.5):
    a = int((start + rs.uniform(0, 3)) * SR); L = int(3.5 * SR)
    if a + L < N:
        tt = np.arange(L) / SR
        th[a:a + L] += rs.standard_normal(L) * np.exp(-tt * 1.3) * (1 - np.exp(-tt * 30))
th = lowpass(th, 0.004); th /= max(1e-9, np.abs(th).max())
# hammer on wood: short knocks
hm = np.zeros(N)
for start in np.arange(0, TL["total"], 0.85):
    a = int((start + rs.uniform(0, 0.25)) * SR); L = int(0.09 * SR)
    if a + L < N:
        tt = np.arange(L) / SR
        hm[a:a + L] += (np.sin(2 * np.pi * 180 * tt) + 0.5 * np.sin(2 * np.pi * 410 * tt)) * np.exp(-tt * 60) * rs.uniform(0.5, 1)

# per-scene gains come from script.json "ambience" (falls back to the episode-1 mix)
cfg = json.load(open(os.path.join(ep, "script.json"), encoding="utf-8"))
G = cfg.get("ambience") or {
    "wind": {"canaan": .5, "dream": .15, "well": .45, "shirt": .25, "caravan": .7, "palace": 0, "prison": .12,
             "king": .35, "brothers": .8, "forgive": .3, "reunion": .35, "death": .45, "outro": .15},
    "crickets": {"dream": .5, "shirt": .45, "death": .25, "outro": .2},
    "drips": {"well": 1.0, "prison": .4, "companions": .4, "forgotten": .4},
    "fire": {"shirt": 1.0},
    "room": {"palace": 1.0, "accuse": .8, "women": .8, "prison": .8, "interpret": .8, "king": .3,
             "release": .4, "brothers": .3, "reunion": .4}}
SRC = {"wind": (wind, 0.11), "crickets": (cr, 0.025), "drips": (dr, 0.08), "fire": (fc, 0.05), "room": (room, 0.05),
       "rain": (rain, 0.12), "sea": (sea, 0.16), "thunder": (th, 0.35), "hammer": (hm, 0.06)}
mixd = np.zeros(N)
for name, gains in G.items():
    sig, lvl = SRC[name]
    mixd += sig * lvl * env_for(gains)
fade = np.minimum(1, np.minimum(t / 1.5, (TL["total"] - t) / 2.0).clip(0))
mixd *= fade
st = np.stack([mixd, np.roll(mixd, 300)], 1)  # light stereo width
pcm = (np.clip(st, -1, 1) * 32767).astype(np.int16)
with wave.open(os.path.join(ep, "ambience.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ambience ok")
