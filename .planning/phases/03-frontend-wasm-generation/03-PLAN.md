# Phase 3 Plan: Frontend WASM Generation Integration

## Goal

Integrate the frontend-compatible conformer generator once available, keep generation browser-side, and isolate low-level WebAssembly details behind a frontend adapter.

## Dependency

- Phase 2's card selection and visualization states are stable.
- The WASM library and its supported browser input/output contract are available.

## In scope

- A frontend generator adapter/interface
- Minimum agreed generation input
- Browser-side module loading and generation
- Normalized output compatible with existing molecule cards where practical
- Loading, progress, success, and failure states
- Contract documentation for generated geometry needed by Phase 4

## Out of scope

- Backend API or production backend
- FastAPI, uvicorn, httpx, database, job queue, auth, deployment
- 3D visualization except a minimal output-presence smoke check if necessary
- Advanced generation controls

## Work plan

1. Inspect the delivered library interface and supported browser build before fixing adapter types.
2. Define a narrow adapter that owns module initialization and generation calls.
3. Normalize output to the existing frontend molecule/conformer shape, preserving authoritative geometry.
4. Route generated results through the current card data and selection flow.
5. Add explicit loading and error handling for module initialization and generation.
6. Test the adapter separately from card components and record the geometry contract for Phase 4.

## Likely implementation files

- a new module under `frontend/src` for the generator adapter/interface
- WASM declarations/assets or Vite configuration required by the delivered package
- `frontend/src/App.tsx`
- `frontend/src/types/molecule.ts`
- generation-state components/styles
- focused unit and integration tests

Exact paths beyond the adapter boundary depend on the delivered WASM package.

## Acceptance criteria

- Browser UI invokes generation through the adapter only.
- Generation completes without a backend request.
- Adapter output can be displayed by existing cards without a major component rewrite.
- Loading and failure states are graceful.
- Generated geometry fields and semantics are documented for Phase 4.

## Validation

```bash
cd frontend
npm run build
npm run lint
```

Also run the frontend test command introduced by implementation. Verify module-load success/failure, valid/invalid input, generation success/failure, normalized output, and absence of generation HTTP requests.

