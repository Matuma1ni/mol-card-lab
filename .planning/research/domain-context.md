# Research: Domain Context

## Summary

This project is a prototype exploring machine-learned 3D molecular conformer generation. It is centered on the `ml_conformer_generator` library, which produces 3D conformers using diffusion and graph-based models.

## Key points

- The library is distributed as `mlconfgen` and supports PyTorch-based inference.
- Model weights are gated on HuggingFace and must be downloaded manually.
- The weights are licensed under CC BY-NC-ND 4.0, which restricts commercial use.
- Generated molecules should be treated as exploratory artifacts, not validated by PubChem/ChEMBL membership.
- 3D structure preservation is essential for the frontend visualization.
- RDKit.js/WebAssembly can support frontend 2D depiction from SMILES, but only as card artwork and not as conformer generation or geometry preservation.

## Relevant constraints

- Preserve coordinate fidelity: MolBlock/SDF format is preferred over SMILES-only serialization.
- Keep model weights out of source control.
- Prioritize a small, disposable spike that can be refactored.
- Do not add full production APIs, database, or authentication in the first phase.
- Do not replace the Python `ml_conformer_generator` runtime path with browser-side ONNX, browser-side inference, or RDKit.js.

## Future research directions

- 3Dmol.js viewer compatibility with MolBlock/SDF output
- Optional `Molecule2DPreview` using RDKit.js/WebAssembly for SMILES-derived SVG card artwork
- Best practice for storing generated conformers in frontend-friendly JSON
- Lightweight backend API design for future integration
- PubChem/ChEMBL lookup as enrichment, not validation
