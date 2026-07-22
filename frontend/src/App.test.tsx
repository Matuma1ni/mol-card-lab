import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App, { pickDifferentId } from './App'

const reportLoadingBySmiles = new Map<string, (loading: boolean) => void>()

vi.mock('./components/MoleculeCard', () => ({
  default: ({
    className,
    smiles,
    onLoadingChange,
  }: {
    className?: string
    smiles: string
    onLoadingChange: (loading: boolean) => void
  }) => {
    reportLoadingBySmiles.set(smiles, onLoadingChange)
    return <article className={className} data-testid="card">{smiles}</article>
  },
}))

beforeEach(() => {
  reportLoadingBySmiles.clear()
  vi.restoreAllMocks()
})

describe('App selection', () => {
  it('selects randomly once and keeps the selection across ordinary rerenders', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.45)
    const { rerender } = render(<App />)
    expect(screen.getByText('COc1ccc2cc([C@@H](C)C(=O)O)ccc2c1')).toBeInTheDocument()
    rerender(<App />)
    expect(random).toHaveBeenCalledTimes(1)
  })

  it('places one Pick another button below the card and disables it while pending', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    render(<App />)
    const card = screen.getByTestId('card')
    const button = screen.getByRole('button', { name: 'Loading…' })
    expect(card.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(button).toBeDisabled()
    act(() => reportLoadingBySmiles.get('CC(=O)Oc1ccccc1C(=O)O')?.(false))
    expect(screen.getByRole('button', { name: 'Pick another' })).toBeEnabled()
    act(() => reportLoadingBySmiles.get('CC(=O)Oc1ccccc1C(=O)O')?.(true))
    expect(screen.getByRole('button', { name: 'Loading…' })).toBeDisabled()
  })

  it('keeps the previous molecule visible until the next one finishes loading', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0)
    render(<App />)
    act(() => reportLoadingBySmiles.get('CC(=O)Oc1ccccc1C(=O)O')?.(false))
    fireEvent.click(screen.getByRole('button', { name: 'Pick another' }))

    expect(screen.getByText('CC(=O)Oc1ccccc1C(=O)O')).toBeInTheDocument()
    expect(screen.getByText('CC(=O)Oc1ccccc1C(=O)O').closest('article')).toHaveClass('molecule-card--pending')
    expect(screen.getByRole('button', { name: 'Loading…' })).toBeDisabled()

    act(() => reportLoadingBySmiles.get('CN1C(=O)N(C)c2ncn(C)c2C1=O')?.(false))

    expect(screen.queryByText('CC(=O)Oc1ccccc1C(=O)O')).not.toBeInTheDocument()
    expect(screen.getByText('CN1C(=O)N(C)c2ncn(C)c2C1=O')).toBeInTheDocument()
  })
})

describe('pickDifferentId', () => {
  it.each([
    [0, 0, 'b'],
    [1, 0, 'a'],
    [1, 0.99, 'c'],
    [2, 0.99, 'b'],
  ])('maps around current index %s', (currentIndex, randomValue, expected) => {
    vi.spyOn(Math, 'random').mockReturnValue(randomValue)
    expect(pickDifferentId(['a', 'b', 'c'], ['a', 'b', 'c'][currentIndex])).toBe(expected)
  })
})
