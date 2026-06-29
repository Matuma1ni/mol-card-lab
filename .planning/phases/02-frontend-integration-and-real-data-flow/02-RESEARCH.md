# Phase 2: Frontend integration and real data flow - Research

**Researched:** 2026-06-28
**Domain:** Local FastAPI wrapper over the existing conformer pipeline plus React request/result state
**Confidence:** HIGH for codebase architecture; LOW for unverified package versions

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

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

### Deferred Ideas (OUT OF SCOPE)
- Real 3Dmol.js rendering using serialized MolBlock data — deferred beyond Phase 2.
- File upload, persistence, background jobs, authentication, deployment, identity lookup/enrichment, and browser-side generation remain future capabilities.
</user_constraints>

## Project Constraints (from AGENTS.md)

- Python and `ml_conformer_generator` remain the generation/runtime path. `[VERIFIED: AGENTS.md]`
- MolBlock remains the primary generated geometry representation; coordinates are derived convenience data. `[VERIFIED: AGENTS.md]`
- A provided 3D reference must remain distinguishable from geometry embedded by the application. `[VERIFIED: AGENTS.md]`
- Model weights stay manually downloaded and outside git. `[VERIFIED: AGENTS.md]`
- Do not add database, job queue, authentication, production deployment, browser-side ONNX, or PubChem/ChEMBL lookup. `[VERIFIED: AGENTS.md; 02-CONTEXT.md]`
- Keep implementation explicit and minimal; avoid premature abstractions and scope expansion. `[VERIFIED: AGENTS.md]`
- Do not create or assume a project license. `[VERIFIED: AGENTS.md]`

## Summary

Phase 2 should refactor the orchestration currently embedded in `generate_demo.py` into one reusable synchronous service function, then make both the CLI and a one-route FastAPI module call that function. The existing `load_reference_molecule`, `ConformerGeneratorWrapper`, and `mols_to_json` behavior already provides the chemistry and serialization seams; duplicating those steps in the route would create immediate contract drift. `[VERIFIED: backend/src/generate_demo.py; backend/src/molecule_utils.py; backend/src/models.py; backend/src/serialize.py]`

The HTTP boundary should own camelCase request parsing, numeric validation, and safe conversion of a relative `referenceMolPath` into a resolved path under `REFERENCE_MOLECULES_DIR`. The generation service should own weight checks, molecule validation, generation, successful-result filtering, and metadata. The React app should own form state separately from the last successful conformer set so pending and failed requests cannot erase usable results. `[VERIFIED: 02-CONTEXT.md; backend/src/config.py; frontend/src/App.tsx]`

**Primary recommendation:** implement a thin route → reusable generation service → existing serializer flow, proxy `/api` through Vite for local development, and test the service/route without loading model weights. `[VERIFIED: codebase architecture; ASSUMED for Vite proxy convention]`

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|---|---|---|---|
| Request schema and 422 validation | API/backend | — | HTTP input validation belongs at the route boundary. `[VERIFIED: 02-CONTEXT.md]` |
| Reference path containment | API/backend | Filesystem | Only the backend can resolve and inspect local paths. `[VERIFIED: backend/src/config.py]` |
| Reference loading and conformer generation | API/backend service | `mlconfgen`/RDKit | Existing Python modules already own chemistry behavior. `[VERIFIED: backend/src/generate_demo.py]` |
| MolBlock serialization and metadata | API/backend serializer | — | Existing serializer is the canonical output seam. `[VERIFIED: backend/src/serialize.py]` |
| Generation controls and request lifecycle | Browser/client | API/backend | React owns user intent; API owns execution and response. `[VERIFIED: 02-CONTEXT.md]` |
| Selected conformer derivation | Browser/client | — | Existing `App.tsx` already derives the selected item locally. `[VERIFIED: frontend/src/App.tsx]` |
| Geometry display | Browser/client | — | Phase 2 keeps the placeholder and consumes `molBlock`; real rendering is deferred. `[VERIFIED: 02-CONTEXT.md]` |

