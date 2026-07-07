---
phase: 2
slug: 2d-smiles-visualization
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-07-06
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. This file remains draft until Wave 0 installs the frontend test infrastructure and every executable plan task is mapped to a passing check.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + jsdom + React Testing Library (Wave 0 install) |
| **Config file** | `frontend/vite.config.ts` or `frontend/vitest.config.ts` — Wave 0 configures a jsdom test environment |
| **Quick run command** | `cd frontend && npm test -- --run` |
| **Full suite command** | `cd frontend && npm test -- --run && npm run build` |
| **Production smoke command** | `cd frontend && npm run build && npm run preview -- --host 127.0.0.1` followed by the manual/UAT checks below |
| **Estimated runtime** | Unit/component feedback target: under 30 seconds; build plus production smoke target: under 90 seconds |

Tests must mock the narrow local RDKit adapter for deterministic component-state coverage. Unit tests must not instantiate WASM. At least one phase-gate smoke check must use the real built `RDKit_minimal.js` and `RDKit_minimal.wasm` through Vite preview; otherwise asset paths, MIME behavior, and initialization are unverified.

---

## Sampling Rate

- **After every task:** Run the narrowest relevant test file, then `cd frontend && npm run build` when TypeScript, package, asset, or production code changed.
- **After every plan wave:** Run `cd frontend && npm test -- --run && npm run build`.
- **Before `$gsd-verify-work`:** The full suite must be green and the real production-preview WASM smoke check must pass.
- **Max automated feedback latency:** 30 seconds for targeted tests; 90 seconds for the full frontend gate.
- Do not use watch-mode flags in plan verification commands.

---

## Requirement IDs

These local IDs make the prose requirements in `.planning/REQUIREMENTS.md` and the locked context decisions traceable:

| ID | Requirement / decisions |
|----|-------------------------|
| **P2-DATA** | Exactly 10 unique named drug-like local examples with required card metadata; D-13–D-15 |
| **P2-SELECT** | Random initial selection, dedicated below-card `Pick another`, next id differs; D-01–D-04 |
| **P2-RENDER** | Browser RDKit.js parses selected SMILES, returns visible SVG, and disposes molecule objects |
| **P2-STATES** | Fixed-size loading skeleton; invalid-SMILES fallback; init failure and working Retry; selection disabled while pending; D-05–D-08 |
| **P2-CARD** | MTG-style title, 2D-only artwork, centered responsive SVG, wrapping SMILES footer; D-09–D-12 |
| **P2-ASSET** | Pinned local RDKit JS/WASM assets load from a production Vite build without CDN or backend |
| **P2-SCOPE** | No API, generation, 3D viewer, persistence, uploads, lookup, auth, queue, or deployment work |

---

## Per-Task Verification Map

The executable planner may split or renumber tasks, but every task must inherit one or more rows below. Update the `Task ID`, `Plan`, and `Wave` columns after `02-NN-PLAN.md` files are created; do not delete behavior coverage.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-T1 | 02-01 | 1 | Validation infrastructure | — | N/A | harness smoke | `cd frontend && npm test -- --run` | ✅ | ✅ green |
| 02-01-T2 | 02-01 | 1 | P2-DATA | — | Fixed local records only | unit | `cd frontend && npm test -- --run src/data/mockMolecules.test.ts` | ✅ | ✅ green |
| 02-03-T1 | 02-03 | 3 | P2-SELECT | — | N/A | unit/component | `cd frontend && npm test -- --run src/App.test.tsx` | ✅ | ✅ green |
| 02-02-T1 | 02-02 | 2 | P2-RENDER | T2-RESOURCE | Each created molecule is deleted even when SVG generation fails | unit | `cd frontend && npm test -- --run src/lib/rdkit.test.ts` | ✅ | ✅ green |
| 02-02-T2 | 02-02 | 2 | P2-STATES | T2-INJECT / T2-RESOURCE | Failures render inert fallback text; raw library errors are hidden | component | `cd frontend && npm test -- --run src/components/Molecule2DPreview.test.tsx` | ✅ | ✅ green |
| 02-03-T2 | 02-03 | 3 | P2-CARD | — | N/A | component | `cd frontend && npm test -- --run src/components/MoleculeCard.test.tsx` | ✅ | ✅ green |
| 02-03-T3 | 02-03 | 3 | P2-ASSET | T2-SUPPLY | Exact pinned dependency; same-origin JS loader invokes its initializer and requests sibling WASM; both built asset URLs return 200; no runtime CDN | unit + build + browser smoke | `cd frontend && npm test -- --run src/lib/rdkit.test.ts && npm run build` plus production-preview smoke | ✅ | ⬜ pending UAT |
| 02-03-T3 | 02-03 | 3 | P2-SCOPE | — | No new server/network boundary | repository audit | `git diff --name-only -- backend && rg -n "FastAPI|uvicorn|httpx|fetch\(|axios" frontend/src frontend/package.json` (review matches manually) | ✅ | ⬜ pending UAT |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

