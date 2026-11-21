# The Archive of Intelligence

Santheesh S’s cinematic engineering portfolio. This is a standalone Next.js App Router application with a shared React Three Fiber canvas, an original procedural world, and seven prerendered project case studies.

## Run locally

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:3100. To preview the build with production settings, run `npm run build` and then `npm run start`.

## Verify

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Playwright uses installed Google Chrome. It checks project routing, keyboard access, axe rules, WebGL context loss and recovery, reduced motion, and the portfolio at widths from 320 to 1920 px. To save visual evidence while the production server runs, use `node scripts/capture.mjs test-results/visual`. The optional `--plates` flag updates the compressed fallback scene plates. Use `--motion` to record the camera journey as a WebM.

## How it works

- `src/components/world/` contains the architecture, instanced masonry, bronze instruments, camera, and quality settings.
- `src/components/journey.tsx` connects document scrolling to the camera and keeps project navigation in semantic HTML.
- `src/content/` contains the profile and approved project roster. The case studies link to their repository documentation for engineering evidence.
- `public/plates/` contains stills captured from the actual WebGL scenes. Browsers without WebGL and visitors with reduced-motion enabled use these images and the complete HTML portfolio.

The homepage opens at the frontier. The road leads to the observatory, Creator Hall, armillary chamber, and Hall of Precision. After the seven project exhibits, the route continues through the Library of Knowledge and Astronomer’s Terrace to the final gate. The bottom navigation provides shortcuts through the journey, and Work opens the case studies directly.

Local Chrome verification uses software WebGL in this environment. The frame rate and interaction latency observed there can differ from results on a hardware-accelerated browser. The case-study images show exhibits from the 3D archive.
