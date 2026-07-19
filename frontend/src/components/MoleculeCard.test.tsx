import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MoleculeCard from './MoleculeCard'
import { getPubChemDataBySmiles } from '../lib/pubchem'

vi.mock('./Molecule2DPreview', () => ({
  default: ({ smiles }: { smiles: string }) => <div aria-label="Molecule artwork">Artwork for {smiles}</div>,
}))

vi.mock('../lib/pubchem', () => ({
  getPubChemDataBySmiles: vi.fn(),
}))

const conformer = {
  id: 'test',
  name: 'Test molecule',
  smiles: 'CC(=O)Oc1ccccc1C(=O)O'.repeat(4),
  molBlock: '',
  coordinates: [] as [number, number, number][],
  num_atoms: 0,
}

beforeEach(() => {
  vi.mocked(getPubChemDataBySmiles).mockReset()
  vi.mocked(getPubChemDataBySmiles).mockResolvedValue(null)
})

describe('MoleculeCard', () => {
  it('renders an inside-card title before 2D artwork and a labeled SMILES footer', () => {
    render(<MoleculeCard conformer={conformer} />)
    const card = screen.getByRole('article')
    const title = screen.getByRole('heading', { name: 'Test molecule' })
    const artwork = screen.getByLabelText('Molecule artwork')
    expect(card).toContainElement(title)
    expect(card).toContainElement(artwork)
    expect(title.compareDocumentPosition(artwork) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByText('SMILES')).toBeInTheDocument()
    expect(screen.getByText(conformer.smiles)).toBeInTheDocument()
    expect(screen.getByLabelText('Molecular weight')).toHaveTextContent('MW --')
    expect(card).not.toHaveAttribute('role', 'button')
    expect(screen.queryByText(/3D viewer pending/i)).not.toBeInTheDocument()
  })

  it('uses PubChem title, IUPAC name, and molecular weight when enrichment is available', async () => {
    vi.mocked(getPubChemDataBySmiles).mockResolvedValue({
      cid: 2244,
      title: 'Aspirin',
      iupacName: '2-acetyloxybenzoic acid',
      molecularWeight: 180.16,
    })

    render(<MoleculeCard conformer={conformer} />)

    expect(await screen.findByRole('heading', { name: 'Aspirin' })).toBeInTheDocument()
    expect(screen.getByText('2-acetyloxybenzoic acid')).toBeInTheDocument()
    expect(screen.getByLabelText('Molecular weight')).toHaveTextContent('MW 180.16')
  })

  it('does not duplicate IUPAC names that match the displayed title', async () => {
    vi.mocked(getPubChemDataBySmiles).mockResolvedValue({
      cid: 123,
      title: 'Ethanol',
      iupacName: ' ethanol ',
      molecularWeight: 46.07,
    })

    render(<MoleculeCard conformer={{ ...conformer, name: 'Fallback' }} />)

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Ethanol' })).toBeInTheDocument())
    expect(screen.getAllByText('Ethanol')).toHaveLength(1)
    expect(screen.queryByText(' ethanol ')).not.toBeInTheDocument()
  })

  it('keeps rendering fallback card data when PubChem has no result', async () => {
    vi.mocked(getPubChemDataBySmiles).mockResolvedValue(null)

    render(<MoleculeCard conformer={{ ...conformer, molecularWeight: 12.01 }} />)

    await waitFor(() => expect(getPubChemDataBySmiles).toHaveBeenCalledWith(conformer.smiles))
    expect(screen.getByRole('heading', { name: 'Test molecule' })).toBeInTheDocument()
    expect(screen.getByLabelText('Molecule artwork')).toBeInTheDocument()
    expect(screen.getByLabelText('Molecular weight')).toHaveTextContent('MW 12.01')
  })
})
