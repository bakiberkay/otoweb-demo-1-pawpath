# otoweb demo — demo-1

Generated showroom produced by the otoweb factory. This repo is a self-contained Astro project; it builds and deploys without external workspace dependencies.

- **Theme:** `soft`
- **Schema version:** captured in `src/schema/index.ts`
- **Structural content:** `src/content/site.json` (rarely edited)
- **Editable content:** `src/content/editables.json` (edited via `/admin` — Decap CMS)

To run locally:

```
npm install
npm run dev
```

The deployed site is editable at `/admin` (Decap CMS, Netlify-Identity-backed). Edits commit to this repo and trigger a Netlify rebuild.
