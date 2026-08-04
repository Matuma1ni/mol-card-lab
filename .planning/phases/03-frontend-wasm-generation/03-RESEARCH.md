# Phase 3: Frontend WASM Generation - Research

**Researched:** 2026-07-23  
**Domain:** Browser-local ONNX conformer-generation adapter  
**Confidence:** MEDIUM (local planning evidence only; browser runtime has not been proven)

## User Constraints (from CONTEXT.md)

### Locked Decisions

- The npm package is `mlconfgen`; its `MLConformerGenerator` and `seed` exports remain private to the adapter.
- Initialization uses `MLConformerGenerator.create({ egnnOnnx, adjMatSeerOnnx, diffusionSteps })`.
- Generation supports either `referenceContext` with `nAtoms`, or `referenceConformer: { positions }`, plus `nSamples` and optional `variance` / `diffusionSteps`.
- The adapter converts returned molecule objects with `mol.toMolBlock()` and returns the Phase 3 `GenerateResponse` contract in `03-PLAN.md`.
- `molBlock` is required authoritative 3D geometry. Optional coordinate arrays are derived convenience data; optional SMILES does not replace geometry.
- `filterInvalid: true` is the runtime default. A response with `numGenerated < numRequested` is successful when invalid conformers were filtered and must be shown as such.
- The ONNX weight files are not npm artifacts and must not enter git: `egnn_chembl_15_39.onnx` and `adj_mat_seer_chembl_15_39.onnx`.
- The runtime README currently lists `onnxruntime-node` and Node 18+ as defaults. Browser support is only accepted after a focused proof with an explicitly supplied browser build such as `onnxruntime-web`; no API fallback is permitted if that proof fails.
- Fixed-fragment inpainting / IFM merge, model fine-tuning, and 3D rendering are not Phase 3 work.

### the agent's Discretion

None stated.

### Deferred Ideas (OUT OF SCOPE)

Fixed-fragment inpainting / IFM merge, model fine-tuning, and 3D rendering.

## Summary

Phase 3 must begin with a browser proof, not UI integration. The current frontend has no installed `mlconfgen` or `onnxruntime-web` package, no ONNX assets, and no generator code. [VERIFIED: codebase] The proof must therefore establish a compatible installed package set, a Vite-served model-asset strategy, and a real browser generation result before any card-flow work is accepted.

The existing frontend already provides the right structural precedent: `src/lib/rdkit.ts` owns browser asset URLs, one-time loading, retry-safe cache reset, and low-level runtime details; React components consume a narrow helper. [VERIFIED: frontend/src/lib/rdkit.ts] Phase 3 should copy that boundary shape, not its chemistry implementation.

**Primary recommendation:** Implement and test one `src/lib/generator.ts` adapter first; expose only the documented `GenerateRequest`/`GenerateResponse` contract, and stop Phase 3 at a recorded blocker if the explicit browser runtime proof fails.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|---|---|---|---|
| Model-asset URL resolution and fetch | Browser / Client | CDN / Static | Vite serves static browser assets; no API is permitted. [VERIFIED: frontend public-asset precedent] |
| ONNX/runtime and generator initialization | Browser / Client | — | The runtime must execute locally and remain private to the adapter. [VERIFIED: 03-CONTEXT.md] |
| Request translation and output normalization | Browser / Client | — | The adapter maps both reference forms and preserves MolBlock-first results. [VERIFIED: 03-PLAN.md] |
| Loading, generation, partial-success, and error display | Browser / Client | — | React receives state/contract only, not runtime objects. [VERIFIED: 03-PLAN.md] |

## Browser Runtime Proof: Required Order

