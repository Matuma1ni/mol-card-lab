import { useState } from 'react'
import MoleculeCard from './components/MoleculeCard'
import { getMockConformerSet } from './data/mockMolecules'
import { Conformer } from './types/molecule'

function randomInitialId(conformerIds: string[]): string {
  if (conformerIds.length === 0) return ''
  return conformerIds[Math.floor(Math.random() * conformerIds.length)]
}

export function pickDifferentId(conformerIds: string[], currentId: string): string {
  if (conformerIds.length < 2) return conformerIds[0] ?? ''

  const currentIndex = conformerIds.indexOf(currentId)
  if (currentIndex < 0) return randomInitialId(conformerIds)

  const otherIndex = Math.floor(Math.random() * (conformerIds.length - 1))
  return conformerIds[otherIndex >= currentIndex ? otherIndex + 1 : otherIndex]
}

function App() {
  const conformerSet = getMockConformerSet()
  const conformers = conformerSet.conformers
  const conformerIds = conformers.map((conformer) => conformer.id)
  const [selectedConformerId, setSelectedConformerId] = useState(() =>
    randomInitialId(conformerIds),
  )
  const [previewPending, setPreviewPending] = useState(true)

  const selectedConformer: Conformer | undefined = conformers.find(
    (c) => c.id === selectedConformerId
  ) || conformers[0]

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>mol-card-lab</h1>
      </header>

      <main className="app-container">
        <section className="card-stage" aria-label="Selected molecule card">
          {selectedConformer && (
            <>
              <MoleculeCard
                conformer={selectedConformer}
                onLoadingChange={setPreviewPending}
              />
              <button
                className="pick-another-button"
                type="button"
                disabled={previewPending}
                onClick={() => {
                  setPreviewPending(true)
                  setSelectedConformerId((currentId) =>
                    pickDifferentId(conformerIds, currentId),
                  )
                }}
              >
                Pick another
              </button>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
