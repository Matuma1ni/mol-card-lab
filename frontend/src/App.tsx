import { useEffect, useRef, useState } from 'react'
import MoleculeCard from './components/MoleculeCard'
import { getMockSmilesSet } from './data/mockMolecules'
import {
  generateConformers,
  GeneratorError,
  getGeneratorRuntimeStatus,
} from './lib/generator'
import { getPubChemDataBySmiles } from './lib/pubchem'
import type { GeneratedConformer } from './types/molecule'

type GenerationState =
  | { status: 'ready' }
  | { status: 'loading-model' }
  | { status: 'generating' }
  | { status: 'unavailable' }
  | { status: 'complete'; pubChemMatch: boolean }
  | { status: 'zero' }
  | { status: 'failed' }

async function preferPubChemNamedConformer(conformers: GeneratedConformer[]): Promise<{
  conformer: GeneratedConformer
  pubChemMatch: boolean
}> {
  for (const conformer of conformers) {
    if ((await getPubChemDataBySmiles(conformer.smiles ?? ''))?.title) {
      return { conformer, pubChemMatch: true }
    }
  }
  return { conformer: conformers[0], pubChemMatch: false }
}

function App() {
  const selectedMolecule = getMockSmilesSet().molecules[0]
  const [generation, setGeneration] = useState<GenerationState>({ status: 'ready' })
  const [generated, setGenerated] = useState<GeneratedConformer | null>(null)
  const requestId = useRef(0)
  const statusHeading = useRef<HTMLHeadingElement>(null)
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
      const preferred = await preferPubChemNamedConformer(result.conformers)
      if (currentRequest !== requestId.current) return
      setGenerated(preferred.conformer)
      setGeneration({ status: 'complete', pubChemMatch: preferred.pubChemMatch })
    } catch (error) {
      if (currentRequest !== requestId.current) return
      setGeneration({ status: error instanceof GeneratorError ? 'failed' : 'unavailable' })
    }
  }

  const statusCopy = generation.status === 'loading-model'
    ? ['Preparing generator…', 'Loading the model.']
    : generation.status === 'generating'
      ? ['Generating conformer…', 'Finding a valid structure.']
      : generation.status === 'unavailable'
        ? ['Generator unavailable', 'A compatible browser runtime is required.']
        : generation.status === 'failed'
          ? ['Generation could not complete', 'Try again. Your current card remains available.']
          : generation.status === 'zero'
            ? ['No valid conformer returned', 'Try again. Your current card remains available.']
            : generation.status === 'complete'
              ? ['Conformer ready', generation.pubChemMatch
                ? 'Showing a generated conformer with a PubChem match.'
                : 'Showing the first valid generated conformer.']
              : ['Ready', '']

  return (
    <div className="app">
      <header className="app-header"><h1>mol-card-lab</h1></header>
      <main className="app-container">
        <section className="card-stage" aria-label="Generated molecule card">
          {selectedMolecule && <>
            <MoleculeCard smiles={generated?.smiles ?? selectedMolecule.smiles} molBlock={generated?.molBlock} />
            <section className="generation-status" role={generation.status === 'failed' ? 'alert' : 'status'} aria-labelledby="generation-status-heading">
              <h2 id="generation-status-heading" ref={statusHeading} tabIndex={-1}>{statusCopy[0]}</h2>{statusCopy[1] && <p>{statusCopy[1]}</p>}
            </section>
            <button className="generate-conformers-button" type="button" disabled={generating} aria-busy={generating || undefined} onClick={requestGeneration}>
              {generating ? statusCopy[0] : generation.status === 'failed' || generation.status === 'zero' ? 'Try again' : 'Generate conformers'}
            </button>
          </>}
        </section>
      </main>
    </div>
  )
}

export default App
