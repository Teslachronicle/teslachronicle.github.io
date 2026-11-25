# Tesla Chronicle Static Deploy Bundle

This directory (`site-deploy/`) is generated idempotently from `/workspace/tesla-chronicle/` by `../build_deploy.py` and deployed to GitHub Pages via `../deploy.sh`.

- **Target URL:** `https://samcbjoejoe.github.io/tesla-chronicle/`
- **Weekly share hub:** `https://samcbjoejoe.github.io/tesla-chronicle/weekly/share/`

## Included
- `index.html` and `timeline-v5.html` (Reader v5 with absolute Open Graph & Twitter card metadata)
- `events.json` and `reader-overlay.json` (verbatim from ledger)
- `v5/` (`v5.css`, `v5b.css`, `weekly.css`, `fonts/*.woff2`, freshly generated `ledger-lite.json`)
- `themes/` (`themes.css`, `themes.js`, `art/*.svg`)
- `media/web/` (optimized `640/1024/1600.webp` derivatives + `og-card.jpg`)
- `weekly/` (`issues.json`, `published.json`, `index.json`, `edition-*.html`, `sample-latest.html`)
- `weekly/share/` (`index.html`, `edition-*.html` with absolute `og:*`/`twitter:*` URLs, `assets/`, `cards/`)

## Excluded
- `app/` (local community server / accounts prototype)
- `events.json.bak-*`, `backup-*/`, `fact-packs/`, `filings/`, `fronts/`, `historian/`, `checks/`, `screens/`
- Raw high-resolution `media/*.jpg`, `media/*.png`, `media/candidates/`
- `weekly/build.py`, `weekly/share/build_share.py`, `weekly/share/build_elon_times.py`, `weekly/share/elon-times/`, `weekly/share/pdf/`
- Legacy HTML/Markdown working notes

## Redeploy after weekly updates
From `/workspace/tesla-chronicle/`:

```bash
./deploy.sh
```

Or rebuild the deploy folder only (without pushing):

```bash
python3 /workspace/tesla-chronicle/build_deploy.py --base-url https://samcbjoejoe.github.io/tesla-chronicle
```
