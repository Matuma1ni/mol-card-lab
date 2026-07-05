/**
 * Molecule data structures.
 */

export interface Coordinates {
  x: number
  y: number
  z: number
}

export interface GenerateRequest {
  referenceMolPath?: string
  nSamples?: number
  variance?: number
}

export interface GenerationMetadata {
  reference_source: 'mol_file' | 'demo_smiles'
  reference_3d_geometry: 'provided' | 'embedded'
  reference_path?: string
  reference_smiles?: string
  num_requested: number
  num_generated: number
  num_failed: number
  variance?: number
  diffusion_steps?: number
  generated_at?: string
  warnings: string[]
  warning_count: number
}

export interface Conformer {
  id: string
  smiles: string
  molBlock: string
  coordinates: [number, number, number][]
  num_atoms: number
  metadata?: Partial<GenerationMetadata> & Record<string, unknown>
}

export interface ConformerSet {
  conformers: Conformer[]
  count: number
  metadata?: GenerationMetadata
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
