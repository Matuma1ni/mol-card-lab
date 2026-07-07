import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App, { pickDifferentId } from './App'

let reportLoading: ((loading: boolean) => void) | undefined

vi.mock('./components/MoleculeCard', () => ({
  default: ({ conformer, onLoadingChange }: { conformer: { name: string }; onLoadingChange: (loading: boolean) => void }) => {
    reportLoading = onLoadingChange
    return <article data-testid="card">{conformer.name}</article>
  },
}))

beforeEach(() => {
  reportLoading = undefined
  vi.restoreAllMocks()
})

describe('App selection', () => {
  it('selects randomly once and keeps the selection across ordinary rerenders', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.45)
    const { rerender } = render(<App />)
    expect(screen.getByText('Naproxen')).toBeInTheDocument()
    rerender(<App />)
    expect(random).toHaveBeenCalledTimes(1)
  })

  it('places one Pick another button below the card and disables it while pending', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    render(<App />)
    const card = screen.getByTestId('card')
    const button = screen.getByRole('button', { name: 'Pick another' })
    expect(card.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(button).toBeDisabled()
    act(() => reportLoading?.(false))
    expect(button).toBeEnabled()
    act(() => reportLoading?.(true))
    expect(button).toBeDisabled()
  })

  it('always changes to a different molecule', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0)
    render(<App />)
    act(() => reportLoading?.(false))
    fireEvent.click(screen.getByRole('button', { name: 'Pick another' }))
    expect(screen.queryByText('Aspirin')).not.toBeInTheDocument()
    expect(screen.getByText('Caffeine')).toBeInTheDocument()
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
