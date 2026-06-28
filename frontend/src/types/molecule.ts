/**
 * Molecule data structures.
 */

export interface Coordinates {
  x: number
  y: number
  z: number
}

export interface Conformer {
  id: string
  smiles: string
  molBlock: string
  coordinates: [number, number, number][]
  num_atoms: number
  metadata?: Record<string, unknown>
}

export interface ConformerSet {
  conformers: Conformer[]
  count: number
  metadata?: Record<string, unknown>
}

// TypeScript utility types for common operations
export type ConformerID = string

export interface MoleculeCardProps {
  conformer: Conformer
  onSelect?: (id: ConformerID) => void
}

export interface MoleculeViewer3DProps {
  molBlock: string
  smiles: string
}
