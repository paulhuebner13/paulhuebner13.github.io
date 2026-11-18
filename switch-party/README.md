# Switch Party – tournament tracker

A static mobile-friendly tournament app for Nintendo Switch game nights.

## Features
- 2–4 players, individual names and 8 pastel colors
- 12 sports, exact local player count filtering (configurable in `games.js`)
- Square PNG tiles; grayscale when unselected, red X if unavailable
- Random or manual game order
- Fixed or ascending points; position points `(number of players - rank)` with last place receiving zero; ascending multiplies this by the game number
- Winner colors on the compact chronological game tracker
- Live leaderboard sorted by score
- Sequential ranking: pick all but the last player, who is assigned automatically
- Resume tournament and archive winners in browser `localStorage`
- Undo last result

## Add images
Copy your 12 square PNGs into `icons/` and use the exact names listed in `icons/README.txt`. Any pixel dimensions are fine as long as each picture is 1:1.

## GitHub Pages
1. Create public repository `switch-party` under your GitHub account.
2. Upload **the contents of this folder** to the repository root (`index.html`, `app.js`, `games.js`, `styles.css`, `icons/`).
3. In the repository, choose Settings > Pages > Build and deployment > Deploy from a branch; branch `main`, folder `/(root)`; Save.
4. Open `https://YOUR-USERNAME.github.io/switch-party/`.

**Do not move your existing Darts repository.** The two separate project repositories appear on paths of the same `github.io` domain.

## Test locally
From this folder, run `python -m http.server 8000` and visit `http://localhost:8000/`. (Opening HTML directly via file:// may also work but is less representative.)

## Storage and backups
Switch Party only saves on the current browser/device (localStorage key `switch-party-tournament-v1`), not in GitHub. Darts storage is separate and unchanged. This first release does not sync across devices.

## Notes
Some modes of team sports may not supply individual positions; the group needs to agree on individual rankings to score those games. Player counts were transcribed from the provided source and should be checked for the actual local mode you plan to use.