## Existing and Required Stack

### Existing

| Library/tool | Version in repository/environment | Purpose |
|---|---:|---|
| Python | `>=3.10`; local interpreter 3.14.6 | Backend runtime. `[VERIFIED: backend/pyproject.toml; local command]` |
| `mlconfgen` | 0.4.3 | Conformer generation. `[VERIFIED: backend/requirements.txt; installed metadata]` |
| RDKit | 2025.3.4 | Molecule I/O, embedding, validation, MolBlock. `[VERIFIED: backend/requirements.txt; local environment]` |
| pytest | 7.4.0 | Existing backend test dependency, though no tests currently exist. `[VERIFIED: backend/requirements.txt; repository scan]` |
| React | declared `^18.2.0`, installed 18.3.1 | UI state and components. `[VERIFIED: frontend/package.json; npm lock installation]` |
| Vite | declared `^4.4.0`, installed 4.5.14 | Frontend dev/build server. `[VERIFIED: frontend/package.json; npm lock installation]` |

### Required additions

| Package | Recommended constraint | Purpose | Status |
|---|---:|---|---|
| `fastapi` | Pin a tested version compatible with Python 3.10+ | Request model, route, 422 validation. `[ASSUMED: external registry verification unavailable in offline retry]` |
| `uvicorn` | Pin a tested version compatible with the selected FastAPI release | Local ASGI server. `[ASSUMED: external registry verification unavailable in offline retry]` |
| `httpx` | Pin in backend dev dependencies | Required by FastAPI `TestClient`. `[ASSUMED: external registry verification unavailable in offline retry]` |

Do not add a frontend state library, API client library, or schema library in this phase; the app has one request and a small explicit state machine. `[VERIFIED: frontend/src/App.tsx; 02-CONTEXT.md]`

**Installation shape (versions must be verified before execution):**

```bash
# backend runtime requirements
fastapi==<verified-version>
uvicorn==<verified-version>

# backend development requirements / optional dev dependency
httpx==<verified-version>
```

## Package Legitimacy Audit

External registry access was unavailable for the required offline retry. The GSD legitimacy seam previously could not retrieve registry age/download/repository signals, so it returned `SUS` rather than `OK`; this is not evidence that the well-known package identities are malicious, but the protocol requires a human verification checkpoint before installation. `[VERIFIED: local GSD legitimacy output]`

| Package | Registry | Age/downloads/source | Verdict | Disposition |
|---|---|---|---|---|
| `fastapi` | PyPI | Not verified offline | SUS | Planner must add package-legitimacy checkpoint before install. |
| `uvicorn` | PyPI | Not verified offline | SUS | Planner must add package-legitimacy checkpoint before install. |
| `httpx` | PyPI | Not verified offline | SUS | Planner must add package-legitimacy checkpoint before install. |

**Packages removed due to SLOP verdict:** none. `[VERIFIED: local GSD legitimacy output]`

## Recommended Architecture

```text
React generation form
  └─ POST /api/generate (camelCase JSON)
       └─ FastAPI request model (422 on invalid numeric input)
            ├─ blank path → DEMO_SMILES fallback
            └─ relative path → resolve under REFERENCE_MOLECULES_DIR
                 └─ shared generate_conformer_data(...)
                      ├─ validate weights
                      ├─ load + validate reference molecule
                      ├─ singleton generator.generate_conformers(...)
                      ├─ retain successful molecules in response order
                      └─ existing MolBlock serializer + shared metadata
                           └─ ConformerSet JSON
                                └─ React replaces results and selects first
```

### Recommended project structure

```text
backend/
├── src/
│   ├── api.py                  # FastAPI app and POST /generate
│   ├── generation_service.py   # reusable orchestration extracted from CLI
│   ├── generate_demo.py        # CLI parsing/output only
│   └── serialize.py            # canonical conformer payload
└── tests/
    ├── test_api.py
    └── test_generation_service.py
frontend/src/
├── api/generate.ts             # typed fetch wrapper and response checks
├── components/GenerationForm.tsx
├── App.tsx                     # request/result/selection owner
└── types/molecule.ts           # request, response, metadata contracts
```

