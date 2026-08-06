# PROJECT: mol-card-lab

## Project Overview

`mol-card-lab` is an exploratory prototype for generating and visualizing molecular structures as collectible card-style assets. Phase 1 validated the Python `ml_conformer_generator` path, preserved 3D conformer coordinates in serialization, and established a React/Vite UI with mock molecule data. Current work is frontend-first: Phase 2 adds RDKit.js 2D depiction from SMILES, Phase 3 integrates the `mlconfgen` JS runtime through a browser-compatible ONNX Runtime build, and Phase 4 visualizes actual generated conformers in 3D.

## Mission

Create a clean, maintainable prototype that preserves the proven Phase 1 data contract while improving browser-side visualization:
- reference molecule -> `mlconfgen` conformer generation -> 3D-aware serialization
- mocked frontend experience using realistic molecule data
- SMILES -> RDKit.js SVG card depiction in Phase 2
- frontend generator adapter -> `mlconfgen` JS/ONNX generation in Phase 3
- generated geometry -> 3D viewer in Phase 4

## Project Goals

- Validate `mlconfgen` locally with downloadable weights
- Preserve 3D geometry in output using MolBlock/SDF format
- Keep the first slice simple and disposable
- Keep Phases 2–4 frontend-first and independent of an API
- Treat a 2D depiction library as artwork, not generated 3D geometry
- Use `mlconfgen` only behind a frontend adapter and prove its browser-compatible runtime configuration before wiring it into the UI
- Avoid treating PubChem/ChEMBL lookup as chemical validation

## Audience

- Internal prototype team
- Early exploratory developer/researcher

## Non-Goals

- Production API or deployment infrastructure
- Full chemical database integration
- Auth, user accounts, billing, or workflow orchestration
- Browser-side conformer generation before the WASM library is available
- RDKit.js as a backend connector, generator, or source of generated 3D conformer geometry
- RL fine-tuning or model training

## Success Criteria

- A Python spike script runs and generates conformers in JSON
- Generated output preserves 3D coordinates in a format suitable for frontend visualization
- Frontend renders a card-based UI with realistic mock molecule data
- Project planning artifacts exist in `.planning/`

API work is deferred because the preferred target architecture is browser-side generation via WebAssembly. This keeps the prototype aligned with a frontend-first deployment model and avoids introducing a backend boundary that may not be needed for generation. Phases 2–4 do not require or plan an interim backend API.
