---
phase: 03-frontend-wasm-generation
verified: 2026-07-28T07:05:38Z
status: gaps_found
verdict: partial
score: 4/10 must-haves verified
behavior_unverified: 0
overrides_applied: 0
gaps:
  - truth: "The frontend adapter accepts both supported reference forms and returns normalized MolBlock-first conformers."
    status: failed
    reason: "The successful-generation contract is absent. generator.ts exports a zero-argument function that always throws after initialization; no GenerateRequest/GenerateResponse types or normalization exists."
    artifacts:
      - path: "frontend/src/lib/generator.ts"
        issue: "generateConformers(): Promise<never> never calls the runtime's generateConformers method."
      - path: "frontend/src/types/molecule.ts"
        issue: "Contains no GenerateRequest, GeneratedConformer, or GenerateResponse type."
    missing:
      - "Implement validated translation for referenceContext+nAtoms and referenceConformer.positions."
      - "Normalize every returned molecule through non-empty mol.toMolBlock() and retain requested/generated metadata."
  - truth: "The UI represents local model loading, generation, success, partial success, zero-result, and sanitized failure states, and inserts generated conformers into card selection."
    status: failed
    reason: "App.tsx implements only a static disabled unavailable state. It neither imports the adapter nor has a result/card mapping or the required state machine."
    artifacts:
      - path: "frontend/src/App.tsx"
        issue: "No generator import, invocation, generated-result selector, retry, partial/zero/success/failure state, or normalized-conformer-to-card mapping."
    missing:
      - "Wire the normalized adapter contract to proof-gated UI states once the runtime proof produces real output."
  - truth: "Browser-local generation is proven with the two manual ONNX assets and produces Phase-4-usable geometry."
    status: failed
    reason: "Only frontend/public/models/.gitkeep exists; both required ONNX assets and the served-browser smoke result are absent. No representative MolBlock or atom-order evidence exists."
    artifacts:
      - path: "frontend/public/models/egnn_chembl_15_39.onnx"
        issue: "Missing manual asset."
      - path: "frontend/public/models/adj_mat_seer_chembl_15_39.onnx"
        issue: "Missing manual asset."
    missing:
      - "Obtain the ignored assets, run the served production-browser smoke, and record real asset requests plus a representative MolBlock."
---

# Phase 3: Frontend WASM Generation Verification Report

**Phase Goal:** Integrate the `mlconfgen` JS runtime into the frontend architecture behind a small adapter, keeping generation local to the browser and low-level ONNX/RDKit details out of UI components.
**Verified:** 2026-07-28T07:05:38Z
**Status:** gaps_found — **partial** under an external model-asset escalation gate
**Re-verification:** No — initial verification

## Goal Achievement

