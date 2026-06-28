/**
 * Mock molecule data for frontend development.
 *
 * ASSUMPTION: These are realistic molecules generated once from RDKit.
 * Structure: {id, smiles, molBlock, coordinates}
 *
 * For now, it's hardcoded for Phase 1 UI development without running Python.
 */

import { Conformer } from '../types/molecule'

// Simple benzene conformer (realistic MolBlock + coordinates)
const BENZENE_CONFORMER: Conformer = {
  id: 'mock_benzene_1',
  smiles: 'c1ccccc1',
  molBlock: `
     RDKit          3D

  6  6  0  0  0  0  0  0  0  0999 V2000
    1.2124    0.6996    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    0.6062    1.2124    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   -0.6062    1.2124    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   -1.2124    0.6996    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   -0.6062   -0.6996    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    0.6062   -0.6996    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  2  0
  2  3  1  0
  3  4  2  0
  4  5  1  0
  5  6  2  0
  6  1  1  0
M  END
`,
  coordinates: [
    [1.2124, 0.6996, 0.0],
    [0.6062, 1.2124, 0.0],
    [-0.6062, 1.2124, 0.0],
    [-1.2124, 0.6996, 0.0],
    [-0.6062, -0.6996, 0.0],
    [0.6062, -0.6996, 0.0],
  ],
  num_atoms: 6,
  metadata: {
    source: 'mock',
    generated_at: '2024-01-01T00:00:00Z',
  },
}

// Methane conformer
const METHANE_CONFORMER: Conformer = {
  id: 'mock_methane_1',
  smiles: 'C',
  molBlock: `
     RDKit          3D

  1  0  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
M  END
`,
  coordinates: [
    [0.0, 0.0, 0.0],
  ],
  num_atoms: 1,
  metadata: {
    source: 'mock',
    generated_at: '2024-01-01T00:00:00Z',
  },
}

// Ethane conformer
const ETHANE_CONFORMER: Conformer = {
  id: 'mock_ethane_1',
  smiles: 'CC',
  molBlock: `
     RDKit          3D

  2  1  0  0  0  0  0  0  0  0999 V2000
   -0.7590    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    0.7590    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0
M  END
`,
  coordinates: [
    [-0.759, 0.0, 0.0],
    [0.759, 0.0, 0.0],
  ],
  num_atoms: 2,
  metadata: {
    source: 'mock',
    generated_at: '2024-01-01T00:00:00Z',
  },
}

// Benzene with different conformer
const BENZENE_CONFORMER_2: Conformer = {
  id: 'mock_benzene_2',
  smiles: 'c1ccccc1',
  molBlock: `
     RDKit          3D

  6  6  0  0  0  0  0  0  0  0999 V2000
    1.2124    0.6996    0.1000 C   0  0  0  0  0  0  0  0  0  0  0  0
    0.6062    1.2124    0.1000 C   0  0  0  0  0  0  0  0  0  0  0  0
   -0.6062    1.2124    0.1000 C   0  0  0  0  0  0  0  0  0  0  0  0
   -1.2124    0.6996    0.1000 C   0  0  0  0  0  0  0  0  0  0  0  0
   -0.6062   -0.6996    0.1000 C   0  0  0  0  0  0  0  0  0  0  0  0
    0.6062   -0.6996    0.1000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  2  0
  2  3  1  0
  3  4  2  0
  4  5  1  0
  5  6  2  0
  6  1  1  0
M  END
`,
  coordinates: [
    [1.2124, 0.6996, 0.1],
    [0.6062, 1.2124, 0.1],
    [-0.6062, 1.2124, 0.1],
    [-1.2124, 0.6996, 0.1],
    [-0.6062, -0.6996, 0.1],
    [0.6062, -0.6996, 0.1],
  ],
  num_atoms: 6,
  metadata: {
    source: 'mock',
    generated_at: '2024-01-01T00:00:00Z',
  },
}

/**
 * Mock dataset of conformers.
 * Used for UI development without running the Python backend.
 */
export const MOCK_CONFORMERS: Conformer[] = [
  BENZENE_CONFORMER,
  METHANE_CONFORMER,
  ETHANE_CONFORMER,
  BENZENE_CONFORMER_2,
]

/**
 * Load mock data as a complete ConformerSet.
 */
export function getMockConformerSet() {
  return {
    conformers: MOCK_CONFORMERS,
    count: MOCK_CONFORMERS.length,
    metadata: {
      source: 'mock_data',
      note: 'For Phase 1 UI development only.',
    },
  }
}
