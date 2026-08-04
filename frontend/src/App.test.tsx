import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App, { pickDifferentId } from './App'
import { generateConformers, getGeneratorRuntimeStatus } from './lib/generator'

const reportLoadingBySmiles = new Map<string, (loading: boolean) => void>()

vi.mock('./lib/generator', () => ({
  GeneratorError: class GeneratorError extends Error {},
  generateConformers: vi.fn(),
  getGeneratorRuntimeStatus: vi.fn(),
}))

vi.mock('./components/MoleculeCard', () => ({
  default: ({ className, smiles, onLoadingChange }: { className?: string; smiles?: string; onLoadingChange: (loading: boolean) => void }) => {
    if (smiles) reportLoadingBySmiles.set(smiles, onLoadingChange)
    return <article className={className} data-testid="card">{smiles ?? '2D preview unavailable'}</article>
  },
}))

const statusMock = vi.mocked(getGeneratorRuntimeStatus)
const generateMock = vi.mocked(generateConformers)

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolvePromise) => { resolve = resolvePromise })
  return { promise, resolve }
}

beforeEach(() => {
  reportLoadingBySmiles.clear()
  vi.restoreAllMocks()
  statusMock.mockResolvedValue({ status: 'available' })
})

describe('App generation', () => {
  it('makes the locked selected-fixture request only after Generate conformers', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    generateMock.mockResolvedValue({ conformers: [], generationSource: 'mlconfgen-js', numRequested: 3, numGenerated: 0, parameters: { filterInvalid: true } })
    render(<App />)
    expect(generateMock).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Generate conformers' }))
    await screen.findByRole('heading', { name: 'No valid conformers returned' })
    expect(generateMock).toHaveBeenCalledWith({ referenceContext: [89.8693, 210.783, 217.7825], nAtoms: 25, nSamples: 3 })
  })

  it('keeps the card browseable when the local runtime is unavailable', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    statusMock.mockResolvedValue({ status: 'unavailable', reason: 'browser-runtime-unavailable' })
    render(<App />)
    act(() => reportLoadingBySmiles.get('CC(=O)Oc1ccccc1C(=O)O')?.(false))
    fireEvent.click(screen.getByRole('button', { name: 'Generate conformers' }))
    expect(await screen.findByRole('heading', { name: 'Local generator unavailable' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pick another' })).toBeEnabled()
  })

  it('shows filtered counts and selects generated results by ordinal', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    generateMock.mockResolvedValue({
      conformers: [
        { id: 'generated-1', molBlock: 'mol one', smiles: 'O' },
        { id: 'generated-2', molBlock: 'mol two' },
      ], generationSource: 'mlconfgen-js', numRequested: 3, numGenerated: 2, parameters: { filterInvalid: true },
    })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Generate conformers' }))
    expect(await screen.findByText('2 of 3 conformers are ready; 1 invalid conformers were filtered.')).toBeInTheDocument()
    const selector = screen.getByRole('combobox', { name: 'Choose generated conformer' })
    expect(screen.getByText('O')).toBeInTheDocument()
    fireEvent.change(selector, { target: { value: 'generated-2' } })
    expect(screen.getByText('2D preview unavailable')).toBeInTheDocument()
  })

  it('disables generation and fixture selection while a request is active', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const first = deferred<Awaited<ReturnType<typeof generateConformers>>>()
    generateMock.mockReturnValueOnce(first.promise)
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Generate conformers' }))
    await screen.findByRole('heading', { name: 'Generating conformers…' })
    expect(screen.getByRole('button', { name: 'Generating conformers…' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Loading…' })).toBeDisabled()
    await act(async () => first.resolve({ conformers: [{ id: 'generated-1', molBlock: 'old', smiles: 'O' }], generationSource: 'mlconfgen-js', numRequested: 3, numGenerated: 1, parameters: { filterInvalid: true } }))
    expect(screen.getByText('O')).toBeInTheDocument()
  })
})

describe('pickDifferentId', () => {
  it.each([[0, 0, 'b'], [1, 0, 'a'], [1, 0.99, 'c'], [2, 0.99, 'b']])(
    'maps around current index %s', (currentIndex, randomValue, expected) => {
      vi.spyOn(Math, 'random').mockReturnValue(randomValue)
      expect(pickDifferentId(['a', 'b', 'c'], ['a', 'b', 'c'][currentIndex])).toBe(expected)
    },
  )
})
