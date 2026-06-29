# Phase 2: Frontend integration and real data flow - Context

**Gathered:** 2026-06-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a minimal local FastAPI wrapper around the existing Phase 1 Python generation pipeline and connect the React UI to its real conformer output. Phase 2 includes a synchronous `POST /generate`, generation controls, real-data selection, and robust multi-conformer loading/error state. The existing viewer remains a geometry-aware placeholder; real 3Dmol.js rendering is deferred.

This phase does not add file upload, a database, a job queue, authentication, production deployment, PubChem/ChEMBL lookup, browser-side ONNX generation, or RDKit.js/WebAssembly generation.

</domain>

<decisions>
## Implementation Decisions

### Data handoff and API contract
- **D-01:** Use a minimal FastAPI wrapper around the existing Phase 1 generation and serialization path.
- **D-02:** Expose a synchronous `POST /generate` endpoint accepting optional `referenceMolPath`, `nSamples`, and `variance` fields.
- **D-03:** When `referenceMolPath` is supplied, load a local `.mol` file. Accept only relative paths contained under `backend/data/reference_molecules/`.
- **D-04:** When `referenceMolPath` is omitted, use `DEMO_SMILES` only as an explicitly labeled smoke-test/demo fallback.
- **D-05:** Reuse the existing generator defaults when `nSamples` or `variance` is omitted. Invalid request values return FastAPI `422` responses rather than being clamped.
- **D-06:** Return the same top-level conformer JSON shape as `generate_demo.py`. Preserve `molBlock` as the primary geometry representation and coordinate arrays as derived convenience data.
- **D-07:** Preserve reference metadata including `reference_source`, `reference_3d_geometry`, and optional `reference_path`.
- **D-08:** On partial generation failure, return successful conformers and include warning/failure counts in response metadata. Do not place failed pseudo-conformers in the `conformers` array.

### Conformer organization and selection
- **D-09:** Preserve the existing one-selected-card interaction and drive it from a selector populated with real conformers.
- **D-10:** Label selector entries `Conformer 1`, `Conformer 2`, and so on, with canonical SMILES shown as secondary text.
- **D-11:** Preserve backend response order. Do not group or sort conformers in the frontend.
- **D-12:** After each successful generation, replace the prior conformer set and select the first successful conformer.
- **D-13:** Show only SMILES, atom count, and reference source as selected-card metadata.
- **D-14:** Use horizontally scrollable conformer buttons when the selector overflows.
- **D-15:** Keep the existing viewer area as a placeholder that confirms MolBlock geometry is loaded while real rendering remains deferred.

### Loading and failure behavior
- **D-16:** While generation is running, keep the current conformers visible, disable Generate, and show an indeterminate loading state. Do not allow concurrent generation requests.
- **D-17:** If generation fails completely, preserve the previous conformers and show an inline error near the Generate control.
- **D-18:** Treat a successful response containing zero conformers as a recoverable error: preserve previous conformers and explain that none were generated.
- **D-19:** Display concise user-facing errors and log technical response details to the browser console. Do not expose raw FastAPI responses in the main UI.

### Generation controls
- **D-20:** Keep `referenceMolPath` visible and place `nSamples` and `variance` under an Advanced options section.
- **D-21:** Implement `referenceMolPath` as free text for a relative path, with `backend/data/reference_molecules/` shown as the allowed-root prefix or hint.
- **D-22:** When the path is blank, omit `referenceMolPath` from the request and clearly tell the user that `DEMO_SMILES` will be used.
- **D-23:** Preserve entered control values after generation and provide a Reset to defaults action.

### the agent's Discretion
- Exact FastAPI module/file layout and internal function extraction, provided the existing Phase 1 generation and serialization behavior remains the single implementation path.
- Exact numeric validation bounds beyond reusing existing defaults and rejecting invalid values.
- Exact loading indicator, inline error wording, Advanced-options presentation, and API-base/CORS development configuration.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project scope and phase contract
- `AGENTS.md` — Repository scope, geometry representation, reference metadata, and explicit non-goals.
- `.planning/ROADMAP.md` — Current Phase 2 boundary after deferring real 3Dmol.js integration.
- `.planning/REQUIREMENTS.md` — Existing serialization, frontend, and project constraints carried forward from Phase 1.
- `docs/ASSUMPTIONS.md` — Serialization shape, mock-data assumptions, geometry rules, and known frontend integration unknowns.

### Reference molecule handling
- `docs/architecture/ADR-0001-reference-molecule-input.md` — Accepted local `.mol` preference, `DEMO_SMILES` fallback, and reference metadata semantics.
- `backend/src/generate_demo.py` — Existing CLI orchestration whose generation behavior and defaults the endpoint must reuse.
- `backend/src/serialize.py` — Canonical conformer JSON and MolBlock serialization path.

### Existing frontend contract
- `frontend/src/types/molecule.ts` — Current TypeScript conformer shape.
- `frontend/src/App.tsx` — Existing selected-conformer state and one-card interaction.
- `frontend/src/data/mockMolecules.ts` — Mock provider to replace with real API data.
- `frontend/src/components/MoleculeViewer3D.tsx` — Existing placeholder that remains in Phase 2.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/src/generate_demo.py`: already owns reference loading, fallback selection, generation orchestration, and output writing; the API should call extracted/reused functions rather than duplicate chemistry logic.
- `backend/src/serialize.py`: already emits `conformers`, `count`, metadata, `molBlock`, coordinates, SMILES, and atom counts.
- `frontend/src/types/molecule.ts`: provides the current `Conformer` and `ConformerSet` contracts.
- `frontend/src/App.tsx`: already implements selected-ID state and fallback to the first conformer.
- `frontend/src/components/MoleculeCard.tsx` and `frontend/src/components/MoleculeViewer3D.tsx`: reusable selected-card and placeholder surfaces.

### Established Patterns
- Backend JSON uses camel-case `molBlock` alongside snake-case `num_atoms` and metadata fields; Phase 2 should preserve compatibility unless a deliberate shared-contract migration is planned.
- MolBlock is the source of truth for generated 3D geometry; coordinate arrays and SMILES must not replace it.
- The frontend currently receives a complete conformer set and derives the selected conformer locally with React state.

### Integration Points
- Add the FastAPI wrapper at the backend boundary around the existing generation/serialization functions.
- Replace `getMockConformerSet()` usage in `frontend/src/App.tsx` with request/result state while preserving the selected-card flow.
- Extend the existing card/navigation styles for generation controls, horizontal selector overflow, loading, warnings, and inline errors.

</code_context>

<specifics>
## Specific Ideas

- Endpoint: `POST /generate`.
- Request fields: `referenceMolPath`, `nSamples`, `variance`.
- The UI should visibly distinguish a local `.mol` reference from the `DEMO_SMILES` fallback through returned reference metadata.
- Partial success is a first-class successful response with usable conformers and failure counts, not an all-or-nothing result.

</specifics>

<deferred>
## Deferred Ideas

- Real 3Dmol.js rendering using serialized MolBlock data — deferred beyond Phase 2.
- File upload, persistence, background jobs, authentication, deployment, identity lookup/enrichment, and browser-side generation remain future capabilities.

</deferred>

---

*Phase: 2-Frontend integration and real data flow*
*Context gathered: 2026-06-28*