1. Install the locked packages only after their browser entry points and peer/dependency behavior are inspected locally; no package is installed today. [VERIFIED: frontend/package.json; frontend/node_modules]
2. Obtain the two named ONNX files manually outside git, add an explicit frontend-safe ignored location, and confirm production build output can request both files. The existing `.gitignore` ignores only `backend/data/model_weights/*.onnx`, so it does **not** yet protect a frontend model directory. [VERIFIED: .gitignore]
3. In a dedicated non-UI smoke path, explicitly supply the browser ONNX runtime/build and model URLs to `MLConformerGenerator.create({ egnnOnnx, adjMatSeerOnnx, diffusionSteps })`. This is the decisive proof gate. [VERIFIED: 03-CONTEXT.md; 03-PLAN.md]
4. Run one supported request and retain evidence of: load success, one valid `mol.toMolBlock()` result, failure message on a missing/invalid asset, and the runtime/browser/Vite configuration used. [VERIFIED: 03-PLAN.md]
5. Only then connect the adapter response to cards. Do not add an HTTP/API fallback if the proof fails. [VERIFIED: AGENTS.md; 03-CONTEXT.md]

## Adapter Boundary and Contract

Use a single module (recommended `frontend/src/lib/generator.ts`) that is the sole import site for `mlconfgen`, `MLConformerGenerator`, `seed`, ONNX runtime selection, and model paths. Components import neither those packages nor asset URLs. [VERIFIED: 03-PLAN.md]

The adapter should own:

- idempotent initialization and recoverable initialization failure, matching `loadRDKit()`'s module-promise pattern; [VERIFIED: frontend/src/lib/rdkit.ts]
- validation that exactly one supported reference representation is forwarded: `referenceContext` plus `nAtoms`, or `referenceConformer.positions`; [VERIFIED: 03-PLAN.md]
- `generateConformers` invocation with `nSamples`, optional `variance`, and optional `diffusionSteps`; [VERIFIED: 03-PLAN.md]
- normalization of every returned molecule through `mol.toMolBlock()` into the stated `GeneratedConformer`; [VERIFIED: 03-PLAN.md]
- response metadata with `numRequested`, `numGenerated`, effective parameters, and `generationSource: "mlconfgen-js"`; [VERIFIED: 03-PLAN.md]
- a separate successful partial-result state when generated count is lower than requested, rather than an error. [VERIFIED: 03-CONTEXT.md]

Do not force the existing `Conformer` type to become the runtime API: it currently requires `name`, `smiles`, coordinates, and `num_atoms`, while Phase 3 makes SMILES and coordinates optional and requires MolBlock. [VERIFIED: frontend/src/types/molecule.ts; 03-PLAN.md] Add the Phase 3 contract alongside it, then use an explicit UI mapping only where cards need it.

## Vite Asset Strategy

The established RDKit loader uses `public/rdkit/` and `import.meta.env.BASE_URL` to form deploy-safe URLs, with the runtime receiving URLs through its loader callback. [VERIFIED: frontend/src/lib/rdkit.ts] Use the same simple static-asset strategy for manually supplied ONNX files if the runtime accepts browser URL strings: an ignored `frontend/public/models/` directory plus an adapter-local `assetUrl()` helper. This is a planning recommendation inferred from the repository pattern, not a confirmed `mlconfgen` API capability. [ASSUMED]

The proof must run both `npm run build` and a served production build, because a dev-server success alone does not prove asset paths work under Vite's configured base URL. `npm run build` runs TypeScript followed by Vite; the configured test environment is jsdom. [VERIFIED: frontend/package.json; frontend/vite.config.ts]

## Test Strategy and Validation Architecture

| Requirement | Test | Evidence / command |
|---|---|---|
| Adapter is the only low-level boundary | Static import/architecture test or focused code review | `rg` confirms UI components do not import runtime packages or model paths. [VERIFIED: 03-PLAN.md] |
| Both request forms translate correctly | Unit test with mocked adapter-private runtime | `npm test -- generator.test.ts` (new). [ASSUMED] |
| MolBlock and counts are normalized | Unit test returning fake molecules with `toMolBlock()` | `npm test -- generator.test.ts` (new). [ASSUMED] |
| Filtered short result is successful | Unit + UI integration test for `numGenerated < numRequested` | `npm test -- generator.test.ts App.test.tsx` (new/updated). [ASSUMED] |
| Loading and failure are actionable | UI integration test for pending/rejected adapter promises | Existing Vitest + Testing Library patterns. [VERIFIED: frontend/src/App.test.tsx; frontend/src/components/Molecule2DPreview.test.tsx] |
| Actual browser runtime and assets work | Manual browser smoke against served production build | Required proof gate; jsdom cannot establish WASM/ONNX compatibility. [VERIFIED: frontend/vite.config.ts; 03-CONTEXT.md] |