The recorded unavailable-runtime branch is real, intentionally browser-local, and does not pretend that conformers were generated. It is not, however, the Phase 3 goal: the adapter contract and generated-card integration are missing even after initialization would succeed. The missing model assets are an external prerequisite, but the current `generateConformers()` implementation also proves that successful generation cannot work without further source work.

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Browser proof records a concrete runtime/asset blocker rather than a false success. | ✓ VERIFIED | [03-RUNTIME-PROOF.md](03-RUNTIME-PROOF.md) names both absent assets and the required served-browser continuation. `public/models/` contains only `.gitkeep`. |
| 2 | The two manual ONNX files are protected from normal Git staging. | ✓ VERIFIED | `.gitignore` lines 38–40 names both assets; `git check-ignore -v` resolved each exact path to its rule. |
| 3 | Low-level `mlconfgen` and ONNX runtime imports remain adapter-private. | ✓ VERIFIED | Only [generator.ts](../../../../frontend/src/lib/generator.ts) imports `mlconfgen` and `onnxruntime-web`; React code has no such imports. |
| 4 | The UI uses a normalized generation contract rather than runtime objects. | ✗ FAILED | [types/molecule.ts](../../../../frontend/src/types/molecule.ts) contains no Phase 3 request/response types, and [App.tsx](../../../../frontend/src/App.tsx) does not import the adapter. |
| 5 | Both allowed reference forms yield MolBlock-first normalized conformers. | ✗ FAILED | `generateConformers()` has no request parameter, never invokes `generator.generateConformers`, and always throws. No `mol.toMolBlock()` call exists in frontend source. |
| 6 | A filtered-short response remains successful with accurate requested/generated counts. | ✗ FAILED | No generated response metadata, partial-success state, or tests for filtered output exist. |
| 7 | Model loading, active generation, full success, partial success, zero result, and sanitized failure preserve the card flow. | ✗ FAILED | [App.tsx](../../../../frontend/src/App.tsx) renders only the disabled unavailable panel/button; it has no state machine, retry, selector, or generated-card mapping. |
| 8 | With an unavailable runtime, the action is disabled, explains the local-only constraint, preserves mock browsing, and has no alternative generator route. | ✓ VERIFIED | [App.tsx](../../../../frontend/src/App.tsx) lines 66–76 provide the status and disabled control; its focused test proves mock browsing stays usable. Static scans found no generation API/client request, backend route, or alternate runtime. |
| 9 | Generation remains browser-local and does not add backend, persistence, deployment, training, inpainting, or IFM merge work. | ✓ VERIFIED | No such Phase 3 implementation/imports were found; [generator.ts](../../../../frontend/src/lib/generator.ts) resolves only Vite public-asset URLs and imports `onnxruntime-web`. |
| 10 | Phase 4 has confirmed geometry/runtime evidence against which to evaluate a viewer. | ✗ FAILED | [03-PHASE4-HANDOFF.md](03-PHASE4-HANDOFF.md) accurately records the blocker, but explicitly states no representative normalized MolBlock or coordinate/atom-order proof exists. |

