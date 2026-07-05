---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: in_progress
stopped_at: Phase 2 Plan 05 real-model smoke blocker
last_updated: "2026-06-29T19:32:00+02:00"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 5
  completed_plans: 4
  percent: 80
---

# STATE

## Project Memory

- Project name: mol-card-lab
- Audience: Internal prototype team
- Primary goal: Validate mlconfgen and serialize 3D conformers for frontend visualization
- First phase focus: integration spike
- Phase 2 boundary: local-only FastAPI is included; database, auth, job queue, deployment, browser-side ONNX, and RL fine-tuning remain non-goals
- Key constraint: preserve 3D coordinates with MolBlock/SDF
- Frontend rendering note: RDKit.js/WebAssembly may be used later for SMILES-derived 2D SVG card artwork only, not generation or 3D geometry
- Model weights: manual download, kept out of git
- Documentation: assumptions and planning artifacts required

## Workflow Status

- `.planning/` has been initialized
- Project planning artifacts created: PROJECT.md, config.json, REQUIREMENTS.md, ROADMAP.md, STATE.md
- Research folder created for future domain/context notes
- Phase 2 Plans 01-04 are implemented and verified in preparation-only mode without GSD-managed commits
- Plan 05 deterministic fixture self-test and frontend/backend ordinary checks pass
- Real model endpoint smoke is blocked: repeated DEMO_SMILES inference returned zero conformers after RDKit reported `Cannot convert 'nan' to double on line 2`

## Session

**Last session:** 2026-06-29T19:32:00+02:00
**Stopped at:** Phase 2 Plan 05 Task 1 real-model smoke blocker
**Resume file:** .planning/phases/02-frontend-integration-and-real-data-flow/02-05-PLAN.md
