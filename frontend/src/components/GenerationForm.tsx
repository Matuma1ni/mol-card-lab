import { FormEvent, useState } from 'react'
import { GenerateRequest } from '../types/molecule'
import '../styles/GenerationForm.css'

const DEFAULT_N_SAMPLES = 10
const DEFAULT_VARIANCE = 2
const MAX_N_SAMPLES = 25
const MAX_VARIANCE = 10

interface GenerationFormProps {
  onGenerate: (request: GenerateRequest) => void | Promise<void>
  isGenerating: boolean
  error?: string
  warning?: string
}

export default function GenerationForm({
  onGenerate,
  isGenerating,
  error,
  warning,
}: GenerationFormProps) {
  const [referenceMolPath, setReferenceMolPath] = useState('')
  const [nSamples, setNSamples] = useState(DEFAULT_N_SAMPLES)
  const [variance, setVariance] = useState(DEFAULT_VARIANCE)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedPath = referenceMolPath.trim()
    void onGenerate({
      referenceMolPath: trimmedPath || undefined,
      nSamples,
      variance,
    })
  }

  const reset = () => {
    setReferenceMolPath('')
    setNSamples(DEFAULT_N_SAMPLES)
    setVariance(DEFAULT_VARIANCE)
  }

  return (
    <form className="generation-form" onSubmit={handleSubmit} aria-busy={isGenerating}>
      <div className="generation-field">
        <label htmlFor="reference-mol-path">Reference molecule</label>
        <div className="path-input">
          <span aria-hidden="true">backend/data/reference_molecules/</span>
          <input
            id="reference-mol-path"
            type="text"
            value={referenceMolPath}
            onChange={(event) => setReferenceMolPath(event.target.value)}
            placeholder="nested/reference.mol"
            disabled={isGenerating}
          />
        </div>
        <p className="field-hint">
          Enter a relative .mol path under the allowed root. Leave blank to use the DEMO_SMILES smoke-test fallback.
        </p>
      </div>

      <details className="advanced-options">
        <summary>Advanced options</summary>
        <div className="advanced-grid">
          <label htmlFor="n-samples">
            Conformers
            <input
              id="n-samples"
              type="number"
              min={1}
              max={MAX_N_SAMPLES}
              step={1}
              value={nSamples}
              onChange={(event) => setNSamples(event.currentTarget.valueAsNumber)}
              disabled={isGenerating}
              required
            />
          </label>
          <label htmlFor="variance">
            Variance
            <input
              id="variance"
              type="number"
              min={0}
              max={MAX_VARIANCE}
              step={1}
              value={variance}
              onChange={(event) => setVariance(event.currentTarget.valueAsNumber)}
              disabled={isGenerating}
              required
            />
          </label>
        </div>
      </details>

      {error && <p className="generation-message error" role="alert">{error}</p>}
      {warning && <p className="generation-message warning" role="status">{warning}</p>}
      {isGenerating && <p className="generation-status" role="status">Generating conformers…</p>}

      <div className="generation-actions">
        <button type="submit" disabled={isGenerating}>Generate</button>
        <button type="button" className="secondary" onClick={reset} disabled={isGenerating}>
          Reset to defaults
        </button>
      </div>
    </form>
  )
}
