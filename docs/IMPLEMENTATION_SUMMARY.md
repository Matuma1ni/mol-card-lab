# Implementation Summary: First Development Slice

**Date**: June 21, 2026
**Status**: ✅ Complete
**Project**: mol-card-lab (Molecular Conformer Explorer)

---

## Overview

See [docs/architecture/README.md](architecture/README.md) for the current ADR index and onboarding summary.

Completed the initial scaffold for a molecular conformer generation + visualization prototype. The project combines:
- **Python Backend**: `ml_conformer_generator` library wrapper with demo script
- **React Frontend**: Card-based UI for browsing generated 3D molecular conformers
- **Clean Separation**: Backend generates data, frontend consumes mock/real data as JSON

Phase 1 is complete. The follow-on direction is frontend-first: Phase 2 adds RDKit.js SVG depiction from 10 fixed local SMILES examples, Phase 3 integrates the frontend-compatible WASM generator, and Phase 4 visualizes actual generated conformers after their geometry format is known.

---

## Repository Structure (Created)

```
mol-card-lab/
├── .gitignore                           # Excludes weights, venv, node_modules, outputs
├── README.md                            # Setup instructions + overview
├── docs/ASSUMPTIONS.md                  # Design decisions & unknowns documented

backend/
├── requirements.txt                     # Python dependencies (mlconfgen, rdkit, numpy)
├── pyproject.toml                       # Package metadata + dev dependencies
├── src/
│   ├── __init__.py
│   ├── config.py                        # Paths, model weight locations, defaults
│   ├── models.py                        # MLConformerGenerator wrapper (singleton pattern)
│   ├── serialize.py                     # Mol → JSON serialization (MolBlock + coordinates)
│   ├── molecule_utils.py                # SMILES↔Mol, validation, 3D generation
│   └── generate_demo.py                 # 🚀 Main spike script
└── data/
    ├── reference_molecules/             # Optional local .mol reference files
    ├── output/                          # Generated JSON output
    └── model_weights/                   # User downloads weights here

frontend/
├── index.html                           # Entry point
├── package.json                         # React + Vite dependencies
├── vite.config.ts                       # Vite build config
├── tsconfig.json                        # TypeScript config
├── src/
│   ├── main.tsx                         # React app entry
│   ├── App.tsx                          # Main app component (card grid + detail view)
│   ├── index.css                        # Global styles + imports
│   ├── components/
│   │   ├── MoleculeCard.tsx            # Collectible card UI
│   │   └── MoleculeViewer3D.tsx        # Placeholder for future 3D viewer
│   ├── data/
│   │   └── mockMolecules.ts            # Realistic mock data (benzene, methane, ethane)
│   ├── types/
│   │   └── molecule.ts                 # TypeScript interfaces
│   └── styles/
│       ├── App.css                     # Layout (header, cards grid, detail panel)
│       ├── MoleculeCard.css            # Card styles (hover, collectible design)
│       └── MoleculeViewer3D.css        # Viewer placeholder styles
└── public/                              # Static assets
```

---

## Backend Implementation

### 1. **Configuration** (`src/config.py`)
- Centralized paths for model weights, data directories
- Smoke-test fallback SMILES: `"c1ccccc1"` (benzene)
- Configurable generation defaults (10 conformers, variance 2, 100 diffusion steps)
- Validation function to check if weights are available

### 2. **Models Wrapper** (`src/models.py`)
- `ConformerGeneratorWrapper`: Lazy-loads MLConformerGenerator (expensive initialization)
- Singleton pattern: One instance per process
- Error handling & logging for generation failures
- Takes: reference molecule, n_samples, variance
- Returns: List of RDKit Mol objects with 3D coordinates

### 3. **Serialization** (`src/serialize.py`)
**Key assumption**: Preserve **MolBlock** as the primary geometry plus **coordinate arrays** as derived debug/UI convenience data.

Functions:
- `mol_to_molblock()`: RDKit Mol → 3D SDF string
- `extract_coordinates()`: Mol → [[x,y,z], ...] array
- `mol_to_dict()`: Mol → JSON-compatible dict
- `mols_to_json()`: List[Mol] → JSON string

**Output format**:
```json
{
  "conformers": [
    {
      "id": "conformer_0",
      "smiles": "c1ccccc1",
      "molBlock": "...",
      "coordinates": [[1.21, 0.70, 0.0], ...],
      "num_atoms": 6,
      "metadata": {...}
    }
  ],
  "count": 1,
  "metadata": {
    "reference_smiles": "c1ccccc1",
    "num_requested": 10,
    "num_generated": 10,
    "variance": 2,
    "diffusion_steps": 100,
    "generated_at": "2024-06-21T..."
  }
}
```

### 4. **Molecule Utils** (`src/molecule_utils.py`)
- `smiles_to_mol_3d()`: Convert SMILES → 3D Mol (AllChem.EmbedMolecule + optional MMFF94)
- `molfile_to_mol()`: Load from .mol file
- `validate_mol()`: Check atoms, 3D coords, supported elements

### 5. **Demo Script** (`src/generate_demo.py`) 🚀
Main entry point for testing the pipeline locally.