**Score:** 4/10 truths verified (0 present, behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `frontend/src/lib/generator.ts` | Adapter-private browser generator and normalized generation surface | ✗ STUB | Exists and has explicit `onnxruntime-web`/Vite URL configuration, but `generateConformers(): Promise<never>` always throws and is never used by the app. |
| `frontend/src/types/molecule.ts` | Separate `GenerateRequest` / `GeneratedConformer` / `GenerateResponse` types | ✗ MISSING | File exists, but none of the required Phase 3 types are defined. |
| `frontend/src/App.tsx` | Proof-gated state machine and generated result selection | ⚠️ PARTIAL | The unavailable branch is substantive and tested; all successful-generation branches and adapter wiring are absent. |
| `frontend/src/styles/App.css` | Compact unavailable status treatment | ✓ VERIFIED | Status panel and disabled 44px primary action are implemented. |
| `.gitignore` | Ignore rules for both browser ONNX assets | ✓ VERIFIED | Exact named asset rules work with Git. |
| `03-RUNTIME-PROOF.md` | Factual browser proof or documented blocker | ✓ VERIFIED | Documents configuration and the concrete missing-asset blocker without a false runtime claim. |
| `03-PHASE4-HANDOFF.md` | Confirmed geometry/runtime handoff | ⚠️ PARTIAL | A useful blocker handoff exists, but no generated MolBlock, coordinate ordering, or browser smoke evidence is available. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `generator.ts` | `frontend/public/models/` | Vite base-URL model URLs | ⚠️ PARTIAL | URL construction and `HEAD` checks exist, but both assets are absent so the link cannot deliver models. |
| `generator.ts` | `mlconfgen` | Explicit browser runtime passed to creation | ⚠️ PARTIAL | `createGenerator({ ort, egnnOnnx, adjMatSeerOnnx, diffusionSteps })` is present. The installed package wraps `MLConformerGenerator.create`, but no real browser creation occurred. |
| `generator.ts` | `types/molecule.ts` | Normalized frontend contract | ✗ NOT WIRED | No types are defined/imported and no normalized response is returned. |
| `App.tsx` | `generator.ts` | Adapter-only generation invocation | ✗ NOT WIRED | Zero adapter imports or `generateConformers` calls in App. |
| `App.tsx` | `MoleculeCard.tsx` | Normalized conformer mapped to card data | ✗ NOT WIRED | Existing mock-SMILES card browsing is wired, but no generated conformer mapping exists. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `generator.ts` | Model URLs | Vite `BASE_URL` | No — assets absent | ⚠️ STATIC/BLOCKED |
| `App.tsx` | Selected card | `getMockSmilesSet()` | Yes, but Phase 2 fixtures only | ✓ FLOWING (not generated data) |
| Generated card flow | Normalized conformers | No adapter response source | No | ✗ DISCONNECTED |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Adapter configuration/unavailable sanitization | `cd frontend && npm test -- generator.test.ts App.test.tsx` | 11 tests passed | ✓ PASS, limited to mocked initialization and unavailable UI |
| TypeScript/Vite production build | `cd frontend && npm run build` | Passed | ✓ PASS |
| Served browser generation with real assets | Not run — assets absent; verifier did not start a server | No real model files or MolBlock evidence | ✗ BLOCKED |

The passing generator tests do **not** exercise a request, runtime `generateConformers` call, normalization, filtering, or real WASM/ONNX asset load. This is the misleading-test finding from the disconfirmation pass.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| P3-01 | 03-01/02 | Adapter-private `mlconfgen` imports | ✓ SATISFIED | Sole production import boundary is `generator.ts`. |
| P3-02 | 03-01 | Explicit browser runtime and served asset proof | ⚠️ BLOCKED | Runtime configuration is recorded, but the required served-browser proof cannot run without both assets. |
| P3-03 | 03-01 | Create generator with manual ignored weights | ⚠️ BLOCKED | Package/configuration and ignores exist; files are absent and no real creation completed. |
| P3-04 | 03-02 | Normalized request/response and both input forms | ✗ BLOCKED | Contract, validation, and translation are absent. |
| P3-05 | 03-02 | MolBlock-first normalization | ✗ BLOCKED | No `mol.toMolBlock()` normalization implementation or evidence. |
| P3-06 | 03-02/03 | Counts and filtered partial success | ✗ BLOCKED | No metadata/state/test coverage. |
| P3-07 | 03-03 | Browser-local loading, generation, failure states | ⚠️ PARTIAL | Sanitized unavailable state works; remaining specified states cannot work yet. |
| P3-08 | 03-02 | Exclude inpainting/IFM merge | ✓ SATISFIED | No such controls or request surface. |
| P3-09 | 03-01–03 | Exclude backend/persistence/deployment/training/advanced controls | ✓ SATISFIED | No forbidden Phase 3 boundary was added. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `frontend/src/lib/generator.ts` | 67–70 | `generateConformers()` always throws after loading | 🛑 BLOCKER | A supplied asset pair would still not produce a conformer; the adapter is an intentional blocked branch, not a completed generator. |
| `frontend/src/lib/generator.test.ts` | 26–67 | Tests mock initialization only | ⚠️ Warning | Green tests provide no evidence for request translation, output geometry, counts, or browser execution. |

No unreferenced `TBD`, `FIXME`, or `XXX` debt marker was found in the Phase 3 files inspected.

## Gaps Summary

This phase is **partial**, not complete. It correctly implements the safe response to the absent external assets: they are ignored, the UI says the local generator is unavailable, mock browsing remains available, and no backend fallback was introduced. Those completed constraints should be retained.

The phase goal remains unachieved because the actual frontend generation adapter, MolBlock-first normalization, count/partial-success semantics, and generated-card wiring do not exist. The missing assets block factual browser proof; independently, the current adapter intentionally cannot generate even if they are later supplied. These gaps are not deferred to Phase 4: that phase expects Phase 3-generated geometry.

### Escalation Gate — Required Developer Action

1. Obtain the two manual ONNX files and place them at the ignored paths in `frontend/public/models/`.
2. Run the documented served production-browser smoke. Record the browser/version, both asset requests, one supported request, a representative `mol.toMolBlock()` result, and coordinate/MolBlock atom-order evidence in `03-RUNTIME-PROOF.md`.
3. Resume Phase 3 implementation: add the normalized contract and validation, invoke the runtime, retain MolBlocks/counts, test filtered results, and wire the proof-gated UI state machine/card selector.

Do not add a server/API or synthetic successful conformers to clear this gate.

---

_Verified: 2026-07-28T07:05:38Z_  
_Verifier: the agent (gsd-verifier)_
