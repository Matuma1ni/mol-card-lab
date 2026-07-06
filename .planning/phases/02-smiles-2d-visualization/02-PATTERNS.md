# Phase 2: 2D SMILES visualization - Pattern Map

**Mapped:** 2026-07-06
**Files analyzed:** 13 new or modified files
**Analogs found:** 10 / 13 (three additions have no exact in-repository analog)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `frontend/src/App.tsx` | component/controller | event-driven | existing `frontend/src/App.tsx` | exact |
| `frontend/src/components/MoleculeCard.tsx` | component | transform | existing `frontend/src/components/MoleculeCard.tsx` | exact |
| `frontend/src/components/Molecule2DPreview.tsx` | component | async request-response/transform | `frontend/src/components/MoleculeViewer3D.tsx` | role-match only |
| `frontend/src/lib/rdkit.ts` | service/utility | async request-response/transform | none | new pattern |
| `frontend/src/data/mockMolecules.ts` | model/data fixture | batch | existing `frontend/src/data/mockMolecules.ts` | exact |
| `frontend/src/types/molecule.ts` | model | transform | existing `frontend/src/types/molecule.ts` | exact |
| `frontend/src/styles/App.css` | component style | transform | existing `frontend/src/styles/App.css` | exact |
| `frontend/src/styles/MoleculeCard.css` | component style | transform | existing `frontend/src/styles/MoleculeCard.css` | exact |
| `frontend/src/styles/Molecule2DPreview.css` | component style | transform | `frontend/src/styles/MoleculeViewer3D.css` | role-match |
| `frontend/src/index.css` | style entry point | batch | existing `frontend/src/index.css` | exact |
| `frontend/package.json` / `frontend/package-lock.json` | config | batch | existing package manifests | exact |
| frontend unit/component test files and test config | test/config | event-driven/async | none | new pattern |
| `frontend/public/rdkit/RDKit_minimal.{js,wasm}` plus deterministic copy mechanism | static asset/config | file-I/O | none | new pattern |

## Pattern Assignments

### `frontend/src/App.tsx` (component/controller, event-driven)

**Analog:** the existing file itself.

**Imports and local-state pattern** (`frontend/src/App.tsx:1-10`):

```tsx
import { useState } from 'react'
import MoleculeCard from './components/MoleculeCard'
import { getMockConformerSet } from './data/mockMolecules'
import { Conformer } from './types/molecule'

function App() {
  const conformerSet = getMockConformerSet()
  const conformers = conformerSet.conformers
  const [selectedConformerId, setSelectedConformerId] = useState<string>(conformers[0]?.id ?? '')
```

Keep ownership of selection in `App`; replace the fixed first id with a lazy `useState` initializer so randomness runs once per mount. Replace the tab event handlers with one below-card button handler. The handler should choose from records whose id differs from the current id. Keep the selected record derived from the id, as at lines 12-14.

**Composition pattern** (`frontend/src/App.tsx:42-49`):

```tsx
<section className="card-stage" aria-label="Selected molecule card">
  {selectedConformer && (
    <MoleculeCard
      conformer={selectedConformer}
      onSelect={setSelectedConformerId}
    />
  )}
</section>
```

Retain one selected card in the stage. Change the callback contract from selecting the card itself to reporting preview loading state if needed; the dedicated `Pick another` button belongs after the card and is disabled from that state.

### `frontend/src/components/MoleculeCard.tsx` (component, transform)

**Analog:** the existing file itself.

**Imports and composition pattern** (`frontend/src/components/MoleculeCard.tsx:1-4`, `22-32`):

```tsx
import React from 'react'
import { MoleculeCardProps } from '../types/molecule'
import MoleculeViewer3D from './MoleculeViewer3D'
import '../styles/MoleculeCard.css'

<div className="card-preview">
  <MoleculeViewer3D
    molBlock={conformer.molBlock}
    smiles={conformer.smiles}
  />
</div>

<div className="card-footer">
  <div className="card-label">SMILES</div>
  <div className="card-smiles">{conformer.smiles}</div>
</div>
```

