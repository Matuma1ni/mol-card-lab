"""Contract tests for the local Phase 2 FastAPI boundary."""

from __future__ import annotations

import importlib
import importlib.util
from pathlib import Path
import sys
from typing import Any

import pytest
from fastapi.testclient import TestClient


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))
sys.path.insert(0, str(BACKEND_DIR / "src"))

from src.config import DEFAULT_NUM_CONFORMERS, DEFAULT_VARIANCE


MODULE_NAME = "src.api"
MODULE_SPEC = importlib.util.find_spec(MODULE_NAME)
api = importlib.import_module(MODULE_NAME) if MODULE_SPEC else None
requires_api = pytest.mark.skipif(
    MODULE_SPEC is None,
    reason="Phase 2 API is not implemented yet",
)


def _response(reference_path: str | None = None) -> dict[str, Any]:
    metadata: dict[str, Any] = {
        "reference_source": "mol_file" if reference_path else "demo_smiles",
        "reference_3d_geometry": "provided" if reference_path else "embedded",
        "num_requested": 1,
        "num_generated": 1,
        "num_failed": 0,
        "warnings": [],
        "warning_count": 0,
    }
    if reference_path:
        metadata["reference_path"] = reference_path
    return {
        "conformers": [
            {
                "id": "conformer_0",
                "smiles": "C",
                "molBlock": "test mol block",
                "coordinates": [[0.0, 0.0, 0.0]],
                "num_atoms": 1,
                "metadata": metadata,
            }
        ],
        "count": 1,
        "metadata": metadata,
    }


def _client_with_stub(
    monkeypatch: pytest.MonkeyPatch,
    reference_root: Path,
) -> tuple[TestClient, list[dict[str, Any]]]:
    calls: list[dict[str, Any]] = []

    def fake_generate_conformer_data(**kwargs: Any) -> dict[str, Any]:
        calls.append(kwargs)
        return _response(kwargs.get("reference_path_label"))

    monkeypatch.setattr(api, "REFERENCE_MOLECULES_DIR", reference_root)
    monkeypatch.setattr(api, "generate_conformer_data", fake_generate_conformer_data)
    return TestClient(api.app), calls


def test_api_module_exists() -> None:
    assert MODULE_SPEC is not None, "Phase 2 production module missing: src.api"


@requires_api
def test_omitted_fields_use_defaults_and_demo_fallback(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    client, calls = _client_with_stub(monkeypatch, tmp_path)

    response = client.post("/generate", json={})

    assert response.status_code == 200
    assert calls == [
        {
            "reference_mol_path": None,
            "reference_path_label": None,
            "n_samples": DEFAULT_NUM_CONFORMERS,
            "variance": DEFAULT_VARIANCE,
        }
    ]
    assert response.json()["metadata"]["reference_source"] == "demo_smiles"


@requires_api
@pytest.mark.parametrize(
    "payload",
    [
        {"nSamples": 0},
        {"nSamples": 26},
        {"nSamples": 1.5},
        {"variance": -1},
        {"variance": 11},
        {"variance": 1.5},
    ],
)
def test_invalid_numeric_values_return_422_without_calling_service(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
    payload: dict[str, Any],
) -> None:
    client, calls = _client_with_stub(monkeypatch, tmp_path)

    response = client.post("/generate", json=payload)

    assert response.status_code == 422
    assert calls == []


@requires_api
def test_approved_numeric_ceilings_are_accepted(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    client, calls = _client_with_stub(monkeypatch, tmp_path)

    response = client.post("/generate", json={"nSamples": 25, "variance": 10})

    assert response.status_code == 200
    assert calls[0]["n_samples"] == 25
    assert calls[0]["variance"] == 10


@requires_api
def test_nested_relative_mol_path_is_resolved_but_only_label_is_returned(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    reference_root = tmp_path / "references"
    nested_file = reference_root / "nested" / "reference.mol"
    nested_file.parent.mkdir(parents=True)
    nested_file.write_text("test mol", encoding="utf-8")
    client, calls = _client_with_stub(monkeypatch, reference_root)

    response = client.post(
        "/generate",
        json={"referenceMolPath": "nested/reference.mol"},
    )

    assert response.status_code == 200
    assert Path(calls[0]["reference_mol_path"]) == nested_file.resolve()
    assert calls[0]["reference_path_label"] == "nested/reference.mol"
    assert response.json()["metadata"]["reference_path"] == "nested/reference.mol"
    assert str(nested_file.resolve()) not in response.text


@requires_api
@pytest.mark.parametrize(
    "reference_path",
    [
        "../escape.mol",
        "nested/../../escape.mol",
        "reference.sdf",
        "missing.mol",
    ],
)
def test_invalid_reference_paths_return_422_without_calling_service(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
    reference_path: str,
) -> None:
    client, calls = _client_with_stub(monkeypatch, tmp_path)

    response = client.post(
        "/generate",
        json={"referenceMolPath": reference_path},
    )

    assert response.status_code == 422
    assert calls == []


@requires_api
def test_absolute_reference_path_returns_422_without_calling_service(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    candidate = tmp_path / "reference.mol"
    candidate.write_text("test mol", encoding="utf-8")
    client, calls = _client_with_stub(monkeypatch, tmp_path)

    response = client.post(
        "/generate",
        json={"referenceMolPath": str(candidate.resolve())},
    )

    assert response.status_code == 422
    assert calls == []


@requires_api
def test_symlink_escape_returns_422_without_calling_service(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    reference_root = tmp_path / "references"
    reference_root.mkdir()
    outside = tmp_path / "outside.mol"
    outside.write_text("test mol", encoding="utf-8")
    symlink = reference_root / "escaped.mol"
    try:
        symlink.symlink_to(outside)
    except OSError as exc:
        pytest.skip(f"symlinks are unavailable: {exc}")
    client, calls = _client_with_stub(monkeypatch, reference_root)

    response = client.post(
        "/generate",
        json={"referenceMolPath": "escaped.mol"},
    )

    assert response.status_code == 422
    assert calls == []
