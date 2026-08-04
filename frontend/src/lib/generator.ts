import { createGenerator, seed } from 'mlconfgen'
import * as ort from 'onnxruntime-web/wasm'
import { loadRDKit, smilesFromMolBlock } from './rdkit'
import type {
  CoordinateTriple,
  GeneratedConformer,
  GenerateRequest,
  GenerateResponse,
} from '../types/molecule'

export type GeneratorRuntimeStatus =
  | { status: 'available' }
  | { status: 'unavailable'; reason: 'model-assets-unavailable' | 'browser-runtime-unavailable' }

type Generator = Awaited<ReturnType<typeof createGenerator>>

export class GeneratorError extends Error {
  constructor(readonly category: 'invalid-input' | 'runtime-failed') {
    super(category === 'invalid-input' ? 'Invalid generation request' : 'Local generation failed')
  }
}

const modelUrl = (file: string) => `${import.meta.env.BASE_URL}models/${file}`
const modelUrls = [
  modelUrl('egnn_chembl_15_39.onnx'),
  modelUrl('adj_mat_seer_chembl_15_39.onnx'),
]

ort.env.wasm.wasmPaths = {
  wasm: `${import.meta.env.BASE_URL}ort/ort-wasm-simd-threaded.wasm`,
}
ort.env.wasm.numThreads = 1

class GeneratorUnavailableError extends Error {
  constructor(readonly reason: Extract<GeneratorRuntimeStatus, { status: 'unavailable' }>['reason']) {
    super('Local generator unavailable')
  }
}

let generatorPromise: Promise<Generator> | undefined

async function requireModelAssets(): Promise<void> {
  const responses = await Promise.all(modelUrls.map((url) => fetch(url, { method: 'HEAD' })))
  if (responses.some((response) => !response.ok)) {
    throw new GeneratorUnavailableError('model-assets-unavailable')
  }
}

function loadGenerator(): Promise<Generator> {
  if (generatorPromise) return generatorPromise

  generatorPromise = requireModelAssets()
    .then(() => {
      seed()
      return createGenerator({
        ort,
        rdkitLoader: loadRDKit,
        egnnOnnx: modelUrls[0],
        adjMatSeerOnnx: modelUrls[1],
        diffusionSteps: 100,
      })
    })
    .catch((error: unknown) => {
      generatorPromise = undefined
      console.error('Local generator initialization failed', error)
      if (error instanceof GeneratorUnavailableError) throw error
      throw new GeneratorUnavailableError('browser-runtime-unavailable')
    })

  return generatorPromise
}

export async function getGeneratorRuntimeStatus(): Promise<GeneratorRuntimeStatus> {
  try {
    await loadGenerator()
    return { status: 'available' }
  } catch (error) {
    return {
      status: 'unavailable',
      reason: error instanceof GeneratorUnavailableError
        ? error.reason
        : 'browser-runtime-unavailable',
    }
  }
}

function validTriple(value: unknown): value is CoordinateTriple {
  return Array.isArray(value) && value.length === 3 && value.every((entry) =>
    typeof entry === 'number' && Number.isFinite(entry),
  )
}

function validateRequest(request: GenerateRequest): void {
  const hasContext = request.referenceContext !== undefined || request.nAtoms !== undefined
  const hasConformer = request.referenceConformer !== undefined
  if (hasContext === hasConformer || !Number.isInteger(request.nSamples) || request.nSamples <= 0) {
    throw new GeneratorError('invalid-input')
  }
  if (hasContext && (!validTriple(request.referenceContext) || request.nAtoms === undefined || !Number.isInteger(request.nAtoms) || request.nAtoms <= 0)) {
    throw new GeneratorError('invalid-input')
  }
  if (hasConformer && (!request.referenceConformer?.positions.length || !request.referenceConformer.positions.every(validTriple))) {
    throw new GeneratorError('invalid-input')
  }
  if (request.variance !== undefined && (!Number.isFinite(request.variance) || request.variance < 0)) {
    throw new GeneratorError('invalid-input')
  }
  if (request.diffusionSteps !== undefined && (!Number.isInteger(request.diffusionSteps) || request.diffusionSteps <= 0)) {
    throw new GeneratorError('invalid-input')
  }
}

async function normalizeConformer(molecule: {
  toMolBlock(): string
  positions?: ArrayLike<number>
  smiles?: string
}, index: number): Promise<GeneratedConformer> {
  const molBlock = molecule.toMolBlock()
  if (!molBlock?.trim()) throw new GeneratorError('runtime-failed')
  const smiles = molecule.smiles?.trim() || await smilesFromMolBlock(molBlock)
  const values = molecule.positions && Array.from(molecule.positions)
  const coordinates = values && values.length % 3 === 0 && values.every(Number.isFinite)
    ? Array.from({ length: values.length / 3 }, (_, position) => [
      values[position * 3], values[position * 3 + 1], values[position * 3 + 2],
    ] as CoordinateTriple)
    : undefined
  return {
    id: `generated-${index + 1}`,
    molBlock,
    ...(coordinates ? { coordinates } : {}),
    ...(smiles ? { smiles } : {}),
  }
}

export async function generateConformers(request: GenerateRequest): Promise<GenerateResponse> {
  validateRequest(request)
  try {
    const runtime = await loadGenerator()
    const molecules = await runtime.generateConformers({
      ...(request.referenceContext
        ? { referenceContext: request.referenceContext, nAtoms: request.nAtoms! }
        : { referenceConformer: request.referenceConformer }),
      nSamples: request.nSamples,
      ...(request.variance === undefined ? {} : { variance: request.variance }),
      ...(request.diffusionSteps === undefined ? {} : { diffusionSteps: request.diffusionSteps }),
      filterInvalid: true,
    })
    const conformers = await Promise.all(molecules.map(normalizeConformer))
    return {
      conformers,
      generationSource: 'mlconfgen-js',
      numRequested: request.nSamples,
      numGenerated: conformers.length,
      parameters: {
        filterInvalid: true,
        ...(request.variance === undefined ? {} : { variance: request.variance }),
        ...(request.diffusionSteps === undefined ? {} : { diffusionSteps: request.diffusionSteps }),
      },
    }
  } catch (error) {
    if (error instanceof GeneratorUnavailableError || error instanceof GeneratorError) throw error
    console.error('Local conformer generation failed', error)
    throw new GeneratorError('runtime-failed')
  }
}

export function resetGeneratorForTests(): void {
  generatorPromise = undefined
}