This is intentionally only two new backend layers: HTTP translation and generation orchestration. `[VERIFIED: AGENTS.md minimality rule]`

### Pattern 1: One orchestration path

Extract the current steps from `main()` into a function that returns the payload; keep argument parsing and file writing in `main()`. Both CLI and route call the same function. `[VERIFIED: backend/src/generate_demo.py currently combines all steps]`

The serializer currently emits error pseudo-conformers when passed `None`; filter unsuccessful values before serialization so D-08 is honored. Set top-level `count` to the successful conformer count and add `num_failed = num_requested - num_generated` plus a warning count in shared metadata. `[VERIFIED: backend/src/serialize.py; installed mlconfgen returns only standardized valid molecules but can return fewer than requested]`

### Pattern 2: Containment by resolved path, not string prefix

```python
def resolve_reference_path(value: str, root: Path) -> Path:
    relative = Path(value)
    if relative.is_absolute() or relative.suffix.lower() != ".mol":
        raise ValueError("referenceMolPath must be a relative .mol path")
    resolved_root = root.resolve()
    candidate = (resolved_root / relative).resolve()
    if not candidate.is_relative_to(resolved_root):
        raise ValueError("referenceMolPath escapes the allowed root")
    if not candidate.is_file():
        raise FileNotFoundError(value)
    return candidate
```

`Path.resolve()` is necessary to collapse `..` segments and resolve symlinks; a textual `startswith()` check is insufficient. `[VERIFIED: Python pathlib behavior available in Python 3.10+; exact security guidance ASSUMED offline]`

Return the user-supplied relative path in metadata rather than the resolved absolute path, and ensure both top-level and per-conformer metadata remain consistent. `[VERIFIED: serializer duplicates shared metadata; ASSUMED security recommendation]`

### Pattern 3: Separate form state from last successful data

```typescript
const [conformerSet, setConformerSet] = useState<ConformerSet | null>(null)
const [selectedId, setSelectedId] = useState('')
const [isGenerating, setIsGenerating] = useState(false)
const [error, setError] = useState<string | null>(null)

async function handleGenerate(request: GenerateRequest) {
  setIsGenerating(true)
  setError(null)
  try {
    const next = await generateConformers(request)
    if (next.conformers.length === 0) throw new EmptyGenerationError()
    setConformerSet(next)
    setSelectedId(next.conformers[0].id)
  } catch (cause) {
    console.error(cause)
    setError(toUserMessage(cause))
  } finally {
    setIsGenerating(false)
  }
}
```

Do not clear `conformerSet` at request start or failure. This directly implements D-16 through D-18. `[VERIFIED: 02-CONTEXT.md]`

### Pattern 4: Development proxy

Use a relative frontend URL such as `/api/generate` and configure the existing Vite server to proxy `/api` to the local FastAPI port, rewriting `/api/generate` to `/generate`. This avoids broad CORS configuration and keeps the browser request same-origin during development. `[ASSUMED: standard Vite development pattern; external docs not re-verified offline]`

## Don't Hand-Roll

| Problem | Don't build | Use instead | Why |
|---|---|---|---|
| Request parsing/422 errors | Manual `dict` parsing | FastAPI + Pydantic request model | Locked choice and consistent validation. `[VERIFIED: 02-CONTEXT.md]` |
| Chemistry pipeline | New route-specific RDKit/generator logic | Extracted existing orchestration | Prevents CLI/API divergence. `[VERIFIED: backend/src/generate_demo.py]` |
| Geometry transport | SMILES-only or coordinate-only schema | Existing `molBlock` serializer | MolBlock is the primary geometry contract. `[VERIFIED: AGENTS.md]` |
| Path security | Prefix string checks | `Path.resolve()` plus containment and file checks | Handles traversal and symlink escape. `[ASSUMED: security guidance]` |
| Client state framework | Redux/query cache for one mutation | Local React state | Existing component already owns selection. `[VERIFIED: frontend/src/App.tsx]` |
| CORS wildcard | `allow_origins=["*"]` for convenience | Vite proxy or explicit localhost origins | Scope is local-only and credentials are unnecessary. `[ASSUMED: security guidance]` |

