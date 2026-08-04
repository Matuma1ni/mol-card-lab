---
phase: 3
slug: frontend-wasm-generation
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-23
---

# Phase 3 — Validation Strategy

## Test Infrastructure

| Property | Value |
|---|---|
| Framework | Vitest 0.34.6 with Testing Library and jsdom |
| Config file | `frontend/vite.config.ts` |
| Quick run command | `cd frontend && npm test -- generator.test.ts` |
| Full suite command | `cd frontend && npm test && npm run build` |
| Estimated runtime | ~30 seconds, excluding a manual browser smoke test |

## Sampling Rate

- After every task commit: run the focused relevant Vitest test.
- After every plan wave: run `cd frontend && npm test && npm run build`.
- Before `$gsd-verify-work`: the full suite and production build must pass.
- Run `cd frontend && npm run preview -- --host 127.0.0.1` after the runtime/model proof; jsdom cannot validate WASM, ONNX, or Vite-served model assets.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---|---|---|---|---|---|---|---|---|---|
| 03-01-01 | 01 | 1 | P3-01, P3-02, P3-03 package-legitimacy gate | T-03-SC | Exact browser-runtime package inputs require approval before installation | checkpoint prerequisite | `test -f frontend/package.json && test -f .planning/phases/03-frontend-wasm-generation/03-RESEARCH.md` | ✅ existing | ⬜ pending |
| 03-01-02 | 01 | 1 | P3-01, P3-02, P3-03 browser proof boundary | T-03-01, T-03-02, T-03-03 | Model assets are ignored, low-level imports stay private, and local failures are sanitized without a fallback | TDD unit + production build + required served-browser smoke | `cd frontend && npm test -- generator.test.ts && npm run build && git check-ignore -v public/models/egnn_chembl_15_39.onnx public/models/adj_mat_seer_chembl_15_39.onnx` | ❌ planned | ⬜ pending |
| 03-02-01 | 02 | 2 | P3-01, P3-04, P3-05, P3-06, P3-08, P3-09 normalized contract | T-03-04, T-03-05, T-03-06 | Validated inputs produce MolBlock-first data; filtered-short output is successful and errors are sanitized | TDD unit + production build | `cd frontend && npm test -- generator.test.ts && npm run build` | ❌ planned | ⬜ pending |
| 03-03-01 | 03 | 3 | P3-04, P3-05, P3-06, P3-07, P3-08, P3-09 generation UI | T-03-07, T-03-08, T-03-09, T-03-10 | Accessible local-only states preserve mock browsing and never display low-level errors | TDD UI integration + production build | `cd frontend && npm test -- App.test.tsx Molecule2DPreview.test.tsx && npm run build` | ❌ planned | ⬜ pending |
| 03-03-02 | 03 | 3 | P3-05, P3-06, P3-08, P3-09 Phase 4 handoff | — | Recorded geometry/runtime facts retain MolBlock authority and distinguish a blocker from partial success | documentation presence + full suite + production build | `test -s .planning/phases/03-frontend-wasm-generation/03-PHASE4-HANDOFF.md && cd frontend && npm test && npm run build` | ❌ planned | ⬜ pending |

## Wave 0 Requirements

- [x] `frontend/src/lib/generator.test.ts` is created by Plan 01 Task 2 before its adapter behavior is completed.
- [x] Existing Vitest + Testing Library support is the planned mocking seam; add helpers only if that setup cannot mock the adapter boundary.

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|---|---|---|---|
| Browser-local ONNX generation | P3-02, P3-03 browser proof | jsdom does not prove browser WASM/ONNX execution or static asset loading | Run `cd frontend && npm run preview -- --host 127.0.0.1`; open the served build in a supported browser with both manually supplied, ignored ONNX files and submit one supported request. Record browser name/version, both requested asset URLs, the request form, a representative MolBlock and coordinate/atom-order evidence on success; otherwise record the observed blocker and matching sanitized unavailable category. |

## Validation Sign-Off

- [x] All implementation tasks include an automated verification command; the sole checkpoint also has an automated prerequisite check.
- [x] Sampling continuity has no three consecutive tasks without automated verification.
- [ ] The browser proof has recorded the required served-production asset check and a real MolBlock result, or a concrete blocker.
- [x] No watch-mode flags are used.
- [x] `nyquist_compliant: true` is set because the finalized plan maps every task to automated validation, while the served-browser proof remains required manual evidence.

**Approval:** pending
