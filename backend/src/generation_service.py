"""Shared conformer generation and serialization service."""

from __future__ import annotations

import json
import logging
from datetime import datetime
from typing import Any

from rdkit import Chem

try:
    from .config import (
        ADJ_MAT_WEIGHTS_PATH,
        DEFAULT_DIFFUSION_STEPS,
        DEFAULT_NUM_CONFORMERS,
        DEFAULT_VARIANCE,
        DEMO_SMILES,
        EDM_WEIGHTS_PATH,
        validate_model_weights,
    )
    from .models import ConformerGeneratorWrapper
    from .molecule_utils import molfile_to_mol, smiles_to_mol_3d, validate_mol
    from .serialize import mols_to_json
except ImportError:  # Support direct execution from backend/src.
    from config import (
        ADJ_MAT_WEIGHTS_PATH,
        DEFAULT_DIFFUSION_STEPS,
        DEFAULT_NUM_CONFORMERS,
        DEFAULT_VARIANCE,
        DEMO_SMILES,
        EDM_WEIGHTS_PATH,
        validate_model_weights,
    )
    from models import ConformerGeneratorWrapper
    from molecule_utils import molfile_to_mol, smiles_to_mol_3d, validate_mol
    from serialize import mols_to_json


logger = logging.getLogger(__name__)


def load_reference_molecule(
    reference_mol_path: str | None,
) -> tuple[Chem.Mol | None, dict[str, str]]:
    """Load a local .mol reference or the explicit demo fallback."""
    if reference_mol_path:
        reference, embedded_3d = molfile_to_mol(reference_mol_path)
        if reference is None:
            return None, {}
        return reference, {
            "reference_source": "mol_file",
            "reference_path": reference_mol_path,
            "reference_3d_geometry": "embedded" if embedded_3d else "provided",
        }

    logger.info("Creating demo reference molecule from SMILES: %s", DEMO_SMILES)
    return smiles_to_mol_3d(DEMO_SMILES), {
        "reference_source": "demo_smiles",
        "reference_3d_geometry": "embedded",
    }


def generate_conformer_data(
    reference_mol_path: str | None = None,
    reference_path_label: str | None = None,
    n_samples: int = DEFAULT_NUM_CONFORMERS,
    variance: int = DEFAULT_VARIANCE,
    diffusion_steps: int = DEFAULT_DIFFUSION_STEPS,
) -> dict[str, Any]:
    """Generate conformers and return the canonical serialized response."""
    if not validate_model_weights():
        raise RuntimeError("Model weights are unavailable")

    reference, reference_metadata = load_reference_molecule(reference_mol_path)
    if reference is None:
        raise ValueError("Reference molecule could not be loaded")

    is_valid, validation_message = validate_mol(reference)
    if not is_valid:
        raise ValueError(f"Reference molecule is invalid: {validation_message}")

    generator = ConformerGeneratorWrapper.get_instance(
        edm_weights=str(EDM_WEIGHTS_PATH),
        adj_mat_weights=str(ADJ_MAT_WEIGHTS_PATH),
        diffusion_steps=diffusion_steps,
    )
    generated = generator.generate_conformers(
        reference=reference,
        n_samples=n_samples,
        variance=variance,
    )
    valid_conformers = [mol for mol in generated if mol is not None]
    num_failed = max(n_samples - len(valid_conformers), 0)
    warnings = (
        [f"{num_failed} of {n_samples} requested conformers could not be generated"]
        if num_failed
        else []
    )

    metadata: dict[str, Any] = {
        "reference_smiles": Chem.MolToSmiles(reference),
        "num_requested": n_samples,
        "num_generated": len(valid_conformers),
        "num_failed": num_failed,
        "variance": variance,
        "diffusion_steps": diffusion_steps,
        "generated_at": datetime.now().isoformat(),
        "warnings": warnings,
        "warning_count": len(warnings),
        "reference_source": reference_metadata["reference_source"],
        "reference_3d_geometry": reference_metadata["reference_3d_geometry"],
    }
    if reference_path_label is not None:
        metadata["reference_path"] = reference_path_label
    elif reference_mol_path is None and "reference_path" in metadata:
        del metadata["reference_path"]

    return json.loads(
        mols_to_json(valid_conformers, base_id="conformer", metadata=metadata)
    )
