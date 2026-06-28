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

- Python remains the generation/runtime integration path because `ml_conformer_generator` is a Python library.
- RDKit.js/WebAssembly may be considered for frontend-only 2D depiction from a SMILES string.
- Any RDKit.js-rendered SVG is card preview/artwork only; it is not the generator, backend connector, or source of 3D geometry.
- MolBlock remains the primary generated conformer geometry representation for future real 3D visualization, likely with 3Dmol.js.
- If added, a `Molecule2DPreview` should be treated as an optional Phase 1.5 or later enhancement, not a Phase 1 success criterion unless already implemented.

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
