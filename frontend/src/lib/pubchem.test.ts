import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearPubChemCacheForTests, getPubChemDataBySmiles } from './pubchem'

const fetchMock = vi.fn()

beforeEach(() => {
  clearPubChemCacheForTests()
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: () => Promise.resolve(body),
  } as Response
}

describe('getPubChemDataBySmiles', () => {
  it('resolves a CID and normalizes PubChem properties', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ IdentifierList: { CID: [2244] } }))
      .mockResolvedValueOnce(
        jsonResponse({
          PropertyTable: {
            Properties: [
              {
                CID: 2244,
                MolecularWeight: '180.16',
                IUPACName: '2-acetyloxybenzoic acid',
                Title: 'Aspirin',
              },
            ],
          },
        }),
      )

    await expect(
      getPubChemDataBySmiles('CC(=O)OC1=CC=CC=C1C(=O)O'),
    ).resolves.toEqual({
      cid: 2244,
      title: 'Aspirin',
      iupacName: '2-acetyloxybenzoic acid',
      molecularWeight: 180.16,
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/CC(%3DO)OC1%3DCC%3DCC%3DC1C(%3DO)O/cids/JSON',
    )
  })

  it('returns null for lookup failures and caches by trimmed SMILES', async () => {
    fetchMock.mockRejectedValue(new Error('network down'))

    await expect(getPubChemDataBySmiles(' CCO ')).resolves.toBeNull()
    await expect(getPubChemDataBySmiles('CCO')).resolves.toBeNull()

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
