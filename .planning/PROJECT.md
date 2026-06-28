# PROJECT: mol-card-lab

## Project Overview

`mol-card-lab` is an exploratory prototype for generating and visualizing 3D molecular conformers as collectible card-style assets. The initial work is intentionally narrow: validate the Python `ml_conformer_generator` library locally, preserve 3D conformer coordinates in serialization, and build a minimal React/Vite UI with mock molecule data.

## Mission

Create a clean, maintainable spike that proves the core data flow:
- reference molecule -> `mlconfgen` conformer generation -> 3D-aware serialization
- mocked frontend experience using realistic molecule data

## Project Goals

- Validate `mlconfgen` locally with downloadable weights
- Preserve 3D geometry in output using MolBlock/SDF format
- Keep the first slice simple and disposable
- Avoid building FastAPI, auth, database, job queue, or browser-side ONNX in this phase
- Treat RDKit.js/WebAssembly as optional frontend-only 2D depiction, not generation or 3D geometry
- Avoid treating PubChem/ChEMBL lookup as chemical validation

## Audience

- Internal prototype team
- Early exploratory developer/researcher

## Non-Goals

- Production API or deployment infrastructure
- Full chemical database integration
- Auth, user accounts, billing, or workflow orchestration
- Browser-side conformer generation
- RDKit.js as a backend connector, generator, or source of generated 3D conformer geometry
- RL fine-tuning or model training

## Success Criteria

- A Python spike script runs and generates conformers in JSON
- Generated output preserves 3D coordinates in a format suitable for frontend visualization
- Frontend renders a card-based UI with realistic mock molecule data
- Project planning artifacts exist in `.planning/`

RDKit.js/WebAssembly can be planned as a Phase 1.5 or later `Molecule2DPreview` for SMILES-derived SVG card artwork. It does not change Phase 1 success criteria.
