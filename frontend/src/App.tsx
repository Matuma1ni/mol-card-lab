import { useState } from 'react'
import MoleculeCard from './components/MoleculeCard'
import { getMockConformerSet } from './data/mockMolecules'
import { Conformer } from './types/molecule'

function App() {
  const conformerSet = getMockConformerSet()
  const conformers = conformerSet.conformers
  const tabLabels = ['Benzene', 'Methane', 'Ethane', 'Benzene alt']
  const [selectedConformerId, setSelectedConformerId] = useState<string>(conformers[0]?.id ?? '')

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
        <nav className="structure-nav" aria-label="Saved structures">
          <h2>saved structures</h2>
          <div className="structure-tabs">
            {conformers.map((conformer, index) => (
              <button
                key={conformer.id}
                className={`structure-tab ${
                  conformer.id === selectedConformer?.id ? 'active' : ''
                }`}
                type="button"
                onClick={() => setSelectedConformerId(conformer.id)}
              >
                {tabLabels[index] ?? `Structure ${index + 1}`}
              </button>
            ))}
          </div>
        </nav>

        <section className="card-stage" aria-label="Selected molecule card">
          {selectedConformer && (
            <MoleculeCard
              conformer={selectedConformer}
              onSelect={setSelectedConformerId}
            />
          )}
        </section>
      </main>
    </div>
  )
}

export default App
