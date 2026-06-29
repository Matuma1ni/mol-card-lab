# Phase 2: Frontend integration and real data flow - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-28
**Phase:** 2-Frontend integration and real data flow
**Areas discussed:** Data handoff and API contract, Conformer organization and selection, Loading and failure behavior, Generation controls

---

## Data handoff and API contract

| Decision | Alternatives considered | Selected |
|----------|-------------------------|----------|
| Frontend handoff | Static JSON; Vite middleware; lightweight Python endpoint | Minimal FastAPI `POST /generate` |
| Request contract | User specified optional `referenceMolPath`, `nSamples`, and `variance` | Reuse Phase 1 generation and response shape |
| Reference-path boundary | Any local path; configurable root | Relative paths under `backend/data/reference_molecules/` |
| Defaults and validation | API-specific defaults; clamp values | Existing defaults; invalid input returns `422` |
| Partial failures | Failed entries; fail entire request | Successful conformers plus warning/failure counts |

**User's choice:** Minimal synchronous FastAPI wrapper with a constrained local reference path and the existing conformer JSON contract.
**Notes:** MolBlock remains primary geometry. `DEMO_SMILES` remains only a demo/smoke fallback. Preserve reference source/geometry/path metadata.

---

## Conformer organization and selection

| Decision | Alternatives considered | Selected |
|----------|-------------------------|----------|
| Main presentation | Card grid; grid plus detail | One selected card plus selector |
| Labels | SMILES primary; backend IDs | `Conformer N` plus secondary SMILES |
| New-result selection | Preserve old ID; no selection | First successful conformer |
| Ordering | Group by SMILES; sort by SMILES/ID | Backend response order |
| Repeat generation | Append; retain run history | Replace the current set |
| Card metadata | Generation parameters; all metadata | SMILES, atom count, reference source |
| Deferred viewer | MolBlock text; remove viewer | Placeholder confirms MolBlock is loaded |
| Selector overflow | Wrapped rows; dropdown | Horizontal scrolling |

**User's choice:** Keep the existing selected-card interaction and replace its mock set with ordered real conformers.
**Notes:** Real 3Dmol.js rendering was removed from the Phase 2 roadmap and deferred.

---

## Loading and failure behavior

| Decision | Alternatives considered | Selected |
|----------|-------------------------|----------|
| In-flight state | Clear results; concurrent requests | Preserve results, disable Generate, show loading |
| Total failure | Clear results; toast only | Preserve results with inline error |
| Zero conformers | Empty state; silent preservation | Recoverable error preserving previous results |
| Error detail | Raw response; generic-only message | Concise UI message plus console details |

**User's choice:** Preserve usable state across slow or failed generation attempts and keep errors local to the controls.
**Notes:** Concurrent requests are not part of Phase 2.

---

## Generation controls

| Decision | Alternatives considered | Selected |
|----------|-------------------------|----------|
| Visible controls | All visible; reference only | Reference visible, sample controls under Advanced |
| Reference input | Filename only; file dropdown | Relative free text with allowed-root hint |
| Empty path | Prefilled example; block request | Clearly labeled `DEMO_SMILES` fallback |
| After generation | Reset all; preserve path only | Preserve values with Reset to defaults |

**User's choice:** Keep the common reference input obvious while making sampling controls available without dominating the UI.
**Notes:** A file dropdown was rejected because it would require new file-listing support.

---

## the agent's Discretion

- Internal module layout, exact numeric bounds, visual styling details, error copy, and local API connectivity configuration.

## Deferred Ideas

- Real 3Dmol.js rendering.
- File upload, database, job queue, auth, production deployment, PubChem/ChEMBL lookup, browser-side ONNX, and RDKit.js/WebAssembly generation.
