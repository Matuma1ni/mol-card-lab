# mol-card-lab agent instructions

## Project goal

Build an exploratory prototype that connects to `ml_conformer_generator`, generates 3D molecular conformers, and displays them in a React UI as collectible-style molecule cards.

## Phase 1 scope

Phase 1 is limited to:
- proving `ml_conformer_generator` works from a standalone Python script;
- supporting a local `.mol` reference file via `--reference-mol` / `-r`;
- using embedded `DEMO_SMILES` only as a smoke-test fallback;
- serializing generated conformers as JSON;
- treating MolBlock as the primary geometry representation;
- including coordinate arrays only as derived debug/UI convenience data;
- keeping the frontend mock-driven with a placeholder 3D viewer.

Do not add in Phase 1:
- FastAPI;
- database;
- job queue;
- auth;
- production API wiring;
- browser-side ONNX generation;
- PubChem/ChEMBL lookup.

## Frontend rendering scope

- Phase 1's Python path remains the proven generation/runtime spike.
- Phase 2 is frontend-only 2D depiction from a fixed local set of 10 SMILES examples.
- Phase 3 is frontend-only conformer generation through the `mlconfgen` JS runtime and a small adapter.
- Phase 4 is frontend-only 3D visualization of Phase 3-generated conformers.
- RDKit.js/WebAssembly or another suitable browser library may be used for frontend-only 2D depiction from a SMILES string.
- Any RDKit.js-rendered SVG is card preview/artwork only; it is not the generator, backend connector, or source of 3D geometry.
- MolBlock remains the primary generated conformer geometry representation for future real 3D visualization, likely with 3Dmol.js.
- A `Molecule2DPreview` is now a Phase 2 deliverable; it was not a Phase 1 success criterion.

## Current roadmap constraints

- Do not implement or plan an API/backend endpoint for Phases 2–4.
- Do not add FastAPI, uvicorn, httpx, database, job queue, auth, or deployment work.
- Keep Phase 2 on the existing local mock/frontend data flow.
- Keep Phase 3 browser-side; do not add a backend/API boundary.
- Phase 3 must import `MLConformerGenerator` and `seed` from `mlconfgen` only inside its adapter boundary. The UI consumes the normalized frontend generator contract, never low-level runtime objects.
- Phase 3 preserves `mol.toMolBlock()` as authoritative generated geometry; coordinate triples are optional derived UI/debug data.
- The `mlconfgen` package currently defaults to `onnxruntime-node`. Browser implementation is gated on proving an explicit browser-compatible runtime (such as `onnxruntime-web`), Vite asset handling, and separate ONNX weight delivery work.
- Model weights (`egnn_chembl_15_39.onnx` and `adj_mat_seer_chembl_15_39.onnx`) are manually obtained, must not be committed, and are not published on npm.
- Do not plan fixed-fragment inpainting or IFM merge in Phase 3; they are not ported to the JS runtime.
- API work is paused because browser-side JS/WASM generation is the preferred integration path.

## Reference molecule handling

Preferred input:
- local `.mol` file passed via `--reference-mol` / `-r`.

Fallback:
- if no `.mol` is provided, use `DEMO_SMILES` only for smoke testing.

Metadata must include:
- `reference_source`: `mol_file` or `demo_smiles`;
- `reference_3d_geometry`: `provided` or `embedded`.

If a `.mol` file lacks 3D coordinates and coordinates are embedded, mark:
- `reference_3d_geometry: embedded`.

Do not treat embedded geometry as equivalent to provided reference geometry.

## Chemistry assumptions

- PubChem/ChEMBL lookup is future identity lookup/enrichment, not chemical validation.
- Model weights are manually downloaded and must not be committed.
- Preserve 3D geometry; do not reduce generated conformers to SMILES only.
- Project license is TBD; do not create or assume MIT license without explicit instruction.

## Coding style

- Keep code boring and minimal.
- Prefer explicit functions over premature abstractions.
- Do not expand scope without asking.
- Before changing many files, summarize the intended changes.
- After changes, summarize files changed and how to run/check them.
