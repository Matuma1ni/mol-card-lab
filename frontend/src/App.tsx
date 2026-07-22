import { useState } from 'react'
import MoleculeCard from './components/MoleculeCard'
import { getMockSmilesSet } from './data/mockMolecules'
import { SmilesExample } from './types/molecule'

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
  const moleculeSet = getMockSmilesSet()
  const molecules = moleculeSet.molecules
  const moleculeIds = molecules.map((molecule) => molecule.id)
  const [selectedMoleculeId, setSelectedMoleculeId] = useState(() =>
    randomInitialId(moleculeIds),
  )
  const [pendingMoleculeId, setPendingMoleculeId] = useState<string | null>(null)
  const [cardPending, setCardPending] = useState(true)

  const selectedMolecule: SmilesExample | undefined = molecules.find(
    (molecule) => molecule.id === selectedMoleculeId
  ) || molecules[0]
  const pendingMolecule: SmilesExample | undefined = pendingMoleculeId
    ? molecules.find((molecule) => molecule.id === pendingMoleculeId)
    : undefined

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>mol-card-lab</h1>
      </header>

      <main className="app-container">
        <section className="card-stage" aria-label="Selected molecule card">
          {selectedMolecule && (
            <>
              <MoleculeCard
                smiles={selectedMolecule.smiles}
                className={pendingMolecule ? 'molecule-card--pending' : undefined}
                onLoadingChange={setCardPending}
              />
              {pendingMolecule && (
                <div className="card-preloader" aria-hidden="true">
                  <MoleculeCard
                    smiles={pendingMolecule.smiles}
                    onLoadingChange={(loading) => {
                      if (loading) return
                      setSelectedMoleculeId(pendingMolecule.id)
                      setPendingMoleculeId(null)
                    }}
                  />
                </div>
              )}
              <button
                className={
                  cardPending || pendingMolecule
                    ? 'pick-another-button pick-another-button--loading'
                    : 'pick-another-button'
                }
                type="button"
                disabled={cardPending || Boolean(pendingMolecule)}
                aria-busy={cardPending || pendingMolecule ? 'true' : undefined}
                onClick={() => {
                  const nextId = pickDifferentId(moleculeIds, selectedMoleculeId)
                  if (nextId) setPendingMoleculeId(nextId)
                }}
              >
                {cardPending || pendingMolecule ? 'Loading…' : 'Pick another'}
              </button>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
