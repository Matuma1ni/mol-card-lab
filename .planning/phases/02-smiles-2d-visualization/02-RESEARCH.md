# Phase 2: 2D SMILES visualization - Research

**Researched:** 2026-07-06
**Domain:** RDKit.js/WASM 2D molecular depiction in React/Vite
**Confidence:** HIGH

## User Constraints

### Implementation Decisions

#### Molecule selection
- **D-01:** Choose a random molecule on every page load.
- **D-02:** Replace the existing labeled tabs with one `Pick another` control.
- **D-03:** `Pick another` must always choose a molecule different from the one currently displayed.
- **D-04:** Place `Pick another` directly below the molecule card.

#### Loading and failure behavior
- **D-05:** While RDKit.js initializes or renders, preserve the artwork dimensions and show a fixed-size skeleton labeled `Loading molecule…`.
- **D-06:** Invalid SMILES shows `2D preview unavailable` and retains the SMILES text for debugging context; do not expose the raw RDKit.js error in the card.
- **D-07:** RDKit.js initialization failure shows the fallback plus a `Retry preview` action.
- **D-08:** Disable `Pick another` while the depiction is loading or retrying.

#### Card composition
- **D-09:** The 2D depiction fully replaces the existing 3D placeholder in Phase 2; do not retain or split space with a Phase 4 placeholder.
- **D-10:** Display the molecule name inside the card directly above the artwork, following the title-above-image composition of an MTG card.
- **D-11:** Center the SVG within the artwork frame, preserve its aspect ratio, and provide generous padding.
- **D-12:** Keep the existing labeled `SMILES` footer and allow long values to wrap.

#### Molecule collection
- **D-13:** Use exactly 10 familiar, named drug-like compounds.
- **D-14:** Every compound must be unique; do not include alternate forms or duplicate records.
- **D-15:** Planning may select the exact compounds, balancing useful RDKit.js depiction coverage with manageable SMILES strings.

### the agent's Discretion
- Exact compound list, subject to D-13 through D-15.
- Internal component/helper names and styling details that do not change the locked behavior above.
- Testing library and RDKit.js packaging/loading mechanics compatible with the existing Vite application.

### Deferred Ideas
- Browser-side conformer generation belongs to Phase 3.
- 3D visualization of actual generated conformers belongs to Phase 4.

## Summary

