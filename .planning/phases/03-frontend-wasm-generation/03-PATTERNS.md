# Phase 3: Frontend WASM Generation - Pattern Map

**Mapped:** 2026-07-23  
**Files analyzed:** 12 planned/inferred frontend and configuration files  
**Analogs found:** 11 / 12

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `.gitignore` | config | file-I/O | `.gitignore` | exact |
| `frontend/package.json` (+ lockfile) | config | batch | `frontend/package.json` | exact |
| `frontend/public/models/.gitkeep` | config | file-I/O | `frontend/public/rdkit/` | partial-match |
| `frontend/src/types/molecule.ts` | model | transform | `frontend/src/types/molecule.ts` | exact |
| `frontend/src/lib/generator.ts` | service/adapter | request-response | `frontend/src/lib/rdkit.ts` | role-match |
| `frontend/src/lib/generator.test.ts` | test | request-response | `frontend/src/lib/rdkit.test.ts` | exact |
| `frontend/src/App.tsx` | component/controller | event-driven | `frontend/src/App.tsx` | exact |
| `frontend/src/App.test.tsx` | test | event-driven | `frontend/src/App.test.tsx` | exact |
| `frontend/src/components/MoleculeCard.tsx` | component | transform | `frontend/src/components/MoleculeCard.tsx` | exact |
| `frontend/src/components/Molecule2DPreview.tsx` | component | request-response | `frontend/src/components/Molecule2DPreview.tsx` | exact |
| `frontend/src/styles/App.css` | component style | event-driven | `frontend/src/styles/App.css` | exact |
| `frontend/src/components/Molecule2DPreview.test.tsx` | test | request-response | `frontend/src/components/Molecule2DPreview.test.tsx` | exact |

`MoleculeCard` and `Molecule2DPreview` changes are inferred from the approved UI contract: a generated conformer may have no `smiles`, but the card shell must remain and show the existing 2D fallback. Keep this as a narrow optional-SMILES change; do not add a 3D viewer or an API boundary.

## Pattern Assignments

### `frontend/src/lib/generator.ts` (service/adapter, request-response)

**Analog:** `frontend/src/lib/rdkit.ts`

**Imports and adapter-private runtime boundary** (lines 1-30): define low-level interfaces and export only a normalized result/helper API. Follow this shape, but keep every `mlconfgen`, `MLConformerGenerator`, `seed`, ONNX-runtime, and model-path import in this file.

```ts
interface RDKitModule {
  get_mol(smiles: string): RDKitMolecule | null
}

export type RenderSmilesResult =
  | { status: 'success'; svg: string }
  | { status: 'invalid' }

const assetUrl = (file: string) => `${import.meta.env.BASE_URL}rdkit/${file}`
```

**Singleton initialization, asset resolution, and retry-safe reset** (lines 32-87): cache one in-flight initialization promise. On failure, clear it before rethrowing so Retry generation actually attempts a fresh browser-local load.

```ts
let modulePromise: Promise<RDKitModule> | undefined

export function loadRDKit(): Promise<RDKitModule> {
  if (modulePromise) return modulePromise
  modulePromise = loadInitializer().then(/* initialize */).catch((error: unknown) => {
    scriptPromise = undefined
    modulePromise = undefined
    throw error
  })
  return modulePromise
}
```

**Core normalization and cleanup** (lines 90-105): make `mol.toMolBlock()` the required conversion. Reject/sanitize any output without usable MolBlock; do not return raw molecule/runtime objects to React. Coordinate arrays may only be optional derived data in the same atom order.

```ts
try {
  return { status: 'success', svg: molecule.get_svg() }
} finally {
  molecule.delete()
}
```

**Required Phase 3 additions:** export `GenerateRequest`, `GeneratedConformer`, `GenerateResponse`, `generateConformers`, a sanitized error/category surface for the UI, and `resetGeneratorForTests`. Validate exactly one supported reference form before forwarding. Set `filterInvalid: true`; normalize `numRequested`, actual returned count, effective parameters, and `generationSource: 'mlconfgen-js'`.

### `frontend/src/lib/generator.test.ts` (test, request-response)

**Analog:** `frontend/src/lib/rdkit.test.ts`

**Reset global/cache state after each test** (lines 1-8):

```ts
afterEach(() => {
  resetRDKitForTests()
  document.head.innerHTML = ''
  vi.restoreAllMocks()
})
```

**Test concurrent initialization and retry after failure** (lines 17-60): use mocked low-level runtime seams; test shared initialization, a rejected initialization, reset, then a successful retry. Do not load WASM/real ONNX in jsdom.

```ts
const first = loadRDKit()
const second = loadRDKit()
await expect(first).resolves.toBe(module)
await expect(second).resolves.toBe(module)
```

