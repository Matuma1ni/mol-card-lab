# mol-card-lab

A prototype UI for viewing 3D molecular conformers generated via machine learning as collectible card game-style cards.

## Project Overview

This is an exploratory spike combining:
- **Backend**: Python + `ml_conformer_generator` (EDM-based 3D conformer generation from reference molecules)
- **Frontend**: React + TypeScript + Vite with a placeholder for future 3Dmol.js visualization
- **Goal**: Prove the generator works locally and build a clean, maintainable card-based UI for browsing generated molecules

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
3. **`MoleculeViewer3D.tsx`**: Placeholder viewer for future 3Dmol.js integration
4. **`App.tsx`**: Card grid/list UI

RDKit.js/WebAssembly is a possible frontend-only enhancement for rendering a 2D SVG depiction from a SMILES string, useful as collectible card artwork. It does not replace the Python generation path, does not connect to `ml_conformer_generator`, and does not preserve generated 3D conformer coordinates. Backend output must continue to preserve `molBlock` for future real 3D rendering, likely with 3Dmol.js.

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

## First Development Slice Tasks

- [x] Create minimal repo structure
- [ ] Python backend + requirements
- [ ] `generate_demo.py` script (load, generate, serialize)
- [ ] Serialization utilities (Mol → JSON)
- [ ] React/Vite frontend setup
- [ ] `MoleculeCard` component
- [ ] 3D viewer placeholder
- [ ] Generate realistic mock data
- [ ] Document assumptions

## Key Constraints & Decisions

1. **Serialization**: MolBlock as primary geometry + coordinate arrays as derived debug/UI convenience data
2. **Reference molecule**: Local `.mol` via `--reference-mol` / `-r` preferred; embedded `DEMO_SMILES` is smoke-test fallback only
3. **Mock data**: Realistic—generated once from RDKit, committed to repo
4. **No FastAPI yet**: Prove generator works first
5. **3D coordinates preserved**: MolBlock format, not bare SMILES
6. **Model weights excluded**: `.gitignore` entries, user must download
7. **RDKit.js scope**: Optional frontend 2D SMILES-to-SVG depiction only; not generation, backend integration, or 3D geometry
8. **Assumptions documented**: See `docs/ASSUMPTIONS.md`

## Performance Notes

- Model inference: ~11.5s for 50 conformers (H100 GPU)
- Model size: ~190 MB total (both weights)
- License: Weights are CC BY-NC-ND 4.0 (non-commercial use only)

## Next Steps (Beyond Phase 1)

- [ ] FastAPI wrapper (`/api/generate`)
- [ ] Database (store generated molecules)
- [ ] Job queue (async generation)
- [ ] Optional `Molecule2DPreview` using RDKit.js/WebAssembly for SMILES-derived SVG card artwork
- [ ] Real 3D rendering with 3Dmol.js
- [ ] PubChem/ChEMBL lookup (read-only)
- [ ] Docker setup
- [ ] RL fine-tuning interface

## License & Attribution

- Project code license: TBD
- Model weights: CC BY-NC-ND 4.0 (non-commercial use only)
- Library: `mlconfgen` (Apache 2.0)