## Common Pitfalls

### Duplicating `generate_demo.py`
**What goes wrong:** CLI and API defaults, metadata, or error behavior drift. `[VERIFIED: all orchestration currently resides in `main()`]`
**Avoidance:** extract first, then make both entry points call the same function.

### Returning serializer error objects as conformers
**What goes wrong:** `mol_to_dict(None, ...)` returns `{id, error}`, violating the TypeScript `Conformer` contract and D-08. `[VERIFIED: backend/src/serialize.py; frontend/src/types/molecule.ts]`
**Avoidance:** remove failures before `mols_to_json` and compute failure metadata from requested minus generated.

### Leaking absolute server paths
**What goes wrong:** passing the resolved path into `load_reference_molecule` currently copies it into `reference_path`, including per-conformer metadata. `[VERIFIED: backend/src/generate_demo.py; backend/src/serialize.py]`
**Avoidance:** separate the filesystem path from the display/metadata path.

### Treating a synchronous response as serialized server execution
**What goes wrong:** a synchronous endpoint means the client waits; it does not itself prove the model singleton is safe under multiple simultaneous clients. `[ASSUMED: framework concurrency behavior not re-verified offline]`
**Avoidance:** keep one local server worker, disable concurrent requests in the UI, and document the prototype as single-user; add a backend generation lock only if manual concurrency testing shows it is needed. `[ASSUMED]`

### `fetch` success assumptions
**What goes wrong:** an HTTP 4xx/5xx can be parsed as if it were a conformer set, or a malformed 200 can replace good state. `[ASSUMED: browser Fetch behavior not re-verified offline]`
**Avoidance:** check `response.ok`, parse error details defensively, and validate at least `conformers` is an array before committing state.

### Metadata placement confusion
**What goes wrong:** selected-card code reads per-conformer metadata while warning UI reads top-level metadata and they disagree. `[VERIFIED: serializer currently copies identical metadata into both places]`
**Avoidance:** create metadata once and pass the same value to serialization; prefer top-level metadata for run-level UI.

### Expensive tests accidentally loading weights
**What goes wrong:** importing or invoking the real service makes API tests slow and environment-dependent. `[VERIFIED: model construction loads weight files and is singleton-backed]`
**Avoidance:** keep model initialization inside the service call and replace the service in route tests with a stub/monkeypatch.

## Validation Architecture

### Test framework

| Property | Backend | Frontend |
|---|---|---|
| Framework | pytest 7.4.0 + FastAPI TestClient after adding HTTPX `[VERIFIED: repo; ASSUMED FastAPI test integration]` | No test runner currently `[VERIFIED: frontend/package.json]` |
| Config | none; Wave 0 uses default discovery | none |
| Quick command | `cd backend && .venv/bin/pytest tests/test_api.py -x` | `cd frontend && npm run build` |
| Full command | `cd backend && .venv/bin/pytest -q` | `cd frontend && npm run build` |

Do not silently add a current Vitest release: the repository is on Vite 4 and current compatibility was not verified offline. The frontend also has no ESLint dependency, configuration, or lint script, so linting is not an available gate. Use backend automation plus the existing frontend TypeScript/Vite build and explicit deterministic browser UAT for Phase 2, or add separately approved frontend-test tooling after version verification. `[VERIFIED: frontend/package.json; frontend/package-lock.json; repository scan; installed Vite 4.5.14; ASSUMED compatibility concern]`

### Decision-to-test map