Add concrete cases for both request forms, invalid mixed/missing reference inputs, forwarded `nSamples`/optional generation parameters, MolBlock-first normalization, and partial results (`numGenerated < numRequested`) resolving successfully.

### `frontend/src/types/molecule.ts` (model, transform)

**Analog:** `frontend/src/types/molecule.ts` (lines 5-34)

```ts
export interface Conformer {
  id: string
  name: string
  smiles: string
  molBlock: string
  coordinates: [number, number, number][]
  num_atoms: number
  metadata?: Record<string, unknown>
}
```

Add Phase 3 `GenerateRequest`, `GeneratedConformer`, and `GenerateResponse` alongside existing types. Do **not** alter `Conformer` to represent runtime output: its required name, SMILES, coordinates, and `num_atoms` conflict with the MolBlock-required Phase 3 contract.

### `frontend/src/App.tsx` (component/controller, event-driven)

**Analog:** `frontend/src/App.tsx`

**Local selection state and derived selected record** (lines 21-36): preserve the App-owned state and local mock data flow; add a separate discriminated generation state plus selected generated conformer index/id. Keep mock browsing independent of generator state.

```tsx
const [selectedMoleculeId, setSelectedMoleculeId] = useState(() =>
  randomInitialId(moleculeIds),
)
const [pendingMoleculeId, setPendingMoleculeId] = useState<string | null>(null)

const selectedMolecule = molecules.find(
  (molecule) => molecule.id === selectedMoleculeId,
) || molecules[0]
```

**Stable current card while asynchronous work completes** (lines 49-64): retain the current visible card/result throughout model loading, generation, failures, zero results, and the preload transition. Only select the first newly returned generated conformer after a successful non-empty response.

```tsx
{pendingMolecule && (
  <div className="card-preloader" aria-hidden="true">
    <MoleculeCard
      smiles={pendingMolecule.smiles}
      onLoadingChange={(loading) => {
        if (loading) return
        setSelectedMoleculeId(pendingMolecule.id)
        setPendingMoleculeId(null)
      }}
    />
  </div>
)}
```

**Native button status pattern** (lines 66-81): use native buttons, `disabled`, `aria-busy`, and state-specific label text. Add the compact status block in this stage (or a local presentational child) with `role="status"` for normal states and `role="alert"` only for sanitized failures.

```tsx
<button
  type="button"
  disabled={cardPending || Boolean(pendingMolecule)}
  aria-busy={cardPending || pendingMolecule ? 'true' : undefined}
>
  {cardPending || pendingMolecule ? 'Loading…' : 'Pick another'}
</button>
```

Components may import only `GenerateRequest`/`GenerateResponse` and adapter functions. No runtime object, ONNX URL, raw error, coordinate display, or HTTP call belongs here.

### `frontend/src/App.test.tsx` (test, event-driven)

**Analog:** `frontend/src/App.test.tsx`

**Mock a child boundary and retain callbacks** (lines 5-25): mock the adapter/module boundary, retain callbacks in a local map or deferred helper, and reset them each test.

```tsx
const reportLoadingBySmiles = new Map<string, (loading: boolean) => void>()

vi.mock('./components/MoleculeCard', () => ({
  default: ({ smiles, onLoadingChange }) => {
    reportLoadingBySmiles.set(smiles, onLoadingChange)
    return <article data-testid="card">{smiles}</article>
  },
}))
```

**Interaction assertions** (lines 36-63): use `act`, `fireEvent`, role/name queries, and tests that prove prior card visibility until async completion. Add cases for unavailable, loading, in-progress, full success, filtered partial success, zero valid results, sanitized failure/retry, and first-result selection.

### `frontend/src/components/MoleculeCard.tsx` (component, transform)

**Analog:** `frontend/src/components/MoleculeCard.tsx`

**Preserve the card shell and keep loading aggregation explicit** (lines 22-46): accept optional generated SMILES only if needed to satisfy the UI contract; keep card metadata/previews independently pending and do not reuse generation loading as card artwork loading.

```tsx
useEffect(() => {
  onLoadingChange?.(pubChemPending || previewPending)
}, [onLoadingChange, previewPending, pubChemPending])
```

Keep PubChem enrichment best-effort and optional. Generated MolBlock remains authoritative and is not passed to PubChem or rendered as a viewer in this phase.

### `frontend/src/components/Molecule2DPreview.tsx` (component, request-response)

**Analog:** `frontend/src/components/Molecule2DPreview.tsx`

**Discriminated UI state and stale-promise guard** (lines 10-47): reuse this state-machine style for 2D preview behavior. For absent generated SMILES, skip RDKit invocation and directly show the existing fallback; do not make successful geometry depend on a depiction.

