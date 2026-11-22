# Ghassen Oueslati — Promo Reel

27-second motion reel promoting ghassen-oueslati.com, built in Remotion with imagery from the live site.

## Deliverables (`out/`)
| File | Use |
|---|---|
| `ghassen-oueslati-reel-9x16-instagram.mp4` | Instagram Reels / TikTok / Stories (1080×1920, silent AAC track — add music in-app) |
| `ghassen-oueslati-reel-16x9-youtube.mp4` | YouTube, LinkedIn, Behance (1920×1080) |
| `ghassen-oueslati-reel-16x9-web.mp4` | Website hero/background loop (1600w, no audio, faststart, 2.6 MB) |
| `ghassen-oueslati-reel-poster.jpg` | `poster=` image for the web video |

## Storyboard (30 fps, cuts on a 15-frame / ~120 BPM grid)
1. **Hook** 0–3s — silver gown, "Explore. *Create.* Inspire."
2. **Montage** 3–7s — Couture · Campaign · Beauty · Editorial, flash cuts
3. **Identity** 7–10.5s — logo mark draws, name reveal, disciplines
4. **Range** 10.5–14s — hospitality × fashion split, "One eye, every discipline"
5. **Proof** 14–17s — 12+ years · 300+ projects · 50+ brands (count-up)
6. **Trust** 17–20s — client roster
7. **Director** 20–23s — "From the first idea to the final frame."
8. **CTA** 23–27.5s — "Start your next story." · ghassen-oueslati.com

## Edit / re-render
```bash
npm install
npm run studio   # live preview
npm run render
```
Swap images in `public/`, copy in `src/Reel.tsx`, scene lengths in `TIMELINE`.
