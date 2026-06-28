#!/usr/bin/env python
"""Demonstration script for ml_conformer_generator.

This script:
1. Loads a reference molecule (local .mol preferred, embedded SMILES fallback)
2. Generates N conformers using the MLConformerGenerator model
3. Serializes results to JSON (MolBlock + coordinates)
4. Saves output to backend/data/output/

ASSUMPTIONS:
- Model weights are already downloaded to backend/data/model_weights/
- Reference molecule is preferably provided as a local .mol file
- Embedded DEMO_SMILES is only a smoke-test fallback
- Output is consumed by frontend for card UI development

Usage:
    python src/generate_demo.py
    python src/generate_demo.py --reference-mol data/reference_molecules/example.mol

Environment:
    Set SEED=<int> to control randomness
    Set NUM_CONFORMERS=<int> to override default (10)
"""
import argparse
import sys
import json
import logging
import os
from pathlib import Path
from datetime import datetime

from rdkit import Chem

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from config import (
    EDM_WEIGHTS_PATH,
    ADJ_MAT_WEIGHTS_PATH,
    OUTPUT_DIR,
    DEFAULT_NUM_CONFORMERS,
    DEFAULT_VARIANCE,
    DEFAULT_DIFFUSION_STEPS,
    DEMO_SMILES,
    validate_model_weights,
)
from models import ConformerGeneratorWrapper
from molecule_utils import smiles_to_mol_3d, molfile_to_mol, validate_mol
from serialize import mols_to_json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def parse_variance(value: str) -> int:
    """Parse mlconfgen atom-count variance from CLI/env input."""
    try:
        numeric_value = float(value)
    except ValueError as exc:
        raise argparse.ArgumentTypeError("variance must be an integer") from exc

    if not numeric_value.is_integer():
        raise argparse.ArgumentTypeError("variance must be an integer")

    variance = int(numeric_value)
    if variance < 0:
        raise argparse.ArgumentTypeError("variance must be non-negative")

    return variance


def load_reference_molecule(reference_mol_path: str | None) -> tuple[Chem.Mol | None, dict[str, str]]:
    """Load the reference molecule from .mol file or embedded SMILES."""
    metadata: dict[str, str] = {}

    if reference_mol_path:
        logger.info(f"\nStep 1: Loading reference molecule from .mol file: {reference_mol_path}")
        reference, embedded_3d = molfile_to_mol(reference_mol_path)
        if reference is None:
            logger.error("Failed to load .mol reference file")
            return None, metadata

        metadata["reference_source"] = "mol_file"
        metadata["reference_path"] = reference_mol_path
        metadata["reference_3d_geometry"] = "embedded" if embedded_3d else "provided"
        return reference, metadata

    logger.info(f"\nStep 1: Creating reference molecule from SMILES: {DEMO_SMILES}")
    reference = smiles_to_mol_3d(DEMO_SMILES)
    metadata["reference_source"] = "demo_smiles"
    metadata["reference_3d_geometry"] = "embedded"
    return reference, metadata


def main():
    """Run demonstration generation."""
    logger.info("=== ML Conformer Generator Demo ===")

    # Check model weights
    if not validate_model_weights():
        logger.error("Model weights not found. Please download from HuggingFace.")
        return False

    parser = argparse.ArgumentParser(
        description="Generate demo conformers with ml_conformer_generator"
    )
    parser.add_argument(
        "--reference-mol",
        "-r",
        type=str,
        default=None,
        help="Path to a local .mol file to use as the reference molecule",
    )
    parser.add_argument(
        "--num-conformers",
        "-n",
        type=int,
        default=int(os.environ.get("NUM_CONFORMERS", DEFAULT_NUM_CONFORMERS)),
        help="Number of conformers to generate",
    )
    parser.add_argument(
        "--variance",
        type=parse_variance,
        default=parse_variance(os.environ.get("VARIANCE", str(DEFAULT_VARIANCE))),
        help="Atom-count variation used by the generator",
    )
    parser.add_argument(
        "--diffusion-steps",
        type=int,
        default=int(os.environ.get("DIFFUSION_STEPS", DEFAULT_DIFFUSION_STEPS)),
        help="Number of diffusion steps for generation",
    )
    args = parser.parse_args()

    num_conformers = args.num_conformers
    variance = args.variance
    diffusion_steps = args.diffusion_steps

    logger.info(f"Configuration:")
    logger.info(f"  Conformers: {num_conformers}")
    logger.info(f"  Variance: {variance}")
    logger.info(f"  Diffusion steps: {diffusion_steps}")
    logger.info(f"  Reference .mol: {args.reference_mol or 'none (using embedded SMILES)'}")

    # Step 1: Create reference molecule
    reference, reference_metadata = load_reference_molecule(args.reference_mol)

    if reference is None:
        logger.error("Failed to create reference molecule")
        return False

    is_valid, msg = validate_mol(reference)
    if not is_valid:
        logger.error(f"Reference molecule validation failed: {msg}")
        return False

    logger.info(f"✓ Reference molecule created ({reference.GetNumAtoms()} atoms)")

    reference_smiles = Chem.MolToSmiles(reference)

    # Step 2: Initialize generator
    logger.info("\nStep 2: Initializing conformer generator...")
    try:
        generator = ConformerGeneratorWrapper.get_instance(
            edm_weights=str(EDM_WEIGHTS_PATH),
            adj_mat_weights=str(ADJ_MAT_WEIGHTS_PATH),
            diffusion_steps=diffusion_steps,
        )
        logger.info("✓ Generator initialized")
    except Exception as e:
        logger.error(f"Failed to initialize generator: {e}")
        return False

    # Step 3: Generate conformers
    logger.info(f"\nStep 3: Generating {num_conformers} conformers...")
    conformers = generator.generate_conformers(
        reference=reference,
        n_samples=num_conformers,
        variance=variance,
    )

    if not conformers:
        logger.error("Generation produced no conformers")
        return False

    valid_count = sum(1 for c in conformers if c is not None)
    logger.info(f"✓ Generated {valid_count}/{num_conformers} valid conformers")

    # Step 4: Serialize to JSON
    logger.info("\nStep 4: Serializing to JSON...")
    metadata = {
        "reference_smiles": reference_smiles,
        "num_requested": num_conformers,
        "num_generated": valid_count,
        "variance": variance,
        "diffusion_steps": diffusion_steps,
        "generated_at": datetime.now().isoformat(),
        **reference_metadata,
    }

    json_output = mols_to_json(
        conformers,
        base_id="conformer",
        metadata=metadata,
    )

    # Step 5: Save output
    logger.info("\nStep 5: Saving output...")
    output_file = OUTPUT_DIR / "generated_conformers.json"
    output_file.write_text(json_output)
    logger.info(f"✓ Output saved to {output_file}")
    logger.info(f"  File size: {output_file.stat().st_size / 1024:.1f} KB")

    # Summary
    logger.info("\n=== Generation Complete ===")
    logger.info(f"Total conformers: {valid_count}")
    logger.info(f"Output file: {output_file}")

    # Print sample of first conformer
    data = json.loads(json_output)
    if data["conformers"]:
        first = data["conformers"][0]
        logger.info(f"\nSample conformer (ID: {first['id']}):")
        logger.info(f"  SMILES: {first['smiles']}")
        logger.info(f"  Atoms: {first['num_atoms']}")
        logger.info(f"  MolBlock length: {len(first['molBlock'])} chars")
        logger.info(f"  Coordinates: {len(first['coordinates'])} atoms")

    return True


if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except Exception as e:
        logger.error(f"Unhandled exception: {e}", exc_info=True)
        sys.exit(1)