**Steps**:
1. Validate model weights are available
2. Load a local `.mol` reference via `--reference-mol` / `-r`, or use `DEMO_SMILES` only as a smoke-test fallback
3. Initialize MLConformerGenerator
4. Generate N conformers
5. Serialize to JSON
6. Save to `backend/data/output/generated_conformers.json`

**Usage**:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Download weights to backend/data/model_weights/
# Preferred Phase 1 input:
python src/generate_demo.py --reference-mol data/reference_molecules/example.mol

# Smoke-test fallback:
python src/generate_demo.py

# Or with custom params:
NUM_CONFORMERS=20 VARIANCE=3 python src/generate_demo.py
```

**Assumptions documented**:
- Model weights must be manually downloaded (gated HF access)
- Local `.mol` via `--reference-mol` / `-r` is the preferred Phase 1 input
- `DEMO_SMILES` is only a smoke-test fallback
- `.mol` metadata uses `reference_source: mol_file` and `reference_3d_geometry: provided` or `embedded`
- Fallback metadata uses `reference_source: demo_smiles` and `reference_3d_geometry: embedded`
- Frontend remains mock-driven in Phase 1

---

## Frontend Implementation

### 1. **Types** (`src/types/molecule.ts`)
```typescript
interface Conformer {
  id: string
  smiles: string
  molBlock: string
  coordinates: [number, number, number][]
  num_atoms: number
  metadata?: Record<string, unknown>
}
```

### 2. **Mock Data** (`src/data/mockMolecules.ts`)
Realistic conformers (generated once from RDKit):
- **Benzene** (2 conformations): 6 atoms, C6 ring
- **Methane**: 1 atom
- **Ethane**: 2 atoms connected

All include MolBlocks + 3D coordinates for testing the placeholder UI and future viewer integration.

### 3. **Components**

#### `MoleculeCard.tsx`
Collectible-style card for each conformer.

**Features**:
- Card ID + atom count (header)
- Placeholder 3D preview (🧬 icon)
- SMILES string (footer)
- "View" + "Info" buttons
- Hover effects (lift, glow)
- Click handler for selection

#### `MoleculeViewer3D.tsx`
Placeholder for future 3D rendering.

**Current state**: Placeholder UI with:
- Molecule icon animation
- SMILES + MolBlock display

Phase 4 will select a 3D viewer after Phase 3 establishes the actual generated geometry format.

#### Planned `Molecule2DPreview`
Phase 2 will add a frontend-only RDKit.js preview that parses SMILES and renders SVG card artwork. This preview was not required for Phase 1, is not the generator, and does not preserve generated 3D conformer coordinates.

#### `App.tsx`
Main layout:
- **Header**: Title + subtitle
- **Cards Section**: Grid of MoleculeCard components
- **Detail Section** (sidebar):
  - Selected conformer's 3D viewer
  - Metadata (SMILES, atom count, first coordinate)
- **Footer**: Attribution

### 4. **Styling**
Modern dark theme (slate/blue palette).

**Key CSS**:
- `App.css`: Grid layout (2-column on desktop, 1-column mobile)
- `MoleculeCard.css`: Card hover/focus states, collectible aesthetics
- `MoleculeViewer3D.css`: Placeholder animations, 3D viewer placeholder

---

## Dependencies Installed

### Backend
```
mlconfgen[torch]==0.4.3     # Core library (requires PyTorch)
rdkit==2024.09.1           # Molecule I/O, validation
numpy==1.24.3              # Numerical operations
pytest==7.4.0              # Testing
```

### Frontend
```
react@^18.2.0
react-dom@^18.2.0
typescript@^5.0.0
vite@^4.4.0
@vitejs/plugin-react@^4.0.0
```

---

## Next Steps (Beyond This Spike)

### Immediate (Task 1: Backend)
1. **Download model weights** from HuggingFace
2. **Run `generate_demo.py`** → verify JSON output
3. **Validate JSON structure** against TypeScript types

### Short-term (Task 2: Frontend)
1. **npm install** in frontend/
2. **npm run dev** → verify Vite dev server starts
3. **Test card grid** with mock data (already loaded)
4. Keep `MoleculeViewer3D.tsx` as a placeholder during Phase 1

### Phase 2: 2D SMILES visualization
- [ ] Expand the local fixture to exactly 10 labeled molecule examples
- [ ] Add real 2D depiction from SMILES with graceful failure fallback
- [ ] Show one selected card with simple cycling/random selection
- [ ] Keep the phase frontend-only and reuse the current card flow

### Phase 3: frontend WASM generation integration
- [ ] Wait for the frontend-compatible generator interface
- [ ] Add a frontend generator adapter
- [ ] Map output to the existing molecule-card contract where practical

### Phase 4: 3D visualization of generated conformers
- [ ] Select a viewer after Phase 3 confirms the geometry format
- [ ] Render actual generated conformers, not temporary hand-written examples
- [ ] Handle loading, invalid/missing geometry, and missing WebGL gracefully

API work is deferred because the preferred target architecture is browser-side generation via WebAssembly. This keeps the prototype aligned with a frontend-first deployment model and avoids a backend boundary that may not be needed for generation.

---

## Key Design Decisions

| Decision | Rationale | Risk |
|----------|-----------|------|
| **MolBlock + Coordinates in JSON** | Preserve geometry while exposing derived coordinates | Larger JSON, but acceptable for Phase 1 |
| **Local .mol reference preferred** | Exercises reference loading without external lookup services | Requires user to provide local files |
| **DEMO_SMILES fallback** | Keeps a smoke test available | Must be marked as embedded fallback geometry |
| **Model weights not in git** | Large files, gated access | User friction in setup (mitigated by docs) |
| **Mock data (not generated per request)** | Frontend dev independent of backend | Mock data must stay in sync (script to regenerate) |
| **RDKit.js only for 2D preview** | Improves collectible card artwork from SMILES | Could be confused with geometry unless clearly documented |
| **Singleton generator** | Expensive to load; reuse in same process | Requires careful memory management in multi-worker scenario |
| **API paused** | Prefer direct browser-side WASM integration when the updated generator is available | WASM contract is pending; isolate it behind an adapter |

---

## Assumptions Documented

See [`docs/ASSUMPTIONS.md`](docs/ASSUMPTIONS.md) for detailed list including:
- ✅ Serialization format (MolBlock + coordinates)
- ✅ Reference molecule source (`.mol` preferred, `DEMO_SMILES` fallback)
- ✅ Model weights handling (manual download)
- ✅ Mock data strategy (offline generation)
- ✅ 2D depiction scope (Phase 2 frontend-only artwork from SMILES)
- ✅ Chemical validity vs. database existence
- ✅ 3D coordinate preservation (MolBlock is source of truth)
- ⚠️ Unknowns: optimal conformer count, uniqueness metrics, state management

---

## Files Checklist

### Backend
- [x] `.gitignore` (Python + outputs)
- [x] `requirements.txt` (mlconfgen, rdkit, numpy)
- [x] `pyproject.toml` (package metadata)
- [x] `src/config.py` (paths, defaults, validation)
- [x] `src/models.py` (MLConformerGenerator wrapper)
- [x] `src/serialize.py` (Mol → JSON)
- [x] `src/molecule_utils.py` (utilities)
- [x] `src/generate_demo.py` (main spike script)
- [x] `src/__init__.py` (package)
- [x] `data/` directories (output, weights, references)

### Frontend
- [x] `package.json` (React + Vite)
- [x] `vite.config.ts` (build config)
- [x] `tsconfig.json` (TypeScript config)
- [x] `index.html` (entry point)
- [x] `src/main.tsx` (React entry)
- [x] `src/App.tsx` (main component)
- [x] `src/index.css` (global + imports)
- [x] `src/components/MoleculeCard.tsx` (card component)
- [x] `src/components/MoleculeViewer3D.tsx` (3D viewer placeholder)
- [x] `src/types/molecule.ts` (TypeScript interfaces)
- [x] `src/data/mockMolecules.ts` (realistic mock data)
- [x] `src/styles/App.css` (layout)
- [x] `src/styles/MoleculeCard.css` (card styles)
- [x] `src/styles/MoleculeViewer3D.css` (viewer styles)

### Root
- [x] `README.md` (setup + overview)
- [x] `.gitignore` (root-level)
- [x] `docs/ASSUMPTIONS.md` (design decisions)

---

## Testing & Validation

### Backend Validation Checklist
```bash
# 1. Check model weights available
ls backend/data/model_weights/

