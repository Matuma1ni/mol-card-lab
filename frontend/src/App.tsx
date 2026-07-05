import { useRef, useState } from 'react'
import { generateConformers, GenerationApiError } from './api/generate'
import GenerationForm from './components/GenerationForm'
import MoleculeCard from './components/MoleculeCard'
import { ConformerSet, GenerateRequest } from './types/molecule'

function App() {
  const [conformerSet, setConformerSet] = useState<ConformerSet | null>(null)
  const [selectedConformerId, setSelectedConformerId] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string>()
  const [warning, setWarning] = useState<string>()
  const generatingRef = useRef(false)

  const handleGenerate = async (request: GenerateRequest) => {
    if (generatingRef.current) return
    generatingRef.current = true
    setIsGenerating(true)
    setError(undefined)
    setWarning(undefined)

    try {
      const result = await generateConformers(request)
      if (result.conformers.length === 0) {
        setError('No conformers were generated. Your previous results are still available.')
        return
      }

      setConformerSet(result)
      setSelectedConformerId(result.conformers[0].id)
      const warnings = result.metadata?.warnings ?? []
      if (warnings.length > 0) setWarning(warnings.join(' '))
    } catch (caught) {
      if (caught instanceof GenerationApiError) {
        console.error('Conformer generation failed', {
          status: caught.status,
          technicalPayload: caught.technicalPayload,
        })
        setError(caught.message)
      } else {
        console.error('Conformer generation failed', caught)
        setError('Conformer generation failed. Please try again.')
      }
    } finally {
      generatingRef.current = false
      setIsGenerating(false)
    }
  }

  const conformers = conformerSet?.conformers ?? []
  const selectedConformer = conformers.find(
    (conformer) => conformer.id === selectedConformerId,
  ) ?? conformers[0]

  return (
    <div className="app">
      <header className="app-header">
        <h1>mol-card-lab</h1>
        <p>Generate collectible conformer cards from local molecular references.</p>
      </header>

      <main className="app-container">
        <section className="generation-panel" aria-label="Generate conformers">
          <GenerationForm
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            error={error}
            warning={warning}
          />
        </section>

        {conformerSet && selectedConformer ? (
          <section className="results" aria-label="Generated conformers">
            <nav className="conformer-selector" aria-label="Choose a conformer">
              {conformers.map((conformer, index) => (
                <button
                  key={conformer.id}
                  className={`conformer-option ${conformer.id === selectedConformer.id ? 'active' : ''}`}
                  type="button"
                  aria-current={conformer.id === selectedConformer.id ? 'true' : undefined}
                  onClick={() => setSelectedConformerId(conformer.id)}
                >
                  <span>Conformer {index + 1}</span>
                  <small>{conformer.smiles}</small>
                </button>
              ))}
            </nav>

            <div className="card-stage" aria-label="Selected molecule card">
              <MoleculeCard conformer={selectedConformer} />
            </div>
          </section>
        ) : (
          <section className="empty-state" aria-live="polite">
            <h2>No generated conformers yet</h2>
            <p>Choose a local reference or use the demo fallback, then generate your first set.</p>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
