import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MoleculeCard from './MoleculeCard'
import { getPubChemDataBySmiles } from '../lib/pubchem'

vi.mock('./Molecule2DPreview', () => ({
  default: ({ smiles }: { smiles: string }) => <div aria-label="Molecule artwork">Artwork for {smiles}</div>,
}))

vi.mock('../lib/pubchem', () => ({
  getPubChemDataBySmiles: vi.fn(),
}))

const smiles = 'CC(=O)Oc1ccccc1C(=O)O'.repeat(4)

beforeEach(() => {
  vi.mocked(getPubChemDataBySmiles).mockReset()
  vi.mocked(getPubChemDataBySmiles).mockResolvedValue(null)
})

describe('MoleculeCard', () => {
  it('renders an inside-card title before 2D artwork and a labeled SMILES footer', () => {
    render(<MoleculeCard smiles={smiles} />)
    const card = screen.getByRole('article')
    const title = screen.getByRole('heading', { name: 'Molecule' })
    const artwork = screen.getByLabelText('Molecule artwork')
    expect(card).toContainElement(title)
    expect(card).toContainElement(artwork)
    expect(title.compareDocumentPosition(artwork) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByText('SMILES')).toBeInTheDocument()
    expect(screen.getByText(smiles)).toBeInTheDocument()
    expect(card).not.toHaveAttribute('role', 'button')
    expect(screen.queryByText(/3D viewer pending/i)).not.toBeInTheDocument()
  })

  it('uses PubChem name and molecular weight when enrichment is available', async () => {
    vi.mocked(getPubChemDataBySmiles).mockResolvedValue({
      cid: 2244,
      title: 'Aspirin',
      iupacName: '2-acetyloxybenzoic acid',
      molecularWeight: 180.16,
    })

    render(<MoleculeCard smiles={smiles} />)

    expect(await screen.findByRole('heading', { name: 'Aspirin' })).toBeInTheDocument()
    expect(screen.getByText('2-acetyloxybenzoic acid')).toBeInTheDocument()
    expect(screen.getByLabelText('Molecular weight')).toHaveTextContent('MW 180.16')
  })
})
