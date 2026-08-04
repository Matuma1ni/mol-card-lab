---
phase: 3
slug: frontend-wasm-generation
status: approved
shadcn_initialized: false
preset: none
created: 2026-07-23
---

# Phase 3 — UI Design Contract

> Visual and interaction contract for browser-local `mlconfgen` generation. Generated geometry is represented in the UI only through normalized adapter results; Phase 4 owns all 3D rendering.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none — retain the existing manual CSS-token system |
| Preset | not applicable |
| Component library | none; React components with CSS classes |
| Icon library | none; use text labels and the existing CSS spinner, not new icon dependencies |
| Font | existing system sans stack; use existing monospace stack only for compact technical values |

**Existing visual language to preserve:** light `#f6f7f4` canvas, white header, sage collectible card with dark ink borders, rounded rectangular panels, and one green primary action. Do not introduce a dashboard shell, a dark runtime console, a new card type, or a 3D viewer.

**Source:** `frontend/src/index.css`, `frontend/src/styles/App.css`, and `frontend/src/styles/MoleculeCard.css`. No `components.json`, Tailwind, or other component-system configuration exists; shadcn initialization is intentionally out of scope for this established CSS-based prototype.

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Inline status-dot gap and compact badge padding |
| sm | 8px | Label-to-value gap, compact controls, stacked status copy |
| md | 16px | Default panel padding and card-to-status spacing |
| lg | 24px | Generation-control group and section spacing |
| xl | 32px | Desktop page gutter and major stage separation |
| 2xl | 48px | Reserved for major section breaks if the stage gains a second block |
| 3xl | 64px | Reserved for page-level separation; do not add solely for Phase 3 |

Exceptions: the primary action and Retry action have a minimum 44px interactive height; the existing 72px header remains unchanged.

---

## Typography

Use exactly these Phase 3 sizes and only these weights for new generation UI. Existing card typography remains unchanged unless it is touched to show Phase 3 status.

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px | 400 | 1.5 |
| Label | 12px | 700 | 1.3 |
| Heading | 16px | 700 | 1.2 |
| Display | 24px | 700 | 1.2 |

Technical counts and model/runtime detail use the existing monospace stack at 12px or 14px. Never render a MolBlock, raw ONNX URL, stack trace, or internal runtime object in the card.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#f6f7f4` | Application canvas; neutral status-panel background |
| Secondary (30%) | `#cad4c3` with `#e3e9dd` inset panels | Collectible card and its information panels; generation summary panel |
| Accent (10%) | `#557c62` | Primary **Generate conformers** action; selected generated-result indicator; successful-result count emphasis; retry action border/text |
| Destructive | `#ef4444` | Not used in Phase 3: there are no destructive actions |

Accent reserved for: the enabled primary generation action, selected-result indicator, successful generated-count emphasis, and the retry action. It is not a generic link, border, or background color.

State colors use the established ink/sage palette before introducing new colors: pending uses muted ink `#667063` and the existing neutral shimmer; filtered partial success uses `#557c62` plus explanatory text; actionable failure uses dark ink `#20231f` on a pale neutral panel with the Retry action. Do not use red for a non-destructive runtime failure.

---

## Component and Layout Contract

1. Keep the existing single-column, centered `.card-stage` and the collectible molecule card as the visual focus. Place one compact `GenerationStatus` block between the card and the primary action, or immediately above the action when the card is pending. It must not exceed the card width (420px).
2. Add one primary button labelled **Generate conformers**. It replaces the phase-specific action in the stage only when the runtime proof is available; it uses the existing green button styling and minimum 44px height. Do not expose raw model paths, ONNX runtime selection, seed controls, diffusion controls, or file pickers.
3. Generated results reuse the existing card selection/rendering flow. A small result selector is permitted only when two or more conformers are returned: label it **Generated conformer**, show an ordinal such as `1 of 3`, and make selected state apparent with the accent color plus text. Do not create a gallery, persistence feature, or generated-result save/delete controls.
4. Keep `Molecule2DPreview` as card artwork. If a normalized generated conformer has no SMILES for a 2D depiction, retain the card shell and show the existing artwork fallback with `2D preview unavailable`; this does not invalidate the successful generated MolBlock.
5. The UI imports only the normalized generator contract and status/result mapping. It never imports `mlconfgen`, `MLConformerGenerator`, `seed`, ONNX Runtime, RDKit runtime APIs, or model asset locations.
6. Phase 3 has no viewer region. Do not display coordinates or MolBlock as an interactive visualization; an optional compact `Geometry ready for Phase 4` label is allowed after a successful result, but no 3D affordance is shown.

