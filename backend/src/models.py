"""Wrapper around ml_conformer_generator library."""
from typing import Optional
from rdkit import Chem
from mlconfgen import MLConformerGenerator
import logging

logger = logging.getLogger(__name__)


class ConformerGeneratorWrapper:
    """Wrapper for MLConformerGenerator with error handling.

    ASSUMPTION: MLConformerGenerator is expensive to initialize (loads model weights).
    This wrapper keeps a singleton instance.
    """

    _instance: Optional["ConformerGeneratorWrapper"] = None

    def __init__(self, edm_weights: str, adj_mat_weights: str, diffusion_steps: int = 100):
        """Initialize the conformer generator.

        Args:
            edm_weights: Path to EDM model weights (edm_moi_chembl_15_39.pt)
            adj_mat_weights: Path to adjacency matrix weights (adj_mat_seer_chembl_15_39.pt)
            diffusion_steps: Number of denoising steps (higher = better, slower)
        """
        logger.info(f"Initializing MLConformerGenerator with {diffusion_steps} diffusion steps...")

        try:
            self.model = MLConformerGenerator(
                edm_weights=edm_weights,
                adj_mat_seer_weights=adj_mat_weights,
                diffusion_steps=diffusion_steps,
            )
            self.diffusion_steps = diffusion_steps
            logger.info("Generator initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize generator: {e}")
            raise

    @classmethod
    def get_instance(
        cls,
        edm_weights: str,
        adj_mat_weights: str,
        diffusion_steps: int = 100,
    ) -> "ConformerGeneratorWrapper":
        """Get or create singleton instance.

        Args:
            edm_weights: Path to EDM weights
            adj_mat_weights: Path to adjacency matrix weights
            diffusion_steps: Number of denoising steps

        Returns:
            ConformerGeneratorWrapper instance
        """
        if cls._instance is None:
            cls._instance = cls(edm_weights, adj_mat_weights, diffusion_steps)
        return cls._instance

    def generate_conformers(
        self,
        reference: Chem.Mol,
        n_samples: int = 10,
        variance: int = 2,
    ) -> list[Chem.Mol | None]:
        """Generate conformers from a reference molecule.

        ASSUMPTION: Reference molecule is already 3D (from .mol file or created externally).
        If reference is 2D or has no conformer, the generator may fail.

        Args:
            reference: RDKit Mol object (must have 3D coordinates)
            n_samples: Number of conformers to generate
            variance: Integer atom-count variation for generation

        Returns:
            List of generated Mol objects (may include None for failed generations)
        """
        if reference is None:
            logger.error("Reference molecule is None")
            return []

        if variance < 0:
            logger.error("Variance must be non-negative")
            return []

        try:
            variance = int(variance)
            logger.info(f"Generating {n_samples} conformers with variance={variance}...")
            samples = self.model.generate_conformers(
                reference_conformer=reference,
                n_samples=n_samples,
                variance=variance,
            )
            logger.info(f"Successfully generated {len(samples)} conformers")
            return samples
        except Exception as e:
            logger.error(f"Generation failed: {e}")
            return []
