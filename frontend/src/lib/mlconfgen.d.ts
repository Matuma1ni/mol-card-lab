declare module 'mlconfgen' {
  export interface RuntimeMolecule {
    toMolBlock(): string
    positions?: ArrayLike<number>
    smiles?: string
  }

  export interface GeneratorRuntime {
    generateConformers(request: {
      referenceContext?: [number, number, number]
      nAtoms?: number
      referenceConformer?: { positions: [number, number, number][] }
      nSamples: number
      variance?: number
      diffusionSteps?: number
      filterInvalid: boolean
    }): Promise<RuntimeMolecule[]>
  }

  export function createGenerator(options: {
    ort: unknown
    rdkitLoader?: () => Promise<unknown>
    egnnOnnx: string
    adjMatSeerOnnx: string
    diffusionSteps: number
  }): Promise<GeneratorRuntime>

  export function seed(value?: number | null): void
}
