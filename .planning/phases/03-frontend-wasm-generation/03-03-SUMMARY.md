---
phase: 03-frontend-wasm-generation
plan: 03
subsystem: frontend UI
tags: [react, vite, vitest, browser-local-generation]
requires:
  - phase: 03-frontend-wasm-generation
    provides: Sanitized adapter status and recorded blocked runtime proof
provides:
  - Accessible local-generator-unavailable state without a fallback route
  - Preserved mock-card browsing while generation is unavailable
  - Phase 4 runtime and geometry blocker handoff
affects: [Phase 4, browser runtime proof]
tech-stack:
  added: []
  patterns: [proof-gated unavailable UI, local-only sanitized status]
key-files:
  created: [.planning/phases/03-frontend-wasm-generation/03-PHASE4-HANDOFF.md]
  modified: [frontend/src/App.tsx, frontend/src/App.test.tsx, frontend/src/styles/App.css]
key-decisions:
  - "Render only the documented unavailable state until the manually supplied ONNX assets complete a real browser proof."
  - "Keep the mock-card picker usable and add neither a fabricated success flow nor a network fallback."
patterns-established:
  - "Blocked browser-local runtime states disable generation while retaining unrelated mock exploration."
requirements-completed: [P3-04, P3-05, P3-06, P3-07, P3-08, P3-09]
duration: 4min
completed: 2026-07-28
status: complete
---

# Phase 03 Plan 03: Proof-Gated Unavailable UI Summary

**An accessible, disabled browser-local generation control now explains the missing-model blocker while retaining the existing mock molecule-card browsing flow.**

## Performance

- **Duration:** 4 min
- **Completed:** 2026-07-28T07:02:59Z
- **Tasks:** 2 completed under the recorded proof-blocked branch
- **Files modified:** 4

## Accomplishments

- Added the approved `Local generator unavailable` status with its local-only explanation and a disabled 44px `Generate conformers` control.
- Kept the existing mock-card picker available and covered that behavior with a focused App test.
- Recorded the exact missing-weight blocker, future runtime configuration, MolBlock-first contract, ordering checks, filtering semantics, and no-viewer decision for Phase 4.

## Validation

- `cd frontend && npm test -- App.test.tsx Molecule2DPreview.test.tsx` — passed (13 tests).
- `cd frontend && npm test` — passed (29 tests).
- `cd frontend && npm run build` — passed.
- `git diff --check` — passed.

## Task Commits

Commits were intentionally omitted by execution instruction. No Plan 03 implementation files were staged or committed.

## Files Created/Modified

- `frontend/src/App.tsx` — renders the proof-blocked local-generation status and disabled primary action beside the stable mock-card flow.
- `frontend/src/App.test.tsx` — asserts unavailable status copy, disabled generation, and usable mock browsing.
- `frontend/src/styles/App.css` — adds the compact neutral status panel and disabled 44px action styling.
- `.planning/phases/03-frontend-wasm-generation/03-PHASE4-HANDOFF.md` — documents the browser-runtime blocker and geometry prerequisites for Phase 4.

## Decisions Made

- Kept the unavailable state static and local because the two manually acquired model assets are absent; probing or invoking the adapter cannot produce a valid result in this checkout.
- Did not modify `MoleculeCard` or `Molecule2DPreview`: generated conformers do not exist in the blocked branch, so optional-SMILES fallback behavior is not exercised or expanded.

## Deviations from Plan

### Proof-gated execution

**1. [Recorded runtime blocker] Deferred all successful-generation UI states and generated-card mapping.**

- **Found during:** Task 1: Add proof-gated accessible generation states and card handoff.
- **Issue:** `frontend/public/models/egnn_chembl_15_39.onnx` and `frontend/public/models/adj_mat_seer_chembl_15_39.onnx` are unavailable, preventing a real browser request and any valid normalized MolBlock result.
- **Resolution:** Implemented only D-08's approved unavailable state. No fake results, retry that cannot succeed, adapter invocation, server route, alternate runtime, or 3D viewer was added.
- **Verification:** Focused UI tests, complete frontend tests, and production build pass.

**Total deviations:** 0 auto-fixes; 1 planned proof-gate deferral.
**Impact on plan:** The implemented branch exactly preserves the recorded runtime safety boundary without expanding scope.

## Issues Encountered

- The two ignored, manually downloaded ONNX model weights remain absent. This is the sole blocker to browser-local generation and must be cleared through the manual served-browser proof in `03-RUNTIME-PROOF.md`.

## Known Stubs

None. The disabled generation action is intentional because the runtime proof is blocked; it does not present placeholder output as a successful conformer result.

## Next Phase Readiness

- Phase 4 has a precise blocker record but cannot select or validate a viewer against generated geometry until both model weights are supplied and the browser proof records a representative MolBlock.
- The UI must remain browser-local; no backend/API fallback is authorized when the proof is retried.

## Self-Check: PASSED

- Confirmed all four task artifacts exist.
- Confirmed there are no task commits by explicit instruction; no Plan 03 implementation files were staged.
- Confirmed no stub markers in the Plan 03 implementation files and no whitespace errors.
