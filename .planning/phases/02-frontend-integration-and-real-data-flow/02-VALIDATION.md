---
phase: 02
slug: frontend-integration-and-real-data-flow
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-28
updated: 2026-06-28
---

# Phase 02 — Validation Strategy

> Execution feedback contract for all 14 tasks in Plans 02-01 through 02-05. `wave_0_complete` means every missing test dependency is assigned to an executable Wave 0 task; the files remain pending until Plan 02-01 runs.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Backend framework** | pytest 7.4.0; FastAPI TestClient after the approved HTTPX pin is installed |
| **Frontend automation** | Existing TypeScript/Vite build plus a Node-built-in UAT fixture self-test and deterministic browser UAT; no lint or frontend test stack exists |
| **Deterministic browser fixture** | `frontend/uat/fixture-server.mjs` with `frontend/uat/fixtures/scenarios.json`, created in Plan 02-05 and isolated from production FastAPI |
| **Backend quick command** | `cd backend && .venv/bin/pytest tests/test_api.py -x` |
| **Frontend quick command** | `cd frontend && npm run build` |
| **Final automated command** | `cd backend && .venv/bin/pytest -q && cd ../frontend && node uat/fixture-server.mjs --self-test && npm run build` |
| **Expected automated latency** | Under 120 seconds without opt-in model inference |

---

## Sampling Rate

- **After every task:** run the exact task command in the map below before committing.
- **After Wave 0:** confirm test files compile and collect, and that expected red is only the two named missing-production sentinel assertions.
- **After Wave 1:** run the complete backend suite and frontend build.
- **After Wave 2:** run the frontend build after each UI task, then the complete backend and frontend commands.
- **After Wave 3:** run backend pytest, fixture `--self-test`, frontend build, opt-in real-model smoke, then the documented two-lane browser UAT.
- **Before `$gsd-verify-work`:** all automated commands and every human checkpoint must be green.
- **Max ordinary feedback latency:** 120 seconds. Real weight-backed inference and browser observation are explicit final gates, not ordinary task feedback.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Test Type | Automated Command | Artifact State | Status |
|---------|------|------|-------------|------------|-----------|-------------------|----------------|--------|
| 02-01-01 | 01 | 0 | D-05; dependency legitimacy; numeric-bound decision | T-02-SC, T-02-02 | registry evidence + human decision | `cd backend && .venv/bin/python -m pip index versions fastapi && .venv/bin/python -m pip index versions uvicorn && .venv/bin/python -m pip index versions httpx` | external evidence | ⬜ pending |
| 02-01-02 | 01 | 0 | Approved FastAPI/Uvicorn/HTTPX pins | T-02-SC | import smoke | `cd backend && .venv/bin/python -c "import fastapi, uvicorn, httpx; print(fastapi.__version__, uvicorn.__version__, httpx.__version__)"` | manifest edits pending | ⬜ pending |
| 02-01-03 | 01 | 0 | D-01–D-08 contract-first foundation | T-02-TEST-WEIGHTS | compile + collection-safe expected red | `cd backend && .venv/bin/python -m py_compile tests/test_generation_service.py tests/test_api.py && set +e; .venv/bin/pytest tests/test_generation_service.py tests/test_api.py -q >/tmp/mol-card-phase2-wave0.txt 2>&1; status=$?; set -e; test "$status" -eq 1 && grep -q 'Phase 2 production module missing: src.generation_service' /tmp/mol-card-phase2-wave0.txt && grep -q 'Phase 2 production module missing: src.api' /tmp/mol-card-phase2-wave0.txt && ! grep -Eq 'ERROR collecting|SyntaxError|ImportError' /tmp/mol-card-phase2-wave0.txt` | ❌ Wave 0 | ⬜ pending |
| 02-02-01 | 02 | 1 | D-01, D-04, D-06–D-08 | T-02-TEST-WEIGHTS | service unit | `cd backend && .venv/bin/pytest tests/test_generation_service.py -x` | ❌ Wave 0 | ⬜ pending |
| 02-02-02 | 02 | 1 | D-02, D-03, D-05 | T-02-01, T-02-02, T-02-03 | API integration | `cd backend && .venv/bin/pytest tests/test_api.py -x && .venv/bin/pytest -q` | ❌ Wave 0 | ⬜ pending |
| 02-03-01 | 03 | 1 | D-02, D-06–D-08, D-19 | T-02-04, T-02-05 | TypeScript/Vite build | `cd frontend && npm run build` | ✅ existing command | ⬜ pending |
| 02-03-02 | 03 | 1 | D-16, D-19–D-23 | T-02-05, T-02-06 | TypeScript/Vite build + deterministic UAT in Wave 3 | `cd frontend && npm run build` | ✅ existing command; UAT fixture pending | ⬜ pending |
| 02-03-03 | 03 | 1 | Local `/api/generate` handoff | T-02-05 | configuration build | `cd frontend && npm run build` | ✅ existing command | ⬜ pending |
| 02-04-01 | 04 | 2 | D-08, D-09, D-11, D-12, D-16–D-19 | T-02-06, T-02-07, T-02-08 | build + deterministic UAT in Wave 3 | `cd frontend && npm run build` | ✅ existing command; UAT fixture pending | ⬜ pending |
| 02-04-02 | 04 | 2 | D-09–D-14 | T-02-07, T-02-08 | build + deterministic UAT in Wave 3 | `cd frontend && npm run build` | ✅ existing command; UAT fixture pending | ⬜ pending |
| 02-04-03 | 04 | 2 | D-15 | T-02-SC | build + browser observation | `cd frontend && npm run build` | ✅ existing command | ⬜ pending |
| 02-05-01 | 05 | 3 | D-01–D-08 real integration | T-02-09, T-02-10 | opt-in model endpoint integration | `cd backend && .venv/bin/pytest -q && RUN_MODEL_TESTS=1 .venv/bin/pytest tests/test_e2e_generation.py -x` | ❌ Plan 05 | ⬜ pending |
| 02-05-02 | 05 | 3 | D-01–D-23 runbook and deterministic response derivation | T-02-09 | fixture self-test + backend suite + frontend build | `cd frontend && node uat/fixture-server.mjs --self-test && npm run build && cd ../backend && .venv/bin/pytest -q && test -f ../docs/PHASE_2_UAT.md` | ❌ Plan 05 | ⬜ pending |
| 02-05-03 | 05 | 3 | D-01–D-23 end-to-end acceptance | T-02-09, T-02-10 | full available automation + human browser UAT | `cd backend && .venv/bin/pytest -q && cd ../frontend && node uat/fixture-server.mjs --self-test && npm run build` | ❌ Plan 05 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ missing until assigned plan executes · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Plan 02-01 Task 3 creates `backend/tests/test_generation_service.py` with weight-free defaults, fallback metadata, ordering, successful filtering, counts, warning metadata, and MolBlock preservation coverage.
- [x] Plan 02-01 Task 3 creates `backend/tests/test_api.py` with a stubbed service, approved-bound validation, request defaults, path containment, missing-file, and response-shape coverage.
- [x] Expected-red verification compiles both test files, permits successful collection, requires pytest exit code 1, matches both explicit missing-module sentinel messages, and rejects collection/syntax/import accidents.
- [x] Plan 02-01 Task 1 blocks hard-coded numeric ceilings until a human approves resource-guard rationale and exact values.
- [x] Plan 02-05 Task 2 supplies the deterministic frontend UAT fixture missing from the initial validation design.

