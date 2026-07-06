import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Molecule2DPreview from './Molecule2DPreview'
import { renderSmilesToSvg } from '../lib/rdkit'

vi.mock('../lib/rdkit', () => ({ renderSmilesToSvg: vi.fn() }))

const renderMock = vi.mocked(renderSmilesToSvg)

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

beforeEach(() => {
  renderMock.mockReset()
})

describe('Molecule2DPreview', () => {
  it('shows a fixed loading state and reports loading upward', async () => {
    const result = deferred<Awaited<ReturnType<typeof renderSmilesToSvg>>>()
    renderMock.mockReturnValue(result.promise)
    const onLoadingChange = vi.fn()
    render(<Molecule2DPreview smiles="CCO" onLoadingChange={onLoadingChange} />)
    expect(screen.getByText('Loading molecule…')).toBeInTheDocument()
    expect(onLoadingChange).toHaveBeenCalledWith(true)
    await act(async () => result.resolve({ status: 'invalid' }))
  })

  it('renders adapter-produced SVG', async () => {
    renderMock.mockResolvedValue({ status: 'success', svg: '<svg data-testid="depiction" />' })
    render(<Molecule2DPreview smiles="CCO" />)
    expect(await screen.findByTestId('depiction')).toBeInTheDocument()
  })

  it('shows invalid SMILES without raw errors or retry', async () => {
    renderMock.mockResolvedValue({ status: 'invalid' })
    render(<Molecule2DPreview smiles="not-smiles" />)
    expect(await screen.findByText('2D preview unavailable')).toBeInTheDocument()
    expect(screen.getByText('not-smiles')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Retry preview' })).not.toBeInTheDocument()
  })

  it('offers retry after initialization failure', async () => {
    renderMock.mockRejectedValueOnce(new Error('secret raw failure'))
    renderMock.mockResolvedValueOnce({ status: 'success', svg: '<svg data-testid="retried" />' })
    render(<Molecule2DPreview smiles="CCO" />)
    const retry = await screen.findByRole('button', { name: 'Retry preview' })
    expect(screen.queryByText('secret raw failure')).not.toBeInTheDocument()
    fireEvent.click(retry)
    expect(screen.getByText('Loading molecule…')).toBeInTheDocument()
    expect(await screen.findByTestId('retried')).toBeInTheDocument()
  })

  it('ignores stale results after the SMILES changes', async () => {
    const oldResult = deferred<Awaited<ReturnType<typeof renderSmilesToSvg>>>()
    const newResult = deferred<Awaited<ReturnType<typeof renderSmilesToSvg>>>()
    renderMock.mockReturnValueOnce(oldResult.promise).mockReturnValueOnce(newResult.promise)
    const { rerender } = render(<Molecule2DPreview smiles="old" />)
    rerender(<Molecule2DPreview smiles="new" />)

    await act(async () => oldResult.resolve({ status: 'success', svg: '<svg data-testid="old" />' }))
    expect(screen.queryByTestId('old')).not.toBeInTheDocument()
    await act(async () => newResult.resolve({ status: 'success', svg: '<svg data-testid="new" />' }))
    expect(screen.getByTestId('new')).toBeInTheDocument()
  })
})
