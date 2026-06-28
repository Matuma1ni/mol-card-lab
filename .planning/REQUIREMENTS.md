# REQUIREMENTS

## Scope for Phase 1

The first phase must deliver a minimally viable conformer generation and visualization spike.

### Functional Requirements

1. The backend must load `mlconfgen` with PyTorch weights from `backend/data/model_weights/`.
2. The backend must accept a reference molecule and generate a small set of conformers.
3. Generated conformers must be serialized with:
   - canonical SMILES
   - MolBlock/SDF text preserving 3D coordinates
   - explicit coordinate arrays for each atom
   - metadata describing generation parameters
4. The frontend must render a card grid using mocked conformer data.
5. The frontend must include a placeholder 3D viewer component and selected molecule detail view.
6. The repository must include `.gitignore` entries for weights, generated outputs, and environment artifacts.

### Non-Functional Requirements

1. The initial implementation should be simple, readable, and easy to refactor or delete.
2. The first phase should not create production-level APIs or back-end services.
3. The first phase should explicitly document assumptions and constraints.
4. The project should preserve 3D information instead of relying solely on SMILES.
5. RDKit.js/WebAssembly, if used, should be limited to frontend 2D SMILES-to-SVG depiction for card artwork.

## Constraints

- Model weights must remain out of git.
- Generation output must be usable by future frontend 3D rendering.
- MolBlock must remain the primary geometry representation for generated conformers.
- SMILES-derived SVG must not be treated as preserving generated 3D coordinates.
- PubChem/ChEMBL lookup is optional and must not be used as validity proof.
- The first phase should not include database, auth, job queue work, browser-side ONNX generation, or RDKit.js as a generation/runtime integration path.