---

## Deterministic Browser UAT Contract

Plan 02-05 creates a non-production Node server at `frontend/uat/fixture-server.mjs` and named payloads in `frontend/uat/fixtures/scenarios.json`. It replaces FastAPI on localhost port 8000 only during browser-state UAT and is never imported by `backend/src/api.py`.

Start it with:

```bash
cd frontend && node uat/fixture-server.mjs
```

Switch responses with:

```bash
curl -sS -X POST http://127.0.0.1:8000/__scenario \
  -H 'Content-Type: application/json' \
  --data '{"scenario":"partial"}'
```

Required scenarios and derivations:

| Scenario | Deterministic response | Required observation |
|----------|------------------------|----------------------|
| `success` | Many valid ordered conformers | Establish prior data, first selection, response order, selected metadata, horizontal overflow |
| `slow-success` | Valid success after fixed delay | Prior data remains visible, Generate disabled, indeterminate loading shown |
| `partial` | HTTP 200 with valid conformers and nonzero failure/warning counts | Successful set replaces prior set and warning is visible without failure state |
| `empty` | HTTP 200 with zero conformers | Prior successful set remains and recoverable no-results message appears |
| `error` | HTTP 500 with technical body | Prior successful set remains, concise inline error appears, technical detail is console-only |

The UAT order is `success` → `slow-success` → `partial` → `success` → `empty` → `success` → `error`, preventing any preservation claim from being tested without known prior data.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Exact Gate |
|----------|-------------|------------|------------|
| Dependency and numeric guardrail approval | D-05, A1, A3 | Supply-chain evidence and prototype resource-policy approval require a human decision | Plan 02-01 Task 1 presents exact package pins, canonical identities, existing defaults, proposed ceilings, and rationale before any edit/test/implementation. |
| Real local generation reaches FastAPI and React | D-01–D-08 | Requires manually downloaded uncommitted weights and real inference | Run the opt-in endpoint tests, then use the real Uvicorn/Vite lane in `docs/PHASE_2_UAT.md` for demo fallback and a contained `.mol`. |
| Async preservation and partial-result UI | D-08, D-16–D-19 | Visual timing and rendered state require browser observation | Use the isolated fixture server and exact ordered scenario sequence in the deterministic contract above. |
| Controls, selection, overflow, metadata, and deferred viewer | D-09–D-15, D-20–D-23 | Visual/interaction behavior | Complete the corresponding fixture-driven sections in `docs/PHASE_2_UAT.md`. |
| Direct concurrent real requests | D-16, A4 | UI prevents concurrency but direct callers can bypass it | In the real FastAPI lane, send two direct local requests once and record whether the accepted single-user boundary remains stable. |

---

## Validation Sign-Off

- [x] All 14 actual plan tasks appear exactly once in the verification map.
- [x] Every task has an automated command; human-only claims are paired with explicit checkpoints.
- [x] Sampling continuity has no three consecutive tasks without automated verification.
- [x] Expected-red verification cannot pass on syntax, import, fixture, or collection accidents.
- [x] Partial, empty, total-failure, and slow-pending browser states have deterministic derivation outside the production API.
- [x] Numeric ceilings are gated by an explicit pre-implementation decision and are no longer treated as research-validated model limits.
- [x] No watch-mode flags are used.
- [x] Ordinary automated feedback latency targets under 120 seconds.
- [x] `nyquist_compliant: true` and `wave_0_complete: true` accurately describe this planning contract.

**Approval:** ready for execution