| Decisions | Behavior | Test type | Command / verification |
|---|---|---|---|
| D-02, D-05 | optional fields default; invalid numeric input is 422 | API integration | `pytest tests/test_api.py -x` |
| D-03 | valid nested relative `.mol` accepted; absolute, traversal, symlink escape, wrong suffix rejected | unit + API | `pytest tests/test_api.py -x` |
| D-04, D-07 | blank path uses demo metadata; file path preserves mol metadata semantics | service unit | `pytest tests/test_generation_service.py -x` |
| D-06, D-08 | only successful conformers; MolBlock retained; counts correct | service unit | `pytest tests/test_generation_service.py -x` |
| D-09–D-15 | response order, first selection, card metadata, overflow, placeholder | browser UAT | Run both servers and inspect multiple-result response |
| D-16–D-19 | previous data preserved during loading/failure/empty response | browser UAT with API stub or temporary failure fixture | Manual-only until frontend test tooling is approved |
| D-20–D-23 | visible reference input, advanced fields, demo hint, reset/preservation | browser UAT | Manual-only until frontend test tooling is approved |

### Wave 0 gaps

- [ ] `backend/tests/test_api.py` with a stubbed generation service. `[VERIFIED: missing]`
- [ ] `backend/tests/test_generation_service.py` with fake molecules/generator results; no real weight load. `[VERIFIED: missing]`
- [ ] `backend/tests/conftest.py` only if fixtures are shared by both files. `[ASSUMED: keep optional]`
- [ ] Add verified FastAPI/Uvicorn runtime dependencies and HTTPX dev dependency. `[ASSUMED versions pending legitimacy checkpoint]`
- [ ] Add a repeatable Phase 2 browser UAT checklist for pending, failure, zero, partial, and multiple-conformer results. `[VERIFIED: frontend runner absent]`

### Sampling rate

- **Per backend task:** targeted pytest file.
- **Per frontend task:** `npm run build` plus the relevant UAT case.
- **Phase gate:** full backend pytest, frontend build, deterministic fixture self-test, and end-to-end local POST/browser UAT.

## Security Domain

### Applicable ASVS categories

| Category | Applies | Control |
|---|---|---|
| V2 Authentication | No | Authentication is explicitly out of scope; bind the prototype to localhost. `[VERIFIED: 02-CONTEXT.md; binding recommendation ASSUMED]` |
| V3 Session Management | No | No sessions are introduced. `[VERIFIED: 02-CONTEXT.md]` |
| V4 Access Control | Limited | Filesystem access is constrained to the reference root; this is input containment, not user authorization. `[VERIFIED: D-03]` |
| V5 Input Validation | Yes | Typed request fields, numeric bounds, `.mol` suffix, resolved-root containment, regular-file check. `[VERIFIED: D-03/D-05; exact implementation ASSUMED]` |
| V6 Cryptography | No | No secrets, auth, or cryptographic operation is introduced. `[VERIFIED: phase scope]` |

### Threats and mitigations

| Pattern | STRIDE | Mitigation |
|---|---|---|
| `../` or absolute-path read | Information disclosure | Reject absolute paths; resolve and require containment. `[ASSUMED: security guidance]` |
| Symlink escape | Information disclosure | Resolve the candidate before containment and test a symlink fixture. `[ASSUMED: security guidance]` |
| Unbounded `nSamples` | Denial of service | Apply a small positive maximum appropriate for a local demo. `[ASSUMED]` |
| Internal exceptions/path leakage | Information disclosure | Log server details; return concise API/UI errors and relative metadata paths. `[VERIFIED: D-19; exact API mapping ASSUMED]` |
| Remote exposure of unauthenticated generator | Denial of service | Bind to `127.0.0.1`; no production deployment in this phase. `[VERIFIED: phase scope; binding recommendation ASSUMED]` |

Recommended provisional numeric bounds are `1 <= nSamples <= 25` and `0 <= variance <= 10`; these are prototype workload guards, not limits documented by `mlconfgen`, and should be confirmed during implementation against representative references. `[ASSUMED]`

