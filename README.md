# FISSION COMMAND

> A war-room dashboard for the global nuclear fleet. Yellow on black. Drag the globe. Dissect the reactors.

This is a **Vite + React + TypeScript + Three.js + react-globe.gl + react-router-dom** project.

---

## Quick start

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

---

## Deploy to GitHub Pages

The repo ships with `.github/workflows/deploy.yml` — push to `main` and it builds + publishes to GitHub Pages automatically. One-time setup:

1. Create a GitHub repo and push.
2. In the repo **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main` (or trigger the workflow manually from the Actions tab).

The site will be served at `https://<user>.github.io/<repo-name>/`. The workflow injects `VITE_BASE=/<repo-name>/` at build time so all assets resolve correctly under the subpath. The app uses `HashRouter`, so routes like `/#/reactors` work without a 404 fallback.

For a custom domain: drop a `CNAME` file in `public/` with your domain, set `VITE_BASE=/` (override in workflow), and configure DNS per GitHub's Pages docs.

---

## What's in here

A single dashboard. Fixed top bar, fixed left rail, fixed right rail, fixed module nav, fixed bottom ticker. The center panel routes between 9 modules:

| Key | Route | Module |
|---|---|---|
| 1 | `/`          | **COMMAND** — earth-textured globe with reactor pins, k-NN grid overlay, year scrubber, filter chips |
| 2 | `/reactors`  | **REACTORS** — yellow-on-black card gallery with generation filter → 3D dissection rig |
| 3 | `/fusion`    | **FUSION** — tokamak, NIF inertial ignition slider, and the public/private/ignited project frontier |
| 4 | `/fission`   | **FISSION** — Canvas2D chain reaction. Scenarios, draggable rods, SCRAM, live k-eff |
| 5 | `/sandbox`   | **SANDBOX** — fuel × coolant × moderator × enrichment band; verdict + 3D preview |
| 6 | `/grids`     | **GRIDS** — Balance the Grid sim. Generation mix sliders, live frequency gauge, demand curve, brownouts |
| 7 | `/carbon`    | **CARBON** — country mix → gCO₂/kWh ledger + emissions equivalents |
| 8 | `/roadmap`   | **ROADMAP** — pannable timeline, HYPE vs LIKELY, slip bars |
| 9 | `/glossary`  | **GLOSSARY** — full-screen searchable index of 51 nuclear terms with cross-links |

Press `1`–`9` to jump between modules. Drag the globe. Click any reactor pin to bring up its dossier. Click "LAUNCH SIMULATION" to enter the reactor model rig. Inside the rig, slide EXPLODE to separate parts, click any part for its label.

---

## Layout

```
cherenkov/cherenkov/
├── README.md
├── DESIGN.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── public/
│   └── world-countries.json          ← Natural Earth GeoJSON
└── src/
    ├── main.tsx                      ← BrowserRouter + 9 routes
    ├── App.tsx                       ← chrome shell + <Outlet />
    ├── routes/
    │   ├── Command.tsx               ← /        globe view
    │   ├── Reactors.tsx              ← /reactors gallery
    │   ├── ReactorModel.tsx          ← /reactors/:id  3D rig
    │   ├── Fusion.tsx                ← /fusion
    │   ├── Fission.tsx               ← /fission
    │   ├── Sandbox.tsx               ← /sandbox
    │   ├── Grids.tsx                 ← /grids
    │   ├── Carbon.tsx                ← /carbon
    │   ├── Roadmap.tsx               ← /roadmap
    │   └── Glossary.tsx              ← /glossary
    ├── components/
    │   ├── chrome/                   ← persistent dashboard chrome
    │   │   ├── TopBar.tsx            ← brand + DEFCON + UPLINK clock + LAT/LON + NODES + CLASSIFIED
    │   │   ├── LeftRail.tsx          ← MODULES + TOP ATOMIC NATIONS + LIVE ALERT LOG
    │   │   ├── RightRail.tsx         ← TARGET DOSSIER (context-sensitive)
    │   │   ├── ModuleNav.tsx         ← route switcher + 1-9 hotkeys
    │   │   └── Ticker.tsx            ← scrolling event marquee
    │   ├── cmd/                      ← SHARED CHASSIS PRIMITIVES (used by every route except Command)
    │   │   ├── RouteStage.tsx        ← bleed | scroll | pan stage wrapper
    │   │   ├── RouteHeader.tsx       ← mod tag + title + italic deck + boot pulse
    │   │   ├── FrameCorners.tsx      ← HUD label badges (idle digit jitter)
    │   │   ├── BootPulse.tsx         ← 400ms INITIALIZING flash on route mount
    │   │   ├── ControlPanel.tsx      ← glassmorphic floating box
    │   │   ├── Chip.tsx / ChipGroup.tsx  ← mono toggle chips + tone variants
    │   │   ├── RangeSlider.tsx       ← track + fill + thumb, supports colored bands
    │   │   ├── CTABar.tsx            ← anchored bottom action bar w/ gradient fade
    │   │   ├── StatGrid.tsx / NoteCard.tsx ← dossier-style stat cards & accent notes
    │   │   ├── Gauge.tsx             ← arc dial w/ warn/redline thresholds
    │   │   └── Sparkline.tsx         ← simple line/area chart
    │   ├── glyphs/
    │   │   └── reactor-glyphs.tsx    ← isometric SVG per reactor kind (PWR/BWR/CANDU…)
    │   ├── GlobeView.tsx             ← react-globe.gl wrapper
    │   ├── DissectableModel.tsx      ← Three.js viewer + EXPLODE slider
    │   ├── KbTerm.tsx                ← inline glossary link
    │   └── sections/
    │       └── Tokamak.tsx           ← (kept verbatim from prior build — load-bearing freeze)
    ├── data/                         ← reactors, SMRs, isotopes, KB, timeline, sandbox recipes, model manifests, fission-scenarios, fusion-projects
    ├── lib/
    │   ├── dashboard-ctx.ts          ← cross-route state (dossier focus, NODES, LAT/LON, pin overrides)
    │   ├── briefings.ts              ← per-route voice/copy (deck lines + alert one-liners)
    │   ├── uplink-clock.ts           ← live UTC clock + synthetic alert feed
    │   ├── reactor-parts.ts          ← primitive Three.js part builders
    │   ├── grid-network.ts           ← k-NN great-circle graph
    │   ├── geo.ts                    ← lat/lng helpers
    │   ├── three-scene.ts            ← small Three.js helper
    │   ├── fission-physics.ts        ← pure sim — neutrons, atoms, rods, k-eff, meltdown
    │   ├── fission-renderer.ts       ← pure canvas drawing (atoms / neutrons / rods / overlay)
    │   └── phantom-reactors.ts       ← synthesize pins from per-country overrides
    └── styles/
        ├── tokens.css                ← palette + sizing + fonts
        └── globals.css               ← viewport-fit body, grid layout, scanline
```

---
