# ADR-0001: Prefer local .mol reference molecules with embedded SMILES fallback

- Status: Accepted
- Date: 2026-06-23

## Context

Phase 1 needs a simple, reproducible way to prove that the conformer-generation pipeline works end to end from a standalone Python script.

The project has two major constraints:

1. The backend should work without requiring a production API or database.
2. The frontend remains mock-driven and should not depend on external lookup services during the spike.

This makes the choice of reference input especially important. The backend needs an input that is deterministic, local, and easy to inspect while still exercising the 3D geometry path.

## Decision

Use a local .mol file passed via `--reference-mol` / `-r` as the preferred reference input for Phase 1.

If no .mol file is provided, fall back to the embedded `DEMO_SMILES` value only for smoke testing.

The script records explicit metadata for the chosen input:

- `reference_source`: `mol_file` or `demo_smiles`
- `reference_3d_geometry`: `provided` or `embedded`

This decision is implemented in the backend generation script and reflected in the serialized JSON output.

## Why This Decision

This approach keeps the spike reproducible and avoids introducing external services or data lookups in Phase 1. A local .mol file is a better fit than bare SMILES when the goal is to preserve and validate 3D geometry.

The fallback to embedded SMILES is intentionally narrow: it exists to verify that the pipeline can run in a minimal environment, not as a replacement for the preferred workflow.

## Consequences

### Positive

- Reproducible local testing with a real reference structure.
- Clear distinction between an explicitly provided 3D reference and a smoke-test fallback.
- Better alignment with the project goal of preserving geometry rather than reducing everything to text-only inputs.

### Negative

- Requires the user to provide a local .mol file for non-trivial experiments.
- Adds a small amount of CLI and metadata handling complexity.
- The fallback path is less representative of real use than a full reference-molecule workflow.

### Follow-up

If the project later grows beyond the spike, the decision can be revisited to support more sophisticated input sources such as uploaded files, remote lookup, or a persisted reference library.

## Alternatives Considered

1. Always use SMILES-only input
   - Pros: simpler to explain and easier to inject into tests.
   - Cons: loses the 3D geometry signal that the project is trying to preserve.

2. Require a remote lookup service such as PubChem or ChEMBL
   - Pros: richer chemistry context.
   - Cons: adds network dependency, onboarding friction, and scope creep for Phase 1.

3. Require the user to upload a reference molecule through an API
   - Pros: more future-friendly for a web app.
   - Cons: too much complexity for a standalone proof-of-concept spike.

4. Keep only the embedded demo SMILES path
   - Pros: very simple.
   - Cons: does not exercise the real reference-molecule workflow and weakens the prototype’s value.

## Comparison to Existing Project Guidance

This ADR is a formalization of a decision that was already implied by the README and implementation notes:

- The README describes local .mol input as the preferred Phase 1 path.
- The implementation summary states the same workflow and documents the metadata conventions.
- The code now implements that behavior in the generation script.

Because the project had no prior ADRs, this was a worthwhile addition to make the decision durable and reviewable.

## Related Artifacts

- README
- docs/ASSUMPTIONS.md
- docs/IMPLEMENTATION_SUMMARY.md
- backend/src/generate_demo.py
- backend/src/serialize.py
