# Phase 2: 2D SMILES visualization - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-05
**Phase:** 2-2D SMILES visualization
**Areas discussed:** Selection flow, loading and failure behavior, card composition, molecule collection

---

## Selection Flow

| Decision | Options considered | Selected |
|----------|--------------------|----------|
| Initial molecule | Random on load; fixed first molecule; restore previous selection | Random on load |
| Navigation | Existing tabs; previous/next; `Pick another` | `Pick another` |
| Repeat behavior | Always different; allow repeats; shuffled cycle | Always different |
| Control placement | Below card; card footer; page header | Below card |

**Notes:** The random interaction selects from predefined examples; it is not molecule generation.

---

## Loading and Failure Behavior

| Decision | Options considered | Selected |
|----------|--------------------|----------|
| Loading state | Fixed skeleton; spinner; retain placeholder | Fixed `Loading molecule…` skeleton |
| Invalid SMILES | Fallback plus SMILES; generic fallback; raw RDKit.js error | Fallback plus SMILES |
| Library failure | Retry action; fallback only; automatic retry | `Retry preview` action |
| Selection during loading | Enabled; disabled; hidden | Disabled |

**Notes:** Raw library errors should not appear in the collectible card UI.

---

## Card Composition

| Decision | Options considered | Selected |
|----------|--------------------|----------|
| Main artwork | Replace placeholder; add Phase 4 note; split view | Replace placeholder |
| Name placement | Header inside card; footer; outside card | Header inside card |
| SVG fitting | Centered/padded; maximum fill; fixed size | Centered/padded |
| SMILES display | Wrapping footer; truncated line; hidden | Wrapping footer |

**Notes:** The user specifically requested an MTG-like composition with the molecule name above the artwork but inside the card.

---

## Molecule Collection

| Decision | Options considered | Selected |
|----------|--------------------|----------|
| Collection character | Structurally varied basics; drug-like; teaching examples | Drug-like |
| Identity | Familiar named compounds; synthetic labels; mixed | Familiar named compounds |
| Duplicate policy | Ten unique; alternate forms; metadata duplicates | Ten unique compounds |
| Exact list ownership | Planning chooses; user provides; separate review | Planning chooses |

**Notes:** The exact set should balance recognizable compounds, depiction coverage, and manageable SMILES strings.

## the agent's Discretion

- Exact set of 10 compounds within the locked collection constraints.
- Internal implementation names, compatible RDKit.js loading details, and test tooling.

## Deferred Ideas

- WASM conformer generation in Phase 3.
- 3D visualization of generated conformers in Phase 4.
