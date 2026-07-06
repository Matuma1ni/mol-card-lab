# Research: Domain Context

## Summary

This project is a prototype exploring machine-learned 3D molecular conformer generation. It is centered on the `ml_conformer_generator` library, which produces 3D conformers using diffusion and graph-based models.

## Key points

- The library is distributed as `mlconfgen` and supports PyTorch-based inference.
- Model weights are gated on HuggingFace and must be downloaded manually.
- The weights are licensed under CC BY-NC-ND 4.0, which restricts commercial use.
- Generated molecules should be treated as exploratory artifacts, not validated by PubChem/ChEMBL membership.
- 3D structure preservation is essential for the frontend visualization.
- A browser-side chemistry depiction library can support Phase 2 SMILES-to-2D artwork; that depiction is not conformer generation or geometry preservation.
- A frontend-compatible WASM conformer generator is being developed separately and will be integrated only after its interface is available.

## Relevant constraints

- Preserve coordinate fidelity: MolBlock/SDF format is preferred over SMILES-only serialization.
- Keep model weights out of source control.
- Prioritize a small, disposable spike that can be refactored.
- Do not add full production APIs, database, or authentication in the first phase.
- Preserve the completed Python spike as the proven Phase 1 path; do not build an interim API while waiting for the frontend-compatible WASM generator.

## Future research directions

- RDKit.js bundle behavior, SVG rendering, and failure handling for Phase 2
- Frontend generator-adapter design and generated geometry contract for Phase 3
- Lightweight 3D viewer compatibility with actual generated geometry for Phase 4
- Best practice for storing generated conformers in frontend-friendly JSON
- PubChem/ChEMBL lookup as enrichment, not validation
