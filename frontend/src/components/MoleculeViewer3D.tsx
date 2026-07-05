import React from 'react'
import { MoleculeViewer3DProps } from '../types/molecule'
import '../styles/MoleculeViewer3D.css'

export const MoleculeViewer3D: React.FC<MoleculeViewer3DProps> = ({
  molBlock,
  smiles,
}) => {
  const hasGeometry = molBlock.trim().length > 0

  return (
    <div className="molecule-viewer-3d" role="img" aria-label={`Geometry preview for ${smiles}`}>
      <div className={`viewer-placeholder ${hasGeometry ? 'loaded' : 'missing'}`}>
        <div className="placeholder-content">
          <div className="placeholder-title">
            {hasGeometry ? 'MolBlock geometry loaded' : 'MolBlock geometry unavailable'}
          </div>
          <div className="placeholder-subtitle">Real 3D rendering is deferred to a later phase.</div>
          <div className="placeholder-meta">{smiles}</div>
        </div>
      </div>
    </div>
  )
}

export default MoleculeViewer3D
