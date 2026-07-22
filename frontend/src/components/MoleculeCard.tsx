import React, { useEffect, useState } from 'react'
import { getPubChemDataBySmiles, PubChemEnrichment } from '../lib/pubchem'
import { MoleculeCardProps } from '../types/molecule'
import Molecule2DPreview from './Molecule2DPreview'
import '../styles/MoleculeCard.css'

function shouldShowIupacName(
  iupacName: string | undefined,
  displayTitle: string,
): iupacName is string {
  return Boolean(
    iupacName &&
      iupacName.trim().toLowerCase() !== displayTitle.trim().toLowerCase(),
  )
}

export const MoleculeCard: React.FC<MoleculeCardProps> = ({
  className,
  smiles,
  onLoadingChange,
}) => {
  const [pubChem, setPubChem] = useState<PubChemEnrichment | null>(null)
  const [pubChemPending, setPubChemPending] = useState(true)
  const [previewPending, setPreviewPending] = useState(true)

  useEffect(() => {
    let active = true
    setPubChem(null)
    setPubChemPending(true)

    getPubChemDataBySmiles(smiles).then((enrichment) => {
      if (!active) return
      setPubChem(enrichment)
      setPubChemPending(false)
    })

    return () => {
      active = false
    }
  }, [smiles])

  useEffect(() => {
    onLoadingChange?.(pubChemPending || previewPending)
  }, [onLoadingChange, previewPending, pubChemPending])

  const displayTitle = pubChem?.title ?? 'Molecule'
  const displayIupacName = shouldShowIupacName(
    pubChem?.iupacName,
    displayTitle,
  )
    ? pubChem.iupacName
    : undefined
  const molecularWeightLabel =
    pubChem?.molecularWeight === undefined ? 'MW --' : `MW ${pubChem.molecularWeight}`

  return (
    <article className={className ? `molecule-card ${className}` : 'molecule-card'}>
      <h2 className="card-title">{displayTitle}</h2>
      <div className="card-preview">
        <Molecule2DPreview
          smiles={smiles}
          onLoadingChange={setPreviewPending}
        />
      </div>

      <div className="card-footer">
        {displayIupacName && (
          <div className="card-iupac-name">{displayIupacName}</div>
        )}
        <div className="card-label">SMILES</div>
        <div className="card-smiles">{smiles}</div>
      </div>
      <div
        className={
          pubChem?.molecularWeight === undefined
            ? 'card-stat card-stat--unavailable'
            : 'card-stat'
        }
        aria-label="Molecular weight"
      >
        {molecularWeightLabel}
      </div>
    </article>
  )
}

export default MoleculeCard
