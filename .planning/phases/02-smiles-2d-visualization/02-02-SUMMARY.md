---
phase: 02-smiles-2d-visualization
plan: 02
subsystem: ui
tags: [rdkit, wasm, react, svg, vitest]

requires:
  - phase: 02-smiles-2d-visualization
    plan: 01
    provides: Pinned RDKit dependency and frontend test harness
provides:
  - BASE_URL-aware same-origin RDKit JS/WASM loader
  - Resource-safe SMILES-to-SVG adapter
  - Accessible race-safe 2D preview states with retry
affects: [02-03, molecule-card]

tech-stack:
  added: []
  patterns: [resettable singleton loader, disposable WASM objects, stale async result guard]

key-files:
  created:
    - frontend/public/rdkit/RDKit_minimal.js
    - frontend/public/rdkit/RDKit_minimal.wasm
    - frontend/src/lib/rdkit.ts
    - frontend/src/lib/rdkit.test.ts
    - frontend/src/components/Molecule2DPreview.tsx
    - frontend/src/components/Molecule2DPreview.test.tsx
    - frontend/src/styles/Molecule2DPreview.css
  modified:
    - frontend/package.json

key-decisions:
  - "Copy the exact locked RDKit distribution assets before every production build."
  - "Expose only success/invalid depiction results; keep Emscripten globals and disposal inside the adapter."

requirements-completed: [P2-RENDER, P2-STATES, P2-ASSET, P2-SCOPE]

duration: 4min
completed: 2026-07-06
status: complete
---

# Phase 2 Plan 02: RDKit Depiction Boundary Summary

**Local RDKit JS/WASM loading, disposable SVG depiction, and resilient React preview states**

## Performance

- **Duration:** 4 min
- **Completed:** 2026-07-06
- **Tasks:** 2
- **Files created/modified:** 8

## Accomplishments

- Added deterministic copying of the exact pinned RDKit JavaScript and WASM files into same-origin public assets before production builds.
- Implemented a shared, retryable loader plus a narrow depiction adapter that maps invalid parsing and always deletes temporary RDKit molecules.
- Added fixed loading, safe invalid/error fallback, functional retry, and stale-result protection with focused unit/component coverage.

## Task Commits

1. **Task 1: Add local RDKit assets and resource-safe adapter** — none (user-managed commits)
2. **Task 2: Implement depiction loading, fallback, retry, and race safety** — none (user-managed commits)

**Plan metadata:** none (user-managed commits)

## Files Created/Modified

- `frontend/package.json` — deterministic RDKit asset-copy and prebuild scripts.
- `frontend/public/rdkit/RDKit_minimal.js` and `RDKit_minimal.wasm` — exact local package distribution assets.
- `frontend/src/lib/rdkit.ts` and `rdkit.test.ts` — singleton lifecycle, parse/result boundary, disposal, retry, and asset-path tests.
- `frontend/src/components/Molecule2DPreview.tsx` and its test — isolated SVG sink and loading/invalid/error/retry/race states.
- `frontend/src/styles/Molecule2DPreview.css` — fixed artwork frame, centered depiction, and fallback presentation.

## Decisions Made

- Failed script or module initialization removes the failed script, clears both caches, and clears the initializer global so retry performs a fresh same-origin load.
- Both null parser results and parser exceptions map to the inert invalid-SMILES result; SVG generation failures still reject while molecule disposal runs in `finally`.
- Raw SVG insertion exists only in `Molecule2DPreview` and receives only adapter-produced RDKit markup.

## Deviations from Plan

- **[Rule 2 - Missing critical functionality]** Added parser-exception mapping in addition to null-result mapping because RDKit parsing can report invalid input either way.

## Issues Encountered

- An initially unresolved promise in the loading-state test delayed Vitest worker completion; the test now resolves its deferred operation after asserting loading behavior.

## User Setup Required

None. The pinned package and copied runtime assets are already present in the recorded dependency/build flow.

## Verification

- `cd frontend && npm test -- --run` — 3 files, 14 tests passed.
- `cd frontend && npm run build` — passed.
- Both `dist/rdkit/RDKit_minimal.js` and `dist/rdkit/RDKit_minimal.wasm` are non-empty.
- `git diff --check` — passed.

## Next Phase Readiness

- Plan 02-03 can replace the placeholder viewer with `Molecule2DPreview`, wire loading state to selection, and perform the real production-browser smoke check.
- Plan 02-03 has not been started.

---
*Phase: 02-smiles-2d-visualization*
*Completed: 2026-07-06*
