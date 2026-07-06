import React from 'react'
import { MoleculeCardProps } from '../types/molecule'
import Molecule2DPreview from './Molecule2DPreview'
import '../styles/MoleculeCard.css'

export const MoleculeCard: React.FC<MoleculeCardProps> = ({
  conformer,
  onLoadingChange,
}) => {
  return (
    <article className="molecule-card">
      <h2 className="card-title">{conformer.name}</h2>
      <div className="card-preview">
        <Molecule2DPreview
          smiles={conformer.smiles}
          onLoadingChange={onLoadingChange}
        />
      </div>

      <div className="card-footer">
        <div className="card-label">SMILES</div>
        <div className="card-smiles">{conformer.smiles}</div>
      </div>
    </article>
  )
}

export default MoleculeCard
