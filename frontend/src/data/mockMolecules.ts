/**
 * Fixed local molecule examples for the frontend prototype.
 *
 * Phase 2 uses only SMILES for 2D depiction. The generator path can replace
 * this local catalog with generated SMILES without changing the card input.
 */

import { SmilesExample, SmilesExampleSet } from '../types/molecule'

function localMolecule(id: string, smiles: string): SmilesExample {
  return {
    id,
    smiles,
  }
}

export const MOCK_SMILES_EXAMPLES: SmilesExample[] = [
  localMolecule('aspirin', 'CC(=O)Oc1ccccc1C(=O)O'),
  localMolecule('caffeine', 'CN1C(=O)N(C)c2ncn(C)c2C1=O'),
  localMolecule('acetaminophen', 'CC(=O)NC1=CC=C(C=C1)O'),
  localMolecule('ibuprofen', 'CC(C)Cc1ccc(cc1)[C@@H](C)C(=O)O'),
  localMolecule('naproxen', 'COc1ccc2cc([C@@H](C)C(=O)O)ccc2c1'),
  localMolecule('lidocaine', 'CCN(CC)C(=O)c1c(C)cccc1C'),
  localMolecule('nicotine', 'CN1CCC[C@H]1c2cccnc2'),
  localMolecule('fluoxetine', 'CNCCC(c1ccccc1)Oc2ccc(cc2)C(F)(F)F'),
  localMolecule('diazepam', 'CN1C(=O)CN=C(c2ccccc2)c3cc(Cl)ccc13'),
  localMolecule('warfarin', 'CC(=O)C(c1ccccc1)c2c(O)oc3ccccc3c2=O'),
]

export function getMockSmilesSet(): SmilesExampleSet {
  return {
    molecules: MOCK_SMILES_EXAMPLES,
    count: MOCK_SMILES_EXAMPLES.length,
    metadata: {
      source: 'phase_2_local_catalog',
      note: 'Fixed local examples for frontend depiction only.',
    },
  }
}
