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
  name: string
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

export interface SmilesExample {
  id: string
  smiles: string
  referenceContext: [number, number, number]
  nAtoms: number
}

export interface SmilesExampleSet {
  molecules: SmilesExample[]
  count: number
  metadata?: Record<string, unknown>
}

export interface MoleculeCardProps {
  smiles?: string
  molBlock?: string
  className?: string
  onLoadingChange?: (loading: boolean) => void
}

export interface MoleculeViewer3DProps {
  molBlock: string
  smiles: string
}

export type CoordinateTriple = [number, number, number]

export interface GenerateRequest {
  referenceContext?: [number, number, number]
  nAtoms?: number
  referenceConformer?: { positions: CoordinateTriple[] }
  nSamples: number
  variance?: number
  diffusionSteps?: number
}

export interface GeneratedConformer {
  id: string
  molBlock: string
  smiles?: string
  coordinates?: CoordinateTriple[]
}

export interface GenerateResponse {
  conformers: GeneratedConformer[]
  generationSource: 'mlconfgen-js'
  numRequested: number
  numGenerated: number
  parameters: {
    filterInvalid: true
    variance?: number
    diffusionSteps?: number
  }
}
