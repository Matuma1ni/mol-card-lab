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
- Phase 2 is frontend-only RDKit.js 2D depiction from a fixed local set of 10 SMILES examples.
- Phase 3 integrates the colleague's frontend-compatible WebAssembly generator behind a frontend adapter.
- Phase 4 adds 3D visualization of actual generated conformers after the geometry format is known.
- RDKit.js must be used for Phase 2 SMILES parsing and SVG depiction.
- Any RDKit.js-rendered SVG is card preview/artwork only; it is not the generator, backend connector, or source of 3D geometry.
- MolBlock remains the Phase 1 primary generated conformer geometry representation; Phase 4 viewer selection depends on the actual Phase 3 output format.
- A `Molecule2DPreview` is now a Phase 2 deliverable; it was not a Phase 1 success criterion.

## Current roadmap constraints

- Do not implement or plan an API/backend endpoint for Phases 2–4.
- Do not add FastAPI, uvicorn, httpx, database, job queue, auth, or deployment work.
- Keep Phase 2 on the existing local mock/frontend data flow.
- Keep RDKit.js initialization and any SVG injection isolated in a small Phase 2 component/helper.
- For Phase 3, define a frontend generator adapter and preserve compatibility with the molecule-card data contract where practical.
- Choose the Phase 4 viewer only after Phase 3 confirms the generated geometry format; evaluate Speck then, not in Phase 2.
- API work is deferred because browser-side WASM generation is the preferred target architecture.

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
