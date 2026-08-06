---
phase: 03-frontend-wasm-generation
plan: 02
subsystem: frontend runtime adapter
tags: [vite, vitest, mlconfgen, onnxruntime-web, unavailable-runtime]
requires:
  - phase: 03-frontend-wasm-generation
    provides: Retry-safe browser runtime boundary and the recorded missing-model proof blocker
provides:
  - Verified sanitized unavailable-runtime surface for the future React integration
  - Explicit deferral of normalized successful-generation behavior until manual model assets are proven
affects: [03-03, Phase 4]
tech-stack:
  added: []
  patterns: [proof-gated local runtime, sanitized unavailable status]
key-files:
  created: [03-02-SUMMARY.md]
  modified: []
key-decisions:
  - "Do not add GenerateRequest/GenerateResponse success behavior until the manual ONNX assets enable a real browser proof."
  - "Keep the existing adapter's sanitized unavailable categories as the sole Plan 02 runtime surface."
patterns-established:
  - "A failed browser proof permits only unavailable-status handling; it never permits synthetic results or a network fallback."
requirements-completed: []
duration: 2min
completed: 2026-07-28
status: complete
---

# Phase 03 Plan 02: Proof-Blocked Generation Contract Summary

**Validated the adapter's sanitized local-unavailable state while deferring all MolBlock normalization and generated-result behavior until manual ONNX assets permit a real browser proof.**

## Performance

- **Duration:** 2 min
- **Tasks:** 1 completed under the proof-blocked branch
- **Files modified:** 1

## Accomplishments

- Confirmed `generator.ts` remains the sole low-level `mlconfgen` and ONNX runtime boundary.
- Confirmed the adapter exposes only `model-assets-unavailable` or `browser-runtime-unavailable` when initialization cannot run.
- Verified the focused unavailable-status tests and production build without adding fake conformers, a backend route, or an alternate runtime.

## Validation

- `cd frontend && npm test -- generator.test.ts` — passed (3 tests).
- `cd frontend && npm run build` — passed.

## Task Commits

Commits intentionally omitted by execution instruction. No files were staged or committed.

## Files Created/Modified

- `.planning/phases/03-frontend-wasm-generation/03-02-SUMMARY.md` — records the proof-gated execution result and deferred work.

## Decisions Made

- Kept the shortest safe implementation: the existing Plan 01 unavailable-status adapter already satisfies the only executable Plan 02 branch while model assets remain absent.
- Deferred `GenerateRequest`, `GeneratedConformer`, `GenerateResponse`, request translation, and MolBlock normalization because each would imply a synthetic success path without the required browser proof.

## Deviations from Plan

### Proof-gated execution

**1. [Recorded runtime blocker] Successful-generation contract work was intentionally deferred.**

- **Found during:** Task 1: Red-green-refactor the normalized generation contract.
- **Issue:** `frontend/public/models/egnn_chembl_15_39.onnx` and `frontend/public/models/adj_mat_seer_chembl_15_39.onnx` are absent, so no real browser request can establish MolBlock output or coordinate ordering.
- **Resolution:** Retained and verified only the documented sanitized unavailable branch. No mock results, server route, package change, or fallback runtime was added.
- **Verification:** Focused Vitest coverage and Vite production build pass.

**Total deviations:** 0 auto-fixes; 1 planned proof-gate deferral.

## Issues Encountered

- Manual model assets remain the sole blocker. They are intentionally ignored by Git and must be supplied locally before successful-generation behavior can be implemented or claimed.

## Known Stubs

None. The unavailable branch is intentional and fully wired to the recorded runtime-proof status; it does not render mock data.

## Next Phase Readiness

- Plan 03 can present only the documented disabled local-generator state while the proof remains blocked.
- After the two manual model assets are available, repeat the served-browser smoke in `03-RUNTIME-PROOF.md` before implementing the normalized generation contract and its success states.

## Self-Check: PASSED

- `frontend/src/lib/generator.ts` and `frontend/src/lib/generator.test.ts` exist and retain the adapter-private runtime boundary.
- The focused tests and production build passed.
- No source files, state files, roadmap files, staging area, or commits were changed by this execution.
