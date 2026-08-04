import { afterEach, describe, expect, it, vi } from 'vitest'

const { createGeneratorMock, seedMock } = vi.hoisted(() => ({
  createGeneratorMock: vi.fn(),
  seedMock: vi.fn(),
}))

const { loadRDKitMock, smilesFromMolBlockMock } = vi.hoisted(() => ({
  loadRDKitMock: vi.fn(),
  smilesFromMolBlockMock: vi.fn(),
}))

vi.mock('mlconfgen', () => ({
  createGenerator: createGeneratorMock,
  seed: seedMock,
}))

vi.mock('onnxruntime-web/wasm', () => ({
  InferenceSession: {},
  Tensor: class {},
  env: { wasm: {} },
}))

vi.mock('./rdkit', () => ({
  loadRDKit: loadRDKitMock,
  smilesFromMolBlock: smilesFromMolBlockMock,
}))

import {
  generateConformers,
  getGeneratorRuntimeStatus,
  resetGeneratorForTests,
} from './generator'

afterEach(() => {
  resetGeneratorForTests()
  vi.restoreAllMocks()
})

function modelAssetsAreAvailable() {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
}

describe('getGeneratorRuntimeStatus', () => {
  it('shares initialization and passes Vite-resolved model URLs to the explicit browser runtime', async () => {
    modelAssetsAreAvailable()
    createGeneratorMock.mockResolvedValue({})

    const first = getGeneratorRuntimeStatus()
    const second = getGeneratorRuntimeStatus()

    await expect(first).resolves.toEqual({ status: 'available' })
    await expect(second).resolves.toEqual({ status: 'available' })
    expect(createGeneratorMock).toHaveBeenCalledOnce()
    expect(seedMock).toHaveBeenCalledWith()
    expect(createGeneratorMock).toHaveBeenCalledWith(expect.objectContaining({
      egnnOnnx: '/models/egnn_chembl_15_39.onnx',
      adjMatSeerOnnx: '/models/adj_mat_seer_chembl_15_39.onnx',
      diffusionSteps: 100,
      ort: expect.any(Object),
      rdkitLoader: loadRDKitMock,
    }))
  })

  it('clears a failed runtime initialization so a local retry makes a new attempt', async () => {
    modelAssetsAreAvailable()
    createGeneratorMock.mockRejectedValueOnce(new Error('runtime details')).mockResolvedValueOnce({})

    await expect(getGeneratorRuntimeStatus()).resolves.toEqual({
      status: 'unavailable',
      reason: 'browser-runtime-unavailable',
    })
    await expect(getGeneratorRuntimeStatus()).resolves.toEqual({ status: 'available' })
    expect(createGeneratorMock).toHaveBeenCalledTimes(2)
  })

  it('maps missing local model assets to a sanitized unavailable category', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

    await expect(getGeneratorRuntimeStatus()).resolves.toEqual({
      status: 'unavailable',
      reason: 'model-assets-unavailable',
    })
    expect(createGeneratorMock).not.toHaveBeenCalled()
  })
})

describe('generateConformers', () => {
  it('forwards a validated context request and normalizes MolBlock-first results', async () => {
    modelAssetsAreAvailable()
    const runtime = {
      generateConformers: vi.fn().mockResolvedValue([
        {
          toMolBlock: () => 'MLConfGen\n  test\n\n  1  0  0  0  0  0  0  0  0  0999 V2000\nM  END',
          positions: Float32Array.from([1, 2, 3]),
          smiles: 'O',
        },
      ]),
    }
    createGeneratorMock.mockResolvedValue(runtime)

    await expect(generateConformers({
      referenceContext: [89.87, 210.78, 217.78],
      nAtoms: 1,
      nSamples: 3,
      variance: 1,
      diffusionSteps: 50,
    })).resolves.toEqual({
      conformers: [{
        id: 'generated-1',
        molBlock: expect.stringContaining('MLConfGen'),
        coordinates: [[1, 2, 3]],
        smiles: 'O',
      }],
      generationSource: 'mlconfgen-js',
      numGenerated: 1,
      numRequested: 3,
      parameters: { diffusionSteps: 50, filterInvalid: true, variance: 1 },
    })
    expect(runtime.generateConformers).toHaveBeenCalledWith({
      referenceContext: [89.87, 210.78, 217.78],
      nAtoms: 1,
      nSamples: 3,
      variance: 1,
      diffusionSteps: 50,
      filterInvalid: true,
    })
  })

  it('accepts positions-only requests and treats filtered or empty results as success', async () => {
    modelAssetsAreAvailable()
    const runtime = { generateConformers: vi.fn().mockResolvedValue([]) }
    createGeneratorMock.mockResolvedValue(runtime)

    await expect(generateConformers({
      referenceConformer: { positions: [[0, 0, 0], [1, 1, 1]] },
      nSamples: 3,
    })).resolves.toMatchObject({ numRequested: 3, numGenerated: 0, conformers: [] })
    expect(runtime.generateConformers).toHaveBeenCalledWith({
      referenceConformer: { positions: [[0, 0, 0], [1, 1, 1]] },
      nSamples: 3,
      filterInvalid: true,
    })
  })

  it('derives a generated SMILES from the authoritative MolBlock', async () => {
    modelAssetsAreAvailable()
    const molBlock = 'MLConfGen\n\n\n  1  0  0  0  0  0  0  0  0  0999 V2000\nM  END'
    smilesFromMolBlockMock.mockResolvedValue('C')
    createGeneratorMock.mockResolvedValue({
      generateConformers: vi.fn().mockResolvedValue([{ toMolBlock: () => molBlock }]),
    })

    await expect(generateConformers({
      referenceContext: [1, 2, 3], nAtoms: 25, nSamples: 1,
    })).resolves.toMatchObject({ conformers: [{ molBlock, smiles: 'C' }] })
    expect(smilesFromMolBlockMock).toHaveBeenCalledWith(molBlock)
  })

  it('rejects malformed or mixed input before calling the runtime', async () => {
    modelAssetsAreAvailable()
    const runtime = { generateConformers: vi.fn() }
    createGeneratorMock.mockResolvedValue(runtime)

    await expect(generateConformers({
      referenceContext: [1, 2, Number.NaN], nAtoms: 1, nSamples: 3,
    })).rejects.toMatchObject({ category: 'invalid-input' })
    await expect(generateConformers({
      referenceContext: [1, 2, 3], nAtoms: 1, nSamples: 3,
      referenceConformer: { positions: [[0, 0, 0]] },
    })).rejects.toMatchObject({ category: 'invalid-input' })
    expect(runtime.generateConformers).not.toHaveBeenCalled()
  })

  it('rejects empty MolBlocks through a sanitized runtime category', async () => {
    modelAssetsAreAvailable()
    createGeneratorMock.mockResolvedValue({
      generateConformers: vi.fn().mockResolvedValue([{ toMolBlock: () => '  ' }]),
    })

    await expect(generateConformers({
      referenceContext: [1, 2, 3], nAtoms: 1, nSamples: 1,
    })).rejects.toMatchObject({ category: 'runtime-failed' })
  })
})