Run `npm test`, `npm run build`, and `npm run lint`; lint is currently declared but the roadmap records that ESLint is not installed/configured, so it is an existing validation blocker rather than a Phase 3 runtime result. [VERIFIED: frontend/package.json; .planning/ROADMAP.md]

## Common Pitfalls

- **Treating default Node support as browser support:** the context explicitly says the default is `onnxruntime-node`; require the focused browser proof. [VERIFIED: 03-CONTEXT.md]
- **Committing model weights:** frontend model locations are not currently covered by `.gitignore`; add protection before manual download. [VERIFIED: .gitignore]
- **Leaking runtime objects into React:** keep initialization, asset locations, and `seed` inside the adapter. [VERIFIED: AGENTS.md; 03-PLAN.md]
- **Discarding MolBlock:** coordinate triples are optional derived data and must preserve MolBlock atom order if produced. [VERIFIED: 03-CONTEXT.md]
- **Calling a filtered result a failure:** determine success from the completed generation call; surface requested/generated counts separately. [VERIFIED: 03-CONTEXT.md]
- **Mock-only proof:** unit tests can prove translation and UI states, but not the browser runtime, ONNX assets, or output geometry. [VERIFIED: 03-CONTEXT.md]

## Don't Hand-Roll

| Problem | Use Instead | Why |
|---|---|---|
| Conformer generation | `mlconfgen` behind the adapter | Locked runtime choice; custom model execution is out of scope. [VERIFIED: 03-CONTEXT.md] |
| ONNX model execution | Explicit supported browser ONNX runtime | The browser proof gate exists because the package default is Node-oriented. [VERIFIED: 03-CONTEXT.md] |
| 2D artwork | Existing RDKit browser helper | Phase 3 must not reclassify artwork as 3D generated geometry. [VERIFIED: AGENTS.md] |

## Current Blockers and Planning Gates

1. **Hard runtime proof gate:** `mlconfgen` and `onnxruntime-web` are not installed locally, and no local package metadata is available to verify their browser entry points or compatible wiring. [VERIFIED: frontend/node_modules]
2. **Hard asset gate:** neither required ONNX file is present in the repository, and no frontend model-asset ignore rule exists. [VERIFIED: repository search; .gitignore]
3. **Validation debt:** `npm run lint` is declared but ESLint is not configured/installed according to the roadmap. [VERIFIED: .planning/ROADMAP.md; frontend/package.json]

No backend fallback is an acceptable resolution for any of these gates. [VERIFIED: AGENTS.md; 03-CONTEXT.md]

## Assumptions Log

| # | Claim | Risk if Wrong |
|---|---|---|
| A1 | A Vite `public/models/` URL strategy can be passed directly to the JS runtime. | The proof needs a different asset-loading adapter/configuration. |
| A2 | Focused Vitest adapter tests can mock the low-level runtime without loading its package. | Tests may require a different module seam. |

## Sources

- [VERIFIED: `.planning/phases/03-frontend-wasm-generation/03-CONTEXT.md`] Locked scope and browser proof conditions.
- [VERIFIED: `.planning/phases/03-frontend-wasm-generation/03-PLAN.md`] Contract, API calls, acceptance criteria, and validation intent.
- [VERIFIED: `frontend/src/lib/rdkit.ts`] Existing browser asset/loader boundary.
- [VERIFIED: `frontend/package.json`, `frontend/vite.config.ts`, `frontend/src/types/molecule.ts`] Current dependencies, build/test configuration, and type mismatch.
- [VERIFIED: `.gitignore`] Existing model-asset protection scope.
