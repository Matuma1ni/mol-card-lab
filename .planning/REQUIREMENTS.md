# REQUIREMENTS

## Current direction

Phase 1 is complete. Phase 2 is RDKit.js 2D visualization from SMILES, Phase 3 is browser-side WASM generation integration, and Phase 4 is 3D visualization of actual generated conformers after their geometry format is known. No API is required for these phases.

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

## Phase 2 requirements: 2D SMILES visualization

### Functional

1. The frontend must contain exactly 10 predefined local molecule examples.
2. Every example must include `id`, name or label, `smiles`, and metadata required by the current card UI.
3. React must use RDKit.js in the browser to parse the selected example's SMILES and render an SVG depiction.
4. The UI must select an initial molecule randomly and may provide simple next/previous or random-selection controls.
5. RDKit.js loading must have a visible loading state; initialization failures and invalid SMILES must produce a graceful fallback without breaking card interaction.
6. Existing molecule-card components and local mock-data flow should be reused where practical.

### Constraints and exclusions

- Frontend-only; no API/backend endpoint or generated-data fetch.
- No WASM conformer generation, full 3D viewer, file upload, molecule editing, or result saving.
- No FastAPI, uvicorn, httpx, database, job queue, auth, deployment, or PubChem/ChEMBL lookup.
- A SMILES-derived depiction is 2D artwork and is not the source of 3D geometry.

## Phase 3 requirements: frontend WASM generation

1. Wait for the frontend-compatible generator and its interface before finalizing implementation details.
2. Put the library behind a frontend generator adapter/interface.
3. Keep adapter output compatible with the existing molecule-card data shape where practical.
4. Keep generation browser-side and provide module-loading and generation failure states.
5. Document the authoritative generated geometry format for Phase 4.
6. Exclude backend/API work, persistence, deployment, and advanced generation controls.

## Phase 4 requirements: generated-conformer 3D visualization

1. Select a viewer only after Phase 3 establishes the generated geometry format.
2. Render actual generated conformers rather than hand-written temporary 3D examples.
3. Isolate viewer code behind a replaceable React component.
4. Handle loading, invalid/missing geometry, and missing WebGL gracefully.
5. Exclude generation-model changes, backend-mediated generation, persistence, advanced editing, and publication-quality rendering.
