# ROADMAP

## Planning state

Phase 1 is complete and committed on `main`. It established the standalone Python generation spike, MolBlock-first conformer JSON, and a mock-driven React card UI with placeholder visualization. The roadmap is now frontend-first: Phase 2 adds RDKit.js 2D depiction, Phase 3 integrates browser-side generation through the `mlconfgen` JS runtime, and Phase 4 visualizes the actual generated conformers in 3D.

## Phase 1: Spike the core data flow — complete

Goal: Prove local molecule generation and frontend visualization can work together.

- Validated the standalone Python generation path with local `.mol` input and `DEMO_SMILES` fallback.
- Preserved generated 3D geometry as MolBlock, with coordinate arrays as derived convenience data.
- Built the React/Vite molecule-card scaffold with local mock conformers and a placeholder viewer.
- Kept API, persistence, queues, authentication, and deployment out of the spike.

## Phase 2: 2D SMILES visualization

Goal: Replace or improve the placeholder card artwork with real 2D SVG depictions rendered from SMILES by RDKit.js, using the existing local frontend data flow.

### In scope

- Define exactly 10 predefined local molecule examples with `id`, name or label, `smiles`, and existing card metadata.
- Randomly select one example initially, with simple cycling/selection controls if they fit the current UI.
- Render a 2D SVG depiction by parsing SMILES with RDKit.js in the browser.
- Isolate RDKit.js/WASM initialization and SVG rendering behind a small component or helper.
- Show an explicit loading state while RDKit.js initializes.
- Show a graceful fallback for initialization failure or invalid SMILES.
- Reuse the existing molecule-card UI and local mock-data flow where practical.
- If `dangerouslySetInnerHTML` is required, confine it to the depiction component and document why.

### Out of scope

- Backend API, FastAPI endpoint, or Python service
- File upload, database, job queue, auth, or deployment
- PubChem/ChEMBL lookup
- Conformer generation or WASM generator integration
- 3D visualization or Speck integration
- Molecule editing or saving generated results

### Deliverables and acceptance criteria

- Exactly 10 labeled local examples are available without network lookup.
- The selected example's SMILES produces a visible RDKit.js SVG depiction.
- Loading, invalid-SMILES, and RDKit.js initialization failures have intentional UI states.
- Selection changes update the depiction without spreading RDKit.js lifecycle code through the app.
- The interaction is clearly random selection from predefined molecules, not random molecule generation.

## Phase 3: JS runtime / WASM-compatible conformer generation

Goal: Integrate the `mlconfgen` JS runtime into the frontend architecture behind a small adapter, keeping generation local to the browser and low-level ONNX/RDKit details out of UI components.

### In scope

- Browser-runtime proof before UI work: prove that `mlconfgen` can use an explicitly supplied browser ONNX Runtime build (for example `onnxruntime-web`), including its RDKit dependency and Vite asset handling. The package currently defaults to `onnxruntime-node` and Node 18+.
- Define a small frontend generator adapter/interface around `mlconfgen`.
- Obtain, configure, and keep out of git the separately distributed `egnn_chembl_15_39.onnx` and `adj_mat_seer_chembl_15_39.onnx` model files.
- Create the generator with `MLConformerGenerator.create({ egnnOnnx, adjMatSeerOnnx, diffusionSteps })`, using `MLConformerGenerator` and `seed` imported from `mlconfgen` only inside the adapter.
- Support the minimum request input: `nSamples`, optional `variance` / `diffusionSteps`, either `referenceContext` with `nAtoms` or `referenceConformer.positions`.
- Normalize generator output into a frontend molecule/conformer shape compatible with existing cards where practical.
- Preserve `mol.toMolBlock()` as authoritative geometry. Derive coordinate triples only when practical for UI/debug use.
- Add model-loading, generation-in-progress, partial-result, success, and failure states. `filterInvalid` is `true` by default, so a successful response can contain fewer conformers than requested.
- Prove that generated results can flow into existing card selection/rendering without major UI rewrites.
- Record the confirmed geometry and browser-runtime contract for Phase 4.

### Out of scope