Use the official `@rdkit/rdkit` distribution and keep its asynchronous singleton initialization behind one frontend module. The official project documents `initRDKitModule`, `locateFile`, `get_mol(smiles)`, and `mol.get_svg()` and requires the JavaScript and WASM distribution files to be deployed together. [VERIFIED: https://github.com/rdkit/rdkit-js] The repository announced an npm-maintenance transition on 2026-04-07, so the implementation should pin the tested package version rather than use an open-ended range. [CITED: https://github.com/rdkit/rdkit-js/blob/master/README.md]

Rendering should be a small state machine (`loading | ready | invalid | init-error`) owned by `Molecule2DPreview`. Create the RDKit molecule only for the selected SMILES, call `delete()` in `finally`, and ignore stale async results after an effect cleanup. Insert only SVG returned by the trusted, pinned RDKit runtime; isolate raw SVG insertion in this component because React warns that arbitrary `dangerouslySetInnerHTML` content is an XSS boundary. [CITED: https://react.dev/reference/react-dom/components/common]

**Primary recommendation:** Package pinned RDKit.js assets locally, initialize the module once, render and dispose one molecule per selection, and test the UI through a mocked RDKit adapter plus one browser smoke check against the real WASM asset.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|---|---|---|---|
| Ten-example molecule catalog | Browser / Client | CDN / Static | Compile-time local data; no lookup or persistence |
| Random selection | Browser / Client | — | Synchronous React state only |
| SMILES parsing and SVG depiction | Browser / Client | CDN / Static | RDKit runs in browser; WASM is a static asset |
| Loading/retry/fallback states | Browser / Client | — | Component-owned presentation and recovery |

## Project Constraints (from AGENTS.md)

- Phase 2 is frontend-only RDKit.js depiction from exactly 10 local SMILES examples.
- RDKit.js is artwork only, never generation, backend connectivity, or 3D geometry.
- No API/backend endpoint, FastAPI, uvicorn, httpx, database, queue, auth, deployment, generator integration, 3D viewer, or external chemical lookup.
- Keep initialization and SVG injection in a small component/helper and reuse the existing local mock flow.
- Keep code boring and minimal; prefer explicit functions; do not assume a project license.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---|---|---|---|
| `@rdkit/rdkit` | `2025.3.4-1.0.0` (pin exactly) | Official RDKit MinimalLib JS/WASM build | Official RDKit JavaScript distribution and documented SVG API [VERIFIED: https://www.npmjs.com/org/rdkit] |
| React | existing `18.2.x` | Component state/effects | Existing application stack |
| Vite | existing `4.4.x` | Build and serve static WASM assets | Existing application stack |

No additional runtime wrapper is needed. Copy `RDKit_minimal.js` and `RDKit_minimal.wasm` from the installed package into `public/rdkit/` during setup. The local adapter must append one same-origin script element for `${import.meta.env.BASE_URL}rdkit/RDKit_minimal.js`, read the resulting `window.initRDKitModule` global, and initialize it with `locateFile` resolving the sibling `${import.meta.env.BASE_URL}rdkit/RDKit_minimal.wasm`. Cache both script loading and module initialization, and clear failed cached state so Retry performs a fresh attempt. [VERIFIED: https://github.com/rdkit/rdkit-js]

**Installation:**

```bash
cd frontend
npm install --save-exact @rdkit/rdkit@2025.3.4-1.0.0
```

## Package Legitimacy Audit

| Package | Registry | Age | Source Repo | Verdict | Disposition |
|---|---|---|---|---|---|
| `@rdkit/rdkit` | npm | Established official scoped package | `github.com/rdkit/rdkit-js` | OK — official RDKit org/repository and npm scope | Approved; pin exact release |

No packages were removed or flagged. The local legitimacy seam and `npm view` returned no usable output in this environment; identity and current published release were cross-checked against the official RDKit repository and official npm organization page. Re-run `npm view @rdkit/rdkit version scripts.postinstall` before installation; any unexpected postinstall script is a stop condition.

## Architecture Patterns

### System Architecture Diagram

```text
10 local examples
      |
random initial pick / Pick another (different id)
      |
MoleculeCard ── title + SMILES footer
      |
Molecule2DPreview
      ├─ shared init promise ──> static RDKit JS + WASM
      ├─ get_mol(smiles) ──> get_svg() ──> trusted SVG artwork
      ├─ parse failure ──> unavailable fallback
      └─ init failure ──> unavailable fallback + Retry
```

### Recommended Project Structure

```text
frontend/
├── public/rdkit/                 # pinned RDKit_minimal.js/.wasm
└── src/
    ├── components/Molecule2DPreview.tsx
    ├── lib/rdkit.ts              # singleton init + narrow adapter types
    ├── data/mockMolecules.ts     # exactly 10 named examples
    └── styles/Molecule2DPreview.css
```

### Pattern 1: Resettable singleton module loader

Cache one initialization promise so React renders do not instantiate WASM repeatedly. On rejection, clear the cached promise so `Retry preview` can genuinely retry. Resolve the WASM URL from Vite's public base (not a filesystem/node_modules path). Keep the library's global surface behind a narrow local interface.

### Pattern 2: Disposable molecule per render

```typescript
// API names verified against https://www.rdkitjs.com/ and official rdkit-js README.
const mol = rdkit.get_mol(smiles)
try {
  if (!mol) throw new Error('Invalid SMILES')
  return mol.get_svg()
} finally {
  mol?.delete()
}
```

Emscripten-backed objects own WASM heap allocations; explicit disposal avoids growth as users repeatedly pick molecules. [VERIFIED: https://github.com/rdkit/rdkit-js]

### Pattern 3: Effect cancellation

Each SMILES change starts `loading`; an effect-local cancellation flag prevents an older initialization/render result from overwriting a newer selection or an unmounted component. Cleanup does not destroy the shared RDKit module; it only invalidates that render attempt.

### Anti-Patterns to Avoid

- Initialize RDKit in every component render or every SMILES change.
- Fetch RDKit from unpkg at runtime; the prototype should build and run from pinned local assets.
- Put RDKit objects in React state or omit `mol.delete()`.
- Treat invalid SMILES and module initialization failure as the same state; only initialization failure receives Retry.
- Retain the click/keyboard `role="button"` on the entire existing card when selection moves to the dedicated button.
- Generate the initial random id directly on every render; use a lazy `useState` initializer.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| SMILES parsing/2D coordinates | Custom parser/layout | RDKit.js `get_mol`/`get_svg` | Chemistry parsing and depiction have extensive edge cases |
| WASM loading | Repeated script tags per component | One cached `initRDKitModule` promise | Stable lifecycle and retry semantics |
| SVG chemistry markup | Manual SVG atom/bond drawing | RDKit-produced SVG | Correct bond, aromatic, charge, and label depiction |

## Common Pitfalls

### WASM asset path mismatch
**What goes wrong:** JS loads but initialization rejects or returns a MIME/404 error.  
**Avoid:** deploy JS and WASM together and test the production build/preview, not only Vite dev. Use `locateFile` when URLs differ. [VERIFIED: https://github.com/rdkit/rdkit-js]

### Permanent failed singleton
**What goes wrong:** Retry reuses the same rejected promise.  
**Avoid:** reset the cached promise on rejection before exposing the retry action.

### WASM heap leaks
**What goes wrong:** repeated selection slowly grows memory.  
**Avoid:** call `delete()` for every successful molecule in `finally`, including SVG-generation errors.

### Stale depiction race
**What goes wrong:** a slow earlier render replaces the currently selected card.  
**Avoid:** cancel/ignore stale effect completions and key state transitions to `smiles` plus retry attempt.

### Unsafe SVG injection
**What goes wrong:** raw markup becomes an XSS sink if future data/runtime boundaries broaden.  
**Avoid:** inject only SVG emitted by the pinned RDKit runtime from the fixed local list, keep `dangerouslySetInnerHTML` in one component, and never concatenate molecule names or SMILES into the SVG string. React explicitly treats this API as dangerous for untrusted markup. [CITED: https://react.dev/reference/react-dom/components/common]

## State of the Art

| Old Approach | Current Approach | Impact |
|---|---|---|
| Unscoped `rdkit` npm package | Official scoped `@rdkit/rdkit` | Avoid the unrelated/stale community package |
| Runtime CDN dependency | Pinned local package assets | Reproducible, offline-capable prototype |

The official npm-release repository entered a maintenance transition in April 2026. Pin the verified build and isolate the adapter so a later official distribution change is localized. [CITED: https://github.com/rdkit/rdkit-js/blob/master/README.md]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|---|---|---|
| A1 | Vite 4 can serve the copied public WASM file with the required MIME behavior in the target browser. | Architecture | Production preview reveals a load failure; explicitly validate it. |

## Resolved Questions

1. **RESOLVED — Exact asset-copy and loading mechanism**
   - Add a deterministic npm script that copies both official distribution assets from the exact locked `@rdkit/rdkit` package into `public/rdkit/` before build.
   - Load `RDKit_minimal.js` once through a same-origin script element, obtain its `window.initRDKitModule` global, and pass a `locateFile` callback that resolves `RDKit_minimal.wasm` from the same `BASE_URL`-aware directory.
   - Verify both files exist under `dist/rdkit/`, both are the resources actually requested by the production preview, and a failed script or initialization attempt clears cached state for Retry.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|---|---|---|---|---|
| Node.js | frontend build | ✓ | 24.12.0 | — |
| npm | dependency/build | ✓ | 11.6.2 | — |
| `@rdkit/rdkit` | depiction | ✗ | planned pinned version | Install during implementation |

## Validation Architecture

### Test Framework

| Property | Value |
|---|---|
| Framework | No frontend unit framework currently configured; add a minimal version-compatible Vitest + jsdom/React Testing Library harness in Wave 0 |
| Config file | none — Wave 0 |
| Quick run command | `cd frontend && npm test -- --run` (after script/tooling is added) |
| Full suite command | `cd frontend && npm test -- --run && npm run build` |

### Phase Requirements → Test Map

| Requirement | Behavior | Test Type | Automated/Manual Check | File Exists? |
|---|---|---|---|---|
| Dataset | exactly 10 unique ids/names/SMILES | unit | dataset invariant test | ❌ Wave 0 |
| Selection | lazy random initial pick and next differs | unit/component | mock `Math.random`; repeated button clicks | ❌ Wave 0 |
| Depiction | selected SMILES yields SVG and old molecule is disposed | component with adapter mock | assert SVG and `delete()` | ❌ Wave 0 |
| States | loading, invalid, init error/retry, disabled selection | component | adapter deferred/rejected/null cases | ❌ Wave 0 |
| Assets | real WASM loads from built app | browser smoke | `npm run build && npm run preview` | manual/UAT |

### Sampling Rate
- **Per task:** targeted unit/component test plus `npm run build`.
- **Per wave:** full frontend test suite.
- **Phase gate:** full suite, production build, and manual real-WASM smoke check.

### Wave 0 Gaps
- [ ] Add a frontend unit/component test runner and DOM environment.
- [ ] Add adapter mocks so most tests do not instantiate real WASM.
- [ ] Add one production-preview UAT for real JS/WASM asset loading and SVG display.
- [ ] Use `02-VALIDATION.md` as the executable Nyquist contract and replace its provisional task IDs after detailed plans are created.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---|---|---|
| V2 Authentication | no | No authentication in scope |
| V3 Session Management | no | No sessions in scope |
| V4 Access Control | no | No protected resources |
| V5 Input Validation | yes | Fixed local SMILES list; RDKit parse failure maps to inert text fallback |
| V6 Cryptography | no | No cryptographic operation |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---|---|---|
| Raw SVG/HTML injection | Tampering / Elevation | Only inject pinned RDKit output; isolate sink; never concatenate local metadata into SVG |
| Dependency/CDN substitution | Tampering | Exact dependency version and local packaged assets; lockfile reviewed |
| WASM resource exhaustion | Denial of Service | Fixed ten manageable inputs; dispose molecule objects; disable selection during active rendering |

## Sources

### Primary (HIGH confidence)
- https://github.com/rdkit/rdkit-js — official install, asset deployment, `locateFile`, React/TypeScript references, maintenance notice.
- https://www.rdkitjs.com/ — official `get_mol` and `get_svg` depiction examples.
- https://www.npmjs.com/org/rdkit — official package identity and published release.
- https://react.dev/reference/react-dom/components/common — raw HTML/SVG injection security boundary.

### Project sources
- `AGENTS.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/PROJECT.md`, `02-CONTEXT.md`.
- Existing React components, types, data fixtures, styles, and package manifest under `frontend/`.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — official package repository, npm organization, and API examples.
- Architecture: HIGH — constrained client-only integration and inspected current code.
- Pitfalls: HIGH — official asset contract plus standard Emscripten/React lifecycle requirements.

**Research date:** 2026-07-06  
**Valid until:** 2026-07-20 (short window due to active RDKit.js npm maintenance transition)
