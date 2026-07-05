"""Opt-in smoke tests for the real model-backed FastAPI endpoint."""

from __future__ import annotations

import os
from pathlib import Path
import sys

import pytest
from fastapi.testclient import TestClient


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from src.api import app
from src.config import REFERENCE_MOLECULES_DIR


pytestmark = pytest.mark.skipif(
    os.environ.get("RUN_MODEL_TESTS") != "1",
    reason="Set RUN_MODEL_TESTS=1 to run real model inference",
)


def _assert_geometry_response(response, expected_source: str) -> dict:
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["conformers"]
    assert data["count"] == data["metadata"]["num_generated"]
    assert all(item["molBlock"].strip() for item in data["conformers"])
    assert all(item["coordinates"] for item in data["conformers"])
    assert data["metadata"]["reference_source"] == expected_source
    return data


def test_real_demo_fallback_generation() -> None:
    response = TestClient(app).post(
        "/generate",
        json={"nSamples": 1, "variance": 0},
    )

    data = _assert_geometry_response(response, "demo_smiles")
    assert data["metadata"]["reference_3d_geometry"] == "embedded"
    assert "reference_path" not in data["metadata"]


def test_real_local_mol_generation() -> None:
    reference = next(REFERENCE_MOLECULES_DIR.rglob("*.mol"), None)
    if reference is None:
        pytest.skip("No local .mol reference fixture is available")
    relative_path = reference.relative_to(REFERENCE_MOLECULES_DIR).as_posix()

    response = TestClient(app).post(
        "/generate",
        json={
            "referenceMolPath": relative_path,
            "nSamples": 1,
            "variance": 0,
        },
    )

    data = _assert_geometry_response(response, "mol_file")
    assert data["metadata"]["reference_3d_geometry"] in {"provided", "embedded"}
    assert data["metadata"]["reference_path"] == relative_path
    assert str(Path(reference).resolve()) not in response.text
