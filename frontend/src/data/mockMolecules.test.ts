import { describe, expect, it } from 'vitest'

import { getMockConformerSet, MOCK_CONFORMERS } from './mockMolecules'

describe('local molecule catalog', () => {
  it('contains exactly ten complete and unique named compounds', () => {
    expect(MOCK_CONFORMERS).toHaveLength(10)

    for (const molecule of MOCK_CONFORMERS) {
      expect(molecule.id.trim()).not.toBe('')
      expect(molecule.name.trim()).not.toBe('')
      expect(molecule.smiles.trim()).not.toBe('')
      expect(molecule).toEqual(expect.objectContaining({
        molBlock: expect.any(String),
        coordinates: expect.any(Array),
        num_atoms: expect.any(Number),
      }))
    }

    for (const field of ['id', 'name', 'smiles'] as const) {
      expect(new Set(MOCK_CONFORMERS.map((molecule) => molecule[field])).size).toBe(10)
    }
  })

  it('returns the catalog through the existing local loading boundary', () => {
    const result = getMockConformerSet()

    expect(result.conformers).toBe(MOCK_CONFORMERS)
    expect(result.count).toBe(10)
    expect(result.metadata).toEqual(expect.objectContaining({
      source: 'phase_2_local_catalog',
    }))
  })
})