# 2. Run demo script
cd backend
source .venv/bin/activate
python src/generate_demo.py

# 3. Verify output JSON
cat data/output/generated_conformers.json | python -m json.tool | head -50

# 4. Check JSON structure matches TypeScript types
# (Manually or via schema validator)
```

### Frontend Validation Checklist
```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Start dev server
npm run dev

# 3. Verify app loads at http://localhost:5173
# 4. Check cards render with mock data
# 5. Click cards to select and view details
# 6. Verify no console errors
```

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Model weights not available | Clear README + HF link + setup script |
| Future viewer incompatible with MolBlock format | Add a conversion helper after Phase 1 if needed |
| 2D depiction mistaken for generated geometry | Keep SMILES depiction scoped to Phase 2 card artwork and preserve MolBlock |
| GPU not available for inference | Script detects CPU fallback (slower but functional) |
| Frontend mock data out of sync with backend | Script to regenerate mock data when needed |
| RDKit install complexity | Recommend conda; document troubleshooting |

---

## Summary

✅ **Complete**: Full project scaffold (backend + frontend) for molecular conformer generation + visualization spike.

**What works now**:
- Backend: Config, models, serialization, demo script (ready to test with real weights)
- Frontend: Card grid, detail view, mock data, placeholder viewer
- Documentation: Assumptions, setup, next steps

**What's next**:
1. Download weights & test `generate_demo.py`
2. npm install & run frontend
3. Validate JSON output shape and reference metadata
4. Keep real 3D rendering as future integration

---

**Generated**: 2024-06-21
**Status**: Ready for Phase 1 testing with placeholder viewer
