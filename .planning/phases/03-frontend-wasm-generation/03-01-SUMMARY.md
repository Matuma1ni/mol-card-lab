---
phase: 03-frontend-wasm-generation
plan: 01
subsystem: frontend runtime proof
tags: [vite, mlconfgen, onnxruntime-web, vitest]
requires:
  - phase: 02-frontend-2d-depiction
    provides: Vite frontend and retry-safe browser-loader precedent
provides:
  - Ignored local browser-model asset paths
  - Retry-safe, adapter-private browser runtime status boundary
  - Factual blocked runtime proof record
affects: [03-02, 03-03, Phase 4]
tech-stack:
  added: [mlconfgen@0.1.0, onnxruntime-web@1.27.0]
  patterns: [adapter-private browser runtime, sanitized unavailable status, resettable initialization promise]
key-files:
  created: [frontend/src/lib/generator.ts, frontend/src/lib/generator.test.ts, frontend/src/lib/mlconfgen.d.ts, .planning/phases/03-frontend-wasm-generation/03-RUNTIME-PROOF.md]
  modified: [.gitignore]
key-decisions:
  - "Use mlconfgen's documented createGenerator wrapper because MLConformerGenerator is not exported from the installed package entry point."
  - "Block generation on absent manual ONNX assets and expose only a sanitized local unavailable status."
patterns-established:
  - "Browser model initialization shares one promise and clears it after rejection for safe retry."
requirements-completed: [P3-01, P3-02, P3-03]
duration: 12min
completed: 2026-07-28
status: complete
---

# Phase 03 Plan 01: Browser Runtime Proof Boundary Summary

**Browser-local mlconfgen initialization is isolated behind a retry-safe status boundary, with missing manual ONNX weights reported as a safe local blocker.**

## Accomplishments

- Added Git protection and a retained placeholder directory for both manually acquired ONNX weights.
- Added the only frontend module importing `mlconfgen` and `onnxruntime-web`, with Vite-base URL resolution, explicit runtime injection, and sanitized status mapping.
- Added focused tests and a runtime proof record documenting the missing-weight blocker and exact manual continuation steps.

## Validation

- `cd frontend && npm test -- generator.test.ts` — passed (3 tests).
- `cd frontend && npm run build` — passed.
- `cd frontend && git check-ignore -v public/models/egnn_chembl_15_39.onnx public/models/adj_mat_seer_chembl_15_39.onnx` — both paths ignored.

## Task Commits

Commits intentionally omitted by execution instruction. No files were staged or committed.

## Files Created/Modified

- `.gitignore` — ignores the two exact browser-local model weights.
- `frontend/public/models/.gitkeep` — retains the manual model directory.
- `frontend/src/lib/generator.ts` — private runtime initialization and unavailable-status surface.
- `frontend/src/lib/generator.test.ts` — focused configuration, retry, and missing-asset tests.
- `frontend/src/lib/mlconfgen.d.ts` — minimal declarations required because the installed package provides no TypeScript declarations.
- `03-RUNTIME-PROOF.md` — records the asset blocker and manual browser smoke required to clear it.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added a local declaration for untyped mlconfgen**
- **Found during:** Task 2 build validation.
- **Issue:** `mlconfgen@0.1.0` has no TypeScript declaration file, so `tsc` failed before Vite could build.
- **Fix:** Declared only `createGenerator` and `seed`, the two adapter-private imports.
- **Verification:** Production build passes.

**2. [Rule 1 - Package API mismatch] Used the package's public createGenerator wrapper**
- **Found during:** Task 2 API inspection.
- **Issue:** The installed package entry point does not export `MLConformerGenerator`; its documented public API is `createGenerator`, which delegates to that internal class.
- **Fix:** Kept all low-level imports private and called `createGenerator` with the explicit browser runtime and model URLs.
- **Verification:** Focused tests assert the exact configuration passed to the package API.

## Issues Encountered

- The manually obtained ONNX files are absent, so no served-browser generation request or representative MolBlock can be truthfully recorded. The adapter maps this to `model-assets-unavailable`; no fallback was added.

## Next Phase Readiness

Plan 02 must retain the unavailable branch until the two ignored model files are manually supplied and the served-browser smoke records a real MolBlock result. Phase 3 remains frontend-only.

## Self-Check: PASSED

- Required adapter, tests, ignore rules, model placeholder, and runtime proof record exist.
- No task or metadata commits were created by instruction.
