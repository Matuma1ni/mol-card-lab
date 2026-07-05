"""Minimal local FastAPI boundary for conformer generation."""

from __future__ import annotations

from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field

try:
    from .config import DEFAULT_NUM_CONFORMERS, DEFAULT_VARIANCE, REFERENCE_MOLECULES_DIR
    from .generation_service import generate_conformer_data
except ImportError:  # Support `uvicorn api:app --app-dir src`.
    from config import DEFAULT_NUM_CONFORMERS, DEFAULT_VARIANCE, REFERENCE_MOLECULES_DIR
    from generation_service import generate_conformer_data


MAX_N_SAMPLES = 25
MAX_VARIANCE = 10


class GenerateRequest(BaseModel):
    """Optional controls for one synchronous generation run."""

    model_config = ConfigDict(populate_by_name=True)

    reference_mol_path: Annotated[str | None, Field(alias="referenceMolPath")] = None
    n_samples: Annotated[
        int,
        Field(alias="nSamples", ge=1, le=MAX_N_SAMPLES),
    ] = DEFAULT_NUM_CONFORMERS
    variance: Annotated[
        int,
        Field(ge=0, le=MAX_VARIANCE),
    ] = DEFAULT_VARIANCE


app = FastAPI(title="mol-card-lab", version="0.2.0")


def resolve_reference_mol_path(value: str) -> Path:
    """Resolve an allowed relative .mol path beneath the reference root."""
    relative_path = Path(value)
    if relative_path.is_absolute():
        raise ValueError("referenceMolPath must be relative")
    if relative_path.suffix.lower() != ".mol":
        raise ValueError("referenceMolPath must point to a .mol file")

    root = REFERENCE_MOLECULES_DIR.resolve()
    candidate = (root / relative_path).resolve()
    try:
        candidate.relative_to(root)
    except ValueError as exc:
        raise ValueError("referenceMolPath must remain under the allowed root") from exc
    if not candidate.is_file():
        raise ValueError("referenceMolPath does not identify an existing file")
    return candidate


@app.post("/generate")
def generate(request: GenerateRequest) -> dict:
    """Run generation synchronously through the shared Python service."""
    resolved_path: Path | None = None
    if request.reference_mol_path is not None:
        try:
            resolved_path = resolve_reference_mol_path(request.reference_mol_path)
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    try:
        return generate_conformer_data(
            reference_mol_path=str(resolved_path) if resolved_path else None,
            reference_path_label=request.reference_mol_path,
            n_samples=request.n_samples,
            variance=request.variance,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Conformer generation failed") from exc