Keep the shell, preview wrapper, and labeled SMILES footer. Add the molecule name between the shell opening and artwork. Replace only the viewer child with `Molecule2DPreview` and pass `smiles` plus the smallest callback needed to expose loading state.

**Interaction correction:** do not copy the whole-card `role="button"`, click handler, keyboard handler, or pointer cursor from lines 11-20. Selection is moving to a real button below the card, so the card becomes presentational.

### `frontend/src/components/Molecule2DPreview.tsx` (component, async request-response/transform)

**Partial analog:** `frontend/src/components/MoleculeViewer3D.tsx` for component shape and isolated styling only.

**Component/effect convention** (`frontend/src/components/MoleculeViewer3D.tsx:1-11`, `20-30`):

```tsx
import React, { useEffect, useRef } from 'react'
import { MoleculeViewer3DProps } from '../types/molecule'
import '../styles/MoleculeViewer3D.css'

export const MoleculeViewer3D: React.FC<MoleculeViewer3DProps> = ({
  molBlock,
  smiles,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // viewer lifecycle belongs here
  }, [molBlock])

  return (
    <div className="molecule-viewer-3d" ref={containerRef}>
      ...
    </div>
  )
}
```

Follow the named `React.FC` export plus default export and colocated CSS import. Unlike the placeholder, use explicit render states (`loading`, `ready`, `invalid`, `init-error`), an effect-local cancellation flag, and a retry attempt key. Keep all `dangerouslySetInnerHTML` usage inside this component and insert only SVG returned by the pinned local RDKit runtime.

**Required error distinction:** invalid SMILES renders `2D preview unavailable` and visible SMILES without retry; module initialization failure renders the same safe fallback plus `Retry preview`. Never surface raw RDKit errors.

### `frontend/src/lib/rdkit.ts` (service/utility, async request-response/transform)

**Analog:** none. This is the first frontend service/adapter and first WASM lifecycle boundary.

Use plain exported interfaces/functions consistent with the simple module style in `frontend/src/data/mockMolecules.ts`. Keep one module-level cached initialization promise, clear it on rejection so Retry is real, and expose a narrow depiction operation rather than the whole RDKit global. Resolve assets using Vite's public base. For every successful `get_mol(smiles)`, call `delete()` in `finally`, including when `get_svg()` throws.

Do not copy `MoleculeViewer3D`'s empty effect: RDKit initialization, parse failure, disposal, and rejection behavior must be implemented and testable in this adapter.

### `frontend/src/data/mockMolecules.ts` (model/data fixture, batch)

**Analog:** the existing file itself.

**Typed fixture and loader pattern** (`frontend/src/data/mockMolecules.ts:10-16`, `135-153`):

```ts
import { Conformer } from '../types/molecule'

const BENZENE_CONFORMER: Conformer = {
  id: 'mock_benzene_1',
  smiles: 'c1ccccc1',
  molBlock: `...`,
  // remaining card fields
}

export const MOCK_CONFORMERS: Conformer[] = [
  BENZENE_CONFORMER,
  // ...
]

export function getMockConformerSet() {
  return {
    conformers: MOCK_CONFORMERS,
    count: MOCK_CONFORMERS.length,
    metadata: { source: 'mock_data' },
  }
}
```

Retain the typed local constant collection and loader boundary. Expand to exactly ten unique, familiar, named drug-like compounds and add a `name` field. Prefer manageable canonical SMILES with varied depiction shapes. Do not fetch identities or add a second parallel data model.

### `frontend/src/types/molecule.ts` (model, transform)

**Analog:** the existing file itself.

**Interface pattern** (`frontend/src/types/molecule.ts:11-18`, `29-37`):

```ts
export interface Conformer {
  id: string
  smiles: string
  molBlock: string
  coordinates: [number, number, number][]
  num_atoms: number
  metadata?: Record<string, unknown>
}

export interface MoleculeCardProps {
  conformer: Conformer
  onSelect?: (id: ConformerID) => void
}
```

