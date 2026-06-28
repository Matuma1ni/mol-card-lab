"""Molecule serialization utilities.

Converts RDKit Mol objects to JSON format for frontend consumption.
Preserves MolBlock/SDF as the primary geometry serialization.
Coordinate arrays are retained as derived convenience data.
"""
import json
from typing import Any
from rdkit import Chem
from rdkit.Chem import AllChem
import numpy as np


def mol_to_molblock(mol: Chem.Mol) -> str:
    """Convert RDKit Mol to 3D MolBlock (SDF) string.

    ASSUMPTION: MolBlock preserves 3D coordinates for future rendering.

    Args:
        mol: RDKit Mol object with 3D coordinates

    Returns:
        MolBlock string (3D SDF format)
    """
    if mol is None:
        return ""
    return Chem.MolToMolBlock(mol)


def extract_coordinates(mol: Chem.Mol) -> list[list[float]]:
    """Extract 3D coordinates from RDKit Mol.

    Args:
        mol: RDKit Mol object

    Returns:
        List of [x, y, z] coordinate arrays
    """
    if mol is None or mol.GetConformer() is None:
        return []

    conf = mol.GetConformer()
    coords = []
    for i in range(mol.GetNumAtoms()):
        pos = conf.GetAtomPosition(i)
        coords.append([float(pos.x), float(pos.y), float(pos.z)])
    return coords


def mol_to_dict(mol: Chem.Mol, mol_id: str, metadata: dict[str, Any] | None = None) -> dict:
    """Convert RDKit Mol to JSON-serializable dict.

    ASSUMPTION: Each conformer includes MolBlock/SDF as the primary geometry.
    Coordinates are derived from the same 3D conformer and retained for debugging/UI convenience.

    Args:
        mol: RDKit Mol object with 3D coordinates
        mol_id: Unique identifier for this conformer
        metadata: Optional metadata (variance, generation params, etc.)

    Returns:
        Dict with structure:
        {
            "id": "conformer_0",
            "smiles": "c1ccccc1",
            "molBlock": "...",
            "coordinates": [[x,y,z], ...],
            "num_atoms": 6,
            "metadata": {...}
        }
    """
    if mol is None:
        return {"id": mol_id, "error": "Mol is None"}

    # Get canonical SMILES for identity
    smiles = Chem.MolToSmiles(mol) if mol is not None else ""

    return {
        "id": mol_id,
        "smiles": smiles,
        "molBlock": mol_to_molblock(mol),
        "coordinates": extract_coordinates(mol),
        "num_atoms": mol.GetNumAtoms(),
        "metadata": metadata or {},
    }


def mols_to_json(
    mols: list[Chem.Mol | None],
    base_id: str = "conformer",
    metadata: dict[str, Any] | None = None,
) -> str:
    """Convert list of RDKit Mols to JSON string.

    Args:
        mols: List of RDKit Mol objects
        base_id: Prefix for molecule IDs (e.g., "conformer_0", "conformer_1")
        metadata: Shared metadata to include for each molecule

    Returns:
        JSON string
    """
    data = {
        "conformers": [
            mol_to_dict(mol, f"{base_id}_{i}", metadata)
            for i, mol in enumerate(mols)
        ],
        "count": len(mols),
        "metadata": metadata or {},
    }
    return json.dumps(data, indent=2, default=str)


def load_json_conformers(json_str: str) -> list[dict]:
    """Load conformers from JSON string.

    Args:
        json_str: JSON string from mols_to_json()

    Returns:
        List of conformer dicts
    """
    data = json.loads(json_str)
    return data.get("conformers", [])
