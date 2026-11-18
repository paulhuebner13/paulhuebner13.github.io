# One GitHub Pages website — two independent apps

Deploy this repository as **paulhuebner13.github.io** in GitHub Pages (branch `main`, root `/`).

- `https://paulhuebner13.github.io/` — landing page
- `https://paulhuebner13.github.io/darts/` — copied Darts app
- `https://paulhuebner13.github.io/switch-party/` — new tournament app

## Setup

1. **Before touching the old Darts repo**, open it and export a backup of your data. Don't clear browser data. Keep the original repository as a backup.
2. Create a **public** repository named `paulhuebner13.github.io` under account `paulhuebner13`, if it doesn't exist already. If it does exist, **merge** these folders without overwriting other content.
3. Upload the **contents** of this folder, so `index.html`, `darts/`, and `switch-party/` sit at the repository root. GitHub's Upload files may be unreliable for folders; using Git locally is recommended.
4. Put your twelve **square 1:1 PNG** files in `switch-party/icons/` with the *exact* English filenames in `switch-party/games.js`. Their pixel dimensions need not be fixed.
5. Settings → Pages → Deploy from a branch → `main` / `(root)` → Save. Wait for deployment, then test the URLs above.
6. The **old `darts` repository may still publish the same URL**, so after you have verified the new deployment, disable GitHub Pages in the old `darts` repo to avoid conflicting deployments. **Do not delete the old repository.**

## Existing Darts saved data

- The `darts/` directory is copied from the supplied Darts ZIP; its `.git` directory is omitted.
- Its JavaScript and relative paths stay in the same subpath as before (`/darts/`). Browser `localStorage` belongs to the **origin** (`https://paulhuebner13.github.io`) rather than the repository, so the same URL and hostname should keep the same local records in the same browser profile. It is **not a portable backup**: save Darts JSON first, and do not clear browser storage.
- The Darts service worker is scoped to `/darts/`, with an extra safety check added so it does not intercept `/switch-party/` requests and only cleans up its own `darts-suite-*` caches. Older service workers may persist briefly until the browser updates them.
- The existing Supabase configuration file is included exactly as supplied. Confirm that your live repo has the correct current configuration before replacing anything; **never put service-role secrets** in client-side files.
- The Darts data export may not cover all distinct mini-game stores (Cricket, 501, Foxhunt). Keeping the URL and browser data intact matters.

## Upload via Git locally (PowerShell)

```powershell
cd path\to\paulhuebner13.github.io
git init
git branch -M main
git add .
git commit -m "Create shared game site"
git remote add origin https://github.com/paulhuebner13/paulhuebner13.github.io.git
git push -u origin main
```

If GitHub already has this repo or has commits, **clone it first** and merge the downloaded contents into it instead of force-pushing.

## Phone installation
Open `/darts/` and `/switch-party/` separately and use your browser’s Add to Home Screen / Install command on each page. Switch Party has its own scoped manifest and service worker.
