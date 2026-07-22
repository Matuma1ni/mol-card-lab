import { describe, expect, it } from 'vitest'

import { getMockSmilesSet, MOCK_SMILES_EXAMPLES } from './mockMolecules'

describe('local molecule catalog', () => {
  it('contains exactly ten complete and unique SMILES examples', () => {
    expect(MOCK_SMILES_EXAMPLES).toHaveLength(10)

    for (const molecule of MOCK_SMILES_EXAMPLES) {
      expect(molecule.id.trim()).not.toBe('')
      expect(molecule.smiles.trim()).not.toBe('')
    }

    for (const field of ['id', 'smiles'] as const) {
      expect(new Set(MOCK_SMILES_EXAMPLES.map((molecule) => molecule[field])).size).toBe(10)
    }
  })

  it('returns the catalog through the existing local loading boundary', () => {
    const result = getMockSmilesSet()

    expect(result.molecules).toBe(MOCK_SMILES_EXAMPLES)
    expect(result.count).toBe(10)
    expect(result.metadata).toEqual(expect.objectContaining({
      source: 'phase_2_local_catalog',
    }))
  })
})
