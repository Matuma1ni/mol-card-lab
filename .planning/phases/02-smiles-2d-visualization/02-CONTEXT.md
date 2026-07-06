# Phase 2: 2D SMILES visualization - Context

**Gathered:** 2026-07-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the card's placeholder visualization with an RDKit.js-generated 2D SVG depiction for one randomly selected molecule from exactly 10 predefined local examples. This phase remains frontend-only and does not add conformer generation, 3D visualization, APIs, persistence, uploads, or external molecule lookup.

</domain>

<decisions>
## Implementation Decisions

### Molecule selection
- **D-01:** Choose a random molecule on every page load.
- **D-02:** Replace the existing labeled tabs with one `Pick another` control.
- **D-03:** `Pick another` must always choose a molecule different from the one currently displayed.
- **D-04:** Place `Pick another` directly below the molecule card.

### Loading and failure behavior
- **D-05:** While RDKit.js initializes or renders, preserve the artwork dimensions and show a fixed-size skeleton labeled `Loading molecule…`.
- **D-06:** Invalid SMILES shows `2D preview unavailable` and retains the SMILES text for debugging context; do not expose the raw RDKit.js error in the card.
- **D-07:** RDKit.js initialization failure shows the fallback plus a `Retry preview` action.
- **D-08:** Disable `Pick another` while the depiction is loading or retrying.

### Card composition
- **D-09:** The 2D depiction fully replaces the existing 3D placeholder in Phase 2; do not retain or split space with a Phase 4 placeholder.
- **D-10:** Display the molecule name inside the card directly above the artwork, following the title-above-image composition of an MTG card.
- **D-11:** Center the SVG within the artwork frame, preserve its aspect ratio, and provide generous padding.
- **D-12:** Keep the existing labeled `SMILES` footer and allow long values to wrap.

### Molecule collection
- **D-13:** Use exactly 10 familiar, named drug-like compounds.
- **D-14:** Every compound must be unique; do not include alternate forms or duplicate records.
- **D-15:** Planning may select the exact compounds, balancing useful RDKit.js depiction coverage with manageable SMILES strings.

### the agent's Discretion
- Exact compound list, subject to D-13 through D-15.
- Internal component/helper names and styling details that do not change the locked behavior above.
- Testing library and RDKit.js packaging/loading mechanics compatible with the existing Vite application.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and constraints
- `.planning/ROADMAP.md` — Defines Phase 2 goal, boundaries, deliverables, and acceptance criteria.
- `.planning/REQUIREMENTS.md` — Defines the fixed 10-example dataset, RDKit.js SVG behavior, loading/fallback requirements, and exclusions.
- `.planning/PROJECT.md` — Defines the frontend-first architecture and separation between 2D artwork and generated 3D geometry.
- `AGENTS.md` — Defines project-specific phase constraints and RDKit.js isolation requirements.

### Existing implementation contract
- `frontend/src/types/molecule.ts` — Current conformer and card prop types that Phase 2 should evolve minimally.
- `frontend/src/data/mockMolecules.ts` — Existing local mock-data shape and four-record baseline to replace with 10 named examples.
- `frontend/src/App.tsx` — Current selected-conformer state and tab navigation to replace with random selection.
- `frontend/src/components/MoleculeCard.tsx` — Existing card composition and Phase 2 integration point.
- `frontend/src/components/MoleculeViewer3D.tsx` — Placeholder component that Phase 2 replaces in the card artwork area.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `MoleculeCard`: retain the collectible card shell, keyboard behavior, and SMILES footer while replacing its viewer child.
- `getMockConformerSet`: retain a local fixture-loading boundary while expanding the collection and adding names.
- `Conformer` and `MoleculeCardProps`: evolve the current frontend contract rather than introducing a parallel molecule model without need.

### Established Patterns
- `App.tsx` owns selected molecule state with React `useState`; Phase 2 can keep selection local and synchronous.
- Frontend styling is component-scoped through files under `frontend/src/styles/`.
- The app currently displays one selected card, so the random single-card interaction fits the existing layout.

### Integration Points
- Replace `MoleculeViewer3D` usage inside `MoleculeCard` with an isolated RDKit.js 2D viewer component.
- Replace `structure-nav` tabs in `App.tsx` with random initialization and the below-card `Pick another` control.
- Add a molecule name/label to the frontend data type and local examples.
- Add RDKit.js and any test tooling through `frontend/package.json` without backend changes.

</code_context>

<specifics>
## Specific Ideas

- The card should resemble an MTG card's information hierarchy: molecule title above the artwork, both inside the card frame.
- `Pick another` is demo selection from a predefined collection, never molecule generation.

</specifics>

<deferred>
## Deferred Ideas

- Browser-side conformer generation belongs to Phase 3.
- 3D visualization of actual generated conformers belongs to Phase 4.

</deferred>

---

*Phase: 2-2D SMILES visualization*
*Context gathered: 2026-07-05*

