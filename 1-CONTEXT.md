# Phase 1 Context

## Locked decision
- The preferred Phase 1 input is a local `.mol` file passed via `--reference-mol` / `-r`.
- Default behavior continues to use the embedded SMILES test case only as a fallback.

## Implementation detail
- `backend/src/generate_demo.py` now supports `--reference-mol <path>` / `-r <path>`.
- If no reference `.mol` is provided, the script falls back to `DEMO_SMILES`.
- `backend/src/molecule_utils.py` loads `.mol` files and embeds 3D coordinates only when the file lacks them.
- If embedding occurs, the output metadata explicitly records `reference_3d_geometry: embedded`.
- Reference metadata values are normalized: `reference_source` is `mol_file` or `demo_smiles`, and `reference_3d_geometry` is `provided` or `embedded`.
- Output remains JSON serialized conformers with MolBlock/SDF as the primary geometry and derived coordinate arrays for debugging/UI.

## Phase 1 scope
- Continue treating `generate_demo.py` as the core proof-of-concept artifact.
- Do not add FastAPI, database, production API wiring, browser-side ONNX, or PubChem/ChEMBL lookup in Phase 1.
- Keep the frontend as a mock-driven React/Vite prototype with a placeholder 3D viewer.
- Preserve 3D geometry in serialization via MolBlock/SDF format; coordinates are derived convenience data.

## Validation assumptions
- Model weights remain manual download only; the repo does not include them.
- Local `.mol` files are the preferred Phase 1 reference source.
- If a `.mol` file lacks 3D coordinates, the backend will embed them but mark the geometry as embedded rather than provided.
