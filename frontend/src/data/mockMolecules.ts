/**
 * Fixed local molecule examples for the frontend prototype.
 *
 * Phase 2 uses SMILES for 2D depiction. Empty geometry fields deliberately
 * preserve the Phase 1 conformer-shaped card contract without presenting
 * fixture data as generated 3D geometry.
 */

import { Conformer, ConformerSet } from '../types/molecule'

function localMolecule(id: string, name: string, smiles: string): Conformer {
  return {
    id,
    name,
    smiles,
    molBlock: '',
    coordinates: [],
    num_atoms: 0,
    metadata: {
      source: 'phase_2_local_catalog',
      geometry: 'not_provided',
    },
  }
}

export const MOCK_CONFORMERS: Conformer[] = [
  localMolecule('aspirin', 'Aspirin', 'CC(=O)Oc1ccccc1C(=O)O'),
  localMolecule('caffeine', 'Caffeine', 'CN1C(=O)N(C)c2ncn(C)c2C1=O'),
  localMolecule('acetaminophen', 'Acetaminophen', 'CC(=O)NC1=CC=C(C=C1)O'),
  localMolecule('ibuprofen', 'Ibuprofen', 'CC(C)Cc1ccc(cc1)[C@@H](C)C(=O)O'),
  localMolecule('naproxen', 'Naproxen', 'COc1ccc2cc([C@@H](C)C(=O)O)ccc2c1'),
  localMolecule('lidocaine', 'Lidocaine', 'CCN(CC)C(=O)c1c(C)cccc1C'),
  localMolecule('nicotine', 'Nicotine', 'CN1CCC[C@H]1c2cccnc2'),
  localMolecule('fluoxetine', 'Fluoxetine', 'CNCCC(c1ccccc1)Oc2ccc(cc2)C(F)(F)F'),
  localMolecule('diazepam', 'Diazepam', 'CN1C(=O)CN=C(c2ccccc2)c3cc(Cl)ccc13'),
  localMolecule('warfarin', 'Warfarin', 'CC(=O)C(c1ccccc1)c2c(O)oc3ccccc3c2=O'),
]

export function getMockConformerSet(): ConformerSet {
  return {
    conformers: MOCK_CONFORMERS,
    count: MOCK_CONFORMERS.length,
    metadata: {
      source: 'phase_2_local_catalog',
      note: 'Fixed local examples for frontend depiction only.',
    },
  }
}
