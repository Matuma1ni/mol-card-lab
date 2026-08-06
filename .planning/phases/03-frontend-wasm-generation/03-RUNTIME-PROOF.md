# Phase 3 Runtime Proof

## Status: blocked — local model assets unavailable

The browser-local runtime boundary is configured but cannot run a real conformer request in this checkout because the two required manually acquired model weights are absent:

- `frontend/public/models/egnn_chembl_15_39.onnx`
- `frontend/public/models/adj_mat_seer_chembl_15_39.onnx`

The adapter reports the sanitized unavailable category `model-assets-unavailable`. It does not expose the underlying exception, add a server route, or provide an alternate generator.

## Recorded configuration

- Package: `mlconfgen@0.1.0`, using its documented public `createGenerator` API and private `seed` import.
- Browser runtime: `onnxruntime-web@1.27.0`, passed explicitly as `ort`.
- Generator inputs: `egnnOnnx`, `adjMatSeerOnnx`, and `diffusionSteps: 100`.
- Vite public-asset URLs: `${import.meta.env.BASE_URL}models/egnn_chembl_15_39.onnx` and `${import.meta.env.BASE_URL}models/adj_mat_seer_chembl_15_39.onnx` (normally `/models/...` at this app's base URL).
- The two exact model paths are ignored by Git; `frontend/public/models/.gitkeep` retains the empty directory.

## Evidence

- Focused Vitest coverage passes for explicit runtime configuration, shared initialization, retry after runtime failure, and sanitized missing-asset status.
- `npm run build` passes with the adapter and local `mlconfgen` declaration shim.
- `git check-ignore -v` confirms that both named ONNX assets are protected.

## Remaining manual proof

After manually obtaining the two weights, place them in the ignored directory, run `cd frontend && npm run preview -- --host 127.0.0.1`, and submit one supported request in a browser. Record browser/version, both requested asset URLs, the request form, a representative `mol.toMolBlock()` result, and any derived-coordinate atom-order observation here.

Until that evidence exists, Phase 3 must use only the local unavailable-runtime state. No backend or network fallback is permitted.
