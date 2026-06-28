"""Utility functions for working with molecules."""
from rdkit import Chem
from rdkit.Chem import AllChem, Descriptors


def smiles_to_mol_3d(smiles: str) -> Chem.Mol | None:
    """Convert SMILES string to 3D RDKit Mol.

    ASSUMPTION: Use AllChem.EmbedMolecule() for 3D coordinate generation.
    This creates an initial 3D conformation before passing to generator.

    Args:
        smiles: SMILES string

    Returns:
        RDKit Mol with 3D coordinates, or None if generation fails
    """
    try:
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return None

        # Add hydrogens (many ML models expect them)
        mol = Chem.AddHs(mol)

        # Generate 3D coordinates
        AllChem.EmbedMolecule(mol, randomSeed=42)
        if mol.GetConformer() is None:
            return None

        # Optional: optimize geometry with MMFF94
        try:
            AllChem.MMFFOptimizeMolecule(mol)
        except Exception:
            # If MMFF fails, continue with unoptimized coords
            pass

        return mol
    except Exception as e:
        print(f"Failed to convert SMILES to 3D Mol: {e}")
        return None


def molfile_to_mol(molfile_path: str) -> tuple[Chem.Mol | None, bool]:
    """Load molecule from .mol file.

    Args:
        molfile_path: Path to .mol file

    Returns:
        Tuple of (RDKit Mol, embedded_3d_flag).
        If the .mol file has no 3D coordinates, they are embedded and
        embedded_3d_flag is True.
    """
    try:
        mol = Chem.MolFromMolFile(molfile_path, sanitize=True, removeHs=False)
        if mol is None:
            print(f"Failed to parse .mol file: {molfile_path}")
            return None, False

        embedded_3d = False
        conf = mol.GetConformer() if mol.GetNumConformers() > 0 else None
        if conf is None or not conf.Is3D():
            embedded_3d = True
            mol = Chem.AddHs(mol)
            AllChem.EmbedMolecule(mol, randomSeed=42)
            if mol.GetNumConformers() == 0:
                print(f"Failed to embed 3D coordinates for .mol file: {molfile_path}")
                return None, False
            try:
                AllChem.MMFFOptimizeMolecule(mol)
            except Exception:
                pass

        return mol, embedded_3d
    except Exception as e:
        print(f"Error loading .mol file: {e}")
        return None, False


def validate_mol(mol: Chem.Mol) -> tuple[bool, str]:
    """Basic molecule validation.

    Args:
        mol: RDKit Mol object

    Returns:
        (is_valid, message)
    """
    if mol is None:
        return False, "Molecule is None"

    if mol.GetNumAtoms() == 0:
        return False, "Molecule has no atoms"

    if mol.GetConformer() is None:
        return False, "Molecule has no 3D coordinates"

    # Check atomic numbers (unsupported heavy atoms?)
    supported_elements = {1, 6, 7, 8, 9, 15, 16, 17, 35}  # H, C, N, O, F, P, S, Cl, Br
    for atom in mol.GetAtoms():
        if atom.GetAtomicNum() not in supported_elements and atom.GetAtomicNum() > 1:
            return False, f"Unsupported element: {atom.GetSymbol()}"

    return True, "OK"
