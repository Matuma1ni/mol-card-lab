import React from 'react'
import { MoleculeCardProps } from '../types/molecule'
import MoleculeViewer3D from './MoleculeViewer3D'
import '../styles/MoleculeCard.css'

export const MoleculeCard: React.FC<MoleculeCardProps> = ({
  conformer,
}) => {
  const referenceSource = conformer.metadata?.reference_source
  const referenceLabel = referenceSource === 'mol_file'
    ? 'Local .mol file'
    : referenceSource === 'demo_smiles'
      ? 'DEMO_SMILES fallback'
      : 'Unknown'

  return (
    <article className="molecule-card">
      <div className="card-preview">
        <MoleculeViewer3D
          molBlock={conformer.molBlock}
          smiles={conformer.smiles}
        />
      </div>

      <div className="card-footer">
        <dl className="card-metadata">
          <div>
            <dt>SMILES</dt>
            <dd className="card-smiles">{conformer.smiles}</dd>
          </div>
          <div>
            <dt>Atom count</dt>
            <dd>{conformer.num_atoms}</dd>
          </div>
          <div>
            <dt>Reference source</dt>
            <dd>{referenceLabel}</dd>
          </div>
        </dl>
      </div>
    </article>
  )
}

export default MoleculeCard
