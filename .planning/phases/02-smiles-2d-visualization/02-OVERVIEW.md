# Phase 2 Plan: 2D SMILES Visualization

## Goal

Replace or improve the placeholder card artwork with a real RDKit.js SVG depiction rendered from SMILES, using only local frontend data and the existing molecule-card flow.

## Current baseline

- `frontend/src/data/mockMolecules.ts` contains four conformer records, including duplicate benzene examples.
- `App.tsx` renders a card grid and keeps one selected conformer in React state.
- `MoleculeCard.tsx` contains placeholder molecule artwork.
- `MoleculeViewer3D.tsx` remains a placeholder and is not part of this phase.
- No frontend chemistry renderer or test framework is currently declared in `frontend/package.json`.

## Work plan

1. Add RDKit.js in a form compatible with the current Vite/React build.
2. Define exactly 10 labeled, predefined local molecule examples. Retain `id`, `smiles`, and existing conformer/card fields; add a name or label to the frontend type if needed.
3. Add a small `Molecule2DViewer` or `Molecule2DPreview` component/helper that owns RDKit.js initialization, depiction cleanup, and fallback presentation. Isolate and document `dangerouslySetInnerHTML` there if SVG injection requires it.
4. Reuse `MoleculeCard` for the selected example. Initialize selection randomly, then add the smallest useful cycling/random control set that fits the existing UI.
5. Make invalid SMILES and renderer-loading failures visible without throwing, blanking the card, or blocking selection.
6. Add focused frontend tests if a test runner is introduced; otherwise record reproducible manual checks alongside build and lint.

## In scope

- Exactly 10 local examples with `id`, label/name, `smiles`, and required card metadata
- RDKit.js parsing and SVG depiction generated from SMILES
- One selected molecule at a time with random initial selection
- Simple next/previous and/or random selection
- RDKit.js loading and error fallback behavior
- Reuse of current React state, card components, and local fixture flow

## Out of scope

- API/backend endpoint or generated-data fetch
- FastAPI, uvicorn, httpx
- WASM conformer generation or other real in-browser generation
- Full 3D viewer
- File upload, database, job queue, auth, deployment
- PubChem/ChEMBL lookup
- Molecule editing or saving results

## Likely implementation files

- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/src/App.tsx`
- `frontend/src/components/MoleculeCard.tsx`
- `frontend/src/components/Molecule2DPreview.tsx` (new)
- `frontend/src/data/mockMolecules.ts`
- `frontend/src/types/molecule.ts`
- `frontend/src/styles/App.css`
- `frontend/src/styles/MoleculeCard.css`
- a new preview stylesheet and focused frontend test files, if needed

## Acceptance criteria

- The frontend works without Python, a server endpoint, or network molecule lookup.
- The local list contains exactly 10 distinct example records.
- The selected record's SMILES produces a visible 2D depiction.
- The user can reach other examples through the chosen simple controls.
- Invalid SMILES and renderer failure produce an intentional fallback.
- Existing metadata remains readable and MolBlock is not repurposed as the source of the 2D depiction.

## Validation

```bash
cd frontend
npm install
npm run build
npm run lint
```

If a test script is added, run `npm test` (or the exact script added to `package.json`). Manually exercise all 10 examples, repeated random/cycling selection, one intentionally invalid-SMILES fixture in a focused test, and renderer initialization failure.
