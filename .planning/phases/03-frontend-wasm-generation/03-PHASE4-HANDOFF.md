# Phase 4 Handoff: Geometry and Browser Runtime

## Status

Phase 3 cannot provide generated geometry yet. The browser-local runtime is blocked because these manually acquired model assets are absent from this checkout:

- `frontend/public/models/egnn_chembl_15_39.onnx`
- `frontend/public/models/adj_mat_seer_chembl_15_39.onnx`

The UI therefore uses the approved D-08 unavailable state: **Local generator unavailable**. It keeps mock-card browsing available, disables generation, and has no server, network, or alternate-runtime fallback.

## Runtime configuration recorded for a future proof

- `mlconfgen@0.1.0` is isolated in `frontend/src/lib/generator.ts`.
- `onnxruntime-web@1.27.0` is supplied explicitly as `ort` to `createGenerator`.
- Vite resolves the ignored public assets as `${import.meta.env.BASE_URL}models/egnn_chembl_15_39.onnx` and `${import.meta.env.BASE_URL}models/adj_mat_seer_chembl_15_39.onnx`.
- The configured generation settings are the two ONNX URLs and `diffusionSteps: 100`.

## Geometry and display contract

- D-05: No representative normalized MolBlock exists until the missing assets permit a real served-browser run. When available, `mol.toMolBlock()` is the authoritative generated geometry.
- Optional coordinate triples are derived convenience data only. Their atom ordering must be checked against the emitted MolBlock during the successful proof.
- Optional SMILES is 2D card artwork only; a missing value must retain the existing `2D preview unavailable` artwork fallback and does not invalidate valid MolBlock geometry.
- D-06: Filtered output remains successful. Returned conformers preserve adapter order; `numGenerated < numRequested` reports the difference as filtered invalid conformers, while zero valid results preserve the previous card.
- D-08: Runtime status and any UI failures remain sanitized local-only categories. No raw runtime exception, model path, HTTP endpoint, or fallback route is displayed.
- D-09: Phase 3 intentionally provides no 3D viewer, coordinate display, or viewer-selection recommendation.

## Phase 4 prerequisite

After both ignored weights are placed in `frontend/public/models/`, repeat the browser smoke documented in `03-RUNTIME-PROOF.md`. Record the browser/version, requested asset URLs, a representative MolBlock, derived-coordinate availability and atom ordering, plus filtered-result ordering before evaluating a viewer against generated geometry.
