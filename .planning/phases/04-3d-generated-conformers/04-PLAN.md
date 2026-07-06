# Phase 4 Plan: 3D Visualization of Generated Conformers

## Goal

Render actual Phase 3-generated conformers in 3D after their geometry format is known.

## Dependency

Phase 3 must document and expose stable generated geometry through the frontend adapter before a viewer library is selected.

## In scope

- Viewer evaluation against the confirmed generated geometry format
- A replaceable React viewer component
- Rendering actual generated conformers
- Card-selection synchronization
- Loading, invalid/missing geometry, and missing-WebGL fallbacks

## Out of scope

- Changes to the generation model
- Backend-mediated generation
- Production persistence
- Advanced molecular editing
- Publication-quality rendering unless separately approved

## Work plan

1. Inspect representative Phase 3 output and confirm geometry semantics.
2. Evaluate a lightweight viewer such as Speck against that format.
3. Implement viewer lifecycle and geometry updates inside `MoleculeViewer3D` or a replacement component.
4. Connect the viewer to selected generated conformers.
5. Add graceful handling for loading, malformed/missing geometry, and unavailable WebGL.
6. Test lifecycle cleanup and conformer switching.

## Likely implementation files

- `frontend/package.json` and `frontend/package-lock.json`
- `frontend/src/components/MoleculeViewer3D.tsx`
- `frontend/src/App.tsx`
- Phase 3 geometry types/normalization
- viewer styles and focused tests

## Acceptance criteria

- At least one actual generated conformer renders interactively.
- Selecting another generated conformer updates the view.
- Invalid/missing geometry and missing WebGL do not break the surrounding UI.
- Viewer-specific code remains isolated and replaceable.

## Validation

```bash
cd frontend
npm run build
npm run lint
```

Also run the frontend test command. Manually verify generated conformer rendering, switching, camera interaction, malformed/missing geometry, missing WebGL, and repeated mount/unmount cleanup.
