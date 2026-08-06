# Phase 3: JS Runtime / WASM-Compatible Generation — Context

**Updated:** 2026-07-22  
**Status:** Ready for implementation planning after browser-runtime proof

## Phase boundary

Phase 3 connects the frontend to the `mlconfgen` JS runtime without introducing an API or backend fallback. It proves a browser-compatible ONNX Runtime configuration, then exposes local conformer generation through a small adapter. Phase 4, not this phase, renders the generated molecules in 3D.

## Locked decisions

- The npm package is `mlconfgen`; its `MLConformerGenerator` and `seed` exports remain private to the adapter.
- Initialization uses `MLConformerGenerator.create({ egnnOnnx, adjMatSeerOnnx, diffusionSteps })`.
- Generation supports either `referenceContext` with `nAtoms`, or `referenceConformer: { positions }`, plus `nSamples` and optional `variance` / `diffusionSteps`.
- The adapter converts returned molecule objects with `mol.toMolBlock()` and returns the Phase 3 `GenerateResponse` contract in `03-PLAN.md`.
- `molBlock` is required authoritative 3D geometry. Optional coordinate arrays are derived convenience data; optional SMILES does not replace geometry.
- `filterInvalid: true` is the runtime default. A response with `numGenerated < numRequested` is successful when invalid conformers were filtered and must be shown as such.
- The ONNX weight files are not npm artifacts and must not enter git: `egnn_chembl_15_39.onnx` and `adj_mat_seer_chembl_15_39.onnx`.
- The runtime README currently lists `onnxruntime-node` and Node 18+ as defaults. Browser support is only accepted after a focused proof with an explicitly supplied browser build such as `onnxruntime-web`; no API fallback is permitted if that proof fails.
- Fixed-fragment inpainting / IFM merge, model fine-tuning, and 3D rendering are not Phase 3 work.

## Required handoff to Phase 4

Record representative normalized output and answer:

1. Does each generated molecule yield a valid MolBlock that the selected viewer can parse?
2. Are coordinate arrays available or safely derivable, and do they retain MolBlock atom ordering?
3. Which browser/ONNX runtime and asset-loading configuration was proven?
4. Are filtered partial results, sanitization behavior, or molecule ordering constraints relevant to display?

## Canonical references

- `.planning/phases/03-frontend-wasm-generation/03-PLAN.md` — scope, contract, validation, and acceptance criteria
- `.planning/REQUIREMENTS.md` — project-level Phase 3 requirements
- `.planning/ROADMAP.md` — roadmap order and non-goals
- `AGENTS.md` — repository constraints, including no API boundary and model-weight handling
- JS runtime README: https://github.com/Membrizard/ml_conformer_generator/tree/js-runtime/js