---

## Generation Request Mapping

Each existing local card fixture is the sole UI-selectable source for the adapter's context-based `GenerateRequest`. Extend every local fixture with these internal-only fields:

| Fixture field | Required value | Request mapping | UI visibility |
|---------------|----------------|-----------------|---------------|
| `referenceContext` | A fixed tuple of exactly three finite numbers: `[number, number, number]` | Forward as `GenerateRequest.referenceContext` | Hidden; never render or allow editing |
| `nAtoms` | A fixed positive integer | Forward as `GenerateRequest.nAtoms` | Hidden; never render or allow editing |

On **Generate conformers**, the App must find the currently selected fixture and call the normalized adapter with exactly:

```ts
{
  referenceContext: selectedFixture.referenceContext,
  nAtoms: selectedFixture.nAtoms,
  nSamples: 3,
}
```

`nSamples: 3` is the fixed internal Phase 3 default. It is not user-configurable and is the value used by the progress announcement and requested/generated count copy. Do not add `referenceConformer`, variance, diffusion-step, seed, model-path, runtime, or file-input fields to this UI mapping. Those are adapter/runtime concerns and remain hidden.

Validate the selected fixture before calling the adapter. If it is absent, its `referenceContext` is not exactly three finite numbers, or `nAtoms` is not a positive integer, do not invoke generation. Enter the actionable-failure state with this sanitized reason: `This molecule is missing required local generation data. Choose another molecule and try again.` Keep mock browsing available and do not expose the invalid values.

**Source:** locked user decision from the Phase 3 UI-SPEC revision; the context-based request form is established by `03-CONTEXT.md` and `03-RESEARCH.md`.

---

## Interaction and State Contract

Use a discriminated UI state owned by the App-level generation flow. The existing card-selection controls remain disabled only while their own artwork/card preload is pending; generation state must not be mislabeled as a 2D-preview load.

| State | Visual treatment | Controls and behavior | Required accessible announcement |
|-------|------------------|-----------------------|---------------------------------|
| Runtime unavailable | Compact neutral status panel, heading `Local generator unavailable`, with no error styling | Disable **Generate conformers**. Preserve existing mock-card browsing. Do not call a backend or offer a network fallback. | `role="status"`: `Local generator unavailable. Generation stays on this device and requires a compatible browser runtime.` |
| Model loading | Existing neutral shimmer/spinner, heading `Preparing local generator…` | Disable generation and result-selection controls; keep the current card visible. Start only after an explicit generation request or the agreed initialization point; do not imply a server upload. | `aria-busy="true"` and `role="status"`: `Preparing local generator on this device…` |
| Generation in progress | Same neutral in-progress treatment, heading `Generating conformers…` | Disable **Generate conformers** and result selector. Preserve the last successful card/result until the new response completes; no partial streaming UI. | `aria-busy="true"` and `role="status"`: `Generating {nSamples} conformers on this device…` |
| Success: all requested results | Sage summary panel; heading `Conformers generated` | Enable result selection if there is more than one result. Show `Generated {numGenerated} of {numRequested} requested conformers.` Select the first returned conformer deterministically. | `role="status"`: `Generated {numGenerated} of {numRequested} requested conformers.` |
| Success: filtered partial result | Same successful sage treatment, not an error treatment; heading `Conformers generated with filtering` | Keep all returned conformers selectable. Show `Generated {numGenerated} of {numRequested} requested conformers. {numRequested - numGenerated} invalid conformer(s) were filtered.` Never show Retry as required remediation. | `role="status"`: the complete requested/generated/filtered count sentence |
| Successful zero-result edge case | Neutral information panel, heading `No valid conformers returned` | Keep **Generate conformers** enabled for a new attempt; preserve the previous result/card rather than clearing it. Explain that the run completed but no valid conformers remained after filtering. | `role="status"`: `The local generator completed, but no valid conformers remained after filtering. Try Generate conformers again.` |
| Actionable failure | Pale neutral panel with strong ink heading `Generation could not start` or `Generation failed`; show one short sanitized reason | Re-enable **Generate conformers**. Include **Retry generation** when initialization/model loading/generation can be attempted again. Keep previous successful result and mock browsing available. Never expose a stack trace. | `role="alert"`: `{sanitized reason} Retry generation to try again locally.` |

