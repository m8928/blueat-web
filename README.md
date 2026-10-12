# blueat-web

The blueat.me homepage: a small terminal-style page where visitors type commands (`/about`, `/projects`, `/sffe`, `/contact`, `/lang`) or plain questions.

- Copy and replies for both languages live in `src/content.js`.
- `npm run dev` for local development.
- `npm run build` writes the site to `docs/`, which GitHub Pages serves. Commit `docs/` after building. Files in `public/` (CNAME, icons, share image) are copied there as-is.
