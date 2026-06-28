# Design Assumptions & Unknowns

## Core Assumptions

### 1. Serialization Format
**Assumption**: Each generated conformer is serialized as JSON with:
- `molBlock`: 3D SDF string and primary geometry representation
- `coordinates`: Array of [x, y, z] arrays (for data processing)
- `smiles`: Canonical SMILES (for identity)
- `metadata`: Generation params, variance, etc.

**Rationale**: MolBlock preserves 3D geometry for visualization; raw coordinates enable analysis.

**Risk**: Future 3Dmol.js integration may need format handling. Mitigated by keeping MolBlock as the preserved geometry representation.

---

### 2. Reference Molecule
**Assumption**: Use a local `.mol` file passed with `--reference-mol` / `-r` as the preferred Phase 1 input.

**Fallback**: If no `.mol` file is provided, use embedded `DEMO_SMILES` only as a smoke-test fallback.

**Metadata**: `.mol` inputs set `reference_source: mol_file` and `reference_3d_geometry: provided` or `embedded`. The smoke-test fallback sets `reference_source: demo_smiles` and `reference_3d_geometry: embedded`.

**Rationale**: Local files keep Phase 1 reproducible without external lookup services while still exercising reference-molecule loading.

---

### 3. Model Weights Handling
**Assumption**: User downloads weights manually from HuggingFace and places them in `backend/data/model_weights/`.

**Rationale**: Gated access requires terms acceptance; not safe to auto-download. Gitignore prevents accidental commits.

**Risk**: Onboarding friction. Mitigation: Clear README instructions + error messages.

**Future**: Consider authenticated download tooling after Phase 1.

---

### 4. Mock Data Source
**Assumption**: Generate realistic mock molecules once (offline) using RDKit, commit to frontend codebase.

**Rationale**: Frontend dev doesn't require running Python/model. Realistic UI testing.

**Risk**: Mock data gets stale if model changes. Mitigation: Script to regenerate mock data on demand.

---

### 5. Frontend 2D Depiction
**Assumption**: RDKit.js/WebAssembly may be used in the React frontend to render a 2D SVG depiction from a SMILES string.

**Scope**: This is only for collectible card preview/artwork, such as a future `Molecule2DPreview` component.

**Non-goal**: RDKit.js is not the generator, backend connector, or source of 3D geometry. It must not replace Python `ml_conformer_generator` integration, browser-side ONNX must remain out of Phase 1, and SMILES-derived SVG must not be treated as preserving generated conformer coordinates.

**Timing**: Optional Phase 1.5 or later enhancement. It is not required for Phase 1 success while the current placeholder 3D viewer remains.

---

### 6. No FastAPI in Spike
**Assumption**: `generate_demo.py` is a standalone script; no HTTP API yet.

**Rationale**: Prove generator works locally first. API adds complexity.

**Risk**: Eventually need to decouple Python script from frontend. Mitigation: Serialization + output structure designed for API migration.

---

### 7. Chemical Validity vs. Database Existence
**Assumption**: Generated molecules are chemically valid (passes RDKit checks) but NOT necessarily in PubChem/ChEMBL.

**Rationale**: `mlconfgen` includes validity post-processing (sanitization, MMFF94 opt). Database lookup is enrichment, not validation.

**Risk**: User confusion—generated molecule might not exist in known databases. Mitigation: UI clearly labels "generated" vs. "known".

---

### 8. 3D Coordinates Preservation
**Assumption**: MolBlock format (not bare SMILES) is the source of truth for 3D coordinates.

**Rationale**: SMILES loses 3D geometry; MolBlock preserves conformer coordinates.

**Risk**: A future viewer may need format conversion. Mitigation: keep MolBlock as the preserved geometry and add conversion later only if needed.

---

## Unknowns (TBD)

- [ ] What is the optimal variance/sampling strategy for demo? (Use library defaults for now)
- [ ] How many conformers are "enough" for a good UX? (Start with 5–10 for speed)
- [ ] Should each card show one conformer or all N conformers? (Start with one, add carousel later)
- [ ] How to handle molecule uniqueness? (Coordinate-based vs. SMILES-based deduplication)
- [ ] Will future 3Dmol.js integration accept raw MolBlock strings or need format conversion?
- [ ] Should a future `Molecule2DPreview` use RDKit.js-generated SVG, and how should it coexist with the placeholder/future 3D viewer?
- [ ] Should backend expose query/filtering endpoints? (Not in spike; data-driven later)
- [ ] How to structure state management in React for large conformer sets?

---

## Tracked Risks

1. **GPU not available**: Script should detect and warn, but fall back to CPU (slower).
2. **Model weight download fails**: Clear error message + manual instructions.
3. **RDKit installation issues**: Conda recommended for complex dependencies.
4. **Future 3Dmol.js integration**: Placeholder viewer may need format-specific handling later.
5. **Serialization format wrong for future viewer**: Need format conversion helper later if MolBlock is not accepted directly.
6. **2D SVG confused with geometry**: Document that RDKit.js SMILES-to-SVG is card artwork only and does not preserve generated 3D conformer coordinates.

---

## Validation Plan

1. Run `generate_demo.py` locally → verify output JSON is valid.
2. Load JSON-shaped mock data in frontend → verify placeholder UI renders without errors.
3. Test conformer serialization round-trip → verify MolBlock and derived coordinates are preserved.
