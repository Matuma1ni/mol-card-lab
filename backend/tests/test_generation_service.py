"""Contract tests for the shared Phase 2 generation service."""

from __future__ import annotations

import importlib
import importlib.util
from pathlib import Path
import sys
from typing import Any

import pytest
from rdkit import Chem
from rdkit.Chem import AllChem


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))
sys.path.insert(0, str(BACKEND_DIR / "src"))

from src.config import (
    DEFAULT_DIFFUSION_STEPS,
    DEFAULT_NUM_CONFORMERS,
    DEFAULT_VARIANCE,
)


MODULE_NAME = "src.generation_service"
MODULE_SPEC = importlib.util.find_spec(MODULE_NAME)
generation_service = importlib.import_module(MODULE_NAME) if MODULE_SPEC else None
requires_generation_service = pytest.mark.skipif(
    MODULE_SPEC is None,
    reason="Phase 2 generation service is not implemented yet",
)


def _mol_with_3d(smiles: str, seed: int) -> Chem.Mol:
    mol = Chem.AddHs(Chem.MolFromSmiles(smiles))
    assert AllChem.EmbedMolecule(mol, randomSeed=seed) == 0
    return mol


def _install_fakes(
    monkeypatch: pytest.MonkeyPatch,
    generated: list[Chem.Mol | None],
    reference_metadata: dict[str, str] | None = None,
) -> dict[str, Any]:
    calls: dict[str, Any] = {}
    reference = _mol_with_3d("c1ccccc1", 41)

    def fake_validate_weights() -> bool:
        calls["weights_checked"] = True
        return True

    def fake_load_reference(path: str | None):
        calls["reference_path"] = path
        metadata = reference_metadata or {
            "reference_source": "demo_smiles",
            "reference_3d_geometry": "embedded",
        }
        return reference, dict(metadata)

    class FakeGenerator:
        def generate_conformers(
            self,
            reference: Chem.Mol,
            n_samples: int,
            variance: int,
        ) -> list[Chem.Mol | None]:
            calls["generate"] = {
                "reference": reference,
                "n_samples": n_samples,
                "variance": variance,
            }
            return generated

    def fake_get_instance(**kwargs: Any) -> FakeGenerator:
        calls["generator_init"] = kwargs
        return FakeGenerator()

    monkeypatch.setattr(generation_service, "validate_model_weights", fake_validate_weights)
    monkeypatch.setattr(generation_service, "load_reference_molecule", fake_load_reference)
    monkeypatch.setattr(
        generation_service.ConformerGeneratorWrapper,
        "get_instance",
        fake_get_instance,
    )
    return calls


def test_generation_service_module_exists() -> None:
    assert MODULE_SPEC is not None, "Phase 2 production module missing: src.generation_service"


@requires_generation_service
def test_omitted_values_use_existing_defaults_and_demo_metadata(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    generated = [_mol_with_3d("CC", 42)]
    calls = _install_fakes(monkeypatch, generated)

    result = generation_service.generate_conformer_data()

    assert calls["reference_path"] is None
    assert calls["generate"]["n_samples"] == DEFAULT_NUM_CONFORMERS
    assert calls["generate"]["variance"] == DEFAULT_VARIANCE
    assert calls["generator_init"]["diffusion_steps"] == DEFAULT_DIFFUSION_STEPS
    assert result["metadata"]["reference_source"] == "demo_smiles"
    assert result["metadata"]["reference_3d_geometry"] == "embedded"
    assert "reference_path" not in result["metadata"]


@requires_generation_service
def test_file_reference_preserves_relative_label(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    generated = [_mol_with_3d("CO", 43)]
    calls = _install_fakes(
        monkeypatch,
        generated,
        {
            "reference_source": "mol_file",
            "reference_3d_geometry": "provided",
            "reference_path": "/resolved/private/reference.mol",
        },
    )
    resolved_path = Path("/resolved/private/reference.mol")

    result = generation_service.generate_conformer_data(
        reference_mol_path=str(resolved_path),
        reference_path_label="nested/reference.mol",
        n_samples=1,
        variance=0,
    )

    assert calls["reference_path"] == str(resolved_path)
    assert result["metadata"]["reference_source"] == "mol_file"
    assert result["metadata"]["reference_3d_geometry"] == "provided"
    assert result["metadata"]["reference_path"] == "nested/reference.mol"
    assert str(resolved_path) not in str(result)


@requires_generation_service
def test_partial_results_preserve_order_geometry_and_failure_metadata(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    first = _mol_with_3d("CO", 44)
    second = _mol_with_3d("CCO", 45)
    _install_fakes(monkeypatch, [first, None, second, None])

    result = generation_service.generate_conformer_data(n_samples=4, variance=3)

    assert result["count"] == 2
    assert [item["smiles"] for item in result["conformers"]] == [
        Chem.MolToSmiles(first),
        Chem.MolToSmiles(second),
    ]
    assert all(item.get("molBlock") for item in result["conformers"])
    assert all(item.get("coordinates") for item in result["conformers"])
    assert all("error" not in item for item in result["conformers"])

    metadata = result["metadata"]
    assert metadata["num_requested"] == 4
    assert metadata["num_generated"] == 2
    assert metadata["num_failed"] == 2
    assert isinstance(metadata["warnings"], list)
    assert metadata["warnings"]
    assert metadata["warning_count"] == len(metadata["warnings"])


@requires_generation_service
def test_complete_success_has_no_failures_or_warnings(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    generated = [_mol_with_3d("C", 46), _mol_with_3d("N", 47)]
    _install_fakes(monkeypatch, generated)

    result = generation_service.generate_conformer_data(n_samples=2, variance=1)

    assert result["count"] == 2
    assert result["metadata"]["num_requested"] == 2
    assert result["metadata"]["num_generated"] == 2
    assert result["metadata"]["num_failed"] == 0
    assert result["metadata"]["warnings"] == []
    assert result["metadata"]["warning_count"] == 0
