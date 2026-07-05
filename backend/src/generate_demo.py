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
import json
import sys
import logging
import os
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from config import (
    OUTPUT_DIR,
    DEFAULT_NUM_CONFORMERS,
    DEFAULT_VARIANCE,
    DEFAULT_DIFFUSION_STEPS,
)

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


def main():
    """Run demonstration generation."""
    logger.info("=== ML Conformer Generator Demo ===")

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

    try:
        from generation_service import generate_conformer_data

        data = generate_conformer_data(
            reference_mol_path=args.reference_mol,
            reference_path_label=args.reference_mol,
            n_samples=num_conformers,
            variance=variance,
            diffusion_steps=diffusion_steps,
        )
    except Exception as e:
        logger.error(f"Generation failed: {e}")
        return False

    # Step 5: Save output
    logger.info("\nStep 5: Saving output...")
    output_file = OUTPUT_DIR / "generated_conformers.json"
    output_file.write_text(json.dumps(data, indent=2))
    logger.info(f"✓ Output saved to {output_file}")
    logger.info(f"  File size: {output_file.stat().st_size / 1024:.1f} KB")

    # Summary
    logger.info("\n=== Generation Complete ===")
    logger.info(f"Total conformers: {data['count']}")
    logger.info(f"Output file: {output_file}")

    # Print sample of first conformer
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
