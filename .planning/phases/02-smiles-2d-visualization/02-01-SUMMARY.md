---
phase: 02-smiles-2d-visualization
plan: 01
subsystem: ui
tags: [react, vitest, jsdom, rdkit, fixtures]

requires:
  - phase: 01-foundation
    provides: React card UI and conformer-shaped local fixture boundary
provides:
  - Deterministic Vitest/jsdom frontend test harness
  - Pinned local RDKit dependency graph
  - Typed catalog of ten unique named drug-like compounds
affects: [02-smiles-2d-visualization, rdkit-adapter, molecule-card]

tech-stack:
  added: ["@rdkit/rdkit 2025.3.4-1.0.0", "Vitest 0.34.6", "jsdom 22.1.0", "React Testing Library"]
  patterns: [fixed local molecule catalog, non-watch frontend tests]

key-files:
  created:
    - frontend/src/test/setup.ts
    - frontend/src/data/mockMolecules.test.ts
  modified:
    - frontend/package.json
    - frontend/package-lock.json
    - frontend/vite.config.ts
    - frontend/src/types/molecule.ts
    - frontend/src/data/mockMolecules.ts

key-decisions:
  - "Preserve the Phase 1 conformer-shaped boundary while marking Phase 2 fixtures as having no provided geometry."
  - "Use exact dependency versions and a Vitest run script that always exits."

patterns-established:
  - "Catalog records are local typed constants exposed through getMockConformerSet."
  - "Frontend tests use jsdom, jest-dom matchers, and automatic React cleanup."

requirements-completed: [P2-DATA, P2-ASSET, P2-SCOPE]

duration: 6min
completed: 2026-07-06
status: complete
---

# Phase 2 Plan 01: Test Foundation and Local Catalog Summary

**Pinned local RDKit/test tooling and a typed ten-compound drug-like catalog with deterministic invariant coverage**

## Performance

- **Duration:** 6 min after dependency installation was unblocked
- **Completed:** 2026-07-06T09:21:27Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Added an exact, lockfile-pinned RDKit runtime package and version-compatible test dependencies with no CDN or backend boundary.
- Configured non-watch Vitest/jsdom testing with DOM matchers and cleanup.
- Replaced the four-record fixture set with ten unique, familiar named drug-like compounds and tests enforcing its invariants.

## Task Commits

1. **Task 1: Install pinned RDKit and Wave 0 test tooling** — none (user-managed commits)
2. **Task 2: Define and enforce the ten-compound local catalog** — none (user-managed commits)

**Plan metadata:** none (user-managed commits)

## Files Created/Modified

- `frontend/package.json` and `frontend/package-lock.json` — Exact RDKit and test dependency graph plus non-watch test command.
- `frontend/vite.config.ts` — Vitest jsdom and setup-file configuration.
- `frontend/src/test/setup.ts` — jest-dom matchers and React cleanup.
- `frontend/src/types/molecule.ts` — Required molecule display name.
- `frontend/src/data/mockMolecules.ts` — Ten-record local catalog behind the existing loader.
- `frontend/src/data/mockMolecules.test.ts` — Catalog completeness and uniqueness coverage.

## Decisions Made

- Geometry fields remain present for compatibility but are empty and explicitly identified as not provided, avoiding false generated-geometry claims.
- Stable lowercase compound ids and fixed local SMILES values are used without external identity lookup.

## Deviations from Plan

None — plan executed as specified after the user completed the approved dependency installation.

## Issues Encountered

- npm registry access was unavailable to the executor. The user verified and installed the exact approved packages, after which manifest, lockfile, and local module versions were confirmed.

## User Setup Required

None — dependencies are recorded in the lockfile.

## Next Phase Readiness

- Plan 02-02 can build the isolated RDKit loader and depiction component against this catalog and test harness.
- Targeted tests and the production frontend build are green.

---
*Phase: 02-smiles-2d-visualization*
*Completed: 2026-07-06*
