import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { generateConformers, getGeneratorRuntimeStatus } from './lib/generator'
import { getPubChemDataBySmiles } from './lib/pubchem'

vi.mock('./lib/generator', () => ({
  GeneratorError: class GeneratorError extends Error {},
  generateConformers: vi.fn(),
  getGeneratorRuntimeStatus: vi.fn(),
}))

vi.mock('./lib/pubchem', () => ({ getPubChemDataBySmiles: vi.fn() }))

vi.mock('./components/MoleculeCard', () => ({
  default: ({ smiles }: { smiles?: string }) => <article>{smiles}</article>,
}))

const statusMock = vi.mocked(getGeneratorRuntimeStatus)
const generateMock = vi.mocked(generateConformers)
const pubChemMock = vi.mocked(getPubChemDataBySmiles)

beforeEach(() => {
  vi.restoreAllMocks()
  statusMock.mockResolvedValue({ status: 'available' })
  pubChemMock.mockResolvedValue(null)
})

describe('App generation', () => {
  it('requests three internal samples but shows only the first valid result', async () => {
    generateMock.mockResolvedValue({
      conformers: [
        { id: 'generated-1', molBlock: 'first', smiles: 'O' },
        { id: 'generated-2', molBlock: 'second', smiles: 'N' },
      ], generationSource: 'mlconfgen-js', numRequested: 3, numGenerated: 2, parameters: { filterInvalid: true },
    })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Generate conformers' }))
    expect(await screen.findByRole('heading', { name: 'Conformer ready' })).toBeInTheDocument()
    expect(screen.getByText('O')).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Pick another' })).not.toBeInTheDocument()
    expect(generateMock).toHaveBeenCalledWith({ referenceContext: [89.8693, 210.783, 217.7825], nAtoms: 25, nSamples: 3 })
  })

  it('prefers a conformer with a PubChem name', async () => {
    generateMock.mockResolvedValue({
      conformers: [
        { id: 'generated-1', molBlock: 'first', smiles: 'O' },
        { id: 'generated-2', molBlock: 'second', smiles: 'N' },
      ], generationSource: 'mlconfgen-js', numRequested: 3, numGenerated: 2, parameters: { filterInvalid: true },
    })
    pubChemMock.mockResolvedValueOnce(null).mockResolvedValueOnce({ cid: 241, title: 'Ammonia' })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Generate conformers' }))
    expect(await screen.findByText('Showing a generated conformer with a PubChem match.')).toBeInTheDocument()
    expect(screen.getByText('N')).toBeInTheDocument()
  })
})
