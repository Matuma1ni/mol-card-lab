# Architecture Notes and ADRs

This directory captures the architecture decisions that matter most for Phase 1 of the project.

## Current ADRs

- [ADR-0001: Prefer local .mol reference molecules with embedded SMILES fallback](ADR-0001-reference-molecule-input.md)

## Onboarding Summary

The current spike is intentionally narrow:

- The backend proves that a standalone Python flow can generate 3D conformers from a reference molecule.
- The frontend remains mock-driven and uses placeholder 3D rendering.
- Geometry is preserved as MolBlock/SDF, while coordinate arrays are retained as derived convenience data.
- RDKit.js/WebAssembly is only a possible frontend 2D depiction helper for SMILES-derived SVG card artwork.
- Model weights are expected to be downloaded manually by the user and placed under backend/data/model_weights/.

## Key Architectural Decisions

1. Reference input
   - Prefer a local .mol file passed with --reference-mol / -r.
   - Fall back to embedded DEMO_SMILES only for smoke testing.

2. Geometry serialization
   - Treat MolBlock as the primary geometry payload.
   - Keep coordinates as derived debug/UI data rather than the canonical source of truth.

3. Scope discipline
   - Avoid production API wiring, database persistence, and queueing in Phase 1.

4. Frontend depiction
   - A future `Molecule2DPreview` may use RDKit.js/WebAssembly to render SMILES as SVG.
   - That SVG is not generated conformer geometry and does not replace MolBlock or future 3Dmol.js rendering.

## Inconsistencies Observed During Review

- The README and the implementation notes both describe the same architecture, but the ADR layer was missing; the important decisions were only implicit in prose.
- The code already implements the reference-molecule decision, but the project lacked a durable record of why that approach was chosen.
