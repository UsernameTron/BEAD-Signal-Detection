# Current Task: Decompose Monolithic React SPA into Modular Vanilla JS Architecture
**Branch**: `feat/modular-architecture`
**Started**: 2026-02-26

## Context

The deployed site at `https://beadintelplatform.netlify.app/` is a single `index.html` file (~80KB) containing:
- React 18 + ReactDOM 18 + Babel Standalone (all via unpkg CDN)
- All 7 views as inline React components
- All CSS as inline styles (CSS-in-JS)
- All data hardcoded as JS arrays/objects
- Google Fonts (Plus Jakarta Sans, JetBrains Mono)

Target architecture (per CLAUDE.md Project-Specific Rules):
- Zero-dependency vanilla HTML/CSS/JS SPA — no React, no frameworks, no npm
- Module contract: `window.modules[id] = { init(container, panel), destroy() }`
- Lazy-load pattern: CSS/JS injected on demand via `ctg-intel-platform/js/app.js`
- Data layer: `ctg-intel-platform/js/data.js`
- Shared components: `ctg-intel-platform/js/shared-components.js`
- Design tokens: `ctg-intel-platform/css/obsidian.css`
- IIFEs with `'use strict'` — no import/export

## Plan

### Phase 0: Secure Current Deployment
- [ ] 0.1 Initialize git repository in project root
- [ ] 0.2 Create `.gitignore` (exclude `.DS_Store`, `.env`, `node_modules`)
- [ ] 0.3 Commit current working files as baseline (`main` branch)
- [ ] 0.4 Copy `index.html` → `index.html.backup` as additional safety net
- [ ] 0.5 Create `feat/modular-architecture` branch

### Phase 1: Project Scaffolding
- [ ] 1.1 Create directory structure:
  ```
  ctg-intel-platform/
  ├── index.html          (new SPA shell)
  ├── css/
  │   ├── obsidian.css    (design tokens + global styles)
  │   ├── app.css         (shell/nav/layout styles)
  │   ├── command-center.css
  │   ├── pipeline.css
  │   ├── strain-sim.css
  │   ├── financial.css
  │   ├── agents.css
  │   ├── compete.css
  │   └── roadmap.css
  └── js/
      ├── app.js          (module loader, nav, lazy-load)
      ├── data.js         (all data arrays/objects)
      ├── shared-components.js (reusable UI helpers)
      ├── command-center.js
      ├── pipeline.js
      ├── strain-sim.js
      ├── financial.js
      ├── agents.js
      ├── compete.js
      └── roadmap.js
  ```
- [ ] 1.2 Update `_redirects` to point `/*` → `/ctg-intel-platform/index.html`
- [ ] 1.3 Update `netlify.toml` publish dir if needed (currently `.`)

### Phase 2: Core Infrastructure Files
- [ ] 2.1 `css/obsidian.css` — Extract all design tokens (colors, typography, spacing) as CSS custom properties from the React `const c = {...}` object
- [ ] 2.2 `css/app.css` — Shell layout: sidebar nav, main content area, panel overlay
- [ ] 2.3 `js/data.js` — Extract `PROSPECTS`, `INTEL_FEED`, `COMPETITORS`, scoring functions (`calcScore`, `fmt`, `fmtN`) into `window.DATA`
- [ ] 2.4 `js/shared-components.js` — Extract reusable components: `Label`, `Metric`, `Badge`, `Card`, `MiniBar`, `RadarChart` as DOM-creating functions on `window.shared`
- [ ] 2.5 `js/app.js` — Module loader: sidebar nav, lazy-load CSS/JS per module, module lifecycle (`init`/`destroy`), active state tracking
- [ ] 2.6 `ctg-intel-platform/index.html` — Minimal HTML shell: loads fonts, obsidian.css, app.css, data.js, shared-components.js, app.js

### Phase 3: View Modules (one per file, each self-contained)
- [ ] 3.1 `command-center.js` + `command-center.css` — Dashboard: hero metrics grid, sortable prospect table, intel feed, BEAD program bars, tech mix breakdown
- [ ] 3.2 `pipeline.js` + `pipeline.css` — Prospect list with card layout, tier filtering, sorting, slide-out detail panel with radar chart
- [ ] 3.3 `strain-sim.js` + `strain-sim.css` — 6-slider strain simulator with 4 presets, real-time radar chart + composite score
- [ ] 3.4 `financial.js` + `financial.css` — ROI calculator with 4 input sliders, computed revenue/ROI metrics
- [ ] 3.5 `agents.js` + `agents.css` — AI agent architecture display (5 agents) with animated 10-step simulation
- [ ] 3.6 `compete.js` + `compete.css` — Competitive landscape: 4 competitors, threat levels, white space, ISPN positioning
- [ ] 3.7 `roadmap.js` + `roadmap.css` — 4-phase deployment plan with task lists, effort estimates, deliverables

### Phase 4: Integration & Polish
- [ ] 4.1 Wire all 7 modules into `app.js` nav config
- [ ] 4.2 Verify lazy-loading: each module's CSS/JS loads only when tab clicked
- [ ] 4.3 Verify `destroy()` cleanup: no orphaned intervals/timeouts across tab switches
- [ ] 4.4 Cross-module data consistency: all 7 modules read from `window.DATA`
- [ ] 4.5 Responsive behavior: ensure no horizontal overflow, scrollable content areas

### Phase 5: Verification (all must pass)
- [ ] 5.1 Open `ctg-intel-platform/index.html` locally — all 7 modules render correctly
- [ ] 5.2 No console errors on any module
- [ ] 5.3 Rapid tab cycling (all 7 modules, 3 full cycles) — no timer leaks
- [ ] 5.4 Visual parity check: each module matches deployed React version
- [ ] 5.5 Confirm: no React, no Babel, no CDN dependencies (except Google Fonts)
- [ ] 5.6 Confirm: all JS files use IIFE + `'use strict'`
- [ ] 5.7 Confirm: all modules register on `window.modules` with `init`/`destroy`
- [ ] 5.8 Confirm: `_redirects` and `_headers` work for Netlify deployment

## Verification
- [ ] Linting passes (manual review — no linter configured)
- [ ] No regressions: deployed React version remains intact on `main` branch
- [ ] Error handling on all new paths
- [ ] No TODO/FIXME left behind
- [ ] Diff reviewed: only intended files changed

## Results
<!-- Add after completion -->

## Session Handoff
<!-- Add if task spans multiple sessions -->
