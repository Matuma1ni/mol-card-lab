# mol-card-lab

A frontend-first prototype for depicting and viewing molecular structures as collectible card game-style cards, backed by a completed standalone conformer-generation spike.

## Project Overview

This is an exploratory spike combining:
- **Backend**: Python + `ml_conformer_generator` (EDM-based 3D conformer generation from reference molecules)
- **Frontend**: React + TypeScript + Vite with a placeholder for future generated-conformer 3D visualization
- **Goal**: Preserve the proven Phase 1 generator/data contract while adding 2D SMILES depiction, then 3D MolBlock visualization, before later browser-side WASM generation

## Architecture & Decision Records

The main Phase 1 decisions are now captured in docs under [docs/architecture/README.md](docs/architecture/README.md), including the newest ADR for reference-molecule handling:

- [docs/architecture/ADR-0001-reference-molecule-input.md](docs/architecture/ADR-0001-reference-molecule-input.md)

These notes are intended to make onboarding easier and to keep the project aligned with the implementation choices in the backend and frontend.

## Architecture (First Spike)

### Backend (Python)
1. **`generate_demo.py`**: Standalone script to test the `mlconfgen` library locally
   - Loads a local `.mol` reference via `--reference-mol` / `-r` as the preferred Phase 1 input
   - Falls back to embedded `DEMO_SMILES` only for smoke testing
   - Loads pre-downloaded model weights
   - Generates N conformers with variance
   - Serializes to JSON (MolBlock + coordinates)
   - Outputs to `backend/data/output/`
   - Records `reference_source: mol_file` with `reference_3d_geometry: provided` or `embedded` for `.mol` inputs
   - Records `reference_source: demo_smiles` and `reference_3d_geometry: embedded` for the smoke-test fallback

2. **Serialization**: Each conformer stored as:
   ```json
   {
     "id": "conformer_0",
     "smiles": "...",
     "molBlock": "...",
     "coordinates": [...],
     "metadata": {...}
   }
   ```

### Frontend (React + Vite)
1. **Mocked data**: Realistic molecules generated once offline from backend
2. **`MoleculeCard.tsx`**: Collectible card component with molecule info
3. **`MoleculeViewer3D.tsx`**: Placeholder viewer for Phase 4 generated-conformer visualization
4. **`App.tsx`**: Card grid/list UI

Phase 2 will use RDKit.js for frontend-only SVG depiction from SMILES using a fixed local set of 10 molecule examples. Phase 3 will integrate the colleague's frontend-compatible WASM conformer generator behind an adapter. Phase 4 will add 3D visualization using actual generated geometry after its format is known.

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ / npm
- GPU recommended for `mlconfgen` (CPU will work but slower)

### Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

**Model Weights**:
1. Visit https://huggingface.co/Membrizard/ml_conformer_generator
2. Accept the gated model access terms
3. Download:
   - `edm_moi_chembl_15_39.pt`
   - `adj_mat_seer_chembl_15_39.pt`
4. Place them in `backend/data/model_weights/`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Runs at http://localhost:5173

## Phase 1 Status

- [x] Create minimal repo structure
- [x] Python backend + requirements
- [x] `generate_demo.py` script (load, generate, serialize)
- [x] Serialization utilities (Mol → JSON)
- [x] React/Vite frontend setup
- [x] `MoleculeCard` component
- [x] 3D viewer placeholder
- [x] Add realistic mock data
- [x] Document assumptions

## Key Constraints & Decisions

1. **Serialization**: MolBlock as primary geometry + coordinate arrays as derived debug/UI convenience data
2. **Reference molecule**: Local `.mol` via `--reference-mol` / `-r` preferred; embedded `DEMO_SMILES` is smoke-test fallback only
3. **Mock data**: Realistic—generated once from RDKit, committed to repo
4. **API paused**: Do not add an interim backend API; browser-side WASM generation is the preferred later integration path
5. **3D coordinates preserved**: MolBlock format, not bare SMILES
6. **Model weights excluded**: `.gitignore` entries, user must download
7. **2D depiction scope**: Phase 2 frontend artwork from SMILES only; not generation, backend integration, or 3D geometry
8. **Assumptions documented**: See `docs/ASSUMPTIONS.md`

## Performance Notes

- Model inference: ~11.5s for 50 conformers (H100 GPU)
- Model size: ~190 MB total (both weights)
- License: Weights are CC BY-NC-ND 4.0 (non-commercial use only)

## Current Plan

### Phase 2: 2D SMILES visualization

- Use exactly 10 predefined local molecule examples with `id`, label/name, SMILES, and current card metadata.
- Use RDKit.js to parse the selected SMILES in-browser and render an SVG depiction.
- Start with a random selection and retain a simple selection/cycling interaction that fits the existing UI.
- Show a loading state while RDKit.js initializes and fall back gracefully when it fails or SMILES is invalid.
- Reuse the existing mock-data and molecule-card flow; remain frontend-only.

Out of scope: API/backend endpoints, WASM generation, full 3D viewing, uploads, persistence, queues, auth, deployment, lookups, editing, and saved results.

### Phase 3: frontend WASM generation integration

- Integrate the colleague's frontend-compatible generator once available.
- Put it behind a frontend generator adapter.
- Keep its output compatible with the current molecule-card data contract where practical, with MolBlock as primary generated 3D geometry when available.

### Phase 4: 3D visualization of generated conformers

- Select a lightweight browser viewer only after Phase 3 confirms the geometry format; Speck is a candidate, not a commitment.
- Render actual generated conformers rather than hand-written temporary 3D examples.
- Isolate viewer code and handle loading, invalid/missing geometry, and missing WebGL gracefully.

API work is deferred because the preferred target architecture is browser-side generation via WebAssembly. This keeps the prototype aligned with a frontend-first deployment model and avoids introducing a backend boundary that may not be needed for generation. FastAPI, uvicorn, httpx, database, job queue, auth, and deployment are not planned for these phases.

## License & Attribution

- Project code license: TBD
- Model weights: CC BY-NC-ND 4.0 (non-commercial use only)
- Library: `mlconfgen` (Apache 2.0)
