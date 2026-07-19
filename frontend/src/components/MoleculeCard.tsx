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
  conformer,
  onLoadingChange,
}) => {
  const [pubChem, setPubChem] = useState<PubChemEnrichment | null>(null)

  useEffect(() => {
    let active = true
    setPubChem(null)

    getPubChemDataBySmiles(conformer.smiles).then((enrichment) => {
      if (active) setPubChem(enrichment)
    })

    return () => {
      active = false
    }
  }, [conformer.smiles])

  const displayTitle = pubChem?.title ?? conformer.name
  const displayIupacName = shouldShowIupacName(
    pubChem?.iupacName,
    displayTitle,
  )
    ? pubChem.iupacName
    : undefined
  const molecularWeight = pubChem?.molecularWeight ?? conformer.molecularWeight
  const molecularWeightLabel =
    molecularWeight === undefined ? 'MW --' : `MW ${molecularWeight}`

  return (
    <article className="molecule-card">
      <h2 className="card-title">{displayTitle}</h2>
      <div className="card-preview">
        <Molecule2DPreview
          smiles={conformer.smiles}
          onLoadingChange={onLoadingChange}
        />
      </div>

      <div className="card-footer">
        {displayIupacName && (
          <div className="card-iupac-name">{displayIupacName}</div>
        )}
        <div className="card-label">SMILES</div>
        <div className="card-smiles">{conformer.smiles}</div>
      </div>
      <div
        className={
          molecularWeight === undefined
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
