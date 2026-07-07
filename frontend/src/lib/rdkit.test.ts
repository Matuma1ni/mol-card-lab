import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadRDKit, renderSmilesToSvg, resetRDKitForTests } from './rdkit'

afterEach(() => {
  resetRDKitForTests()
  document.head.innerHTML = ''
  vi.restoreAllMocks()
})

function finishScriptLoad() {
  const script = document.head.querySelector<HTMLScriptElement>('script[data-rdkit-loader]')
  expect(script).not.toBeNull()
  script?.dispatchEvent(new Event('load'))
  return script
}

describe('loadRDKit', () => {
  it('shares one script and initialization between concurrent callers', async () => {
    const module = { get_mol: vi.fn() }
    const initialize = vi.fn().mockResolvedValue(module)
    window.initRDKitModule = initialize

    const first = loadRDKit()
    const second = loadRDKit()
    expect(document.head.querySelectorAll('script[data-rdkit-loader]')).toHaveLength(1)
    const script = finishScriptLoad()

    await expect(first).resolves.toBe(module)
    await expect(second).resolves.toBe(module)
    expect(initialize).toHaveBeenCalledOnce()
    expect(script?.src).toContain('/rdkit/RDKit_minimal.js')
    const options = initialize.mock.calls[0][0]
    expect(options.locateFile('RDKit_minimal.wasm')).toContain('/rdkit/RDKit_minimal.wasm')
  })

  it('removes a failed script and allows retry', async () => {
    const first = loadRDKit()
    const failedScript = document.head.querySelector<HTMLScriptElement>('script[data-rdkit-loader]')
    failedScript?.dispatchEvent(new Event('error'))
    await expect(first).rejects.toThrow('failed to load')
    expect(failedScript?.isConnected).toBe(false)

    const module = { get_mol: vi.fn() }
    window.initRDKitModule = vi.fn().mockResolvedValue(module)
    const retry = loadRDKit()
    finishScriptLoad()
    await expect(retry).resolves.toBe(module)
  })

  it('rejects a missing initializer and allows retry', async () => {
    const first = loadRDKit()
    finishScriptLoad()
    await expect(first).rejects.toThrow('initializer')

    const module = { get_mol: vi.fn() }
    window.initRDKitModule = vi.fn().mockResolvedValue(module)
    const retry = loadRDKit()
    finishScriptLoad()
    await expect(retry).resolves.toBe(module)
  })
})

describe('renderSmilesToSvg', () => {
  it('returns SVG and deletes the molecule', async () => {
    const molecule = { get_svg: vi.fn(() => '<svg />'), delete: vi.fn() }
    window.initRDKitModule = vi.fn().mockResolvedValue({ get_mol: () => molecule })
    const result = renderSmilesToSvg('CCO')
    finishScriptLoad()
    await expect(result).resolves.toEqual({ status: 'success', svg: '<svg />' })
    expect(molecule.delete).toHaveBeenCalledOnce()
  })

  it('returns an invalid result for an unparseable SMILES', async () => {
    window.initRDKitModule = vi.fn().mockResolvedValue({ get_mol: () => null })
    const result = renderSmilesToSvg('invalid')
    finishScriptLoad()
    await expect(result).resolves.toEqual({ status: 'invalid' })
  })

  it('maps a parser exception to an invalid result', async () => {
    window.initRDKitModule = vi.fn().mockResolvedValue({
      get_mol: () => {
        throw new Error('parse details')
      },
    })
    const result = renderSmilesToSvg('invalid')
    finishScriptLoad()
    await expect(result).resolves.toEqual({ status: 'invalid' })
  })

  it('deletes the molecule when SVG generation throws', async () => {
    const molecule = {
      get_svg: vi.fn(() => {
        throw new Error('depiction failed')
      }),
      delete: vi.fn(),
    }
    window.initRDKitModule = vi.fn().mockResolvedValue({ get_mol: () => molecule })
    const result = renderSmilesToSvg('CCO')
    finishScriptLoad()
    await expect(result).rejects.toThrow('depiction failed')
    expect(molecule.delete).toHaveBeenCalledOnce()
  })
})