### Task-to-test mapping guidance

- A task that changes the molecule catalog must run **P2-DATA** tests and the build.
- A task that changes `App.tsx` selection state must run **P2-SELECT** and **P2-STATES** tests.
- A task that changes the RDKit loader/adapter must run **P2-RENDER**, **P2-STATES**, and the production-preview smoke check before its wave is complete.
- A task that changes raw SVG insertion must run **P2-STATES**, assert that metadata is not concatenated into SVG markup, and receive manual diff review for the single `dangerouslySetInnerHTML` boundary.
- A task that changes card markup/styles must run **P2-CARD** tests and responsive manual checks.
- Package or public-asset changes require `npm run build`, inspection of `dist/rdkit/`, and real Vite preview.

---

## Required Automated Coverage

### Dataset invariants — P2-DATA

- `MOCK_CONFORMERS` (or renamed equivalent) has length exactly 10.
- All ids, names, and SMILES values are non-empty and unique.
- All records retain fields required by `MoleculeCard` and the existing contract.
- Tests do not call a network service or dynamically obtain chemistry metadata.

### Random selection — P2-SELECT

- Mock `Math.random` before rendering to prove the lazy initial selection can select a non-first record.
- Assert the random initializer is not re-run on ordinary rerenders.
- Clicking `Pick another` replaces the visible id/name/SMILES with a different record.
- Cover first, middle, and last current-index cases or test the extracted selection helper exhaustively.
- Ensure the control is below/outside the card and the card itself no longer masquerades as a selection button.

### RDKit adapter and lifecycle — P2-RENDER

- Multiple consumers share one same-origin script-load promise for `RDKit_minimal.js`.
- Script load failure or a missing `initRDKitModule` global removes failed state so Retry appends a fresh script attempt.
- The loaded initializer receives a `BASE_URL`-aware `locateFile` URL for the sibling `RDKit_minimal.wasm`.
- Multiple consumers share one in-flight/successful initialization promise.
- An initialization rejection clears cached state so a later call retries rather than reusing a rejected promise.
- A valid mock molecule returns SVG.
- Null/invalid parse result maps to the invalid-SMILES result.
- `mol.delete()` runs once after success and after `get_svg()` failure.
- A stale result after prop change/unmount cannot replace the current depiction.

### Loading and error states — P2-STATES

- Deferred adapter promise shows a fixed artwork region labeled exactly `Loading molecule…`.
- `Pick another` is disabled during initial loading and retry loading, then re-enabled on settled success or failure.
- Invalid SMILES shows `2D preview unavailable` and the selected SMILES, no Retry, and no raw exception detail.
- Initialization rejection shows the fallback and `Retry preview`, without exposing raw errors.
- Clicking Retry calls a fresh initialization path, returns to loading, and can transition to a rendered SVG.
- Rapid SMILES changes cannot show an older SVG under the new title/SMILES footer.

### Card composition — P2-CARD

- The name appears inside the card before the artwork in DOM order.
- The RDKit 2D component replaces `MoleculeViewer3D`; no `3D viewer pending` text remains.
- The selected SMILES remains visible as labeled text and supports long values.
- The generated SVG has an accessible container/name and is not the only source of molecule identity.

---

## Wave 0 Requirements

- [ ] Install a version-compatible Vitest, jsdom, `@testing-library/react`, `@testing-library/dom`, and `@testing-library/jest-dom`; pin through `package-lock.json` and verify package legitimacy before install.
- [ ] Add a non-watch `test` script to `frontend/package.json` (for example, `vitest`) and jsdom setup/config.
- [ ] Add `frontend/src/test/setup.ts` for DOM matchers and consistent cleanup.
- [ ] Add `frontend/src/data/mockMolecules.test.ts` for P2-DATA invariants.
- [ ] Add `frontend/src/App.test.tsx` for P2-SELECT and selection-disabled integration behavior.
- [ ] Add `frontend/src/lib/rdkit.test.ts` for singleton retry/disposal behavior.
- [ ] Add `frontend/src/components/Molecule2DPreview.test.tsx` for loading, valid SVG, invalid SMILES, initialization failure, Retry, and stale-result behavior.
- [ ] Add `frontend/src/components/MoleculeCard.test.tsx` for title/artwork/footer composition.
- [ ] Define a reproducible production-preview smoke procedure; automate with existing project tooling only if that tooling is already available, otherwise keep it manual for this small phase.

