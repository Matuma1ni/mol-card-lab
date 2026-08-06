import React, { useEffect, useState } from 'react'
import { renderMolBlockToSvg, renderSmilesToSvg } from '../lib/rdkit'
import '../styles/Molecule2DPreview.css'

interface Molecule2DPreviewProps {
  smiles?: string
  molBlock?: string
  onLoadingChange?: (loading: boolean) => void
}

type PreviewState =
  | { status: 'loading' }
  | { status: 'ready'; svg: string }
  | { status: 'invalid' }
  | { status: 'error' }

export const Molecule2DPreview: React.FC<Molecule2DPreviewProps> = ({
  smiles,
  molBlock,
  onLoadingChange,
}) => {
  const [state, setState] = useState<PreviewState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let current = true
    if (!smiles && !molBlock) {
      setState({ status: 'invalid' })
      onLoadingChange?.(false)
      return () => { current = false }
    }
    setState({ status: 'loading' })
    onLoadingChange?.(true)

    const render = molBlock ? renderMolBlockToSvg(molBlock) : renderSmilesToSvg(smiles!)
    render
      .then((result) => {
        if (!current) return
        setState(
          result.status === 'success'
            ? { status: 'ready', svg: result.svg }
            : { status: 'invalid' },
        )
        onLoadingChange?.(false)
      })
      .catch(() => {
        if (!current) return
        setState({ status: 'error' })
        onLoadingChange?.(false)
      })

    return () => {
      current = false
    }
  }, [attempt, molBlock, onLoadingChange, smiles])

  if (state.status === 'loading') {
    return (
      <div className="molecule-2d-preview molecule-2d-preview--loading" aria-label="Molecule artwork">
        <span>Loading molecule…</span>
      </div>
    )
  }

  if (state.status === 'ready') {
    return (
      <div
        className="molecule-2d-preview molecule-2d-preview--ready"
        aria-label="Molecule artwork"
        dangerouslySetInnerHTML={{ __html: state.svg }}
      />
    )
  }

  return (
    <div className="molecule-2d-preview molecule-2d-preview--fallback" aria-label="Molecule artwork">
      <strong>2D preview unavailable</strong>
      {smiles && <span className="molecule-2d-preview__smiles">{smiles}</span>}
      {state.status === 'error' && (
        <button type="button" onClick={() => setAttempt((value) => value + 1)}>
          Retry preview
        </button>
      )}
    </div>
  )
}

export default Molecule2DPreview
