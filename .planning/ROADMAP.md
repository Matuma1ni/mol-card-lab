# ROADMAP

## Planning state

Phase 1 is complete and committed on `main`. It established the standalone Python generation spike, MolBlock-first conformer JSON, and a mock-driven React card UI with placeholder visualization. The roadmap is now frontend-first: Phase 2 adds RDKit.js 2D depiction, Phase 3 integrates browser-side WASM generation, and Phase 4 visualizes the actual generated conformers in 3D.

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

## Phase 3: Frontend WASM generation integration

Goal: Integrate the frontend-compatible conformer-generation library after it is available, keeping generation browser-side and hiding low-level WASM details behind a frontend adapter.

### In scope

- Define a small frontend generator adapter/interface around the delivered WASM module.
- Accept the agreed minimum generation input through that adapter.
- Normalize generator output into a frontend molecule/conformer shape compatible with existing cards where practical.
- Add module-loading, generation-in-progress, success, and failure states.
- Prove that generated results can flow into existing card selection/rendering without major UI rewrites.
- Preserve MolBlock or the library's authoritative 3D geometry representation in normalized output.

### Out of scope

- Backend API or production backend
- FastAPI, uvicorn, httpx, database, job queue, auth, or deployment
- 3D visualization except a minimal non-viewer smoke check if required to verify output presence
- Advanced generation controls beyond the minimum integration proof

### Deliverables and acceptance criteria

- UI code requests generation only through the adapter, not directly through low-level WASM APIs.
- The adapter returns normalized molecule/conformer records suitable for the current card flow.
- WASM loading and generation failures produce graceful, actionable UI states.
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
- WASM module declarations/assets and loader configuration
- `frontend/src/App.tsx` and molecule/conformer types
- generation-state UI and focused adapter/integration tests

Exact files depend on the delivered library interface and should not be guessed in advance.

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

When tests are added, run the exact test script declared in `frontend/package.json`. Phase 2 manual checks should cover all 10 examples, loading, invalid SMILES, and selection. Phase 3 should cover WASM load/generation success and failure plus adapter normalization. Phase 4 should cover generated geometry, conformer switching, invalid/missing geometry, and missing WebGL.

## Existing contradictions and gaps found

- The prior roadmap put visualization-only 3D work in Phase 2.5 before WASM generation; the revised plan moves generation to Phase 3 and 3D visualization to Phase 4 after the output format is known.
- The prior 3D plan used prepared local MolBlock examples; Phase 4 now requires actual generated geometry.
- Older Phase 2 language considered backend/API integration; API work is deferred under the browser-side target architecture.
- The current frontend fixture has four conformer records rather than the Phase 2 target of 10 labeled examples.
- `npm run build` currently succeeds. `npm run lint` is declared but currently fails because ESLint is not installed/configured.
