# blueat-web

The blueat.me homepage: a small terminal-style page where visitors type commands (`/about`, `/projects`, `/sffe`, `/sciuro`, `/contact`, `/lang`, `/help`, `/clear`, `/exit`) or plain questions, styled after a CLI coding agent: tool lines, streamed replies, choice dialogs and a first-visit demo.

- Copy and replies for both languages live in `src/content.js`; each reply is a list of tool / say / ask steps.
- The pixel mascot (`src/lib/mascotForms.js`) changes form with each reply, dozes when left alone, and has a few hidden forms (`meow`, `magic`, `squirrel`, rare Hangul; `/sciuro` also turns it into a squirrel). `COMMAND_FORMS` in `src/components/Terminal.jsx` maps replies to forms.
- `npm run dev` for local development.
- `npm run build` writes the site to `docs/`, which GitHub Pages serves. Commit `docs/` after building. Files in `public/` (CNAME, icons, share image) are copied there as-is.
- Fonts: `public/fonts/` holds Monatendard split into common (`Monatendard-*.woff2`) and on-demand (`*-ext.woff2`) files. Rebuild them with `python3 scripts/build-fonts.py` (needs `pip install fonttools brotli`).