Wave 0 is complete only after `npm test -- --run` executes at least one passing test and no test relies on real WASM. Set `wave_0_complete: true` then.

---

## Manual / UAT Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real RDKit WASM from production build | P2-ASSET, P2-RENDER | jsdom cannot validate browser WASM fetching, MIME type, or final asset path | Build, start Vite preview, open the local URL with network cache disabled, confirm `RDKit_minimal.js` and `.wasm` return 200 with no CDN request, and confirm a molecule SVG appears. |
| Ten-example visual sweep | P2-DATA, P2-CARD | Chemical drawing legibility and clipping are visual | Use `Pick another` until all 10 named compounds have appeared; verify centered structure, generous padding, no clipping, readable title, and wrapping SMILES. Reload as needed; record all names seen. |
| Repeated random interaction | P2-SELECT | Random UX and visual transitions benefit from browser observation | Reload at least five times and click `Pick another` at least 20 times; every click must visibly change the molecule and must never imply generation. |
| Responsive artwork/card layout | P2-CARD | CSS fit/aspect ratio needs a real layout engine | Check desktop and ≤720px viewport; title stays inside card above artwork, SVG preserves aspect ratio, button remains below card, footer text wraps. |
| Loading lockout | P2-STATES | Real WASM may initialize too quickly for reliable manual observation | With network throttling/cache disabled, confirm fixed-size loading skeleton and disabled `Pick another`; rely on component test if not observable. |
| Initialization failure and recovery | P2-STATES | Requires browser asset failure | Temporarily block the WASM request in browser devtools (without committing a code change), reload, verify fallback + Retry, unblock request, click Retry, and confirm depiction appears. |
| Scope audit | P2-SCOPE | Architectural exclusions require diff review | Inspect changed paths/dependencies: no backend/API, upload, persistence, 3D, generation, external lookup, auth, queue, or deployment implementation. |

### Production-preview smoke acceptance evidence

Record these observations in the implementation summary or phase verification artifact:

1. Exact command and built commit/worktree state tested.
2. Browser used.
3. HTTP status and URL for both RDKit JS and WASM assets.
4. RDKit initialization produced an SVG for at least two different local SMILES.
5. No unpkg/CDN request and no backend request occurred.
6. `Pick another` was disabled while loading and changed to a different molecule after ready.

---

## Threat References

| Ref | Threat | Required validation |
|-----|--------|---------------------|
| **T2-INJECT** | Raw SVG insertion becomes an XSS sink | `dangerouslySetInnerHTML` exists only in the depiction component; input is only RDKit-produced SVG; names/SMILES are React text nodes and never concatenated into SVG. |
| **T2-SUPPLY** | Runtime CDN or unpinned package substitution | Exact RDKit dependency in lockfile, local static assets, network panel shows no CDN. |
| **T2-RESOURCE** | WASM heap or async race leak during repeated selection | Unit assertions for `delete()` and stale-result cancellation; repeated browser selection remains responsive. |

---

## Validation Sign-Off

- [ ] Executable plan task IDs, plan numbers, and waves replace every `TBD` map entry.
- [ ] All tasks have an `<automated>` verify command or an explicit Wave 0 dependency.
- [ ] Sampling continuity: no three consecutive implementation tasks lack automated verification.
- [ ] Wave 0 covers every `❌ W0` reference and `wave_0_complete: true` is set.
- [ ] No watch-mode flags appear in executable verification commands.
- [ ] Targeted feedback latency is below 30 seconds and full frontend gate below 90 seconds, or actual timings are documented.
- [ ] Unit/component suite and production build are green.
- [ ] Real production-preview RDKit WASM smoke check passes with recorded evidence.
- [ ] All locked D-01–D-15 behaviors and P2-SCOPE exclusions are verified.
- [ ] `nyquist_compliant: true` is set in frontmatter only after all checks above pass.

**Approval:** pending
