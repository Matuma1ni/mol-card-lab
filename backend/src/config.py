"""Configuration paths and settings."""
import os
from pathlib import Path

# Root paths
BACKEND_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BACKEND_DIR / "data"
MODEL_WEIGHTS_DIR = DATA_DIR / "model_weights"
REFERENCE_MOLECULES_DIR = DATA_DIR / "reference_molecules"
OUTPUT_DIR = DATA_DIR / "output"

# Model weight paths
# ASSUMPTION: User downloads these manually from HuggingFace
# https://huggingface.co/Membrizard/ml_conformer_generator
EDM_WEIGHTS_PATH = MODEL_WEIGHTS_DIR / "edm_moi_chembl_15_39.pt"
ADJ_MAT_WEIGHTS_PATH = MODEL_WEIGHTS_DIR / "adj_mat_seer_chembl_15_39.pt"

# Generation defaults
DEFAULT_NUM_CONFORMERS = 10  # ASSUMPTION: Small number for fast testing
DEFAULT_VARIANCE = 2        # ASSUMPTION: Use library default atom-count variation
DEFAULT_DIFFUSION_STEPS = 100

# Reference molecule smoke-test fallback
DEMO_SMILES = "c1ccccc1"  # Benzene (simplest test case)

# Ensure directories exist
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
REFERENCE_MOLECULES_DIR.mkdir(parents=True, exist_ok=True)
MODEL_WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)

def validate_model_weights() -> bool:
    """Check if model weights are available."""
    if not EDM_WEIGHTS_PATH.exists():
        print(f"ERROR: EDM weights not found at {EDM_WEIGHTS_PATH}")
        print("Please download from: https://huggingface.co/Membrizard/ml_conformer_generator")
        return False
    if not ADJ_MAT_WEIGHTS_PATH.exists():
        print(f"ERROR: Adjacency matrix weights not found at {ADJ_MAT_WEIGHTS_PATH}")
        print("Please download from: https://huggingface.co/Membrizard/ml_conformer_generator")
        return False
    return True
