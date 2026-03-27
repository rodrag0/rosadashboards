# rosadashboards

Rosa pitch demo dashboards built with React, TypeScript, and Vite.

## Routes

- `/` - Rosa Vision post-match analysis dashboard with replay, automatic highlights, shot counts, momentum, MVP, and heatmaps.
- `/match-demo` - Rosa Core HD + Vision live flow simulator with QR monitor state, mobile setup, live scoring controls, sponsor placements, and final recap.

## Assets

- Rosa brand assets are served from `public/assets` and `public/fonts`.
- The post-match replay uses the local demo clip in `public/media/rosa-vision-demo.mp4`.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Deploy

`vercel.json` rewrites every path to `index.html` so both routes work on Vercel as a single-page app.