```tsx
type PreviewState =
  | { status: 'loading' }
  | { status: 'ready'; svg: string }
  | { status: 'invalid' }
  | { status: 'error' }

useEffect(() => {
  let current = true
  // async work, guarded by current
  return () => { current = false }
}, [attempt, onLoadingChange, smiles])
```

**Sanitized fallback and local retry** (lines 67-76): retain `2D preview unavailable`; never expose an adapter/runtime error in the artwork area.

### `frontend/src/components/Molecule2DPreview.test.tsx` (test, request-response)

**Analog:** `frontend/src/components/Molecule2DPreview.test.tsx` (lines 10-20, 47-69)

```ts
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolvePromise) => { resolve = resolvePromise })
  return { promise, resolve }
}

renderMock.mockReturnValueOnce(oldResult.promise).mockReturnValueOnce(newResult.promise)
```

Add a test for absent SMILES rendering `2D preview unavailable` without calling the RDKit helper; preserve existing stale-result and sanitized-error coverage.

### `frontend/src/styles/App.css` (component style, event-driven)

**Analog:** `frontend/src/styles/App.css`

**Stage sizing and existing action styling** (lines 22-55): put the compact generation status beneath the card within the existing 420px stage. Reuse the sage green action language; do not introduce a dashboard or a new card type.

```css
.card-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(100%, 420px);
  padding-top: var(--spacing-lg);
}

.pick-another-button {
  border: 1px solid #31583d;
  background: #557c62;
  color: #ffffff;
  font-weight: 700;
}
```

**Existing spinner** (lines 62-95): reuse the pseudo-element/animation approach for local model-loading and generation only, with `prefers-reduced-motion` disabling animation. New controls need a 44px minimum height and status/selector styles must stay within the approved palette.

### Configuration and static-model location (config, file-I/O/batch)

**Analogs:** `.gitignore` lines 33-36; `frontend/package.json` lines 5-18; `frontend/src/lib/rdkit.ts` lines 30 and 71-76.

```gitignore
# Model weights (large files, gated access)
backend/data/model_weights/*.pt
backend/data/model_weights/*.onnx
!backend/data/model_weights/.gitkeep
```

```json
"copy:rdkit-assets": "mkdir -p public/rdkit && cp ... public/rdkit/",
"prebuild": "npm run copy:rdkit-assets",
"build": "tsc && vite build"
```

Add explicit ignores for `frontend/public/models/*.onnx` while permitting a directory marker if one is required. Do not commit the two weight files. Package changes add only the locked browser-proof dependencies (`mlconfgen` and a verified browser-compatible ONNX runtime); keep the production build chain intact. Use a Vite public static path resolved from `import.meta.env.BASE_URL`, not an API endpoint or raw hard-coded deployment path.

## Shared Patterns

### Browser-local adapter boundary

**Source:** `frontend/src/lib/rdkit.ts` lines 30-87  
**Apply to:** `generator.ts`, `App.tsx`, generator tests

One lib module owns static asset URLs, low-level runtime initialization, an idempotent promise, and failure cleanup. React receives a narrow normalized API only.

### Async UI safety

**Source:** `frontend/src/components/Molecule2DPreview.tsx` lines 23-47; `frontend/src/App.tsx` lines 49-64  
**Apply to:** generation flow and result selector

Guard stale async completions, preserve the previously usable card/result while work is pending, and reset/retry without showing raw errors.

### Testing async boundaries

**Source:** `frontend/src/lib/rdkit.test.ts` lines 17-60; `frontend/src/App.test.tsx` lines 36-63  
**Apply to:** `generator.test.ts`, `App.test.tsx`

Mock the adapter-private runtime for unit tests, use deferred promises for UI states, and retain manual served-production browser smoke evidence for the actual WASM/ONNX proof.

### Styling and accessibility

**Source:** `frontend/src/styles/App.css` lines 22-95; `frontend/src/components/Molecule2DPreview.tsx` lines 49-76  
**Apply to:** status block, Generate/Retry buttons, and selector

Use the current card-stage width, sage action treatment, native buttons, visible disabled state, and sanitized fallback copy. The UI spec additionally requires `role="status"` for non-error state changes and `role="alert"` only for failure.

## No Analog Found

| File/Concern | Role | Data Flow | Reason |
|---|---|---|---|
| Browser `mlconfgen` + explicitly injected ONNX-runtime smoke configuration | proof/config | file-I/O | No generator or ONNX browser runtime exists locally; follow `03-RESEARCH.md` only after package/browser inspection. |
| Representative Phase 4 handoff evidence | documentation | batch | No current generated browser output exists. Record it only after the required served-production proof. |

## Metadata

**Analog search scope:** `frontend/src`, `frontend/package.json`, `frontend/vite.config.ts`, `.gitignore`, Phase 3 planning artifacts  
**Files scanned:** 18  
**Pattern extraction date:** 2026-07-23
