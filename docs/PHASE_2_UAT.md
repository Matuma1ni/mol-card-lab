# Phase 2 UAT

Use two separate lanes. Both bind the backend-side process only to `127.0.0.1:8000`, and both use Vite's `/api` proxy. Stop one backend-side process before starting the other.

## Automated prerequisites

```bash
cd backend
.venv/bin/pytest -q
RUN_MODEL_TESTS=1 .venv/bin/pytest tests/test_e2e_generation.py -x

cd ../frontend
node uat/fixture-server.mjs --self-test
npm run build
```

## Lane 1: real FastAPI and model

Terminal 1:

```bash
cd backend
.venv/bin/uvicorn api:app --app-dir src --host 127.0.0.1 --port 8000
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`, then verify:

1. Leave the reference blank. Confirm the form explains the `DEMO_SMILES` fallback; generate one conformer and observe a card selected as Conformer 1.
2. Confirm the card shows only SMILES, atom count, and reference source. The viewer says `MolBlock geometry loaded` and that real 3D rendering is deferred.
3. Enter `Structure2D_CID_5353365.mol`. Confirm the visible prefix remains `backend/data/reference_molecules/`, generation succeeds, and the card reports a local `.mol` reference.
4. Generate multiple conformers. Confirm response order is preserved, the first is selected, and each selector has `Conformer N` plus its SMILES.
5. Try `../escape.mol`, an absolute path, a non-`.mol` suffix, `nSamples=26`, and `variance=11`. Each must return a concise HTTP 422 error without replacing existing cards or exposing an absolute server path.
6. Directly send two local real requests at nearly the same time. Record latency/stability. Phase 2 accepts this synchronous behavior only for a single-user localhost prototype; the UI itself prevents concurrent submission.

Stop FastAPI before Lane 2. Keep Vite running.

## Lane 2: deterministic browser UAT

Start the fixture server from `frontend/`:

```bash
node uat/fixture-server.mjs
```

Switch its active response with:

```bash
curl -sS -X POST http://127.0.0.1:8000/__scenario -H 'Content-Type: application/json' --data '{"scenario":"SCENARIO"}'
```

Run these checks in order:

1. `success`: generate and confirm eight conformers replace prior data in fixture order, Conformer 1 is selected, and the selector overflows horizontally with non-shrinking buttons. Select another conformer and confirm only that card changes.
2. Edit the reference, `nSamples`, and `variance`. Generate again and confirm values persist. Use Reset to defaults and confirm blank/10/2. Blank reference is omitted and described as the demo fallback.
3. `slow-success`: generate. During the delay, prior cards remain visible, Generate is disabled, `aria-busy`/loading text is present, and a second UI request cannot start.
4. `partial`: generate. Two successful conformers replace the previous set, failed pseudo-conformers do not appear, and the partial warning is visible with nonzero failure/warning metadata represented by its message.
5. `success`, then `empty`: establish success first, switch to empty, and generate. Prior cards remain visible and a recoverable no-conformers message appears.
6. `success`, then `error`: establish success first, switch to error, and generate. Prior cards remain visible, the inline error is concise, and browser console diagnostics retain the technical fixture payload without rendering it.
7. Throughout, confirm every returned card uses non-empty MolBlock data as geometry. SMILES and coordinates never replace MolBlock, and the UI does not claim real 3D rendering.

Valid scenario names are exactly `success`, `slow-success`, `partial`, `empty`, and `error`. The fixture server is development-only, binds to localhost, and never adds a route to the production FastAPI app.

## Verdict

Record the real-model and browser results. Phase 2 passes only when both lanes succeed and no deferred feature—uploads, database, queue, auth, deployment, lookup, browser generation, or 3Dmol.js—has been introduced.