- Backend API or production backend
- FastAPI, uvicorn, httpx, database, job queue, auth, or deployment
- 3D visualization except a minimal non-viewer smoke check if required to verify output presence
- Advanced generation controls beyond the minimum integration proof
- Fixed-fragment inpainting / IFM merge, which are not ported from the Python API
- Model training or fine-tune adapter work

### Deliverables and acceptance criteria

- UI code requests generation only through the adapter, not `mlconfgen`, ONNX Runtime, RDKit, or model-path APIs.
- The adapter returns the documented normalized request/response shape suitable for the current card flow.
- The browser proof records the selected ONNX Runtime build, model-asset loading approach, and any browser limitations before UI integration.
- `mol.toMolBlock()` is retained for every normalized conformer; optional coordinates do not replace it.
- Model-loading and generation failures produce graceful, actionable UI states; an invalid-filtered short result is distinguishable from failure.
- Generation runs locally in the browser with no backend boundary.
- The output geometry contract is documented for Phase 4.

## Phase 4: 3D visualization of generated conformers

Goal: Add 3D visualization after Phase 3 establishes the actual generated geometry format, using generated conformers rather than hand-written temporary 3D examples.

### In scope

- Evaluate a lightweight browser viewer, such as Speck, against the confirmed Phase 3 geometry format.
- Isolate viewer setup, updates, and disposal behind a React component.
- Render actual conformers returned by the frontend generator adapter.
- Synchronize card selection and the 3D viewer.
- Handle viewer loading, invalid geometry, missing geometry, and missing WebGL support gracefully.

### Out of scope

- Changing or retraining the generation model
- Backend-mediated generation
- Production persistence
- Advanced molecular editing
- Publication-quality rendering unless explicitly planned later

### Deliverables and acceptance criteria

- At least one Phase 3-generated conformer renders interactively in 3D.
- Selecting another generated conformer updates the viewer.
- Invalid/missing geometry and unavailable WebGL produce clear fallbacks.
- The viewer remains replaceable because its implementation is isolated from cards and generation logic.

## Why API work is deferred

API work is deferred because the preferred target architecture is browser-side generation via WebAssembly. The prototype remains aligned with a frontend-first deployment model and avoids introducing a backend boundary that may not be needed for generation.

## Suggested implementation files

Phase 2 will likely touch:

- `frontend/package.json` and `frontend/package-lock.json`
- `frontend/src/App.tsx`
- `frontend/src/components/MoleculeCard.tsx`
- `frontend/src/components/Molecule2DViewer.tsx` (new)
- a small RDKit.js loader/render helper if needed
- `frontend/src/data/mockMolecules.ts`
- `frontend/src/types/molecule.ts`
- related frontend styles and tests

Phase 3 will likely add or update:

- a frontend generator adapter/interface module
- ONNX Runtime and model-asset configuration required by the browser proof
- `frontend/src/App.tsx` and molecule/conformer types
- generation-state UI and focused adapter/integration tests

Exact paths beyond the adapter boundary depend on the browser proof and should not be guessed in advance.

Phase 4 will likely touch:

- `frontend/package.json` and `frontend/package-lock.json`
- `frontend/src/components/MoleculeViewer3D.tsx`
- `frontend/src/App.tsx`
- geometry normalization/types established in Phase 3
- related viewer styles and tests

## Suggested validation

```bash
cd frontend
npm install
npm run build
npm run lint
```

When tests are added, run the exact test script declared in `frontend/package.json`. Phase 2 manual checks should cover all 10 examples, loading, invalid SMILES, and selection. Phase 3 should cover browser-runtime/model loading, generation success and failure, filtered partial results, both supported reference-input forms, and adapter normalization. Phase 4 should cover generated geometry, conformer switching, invalid/missing geometry, and missing WebGL.

## Existing contradictions and gaps found

- The prior roadmap put visualization-only 3D work in Phase 2.5 before WASM generation; the revised plan moves generation to Phase 3 and 3D visualization to Phase 4 after the output format is known.
- The prior 3D plan used prepared local MolBlock examples; Phase 4 now requires actual generated geometry.
- Older Phase 2 language considered backend/API integration; API work is deferred under the browser-side target architecture.
- The current frontend fixture has four conformer records rather than the Phase 2 target of 10 labeled examples.
- `npm run build` currently succeeds. `npm run lint` is declared but currently fails because ESLint is not installed/configured.
