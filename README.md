# Saif Ul Rehman — Portfolio Introduction (Final)

## Files
- `index.html` — responsive, deployment-ready intro experience.
- `office-panorama.jpg` — optimized wide office background used by the page.

## Preview locally
Keep both files in the same directory and open `index.html` in a modern browser.
For a production-like local preview, run a static server from this folder:
- Python: `python -m http.server 8000`
- Then open `http://localhost:8000`

## Deploy
Upload `index.html` and `office-panorama.jpg` together to the same folder/path on your static host (Netlify, Vercel static output, GitHub Pages, or your existing website host). No build step or dependencies are required.

## Behavior
- Starts automatically with the introduction.
- A meeting notification appears after about 4.3 seconds.
- A closing invitation appears after about 8 seconds.
- Sound is opt-in; click “Enable sound” to allow the original two-note notification chime.
- “Replay” restarts the story; “Skip” goes to the portfolio invitation.
- Portfolio button links to https://saifulrehman.site.
- Respects reduced-motion preferences and includes mobile layout rules.

## Final note
This is a polished wide-scene web animation with camera-pan transitions and animated UI overlays. The supplied illustration is a single panorama; the character's typing, turning, and walking are suggested through scene framing and overlays, not true skeletal/frame-by-frame character animation.
