import { useEffect, useRef, useState } from 'react'
import MoleculeCard from './components/MoleculeCard'
import { getMockSmilesSet } from './data/mockMolecules'
import {
  generateConformers,
  GeneratorError,
  getGeneratorRuntimeStatus,
} from './lib/generator'
import type { GeneratedConformer, SmilesExample } from './types/molecule'

type GenerationState =
  | { status: 'ready' }
  | { status: 'loading-model' }
  | { status: 'generating' }
  | { status: 'unavailable' }
  | { status: 'complete'; requested: number; generated: number }
  | { status: 'zero' }
  | { status: 'failed' }

function randomInitialId(moleculeIds: string[]): string {
  if (moleculeIds.length === 0) return ''
  return moleculeIds[Math.floor(Math.random() * moleculeIds.length)]
}

export function pickDifferentId(moleculeIds: string[], currentId: string): string {
  if (moleculeIds.length < 2) return moleculeIds[0] ?? ''
  const currentIndex = moleculeIds.indexOf(currentId)
  if (currentIndex < 0) return randomInitialId(moleculeIds)
  const otherIndex = Math.floor(Math.random() * (moleculeIds.length - 1))
  return moleculeIds[otherIndex >= currentIndex ? otherIndex + 1 : otherIndex]
}

function App() {
  const molecules = getMockSmilesSet().molecules
  const moleculeIds = molecules.map((molecule) => molecule.id)
  const [selectedMoleculeId, setSelectedMoleculeId] = useState(() => randomInitialId(moleculeIds))
  const [pendingMoleculeId, setPendingMoleculeId] = useState<string | null>(null)
  const [cardPending, setCardPending] = useState(true)
  const [generation, setGeneration] = useState<GenerationState>({ status: 'ready' })
  const [generated, setGenerated] = useState<GeneratedConformer[]>([])
  const [selectedGeneratedId, setSelectedGeneratedId] = useState<string | null>(null)
  const requestId = useRef(0)
  const statusHeading = useRef<HTMLHeadingElement>(null)

  const selectedMolecule: SmilesExample | undefined = molecules.find((molecule) => molecule.id === selectedMoleculeId) || molecules[0]
  const pendingMolecule = pendingMoleculeId ? molecules.find((molecule) => molecule.id === pendingMoleculeId) : undefined
  const selectedGenerated = generated.find((conformer) => conformer.id === selectedGeneratedId)
  const cardSmiles = selectedGenerated ? selectedGenerated.smiles : selectedMolecule?.smiles
  const generating = generation.status === 'loading-model' || generation.status === 'generating'

  useEffect(() => {
    if (generation.status !== 'ready') statusHeading.current?.focus()
  }, [generation.status])

  async function requestGeneration() {
    if (!selectedMolecule || generating) return
    const { referenceContext, nAtoms } = selectedMolecule
    if (!Array.isArray(referenceContext) || referenceContext.length !== 3 || !referenceContext.every(Number.isFinite) || !Number.isInteger(nAtoms) || nAtoms <= 0) {
      setGeneration({ status: 'failed' })
      return
    }
    const currentRequest = ++requestId.current
    setGeneration({ status: 'loading-model' })
    const runtime = await getGeneratorRuntimeStatus()
    if (currentRequest !== requestId.current) return
    if (runtime.status === 'unavailable') {
      setGeneration({ status: 'unavailable' })
      return
    }
    setGeneration({ status: 'generating' })
    try {
      const result = await generateConformers({ referenceContext, nAtoms, nSamples: 3 })
      if (currentRequest !== requestId.current) return
      if (result.numGenerated === 0) {
        setGeneration({ status: 'zero' })
        return
      }
      setGenerated(result.conformers)
      setSelectedGeneratedId(result.conformers[0].id)
      setGeneration({ status: 'complete', requested: result.numRequested, generated: result.numGenerated })
    } catch (error) {
      if (currentRequest !== requestId.current) return
      setGeneration({ status: error instanceof GeneratorError ? 'failed' : 'unavailable' })
    }
  }

  const statusCopy = generation.status === 'loading-model'
    ? ['Preparing local generator…', 'Loading the browser-local model.']
    : generation.status === 'generating'
      ? ['Generating conformers…', 'Generating on this device.']
      : generation.status === 'unavailable'
        ? ['Local generator unavailable', 'Generation stays on this device and requires a compatible browser runtime.']
        : generation.status === 'failed'
          ? ['Generation could not complete', 'Try again. Your current card remains available.']
          : generation.status === 'zero'
            ? ['No valid conformers returned', 'Try again. Your current card remains available.']
            : generation.status === 'complete'
              ? ['Conformers ready', generation.generated < generation.requested
                ? `${generation.generated} of ${generation.requested} conformers are ready; ${generation.requested - generation.generated} invalid conformers were filtered.`
                : `${generation.generated} conformers are ready.`]
              : ['Generate local conformers', 'Generation stays on this device.']

  return (
    <div className="app">
      <header className="app-header"><h1>mol-card-lab</h1></header>
      <main className="app-container">
        <section className="card-stage" aria-label="Selected molecule card">
          {selectedMolecule && <>
            <MoleculeCard smiles={cardSmiles} molBlock={selectedGenerated?.molBlock} className={pendingMolecule ? 'molecule-card--pending' : undefined} onLoadingChange={setCardPending} />
            {pendingMolecule && <div className="card-preloader" aria-hidden="true"><MoleculeCard smiles={pendingMolecule.smiles} onLoadingChange={(loading) => {
              if (!loading) { setSelectedMoleculeId(pendingMolecule.id); setPendingMoleculeId(null) }
            }} /></div>}
            <section className="generation-status" role={generation.status === 'failed' ? 'alert' : 'status'} aria-labelledby="generation-status-heading">
              <h2 id="generation-status-heading" ref={statusHeading} tabIndex={-1}>{statusCopy[0]}</h2><p>{statusCopy[1]}</p>
            </section>
            <button className="generate-conformers-button" type="button" disabled={generating} aria-busy={generating || undefined} onClick={requestGeneration}>
              {generating ? statusCopy[0] : generation.status === 'failed' || generation.status === 'zero' ? 'Try again' : 'Generate conformers'}
            </button>
            {generated.length > 1 && <label className="generated-selector">Choose generated conformer
              <select disabled={generating} value={selectedGeneratedId ?? ''} onChange={(event) => setSelectedGeneratedId(event.target.value)}>
                {generated.map((conformer, index) => <option key={conformer.id} value={conformer.id}>Generated conformer {index + 1} of {generated.length}</option>)}
              </select>
            </label>}
            <button className={cardPending || pendingMolecule ? 'pick-another-button pick-another-button--loading' : 'pick-another-button'} type="button" disabled={cardPending || Boolean(pendingMolecule) || generating} aria-busy={cardPending || Boolean(pendingMolecule) || generating || undefined} onClick={() => {
              const nextId = pickDifferentId(moleculeIds, selectedMoleculeId)
              if (nextId) setPendingMoleculeId(nextId)
            }}>{cardPending || pendingMolecule ? 'Loading…' : 'Pick another'}</button>
          </>}
        </section>
      </main>
    </div>
  )
}

export default App
