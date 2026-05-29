# Learn Hiragana & Katakana

Lightweight client-side app to practice Hiragana and Katakana. The repository uses a simplified structure: site files are at the repository root with static assets organized under `css/` and `script/` subfolders.

## Features
- Quiz (type romaji for shown kana)
- Kana tables (Hiragana & Katakana)
- Flash cards
- Memory game (5×5 grid)

## Quick start (static preview)

Serve the repository root (contains the site files) locally — no Node server required:

```bash
npx http-server . -p 3030
# or
npx serve . -p 3030
```

Open http://localhost:3030 in your browser.

## Optional: run with Node (if `server.js` exists)

If you prefer to run the optional Express server (some forks may include it), you can start it with:

```bash
node server.js
```

The static site works independently of any server and is the recommended deployment for GitHub Pages or Cloudflare Pages.

## Project layout

- `/` — Static site assets
  - `index.html` — Single-page UI
  - `css/style.css` — Styles
  - `script/data.js` — Kana arrays used by the client
  - `script/app.js` — Client logic (quiz, tables, flashcards, memory game)

## Deploy

- GitHub Pages: set Pages source to the `main` branch and the repository root (`/`), or use the `gh-pages` branch. Alternatively copy files to a `/docs` folder and select that as the Pages source.
- Cloudflare Pages: configure the project to publish the repository root (`/`) (no build step), or point the publish directory to a specific folder if desired.

## License
MIT
