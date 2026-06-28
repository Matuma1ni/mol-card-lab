import React from 'react'
import { MoleculeCardProps } from '../types/molecule'
import MoleculeViewer3D from './MoleculeViewer3D'
import '../styles/MoleculeCard.css'

export const MoleculeCard: React.FC<MoleculeCardProps> = ({
  conformer,
  onSelect
}) => {
  return (
    <div
      className="molecule-card"
      onClick={() => onSelect?.(conformer.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect?.(conformer.id)
        }
      }}
    >
      <div className="card-preview">
        <MoleculeViewer3D
          molBlock={conformer.molBlock}
          smiles={conformer.smiles}
        />
      </div>

      <div className="card-footer">
        <div className="card-label">SMILES</div>
        <div className="card-smiles">{conformer.smiles}</div>
      </div>
    </div>
  )
}

export default MoleculeCard
