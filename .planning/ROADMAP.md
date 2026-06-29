# ROADMAP

## Phase 1: Spike the core data flow

Goal: Prove local molecule generation and frontend visualization can work together.

- Task 1.1: Validate Python backend dependencies and model weight paths
- Task 1.2: Create `generate_demo.py` to load a local `.mol` reference via `--reference-mol` / `-r`, fall back to `DEMO_SMILES` only for smoke testing, generate conformers, and serialize output
- Task 1.3: Preserve 3D geometry in serialization using MolBlock/SDF + coordinates
- Task 1.4: Build a minimal React/Vite frontend with mocked conformer cards
- Task 1.5: Add a placeholder 3D viewer component and selected molecule panel
- Task 1.6: Document assumptions, setup, and non-goals

## Phase 2: Frontend integration and real data flow

Goal: Replace mock data with backend-generated conformers and verify end-to-end.

- Task 2.1: Add backend output reader or lightweight API stub
- Task 2.2: Connect frontend selection to real generated conformer data
- Task 2.3: Ensure state and UI behave with multiple conformers

## Phase 2.5: Optional card artwork enhancement

Goal: Improve the visual card preview without changing generation or 3D geometry scope.

- Task 2.5.1: Consider a `Molecule2DPreview` component using RDKit.js/WebAssembly to render a 2D SVG from SMILES
- Task 2.5.2: Keep the SMILES-derived SVG as frontend artwork only; MolBlock remains the source of generated 3D geometry
- Task 2.5.3: Leave Python `generate_demo.py` as the generation/runtime integration path

## Phase 3: Project hygiene and future planning

Goal: Prepare for more ambitious extensions once the spike is validated.

- Task 3.1: Add Docker/dev env documentation
- Task 3.2: Review model license and usage constraints
- Task 3.3: Plan optional identity lookup/enrichment
- Task 3.5: Integrate 3Dmol.js rendering using serialized MolBlock data
