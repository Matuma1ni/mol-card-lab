# mol-card-lab

An exploratory prototype that generates 3D molecular conformers with `ml_conformer_generator` and presents them as collectible-style React cards.

## Phase 2 architecture

- Python remains the generation runtime.
- `backend/src/generation_service.py` is shared by the CLI and local FastAPI wrapper.
- `POST /generate` accepts optional `referenceMolPath`, `nSamples`, and `variance` fields.
- `referenceMolPath` must be a relative `.mol` path beneath `backend/data/reference_molecules/`.
- A missing path uses `DEMO_SMILES` only as an explicitly labeled smoke-test fallback.
- MolBlock is the primary 3D geometry representation; coordinates are derived convenience data.
- The React viewer confirms that MolBlock geometry loaded. Real 3Dmol.js rendering remains deferred.

This phase is local-only and single-user. It does not add uploads, persistence, queues, authentication, deployment, identity lookup, or browser-side generation.

## Setup

Prerequisites: Python 3.10+, Node.js 18+, npm, and manually downloaded model weights.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

Download these gated files from `Membrizard/ml_conformer_generator` on Hugging Face and place them in `backend/data/model_weights/`:

- `edm_moi_chembl_15_39.pt`
- `adj_mat_seer_chembl_15_39.pt`

Install the frontend separately:

```bash
cd frontend
npm install
```

## Run the real local application

Start FastAPI, bound only to localhost:

```bash
cd backend
.venv/bin/uvicorn api:app --app-dir src --host 127.0.0.1 --port 8000
```

In another terminal, start Vite:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api/generate` to FastAPI's `POST /generate` route.

Example request:

```bash
curl -sS -X POST http://127.0.0.1:8000/generate \
  -H 'Content-Type: application/json' \
  --data '{"referenceMolPath":"Structure2D_CID_5353365.mol","nSamples":1,"variance":0}'
```

Blank `referenceMolPath` uses `DEMO_SMILES`. Request limits are `nSamples` 1–25 and `variance` 0–10; invalid values return HTTP 422.

## Deterministic browser UAT

The fixture server replaces FastAPI on port 8000 during browser-state testing. Never run both simultaneously.

```bash
cd frontend
node uat/fixture-server.mjs
```

It is non-production infrastructure built only with Node standard-library modules. See [docs/PHASE_2_UAT.md](docs/PHASE_2_UAT.md) for the complete two-lane checklist.

## Checks

```bash
cd backend
.venv/bin/pytest -q
RUN_MODEL_TESTS=1 .venv/bin/pytest tests/test_e2e_generation.py -x

cd ../frontend
node uat/fixture-server.mjs --self-test
npm run build
```

## Constraints and attribution

- Model weights are manually downloaded and must not be committed.
- Project code license: TBD.
- Model weights: CC BY-NC-ND 4.0.
- `mlconfgen`: Apache 2.0.
- Architecture records: [docs/architecture/README.md](docs/architecture/README.md).
