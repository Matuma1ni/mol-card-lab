---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
stopped_at: Phase 2 context gathered
last_updated: "2026-07-05T22:02:39.091Z"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 3
  completed_plans: 0
  percent: 0
---

# STATE

## Project Memory

- Project name: mol-card-lab
- Audience: Internal prototype team
- Primary goal: Build a frontend-first molecule-card experience while preserving the Phase 1 conformer data contract
- Phase 1 status: Complete and committed on `main`
- Current phase focus: Phase 2, 2D visualization from SMILES using 10 local examples
- Non-goals: FastAPI, database, auth, job queue, browser-side ONNX, RL fine-tuning
- Key constraint: preserve 3D coordinates with MolBlock/SDF
- Frontend rendering note: Phase 2 is RDKit.js SMILES-to-SVG depiction
- Integration direction: Phase 3 integrates the frontend-compatible WASM generator behind an adapter
- 3D direction: Phase 4 renders actual generated conformers after the geometry format is known
- API decision: deferred; do not plan an interim API for Phases 2–4
- Model weights: manual download, kept out of git
- Documentation: assumptions and planning artifacts required

## Workflow Status

- `.planning/` has been initialized
- Project planning artifacts created: PROJECT.md, config.json, REQUIREMENTS.md, ROADMAP.md, STATE.md
- Research folder created for future domain/context notes

## Current roadmap

- Phase 1: complete scaffold and standalone generation spike
- Phase 2: RDKit.js 2D SMILES visualization from 10 fixed local examples
- Phase 3: frontend WASM generator adapter and browser-side generation
- Phase 4: 3D visualization of actual generated conformers

## Direction change

- Previous immediate Phase 2 API/real-data work is deferred.
- Reason: `ml_conformer_generator` is being updated for frontend WebAssembly use, making a browser-side adapter the preferred integration path.

## Session

**Last session:** 2026-07-05T22:02:39.079Z
**Stopped at:** Phase 2 context gathered
**Resume file:** .planning/phases/02-smiles-2d-visualization/02-CONTEXT.md
