import React, { useEffect, useRef } from 'react'
import { MoleculeViewer3DProps } from '../types/molecule'
import '../styles/MoleculeViewer3D.css'

export const MoleculeViewer3D: React.FC<MoleculeViewer3DProps> = ({
  molBlock,
  smiles,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // TODO: Initialize 3Dmol.js viewer
    // Example:
    // const viewer = $3Dmol.createViewer(containerRef.current, {})
    // viewer.addModel(molBlock, 'sdf')
    // viewer.zoomTo()
    // viewer.render()
  }, [molBlock])

  return (
    <div className="molecule-viewer-3d" ref={containerRef}>
      <div className="viewer-placeholder">
        <div className="placeholder-content">
          <div className="placeholder-title">View placeholder</div>
          <div className="placeholder-subtitle">3D viewer pending</div>
          <div className="placeholder-meta">{molBlock.split('\n')[0] || smiles}</div>
        </div>
      </div>
    </div>
  )
}

export default MoleculeViewer3D
