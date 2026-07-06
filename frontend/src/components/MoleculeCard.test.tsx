import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import MoleculeCard from './MoleculeCard'

vi.mock('./Molecule2DPreview', () => ({
  default: ({ smiles }: { smiles: string }) => <div aria-label="Molecule artwork">Artwork for {smiles}</div>,
}))

const conformer = {
  id: 'test',
  name: 'Test molecule',
  smiles: 'CC(=O)Oc1ccccc1C(=O)O'.repeat(4),
  molBlock: '',
  coordinates: [] as [number, number, number][],
  num_atoms: 0,
}

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
    expect(card).not.toHaveAttribute('role', 'button')
    expect(screen.queryByText(/3D viewer pending/i)).not.toBeInTheDocument()
  })
})