## Environment Availability

| Dependency | Available | Version | Consequence |
|---|---|---:|---|
| Python | yes | 3.14.6 | Meets repository `>=3.10`. `[VERIFIED: local command; pyproject]` |
| Backend virtual environment | yes | Python 3.14.6 | Contains current chemistry stack. `[VERIFIED: local command]` |
| `mlconfgen` | yes | 0.4.3 | Existing generator path is inspectable. `[VERIFIED: installed metadata]` |
| RDKit | yes | 2025.03.4 | Existing molecule path is runnable. `[VERIFIED: local import]` |
| Model weights | present | two expected `.pt` files | Real smoke test is possible, though expensive. `[VERIFIED: repository filesystem; do not commit]` |
| FastAPI | no | — | Blocking until package verification and install. `[VERIFIED: local import failure]` |
| Node/npm | yes | Node 24.12.0 / npm 11.6.2 | Frontend build tooling available. `[VERIFIED: local command]` |
| Frontend dependencies | yes | lock-installed | Existing frontend builds can be checked. `[VERIFIED: node_modules and npm listing]` |

## Assumptions Log

| # | Claim | Risk if wrong |
|---|---|---|
| A1 | Exact FastAPI/Uvicorn/HTTPX versions will be chosen after registry verification. | Installation or Python-version incompatibility. |
| A2 | Vite `/api` proxy is preferable to CORS for this local-only phase. | Local startup config may need explicit CORS instead. |
| A3 | `nSamples <= 25` and `variance <= 10` are suitable workload limits. | Useful experiments may be rejected or resource use may still be excessive. |
| A4 | Single-worker/local UI controls are sufficient without a backend generation lock. | Direct concurrent callers may expose model thread-safety issues. |
| A5 | Deterministic browser UAT plus the existing frontend build is acceptable until compatible test tooling is separately verified. | Regressions in async state behavior may escape automation. |

## Open Questions

1. **Verified package versions:** resolve at the mandatory package-legitimacy checkpoint before dependency edits. `[ASSUMED]`
2. **API-side concurrency:** exercise two direct requests once; add a narrow lock only if the generator is not safe or stable concurrently. `[ASSUMED]`
3. **Numeric upper bounds:** confirm provisional limits against one demo-SMILES run and one local `.mol` run without changing the existing defaults. `[ASSUMED]`

## Sources

### Primary — codebase (HIGH confidence)

- `AGENTS.md` — geometry/source-of-truth and scope constraints.
- `.planning/phases/02-frontend-integration-and-real-data-flow/02-CONTEXT.md` — locked decisions.
- `backend/src/generate_demo.py` — current orchestration/defaults/metadata.
- `backend/src/serialize.py` — canonical output and current `None` behavior.
- `backend/src/molecule_utils.py`, `backend/src/models.py`, `backend/src/config.py` — chemistry, generator, and path seams.
- `frontend/src/App.tsx`, `frontend/src/types/molecule.ts`, `frontend/package.json`, `frontend/vite.config.ts` — current UI contract and tooling.
- Installed `mlconfgen` 0.4.3 source — generator returns only standardized valid molecules and may return fewer than requested.

### External (LOW confidence in this offline retry)

- FastAPI, Uvicorn, HTTPX, Vite, React, pathlib, and browser Fetch ecosystem guidance is tagged `[ASSUMED]` wherever it is not independently established by the repository.
- External package registry verification was unavailable; the planner must retain the package-legitimacy checkpoint.

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM — existing stack is verified; new package versions remain unverified.
- Architecture: HIGH — derived directly from current seams and locked decisions.
- Pitfalls: HIGH for code-contract issues; LOW for external framework concurrency/fetch claims.
- Validation: MEDIUM — backend test approach is clear; frontend automation is intentionally unresolved.

**Research date:** 2026-06-28
**Valid until:** 2026-07-05 for package-version claims; architecture remains valid while Phase 2 context is unchanged.
