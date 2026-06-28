# STATE

## Project Memory

- Project name: mol-card-lab
- Audience: Internal prototype team
- Primary goal: Validate mlconfgen and serialize 3D conformers for frontend visualization
- First phase focus: integration spike
- Non-goals: FastAPI, database, auth, job queue, browser-side ONNX, RL fine-tuning
- Key constraint: preserve 3D coordinates with MolBlock/SDF
- Frontend rendering note: RDKit.js/WebAssembly may be used later for SMILES-derived 2D SVG card artwork only, not generation or 3D geometry
- Model weights: manual download, kept out of git
- Documentation: assumptions and planning artifacts required

## Workflow Status

- `.planning/` has been initialized
- Project planning artifacts created: PROJECT.md, config.json, REQUIREMENTS.md, ROADMAP.md, STATE.md
- Research folder created for future domain/context notes