**Failure copy mapping:**

- Missing or unreadable model assets: `The local model files could not be loaded. Check that the required model files are available, then retry.`
- Unsupported browser/runtime proof failure: `This browser cannot run the local conformer generator in this build. Use a supported browser configuration; no server fallback is available.`
- Invalid normalized response or missing MolBlock: `Generation completed without usable 3D geometry. Retry generation; if it continues, record this local runtime failure for the prototype.`
- Unexpected adapter error: `Local generation failed. Retry generation to try again on this device.`

The adapter must provide a sanitized, user-safe failure category/message. The UI does not infer package/runtime details from thrown errors.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | Generate conformers |
| In-progress CTA | Generating conformers… |
| Runtime-unavailable heading | Local generator unavailable |
| Model-loading heading | Preparing local generator… |
| Generation heading | Generating conformers… |
| Full-success heading | Conformers generated |
| Filtered-success heading | Conformers generated with filtering |
| Filtered-success body | Generated `{numGenerated}` of `{numRequested}` requested conformers. `{filtered}` invalid conformer(s) were filtered. |
| Zero-result heading | No valid conformers returned |
| Zero-result body | The local generator completed, but no valid conformers remained after filtering. Try Generate conformers again. |
| Error state | Local generation failed. Retry generation to try again on this device. |
| Retry CTA | Retry generation |
| Geometry handoff label | Geometry ready for Phase 4 |
| Destructive confirmation | None — Phase 3 has no destructive action, deletion, or persistence |

Use sentence case, specific counts, and `local`/`on this device` language where describing generation. Do not claim a molecule is chemically validated, saved, uploaded, or visible in 3D.

---

## Accessibility and Motion

- Use native `<button>` controls; disabled controls retain visible disabled styling and an explanatory status message rather than being hidden.
- Give the status block `role="status"` for non-error transitions and `role="alert"` only for failures. Announce a completed generation once; do not repeatedly announce spinner animation.
- Keep the current molecule card as the stable focus context during loading and failures. On successful generation, move focus only if the user invoked generation by keyboard: focus the status heading, not a generated card.
- The card/result selector has an explicit accessible name containing its ordinal, for example `Generated conformer 2 of 3`.
- Honor `prefers-reduced-motion`: replace shimmer/spinner animation with a static `Preparing local generator…` or `Generating conformers…` label.
- Preserve readable contrast for ink `#20231f` on the light/sage surfaces and do not communicate filtered partial success through color alone; the count sentence is mandatory.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not applicable — shadcn is not initialized |
| third-party | none | not applicable — no third-party registry blocks permitted for Phase 3 |

---

## Implementation Boundaries and Phase 4 Handoff

- Generation is browser-local only. The UI must make no HTTP generation request and must not present an API/server fallback.
- The model-loading UI is contingent on the browser-runtime proof. If the proof fails, implement only the unavailable-runtime state and record the concrete blocker; do not fake a successful generator UI.
- Every successful selectable result maps to a normalized conformer with required `molBlock`. Coordinates, when present, are derived data only; optional SMILES supports 2D artwork but never replaces the MolBlock.
- Record with the Phase 3 result evidence: browser/ONNX runtime configuration, model-asset strategy, a representative MolBlock, coordinate availability and atom-order relationship, and filtered-result ordering. This evidence is the Phase 4 viewer handoff, not a UI feature.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-07-23
