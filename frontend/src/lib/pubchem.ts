export type PubChemEnrichment = {
  cid: number
  title?: string
  iupacName?: string
  molecularWeight?: number
}

type PubChemCidResponse = {
  IdentifierList?: {
    CID?: unknown[]
  }
}

type PubChemPropertiesResponse = {
  PropertyTable?: {
    Properties?: unknown[]
  }
}

type PubChemPropertyRecord = {
  CID?: unknown
  MolecularWeight?: unknown
  IUPACName?: unknown
  Title?: unknown
}

const PUBCHEM_BASE_URL = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug'
const pubChemCache = new Map<string, Promise<PubChemEnrichment | null>>()

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const response = await fetch(url)
  if (!response.ok) return null
  return response.json() as Promise<T>
}

async function fetchPubChemDataBySmiles(
  smiles: string,
): Promise<PubChemEnrichment | null> {
  const encodedSmiles = encodeURIComponent(smiles)
  const cidResponse = await fetchJson<PubChemCidResponse>(
    `${PUBCHEM_BASE_URL}/compound/smiles/${encodedSmiles}/cids/JSON`,
  )
  const cid = asNumber(cidResponse?.IdentifierList?.CID?.[0])
  if (cid === undefined) return null

  const propertiesResponse = await fetchJson<PubChemPropertiesResponse>(
    `${PUBCHEM_BASE_URL}/compound/cid/${cid}/property/MolecularWeight,IUPACName,Title/JSON`,
  )
  const propertyRecord = propertiesResponse?.PropertyTable?.Properties?.[0]
  if (!isObject(propertyRecord)) return null

  const properties = propertyRecord as PubChemPropertyRecord
  const recordCid = asNumber(properties.CID) ?? cid

  return {
    cid: recordCid,
    title: asString(properties.Title),
    iupacName: asString(properties.IUPACName),
    molecularWeight: asNumber(properties.MolecularWeight),
  }
}

export function getPubChemDataBySmiles(
  smiles: string,
): Promise<PubChemEnrichment | null> {
  const cacheKey = smiles.trim()
  if (!cacheKey) return Promise.resolve(null)

  const cached = pubChemCache.get(cacheKey)
  if (cached) return cached

  const request = fetchPubChemDataBySmiles(cacheKey).catch(() => null)
  pubChemCache.set(cacheKey, request)
  return request
}

export function clearPubChemCacheForTests(): void {
  pubChemCache.clear()
}