Evolve `Conformer` minimally with required display `name`. Update card props to match the new non-clickable card and loading callback. Define preview/adapter interfaces here only if they are shared; otherwise keep them next to the RDKit adapter to avoid broadening the chemistry data contract.

### CSS files (component style, transform)

**Analogs:** `frontend/src/styles/App.css`, `MoleculeCard.css`, and `MoleculeViewer3D.css`.

**Layout convention** (`frontend/src/styles/App.css:80-86`):

```css
.card-stage {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-width: 0;
  padding-top: var(--spacing-lg);
}
```

Change the stage to a vertical grouping for card plus button and remove obsolete sidebar/tab rules. Preserve the existing responsive breakpoint style.

**Artwork frame convention** (`frontend/src/styles/MoleculeCard.css:26-38`):

```css
.card-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex: 0 0 65%;
  min-height: 0;
  border: 1px solid #20231f;
  border-radius: 6px;
  background: #f6f7f4;
  overflow: hidden;
}
```

Reuse this fixed artwork frame to prevent layout shift. Add an MTG-like title inside the card above it, remove clickable-card cursor/focus/hover affordances, and preserve wrapping via `.card-smiles { overflow-wrap: anywhere; }` from lines 64-74.

**Viewer fill convention** (`frontend/src/styles/MoleculeViewer3D.css:1-8`, `18-26`):

```css
.molecule-viewer-3d {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
```

Copy the full-frame centered layout for loading/failure states. For ready output, constrain the injected SVG to the frame with width/height limits, preserved aspect ratio, and generous padding.

**Style entry-point convention** (`frontend/src/index.css:1-3`):

```css
@import './styles/App.css';
@import './styles/MoleculeCard.css';
@import './styles/MoleculeViewer3D.css';
```

Replace the obsolete viewer import with `Molecule2DPreview.css` if the component also imports it; this project currently tolerates the duplicate import pattern, so keep changes minimal rather than reorganizing all CSS.

### Package, asset, and test configuration (config/test/file-I/O)

**Package analog:** existing `frontend/package.json:6-21` uses short npm scripts and separates runtime from dev dependencies. Pin `@rdkit/rdkit` exactly under dependencies. Add only the minimum test dependencies and script required by the plan.

There is no existing test harness or static-asset copy pattern. The implementation plan must therefore spell out:

- a deterministic copy from the installed pinned RDKit package into `frontend/public/rdkit/`;
- production-build verification that both JS and WASM land under `dist/rdkit/`;
- a minimal Vitest/jsdom/React Testing Library setup if automated component tests are included;
- mocked adapter tests for dataset invariants, selection, disposal, loading, invalid input, initialization failure, retry, and disabled selection;
- one manual production-preview smoke check against the real WASM files.

Do not use runtime CDN loading, backend endpoints, or browser-side generation.

## Shared Patterns

### Imports and TypeScript

Use relative imports, no aliases, extensionless internal imports, single quotes, and no semicolons, matching all current frontend modules. Strict TypeScript, unused-local, and unused-parameter checks are enabled in `frontend/tsconfig.json:19-23`.

### State Ownership

`App.tsx` owns which record is selected; `Molecule2DPreview` owns depiction lifecycle state. Communicate only the boolean loading/retrying state needed to disable `Pick another`. Do not introduce a store or context provider.

### Error Handling and Resource Safety

The current frontend has no established error abstraction. Keep errors local: the adapter rejects initialization failures and treats parsing failure distinctly; the component maps these to inert user-facing states. Always dispose the Emscripten molecule in `finally`, ignore stale effect completions after cleanup, and reset the cached initialization promise after rejection.

### Accessibility

Use a native button for `Pick another` and Retry. Remove the synthetic button semantics from the card. Preserve a stable artwork region during loading, expose meaningful loading/fallback text, and ensure disabled controls use the native `disabled` attribute.

### Phase Boundary

All work remains under `frontend/`. RDKit SVG is collectible-card artwork derived from local SMILES only. Do not add backend/API code, conformer generation, 3D viewing, persistence, uploads, external lookup, or deployment work.
